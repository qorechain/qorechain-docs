---
slug: /introduction/what-is-qorechain
title: Qu'est-ce que QoreChain ?
sidebar_label: Qu'est-ce que QoreChain ?
sidebar_position: 1
---

# Qu'est-ce que QoreChain ?

QoreChain est la première blockchain de couche 1 construite avec une cryptographie post-quantique dès le genesis, un traitement des transactions natif à l'IA et un environnement d'exécution triple-VM qui exécute des programmes EVM, QoreChain Native (le runtime CosmWasm) et SVM sur une seule chaîne. Plutôt que de greffer la résistance quantique sur un protocole existant, QoreChain a été conçue de fond en comble pour être sécurisée face aux adversaires classiques comme quantiques, tout en offrant l'expérience développeur et l'interopérabilité attendues d'une blockchain moderne à usage général.

Le mainnet (`qorechain-vladi`, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.2.3** (appliquée par la gouvernance le 20 octobre 2026) jusqu'à la hauteur 3 742 566 et la **v3.2.4** à partir de ce bloc (proposition de gouvernance 13). Un testnet public (`qorechain-diana`, EVM chain ID **9800**, en v3.2.4 depuis le 19 octobre 2026) fonctionne en parallèle pour les tests de pré-production et d'intégration. Le jeton natif est **QOR** (affichage) / **uqor** (base, 10^6), avec les préfixes Bech32 `qor` pour les comptes et `qorvaloper` pour les validateurs. La chaîne est construite sur le Cosmos SDK v0.53.

## Innovations majeures

### 1. Cryptographie post-quantique

QoreChain utilise ML-DSA-87 (Dilithium-5) standardisé par le NIST pour les signatures numériques, ML-KEM-1024 pour l'encapsulation de clés et SHAKE-256 comme hash d'application par défaut, offrant une sécurité contre les attaques des ordinateurs classiques comme quantiques. Les signatures hybrides sont désormais **requises par défaut** sur le chemin de transaction cosmos : chaque transaction du chemin cosmos doit comporter une signature Dilithium-5 (ML-DSA-87) en tant qu'extension de transaction *aux côtés* de la signature classique secp256k1 (ECDSA). Les transactions cosmos uniquement classiques sont rejetées — la voie de rétrogradation est fermée (seuls les gentxs de genesis, les transactions d'enregistrement/migration de clé PQC et un unjail depuis un compte opérateur n'ayant aucune clé enregistrée sont exemptés). La voie EVM conserve la signature standard `eth_secp256k1`, de sorte que l'outillage Ethereum signe sans modification, mais depuis la v3.2.0 une transaction EVM n'est admise que depuis un compte disposant d'une clé ML-DSA-87 enregistrée et d'une **fenêtre d'autorisation EVM** ouverte — une permission bornée ouverte par un message de la voie Cosmos signé en post-quantique (voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window)). Une clé classique seule ne peut plus déplacer de fonds sur la voie EVM. Trois modes d'application contrôlés par la gouvernance (disabled, optional, required) restent disponibles, mais la valeur par défaut actuelle du réseau est **required**. Un framework d'agilité algorithmique garantit que les schémas de signature peuvent être mis à niveau via des propositions de gouvernance à mesure que les normes cryptographiques évoluent.

### 2. Traitement natif à l'IA

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) est une couche d'apprentissage par renforcement on-chain — un réseau de politique PPO à virgule fixe de 73 733 paramètres, assorti de limites de sécurité par disjoncteur — intégrée au cycle de vie des blocs. Elle fonctionne actuellement en mode observation : les réseaux en service enregistrent des observations et des récompenses tous les 10 blocs, et aucune politique entraînée n'est chargée, de sorte qu'aucun paramètre de consensus n'est réglé par elle aujourd'hui. La détection statistique d'anomalies par forêt d'isolation et la notation de risque multidimensionnelle évaluent chaque transaction dans la chaîne du gestionnaire ante, signalant les motifs frauduleux avant l'exécution. L'optimisation dynamique des frais ajuste les frais de base en fonction des conditions réseau en temps réel. Toute l'inférence IA on-chain est conçue pour être entièrement déterministe entre validateurs — des entrées identiques produisent des sorties identiques sans dépendance à un oracle externe.

