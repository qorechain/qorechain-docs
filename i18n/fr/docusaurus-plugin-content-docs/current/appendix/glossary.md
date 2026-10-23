---
slug: /appendix/glossary
title: Glossaire
sidebar_label: Glossaire
sidebar_position: 1
---

# Glossaire

Référence alphabétique des termes, abréviations et acronymes utilisés dans l'ensemble de la documentation QoreChain.

---

**AMM** — Automated Market Maker (teneur de marché automatisé). Le module de liquidité on-chain natif de QoreChain (`x/amm`) fournissant des pools à produit constant, des swaps et de l'apport de liquidité directement au niveau du protocole, sans déploiement de smart contract externe. Voir [AMM](/architecture/amm).

**Authorisation window (EVM)** (fenêtre d'autorisation EVM) — Une permission bornée (blocs, nombre de transactions, valeur totale), ouverte par un message de la voie Cosmos signé de façon post-quantique, à l'intérieur de laquelle une transaction de la voie EVM doit se situer depuis la v3.2.0. Depuis la v3.2.3, une fenêtre peut être restreinte aux seuls transferts natifs ou à une liste de destinataires. Voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. Le format de bytecode utilisé par le runtime SVM pour exécuter des programmes on-chain. Les programmes sont compilés en BPF avant déploiement.

**Chain License** — Un enregistrement de licence on-chain géré par le module `x/license`. Les licences de chaîne contrôlent l'accès à des capacités spécifiques du protocole et permettent aux opérateurs d'enregistrer, de vérifier et de gérer leurs droits de licence on-chain. Voir [Licence de chaîne](/architecture/chain-licensing).

**Circuit breaker** (disjoncteur) — Le mécanisme du Cosmos SDK qui désactive individuellement des types de messages sur l'ensemble du réseau ; la liste actuelle est consultable à `/cosmos/circuit/v1/disable_list`. Voir [Paramètres de la chaîne](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Cross-Layer Fee Bundling (regroupement des frais inter-couches). Un paiement de frais unique sur la couche source qui couvre l'exécution sur les couches d'un chemin inter-couches (le paramètre `cross_layer_fee_bundling` de `x/multilayer`). Voir [Architecture multicouche](/architecture/multilayer-architecture).

**CPI** — Cross-Program Invocation (invocation inter-programmes). Un mécanisme du runtime SVM qui permet à un programme déployé d'en appeler un autre dans le même contexte de transaction.

**CPoS** — Composite Proof-of-Stake (preuve d'enjeu composite). Le système de classification du consensus de QoreChain, conçu pour regrouper les validateurs en trois pools (RPoS, DPoS, PoS) selon la réputation et la délégation. Chaque pool a un poids distinct dans l'algorithme de sélection du proposeur. Implémenté dans `x/qca` mais pas encore actif dans la production de blocs.

**DA** — Data Availability (disponibilité des données). La garantie que les données de transaction publiées sur la chaîne peuvent être récupérées par tout nœud. Le module RDK fournit une DA native pour les rollups, en stockant les blobs on-chain avec des périodes de rétention configurables.

**DPoS** — Delegated Proof-of-Stake (preuve d'enjeu déléguée). Un mécanisme de consensus dans lequel les détenteurs de jetons délèguent leur enjeu à des validateurs qui produisent des blocs en leur nom.

**EIP-1559** — Ethereum Improvement Proposal 1559. Un modèle de frais de transaction utilisant un frais de base (brûlé) plus un frais de priorité (versé aux validateurs). QoreChain implémente une mécanique de frais de type EIP-1559 dans son moteur EVM QoreChain.

**HCS** — Hierarchical Commitment Schemes (schémas d'engagement hiérarchiques). Le mécanisme par lequel les sidechains, paychains et rollups ancrent périodiquement leurs racines d'état sur la chaîne principale (voir Architecture multicouche). À ne pas confondre avec le schéma de signature hybride secp256k1 + ML-DSA-87, que cette documentation appelle une *signature hybride*.

**Hybrid sign-bytes v2** (octets de signature hybrides v2) — Les octets étiquetés par domaine et liés à la chaîne que la clé ML-DSA signe à partir de la v3.2.0. Voir [Sécurité post-quantique](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Inter-Blockchain Communication (communication inter-blockchains). Un protocole de transmission de messages authentifiés entre blockchains indépendantes. QoreChain prend en charge les canaux IBC pour les transferts de jetons inter-chaînes et le relais de données.

**Light Node** (nœud léger) — Un client peu gourmand en ressources qui suit la chaîne en recoupant les en-têtes de blocs auprès d'un ou plusieurs points de terminaison RPC, sans détenir l'état complet. Il ne sert pas de requêtes à d'autres. La répartition des frais du protocole réserve une part de **3 %** au programme de récompenses des nœuds légers. L'enregistrement au programme est ouvert et soumis à une licence `lightnode_operator` (50 $, achetée sur le tableau de bord) ; au 20 octobre 2026, six licences avaient été accordées sur le mainnet et aucun nœud léger ne s'était encore enregistré. Exécuter un nœud ne nécessite aucune licence. Voir [Nœud léger](/light-node/overview) et son [état du programme de récompenses](/light-node/overview#reward-program-status).

**MEV** — Maximal Extractable Value (valeur extractible maximale). Le profit pouvant être obtenu en réordonnant, insérant ou censurant des transactions au sein d'un bloc. Le module FairBlock de QoreChain (chiffrement tIBE) est conçu pour atténuer l'extraction de MEV ; il n'est pas encore activé.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (niveau de sécurité 5). Le schéma de signature numérique post-quantique standardisé par le NIST utilisé par QoreChain pour la signature de transactions résistante au quantique. Produit des signatures de 4 627 octets avec des clés publiques de 2 592 octets.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (niveau de sécurité 5). Un schéma d'encapsulation de clé post-quantique standardisé par le NIST, disponible dans le registre d'algorithmes PQC de QoreChain pour de futurs canaux de communication chiffrés.

**MLP** — Multi-Layer Perceptron (perceptron multicouche). Une classe de réseau de neurones utilisée par QCAI pour la reconnaissance de motifs dans la détection de fraude et le scoring d'anomalies.

**PPO** — Proximal Policy Optimization. Un algorithme d'apprentissage par renforcement utilisé par PRISM pour optimiser les paramètres de la chaîne (temps de bloc, prix du gas, poids des pools ; la taille de l'ensemble de validateurs est uniquement journalisée) en fonction des conditions réseau observées. Aucune politique entraînée n'est chargée sur les réseaux en production.

**PQC** — Post-Quantum Cryptography (cryptographie post-quantique). Algorithmes cryptographiques conçus pour être sûrs face aux attaques d'ordinateurs classiques comme quantiques. QoreChain implémente la PQC via son module `x/pqc` avec ML-DSA-87 comme schéma de signature principal.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. La couche d'optimisation par apprentissage par renforcement intégrée au moteur de consensus de QoreChain (via le module `x/rlconsensus`). PRISM observe les métriques du réseau et est conçu pour proposer des ajustements déterministes des paramètres de consensus sous des contrôles de sécurité de type disjoncteur ; aujourd'hui, il fonctionne en mode observation. Voir [Moteur de consensus PRISM](/architecture/prism-consensus-engine).

**Proof of possession (PoP)** (preuve de possession) — Une signature qu'une clé post-quantique effectue sur ses propres informations d'enregistrement, prouvant que la personne qui l'enregistre détient la clé privée. Facultative lors de l'enregistrement d'une clé de compte depuis la v3.2.3 (`tx pqc register-key-v2 ... --pqc-key <name>`) ; requise pour les clés de validateur de bridge à partir de la v3.2.4 (sur le testnet depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026).

**Protocol feature** (fonctionnalité de protocole) — Un interrupteur de comportement que le gestionnaire de mise à niveau d'une version active à une hauteur de bloc donnée sur chaque nœud (par exemple `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`), de sorte que l'historique se rejoue sans changement en dessous de cette hauteur.

**PvP Rebase** — Player versus Player Rebase. Un mécanisme du module xQORE où les pénalités issues d'un déverrouillage anticipé sont redistribuées proportionnellement aux stakers dont l'enjeu reste verrouillé, récompensant l'engagement à long terme (pas encore câblé on-chain).

**QCAI** — QoreChain Artificial Intelligence. Le terme générique désignant le sous-système d'IA de QoreChain, incluant le moteur heuristique on-chain (module `x/ai`) et le sidecar QCAI off-chain qui fournit des capacités d'inférence avancées.

**QoreChain Native** — Le nom donné par QoreChain à son runtime de contrats intelligents CosmWasm : les contrats sont écrits en Rust avec les bibliothèques CosmWasm standard et compilés en WebAssembly. C'est l'un des trois runtimes (EVM, QoreChain Native, SVM). Le téléversement et l'instanciation ordinaires de contrats sont actuellement fermés sur les deux réseaux (voir [Développement QoreChain Native](/developer-guide/cosmwasm-development)).

**QCB** — QoreChain Bridge. Le protocole de bridge natif de QoreChain pour se connecter à des chaînes non-IBC (par ex. Ethereum, Bitcoin, Solana, Avalanche). QCB utilise un seuil d'attestation de validateurs (7 signatures ML-DSA-87 sur 10) pour l'attestation inter-chaînes. Voir [Architecture du bridge](/architecture/bridge-architecture).

**QDRW** — Quadratic Delegation with Reputation Weighting (délégation quadratique avec pondération par réputation). Une formule de pouvoir de vote de gouvernance (racine carrée de la mise plus xQORE pondéré, mise à l'échelle par un multiplicateur de réputation). Implémentée dans `x/qca` mais désactivée sur les réseaux en production (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit. Le framework natif de QoreChain pour déployer et gérer des rollups avec quatre paradigmes de règlement (optimistic, zk, based, sovereign), cinq profils prédéfinis et une disponibilité des données intégrée. Voir [Vue d'ensemble des rollups](/rollups/overview).

**RL** — Reinforcement Learning (apprentissage par renforcement). Une approche d'apprentissage automatique où un agent apprend les actions optimales par essai et récompense. PRISM est conçu pour utiliser le RL afin d'ajuster les paramètres de la chaîne au sein du moteur de consensus de QoreChain (observation uniquement aujourd'hui).

**RPoS** — Reputation Proof-of-Stake (preuve d'enjeu de réputation). Le pool des validateurs situés au 70e percentile de réputation ou au-delà, avec au moins la mise auto-bondée médiane. Les validateurs gagnent de la réputation par leur disponibilité, leur participation et leurs contributions communautaires.

**SHAKE-256** — Une fonction de hachage à longueur de sortie variable de la famille SHA-3. SHAKE-256 est la fonction de hachage d'application par défaut de QoreChain (le package `qorehash`) et sert aux opérations liées à la PQC telles que la dérivation de clés.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Un type de preuve à divulgation nulle de connaissance pouvant être vérifié rapidement avec une preuve de petite taille. Pris en charge comme paradigme de règlement dans le module RDK pour les zk-rollups.

**STARK** — Scalable Transparent Argument of Knowledge. Un système de preuve à divulgation nulle de connaissance ne nécessitant aucune configuration de confiance et résistant au quantique. Disponible comme système de preuve alternatif pour le règlement des zk-rollups dans le RDK.

**Stranded staker share / reward-pool reserve** (part de staker bloquée / réserve du pool de récompenses) — Montants enregistrés lors de la mise à niveau v3.2.0 qui ne bougent que par un vote de gouvernance ; la gouvernance les a libérés en octobre 2026 (le reliquat corrigé de la part bloquée, recalculé à la v3.2.3, a été libéré par la proposition 12). Voir [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Solana Virtual Machine. Un environnement d'exécution haute performance pour les programmes BPF. QoreChain intègre la SVM comme l'un des trois runtimes pris en charge, aux côtés du moteur EVM QoreChain et de QoreChain Native.

**TEE** — Trusted Execution Environment (environnement d'exécution de confiance). Une zone sécurisée d'un processeur garantissant que le code et les données sont protégés contre tout accès externe. QoreChain définit des spécifications d'interface pour l'attestation TEE ; aucune implémentation n'existe encore.

**tIBE** — Threshold Identity-Based Encryption (chiffrement basé sur l'identité à seuil). Un schéma cryptographique où un message ne peut être déchiffré que lorsqu'un seuil de parties collaborent. Utilisé par le module FairBlock pour chiffrer le contenu des transactions jusqu'à la finalisation du bloc, empêchant l'extraction de MEV.

**Time-locked staking** (staking à verrouillage temporel) — Un engagement facultatif d'une partie d'une délégation pour une durée fixe, fourni par le module `x/stakingtier`. Fait partie de la v3.2.4 : sur le testnet depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026. Voir [Staking et délégation](/user-guide/staking-and-delegation#time-locked-staking).

**uqor** — La dénomination de base du jeton QOR. 1 QOR = 1 000 000 uqor (10^6). Tous les montants on-chain, frais et valeurs de staking sont libellés en uqor.

**xQORE** — Le dérivé de staking de gouvernance de QOR. Les utilisateurs verrouillent du QOR pour recevoir du xQORE, qui confère un pouvoir de vote de gouvernance renforcé et perçoit des récompenses de rebase PvP issues des pénalités de déverrouillage anticipé (comportement prévu ; les transactions de verrouillage et de déverrouillage ne sont pas encore câblées on-chain). Voir [Tokenomics](/architecture/tokenomics#x-xqore).
