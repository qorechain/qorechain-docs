---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Aperçu
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille officiel **non-custodial** pour **QoreChain**, la blockchain de couche 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et stockées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne contiennent **aucune analytique, aucun suivi et aucune publicité**. Chaque transfert de QOR sur le lane Natif porte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), afin de protéger vos fonds contre les attaquants classiques comme quantiques.

QoreX se compose de deux parties qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille de bureau, **disponible et publique sur Chrome, Firefox et Safari (macOS)**. C'est un portefeuille autonome (créer/importer, détenir et envoyer des QOR) ainsi que le connecteur qui permet à tout site web de découvrir QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : créer/restaurer, envoyer et recevoir des QOR résistants au quantique, réseaux externes, staking, portefeuille d'actifs, récupération, et un navigateur de dApp intégré. **Sur Google Play** pour Android, et **sur l'App Store** pour iOS (voir la disponibilité ci-dessous).

:::caution Sauvegardez votre phrase de récupération dès que vous créez un portefeuille
QoreX est non-custodial : QoreChain Association ne peut ni récupérer un portefeuille perdu, ni le réinitialiser, ni le restaurer à votre place. **Désinstaller l'application, réinitialiser le téléphone ou supprimer l'extension efface vos clés de cet appareil.** Notez votre phrase de récupération de 24 mots (l'application mobile ne l'affiche pas pendant qu'elle crée le portefeuille — révélez-la depuis **Paramètres → Sécurité → Révéler la phrase de récupération** ; l'extension l'affiche une seule fois à la création) et, si vous le pouvez, mettez en place la [récupération sociale](/qorex/security-and-recovery#social-recovery). Voir [Sauvegarder maintenant](/qorex/security-and-recovery#back-up-now).
:::

## Disponibilité par plateforme {#platform-availability}

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ (l'application n'affiche pas la phrase lorsqu'elle crée le portefeuille — révélez-la depuis Paramètres → Sécurité) | ✅ (autonome ; la phrase est affichée une seule fois à la création) |
| Plusieurs portefeuilles, chacun avec sa propre phrase de récupération | ✅ (Paramètres → Portefeuilles) | ✅ (**Portefeuilles**, un seul mot de passe pour tous) |
| Plusieurs comptes à partir d'une seule phrase de récupération | ✅ (jusqu'à 20 par portefeuille) | ✅ |
| Compte de type Ethereum (coin 60), ajouté manuellement | ✅ | ✅ |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (Envoyer ; Recevoir avec QR) |
| Recevoir sur n'importe quel réseau pris en charge | ✅ | ✅ |
| Payer / réclamer un @handle | ✅ | ✅ pour payer ; la réclamation est proposée sur les comptes QoreChain ordinaires dans certaines versions de l'extension — sinon, réclamez dans l'application |
| Staking : déléguer, annuler la délégation, déplacer un stake, réclamer, réclamer et restaker | ✅ | ✅ |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envoi depuis le popup) |
| Ajouter un token par contrat (réseaux EVM) | ✅ | ✅ |
| Fenêtre d'accès EVM | ✅ | ✅ |
| Langue de l'interface (10 langues) | ✅ (suit le téléphone) | ✅ (suit le navigateur) |
| Portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy | ✅ | — |
| Recherche, visite de première utilisation, widget d'écran d'accueil, notifications push | ✅ | — |
| Connexions dApp | ✅ (navigateur intégré, limité à la session) | ✅ (tout site web ; **Sites connectés** avec Révoquer) |
| Swap | Android uniquement, désactivé jusqu'à la liquidité des pools (non affiché sur iOS) | — |
| Connexion de compte et demandes de paiement | ✅ | — |
| Liaison multi-appareils | ✅ | — |
| Appairage avec le Dashboard | ✅ | ✅ (connexion + transferts proposés, y compris le staking) |

## Pourquoi QoreX est différent

