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
Setzen Sie `--chain-id qorechain-vladi`, um gegen das Live-Mainnet zu broadcasten (Chain-Version **v3.1.92**), oder `--chain-id qorechain-diana` für das Testnet. Wird die Angabe weggelassen, verwendet der Client die `chain-id` aus Ihrer lokalen Konfiguration.
:::

Die folgenden allgemeinen Flags gelten für jeden `tx`-Unterbefehl:

| Flag                | Typ    | Beschreibung                                    |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | Name oder Adresse des Signaturschlüssels        |
| `--chain-id`        | string | Chain-Kennung (Standard: aus der Konfiguration) |
| `--fees`            | string | Transaktionsgebühren (z. B. `500uqor`)          |
| `--gas`             | string | Gas-Limit oder `auto` für Schätzung             |
| `--gas-adjustment`  | float  | Gas-Multiplikator bei Verwendung von `auto` (Standard: 1.0) |
| `--keyring-backend` | string | Keyring-Backend: `os`, `file`, `test`           |
| `--node`            | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` oder `block`                    |
| `-y`                | bool   | Bestätigungsabfrage überspringen                |

---

## bank

### send

Token von einem Konto auf ein anderes übertragen.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Einen neuen Validator im Netzwerk erstellen.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Typ    | Beschreibung                                 |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Betrag der Selbstdelegation (z. B. `1000000uqor`) |
| `--pubkey`                     | string | Öffentlicher Konsens-Schlüssel des Validators (JSON) |
| `--moniker`                    | string | Anzeigename des Validators                   |
| `--commission-rate`            | string | Anfänglicher Provisionssatz (z. B. `0.10`)   |
| `--commission-max-rate`        | string | Maximaler Provisionssatz                     |
| `--commission-max-change-rate` | string | Maximale tägliche Änderungsrate der Provision |
| `--min-self-delegation`        | string | Erforderliche Mindest-Selbstdelegation       |

### edit-validator

Beschreibung oder Provision eines bestehenden Validators bearbeiten.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Token an einen Validator delegieren.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Delegation von einem Validator zu einem anderen verschieben.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Token von einem Validator lösen (Unbonding).

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Alle ausstehenden Staking-Belohnungen abheben.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Belohnungen von einem bestimmten Validator abheben.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Typ  | Beschreibung                            |
| -------------- | ---- | ---------------------------------------- |
| `--commission` | bool | Zusätzlich die Validator-Provision abheben |

---

## gov

### submit-proposal

Einen Governance-Vorschlag einreichen.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Die Vorschlagsdatei ist ein JSON-Dokument, das Vorschlagstyp, Titel, Beschreibung und die auszuführenden Nachrichten festlegt.

### vote

Über einen aktiven Vorschlag abstimmen.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Abstimmungsoptionen: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Eine Einzahlung zu einem Vorschlag hinzufügen.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Der Cosmos-Transaktionspfad erfordert standardmäßig eine hybride Signatur (`hybrid_signature_mode = required`). Die Befehle `gen-key` und `cosign` erzeugen den Dilithium-5-Schlüssel (ML-DSA-87) und die `PQCHybridSignature`-Erweiterung, die neben der klassischen secp256k1-Signatur benötigt wird, um auf dem Cosmos-Pfad Transaktionen durchzuführen.

### gen-key

Einen Post-Quanten-Schlüssel vom Typ Dilithium-5 (ML-DSA-87) für hybrides Signieren erzeugen.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Eine Dilithium-5-Cosignatur als `PQCHybridSignature`-Erweiterung an eine Transaktion anhängen und so eine hybride Transaktion (secp256k1 + ML-DSA-87) erzeugen. Erforderlich für Transaktionen auf dem Cosmos-Pfad im standardmäßigen Durchsetzungsmodus `required`. Standard-Tooling mit CosmJS bzw. Relayern muss diese Erweiterung erzeugen, um Transaktionen durchführen zu können; `buildHybridTx` aus dem QoreChain SDK (mit `includePqcPublicKey`) leistet das Äquivalent.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Einen öffentlichen Post-Quanten-Schlüssel für ein Konto registrieren.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Einen PQC-Schlüssel mit erweiterten Metadaten und Attestierung registrieren.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Typ    | Beschreibung                        |
| --------------- | ------ | ------------------------------------ |
| `--attestation` | string | TEE-Attestierungsdaten (hex)         |
| `--metadata`    | string | Zusätzliche Schlüssel-Metadaten (JSON) |

### migrate-key

Einen bestehenden klassischen Schlüssel zu einem hybriden PQC-Schlüsselpaar migrieren.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

Den ML-DSA-87-Schlüssel des Kontos deterministisch aus seiner BIP-39-Mnemonic rekonstruieren (von stdin gelesen) und lokal speichern (verfügbar ab Chain-Version **v3.1.85**). Verwendet die ökosystemweit standardisierte Ableitung `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Typ    | Beschreibung                                             |
| -------------- | ------ | -------------------------------------------------------- |
| `--derivation` | string | `adapter` (kanonisch, Standard) oder `bridge` (Legacy: `SHAKE-256(mnemonic)`) |

