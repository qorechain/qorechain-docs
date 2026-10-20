---
slug: /sdk/examples
title: Examples
sidebar_label: Examples
sidebar_position: 7
---

# Examples

The runnable TypeScript examples live in the
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
directory of the SDK monorepo — the ones below plus `ai-preflight`,
`cross-vm-call`, `react-dapp`, `register-sidechain`, `rollup-lifecycle`,
`amm-swap`, `connect-keplr`, `evm-nft`, and `subscribe-blocks`. Each folder is
a self-contained workspace package
with its own `README.md`, `.env.example`, and a single `index.ts`. They read
endpoints and mnemonics from environment variables with sane localhost defaults,
and the network-dependent ones fail gracefully with a hint when no node is
reachable.

From the repo root, install once, then run any example:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Use only test mnemonics or generated keys. Never commit real secrets.

The snippets below are condensed from each example's `index.ts`. See the linked
source for the full, runnable program.

## connect-and-query

Create a client and read public chain state — a native bank balance and a
tokenomics snapshot. Needs a reachable node. The repository example reads the
snapshot through `client.qor`, a `qor_` JSON-RPC call that the public endpoints do
not serve; the snippet below uses the REST equivalent (the burn statistics), which
works on mainnet and testnet.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    rest: process.env.QORE_REST_URL ?? "http://localhost:1317",
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const balances = await client.rest.getAllBalances(address);
const burn = await client.rest.getBurnStats(); // GET /qorechain/burn/v1/stats
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Derive a native (`qor1...`) account from a mnemonic and broadcast a QOR
transfer: derive → sign → simulate → estimate fee → `bankSend`. Needs a
reachable consensus RPC plus REST and a funded account. This example signs with
the **classical** signature only, so it works against a local or dev node but is
refused by mainnet and testnet, which require the hybrid signature on every
Native-path transaction. For the public networks connect with the account's
keypair, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0), as in the
[Quickstart](/sdk/quickstart#send-qor).

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, prefix);

const amount = [{ denom: baseDenom, amount: toBase("1.5") }]; // "1500000" uqor

const tx = await client.connectTx(signer);
const gasEstimate = await tx.simulate(messages);
const fee = await client.fees.estimate("normal");
const result = await tx.bankSend(recipient, amount, { fee });
console.log(result.transactionHash);
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Build a SOL transfer with a memo instruction on QoreChain's Solana-compatible
(SVM) runtime, using `@qorechain/svm`. Builds and prints the transaction
offline. Sending needs a reachable SVM JSON-RPC and a funded account, and cannot
succeed on the public networks: SVM transaction submission is disabled
network-wide and the public SVM endpoints are read-only (see
[SVM Development](/developer-guide/svm-development)).

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const to = new PublicKey(recipient); // `to` is a PublicKey, not a string
const tx = client.buildTransferSol({ from: keypair, to, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Use `@qorechain/evm` (a thin layer over viem) to call read-only QoreChain
precompiles and read an ERC-20 balance. The EVM chain id is auto-detected via
`eth_chainId`. The precompiles are not yet active on mainnet or testnet (see
[Network status](/developer-guide/evm-precompiles#network-status)); until they
are, and on a node without them, those calls throw "feature not present",
reported per-call.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Post-quantum signing with ML-DSA-87 (Dilithium-5, FIPS 204). **Runs fully
offline — no node required.** Part 1 signs and verifies a message (with a tamper
check); part 2 builds a hybrid transaction carrying both a classical secp256k1
signature and an ML-DSA-87 signature as a `PQCHybridSignature` extension, then
verifies the PQC half locally.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  buildHybridTx,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("QoreChain is quantum-safe");
const signature = pqcSign(keypair.secretKey, message);
const valid = pqcVerify(keypair.publicKey, message, signature);

const built = await buildHybridTx({
  registry,
  signer,
  pqcKeypair,
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // network floor: 0.1 uqor per gas
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  signBytesVersion: "v2", // explicit, so this offline example needs no node
  includePqcPublicKey: true, // embeds the key in the extension (registration is a separate, explicit step)
});
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Run a read-only smart query against a deployed CosmWasm contract. Needs a
reachable consensus RPC and a deployed contract address.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: process.env.QORE_RPC_URL ?? "http://localhost:26657" },
});

const cw = await client.cosmwasm(); // read-only, memoized on the client
const info = await getContractInfo(cw, contract);
const result = await queryContractSmart(cw, contract, { token_info: {} });
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Read tokenomics state through the typed `qor_*` JSON-RPC namespace
(`client.qor`) over the EVM JSON-RPC endpoint. The three reads are independent,
so each is reported even if the others are unavailable. No released node build
serves the `qor_` namespace yet, so today each read fails with `-32601` (see
[the `qor_` namespace](/api-reference/json-rpc-qor_-namespace)).

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition (xQORE has no query service yet)
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)

## unified-wallet

Derive a **unified eth-native account** (SDK 0.6.0): one `eth_secp256k1` key
rendered as all three QoreChain addresses with one shared balance, plus the
address-bound ML-DSA-87 keypair. Runs fully offline.

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  unifiedAccountFromSeed,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
console.log(account.cosmos); // "qor1…"  — Native lane
console.log(account.evm);    // "0x…"    — EVM lane
console.log(account.svm);    // base58   — SVM lane (same 20 bytes)

// Decode any one encoding into all three.
const all = qoreAddresses({ evm: account.evm });

// Or derive from a raw 32-byte seed instead of a mnemonic.
const fromSeed = unifiedAccountFromSeed(seed32);
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Build a relayer-submitted `MsgExecuteCosmos` on the Native authenticator lane
(SDK 0.7.0, chain v3.1.85; the `abstractaccount` module is switched off on both
networks today, so this lane cannot be used there yet): a Phantom-style ed25519 key signs the
domain-separated auth digest, and the resulting message is ready for a relayer
to broadcast (the relayer pays fees; the external key never produces an ML-DSA
co-signature). Dry run — no node required.

```ts
import {
  buildPhantomExecuteCosmos,
  cosmosAuthSignBytes,
  qorechainRegistry,
} from "@qorechain/sdk";

// Show the exact 32-byte digest the wallet signs (byte-exact vs the chain).
const digest = cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce });

// Build the relayer-ready message: the Phantom wallet signs the digest.
const msg = await buildPhantomExecuteCosmos({
  wallet,                 // window.solana in a browser
  relayer,                // submits + pays fees (a DIFFERENT account)
  chainId,
  account,                // the canonical PQC-required owner
  to,
  amount: "100uqor",
  nonce,                  // the per-authenticator sequence
});

// Prove it encodes via the default registry (what the relayer broadcasts).
const bytes = qorechainRegistry().encode(msg);
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· Full walkthrough:
[Authenticators & delegated spending](/sdk/guides/authenticators)
