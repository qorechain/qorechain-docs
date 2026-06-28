---
slug: /developer-guide/running-a-validator
title: バリデータの運用
sidebar_label: バリデータの運用
sidebar_position: 9
---

# バリデータの運用

このガイドでは、QoreChain ネットワークでバリデータを作成する方法、プール分類システムの理解、量子耐性セキュリティのための PQC キーの登録、そしてノードの監視について説明します。

:::note
このガイドは **`qorechain-vladi`** メインネット（EVM チェーン ID **9801**）を対象としています。これは 2026 年 6 月 7 日からチェーンバージョン **v3.1.80** で稼働しています。本番稼働の前にセットアップをリハーサルするには、**`qorechain-diana`** テストネット（EVM チェーン ID **9800**）の使用を推奨します。対象ネットワークに応じて適切な `--chain-id` を指定してください。
:::

---

## 前提条件

* 完全に同期された `qorechaind` ノード（[テストネットへの接続](/getting-started/connecting-to-testnet) を参照）
* 初回の自己委任のために少なくとも **1,000 QOR**（1,000,000,000 uqor）を保有する資金供給済みアカウント
* [ステーキングと委任](/user-guide/staking-and-delegation) モデルに関する理解

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
| `--amount`                     | 自己委任額（最小ステーク）                          |
| `--pubkey`                     | バリデータのコンセンサス公開鍵（ed25519）          |
| `--moniker`                    | バリデータの人間が読みやすい名前                    |
| `--commission-rate`            | 初期手数料率（例：0.10 = 10%）                      |
| `--commission-max-rate`        | 最大手数料率（作成後は変更不可）                    |
| `--commission-max-change-rate` | 1 日あたりの最大手数料変更率                        |
| `--min-self-delegation`        | オペレータが自己委任しなければならない最小トークン  |

トランザクションが確定したら、バリデータを確認します。

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## プール分類

QoreChain は `x/qca`（Quantum Consensus Allocation）モジュールが管理する **3 プール分類システム** を使用します。**1,000 ブロック** ごとに、バリデータはその評判とステークに基づいて 3 つのプールのいずれかに再分類されます。

| プール                               | 基準                                              | ブロック割り当て |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS**（Reputation Proof-of-Stake）| 評判 >= 70 パーセンタイル かつ ステーク >= 中央値  | ブロックの 40%   |
| **DPoS**（Delegated Proof-of-Stake） | 総委任額 >= 10,000 QOR                             | ブロックの 35%   |
| **PoS**（Proof-of-Stake）            | 残りのすべてのアクティブなバリデータ              | ブロックの 25%   |

各プール内では、ブロック提案者は実効ステークに比例した **加重ランダム選択** を用いて選ばれます。この分類により、高評判のバリデータと高委任のバリデータの両方が公平に代表される一方で、より小規模なバリデータも引き続き参加できるようになっています。

### プール分類の照会

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC 経由：

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

| 変数     | 説明                                                       |
| -------- | ---------------------------------------------------------- |
| `R`      | 報酬額                                                     |
| `beta`   | 基本報酬率                                                 |
| `S`      | 実効ステーク                                               |
| `alpha`  | ロイヤルティスケーリング定数                              |
| `L`      | ロイヤルティ期間（継続的なステーキング時間）              |
| `Q(r)`   | 評判品質係数、範囲 \[0.75 - 1.25]                          |
| `P(t)`   | プロトコルフェーズ乗数（ネットワークのライフサイクルにわたって調整される） |

**重要なポイント：**

* **ロイヤルティ期間ボーナス：** 継続的にステークするバリデータは、対数的なロイヤルティ項を通じて増加する報酬を受け取ります。これは長期的なコミットメントを奨励します。
* **評判品質係数：** 0.75（評判が低い）から 1.25（評判が優れている）の範囲です。評判は、稼働時間、提案の成功、コミュニティへの参加、トランザクション検証の品質から計算されます。
* **プロトコルフェーズ乗数：** ネットワークがさまざまなフェーズ（ブートストラップ、成長、成熟）を経て成熟するにつれて調整されます。

---

## プログレッシブスラッシング

QoreChain は、繰り返し違反するバリデータへのペナルティを段階的に引き上げる一方で、時間の経過とともに回復できるようにする **プログレッシブスラッシング** モデルを使用します。

```
penalty = base_rate * escalation^effective_count * severity
```

| パラメータ                   | 値             |
| ---------------------------- | -------------- |
| イベントごとの最大ペナルティ | ステークの 33% |
| 減衰半減期                   | 100,000 ブロック |
| ダウンタイム重大度           | 1.0            |
| 二重署名重大度               | 2.0            |
| ライトクライアント攻撃重大度 | 3.0            |

1. **各違反は実効カウントを増加させます。** すべての違反（ダウンタイム、二重署名など）はバリデータの実効カウントを増加させ、それが将来のペナルティに影響します。

2. **ペナルティは指数関数的に増大します。** ペナルティは上記の式を用いて実効カウントに基づいて増大するため、繰り返し違反するバリデータははるかに大きなペナルティに直面します。

3. **実効カウントは時間の経過とともに減衰します。** 実効カウントは 100,000 ブロック（6 秒ブロックで約 7 日）の半減期で減衰し、バリデータが一定期間の良好な振る舞いの後に回復できるようにします。