### rotate-key

Den ML-DSA-87-Schlüssel des Kontos **innerhalb desselben Algorithmus** rotieren (verfügbar ab Chain-Version **v3.1.85**) — z. B. einen Legacy-abgeleiteten Schlüssel auf die kanonische Ableitung migrieren oder einen kompromittierten Schlüssel außer Dienst stellen. Liest die Mnemonic von stdin, signiert doppelt mit dem alten und dem neuen Schlüssel, cosigniert den Umschlag mit dem alten Schlüssel und broadcastet. Gibt auf stdout ausschließlich das Transaktions-JSON aus (Informationszeilen gehen an stderr) und lässt sich daher mit `-o json` kombinieren.

```bash
qorechaind tx pqc rotate-key [flags]
```

| Flag               | Typ    | Beschreibung                                     |
| ------------------ | ------ | ------------------------------------------------ |
| `--old-derivation` | string | Ableitung des derzeit registrierten Schlüssels (`adapter` \| `bridge`) |
| `--new-derivation` | string | Ableitung des neuen Schlüssels (`adapter` \| `bridge`) |
| `--new-random`     | bool   | Stattdessen einen frischen Zufallsschlüssel erzeugen |

---

## xqore

### lock

QOR-Token in eine xQORE-Governance-Staking-Position sperren.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Typ    | Beschreibung                              |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Sperrdauer (z. B. `30d`, `90d`, `180d`)    |

### unlock

xQORE zurück in QOR entsperren. Eine vorzeitige Entsperrung kann je nach Strafstufe Strafgebühren nach sich ziehen.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Eine Bridge-Einzahlung von einer externen Chain initiieren.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Typ    | Beschreibung                     |
| ------------- | ------ | -------------------------------- |
| `--recipient` | string | Empfängeradresse auf QoreChain   |

### withdraw

Eine Bridge-Auszahlung an eine externe Chain initiieren.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Die Bridge einer Chain in einer einzigen signierten Transaktion aktivieren oder neu konfigurieren (verfügbar ab Chain-Version **v3.1.80**). Erfordert den `bridge_admin`-Schlüssel oder eine `qcb_bridge`-Lizenz — kein Governance-Vorschlag und kein Chain-Upgrade nötig. Setzt Contract-Adresse, Bestätigungsanzahl, Architektur und Status.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Den aktiven Verifier einer Chain auswählen und dessen Trust Root installieren (ebenfalls über `bridge_admin` abgesichert).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Eine Cross-VM-Nachricht zwischen Ausführungsumgebungen (EVM, CosmWasm, SVM) senden.

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Typ    | Beschreibung                           |
| ------------- | ------ | -------------------------------------- |
| `--source-vm` | string | Quell-VM: `evm`, `cosmwasm`, `svm`     |
| `--gas-limit` | uint   | Gas-Limit für die Cross-VM-Ausführung  |

### process-queue

Ausstehende Cross-VM-Nachrichten manuell verarbeiten (Operator-Befehl).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Ein BPF-Programm in der SVM-Laufzeitumgebung bereitstellen.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Typ    | Beschreibung                     |
| -------------- | ------ | -------------------------------- |
| `--program-id` | string | Optionale Programm-ID (base58)   |

### execute

Eine Instruktion auf einem bereitgestellten SVM-Programm ausführen.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Typ    | Beschreibung                                            |
| ------------ | ------ | ------------------------------------------------------- |
| `--accounts` | string | Kommagetrennte Konto-Pubkeys für die Instruktion        |

### create-account

Ein neues SVM-Konto mit zugewiesenem Datenspeicher erstellen.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Typ    | Beschreibung                                          |
| --------- | ------ | ----------------------------------------------------- |
| `--owner` | string | Eigentümer-Programm (base58, Standard: System-Programm) |

---

## multilayer

### register-sidechain

Eine neue Sidechain-Ebene registrieren.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Typ    | Beschreibung                                         |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Ziel-Blockzeit in ms (Standard 2000)                 |
| `--domains`             | string | Kommagetrennte unterstützte Domänen (Standard `defi`) |
| `--max-tx`              | uint   | Maximale Transaktionen pro Block (Standard 1000)     |
| `--min-validators`      | uint32 | Minimale Größe des Validator-Sets (Standard 1)       |
| `--settlement-interval` | uint   | Settlement-Intervall in Blöcken (Standard 100)       |
| `--vm-types`            | string | Kommagetrennte unterstützte VM-Typen (Standard `evm`) |

### register-paychain

