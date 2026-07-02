---
slug: /developer-guide/running-a-validator
title: バリデータの運用
sidebar_label: バリデータの運用
sidebar_position: 9
---

# バリデータの運用

このガイドでは、QoreChain ネットワーク上でバリデータを作成する方法、プール分類システムの仕組み、量子耐性セキュリティのための PQC キーの登録、そしてノードの監視について説明します。

:::note
このガイドは、2026 年 6 月 7 日から稼働し、チェーンバージョン **v3.1.82** を実行している **`qorechain-vladi`** メインネット(EVM チェーン ID **9801**)を対象としています。本番稼働前のセットアップのリハーサルには、**`qorechain-diana`** テストネット(EVM チェーン ID **9800**)の利用を推奨します。対象ネットワークに応じて適切な `--chain-id` に置き換えてください。
:::

---

## 前提条件

* 完全に同期済みの `qorechaind` ノード([テストネットへの接続](/getting-started/connecting-to-testnet)を参照)
* 初回のセルフデリゲーションのために **1,000 QOR**(1,000,000,000 uqor)以上の残高を持つアカウント
* [ステーキングとデリゲーション](/user-guide/staking-and-delegation)モデルの理解

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

| パラメータ                      | 説明                                               |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | セルフデリゲーション額(最低ステーク)             |
| `--pubkey`                     | バリデータのコンセンサス公開鍵(ed25519)          |
| `--moniker`                    | バリデータの人間が読める名前                       |
| `--commission-rate`            | 初期手数料率(例:0.10 = 10%)                     |
| `--commission-max-rate`        | 最大手数料率(作成後は変更不可)                   |
| `--commission-max-change-rate` | 1 日あたりの手数料変更率の上限                     |
| `--min-self-delegation`        | オペレーターが自己委任すべき最低トークン量         |

トランザクションが確定したら、バリデータを確認します。

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## プール分類

QoreChain は、`x/qca`(Quantum Consensus Allocation)モジュールによって管理される **3 プール分類システム**を採用しています。**1,000 ブロック**ごとに、バリデータはレピュテーションとステークに基づいて 3 つのプールのいずれかに再分類されます。

| プール                                | 基準                                              | ブロック割り当て |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | レピュテーションが 70 パーセンタイル以上 かつ ステークが中央値以上 | ブロックの 40%    |
| **DPoS** (Delegated Proof-of-Stake)  | 総デリゲーションが 10,000 QOR 以上                | ブロックの 35%    |
| **PoS** (Proof-of-Stake)             | 残りのすべてのアクティブなバリデータ              | ブロックの 25%    |

各プール内では、ブロック提案者は実効ステークに比例した**重み付きランダム選択**によって選ばれます。この分類により、高レピュテーションのバリデータと高デリゲーションのバリデータの双方が公平に代表されるとともに、小規模なバリデータの参加も引き続き可能になります。

### 自分のプール分類を照会する

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC 経由:

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

バリデータのステーキング報酬は、複数の要素を組み込んだボンディングカーブによって決定されます。

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 変数     | 説明                                                        |
| -------- | ---------------------------------------------------------- |
| `R`      | 報酬額                                                      |
| `beta`   | 基本報酬レート                                              |
| `S`      | 実効ステーク                                                |
| `alpha`  | ロイヤルティ・スケーリング定数                              |
| `L`      | ロイヤルティ期間(継続ステーキング時間)                    |
| `Q(r)`   | レピュテーション品質係数、範囲 \[0.75 - 1.25]               |
| `P(t)`   | プロトコルフェーズ乗数(ネットワークのライフサイクルに応じて調整) |

**重要ポイント:**

* **ロイヤルティ期間ボーナス:** 継続的にステーキングしているバリデータは、対数的なロイヤルティ項を通じて増加する報酬を受け取ります。これにより長期的なコミットメントが促進されます。
* **レピュテーション品質係数:** 0.75(低いレピュテーション)から 1.25(優れたレピュテーション)までの範囲を取ります。レピュテーションは、稼働率、成功したブロック提案、コミュニティへの参加、トランザクション検証の品質から算出されます。
* **プロトコルフェーズ乗数:** ネットワークが各フェーズ(ブートストラップ、成長、成熟)を経て成熟するにつれて調整されます。

---

## プログレッシブ・スラッシング

QoreChain は、違反を繰り返すバリデータへのペナルティを段階的に引き上げつつ、時間の経過とともに回復できる**プログレッシブ・スラッシング**モデルを採用しています。

```
penalty = base_rate * escalation^effective_count * severity
```

| パラメータ                       | 値             |
| ------------------------------ | -------------- |
| 1 イベントあたりの最大ペナルティ | ステークの 33%  |
| 減衰半減期                      | 100,000 ブロック |
| ダウンタイムの重大度             | 1.0            |
| 二重署名の重大度                 | 2.0            |
| ライトクライアント攻撃の重大度    | 3.0            |

1. **違反ごとに実効カウントが増加します。** すべての違反(ダウンタイム、二重署名など)はバリデータの実効カウントを増加させ、将来のペナルティに影響します。

2. **ペナルティは指数関数的に増大します。** 上記の式に基づき、ペナルティは実効カウントに応じてエスカレートするため、違反を繰り返すとはるかに大きなペナルティが科されます。

3. **実効カウントは時間とともに減衰します。** 実効カウントは 100,000 ブロック(6 秒ブロックで約 7 日)の半減期で減衰するため、良好な運用を続けることでバリデータは回復できます。

