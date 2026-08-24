---
slug: /user-guide/deploying-rollups
title: ロールアップのデプロイ
sidebar_label: ロールアップのデプロイ
sidebar_position: 6
---

# ロールアップのデプロイ

このガイドでは、Rollup Development Kit(RDK)を使用してQoreChain上にアプリケーション専用ロールアップをデプロイする方法を説明します。RDKは一般的なユースケース向けのプリセットプロファイルを提供するとともに、高度なデプロイメントに向けたフルカスタマイズにも対応しています。

:::caution
RDKおよびロールアップ決済レイヤーは現在も積極的に進化を続けている機能です。以下に記載するパラメータ、プリセット、各機能の成熟度は変更される可能性があるものとして扱い、メインネットを対象とする前に必ず **`qorechain-diana`** でデプロイメントを検証してください。
:::

:::note
以下のコマンドは **`qorechain-diana`** テストネット(EVMチェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)は2026年6月7日からチェーンバージョン **v3.1.92** で稼働しています — メインネットにデプロイする際は、**Connecting to Mainnet** ページに記載のメインネット用チェーンIDとエンドポイントに置き換えてください。
:::

---

## 概要

QoreChain RDKを使用すると、開発者はQoreChain上で決済を行うソブリンロールアップを立ち上げることができます。各ロールアップは独自のブロックタイム、仮想マシン、手数料モデルを持つ独立した実行環境でありながら、QoreChainのセキュリティおよびデータ可用性の保証を継承します。

---

## プリセットプロファイル

RDKには、一般的なアプリケーションカテゴリごとに調整された5種類のプリセットプロファイルが用意されています。

| プロファイル        | 決済(証明)  | シーケンサー | DA              | ガスモデル    | VM       | 想定ユースケース |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk(SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi/AMMアプリケーション(レンディング、DEX、デリバティブ) |
| **gaming**     | based               | based     | native          | flat         | custom   | 高スループットなゲーム状態管理とリアルタイム体験 |
| **nft**        | optimistic(fraud)  | dedicated | native(Celestia DA計画中) | standard | CosmWasm | NFTミンティングおよびマーケットプレイス用途 |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | 手数料をスポンサーする許可制・コンソーシアム型デプロイメント |
| **custom**     | 完全パラメータ化 | 完全パラメータ化 | 完全パラメータ化 | 完全パラメータ化 | 完全パラメータ化 | すべてのフィールドを自分で設定 |

:::note
上記の各プリセット値は、配布されている `@qorechain/rdk` プロファイルのデフォルト値と一致しています。RDKの成熟に伴い正確な設定は変わる可能性があります — `qorechaind query rdk config`(または `RdkClient.params()`)で正式な値を照会してください。なお、`based` 決済は常に `based` シーケンサーモードと組み合わされます。
:::

---

## 要件

ロールアップをデプロイする前に、以下の要件を満たしていることを確認してください。

| 要件       | 詳細                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **最低ステーク量** | 10,000 QOR(10,000,000,000 uqor)                                                       |
| **作成バーン** | ステーク額の1%がロールアップ作成時に恒久的にバーンされます                       |
| **アカウント**       | ステーク額に加えて取引手数料に十分な残高を持つ、資金の入ったQoreChainアカウント |

---

## プリセットからのロールアップ作成

プリセットプロファイルの1つを使ってロールアップをデプロイします。

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例:** ゲーミングロールアップをデプロイする場合:

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

| パラメータ      | 選択肢                                       | 説明                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | 状態遷移の検証方法 |
| `--sequencer`  | `dedicated`, `shared`, `based`                | トランザクション順序付け戦略      |
| `--da-backend` | `native`, `external`                          | データ可用性レイヤー            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | 実行環境              |
| `--block-time` | 整数(ミリ秒)                        | 目標ブロック生成間隔   |

---

## バッチの送信

ロールアップオペレーターは、決済のためにトランザクションバッチをQoreChainへ送信します。

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

ロールアップオペレーターは、デプロイメントのライフサイクルを管理できます。

1. **ロールアップの一時停止** — ブロック生成を一時的に停止します。ロールアップの状態は保持され、再開が可能です。

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **ロールアップの再開** — 一時停止したロールアップでブロック生成を再開します。

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **ロールアップの停止(恒久的)** — ロールアップを恒久的に停止します。この操作は**取り消せません**。

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
ロールアップの停止は恒久的です。関連するすべての状態はアーカイブされますが、ロールアップを再起動することはできません。ステークされていたQOR(作成バーン分を除く)はオペレーターに返却されます。
:::

---

## ロールアップの照会

特定のロールアップの詳細を取得します。

```bash
qorechaind query rdk rollup <rollup_id>
```

QoreChain上のすべてのロールアップを一覧表示します。

```bash
qorechaind query rdk rollups
```

**出力例:**

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

## QCAIによるプロファイル提案支援

どのプロファイルが自分のユースケースに合うか分からない場合は、QCAIによる提案ツールを利用してください。

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**出力例:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

このコマンドは入力された説明を分析し、最も適したプリセットプロファイルをその理由とともに推奨します。

---

## ヒント

* まずプリセットプロファイルから始め、後からカスタマイズしてください。プリセットは対象のユースケースに合わせて最適化されています。
* 1%の作成バーンは、デプロイ時に最低ステーク額に対して一度だけ適用されるコストです。
* QoreChainのバリデーターにシーケンシングを任せる最もシンプルな構成にしたい場合は、`based` 決済を使用してください。
* バッチ送信を注意深く監視してください。バッチ送信に間隔が空くと、ネットワークからアラートがトリガーされる可能性があります。
* `suggest-profile` コマンドは有用な出発点になりますが、推奨内容は必ず自分自身の要件と照らし合わせて確認してください。
