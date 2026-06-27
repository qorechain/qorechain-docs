---
slug: /developer-guide/running-a-validator
title: バリデータの運用
sidebar_label: バリデータの運用
sidebar_position: 9
---

# バリデータの運用

このガイドでは、QoreChainネットワーク上でバリデータを作成する方法、プール分類システムを理解する方法、耐量子セキュリティのためにPQC鍵を登録する方法、そしてノードをモニタリングする方法を扱います。

:::note
このガイドは、**`qorechain-vladi`** メインネット（EVMチェーンID **9801**）を対象としています。これは2026年6月7日にチェーンバージョン **v3.1.77** で稼働を開始しました。本番投入前にセットアップをリハーサルするには、**`qorechain-diana`** テストネット（EVMチェーンID **9800**）の使用を推奨します。対象ネットワークに応じた適切な `--chain-id` に置き換えてください。
:::

---

## 前提条件

* 完全に同期された `qorechaind` ノード（[テストネットへの接続](/getting-started/connecting-to-testnet)を参照）
* 初回の自己委任のために、少なくとも **1,000 QOR**（1,000,000,000 uqor）を保有する資金供給済みアカウント
* [ステーキングと委任](/user-guide/staking-and-delegation)モデルへの理解

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
| `--amount`                     | 自己委任額（最低ステーク）                          |
| `--pubkey`                     | バリデータコンセンサス公開鍵（ed25519）             |
| `--moniker`                    | バリデータの人間が読める名前                         |
| `--commission-rate`            | 初期コミッションレート（例: 0.10 = 10%）            |
| `--commission-max-rate`        | 最大コミッションレート（作成後は変更不可）           |
| `--commission-max-change-rate` | 1日あたりの最大コミッション変更レート               |
| `--min-self-delegation`        | オペレータが自己委任しなければならない最小トークン数 |

トランザクションが確定したら、バリデータを検証します。

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## プール分類

QoreChainは、`x/qca`（Quantum Consensus Allocation）モジュールによって管理される **3プール分類システム** を使用します。**1,000ブロック** ごとに、バリデータはレピュテーションとステークに基づいて3つのプールのいずれかに再分類されます。

| プール                                 | 基準                                              | ブロック割り当て |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS**（Reputation Proof-of-Stake） | レピュテーション >= 70パーセンタイル かつ ステーク >= 中央値 | ブロックの40%    |
| **DPoS**（Delegated Proof-of-Stake）  | 総委任額 >= 10,000 QOR                            | ブロックの35%    |
| **PoS**（Proof-of-Stake）             | 残りのすべてのアクティブバリデータ                  | ブロックの25%    |

各プール内では、ブロックプロポーザーは有効ステークに比例した **加重ランダム選択** を使用して選ばれます。この分類により、高レピュテーションと高委任の両方のバリデータが公平な代表権を得る一方、より小規模なバリデータも参加できるようになっています。

### プール分類のクエリ

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC経由:

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

バリデータのステーキング報酬は、複数の要因を組み込んだボンディングカーブによって決定されます。

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 変数     | 説明                                                       |
| -------- | ---------------------------------------------------------- |
| `R`      | 報酬額                                                     |
| `beta`   | ベース報酬レート                                           |
| `S`      | 有効ステーク                                               |
| `alpha`  | ロイヤリティスケーリング定数                               |
| `L`      | ロイヤリティ期間（継続的なステーキング時間）                |
| `Q(r)`   | レピュテーション品質係数、範囲 \[0.75 - 1.25]              |
| `P(t)`   | プロトコルフェーズ乗数（ネットワークのライフサイクルで調整） |

**重要なポイント:**

* **ロイヤリティ期間ボーナス:** 継続的にステークするバリデータは、対数的なロイヤリティ項を介して増加する報酬を受け取ります。これは長期的なコミットメントにインセンティブを与えます。
* **レピュテーション品質係数:** 0.75（低いレピュテーション）から1.25（優れたレピュテーション）の範囲です。レピュテーションは、稼働時間、成功した提案、コミュニティ参加、トランザクション検証の品質から計算されます。
* **プロトコルフェーズ乗数:** ネットワークが異なるフェーズ（ブートストラップ、成長、成熟）を経て成熟するにつれて調整されます。

---

## 累進的スラッシング

QoreChainは、繰り返し違反者へのペナルティを段階的に強化する一方、バリデータが時間をかけて回復できるようにする **累進的スラッシング** モデルを使用します。

