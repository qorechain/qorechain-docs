---
slug: /appendix/chain-parameters
title: Paramètres de la chaîne
sidebar_label: Paramètres de la chaîne
sidebar_position: 2
---

# Paramètres de la chaîne

Référence consolidée des paramètres de module des réseaux QoreChain, regroupés par module. Les paramètres peuvent être interrogés avec `qorechaind query <module> params` lorsque le module dispose d'une requête params (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus` ; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` et `gasabstraction` utilisent `config`), et via REST uniquement pour les routes listées dans la [référence REST / gRPC](/api-reference/rest-grpc-endpoints). Les paramètres de `x/inflation` sont également servis via REST sur le mainnet depuis v3.2.3 (`/qorechain/inflation/v1/params`). REST n'est pas disponible pour `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` ni `xqore`.

:::note
Les valeurs affichées ont été lues en direct sur le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, version **v3.2.4**, appliquée le 23 octobre 2026) le 23 octobre 2026 (valeurs du genesis, sauf si une proposition de gouvernance les a modifiées ; ces cas sont signalés). Elles sont identiques sur le testnet **`qorechain-diana`** (EVM chain ID **9800**, version **v3.2.4** depuis le 19 octobre 2026) sauf indication contraire ; les différences restantes sont regroupées dans [Différences entre testnet et mainnet](#testnet-differences). Les durées exprimées en blocs sont converties au temps de bloc mesuré du mainnet, d'environ 3,2 secondes (le testnet produit un bloc environ chaque seconde).
:::

---

## Module PQC (`x/pqc`)

| Paramètre                  | Valeur                     | Description                                                              |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Les signatures post-quantiques sont le schéma principal                  |
| `allow_classical_fallback` | `false`                    | Le repli en mode classique uniquement est fermé ; les transactions de la voie Cosmos doivent être hybrides |
| `min_security_level`       | `5`                        | Niveau de sécurité NIST minimal pour un algorithme enregistré            |
| `default_migration_blocks` | `1,000,000`                | Durée par défaut d'une migration d'algorithme lancée par la gouvernance (environ 37 jours à des blocs de ≈3,2 s) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (requis)               | Mode d'application : 0=désactivé, 1=optionnel, 2=requis                  |

Le registre des algorithmes (id 1 `dilithium5`, id 2 `mlkem1024`) fait partie de l'état de la chaîne et non d'un paramètre. Les clés sont enregistrées explicitement avec `MsgRegisterPQCKey` ou `MsgRegisterPQCKeyV2` ; il n'existe pas d'enregistrement automatique. Depuis v3.2.3, la chaîne refuse les clés publiques faibles, dégénérées et déjà utilisées, et `MsgRegisterPQCKeyV2` accepte une preuve de possession facultative (`tx pqc register-key-v2 ... --pqc-key <name>`) que la chaîne vérifie lorsqu'elle est présente.

### Limites de la fenêtre d'autorisation EVM {#evm-window-limits}

Les bornes d'une [fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window) sont des constantes du protocole et non des paramètres de module :

| Borne | Valeur |
| ----- | ----- |
| `blocks` maximal | 17,280 (environ 15 heures à des blocs de ≈3,2 s) |
| `max_txs` maximal | 1,000 |
| `max_value` | supérieur à 0 (uqor ; valeur transférée plus les frais maximaux de chaque transaction) |
| `allowed_targets` maximal | 16 adresses de destinataires (périmètre facultatif, v3.2.3) |

Depuis v3.2.3, une fenêtre peut aussi être restreinte avec `native_only` (transferts de QOR natif simples uniquement).

---

## Module IA (`x/ai`)

La configuration du module (`qorechaind query ai config`) :

| Paramètre           | Valeur                 | Description                                                                 |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Score d'anomalie au-delà duquel l'ante handler signale une transaction      |
| `routing_strategy`  | `reputation_weighted`  | Stratégie de routage                                                        |
| `risk_threshold`    | `0.8`                  | Seuil du score de risque                                                    |
| `max_tx_per_minute` | `600`                  | Limite de transactions par émetteur sur la voie Cosmos, comptée sur une fenêtre de 30 blocs (environ 96 s à des blocs de ≈3,2 s ; le nom est historique). Appliquée depuis v3.2.0 ; la valeur par défaut est 10 |

Les poids de scoring de fraude et les seuils de gravité décrits sur la page [Moteur d'IA](/architecture/ai-engine) sont des constantes du détecteur, et non des paramètres de module.

---

## Module Réputation (`x/reputation`)

| Paramètre   | Valeur | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | Poids du score de disponibilité (S\_i) dans la formule de réputation |
| `beta`      | `0.35` | Poids du score de participation (P\_i)               |
| `gamma`     | `0.20` | Poids du score communautaire (C\_i)                  |
| `delta`     | `0.15` | Poids du score d'ancienneté (T\_i)                   |
| `lambda`    | `1000` | Échelle de décroissance temporelle pour les scores historiques |
| `min_score` | `0.10` | Plancher d'un score de réputation                    |

Formule de réputation : `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` avec une décroissance temporelle appliquée aux scores historiques.

---

## Module QCA (`x/qca`)

:::note Implémenté, pas encore actif
La logique CPoS à triple pool est implémentée dans `x/qca` et ces paramètres sont enregistrés on-chain, mais ils ne sont **pas encore intégrés à la production de blocs, aux récompenses, au slashing ni au décompte de la gouvernance**. Le slashing en vigueur est celui du module standard `x/slashing` (voir [Staking, slashing, gouvernance, frais et EVM](#core-modules)). Voir [Mécanisme de consensus](/architecture/consensus-mechanism).
:::

La configuration (`qorechaind query qca config`) :

| Paramètre                       | Valeur              | Description                                           |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | Paramètre du genesis pour la pondération par la réputation |
| `min_reputation_score`          | `0.1`               | Score de réputation minimal                           |
| `pool_classification_interval`  | `1000` blocs        | Blocs entre deux classifications des pools            |
| `pool_weight_rpos`              | `0.40`              | Poids de proposition du pool RPoS                     |
| `pool_weight_dpos`              | `0.35`              | Poids de proposition du pool DPoS                     |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | Délégation minimale pour le pool DPoS (10 000 QOR)  |
| `pool_rep_percentile_rpos`      | `70`                | Percentile de réputation pour le pool RPoS            |
| `bonding_alpha`                 | `0.1`               | Paramètre de la courbe de bonding                     |
| `bonding_beta`                  | `1.0`               | Paramètre de la courbe de bonding                     |
| `bonding_phase_multiplier`      | `1.5`               | Multiplicateur de phase de la courbe de bonding       |
| `slashing_base_rate`            | `0.01`              | Taux de base du slashing progressif                   |
| `slashing_escalation_factor`    | `1.5`               | Facteur d'escalade du slashing progressif             |
| `slashing_max_penalty`          | `0.33`              | Pénalité maximale du slashing progressif              |
| `slashing_decay_halflife`       | `100,000` blocs     | Demi-vie de décroissance du slashing progressif       |
| `qdrw_enabled`                  | `false`             | Le décompte QDRW est désactivé                        |
| `qdrw_xqore_multiplier`         | `2.0`               | Poids de xQORE dans la formule QDRW                   |
| `qdrw_rep_min_multiplier`       | `0.5`               | Borne inférieure du multiplicateur de réputation      |
| `qdrw_rep_max_multiplier`       | `2.0`               | Borne supérieure du multiplicateur de réputation      |

---

## Module Burn (`x/burn`)

| Paramètre              | Valeur                       | Description                                           |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Fraction du collecteur de frais brûlée                |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Frais de burn forfaitaires pour la création d'un contrat |
| `ai_service_burn_rate` | `0.50`                       | Fraction des frais des services d'IA brûlée           |
| `bridge_burn_rate`     | `1.00`                       | Fraction des frais de bridge brûlée                   |
| `failed_tx_burn_rate`  | `0.10`                       | Fraction du gas des transactions échouées brûlée (appliquée par la chaîne depuis v3.2.2) |
| `validator_share`      | `0.37`                       | Fraction distribuée aux validateurs                   |
| `treasury_share`       | `0.20`                       | Fraction envoyée à la trésorerie                      |
| `staker_share`         | `0.10`                       | Fraction distribuée aux stakers                       |
| `light_node_share`     | `0.03`                       | Fraction distribuée aux nœuds légers                  |
| `enabled`              | `true`                       | Indicateur d'activation du module                     |

La répartition des frais est de **37 / 30 / 20 / 10 / 3** entre validateurs, burn, trésorerie, stakers et nœuds légers ; les parts doivent totaliser `1.00`. Un `milestone_burn_schedule` existe également. Voir [Tokenomics](/architecture/tokenomics).

---

## Module xQORE (`x/xqore`)

:::caution Pas encore disponible on-chain
La comptabilité du module xQORE existe, mais les transactions de verrouillage et de déverrouillage, les requêtes et les commandes CLI **ne sont pas encore intégrées aux réseaux en production** : aucun QOR ne peut actuellement être verrouillé et aucun xQORE n'a été émis. Les valeurs ci-dessous correspondent à la configuration du genesis.
:::

| Paramètre                 | Valeur                 | Description                                          |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | Multiplicateur de pouvoir de vote pour les détenteurs de xQORE |
| `min_lock_amount`         | `1,000,000 uqor`       | Montant minimal à verrouiller (1 QOR)                |
| `penalty_burn_rate`       | `0.0`                  | Fraction des pénalités de sortie brûlée (toutes sont redistribuées) |
| `rebase_interval`         | `100` blocs            | Blocs entre deux événements de rebase PvP            |
| `enabled`                 | `true`                 | Indicateur d'activation du module                    |

Pénalités de sortie : 50 % (verrouillage de moins de 30 jours), 35 % (30–90 jours), 15 % (90–180 jours), 0 % (plus de 180 jours). Multiplicateurs de verrouillage : 1,0 / 1,2 / 1,4 / 1,7 / 2,0 à 0 / 90 / 180 / 365 / 730 jours.

---

## Module Inflation (`x/inflation`)

| Paramètre              | Valeur                  | Description                                           |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (historique) ou `fixed` (depuis v3.1.94)   |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86 000 QOR) | Émis par époque en mode fixe (16 239 QOR avant la proposition de gouvernance 10, 19 octobre 2026) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590 000 000 QOR) | Plafond cumulé strict (114 285 714 QOR avant la proposition 10) |
| `epoch_length`         | `43,200` blocs          | Blocs par époque (environ 38,6 heures à des blocs de ≈3,2 s) |
| `schedule`             | 17,5 %, 11 %, 7 %, 7 %, 2 % | Taux annuels historiques, inutilisés en mode fixe |
| `enabled`              | `true`                  | Indicateur d'activation du module                     |

Le module émet cette émission vers le collecteur de frais jusqu'à ce que le plafond soit atteint. La première époque à 86 000 QOR commence au bloc 3,672,000. Le 23 octobre 2026 (époque 86), 105 420 896,21 QOR avaient été émis et il restait 484 579 103,79 QOR sous le plafond (`GET /qorechain/inflation/v1/epoch_info`). Voir [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## Module Consensus RL (`x/rlconsensus`)

Le module `x/rlconsensus` implémente **PRISM**, la couche d'optimisation par apprentissage par renforcement. Sur les deux réseaux, il est en mode observation : aucun poids de politique n'est chargé, il n'ajuste donc rien. Les quatre messages de contrôle de PRISM sont désactivés par le disjoncteur sur le mainnet (voir [État du disjoncteur](#circuit-breaker)).

| Paramètre                        | Valeur         | Description                                                   |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Indicateur d'activation du module                             |
| `observation_interval`           | `10`           | Blocs entre les échantillons d'observation de PRISM           |
| `agent_mode`                     | `1` (conservative) | Mode de l'agent : 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | Changement de paramètre maximal par action en mode conservative |
| `max_change_autonomous`          | `0.25`         | Changement de paramètre maximal par action en mode autonomous |
| `circuit_breaker_window`         | `50`           | Fenêtre du disjoncteur                                        |
| `circuit_breaker_threshold`      | `0.50`         | Seuil du disjoncteur                                          |
| `reward_weight_throughput`       | `0.30`         | Poids de récompense pour le débit                             |
| `reward_weight_finality`         | `0.25`         | Poids de récompense pour la finalité                          |
| `reward_weight_decentralization` | `0.20`         | Poids de récompense pour la décentralisation                  |
| `reward_weight_mev`              | `0.15`         | Poids de récompense pour le MEV                               |
| `reward_weight_failed_txs`       | `0.10`         | Poids de récompense pour les transactions échouées            |
| `default_block_time_ms`          | `5000`         | Temps de bloc par défaut dans la base d'observation (et non le temps de bloc réel) |
| `default_base_gas_price`         | `100`          | Prix de base du gas par défaut dans la base d'observation     |
| `default_validator_set_size`     | `100`          | Taille par défaut de l'ensemble de validateurs dans la base d'observation |

---

## Module Bridge (`x/bridge`)

:::caution Pas en production
Les 37 configurations de chaînes sont en statut `pending`, aucun validateur de bridge n'est enregistré, aucune opération de bridge n'a été créée et aucun canal IBC n'est ouvert sur l'un ou l'autre réseau. Voir [Architecture du bridge](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config` :

| Paramètre                  | Valeur                      | Description                                       |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Validateurs requis pour l'ensemble d'attestation  |
| `attestation_threshold`    | `7`                         | Attestations requises                             |
| `challenge_period_secs`    | `86400`                     | Période de contestation (24 heures)               |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100 000 QOR) | Les transferts supérieurs à ce montant attendent la fin de la période de contestation |
| `enabled`                  | `true`                      | Indicateur d'activation du module                 |

Les paramètres propres à chaque chaîne (`min_confirmations`, `max_single_transfer`, `daily_limit`) se trouvent dans la configuration de chaque chaîne, et non dans les paramètres du module.

---

## Module Multicouche (`x/multilayer`)

| Paramètre                      | Valeur           | Description                                       |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10`             | Nombre maximal de sidechains enregistrées         |
| `max_paychains`                | `50`             | Nombre maximal de paychains enregistrées          |
| `min_anchor_interval`          | `100`            | Intervalle d'ancrage minimal (blocs)              |
| `max_anchor_interval`          | `1000`           | Intervalle d'ancrage maximal (blocs)              |
| `default_challenge_period`     | `86400` s        | Période de contestation par défaut (1 jour)       |
| `min_sidechain_stake`          | `1,000,000,000`  | Stake minimal pour enregistrer une sidechain (1 000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Stake minimal pour enregistrer une paychain (100 QOR) |
| `routing_enabled`              | `true`           | Routage inter-couches activé                      |
| `routing_confidence_threshold` | `0.6`            | Seuil de confiance pour le routage automatique    |
| `cross_layer_fee_bundling`     | `true`           | Un seul paiement de frais peut couvrir plusieurs couches |

---

## Module Cross-VM (`x/crossvm`)

| Paramètre             | Valeur  | Description                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Taille maximale d'un message cross-VM en octets (64 Ko) |
| `max_queue_size`      | `1000`  | Nombre maximal de messages en attente dans la file cross-VM |
| `queue_timeout_blocks`| `100`   | Blocs avant l'expiration d'un message en attente |
| `enabled`             | `true`  | Indicateur d'activation du module              |

`MsgCrossVMCall` est désactivé sur le mainnet par le disjoncteur (activé sur le testnet).

---

## Module SVM (`x/svm`)

Valeurs du genesis :

| Paramètre               | Valeur       | Description                                  |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Taille binaire maximale d'un programme en octets (10 Mo) |
| `max_account_data_size` | `10485760`   | Taille maximale des données d'un compte en octets (10 Mo) |
| `compute_budget_max`    | `1400000`    | Unités de calcul maximales par transaction (1,4 M) |
| `lamports_per_byte`     | `3480`       | Coût de loyer par octet en lamports          |
| `rent_exemption_multi`  | `2.0`        | Années de loyer requises pour l'exemption    |
| `enabled`               | `true`       | Indicateur d'activation du module            |
| `svm_slot_offset`       | `0`          | Décalage de slot                             |
| `default_sig_scheme`    | `0`          | Schéma de signature par défaut               |
| `max_cpi`               | `4`          | Profondeur maximale d'invocation inter-programmes |

La voie de transactions SVM est désactivée sur l'ensemble du réseau (voir [Réseaux](/appendix/networks)).

---

## Module RDK (`x/rdk`)

`qorechaind query rdk config` :

| Paramètre                   | Valeur               | Description                                   |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100`                | Nombre maximal de rollups enregistrés         |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Stake minimal d'un opérateur (10 000 QOR)     |
| `rollup_creation_burn_rate` | `0.01`               | Fraction du stake de création brûlée (1 %)    |
| `default_challenge_window`  | `604,800` s          | Fenêtre de contestation par défaut (7 jours)  |
| `max_da_blob_size`          | `2,097,152`          | Taille maximale d'un blob DA en octets (2 Mo) |
| `blob_retention_blocks`     | `432,000`            | Blocs de conservation des blobs DA (environ 16 jours à des blocs de ≈3,2 s) |
| `max_batches_per_block`     | `10`                 | Nombre maximal de lots traités par bloc       |

Aucun rollup n'a encore été créé sur l'un ou l'autre réseau.

---

## Module FairBlock (`x/fairblock`)

Valeurs du genesis (le module n'a pas de service de requête, elles ne peuvent donc pas être relues en direct) :

| Paramètre            | Valeur  | Description                                 |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | Le chiffrement tIBE de FairBlock est désactivé |
| `tibe_threshold`     | `5`     | Nombre minimal de parts de clé de déchiffrement requises |
| `decryption_delay`   | `3`     | Blocs après finalisation avant déchiffrement |
| `max_encrypted_size` | `65536` | Taille maximale de la charge utile chiffrée en octets |

---

## Module d'abstraction du gas (`x/gasabstraction`)

Configuration du genesis (`enabled = true`, `native_denom = uqor`) :

| Dénomination du jeton | Taux de conversion | Description            |
| --------------------- | ------------------ | ---------------------- |
| `uqor`                | `1.0`              | Jeton natif QOR (1:1)  |
| `ibc/USDC`            | `1.0`              | USDC ponté via IBC     |
| `ibc/ATOM`            | `10.0`             | ATOM ponté via IBC     |

Le taux de conversion est le taux utilisé lors de la conversion de frais payés dans ce jeton.

:::note Aucun canal IBC n'est ouvert
Aucun canal IBC n'est ouvert sur l'un ou l'autre réseau, donc aucun `ibc/USDC` ni `ibc/ATOM` ne peut encore exister ; les frais sont payés en `uqor`.
:::

---

## Module Nœud léger (`x/lightnode`)

| Paramètre                | Valeur             | Description                                          |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Frais d'enregistrement d'un nœud léger         |
| `heartbeat_interval`     | `1000` blocs       | Blocs entre deux heartbeats requis (environ 54 minutes à des blocs de ≈3,2 s) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1 000 QOR) | Stake minimal délégué par l'opérateur |
| `reward_share`           | `0.03`             | Part du collecteur de frais réservée aux nœuds légers |
| `min_uptime_for_rewards` | `0.80`             | Fraction de disponibilité minimale pour être éligible aux récompenses |
| `max_light_nodes`        | `10,000`           | Nombre maximal de nœuds légers enregistrés           |
| `heartbeat_grace_period` | `100` blocs        | Période de grâce pour un heartbeat en retard         |

La comptabilité des récompenses est active. `GET /qorechain/lightnode/v1/reward_pool` indique le pool (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) et la borne de récompense par nœud. Depuis v3.2.3, cette borne est `max_reward_per_month_per_node`, soit **2 000 QOR (`2000000000` uqor) par nœud et par période de 30 jours**, calculée au prorata du temps de bloc et pondérée par la disponibilité du nœud ; l'ancienne valeur par bloc (`max_reward_per_block_per_node`, `1713` uqor) est toujours indiquée. Le 20 octobre 2026, le pool détenait une réserve de 487,2318 QOR, sans montant en attente. L'enregistrement est ouvert et soumis à licence : six licences `lightnode_operator` ont été accordées sur le mainnet et aucun nœud léger ne s'est encore enregistré (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). Voir [Nœud léger](/light-node/overview#reward-program-status) et [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## Module AMM (`x/amm`)

| Paramètre               | Valeur                        | Description                         |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Frais de swap (0,30 %)              |
| `protocol_fee_bps`      | `10`                          | Part des frais de protocole (0,10 %) |
| `min_liquidity`         | `1000`                        | Liquidité minimale                  |
| `max_pools_per_creator` | `50`                          | Nombre maximal de pools par créateur |
| `lp_token_decimals`     | `6`                           | Décimales du jeton LP               |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Frais de création d'un pool         |
| `max_swap_impact_bps`   | `500`                         | Impact de prix maximal d'un swap (5 %) |
| `enabled`               | `true`                        | Indicateur d'activation du module   |

Aucun pool n'existe encore sur le mainnet ni sur le testnet, et `MsgPausePool` / `MsgResumePool` sont désactivés sur le mainnet.

---

## Comptes intelligents (`x/abstractaccount`)

:::caution Désactivé sur les deux réseaux
`enabled` vaut `false` : l'enregistrement d'un authentificateur, l'exécution via un authentificateur et la création d'un compte intelligent sont tous refusés tant que le module est désactivé. Vérifiez `GET /qorechain/abstractaccount/v1/config` avant de construire sur ces fonctionnalités.
:::

| Paramètre             | Valeur   | Description                      |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false`  | Indicateur d'activation du module |
| `max_session_keys`    | `10`     | Nombre maximal de clés de session par compte |
| `max_spending_rules`  | `5`      | Nombre maximal de règles de dépense |
| `default_session_ttl` | `86400` s| Durée de vie par défaut d'une clé de session |

---

## Staking, slashing, gouvernance, frais et EVM {#core-modules}

Modules standard du Cosmos SDK et de l'EVM, lus en direct le 23 octobre 2026 pour les lignes de staking, de slashing, de gouvernance et de distribution (les lignes de fee-market, d'EVM, d'ERC-20 et de QoreChain Native ont été lues pour la dernière fois le 20 octobre 2026) ; identiques sur les deux réseaux sauf indication contraire et inchangés par la mise à niveau v3.2.4.

| Module | Paramètre | Valeur |
| --- | --- | --- |
| Staking | `unbonding_time` | 1,814,400 s (21 jours) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 blocs (environ 8,9 heures à des blocs de ≈3,2 s) |
| | `min_signed_per_window` | 5 % (un validateur qui signe moins de 5 % de la fenêtre est jailed) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| Gouvernance | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | 172,800 s (2 jours) chacun |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Distribution | `community_tax` | 0.02 |
| Marché des frais | `min_gas_price` | 0,1 uqor par gas |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 décimales) |
| | accès à la création / à l'appel de contrats | sans permission |
| | `active_static_precompiles` | vide (aucun precompile EVM n'est actif) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## État du disjoncteur {#circuit-breaker}

La chaîne peut désactiver des types de messages individuels grâce au disjoncteur du Cosmos SDK, contrôlé par le compte d'opérations de la fondation et par la gouvernance. Un type de message désactivé est rejeté au niveau de l'ante handler sur toutes les voies. La liste en direct se trouve à `GET /cosmos/circuit/v1/disable_list`.

**Mainnet (20 octobre 2026, 16 entrées, inchangées depuis le 14 octobre) :** création de comptes de vesting (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`) ; QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2` ; AMM `MsgPausePool`, `MsgResumePool` ; `crossvm.MsgCrossVMCall` ; `multilayer.MsgUpdateLayerStatus` ; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm` ; et les quatre messages de contrôle de PRISM (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). La voie EVM (`MsgEthereumTx`) est **ouverte** : elle a été désactivée du 16 au 25 septembre et rouverte par la mise à niveau v3.2.0.

