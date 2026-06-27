---
slug: /appendix/chain-parameters
title: Chain-Parameter
sidebar_label: Chain-Parameter
sidebar_position: 2
---

# Chain-Parameter

Konsolidierte Referenz aller konfigurierbaren Modulparameter im QoreChain-Genesis. Die Parameter sind nach Modul gruppiert und können zur Laufzeit mit `qorechaind query <module> params` abgefragt werden.

:::note
Die angezeigten Werte sind die bereitgestellten Genesis-Standardwerte. Die Parameter gelten für das Mainnet **`qorechain-vladi`** (EVM-Chain-ID **9801**) und das Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**), sofern nicht anders angegeben.
:::

---

## PQC-Modul (`x/pqc`)

| Parameter                   | Typ    | Standardwert           | Beschreibung                                                            |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (erforderlich)     | Durchsetzungsmodus: 0=deaktiviert, 1=optional, 2=erforderlich (aktueller Standard) |
| `allow_classical_fallback`  | bool   | `false`                | Rein klassischer Fallback ist geschlossen; Cosmos-Transaktionen müssen hybrid sein |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | Registrierte PQC-Algorithmen mit Größenbeschränkungen                  |
| `auto_register_enabled`     | bool   | `true`                 | PQC-Schlüssel bei der ersten Hybrid-Transaktion automatisch registrieren |
| `migration_deadline_height` | uint64 | `0`                    | Blockhöhe, ab der rein klassische Schlüssel abgelehnt werden (0=deaktiviert) |
| `migration_grace_period`    | uint64 | `100000`               | Blöcke der Vorwarnung vor der Migrationsfrist                          |

---

## AI-Modul (`x/ai`)

| Parameter                  | Typ    | Standardwert  | Beschreibung                                       |
| -------------------------- | ------ | ------------- | ------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`        | Gewicht für Volumenanomalie bei der Betrugsbewertung |
| `anomaly_weight_velocity`  | string | `0.25`        | Gewicht für Geschwindigkeitsanomalie bei der Betrugsbewertung |
| `anomaly_weight_pattern`   | string | `0.25`        | Gewicht für Musteranomalie bei der Betrugsbewertung |
| `anomaly_weight_network`   | string | `0.20`        | Gewicht für Netzwerkgraph-Anomalie bei der Betrugsbewertung |
| `fraud_threshold_low`      | string | `0.30`        | Bewertungsschwelle für Warnung mit geringem Schweregrad |
| `fraud_threshold_medium`   | string | `0.55`        | Bewertungsschwelle für Warnung mit mittlerem Schweregrad |
| `fraud_threshold_high`     | string | `0.75`        | Bewertungsschwelle für Warnung mit hohem Schweregrad |
| `fraud_threshold_critical` | string | `0.90`        | Bewertungsschwelle für Warnung mit kritischem Schweregrad |
| `circuit_breaker_enabled`  | bool   | `true`        | QCAI-Sicherungsschalter aktivieren                |

---

## Reputation-Modul (`x/reputation`)

| Parameter      | Typ    | Standardwert  | Beschreibung                                          |
| -------------- | ------ | ------------- | ---------------------------------------------------- |
| `alpha`        | string | `0.30`        | Gewicht für den Verfügbarkeits-Score (S\_i) in der Reputationsformel |
| `beta`         | string | `0.25`        | Gewicht für den Teilnahme-Score (P\_i)                |
| `gamma`        | string | `0.25`        | Gewicht für den Community-Score (C\_i)                |
| `delta`        | string | `0.20`        | Gewicht für den Zugehörigkeitsdauer-Score (T\_i)       |
| `decay_lambda` | string | `0.01`        | Exponentieller Zeitverfallsfaktor für historische Scores  |

Reputationsformel: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i` mit exponentiellem Zeitverfall, der pro Epoche angewendet wird.

---

## QCA-Modul (`x/qca`)

