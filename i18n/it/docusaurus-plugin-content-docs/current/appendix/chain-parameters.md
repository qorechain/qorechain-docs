---
slug: /appendix/chain-parameters
title: Parametri della chain
sidebar_label: Parametri della chain
sidebar_position: 2
---

# Parametri della chain

Riferimento consolidato di tutti i parametri di modulo configurabili nel genesis di QoreChain. I parametri sono raggruppati per modulo e possono essere interrogati a runtime con `qorechaind query <module> params`.

:::note
I valori mostrati sono i valori predefiniti del genesis distribuito. I parametri si applicano alla mainnet **`qorechain-vladi`** (EVM chain ID **9801**) e alla testnet **`qorechain-diana`** (EVM chain ID **9800**) salvo diversa indicazione.
:::

---

## Modulo PQC (`x/pqc`)

| Parametro                   | Tipo   | Valore predefinito     | Descrizione                                                            |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (richiesto)        | Modalità di applicazione: 0=disattivata, 1=opzionale, 2=richiesta (predefinito corrente) |
| `allow_classical_fallback`  | bool   | `false`                | Il fallback solo classico è chiuso; le tx cosmos devono essere ibride  |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | Algoritmi PQC registrati con vincoli dimensionali                      |
| `auto_register_enabled`     | bool   | `true`                 | Registra automaticamente le chiavi PQC alla prima tx ibrida           |
| `migration_deadline_height` | uint64 | `0`                    | Altezza di blocco dopo la quale le chiavi solo classiche sono rifiutate (0=disattivato) |
| `migration_grace_period`    | uint64 | `100000`               | Blocchi di avviso prima della scadenza di migrazione                   |

---

## Modulo AI (`x/ai`)

| Parametro                  | Tipo   | Valore predefinito | Descrizione                                              |
| -------------------------- | ------ | ------------------ | ------------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`             | Peso dell'anomalia di volume nello scoring di frode     |
| `anomaly_weight_velocity`  | string | `0.25`             | Peso dell'anomalia di velocità nello scoring di frode   |
| `anomaly_weight_pattern`   | string | `0.25`             | Peso dell'anomalia di pattern nello scoring di frode    |
| `anomaly_weight_network`   | string | `0.20`             | Peso dell'anomalia del grafo di rete nello scoring di frode |
| `fraud_threshold_low`      | string | `0.30`             | Soglia di punteggio per avviso a bassa gravità          |
| `fraud_threshold_medium`   | string | `0.55`             | Soglia di punteggio per avviso a media gravità          |
| `fraud_threshold_high`     | string | `0.75`             | Soglia di punteggio per avviso ad alta gravità          |
| `fraud_threshold_critical` | string | `0.90`             | Soglia di punteggio per avviso a gravità critica        |
| `circuit_breaker_enabled`  | bool   | `true`             | Abilita i circuit breaker di QCAI                        |

---

## Modulo Reputation (`x/reputation`)

| Parametro      | Tipo   | Valore predefinito | Descrizione                                              |
| -------------- | ------ | ------------------ | ------------------------------------------------------- |
| `alpha`        | string | `0.30`             | Peso del punteggio di uptime (S\_i) nella formula di reputazione |
| `beta`         | string | `0.25`             | Peso del punteggio di partecipazione (P\_i)             |
| `gamma`        | string | `0.25`             | Peso del punteggio di comunità (C\_i)                   |
| `delta`        | string | `0.20`             | Peso del punteggio di anzianità (T\_i)                  |
| `decay_lambda` | string | `0.01`             | Fattore di decadimento temporale esponenziale per i punteggi storici |

Formula di reputazione: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` con decadimento temporale esponenziale applicato per epoca.

---

## Modulo QCA (`x/qca`)

