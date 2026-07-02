---
slug: /cli-reference/query-commands
title: クエリコマンド
sidebar_label: クエリコマンド
sidebar_position: 3
---

# クエリコマンド

すべてのクエリコマンドは次のパターンに従います:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
クエリは `--node` が指す任意のノードに対して実行されます。ライブデータには **`qorechain-vladi`** メインネット RPC エンドポイント (チェーンバージョン **v3.1.82**) を使用し、テスト用には **`qorechain-diana`** テストネットエンドポイントを使用してください。デフォルトの `tcp://localhost:26657` は、自分で実行するノードを対象とします。
:::

共通フラグはすべての `query` サブコマンドに適用されます:

| フラグ     | 型     | 説明                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC エンドポイント (デフォルト: `tcp://localhost:26657`) |
| `--output` | string | 出力形式: `json` または `text`                 |
| `--height` | int    | 特定のブロックの高さで状態をクエリする          |

---

## bank

### balances

アカウントのすべての残高をクエリします。

```bash
qorechaind query bank balances <address>
```

### total

すべてのトークンの総供給量をクエリします。

```bash
qorechaind query bank total
```

---

## staking

### validator

オペレーターアドレスで単一のバリデーターをクエリします。

```bash
qorechaind query staking validator <validator_address>
```

### validators

すべてのバリデーターを一覧表示します。

```bash
qorechaind query staking validators
```

### delegation

デリゲーターからバリデーターへのデリゲーションをクエリします。

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

デリゲーターのすべてのデリゲーションをクエリします。

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

アンボンディングデリゲーションをクエリします。

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

デリゲーターのすべてのデリゲーション報酬をクエリします。

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

バリデーターのコミッションをクエリします。

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

ID で単一の提案をクエリします。

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

すべての提案を一覧表示します。オプションでステータスでフィルタリングできます。

```bash
qorechaind query gov proposals [flags]
```

| フラグ     | 型     | 説明                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | ステータスでフィルタ: `deposit_period`、`voting_period`、`passed`、`rejected` |

### votes

提案への投票をクエリします。

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

アカウントの PQC キー登録ステータスをクエリします。

```bash
qorechaind query pqc account <address>
```

### algorithms

サポートされているすべての PQC アルゴリズムを一覧表示します。

```bash
qorechaind query pqc algorithms
```

### algorithm

特定の PQC アルゴリズムの詳細をクエリします。

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

集計された PQC 登録統計をクエリします。

```bash
qorechaind query pqc stats
```

### params

PQC モジュールパラメータをクエリします。

```bash
qorechaind query pqc params
```

### migration

アカウントの PQC キー移行ステータスをクエリします。

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

現在のハイブリッド署名強制モードをクエリします。

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

アドレスの xQORE ステーキングポジションをクエリします。

```bash
qorechaind query xqore position <address>
```

### params

xQORE モジュールパラメータをクエリします。

```bash
qorechaind query xqore params
```

---

## burn

### stats

すべてのチャネルにわたるバーン統計をクエリします。

```bash
qorechaind query burn stats
```

### params

バーンモジュールパラメータをクエリします。

```bash
qorechaind query burn params
```

---

## inflation

### rate

現在の年率換算インフレーションレートをクエリします。

```bash
qorechaind query inflation rate
```

### epoch

現在のエポック番号と進捗をクエリします。

```bash
qorechaind query inflation epoch
```

### params

インフレーションモジュールパラメータをクエリします。

```bash
qorechaind query inflation params
```

---

## ai

### config

AI モジュール構成をクエリします。

```bash
qorechaind query ai config
```

### stats

集計された AI 処理統計をクエリします。

```bash
qorechaind query ai stats
```

### fee-estimate

AI 支援によるガス手数料の見積もりを取得します。

```bash
qorechaind query ai fee-estimate [flags]
```

| フラグ      | 型     | 説明                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | 見積もり用のトランザクションタイプ |
| `--urgency` | string | `low`、`medium`、`high`         |

### investigations

アクティブな不正調査を一覧表示します。

```bash
qorechaind query ai investigations
```

### recommendations

AI が生成したネットワーク最適化の推奨事項を取得します。

```bash
qorechaind query ai recommendations
```

### circuit-breakers

現在のサーキットブレーカーの状態をクエリします。

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

すべてのバリデーターのレピュテーションスコアをクエリします。

```bash
qorechaind query reputation validators
```

### validator

特定のバリデーターのレピュテーションスコアをクエリします。

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

