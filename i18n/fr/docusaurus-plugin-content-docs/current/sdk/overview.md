---
slug: /sdk/overview
title: Présentation du SDK QoreChain
sidebar_label: Présentation
sidebar_position: 1
---

# SDK QoreChain

Le SDK QoreChain est le kit de développement multilangage officiel pour créer
des applications décentralisées sur **QoreChain** — un réseau Layer 1
triple-VM et résistant au quantique.

Cette documentation explique comment installer le SDK, se connecter au réseau,
lire l'état on-chain, dériver des comptes, signer et envoyer des transactions, et
travailler avec chacune des machines virtuelles de QoreChain.

## Qu'est-ce que QoreChain ?

QoreChain est une blockchain Layer 1 dotée de trois environnements d'exécution
de smart contracts de première classe sur une seule chaîne :

- **CosmWasm** — smart contracts Wasm via le Cosmos SDK.
- **QoreChain EVM Engine** — exécution compatible Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un environnement d'exécution compatible Solana avec un JSON-RPC de
  style Solana.

Les comptes, soldes et tokens sont partagés entre les environnements
d'exécution, et la chaîne prend en charge IBC pour l'interopérabilité
cross-chain.

### Résistant au quantique par conception

QoreChain fournit des primitives de cryptographie post-quantique (PQC) basées sur
**ML-DSA-87** (Dilithium-5, FIPS 204). Aux côtés de la signature classique
secp256k1, la chaîne prend en charge une posture de signature **hybride** dans
laquelle une transaction porte *à la fois* une signature classique et une
signature post-quantique, de sorte qu'elle reste valide sous vérification
classique aujourd'hui tout en bénéficiant d'une protection post-quantique.

Le SDK expose dès aujourd'hui la génération de clés, la signature et la
vérification ML-DSA-87, ainsi que les briques de base pour les transactions
hybrides. Voir [Comptes et signature PQC](/sdk/concepts/accounts-pqc) pour les
détails. Aucune allégation marketing ici — le SDK expose exactement les
primitives que la chaîne implémente.

## Ce qui distingue ce SDK

Au-delà d'une parité multi-chaîne complète, trois capacités ne sont **possibles
que sur QoreChain**, parce qu'elles reposent sur des fonctionnalités de
protocole qu'aucun autre Layer 1 ne possède :

- **Évaluation de risque pré-vol par l'IA** — analysez une transaction avec
  l'IA on-chain avant de la diffuser. `simulateWithRiskScore` renvoie le gas plus
  un verdict de risque/anomalie issu de précompilés EVM déterministes, de sorte
  qu'un wallet ou une dApp peut avertir (ou bloquer) *avant* la signature. Voir
  [Pré-vol IA](/sdk/guides/ai-preflight).
- **Appels cross-VM unifiés** — un compte, trois VM, une transaction.
  `createCrossVMClient` appelle un contrat sur n'importe quelle VM et `callAtomic`
  regroupe plusieurs appels cross-VM dans une seule transaction atomique signée
  une seule fois. Voir [Appels cross-VM](/sdk/guides/cross-vm).
- **DX résistante au quantique** — rendez un signataire protégé contre le
  quantique en un seul appel idempotent (`ensurePqcRegistered` /
  `migrateToHybrid`), avec un badge React prêt à l'emploi. Voir
  [Résistant au quantique](/sdk/guides/quantum-safe).

Un nouveau kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) fait de la création d'une dApp résistante au quantique le
chemin par défaut — voir le [guide du kit React](/sdk/guides/react). Pour
l'argumentaire complet, lisez [Pourquoi le SDK QoreChain](/sdk/why).

## La famille de SDK

Le SDK est livré comme une famille de packages pour que vous puissiez construire
dans le langage de votre choix. Ils partagent les mêmes préréglages réseau,
schémas de dérivation, calculs de dénomination et surfaces de lecture.

| Package | Langage | Installation | Statut |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publié (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Publié (PyPI, v0.5.0) |
| `qorechain-sdk` (module Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publié (proxy Go, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Publié (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Publié (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (adaptateur EVM) | `npm i @qorechain/evm viem` | Publié (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (adaptateur SVM) | `npm i @qorechain/svm @solana/web3.js` | Publié (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Publié (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publié (npm, v0.5.0) |

> La distribution Python s'installe sous le nom `qorechain-sdk` mais
> **s'importe en tant que `qorsdk`**. Tous les clients sont publiés sur leurs
> registres — voir [Installation](/sdk/install) pour les commandes par langage.

Le cœur TypeScript (`@qorechain/sdk`) sert de base aux exemples de cette
documentation. Les clients Python, Go, Rust et Java atteignent une **parité
native complète avec la chaîne** par rapport à TypeScript : préréglages réseau,
utilitaires de denom/adresse, dérivation de comptes HD (native/EVM/SVM),
signature PQC (ML-DSA-87), composeurs de messages typés pour chaque module
personnalisé ainsi que pour les modules Cosmos standard, clients de requêtes
typés, le cycle de vie complet des transactions (auto-gas, décodage d'erreurs,
suivi de tx, recherche de blocs/tx), transactions post-quantiques hybrides, et
abonnements WebSocket. Tous ces clients sont **publiés** : TypeScript sur npm
(`@qorechain/sdk` 0.5.0), Python sur PyPI (`qorechain-sdk` 0.5.0, import
`qorsdk`), Go sur le proxy de module (`.../packages/go` 0.5.0), Rust sur
crates.io (`qorechain-sdk` 0.5.0), et Java sur Maven Central
(`io.github.qorechain:qorechain-sdk` 0.5.0). Les adaptateurs d'exécution EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, tous deux 0.5.0), le kit `@qorechain/react`
(0.5.0), et la CLI d'échafaudage `create-qorechain-dapp` sont uniquement en
TypeScript et également publiés sur npm.

La version v0.4 a ajouté les retraits de rollup (`MsgExecuteWithdrawal`, le
chemin de sortie L2→L1), des clients de requêtes typés pour les modules
`multilayer`, `rdk` et `bridge`, des messages d'administration de bridge, et des
helpers haut niveau pour les sidechains/paychains et les rollups dans les cinq
langages.

## Où aller ensuite

- [Pourquoi le SDK QoreChain](/sdk/why) — les trois capacités propres à QoreChain.
- [Installation](/sdk/install) — instructions d'installation par langage.
- [Quickstart](/sdk/quickstart) — se connecter, lire un solde, envoyer un transfert.
- [Concepts : Architecture](/sdk/concepts/architecture) — le modèle triple-VM.
- [Concepts : Comptes et signature PQC](/sdk/concepts/accounts-pqc) — clés et
  signature post-quantique.
- [Guides](/sdk/guides/evm) — tutoriels par VM.
- [Référence réseau et endpoints](/sdk/reference/network) — chain id, ports, token.
- [Exemples](/sdk/examples) — extraits exécutables, à copier-coller.
- [La référence réseau et endpoints](/sdk/reference/network) est également présentée dans [Réseaux](/appendix/networks).
