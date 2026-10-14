---
slug: /sdk/guides/cosmwasm
title: CosmWasm Guide
sidebar_label: CosmWasm
sidebar_position: 3
---

# CosmWasm guide

The TypeScript core (`@qorechain/sdk`) includes thin, typed wrappers over
`@cosmjs/cosmwasm-stargate` for querying and executing CosmWasm contracts. Reads
use a read-only client; state changes use a signing client.

## Read-only queries

Open a read-only CosmWasm client from your `createClient()` instance — it
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
`code_upload_access` and `instantiate_default_permission` are `Nobody` on
`qorechain-vladi` and `qorechain-diana`, and `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` are also switched off by the
chain's circuit breaker, so `uploadCode` and `instantiate` are refused for
ordinary accounts. Contracts that already exist can be queried (above) and
executed. Check `GET /cosmwasm/wasm/v1/codes/params` for the current permissions.
See [CosmWasm Development](/developer-guide/cosmwasm-development).
:::

:::caution The CosmWasm signing client signs classically
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

Add the CosmWasm message types to a registry and send the `MsgExecuteContract`
through the hybrid builder. The account's ML-DSA-87 key must be registered first
(see [Quantum-safe](/sdk/guides/quantum-safe)). Needs
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`:

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  qorechainRegistryTypes,
  signAndBroadcastHybrid,
  derivePqcCanonical,
} from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(sender);

const result = await signAndBroadcastHybrid({
  registry,
  signer,                                            // from directSignerFromPrivateKey
  pqcKeypair: derivePqcCanonical(sender, mnemonic),  // the key registered on-chain
  messages: [
    {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender,
        contract: contractAddress,
        msg: new TextEncoder().encode(JSON.stringify({ /* execute msg */ })),
        funds: [],
      }),
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

See the `cosmwasm-query` [example](/sdk/examples) for a runnable read example.
