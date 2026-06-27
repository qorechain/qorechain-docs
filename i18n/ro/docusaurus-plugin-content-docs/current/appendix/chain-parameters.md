---
slug: /appendix/chain-parameters
title: Parametrii lanțului
sidebar_label: Parametrii lanțului
sidebar_position: 2
---

# Parametrii lanțului

Referință consolidată a tuturor parametrilor de modul configurabili din genesis-ul QoreChain. Parametrii sunt grupați pe module și pot fi interogați în timpul execuției cu `qorechaind query <module> params`.

:::note
Valorile afișate sunt valorile implicite de genesis implementate. Parametrii se aplică pe mainnet **`qorechain-vladi`** (EVM chain ID **9801**) și pe testnet **`qorechain-diana`** (EVM chain ID **9800**), cu excepția cazurilor menționate altfel.
:::

---

## Modulul PQC (`x/pqc`)

| Parametru                   | Tip    | Valoare implicită      | Descriere                                                              |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (required)         | Mod de aplicare: 0=dezactivat, 1=opțional, 2=obligatoriu (implicit curent) |
| `allow_classical_fallback`  | bool   | `false`                | Fallback-ul exclusiv clasic este închis; tranzacțiile cosmos trebuie să fie hibride |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | Algoritmi PQC înregistrați cu constrângeri de dimensiune              |
| `auto_register_enabled`     | bool   | `true`                 | Înregistrare automată a cheilor PQC la prima tranzacție hibridă       |
| `migration_deadline_height` | uint64 | `0`                    | Înălțimea blocului după care cheile exclusiv clasice sunt respinse (0=dezactivat) |
| `migration_grace_period`    | uint64 | `100000`               | Blocuri de avertizare înainte de termenul-limită de migrare           |

---

## Modulul AI (`x/ai`)

| Parametru                  | Tip    | Valoare implicită | Descriere                                          |
| -------------------------- | ------ | ----------------- | ------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`            | Pondere pentru anomalia de volum în scorarea fraudei |
| `anomaly_weight_velocity`  | string | `0.25`            | Pondere pentru anomalia de viteză în scorarea fraudei |
| `anomaly_weight_pattern`   | string | `0.25`            | Pondere pentru anomalia de tipar în scorarea fraudei |
| `anomaly_weight_network`   | string | `0.20`            | Pondere pentru anomalia de graf de rețea în scorarea fraudei |
| `fraud_threshold_low`      | string | `0.30`            | Prag de scor pentru alertă de severitate scăzută  |
| `fraud_threshold_medium`   | string | `0.55`            | Prag de scor pentru alertă de severitate medie    |
| `fraud_threshold_high`     | string | `0.75`            | Prag de scor pentru alertă de severitate ridicată |
| `fraud_threshold_critical` | string | `0.90`            | Prag de scor pentru alertă de severitate critică  |
| `circuit_breaker_enabled`  | bool   | `true`            | Activează întrerupătoarele de circuit QCAI        |

---

## Modulul Reputation (`x/reputation`)

| Parametru      | Tip    | Valoare implicită | Descriere                                            |
| -------------- | ------ | ----------------- | ---------------------------------------------------- |
| `alpha`        | string | `0.30`            | Pondere pentru scorul de uptime (S\_i) în formula de reputație |
| `beta`         | string | `0.25`            | Pondere pentru scorul de participare (P\_i)          |
| `gamma`        | string | `0.25`            | Pondere pentru scorul comunitar (C\_i)               |
| `delta`        | string | `0.20`            | Pondere pentru scorul de vechime (T\_i)              |
| `decay_lambda` | string | `0.01`            | Factor de decădere exponențială în timp pentru scorurile istorice |

Formula de reputație: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` cu decădere exponențială în timp aplicată per epocă.

---

## Modulul QCA (`x/qca`)

