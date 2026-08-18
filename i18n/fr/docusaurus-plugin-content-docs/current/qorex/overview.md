---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Présentation
sidebar_position: 1
---

# QoreX Wallet

**QoreX** est le portefeuille **non dépositaire** officiel de **QoreChain**, la Layer 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et conservées **uniquement sur votre appareil** — la QoreChain Association n'a jamais accès à vos fonds et les applications ne collectent **aucune donnée**. Chaque transfert de QOR sur la voie Native porte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), afin que vos fonds soient protégés aussi bien contre les attaquants classiques que quantiques.

QoreX se compose de deux parties qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille de bureau, **disponible publiquement sur Chrome, Firefox et Safari (macOS)**. C'est à la fois un portefeuille autonome (créer/importer, détenir et envoyer des QOR) et le connecteur qui permet à n'importe quel site web de détecter QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : créer/restaurer, envoyer et recevoir des QOR résistants au quantique, réseaux externes, staking, portefeuille d'actifs, récupération, et un navigateur de dApps intégré. Actuellement en phase de test public (voir la disponibilité ci-dessous).

## Disponibilité par plateforme

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ | ✅ (autonome) |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (depuis la fenêtre contextuelle) |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + jetons) | ✅ | ✅ (envoi depuis la fenêtre contextuelle) |
| Staking, Portfolio, Q-Day Scanner, Recovery, Legacy | ✅ | — |
| Connexions aux dApps | ✅ (navigateur intégré) | ✅ (n'importe quel site web) |
| Compte (@handle, demandes de paiement) | ✅ | — |
| Liaison multi-appareils | ✅ | — |
| Appairage avec le dashboard | ✅ | ✅ (connexion + transferts proposés, v0.1.5) |

## Ce qui distingue QoreX

- **Résistant au quantique par défaut** — les transferts de QOR sur la voie Native portent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui relève de la cryptographie classique (chaînes externes) est clairement signalé, jamais de façon silencieuse.
- **Véritablement non dépositaire** — les clés sont générées sur l'appareil et résident dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou dans un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune collecte de données** — pas d'analytique, de suivi ni de publicité dans les applications QoreX. Une connexion facultative à un compte apporte des commodités (voir [Compte et dashboard](/qorex/account-and-dashboard)), mais le portefeuille n'en dépend jamais.
- **Un solde unifié** — vos QOR constituent un seul solde à travers les voies Native, EVM et SVM ; QoreX l'affiche comme un chiffre unique.
- **Plusieurs voies de récupération** — une phrase de récupération de 24 mots (toujours), une récupération sociale facultative avec des gardiens et un verrou temporel de 48 heures, une transmission Legacy facultative, et une liaison multi-appareils pratique.

## Pour commencer

- Vous découvrez QoreX ? Commencez par [Démarrage](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[extension de navigateur](/qorex/browser-extension).

:::note Téléchargement et disponibilité
- **Extension de navigateur** — disponible publiquement : installez-la depuis le [Chrome Web Store, Firefox Add-ons ou le Mac App Store (Safari)](/qorex/browser-extension#install).
- **Application Android** — disponible en **test public** sur Google Play.
- **Application iOS** — disponible en test via **TestFlight** si vous souhaitez l'essayer.

Retrouvez les liens officiels à jour sur [qorechain.io](https://qorechain.io), et n'installez QoreX que depuis une fiche officielle.
:::
