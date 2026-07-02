---
slug: /appendix/version-history
title: Historique des versions
sidebar_label: Historique des versions
sidebar_position: 3
---

# Historique des versions

Historique public des versions de QoreChain. La dernière version est **v3.1.82**, exécutée sur le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en service depuis le 7 juin 2026). Le testnet **`qorechain-diana`** (EVM chain ID **9800**) suit les builds de préversion.

:::note
Les entrées ci-dessous sont des résumés de capacités de haut niveau. Les entrées antérieures `v1.x` sont conservées comme trace historique de la lignée de versions testnet qui a précédé le mainnet.
:::

---

## v3.1.82 — QOR natif sur SVM en production + outillage intégrateurs (version mainnet actuelle)

**Objectif de la version :** L'unification du QOR natif sur la SVM en fonctionnement sur les deux réseaux, plus tout ce dont un exchange ou un intégrateur a besoin pour se connecter.

* **Solde de QOR natif unifié actif sur les trois interfaces** — L'unification SVM (v3.1.81) est confirmée en production sur le mainnet et le testnet : le même compte détient un seul solde, visible en `uqor` (6 décimales) sur Cosmos, en 18 décimales de type wei sur l'EVM, et en lamports (9 décimales ; 1 uqor = 1,000 lamports) sur l'interface compatible Solana.
* **Points de terminaison publics vérifiés** — Points de terminaison HTTPS publics pour le RPC de consensus, REST, le JSON-RPC EVM et le JSON-RPC SVM sur les deux réseaux, ainsi que l'[explorateur de blocs](https://explore.qore.network) public. Voir [Réseaux](/appendix/networks).
* **Téléchargements** — Les bundles versionnés de binaires de nœud, la genèse du mainnet et des snapshots récents des données de chaîne (avec sommes de contrôle SHA-256) sont publiés sur [download.qore.host](https://download.qore.host).
* **Signature post-quantique déterministe sur toute la pile cliente** — `@qorechain/pqc` 0.1.1 signe ML-DSA-87 de manière déterministe (FIPS-204 §3.4) dans les six bindings de langage, en conformité avec ce que la chaîne accepte ; `@qorechain/wallet-adapter` 0.1.2 s'appuie dessus pour la signature de transactions hybrides.
* **Guide intégrateurs** — Nouveau [Guide Exchange & Intégrateur](/developer-guide/exchange-integration) couvrant les dépôts, les retraits et l'exploitation des nœuds sur les trois interfaces.

## v3.1.81 — Unification du QOR natif sur la SVM

**Objectif de la version :** Le QOR natif comme actif de première classe sur l'interface compatible Solana.

* **QOR natif sur la SVM** — Le runtime SVM expose désormais directement le solde de QOR natif du compte (en lamports), au lieu de suivre un solde séparé propre à la SVM. `getBalance` et `getSignaturesForAddress` fonctionnent sur les fonds natifs, et les transferts du System Program déplacent du QOR natif.
* **Correspondance d'adresses SVM** — L'adresse SVM d'un compte est dérivée de ses 20 octets de compte (complétés à droite jusqu'à 32 octets, encodés en base58), de sorte que les adresses Cosmos, EVM et SVM d'une même clé désignent les mêmes fonds.

## v3.1.80 — Requêtes d'ancrage d'état multicouche

**Objectif de la version :** Ancrages de règlement lisibles et vérifiables hors ligne pour les rollups.

* **Requêtes de lecture d'ancrages** — Le service de requêtes `x/multilayer` expose désormais `Anchor` (le dernier ancrage d'état d'une couche) et `Anchors` (l'historique des ancrages d'une couche), afin que les clients puissent récupérer l'ancrage de règlement d'une couche et le vérifier de manière indépendante.
* **Passerelle REST pour multilayer** — Chaque requête multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) est désormais disponible via REST en plus de gRPC.
* **Reçus de règlement résistants au quantique débloqués** — Chaque ancrage porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, fournissant la base on-chain pour la vérification hors ligne des reçus de règlement du Rollup Development Kit.

## v3.1.79 — Auto-provisionnement des validateurs pour les réseaux de pont

**Objectif de la version :** Participation clé en main aux réseaux connectés pour les validateurs sous licence.

