---
slug: /appendix/version-history
title: Historique des versions
sidebar_label: Historique des versions
sidebar_position: 3
---

# Historique des versions

Historique public des versions de QoreChain. La dernière version est **v3.1.80**, exécutée sur le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en service depuis le 7 juin 2026). Le testnet **`qorechain-diana`** (EVM chain ID **9800**) suit les builds de préversion.

:::note
Les entrées ci-dessous sont des résumés de capacités de haut niveau. Les entrées antérieures `v1.x` sont conservées comme trace historique de la lignée de versions testnet qui a précédé le mainnet.
:::

---

## v3.1.80 — Requêtes d'ancrage d'état multicouche (version mainnet actuelle)

**Objectif de la version :** Ancrages de règlement lisibles et vérifiables hors ligne pour les rollups.

* **Requêtes de lecture d'ancrage** — Le service de requête `x/multilayer` expose désormais `Anchor` (le dernier ancrage d'état d'une couche) et `Anchors` (l'historique des ancrages d'une couche), afin que les clients puissent récupérer l'ancrage de règlement d'une couche et le vérifier de manière indépendante.
* **Passerelle REST pour multilayer** — Chaque requête multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) est désormais disponible en REST en plus de gRPC.
* **Reçus de règlement quantum-safe débloqués** — Chaque ancrage porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, fournissant la base on-chain pour la vérification hors ligne des reçus de règlement du Rollup Development Kit.

## v3.1.79 — Auto-provisionnement des validateurs pour les réseaux de pont

**Objectif de la version :** Participation clé en main aux réseaux connectés pour les validateurs sous licence.

* **Framework de drivers réseau** — Un framework de drivers déclaratif permet à un validateur QoreChain détenant la licence `validator_<chain>` (ou `qcb_bridge`) pertinente de voir le client de réseau externe correspondant provisionné, configuré et exécuté sur le même nœud sous l'orchestration QoreChain — uniquement une fois la licence activée.
* **Drivers pour les 37 réseaux de pont** — La couverture s'étend à chaque réseau connecté, classée par modèle de participation (validateur sans permission, plafonné/élu/admission, nœud complet L2 et rôles sans staking/liste de confiance). Le stake et les clés de signature des réseaux externes restent fournis par l'opérateur pour chaque réseau ; QoreChain livre le framework et le contrôle de licence imposé.

## v3.1.78 — Préparation au pré-déploiement

**Objectif de la version :** Les portefeuilles, les ponts, IBC et la gestion des licences fonctionnent tous dès le lancement — sans gouvernance post-déploiement.

* **Activation de pont post-déploiement sans confiance** — Une clé `bridge_admin` (ou un titulaire de licence `qcb_bridge`) peut activer le pont de n'importe quelle chaîne connectée avec une seule transaction signée (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — en définissant l'adresse du contrat, les confirmations, l'architecture, le statut, le vérificateur actif et la racine de confiance du vérificateur — sans proposition de gouvernance ni mise à niveau de la chaîne.
* **Contrôle de licence validateur-réseau** — L'orchestrateur impose désormais la licence `validator_<chain>` / `qcb_bridge` (fail-closed) avant de démarrer tout client de réseau externe.
* **Packages d'intégration de portefeuille** — `@qorechain/wallet-adapter` et `@qorechain/connect` publiés sur npm (v0.1.0), ajoutant l'enregistrement de réseau MetaMask en un appel (EIP-3085, QOR natif à **18 décimales** sur le rail EVM) et la configuration du prix du gas Keplr.
* **Relayeur IBC clé en main** — Configuration de relayeur prête à l'emploi et outillage de bootstrap de canal pour les huit contreparties IBC, afin que les canaux s'établissent post-déploiement sans configuration sur mesure.

## v3.1.77 — Endpoints REST Bridge & Burn

**Objectif de la version :** Accès REST en lecture seule pour les modules cross-chain et de supply.

* **Endpoints REST du pont** — Endpoints de requête HTTP en lecture seule pour le module bridge, exposant l'état du pont en REST standard en plus de gRPC.
* **Endpoints REST de burn** — Endpoints de requête HTTP en lecture seule pour le module burn, rendant les données de distribution de frais et de supply interrogeables en REST standard.

## v3.1.76 — Modernisation de la chaîne d'outils SVM

**Objectif de la version :** Rafraîchissement de la compatibilité Solana Virtual Machine.

* **Prise en charge des programmes de la chaîne d'outils actuelle** — Exécution SVM modernisée afin que les programmes compilés avec la chaîne d'outils Solana actuelle s'exécutent sur le runtime SVM de QoreChain.

## v3.1.75 — SVM JSON-RPC par défaut

**Objectif de la version :** RPC compatible Solana prêt à l'emploi.

* **JSON-RPC compatible Solana** — Le serveur SVM JSON-RPC est désormais activé par défaut (port **8899**) et démarré automatiquement avec le nœud, fournissant une interface RPC compatible Solana pour l'outillage SVM.

