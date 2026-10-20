---
slug: /api-reference/websocket-events
title: WebSocket イベント
sidebar_label: WebSocket イベント
sidebar_position: 5
---

# WebSocket イベント

QoreChainは、2つのWebSocketインターフェース、すなわちEVM互換WebSocketとQoreChain Consensus Engine RPC WebSocketを通じてリアルタイムのイベントストリーミングを提供します。

:::note
コンセンサスエンジンのRPC WebSocketは、**`qorechain-vladi`** メインネットと **`qorechain-diana`** テストネットの両方で公開されています。EVM WebSocketが公開されているのは**テストネットのみ**です。公開のメインネットEVM WebSocketは存在せず（`wss://evm.qore.host` と `wss://evm-ws.qore.host` はWebSocket接続を受け付けません）、メインネットで `eth_subscribe` を使うには自分でノードを運用してください。以下のローカルエンドポイントは、自分で運用するノードを前提としています。

| インターフェース | メインネット | テストネット |
| --------- | ------- | ------- |
| RPC WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM WebSocket | なし（自前ノードのみ） | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM WebSocket

**エンドポイント:** 自分のノードでは `ws://localhost:8546`、公開テストネットでは `wss://evm-ws-testnet.qore.host`。公開のメインネットEVM WebSocketはありません。

EVM WebSocketは、Ethereumツールと互換性のあるリアルタイムイベントストリーミング用の標準`eth_subscribe`メソッドをサポートします。

### サブスクリプションの種類

| サブスクリプション        | 説明                                              |
| ------------------------- | ------------------------------------------------- |
| `newHeads`                | 新しいブロックが追加されるたびにヘッダーを発行     |
| `logs`                    | オプションのフィルタに一致するログを発行           |
| `newPendingTransactions`  | メモリプールに入るトランザクションハッシュを発行   |

`syncing` サブスクリプションは実装されていません。`eth_subscribe` に `"syncing"` を指定すると `-32600 syncing subscription is not implemented` が返されます。代わりにHTTP経由で `eth_syncing` をポーリングしてください。

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

**エンドポイント:** 自分のノードでは `ws://localhost:26657/websocket`、公開では `wss://rpc.qore.host/websocket`（メインネット）と `wss://rpc-testnet.qore.host/websocket`（テストネット）。

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
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
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

イベントは標準のコンセンサスエンジンイベントとして発行されます。イベントタイプと属性でフィルタした `tm.event='Tx'` クエリでサブスクライブしてください（例: `tm.event='Tx' AND bridge_deposit.chain EXISTS`）。ブロックレベルのイベント（下記のPRISMイベントなど、ブロック終了時のロジックが発行するもの）は、`Tx` ではなく `tm.event='NewBlock'` で配信されます。以下のイベント名と属性は、チェーンバージョン v3.2.3（メインネット）のものです。v3.2.4 テストネットにのみ存在するイベントには、その旨を記載しています。

:::note 実際に目にするイベント
これらのモジュールの多くは、公開ネットワークでは稼働していません。ブリッジは稼働しておらず、マルチレイヤーのレイヤーやロールアップはまだ登録されておらず、xQOREも利用できません。これらのイベントは定義されていますが、アクティビティが発生するまで発行されません。PRISMの観測イベントと報酬イベント（`rl_observation_collected`、`rl_reward_computed`）は、両ネットワークで約10ブロックごとに発行されます。
:::

### PQCモジュール

| イベントタイプ              | 主な属性                                              | 説明                                             |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| `pqc_verify`                | `address`、`key_type`、`algorithm_id`、`hybrid_mode`、`status` | PQC署名のチェックごとに発行 |
| `pqc_hybrid_verify`         | `address`、`algorithm_id`、`status`                    | ハイブリッド署名の検証ごとに発行                  |
| `pqc_hybrid_classical_only` | `address`、`hybrid_mode`                               | 古典署名のみのものが現在のモードで受理された際に発行 |
| `pqc_key_registered`        | `address`、`key_type`、`algorithm_id`                  | PQC鍵が登録された際に発行                         |
| `pqc_key_rotated`           | `address`、`algorithm_id`                              | PQC鍵がローテーションされた際に発行               |
| `pqc_key_migrated`          | `address`、`from_algorithm`、`to_algorithm`            | 鍵が新しいアルゴリズムへ移行された際に発行         |
| `pqc_evm_window_opened`     | `address`、`expiry_height`、`max_txs`、`max_value`。ウィンドウにスコープがある場合は `native_only` と `allowed_targets`（v3.2.3） | EVMレーンの承認ウィンドウが開いた際に発行          |
| `pqc_evm_window_closed`     | `address`                                              | EVMレーンの承認ウィンドウが閉じた際に発行          |
| `pqc_evm_delegation_consent` | `address`、`delegate`、`expiry_height`                | アカウントが EIP-7702 委任への同意を記録した際に発行（v3.2.2） |
| `pqc_evm_delegation_cleared` | `address`、`delegate`                                 | アカウントの EIP-7702 委任が解除された際に発行（v3.2.2） |
| `pqc_algorithm_registered`、`pqc_algorithm_status_updated`、`pqc_algorithm_disabled` | `algorithm_id`、および `name`/`category`、`old_status`/`new_status`、または `reason` | ガバナンスによるアルゴリズムレジストリの変更 |

