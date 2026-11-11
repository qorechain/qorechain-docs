---
slug: /sdk/guides/cosmwasm
title: Ghid QoreChain Native
sidebar_label: QoreChain Native
sidebar_position: 3
---

# Ghid QoreChain Native

QoreChain Native este denumirea QoreChain pentru runtime-ul său de contracte inteligente CosmWasm, deci bibliotecile CosmWasm și pachetele client numite pe această pagină sunt cele pe care le folosești cu el.

Nucleul TypeScript (`@qorechain/sdk`) include învelișuri subțiri, tipizate, peste
`@cosmjs/cosmwasm-stargate` pentru interogarea și execuția contractelor QoreChain Native.
Citirile folosesc un client doar de citire; modificările de stare folosesc un
client de semnare.

## Interogări doar de citire

Deschide un client QoreChain Native doar de citire din instanța ta `createClient()` — se
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
Pe `qorechain-vladi` (mainnet), `code_upload_access` și
`instantiate_default_permission` sunt `Nobody`, iar `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` sunt oprite și de
întrerupătorul de siguranță (circuit breaker) al lanțului, așa că `uploadCode` și
`instantiate` sunt refuzate pentru conturile obișnuite. Pe `qorechain-diana`
(testnet, verificat la 27 octombrie 2026) `code_upload_access` este `Nobody` și
doar `MsgStoreCode` este oprit, în timp ce `instantiate_default_permission` este
`Everybody`, deci `instantiate` este deschis acolo pentru codul care există deja.
Contractele care există deja pot fi interogate (mai sus) și executate. Verifică
`GET /cosmwasm/wasm/v1/codes/params` pentru permisiunile curente.
Vezi [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development).
:::

:::caution Clientul de semnare QoreChain Native semnează clasic
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

Adaugă tipurile de mesaje QoreChain Native într-un registry și trimite `MsgExecuteContract`
prin builderul hibrid. Cheia ML-DSA-87 a contului trebuie înregistrată mai întâi
(vezi [Semnare hibridă](/sdk/guides/quantum-safe)). Necesită
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

### Gaz pentru apelurile de contract {#gas}

**Nu codificați gazul fix pentru un apel de contract.** Un 400.000 fix este suficient pentru un transfer simplu la un apel și se epuizează la următorul. Începând cu release-ul v3.2.8 (doar pe testnet până la un upgrade ulterior de mainnet), gazul CosmWasm este reprețuit:

- **Primul apel al unui cod de contract într-un bloc plătește un cost de încărcare.** Un transfer cw20 costă aproximativ 533.000 de gas ca prim apel al codului său într-un bloc și aproximativ 84.000 pentru fiecare repetare. Guvernanța poate fixa (pin) codurile populare, iar codurile fixate sar peste taxa de încărcare.
- **Taxele cresc odată cu congestia.** Un factor de congestie scalează gazul de contract de la 1x până la 20x implicit când blocurile sunt aglomerate cu apeluri de contract, iar un bloc are un buget limitat de execuție de contracte, din care o tranzacție poate folosi cel mult jumătate.
- **Simularea include ambele.** O simulare taxează întotdeauna încărcarea la rece și adaugă o marjă pentru congestie, deci `simulated gas x 1.3` este o limită sigură. Folosiți `fee: "auto"` unde clientul dumneavoastră îl oferă (CosmJS `"auto"`, `TxClient` din SDK, hook-ul React `useTx`) și simulați singur când construiți taxa manual, ca mai sus.
- **Rămâneți sub plafonul tranzacției.** O tranzacție Cosmos nu poate seta o limită de gas peste 50.000.000 și este refuzată înainte ca taxa să fie percepută.

Același lucru se aplică la instantiate, migrate și orice alt mesaj care rulează cod de contract.

Vezi [exemplul](/sdk/examples) `cosmwasm-query` pentru un exemplu de citire
executabil.
