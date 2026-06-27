---
slug: /architecture/btc-restaking-babylon
title: BTC リステーキング（Babylon）
sidebar_label: BTC リステーキング（Babylon）
sidebar_position: 11
---

# BTC リステーキング（Babylon）

`x/babylon` モジュールは、QoreChain を Babylon Protocol と統合し、Bitcoin のプルーフオブワークによるファイナリティ保証を継承します。BTC リステーキングを通じて、QoreChain は Bitcoin のハッシュレートに裏付けられた二次的なファイナリティレイヤーを獲得します — Bitcoin プロトコル自体に変更を加える必要はありません。

## 概要

Babylon Protocol は、タイムスタンプとチェックポイントのメカニズムを通じて、プルーフオブステークチェーンが Bitcoin のセキュリティを活用できるようにします。QoreChain の統合は次のように機能します。

1. **BTC ステーカー**は、Babylon ステーキングトランザクションで Bitcoin をロックし、そのポジションを QoreChain に登録します。
2. QoreChain からの**エポックチェックポイント**は定期的に Babylon にリレーされ、Babylon がそれを Bitcoin 上でタイムスタンプします。
3. **ファイナリティの継承**: QoreChain のエポックが Bitcoin 上でチェックポイントされると、そのエポックがカバーする状態は Bitcoin のプルーフオブワークによるファイナリティ保証を継承します。

これにより、QoreChain 自身のバリデーターセットのみに依存するのではなく、Bitcoin の累積ハッシュレートに固定されたロングレンジ攻撃や二重署名に対する防御が提供されます。

## BTC ステーキングポジション

ユーザーは、Bitcoin ステーキングトランザクションを参照する `MsgBTCRestake` トランザクションを送信することで、QoreChain 上に BTC ステーキングポジションを登録できます。

### 登録要件

| パラメータ               | 値                            | 説明                                              |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| **最小ステーク**         | 100,000 satoshi（0.001 BTC）  | ステーキングポジションごとに必要な最小 BTC          |
| **アンボンディング期間**  | 144 BTC ブロック（約 1 日）    | ステークされた BTC を引き出せるようになるまでの待機期間 |
| **チェックポイント間隔**  | QoreChain 10 エポックごと      | 状態が Babylon にチェックポイントされる頻度          |

### ステーキングポジションの構造

各 BTC ステーキングポジションは、以下のオンチェーン状態を追跡します。

| フィールド          | 説明                                                            |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | ステーカーの QoreChain アドレス（`qor1...`）                     |
| `btc_tx_hash`      | ステーキングトランザクションの Bitcoin トランザクションハッシュ      |
| `amount_satoshis`  | ステークされた BTC の量（satoshi 単位）                           |
| `status`           | ポジションのライフサイクル状態: `active`、`unbonding`、または `withdrawn` |
| `staked_at`        | ポジション登録のタイムスタンプ                                    |
| `unbonding_height` | アンボンディングが開始されたブロック高さ（該当する場合）            |
| `validator_addr`   | このステークが委任される QoreChain バリデーターアドレス             |

### 登録フロー

1. **BTC ステーキングトランザクションの作成** — Bitcoin ネットワーク上で BTC ステーキングトランザクションを作成します。
2. **QoreChain 上で MsgBTCRestake を送信** — QoreChain 上で、`btc_tx_hash`、`amount`、`validator` を指定して `MsgBTCRestake` を送信します。
3. **ポジションの記録** — ポジションが「active」としてオンチェーンに記録されます。

## エポックチェックポイント

QoreChain のエポック状態ルートは、Babylon リレーチェーンを通じて定期的に Bitcoin にチェックポイントされます。

### チェックポイントフロー

1. **チェックポイントの送信** — QoreChain バリデーターが、エポック番号、BTC ブロックハッシュ、BTC ブロック高さ、QoreChain 状態ルートを含む `MsgSubmitBTCCheckpoint` を送信します。
2. **IBC リレー** — チェックポイントデータが IBC を介して Babylon チェーンにリレーされます。
3. **Bitcoin 上でのタイムスタンプ** — Babylon がチェックポイントを Bitcoin トランザクションに含め、QoreChain の状態を Bitcoin のブロックチェーンに固定します。
4. **確認** — Bitcoin トランザクションが確認されると、ファイナリティが Babylon を通じて QoreChain に戻ります。
5. **確定** — チェックポイントのステータスが `pending` から `confirmed`、そして `finalized` へと遷移します。

