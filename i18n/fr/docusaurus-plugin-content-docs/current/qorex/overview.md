---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Aperçu
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille officiel **non dépositaire** de **QoreChain**, la Layer 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et stockées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne collectent **aucune donnée**. Chaque transfert de QOR sur la lane Native porte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), de sorte que vos fonds sont protégés à la fois contre les attaquants classiques et quantiques.

QoreX se compose de deux parties qui fonctionnent ensemble :

- **Application mobile** (iOS et Android) — le portefeuille complet : créer/restaurer, envoyer et recevoir des QOR résistants au quantique, réseaux externes, staking, portefeuille, récupération et un navigateur de dApp intégré.
- **Extension de navigateur** (Chrome et Firefox, avec Safari à partir de la même base de code) — le connecteur de dApp pour ordinateur : elle permet aux sites web de découvrir votre portefeuille et transforme chaque requête en une approbation explicite.

## Disponibilité par plateforme

| Fonctionnalité | App iOS/Android | Extension Chrome/Firefox |
|---|---|---|
| Créer / restaurer / lier un portefeuille | ✅ | — (se jumelle avec l'app) |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | via la signature dApp |
| Réseaux externes (ETH / BNB / POL / ARB / SOL + jetons) | ✅ | ✅ (envoi depuis le popup) |
| Staking, Portefeuille, Q-Day Scanner, Récupération, Legacy | ✅ | — |
| Connexions de dApp | ✅ (navigateur intégré) | ✅ (n'importe quel site web) |
| Compte (@handle, demandes de paiement, lien Dashboard) | ✅ | — |

## Pourquoi QoreX est différent

- **Résistant au quantique par défaut** — les transferts de QOR sur la lane Native portent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui est classique (chaînes externes) est clairement étiqueté, jamais silencieux.
- **Véritablement non dépositaire** — les clés sont générées sur l'appareil et résident dans un coffre-fort matériel (Secure Enclave sur iOS, StrongBox sur Android) ou un coffre-fort chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune collecte de données** — pas d'analytique, de suivi ni de publicité dans aucune application QoreX. Une connexion de compte optionnelle ajoute des commodités (voir [Compte et Dashboard](/qorex/account-and-dashboard)) mais le portefeuille n'en dépend jamais.
- **Un solde unifié** — vos QOR forment un seul solde à travers les lanes Native, EVM et SVM ; QoreX les affiche comme un chiffre unique.
- **Plusieurs voies de récupération** — une phrase de récupération de 24 mots (toujours), une récupération sociale optionnelle avec des gardiens et un verrouillage temporel de 48 heures, un héritage Legacy optionnel et un jumelage multi-appareils pratique.

## Pour commencer

- Nouveau sur QoreX ? Commencez par [Pour commencer](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

:::note Téléchargement et disponibilité
QoreX **1.0** est en cours de déploiement sur les magasins d'applications — les applications iOS et Android (App Store et Google Play) et l'extension de navigateur (Chrome Web Store, Firefox Add-ons et une version Safari). Certaines cibles peuvent encore être dans la file d'attente de validation d'un magasin à un moment donné. Trouvez toujours les liens de téléchargement officiels et à jour sur [qorechain.io](https://qorechain.io), et n'installez QoreX qu'à partir d'une fiche officielle de magasin.
:::