PQC鍵は登録トランザクションで明示的に登録されます。自動登録のイベントはありません。

### Bridgeモジュール

| イベントタイプ                | 主な属性                                                 | 説明                                                     |
| ----------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `bridge_deposit`              | `operation_id`、`chain`、`asset`、`amount`、`sender`     | インバウンドの入金が記録された際に発行                     |
| `bridge_withdraw`             | `operation_id`、`chain`、`asset`、`amount`、`sender`、`receiver` | 出金が記録された際に発行                           |
| `bridge_attestation`          | `operation_id`、`validator`、`chain`、`pqc_verified`、`attestations` | バリデーターのアテステーションごとに発行 |
| `bridge_operation_executed`   | `operation_id`、`status`                                 | オペレーションが完了した際に発行                           |
| `bridge_circuit_breaker_trip` | `chain`、`status`、`reason`                              | チェーンのブリッジのサーキットブレーカーが作動した際に発行 |

### Cross-VMモジュール

| イベントタイプ       | 主な属性                                                                 | 説明                                                    |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `crossvm_request`      | `message_id`、`source_vm`、`target_vm`、`target_contract`、`sender`      | クロスVM呼び出しが開始された際に発行                       |
| `crossvm_response`     | `message_id`、`status`                                                   | クロスVM呼び出しが完了した際に発行                          |
| `crossvm_timeout`      | `message_id`                                                             | クロスVMメッセージがキューのタイムアウトを超えた際に発行     |

### Multilayerモジュール

| イベントタイプ           | 主な属性                                                       | 説明                                             |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| `state_anchored`            | `layer_id`、`layer_height`、`state_root`、`main_chain_height`、`pqc_verified`、`transaction_count` | レイヤーのステートアンカーが受理された際に発行 |
| `anchor_challenged`         | `layer_id`、`layer_height`、`challenger`、`challenge_reason`、`resolution` | アンカーに異議が申し立てられた際に発行 |
| `layer_status_updated`      | `layer_id`、`status`、`reason`                                     | レイヤーのステータスが変化した際に発行             |
| `sidechain_registered`、`paychain_registered` | `layer_id`、`layer_type`、`creator`、`status`    | レイヤーが登録された際に発行                       |
| `transaction_routed`        | `selected_layer`、`routing_reason`、`gas_savings`、`latency_ms`、`sender` | トランザクションがレイヤーへルーティングされた際に発行 |

### RDKモジュール

| イベントタイプ     | 主な属性                                              | 説明                                              |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `rollup_created`      | `rollup_id`、`creator`、`profile`、`settlement_mode`       | 新しいロールアップが登録された際に発行             |
| `rollup_paused`、`rollup_resumed`、`rollup_stopped` | `rollup_id`、および指定がある場合は理由 | ロールアップが一時停止、再開、または停止された際に発行 |
| `batch_challenged`、`challenge_resolved`、`batch_rejected` | `rollup_id`、`batch_index`（解決時は `fraud_upheld` も） | バッチに異議が申し立てられた際、異議が解決された際、またはバッチが却下された際に発行 |
| `batch_submitted`     | `rollup_id`、`batch_index`、`tx_count`                     | 決済バッチが送信された際に発行                     |
| `batch_finalized`     | `rollup_id`、`batch_index`                                 | バッチがチャレンジウィンドウを通過した際に発行     |
| `da_blob_stored`      | `rollup_id`、`blob_index`、`backend`、`size`               | DAブロブが保存された際に発行                       |
| `da_blob_pruned`      | `rollup_id`、`blob_index`                                  | 保持期間経過後にDAブロブが削除された際に発行       |

### Burnモジュール

| イベントタイプ           | 主な属性                                                  | 説明                                       |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| `burn`                   | `source`、`amount`                                        | トークンが恒久的にバーンされた際に発行       |
| `milestone_burn`         | `tx_threshold`、`burn_amount`、`cumulative_tx_count`      | トランザクション数のマイルストーンバーンが実行された際に発行 |
| `burn_stranded_released` | `amount`、`destination`、`remaining`                      | ガバナンスが滞留していたステーカー分の一部を解放した際に発行 |

### Inflation、Gas Abstraction、Licence、Light Node、AIモジュール

