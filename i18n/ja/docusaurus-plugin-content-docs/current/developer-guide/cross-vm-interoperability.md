---
slug: /developer-guide/cross-vm-interoperability
title: クロス VM 相互運用性
sidebar_label: クロス VM 相互運用性
sidebar_position: 5
---

# クロス VM 相互運用性

QoreChain の**トリプル VM アーキテクチャ**（EVM、QoreChain Native、SVM）は、いずれかの仮想マシン上のスマートコントラクトが、他のいずれの VM 上のコントラクトとも通信できるように設計されています。`x/crossvm` モジュールは、同一トランザクション内のパスとキューに入るパスを持つ呼び出しメッセージを提供します。

:::caution 現時点で動作するもの
クロス VM 呼び出しは、ターゲットとなるレーンが利用可能な範囲でのみ利用できます。

* `MsgCrossVMCall` は、メインネットではサーキットブレーカーによって**無効化されています**（`qorechaind query circuit disabled-list`）。テストネットでは有効です。
* 両ネットワークとも、トランザクションに対して **SVM レーンは無効**であるため、SVM 側の処理は実行できません。
* **QoreChain Native のアップロードは両ネットワークで許可制**であり、**インスタンス化はメインネットで許可制**です。メインネットには保存されたコントラクトコードがないため、メインネットには呼び出せる QoreChain Native コントラクトはまだありません。テストネットでは、ガバナンスが審査済みのコントラクトをいくつか保存しており、どのアカウントでもインスタンス化できます（[QoreChain Native 開発](/developer-guide/cosmwasm-development)を参照）。そのため、テストネットには QoreChain Native のターゲットが存在し得ます。
* 同期の **EVM プリコンパイルは有効ではありません**（下記参照）。強化版が v3.2.3 以降バイナリに含まれていますが、CrossVM プリコンパイルはどちらのネットワークでも有効化されていません。(2026 年 10 月 27 日に、テストネットのガバナンスが他の 3 つのプリコンパイル、PQC Verify、PQC Key Status、PRISM Consensus Params を有効化しました。メインネットで有効なものはありません。v3.2.4 によって、有効なプリコンパイルは変わりません。)

メインネットでは、モジュールの REST ルート（`/qorechain/crossvm/v1/...`）は公開ゲートウェイでは提供されていません（`501`）。メッセージは CLI または gRPC/ABCI クエリクライアントで読み取ってください。
:::

:::note
以下のエンドポイントはローカルノードをデフォルトとします。メインネットでは **`qorechain-vladi`** の RPC エンドポイント（Cosmos RPC **26657**、EVM JSON-RPC **8545**）を使用してください。テストネットは **`qorechain-diana`** です。
:::

---

## アーキテクチャの概要

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| パス             | 方向       | タイミング           | メカニズム                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **同期**  | EVM から QoreChain Native | 同一トランザクション | `0x0000...0901` のプリコンパイル（まだ有効ではありません。下記参照） |
| **メッセージ（デフォルト）** | 任意の VM から他の任意の VM | 同一トランザクション | `MsgCrossVMCall`。呼び出しは即座に実行され、失敗するとトランザクション全体がリバートされます |
| **メッセージ（キュー）**  | 任意の VM から他の任意の VM | 次のブロック（またはそれ以降） | `async` を指定した `MsgCrossVMCall`。メッセージはキューで待機します |

---

## 同期パス（EVM から QoreChain Native）

同期パスは、アドレス `0x0000000000000000000000000000000000000901` にある EVM **プリコンパイル**を使用します。Solidity コントラクトが QoreChain Native コントラクトを呼び出し、同一トランザクション内でレスポンスを受け取れるように設計されています。

:::warning メインネットでもテストネットでも有効ではありません
CrossVM ブリッジのプリコンパイルは、`qorechain-vladi` でも `qorechain-diana` でも**有効ではありません**。`0x…0901` への呼び出しは成功し、空のデータを返します。v3.2.3 バイナリには強化版が含まれています（`STATICCALL` を拒否し、ネストした呼び出しを呼び出しフレームのガスで計量し、EVM のリバートが QoreChain Native 側も取り消すようにジャーナルに記録し、許可リストに載った QoreChain Native ターゲットにのみ到達し、クロス VM サーキットブレーカーを尊重します）が、ガバナンスで承認されたアップグレードによって有効リストに追加されて初めて動作します。以下の例はノードがデコードするレイアウトですが、プリコンパイルが有効になるまで実行できません。[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status) を参照してください。
:::

### Solidity の例

ノードは、プリコンパイルの入力を、4 バイトのセレクターと、それに続く `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` の ABI エンコードされた引数としてデコードします(セレクターは `0x3c11078c`)。`targetVM` は、QoreChain Native コントラクトの場合は `1` です(QoreChain Native は CosmWasm ランタイムです。`0` は EVM で、強化版ブリッジはこれをターゲットとして拒否します)。`targetContract` はコントラクトの bech32 アドレスを文字列にしたもので、`payload` はコントラクトの execute メッセージを UTF-8 の JSON バイト列にしたものです。プリコンパイルは、ターゲットの生のレスポンスバイト列を返します。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

