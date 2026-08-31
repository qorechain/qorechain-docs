---
slug: /rollups/deploying-a-rollup
title: ロールアップのデプロイ
sidebar_label: ロールアップのデプロイ
sidebar_position: 3
---

# ロールアップのデプロイ

アプリケーション専用ロールアップは3通りの方法でデプロイできます。**ダッシュボード**(ガイド付きのノーコードウィザード)、チェーンの**CLI**(`qorechaind`、オンチェーントランザクションを完全に制御)、またはプログラムから**TypeScript RDK**(`@qorechain/rdk` と `create-qorechain-rollup` スキャフォルダー)を使う方法です。このページではこの3つすべてに加えて、オペレーターのライフサイクルとバッチコマンドについても解説します。

:::note
以下のコマンドは **`qorechain-diana`** テストネットを対象としています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)は2026年6月7日からチェーンバージョン **v3.1.95** で稼働しています — メインネットにデプロイする際はチェーンIDとエンドポイントをメインネット用に置き換えてください。すべてのデプロイはまずテストネットで検証してください。
:::

---

## 要件

| 要件 | 詳細 |
| ----------- | ------- |
| **最低ステーク額** | ロールアップ作成時にQOR建てのステーク保証金がエスクローされます |
| **作成時バーン** | ステークされた金額の一部が作成時に永久にバーンされます。残りはエスクローに保持され、ロールアップが停止された際に返還されます |
| **アカウント** | ステーク額に加えてトランザクション手数料をまかなうのに十分な残高を持つ、資金の入ったQoreChainアカウント |

デプロイ前に、現在の最低ステーク額とバーン率のライブなモジュールパラメータを照会してください。

```bash
qorechaind query rdk config
```

---

## ダッシュボード経由でのデプロイ(Tools → Rollups)

ダッシュボードは **Tools → Rollups** の下に、ガイド付きの**ロールアップをデプロイ**ウィザードを提供します。トランザクションを手作業で組み立てることなくアプリ専用ロールアップを起動する、最も速い方法です。

### 手順

1. **サインインする。** ウィザードでデプロイしたり、既存のデプロイ一覧を表示したりするには認証済みセッションが必要です。
2. **ロールアップに名前を付ける。** ロールアップ名を入力します(2〜41文字:英字、数字、スペース、ハイフン、アンダースコア)。
3. **仮想マシンを選ぶ。** QoreChainはトリプルVMチェーンなので、ロールアップは次のいずれでも実行できます。
   * **EVM** — Hardhat、Foundry、MetaMaskなどフルのEthereumツールチェーンを使えるSolidity / Vyperコントラクト
   * **CosmWasm** — Cosmos SDKランタイム上のRustスマートコントラクト、ネイティブIBC対応
   * **SVM** — 並列実行・高スループットなアプリ向けのSolana Virtual Machine
4. **データ可用性(DA)レイヤーを選ぶ。** 誰でも状態を再構築できるよう、ロールアップがトランザクションデータを公開する先です:**QoreChain DA**、**Celestia**、**EigenDA**のいずれか。EigenDAはダッシュボードレベルのオプションであり、オンチェーンの `x/rdk` のDAバックエンドはネイティブ、Celestia、またはその両方である点に注意してください — 詳細は[データ可用性](/rollups/data-availability)を参照してください。
5. **ガストークンを設定する。** ロールアップ上での実行手数料の支払いに使うトークンです。デフォルトは**QOR**です。独自のネイティブトークンを使う場合はカスタムシンボルを入力してください。
6. **シーケンサーを選ぶ。** トランザクションを決済前にどう並べるかを決める主体です:**Shared sequencer**(QoreChainの共有セット)、**Dedicated (single)**(自前の単一シーケンサーを運用)、**Decentralized**(パーミッションレスなシーケンサーセット)のいずれかです。
7. **決済先を選ぶ。** ロールアップが状態ルートと妥当性証明をアンカーする先です:**QoreChainメインネット**または**Ethereum**。
8. **デプロイする。** ウィザードを送信します。プロビジョニングは**The Qore Trust**によるレビューを経てから稼働するため、送信直後のロールアップはレビュー完了までは**provisioning(準備中)**ステータスで表示されます。

