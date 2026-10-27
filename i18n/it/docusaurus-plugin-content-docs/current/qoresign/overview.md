---
slug: /qoresign/overview
title: Panoramica di QoreSign
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreSign

QoreSign è la firma ibrida secp256k1 + ML-DSA-87 (FIPS 204) per wallet e backend
su QoreChain.

QoreSign permette a un wallet diverso da quello di QoreChain di derivare la
chiave ML-DSA-87 di un account, firmare le transazioni sulla corsia Native con
entrambe le chiavi, verificare localmente le firme ibride, simulare una
transazione prima di firmarla e implementare Sign In With QoreChain. È un sottile
strato sopra i binding
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) e non aggiunge
alcuna primitiva crittografica propria.

La versione attuale è la **0.1.0**. Il codice sorgente, gli esempi e i vettori di
test si trovano nel repository
[qorechain/qoresign](https://github.com/qorechain/qoresign).

## Che cosa fa QoreSign su ciascuna corsia {#lanes}

| Corsia | Che cosa fa oggi QoreSign |
|---|---|
| **Native** (Cosmos SDK) | Firma e verifica ibride. Per impostazione predefinita la rete richiede la firma ML-DSA-87. |
| **EVM** | Solo modalità quantum-ready: l'account registra una chiave ML-DSA-87 e apre dalla corsia Native una finestra di autorizzazione limitata. Le transazioni Ethereum stesse non portano alcuna firma ML-DSA-87. |
| **SVM** | Non ancora aperta sulla rete (`LANE_NOT_AVAILABLE`). |

La firma ibrida su EVM richiede prima il supporto PQC per singola corsia nella
rete. Vedi [Wallet EVM: modalità quantum-ready](/qoresign/guides/evm-quantum-ready).

## Pacchetti {#packages}

| Linguaggio | Pacchetto | Installazione |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

Tutte e cinque le implementazioni si verificano rispetto agli stessi
[vettori di test](/qoresign/vectors).

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

Gli helper di rete (stato delle chiavi, simulazione con variazioni di saldo,
broadcast, verifica del sign-in rispetto alla chain) si trovano in
`@qorechain/qoresign/network`.

## Documentazione {#documentation}

- [Avvio rapido](/qoresign/quickstart): deriva le chiavi, firma e verifica una
  transazione ibrida in pochi minuti.
- Guide
  - [Aggiungere la firma ibrida a un wallet compatibile con Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: verifica lato server](/qoresign/guides/sign-in)
  - [Wallet EVM: modalità quantum-ready](/qoresign/guides/evm-quantum-ready)
  - [Derivazione delle chiavi: chiavi canoniche e bozza HD](/qoresign/guides/key-derivation)
  - [Dimensioni e trasporto](/qoresign/guides/sizes-and-transport)
- Specifiche
  - [Firma ibrida delle transazioni v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Firma di messaggi v1](/qoresign/spec/message-signing-v1)
  - [Derivazione delle chiavi ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vettori di test](/qoresign/vectors)
- [Esempi](https://github.com/qorechain/qoresign/tree/main/examples)

Riferimento API: in un clone del repository, esegui `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign` (Rust) oppure
`go doc github.com/qorechain/qoresign/go` (Go). I binding Swift e Kotlin
rispecchiano l'API Rust; vedi i README
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) e
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin).

## Ambito {#scope}

QoreSign firma in locale. Non custodisce le chiavi per te, non esegue firme
threshold o MPC e non firma su hardware wallet. Le implementazioni di ML-DSA-87 e
secp256k1 provengono da `qorechain-pqc` (costruito su `@noble/post-quantum`,
`fips204` e Cloudflare CIRCL) e da `@noble/curves`, `k256` e
`decred/secp256k1`.

## Versionamento {#versioning}

QoreSign è pre-1.0: le versioni minori possono modificare l'API e ogni modifica
incompatibile è elencata nel
[changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). I
formati wire sono versionati separatamente (le specifiche `v1` e
`vectors/qoresign-v1.json`) e non cambiano all'interno di una versione.

## Contributi e sicurezza {#contributing}

Vedi
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Segnala le vulnerabilità in privato come descritto in
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licenza {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