| Parametru                      | Tip    | Valoare implicită | Descriere                                      |
| ------------------------------ | ------ | ----------------- | ---------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`            | Pondere de propunere a blocurilor pentru pool-ul Emerald |
| `sapphire_pool_weight`         | string | `0.30`            | Pondere de propunere a blocurilor pentru pool-ul Sapphire |
| `ruby_pool_weight`             | string | `0.20`            | Pondere de propunere a blocurilor pentru pool-ul Ruby |
| `emerald_min_reputation`       | string | `0.80`            | Scor minim de reputație pentru pool-ul Emerald |
| `sapphire_min_reputation`      | string | `0.50`            | Scor minim de reputație pentru pool-ul Sapphire |
| `bonding_curve_base_rate`      | string | `0.05`            | Rată de bază pentru curba de bonding a staking-ului |
| `bonding_curve_multiplier`     | string | `1.50`            | Multiplicator pentru progresia curbei de bonding |
| `slashing_downtime_window`     | int64  | `10000`           | Blocuri pentru evaluarea downtime-ului         |
| `slashing_downtime_threshold`  | string | `0.05`            | Fracțiune minimă de blocuri semnate înainte de slashing |
| `slashing_downtime_penalty`    | string | `0.01`            | Fracțiune de slash pentru downtime             |
| `slashing_double_sign_penalty` | string | `0.05`            | Fracțiune de slash pentru semnătură dublă      |
| `qdrw_enabled`                 | bool   | `true`            | Activează ponderarea dinamică a recompenselor (Dynamic Reward Weighting) |
| `qdrw_throughput_weight`       | string | `0.40`            | Pondere QDRW pentru metrica de throughput      |
| `qdrw_latency_weight`          | string | `0.30`            | Pondere QDRW pentru metrica de latență         |
| `qdrw_security_weight`         | string | `0.20`            | Pondere QDRW pentru metrica de securitate      |
| `qdrw_decentralization_weight` | string | `0.10`            | Pondere QDRW pentru metrica de descentralizare |
| `qdrw_adjustment_cap`          | string | `0.10`            | Ajustare QDRW maximă pe o singură epocă        |
| `qdrw_adjustment_interval`     | int64  | `100`             | Blocuri între ajustările QDRW                  |

---

## Modulul Burn (`x/burn`)

| Parametru           | Tip    | Valoare implicită | Descriere                                          |
| ------------------- | ------ | ----------------- | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`            | Activează mecanismul de ardere a comisioanelor    |
| `validator_share`   | string | `0.37`            | Fracțiune din comisioane distribuită validatorilor de blocuri |
| `burn_share`        | string | `0.30`            | Fracțiune din comisioane arsă permanent           |
| `treasury_share`    | string | `0.20`            | Fracțiune din comisioane trimisă trezoreriei comunitare |
| `staker_share`      | string | `0.10`            | Fracțiune din comisioane distribuită delegatorilor |
| `light_node_share`  | string | `0.03`            | Fracțiune din comisioane distribuită nodurilor light |

Cotele trebuie să însumeze `1.00`. Împărțirea comisioanelor este **37 / 30 / 20 / 10 / 3** între validatori, ardere, trezorerie, stakeri și noduri light.

---

## Modulul xQORE (`x/xqore`)

