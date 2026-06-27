---
slug: /sdk/faq
title: FAQ e risoluzione dei problemi
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ e risoluzione dei problemi

## La mainnet è attiva?

Sì. La mainnet è **attiva** (chain id `qorechain-vladi`). Anche il preset testnet
(`qorechain-diana`) rimane disponibile. Entrambi i preset includono valori predefiniti
per gli endpoint localhost; seleziona la rete con `createClient({ network: "mainnet" })` e
sostituisci `endpoints` con gli URL del tuo nodo. Vedi
[Rete ed endpoint](/sdk/reference/network).

## Perché le mie chiamate vanno su localhost?

`createClient()` usa per impostazione predefinita gli endpoint **localhost**. Per comunicare con un nodo reale,
passa un oggetto `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

Il percorso di firma (`connectTx`) richiede l'endpoint di consenso **`rpc`**; anche le
letture CosmWasm lo usano. Le letture REST usano `rest`; le chiamate EVM e `qor_` usano `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Queste sono **peer dependency** rispettivamente di `@qorechain/evm` e `@qorechain/svm`.
Installale nel tuo progetto:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Una chiamata a un precompile genera "feature not present"

I precompile EVM esistono solo sui nodi che eseguono il QoreChain EVM Engine. Su un
normale nodo EVM queste chiamate falliscono. Se hai come destinazione nodi eterogenei, racchiudi ogni
chiamata a un precompile e gestisci l'errore per ciascuna chiamata.

## I miei importi sono sbagliati di un fattore di un milione

QOR ha **10^6** unità base `uqor`. Usa `toBase` / `fromBase` e svolgi tutti i
calcoli in unità base:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Nota che il runtime EVM rappresenta QOR con **18** decimali (convenzione EVM), che
è distinto dalla base `uqor` di Cosmos pari a 10^6.

## Quali pacchetti sono pubblicati, e dove?

Tutti. Il core TypeScript (`@qorechain/sdk`) e gli adapter EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`) sono su npm alla versione `0.3.0`; il client Python è
su PyPI (`pip install qorechain-sdk` alla `0.3.1`, importa `qorsdk`); il client Rust
è su crates.io (`cargo add qorechain-sdk` alla `0.3.0`); e il client Go
è sul module proxy (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
Vedi [Installazione](/sdk/install) per i comandi completi per ciascun linguaggio.

## Il mio mnemonic viene rifiutato

L'SDK convalida sia la wordlist BIP-39 **sia** il checksum prima di derivare
qualsiasi chiave, quindi una frase con un refuso solleva un errore invece di produrre silenziosamente l'account
sbagliato. Ricontrolla le parole; usa `validateMnemonic` per testare una frase.

## Transazioni ibride (PQC)

La firma/verifica ML-DSA-87 locale e gli helper per la costruzione di transazioni ibride sono disponibili
oggi. Prima che una transazione ibrida venga verificata PQC on-chain, la chiave pubblica PQC del firmatario
deve essere registrata (`MsgRegisterPQCKey`), oppure devi impostare
`includePqcPublicKey: true` per incorporarla ai fini dell'auto-registrazione. L'invio
completo delle transazioni ibride è in fase di finalizzazione per la rete live. Vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc).
