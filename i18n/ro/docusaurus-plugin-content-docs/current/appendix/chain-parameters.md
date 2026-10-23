---
slug: /appendix/chain-parameters
title: Parametrii lanțului
sidebar_label: Parametrii lanțului
sidebar_position: 2
---

# Parametrii lanțului

Referință consolidată a parametrilor de modul ai rețelelor QoreChain, grupați pe module. Parametrii pot fi interogați cu `qorechaind query <module> params` acolo unde modulul are o interogare params (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` și `gasabstraction` folosesc `config`) și, prin REST, doar pentru rutele enumerate în [referința REST / gRPC](/api-reference/rest-grpc-endpoints). Parametrii `x/inflation` sunt serviți și prin REST pe mainnet începând cu v3.2.3 (`/qorechain/inflation/v1/params`). REST nu este disponibil pentru `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` sau `xqore`.

:::note
Valorile afișate au fost citite în direct de pe mainnet **`qorechain-vladi`** (EVM chain ID **9801**, versiunea **v3.2.4**, aplicată la 23 octombrie 2026) la 23 octombrie 2026 (valori de genesis, cu excepția cazurilor în care o propunere de guvernanță le-a schimbat; acestea sunt menționate). Ele sunt identice pe testnet **`qorechain-diana`** (EVM chain ID **9800**, versiunea **v3.2.4** din 19 octombrie 2026), cu excepția cazurilor indicate; diferențele rămase sunt adunate în [Diferențe între testnet și mainnet](#testnet-differences). Duratele exprimate în blocuri sunt convertite la timpul de bloc măsurat pe mainnet, de aproximativ 3,2 secunde (testnet-ul produce un bloc aproximativ la fiecare secundă).
:::

---

## Modulul PQC (`x/pqc`)

| Parametru                  | Valoare                    | Descriere                                                                |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Semnăturile post-cuantice sunt schema principală                         |
| `allow_classical_fallback` | `false`                    | Fallback-ul exclusiv clasic este închis; tranzacțiile din lane-ul Cosmos trebuie să fie hibride |
| `min_security_level`       | `5`                        | Nivelul minim de securitate NIST pentru un algoritm înregistrat          |
| `default_migration_blocks` | `1,000,000`                | Durata implicită a unei migrări de algoritm pornite prin guvernanță (aproximativ 37 de zile la blocuri de ≈3,2 s) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (required)             | Mod de aplicare: 0=dezactivat, 1=opțional, 2=obligatoriu                 |

Registrul de algoritmi (id 1 `dilithium5`, id 2 `mlkem1024`) este stare a lanțului, nu un parametru. Cheile se înregistrează explicit cu `MsgRegisterPQCKey` sau `MsgRegisterPQCKeyV2`; nu există înregistrare automată. Începând cu v3.2.3, lanțul refuză cheile publice slabe, degenerate și deja folosite, iar `MsgRegisterPQCKeyV2` acceptă o dovadă opțională de posesie (`tx pqc register-key-v2 ... --pqc-key <name>`) pe care lanțul o verifică atunci când este prezentă.

### Limitele ferestrei de autorizare EVM {#evm-window-limits}

Limitele unei [ferestre de autorizare EVM](/getting-started/first-transaction#evm-window) sunt constante de protocol, nu parametri de modul:

| Limită | Valoare |
| ------ | ------- |
| `blocks` maxim | 17,280 (aproximativ 15 ore la blocuri de ≈3,2 s) |
| `max_txs` maxim | 1,000 |
| `max_value` | mai mare decât 0 (uqor; valoarea transferată plus comisionul maxim al fiecărei tranzacții) |
| `allowed_targets` maxim | 16 adrese de destinatar (domeniu opțional, v3.2.3) |

O fereastră poate fi restrânsă și cu `native_only` (doar transferuri simple de QOR nativ) începând cu v3.2.3.

---

## Modulul AI (`x/ai`)

Configurația modulului (`qorechaind query ai config`):

| Parametru           | Valoare                | Descriere                                                                   |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Scorul de anomalie peste care ante handler-ul marchează o tranzacție        |
| `routing_strategy`  | `reputation_weighted`  | Strategia de rutare                                                         |
| `risk_threshold`    | `0.8`                  | Pragul scorului de risc                                                     |
| `max_tx_per_minute` | `600`                  | Limita de tranzacții per expeditor în lane-ul Cosmos, numărate pe o fereastră de 30 de blocuri (aproximativ 96 s la blocuri de ≈3,2 s; numele este istoric). Aplicată începând cu v3.2.0; valoarea implicită este 10 |

Ponderile de scorare a fraudei și pragurile de severitate descrise în pagina [Motorul AI](/architecture/ai-engine) sunt constante ale detectorului, nu parametri de modul.

---

## Modulul Reputation (`x/reputation`)

| Parametru   | Valoare | Descriere                                            |
| ----------- | ------- | ---------------------------------------------------- |
| `alpha`     | `0.30`  | Pondere pentru scorul de uptime (S\_i) în formula de reputație |
| `beta`      | `0.35`  | Pondere pentru scorul de participare (P\_i)          |
| `gamma`     | `0.20`  | Pondere pentru scorul comunitar (C\_i)               |
| `delta`     | `0.15`  | Pondere pentru scorul de vechime (T\_i)              |
| `lambda`    | `1000`  | Scala decăderii în timp pentru scorurile istorice    |
| `min_score` | `0.10`  | Pragul minim al unui scor de reputație               |

Formula de reputație: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`, cu decădere în timp aplicată scorurilor istorice.

---

## Modulul QCA (`x/qca`)

:::note Implementat, încă neactiv
Logica Triple-Pool CPoS este implementată în `x/qca` și acești parametri sunt pe lanț, dar **nu sunt încă integrați în producția de blocuri, recompense, slashing sau numărătoarea voturilor de guvernanță**. Slashing-ul în vigoare este modulul standard `x/slashing` (vezi [Staking, slashing, guvernanță, comisioane și EVM](#core-modules)). Vezi [Mecanismul de consens](/architecture/consensus-mechanism).
:::

Configurația (`qorechaind query qca config`):

| Parametru                       | Valoare             | Descriere                                             |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | Setarea de genesis pentru ponderarea prin reputație   |
| `min_reputation_score`          | `0.1`               | Scorul minim de reputație                             |
| `pool_classification_interval`  | `1000` blocks       | Blocuri între clasificările pool-urilor               |
| `pool_weight_rpos`              | `0.40`              | Ponderea de propunere a pool-ului RPoS                |
| `pool_weight_dpos`              | `0.35`              | Ponderea de propunere a pool-ului DPoS                |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | Delegarea minimă pentru pool-ul DPoS (10.000 QOR)   |
| `pool_rep_percentile_rpos`      | `70`                | Percentila de reputație pentru pool-ul RPoS           |
| `bonding_alpha`                 | `0.1`               | Parametru al curbei de bonding                        |
| `bonding_beta`                  | `1.0`               | Parametru al curbei de bonding                        |
| `bonding_phase_multiplier`      | `1.5`               | Multiplicatorul de fază al curbei de bonding          |
| `slashing_base_rate`            | `0.01`              | Rata de bază a slashing-ului progresiv                |
| `slashing_escalation_factor`    | `1.5`               | Factorul de escaladare a slashing-ului progresiv      |
| `slashing_max_penalty`          | `0.33`              | Penalizarea maximă a slashing-ului progresiv          |
| `slashing_decay_halflife`       | `100,000` blocks    | Timpul de înjumătățire al decăderii slashing-ului progresiv |
| `qdrw_enabled`                  | `false`             | Numărătoarea QDRW este dezactivată                    |
| `qdrw_xqore_multiplier`         | `2.0`               | Ponderea xQORE în formula QDRW                        |
| `qdrw_rep_min_multiplier`       | `0.5`               | Limita inferioară a multiplicatorului de reputație    |
| `qdrw_rep_max_multiplier`       | `2.0`               | Limita superioară a multiplicatorului de reputație    |

---

## Modulul Burn (`x/burn`)

| Parametru              | Valoare                      | Descriere                                             |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Fracțiunea din colectorul de comisioane care este arsă |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Comision fix de ardere pentru crearea unui contract   |
| `ai_service_burn_rate` | `0.50`                       | Fracțiunea din comisioanele serviciilor AI care este arsă |
| `bridge_burn_rate`     | `1.00`                       | Fracțiunea din comisioanele de bridge care este arsă  |
| `failed_tx_burn_rate`  | `0.10`                       | Fracțiunea din gazul tranzacțiilor eșuate care este arsă (aplicată de lanț începând cu v3.2.2) |
| `validator_share`      | `0.37`                       | Fracțiunea distribuită validatorilor                  |
| `treasury_share`       | `0.20`                       | Fracțiunea trimisă trezoreriei                        |
| `staker_share`         | `0.10`                       | Fracțiunea distribuită stakerilor                     |
| `light_node_share`     | `0.03`                       | Fracțiunea distribuită nodurilor light                |
| `enabled`              | `true`                       | Indicator de activare a modulului                     |

Împărțirea comisioanelor este **37 / 30 / 20 / 10 / 3** între validatori, ardere, trezorerie, stakeri și noduri light; cotele trebuie să însumeze `1.00`. Există și un `milestone_burn_schedule`. Vezi [Tokenomics](/architecture/tokenomics).

---

## Modulul xQORE (`x/xqore`)

:::caution Încă indisponibil pe lanț
Contabilitatea modulului xQORE există, dar tranzacțiile de blocare și deblocare, interogările și comenzile CLI **nu sunt încă integrate în rețelele live**: în prezent nu se poate bloca niciun QOR și nu a fost emis niciun xQORE. Valorile de mai jos sunt configurația de genesis.
:::

| Parametru                 | Valoare                | Descriere                                            |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | Multiplicator al puterii de vot pentru deținătorii de xQORE |
| `min_lock_amount`         | `1,000,000 uqor`       | Suma minimă de blocat (1 QOR)                        |
| `penalty_burn_rate`       | `0.0`                  | Fracțiunea penalizărilor de ieșire care este arsă (toate sunt redistribuite) |
| `rebase_interval`         | `100` blocks           | Blocuri între evenimentele de rebase PvP             |
| `enabled`                 | `true`                 | Indicator de activare a modulului                    |

Penalizări de ieșire: 50 % (blocare mai scurtă de 30 de zile), 35 % (30–90 de zile), 15 % (90–180 de zile), 0 % (peste 180 de zile). Multiplicatori de blocare: 1,0 / 1,2 / 1,4 / 1,7 / 2,0 la 0 / 90 / 180 / 365 / 730 de zile.

---

## Modulul Inflation (`x/inflation`)

| Parametru              | Valoare                 | Descriere                                             |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (vechi) sau `fixed` (începând cu v3.1.94)  |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86.000 QOR) | Emis pe epocă în modul fixed (16.239 QOR înainte de propunerea de guvernanță 10, 19 octombrie 2026) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590.000.000 QOR) | Plafon cumulativ strict (114.285.714 QOR înainte de propunerea 10) |
| `epoch_length`         | `43,200` blocks         | Blocuri per epocă (aproximativ 38,6 ore la blocuri de ≈3,2 s) |
| `schedule`             | 17,5 %, 11 %, 7 %, 7 %, 2 % | Rate vechi pe ani, nefolosite în modul fixed      |
| `enabled`              | `true`                  | Indicator de activare a modulului                     |

Modulul emite această cantitate în colectorul de comisioane până la atingerea plafonului. Prima epocă la 86.000 QOR începe la blocul 3,672,000. La 23 octombrie 2026 (epoca 86) fuseseră emiși 105.420.896,21 QOR și rămâneau 484.579.103,79 QOR sub plafon (`GET /qorechain/inflation/v1/epoch_info`). Vezi [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## Modulul RL Consensus (`x/rlconsensus`)

Modulul `x/rlconsensus` implementează **PRISM**, stratul de optimizare prin învățare prin întărire. Pe ambele rețele este în modul de observație: nu este încărcată nicio pondere de politică, deci nu reglează nimic. Cele patru mesaje de control PRISM sunt dezactivate de întrerupătorul de circuit pe mainnet (vezi [Starea întrerupătorului de circuit](#circuit-breaker)).

| Parametru                        | Valoare        | Descriere                                                     |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Indicator de activare a modulului                             |
| `observation_interval`           | `10`           | Blocuri între eșantioanele de observație PRISM                |
| `agent_mode`                     | `1` (conservative) | Mod agent: 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | Schimbarea maximă de parametru per acțiune în modul conservative |
| `max_change_autonomous`          | `0.25`         | Schimbarea maximă de parametru per acțiune în modul autonomous |
| `circuit_breaker_window`         | `50`           | Fereastra întrerupătorului de circuit                         |
| `circuit_breaker_threshold`      | `0.50`         | Pragul întrerupătorului de circuit                            |
| `reward_weight_throughput`       | `0.30`         | Pondere de recompensă pentru throughput                       |
| `reward_weight_finality`         | `0.25`         | Pondere de recompensă pentru finalitate                       |
| `reward_weight_decentralization` | `0.20`         | Pondere de recompensă pentru descentralizare                  |
| `reward_weight_mev`              | `0.15`         | Pondere de recompensă pentru MEV                              |
| `reward_weight_failed_txs`       | `0.10`         | Pondere de recompensă pentru tranzacțiile eșuate              |
| `default_block_time_ms`          | `5000`         | Timpul de bloc implicit din baza de observație (nu timpul de bloc real) |
| `default_base_gas_price`         | `100`          | Prețul de bază implicit al gazului din baza de observație     |
| `default_validator_set_size`     | `100`          | Dimensiunea implicită a setului de validatori din baza de observație |

---

## Modulul Bridge (`x/bridge`)

:::caution Nu este live
Toate cele 37 de configurații de lanț sunt în starea `pending`, nu este înregistrat niciun validator de bridge, nu a fost creată nicio operațiune de bridge și niciun canal IBC nu este deschis pe vreuna dintre rețele. Vezi [Arhitectura bridge-ului](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config`:

| Parametru                  | Valoare                     | Descriere                                         |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Validatori necesari pentru setul de atestare      |
| `attestation_threshold`    | `7`                         | Atestări necesare                                 |
| `challenge_period_secs`    | `86400`                     | Perioada de contestare (24 de ore)                |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100.000 QOR) | Transferurile peste această valoare așteaptă perioada de contestare |
| `enabled`                  | `true`                      | Indicator de activare a modulului                 |

Setările per lanț (`min_confirmations`, `max_single_transfer`, `daily_limit`) se află în configurația fiecărui lanț, nu în parametrii modulului.

---

## Modulul Multilayer (`x/multilayer`)

| Parametru                      | Valoare          | Descriere                                         |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10`             | Numărul maxim de sidechain-uri înregistrate       |
| `max_paychains`                | `50`             | Numărul maxim de paychain-uri înregistrate        |
| `min_anchor_interval`          | `100`            | Intervalul minim de ancorare (blocuri)            |
| `max_anchor_interval`          | `1000`           | Intervalul maxim de ancorare (blocuri)            |
| `default_challenge_period`     | `86400` s        | Perioada implicită de contestare (1 zi)           |
| `min_sidechain_stake`          | `1,000,000,000`  | Stake minim pentru înregistrarea unui sidechain (1.000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Stake minim pentru înregistrarea unui paychain (100 QOR)    |
| `routing_enabled`              | `true`           | Rutarea între straturi este activată              |
| `routing_confidence_threshold` | `0.6`            | Pragul de încredere pentru rutarea automată       |
| `cross_layer_fee_bundling`     | `true`           | O singură plată de comision poate acoperi mai multe straturi |

---

## Modulul Cross-VM (`x/crossvm`)

| Parametru             | Valoare | Descriere                                      |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Dimensiunea maximă a mesajului cross-VM în octeți (64 KB) |
| `max_queue_size`      | `1000`  | Numărul maxim de mesaje în așteptare în coada cross-VM |
| `queue_timeout_blocks`| `100`   | Blocuri înainte ca un mesaj în așteptare să expire |
| `enabled`             | `true`  | Indicator de activare a modulului              |

`MsgCrossVMCall` este dezactivat pe mainnet de întrerupătorul de circuit (activat pe testnet).

---

## Modulul SVM (`x/svm`)

Valori de genesis:

| Parametru               | Valoare      | Descriere                                    |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Dimensiunea maximă a binarului de program în octeți (10 MB) |
| `max_account_data_size` | `10485760`   | Dimensiunea maximă a datelor unui cont în octeți (10 MB) |
| `compute_budget_max`    | `1400000`    | Unități de calcul maxime per tranzacție (1,4M) |
| `lamports_per_byte`     | `3480`       | Costul chiriei per octet, în lamports        |
| `rent_exemption_multi`  | `2.0`        | Ani de chirie necesari pentru scutire        |
| `enabled`               | `true`       | Indicator de activare a modulului            |
| `svm_slot_offset`       | `0`          | Decalajul de slot                            |
| `default_sig_scheme`    | `0`          | Schema de semnare implicită                  |
| `max_cpi`               | `4`          | Adâncimea maximă a invocării între programe  |

Lane-ul de tranzacții SVM este dezactivat la nivelul întregii rețele (vezi [Rețele](/appendix/networks)).

---

## Modulul RDK (`x/rdk`)

`qorechaind query rdk config`:

| Parametru                   | Valoare              | Descriere                                     |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100`                | Numărul maxim de rollup-uri înregistrate      |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Stake minim al operatorului (10.000 QOR)      |
| `rollup_creation_burn_rate` | `0.01`               | Fracțiunea din stake-ul de creare care este arsă (1%) |
| `default_challenge_window`  | `604,800` s          | Fereastra implicită de contestare (7 zile)    |
| `max_da_blob_size`          | `2,097,152`          | Dimensiunea maximă a blob-ului DA în octeți (2 MB) |
| `blob_retention_blocks`     | `432,000`            | Blocuri pentru păstrarea blob-urilor DA (aproximativ 16 zile la blocuri de ≈3,2 s) |
| `max_batches_per_block`     | `10`                 | Numărul maxim de batch-uri procesate per bloc |

Până acum nu a fost creat niciun rollup pe vreuna dintre rețele.

---

## Modulul FairBlock (`x/fairblock`)

Valori de genesis (modulul nu are serviciu de interogare, deci nu pot fi recitite în direct):

| Parametru            | Valoare | Descriere                                   |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | Criptarea tIBE FairBlock este dezactivată   |
| `tibe_threshold`     | `5`     | Numărul minim de cote de chei de decriptare necesare |
| `decryption_delay`   | `3`     | Blocuri după finalizare înainte de decriptare |
| `max_encrypted_size` | `65536` | Dimensiunea maximă a payload-ului criptat în octeți |

---

## Modulul Gas Abstraction (`x/gasabstraction`)

Configurația de genesis (`enabled = true`, `native_denom = uqor`):

| Denominare token | Rată de conversie | Descriere              |
| ---------------- | ----------------- | ---------------------- |
| `uqor`           | `1.0`             | Token QOR nativ (1:1)  |
| `ibc/USDC`       | `1.0`             | USDC adus prin bridge IBC |
| `ibc/ATOM`       | `10.0`            | ATOM adus prin bridge IBC |

Rata de conversie este rata folosită la convertirea unui comision plătit în acel token.

:::note Niciun canal IBC nu este deschis
Niciun canal IBC nu este deschis pe vreuna dintre rețele, deci încă nu pot exista `ibc/USDC` sau `ibc/ATOM`; comisioanele se plătesc în `uqor`.
:::

---

## Modulul Light Node (`x/lightnode`)

| Parametru                | Valoare            | Descriere                                            |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Comisionul de înregistrare a unui nod light    |
| `heartbeat_interval`     | `1000` blocks      | Blocuri între heartbeat-urile obligatorii (aproximativ 54 de minute la blocuri de ≈3,2 s) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1.000 QOR) | Stake-ul minim delegat de operator     |
| `reward_share`           | `0.03`             | Fracțiunea din colectorul de comisioane rezervată nodurilor light |
| `min_uptime_for_rewards` | `0.80`             | Fracțiunea minimă de uptime pentru eligibilitatea la recompense |
| `max_light_nodes`        | `10,000`           | Numărul maxim de noduri light înregistrate           |
| `heartbeat_grace_period` | `100` blocks       | Perioada de grație pentru un heartbeat întârziat     |

Contabilitatea recompenselor este live. `GET /qorechain/lightnode/v1/reward_pool` raportează pool-ul (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) și limita de recompensă per nod. Începând cu v3.2.3, limita este `max_reward_per_month_per_node`, **2.000 QOR (`2000000000` uqor) per nod la 30 de zile**, calculată proporțional cu timpul de bloc și scalată cu uptime-ul nodului; valoarea mai veche per bloc (`max_reward_per_block_per_node`, `1713` uqor) este în continuare raportată. La 20 octombrie 2026, pool-ul avea o rezervă de 487,2318 QOR, fără nimic restant. Înregistrarea este deschisă și condiționată de licență: pe mainnet au fost acordate șase licențe `lightnode_operator`, iar niciun nod light nu s-a înregistrat încă (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). Vezi [Nod light](/light-node/overview#reward-program-status) și [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## Modulul AMM (`x/amm`)

| Parametru               | Valoare                       | Descriere                           |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Comisionul de swap (0,30%)          |
| `protocol_fee_bps`      | `10`                          | Partea de comision a protocolului (0,10%) |
| `min_liquidity`         | `1000`                        | Lichiditatea minimă                 |
| `max_pools_per_creator` | `50`                          | Numărul maxim de pool-uri per creator |
| `lp_token_decimals`     | `6`                           | Zecimalele tokenului LP             |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Comisionul de creare a unui pool    |
| `max_swap_impact_bps`   | `500`                         | Impactul maxim asupra prețului al unui swap (5%) |
| `enabled`               | `true`                        | Indicator de activare a modulului   |

Nu există încă pool-uri pe mainnet sau testnet, iar `MsgPausePool` / `MsgResumePool` sunt dezactivate pe mainnet.

---

## Conturi inteligente (`x/abstractaccount`)

:::caution Dezactivat pe ambele rețele
`enabled` este `false`: înregistrarea unui autentificator, execuția printr-unul și crearea unui cont inteligent sunt toate refuzate cât timp este dezactivat. Verificați `GET /qorechain/abstractaccount/v1/config` înainte de a construi pe aceste funcționalități.
:::

| Parametru             | Valoare  | Descriere                        |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false`  | Indicator de activare a modulului |
| `max_session_keys`    | `10`     | Numărul maxim de chei de sesiune per cont |
| `max_spending_rules`  | `5`      | Numărul maxim de reguli de cheltuire |
| `default_session_ttl` | `86400` s| Durata implicită de viață a unei chei de sesiune |

---

## Staking, slashing, guvernanță, comisioane și EVM {#core-modules}

Module standard Cosmos SDK și EVM, citite în direct la 23 octombrie 2026 pentru rândurile de staking, slashing, guvernanță și distribuție (rândurile fee-market, EVM, ERC-20 și QoreChain Native au fost citite ultima dată la 20 octombrie 2026); identice pe ambele rețele, cu excepția cazurilor indicate, și neschimbate de upgrade-ul v3.2.4.

| Modul | Parametru | Valoare |
| --- | --- | --- |
| Staking | `unbonding_time` | 1,814,400 s (21 de zile) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 de blocuri (aproximativ 8,9 ore la blocuri de ≈3,2 s) |
| | `min_signed_per_window` | 5 % (un validator care semnează mai puțin de 5 % din fereastră este trimis în jail) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| Guvernanță | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | 172,800 s (2 zile) fiecare |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Distribuție | `community_tax` | 0.02 |
| Piața de comisioane | `min_gas_price` | 0,1 uqor per gaz |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 zecimale) |
| | acces la crearea / apelarea contractelor | fără permisiuni |
| | `active_static_precompiles` | gol (niciun precompile EVM nu este activ) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## Starea întrerupătorului de circuit {#circuit-breaker}

Lanțul poate dezactiva tipuri individuale de mesaje cu întrerupătorul de circuit din Cosmos SDK, controlat de contul de operațiuni al fundației și de guvernanță. Un tip de mesaj dezactivat este respins de ante handler pe orice lane. Lista live se află la `GET /cosmos/circuit/v1/disable_list`.

**Mainnet (20 octombrie 2026, 16 intrări, neschimbate din 14 octombrie):** crearea de conturi de vesting (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; și cele patru mesaje de control PRISM (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). Lane-ul EVM (`MsgEthereumTx`) este **deschis**: a fost dezactivat între 16 și 25 septembrie și redeschis de upgrade-ul v3.2.0.

**Testnet (20 octombrie 2026):** doar cele trei mesaje QoreChain Native.

Orice alt tip de mesaj, inclusiv toate mesajele standard bank, staking, governance, distribution, authz și de înregistrare `x/pqc`, este activat. Lista este controlată prin guvernanță și se poate schimba; interogați-o întotdeauna.

---

## Diferențe între testnet și mainnet {#testnet-differences}

Ambele rețele rulează v3.2.4: testnet-ul `qorechain-diana` de la înălțimea 8,337,253 (19 octombrie 2026), mainnet-ul `qorechain-vladi` de la înălțimea 3,742,566 (23 octombrie 2026, propunerea de guvernanță 13). Adăugirile v3.2.4 sunt deci aceleași pe ambele rețele: modulul opțional de staking cu blocare în timp `x/stakingtier` (49 de module în loc de 48; `GET /qorechain/stakingtier/v1/params`, blocare minimă 10 QOR, penalizare la deblocare anticipată 5 %), un al treilea `emission_mode` (`target_apy`, cu `target_apy_bps` la `0` pe ambele rețele), o a treisprezecea sursă înregistrată de ardere (`staking_tier_penalty`), câmpuri suplimentare de raportare a pool-ului de recompense al nodurilor light (`monthly_cap_active`, `last_distribution_time`, `last_distribution_height`) cu o limită de recompensă care începe de la propria înregistrare a nodului, indicatorul `possession_proven` pe conturile PQC (dovada de posesie rămâne opțională pentru cheile de cont și este obligatorie pentru cheile validatorilor de bridge), fereastra de contestare RDK numărată în timp de bloc și interogările `protocol_features` și `auth_nonce`. Vezi [Staking și delegare](/user-guide/staking-and-delegation#time-locked-staking). La 23 octombrie 2026, cele două rețele diferă doar prin valorile de mai jos.

Aceste valori sunt specifice testnet-ului:

| Zonă | Testnet |
| ---- | ------- |
| Valorile `x/inflation` | Valori de emisie mai vechi (16.239 QOR per epocă, plafon 114.285.714 QOR, deja atins); mainnet-ul folosește valorile stabilite prin propunerea de guvernanță 10. |
| Întrerupător de circuit | Doar cele trei mesaje QoreChain Native (vezi mai sus). |

Orice parametru care nu este enumerat aici este identic pe ambele rețele.
