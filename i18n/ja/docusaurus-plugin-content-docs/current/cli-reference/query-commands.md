---
slug: /cli-reference/query-commands
title: クエリコマンド
sidebar_label: クエリコマンド
sidebar_position: 3
---

# クエリコマンド

すべてのクエリコマンドは次のパターンに従います。

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
クエリは `--node` が指す先のノードに対して実行されます。ライブデータには **`qorechain-vladi`** メインネットの RPC エンドポイント(チェーンバージョン **v3.1.92**)を、テストには **`qorechain-diana`** テストネットのエンドポイントを使用してください。デフォルトの `tcp://localhost:26657` は、自分で運用しているノードを指します。
:::

共通フラグは、すべての `query` サブコマンドに適用されます。

| フラグ       | 型     | 説明                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC エンドポイント(デフォルト: `tcp://localhost:26657`) |
| `--output` | string | 出力フォーマット: `json` または `text`                 |
| `--height` | int    | 特定のブロック高でステートをクエリ          |

---

## bank

### balances

アカウントの全残高をクエリします。

```bash
qorechaind query bank balances <address>
```

### total

全トークンの総供給量をクエリします。

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

全バリデーターを一覧表示します。

```bash
qorechaind query staking validators
```

### delegation

デリゲーターからバリデーターへのデリゲーションをクエリします。

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

デリゲーターの全デリゲーションをクエリします。

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

アンボンディング中のデリゲーションをクエリします。

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

デリゲーターの全デリゲーション報酬をクエリします。

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

IDで単一のプロポーザルをクエリします。

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

全プロポーザルを一覧表示します。ステータスでのフィルタも可能です。

```bash
qorechaind query gov proposals [flags]
```

| フラグ       | 型     | 説明                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | ステータスでフィルタ: `deposit_period`、`voting_period`、`passed`、`rejected` |

### votes

プロポーザルへの投票をクエリします。

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

アカウントの PQC 鍵登録状況をクエリします。

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

PQC 登録の集計統計をクエリします。

```bash
qorechaind query pqc stats
```

### params

PQC モジュールのパラメータをクエリします。

```bash
qorechaind query pqc params
```

### migration

アカウントの PQC 鍵マイグレーション状況をクエリします。

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

現在のハイブリッド署名の強制モードをクエリします。

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

xQORE モジュールのパラメータをクエリします。

```bash
qorechaind query xqore params
```

---

## burn

### stats

全チャネルにわたるバーン統計をクエリします。

```bash
qorechaind query burn stats
```

### params

burn モジュールのパラメータをクエリします。

```bash
qorechaind query burn params
```

---

## inflation

### rate

現在の年率インフレ率をクエリします。

```bash
qorechaind query inflation rate
```

### epoch

現在のエポック番号と進捗をクエリします。

```bash
qorechaind query inflation epoch
```

### params

inflation モジュールのパラメータをクエリします。

```bash
qorechaind query inflation params
```

---

## ai

### config

AI モジュールの設定をクエリします。

```bash
qorechaind query ai config
```

### stats

集計された AI 処理統計をクエリします。

```bash
qorechaind query ai stats
```

### fee-estimate

AI 支援によるガス料金の見積もりを取得します。

```bash
qorechaind query ai fee-estimate [flags]
```

| フラグ        | 型     | 説明                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | 見積もり対象のトランザクションタイプ |
| `--urgency` | string | `low`、`medium`、`high`         |

### investigations

進行中の不正検知調査を一覧表示します。

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

全バリデーターの評判スコアをクエリします。

```bash
qorechaind query reputation validators
```

### validator

特定バリデーターの評判スコアをクエリします。

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

登録済みの全ブリッジチェーンを一覧表示します。

```bash
qorechaind query bridge chains
```

### chain

特定のブリッジ接続先チェーンの詳細をクエリします。

```bash
qorechaind query bridge chain <chain_id>
```

### validators

アクティブなブリッジバリデーターを一覧表示します。

