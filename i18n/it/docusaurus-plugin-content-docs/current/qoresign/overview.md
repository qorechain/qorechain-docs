---
slug: /qoresign/overview
title: Panoramica di QoreSign
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreSign

QoreSign è una libreria open source per la firma ibrida secp256k1 + ML-DSA-87 (FIPS 204) su QoreChain, pensata per wallet, exchange, custodian e backend.

QoreSign permette a un wallet diverso da quello di QoreChain di derivare la chiave ML-DSA-87 di un account, firmare le transazioni sulla corsia Native con entrambe le chiavi, verificare localmente le firme ibride, firmare messaggi arbitrari, simulare una transazione prima di firmarla, rileggere come è stata protetta una transazione confermata e implementare Sign In With QoreChain. È un sottile strato sopra i binding [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) e non aggiunge alcuna primitiva crittografica propria. È mantenuta dalla QoreChain Association con licenza Apache-2.0.

La versione attuale è la **0.1.1** (27 ottobre 2026). È pubblicata in TypeScript, Rust, Go, Kotlin (JVM e Android), Swift e, novità della 0.1.1, Python. Il codice sorgente, gli esempi e i vettori di test si trovano nel repository [qorechain/qoresign](https://github.com/qorechain/qoresign). Funziona sulla mainnet (`qorechain-vladi`) e sulla testnet (`qorechain-diana`).

## Che cosa fa QoreSign su ciascuna corsia {#lanes}

| Corsia | Che cosa fa oggi QoreSign |
|---|---|
| **Native** (Cosmos SDK) | Firma e verifica ibride. Per impostazione predefinita la rete richiede la firma ML-DSA-87. |
| **EVM** | Solo finestra di autorizzazione: l'account registra una chiave ML-DSA-87 e apre dalla corsia Native una finestra di autorizzazione limitata. Le transazioni Ethereum stesse non portano alcuna firma ML-DSA-87. |
| **SVM** | Non ancora aperta sulla rete (`LANE_NOT_AVAILABLE`). |

La firma ibrida su EVM richiede prima il supporto PQC per singola corsia nella rete. Vedi [Wallet EVM: finestra di autorizzazione](/qoresign/guides/evm-quantum-ready).

## Che cosa fa {#what-it-does}

Nucleo offline, identico in ogni linguaggio:

- Deriva la chiave classica su `m/44'/118'/0'/0/0` (`deriveClassicalKey`) e la chiave ML-DSA-87 canonica che i wallet QoreChain registrano per un account (`deriveCanonicalPqKey`, legata alla mnemonica e all'indirizzo). Esiste una derivazione HD hardened come bozza (`deriveHdPqKey`); `pqKeyFromSeed` ricostruisce una coppia di chiavi dal suo seed di 32 byte.
- Costruisce e analizza indirizzi `qor1` per account `secp256k1` e `eth_secp256k1`.
- Firma una transazione sulla corsia Native con entrambe le chiavi (`signHybrid`), oppure aggiunge solo il livello ML-DSA-87 a un body costruito da una dApp (`signPqLayer`). Le firme ML-DSA-87 sono deterministiche per impostazione predefinita; la firma hedged è un'opzione e la rete accetta entrambe. secp256k1 usa RFC 6979 con low-S.
- Calcola i sign-bytes ibridi v1 e v2 (`hybridSignBytes`) e verifica una transazione ibrida completa (`verifyHybridTx`) oppure il solo livello ML-DSA-87 (`verifyPqLayer`).
- Costruisce `MsgRegisterPQCKeyV2` con una prova di possesso (`buildRegisterPqKeyMessage`, `signProofOfPossession`) e rifiuta le chiavi pubbliche degeneri.
- Firma e verifica messaggi arbitrari (`signMessage`, `verifyMessage`) e implementa Sign In With QoreChain v1 (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Applica nel codice le regole delle corsie (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Gli errori portano un codice stabile condiviso da tutti i linguaggi (`QoreSignError`, per esempio `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Helper di rete (TypeScript `@qorechain/qoresign/network`; Go `github.com/qorechain/qoresign/go/network` li ha tutti tranne i due nuovi):

- `fetchPqKeyStatus`: indica se una chiave ML-DSA-87 è registrata per un indirizzo e quale.
- `resolveSignBytesVersion`: quale forma dei sign-bytes verifica la rete.
- `simulateTx` (gas usato, limite di gas suggerito, variazioni di saldo per indirizzo), `suggestGasLimit`, `broadcastTx` e `submitWithSignBytesFallback` (un nuovo tentativo con l'altra forma dei sign-bytes quando la rete rifiuta la prima).
- `assertPqLayerMatchesRegisteredKey`: controlla un livello fornito da una dApp rispetto alla chiave presente on-chain prima che il wallet aggiunga la sua firma classica.
- `verifySiwqWithChain` e `verifyMessageWithChain`: verifica rispetto alla chiave registrata on-chain.
- `fetchCommittedExtensionTypeUrls`: rilegge quali estensioni portava una transazione confermata.
- Novità della 0.1.1, solo TypeScript: `inspectTransaction` e `fetchEvmWindow`, descritte più avanti.

## Novità della 0.1.1 {#new-in-0-1-1}

- **Python.** Il pacchetto `qorechain-qoresign` (import `qoresign`) è su PyPI, con wheel per macOS e Linux. Fa da binding all'implementazione Rust e riproduce gli stessi vettori di test. È offline, come i binding Swift e Kotlin: nessun helper di rete.
- **Ispettore delle transazioni (libreria).** `inspectTransaction` legge una transazione confermata e riporta come è stata protetta. Vedi [Ispettore delle transazioni](#inspector).
- **Lettore della finestra EVM.** `fetchEvmWindow` legge la finestra di autorizzazione EVM di un account.
- **Correzioni di pacchettizzazione.** L'archivio del framework binario Swift non contiene più una cartella resource-fork spuria, e le librerie native macOS nei pacchetti Kotlin e Python non registrano più la directory di build come install name.

## Ispettore delle transazioni {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` è una funzione di sola lettura in `@qorechain/qoresign/network`. Recupera una transazione confermata e restituisce:

- i messaggi, il memo, il codice di risultato, l'altezza e la commissione;
- il firmatario: indirizzo, tipo di chiave, chiave pubblica e sequence;
- se la firma classica è valida;
- lo stato del livello ML-DSA-87: presente o no, quanti livelli, se il livello è valido rispetto alla chiave che il firmatario ha registrato ora e quale forma dei sign-bytes ha usato;
- un livello di sicurezza (tier), con la stessa classificazione dell'explorer pubblico: `pqc` (porta il livello ML-DSA-87), `enrollment` (registra o ruota una chiave ML-DSA-87, firmata per scelta progettuale con la chiave classica), `shake` (una transazione sulla corsia Native senza il livello) oppure `classical` (una transazione sulla corsia EVM).

Restituisce `undefined` per un hash che la rete non conosce. Passa un endpoint `rpc` per leggere da un nodo i byte esatti confermati; senza, la funzione usa i byte che il gateway REST ricodifica. Non invia nulla e non richiede alcun account né chiave.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Salvalo come `inspect.mjs` ed esegui `node inspect.mjs <txhash>` con l'hash di una transazione della testnet. Eseguito su un recente trasferimento del faucet della testnet, ha stampato `ML-DSA-87 key registered: true`, tier `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, il messaggio `/cosmos.bank.v1beta1.MsgSend` e `EVM window: false false`.

`fetchEvmWindow({ rest, address })` restituisce `found`, `live`, le altezze di apertura e di scadenza, il massimo e l'utilizzo di transazioni e valore, i blocchi, le transazioni e il valore rimanenti, `nativeOnly` e `allowedTargets`.

Questa è la funzione della libreria. La pagina [Developers](/dashboard/developers) della dashboard non ha ancora una scheda Ispettore delle transazioni.

## A che cosa serve {#use-cases}

1. **Un wallet compatibile con Keplr aggiunge la firma ibrida di QoreChain.** Leap, Cosmostation o un nuovo wallet produce la firma secp256k1 tramite `signDirect`. Con QoreSign deriva la chiave ML-DSA-87 dell'account dalla stessa mnemonica e aggiunge il livello (`signPqLayer`) prima di firmare. Vedi [la guida per i wallet](/qoresign/guides/keplr-compatible-wallets).
2. **Un exchange o un custodian firma i prelievi sui propri server.** Un servizio di hot o warm wallet in Go o Rust firma i trasferimenti sulla corsia Native con `signHybrid`, li simula prima (`simulateTx`, Go e TypeScript) per vedere le variazioni di saldo e il gas, e fa il broadcast con `submitWithSignBytesFallback`. Il [custody kit](/developer-tools/custody-kit) si basa su questo.
3. **Un backend implementa Sign In With QoreChain.** Il server emette un nonce monouso, il wallet firma un messaggio di accesso e il server chiama `verifySiwqWithChain`. Vedi [la guida al sign-in](/qoresign/guides/sign-in).
4. **Uno strumento di compliance o di supporto verifica come è stata protetta una transazione.** `inspectTransaction` riporta se una transazione confermata portava un livello ML-DSA-87 verificato, quale forma dei sign-bytes ha usato e il suo tier.
5. **Un wallet mostra la finestra di autorizzazione di un account EVM.** Prima che un utente invii da un wallet EVM, `fetchEvmWindow` mostra se una finestra è attiva e quante transazioni e quanto valore rimangono.
6. **Un team Python firma report o approvazioni.** `qoresign.sign_message` produce una firma ibrida su byte arbitrari che qualsiasi altro linguaggio di QoreSign può verificare.
7. **Un wallet mobile su iOS o Android.** Il pacchetto Swift e l'AAR Android offrono la stessa derivazione, firma e sign-in del pacchetto TypeScript, byte per byte.
8. **Revisori e integratori verificano le firme offline.** `verifyHybridTx`, `verifyPqLayer` e `verifyMessage` funzionano senza rete, date le chiavi pubbliche.

## Come funziona {#how-it-works}

- **Una transazione ibrida** è un normale `TxRaw` di Cosmos SDK firmato due volte dallo stesso account: una firma ML-DSA-87 portata nel body della transazione come opzione di estensione `/qorechain.pqc.v1.PQCHybridSignature` (algorithm id `1`) e una firma secp256k1 `SIGN_MODE_DIRECT` sul body finale.
- **Sign-bytes v2** (oggi verificati da entrambe le reti pubbliche) sono `"qorechain-pqc-hybrid-v2"`, poi il chain id, il body senza l'estensione PQC e l'auth info, ciascuno con un prefisso di lunghezza. La firma ML-DSA-87 copre quindi la commissione. La firma classica copre il body finale, estensione inclusa. La v1 viene mantenuta per riprodurre firme più vecchie. Vedi [Firma ibrida delle transazioni v1](/qoresign/spec/hybrid-signing-v1).
- **Ordine:** codifica il body e l'auth info, calcola i sign-bytes e la firma ML-DSA-87, aggiungi l'estensione, poi firma il SignDoc con secp256k1 e fai il broadcast.
- **Registrazione:** `MsgRegisterPQCKeyV2` porta la chiave pubblica ML-DSA-87, la chiave secp256k1 compressa dell'account e una prova di possesso. La transazione di registrazione è firmata solo con la chiave classica.
- **Separazione dei domini:** ogni firma ML-DSA-87 inizia con un prefisso riservato, così una firma di messaggio o di accesso non può mai essere riutilizzata come firma di transazione.
- **Che cosa c'è on-chain:** la chiave pubblica ML-DSA-87 registrata, le transazioni ibride e le finestre EVM. Chiavi, firma e verifica avvengono sul dispositivo o sul server che esegue QoreSign.
- **Vettori di test condivisi:** i formati wire sono versionati separatamente dai pacchetti e coperti da [vettori di test](/qoresign/vectors) che ogni linguaggio riproduce byte per byte.

Dimensioni (FIPS 204 e la [guida alle dimensioni](/qoresign/guides/sizes-and-transport)): una chiave pubblica ML-DSA-87 è di 2.592 byte, la chiave segreta di 4.896 byte, una firma di 4.627 byte e il seed di 32 byte. Una transazione ibrida è circa 4,7 KB più grande di una classica, quindi simula prima di firmare. Una firma o una chiave pubblica non entra in un singolo codice QR statico; i firmatari air-gapped richiedono un QR multiparte. Conserva il seed di 32 byte, non la chiave segreta.

## Pacchetti {#packages}

| Linguaggio | Pacchetto | Installazione | Piattaforma minima |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 o successivo; browser |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (nome della libreria `qoresign`) | `cargo add qorechain-qoresign` | Rust stable |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+; wheel per macOS 11+ (arm64, x86_64) e Linux (x86_64, aarch64); nessuna wheel per Windows per ora, le altre piattaforme compilano dalla distribuzione sorgente (richiede Rust 1.95) |
| Swift | `QoreSign` da [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (framework binario nella release GitHub) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, prodotto `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 o successivo; librerie native per macOS (arm64, x86-64), Linux (x86-64, arm64) e Windows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 o successivo; `arm64-v8a`, `armeabi-v7a`, `x86_64`; regole keep di R8 incluse |

:::note Versione del compilatore Kotlin
Gli artefatti Kotlin e Android richiedono nel tuo progetto il compilatore **Kotlin 2.3 o successivo**. Un progetto con Kotlin 2.1 non compila rispetto a essi. Aggiorna la versione di Kotlin della build prima di aggiungere la dipendenza.
:::

Tutte le implementazioni si verificano rispetto agli stessi [vettori di test](/qoresign/vectors).

## Esempio {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

L'[Avvio rapido](/qoresign/quickstart) esegue lo stesso flusso da capo a fondo, offline, e contiene gli avvii rapidi per la firma di messaggi in Python e Go.

## API principale {#main-api}

I nomi sono riportati in forma TypeScript. Go usa gli stessi nomi in stile Go (`SignHybrid`, `VerifySiwq`); Rust e Python usano snake_case (`sign_hybrid`); Swift e Kotlin usano camelCase sopra il nucleo Rust.

| Nome | Che cosa fa | Dove |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | chiavi da una mnemonica, da un seed o da byte grezzi | tutti |
| `deriveHdPqKey` | derivazione HD hardened delle chiavi ML-DSA-87 (bozza, può cambiare) | tutti |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | indirizzi `qor1` | tutti |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | firma ibrida e sign-bytes v1 o v2 | tutti |
| `verifyHybridTx`, `verifyPqLayer` | verifica locale | tutti |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | registrazione della chiave con prova di possesso | tutti |
| `signMessage`, `verifyMessage` | firma di messaggi arbitrari (ADR-36 più ML-DSA-87) | tutti |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | tutti |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | regole delle corsie; rilevamento di un livello perso | tutti |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | helper di rete | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | leggere una transazione confermata; leggere una finestra EVM (0.1.1) | TypeScript |

In Go gli helper di rete sono metodi di un client: `client := network.NewClient("https://api-testnet.qore.host")`, poi `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` oppure `client.SimulateTx(...)`. In Python gli errori sono `QoreSignError` con `code` e `detail`; i campi di byte sono `bytes`.

Riferimento API: in un clone del repository, esegui `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) oppure `go doc github.com/qorechain/qoresign/go` (Go). I binding Swift, Kotlin e Python rispecchiano l'API Rust; vedi i README [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) e [Python](https://github.com/qorechain/qoresign/tree/main/python).

## Reti e requisiti {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` (EVM chain id 9801) | `qorechain-diana` (EVM chain id 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Sign-bytes verificati | v2 | v2 |

- **Corsia Native:** per impostazione predefinita la rete richiede la firma ML-DSA-87. Esenti: la registrazione della chiave ML-DSA-87 di un account e uno unjail da parte di un account senza chiave. L'account deve avere la propria chiave registrata (`MsgRegisterPQCKeyV2`) prima che le transazioni ibride risultino valide; i wallet QoreChain la registrano alla creazione dell'account.
- **Corsia EVM:** un account con una chiave ML-DSA-87 registrata apre una finestra di autorizzazione limitata (altezza di scadenza, numero massimo di transazioni, valore massimo, contratti consentiti facoltativi) con una transazione ibrida firmata sulla corsia Native. Fuori da una finestra attiva la rete rifiuta le transazioni EVM dell'account. Le letture e la stima del gas non richiedono alcuna finestra.
- **Commissioni:** denom `uqor` (6 decimali), prezzo minimo del gas 0,1 uqor per gas.
- **Valori di registrazione Keplr:** prefisso bech32 `qor`, coin type `118`.
- **Account:** nessuno per le funzioni offline. Gli helper di rete richiedono solo un endpoint REST; il broadcast richiede un account con fondi e con una chiave ML-DSA-87 registrata.

## Documentazione {#documentation}

- [Avvio rapido](/qoresign/quickstart): deriva le chiavi, firma e verifica una transazione ibrida in pochi minuti.
- Guide
  - [Aggiungere la firma ibrida a un wallet compatibile con Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: verifica lato server](/qoresign/guides/sign-in)
  - [Wallet EVM: finestra di autorizzazione](/qoresign/guides/evm-quantum-ready)
  - [Derivazione delle chiavi: chiavi canoniche e bozza HD](/qoresign/guides/key-derivation)
  - [Dimensioni e trasporto](/qoresign/guides/sizes-and-transport)
- Specifiche
  - [Firma ibrida delle transazioni v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Firma di messaggi v1](/qoresign/spec/message-signing-v1)
  - [Derivazione delle chiavi ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vettori di test](/qoresign/vectors)
- [Esempi](https://github.com/qorechain/qoresign/tree/main/examples)

## Ambito e limiti {#scope}

- QoreSign firma in locale. Non custodisce le chiavi per te, non esegue firme threshold o MPC e non firma su hardware wallet.
- Non esiste una firma EVM ibrida: `assertHybridLane("evm")` genera `LANE_NOT_AVAILABLE`. Gli account EVM usano invece la finestra di autorizzazione. Le transazioni SVM non sono aperte.
- Rust, Swift, Kotlin e Python non hanno codice di rete. Recuperare i numeri di account, simulare e fare il broadcast resta nella tua app, oppure usa gli helper TypeScript o Go.
- `inspectTransaction` e `fetchEvmWindow` esistono solo in TypeScript. `inspectTransaction` controlla il livello rispetto alla chiave che il firmatario ha registrato ora, quindi dopo una rotazione della chiave una transazione più vecchia riporta `verified: false`.
- La derivazione canonica richiede la mnemonica. I wallet che non la hanno (chiavi custodite in hardware) generano una chiave casuale (`pqKeyFromSeed`) o usano la bozza HD, e registrano quella chiave. La mnemonica deve essere in forma canonica (minuscole, spazi singoli); altre grafie vengono rifiutate, non normalizzate.
- La derivazione HD (`deriveHdPqKey`) è una bozza e può cambiare.
- Python non ha ancora una wheel per Windows. Kotlin e Android richiedono il compilatore Kotlin 2.3 o successivo.
- Le implementazioni di ML-DSA-87 e secp256k1 provengono da `qorechain-pqc` (costruito su `@noble/post-quantum`, `fips204` e Cloudflare CIRCL) e da `@noble/curves`, `k256` e `decred/secp256k1`.

## Note di sicurezza {#security}

- Le chiavi non lasciano mai il processo che esegue QoreSign. Non viene inviato nulla da nessuna parte a meno che tu non chiami un helper di rete, e questi inviano solo dati pubblici: indirizzi, byte di transazioni firmate e hash.
- Mostra all'utente i messaggi e la commissione da `bodyBytes` e `authInfoBytes` prima di firmare; la firma ML-DSA-87 copre la commissione.
- Quando una dApp fornisce un body che porta già un livello PQC, controllalo con `assertPqLayerMatchesRegisteredKey` prima di aggiungere la firma classica. Dopo il broadcast, `evaluateLayerState` con `fetchCommittedExtensionTypeUrls`, oppure `inspectTransaction`, conferma che il livello è arrivato sulla chain.
- Non firmare mai byte grezzi con la chiave ML-DSA-87 al di fuori dei domini riservati.
- I nonce di sign-in sono monouso. `verifySiwq` rifiuta un accesso senza la parte ML-DSA-87 a meno che non si passi `requirePq: false`; accetta accessi solo classici soltanto quando il tuo servizio non ha bisogno della garanzia post-quantistica.
- Conserva il seed ML-DSA-87 di 32 byte, cifrato, anziché la chiave segreta.
- Non mettere mai una mnemonica di mainnet in uno script o nella cronologia della shell. Gli esempi usano la frase di test pubblica BIP-39 (`abandon` undici volte, poi `about`); non finanziarla mai.
- Segnala le vulnerabilità in privato a security@qore.network, non nelle issue pubbliche. Le correzioni di sicurezza confluiscono nell'ultima versione minore.

## Dove è pubblicata {#where-published}

Versioni verificate sui registry il 27 ottobre 2026.

| Registry | Pacchetto | Versione | Link |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go module proxy | `github.com/qorechain/qoresign/go` | v0.1.1 (tag `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (wheel per macOS arm64 e x86_64, Linux x86_64 e aarch64, distribuzione sorgente) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` da `github.com/qorechain/qoresign` | 0.1.1 (binario `QoreSignFFI.xcframework.zip` nella release) | [Release GitHub](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

Repository: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (release v0.1.0 e v0.1.1).

## Pagine correlate {#related}

- [Primitive post-quantistiche (`qorechain-pqc`)](/developer-tools/pqc-library): le primitive ML-DSA-87 sotto QoreSign.
- [QoreChain SDK](/sdk/overview): compositori di transazioni, messaggi della finestra EVM e rilevamento delle funzionalità.
- [Wallet adapter](/developer-tools/wallet-adapter): l'alternativa lato dApp quando un wallet non può essere modificato. La dApp detiene la chiave ML-DSA-87 e chiede al wallet invariato `signDirect`; i byte sono gli stessi di QoreSign.
- [QoreSeal](/developer-tools/qoreseal): cifratura verso gli account; le sue recipient card sono firme di messaggio QoreSign.
- [Custody kit](/developer-tools/custody-kit): rilevamento dei depositi e verifica dei prelievi basati su QoreSign.
- [Server MCP di QoreChain](/developer-tools/mcp): il suo strumento `get_pq_status` usa QoreSign per verificare il livello ibrido.
- [Firma post-quantistica](/developer-guide/post-quantum-signing) e [Integrazione per exchange](/developer-guide/exchange-integration).
- [Panoramica dei pacchetti per sviluppatori](/developer-tools/overview).

## Versionamento {#versioning}

QoreSign è pre-1.0: le versioni minori possono modificare l'API e ogni modifica incompatibile è elencata nel [changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). I formati wire sono versionati separatamente (le specifiche `v1` e `vectors/qoresign-v1.json`) e non cambiano all'interno di una versione.

## Contributi e sicurezza {#contributing}

Vedi [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Segnala le vulnerabilità in privato a security@qore.network, come descritto in [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licenza {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright 2026 QoreChain Association.
