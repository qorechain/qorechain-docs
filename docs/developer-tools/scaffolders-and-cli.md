---
slug: /developer-tools/scaffolders-and-cli
title: Project Scaffolders and the qorollup CLI
sidebar_label: Scaffolders and CLI
sidebar_position: 21
---

# Project Scaffolders and the `qorollup` CLI

Three command-line tools get a QoreChain project from nothing to a typed, buildable starting point. They are for application developers (dApps) and rollup operators who work in Node.js:

* **`create-qorechain-dapp`** (0.13.1, a templates-only patch on top of SDK 0.13.0) scaffolds a dApp from one of seven templates, built on the [QoreChain SDK](/sdk/overview). Four of the seven (`foundry`, `hardhat`, `viem-wagmi`, `cosmwasm`) belong to the [chain developer kit](/developer-tools/chain-dev-sdk).
* **`create-qorechain-rollup`** (0.8.0) scaffolds a rollup project from one of six templates, built on the TypeScript [Rollup Development Kit](/rollups/overview).
* **`qorollup`**, the command of the `@qorechain/rdk-cli` package (0.8.0), is the operator command line: preflight checks, creating and monitoring a rollup, reading live parameters.

The page reflects the published packages as installed from npm on 27 October 2026, and `create-qorechain-dapp` 0.12.0 as installed on 4 November 2026; the current version is 0.13.1 (12 November 2026). The 0.13.1 template changes described below come from the package's release notes, not from a fresh install run. The conceptual guides are [Deploying a Rollup](/rollups/deploying-a-rollup) and the [SDK CLI reference](/sdk/reference/cli).

## Innovations {#innovations}

* **Non-interactive scaffolding for CI.** Every prompt has a flag: `--template`, `--network`, `--package-manager`, `--yes` (accept defaults) and `--no-install`. A pipeline can generate and build a project with one command and no terminal.
* **Templates are pinned to the current packages.** The dApp templates depend on `@qorechain/sdk` `^0.13.0` (the EVM templates also on `@qorechain/evm` `^0.13.0`) and the rollup templates on `@qorechain/rdk` `^0.8.0`. An earlier scaffolder (0.8.0) wrote ranges that resolved to an SDK that could not sign for the live networks; that does not happen with the current one.
* **Rollup templates encode a valid configuration per use case.** Each rollup template sets a settlement, sequencer, data-availability, gas and VM combination that the RDK's compatibility matrix accepts, and the scaffolder prints the live stake and creation burn before you create anything.
* **A preflight command that names what is missing.** `qorollup doctor` (and `npm run doctor` inside a rollup template) checks that the REST endpoint answers, that the module parameters can be read, that the endpoint is the network you asked for, and that a signer is configured, and it prints one line per check. Inside a template it also validates the rollup configuration against the compatibility matrix.
* **Hybrid signing wired into the templates.** The rollup templates connect through a small `signer.ts` that derives the account's ML-DSA-87 key from your mnemonic (or takes a seed with a raw private key) and signs hybrid, which the networks require on the native lane. The `rollup-app` dApp template does the same and runs as a dry run unless you set `QORE_BROADCAST=1`.
* **Dry runs.** `qorollup create ... --dry-run` validates the configuration, prints the stake and the burn, and states that it would submit `MsgCreateRollup` without broadcasting.
* **Machine-readable output.** `qorollup ... --json` prints JSON for scripts.

## How to use {#how-to-use}

### Scaffold a dApp {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Template | What it generates | Scripts |
| --- | --- | --- |
| `evm-solidity` | A Solidity `Counter` contract with a pre-compiled artifact, and a viem script that deploys it and calls it using `@qorechain/evm`. Files: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. Run it with `pnpm run deploy` (not `pnpm deploy`, which is a different pnpm command); it reads `.env`, and the template's README covers opening the EVM window before deploying. | `deploy` |
| `fullstack-web` | A Vite, React and TypeScript page that reads an address's balances (and a tokenomics overview) with `@qorechain/sdk`. Files: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. Since 0.13.1 REST goes through a Vite `/lcd` proxy. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | A Node script using the SDK's `createRollupClient` and `createMultilayerClient` to build rollup and sidechain or paychain messages. Files: `src/index.ts` and the usual config. Dry run by default. | `start`, `typecheck` |
| `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | The chain developer kit templates: a Foundry project, a Hardhat 3 and viem project (both with a `pnpm window` helper for the EVM authorization window; since 0.13.0, `pnpm window recovery-code` prints a new recovery code, and with `PRIVATE_KEY` set `pnpm window` reads `QORE_PQC_RECOVERY_CODE` and stops with a message when it is missing; with `QORE_MNEMONIC` nothing changes), a wagmi and RainbowKit dApp with the QoreX wallet, and a QoreChain Native CW20 token. Details, scripts and limits: [Chain developer kit](/developer-tools/chain-dev-sdk#templates). | see that page |

| Flag | Meaning |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app`, `foundry`, `hardhat`, `viem-wagmi` or `cosmwasm` |
| `--network <name>` | `testnet` or `mainnet`; writes that network's public endpoints into the generated `.env` (0.13.1) |
| `--package-manager <pm>` | `pnpm`, `npm` or `yarn` |
| `-y, --yes` | skip prompts and use defaults |
| `--no-install` | do not install dependencies |
| `--local` | rewrite `@qorechain/*` dependencies to local links in the SDK monorepo (for SDK contributors) |
| `-h, --help`, `-v, --version` | help, version |

