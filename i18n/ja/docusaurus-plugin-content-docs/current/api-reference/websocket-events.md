---
slug: /api-reference/websocket-events
title: WebSocket イベント
sidebar_label: WebSocket イベント
sidebar_position: 5
---

# WebSocket イベント

QoreChain は、2つの WebSocket インターフェースを通じてリアルタイムのイベントストリーミングを提供します。EVM 互換の WebSocket と、QoreChain コンセンサスエンジン RPC WebSocket です。

:::note
両方の WebSocket インターフェースは、**`qorechain-vladi`** メインネット（チェーンバージョン **v3.1.80** で稼働中）と **`qorechain-diana`** テストネットで利用できます。以下のローカルエンドポイントは自分で運用するノードを前提としています。リモートアクセスの場合は、プロバイダーのメインネットまたはテストネットのホストに置き換えてください。
:::

---

## EVM WebSocket

**エンドポイント:** `ws://localhost:8546`

EVM WebSocket は、Ethereum ツールと互換性のあるリアルタイムイベントストリーミングのための標準的な `eth_subscribe` メソッドをサポートします。

### サブスクリプションタイプ

| サブスクリプション             | 説明                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | 新しいブロックが追加されるたびにヘッダーを発行します |
| `logs`                   | オプションのフィルターに一致するログを発行します           |
| `newPendingTransactions` | mempool に入るトランザクションハッシュを発行します    |
| `syncing`                | 同期ステータスの更新を発行します                        |

### 新しいブロックのサブスクライブ

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### フィルター付きでログをサブスクライブ

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

### サブスクライブ解除

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

RPC WebSocket は、QoreChain コンセンサスエンジンのイベントサブスクリプションシステムを使用します。クライアントは、タイプと属性でイベントをフィルタリングするクエリ文字列を使ってサブスクライブします。

### すべての新しいブロックをサブスクライブ

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

### すべてのトランザクションをサブスクライブ

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

### モジュール固有のイベントをサブスクライブ

イベントタイプでフィルタリングして、特定のモジュールからのイベントのみを受信します。

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

### サブスクライブ解除

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

### PQC モジュール

| イベントタイプ                 | 主な属性                                       | 説明                                   |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | 各ハイブリッド署名検証時に発行されます |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | PQC キーが自動登録されたときに発行されます     |

### AI モジュール

| イベントタイプ        | 主な属性                                                      | 説明                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | トランザクションで不正が検出されたときに発行されます  |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | AI サーキットブレーカーが状態を変更したときに発行されます |

### ブリッジモジュール

| イベントタイプ             | 主な属性                                                  | 説明                                             |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | インバウンドのブリッジデポジットが確認されたときに発行されます     |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | アウトバウンドのブリッジ出金が確認されたときに発行されます |

### クロス VM モジュール

| イベントタイプ         | 主な属性                                                   | 説明                                           |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | クロス VM 呼び出しが開始されたときに発行されます             |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | クロス VM 呼び出しが完了したときに発行されます                |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | クロス VM メッセージがキューのタイムアウトを超えたときに発行されます |

### マルチレイヤーモジュール

| イベントタイプ             | 主な属性                                                 | 説明                                     |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | レイヤー状態アンカーが提出されたときに発行されます  |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | レイヤーが稼働ステータスを変更したときに発行されます |

### RDK モジュール

| イベントタイプ        | 主な属性                                        | 説明                                      |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | 新しいロールアップが登録されたときに発行されます          |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | 決済バッチが提出されたときに発行されます     |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | バッチがチャレンジウィンドウを通過したときに発行されます |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | DA ブロブが保存されたときに発行されます                 |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | 保持期間後に DA ブロブがプルーニングされたときに発行されます |

### バーンモジュール

| イベントタイプ        | 主な属性                                                                      | 説明                                 |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | 収集された手数料が分配されたときに発行されます |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | トークンが永久にバーンされたときに発行されます  |

### xQORE モジュール

| イベントタイプ       | 主な属性                                                 | 説明                                |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                   | QOR が xQORE にロックされたときに発行されます      |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`       | xQORE が QOR に戻ってアンロックされたときに発行されます |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | PvP リベース分配時に発行されます     |

### インフレーションモジュール

| イベントタイプ     | 主な属性                                             | 説明                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | 各インフレエポックの終わりに発行されます |

### RL コンセンサスモジュール

PRISM パラメータの調整とサーキットブレーカーの動作は、このモジュールを通じて発行されます。

| イベントタイプ                  | 主な属性                                                 | 説明                                                |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | PRISM エージェントがパラメータ調整を適用したときに発行されます |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | PRISM サーキットブレーカーがアクションをブロックしたときに発行されます |

---

## JavaScript クライアントの例

### EVM WebSocket（ethers.js）

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

### QoreChain RPC WebSocket（ネイティブ）

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

## 注記

- **接続制限**: WebSocket 接続のデフォルトの最大数は無制限です（`max-open-connections = 0`）。本番デプロイでは `app.toml` で制限を設定してください。
- **イベントバッファ**: RPC WebSocket は、サブスクリプションごとに最大 200 件のイベントをバッファリングします。クライアントが遅れた場合、古いイベントは破棄されます。
- **再接続**: WebSocket 接続はノードの再起動やアップグレード中に中断される可能性があるため、クライアントは指数バックオフを用いた自動再接続を実装する必要があります。
