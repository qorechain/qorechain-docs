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

### Gas para llamadas a contratos {#gas}

**No fijes el gas de una llamada a un contrato.** Un valor fijo de 400,000 basta
para una transferencia simple en una llamada y se agota en la siguiente. Desde
la versión v3.2.8 (solo testnet hasta una actualización posterior de mainnet)
el gas de CosmWasm se reajusta:

- **La primera llamada de un código de contrato en un bloque paga un coste de
  carga.** Una transferencia cw20 cuesta unos 533,000 de gas como primera
  llamada de su código en un bloque y unos 84,000 en cada repetición. La
  gobernanza puede fijar (pin) los códigos populares, y los códigos fijados
  se saltan el cargo de carga.
- **Las comisiones suben con la congestión.** Un factor de congestión escala
  el gas de contratos de 1x hasta 20x por defecto cuando los bloques están
  ocupados con llamadas a contratos, y un bloque tiene un presupuesto limitado
  de ejecución de contratos del que una transacción puede usar como máximo la
  mitad.
- **La simulación incluye ambos.** Una simulación siempre cobra la carga en
  frío y añade un margen para la congestión, así que `gas simulado x 1.3` es un
  límite seguro. Usa `fee: "auto"` donde tu cliente lo ofrezca (`"auto"` de
  CosmJS, el `TxClient` del SDK, el hook `useTx` de React), y simula tú mismo
  cuando construyas la comisión a mano como arriba.
- **Mantente por debajo del tope de transacción.** Una transacción de Cosmos no
  puede fijar un límite de gas superior a 50,000,000 y se rechaza antes de
  cobrar su comisión. El SDK 0.14.0 rechaza ese límite antes de firmar (y una
  transacción EVM por encima de 30,000,000), da a las transacciones de CosmWasm y
  cross-VM al menos 1.3 veces el gas simulado y nunca recurre a un límite de gas
  fijo para ellas. También tiene ayudantes opcionales que leen el precio mínimo
  del gas de la red; el precio de gas por defecto no cambia.

Lo mismo se aplica a instantiate, migrate y a cualquier otro mensaje que
ejecute código de contrato.

Consulta el [ejemplo](/sdk/examples) `cosmwasm-query` para ver un ejemplo de
lectura ejecutable.
