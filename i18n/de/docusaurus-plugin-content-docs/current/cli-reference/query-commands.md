---
slug: /cli-reference/query-commands
title: Query-Befehle
sidebar_label: Query-Befehle
sidebar_position: 3
---

# Query-Befehle

Alle Query-Befehle folgen dem Muster:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Abfragen werden gegen den Node ausgeführt, auf den `--node` zeigt. Verwenden Sie für Live-Daten einen **`qorechain-vladi`**-Mainnet-RPC-Endpunkt (Chain-Version **v3.1.77**) oder einen **`qorechain-diana`**-Testnet-Endpunkt zum Testen. Der Standardwert `tcp://localhost:26657` zielt auf einen Node ab, den Sie selbst betreiben.
:::

Allgemeine Flags gelten für jeden `query`-Unterbefehl:

| Flag       | Typ   | Beschreibung                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`) |
| `--output` | string | Ausgabeformat: `json` oder `text`                 |
| `--height` | int    | Zustand bei einer bestimmten Blockhöhe abfragen          |

---

## bank

### balances

Fragt alle Guthaben für ein Konto ab.

```bash
qorechaind query bank balances <address>
```

### total

Fragt das Gesamtangebot aller Tokens ab.

```bash
qorechaind query bank total
```

---

## staking

### validator

Fragt einen einzelnen Validator anhand seiner Operator-Adresse ab.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Listet alle Validatoren auf.

```bash
qorechaind query staking validators
```

### delegation

Fragt eine Delegation von einem Delegator an einen Validator ab.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Fragt alle Delegationen für einen Delegator ab.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Fragt eine Unbonding-Delegation ab.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Fragt alle Delegationsbelohnungen für einen Delegator ab.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Fragt die Validator-Provision ab.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Fragt einen einzelnen Vorschlag anhand seiner ID ab.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

Listet alle Vorschläge auf, optional nach Status gefiltert.

```bash
qorechaind query gov proposals [flags]
```

| Flag       | Typ   | Beschreibung                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | Nach Status filtern: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Fragt Stimmen zu einem Vorschlag ab.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Fragt den PQC-Schlüsselregistrierungsstatus für ein Konto ab.

```bash
qorechaind query pqc account <address>
```

### algorithms

Listet alle unterstützten PQC-Algorithmen auf.

```bash
qorechaind query pqc algorithms
```

### algorithm

Fragt Details zu einem bestimmten PQC-Algorithmus ab.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Fragt aggregierte PQC-Registrierungsstatistiken ab.

```bash
qorechaind query pqc stats
```

### params

Fragt die Parameter des PQC-Moduls ab.

```bash
qorechaind query pqc params
```

### migration

Fragt den PQC-Schlüsselmigrationsstatus für ein Konto ab.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Fragt den aktuellen Durchsetzungsmodus für Hybridsignaturen ab.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Fragt die xQORE-Staking-Position für eine Adresse ab.

```bash
qorechaind query xqore position <address>
```

### params

Fragt die Parameter des xQORE-Moduls ab.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Fragt Burn-Statistiken über alle Kanäle hinweg ab.

```bash
qorechaind query burn stats
```

### params

Fragt die Parameter des Burn-Moduls ab.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Fragt die aktuelle annualisierte Inflationsrate ab.

```bash
qorechaind query inflation rate
```

### epoch

Fragt die aktuelle Epochennummer und den Fortschritt ab.

```bash
qorechaind query inflation epoch
```

### params

Fragt die Parameter des Inflation-Moduls ab.

```bash
qorechaind query inflation params
```

---

## ai

### config

Fragt die Konfiguration des KI-Moduls ab.

```bash
qorechaind query ai config
```

### stats

Fragt aggregierte KI-Verarbeitungsstatistiken ab.

```bash
qorechaind query ai stats
```

### fee-estimate

Ruft eine KI-gestützte Gas-Gebührenschätzung ab.

```bash
qorechaind query ai fee-estimate [flags]
```

| Flag        | Typ   | Beschreibung                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | Transaktionstyp für die Schätzung |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

Listet aktive Betrugsuntersuchungen auf.

```bash
qorechaind query ai investigations
```

### recommendations

Ruft KI-generierte Empfehlungen zur Netzwerkoptimierung ab.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Fragt die aktuellen Zustände der Circuit Breaker ab.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Fragt Reputationswerte für alle Validatoren ab.

```bash
qorechaind query reputation validators
```

### validator

Fragt den Reputationswert für einen bestimmten Validator ab.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Listet alle registrierten Bridge-Chains auf.

```bash
qorechaind query bridge chains
```

### chain

Fragt Details zu einer bestimmten gebridgeten Chain ab.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Listet aktive Bridge-Validatoren auf.

```bash
qorechaind query bridge validators
```

### operations

Listet aktuelle Bridge-Operationen auf.

```bash
qorechaind query bridge operations
```

| Flag       | Typ   | Beschreibung                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filter: `pending`, `completed`, `failed` |
| `--chain`  | string | Nach Chain-ID filtern                       |

### limits

Fragt die Rate-Limits für eine gebridgete Chain ab.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Schätzt Bridge-Gebühr und Übertragungszeit.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Ruft eine Cross-VM-Nachricht anhand ihrer ID ab.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Listet ausstehende Cross-VM-Nachrichten auf.

```bash
qorechaind query crossvm pending
```

### params

Fragt die Parameter des Cross-VM-Moduls ab.

```bash
qorechaind query crossvm params
```

---

## svm

### account

Fragt SVM-Kontoinformationen ab.

```bash
qorechaind query svm account <pubkey>
```

### program

Fragt Informationen zu einem bereitgestellten SVM-Programm ab.

```bash
qorechaind query svm program <program_id>
```

### params

Fragt die Parameter des SVM-Moduls ab.

```bash
qorechaind query svm params
```

### slot

Fragt die aktuelle SVM-Slot-Nummer ab.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Fragt Details zu einer bestimmten Schicht ab.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Listet alle registrierten Schichten auf.

```bash
qorechaind query multilayer layers
```

### anchor

Fragt einen bestimmten Anchor-Datensatz ab.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Listet aktuelle Anchor-Übermittlungen auf.

```bash
qorechaind query multilayer anchors [flags]
```

| Flag         | Typ   | Beschreibung               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | Nach Layer-ID filtern        |
| `--limit`    | uint   | Maximale Anzahl zurückzugebender Ergebnisse |

### routing-stats

Fragt Transaktions-Routing-Statistiken über Schichten hinweg ab.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Simuliert das Transaktions-Routing ohne Ausführung.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Fragt die Parameter des Multilayer-Moduls ab.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Fragt Details zu einem bestimmten Rollup ab.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Listet alle registrierten Rollups auf.

```bash
qorechaind query rdk rollups
```

| Flag       | Typ   | Beschreibung                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | Filter: `active`, `paused`, `stopped` |

### batch

Fragt einen bestimmten Settlement-Batch ab.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Fragt den neuesten Batch für ein Rollup ab.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Ruft eine KI-gestützte Empfehlung für ein Rollup-Profil ab.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Fragt einen bestimmten DA-Blob ab.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

Fragt die Parameter des RDK-Moduls ab.

```bash
qorechaind query rdk params
```

:::note
Rollup-Withdrawal-Beweise und Settlement-Status sind ebenfalls unter der `rdk`-Gruppe abfragbar. Die genauen Query-Unterbefehle und Argumente hängen vom Settlement-Typ Ihres Rollups ab; siehe die **Rollup Development Kit**-Dokumentation für die maßgebliche Query-Oberfläche für Withdrawal/Settlement.
:::

---

## rlconsensus

PRISM ist die Reinforcement-Learning-Schicht, die Konsensparameter abstimmt. Der CLI-Modulname `rlconsensus` und seine Unterbefehle werden wortwörtlich beibehalten.

### agent-status

Fragt den aktuellen Status und Modus des PRISM-Agenten ab.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Fragt den neuesten PRISM-Beobachtungsvektor ab.

```bash
qorechaind query rlconsensus observation
```

### reward

Fragt kumulative PRISM-Belohnungsmetriken ab.

```bash
qorechaind query rlconsensus reward
```

### params

Fragt die Parameter des PRISM-Consensus-Moduls ab.

```bash
qorechaind query rlconsensus params
```

### policy

Fragt die aktive PRISM-Policy-Konfiguration ab.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Fragt die BTC-Staking-Position für eine Adresse ab.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Fragt BTC-Checkpoint-Daten für eine bestimmte Epoche ab.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Fragt die Parameter des Babylon-Moduls ab.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Fragt Details zu einem Abstract Account ab.

```bash
qorechaind query abstractaccount account <address>
```

### params

Fragt die Parameter des Abstract-Account-Moduls ab.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

Listet die für die Gas-Zahlung akzeptierten Tokens auf.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Fragt die Parameter des Gas-Abstraction-Moduls ab.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

Fragt die FairBlock-Verschlüsselungskonfiguration ab.

```bash
qorechaind query fairblock config
```

### params

Fragt die Parameter des FairBlock-Moduls ab.

```bash
qorechaind query fairblock params
```