Eine neue Paychain-Ebene für hochfrequente Mikrotransaktionen registrieren.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Typ  | Beschreibung                                    |
| ----------------------- | ---- | ------------------------------------------------ |
| `--max-tx`              | uint | Maximale Transaktionen pro Block (Standard 5000) |
| `--settlement-interval` | uint | Settlement-Intervall in Blöcken (Standard 50)    |

### anchor-state

Einen State-Anchor (Settlement) für eine registrierte Ebene einreichen.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Eine Transaktion an die optimale Ebene routen.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Typ    | Beschreibung                                 |
| ---------------- | ------ | -------------------------------------------- |
| `--target-layer` | string | Routing auf eine bestimmte Ebene erzwingen   |

### update-layer-status

Den Betriebsstatus einer Ebene aktualisieren (nur Operator).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Statuswerte: `active`, `paused`, `draining`.

### challenge-anchor

Eine Betrugsanfechtung (Fraud Challenge) gegen einen State-Anchor einreichen.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Ein neues Rollup beim Rollup Development Kit registrieren.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Typ    | Beschreibung                                         |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Voreinstellung: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Höhe des Operator-Stakes                             |
| `--da-enabled`      | bool   | Native Datenverfügbarkeit aktivieren                 |

### submit-batch

Einen Settlement-Batch für ein Rollup einreichen.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Eine Betrugsanfechtung gegen einen Settlement-Batch einreichen (optimistische Rollups).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Einen Batch manuell finalisieren, dessen Anfechtungsfrist abgelaufen ist.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Ein Rollup pausieren (nur Operator).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Ein pausiertes Rollup fortsetzen (nur Operator).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Ein Rollup dauerhaft stoppen und dessen Stake freigeben (nur Operator).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Rollup-Auszahlungen und ebenenübergreifendes Settlement sind ebenfalls unter der `rdk`-Transaktionsgruppe verfügbar (zum Beispiel ein Befehl `execute-withdrawal`, der eine gegen einen finalisierten Batch nachgewiesene Auszahlung abwickelt). Die genauen Argumente und Flags hängen vom Settlement-Typ und der DA-Konfiguration Ihres Rollups ab; konsultieren Sie die **Rollup Development Kit**-Dokumentation für die maßgebliche Befehlsübersicht, bevor Sie diese Transaktionen erstellen.
:::

---

## babylon

### submit-btc-checkpoint

Einen BTC-Checkpoint für eine Epoche einreichen.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

BTC über die Babylon-Integration restaken.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Typ    | Beschreibung                            |
| --------------- | ------ | ---------------------------------------- |
| `--btc-tx-hash` | string | Bitcoin-Transaktions-Hash als Nachweis   |

---

## abstractaccount

### create

Ein abstraktes Konto mit programmierbaren Ausgaberegeln erstellen.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Typ    | Beschreibung                                 |
| ------------------ | ------ | -------------------------------------------- |
| `--spending-rules` | string | JSON-Datei, die die Ausgaberegeln definiert  |

### update-spending-rules

Die Ausgaberegeln eines bestehenden abstrakten Kontos aktualisieren.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

Einen per Authenticator autorisierten Native-Lane-Bank-Send von einem kanonischen Konto relayen (verfügbar ab Chain-Version **v3.1.85**). Der Relayer (`--from`) signiert und bezahlt den Umschlag; die Signatur des verknüpften Schlüssels über die Replay-gebundenen Sign-Bytes ist die Autorisierung. Siehe [Authenticatoren für verknüpfte Wallets](/developer-guide/account-abstraction#authenticators).

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

Einen per Authenticator autorisierten EVM-Aufruf oder eine EVM-Überweisung von der EVM-Adresse des kanonischen Kontos relayen (verfügbar ab Chain-Version **v3.1.85**). Die Nonce ist die **aktuelle** EVM-Nonce des Kontos.

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM ist die Reinforcement-Learning-Schicht, die Konsensparameter feinjustiert. Diese Befehle steuern den PRISM-Agenten; der CLI-Modulname `rlconsensus` und seine Unterbefehle bleiben unverändert erhalten.

### set-agent-mode

Den Betriebsmodus des PRISM-Agenten festlegen (nur Governance).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Moduswerte: `0` (aus), `1` (beobachten), `2` (vorschlagen), `3` (automatisch).

### resume-agent

Den PRISM-Agenten nach dem Auslösen eines Circuit Breakers fortsetzen.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Die Policy-Konfiguration des PRISM-Agenten aktualisieren (nur Governance).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Die Konfiguration der Belohnungsgewichte für den PRISM-Agenten aktualisieren.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Typ    | Beschreibung                          |
| --------------------- | ------ | -------------------------------------- |
| `--throughput-weight` | string | Gewicht für die Durchsatz-Belohnung    |
| `--latency-weight`    | string | Gewicht für die Latenz-Belohnung       |
| `--security-weight`   | string | Gewicht für die Sicherheits-Belohnung  |
