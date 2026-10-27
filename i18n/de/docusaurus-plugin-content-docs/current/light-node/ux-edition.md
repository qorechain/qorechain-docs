---
slug: /light-node/ux-edition
title: UX Edition (Web-Dashboard)
sidebar_label: UX Edition
sidebar_position: 3
---

# UX Edition — Web-Dashboard

Die **UX (User eXperience)**-Edition führt denselben Light-Node-Daemon aus wie die SX-Edition, fügt aber ein **eingebettetes Web-Dashboard** hinzu, mit dem du den Node und das Netzwerk im Browser beobachten kannst. Die Binärdatei heißt `lightnode-ux`. Wie bei der SX-Edition liegt sie auf der eigenen Versionslinie des Light Nodes, getrennt von der Chain-Version (die Kanäle beider Netzwerke tragen am 27. Oktober 2026 3.1.12).

Die UX-Edition ist die richtige Wahl für den Desktop-Einsatz und für Betreiber, die eine visuelle Oberfläche der Kommandozeile vorziehen.

## Installation

Vorgefertigte Binärdateien laufen nativ auf **sechs Plattformen ohne native Abhängigkeiten** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) und Windows (amd64, arm64) — jeweils etwa 13 MB groß. Prüfe die Prüfsumme des Downloads gegen das Manifest, bevor du ihn ausführst — siehe [SX Edition](/light-node/sx-edition#install) für die Vorgehensweise.

### Aus dem Quellcode bauen

Die UX-Edition benötigt **Go 1.26.1**. Ihre Post-Quanten-Kryptografie ist eine reine Go-Implementierung (kein CGO, keine native Bibliothek):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Baue aus dem Release-Tag, den das Manifest nennt (heute `git checkout v3.1.12`). Das erzeugt `build/lightnode-ux`.

### Docker

Der UX-Dienst wird aus `Dockerfile.ux` im Quell-Repository (`github.com/qorechain/qorechain-lightnode`, der Tag, der zum Manifest deines Netzwerks passt) gebaut. Der Container benötigt eine `config.toml` in seinem Daten-Volume, bevor er startet. Die UX-Binärdatei enthält die Einrichtungsbefehle, du kannst sie also direkt im Volume erstellen:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

Innerhalb eines Containers muss das Dashboard auf allen Container-Schnittstellen lauschen, setze daher Folgendes in dieser Konfiguration (`/root/.qorechain-lightnode/config.toml` im Volume) und veröffentliche den Port nur auf dem Loopback des Hosts. Die mitgelieferte `docker-compose.yml` veröffentlicht `8420:8420`, was von anderen Maschinen aus erreichbar ist; ändere das:

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

Der UX-Container speichert Daten, einschließlich des Schlüsselbunds, dauerhaft in einem benannten Volume unter `/root/.qorechain-lightnode` und liest die Chain-RPC-Adresse aus der Umgebungsvariable `QORECHAIN_RPC_ADDR`. Der Node signiert seine eigenen Transaktionen, daher kann ein UX-Container sich registrieren und Heartbeats senden wie die SX-Edition. Das UX-Image enthält kein `qorechaind`, daher steht der `qorechaind`-Fallback darin nicht zur Verfügung.

## Ausführen

Starte den UX-Node:

```bash
build/lightnode-ux start
```

Dies startet den Daemon und den eingebetteten Dashboard-Server zusammen. Die UX-Edition aktiviert das Dashboard immer. Beim Start gibt die Binärdatei die Dashboard-URL aus.

Die UX-Edition teilt sich das Setup mit der SX-Edition: Sie liest dieselbe `config.toml` aus `~/.qorechain-lightnode`, verwendet denselben Schlüsselbund und hat dieselben Befehle (`onboard`, `keys`, `register`, `status`, `selftest` und die übrigen). Die Ersteinrichtung besteht aus denselben fünf Schritten, mit `lightnode-ux` anstelle von `lightnode-sx`:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

Siehe [SX Edition](/light-node/sx-edition#first-run-onboard) dazu, was jeder Befehl tut, und [Registrierung und Lizenzierung](/light-node/registration-and-licensing) für die Voraussetzungen. Der Daemon in der UX-Edition signiert und sendet Heartbeats auf dieselbe Weise wie die SX-Edition, unter Linux, macOS und Windows. Wird `register` aus der UX-Binärdatei ausgeführt, wird der Node mit dem Typ `ux` registriert.

## Das Web-Dashboard auf Port 8420

Das Dashboard wird auf **Port 8420** bereitgestellt. Das ist der Port, den das `lightnode-ux`-Docker-Image deklariert (`EXPOSE 8420`), und der Standardport, an den die Binärdatei bindet. Wenn der Node also in Docker läuft, wird das Dashboard auf `8420` veröffentlicht:

```
http://localhost:8420
```

:::caution Prüfe dein Compose-Port-Mapping
An anderer Stelle wird in manchen Texten Port 8080 für das Dashboard genannt. Der maßgebliche Wert ist **8420** — das ist der Port, den das Image tatsächlich exponiert und an den der Daemon standardmäßig bindet. Wenn du deine eigene `docker-compose.yml` oder einen Reverse-Proxy anpasst, mappe auf **8420**, nicht auf 8080.
:::

:::caution Schütze das Dashboard
Das Dashboard hat keinen Login. Solange du `[dashboard] token` nicht setzt, kann jeder, der Port 8420 erreicht, deine Konfiguration, Delegationen und Rewards einsehen; ein privater Schlüssel wird jedoch nie ausgeliefert. Mit gesetztem Token verlangen jede `/api`-Route und die `/ws`-Verbindung den Header `Authorization: Bearer <token>` (das Token, das QoreX beim Koppeln mit dem Node sendet); über einfaches `http` geht dieses Token im Klartext über das Netzwerk. Die Binärdatei bindet jetzt **standardmäßig nur an Loopback** (`127.0.0.1:8420`) statt an alle Schnittstellen und gibt beim Start eine Warnung aus, falls du sie so konfiguriert hast, dass sie weiter reichend lauscht — aber die Warnung ist keine Verweigerung. Wenn du die Bindung absichtlich erweiterst (etwa um von einer anderen Maschine darauf zuzugreifen, oder weil du den Port aus Docker heraus veröffentlichst), setze ein Token und stelle das Dashboard hinter https (einen Reverse-Proxy oder einen SSH-Tunnel), statt es direkt offenzulegen. Die WebSocket-Telemetrieverbindung prüft außerdem den `Origin`-Header des Browsers, da eine weit geöffnete Netzwerkbindung allein nicht verhindert, dass eine andere im selben Browser geöffnete Seite sich verbindet.
:::

## Was das Dashboard zeigt

Das Dashboard ist in folgende Ansichten gegliedert:

- **Overview** — Blockhöhe und Node-Status auf einen Blick.
- **Validators** — die Menge der gebondeten Validatoren.
- **Delegation** — die aus deinem Operator-Konto (`operator_address`) gespiegelten Delegationen.
- **Network** — Live-Netzwerktelemetrie und kürzlich synchronisierte Header.
- **Bridge** — Cross-Chain-Bridge-Telemetrie.
- **Tokenomics** — Token-Ökonomie-Telemetrie.
- **Settings** — die effektive Konfiguration des Nodes.

Ab Light Node 3.1.11 zeigt das Dashboard ein Banner, wenn der Node ein neueres Release findet (siehe [SX Edition: Aktualisieren](/light-node/sx-edition#updating)). Seine lokale API liefert dieselbe Information unter `GET /api/update`.

Die Telemetrie wird in Echtzeit aktualisiert; der Daemon aktualisiert Validatoren-, Netzwerk-, Bridge- und Tokenomics-Daten in unabhängigen Intervallen (konfigurierbar unter `[telemetry]` in `config.toml`).

### Banner „Nur lokal“

Wenn für den Node **kein Chain-RPC-Endpunkt konfiguriert** ist, läuft das Dashboard im **Nur-lokal-Modus** und zeigt ein deutliches Banner, das den Zustand erklärt: Der PQC-Stack ist verifiziert, aber der Node synchronisiert keine Chain, sodass die Blockhöhe bei `0` bleibt. Das Banner fordert dich auf, den Onboarding-Assistenten auf dem Host auszuführen (es nennt `lightnode-sx`; `lightnode-ux onboard` tut dasselbe):

```bash
lightnode-sx onboard
```

Der Assistent führt den PQC-Selbsttest aus, fragt nach deinem Chain-Endpunkt und importiert oder erzeugt deinen Node-Schlüssel. Sobald ein Endpunkt konfiguriert ist, starte den Node neu, und das Dashboard beginnt, Live-Chain-Daten anzuzeigen.

## Wie es weitergeht

- [Registrierung und Lizenzierung](/light-node/registration-and-licensing) — registriere den Node on-chain.
- [Rewards und Monitoring](/light-node/rewards-and-monitoring) — wie der 3%ige Light-Node-Anteil gutgeschrieben und eingefordert wird und wie du die Node-Gesundheit überwachst.
