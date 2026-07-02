---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC エンドポイント
sidebar_label: REST / gRPC エンドポイント
sidebar_position: 1
---

# REST / gRPC エンドポイント

QoreChain は、プログラムからアクセスするための 3 つの主要インターフェースを公開しています。

| インターフェース | デフォルトポート | プロトコル | 説明                                   |
| --------- | ------------ | --------- | ---------------------------------- |
| REST      | `1317`       | HTTP/1.1  | LCD (Light Client Daemon) REST API |
| gRPC      | `9090`       | HTTP/2    | Protobuf エンコードの gRPC サービス      |
| RPC       | `26657`      | HTTP + WS | QoreChain コンセンサスエンジン RPC       |

すべての REST エンドポイントは JSON を返します。gRPC エンドポイントは Protocol Buffers を使用しており、任意の gRPC クライアントから利用できます。RPC インターフェースは、コンセンサスレベルのクエリとトランザクションのブロードキャストを提供します。

:::note
これらのインターフェースは、**`qorechain-vladi`** メインネット（2026 年 6 月 7 日よりチェーンバージョン **v3.1.82** で稼働中）と **`qorechain-diana`** テストネットの両方で利用できます。以下のベース URL はローカルで稼働しているノードを前提としています。公開ホスト済みエンドポイント（`rpc/api/evm/svm.qore.host` およびその `-testnet` バリアント）は [ネットワーク](/appendix/networks#public-endpoints) に一覧があります。
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
| GET    | `/ai/v1/stats`                     | AI 処理の集計統計                |
| GET    | `/ai/v1/fee-estimate`              | トランザクションに対する AI 支援型ガス手数料の見積もり   |
| GET    | `/ai/v1/fraud/investigations`      | アクティブな不正調査をすべて一覧表示します              |
| GET    | `/ai/v1/fraud/investigations/{id}` | 特定の不正調査の詳細を返します |
| GET    | `/ai/v1/network/recommendations`   | AI が生成したネットワーク最適化の推奨事項  |
| GET    | `/ai/v1/circuit-breakers`          | 現在のサーキットブレーカーの状態としきい値      |

## ブリッジモジュール {#bridge-module}

チェーンバージョン **v3.1.77** 以降、ブリッジモジュールの読み取り専用ステートは、grpc-gateway 経由で `/qorechain/bridge/v1/...` プレフィックスの下に REST として公開されています（従来は gRPC のみ）。これらのエンドポイントは、エクスプローラーやライトノードのテレメトリ向けに、実際のオンチェーン JSON を HTTP 経由で提供します。ブリッジの `config` は、例えば `min_validators=10` および `threshold=7` を報告します。

| メソッド | エンドポイント                                   | 説明                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | 現在のブリッジモジュール設定      |
| GET    | `/qorechain/bridge/v1/chains`              | 登録済みのすべてのブリッジチェーンを一覧表示します       |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | 特定のブリッジ済みチェーンの詳細     |
| GET    | `/qorechain/bridge/v1/validators`          | 登録済みのブリッジバリデーターを一覧表示します       |
| GET    | `/qorechain/bridge/v1/validators/{address}`| 特定のブリッジバリデーターの詳細  |
| GET    | `/qorechain/bridge/v1/operations`          | ブリッジオペレーションを一覧表示します                  |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | 特定のブリッジオペレーションの詳細  |

以下の短いパスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                            | 説明                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | 登録済みのすべてのブリッジチェーンを一覧表示します             |
| GET    | `/bridge/v1/chains/{id}`            | 特定のブリッジ済みチェーンの詳細           |
| GET    | `/bridge/v1/validators`             | アクティブなブリッジバリデーターを一覧表示します                 |
| GET    | `/bridge/v1/operations`             | 最近のブリッジオペレーションを一覧表示します                 |
| GET    | `/bridge/v1/operations/{id}`        | 特定のブリッジオペレーションの詳細        |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | チェーン/アセットのペアに対するロック済み総額      |
| GET    | `/bridge/v1/limits/{chain}`         | ブリッジ済みチェーンのレートリミットとしきい値 |
| GET    | `/bridge/v1/estimate`               | ブリッジ手数料と転送時間を見積もります         |

## PQC モジュール

| メソッド | エンドポイント                     | 説明                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | 現在の PQC モジュールパラメータ                  |
| GET    | `/pqc/v1/accounts/{address}` | 特定のアカウントの PQC キーの状態          |
| GET    | `/pqc/v1/stats`              | PQC の登録および移行の集計統計 |

## レピュテーションモジュール

| メソッド | エンドポイント                              | 説明                               |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | すべてのバリデーターのレピュテーションスコア      |
| GET    | `/reputation/v1/validators/{address}` | 特定のバリデーターのレピュテーションスコア |

## Cross-VM モジュール

| メソッド | エンドポイント                   | 説明                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | ID を指定してクロス VM メッセージを取得します       |
| GET    | `/crossvm/v1/pending`      | キュー内の保留中のクロス VM メッセージを一覧表示します |
| GET    | `/crossvm/v1/params`       | 現在の Cross-VM モジュールパラメータ       |

## マルチレイヤーモジュール {#multilayer-module}

チェーンバージョン **v3.1.80** 以降、マルチレイヤーモジュールのクエリサービス全体が、grpc-gateway 経由で `/qorechain/multilayer/v1/...` プレフィックスの下に REST として公開されています（従来は gRPC のみ）。これには 2 つの**ステートアンカー読み取りクエリ**が含まれます。`anchor/{layer_id}` はレイヤーの最新のセトルメントアンカーを返し、`anchors/{layer_id}` はそのアンカー履歴を返します。各アンカーは、その正規フィールドに対する **ML-DSA-87 (Dilithium-5)** 署名を保持しているため、クライアントはアンカーを取得して独立に検証できます。これが Rollup Development Kit の[セトルメントレシート](/rollups/settlement-receipts)のオンチェーン上の基盤です。

| メソッド | エンドポイント                                        | 説明                                       |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | 現在の Multilayer モジュールパラメータ              |
| GET    | `/qorechain/multilayer/v1/layers`               | 登録済みのすべてのレイヤーを一覧表示します                       |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | 特定のレイヤーの詳細                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | レイヤーの最新ステートアンカー                   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | レイヤーのステートアンカー履歴                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | レイヤー横断のトランザクションルーティング統計      |

`StateAnchorView` には `layer_id`、`layer_height`、`state_root`、`validator_set_hash`、`main_chain_height`、`anchored_at`、`pqc_aggregate_signature`、`transaction_count`、`compressed_state_proof` が含まれます。署名対象の正規メッセージは `layer_id || layer_height || state_root || validator_set_hash` であり、レイヤー作成者の登録済み PQC キーに対して検証されます。

以下の短いパスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント                       | 説明                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | 特定のレイヤーの詳細                 |
| GET    | `/multilayer/v1/layers`        | 登録済みのすべてのレイヤーを一覧表示します                  |
| GET    | `/multilayer/v1/anchor/{id}`   | 特定のアンカーレコードの詳細         |
| GET    | `/multilayer/v1/anchors`       | 最近のアンカー提出を一覧表示します              |
| GET    | `/multilayer/v1/routing-stats` | レイヤー横断のトランザクションルーティング統計 |
| GET    | `/multilayer/v1/params`        | 現在の Multilayer モジュールパラメータ         |

## SVM モジュール

| メソッド | エンドポイント                    | 説明                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | 現在の SVM モジュールパラメータ                     |
| GET    | `/svm/v1/account/{address}` | 指定アドレスの SVM アカウント情報              |
| GET    | `/svm/v1/program/{address}` | 指定プログラムアドレスのデプロイ済みプログラム情報 |

## RL コンセンサスモジュール

PRISM のチューニングパラメータと強化学習エージェントの状態は、このモジュールを通じて公開されます。

| メソッド | エンドポイント                      | 説明                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | 現在の PRISM エージェントの状態とモード     |
| GET    | `/rlconsensus/v1/observation` | 最新の観測ベクトル               |
| GET    | `/rlconsensus/v1/rewards`     | 累積報酬メトリクス               |
| GET    | `/rlconsensus/v1/params`      | 現在の PRISM Consensus モジュールパラメータ |
| GET    | `/rlconsensus/v1/policy`      | アクティブなポリシー設定と重み |

## バーンモジュール

チェーンバージョン **v3.1.77** 以降、バーンモジュールの読み取り専用ステートは、grpc-gateway 経由で `/qorechain/burn/v1/...` プレフィックスの下に REST として公開されています（従来は gRPC のみ）。これらのエンドポイントは、エクスプローラーやライトノードのテレメトリ向けに、実際のオンチェーン JSON を HTTP 経由で提供します。バーンの `stats` には、例えば `gas_burn_rate=0.30` が含まれます。

| メソッド | エンドポイント                       | 説明                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | 現在の Burn モジュールパラメータ       |
| GET    | `/qorechain/burn/v1/stats`     | 全チャネル横断のバーン統計  |
| GET    | `/qorechain/burn/v1/records`   | バーンレコードを一覧表示します                   |
| GET    | `/qorechain/burn/v1/milestone` | バーンマイルストーンの進捗             |

以下の短いパスのエンドポイントも引き続き利用できます。

| メソッド | エンドポイント          | 説明                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | 全チャネル横断のバーン統計 |
| GET    | `/burn/v1/params` | 現在の Burn モジュールパラメータ      |

## xQORE モジュール

| メソッド | エンドポイント                       | 説明                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | 指定アドレスの xQORE ステーキングポジション |
| GET    | `/xqore/v1/params`             | 現在の xQORE モジュールパラメータ            |

## インフレーションモジュール

| メソッド | エンドポイント               | 説明                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | 現在の年率換算インフレーション率   |
| GET    | `/inflation/v1/epoch`  | 現在のエポック番号と進捗   |
| GET    | `/inflation/v1/params` | 現在の Inflation モジュールパラメータ |

## RDK モジュール

| メソッド | エンドポイント                     | 説明                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | 特定のロールアップの詳細         |
| GET    | `/rdk/v1/rollups`            | 登録済みのすべてのロールアップを一覧表示します          |
| GET    | `/rdk/v1/batch/{id}/{index}` | 特定のセトルメントバッチを取得します |
| GET    | `/rdk/v1/batches/{id}`       | 特定のロールアップのバッチを一覧表示します   |
| GET    | `/rdk/v1/blob/{id}/{index}`  | 特定の DA ブロブを取得します          |
| GET    | `/rdk/v1/params`             | 現在の RDK モジュールパラメータ         |

## Babylon モジュール

| メソッド | エンドポイント                         | 説明                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | 指定アドレスの BTC ステーキングポジション |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 指定エポックの BTC チェックポイントデータ    |
| GET    | `/babylon/v1/params`             | 現在の Babylon モジュールパラメータ        |

## 抽象アカウントモジュール

| メソッド | エンドポイント                                | 説明                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | 指定アドレスの抽象アカウントの詳細 |
| GET    | `/abstractaccount/v1/params`            | 現在の Abstract Account モジュールパラメータ   |

## FairBlock モジュール

| メソッド | エンドポイント               | 説明                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | 現在の FairBlock 暗号化設定 |
| GET    | `/fairblock/v1/params` | 現在の FairBlock モジュールパラメータ        |

## ガス抽象化モジュール

| メソッド | エンドポイント                             | 説明                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | ガス支払いに利用できるトークンを一覧表示します     |
| GET    | `/gasabstraction/v1/params`          | 現在の Gas Abstraction モジュールパラメータ |

## gRPC リフレクション

gRPC サーバーリフレクションはデフォルトで有効になっており、`grpcurl` などのツールで利用可能なサービスを検出できます。

```bash
grpcurl -plaintext localhost:9090 list
```

特定のサービスにクエリするには次のようにします。

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## 認証

すべての REST および gRPC エンドポイントは、デフォルトでは認証なしです。本番環境へのデプロイでは、ノードの前段にリバースプロキシ（例: Nginx や Caddy）を配置して、TLS 終端とアクセス制御を処理してください。
