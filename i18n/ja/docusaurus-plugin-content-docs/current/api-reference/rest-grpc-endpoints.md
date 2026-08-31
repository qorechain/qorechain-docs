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
| REST      | `1317`       | HTTP/1.1  | LCD (Light Client Daemon) REST API |
| gRPC      | `9090`       | HTTP/2    | Protobuf エンコードの gRPC サービス      |
| RPC       | `26657`      | HTTP + WS | QoreChain コンセンサスエンジン RPC     |

すべての REST エンドポイントは JSON を返します。gRPC エンドポイントは Protocol Buffers を使用し、任意の gRPC クライアントで利用できます。RPC インターフェースはコンセンサスレベルのクエリとトランザクションのブロードキャストを提供します。

:::note
これらのインターフェースは、**`qorechain-vladi`** メインネット（2026年6月7日よりチェーンバージョン **v3.1.95** で稼働中）と **`qorechain-diana`** テストネットの両方で利用できます。以下のベース URL はローカルで実行中のノードを前提としています。公開ホスト型エンドポイント（`rpc/api/evm/svm.qore.host` およびその `-testnet` バリアント）については [ネットワーク](/appendix/networks#public-endpoints) を参照してください。
:::

## ベース URL

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI モジュール

| メソッド | エンドポイント                           | 説明                                        |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | 現在の AI モジュール設定を返す            |
| GET    | `/ai/v1/stats`                     | AI 処理の集計統計                |
| GET    | `/ai/v1/fee-estimate`              | トランザクションの AI 支援によるガス手数料見積もり   |
| GET    | `/ai/v1/fraud/investigations`      | すべてのアクティブな不正調査の一覧              |
| GET    | `/ai/v1/fraud/investigations/{id}` | 特定の不正調査の詳細を返す |
| GET    | `/ai/v1/network/recommendations`   | AI が生成するネットワーク最適化の推奨事項  |
| GET    | `/ai/v1/circuit-breakers`          | 現在のサーキットブレーカーの状態としきい値      |

## Bridge モジュール {#bridge-module}

チェーンバージョン **v3.1.77** 以降、Bridge モジュールの読み取り専用ステートは grpc-gateway 経由で `/qorechain/bridge/v1/...` プレフィックス配下の REST として公開されています（以前は gRPC 専用でした）。これらのエンドポイントは、エクスプローラーやライトノードのテレメトリ向けに、実際のオンチェーン JSON を HTTP 経由で提供します。Bridge の `config` は例えば `min_validators=10` や `threshold=7` を報告します。

| メソッド | エンドポイント                                   | 説明                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | 現在の Bridge モジュール設定      |
| GET    | `/qorechain/bridge/v1/chains`              | 登録済みのブリッジチェーンをすべて一覧表示       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | 特定のブリッジ済みチェーンの詳細     |
| GET    | `/qorechain/bridge/v1/validators`          | 登録済みのブリッジバリデーターを一覧表示       |
| GET    | `/qorechain/bridge/v1/validators/{address}`| 特定のブリッジバリデーターの詳細  |
| GET    | `/qorechain/bridge/v1/operations`          | ブリッジ操作を一覧表示                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | 特定のブリッジ操作の詳細  |

以下の短縮パスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                            | 説明                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | 登録済みのブリッジチェーンをすべて一覧表示             |
| GET    | `/bridge/v1/chains/{id}`            | 特定のブリッジ済みチェーンの詳細           |
| GET    | `/bridge/v1/validators`             | アクティブなブリッジバリデーターを一覧表示                 |
| GET    | `/bridge/v1/operations`             | 最近のブリッジ操作を一覧表示                 |
| GET    | `/bridge/v1/operations/{id}`        | 特定のブリッジ操作の詳細        |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | チェーン/アセットのペアごとのロック済み総額      |
| GET    | `/bridge/v1/limits/{chain}`         | ブリッジ済みチェーンのレート制限としきい値 |
| GET    | `/bridge/v1/estimate`               | ブリッジ手数料と転送時間を見積もる             |

## PQC モジュール

| メソッド | エンドポイント                     | 説明                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | 現在の PQC モジュールパラメータ                  |
| GET    | `/pqc/v1/accounts/{address}` | 特定のアカウントの PQC 鍵ステータス          |
| GET    | `/pqc/v1/stats`              | PQC の登録・移行に関する集計統計 |

## Reputation モジュール

| メソッド | エンドポイント                              | 説明                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | すべてのバリデーターの評判スコア      |
| GET    | `/reputation/v1/validators/{address}` | 特定のバリデーターの評判スコア |

## Cross-VM モジュール

| メソッド | エンドポイント                   | 説明                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | ID で Cross-VM メッセージを取得       |
| GET    | `/crossvm/v1/pending`      | キュー内の保留中の Cross-VM メッセージを一覧表示 |
| GET    | `/crossvm/v1/params`       | 現在の Cross-VM モジュールパラメータ       |

## Multilayer モジュール {#multilayer-module}

チェーンバージョン **v3.1.80** 以降、Multilayer モジュールの完全なクエリサービスは grpc-gateway 経由で `/qorechain/multilayer/v1/...` プレフィックス配下の REST として公開されています（以前は gRPC 専用でした）。これには2つの**ステートアンカー読み取りクエリ**が含まれます。`anchor/{layer_id}` はレイヤーの最新の決済アンカーを返し、`anchors/{layer_id}` はそのアンカー履歴を返します。各アンカーには、その正規化されたフィールドに対する **ML-DSA-87 (Dilithium-5)** 署名が付与されているため、クライアントはアンカーを取得して独立に検証できます。これが Rollup Development Kit の[決済レシート](/rollups/settlement-receipts)のオンチェーンでの基盤となっています。

| メソッド | エンドポイント                                        | 説明                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | 現在の Multilayer モジュールパラメータ              |
| GET    | `/qorechain/multilayer/v1/layers`               | 登録済みのレイヤーをすべて一覧表示                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | 特定のレイヤーの詳細                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | レイヤーの最新のステートアンカー                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | レイヤーのステートアンカー履歴                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | レイヤー間のトランザクションルーティング統計      |

`StateAnchorView` には `layer_id`、`layer_height`、`state_root`、`validator_set_hash`、`main_chain_height`、`anchored_at`、`pqc_aggregate_signature`、`transaction_count`、`compressed_state_proof` が含まれます。署名対象の正規化メッセージは `layer_id || layer_height || state_root || validator_set_hash` であり、レイヤー作成者の登録済み PQC 鍵に対して検証されます。

以下の短縮パスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                       | 説明                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | 特定のレイヤーの詳細                 |
| GET    | `/multilayer/v1/layers`        | 登録済みのレイヤーをすべて一覧表示                  |
| GET    | `/multilayer/v1/anchor/{id}`   | 特定のアンカーレコードの詳細         |
| GET    | `/multilayer/v1/anchors`       | 最近のアンカー提出を一覧表示              |
| GET    | `/multilayer/v1/routing-stats` | レイヤー間のトランザクションルーティング統計 |
| GET    | `/multilayer/v1/params`        | 現在の Multilayer モジュールパラメータ         |

## SVM モジュール

| メソッド | エンドポイント                    | 説明                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | 現在の SVM モジュールパラメータ                     |
| GET    | `/svm/v1/account/{address}` | 指定アドレスの SVM アカウント情報              |
| GET    | `/svm/v1/program/{address}` | 指定プログラムアドレスのデプロイ済みプログラム情報 |

## RL Consensus モジュール

PRISM のチューニングパラメータと強化学習エージェントの状態が、このモジュールを通じて公開されています。

| メソッド | エンドポイント                      | 説明                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | 現在の PRISM エージェントのステータスとモード     |
| GET    | `/rlconsensus/v1/observation` | 最新の観測ベクトル               |
| GET    | `/rlconsensus/v1/rewards`     | 累積報酬指標               |
| GET    | `/rlconsensus/v1/params`      | 現在の PRISM Consensus モジュールパラメータ |
| GET    | `/rlconsensus/v1/policy`      | 現在のポリシー設定と重み |

## Burn モジュール

チェーンバージョン **v3.1.77** 以降、Burn モジュールの読み取り専用ステートは grpc-gateway 経由で `/qorechain/burn/v1/...` プレフィックス配下の REST として公開されています（以前は gRPC 専用でした）。これらのエンドポイントは、エクスプローラーやライトノードのテレメトリ向けに、実際のオンチェーン JSON を HTTP 経由で提供します。Burn の `stats` には例えば `gas_burn_rate=0.30` が含まれます。

| メソッド | エンドポイント                       | 説明                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | 現在の Burn モジュールパラメータ       |
| GET    | `/qorechain/burn/v1/stats`     | すべてのチャネルにおける Burn 統計  |
| GET    | `/qorechain/burn/v1/records`   | Burn レコードを一覧表示                   |
| GET    | `/qorechain/burn/v1/milestone` | Burn マイルストーンの進捗             |

以下の短縮パスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント          | 説明                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | すべてのチャネルにおける Burn 統計 |
| GET    | `/burn/v1/params` | 現在の Burn モジュールパラメータ      |

## xQORE モジュール

| メソッド | エンドポイント                       | 説明                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | 指定アドレスの xQORE ステーキングポジション |
| GET    | `/xqore/v1/params`             | 現在の xQORE モジュールパラメータ            |

## Inflation モジュール

| メソッド | エンドポイント               | 説明                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | 現在の年率インフレ率   |
| GET    | `/inflation/v1/epoch`  | 現在のエポック番号と進捗   |
| GET    | `/inflation/v1/params` | 現在の Inflation モジュールパラメータ |

## RDK モジュール

| メソッド | エンドポイント                     | 説明                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | 特定のロールアップの詳細         |
| GET    | `/rdk/v1/rollups`            | 登録済みのロールアップをすべて一覧表示          |
| GET    | `/rdk/v1/batch/{id}/{index}` | 特定の決済バッチを取得 |
| GET    | `/rdk/v1/batches/{id}`       | 特定のロールアップのバッチを一覧表示   |
| GET    | `/rdk/v1/blob/{id}/{index}`  | 特定の DA ブロブを取得          |
| GET    | `/rdk/v1/params`             | 現在の RDK モジュールパラメータ         |

## Babylon モジュール

| メソッド | エンドポイント                         | 説明                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | 指定アドレスの BTC ステーキングポジション |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 指定エポックの BTC チェックポイントデータ    |
| GET    | `/babylon/v1/params`             | 現在の Babylon モジュールパラメータ        |

## Abstract Account モジュール

チェーンバージョン **v3.1.85** 以降、Abstract Account のクエリサービスは grpc-gateway 経由で `/qorechain/abstractaccount/v1/...` プレフィックス配下の REST として公開されており、これにはハードコーディングなしで[オーセンティケーター](/developer-guide/account-abstraction#authenticators)のスコープを検証するための**パーミッションスキーマ**が含まれます。

| メソッド | エンドポイント                                              | 説明                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/abstractaccount/v1/config`                | モジュール設定（機能プローブ: `enabled`）        |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | アブストラクトアカウントを一覧表示                                |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | 指定アドレスのアブストラクトアカウントの状態                  |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | パーミッションタクソノミー、メッセージ→パーミッションのマップ、委任不可のメッセージ |

以下の短縮パスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                                | 説明                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | 指定アドレスのアブストラクトアカウント詳細 |
| GET    | `/abstractaccount/v1/params`            | 現在の Abstract Account モジュールパラメータ   |

## FairBlock モジュール

| メソッド | エンドポイント               | 説明                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | 現在の FairBlock 暗号化設定 |
| GET    | `/fairblock/v1/params` | 現在の FairBlock モジュールパラメータ        |

## Gas Abstraction モジュール

| メソッド | エンドポイント                             | 説明                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | ガス支払いに使用できるトークンを一覧表示     |
| GET    | `/gasabstraction/v1/params`          | 現在の Gas Abstraction モジュールパラメータ |

## gRPC リフレクション

gRPC サーバーリフレクションはデフォルトで有効になっており、`grpcurl` などのツールで利用可能なサービスを検出できます。

```bash
grpcurl -plaintext localhost:9090 list
```

特定のサービスをクエリするには次のようにします。

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## 認証

すべての REST および gRPC エンドポイントは、デフォルトでは認証なしでアクセスできます。本番環境にデプロイする場合は、ノードの前段にリバースプロキシ（Nginx や Caddy など）を配置し、TLS 終端とアクセス制御を行ってください。
