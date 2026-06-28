---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC エンドポイント
sidebar_label: REST / gRPC エンドポイント
sidebar_position: 1
---

# REST / gRPC エンドポイント

QoreChain は、プログラムによるアクセスのために 3 つの主要なインターフェースを公開しています。

| インターフェース | デフォルトポート | プロトコル  | 説明                                       |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | LCD（Light Client Daemon）REST API |
| gRPC      | `9090`       | HTTP/2    | Protobuf エンコードの gRPC サービス      |
| RPC       | `26657`      | HTTP + WS | QoreChain コンセンサスエンジン RPC     |

すべての REST エンドポイントは JSON を返します。gRPC エンドポイントは Protocol Buffers を使用し、任意の gRPC クライアントから利用できます。RPC インターフェースは、コンセンサスレベルのクエリとトランザクションのブロードキャストを提供します。

:::note
これらのインターフェースは、**`qorechain-vladi`** メインネット（チェインバージョン **v3.1.80** で 2026 年 6 月 7 日からライブ稼働中）と **`qorechain-diana`** テストネットの両方で利用できます。以下のベース URL はローカルで稼働しているノードを前提としています。リモートアクセスの場合は、プロバイダーのメインネットまたはテストネットのホストに置き換えてください。
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
| GET    | `/ai/v1/config`                    | 現在の AI モジュール設定を返します            |
| GET    | `/ai/v1/stats`                     | 集計された AI 処理統計                |
| GET    | `/ai/v1/fee-estimate`              | トランザクションに対する AI 支援ガス手数料見積もり   |
| GET    | `/ai/v1/fraud/investigations`      | アクティブな不正調査をすべて一覧表示します              |
| GET    | `/ai/v1/fraud/investigations/{id}` | 特定の不正調査の詳細を返します |
| GET    | `/ai/v1/network/recommendations`   | AI が生成したネットワーク最適化の推奨事項  |
| GET    | `/ai/v1/circuit-breakers`          | 現在のサーキットブレーカーの状態としきい値      |

## Bridge モジュール {#bridge-module}

チェインバージョン **v3.1.77** より、bridge モジュールの読み取り専用ステートは、`/qorechain/bridge/v1/...` プレフィックスの下で grpc-gateway 経由の REST で公開されます（以前は gRPC のみ）。これらのエンドポイントは、エクスプローラーやライトノードのテレメトリ向けに、実際のオンチェイン JSON を HTTP で配信します。bridge の `config` は、たとえば `min_validators=10` および `threshold=7` を報告します。

| メソッド | エンドポイント                                   | 説明                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | 現在の bridge モジュール設定      |
| GET    | `/qorechain/bridge/v1/chains`              | 登録済みのブリッジチェインをすべて一覧表示します       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | 特定のブリッジチェインの詳細     |
| GET    | `/qorechain/bridge/v1/validators`          | 登録済みのブリッジバリデーターを一覧表示します       |
| GET    | `/qorechain/bridge/v1/validators/{address}`| 特定のブリッジバリデーターの詳細  |
| GET    | `/qorechain/bridge/v1/operations`          | ブリッジ操作を一覧表示します                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | 特定のブリッジ操作の詳細  |

以下のより短いパスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                            | 説明                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | 登録済みのブリッジチェインをすべて一覧表示します             |
| GET    | `/bridge/v1/chains/{id}`            | 特定のブリッジチェインの詳細           |
| GET    | `/bridge/v1/validators`             | アクティブなブリッジバリデーターを一覧表示します                 |
| GET    | `/bridge/v1/operations`             | 最近のブリッジ操作を一覧表示します                 |
| GET    | `/bridge/v1/operations/{id}`        | 特定のブリッジ操作の詳細        |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | チェイン/アセットのペアにおけるロック済み総額      |
| GET    | `/bridge/v1/limits/{chain}`         | ブリッジチェインのレート制限としきい値 |
| GET    | `/bridge/v1/estimate`               | ブリッジ手数料と転送時間を見積もります         |

## PQC モジュール

| メソッド | エンドポイント                     | 説明                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | 現在の PQC モジュールパラメータ                  |
| GET    | `/pqc/v1/accounts/{address}` | 特定アカウントの PQC キーステータス          |
| GET    | `/pqc/v1/stats`              | PQC 登録および移行の集計統計 |

## Reputation モジュール

| メソッド | エンドポイント                              | 説明                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | すべてのバリデーターのレピュテーションスコア      |
| GET    | `/reputation/v1/validators/{address}` | 特定バリデーターのレピュテーションスコア |

## Cross-VM モジュール

| メソッド | エンドポイント                   | 説明                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | ID によるクロス VM メッセージの取得       |
| GET    | `/crossvm/v1/pending`      | キュー内の保留中クロス VM メッセージを一覧表示します |
| GET    | `/crossvm/v1/params`       | 現在の Cross-VM モジュールパラメータ       |

## Multilayer モジュール {#multilayer-module}

チェインバージョン **v3.1.80** より、multilayer モジュールの完全なクエリサービスは、`/qorechain/multilayer/v1/...` プレフィックスの下で grpc-gateway 経由の REST で公開されます（以前は gRPC のみ）。これには 2 つの**ステートアンカー読み取りクエリ**が含まれます。`anchor/{layer_id}` はレイヤーの最新の決済アンカーを返し、`anchors/{layer_id}` はそのアンカー履歴を返します。各アンカーは、その正規フィールドに対する **ML-DSA-87（Dilithium-5）** 署名を保持しているため、クライアントはアンカーを取得して独立して検証できます。これは Rollup Development Kit の[決済レシート](/rollups/settlement-receipts)のオンチェイン基盤です。