| Parametro                      | Tipo   | Valore predefinito | Descrizione                                       |
| ------------------------------ | ------ | ------------------ | ------------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`             | Peso di proposta dei blocchi per il pool Emerald  |
| `sapphire_pool_weight`         | string | `0.30`             | Peso di proposta dei blocchi per il pool Sapphire |
| `ruby_pool_weight`             | string | `0.20`             | Peso di proposta dei blocchi per il pool Ruby     |
| `emerald_min_reputation`       | string | `0.80`             | Punteggio minimo di reputazione per il pool Emerald  |
| `sapphire_min_reputation`      | string | `0.50`             | Punteggio minimo di reputazione per il pool Sapphire |
| `bonding_curve_base_rate`      | string | `0.05`             | Tasso base per la bonding curve dello staking     |
| `bonding_curve_multiplier`     | string | `1.50`             | Moltiplicatore per la progressione della bonding curve |
| `slashing_downtime_window`     | int64  | `10000`            | Blocchi per valutare i tempi di inattività        |
| `slashing_downtime_threshold`  | string | `0.05`             | Frazione minima di blocchi firmati prima dello slashing |
| `slashing_downtime_penalty`    | string | `0.01`             | Frazione di slash per inattività                  |
| `slashing_double_sign_penalty` | string | `0.05`             | Frazione di slash per doppia firma                |
| `qdrw_enabled`                 | bool   | `true`             | Abilita la Ponderazione Dinamica dei Reward       |
| `qdrw_throughput_weight`       | string | `0.40`             | Peso QDRW per la metrica di throughput            |
| `qdrw_latency_weight`          | string | `0.30`             | Peso QDRW per la metrica di latenza               |
| `qdrw_security_weight`         | string | `0.20`             | Peso QDRW per la metrica di sicurezza             |
| `qdrw_decentralization_weight` | string | `0.10`             | Peso QDRW per la metrica di decentralizzazione    |
| `qdrw_adjustment_cap`          | string | `0.10`             | Aggiustamento QDRW massimo per singola epoca      |
| `qdrw_adjustment_interval`     | int64  | `100`              | Blocchi tra gli aggiustamenti QDRW                |

---

## Modulo Burn (`x/burn`)

| Parametro           | Tipo   | Valore predefinito | Descrizione                                       |
| ------------------- | ------ | ------------------ | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`             | Abilita il meccanismo di burn delle commissioni   |
| `validator_share`   | string | `0.37`             | Frazione delle commissioni distribuita ai validatori dei blocchi  |
| `burn_share`        | string | `0.30`             | Frazione delle commissioni bruciata in modo permanente |
| `treasury_share`    | string | `0.20`             | Frazione delle commissioni inviata alla treasury della comunità  |
| `staker_share`      | string | `0.10`             | Frazione delle commissioni distribuita ai delegatori |
| `light_node_share`  | string | `0.03`             | Frazione delle commissioni distribuita ai light node |

Le quote devono sommare a `1.00`. La suddivisione delle commissioni è **37 / 30 / 20 / 10 / 3** tra validatori, burn, treasury, staker e light node.

---

## Modulo xQORE (`x/xqore`)

