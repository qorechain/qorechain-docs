---
slug: /rollups/deploying-a-rollup
title: ロールアップのデプロイ
sidebar_label: ロールアップのデプロイ
sidebar_position: 3
---

# ロールアップのデプロイ

アプリケーション特化型ロールアップは 3 つの方法でデプロイできます。**Dashboard**（ガイド付きのノーコードウィザード）、チェーン **CLI**（`qorechaind`、オンチェーントランザクションを完全に制御可能）、そして **TypeScript RDK**（`@qorechain/rdk` と `create-qorechain-rollup` スキャフォルダー）によるプログラマティックなデプロイです。本ページでは、この 3 つの方法すべてに加え、オペレーターのライフサイクルとバッチコマンドについて解説します。

:::note
以下のコマンドは **`qorechain-diana`** テストネットを対象としています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日からチェーンバージョン **v3.1.85** で稼働中です — メインネットにデプロイする際は、メインネットのチェーン ID とエンドポイントに置き換えてください。すべてのデプロイは、まずテストネットで検証してください。
:::

---

## 要件

| 要件 | 詳細 |
| ----------- | ------- |
| **最低ステーク** | ロールアップの作成時に QOR のステークボンドがエスクローされます |
| **作成時バーン** | ステーク額の一部は作成時に永久にバーンされます。残りはエスクローに保持され、ロールアップの停止時に返却されます |
| **アカウント** | ステーク額とトランザクション手数料をまかなえる残高を持つ、資金供給済みの QoreChain アカウント |

デプロイの前に、現在の最低ステーク額とバーンレートについて、稼働中のモジュールパラメータを照会してください。

```bash
qorechaind query rdk config
```

---

## Dashboard からデプロイする（Tools → Rollups）

Dashboard には、**Tools → Rollups** の下にガイド付きの **Deploy a Rollup** ウィザードが用意されています。トランザクションを手作業で組み立てることなく、アプリ特化型ロールアップを最速で立ち上げられる方法です。

### 手順

1. **サインインする。** ウィザードでデプロイを行い、既存のデプロイ一覧を表示するには、認証済みセッションが必要です。
2. **ロールアップに名前を付ける。** ロールアップ名を入力します（2〜41 文字：英字、数字、スペース、ハイフン、アンダースコアが使用可能）。
3. **仮想マシンを選ぶ。** QoreChain はトリプル VM チェーンなので、ロールアップは以下のいずれでも実行できます。
   * **EVM** — Solidity / Vyper コントラクト。Ethereum のフルツーリング（Hardhat、Foundry、MetaMask）に対応
   * **CosmWasm** — Cosmos SDK ランタイム上の Rust スマートコントラクト。ネイティブ IBC 対応
   * **SVM** — Solana Virtual Machine。並列実行・高スループットのアプリ向け
4. **データ可用性レイヤーを選ぶ。** 誰でも状態を再構築できるように、ロールアップがトランザクションデータを公開する場所です。**QoreChain DA**、**Celestia**、**EigenDA** から選択できます。EigenDA は Dashboard レベルのオプションであり、オンチェーンの `x/rdk` DA バックエンドは native、Celestia、またはその両方である点に注意してください — 詳細は [データ可用性](/rollups/data-availability) を参照してください。
5. **ガストークンを設定する。** ロールアップ上での実行の支払いに使用するトークンです。デフォルトは **QOR** です。独自のネイティブトークンを使用する場合はカスタムシンボルを入力してください。
6. **シーケンサーを選ぶ。** 決済前にトランザクションを順序付けする主体です。**Shared sequencer**（QoreChain の共有セット）、**Dedicated (single)**（自前の単一シーケンサーを運用）、**Decentralized**（パーミッションレスなシーケンサーセット）から選択できます。
7. **決済先を選ぶ。** ロールアップが状態ルートと有効性証明をアンカーする場所です。**QoreChain mainnet** または **Ethereum** から選択できます。
8. **デプロイする。** ウィザードを送信します。プロビジョニングはロールアップの稼働前に **The Qore Trust** による審査を受けるため、送信直後のロールアップは審査が完了するまで **provisioning** ステータスで表示されます。

送信したロールアップは **Your rollups** リストに、VM、DA レイヤー、ガストークン、シーケンサー、決済先、現在のステータスとともに表示されます。

:::note
Dashboard ウィザードは分かりやすいプロダクトレベルの選択肢を提示し、プロビジョニングを審査付きのパイプラインに通します。以下の CLI は `x/rdk` モジュールのオンチェーンメッセージサーフェスを直接操作します。両者は同じ基本概念（VM、DA、シーケンサー、決済）を共有していますが、異なる抽象度でそれらを公開しています。
:::

---

## CLI からデプロイする

CLI はロールアップを直接オンチェーンに作成します。`create-rollup` は 3 つの位置引数 — ロールアップ ID、プロファイル、ステーク額（`uqor` 単位）— に加え、オプションの `--vm` フラグを取ります。