| Parameter                      | Typ    | Standardwert  | Beschreibung                                   |
| ------------------------------ | ------ | ------------- | ---------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`        | Blockvorschlagsgewicht für den Emerald-Pool    |
| `sapphire_pool_weight`         | string | `0.30`        | Blockvorschlagsgewicht für den Sapphire-Pool   |
| `ruby_pool_weight`             | string | `0.20`        | Blockvorschlagsgewicht für den Ruby-Pool       |
| `emerald_min_reputation`       | string | `0.80`        | Mindest-Reputations-Score für den Emerald-Pool |
| `sapphire_min_reputation`      | string | `0.50`        | Mindest-Reputations-Score für den Sapphire-Pool |
| `bonding_curve_base_rate`      | string | `0.05`        | Basisrate für die Staking-Bonding-Kurve        |
| `bonding_curve_multiplier`     | string | `1.50`        | Multiplikator für den Verlauf der Bonding-Kurve |
| `slashing_downtime_window`     | int64  | `10000`       | Blöcke zur Bewertung von Ausfallzeiten         |
| `slashing_downtime_threshold`  | string | `0.05`        | Mindestanteil signierter Blöcke vor Slashing   |
| `slashing_downtime_penalty`    | string | `0.01`        | Slashing-Anteil bei Ausfallzeiten              |
| `slashing_double_sign_penalty` | string | `0.05`        | Slashing-Anteil bei doppelter Signierung       |
| `qdrw_enabled`                 | bool   | `true`        | Dynamic Reward Weighting aktivieren            |
| `qdrw_throughput_weight`       | string | `0.40`        | QDRW-Gewicht für die Durchsatzmetrik           |
| `qdrw_latency_weight`          | string | `0.30`        | QDRW-Gewicht für die Latenzmetrik              |
| `qdrw_security_weight`         | string | `0.20`        | QDRW-Gewicht für die Sicherheitsmetrik         |
| `qdrw_decentralization_weight` | string | `0.10`        | QDRW-Gewicht für die Dezentralisierungsmetrik  |
| `qdrw_adjustment_cap`          | string | `0.10`        | Maximale QDRW-Anpassung pro Epoche             |
| `qdrw_adjustment_interval`     | int64  | `100`         | Blöcke zwischen QDRW-Anpassungen               |

---

## Burn-Modul (`x/burn`)

| Parameter           | Typ    | Standardwert  | Beschreibung                                       |
| ------------------- | ------ | ------------- | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`        | Gebührenverbrennungsmechanismus aktivieren        |
| `validator_share`   | string | `0.37`        | Anteil der an Block-Validatoren verteilten Gebühren |
| `burn_share`        | string | `0.30`        | Anteil der dauerhaft verbrannten Gebühren         |
| `treasury_share`    | string | `0.20`        | Anteil der an die Community-Treasury gesendeten Gebühren |
| `staker_share`      | string | `0.10`        | Anteil der an Delegatoren verteilten Gebühren     |
| `light_node_share`  | string | `0.03`        | Anteil der an Light Nodes verteilten Gebühren     |

Die Anteile müssen sich auf `1.00` summieren. Die Gebührenaufteilung beträgt **37 / 30 / 20 / 10 / 3** auf Validatoren, Verbrennung, Treasury, Staker und Light Nodes.

---

## xQORE-Modul (`x/xqore`)

