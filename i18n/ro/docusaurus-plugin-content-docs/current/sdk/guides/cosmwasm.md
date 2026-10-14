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
  endpoints: { rpc: "https://rpc-testnet.qore.host" }, // mainnet: https://rpc.qore.host
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

De asemenea, poți construi un client de citire direct cu `createCosmWasmClient`.

## Semnare: instanțiere, execuție, încărcare

:::caution Încărcarea și instanțierea sunt permisionate
`code_upload_access` și `instantiate_default_permission` sunt `Nobody` pe
`qorechain-vladi` și `qorechain-diana`, iar `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` sunt oprite și de
întrerupătorul de siguranță (circuit breaker) al lanțului, așa că `uploadCode` și
`instantiate` sunt refuzate pentru conturile obișnuite. Contractele care există
deja pot fi interogate (mai sus) și executate. Verifică
`GET /cosmwasm/wasm/v1/codes/params` pentru permisiunile curente.
Vezi [Dezvoltare CosmWasm](/developer-guide/cosmwasm-development).
:::

:::caution Clientul de semnare CosmWasm semnează clasic
`connectCosmWasmSigner` învelește clientul de semnare CosmJS, care atașează doar
semnătura clasică secp256k1. Rețelele live cer semnătura hibridă
(secp256k1 + ML-DSA-87) pe fiecare tranzacție de pe calea Native, așa că o
tranzacție trimisă prin el este refuzată acolo; funcționează împotriva unui nod
care nu cere extensia hibridă (un nod local de dezvoltare). Pentru `execute` pe o
rețea live, construiește mesajul și trimite-l cu `signAndBroadcastHybrid` (exemplul
de mai jos).
:::

Pentru modificările de stare împotriva unui nod care acceptă semnături clasice,
conectează un client de semnare cu `connectCosmWasmSigner` (acesta preia un signer
offline, de același tip cu cel produs de `directSignerFromPrivateKey`), apoi
folosește învelișurile tipizate. Funcțiile ajutătoare returnează
`Promise<unknown>` dacă nu specifici tipul rezultatului:

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

Formele exacte ale argumentelor urmează `@cosmjs/cosmwasm-stargate`; SDK-ul adaugă
tipurile tipizate `ContractMsg`, `FeeInput`, `InstantiateOpts`,
`CosmWasmReadClient` și `CosmWasmSigningClient`.

### Execuție pe o rețea live (hibrid)

Adaugă tipurile de mesaje CosmWasm într-un registry și trimite `MsgExecuteContract`
prin builderul hibrid. Cheia ML-DSA-87 a contului trebuie înregistrată mai întâi
(vezi [Rezistență cuantică](/sdk/guides/quantum-safe)). Necesită
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

Vezi [exemplul](/sdk/examples) `cosmwasm-query` pentru un exemplu de citire
executabil.
