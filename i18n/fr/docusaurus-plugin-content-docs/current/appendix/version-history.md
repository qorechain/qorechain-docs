---
slug: /appendix/version-history
title: Historique des versions
sidebar_label: Historique des versions
sidebar_position: 3
---

# Historique des versions

Historique public des versions de QoreChain. La dernière version est la **v3.1.77**, exécutée sur le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en ligne depuis le 7 juin 2026). Le testnet **`qorechain-diana`** (EVM chain ID **9800**) suit les builds préliminaires.

:::note
Les entrées ci-dessous sont des résumés de capacités de haut niveau. Les entrées `v1.x` antérieures sont conservées comme enregistrement historique de la lignée de versions du testnet qui a précédé le mainnet.
:::

---

## v3.1.77 — Version mainnet actuelle

**Axe de la version :** Accès REST en lecture seule pour les modules inter-chaînes et d'offre.

* **Points de terminaison REST du bridge** — Points de terminaison de requête HTTP en lecture seule pour le module bridge, exposant l'état du bridge via REST standard en plus de gRPC.
* **Points de terminaison REST du burn** — Points de terminaison de requête HTTP en lecture seule pour le module burn, rendant les données de distribution des frais et d'offre interrogeables via REST standard.

## v3.1.76 — Modernisation de la chaîne d'outils SVM

**Axe de la version :** Mise à jour de la compatibilité avec la Solana Virtual Machine.

* **Prise en charge des programmes de la chaîne d'outils actuelle** — Exécution SVM modernisée afin que les programmes construits avec la chaîne d'outils Solana actuelle s'exécutent sur le runtime SVM de QoreChain.

## v3.1.75 — JSON-RPC SVM par défaut

**Axe de la version :** RPC compatible Solana prêt à l'emploi.

* **JSON-RPC compatible Solana** — Le serveur JSON-RPC SVM est désormais activé par défaut (port **8899**) et démarré automatiquement avec le nœud, fournissant une interface RPC compatible Solana pour l'outillage SVM.

## v3.1.74 — Préréglages de profil de rollup

**Axe de la version :** Ergonomie et règlement du Rollup Development Kit.

* **Application des préréglages de profil** — La création de rollup applique désormais le préréglage du profil sélectionné (DeFi, gaming, NFT, entreprise ou entièrement personnalisé), de sorte que les nouveaux rollups héritent de valeurs par défaut adaptées à leur cas d'usage.
* **Règlement optimistic** — Le chemin de règlement optimistic (soumission de lot et contestation) est opérationnel de bout en bout.

## v3.1.73 — Base de hachage post-quantique

**Axe de la version :** Achèvement de la base cryptographique post-quantique par défaut.

* **Hachage SHAKE-256 par défaut** — SHAKE-256 (famille SHA-3) est adopté comme hachage applicatif par défaut, complétant la base post-quantique par défaut composée des signatures **ML-DSA-87 (Dilithium-5)**, de l'encapsulation de clé **ML-KEM-1024** et du hachage **SHAKE-256**.

## v3.1.72 — Stabilité et maintenance

**Axe de la version :** Maintenance de routine de la stabilité et du pipeline de build.

* **Améliorations de la stabilité** — Maintenance interne de la stabilité, des dépendances et du pipeline de build, sans changement de comportement visible de l'extérieur.

## v3.1.71 — Signatures hybrides PQC appliquées par défaut

**Axe de la version :** Sécurité post-quantique activée par défaut sur le chemin de transaction Cosmos.

* **Signatures hybrides requises par défaut** — Les signatures hybrides post-quantiques sont désormais appliquées par défaut sur le chemin de transaction Cosmos : chaque transaction porte une signature post-quantique **ML-DSA-87 (Dilithium-5)** aux côtés de la signature classique **secp256k1**.
* **Application contrôlée par la gouvernance** — Le mode d'application reste contrôlé par la gouvernance, avec une valeur par défaut fixée à **requis**.

## v3.1.70 — Durcissement pour la production

