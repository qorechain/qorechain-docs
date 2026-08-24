---
slug: /user-guide/xqore-staking
title: xQORE ステーキング
sidebar_label: xQORE ステーキング
sidebar_position: 4
---

# xQORE ステーキング

このガイドでは、QOR保有者がトークンをロックしてガバナンス権限を強化できる xQORE ガバナンスステーキングの仕組みについて説明します。長期参加者に報酬を与える PvP リベースモデルを採用しています。

:::note
以下のコマンドは **`qorechain-diana`** テストネット(EVM チェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVM チェーンID **9801**)は2026年6月7日からチェーンバージョン **v3.1.92** で稼働しています。メインネットでステーキングを行う場合は、**Connecting to Mainnet** ページに記載のメインネット用チェーンIDとエンドポイントに置き換えてください。
:::

---

## 概要

xQORE は QoreChain のガバナンスステーキングトークンです。QOR をロックすると、**1:1 の比率**で xQORE を受け取ります。xQORE を保有することでガバナンス上の大きな優位性が得られます。xQORE トークンは QDRW 議決権計算式において**2倍の重み**でカウントされます(詳細は[ガバナンス](/user-guide/governance)を参照)。

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

つまり、QOR を xQORE にロックすることで、通常のステーキングのみの場合と比べてガバナンスへの影響力が実質的に2倍になります。

---

## QOR をロックして xQORE を取得する

QOR トークンをロックして、1:1 の比率で xQORE をミントします。

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** 1,000 QOR をロックする場合

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

このトランザクションの後、アカウントには 1,000,000,000 uxqore(1,000 xQORE)が保有されます。

---

## xQORE のロック解除

xQORE をバーンして QOR を取り戻します。トークンのロック期間に応じて**出口ペナルティ**が適用される場合があります。

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** 500 xQORE のロックを解除する場合

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 出口ペナルティスケジュール

xQORE からの早期引き出しにはペナルティが課されます。保有期間が長いほど、ペナルティは低くなります。

| ロック期間          | 出口ペナルティ |
| ------------------- | -------------- |
| 30日未満             | **50%**        |
| 30日〜90日           | **35%**        |
| 90日〜180日          | **15%**        |
| 180日超              | **0%**         |

**例:** 1,000 QOR をロックし、45日後にロックを解除した場合、650 QOR を受け取ります(35%のペナルティが適用されます)。残りの 350 QOR は PvP リベースの仕組みを通じて他の xQORE 保有者に再分配されます。

---

## PvP リベースの仕組み

早期解除から回収されたペナルティは**バーンされません**。代わりに、残っているすべての xQORE 保有者に比例配分で再分配されます。これにより、忍耐強い保有者が他者の性急さから利益を得る「Player vs Player」的なダイナミクスが生まれます。

仕組みは次のとおりです。

1. ユーザーが180日のゼロペナルティ閾値に達する前に xQORE のロックを解除します。
2. 返還される QOR から出口ペナルティが差し引かれます。
3. ペナルティ額は、残っているすべての xQORE ポジションに比例配分で分配されます。
4. 残りの各保有者について、xQORE あたりの請求可能な QOR が増加します。

この仕組みは長期的なガバナンスへのコミットメントを促し、ポジションを維持し続ける保有者に報酬を与えます。

---

## 自分のポジションを照会する

現在の xQORE ポジション、ロック期間、適用される出口ペナルティを確認します。

```bash
qorechaind query xqore position <address>
```

**例:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**出力例:**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## JSON-RPC アクセス

QoreChain と JSON-RPC で連携するアプリケーションは、次のメソッドを使用して xQORE ポジションを照会できます。

```
qor_getXQOREPosition
```

**リクエスト:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## ヒント

* 重要なガバナンス投票の前に余裕をもって QOR を xQORE にロックし、議決権を最大化しましょう。
* ゼロペナルティで解除できるようになる180日の閾値は、忍耐強くガバナンスに参加する人に報酬を与えます。
* PvP リベースの積み上がりを注視してください。他の人が早期に解除するほど、あなたのポジションの価値は増加します。
* xQORE は譲渡不可です。QOR をロックすることでのみミントされ、ロックを解除することでのみバーンされます。
* ロックする前に出口ペナルティをよく検討してください。短期のロックには大きなペナルティが伴います。
