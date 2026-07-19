---
slug: /qorex/send-and-receive
title: Envoyer et recevoir
sidebar_label: Envoyer et recevoir
sidebar_position: 3
---

# Envoyer et recevoir

L'onglet Accueil (Portefeuille) est votre point de départ. Il affiche un **badge de réseau** (MAINNET par défaut, ou TESTNET si vous avez activé le sélecteur développeur), votre **solde total** (touchez pour masquer/afficher) et les principales actions : **Envoyer · Recevoir · Échanger · Staker**. Votre liste d'actifs affiche **QOR** (Native + post-quantique 🛡, un solde unifié entre les lanes Native/EVM/SVM) et **Tous les réseaux** (une vue unifiée ETH · BNB · POL · ARB).

## Envoyer des QOR résistants au quantique

1. Touchez **Envoyer**.
2. Saisissez le destinataire sous forme d'adresse `qor1…` **ou** de **@handle**. Un handle est résolu et vérifié cryptographiquement (signature du registre + signature du propriétaire + épinglage trust-on-first-use) ; si la clé d'un handle change un jour silencieusement, QoreX affiche un avertissement explicite.
3. Saisissez le montant. L'aperçu affiche le destinataire, le montant, les frais et l'état du **Shield** — le niveau de protection post-quantique de la signature.
4. Confirmez par approbation **biométrique**. QoreX signe le transfert avec la signature hybride post-quantique obligatoire (ML-DSA-87 + secp256k1) et le diffuse sur la lane Native.

Votre **premier** transfert enregistre également votre clé post-quantique automatiquement sur la chaîne — vous pouvez le constater dans [Sécurité et récupération](/qorex/security-and-recovery#pqc-key). Aucune étape distincte n'est nécessaire.

## Recevoir des QOR

Touchez **Recevoir** pour afficher votre adresse `qor1…` sous forme de code QR (avec l'icône QoreChain intégrée) et un bouton de copie. Partagez l'un ou l'autre avec l'expéditeur.

## Demander un paiement

Touchez **Demander** (nécessite une [connexion](/qorex/account-and-dashboard#sign-in)) pour créer une demande de paiement — un montant plus une note facultative — sous forme de code QR ou de lien. Quiconque le scanne voit le transfert pré-rempli.

## Réseaux et jetons externes

Depuis **Tous les réseaux** (ou Envoyer-externe), vous pouvez envoyer **ETH, BNB, POL, ARB et SOL** nativement, ainsi que des jetons **ERC-20** et **SPL** — tous dérivés de la même phrase de récupération (ETH utilise `m/44'/60'`, SOL utilise son chemin standard et SPL utilise des comptes de jetons associés).

:::caution Les chaînes externes sont uniquement classiques
Les autres blockchains ne peuvent pas transporter de signatures post-quantiques. Lorsque vous envoyez sur un réseau externe, QoreX l'indique explicitement (le transfert utilise une signature classique et le **Shield** affiche le déclassement). Vos **QOR** restent toujours sur la lane Native protégée. Les envois externes basés sur Cosmos prennent en charge une note facultative.
:::

## Échanger

L'onglet **Échanger** est relié à l'AMM on-chain de QoreChain mais reste désactivé — le bouton indique **« Swap — coming with pool liquidity »** — jusqu'à ce que la liquidité et le feature flag distant l'activent. Lorsque cela se produit, il s'active automatiquement ; **aucune mise à jour de l'application n'est nécessaire**.

## Étapes suivantes

- [Portefeuille et staking](/qorex/portfolio-and-staking) — consultez votre répartition et gagnez des récompenses.
- [Sécurité et récupération](/qorex/security-and-recovery) — protégez et récupérez votre portefeuille.
