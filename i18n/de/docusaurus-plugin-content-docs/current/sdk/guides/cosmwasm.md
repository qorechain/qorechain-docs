---
slug: /sdk/guides/cosmwasm
title: QoreChain Native-Leitfaden
sidebar_label: QoreChain Native
sidebar_position: 3
---

# QoreChain Native-Leitfaden

QoreChain Native ist QoreChains Name für seine CosmWasm-Smart-Contract-Laufzeitumgebung; die auf dieser Seite genannten CosmWasm-Bibliotheken und Client-Pakete sind also diejenigen, die du damit verwendest.

Der TypeScript-Core (`@qorechain/sdk`) enthält dünne, typisierte Wrapper über
`@cosmjs/cosmwasm-stargate` zum Abfragen und Ausführen von QoreChain Native-Verträgen. Lesevorgänge
nutzen einen schreibgeschützten Client; Zustandsänderungen nutzen einen signierenden Client.

## Schreibgeschützte Abfragen

Öffne einen schreibgeschützten QoreChain Native-Client aus deiner `createClient()`-Instanz — er
verbindet sich über den Konsens-RPC-Endpunkt und wird auf dem Client memoisiert.

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

Du kannst einen Lese-Client auch direkt mit `createCosmWasmClient` konstruieren.

## Signieren: instanziieren, ausführen, hochladen

:::caution Hochladen und Instanziieren sind berechtigungspflichtig
Auf `qorechain-vladi` (Mainnet) sind `code_upload_access` und
`instantiate_default_permission` auf `Nobody` gesetzt, und
`MsgStoreCode` / `MsgInstantiateContract` / `MsgInstantiateContract2` sind
zusätzlich durch den Circuit Breaker der Chain abgeschaltet, sodass `uploadCode`
und `instantiate` für gewöhnliche Konten abgelehnt werden. Auf `qorechain-diana`
(Testnet, geprüft am 27. Oktober 2026) ist `code_upload_access` auf `Nobody`
gesetzt und nur `MsgStoreCode` abgeschaltet, während
`instantiate_default_permission` auf `Everybody` steht, sodass `instantiate` dort
für bereits vorhandenen Code offen ist. Bereits vorhandene
Verträge können abgefragt (siehe oben) und ausgeführt werden. Prüfe
`GET /cosmwasm/wasm/v1/codes/params` für die aktuellen Berechtigungen.
Siehe [QoreChain Native-Entwicklung](/developer-guide/cosmwasm-development).
:::

:::caution Der QoreChain Native-Signing-Client signiert klassisch
`connectCosmWasmSigner` umhüllt den CosmJS-Signing-Client, der nur die klassische
secp256k1-Signatur anhängt. Die Live-Netzwerke verlangen bei jeder Transaktion
über den Native-Pfad die Hybrid-Signatur (secp256k1 + ML-DSA-87); eine darüber
gesendete Transaktion wird dort daher abgelehnt. Sie funktioniert gegen einen
Node, der die Hybrid-Erweiterung nicht verlangt (ein lokaler Dev-Node). Für
`execute` auf einem Live-Netzwerk baue die Nachricht und sende sie mit
`signAndBroadcastHybrid` (Beispiel unten).
:::

Für Zustandsänderungen gegen einen Node, der klassische Signaturen akzeptiert,
verbinde einen signierenden Client mit `connectCosmWasmSigner` (er nimmt einen
Offline-Signierer entgegen, dieselbe Art, die von `directSignerFromPrivateKey`
erzeugt wird), und verwende dann die typisierten Wrapper. Die Helfer liefern
`Promise<unknown>` zurück, sofern du den Ergebnistyp nicht angibst:

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

Die genauen Argumentformen folgen `@cosmjs/cosmwasm-stargate`; das SDK fügt typisierte
`ContractMsg`-, `FeeInput`-, `InstantiateOpts`-, `CosmWasmReadClient`- und
`CosmWasmSigningClient`-Typen hinzu.

### Ausführen auf einem Live-Netzwerk (Hybrid)

Füge die QoreChain Native-Nachrichtentypen zu einer Registry hinzu und sende die
`MsgExecuteContract` über den Hybrid-Builder. Der ML-DSA-87-Schlüssel des Kontos
muss zuvor registriert sein (siehe [Hybrides Signieren](/sdk/guides/quantum-safe)).
Benötigt
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

Siehe das `cosmwasm-query`-[Beispiel](/sdk/examples) für ein lauffähiges Lesebeispiel.
