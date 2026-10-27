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

## EVM authorization window (since chain v3.2.0) {#evm-window}

Since chain version **v3.2.0** (mainnet from block 2,981,742, testnet from block
5,920,000) the EVM lane admits a transaction only from an account that has a
**registered ML-DSA-87 key** and an **open authorization window**. Reads
(`eth_call`, balances, receipts) and gas estimation work without one, and wallets
and libraries such as MetaMask, viem, ethers, Hardhat and Foundry sign as before;
what changes is that the post-quantum authorization travels *ahead* of the
transaction, as a hybrid-signed Native-lane message. The chain-level rules, the
bounds, the CLI forms and the refusal codes are in
[EVM authorisation window](/getting-started/first-transaction#evm-window).

With SDK **0.8.2 or later** you can open a window from code (**0.9.0** adds the
scope options below). Registering the key
(once) is described in [Hybrid signing](/sdk/guides/quantum-safe); the example
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

### Scope a window (since chain v3.2.3, SDK 0.9.0) {#evm-window-scope}

A window can be narrowed when it is opened: `nativeOnly` admits plain transfers of
native QOR only (no calldata, no contract creation, no recipient that carries code,
no EIP-7702 authorisation), and `allowedTargets` admits only transactions whose
recipient is one of up to 16 listed `0x` addresses (no duplicates; contract creation
is refused). Both are new message fields: a node below v3.2.3 refuses the whole
transaction when either is set, so set them only on a network that has applied
v3.2.3 (both public networks have). `fetchEvmWindow` reads both back (`nativeOnly`,
`allowedTargets`; they read `false` and empty before v3.2.3). For a window opened
only to send QOR, prefer `nativeOnly`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on-chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "1000000000", // uqor: value PLUS the maximum fee of each transaction
      nativeOnly: true,
      // or: allowedTargets: ["0x…", "0x…"],
    }),
  ],
  "auto",
);
```

### EIP-7702 consent (since chain v3.2.2, SDK 0.9.0) {#evm-delegation-consent}

A type-4 (EIP-7702) transaction is admitted only after every account whose
authorisation takes effect has given a post-quantum consent to exactly that
delegate, with a hybrid-signed `MsgAuthorizeEVMDelegation`. The consent is used up
by the transaction that installs the delegation and expires after the `blocks` you
set (1 to 17,280); the zero address as the delegate consents to clearing. The SDK
builds the messages and reads the consent back, including the nonce the
authorisation tuple must carry:

```ts
import {
  authorizeEvmDelegationMsg,
  clearEvmDelegationMsg,
  fetchEvmDelegationConsent,
  evmDelegationTupleNonce,
} from "@qorechain/sdk";

// 1) Consent to one delegate (hybrid-signed Native-lane message, `tx` as above).
await tx.signAndBroadcast(
  [authorizeEvmDelegationMsg({ sender: account.address, delegate: "0xDelegate…", blocks: 600 })],
  "auto",
);

// 2) Read the consent: the tuple's nonce is the account's EVM nonce for a
//    sponsored transaction, and that nonce + 1 when the account sends it itself.
const consent = await fetchEvmDelegationConsent({ rest: "https://api.qore.host", address: account.address });
const tupleNonce = evmDelegationTupleNonce(consent, /* sponsored */ true);

// 3) Sign the authorisation tuple with `tupleNonce` and send the type-4
//    transaction (the sender still needs an open window; a sponsor pays from its own).

// Remove an installed delegation directly, without any EVM transaction:
// await tx.signAndBroadcast([clearEvmDelegationMsg(account.address)], "auto");
```

`classifyEvmDelegationRejection(err)` returns `"no-consent"` or `"invalid"` when the
EVM lane refuses a delegation. The consent query needs chain v3.2.2 or later. The
chain-level rules are in
[EIP-7702 delegations](/architecture/post-quantum-security#eip-7702); the CLI forms
are `qorechaind tx pqc authorize-evm-delegation` and `clear-evm-delegation`.

Releases before 0.9.0 build only the unscoped window (an unscoped window still
works on both networks) and have no consent builders; use the CLI forms in
[EVM authorisation window](/getting-started/first-transaction#evm-window) there.

## Precompiles

QoreChain defines contract-callable precompiles at fixed addresses. The
`precompiles` namespace provides typed bindings, and the addresses and ABIs are
exported.

> **Not active on mainnet; three on the testnet.** The QoreChain precompiles are
> compiled into the node but none is activated on mainnet (`qorechain-vladi`).
> On the testnet (`qorechain-diana`) the `active_static_precompiles` list holds
> `0x…0A01` (PQC verify), `0x…0A02` (PQC key status) and `0x…0C01` (consensus
> params), checked 27 October 2026; the AI pair (`0x…0B01`, `0x…0B02`) and the
> cross-VM bridge (`0x…0901`) are not active on either network. A call to an
> inactive address returns empty data, so those helpers throw. See
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

// Read consensus parameters (0x…0C01 is active on the testnet, not on mainnet).
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

> Where a precompile is not active (mainnet: all of them; testnet: the AI pair and
> the cross-VM bridge), or on a node
> without the QoreChain precompiles, these calls throw a "feature not present"
> error. Handle that per-call.

See the `evm-precompile` [example](/sdk/examples) for a runnable version.
