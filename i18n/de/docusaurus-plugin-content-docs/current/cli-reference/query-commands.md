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
Abfragen laufen gegen den Node, auf den `--node` zeigt. Verwenden Sie einen **`qorechain-vladi`**-Mainnet-RPC-Endpunkt (Chain-Version **v3.1.95**) für Live-Daten oder einen **`qorechain-diana`**-Testnet-Endpunkt zum Testen. Der Standardwert `tcp://localhost:26657` zielt auf einen Node, den Sie selbst betreiben.
:::

Gemeinsame Flags gelten für jeden `query`-Unterbefehl:

| Flag       | Typ    | Beschreibung                                        |
| ---------- | ------ | --------------------------------------------------- |
| `--node`   | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`)     |
| `--output` | string | Ausgabeformat: `json` oder `text`                    |
| `--height` | int    | Zustand bei einer bestimmten Blockhöhe abfragen      |

---

## bank

### balances

Alle Kontostände eines Kontos abfragen.

```bash
qorechaind query bank balances <address>
```

### total

Das Gesamtangebot aller Token abfragen.

```bash
qorechaind query bank total
```

---

## staking

### validator

Einen einzelnen Validator anhand der Operator-Adresse abfragen.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Alle Validatoren auflisten.

```bash
qorechaind query staking validators
```

### delegation

Eine Delegation von einem Delegator an einen Validator abfragen.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Alle Delegationen eines Delegators abfragen.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Eine Unbonding-Delegation abfragen.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Alle Delegations-Rewards eines Delegators abfragen.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Die Kommission eines Validators abfragen.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Ein einzelnes Proposal anhand seiner ID abfragen.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

Alle Proposals auflisten, optional nach Status gefiltert.

```bash
qorechaind query gov proposals [flags]
```

| Flag       | Typ    | Beschreibung                                                                    |
| ---------- | ------ | ------------------------------------------------------------------------------- |
| `--status` | string | Nach Status filtern: `deposit_period`, `voting_period`, `passed`, `rejected`     |

### votes

Stimmen zu einem Proposal abfragen.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Den PQC-Schlüsselregistrierungsstatus eines Kontos abfragen.

```bash
qorechaind query pqc account <address>
```

### algorithms

Alle unterstützten PQC-Algorithmen auflisten.

```bash
qorechaind query pqc algorithms
```

### algorithm

Details zu einem bestimmten PQC-Algorithmus abfragen.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Aggregierte PQC-Registrierungsstatistiken abfragen.

```bash
qorechaind query pqc stats
```

### params

Parameter des PQC-Moduls abfragen.

```bash
qorechaind query pqc params
```

### migration

Den PQC-Schlüsselmigrationsstatus eines Kontos abfragen.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Den aktuellen Durchsetzungsmodus für hybride Signaturen abfragen.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Die xQORE-Staking-Position einer Adresse abfragen.

```bash
qorechaind query xqore position <address>
```

### params

Parameter des xQORE-Moduls abfragen.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Burn-Statistiken über alle Kanäle hinweg abfragen.

```bash
qorechaind query burn stats
```

### params

Parameter des Burn-Moduls abfragen.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Die aktuelle annualisierte Inflationsrate abfragen.

```bash
qorechaind query inflation rate
```

### epoch

Die aktuelle Epochennummer und den Fortschritt abfragen.

```bash
qorechaind query inflation epoch
```

### params

Parameter des Inflation-Moduls abfragen.

```bash
qorechaind query inflation params
```

---

## ai

### config

Die Konfiguration des AI-Moduls abfragen.

```bash
qorechaind query ai config
```

### stats

Aggregierte AI-Verarbeitungsstatistiken abfragen.

```bash
qorechaind query ai stats
```

### fee-estimate

Eine KI-gestützte Gasgebührenschätzung abrufen.

```bash
qorechaind query ai fee-estimate [flags]
```

| Flag        | Typ    | Beschreibung                        |
| ----------- | ------ | ----------------------------------- |
| `--tx-type` | string | Transaktionstyp für die Schätzung   |
| `--urgency` | string | `low`, `medium`, `high`             |

### investigations

Aktive Betrugsermittlungen auflisten.

```bash
qorechaind query ai investigations
```

### recommendations

KI-generierte Empfehlungen zur Netzwerkoptimierung abrufen.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Die aktuellen Circuit-Breaker-Zustände abfragen.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Reputationswerte aller Validatoren abfragen.

```bash
qorechaind query reputation validators
```

### validator

Den Reputationswert eines bestimmten Validators abfragen.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Alle registrierten Bridge-Chains auflisten.

```bash
qorechaind query bridge chains
```

### chain

Details zu einer bestimmten gebridgten Chain abfragen.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Aktive Bridge-Validatoren auflisten.

```bash
qorechaind query bridge validators
```

### operations

Aktuelle Bridge-Operationen auflisten.

```bash
qorechaind query bridge operations
```

| Flag       | Typ    | Beschreibung                                 |
| ---------- | ------ | -------------------------------------------- |
| `--status` | string | Filter: `pending`, `completed`, `failed`     |
| `--chain`  | string | Nach Chain-ID filtern                        |

### limits

Rate-Limits für eine gebridgte Chain abfragen.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Bridge-Gebühr und Transferdauer schätzen.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Eine Cross-VM-Nachricht anhand ihrer ID abrufen.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Ausstehende Cross-VM-Nachrichten auflisten.

```bash
qorechaind query crossvm pending
```

### params

Parameter des Cross-VM-Moduls abfragen.

```bash
qorechaind query crossvm params
```

---

## svm

### account

SVM-Kontoinformationen abfragen.

```bash
qorechaind query svm account <pubkey>
```

### program

Informationen zu einem bereitgestellten SVM-Programm abfragen.

```bash
qorechaind query svm program <program_id>
```

### params

Parameter des SVM-Moduls abfragen.

```bash
qorechaind query svm params
```

### slot

Die aktuelle SVM-Slot-Nummer abfragen.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Details zu einem bestimmten Layer abfragen.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Alle registrierten Layer auflisten.

```bash
qorechaind query multilayer layers
```

### anchor

Einen bestimmten Anchor-Eintrag abfragen.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Aktuelle Anchor-Einreichungen auflisten.

```bash
qorechaind query multilayer anchors [flags]
```

| Flag         | Typ    | Beschreibung                       |
| ------------ | ------ | ---------------------------------- |
| `--layer-id` | string | Nach Layer-ID filtern              |
| `--limit`    | uint   | Maximale Anzahl der Ergebnisse     |

### routing-stats

Transaktions-Routing-Statistiken über alle Layer hinweg abfragen.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Transaktions-Routing ohne Ausführung simulieren.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Parameter des Multilayer-Moduls abfragen.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Details zu einem bestimmten Rollup abfragen.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Alle registrierten Rollups auflisten.

```bash
qorechaind query rdk rollups
```

| Flag       | Typ    | Beschreibung                              |
| ---------- | ------ | ----------------------------------------- |
| `--status` | string | Filter: `active`, `paused`, `stopped`     |

### batch

Einen bestimmten Settlement-Batch abfragen.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Den neuesten Batch eines Rollups abfragen.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Eine KI-gestützte Rollup-Profilempfehlung abrufen.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Einen bestimmten DA-Blob abfragen.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

Parameter des RDK-Moduls abfragen.

```bash
qorechaind query rdk params
```

:::note
Rollup-Auszahlungsnachweise und der Settlement-Status sind ebenfalls unter der `rdk`-Gruppe abfragbar. Die genauen Query-Unterbefehle und Argumente hängen vom Settlement-Typ Ihres Rollups ab; die maßgebliche Auszahlungs-/Settlement-Query-Oberfläche finden Sie in der Dokumentation zum **Rollup Development Kit**.
:::

---

## rlconsensus

PRISM ist die Reinforcement-Learning-Schicht, die Konsensparameter feinabstimmt. Der CLI-Modulname `rlconsensus` und seine Unterbefehle bleiben unverändert erhalten.

### agent-status

Den aktuellen Status und Modus des PRISM-Agenten abfragen.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Den neuesten PRISM-Beobachtungsvektor abfragen.

```bash
qorechaind query rlconsensus observation
```

### reward

Kumulative PRISM-Reward-Metriken abfragen.

```bash
qorechaind query rlconsensus reward
```

### params

Parameter des PRISM-Consensus-Moduls abfragen.

```bash
qorechaind query rlconsensus params
```

### policy

Die aktive PRISM-Policy-Konfiguration abfragen.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Die BTC-Staking-Position einer Adresse abfragen.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

BTC-Checkpoint-Daten für eine bestimmte Epoche abfragen.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Parameter des Babylon-Moduls abfragen.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Details eines Abstract Accounts abfragen.

```bash
qorechaind query abstractaccount account <address>
```

### params

Parameter des Abstract-Account-Moduls abfragen.

```bash
qorechaind query abstractaccount params
```

### permission-schema

Die kanonische Authenticator-Berechtigungstaxonomie abfragen — die 11 Berechtigungen, die Zuordnung von Nachricht zu Berechtigung sowie die nicht delegierbaren Schlüsselverwaltungsnachrichten (verfügbar ab Chain-Version **v3.1.85**; ebenfalls über REST unter `/qorechain/abstractaccount/v1/permission_schema` bereitgestellt).

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

Hilfsbefehle zum Erstellen von Authenticator-Autorisierungen außerhalb der SDKs: einen Testschlüssel generieren oder die **exakten Sign-Bytes, die die Chain verifiziert**, für eine delegierte Aktion auf der Native-Lane oder EVM-Lane erzeugen (verfügbar ab Chain-Version **v3.1.85**).

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
```

---

## gasabstraction

### accepted-tokens

Token auflisten, die für die Gaszahlung akzeptiert werden.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Parameter des Gas-Abstraction-Moduls abfragen.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

Die FairBlock-Verschlüsselungskonfiguration abfragen.

```bash
qorechaind query fairblock config
```

### params

Parameter des FairBlock-Moduls abfragen.

```bash
qorechaind query fairblock params
```