:::tip
チェーンバージョン **v3.1.74** 以降、`create-rollup` は**選択したプロファイルのプリセットを自動的に適用します** — 決済モード、シーケンサー、DA、ガスモデル、VM はすべてプリセットから取得されます。手動で設定する必要はもうありません（以前はメッセージにソブリン構成がハードコードされていました）。`--vm` フラグは現在**デフォルトで空**となっており、明示的に上書きしない限りプロファイルの VM が適用されます。
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例** — `defi` プリセットからロールアップを作成します（決済、シーケンサー、DA、VM はすべてプリセットから適用されます。`defi` は EVM 上の zk 決済に解決されます）。

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**フラグ:**

| フラグ | デフォルト | 説明 |
| ---- | ------- | ----------- |
| `--vm` | *（空 — プロファイルの VM を使用）* | ロールアップの VM タイプを上書きします：`evm`、`cosmwasm`、`svm`、`custom`。未設定のままにするとプリセットの VM が適用されます。（RDK クライアントでは Wasm ランタイムは **`native`** VM タイプ — QoreChain Native — であり、`cosmwasm` はレガシーエイリアスとして残されています。`cosmwasm` はオンワイヤの値であり、このチェーンレベルのフラグが受け取るのはその値です。） |

`[profile]` 引数は、自動的に適用されるプリセット構成を選択します — **[プリセットプロファイル](/rollups/preset-profiles)** を参照してください。`[stake-amount]` は `uqor` 単位のボンドです。

### デプロイ内容を確認する

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK（`@qorechain/rdk`）でデプロイする {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit は 2 つの公開 npm パッケージとして提供され、CLI と同じオンチェーンの `x/rdk` モジュールを、公開 RPC/REST/gRPC/JSON-RPC と任意の cosmjs `OfflineSigner` を介して操作します。

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)**（`v0.4.4`）— TypeScript SDK：プリセットプロファイル付きの config ビルダー、ロールアップおよび決済バッチのライフサイクル用トランザクションヘルパー、native DA、型付きリードクライアント、そして v0.4 の追加機能 — 量子安全な決済レシート、QCAI Rollup Copilot、クロス VM calldata ヘルパー、ウォッチタワー。
* **`create-qorechain-rollup`**（`v0.4.4`）— プロファイルごとに実行可能なスターターテンプレート（`multivm-rollup` テンプレートを含む）を 1 つクローンするスキャフォルダー。

これらは npm に公開されています。リポジトリには公開済みのオペレーター CLI である **`@qorechain/rdk-cli`**（`qorollup`、`v0.4.4`）も同梱されており、`doctor`、`create`、`status`、`watch`、`params`、`suggest`、ライフサイクル（`pause`/`resume`/`stop`）、`keygen`、`manifest`、`withdraw`、`faucet` の各コマンドに加え、v0.4 の `receipt`、`advise`、`watchtower` コマンドを備えています。

初回の v0.4.0 リリース以降のハイライト：

* **v0.4.2 — 追加設定なしで稼働中のネットワークに接続可能。** `mainnet` および `testnet` プリセットに公開 `qore.host` エンドポイント（REST は `api.qore.host` / `api-testnet.qore.host`）が同梱されるようになり、`createRdkClient({ network })` は手動の `endpoints` 設定なしでチェーンに到達します — 自前のノードを対象にする場合のみ上書きしてください。同じリリースで Wasm ロールアップの VM 識別子が **`native`**（QoreChain Native）に改名されました。`cosmwasm` は引き続きレガシーエイリアスとして受け付けられ、どちらもワイヤ上では `cosmwasm` にマップされます — チェーン、エクスプローラー、Dashboard に変更はありません。
* **v0.4.3 — ハイブリッド署名エンコーディングの修正**（TypeScript 署名パス向け。下記の caution を参照）。
* **v0.4.4 — `@qorechain/sdk` `^0.7.0` に追随。** これはチェーン **v3.1.85** の authenticator レーンに対応した SDK リリースであり、これらの機能は SDK を通じて RDK の TypeScript ユーザーに直接届きます。RDK の API に変更はありません。

:::caution
**TypeScript ユーザーは RDK ≥ 0.4.3 を使用する必要があります。** それより前のリリースはハイブリッド PQC トランザクション拡張を誤ってエンコードしていたため、チェーンはすべてのハイブリッド署名トランザクションを拒否していました。v0.4.3（`@qorechain/sdk` ≥ 0.6.1 経由）でこのエンコーディングが修正されています。影響を受けたのは TypeScript のハイブリッド署名パスのみです — Python、Go、Rust、Java クライアントはクラシカル署名のみを行うため、影響はありませんでした。
:::

#### Python、Go、Rust、Java クライアント

