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

## Plusieurs comptes à partir d'une seule phrase {#accounts}

Paramètres → **Vos comptes** (également accessible sous **Adresses**) vous permet de créer, changer et renommer jusqu'à **20 comptes**, tous dérivés de la même phrase de récupération à 24 mots (il n'y a rien de plus à sauvegarder). Chaque compte possède sa propre adresse distincte `qor1…` avec son propre solde et — comme un handle se lie à une **adresse**, et non au portefeuille dans son ensemble — son propre @handle optionnel. Le compte actif est celui utilisé par Envoyer, Recevoir, le Staking et le navigateur dApp. Depuis la **0.2.2**, l'extension de navigateur dispose également de cette fonctionnalité — voir [Plusieurs comptes à partir d'une seule phrase](/qorex/browser-extension#wallet).

## @handle {#handle}

Réservez un nom unique (par exemple `@liviu`) lié à votre adresse par **double signature** (une signature ed25519 du registre + votre propre signature secp256k1). N'importe qui peut ensuite envoyer vers votre @handle. La résolution se fait selon le principe **vérifier-puis-épingler** (confiance à la première utilisation) : ainsi, si la clé d'un handle est un jour modifiée en silence, QoreX le signale.

Comme un handle se lie à une adresse plutôt qu'à votre portefeuille, le réserver se fait **par adresse** — si vous avez [plusieurs comptes](#accounts), chacun peut porter son propre @handle, et en réserver un pour un compte ne donne pas automatiquement un nom aux autres. L'extension de navigateur peut elle aussi réserver un handle pour sa propre adresse unique, directement depuis le popup.

Si le registre des handles est temporairement inaccessible, l'écran se rabat sur **« Handles bientôt disponibles »** et tout le reste continue de fonctionner ; les handles se réactivent automatiquement dès le retour du registre.

:::note Réserver un handle vs. lier au Dashboard
Ce sont deux actions distinctes et sans rapport. Réserver un @handle permet **aux autres de vous envoyer des fonds par votre nom** — cela ne fait rien de plus par soi-même. Lier au Dashboard (ci-dessous) connecte votre portefeuille à un compte Dashboard afin que les deux puissent afficher les mêmes données. Vous pouvez faire l'un sans l'autre.
:::

## Compte lié {#linked-account}

**Paramètres → Compte lié** connecte votre portefeuille QoreX et votre compte Dashboard dans les deux sens :

1. Saisissez le code à 8 caractères affiché par le Dashboard, **ou** générez-en un dans QoreX (valable 10 minutes) et saisissez-le dans le Dashboard.
2. Une fois liés, votre @handle et vos adresses connectées apparaissent des deux côtés.
3. Dissociez à tout moment.

Se connecter *via* **Continuer avec le Dashboard** lie les deux implicitement — il n'y a rien de plus à faire.

## Intégration au Dashboard {#dashboard}

Avec le Dashboard connecté :

- **Connect with QoreX** sur le Dashboard l'appaire à votre portefeuille via un deep link `qorex://connect` accompagné d'une preuve de propriété signée.
- **Les transferts initiés sur le Dashboard** arrivent dans QoreX sous forme de requêtes `qorex://tx`. Elles sont décodées, présentées intégralement, et signées **uniquement dans l'application** après approbation biométrique — et seulement depuis l'adresse dérivée propre à l'application. Comme une adresse `qor1…` est valide aussi bien sur le mainnet que sur le testnet, chaque requête initiée depuis le Dashboard indique le réseau qu'elle cible, et QoreX refuse d'agir dessus si celui-ci ne correspond pas au réseau auquel vous êtes actuellement connecté — l'application ne change jamais de réseau au nom d'une requête.
- Si une requête Connect ou de transfert arrive alors que vous n'êtes **pas connecté**, QoreX propose une étape intégrée **« Se connecter au Dashboard »** afin que vous puissiez continuer sans vous retrouver dans une impasse.
- **Vos adresses (Paramètres)** — répertorie chaque compte dérivé de ce portefeuille, ainsi que les adresses en **lecture seule** que vous avez liées depuis d'autres portefeuilles (Keplr / MetaMask / Phantom). Les entrées en lecture seule portent le nom du portefeuille qui les a créées ; tenter d'envoyer depuis l'une d'elles explique que vous devez envoyer depuis le portefeuille qui l'a créée.

## Étapes suivantes

- [Sécurité et récupération](/qorex/security-and-recovery) — les signataires liés et les limites de dépense s'appuient sur cet appairage.
- [Navigateur dApp](/qorex/dapp-browser) — connectez-vous aux applications depuis QoreX.
