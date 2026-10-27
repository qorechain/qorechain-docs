---
slug: /developer-tools/scaffolders-and-cli
title: プロジェクトスキャフォルダーと qorollup CLI
sidebar_label: スキャフォルダーと CLI
sidebar_position: 21
---

# プロジェクトスキャフォルダーと `qorollup` CLI

3つのコマンドラインツールで、QoreChain プロジェクトを何もない状態から、型付きでビルド可能な出発点まで進められます。Node.js で作業するアプリケーション開発者（dApp）とロールアップオペレーター向けです。

* **`create-qorechain-dapp`**（0.10.0）は、[QoreChain SDK](/sdk/overview) をベースにした3つのテンプレートから dApp をスキャフォールドします。
* **`create-qorechain-rollup`**（0.7.0）は、TypeScript の[ロールアップ開発キット](/rollups/overview)をベースにした6つのテンプレートからロールアップのプロジェクトをスキャフォールドします。
* **`qorollup`** は `@qorechain/rdk-cli` パッケージ（0.7.0）のコマンドで、オペレーター向けのコマンドラインです。プリフライトチェック、ロールアップの作成と監視、ライブパラメータの読み取りを行います。

このページは、2026年10月27日に npm からインストールした公開パッケージの内容を反映しています。概念的なガイドは[ロールアップのデプロイ](/rollups/deploying-a-rollup)と [SDK CLI リファレンス](/sdk/reference/cli)です。

## 革新的な点 {#innovations}

* **CI 向けの非対話型スキャフォールド。** すべてのプロンプトにフラグがあります: `--template`、`--network`、`--package-manager`、`--yes`（デフォルトを受け入れる）、`--no-install`。パイプラインは、ターミナルなしで1つのコマンドからプロジェクトを生成してビルドできます。
* **テンプレートは最新のパッケージに固定されています。** dApp テンプレートは `@qorechain/sdk` `^0.10.0`（EVM テンプレートは `@qorechain/evm`）に、ロールアップテンプレートは `@qorechain/rdk` `^0.7.0` に依存しています。以前のスキャフォルダー（0.8.0）は、稼働中のネットワークに署名できない SDK に解決される範囲指定を書き出していましたが、現行のものではそうなりません。
* **ロールアップテンプレートはユースケースごとに有効な設定を備えています。** 各ロールアップテンプレートは、RDK の互換性マトリクスが受け入れる、決済、シーケンサー、データアベイラビリティ、ガス、VM の組み合わせを設定しており、スキャフォルダーは何かを作成する前に、現時点のステークと作成時のバーン額を表示します。
* **足りないものを名指しするプリフライトコマンド。** `qorollup doctor`（ロールアップテンプレート内では `npm run doctor`）は、REST エンドポイントが応答すること、モジュールパラメータを読み取れること、エンドポイントが指定したネットワークであること、署名者が設定されていることを確認し、チェックごとに1行を出力します。テンプレート内では、ロールアップの設定を互換性マトリクスに照らして検証することもします。
* **ハイブリッド署名がテンプレートに組み込まれています。** ロールアップテンプレートは、小さな `signer.ts` を通じて接続します。これはニーモニックからアカウントの ML-DSA-87 鍵を導出し（または生の秘密鍵とともにシードを受け取り）、両ネットワークが Native レーンで必須とするハイブリッド署名を行います。`rollup-app` dApp テンプレートも同じことを行い、`QORE_BROADCAST=1` を設定しない限りドライランとして動作します。
* **ドライラン。** `qorollup create ... --dry-run` は、設定を検証し、ステークとバーン額を表示し、ブロードキャストせずに `MsgCreateRollup` を送信する予定であることを示します。
* **機械可読な出力。** `qorollup ... --json` は、スクリプト向けに JSON を出力します。

## 使い方 {#how-to-use}

