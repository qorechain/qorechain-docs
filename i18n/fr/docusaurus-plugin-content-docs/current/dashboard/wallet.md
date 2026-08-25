---
slug: /dashboard/wallet
title: Portefeuille
sidebar_label: Portefeuille
sidebar_position: 3
---

# Portefeuille

La page **Wallet** est l'endroit où vous consultez votre solde et votre historique de transactions, recevez des QOR et en envoyez. Le fonctionnement de la page dépend du réseau :

- **Mainnet — non custodial.** Le Dashboard ne détient pas les clés mainnet. Vous connectez votre propre portefeuille — **QoreX** (le portefeuille officiel de QoreChain, extension ou application), **Keplr**, ou **MetaMask** — votre solde réel et votre historique sont lus directement depuis la chaîne, et vous pouvez recevoir des fonds sur n'importe quel rail. L'envoi et le staking sur le **rail Native nécessitent QoreX** : les comptes QoreChain signent avec une signature post-quantique hybride, et QoreX est le portefeuille qui la produit, de sorte que les onglets Send et Stake du Dashboard passent par QoreX, quel que soit l'autre portefeuille que vous avez également connecté. Keplr peut tout de même être connecté pour consulter votre solde sur le rail Native (`qor1...`) et pour y recevoir des fonds. **MetaMask** signe et envoie de façon indépendante sur le **rail EVM** (`0x...`), qui utilise une signature classique et n'est pas concerné par cela.
- **Testnet — custodial.** Le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez essayer les transferts, les échanges et le staking sans aucune configuration. Alimentez-le depuis le [Faucet](/dashboard/faucet).

Les comptes sont protégés par une cryptographie résistante au quantique, et l'encodage Native de chaque adresse utilise le préfixe bech32 `qor` (`qor1...`).

## Un compte, trois encodages {#one-account-three-encodings}

Un compte QoreChain est une identité unique qui peut s'écrire de trois façons — une par rail d'exécution :

| Rail | Encodage | Ressemble à |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ex. `5Gv7...` |

Les trois encodages pointent vers le **même compte et le même solde**. Les fonds reçus sur n'importe quel rail arrivent dans votre solde unique, et le Dashboard indexe le solde et l'historique via l'encodage `qor1` (Native), de sorte que l'activité de tous les rails s'affiche ensemble.

## Utiliser le Portefeuille sur le mainnet {#mainnet}

