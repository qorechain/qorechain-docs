---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Présentation
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille **non dépositaire** officiel de **QoreChain**, la Layer 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et stockées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne collectent **aucune donnée**. Chaque transfert de QOR sur la lane Native porte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), de sorte que vos fonds sont protégés à la fois contre les attaquants classiques et quantiques.

QoreX se compose de deux parties qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille de bureau, **disponible et public sur Chrome, Firefox et Safari (macOS)**. C'est un portefeuille autonome (créer/importer, détenir et envoyer des QOR) et le connecteur qui permet à n'importe quel site web de détecter QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : créer/restaurer, envoyer et recevoir des QOR résistants au quantique, réseaux externes, staking, portefeuille, récupération, et un navigateur dApp intégré. Actuellement en test public (voir la disponibilité ci-dessous).

## Disponibilité par plateforme

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ | ✅ (autonome) |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (depuis la popup) |
| Réseaux externes (ETH / BNB / POL / ARB / SOL + tokens) | ✅ | via signature dApp |
| Staking, Portefeuille, Q-Day Scanner, Récupération, Legacy | ✅ | — |
| Connexions dApp | ✅ (navigateur intégré) | ✅ (n'importe quel site web) |
| Compte (@handle, demandes de paiement) | ✅ | — |
| Liaison multi-appareils | ✅ | — |
| Appairage avec le tableau de bord | ✅ | ✅ (connexion + transferts proposés, v0.1.5) |

## En quoi QoreX est différent

- **Résistant au quantique par défaut** — les transferts de QOR sur la lane Native portent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui est classique (chaînes externes) est clairement indiqué, jamais silencieux.
- **Véritablement non dépositaire** — les clés sont générées sur l'appareil et résident dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune collecte de données** — pas d'analytique, de suivi ni de publicité dans aucune application QoreX. Une connexion à un compte optionnelle apporte des commodités (voir [Compte et tableau de bord](/qorex/account-and-dashboard)) mais le portefeuille n'en dépend jamais.
- **Un solde unifié** — vos QOR forment un solde unique à travers les lanes Native, EVM et SVM ; QoreX l'affiche sous la forme d'un chiffre unique.
- **Plusieurs voies de récupération** — une phrase de récupération de 24 mots (toujours), une récupération sociale optionnelle avec des gardiens et un verrou temporel de 48 heures, un héritage Legacy optionnel, et une liaison multi-appareils pratique.

## Pour commencer

- Nouveau sur QoreX ? Commencez par [Premiers pas](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur le bureau, installez l'[Extension de navigateur](/qorex/browser-extension).

:::note Téléchargement et disponibilité
- **Extension de navigateur** — disponible et publique : installez-la depuis le [Chrome Web Store, Firefox Add-ons, ou le Mac App Store (Safari)](/qorex/browser-extension#install).
- **Application Android** — disponible en **test public** sur Google Play.
- **Application iOS** — disponible en test via **TestFlight** si vous souhaitez l'essayer.

Trouvez les liens actuels et officiels sur [qorechain.io](https://qorechain.io), et n'installez QoreX qu'à partir d'une fiche officielle.
:::