### dApp をスキャフォールドする {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| テンプレート | 生成されるもの | スクリプト |
| --- | --- | --- |
| `evm-solidity` | コンパイル済みアーティファクト付きの Solidity `Counter` コントラクトと、`@qorechain/evm` を使ってそれをデプロイして呼び出す viem スクリプト。ファイル: `contracts/Counter.sol`、`contracts/Counter.artifact.ts`、`scripts/deploy.ts`、`.env`。 | `deploy` |
| `fullstack-web` | `@qorechain/sdk` でアドレスの残高（とトークノミクスの概要）を読み取る、Vite、React、TypeScript のページ。ファイル: `index.html`、`src/App.tsx`、`src/main.tsx`、`vite.config.ts`、`.env`。 | `dev`、`build`、`preview`、`typecheck` |
| `rollup-app` | SDK の `createRollupClient` と `createMultilayerClient` を使って、ロールアップおよびサイドチェーンまたはペイチェーンのメッセージを組み立てる Node スクリプト。ファイル: `src/index.ts` と通常の設定。デフォルトはドライラン。 | `start`、`typecheck` |

| フラグ | 意味 |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`、`fullstack-web`、`rollup-app` のいずれか |
| `--network <name>` | `testnet` または `mainnet` |
| `--package-manager <pm>` | `pnpm`、`npm`、`yarn` のいずれか |
| `-y, --yes` | プロンプトをスキップしてデフォルトを使用 |
| `--no-install` | 依存関係をインストールしない |
| `-h, --help`, `-v, --version` | ヘルプ、バージョン |

検証済みの例（開発者ハブより。2026年10月27日に空のディレクトリで、公開 npm レジストリからの `npx` で実行）: ウェブテンプレートをスキャフォールドしてビルドします。確認できた結果: `Done! Created my-dapp` と、成功した `vite build`。ビルドではバンドルサイズの警告が出ますが、問題ありません。

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

ウェブアプリを実行する前に、生成された `.env` を開いてください。`http://localhost:1317` と `http://localhost:8545` を指しているため、`VITE_QORE_REST_URL` を `https://api-testnet.qore.host`（メインネットなら `https://api.qore.host`）に、`VITE_QORE_EVM_RPC_URL` を `https://evm-testnet.qore.host`（または `https://evm.qore.host`）に設定してください。

### ロールアップのプロジェクトをスキャフォールドする {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| テンプレート | プロファイル | 決済 / シーケンサー / DA / ガス / VM | 追加ファイル |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK、dedicated、native、EIP-1559、EVM | リファレンスのプルーバー（`src/prover.ts`）と、`circuits/` 配下のデモ用回路 |
| `gaming-rollup` | gaming | based、based、native、定額ガス、カスタム VM | なし |
| `nft-rollup` | nft | optimistic、dedicated、QoreChain Native、チャレンジフロー付き | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based、based、native、補助金付きガス、EVM | なし |
| `custom-rollup` | custom | 完全にパラメータ化され、すべてのフィールドに説明あり | なし |
| `multivm-rollup` | multivm | クロス VM プリコンパイルを通じて QoreChain Native コントラクトを呼び出す EVM ロールアップ | `contracts/CrossVmCaller.sol`、`src/crossvm-call.ts` |

すべてのテンプレートに、`rollup.config.ts`（設定）、`src/client.ts`、`src/signer.ts`、`src/create.ts`、`src/submit-batch.ts`、`src/query-status.ts`、`src/doctor.ts`、`src/status.ts`、`.env`、`.env.example`、README、`.github/workflows/deploy.yml` が含まれます。スクリプト: `create`、`submit-batch`、`query-status`、`doctor`、`status`、`typecheck`。プリセットのプロファイルは[プリセットプロファイル](/rollups/preset-profiles)で説明しています。

オプションは dApp スキャフォルダーと同じで、テンプレート名は上記の6つです。`multivm-rollup` テンプレートは `--help` には表示されますが、パッケージの README には記載されておらず、README には5つが挙げられています。

検証済みの例（開発者ハブ、2026年10月27日、空のディレクトリで npm からの `npx`）。確認できた結果: `Created my-rollup (defi-rollup template)` と、`tsc --noEmit` の成功。同じスキャフォールドと `npm run typecheck` を、同日に 0.6.2 で繰り返し、同じ結果でした。

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

