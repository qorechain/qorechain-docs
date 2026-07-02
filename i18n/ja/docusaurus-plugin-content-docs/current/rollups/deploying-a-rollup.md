---
slug: /rollups/deploying-a-rollup
title: ロールアップのデプロイ
sidebar_label: ロールアップのデプロイ
sidebar_position: 3
---

# ロールアップのデプロイ

アプリケーション固有のロールアップは、3 つの方法でデプロイできます。**ダッシュボード**（ガイド付きのノーコードウィザード）、チェーンの **CLI**（`qorechaind`、オンチェーントランザクションを完全に制御）、または **TypeScript RDK**（`@qorechain/rdk` と `create-qorechain-rollup` スキャフォルダー）を使ったプログラムによる方法です。このページでは、これら 3 つすべてに加えて、オペレーターのライフサイクルとバッチコマンドについて説明します。

:::note
以下のコマンドは **`qorechain-diana`** テストネットを対象としています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は、チェーンバージョン **v3.1.82** を実行して 2026 年 6 月 7 日から稼働しています。メインネットでデプロイする場合は、メインネットのチェーン ID とエンドポイントに置き換えてください。すべてのデプロイは、まずテストネットで検証してください。
:::

---

## 要件

| 要件 | 詳細 |
| ----------- | ------- |
| **最小ステーク** | ロールアップ作成時に QOR のステークボンドがエスクローされます |
| **作成時のバーン** | ステーク額の一部は作成時に永久にバーンされます。残りはエスクローで保持され、ロールアップ停止時に返還されます |
| **アカウント** | ステークとトランザクション手数料に十分な残高がある、資金が入った QoreChain アカウント |

デプロイ前に、現在の最小ステークとバーン率について稼働中のモジュールパラメータをクエリしてください:

```bash
qorechaind query rdk config
```

---

## ダッシュボード経由でのデプロイ（Tools → Rollups）

ダッシュボードは、**Tools → Rollups** の下にガイド付きの **Deploy a Rollup** ウィザードを提供します。これは、手作業でトランザクションを組み立てることなく、アプリ固有のロールアップを起動する最速の方法です。

### 手順

1. **サインインする。** ウィザードでデプロイし、既存のデプロイメントを一覧表示するには、認証済みセッションが必要です。
2. **ロールアップに名前を付ける。** ロールアップ名を入力します（2〜41 文字: 英字、数字、スペース、ハイフン、アンダースコア）。
3. **仮想マシンを選ぶ。** QoreChain はトリプル VM チェーンなので、ロールアップは以下のいずれかを実行できます:
   * **EVM** — 完全な Ethereum ツール（Hardhat、Foundry、MetaMask）を備えた Solidity / Vyper コントラクト
   * **CosmWasm** — ネイティブ IBC を備えた Cosmos SDK ランタイム上の Rust スマートコントラクト
   * **SVM** — 並列実行・高スループットのアプリ向けの Solana 仮想マシン
4. **データ可用性レイヤーを選ぶ。** 誰もが状態を再構築できるよう、ロールアップがトランザクションデータを公開する場所: **QoreChain DA**、**Celestia**、または **EigenDA**。EigenDA はダッシュボードレベルのオプションであり、一方でオンチェーンの `x/rdk` DA バックエンドは native、Celestia、または both である点に注意してください。[データ可用性](/rollups/data-availability) を参照してください。
5. **ガストークンを設定する。** ロールアップ上での実行に対して支払うために使用されるトークン。デフォルトは **QOR** です。独自のネイティブトークンを使用するには、カスタムシンボルを入力します。
6. **シーケンサーを選ぶ。** 決済前にトランザクションを順序付けるのは誰か: **共有シーケンサー**（QoreChain の共有セット）、**専用（単一）**（独自の単一シーケンサーを実行）、または **分散型**（パーミッションレスなシーケンサーセット）。
7. **決済ターゲットを選ぶ。** ロールアップがその状態ルートと有効性証明をアンカーする場所: **QoreChain メインネット** または **Ethereum**。
8. **デプロイする。** ウィザードを送信します。プロビジョニングはロールアップが稼働する前に **The Qore Trust** によってレビューされるため、送信したばかりのロールアップは、レビューが完了するまで **provisioning** ステータスで表示されます。

送信したロールアップは、VM、DA レイヤー、ガストークン、シーケンサー、決済ターゲット、現在のステータスとともに **Your rollups** リストに表示されます。

