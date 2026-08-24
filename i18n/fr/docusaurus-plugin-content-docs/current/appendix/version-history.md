---
slug: /appendix/version-history
title: Historique des versions
sidebar_label: Historique des versions
sidebar_position: 3
---

# Historique des versions

Historique public des versions de QoreChain. La dernière version est **v3.1.92**, en cours d'exécution sur le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en production depuis le 7 juin 2026). Le testnet **`qorechain-diana`** (EVM chain ID **9800**) suit les versions de pré-publication.

:::note
Les entrées ci-dessous sont des résumés de capacités de haut niveau. Les entrées `v1.x` antérieures sont conservées comme trace historique de la lignée de versions testnet qui a précédé le mainnet.
:::

---

## v3.1.92 — Fiabilité de la synchronisation des nœuds (version actuelle)

**Axe de la version :** Intégration plus fiable des nœuds à partir des snapshots et de l'archive de chaîne publiée.

* **Correction de la synchronisation par snapshot et archive** — Résolution d'un problème où un nœud se restaurant à partir d'un snapshot state-sync ou de l'archive de chaîne publiée pouvait échouer à terminer la synchronisation au-delà de certains blocs historiques. L'intégration via l'une ou l'autre méthode se termine désormais de manière fiable.

## v3.1.90 — Comptabilisation de la disponibilité des light nodes

**Axe de la version :** La disponibilité mesurée pour l'éligibilité aux récompenses des light nodes s'accumule désormais de manière cohérente dans le temps.

* **Accumulation prospective de la disponibilité** — La disponibilité d'un light node déterminant son éligibilité aux récompenses est désormais calculée en accumulant son nombre de heartbeats attendu de manière prospective depuis son propre enregistrement, à l'intervalle de heartbeat en vigueur à chaque instant, plutôt qu'en recalculant tout son historique sous l'intervalle actuellement en vigueur. Un changement de gouvernance sur l'intervalle de heartbeat n'affecte donc que l'avenir et ne réévalue jamais rétroactivement les performances passées d'un nœud.

## v3.1.86 — Sauvegarde de récupération pour les validateurs

**Axe de la version :** Un validateur ne peut plus être définitivement bloqué dans sa récupération après une mise en prison pour indisponibilité.

* **Correction du blocage de mise en prison** — Un compte opérateur de validateur sans clé post-quantique enregistrée peut désormais toujours soumettre `MsgUnjail` pour se remettre d'une mise en prison pour indisponibilité, même lorsque l'application des signatures hybrides est réglée sur obligatoire avec le repli classique désactivé. Auparavant, un tel compte n'avait aucun moyen de récupération, puisque la sortie de prison nécessitait d'envoyer une transaction qu'il lui était justement interdit d'envoyer.
* **Snapshots state-sync** — La génération de snapshots est activée sur l'ensemble du réseau, permettant aux nouveaux validateurs et full nodes de rejoindre rapidement via state sync plutôt que par une relecture historique complète.

## v3.1.85 — Dépenses déléguées via des portefeuilles liés

**Axe de la version :** Une clé de portefeuille externe liée (Phantom, MetaMask) peut désormais **dépenser** depuis l'unique compte post-quantique canonique — sous permissions à moindre privilège, limites de dépense et révocation instantanée.

