---
slug: /sdk/examples
title: Examples
sidebar_label: Examples
sidebar_position: 7
---

# Examples

Seven runnable TypeScript examples live in the
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
directory of the SDK monorepo. Each folder is a self-contained workspace package
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

Create a client and read public chain state — a native bank balance and the
aggregate tokenomics snapshot. Needs a reachable node.

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
const overview = await client.qor.getTokenomicsOverview();
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Derive a native (`qor1...`) account from a mnemonic and broadcast a QOR
transfer: derive → sign → simulate → estimate fee → `bankSend`. Needs a
reachable consensus RPC plus REST and a funded account.

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
offline; sending needs a reachable SVM JSON-RPC and a funded account.

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Use `@qorechain/evm` (a thin layer over viem) to call read-only QoreChain
precompiles and read an ERC-20 balance. The EVM chain id is auto-detected via
`eth_chainId`. On a node without the precompiles, those calls throw "feature not
present", reported per-call.

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
  fee: { amount: [{ denom: "uqor", amount: "5000" }], gas: "200000" },
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  includePqcPublicKey: true, // embed the key for auto-registration on first use
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
(`client.qor`), served over the EVM JSON-RPC endpoint. The three reads are
independent, so each is reported even if the others are unavailable.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)