:::note
ダッシュボードウィザードは、わかりやすい製品レベルの選択肢を提示し、レビュー付きのパイプラインを通じてプロビジョニングをルーティングします。以下の CLI は、`x/rdk` モジュールのオンチェーンメッセージ面に対して直接動作します。両者は同じ基礎概念（VM、DA、シーケンサー、決済）を共有していますが、それらを異なる抽象度で公開しています。
:::

---

## CLI 経由でのデプロイ

CLI はロールアップをオンチェーンで直接作成します。`create-rollup` は 3 つの位置引数（ロールアップ ID、プロファイル、ステーク額（`uqor` 単位））に加えて、オプションの `--vm` フラグを取ります。

:::tip
チェーンバージョン **v3.1.74** 以降、`create-rollup` は **選択されたプロファイルのプリセットを自動的に適用します**。決済モード、シーケンサー、DA、ガスモデル、VM はすべてプリセットから取得されます。手作業で設定する必要はなくなりました（以前はメッセージがソブリン構成をハードコードしていました）。`--vm` フラグは現在 **デフォルトで空** になっているため、明示的にオーバーライドしない限り、プロファイルの VM が適用されます。
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例** — `defi` プリセットからロールアップを作成します（決済、シーケンサー、DA、VM はすべてプリセットから取得されます。`defi` は EVM 上の zk 決済に解決されます）:

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**フラグ:**

| フラグ | デフォルト | 説明 |
| ---- | ------- | ----------- |
| `--vm` | *(空 — プロファイルの VM を使用)* | ロールアップ VM タイプをオーバーライドします: `evm`、`cosmwasm`、`svm`、または `custom`。プリセットの VM を適用するには未設定のままにします。 |

`[profile]` 引数は、自動的に適用されるプリセット構成を選択します。**[プリセットプロファイル](/rollups/preset-profiles)** を参照してください。`[stake-amount]` は `uqor` 単位のボンドです。

### デプロイした内容の確認

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK（`@qorechain/rdk`）でのデプロイ {#deploy-with-the-typescript-rdk-qorechainrdk}

ロールアップ開発キットは、CLI と同じオンチェーンの `x/rdk` モジュールを、公開された RPC/REST/gRPC/JSON-RPC と任意の cosmjs `OfflineSigner` を介して駆動する、2 つの公開 npm パッケージとして提供されます:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)**（`v0.4.0`）— TypeScript SDK: プリセットプロファイルを備えた config ビルダー、ロールアップと決済バッチのライフサイクル用のトランザクションヘルパー、ネイティブ DA、型付き読み取りクライアント、および v0.4 の追加機能（量子安全な決済レシート、QCAI ロールアップコパイロット、クロス VM calldata ヘルパー、ウォッチタワー）。
* **`create-qorechain-rollup`**（`v0.4.0`）— プロファイルごとに実行可能なスターターテンプレートを 1 つクローンするスキャフォルダー（`multivm-rollup` テンプレートを含む）。

これらは npm に公開されています。リポジトリには、公開されたオペレーター CLI である **`@qorechain/rdk-cli`**（`qorollup`、`v0.4.0`）も付属しており、`doctor`、`create`、`status`、`watch`、`params`、`suggest`、ライフサイクル（`pause`/`resume`/`stop`）、`keygen`、`manifest`、`withdraw`、`faucet` コマンド、および v0.4 の `receipt`、`advise`、`watchtower` コマンドを備えています。

#### Python、Go、Rust、Java クライアント

TypeScript パッケージと並んで、RDK は TypeScript の面をミラーリングする完全な **Python**、**Go**、**Rust**、**Java** クライアントを提供します: 検証付きの config ビルダー、5 つのプリセットプロファイル、denom/economics/bech32 ユーティリティ、バイナリ Merkle と引き出し証明のヘルパー、ロールアップマニフェスト、REST と `qor_` JSON-RPC 読み取りクライアント、プリフライト/ヘルスチェック、アカウント（ニーモニック → `qor` アドレス）、および **トランザクション署名 + ブロードキャスト**（`SIGN_MODE_DIRECT`）。すべて言語間で共有されるゴールデンベクトルに対して検証されており、各レジストリに **公開** されています:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