### チェックポイントの構造

| フィールド          | 説明                                                     |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | チェックポイントされる QoreChain エポック番号               |
| `btc_block_hash`   | チェックポイントを含む Bitcoin ブロックハッシュ              |
| `btc_block_height` | Bitcoin ブロック高さ                                      |
| `state_root`       | エポック境界での QoreChain 状態ルート                       |
| `submitted_at`     | チェックポイント送信のタイムスタンプ                        |
| `status`           | チェックポイント状態: `pending`、`confirmed`、または `finalized` |

### エポックスナップショット

各チェックポイント境界で、エポックスナップショットがネットワークの集計状態をキャプチャします。

| フィールド          | 説明                                             |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | 全ポジションにわたってステークされた総 BTC（satoshi） |
| `active_positions` | アクティブなステーキングポジションの数              |
| `validator_count`  | BTC に裏付けられた委任を持つバリデーターの数         |
| `block_height`     | スナップショット時の QoreChain ブロック高さ          |

## 二次的なファイナリティレイヤー

Babylon の統合は、QoreChain のネイティブコンセンサスファイナリティを補完する**二次的なファイナリティ保証**を提供します。

| ファイナリティレイヤー | ソース                      | 速度          | セキュリティ                              |
| -------------- | -------------------------- | ------------ | --------------------------------------- |
| **一次**       | QoreChain コンセンサスエンジン | 約 5 秒       | QOR ステーク + PQC 署名に裏付けられる      |
| **二次**       | Babylon + Bitcoin          | 約 60 分      | Bitcoin の累積ハッシュレートに裏付けられる   |

二次レイヤーは特に以下の点で価値があります。

* **ロングレンジ攻撃の防止**: 攻撃者が大量の QOR ステークを蓄積したとしても、Bitcoin 上でチェックポイントされた履歴を書き換えることはできません。
* **クロスチェーンブリッジのセキュリティ**: 大きな価値を伴うブリッジ操作は、資金を解放する前に Bitcoin レベルのファイナリティを待つことができます。
* **機関投資家の信頼**: Bitcoin のタイムスタンプは、QoreChain の状態履歴を独立して検証可能な証明として提供します。

## 構成

| パラメータ             | デフォルト        | 説明                                       |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | BTC リステーキング機能のマスタースイッチ      |
| `min_stake_amount`    | 100,000 satoshi  | ステーキングポジションごとの最小 BTC          |
| `unbonding_period`    | 144 BTC ブロック  | BTC 建てのアンボンディング期間               |
| `checkpoint_interval` | 10 エポック        | Babylon チェックポイント間のエポック数        |
| `babylon_chain_id`    | `bbn-1`          | 接続された Babylon ネットワークのチェーン ID  |

## イベント

このモジュールは以下のオンチェーンイベントを発行します。

| イベントタイプ            | 属性                                      | 説明                                           |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | 新しい BTC ステーキングポジションが登録された       |
| `btc_unbond`             | staker, amount                           | BTC ステーキングポジションがアンボンディングに入った |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | エポックチェックポイントが Babylon に送信された     |
| `babylon_epoch_complete` | epoch                                    | Bitcoin タイムスタンプで Babylon エポックが確定した |

## API エンドポイント

### REST

| メソッド | エンドポイント                     | 説明                                     |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | アドレスの BTC ステーキングポジションを取得   |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 特定のエポックのチェックポイントデータを取得   |
| GET    | `/babylon/v1/params`             | モジュールの構成パラメータを取得            |

### JSON-RPC

| メソッド                     | パラメータ          | 説明                                                            |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address`（文字列）  | 指定された QoreChain アドレスの BTC ステーキングポジションを返す      |

## CLI コマンド

### クエリコマンド

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### トランザクションコマンド

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
