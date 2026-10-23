---
slug: /dashboard/overview
title: Présentation du Dashboard et prise en main
sidebar_label: Présentation et prise en main
sidebar_position: 1
---

# Présentation du Dashboard et prise en main

Le Dashboard QoreChain sur **[dashboard.qorechain.io](https://dashboard.qorechain.io)** est l'application web officielle pour utiliser QoreChain depuis votre navigateur. Depuis un seul endroit, vous pouvez explorer la chaîne, gérer un portefeuille, échanger des jetons, générer et auditer des contrats intelligents, faire du staking auprès des validateurs, réclamer des jetons de testnet, accomplir des quêtes et accéder à l'outillage du réseau.

Tout ce qui se trouve dans cette section est un guide pratique utilisateur : ce que fait chaque page et comment l'utiliser. Aucune installation n'est requise — le Dashboard s'exécute entièrement dans votre navigateur.

## Ce que vous pouvez faire

| Domaine | À quoi cela sert |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Parcourir les blocs, les transactions, les adresses et les validateurs. |
| **[Wallet](/dashboard/wallet)** | Consulter votre solde et votre historique et recevoir des QOR — avec votre propre portefeuille (non custodial) sur le mainnet, ou un portefeuille de test géré par le dashboard sur le testnet. |
| **[Trade](/dashboard/trade)** | Échanger des jetons et fournir de la liquidité sur l'AMM on-chain. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Générer des contrats intelligents avec **QCAI** sur 17 blockchains prises en charge. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Réaliser une analyse de sécurité **QCAI** sur un contrat intelligent. |
| **[Staking et validateurs](/dashboard/staking-and-validators)** | Examiner les validateurs et déléguer vos QOR. |
| **[Faucet](/dashboard/faucet)** | Demander des jetons de test sur le testnet. |
| **[Quests](/dashboard/quests)** | Accomplir des tâches guidées pour apprendre à connaître le réseau. |
| **[Tools Hub](/dashboard/tools-hub)** | Outillage pour opérateurs et développeurs en six onglets : Validator Program, Validator Application, Light Node, Node Registration, Rollups et SDK. |

## Se connecter {#sign-in}

Le Dashboard comporte deux niveaux : un **compte Dashboard** avec lequel vous vous connectez, et le **portefeuille** que vous y associez. La plupart des pages nécessitent d'abord le compte :

- **Pages qui exigent d'être connecté :** [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), [Quests](/dashboard/quests), vos contrats enregistrés dans le [Smart Contract Creator](/dashboard/smart-contract-creator) et votre profil. Ouvrir l'une d'elles sans être connecté vous renvoie vers la page de connexion.
- **Consulter le mainnet sans être connecté :** sur les pages qui affichent des données du mainnet, y compris l'Explorer au sein du Dashboard, un visiteur non connecté voit « Sign in to view mainnet » et un bouton **Sign in**. Le même Explorer est également servi sans aucun compte sur [explore.qore.network](https://explore.qore.network).
- **Accessible sans compte :** la page d'accueil du [Smart Contract Creator](/dashboard/smart-contract-creator) (elle offre une génération gratuite) et le [Tools Hub](/dashboard/tools-hub). Lancer un audit de contrat nécessite un compte.

Parcourir le Dashboard ne nécessite jamais de portefeuille ; en connecter un est une étape distincte, décrite ci-dessous.

## Connecter votre portefeuille {#connect-your-wallet}

La plupart des actions qui modifient l'état on-chain — envoi de jetons, swap, staking — nécessitent un portefeuille connecté. La façon dont le Dashboard gère les clés dépend du réseau :

- **Le mainnet est non custodial.** Le Dashboard ne détient jamais vos clés mainnet. Vous connectez votre propre portefeuille — **QoreX** (le portefeuille officiel de QoreChain, extension ou application), **Keplr**, ou **MetaMask** — et le Dashboard lit votre solde et votre historique réels depuis la chaîne. Chaque transaction mainnet est signée dans votre propre portefeuille, jamais par le Dashboard. L'envoi et le staking sur le **rail Native nécessitent QoreX**, car les comptes QoreChain signent avec une signature hybride post-quantique que seul QoreX produit aujourd'hui ; Keplr peut tout de même se connecter pour consulter votre solde sur le rail Native. **MetaMask** se connecte sur le **rail EVM** ; l'envoi depuis celui-ci nécessite en outre la clé post-quantique du compte et une fenêtre d'autorisation EVM ouverte, que l'on ouvre depuis QoreX sur le compte de type Ethereum (coin 60) qui partage la clé de MetaMask (voir [Envoyer avec MetaMask](/dashboard/wallet#send-metamask)).
- **Le testnet est custodial.** Le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez expérimenter sans aucune configuration et sans aucune valeur réelle en jeu.

### Se connecter avec QoreX (recommandé) {#connect-qorex}

QoreX est le portefeuille officiel de QoreChain. La carte **Connect with QoreX** du Dashboard prend en charge à la fois l'extension de navigateur et l'application mobile depuis le même point d'entrée.

1. Ouvrez [dashboard.qorechain.io](https://dashboard.qorechain.io) et vérifiez que l'en-tête affiche **Mainnet**.
2. S'il s'agit de votre première visite sur une page mainnet, lisez et acceptez la [reconnaissance des risques unique](#risk-acknowledgement).
3. Ouvrez **Wallet** dans la barre latérale (vous devez être connecté) et sélectionnez **Connect with QoreX** sur la carte **QoreX wallet**.
4. Si l'extension de navigateur QoreX est installée et détectée dans ce navigateur, le Dashboard demande **« Comment souhaitez-vous vous connecter ? »** avec deux options, **Browser extension** et **QoreX app**. Choisissez-en une — le choix est enregistré, donc les visites suivantes ne redemandent plus cette question (un lien **Use a different method** est toujours disponible si vous souhaitez changer de méthode plus tard). Si aucune extension n'est détectée, le Dashboard passe directement au parcours de l'application.
   - **Browser extension** : la fenêtre contextuelle propre à l'extension s'ouvre, affichant `dashboard.qorechain.io` comme site demandant la connexion. Vérifiez-la et approuvez — cela signe une preuve unique que vous possédez votre adresse `qor1...` (aucun fonds ne se déplace). L'appariement se termine immédiatement, dans la même session de navigateur.
   - **QoreX app** : le Dashboard affiche un code QR (avec un lien **Open QoreX** qui ouvre directement l'application si vous naviguez depuis le même téléphone). Ouvrez l'application QoreX, scannez le code QR (ou appuyez sur le lien), vérifiez la demande d'appariement affichant l'origine du Dashboard, et approuvez-la avec votre confirmation biométrique. Le Dashboard interroge en arrière-plan et termine automatiquement l'appariement une fois que vous avez approuvé.
5. Une fois approuvé, le Dashboard affiche votre adresse `qor1...` et débloque les actions nécessitant une signature.

Consultez [Wallet](/dashboard/wallet#mainnet) pour le guide complet de connexion et d'envoi par type de portefeuille, ainsi que la page [Account & Dashboard](/qorex/account-and-dashboard#dashboard) de la documentation QoreX pour la vue côté portefeuille du même appariement.

### Se connecter avec Keplr ou MetaMask

1. Ouvrez [dashboard.qorechain.io](https://dashboard.qorechain.io) et vérifiez que l'en-tête affiche **Mainnet**.
2. S'il s'agit de votre première visite sur une page mainnet, lisez et acceptez la reconnaissance des risques unique (voir ci-dessous).
3. Ouvrez **Wallet** dans la barre latérale et, sous **or connect another wallet**, sélectionnez **Connect Keplr** ou **Connect MetaMask**.
4. Approuvez la connexion dans votre portefeuille.

Une fois connecté, la page Wallet affiche votre adresse (sous forme abrégée) avec son solde et son historique. MetaMask permet de recevoir sur le rail EVM, et d'y envoyer dès qu'une fenêtre EVM est ouverte (voir [Envoyer avec MetaMask](/dashboard/wallet#send-metamask)). Keplr débloque la consultation de votre solde et de votre historique sur le rail Native — l'envoi et le staking sur ce rail passent par QoreX (voir ci-dessus), car les comptes QoreChain signent avec une signature hybride post-quantique. Les pages en lecture seule comme l'Explorer fonctionnent sans connexion.

Les comptes QoreChain utilisent le préfixe bech32 `qor`, donc une adresse connectée ressemble à `qor1...` — le même compte possède également un encodage EVM (`0x...`) et un encodage SVM (base58). Les comptes sont protégés par de la cryptographie résistante au quantique. Consultez [Configuration du portefeuille](/getting-started/wallet-setup) pour des conseils de première configuration, et [Ajouter QoreChain à votre portefeuille](/dashboard/wallet#add-network) si votre portefeuille ne connaît pas encore le réseau.

### Reconnaissance des risques unique {#risk-acknowledgement}

Avant de pouvoir utiliser une page mainnet, le Dashboard vous demande d'accepter un avertissement unique. Il confirme que vous comprenez que les transactions mainnet déplacent des **fonds réels**, que le Dashboard est **non custodial** (vous seul contrôlez vos clés) et que les transactions on-chain sont **irréversibles**. Vous l'acceptez une seule fois ; ensuite, les pages mainnet s'ouvrent directement.

## Sélectionner votre réseau

Le Dashboard fonctionne avec deux réseaux. L'en-tête affiche le réseau auquel vous êtes actuellement connecté et vous permet d'en changer ; il s'ouvre par défaut sur **Mainnet**, et votre choix est mémorisé dans votre navigateur.

| Réseau | ID de la chaîne | Quand l'utiliser |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Réseau en direct (en ligne depuis le 7 juin 2026, exécutant la chaîne v3.2.4 depuis le 23 octobre 2026) pour la valeur réelle et l'usage en production. Non custodial : vous connectez votre propre portefeuille. |
| **Testnet** | `qorechain-diana` | Environnement gratuit pour les tests (exécutant la chaîne v3.2.4 depuis le 19 octobre 2026), avec un portefeuille de test géré par le dashboard et le [Faucet](/dashboard/faucet) pour les jetons de test. |

Le jeton natif est **QOR** (dénomination de base `uqor`, où 1 QOR = 10^6 uqor). Si vous débutez, commencez sur le testnet, réclamez des jetons au Faucet et essayez un premier transfert avant de passer au mainnet.

:::tip Nouveau sur QoreChain ?
Suivez [Se connecter au testnet](/getting-started/connecting-to-testnet) et [Votre première transaction](/getting-started/first-transaction) pour vous familiariser rapidement, puis revenez explorer le reste du Dashboard.
:::

## Voir aussi

* [Explorer](/dashboard/explorer) — parcourir les blocs, les transactions et les comptes.
* [Wallet](/dashboard/wallet) — gérer les comptes et envoyer des transactions.
* [Trade / DEX](/dashboard/trade) — échanger des jetons contre les pools de l'AMM on-chain.
* [Tools Hub](/dashboard/tools-hub) — Validator Program, Validator Application, Light Node, Node Registration, Rollups et SDK.
* [Faucet](/dashboard/faucet) — jetons de test sur le testnet.