- **Résistant au quantique par défaut** — les transferts de QOR sur le lane Natif portent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui est classique (chaînes externes) est clairement identifié, jamais silencieux.
- **Véritablement non-custodial** — les clés sont générées sur l'appareil et vivent dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune analytique, aucun suivi, aucune publicité** dans aucune application QoreX. Les extras optionnels n'utilisent un serveur que lorsque vous les activez : la connexion de compte (voir [Compte et Dashboard](/qorex/account-and-dashboard)) et les notifications push, qui enregistrent votre appareil et vos adresses *publiques* afin que QoreX puisse vous prévenir lorsque des QOR arrivent. Le portefeuille ne dépend jamais ni de l'un ni de l'autre.
- **Un solde unifié** — vos QOR représentent un solde unique réparti sur les lanes Natif, EVM et SVM ; QoreX l'affiche comme un seul chiffre.
- **Plusieurs chemins de récupération** — une phrase de récupération de 24 mots (toujours ; sur mobile, révélez-la depuis Paramètres → Sécurité), une récupération sociale optionnelle avec des gardiens et un délai de sécurité de 48 heures, un héritage Legacy optionnel, et une liaison multi-appareils pratique.

## Pour commencer

- Nouveau sur QoreX ? Commencez par [Démarrer](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

## Téléchargement et disponibilité {#availability}

- **Extension de navigateur** — disponible et publique : installez-la depuis le [Chrome Web Store, Firefox Add-ons, ou le Mac App Store (Safari)](/qorex/browser-extension#install). Installez toujours depuis une fiche de store officielle.
- **Application Android** — disponible en production sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 ou ultérieur).
- **Application iOS** — disponible sur l'**App Store** : https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 ou ultérieur).

## Quelle version est disponible où {#versions}

L'examen par les stores suit son propre calendrier, si bien qu'un store peut brièvement servir une version plus ancienne ou plus récente qu'un autre. Au **15 octobre 2026** :

| Plateforme | Version disponible |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (une version corrective après la 0.3.6) |
| Safari (macOS) | 1.7.6, intégrant l'extension 0.3.6 |

Cette documentation décrit l'ensemble des fonctionnalités de la version 1.1.6 / 0.3.6. Un store qui sert encore une version plus ancienne rattrapera son retard automatiquement ; les stores affichent toujours leur version actuelle. Points marquants depuis 1.0.9 / 0.2.6 :

- **Plusieurs portefeuilles** sur un même téléphone ou navigateur, chacun avec sa propre phrase de récupération, avec un basculement en un geste — voir [Plusieurs portefeuilles](/qorex/getting-started#several-wallets).
- **Compte de type Ethereum (coin 60)**, ajouté manuellement, pour les phrases d'abord utilisées dans MetaMask ou sur le Dashboard — voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard).
- **Ajouter un token par contrat**, **Recevoir sur n'importe quel réseau**, **recherche** globale, une **visite** de première utilisation, un **widget d'écran d'accueil** et des **notifications push** à l'arrivée de QOR (mobile) — voir [Envoyer et recevoir](/qorex/send-and-receive).
- **Réclamer et restaker**, une vérification des frais avant la réclamation, une liste **Désengagement en cours** et des avertissements avant de staker au point de ne plus pouvoir unstaker — voir [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking).
- Des écrans d'approbation qui affichent chaque message, les frais, les limites de dépense et l'expiration, et refusent ce que QoreX ne peut pas afficher ; **`signAndBroadcast`** pour les dApps ; **Sites connectés** avec Révoquer (extension) ; la **fenêtre d'accès EVM** — voir [Sécurité et récupération](/qorex/security-and-recovery) et l'[Extension de navigateur](/qorex/browser-extension).
- Correctifs : un compte financé pouvait momentanément disparaître de « Vos comptes » (1.0.9) ; le bouton Retour matériel d'Android revient désormais d'un écran en arrière (1.1.1) ; la phrase de récupération est masquée aux services hors accessibilité sur Android 14 et versions ultérieures (1.1.6).