### 3. Environnement d'exécution triple-VM

QoreChain est la seule couche 1 à exécuter nativement trois machines virtuelles au sein d'un même consensus :

* **EVM** — Compatibilité Ethereum complète avec tarification du gas EIP-1559 et JSON-RPC sur le port 8545. Déployez des contrats Solidity avec l'outillage standard (Hardhat, Foundry, Remix).
* **QoreChain Native** — Contrats intelligents WebAssembly écrits en Rust avec prise en charge complète du cycle de vie (instanciation, exécution, requête, migration).
* **SVM** — Déploiement et exécution de programmes BPF avec un serveur JSON-RPC compatible Solana sur le port 8899. Les clients et l'outillage Solana existants fonctionnent immédiatement.

La messagerie inter-VM permet aux trois environnements de communiquer : les contrats EVM appellent QoreChain Native via precompile (une fois ce precompile activé), les contrats QoreChain Native appellent l'EVM via des messages personnalisés, et les programmes SVM participent par un pontage asynchrone basé sur les événements. Aujourd'hui, seul l'environnement EVM accepte des transactions sur les réseaux en service : le téléversement et l'instanciation de code QoreChain Native sont désactivés, la voie de transaction SVM est désactivée, aucun precompile EVM n'est actif, et le message d'appel inter-VM est désactivé sur le mainnet.

### 4. Tokenomics à émission plafonnée

Le moteur de burn définit **douze sources de burn** (frais de gas, création de contrat, frais de service IA, frais de pont, rachat par la trésorerie, transactions échouées, pénalités xQORE, rachat automatisé, le burn du TGE, création de rollup, jalons de nombre de transactions et AMM) alimentant un module central de comptabilité des burns ; sur le mainnet, seuls les canaux des frais de gas et des transactions échouées ont enregistré des burns jusqu'à présent. Tout ce qui entre dans le collecteur de frais est réparti **37 % aux validateurs, 30 % brûlés définitivement, 20 % à la trésorerie, 10 % aux stakers et 3 % aux nœuds légers**. La répartition s'applique aussi bien aux frais de transaction qu'à l'émission d'epoch. Le mécanisme de staking de gouvernance xQORE permet aux utilisateurs de verrouiller du QOR pour un poids de gouvernance doublé, les pénalités de sortie anticipée étant redistribuées aux détenteurs restants ; les transactions de verrouillage et de déverrouillage ne sont pas encore raccordées aux réseaux en service.

