---
slug: /sdk/guides/cosmwasm
title: Guida a QoreChain Native
sidebar_label: QoreChain Native
sidebar_position: 3
---

# Guida a QoreChain Native

QoreChain Native è il nome che QoreChain dà al proprio runtime di smart contract CosmWasm, quindi le librerie CosmWasm e i pacchetti client citati in questa pagina sono quelli che usi con esso.

Il core TypeScript (`@qorechain/sdk`) include wrapper sottili e tipizzati sopra
`@cosmjs/cosmwasm-stargate` per interrogare ed eseguire contratti QoreChain Native. Le letture
usano un client in sola lettura; le modifiche allo stato usano un client di firma.

## Query in sola lettura

Apri un client QoreChain Native in sola lettura dalla tua istanza `createClient()` — si
connette tramite l'endpoint RPC di consenso ed è memoizzato sul client.

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

Puoi anche costruire un client di lettura direttamente con `createCosmWasmClient`.

## Firma: instantiate, execute, upload

:::caution Upload e instantiate sono soggetti a permessi
Su `qorechain-vladi` (mainnet) `code_upload_access` e
`instantiate_default_permission` sono `Nobody`, e anche `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` sono disattivati dal
circuit breaker della chain, quindi `uploadCode` e `instantiate` vengono rifiutati
per gli account ordinari. Su `qorechain-diana` (testnet, verificato il 27 ottobre 2026)
`code_upload_access` è `Nobody` e solo `MsgStoreCode` è disattivato, mentre
`instantiate_default_permission` è `Everybody`, quindi lì `instantiate` è aperto per
il codice già esistente. I contratti già esistenti possono essere interrogati
(sopra) ed eseguiti. Controlla `GET /cosmwasm/wasm/v1/codes/params` per i permessi
attuali.
Vedi [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development).
:::

:::caution Il client di firma QoreChain Native firma in modo classico
`connectCosmWasmSigner` incapsula il client di firma di CosmJS, che allega solo la
firma classica secp256k1. Le reti live richiedono la firma ibrida
(secp256k1 + ML-DSA-87) su ogni transazione del percorso Native, quindi una
transazione inviata tramite di esso viene rifiutata; funziona con un nodo che non
richiede l'estensione ibrida (un nodo di sviluppo locale). Per un `execute` su una
rete live, costruisci il messaggio e invialo con `signAndBroadcastHybrid` (esempio
sotto).
:::

Per le modifiche allo stato verso un nodo che accetta firme classiche, connetti un client di
firma con `connectCosmWasmSigner` (che accetta un offline signer, lo stesso tipo prodotto da
`directSignerFromPrivateKey`), poi usa i wrapper tipizzati. Gli helper restituiscono
`Promise<unknown>` a meno che tu non indichi il tipo del risultato:

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

Le esatte forme degli argomenti seguono `@cosmjs/cosmwasm-stargate`; l'SDK aggiunge i tipi
tipizzati `ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient` e
`CosmWasmSigningClient`.

### Eseguire su una rete live (ibrido)

Aggiungi i tipi di messaggio QoreChain Native a un registry e invia il `MsgExecuteContract`
tramite il builder ibrido. La chiave ML-DSA-87 dell'account deve essere registrata
prima (vedi [Firma ibrida](/sdk/guides/quantum-safe)). Richiede
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

### Gas per le chiamate ai contratti {#gas}

**Non scrivere il gas di una chiamata a un contratto in modo fisso.** Un valore fisso di 400.000 basta per un semplice trasferimento in una chiamata e si esaurisce alla successiva. Dalla release v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) il gas di CosmWasm è ridefinito:

- **La prima chiamata di un codice di contratto in un blocco paga un costo di caricamento.** Un trasferimento cw20 costa circa 533.000 gas come prima chiamata del suo codice in un blocco e circa 84.000 per ogni ripetizione. La governance può fissare (pin) i codici più popolari, e i codici fissati saltano l'addebito del caricamento.
- **Le commissioni salgono con la congestione.** Un fattore di congestione scala il gas dei contratti da 1x fino a 20x per impostazione predefinita quando i blocchi sono occupati da chiamate a contratti, e un blocco ha un budget limitato di esecuzione dei contratti, di cui una transazione può usare al massimo la metà.
- **La simulazione include entrambi.** Una simulazione addebita sempre il caricamento a freddo e aggiunge un margine per la congestione, quindi `simulated gas x 1.3` è un limite sicuro. Usa `fee: "auto"` dove il tuo client lo offre (CosmJS `"auto"`, il `TxClient` dell'SDK, l'hook React `useTx`), e simula tu stesso quando costruisci la commissione a mano come sopra.
- **Resta sotto il tetto della transazione.** Una transazione Cosmos non può impostare un gas limit superiore a 50.000.000 e viene rifiutata prima che la sua commissione venga addebitata. L'SDK 0.14.0 rifiuta un limite simile prima della firma (e una transazione EVM sopra 30.000.000), dà alle transazioni CosmWasm e cross-VM almeno 1,3 volte il gas simulato e non ricade mai su un gas limit fisso per esse. Ha anche helper facoltativi che leggono il prezzo minimo del gas della rete; il prezzo del gas predefinito non cambia.

Lo stesso vale per instantiate, migrate e ogni altro messaggio che esegue codice di contratto.

Consulta l'[esempio](/sdk/examples) `cosmwasm-query` per un esempio di lettura eseguibile.
