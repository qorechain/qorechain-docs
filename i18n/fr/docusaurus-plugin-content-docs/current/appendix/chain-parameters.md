---
slug: /appendix/chain-parameters
title: Paramètres de la chaîne
sidebar_label: Paramètres de la chaîne
sidebar_position: 2
---

# Paramètres de la chaîne

Référence consolidée de tous les paramètres de module configurables dans le genesis de QoreChain. Les paramètres sont regroupés par module et peuvent être interrogés à l'exécution avec `qorechaind query <module> params`.

:::note
Les valeurs affichées sont les valeurs par défaut du genesis déployé. Les paramètres s'appliquent au mainnet **`qorechain-vladi`** (EVM chain ID **9801**) et au testnet **`qorechain-diana`** (EVM chain ID **9800**), sauf indication contraire.
:::

---

## Module PQC (`x/pqc`)

| Paramètre                   | Type   | Valeur par défaut      | Description                                                            |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (requis)           | Mode d'application : 0=désactivé, 1=optionnel, 2=requis (défaut actuel) |
| `allow_classical_fallback`  | bool   | `false`                | Le repli en mode classique uniquement est fermé ; les transactions cosmos doivent être hybrides |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | Algorithmes PQC enregistrés avec contraintes de taille                 |
| `auto_register_enabled`     | bool   | `true`                 | Enregistre automatiquement les clés PQC à la première transaction hybride |
| `migration_deadline_height` | uint64 | `0`                    | Hauteur de bloc après laquelle les clés classiques uniquement sont rejetées (0=désactivé) |
| `migration_grace_period`    | uint64 | `100000`               | Blocs d'avertissement avant l'échéance de migration                    |

---

## Module IA (`x/ai`)

| Paramètre                  | Type   | Valeur par défaut | Description                                       |
| -------------------------- | ------ | ----------------- | ------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`            | Poids de l'anomalie de volume dans le scoring de fraude |
| `anomaly_weight_velocity`  | string | `0.25`            | Poids de l'anomalie de vélocité dans le scoring de fraude |
| `anomaly_weight_pattern`   | string | `0.25`            | Poids de l'anomalie de motif dans le scoring de fraude |
| `anomaly_weight_network`   | string | `0.20`            | Poids de l'anomalie de graphe réseau dans le scoring de fraude |
| `fraud_threshold_low`      | string | `0.30`            | Seuil de score pour une alerte de faible gravité  |
| `fraud_threshold_medium`   | string | `0.55`            | Seuil de score pour une alerte de gravité moyenne |
| `fraud_threshold_high`     | string | `0.75`            | Seuil de score pour une alerte de gravité élevée  |
| `fraud_threshold_critical` | string | `0.90`            | Seuil de score pour une alerte de gravité critique |
| `circuit_breaker_enabled`  | bool   | `true`            | Active les disjoncteurs QCAI                       |

---

## Module Réputation (`x/reputation`)

| Paramètre      | Type   | Valeur par défaut | Description                                          |
| -------------- | ------ | ----------------- | ---------------------------------------------------- |
| `alpha`        | string | `0.30`            | Poids du score de disponibilité (S\_i) dans la formule de réputation |
| `beta`         | string | `0.25`            | Poids du score de participation (P\_i)              |
| `gamma`        | string | `0.25`            | Poids du score communautaire (C\_i)                 |
| `delta`        | string | `0.20`            | Poids du score d'ancienneté (T\_i)                  |
| `decay_lambda` | string | `0.01`            | Facteur de décroissance temporelle exponentielle pour les scores historiques |

Formule de réputation : `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` avec une décroissance temporelle exponentielle appliquée par époque.

---

## Module QCA (`x/qca`)

| Paramètre                      | Type   | Valeur par défaut | Description                                    |
| ------------------------------ | ------ | ----------------- | ---------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`            | Poids de proposition de bloc pour le pool Emerald |
| `sapphire_pool_weight`         | string | `0.30`            | Poids de proposition de bloc pour le pool Sapphire |
| `ruby_pool_weight`             | string | `0.20`            | Poids de proposition de bloc pour le pool Ruby |
| `emerald_min_reputation`       | string | `0.80`            | Score de réputation minimal pour le pool Emerald |
| `sapphire_min_reputation`      | string | `0.50`            | Score de réputation minimal pour le pool Sapphire |
| `bonding_curve_base_rate`      | string | `0.05`            | Taux de base pour la courbe de bonding du staking |
| `bonding_curve_multiplier`     | string | `1.50`            | Multiplicateur pour la progression de la courbe de bonding |
| `slashing_downtime_window`     | int64  | `10000`           | Blocs pour évaluer l'indisponibilité           |
| `slashing_downtime_threshold`  | string | `0.05`            | Fraction minimale de blocs signés avant slashing |
| `slashing_downtime_penalty`    | string | `0.01`            | Fraction de slash pour indisponibilité         |
| `slashing_double_sign_penalty` | string | `0.05`            | Fraction de slash pour double signature        |
| `qdrw_enabled`                 | bool   | `true`            | Active la pondération dynamique des récompenses |
| `qdrw_throughput_weight`       | string | `0.40`            | Poids QDRW pour la métrique de débit           |
| `qdrw_latency_weight`          | string | `0.30`            | Poids QDRW pour la métrique de latence         |
| `qdrw_security_weight`         | string | `0.20`            | Poids QDRW pour la métrique de sécurité        |
| `qdrw_decentralization_weight` | string | `0.10`            | Poids QDRW pour la métrique de décentralisation |
| `qdrw_adjustment_cap`          | string | `0.10`            | Ajustement QDRW maximal sur une seule époque   |
| `qdrw_adjustment_interval`     | int64  | `100`             | Blocs entre les ajustements QDRW               |

