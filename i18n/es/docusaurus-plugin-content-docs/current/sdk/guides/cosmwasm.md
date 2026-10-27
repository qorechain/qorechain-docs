---
slug: /sdk/guides/cosmwasm
title: Guía de QoreChain Native
sidebar_label: QoreChain Native
sidebar_position: 3
---

# Guía de QoreChain Native

QoreChain Native es el nombre que da QoreChain a su runtime de contratos inteligentes CosmWasm, así que las bibliotecas CosmWasm y los paquetes de cliente que se nombran en esta página son los que usas con él.

El núcleo de TypeScript (`@qorechain/sdk`) incluye envoltorios finos y tipados
sobre `@cosmjs/cosmwasm-stargate` para consultar y ejecutar contratos QoreChain Native.
Las lecturas usan un cliente de solo lectura; los cambios de estado usan un cliente
de firma.

## Consultas de solo lectura

Abre un cliente QoreChain Native de solo lectura desde tu instancia de `createClient()`: se
conecta a través del endpoint RPC de consenso y se memoriza en el cliente.

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

También puedes construir un cliente de lectura directamente con
`createCosmWasmClient`.

## Firma: instanciar, ejecutar, subir

:::caution Subir e instanciar requieren permiso
En `qorechain-vladi` (mainnet), `code_upload_access` e
`instantiate_default_permission` están en `Nobody`, y `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` además están desactivados por
el cortacircuitos (circuit breaker) de la cadena, por lo que `uploadCode` e
`instantiate` se rechazan para las cuentas normales. En `qorechain-diana` (testnet,
comprobado el 27 de octubre de 2026), `code_upload_access` está en `Nobody` y solo
`MsgStoreCode` está desactivado, mientras que `instantiate_default_permission` está
en `Everybody`, por lo que `instantiate` está abierto allí para código que ya existe.
Los contratos que ya existen se pueden consultar (arriba) y ejecutar. Consulta `GET /cosmwasm/wasm/v1/codes/params`
para ver los permisos actuales. Consulta
[Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development).
:::

:::caution El cliente de firma de QoreChain Native firma de forma clásica
`connectCosmWasmSigner` envuelve el cliente de firma de CosmJS, que solo adjunta la
firma clásica secp256k1. Las redes en vivo exigen la firma híbrida
(secp256k1 + ML-DSA-87) en cada transacción de la ruta nativa (Native), así que una
transacción enviada a través de él se rechaza allí; funciona contra un nodo que no
exige la extensión híbrida (un nodo de desarrollo local). Para `execute` en una red
en vivo, construye el mensaje y envíalo con `signAndBroadcastHybrid` (ejemplo más
abajo).
:::

Para los cambios de estado contra un nodo que acepta firmas clásicas, conecta un
cliente de firma con `connectCosmWasmSigner` (recibe un firmante sin conexión, del
mismo tipo que produce `directSignerFromPrivateKey`) y luego usa los envoltorios
tipados. Los auxiliares devuelven `Promise<unknown>` salvo que indiques el tipo del
resultado:

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

Las formas exactas de los argumentos siguen a `@cosmjs/cosmwasm-stargate`; el SDK
añade los tipos `ContractMsg`, `FeeInput`, `InstantiateOpts`,
`CosmWasmReadClient` y `CosmWasmSigningClient`.

### Ejecutar en una red en vivo (híbrido)

Añade los tipos de mensaje de QoreChain Native a un registro y envía el
`MsgExecuteContract` a través del constructor híbrido. La clave ML-DSA-87 de la
cuenta debe estar registrada antes (consulta [Firma híbrida](/sdk/guides/quantum-safe)).
Requiere
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

Consulta el [ejemplo](/sdk/examples) `cosmwasm-query` para ver un ejemplo de
lectura ejecutable.
