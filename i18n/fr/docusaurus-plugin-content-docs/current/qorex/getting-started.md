---
slug: /qorex/getting-started
title: Premiers pas avec QoreX
sidebar_label: Premiers pas
sidebar_position: 2
---

# Premiers pas avec QoreX

Cette page décrit l'installation de l'application mobile ainsi que la création, la restauration ou la liaison de votre portefeuille.

## Avant de commencer : sécurisez votre appareil

Un portefeuille QoreX ne peut être créé ou importé que si votre appareil dispose d'un **facteur de déverrouillage fort** configuré. C'est ce qui protège vos clés dans le coffre matériel. Tout élément suivant convient :

- **iOS** — Face ID ou Touch ID.
- **Android** — une biométrie Class-3 (empreinte digitale, iris ou déverrouillage facial 3D) **ou** un verrouillage d'écran de l'appareil (PIN, pattern ou password).

:::note Déverrouillage facial 2D sur Android
Le déverrouillage facial 2D basé sur la caméra (présent sur certains appareils, par exemple certains modèles Samsung) est considéré comme une biométrie *faible*. Si c'est tout ce dont vous disposez, QoreX s'appuie sur le **PIN / pattern** situé derrière — et la fiche système le propose automatiquement, vous êtes donc quand même couvert.
:::

Si aucun facteur fort n'est enregistré, les boutons de création/import restent désactivés et l'écran explique ce qu'il faut activer. Configurez Face ID, une empreinte digitale ou un verrouillage d'écran dans les réglages de votre système, puis revenez à QoreX.

## Premier lancement

L'application s'ouvre sur l'écran d'accueil (onboarding) **uniquement lorsqu'aucun portefeuille n'existe sur l'appareil**. Une fois que vous avez un portefeuille, chaque lancement ultérieur mène directement à l'onglet Home (Wallet). La consultation des soldes ne nécessite aucune biométrie ; **la signature d'une transaction en nécessite toujours une**.

Vous disposez de trois façons de procéder à la configuration :

### 1. Créer un nouveau portefeuille

1. Touchez **Create a new wallet**.
2. QoreX génère une **phrase de récupération de 24 mots** sur votre appareil (256 bits d'entropie) et dérive votre identité QoreChain — coin type 118, une adresse `qor1…` (vos comptes ETH et SOL proviennent de la même graine).
3. **Notez les 24 mots** et conservez-les hors ligne. Cette phrase est le **seul** moyen de récupérer votre portefeuille si vous perdez l'appareil.
4. Confirmez la phrase ; QoreX la scelle dans le coffre matériel protégé par biométrie.

:::caution Votre phrase de récupération est primordiale
Quiconque possède vos 24 mots contrôle vos fonds, et personne — pas même QoreChain Association — ne peut les récupérer à votre place. Ne saisissez jamais votre phrase sur un site web, ne la partagez pas et ne la stockez pas dans une capture d'écran ou une note dans le cloud.
:::

### 2. Restaurer un portefeuille existant

1. Touchez **Restore existing wallet**.
2. Saisissez vos 24 mots dans l'ordre.
3. QoreX redérive les mêmes adresses — votre portefeuille est identique sur n'importe quel appareil.

### 3. Lier depuis un autre appareil

Si vous avez déjà QoreX sur un autre téléphone ou une tablette, vous pouvez transférer le portefeuille **sans serveur ni saisie** — voir [Lier un nouvel appareil](/qorex/security-and-recovery#link-device). Choisissez **Link from another device** sur le nouvel appareil pour commencer.

## Facultatif : revendiquer un @handle

Une fois votre portefeuille créé, vous pouvez revendiquer un **@handle** unique (par exemple `@liviu`) afin que les gens puissent vous envoyer des fonds par nom plutôt que via une adresse `qor1…`. C'est facultatif et peut être ignoré — votre portefeuille n'en dépend jamais. Voir [Compte et Dashboard](/qorex/account-and-dashboard#handle).

## Prochaines étapes

- [Envoyer et recevoir](/qorex/send-and-receive) — effectuez votre premier transfert résistant au quantique.
- [Sécurité et récupération](/qorex/security-and-recovery) — configurez la récupération sociale pour ne jamais être bloqué.
- [Portefeuille et staking](/qorex/portfolio-and-staking) — suivez vos actifs et gagnez des récompenses de staking.