---

## Module Burn (`x/burn`)

| Paramètre           | Type   | Valeur par défaut | Description                                       |
| ------------------- | ------ | ----------------- | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`            | Active le mécanisme de burn des frais             |
| `validator_share`   | string | `0.37`            | Fraction des frais distribuée aux validateurs de blocs |
| `burn_share`        | string | `0.30`            | Fraction des frais brûlée de façon permanente     |
| `treasury_share`    | string | `0.20`            | Fraction des frais envoyée à la trésorerie communautaire |
| `staker_share`      | string | `0.10`            | Fraction des frais distribuée aux délégateurs     |
| `light_node_share`  | string | `0.03`            | Fraction des frais distribuée aux nœuds légers    |

Les parts doivent totaliser `1.00`. La répartition des frais est de **37 / 30 / 20 / 10 / 3** entre validateurs, burn, trésorerie, stakers et nœuds légers.

---

## Module xQORE (`x/xqore`)

| Paramètre            | Type   | Valeur par défaut | Description                                   |
| -------------------- | ------ | ----------------- | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor`     | Montant minimal à verrouiller en xQORE        |
| `min_lock_duration`  | string | `7d`              | Durée de verrouillage minimale                |
| `max_lock_duration`  | string | `365d`            | Durée de verrouillage maximale                |
| `penalty_tier_1_pct` | string | `0.50`            | Pénalité de déverrouillage anticipé : 0-25 % du verrouillage écoulé |
| `penalty_tier_2_pct` | string | `0.30`            | Pénalité de déverrouillage anticipé : 25-50 % du verrouillage écoulé |
| `penalty_tier_3_pct` | string | `0.15`            | Pénalité de déverrouillage anticipé : 50-75 % du verrouillage écoulé |
| `penalty_tier_4_pct` | string | `0.05`            | Pénalité de déverrouillage anticipé : 75-100 % du verrouillage écoulé |
| `pvp_rebase_enabled` | bool   | `true`            | Active la redistribution par rebase PvP       |

---

## Module Inflation (`x/inflation`)