これはノードがデコードするレイアウトであり、`@qorechain/rdk` のエンコーダーが構築するレイアウトと同じです。上記のコントラクトは、[マルチ VM](/rollups/multi-vm) のスターターと一致します。プリコンパイルを通じて資金を添付することはできません(`MsgCrossVMCall` のメッセージパスは `--funds` を受け付けます)。プリコンパイルが有効ではないため(上記の警告を参照)、このサンプルは現在どちらのネットワークでも何も実行できません。有効化までに ABI が変更される可能性があります。

有効化された後は、プリコンパイルが QoreChain Native コントラクトを即座に実行して結果を返します。(`@qorechain/rdk` のヘルパー `encodeCrossVmCalldata`(0.6.0 から利用可能で、現行の 0.6.2 にも含まれます)が calldata を構築します。[マルチ VM](/rollups/multi-vm) を参照してください。)ガスコスト：**基本 50,000 + 入力 1 バイトあたり 4 + 実行コスト**。

---

## メッセージパス（`MsgCrossVMCall`）

その他のクロス VM 呼び出しには `MsgCrossVMCall` トランザクションを使用します。チェーンは送信者から送信元レーンを判断するため、メッセージにはターゲット VM、ターゲットコントラクト、ペイロード、および任意の資金のみが含まれます。デフォルトでは、呼び出しはトランザクション内で即座に実行され、ターゲットが失敗するとトランザクション全体がリバートされます。`async` フラグを指定すると、メッセージは代わりにキューに入れられ、後のブロックでモジュールのエンドブロックキュー処理によって処理されます（下記のライフサイクルを参照）。前述のとおり、このメッセージはメインネットでは無効化されています。

### CLI

`tx crossvm call` は、ターゲット VM（`evm`、`cosmwasm`、または `svm`）とターゲットコントラクトを位置引数として受け取り、ペイロードは 16 進で指定します。CLI は送信元 VM を尋ねません。チェーンが状態から呼び出し元のレーンを導出し、宣言されたフィールドは無視します（CLI はメッセージ自身の検証を通すためにプレースホルダーを埋めます）。

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

その他のフラグ：`--funds <coins>`（QoreChain Native ターゲットのみ）と、呼び出しを即時実行せずキューに入れる `--async`。`tx.json` は `tx pqc cosign` で署名してブロードキャストします（[ポスト量子署名](/developer-guide/post-quantum-signing)を参照）。手数料の下限はガス 1 単位あたり 0.1 uqor です。呼び出し元自身のレーンへの呼び出しは拒否されます（v3.2.3 以降）。

:::caution メインネットでは無効です
`MsgCrossVMCall` は、メインネットではサーキットブレーカーによって無効化されているため、現時点ではこのコマンドは成功しません。（v3.2.3 より前のリリースバイナリは、送信元 VM が空のためメッセージ自身の検証を通過しないメッセージも構築していましたが、v3.2.3 バイナリでこれは修正されています。）テストネットではこのメッセージは有効ですが、SVM レーンは無効なため SVM ターゲットには到達できません。EVM ターゲットには到達でき、QoreChain Native ターゲットも、そこでコントラクトがインスタンス化された後であれば到達できます。
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

v3.2.3 以降、失敗したキュー内の呼び出しは全体がロールバックされます。残るのはその `Failed` レコードのみで、失敗した QoreChain Native 呼び出しに添付された資金がコントラクトに移されることもなくなりました。モジュールが無効化されている間、または `MsgCrossVMCall` がサーキットブレーカーによって無効化されている間は、キューは**実行されません**。キュー内のメッセージは保留のままとなり、先にスイッチが解除されない限りタイムアウト時に失効します。

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

**アトミック性:** 同期呼び出し（プリコンパイル経由の EVM から QoreChain Native）は、いずれかの側がリバートするとトランザクション全体がリバートされるよう、アトミックになるように設計されています。現在のプリコンパイルはまだこれを保証しておらず、これが有効化されていない理由の一つです（上記参照）。非同期呼び出しはブロックをまたいでアトミックでは**ありません**。`Failed` および `Timed Out` の状態を適切に処理できるようコントラクトを設計してください。

**順序付け:** キュー内のメッセージは、各 EndBlocker パス内で FIFO で処理されます。異なるソース VM をまたぐ順序付けは保証されません。

**ペイロードのエンコーディング:** ペイロード形式はターゲット VM に依存します。

* **EVM ターゲット:** ABI エンコードされた関数呼び出し
* **QoreChain Native ターゲット:** JSON エンコードされた実行メッセージ
* **SVM ターゲット:** 16 進エンコードされた BPF 命令データ

---

## 次のステップ

* [EVM プリコンパイル](/developer-guide/evm-precompiles) — 同期 CrossVM プリコンパイルの状況と、その他の計画中のプリコンパイル
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上での Solidity 開発
* [QoreChain Native 開発](/developer-guide/cosmwasm-development) — Rust/Wasm コントラクト開発
* [SVM 開発](/developer-guide/svm-development) — BPF プログラムのデプロイ
