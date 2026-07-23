---
slug: /qorex/account-and-dashboard
title: Compte et Dashboard
sidebar_label: Compte et Dashboard
sidebar_position: 6
---

# Compte et Dashboard

QoreX fonctionne **entièrement sans compte** — vos clés n'en dépendent jamais. La connexion n'ajoute que des commodités comme les @handles, les demandes de paiement et l'appairage au Dashboard.

## Se connecter {#sign-in}

Vous pouvez vous connecter depuis **Se connecter** dans l'onglet Accueil, ou pendant l'intégration. Méthodes :

- **Code par e-mail** — saisissez votre e-mail et recevez un code à usage unique. Après cette connexion, QoreX propose d'ajouter une **passkey** pour des connexions instantanées à l'avenir (Face ID / Touch ID / PIN). Il s'agit d'une passkey de *compte* — elle ne touche jamais aux clés de votre portefeuille.
- **Passkey** — si vous en avez enregistré une précédemment.
- **Continuer avec Google** — un seul saut natif via la feuille d'authentification du système (l'application ne renvoie jamais vers un navigateur).
- **Continuer avec le Dashboard QORECHAIN** — connectez-vous avec un compte Dashboard existant (y compris sa connexion Google) et importez votre profil.

:::note
La proposition de passkey n'apparaît qu'après une connexion par **code e-mail**. Lorsque vous vous connectez avec un fournisseur d'identité (Google ou Dashboard), ce fournisseur gère sa propre authentification, si bien qu'une passkey ne peut pas être attachée à ces comptes.
:::

## @handle {#handle}

Réservez un nom unique (par exemple `@liviu`) lié à votre adresse par **double signature** (une signature ed25519 du registre + votre propre signature secp256k1). N'importe qui peut ensuite envoyer vers votre @handle. La résolution se fait selon le principe **vérifier-puis-épingler** (confiance à la première utilisation) : ainsi, si la clé d'un handle est un jour modifiée en silence, QoreX le signale.

Si le registre des handles est temporairement inaccessible, l'écran se rabat sur **« Handles bientôt disponibles »** et tout le reste continue de fonctionner ; les handles se réactivent automatiquement dès le retour du registre.

## Compte lié {#linked-account}

**Paramètres → Compte lié** connecte votre portefeuille QoreX et votre compte Dashboard dans les deux sens :

1. Saisissez le code à 8 caractères affiché par le Dashboard, **ou** générez-en un dans QoreX (valable 10 minutes) et saisissez-le dans le Dashboard.
2. Une fois liés, votre @handle et vos adresses connectées apparaissent des deux côtés.
3. Dissociez à tout moment.

Se connecter *via* **Continuer avec le Dashboard** lie les deux implicitement — il n'y a rien de plus à faire.

## Intégration au Dashboard {#dashboard}

Avec le Dashboard connecté :

- **Connect with QoreX** sur le Dashboard l'appaire à votre portefeuille via un deep link `qorex://connect` accompagné d'une preuve de propriété signée.
- **Les transferts initiés sur le Dashboard** arrivent dans QoreX sous forme de requêtes `qorex://tx`. Elles sont décodées, présentées intégralement, et signées **uniquement dans l'application** après approbation biométrique — et seulement depuis l'adresse dérivée propre à l'application.
- Si une requête Connect ou de transfert arrive alors que vous n'êtes **pas connecté**, QoreX propose une étape intégrée **« Se connecter au Dashboard »** afin que vous puissiez continuer sans vous retrouver dans une impasse.
- **Vos adresses (Paramètres)** — répertorie chaque compte dérivé de ce portefeuille, ainsi que les adresses en **lecture seule** que vous avez liées depuis d'autres portefeuilles (Keplr / MetaMask / Phantom). Les entrées en lecture seule portent le nom du portefeuille qui les a créées ; tenter d'envoyer depuis l'une d'elles explique que vous devez envoyer depuis le portefeuille qui l'a créée.

## Étapes suivantes

- [Sécurité et récupération](/qorex/security-and-recovery) — les signataires liés et les limites de dépense s'appuient sur cet appairage.
- [Navigateur dApp](/qorex/dapp-browser) — connectez-vous aux applications depuis QoreX.
