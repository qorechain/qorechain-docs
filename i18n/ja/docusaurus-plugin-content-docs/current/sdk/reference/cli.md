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

> npm には `create-qorechain-dapp`（`0.10.0`）として公開されています。生成される
> `package.json` ファイルは `@qorechain/sdk` `^0.10.0` に依存します（EVM テンプレートは
> `@qorechain/evm` `^0.8.0`）。スキャフォルダのバージョン 0.8.0 は `^0.3.0` の範囲を書き込んでおり、
> npm はこれを、稼働中のネットワークに対して署名できない 0.3 リリースに解決します。
> 0.8.0 でスキャフォールドした場合は、`npm i @qorechain/sdk@latest` を実行してください。

## テンプレート

| テンプレート | 説明 |
| --- | --- |
| `evm-solidity` | Solidity の `Counter` コントラクト + viem によるデプロイ/操作スクリプト（`@qorechain/evm`）。 |
| `fullstack-web` | 残高とトークノミクスを読み取る Vite + React + TypeScript の dApp（`@qorechain/sdk`）。 |
| `rollup-app` | `RollupClient` と multilayer ヘルパーを使うロールアップ + サイドチェーン/ペイチェーンのアプリ（`@qorechain/sdk`）。 |

`rollup-app` テンプレート（スキャフォルダ 0.10.0）は、デフォルトでドライランを実行します。`QORE_BROADCAST=1` を指定すると、
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
| `-t, --template <name>` | 使用するテンプレート（`evm-solidity` \| `fullstack-web` \| `rollup-app`）。 |
| `--network <name>` | ネットワークプリセット（`testnet` \| `mainnet`）。 |
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
