---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

公式のスターターテンプレートから新しい QoreChain dApp をスキャフォールドします。

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> npm には `create-qorechain-dapp`（`0.13.1`。SDK 0.13.0 に対するテンプレートのみのパッチ）として公開されています。生成される
> `package.json` ファイルは `@qorechain/sdk` `^0.13.0` に依存します（EVM テンプレートは
> `@qorechain/evm` `^0.13.0`）。スキャフォルダのバージョン 0.8.0 は `^0.3.0` の範囲を書き込んでおり、
> npm はこれを、稼働中のネットワークに対して署名できない 0.3 リリースに解決します。
> 0.8.0 でスキャフォールドした場合は、`npm i @qorechain/sdk@latest` を実行してください。

## テンプレート

| テンプレート | 説明 |
| --- | --- |
| `evm-solidity` | Solidity の `Counter` コントラクト + viem によるデプロイ/操作スクリプト（`@qorechain/evm`）。スクリプトは `pnpm run deploy` で実行してください（`pnpm deploy` は別の pnpm コマンドです）。`.env` を読み込み、README にデプロイ前に EVM ウィンドウを開く手順があります。 |
| `fullstack-web` | 残高とトークノミクスを読み取る Vite + React + TypeScript の dApp（`@qorechain/sdk`）。公開 REST は CORS ヘッダーを返さないため、REST は Vite の `/lcd` プロキシ経由で、開発中のブラウザコードは `/lcd/...` を呼び出します。 |
| `rollup-app` | `RollupClient` と multilayer ヘルパーを使うロールアップ + サイドチェーン/ペイチェーンのアプリ（`@qorechain/sdk`）。 |
| `foundry` | QoreChain の EVM Engine 向けの Foundry プロジェクト。`pnpm window` は、デプロイ前にアカウントの ML-DSA-87 鍵を登録し、[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)を開きます（npm のみの 0.11.0 で追加）。 |
| `hardhat` | Hardhat 3 向けの同様のもので、`pnpm window status`、`register`、`open` を備えます。 |
| `viem-wagmi` | viem と wagmi による Web dApp で、`@qorechain/evm` の `qorechain` と `qorechainTestnet` チェーンを使います。viem を `~2.53.1` に固定し、REST には同じ `/lcd` プロキシを使います。 |
| `cosmwasm` | QoreChain Native（Wasm）のコントラクトプロジェクト。稼働中のネットワークではコードのアップロードはガバナンスのみです。[QoreChain Native ガイド](/sdk/guides/cosmwasm)を参照してください。 |

`rollup-app` テンプレート（スキャフォルダ 0.10.0 以降）は、デフォルトでドライランを実行します。`QORE_BROADCAST=1` を指定すると、
ニーモニックからアカウントの ML-DSA-87 鍵を導出し、一度だけ登録して、
ハイブリッドで署名します。以前のテンプレートにはこれができませんでした。サンプルのロールアップの値
（`profile: "default"`、ステーク）は例示です。ブロードキャストする前に、実際のプロファイル名と
ステークを[プリセットプロファイル](/rollups/preset-profiles)と稼働中のモジュール
パラメータから取得してください。

`fullstack-web` テンプレートは、トークノミクスの概要を `client.qor` 経由で読み取ります。これは
公開エンドポイントが提供していない `qor_` JSON-RPC 呼び出しであるため、メインネットとテストネットでは
そのパネルにエラーが表示されます（残高の読み取りは動作します）。公開ネットワークでは、
`client.rest.getBurnStats()` のような REST 読み取りに切り替えてください。

## オプション

| フラグ | 説明 |
| --- | --- |
| `-t, --template <name>` | 使用するテンプレート（`evm-solidity` \| `fullstack-web` \| `rollup-app` \| `foundry` \| `hardhat` \| `viem-wagmi` \| `cosmwasm`）。 |
| `--network <name>` | ネットワークプリセット（`testnet` \| `mainnet`）。選んだネットワークの公開エンドポイントを生成される `.env` に書き込みます（0.13.1）。 |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`。 |
| `-y, --yes` | プロンプトをスキップしてデフォルトを使用します。 |
| `--no-install` | スキャフォールド後に依存関係をインストールしません。 |
| `--local` | `@qorechain/*` の依存関係を、SDK モノレポへのローカルの `file:` リンクに書き換えます。 |
| `-h, --help` | ヘルプを表示します。 |
| `-v, --version` | バージョンを表示します。 |

## ワークスペースに対するローカル開発

`@qorechain/*` パッケージは npm に公開されているため、通常の `npm install` で動作します。
代わりに、スキャフォールドしたプロジェクトをモノレポのパッケージに向けるには
`--local` を使用します（先に `pnpm -r build` でビルドしてください）。

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