| Parameter            | Typ    | Standardwert  | Beschreibung                                   |
| -------------------- | ------ | ------------- | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor` | Mindestbetrag, der als xQORE gesperrt werden kann |
| `min_lock_duration`  | string | `7d`          | Minimale Sperrdauer                            |
| `max_lock_duration`  | string | `365d`        | Maximale Sperrdauer                            |
| `penalty_tier_1_pct` | string | `0.50`        | Strafe bei vorzeitiger Entsperrung: 0-25% der Sperrzeit verstrichen |
| `penalty_tier_2_pct` | string | `0.30`        | Strafe bei vorzeitiger Entsperrung: 25-50% der Sperrzeit verstrichen |
| `penalty_tier_3_pct` | string | `0.15`        | Strafe bei vorzeitiger Entsperrung: 50-75% der Sperrzeit verstrichen |
| `penalty_tier_4_pct` | string | `0.05`        | Strafe bei vorzeitiger Entsperrung: 75-100% der Sperrzeit verstrichen |
| `pvp_rebase_enabled` | bool   | `true`        | PvP-Rebase-Umverteilung aktivieren            |

---

## Inflation-Modul (`x/inflation`)

| Parameter         | Typ    | Standardwert           | Beschreibung                                      |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | Blöcke pro Inflationsepoche                       |
| `blocks_per_year` | uint64 | `6311520`              | Geschätzte Blöcke pro Jahr (für die Ratenberechnung) |
| `initial_rate`    | string | `0.08`                 | Parameter für die anfängliche annualisierte Emissionsrate |
| `rate_decay`      | string | `0.05`                 | Jährlich angewendeter Verfallsfaktor             |
| `min_rate`        | string | `0.02`                 | Parameter für die untere Emissionsrate            |
| `max_supply`      | string | `1000000000000000uqor` | Obergrenze des maximalen Token-Angebots           |

:::note
Die obigen `x/inflation`-Parameter sind die bereitgestellten Mechanismus-Standardwerte. Im Rahmen des kanonischen ökonomischen Modells der **Tokenomics v2.1** hat QoreChain ein **festes Angebot** mit einem **endlichen Emissionsbudget (590M-Pool)**, das Staking- und Ökosystem-Belohnungen finanziert. Die Werte `initial_rate` / `rate_decay` / `min_rate` sind Mechanismusdetails, die regeln, wie Emissionen innerhalb dieses endlichen Budgets geplant werden — sie stellen **keine** unbegrenzte prozentuale Inflation des Gesamtangebots dar.
:::

---

## RL-Consensus-Modul (`x/rlconsensus`)

Das `x/rlconsensus`-Modul implementiert **PRISM**, die Reinforcement-Learning-Optimierungsschicht der QoreChain Consensus Engine.

| Parameter                    | Typ    | Standardwert  | Beschreibung                                     |
| ---------------------------- | ------ | ------------- | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`          | Blöcke zwischen PRISM-Beobachtungsstichproben   |
| `agent_mode`                 | uint   | `0`           | Agentenmodus: 0=aus, 1=beobachten, 2=vorschlagen, 3=automatisch |
| `circuit_breaker_enabled`    | bool   | `true`        | PRISM-Sicherungsschalter aktivieren              |
| `circuit_breaker_max_change` | string | `0.10`        | Maximale Parameteränderung pro Aktion (10%)     |
| `circuit_breaker_cooldown`   | uint64 | `100`         | Blöcke Wartezeit nach Auslösung des Sicherungsschalters |
| `reward_throughput_weight`   | string | `0.40`        | Belohnungsgewicht für Durchsatz                 |
| `reward_latency_weight`      | string | `0.30`        | Belohnungsgewicht für Latenz                    |
| `reward_security_weight`     | string | `0.20`        | Belohnungsgewicht für Sicherheit                |
| `reward_stability_weight`    | string | `0.10`        | Belohnungsgewicht für Stabilität                |
| `ppo_learning_rate`          | string | `0.0003`      | PPO-Lernrate                                    |
| `ppo_clip_range`             | string | `0.20`        | PPO-Clipping-Bereich                            |

---

## Bridge-Modul (`x/bridge`)

| Parameter                       | Typ    | Standardwert  | Beschreibung                                     |
| ------------------------------- | ------ | ------------- | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`           | Mindestbestätigungen für IBC-Transfers          |
| `min_confirmations_ethereum`    | uint64 | `12`          | Mindestbestätigungen für die Ethereum-Bridge    |
| `min_confirmations_bitcoin`     | uint64 | `6`           | Mindestbestätigungen für die Bitcoin-Bridge     |
| `circuit_breaker_enabled`       | bool   | `true`        | Bridge-Sicherungsschalter aktivieren            |
| `circuit_breaker_max_daily_usd` | string | `10000000`    | Maximales tägliches Bridge-Volumen (USD-Äquivalent) |
| `circuit_breaker_max_single_tx` | string | `1000000`     | Maximaler Einzeltransferbetrag (USD-Äquivalent) |

---

## Multilayer-Modul (`x/multilayer`)

| Parameter                   | Typ    | Standardwert       | Beschreibung                                       |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | Maximale Anzahl registrierter Sidechains          |
| `max_paychains`             | uint   | `50`               | Maximale Anzahl registrierter Paychains           |
| `anchor_interval_sidechain` | uint64 | `100`              | Verpflichtendes Verankerungsintervall für Sidechains (Blöcke) |
| `anchor_interval_paychain`  | uint64 | `50`               | Verpflichtendes Verankerungsintervall für Paychains (Blöcke) |
| `challenge_period`          | string | `7d`               | Dauer für Betrugsanfechtungen bei Verankerungen   |
| `min_sidechain_stake`       | string | `1000000000uqor` | Mindest-Stake zur Registrierung einer Sidechain (1.000 QOR) |
| `min_paychain_stake`        | string | `100000000uqor`  | Mindest-Stake zur Registrierung einer Paychain (100 QOR) |
| `routing_threshold`         | string | `0.80`             | Lastschwelle zur Auslösung des automatischen Routings |

---

## Cross-VM-Modul (`x/crossvm`)

| Parameter          | Typ    | Standardwert  | Beschreibung                                    |
| ------------------ | ------ | ------------- | ---------------------------------------------- |
| `max_message_size` | uint64 | `65536`       | Maximale Cross-VM-Nachrichtengröße in Bytes (64 KB) |
| `max_queue_size`   | uint   | `1000`        | Maximal ausstehende Nachrichten in der Cross-VM-Warteschlange |
| `queue_timeout`    | uint64 | `100`         | Blöcke, bevor eine ausstehende Nachricht abläuft |

---

## SVM-Modul (`x/svm`)

| Parameter                     | Typ    | Standardwert  | Beschreibung                                  |
| ----------------------------- | ------ | ------------- | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`    | Maximale Programm-Binärgröße in Bytes (10 MB) |
| `compute_budget`              | uint64 | `1400000`     | Standard-Recheneinheiten pro Transaktion (1,4 Mio.) |
| `rent_lamports_per_byte_year` | uint64 | `3480`        | Jährliche Mietkosten pro Byte in Lamports     |
| `rent_exemption_threshold`    | string | `2.0`         | Für die Befreiung erforderliche Mietjahre     |
| `max_accounts_per_tx`         | uint   | `64`          | Maximale Anzahl referenzierter Konten pro Transaktion |

