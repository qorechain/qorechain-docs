---
slug: /user-guide/governance
title: ガバナンス
sidebar_label: ガバナンス
sidebar_position: 3
---

# ガバナンス

このガイドでは、Quadratic Delegation-Reputation Weighted（QDRW）投票システム、提案の提出方法、投票方法など、QoreChain 上でのオンチェーンガバナンスの仕組みについて説明します。

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用します。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は、チェーンバージョン **v3.1.77** で稼働し、2026 年 6 月 7 日以降稼働中です。メインネットでガバナンスに参加する際は、**メインネットへの接続** ページからメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

---

## 投票力: QDRW の式

QoreChain は、投票力を計算するために **Quadratic Delegation-Reputation Weighted（QDRW）** の式を使用します。このシステムは、ホエール（大口保有者）の支配を防ぎつつ、高い評価スコアを獲得し、xQORE ステーキングを通じてガバナンスにコミットした参加者に報酬を与えます。

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| 変数                  | 説明                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | 実効投票力                                                                                                           |
| `staked`                  | 投票者がステークした QOR トークンの総量                                                                                             |
| `xQORE`                   | 保有する xQORE ガバナンストークンの量（[xQORE ステーキング](/user-guide/xqore-staking) を参照）                                          |
| `r`                       | 投票者の評価スコア、\[0, 1] に正規化                                                                                  |
| `ReputationMultiplier(r)` | 評価を \[0.5, 2.0] の範囲の乗数にマッピングするシグモイド関数                                                     |

### 主な特性

* **二次的な減衰:** 別の投票者の 100 倍のステークを持つ保有者は、100 倍ではなく約 10 倍の投票力しか得られません。これにより、ガバナンスへの影響力が富に対して線形以下にスケールすることが保証されます。
* **xQORE ボーナス:** xQORE トークンは平方根の内側で **2 倍の重み** でカウントされ、ガバナンスにコミットした参加者に意味のある優位性を与えます。
* **評価乗数:** シグモイド曲線を使用して、投票者の評価スコアを \[0, 1] から \[0.5, 2.0] の乗数にマッピングします。高評価の参加者は実効投票力を 2 倍にできる一方、低評価の参加者は影響力が半減します。

---

## 提案の提出

任意の QOR 保有者がガバナンス提案を提出できます。提案が投票期間に入るには、最小デポジットが必要です。

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**提案ファイルの例**（`proposal.json`）:

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## 提案への投票

提案が投票期間に入ると、任意のステーカーが投票できます。

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**投票オプション:**

| オプション         | 説明                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | 提案を支持する                                                                                     |
| `no`           | 提案に反対する                                                                                      |
| `abstain`      | 立場を取らずに提案を承認する                                                       |
| `no_with_veto` | 提案に反対し、それが提出されるべきではなかったことを示す（しきい値に達した場合、デポジットをバーンする） |

**例:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 提案の種類

QoreChain は以下のガバナンス提案の種類をサポートしています。

| 種類                 | 説明                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | 自動的なオンチェーン実行を伴わないシグナリング提案。コミュニティのセンチメントチェックに使用されます。 |
| **Parameter Change** | 1 つ以上のオンチェーンプロトコルパラメータを変更します（例: 最大バリデータ数、発行レート）。        |
| **Software Upgrade** | 指定されたブロック高で協調的なチェーンアップグレードをスケジュールします。                              |
| **Community Spend**  | 指定された受信者アドレスのために、コミュニティトレジャリーから資金を要求します。                   |

---

## 提案のクエリ

すべての提案を一覧表示します。

```bash
qorechaind query gov proposals
```

ID で特定の提案をクエリします。

```bash
qorechaind query gov proposal <proposal_id>
```

提案に対する現在の投票集計を確認します。

```bash
qorechaind query gov tally <proposal_id>
```

提案に対する自分自身の投票を表示します。

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## ガバナンスパラメータ

現在のガバナンスパラメータをクエリします。

```bash
qorechaind query gov params
```

主なパラメータは以下のとおりです。

| パラメータ            | 説明                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | 提案が投票に入るために必要な最小デポジット          |
| `max_deposit_period` | 最小デポジットに達するための時間枠                     |
| `voting_period`      | 提案がアクティブになった後の投票期間の長さ          |
| `quorum`             | 有効な投票に必要な最小参加率                  |
| `threshold`          | 可決に必要な最小「yes」割合（abstain を除く）            |
| `veto_threshold`     | 否決してデポジットをバーンするために必要な最小「no with veto」割合 |

---

:::tip

* 投票力の乗数を最大化するために、主要なガバナンス投票の前に評価を構築してください。
* QDRW の式の内側で 2 倍のガバナンス重みのボーナスを得るために、QOR を xQORE にロックしてください。
* `no_with_veto` は慎重に使用してください。拒否権のしきい値に達すると、提案のデポジットはバーンされます。
* デポジット期間内に最小デポジットに達しなかった提案は、自動的に削除されます。

:::
