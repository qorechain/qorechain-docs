---
slug: /introduction/key-features
title: Fonctionnalités clés
sidebar_label: Fonctionnalités clés
sidebar_position: 3
---

# Fonctionnalités clés

Le tableau suivant répertorie toutes les fonctionnalités majeures de QoreChain, organisées par phase de version dans laquelle elles ont été introduites. La version actuelle de la chaîne est **v3.1.82**, avec le mainnet (`qorechain-vladi`, EVM chain ID 9801) en service depuis le 7 juin 2026 et un testnet parallèle (`qorechain-diana`, EVM chain ID 9800).

| Fonctionnalité             | Introduite dans     | Description                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signatures hybrides PQC (requises par défaut) | v1.1.0 (Sécurité)   | Doubles signatures sur chaque transaction du chemin Cosmos : une signature classique secp256k1 (ECDSA) associée à ML-DSA-87 (Dilithium-5). À partir de v3.1.71, la valeur par défaut du réseau est **required** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — les transactions Cosmos uniquement classiques sont rejetées ; seuls les gentxs de genesis et les transactions d'enregistrement/migration de clé PQC sont exemptés. Les transactions EVM utilisent un chemin `eth_secp256k1` distinct et ne sont pas affectées. Trois modes d'application contrôlés par la gouvernance (disabled / optional / required) restent disponibles. Intégration transparente des portefeuilles via l'enregistrement automatique par extension de TX. |
| Hash SHAKE-256 par défaut  | v1.1.0 (Sécurité)   | Fonction à sortie extensible (XOF) de la famille SHA-3. À partir de v3.1.73, SHAKE-256 (via le package `qorehash`) est le **hash d'application par défaut**, complétant la base PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Fournit un hachage de longueur variable, une sortie fixe de 32 octets, la concaténation des nœuds internes Merkle et le hachage à séparation de domaine — le tout en pur Go sans dépendance FFI. |
| Interfaces TEE et FL       | v1.1.0 (Sécurité)   | Spécifications d'interface de qualité production pour l'attestation d'environnement d'exécution de confiance (Trusted Execution Environment : SGX, TDX, SEV-SNP, ARM CCA) et la coordination de l'apprentissage fédéré (Federated Learning : méthodes d'agrégation FedAvg, FedProx, SCAFFOLD). Permet l'inférence IA en enclave matérielle et l'entraînement distribué de modèles préservant la confidentialité avec des garanties cryptographiques. |
| Consensus RL on-chain (PRISM) | v1.0.0 (Genesis) | Un MLP à virgule fixe natif en Go (73 733 paramètres) exécute l'inférence PPO directement dans le cycle de vie des blocs. La couche d'optimisation PRISM règle dynamiquement le temps de bloc, les limites de gas et les poids des pools de validateurs sans oracles externes. Des calculs déterministes par séries de Taylor garantissent des résultats identiques sur tous les validateurs. Quatre modes de fonctionnement : shadow, conservative, autonomous et paused. Protection par disjoncteur pour la sécurité. |
| Triple-Pool Composite PoS  | v1.0.0 (Genesis)    | Les validateurs sont classés dans les pools RPoS (pondéré par réputation), DPoS (pondéré par délégation) et PoS (standard) tous les 1 000 blocs sur le QoreChain Consensus Engine. Le tirage pondéré par pool diversifie la production de blocs au-delà de la simple domination par la mise. Une courbe de bonding personnalisée prend en compte la mise auto-bondée, la durée de fidélité, la qualité de réputation et la phase du protocole. |
| Gouvernance QDRW           | v1.0.0 (Genesis)    | Quadratic Delegation with Reputation Weighting (délégation quadratique avec pondération par réputation). Le pouvoir de vote utilise une fonction racine carrée atténuée par un multiplicateur de réputation sigmoïde, empêchant la capture par les baleines tout en récompensant la participation honnête de long terme. Un avantage de mise de 100x donne environ 10x de pouvoir de vote. Les avoirs en xQORE doublent le poids de vote. |
| Moteur de burn             | v1.0.0 (Genesis)    | Dix canaux de burn distincts : frais de transaction, pénalités de gouvernance, slashing, frais de pont, dissuasion du spam, excédent d'epoch, burns manuels, callbacks de contrat, frais inter-VM et burns de création de rollup. Les frais collectés sont répartis **37 % aux validateurs, 30 % brûlés définitivement, 20 % à la trésorerie, 10 % aux stakers et 3 % aux nœuds légers**. |
| Staking xQORE              | v1.0.0 (Genesis)    | Verrouillez du QOR pour frapper du xQORE à un ratio 1:1 afin de doubler le poids de gouvernance dans les votes QDRW. Les pénalités de sortie graduées (50 % avant 30 jours, 35 % entre 30 et 90 jours, 15 % entre 90 et 180 jours, 0 % après 180 jours) sont redistribuées aux détenteurs restants via le rebase PvP — récompensant la conviction et pénalisant le capital de court terme. |
| Émissions à offre fixe     | v1.0.0 (Genesis)    | Une offre totale fixe de 4 500 000 000 QOR (80 000 000 brûlés au TGE) avec un budget fini de récompenses de staking de 590 000 000 QOR : Année 1 à 8–12 % APY (127 500 000 QOR), Année 2 à 6–10 % APY (106 250 000 QOR), Années 3–4 à 5–8 % APY (85 000 000 QOR par an), et Année 5+ déterminée par la gouvernance (~186 000 000 QOR restants). Combiné au moteur de burn, le QOR converge vers un comportement net déflationniste à mesure que le volume de transactions augmente. |
| Environnement d'exécution EVM | v1.0.0 (Genesis) | Compatibilité Ethereum complète avec tarification du gas EIP-1559, JSON-RPC sur le port 8545 (espaces de noms `eth_`, `web3_`, `net_`, `txpool_`, `qor_`) et prise en charge de l'outillage standard (Hardhat, Foundry, Remix). Déployez et interagissez avec des contrats Solidity en utilisant des workflows Ethereum existants. |
| Environnement d'exécution CosmWasm | v1.0.0 (Genesis) | Moteur de contrats intelligents WebAssembly pour les contrats basés sur Rust. Prise en charge complète du cycle de vie : instanciation, exécution, requête et migration. Les contrats s'exécutent dans un environnement Wasm en bac à sable avec exécution déterministe. |
| Environnement d'exécution SVM | v1.0.0 (Genesis) | Déploiement et exécution de programmes BPF via un exécuteur basé sur Rust. Le serveur JSON-RPC compatible Solana sur le port 8899 prend en charge `getAccountInfo`, `getBalance`, `getSlot`, et bien plus. Les clients et l'outillage Solana existants fonctionnent sans modification. |
| Pont inter-VM              | v1.0.0 (Genesis)    | Interopérabilité transparente entre les trois VM. Les contrats EVM appellent CosmWasm via precompile ; les contrats CosmWasm appellent l'EVM via des messages personnalisés ; les programmes SVM participent par un pontage asynchrone basé sur les événements. Appels synchrones EVM-CosmWasm et messagerie asynchrone SVM au sein d'une seule chaîne. |
| Connectivité inter-chaînes | v1.2.0 (Interop)    | Huit canaux IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) plus **37 configurations QCB couvrant 36 chaînes externes** (y compris QoreChain elle-même en boucle de retour native). Attestations de validateur signées PQC, profondeurs de confirmation par chaîne et plafonds de volume par disjoncteur. Actuellement en statut testnet / en attente — pas encore en production. |
| Restaking BTC              | v1.2.0 (Interop)    | Intégration de Babylon Protocol pour les garanties de finalité Bitcoin. Les validateurs enregistrent des positions de staking BTC (minimum 100 000 satoshis). Les racines d'état d'epoch de QoreChain font périodiquement l'objet d'un point de contrôle vers Bitcoin via des epochs Babylon relayés par IBC, fournissant une couche de finalité secondaire soutenue par le hashrate BTC. |
| Abstraction de compte      | v1.2.0 (Interop)    | Comptes intelligents programmables au niveau du protocole (similaire à ERC-4337). Trois types de comptes : multisig, récupération sociale et basé sur session. Clés de session avec permissions et expiration granulaires, règles de dépenses quotidiennes par compte et par transaction, listes d'autorisation de denoms cadrées et application automatique des règles au niveau du consensus. |
| Protection MEV             | v1.2.0 (Interop)    | Framework de chiffrement à seuil basé sur l'identité (tIBE) FairBlock pour les mempools chiffrés. Les transactions sont cryptographiquement opaques pour les proposeurs de blocs jusqu'à leur inclusion, éliminant le front-running et les attaques sandwich. Le gestionnaire ante FairBlockDecorator est câblé et prêt ; le déchiffrement à seuil tIBE s'active après le déploiement de la cérémonie de clés. |
| Abstraction de gas         | v1.2.0 (Interop)    | Le paiement de gas multi-jetons supprime l'obligation de détenir du QOR natif pour les frais de transaction. Les utilisateurs peuvent payer en jetons transférés par IBC acceptés : ibc/USDC à un taux de 1:1 et ibc/ATOM à un taux de 10:1. Le GasAbstractionDecorator valide et convertit les denoms de frais non natifs avant la déduction standard des frais. |
| Priorisation à 5 voies     | v1.2.0 (Interop)    | L'espace de bloc est partitionné statiquement en cinq voies de priorité : PQC (priorité 100, 15 % de l'espace), MEV (90, 20 %), AI (80, 15 %), Default (50, 40 %) et Free (10, 10 %). Les transactions critiques pour la sécurité ne peuvent jamais être évincées par le trafic standard à fort volume. |
| Liquidité on-chain (AMM)   | v1.2.0 (Interop)    | Le teneur de marché automatisé natif (`x/amm`) fournit des pools de liquidité on-chain et des swaps au niveau du protocole. |
| Rollups RDK                | v1.3.0 (Rollups)    | Rollup Development Kit avec quatre paradigmes de règlement (optimistic, zk, based, sovereign), cinq profils prédéfinis (defi, gaming, nft, enterprise, custom), routeur DA natif avec stockage de blobs SHA-256 et élagage automatique, cycle de vie de séquestre bancaire avec taux de burn de création configurable, auto-finalisation par EndBlocker et configuration assistée par PRISM via le module de consensus. Les capacités de rollup sont livrées sous forme de framework de chaîne hôte. |
| Licence de chaîne          | v1.3.0 (Rollups)    | Le module `x/license` fournit une licence de chaîne native au protocole. |