送信したロールアップは**Your rollups**一覧に、VM、DAレイヤー、ガストークン、シーケンサー、決済先、現在のステータスとともに表示されます。

:::note
ダッシュボードウィザードはユーザーフレンドリーな製品レベルの選択肢を提示し、レビュー付きのパイプラインを通してプロビジョニングを行います。以下のCLIは `x/rdk` モジュールのオンチェーンメッセージ表面に対して直接働きかけます。両者は同じ基本概念(VM、DA、シーケンサー、決済)を共有していますが、それぞれ異なる抽象度で公開しています。
:::

---

## CLI経由でのデプロイ

CLIはロールアップをオンチェーン上に直接作成します。`create-rollup` は3つの位置引数 — ロールアップID、プロファイル、ステーク額(`uqor` 単位)— に加えて、任意の `--vm` フラグを取ります。

:::tip
チェーンバージョン **v3.1.74** 以降、`create-rollup` は**選択したプロファイルのプリセットを自動的に適用します** — 決済モード、シーケンサー、DA、ガスモデル、VMはすべてプリセットから取得されます。これらを手動で設定する必要はもうありません(以前はメッセージがソブリン構成をハードコードしていました)。`--vm` フラグは現在**デフォルトで空**になっており、明示的に上書きしない限りプロファイルのVMが適用されます。
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**例** — `defi` プリセットからロールアップを作成する(決済、シーケンサー、DA、VMはすべてプリセットから取得されます。`defi` はEVM上のzk決済に解決されます)。

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**フラグ:**

| フラグ | デフォルト | 説明 |
| ---- | ------- | ----------- |
| `--vm` | *(空 — プロファイルのVMを使用)* | ロールアップのVMタイプを上書きします:`evm`、`cosmwasm`、`svm`、`custom` のいずれか。未指定のままにするとプリセットのVMが適用されます。(RDKの各クライアントではWasmランタイムは **`native`** VMタイプ — QoreChain Native — として扱われ、`cosmwasm` はレガシーなエイリアスとして残されています。`cosmwasm` はワイヤー上の値であり、このチェーンレベルのフラグが取るのもこの値です。) |

`[profile]` 引数は自動的に適用されるプリセット構成を選択します — 詳細は**[プリセットプロファイル](/rollups/preset-profiles)**を参照してください。`[stake-amount]` は `uqor` 建ての保証金です。

### デプロイ結果を確認する

```bash
# 特定のロールアップをIDで照会
qorechaind query rdk rollup my-defi-rollup

# 登録済みのロールアップをすべて一覧表示
qorechaind query rdk list-rollups
```

---

## TypeScript RDK(`@qorechain/rdk`)でのデプロイ {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kitは、CLIと同じオンチェーンの `x/rdk` モジュールを、公開のRPC/REST/gRPC/JSON-RPCおよび任意のcosmjs `OfflineSigner` 経由で操作する、2つの公開npmパッケージとして提供されています。

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)**(`v0.4.4`) — TypeScript SDK。プリセットプロファイルを備えた設定ビルダー、ロールアップと決済バッチのライフサイクル用トランザクションヘルパー、ネイティブDA、型付きの読み取りクライアント、そしてv0.4での追加機能 — 量子安全な決済レシート、QCAI Rollup Copilot、クロスVM calldataヘルパー、watchtowerです。
* **`create-qorechain-rollup`**(`v0.4.4`) — プロファイルごとに実行可能なスターターテンプレートを1つずつクローンするスキャフォルダー(`multivm-rollup` テンプレートを含む)。

これらはnpmに公開されています。同じリポジトリからは公開済みのオペレーター用CLIである **`@qorechain/rdk-cli`**(`qorollup`、`v0.4.4`)も提供されており、`doctor`、`create`、`status`、`watch`、`params`、`suggest`、ライフサイクル系(`pause`/`resume`/`stop`)、`keygen`、`manifest`、`withdraw`、`faucet` の各コマンドに加え、v0.4の `receipt`、`advise`、`watchtower` コマンドを備えています。

v0.4.0の初回リリース以降のハイライト:

