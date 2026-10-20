---
slug: /developer-guide/building-from-source
title: Aus dem Quellcode bauen
sidebar_label: Aus dem Quellcode bauen
sidebar_position: 1
---

# Aus dem Quellcode bauen

Diese Anleitung führt Sie durch das Bauen der Community-Binärdatei `qorechaind` aus dem öffentlichen Quellcode und erklärt, wofür diese Binärdatei gedacht ist und wofür nicht.

:::caution Ein Build aus dem Quellcode kann dem Mainnet oder Testnet nicht beitreten
Das öffentliche Repository enthält die Modulschnittstellen mit **Stub-Keepern**; die konsenskritischen Keeper-Implementierungen und der Post-Quanten-Signierer befinden sich nicht im öffentlichen Quellbaum. Eine daraus gebaute Binärdatei kann den Konsenszustand der Netzwerke nicht reproduzieren und kann die hybride Post-Quanten-Signatur nicht erzeugen, die jede Transaktion auf dem Cosmos-Pfad erfordert. Seit v3.2.3 **verweigert sie zudem den Start** auf `qorechain-vladi` oder `qorechain-diana` (sie erkennt diese anhand von Chain-ID und Genesis-Zeit; ein lokales Devnet, das eine öffentliche Chain-ID mit eigener Genesis wiederverwendet, ist davon nicht betroffen). `qorechaind start --community-unenforced-pqc` hebt die Verweigerung für Experimente auf; der Knoten prüft dann keine Post-Quanten-Signaturen und kann ohne Warnung vom Netzwerk abweichen, verwenden Sie ihn daher niemals für einen Knoten, auf den Sie sich verlassen. Um einen Knoten oder Validator im Mainnet oder Testnet zu betreiben, installieren Sie die **Release-Binärdatei**, die im Live-Manifest genannt wird (`https://download.qore.host/mainnet/latest.json` oder `.../testnet/latest.json`); siehe [Einen Knoten betreiben](/developer-guide/running-a-node) und [Einen Validator betreiben](/developer-guide/running-a-validator).
:::

## Voraussetzungen

| Abhängigkeit       | Mindestversion            | Hinweise                                          |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Für alle Builds erforderlich                      |
| **CGO**            | Aktiviert (`CGO_ENABLED=1`) | Für PQC- und SVM-FFI-Bridges erforderlich        |
| **Make**           | 3.81+                     | Build-Automatisierung                             |
| **Git**            | 2.x                       | Quellcode-Checkout                                |

Überprüfen Sie Ihre Umgebung:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Jeder Aufruf von `go build`, `go test` und `go run` **muss** `CGO_ENABLED=1` gesetzt haben. Der Knoten bindet native Bibliotheken (die QoreChain Native-Laufzeit und im Release-Build die PQC- und SVM-Bibliotheken) über cgo ein.
:::

## Native Bibliotheken

### libqorepqc und libqoresvm

Die Post-Quantum-Bibliothek (`libqorepqc`) und die SVM-Bibliothek (`libqoresvm`) werden aus Rust-Quellen gebaut, die **nicht Teil des öffentlichen Repositorys** sind (es gibt kein Verzeichnis `rust/` in `qorechain-core`). Der Community-Build benötigt sie nicht. Die Release-Archive der Netzwerke enthalten die kompilierten Bibliotheken (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) in einem Verzeichnis `lib/` neben `qorechaind`; legen Sie sie in `lib/{os}_{arch}/` ab oder verweisen Sie den Loader wie unten gezeigt darauf.

### Den Bibliothekspfad festlegen

Wenn Sie die Release-Binärdatei verwenden, müssen deren gemeinsam genutzte Bibliotheken zur Laufzeit auffindbar sein. Legen Sie die passende Umgebungsvariable für Ihre Plattform fest:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Tipp: Fügen Sie den Export zu Ihrem Shell-Profil (`~/.bashrc`, `~/.zshrc`) hinzu, damit er über Sitzungen hinweg bestehen bleibt.
:::

## Open-Core-Architektur

QoreChain folgt einem **Open-Core**-Modell:

