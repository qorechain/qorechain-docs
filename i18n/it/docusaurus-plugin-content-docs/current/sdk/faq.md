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
EVM e `qor_` usano `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Sono **dipendenze peer** rispettivamente di `@qorechain/evm` e
`@qorechain/svm`. Installale nel tuo progetto:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Una chiamata a un precompile lancia "feature not present"

I precompile EVM esistono solo sui nodi che eseguono il QoreChain EVM Engine.
Su un nodo EVM semplice queste chiamate falliscono. Se punti a nodi
eterogenei, avvolgi ogni chiamata a un precompile e gestisci l'errore per
ciascuna chiamata.

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

Tutti. Il core TypeScript (`@qorechain/sdk`), gli adapter EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`), il kit React (`@qorechain/react`) e lo
scaffolder `create-qorechain-dapp` sono su npm alla versione `0.7.0`; il
client Python è su PyPI (`pip install qorechain-sdk` alla `0.7.0`, import
`qorsdk`); il client Go è sul module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.7.0`); e il client Java è su Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). Il client Rust è su crates.io
(`cargo add qorechain-sdk`) alla **ultima versione di crate pubblicata**, che
attualmente è in ritardo rispetto alla 0.7.0 — installala da crates.io o dal
repo. Vedi [Installazione](/sdk/install) per i comandi completi per ogni
linguaggio.

## Il mio mnemonic viene rifiutato

L'SDK valida sia la wordlist BIP-39 **sia** il checksum prima di derivare
qualsiasi chiave, così una frase con un errore di battitura genera
un'eccezione invece di produrre silenziosamente l'account sbagliato.
Ricontrolla le parole; usa `validateMnemonic` per testare una frase.

## Transazioni ibride (PQC)

L'invio ibrido (classico + ML-DSA-87) è **attivo e obbligatorio** sul percorso
Native — le transazioni Native solo classiche vengono rifiutate on-chain
(chain v3.1.95). Prima che una tx ibrida superi la verifica PQC, la chiave
pubblica PQC del firmatario deve essere registrata
(`MsgRegisterPQCKeyV2`), oppure puoi impostare
`includePqcPublicKey: true` per incorporarla e ottenere la registrazione
automatica al primo utilizzo. La chain accetta **solo** firme ML-DSA-87
deterministiche (l'SDK firma in modo deterministico per default dalla
versione 0.5.1); le firme hedged falliscono con codice `pqc` 21
(`hybrid_verify_failed`). Vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc).

## Le mie transazioni ibride falliscono a CheckTx con un errore di parsing della tx

Aggiorna l'SDK. Le versioni **0.6.0 e precedenti** serializzavano in JSON
l'estensione del tx-body `/qorechain.pqc.v1.PQCHybridSignature`, che il
decoder di tx della chain rifiuta a CheckTx. Dalla **0.6.1** l'estensione è
codificata in protobuf (il valore inizia con `0x08`) in tutti e cinque i
linguaggi — le transazioni ibride costruite con versioni più vecchie vengono
rifiutate on-chain, in ogni lane (incluso eth-native).

## La mia spesa tramite authenticator viene rifiutata con `authenticator_replay`

Il nonce è sbagliato. `MsgExecuteEVM.nonce` deve essere il nonce EVM
**corrente** dell'account (il relayer è un account diverso, quindi **non**
aggiungere 1); `MsgExecuteCosmos.nonce` è la **sequenza per authenticator**
per `(account, pubkey)`, un contatore di store separato. Recupera di nuovo il
valore e ri-firma. Gli altri errori dell'authenticator si decodificano con
`decodeTxError`: codici `abstractaccount` 5 (`spending_limit_exceeded`), 6
(`session_key_expired`) e 10 (`permission_denied`). Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators).