---

## RDK-Modul (`x/rdk`)

| Parameter             | Typ    | Standardwert                       | Beschreibung                              |
| --------------------- | ------ | ---------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                              | Maximale Anzahl registrierter Rollups     |
| `min_stake`           | string | `10000000000uqor`                  | Mindest-Operator-Stake (10.000 QOR)       |
| `burn_rate`           | string | `0.01`                             | Prozentsatz der verbrannten Rollup-Gebühren (1%) |
| `challenge_window`    | string | `7d`                               | Dauer des Betrugsanfechtungsfensters      |
| `max_blob_size`       | uint64 | `2097152`                          | Maximale DA-Blob-Größe in Bytes (2 MB)    |
| `blob_retention`      | uint64 | `432000`                           | Blöcke zur Aufbewahrung von DA-Blobs vor dem Pruning |
| `max_batches_pending` | uint   | `10`                               | Maximale unfinalisierte Batches pro Rollup |
| `auto_finalize`       | bool   | `true`                             | EndBlocker-Auto-Finalisierung aktivieren  |
| `settlement_types`    | array  | optimistic, zk, based, sovereign   | Zulässige Settlement-Paradigmen           |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | Verfügbare Rollup-Voreinstellungen      |

---

## FairBlock-Modul (`x/fairblock`)

| Parameter            | Typ    | Standardwert  | Beschreibung                                 |
| -------------------- | ------ | ------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`       | FairBlock-tIBE-Verschlüsselung aktivieren    |
| `tibe_threshold`     | uint   | `2`           | Mindestanzahl erforderlicher Entschlüsselungsschlüssel-Anteile |
| `decryption_delay`   | uint64 | `1`           | Blöcke nach Finalisierung vor der Entschlüsselung |
| `max_encrypted_size` | uint64 | `4096`        | Maximale Größe der verschlüsselten Nutzlast in Bytes |

---

## Gas-Abstraction-Modul (`x/gasabstraction`)

| Parameter         | Typ   | Standardwert  | Beschreibung                                           |
| ----------------- | ----- | ------------- | ----------------------------------------------------- |
| `accepted_tokens` | array | (siehe unten) | Für die Gaszahlung akzeptierte Token mit Umrechnungskursen |

**Standardmäßig akzeptierte Token:**

| Token-Denom | Umrechnungskurs | Beschreibung           |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | Nativer QOR-Token (1:1) |
| `ibc/USDC`  | `1.0`           | Per IBC gebrücktes USDC |
| `ibc/ATOM`  | `10.0`          | Per IBC gebrücktes ATOM |

Die Umrechnungskurse stellen die Anzahl der Gas-Einheiten pro Token-Einheit dar. Höhere Kurse bedeuten, dass jede Token-Einheit mehr Gas abdeckt.