```
penalty = base_rate * escalation^effective_count * severity
```

| パラメータ                    | 値             |
| ---------------------------- | -------------- |
| イベントあたりの最大ペナルティ | ステークの33%   |
| 減衰半減期                    | 100,000ブロック |
| ダウンタイム深刻度            | 1.0            |
| 二重署名深刻度                | 2.0            |
| ライトクライアント攻撃深刻度    | 3.0            |

1. **各違反は有効カウントを増加させる。** すべての違反（ダウンタイム、二重署名など）はバリデータの有効カウントを増加させ、それが将来のペナルティに影響します。

2. **ペナルティは指数関数的に強化される。** ペナルティは上記の式を使って有効カウントに基づいて強化されるため、繰り返し違反者ははるかに大きなペナルティに直面します。

3. **有効カウントは時間とともに減衰する。** 有効カウントは100,000ブロック（6秒ブロックで約7日）の半減期で減衰し、良好な行動の期間の後にバリデータが回復できるようにします。

4. **単発イベント対繰り返し違反。** 単発の偶発的なダウンタイムイベントは軽微なペナルティとなる一方、繰り返しの違反は指数関数的に増加する結果を引き起こします。

---

## PQC鍵の登録

バリデータは、ML-DSA-87アルゴリズムを使用して **ポスト量子暗号（PQC）公開鍵** をオプションで登録できます。これはバリデータのアイデンティティに耐量子セキュリティを提供し、ハイブリッド署名に使用できます。

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| パラメータ      | 説明                                              |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | hexエンコードされた2592バイトのML-DSA-87公開鍵      |
| `hybrid`       | 登録モード（hybrid = 古典 + PQCの両方）            |

登録を検証します。

```bash
qorechaind query pqc key <account-address>
```

:::tip
**推奨事項:** PQC鍵の登録はオプションですが、メインネットで運用するバリデータには強く推奨されます。量子コンピューティングの脅威に対する将来を見据えた防御を提供します。
:::

---

## モニタリング

### Prometheusメトリクス

QoreChainはポート **26660** でPrometheusメトリクスを公開しています。

```
http://localhost:26660/metrics
```

モニタリングすべき主要なメトリクス:

| メトリクス                       | 説明                                            |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | バリデータが見逃したブロックの総数               |
| `qorechain_validator_uptime`    | 直近のNブロックにわたる稼働率                     |
| `qorechain_reputation_score`    | 現在のレピュテーションスコア                      |
| `qorechain_pool_classification` | 現在のプール割り当て（0=PoS, 1=DPoS, 2=RPoS）     |
| `qorechain_consecutive_signed`  | 連続して署名されたブロック                        |
| `consensus_height`              | 現在のブロック高さ                               |
| `consensus_rounds`              | 現在の高さのコンセンサスラウンド                  |

### レピュテーションスコアのクエリ

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC経由:

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

1. **セントリーノードアーキテクチャを使用する。** DDoS攻撃から保護するために、バリデータをセントリーノードの背後で運用します。公開ネットワークにはセントリーノードのみを公開してください。

2. **アラートを設定する。** 見逃したブロック、低い稼働率、予期しない再起動に対するアラートを設定します。数ブロックの見逃しは正常ですが、継続的な見逃しはスラッシングを引き起こします。

3. **高い稼働率を維持する。** レピュテーションシステムは一貫した稼働率に報います。長期のダウンタイムはレピュテーション品質係数を低下させ、報酬を減らします。

4. **ソフトウェアを最新に保つ。** QoreChainのリリースを追跡し、アップデートを速やかに適用します。チェーンのアップグレードについてはバリデータコミュニティと協調してください。

5. **鍵を保護する。** バリデータコンセンサスキーには、ハードウェアセキュリティモジュール（HSM）またはリモート署名者を使用します。ノードと同じマシンに鍵を決して保存しないでください。

6. **PQC鍵を登録する。** ML-DSA-87鍵を登録して、量子の脅威に対してバリデータを将来にわたって保護します。

7. **プールをモニタリングする。** 1,000ブロックごとにプール分類を追跡します。レピュテーションを改善すると、PoSからRPoSに移行でき、ブロック提案の機会が大幅に増加します。

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

## 次のステップ

* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* [EVM開発](/developer-guide/evm-development) — QoreChain上にスマートコントラクトをデプロイする
* [アカウントアブストラクション](/developer-guide/account-abstraction) — バリデータ運用のためのプログラマブルアカウント
