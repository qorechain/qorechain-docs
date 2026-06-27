---
slug: /cli-reference/node-commands
title: Node-Befehle
sidebar_label: Node-Befehle
sidebar_position: 1
---

# Node-Befehle

Referenz für `qorechaind`-Befehle, die zum Initialisieren, Konfigurieren und Betreiben eines QoreChain-Nodes verwendet werden.

:::note
QoreChain betreibt zwei Netzwerke: das **`qorechain-vladi`**-Mainnet (live seit dem 7. Juni 2026 auf Chain-Version **v3.1.77**) und das **`qorechain-diana`**-Testnet. Übergeben Sie die passende `--chain-id` für das Netzwerk, dem Sie beitreten möchten — die folgenden Beispiele zielen auf das Testnet ab; verwenden Sie `--chain-id qorechain-vladi` für das Mainnet.
:::

---

## init

Initialisiert einen neuen Node mit dem angegebenen Moniker.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Typ   | Beschreibung                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Chain-Identifikator (erforderlich)                    |
| `--home`      | string | Node-Home-Verzeichnis (Standard: `~/.qorechaind`) |
| `--overwrite` | bool   | Vorhandene Genesis- und Konfigurationsdateien überschreiben    |

Erstellt die Verzeichnisstruktur unter `--home` mit `config/`, `data/` und einer initialen `genesis.json`.

---

## start

Startet den Node und beginnt mit der Synchronisierung oder der Blockproduktion.

```bash
qorechaind start [flags]
```

| Flag                   | Typ   | Beschreibung                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Node-Home-Verzeichnis                                  |
| `--minimum-gas-prices` | string | Zu akzeptierende minimale Gaspreise (z. B. `0.001uqor`)     |
| `--pruning`            | string | Pruning-Strategie: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Node bei dieser Blockhöhe stoppen                   |
| `--halt-time`          | uint   | Node bei diesem Unix-Zeitstempel stoppen                 |
| `--log_level`          | string | Log-Ausführlichkeit: `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | Vollständigen Stack-Trace bei Fehlern aktivieren                    |

---

## version

Gibt die `qorechaind`-Binärversion und Build-Informationen aus.

```bash
qorechaind version
```

Verwenden Sie `--long` für erweiterte Build-Details einschließlich Go-Version, Commit-Hash und Build-Tags:

```bash
qorechaind version --long
```

---

## status

Fragt den laufenden Node nach seinem aktuellen Status ab, einschließlich Synchronisierungsstatus, neuester Blockhöhe und Konsensinformationen.

```bash
qorechaind status
```

| Flag     | Typ   | Beschreibung                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`) |

Gibt JSON mit den Abschnitten `node_info`, `sync_info` und `validator_info` zurück.

---

## config

Liest oder schreibt Werte in der Node-Konfiguration.

### Einen Konfigurationswert setzen

```bash
qorechaind config set <key> <value>
```

### Einen Konfigurationswert abrufen

```bash
qorechaind config get <key>
```

Gängige Konfigurationsschlüssel sind `chain-id`, `keyring-backend`, `output` und `node`.

---

## keys

Verwaltet den lokalen Keyring zum Signieren von Transaktionen.

### Einen neuen Schlüssel hinzufügen

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Typ   | Beschreibung                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `test`                   |
| `--algo`               | string | Schlüsselalgorithmus: `secp256k1` (Standard), `ed25519` |
| `--recover`            | bool   | Schlüssel aus Mnemonic wiederherstellen                       |
| `--multisig`           | string | Kommagetrennte Liste von Schlüsseln für Multisig       |
| `--multisig-threshold` | uint   | Mindestanzahl erforderlicher Signaturen                     |

### Alle Schlüssel auflisten

```bash
qorechaind keys list --keyring-backend <backend>
```

### Schlüsseldetails anzeigen

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Typ   | Beschreibung                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Ausgabeformat: `acc`, `val`, `cons` |
| `--address` | bool   | Nur Adresse anzeigen                   |
| `--pubkey`  | bool   | Nur öffentlichen Schlüssel anzeigen                |

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

| Flag                 | Typ   | Beschreibung                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Vesting-Betrag                    |
| `--vesting-end-time` | int    | Vesting-Endzeit (Unix-Zeitstempel) |

### Eine Genesis-Transaktion erstellen

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Typ   | Beschreibung             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Chain-Identifikator        |
| `--moniker`             | string | Validator-Moniker       |
| `--commission-rate`     | string | Initiale Provisionsrate |
| `--commission-max-rate` | string | Maximale Provisionsrate |

### Genesis-Transaktionen sammeln

```bash
qorechaind genesis collect-gentxs
```

### Die Genesis-Datei validieren

```bash
qorechaind genesis validate-genesis
```

---

## Consensus Engine

Diese Unterbefehle interagieren mit der Schicht der QoreChain Consensus Engine.

### Validator-Schlüssel anzeigen

```bash
qorechaind comet show-validator
```

Gibt den öffentlichen Konsensschlüssel im JSON-Format aus. Wird zur Überprüfung der Validator-Identität verwendet.

### Node-ID anzeigen

```bash
qorechaind comet show-node-id
```

Gibt den P2P-Node-Identifikator (hex-codiert) aus. Wird für die Konfiguration persistenter Peers verwendet.

---

## export

Exportiert den aktuellen Chain-Zustand als JSON-Genesis-Datei. Nützlich für Chain-Upgrades oder Snapshots.

```bash
qorechaind export [flags]
```

| Flag                | Typ   | Beschreibung                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Export für Neustart bei Höhe 0 vorbereiten |
| `--height`          | int    | Zustand bei einer bestimmten Blockhöhe exportieren   |
| `--home`            | string | Node-Home-Verzeichnis                       |

---

## rollback

Setzt den Chain-Zustand um einen Block zurück. Nützlich zur Wiederherstellung nach einem Konsensfehler.

```bash
qorechaind rollback [flags]
```

| Flag     | Typ   | Beschreibung                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Auch den letzten Block aus dem Block-Store entfernen |
| `--home` | string | Node-Home-Verzeichnis                                |

Dieser Befehl setzt sowohl den Anwendungszustand als auch den Konsenszustand zurück. Mit Vorsicht verwenden, da er nicht rückgängig gemacht werden kann.