スキャフォルダーが表示する次のステップ: `npm install`、`.env` にオペレーター鍵を入力、`npm run doctor`、`npm run create`、`npm run query-status`。生成された `.env` には、公開テストネットのエンドポイント（`https://api-testnet.qore.host`、`https://rpc-testnet.qore.host`、`https://evm-testnet.qore.host`）がすでに入っており、鍵のフィールドは空です: `QORE_MNEMONIC` または `QORE_OPERATOR_PRIVATE_KEY_HEX`（ポスト量子シード用の `QORE_PQC_SEED_HEX` とともに）。このファイルは決してコミットしないでください。

### `qorollup` CLI {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.7.0
qorollup doctor --network testnet
```

インストールせずに実行することもできます: `npx @qorechain/rdk-cli doctor`。

| コマンド | 内容 |
| --- | --- |
| `doctor` | プリフライト: エンドポイント、モジュールパラメータ、ネットワークの一致、署名者、残高、設定 |
| `params` | ライブのモジュールパラメータを表示 |
| `create --rollup-id <id>` | ロールアップを作成（`--profile`、`--stake-uqor`、`--dry-run`） |
| `status <id>`、`watch <id>` | ステータスとヘルス、またはライブ表示（`--interval <ms>`） |
| `advise <id>` | QCAI Copilot からのアドバイス（[QCAI Copilot](/rollups/qcai-copilot)を参照） |
| `suggest "<use case>"` | ユースケースに合うプロファイルを提案 |
| `receipt <id> <batch>` | 決済レシートを作成（`--verify`、`--out <file>`）、[決済レシート](/rollups/settlement-receipts)を参照 |
| `watchtower <id>` | オプティミスティックロールアップ向けのチャレンジャーフレームワーク、[ウォッチタワー](/rollups/watchtower)を参照 |
| `pause`、`resume`、`stop <id>` | ライフサイクルの遷移（作成者のみ） |
| `keygen` | オペレーター鍵（ニーモニックとアドレス）を生成 |
| `manifest export`、`manifest import` | ロールアップのマニフェストをエクスポートまたはインポート |
| `withdraw --file <json>` | 引き出しを組み立てて送信（`--dry-run`） |
| `faucet <address>` | テストネットの資金をリクエスト（`QORE_FAUCET_URL` が必要） |

グローバルフラグ: `--network testnet|mainnet`（デフォルトは testnet）、`--rest`、`--rpc`、`--evm-rpc`（エンドポイントの上書き、または `QORE_REST_URL`、`QORE_RPC_URL`、`QORE_EVM_RPC_URL`）、`--mnemonic` または `--key`（または `QORE_MNEMONIC`、`QORE_OPERATOR_PRIVATE_KEY_HEX`）、`--profile defi|gaming|nft|enterprise|custom`、`--json`、`-y, --yes`、`-h, --help`、`-v, --version`。

**`doctor`。** トランザクションを送信する操作の前に実行してください。2026年10月27日に 0.6.2 で、署名者を設定せずにテストネットで確認した出力です（メインネットも同じ出力で、`qorechain-vladi` と `https://api.qore.host` になります。ツールは長いダッシュを出力しますが、ここではハイフンで示しています）:

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

`!` で始まる行は警告であり、実行を失敗させません。署名者がないことが問題になるのは、ロールアップを作成または運用したい場合だけです。チェックが1つも失敗しなければ、コマンドは終了コード 0 で終了します。

**検証済みの例。** 開発者ハブより: 鍵なしでライブのモジュールパラメータを読み取ります。0.6.1 では失敗し（コマンドは何も出力せず、終了コード 0 で終了）、0.6.2 で再実行しました:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

0.6.2 で、`npx` 経由、グローバルインストール経由、ローカルの `node_modules/.bin/qorollup` リンク経由のいずれでも（および 0.7.0 でローカルリンク経由でも。`qorollup --version` は 0.7.0 と表示しました）、モジュールパラメータが出力されることを確認しました（最大ロールアップ数 200、最低ステーク 10000 QOR、作成時のバーン 1%、チャレンジウィンドウ 3600 s、データアベイラビリティブロブの最大サイズ 2,097,152 バイト、ブロブ保持 432,000 ブロック、1 ブロックあたりの最大バッチ数 10）。作成のドライランも確認しています:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## アクセス方法 {#how-to-access}