| Parametro            | Tipo   | Valore predefinito | Descrizione                                   |
| -------------------- | ------ | ------------------ | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor`      | Importo minimo da bloccare come xQORE         |
| `min_lock_duration`  | string | `7d`               | Durata minima del blocco                      |
| `max_lock_duration`  | string | `365d`             | Durata massima del blocco                     |
| `penalty_tier_1_pct` | string | `0.50`             | Penale per sblocco anticipato: 0-25% del blocco trascorso   |
| `penalty_tier_2_pct` | string | `0.30`             | Penale per sblocco anticipato: 25-50% del blocco trascorso  |
| `penalty_tier_3_pct` | string | `0.15`             | Penale per sblocco anticipato: 50-75% del blocco trascorso  |
| `penalty_tier_4_pct` | string | `0.05`             | Penale per sblocco anticipato: 75-100% del blocco trascorso |
| `pvp_rebase_enabled` | bool   | `true`             | Abilita la redistribuzione PvP rebase         |

---

## Modulo Inflation (`x/inflation`)

| Parametro         | Tipo   | Valore predefinito     | Descrizione                                      |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | Blocchi per epoca di inflazione                  |
| `blocks_per_year` | uint64 | `6311520`              | Stima dei blocchi all'anno (per il calcolo del tasso) |
| `initial_rate`    | string | `0.08`                 | Parametro del tasso di emissione annualizzato iniziale |
| `rate_decay`      | string | `0.05`                 | Fattore di decadimento applicato ogni anno       |
| `min_rate`        | string | `0.02`                 | Parametro del tasso di emissione minimo          |
| `max_supply`      | string | `1000000000000000uqor` | Tetto massimo dell'offerta di token              |

:::note
I parametri di `x/inflation` sopra sono i valori predefiniti del meccanismo distribuito. Nel modello economico canonico **tokenomics v2.1**, QoreChain ha un'**offerta fissa** con un **budget di emissione finito (pool da 590M)** che finanzia i reward di staking ed ecosistema. I valori `initial_rate` / `rate_decay` / `min_rate` sono dettagli del meccanismo che regolano la pianificazione delle emissioni entro quel budget finito — **non** sono un'inflazione percentuale illimitata dell'offerta totale.
:::

---

## Modulo RL Consensus (`x/rlconsensus`)

Il modulo `x/rlconsensus` implementa **PRISM**, il livello di ottimizzazione basato sul reinforcement learning del Consensus Engine di QoreChain.

| Parametro                    | Tipo   | Valore predefinito | Descrizione                                     |
| ---------------------------- | ------ | ------------------ | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`               | Blocchi tra i campioni di osservazione di PRISM |
| `agent_mode`                 | uint   | `0`                | Modalità agente: 0=off, 1=osserva, 2=suggerisci, 3=auto |
| `circuit_breaker_enabled`    | bool   | `true`             | Abilita il circuit breaker di PRISM             |
| `circuit_breaker_max_change` | string | `0.10`             | Variazione massima del parametro per azione (10%) |
| `circuit_breaker_cooldown`   | uint64 | `100`              | Blocchi di attesa dopo lo scatto del circuit breaker |
| `reward_throughput_weight`   | string | `0.40`             | Peso del reward per il throughput               |
| `reward_latency_weight`      | string | `0.30`             | Peso del reward per la latenza                  |
| `reward_security_weight`     | string | `0.20`             | Peso del reward per la sicurezza                |
| `reward_stability_weight`    | string | `0.10`             | Peso del reward per la stabilità                |
| `ppo_learning_rate`          | string | `0.0003`           | Learning rate di PPO                            |
| `ppo_clip_range`             | string | `0.20`             | Intervallo di clipping di PPO                   |

---

## Modulo Bridge (`x/bridge`)

| Parametro                       | Tipo   | Valore predefinito | Descrizione                                     |
| ------------------------------- | ------ | ------------------ | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`                | Conferme minime per i trasferimenti IBC         |
| `min_confirmations_ethereum`    | uint64 | `12`               | Conferme minime per il bridge Ethereum          |
| `min_confirmations_bitcoin`     | uint64 | `6`                | Conferme minime per il bridge Bitcoin           |
| `circuit_breaker_enabled`       | bool   | `true`             | Abilita il circuit breaker del bridge           |
| `circuit_breaker_max_daily_usd` | string | `10000000`         | Volume giornaliero massimo del bridge (equivalente in USD) |
| `circuit_breaker_max_single_tx` | string | `1000000`          | Importo massimo per singolo trasferimento (equivalente in USD) |

---

## Modulo Multilayer (`x/multilayer`)

| Parametro                   | Tipo   | Valore predefinito | Descrizione                                       |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | Numero massimo di sidechain registrate            |
| `max_paychains`             | uint   | `50`               | Numero massimo di paychain registrate             |
| `anchor_interval_sidechain` | uint64 | `100`              | Intervallo di ancoraggio obbligatorio per le sidechain (blocchi) |
| `anchor_interval_paychain`  | uint64 | `50`               | Intervallo di ancoraggio obbligatorio per le paychain (blocchi)  |
| `challenge_period`          | string | `7d`               | Durata delle contestazioni di frode sugli ancoraggi |
| `min_sidechain_stake`       | string | `1000000000uqor`   | Stake minimo per registrare una sidechain (1.000 QOR) |
| `min_paychain_stake`        | string | `100000000uqor`    | Stake minimo per registrare una paychain (100 QOR) |
| `routing_threshold`         | string | `0.80`             | Soglia di carico per attivare il routing automatico |

---

## Modulo Cross-VM (`x/crossvm`)

| Parametro          | Tipo   | Valore predefinito | Descrizione                                    |
| ------------------ | ------ | ------------------ | ---------------------------------------------- |
| `max_message_size` | uint64 | `65536`            | Dimensione massima del messaggio cross-VM in byte (64 KB) |
| `max_queue_size`   | uint   | `1000`             | Numero massimo di messaggi in attesa nella coda cross-VM |
| `queue_timeout`    | uint64 | `100`              | Blocchi prima che un messaggio in attesa vada in timeout |

---

## Modulo SVM (`x/svm`)

| Parametro                     | Tipo   | Valore predefinito | Descrizione                                  |
| ----------------------------- | ------ | ------------------ | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`         | Dimensione massima del binario del programma in byte (10 MB) |
| `compute_budget`              | uint64 | `1400000`          | Unità di calcolo predefinite per transazione (1,4M) |
| `rent_lamports_per_byte_year` | uint64 | `3480`             | Costo annuale di rent per byte in lamport    |
| `rent_exemption_threshold`    | string | `2.0`              | Anni di rent richiesti per l'esenzione       |
| `max_accounts_per_tx`         | uint   | `64`               | Numero massimo di account referenziati per transazione |