* **Framework de drivers réseau** — Un framework de drivers déclaratif permet à un validateur QoreChain détenant la licence `validator_<chain>` (ou `qcb_bridge`) correspondante de voir le client du réseau externe associé provisionné, configuré et exécuté sur le même nœud sous l'orchestration de QoreChain — uniquement une fois la licence activée.
* **Drivers pour les 37 réseaux de pont** — La couverture s'étend à chaque réseau connecté, classé par modèle de participation (validateur sans permission, plafonné/élu/sur admission, nœud complet L2 et rôles sans staking/liste de confiance). Les clés de mise en jeu et de signature du réseau externe restent fournies par l'opérateur pour chaque réseau ; QoreChain fournit le framework et la barrière de licence appliquée.

## v3.1.78 — Préparation pré-déploiement

**Objectif de la version :** Portefeuilles, ponts, IBC et licences fonctionnent tous au lancement — sans gouvernance post-déploiement.

* **Activation de pont post-déploiement sans confiance** — Une clé `bridge_admin` (ou un détenteur de licence `qcb_bridge`) peut activer le pont de n'importe quelle chaîne connectée avec une seule transaction signée (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — en définissant l'adresse du contrat, les confirmations, l'architecture, le statut, le vérificateur actif et la racine de confiance du vérificateur — sans proposition de gouvernance ni mise à niveau de la chaîne.
* **Barrière de licence réseau pour les validateurs** — L'orchestrateur applique désormais la licence `validator_<chain>` / `qcb_bridge` (fail-closed) avant de démarrer tout client de réseau externe.
* **Packages d'intégration de portefeuilles** — `@qorechain/wallet-adapter` et `@qorechain/connect` publiés sur npm (v0.1.0), ajoutant l'enregistrement du réseau dans MetaMask en un seul appel (EIP-3085, QOR natif à **18 décimales** sur le rail EVM) et la configuration du prix du gaz pour Keplr.
* **Relayeur IBC clé en main** — Configuration de relayeur prête à l'emploi et outillage d'amorçage des canaux pour les huit contreparties IBC, afin que les canaux soient opérationnels après le déploiement sans configuration sur mesure.

## v3.1.77 — Points de terminaison REST bridge et burn

**Objectif de la version :** Accès REST en lecture seule pour les modules cross-chain et d'offre monétaire.

* **Points de terminaison REST du bridge** — Points de terminaison de requête HTTP en lecture seule pour le module de pont, exposant l'état du pont via REST standard en plus de gRPC.
* **Points de terminaison REST du burn** — Points de terminaison de requête HTTP en lecture seule pour le module de burn, rendant les données de distribution des frais et d'offre monétaire interrogeables via REST standard.

## v3.1.76 — Modernisation de la chaîne d'outils SVM

**Objectif de la version :** Rafraîchissement de la compatibilité avec la Solana Virtual Machine.

* **Prise en charge des programmes de la chaîne d'outils actuelle** — L'exécution SVM a été modernisée afin que les programmes compilés avec la chaîne d'outils Solana actuelle s'exécutent sur le runtime SVM de QoreChain.

## v3.1.75 — JSON-RPC SVM par défaut

**Objectif de la version :** Un RPC compatible Solana prêt à l'emploi.

* **JSON-RPC compatible Solana** — Le serveur JSON-RPC SVM est désormais activé par défaut (port **8899**) et démarré automatiquement avec le nœud, offrant une interface RPC compatible Solana pour l'outillage SVM.

## v3.1.74 — Profils prédéfinis pour rollups

**Objectif de la version :** Ergonomie et règlement du Rollup Development Kit.

* **Application des profils prédéfinis** — La création de rollups applique désormais le preset du profil sélectionné (DeFi, gaming, NFT, entreprise ou entièrement personnalisé), de sorte que les nouveaux rollups héritent de valeurs par défaut adaptées à leur cas d'usage.
* **Règlement optimiste** — Le chemin de règlement optimiste (soumission de lots et contestation) est opérationnel de bout en bout.

## v3.1.73 — Base de hachage post-quantique

**Objectif de la version :** Achèvement de la base cryptographique post-quantique par défaut.

* **SHAKE-256 comme hachage par défaut** — SHAKE-256 (famille SHA-3) est adopté comme hachage applicatif par défaut, complétant la base post-quantique par défaut composée des signatures **ML-DSA-87 (Dilithium-5)**, de l'encapsulation de clés **ML-KEM-1024** et du hachage **SHAKE-256**.

## v3.1.72 — Stabilité et maintenance

**Objectif de la version :** Maintenance de routine de la stabilité et du pipeline de build.

