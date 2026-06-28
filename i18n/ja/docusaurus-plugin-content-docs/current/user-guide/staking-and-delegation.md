---
slug: /user-guide/staking-and-delegation
title: ステーキングと委任
sidebar_label: ステーキングと委任
sidebar_position: 2
---

# ステーキングと委任

このガイドでは、QOR トークンをバリデーターに委任する方法、バリデーター間で再委任する方法、ステークをアンボンドする方法、報酬を請求する方法、そして QoreChain の Triple-Pool ステーキングアーキテクチャについて説明します。

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用しています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日以降稼働しており、チェーンバージョン **v3.1.80** を実行しています。メインネットでステーキングを行う場合は、**メインネットへの接続** ページにあるメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

---

## トークンの委任

QOR をバリデーターに委任して、ステーキング報酬を獲得し、ネットワークのセキュリティに参加します。

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** バリデーターに 100 QOR を委任する場合:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 再委任

アンボンディング期間を待たずに、委任を 1 つのバリデーターから別のバリデーターへ移動します。

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
すでに再委任の移行中にあるトークンを再委任することはできません。別の再委任を開始する前に、現在の再委任が完了するのを待ってください。
:::

---

## アンボンディング

委任したトークンをバリデーターから引き出します。アンボンディングが完了するまでに **21 日間** かかり、その間トークンは報酬を獲得できず、転送することもできません。

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

21 日間のアンボンディング期間が終了すると、トークンは自動的にアカウントに返還されます。

---

## 報酬の請求

委任したすべてのバリデーターから、累積したステーキング報酬をすべて引き出します。

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

特定のバリデーターからのみ報酬を引き出す場合:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

ステーキング報酬は、Tokenomics v2.1 スケジュールに基づくプロトコルの 590M QOR ステーキングプールから、各トランザクション手数料のステーカー分（10%）とともに資金提供されます。

---

## Triple-Pool 分類

QoreChain は、評判と委任レベルに基づいてバリデーターを 3 つのプールに分類する **Triple-Pool** ステーキングモデルを使用します。各プールはブロック報酬の加重された割合を受け取ります。

| プール                                | 参加基準                                                    | 報酬ウェイト  |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | 評判スコアが 70 パーセンタイル以上 **かつ** ステークが中央値以上 | 40%           |
| **DPoS** (Delegated Proof of Stake)  | 総委任額が 10,000 QOR 以上                                   | 35%           |
| **PoS** (Proof of Stake)             | 残りのすべてのバリデーター                                    | 25%           |

バリデーターは各エポック境界で再分類されます。高い評判を築き、十分なステークを蓄積したバリデーターは RPoS プールに昇格し、最も高い報酬割合を獲得します。

---

## ボンディングカーブ報酬

個々のステーキング報酬は、QoreChain のボンディングカーブの式を使用して計算されます。

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 変数      | 説明                                                                 |
| -------- | -------------------------------------------------------------------- |
| `R`      | 当該期間の報酬額                                                       |
| `beta`   | 基本報酬率（プロトコルパラメータ）                                       |
| `S`      | ステーク額                                                            |
| `alpha`  | ロイヤルティ係数（プロトコルパラメータ）                                  |
| `L`      | エポック単位のロック期間                                               |
| `Q(r)`   | バリデーターの評判スコア `r` から導出される品質乗数                      |
| `P(t)`   | 時刻 `t` におけるプール乗数（プールに応じて 40%、35%、または 25%）        |

ロック期間が長く、評判スコアが高いほど、報酬は比例して大きくなり、長期的なコミットメントと良好なバリデーター行動が促進されます。

---

## バリデーター情報の照会

任意のバリデーターの詳細を調べます。

```bash
qorechaind query staking validator <validator_operator_address>
```

**例:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

アクティブなバリデーターをすべて一覧表示します。

```bash
qorechaind query staking validators --status bonded
```

現在の委任を照会します。

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* **RPoS プール** のバリデーターに委任すると、40% のプールウェイトにより最も高い報酬が得られます。
* バリデーターの評判を築くには時間がかかります。委任する前にバリデーターの実績を考慮してください。
* 再委任は即時ですが、クールダウンの制限があります。動きを慎重に計画してください。
* 21 日間のアンボンディング期間はセキュリティ対策です。この間も、スラッシングイベントがトークンに影響を与える可能性があります。

:::