QOR suit une **trajectoire d'offre finie** : **4 420 000 000 QOR** au genesis (4 500 000 000 QOR prévus, dont 80 000 000 QOR ont été brûlés lors de l'événement de génération du jeton avant le genesis), une émission de staking frappée sous un **plafond cumulatif strict de 590 000 000 QOR**, et le moteur de burn, qui retire définitivement des jetons. Le module `x/inflation` frappe un montant fixe par epoch de 43 200 blocs (86 000 QOR depuis la proposition de gouvernance 10 d'octobre 2026) jusqu'à ce que le plafond soit atteint, après quoi les récompenses proviennent uniquement des frais de transaction. Consultez [Tokenomics](/architecture/tokenomics#supply-and-emission) pour les chiffres en direct et le calendrier.

### 5. Connectivité inter-chaînes

QoreChain est conçue pour se connecter à un large ensemble d'écosystèmes blockchain à travers deux protocoles complémentaires : l'IBC natif et le QoreChain Bridge (QCB). La couche de pont définit **37 configurations de chaîne (36 chaînes externes plus Injective, atteinte via IBC)** et jusqu'à **8 contreparties IBC**. La couche inter-chaînes n'est **en service sur aucun des deux réseaux** : les 37 configurations de chaîne sont au statut `pending` et aucun canal IBC n'est ouvert. Les chiffres ci-dessous décrivent la couverture visée.

* **Jusqu'à 8 contreparties IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon et Injective. Modèles de relayeur préconfigurés avec mises à jour de client, détection de comportement malveillant et nettoyage automatique des paquets.
* **37 configurations de chaîne QCB (36 chaînes externes plus Injective via IBC)** — chaque point de terminaison est conçu pour inclure une validation d'adresse par type, une profondeur de confirmation configurable, des plafonds de volume par disjoncteur et des attestations de validateur signées PQC. Les chaînes externes visées sont :
  * **Baseline (10) :** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **Famille EVM (14) :** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **Non-EVM (5) :** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **En attente (7) :** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

L'architecture couvre tous les principaux types de chaînes — EVM, Solana (SVM), basées sur Move (Sui, Aptos), Cosmos/IBC, UTXO et autres familles non-EVM — pour offrir une large interopérabilité à travers l'écosystème.

### 6. Rollup Development Kit

Le module `x/rdk` est un framework natif au protocole pour déployer des rollups spécifiques à une application directement sur la chaîne hôte QoreChain. La prise en charge des rollups est livrée sous forme de framework de chaîne hôte ; les affirmations de déploiement spécifiques doivent être considérées comme des capacités visées. Quatre paradigmes de règlement sont pris en charge :

* **Optimistic** — Preuves de fraude avec une fenêtre de contestation de 7 jours, auto-finalisées par EndBlocker.
* **ZK (Zero-Knowledge)** — Preuves SNARK ou STARK avec finalité instantanée à la vérification.
* **Based** — Transactions séquencées par la L1 avec finalité en environ 2 blocs hôtes.
* **Sovereign** — Chaînes indépendantes utilisant QoreChain exclusivement pour la disponibilité des données.

Cinq profils prédéfinis (**defi, gaming, nft, enterprise, custom**) permettent un déploiement en un clic avec des modes de règlement, temps de bloc, choix de VM, backends DA et modèles de gas préconfigurés. Un routeur DA natif fournit un stockage de blobs validé par SHAKE-256 avec rétention configurable et élagage automatique. Le module de consensus PRISM fournit des méthodes consultatives pour la configuration de rollup assistée par l'IA. Aucun rollup n'a encore été créé sur les réseaux en service.

### 7. Abstraction de compte et de gas

Les comptes intelligents avec trois types programmables (multisig, récupération sociale, basé sur session) prennent en charge des clés de session avec permissions et expiration granulaires, des règles de dépenses par compte et des listes d'autorisation de denoms. Cela permet des modèles d'UX de portefeuille impossibles avec des comptes standard : clés de session de dApp pour mobile, récupération sociale en tant que type de compte de premier ordre et limites de dépenses programmables. Les fonctionnalités de compte intelligent et de portefeuille lié sont implémentées mais actuellement **désactivées** sur les deux réseaux (`abstractaccount.enabled = false` ; consultez `GET /qorechain/abstractaccount/v1/config`). L'abstraction de gas est conçue pour permettre aux utilisateurs de payer leurs frais dans un jeton non natif accepté (la configuration liste `ibc/USDC` et `ibc/ATOM`) ; aucun canal IBC n'est encore ouvert, les frais sont donc actuellement payés en QOR.

## Écosystème

QoreChain est livrée avec **48 modules de genesis, dont 20 propres à QoreChain**, couvrant la sécurité (pqc), l'IA (ai, reputation, rlconsensus), le consensus (qca), les machines virtuelles (vm, svm, crossvm), la tokenomics (burn, xqore, inflation), la liquidité (amm), la licence (license), les ponts (bridge, babylon, multilayer), les extensions de gouvernance (abstractaccount, fairblock, gasabstraction) et les rollups (rdk). Les ajouts récents incluent `x/amm` pour l'AMM / la liquidité on-chain et `x/license` pour la licence de chaîne. La chaîne suit une architecture open-core — la couche de protocole est entièrement open source, avec des extensions propriétaires optionnelles pour les déploiements d'entreprise.

## Liens connexes

* [Vue d'ensemble de l'architecture](/introduction/architecture-overview) — comment les couches s'imbriquent de bout en bout.
* [Fonctionnalités clés](/introduction/key-features) — les capacités phares en un coup d'œil.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — le consensus assisté par l'IA au cœur du système.
* [Tokenomics](/architecture/tokenomics) — offre, burns, rebases et émissions de QOR.
* [Démarrage rapide](/getting-started/quickstart) — lancez un nœud local et commencez à développer.
