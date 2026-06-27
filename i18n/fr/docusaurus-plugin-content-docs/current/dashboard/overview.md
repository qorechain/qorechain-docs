---
slug: /dashboard/overview
title: Présentation du Dashboard et prise en main
sidebar_label: Présentation et prise en main
sidebar_position: 1
---

# Présentation du Dashboard et prise en main

Le Dashboard QoreChain sur **[dashboard.qorechain.io](https://dashboard.qorechain.io)** est l'application web officielle pour utiliser QoreChain depuis votre navigateur. Depuis un seul endroit, vous pouvez explorer la chaîne, gérer un portefeuille, échanger des jetons, déplacer des actifs entre chaînes, générer et auditer des contrats intelligents, faire du staking auprès des validateurs, réclamer des jetons de testnet, accomplir des quêtes et accéder à l'outillage du réseau.

Tout ce qui se trouve dans cette section est un guide pratique utilisateur : ce que fait chaque page et comment l'utiliser. Aucune installation n'est requise — le Dashboard s'exécute entièrement dans votre navigateur.

## Ce que vous pouvez faire

| Domaine | À quoi cela sert |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Parcourir les blocs, les transactions, les adresses et les validateurs. |
| **[Wallet](/dashboard/wallet)** | Consulter les soldes, envoyer et recevoir des QOR, et gérer vos adresses. |
| **[Trade](/dashboard/trade)** | Échanger des jetons et fournir de la liquidité sur l'AMM on-chain. |
| **[Bridge](/dashboard/bridge)** | Déplacer des actifs entre QoreChain et d'autres chaînes. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Générer des contrats intelligents avec **QCAI** sur 17 blockchains prises en charge. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Réaliser une analyse de sécurité **QCAI** sur un contrat intelligent. |
| **[Staking et validateurs](/dashboard/staking-and-validators)** | Examiner les validateurs et déléguer vos QOR. |
| **[Faucet](/dashboard/faucet)** | Demander des jetons de test sur le testnet. |
| **[Quests](/dashboard/quests)** | Accomplir des tâches guidées pour apprendre à connaître le réseau. |
| **[Tools Hub](/dashboard/tools-hub)** | Accéder à l'outillage pour les nœuds, les rollups, le SDK et les licences. |

## Connecter votre portefeuille {#connect-your-wallet}

La plupart des actions qui modifient l'état on-chain — envoi de jetons, swap, staking, bridging — nécessitent un portefeuille connecté.

1. Ouvrez [dashboard.qorechain.io](https://dashboard.qorechain.io).
2. Sélectionnez **Connect Wallet**.
3. Approuvez la connexion dans votre portefeuille.

Une fois connecté, le Dashboard affiche votre adresse (sous forme abrégée) dans l'en-tête et débloque les actions nécessitant une signature. Les pages en lecture seule comme l'Explorer fonctionnent sans connexion.

Les comptes QoreChain utilisent le préfixe bech32 `qor`, donc une adresse connectée ressemble à `qor1...`. Les comptes sont protégés par de la cryptographie résistante au quantique. Consultez [Configuration du portefeuille](/getting-started/wallet-setup) pour des conseils de première configuration.

## Sélectionner votre réseau

Le Dashboard fonctionne avec deux réseaux. L'en-tête affiche le réseau auquel vous êtes actuellement connecté.

| Réseau | ID de la chaîne | Quand l'utiliser |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Réseau en direct pour la valeur réelle et l'usage en production. |
| **Testnet** | `qorechain-diana` | Environnement gratuit pour les tests, avec le [Faucet](/dashboard/faucet) pour les jetons de test. |

Le jeton natif est **QOR** (dénomination de base `uqor`, où 1 QOR = 10^6 uqor). Si vous débutez, commencez sur le testnet, réclamez des jetons au Faucet et essayez un premier transfert avant de passer au mainnet.

:::tip Nouveau sur QoreChain ?
Suivez [Se connecter au testnet](/getting-started/connecting-to-testnet) et [Votre première transaction](/getting-started/first-transaction) pour vous familiariser rapidement, puis revenez explorer le reste du Dashboard.
:::

## Voir aussi

* [Explorer](/dashboard/explorer) — parcourir les blocs, les transactions et les comptes.
* [Wallet](/dashboard/wallet) — gérer les comptes et envoyer des transactions.
* [Trade / DEX](/dashboard/trade) — échanger des jetons contre les pools de l'AMM on-chain.
* [Bridge](/dashboard/bridge) — déplacer des actifs entre chaînes.
* [Tools Hub](/dashboard/tools-hub) — licences, faucet et utilitaires pour développeurs.
