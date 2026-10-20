---
slug: /qorex/account-and-dashboard
title: Compte et Dashboard
sidebar_label: Compte et Dashboard
sidebar_position: 6
---

# Compte et Dashboard

QoreX fonctionne **entièrement sans compte** — vos clés n'en dépendent jamais. La connexion ajoute des commodités comme les demandes de paiement et l'appairage au Dashboard, et elle est **requise pour réserver un @handle**. La connexion se fait par e-mail, ou avec Apple ou Google — voir ci-dessous.

## Se connecter {#sign-in}

Vous pouvez vous connecter depuis **Se connecter** dans l'onglet Accueil, ou pendant l'intégration. Méthodes :

- **Code par e-mail** — saisissez votre e-mail et recevez un code à usage unique. Après cette connexion, QoreX propose d'ajouter une **passkey** pour des connexions instantanées à l'avenir (Face ID / Touch ID / PIN). Il s'agit d'une passkey de *compte* — elle ne touche jamais aux clés de votre portefeuille.
- **Passkey** — si vous en avez enregistré une précédemment.
- **Se connecter avec Apple** *(iOS uniquement)* — Apple ne partage que votre nom et votre e-mail, et vous permet de masquer votre véritable adresse derrière une adresse relais privée.
- **Continuer avec Google** — un seul saut natif via la feuille d'authentification du système (l'application ne renvoie jamais vers un navigateur).
- **Continuer avec le Dashboard QORECHAIN** — connectez-vous avec un compte Dashboard existant (y compris sa connexion Google) et importez votre profil.

:::note
La proposition de passkey n'apparaît qu'après une connexion par **code e-mail**. Lorsque vous vous connectez avec un fournisseur d'identité (Apple, Google ou Dashboard), ce fournisseur gère sa propre authentification, si bien qu'une passkey ne peut pas être attachée à ces comptes.
:::

## Plusieurs comptes à partir d'une seule phrase {#accounts}

Paramètres → **Vos comptes** vous permet de créer et de basculer entre jusqu'à **20 comptes** par portefeuille, tous dérivés de la même phrase de récupération à 24 mots (il n'y a rien de plus à sauvegarder). Chaque compte possède sa propre adresse `qor1…` avec son propre solde, son propre @handle optionnel (un handle se lie à une **adresse**, et non au portefeuille) et — après son premier envoi — sa propre clé post-quantique. Touchez un compte pour en faire celui en cours d'utilisation. Le compte actif est celui utilisé par Envoyer, Recevoir, le Staking et le navigateur dApp — changer de compte déplace tout avec lui, et l'application indique sur quel compte vous êtes dès qu'il en existe plus d'un. Les comptes sont numérotés *Compte 1, 2, …* ; ils ne peuvent pas être renommés. L'extension de navigateur dispose du même écran — voir [Plusieurs comptes à partir d'une seule phrase](/qorex/browser-extension#wallet).

- **Ajouter un compte** ajoute le compte suivant sur la même phrase. Un nouveau compte enregistre sa propre clé résistante au quantique lors de son premier envoi, ce qui entraîne de faibles frais réseau uniques.
- **Ajouter un compte Ethereum (coin 60)** est destiné à une phrase de récupération utilisée en premier lieu dans MetaMask ou sur le Dashboard QoreChain — c'est là que se trouvent ses fonds. Il utilise le chemin Ethereum `m/44'/60'` et porte l'étiquette *Ethereum · coin 60* ; son adresse `0x…` est la même sur tous les réseaux EVM et correspond à la même clé que ce compte QoreChain. Voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard).
- **Restaurer** une phrase sur un nouvel appareil ne ramène que le **Compte 1** ; utilisez **Ajouter un compte** (et **Ajouter un compte Ethereum (coin 60)**) pour retrouver les autres. L'écran Adresses (**Paramètres → Vos adresses**) est distinct : il liste chaque compte de ce portefeuille ainsi que les adresses en lecture seule liées depuis d'autres portefeuilles.

## @handle {#handle}

Réservez un nom unique (par exemple `@liviu`) lié à votre adresse par **double signature** (une signature ed25519 du registre + votre propre signature secp256k1). N'importe qui peut ensuite envoyer vers votre @handle. La résolution se fait selon le principe **vérifier-puis-épingler** (confiance à la première utilisation) : ainsi, si la clé d'un handle est un jour modifiée en silence, QoreX le signale.