* **Voies d'exécution par authenticator** — Deux nouveaux messages permettent à un authenticator enregistré d'autoriser des transferts depuis le compte canonique sans que le propriétaire du compte soit présent : **`MsgExecuteEVM`** (un appel/transfert EVM depuis l'adresse `0x…` du compte) et **`MsgExecuteCosmos`** (un envoi bancaire sur la voie native). Un **relayer** soumet l'enveloppe et en paie les frais — sa propre signature PQC hybride satisfait les exigences de la transaction — tandis que la signature de l'authenticator sur des sign bytes séparés par domaine et liés anti-rejeu constitue l'autorisation. La clé externe n'a jamais besoin d'une co-signature ML-DSA.
* **MetaMask comme authenticator** — Les authenticators secp256k1 peuvent désormais être enregistrés par leur **adresse Ethereum de 20 octets** et vérifiés via **EIP-191 `personal_sign`** (en plus de la forme à clé compressée de 33 octets), de sorte qu'un compte MetaMask standard peut être lié et dépenser sous limites.
* **Application sur les trois voies** — Les portées de permission et les limites de valeur **SpendingRule** (plafonds par transaction et quotidiens) sont appliquées sur les voies Native, EVM et SVM ; les messages de gestion de clés ne sont jamais délégables. Des codes d'erreur distincts permettent aux portefeuilles d'afficher le bon message : `5` limite de dépense dépassée, `6` authenticator expiré, `10` permission refusée, `11` rejeu rejeté.
* **Requête du schéma de permissions** — `GET /qorechain/abstractaccount/v1/permission_schema` (également disponible en gRPC/CLI) renvoie la taxonomie canonique des permissions (11 permissions), la correspondance message→permission, et la liste des messages non délégables, afin que les portefeuilles valident les portées sans les coder en dur.
* **Rotation de clé PQC de même algorithme** — La nouvelle commande **`MsgRotatePQCKey`** fait tourner la clé ML-DSA-87 d'un compte au sein du même algorithme (double signature par l'ancienne et la nouvelle clé), permettant la migration de clés dérivées de manière historique vers la dérivation canonique liée à l'adresse, ainsi que le retrait d'une clé compromise. Nouvelles commandes CLI : `tx pqc rotate-key` et `tx pqc recover-key` (récupération déterministe de clé à partir d'un mnémonique).
* **Transactions par clé racine inchangées** — Ces changements sont additifs ; les flux normaux de portefeuille, d'échange et Keplr restent inchangés. Les opérateurs de nœuds doivent être sur **v3.1.85** à la hauteur de bloc de mise à niveau du réseau.

## v3.1.84 — Permissions des authenticators et limites de dépense

**Axe de la version :** Le modèle de permissions derrière les dépenses déléguées.

* **Taxonomie canonique des permissions** — Onze permissions (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) avec une correspondance message→permission fermée par défaut : un type de message non mappé est refusé, et les messages de gestion de clés ne peuvent jamais être délégués.
* **Application de SpendingRule** — Les plafonds de dépense par transaction et par jour (UTC), avec listes de dénominations autorisées, sont appliqués et enregistrés par paire (compte, authenticator).
* **Autorisation sur la voie SVM** — Les actions autorisées par une clé de schéma étranger (par exemple Phantom ed25519) sur la voie SVM passent par la même porte d'autorisation centrale.

## v3.1.83 — Signature de compte unifiée sur les trois interfaces

**Axe de la version :** Une seule clé, un seul compte — une identité unifiée unique qui peut désormais **signer**, et pas seulement détenir un solde, sur les interfaces Cosmos, EVM et SVM.

* **Une seule clé signe sur chaque voie** — Un compte créé nativement en format eth (adresse = keccak de sa clé publique secp256k1) signe désormais les transactions sur la voie Cosmos avec le schéma `eth_secp256k1`, en plus des transactions EVM. Ses formes `qor1…` (Cosmos), `0x…` (EVM) et Solana-VM (base58) sont une seule identité de 20 octets qui **détient un seul solde** et **dépense sur les trois voies** — y compris les transactions Cosmos hybrides post-quantiques (ML-DSA-87).
* **Signature post-quantique inchangée** — Le compte unifié enregistre toujours sa clé ML-DSA-87 et porte la signature hybride FIPS-204 exigée par la chaîne ; la partie classique est `eth_secp256k1` (keccak) au lieu du schéma coinType-118. Les comptes coinType-118 existants ne sont pas affectés.
* **Mise à niveau progressive neutre pour le consensus** — Livrée sous forme de mise à niveau binaire progressive sur les deux réseaux, **sans nouvelle genèse ni arrêt de chaîne**. Les soldes de comptes, l'historique et la genèse restent inchangés.
* **Outillage client** — `@qorechain/wallet-adapter` 0.1.5 ajoute la signature Cosmos native eth (`signClassicalEth` / `signHybridEth`), la génération unifiée à 3 adresses, et `walletFromSeed` (dérive le compte canonique à partir de n'importe quelle seed de 32 octets — par exemple une signature Phantom) ; `@qorechain/chain-bridge` gagne un chemin de signature `eth_secp256k1`.

:::caution Opérateurs de nœuds — mise à niveau requise
Les full nodes doivent exécuter **v3.1.83+**. Un nœud antérieur à 3.1.83 ne peut pas décoder une transaction native eth (`eth_secp256k1`) et cessera de se synchroniser dès qu'une telle transaction apparaîtra dans un bloc. Téléchargez le pack actuel sur [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR natif sur SVM en production + activation pour les intégrateurs

**Axe de la version :** L'unification du QOR natif sur SVM en fonctionnement sur les deux réseaux, ainsi que tout ce dont un échange ou un intégrateur a besoin pour se connecter.

* **Solde QOR natif unifié en production sur les trois interfaces** — L'unification SVM (v3.1.81) est confirmée en production sur le mainnet et le testnet : le même compte détient un seul solde visible sous forme d'`uqor` (6 décimales) sur Cosmos, en 18 décimales de style wei sur l'EVM, et en lamports (9 décimales ; 1 uqor = 1 000 lamports) sur l'interface compatible Solana.
* **Points de terminaison publics vérifiés** — Points de terminaison HTTPS publics pour le RPC de consensus, REST, EVM JSON-RPC et SVM JSON-RPC sur les deux réseaux, ainsi que l'[explorateur de blocs](https://explore.qore.network) public. Voir [Réseaux](/appendix/networks).
* **Téléchargements** — Packs binaires de nœuds versionnés, la genèse mainnet, et des snapshots de données de chaîne récents (avec sommes de contrôle SHA-256) publiés sur [download.qore.host](https://download.qore.host).
* **Signature post-quantique déterministe sur toute la pile client** — `@qorechain/pqc` 0.1.1 signe en ML-DSA-87 de manière déterministe (FIPS-204 §3.4) dans les six liaisons de langage, correspondant exactement à ce que la chaîne accepte ; `@qorechain/wallet-adapter` 0.1.2 s'appuie dessus pour la signature de transactions hybrides.
* **Guide de l'intégrateur** — Nouveau [Guide Échange et intégrateur](/developer-guide/exchange-integration) couvrant les dépôts, les retraits et les opérations de nœuds sur les trois interfaces.

## v3.1.81 — Unification du QOR natif sur SVM

**Axe de la version :** Le QOR natif comme actif de premier ordre sur l'interface compatible Solana.

* **QOR natif sur SVM** — Le runtime SVM expose désormais directement le solde QOR natif du compte (en lamports), plutôt que de suivre un solde séparé propre à SVM. `getBalance` et `getSignaturesForAddress` fonctionnent avec les fonds natifs, et les transferts du System Program déplacent du QOR natif.
* **Correspondance d'adresse SVM** — L'adresse SVM d'un compte est dérivée de ses 20 octets de compte (complétés à droite jusqu'à 32 octets, encodés en base58), de sorte que les adresses Cosmos, EVM et SVM d'une même clé renvoient aux mêmes fonds.

## v3.1.80 — Requêtes d'ancrage d'état multicouche

**Axe de la version :** Ancres de règlement lisibles et vérifiables hors ligne pour les rollups.

* **Requêtes de lecture d'ancrage** — Le service de requête `x/multilayer` expose désormais `Anchor` (la dernière ancre d'état d'une couche) et `Anchors` (l'historique des ancres d'une couche), afin que les clients puissent récupérer l'ancre de règlement d'une couche et la vérifier de manière indépendante.
* **Passerelle REST pour multilayer** — Chaque requête multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) est désormais disponible via REST en plus de gRPC.
* **Reçus de règlement résistants au quantique débloqués** — Chaque ancre porte une signature **ML-DSA-87 (Dilithium-5)** sur ses champs canoniques, fournissant la base on-chain pour la vérification hors ligne des reçus de règlement du Rollup Development Kit.

## v3.1.79 — Approvisionnement automatique des validateurs pour les réseaux du pont

**Axe de la version :** Participation clé en main sur les réseaux connectés pour les validateurs sous licence.

* **Framework de pilotes réseau** — Un framework de pilotes déclaratif permet à un validateur QoreChain détenant la licence `validator_<chain>` (ou `qcb_bridge`) pertinente de faire provisionner, configurer et exécuter le client réseau externe correspondant sur le même nœud sous l'orchestration de QoreChain — uniquement une fois la licence activée.
* **Pilotes pour les 37 réseaux du pont** — La couverture s'étend à chaque réseau connecté, classé selon son modèle de participation (validateur sans permission, plafonné/élu/sur admission, full node L2, et rôles sans staking/liste de confiance). Les clés de staking et de signature du réseau externe restent fournies par l'opérateur pour chaque réseau ; QoreChain fournit le framework et la porte de licence appliquée.

## v3.1.78 — Préparation avant déploiement

**Axe de la version :** Portefeuilles, ponts, IBC et licences fonctionnent tous dès le lancement — sans gouvernance post-déploiement.

* **Activation de pont post-déploiement sans confiance requise** — Une clé `bridge_admin` (ou un détenteur de licence `qcb_bridge`) peut activer le pont de n'importe quelle chaîne connectée avec une seule transaction signée (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — définissant l'adresse du contrat, les confirmations, l'architecture, le statut, le vérificateur actif et la racine de confiance du vérificateur — sans proposition de gouvernance ni mise à niveau de chaîne.
* **Porte de licence réseau-validateur** — L'orchestrateur applique désormais la licence `validator_<chain>` / `qcb_bridge` (fermée par défaut) avant de démarrer tout client réseau externe.
* **Paquets d'intégration de portefeuille** — `@qorechain/wallet-adapter` et `@qorechain/connect` publiés sur npm (v0.1.0), ajoutant l'enregistrement réseau MetaMask en un appel (EIP-3085, QOR natif en **18 décimales** sur le rail EVM) et la configuration du prix du gaz Keplr.
* **Relayer IBC clé en main** — Configuration de relayer prête à l'emploi et outillage de bootstrap de canaux pour les huit contreparties IBC, afin que les canaux se lèvent après le déploiement sans configuration sur mesure.

## v3.1.77 — Points de terminaison REST pour le pont et la combustion

**Axe de la version :** Accès REST en lecture seule pour les modules cross-chain et d'offre.

* **Points de terminaison REST du pont** — Points de terminaison de requête HTTP en lecture seule pour le module de pont, exposant l'état du pont via REST standard en plus de gRPC.
* **Points de terminaison REST de combustion** — Points de terminaison de requête HTTP en lecture seule pour le module de combustion, rendant les données de distribution des frais et d'offre interrogeables via REST standard.

## v3.1.76 — Modernisation de la chaîne d'outils SVM

**Axe de la version :** Actualisation de la compatibilité avec la Solana Virtual Machine.

* **Prise en charge des programmes de la chaîne d'outils actuelle** — L'exécution SVM a été modernisée afin que les programmes construits avec la chaîne d'outils Solana actuelle s'exécutent sur le runtime SVM de QoreChain.

## v3.1.75 — SVM JSON-RPC activé par défaut

**Axe de la version :** RPC compatible Solana prêt à l'emploi.

* **JSON-RPC compatible Solana** — Le serveur SVM JSON-RPC est désormais activé par défaut (port **8899**) et démarré automatiquement avec le nœud, fournissant une interface RPC compatible Solana pour l'outillage SVM.

## v3.1.74 — Préréglages de profils de rollup

**Axe de la version :** Ergonomie du Rollup Development Kit et règlement.

* **Application des préréglages de profil** — La création de rollup applique désormais le préréglage du profil sélectionné (DeFi, gaming, NFT, entreprise, ou entièrement personnalisé), afin que les nouveaux rollups héritent de valeurs par défaut adaptées à leur cas d'usage.
* **Règlement optimiste** — Le chemin de règlement optimiste (soumission par lot et contestation) est opérationnel de bout en bout.

## v3.1.73 — Référence de hachage post-quantique

**Axe de la version :** Achèvement de la référence cryptographique post-quantique par défaut.

* **Hachage par défaut SHAKE-256** — SHAKE-256 (famille SHA-3) est adopté comme hachage d'application par défaut, complétant la référence post-quantique par défaut composée des signatures **ML-DSA-87 (Dilithium-5)**, de l'encapsulation de clé **ML-KEM-1024**, et du hachage **SHAKE-256**.

## v3.1.72 — Stabilité et maintenance

**Axe de la version :** Maintenance courante de stabilité et du pipeline de build.

* **Améliorations de stabilité** — Maintenance interne de stabilité, des dépendances et du pipeline de build, sans changement de comportement visible de l'extérieur.

## v3.1.71 — Signatures hybrides PQC appliquées par défaut

**Axe de la version :** Sécurité post-quantique activée par défaut sur le chemin de transaction Cosmos.

* **Signatures hybrides requises par défaut** — Les signatures hybrides post-quantiques sont désormais appliquées par défaut sur le chemin de transaction Cosmos : chaque transaction porte une signature post-quantique **ML-DSA-87 (Dilithium-5)** en plus de la signature classique **secp256k1**.
* **Application contrôlée par gouvernance** — Le mode d'application reste contrôlé par la gouvernance, avec la valeur par défaut réglée sur **obligatoire**.

## v3.1.70 — Durcissement pour la production

**Axe de la version :** Durcissement pour la production et optimisation du consensus pour le mainnet en production.

* **Optimisation du consensus PRISM** — Améliorations continues de la couche d'optimisation par apprentissage par renforcement PRISM pour l'ajustement adaptatif des paramètres dans des conditions réseau réelles, avec des contrôles de sécurité de type disjoncteur.
* **Performance et stabilité** — Améliorations du débit, de la latence et de l'utilisation des ressources sur les validateurs et les full nodes.
* **Outillage opérationnel** — Amélioration de la supervision, des requêtes et de l'ergonomie d'exploitation des nœuds pour les opérateurs mainnet.
* **Alignement Tokenomics v2.1** — Distribution des frais et mécanique d'émission alignées sur le modèle économique à offre fixe et émission finie.

## v3.0.0 — Genèse du mainnet

**Axe de la version :** Lancement du mainnet et événement de génération de token.

* **Genèse du mainnet** — Le mainnet QoreChain (`qorechain-vladi`, EVM chain ID 9801) a été lancé le **7 juin 2026**, avec l'événement de génération de token (TGE) à la genèse.
* **Répartition des frais en cinq voies** — Distribution des frais de protocole entre validateurs, combustion, trésorerie, stakers et light nodes (**37 / 30 / 20 / 10 / 3**), ajoutant une part dédiée aux light nodes.
* **AMM on-chain** — Module natif de teneur de marché automatisé (`x/amm`) pour les pools de liquidité et les échanges on-chain.
* **Licences de chaîne** — Module de licence on-chain (`x/license`) pour enregistrer et gérer les droits de protocole.
* **Paradigmes de règlement durcis** — Modes de règlement RDK finalisés en optimiste, zk, based et sovereign.

## v1.4.0 — Expansion pré-mainnet

**Axe de la version :** Couverture cross-chain et stabilisation des versions candidates avant le mainnet.

* **Couverture cross-chain élargie** — Connectivité IBC et pont supplémentaire vers un ensemble plus large de réseaux externes.
* **Participation des light nodes** — Introduction des light nodes et des bases de leurs récompenses de part de frais.
* **Durcissement des versions candidates** — Tests, audits et stabilisation étendus sur tous les modules du cœur en préparation de la genèse du mainnet.

## v1.3.0 — Rollup Development Kit

**Axe de la version :** Infrastructure de rollup native pour les déploiements de rollups sovereign et à sécurité partagée.

* **Module x/rdk** — Rollup Development Kit complet avec quatre paradigmes de règlement : optimiste, zk, based et sovereign
* **5 profils préréglés** — Modèles de rollup préconfigurés pour les cas d'usage DeFi, gaming, NFT, entreprise et entièrement personnalisé
* **Disponibilité des données native** — Couche DA on-chain avec stockage de blobs, gestion de la rétention et cycle de purge
* **Finalisation automatique par EndBlocker** — Finalisation automatique des lots lorsque la fenêtre de contestation expire, sans intervention de l'opérateur
* **Sélection de profil assistée par IA** — Requête `suggest-profile` qui recommande une configuration de rollup optimale selon le cas d'usage visé
* **Intégration multilayer** — Les rollups s'enregistrent comme couches dans l'architecture multilayer, héritant du routage, de l'ancrage et des mécanismes de contestation
* **Cycle de vie de l'escrow bancaire** — Le stake de l'opérateur est détenu en escrow pendant le fonctionnement du rollup et libéré à l'arrêt propre, ou confisqué en cas de slashing

## v1.2.0 — IBC et ponts

**Axe de la version :** Connectivité cross-chain et abstractions de compte avancées.

* **25 connexions cross-chain** — 8 canaux IBC et 17 connexions QoreChain Bridge (QCB) vers des réseaux externes
* **Module x/babylon** — Intégration de restaking BTC permettant aux détenteurs de Bitcoin de participer à la sécurité de staking de QoreChain
* **Module x/abstractaccount** — Framework de compte intelligent avec règles de dépense programmables, clés de session et logique d'authentification personnalisée
* **Module x/fairblock** — Chiffrement à seuil basé sur l'identité (tIBE) pour un chiffrement de transaction résistant au MEV
* **Module x/gasabstraction** — Paiement de gaz multi-token prenant en charge le QOR natif, l'USDC pontée par IBC et l'ATOM ponté par IBC
* **Priorisation des transactions à 5 voies** — Voies de transaction ordonnées par priorité : système, gouvernance, staking, pont et général
* **Configurations de relayer IBC** — Configurations de relayer préconfigurées pour tous les canaux IBC pris en charge
* **Intégration pont-combustion** — Les frais de pont sont acheminés à travers la distribution des frais du module de combustion

## v1.1.0 — Signatures hybrides PQC

**Axe de la version :** Sécurité cryptographique post-quantique et agilité algorithmique.

* **Double signature secp256k1 (ECDSA) + ML-DSA-87** — Chaque transaction porte à la fois une signature classique et une signature post-quantique, vérifiées dans la chaîne AnteHandler
* **3 modes d'application** — Application configurable des signatures hybrides : désactivée (mode 0), permissive (mode 1, PQC facultative), obligatoire (mode 2, PQC requise)
* **Enregistrement automatique** — Les clés publiques PQC sont automatiquement enregistrées lors de la première transaction hybride, éliminant une étape d'enregistrement distincte
* **Fondation de hachage SHAKE-256** — Toutes les opérations de hachage liées à la PQC utilisent SHAKE-256 (famille SHA-3) pour la dérivation d'adresse résistante au quantique
* **Interfaces d'attestation TEE** — Prise en charge de l'attestation par environnement d'exécution de confiance (Trusted Execution Environment) pour prouver l'intégrité de la génération de clé PQC
* **Framework d'agilité algorithmique** — Registre d'algorithmes enfichables permettant d'ajouter de futurs algorithmes PQC via la gouvernance sans mise à niveau de chaîne

## v1.0.0 — Genèse (moteur de tokenomics)

**Axe de la version :** Lancement initial du protocole avec tokenomics complète, exécution multi-VM et opérations assistées par IA.

* **Module x/burn** — Mécanisme de combustion des frais multicanal avec une répartition à quatre voies entre validateurs, combustion, trésorerie et stakers
* **Module x/xqore** — Dérivé de staking de gouvernance avec pénalités de déverrouillage anticipé par palier et redistribution rebase PvP
* **Module x/inflation** — Émission basée sur des époques avec décroissance annuelle, régie par le modèle économique à émission finie
* **Couche de consensus PRISM** — Optimisation par apprentissage par renforcement (PPO) pour l'ajustement dynamique des paramètres de chaîne avec des contrôles de sécurité de type disjoncteur
* **CPoS à triple pool** — Proof-of-Stake classifié avec des pools de validateurs Émeraude, Saphir et Rubis pondérés par des scores de réputation
* **Gouvernance QDRW** — Système de pondération dynamique des récompenses permettant des ajustements approuvés par la gouvernance de la distribution des récompenses entre pools
* **Runtimes EVM + CosmWasm + SVM** — Trois environnements d'exécution concurrents : le moteur EVM de QoreChain, les contrats intelligents CosmWasm, et la Solana Virtual Machine
* **Pont cross-VM** — Passage de messages et transferts d'actifs entre les runtimes EVM, CosmWasm et SVM au sein d'un même bloc
* **Cryptographie post-quantique** — Signature résistante au quantique soutenue par une bibliothèque PQC haute performance
* **QCAI** — Analyse heuristique on-chain avec un sidecar hors chaîne facultatif pour la détection de fraude, l'estimation des frais et l'optimisation du réseau
* **Déploiement conteneurisé** — Déploiement complet de testnet multi-validateur avec service sidecar et indexeur de blocs
* **Indexeur de blocs** — Écouteur de blocs avec stockage persistant pour les requêtes historiques et l'analytique
