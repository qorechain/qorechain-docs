---
slug: /sdk/guides/quantum-safe
title: Quantum-safe per impostazione predefinita
sidebar_label: Quantum-safe
sidebar_position: 6
---

# Quantum-safe per impostazione predefinita

QoreChain tratta la crittografia post-quantistica come uno schema di firma **di prima classe**.
Un account registra on-chain una chiave **ML-DSA-87 (Dilithium-5, NIST FIPS 204)**,
dopodiché le sue transazioni possono portare una firma **ibrida** — la consueta
firma classica secp256k1 **più** una firma ML-DSA-87. L'ante
handler della catena verifica entrambe, così un account quantum-safe rimane pienamente compatibile con
la verifica classica e guadagna al contempo protezione contro un futuro avversario
quantistico.

L'SDK racchiude tutto questo in una superficie minima e idempotente così che una dApp diventi
**quantum-safe per impostazione predefinita**: una sola chiamata per essere protetta da PQC. Sulle
reti live questo non è facoltativo per le transazioni del percorso Native: la chiave deve essere
registrata **esplicitamente** (non esiste alcuna registrazione automatica alla prima
transazione), e poi ogni transazione del percorso Native deve portare la firma ibrida.

## Verificare lo stato {#check-status}

`isPqcRegistered` / `getPqcStatus` leggono se un indirizzo ha una chiave PQC
registrata tramite il metodo JSON-RPC `qor_getPQCKeyStatus`. Accettano sia un
`QorClient` sia il client composto da `createClient`. **Gli endpoint pubblici
non servono il namespace `qor_`** (vedi
[il namespace `qor_`](/api-reference/json-rpc-qor_-namespace)), quindi contro
`*.qore.host` questi helper falliscono con l'errore JSON-RPC `-32601`. Leggi lo stato
tramite REST:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

La route è `GET /qorechain/pqc/v1/account/{address}` (`account` al singolare). Risponde
`{"found": true, "account": {…}}` per un indirizzo registrato e
`{"found": false, "account": null}` in caso contrario. Non usare `client.rest.getPqcAccount`
per questo: chiama il percorso `/accounts/` al plurale, che la catena non serve.

`isPqcRegistered(client, address)` e `getPqcStatus(client, address)` (con l'opzione
`statusSource`) restano le chiamate giuste contro un nodo che serve il namespace `qor`;
il loro risultato è
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

Lo stesso stato è leggibile anche dal lato EVM tramite il precompilato
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
a `0x0000000000000000000000000000000000000A02` (esposto come
`pqcKeyStatus` in `@qorechain/evm`) una volta che quel precompilato sarà attivo; non è
ancora attivo su mainnet né su testnet (vedi
[Stato della rete](/developer-guide/evm-precompiles#network-status)). La prossima
patch release dell'SDK ripiega sulla route REST qui sopra quando riceve un client che espone
`.rest` (come il client composto), e solleva un errore invece di riportare «non
registrato» quando lo stato non può essere letto.

## Registrare con una sola chiamata

`ensurePqcRegistered` rende un account quantum-safe. Costruisce e trasmette
`MsgRegisterPQCKeyV2` con la chiave pubblica ML-DSA-87 del firmatario e la chiave pubblica
ECDSA dell'account. È **idempotente** quando gli passi uno `status` già letto (o una
`statusSource`): salta la registrazione quando la chiave è già registrata, così
è sicuro chiamarlo a ogni avvio dell'app.

La registrazione è firmata in modo classico ed è esente dal requisito ibrido, così un nuovo
account può inizializzare la sua prima chiave. Firma tramite un firmatario CosmJS, cioè un
account con coin type 118 (`deriveNativeAccount`); per un account eth-native unificato firma
la registrazione con `EthNativeSigner` e `signMode: "classical"` (vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). La chiave da 2.592
byte richiede un gas limit di circa 600.000; il prezzo minimo del gas della rete è 0,1 uqor
per unità di gas.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## Firmare ibrido

`migrateToHybrid` garantisce la registrazione e restituisce un percorso di invio ibrido con la
coppia di chiavi pre-associata ai builder esistenti `buildHybridTx` / `signAndBroadcastHybrid`.
Passa `rest` così che l'SDK possa stabilire quale forma di sign-bytes ibrida
la rete verifica (vedi
[Quale forma di sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

La catena accetta qualsiasi firma ML-DSA-87 FIPS-204 valida, hedged o
deterministica. L'SDK firma in modo deterministico per impostazione predefinita (dalla 0.5.1), così
una transazione ha sempre la stessa firma e lo stesso hash di tx. Se una tx ibrida fallisce
con il codice `pqc` 21 (`hybrid_verify_failed`), la causa è la versione dei sign-bytes, il
chain-id, una libreria PQC obsoleta oppure una chiave non registrata o diversa, mai la
firma hedged: vedi [Risoluzione dei problemi del codice 21](/developer-guide/post-quantum-signing#code-21).

## Ruotare una chiave

Per sostituire la chiave ML-DSA-87 di un account con un'altra chiave dello **stesso** algoritmo
(per esempio passando da una chiave legacy `shake256(mnemonic)` alla chiave canonica legata
all'indirizzo, oppure ritirando una chiave compromessa), costruisci un `MsgRotatePQCKey` con
`rotatePqcKeyMsgFromMnemonic`; entrambe le chiavi lo firmano congiuntamente. Vedi
[Rotazione delle chiavi](/sdk/guides/authenticators#key-rotation) per l'esempio completo.

`migratePqcKey` trasmette il più vecchio `MsgMigratePQCKey`, che sposta un account
tra **algoritmi** e richiede che entrambe le firme siano fornite dal chiamante:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## Nell'interfaccia utente

Il kit [`@qorechain/react`](/sdk/guides/react) espone tutto questo in React: l'hook
`usePqcStatus` e il componente `<QuantumSafeBadge/>` mostrano un indicatore **Quantum-safe**
ogni volta che l'account connesso ha una chiave PQC registrata. Entrambi leggono lo
stato tramite `getPqcStatus`, quindi contro gli endpoint pubblici (senza namespace
`qor_`) oggi non possono confermare una chiave; vedi i limiti delle reti live
nella pagina React.
