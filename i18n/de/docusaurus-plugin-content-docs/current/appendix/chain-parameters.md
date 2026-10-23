---
slug: /appendix/chain-parameters
title: Chain-Parameter
sidebar_label: Chain-Parameter
sidebar_position: 2
---

# Chain-Parameter

Konsolidierte Referenz der Modulparameter der QoreChain-Netzwerke, nach Modul gruppiert. Die Parameter können mit `qorechaind query <module> params` abgefragt werden, sofern das Modul eine Params-Abfrage besitzt (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` und `gasabstraction` verwenden `config`), und über REST nur für die in der [REST- / gRPC-Referenz](/api-reference/rest-grpc-endpoints) aufgeführten Routen. Die Parameter von `x/inflation` werden im Mainnet seit v3.2.3 ebenfalls über REST bereitgestellt (`/qorechain/inflation/v1/params`). REST ist für `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` und `xqore` nicht verfügbar.

:::note
Die angezeigten Werte wurden live aus dem Mainnet **`qorechain-vladi`** (EVM-Chain-ID **9801**, Release **v3.2.4**, angewendet am 23. Oktober 2026) am 23. Oktober 2026 ausgelesen (Genesis-Werte, sofern kein Governance-Vorschlag sie geändert hat; solche Fälle sind vermerkt). Sie sind auf dem Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**, Release **v3.2.4** seit dem 19. Oktober 2026) identisch, sofern nicht anders angegeben; die verbleibenden Unterschiede sind unter [Unterschiede zwischen Testnet und Mainnet](#testnet-differences) zusammengefasst. In Blöcken angegebene Dauern werden mit der gemessenen Mainnet-Blockzeit von etwa 3,2 Sekunden umgerechnet (das Testnet erzeugt etwa jede Sekunde einen Block).
:::

---

## PQC-Modul (`x/pqc`)

| Parameter                  | Wert                       | Beschreibung                                                             |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Post-Quanten-Signaturen sind das primäre Verfahren                        |
| `allow_classical_fallback` | `false`                    | Rein klassischer Fallback ist geschlossen; Transaktionen auf der Cosmos-Lane müssen hybrid sein |
| `min_security_level`       | `5`                        | Minimales NIST-Sicherheitsniveau für einen registrierten Algorithmus      |
| `default_migration_blocks` | `1,000,000`                | Standardlänge einer per Governance gestarteten Algorithmus-Migration (etwa 37 Tage bei Blöcken von ≈3,2 s) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (erforderlich)         | Durchsetzungsmodus: 0=deaktiviert, 1=optional, 2=erforderlich             |

Die Algorithmus-Registry (ID 1 `dilithium5`, ID 2 `mlkem1024`) ist Chain-State und kein Parameter. Schlüssel werden explizit mit `MsgRegisterPQCKey` oder `MsgRegisterPQCKeyV2` registriert; es gibt keine automatische Registrierung. Seit v3.2.3 weist die Chain schwache, degenerierte und bereits verwendete öffentliche Schlüssel zurück, und `MsgRegisterPQCKeyV2` akzeptiert einen optionalen Besitznachweis (`tx pqc register-key-v2 ... --pqc-key <name>`), den die Chain prüft, sofern er vorliegt.

### Grenzen des EVM-Autorisierungsfensters {#evm-window-limits}

Die Grenzen eines [EVM-Autorisierungsfensters](/getting-started/first-transaction#evm-window) sind Protokollkonstanten und keine Modulparameter:

| Grenze | Wert |
| ----- | ----- |
| Maximale `blocks` | 17.280 (etwa 15 Stunden bei Blöcken von ≈3,2 s) |
| Maximale `max_txs` | 1.000 |
| `max_value` | größer als 0 (uqor; übertragener Wert plus die maximale Gebühr jeder Transaktion) |
| Maximale `allowed_targets` | 16 Empfängeradressen (optionale Einschränkung, v3.2.3) |

Ein Fenster kann ab v3.2.3 zusätzlich mit `native_only` eingeschränkt werden (nur einfache native QOR-Transfers).

---

## AI-Modul (`x/ai`)

Die Konfiguration des Moduls (`qorechaind query ai config`):

| Parameter           | Wert                   | Beschreibung                                                                |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Anomalie-Score, oberhalb dessen der Ante-Handler eine Transaktion markiert   |
| `routing_strategy`  | `reputation_weighted`  | Routing-Strategie                                                            |
| `risk_threshold`    | `0.8`                  | Schwellenwert für den Risiko-Score                                           |
| `max_tx_per_minute` | `600`                  | Transaktionslimit pro Sender auf der Cosmos-Lane, gezählt über ein Fenster von 30 Blöcken (etwa 96 s bei Blöcken von ≈3,2 s; der Name ist historisch bedingt). Seit v3.2.0 durchgesetzt; der Standardwert ist 10 |

Die auf der Seite [AI Engine](/architecture/ai-engine) beschriebenen Betrugsbewertungsgewichte und Schweregrad-Schwellen sind Konstanten des Detektors, keine Modulparameter.

---

## Reputation-Modul (`x/reputation`)

| Parameter   | Wert   | Beschreibung                                         |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | Gewicht für den Verfügbarkeits-Score (S\_i) in der Reputationsformel |
| `beta`      | `0.35` | Gewicht für den Teilnahme-Score (P\_i)                |
| `gamma`     | `0.20` | Gewicht für den Community-Score (C\_i)                |
| `delta`     | `0.15` | Gewicht für den Zugehörigkeitsdauer-Score (T\_i)      |
| `lambda`    | `1000` | Skala des Zeitverfalls für historische Scores         |
| `min_score` | `0.10` | Untergrenze für einen Reputations-Score               |

Reputationsformel: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`, wobei auf historische Scores ein Zeitverfall angewendet wird.

---

## QCA-Modul (`x/qca`)

:::note Implementiert, noch nicht aktiv
Die Triple-Pool-CPoS-Logik ist in `x/qca` implementiert und diese Parameter liegen on-chain, sie sind aber **noch nicht in Blockproduktion, Belohnungen, Slashing oder die Governance-Auszählung eingebunden**. Das geltende Slashing ist das Standardmodul `x/slashing` (siehe [Staking, Slashing, Governance, Gebühren und EVM](#core-modules)). Siehe [Konsensmechanismus](/architecture/consensus-mechanism).
:::

Die Konfiguration (`qorechaind query qca config`):

| Parameter                       | Wert                | Beschreibung                                          |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | Genesis-Einstellung für die Reputationsgewichtung     |
| `min_reputation_score`          | `0.1`               | Minimaler Reputations-Score                           |
| `pool_classification_interval`  | `1000` Blöcke       | Blöcke zwischen Pool-Klassifizierungen                |
| `pool_weight_rpos`              | `0.40`              | Vorschlagsgewicht des RPoS-Pools                      |
| `pool_weight_dpos`              | `0.35`              | Vorschlagsgewicht des DPoS-Pools                      |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | Minimale Delegation für den DPoS-Pool (10.000 QOR)  |
| `pool_rep_percentile_rpos`      | `70`                | Reputations-Perzentil für den RPoS-Pool               |
| `bonding_alpha`                 | `0.1`               | Parameter der Bonding-Kurve                           |
| `bonding_beta`                  | `1.0`               | Parameter der Bonding-Kurve                           |
| `bonding_phase_multiplier`      | `1.5`               | Phasenmultiplikator der Bonding-Kurve                 |
| `slashing_base_rate`            | `0.01`              | Basisrate des progressiven Slashings                  |
| `slashing_escalation_factor`    | `1.5`               | Eskalationsfaktor des progressiven Slashings          |
| `slashing_max_penalty`          | `0.33`              | Maximale Strafe des progressiven Slashings            |
| `slashing_decay_halflife`       | `100,000` Blöcke    | Zerfalls-Halbwertszeit des progressiven Slashings     |
| `qdrw_enabled`                  | `false`             | QDRW-Auszählung ist deaktiviert                       |
| `qdrw_xqore_multiplier`         | `2.0`               | Gewicht von xQORE in der QDRW-Formel                  |
| `qdrw_rep_min_multiplier`       | `0.5`               | Untergrenze des Reputationsmultiplikators             |
| `qdrw_rep_max_multiplier`       | `2.0`               | Obergrenze des Reputationsmultiplikators              |

---

## Burn-Modul (`x/burn`)

| Parameter              | Wert                         | Beschreibung                                          |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Anteil des Gebühren-Sammelkontos, der verbrannt wird   |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Pauschale Burn-Gebühr für die Vertragserstellung       |
| `ai_service_burn_rate` | `0.50`                       | Anteil der AI-Servicegebühren, der verbrannt wird      |
| `bridge_burn_rate`     | `1.00`                       | Anteil der Bridge-Gebühren, der verbrannt wird         |
| `failed_tx_burn_rate`  | `0.10`                       | Anteil des Gas fehlgeschlagener Transaktionen, der verbrannt wird (von der Chain seit v3.2.2 angewendet) |
| `validator_share`      | `0.37`                       | An Validatoren verteilter Anteil                      |
| `treasury_share`       | `0.20`                       | An die Treasury gesendeter Anteil                     |
| `staker_share`         | `0.10`                       | An Staker verteilter Anteil                           |
| `light_node_share`     | `0.03`                       | An Light Nodes verteilter Anteil                      |
| `enabled`              | `true`                       | Modul-Aktivierungsflag                                |

Die Gebührenaufteilung beträgt **37 / 30 / 20 / 10 / 3** auf Validatoren, Verbrennung, Treasury, Staker und Light Nodes; die Anteile müssen sich auf `1.00` summieren. Zusätzlich existiert ein `milestone_burn_schedule`. Siehe [Tokenomics](/architecture/tokenomics).

---

## xQORE-Modul (`x/xqore`)

:::caution Noch nicht on-chain verfügbar
Die Buchführung des xQORE-Moduls existiert, aber die Sperr- und Entsperr-Transaktionen, Abfragen und CLI-Befehle sind **noch nicht in die Live-Netzwerke eingebunden**: Derzeit kann kein QOR gesperrt werden, und es wurde noch kein xQORE geprägt. Die folgenden Werte sind die Genesis-Konfiguration.
:::

| Parameter                 | Wert                   | Beschreibung                                         |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | Multiplikator der Stimmkraft für xQORE-Inhaber        |
| `min_lock_amount`         | `1,000,000 uqor`       | Mindestbetrag zum Sperren (1 QOR)                    |
| `penalty_burn_rate`       | `0.0`                  | Anteil der Ausstiegsstrafen, der verbrannt wird (alle werden umverteilt) |
| `rebase_interval`         | `100` Blöcke           | Blöcke zwischen PvP-Rebase-Ereignissen               |
| `enabled`                 | `true`                 | Modul-Aktivierungsflag                               |

Ausstiegsstrafen: 50 % (Sperre kürzer als 30 Tage), 35 % (30–90 Tage), 15 % (90–180 Tage), 0 % (über 180 Tage). Sperr-Multiplikatoren: 1.0 / 1.2 / 1.4 / 1.7 / 2.0 bei 0 / 90 / 180 / 365 / 730 Tagen.

---

## Inflation-Modul (`x/inflation`)

| Parameter              | Wert                    | Beschreibung                                          |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (veraltet) oder `fixed` (seit v3.1.94)      |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86.000 QOR) | Pro Epoche im Fixed-Modus geprägt (16.239 QOR vor Governance-Vorschlag 10, 19. Oktober 2026) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590.000.000 QOR) | Harte kumulative Obergrenze (114.285.714 QOR vor Vorschlag 10) |
| `epoch_length`         | `43,200` Blöcke         | Blöcke pro Epoche (etwa 38,6 Stunden bei Blöcken von ≈3,2 s) |
| `schedule`             | 17,5 %, 11 %, 7 %, 7 %, 2 % | Veraltete jahresbasierte Raten, im Fixed-Modus ungenutzt |
| `enabled`              | `true`                  | Modul-Aktivierungsflag                                |

Das Modul prägt diese Emission in das Gebühren-Sammelkonto, bis die Obergrenze erreicht ist. Die erste Epoche mit 86.000 QOR beginnt bei Block 3.672.000. Am 23. Oktober 2026 (Epoche 86) waren 105.420.896,21 QOR geprägt, und 484.579.103,79 QOR verblieben unter der Obergrenze (`GET /qorechain/inflation/v1/epoch_info`). Siehe [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## RL-Consensus-Modul (`x/rlconsensus`)

Das Modul `x/rlconsensus` implementiert **PRISM**, die Reinforcement-Learning-Optimierungsschicht. In beiden Netzwerken befindet es sich im Beobachtungsmodus: Es sind keine Policy-Gewichte geladen, es stimmt also nichts ab. Die vier PRISM-Steuernachrichten sind im Mainnet durch den Circuit Breaker abgeschaltet (siehe [Circuit-Breaker-Status](#circuit-breaker)).

| Parameter                        | Wert           | Beschreibung                                                  |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Modul-Aktivierungsflag                                        |
| `observation_interval`           | `10`           | Blöcke zwischen PRISM-Beobachtungsstichproben                 |
| `agent_mode`                     | `1` (konservativ) | Agentenmodus: 0=Shadow, 1=konservativ, 2=autonom, 3=pausiert |
| `max_change_conservative`        | `0.10`         | Maximale Parameteränderung pro Aktion im konservativen Modus  |
| `max_change_autonomous`          | `0.25`         | Maximale Parameteränderung pro Aktion im autonomen Modus      |
| `circuit_breaker_window`         | `50`           | Fenster des Circuit Breakers                                  |
| `circuit_breaker_threshold`      | `0.50`         | Schwellenwert des Circuit Breakers                            |
| `reward_weight_throughput`       | `0.30`         | Belohnungsgewicht für Durchsatz                               |
| `reward_weight_finality`         | `0.25`         | Belohnungsgewicht für Finalität                               |
| `reward_weight_decentralization` | `0.20`         | Belohnungsgewicht für Dezentralisierung                       |
| `reward_weight_mev`              | `0.15`         | Belohnungsgewicht für MEV                                     |
| `reward_weight_failed_txs`       | `0.10`         | Belohnungsgewicht für fehlgeschlagene Transaktionen           |
| `default_block_time_ms`          | `5000`         | Standard-Blockzeit in der Beobachtungs-Baseline (nicht die tatsächliche Blockzeit) |
| `default_base_gas_price`         | `100`          | Standard-Basis-Gaspreis in der Beobachtungs-Baseline          |
| `default_validator_set_size`     | `100`          | Standardgröße des Validator-Sets in der Beobachtungs-Baseline |

---

## Bridge-Modul (`x/bridge`)

:::caution Nicht live
Alle 37 Chain-Konfigurationen haben den Status `pending`, es sind keine Bridge-Validatoren registriert, es wurde keine Bridge-Operation erstellt, und in keinem der beiden Netzwerke ist ein IBC-Kanal offen. Siehe [Bridge-Architektur](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config`:

| Parameter                  | Wert                        | Beschreibung                                      |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Für das Attestierungs-Set erforderliche Validatoren |
| `attestation_threshold`    | `7`                         | Erforderliche Attestierungen                      |
| `challenge_period_secs`    | `86400`                     | Anfechtungsfrist (24 Stunden)                     |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100.000 QOR) | Transfers oberhalb dieses Werts warten die Anfechtungsfrist ab |
| `enabled`                  | `true`                      | Modul-Aktivierungsflag                            |

Einstellungen pro Chain (`min_confirmations`, `max_single_transfer`, `daily_limit`) liegen in der jeweiligen Chain-Konfiguration, nicht in den Modulparametern.

---

## Multilayer-Modul (`x/multilayer`)

| Parameter                      | Wert             | Beschreibung                                      |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10`             | Maximale Anzahl registrierter Sidechains          |
| `max_paychains`                | `50`             | Maximale Anzahl registrierter Paychains           |
| `min_anchor_interval`          | `100`            | Minimales Verankerungsintervall (Blöcke)          |
| `max_anchor_interval`          | `1000`           | Maximales Verankerungsintervall (Blöcke)          |
| `default_challenge_period`     | `86400` s        | Standard-Anfechtungsfrist (1 Tag)                 |
| `min_sidechain_stake`          | `1,000,000,000`  | Mindest-Stake zur Registrierung einer Sidechain (1.000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Mindest-Stake zur Registrierung einer Paychain (100 QOR)    |
| `routing_enabled`              | `true`           | Layerübergreifendes Routing aktiviert             |
| `routing_confidence_threshold` | `0.6`            | Konfidenzschwelle für automatisches Routing       |
| `cross_layer_fee_bundling`     | `true`           | Eine Gebührenzahlung kann mehrere Layer abdecken  |

---

## Cross-VM-Modul (`x/crossvm`)

| Parameter             | Wert    | Beschreibung                                   |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Maximale Cross-VM-Nachrichtengröße in Bytes (64 KB) |
| `max_queue_size`      | `1000`  | Maximal ausstehende Nachrichten in der Cross-VM-Warteschlange |
| `queue_timeout_blocks`| `100`   | Blöcke, bevor eine ausstehende Nachricht abläuft |
| `enabled`             | `true`  | Modul-Aktivierungsflag                         |

`MsgCrossVMCall` ist im Mainnet durch den Circuit Breaker abgeschaltet (im Testnet aktiviert).

---

## SVM-Modul (`x/svm`)

Genesis-Werte:

| Parameter               | Wert         | Beschreibung                                 |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Maximale Programm-Binärgröße in Bytes (10 MB) |
| `max_account_data_size` | `10485760`   | Maximale Größe der Kontodaten in Bytes (10 MB) |
| `compute_budget_max`    | `1400000`    | Maximale Recheneinheiten pro Transaktion (1,4 Mio.) |
| `lamports_per_byte`     | `3480`       | Mietkosten pro Byte in Lamports              |
| `rent_exemption_multi`  | `2.0`        | Für die Befreiung erforderliche Mietjahre    |
| `enabled`               | `true`       | Modul-Aktivierungsflag                       |
| `svm_slot_offset`       | `0`          | Slot-Offset                                  |
| `default_sig_scheme`    | `0`          | Standard-Signaturschema                      |
| `max_cpi`               | `4`          | Maximale Tiefe des programmübergreifenden Aufrufs (Cross-Program Invocation) |

Die SVM-Transaktions-Lane ist netzwerkweit deaktiviert (siehe [Netzwerke](/appendix/networks)).

---

## RDK-Modul (`x/rdk`)

`qorechaind query rdk config`:

| Parameter                   | Wert                 | Beschreibung                                  |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100`                | Maximale Anzahl registrierter Rollups         |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Mindest-Operator-Stake (10.000 QOR)           |
| `rollup_creation_burn_rate` | `0.01`               | Anteil des Erstellungs-Stakes, der verbrannt wird (1 %) |
| `default_challenge_window`  | `604,800` s          | Standard-Anfechtungsfenster (7 Tage)          |
| `max_da_blob_size`          | `2,097,152`          | Maximale DA-Blob-Größe in Bytes (2 MB)        |
| `blob_retention_blocks`     | `432,000`            | Blöcke zur Aufbewahrung von DA-Blobs (etwa 16 Tage bei Blöcken von ≈3,2 s) |
| `max_batches_per_block`     | `10`                 | Maximal pro Block verarbeitete Batches        |

Auf keinem der beiden Netzwerke wurde bisher ein Rollup erstellt.

---

## FairBlock-Modul (`x/fairblock`)

Genesis-Werte (das Modul hat keinen Query-Service, daher können sie nicht live neu ausgelesen werden):

| Parameter            | Wert    | Beschreibung                                |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | FairBlock-tIBE-Verschlüsselung ist deaktiviert |
| `tibe_threshold`     | `5`     | Mindestanzahl erforderlicher Entschlüsselungsschlüssel-Anteile |
| `decryption_delay`   | `3`     | Blöcke nach Finalisierung vor der Entschlüsselung |
| `max_encrypted_size` | `65536` | Maximale Größe der verschlüsselten Nutzlast in Bytes |

---

## Gas-Abstraction-Modul (`x/gasabstraction`)

Genesis-Konfiguration (`enabled = true`, `native_denom = uqor`):

| Token-Denom | Umrechnungskurs | Beschreibung           |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | Nativer QOR-Token (1:1) |
| `ibc/USDC`  | `1.0`           | Per IBC gebrücktes USDC |
| `ibc/ATOM`  | `10.0`          | Per IBC gebrücktes ATOM |

Der Umrechnungskurs ist der Kurs, der beim Umrechnen einer in diesem Token gezahlten Gebühr verwendet wird.

:::note Kein IBC-Kanal offen
In keinem der beiden Netzwerke ist ein IBC-Kanal offen, daher kann es noch kein `ibc/USDC` oder `ibc/ATOM` geben; Gebühren werden in `uqor` bezahlt.
:::

---

## Light-Node-Modul (`x/lightnode`)

| Parameter                | Wert               | Beschreibung                                         |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Gebühr zur Registrierung eines Light Nodes      |
| `heartbeat_interval`     | `1000` Blöcke      | Blöcke zwischen erforderlichen Heartbeats (etwa 54 Minuten bei Blöcken von ≈3,2 s) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1.000 QOR) | Vom Betreiber mindestens delegierter Stake |
| `reward_share`           | `0.03`             | Für Light Nodes beiseitegelegter Anteil des Gebühren-Sammelkontos |
| `min_uptime_for_rewards` | `0.80`             | Minimaler Verfügbarkeitsanteil für die Belohnungsberechtigung |
| `max_light_nodes`        | `10,000`           | Maximale Anzahl registrierter Light Nodes            |
| `heartbeat_grace_period` | `100` Blöcke       | Karenzzeit für einen verspäteten Heartbeat           |

Die Belohnungsbuchführung ist live. `GET /qorechain/lightnode/v1/reward_pool` meldet den Pool (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) und die Belohnungsobergrenze pro Node. Seit v3.2.3 lautet die Obergrenze `max_reward_per_month_per_node`, **2.000 QOR (`2000000000` uqor) pro Node und 30 Tage**, anteilig nach Blockzeit berechnet und mit der Verfügbarkeit des Nodes skaliert; der ältere Wert pro Block (`max_reward_per_block_per_node`, `1713` uqor) wird weiterhin gemeldet. Am 20. Oktober 2026 hielt der Pool eine Reserve von 487,2318 QOR, ohne ausstehende Beträge. Die Registrierung ist offen und lizenzpflichtig: Im Mainnet wurden sechs `lightnode_operator`-Lizenzen vergeben, und es hat sich noch kein Light Node registriert (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). Siehe [Light Node](/light-node/overview#reward-program-status) und [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## AMM-Modul (`x/amm`)

| Parameter               | Wert                          | Beschreibung                        |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Swap-Gebühr (0,30 %)                |
| `protocol_fee_bps`      | `10`                          | Anteil der Protokollgebühr (0,10 %) |
| `min_liquidity`         | `1000`                        | Minimale Liquidität                 |
| `max_pools_per_creator` | `50`                          | Maximale Anzahl Pools pro Ersteller |
| `lp_token_decimals`     | `6`                           | Dezimalstellen des LP-Tokens        |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Gebühr zum Erstellen eines Pools    |
| `max_swap_impact_bps`   | `500`                         | Maximale Preisauswirkung eines Swaps (5 %) |
| `enabled`               | `true`                        | Modul-Aktivierungsflag              |

Weder im Mainnet noch im Testnet existieren bisher Pools, und `MsgPausePool` / `MsgResumePool` sind im Mainnet abgeschaltet.

---

## Smart Accounts (`x/abstractaccount`)

:::caution Auf beiden Netzwerken abgeschaltet
`enabled` ist `false`: Das Registrieren eines Authenticators, das Ausführen über einen solchen und das Erstellen eines Smart Accounts werden abgelehnt, solange das Modul ausgeschaltet ist. Prüfen Sie `GET /qorechain/abstractaccount/v1/config`, bevor Sie auf diesen Funktionen aufbauen.
:::

| Parameter             | Wert     | Beschreibung                     |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false`  | Modul-Aktivierungsflag           |
| `max_session_keys`    | `10`     | Maximale Anzahl Session Keys pro Konto |
| `max_spending_rules`  | `5`      | Maximale Anzahl Ausgabenregeln   |
| `default_session_ttl` | `86400` s| Standard-Lebensdauer eines Session Keys |

---

## Staking, Slashing, Governance, Gebühren und EVM {#core-modules}

Standardmodule des Cosmos SDK und EVM-Module, am 23. Oktober 2026 live ausgelesen für die Zeilen zu Staking, Slashing, Governance und Distribution (die Zeilen zu Fee-Market, EVM, ERC-20 und QoreChain Native wurden zuletzt am 20. Oktober 2026 ausgelesen); auf beiden Netzwerken identisch, sofern nicht anders angegeben, und durch das Upgrade auf v3.2.4 unverändert.

| Modul | Parameter | Wert |
| --- | --- | --- |
| Staking | `unbonding_time` | 1,814,400 s (21 Tage) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 Blöcke (etwa 8,9 Stunden bei Blöcken von ≈3,2 s) |
| | `min_signed_per_window` | 5 % (ein Validator, der weniger als 5 % des Fensters signiert, wird gejailt) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| Governance | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | je 172,800 s (2 Tage) |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Distribution | `community_tax` | 0.02 |
| Fee Market | `min_gas_price` | 0.1 uqor pro Gas |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 Dezimalstellen) |
| | Zugriff auf Vertragserstellung / -aufruf | erlaubnisfrei |
| | `active_static_precompiles` | leer (kein EVM-Precompile ist aktiv) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## Circuit-Breaker-Status {#circuit-breaker}

Die Chain kann einzelne Nachrichtentypen mit dem Circuit Breaker des Cosmos SDK abschalten; gesteuert wird er vom Betriebskonto der Foundation und per Governance. Ein deaktivierter Nachrichtentyp wird vom Ante-Handler auf jeder Lane abgelehnt. Die aktuelle Liste ist unter `GET /cosmos/circuit/v1/disable_list` abrufbar.

**Mainnet (20. Oktober 2026, 16 Einträge, unverändert seit dem 14. Oktober):** Erstellung von Vesting-Konten (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; sowie die vier PRISM-Steuernachrichten (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). Die EVM-Lane (`MsgEthereumTx`) ist **offen**: Sie war vom 16. bis 25. September abgeschaltet und wurde durch das Upgrade v3.2.0 wieder geöffnet.

**Testnet (20. Oktober 2026):** nur die drei QoreChain Native-Nachrichten.

Jeder andere Nachrichtentyp, einschließlich aller Standardnachrichten für Bank, Staking, Governance, Distribution, Authz und der `x/pqc`-Registrierung, ist aktiviert. Die Liste unterliegt der Governance und kann sich ändern; fragen Sie sie immer ab.

---

## Unterschiede zwischen Testnet und Mainnet {#testnet-differences}

Beide Netzwerke laufen mit v3.2.4: das Testnet `qorechain-diana` seit Blockhöhe 8,337,253 (19. Oktober 2026), das Mainnet `qorechain-vladi` seit Blockhöhe 3,742,566 (23. Oktober 2026, Governance-Vorschlag 13). Die Ergänzungen von v3.2.4 sind daher auf beiden Netzwerken gleich: das optionale zeitgesperrte Staking-Modul `x/stakingtier` (49 Module statt 48; `GET /qorechain/stakingtier/v1/params`, Mindestsperre 10 QOR, Strafe bei vorzeitigem Entsperren 5 %), ein dritter `emission_mode` (`target_apy`, mit `target_apy_bps` bei `0` auf beiden Netzwerken), eine dreizehnte erfasste Burn-Quelle (`staking_tier_penalty`), zusätzliche Berichtsfelder des Light-Node-Belohnungspools (`monthly_cap_active`, `last_distribution_time`, `last_distribution_height`) mit einer Belohnungsobergrenze, die bei der eigenen Registrierung eines Nodes beginnt, das Flag `possession_proven` an PQC-Konten (der Besitznachweis bleibt für Kontoschlüssel optional und ist für Bridge-Validator-Schlüssel erforderlich), das in Blockzeit gezählte RDK-Anfechtungsfenster sowie die Abfragen `protocol_features` und `auth_nonce`. Siehe [Staking und Delegation](/user-guide/staking-and-delegation#time-locked-staking). Stand 23. Oktober 2026 unterscheiden sich die beiden Netzwerke nur noch in den folgenden Werten.

Diese Werte sind testnetspezifisch:

| Bereich | Testnet |
| ---- | ------- |
| `x/inflation`-Werte | Frühere Emissionswerte (16.239 QOR pro Epoche, Obergrenze 114.285.714 QOR, bereits erreicht); das Mainnet verwendet die durch Governance-Vorschlag 10 festgelegten Werte. |
| Circuit Breaker | Nur die drei QoreChain Native-Nachrichten (siehe oben). |

Jeder hier nicht aufgeführte Parameter ist auf beiden Netzwerken identisch.
