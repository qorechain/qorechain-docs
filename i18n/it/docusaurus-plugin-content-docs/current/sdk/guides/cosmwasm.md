---
slug: /sdk/guides/cosmwasm
title: Guida a CosmWasm
sidebar_label: CosmWasm
sidebar_position: 3
---

# Guida a CosmWasm

Il core TypeScript (`@qorechain/sdk`) include wrapper sottili e tipizzati sopra
`@cosmjs/cosmwasm-stargate` per interrogare ed eseguire contratti CosmWasm. Le letture
usano un client in sola lettura; le modifiche allo stato usano un client di firma.

## Query in sola lettura

Apri un client CosmWasm in sola lettura dalla tua istanza `createClient()` — si
connette tramite l'endpoint RPC di consenso ed è memoizzato sul client.

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

Puoi anche costruire un client di lettura direttamente con `createCosmWasmClient`.

## Firma: instantiate, execute, upload

Per le modifiche allo stato, connetti un client di firma con `connectCosmWasmSigner` (che
accetta un offline signer, lo stesso tipo prodotto da
`directSignerFromPrivateKey`), poi usa i wrapper tipizzati:

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

Le esatte forme degli argomenti seguono `@cosmjs/cosmwasm-stargate`; l'SDK aggiunge i tipi
tipizzati `ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient` e
`CosmWasmSigningClient`.

Consulta l'[esempio](/sdk/examples) `cosmwasm-query` per un esempio di lettura eseguibile.
