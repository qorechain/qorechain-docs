---
slug: /qorex/getting-started
title: Premiers pas avec QoreX
sidebar_label: Premiers pas
sidebar_position: 2
---

# Premiers pas avec QoreX

Cette page vous guide dans l'installation de l'application mobile et la création, la restauration ou la liaison de votre portefeuille.

## Avant de commencer : sécurisez votre appareil

Un portefeuille QoreX ne peut être créé ou importé que lorsque votre appareil dispose d'une **protection biométrique** activée — Face ID / Touch ID sur iOS, ou une empreinte digitale / un facteur fort équivalent sur Android. C'est ce qui protège vos clés dans le coffre matériel.

Si aucune biométrie n'est activée, les boutons de création/importation restent désactivés et l'écran explique ce qu'il faut activer. Activez Face ID ou une empreinte digitale dans les réglages de votre système, puis revenez à QoreX.

## Premier lancement

L'application s'ouvre sur l'écran d'accueil **uniquement lorsqu'aucun portefeuille n'existe sur l'appareil**. Une fois que vous avez un portefeuille, tous les lancements ultérieurs mènent directement à l'onglet Accueil (Portefeuille). La consultation des soldes ne nécessite aucune biométrie ; **la signature d'une transaction en nécessite toujours une**.

Vous disposez de trois façons de configurer :

### 1. Créer un nouveau portefeuille

1. Appuyez sur **Create a new wallet**.
2. QoreX génère une **phrase de récupération de 24 mots** sur votre appareil (entropie de 256 bits) et dérive votre identité QoreChain — coin type 118, une adresse `qor1…` (vos comptes ETH et SOL proviennent de la même graine).
3. **Notez les 24 mots** et conservez-les hors ligne. Cette phrase est le **seul** moyen de récupérer votre portefeuille si vous perdez l'appareil.
4. Confirmez la phrase ; QoreX la scelle dans le coffre matériel protégé par biométrie.

:::caution Votre phrase de récupération, c'est tout
Toute personne détenant vos 24 mots contrôle vos fonds, et personne — y compris la QoreChain Association — ne peut les récupérer à votre place. Ne saisissez jamais votre phrase sur un site web, ne la partagez pas et ne la stockez pas dans une capture d'écran ou une note cloud.
:::

### 2. Restaurer un portefeuille existant

1. Appuyez sur **Restore existing wallet**.
2. Saisissez vos 24 mots dans l'ordre.
3. QoreX redérive les mêmes adresses — votre portefeuille est identique sur n'importe quel appareil.

### 3. Lier depuis un autre appareil

Si vous avez déjà QoreX sur un autre téléphone ou une tablette, vous pouvez transférer le portefeuille **sans serveur ni saisie** — voir [Lier un nouvel appareil](/qorex/security-and-recovery#link-device). Choisissez **Link from another device** sur le nouvel appareil pour commencer.

## Facultatif : réclamer un @handle

Une fois votre portefeuille créé, vous pouvez réclamer un **@handle** unique (par exemple `@liviu`) afin que les gens puissent vous envoyer des fonds par nom plutôt que par une adresse `qor1…`. C'est facultatif et vous pouvez le passer — votre portefeuille n'en dépend jamais. Voir [Compte & Dashboard](/qorex/account-and-dashboard#handle).

## Étapes suivantes

- [Envoyer & Recevoir](/qorex/send-and-receive) — effectuez votre premier transfert résistant au quantique.
- [Sécurité & Récupération](/qorex/security-and-recovery) — configurez la récupération sociale pour ne jamais être bloqué.
- [Portefeuille & Staking](/qorex/portfolio-and-staking) — suivez vos actifs et gagnez des récompenses de staking.
