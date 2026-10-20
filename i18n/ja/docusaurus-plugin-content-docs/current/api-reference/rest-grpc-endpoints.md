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
これらのインターフェースは、**`qorechain-vladi`** メインネット（2026年6月7日より稼働中、ノードリリース **v3.2.3**）と **`qorechain-diana`** テストネット（ノードリリース **v3.2.4**）の両方で利用できます。メインネットはブロック高 3,742,566 まで v3.2.3 を実行し、そのブロックから v3.2.4 を実行します（ガバナンス提案 13）。以下のベース URL はローカルで実行中のノードを前提としています。公開ホスト型エンドポイントは `https://api.qore.host` / `https://api-testnet.qore.host`（REST）と `https://rpc.qore.host` / `https://rpc-testnet.qore.host`（RPC）で、[ネットワーク](/appendix/networks#public-endpoints)に掲載されています。**公開の gRPC エンドポイントはありません**。ホスト名 `grpc.qore.host` と `grpc-testnet.qore.host` は存在しないため、gRPC が必要な場合は自分のノードを実行してください。
:::

## ベース URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## 存在するルート {#which-routes-exist}

QoreChain 固有のモジュールは `/qorechain/<module>/v1/...` プレフィックス配下の REST として公開されており、REST ルートがあるのは以下に挙げるモジュールだけです。その他のモジュールは **gRPC のみ**で利用できます（[gRPC 専用モジュール](#grpc-only-modules)を参照）。標準の Cosmos SDK、EVM、QoreChain Native のルートは[標準ルート](#standard-routes)に記載しています。

存在しないルートは、HTTP `501` と `{"code":12,"message":"Not Implemented"}` で応答します。これはルートが提供されていないことを意味し、クエリの結果が空だったという意味ではありません。`/qorechain/` プレフィックスのない短縮パス（例: `/bridge/v1/chains` や `/pqc/v1/params`）は提供**されません**。存在するルートで未知のレコードを指定すると、HTTP `404` と `{"code":5,"message":"... not found"}` が返ります。

以下の例は公開メインネットのホストを使用しています。テストネットでは `https://api-testnet.qore.host` に置き換えてください。サンプルの値は 2026年10月20日と21日ごろ（メインネット v3.2.3、テストネット v3.2.4）に実際のネットワークから読み取ったもので、時間とともに変化します。レスポンスの形を示すものとしてご利用ください。v3.2.4 リリースでは、いくつかのルートとフィールドが追加されます。これらは以下で **v3.2.4** と表記しており、テストネットでは 2026年10月19日から提供され、メインネットではブロック高 3,742,566 から提供されます。それまでの間、メインネットのノードはこれらに `501` で応答します。

## PQC モジュール {#pqc-module}

| メソッド | エンドポイント                                 | 説明                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | アカウントのポスト量子鍵の登録状況（`found`、鍵タイプ、アルゴリズム） |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | アカウントの EVM レーン認可ウィンドウと、その残り          |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | アカウントの EIP-7702 委任の同意、現在の委任、EVM ノンス（v3.2.2 以降） |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4**（テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から。それ以前のメインネットでは `501`）。バイナリが認識しているすべてのプロトコル機能と、`enabled`、`known`、`staged` フラグ |

パスのセグメントは単数形の `account` である点に注意してください。`/qorechain/pqc/v1/params` や `/stats` のルートはありません（これらには `qorechaind query pqc params` と `stats` を使用してください）。

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source` は `ecdsa_pubkey` の出所を示します。`stored`（登録時に渡された鍵）、`auth_account`（何も保存されていないため、アカウント自身のオンチェーン公開鍵）、または `none` です。v3.2.4 以降（テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から）は、レコードに `"possession_proven": false` も含まれます。これは、検証済みの[所有証明](/developer-guide/post-quantum-signing#proof-of-possession)とともに鍵が登録されると `true` になります。まだ v3.2.3 のメインネットノードは、このフィールドを報告しません。

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

このルートは、ウィンドウのないアドレスに対しても失敗せず、`found: false` を返します。v3.2.0 以降、EVM レーンは、登録済みの PQC 鍵を持ち**かつ**ウィンドウが開いているアカウントからのトランザクションのみを受け付けます。`live` は、現在の高さでウィンドウがあと1件以上のトランザクションを受け付ける間は `true` です。`remaining_blocks`、`remaining_txs`、`remaining_value` は、どの上限が最も使い果たされそうかを示します。値は文字列として返される `uqor` 単位の整数です。v3.2.3 以降、ウィンドウにはスコープを持たせることができます。`native_only`（通常の QOR 送金のみ）と `allowed_targets`（列挙された受取先のみ）です。EVM レーンの仕組みについては [EVM 開発](/developer-guide/evm-development#evm-window)を参照してください。

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

アカウントの EIP-7702 委任は、そのアカウント自身のポスト量子同意（`MsgAuthorizeEVMDelegation`）がある場合にのみ有効になります。`found` と `live` は、`delegate` に対する記録済みでまだ使用可能な同意を報告します。`current_delegate` はアカウントが現在設定している委任、`nonce` はその EVM ノンスです。

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

`StateAnchorView` には `layer_id`、`layer_height`、`state_root`、`validator_set_hash`、`main_chain_height`、`anchored_at`、`pqc_aggregate_signature`、`transaction_count`、`compressed_state_proof` が含まれます。v3.2.2 以降、署名対象のメッセージは **v2 アンカーメッセージ**です。ドメインタグ `qorechain-multilayer-anchor-v2` に続いて、チェーン ID、レイヤー ID、レイヤー高、ステートルート、バリデーターセットのハッシュ、トランザクション数、圧縮ステート証明が並び、可変長の各フィールドには 8 バイトのビッグエンディアンの長さが前置されます（以前の v1 メッセージにはチェーン ID も長さの前置もなかったため、署名がすべてのチェーンで有効でした）。これはレイヤー作成者の登録済み PQC 鍵に対して検証されます。`qorechaind query rdk anchor-sign-bytes` は、ロールアップバッチに対するこのバイト列を出力します。アンカーのないレイヤーは、`anchor/{layer_id}` からは HTTP `404`（`no anchor for layer ...`）を返し、`anchors/{layer_id}` からは空のリスト（`{"anchors": []}`）を返します。

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
| GET    | `/qorechain/burn/v1/stranded_rewards` | 取り分けられ、まだガバナンスによって解放されていないステーカーの取り分 |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

実際のレスポンスにはすべての Burn ソース（`ai_service`、`amm`、`auto_buyback`、`bridge_fee`、`contract_create`、`failed_tx`、`gas_fee`、`milestone`、`rollup_create`、`tge`、`treasury_buyback`、`xqore_penalty`、さらに v3.2.4 からは `staking_tier_penalty`（Staking Tier ロックの早期解除ペナルティで、Burn されます））が列挙されます。サンプルは一部を省略しています。金額は `uqor` 単位です。`failed_tx` は v3.2.2 アップグレード以降ゼロではありません。このアップグレードで、失敗したトランザクションの Burn が実際に課金された手数料に対して適用されるようになりました。v3.2.3 以降、古い Burn ごとの `records` は削除されるため、`records` は全履歴ではなく最近の範囲です。`stats` の合計は累積値です。

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` は解放されずに残っている分、`released` はガバナンスがすでに移動した分、`snapshot_height` は準備金を記録した v3.2.0 アップグレードの高さです。上記の値は本稿執筆時点のものです。ガバナンスは最初の金額（6,693,045.921330 QOR）を 2026年10月19日に解放し、v3.2.3 アップグレードは残りの準備金をその時点の高さで再計算しました（3,807,496.785528 QOR）。再計算された金額を解放するための次のガバナンス提案は、本稿執筆時点ではまだ投票期間中でしたので、最新の値を読み取ってください。[トークノミクス](/architecture/tokenomics)を参照してください。

## Abstract Account モジュール {#abstract-account-module}

Abstract Account のクエリサービスは `/qorechain/abstractaccount/v1/...` 配下の REST として公開されており（チェーンバージョン **v3.1.85** 以降）、これにはハードコーディングなしで[オーセンティケーター](/developer-guide/account-abstraction#authenticators)のスコープを検証するための**パーミッションスキーマ**が含まれます。

| メソッド | エンドポイント                                              | 説明                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/abstractaccount/v1/config`                | モジュール設定（機能プローブ: `enabled`）        |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | アブストラクトアカウントを一覧表示                                |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | 指定アドレスのアブストラクトアカウントの状態（なければ `404`）                  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`、`permissions`、`msg_permissions`、`key_management_msgs`、`lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4**（テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から。それ以前のメインネットでは `501`）。リンク済みオーセンティケーター鍵が次に署名すべきシーケンス（`nonce`、`linked`） |

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` は、付与の有効期限がないことを意味します。v3.2.3 以降、ガバナンスはこれらのライセンスを付与するライセンス権限者を置き換えることができます（`MsgUpdateAuthority`）。すでに行われた付与はそのまま残ります。

## Light Node モジュール {#light-node-module}

| メソッド | エンドポイント                                      | 説明                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | 登録、ハートビート、報酬のパラメータ                      |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`、`total_active`、`total_rewards`、`last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | 登録済みのライトノードを一覧表示                                       |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | 1つのノード（未登録の場合は `{"node": null, "found": false}`）     |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | オペレーターアドレスに蓄積された報酬（`accumulated_rewards`） |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | 報酬プールの会計（`balance`、`reserved`、`outstanding`、`payable`、`distributable`、`max_reward_per_block_per_node`、`max_reward_per_month_per_node`、`initialized`） |

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
  "balance": "487231800",
  "reserved": "487231800",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000"
}
```

`reserved` はプールのうち留保されていて、ガバナンス投票でしか動かせない部分です。ノードごとの上限は `uqor` 単位です。`max_reward_per_block_per_node` はブロックごとの上限で、v3.2.3 以降は `max_reward_per_month_per_node`（`2000000000` uqor = 30 日あたり 2,000 QOR）が月ごとの上限となり、ブロック時間と稼働率に応じて按分されるため、ブロックの生成速度に左右されなくなりました。上限は約束された金額ではありません。サンプルは、ガバナンスが以前の準備金を解放した後（提案 8、2026年10月19日）の、本稿執筆時点の実際のメインネットのレスポンスです。v3.2.4 以降（テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から）は、レスポンスに `monthly_cap_active`、`last_distribution_time`、`last_distribution_height` も含まれ、ノードの上限はそのノード自身の登録時から始まります。

:::note 登録にはライセンスが必要です
チェーンは、有効な `lightnode_operator` ライセンスの付与がないライトノード登録を拒否します（`holders/lightnode_operator` で付与を一覧できます）。本稿執筆時点では、`stats` はメインネットで `"total_registered": "0"`、テストネットで登録済みノード1件を報告しています。プログラムの状況については[ライトノード](/light-node/overview)を参照してください。
:::

## RDK モジュール {#rdk-module}

Rollup Development Kit のクエリサービスは `/qorechain/rdk/v1/...` 配下の REST として公開されています（チェーンバージョン **v3.2.2** 以降。v3.2.0 と v3.2.1 では gRPC のみでした）。

| メソッド | エンドポイント                                              | 説明                                          |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | モジュールパラメータ                                    |
| GET    | `/qorechain/rdk/v1/rollups`                           | ロールアップを一覧表示                                        |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | 1つのロールアップ（不明な場合は `404`）                        |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | ロールアップの最新の決済バッチ                 |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | 1つの決済バッチ                                     |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | ロールアップのバッチをインデックス順に（ページネーション付き）      |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | 1つのデータアベイラビリティ blob レコード                    |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

本稿執筆時点では、両ネットワークとも `rollups` は空のリストであるため、ロールアップごとのルートは `404` で応答します（例: `{"code":5,"message":"rollup foo not found"}`）。`default_challenge_window` は秒単位で表されます（`604800`）。v3.2.4 以降、新たに送信されたバッチのオプティミスティックのチャレンジウィンドウはブロック時間で計測されます。テストネットではブロック高 8,337,253（2026年10月19日）から、メインネットではブロック高 3,742,566 からです。それまでは、メインネットは秒単位の値を 1 ブロックあたり 6 秒の固定でブロック数に換算します。

## Inflation モジュール {#inflation-module}

発行の設定と進捗は `/qorechain/inflation/v1/...` 配下の REST として公開されています（チェーンバージョン **v3.2.2** 以降）。CLI コマンドでは利用できません。

| メソッド | エンドポイント                              | 説明                                                                 |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | 発行パラメータ: `emission_mode`、`fixed_epoch_emission`、`max_total_emission`、`epoch_length`、`enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | 進捗: `current_epoch`、`block_start`、`next_epoch_height`、`total_minted`、`max_total_emission`、`remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

メインネットでは、`emission_mode` は `"fixed"`、`fixed_epoch_emission` は `"86000000000"`（1エポックあたり 86,000 QOR）、`epoch_length` は `"43200"` ブロック、`max_total_emission` は `"590000000000000"`（590,000,000 QOR、累積の上限）です。これらはガバナンス提案 10（2026年10月19日可決）で設定されました。新しい固定額を使用する最初のエポックはブロック 3,672,000 から始まり、`epoch_info` は進行中のエポックとこれまでにミントされた量を示します。レスポンス内の `schedule` リストは元の `schedule` モードに属するもので、固定モードのエポックがミントする量を表すものではありません。すべての金額は `uqor` 単位です。テストネットは、それとは異なる独自の値を報告します。v3.2.4 からは、3つ目のモード `target_apy` があり、`target_apy_bps` フィールドを持ちます（テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から）。ネットワークがこのモードに切り替わるのは、そのネットワーク自身のガバナンス投票によってのみです。そのため、そのような投票が可決されるまでメインネットは `fixed` のままです。テストネットは、本稿執筆時点で `"emission_mode": "fixed"` を報告しています。

## Gas Abstraction モジュール {#gas-abstraction-module}

| メソッド | エンドポイント                                              | 説明                                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | 受け入れ可能な手数料トークン、プレミアム、ブロックごとの変換上限                      |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | 手数料トークン1単位が `uqor` でいくらの価値か、および `usable` かどうか |
| GET    | `/qorechain/gasabstraction/v1/float`                  | 変換フロートのアドレス、残高、このブロックでの使用量             |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

受け入れリストには、両ネットワークともネイティブの `uqor` のみが含まれているため、手数料は `uqor` で支払われ、変換は行われません。ガバナンスはトークンを追加します（プール、最小流動性、時間加重価格とスポット価格の最大乖離とともに）。そのようなトークンで支払われた手数料は QOR フロートを通じて変換され、AMM プールを通じて補充されます。`?denom=` なしの `conversion_rate` は `500`（`denom is required`）で応答します。

## Staking Tiers モジュール（v3.2.4） {#stakingtier-module}

:::note v3.2.4 から利用可能
Staking Tiers モジュールは **v3.2.4** の一部です。これらのルートは、テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から提供されます（ガバナンス提案 13）。そのブロック高までは、メインネットのノードはこれらに `501` で応答します。
:::

| メソッド | エンドポイント                                  | 説明                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | ロックティア、最小ロック額、早期アンロックのペナルティ      |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | 保有者のロック、各ロックが現在どれだけ発生しているか、請求可能な額 |
| GET    | `/qorechain/stakingtier/v1/pool`          | ボーナスプール: 残高、未払い額、余剰、直近の決済 |

`params` は3つのロック期間（3、6、12 か月）とそのパラメータ、および `min_lock_amount`（`"10000000"` uqor、10 QOR）を列挙します。ロックは `tx stakingtier lock` で行います（[トランザクションコマンド](/cli-reference/transaction-commands#stakingtier)を参照）。

## gRPC 専用モジュール {#grpc-only-modules}

これらのモジュールには gRPC の `Query` サービスはありますが、**REST ルートはありません**。サービス名は `qorechain.<module>.v1.Query` の形式です。

| モジュール        | gRPC クエリメソッド（チェーンバージョン v3.2.3）              |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

自分のノードに対して `grpcurl` を使用するか、[CLI クエリコマンド](/cli-reference/query-commands)を使用してください。`rdk` のクエリは REST でも利用できます（[RDK モジュール](#rdk-module)を参照）。v3.2.2 より前は gRPC のみでした。

xQORE、BTC リステーキング（Babylon）、FairBlock の各モジュールには、現在のリリースではクエリサービス自体がなく、REST でも gRPC でも利用できません。v3.2.2 より前はクエリサービスがなかったインフレーションモジュールとガスアブストラクションモジュールは、REST で提供されています（[Inflation モジュール](#inflation-module)と [Gas Abstraction モジュール](#gas-abstraction-module)を参照）。

## 標準ルート {#standard-routes}

標準の Cosmos SDK、IBC、EVM、QoreChain Native の REST ルートも提供されています。両ネットワークで確認済みの例を示します。

| エンドポイント                                              | 説明                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | 総供給量                                  |
| `/cosmos/bank/v1beta1/balances/{address}`             | アカウント残高                              |
| `/cosmos/staking/v1beta1/validators`                  | バリデーター                                    |
| `/cosmos/staking/v1beta1/params`                      | ステーキングパラメータ                           |
| `/cosmos/distribution/v1beta1/params`                 | ディストリビューションパラメータ                       |
| `/cosmos/gov/v1/params/voting`                        | ガバナンスパラメータ                       |
| `/cosmos/slashing/v1beta1/params`                     | スラッシングパラメータ                       |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | 保留中 / 適用済みのアップグレード（メインネットでは `applied_plan/v3.2.3` が `{"height":"3662051"}` を返します） |
| `/cosmos/circuit/v1/disable_list`                     | ネットワーク全体で無効化されたメッセージタイプ       |
| `/cosmos/base/node/v1beta1/config`                    | ノードの最低ガス価格（両ネットワークで `0.1uqor`） |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | 最新ブロック                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | トランザクションの検索 / 参照 / ブロック別 |
| `/cosmos/evm/vm/v1/params`                            | EVM モジュールパラメータ                         |
| `/cosmos/evm/feemarket/v1/params`                     | EVM フィーマーケットパラメータ                     |
| `/cosmwasm/wasm/v1/codes/params`                      | QoreChain Native のアップロード/インスタンス化の権限       |
| `/ibc/apps/transfer/v1/params`                        | IBC 転送パラメータ                       |

QoreChain Native のプレフィックスは `/cosmwasm/wasm/v1/...` です。`/cosmos/wasm/v1/...` は提供されていません。

## gRPC リフレクション

自分で実行しているノードは、ポート `9090` で gRPC を提供します。サーバーリフレクションが有効な場合、`grpcurl` などのツールで利用可能なサービスを検出できます。

```bash
grpcurl -plaintext localhost:9090 list
```

特定のサービスをクエリするには次のようにします。

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` にはv3.2.3 のノードで `Account`、`EVMWindow`、`EVMDelegationConsent` の3つのメソッドがあり、v3.2.4 から（テストネットでは 2026年10月19日から、メインネットではブロック高 3,742,566 から）4つ目の `ProtocolFeatures` があります。`Params` メソッドはありません。

## 認証

すべての REST および gRPC エンドポイントは、デフォルトでは認証なしでアクセスできます。本番環境にデプロイする場合は、ノードの前段にリバースプロキシ（Nginx や Caddy など）を配置し、TLS 終端とアクセス制御を行ってください。
