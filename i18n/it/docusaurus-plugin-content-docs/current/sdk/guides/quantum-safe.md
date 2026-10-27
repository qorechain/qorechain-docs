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
registrata. Dato il client composto da `createClient`, leggono tramite REST
(`GET /qorechain/pqc/v1/account/{address}`, servita da ogni endpoint pubblico); dato
un `QorClient` semplice usano il metodo JSON-RPC `qor_getPQCKeyStatus`, che **gli
endpoint pubblici non servono** (vedi
[il namespace `qor_`](/api-reference/json-rpc-qor_-namespace)), quindi contro
`*.qore.host` passa il client composto. Le release precedenti alla 0.9.0 usavano
sempre il metodo `qor_` e fallivano con l'errore JSON-RPC `-32601`; lì leggi
direttamente la route REST.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

La route è `GET /qorechain/pqc/v1/account/{address}` (`account` al singolare). Risponde
`{"found": true, "account": {…}}` per un indirizzo registrato e
`{"found": false, "account": null}` in caso contrario; `client.rest.getPqcAccount(address)`
restituisce quel corpo, e `fetchPqcStatus({ rest, address })` lo trasforma nello stato
qui sopra. Una risposta illeggibile (un errore HTTP, un guasto di trasporto) genera un
errore dopo un nuovo tentativo: non viene mai letta come «non registrato». Nella 0.8.x
`getPqcAccount` chiamava un percorso `/accounts/` al plurale che la catena non serve.

