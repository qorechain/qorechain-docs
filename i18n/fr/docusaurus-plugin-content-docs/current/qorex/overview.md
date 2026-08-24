---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Présentation
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille **non dépositaire** officiel de **QoreChain**, la Layer 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et conservées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne collectent **aucune donnée**. Chaque transfert de QOR sur la voie Native comporte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), afin que vos fonds soient protégés aussi bien contre les attaquants classiques que quantiques.

QoreX se compose de deux éléments qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille pour ordinateur, **disponible publiquement sur Chrome, Firefox et Safari (macOS)**. C'est à la fois un portefeuille autonome (créer/importer, détenir et envoyer des QOR) et le connecteur qui permet à n'importe quel site web de détecter QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : création/restauration, envoi et réception de QOR résistants au quantique, réseaux externes, staking, portefeuille d'actifs, récupération et un navigateur dApp intégré. **Sur Google Play** pour Android, et **sur l'App Store** pour iOS (voir la disponibilité ci-dessous).

## Disponibilité par plateforme {#platform-availability}

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ | ✅ (autonome, un seul compte) |
| Plusieurs comptes à partir d'une seule phrase de récupération | ✅ (jusqu'à 20) | — (un seul compte) |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (depuis la fenêtre contextuelle, avec QR de réception) |
| Payer / réclamer un @handle | ✅ | ✅ |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + jetons) | ✅ | ✅ (envoi depuis la fenêtre contextuelle) |
| Langue de l'interface (10 langues) | ✅ (suit celle du téléphone) | ✅ (suit celle du navigateur) |
| Staking, Portefeuille d'actifs, Q-Day Scanner, Récupération, Legacy | ✅ | — |
| Connexions aux dApps | ✅ (navigateur intégré) | ✅ (n'importe quel site web) |
| Connexion au compte et demandes de paiement | ✅ | — |
| Association de plusieurs appareils | ✅ | — |
| Appairage avec le Dashboard | ✅ | ✅ (connexion + transferts proposés) |

## Ce qui distingue QoreX

- **Résistant au quantique par défaut** — les transferts de QOR sur la voie Native comportent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui relève de la cryptographie classique (chaînes externes) est clairement signalé, jamais de façon silencieuse.
- **Véritablement non dépositaire** — les clés sont générées sur l'appareil et résident dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou dans un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune collecte de données** — aucune analyse d'audience, aucun traçage ni publicité dans les applications QoreX. Une connexion au compte facultative apporte des commodités supplémentaires (voir [Compte et Dashboard](/qorex/account-and-dashboard)), mais le portefeuille n'en dépend jamais.
- **Un solde unifié** — vos QOR forment un seul solde couvrant les voies Native, EVM et SVM ; QoreX l'affiche sous la forme d'un chiffre unique.
- **Plusieurs voies de récupération** — une phrase de récupération de 24 mots (toujours), une récupération sociale facultative avec des garants et un verrou temporel de 48 heures, une transmission Legacy facultative, ainsi qu'une association pratique de plusieurs appareils.

## Pour commencer

- Vous découvrez QoreX ? Commencez par [Premiers pas](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

:::note Téléchargement et disponibilité
- **Extension de navigateur** — disponible publiquement : installez-la depuis le [Chrome Web Store, Firefox Add-ons ou le Mac App Store (Safari)](/qorex/browser-extension#install). Consultez [quelle version est disponible où](/qorex/browser-extension#versions) — certaines fonctionnalités récentes peuvent encore être en cours de déploiement sur certains navigateurs.
- **Application Android** — disponible en production sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex
- **Application iOS** — disponible sur l'**App Store** : https://apps.apple.com/us/app/qorex-wallet/id6791256626.

Le contrôle par les magasins d'applications suit son propre calendrier, si bien que la version la plus récente peut parfois arriver sur un magasin avant un autre — consultez [quelle version est disponible où](#platform-availability) ci-dessous pour connaître la situation exacte actuelle. Installez toujours l'application depuis une fiche de magasin officielle.
:::

:::note Quelle version est disponible où
Les validations des magasins n'arrivent pas toutes en même temps, la version ci-dessous peut donc différer brièvement selon la plateforme :

| Plateforme | Version en ligne |
|---|---|
| Android | 1.0.3 |
| iOS | 1.0 (une mise à jour est en cours d'examen) |
| Firefox | 0.1.9 |
| Chrome | 0.1.5 (0.1.9 est en cours d'examen) |
| Safari (macOS) | 1.1, intégrant l'extension 0.1.5 (une mise à jour est en cours d'examen) |

Cette page décrit l'ensemble actuel des fonctionnalités de QoreX — un magasin qui diffuse encore une version plus ancienne se mettra à jour automatiquement, sans aucune action de votre part.
:::
