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

> npm に `create-qorechain-dapp`（`0.3.0`）として公開されています。

## テンプレート

| テンプレート | 説明 |
| --- | --- |
| `evm-solidity` | Solidity の `Counter` コントラクト + viem のデプロイ/操作スクリプト（`@qorechain/evm`）。 |
| `fullstack-web` | 残高とトークノミクスを読み取る Vite + React + TypeScript の dApp（`@qorechain/sdk`）。 |

## オプション

| フラグ | 説明 |
| --- | --- |
| `-t, --template <name>` | 使用するテンプレート（`evm-solidity` \| `fullstack-web`）。 |
| `--network <name>` | ネットワークプリセット（`testnet` \| `mainnet`）。 |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`。 |
| `-y, --yes` | プロンプトをスキップしてデフォルトを使用します。 |
| `--no-install` | スキャフォールド後に依存関係をインストールしません。 |
| `--local` | `@qorechain/*` の依存関係を、SDK モノレポへのローカルな `file:` リンクに書き換えます。 |
| `-h, --help` | ヘルプを表示します。 |
| `-v, --version` | バージョンを出力します。 |

## ワークスペースに対するローカル開発

`@qorechain/*` パッケージは npm に公開されています。公開後は通常の
`npm install` で動作します。それ以前は、`--local` を使用してスキャフォールドした
プロジェクトをモノレポのパッケージに向けます（先に `pnpm -r build` でビルド
してください）:

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
