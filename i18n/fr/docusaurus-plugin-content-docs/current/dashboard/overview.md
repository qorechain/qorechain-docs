---
slug: /dashboard/overview
title: Présentation du Dashboard et prise en main
sidebar_label: Présentation et prise en main
sidebar_position: 1
---

# Présentation du Dashboard et prise en main

Le Dashboard QoreChain sur **[dashboard.qorechain.io](https://dashboard.qorechain.io)** est l'application web officielle pour utiliser QoreChain depuis un navigateur. Un seul compte et un seul sélecteur de réseau vous donnent l'explorer, une vue de portefeuille, un faucet de testnet, un écran d'échange de jetons de test, des quêtes, des outils de contrats pilotés par l'IA, l'outillage de nœuds et de validateurs, et une page développeur. Il s'adresse à toute personne qui veut essayer le réseau sans rien installer, et aux développeurs qui veulent des vérifications rapides pendant qu'ils construisent. Rien n'est installé : il s'exécute dans votre navigateur.

Cette section est un guide pratique utilisateur : ce que fait chaque page, comment l'ouvrir et quelles en sont les limites.

## Innovations {#innovations}

- **Un seul sélecteur fixe le réseau pour toutes les pages.** Le contrôle **Testnet / Mainnet** de l'en-tête enregistre votre choix dans le navigateur et recharge la page, de sorte que le serveur et le navigateur lisent le même réseau. Le mainnet est le réseau par défaut.
- **Le mainnet est non custodial.** Le Dashboard ne détient jamais de clés mainnet et ne signe jamais de transaction mainnet. Il ne transmet à QoreX que les paramètres d'un envoi ou d'une action de staking, et QoreX reconstruit, affiche, signe (signature hybride ML-DSA-87) et diffuse la transaction. Le Dashboard n'en connaît que le hash.
- **Les vues mainnet exigent un compte ; le testnet est ouvert.** Sur le mainnet, les statistiques de l'accueil, Wallet, Trade et la vue d'ensemble de l'Explorer vérifient l'accès côté serveur. Un visiteur non connecté voit « Sign in to view mainnet ».
- **Une reconnaissance des fonds réels, une fois par navigateur.** Avant la première vue mainnet de Wallet, Trade, de la vue d'ensemble de l'Explorer ou des statistiques de l'accueil, une carte intitulée « You're entering QoreChain Mainnet » énumère quatre points : le Dashboard est non custodial, les transactions sont définitives et irréversibles, il existe un risque de perte totale et rien ici ne constitue un conseil financier, et les QOR du testnet ne sont jamais échangeables. L'acceptation est enregistrée dans votre navigateur, pas sur votre compte.
- **Un compte, trois encodages.** Le même compte est affiché sous la forme d'une adresse `qor1...`, d'une adresse `0x...` et d'une adresse SVM en base58, et le Dashboard lit le solde et l'historique une seule fois, via `qor1...`.

## Comment l'utiliser {#how-to-use}

### La disposition

**En-tête.** Le sélecteur de réseau, puis **Sign In** ou un menu de profil (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Barre latérale de bureau, dans l'ordre :**

| Entrée | Page | Ce que c'est |
| --- | --- | --- |
| **Discover** | `/` | Accueil : boutons principaux **Create Smart Contract** et **Explore Network**, compteurs « Dashboard Overview », listes des contrats créés, des derniers audits publics et des principaux contributeurs, et un « Developer Toolkit » avec **Start Generating**, **New Audit** et **Claim Tokens**. |
| **Public Sale** | `/public-sale` | Les participants existants voient leur allocation, leur calendrier de vesting et la réclamation. |
| **Wallet** | [Wallet](/dashboard/wallet) | Solde, historique, réception et (mainnet) envoi et staking via QoreX. |
| **Faucet** | [Faucet](/dashboard/faucet) | Jetons de testnet gratuits. |
| **Explorer** | [Explorer](/dashboard/explorer) | Blocs, transactions, adresses et validateurs. |
| **Trade** | [Trade](/dashboard/trade) | Écran d'échange de jetons de test. |
| Groupe **Earn** | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | L'Arcade QoreChain. |
| Groupe **Build** | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Outils de contrats, la page opérateur (cinq onglets : Validator Program, Validator Application, Light Node, Node Registration, Rollups) et la page publique pour développeurs (sept onglets : SDKs, Transaction inspector, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). L'entrée Nodes & Validators s'appelait auparavant « Tools » ; son onglet SDK est passé dans Developers. |
| **FAQ** | `/faq` | Aide intégrée à l'application. Certaines parties sont obsolètes ; ce manuel fait référence. |

La page [Validators](/dashboard/validators) (`/validators`) n'a pas de lien dans la barre latérale ; ouvrez-la par son adresse.

**Mobile.** Une barre inférieure (Discover, Wallet, Faucet, puis Explorer, Trade, Quests) plus un menu en éventail central avec le reste.

### Se connecter {#sign-in}

Le Dashboard comporte deux niveaux : un **compte Dashboard** avec lequel vous vous connectez, et le **portefeuille** que vous y associez. Parcourir le Dashboard ne nécessite jamais de portefeuille.

- **Redirigé vers la connexion avant le chargement de la page :** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale, et chaque page de contrat enregistré `/smart-contract-creator/<id>`.
- **Affiche un écran « Authentication Required » quand vous n'êtes pas connecté :** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard et Games.
- **Ouvert sans compte :** l'accueil Discover, les pages de détail de l'[Explorer](/dashboard/explorer) (transaction, bloc, adresse, validateurs) sur les deux réseaux, la vue d'ensemble de l'Explorer sur le testnet, la page d'accueil du [Smart Contract Creator](/dashboard/smart-contract-creator) (une génération gratuite), la liste des audits à `/audits` et les rapports d'audit publics, ainsi que la page [Developers](/dashboard/developers).
- **Mainnet sans être connecté :** les pages qui affichent des données du mainnet (compteurs de l'accueil, Wallet, Trade, vue d'ensemble de l'Explorer) affichent « Sign in to view mainnet » et un bouton **Sign In**.

### Sélectionner votre réseau {#select-network}

L'en-tête affiche le réseau sur lequel vous êtes et vous permet d'en changer. Le choix est mémorisé dans votre navigateur.

| Réseau | ID de la chaîne | Quand l'utiliser |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Réseau en direct (en ligne depuis le 7 juin 2026, exécutant la chaîne v3.2.4 depuis le 23 octobre 2026) pour la valeur réelle. Non custodial : vous connectez votre propre portefeuille. |
| **Testnet** | `qorechain-diana` | Environnement gratuit (exécutant la chaîne v3.2.6 depuis le 27 octobre 2026) avec un portefeuille de test géré par le Dashboard et le [Faucet](/dashboard/faucet). |

Le jeton natif est **QOR** (dénomination de base `uqor`, 1 QOR = 10^6 uqor). Si vous débutez, commencez sur le testnet, réclamez des jetons au Faucet et essayez un premier transfert avant de passer au mainnet.

Quelques pages ignorent le sélecteur : le Faucet paie toujours sur le testnet, [Trade](/dashboard/trade) affiche toujours du contenu de testnet, et Quests, Badges, Leaderboard, Games, Public Sale et FAQ ne dépendent pas du réseau.

### Connecter votre portefeuille {#connect-your-wallet}

- **Le mainnet est non custodial.** Connectez **QoreX** (le portefeuille officiel de QoreChain, extension ou application), **Keplr** ou **MetaMask**. L'envoi et le staking sur le rail Native exigent QoreX, car les comptes QoreChain signent avec une signature hybride post-quantique que seul QoreX produit aujourd'hui. Keplr se connecte pour consulter et recevoir sur le rail Native. MetaMask se connecte sur le rail EVM ; l'envoi depuis celui-ci nécessite en outre la clé post-quantique du compte et une fenêtre EVM ouverte, ouverte depuis QoreX (voir [Envoyer avec MetaMask](/dashboard/wallet#send-metamask)).
- **Le testnet est custodial.** Le Dashboard gère un portefeuille de test pour vous : il n'y a donc rien à installer et aucune valeur réelle en jeu.

#### Se connecter avec QoreX (recommandé) {#connect-qorex}

1. Ouvrez [dashboard.qorechain.io](https://dashboard.qorechain.io) et vérifiez que l'en-tête affiche **Mainnet**.
2. S'il s'agit de votre première visite sur une page mainnet dans ce navigateur, acceptez la [reconnaissance des risques unique](#risk-acknowledgement).
3. Ouvrez **Wallet** (vous devez être connecté) et sélectionnez **Connect with QoreX** sur la carte **QoreX wallet**.
4. Si l'extension de navigateur QoreX est détectée et qu'aucune méthode n'est enregistrée, le Dashboard demande « How do you want to connect? » avec **Browser extension** et **QoreX app**. Le choix est enregistré. Si aucune extension n'est détectée, il passe directement au parcours de l'application.
   - **Browser extension :** la fenêtre contextuelle de l'extension affiche `dashboard.qorechain.io` comme site demandeur. Approuvez ; cela signe une preuve unique que vous possédez votre adresse `qor1...`. Aucun fonds ne se déplace.
   - **QoreX app :** le Dashboard affiche un code QR et **Open QoreX**. Scannez-le ou appuyez dessus, vérifiez la demande d'appariement dans QoreX et approuvez avec votre biométrie. Le Dashboard interroge en arrière-plan (« Waiting for approval in QoreX... ») et termine tout seul.
   - Un lien **Use a different method** n'apparaît que lorsqu'un appariement est en attente.
5. Une fois approuvé, le Dashboard affiche votre adresse `qor1...` et débloque les actions nécessitant une signature.

Consultez [Wallet](/dashboard/wallet#mainnet) pour le guide complet de connexion et d'envoi, ainsi que la page [Account & Dashboard](/qorex/account-and-dashboard#dashboard) de la documentation QoreX pour la vue côté portefeuille du même appariement.

#### Se connecter avec Keplr ou MetaMask

1. Avec l'en-tête sur **Mainnet** et la reconnaissance acceptée, ouvrez **Wallet**.
2. Sous **or connect another wallet**, sélectionnez **Connect Keplr** ou **Connect MetaMask**.
3. Approuvez la connexion dans votre portefeuille. Si votre portefeuille ne connaît pas encore QoreChain, consultez [Ajouter QoreChain à votre portefeuille](/dashboard/wallet#add-network).

Une fois connecté, la page Wallet affiche votre adresse avec son solde et son historique. Consultez [Configuration du portefeuille](/getting-started/wallet-setup) pour des conseils de première configuration.

### Reconnaissance des risques unique {#risk-acknowledgement}

La carte de reconnaissance apparaît avant la première vue mainnet de **Wallet**, **Trade**, de la **vue d'ensemble de l'Explorer** ou des **statistiques de l'accueil** dans un navigateur. Elle n'est pas exigée pour chaque page mainnet : les pages de détail de l'Explorer, le Creator et les autres pages s'ouvrent sans elle. Acceptez-la une fois par navigateur ; effacer les données du navigateur la fait réapparaître.

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io](https://dashboard.qorechain.io), dans n'importe quel navigateur récent. Aucune installation.
- **Compte :** connexion par e-mail ou via un fournisseur d'identité pris en charge sur la page de connexion. Les pages qui l'exigent sont listées sous [Se connecter](#sign-in).
- **Réseaux :** mainnet `qorechain-vladi` et testnet `qorechain-diana`, avec le sélecteur de l'en-tête. Le mainnet est le réseau par défaut.
- **Portefeuille :** aucun pour parcourir. QoreX pour les envois et le staking sur le mainnet, Keplr ou MetaMask pour consulter et recevoir. Sur le testnet, le Dashboard crée un portefeuille de test pour vous.
- **Coût :** le Dashboard est gratuit. Les actions on-chain paient les frais de réseau (plancher de 0,1 uqor par gaz). Certains éléments payants sont décrits sur leurs propres pages (la licence de nœud léger et les frais du programme de validateurs sur [Nodes & Validators](/dashboard/tools-hub)).
- **Contrôle d'accès anticipé :** aucun aujourd'hui. Les pages mainnet n'exigent que la connexion (là où elle est indiquée plus haut) et la reconnaissance unique.

## Où il est publié {#where-published}

| Surface | Adresse | Réseaux | Connexion |
| --- | --- | --- | --- |
| Dashboard | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet et testnet | Selon la page, voir [Se connecter](#sign-in) |
| Explorer autonome | [explore.qore.network](https://explore.qore.network) (une application distincte, voir [Explorer](/dashboard/explorer#standalone-explorer)) | Mainnet et testnet | Aucune |
| Points d'accès publics | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, avec des variantes `*-testnet` | Mainnet et testnet | Aucune |

Pages de cette section : [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking et validateurs](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard et Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) et [Developers](/dashboard/developers).

## Limites et problèmes connus {#limits}

- **Il n'y a pas d'écran Bridge.** Voir [Bridge](/dashboard/bridge).
- **Trade ne suit pas le sélecteur de réseau.** Il affiche du contenu de testnet même avec l'en-tête sur Mainnet. Voir [Trade](/dashboard/trade).
- **La FAQ intégrée est une courte page d'aide.** Là où elle et ce manuel divergent, suivez ce manuel.
- **Restrictions du mainnet.** Le staking, l'envoi et les déploiements de contrats sur le mainnet sont décrits page par page ; plusieurs flux (déploiements Native ou SVM, redélégation, staking verrouillé dans le temps) ne sont pas proposés sur le Dashboard.
- **Le testnet n'a aucune valeur réelle.** N'envoyez jamais de vrais QOR à une adresse de testnet : les formats sont identiques. Voir [Wallet](/dashboard/wallet#testnet).

:::tip Nouveau sur QoreChain ?
Suivez [Se connecter au testnet](/getting-started/connecting-to-testnet) et [Votre première transaction](/getting-started/first-transaction) pour vous familiariser rapidement, puis revenez explorer le reste du Dashboard.
:::
