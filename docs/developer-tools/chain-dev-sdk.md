---
slug: /developer-tools/chain-dev-sdk
title: Chain Developer Kit
sidebar_label: Chain Developer Kit
sidebar_position: 34
---

# Chain developer kit (EVM and QoreChain Native templates)

The chain developer kit is the part of QoreChain SDK **0.11.0** that helps Solidity and smart-contract teams build on QoreChain with the tools they already use. It adds viem chain definitions and EVM authorization window helpers to `@qorechain/evm`, four new project templates to `create-qorechain-dapp` (Foundry, Hardhat 3, viem with wagmi, and a QoreChain Native CosmWasm token), EVM quickstarts for five languages, and a reference on how the QoreChain EVM differs from Ethereum. It is for Solidity teams porting contracts from Ethereum, dApp front-end developers on wagmi and RainbowKit, CosmWasm developers, and maintainers of EVM tools who want to add QoreChain.

:::caution Coming: SDK 0.11.0 is tagged but not published on npm
SDK 0.11.0 is tagged on GitHub (`qorechain/qorechain-sdk`, tag `v0.11.0`, 27 October 2026). **Its npm release is pending**, and on 27 October 2026 `npm view` for version 0.11.0 of `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm` and `create-qorechain-dapp` found nothing. This page gives **no install command for 0.11.0**. Every item marked **from 0.11.0** below does not work from npm today. The items marked **live today** do: they come from `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 and the language SDKs at 0.10.0. 0.11.0 changes the npm packages alone; the Python, Rust, Go and Java SDKs stay at 0.10.0.
:::

The kit targets mainnet (`qorechain-vladi`, EVM chain ID 9801) and testnet (`qorechain-diana`, EVM chain ID 9800).

## Live today and coming in 0.11.0 {#status}

| Item | Status | Where |
|---|---|---|
| Reading with ethers v6, web3.py, go-ethereum, alloy or web3j against the public endpoints | **Live today** (no QoreChain package needed) | [Quickstart 1](#quickstart-ethers) |
| `createEvmClient`, ERC-20, ERC-721 and ERC-1155 helpers, `precompiles` bindings, `PRECOMPILE_ADDRESSES` | **Live today** in `@qorechain/evm` 0.8.0 | [Quickstart 2](#quickstart-evm-080) |
| Opening and reading an EVM authorization window from TypeScript, with `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` | **Live today** in `@qorechain/sdk` 0.10.0 | [Quickstart 5](#quickstart-open-window) |
| The same window builders in Python, Go, Rust and Java | **Live today** in the 0.10.0 SDKs | [Main API](#main-api) |
| EIP-7702 consent helpers `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | **Live today** in `@qorechain/sdk` 0.10.0 | [Main API](#main-api) |
| The scaffolder with the templates `evm-solidity`, `fullstack-web`, `rollup-app` | **Live today** in `create-qorechain-dapp` 0.10.0 | [Quickstart 6](#quickstart-scaffold-live) |
| viem chain definitions `qorechain` and `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **From 0.11.0** (coming) | [Quickstart 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, address converters, window constants, subpath `@qorechain/evm/window` | **From 0.11.0** (coming) | [Quickstart 4](#quickstart-window-helpers) |
| Templates `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` and the `pnpm window` helper | **From 0.11.0** (coming) | [Templates](#templates) |
| `PqcStatusBadge` in `@qorechain/react` | **From 0.11.0** (coming) | [Main API](#main-api) |

## Innovations {#innovations}

- **Sending is authorized on purpose, with a bounded window.** An EVM transaction is admitted only from an account that has a registered ML-DSA-87 key and an open EVM authorization window. The window is opened by a native-lane message signed hybrid (secp256k1 plus ML-DSA-87), so the secp256k1 key that an EVM library holds can never authorize spending on its own. The Ethereum transaction itself stays a normal Ethereum transaction.
- **A window that is sized in bounds, not trust.** A window limits the number of blocks (1 to 17,280), the number of EVM transactions (1 to 1,000) and a total in uqor that covers the value plus the maximum fee of every admitted transaction. `nativeOnly` limits it to plain QOR transfers and `allowedTargets` (at most 16 addresses) limits recipients and refuses contract creation.
- **One account, two encodings.** For an eth-native account the `0x` and `qor1...` addresses are the same 20 bytes and show the same balance, so one key works on the EVM and the native lane. QOR has 18 decimals on the EVM and 6 on the native lane (`uqor`); 1 uqor is 10^12 wei.
- **Helpers that name the refusal.** `classifyEvmWindowRejection` turns a refused transaction into one of four reasons, `no-pqc-key`, `no-window`, `exhausted` or `invalid`, from a viem or ethers error, a native-lane delivery result or a string.
- **Window sizing in uqor.** `evmWindowCost` and `weiToUqorCeil` size a window from value, gas and fee cap, rounding wei up to uqor, so the total covers the worst case.
- **No automatic opening.** The kit deliberately has no helper that opens a window before a send. The window exists so that spending is authorized on purpose.
- **Free simulation.** `eth_call` and `eth_estimateGas` work for any account without a window or a registered key.
- **Templates that wire the window.** The Foundry and Hardhat templates include `pnpm window status|register|open`, which derives the ML-DSA-87 key from the same secret as the EVM key, registers it once and broadcasts the hybrid-signed opening message.
- **A documented compatibility surface.** A reference page (read from the public endpoints on 27 October 2026) lists what differs from Ethereum: transaction types, forks, finality, fee fields, JSON-RPC namespaces and precompiles. It is summarized [below](#evm-differences).

## What the kit contains {#contents}

### `@qorechain/evm` {#evm-package}

**From 0.11.0** (new):

- `qorechain` (9801) and `qorechainTestnet` (9800): viem chain objects with the public endpoints, native currency QOR with 18 decimals, and the explorer `https://explore.qore.network`. `QORECHAIN_CHAINS` lists both (mainnet, then testnet) for wagmi and RainbowKit. `QORECHAIN_REST_ENDPOINTS` maps each EVM chain ID to its native-lane REST endpoint.
- `evmWindowStatus({ rest, address })` reads an account's window over REST (`/qorechain/pqc/v1/evm_window/{address}`), accepts a `qor1...` or `0x` address, and answers `{ found: false }` instead of failing when there is none. `parseEvmWindow` parses the raw answer.
- `openEvmWindowMessage(params)` checks the bounds and composes the native-lane `MsgOpenEVMWindow` as a plain `{ typeUrl, value }` object, ready to sign with `@qorechain/sdk`. `checkOpenEvmWindowParams` runs the checks alone.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress`, and the constants `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17,280), `MAX_EVM_WINDOW_TXS` (1,000) and `MAX_EVM_WINDOW_TARGETS` (16).
- The window helpers are also published without viem at the subpath `@qorechain/evm/window`.

**Live today** (0.8.0 and later): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, the `erc20` helpers, ERC-721 and ERC-1155 helpers, the `precompiles` bindings and `PRECOMPILE_ADDRESSES`. See the [EVM guide](/sdk/guides/evm).

### Templates {#templates}

`create-qorechain-dapp` has three templates live today (`evm-solidity`, `fullstack-web`, `rollup-app`; see [Scaffolders and CLI](/developer-tools/scaffolders-and-cli)). **From 0.11.0** it has seven. The four new ones:

| Template | What you get |
|---|---|
| `foundry` | A Foundry project: `Counter` contract, tests, deploy script, named RPC endpoints `qorechain` and `qorechain_testnet`, and `pnpm window status\|register\|open`. |
| `hardhat` | A Hardhat 3 and viem project: `Counter` contract, tests on the simulated network, an Ignition deploy module, networks `qorechain` and `qorechainTestnet`, and `pnpm window status\|register\|open`. |
| `viem-wagmi` | A Vite, React, wagmi and RainbowKit dApp with the QoreX wallet (`@qorechain/qorex-rainbowkit`) and the chain definitions from `@qorechain/evm`. It shows the latest block, the QOR balance and the account's EVM window. |
| `cosmwasm` | A QoreChain Native (CosmWasm) CW20 token on `cw20-base` from cw-plus, an optimized build in Docker, a governance upload proposal script, and testnet instantiate and query scripts. |

The templates pin `@qorechain/evm` and `@qorechain/sdk` to `^0.11.0`, so they do not install from npm until 0.11.0 is published.

### Guides in the SDK repository {#guides}

The repository (`docs/docs/guides/`, tag `v0.11.0`) has `evm-quickstarts.md` (reads for viem, ethers v6, web3.py, go-ethereum, alloy and web3j, plus a "Before you send" section), `evm-differences.md` ("QoreChain EVM compared with Ethereum"), `evm.md` and `cosmwasm.md`. The same material on this site: [EVM guide](/sdk/guides/evm), [EVM development](/developer-guide/evm-development) and [QoreChain Native development](/developer-guide/cosmwasm-development).

Also in the tag: contribution files for other tools (viem chain definitions, Sourcify chain entries and a Scaffold-ETH 2 extension) under `contrib/` and `templates/scaffold-eth-extension/`. They are prepared files in the repository, not merged upstream.

## Use cases {#use-cases}

1. **A Solidity team porting from Ethereum.** Scaffold the `foundry` template (from 0.11.0), copy contracts in, run `forge test` locally, run `pnpm window register` once and `pnpm window open` before each deploy batch. The [differences](#evm-differences) list what to change: no blob transactions, PREVRANDAO is a constant, no `debug_*` tracing on the public endpoints.
2. **A Hardhat 3 project going to testnet.** Scaffold the `hardhat` template (from 0.11.0), keep your Ignition modules and deploy with `pnpm deploy:testnet` after opening a window.
3. **A dApp front end on wagmi.** Import `QORECHAIN_CHAINS` into the wagmi config and RainbowKit (from 0.11.0), show the user's window with `evmWindowStatus`, and explain a refused send with `classifyEvmWindowRejection`.
4. **A backend service in another language.** A Python, Go, Rust or Java service reads balances and calls contracts with web3.py, go-ethereum, alloy or web3j as on Ethereum, **today**. To send, it builds `MsgOpenEVMWindow` with that language's QoreChain SDK 0.10.0, which is live.
5. **A CosmWasm developer.** Scaffold the `cosmwasm` template (from 0.11.0), test the CW20 with `cargo test`, build the optimized Wasm, submit a governance proposal to store the code, and instantiate it on testnet once the proposal passes.
6. **A wallet or custody integration.** An integration that holds keys for users needs to know that the secp256k1 key alone cannot spend on the EVM lane. It opens narrow windows (`nativeOnly` or `allowedTargets`) signed with the account's ML-DSA-87 key, **today** with `openEvmWindowMsg` from `@qorechain/sdk` 0.10.0.
7. **Maintainers of EVM tools.** Maintainers of viem, Sourcify or Scaffold-ETH 2 can read the prepared contribution files to add chain IDs 9800 and 9801.

## How it works {#how-it-works}

- **The authorization rule.** The chain admits an EVM transaction from an account that has a registered ML-DSA-87 key and a live window, and refuses it otherwise. The rule is the protocol feature `evm-pqc-authorisation-window`, enabled on both networks; read it at `/qorechain/pqc/v1/protocol_features`. See [EVM authorization window](/sdk/guides/evm#evm-window) and [the first-transaction guide](/getting-started/first-transaction#evm-window).
- **Opening and closing.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) opens a window, signed hybrid; opening a window replaces any earlier one. `MsgCloseEVMWindow` closes it.
- **What a window bounds.** Blocks (a block count, not a duration), EVM transactions, and a uqor total that covers value plus the maximum fee (gas limit times fee cap) of every admitted transaction. `nativeOnly` and `allowedTargets` narrow it further (see [Scope a window](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** The native sequence and the EVM nonce are the same counter. Opening a window advances it, so open the window, then read the nonce, then sign the EVM transaction.
- **The template helper.** In `foundry` and `hardhat`, `pnpm window` derives the account from `PRIVATE_KEY` (or `QORE_MNEMONIC`), derives its ML-DSA-87 key from the same secret, registers the key once (`register`) and broadcasts `MsgOpenEVMWindow` signed hybrid (`open`). By default it sizes a window of 600 blocks and 5 transactions for transactions of up to 3,000,000 gas at a 250 gwei fee cap.
- **CosmWasm on QoreChain Native.** Code upload is through governance on both networks (`code_upload_access` is `Nobody`): code is stored by a governance proposal that carries `MsgStoreCode` with the governance module as sender. Instantiation is open to everybody on testnet and closed on mainnet (`instantiate_default_permission` is `Everybody` on testnet and `Nobody` on mainnet, read on 27 October 2026). Read both at `/cosmwasm/wasm/v1/codes/params`; list stored codes at `/cosmwasm/wasm/v1/code`. Mainnet had no stored codes on 27 October 2026.

## QoreChain EVM compared with Ethereum {#evm-differences}

Read from the public endpoints on 27 October 2026 (SDK guide `evm-differences.md`). Network state (fees, block times, active precompiles) is dated; read it live before relying on it.

- **Sending.** Every EVM transaction needs a registered ML-DSA-87 key and an open window for its sender, with no exceptions per account. Deploys, transfers and contract calls are all covered. An account with a registered key has no classical-signature path on the native lane either: every native transaction it signs is hybrid.
- **Simulation.** `eth_call` and `eth_estimateGas` need no window.
- **Transaction types.** Types 0 (legacy), 1 (access list), 2 (EIP-1559) and 4 (EIP-7702) are accepted. **EIP-4844 blob transactions (type 3) are refused.** Cancun opcodes work, but `blobGasUsed` and `excessBlobGas` are always 0, `eth_blobBaseFee` does not exist and the point evaluation precompile (`0x0a`) returns an error.
- **Forks.** Through London from genesis; Shanghai, Cancun and Prague are active; Osaka is not active.
- **PREVRANDAO (EIP-4399) is a constant** (`0xff...ff`) and the header `mixHash` is zero. Never use it as randomness.
- **EIP-7702** is accepted with a QoreChain rule: each authority whose delegation would take effect needs a registered PQC key and a single-use consent recorded with `MsgAuthorizeEVMDelegation` (at most 8 authorizations per transaction, no duplicate authority). The sponsor's window does not count as the authorities' consent. `MsgClearEVMDelegation` removes a delegation. See [EIP-7702 consent](/sdk/guides/evm#evm-delegation-consent).
- **Finality.** Blocks are final when committed: `latest`, `safe` and `finalized` return the same block, with no reorgs and no uncles.
- **Fees (both networks, 27 October 2026).** `eth_gasPrice` 112.5 gwei; base fee 100 gwei (the chain floor of 0.1 uqor per gas); `eth_maxPriorityFeePerGas` 12.5 gwei; header `gasLimit` 4,294,967,295. Tools that set the fee cap near twice the base fee (Foundry does) commit up to about 200 gwei per gas against the window while paying about 112.5 gwei.
- **JSON-RPC namespaces.** `eth`, `net`, `web3` and `txpool`. Every `debug_*`, `personal_*`, `admin_*` and `miner_*` method is unavailable (`-32601`), as are `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` and `eth_config`. Tools that need traces do not work against the public endpoints.
- **Different behaviour.** `eth_getProof` works but returns the chain's IAVL proofs, not Merkle-Patricia proofs. `eth_getLogs` covers at most 10,000 blocks per query. `eth_subscribe` works over WebSocket alone. `eth_accounts`, `eth_sign` and `eth_sendTransaction` are refused because the node holds no accounts: sign locally and use `eth_sendRawTransaction`. `txpool_content` is refused on the public endpoints; `txpool_status` works. `web3_clientVersion` is not a reliable way to detect the node.
- **Balances.** `eth_getBalance` returns the bank balance in uqor times 10^12 plus any sub-uqor remainder.
- **Precompiles.** Ethereum's standard precompiles answer as usual. `pqcVerify` (`0x0A01`) and `pqcKeyStatus` (`0x0A02`) are **active on testnet only**; none is active on mainnet, and activating one would need a governance decision, with no date. The testnet also lists `0x0C01` (`rlConsensusParams`). A call to an inactive precompile returns empty data rather than reverting, so read `active_static_precompiles` at `/cosmos/evm/vm/v1/params` before relying on one. See [EVM Precompiles](/developer-guide/evm-precompiles#network-status).
- **Tooling.** QoreChain is not yet in `viem/chains`: import the chains from `@qorechain/evm` (from 0.11.0). Sourcify does not list chain IDs 9800 or 9801 yet. The SVM lane is not open.

## How to use {#how-to-use}

All snippets that read use the public testnet (`qorechain-diana`, EVM chain ID 9800), need no key and send nothing. The test ERC-20 at `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` is a testnet token (symbol `WQOR`, 18 decimals); replace it and the address with your own.

### Install per language {#install}

| Language or tool | Install | Status | Minimum platform |
|---|---|---|---|
| TypeScript, EVM reads and ERC helpers | `npm install @qorechain/evm viem` (resolves to 0.8.0, which has no chain definitions or window helpers) | Live today | Node.js 20 or later; peer `viem ^2` |
| TypeScript, signing the window message | `npm install @qorechain/sdk` (0.10.0 has `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`) | Live today | Node.js 20 or later |
| TypeScript, viem chain definitions and window helpers | none yet | **Coming (0.11.0)** | Node.js 20 or later |
| Scaffolder, templates `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | Live today (0.10.0) | Node.js 20 or later |
| Scaffolder, templates `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | none yet | **Coming (0.11.0)** | Foundry and Node.js 20; Node.js 22 for Hardhat 3; Rust and Docker for `cosmwasm` |
| Python (EVM reads) | `pip install "web3>=7,<8"`; window message from `qorechain-sdk` 0.10.0 | Live today | Python 3.10 or later |
| Go (EVM reads) | `go get github.com/ethereum/go-ethereum@latest`; window message from the QoreChain Go SDK v0.10.0 | Live today | Go toolchain |
| Rust (EVM reads) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; window message from crate `qorechain-sdk` 0.10.0 | Live today | Rust stable |
| Java (EVM reads) | `org.web3j:core:5.0.0`; window message from `io.github.qorechain:qorechain-sdk:0.10.0` | Live today | JDK 21 (the QoreChain Java SDK is built with a JDK 21 toolchain) |

### Quickstart 1: read with ethers v6 (live today) {#quickstart-ethers}

No QoreChain package is needed. Run on 27 October 2026 against the testnet, it printed `chain id: 9800n`, a balance, and `token: WQOR 18n`.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

The same read in web3.py, go-ethereum, alloy and web3j is in the SDK guide `evm-quickstarts.md` (reported there as tested with web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 and web3j 5.0.0 on JDK 21; this page did not re-run those).

### Quickstart 2: read with the published `@qorechain/evm` 0.8.0 (live today) {#quickstart-evm-080}

Tested quickstart from the developer hub. It connects, auto-detects the EVM chain ID and prints the QOR balance of the public testnet faucet account.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Quickstart 3: read with the viem chain definition (from 0.11.0, coming) {#quickstart-viem}

This does not run from npm today, because 0.8.0 has no `qorechainTestnet`. Run on 27 October 2026 with the 0.11.0 chain definition loaded from the repository source (not from npm), it printed `chain id: 9800` and the token `WQOR`.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Quickstart 4: check a window and compose the opening message (from 0.11.0, coming) {#quickstart-window-helpers}

From the `@qorechain/evm` README at tag v0.11.0. It reads, then builds a message object; it does not sign or send. For an account with no window, `evmWindowStatus` returns `found: false, live: false` (checked on both networks on 27 October 2026).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Quickstart 5: open a window from TypeScript (live today, SDK 0.10.0 and later) {#quickstart-open-window}

From the SDK guide `evm-quickstarts.md`, "Before you send". This **sends a native-lane transaction**: run it only with your own funded test account, never with a shared or public phrase.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

This snippet was not re-run for this page. `maxValue: "3750000"` is 5 transactions of 3,000,000 gas at a 250 gwei fee cap.

### Quickstart 6: scaffold a project with the live scaffolder {#quickstart-scaffold-live}

Tested on 27 October 2026 in an empty directory with `npx` from the public npm registry (0.10.0, template `fullstack-web`): it scaffolded the project and the build succeeded.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### The new templates (from 0.11.0, coming) {#new-templates-usage}

Once 0.11.0 is published, the scaffolder accepts the four new template names (see the flag table below). A `foundry` project then builds and tests locally with `forge build` and `forge test` (no network), and `pnpm window status` reads the account, its PQC key and its window. `pnpm window register` and `pnpm window open` broadcast native-lane transactions from your own funded account, and `forge script ... --broadcast` deploys. Never put a real key in `.env.example`, never commit `.env`, and never fund the public BIP-39 test phrase (`abandon` repeated 11 times, then `about`).

## Main API {#main-api}

### `@qorechain/evm` (from 0.11.0) {#api-evm}

| Name | What it does |
|---|---|
| `qorechain`, `qorechainTestnet` | viem chain objects for 9801 and 9800 with public endpoints and explorer. |
| `QORECHAIN_CHAINS` | Both chains (mainnet, then testnet), for wagmi or RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | EVM chain ID to native-lane REST URL. |
| `evmWindowStatus` | Reads a window over REST: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | Parses the REST answer. |
| `openEvmWindowMessage` | Checks bounds and builds `MsgOpenEVMWindow` as `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | The bound checks alone. |
| `evmWindowCost`, `weiToUqorCeil` | Window sizing in uqor. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Explain a refusal: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Convert between `0x` and `qor1...` for the same account. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Constants. |
| `@qorechain/evm/window` | The window helpers without the viem dependency. |

`@qorechain/evm` does not sign or broadcast native-lane transactions; use `@qorechain/sdk` or the language SDKs for that.

### Building and reading a window in each SDK (live today, 0.10.0) {#api-window}

| Language | Open a window | Read a window |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`, from 0.11.0) | `fetchEvmWindow`; `evmWindowStatus` (from 0.11.0) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`NewOpenEVMWindowScoped` for `nativeOnly` or `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

EIP-7702 consent (TypeScript, `@qorechain/sdk` 0.10.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0 adds `PqcStatusBadge` (default labels "PQC key registered" and "No PQC key").

### `create-qorechain-dapp` flags {#api-scaffolder}

| Flag | What it does |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app` (live today); `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` (from 0.11.0). |
| `--network <name>` | `testnet` or `mainnet` preset. |
| `--package-manager <pm>` | `pnpm`, `npm` or `yarn`. |
| `-y, --yes` | Skip prompts and use defaults. |
| `--no-install` | Do not install dependencies. |
| `-h, --help` / `-v, --version` | Help and version. |

### Template scripts (from 0.11.0) {#api-template-scripts}

| Template | Script | What it does |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Shows the account, whether its ML-DSA-87 key is registered (and whether it is this key), and its window. |
| `foundry`, `hardhat` | `pnpm window register` | Registers the account's ML-DSA-87 key, once per account. |
| `foundry`, `hardhat` | `pnpm window open` | Opens a window (default 600 blocks, 5 transactions). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Hardhat build, tests, Ignition deploy to `qorechainTestnet`. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | Dev server on `http://localhost:5173`; production build. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Optimized build, governance upload proposal, instantiate (testnet), REST queries. |

Template environment variables (in `.env`, never committed): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK` (`testnet` or `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; `QORE_CODE_ID` and `QORE_I_KNOW_THIS_IS_MAINNET=yes` for the CosmWasm scripts (the proposal script refuses mainnet without it); `VITE_WALLETCONNECT_PROJECT_ID` for a WalletConnect wallet in `viem-wagmi`.

## How to access {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Native chain ID | `qorechain-diana` | `qorechain-vladi` |
| EVM chain ID (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | not published |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Consensus RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Explorer | `https://explore.qore.network` | `https://explore.qore.network` |

- **Reads** need nothing: no account, no key, no window.
- **Sending on the EVM lane** needs a funded account, its ML-DSA-87 key registered on chain (once) and an open window. The key registration and the window are native-lane transactions.
- **Cost.** The fee floor is 0.1 uqor per gas on both networks. Reading is free. Testnet QOR comes from the [Faucet](/dashboard/faucet).
- **CosmWasm.** No code upload without governance on either network; no instantiation on mainnet without governance. Mainnet had no stored codes on 27 October 2026.
- **Node and tool versions.** See the install table above.

## Where it is published {#where-published}

Versions read live from each registry on 27 October 2026. The GitHub tag `v0.11.0` exists (27 October 2026), and there is no GitHub release object for it yet (the latest release is v0.10.0).

| Registry | Package | Version live today | 0.11.0 status | Link |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **pending, not published** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **pending, not published** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **pending, not published** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **pending, not published** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (templates `evm-solidity`, `fullstack-web`, `rollup-app`) | **pending, not published** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (used by `viem-wagmi`) | 0.1.0 | not part of 0.11.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | not part of 0.11.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | not part of 0.11.0 | https://crates.io/crates/qorechain-sdk |
| Go proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | not part of 0.11.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | not part of 0.11.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Source: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), tag `v0.11.0`; paths `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, maintained by the QoreChain Association.

## Limits and known issues {#limits}

- **0.11.0 is not on npm yet.** Everything marked "from 0.11.0" (the viem chain definitions, the window helpers, `@qorechain/evm/window`, the four new templates, `PqcStatusBadge`) cannot be installed from a registry today. The new templates depend on `^0.11.0` packages, so even a scaffold from the repository will not install from npm until publication. This page will change when npm serves 0.11.0.
- **0.11.0 changes npm packages alone.** Python, Rust, Go and Java stay at 0.10.0, which already contain the window builders listed above.
- **`@qorechain/evm` reads the window and composes the message; it does not sign or broadcast** native-lane transactions.
- **No helper opens a window automatically before a send**, by design.
- **The QoreX wallet in the `viem-wagmi` template** answers `eth_chainId`, `eth_accounts`, `eth_requestAccounts` and `wallet_switchEthereumChain`; its EVM signing methods are not available yet. Use it to connect and read, and sign with an injected EIP-1193 wallet.
- **The templates' `pnpm window` helper derives the ML-DSA-87 key from the same secret as the EVM key.** If the account's key was registered by another wallet, open the window from that wallet instead.
- **Not available on the public endpoints:** blob transactions, tracing, and the `debug`, `personal`, `admin` and `miner` namespaces.
- **CosmWasm upload goes through governance on both networks**; the `cosmwasm` template cannot store code by itself.
- **Contributions to other tools** (viem, Sourcify, Scaffold-ETH 2) are prepared files in the repository, not merged upstream.
- **EVM precompiles on mainnet:** none is active. `pqcVerify` (`0x0A01`) and `pqcKeyStatus` (`0x0A02`) are active on testnet only.
- **Network state is dated.** Fee and block-time figures were read on 27 October 2026.

## Security notes {#security}

- The window design means the secp256k1 key held by an EVM library can never authorize spending on its own: opening a window needs a hybrid signature with the account's ML-DSA-87 key. Keep windows small (`blocks`, `maxTxs`, `maxValue`) and use `nativeOnly` or `allowedTargets` where you can.
- `maxValue` includes the maximum fee of each transaction; size it with `evmWindowCost` rather than by value alone.
- The templates read keys from `.env`, which is git-ignored; `.env.example` holds placeholders. Hardhat users can store the key encrypted with `npx hardhat keystore set PRIVATE_KEY`.
- Never fund the public BIP-39 test phrase (`abandon` repeated 11 times, then `about`).
- For a mainnet CosmWasm proposal, publish the source and a reproducible build (the optimizer prints the checksum) so voters can verify the binary.
- Report vulnerabilities privately to security@qore.network.

## Related pages {#related}

- [Developer packages overview](/developer-tools/overview) and [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) (the live `create-qorechain-dapp` 0.10.0)
- [SDK overview](/sdk/overview), [SDK install](/sdk/install) and the [EVM guide](/sdk/guides/evm) (window, scoped windows, EIP-7702 consent, precompiles)
- [EVM development](/developer-guide/evm-development) and [EVM Precompiles](/developer-guide/evm-precompiles#network-status)
- [QoreChain Native development](/developer-guide/cosmwasm-development) (CosmWasm and governance proposals)
- [QoreX integrations](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (hybrid signing on the native lane)
- [QoreScan](/developer-tools/qorescan) (inventory of `ecrecover` and PQC precompile use in Solidity sources)