4. **単発イベントと繰り返しの違反。** 単発の偶発的なダウンタイムイベントは軽微なペナルティで済みますが、違反を繰り返すと指数関数的に増大する結果を招きます。

---

## PQC キーの登録

バリデータは、ML-DSA-87 アルゴリズムを使用する**耐量子暗号(PQC)公開鍵**を任意で登録できます。これにより、バリデータのアイデンティティに量子耐性セキュリティが提供され、ハイブリッド署名にも使用できます。

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| パラメータ      | 説明                                               |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 16 進エンコードされた 2592 バイトの ML-DSA-87 公開鍵 |
| `hybrid`       | 登録モード(hybrid = 従来型 + PQC の両方)         |

登録を確認します。

```bash
qorechaind query pqc key <account-address>
```

:::tip
**推奨:** PQC キーの登録は任意ですが、メインネットで運用するバリデータには強く推奨されます。量子コンピューティングの脅威に対する将来を見据えた防御を提供します。
:::

---

## 監視

### Prometheus メトリクス

QoreChain はポート **26660** で Prometheus メトリクスを公開しています。

```
http://localhost:26660/metrics
```

監視すべき主要メトリクス:

| メトリクス                       | 説明                                            |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | バリデータが見逃したブロックの総数              |
| `qorechain_validator_uptime`    | 直近 N ブロックにおける稼働率                   |
| `qorechain_reputation_score`    | 現在のレピュテーションスコア                    |
| `qorechain_pool_classification` | 現在のプール割り当て(0=PoS, 1=DPoS, 2=RPoS)   |
| `qorechain_consecutive_signed`  | 連続して署名したブロック数                      |
| `consensus_height`              | 現在のブロック高                                |
| `consensus_rounds`              | 現在のブロック高におけるコンセンサスラウンド数  |

### レピュテーションスコアの照会

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC 経由:

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
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## 運用のベストプラクティス

1. **セントリーノード構成を使用する。** DDoS 攻撃からバリデータを保護するため、セントリーノードの背後でバリデータを運用してください。パブリックネットワークにはセントリーノードのみを公開します。

2. **アラートを設定する。** ブロックの見逃し、低い稼働率、予期しない再起動に対するアラートを設定してください。数ブロックの見逃しは正常な範囲ですが、継続的な見逃しはスラッシングの対象になります。

3. **高い稼働率を維持する。** レピュテーションシステムは安定した稼働率に報酬を与えます。長時間のダウンタイムはレピュテーション品質係数を低下させ、報酬を減少させます。

4. **ソフトウェアを最新に保つ。** QoreChain のリリースを追跡し、速やかにアップデートを適用してください。チェーンアップグレードの際はバリデータコミュニティと連携しましょう。

5. **鍵を安全に管理する。** バリデータのコンセンサス鍵にはハードウェアセキュリティモジュール(HSM)またはリモートサイナーを使用してください。鍵をノードと同じマシンに保存しないでください。

6. **PQC キーを登録する。** ML-DSA-87 キーを登録して、量子の脅威に対してバリデータを将来にわたって保護しましょう。

7. **自分のプールを監視する。** 1,000 ブロックごとにプール分類を追跡してください。レピュテーションを向上させることで PoS から RPoS へ移動でき、ブロック提案の機会を大幅に増やせます。

---

## バリデータコマンドリファレンス

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## 接続ネットワークの検証 {#connected-networks}

チェーンバージョン **v3.1.80** 以降、QoreChain バリデータは[ブリッジ](/architecture/bridge-architecture)を通じて接続されたネットワークの検証にも参加できます。これは**ライセンスゲート付きのオプトイン**機能です:

1. **ライセンスを保有する。** バリデータは対象ネットワークに対する有効な `validator_<chain>`(または `qcb_bridge`)ライセンスを保有している必要があります。オーケストレーターは、ライセンスがない場合は外部クライアントの起動を拒否します(フェイルクローズド)。
2. **アクティベーションによりクライアントが自動プロビジョニングされる。** ライセンスがアクティベートされると、QoreChain は対応するネットワークのクライアントをあなたのノード上にプロビジョニングします — ピン留めされたクライアントのダウンロード、設定のレンダリング、QoreChain のオーケストレーション下での実行が行われます。アクティベーションまでは何も取得されません。
3. **そのネットワークの鍵とステークを用意する。** 外部ネットワークのバリデータ/ステークおよび署名鍵は、ネットワークごとに**オペレーターが用意**します。QoreChain が提供するのはドライバーフレームワークと強制されるライセンスゲートであり、外部チェーンのステークではありません。

ドライバーは **37 のブリッジネットワーク**すべてに用意されており、バリデータの参加形態によって分類されます:

| クラス | 参加形態 | 例 |
| ----- | ------------- | -------- |
| パーミッションレス・バリデータ | ステークして運用 | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| 上限あり / 選出制 / 承認制 | 上限または選出の対象となるステーク | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 フルノード | フルノードを運用(ステーキングなし) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| 非ステーキング / トラストリスト | ステーキングなしで観測 / 参加 | Bitcoin, Filecoin, XRPL, Stellar |

:::note
クライアントバージョンのピン留めはベストエフォートです。本番環境でのアクティベーションの前に、対象ネットワークの上流クライアントのリリースを確認してください。
:::

## 次のステップ

* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* [EVM 開発](/developer-guide/evm-development) — QoreChain にスマートコントラクトをデプロイする
* [アカウント抽象化](/developer-guide/account-abstraction) — バリデータ運用のためのプログラマブルアカウント