Comme un handle se lie à une adresse plutôt qu'à votre portefeuille, le réserver se fait **par adresse** — si vous avez [plusieurs comptes](#accounts), chacun peut porter son propre @handle, et en réserver un pour un compte ne donne pas automatiquement un nom aux autres. Réserver un handle nécessite un compte connecté et se fait **dans l'application mobile**. Dans l'extension de navigateur, vous pouvez payer un handle (la recherche fonctionne à partir de l'extension 0.3.7) mais pas en réserver un — l'extension vous renvoie vers l'application. Les comptes de type Ethereum (coin 60) n'ont pas de handle. Les noms imitant QoreChain sont réservés : un nouveau handle qui imite le projet (ses noms de marque, ou des mots de confiance tels que *official*, *support*, *airdrop* ou *treasury*, y compris les orthographes approchantes) est refusé. Les propriétaires existants peuvent toujours supprimer leur handle.

Si le registre des handles est temporairement inaccessible, l'écran se rabat sur **« Handles bientôt disponibles »** et tout le reste continue de fonctionner ; les handles se réactivent automatiquement dès le retour du registre.

:::note Réserver un handle vs. lier au Dashboard
Ce sont deux actions distinctes et sans rapport. Réserver un @handle permet **aux autres de vous envoyer des fonds par votre nom** — cela ne fait rien de plus par soi-même. Lier au Dashboard (ci-dessous) connecte votre portefeuille à un compte Dashboard afin que les deux puissent afficher les mêmes données. Vous pouvez faire l'un sans l'autre.
:::

## Compte lié {#linked-account}

**Paramètres → Compte lié** connecte votre portefeuille QoreX et votre compte Dashboard dans les deux sens :

1. Saisissez le code à 8 caractères affiché par le Dashboard, **ou** générez-en un dans QoreX (valable 10 minutes) et saisissez-le dans le Dashboard.
2. Si vous avez [plusieurs comptes](#accounts), la fenêtre d'approbation propre à QoreX vous laisse choisir **lequel** se lie — elle ne présuppose pas le compte actuellement actif.
3. Une fois liés, votre @handle et vos adresses connectées apparaissent des deux côtés.
4. Dissociez à tout moment.

Se connecter *via* **Continuer avec le Dashboard** lie les deux implicitement — il n'y a rien de plus à faire.

## Intégration au Dashboard {#dashboard}

Avec le Dashboard connecté :

- **Connect with QoreX** sur le Dashboard l'appaire à votre portefeuille via un deep link `qorex://connect` accompagné d'une preuve de propriété signée.
- **Les transferts initiés sur le Dashboard** arrivent dans QoreX sous forme de requêtes `qorex://tx`. Elles sont décodées, présentées intégralement, et signées **uniquement dans l'application** après approbation biométrique — et seulement depuis l'adresse dérivée propre à l'application. Comme une adresse `qor1…` est valide aussi bien sur le mainnet que sur le testnet, chaque requête initiée depuis le Dashboard indique le réseau qu'elle cible, et QoreX refuse d'agir dessus si celui-ci ne correspond pas au réseau auquel vous êtes actuellement connecté — l'application ne change jamais de réseau au nom d'une requête.
- Si une requête Connect ou de transfert arrive alors que vous n'êtes **pas connecté**, QoreX propose une étape intégrée **« Se connecter au Dashboard »** afin que vous puissiez continuer sans vous retrouver dans une impasse.
- **Vos adresses (Paramètres)** — répertorie chaque compte dérivé de ce portefeuille, ainsi que les adresses en **lecture seule** que vous avez liées depuis d'autres portefeuilles (Keplr / MetaMask / Phantom). Les entrées en lecture seule portent le nom du portefeuille qui les a créées ; tenter d'envoyer depuis l'une d'elles explique que vous devez envoyer depuis le portefeuille qui l'a créée.

## Supprimer votre compte {#delete-account}

Paramètres → **Supprimer le compte** (l'entrée rouge en bas). Après une confirmation et un déverrouillage biométrique, QoreX efface définitivement : le portefeuille et les clés privées de cet appareil ; votre @handle dans le registre QoreX (le cas échéant) ; votre compte Dashboard QoreChain (si vous vous êtes connecté) ; et votre configuration de récupération sociale (si elle est configurée). Cette action est irréversible. Comme QoreX est non custodial, **si vous n'avez pas sauvegardé votre phrase de récupération, vous perdrez l'accès à tous les fonds** — sauvegardez-la d'abord. Les suppressions côté serveur sont effectuées au mieux ; l'effacement sur l'appareil aboutit toujours et ramène l'application à l'écran de premier lancement.

## Étapes suivantes

- [Sécurité et récupération](/qorex/security-and-recovery) — sauvegarde, récupération et fenêtre d'accès EVM.
- [Navigateur dApp](/qorex/dapp-browser) — connectez-vous aux applications depuis QoreX.
