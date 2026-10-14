---
slug: /developer-guide/cross-vm-interoperability
title: クロス VM 相互運用性
sidebar_label: クロス VM 相互運用性
sidebar_position: 5
---

# クロス VM 相互運用性

QoreChain の**トリプル VM アーキテクチャ**（EVM、CosmWasm、SVM）は、いずれかの仮想マシン上のスマートコントラクトが、他のいずれの VM 上のコントラクトとも通信できるように設計されています。`x/crossvm` モジュールは、同一トランザクション内のパスとキューに入るパスを持つ呼び出しメッセージを提供します。

:::caution 現時点で動作するもの
クロス VM 呼び出しは、ターゲットとなるレーンが利用可能な範囲でのみ利用できます。

* `MsgCrossVMCall` は、メインネットではサーキットブレーカーによって**無効化されています**（`qorechaind query circuit disabled-list`）。テストネットでは有効です。
* 両ネットワークとも、トランザクションに対して **SVM レーンは無効**であるため、SVM 側の処理は実行できません。
* 両ネットワークとも、**CosmWasm のアップロードとインスタンス化は許可制**であり、メインネットには保存されたコントラクトコードがないため、呼び出せる CosmWasm コントラクトはまだありません。
* 同期の **EVM プリコンパイルは有効ではありません**（下記参照）。

モジュールの REST ルート（`/qorechain/crossvm/v1/...`）は公開ゲートウェイでは提供されていません。メッセージは CLI または gRPC/ABCI クエリクライアントで読み取ってください。
:::

:::note
以下のエンドポイントはローカルノードをデフォルトとします。メインネットでは **`qorechain-vladi`** の RPC エンドポイント（Cosmos RPC **26657**、EVM JSON-RPC **8545**）を使用してください。テストネットは **`qorechain-diana`** です。
:::

---

## アーキテクチャの概要

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| パス             | 方向       | タイミング           | メカニズム                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **同期**  | EVM から CosmWasm | 同一トランザクション | `0x0000...0901` のプリコンパイル（まだ有効ではありません。下記参照） |
| **メッセージ（デフォルト）** | 任意の VM から他の任意の VM | 同一トランザクション | `MsgCrossVMCall`。呼び出しは即座に実行され、失敗するとトランザクション全体がリバートされます |
| **メッセージ（キュー）**  | 任意の VM から他の任意の VM | 次のブロック（またはそれ以降） | `async` を指定した `MsgCrossVMCall`。メッセージはキューで待機します |

---

## 同期パス（EVM から CosmWasm）

同期パスは、アドレス `0x0000000000000000000000000000000000000901` にある EVM **プリコンパイル**を使用します。Solidity コントラクトが CosmWasm コントラクトを呼び出し、同一トランザクション内でレスポンスを受け取れるように設計されています。

:::warning メインネットでもテストネットでも有効ではありません
CrossVM ブリッジのプリコンパイルは、`qorechain-vladi` でも `qorechain-diana` でも**有効ではありません**。`0x…0901` への呼び出しは成功し、空のデータを返します。現在の形では有効化されません。呼び出し元コントラクトでのリバートが CosmWasm 側も取り消すこと、価値の送金が拒否されること、EVM から EVM への再入が拒否されること、クロス VM サーキットブレーカーが適用されることを実現するため、再構築中です。以下の例は想定される形のみを示しています。[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status) を参照してください。
:::

### Solidity の例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

有効化された後は、プリコンパイルが CosmWasm コントラクトを即座に実行して結果を返します。現在のノードは calldata を `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` としてデコードしますが、再構築に伴って ABI が変更される可能性があります。ガスコスト：**基本 50,000 + 入力 1 バイトあたり 4 + 実行コスト**。

---

## メッセージパス（`MsgCrossVMCall`）

その他のクロス VM 呼び出しには `MsgCrossVMCall` トランザクションを使用します。チェーンは送信者から送信元レーンを判断するため、メッセージにはターゲット VM、ターゲットコントラクト、ペイロード、および任意の資金のみが含まれます。デフォルトでは、呼び出しはトランザクション内で即座に実行され、ターゲットが失敗するとトランザクション全体がリバートされます。`async` フラグを指定すると、メッセージは代わりにキューに入れられ、後のブロックでモジュールのエンドブロックキュー処理によって処理されます（下記のライフサイクルを参照）。前述のとおり、このメッセージはメインネットでは無効化されています。