| イベントタイプ | 主な属性 | 説明 |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`、`fixed_epoch_emission`、`max_total_emission` | ガバナンスが発行パラメータを変更した際に発行 |
| `gas_abstraction_conversion`、`gas_abstraction_refill` | `paid`、`native_equivalent`、`rate`、`price_source`、`result` | 別の受け入れ可能なトークンで支払われた手数料が変換された際、およびフロートが補充された際に発行（`uqor` のみが受け入れられている間は発行されません） |
| `gas_abstraction_float_funded`、`gas_abstraction_config_updated` | `sender`、`amount`、`accepted_tokens`、`block_conversion_cap` | フロートに資金が投入された際、およびガバナンスが設定を更新した際に発行 |
| `license_granted`、`license_revoked`、`license_suspended`、`license_resumed`、`license_expired` | 付与先と機能 | ライセンスのライフサイクル |
| `license_authority_updated` | `new_authority` | ガバナンスがライセンス権限者を置き換えた際に発行（v3.2.3） |
| `lightnode_register`、`lightnode_heartbeat`、`lightnode_claim_rewards`、`lightnode_deregister`、`lightnode_status_change`、`lightnode_reward_distribution`、`lightnode_reserve_release` | `address`、`node_type`、`status`、`reward_amount`、`destination` | ライトノードのライフサイクルと報酬のイベント |
| `ai_config_updated` | `max_tx_per_minute`、`max_evm_tx_per_minute`、`anomaly_action`、`anomaly_threshold` | ガバナンスが AI スクリーニング設定を更新した際に発行 |

### Staking Tiersモジュール（テストネットのみ）

これらのイベントは `qorechain-diana` テストネット（v3.2.4）にのみ存在します。メインネットにはまだこのモジュールがありません（ガバナンス提案 13 により、v3.2.4 は高さ 3,742,566 で適用される見込みです）。

| イベントタイプ | 主な属性 | 説明 |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`、`delegator`、`validator`、`amount`、`months`、`end_time` | デリゲーションのロックが作成された |
| `staking_tier_lock_unlocked_early`、`staking_tier_lock_released` | `lock_id`、`delegator`、`penalty_burned`、`bonus_forfeited` | ロックが早期に終了した、または終了時点に達した |
| `staking_tier_bonus_claimed`、`staking_tier_bonus_settled` | `delegator`、`amount`。決済の合計 | ボーナスが請求された。プールが決済された |
| `staking_tier_params_updated` | パラメータ | ガバナンスがモジュールのパラメータを変更した |

### xQOREモジュール

これらのイベントはまだ発行されません。xQOREはリリース済みのどのノードビルドでも稼働していません（[xQOREステーキング](/user-guide/xqore-staking)を参照）。

| イベントタイプ | 主な属性                                                              | 説明                                       |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| `xqore_lock`   | `owner`、`amount`                                                     | QORがxQOREにロックされた際に発行             |
| `xqore_unlock` | `owner`、`amount`、`penalty`、`burned`、`redistributed`、`returned`   | xQOREがQORへとアンロックされた際に発行       |

### PRISM Consensus（RL Consensus）モジュール

これらはブロック終了時のイベントで、`NewBlock` ストリームで配信されます。

| イベントタイプ                 | 主な属性                | 説明                                                        |
| ------------------------------ | ----------------------- | -------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | PRISMの観測が行われた際に発行（約10ブロックごと）                |
| `rl_reward_computed`           | `height`、`reward`      | PRISMの報酬が計算された際に発行                                 |
| `rl_action_applied`            | `height`、`agent_mode`  | PRISMエージェントがパラメータ調整を適用した際に発行             |
| `rl_agent_mode_changed`        | `height`、`agent_mode`  | エージェントのモードが変化した際に発行                          |
| `rl_circuit_breaker_triggered` | `height`                | PRISMサーキットブレーカーがアクションをブロックした際に発行     |
| `rl_circuit_breaker_recovered` | `height`                | サーキットブレーカーが復旧した際に発行                          |

### AIモジュール

| イベントタイプ     | 主な属性                                         | 説明                                              |
| ------------------ | ------------------------------------------------ | ------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`、`action`、`is_anomalous`     | 異常スコアが付与されたトランザクションごとに発行   |

---

## JavaScriptクライアントの例

### EVM WebSocket（ethers.js）

```javascript
import { ethers } from "ethers";

// Own node: ws://localhost:8546. Public testnet: wss://evm-ws-testnet.qore.host
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
// Own node: ws://localhost:26657/websocket. Public: wss://rpc.qore.host/websocket
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to bridge deposits
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND bridge_deposit.chain EXISTS" },
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

- **接続数の上限**: 自分で運用するノードでは、WebSocket接続数のデフォルトの上限は無制限です（`max-open-connections = 0`）。本番環境では`app.toml`で上限を設定してください。公開エンドポイントには独自の上限が適用されます。
- **イベントバッファ**: RPC WebSocketは、サブスクリプションごとに一定数のイベントをバッファします（セルフホストのノードではデフォルトで200件）。クライアントの処理が追いつかない場合、古いイベントは破棄されます。
- **再接続**: ノードの再起動やアップグレード中にWebSocket接続が中断されることがあるため、クライアントは指数バックオフによる自動再接続を実装する必要があります。
