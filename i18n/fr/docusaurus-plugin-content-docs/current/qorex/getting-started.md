---
slug: /qorex/getting-started
title: Premiers pas avec QoreX
sidebar_label: Premiers pas
sidebar_position: 2
---

# Premiers pas avec QoreX

Cette page décrit l'installation de l'**application mobile** ainsi que la création, la restauration ou le rattachement de votre portefeuille. Pour le portefeuille de bureau, consultez l'[extension de navigateur](/qorex/browser-extension), disponible sur Chrome, Firefox et Safari.

:::note Disponibilité mobile
- **Android** — disponible sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponible en test via **TestFlight** si vous souhaitez l'essayer ; la version App Store est encore en cours d'examen. Retrouvez le lien d'invitation actuel sur [qorechain.io](https://qorechain.io).
:::

## Avant de commencer : sécurisez votre appareil

Un portefeuille QoreX ne peut être créé ou importé que si votre appareil dispose d'un **facteur de déverrouillage fort** configuré. C'est ce qui protège vos clés dans le coffre matériel. L'un des éléments suivants convient :

- **iOS** — Face ID ou Touch ID.
- **Android** — un biométrique de classe 3 (empreinte digitale, iris ou déverrouillage facial 3D) **ou** un verrouillage d'écran de l'appareil (code PIN, schéma ou mot de passe).

:::note Déverrouillage facial 2D Android
Le déverrouillage facial 2D basé sur la caméra (présent sur certains appareils, par exemple certains modèles Samsung) est considéré comme un biométrique *faible*. Si c'est tout ce dont vous disposez, QoreX s'appuie sur le **code PIN / schéma** qui le sous-tend — et la fiche système le propose automatiquement, vous êtes donc quand même couvert.
:::

Si aucun facteur fort n'est enregistré, les boutons de création/import restent désactivés et l'écran explique ce qu'il faut activer. Configurez Face ID, une empreinte digitale ou un verrouillage d'écran dans les paramètres de votre système, puis revenez à QoreX.

## Premier lancement

L'application s'ouvre sur l'écran d'intégration **uniquement lorsqu'aucun portefeuille n'existe sur l'appareil**. Une fois que vous disposez d'un portefeuille, chaque lancement ultérieur mène directement à l'onglet Accueil (Portefeuille). La consultation des soldes ne nécessite aucun biométrique ; **la signature d'une transaction en exige toujours un**.

Vous avez trois façons de procéder à la configuration :

### 1. Créer un nouveau portefeuille

1. Touchez **Créer un nouveau portefeuille**.
2. QoreX génère une **phrase de récupération de 24 mots** sur votre appareil (256 bits d'entropie) et dérive votre identité QoreChain — type de pièce 118, une adresse `qor1…` (vos comptes ETH et SOL proviennent de la même graine).
3. **Notez les 24 mots** et conservez-les hors ligne. Cette phrase est le **seul** moyen de récupérer votre portefeuille si vous perdez l'appareil.
4. Confirmez la phrase ; QoreX la scelle dans le coffre à protection matérielle, verrouillé par biométrie.

:::caution Votre phrase de récupération est essentielle
Toute personne détenant vos 24 mots contrôle vos fonds, et personne — y compris QoreChain Association — ne peut les récupérer à votre place. Ne saisissez jamais votre phrase sur un site web, ne la partagez jamais et ne la stockez jamais dans une capture d'écran ou une note cloud.
:::

### 2. Restaurer un portefeuille existant

1. Touchez **Restaurer un portefeuille existant**.
2. Saisissez vos 24 mots dans l'ordre.
3. QoreX dérive à nouveau les mêmes adresses — votre portefeuille est identique sur n'importe quel appareil.

### 3. Rattacher depuis un autre appareil

Si vous disposez déjà de QoreX sur un autre téléphone ou une tablette, vous pouvez déplacer le portefeuille **sans serveur ni saisie** — voir [Rattacher un nouvel appareil](/qorex/security-and-recovery#link-device). Choisissez **Rattacher depuis un autre appareil** sur le nouvel appareil pour commencer.

## Facultatif : réservez un @handle

Une fois votre portefeuille créé, vous pouvez réserver un **@handle** unique (par exemple `@liviu`) pour que les gens puissent vous envoyer des fonds par nom plutôt que par une adresse `qor1…`. C'est facultatif et ignorable — votre portefeuille n'en dépend jamais. Voir [Compte et tableau de bord](/qorex/account-and-dashboard#handle).

## Étapes suivantes

- [Envoyer et recevoir](/qorex/send-and-receive) — effectuez votre premier transfert à sécurité quantique.
- [Sécurité et récupération](/qorex/security-and-recovery) — configurez la récupération sociale pour ne jamais rester bloqué.
- [Portefeuille et staking](/qorex/portfolio-and-staking) — suivez vos actifs et gagnez des récompenses de staking.
