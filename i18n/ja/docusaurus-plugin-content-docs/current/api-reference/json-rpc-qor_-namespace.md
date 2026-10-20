---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ 名前空間
sidebar_label: JSON-RPC — qor_ 名前空間
sidebar_position: 2
---

# JSON-RPC — qor_ 名前空間

`qor_` 名前空間は、耐量子暗号のステータス、AI 分析、クロス VM メッセージング、マルチレイヤー状態、ブリッジ操作、トークノミクス、ロールアップ基盤、および PRISM コンセンサス状態を照会するための QoreChain 固有の JSON-RPC メソッドを提供するよう設計されました。

:::warning まだ提供されていません
**リリース済みのノードビルドは、まだ `qor_` 名前空間を提供していません**（メインネット `qorechain-vladi`、テストネット `qorechain-diana`、自分で運用するノードのいずれも）。公開 EVM エンドポイントでは、`rpc_modules` に `eth`、`net`、`rpc`、`txpool`、`web3` のみが表示され、両ネットワークで**すべての `qor_` メソッドが `-32601`（method not found）を返します**。メソッドはノードのソースコードには実装されていますが JSON-RPC サーバーには登録されていないため、`app.toml` の `api` リストに `qor` を追加しても効果はありません。この名前空間の登録はノードのリリースで予定されており、リリース時にこのページでどのリリースかをお知らせします。

現時点では `qor_` メソッドを前提に開発しないでください。該当するものがある場合は、下の表にある REST ルートを使用してください。`client.qor.*` ヘルパーを公開しているクライアントライブラリはこれらと同じメソッドをラップしているため、それらのヘルパーも同様に失敗します。
:::

ご自身で確認することもできます。

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## 予定されているメソッドと現在使用すべきもの

| 予定されているメソッド                | 現在使用すべきもの |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}`（`found`、`account.key_type`、`account.created_at_height`）。[REST / gRPC エンドポイント](/api-reference/rest-grpc-endpoints#pqc-module)を参照してください。 |
| `qor_getHybridSignatureMode`  | 公開されている REST ルートはありません。ノードに対して、または `--node https://rpc.qore.host:443` を指定して `qorechaind query pqc hybrid-mode`（または `query pqc params`）を実行してください。 |
| `qor_getAIStats`              | 自分で運用するノード上の gRPC `qorechain.ai.v1.Query/Stats`、または `qorechaind query ai stats`。REST ルートはありません。 |
| `qor_getCrossVMMessage`       | 自分で運用するノード上の gRPC `qorechain.crossvm.v1.Query/Message`。REST ルートはありません。 |
| `qor_getReputationScore`      | 公開されているクエリルートはありません（レピュテーションモジュールが公開しているのは gRPC の `Params` のみです）。 |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` および `anchor/{layer_id}`。[マルチレイヤーモジュール](/api-reference/rest-grpc-endpoints#multilayer-module)を参照してください。 |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`。[ブリッジモジュール](/api-reference/rest-grpc-endpoints#bridge-module)を参照してください。ブリッジはまだ稼働していません。 |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | 自分で運用するノード上の gRPC `qorechain.rlconsensus.v1.Query`（`AgentStatus`、`Observation`、`Reward`）。REST ルートはありません。 |
| `qor_getPoolClassification`   | 公開されているクエリルートはありません。 |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`。[バーンモジュール](/api-reference/rest-grpc-endpoints#burn-module)を参照してください。 |
| `qor_getXQOREPosition`        | なし。xQORE は稼働していません（[xQORE ステーキング](/user-guide/xqore-staking)を参照）。 |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` と `/epoch_info`（発行モード、エポックごとの量、上限、進捗。v3.2.2 から提供）。[インフレーションモジュール](/api-reference/rest-grpc-endpoints#inflation-module)を参照してください。 |
| `qor_getTokenomicsOverview`   | `GET /qorechain/burn/v1/stats`、`GET /qorechain/inflation/v1/epoch_info`、`GET /cosmos/bank/v1beta1/supply` を組み合わせます。 |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`、`/rollups`、`/batch/{id}/{index}`、`/latest_batch/{id}`、`/batches/{id}`、`/blob/{id}/{index}`（v3.2.2 から提供。[RDK モジュール](/api-reference/rest-grpc-endpoints#rdk-module)を参照）、または `qorechaind query rdk`。 |
| `qor_suggestRollupProfile`    | 公開サービスはありません。[プリセットプロファイル](/rollups/preset-profiles)を参照してください。 |
| `qor_getBTCStakingPosition`   | なし。BTC リステーキングモジュールにはまだクエリサービスがありません。 |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`。アブストラクトアカウントは現在、両ネットワークで無効です。 |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config`（v3.2.2 から提供）。[ガスアブストラクションモジュール](/api-reference/rest-grpc-endpoints#gas-abstraction-module)を参照してください。 |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | なし。 |

アカウントの EVM レーンの状態（登録済みの PQC 鍵、認可ウィンドウ、EIP-7702 の同意）については、`GET /qorechain/pqc/v1/account/{address}`、`GET /qorechain/pqc/v1/evm_window/{address}`、`GET /qorechain/pqc/v1/evm_delegation_consent/{address}` を使用してください。ステータスルートは**単数形**の `account` です。複数形の `/accounts/` は提供されておらず、`501` を返します。

---

## エラーコード

この名前空間を提供しているノードでは、エラーは標準の JSON-RPC 2.0 コードに従います。現時点では、`qor_` メソッドの呼び出しは `-32601` で失敗します。

| コード   | メッセージ          | 説明                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | 不正な形式の JSON-RPC リクエスト            |
| -32601 | Method not found | メソッドが存在しない、またはノードが `qor_` 名前空間を提供していません（現在リリース済みのすべてのビルド） |
| -32602 | Invalid params   | パラメータが欠落しているか無効です         |
| -32603 | Internal error   | サーバー側の処理エラー          |