| メソッド | エンドポイント                                        | 説明                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | 現在の Multilayer モジュールパラメータ              |
| GET    | `/qorechain/multilayer/v1/layers`               | 登録済みのレイヤーをすべて一覧表示します                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | 特定レイヤーの詳細                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | レイヤーの最新ステートアンカー                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | レイヤーのステートアンカー履歴                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | レイヤー間のトランザクションルーティング統計      |

`StateAnchorView` には、`layer_id`、`layer_height`、`state_root`、`validator_set_hash`、`main_chain_height`、`anchored_at`、`pqc_aggregate_signature`、`transaction_count`、および `compressed_state_proof` が含まれます。署名される正規メッセージは `layer_id || layer_height || state_root || validator_set_hash` であり、レイヤー作成者の登録済み PQC キーに対して検証されます。

以下のより短いパスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                       | 説明                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | 特定レイヤーの詳細                 |
| GET    | `/multilayer/v1/layers`        | 登録済みのレイヤーをすべて一覧表示します                  |
| GET    | `/multilayer/v1/anchor/{id}`   | 特定アンカーレコードの詳細         |
| GET    | `/multilayer/v1/anchors`       | 最近のアンカー送信を一覧表示します              |
| GET    | `/multilayer/v1/routing-stats` | レイヤー間のトランザクションルーティング統計 |
| GET    | `/multilayer/v1/params`        | 現在の Multilayer モジュールパラメータ        |

## SVM モジュール

| メソッド | エンドポイント                    | 説明                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | 現在の SVM モジュールパラメータ                     |
| GET    | `/svm/v1/account/{address}` | 指定アドレスの SVM アカウント情報              |
| GET    | `/svm/v1/program/{address}` | 指定プログラムアドレスのデプロイ済みプログラム情報 |

## RL Consensus モジュール

PRISM のチューニングパラメータと強化学習エージェントのステートは、このモジュールを通じて公開されます。

| メソッド | エンドポイント                      | 説明                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | 現在の PRISM エージェントのステータスとモード     |
| GET    | `/rlconsensus/v1/observation` | 最新の観測ベクトル               |
| GET    | `/rlconsensus/v1/rewards`     | 累積報酬メトリクス               |
| GET    | `/rlconsensus/v1/params`      | 現在の PRISM Consensus モジュールパラメータ |
| GET    | `/rlconsensus/v1/policy`      | アクティブなポリシー設定と重み |

## Burn モジュール

チェインバージョン **v3.1.77** より、burn モジュールの読み取り専用ステートは、`/qorechain/burn/v1/...` プレフィックスの下で grpc-gateway 経由の REST で公開されます（以前は gRPC のみ）。これらのエンドポイントは、エクスプローラーやライトノードのテレメトリ向けに、実際のオンチェイン JSON を HTTP で配信します。burn の `stats` には、たとえば `gas_burn_rate=0.30` が含まれます。

| メソッド | エンドポイント                       | 説明                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | 現在の Burn モジュールパラメータ       |
| GET    | `/qorechain/burn/v1/stats`     | 全チャネルにわたる burn 統計  |
| GET    | `/qorechain/burn/v1/records`   | burn レコードを一覧表示します                   |
| GET    | `/qorechain/burn/v1/milestone` | burn マイルストーンの進捗             |

以下のより短いパスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント          | 説明                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | 全チャネルにわたる burn 統計 |
| GET    | `/burn/v1/params` | 現在の Burn モジュールパラメータ      |

## xQORE モジュール

| メソッド | エンドポイント                       | 説明                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | 指定アドレスの xQORE ステーキングポジション |
| GET    | `/xqore/v1/params`             | 現在の xQORE モジュールパラメータ            |

## Inflation モジュール

| メソッド | エンドポイント               | 説明                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | 現在の年率換算インフレーション率   |
| GET    | `/inflation/v1/epoch`  | 現在のエポック番号と進捗   |
| GET    | `/inflation/v1/params` | 現在の Inflation モジュールパラメータ |

## RDK モジュール

| メソッド | エンドポイント                     | 説明                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | 特定ロールアップの詳細         |
| GET    | `/rdk/v1/rollups`            | 登録済みのロールアップをすべて一覧表示します          |
| GET    | `/rdk/v1/batch/{id}/{index}` | 特定の決済バッチの取得 |
| GET    | `/rdk/v1/batches/{id}`       | 特定ロールアップのバッチを一覧表示します   |
| GET    | `/rdk/v1/blob/{id}/{index}`  | 特定の DA ブロブの取得          |
| GET    | `/rdk/v1/params`             | 現在の RDK モジュールパラメータ         |

## Babylon モジュール

| メソッド | エンドポイント                         | 説明                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | 指定アドレスの BTC ステーキングポジション |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 指定エポックの BTC チェックポイントデータ    |
| GET    | `/babylon/v1/params`             | 現在の Babylon モジュールパラメータ        |

## Abstract Account モジュール

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
| GET    | `/gasabstraction/v1/accepted-tokens` | ガス支払いに受け入れられるトークンを一覧表示します     |
| GET    | `/gasabstraction/v1/params`          | 現在の Gas Abstraction モジュールパラメータ |

## gRPC リフレクション

gRPC サーバーリフレクションはデフォルトで有効になっており、`grpcurl` などのツールが利用可能なサービスを検出できます。

```bash
grpcurl -plaintext localhost:9090 list
```

特定のサービスをクエリするには次のようにします。

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## 認証

すべての REST および gRPC エンドポイントは、デフォルトでは認証されていません。本番環境のデプロイでは、TLS 終端とアクセス制御を処理するために、ノードの前段にリバースプロキシ（例: Nginx や Caddy）を配置してください。
