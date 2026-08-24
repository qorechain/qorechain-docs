---
slug: /user-guide/staking-and-delegation
title: ステーキングとデリゲーション
sidebar_label: ステーキングとデリゲーション
sidebar_position: 2
---

# ステーキングとデリゲーション

このガイドでは、QORトークンをバリデーターにデリゲートする方法、バリデーター間で再デリゲートする方法、ステークをアンボンディングする方法、報酬を請求する方法、そしてQoreChainのTriple-Poolステーキングアーキテクチャについて説明します。

:::note
以下のコマンドは**`qorechain-diana`**テストネット(EVMチェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)はチェーンバージョン**v3.1.92**を実行して2026年6月7日から稼働しています — メインネットでステーキングする際は、**Connecting to Mainnet**ページに記載のメインネットのチェーンIDとエンドポイントに置き換えてください。
:::

---

## トークンのデリゲート

QORをバリデーターにデリゲートすると、ステーキング報酬を獲得し、ネットワークセキュリティに参加できます。

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** バリデーターに100 QORをデリゲートする場合:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 再デリゲート

アンボンディング期間を待たずに、あるバリデーターから別のバリデーターへデリゲーションを移動できます。

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
すでに再デリゲーション処理中のトークンを再度再デリゲートすることはできません。現在の再デリゲーションが完了するまで待ってから、次の再デリゲーションを開始してください。
:::

---

## アンボンディング

バリデーターからデリゲートしたトークンを引き出します。アンボンディングの完了には**21日間**かかり、その間トークンは報酬を得ることも、送金することもできません。

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

21日間のアンボンディング期間が終了すると、トークンは自動的にアカウントへ返還されます。

---

## 報酬の請求

デリゲートしたすべてのバリデーターから、蓄積されたステーキング報酬を引き出します。

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

ステーキング報酬は、Tokenomics v2.1のスケジュールに基づくプロトコルの590M QORステーキングプールから、そしてすべての取引手数料に対するステーカー取り分(10%)と合わせて拠出されます。

---

## Triple-Pool分類

QoreChainは、バリデーターをその評判とデリゲーション量に基づいて3つのプールに分類する**Triple-Pool**ステーキングモデルを採用しています。各プールはブロック報酬の加重配分を受け取ります。

| プール                                 | 参加条件                                              | 報酬ウェイト |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS**(Reputation Proof of Stake) | 評判スコアが上位30%(70パーセンタイル以上)**かつ**ステーク量が中央値以上 | 40%           |
| **DPoS**(Delegated Proof of Stake)  | 総デリゲーション量が10,000 QOR以上                              | 35%           |
| **PoS**(Proof of Stake)             | それ以外のすべてのバリデーター                                    | 25%           |

バリデーターはエポック境界ごとに再分類されます。強い評判を築き、十分なステークを蓄積したバリデーターはRPoSプールに昇格し、最も高い報酬配分を得ます。

---

## ボンディングカーブ報酬

個々のステーキング報酬は、QoreChainのボンディングカーブの計算式を用いて算出されます。

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 変数 | 説明                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | その期間の報酬額                                         |
| `beta`   | 基本報酬率(プロトコルパラメーター)                                |
| `S`      | ステーク量                                                        |
| `alpha`  | ロイヤルティ係数(プロトコルパラメーター)                             |
| `L`      | ロック期間(エポック数)                                              |
| `Q(r)`   | バリデーターの評判スコア`r`から導出される品質係数 |
| `P(t)`   | 時点`t`におけるプール係数(プールに応じて40%、35%、25%のいずれか)     |

ロック期間が長く、評判スコアが高いほど、比例して報酬が大きくなり、長期的なコミットメントと良好なバリデーターの行動が奨励されます。

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

アクティブなバリデーターを一覧表示します。

```bash
qorechaind query staking validators --status bonded
```

現在のデリゲーション状況を照会します。

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* **RPoSプール**のバリデーターにデリゲートすると、40%のプールウェイトにより最も高い報酬が得られます。
* バリデーターの評判が築かれるには時間がかかります。デリゲートする前にバリデーターの実績を確認してください。
* 再デリゲートは即時に行われますが、クールダウン制限があります。移動は計画的に行ってください。
* 21日間のアンボンディング期間はセキュリティ対策です。この間もスラッシング事象がトークンに影響を及ぼす可能性があります。

:::