* **v0.4.2 — 追加設定なしでライブネットワークに対して動作します。** `mainnet` および `testnet` プリセットが公開の `qore.host` エンドポイント(RESTは `api.qore.host` / `api-testnet.qore.host`)を同梱するようになったため、`createRdkClient({ network })` は手動の `endpoints` 設定なしでチェーンに到達できます — 自前のノードを対象にする場合のみ上書きしてください。同リリースでは、Wasmロールアップ VM識別子を **`native`**(QoreChain Native)に改称しています。`cosmwasm` はレガシーなエイリアスとして引き続き受け付けられ、どちらもワイヤー上では `cosmwasm` にマッピングされます — チェーン、エクスプローラー、ダッシュボードに変更はありません。
* **v0.4.3 — TypeScript署名パス向けのハイブリッド署名エンコーディング修正**(下記の注意事項を参照)。
* **v0.4.4 — `@qorechain/sdk` `^0.7.0` に追随。** チェーン **v3.1.85** のオーセンティケーターレーン向けのSDKリリースであり、その機能がSDKを通じてRDKのTypeScriptユーザーにも直接届きます。RDK自体のAPI変更はありません。

:::caution
**TypeScriptユーザーはRDK 0.4.3以上を使用する必要があります。** それ以前のリリースはハイブリッドPQCトランザクション拡張のエンコーディングに誤りがあり、チェーンはハイブリッド署名済みトランザクションをすべて拒否していました。v0.4.3(`@qorechain/sdk` 0.6.1以上経由)でこのエンコーディングが修正されています。影響を受けたのはTypeScriptのハイブリッド署名パスのみです — Python、Go、Rust、Javaの各クライアントはクラシック署名のみを行うため、一切影響を受けていません。
:::

#### Python、Go、Rust、Javaクライアント

TypeScriptパッケージに加えて、RDKはTypeScript版と同等の機能を持つ**Python**、**Go**、**Rust**、**Java**の各クライアントを提供しています。バリデーション付きの設定ビルダー、5つのプリセットプロファイル、denom/経済モデル/bech32ユーティリティ、バイナリMerkleおよび出金証明ヘルパー、ロールアップマニフェスト、RESTおよび `qor_` JSON-RPC読み取りクライアント、プリフライト/ヘルスチェック、アカウント(ニーモニック→`qor` アドレス)、そして**トランザクションの署名とブロードキャスト**(`SIGN_MODE_DIRECT`)です。いずれも言語間で共有されるゴールデンベクターに対して検証済みで、それぞれのレジストリに**公開**されています。