### Template changes in 0.13.1 {#template-fixes-0131}

Version 0.13.1 (12 November 2026) is a templates-only patch; the SDK packages stay at 0.13.0. From the package's release notes:

* `--network` writes the chosen network's public endpoints into the generated `.env`.
* `fullstack-web` and `viem-wagmi` reach REST through a Vite `/lcd` proxy, because the public REST sends no CORS headers. In dev, browser code calls `/lcd/...`.
* `evm-solidity`: run the deploy script with `pnpm run deploy` (plain `pnpm deploy` is a different pnpm command). It reads `.env`, and the README explains how to open the EVM window before deploying.
* `viem-wagmi` pins viem `~2.53.1`.
* The `hardhat` README notes a wait of about 10 seconds after opening a window before the first transaction.

Tested example (from the developer hub; run on 27 October 2026 in an empty directory, with `npx` from the public npm registry): it scaffolds the web template and builds it. Observed: `Done! Created my-dapp` and a successful `vite build`. The build prints a bundle-size warning, which is harmless.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Before you run the web app, open the generated `.env`: it points at `http://localhost:1317` and `http://localhost:8545`, so set `VITE_QORE_REST_URL` to `https://api-testnet.qore.host` (or `https://api.qore.host` for mainnet) and `VITE_QORE_EVM_RPC_URL` to `https://evm-testnet.qore.host` (or `https://evm.qore.host`).

### Scaffold a rollup project {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Template | Profile | Settlement / sequencer / DA / gas / VM | Extra files |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | a reference prover (`src/prover.ts`) and a demo circuit under `circuits/` |
| `gaming-rollup` | gaming | based, based, native, flat gas, custom VM | none |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, with a challenge flow | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, subsidized gas, EVM | none |
| `custom-rollup` | custom | fully parameterized, every field documented | none |
| `multivm-rollup` | multivm | an EVM rollup that calls QoreChain Native contracts through the cross-VM precompile | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Every template contains `rollup.config.ts` (the configuration), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` and `.env.example`, a README, and a `.github/workflows/deploy.yml`. Scripts: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. The preset profiles are explained in [Preset Profiles](/rollups/preset-profiles).

The options are the same as for the dApp scaffolder, with the six template names above. The `multivm-rollup` template is listed by `--help` but not in the package README, which lists five.

Tested example (developer hub, 27 October 2026, `npx` from npm in an empty directory). Observed: `Created my-rollup (defi-rollup template)` and `tsc --noEmit` passing. The same scaffold and `npm run typecheck` were repeated with 0.6.2 on the same day, with the same result.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

Next steps, as the scaffolder prints them: `npm install`, fill the operator key in `.env`, `npm run doctor`, `npm run create`, `npm run query-status`. The generated `.env` already holds the public testnet endpoints (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) and empty key fields: `QORE_MNEMONIC` or `QORE_OPERATOR_PRIVATE_KEY_HEX` (with `QORE_PQC_SEED_HEX` for the post-quantum seed). Never commit that file.

### The `qorollup` CLI {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # prints the installed version (0.8.0 is current)
qorollup doctor --network testnet
```

You can also run it without installing: `npx @qorechain/rdk-cli doctor`.