* **前提条件。** Node.js 20 以降とパッケージマネージャー。スキャフォルダーはファイルを書き込み、`--no-install` を指定しない限り依存関係をインストールするため、npm レジストリへのネットワークアクセスが必要です。Python、Rust、Go、Java の RDK クライアントはライブラリでありスキャフォルダーはありません。[ロールアップのデプロイ](/rollups/deploying-a-rollup)をご覧ください。
* **ネットワークとエンドポイント。** メインネット `qorechain-vladi`（EVM チェーン ID 9801）: REST `https://api.qore.host`、RPC `https://rpc.qore.host`、EVM `https://evm.qore.host`。テストネット `qorechain-diana`（チェーン ID 9800）: 最初のラベルの後ろに `-testnet` を付けた同じホスト。たとえば `https://api-testnet.qore.host`。データの読み取り、`doctor`、`params`、`suggest`、`--dry-run` にアカウントは不要です。
* **アカウントと鍵。** トランザクションを送信するものはすべて、資金のあるオペレーターアカウントと、そのニーモニックまたは秘密鍵が必要です。これらは環境変数またはフラグで渡し、決してコミットしないでください。ロールアップの作成には最低ステーク（両ネットワークで 10,000 QOR、2026年10月27日にライブで確認）が必要で、そのうち 1% が作成時にバーンされます。`qorollup keygen` で新しい鍵を作成できます。テストネットでは、テスト用の資金は [Dashboard Faucet](/dashboard/faucet) から、または `QORE_FAUCET_URL` を設定した `qorollup faucet` で入手できます。
* **ハイブリッド署名。** Native レーンのトランザクションには、secp256k1 署名と ML-DSA-87 署名の両方が必要です。テンプレートはニーモニックからポスト量子鍵を導出しますが、`qorollup` のトランザクションコマンドは導出しません（下記の制限事項を参照）。
* **費用。** ツールは無料です（Apache-2.0）。オンチェーンでは、手数料の下限はガスあたり 0.1 uqor で、上記のロールアップのステークとバーンは作成時に適用されます。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | リンク |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp`（コマンド `create-qorechain-dapp`） | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup`（コマンド `create-qorechain-rollup`） | 0.7.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli`（コマンド `qorollup`） | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk`（テンプレートが使用するライブラリ） | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk |

ソース: https://github.com/qorechain/qorechain-sdk/tree/main/cli（dApp スキャフォルダー）、https://github.com/qorechain/qorechain-rdk/tree/main/cli（ロールアップスキャフォルダー）、https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli（`qorollup`）。RDK の 0.7.0 リリースは PyPI、crates.io、Maven Central、Go モジュールプロキシにも公開されています（2026年10月27日に確認）。いずれも Apache-2.0 です。

## 制限事項と既知の問題 {#limits}

