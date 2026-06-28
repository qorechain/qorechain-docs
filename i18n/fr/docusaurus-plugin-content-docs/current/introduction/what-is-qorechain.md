---
slug: /introduction/what-is-qorechain
title: Qu'est-ce que QoreChain ?
sidebar_label: Qu'est-ce que QoreChain ?
sidebar_position: 1
---

# Qu'est-ce que QoreChain ?

QoreChain est la première blockchain de couche 1 construite avec une cryptographie post-quantique dès le genesis, un traitement des transactions natif à l'IA et un environnement d'exécution triple-VM qui exécute des programmes EVM, CosmWasm et SVM sur une seule chaîne. Plutôt que de greffer la résistance quantique sur un protocole existant, QoreChain a été conçue de fond en comble pour être sécurisée face aux adversaires classiques comme quantiques, tout en offrant l'expérience développeur et l'interopérabilité attendues d'une blockchain moderne à usage général.

Le mainnet (`qorechain-vladi`, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.80**. Un testnet public (`qorechain-diana`, EVM chain ID **9800**) fonctionne en parallèle pour les tests de pré-production et d'intégration. Le jeton natif est **QOR** (affichage) / **uqor** (base, 10^6), avec les préfixes Bech32 `qor` pour les comptes et `qorvaloper` pour les validateurs. La chaîne est construite sur le Cosmos SDK v0.53.

## Innovations majeures

### 1. Cryptographie post-quantique

QoreChain utilise ML-DSA-87 (Dilithium-5) standardisé par le NIST pour les signatures numériques, ML-KEM-1024 pour l'encapsulation de clés et SHAKE-256 comme hash d'application par défaut, offrant une sécurité contre les attaques des ordinateurs classiques comme quantiques. Les signatures hybrides sont désormais **requises par défaut** sur le chemin de transaction Cosmos : chaque transaction du chemin Cosmos doit comporter une signature Dilithium-5 (ML-DSA-87) en tant qu'extension de transaction *aux côtés* de la signature classique secp256k1 (ECDSA). Les transactions Cosmos uniquement classiques sont rejetées — la voie de rétrogradation est fermée (seuls les gentxs de genesis et les transactions d'enregistrement/migration de clé PQC sont exemptés). Les transactions EVM ne sont pas affectées : elles utilisent un chemin ante `eth_secp256k1` distinct (le chemin du QoreChain EVM Engine) et n'exigent pas la signature hybride. Trois modes d'application contrôlés par la gouvernance (disabled, optional, required) restent disponibles, mais la valeur par défaut actuelle du réseau est **required**. Un framework d'agilité algorithmique garantit que les schémas de signature peuvent être mis à niveau via des propositions de gouvernance à mesure que les normes cryptographiques évoluent.

### 2. Traitement natif à l'IA

Un agent d'apprentissage par renforcement on-chain (PPO MLP de 73 733 paramètres) exécute une inférence déterministe à virgule fixe directement dans le cycle de vie des blocs, réglant dynamiquement des paramètres de consensus tels que le temps de bloc, les limites de gas et les poids des pools de validateurs. Cette couche d'optimisation porte la marque **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). La détection statistique d'anomalies par forêt d'isolation et la notation de risque multidimensionnelle évaluent chaque transaction dans la chaîne du gestionnaire ante, signalant les motifs frauduleux avant l'exécution. L'optimisation dynamique des frais ajuste les frais de base en fonction des conditions réseau en temps réel. Toute l'inférence IA est entièrement déterministe entre validateurs — des entrées identiques produisent des sorties identiques sans dépendance à un oracle externe.

### 3. Environnement d'exécution triple-VM

QoreChain est la seule couche 1 à exécuter nativement trois machines virtuelles au sein d'un même consensus :

* **EVM** — Compatibilité Ethereum complète avec tarification du gas EIP-1559 et JSON-RPC sur le port 8545. Déployez des contrats Solidity avec l'outillage standard (Hardhat, Foundry, Remix).
* **CosmWasm** — Contrats intelligents WebAssembly écrits en Rust avec prise en charge complète du cycle de vie (instanciation, exécution, requête, migration).
* **SVM** — Déploiement et exécution de programmes BPF avec un serveur JSON-RPC compatible Solana sur le port 8899. Les clients et l'outillage Solana existants fonctionnent immédiatement.

La messagerie inter-VM permet aux trois environnements de communiquer : les contrats EVM appellent CosmWasm via precompile, les contrats CosmWasm appellent l'EVM via des messages personnalisés, et les programmes SVM participent par un pontage asynchrone basé sur les événements.

### 4. Tokenomics à offre fixe

