---
slug: /qorex/account-and-dashboard
title: Compte et Dashboard
sidebar_label: Compte et Dashboard
sidebar_position: 6
---

# Compte et Dashboard

QoreX fonctionne **entièrement sans compte** — vos clés n'en dépendent jamais. La connexion ne fait qu'ajouter des commodités comme les @handles, les demandes de paiement et l'appairage au Dashboard.

## Se connecter {#sign-in}

Vous pouvez vous connecter depuis **Se connecter** sur l'onglet Accueil, ou pendant l'intégration. Méthodes :

- **Code par e-mail** — saisissez votre e-mail et recevez un code à usage unique. Après cette connexion, QoreX propose d'ajouter une **passkey** pour des connexions futures instantanées (Face ID / Touch ID / code PIN). Il s'agit d'une passkey de *compte* — elle ne touche jamais aux clés de votre portefeuille.
- **Passkey** — si vous en avez enregistré une auparavant.
- **Continuer avec Google** — un unique saut natif via la fiche d'authentification du système (l'application ne bascule jamais vers un navigateur).
- **Continuer avec QORECHAIN Dashboard** — connectez-vous avec un compte Dashboard existant (y compris sa connexion Google) et importez votre profil.

:::note
La proposition de passkey n'apparaît qu'après une connexion par **code e-mail**. Lorsque vous vous connectez avec un fournisseur d'identité (Google ou Dashboard), ce fournisseur gère sa propre authentification, de sorte qu'une passkey ne peut pas être rattachée à ces comptes.
:::

## @handle {#handle}

Réservez un nom unique (par exemple `@liviu`) lié à votre adresse par **double signature** (une signature ed25519 du registre + votre propre signature secp256k1). N'importe qui peut ensuite envoyer vers votre @handle. La résolution est de type **verify-then-pin** (confiance au premier usage) : si la clé d'un handle est un jour modifiée silencieusement, QoreX le signale.

Si le registre des handles est temporairement injoignable, l'écran se replie sur **« Handles bientôt disponibles »** et tout le reste continue de fonctionner ; les handles se réactivent automatiquement dès le retour du registre.

## Compte lié {#linked-account}

**Paramètres → Compte lié** relie votre portefeuille QoreX et votre compte Dashboard dans les deux sens :

1. Saisissez le code à 8 caractères affiché par le Dashboard, **ou** générez-en un dans QoreX (valable 10 minutes) et saisissez-le dans le Dashboard.
2. Une fois liés, votre @handle et vos adresses connectées apparaissent sur les deux.
3. Dissociez à tout moment.

Se connecter *via* **Continuer avec Dashboard** relie les deux implicitement — il n'y a rien de plus à faire.

## Intégration au Dashboard {#dashboard}

Avec le Dashboard connecté :

- **Connect with QoreX** sur le Dashboard l'appaire à votre portefeuille via un lien profond `qorex://connect` et une preuve de propriété signée.
- **Les transferts lancés depuis le Dashboard** arrivent dans QoreX sous forme de requêtes `qorex://tx`. Elles sont décodées, présentées à vous dans leur intégralité et signées **uniquement dans l'application** après approbation biométrique — et uniquement depuis l'adresse dérivée propre à l'application.
- **Vos adresses (Paramètres)** — répertorie chaque compte dérivé de ce portefeuille, ainsi que les adresses en **lecture seule** que vous avez liées depuis d'autres portefeuilles (Keplr / MetaMask / Phantom). Les entrées en lecture seule sont étiquetées avec le portefeuille qui les a créées ; toute tentative d'envoi depuis l'une d'elles explique que vous devez envoyer depuis le portefeuille qui l'a créée.

## Étapes suivantes

- [Sécurité et Récupération](/qorex/security-and-recovery) — les signataires liés et les limites de dépense s'appuient sur cet appairage.
- [Navigateur dApp](/qorex/dapp-browser) — connectez-vous à des applications depuis QoreX.
