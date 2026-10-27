---
slug: /cli-reference/node-commands
title: Node-Befehle
sidebar_label: Node-Befehle
sidebar_position: 1
---

# Node-Befehle

Referenz für `qorechaind`-Befehle zum Initialisieren, Konfigurieren und Betreiben eines QoreChain-Node.

:::note
QoreChain betreibt zwei Netzwerke: das **`qorechain-vladi`**-Mainnet (live seit dem 7. Juni 2026; Node-Version **v3.2.4**, angewendet bei Höhe 3.742.566 am 23. Oktober 2026 durch den Governance-Vorschlag 13; v3.2.3 wurde bei Höhe 3.662.051 am 20. Oktober 2026 angewendet) und das **`qorechain-diana`**-Testnet (Node-Version **v3.2.6**, angewendet bei Höhe 8.970.638 am 27. Oktober 2026, nach v3.2.5 bei Höhe 8.890.800 am 26. Oktober und v3.2.4 bei Höhe 8.337.253 am 19. Oktober). Der Mainnet-Governance-Vorschlag 14 befindet sich in der Abstimmungsphase; er würde v3.2.5 bei Höhe 3.906.833 anwenden, und was dieses Release ändert, wird dokumentiert, sobald das Mainnet es angewendet hat. Übergeben Sie die passende `--chain-id` für das Netzwerk, dem Sie beitreten möchten — die folgenden Beispiele zielen auf das Testnet ab; verwenden Sie `--chain-id qorechain-vladi` für das Mainnet. Die aktuelle Version jedes Netzwerks ist in `latest.json` unter [download.qore.host](https://download.qore.host) aufgeführt.

Die Befehle auf dieser Seite wurden gegen die Release-Binary v3.2.3 geprüft. Die v3.2.4-Binary enthält Befehle, die eine v3.2.3-Binary nicht hat (zum Beispiel `stakingtier`); sie laufen auf beiden Netzwerken (Testnet seit dem 19. Oktober 2026, Mainnet seit dem 23. Oktober 2026), und wo dieses Handbuch einen solchen erwähnt, wird das angegeben. Die v3.2.6-Binary (das Testnet) fügt zwei weitere Abfragebefehle hinzu, `query rlconsensus applied-params` und `last-action`; sie sind nur im Testnet verfügbar, bis das Mainnet dieses Release anwendet (siehe [Abfragebefehle](/cli-reference/query-commands#rlconsensus)). Alles Übrige auf dieser Seite verhält sich in beiden Releases gleich.
:::

---

## init

Initialisiert einen neuen Node mit dem angegebenen Moniker.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Typ    | Beschreibung                                     |
| ------------- | ------ | ------------------------------------------------ |
| `--chain-id`  | string | Chain-Kennung (immer angeben; ohne Angabe wird eine zufällige erzeugt) |
| `--home`      | string | Node-Home-Verzeichnis (Standard: `~/.qorechaind`) |
| `--overwrite` | bool   | Vorhandene `genesis.json` überschreiben |
| `--recover`   | bool   | Eine Seed-Phrase angeben, um einen vorhandenen Schlüssel wiederherzustellen, statt einen neuen zu erzeugen |

Erstellt die Verzeichnisstruktur unter `--home` mit `config/`, `data/` und einer initialen `genesis.json`. Ersetzen Sie bei einem Netzwerk-Node diese `genesis.json` vor dem Start durch die Genesis-Datei des Netzwerks (siehe [Mit dem Mainnet verbinden](/getting-started/connecting-to-mainnet)).

`init` schreibt außerdem die EVM-Chain-ID des Netzwerks (`9801` für `qorechain-vladi`, `9800` für `qorechain-diana`) in die Einstellung `evm-chain-id` der `app.toml`; übergeben Sie daher die richtige `--chain-id`.

---

## start

Startet den Node und beginnt mit der Synchronisierung bzw. der Blockerzeugung.

```bash
qorechaind start [flags]
```

| Flag                   | Typ    | Beschreibung                                          |
| ---------------------- | ------ | ------------------------------------------------------ |
| `--home`               | string | Node-Home-Verzeichnis                                  |
| `--minimum-gas-prices` | string | Minimaler Gas-Preis, den dieser Node akzeptiert. Die Untergrenze des Netzwerks liegt bei `0.1uqor`; setzen Sie mindestens diesen Wert |
| `--pruning`            | string | Pruning-Strategie: `default`, `nothing`, `everything`, `custom` (mit `--pruning-keep-recent` und `--pruning-interval`) |
| `--halt-height`        | uint   | Node bei dieser Blockhöhe anhalten                     |
| `--halt-time`          | uint   | Node zu diesem Unix-Zeitstempel anhalten               |
| `--log_level`          | string | Log-Ausführlichkeit: `info`, `debug`, `warn`, `error`  |
| `--trace`              | bool   | Vollständigen Stack-Trace bei Fehlern aktivieren       |

Eine aus dem öffentlichen Quellbaum gebaute Binary (der Community-Build) weigert sich, auf `qorechain-vladi` oder `qorechain-diana` zu starten: Sie kann Post-Quanten-Signaturen nicht verifizieren und die Blöcke der Netzwerke nicht originalgetreu nachspielen (Node-Version v3.2.3 und später). Verwenden Sie die Release-Binary von [download.qore.host](https://download.qore.host); siehe [Aus dem Quellcode bauen](/developer-guide/building-from-source).

---

## version

`qorechaind version` meldet bei den Release-Binaries die Versionsnummer **nicht**: Es gibt eine leere Zeile aus, und `version --long` fügt keine Build-Details hinzu. Verlassen Sie sich nicht darauf, um Releases zu unterscheiden. So bestätigen Sie, was Sie betreiben:

- Vergleichen Sie vor dem Entpacken den SHA-256 des **heruntergeladenen Archivs** mit `binary.sha256` im [Manifest](https://download.qore.host/mainnet/latest.json) des Netzwerks (und bewahren Sie dieses Archiv oder dessen Prüfsumme als Nachweis dessen auf, was Sie installiert haben).
- Fragen Sie die Chain, welche Upgrades sie angewendet hat: `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` liefert die Höhe, bei der ein Upgrade angewendet wurde, oder `0`, falls es nicht angewendet wurde.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 / v3.2.4 been applied on mainnet, and at which height? (a name that was not applied returns {"height":"0"}, e.g. v3.2.5 today)
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.4   # {"height":"3742566"}
```

---

## status

Fragt den laufenden Node nach seinem aktuellen Status ab, einschließlich Sync-Status, aktueller Blockhöhe und Konsens-Informationen.

```bash
qorechaind status
```

| Flag     | Typ    | Beschreibung                                       |
| -------- | ------ | --------------------------------------------------- |
| `--node` | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`)    |

Liefert JSON mit den Abschnitten `node_info`, `sync_info` und `validator_info`.

---

## client configuration

Es gibt keinen Unterbefehl `config`. Client-Standardwerte (`chain-id`, `keyring-backend`, `output`, `node`) werden aus `<home>/config/client.toml` gelesen; bearbeiten Sie diese Datei oder übergeben Sie das Flag bei jedem Befehl (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

Verwaltet den lokalen Keyring zum Signieren von Transaktionen.

### Einen neuen Schlüssel hinzufügen

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Typ    | Beschreibung                                     |
| ---------------------- | ------ | -------------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Schlüsselalgorithmus: `secp256k1` (Standard) oder `eth_secp256k1` |
| `--coin-type`          | uint32 | HD-Coin-Type (Standard `118`)                      |
| `--recover`            | bool   | Schlüssel aus Mnemonic wiederherstellen            |
| `--multisig`           | string | Kommagetrennte Liste von Schlüsseln für Multisig   |
| `--multisig-threshold` | uint   | Minimal erforderliche Anzahl an Signaturen         |

### Alle Schlüssel auflisten

```bash
qorechaind keys list --keyring-backend <backend>
```

### Schlüsseldetails anzeigen

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Typ    | Beschreibung                              |
| ----------- | ------ | ------------------------------------------- |
| `--bech`    | string | Ausgabeformat: `acc`, `val`, `cons`        |
| `--address` | bool   | Nur die Adresse anzeigen                    |
| `--pubkey`  | bool   | Nur den öffentlichen Schlüssel anzeigen     |

### Einen Schlüssel löschen

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Einen Schlüssel exportieren (Armor-verschlüsselt)

```bash
qorechaind keys export <name>
```

### Einen Schlüssel importieren

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Verwaltet die Genesis-Datei.

### Ein Genesis-Konto hinzufügen

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Typ    | Beschreibung                          |
| -------------------- | ------ | ---------------------------------------- |
| `--vesting-amount`   | string | Vesting-Betrag                           |
| `--vesting-start-time` | int  | Vesting-Startzeitpunkt (Unix-Zeitstempel) |
| `--vesting-end-time` | int    | Vesting-Endzeitpunkt (Unix-Zeitstempel)  |

### Eine Genesis-Transaktion erstellen

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Typ    | Beschreibung             |
| ----------------------- | ------ | -------------------------- |
| `--chain-id`            | string | Chain-Kennung               |
| `--moniker`             | string | Validator-Moniker           |
| `--commission-rate`     | string | Anfängliche Kommissionsrate |
| `--commission-max-rate` | string | Maximale Kommissionsrate    |

### Genesis-Transaktionen sammeln

```bash
qorechaind genesis collect-gentxs
```

Weitere `genesis`-Unterbefehle: `bulk-add-genesis-account` und `migrate`.

### Die Genesis-Datei validieren

```bash
qorechaind genesis validate
```

---

## Consensus Engine

Diese Unterbefehle interagieren mit der QoreChain-Consensus-Engine-Schicht.

### Validator-Schlüssel anzeigen

```bash
qorechaind comet show-validator
```

Gibt den öffentlichen Konsensschlüssel im JSON-Format aus. Wird zur Überprüfung der Validator-Identität verwendet.

### Node-ID anzeigen

```bash
qorechaind comet show-node-id
```

Gibt den P2P-Node-Identifikator (hex-kodiert) aus. Wird für die Konfiguration persistenter Peers verwendet.

---

## export

Exportiert den aktuellen Chain-Zustand als JSON-Genesis-Datei. Nützlich für Chain-Upgrades oder Snapshots.

```bash
qorechaind export [flags]
```

| Flag                | Typ    | Beschreibung                                  |
| ------------------- | ------ | ------------------------------------------------ |
| `--for-zero-height` | bool   | Export für einen Neustart bei Höhe 0 vorbereiten |
| `--height`          | int    | Zustand bei einer bestimmten Blockhöhe exportieren |
| `--home`            | string | Node-Home-Verzeichnis                            |
| `--output-document` | string | Den Export in diese Datei statt nach STDOUT schreiben |
| `--modules-to-export` | strings | Kommagetrennte Liste der zu exportierenden Module (Standard: alle) |
| `--jail-allowed-addrs` | strings | Operator-Adressen gejailter Validatoren, die aus dem Jail entlassen werden sollen |

---

## rollback

Setzt den Chain-Zustand um einen Block zurück. Nützlich zur Wiederherstellung nach einem Konsensfehler.

```bash
qorechaind rollback [flags]
```

| Flag     | Typ    | Beschreibung                                             |
| -------- | ------ | ----------------------------------------------------------- |
| `--hard` | bool   | Entfernt zusätzlich den letzten Block aus dem Block-Store   |
| `--home` | string | Node-Home-Verzeichnis                                       |

Dieser Befehl setzt sowohl den Anwendungszustand als auch den Konsenszustand zurück. Mit Vorsicht verwenden, da dies nicht rückgängig gemacht werden kann.
