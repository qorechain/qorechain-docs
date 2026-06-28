---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ 名前空間
sidebar_label: JSON-RPC — qor_ 名前空間
sidebar_position: 2
---

# JSON-RPC — qor_ 名前空間

`qor_` 名前空間は、ポスト量子暗号のステータス、AI 分析、クロス VM メッセージング、マルチレイヤー状態、ブリッジ操作、トークノミクス、ロールアップインフラ、および PRISM コンセンサス状態を照会するための QoreChain 固有の JSON-RPC メソッドを提供します。

## 接続

| トランスポート | デフォルトアドレス      |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

`qor_` 名前空間は、同じポート上で `eth_`、`web3_`、`net_`、`txpool_` とともに提供されます。`app.toml` で有効化してください。

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
`qor_` 名前空間は、**`qorechain-vladi`** メインネット（EVM チェーン ID **9801**、チェーンバージョン **v3.1.80** で稼働中）と **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）で利用できます。以下の例はローカルノードを前提としています。リモートアクセスの場合は、プロバイダーのメインネットまたはテストネットのエンドポイントに置き換えてください。
:::

---

## メソッド

| メソッド                        | パラメータ                              | 説明                                              |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | アカウントの PQC キー登録ステータスを返します       |
| `qor_getHybridSignatureMode`  | なし                                    | 現在のハイブリッド署名強制モードを返します        |
| `qor_getAIStats`              | なし                                    | 集約された AI モジュール処理統計を返します       |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | ID でクロス VM メッセージを取得します                   |
| `qor_getReputationScore`      | `validator` (string)                    | バリデーターアドレスのレピュテーションスコアを返します         |
| `qor_getLayerInfo`            | `layerId` (string)                      | 登録済みレイヤーのメタデータとステータスを返します       |
| `qor_getBridgeStatus`         | `chainId` (string)                      | チェーンのブリッジステータスとロック総額を返します      |
| `qor_getRLAgentStatus`        | なし                                    | 現在の PRISM エージェントモードと稼働ステータスを返します  |
| `qor_getRLObservation`        | なし                                    | 最新の PRISM 観測ベクトルを返します             |
| `qor_getRLReward`             | なし                                    | 累積 PRISM 報酬メトリクスを返します                 |
| `qor_getPoolClassification`   | `validator` (string)                    | バリデーターの CPoS プール分類を返します         |
| `qor_getBurnStats`            | なし                                    | すべてのチャネルにわたるバーン統計を返します             |
| `qor_getXQOREPosition`        | `address` (string)                      | アドレスの xQORE ステーキングポジションを返します            |
| `qor_getInflationRate`        | なし                                    | 現在の年換算インフレ率を返します                 |
| `qor_getTokenomicsOverview`   | なし                                    | バーン、インフレ、供給の統合概要を返します    |
| `qor_getRollupStatus`         | `rollupId` (string)                     | 特定のロールアップのステータスと設定を返します   |
| `qor_listRollups`             | なし                                    | 登録済みのすべてのロールアップのリストを返します                 |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | ロールアップの特定の決済バッチを返します         |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | ユースケースに対する AI 支援ロールアッププロファイル推奨 |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | 特定の DA ブロブのステータスを返します                 |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Babylon モジュール経由の BTC ステーキングポジションを返します |
| `qor_getAbstractAccount`      | `address` (string)                      | アブストラクトアカウントの詳細と支出ルールを返します |
| `qor_getFairBlockStatus`      | なし                                    | FairBlock 暗号化ステータスと設定を返します    |
| `qor_getGasAbstractionConfig` | なし                                    | 受け付けられるトークンとガスアブストラクションのパラメータを返します   |
| `qor_getLaneConfiguration`    | なし                                    | 5レーンの TX 優先順位付け設定を返します           |

---

## 例

### qor_getBurnStats

**リクエスト:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getBurnStats",
    "params": [],
    "id": 1
  }'
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "total_burned": "1250000000",
    "total_distributed": "4750000000",
    "channels": {
      "validator_share": "0.40",
      "burn_share": "0.30",
      "treasury_share": "0.20",
      "staker_share": "0.10"
    },
    "last_block_burned": "342891"
  }
}
```

### qor_getRLAgentStatus

**リクエスト:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRLAgentStatus",
    "params": [],
    "id": 2
  }'
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "agent_mode": "observe",
    "observation_interval": 10,
    "circuit_breaker": {
      "active": false,
      "max_param_change": "0.10",
      "cooldown_blocks": 100
    },
    "last_observation_block": "342885",
    "cumulative_reward": "18.742"
  }
}
```

### qor_getRollupStatus

**リクエスト:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRollupStatus",
    "params": ["rollup-001"],
    "id": 3
  }'
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "rollup_id": "rollup-001",
    "status": "active",
    "settlement_type": "optimistic",
    "operator": "qor1abc123...",
    "total_batches": 147,
    "last_finalized_batch": 145,
    "pending_batches": 2,
    "stake": "10000000000uqor",
    "created_at_height": 100230
  }
}
```

---

## エラーコード

| コード   | メッセージ          | 説明                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | 不正な形式の JSON-RPC リクエスト            |
| -32601 | Method not found | メソッドが存在しません             |
| -32602 | Invalid params   | パラメータが欠落しているか無効です         |
| -32603 | Internal error   | サーバー側の処理エラー          |
| -32000 | Module disabled  | 照会されたモジュールが有効になっていません     |
| -32001 | Entity not found | 要求されたリソースが存在しません |
