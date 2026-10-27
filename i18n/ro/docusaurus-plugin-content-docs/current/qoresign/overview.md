---
slug: /qoresign/overview
title: Prezentare generală QoreSign
sidebar_label: Prezentare generală
sidebar_position: 1
---

# QoreSign

QoreSign este semnarea hibridă secp256k1 + ML-DSA-87 (FIPS 204) pentru
portofele și backend-uri pe QoreChain.

QoreSign permite unui portofel diferit de cel propriu al QoreChain să deriveze
cheia ML-DSA-87 a unui cont, să semneze cu ambele chei tranzacțiile de pe lane-ul
nativ, să verifice local semnăturile hibride, să simuleze o tranzacție înainte
de semnare și să implementeze Sign In With QoreChain. Este un strat subțire
peste bindingurile [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
și nu adaugă primitive criptografice proprii.

Versiunea curentă este **0.1.0**. Sursa, exemplele și vectorii de test se găsesc
în depozitul [qorechain/qoresign](https://github.com/qorechain/qoresign).

## Ce face QoreSign pe fiecare lane {#lanes}

| Lane | Ce face QoreSign astăzi |
|---|---|
| **Nativ** (Cosmos SDK) | Semnare și verificare hibridă. Rețeaua cere implicit semnătura ML-DSA-87. |
| **EVM** | Doar modul pregătit pentru era cuantică: contul înregistrează o cheie ML-DSA-87 și deschide, de pe lane-ul nativ, o fereastră de autorizare limitată. Tranzacțiile Ethereum în sine nu poartă nicio semnătură ML-DSA-87. |
| **SVM** | Încă neactivat în rețea (`LANE_NOT_AVAILABLE`). |

Semnarea hibridă EVM necesită mai întâi suport PQC per lane în rețea. Vezi
[Portofele EVM: modul pregătit pentru era cuantică](/qoresign/guides/evm-quantum-ready).

## Pachete {#packages}

| Limbaj | Pachet | Instalare |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

Toate cele cinci implementări se verifică singure pe baza acelorași
[vectori de test](/qoresign/vectors).

## Exemplu {#example}

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

Helperii de rețea (starea cheii, simulare cu variațiile de sold, difuzare,
verificarea sign-in-ului față de lanț) se află în `@qorechain/qoresign/network`.

## Documentație {#documentation}

- [Pornire rapidă](/qoresign/quickstart): derivați chei, semnați și verificați
  o tranzacție hibridă în câteva minute.
- Ghiduri
  - [Adăugați semnarea hibridă într-un portofel compatibil Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: verificarea pe server](/qoresign/guides/sign-in)
  - [Portofele EVM: modul pregătit pentru era cuantică](/qoresign/guides/evm-quantum-ready)
  - [Derivarea cheilor: chei canonice și draftul HD](/qoresign/guides/key-derivation)
  - [Dimensiuni și transport](/qoresign/guides/sizes-and-transport)
- Specificații
  - [Semnarea hibridă a tranzacțiilor v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Semnarea mesajelor v1](/qoresign/spec/message-signing-v1)
  - [Derivarea cheilor ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vectori de test](/qoresign/vectors)
- [Exemple](https://github.com/qorechain/qoresign/tree/main/examples)

Referința API: într-o clonă a depozitului, rulați `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign` (Rust) sau
`go doc github.com/qorechain/qoresign/go` (Go). Bindingurile Swift și Kotlin
oglindesc API-ul Rust; vedeți fișierele README
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) și
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin).

## Domeniu de aplicare {#scope}

QoreSign semnează local. Nu păstrează chei în locul dumneavoastră, nu face
semnare threshold sau MPC și nu semnează pe portofele hardware. Implementările
ML-DSA-87 și secp256k1 provin din `qorechain-pqc` (construit pe
`@noble/post-quantum`, `fips204` și Cloudflare CIRCL) și din `@noble/curves`,
`k256` și `decred/secp256k1`.

## Versionare {#versioning}

QoreSign este pre-1.0: versiunile minore pot modifica API-ul, iar fiecare
modificare incompatibilă este listată în
[changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md).
Formatele de transmisie sunt versionate separat (specificațiile `v1` și
`vectors/qoresign-v1.json`) și nu se schimbă în cadrul unei versiuni.

## Contribuții și securitate {#contributing}

Vedeți
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Raportați vulnerabilitățile în privat, așa cum este descris în
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licență {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