Dix canaux de burn distincts (frais de transaction, pénalités de gouvernance, slashing, frais de pont, dissuasion du spam, excédent d'epoch, burns manuels, callbacks de contrat, frais inter-VM et burns de création de rollup) alimentent un module central de comptabilité des burns. Les frais collectés sont répartis **37 % aux validateurs, 30 % brûlés définitivement, 20 % à la trésorerie, 10 % aux stakers et 3 % aux nœuds légers**. Le mécanisme de staking de gouvernance xQORE permet aux utilisateurs de verrouiller du QOR pour un poids de gouvernance doublé avec redistribution par rebase PvP — les pénalités de sortie anticipée sont redistribuées aux détenteurs restants, récompensant la conviction.

QoreChain utilise un modèle à **offre fixe** avec un budget d'émission fini plutôt qu'une inflation perpétuelle en pourcentage. L'offre totale est fixée à **4 500 000 000 QOR**, dont **80 000 000 (1,78 %)** ont été brûlés au TGE. Les récompenses de staking sont versées à partir d'un pool dédié de **590 000 000 QOR** selon un calendrier pluriannuel :

| Période | APY cible | Budget d'émission |
| --- | --- | --- |
| Année 1 | 8–12 % | 127 500 000 QOR |
| Année 2 | 6–10 % | 106 250 000 QOR |
| Années 3–4 | 5–8 % | 85 000 000 QOR par an |
| Année 5+ | Déterminé par la gouvernance | ~186 000 000 QOR restants |

Combinée aux dix canaux de burn, la conception à offre fixe converge vers un comportement net déflationniste à mesure que le volume de transactions augmente.

### 5. Connectivité inter-chaînes

QoreChain est conçue pour se connecter à un large ensemble d'écosystèmes blockchain à travers deux protocoles complémentaires : l'IBC natif et le QoreChain Bridge (QCB). La couche de pont définit **37 configurations de chaîne QCB (y compris QoreChain elle-même en boucle de retour native)** plus **8 canaux IBC** — couvrant **36 chaînes externes** au total. La couche inter-chaînes est actuellement en **statut testnet / en attente et n'est pas encore en production** ; les chiffres ci-dessous décrivent la couverture visée.

* **8 canaux IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon et Injective. Modèles de relayeur préconfigurés avec mises à jour de client, détection de comportement malveillant et nettoyage automatique des paquets.
* **37 configurations QCB (36 chaînes externes + boucle de retour QoreChain)** — chaque point de terminaison est conçu pour inclure une validation d'adresse par type, une profondeur de confirmation configurable, des plafonds de volume par disjoncteur et des attestations de validateur signées PQC. Les chaînes externes visées sont :
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

Cinq profils prédéfinis (**defi, gaming, nft, enterprise, custom**) permettent un déploiement en un clic avec des modes de règlement, temps de bloc, choix de VM, backends DA et modèles de gas préconfigurés. Un routeur DA natif fournit un stockage de blobs validé par SHA-256 avec rétention configurable et élagage automatique. Le module de consensus PRISM fournit des méthodes consultatives pour la configuration de rollup assistée par l'IA.

### 7. Abstraction de compte et de gas

Les comptes intelligents avec trois types programmables (multisig, récupération sociale, basé sur session) prennent en charge des clés de session avec permissions et expiration granulaires, des règles de dépenses par compte et des listes d'autorisation de denoms. Cela permet des modèles d'UX de portefeuille impossibles avec des comptes standard : clés de session de dApp pour mobile, récupération sociale en tant que type de compte de premier ordre et limites de dépenses programmables appliquées au niveau du consensus. L'abstraction de gas supprime l'obligation de détenir du QOR natif pour les frais — les utilisateurs peuvent payer avec n'importe quel jeton transféré par IBC accepté, comme USDC ou ATOM.

## Écosystème

QoreChain est livrée avec **plus de 45 modules de genesis, dont plus de 20 modules personnalisés**, couvrant la sécurité (pqc), l'IA (ai, reputation, rlconsensus), le consensus (qca), les machines virtuelles (vm, svm, crossvm), la tokenomics (burn, xqore, inflation), la liquidité (amm), la licence (license), les ponts (bridge, babylon, multilayer), les extensions de gouvernance (abstractaccount, fairblock, gasabstraction) et les rollups (rdk). Les ajouts récents incluent `x/amm` pour l'AMM / la liquidité on-chain et `x/license` pour la licence de chaîne. La chaîne suit une architecture open-core — la couche de protocole est entièrement open source, avec des extensions propriétaires optionnelles pour les déploiements d'entreprise.

## Liens connexes

* [Vue d'ensemble de l'architecture](/introduction/architecture-overview) — comment les couches s'imbriquent de bout en bout.
* [Fonctionnalités clés](/introduction/key-features) — les capacités phares en un coup d'œil.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — le consensus assisté par l'IA au cœur du système.
* [Tokenomics](/architecture/tokenomics) — offre, burns, rebases et émissions de QOR.
* [Démarrage rapide](/getting-started/quickstart) — lancez un nœud local et commencez à développer.