## v3.1.74 — Préréglages de profil de rollup

**Objectif de la version :** Utilisabilité et règlement du Rollup Development Kit.

* **Application de préréglage de profil** — La création de rollup applique désormais le préréglage du profil sélectionné (DeFi, gaming, NFT, entreprise ou entièrement personnalisé), afin que les nouveaux rollups héritent de valeurs par défaut sensées pour leur cas d'usage.
* **Règlement optimiste** — Le chemin de règlement optimiste (soumission par lot et contestation) est opérationnel de bout en bout.

## v3.1.73 — Référence de hachage post-quantique

**Objectif de la version :** Finalisation de la référence cryptographique post-quantique par défaut.

* **Hachage SHAKE-256 par défaut** — SHAKE-256 (famille SHA-3) est adopté comme hachage d'application par défaut, complétant la référence post-quantique par défaut composée des signatures **ML-DSA-87 (Dilithium-5)**, de l'encapsulation de clé **ML-KEM-1024** et du hachage **SHAKE-256**.

## v3.1.72 — Stabilité et maintenance

**Objectif de la version :** Stabilité de routine et maintenance du pipeline de build.

* **Améliorations de stabilité** — Maintenance interne de stabilité, des dépendances et du pipeline de build sans aucun changement de comportement visible de l'extérieur.

## v3.1.71 — Signatures hybrides PQC imposées par défaut

**Objectif de la version :** Sécurité post-quantique activée par défaut sur le chemin de transaction Cosmos.

* **Signatures hybrides requises par défaut** — Les signatures hybrides post-quantiques sont désormais imposées par défaut sur le chemin de transaction Cosmos : chaque transaction porte une signature post-quantique **ML-DSA-87 (Dilithium-5)** aux côtés de la signature classique **secp256k1**.
* **Application contrôlée par la gouvernance** — Le mode d'application reste contrôlé par la gouvernance, avec une valeur par défaut définie sur **required**.

## v3.1.70 — Durcissement pour la production

**Objectif de la version :** Durcissement pour la production et optimisation du consensus pour le mainnet en service.

* **Optimisation du consensus PRISM** — Améliorations continues de la couche d'optimisation par apprentissage par renforcement PRISM pour l'ajustement adaptatif des paramètres dans les conditions du réseau en service, avec des contrôles de sécurité de type coupe-circuit.
* **Performance et stabilité** — Affinements du débit, de la latence et de l'utilisation des ressources sur les validateurs et les nœuds complets.
* **Outillage opérationnel** — Amélioration de l'ergonomie de surveillance, de requête et d'exploitation des nœuds pour les opérateurs de mainnet.
* **Alignement Tokenomics v2.1** — Distribution des frais et mécanique d'émission alignées sur le modèle économique à supply fixe et émission finie.

## v3.0.0 — Genèse du mainnet

**Objectif de la version :** Lancement du mainnet et événement de génération de tokens.

* **Genèse du mainnet** — Le mainnet QoreChain (`qorechain-vladi`, EVM chain ID 9801) a été lancé le **7 juin 2026**, avec l'événement de génération de tokens (TGE) à la genèse.
* **Répartition des frais en cinq parts** — Distribution des frais de protocole entre les validateurs, le burn, la trésorerie, les stakers et les nœuds légers (**37 / 30 / 20 / 10 / 3**), ajoutant une part dédiée aux nœuds légers.
* **AMM on-chain** — Module natif de teneur de marché automatisé (`x/amm`) pour les pools de liquidité et les swaps on-chain.
* **Licences de chaîne** — Module de licence on-chain (`x/license`) pour l'enregistrement et la gestion des droits de protocole.
* **Paradigmes de règlement durcis** — Modes de règlement RDK finalisés en optimistic, zk, based et sovereign.

## v1.4.0 — Expansion pré-mainnet

**Objectif de la version :** Couverture cross-chain et stabilisation de la release candidate avant le mainnet.

* **Couverture cross-chain élargie** — Connectivité IBC et de pont supplémentaire vers un ensemble plus large de réseaux externes.
* **Participation des nœuds légers** — Introduction des nœuds légers et des fondations de leurs récompenses de part de frais.
* **Durcissement de la release candidate** — Tests, audits et stabilisation approfondis sur tous les modules de base en préparation de la genèse du mainnet.

## v1.3.0 — Rollup Development Kit

**Objectif de la version :** Infrastructure de rollup native pour les déploiements de rollups souverains et à sécurité partagée.

