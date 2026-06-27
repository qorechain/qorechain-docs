---
slug: /cli-reference/transaction-commands
title: Transaktionsbefehle
sidebar_label: Transaktionsbefehle
sidebar_position: 2
---

# Transaktionsbefehle

Alle Transaktionsbefehle folgen dem Muster:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Setzen Sie `--chain-id qorechain-vladi`, um gegen das Live-Mainnet (Chain-Version **v3.1.77**) zu broadcasten, oder `--chain-id qorechain-diana` für das Testnet. Wenn es weggelassen wird, verwendet der Client die `chain-id` aus Ihrer lokalen Konfiguration.
:::

Allgemeine Flags gelten für jeden `tx`-Unterbefehl:

| Flag                | Typ   | Beschreibung                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | Name oder Adresse des signierenden Schlüssels              |
| `--chain-id`        | string | Chain-Identifikator (Standard: aus der Konfiguration)         |
| `--fees`            | string | Transaktionsgebühren (z. B. `500uqor`)              |
| `--gas`             | string | Gas-Limit oder `auto` zur Schätzung                |
| `--gas-adjustment`  | float  | Gas-Multiplikator bei Verwendung von `auto` (Standard: 1.0) |
| `--keyring-backend` | string | Keyring-Backend: `os`, `file`, `test`           |
| `--node`            | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` oder `block`                     |
| `-y`                | bool   | Bestätigungsabfrage überspringen                        |

---

## bank

### send

Überträgt Tokens von einem Konto auf ein anderes.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Erstellt einen neuen Validator im Netzwerk.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Typ   | Beschreibung                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Selbst-Delegationsbetrag (z. B. `1000000uqor`) |
| `--pubkey`                     | string | Öffentlicher Konsensschlüssel des Validators (JSON)        |
| `--moniker`                    | string | Anzeigename des Validators                       |
| `--commission-rate`            | string | Initiale Provisionsrate (z. B. `0.10`)       |
| `--commission-max-rate`        | string | Maximale Provisionsrate                      |
| `--commission-max-change-rate` | string | Maximale tägliche Provisionsänderungsrate         |
| `--min-self-delegation`        | string | Minimal erforderliche Selbst-Delegation             |

### edit-validator

Bearbeitet die Beschreibung oder Provision eines bestehenden Validators.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delegiert Tokens an einen Validator.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Verschiebt eine Delegation von einem Validator zu einem anderen.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Macht die Bindung von Tokens an einen Validator rückgängig (Unbond).

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Hebt alle ausstehenden Staking-Belohnungen ab.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Hebt Belohnungen von einem bestimmten Validator ab.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Typ | Beschreibung                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | Auch die Validator-Provision abheben |

---

## gov

### submit-proposal

Reicht einen Governance-Vorschlag ein.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Die Vorschlagsdatei ist ein JSON-Dokument, das den Vorschlagstyp, den Titel, die Beschreibung und alle auszuführenden Nachrichten angibt.

### vote

Stimmt über einen aktiven Vorschlag ab.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Abstimmungsoptionen: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Fügt einem Vorschlag eine Einzahlung hinzu.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Der Cosmos-Transaktionspfad erfordert standardmäßig eine Hybridsignatur (`hybrid_signature_mode = required`). Die Befehle `gen-key` und `cosign` erzeugen den Dilithium-5-Schlüssel (ML-DSA-87) und die `PQCHybridSignature`-Erweiterung, die zum Transagieren auf dem Cosmos-Pfad neben der klassischen secp256k1-Signatur benötigt werden.

### gen-key

Generiert einen Dilithium-5-Post-Quanten-Schlüssel (ML-DSA-87) für die Hybridsignierung.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Hängt eine Dilithium-5-Cosignatur als `PQCHybridSignature`-Erweiterung an eine Transaktion an und erzeugt so eine Hybrid-Transaktion (secp256k1 + ML-DSA-87). Erforderlich für Transaktionen auf dem Cosmos-Pfad unter dem standardmäßigen Durchsetzungsmodus `required`. Standardmäßige CosmJS-/Relayer-Tools müssen diese Erweiterung erzeugen, um zu transagieren; das `buildHybridTx` (mit `includePqcPublicKey`) des QoreChain-SDK leistet das Äquivalent.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Registriert einen öffentlichen Post-Quanten-Schlüssel für ein Konto.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Registriert einen PQC-Schlüssel mit erweiterten Metadaten und Attestation.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Typ   | Beschreibung                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEE-Attestation-Daten (hex)     |
| `--metadata`    | string | Zusätzliche Schlüsselmetadaten (JSON) |

### migrate-key

Migriert einen bestehenden klassischen Schlüssel zu einem hybriden PQC-Schlüsselpaar.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Sperrt QOR-Tokens in einer xQORE-Governance-Staking-Position.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Typ   | Beschreibung                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Sperrdauer (z. B. `30d`, `90d`, `180d`) |

### unlock

Entsperrt xQORE zurück zu QOR. Vorzeitiges Entsperren kann je nach Strafstufe Strafen verursachen.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Initiiert eine Bridge-Einzahlung von einer externen Chain.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Typ   | Beschreibung                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | Empfängeradresse auf QoreChain |

### withdraw

Initiiert eine Bridge-Auszahlung zu einer externen Chain.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

---

## crossvm

### call

Sendet eine Cross-VM-Nachricht zwischen Ausführungsumgebungen (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Typ   | Beschreibung                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | Quell-VM: `evm`, `cosmwasm`, `svm`  |
| `--gas-limit` | uint   | Gas-Limit für die Cross-VM-Ausführung |

### process-queue

Verarbeitet ausstehende Cross-VM-Nachrichten manuell (Operator-Befehl).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Stellt ein BPF-Programm in der SVM-Laufzeitumgebung bereit.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Typ   | Beschreibung                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | Optionale Programm-ID (base58) |

### execute

Führt eine Instruktion auf einem bereitgestellten SVM-Programm aus.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Typ   | Beschreibung                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | Kommagetrennte Konto-Pubkeys für die Instruktion |

### create-account

Erstellt ein neues SVM-Konto mit zugewiesenem Datenraum.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Typ   | Beschreibung                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | Owner-Programm (base58, Standard: System-Programm) |

---

## multilayer

### register-sidechain

Registriert eine neue Sidechain-Schicht.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Typ   | Beschreibung                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Ziel-Blockzeit in ms (Standard 2000)              |
| `--domains`             | string | Kommagetrennte unterstützte Domänen (Standard `defi`)  |
| `--max-tx`              | uint   | Max. Transaktionen pro Block (Standard 1000)           |
| `--min-validators`      | uint32 | Minimale Validator-Set-Größe (Standard 1)              |
| `--settlement-interval` | uint   | Settlement-Intervall in Blöcken (Standard 100)         |
| `--vm-types`            | string | Kommagetrennte unterstützte VM-Typen (Standard `evm`)  |

### register-paychain

Registriert eine neue Paychain-Schicht für hochfrequente Mikrotransaktionen.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Typ | Beschreibung                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Max. Transaktionen pro Block (Standard 5000)    |
| `--settlement-interval` | uint | Settlement-Intervall in Blöcken (Standard 50)   |

### anchor-state

Übermittelt einen State-Anchor (Settlement) für eine registrierte Schicht.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Leitet eine Transaktion an die optimale Schicht weiter.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Typ   | Beschreibung                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | Routing zu einer bestimmten Schicht erzwingen |

### update-layer-status

Aktualisiert den Betriebsstatus einer Schicht (nur Operator).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Statuswerte: `active`, `paused`, `draining`.

### challenge-anchor

Reicht eine Betrugsanfechtung gegen einen State-Anchor ein.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Registriert ein neues Rollup mit dem Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Typ   | Beschreibung                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Preset: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Operator-Stake-Betrag                                |
| `--da-enabled`      | bool   | Native Datenverfügbarkeit aktivieren                      |

### submit-batch

Übermittelt einen Settlement-Batch für ein Rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Reicht eine Betrugsanfechtung gegen einen Settlement-Batch ein (optimistic Rollups).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalisiert manuell einen Batch, der das Challenge-Fenster durchlaufen hat.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Pausiert ein Rollup (nur Operator).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Setzt ein pausiertes Rollup fort (nur Operator).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Stoppt ein Rollup dauerhaft und gibt seinen Stake frei (nur Operator).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Rollup-Withdrawal und schichtenübergreifendes Settlement werden ebenfalls unter der `rdk`-Transaktionsgruppe bereitgestellt (zum Beispiel ein `execute-withdrawal`-Befehl, der eine gegen einen finalisierten Batch nachgewiesene Withdrawal abwickelt). Die genauen Argumente und Flags hängen vom Settlement-Typ und der DA-Konfiguration Ihres Rollups ab; siehe die **Rollup Development Kit**-Dokumentation für die maßgebliche Befehlsoberfläche, bevor Sie diese Transaktionen erstellen.
:::

---

## babylon

### submit-btc-checkpoint

Übermittelt einen BTC-Checkpoint für eine Epoche.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Restaket BTC über die Babylon-Integration.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Typ   | Beschreibung                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | Bitcoin-Transaktions-Hash als Nachweis |

---

## abstractaccount

### create

Erstellt einen Abstract Account mit programmierbaren Ausgaberegeln.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Typ   | Beschreibung                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | JSON-Datei zur Definition der Ausgaberegeln |

### update-spending-rules

Aktualisiert die Ausgaberegeln für einen bestehenden Abstract Account.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM ist die Reinforcement-Learning-Schicht, die Konsensparameter abstimmt. Diese Befehle steuern den PRISM-Agenten; der CLI-Modulname `rlconsensus` und seine Unterbefehle werden wortwörtlich beibehalten.

### set-agent-mode

Setzt den Betriebsmodus des PRISM-Agenten (nur Governance).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Modus-Werte: `0` (off), `1` (observe), `2` (suggest), `3` (auto).

### resume-agent

Setzt den PRISM-Agenten nach einem Circuit-Breaker-Auslöser fort.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Aktualisiert die Policy-Konfiguration des PRISM-Agenten (nur Governance).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Aktualisiert die Belohnungsgewicht-Konfiguration für den PRISM-Agenten.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Typ   | Beschreibung                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | Gewicht für Durchsatz-Belohnung |
| `--latency-weight`    | string | Gewicht für Latenz-Belohnung    |
| `--security-weight`   | string | Gewicht für Sicherheits-Belohnung   |
