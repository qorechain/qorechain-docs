---
slug: /sdk/guides/evm
title: EVM Guide
sidebar_label: EVM
sidebar_position: 1
---

# EVM guide

`@qorechain/evm` is a thin, type-safe adapter over [viem](https://viem.sh) for
the QoreChain EVM Engine. It does not reimplement an EVM client — viem is a peer
dependency. It adds a chain-aware client factory (with EVM chain-id
auto-detection), ERC-20 helpers, contract deploy/call wrappers, and typed
bindings for QoreChain's EVM precompiles.

```bash
npm i @qorechain/evm viem
```

## Create a client

`createEvmClient` returns a client bundle backed by viem. It auto-detects the
EVM chain id via `eth_chainId` unless you pass `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

You can also pass `rpcUrl` directly (mutually exclusive with `endpoints`), a
`wsUrl` / `endpoints.evmWs` for WebSocket (`wss://evm-ws-testnet.qore.host` on the
testnet), an explicit `chainId`, and `decimals`
(defaults to 18, the EVM convention for QOR — distinct from the Cosmos `uqor`
base of 10^6).

Derive an EVM signing account from a private key:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20 helpers

The `erc20` namespace (and the individual functions) wrap standard ERC-20 calls.
Reads take a viem public client; writes take a wallet client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

The raw ABI is exported as `ERC20_ABI` if you prefer to call viem directly.

## Contracts

Generic deploy and call wrappers:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## EVM authorization window (chain v3.2.0) {#evm-window}

Since chain version **v3.2.0** (mainnet from block 2,981,742, testnet from block
5,920,000) the EVM lane admits a transaction only from an account that has a
**registered ML-DSA-87 key** and an **open authorization window**. Reads
(`eth_call`, balances, receipts) and gas estimation work without one, and wallets
and libraries such as MetaMask, viem, ethers, Hardhat and Foundry sign as before;
what changes is that the post-quantum authorization travels *ahead* of the
transaction, as a hybrid-signed Native-lane message. The chain-level rules, the
bounds, the CLI forms and the refusal codes are in
[EVM authorisation window](/getting-started/first-transaction#evm-window).

With SDK **0.8.2 or later** you can open a window from code. Registering the key
(once) is described in [Quantum-safe](/sdk/guides/quantum-safe); the example
below then opens a window for a unified eth-native account (`npm i
@cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  openEvmWindowMsg,
  fetchEvmWindow,
  classifyEvmWindowRejection,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account, { rest: REST }); // hybrid: the window needs the ML-DSA key

const { account: base } = await client.rest.get<{
  account: { account_number: string; sequence: string };
}>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);

const open = openEvmWindowMsg({
  sender: account.cosmos,
  blocks: 7200,         // 1 … 17,280 blocks (a block count, not a duration)
  maxTxs: 20,           // 1 … 1,000 transactions
  maxValue: "1000000000", // uqor: transferred value PLUS the maximum fee of each transaction
});

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-vladi",
  accountNumber: BigInt(base.account_number),
  sequence: BigInt(base.sequence),
  messages: [open],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
});

const w = await fetchEvmWindow({ rest: REST, address: account.cosmos });
console.log(w.live); // true while the window admits at least one more transaction
```

Opening a window advances the account's nonce (one identity: the Cosmos sequence
is the EVM nonce), so read the EVM nonce **after** the window is open and sign the
EVM transaction then. `maxValue` bounds value **plus** the maximum fee (gas limit
times fee cap) of each transaction: a 1,000 uqor transfer with 21,000 gas at
112.5 gwei consumes 3,363 uqor of the window. Open a window only when the user
asks for it; never open one automatically.

When the EVM lane refuses a transaction, `classifyEvmWindowRejection(err)` tells
you why:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` builds the matching close message, and `MAX_EVM_WINDOW_BLOCKS`
and `MAX_EVM_WINDOW_TXS` export the bounds.

## Precompiles

QoreChain defines contract-callable precompiles at fixed addresses. The
`precompiles` namespace provides typed bindings, and the addresses and ABIs are
exported.

> **Not active yet.** The QoreChain precompiles are compiled into the node but
> not yet activated on mainnet (`qorechain-vladi`) or testnet
> (`qorechain-diana`): a call returns empty data, so these helpers throw on the
> public networks today as well. See
> [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).

| Precompile | Function | Address |
| --- | --- | --- |
| Cross-VM Bridge | (bridge routing) | `0x0000000000000000000000000000000000000901` |
| PQC verify | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| PQC key status | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| QCAI risk score | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| QCAI anomaly check | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Consensus params | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read consensus parameters (once 0x…0C01 is active).
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers: raw calldata for the risk score, an args object for the anomaly check.
const score = await precompiles.aiRiskScore(client.publicClient, "0xa9059cbb...");
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, {
  sender: account,
  amount: 1_000_000_000_000_000_000n, // 1 QOR in wei
});

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

The precompile ABIs are exported as `IQORE_PQC_ABI`, `IQORE_AI_ABI`, and
`IQORE_CONSENSUS_ABI`.

> Where a precompile is not active (today: every public network), or on a node
> without the QoreChain precompiles, these calls throw a "feature not present"
> error. Handle that per-call.

See the `evm-precompile` [example](/sdk/examples) for a runnable version.