**Testnet (20 octobre 2026) :** uniquement les trois messages QoreChain Native.

Tous les autres types de messages, y compris l'ensemble des messages standard de bank, staking, gouvernance, distribution, authz et d'enregistrement `x/pqc`, sont activés. La liste est contrôlée par la gouvernance et peut changer ; interrogez-la toujours.

---

## Différences entre testnet et mainnet {#testnet-differences}

Les deux réseaux exécutent la v3.2.4 : le testnet `qorechain-diana` depuis la hauteur 8,337,253 (19 octobre 2026), le mainnet `qorechain-vladi` depuis la hauteur 3,742,566 (23 octobre 2026, proposition de gouvernance 13). Les ajouts de la v3.2.4 sont donc les mêmes sur les deux réseaux : le module facultatif de staking à verrouillage temporel `x/stakingtier` (49 modules au lieu de 48 ; `GET /qorechain/stakingtier/v1/params`, verrouillage minimal de 10 QOR, pénalité de déverrouillage anticipé de 5 %), un troisième `emission_mode` (`target_apy`, avec `target_apy_bps` à `0` sur les deux réseaux), une treizième source de burn enregistrée (`staking_tier_penalty`), des champs de reporting supplémentaires pour le pool de récompenses des light nodes (`monthly_cap_active`, `last_distribution_time`, `last_distribution_height`) avec une borne de récompense qui commence à l'enregistrement propre du nœud, l'indicateur `possession_proven` sur les comptes PQC (la preuve de possession reste facultative pour les clés de compte et requise pour les clés de validateur de bridge), la fenêtre de contestation RDK comptée en temps de bloc, et les requêtes `protocol_features` et `auth_nonce`. Voir [Staking et délégation](/user-guide/staking-and-delegation#time-locked-staking). Au 23 octobre 2026, les deux réseaux ne diffèrent que par les valeurs ci-dessous.

Ces valeurs sont propres au testnet :

| Domaine | Testnet |
| ---- | ------- |
| Valeurs de `x/inflation` | Valeurs d'émission antérieures (16 239 QOR par époque, plafond de 114 285 714 QOR, déjà atteint) ; le mainnet utilise les valeurs fixées par la proposition de gouvernance 10. |
| Disjoncteur | Uniquement les trois messages QoreChain Native (voir ci-dessus). |

Tous les paramètres non listés ici sont identiques sur les deux réseaux.
