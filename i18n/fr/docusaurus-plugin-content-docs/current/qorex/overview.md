---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Présentation
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille **non dépositaire** officiel de **QoreChain**, la Layer 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et conservées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne collectent **aucune donnée**. Chaque transfert de QOR sur la voie Native comporte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), afin que vos fonds soient protégés aussi bien contre les attaquants classiques que quantiques.

QoreX se compose de deux volets qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille pour ordinateur, **disponible publiquement sur Chrome, Firefox et Safari (macOS)**. C'est à la fois un portefeuille autonome (créer/importer, détenir et envoyer des QOR) et le connecteur qui permet à n'importe quel site web de détecter QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : création/restauration, envoi et réception de QOR résistants au quantique, réseaux externes, staking, portefeuille d'actifs, récupération et un navigateur dApp intégré. **Sur Google Play** pour Android ; sur TestFlight pour iOS (voir la disponibilité ci-dessous).

## Disponibilité par plateforme

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ | ✅ (autonome) |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (depuis la fenêtre contextuelle) |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + jetons) | ✅ | ✅ (envoi depuis la fenêtre contextuelle) |
| Staking, Portefeuille d'actifs, Q-Day Scanner, Récupération, Legacy | ✅ | — |
| Connexions aux dApps | ✅ (navigateur intégré) | ✅ (n'importe quel site web) |
| Compte (@handle, demandes de paiement) | ✅ | — |
| Association de plusieurs appareils | ✅ | — |
| Appairage avec le Dashboard | ✅ | ✅ (connexion + transferts proposés, v0.1.5) |

## Ce qui distingue QoreX

- **Résistant au quantique par défaut** — les transferts de QOR sur la voie Native comportent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui relève de la cryptographie classique (chaînes externes) est clairement signalé, jamais de façon silencieuse.
- **Véritablement non dépositaire** — les clés sont générées sur l'appareil et résident dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou dans un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune collecte de données** — aucune analyse d'audience, aucun traçage ni publicité dans les applications QoreX. Une connexion à un compte, facultative, apporte des commodités supplémentaires (voir [Compte et Dashboard](/qorex/account-and-dashboard)), mais le portefeuille n'en dépend jamais.
- **Un solde unifié** — vos QOR forment un seul solde couvrant les voies Native, EVM et SVM ; QoreX l'affiche sous la forme d'un chiffre unique.
- **Plusieurs voies de récupération** — une phrase de récupération de 24 mots (toujours), une récupération sociale facultative avec des garants et un verrou temporel de 48 heures, une transmission Legacy facultative, ainsi qu'une association pratique de plusieurs appareils.

## Pour commencer

- Vous découvrez QoreX ? Commencez par [Premiers pas](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

:::note Téléchargement et disponibilité
- **Extension de navigateur** — disponible publiquement : installez-la depuis le [Chrome Web Store, Firefox Add-ons ou le Mac App Store (Safari)](/qorex/browser-extension#install).
- **Application Android** — disponible sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex
- **Application iOS** — disponible pour les tests via **TestFlight** : https://testflight.apple.com/join/Xa9D7vgR — la publication sur l'App Store est encore en cours d'examen.

N'installez QoreX qu'à partir d'une fiche de magasin officielle.
:::