* **テスト実行では、`--network mainnet` を指定しても生成されるファイルは変わりませんでした。** 2026年10月27日に `fullstack-web` と `custom-rollup` を `--network mainnet` でスキャフォールドしたところ、生成された `.env` には依然として localhost のエンドポイント（dApp）、またはテストネットのエンドポイントとともに `QORE_NETWORK=testnet`（ロールアップ）が入っており、dApp の `App.tsx` は `testnet` クライアントを作成していました。ネットワークとエンドポイントは、`.env` で、ウェブテンプレートでは `src/App.tsx` でも、ご自身で設定してください。
* **どちらのネットワークにも、ロールアップはまだ存在しません**（2026年10月27日に確認）。ロールアップツールのトランザクション経路は、稼働中のロールアップでは一つも実行されていません。すべてをまずテストネットで検証し、[RDK 0.7.0: 変更点と制限事項](/rollups/deploying-a-rollup#rdk-050-limits)をお読みください。
* **`defi-rollup` テンプレートはバッチを決済できません。** ZK 決済はどちらのネットワークでもまだ使用できず（鍵の登録はチェーン v3.2.7 で予定されています）、そのデモ用回路は、いずれにしてもチェーンの証明チェックを通過できません。0.7.0 以降、このテンプレートは送信の前で停止するため、チェーンが必ず拒否するバッチに手数料を使うことはなくなりました。状況が変わるまでは、`optimistic` 決済のテンプレートを使用してください（[ZK、STARK、引き出し](/rollups/zk-stark-withdrawals)を参照）。
* **`multivm-rollup` テンプレートは、まだ稼働していないものに依存しています。** `0x0000000000000000000000000000000000000901` のクロス VM プリコンパイルはどちらのネットワークでも有効ではないため、コントラクトからの呼び出しは何も行いません。テンプレートはこれを確認し、そのコントラクトは黙って失敗するのではなく revert するように書かれています（[マルチ VM](/rollups/multi-vm)を参照）。
* **`qorollup` のトランザクションコマンドは従来型の署名のみです。** `create`、`pause`、`resume`、`stop`、`withdraw` はポスト量子鍵なしで接続しますが、どちらのネットワークも Native レーンではこれを拒否します。読み取り、`doctor`、`params`、`receipt`、`--dry-run` は影響を受けません。トランザクションを送信するには、スキャフォールドしたプロジェクト（そのスクリプトはハイブリッド署名を行います）、`pqcKeypair` を使った TypeScript の RDK、またはチェーンの CLI を使用してください。
* **一部の `qorollup` ヘルパーは、まだ接続先がありません。** 10月27日にテストネットに対して実行した `advise` は、手数料、ネットワーク、不正、RL エージェントの各サーフェス（ノードが 501 または "method does not exist" を返しました）と、存在しないロールアップについて「advisory unavailable」と表示しました。`suggest` は `source: fallback` のプロファイルを返しました。これは、アシスタントサービスではなく組み込みのデフォルトリストが使われたことを示します。警告をお読みください。
* **`rollup-app` は、求めたときだけブロードキャストします。** デフォルトではドライランを実行します。`QORE_BROADCAST=1` を指定すると、アカウントの ML-DSA-87 鍵を一度登録し、ハイブリッド署名を行います。そのサンプルのロールアップ値は例示用です。実際のプロファイル名とステークは[プリセットプロファイル](/rollups/preset-profiles)から取得してください。
* **`fullstack-web` のトークノミクスボタンはエラーを表示します。** そのパネルは、公開エンドポイントが提供していない `qor_` JSON-RPC メソッドを呼び出しています。残高の取得は動作します。`client.rest.getBurnStats()` のような REST の読み取りに置き換えてください。
* **`evm-solidity` には、資金のあるアカウント以上のものが必要です。** QoreChain で EVM トランザクションを送信するには、登録済みの ML-DSA-87 鍵と、開いている EVM 認可ウィンドウも必要で、これらは Native レーンから設定します（[EVM ガイド](/developer-guide/evm-development#evm-window)を参照）。テンプレートの `deploy` スクリプトは、このページのために稼働中のネットワークで実行されていません。
* **`create-qorechain-dapp --version` は `0.5.1` と表示します。** インストールされているパッケージは 0.10.0 です（2026年10月27日に確認）。バージョンは `package.json` またはレジストリで確認してください。
* **パッケージの README は古くなっています。** `create-qorechain-dapp` の README は2つのテンプレート、`create-qorechain-rollup` の README は5つを挙げていますが、`--help` では3つと6つが表示されます。`--help` を信頼してください。
* **0.6.2 より前のバージョンは npm からでは動作しません。** `qorollup` 0.6.1 以前は、npm でどのようにインストールしても何も出力せず終了コード 0 で終了し、`--version` は `0.4.1` と表示しました。どうしても 0.6.1 にとどまる必要がある場合は、`node node_modules/@qorechain/rdk-cli/dist/index.js <command>` を実行してください。そうでなければアップグレードしてください。
* **依存関係のコピー（0.6.x のみ）。** `@qorechain/rdk` 0.6.2 以前は `@qorechain/sdk` `^0.9.0` に依存していたため、SDK 0.10.0 も併せてインストールしたプロジェクトには、ネストされた2つ目の SDK 0.9.x が入っていました。0.7.0 以降、このキットは `@qorechain/sdk` `^0.10.0` に依存し、コピーを1つだけ共有します。
