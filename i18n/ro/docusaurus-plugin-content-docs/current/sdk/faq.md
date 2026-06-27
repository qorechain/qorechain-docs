---
slug: /sdk/faq
title: Întrebări frecvente și depanare
sidebar_label: Întrebări frecvente
sidebar_position: 8
---

# Întrebări frecvente și depanare

## Este mainnet-ul activ?

Da. Mainnet-ul este **activ** (chain id `qorechain-vladi`). Presetarea de testnet
(`qorechain-diana`) rămâne, de asemenea, disponibilă. Ambele presetări vin cu
valori implicite pentru endpoint-uri localhost; selectează rețeaua cu
`createClient({ network: "mainnet" })` și suprascrie `endpoints` cu URL-urile
nodului tău. Vezi [Rețea și endpoint-uri](/sdk/reference/network).

## De ce apelurile mele ajung la localhost?

`createClient()` folosește implicit endpoint-uri **localhost**. Pentru a comunica
cu un nod real, transmite un obiect `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

Calea de semnare (`connectTx`) necesită endpoint-ul de consens **`rpc`**;
citirile CosmWasm îl folosesc, de asemenea. Citirile REST folosesc `rest`;
apelurile EVM și `qor_` folosesc `evmRpc`.

## „Cannot find module 'viem'" / „'@solana/web3.js'"

Acestea sunt **dependențe peer** ale `@qorechain/evm` și, respectiv,
`@qorechain/svm`. Instalează-le în proiectul tău:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un apel de precompile aruncă „feature not present"

Precompile-urile EVM există doar pe noduri care rulează QoreChain EVM Engine. Pe
un nod EVM obișnuit, aceste apeluri eșuează. Dacă vizezi noduri eterogene,
încapsulează fiecare apel de precompile și tratează eroarea per apel.

## Sumele mele sunt greșite cu un factor de un milion

QOR are **10^6** unități de bază `uqor`. Folosește `toBase` / `fromBase` și fă
toate calculele în unități de bază:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Reține că runtime-ul EVM reprezintă QOR cu **18** zecimale (convenția EVM), ceea
ce este diferit de baza Cosmos `uqor` de 10^6.

## Ce pachete sunt publicate și unde?

Toate. Nucleul TypeScript (`@qorechain/sdk`) și adaptoarele EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`) sunt pe npm la `0.3.0`; clientul Python este
pe PyPI (`pip install qorechain-sdk` la `0.3.1`, import `qorsdk`); clientul Rust
este pe crates.io (`cargo add qorechain-sdk` la `0.3.0`); iar clientul Go este pe
module proxy (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
Vezi [Instalare](/sdk/install) pentru comenzile complete per limbaj.

## Mnemonicul meu este respins

SDK-ul validează atât lista de cuvinte BIP-39, **cât și** suma de control înainte
de a deriva orice cheie, astfel încât o frază scrisă greșit ridică o eroare în loc
să producă în tăcere contul greșit. Reverifică cuvintele; folosește
`validateMnemonic` pentru a testa o frază.

## Tranzacții hibride (PQC)

Semnarea/verificarea locală ML-DSA-87 și utilitarele de construire a tranzacțiilor
hibride sunt disponibile astăzi. Înainte ca o tranzacție hibridă să fie verificată
PQC on-chain, cheia publică PQC a semnatarului trebuie înregistrată
(`MsgRegisterPQCKey`), sau trebuie să setezi `includePqcPublicKey: true` pentru a
o încorpora în vederea înregistrării automate. Trimiterea hibridă completă este în
curs de finalizare pentru rețeaua activă. Vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc).
