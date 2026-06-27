---
slug: /light-node/sx-edition
title: SX-Edition (Server-Daemon)
sidebar_label: SX-Edition
sidebar_position: 2
---

# SX-Edition — Server-Daemon

Die **SX-Edition (Server eXperience)** ist der headless Light Node: ein Daemon plus eine vollständige Management-CLI, gebaut für Server und Automatisierung. Die Binärdatei ist `lightnode-sx`. Dies ist die **v3.1.1**-Linie des Light Nodes (seine eigene Version, getrennt von der Chain-Version).

## Installation

Du kannst die Binärdatei aus dem Quellcode bauen oder sie mit Docker ausführen.

### Aus dem Quellcode bauen

Der Light Node benötigt **Go 1.26.1** und wird mit aktiviertem CGO gebaut, da die Post-Quantum-Kryptografie eine native Bibliothek (`libqorepqc`) verwendet.

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Dies erzeugt `build/lightnode-sx`. Führe es direkt aus oder kopiere es in deinen `PATH`.

### Docker

Ein Docker-Setup wird bereitgestellt. Der SX-Dienst baut aus `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

Der SX-Container speichert seine Daten in einem benannten Volume, das unter `/root/.qorechain-lightnode` eingehängt ist, und liest die Chain-RPC-Adresse aus der Umgebungsvariable `QORECHAIN_RPC_ADDR`.

## Konfiguration

Der Light Node liest eine TOML-Konfigurationsdatei. Standardmäßig sucht er nach `config.toml` im Home-Verzeichnis (`~/.qorechain-lightnode/config.toml`). Normalerweise schreibst du diese Datei nicht von Hand — der [`onboard`-Assistent](#first-run-onboard) erstellt sie für dich — aber es ist nützlich, die Optionen zu verstehen.

Zwei persistente Flags gelten für jeden Befehl:

- `--config <path>` — auf eine Konfigurationsdatei an einem nicht standardmäßigen Ort zeigen.
- `--home <dir>` — das für Daten und Schlüssel verwendete Home-Verzeichnis überschreiben (Standard ist `~/.qorechain-lightnode`).

Die relevantesten Konfigurationsoptionen auf Nutzungsebene:

| Option | Was sie steuert |
| --- | --- |
| `chain_id` | Der Netzwerk-Identifikator (zum Beispiel `qorechain-diana` im Testnet, `qorechain-vladi` im Mainnet). |
| `rpc_addr` | Der Chain-RPC-Endpunkt, mit dem sich der Daemon verbindet. Leer lassen, um im **Local-only-Modus** zu laufen. |
| `primary_addr` / `witness_addrs` | Die vom Skipping-Light-Client verwendeten Primary- und Witness-RPC-Endpunkte. |
| `trust_period` / `max_clock_drift` | Vertrauensfenster des Light Clients (zum Beispiel `168h`) und zulässige Taktabweichung (Clock Drift). |
| `data_dir` | Wo der Node seine Datenbank und Header speichert. |
| `keyring_backend` / `key_name` | Keyring-Backend (`file` oder `os`) und der Name des Operator-Schlüssels. |
| `[delegation]` | Auto-Compound an/aus, Compound-Intervall, Mindestbelohnung für das Einfordern, Validatorenmenge, Aufteilungsgewichte, Rebalancing und Mindestreputation. |
| `[telemetry]` | Ob Telemetrie aktiviert ist und die Aktualisierungsintervalle für Validatoren, Netzwerk, Bridge und Tokenomics. |
| `log_level` / `log_format` | Logging-Ausführlichkeit (`debug`, `info`, `warn`, `error`) und Format (`text` oder `json`). |

Die Delegations-Standardwerte aktivieren Auto-Compound mit einem Intervall von `1h` und reputationsbewusstes Rebalancing — siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) dazu, was diese bewirken.

## Erster Start: `onboard` {#first-run-onboard}

Beim ersten Start stoppt `start` und verweist dich auf den Onboarding-Assistenten, falls noch keine Konfigurationsdatei existiert. Führe den Assistenten aus:

```bash
build/lightnode-sx onboard
```

`onboard` führt dich in vier Schritten durch die Einrichtung:

1. **PQC-Selbsttest** — führt den vollständigen Dilithium-5-Roundtrip aus (dieselben Prüfungen wie [`selftest`](#verify-the-pqc-stack-selftest)). Wenn der PQC-Stack fehlschlägt, verweigert der Assistent das Fortfahren.
2. **Chain-RPC-Endpunkt** — füge deine QoreChain-RPC-URL ein oder lasse sie leer, um im **Local-only-Modus** zu laufen, solange keine Chain-Verbindung benötigt wird. Wenn du eine URL angibst, testet der Assistent die Erreichbarkeit live.
3. **Privater Validator-Schlüssel** — füge einen hex-kodierten privaten Dilithium-5-Schlüssel ein oder tippe `g` (oder `generate`), um auf diesem Node ein frisches Schlüsselpaar zu erzeugen.
4. **Speichern** — schreibt `config.toml` und legt den Schlüssel im Keyring ab.

:::note Local-only-Modus
Wenn du den Endpunkt leer lässt, startet der Daemon im Local-only-Modus: Der PQC-Stack wird vollständig durchlaufen, aber der Node synchronisiert keine Chain. Führe `onboard` erneut aus, sobald dein Chain-Endpunkt bereit ist, um den Node darauf zu verweisen.
:::

`onboard` überschreibt immer die aktive Konfiguration. Verwende `--config`, um an einen nicht standardmäßigen Pfad zu schreiben, oder `--non-interactive`, um schnell fehlzuschlagen statt nachzufragen (nützlich in CI).

## Ausführen: `start`

Sobald das Onboarding eine Konfiguration geschrieben hat, starte den Daemon:

```bash
build/lightnode-sx start
```

Der Daemon synchronisiert Header, verfolgt Delegationen und stellt Telemetrie bereit, bis er unterbrochen wird. Wenn du absichtlich ohne Konfigurationsdatei starten möchtest (Local-only, kein Chain-RPC), übergib `--skip-onboarding-check`.

## Den PQC-Stack verifizieren: `selftest` {#verify-the-pqc-stack-selftest}

Du kannst jederzeit bestätigen, dass der Post-Quantum-Stack funktionsfähig ist:

```bash
lightnode-sx selftest
```

`selftest` führt fünf Prüfungen gegen Dilithium-5 (ML-DSA-87) aus und schließt in unter einer Sekunde ab:

1. **Keygen** — ein frisches Schlüsselpaar erzeugen.
2. **Sign** — eine Testnachricht signieren.
3. **Verify (gültige Signatur)** — bestätigen, dass die Signatur mit dem passenden öffentlichen Schlüssel verifiziert.
4. **Manipulierte Signatur ablehnen** — ein Byte der Signatur umdrehen; die Verifizierung muss es ablehnen.
5. **Manipulierte Nachricht ablehnen** — ein Byte der Nachricht umdrehen; die Verifizierung muss es ablehnen.

Wenn eine Prüfung fehlschlägt, beendet sich die Binärdatei mit einem Exit-Code ungleich null und Diagnoseausgabe. Dies ist derselbe Test, den der Onboarding-Assistent als ersten Schritt ausführt, und er ist praktisch für die Verifizierung vor dem Deployment und für Support-Diagnosen.

## Management-Befehle

Die SX-CLI enthält Befehle zum Einsehen des Node-Zustands und zur Schlüsselverwaltung:

| Befehl | Zweck |
| --- | --- |
| `status` | Node- und Light-Client-Sync-Status anzeigen (Chain-ID, neueste Höhe, Aufhol-Status). |
| `keys create <name>` | Einen neuen Dilithium-5-Schlüssel erstellen. |
| `keys list` | Schlüssel im Keyring auflisten. |
| `keys import <name> <hex-privkey>` | Einen hex-kodierten privaten Schlüssel importieren. |
| `keys export <name>` | Einen privaten Schlüssel im Hex-Format exportieren. |
| `register` | Den On-Chain-Registrierungsbefehl für diesen Node ausgeben — siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing). |
| `validators` | Gebundene (bonded) Validatoren auflisten. |
| `delegation` | Aktuelle Delegationen aus der lokalen Datenbank anzeigen. |
| `rewards` | Ausstehende Staking-Belohnungen anzeigen. |
| `network` | Netzwerk-Telemetrie (kürzlich synchronisierte Header) aus der lokalen Datenbank anzeigen. |
| `version` | Die Version der Binärdatei ausgeben. |

Für Details zu Staking, Belohnungen und Überwachung siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring). Zum On-Chain-Registrieren siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing).
