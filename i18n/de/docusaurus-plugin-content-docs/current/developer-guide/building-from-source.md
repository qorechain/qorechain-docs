---
slug: /developer-guide/building-from-source
title: Building from Source
sidebar_label: Building from Source
sidebar_position: 1
---

# Aus dem Quellcode bauen

Diese Anleitung führt Sie durch das Bauen der `qorechaind`-Binärdatei aus dem Quellcode und behandelt sowohl den Community-Build (Open-Core) als auch den vollständigen proprietären Build.

## Voraussetzungen

| Abhängigkeit       | Mindestversion            | Hinweise                                          |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Für alle Builds erforderlich                      |
| **CGO**            | Aktiviert (`CGO_ENABLED=1`) | Für PQC- und SVM-FFI-Bridges erforderlich        |
| **Rust-Toolchain** | Neueste stabile Version   | Erforderlich, um `libqorepqc` und `libqoresvm` zu kompilieren |
| **Make**           | 3.81+                     | Build-Automatisierung                             |
| **Git**            | 2.x                       | Quellcode-Checkout                                |

Überprüfen Sie Ihre Umgebung:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
Jeder Aufruf von `go build`, `go test` und `go run` **muss** `CGO_ENABLED=1` gesetzt haben. Die PQC- und SVM-Module verwenden FFI-Bridges, die cgo erfordern.
:::

## Native Bibliotheken

QoreChain hängt von zwei in Rust gebauten nativen Bibliotheken ab, die zur Laufzeit geladen werden.

### libqorepqc (Post-Quantum-Kryptografie)

Die PQC-Bibliothek bietet die Generierung, Signierung und Verifizierung von ML-DSA-87-Schlüsseln (Dilithium-5) über eine C-kompatible FFI-Schnittstelle.

```bash
cd rust/qorepqc
cargo build --release
```

Die kompilierte Bibliothek wird in `lib/{os}_{arch}/` abgelegt:

| Plattform   | Bibliotheksdatei  | Verzeichnis         |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (SVM-Laufzeitumgebung)

Die SVM-Bibliothek stellt die BPF-Programmausführungsumgebung für das x/svm-Modul bereit.

```bash
cd rust/qoresvm
cargo build --release
```

Die Ausgabe folgt derselben `lib/{os}_{arch}/`-Konvention wie oben (`libqoresvm.dylib` unter macOS, `libqoresvm.so` unter Linux).

### Den Bibliothekspfad festlegen

Die nativen Bibliotheken müssen zur Laufzeit auffindbar sein. Legen Sie die passende Umgebungsvariable für Ihre Plattform fest:

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
* **Vollständiger (proprietärer) Build** — Aktiviert die vollständigen Keeper-Implementierungen hinter dem Build-Tag `proprietary`. Dies umfasst die echte KI-Anomalieerkennungslogik, die PRISM-Konsensparameter-Abstimmung, die fortgeschrittene Reputationsbewertung und alle produktionsreifen Funktionen.

Beide Builds erzeugen denselben Binärnamen `qorechaind` und stellen identische CLI-Befehle sowie gRPC/REST-Endpunkte bereit. Der Unterschied liegt im Laufzeitverhalten der Keeper-Logik hinter diesen Schnittstellen.

## Community-Build

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Dies kompiliert alle öffentlichen Modulschnittstellen mit Stub-Keepern für proprietäre Funktionen. Die resultierende Binärdatei ist voll funktionsfähig für:

* Den Betrieb eines Validator-Knotens
* Das Übermitteln und Abfragen von Transaktionen
* Die Interaktion mit den VMs EVM, CosmWasm und SVM
* Den Aufbau von Drittanbieter-Integrationen und -Tools
* Lokale Entwicklung und Tests

## Vollständiger Build (proprietär)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

Das Flag `-tags proprietary` aktiviert die vollständigen Keeper-Implementierungen, die nicht Teil des öffentlichen Quellbaums sind.

## Tests ausführen

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Das Flag `-count=1` deaktiviert das Test-Caching und sorgt jedes Mal für einen sauberen Durchlauf. Einzelne Paket-Tests können wie folgt ausgeführt werden:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Führen Sie die Rust-Bibliothekstests separat aus:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Build-Verifizierung

Überprüfen Sie nach einem erfolgreichen Build die Binärdatei:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

Der Befehl `init` sollte ohne Fehler eine Genesis-Datei und eine Knotenkonfiguration in `~/.qorechaind/` erstellen. Das obige Beispiel initialisiert gegen das **`qorechain-diana`**-Testnet — für das Mainnet ersetzen Sie `--chain-id qorechain-vladi`, das Live-Netzwerk, das mit der Chain-Version **v3.1.82** läuft.

## Docker-Build

Für containerisierte Builds wird im Repository-Root ein Dockerfile bereitgestellt:

```bash
docker build -t qorechaind:latest .
```

Das Docker-Image übernimmt die gesamte Kompilierung der nativen Bibliotheken und die Pfadkonfiguration automatisch. Siehe die Anleitung [Quickstart](/getting-started/quickstart) zum Betrieb eines Knotens mit Docker Compose.

## Fehlerbehebung

<details>

<summary>cgo: C compiler not found</summary>

Installieren Sie die Xcode-CLI-Tools (macOS) oder `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Bauen Sie zuerst die Rust-Bibliotheken und setzen Sie `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

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

Überprüfen Sie, ob Sie `pqcrypto v0.5.0+` verwenden (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
