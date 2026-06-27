---
slug: /sdk/guides/cosmwasm
title: Guía de CosmWasm
sidebar_label: CosmWasm
sidebar_position: 3
---

# Guía de CosmWasm

El núcleo de TypeScript (`@qorechain/sdk`) incluye envoltorios finos y tipados
sobre `@cosmjs/cosmwasm-stargate` para consultar y ejecutar contratos CosmWasm.
Las lecturas usan un cliente de solo lectura; los cambios de estado usan un cliente
de firma.

## Consultas de solo lectura

Abre un cliente CosmWasm de solo lectura desde tu instancia de `createClient()`: se
conecta a través del endpoint RPC de consenso y se memoriza en el cliente.

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

También puedes construir un cliente de lectura directamente con
`createCosmWasmClient`.

## Firma: instanciar, ejecutar, subir

Para los cambios de estado, conecta un cliente de firma con
`connectCosmWasmSigner` (recibe un firmante sin conexión, del mismo tipo que
produce `directSignerFromPrivateKey`) y luego usa los envoltorios tipados:

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

Las formas exactas de los argumentos siguen a `@cosmjs/cosmwasm-stargate`; el SDK
añade los tipos `ContractMsg`, `FeeInput`, `InstantiateOpts`,
`CosmWasmReadClient` y `CosmWasmSigningClient`.

Consulta el [ejemplo](/sdk/examples) `cosmwasm-query` para ver un ejemplo de
lectura ejecutable.