1. Basculez l'en-tête du Dashboard sur **Mainnet**.
2. Si vous y êtes invité, acceptez la [reconnaissance des risques unique](/dashboard/overview#risk-acknowledgement) — le mainnet déplace des fonds réels, le Dashboard est non custodial, et les transactions sont irréversibles.
3. Sélectionnez **Connect Wallet** et choisissez un portefeuille — **QoreX** (recommandé, le portefeuille officiel de QoreChain — requis pour l'envoi et le staking sur le rail Native), **Keplr** (pour consulter/recevoir sur le rail Native), ou **MetaMask** (pour vous connecter, envoyer et recevoir sur le rail EVM). Les étapes détaillées pour chacun se trouvent ci-dessous.
4. La page charge votre solde réel et votre historique de transactions depuis la chaîne.

Une fois connectée, la page Wallet organise tout en six onglets : **Wallet** (solde et résumé du compte), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (vos adresses `qor1...` / `0x...` / SVM), et **Connect Wallets** (tous les portefeuilles que vous avez rattachés, et l'endroit où en connecter d'autres). Les onglets Send, Stake et Rewards passent par QoreX — c'est vrai même si vous avez également Keplr ou MetaMask connectés, car les transactions sur le rail Native nécessitent la signature post-quantique hybride que produit QoreX.

Si votre portefeuille n'a pas encore QoreChain configuré, ajoutez-le d'abord — voir [Ajouter QoreChain à votre portefeuille](#add-network).

### Se connecter avec QoreX — extension de navigateur {#connect-qorex-extension}

1. Sur la page Wallet, repérez la carte **QoreX wallet** et sélectionnez **Connect with QoreX**.
2. Comme l'extension QoreX (0.1.4 ou ultérieure) est détectée dans ce navigateur, le Dashboard vous demande comment vous souhaitez vous connecter. Sélectionnez **Browser extension**.
3. L'extension QoreX ouvre sa propre fenêtre contextuelle d'approbation, indiquant `dashboard.qorechain.io` comme site demandant la connexion.
4. Vérifiez la demande dans la fenêtre contextuelle et approuvez-la — cela signe une preuve ponctuelle que vous possédez votre adresse `qor1...` ; aucun fonds ne bouge et aucune autre permission n'est accordée.
5. La fenêtre contextuelle se ferme et le Dashboard affiche **Connected: qor1...** sur la carte QoreX, votre adresse débloquant le reste de la page Wallet. Le choix extension/application est mémorisé, donc la prochaine fois que vous sélectionnez **Connect with QoreX** sur ce navigateur, il se reconnecte de la même façon sans redemander — utilisez **Use a different method** sur la carte de connexion si vous souhaitez un jour changer.

Vous pouvez lier plus d'une adresse QoreX au même compte Dashboard — par exemple une depuis une extension Firefox et une depuis Chrome, ou un téléphone et un ordinateur portable. Sélectionnez **Add another wallet** pour répéter le processus avec une deuxième adresse ; chaque adresse liée peut recevoir sa propre étiquette, et l'une d'elles est marquée par défaut pour l'envoi, le tout depuis l'onglet **Connect Wallets**.

**Changer de portefeuille depuis l'onglet Wallet.** Dès que plus d'un portefeuille est rattaché — QoreX et MetaMask, ou deux adresses QoreX —, une rangée de puces de portefeuille apparaît en haut de l'onglet **Wallet** lui-même, une par portefeuille rattaché, avec celle du portefeuille actif marquée. Cliquez sur une puce pour changer le portefeuille dont vous consultez le solde et l'historique, sans quitter l'onglet ni aller sur **Connect Wallets**. La rangée est masquée lorsqu'un seul portefeuille est rattaché, puisqu'un sélecteur n'aurait alors rien à faire.

### Se connecter avec QoreX — application mobile {#connect-qorex-app}

1. Sur la page Wallet, repérez la carte **QoreX wallet** et sélectionnez **Connect with QoreX**.
2. Si le sélecteur d'extension apparaît, choisissez **QoreX app** (si aucune extension n'est détectée dans ce navigateur, le Dashboard passe directement à ce flux).
3. Le Dashboard affiche un code QR et un lien **Open QoreX**.
4. Sur votre téléphone, ouvrez l'application QoreX et scannez le code QR avec elle — ou, si vous naviguez depuis ce même téléphone, appuyez sur **Open QoreX** pour lancer l'application directement via son lien `qorex://connect`.
5. QoreX affiche la demande d'appairage avec l'origine du Dashboard. Vérifiez-la et approuvez-la avec votre confirmation biométrique (Face ID / Touch ID / PIN).
6. Le Dashboard interroge en arrière-plan pour obtenir l'approbation ; en quelques secondes, il affiche **Connected: qor1...** sur la carte QoreX, et votre adresse débloque le reste de la page Wallet.

### Se connecter avec Keplr {#connect-keplr}

Keplr se connecte pour consulter votre solde, votre historique et votre adresse de réception sur le rail Native. L'envoi et le staking sur le rail Native passent par QoreX (voir ci-dessous) — les comptes QoreChain signent avec une signature post-quantique hybride, ce qui explique pourquoi les onglets Send et Stake du Dashboard passent par QoreX plutôt que par le portefeuille que vous connectez ici.

1. Sur la page Wallet, sélectionnez **Connect Wallet** et choisissez **Keplr**.
2. Si QoreChain n'est pas encore configuré dans Keplr, le Dashboard déclenche l'invite `suggestChain` de Keplr — vérifiez les détails du réseau (ID de chaîne, points de terminaison RPC/REST) dans la fenêtre contextuelle de Keplr et sélectionnez **Approve** pour l'ajouter.
3. Keplr vous demande ensuite de sélectionner le compte à connecter et d'approuver la connexion — sélectionnez **Approve**.
4. Le Dashboard lit votre adresse `qor1...` et charge votre solde et votre historique.

### Se connecter avec MetaMask {#connect-metamask}

1. Sur la page Wallet, sélectionnez **Connect Wallet** et choisissez **MetaMask**.
2. Si le réseau EVM de QoreChain n'est pas encore ajouté, MetaMask affiche son invite **Add network** (EIP-3085) avec l'ID de chaîne, l'URL RPC et le symbole de la devise pré-remplis — vérifiez-la et sélectionnez **Approve**, puis **Switch network**.
3. MetaMask vous demande quel compte connecter — sélectionnez le compte et confirmez **Connect**.
4. Le Dashboard lit votre adresse `0x...` et charge votre solde et votre historique.

### Envoyer sur le mainnet {#send-mainnet}

Comme le Dashboard ne détient jamais vos clés mainnet, chaque envoi est composé sur le Dashboard mais finalisé dans votre propre portefeuille. Sur le **rail Native**, ce portefeuille est toujours **QoreX** — les onglets Send et Stake passent par lui, quel que soit l'autre portefeuille que vous avez également connecté, car les comptes QoreChain signent avec une signature post-quantique hybride. Sur le **rail EVM**, MetaMask signe et envoie de façon indépendante.

:::caution Fonds réels, transferts irréversibles
Les transactions mainnet sont irréversibles. Vérifiez toujours deux fois l'adresse du destinataire avant d'approuver.
:::

:::note Soldes en vesting
Si une partie de votre solde est encore en vesting, elle compte dans ce que vous pouvez déléguer pour le staking, mais elle ne peut pas payer de frais de transaction — il vous faut pour cela des QOR séparément disponibles à la dépense, y compris pour enregistrer une clé PQC. Un portefeuille alimenté uniquement par son montant en vesting peut déléguer mais ne peut pas envoyer.
:::

#### Envoyer avec QoreX — extension de navigateur

1. Sur la page Wallet, dans la carte **Send from QoreX**, saisissez le destinataire (une adresse `qor1...` ou un `@handle`), le montant en QOR, et un mémo facultatif.
2. Sélectionnez **Continue in QoreX**.
3. Le Dashboard affiche un bouton **Approve in browser extension** — sélectionnez-le.
4. L'extension QoreX ouvre sa fenêtre contextuelle d'approbation avec le transfert entièrement décodé — destinataire et montant. Vérifiez-le et approuvez-le en utilisant la sécurité propre à votre extension (déverrouillage biométrique ou par mot de passe).
5. L'extension signe le transfert avec une signature PQC hybride et le diffuse directement sur la chaîne — le Dashboard n'apprend jamais que le hash de transaction qui en résulte.
6. La page Wallet affiche **Transfer confirmed** avec le hash de transaction, que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

#### Envoyer avec QoreX — application mobile

1. Sur la page Wallet, dans la carte **Send from QoreX**, saisissez le destinataire (une adresse `qor1...` ou un `@handle`), le montant en QOR, et un mémo facultatif.
2. Sélectionnez **Continue in QoreX**.
3. Le Dashboard affiche un code QR et un lien **Open QoreX** portant une requête `qorex://tx`.
4. Scannez le code QR avec l'application QoreX, ou appuyez sur **Open QoreX** si vous êtes sur le même téléphone.
5. QoreX décode la requête et affiche le destinataire et le montant en entier. Vérifiez-les et approuvez avec votre confirmation biométrique.
6. QoreX signe le transfert avec une signature PQC hybride et le diffuse.
7. Le Dashboard interroge le résultat et affiche **Transfer confirmed** avec le hash de transaction dès qu'elle est confirmée on-chain, que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

#### Envoyer vers un @handle

Le champ destinataire de la carte **Send from QoreX** accepte aussi un `@handle` à la place d'une adresse `qor1...`. Ce qui se passe ensuite dépend du fait que vous ayez déjà payé ce handle depuis ce navigateur ou non :

- **Première fois** : l'adresse résolue est affichée en entier, et vous devez sélectionner **Confirm address** avant qu'elle puisse être utilisée — l'adresse n'est mémorisée (épinglée) qu'après confirmation, pas au moment où elle est résolue.
- **Même adresse qu'auparavant** : elle passe avec une confirmation légère — pas besoin de la ressaisir.
- **Une adresse différente d'auparavant** : le flux s'arrête net. L'ancienne et la nouvelle adresse sont toutes deux affichées en entier — jamais tronquées, car la troncature masque précisément les caractères du milieu qu'un attaquant chercherait à rendre similaires — avec un avertissement explicite indiquant que l'adresse a changé, et un bouton **délibérément stylisé en secondaire** pour continuer quand même.

Cet épinglage est stocké uniquement dans votre propre navigateur, pas sur un serveur, de sorte qu'un autre ordinateur ou un navigateur réinitialisé affiche à nouveau « première fois » — c'est intentionnel. Les handles comptent 3 à 20 caractères (`a-z`, `0-9`, `_`) et appartiennent à une adresse précise, de sorte qu'une personne possédant plusieurs adresses peut utiliser un handle différent sur chacune.

#### Envoyer avec MetaMask

1. Ouvrez MetaMask et vérifiez qu'il est réglé sur le réseau EVM de QoreChain.
2. Sélectionnez **Send** dans MetaMask.
3. Saisissez l'adresse `0x...` du destinataire et le montant.
4. Vérifiez les frais de gas et confirmez pour signer et diffuser.
5. De retour sur la page Wallet du Dashboard, la transaction apparaît dans votre historique dès qu'elle est on-chain (actualisez si elle n'est pas encore apparue).

### Recevoir sur un rail spécifique {#receive-mainnet}

1. Sélectionnez **Receive**.
2. Dans la fenêtre de réception, choisissez un rail avec le sélecteur : **Native QOR**, **EVM**, ou **SVM**.
3. La fenêtre affiche votre adresse dans l'encodage de ce rail (`qor1...`, `0x...`, ou base58) avec un code QR et un bouton de copie.
4. Copiez l'adresse, ou laissez l'expéditeur scanner le code QR.

Quel que soit le rail utilisé par l'expéditeur, les fonds arrivent sur le même compte — un compte, trois encodages, un solde.

### Lire votre historique de transactions {#history}

Sur le mainnet, chaque ligne de votre historique affiche :

- Un **badge de rail** — Native, EVM ou SVM — indiquant quel rail la transaction a utilisé.
- Un **libellé du type réel de transaction**, comme *Send*, *PQC key registration* ou *contract deploy*, au lieu d'un libellé générique.
- Le montant, l'heure et le statut, avec le hash de transaction que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

## Utiliser le Portefeuille sur le testnet {#testnet}

Sur le testnet (`qorechain-diana`), le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez tester les flux de bout en bout sans rien connecter.

### Ce que la page affiche

- L'étiquette de votre portefeuille et l'adresse active, sous forme abrégée, avec un bouton de copie en un clic.
- Votre **solde total** en QOR.
- Un panneau de sécurité indiquant le chiffrement résistant au quantique et le réseau connecté.
- Un indicateur de dernière mise à jour avec une commande d'actualisation.
- Des onglets **Assets** et **Activity** affichant vos avoirs et votre historique de transactions.

Utilisez la commande d'actualisation à tout moment pour récupérer votre solde actuel et votre dernière activité depuis la chaîne.

### Envoyer des QOR (testnet)

1. Sélectionnez **Send**.
2. Saisissez l'adresse du destinataire (`qor1...`).
3. Saisissez le montant, et un mémo facultatif.
4. Vérifiez les détails et les frais estimés, puis confirmez.

Pendant que vous saisissez un destinataire, les contacts enregistrés et les adresses récentes vous sont suggérés pour vous aider à éviter les erreurs. Une fois le transfert soumis, vous recevez une confirmation avec le hash de transaction, que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

### Recevoir des QOR (testnet)

1. Sélectionnez **Receive**.
2. Partagez votre adresse ou son code QR avec l'expéditeur, ou copiez l'adresse en un clic.
3. Saisissez éventuellement un montant demandé et un mémo pour générer un lien de paiement et un code QR téléchargeable.

### Gérer vos portefeuilles de test

Sélectionnez **My Wallets** pour ouvrir votre liste d'adresses. De là, vous pouvez basculer entre les portefeuilles, créer un nouveau portefeuille, importer un portefeuille existant ou supprimer un portefeuille dont vous n'avez plus besoin. Le portefeuille actif est celui utilisé pour les envois, les échanges, le staking et les autres actions signées dans tout le Dashboard sur le testnet.

## Ajouter QoreChain à votre portefeuille {#add-network}

La page **Add Network** affiche quatre cartes côte à côte — une par méthode de connexion — pour que vous puissiez ajouter QoreChain à votre propre portefeuille en un clic :

| Carte | Ce qu'elle vous apporte |
| --- | --- |
| **Native** | Les points de terminaison RPC et REST ainsi que l'ID de chaîne, chacun avec un bouton de copie — pour Keplr et les autres portefeuilles du rail Native. |
| **EVM** | Des paramètres réseau EIP-3085 prêts à l'emploi — un clic ajoute QoreChain à MetaMask et aux autres portefeuilles EVM. |
| **SVM** | L'URL RPC SVM pour les portefeuilles et outils compatibles SVM. |
| **WalletConnect** | Un appairage WalletConnect pour relier n'importe quel portefeuille compatible WalletConnect. |

Pour ajouter QoreChain :

1. Ouvrez la page **Add Network** depuis le Dashboard.
2. Choisissez la carte qui correspond au rail de votre portefeuille.
3. Sélectionnez le bouton d'ajout (EVM, WalletConnect), ou copiez les points de terminaison et l'ID de chaîne dans le formulaire d'ajout de réseau de votre portefeuille (Native, SVM).
4. Approuvez le nouveau réseau dans votre portefeuille.

Les points de terminaison publics sont `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) et `svm.qore.host` (RPC SVM), avec des variantes `*-testnet` (par exemple `rpc-testnet.qore.host`) pour le testnet. IDs de chaîne : mainnet `qorechain-vladi` (ID de chaîne EVM `9801`), testnet `qorechain-diana` (ID de chaîne EVM `9800`).

### Signataires liés (Phantom) {#linked-signers}

La carte **SVM** vous permet aussi de lier une clé Phantom à votre compte en tant que **signataire lié** — un authentificateur de dépense délégué et révocable, et non une connexion de portefeuille principal distincte comme QoreX, Keplr ou MetaMask. Votre portefeuille existant signe l'enregistrement ; Phantom ne devient jamais sa propre identité. Pour le modèle de permissions et de limites de dépenses on-chain sous-jacent, voir [Signataires liés et limites de dépenses](/qorex/security-and-recovery#linked-signers) dans la documentation QoreX.

## Pages associées

- [Opérations sur les jetons](/user-guide/token-operations) — les concepts derrière les transferts de QOR et les dénominations.
- [Trade](/dashboard/trade) — échangez vos jetons sur l'AMM on-chain.
- [Bridge](/dashboard/bridge) — déplacez des actifs vers et depuis d'autres chaînes.
