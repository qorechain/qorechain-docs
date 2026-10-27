---
slug: /appendix/chain-parameters
title: Parametri della chain
sidebar_label: Parametri della chain
sidebar_position: 2
---

# Parametri della chain

Riferimento consolidato dei parametri di modulo delle reti QoreChain, raggruppati per modulo. I parametri possono essere interrogati con `qorechaind query <module> params` quando il modulo dispone di una query params (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` e `gasabstraction` usano `config`), e tramite REST solo per le route elencate nel [riferimento REST / gRPC](/api-reference/rest-grpc-endpoints). I parametri di `x/inflation` sono serviti anche tramite REST sulla mainnet dalla v3.2.3 (`/qorechain/inflation/v1/params`). REST non è disponibile sulla mainnet per `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` né `xqore`, e nemmeno per i parametri di `pqc` (la testnet serve tramite REST i parametri di `pqc`, `crossvm` e `rlconsensus` dalla v3.2.6).

:::note
I valori mostrati sono stati letti in diretta dalla mainnet **`qorechain-vladi`** (EVM chain ID **9801**, release **v3.2.4**, applicata il 23 ottobre 2026) il 23 ottobre 2026 (valori del genesis, salvo che una proposta di governance li abbia modificati; tali casi sono segnalati), e le righe dei moduli principali sono state rilette il 27 ottobre 2026. La proposta di governance 14 applicherebbe la v3.2.5 sulla mainnet all'altezza 3.906.833 (in periodo di voto al momento della scrittura); questa pagina descrive la mainnet così com'è oggi e verrà aggiornata quando quell'upgrade sarà applicato. La testnet **`qorechain-diana`** (EVM chain ID **9800**) esegue la release **v3.2.6** (applicata il 27 ottobre 2026). I suoi valori sono identici a quelli della mainnet salvo diversa indicazione; le differenze rimanenti sono raccolte in [Differenze tra testnet e mainnet](#testnet-differences). Le durate espresse in blocchi sono convertite al tempo di blocco misurato sulla mainnet, di circa 3,2 secondi (la testnet produce un blocco circa ogni 1,3 secondi).
:::

---

## Modulo PQC (`x/pqc`)

| Parametro                  | Valore                     | Descrizione                                                              |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Le firme post-quantistiche sono lo schema primario                       |
| `allow_classical_fallback` | `false`                    | Il fallback solo classico è chiuso; le tx della lane Cosmos devono essere ibride |
| `min_security_level`       | `5`                        | Livello di sicurezza NIST minimo per un algoritmo registrato             |
| `default_migration_blocks` | `1,000,000`                | Durata predefinita di una migrazione di algoritmo avviata dalla governance (circa 37 giorni con blocchi da ≈3,2 s) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (richiesto)            | Modalità di applicazione: 0=disattivata, 1=opzionale, 2=richiesta        |

Il registro degli algoritmi (id 1 `dilithium5`, id 2 `mlkem1024`) è stato della chain e non un parametro. Le chiavi vengono registrate esplicitamente con `MsgRegisterPQCKey` o `MsgRegisterPQCKeyV2`; non esiste alcuna registrazione automatica. Dalla v3.2.3 la chain rifiuta chiavi pubbliche deboli, degeneri e già utilizzate, e `MsgRegisterPQCKeyV2` accetta una prova di possesso opzionale (`tx pqc register-key-v2 ... --pqc-key <name>`) che la chain verifica quando è presente.

### Limiti della finestra di autorizzazione EVM {#evm-window-limits}

I limiti di una [finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window) sono costanti di protocollo e non parametri di modulo:

| Limite | Valore |
| ----- | ----- |
| `blocks` massimo | 17,280 (circa 15 ore con blocchi da ≈3,2 s) |
| `max_txs` massimo | 1,000 |
| `max_value` | maggiore di 0 (uqor; valore trasferito più la commissione massima di ciascuna transazione) |
| `allowed_targets` massimo | 16 indirizzi destinatari (ambito opzionale, v3.2.3) |

Dalla v3.2.3 una finestra può essere ristretta anche con `native_only` (solo trasferimenti nativi semplici di QOR).

---

## Modulo AI (`x/ai`)

La configurazione del modulo (`qorechaind query ai config`):

| Parametro           | Valore                 | Descrizione                                                                 |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Punteggio di anomalia oltre il quale l'ante handler segnala una transazione |
| `routing_strategy`  | `reputation_weighted`  | Strategia di routing                                                        |
| `risk_threshold`    | `0.8`                  | Soglia del punteggio di rischio                                             |
| `max_tx_per_minute` | `600`                  | Limite di transazioni per mittente sulla lane Cosmos, conteggiato su una finestra di 30 blocchi (circa 96 s con blocchi da ≈3,2 s; il nome è storico). Applicato dalla v3.2.0; il valore predefinito è 10 |

I pesi dello scoring di frode e le soglie di gravità descritti nella pagina [AI Engine](/architecture/ai-engine) sono costanti del rilevatore, non parametri di modulo.

---

## Modulo Reputation (`x/reputation`)

| Parametro   | Valore | Descrizione                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | Peso del punteggio di uptime (S\_i) nella formula di reputazione |
| `beta`      | `0.35` | Peso del punteggio di partecipazione (P\_i)          |
| `gamma`     | `0.20` | Peso del punteggio di comunità (C\_i)                |
| `delta`     | `0.15` | Peso del punteggio di anzianità (T\_i)               |
| `lambda`    | `1000` | Scala del decadimento temporale per i punteggi storici |
| `min_score` | `0.10` | Soglia minima di un punteggio di reputazione         |

Formula di reputazione: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` con decadimento temporale applicato ai punteggi storici.

---

## Modulo QCA (`x/qca`)

:::note Implementato, non ancora attivo
La logica CPoS a triplo pool è implementata in `x/qca` e questi parametri sono on-chain, ma **non sono ancora collegati alla produzione dei blocchi, ai reward, allo slashing né al conteggio della governance**. Lo slashing in vigore è quello del modulo standard `x/slashing` (vedi [Staking, slashing, governance, commissioni ed EVM](#core-modules)). Vedi [Meccanismo di consenso](/architecture/consensus-mechanism).
:::

La configurazione (`qorechaind query qca config`):

| Parametro                       | Valore              | Descrizione                                           |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | Impostazione del genesis per la ponderazione tramite reputazione |
| `min_reputation_score`          | `0.1`               | Punteggio di reputazione minimo                       |
| `pool_classification_interval`  | `1000` blocchi      | Blocchi tra una classificazione dei pool e l'altra    |
| `pool_weight_rpos`              | `0.40`              | Peso di proposta del pool RPoS                        |
| `pool_weight_dpos`              | `0.35`              | Peso di proposta del pool DPoS                        |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | Delega minima per il pool DPoS (10.000 QOR)         |
| `pool_rep_percentile_rpos`      | `70`                | Percentile di reputazione per il pool RPoS            |
| `bonding_alpha`                 | `0.1`               | Parametro della bonding curve                         |
| `bonding_beta`                  | `1.0`               | Parametro della bonding curve                         |
| `bonding_phase_multiplier`      | `1.5`               | Moltiplicatore di fase della bonding curve            |
| `slashing_base_rate`            | `0.01`              | Tasso base dello slashing progressivo                 |
| `slashing_escalation_factor`    | `1.5`               | Fattore di escalation dello slashing progressivo      |
| `slashing_max_penalty`          | `0.33`              | Penale massima dello slashing progressivo             |
| `slashing_decay_halflife`       | `100,000` blocchi   | Emivita di decadimento dello slashing progressivo     |
| `qdrw_enabled`                  | `false`             | Il conteggio QDRW è disattivato                       |
| `qdrw_xqore_multiplier`         | `2.0`               | Peso di xQORE nella formula QDRW                      |
| `qdrw_rep_min_multiplier`       | `0.5`               | Limite inferiore del moltiplicatore di reputazione    |
| `qdrw_rep_max_multiplier`       | `2.0`               | Limite superiore del moltiplicatore di reputazione    |

---

## Modulo Burn (`x/burn`)

| Parametro              | Valore                       | Descrizione                                           |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Frazione del fee collector bruciata                   |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Commissione di burn fissa per la creazione di un contratto |
| `ai_service_burn_rate` | `0.50`                       | Frazione delle commissioni dei servizi AI bruciata    |
| `bridge_burn_rate`     | `1.00`                       | Frazione delle commissioni del bridge bruciata        |
| `failed_tx_burn_rate`  | `0.10`                       | Frazione del gas delle transazioni fallite bruciata (applicata dalla chain dalla v3.2.2) |
| `validator_share`      | `0.37`                       | Frazione distribuita ai validatori                    |
| `treasury_share`       | `0.20`                       | Frazione inviata alla treasury                        |
| `staker_share`         | `0.10`                       | Frazione distribuita agli staker                      |
| `light_node_share`     | `0.03`                       | Frazione distribuita ai light node                    |
| `enabled`              | `true`                       | Flag di attivazione del modulo                        |

La suddivisione delle commissioni è **37 / 30 / 20 / 10 / 3** tra validatori, burn, treasury, staker e light node; le quote devono sommare a `1.00`. Esiste anche un `milestone_burn_schedule`. Vedi [Tokenomics](/architecture/tokenomics).

---

## Modulo xQORE (`x/xqore`)

:::caution Non ancora disponibile on-chain
La contabilità del modulo xQORE esiste, ma le transazioni di lock e unlock, le query e i comandi CLI **non sono ancora collegati alle reti attive**: al momento non è possibile bloccare alcun QOR e non è stato coniato alcun xQORE. I valori seguenti sono la configurazione del genesis.
:::

| Parametro                 | Valore                 | Descrizione                                          |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | Moltiplicatore del potere di voto per i detentori di xQORE |
| `min_lock_amount`         | `1,000,000 uqor`       | Importo minimo da bloccare (1 QOR)                   |
| `penalty_burn_rate`       | `0.0`                  | Frazione delle penali di uscita bruciata (tutte vengono ridistribuite) |
| `rebase_interval`         | `100` blocchi          | Blocchi tra gli eventi di rebase PvP                 |
| `enabled`                 | `true`                 | Flag di attivazione del modulo                       |

Penali di uscita: 50 % (blocco inferiore a 30 giorni), 35 % (30–90 giorni), 15 % (90–180 giorni), 0 % (oltre 180 giorni). Moltiplicatori di blocco: 1,0 / 1,2 / 1,4 / 1,7 / 2,0 a 0 / 90 / 180 / 365 / 730 giorni.

---

## Modulo Inflation (`x/inflation`)

| Parametro              | Valore                  | Descrizione                                           |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (legacy) o `fixed` (dalla v3.1.94)         |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86.000 QOR) | Coniato per epoca in modalità fixed (16.239 QOR prima della proposta di governance 10, 19 ottobre 2026) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590.000.000 QOR) | Tetto cumulativo rigido (114.285.714 QOR prima della proposta 10) |
| `epoch_length`         | `43,200` blocchi        | Blocchi per epoca (circa 38,6 ore con blocchi da ≈3,2 s) |
| `schedule`             | 17,5 %, 11 %, 7 %, 7 %, 2 % | Tassi legacy su base annua, inutilizzati in modalità fixed |
| `enabled`              | `true`                  | Flag di attivazione del modulo                        |

Il modulo conia questa emissione nel fee collector fino al raggiungimento del tetto. La prima epoca a 86.000 QOR inizia al blocco 3,672,000. Il 23 ottobre 2026 (epoca 86) erano stati coniati 105.420.896,21 QOR e ne restavano 484.579.103,79 sotto il tetto (`GET /qorechain/inflation/v1/epoch_info`). Vedi [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## Modulo RL Consensus (`x/rlconsensus`)

Il modulo `x/rlconsensus` implementa **PRISM**, il livello di ottimizzazione basato sul reinforcement learning. Sulla mainnet è in modalità osservazione: non sono caricati pesi di policy, quindi non regola nulla, e i quattro messaggi di controllo di PRISM sono disattivati dal circuit breaker (vedi [Stato del circuit breaker](#circuit-breaker)). Sulla testnet l'agente funziona in **modalità shadow** con una piccola policy dimostrativa caricata: osserva ogni 10 blocchi e registra un'azione proposta senza modificare alcun valore. La tabella riporta i valori della mainnet; la testnet differisce solo per `agent_mode` (`0`, shadow) e li serve tramite REST (`GET /qorechain/rlconsensus/v1/params`, v3.2.6; la mainnet risponde 501).

| Parametro                        | Valore         | Descrizione                                                   |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Flag di attivazione del modulo                                |
| `observation_interval`           | `10`           | Blocchi tra i campioni di osservazione di PRISM               |
| `agent_mode`                     | `1` (conservative) | Modalità agente: 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | Variazione massima del parametro per azione in modalità conservative |
| `max_change_autonomous`          | `0.25`         | Variazione massima del parametro per azione in modalità autonomous |
| `circuit_breaker_window`         | `50`           | Finestra del circuit breaker                                  |
| `circuit_breaker_threshold`      | `0.50`         | Soglia del circuit breaker                                    |
| `reward_weight_throughput`       | `0.30`         | Peso del reward per il throughput                             |
| `reward_weight_finality`         | `0.25`         | Peso del reward per la finalità                               |
| `reward_weight_decentralization` | `0.20`         | Peso del reward per la decentralizzazione                     |
| `reward_weight_mev`              | `0.15`         | Peso del reward per l'MEV                                     |
| `reward_weight_failed_txs`       | `0.10`         | Peso del reward per le transazioni fallite                    |
| `default_block_time_ms`          | `5000`         | Tempo di blocco predefinito nella baseline di osservazione (non il tempo di blocco reale) |
| `default_base_gas_price`         | `100`          | Prezzo base del gas predefinito nella baseline di osservazione |
| `default_validator_set_size`     | `100`          | Dimensione predefinita del set di validatori nella baseline di osservazione |

---

## Modulo Bridge (`x/bridge`)

:::caution Non attivo
Tutte le 37 configurazioni di chain sono in stato `pending`, non è registrato alcun validatore del bridge, non è stata creata alcuna operazione di bridge e non è aperto alcun canale IBC sulla mainnet (la testnet ha un solo canale di trasferimento ICS-20 (`channel-0`) verso una catena controparte di test con chain ID `provider`, aperto per i test IBC (verificato il 27 ottobre 2026)). Vedi [Architettura del bridge](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config`:

| Parametro                  | Valore                      | Descrizione                                       |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Validatori richiesti per il set di attestazione   |
| `attestation_threshold`    | `7`                         | Attestazioni richieste                            |
| `challenge_period_secs`    | `86400`                     | Periodo di contestazione (24 ore)                 |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100.000 QOR) | I trasferimenti superiori a questo importo attendono il periodo di contestazione |
| `enabled`                  | `true`                      | Flag di attivazione del modulo                    |

Le impostazioni per singola chain (`min_confirmations`, `max_single_transfer`, `daily_limit`) risiedono nella configurazione di ciascuna chain, non nei parametri del modulo.

---

## Modulo Multilayer (`x/multilayer`)

| Parametro                      | Valore           | Descrizione                                       |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10` (testnet: `64`) | Numero massimo di sidechain registrate        |
| `max_paychains`                | `50`             | Numero massimo di paychain registrate             |
| `min_anchor_interval`          | `100`            | Intervallo di ancoraggio minimo (blocchi)         |
| `max_anchor_interval`          | `1000`           | Intervallo di ancoraggio massimo (blocchi)        |
| `default_challenge_period`     | `86400` s        | Periodo di contestazione predefinito (1 giorno)   |
| `min_sidechain_stake`          | `1,000,000,000`  | Stake minimo per registrare una sidechain (1.000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Stake minimo per registrare una paychain (100 QOR) |
| `routing_enabled`              | `true`           | Routing cross-layer abilitato                     |
| `routing_confidence_threshold` | `0.6`            | Soglia di confidenza per il routing automatico    |
| `cross_layer_fee_bundling`     | `true`           | Un unico pagamento di commissioni può coprire più layer |

---

## Modulo Cross-VM (`x/crossvm`)

| Parametro             | Valore  | Descrizione                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Dimensione massima del messaggio cross-VM in byte (64 KB) |
| `max_queue_size`      | `1000`  | Numero massimo di messaggi in attesa nella coda cross-VM |
| `queue_timeout_blocks`| `100`   | Blocchi prima che un messaggio in attesa vada in timeout |
| `enabled`             | `true`  | Flag di attivazione del modulo                 |

`MsgCrossVMCall` è disattivato sulla mainnet dal circuit breaker (abilitato sulla testnet). La testnet serve questi valori tramite REST (`GET /qorechain/crossvm/v1/params`); la mainnet risponde 501.

---

## Modulo SVM (`x/svm`)

Valori del genesis:

| Parametro               | Valore       | Descrizione                                  |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Dimensione massima del binario del programma in byte (10 MB) |
| `max_account_data_size` | `10485760`   | Dimensione massima dei dati di un account in byte (10 MB) |
| `compute_budget_max`    | `1400000`    | Unità di calcolo massime per transazione (1,4M) |
| `lamports_per_byte`     | `3480`       | Costo di rent per byte in lamport            |
| `rent_exemption_multi`  | `2.0`        | Anni di rent richiesti per l'esenzione       |
| `enabled`               | `true`       | Flag di attivazione del modulo               |
| `svm_slot_offset`       | `0`          | Offset dello slot                            |
| `default_sig_scheme`    | `0`          | Schema di firma predefinito                  |
| `max_cpi`               | `4`          | Profondità massima di cross-program-invocation |

La lane di transazioni SVM è disattivata su tutta la rete (vedi [Reti](/appendix/networks)).

---

## Modulo RDK (`x/rdk`)

`qorechaind query rdk config`:

| Parametro                   | Valore               | Descrizione                                   |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100` (testnet: `200`) | Numero massimo di rollup registrati         |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Stake minimo dell'operatore (10.000 QOR)      |
| `rollup_creation_burn_rate` | `0.01`               | Frazione dello stake di creazione bruciata (1%) |
| `default_challenge_window`  | `604,800` s (testnet: `3,600` s) | Finestra di contestazione predefinita (7 giorni; 1 ora sulla testnet) |
| `max_da_blob_size`          | `2,097,152`          | Dimensione massima del blob DA in byte (2 MB) |
| `blob_retention_blocks`     | `432,000`            | Blocchi per cui conservare i blob DA (circa 16 giorni con blocchi da ≈3,2 s) |
| `max_batches_per_block`     | `10`                 | Numero massimo di batch elaborati per blocco  |

Nessun rollup è ancora stato creato su nessuna delle due reti.

---

## Modulo FairBlock (`x/fairblock`)

Valori del genesis (il modulo non ha un servizio di query, quindi non possono essere riletti in diretta):

| Parametro            | Valore  | Descrizione                                 |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | La cifratura tIBE di FairBlock è disattivata |
| `tibe_threshold`     | `5`     | Numero minimo di share di chiave di decifratura richieste |
| `decryption_delay`   | `3`     | Blocchi dopo la finalizzazione prima della decifratura |
| `max_encrypted_size` | `65536` | Dimensione massima del payload cifrato in byte |

---

## Modulo Gas Abstraction (`x/gasabstraction`)

Configurazione del genesis (`enabled = true`, `native_denom = uqor`):

| Denom token | Tasso di conversione | Descrizione            |
| ----------- | -------------------- | ---------------------- |
| `uqor`      | `1.0`                | Token nativo QOR (1:1) |
| `ibc/USDC`  | `1.0`                | USDC trasferito via IBC |
| `ibc/ATOM`  | `10.0`               | ATOM trasferito via IBC |

Il tasso di conversione è quello usato quando si converte una commissione pagata in quel token.

:::note Nessun token IBC accettato per le commissioni
Sulla mainnet non è aperto alcun canale IBC, quindi lì non possono esistere `ibc/USDC` né `ibc/ATOM`; l'unico canale di test della testnet porta un piccolo saldo di voucher di test, ma anche la sua lista dei token accettati è solo `uqor`. Le commissioni si pagano in `uqor`.
:::

---

## Modulo Light Node (`x/lightnode`)

| Parametro                | Valore             | Descrizione                                          |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Commissione per registrare un light node       |
| `heartbeat_interval`     | `1000` blocchi     | Blocchi tra gli heartbeat richiesti (circa 54 minuti con blocchi da ≈3,2 s) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1.000 QOR) | Stake minimo delegato dall'operatore |
| `reward_share`           | `0.03`             | Quota del fee collector accantonata per i light node |
| `min_uptime_for_rewards` | `0.80`             | Frazione minima di uptime per l'idoneità ai reward   |
| `max_light_nodes`        | `10,000`           | Numero massimo di light node registrati              |
| `heartbeat_grace_period` | `100` blocchi      | Periodo di tolleranza per un heartbeat in ritardo    |

La contabilità dei reward è attiva. `GET /qorechain/lightnode/v1/reward_pool` riporta il pool (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) e il limite di reward per nodo. Dalla v3.2.3 il limite è `max_reward_per_month_per_node`, **2.000 QOR (`2000000000` uqor) per nodo ogni 30 giorni**, riproporzionato in base al tempo di blocco e scalato in base all'uptime del nodo; il precedente valore per blocco (`max_reward_per_block_per_node`, `1713` uqor) continua a essere riportato. Il 20 ottobre 2026 il pool conteneva una riserva di 487,2318 QOR senza nulla in sospeso. La registrazione è aperta e subordinata a una licenza: sulla mainnet sono state concesse sei licenze `lightnode_operator` e nessun light node si è ancora registrato (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). Vedi [Light Node](/light-node/overview#reward-program-status) e [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## Modulo AMM (`x/amm`)

| Parametro               | Valore                        | Descrizione                         |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Commissione di swap (0,30%)         |
| `protocol_fee_bps`      | `10`                          | Quota della commissione di protocollo (0,10%) |
| `min_liquidity`         | `1000`                        | Liquidità minima                    |
| `max_pools_per_creator` | `50`                          | Numero massimo di pool per creatore |
| `lp_token_decimals`     | `6`                           | Decimali di visualizzazione delle quote LP (le quote sono voci di registro, non token) |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Commissione per creare un pool      |
| `max_swap_impact_bps`   | `500`                         | Impatto di prezzo massimo di uno swap (5%) |
| `enabled`               | `true`                        | Flag di attivazione del modulo      |

Non esiste ancora alcun pool su mainnet né su testnet, e `MsgPausePool` / `MsgResumePool` sono disattivati sulla mainnet.

---

## Smart Account (`x/abstractaccount`)

:::caution Disattivato sulla mainnet
Sulla mainnet `enabled` è `false` (sulla testnet è `true`, verificato il 27 ottobre 2026): la registrazione di un authenticator, l'esecuzione tramite uno di essi e la creazione di uno smart account sono tutte rifiutate finché è disattivato. Controlla `GET /qorechain/abstractaccount/v1/config` prima di costruire su queste funzionalità.
:::

| Parametro             | Valore   | Descrizione                      |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false` (testnet: `true`) | Flag di attivazione del modulo |
| `max_session_keys`    | `10`     | Numero massimo di session key per account |
| `max_spending_rules`  | `5`      | Numero massimo di regole di spesa |
| `default_session_ttl` | `86400` s| Durata predefinita di una session key |

---

## Staking, slashing, governance, commissioni ed EVM {#core-modules}

Moduli standard del Cosmos SDK e dell'EVM, tutti letti in diretta sulla mainnet il 27 ottobre 2026 (invariati rispetto alle letture precedenti). La testnet coincide, salvo per i periodi di voto della governance, i precompile EVM attivi e il permesso di istanziazione di QoreChain Native (vedi [Differenze tra testnet e mainnet](#testnet-differences)).

| Modulo | Parametro | Valore |
| --- | --- | --- |
| Staking | `unbonding_time` | 1,814,400 s (21 giorni) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 blocchi (circa 8,9 ore con blocchi da ≈3,2 s) |
| | `min_signed_per_window` | 5 % (un validatore che firma meno del 5 % della finestra viene messo in jail) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| Governance | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | 172,800 s (2 giorni) ciascuno |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Distribution | `community_tax` | 0.02 |
| Fee market | `min_gas_price` | 0,1 uqor per gas |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 decimali) |
| | accesso alla creazione / chiamata di contratti | senza permessi |
| | `active_static_precompiles` | vuoto sulla mainnet (nessun precompile EVM è attivo; la testnet ne ha tre attivi, vedi sotto) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## Stato del circuit breaker {#circuit-breaker}

La chain può disattivare singoli tipi di messaggio tramite il circuit breaker del Cosmos SDK, controllato dall'account delle operazioni della fondazione e dalla governance. Un tipo di messaggio disattivato viene rifiutato all'ante handler su ogni lane. L'elenco in tempo reale si trova in `GET /cosmos/circuit/v1/disable_list`.

**Mainnet (27 ottobre 2026, 16 voci, invariate dal 14 ottobre):** creazione di account di vesting (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; e i quattro messaggi di controllo di PRISM (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). La lane EVM (`MsgEthereumTx`) è **aperta**: era stata disattivata dal 16 al 25 settembre ed è stata riaperta dall'upgrade v3.2.0.

**Testnet (27 ottobre 2026, 1 voce):** solo `MsgStoreCode` di QoreChain Native (caricamento dei contratti); l'istanziazione non è più disattivata lì.

Ogni altro tipo di messaggio, inclusi tutti i messaggi standard di bank, staking, governance, distribution, authz e di registrazione `x/pqc`, è abilitato. L'elenco è controllato dalla governance e può cambiare; interrogalo sempre.

---

## Differenze tra testnet e mainnet {#testnet-differences}

Letti in diretta il 27 ottobre 2026. La mainnet `qorechain-vladi` esegue la v3.2.4 (dall'altezza 3.742.566, 23 ottobre 2026; la proposta di governance 14 applicherebbe la v3.2.5 all'altezza 3.906.833 ed era in periodo di voto al momento della scrittura). La testnet `qorechain-diana` esegue la **v3.2.6**: la v3.2.4 è arrivata all'altezza 8.337.253 (19 ottobre 2026), la v3.2.5 all'altezza 8.890.800 (26 ottobre) e la v3.2.6 all'altezza 8.970.638 (27 ottobre). La testnet è una rete di staging che riceve ogni release per prima ed è configurata per i test, quindi i valori qui sotto differiscono da quelli della mainnet. Questa sezione riguarda le tabelle dei parametri di questa pagina; le funzionalità della v3.2.5 sono documentate il giorno in cui la mainnet applica quella release, e questa sezione viene rivista allora. Ogni parametro non elencato qui è identico su entrambe le reti (i valori di staking, slashing, distribuzione, fee-market, ERC-20, AMM, burn, light node, bridge, gas abstraction e staking con blocco temporale sono stati confrontati uno per uno).

| Area | Mainnet | Testnet |
| ---- | ------- | ------- |
| Periodi di voto della governance | `voting_period` 172.800 s (2 giorni); `expedited_voting_period` 86.400 s (1 giorno) | `voting_period` 14.400 s (4 ore); `expedited_voting_period` 3.600 s (1 ora). Depositi, quorum e soglie sono gli stessi |
| `x/inflation` | `emission_mode` `fixed`; `fixed_epoch_emission` 86.000 QOR; `max_total_emission` 590.000.000 QOR; `target_apy_bps` `0` | `emission_mode` `target_apy`; `target_apy_bps` `1667`; `fixed_epoch_emission` 16.239 QOR; `max_total_emission` 3.950.390.341.362.112.750 uqor, già raggiunto (`remaining_emission` `0` su `/qorechain/inflation/v1/epoch_info`, quindi la testnet non conia altro) |
| Precompile statici EVM attivi | nessuno (`[]`) | tre: il precompile dei parametri PRISM a `0x0000000000000000000000000000000000000C01` e i precompile a `0x...0a01` e `0x...0a02` |
| Agente PRISM (`x/rlconsensus`) | Modalità osservazione, nessuna policy caricata; messaggi di controllo disattivati | Modalità shadow con una policy dimostrativa (impostata dalla governance della testnet); `GET /qorechain/rlconsensus/v1/...` risponde (la mainnet risponde 501) |
| Smart account (`x/abstractaccount`) | `enabled` `false` | `enabled` `true` |
| RDK (`x/rdk`) | `max_rollups` 100; `default_challenge_window` 604.800 s | `max_rollups` 200; `default_challenge_window` 3.600 s |
| Multilayer (`x/multilayer`) | `max_sidechains` 10 | `max_sidechains` 64 |
| Permesso di istanziazione di QoreChain Native | `Nobody` | `Everybody` (il caricamento del codice resta `Nobody` su entrambe) |
| Circuit breaker | 16 voci (vedi sopra) | 1 voce: `MsgStoreCode` di QoreChain Native |
| Route dei parametri tramite REST | i parametri di `x/pqc`, `x/crossvm` e `x/rlconsensus` rispondono 501 | `GET /qorechain/pqc/v1/params`, `/qorechain/crossvm/v1/params` e `/qorechain/rlconsensus/v1/params` rispondono (v3.2.6) |
| Tempo di blocco e validatori | circa 3,2 s; 8 validatori bonded | circa 1,3 s; 4 validatori bonded |
| Token di test | nessuno | fUSD, fETH e fBTC (vedi [Faucet](/dashboard/faucet#fest-tokens)) |

Entrambe le reti includono le novità della v3.2.4: il modulo opzionale di staking con blocco temporale `x/stakingtier` (49 moduli invece di 48; `GET /qorechain/stakingtier/v1/params`, blocco minimo 10 QOR, penale di sblocco anticipato 5 %), una tredicesima fonte di burn registrata (`staking_tier_penalty`), campi di reporting aggiuntivi del reward pool dei light node con un limite di reward che parte dalla registrazione del nodo stesso, il flag `possession_proven` sugli account PQC (la prova di possesso resta opzionale per le chiavi degli account ed è obbligatoria per le chiavi dei validatori del bridge), la finestra di contestazione RDK conteggiata in tempo di blocco, e le query `protocol_features` e `auth_nonce`. Vedi [Staking e delega](/user-guide/staking-and-delegation#time-locked-staking). Le novità della v3.2.6 sulla testnet sono riassunte nella [Cronologia delle versioni](/appendix/version-history#testnet-v326).