```bash
# Python — qorechain-rdk としてインストールし、qorrdk としてインポート
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

現在公開されているバージョン:Python `qorechain-rdk` **0.4.4**(PyPI、`qorrdk` としてインポート)、Rust `qorechain-rdk`(crates.io — 最新の公開リリースをインストールするか、リポジトリからビルドしてください)、Goモジュール `github.com/qorechain/qorechain-rdk/packages/go`(**v0.4.4**)、Java `io.github.qorechain:qorechain-rdk` **0.4.4**(Maven Central)。ライブブロードキャストにはノードエンドポイントが必要です。

:::note
TypeScript RDKとそのテンプレートはデフォルトで **`qorechain-diana`** テストネットを対象としており、v0.4.2以降はプリセットが追加設定なしで公開エンドポイントに到達します。バージョンを固定し、メインネットの前にテストネットで検証してください。
:::

### `create-qorechain-rollup` でプロジェクトをスキャフォールドする {#scaffold-a-project-with-create-qorechain-rollup}

各プロファイルには対応するスターターテンプレート(`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`)があります。次のいずれかの形式でスキャフォールドしてください。

```bash
npm create qorechain-rollup my-rollup
# または
npx create-qorechain-rollup my-rollup
```

非対話 / CI用途では、テンプレートとネットワークを明示的に指定します。

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

スキャフォルダーは、公式なステーク額と作成時バーンのコスト、そしてロールアップを作成しステータスを確認するための次のステップを表示します。

### コードからロールアップを作成する

プリセットから設定を構築し、チェーンから最新のステーク額とバーン率を読み取ってから、署名クライアントでロールアップを作成します。設定ビルダーは `validate()` / `build()` の際に決済 → 証明方式の互換性マトリクスを検証します。

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// defi プリセットのデフォルト値で事前に埋められた設定ビルダー。.set({ ... }) で上書き可能。
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// 公開の qore.host エンドポイントはプリセットに組み込まれています(RDK 0.4.2以上)——
// 手動の endpoints 設定は不要です。自前のノードを対象にする場合のみ上書きしてください。
const rdk = createRdkClient({ network: "testnet" });

// ライブなモジュールパラメータを読み取ります — ステーク額やバーン率を決してハードコードしないでください。
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// 任意の cosmjs OfflineSigner で署名クライアントを接続します。
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // チェーンは 0.1uqor/gas の手数料下限を強制します
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

どのプロファイルが合うか迷ったら?`rdk.suggestProfile("a lending protocol with predictable fees")` を実行すると、QCAIによる推奨(文書化されたフォールバック付き)が返されます。

### コードからライフサイクルを管理し、状態を読み取る

署名クライアントは完全なライフサイクル — `pauseRollup`、`resumeRollup`、`stopRollup`、さらに `submitBatch`、`challengeBatch`、`resolveChallenge`、`executeWithdrawal` — を公開しています。ライフサイクルの遷移は `currentStatus` を渡すことでガードできます。

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

型付きのRESTクライアントで状態を読み取ります(署名者は不要)。

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## ライフサイクル管理

ロールアップは `pending`、`active`、`paused`、`stopped` の各状態を遷移します。作成者は以下のコマンドで状態遷移を管理します。

### 一時停止(Pause)

ロールアップを一時的に停止します。状態は保持され、後で再開できます。理由の文字列が必須です。

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 再開(Resume)

以前一時停止したロールアップを再開します。

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 停止(Stop)

ロールアップを永久に廃止し、そのステークを解放します。ステークされたQOR — 一回限りの作成時バーン分を除く — は作成者に返還されます。

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
ロールアップの停止は取り消せません。停止したロールアップは再起動できません。
:::

---

## オペレーターコマンド:バッチとチャレンジ

ロールアップオペレーターは決済バッチを提出し、チャレンジャーはオプティミスティックなバッチに異議を申し立てることができます。これらのコマンドは、**[ロールアップ概要](/rollups/overview)**および**[ZK / STARKと出金](/rollups/zk-stark-withdrawals)**で説明されている決済レイヤーを支えるものです。

### バッチを提出する

ロールアップの決済バッチを提出します。ロールアップID、バッチインデックス、16進エンコードされた状態ルートを取ります。

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### バッチにチャレンジする

提出済みのバッチにチャレンジします(オプティミスティックロールアップ向け)。ロールアップIDとバッチインデックスを取り、不正証明は `--proof` で渡します。チェーンバージョン **v3.1.74** 以降、オプティミスティックな **submit-batch → challenge-batch** の経路はエンドツーエンドで稼働しています。

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| フラグ | 説明 |
| ---- | ----------- |
| `--proof` | 16進エンコードされた不正証明 |

### バッチを確認する

```bash
# ロールアップの最新バッチ
qorechaind query rdk batch [rollup-id]

# インデックス指定で特定のバッチを取得
qorechaind query rdk batch [rollup-id] --index 42
```

---

## 照会

| コマンド | 用途 |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | 特定のロールアップの詳細 |
| `qorechaind query rdk list-rollups` | 登録済みのロールアップをすべて表示 |
| `qorechaind query rdk batch [rollup-id]` | 最新の決済バッチ(または `--index`) |
| `qorechaind query rdk config` | RDKモジュールのパラメータ |
| `qorechaind query rdk suggest-profile [use-case]` | ユースケースに合ったプリセットを推奨 |

---

## 次のステップ

* **[データ可用性](/rollups/data-availability)** — ネイティブ、Celestia、冗長DAバックエンド。
* **[ZK / STARKと出金](/rollups/zk-stark-withdrawals)** — 証明検証と `execute-withdrawal` によるL2→L1出金フロー。