TypeScript パッケージに加えて、RDK は TypeScript のサーフェスをミラーする完全な **Python**、**Go**、**Rust**、**Java** クライアントを提供します：バリデーション付き config ビルダー、5 つのプリセットプロファイル、denom／エコノミクス／bech32 ユーティリティ、バイナリ Merkle および出金証明ヘルパー、ロールアップマニフェスト、REST と `qor_` JSON-RPC リードクライアント、プリフライト／ヘルスチェック、アカウント（ニーモニック → `qor` アドレス）、そして**トランザクションの署名 + ブロードキャスト**（`SIGN_MODE_DIRECT`）。すべて共有のクロス言語ゴールデンベクターに対して検証済みで、各レジストリに**公開**されています。

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

現在の公開バージョン：Python `qorechain-rdk` **0.4.4**（PyPI、インポートは `qorrdk`）、Rust `qorechain-rdk`（crates.io — 公開済みの最新リリースをインストールするか、リポジトリからビルド）、Go モジュール `github.com/qorechain/qorechain-rdk/packages/go`（**v0.4.4**）、Java `io.github.qorechain:qorechain-rdk` **0.4.4**（Maven Central）。ライブブロードキャストにはノードエンドポイントが必要です。

:::note
TypeScript RDK とそのテンプレートはデフォルトで **`qorechain-diana`** テストネットを対象とし、v0.4.2 以降のプリセットは追加設定なしで稼働中の公開エンドポイントに到達します。バージョンを固定し、メインネットの前にテストネットで検証してください。
:::

### `create-qorechain-rollup` でプロジェクトをスキャフォールドする {#scaffold-a-project-with-create-qorechain-rollup}

各プロファイルには対応するスターターテンプレート（`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`）があります。以下のいずれかの形式でスキャフォールドしてください。

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

非対話 / CI での使用時は、テンプレートとネットワークを明示的に渡してください。

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

スキャフォルダーは、ドキュメントに記載されたステーク額と作成時バーンのコスト、そしてロールアップを作成しステータスを確認するための次のステップを出力します。

### コードからロールアップを作成する

プリセットから config を構築し、チェーンから稼働中のステーク額とバーンレートを読み取ってから、署名クライアントでロールアップを作成します。config ビルダーは `validate()` / `build()` 時に決済 → 証明の互換性マトリクスを強制します。

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

どのプロファイルが適しているか分からない場合は、`rdk.suggestProfile("a lending protocol with predictable fees")` が QCAI 支援の推奨（ドキュメント化されたフォールバック付き）を返します。

### コードからライフサイクルを管理し、状態を読み取る

署名クライアントは完全なライフサイクルを公開しています — `pauseRollup`、`resumeRollup`、`stopRollup`、さらに `submitBatch`、`challengeBatch`、`resolveChallenge`、`executeWithdrawal`。ライフサイクル遷移は `currentStatus` を渡すことでガードできます。

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

型付き REST クライアントで状態を読み取ります（署名者は不要です）。

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## ライフサイクル管理

ロールアップは `pending`、`active`、`paused`、`stopped` の各状態を遷移します。作成者は以下のコマンドで遷移を管理します。

### 一時停止（Pause）

ロールアップを一時的に停止します。状態は保持され、ロールアップは再開できます。理由の文字列が必須です。

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 再開（Resume）

一時停止していたロールアップを再開します。

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 停止（Stop）

ロールアップを永久に廃止し、そのステークを解放します。ステークされた QOR は、作成時の一度限りのバーン分を差し引いた上で、作成者に返却されます。

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
ロールアップの停止は恒久的です。停止したロールアップを再起動することはできません。
:::

---

## オペレーターコマンド：バッチとチャレンジ

ロールアップオペレーターは決済バッチを提出し、チャレンジャーはオプティミスティックバッチに異議を申し立てることができます。これらのコマンドは、**[ロールアップ概要](/rollups/overview)** と **[ZK / STARK と出金](/rollups/zk-stark-withdrawals)** で説明されている決済レイヤーを支えています。

### バッチを提出する

ロールアップの決済バッチを提出します。ロールアップ ID、バッチインデックス、16 進エンコードされた状態ルートを取ります。

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### バッチにチャレンジする

提出されたバッチに異議を申し立てます（オプティミスティックロールアップ向け）。ロールアップ ID とバッチインデックスを取り、不正証明（fraud proof）は `--proof` で渡します。チェーンバージョン **v3.1.74** 以降、オプティミスティックの **submit-batch → challenge-batch** パスはエンドツーエンドで稼働しています。

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| フラグ | 説明 |
| ---- | ----------- |
| `--proof` | 16 進エンコードされた不正証明（fraud proof） |

### バッチを確認する

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
| `qorechaind query rdk list-rollups` | 登録済みのすべてのロールアップ |
| `qorechaind query rdk batch [rollup-id]` | 最新の決済バッチ（または `--index`） |
| `qorechaind query rdk config` | RDK モジュールパラメータ |
| `qorechaind query rdk suggest-profile [use-case]` | ユースケースに応じたプリセットの推奨 |

---

## 次のステップ

* **[データ可用性](/rollups/data-availability)** — native、Celestia、冗長構成の DA バックエンド。
* **[ZK / STARK と出金](/rollups/zk-stark-withdrawals)** — 証明の検証と、`execute-withdrawal` による L2 → L1 の出金フロー。
