---
slug: /light-node/ux-edition
title: UX-Edition (Web-Dashboard)
sidebar_label: UX-Edition
sidebar_position: 3
---

# UX-Edition — Web-Dashboard

Die **UX-Edition (User eXperience)** führt denselben Light-Node-Daemon aus wie die SX-Edition, fügt aber ein **eingebettetes Web-Dashboard** hinzu, sodass du den Node und das Netzwerk in einem Browser beobachten kannst. Die Binärdatei ist `lightnode-ux`. Wie die SX-Edition ist dies die **v3.1.1**-Linie des Light Nodes (seine eigene Version, getrennt von der Chain-Version).

Die UX-Edition ist die richtige Wahl für die Desktop-Nutzung und für Operatoren, die eine visuelle Oberfläche der Kommandozeile vorziehen.

## Installation

### Aus dem Quellcode bauen

Die UX-Edition benötigt **Go 1.26.1** und wird mit aktiviertem CGO für die native Post-Quantum-Bibliothek gebaut:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Dies erzeugt `build/lightnode-ux`.

### Docker

Der UX-Dienst baut aus `Dockerfile.ux`:

```bash
docker compose up lightnode-ux
```

Der UX-Container speichert Daten in einem benannten Volume unter `/root/.qorechain-lightnode` und liest die Chain-RPC-Adresse aus der Umgebungsvariable `QORECHAIN_RPC_ADDR`.

## Ausführen

Starte den UX-Node:

```bash
build/lightnode-ux start
```

Dies startet den Daemon und den eingebetteten Dashboard-Server gemeinsam. Die UX-Edition aktiviert das Dashboard immer. Beim Start gibt die Binärdatei die Dashboard-URL aus.

Die UX-Edition teilt sich die Einrichtung mit der SX-Edition: Sie liest dieselbe `config.toml` aus `~/.qorechain-lightnode` und verwendet denselben Dilithium-5-Keyring. Wenn du den Node noch nicht konfiguriert hast, führe zuerst den SX-Assistenten aus (`lightnode-sx onboard`), um die Konfiguration zu schreiben und deinen Schlüssel zu importieren oder zu erzeugen — siehe [SX-Edition](/light-node/sx-edition).

## Das Web-Dashboard auf Port 8420

Das Dashboard wird auf **Port 8420** bereitgestellt. Das ist der Port, den das `lightnode-ux`-Docker-Image deklariert (`EXPOSE 8420`), und der Standard, an den sich die Binärdatei bindet, sodass das Dashboard beim Ausführen in Docker auf `8420` veröffentlicht wird:

```
http://localhost:8420
```

:::caution Prüfe dein Compose-Port-Mapping
Anderswo wird in manchen Texten Port 8080 für das Dashboard genannt. Der maßgebliche Wert ist **8420** — das ist es, was das Image tatsächlich exponiert und woran sich der Daemon standardmäßig bindet. Wenn du deine eigene `docker-compose.yml` oder einen Reverse-Proxy anpasst, mappe auf **8420**, nicht auf 8080.
:::

## Was das Dashboard zeigt

Das Dashboard ist in die folgenden Ansichten gegliedert:

- **Overview** — Blockhöhe und Node-Status auf einen Blick.
- **Validators** — die gebundene (bonded) Validatorenmenge.
- **Delegation** — deine aktuellen Delegationen und ihre Aufteilung.
- **Network** — Live-Netzwerk-Telemetrie und kürzlich synchronisierte Header.
- **Bridge** — Cross-Chain-Bridge-Telemetrie.
- **Tokenomics** — Token-Ökonomie-Telemetrie.
- **Settings** — die effektive Konfiguration des Nodes.

Die Telemetrie wird in Echtzeit aktualisiert, wobei der Daemon Validatoren-, Netzwerk-, Bridge- und Tokenomics-Daten in unabhängigen Intervallen aktualisiert (konfigurierbar unter `[telemetry]` in `config.toml`).

### Local-only-Banner

Wenn der Node **keinen Chain-RPC-Endpunkt konfiguriert** hat, läuft das Dashboard im **Local-only-Modus** und zeigt ein auffälliges Banner, das den Zustand erklärt: Der PQC-Stack ist verifiziert, aber der Node synchronisiert keine Chain, sodass die Blockhöhe bei `0` bleibt. Das Banner fordert dich auf, den Onboarding-Assistenten auf dem Host auszuführen:

```bash
lightnode-sx onboard
```

Der Assistent führt den PQC-Selbsttest aus, fragt nach deinem Chain-Endpunkt und importiert oder erzeugt deinen Validator-Schlüssel. Sobald ein Endpunkt konfiguriert ist, starte den Node neu, und das Dashboard beginnt, Live-Chain-Daten anzuzeigen.

## Wie es weitergeht

- [Registrierung und Lizenzierung](/light-node/registration-and-licensing) — den Node on-chain registrieren.
- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — den 3%-Light-Node-Anteil verdienen und den Node-Zustand überwachen.