## Historique des versions

<details>

<summary>v1.0.0 — Version Genesis</summary>

A établi le protocole central avec la cryptographie post-quantique (Dilithium-5, ML-KEM-1024), la couche de consensus par apprentissage par renforcement on-chain PRISM, l'environnement d'exécution triple-VM (EVM, CosmWasm, SVM) avec messagerie inter-VM, le moteur de tokenomics à offre fixe (burn, xQORE, budget d'émission fini), la sélection des validateurs Triple-Pool Composite PoS, la gouvernance quadratique QDRW et le pipeline de traitement IA des transactions.

</details>

<details>

<summary>v1.1.0 — Version de renforcement de la sécurité</summary>

A introduit l'architecture de signature hybride associant une signature classique secp256k1 (ECDSA) à ML-DSA-87, avec trois modes d'application contrôlés par la gouvernance, la base de hash post-quantique SHAKE-256 pour le futur remplacement de l'arbre de Merkle, et des spécifications d'interface de qualité production pour l'attestation TEE (SGX, TDX, SEV-SNP, ARM CCA) et la coordination de l'apprentissage fédéré (FedAvg, FedProx, SCAFFOLD).

</details>

<details>

<summary>v1.2.0 — Version interopérabilité et UX</summary>

A ajouté la connectivité inter-chaînes (8 canaux IBC + 37 configurations QCB couvrant 36 chaînes externes, actuellement en testnet/en attente), le restaking BTC via Babylon Protocol, l'abstraction de compte intelligent avec clés de session et récupération sociale, le framework de protection MEV FairBlock, l'abstraction de gas multi-jetons, la liquidité on-chain (`x/amm`) et la priorisation de l'espace de bloc à 5 voies.

</details>

<details>

<summary>v1.3.0 — Version écosystème de rollups</summary>

A livré le Rollup Development Kit avec quatre paradigmes de règlement (optimistic, zk, based, sovereign), cinq profils de déploiement prédéfinis (defi, gaming, nft, enterprise, custom), un routeur DA natif, la gestion du cycle de vie de séquestre bancaire, l'auto-finalisation pilotée par EndBlocker, la configuration de rollup assistée par PRISM et la licence de chaîne (`x/license`). Intégration profonde avec le module d'architecture multicouche pour l'enregistrement automatique des sidechains et l'ancrage d'état.

</details>

## Liens connexes

* [Qu'est-ce que QoreChain](/introduction/what-is-qorechain) — la vue d'ensemble de la plateforme dans son contexte.
* [Tokenomics](/architecture/tokenomics) — le modèle économique derrière QOR.
* [Architecture du pont](/architecture/bridge-architecture) — connectivité inter-chaînes et restaking BTC.
* [Vue d'ensemble des rollups](/rollups/overview) — le Rollup Development Kit et les paradigmes de règlement.