* **Module x/rdk** — Rollup Development Kit complet avec quatre paradigmes de règlement : optimistic, zk, based et sovereign
* **5 profils prédéfinis** — Modèles de rollup préconfigurés pour les cas d'usage DeFi, gaming, NFT, entreprise et entièrement personnalisé
* **Disponibilité des données native** — Couche DA on-chain avec stockage de blobs, gestion de rétention et cycle de vie d'élagage
* **Auto-finalisation EndBlocker** — Finalisation automatique des lots à l'expiration de la fenêtre de contestation, sans intervention d'opérateur requise
* **Sélection de profil assistée par IA** — Requête `suggest-profile` qui recommande une configuration de rollup optimale en fonction du cas d'usage prévu
* **Intégration multicouche** — Les rollups s'enregistrent comme couches dans l'architecture multicouche, héritant des mécanismes de routage, d'ancrage et de contestation
* **Cycle de vie d'escrow bancaire** — Le stake de l'opérateur est conservé en escrow pendant l'exploitation du rollup et libéré lors d'un arrêt propre ou confisqué en cas de slashing

## v1.2.0 — IBC & Ponts

**Objectif de la version :** Connectivité cross-chain et abstractions de compte avancées.

* **25 connexions cross-chain** — 8 canaux IBC et 17 connexions QoreChain Bridge (QCB) vers des réseaux externes
* **Module x/babylon** — Intégration du restaking BTC permettant aux détenteurs de Bitcoin de participer à la sécurité du staking de QoreChain
* **Module x/abstractaccount** — Framework de smart account avec règles de dépenses programmables, clés de session et logique d'authentification personnalisée
* **Module x/fairblock** — Chiffrement à seuil basé sur l'identité (tIBE) pour un chiffrement des transactions résistant au MEV
* **Module x/gasabstraction** — Paiement du gas multi-token prenant en charge le QOR natif, l'USDC ponté via IBC et l'ATOM ponté via IBC
* **Priorisation des TX sur 5 voies** — Voies de transaction ordonnées par priorité : système, gouvernance, staking, pont et général
* **Configurations de relayeur IBC** — Configurations de relayeur préconfigurées pour tous les canaux IBC pris en charge
* **Intégration bridge-to-burn** — Les frais de pont sont acheminés via la distribution de frais du module burn

## v1.1.0 — Signatures hybrides PQC

**Objectif de la version :** Sécurité cryptographique post-quantique et agilité algorithmique.

* **Signatures doubles secp256k1 (ECDSA) + ML-DSA-87** — Chaque transaction porte à la fois une signature classique et une signature post-quantique, vérifiées dans la chaîne AnteHandler
* **3 modes d'application** — Application configurable des signatures hybrides : off (mode 0), permissive (mode 1, PQC optionnel), mandatory (mode 2, PQC requis)
* **Auto-enregistrement** — Les clés publiques PQC sont automatiquement enregistrées lors de la première transaction hybride, éliminant une étape d'enregistrement séparée
* **Fondation de hachage SHAKE-256** — Toutes les opérations de hachage liées à la PQC utilisent SHAKE-256 (famille SHA-3) pour une dérivation d'adresse résistante au quantique
* **Interfaces d'attestation TEE** — Prise en charge de l'attestation Trusted Execution Environment pour prouver l'intégrité de la génération de clés PQC
* **Framework d'agilité algorithmique** — Registre d'algorithmes enfichable permettant d'ajouter de futurs algorithmes PQC via la gouvernance sans mise à niveau de la chaîne

## v1.0.0 — Genèse (moteur de tokenomics)

**Objectif de la version :** Lancement initial du protocole avec tokenomics complète, exécution multi-VM et opérations assistées par IA.

* **Module x/burn** — Mécanisme de burn de frais multicanal avec une distribution en quatre parts entre les validateurs, le burn, la trésorerie et les stakers
* **Module x/xqore** — Dérivé de staking de gouvernance avec pénalités de déblocage anticipé par paliers et redistribution par rebase PvP
* **Module x/inflation** — Émission par époques avec décroissance annuelle, régie par le modèle économique à émission finie
* **Couche de consensus PRISM** — Optimisation par apprentissage par renforcement (PPO) pour l'ajustement dynamique des paramètres de la chaîne avec des contrôles de sécurité de type coupe-circuit
* **CPoS à triple pool** — Classified Proof-of-Stake avec les pools de validateurs Emerald, Sapphire et Ruby pondérés par les scores de réputation
* **Gouvernance QDRW** — Système de Dynamic Reward Weighting permettant des ajustements approuvés par la gouvernance de la distribution des récompenses entre les pools
* **Runtimes EVM + CosmWasm + SVM** — Trois environnements d'exécution concurrents : le QoreChain EVM Engine, les smart contracts CosmWasm et la Solana Virtual Machine
* **Pont cross-VM** — Passage de messages et transferts d'actifs entre les runtimes EVM, CosmWasm et SVM au sein d'un même bloc
* **Cryptographie post-quantique** — Signature résistante au quantique soutenue par une bibliothèque PQC haute performance
* **QCAI** — Analyse heuristique on-chain avec un sidecar off-chain optionnel pour la détection de fraude, l'estimation des frais et l'optimisation du réseau
* **Déploiement conteneurisé** — Déploiement complet de testnet multi-validateurs avec service sidecar et indexeur de blocs
* **Indexeur de blocs** — Écouteur de blocs avec stockage persistant pour les requêtes historiques et l'analytique
