---
slug: /sdk/guides/cosmwasm
title: CosmWasm-Leitfaden
sidebar_label: CosmWasm
sidebar_position: 3
---

# CosmWasm-Leitfaden

Der TypeScript-Core (`@qorechain/sdk`) enthält dünne, typisierte Wrapper über
`@cosmjs/cosmwasm-stargate` zum Abfragen und Ausführen von CosmWasm-Verträgen. Lesevorgänge
nutzen einen schreibgeschützten Client; Zustandsänderungen nutzen einen signierenden Client.

## Schreibgeschützte Abfragen

Öffne einen schreibgeschützten CosmWasm-Client aus deiner `createClient()`-Instanz — er
verbindet sich über den Konsens-RPC-Endpunkt und wird auf dem Client memoisiert.

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

Du kannst einen Lese-Client auch direkt mit `createCosmWasmClient` konstruieren.

## Signieren: instanziieren, ausführen, hochladen

Für Zustandsänderungen verbinde einen signierenden Client mit `connectCosmWasmSigner` (er
nimmt einen Offline-Signierer entgegen, dieselbe Art, die von
`directSignerFromPrivateKey` erzeugt wird), und verwende dann die typisierten Wrapper:

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

Die genauen Argumentformen folgen `@cosmjs/cosmwasm-stargate`; das SDK fügt typisierte
`ContractMsg`-, `FeeInput`-, `InstantiateOpts`-, `CosmWasmReadClient`- und
`CosmWasmSigningClient`-Typen hinzu.

Siehe das `cosmwasm-query`-[Beispiel](/sdk/examples) für ein lauffähiges Lesebeispiel.
