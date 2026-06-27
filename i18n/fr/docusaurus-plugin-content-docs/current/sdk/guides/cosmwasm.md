---
slug: /sdk/guides/cosmwasm
title: Guide CosmWasm
sidebar_label: CosmWasm
sidebar_position: 3
---

# Guide CosmWasm

Le cœur TypeScript (`@qorechain/sdk`) inclut de fins wrappers typés au-dessus de
`@cosmjs/cosmwasm-stargate` pour interroger et exécuter des contrats CosmWasm. Les lectures
utilisent un client en lecture seule ; les changements d'état utilisent un client de signature.

## Requêtes en lecture seule

Ouvrez un client CosmWasm en lecture seule à partir de votre instance `createClient()` — il
se connecte via le point de terminaison RPC de consensus et est mémorisé sur le client.

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

Vous pouvez également construire un client de lecture directement avec `createCosmWasmClient`.

## Signature : instancier, exécuter, téléverser

Pour les changements d'état, connectez un client de signature avec `connectCosmWasmSigner` (il
prend un signataire hors ligne, du même type que celui produit par
`directSignerFromPrivateKey`), puis utilisez les wrappers typés :

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

Les formes exactes des arguments suivent `@cosmjs/cosmwasm-stargate` ; le SDK ajoute les types
typés `ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient` et
`CosmWasmSigningClient`.

Voir l'[exemple](/sdk/examples) `cosmwasm-query` pour un exemple de lecture exécutable.