4. **単発のイベントと繰り返しの違反。** 単発の偶発的なダウンタイムイベントは軽微なペナルティになりますが、繰り返しの違反は指数関数的に増大する結果を引き起こします。

---

## PQC キーの登録

バリデータは、ML-DSA-87 アルゴリズムを使用して **耐量子計算機暗号（PQC）公開鍵** を任意で登録できます。これはバリデータの ID に対して量子耐性セキュリティを提供し、ハイブリッド署名に使用できます。

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| パラメータ     | 説明                                              |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 16 進エンコードされた 2592 バイトの ML-DSA-87 公開鍵 |
| `hybrid`       | 登録モード（hybrid = クラシカル + PQC の両方）    |

登録を確認します。

```bash
qorechaind query pqc key <account-address>
```

:::tip
**推奨：** PQC キーの登録は任意ですが、メインネットで運用するバリデータには強く推奨されます。これは量子コンピューティングの脅威に対する先を見据えた防御を提供します。
:::

---

## 監視

### Prometheus メトリクス

QoreChain はポート **26660** で Prometheus メトリクスを公開します。

```
http://localhost:26660/metrics
```

監視すべき主要なメトリクス：

| メトリクス                      | 説明                                            |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | バリデータが見逃したブロックの総数              |
| `qorechain_validator_uptime`    | 直近 N ブロックにわたる稼働率                    |
| `qorechain_reputation_score`    | 現在の評判スコア                                |
| `qorechain_pool_classification` | 現在のプール割り当て（0=PoS、1=DPoS、2=RPoS）   |
| `qorechain_consecutive_signed`  | 連続して署名したブロック数                      |
| `consensus_height`              | 現在のブロック高                                |
| `consensus_rounds`              | 現在の高さに対するコンセンサスラウンド数        |

### 評判スコアの照会

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC 経由：

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

1. **センチネルノードアーキテクチャを使用する。** DDoS 攻撃からバリデータを保護するために、センチネルノードの背後でバリデータを運用してください。公開ネットワークに公開するのはセンチネルノードのみにします。

2. **アラートを設定する。** 見逃したブロック、低い稼働率、予期しない再起動に対するアラートを設定します。数ブロックの見逃しは正常ですが、継続的な見逃しはスラッシングを引き起こします。

3. **高い稼働率を維持する。** 評判システムは一貫した稼働率を報酬とします。長時間のダウンタイムは評判品質係数を低下させ、報酬を減少させます。

4. **ソフトウェアを最新の状態に保つ。** QoreChain のリリースを追跡し、速やかにアップデートを適用します。チェーンのアップグレードについてはバリデータコミュニティと連携してください。

5. **キーを保護する。** バリデータのコンセンサスキーには、ハードウェアセキュリティモジュール（HSM）またはリモート署名者を使用します。キーをノードと同じマシンに保存しないでください。

6. **PQC キーを登録する。** ML-DSA-87 キーを登録して、量子の脅威に対してバリデータを将来にわたって保護します。

7. **プールを監視する。** 1,000 ブロックごとにプール分類を追跡します。評判を改善することで PoS から RPoS へ移行でき、ブロック提案の機会を大幅に増やすことができます。

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

## 接続されたネットワークの検証 {#connected-networks}

チェーンバージョン **v3.1.80** 以降、QoreChain バリデータは [bridge](/architecture/bridge-architecture) を通じて接続されたネットワークの検証も支援できます。これは **ライセンスゲート制かつオプトイン** です。

1. **ライセンスを保有する。** バリデータは対象ネットワークに対して有効な `validator_<chain>`（または `qcb_bridge`）ライセンスを保有している必要があります。オーケストレータはそれなしでは外部クライアントの起動を拒否します（フェイルクローズ）。
2. **アクティベーションによってクライアントが自動プロビジョニングされます。** ライセンスがアクティベートされると、QoreChain は対応するネットワークのクライアントをノード上にプロビジョニングします — ピン留めされたクライアントをダウンロードし、その設定をレンダリングし、QoreChain のオーケストレーション下で実行します。アクティベーションまで何も取得されません。
3. **ネットワークのキーとステークを提供する。** 外部ネットワークのバリデータ／ステークおよび署名キーはネットワークごとに **オペレータが提供** します。QoreChain はドライバフレームワークと強制されるライセンスゲートを提供しますが、外部チェーンのステークは提供しません。

ドライバは **37 のブリッジネットワーク** すべてに対して存在し、バリデータがどのように参加できるかによって分類されています。

| クラス | 参加方法 | 例 |
| ----- | ------------- | -------- |
| パーミッションレスバリデータ | ステークして実行 | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| 上限付き／選出制／入会制 | ステークするが上限または選出の対象 | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 フルノード | フルノードを実行（ステーキングなし） | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| 非ステーキング／トラストリスト | ステーキングなしで観測／参加 | Bitcoin, Filecoin, XRPL, Stellar |

:::note
クライアントバージョンのピン留めはベストエフォートです。本番でのアクティベーションの前に、対象ネットワークのアップストリームクライアントリリースを確認してください。
:::

## 次のステップ

* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上でスマートコントラクトをデプロイする
* [アカウント抽象化](/developer-guide/account-abstraction) — バリデータ運用のためのプログラマブルアカウント
