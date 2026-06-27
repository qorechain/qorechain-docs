---
slug: /rollups/preset-profiles
title: プリセットプロファイル
sidebar_label: プリセットプロファイル
sidebar_position: 2
---

# プリセットプロファイル

RDK は、一般的なアプリケーションカテゴリ向けに調整されたターンキーのロールアップ構成を提供する **プリセットプロファイル** を備えています。プリセットは決済モード、シーケンサーモード、データ可用性バックエンド、実行パラメータをまとめるため、すべてのオプションを手作業で選ぶことなくロールアップを起動できます。

プロファイルは `create-rollup` に位置引数として渡します:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
以下のプリセットごとの値は、出荷されている **`@qorechain/rdk`** のプロファイルデフォルトと一致しており、ネットワークが公開しているプロファイルテーブルを反映しています。RDK の成熟に伴い変化する可能性があります。権威ある構成については、`qorechaind query rdk config`（または SDK の `RdkClient.params()`）でライブのモジュールパラメータをクエリし、メインネットの前に **`qorechain-diana`** テストネット上で検証してください。
:::

---

## プリセットプロファイル

各プリセットは、決済パラダイム（およびその決済が必要とする証明システム）、シーケンサーモード、データ可用性バックエンド、ガスモデル、VM をまとめています:

| プロファイル | 決済（証明） | シーケンサー | DA | ガスモデル | VM | 想定ユースケース |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi および AMM スタイルのアプリケーション — 高速ファイナリティと予測可能な手数料が重要なレンディング市場、DEX、デリバティブ |
| **`gaming`** | based | based | native | flat | custom | 高スループット・低レイテンシのゲーム状態とゲーム内経済 |
| **`nft`** | optimistic (fraud) | dedicated | native（Celestia DA 計画中） | standard | CosmWasm | NFT のミント、マーケットプレイス、デジタルコレクティブル |
| **`enterprise`** | based | based | native | subsidized | EVM | スポンサー付き（補助された）手数料を伴うパーミッション型・コンソーシアム型のデプロイ |
| **`custom`** | 完全パラメータ化（デフォルト: optimistic / fraud） | 完全パラメータ化 | 完全パラメータ化 | 完全パラメータ化 | 完全パラメータ化（デフォルト: EVM） | すべてのフィールドがユーザー定義 — ゼロから始め、各オプションを自分で設定する |

いくつかの制約が [決済 → 証明マトリクス](/rollups/overview) から導かれます: `optimistic` 決済は `fraud` 証明を使用し、`zk` は `snark`（または `stark`）を使用し、`based` と `sovereign` は証明を持ちません。`based` 決済は常に `based` シーケンサーモードとペアになります。`nft` プリセットは現在ネイティブで決済し、**Celestia DA は計画中** です。

:::note
プリセットごとの構成はチェーンバージョン **v3.1.74** 上でライブ検証されており、そこでは `create-rollup` がプロファイルのプリセットを自動的に適用します: **`defi` = zk + EVM、`gaming` = based + custom VM、`nft` = optimistic + CosmWasm、`enterprise` = based + EVM、`custom` = optimistic + EVM（デフォルト）**。`custom` プリセットはすべてのフィールドを開いたままにします — 表示されている値はその開始時のデフォルトです。
:::

4 つのドメインプリセットを妥当な出発点として、**`custom`** プロファイルを完全に開かれた選択肢として扱ってください。バンドルされる正確なパラメータはリリース間で変わる可能性があります。権威ある値については `rdk config`（下記）をクエリし、最も近いプリセットから始めて調整してください。

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI は、実行可能なスタータープロジェクトをスキャフォールドします — プロファイルごとに 1 つのテンプレート（`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`） — そのため、1 つのコマンドでプロファイルから動作する作成/クエリコードへ移行できます。

---

## 推奨を得る: `suggest-profile`

どのプリセットが適しているか分からない場合、`suggest-profile` クエリはユースケースの平易な言葉での説明を受け取り、推奨プロファイルを返します。

```bash
qorechaind query rdk suggest-profile [use-case]
```

**例:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

この提案は有用な出発点です — 構成を確定する前に、推奨内容を具体的な要件（決済保証、シーケンサーの信頼モデル、データ可用性のニーズ、VM）に照らして見直してください。

---

## オンチェーンでのプリセット構成の確認

プリセットの詳細はオンチェーンで解決されるため、プロファイルが何に解決されるかを確認する権威ある方法は、モジュールと作成済みロールアップをクエリすることです:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

このパターン — デプロイ前に `config` をクエリし、その後に `rollup` をクエリする — により、進化する可能性のある文書化された値に頼るのではなく、選択したプリセットが実際に何を生成したかを正確に確認できます。

---

## 次のステップ

* **[ロールアップのデプロイ](/rollups/deploying-a-rollup)** — ダッシュボードまたは CLI 経由でプリセットからロールアップを作成し、そのライフサイクルを管理します。
* **[ロールアップ概要](/rollups/overview)** — プリセットがまとめる決済パラダイムとシーケンサーモード。
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — より低レベルのモジュールリファレンス。