| Parametru            | Tip    | Valoare implicită | Descriere                                     |
| -------------------- | ------ | ----------------- | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor`     | Suma minimă de blocat ca xQORE                |
| `min_lock_duration`  | string | `7d`              | Durata minimă de blocare                      |
| `max_lock_duration`  | string | `365d`            | Durata maximă de blocare                      |
| `penalty_tier_1_pct` | string | `0.50`            | Penalizare pentru deblocare anticipată: 0-25% din blocare scursă |
| `penalty_tier_2_pct` | string | `0.30`            | Penalizare pentru deblocare anticipată: 25-50% din blocare scursă |
| `penalty_tier_3_pct` | string | `0.15`            | Penalizare pentru deblocare anticipată: 50-75% din blocare scursă |
| `penalty_tier_4_pct` | string | `0.05`            | Penalizare pentru deblocare anticipată: 75-100% din blocare scursă |
| `pvp_rebase_enabled` | bool   | `true`            | Activează redistribuirea prin rebase PvP      |

---

## Modulul Inflation (`x/inflation`)

| Parametru         | Tip    | Valoare implicită      | Descriere                                        |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | Blocuri per epocă de inflație                     |
| `blocks_per_year` | uint64 | `6311520`              | Blocuri estimate pe an (pentru calculul ratei)   |
| `initial_rate`    | string | `0.08`                 | Parametrul ratei inițiale de emisie anualizată   |
| `rate_decay`      | string | `0.05`                 | Factor de decădere aplicat în fiecare an         |
| `min_rate`        | string | `0.02`                 | Parametrul ratei minime de emisie                 |
| `max_supply`      | string | `1000000000000000uqor` | Plafonul maxim al ofertei de tokenuri             |

:::note
Parametrii `x/inflation` de mai sus sunt valorile implicite ale mecanismului implementat. Conform modelului economic canonic **tokenomics v2.1**, QoreChain are **ofertă fixă** cu un **buget de emisie finit (pool de 590M)** care finanțează recompensele de staking și de ecosistem. Valorile `initial_rate` / `rate_decay` / `min_rate` sunt detalii de mecanism care guvernează modul în care emisiile sunt programate în cadrul acelui buget finit — ele **nu** reprezintă o inflație procentuală deschisă a ofertei totale.
:::

---

## Modulul RL Consensus (`x/rlconsensus`)

Modulul `x/rlconsensus` implementează **PRISM**, stratul de optimizare prin învățare prin întărire al QoreChain Consensus Engine.

| Parametru                    | Tip    | Valoare implicită | Descriere                                       |
| ---------------------------- | ------ | ----------------- | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`              | Blocuri între eșantioanele de observație PRISM  |
| `agent_mode`                 | uint   | `0`               | Mod agent: 0=oprit, 1=observă, 2=sugerează, 3=auto |
| `circuit_breaker_enabled`    | bool   | `true`            | Activează întrerupătorul de circuit PRISM        |
| `circuit_breaker_max_change` | string | `0.10`            | Schimbarea maximă de parametru per acțiune (10%) |
| `circuit_breaker_cooldown`   | uint64 | `100`             | Blocuri de așteptat după declanșarea întrerupătorului de circuit |
| `reward_throughput_weight`   | string | `0.40`            | Pondere de recompensă pentru throughput         |
| `reward_latency_weight`      | string | `0.30`            | Pondere de recompensă pentru latență            |
| `reward_security_weight`     | string | `0.20`            | Pondere de recompensă pentru securitate         |
| `reward_stability_weight`    | string | `0.10`            | Pondere de recompensă pentru stabilitate        |
| `ppo_learning_rate`          | string | `0.0003`          | Rata de învățare PPO                            |
| `ppo_clip_range`             | string | `0.20`            | Intervalul de clipping PPO                       |

---

## Modulul Bridge (`x/bridge`)

| Parametru                       | Tip    | Valoare implicită | Descriere                                       |
| ------------------------------- | ------ | ----------------- | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`               | Confirmări minime pentru transferurile IBC      |
| `min_confirmations_ethereum`    | uint64 | `12`              | Confirmări minime pentru bridge-ul Ethereum     |
| `min_confirmations_bitcoin`     | uint64 | `6`               | Confirmări minime pentru bridge-ul Bitcoin      |
| `circuit_breaker_enabled`       | bool   | `true`            | Activează întrerupătorul de circuit al bridge-ului |
| `circuit_breaker_max_daily_usd` | string | `10000000`        | Volum zilnic maxim de bridge (echivalent USD)   |
| `circuit_breaker_max_single_tx` | string | `1000000`         | Suma maximă a unui singur transfer (echivalent USD) |

---

## Modulul Multilayer (`x/multilayer`)

| Parametru                   | Tip    | Valoare implicită  | Descriere                                         |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | Numărul maxim de sidechain-uri înregistrate       |
| `max_paychains`             | uint   | `50`               | Numărul maxim de paychain-uri înregistrate        |
| `anchor_interval_sidechain` | uint64 | `100`              | Interval obligatoriu de ancorare pentru sidechain-uri (blocuri) |
| `anchor_interval_paychain`  | uint64 | `50`               | Interval obligatoriu de ancorare pentru paychain-uri (blocuri)  |
| `challenge_period`          | string | `7d`               | Durata pentru contestațiile de fraudă pe ancore   |
| `min_sidechain_stake`       | string | `1000000000uqor`   | Stake minim pentru înregistrarea unui sidechain (1.000 QOR) |
| `min_paychain_stake`        | string | `100000000uqor`    | Stake minim pentru înregistrarea unui paychain (100 QOR) |
| `routing_threshold`         | string | `0.80`             | Pragul de încărcare care declanșează rutarea automată |

---

## Modulul Cross-VM (`x/crossvm`)

| Parametru          | Tip    | Valoare implicită | Descriere                                      |
| ------------------ | ------ | ----------------- | ---------------------------------------------- |
| `max_message_size` | uint64 | `65536`           | Dimensiunea maximă a mesajului cross-VM în octeți (64 KB) |
| `max_queue_size`   | uint   | `1000`            | Numărul maxim de mesaje în așteptare în coada cross-VM |
| `queue_timeout`    | uint64 | `100`             | Blocuri înainte ca un mesaj în așteptare să expire |

---

## Modulul SVM (`x/svm`)

| Parametru                     | Tip    | Valoare implicită | Descriere                                  |
| ----------------------------- | ------ | ----------------- | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`        | Dimensiunea maximă a binarului de program în octeți (10 MB) |
| `compute_budget`              | uint64 | `1400000`         | Unități de calcul implicite per tranzacție (1,4M) |
| `rent_lamports_per_byte_year` | uint64 | `3480`            | Cost anual de chirie per octet în lamports   |
| `rent_exemption_threshold`    | string | `2.0`             | Ani de chirie necesari pentru scutire        |
| `max_accounts_per_tx`         | uint   | `64`              | Numărul maxim de conturi referite per tranzacție |