| Paramètre         | Type   | Valeur par défaut      | Description                                      |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | Blocs par époque d'inflation                     |
| `blocks_per_year` | uint64 | `6311520`              | Estimation des blocs par an (pour le calcul du taux) |
| `initial_rate`    | string | `0.08`                 | Paramètre de taux d'émission annualisé initial   |
| `rate_decay`      | string | `0.05`                 | Facteur de décroissance appliqué chaque année    |
| `min_rate`        | string | `0.02`                 | Paramètre de taux d'émission plancher            |
| `max_supply`      | string | `1000000000000000uqor` | Plafond d'offre maximale de jetons               |

:::note
Les paramètres `x/inflation` ci-dessus sont les valeurs par défaut du mécanisme déployé. Selon le modèle économique canonique **tokenomics v2.1**, QoreChain dispose d'une **offre fixe** avec un **budget d'émission fini (pool de 590M)** qui finance les récompenses de staking et d'écosystème. Les valeurs `initial_rate` / `rate_decay` / `min_rate` sont des détails de mécanisme qui régissent la manière dont les émissions sont planifiées au sein de ce budget fini — elles ne constituent **pas** une inflation en pourcentage illimitée de l'offre totale.
:::

---

## Module Consensus RL (`x/rlconsensus`)

Le module `x/rlconsensus` implémente **PRISM**, la couche d'optimisation par apprentissage par renforcement du moteur de consensus de QoreChain.

| Paramètre                    | Type   | Valeur par défaut | Description                                     |
| ---------------------------- | ------ | ----------------- | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`              | Blocs entre les échantillons d'observation de PRISM |
| `agent_mode`                 | uint   | `0`               | Mode de l'agent : 0=off, 1=observer, 2=suggérer, 3=auto |
| `circuit_breaker_enabled`    | bool   | `true`            | Active le disjoncteur de PRISM                   |
| `circuit_breaker_max_change` | string | `0.10`            | Changement de paramètre maximal par action (10 %) |
| `circuit_breaker_cooldown`   | uint64 | `100`             | Blocs d'attente après déclenchement du disjoncteur |
| `reward_throughput_weight`   | string | `0.40`            | Poids de récompense pour le débit               |
| `reward_latency_weight`      | string | `0.30`            | Poids de récompense pour la latence             |
| `reward_security_weight`     | string | `0.20`            | Poids de récompense pour la sécurité            |
| `reward_stability_weight`    | string | `0.10`            | Poids de récompense pour la stabilité           |
| `ppo_learning_rate`          | string | `0.0003`          | Taux d'apprentissage PPO                        |
| `ppo_clip_range`             | string | `0.20`            | Plage de clipping PPO                           |

---

## Module Bridge (`x/bridge`)

| Paramètre                       | Type   | Valeur par défaut | Description                                     |
| ------------------------------- | ------ | ----------------- | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`               | Confirmations minimales pour les transferts IBC |
| `min_confirmations_ethereum`    | uint64 | `12`              | Confirmations minimales pour le bridge Ethereum |
| `min_confirmations_bitcoin`     | uint64 | `6`               | Confirmations minimales pour le bridge Bitcoin  |
| `circuit_breaker_enabled`       | bool   | `true`            | Active le disjoncteur du bridge                 |
| `circuit_breaker_max_daily_usd` | string | `10000000`        | Volume de bridge quotidien maximal (équivalent USD) |
| `circuit_breaker_max_single_tx` | string | `1000000`         | Montant de transfert unique maximal (équivalent USD) |

---

## Module Multicouche (`x/multilayer`)

| Paramètre                   | Type   | Valeur par défaut  | Description                                       |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | Nombre maximal de sidechains enregistrées         |
| `max_paychains`             | uint   | `50`               | Nombre maximal de paychains enregistrées          |
| `anchor_interval_sidechain` | uint64 | `100`              | Intervalle d'ancrage obligatoire pour les sidechains (blocs) |
| `anchor_interval_paychain`  | uint64 | `50`               | Intervalle d'ancrage obligatoire pour les paychains (blocs) |
| `challenge_period`          | string | `7d`               | Durée des contestations de fraude sur les ancres  |
| `min_sidechain_stake`       | string | `1000000000uqor`   | Stake minimal pour enregistrer une sidechain (1 000 QOR) |
| `min_paychain_stake`        | string | `100000000uqor`    | Stake minimal pour enregistrer une paychain (100 QOR) |
| `routing_threshold`         | string | `0.80`             | Seuil de charge déclenchant le routage automatique |