* **Améliorations de stabilité** — Maintenance interne de la stabilité, des dépendances et du pipeline de build, sans changement de comportement visible de l'extérieur.

## v3.1.71 — Signatures hybrides PQC appliquées par défaut

**Objectif de la version :** Sécurité post-quantique activée par défaut sur le chemin de transaction Cosmos.

* **Signatures hybrides requises par défaut** — Les signatures hybrides post-quantiques sont désormais appliquées par défaut sur le chemin de transaction Cosmos : chaque transaction porte une signature post-quantique **ML-DSA-87 (Dilithium-5)** aux côtés de la signature classique **secp256k1**.
* **Application contrôlée par la gouvernance** — Le mode d'application reste contrôlé par la gouvernance, avec la valeur par défaut fixée à **required**.

## v3.1.70 — Durcissement pour la production

**Objectif de la version :** Durcissement pour la production et optimisation du consensus pour le mainnet en service.

* **Optimisation du consensus PRISM** — Améliorations continues de la couche d'optimisation par apprentissage par renforcement PRISM pour le réglage adaptatif des paramètres dans les conditions réelles du réseau, avec des contrôles de sécurité de type coupe-circuit.
* **Performance et stabilité** — Affinements du débit, de la latence et de l'utilisation des ressources sur les validateurs et les nœuds complets.
* **Outillage opérationnel** — Amélioration de la supervision, des requêtes et de l'ergonomie d'exploitation des nœuds pour les opérateurs du mainnet.
* **Alignement sur les tokenomics v2.1** — Distribution des frais et mécanismes d'émission alignés sur le modèle économique à offre fixe et émission finie.

## v3.0.0 — Genèse du mainnet

**Objectif de la version :** Lancement du mainnet et événement de génération du token.

* **Genèse du mainnet** — Le mainnet QoreChain (`qorechain-vladi`, EVM chain ID 9801) a été lancé le **7 juin 2026**, avec l'événement de génération du token (TGE) à la genèse.
* **Répartition des frais en cinq parts** — Distribution des frais du protocole entre validateurs, burn, trésorerie, stakers et nœuds légers (**37 / 30 / 20 / 10 / 3**), ajoutant une part dédiée aux nœuds légers.
* **AMM on-chain** — Module natif de teneur de marché automatisé (`x/amm`) pour les pools de liquidité et les swaps on-chain.
* **Licences de chaîne** — Module de licences on-chain (`x/license`) pour l'enregistrement et la gestion des droits d'utilisation du protocole.
* **Paradigmes de règlement consolidés** — Les modes de règlement du RDK sont finalisés : optimiste, zk, based et souverain.

## v1.4.0 — Expansion pré-mainnet

**Objectif de la version :** Couverture cross-chain et stabilisation de la release candidate avant le mainnet.

* **Couverture cross-chain étendue** — Connectivité IBC et de pont supplémentaire vers un ensemble plus large de réseaux externes.
* **Participation des nœuds légers** — Introduction des nœuds légers et des fondations de leurs récompenses de partage des frais.
* **Durcissement de la release candidate** — Tests approfondis, audits et stabilisation de tous les modules centraux en préparation de la genèse du mainnet.

## v1.3.0 — Rollup Development Kit

**Objectif de la version :** Infrastructure de rollups native pour les déploiements de rollups souverains et à sécurité partagée.

* **Module x/rdk** — Rollup Development Kit complet avec quatre paradigmes de règlement : optimiste, zk, based et souverain
* **5 profils prédéfinis** — Modèles de rollups préconfigurés pour les cas d'usage DeFi, gaming, NFT, entreprise et entièrement personnalisés
* **Disponibilité des données native** — Couche de DA on-chain avec stockage de blobs, gestion de la rétention et cycle de vie d'élagage
* **Auto-finalisation par EndBlocker** — Finalisation automatique des lots à l'expiration de la fenêtre de contestation, sans intervention de l'opérateur
* **Sélection de profil assistée par IA** — Requête `suggest-profile` qui recommande une configuration de rollup optimale en fonction du cas d'usage visé
* **Intégration multicouche** — Les rollups s'enregistrent comme couches dans l'architecture multicouche, héritant des mécanismes de routage, d'ancrage et de contestation
* **Cycle de vie d'escrow bancaire** — La mise de l'opérateur est conservée sous escrow pendant l'exploitation du rollup et libérée lors d'un arrêt propre, ou confisquée en cas de slashing

## v1.2.0 — IBC et ponts

