---
slug: /qoresign/overview
title: Présentation de QoreSign
sidebar_label: Présentation
sidebar_position: 1
---

# QoreSign

QoreSign est une solution de signature hybride secp256k1 + ML-DSA-87 (FIPS 204)
pour les portefeuilles et les backends sur QoreChain.

QoreSign permet à un portefeuille autre que celui de QoreChain de dériver la clé
ML-DSA-87 d'un compte, de signer des transactions de la voie native avec les deux
clés, de vérifier localement des signatures hybrides, de simuler une transaction
avant de la signer et d'implémenter Sign In With QoreChain. C'est une couche
mince au-dessus des bindings
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) et elle n'ajoute
aucune primitive cryptographique qui lui soit propre.

La version actuelle est la **0.1.0**. Le code source, les exemples et les
vecteurs de test se trouvent dans le dépôt
[qorechain/qoresign](https://github.com/qorechain/qoresign).

## Ce que QoreSign fait sur chaque voie {#lanes}

| Voie | Ce que QoreSign fait aujourd'hui |
|---|---|
| **Native** (Cosmos SDK) | Signature et vérification hybrides. Le réseau exige par défaut la signature ML-DSA-87. |
| **EVM** | Mode « prêt pour le post-quantique » uniquement : le compte enregistre une clé ML-DSA-87 et ouvre, depuis la voie native, une fenêtre d'autorisation bornée. Les transactions Ethereum elles-mêmes ne portent aucune signature ML-DSA-87. |
| **SVM** | Pas encore ouverte sur le réseau (`LANE_NOT_AVAILABLE`). |

La signature EVM hybride nécessite d'abord une prise en charge PQC par voie
côté réseau. Voir
[Portefeuilles EVM : mode prêt pour le post-quantique](/qoresign/guides/evm-quantum-ready).

## Paquets {#packages}

| Langage | Paquet | Installation |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

Les cinq implémentations se vérifient elles-mêmes avec les mêmes
[vecteurs de test](/qoresign/vectors).

## Exemple {#example}

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

Les utilitaires réseau (état des clés, simulation avec variations de solde,
diffusion, vérification de connexion auprès de la chaîne) se trouvent dans
`@qorechain/qoresign/network`.

## Documentation {#documentation}

- [Démarrage rapide](/qoresign/quickstart) : dérivez des clés, signez et
  vérifiez une transaction hybride en quelques minutes.
- Guides
  - [Ajouter la signature hybride à un portefeuille compatible Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain : vérification côté serveur](/qoresign/guides/sign-in)
  - [Portefeuilles EVM : mode prêt pour le post-quantique](/qoresign/guides/evm-quantum-ready)
  - [Dérivation de clés : clés canoniques et brouillon HD](/qoresign/guides/key-derivation)
  - [Tailles et transport](/qoresign/guides/sizes-and-transport)
- Spécifications
  - [Signature de transactions hybride v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Signature de messages v1](/qoresign/spec/message-signing-v1)
  - [Dérivation de clés ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vecteurs de test](/qoresign/vectors)
- [Exemples](https://github.com/qorechain/qoresign/tree/main/examples)

Référence de l'API : dans un clone du dépôt, exécutez `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign` (Rust) ou
`go doc github.com/qorechain/qoresign/go` (Go). Les bindings Swift et Kotlin
reprennent l'API Rust ; voir les README
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) et
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin).

## Périmètre {#scope}

QoreSign signe localement. Il ne détient pas de clés pour vous, ne fait pas de
signature à seuil ni de MPC, et ne signe pas sur des portefeuilles matériels.
Les implémentations d'ML-DSA-87 et de secp256k1 proviennent de `qorechain-pqc`
(construit sur `@noble/post-quantum`, `fips204` et Cloudflare CIRCL) ainsi que de
`@noble/curves`, `k256` et `decred/secp256k1`.

## Versionnage {#versioning}

QoreSign est en version pré-1.0 : les versions mineures peuvent modifier l'API, et
chaque changement non rétrocompatible est listé dans le
[journal des modifications](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md).
Les formats de transmission sont versionnés séparément (les spécifications `v1`
et `vectors/qoresign-v1.json`) et ne changent pas au sein d'une version.

## Contribuer et sécurité {#contributing}

Voir
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Signalez les vulnérabilités en privé, comme décrit dans
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licence {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
