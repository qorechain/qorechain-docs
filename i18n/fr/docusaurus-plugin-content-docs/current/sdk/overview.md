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
lire l'état on-chain, dériver des comptes, signer et envoyer des transactions,
et travailler avec chacune des machines virtuelles de QoreChain.

## Qu'est-ce que QoreChain ?

QoreChain est une blockchain Layer 1 dotée de trois environnements d'exécution
de smart contracts de première classe sur une seule chaîne :

- **QoreChain Native** — smart contracts Wasm via le Cosmos SDK (le runtime CosmWasm).
- **QoreChain EVM Engine** — exécution compatible Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un environnement d'exécution compatible Solana avec un JSON-RPC de
  style Solana.

Les comptes, soldes et tokens sont partagés entre les environnements
d'exécution, et la chaîne inclut le module IBC pour l'interopérabilité
inter-chaînes (aucun canal IBC n'est encore ouvert sur le mainnet ni sur le testnet).

:::note Ce qui fonctionne aujourd'hui sur les réseaux actifs (mainnet et testnet v3.2.4)
**Fonctionne :** les lectures sur toutes les voies, les transactions Native à signature hybride, les comptes
unifiés, les transactions EVM à l'intérieur d'une
[fenêtre d'autorisation](/sdk/guides/evm#evm-window), et les lectures SVM.
**Pas encore disponible :** les précompilés EVM (inactifs), l'espace de noms JSON-RPC `qor_`, les transactions SVM, les appels inter-VM sur le mainnet (`MsgCrossVMCall` est
désactivé par le disjoncteur), le téléversement et l'instanciation QoreChain Native pour les comptes
ordinaires, les flux authenticator / compte abstrait (module désactivé), xQORE
et l'abstraction de gas. Chaque guide rappelle la réserve là où elle s'applique.

Le SDK publié (0.9.0, 21 octobre 2026) signe sous la forme que vérifient les deux réseaux
(sign-bytes hybrides v2, déterminés à partir de l'état de la chaîne), et le format de signature,
les adresses, les décimales, les memos et les frais n'ont pas changé dans la v3.2.3 ni la v3.2.4 (le mainnet exécute la v3.2.4 depuis le 23 octobre 2026). Il porte
le côté client des règles post-quantiques ultérieures (la preuve de possession lors de l'enregistrement
de clé, les fenêtres EVM à portée restreinte, les messages de consentement EIP-7702) ; les versions antérieures à la 0.9.0
n'en disposent pas, voir [Versions antérieures à la 0.9.0](/sdk/install#before-090).
:::

### Résistant au quantique par conception

QoreChain fournit des primitives de cryptographie post-quantique (PQC) basées
sur **ML-DSA-87** (Dilithium-5, FIPS 204). Aux côtés de la signature classique
secp256k1, la chaîne prend en charge une posture de signature **hybride** dans
laquelle une transaction porte *à la fois* une signature classique et une
signature post-quantique : elle reste ainsi valide sous vérification classique
aujourd'hui tout en bénéficiant d'une protection post-quantique.

Le SDK expose dès aujourd'hui la génération de clés, la signature et la
vérification ML-DSA-87, ainsi que les briques de base des transactions
hybrides. Sur les réseaux actifs, une transaction de la voie Native **doit** être signée de manière hybride et la
clé ML-DSA-87 du compte doit d'abord être enregistrée. Voir
[Comptes & signature PQC](/sdk/concepts/accounts-pqc) pour les
détails. Aucune promesse marketing ici — le SDK expose exactement les
primitives que la chaîne implémente.

## Ce qui distingue ce SDK

Au-delà d'une parité multi-chaînes complète, trois capacités ne sont
**possibles que sur QoreChain**, car elles s'appuient sur des fonctionnalités
protocolaires qu'aucun autre Layer 1 ne possède :

- **Évaluation de risque par IA avant envoi** — analysez une transaction avec
  l'IA on-chain avant de la diffuser. `simulateWithRiskScore` renvoie le gas
  ainsi qu'un verdict de risque/anomalie issu de précompilés EVM
  déterministes, de sorte qu'un wallet ou une dApp peut avertir (ou bloquer)
  *avant* la signature. Les précompilés ne sont pas encore actifs sur le mainnet ni sur le testnet. Voir [AI pre-flight](/sdk/guides/ai-preflight).
- **Appels inter-VM unifiés** — un compte, trois VM, une transaction.
  `createCrossVMClient` appelle un contrat sur n'importe quelle VM et
  `callAtomic` regroupe plusieurs appels inter-VM dans une seule transaction
  atomique signée une seule fois. Voir
  [Appels inter-VM](/sdk/guides/cross-vm).
- **DX résistante au quantique** — rendez un signataire protégé en
  post-quantique en un seul appel idempotent (`ensurePqcRegistered` /
  `migrateToHybrid`), avec un badge React prêt à l'emploi. Voir
  [Quantum-safe](/sdk/guides/quantum-safe).

Deux capacités supplémentaires au niveau de la chaîne sont arrivées en 0.6.0
et 0.7.0 (la seconde n'est pas encore utilisable sur les réseaux actifs, voir ci-dessous) :

- **Comptes eth-natifs unifiés** — une clé `eth_secp256k1` est une identité
  unique de 20 octets rendue sous les formes `qor1…`, `0x…` et une adresse SVM
  en base58, partageant toutes un même solde. Voir
  [Comptes unifiés](/sdk/concepts/accounts-pqc#unified-accounts).
- **Voies d'authenticators** — liez une clé Phantom ou MetaMask au compte
  canonique exigeant la PQC et laissez-la dépenser via un relayer selon des
  conditions à moindre privilège, plafonnées en dépenses et révocables. Le
  module `abstractaccount` qui la sous-tend est aujourd'hui désactivé sur les deux réseaux. Voir
  [Authenticators & dépenses déléguées](/sdk/guides/authenticators).

Un nouveau kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) fait de la construction d'une dApp résistante au quantique
le chemin par défaut — voir le [guide du kit React](/sdk/guides/react). Pour
l'argumentaire complet, lisez [Pourquoi le SDK QoreChain](/sdk/why).

## La famille du SDK

Le SDK est distribué sous la forme d'une famille de packages afin que vous
puissiez développer dans le langage de votre choix. Ils partagent les mêmes
préréglages réseau, schémas de dérivation, calculs de dénomination et surfaces
de lecture.

| Package | Langage | Installation | Statut |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publié (npm, v0.9.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Publié (PyPI, v0.9.0) |
| `qorechain-sdk` (module Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publié (proxy Go, tag `packages/go/v0.9.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Publié (crates.io, v0.9.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.9.1` | Publié (Maven Central, v0.9.1 ; les autres langages sont en 0.9.0) |
| `@qorechain/evm` | TypeScript (adaptateur EVM) | `npm i @qorechain/evm viem` | Publié (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (adaptateur SVM) | `npm i @qorechain/svm @solana/web3.js` | Publié (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Publié (npm, v0.9.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publié (npm, v0.9.0) |

> La distribution Python s'installe sous le nom `qorechain-sdk` mais
> **s'importe sous `qorsdk`**. Tous les clients sont publiés sur leurs
> registres respectifs — voir [Installation](/sdk/install) pour les commandes
> propres à chaque langage.

Le cœur TypeScript (`@qorechain/sdk`) sert de base aux exemples de cette
documentation. Les clients Python, Go, Rust et Java atteignent une **parité
native-chaîne complète** avec TypeScript : préréglages réseau, utilitaires de
denom et d'adresses, dérivation de comptes HD (native/EVM/SVM), signature PQC
(ML-DSA-87), compositeurs de messages typés pour chaque module personnalisé
ainsi que pour les modules Cosmos standard, clients de requête typés, le cycle
de vie complet des transactions (auto-gas, décodage d'erreurs, suivi des tx,
recherche de blocs/tx), les transactions post-quantiques hybrides et les
abonnements WebSocket. Tous ces clients sont **publiés** : TypeScript sur npm
(`@qorechain/sdk` 0.9.0), Python sur PyPI (`qorechain-sdk` 0.9.0, import
`qorsdk`), Go sur le proxy de modules (tag `packages/go/v0.9.0`), Rust sur
crates.io (`qorechain-sdk` 0.9.0), et Java sur Maven Central
(`io.github.qorechain:qorechain-sdk` 0.9.1, une mise à jour Java uniquement ; les autres clients sont en 0.9.0). Les adaptateurs d'exécution
EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, tous deux en 0.8.0), le kit
`@qorechain/react` (0.9.0) et la CLI d'échafaudage `create-qorechain-dapp`
(0.9.0) sont uniquement en TypeScript et également publiés sur npm. Voir
[Installation](/sdk/install#related-packages) pour les packages complémentaires.

## Nouveautés des versions 0.6, 0.7, 0.8 et 0.9

**0.6.0 — comptes eth-natifs unifiés (chaîne v3.1.83).** Une clé
`eth_secp256k1` est une identité unique de 20 octets rendue sous les trois
encodages d'adresse, partageant un même solde dépensable sur chaque voie :

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

La signature sur la voie native avec la même clé se fait via
`signClassicalEth` / `signHybridEth`, et une clé Phantom ou MetaMask est liée au compte en tant qu'authenticator
(la dérivation à partir d'une signature Phantom a été supprimée en 0.8.0). Le
`deriveNativeAccount` historique en coin-type 118 reste inchangé. Voir
[Comptes unifiés](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — correctif critique pour le consensus.** L'extension de corps de
transaction `PQCHybridSignature` est désormais encodée en protobuf (elle était
encodée en JSON et rejetée à l'étape CheckTx). Les transactions hybrides
construites avec un SDK ≤ 0.6.0 sont **rejetées on-chain** — mettez à niveau.

**0.7.0 — voies d'authenticators (chaîne v3.1.85).** Le module
`abstractaccount` qui les sous-tend est actuellement désactivé sur les deux réseaux (voir le
[guide des Authenticators](/sdk/guides/authenticators)). Une clé Phantom
(ed25519) ou MetaMask (secp256k1, par adresse de 20 octets) liée peut dépenser
depuis le compte canonique exigeant la PQC via un relayer, selon des
conditions à moindre privilège, plafonnées en dépenses et révocables :
compositeurs `MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`,
assistants `evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`
exacts à l'octet près, la requête `permissionSchema`, des codes d'erreur
décodés, et des constructeurs de wallet TypeScript
(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …). Guide complet
avec exemples à copier-coller :
[Authenticators & dépenses déléguées](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — signature hybride v2 (sign-bytes) et fenêtre d'autorisation EVM (chaîne
v3.2.0).** La moitié post-quantique d'une transaction hybride est désormais signée sous la forme
que vérifie le réseau cible (v1 ou v2, `signBytesVersion: "auto" | "v1" | "v2"`).
Les deux réseaux publics sont en v2 ; le SDK **0.8.1 ou ultérieur** est donc requis pour
effectuer des transactions sur le mainnet (utilisez la 0.9.0). **0.8.2** ajoute `openEvmWindowMsg`, `closeEvmWindowMsg`,
`fetchEvmWindow` et `classifyEvmWindowRejection` pour la
[fenêtre d'autorisation](/sdk/guides/evm#evm-window) de la voie EVM.
**0.8.0** a supprimé les assistants de compte à signature de wallet (`connectPhantomUnified` et
`unifiedAccountFromPhantomSignature`, supprimés en 0.8.0), applique des contrôles stricts de taille ML-DSA-87
dans chaque langage, et ajoute l'indicateur `async` ainsi que les données renvoyées par l'appelé
aux appels inter-VM. **0.8.3** corrige la recherche de tx, les conditions de concurrence des hooks React, le séquencement de
`migrate_to_hybrid` en Python et la dérivation PQC canonique indépendante de la forme d'adresse
(`derivePqcCanonical`, `canonicalAccount`). Voir
[Notes de mise à niveau](/sdk/install#upgrade).

**0.9.0 — prise en charge client des chaînes v3.2.2 et v3.2.3.** Le `TxClient` TypeScript
signe en mode hybride lorsque vous passez la paire de clés du compte
(`client.connectTx(signer, { pqcKeypair })`), de sorte que `bankSend` et les clients rollup,
multilayer et inter-VM du SDK fonctionnent sur les réseaux publics. `ensurePqcRegistered`
vérifie d'abord la clé enregistrée via REST, refuse d'enregistrer une seconde clé
différente, et joint lui-même la preuve de possession dès que le réseau a appliqué
la v3.2.3. De nouveaux constructeurs couvrent les fenêtres EVM à portée restreinte (`nativeOnly`, `allowedTargets`) et
les messages de consentement EIP-7702, et `derivePqcCanonical(address, mnemonic)` donne une
clé récupérable à partir de la phrase mnémonique dans chaque langage. La route du compte PQC est
la route au singulier `/qorechain/pqc/v1/account/{address}`, les échecs survenus dans un bloc conservent
leur codespace, et `create-qorechain-dapp` génère ses projets sur le SDK actuel. Voir
[Ce qu'ajoute la 0.9.0](/sdk/install#whats-new-090).

## Pour aller plus loin

- [Pourquoi le SDK QoreChain](/sdk/why) — les cinq capacités propres à QoreChain.
- [Installation](/sdk/install) — instructions d'installation par langage.
- [Démarrage rapide](/sdk/quickstart) — se connecter, lire un solde, envoyer un transfert.
- [Concepts : Architecture](/sdk/concepts/architecture) — le modèle triple-VM.
- [Concepts : Comptes & signature PQC](/sdk/concepts/accounts-pqc) — clés et
  signature post-quantique.
- [Guides](/sdk/guides/evm) — tutoriels par VM.
- [Authenticators & dépenses déléguées](/sdk/guides/authenticators) — clés
  Phantom/MetaMask liées dépensant via un relayer.
- [Référence réseau & endpoints](/sdk/reference/network) — id de chaîne, ports, token.
- [Exemples](/sdk/examples) — extraits exécutables, à copier-coller.
- La [Référence réseau & endpoints](/sdk/reference/network) est également reprise dans [Réseaux](/appendix/networks).
