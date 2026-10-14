---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Scaffold a new QoreChain dApp from an official starter template.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Published to npm as `create-qorechain-dapp` (`0.8.0`). The generated
> `package.json` files pin `@qorechain/sdk` / `@qorechain/evm` to `^0.3.0`, which
> npm resolves to a 0.3 release that cannot sign for the live networks. After
> scaffolding, run `npm i @qorechain/sdk@latest` (and `npm i @qorechain/evm@latest`
> for the EVM template).

## Templates

| Template | Description |
| --- | --- |
| `evm-solidity` | A Solidity `Counter` contract + a viem deploy/interact script (`@qorechain/evm`). |
| `fullstack-web` | A Vite + React + TypeScript dApp reading balances and tokenomics (`@qorechain/sdk`). |
| `rollup-app` | A rollup + sidechain/paychain app using the `RollupClient` and the multilayer helper (`@qorechain/sdk`). |

The `fullstack-web` template reads the tokenomics overview through `client.qor`, a
`qor_` JSON-RPC call that the public endpoints do not serve, so on mainnet and
testnet that panel shows an error; the balance read works. Switch it to a REST read
such as `client.rest.getBurnStats()` for the public networks.

## Options

| Flag | Description |
| --- | --- |
| `-t, --template <name>` | Template to use (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | Network preset (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Skip prompts and use defaults. |
| `--no-install` | Do not install dependencies after scaffolding. |
| `--local` | Rewrite `@qorechain/*` deps to local `file:` links into the SDK monorepo. |
| `-h, --help` | Show help. |
| `-v, --version` | Print the version. |

## Local development against the workspace

`@qorechain/*` packages are published to npm, so a plain `npm install` works. Use
`--local` to point the scaffolded project at the monorepo packages instead (build
them first with `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
