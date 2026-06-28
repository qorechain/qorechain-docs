---
slug: /user-guide/deploying-rollups
title: ロールアップのデプロイ
sidebar_label: ロールアップのデプロイ
sidebar_position: 6
---

# ロールアップのデプロイ

このガイドでは、Rollup Development Kit（RDK）を使用して QoreChain 上にアプリケーション固有のロールアップをデプロイする方法について説明します。RDK は、一般的なユースケース向けのプリセットプロファイルと、高度なデプロイ向けの完全なカスタマイズを提供します。

:::caution
RDK とロールアップ決済レイヤーは、活発に進化している機能です。以下のパラメータ、プリセット、および個々の機能の成熟度は変更される可能性があるものとして扱い、メインネットを対象とする前に **`qorechain-diana`** でデプロイを検証してください。
:::

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用します。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は、チェーンバージョン **v3.1.80** で稼働し、2026 年 6 月 7 日以降稼働中です。メインネットにデプロイする際は、**メインネットへの接続** ページからメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

---

## 概要

QoreChain RDK により、開発者は QoreChain 上で決済を行うソブリンロールアップを起動できます。各ロールアップは、独自のブロックタイム、仮想マシン、手数料モデルを持つ独立した実行環境であり、同時に QoreChain のセキュリティとデータ可用性の保証を継承します。

---

## プリセットプロファイル

RDK には 5 つのプリセットプロファイルが付属しており、それぞれが一般的なアプリケーションカテゴリ向けに調整されています。

| プロファイル        | 決済（証明）  | シーケンサー | DA              | ガスモデル    | VM       | 想定ユースケース |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi/AMM アプリケーション（レンディング、DEX、デリバティブ） |
| **gaming**     | based               | based     | native          | flat         | custom   | 高スループットなゲーム状態とリアルタイム体験 |
| **nft**        | optimistic (fraud)  | dedicated | native（Celestia DA は計画中） | standard | CosmWasm | NFT のミントとマーケットプレイスのワークロード |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | スポンサー手数料を備えた許可制およびコンソーシアムのデプロイ |
| **custom**     | 完全にパラメータ化 | 完全にパラメータ化 | 完全にパラメータ化 | 完全にパラメータ化 | 完全にパラメータ化 | すべてのフィールドを自分で設定 |

:::note
上記のプリセットごとの値は、出荷時の `@qorechain/rdk` プロファイルのデフォルトと一致します。正確な構成は RDK の成熟に伴い変化する可能性があります。権威ある値は `qorechaind query rdk config`（または `RdkClient.params()`）でクエリしてください。また、`based` 決済は常に `based` シーケンサーモードと組み合わせて使用されることに注意してください。
:::

---

## 要件

ロールアップをデプロイする前に、以下の要件を満たしていることを確認してください。

| 要件       | 詳細                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **最小ステーク** | 10,000 QOR（10,000,000,000 uqor）                                                       |
| **作成バーン** | ステーク額の 1% がロールアップ作成時に永久にバーンされます                       |
| **アカウント**       | ステークとトランザクション手数料に十分な残高を持つ、資金が投入された QoreChain アカウント |

---

## プリセットからロールアップを作成する

プリセットプロファイルのいずれかを使用してロールアップをデプロイします。

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** ゲーミングロールアップをデプロイする:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## カスタムロールアップの作成

ロールアップパラメータを完全に制御するには、`custom` プロファイルを使用して各オプションを指定します。

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**カスタムパラメータ:**

| パラメータ      | オプション                                       | 説明                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | 状態遷移の検証方法 |
| `--sequencer`  | `dedicated`, `shared`, `based`                | トランザクションの順序付け戦略      |
| `--da-backend` | `native`, `external`                          | データ可用性レイヤー            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | 実行環境              |
| `--block-time` | 整数（ミリ秒）                        | 目標ブロック生成間隔   |

---

## バッチの送信

ロールアップオペレーターは、決済のためにトランザクションバッチを QoreChain に送信します。

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## ロールアップのライフサイクル管理

ロールアップオペレーターは、デプロイのライフサイクルを管理できます。

1. **ロールアップの一時停止** — ブロック生成を一時的に停止します。ロールアップの状態は保持され、再開できます。

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **ロールアップの再開** — 一時停止したロールアップのブロック生成を再開します。

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **ロールアップの停止（永久）** — ロールアップを永久に停止します。この操作は **取り消せません**。

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
ロールアップの停止は永久的です。関連するすべての状態はアーカイブされますが、ロールアップを再起動することはできません。ステークされた QOR（作成バーンを除く）はオペレーターに返却されます。
:::

---

## ロールアップのクエリ

特定のロールアップに関する詳細を取得します。

```bash
qorechaind query rdk rollup <rollup_id>
```

QoreChain 上のすべてのロールアップを一覧表示します。

```bash
qorechaind query rdk rollups
```

**サンプル出力:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## QCAI 支援によるプロファイル提案

どのプロファイルがユースケースに合うかわからない場合は、QCAI 支援の提案ツールを使用してください。

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**サンプル出力:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

このコマンドは、あなたの説明を分析し、最も適したプリセットプロファイルを説明とともに推奨します。

---

## ヒント

* プリセットプロファイルから始めて、後でカスタマイズしてください。プリセットは対象ユースケース向けに最適化されています。
* 1% の作成バーンは、デプロイ時に最小ステークに対して適用される一回限りのコストです。
* QoreChain バリデータがシーケンシングを処理する最もシンプルなセットアップが必要な場合は、`based` 決済を使用してください。
* バッチ送信を注意深く監視してください。バッチ送信のギャップは、ネットワークからのアラートをトリガーする可能性があります。
* `suggest-profile` コマンドは便利な出発点ですが、推奨内容を自分の具体的な要件と照らし合わせて確認してください。
