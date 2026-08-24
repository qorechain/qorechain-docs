---
slug: /api-reference/websocket-events
title: WebSocket イベント
sidebar_label: WebSocket イベント
sidebar_position: 5
---

# WebSocket イベント

QoreChainは、2つのWebSocketインターフェース、すなわちEVM互換WebSocketとQoreChain Consensus Engine RPC WebSocketを通じてリアルタイムのイベントストリーミングを提供します。

:::note
どちらのWebSocketインターフェースも、**`qorechain-vladi`** メインネット(チェーンバージョン **v3.1.92** で稼働中)と **`qorechain-diana`** テストネットの両方で利用できます。以下のローカルエンドポイントは、自分で運用するノードを前提としています。リモートアクセスの場合は、ご利用のプロバイダーのメインネットまたはテストネットのホストに置き換えてください。
:::

---

## EVM WebSocket

**エンドポイント:** `ws://localhost:8546`

EVM WebSocketは、Ethereumツールと互換性のあるリアルタイムイベントストリーミング用の標準`eth_subscribe`メソッドをサポートします。

### サブスクリプションの種類

| サブスクリプション        | 説明                                              |
| ------------------------- | ------------------------------------------------- |
| `newHeads`                | 新しいブロックが追加されるたびにヘッダーを発行     |
| `logs`                    | オプションのフィルタに一致するログを発行           |
| `newPendingTransactions`  | メモリプールに入るトランザクションハッシュを発行   |
| `syncing`                 | 同期状態の更新を発行                               |

### 新しいブロックへのサブスクライブ

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### フィルタ付きでログにサブスクライブ

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": [
    "logs",
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
    }
  ],
  "id": 2
}
```

### サブスクリプション解除

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## QoreChain RPC WebSocket

**エンドポイント:** `ws://localhost:26657/websocket`

RPC WebSocketはQoreChain Consensus Engineのイベントサブスクリプションシステムを使用します。クライアントは、イベントの種類と属性でフィルタするクエリ文字列を使ってサブスクライブします。

### すべての新しいブロックへのサブスクライブ

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 1
}
```

### すべてのトランザクションへのサブスクライブ

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx'"
  },
  "id": 2
}
```

### モジュール固有イベントへのサブスクライブ