---

## Module Cross-VM (`x/crossvm`)

| Paramètre          | Type   | Valeur par défaut | Description                                    |
| ------------------ | ------ | ----------------- | ---------------------------------------------- |
| `max_message_size` | uint64 | `65536`           | Taille maximale d'un message cross-VM en octets (64 Ko) |
| `max_queue_size`   | uint   | `1000`            | Nombre maximal de messages en attente dans la file cross-VM |
| `queue_timeout`    | uint64 | `100`             | Blocs avant l'expiration d'un message en attente |

---

## Module SVM (`x/svm`)

| Paramètre                     | Type   | Valeur par défaut | Description                                  |
| ----------------------------- | ------ | ----------------- | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`        | Taille binaire maximale d'un programme en octets (10 Mo) |
| `compute_budget`              | uint64 | `1400000`         | Unités de calcul par défaut par transaction (1,4 M) |
| `rent_lamports_per_byte_year` | uint64 | `3480`            | Coût de loyer annuel par octet en lamports   |
| `rent_exemption_threshold`    | string | `2.0`             | Années de loyer requises pour l'exemption    |
| `max_accounts_per_tx`         | uint   | `64`              | Nombre maximal de comptes référencés par transaction |

---

## Module RDK (`x/rdk`)

| Paramètre             | Type   | Valeur par défaut                  | Description                              |
| --------------------- | ------ | ---------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                              | Nombre maximal de rollups enregistrés    |
| `min_stake`           | string | `10000000000uqor`                  | Stake minimal d'un opérateur (10 000 QOR) |
| `burn_rate`           | string | `0.01`                             | Pourcentage des frais de rollup brûlés (1 %) |
| `challenge_window`    | string | `7d`                               | Durée de la fenêtre de contestation de fraude |
| `max_blob_size`       | uint64 | `2097152`                          | Taille maximale d'un blob DA en octets (2 Mo) |
| `blob_retention`      | uint64 | `432000`                           | Blocs de conservation des blobs DA avant élagage |
| `max_batches_pending` | uint   | `10`                               | Nombre maximal de lots non finalisés par rollup |
| `auto_finalize`       | bool   | `true`                             | Active la finalisation automatique par EndBlocker |
| `settlement_types`    | array  | optimistic, zk, based, sovereign   | Paradigmes de règlement autorisés        |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | Préréglages de rollup disponibles     |

---

## Module FairBlock (`x/fairblock`)

| Paramètre            | Type   | Valeur par défaut | Description                                 |
| -------------------- | ------ | ----------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`           | Active le chiffrement tIBE de FairBlock     |
| `tibe_threshold`     | uint   | `2`               | Nombre minimal de parts de clé de déchiffrement requises |
| `decryption_delay`   | uint64 | `1`               | Blocs après finalisation avant déchiffrement |
| `max_encrypted_size` | uint64 | `4096`            | Taille maximale de la charge utile chiffrée en octets |

---

## Module d'abstraction du gas (`x/gasabstraction`)

| Paramètre         | Type  | Valeur par défaut | Description                                           |
| ----------------- | ----- | ----------------- | ----------------------------------------------------- |
| `accepted_tokens` | array | (voir ci-dessous) | Jetons acceptés pour le paiement du gas avec taux de conversion |

**Jetons acceptés par défaut :**

| Dénomination du jeton | Taux de conversion | Description            |
| --------------------- | ------------------ | ---------------------- |
| `uqor`                | `1.0`              | Jeton natif QOR (1:1)  |
| `ibc/USDC`            | `1.0`              | USDC ponté via IBC     |
| `ibc/ATOM`            | `10.0`             | ATOM ponté via IBC     |

Les taux de conversion représentent le nombre d'unités de gas par unité de jeton. Des taux plus élevés signifient que chaque unité de jeton couvre davantage de gas.