### CLI

`tx crossvm call` は、ターゲット VM（`evm`、`cosmwasm`、または `svm`）とターゲットコントラクトを位置引数として受け取り、ペイロードは 16 進で指定します。

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

その他のフラグ：`--funds <coins>`（CosmWasm ターゲットのみ）と、呼び出しを即時実行せずキューに入れる `--async`。`tx.json` は `tx pqc cosign` で署名してブロードキャストします（[ポスト量子署名](/developer-guide/post-quantum-signing)を参照）。手数料の下限はガス 1 単位あたり 0.1 uqor です。

:::caution メインネットでは無効、かつ CLI 形式には修正が必要です
`MsgCrossVMCall` は、メインネットではサーキットブレーカーによって無効化されています。現在のリリースバイナリでは、`tx crossvm call` はメッセージ自身の検証を通過しないメッセージ（送信元 VM が空のまま）を構築するため、このコマンドは参考情報としてのみ記載しています。
:::

---

## メッセージのライフサイクル

キューに入ったすべてのクロス VM メッセージは、定義された一連の状態を遷移します。

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| 状態         | 説明                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | メッセージがキューに受理された                           |
| **Pending**   | 次の EndBlocker パスでの実行を待機中            |
| **Executed**  | ターゲットコントラクトが正常に呼び出され、レスポンスが記録された    |
| **Failed**    | ターゲットコントラクトの実行がリバートされ、エラーが記録された        |
| **Timed Out** | メッセージが実行されずに `queue_timeout_blocks` を超過した |

---

## パラメータ

| パラメータ              | 値        | 説明                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | モジュールレベルのスイッチ（呼び出しメッセージ自体は、メインネットでは別途無効化されています） |
| `max_message_size`     | 65,536 バイト | メッセージあたりの最大ペイロードサイズ               |
| `max_queue_size`       | 1,000        | キュー内の保留中メッセージの最大数          |
| `queue_timeout_blocks` | 100          | 未処理メッセージがタイムアウトするまでのブロック数 |

---

## イベント

`x/crossvm` モジュールは次のイベントを発行します。

| イベント              | 属性                                                          | 説明                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | 新しいクロス VM メッセージが送信された        |
| `crossvm_response` | `message_id`, `status`, `result`                                    | メッセージが実行された（成功または失敗） |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | メッセージが実行されずに失効した     |

WebSocket 経由でイベントを購読します。

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## メッセージの照会

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **まだ提供されていません：** リリース済みのノードビルドはいずれも `qor_` JSON-RPC 名前空間を提供していないため、現時点ではすべての公開エンドポイントでこの呼び出しは `-32601`（メソッドが見つかりません）を返します。[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照してください。

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### レスポンス形式

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## 設計上の考慮事項

**アトミック性:** 同期呼び出し（プリコンパイル経由の EVM から CosmWasm）は、いずれかの側がリバートするとトランザクション全体がリバートされるよう、アトミックになるように設計されています。現在のプリコンパイルはまだこれを保証しておらず、これが有効化されていない理由の一つです（上記参照）。非同期呼び出しはブロックをまたいでアトミックでは**ありません**。`Failed` および `Timed Out` の状態を適切に処理できるようコントラクトを設計してください。

**順序付け:** キュー内のメッセージは、各 EndBlocker パス内で FIFO で処理されます。異なるソース VM をまたぐ順序付けは保証されません。

**ペイロードのエンコーディング:** ペイロード形式はターゲット VM に依存します。

* **EVM ターゲット:** ABI エンコードされた関数呼び出し
* **CosmWasm ターゲット:** JSON エンコードされた実行メッセージ
* **SVM ターゲット:** 16 進エンコードされた BPF 命令データ

---

## 次のステップ

* [EVM プリコンパイル](/developer-guide/evm-precompiles) — 同期 CrossVM プリコンパイルの状況と、その他の計画中のプリコンパイル
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上での Solidity 開発
* [CosmWasm 開発](/developer-guide/cosmwasm-development) — Rust/Wasm コントラクト開発
* [SVM 開発](/developer-guide/svm-development) — BPF プログラムのデプロイ
