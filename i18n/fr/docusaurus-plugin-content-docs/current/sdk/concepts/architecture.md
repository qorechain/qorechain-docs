---
slug: /sdk/concepts/architecture
title: Architecture et concepts
sidebar_label: Architecture
sidebar_position: 1
---

# Architecture et concepts

QoreChain est une chaîne de couche 1 unique qui exécute côte à côte trois machines
virtuelles de contrats intelligents, avec des comptes partagés et un jeton
partagé.

## Le modèle triple-VM

| VM | Contrats | Surface client dans le SDK |
| --- | --- | --- |
| **CosmWasm** | Contrats Rust/Wasm | `client.cosmwasm()` et les helpers `queryContractSmart` / `execute` dans `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (un adaptateur viem) |
| **SVM** | Programmes Solana | `@qorechain/svm` (un adaptateur `@solana/web3.js`) |

La couche native (Cosmos) gère les transferts bancaires, le staking, la
gouvernance et le module `x/crossvm` qui achemine les messages entre les runtimes.

## Surfaces de lecture

Le SDK communique avec un nœud via plusieurs endpoints :

- **REST Cosmos (LCD)** — soldes bancaires, infos de compte, requêtes de module.
- **RPC de consensus** — utilisé pour signer/diffuser les transactions natives et
  pour le client de lecture CosmWasm.
- **JSON-RPC EVM** — appels `eth_*` standard plus l'espace de noms QoreChain
  `qor_*` et les précompilations EVM.
- **JSON-RPC SVM** — RPC compatible Solana pour le runtime SVM.

L'espace de noms JSON-RPC `qor_*` expose des lectures spécifiques à QoreChain
telles que la tokenomics, l'état des clés PQC, le mode de signature hybride, les
messages inter-VM et les statistiques réseau. En TypeScript, ce sont des méthodes
typées sur `client.qor` (`QorClient`) ; la même surface existe dans les SDK
Python, Go et Rust.

## Jetons et dénominations

- Jeton d'affichage : **QOR**.
- Dénomination de base : **uqor**, avec **10^6** unités de base par QOR.

Faites toujours les calculs monétaires en unités de base. Le SDK fournit des
conversions exactes pour ne jamais perdre de précision à cause des nombres à
virgule flottante :

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Note : le runtime EVM représente QOR avec 18 décimales (la convention EVM), ce
> qui est distinct de la base Cosmos `uqor` de 10^6. Le client `@qorechain/evm`
> utilise par défaut 18 décimales pour l'affichage. Confirmez la valeur pour votre
> réseau cible.

## Adresses

Le même matériel de clé peut être exprimé sous trois formats d'adresse :

- **native** — bech32 avec le préfixe `qor` (`qor1…`), les validateurs utilisent
  `qorvaloper`.
- **EVM** — `0x…`, avec somme de contrôle EIP-55.
- **SVM** — base58 de la clé publique ed25519.

Consultez [Comptes et signature PQC](/sdk/concepts/accounts-pqc) pour les chemins
de dérivation.

## Inter-VM

Le module `x/crossvm` de QoreChain permet aux contrats d'une VM de déclencher des
actions sur une autre. Le chemin EVM→natif s'exécute on-chain à travers la
**précompilation de pont inter-VM** (`@qorechain/evm`), et le SDK fournit des
helpers de lecture REST typés (`getCrossVmMessage`, `getPendingCrossVmMessages`,
`getCrossVmParams`) ainsi que `client.qor.getCrossVMMessage(...)` pour suivre
l'état des messages. Consultez le [guide inter-VM](/sdk/guides/cross-vm).
