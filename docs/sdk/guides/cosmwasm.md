---
slug: /sdk/guides/cosmwasm
title: QoreChain Native Guide
sidebar_label: QoreChain Native
sidebar_position: 3
---

# QoreChain Native guide

QoreChain Native is QoreChain's name for its CosmWasm smart-contract runtime, so the CosmWasm libraries and client packages named on this page are the ones you use with it.

The TypeScript core (`@qorechain/sdk`) includes thin, typed wrappers over
`@cosmjs/cosmwasm-stargate` for querying and executing QoreChain Native contracts. Reads
use a read-only client; state changes use a signing client.

## Read-only queries

Open a read-only QoreChain Native client from your `createClient()` instance — it
connects over the consensus RPC endpoint and is memoized on the client.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc-testnet.qore.host" }, // mainnet: https://rpc.qore.host
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

You can also construct a read client directly with `createCosmWasmClient`.

## Signing: instantiate, execute, upload

:::caution Upload and instantiate are permissioned
On `qorechain-vladi` (mainnet) `code_upload_access` and
`instantiate_default_permission` are `Nobody`, and `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` are also switched off by the
chain's circuit breaker, so `uploadCode` and `instantiate` are refused for
ordinary accounts. On `qorechain-diana` (testnet, checked 27 October 2026)
`code_upload_access` is `Nobody` and only `MsgStoreCode` is switched off, while
`instantiate_default_permission` is `Everybody`, so `instantiate` is open there for
code that already exists. Contracts that already exist can be queried (above) and
executed. Check `GET /cosmwasm/wasm/v1/codes/params` for the current permissions.
See [QoreChain Native Development](/developer-guide/cosmwasm-development).
:::

:::caution The QoreChain Native signing client signs classically
`connectCosmWasmSigner` wraps the CosmJS signing client, which attaches only the
classical secp256k1 signature. The live networks require the hybrid
(secp256k1 + ML-DSA-87) signature on every Native-path transaction, so a
transaction sent through it is refused there; it works against a node that does
not require the hybrid extension (a local dev node). For `execute` on a live
network, build the message and send it with `signAndBroadcastHybrid` (sample
below).
:::

For state changes against a node that accepts classical signatures, connect a
signing client with `connectCosmWasmSigner` (it takes an offline signer, the same
kind produced by `directSignerFromPrivateKey`), then use the typed wrappers. The
helpers return `Promise<unknown>` unless you give the result type:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode<{ codeId: number }>(
  signingCw, sender, wasmBytes, "auto",
);

// Instantiate a contract from a code id (the last argument is InstantiateOpts).
const { contractAddress } = await instantiate<{ contractAddress: string }>(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  { fee: "auto" },
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  "auto",
);
```

The exact argument shapes follow `@cosmjs/cosmwasm-stargate`; the SDK adds typed
`ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient`, and
`CosmWasmSigningClient` types.

### Executing on a live network (hybrid)

Add the QoreChain Native message types to a registry and send the `MsgExecuteContract`
through the hybrid builder. The account's ML-DSA-87 key must be registered first
(see [Hybrid signing](/sdk/guides/quantum-safe)). Needs
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`:

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  qorechainRegistryTypes,
  signAndBroadcastHybrid,
  derivePqcCanonical,
} from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(sender);

// Never hardcode gas for a contract call: simulate it, then add at least 30%.
// The simulation already includes the cost of loading the contract code and a
// congestion margin (see "Gas for contract calls" below).
const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc.qore.host",
  signer,
);
const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(JSON.stringify({ /* execute msg */ })),
      funds: [],
    }),
  },
];
const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
const gasPrice = 0.15; // uqor per unit of gas; the network floor is 0.1

const result = await signAndBroadcastHybrid({
  registry,
  signer,                                            // from directSignerFromPrivateKey
  pqcKeypair: derivePqcCanonical(sender, mnemonic),  // the key registered on-chain
  messages: msgs,
  fee: {
    amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
    gas: String(gas),
  },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

### Gas for contract calls {#gas}

**Do not hardcode gas for a contract call.** A fixed 400,000 is enough for a
simple transfer on one call and runs out on the next. From release v3.2.8
(testnet only until a later mainnet upgrade) CosmWasm gas is repriced:

- **The first call of a contract code in a block pays a load cost.** A cw20
  transfer costs about 533,000 gas as the first call of its code in a block and
  about 84,000 for each repeat. Governance can pin popular codes, and pinned
  codes skip the load charge.
- **Fees rise with congestion.** A congestion factor scales contract gas from
  1x up to 20x by default when blocks are busy with contract calls, and a block
  has a limited contract-execution budget that one transaction can use at most
  half of.
- **Simulation includes both.** A simulation always charges the cold load and
  adds a margin for congestion, so `simulated gas x 1.3` is a safe limit. Use
  `fee: "auto"` where your client offers it (CosmJS `"auto"`, the SDK
  `TxClient`, the React `useTx` hook), and simulate yourself when you build the
  fee by hand as above.
- **Stay below the transaction cap.** A Cosmos transaction may not set a gas limit
  above 50,000,000 and is refused before its fee is charged.

The same applies to instantiate, migrate and every other message that runs
contract code.

See the `cosmwasm-query` [example](/sdk/examples) for a runnable read example.
