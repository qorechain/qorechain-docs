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
以下のプリセットごとの値は、同梱の **`@qorechain/rdk`** プロファイルのデフォルト値と一致しており、ネットワークが公開しているプロファイル表を反映しています。これまでのところ、どちらのネットワークでもロールアップは作成されていません。正式な構成については、稼働中のモジュールパラメータを `qorechaind query rdk config`（または `@qorechain/rdk` の `rdk.params()`。これは `GET /qorechain/rdk/v1/params` を読み取り、両ネットワークで提供されています）で照会し、メインネットの前に **`qorechain-diana`** テストネットで検証してください。
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

RDK v0.4.2 以降、Wasm VM オプション（QoreChain Native コントラクトを実行するランタイム）は **`native`** — QoreChain Native — という名前になりました。`cosmwasm` は引き続きレガシーエイリアスとして受け付けられ、どちらもワイヤ上では `cosmwasm` にマップされるため、チェーン、エクスプローラー、Dashboard に変更はありません。

:::note
プリセットごとの構成は、v3.2.3 のソースにあるチェーンのプロファイル表と照合して確認されました（メインネットは高さ 3,742,566 までは v3.2.3、そのブロックからは v3.2.4 で稼働。テストネットは v3.2.4 で稼働）。このバージョンでは `create-rollup` がプロファイルのプリセットを自動的に適用します: **`defi` = zk + EVM、`gaming` = based + カスタム VM、`nft` = optimistic + QoreChain Native (Wasm)、`enterprise` = based + EVM、`custom` = optimistic + EVM（デフォルト）**。`custom` プリセットはすべてのフィールドが自由に設定可能で、記載の値はその初期デフォルトです。
:::

4 つのドメイン向けプリセットは妥当な出発点として、**`custom`** プロファイルは完全に自由なオプションとして扱ってください。バンドルされる正確なパラメータはリリース間で変わる可能性があります。正式な値については（下記の）`rdk config` を照会し、最も近いプリセットから始めて調整してください。

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI は、実行可能なスタータープロジェクトをスキャフォールドします。プロファイルごとに 1 つのテンプレート（`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`）が用意されており、1 コマンドでプロファイルから動作する作成／照会コードまで到達できます。

---

## プリセットがオンチェーンに保持する内容 {#what-a-preset-carries}

思い込みやすい細部がいくつかあるため、プロファイルを選ぶ前に知っておく価値があります:

* **`defi` には検証鍵（verifying key）がありません。** ZK バッチには検証鍵が必要ですが、`create-rollup` で作成されたロールアップはそれを保持しないため、現時点では ZK 決済をエンドツーエンドで確定させることはできません（[ZK / STARK と引き出し](/rollups/zk-stark-withdrawals)を参照）。
* **`nft` と `custom`** は、1,000 QOR のチャレンジボンドと、高さ 3,742,566 より前のメインネットで 100,800 ブロックのチャレンジ期間（デフォルトの 604,800「秒」を 1 ブロックあたり固定 6 秒で換算した値。メインネットの現在の約 3.2 秒ブロックでは約 3.7 日）でオプティミスティックに決済します。v3.2.4 以降は、バッチは代わりにブロックタイムの秒数で測定されるウィンドウになります。テストネットでは高さ 8,337,253 から、メインネットでは高さ 3,742,566 からです。
* **`gaming` と `enterprise`** は `based` シーケンシングを使用します。これは現時点ではロールアップの作成者がバッチを提出することを意味します。
* **ブロック時間とトランザクション上限**（例: `defi` は 500 ms、`gaming` は 200 ms、`nft` は 2,000 ms、`enterprise` と `custom` は 1,000 ms）はオンチェーンのレコードに保存されます。これらはロールアップ自身のチェーンを記述するもので、ホストチェーンによって強制されるものではありません。

---

## プロファイルの選び方 {#getting-a-recommendation}

`suggest-profile` クエリと RDK の `suggestProfile()` ヘルパーは、自然言語による説明からプリセットを推奨することを目的としています。これらは `qor_suggestRollupProfile` JSON-RPC メソッドに依存していますが、公開エンドポイントはこれを提供していないため、`suggestProfile()` は現在、**フォールバック**として常に `defi` を返し、`qorechaind query rdk suggest-profile` はその RPC への案内を表示するだけです。代わりに上の表からプロファイルを選び、要件（決済の保証、シーケンサーの信頼モデル、データ可用性の要件、VM）と照らし合わせて確認してください。

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
