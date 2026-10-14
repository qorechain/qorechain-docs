---
slug: /sdk/faq
title: FAQ e risoluzione dei problemi
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ e risoluzione dei problemi

## La mainnet è attiva?

Sì. La mainnet è **attiva** (chain id `qorechain-vladi`). Anche il preset
testnet (`qorechain-diana`) rimane disponibile. Entrambi i preset forniscono
endpoint predefiniti su localhost; seleziona la rete con
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
anche le letture CosmWasm lo usano. Le letture REST usano `rest`; le chiamate
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

Tutti. Il core TypeScript (`@qorechain/sdk`, 0.8.3), gli adapter EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, 0.8.0), il kit React (`@qorechain/react`,
0.8.3) e lo scaffolder `create-qorechain-dapp` (0.8.0) sono su npm; il
client Python è su PyPI (`pip install qorechain-sdk` alla 0.8.3, import
`qorsdk`); il client Go è sul module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.8.4`); il client Rust è su crates.io
(`cargo add qorechain-sdk`, 0.8.3); e il client Java è su Maven Central
(`io.github.qorechain:qorechain-sdk:0.8.3`). Vedi
[Installazione](/sdk/install) per i comandi completi per ogni
linguaggio.

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
chiave al primo utilizzo.
La chain accetta qualsiasi firma ML-DSA-87 valida secondo FIPS-204, hedged o
deterministica. L'SDK firma in modo deterministico per default (dalla versione
0.5.1) affinché una transazione abbia sempre la stessa firma e lo stesso hash di
tx. Se una tx ibrida fallisce con codice `pqc` 21 (`hybrid_verify_failed`), la
causa è la versione dei sign-bytes, il chain-id, una libreria PQC obsoleta o una
chiave non registrata, mai la firma hedged.
Entrambe le reti verificano la forma v2 dei sign-bytes, quindi usa l'SDK
**0.8.1 o successivo** e passa `rest` (oppure `signBytesVersion`): i builder
lanciano un errore su `qorechain-vladi` / `qorechain-diana` se manca uno dei due.
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

## La mia spesa tramite authenticator viene rifiutata con `authenticator_replay`

(Il modulo `abstractaccount` è disattivato su entrambe le reti oggi; una
spesa viene rifiutata con `abstract account module is disabled` prima che
venga controllato qualsiasi nonce. Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators). Le indicazioni
qui sotto valgono una volta abilitato il modulo.)

Il nonce è sbagliato. `MsgExecuteEVM.nonce` deve essere il nonce EVM
**corrente** dell'account (il relayer è un account diverso, quindi **non**
aggiungere 1); `MsgExecuteCosmos.nonce` è la **sequenza per authenticator**
per `(account, pubkey)`, un contatore di store separato. Recupera di nuovo il
valore e ri-firma. Gli altri errori dell'authenticator si decodificano con
`decodeTxError`: codici `abstractaccount` 5 (`spending_limit_exceeded`), 6
(`session_key_expired`) e 10 (`permission_denied`). Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators).
