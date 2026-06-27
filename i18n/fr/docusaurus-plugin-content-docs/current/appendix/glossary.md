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

**BPF** — Berkeley Packet Filter. Le format de bytecode utilisé par le runtime SVM pour exécuter des programmes on-chain. Les programmes sont compilés en BPF avant déploiement.

**Chain License** — Un enregistrement de licence on-chain géré par le module `x/license`. Les licences de chaîne contrôlent l'accès à des capacités spécifiques du protocole et permettent aux opérateurs d'enregistrer, de vérifier et de gérer leurs droits de licence on-chain. Voir [Licence de chaîne](/architecture/chain-licensing).

**CLFB** — Cross-Layer Fee Balancing (équilibrage des frais inter-couches). Un mécanisme au sein de l'architecture multicouche qui ajuste dynamiquement les frais entre sidechains et paychains afin de maintenir l'équilibre et d'éviter la congestion sur une couche donnée.

**CPI** — Cross-Program Invocation (invocation inter-programmes). Un mécanisme du runtime SVM qui permet à un programme déployé d'en appeler un autre dans le même contexte de transaction.

**CPoS** — Classified Proof-of-Stake (preuve d'enjeu classifiée). Le système de classification du consensus de QoreChain qui regroupe les validateurs en trois pools (Emerald, Sapphire, Ruby) selon leurs scores de réputation. Chaque pool a un poids distinct dans l'algorithme de sélection du proposeur.

**DA** — Data Availability (disponibilité des données). La garantie que les données de transaction publiées sur la chaîne peuvent être récupérées par tout nœud. Le module RDK fournit une DA native pour les rollups, en stockant les blobs on-chain avec des périodes de rétention configurables.

**DPoS** — Delegated Proof-of-Stake (preuve d'enjeu déléguée). Un mécanisme de consensus dans lequel les détenteurs de jetons délèguent leur enjeu à des validateurs qui produisent des blocs en leur nom. QoreChain étend le DPoS avec une classification pondérée par la réputation (CPoS).

**EIP-1559** — Ethereum Improvement Proposal 1559. Un modèle de frais de transaction utilisant un frais de base (brûlé) plus un frais de priorité (versé aux validateurs). QoreChain implémente une mécanique de frais de type EIP-1559 dans son moteur EVM QoreChain.

**HCS** — Hybrid Cryptographic Signatures (signatures cryptographiques hybrides). Le système de double signature de QoreChain où les transactions portent à la fois une signature classique (secp256k1/ECDSA) et une signature post-quantique (ML-DSA-87), assurant une sécurité cryptographique contre les adversaires classiques comme quantiques.

**IBC** — Inter-Blockchain Communication (communication inter-blockchains). Un protocole de transmission de messages authentifiés entre blockchains indépendantes. QoreChain prend en charge les canaux IBC pour les transferts de jetons inter-chaînes et le relais de données.

**Light Node** (nœud léger) — Un nœud peu gourmand en ressources qui suit la chaîne et sert des requêtes légères sans détenir l'état complet. Les nœuds légers reçoivent une part dédiée de **3 %** de la répartition des frais du protocole, récompensant les participants qui étendent la portée du réseau. Voir [Nœud léger](/light-node/overview).

**MEV** — Maximal Extractable Value (valeur extractible maximale). Le profit pouvant être obtenu en réordonnant, insérant ou censurant des transactions au sein d'un bloc. Le module FairBlock de QoreChain (chiffrement tIBE) et la priorisation des TX sur 5 voies atténuent l'extraction de MEV.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (niveau de sécurité 5). Le schéma de signature numérique post-quantique standardisé par le NIST utilisé par QoreChain pour la signature de transactions résistante au quantique. Produit des signatures de 4 627 octets avec des clés publiques de 2 592 octets.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (niveau de sécurité 5). Un schéma d'encapsulation de clé post-quantique standardisé par le NIST, disponible dans le registre d'algorithmes PQC de QoreChain pour de futurs canaux de communication chiffrés.

**MLP** — Multi-Layer Perceptron (perceptron multicouche). Une classe de réseau de neurones utilisée par QCAI pour la reconnaissance de motifs dans la détection de fraude et le scoring d'anomalies.

**PPO** — Proximal Policy Optimization. Un algorithme d'apprentissage par renforcement utilisé par PRISM pour optimiser les paramètres de la chaîne (taille de bloc, limites de gas, taille de l'ensemble de validateurs) en fonction des conditions réseau observées.

**PQC** — Post-Quantum Cryptography (cryptographie post-quantique). Algorithmes cryptographiques conçus pour être sûrs face aux attaques d'ordinateurs classiques comme quantiques. QoreChain implémente la PQC via son module `x/pqc` avec ML-DSA-87 comme schéma de signature principal.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. La couche d'optimisation par apprentissage par renforcement intégrée au moteur de consensus de QoreChain (via le module `x/rlconsensus`). PRISM observe les métriques du réseau et propose des ajustements déterministes des paramètres de consensus sous des contrôles de sécurité de type disjoncteur. Voir [Moteur de consensus PRISM](/architecture/prism-consensus-engine).

**PvP Rebase** — Player versus Player Rebase. Un mécanisme du module xQORE où les pénalités issues d'un déverrouillage anticipé sont redistribuées proportionnellement aux stakers dont l'enjeu reste verrouillé, récompensant l'engagement à long terme.

**QCAI** — QoreChain Artificial Intelligence. Le terme générique désignant le sous-système d'IA de QoreChain, incluant le moteur heuristique on-chain (module `x/ai`) et le sidecar QCAI off-chain qui fournit des capacités d'inférence avancées.

**QCB** — QoreChain Bridge. Le protocole de bridge natif de QoreChain pour se connecter à des chaînes non-IBC (par ex. Ethereum, Bitcoin, Solana, Avalanche). QCB utilise un ensemble de validateurs fédérés pour l'attestation inter-chaînes. Voir [Architecture du bridge](/architecture/bridge-architecture).

**QDRW** — QoreChain Dynamic Reward Weighting (pondération dynamique des récompenses). Un mécanisme de gouvernance qui permet à PRISM (sous approbation de la gouvernance) d'ajuster dynamiquement les poids de distribution des récompenses entre les pools de validateurs, en optimisant les métriques de santé du réseau.

**RDK** — Rollup Development Kit. Le framework natif de QoreChain pour déployer et gérer des rollups avec quatre paradigmes de règlement (optimistic, zk, based, sovereign), cinq profils prédéfinis et une disponibilité des données intégrée. Voir [Vue d'ensemble des rollups](/rollups/overview).

**RL** — Reinforcement Learning (apprentissage par renforcement). Une approche d'apprentissage automatique où un agent apprend les actions optimales par essai et récompense. PRISM utilise le RL pour ajuster dynamiquement les paramètres de la chaîne au sein du moteur de consensus de QoreChain.

**RPoS** — Reputation-based Proof-of-Stake (preuve d'enjeu basée sur la réputation). Le modèle de consensus global combinant la délégation DPoS avec le scoring de réputation. Les validateurs gagnent de la réputation par leur disponibilité, leur participation et leurs contributions communautaires, ce qui influence la fréquence de leurs propositions de blocs.

**SHAKE-256** — Une fonction de hachage à longueur de sortie variable de la famille SHA-3. QoreChain utilise SHAKE-256 comme fonction de hachage fondamentale pour les opérations liées à la PQC, y compris la dérivation de clés et le calcul d'adresses.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Un type de preuve à divulgation nulle de connaissance pouvant être vérifié rapidement avec une preuve de petite taille. Pris en charge comme paradigme de règlement dans le module RDK pour les zk-rollups.

**STARK** — Scalable Transparent Argument of Knowledge. Un système de preuve à divulgation nulle de connaissance ne nécessitant aucune configuration de confiance et résistant au quantique. Disponible comme système de preuve alternatif pour le règlement des zk-rollups dans le RDK.

**SVM** — Solana Virtual Machine. Un environnement d'exécution haute performance pour les programmes BPF. QoreChain intègre la SVM comme l'un des trois runtimes pris en charge, aux côtés du moteur EVM QoreChain et de CosmWasm.

**TEE** — Trusted Execution Environment (environnement d'exécution de confiance). Une zone sécurisée d'un processeur garantissant que le code et les données sont protégés contre tout accès externe. Le module PQC de QoreChain prend en charge l'attestation TEE pour les preuves de génération de clés.

**tIBE** — Threshold Identity-Based Encryption (chiffrement basé sur l'identité à seuil). Un schéma cryptographique où un message ne peut être déchiffré que lorsqu'un seuil de parties collaborent. Utilisé par le module FairBlock pour chiffrer le contenu des transactions jusqu'à la finalisation du bloc, empêchant l'extraction de MEV.

**uqor** — La dénomination de base du jeton QOR. 1 QOR = 1 000 000 uqor (10^6). Tous les montants on-chain, frais et valeurs de staking sont libellés en uqor.

**xQORE** — Le dérivé de staking de gouvernance de QOR. Les utilisateurs verrouillent du QOR pour recevoir du xQORE, qui confère un pouvoir de vote de gouvernance renforcé et perçoit des récompenses de rebase PvP issues des pénalités de déverrouillage anticipé. Voir [Tokenomics](/architecture/tokenomics).