| Command | What it does |
| --- | --- |
| `doctor` | preflight: endpoints, module parameters, network match, signer, balance, config |
| `params` | print the live module parameters |
| `create --rollup-id <id>` | create a rollup (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | status and health, or a live view (`--interval <ms>`) |
| `advise <id>` | advice from the QCAI Copilot (see [QCAI Copilot](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | suggest a profile for a use case |
| `receipt <id> <batch>` | build a settlement receipt (`--verify`, `--out <file>`), see [Settlement Receipts](/rollups/settlement-receipts) |
| `watchtower <id>` | challenger framework for optimistic rollups, see [Watchtower](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | lifecycle transitions (creator only) |
| `keygen` | generate an operator key (mnemonic and address) |
| `manifest export`, `manifest import` | export or import a rollup manifest |
| `withdraw --file <json>` | assemble and submit a withdrawal (`--dry-run`) |
| `faucet <address>` | request testnet funds (needs `QORE_FAUCET_URL`) |

Global flags: `--network testnet|mainnet` (default testnet), `--rest`, `--rpc`, `--evm-rpc` (endpoint overrides, or `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` or `--key` (or `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Run it before anything that sends a transaction. Output observed on 27 October 2026 with 0.6.2 and no signer set, on the testnet (mainnet printed the same, with `qorechain-vladi` and `https://api.qore.host`; the tool prints long dashes, shown here as hyphens):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

A line starting with `!` is a warning and does not fail the run; a missing signer is only a problem when you want to create or operate a rollup. The command exits 0 when no check fails.

**Tested example.** From the developer hub: read the live module parameters with no key. It failed on 0.6.1 (the command printed nothing and exited 0) and was re-run on 0.6.2:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

Observed with 0.6.2 through `npx`, through a global install and through the local `node_modules/.bin/qorollup` link (and with 0.7.0 through the local link, where `qorollup --version` printed 0.7.0): the module parameters print (max rollups 200, min stake 10000 QOR, creation burn 1%, challenge window 3600 s, max data-availability blob 2,097,152 bytes, blob retention 432,000 blocks, max batches per block 10). A dry run of a creation, also observed:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## How to access {#how-to-access}

* **Prerequisites.** Node.js 20 or later and a package manager. The scaffolders write files and, unless you pass `--no-install`, install dependencies, so they need network access to the npm registry. The Python, Rust, Go and Java RDK clients are libraries and have no scaffolder; see [Deploying a Rollup](/rollups/deploying-a-rollup).
* **Networks and endpoints.** Mainnet `qorechain-vladi` (EVM chain id 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Testnet `qorechain-diana` (chain id 9800): the same hosts with `-testnet` after the first label, for example `https://api-testnet.qore.host`. Reading data, `doctor`, `params`, `suggest` and `--dry-run` need no account.
* **Accounts and keys.** Anything that sends a transaction needs a funded operator account and its mnemonic or private key, supplied through environment variables or flags, never committed. Creating a rollup needs the minimum stake (10,000 QOR on both networks, read live on 27 October 2026), of which 1% is burned on creation. `qorollup keygen` makes a new key; on the testnet, test funds come from the [Dashboard Faucet](/dashboard/faucet), or from `qorollup faucet` with `QORE_FAUCET_URL` set.
* **Hybrid signature.** Native-lane transactions need a secp256k1 signature plus an ML-DSA-87 signature. The templates derive the post-quantum key from your mnemonic; the `qorollup` transaction commands do not (see the limits below).
* **Costs.** The tools are free (Apache-2.0). On chain, the fee floor is 0.1 uqor per gas; the rollup stake and burn above apply to creation.

## Where it is published {#where-published}

| Registry | Package | Version | Link |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (command `create-qorechain-dapp`) | 0.13.1 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (command `create-qorechain-rollup`) | 0.8.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (command `qorollup`) | 0.8.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (library the templates use) | 0.8.0 | https://www.npmjs.com/package/@qorechain/rdk |

Source: https://github.com/qorechain/qorechain-sdk/tree/main/cli (dApp scaffolder), https://github.com/qorechain/qorechain-rdk/tree/main/cli (rollup scaffolder) and https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). The 0.8.0 release of the RDK is also on PyPI, crates.io, Maven Central and the Go module proxy (checked 31 October 2026). All are Apache-2.0.

## Limits and known issues {#limits}

* **`--network mainnet` did not change the generated files in a test run (0.10.0 and 0.12.0).** The 0.13.1 release notes say `--network` now writes the chosen network's public endpoints into `.env`; that was not re-tested here, so check the file after scaffolding. On 27 October 2026 `fullstack-web` and `custom-rollup` were scaffolded with `--network mainnet`; the generated `.env` still held localhost endpoints (dApp) or `QORE_NETWORK=testnet` with the testnet endpoints (rollup), and the dApp's `App.tsx` created a `testnet` client. On 4 November 2026 `create-qorechain-dapp` 0.12.0 behaved the same for `evm-solidity`, `fullstack-web` and `rollup-app`. Set the network and endpoints yourself in `.env` and, for the web template, in `src/App.tsx`.
* **No rollup exists on either network yet** (checked 27 October 2026). No transaction path of the rollup tools has been exercised on a live rollup. Validate everything on the testnet first, and read [RDK 0.8.0: changes and limits](/rollups/deploying-a-rollup#rdk-050-limits).
* **The `defi-rollup` template cannot settle a batch.** ZK settlement is not usable on mainnet (key registration exists only on the testnet, since chain v3.2.7, and no ZK rollup has been tried there), and its demo circuit could not pass the chain's proof check in any case. From 0.7.0 the template stops before sending, so it no longer spends a fee on a batch the chain always refuses. Use a template with `optimistic` settlement until that changes (see [ZK, STARK and Withdrawals](/rollups/zk-stark-withdrawals)).
* **The `multivm-rollup` template depends on something that is not live.** The cross-VM precompile at `0x0000000000000000000000000000000000000901` is not active on mainnet, so a call from a contract does nothing there; on the testnet it is active with an allowlist (a read-only `eth_call` was tested on 7 November 2026); the template checks for this and its contract is written to revert instead of failing silently (see [Multi-VM](/rollups/multi-vm)).
* **`qorollup` transaction commands need a post-quantum key (0.7.1 and later).** `create`, `pause`, `resume`, `stop` and `withdraw` sign hybrid (ML-DSA-87 + secp256k1) as both networks require, using a key derived from `--mnemonic` / `QORE_MNEMONIC` and matched against the chain, or `--pqc-seed` / `QORE_PQC_SEED_HEX` alongside `--key`; without one the command refuses to send. In 0.7.0 and earlier these commands signed classical only and the networks refused every one; upgrade, or use a scaffolded project (its scripts sign hybrid), the TypeScript RDK with a `pqcKeypair`, or the chain CLI. Reads, `doctor`, `params`, `receipt` and `--dry-run` never needed a key. Untested live: no rollup exists.
* **Some `qorollup` helpers have nothing to talk to yet.** `advise` against the testnet on 27 October printed "advisory unavailable" for the fee, network, fraud and RL-agent surfaces (the node answered 501 or "method does not exist") and for a rollup that does not exist. `suggest` returned a profile with `source: fallback`, which indicates the built-in default list was used instead of the assistant service. Read the warnings.
* **`rollup-app` broadcasts only when you ask.** It runs a dry run by default; with `QORE_BROADCAST=1` it registers the account's ML-DSA-87 key once and signs hybrid. Its sample rollup values are illustrative: take real profile names and the stake from [Preset Profiles](/rollups/preset-profiles).
* **`fullstack-web` shows an error on its tokenomics button.** That panel calls a `qor_` JSON-RPC method the public endpoints do not serve; the balance lookup works. Replace it with a REST read such as `client.rest.getBurnStats()`.
* **`evm-solidity` needs more than a funded account.** Sending an EVM transaction on QoreChain also needs a registered ML-DSA-87 key and an open EVM authorization window, set up from the native lane (see the [EVM guide](/developer-guide/evm-development#evm-window)). The template's `deploy` script was not run against a live network for this page.
* **`create-qorechain-dapp --version` prints `0.5.1`** although the installed package was 0.12.0 (checked on 27 October 2026 with 0.10.0 and again on 4 November 2026 with 0.12.0). Read the version from `package.json` or the registry.
* **The package READMEs are out of date.** The `create-qorechain-dapp` README lists two templates and the `create-qorechain-rollup` README five (checked 27 October 2026); `--help` shows seven and six. Trust `--help`.
* **Versions before 0.6.2 do not work from npm.** `qorollup` 0.6.1 and earlier, installed through npm in any way, printed nothing and exited with code 0, and `--version` printed `0.4.1`. If you must stay on 0.6.1, run `node node_modules/@qorechain/rdk-cli/dist/index.js <command>`; otherwise upgrade.
* **Dependency copies (RDK 0.6.x, and RDK 0.8.0 next to SDK 0.12.0).** `@qorechain/rdk` 0.6.2 and earlier depend on `@qorechain/sdk` `^0.9.0`, so a project that also installed SDK 0.10.0 held a second, nested SDK 0.9.x. From 0.7.0 the kit depends on `@qorechain/sdk` `^0.10.0` and shares one copy with an SDK 0.10.x app. **An app on SDK 0.12.0 that also installs `@qorechain/rdk` 0.8.0 still gets a nested copy of SDK 0.10.0** (and of `@qorechain/evm` 0.8.0), because a caret range on a 0.x version does not take newer minors (checked with `npm ls` on 4 November 2026). Keep SDK calls and RDK calls in separate modules, or pass objects between them as plain data, until the RDK range moves.
