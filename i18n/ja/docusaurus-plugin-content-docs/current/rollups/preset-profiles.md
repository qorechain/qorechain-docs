---
slug: /rollups/preset-profiles
title: プリセットプロファイル
sidebar_label: プリセットプロファイル
sidebar_position: 2
---

# プリセットプロファイル

RDK には、一般的なアプリケーションカテゴリ向けにチューニングされたターンキーのロールアップ構成を提供する**プリセットプロファイル**が同梱されています。プリセットには、決済（セトルメント）モード、シーケンサーモード、データ可用性（DA）バックエンド、実行パラメータがまとめられており、すべてのオプションを個別に選択しなくてもロールアップを起動できます。

プロファイルは `create-rollup` に位置引数として渡します:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
以下のプリセットごとの値は、同梱の **`@qorechain/rdk`** プロファイルのデフォルト値と一致しており、ネットワークが公開しているプロファイル表を反映しています。ただし、RDK の成熟に伴い変更される可能性があります。正式な構成については、稼働中のモジュールパラメータを `qorechaind query rdk config`（または SDK の `RdkClient.params()`）で照会し、メインネットの前に **`qorechain-diana`** テストネットで検証してください。
:::

---

## プリセットプロファイル一覧

各プリセットは、決済パラダイム（およびその決済が必要とする証明システム）、シーケンサーモード、データ可用性バックエンド、ガスモデル、VM をまとめたものです:

| プロファイル | 決済（証明） | シーケンサー | DA | ガスモデル | VM | 想定ユースケース |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi や AMM 型アプリケーション — 高速なファイナリティと予測可能な手数料が重要となるレンディング市場、DEX、デリバティブ |
| **`gaming`** | based | based | native | flat | custom | 高スループット・低レイテンシのゲームステートおよびゲーム内経済 |
| **`nft`** | optimistic (fraud) | dedicated | native（Celestia DA を予定） | standard | QoreChain Native (`native`) | NFT のミント、マーケットプレイス、デジタルコレクティブル |
| **`enterprise`** | based | based | native | subsidized | EVM | 手数料スポンサー（補助）付きのパーミッションド／コンソーシアム型デプロイメント |
| **`custom`** | 完全にパラメータ化可能（デフォルト: optimistic / fraud） | 完全にパラメータ化可能 | 完全にパラメータ化可能 | 完全にパラメータ化可能 | 完全にパラメータ化可能（デフォルト: EVM） | すべてのフィールドをユーザーが定義 — ゼロから各オプションを自分で設定 |

いくつかの制約は[決済 → 証明のマトリクス](/rollups/overview)から導かれます: `optimistic` 決済は `fraud` 証明を使用し、`zk` は `snark`（または `stark`）を使用し、`based` と `sovereign` は証明を伴いません。`based` 決済は常に `based` シーケンサーモードとペアになります。`nft` プリセットは現時点ではネイティブに決済し、**Celestia DA は予定段階**です。

RDK v0.4.2 以降、Wasm VM オプション（CosmWasm コントラクトを実行するランタイム）は **`native`** — QoreChain Native — という名前になりました。`cosmwasm` は引き続きレガシーエイリアスとして受け付けられ、どちらもワイヤ上では `cosmwasm` にマップされるため、チェーン、エクスプローラー、Dashboard に変更はありません。

:::note
プリセットごとの構成は、チェーンバージョン **v3.1.74** でライブ検証されました。このバージョンでは `create-rollup` がプロファイルのプリセットを自動的に適用します: **`defi` = zk + EVM、`gaming` = based + カスタム VM、`nft` = optimistic + QoreChain Native (Wasm)、`enterprise` = based + EVM、`custom` = optimistic + EVM（デフォルト）**。`custom` プリセットはすべてのフィールドが自由に設定可能で、記載の値はその初期デフォルトです。
:::

4 つのドメイン向けプリセットは妥当な出発点として、**`custom`** プロファイルは完全に自由なオプションとして扱ってください。バンドルされる正確なパラメータはリリース間で変わる可能性があります。正式な値については（下記の）`rdk config` を照会し、最も近いプリセットから始めて調整してください。

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI は、実行可能なスタータープロジェクトをスキャフォールドします。プロファイルごとに 1 つのテンプレート（`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`）が用意されており、1 コマンドでプロファイルから動作する作成／照会コードまで到達できます。

---

## 推奨プロファイルの取得: `suggest-profile`

どのプリセットが適しているか分からない場合は、`suggest-profile` クエリにユースケースの自然言語による説明を渡すと、推奨プロファイルが返されます。

```bash
qorechaind query rdk suggest-profile [use-case]
```

**例:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

この提案はあくまで有用な出発点です。構成を確定する前に、推奨内容を自身の具体的な要件（決済の保証、シーケンサーの信頼モデル、データ可用性の要件、VM）と照らし合わせて確認してください。

---

## プリセット構成のオンチェーンでの確認

プリセットの詳細はオンチェーンで解決されるため、プロファイルが何に解決されるかを確認する正式な方法は、モジュールと作成済みロールアップを照会することです:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

このパターン — デプロイ前に `config` を照会し、その後 `rollup` を照会する — により、変更される可能性のあるドキュメント記載の値に頼るのではなく、選択したプリセットが実際に何を生成したかを正確に確認できます。

---

## 次のステップ

* **[ロールアップのデプロイ](/rollups/deploying-a-rollup)** — Dashboard または CLI でプリセットからロールアップを作成し、そのライフサイクルを管理します。
* **[ロールアップ概要](/rollups/overview)** — プリセットにまとめられている決済パラダイムとシーケンサーモード。
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — より低レベルのモジュールリファレンス。