**Objectif de la version :** Connectivité cross-chain et abstractions de compte avancées.

* **25 connexions cross-chain** — 8 canaux IBC et 17 connexions QoreChain Bridge (QCB) vers des réseaux externes
* **Module x/babylon** — Intégration du restaking BTC permettant aux détenteurs de Bitcoin de participer à la sécurité du staking de QoreChain
* **Module x/abstractaccount** — Framework de comptes intelligents avec règles de dépenses programmables, clés de session et logique d'authentification personnalisée
* **Module x/fairblock** — Chiffrement basé sur l'identité à seuil (tIBE) pour un chiffrement des transactions résistant au MEV
* **Module x/gasabstraction** — Paiement du gaz multi-tokens prenant en charge le QOR natif, l'USDC ponté via IBC et l'ATOM ponté via IBC
* **Priorisation des TX en 5 files** — Files de transactions ordonnées par priorité : système, gouvernance, staking, pont et général
* **Configurations de relayeurs IBC** — Configurations de relayeurs préétablies pour tous les canaux IBC pris en charge
* **Intégration bridge-vers-burn** — Les frais de pont sont acheminés via la distribution des frais du module de burn

## v1.1.0 — Signatures hybrides PQC

**Objectif de la version :** Sécurité cryptographique post-quantique et agilité algorithmique.

* **Signatures doubles secp256k1 (ECDSA) + ML-DSA-87** — Chaque transaction porte à la fois une signature classique et une signature post-quantique, vérifiées dans la chaîne AnteHandler
* **3 modes d'application** — Application configurable des signatures hybrides : off (mode 0), permissif (mode 1, PQC optionnel), obligatoire (mode 2, PQC requis)
* **Enregistrement automatique** — Les clés publiques PQC sont automatiquement enregistrées lors de la première transaction hybride, éliminant une étape d'enregistrement distincte
* **Fondation de hachage SHAKE-256** — Toutes les opérations de hachage liées à la PQC utilisent SHAKE-256 (famille SHA-3) pour une dérivation d'adresses résistante au quantique
* **Interfaces d'attestation TEE** — Prise en charge de l'attestation en environnement d'exécution de confiance (TEE) pour prouver l'intégrité de la génération des clés PQC
* **Framework d'agilité algorithmique** — Registre d'algorithmes enfichable permettant d'ajouter de futurs algorithmes PQC via la gouvernance, sans mise à niveau de la chaîne

## v1.0.0 — Genèse (moteur de tokenomics)

**Objectif de la version :** Lancement initial du protocole avec tokenomics complets, exécution multi-VM et opérations assistées par IA.

* **Module x/burn** — Mécanisme de burn des frais multicanal avec une distribution en quatre parts entre validateurs, burn, trésorerie et stakers
* **Module x/xqore** — Dérivé de staking de gouvernance avec pénalités de déblocage anticipé par paliers et redistribution par rebase PvP
* **Module x/inflation** — Émission par époques avec décroissance annuelle, régie par le modèle économique à émission finie
* **Couche de consensus PRISM** — Optimisation par apprentissage par renforcement (PPO) pour le réglage dynamique des paramètres de la chaîne, avec des contrôles de sécurité de type coupe-circuit
* **CPoS à triple pool** — Preuve d'enjeu classifiée (Classified Proof-of-Stake) avec les pools de validateurs Emerald, Sapphire et Ruby, pondérés par des scores de réputation
* **Gouvernance QDRW** — Système de pondération dynamique des récompenses (Dynamic Reward Weighting) permettant des ajustements approuvés par la gouvernance de la distribution des récompenses entre les pools
* **Runtimes EVM + CosmWasm + SVM** — Trois environnements d'exécution simultanés : le QoreChain EVM Engine, les smart contracts CosmWasm et la Solana Virtual Machine
* **Pont cross-VM** — Passage de messages et transferts d'actifs entre les runtimes EVM, CosmWasm et SVM au sein d'un même bloc
* **Cryptographie post-quantique** — Signature résistante au quantique adossée à une bibliothèque PQC haute performance
* **QCAI** — Analyse heuristique on-chain avec un sidecar off-chain optionnel pour la détection de fraude, l'estimation des frais et l'optimisation du réseau
* **Déploiement conteneurisé** — Déploiement complet d'un testnet multi-validateurs avec service sidecar et indexeur de blocs
* **Indexeur de blocs** — Écouteur de blocs avec stockage persistant pour les requêtes historiques et l'analytique
