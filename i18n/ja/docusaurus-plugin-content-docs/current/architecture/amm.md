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
以下のコマンドは`qorechaind`を使用します。お使いの環境に合わせて、通常のトランザクションフラグ（`--from`、`--chain-id`、`--gas`、`--fees`、`--node`）を追加してください。たとえば、メインネットに対しては`--chain-id qorechain-vladi --gas 400000 --fees 40000uqor`を指定します（ネットワークの手数料下限はガス1単位あたり0.1 uqorです）。すべての`tx amm`コマンドはCosmosレーンのトランザクションであるため、ハイブリッド耐量子署名が必要です。`--generate-only > tx.json`を追加し、続けて`qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>`を実行してください（[最初のトランザクション](/getting-started/first-transaction#send-qor)を参照）。
:::

:::caution まだプールは存在しません
AMMモジュールはメインネットとテストネット（どちらも v3.2.4）で稼働していますが、**まだプールは作成されておらず**（2026年10月23日に確認：両方で`GET /qorechain/amm/v1/pools`は空のリストを返します）、以下の例のデノム（`uusdc`、`uusdt`）は説明用です。現在、そのような資産はネットワーク上に存在しません。プールが存在するまでは、すべてのスワップまたは流動性追加コマンドが、プールが見つからないというエラーで失敗します。
:::

## モジュールパラメータ {#parameters}

現在の値は`qorechaind query amm params`または`GET /qorechain/amm/v1/params`で確認できます。メインネットとテストネットは現在、同じ値を返します。

| パラメータ | 値 | 意味 |
| --- | --- | --- |
| `enabled` | `true` | モジュールのスイッチ |
| `swap_fee_bps` | `30` | スワップ手数料。入力量の0.30 % |
| `protocol_fee_bps` | `10` | スワップ手数料のうち、プロトコル分としてプールから出ていく部分（入力量の0.10 %）。残りは流動性プロバイダーのためにプールに残ります |
| `pool_creation_fee` | `100000000` | 100 QOR（uqor単位）。初期デポジットに上乗せして課金され、プール作成時にバーンされます |
| `min_liquidity` | `1000` | 新規プールの2つの初期デポジットのうち小さい方は、少なくともこの基本単位数が必要です |
| `max_pools_per_creator` | `50` | 1つのアカウントが作成できるプール数 |
| `max_swap_impact_bps` | `500` | スワップが持ち得る最大の価格インパクト（5 %）。[スワップのルール](#swap-rules)を参照 |
| `lp_token_decimals` | `6` | プールのLPトークンの小数桁数 |

## v3.2.2以降で強制されるスワップのルール {#swap-rules}

以下のAMM整合性の修正は、v3.2.2（高さ3,556,788、2026年10月16日）でメインネットに適用され、v3.2.3（高さ3,662,051、2026年10月20日）で改良されました。これらは、どのレーンから届くスワップにも適用されます。

* **両方のデノムがプールに紐づけられます。** スワップは、対象とするプールの2つのデノムを指定する必要があります。ステーブルスワッププールは、両方向（exact-inとexact-out）でステーブルスワップ曲線を使って価格付けされます。
* **プロトコル手数料。** スワップ手数料のプロトコル分はプールから出ていきます。QORで支払われる場合は手数料コレクターに送られ、そのブロックの他の手数料と分配されます（[トークノミクス](/architecture/tokenomics)を参照）。バーンされた部分は`amm`のバーンソースに記録されます。QOR以外のデノムの場合は、コミュニティプールに送られます。プール作成手数料はバーンされ、同じ`amm`ソースに記録されます。
* **価格インパクトの上限。** `max_swap_impact_bps`が強制されます。プールの価格に対する価格インパクトが5 %を超えるスワップは拒否されます。スリッページの上限を設定しないスワップ（exact-inでの`min-out`が0、またはexact-outで入力リザーブ全体をカバーする`max-in`）は、さらにブロック開始時点のプールの価格と比較して測定され、同じブロック内の先行する取引によってその価格が上限を超えて動かされていた場合は拒否されます。すべてのスワップに実際の`min-out` / `max-in`を設定してください。
* **ブロック終了時の処理の上限（v3.2.3）。** 各ブロックの終了時に、モジュールはラウンドロビン方式で最大100プールの加重平均価格（移動平均）を更新します。プールが100以下の間は、すべてのプールが毎ブロック更新されます。それを超える場合、プールの平均は`ceil(pools / 100)`ブロックを1ラウンドとして1回更新されます。この平均は参考情報であり（`pool`クエリで返されます）、スワップの価格設定には影響しません。

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

プールは、ガバナンス権限によって一時停止および再開できます。メインネットでは、これら2つのメッセージは現在サーキットブレーカーによって無効化されています。テストネットでは無効化されていません。一時停止されたプールは、再開されるまでスワップと流動性の変更を拒否します。これは、インシデント対応や協調的なメンテナンスに役立ちます。


## コマンドの要約

**トランザクション**（`qorechaind tx amm …`）：

| コマンド | 目的 |
| --- | --- |
| `create-pool` | `constant_product`または`stable_swap`プールを作成する |
| `add-liquidity` | リザーブを預け入れてLPトークンをミントする |
| `remove-liquidity` | LPトークンをバーンしてリザーブを引き出す |
| `swap-exact-in` | 固定された入力量をスワップする |
| `swap-exact-out` | 固定された出力量にスワップする |
| `pause-pool` | プールを一時停止する（ガバナンス権限。メインネットでは無効） |
| `resume-pool` | 一時停止されたプールを再開する（ガバナンス権限。メインネットでは無効） |

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
- 最初にQoreChainに資産を持ち込むには、[資産のブリッジ](/user-guide/bridging-assets)を参照してください（ブリッジはまだ稼働していません）。
- プールは[ガス抽象化](/user-guide/gas-abstraction)の手数料価格ソースにもなり得ますが、現時点で手数料として受け付けられるトークンはありません。
