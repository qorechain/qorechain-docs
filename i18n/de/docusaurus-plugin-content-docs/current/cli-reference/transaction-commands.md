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
Setzen Sie `--chain-id qorechain-vladi`, um gegen das aktive Mainnet zu senden (Chain-Version **v3.1.80**), oder `--chain-id qorechain-diana` für das Testnet. Wird die Option weggelassen, verwendet der Client die `chain-id` aus Ihrer lokalen Konfiguration.
:::

Gemeinsame Flags gelten für jeden `tx`-Unterbefehl:

| Flag                | Typ    | Beschreibung                                       |
| ------------------- | ------ | -------------------------------------------------- |
| `--from`            | string | Name oder Adresse des Signaturschlüssels           |
| `--chain-id`        | string | Chain-Bezeichner (Standard: aus der Konfiguration) |
| `--fees`            | string | Transaktionsgebühren (z. B. `500uqor`)             |
| `--gas`             | string | Gas-Limit oder `auto` zur Schätzung                |
| `--gas-adjustment`  | float  | Gas-Multiplikator bei `auto` (Standard: 1.0)       |
| `--keyring-backend` | string | Keyring-Backend: `os`, `file`, `test`              |
| `--node`            | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`)   |
| `--broadcast-mode`  | string | `sync`, `async` oder `block`                       |
| `-y`                | bool   | Bestätigungsabfrage überspringen                   |

---

## bank

### send

Übertragen Sie Tokens von einem Konto auf ein anderes.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Erstellen Sie einen neuen Validator im Netzwerk.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Typ    | Beschreibung                                   |
| ------------------------------ | ------ | ---------------------------------------------- |
| `--amount`                     | string | Selbstdelegationsbetrag (z. B. `1000000uqor`)  |
| `--pubkey`                     | string | Öffentlicher Konsensschlüssel des Validators (JSON) |
| `--moniker`                    | string | Anzeigename des Validators                      |
| `--commission-rate`            | string | Anfänglicher Provisionssatz (z. B. `0.10`)     |
| `--commission-max-rate`        | string | Maximaler Provisionssatz                        |
| `--commission-max-change-rate` | string | Maximale tägliche Provisionsänderungsrate       |
| `--min-self-delegation`        | string | Erforderliche minimale Selbstdelegation         |

### edit-validator

Bearbeiten Sie die Beschreibung oder Provision eines bestehenden Validators.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delegieren Sie Tokens an einen Validator.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Verschieben Sie eine Delegation von einem Validator zu einem anderen.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Lösen Sie Tokens von einem Validator (Unbonding).

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Heben Sie alle ausstehenden Staking-Belohnungen ab.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Heben Sie Belohnungen von einem bestimmten Validator ab.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Typ  | Beschreibung                            |
| -------------- | ---- | --------------------------------------- |
| `--commission` | bool | Auch die Validator-Provision abheben    |

---

## gov

### submit-proposal

Reichen Sie einen Governance-Vorschlag ein.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Die Vorschlagsdatei ist ein JSON-Dokument, das den Vorschlagstyp, den Titel, die Beschreibung sowie alle auszuführenden Nachrichten angibt.

### vote

Stimmen Sie über einen aktiven Vorschlag ab.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Abstimmungsoptionen: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Fügen Sie einem Vorschlag eine Einzahlung hinzu.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Der Cosmos-Transaktionspfad erfordert standardmäßig eine Hybridsignatur (`hybrid_signature_mode = required`). Die Befehle `gen-key` und `cosign` erzeugen den Dilithium-5-Schlüssel (ML-DSA-87) und die `PQCHybridSignature`-Erweiterung, die für Transaktionen auf dem Cosmos-Pfad zusätzlich zur klassischen secp256k1-Signatur benötigt werden.

### gen-key

Erzeugen Sie einen post-quanten Dilithium-5-Schlüssel (ML-DSA-87) für die Hybridsignierung.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Hängen Sie eine Dilithium-5-Mitsignatur als `PQCHybridSignature`-Erweiterung an eine Transaktion an und erzeugen so eine hybride Transaktion (secp256k1 + ML-DSA-87). Erforderlich für Transaktionen auf dem Cosmos-Pfad im standardmäßigen Durchsetzungsmodus `required`. Standard-CosmJS-/Relayer-Tooling muss diese Erweiterung erzeugen, um Transaktionen durchzuführen; das `buildHybridTx` des QoreChain SDK (mit `includePqcPublicKey`) leistet das Äquivalent.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Registrieren Sie einen öffentlichen post-quanten Schlüssel für ein Konto.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Registrieren Sie einen PQC-Schlüssel mit erweiterten Metadaten und Attestierung.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Typ    | Beschreibung                      |
| --------------- | ------ | --------------------------------- |
| `--attestation` | string | TEE-Attestierungsdaten (hex)      |
| `--metadata`    | string | Zusätzliche Schlüsselmetadaten (JSON) |

### migrate-key

Migrieren Sie einen bestehenden klassischen Schlüssel zu einem hybriden PQC-Schlüsselpaar.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Sperren Sie QOR-Tokens in einer xQORE-Governance-Staking-Position.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Typ    | Beschreibung                                 |
| ----------------- | ------ | -------------------------------------------- |
| `--lock-duration` | string | Sperrdauer (z. B. `30d`, `90d`, `180d`)      |

### unlock

Entsperren Sie xQORE zurück zu QOR. Eine vorzeitige Entsperrung kann je nach Strafstufe Strafen nach sich ziehen.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Starten Sie eine Bridge-Einzahlung von einer externen Chain.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Typ    | Beschreibung                       |
| ------------- | ------ | ---------------------------------- |
| `--recipient` | string | Empfängeradresse auf QoreChain     |

### withdraw

Starten Sie eine Bridge-Auszahlung zu einer externen Chain.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Aktivieren oder rekonfigurieren Sie die Bridge einer Chain in einer einzigen signierten Transaktion (verfügbar ab Chain-Version **v3.1.80**). Erfordert den `bridge_admin`-Schlüssel oder eine `qcb_bridge`-Lizenz – kein Governance-Vorschlag und kein Chain-Upgrade. Legt die Vertragsadresse, die Anzahl der Bestätigungen, die Architektur und den Status fest.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Wählen Sie den aktiven Verifier einer Chain aus und installieren Sie deren Trust Root (ebenfalls `bridge_admin`-gesteuert).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Senden Sie eine Cross-VM-Nachricht zwischen Ausführungsumgebungen (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Typ    | Beschreibung                            |
| ------------- | ------ | --------------------------------------- |
| `--source-vm` | string | Quell-VM: `evm`, `cosmwasm`, `svm`      |
| `--gas-limit` | uint   | Gas-Limit für die Cross-VM-Ausführung   |

### process-queue

Verarbeiten Sie ausstehende Cross-VM-Nachrichten manuell (Operator-Befehl).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Stellen Sie ein BPF-Programm auf der SVM-Runtime bereit.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Typ    | Beschreibung                    |
| -------------- | ------ | ------------------------------- |
| `--program-id` | string | Optionale Programm-ID (base58)  |

### execute

Führen Sie eine Instruktion auf einem bereitgestellten SVM-Programm aus.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Typ    | Beschreibung                                            |
| ------------ | ------ | ------------------------------------------------------- |
| `--accounts` | string | Kommagetrennte Konto-Pubkeys für die Instruktion        |

### create-account

Erstellen Sie ein neues SVM-Konto mit zugewiesenem Datenspeicherplatz.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Typ    | Beschreibung                                          |
| --------- | ------ | ----------------------------------------------------- |
| `--owner` | string | Eigentümerprogramm (base58, Standard: System-Programm) |

---

## multilayer

### register-sidechain

Registrieren Sie einen neuen Sidechain-Layer.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Typ    | Beschreibung                                          |
| ----------------------- | ------ | ---------------------------------------------------- |
| `--block-time-ms`       | uint   | Ziel-Blockzeit in ms (Standard 2000)                |
| `--domains`             | string | Kommagetrennte unterstützte Domains (Standard `defi`) |
| `--max-tx`              | uint   | Max. Transaktionen pro Block (Standard 1000)         |
| `--min-validators`      | uint32 | Minimale Größe des Validator-Sets (Standard 1)       |
| `--settlement-interval` | uint   | Settlement-Intervall in Blöcken (Standard 100)       |
| `--vm-types`            | string | Kommagetrennte unterstützte VM-Typen (Standard `evm`) |

### register-paychain

Registrieren Sie einen neuen Paychain-Layer für hochfrequente Mikrotransaktionen.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Typ  | Beschreibung                                 |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Max. Transaktionen pro Block (Standard 5000) |
| `--settlement-interval` | uint | Settlement-Intervall in Blöcken (Standard 50) |

### anchor-state

Reichen Sie einen State-Anchor (Settlement) für einen registrierten Layer ein.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Leiten Sie eine Transaktion an den optimalen Layer weiter.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Typ    | Beschreibung                                |
| ---------------- | ------ | ------------------------------------------- |
| `--target-layer` | string | Weiterleitung an einen bestimmten Layer erzwingen |

### update-layer-status

Aktualisieren Sie den Betriebsstatus eines Layers (nur Operator).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Statuswerte: `active`, `paused`, `draining`.

### challenge-anchor

Reichen Sie eine Betrugsanfechtung gegen einen State-Anchor ein.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Registrieren Sie einen neuen Rollup mit dem Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Typ    | Beschreibung                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Voreinstellung: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Operator-Stake-Betrag                                |
| `--da-enabled`      | bool   | Native Datenverfügbarkeit aktivieren                 |

### submit-batch

Reichen Sie einen Settlement-Batch für einen Rollup ein.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Reichen Sie eine Betrugsanfechtung gegen einen Settlement-Batch ein (optimistische Rollups).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalisieren Sie manuell einen Batch, der das Anfechtungsfenster durchlaufen hat.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Pausieren Sie einen Rollup (nur Operator).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Setzen Sie einen pausierten Rollup fort (nur Operator).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Stoppen Sie einen Rollup dauerhaft und geben Sie dessen Stake frei (nur Operator).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Rollup-Auszahlung und Cross-Layer-Settlement werden ebenfalls unter der `rdk`-Transaktionsgruppe bereitgestellt (zum Beispiel ein `execute-withdrawal`-Befehl, der eine gegen einen finalisierten Batch nachgewiesene Auszahlung abwickelt). Die genauen Argumente und Flags hängen vom Settlement-Typ und der DA-Konfiguration Ihres Rollups ab; sehen Sie sich die Dokumentation des **Rollup Development Kit** an, um die maßgebliche Befehlsoberfläche zu prüfen, bevor Sie diese Transaktionen erstellen.
:::

---

## babylon

### submit-btc-checkpoint

Reichen Sie einen BTC-Checkpoint für eine Epoche ein.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Restaken Sie BTC über die Babylon-Integration.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Typ    | Beschreibung                          |
| --------------- | ------ | ------------------------------------- |
| `--btc-tx-hash` | string | Bitcoin-Transaktions-Hash als Nachweis |

---

## abstractaccount

### create

Erstellen Sie ein abstraktes Konto mit programmierbaren Ausgaberegeln.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Typ    | Beschreibung                              |
| ------------------ | ------ | ----------------------------------------- |
| `--spending-rules` | string | JSON-Datei, die die Ausgaberegeln definiert |

### update-spending-rules

Aktualisieren Sie die Ausgaberegeln für ein bestehendes abstraktes Konto.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM ist die Reinforcement-Learning-Schicht, die Konsensparameter abstimmt. Diese Befehle steuern den PRISM-Agenten; der CLI-Modulname `rlconsensus` und seine Unterbefehle bleiben wortwörtlich erhalten.

### set-agent-mode

Legen Sie den Betriebsmodus des PRISM-Agenten fest (nur Governance).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Modus-Werte: `0` (aus), `1` (beobachten), `2` (vorschlagen), `3` (automatisch).

### resume-agent

Setzen Sie den PRISM-Agenten nach einem Auslösen des Schutzschalters fort.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Aktualisieren Sie die Policy-Konfiguration des PRISM-Agenten (nur Governance).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Aktualisieren Sie die Belohnungsgewichtungs-Konfiguration für den PRISM-Agenten.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Typ    | Beschreibung                       |
| --------------------- | ------ | ---------------------------------- |
| `--throughput-weight` | string | Gewichtung für die Durchsatz-Belohnung |
| `--latency-weight`    | string | Gewichtung für die Latenz-Belohnung    |
| `--security-weight`   | string | Gewichtung für die Sicherheits-Belohnung |