現在の公開バージョン: Python `qorechain-rdk` **0.4.0**（PyPI、インポートは `qorrdk`）、Rust `qorechain-rdk` **0.4.0**（crates.io）、Go モジュール `github.com/qorechain/qorechain-rdk/packages/go`、Java `io.github.qorechain:qorechain-rdk` **0.4.0**（Maven Central）。ライブブロードキャストにはノードエンドポイントが必要です。

:::note
TypeScript RDK とそのテンプレートは **`qorechain-diana`** テストネットを対象としており、完全なエンドツーエンドのフローについては **coming soon** とマークされています。バージョンを固定し、テストネットで検証してください。
:::

### `create-qorechain-rollup` でプロジェクトをスキャフォールドする {#scaffold-a-project-with-create-qorechain-rollup}

各プロファイルには対応するスターターテンプレート（`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`）があります。いずれかの形式でスキャフォールドします:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

非対話型 / CI での使用には、テンプレートとネットワークを明示的に渡します:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

スキャフォルダーは、文書化されたステークと作成時バーンのコスト、およびロールアップを作成してそのステータスを読み取るための次の手順を出力します。

### コードからロールアップを作成する

プリセットから config をビルドし、チェーンから稼働中のステークとバーン率を読み取り、署名クライアントでロールアップを作成します。config ビルダーは `validate()` / `build()` 時に、決済 → 証明の互換性マトリックスを強制します。

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

どのプロファイルが適しているかわからない場合は、`rdk.suggestProfile("a lending protocol with predictable fees")` が QCAI 支援による推奨を返します（文書化されたフォールバック付き）。

### コードからライフサイクルを管理し状態を読み取る

署名クライアントは、完全なライフサイクル（`pauseRollup`、`resumeRollup`、`stopRollup`、および `submitBatch`、`challengeBatch`、`resolveChallenge`、`executeWithdrawal`）を公開します。ライフサイクルの遷移は、`currentStatus` を渡すことでガードできます。

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

型付き REST クライアントで状態を読み取ります（署名者は不要）:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## ライフサイクル管理

ロールアップは `pending`、`active`、`paused`、`stopped` の各状態を遷移します。作成者は次のコマンドで遷移を管理します。

### Pause（一時停止）

ロールアップを一時的に停止します。状態は保持され、ロールアップは再開できます。理由の文字列が必要です。

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Resume（再開）

以前に一時停止したロールアップを再開します。

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stop（停止）

ロールアップを永久に廃止し、そのステークを解放します。ステークされた QOR は、一回限りの作成時バーンを差し引いた額が作成者に返還されます。

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
ロールアップの停止は永久的です。停止後にロールアップを再起動することはできません。
:::

---

## オペレーターコマンド: バッチとチャレンジ

ロールアップオペレーターは決済バッチを送信し、チャレンジャーはオプティミスティックバッチに異議を申し立てることができます。これらのコマンドは、**[ロールアップの概要](/rollups/overview)** と **[ZK / STARK と引き出し](/rollups/zk-stark-withdrawals)** で説明されている決済レイヤーを支えています。

### バッチの送信

ロールアップの決済バッチを送信します。ロールアップ ID、バッチインデックス、および 16 進エンコードされた状態ルートを取ります。

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### バッチへのチャレンジ

送信されたバッチにチャレンジします（オプティミスティックロールアップ向け）。ロールアップ ID とバッチインデックスを取り、`--proof` で不正証明を渡します。チェーンバージョン **v3.1.74** 以降、オプティミスティックな **submit-batch → challenge-batch** のパスは稼働しており、エンドツーエンドで機能しています。

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| フラグ | 説明 |
| ---- | ----------- |
| `--proof` | 16 進エンコードされた不正証明 |

### バッチの確認

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## クエリ

| コマンド | 目的 |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | 特定のロールアップの詳細 |
| `qorechaind query rdk list-rollups` | 登録されているすべてのロールアップ |
| `qorechaind query rdk batch [rollup-id]` | 最新の決済バッチ（または `--index`） |
| `qorechaind query rdk config` | RDK モジュールパラメータ |
| `qorechaind query rdk suggest-profile [use-case]` | ユースケースに合ったプリセットの推奨 |

---

## 次のステップ

* **[データ可用性](/rollups/data-availability)** — native、Celestia、および冗長 DA バックエンド。
* **[ZK / STARK と引き出し](/rollups/zk-stark-withdrawals)** — 証明の検証と、`execute-withdrawal` を介した L2 → L1 引き出しフロー。
