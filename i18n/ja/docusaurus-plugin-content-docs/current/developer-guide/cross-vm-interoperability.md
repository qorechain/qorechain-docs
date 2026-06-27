---
slug: /developer-guide/cross-vm-interoperability
title: クロス VM 相互運用性
sidebar_label: クロス VM 相互運用性
sidebar_position: 5
---

# クロス VM 相互運用性

QoreChain の**トリプル VM アーキテクチャ**（EVM、CosmWasm、SVM）により、いずれかの仮想マシン上のスマートコントラクトが、他のいずれの VM 上のコントラクトとも通信できます。`x/crossvm` モジュールは、同期および非同期の両方のメッセージングパスを提供します。

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
| **同期**  | EVM から CosmWasm | 同一トランザクション | `0x0000...0901` のプリコンパイル   |
| **非同期** | CosmWasm から EVM | 次のブロック       | EndBlocker 経由の `MsgCrossVMCall` |
| **非同期** | SVM から任意の VM   | 次のブロック       | EndBlocker 経由の `MsgCrossVMCall` |
| **非同期** | 任意から SVM へ   | 次のブロック       | EndBlocker 経由の `MsgCrossVMCall` |

---

## 同期パス（EVM から CosmWasm）

同期パスは、アドレス `0x0000000000000000000000000000000000000901` にある EVM **プリコンパイル**を使用します。これにより、Solidity コントラクトは CosmWasm コントラクトを呼び出し、同一トランザクション内でレスポンスを受け取ることができます。

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

プリコンパイルは CosmWasm コントラクトを即座に実行し、結果を返します。ガスコスト: **基本 50,000 + 実行コスト**。

---

## 非同期パス

その他すべてのクロス VM 方向は、非同期メッセージキューを使用します。メッセージは 1 つのブロックで送信され、次のブロックの **EndBlocker** で処理されます。

### CLI

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## メッセージのライフサイクル

すべてのクロス VM メッセージは、定義された一連の状態を遷移します。

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| 状態         | 説明                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | メッセージがキューに受け入れられた                           |
| **Pending**   | 次の EndBlocker パスでの実行を待機中            |
| **Executed**  | ターゲットコントラクトが正常に呼び出され、レスポンスが記録された    |
| **Failed**    | ターゲットコントラクトの実行がリバートされ、エラーが記録された        |
| **Timed Out** | メッセージが実行されずに `queue_timeout_blocks` を超過した |

---

## パラメータ

| パラメータ              | 値        | 説明                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
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

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

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

**アトミック性:** 同期呼び出し（プリコンパイル経由の EVM から CosmWasm）はアトミックです。いずれかの側がリバートすると、トランザクション全体がリバートされます。非同期呼び出しはブロックをまたいでアトミックでは**ありません**。`Failed` および `Timed Out` の状態を適切に処理できるようコントラクトを設計してください。

**順序付け:** キュー内のメッセージは、各 EndBlocker パス内で FIFO で処理されます。異なるソース VM をまたぐ順序付けは保証されません。

**ペイロードのエンコーディング:** ペイロード形式はターゲット VM に依存します。

* **EVM ターゲット:** ABI エンコードされた関数呼び出し
* **CosmWasm ターゲット:** JSON エンコードされた実行メッセージ
* **SVM ターゲット:** 16 進エンコードされた BPF 命令データ

---

## 次のステップ

* [EVM プリコンパイル](/developer-guide/evm-precompiles) — 同期 CrossVM プリコンパイルとその他のカスタムプリコンパイル
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上での Solidity 開発
* [CosmWasm 開発](/developer-guide/cosmwasm-development) — Rust/Wasm コントラクト開発
* [SVM 開発](/developer-guide/svm-development) — BPF プログラムのデプロイ
