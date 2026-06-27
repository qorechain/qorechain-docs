---
slug: /sdk/guides/cosmwasm
title: Ghid CosmWasm
sidebar_label: CosmWasm
sidebar_position: 3
---

# Ghid CosmWasm

Nucleul TypeScript (`@qorechain/sdk`) include învelișuri subțiri, tipizate, peste
`@cosmjs/cosmwasm-stargate` pentru interogarea și execuția contractelor CosmWasm.
Citirile folosesc un client doar de citire; modificările de stare folosesc un
client de semnare.

## Interogări doar de citire

Deschide un client CosmWasm doar de citire din instanța ta `createClient()` — se
conectează prin endpoint-ul RPC de consens și este memoizat pe client.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc.testnet.example" },
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

De asemenea, poți construi un client de citire direct cu `createCosmWasmClient`.

## Semnare: instanțiere, execuție, încărcare

Pentru modificările de stare, conectează un client de semnare cu
`connectCosmWasmSigner` (acesta preia un signer offline, de același tip cu cel
produs de `directSignerFromPrivateKey`), apoi folosește învelișurile tipizate:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode(signingCw, sender, wasmBytes, fee);

// Instantiate a contract from a code id.
const { contractAddress } = await instantiate(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  fee,
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  fee,
);
```

Formele exacte ale argumentelor urmează `@cosmjs/cosmwasm-stargate`; SDK-ul adaugă
tipurile tipizate `ContractMsg`, `FeeInput`, `InstantiateOpts`,
`CosmWasmReadClient` și `CosmWasmSigningClient`.

Vezi [exemplul](/sdk/examples) `cosmwasm-query` pentru un exemplu de citire
executabil.