---

## Modulo RDK (`x/rdk`)

| Parametro             | Tipo   | Valore predefinito                      | Descrizione                              |
| --------------------- | ------ | --------------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                                   | Numero massimo di rollup registrati      |
| `min_stake`           | string | `10000000000uqor`                       | Stake minimo dell'operatore (10.000 QOR) |
| `burn_rate`           | string | `0.01`                                  | Percentuale delle commissioni del rollup bruciata (1%) |
| `challenge_window`    | string | `7d`                                    | Durata della finestra di contestazione di frode |
| `max_blob_size`       | uint64 | `2097152`                               | Dimensione massima del blob DA in byte (2 MB) |
| `blob_retention`      | uint64 | `432000`                                | Blocchi per cui conservare i blob DA prima della potatura |
| `max_batches_pending` | uint   | `10`                                    | Numero massimo di batch non finalizzati per rollup |
| `auto_finalize`       | bool   | `true`                                  | Abilita la finalizzazione automatica nell'EndBlocker |
| `settlement_types`    | array  | optimistic, zk, based, sovereign        | Paradigmi di settlement consentiti       |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom   | Preset di rollup disponibili             |

---

## Modulo FairBlock (`x/fairblock`)

| Parametro            | Tipo   | Valore predefinito | Descrizione                                 |
| -------------------- | ------ | ------------------ | ------------------------------------------- |
| `enabled`            | bool   | `false`            | Abilita la cifratura tIBE di FairBlock      |
| `tibe_threshold`     | uint   | `2`                | Numero minimo di share di chiave di decifratura richieste |
| `decryption_delay`   | uint64 | `1`                | Blocchi dopo la finalizzazione prima della decifratura |
| `max_encrypted_size` | uint64 | `4096`             | Dimensione massima del payload cifrato in byte |

---

## Modulo Gas Abstraction (`x/gasabstraction`)

| Parametro         | Tipo  | Valore predefinito | Descrizione                                           |
| ----------------- | ----- | ------------------ | ----------------------------------------------------- |
| `accepted_tokens` | array | (vedi sotto)       | Token accettati per il pagamento del gas con tassi di conversione |

**Token accettati per impostazione predefinita:**

| Denom token | Tasso di conversione | Descrizione            |
| ----------- | -------------------- | ---------------------- |
| `uqor`      | `1.0`                | Token nativo QOR (1:1) |
| `ibc/USDC`  | `1.0`                | USDC trasferito via IBC |
| `ibc/ATOM`  | `10.0`               | ATOM trasferito via IBC |

I tassi di conversione rappresentano il numero di unità di gas per unità di token. Tassi più alti significano che ogni unità di token copre più gas.
