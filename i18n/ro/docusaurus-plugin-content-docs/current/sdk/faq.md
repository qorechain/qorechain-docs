---
slug: /sdk/faq
title: Întrebări frecvente și depanare
sidebar_label: Întrebări frecvente
sidebar_position: 8
---

# Întrebări frecvente și depanare

## Este mainnet-ul activ?

Da. Mainnet-ul este **activ** (chain id `qorechain-vladi`). Presetul de testnet
(`qorechain-diana`) rămâne de asemenea disponibil. Ambele preseturi vin cu
endpoint-uri implicite pe localhost; selectați rețeaua cu
`createClient({ network: "mainnet" })` și suprascrieți `endpoints` cu URL-urile
nodurilor dvs. Vedeți
[Rețea și endpoint-uri](/sdk/reference/network).

## De ce apelurile mele merg către localhost?

`createClient()` folosește implicit endpoint-uri **localhost**. Pentru a
comunica cu un nod real, transmiteți un obiect `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Calea de semnare (`connectTx`) are nevoie de endpoint-ul de consens **`rpc`**;
citirile CosmWasm îl folosesc de asemenea. Citirile REST folosesc `rest`;
apelurile EVM și `qor_` folosesc `evmRpc`.

## „Cannot find module 'viem'" / „'@solana/web3.js'"

Acestea sunt **peer dependencies** pentru `@qorechain/evm` și respectiv
`@qorechain/svm`. Instalați-le în proiectul dvs.:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un apel de precompile aruncă „feature not present"

Precompile-urile EVM există doar pe nodurile care rulează QoreChain EVM Engine.
Pe un nod EVM obișnuit aceste apeluri eșuează. Dacă vizați noduri eterogene,
înveliți fiecare apel de precompile și tratați eroarea per apel.

## Sumele mele sunt greșite cu un factor de un milion

QOR are unități de bază `uqor` de **10^6**. Folosiți `toBase` / `fromBase` și
faceți toate calculele în unități de bază:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Rețineți că runtime-ul EVM reprezintă QOR cu **18** zecimale (convenția EVM),
ceea ce este diferit de baza `uqor` Native de 10^6.

## Ce pachete sunt publicate și unde?

Toate. Nucleul TypeScript (`@qorechain/sdk`), adaptoarele EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`), kitul React (`@qorechain/react`) și
scaffolder-ul `create-qorechain-dapp` sunt pe npm la `0.7.0`; clientul Python
este pe PyPI (`pip install qorechain-sdk` la `0.7.0`, import `qorsdk`);
clientul Go este pe module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.7.0`); iar clientul Java este pe Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). Clientul Rust este pe crates.io
(`cargo add qorechain-sdk`) la **cea mai recentă versiune de crate publicată**,
care momentan este în urma versiunii 0.7.0 — instalați de pe crates.io sau din
repo. Vedeți [Instalare](/sdk/install) pentru comenzile complete pentru fiecare
limbaj.

## Mnemonicul meu este respins

SDK-ul validează atât lista de cuvinte BIP-39, **cât și** suma de control
înainte de a deriva orice cheie, astfel încât o frază cu greșeli de tastare
aruncă o eroare în loc să producă în tăcere contul greșit. Verificați din nou
cuvintele; folosiți `validateMnemonic` pentru a testa o frază.

## Tranzacții hibride (PQC)

Trimiterea hibridă (clasic + ML-DSA-87) este **activă și obligatorie** pe calea
Native — tranzacțiile Native doar clasice sunt respinse on-chain (chain
v3.1.85). Înainte ca o tranzacție hibridă să treacă verificarea PQC, cheia
publică PQC a semnatarului trebuie să fie înregistrată
(`MsgRegisterPQCKeyV2`), sau puteți seta `includePqcPublicKey: true` pentru a o
încorpora în vederea înregistrării automate la prima utilizare. Lanțul acceptă
**doar** semnături ML-DSA-87 **deterministe** (SDK-ul semnează determinist în
mod implicit începând cu 0.5.1); semnăturile hedged eșuează cu `pqc` cod 21
(`hybrid_verify_failed`). Vedeți
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc).

## Tranzacțiile mele hibride eșuează la CheckTx cu o eroare de parsare a tranzacției

Actualizați SDK-ul. Versiunile **0.6.0 și anterioare** serializau în JSON
extensia de corp de tranzacție `/qorechain.pqc.v1.PQCHybridSignature`, pe care
decodorul de tranzacții al lanțului o respinge la CheckTx. Începând cu
**0.6.1** extensia este codificată protobuf (valoarea începe cu `0x08`) în
toate cele cinci limbaje — tranzacțiile hibride construite cu versiuni mai
vechi sunt respinse on-chain, pe fiecare cale (inclusiv eth-native).

## Cheltuirea mea prin authenticator este respinsă cu `authenticator_replay`

Nonce-ul este greșit. `MsgExecuteEVM.nonce` trebuie să fie nonce-ul EVM
**curent** al contului (relayer-ul este un cont diferit, deci **nu** adăugați
1); `MsgExecuteCosmos.nonce` este **secvența per-authenticator** pentru
`(account, pubkey)`, un contor de stocare separat. Reobțineți valoarea și
semnați din nou. Alte eșecuri ale authenticator-ului se decodează prin
`decodeTxError`: codurile `abstractaccount` 5 (`spending_limit_exceeded`),
6 (`session_key_expired`) și 10 (`permission_denied`). Vedeți
[Authenticators și cheltuire delegată](/sdk/guides/authenticators).
