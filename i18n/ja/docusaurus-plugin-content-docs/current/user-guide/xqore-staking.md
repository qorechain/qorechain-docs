---
slug: /user-guide/xqore-staking
title: xQORE ステーキング
sidebar_label: xQORE ステーキング
sidebar_position: 4
---

# xQORE ステーキング

このガイドでは、xQORE ガバナンスステーキングメカニズムについて説明します。これにより、QOR 保有者はトークンをロックして強化されたガバナンスパワーを得ることができ、長期的な参加者に報酬を与える PvP リベースモデルが備わっています。

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用しています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日以降稼働しており、チェーンバージョン **v3.1.82** を実行しています。メインネットでステーキングを行う場合は、**メインネットへの接続** ページにあるメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

---

## 概要

xQORE は QoreChain のガバナンスステーキングトークンです。QOR をロックすると、**1:1 の比率** で xQORE を受け取ります。xQORE を保有すると、ガバナンスにおいて大きな利点があります。xQORE トークンは QDRW 投票権の式において **2 倍のウェイト** でカウントされます（[ガバナンス](/user-guide/governance) を参照）。

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

つまり、QOR を xQORE にロックすることで、通常のステーキング単独と比較してガバナンスへの影響力が実質的に 2 倍になります。

---

## QOR をロックして xQORE を取得する

QOR トークンをロックして、1:1 の比率で xQORE をミントします。

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** 1,000 QOR をロックする場合:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

このトランザクションの後、アカウントは 1,000,000,000 uxqore（1,000 xQORE）を保有します。

---

## xQORE のアンロック

xQORE をバーンして QOR を取り戻します。トークンがロックされていた期間に応じて、**退出ペナルティ** が適用される場合があります。

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** 500 xQORE をアンロックする場合:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 退出ペナルティのスケジュール

xQORE からの早期引き出しにはペナルティが発生します。保有期間が長いほど、ペナルティは低くなります。

| ロック期間          | 退出ペナルティ |
| ------------------ | ------------ |
| 30 日未満           | **50%**      |
| 30 日から 90 日      | **35%**      |
| 90 日から 180 日     | **15%**      |
| 180 日超            | **0%**       |

**例:** 1,000 QOR をロックして 45 日後にアンロックする場合、650 QOR を受け取ります（35% のペナルティが適用）。残りの 350 QOR は、PvP リベースメカニズムを通じて他の xQORE 保有者に再分配されます。

---

## PvP リベースメカニズム

早期退出から徴収されたペナルティは **バーンされません**。代わりに、残りのすべての xQORE 保有者に比例して再分配されます。これにより、忍耐強い保有者が他者の性急さから利益を得る「Player vs Player」のダイナミクスが生まれます。

仕組み:

1. ユーザーが 180 日のゼロペナルティしきい値より前に xQORE をアンロックします。
2. 退出ペナルティが返還される QOR から差し引かれます。
3. ペナルティ額が残りのすべての xQORE ポジションに比例配分されます。
4. 残りの各保有者の xQORE あたりの請求可能な QOR が増加します。

このメカニズムは、長期的なガバナンスへのコミットメントを促進し、ポジションを維持する保有者に報酬を与えます。

---

## ポジションの照会

現在の xQORE ポジション、ロック期間、適用される退出ペナルティを確認します。

```bash
qorechaind query xqore position <address>
```

**例:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**サンプル出力:**

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

JSON-RPC を介して QoreChain と統合するアプリケーションでは、xQORE ポジションを次の方法で照会できます。

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

* 重要なガバナンス投票の十分前に QOR を xQORE にロックして、投票権を最大化しましょう。
* ゼロペナルティ退出の 180 日のしきい値は、忍耐強いガバナンス参加者に報酬を与えます。
* PvP リベースの累積を監視しましょう。他者が早期退出するにつれて、あなたのポジションの価値は増加します。
* xQORE は譲渡不可能です。QOR をロックすることでのみミントでき、アンロックすることでのみバーンできます。
* ロックする前に退出ペナルティを慎重に検討してください。短期のロックには大きなペナルティが伴います。
