---
slug: /user-guide/governance
title: ガバナンス
sidebar_label: ガバナンス
sidebar_position: 3
---

# ガバナンス

このガイドでは、QoreChain 上でのオンチェーンガバナンスの仕組み、つまり投票の集計方法、提案の提出方法、投票方法について説明します。

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用します。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日以降稼働中で、リリース **v3.2.3** を高さ 3,742,566 まで、そのブロックからは **v3.2.4** を実行します。テストネットは 2026 年 10 月 19 日から **v3.2.4** を実行しています。メインネットでガバナンスに参加する際は、**メインネットへの接続** ページからメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

:::caution `tx pqc cosign` で署名する
メインネットとテストネットでは、すべての Cosmos レーンのトランザクションにハイブリッドのポスト量子署名が必要なため、このページのコマンドは記載のままではブロードキャストされません。コマンドに `--generate-only > tx.json` を追加し、続けて `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` を実行してください。[ハイブリッド署名](/cli-reference/transaction-commands#hybrid-signing)を参照してください。
:::

---

## 投票力 {#voting-power}

提案は **bonded ステーク** に基づいて集計されます。bonded 状態のバリデータに委任した QOR は 1 つにつき 1 単位の投票力としてカウントされ、乗数はありません。自分で投票しない場合、委任はバリデータの投票に従います。自分で投票すると、そのステークについてはバリデータの投票より優先されます。提案は、以下のすべてが満たされた場合に可決されます。

| ルール    | 現在の値 | 意味                                                                          |
| --------- | -------- | ----------------------------------------------------------------------------- |
| クォーラム | 33.4%   | 投票しなければならない bonded ステークの割合                                  |
| しきい値  | 50%      | 可決に必要な、棄権を除く投票に占める「yes」の割合                             |
| 拒否権    | 33.4%    | 「no with veto」がこの割合に達すると、提案は否決され、そのデポジットはバーンされます |

これらの値は 2026 年 10 月 20 日にメインネットから取得したものです（テストネットでも同じです）。ガバナンスによって変更される可能性があるため、`qorechaind query gov params` で確認してください。

:::note QDRW は設計されていますが、有効ではありません
QoreChain の設計には、大口ステークを減衰させ評価を重み付けする **Quadratic Delegation-Reputation Weighted（QDRW）** 投票力の式 `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)` が含まれています。これは `x/qca` モジュールに実装されていますが、両ネットワークで**オフ**になっており（`qorechaind query qca config` の `qdrw_enabled` は `false`）、ガバナンスの集計には含まれないため、現在はどの投票にも影響しません。xQORE も稼働していません（[xQORE ステーキング](/user-guide/xqore-staking) を参照）。
:::

---

## 提案の提出

任意の QOR 保有者がガバナンス提案を提出できます。提案が投票期間に入るには、最小デポジットが必要です。

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**提案ファイルの例**（`proposal.json`）。提案は、可決された場合にガバナンスモジュールが実行するメッセージのリストに、タイトル、サマリー、デポジットを加えたものです。この例は最大バリデータ数を 100 から 150 に引き上げます。`authority` はガバナンスモジュールアカウントです（`qorechaind query auth module-account gov`）。

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` はパラメータセット全体を置き換えるため、`qorechaind query staking params` から現在の値をコピーし、変更したいフィールドだけを変更してください。テキストのみ（シグナリング）の提案では `"messages": []` を使用します。`qorechaind tx gov draft-proposal` でひな形を生成できます。

---

## 提案への投票

提案が投票期間に入ると、任意のステーカーが投票できます。

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**投票オプション:**

| オプション     | 説明                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| `yes`          | 提案を支持する                                                                           |
| `no`           | 提案に反対する                                                                           |
| `abstain`      | 立場を取らずに提案を承認する                                                             |
| `no_with_veto` | 提案に反対し、それが提出されるべきではなかったことを示す（しきい値に達した場合、デポジットをバーンする） |

**例:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## 提案の種類

提案には、可決された場合に実行される 0 個以上のメッセージが含まれます。一般的なケースは次のとおりです。

| 種類                 | 説明                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Text**             | メッセージを持たず、自動的なオンチェーン実行を伴わないシグナリング提案。コミュニティのセンチメントチェックに使用されます。 |
| **Parameter change** | ガバナンスモジュールアカウントから送信される、モジュールの `MsgUpdateParams` メッセージ。そのモジュールのパラメータセット全体を置き換えます。 |
| **Software upgrade** | 指定されたブロック高で協調的なチェーンアップグレードをスケジュールする `MsgSoftwareUpgrade` メッセージ。 |
| **Community spend**  | コミュニティプールから受信者アドレスへ資金を送る `MsgCommunityPoolSpend` メッセージ。      |
| **Expedited**        | `"expedited": true` を設定すると、投票期間が短くなり、デポジットと可決しきい値が高くなります（下記参照）。 |

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

| パラメータ           | 説明                                                             | 現在の値（2026 年 10 月 20 日） |
| -------------------- | ---------------------------------------------------------------- | ------------------------------- |
| `min_deposit`        | 提案が投票に入るために必要な最小デポジット                       | 10 QOR（`10000000uqor`）        |
| `max_deposit_period` | 最小デポジットに達するための時間枠                               | 2 日                            |
| `voting_period`      | 提案がアクティブになった後の投票期間の長さ                       | 2 日                            |
| `quorum`             | 有効な投票に必要な最小参加率                                     | 0.334                           |
| `threshold`          | 可決に必要な最小「yes」割合（abstain を除く）                    | 0.5                             |
| `veto_threshold`     | 否決してデポジットをバーンするために必要な最小「no with veto」割合 | 0.334                         |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | expedited 提案の投票期間、可決しきい値、デポジット | 1 日 / 0.667 / 50 QOR |

---

## これまでのメインネットでのガバナンス {#mainnet-history}

メインネットのガバナンスは、パラメータ変更、サーキットブレーカーの判断、協調アップグレード、そして 2026 年 10 月以降は、v3.2.0 アップグレードでチェーンが記録した金額の放出に使われてきました。2026 年 10 月にメインネットで提案 7 から 11 が可決され、提案 12（さらなる放出）と提案 13（高さ 3,742,566 での v3.2.4 アップグレード）は本稿執筆時点で投票期間中でした。一覧と結果は[バージョン履歴](/appendix/version-history#governance-timeline)にあり、すべての提案は `GET /cosmos/gov/v1/proposals` でライブに確認できます。

---

:::tip

* 投票期間が終了する前に投票してください。投票は、提案が投票期間中に行われた場合にのみカウントされます。
* `no_with_veto` は慎重に使用してください。拒否権のしきい値に達すると、提案のデポジットはバーンされます。
* デポジット期間内に最小デポジットに達しなかった提案は、自動的に削除されます。

:::
