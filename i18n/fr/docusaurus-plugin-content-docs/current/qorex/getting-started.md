---
slug: /qorex/getting-started
title: Démarrer avec QoreX
sidebar_label: Démarrer
sidebar_position: 2
---

# Démarrer avec QoreX

Cette page décrit l'installation de l'**application mobile** ainsi que la création, la restauration ou la liaison de votre portefeuille. Pour le portefeuille de bureau, consultez l'[Extension de navigateur](/qorex/browser-extension), disponible sur Chrome, Firefox et Safari.

:::note Disponibilité mobile
- **Android** — disponible en production sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponible sur l'App Store : https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Avant de commencer : sécurisez votre appareil

Un portefeuille QoreX ne peut être créé ou importé que si votre appareil dispose d'un **facteur de déverrouillage fort** configuré. C'est ce qui protège vos clés dans le coffre matériel. L'un des éléments suivants suffit :

- **iOS** — Face ID ou Touch ID.
- **Android** — une donnée biométrique de classe 3 (empreinte digitale, iris ou déverrouillage facial 3D) **ou** un verrouillage d'écran de l'appareil (PIN, schéma ou mot de passe).

:::note Déverrouillage facial 2D sur Android
Le déverrouillage facial 2D par caméra (présent sur certains appareils, par exemple certains modèles Samsung) est considéré comme une donnée biométrique *faible*. Si c'est tout ce dont vous disposez, QoreX s'appuie sur le **PIN / schéma** placé derrière — et la fenêtre système le propose automatiquement, vous restez donc protégé.
:::

Si aucun facteur fort n'est enregistré, les boutons de création/importation restent désactivés et l'écran explique ce qu'il faut activer. Configurez Face ID, une empreinte digitale ou un verrouillage d'écran dans les paramètres de votre système, puis revenez dans QoreX.

## Premier lancement

L'application s'ouvre sur l'écran d'accueil de configuration **uniquement si aucun portefeuille n'existe sur l'appareil**. Une fois votre portefeuille en place, chaque lancement ultérieur vous amène directement à l'onglet Accueil (Portefeuille). Consulter les soldes ne nécessite aucune biométrie ; **signer une transaction en exige toujours une**.

Vous disposez de trois façons de démarrer :

### 1. Créer un nouveau portefeuille

1. Appuyez sur **Créer un nouveau portefeuille**.
2. QoreX génère une **phrase de récupération de 24 mots** sur votre appareil (entropie de 256 bits) et dérive votre identité QoreChain — coin type 118, une adresse `qor1…` (vos comptes ETH et SOL proviennent de la même graine).
3. **Notez les 24 mots** et conservez-les hors ligne. Cette phrase est le **seul** moyen de récupérer votre portefeuille si vous perdez l'appareil.
4. Confirmez la phrase ; QoreX la scelle dans le coffre matériel protégé par la biométrie.

:::caution Votre phrase de récupération est essentielle
Toute personne détenant vos 24 mots contrôle vos fonds, et personne — y compris QoreChain Association — ne peut les récupérer à votre place. Ne saisissez jamais votre phrase sur un site web, ne la partagez pas et ne la stockez pas dans une capture d'écran ou une note dans le cloud. **Désinstaller QoreX supprime les clés stockées sur cet appareil** — sans votre phrase écrite (ou sans [récupération sociale](/qorex/security-and-recovery#social-recovery) configurée au préalable), une désinstallation entraîne une perte d'accès définitive. Faites votre sauvegarde avant d'alimenter le portefeuille, pas après.
:::

### 2. Restaurer un portefeuille existant

1. Appuyez sur **Restaurer un portefeuille existant**.
2. Saisissez vos 24 mots dans l'ordre.
3. QoreX dérive à nouveau les mêmes adresses — votre portefeuille est identique sur n'importe quel appareil.

### 3. Lier depuis un autre appareil

Si vous avez déjà QoreX sur un autre téléphone ou une tablette, vous pouvez transférer le portefeuille **sans serveur et sans rien saisir** — voir [Lier un nouvel appareil](/qorex/security-and-recovery#link-device). Choisissez **Lier depuis un autre appareil** sur le nouvel appareil pour commencer.

## Facultatif : réclamer un @handle

Une fois votre portefeuille créé, vous pouvez réclamer un **@handle** unique (par exemple `@liviu`) afin que l'on puisse vous envoyer des fonds par nom plutôt qu'à une adresse `qor1…`. C'est facultatif et vous pouvez passer cette étape — votre portefeuille n'en dépend jamais. Un handle est associé à une adresse précise plutôt qu'au portefeuille dans son ensemble, ce qui compte dès que vous avez plus d'un compte — voir [Plusieurs comptes issus d'une seule phrase](/qorex/account-and-dashboard#accounts) et [@handle](/qorex/account-and-dashboard#handle).

## Langue

QoreX est disponible en dix langues — anglais, roumain, allemand, espagnol, français, italien, turc, arabe, japonais et coréen — et suit automatiquement la langue de votre téléphone, avec repli sur l'anglais pour toute autre langue. Vous pouvez modifier la langue détectée à tout moment depuis **Paramètres → Langue** ; le choix de l'arabe bascule aussi l'interface en mode droite-à-gauche.

## Étapes suivantes

- [Envoyer et recevoir](/qorex/send-and-receive) — effectuez votre premier transfert résistant au quantique.
- [Sécurité et récupération](/qorex/security-and-recovery) — configurez la récupération sociale pour ne jamais rester bloqué.
- [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking) — suivez vos actifs et gagnez des récompenses de staking.
