---
slug: /sdk/faq
title: FAQ e risoluzione dei problemi
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ e risoluzione dei problemi

## La mainnet è attiva?

Sì. La mainnet è **attiva** (chain id `qorechain-vladi`, attiva dal 7 giugno
2026) esegue la versione della chain v3.2.6 (applicata all'altezza 4.020.000 il 4 novembre 2026, proposta di governance 15; la v3.2.5 è stata applicata all'altezza 3.906.833 il 29 ottobre 2026 e la v3.2.4 all'altezza 3.742.566 il 23 ottobre 2026); la testnet esegue la v3.2.6 dal 27 ottobre 2026, la v3.2.7 dal 6 novembre e la v3.2.8 dal 12 novembre 2026 (altezza 9.929.500; non è sulla mainnet, senza data). Anche il
preset testnet (`qorechain-diana`) rimane disponibile. Dall'SDK 0.12.0 entrambi i preset
usano per default gli endpoint pubblici; seleziona la rete con
`createClient({ network: "mainnet" })` e sovrascrivi `endpoints` solo per il
tuo nodo. Vedi [Rete ed endpoint](/sdk/reference/network).

## Perché le mie chiamate finiscono su localhost?

Stai usando un SDK **precedente alla 0.12.0**, i cui preset usano per default gli endpoint **localhost**:
aggiorna, oppure passa un oggetto `endpoints`. Dalla 0.12.0 `createClient()` e
`createClient({ network: "mainnet" })` usano gli endpoint pubblici, e il preset
`localnet` è quello che usa localhost.

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Se invece ricevi "endpoint ... is not configured for the mainnet preset", la chiamata
ha bisogno di un endpoint che i preset pubblici non impostano (gRPC, un RPC SVM, il
WebSocket EVM della mainnet); passalo in `endpoints`.

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

I precompile EVM di QoreChain sono compilati nel nodo ma **non sono attivi
sulla mainnet**, e sulla testnet ne sono attivi solo tre: rispondono solo dove i
loro indirizzi sono elencati nel parametro `active_static_precompiles` del modulo
EVM. Quell'elenco è vuoto sulla mainnet; sulla testnet contiene i precompile PQC
verify (`0x…0A01`), PQC key status (`0x…0A02`) e dei parametri di consenso
(`0x…0C01`) (verificato il 27 ottobre 2026; l'elenco della testnet conteneva anche il bridge cross-VM `0x…0901` dal 4 novembre e il 7 novembre 2026, attivo con una allowlist (testato con `eth_call`), e l'elenco della mainnet era ancora vuoto), quindi la coppia AI lì
non risponde ancora nulla. Dove un precompile è inattivo la
chiamata restituisce dati vuoti, quindi viem segnala `returned no data ("0x")` e
l'helper lancia un errore (vedi
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

Tutti (verificato l'11 novembre 2026). Il core TypeScript (`@qorechain/sdk`, 0.13.0),
il kit React (`@qorechain/react`, 0.13.0), lo scaffolder `create-qorechain-dapp`
(0.13.1, una patch solo per i template sopra l'SDK 0.13.0) e gli adapter EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, 0.13.0) sono su
npm; il client Python è su PyPI (`pip install qorechain-sdk` alla 0.13.0, import
`qorsdk`); il client Go è sul module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0`); il client Rust è su
crates.io (`cargo add qorechain-sdk`, 0.13.0); e il client Java è su Maven
Central (`io.github.qorechain:qorechain-sdk`, JDK 17 o successivo), dove la 0.13.0 è
pubblicata (verificato l'11 novembre 2026). Vedi [Installazione](/sdk/install)
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
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0 o successivo) e ogni transazione che
invia viene firmata in modalità ibrida.
La chain accetta qualsiasi firma ML-DSA-87 valida secondo FIPS-204, hedged o
deterministica. L'SDK firma in modo deterministico per default (dalla versione
0.5.1) affinché una transazione abbia sempre la stessa firma e lo stesso hash di
tx. Se una tx ibrida fallisce con codice `pqc` 21 (`hybrid_verify_failed`), la
causa è la versione dei sign-bytes, il chain-id, una libreria PQC obsoleta o una
chiave non registrata o diversa, mai la firma hedged.
Entrambe le reti verificano la forma v2 dei sign-bytes, quindi usa l'SDK
**0.8.1 o successivo** (la 0.13.0 è quella attuale) e passa `rest` (oppure
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

L'SDK **0.12.0** è la release client per la chain **v3.2.5** (mainnet dal 29 ottobre
2026 all'altezza 3.906.833; la testnet dal 26 ottobre). La mainnet esegue la v3.2.6
(dal 4 novembre) e la testnet la v3.2.8 (dal 12 novembre; la v3.2.7 dal 6 novembre, la v3.2.6 dal 27 ottobre); il formato di firma non è
cambiato fino alla v3.2.6, quindi la 0.12.0 funziona sulla mainnet. La 0.12.0 non ha builder per le aggiunte della v3.2.7 (registrazione del multisig PQC, la modalità di firma textual, l'APR, l'identità del cluster e i messaggi per la verification key), e il suo percorso di firma non è stato ricontrollato rispetto alla testnet v3.2.7; per quelle usa la CLI. Aggiunge la regola esatta del gas per le
transazioni ibride, i builder e la lettura del registro delle chiavi ML-KEM, le letture
degli account astratti e i builder verificati dei parametri di governance (vedi
[Novità della 0.12.0](/sdk/install#whats-new-0120)), in aggiunta a ciò che la 0.10.0 ha
aggiunto per la v3.2.4 (i builder e le letture dello staking-tier, `fetchAuthNonce` e le
letture delle funzionalità di protocollo, vedi
[Cosa ha aggiunto la 0.10.0](/sdk/install#whats-new-0100)) e la 0.9.0 per la v3.2.2 e la v3.2.3: builder per la prova di
possesso facoltativa alla registrazione (allegata automaticamente da
`ensurePqcRegistered` una volta che la rete ha applicato la v3.2.3), per le
finestre EVM con ambito limitato e per i messaggi di consenso EIP-7702.
L'SDK **0.8.1 o successivo** transa anch'esso su entrambe le reti (la forma v2
dei sign-bytes ibridi, la registrazione, gli invii ibridi e la finestra EVM
funzionano senza modifiche), ma non ha nessuno di quei builder: usa la CLI per
quelli (vedi [Versioni precedenti alla 0.9.0](/sdk/install#before-090)). Il
formato di firma non è cambiato nella v3.2.4, nella v3.2.5 né nella v3.2.6. La mainnet esegue la v3.2.6 e la testnet la v3.2.8 (la testnet ha applicato la
v3.2.5 il 26 ottobre 2026, la v3.2.6 il 27 ottobre, la v3.2.7 il 6 novembre e la v3.2.8 il 12 novembre; la mainnet ha applicato la v3.2.5 il 29 ottobre e la v3.2.6 il 4 novembre). L'SDK 0.10.0 e la 0.9.0 continuano a funzionare su di esse ma non hanno builder per
le aggiunte della v3.2.5 (il registro delle chiavi ML-KEM, la regola esatta del gas); con quelle release usa la CLI, oppure passa alla 0.13.0. La 0.12.0 è stata costruita e verificata contro la v3.2.5.

## La registrazione della mia chiave PQC è stata rifiutata ma la fee è stata prelevata

Una registrazione per un account che detiene già una chiave viene rifiutata
dalla chain dopo che la fee è stata detratta. `ensurePqcRegistered` nella 0.9.0 e successive
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
versione 0.x resta dentro la 0.3. Dalla versione 0.9.0 in poi lo scaffolding
è generato sull'SDK attuale; se hai usato la 0.8.0, esegui `npm i @qorechain/sdk@latest`
(e `@qorechain/evm@latest`) dopo lo scaffolding.

## `VERSION` dice 0.8.0 ma ho installato la 0.8.3

La costante esportata `VERSION` della 0.8.3 non era stata aggiornata e riporta
`0.8.0`; dalla 0.9.0 corrisponde al pacchetto. Nelle release precedenti leggi la
versione installata da `package.json`.

## La mia spesa tramite authenticator viene rifiutata con `authenticator_replay`

(Il modulo `abstractaccount` è disattivato sulla mainnet; una spesa lì viene
rifiutata con `abstract account module is disabled` prima che venga controllato
qualsiasi nonce. Sulla testnet è abilitato. Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators). Le indicazioni
qui sotto valgono ovunque il modulo sia abilitato.)

Il nonce è sbagliato. Sia `MsgExecuteEVM.nonce` sia `MsgExecuteCosmos.nonce` sono
la **sequenza dell'authenticator** della chiave collegata per `(account, pubkey)`:
un contatore che la chain mantiene per ogni chiave collegata, parte da 0 e viene
incrementato a ogni esecuzione riuscita. **Non** è il nonce EVM dell'account, e
leggilo con `fetchAuthNonce` (SDK 0.10.0 o successivo, chain v3.2.4 o successiva), oppure tienine traccia per ogni chiave
collegata nelle versioni precedenti. Dalla v3.2.3 la lane EVM firma anche `evmAuthSignBytesV2`, che lega il
gas limit della chiamata (`resolveEvmAuthDigestVersion` sceglie la forma). Usa il
contatore che leggi (o di cui tieni traccia) per quella chiave e ri-firma.

Gli altri errori dell'authenticator si decodificano con `decodeTxError`: codici
`abstractaccount` 5 (`spending_limit_exceeded`), 6 (`session_key_expired`) e 10
(`permission_denied`). Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators).