イベントタイプでフィルタすることで、特定のモジュールからのイベントのみを受信できます。

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND fraud_alert.severity EXISTS"
  },
  "id": 3
}
```

### サブスクリプション解除

```json
{
  "jsonrpc": "2.0",
  "method": "unsubscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 4
}
```

---

## モジュールイベントリファレンス

### PQCモジュール

| イベントタイプ              | 主な属性                                              | 説明                                             |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| `pqc_hybrid_verify`         | `address`、`algorithm`、`result`(pass/fail)、`mode`    | ハイブリッド署名の検証ごとに発行                  |
| `pqc_hybrid_auto_register`  | `address`、`algorithm`、`pubkey_hash`                   | PQC鍵が自動登録された際に発行                     |

### AIモジュール

| イベントタイプ     | 主な属性                                                              | 説明                                              |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| `fraud_alert`       | `severity`(low/medium/high/critical)、`address`、`reason`、`score`     | トランザクションで不正が検出された際に発行         |
| `circuit_breaker`   | `module`、`action`(tripped/reset)、`threshold`、`value`                | AIサーキットブレーカーの状態が変化した際に発行     |

### Bridgeモジュール

| イベントタイプ           | 主な属性                                                          | 説明                                                     |
| -------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `deposit_completed`        | `chain_id`、`sender`、`recipient`、`amount`、`asset`、`tx_hash`      | インバウンドのブリッジ入金が確認された際に発行             |
| `withdrawal_completed`     | `chain_id`、`sender`、`recipient`、`amount`、`asset`、`tx_hash`      | アウトバウンドのブリッジ出金が確認された際に発行           |

### Cross-VMモジュール

| イベントタイプ       | 主な属性                                                             | 説明                                                    |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `crossvm_request`      | `message_id`、`source_vm`、`target_vm`、`sender`、`payload_hash`         | クロスVM呼び出しが開始された際に発行                       |
| `crossvm_response`     | `message_id`、`source_vm`、`target_vm`、`success`、`gas_used`            | クロスVM呼び出しが完了した際に発行                          |
| `crossvm_timeout`      | `message_id`、`source_vm`、`target_vm`、`queued_at_height`               | クロスVMメッセージがキューのタイムアウトを超えた際に発行     |

### Multilayerモジュール

| イベントタイプ           | 主な属性                                                       | 説明                                             |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| `anchor_submitted`          | `layer_id`、`layer_type`、`anchor_hash`、`height`、`submitter`     | レイヤーのステートアンカーが送信された際に発行     |
| `layer_status_changed`      | `layer_id`、`previous_status`、`new_status`、`reason`              | レイヤーの稼働ステータスが変化した際に発行         |

### RDKモジュール

| イベントタイプ     | 主な属性                                              | 説明                                              |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `rollup_created`      | `rollup_id`、`operator`、`settlement_type`、`profile`      | 新しいロールアップが登録された際に発行             |
| `batch_submitted`     | `rollup_id`、`batch_index`、`state_root`、`tx_count`       | 決済バッチが送信された際に発行                     |
| `batch_finalized`     | `rollup_id`、`batch_index`、`finalized_at_height`          | バッチがチャレンジウィンドウを通過した際に発行     |
| `da_blob_stored`      | `rollup_id`、`blob_index`、`size_bytes`、`commitment`      | DAブロブが保存された際に発行                       |
| `da_blob_pruned`      | `rollup_id`、`blob_index`、`pruned_at_height`              | 保持期間経過後にDAブロブが削除された際に発行       |

### Burnモジュール

| イベントタイプ     | 主な属性                                                                             | 説明                                       |
| --------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| `fee_distributed`     | `total_fees`、`validator_amount`、`burn_amount`、`treasury_amount`、`staker_amount`      | 徴収された手数料が分配された際に発行         |
| `tokens_burned`       | `amount`、`channel`、`block_height`                                                       | トークンが恒久的にバーンされた際に発行       |

### xQOREモジュール

| イベントタイプ    | 主な属性                                                        | 説明                                       |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| `xqore_locked`       | `address`、`amount`、`lock_duration`、`tier`                          | QORがxQOREにロックされた際に発行             |
| `xqore_unlocked`     | `address`、`amount`、`penalty_applied`、`penalty_amount`              | xQOREがQORへとアンロックされた際に発行       |
| `pvp_rebase`         | `epoch`、`total_penalty`、`rebase_amount`、`beneficiary_count`        | PvPリベース分配の際に発行                    |

### Inflationモジュール

| イベントタイプ  | 主な属性                                                       | 説明                                    |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------- |
| `epoch_minted`     | `epoch`、`minted_amount`、`inflation_rate`、`block_height`       | 各インフレーションエポックの終了時に発行 |

### RL Consensusモジュール

PRISMのパラメータ調整とサーキットブレーカーの動作は、このモジュールを通じて発行されます。

| イベントタイプ                | 主な属性                                                          | 説明                                                        |
| -------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `rl_action_applied`              | `action_type`、`param_key`、`old_value`、`new_value`、`reward`         | PRISMエージェントがパラメータ調整を適用した際に発行             |
| `circuit_breaker_triggered`      | `reason`、`param_key`、`attempted_value`、`limit`                      | PRISMサーキットブレーカーがアクションをブロックした際に発行     |

---

## JavaScriptクライアントの例

### EVM WebSocket(ethers.js)

```javascript
import { ethers } from "ethers";

const provider = new ethers.WebSocketProvider("ws://localhost:8546");

// Subscribe to new blocks
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// Subscribe to contract events
const filter = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  topics: [ethers.id("Transfer(address,address,uint256)")],
};
provider.on(filter, (log) => {
  console.log("Transfer event:", log);
});
```

### QoreChain RPC WebSocket(ネイティブ)

```javascript
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to fraud alerts
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND fraud_alert.severity EXISTS" },
    id: 1,
  }));

  // Subscribe to rollup batch submissions
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND batch_submitted.rollup_id EXISTS" },
    id: 2,
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.result && data.result.events) {
    console.log("Event received:", data.result.events);
  }
};
```

---

## 補足

- **接続数の上限**: WebSocket接続数のデフォルトの上限は無制限です(`max-open-connections = 0`)。本番環境では`app.toml`で上限を設定してください。
- **イベントバッファ**: RPC WebSocketは、サブスクリプションごとに最大200件のイベントをバッファします。クライアントの処理が追いつかない場合、古いイベントは破棄されます。
- **再接続**: ノードの再起動やアップグレード中にWebSocket接続が中断されることがあるため、クライアントは指数バックオフによる自動再接続を実装する必要があります。