---

## Modulul RDK (`x/rdk`)

| Parametru             | Tip    | Valoare implicită                  | Descriere                              |
| --------------------- | ------ | ---------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                              | Numărul maxim de rollup-uri înregistrate |
| `min_stake`           | string | `10000000000uqor`                  | Stake minim al operatorului (10.000 QOR) |
| `burn_rate`           | string | `0.01`                             | Procent din comisioanele rollup-ului arse (1%) |
| `challenge_window`    | string | `7d`                               | Durata ferestrei de contestare a fraudei |
| `max_blob_size`       | uint64 | `2097152`                          | Dimensiunea maximă a blob-ului DA în octeți (2 MB) |
| `blob_retention`      | uint64 | `432000`                           | Blocuri pentru reținerea blob-urilor DA înainte de prunare |
| `max_batches_pending` | uint   | `10`                               | Numărul maxim de batch-uri nefinalizate per rollup |
| `auto_finalize`       | bool   | `true`                             | Activează auto-finalizarea EndBlocker     |
| `settlement_types`    | array  | optimistic, zk, based, sovereign   | Paradigme de settlement permise          |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | Preset-uri de rollup disponibile      |

---

## Modulul FairBlock (`x/fairblock`)

| Parametru            | Tip    | Valoare implicită | Descriere                                 |
| -------------------- | ------ | ----------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`           | Activează criptarea tIBE FairBlock          |
| `tibe_threshold`     | uint   | `2`               | Numărul minim de cote de chei de decriptare necesare |
| `decryption_delay`   | uint64 | `1`               | Blocuri după finalizare înainte de decriptare |
| `max_encrypted_size` | uint64 | `4096`            | Dimensiunea maximă a payload-ului criptat în octeți |

---

## Modulul Gas Abstraction (`x/gasabstraction`)

| Parametru         | Tip   | Valoare implicită | Descriere                                           |
| ----------------- | ----- | ----------------- | ----------------------------------------------------- |
| `accepted_tokens` | array | (vezi mai jos)    | Tokenuri acceptate pentru plata gazului cu rate de conversie |

**Tokenuri acceptate implicit:**

| Denominare token | Rată de conversie | Descriere              |
| ---------------- | ----------------- | ---------------------- |
| `uqor`           | `1.0`             | Token QOR nativ (1:1)  |
| `ibc/USDC`       | `1.0`             | USDC adus prin bridge IBC |
| `ibc/ATOM`       | `10.0`            | ATOM adus prin bridge IBC |

Ratele de conversie reprezintă numărul de unități de gaz per unitate de token. Rate mai mari înseamnă că fiecare unitate de token acoperă mai mult gaz.
