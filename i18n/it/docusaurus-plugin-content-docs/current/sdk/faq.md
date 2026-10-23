---
slug: /sdk/faq
title: FAQ e risoluzione dei problemi
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ e risoluzione dei problemi

## La mainnet è attiva?

Sì. La mainnet è **attiva** (chain id `qorechain-vladi`, attiva dal 7 giugno
2026) esegue la versione della chain v3.2.4 (applicata all'altezza 3.742.566 il 23 ottobre 2026, proposta di governance 13); la testnet esegue la v3.2.4 dal 19 ottobre 2026. Anche il
preset testnet (`qorechain-diana`) rimane disponibile. Entrambi i preset
forniscono endpoint predefiniti su localhost; seleziona la rete con
`createClient({ network: "mainnet" })` e sovrascrivi `endpoints` con gli URL
dei tuoi nodi. Vedi [Rete ed endpoint](/sdk/reference/network).

## Perché le mie chiamate finiscono su localhost?

`createClient()` usa per default gli endpoint **localhost**. Per parlare con
un nodo reale, passa un oggetto `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Il percorso di firma (`connectTx`) richiede l'endpoint di consenso **`rpc`**;
anche le letture QoreChain Native lo usano. Le letture REST usano `rest`; le chiamate
EVM usano `evmRpc` (e anche le chiamate `qor_`, su un nodo che serve quel
namespace). Gli URL della mainnet si trovano nel
[riferimento di rete](/sdk/reference/network#public-endpoints).

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Sono **dipendenze peer** rispettivamente di `@qorechain/evm` e
`@qorechain/svm`. Installale nel tuo progetto:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Una chiamata a un precompile lancia "returned no data" / "feature not present"

I precompile EVM di QoreChain sono compilati nel nodo ma **non sono ancora
attivi** su mainnet né su testnet: rispondono solo dove i loro indirizzi sono
elencati nel parametro `active_static_precompiles` del modulo EVM, e quell'elenco
è vuoto su entrambe le reti. Oggi la chiamata restituisce dati vuoti, quindi viem
segnala `returned no data ("0x")` e l'helper lancia un errore anche sulle reti
pubbliche (vedi
[Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status)).
Su un nodo EVM semplice le chiamate falliscono allo stesso modo. Controlla
`GET /cosmos/evm/vm/v1/params` e avvolgi ogni chiamata a un precompile in modo
da gestire l'errore per ciascuna chiamata.

## La mia chiamata `client.qor` fallisce con -32601

`client.qor` chiama il namespace JSON-RPC `qor_`, che nessuna build di nodo
rilasciata serve; `rpc_modules` sugli endpoint EVM pubblici elenca solo `eth`,
`net`, `rpc`, `txpool` e `web3`. Usa invece una route REST, ad esempio
`GET /qorechain/pqc/v1/account/{address}` (stato della chiave PQC) oppure
`GET /qorechain/burn/v1/stats`, tramite `client.rest.get(...)`. Vedi
[il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

## I miei importi sono sballati di un fattore un milione

QOR ha **10^6** unità base `uqor`. Usa `toBase` / `fromBase` e fai tutti i
calcoli in unità base:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Nota che il runtime EVM rappresenta QOR con **18** decimali (convenzione
EVM), che è distinto dalla base Native `uqor` di 10^6.

## Quali pacchetti sono pubblicati, e dove?

Tutti (verificato il 21 ottobre 2026). Il core TypeScript (`@qorechain/sdk`, 0.9.0),
il kit React (`@qorechain/react`, 0.9.0), lo scaffolder `create-qorechain-dapp`
(0.9.0) e gli adapter EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, 0.8.0) sono su
npm; il client Python è su PyPI (`pip install qorechain-sdk` alla 0.9.0, import
`qorsdk`); il client Go è sul module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`); il client Rust è su
crates.io (`cargo add qorechain-sdk`, 0.9.0); e il client Java è su Maven
Central (`io.github.qorechain:qorechain-sdk:0.9.1`; gli altri linguaggi sono alla 0.9.0). Vedi [Installazione](/sdk/install)
per i comandi completi per ogni linguaggio.