登録されているすべてのブリッジチェーンを一覧表示します。

```bash
qorechaind query bridge chains
```

### chain

特定のブリッジ済みチェーンの詳細をクエリします。

```bash
qorechaind query bridge chain <chain_id>
```

### validators

アクティブなブリッジバリデーターを一覧表示します。

```bash
qorechaind query bridge validators
```

### operations

最近のブリッジ操作を一覧表示します。

```bash
qorechaind query bridge operations
```

| フラグ     | 型     | 説明                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | フィルタ: `pending`、`completed`、`failed` |
| `--chain`  | string | チェーン ID でフィルタ                       |

### limits

ブリッジ済みチェーンのレート制限をクエリします。

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

ブリッジ手数料と送金時間を見積もります。

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

ID でクロス VM メッセージを取得します。

```bash
qorechaind query crossvm message <message_id>
```

### pending

保留中のクロス VM メッセージを一覧表示します。

```bash
qorechaind query crossvm pending
```

### params

Cross-VM モジュールパラメータをクエリします。

```bash
qorechaind query crossvm params
```

---

## svm

### account

SVM アカウント情報をクエリします。

```bash
qorechaind query svm account <pubkey>
```

### program

デプロイされた SVM プログラム情報をクエリします。

```bash
qorechaind query svm program <program_id>
```

### params

SVM モジュールパラメータをクエリします。

```bash
qorechaind query svm params
```

### slot

現在の SVM スロット番号をクエリします。

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

特定のレイヤーの詳細をクエリします。

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

登録されているすべてのレイヤーを一覧表示します。

```bash
qorechaind query multilayer layers
```

### anchor

特定のアンカーレコードをクエリします。

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

最近のアンカー提出を一覧表示します。

```bash
qorechaind query multilayer anchors [flags]
```

| フラグ       | 型     | 説明               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | レイヤー ID でフィルタ        |
| `--limit`    | uint   | 返す結果の最大数 |

### routing-stats

レイヤー全体のトランザクションルーティング統計をクエリします。

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

実行せずにトランザクションルーティングをシミュレートします。

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Multilayer モジュールパラメータをクエリします。

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

特定のロールアップの詳細をクエリします。

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

登録されているすべてのロールアップを一覧表示します。

```bash
qorechaind query rdk rollups
```

| フラグ     | 型     | 説明                            |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | フィルタ: `active`、`paused`、`stopped` |

### batch

特定の決済バッチをクエリします。

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

ロールアップの最新バッチをクエリします。

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

AI 支援によるロールアッププロファイルの推奨を取得します。

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

特定の DA blob をクエリします。

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

RDK モジュールパラメータをクエリします。

```bash
qorechaind query rdk params
```

:::note
ロールアップの引き出し証明と決済ステータスも `rdk` グループの下でクエリ可能です。正確なクエリサブコマンドと引数は、ロールアップの決済タイプによって異なります。権威ある引き出し/決済クエリの全体像については、**ロールアップ開発キット**のドキュメントを参照してください。
:::

---

## rlconsensus

PRISM はコンセンサスパラメータを調整する強化学習レイヤーです。CLI モジュール名 `rlconsensus` とそのサブコマンドはそのまま保持されます。

### agent-status

現在の PRISM エージェントのステータスとモードをクエリします。

```bash
qorechaind query rlconsensus agent-status
```

### observation

最新の PRISM 観測ベクトルをクエリします。

```bash
qorechaind query rlconsensus observation
```

### reward

累積 PRISM 報酬メトリクスをクエリします。

```bash
qorechaind query rlconsensus reward
```

### params

PRISM コンセンサスモジュールパラメータをクエリします。

```bash
qorechaind query rlconsensus params
```

### policy

アクティブな PRISM ポリシー構成をクエリします。

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

アドレスの BTC ステーキングポジションをクエリします。

```bash
qorechaind query babylon staking <address>
```

### checkpoint

指定したエポックの BTC チェックポイントデータをクエリします。

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Babylon モジュールパラメータをクエリします。

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

抽象アカウントの詳細をクエリします。

```bash
qorechaind query abstractaccount account <address>
```

### params

Abstract Account モジュールパラメータをクエリします。

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

ガス支払いに受け入れられるトークンを一覧表示します。

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Gas Abstraction モジュールパラメータをクエリします。

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

FairBlock 暗号化構成をクエリします。

```bash
qorechaind query fairblock config
```

### params

FairBlock モジュールパラメータをクエリします。

```bash
qorechaind query fairblock params
```
