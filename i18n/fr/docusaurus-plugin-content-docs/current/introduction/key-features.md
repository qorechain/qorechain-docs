---
slug: /introduction/key-features
title: Fonctionnalités clés
sidebar_label: Fonctionnalités clés
sidebar_position: 3
---

# Fonctionnalités clés

Le tableau suivant répertorie toutes les fonctionnalités majeures de QoreChain, organisées par phase de version dans laquelle elles ont été introduites. Le mainnet (`qorechain-vladi`, EVM chain ID 9801), en service depuis le 7 juin 2026, exécute la **v3.2.5** (appliquée à la hauteur 3,906,833 le 29 octobre 2026 ; la v3.2.4 avait été appliquée à la hauteur 3,742,566 le 23 octobre) ; le testnet parallèle (`qorechain-diana`, EVM chain ID 9800) exécute la v3.2.6 depuis le 27 octobre 2026. Le tableau [État des fonctionnalités](#feature-status) à la fin de la liste des fonctionnalités indique ce qui est actif aujourd'hui sur les réseaux en production.

| Fonctionnalité             | Introduite dans     | Description                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signatures hybrides PQC (requises par défaut) | v1.1.0 (Sécurité)   | Doubles signatures sur chaque transaction du chemin Cosmos : une signature classique secp256k1 (ECDSA) associée à ML-DSA-87 (Dilithium-5). À partir de v3.1.71, la valeur par défaut du réseau est **required** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — les transactions Cosmos uniquement classiques sont rejetées ; seuls les gentxs de genesis et les transactions d'enregistrement/migration de clé PQC sont exemptés. Les transactions EVM conservent leur signature `eth_secp256k1` mais, depuis la v3.2.0, ne sont admises que depuis un compte disposant d'une clé ML-DSA-87 enregistrée et d'une [fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window) ouverte. Trois modes d'application contrôlés par la gouvernance (disabled / optional / required) restent disponibles. |
| Hash SHAKE-256 par défaut  | v1.1.0 (Sécurité)   | Fonction à sortie extensible (XOF) de la famille SHA-3. À partir de v3.1.73, SHAKE-256 (via le package `qorehash`) est le **hash d'application par défaut**, complétant la base PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Fournit un hachage de longueur variable, une sortie fixe de 32 octets, la concaténation des nœuds internes Merkle et le hachage à séparation de domaine — le tout en pur Go sans dépendance FFI. |
| Interfaces TEE et FL       | v1.1.0 (Sécurité)   | Spécifications d'interface (pas encore d'implémentation) pour l'attestation d'environnement d'exécution de confiance (Trusted Execution Environment : SGX, TDX, SEV-SNP, ARM CCA) et la coordination de l'apprentissage fédéré (Federated Learning : méthodes d'agrégation FedAvg, FedProx, SCAFFOLD) ; les deux sont prévues pour une version future. |
| Consensus RL on-chain (PRISM) | v1.0.0 (Genesis) | Un MLP à virgule fixe natif en Go (73 733 paramètres) est intégré au cycle de vie des blocs pour l'inférence PPO. PRISM est conçu pour régler le temps de bloc, le prix du gas et les poids des pools ; sur les réseaux en production, il se contente pour l'instant d'observer (aucune politique entraînée n'est chargée et les messages de contrôle sont désactivés). Des calculs déterministes par séries de Taylor sont conçus pour donner des résultats identiques sur tous les validateurs. Quatre modes de fonctionnement (shadow, conservative, autonomous, paused) ; le mainnet est réglé sur conservative, et le testnet fonctionne en mode shadow (il enregistre ce qu'il ajusterait et ne modifie rien). Protection par disjoncteur pour la sécurité. |
| Triple-Pool Composite PoS  | v1.0.0 (Genesis)    | Conçu ainsi : les validateurs sont classés dans les pools RPoS (pondéré par réputation), DPoS (pondéré par délégation) et PoS (standard) tous les 1 000 blocs. Le tirage pondéré par pool diversifierait la production de blocs au-delà de la simple domination par la mise, et une courbe de bonding personnalisée prendrait en compte la mise auto-bondée, la durée de fidélité, la qualité de réputation et la phase du protocole. Implémenté dans `x/qca` mais **pas encore actif dans la production de blocs, les récompenses ni le slashing** ; la proposition de blocs et le slashing suivent actuellement les règles standard pondérées par la mise. |
| Gouvernance QDRW           | v1.0.0 (Genesis)    | Quadratic Delegation with Reputation Weighting (délégation quadratique avec pondération par réputation). Conçu pour que le pouvoir de vote utilise une fonction racine carrée atténuée par un multiplicateur de réputation sigmoïde, empêchant la capture par les baleines tout en récompensant la participation honnête de long terme (un avantage de mise de 100x donne environ 10x de pouvoir de vote ; les avoirs en xQORE doublent le poids de vote). Implémentée mais **désactivée sur les réseaux en production** (`qdrw` est désactivé) ; les propositions sont actuellement décomptées sur la mise bondée. |
| Moteur de burn             | v1.0.0 (Genesis)    | Douze sources de burn (frais de gas, création de contrat, frais de services IA, frais de pont, rachat par la trésorerie, transactions échouées, pénalités xQORE, rachat automatisé, le burn du TGE, création de rollup, paliers de nombre de transactions et AMM) ; sur le mainnet, seuls les canaux des frais de gas et des transactions échouées ont enregistré des burns jusqu'à présent. Tout ce qui arrive dans le collecteur de frais, y compris l'émission d'epoch, est réparti **37 % aux validateurs, 30 % brûlés définitivement, 20 % à la trésorerie, 10 % aux stakers et 3 % aux nœuds légers**. |
| Staking xQORE              | v1.0.0 (Genesis)    | Pas encore en production : les transactions de verrouillage et de déverrouillage du module ne sont pas câblées sur les réseaux en production (voir [Staking xQORE](/user-guide/xqore-staking)). Comportement prévu : verrouillez du QOR pour frapper du xQORE à un ratio 1:1 afin de doubler le poids de gouvernance dans les votes QDRW. Les pénalités de sortie graduées (50 % avant 30 jours, 35 % entre 30 et 90 jours, 15 % entre 90 et 180 jours, 0 % après 180 jours) sont redistribuées aux détenteurs restants via le rebase PvP — récompensant la conviction et pénalisant le capital de court terme. |
| Émission plafonnée         | v1.0.0 (Genesis)    | Une trajectoire d'offre finie : 4 420 000 000 QOR au genesis (80 000 000 QOR des 4 500 000 000 prévus ont été brûlés au TGE) plus l'émission de staking frappée par `x/inflation` sous un plafond cumulatif strict de 590 000 000 QOR (86 000 QOR par epoch de 43 200 blocs en mode `fixed`, depuis la proposition de gouvernance 10 d'octobre 2026). Les burns retirent définitivement des tokens. Voir [Tokenomics](/architecture/tokenomics#supply-and-emission). |
| Environnement d'exécution EVM | v1.0.0 (Genesis) | Compatibilité Ethereum complète avec tarification du gas EIP-1559, JSON-RPC sur le port 8545 (espaces de noms `eth_`, `web3_`, `net_` et `txpool_` ; l'espace de noms `qor_` n'est pas encore servi) et prise en charge de l'outillage standard (Hardhat, Foundry, Remix). Déployez et interagissez avec des contrats Solidity en utilisant des workflows Ethereum existants ; depuis la v3.2.0, l'expéditeur doit disposer d'une clé post-quantique enregistrée et d'une [fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window) ouverte. |
| Environnement d'exécution QoreChain Native | v1.0.0 (Genesis) | Nom donné par QoreChain à son runtime CosmWasm : un moteur de contrats intelligents WebAssembly pour les contrats basés sur Rust. Prise en charge complète du cycle de vie : instanciation, exécution, requête et migration. Les contrats s'exécutent dans un environnement Wasm en bac à sable avec exécution déterministe. Le téléversement de code et l'instanciation sont actuellement **désactivés** sur les deux réseaux (paramètre de gouvernance plus disjoncteur). |
| Environnement d'exécution SVM | v1.0.0 (Genesis) | Déploiement et exécution de programmes BPF via un exécuteur basé sur Rust. Le serveur JSON-RPC compatible Solana sur le port 8899 prend en charge `getAccountInfo`, `getBalance`, `getSlot`, et bien plus. Les méthodes de lecture fonctionnent sur les points de terminaison publics ; la voie de transaction SVM est actuellement **désactivée** sur l'ensemble du réseau. |
| Pont inter-VM              | v1.0.0 (Genesis)    | Interopérabilité transparente entre les trois VM. Les contrats EVM appellent QoreChain Native via precompile (pas encore actif, voir [État du réseau](/developer-guide/evm-precompiles#network-status)) ; les contrats QoreChain Native appellent l'EVM via des messages personnalisés ; les programmes SVM participent par un pontage asynchrone basé sur les événements. Appels synchrones EVM-QoreChain Native et messagerie asynchrone SVM au sein d'une seule chaîne. Le message d'appel inter-VM est actuellement désactivé sur le mainnet. |
| Connectivité inter-chaînes | v1.2.0 (Interop)    | Conçue pour jusqu'à huit contreparties IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) plus **37 configurations de chaîne QCB (36 chaînes externes plus Injective via IBC)**. Attestations de validateur signées PQC, profondeurs de confirmation par chaîne et plafonds de volume par disjoncteur. En octobre 2026, les 37 configurations de chaîne sont au statut `pending` et aucun canal IBC vers une contrepartie prévue n'est ouvert (le mainnet n'en a aucun ; le testnet a un canal de test) — **pas en production**. |
| Restaking BTC              | v1.2.0 (Interop)    | Au stade de la conception — les transactions du module ne sont pas activées sur les réseaux en production. Intégration de Babylon Protocol pour les garanties de finalité Bitcoin. Les validateurs enregistreraient des positions de staking BTC (minimum 100 000 satoshis). Les racines d'état d'epoch de QoreChain feraient périodiquement l'objet d'un point de contrôle vers Bitcoin via des epochs Babylon relayés par IBC, fournissant une couche de finalité secondaire soutenue par le hashrate BTC. |
| Abstraction de compte      | v1.2.0 (Interop)    | Comptes intelligents programmables au niveau du protocole (similaire à ERC-4337). Trois types de comptes : multisig, récupération sociale et basé sur session. Clés de session avec permissions et expiration granulaires, règles de dépenses quotidiennes par compte et par transaction, et listes d'autorisation de denoms cadrées. Implémentée mais **désactivée sur le mainnet** (`abstractaccount.enabled = false`) et activée sur le testnet (consultez `GET /qorechain/abstractaccount/v1/config` sur le réseau que vous utilisez). |
| Protection MEV             | v1.2.0 (Interop)    | Framework de chiffrement à seuil basé sur l'identité (tIBE) FairBlock pour les mempools chiffrés, conçu pour garder les transactions opaques pour les proposeurs de blocs jusqu'à leur inclusion. Le gestionnaire ante FairBlockDecorator est câblé ; le déchiffrement à seuil tIBE s'active après le déploiement de la cérémonie de clés. Actuellement **désactivée** sur les deux réseaux (`enabled = false`). |
| Abstraction de gas         | v1.2.0 (Interop)    | Conçue pour permettre aux utilisateurs de payer les frais dans un jeton non natif accepté ; la liste des jetons acceptés en production ne contient que `uqor`. Aucun `ibc/USDC` ni `ibc/ATOM` n'est accepté sur aucun des deux réseaux, donc les frais sont actuellement payés en QOR. |
| Priorisation à 5 voies     | v1.2.0 (Interop)    | Les définitions de voies (PQC, MEV, AI, Default, Free) existent sous forme de configuration, mais les voies d'espace de bloc ne sont pas appliquées par le mempool ni par le gestionnaire de propositions en production. |
| Liquidité on-chain (AMM)   | v1.2.0 (Interop)    | Le teneur de marché automatisé natif (`x/amm`) fournit des pools de liquidité on-chain et des swaps au niveau du protocole. Le module est en production ; aucun pool n'a encore été créé. |
| Rollups RDK                | v1.3.0 (Rollups)    | Rollup Development Kit avec quatre paradigmes de règlement (optimistic, zk, based, sovereign), cinq profils prédéfinis (defi, gaming, nft, enterprise, custom), routeur DA natif avec stockage de blobs SHAKE-256 et élagage automatique, cycle de vie de séquestre bancaire avec taux de burn de création configurable, auto-finalisation par EndBlocker et configuration assistée par PRISM via le module de consensus. Les capacités de rollup sont livrées sous forme de framework de chaîne hôte ; aucun rollup n'a encore été créé sur les réseaux en production. |
| Licence de chaîne          | v1.3.0 (Rollups)    | Le module `x/license` fournit une licence de chaîne native au protocole. |

## État des fonctionnalités (octobre 2026) {#feature-status}

Vérifié sur les réseaux en production le 20 octobre 2026 (mainnet v3.2.4 ; les lignes concernées par la v3.2.5 ont été revérifiées sur le mainnet le 30 octobre 2026), les notes propres au testnet dans les lignes ayant été revérifiées le 27 octobre 2026 (testnet v3.2.6). « En production » signifie que la capacité est active sur le mainnet (et, sauf indication contraire dans une ligne, sur le testnet) ; les descriptions ci-dessus indiquent ce que chaque fonctionnalité est conçue pour faire.

| Capacité | État sur les réseaux en production |
| --- | --- |
| Signatures hybrides ML-DSA-87 + secp256k1 (voie Cosmos) | **En production**, requises (`hybrid_signature_mode = required`) |
| Fenêtre d'autorisation EVM | **En production** depuis la v3.2.0 (périmètre facultatif depuis la v3.2.3) |
| Staking à verrouillage temporel (`x/stakingtier`, facultatif) | **En production** depuis la v3.2.4 (testnet depuis le 19 octobre 2026, mainnet depuis le 23 octobre 2026) |
| Fonctionnalités de protocole de la v3.2.5 (registre natif de clés ML-KEM, liste d'autorisation cross-VM gouvernée, déploiement CosmWasm gouverné, règlement RDK dans l'ordre des lots avec résolution ouverte des contestations, propositions accélérées qui conservent leurs votes) | **En production** sur le mainnet depuis le 29 octobre 2026 (hauteur 3,906,833) et sur le testnet depuis le 26 octobre 2026. L'appel cross-VM et l'instanciation CosmWasm sont toujours désactivés sur le mainnet et aucun précompilé EVM n'est actif ; voir [Historique des versions](/appendix/version-history#v325) |
| Environnements d'exécution EVM, QoreChain Native, SVM | EVM **en production** ; téléversement de code et instanciation QoreChain Native **désactivés** (paramètre de gouvernance plus disjoncteur) ; voie de transaction SVM **désactivée** (les lectures fonctionnent) |
| Moteur de burn et répartition des frais (37/30/20/10/3) | **En production** ; seuls les canaux de burn des frais de gas et des transactions échouées ont enregistré des burns sur le mainnet |
| Émission plafonnée (`x/inflation`) | **En production**, fixe à 86 000 QOR par epoch jusqu'à un plafond de 590 000 000 QOR (mainnet) |
| Staking, slashing, gouvernance | **En production** (modules standard ; voir [Paramètres de la chaîne](/appendix/chain-parameters)) |
| Récompenses des nœuds légers | Comptabilisation des récompenses **en production** ; inscription **ouverte** et soumise à licence, un nœud léger enregistré sur chaque réseau (vérifié le 27 octobre 2026 ; voir [statut](/light-node/overview#reward-program-status)) |
| AMM (`x/amm`) | Module **en production**, aucun pool créé pour l'instant (vérifié le 27 octobre 2026) ; le testnet dispose aussi des tokens de test Fest qui peuvent être mis en pool |
| PRISM (`x/rlconsensus`) | **Observation uniquement** sur le mainnet (aucune politique chargée) ; sur le testnet, une politique de démonstration s'exécute en mode shadow et enregistre des actions proposées sans les appliquer |
| Triple-Pool CPoS / QDRW (`x/qca`) | Implémentés, **non câblés** dans la production de blocs, les récompenses ni le décompte |
| xQORE (`x/xqore`) | Comptabilité uniquement — **pas encore de transactions de verrouillage/déverrouillage** |
| Comptes intelligents / portefeuilles liés (`x/abstractaccount`) | Implémentés, **désactivés sur le mainnet** (`enabled = false`) ; activés sur le testnet (vérifié le 27 octobre 2026) |
| Rollup Development Kit (`x/rdk`), multicouche | Modules **en production**, aucun rollup ni aucune couche créés pour l'instant |
| Pont inter-chaînes, IBC, restaking Babylon | **En attente** — les 37 configurations de chaîne sont `pending`, aucun canal IBC sur le mainnet (un canal de test sur le testnet), aucune transaction de restaking |
| Protection MEV FairBlock | **Désactivée** (`enabled = false`) |
| Precompiles EVM, espace de noms JSON-RPC `qor_` | Mainnet : **non actifs / non servis** (la liste des precompiles actifs est vide). Testnet : trois precompiles actifs (PQC Verify, PQC Key Status, PRISM Consensus Params), vérifié le 27 octobre 2026 |

## Historique des versions

<details>

<summary>v1.0.0 — Version Genesis</summary>

A établi le protocole central avec la cryptographie post-quantique (Dilithium-5, ML-KEM-1024), la couche de consensus par apprentissage par renforcement on-chain PRISM, l'environnement d'exécution triple-VM (EVM, QoreChain Native, SVM) avec messagerie inter-VM, le moteur de tokenomics (burn, xQORE, module d'émission), la sélection des validateurs Triple-Pool Composite PoS, la gouvernance quadratique QDRW et le pipeline de traitement IA des transactions.

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
