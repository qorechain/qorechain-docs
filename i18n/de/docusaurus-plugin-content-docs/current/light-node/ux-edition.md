---
slug: /light-node/ux-edition
title: UX Edition (Web-Dashboard)
sidebar_label: UX Edition
sidebar_position: 3
---

# UX Edition — Web-Dashboard

Die **UX (User eXperience)**-Edition führt denselben Light-Node-Daemon aus wie die SX-Edition, fügt aber ein **eingebettetes Web-Dashboard** hinzu, mit dem du den Node und das Netzwerk im Browser beobachten kannst. Die Binärdatei heißt `lightnode-ux`. Wie die SX-Edition gehört sie zur **v3.1.2**-Linie des Light Node (eine eigene Versionsnummer, getrennt von der Chain-Version).

Die UX-Edition ist die richtige Wahl für den Desktop-Einsatz und für Betreiber, die eine visuelle Oberfläche der Kommandozeile vorziehen.

## Installation

Vorgefertigte Binärdateien laufen nativ auf **sechs Plattformen ohne native Abhängigkeiten** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) und Windows (amd64, arm64) — jeweils etwa 16 MB groß. Prüfe die Prüfsumme des Downloads gegen das Manifest, bevor du ihn ausführst — siehe [SX Edition](/light-node/sx-edition#install) für die Vorgehensweise.

### Aus dem Quellcode bauen

Die UX-Edition benötigt **Go 1.26.1**. Ihre Post-Quanten-Kryptografie ist eine reine Go-Implementierung (kein CGO, keine native Bibliothek):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Das erzeugt `build/lightnode-ux`.

### Docker

Der UX-Dienst wird aus `Dockerfile.ux` gebaut:

```bash
docker compose up lightnode-ux
```

Der UX-Container speichert Daten dauerhaft in einem benannten Volume unter `/root/.qorechain-lightnode` und liest die Chain-RPC-Adresse aus der Umgebungsvariable `QORECHAIN_RPC_ADDR`.

## Ausführen

Starte den UX-Node:

```bash
build/lightnode-ux start
```

Dies startet den Daemon und den eingebetteten Dashboard-Server zusammen. Die UX-Edition aktiviert das Dashboard immer. Beim Start gibt die Binärdatei die Dashboard-URL aus.

Die UX-Edition teilt sich das Setup mit der SX-Edition: Sie liest dieselbe `config.toml` aus `~/.qorechain-lightnode` und verwendet denselben Dilithium-5-Schlüsselbund. Falls du den Node noch nicht konfiguriert hast, führe zuerst den SX-Assistenten aus (`lightnode-sx onboard`), um die Konfiguration zu schreiben und deinen Schlüssel zu importieren oder zu erzeugen — siehe [SX Edition](/light-node/sx-edition).

## Das Web-Dashboard auf Port 8420

Das Dashboard wird auf **Port 8420** bereitgestellt. Das ist der Port, den das `lightnode-ux`-Docker-Image deklariert (`EXPOSE 8420`), und der Standardport, an den die Binärdatei bindet. Wenn der Node also in Docker läuft, wird das Dashboard auf `8420` veröffentlicht:

```
http://localhost:8420
```

:::caution Prüfe dein Compose-Port-Mapping
An anderer Stelle wird in manchen Texten Port 8080 für das Dashboard genannt. Der maßgebliche Wert ist **8420** — das ist der Port, den das Image tatsächlich exponiert und an den der Daemon standardmäßig bindet. Wenn du deine eigene `docker-compose.yml` oder einen Reverse-Proxy anpasst, mappe auf **8420**, nicht auf 8080.
:::

:::caution Keine Route auf dem Dashboard authentifiziert
Nichts hinter Port 8420 hat einen Login oder eine Zugriffskontrolle — jeder, der ihn erreichen kann, kann deine Konfiguration, Delegationen und Rewards einsehen; ein privater Schlüssel wird jedoch nie ausgeliefert. Die Binärdatei bindet jetzt **standardmäßig nur an Loopback** (`127.0.0.1:8420`) statt an alle Schnittstellen und gibt beim Start eine Warnung aus, falls du sie so konfiguriert hast, dass sie weiter reichend lauscht — aber die Warnung ist keine Verweigerung, und sie fügt keine Authentifizierung hinzu. Wenn du die Bindung absichtlich erweiterst (etwa um von einer anderen Maschine darauf zuzugreifen, oder weil du den Port aus Docker heraus veröffentlichst), stelle sie hinter einen Reverse-Proxy mit Authentifizierungspflicht, statt sie direkt offenzulegen. Die WebSocket-Telemetrieverbindung prüft außerdem den `Origin`-Header des Browsers, da eine weit geöffnete Netzwerkbindung allein nicht verhindert, dass eine andere im selben Browser geöffnete Seite sich verbindet.
:::

## Was das Dashboard zeigt

Das Dashboard ist in folgende Ansichten gegliedert:

- **Overview** — Blockhöhe und Node-Status auf einen Blick.
- **Validators** — die Menge der gebondeten Validatoren.
- **Delegation** — deine aktuellen Delegationen und deren Aufteilung.
- **Network** — Live-Netzwerktelemetrie und kürzlich synchronisierte Header.
- **Bridge** — Cross-Chain-Bridge-Telemetrie.
- **Tokenomics** — Token-Ökonomie-Telemetrie.
- **Settings** — die effektive Konfiguration des Nodes.

Die Telemetrie wird in Echtzeit aktualisiert; der Daemon aktualisiert Validatoren-, Netzwerk-, Bridge- und Tokenomics-Daten in unabhängigen Intervallen (konfigurierbar unter `[telemetry]` in `config.toml`).

### Banner „Nur lokal“

Wenn für den Node **kein Chain-RPC-Endpunkt konfiguriert** ist, läuft das Dashboard im **Nur-lokal-Modus** und zeigt ein deutliches Banner, das den Zustand erklärt: Der PQC-Stack ist verifiziert, aber der Node synchronisiert keine Chain, sodass die Blockhöhe bei `0` bleibt. Das Banner fordert dich auf, den Onboarding-Assistenten auf dem Host auszuführen:

```bash
lightnode-sx onboard
```

Der Assistent führt den PQC-Selbsttest aus, fragt nach deinem Chain-Endpunkt und importiert oder erzeugt deinen Validator-Schlüssel. Sobald ein Endpunkt konfiguriert ist, starte den Node neu, und das Dashboard beginnt, Live-Chain-Daten anzuzeigen.

## Wie es weitergeht

- [Registrierung und Lizenzierung](/light-node/registration-and-licensing) — registriere den Node on-chain.
- [Rewards und Monitoring](/light-node/rewards-and-monitoring) — verdiene den 3%igen Light-Node-Anteil und überwache die Node-Gesundheit.
