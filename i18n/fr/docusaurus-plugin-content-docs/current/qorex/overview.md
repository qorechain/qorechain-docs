---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Aperçu
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille officiel **non-custodial** pour **QoreChain**, la blockchain de couche 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et stockées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne collectent **aucune donnée**. Chaque transfert de QOR sur le lane Natif porte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), afin de protéger vos fonds contre les attaquants classiques comme quantiques.

QoreX se compose de deux parties qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille de bureau, **disponible et publique sur Chrome, Firefox et Safari (macOS)**. C'est un portefeuille autonome (créer/importer, détenir et envoyer des QOR) ainsi que le connecteur qui permet à tout site web de découvrir QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : créer/restaurer, envoyer et recevoir des QOR résistants au quantique, réseaux externes, staking, portefeuille d'actifs, récupération, et un navigateur de dApp intégré. **Sur Google Play** pour Android, et **sur l'App Store** pour iOS (voir la disponibilité ci-dessous).

## Disponibilité par plateforme {#platform-availability}

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ | ✅ (autonome) |
| Plusieurs comptes à partir d'une seule phrase de récupération | ✅ (jusqu'à 20) | ✅ *(à partir de 0.2.2)* |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (depuis le popup, y compris le QR de réception) |
| Payer / réclamer un @handle | ✅ | ✅ |
| Staking (déléguer, annuler la délégation, réclamer) | ✅ | ✅ *(à partir de 0.2.2 — son propre écran Stake, et elle peut approuver une demande de staking envoyée par le Dashboard)* |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envoi depuis le popup) |
| Langue de l'interface (10 langues) | ✅ (suit le téléphone) | ✅ (suit le navigateur) |
| Portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy | ✅ | — |
| Connexions dApp | ✅ (navigateur intégré) | ✅ (tout site web) |
| Connexion de compte et demandes de paiement | ✅ | — |
| Liaison multi-appareils | ✅ | — |
| Appairage avec le Dashboard | ✅ | ✅ (connexion + transferts proposés, y compris le staking) |

:::note Le staking dans l'extension nécessite la version 0.2.2 ou ultérieure
Si votre extension est antérieure à la version 0.2.2, le bouton de staking du Dashboard peut indiquer que l'extension doit être mise à jour, même si vous disposez d'une version récente — le correctif qui relie la demande de staking du Dashboard à l'extension a été livré dans la version 0.2.2. Consultez [quelle version est disponible où](/qorex/browser-extension#versions) ; si votre store n'a pas encore déployé la version 0.2.2, l'approbation du staking commencera à fonctionner dès que ce sera fait, sans aucune action de votre part.
:::

## Pourquoi QoreX est différent

- **Résistant au quantique par défaut** — les transferts de QOR sur le lane Natif portent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui est classique (chaînes externes) est clairement identifié, jamais silencieux.
- **Véritablement non-custodial** — les clés sont générées sur l'appareil et vivent dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune collecte de données** — aucune analytique, aucun suivi, aucune publicité dans les applications QoreX. Une connexion de compte optionnelle ajoute des commodités (voir [Compte et Dashboard](/qorex/account-and-dashboard)), mais le portefeuille n'en dépend jamais.
- **Un solde unifié** — vos QOR représentent un solde unique réparti sur les lanes Natif, EVM et SVM ; QoreX l'affiche comme un seul chiffre.
- **Plusieurs chemins de récupération** — une phrase de récupération de 24 mots (toujours), une récupération sociale optionnelle avec des gardiens et un délai de sécurité de 48 heures, un héritage Legacy optionnel, et une liaison multi-appareils pratique.

## Pour commencer

- Nouveau sur QoreX ? Commencez par [Démarrer](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

:::note Téléchargement et disponibilité
- **Extension de navigateur** — disponible et publique : installez-la depuis le [Chrome Web Store, Firefox Add-ons, ou le Mac App Store (Safari)](/qorex/browser-extension#install). Voir [quelle version est disponible où](/qorex/browser-extension#versions) — certaines fonctionnalités récentes peuvent encore être en cours de déploiement sur certains navigateurs.
- **Application Android** — disponible en production sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex
- **Application iOS** — disponible sur l'**App Store** : https://apps.apple.com/us/app/qorex-wallet/id6791256626.

L'examen par les stores suit son propre calendrier, si bien que la dernière version peut atteindre un store avant un autre — voir [quelle version est disponible où](#platform-availability) ci-dessous pour connaître la situation exacte actuelle. Installez toujours depuis une fiche de store officielle.
:::

:::note Quelle version est disponible où
Les approbations des stores arrivent à des moments différents, la version ci-dessous peut donc varier brièvement selon la plateforme :

| Plateforme | Version disponible |
|---|---|
| Android | 1.0.4 |
| iOS | 1.0.2 (une mise à jour est en cours d'examen) |
| Firefox | 0.2.2 |
| Chrome | 0.1.5 (la version 0.1.9 est en cours d'examen ; une soumission 0.2.2 ultérieure suivra une fois cet examen terminé) |
| Safari (macOS) | 1.3, intégrant l'extension 0.2.2 |

Cette page décrit l'ensemble des fonctionnalités actuel de QoreX — un store qui sert encore une version plus ancienne rattrapera son retard automatiquement, sans aucune action de votre part.
:::