```bash
qorechaind query bridge validators
```

### operations

直近のブリッジ操作を一覧表示します。

```bash
qorechaind query bridge operations
```

| フラグ       | 型     | 説明                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | フィルタ: `pending`、`completed`、`failed` |
| `--chain`  | string | チェーン ID でフィルタ                       |

### limits

ブリッジ接続先チェーンのレート制限をクエリします。

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

ブリッジ手数料と転送時間を見積もります。

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

IDでクロス VM メッセージを取得します。

```bash
qorechaind query crossvm message <message_id>
```

### pending

保留中のクロス VM メッセージを一覧表示します。

```bash
qorechaind query crossvm pending
```

### params

Cross-VM モジュールのパラメータをクエリします。

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

デプロイ済みの SVM プログラム情報をクエリします。

```bash
qorechaind query svm program <program_id>
```

### params

SVM モジュールのパラメータをクエリします。

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

登録済みの全レイヤーを一覧表示します。

```bash
qorechaind query multilayer layers
```

### anchor

特定のアンカーレコードをクエリします。

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

直近のアンカー送信を一覧表示します。

```bash
qorechaind query multilayer anchors [flags]
```

| フラグ         | 型     | 説明               |
| ------------ | ------ | -------------------------- |
| `--layer-id` | string | レイヤー ID でフィルタ        |
| `--limit`    | uint   | 返す結果の最大件数 |

### routing-stats

レイヤー間のトランザクションルーティング統計をクエリします。

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

実行せずにトランザクションルーティングをシミュレートします。

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Multilayer モジュールのパラメータをクエリします。

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

登録済みの全ロールアップを一覧表示します。

```bash
qorechaind query rdk rollups
```

| フラグ       | 型     | 説明                           |
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

特定の DA ブロブをクエリします。

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

RDK モジュールのパラメータをクエリします。

```bash
qorechaind query rdk params
```

:::note
ロールアップの出金証明や決済ステータスも `rdk` グループ配下でクエリ可能です。正確なクエリサブコマンドと引数は、利用しているロールアップの決済タイプによって異なります。正式な出金・決済クエリの仕様については **Rollup Development Kit** のドキュメントを参照してください。
:::

---

## rlconsensus

PRISM は、コンセンサスパラメータを調整する強化学習レイヤーです。CLI モジュール名 `rlconsensus` およびそのサブコマンドはそのまま保持されています。

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

PRISM Consensus モジュールのパラメータをクエリします。

```bash
qorechaind query rlconsensus params
```

### policy

現在アクティブな PRISM ポリシー設定をクエリします。

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

指定エポックの BTC チェックポイントデータをクエリします。

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Babylon モジュールのパラメータをクエリします。

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

アブストラクトアカウントの詳細をクエリします。

```bash
qorechaind query abstractaccount account <address>
```

### params

Abstract Account モジュールのパラメータをクエリします。

```bash
qorechaind query abstractaccount params
```

### permission-schema

正式なオーセンティケーター権限タクソノミー(11 個の権限、メッセージから権限へのマッピング、および委任不可能な鍵管理メッセージ)をクエリします(チェーンバージョン **v3.1.85** 以降で利用可能。REST でも `/qorechain/abstractaccount/v1/permission_schema` として提供されます)。

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

SDK を使わずにオーセンティケーターの認可を構築するためのヘルパーです。テスト用の鍵を生成するか、Native レーンまたは EVM レーンの委任アクションについて **チェーンが検証する正確な署名バイト列** を生成します(チェーンバージョン **v3.1.85** 以降で利用可能)。

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
```

---

## gasabstraction

### accepted-tokens

ガス支払いに利用できるトークンを一覧表示します。

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Gas Abstraction モジュールのパラメータをクエリします。

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

FairBlock 暗号化設定をクエリします。

```bash
qorechaind query fairblock config
```

### params

FairBlock モジュールのパラメータをクエリします。

```bash
qorechaind query fairblock params
```
