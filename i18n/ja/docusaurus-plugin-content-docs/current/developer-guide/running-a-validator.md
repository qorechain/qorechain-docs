---
slug: /developer-guide/running-a-validator
title: バリデータの運用
sidebar_label: バリデータの運用
sidebar_position: 9
---

# バリデータの運用

このガイドでは、QoreChain ネットワーク上でバリデータを作成する方法、プール分類システムの仕組み、量子耐性セキュリティのための PQC 鍵の登録方法、そしてノードの監視方法について説明します。

:::note
このガイドは、2026年6月7日から稼働しているメインネット **`qorechain-vladi`**（EVM チェーン ID **9801**）を対象としており、チェーンバージョン **v3.1.92** で稼働しています。本番稼働前のセットアップのリハーサルには、テストネット **`qorechain-diana`**（EVM チェーン ID **9800**）の利用を推奨します。対象ネットワークに応じて `--chain-id` を適宜置き換えてください。
:::

---

## 前提条件

* 完全に同期済みの `qorechaind` ノード（[テストネットへの接続](/getting-started/connecting-to-testnet)を参照）
* 初期自己委任のために少なくとも **1,000 QOR**（1,000,000,000 uqor）を保有する資金入りアカウント
* [ステーキングとデリゲーション](/user-guide/staking-and-delegation)モデルへの理解

---

## バリデータの作成

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| パラメータ                       | 説明                                                |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | 自己委任額（最小ステーク量）                          |
| `--pubkey`                     | バリデータのコンセンサス公開鍵（ed25519）             |
| `--moniker`                    | バリデータの人が読める名前                            |
| `--commission-rate`            | 初期コミッション率（例: 0.10 = 10%）                  |
| `--commission-max-rate`        | 最大コミッション率（作成後は変更不可）                 |
| `--commission-max-change-rate` | コミッション率の1日あたりの最大変更幅                  |
| `--min-self-delegation`        | 運営者が自己委任しなければならない最小トークン数        |

トランザクションが確定したら、バリデータを確認します。

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## プール分類

QoreChain は `x/qca`（Quantum Consensus Allocation）モジュールが管理する**3プール分類システム**を採用しています。**1,000ブロック**ごとに、バリデータはその評判とステーク量に基づいて3つのプールのいずれかに再分類されます。

| プール                                | 基準                                                | ブロック配分   |
| ------------------------------------ | -------------------------------------------------- | ------------- |
| **RPoS**（Reputation Proof-of-Stake） | 評判が70パーセンタイル以上 かつ ステーク量が中央値以上 | ブロックの40% |
| **DPoS**（Delegated Proof-of-Stake）  | 総委任額が10,000 QOR以上                            | ブロックの35% |
| **PoS**（Proof-of-Stake）             | それ以外のすべてのアクティブなバリデータ              | ブロックの25% |

各プール内では、実効ステーク量に比例する**加重ランダム選出**によってブロックプロポーザーが選ばれます。この分類により、高評判のバリデータと高委任額のバリデータの双方が公平に代表される一方で、小規模なバリデータの参加も可能になっています。

### プール分類の照会

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC 経由の場合:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## ボンディングカーブ

バリデータへのステーキング報酬は、複数の要因を組み込んだボンディングカーブによって決定されます。

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 変数     | 説明                                                        |
| -------- | ---------------------------------------------------------- |
| `R`      | 報酬額                                                      |
| `beta`   | 基本報酬率                                                  |
| `S`      | 実効ステーク量                                              |
| `alpha`  | ロイヤルティ係数                                            |
| `L`      | ロイヤルティ期間（継続ステーキング時間）                      |
| `Q(r)`   | 評判品質係数、範囲 \[0.75 - 1.25]                            |
| `P(t)`   | プロトコルフェーズ乗数（ネットワークのライフサイクルに応じて調整） |

**要点:**

* **ロイヤルティ期間ボーナス:** 継続的にステークするバリデータは、対数のロイヤルティ項によって報酬が増加していきます。これにより長期的なコミットメントが促進されます。
* **評判品質係数:** 0.75（評判が低い）から1.25（評判が高い）の範囲を取ります。評判は稼働率、ブロック提案の成功、コミュニティへの参加、トランザクション検証の品質から算出されます。
* **プロトコルフェーズ乗数:** ネットワークがブートストラップ期、成長期、成熟期といった各フェーズを経るにつれて調整されます。

