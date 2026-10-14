---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC エンドポイント
sidebar_label: REST / gRPC エンドポイント
sidebar_position: 1
---

# REST / gRPC エンドポイント

QoreChain はプログラムからのアクセス向けに、3つの主要なインターフェースを提供しています。

| インターフェース | デフォルトポート | プロトコル | 説明                                |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | REST ゲートウェイ (Cosmos SDK API サーバー) |
| gRPC      | `9090`       | HTTP/2    | Protobuf エンコードの gRPC サービス      |
| RPC       | `26657`      | HTTP + WS | QoreChain コンセンサスエンジン RPC     |

すべての REST エンドポイントは JSON を返します。gRPC エンドポイントは Protocol Buffers を使用し、任意の gRPC クライアントで利用できます。RPC インターフェースはコンセンサスレベルのクエリとトランザクションのブロードキャストを提供します。

:::note
これらのインターフェースは、**`qorechain-vladi`** メインネット（2026年6月29日より稼働中）と **`qorechain-diana`** テストネットの両方で利用できます。以下のベース URL はローカルで実行中のノードを前提としています。公開ホスト型エンドポイントは `https://api.qore.host` / `https://api-testnet.qore.host`（REST）と `https://rpc.qore.host` / `https://rpc-testnet.qore.host`（RPC）で、[ネットワーク](/appendix/networks#public-endpoints)に掲載されています。**公開の gRPC エンドポイントはありません**。ホスト名 `grpc.qore.host` と `grpc-testnet.qore.host` は存在しないため、gRPC が必要な場合は自分のノードを実行してください。
:::

## ベース URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## 存在するルート {#which-routes-exist}

QoreChain 固有のモジュールは `/qorechain/<module>/v1/...` プレフィックス配下の REST として公開されており、REST ルートがあるのは以下に挙げるモジュールだけです。その他のモジュールは **gRPC のみ**で利用できます（[gRPC 専用モジュール](#grpc-only-modules)を参照）。標準の Cosmos SDK、EVM、CosmWasm のルートは[標準ルート](#standard-routes)に記載しています。

存在しないルートは、HTTP `501` と `{"code":12,"message":"Not Implemented"}` で応答します。これはルートが提供されていないことを意味し、クエリの結果が空だったという意味ではありません。`/qorechain/` プレフィックスのない短縮パス（例: `/bridge/v1/chains` や `/pqc/v1/params`）は提供**されません**。存在するルートで未知のレコードを指定すると、HTTP `404` と `{"code":5,"message":"... not found"}` が返ります。

以下の例は公開メインネットのホストを使用しています。テストネットでは `https://api-testnet.qore.host` に置き換えてください。

## PQC モジュール {#pqc-module}

| メソッド | エンドポイント                                 | 説明                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | アカウントのポスト量子鍵の登録状況（`found`、鍵タイプ、アルゴリズム） |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | アカウントの EVM レーン認可ウィンドウと、その残り          |

パスのセグメントは単数形の `account` である点に注意してください。`/qorechain/pqc/v1/params` や `/stats` のルートはありません。

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

鍵が登録されていないアカウントは `{"found": false, "account": null}` を返します。アカウントが送信前に鍵を登録する必要があるかどうかは、`found` で判断してください。

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

このルートは、ウィンドウのないアドレスに対しても失敗せず、`found: false` を返します。v3.2.0 以降、EVM レーンは、登録済みの PQC 鍵を持ち**かつ**ウィンドウが開いているアカウントからのトランザクションのみを受け付けます。`live` は、現在の高さでウィンドウがあと1件以上のトランザクションを受け付ける間は `true` です。`remaining_blocks`、`remaining_txs`、`remaining_value` は、どの上限が最も使い果たされそうかを示します。値は文字列として返される `uqor` 単位の整数です。EVM レーンの仕組みについては [EVM 開発](/developer-guide/evm-development)を参照してください。

## Bridge モジュール {#bridge-module}

Bridge モジュールの読み取り専用ステートは `/qorechain/bridge/v1/...` 配下の REST として公開されています（チェーンバージョン **v3.1.77** 以降、実際のオンチェーン JSON を提供）。Bridge の `config` は例えば `min_validators=10` や `attestation_threshold=7` を報告します。

| メソッド | エンドポイント                                    | 説明                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`               | 現在の Bridge モジュール設定      |
| GET    | `/qorechain/bridge/v1/chains`               | 登録済みのブリッジチェーンをすべて一覧表示       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | 特定のブリッジ済みチェーンの詳細     |
| GET    | `/qorechain/bridge/v1/validators`           | 登録済みのブリッジバリデーターを一覧表示       |
| GET    | `/qorechain/bridge/v1/validators/{address}` | 特定のブリッジバリデーターの詳細  |
| GET    | `/qorechain/bridge/v1/operations`           | ブリッジ操作を一覧表示                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | 特定のブリッジ操作の詳細  |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}` は、`{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}` のようなエントリを1件返します。

:::caution ブリッジはまだ稼働していません
設定済みの37のブリッジチェーンはすべて、両ネットワークで `"status": "pending"` を報告しており、`validators` と `operations` は空のリストです。これらのルートはモジュールの設定を示すものであり、現時点でアセットをブリッジできることを意味するものではありません。[ブリッジアーキテクチャ](/architecture/bridge-architecture)を参照してください。
:::

## Multilayer モジュール {#multilayer-module}

Multilayer モジュールの完全なクエリサービスは `/qorechain/multilayer/v1/...` 配下の REST として公開されています（チェーンバージョン **v3.1.80** 以降）。これには2つの**ステートアンカー読み取りクエリ**が含まれます。`anchor/{layer_id}` はレイヤーの最新の決済アンカーを返し、`anchors/{layer_id}` はそのアンカー履歴を返します。各アンカーには、その正規化されたフィールドに対する **ML-DSA-87 (Dilithium-5)** 署名が付与されているため、クライアントはアンカーを取得して独立に検証できます。これが Rollup Development Kit の[決済レシート](/rollups/settlement-receipts)のオンチェーンでの基盤となっています。

| メソッド | エンドポイント                                        | 説明                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | 現在の Multilayer モジュールパラメータ              |
| GET    | `/qorechain/multilayer/v1/layers`               | 登録済みのレイヤーをすべて一覧表示                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | 特定のレイヤーの詳細                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | レイヤーの最新のステートアンカー                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | レイヤーのステートアンカー履歴                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | レイヤー間のトランザクションルーティング統計      |

`StateAnchorView` には `layer_id`、`layer_height`、`state_root`、`validator_set_hash`、`main_chain_height`、`anchored_at`、`pqc_aggregate_signature`、`transaction_count`、`compressed_state_proof` が含まれます。署名対象の正規化メッセージは `layer_id || layer_height || state_root || validator_set_hash` であり、レイヤー作成者の登録済み PQC 鍵に対して検証されます。アンカーのないレイヤーは、`anchor/{layer_id}` からは HTTP `404`（`no anchor for layer ...`）を返し、`anchors/{layer_id}` からは空のリスト（`{"anchors": []}`）を返します。

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

本稿執筆時点では、両ネットワークとも `layers` は空のリストです。

## Burn モジュール {#burn-module}

Burn モジュールの読み取り専用ステートは `/qorechain/burn/v1/...` 配下の REST として公開されています。Burn の `params` には例えば `gas_burn_rate=0.30` が含まれます。

| メソッド | エンドポイント                              | 説明                                                    |
| ------ | ------------------------------------- | -------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | 現在の Burn モジュールパラメータ                                 |
| GET    | `/qorechain/burn/v1/stats`            | 累積 Burn 総量（ソース別内訳）                     |
| GET    | `/qorechain/burn/v1/records`          | 最近の Burn レコードを一覧表示                                   |
| GET    | `/qorechain/burn/v1/milestone`        | Burn マイルストーンの進捗（累積トランザクション数）         |
| GET    | `/qorechain/burn/v1/stranded_rewards` | v3.2.0 アップグレードで取り分けられ、まだ解放されていないステーカーの取り分 |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

実際のレスポンスにはすべての Burn ソース（`ai_service`、`amm`、`auto_buyback`、`bridge_fee`、`contract_create`、`failed_tx`、`gas_fee`、`milestone`、`rollup_create`、`tge`、`treasury_buyback`、`xqore_penalty`）が列挙されます。サンプルは一部を省略しています。金額は `uqor` 単位です。

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` は解放されずに残っている分、`released` はガバナンスがすでに移動した分、`snapshot_height` は準備金を記録した v3.2.0 アップグレードの高さです。[トークノミクス](/architecture/tokenomics)を参照してください。

## Abstract Account モジュール {#abstract-account-module}

Abstract Account のクエリサービスは `/qorechain/abstractaccount/v1/...` 配下の REST として公開されており（チェーンバージョン **v3.1.85** 以降）、これにはハードコーディングなしで[オーセンティケーター](/developer-guide/account-abstraction#authenticators)のスコープを検証するための**パーミッションスキーマ**が含まれます。

| メソッド | エンドポイント                                              | 説明                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/abstractaccount/v1/config`                | モジュール設定（機能プローブ: `enabled`）        |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | アブストラクトアカウントを一覧表示                                |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | 指定アドレスのアブストラクトアカウントの状態（なければ `404`）                  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`、`permissions`、`msg_permissions`、`key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note 両ネットワークで無効
現在、`enabled` はメインネットとテストネットの両方で `false` であるため、リンク済みウォレットからの支出などのアブストラクトアカウント機能は利用できません。このモジュールに依存する前に、`config.enabled` を機能プローブとして使用してください。[アカウントアブストラクション](/developer-guide/account-abstraction)を参照してください。
:::

## AMM モジュール {#amm-module}

| メソッド | エンドポイント                                           | 説明                                              |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/qorechain/amm/v1/params`                         | 現在の AMM パラメータ（ベーシスポイント単位の手数料、上限）    |
| GET    | `/qorechain/amm/v1/pools`                          | プールを一覧表示                                              |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                | 1つのプール（不明な場合は `404`）                         |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | プール内におけるアドレスの LP トークン残高                  |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | denom ペアのプールを検索（なければ `404`）        |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | 見積もり: 入力額を指定した場合の出力額       |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | 見積もり: 出力額を指定した場合に必要な入力額 |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

本稿執筆時点では、どちらのネットワークにもプールは存在せず（`{"pools": []}`）、不明なプールに対する見積もりは HTTP `400` と `{"code":3,"message":"pool not found"}` を返します。

## Licence モジュール {#licence-module}

| メソッド | エンドポイント                                              | 説明                                                      |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | `grantee` がその機能の有効な付与を保有しているかどうか（なければ `404`） |
| GET    | `/qorechain/license/v1/holders/{feature_id}`          | 機能に対するすべての付与                                         |
| GET    | `/qorechain/license/v1/list/{grantee}`                | アドレスが保有するすべての付与                                       |

付与（`LicenseView`）には `grantee`、`feature_id`、`expires_at`、`granted_at`、`granted_by`、`suspended`、`metadata` があります。`check` は `active` も返します。一致するものがない list または holders クエリは `{"licenses": []}` を返します。付与のないアドレスに対する `check` は、HTTP `404` と `{"code":5,"message":"no license for <grantee>/<feature_id>"}` を返します。

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Light Node モジュール {#light-node-module}

| メソッド | エンドポイント                                      | 説明                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | 登録、ハートビート、報酬のパラメータ                      |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`、`total_active`、`total_rewards`、`last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | 登録済みのライトノードを一覧表示                                       |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | 1つのノード（未登録の場合は `{"node": null, "found": false}`）     |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | オペレーターアドレスに蓄積された報酬（`accumulated_rewards`） |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | 報酬プールの会計（`balance`、`reserved`、`outstanding`、`payable`、`distributable`、`max_reward_per_block_per_node`、`initialized`） |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved` はプールのうち留保されていて、ガバナンス投票でしか動かせない部分です。`max_reward_per_block_per_node`（`uqor` 単位）は、チェーンが付与する報酬の、ノードごと・ブロックごとの上限です。上限は約束された金額ではありません。`balance` と `reserved` は、ここではプレースホルダーとして表示しています。

:::note 登録は開放されていません
両ネットワークで `stats` は `"total_registered": "0"` を報告し、`nodes` は空です。また、チェーンは `lightnode_operator` ライセンスの付与がないライトノード登録を拒否します。プログラムの状況については[ライトノード](/light-node/overview)を参照してください。
:::

## gRPC 専用モジュール {#grpc-only-modules}

これらのモジュールには gRPC の `Query` サービスはありますが、**REST ルートはありません**。サービス名は `qorechain.<module>.v1.Query` の形式です。

| モジュール        | gRPC クエリメソッド（チェーンバージョン v3.2.0）              |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

自分のノードに対して `grpcurl` を使用するか、[CLI クエリコマンド](/cli-reference/query-commands)を使用してください。特に `rdk` のクエリは、メインネットでは REST では利用できません（`/qorechain/rdk/v1/...` は `501` で応答します）。そのため、REST ベースのロールアップリーダーは現在メインネットに対して動作しません。

xQORE、インフレーション、BTC リステーキング（Babylon）、FairBlock、ガスアブストラクションの各モジュールには、現在のメインネットリリースではクエリサービス自体がなく、REST でも gRPC でも利用できません。

## 標準ルート {#standard-routes}

標準の Cosmos SDK、IBC、EVM、CosmWasm の REST ルートも提供されています。両ネットワークで確認済みの例を示します。

| エンドポイント                                              | 説明                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | 総供給量                                  |
| `/cosmos/bank/v1beta1/balances/{address}`             | アカウント残高                              |
| `/cosmos/staking/v1beta1/validators`                  | バリデーター                                    |
| `/cosmos/staking/v1beta1/params`                      | ステーキングパラメータ                           |
| `/cosmos/distribution/v1beta1/params`                 | ディストリビューションパラメータ                       |
| `/cosmos/gov/v1/params/voting`                        | ガバナンスパラメータ                       |
| `/cosmos/slashing/v1beta1/params`                     | スラッシングパラメータ                       |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | 保留中 / 適用済みのアップグレード          |
| `/cosmos/base/node/v1beta1/config`                    | ノードの最低ガス価格（両ネットワークで `0.1uqor`） |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | 最新ブロック                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | トランザクションの検索 / 参照 / ブロック別 |
| `/cosmos/evm/vm/v1/params`                            | EVM モジュールパラメータ                         |
| `/cosmos/evm/feemarket/v1/params`                     | EVM フィーマーケットパラメータ                     |
| `/cosmwasm/wasm/v1/codes/params`                      | CosmWasm のアップロード/インスタンス化の権限       |
| `/ibc/apps/transfer/v1/params`                        | IBC 転送パラメータ                       |

CosmWasm のプレフィックスは `/cosmwasm/wasm/v1/...` です。`/cosmos/wasm/v1/...` は提供されていません。

## gRPC リフレクション

自分で実行しているノードは、ポート `9090` で gRPC を提供します。サーバーリフレクションが有効な場合、`grpcurl` などのツールで利用可能なサービスを検出できます。

```bash
grpcurl -plaintext localhost:9090 list
```

特定のサービスをクエリするには次のようにします。

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` には `Account` と `EVMWindow` の2つのメソッドがあります。`Params` メソッドはありません。

## 認証

すべての REST および gRPC エンドポイントは、デフォルトでは認証なしでアクセスできます。本番環境にデプロイする場合は、ノードの前段にリバースプロキシ（Nginx や Caddy など）を配置し、TLS 終端とアクセス制御を行ってください。