## Il mio mnemonic viene rifiutato

L'SDK valida sia la wordlist BIP-39 **sia** il checksum prima di derivare
qualsiasi chiave, così una frase con un errore di battitura genera
un'eccezione invece di produrre silenziosamente l'account sbagliato.
Ricontrolla le parole; usa `validateMnemonic` per testare una frase.

## Transazioni ibride (PQC)

L'invio ibrido (classico + ML-DSA-87) è **attivo e obbligatorio** sul percorso
Native: le transazioni Native solo classiche vengono rifiutate on-chain
(chain v3.2.0).
Prima che una tx ibrida superi la verifica PQC, la chiave pubblica PQC del
firmatario deve essere **registrata esplicitamente** con
`MsgRegisterPQCKeyV2` (una transazione firmata in modo classico ed esente dalla
firma ibrida); incorporare la chiave pubblica nell'estensione
(`includePqcPublicKey: true`) **non** la registra, e la chain non registra una
chiave al primo utilizzo. In TypeScript, passa al client la coppia di chiavi
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) e ogni transazione che
invia viene firmata in modalità ibrida.
La chain accetta qualsiasi firma ML-DSA-87 valida secondo FIPS-204, hedged o
deterministica. L'SDK firma in modo deterministico per default (dalla versione
0.5.1) affinché una transazione abbia sempre la stessa firma e lo stesso hash di
tx. Se una tx ibrida fallisce con codice `pqc` 21 (`hybrid_verify_failed`), la
causa è la versione dei sign-bytes, il chain-id, una libreria PQC obsoleta o una
chiave non registrata o diversa, mai la firma hedged.
Entrambe le reti verificano la forma v2 dei sign-bytes, quindi usa l'SDK
**0.8.1 o successivo** (la 0.9.0 è quella attuale) e passa `rest` (oppure
`signBytesVersion`): i builder lanciano un errore su `qorechain-vladi` /
`qorechain-diana` se manca uno dei due.
Vedi
[Risoluzione del codice 21](/developer-guide/post-quantum-signing#code-21) e
[Account e firma PQC](/sdk/concepts/accounts-pqc).

## La mia transazione EVM viene rifiutata con "no open EVM authorisation window"

Dalla chain v3.2.0 la lane EVM ammette una transazione solo da un account che
abbia una chiave PQC registrata e una finestra di autorizzazione aperta.
Registra una chiave, apri una finestra, poi invia. Vedi
[Finestra di autorizzazione EVM](/sdk/guides/evm#evm-window). Con l'SDK,
`classifyEvmWindowRejection(err)` restituisce `"no-pqc-key"`, `"no-window"`,
`"exhausted"` oppure `"invalid"`.

## Le mie transazioni ibride falliscono a CheckTx con un errore di parsing della tx

Aggiorna l'SDK. Le versioni **0.6.0 e precedenti** serializzavano in JSON
l'estensione del tx-body `/qorechain.pqc.v1.PQCHybridSignature`, che il
decoder di tx della chain rifiuta a CheckTx. Dalla **0.6.1** l'estensione è
codificata in protobuf (il valore inizia con `0x08`) in tutti e cinque i
linguaggi — le transazioni ibride costruite con versioni più vecchie vengono
rifiutate on-chain, in ogni lane (incluso eth-native).

## Con quali versioni della chain funziona l'SDK?

L'SDK **0.9.0** è la release client per la chain v3.2.2 e v3.2.3: transa sulla
mainnet e testnet **v3.2.4** (mainnet dal 23 ottobre 2026), e ha builder per la prova di
possesso facoltativa alla registrazione (allegata automaticamente da
`ensurePqcRegistered` una volta che la rete ha applicato la v3.2.3), per le
finestre EVM con ambito limitato e per i messaggi di consenso EIP-7702.
L'SDK **0.8.1 o successivo** transa anch'esso su entrambe le reti (la forma v2
dei sign-bytes ibridi, la registrazione, gli invii ibridi e la finestra EVM
funzionano senza modifiche), ma non ha nessuno di quei builder: usa la CLI per
quelli (vedi [Versioni precedenti alla 0.9.0](/sdk/install#before-090)). La
v3.2.4 è attiva sulla testnet dal 19 ottobre 2026 e sulla mainnet dal 23 ottobre 2026 (altezza 3.742.566,
proposta di governance 13); l'SDK non imposta alcun campo della v3.2.4, quindi le sue
transazioni sono valide prima e dopo l'aggiornamento.

## La registrazione della mia chiave PQC è stata rifiutata ma la fee è stata prelevata

Una registrazione per un account che detiene già una chiave viene rifiutata
dalla chain dopo che la fee è stata detratta. `ensurePqcRegistered` nella 0.9.0
legge prima `GET /qorechain/pqc/v1/account/{address}` (passa `rest`), salta la
registrazione quando la chiave di questa coppia di chiavi è registrata, e lancia
`PqcKeyMismatchError` quando ne è registrata una diversa. Le release precedenti
non controllavano prima, a meno che tu non passassi di tuo conto
`status: { registered: found }`, dove `found` proviene da quella route. Dalla
v3.2.3 la chain rifiuta inoltre chiavi deboli, degeneri e riutilizzate; le
chiavi da `derivePqcCanonical` o `tx pqc gen-key` vanno bene.

## `create-qorechain-dapp` installa un SDK che non può firmare

Solo la versione 0.8.0 dello scaffolder lo faceva: scriveva intervalli `^0.3.0`
per `@qorechain/sdk` e `@qorechain/evm`, e un intervallo con caret su una
versione 0.x resta dentro la 0.3. La versione 0.9.0 genera lo scaffolding
sull'SDK attuale; se hai usato la 0.8.0, esegui `npm i @qorechain/sdk@latest`
(e `@qorechain/evm@latest`) dopo lo scaffolding.

## `VERSION` dice 0.8.0 ma ho installato la 0.8.3

La costante esportata `VERSION` della 0.8.3 non era stata aggiornata e riporta
`0.8.0`; dalla 0.9.0 corrisponde al pacchetto. Nelle release precedenti leggi la
versione installata da `package.json`.

## La mia spesa tramite authenticator viene rifiutata con `authenticator_replay`

(Il modulo `abstractaccount` è disattivato su entrambe le reti oggi; una
spesa viene rifiutata con `abstract account module is disabled` prima che
venga controllato qualsiasi nonce. Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators). Le indicazioni
qui sotto valgono una volta abilitato il modulo.)

Il nonce è sbagliato. Sia `MsgExecuteEVM.nonce` sia `MsgExecuteCosmos.nonce` sono
la **sequenza dell'authenticator** della chiave collegata per `(account, pubkey)`:
un contatore che la chain mantiene per ogni chiave collegata, parte da 0 e viene
incrementato a ogni esecuzione riuscita. **Non** è il nonce EVM dell'account, e
per ora non esiste alcuna query per esso, quindi tienine traccia per ogni chiave
collegata. Dalla v3.2.3 la lane EVM firma anche `evmAuthSignBytesV2`, che lega il
gas limit della chiamata (`resolveEvmAuthDigestVersion` sceglie la forma). Usa il
contatore di cui tieni traccia per quella chiave e ri-firma.

Gli altri errori dell'authenticator si decodificano con `decodeTxError`: codici
`abstractaccount` 5 (`spending_limit_exceeded`), 6 (`session_key_expired`) e 10
(`permission_denied`). Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators).