---

## スラッシング

基本的な違反ペナルティは、次のコマンドでライブに照会でき、本記事執筆時点の内容は以下のとおりです。

```bash
qorechaind query slashing params
```

| パラメータ | 値 |
| --- | --- |
| 署名済みブロックのウィンドウ | 10,000ブロック（累積に約6時間） |
| ウィンドウ内での最低署名率 | 95%（これを下回るとジェイルされます） |
| ダウンタイムジェイル期間 | 600秒（10分） |
| ダウンタイムのスラッシュ率 | ステークの1% |
| 二重署名のスラッシュ率 | ステークの5% |

ジェイルは固定10分のタイムアウトと固定ペナルティであり、以下の段階的モデルとは別のものです。段階的モデルは、より長い時間軸で繰り返される違反に対し、追加のエスカレートするペナルティを積み重ねます。

## 段階的スラッシング

QoreChain は、違反を繰り返す者へのペナルティを段階的に強めつつ、時間の経過によってバリデータが回復できるようにする**段階的スラッシング**モデルを採用しています。

```
penalty = base_rate * escalation^effective_count * severity
```

| パラメータ                | 値              |
| ------------------------- | -------------- |
| 1イベントあたりの最大ペナルティ | ステークの33%   |
| 減衰半減期                 | 100,000ブロック |
| ダウンタイムの深刻度         | 1.0            |
| 二重署名の深刻度            | 2.0            |
| ライトクライアント攻撃の深刻度 | 3.0            |

1. **各違反は実効カウントを増加させます。** ダウンタイムや二重署名などの違反が発生するたびに、バリデータの実効カウントが増加し、以後のペナルティに影響します。

2. **ペナルティは指数関数的に増大します。** 上記の式に基づき、実効カウントに応じてペナルティが段階的に強まるため、違反を繰り返すバリデータははるかに大きなペナルティを受けます。

3. **実効カウントは時間とともに減衰します。** 実効カウントは半減期100,000ブロック（6秒ブロックで約7日間）で減衰するため、一定期間良好な状態を維持したバリデータは回復できます。

4. **単発の違反と繰り返しの違反。** 単発の偶発的なダウンタイムは軽微なペナルティで済みますが、違反が繰り返されると指数関数的に増大する結果を招きます。

---

## PQC 鍵の登録 {#pqc-key-registration}

バリデータライセンスへの申請や `create-validator` の実行**前**に、**耐量子暗号（PQC）公開鍵**（ML-DSA-87）を登録してください。これは**任意ではなく、また自動でもありません**。チェーンはすべての cosmos パスのトランザクションにハイブリッド PQC 署名を要求し、`MsgCreateValidator` は例外対象のメッセージタイプには含まれていません。さらに、初回のトランザクションで自動的に鍵が登録される通常のアカウントとは異なり、バリデータ自身が事前に、自分のノード上でこのコマンドを実行する必要があります。

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas 600000 \
  -y
```

| パラメータ      | 説明                                              |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 16進エンコードされた2592バイトの ML-DSA-87 公開鍵     |
| `hybrid`       | 登録モード（hybrid = 従来型 + PQC の両方）           |

:::caution `--gas` を明示的に指定してください
ML-DSA-87 の公開鍵は2,592バイトあり、これをオンチェーンに書き込むとデフォルトの200,000ガス上限を超えてしまいます。`--gas 600000`（またはそれ以上）を指定しない場合、トランザクションは不可解な `out of gas in location: WritePerByte` エラーで失敗します。
:::

登録を確認します。

```bash
qorechaind query pqc key <account-address>
```

---

## モニタリング

### Prometheus メトリクス

QoreChain はポート **26660** で Prometheus メトリクスを公開しています。

```
http://localhost:26660/metrics
```

監視すべき主なメトリクス:

| メトリクス                        | 説明                                             |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | バリデータが見逃したブロックの総数                    |
| `qorechain_validator_uptime`    | 直近Nブロックにおける稼働率                          |
| `qorechain_reputation_score`    | 現在の評判スコア                                    |
| `qorechain_pool_classification` | 現在のプール割り当て（0=PoS、1=DPoS、2=RPoS）          |
| `qorechain_consecutive_signed`  | 連続して署名したブロック数                            |
| `consensus_height`              | 現在のブロック高                                    |
| `consensus_rounds`              | 現在のブロック高におけるコンセンサスラウンド数           |

### 評判スコアの照会

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC 経由の場合:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### ヘルスチェック

```bash
# ノードステータス
qorechaind status | jq '.sync_info'