* **Community-Build** — Enthält die vollständigen Modulschnittstellen, CLI-Befehle, Protobuf-Definitionen und Nachrichtentypen für jedes QoreChain-Modul (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm usw.). Keeper für proprietäre Module verwenden **Stub-Implementierungen**, die sichere Standardwerte oder No-op-Antworten zurückgeben. Dies ermöglicht es Drittanbieter-Tools, Wallets und Indexern, mit allen QoreChain-APIs zu integrieren, ohne proprietären Code zu benötigen.
* **Vollständiger Build** — Enthält die vollständigen Keeper-Implementierungen (die echte konsenskritische Modullogik und den Post-Quanten-Signierer). Er wird als die Release-Binärdateien verteilt, die unter [download.qore.host](https://download.qore.host) veröffentlicht werden; er wird nicht aus dem öffentlichen Quellbaum gebaut.

Beide Builds erzeugen denselben Binärnamen `qorechaind` und stellen identische CLI-Befehle bereit. Der Unterschied liegt im Laufzeitverhalten der Keeper-Logik hinter diesen Schnittstellen.

## Community-Build

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Dies kompiliert alle öffentlichen Modulschnittstellen mit Stub-Keepern für proprietäre Funktionen. Die resultierende Binärdatei ist gedacht für:

* Lokale Entwicklung und Tests (zum Beispiel ein Einzelknoten-Devnet)
* Das Abfragen eines Netzwerks (`query ...`-Befehle funktionieren gegen jeden Knoten)
* Den Aufbau von Drittanbieter-Integrationen und -Tools auf den Modulschnittstellen

Sie ist kein Weg, dem Mainnet oder Testnet als Validator beizutreten oder dort Transaktionen auszuführen: Sie hat keinen Post-Quanten-Signierer (`tx pqc gen-key` und `tx pqc cosign` geben einen Fehler zurück), und ihre Stub-Keeper reproduzieren die Konsensregeln der Netzwerke nicht.

## Vollständiger Build (Release-Binärdatei)

Die vollständigen Keeper-Implementierungen und der Signierer hinter `tx pqc gen-key` und `tx pqc cosign` befinden sich nicht im öffentlichen Quellbaum und können daher nicht daraus gebaut werden. Die unter [download.qore.host](https://download.qore.host) veröffentlichten Binärdateien sind der vollständige Build; verwenden Sie diese für Mainnet und Testnet.

## Tests ausführen

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Das Flag `-count=1` deaktiviert das Test-Caching und sorgt jedes Mal für einen sauberen Durchlauf. Einzelne Paket-Tests können wie folgt ausgeführt werden:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Tests, die die nativen Bibliotheken oder die proprietären Keeper ausführen, werden nur in den vollständigen Build kompiliert und sind nicht Teil der öffentlichen Suite.

## Build-Verifizierung

Überprüfen Sie nach einem erfolgreichen Build die Binärdatei:

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

Der Befehl `init` sollte ohne Fehler eine Genesis-Datei und eine Knotenkonfiguration in `~/.qorechaind/` erstellen. Das obige Beispiel initialisiert gegen das **`qorechain-diana`**-Testnet — für das Mainnet ersetzen Sie `--chain-id qorechain-vladi`, das Live-Netzwerk (Knoten-Release **v3.2.3**).

## Docker-Build

Im Repository-Root wird ein Dockerfile bereitgestellt:

```bash
docker build -t qorechaind:community .
```

Es baut die **Community**-Binärdatei (der eigene Kommentar lautet „Public build — no PQC library“), das Image dient also der lokalen Entwicklung und dem Tooling, nicht dem Mitlaufen im Mainnet oder Testnet. Um einen Netzwerkknoten in Docker zu betreiben, kapseln Sie stattdessen die Release-Binärdatei; siehe [Einen Knoten betreiben](/developer-guide/running-a-node#docker-compose).

## Fehlerbehebung

<details>

<summary>cgo: C compiler not found</summary>

Installieren Sie die Xcode-CLI-Tools (macOS) oder `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Sie linken einen Build, der die nativen Bibliotheken erwartet. Verwenden Sie den Community-Build (er benötigt sie nicht) oder das Release-Archiv, das sie enthält, und setzen Sie `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` auf dessen Verzeichnis `lib/`

</details>

<details>

<summary>undefined: sonic.*</summary>

Stellen Sie sicher, dass `go.sum` aktuell ist: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Erhöhen Sie den verfügbaren Arbeitsspeicher (häufig bei Docker mit niedrigen Limits)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

Die Größen von ML-DSA-87 betragen: öffentlicher Schlüssel 2.592 Bytes, geheimer Schlüssel 4.896 Bytes und Signatur 4.627 Bytes. Jede andere Größe bedeutet einen anderen Algorithmus oder einen abgeschnittenen Wert.

</details>