**Axe de la version :** Durcissement pour la production et optimisation du consensus pour le mainnet en ligne.

* **Optimisation du consensus PRISM** — Améliorations continues de la couche d'optimisation par apprentissage par renforcement PRISM pour l'ajustement adaptatif des paramètres dans des conditions réseau réelles, avec des contrôles de sécurité de type disjoncteur.
* **Performance et stabilité** — Affinements du débit, de la latence et de l'utilisation des ressources sur les validateurs et les nœuds complets.
* **Outillage opérationnel** — Amélioration de la surveillance, des requêtes et de l'ergonomie d'exploitation des nœuds pour les opérateurs du mainnet.
* **Alignement tokenomics v2.1** — Mécanique de distribution des frais et d'émission alignée sur le modèle économique à offre fixe et émission finie.

## v3.0.0 — Genesis du mainnet

**Axe de la version :** Lancement du mainnet et événement de génération de jetons.

* **Genesis du mainnet** — Le mainnet de QoreChain (`qorechain-vladi`, EVM chain ID 9801) a été lancé le **7 juin 2026**, avec l'événement de génération de jetons (TGE) au genesis.
* **Répartition des frais en cinq parts** — Distribution des frais du protocole entre validateurs, burn, trésorerie, stakers et nœuds légers (**37 / 30 / 20 / 10 / 3**), ajoutant une part dédiée aux nœuds légers.
* **AMM on-chain** — Module natif de teneur de marché automatisé (`x/amm`) pour les pools de liquidité et les swaps on-chain.
* **Licence de chaîne** — Module de licence on-chain (`x/license`) pour enregistrer et gérer les droits du protocole.
* **Paradigmes de règlement durcis** — Modes de règlement du RDK finalisés en optimistic, zk, based et sovereign.

## v1.4.0 — Expansion pré-mainnet

**Axe de la version :** Couverture inter-chaînes et stabilisation de la version candidate avant le mainnet.

* **Couverture inter-chaînes élargie** — Connectivité IBC et bridge supplémentaire vers un ensemble plus large de réseaux externes.
* **Participation des nœuds légers** — Introduction des nœuds légers et des bases de leurs récompenses de part de frais.
* **Durcissement de la version candidate** — Tests, audits et stabilisation étendus sur tous les modules principaux en préparation du genesis du mainnet.

## v1.3.0 — Rollup Development Kit

**Axe de la version :** Infrastructure native de rollups pour les déploiements de rollups souverains et à sécurité partagée.

* **Module x/rdk** — Rollup Development Kit complet avec quatre paradigmes de règlement : optimistic, zk, based et sovereign
* **5 profils prédéfinis** — Modèles de rollup préconfigurés pour la DeFi, le gaming, les NFT, l'entreprise et les cas d'usage entièrement personnalisés
* **Disponibilité native des données** — Couche DA on-chain avec stockage de blobs, gestion de la rétention et cycle de vie d'élagage
* **Finalisation automatique par EndBlocker** — Finalisation automatique des lots à l'expiration de la fenêtre de contestation, sans intervention de l'opérateur
* **Sélection de profil assistée par l'IA** — Requête `suggest-profile` qui recommande une configuration de rollup optimale en fonction du cas d'usage visé
* **Intégration multicouche** — Les rollups s'enregistrent comme couches dans l'architecture multicouche, héritant des mécaniques de routage, d'ancrage et de contestation
* **Cycle de vie de l'escrow bancaire** — Le stake de l'opérateur est conservé en escrow pendant l'exploitation du rollup et libéré lors d'un arrêt propre ou confisqué en cas de slashing

## v1.2.0 — IBC et bridges

**Axe de la version :** Connectivité inter-chaînes et abstractions de compte avancées.