# バリデータの署名情報（稼働率、見逃したブロック）
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# バリデータがアクティブセットに含まれているか確認
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## 運用のベストプラクティス

1. **センチネルノード構成を使用する。** バリデータをセンチネルノードの背後で稼働させ、DDoS攻撃から保護します。パブリックネットワークにはセンチネルノードのみを公開してください。

2. **アラートを設定する。** 見逃したブロック、低い稼働率、予期しない再起動に対してアラートを設定します。少数のブロック見逃しは正常な範囲ですが、継続的な見逃しはスラッシングを引き起こします。

3. **高い稼働率を維持する。** 評判システムは一貫した稼働率に報酬を与えます。長時間のダウンタイムは評判品質係数を低下させ、報酬を減少させます。

4. **ソフトウェアを最新に保つ。** QoreChain のリリースを追跡し、速やかにアップデートを適用してください。チェーンアップグレードの際はバリデータコミュニティと連携してください。

5. **鍵を安全に管理する。** バリデータのコンセンサス鍵には、ハードウェアセキュリティモジュール（HSM）またはリモート署名者を使用してください。鍵をノードと同じマシンに保管しないでください。

6. **PQC 鍵を登録する。** ML-DSA-87 鍵を登録することで、バリデータを量子の脅威に対して将来にわたって備えられます。

7. **自分のプールを監視する。** 1,000ブロックごとにプール分類を確認してください。評判を改善することで PoS から RPoS へ移行でき、ブロック提案の機会を大幅に増やすことができます。

---

## バリデータコマンドリファレンス

```bash
# バリデータのメタデータを編集
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# ダウンタイムによるスラッシング後のアンジェイル
qorechaind tx slashing unjail --from mykey -y

# 追加ステークの委任
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# 報酬の引き出し
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## 接続ネットワークの検証 {#connected-networks}

チェーンバージョン **v3.1.80** 以降、QoreChain バリデータは[ブリッジ](/architecture/bridge-architecture)を通じて接続された各ネットワークの検証も支援できるようになりました。これは**ライセンスによってゲートされたオプトイン機能**です。

1. **ライセンスを保有する。** バリデータは対象ネットワーク向けの有効な `validator_<chain>`（または `qcb_bridge`）ライセンスを保有している必要があります。オーケストレータは、ライセンスがなければ外部クライアントの起動を拒否します（フェイルクローズ）。
2. **有効化によりクライアントが自動プロビジョニングされる。** ライセンスが有効化されると、QoreChain は該当ネットワークのクライアントをノード上に自動的にプロビジョニングします。ピン留めされたクライアントのダウンロード、設定のレンダリング、QoreChain のオーケストレーション下での実行が行われます。有効化されるまでは何も取得されません。
3. **対象ネットワークの鍵とステークを用意する。** 外部ネットワークのバリデータ/ステークおよび署名鍵は、ネットワークごとに**運営者が用意するもの**です。QoreChain が提供するのはドライバーフレームワークと強制されるライセンスゲートであり、外部チェーンでのステークそのものではありません。

**37のブリッジネットワーク**すべてに対応するドライバーが存在し、バリデータの参加方法によって以下のように分類されます。

| クラス                     | 参加形態                             | 例                                                                          |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| パーミッションレス・バリデータ | ステークして稼働                     | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| 上限あり／選出制／参加承認制    | ステークするが、上限または選出制の対象 | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera                  |
| L2フルノード                | フルノードを稼働（ステーキングなし）   | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum                        |
| 非ステーキング／トラストリスト | ステーキングなしで観測／参加           | Bitcoin, Filecoin, XRPL, Stellar                                           |

:::note
クライアントバージョンのピン留めはベストエフォートです。本番稼働での有効化の前に、対象ネットワークの上流クライアントのリリースを必ず確認してください。
:::

## 次のステップ

* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上でスマートコントラクトをデプロイする
* [アカウントアブストラクション](/developer-guide/account-abstraction) — バリデータ運用のためのプログラマブルアカウント
