---
slug: /appendix/version-history
title: Historique des versions
sidebar_label: Historique des versions
sidebar_position: 3
---

# Historique des versions

Historique public des versions de QoreChain. La dernière version est **v3.1.85**, en production sur le mainnet **`qorechain-vladi`** (chain ID EVM **9801**, en service depuis le 7 juin 2026). Le testnet **`qorechain-diana`** (chain ID EVM **9800**) suit les builds de pré-version.

:::note
Les entrées ci-dessous sont des résumés de haut niveau des capacités. Les entrées `v1.x` plus anciennes sont conservées comme trace historique de la lignée de versions testnet qui a précédé le mainnet.
:::

---

## v3.1.85 — Dépenses déléguées via les portefeuilles liés (version actuelle)

**Axe de la version :** une clé de portefeuille externe liée (Phantom, MetaMask) peut désormais **dépenser** depuis l'unique compte canonique post-quantique — sous permissions à moindre privilège, limites de dépenses et révocation instantanée.

* **Voies d'exécution des authenticators** — Deux nouveaux messages permettent à un authenticator enregistré d'autoriser des transferts depuis le compte canonique sans que le propriétaire du compte soit présent : **`MsgExecuteEVM`** (un appel/transfert EVM depuis l'adresse `0x…` du compte) et **`MsgExecuteCosmos`** (un envoi bancaire sur la voie Native). Un **relayer** soumet et paie l'enveloppe — sa propre signature PQC hybride satisfait les exigences de la transaction — tandis que la signature de l'authenticator sur des sign bytes à séparation de domaine et liés anti-rejeu constitue l'autorisation. La clé externe n'a jamais besoin d'une co-signature ML-DSA.
* **MetaMask comme authenticator** — Les authenticators secp256k1 peuvent désormais être enregistrés par leur **adresse Ethereum de 20 octets** et vérifiés via **EIP-191 `personal_sign`** (en plus de la forme à clé compressée de 33 octets), de sorte qu'un compte MetaMask standard peut être lié et dépenser sous limites.
* **Application sur les trois voies** — Les périmètres de permissions et les limites de valeur **SpendingRule** (plafonds par transaction + quotidiens) sont appliqués sur les voies Native, EVM et SVM ; les messages de gestion de clés ne sont jamais délégables. Des codes d'erreur distincts permettent aux portefeuilles d'afficher le bon message : `5` limite de dépenses dépassée, `6` authenticator expiré, `10` permission refusée, `11` rejeu rejeté.
* **Requête du schéma de permissions** — `GET /qorechain/abstractaccount/v1/permission_schema` (également gRPC/CLI) renvoie la taxonomie canonique des permissions (11 permissions), la table message→permission et la liste des messages non délégables, afin que les portefeuilles valident les périmètres sans les coder en dur.
* **Rotation de clé PQC à algorithme identique** — Le nouveau message **`MsgRotatePQCKey`** effectue la rotation de la clé ML-DSA-87 d'un compte au sein du même algorithme (double signature par l'ancienne et la nouvelle clé), permettant la migration des clés dérivées en mode legacy vers la dérivation canonique liée à l'adresse et le retrait d'une clé compromise. Nouvelles commandes CLI : `tx pqc rotate-key` et `tx pqc recover-key` (récupération déterministe de clé à partir d'un mnémonique).
* **Transactions par clé racine inchangées** — Les changements sont additifs ; les flux habituels des portefeuilles, des plateformes d'échange et de Keplr sont inchangés. Les opérateurs de nœuds doivent être en **v3.1.85** avant la hauteur de mise à niveau du réseau.

## v3.1.84 — Permissions des authenticators et limites de dépenses

**Axe de la version :** le modèle de permissions derrière les dépenses déléguées.

* **Taxonomie canonique des permissions** — Onze permissions (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) avec une table message→permission « fail-closed » : un type de message non mappé est refusé, et les messages de gestion de clés ne peuvent jamais être délégués.
* **Application des SpendingRule** — Les plafonds de dépenses par transaction et par jour (UTC), avec listes de dénominations autorisées, sont appliqués et enregistrés par paire (compte, authenticator).
* **Autorisation sur la voie SVM** — Les actions autorisées par une clé de schéma étranger (par ex. Phantom ed25519) sur la voie SVM passent par la même porte d'autorisation centrale.

## v3.1.83 — Signature de compte unifié sur les trois interfaces

**Axe de la version :** une clé, un compte — une identité unifiée unique qui peut désormais **signer**, et pas seulement détenir un solde, sur les interfaces Cosmos, EVM et SVM.

* **Une clé signe sur chaque voie** — Un compte créé eth-native (adresse = keccak de sa clé publique secp256k1) signe désormais les transactions de la voie Cosmos avec le schéma `eth_secp256k1` en plus des transactions EVM. Ses formes `qor1…` (Cosmos), `0x…` (EVM) et Solana-VM (base58) constituent une seule identité de 20 octets qui à la fois **détient un solde unique** et **dépense sur les trois voies** — y compris les transactions Cosmos hybrides post-quantiques (ML-DSA-87).
* **Signature post-quantique inchangée** — Le compte unifié enregistre toujours sa clé ML-DSA-87 et porte la signature hybride FIPS-204 exigée par la chaîne ; la partie classique est `eth_secp256k1` (keccak) au lieu du schéma coinType-118. Les comptes coinType-118 existants ne sont pas affectés.
* **Mise à niveau progressive neutre pour le consensus** — Livrée sous forme de mise à niveau binaire progressive sur les deux réseaux, avec **aucune re-genesis et aucun arrêt de chaîne**. Les soldes des comptes, l'historique et la genesis sont inchangés.
* **Outillage client** — `@qorechain/wallet-adapter` 0.1.5 ajoute la signature Cosmos eth-native (`signClassicalEth` / `signHybridEth`), la génération unifiée des 3 adresses et `walletFromSeed` (dériver le compte canonique à partir de n'importe quelle graine de 32 octets — par ex. une signature Phantom) ; `@qorechain/chain-bridge` gagne un chemin de signature `eth_secp256k1`.

:::caution Opérateurs de nœuds — mise à niveau requise
Les nœuds complets doivent exécuter **v3.1.83+**. Un nœud antérieur à 3.1.83 ne peut pas décoder une transaction eth-native (`eth_secp256k1`) et cessera de se synchroniser dès qu'une telle transaction apparaîtra dans un bloc. Téléchargez le bundle actuel sur [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR natif sur SVM en production + outillage pour intégrateurs

**Axe de la version :** l'unification du QOR natif sur SVM en fonctionnement sur les deux réseaux, plus tout ce dont une plateforme d'échange ou un intégrateur a besoin pour se connecter.

* **Solde de QOR natif unifié en production sur les trois interfaces** — L'unification SVM (v3.1.81) est confirmée en production sur le mainnet et le testnet : le même compte détient un solde unique visible en `uqor` (6 décimales) sur Cosmos, en 18 décimales de style wei sur l'EVM, et en lamports (9 décimales ; 1 uqor = 1 000 lamports) sur l'interface compatible Solana.
* **Points de terminaison publics vérifiés** — Points de terminaison HTTPS publics pour le RPC de consensus, le REST, le JSON-RPC EVM et le JSON-RPC SVM sur les deux réseaux, ainsi que l'[explorateur de blocs](https://explore.qore.network) public. Voir [Réseaux](/appendix/networks).
* **Téléchargements** — Bundles de binaires de nœud versionnés, genesis du mainnet et instantanés récents des données de chaîne (avec sommes de contrôle SHA-256) publiés sur [download.qore.host](https://download.qore.host).
* **Signature post-quantique déterministe dans toute la pile cliente** — `@qorechain/pqc` 0.1.1 signe en ML-DSA-87 de manière déterministe (FIPS-204 §3.4) dans les six bindings de langages, en conformité avec ce que la chaîne accepte ; `@qorechain/wallet-adapter` 0.1.2 s'appuie dessus pour la signature de transactions hybrides.
* **Guide pour intégrateurs** — Nouveau [guide Exchange & Intégrateurs](/developer-guide/exchange-integration) couvrant les dépôts, les retraits et l'exploitation des nœuds sur les trois interfaces.

## v3.1.81 — Unification du QOR natif sur SVM

**Axe de la version :** le QOR natif comme actif de premier rang sur l'interface compatible Solana.

* **QOR natif sur SVM** — Le runtime SVM expose désormais directement le solde de QOR natif du compte (en lamports), au lieu de suivre un solde distinct propre au SVM. `getBalance` et `getSignaturesForAddress` fonctionnent sur les fonds natifs, et les transferts du System Program déplacent du QOR natif.
* **Correspondance des adresses SVM** — L'adresse SVM d'un compte est dérivée de ses 20 octets de compte (complétés à droite jusqu'à 32 octets, encodés en base58), de sorte que les adresses Cosmos, EVM et SVM d'une même clé désignent les mêmes fonds.

## v3.1.80 — Requêtes d'ancres d'état multilayer

**Axe de la version :** des ancres de règlement lisibles et vérifiables hors ligne pour les rollups.

* **Requêtes de lecture d'ancres** — Le service de requêtes `x/multilayer` expose désormais `Anchor` (la dernière ancre d'état d'une couche) et `Anchors` (l'historique des ancres d'une couche), afin que les clients puissent récupérer l'ancre de règlement d'une couche et la vérifier de manière indépendante.
* **Passerelle REST pour multilayer** — Chaque requête multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) est désormais disponible en REST en plus du gRPC.
* **Reçus de règlement à sûreté quantique débloqués** — Chaque ancre porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, fournissant la base on-chain de la vérification hors ligne des reçus de règlement du Rollup Development Kit.

## v3.1.79 — Auto-provisionnement des validateurs pour les réseaux du pont

**Axe de la version :** participation clé en main sur les réseaux connectés pour les validateurs licenciés.

* **Cadre de pilotes réseau** — Un cadre de pilotes déclaratif permet à un validateur QoreChain détenant la licence `validator_<chain>` (ou `qcb_bridge`) pertinente de faire provisionner, configurer et exécuter le client du réseau externe correspondant sur le même nœud, sous orchestration QoreChain — uniquement une fois la licence activée.
* **Pilotes pour les 37 réseaux du pont** — La couverture s'étend à chaque réseau connecté, classé par modèle de participation (validateur sans permission, plafonné/élu/sur admission, full node L2, et rôles sans staking/trust-list). Le stake et les clés de signature du réseau externe restent fournis par l'opérateur pour chaque réseau ; QoreChain fournit le cadre et la porte de licence appliquée.

## v3.1.78 — Préparation au pré-déploiement

**Axe de la version :** portefeuilles, ponts, IBC et licences fonctionnent tous au lancement — sans gouvernance post-déploiement.

* **Activation de pont post-déploiement sans confiance** — Une clé `bridge_admin` (ou un détenteur de licence `qcb_bridge`) peut activer le pont de n'importe quelle chaîne connectée avec une seule transaction signée (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — en définissant l'adresse du contrat, les confirmations, l'architecture, le statut, le vérificateur actif et la racine de confiance du vérificateur — sans proposition de gouvernance ni mise à niveau de chaîne.
* **Porte de licence des réseaux de validateurs** — L'orchestrateur applique désormais la licence `validator_<chain>` / `qcb_bridge` (en mode fail-closed) avant de démarrer tout client de réseau externe.
* **Paquets d'intégration de portefeuilles** — `@qorechain/wallet-adapter` et `@qorechain/connect` publiés sur npm (v0.1.0), ajoutant l'enregistrement du réseau MetaMask en un appel (EIP-3085, QOR natif à **18 décimales** sur le rail EVM) et la configuration du prix du gaz pour Keplr.
* **Relayer IBC clé en main** — Configuration de relayer prête à l'emploi et outillage d'amorçage des canaux pour les huit contreparties IBC, afin que les canaux s'établissent après le déploiement sans configuration sur mesure.

## v3.1.77 — Points de terminaison REST pour le pont et le burn

**Axe de la version :** accès REST en lecture seule pour les modules cross-chain et d'offre monétaire.

* **Points de terminaison REST du pont** — Points de terminaison de requête HTTP en lecture seule pour le module de pont, exposant l'état du pont en REST standard en plus du gRPC.
* **Points de terminaison REST du burn** — Points de terminaison de requête HTTP en lecture seule pour le module de burn, rendant les données de distribution des frais et d'offre interrogeables en REST standard.

## v3.1.76 — Modernisation de la chaîne d'outils SVM

**Axe de la version :** rafraîchissement de la compatibilité avec la Solana Virtual Machine.

* **Prise en charge des programmes de la chaîne d'outils actuelle** — Exécution SVM modernisée afin que les programmes compilés avec la chaîne d'outils Solana actuelle s'exécutent sur le runtime SVM de QoreChain.

## v3.1.75 — JSON-RPC SVM par défaut

**Axe de la version :** RPC compatible Solana prêt à l'emploi.

* **JSON-RPC compatible Solana** — Le serveur JSON-RPC SVM est désormais activé par défaut (port **8899**) et démarré automatiquement avec le nœud, fournissant une interface RPC compatible Solana pour l'outillage SVM.

## v3.1.74 — Profils prédéfinis pour les rollups

**Axe de la version :** ergonomie et règlement du Rollup Development Kit.

* **Application des préréglages de profil** — La création d'un rollup applique désormais le préréglage du profil sélectionné (DeFi, gaming, NFT, entreprise ou entièrement personnalisé), de sorte que les nouveaux rollups héritent de valeurs par défaut raisonnables pour leur cas d'usage.
* **Règlement optimiste** — Le chemin de règlement optimiste (soumission de lots et contestation) est opérationnel de bout en bout.

## v3.1.73 — Référence de hachage post-quantique

**Axe de la version :** achèvement du socle cryptographique post-quantique par défaut.

* **SHAKE-256 comme hachage par défaut** — SHAKE-256 (famille SHA-3) est adopté comme hachage applicatif par défaut, complétant le socle post-quantique par défaut composé des signatures **ML-DSA-87 (Dilithium-5)**, de l'encapsulation de clés **ML-KEM-1024** et du hachage **SHAKE-256**.

## v3.1.72 — Stabilité et maintenance

**Axe de la version :** maintenance de routine de la stabilité et de la chaîne de build.

* **Améliorations de stabilité** — Maintenance interne de la stabilité, des dépendances et de la chaîne de build, sans changement de comportement visible de l'extérieur.

## v3.1.71 — Signatures hybrides PQC appliquées par défaut

**Axe de la version :** la sécurité post-quantique activée par défaut sur le chemin de transaction Cosmos.

* **Signatures hybrides exigées par défaut** — Les signatures hybrides post-quantiques sont désormais appliquées par défaut sur le chemin de transaction Cosmos : chaque transaction porte une signature post-quantique **ML-DSA-87 (Dilithium-5)** aux côtés de la signature classique **secp256k1**.
* **Application contrôlée par la gouvernance** — Le mode d'application reste contrôlé par la gouvernance, avec la valeur par défaut réglée sur **required**.

## v3.1.70 — Durcissement pour la production

**Axe de la version :** durcissement pour la production et optimisation du consensus pour le mainnet en service.

* **Optimisation du consensus PRISM** — Améliorations continues de la couche d'optimisation par apprentissage par renforcement PRISM pour l'ajustement adaptatif des paramètres dans les conditions du réseau en production, avec des contrôles de sécurité de type disjoncteur.
* **Performance et stabilité** — Affinements du débit, de la latence et de l'utilisation des ressources sur les validateurs et les nœuds complets.
* **Outillage opérationnel** — Amélioration de l'ergonomie de supervision, de requête et d'exploitation des nœuds pour les opérateurs du mainnet.
* **Alignement Tokenomics v2.1** — Distribution des frais et mécanique d'émission alignées sur le modèle économique à offre fixe et émission finie.

## v3.0.0 — Genesis du mainnet

**Axe de la version :** lancement du mainnet et événement de génération du jeton.

* **Genesis du mainnet** — Le mainnet QoreChain (`qorechain-vladi`, chain ID EVM 9801) a été lancé le **7 juin 2026**, avec l'événement de génération du jeton (TGE) à la genesis.
* **Répartition des frais en cinq parts** — Distribution des frais du protocole entre validateurs, burn, trésorerie, stakers et nœuds légers (**37 / 30 / 20 / 10 / 3**), ajoutant une part dédiée aux nœuds légers.
* **AMM on-chain** — Module natif de teneur de marché automatisé (`x/amm`) pour les pools de liquidité et les swaps on-chain.
* **Licences de chaîne** — Module de licences on-chain (`x/license`) pour l'enregistrement et la gestion des droits du protocole.
* **Paradigmes de règlement durcis** — Modes de règlement du RDK finalisés : optimiste, zk, based et souverain.

## v1.4.0 — Expansion pré-mainnet

**Axe de la version :** couverture cross-chain et stabilisation en release candidate avant le mainnet.

* **Couverture cross-chain étendue** — Connectivité IBC et de pont supplémentaire vers un ensemble plus large de réseaux externes.
* **Participation des nœuds légers** — Introduction des nœuds légers et des fondations de leurs récompenses de partage des frais.
* **Durcissement en release candidate** — Tests approfondis, audits et stabilisation de tous les modules cœur en préparation de la genesis du mainnet.

## v1.3.0 — Rollup Development Kit

**Axe de la version :** infrastructure de rollups native pour les déploiements de rollups souverains et à sécurité partagée.

* **Module x/rdk** — Rollup Development Kit complet avec quatre paradigmes de règlement : optimiste, zk, based et souverain
* **5 profils prédéfinis** — Modèles de rollups pré-configurés pour les cas d'usage DeFi, gaming, NFT, entreprise et entièrement personnalisé
* **Disponibilité des données native** — Couche DA on-chain avec stockage de blobs, gestion de la rétention et cycle de vie d'élagage
* **Auto-finalisation par EndBlocker** — Finalisation automatique des lots à l'expiration de la fenêtre de contestation, sans intervention de l'opérateur
* **Sélection de profil assistée par IA** — Requête `suggest-profile` qui recommande une configuration de rollup optimale selon le cas d'usage visé
* **Intégration multilayer** — Les rollups s'enregistrent comme couches dans l'architecture multilayer, héritant du routage, de l'ancrage et des mécaniques de contestation
* **Cycle de vie d'entiercement bancaire** — Le stake de l'opérateur est détenu en entiercement pendant l'exploitation du rollup et libéré lors d'un arrêt propre, ou confisqué en cas de slashing

## v1.2.0 — IBC et ponts

**Axe de la version :** connectivité cross-chain et abstractions de comptes avancées.

* **25 connexions cross-chain** — 8 canaux IBC et 17 connexions QoreChain Bridge (QCB) vers des réseaux externes
* **Module x/babylon** — Intégration du restaking BTC permettant aux détenteurs de Bitcoin de participer à la sécurité du staking QoreChain
* **Module x/abstractaccount** — Cadre de comptes intelligents avec règles de dépenses programmables, clés de session et logique d'authentification personnalisée
* **Module x/fairblock** — Chiffrement à base d'identité à seuil (tIBE) pour un chiffrement des transactions résistant au MEV
* **Module x/gasabstraction** — Paiement du gaz multi-jetons prenant en charge le QOR natif, l'USDC ponté via IBC et l'ATOM ponté via IBC
* **Priorisation des TX en 5 voies** — Voies de transactions ordonnées par priorité : système, gouvernance, staking, pont et générale
* **Configurations de relayers IBC** — Configurations de relayers pré-établies pour tous les canaux IBC pris en charge
* **Intégration pont-vers-burn** — Les frais de pont sont acheminés via la distribution des frais du module de burn

## v1.1.0 — Signatures hybrides PQC

**Axe de la version :** sécurité cryptographique post-quantique et agilité algorithmique.

* **Doubles signatures secp256k1 (ECDSA) + ML-DSA-87** — Chaque transaction porte à la fois une signature classique et une signature post-quantique, vérifiées dans la chaîne AnteHandler
* **3 modes d'application** — Application configurable des signatures hybrides : off (mode 0), permissif (mode 1, PQC optionnel), obligatoire (mode 2, PQC requis)
* **Auto-enregistrement** — Les clés publiques PQC sont automatiquement enregistrées lors de la première transaction hybride, éliminant l'étape d'enregistrement séparée
* **Socle de hachage SHAKE-256** — Toutes les opérations de hachage liées au PQC utilisent SHAKE-256 (famille SHA-3) pour une dérivation d'adresses résistante au quantique
* **Interfaces d'attestation TEE** — Prise en charge de l'attestation par environnement d'exécution de confiance (TEE) pour prouver l'intégrité de la génération des clés PQC
* **Cadre d'agilité algorithmique** — Registre d'algorithmes enfichable permettant d'ajouter de futurs algorithmes PQC par gouvernance, sans mise à niveau de chaîne

## v1.0.0 — Genesis (moteur de tokenomics)

**Axe de la version :** lancement initial du protocole avec tokenomics complète, exécution multi-VM et opérations assistées par IA.

* **Module x/burn** — Mécanisme de burn des frais multi-canaux avec une distribution en quatre parts entre validateurs, burn, trésorerie et stakers
* **Module x/xqore** — Dérivé de staking de gouvernance avec pénalités de déblocage anticipé par paliers et redistribution de rebase PvP
* **Module x/inflation** — Émission basée sur des époques avec décroissance annuelle, régie par le modèle économique à émission finie
* **Couche de consensus PRISM** — Optimisation par apprentissage par renforcement (PPO) pour l'ajustement dynamique des paramètres de chaîne, avec des contrôles de sécurité de type disjoncteur
* **CPoS à triple pool** — Classified Proof-of-Stake avec les pools de validateurs Emerald, Sapphire et Ruby, pondérés par des scores de réputation
* **Gouvernance QDRW** — Système de pondération dynamique des récompenses (Dynamic Reward Weighting) permettant des ajustements approuvés par la gouvernance de la distribution des récompenses entre les pools
* **Runtimes EVM + CosmWasm + SVM** — Trois environnements d'exécution concurrents : le QoreChain EVM Engine, les contrats intelligents CosmWasm et la Solana Virtual Machine
* **Pont cross-VM** — Passage de messages et transferts d'actifs entre les runtimes EVM, CosmWasm et SVM au sein d'un même bloc
* **Cryptographie post-quantique** — Signature résistante au quantique adossée à une bibliothèque PQC haute performance
* **QCAI** — Analyse heuristique on-chain avec un sidecar off-chain optionnel pour la détection de fraude, l'estimation des frais et l'optimisation du réseau
* **Déploiement conteneurisé** — Déploiement complet de testnet multi-validateurs avec service sidecar et indexeur de blocs
* **Indexeur de blocs** — Écouteur de blocs avec stockage persistant pour les requêtes historiques et l'analytique