* **25 connexions inter-chaînes** — 8 canaux IBC et 17 connexions QoreChain Bridge (QCB) vers des réseaux externes
* **Module x/babylon** — Intégration du restaking BTC permettant aux détenteurs de Bitcoin de participer à la sécurité de staking de QoreChain
* **Module x/abstractaccount** — Framework de compte intelligent avec règles de dépense programmables, clés de session et logique d'authentification personnalisée
* **Module x/fairblock** — Threshold Identity-Based Encryption (tIBE) pour le chiffrement de transactions résistant au MEV
* **Module x/gasabstraction** — Paiement du gas multi-jetons prenant en charge le QOR natif, l'USDC ponté via IBC et l'ATOM ponté via IBC
* **Priorisation des TX sur 5 voies** — Voies de transaction ordonnées par priorité : système, gouvernance, staking, bridge et général
* **Configurations de relayer IBC** — Configurations de relayer préconfigurées pour tous les canaux IBC pris en charge
* **Intégration bridge-vers-burn** — Les frais de bridge sont acheminés via la distribution des frais du module burn

## v1.1.0 — Signatures hybrides PQC

**Axe de la version :** Sécurité cryptographique post-quantique et agilité algorithmique.

* **Double signature secp256k1 (ECDSA) + ML-DSA-87** — Chaque transaction porte à la fois une signature classique et une signature post-quantique, vérifiées dans la chaîne AnteHandler
* **3 modes d'application** — Application configurable des signatures hybrides : désactivé (mode 0), permissif (mode 1, PQC optionnel), obligatoire (mode 2, PQC requis)
* **Auto-enregistrement** — Les clés publiques PQC sont automatiquement enregistrées lors de la première transaction hybride, éliminant une étape d'enregistrement distincte
* **Base de hachage SHAKE-256** — Toutes les opérations de hachage liées à la PQC utilisent SHAKE-256 (famille SHA-3) pour une dérivation d'adresse résistante au quantique
* **Interfaces d'attestation TEE** — Prise en charge de l'attestation Trusted Execution Environment pour prouver l'intégrité de la génération de clés PQC
* **Framework d'agilité algorithmique** — Registre d'algorithmes enfichable permettant d'ajouter de futurs algorithmes PQC via la gouvernance sans mise à niveau de la chaîne

## v1.0.0 — Genesis (moteur de tokenomics)

**Axe de la version :** Lancement initial du protocole avec tokenomics complète, exécution multi-VM et opérations assistées par l'IA.

* **Module x/burn** — Mécanisme de burn des frais multicanal avec une distribution en quatre parts entre validateurs, burn, trésorerie et stakers
* **Module x/xqore** — Dérivé de staking de gouvernance avec pénalités de déverrouillage anticipé par paliers et redistribution par rebase PvP
* **Module x/inflation** — Émission par époque avec décroissance annuelle, régie par le modèle économique à émission finie
* **Couche de consensus PRISM** — Optimisation par apprentissage par renforcement (PPO) pour l'ajustement dynamique des paramètres de la chaîne avec des contrôles de sécurité de type disjoncteur
* **CPoS à triple pool** — Classified Proof-of-Stake avec les pools de validateurs Emerald, Sapphire et Ruby pondérés par les scores de réputation
* **Gouvernance QDRW** — Système de pondération dynamique des récompenses permettant des ajustements approuvés par la gouvernance de la distribution des récompenses entre les pools
* **Runtimes EVM + CosmWasm + SVM** — Trois environnements d'exécution concurrents : le moteur EVM QoreChain, les smart contracts CosmWasm et la Solana Virtual Machine
* **Bridge cross-VM** — Transmission de messages et transferts d'actifs entre les runtimes EVM, CosmWasm et SVM au sein d'un même bloc
* **Cryptographie post-quantique** — Signature résistante au quantique adossée à une bibliothèque PQC haute performance
* **QCAI** — Analyse heuristique on-chain avec un sidecar off-chain optionnel pour la détection de fraude, l'estimation des frais et l'optimisation du réseau
* **Déploiement conteneurisé** — Déploiement complet d'un testnet multi-validateurs avec service sidecar et indexeur de blocs
* **Indexeur de blocs** — Écouteur de blocs avec stockage persistant pour les requêtes historiques et l'analytique