Lo stesso stato è leggibile anche dal lato EVM tramite il precompilato
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
a `0x0000000000000000000000000000000000000A02` (esposto come
`pqcKeyStatus` in `@qorechain/evm`) una volta che quel precompilato sarà attivo; non è
attivo sulla mainnet, ed è elencato come attivo sulla testnet (verificato il 27 ottobre 2026; vedi
[Stato della rete](/developer-guide/evm-precompiles#network-status)).

## Registrare con una sola chiamata {#register-in-one-call}

`ensurePqcRegistered` rende un account quantum-safe. Costruisce e trasmette
`MsgRegisterPQCKeyV2` con la chiave pubblica ML-DSA-87 del firmatario. È **idempotente**:
legge prima lo stato dell'account (tramite REST quando passi `rest`), salta la
registrazione quando l'account detiene già la chiave di questa coppia di chiavi, ed è quindi
sicuro chiamarlo a ogni avvio dell'app. Quando l'account detiene una chiave *diversa* lancia
`PqcKeyMismatchError` e non invia nulla, perché ogni transazione ibrida firmata
con la tua coppia di chiavi verrebbe rifiutata. Non registra mai alla cieca: se lo stato non può
essere letto lancia un errore (passa `force: true` solo per un account che sai non avere alcuna chiave).

La registrazione è firmata in modo classico ed è esente dal requisito ibrido, così un nuovo
account può inizializzare la sua prima chiave; dalla v3.2.3 tale esenzione copre solo un
account senza chiave (un account che ne detiene già una deve firmare in modo ibrido una registrazione
o una migrazione, e la chain rifiuta chiavi deboli, degeneri o riutilizzate). Una volta che la rete
ha applicato la v3.2.3, l'helper firma con la nuova chiave la **prova di possesso** facoltativa
e la allega (legge il chain id da `chainId` o dal nodo, e
lascia il campo fuori su una rete che non ha applicato la v3.2.3, perché un nodo più vecchio
lo rifiuta). Firma tramite un firmatario CosmJS, cioè un account con coin type 118
(`deriveNativeAccount`); per un account eth-native unificato firma la registrazione con
`EthNativeSigner` e `signMode: "classical"` (vedi
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### Una chiave che puoi recuperare {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` deriva la chiave ML-DSA-87 dell'account dal suo
indirizzo e dal suo mnemonic, così un dispositivo perso è recuperabile e ogni linguaggio e wallet
deriva la stessa chiave (un mnemonic, una chiave per account). Riconduce prima l'indirizzo alla sua
forma `qor1…` in minuscolo, quindi la forma `0x` di un account unificato produce la
stessa chiave. Gli equivalenti:

| Linguaggio | Funzione | Pubblicata |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (restituisce un `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

La derivazione legacy (`derivePqcLegacy`, `"bridge"`) non è legata all'account ed è
deprecata per le nuove chiavi; gli helper di rotazione la rifiutano come nuova chiave (vedi
[Ruotare una chiave](#rotate-a-key)).

Registrazione in Python (0.9.0; la lettura dello stato passa per REST e la chiamata solleva
`PqcKeyMismatchError` per una chiave registrata diversa invece di pagare una seconda
registrazione):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Gli helper Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) e Java
(`signer.restUrl`) leggono lo stato dalla stessa route REST e allegano la
prova di possesso allo stesso modo.

Gli altri SDK firmano in modo ibrido tramite i propri builder di transazioni ibride
(`build_hybrid_tx` in Python e Rust, `tx.BuildHybridMessages` in Go,
`PqcDx.HybridSendPath` in Java); solo il `TxClient` TypeScript firma in modo ibrido al posto tuo.

:::warning Lascia sempre che controlli prima
La chain rifiuta una seconda registrazione della stessa chiave **dopo aver addebitato la
fee**. `ensurePqcRegistered` quindi legge prima lo stato, tramite REST
(`/qorechain/pqc/v1/account/{address}`), e si rifiuta di registrare quando non
riesce a stabilirlo. Passa `rest` (oppure `statusSource` per un nodo che espone `qor_*`, o uno
`status` già letto); `force: true` salta il controllo. Nella 0.8.x l'helper non aveva un fallback REST
e trasmetteva la registrazione senza controllo a meno che tu non passassi `status` di tuo conto.
:::

## Firmare in modo ibrido

Con un `pqcKeypair` sul client, `tx.bankSend(...)` e
`tx.signAndBroadcast([messages], "auto")` firmano in modo ibrido (il percorso `fee: "auto"`
simula la transazione ibrida e aggiunge il gas della verifica post-quantistica).
La firma ibrida viene calcolata sulla forma di sign-bytes che la rete verifica (vedi
[Quale forma di sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions)); il client
lo chiede alla rete tramite il suo endpoint REST.

`migrateToHybrid` garantisce la registrazione e restituisce un percorso di invio ibrido con la
coppia di chiavi pre-associata ai builder di livello più basso `buildHybridTx` /
`signAndBroadcastHybrid`, per quando gestisci tu stesso fee, numero di account e sequence.
Passa `rest` così che l'SDK possa risolvere la forma di sign-bytes:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## Ruotare una chiave {#rotate-a-key}

Per sostituire la chiave ML-DSA-87 di un account con un'altra chiave dello **stesso** algoritmo
(per esempio passando da una chiave legacy `shake256(mnemonic)` alla chiave canonica legata
all'indirizzo, oppure ritirando una chiave compromessa), costruisci un `MsgRotatePQCKey` con
`rotatePqcKeyMsgFromMnemonic`; entrambe le chiavi lo firmano congiuntamente. Vedi
[Rotazione delle chiavi](/sdk/guides/authenticators#key-rotation) per l'esempio completo.

`migratePqcKeyHybrid` trasmette il più vecchio `MsgMigratePQCKey`, che sposta un account
tra **algoritmi**, con la firma ibrida che la chain richiede dalla v3.2.3 a un
account che ha una chiave. `pqcKeypair` è la chiave **attualmente** registrata
(quella che viene ruotata via), e il chiamante fornisce le due firme di titolarità
(`oldSignature` della vecchia chiave, `newSignature` della nuova chiave). Il
`migratePqcKey` classico è deprecato: un nodo v3.2.3 rifiuta una migrazione classica da un
account che ha una chiave.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## Nell'interfaccia utente

Il kit [`@qorechain/react`](/sdk/guides/react) espone tutto questo in React: l'hook
`usePqcStatus` e il componente `<QuantumSafeBadge/>` mostrano un indicatore **Quantum-safe**
ogni volta che l'account connesso ha una chiave PQC registrata. Entrambi leggono lo
stato tramite `getPqcStatus` con il client composto, quindi da `@qorechain/react`
0.9.0 lo leggono tramite REST e funzionano contro gli endpoint pubblici; la 0.8.x
non poteva confermare una chiave lì.
