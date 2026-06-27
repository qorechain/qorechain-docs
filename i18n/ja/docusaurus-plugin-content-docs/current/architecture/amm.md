---
slug: /architecture/amm
title: AMMとオンチェーン流動性
sidebar_label: AMMとオンチェーン流動性
sidebar_position: 8
---

# AMMとオンチェーン流動性

`x/amm`モジュールは、QoreChainのネイティブなオンチェーン自動マーケットメーカー（AMM）です。これにより、誰でも流動性プールを作成し、流動性を提供し、QoreChainネイティブ資産間でプロトコルレベルで直接スワップできます。オフチェーンのオーダーブックも、外部のスマートコントラクトDEXも不要です。これは、**ダッシュボードのTrade / DEX**体験を支えるオンチェーン決済層です。

プールは、おなじみのAMM価格曲線に従います。

- **`constant_product`** — `x*y=k`曲線（汎用ペア向け）。
- **`stable_swap`** — 増幅係数で調整される、緊密にペッグされたペア向けの低スリッページ曲線。

すべての金額はQoreChainのネイティブ単位を使用します。ステーキングおよび手数料トークンは**QOR**であり、その基本デノムは**uqor**です（1 QOR = 10^6 uqor）。プール参加者とアドレスは`qor` bech32プレフィックスを使用します。

:::note
以下のコマンドは`qorechaind`を使用します。お使いの環境に合わせて、通常のトランザクションフラグ（`--from`、`--chain-id`、`--gas`、`--fees`、`--node`）を追加してください。たとえば、メインネットに対しては`--chain-id qorechain-vladi`を指定します。
:::

## プールとLPシェア

プールは2つのデノム（`token_a`、`token_b`、ソート順で保存）のリザーブを保持し、それらのリザーブに対する比例的な請求権を表す**LPトークン**をミントします。各プールには数値の`id`、`type`、`status`（`active`または`paused`）、および独自のLPデノムがあります。流動性を追加するとLPトークンを受け取り、流動性を引き出すときにはそれらをバーンしてリザーブのシェアを償還します。

### プールの作成

`create-pool`は、プールタイプと2つの初期デポジット（コインとして）を受け取ります。安定ペアの場合は、`--amp`で増幅係数を設定します。

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### 流動性の追加

`add-liquidity`は、両サイドをプールに預け入れてLPトークンをミントします。最後の引数は受け入れる最小LP量です。これは、トランザクションが処理される前にプール比率がシフトすることに対する保護です。

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### 流動性の削除

`remove-liquidity`は、LPトークンをバーンしてリザーブを引き出します。2つの`min`引数は、各サイドで受け取る最小量を設定します。

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## スワップ

AMMは、2つの標準的なスワップ方向をサポートしています。

### Exact-in

`swap-exact-in`は、固定された入力量を消費し、最小アウトの下限（スリッページ保護）に従って、曲線が生み出す分だけの出力を返します。

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out`は、固定された出力量を要求し、最大インの上限に従って、必要なだけの入力を消費します。

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

すべてのスワップにおける末尾の`min-out` / `max-in`引数はスリッページガードです。最新のクォート（下記）に許容範囲を加えて設定すると、実行価格がそれを超える場合にトランザクションが取り消されます。

## クォート（価格プレビュー）

クォートは読み取り専用です。スワップを送信せずにプレビューするため、クライアントはユーザーが署名する前に予想される出力と手数料を表示できます。これらは、Trade UIの価格フィールドを支える自然な裏付けとなります。

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

返される`fee`は、AMMが取引に適用するスワップ手数料です。手数料とスリッページのレベルはプール/パラメータによって決まります。手作業で計算するのではなく、クォートエンドポイントを使用して、任意の取引に対する具体的な効果を確認してください。

## プールと残高の確認

これらはすべて、誰でも実行できる読み取り専用クエリです。

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool`は、プールのリザーブ、LP供給量、タイプ、ステータス、および実行中の加重平均価格を返します。`lp-balance`は、アカウントがそのプールに対して保有するLPトークンの`balance`を返します。

## プールの一時停止と再開

プールは、プールの権限（`--from`経由で渡されるアドレス）によって一時停止および再開できます。一時停止されたプールは、再開されるまでスワップと流動性の変更を拒否します。これは、インシデント対応や協調的なメンテナンスに役立ちます。

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## コマンドの要約

**トランザクション**（`qorechaind tx amm …`）：

| コマンド | 目的 |
| --- | --- |
| `create-pool` | `constant_product`または`stable_swap`プールを作成する |
| `add-liquidity` | リザーブを預け入れてLPトークンをミントする |
| `remove-liquidity` | LPトークンをバーンしてリザーブを引き出す |
| `swap-exact-in` | 固定された入力量をスワップする |
| `swap-exact-out` | 固定された出力量にスワップする |
| `pause-pool` | プールを一時停止する（権限） |
| `resume-pool` | 一時停止されたプールを再開する（権限） |

**クエリ**（`qorechaind query amm …`）：

| コマンド | 目的 |
| --- | --- |
| `params` | モジュールパラメータを表示する |
| `pool` | IDで1つのプールを表示する |
| `pools` | すべてのプールを一覧表示する |
| `pool-by-denoms` | デノムペアからプールを解決する |
| `lp-balance` | プール内のアカウントのLP残高 |
| `quote-exact-in` | 固定入力スワップの出力をプレビューする |
| `quote-exact-out` | 固定出力スワップの入力をプレビューする |

## 関連項目

- **ダッシュボードのTrade / DEX**は、これらのプール、クォート、スワップを日常的なユーザー向けのグラフィカルインターフェースで提供します。
- QORの供給量、手数料、価値がチェーン全体をどのように流れるかについては、[トークノミクス](/architecture/tokenomics)を参照してください。
- [Trade / DEX](/dashboard/trade)インターフェースで、ご自身でスワップを試してください。
- 最初にQoreChainに資産を持ち込むには、[資産のブリッジ](/user-guide/bridging-assets)を参照してください。
