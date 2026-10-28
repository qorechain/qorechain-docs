---
slug: /developer-tools/overview
title: Entwickler-Pakete
sidebar_label: Überblick
sidebar_position: 1
---

# Entwickler-Pakete

QoreChain veröffentlicht sein Entwickler-Tooling als kleine Pakete in den öffentlichen Registries (npm, PyPI, crates.io, Go-Modul-Proxy, Maven Central und Swift Package Manager). Diese Seite ist der Index: wofür jedes Paket gedacht ist, sein exakter Registry-Name, die Sprache, die aktuelle Version, der Installationsbefehl und der Status sowie wo Sie nachlesen, wie man es verwendet. Sie richtet sich an Entwickler, die dApps, Wallets, Backends und Rollups auf QoreChain bauen und vor dem Lesen einer Anleitung das passende Paket auswählen möchten.

Die Versionen in den Tabellen wurden am 27. Oktober 2026 aus den Registries gelesen. Das Mainnet `qorechain-vladi` läuft auf v3.2.4 und das Testnet `qorechain-diana` auf v3.2.6. Jedes als veröffentlicht aufgeführte Paket steht unter der Apache-2.0-Lizenz.

## Innovationen {#innovations}

- **Ein hybrides Signaturformat in jeder Sprache.** Die Chain verlangt bei Transaktionen auf dem Native-Lane eine secp256k1-Signatur plus eine ML-DSA-87-Signatur (FIPS 204). QoreSign reproduziert seine veröffentlichten Testvektoren Byte für Byte in TypeScript, Rust, Go, Swift, Kotlin und Python, und `qorechain-pqc` führt einen gemeinsamen Satz von Vektoren in seinen sechs Bindings aus, sodass ein in einer Sprache erzeugter Schlüssel oder eine dort erzeugte Signatur in den anderen verifiziert.
- **Die Form der Sign-Bytes wird aus dem Chain-Zustand gewählt, nicht geraten.** Das SDK, der Wallet-Adapter, `chain-bridge` und die Netzwerk-Helfer von QoreSign fragen den Node per `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` nach beiden Upgrade-Namen (`v3.2.0` und `v3.1.98`) und signieren die v2-Form, wenn eine der beiden Höhen größer als null ist. Ohne REST-Endpunkt melden sie auf diesen beiden Chains einen Fehler, statt zu raten. Beide Netzwerke verifizieren heute v2 (geprüft am 27. Oktober 2026: `v3.2.0` im Mainnet bei Höhe 2.981.742 angewendet und `v3.1.98` im Testnet bei Höhe 5.746.000).
- **Quickstarts, die ausgeführt wurden, nicht nur geschrieben.** Bei den Paketen, die einen haben, wurde das Beispiel am 27. Oktober 2026 nach der Installation aus der öffentlichen Registry ausgeführt. 31 von 34 Quickstart-Einträgen liefen und bestanden; das Manifest hält fest, welche drei nicht (siehe [Grenzen](#limits)).
- **Ein Manifest hinter den Tabellen.** Die Paketnamen, Versionen und Installationsbefehle auf dieser Seite stammen aus einem einzigen maschinenlesbaren Manifest mit einem Live-Versions-Endpunkt pro Paket, denselben Daten, aus denen der SDK-Hub auf der [Entwicklerseite des Dashboards](/dashboard/developers#sdks) aufgebaut ist.

## So verwenden Sie sie {#how-to-use}

Wählen Sie danach, was Sie bauen.

| Sie möchten | Verwenden | Lesen |
|---|---|---|
| Chain-Zustand lesen, Konten ableiten, hybrid signierte Transaktionen aus einem Skript oder einer dApp senden | QoreChain SDK | [SDK-Überblick](/sdk/overview), [Installation](/sdk/install), [Quickstart](/sdk/quickstart) |
| In Ihrer eigenen Wallet oder Ihrem Backend signieren, Signaturen verifizieren, Sign In With QoreChain | QoreSign | [QoreSign-Überblick](/qoresign/overview), [Quickstart](/qoresign/quickstart) |
| QoreChain zu Keplr, Leap oder Cosmostation hinzufügen, einheitliche Wallets erzeugen, EVM-Fenster- und Linked-Key-Nachrichten bauen | Wallet-Adapter | [Wallet-Adapter](/developer-tools/wallet-adapter) |
| Einen Server-Job ausführen, der QOR sendet, Schlüssel registriert oder Contracts deployt | Chain-Bridge (oder das SDK) | [Chain-Bridge und Handles](/developer-tools/chain-bridge) |
| Ein `@handle` in eine verifizierte Adresse auflösen | Handles | [Chain-Bridge und Handles](/developer-tools/chain-bridge#handles) |
| Ihre dApp die QoreX-Wallet nutzen lassen oder sie ohne Erweiterung testen | QoreX-Integrationen | [QoreX-Integrationen](/developer-tools/qorex-integrations), [QoreX, für Entwickler](/qorex/overview#developers) |
| Ein Anwendungs-Rollup erstellen und betreiben | RDK | [Rollups-Überblick](/rollups/overview), [Ein Rollup deployen](/rollups/deploying-a-rollup) |
| Die Post-Quantum-Primitive allein verwenden (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Post-Quantum-Signierung](/developer-guide/post-quantum-signing) |
| Einen KI-Agenten oder ein Entwicklerwerkzeug die Chain lesen lassen (Blöcke, Transaktionen, Konten, Status hybrider Signaturen, Simulation, unsignierte Transfers) | QoreChain-MCP-Server | [QoreChain-MCP-Server](/developer-tools/mcp) |
| Die Chain aus einem Terminal oder einem Shell-Skript lesen, mit JSON-Ausgabe | `qore`-CLI | [QoreChain-CLI](/developer-tools/qore-cli) |
| Nachlesen, wie eine bestätigte Transaktion geschützt wurde (Nachrichten, Signierer, Gebühr, ML-DSA-87-Schicht, Stufe) | QoreSign-Transaktions-Inspektor (`inspectTransaction`) | [QoreSign-Überblick](/qoresign/overview#inspector) |
| Daten mit ML-KEM-1024 an QoreChain-Konten, private Gruppen oder Sidechains verschlüsseln | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| Ein Design eines Post-Quantum-Light-Clients prüfen oder testen (Checkpoint-Verifikation) | PQ-Light-Client | [PQ-Light-Client](/developer-tools/pq-light-client) |
| QoreChain als Verwahrer oder Börse integrieren (Adressprüfungen, Verifikation von Auszahlungen, Gutschrift von Einzahlungen) | Custody Kit | [Custody Kit](/developer-tools/custody-kit) |
| Die Kryptografie eines Nodes, eines Netzwerks oder von Solidity-Quellen als CycloneDX-CBOM inventarisieren | QoreScan | [QoreScan](/developer-tools/qorescan) |
| Einen zugangsbeschränkten Token für reale Vermögenswerte im Testnet prototypisch bauen (ERC-3643, CMTAT, Vaults mit beschränkten Anteilen, Post-Quantum-Halterprüfung) | Asset Kit | [Asset Kit](/developer-tools/asset-kit) |
| Solidity- oder CosmWasm-Projekte auf QoreChain mit Foundry, Hardhat oder viem bauen und testen | Chain Developer Kit (SDK 0.11.0, kommt) | [Chain Developer Kit](/developer-tools/chain-dev-sdk) |

Installieren Sie ein Paket und führen Sie seinen Quickstart zuerst gegen das öffentliche Testnet aus. Lesezugriffe brauchen kein Konto, keinen Schlüssel und keine Gebühr.

## So greifen Sie darauf zu {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Chain-ID | `qorechain-diana` | `qorechain-vladi` |
| EVM-Chain-ID | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Konsens-RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Konto und Schlüssel:** Für Lesezugriffe keine. Zum Senden benötigen Sie ein Konto mit QOR (Test-QOR gibt es im [Faucet](/dashboard/faucet)) und, auf dem Native-Lane, einen dafür registrierten ML-DSA-87-Schlüssel.
- **Kosten:** Die Pakete sind kostenlos. Transaktionen zahlen die Netzwerkgebühr; die Gebühren-Untergrenze beträgt 0,1 uqor pro Gas.
- **Signaturregeln:** Eine Transaktion auf dem Native-Lane muss eine hybride Signatur (secp256k1 plus ML-DSA-87) tragen. Eine EVM-Transaktion wird nur von einem Konto mit registriertem ML-DSA-87-Schlüssel und einem offenen EVM-Autorisierungsfenster akzeptiert. SVM-Lesezugriffe funktionieren, SVM-Transaktionen sind noch nicht offen. Siehe [Konten und PQC-Signierung](/sdk/concepts/accounts-pqc).
- **Quickstart-Konventionen:** Die Beispiele lesen das öffentliche Testnet-Faucet-Konto und signieren mit der öffentlichen Testphrase (`abandon` elfmal, dann `about`). Finanzieren Sie niemals ein aus dieser Phrase abgeleitetes Konto. Kein Quickstart sendet eine Transaktion.

### Die Entwicklerseite des Dashboards {#dashboard-developers}

Das Dashboard hat eine öffentliche Seite unter [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Geprüft am 27. Oktober 2026 hat sie sieben Tabs (vollständige Anleitung: [Entwickler](/dashboard/developers)):

- **SDKs:** der SDK-Hub. Jedes Paket aus dem Manifest, nach Produkt gruppiert, mit einer Sprachauswahl, der aktuellsten Version, live aus jeder Registry gelesen, Installations- und Importzeilen mit Kopieren-Schaltflächen, dem Quickstart mit der Ausgabe, die das SDK-Team beobachtet hat, bekannten Problemen sowie den Chain-IDs und öffentlichen Endpunkten. Nicht veröffentlichte Pakete zeigen keinen Installationsbefehl.
- **Transaction inspector:** einen 64-stelligen Hex-Transaktions-Hash im Testnet oder Mainnet einfügen und Status, Signierer, Gebühr, die Information, ob die Post-Quanten-Schicht verifiziert, und die Sicherheitsstufe (PQC, Enrollment, SHAKE oder Classical) sehen. Er nutzt die Funktion `inspectTransaction` aus QoreSign 0.1.1: siehe [Transaktions-Inspektor](/qoresign/overview#inspector).
- **PQ-Schlüsselstatus:** liest den ML-DSA-87-Schlüssel, den eine Adresse on-chain registriert hat, und ihr EVM-Autorisierungsfenster, im Testnet oder Mainnet.
- **Simulator:** simuliert eine signierte Transaktion (base64 oder hex `TxRaw`) im Trockenlauf und zeigt Gasverbrauch und Kontostandsänderungen. Es wird nichts übertragen.
- **Signing-Playground:** nur Testnet. Erzeugt im Browser einen Wegwerf-Hybridschlüssel, im Speicher gehalten, um Nachrichten und Sign-In-With-QoreChain-Anfragen zu signieren und zu verifizieren.
- **QoreX-Test-Wallet:** nur Testnet. Fügt eine Test-Wallet (`window.qorex`, über EIP-6963 als „QoreX (mock)“ angekündigt) in den Tab ein, damit Sie dApp-Abläufe ausprobieren können.
- **KI-Agenten (MCP):** der Status des QoreChain-MCP-Servers (veröffentlicht) und die Einrichtung für einen MCP-Client: zuerst lokal mit `npx`, dazu ein gehosteter Testnet-Endpunkt, der einen API-Schlüssel braucht. Siehe [QoreChain-MCP-Server](/developer-tools/mcp).

Dieselbe Prüfung des Inspectors ist im Code als Bibliotheksfunktion `inspectTransaction` in QoreSign 0.1.1 (TypeScript) verfügbar. Die Tabellen unten und der SDK-Hub zeigen dieselben Paketdaten; die Tabellen wurden am 27. Oktober 2026 gegen die Registries geprüft.

## Wo sie veröffentlicht sind {#where-published}

Jeder Name ist der exakte Registry-Name. Der Link am Paket öffnet seine Registry-Seite. „Veröffentlicht“ bedeutet, dass die angezeigte Version heute installierbar ist.

### QoreChain SDK {#group-sdk}

Anleitungen: [SDK-Überblick](/sdk/overview), [Installation](/sdk/install), [React-Anleitung](/sdk/guides/react), [CLI-Referenz](/sdk/reference/cli). Quellcode: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Veröffentlicht |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Veröffentlicht. Provider, Hooks, `ConnectButton` und das PQC-Statusabzeichen (in 0.10.0 als `QuantumSafeBadge` exportiert) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Veröffentlicht |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Veröffentlicht. Auf den Live-Netzwerken nur Lesezugriffe |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Veröffentlicht |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Veröffentlicht |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Veröffentlicht |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Veröffentlicht |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Veröffentlicht |

### QoreSign {#group-qoresign}

Anleitungen: [QoreSign-Überblick](/qoresign/overview), [Quickstart](/qoresign/quickstart), [Testvektoren](/qoresign/vectors). Quellcode: [qorechain/qoresign](https://github.com/qorechain/qoresign). Version 0.1.1 wurde am 27. Oktober 2026 veröffentlicht. QoreSign signiert lokal; es hält keine Schlüssel für Sie und führt kein Threshold-, MPC- oder Hardware-Wallet-Signieren durch.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | Veröffentlicht. Enthält `inspectTransaction` und `fetchEvmWindow` (neu in 0.1.1) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (Import als `qoresign`) | 0.1.1 | `cargo add qorechain-qoresign` | Veröffentlicht |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | Veröffentlicht |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (Import als `qoresign`) | 0.1.1 | `pip install qorechain-qoresign` | Veröffentlicht, neu in 0.1.1. Wheels für macOS (arm64, x86_64) und Linux (x86_64, aarch64); noch kein Windows-Wheel. Nur Offline-Funktionen |
| `QoreSign` (Swift-Paket) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, Produkt `QoreSign` | Als GitHub-Release veröffentlicht; das Binär-Framework wird daraus heruntergeladen |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | Veröffentlicht |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | Veröffentlicht. Dieselbe API wie das JVM-Artefakt; sein Beispiel wurde nur mit dem JVM-Artefakt ausgeführt, nicht auf einem Android-Gerät |

Die Kotlin- und Android-Artefakte benötigen in Ihrem Projekt den Kotlin-Compiler 2.3 oder neuer; ein Projekt mit Kotlin 2.1 lässt sich dagegen nicht kompilieren.

Das TypeScript-Paket hat einen Unterpfad `@qorechain/qoresign/network`, und das Go-Modul hat dieselben Helfer außer `inspectTransaction` und `fetchEvmWindow`: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (mit Kontostandsänderungen), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (ein Fallback, dann hört es auf), `verifySiwqWithChain` und `verifyMessageWithChain`. Die Rust-, Swift-, Kotlin- und Python-Pakete haben keinen Netzwerkcode.

### QoreSeal {#group-qoreseal}

Seite: [QoreSeal](/developer-tools/qoreseal). Quellcode: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0 verschlüsselt Daten mit ML-KEM-1024 (FIPS 203) an QoreChain-Konten, private Gruppen und Sidechains. Die Verschlüsselung funktioniert offline; das Lesen des Schlüssels eines Empfängers von der Chain braucht das KEM-Schlüsselregister, das im Testnet live ist und nach dem Upgrade auf v3.2.5 ins Mainnet kommt. Die Konstruktion wartet vor 1.0 auf eine externe Prüfung.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (Import als `qoreseal`) | 0.1.0 | `cargo add qorechain-qoreseal` | Veröffentlicht |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Veröffentlicht |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (Import als `qoreseal`) | 0.1.0 | `pip install qorechain-qoreseal` | Veröffentlicht. Wheels für macOS (arm64, x86_64) und Linux (x86_64, aarch64); noch kein Windows-Wheel |
| `QoreSeal` (Swift-Paket) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, Produkt `QoreSeal` | Als GitHub-Release veröffentlicht; das Binär-Framework wird daraus heruntergeladen |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Auf Maven Central veröffentlicht |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Auf Maven Central veröffentlicht |
| `@qorechain/qoreseal` | TypeScript | noch keine | keine | **Nicht auf npm veröffentlicht** (404 am 27. Oktober 2026). Der Quellcode liegt im Repository |

### PQ-Light-Client {#group-pq-light-client}

Seite: [PQ-Light-Client](/developer-tools/pq-light-client). Quellcode: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). Ein Spezifikationsentwurf und Referenz-Verifizierer für mit ML-DSA-87 signierte Checkpoints. Er verbindet sich weder mit dem Mainnet noch mit dem Testnet: QoreChain erzeugt die Checkpoints, die er verifiziert, nicht, und es ist keine Chain-Unterstützung geplant. Er läuft gegen simulierte Validatorsätze und gemeinsame Testvektoren.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Veröffentlicht. Hängt von `@qorechain/pqc` 0.2.3 ab |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (Bibliothek `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Veröffentlicht |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (Paket `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Veröffentlicht |

### Custody Kit {#group-custody-kit}

Seite: [Custody Kit](/developer-tools/custody-kit). Quellcode: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). Ein Integrationsleitfaden, Referenzcode und Testvektoren für Verwahrer und Börsen, in TypeScript, Python, Go, Rust und Java. Es ist Referenzcode zum Lesen, Kopieren oder Vendoring, kein Paketsatz: Der einzige Registry-Eintrag ist das Go-Modul.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| GitHub-Release `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`, dann den Ordner für Ihre Sprache bauen | Veröffentlicht, 27. Oktober 2026. Bewusst kein npm-, PyPI-, crates.io- oder Maven-Paket |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (Paket `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Veröffentlicht |

### QoreScan {#group-qorescan}

Seite: [QoreScan](/developer-tools/qorescan). Quellcode: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0 inventarisiert die Kryptografie eines QoreChain-Deployments (ein Node-Home-Verzeichnis, den Live-Netzwerkzustand, TLS-Endpunkte und Solidity-Quellen) und schreibt ein CycloneDX-1.6-CBOM sowie Markdown-Berichte. Es ist ein Inventarisierungshilfsmittel, keine Zertifizierung und kein Audit.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [GitHub-Release `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | Binärdateien für macOS, Linux und Windows (amd64, arm64) | 0.1.0 | herunterladen und gegen `qorescan_0.1.0_checksums.txt` prüfen | Veröffentlicht, 27. Oktober 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | npm-Wrapper (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Veröffentlicht. Lädt beim ersten Start die Release-Binärdatei herunter und prüft sie |
| [`qorescan`](https://pypi.org/project/qorescan/) | PyPI-Wrapper (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` oder `pip install qorescan` | Veröffentlicht. Dasselbe Verhalten wie der npm-Wrapper |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Veröffentlicht. Go 1.26 |

### Asset Kit {#group-asset-kit}

Seite: [Asset Kit](/developer-tools/asset-kit). Quellcode: [qorechain/qorechain-asset-kit](https://github.com/qorechain/qorechain-asset-kit). QoreChain Asset Kit 0.1.0 ist quelloffenes Tooling für zugangsbeschränkte Token auf Basis realer Vermögenswerte: EVM-Contracts (ein ERC-3643-Modul, eine CMTAT-Regel und Vaults mit beschränkten Anteilen über einem Guard, der einen registrierten ML-DSA-87-Schlüssel verlangt), Foundry-Deployment-Skripte und eine Emittenten-Konsole, dazu Clients für einen **Vorschlag** nativer Module (`x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`), der nicht eingeplant ist und in keinem Netzwerk existiert. Die Contracts funktionieren nur im Testnet: Die Precompile `0x0A02` ist im Mainnet nicht aktiv, wo der Guard geschlossen fehlschlägt (fail closed). Vor 1.0, nicht auditiert; die Rechtsvorlagen im Repository sind ungeprüfte Entwürfe, keine Rechtsberatung.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [GitHub-Release `v0.1.0`](https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0) | Solidity-Contracts, Emittenten-Konsole, Protos, Dokumentation | 0.1.0 | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` oder `forge install qorechain/qorechain-asset-kit@v0.1.0` | Veröffentlicht. Die Contracts und die Konsole werden aus dem Repository verwendet |
| [`io.github.qorechain:asset-kit`](https://central.sonatype.com/artifact/io.github.qorechain/asset-kit) | Java 17 (Client für den Vorschlag) | 0.1.0 | `implementation("io.github.qorechain:asset-kit:0.1.0")` | Veröffentlicht |
| [`github.com/qorechain/qorechain-asset-kit/clients/go`](https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go) | Go (Paket `assetkit`, Client für den Vorschlag) | v0.1.0 | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` | Veröffentlicht |
| `qorechain-asset-kit` auf PyPI | Python | noch keine | keine | Kommt. Nicht auf PyPI (404 am 28. Oktober 2026) |
| `@qorechain/asset-kit` auf npm | TypeScript | noch keine | keine | Kommt. Nicht veröffentlicht (404 am 28. Oktober 2026) |

### Chain Developer Kit (SDK 0.11.0) {#group-chain-dev-sdk}

Seite: [Chain Developer Kit](/developer-tools/chain-dev-sdk). Quellcode: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). Der Teil von QoreChain SDK 0.11.0 für Solidity- und Smart-Contract-Teams: viem-Chain-Definitionen und Helfer für EVM-Autorisierungsfenster in `@qorechain/evm`, vier neue `create-qorechain-dapp`-Templates (Foundry, Hardhat 3, viem mit wagmi und ein QoreChain-Native-Token), EVM-Quickstarts und eine Seite dazu, wie sich die QoreChain-EVM von Ethereum unterscheidet.

**Kommt.** SDK 0.11.0 ist auf GitHub getaggt (`v0.11.0`), sein npm-Release steht noch aus: Am 27. Oktober 2026 lieferte npm `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0 und `create-qorechain-dapp` 0.10.0, und `@qorechain/sdk@0.11.0` lieferte 404. Solange npm 0.11.0 nicht zeigt, lassen sich die neuen Chain-Definitionen, Fenster-Helfer und Templates nicht installieren; was Sie heute bekommen, sind die 0.10.0-Pakete aus der [SDK-Tabelle](#group-sdk). 0.11.0 ändert nur die npm-Pakete: Die SDKs für Python, Rust, Go und Java bleiben bei 0.10.0.

### Rollup Development Kit (RDK) {#group-rdk}

Anleitungen: [Rollups-Überblick](/rollups/overview), [Ein Rollup deployen](/rollups/deploying-a-rollup), [Architektur des Rollup Development Kit](/architecture/rollup-development-kit). Quellcode: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Veröffentlicht. Der einzige RDK-Client, der hybrid signiert, und nur, wenn Sie ein `pqcKeypair` übergeben |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Veröffentlicht. Seit 0.6.2 startet sie über den npm-Bin-Link (0.6.1 und früher gaben nichts aus). Ihre Transaktionsbefehle signieren nur klassisch, was die Netzwerke ablehnen |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Veröffentlicht |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, Import als `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | Veröffentlicht. Lesezugriffe funktionieren; Transaktionen signieren nur klassisch |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Veröffentlicht. Lesezugriffe funktionieren; Transaktionen signieren nur klassisch |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Veröffentlicht. Lesezugriffe funktionieren; Transaktionen signieren nur klassisch |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Veröffentlicht. Lesezugriffe funktionieren; Transaktionen signieren nur klassisch |

### Post-Quantum-Primitive (`qorechain-pqc`) {#group-pqc}

Anleitung: [Post-Quantum-Signierung](/developer-guide/post-quantum-signing). Quellcode: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). Die ML-DSA-Signierung ist in allen Bindings standardmäßig deterministisch; hedged Signieren ist ein ausdrückliches Opt-in.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Veröffentlicht |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Veröffentlicht. Benötigt liboqs; der erste Import baut sie, falls sie fehlt (git, CMake und ein C-Compiler) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Veröffentlicht |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Veröffentlicht |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Veröffentlicht |
| C-Bibliothek | C | 0.2.3 | `c/` aus dem Repository bauen (benötigt liboqs und OpenSSL) | Nur Quellcode, keine Paket-Registry |

### Wallet-Adapter {#group-wallet-adapter}

Seite: [Wallet-Adapter](/developer-tools/wallet-adapter). Quellcode: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (ES-Modul, reines JavaScript mit Typings) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Veröffentlicht. Kein getesteter Quickstart |

### Chain-Bridge {#group-chain-bridge}

Seite: [Chain-Bridge und Handles](/developer-tools/chain-bridge).

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (Node.js-Server) | 0.2.3 | `npm install @qorechain/chain-bridge` | Veröffentlicht. Kein getesteter Quickstart. Die Registry listet kein Quell-Repository |

### Handles {#group-handles}

Seite: [Chain-Bridge und Handles](/developer-tools/chain-bridge#handles).

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Veröffentlicht. Verifiziert eine Handle-Auflösung gegen einen fest hinterlegten Registry-Schlüssel. Es pinnt Adressen nicht selbst: Der Aufrufer stellt den Pin-Speicher bereit und entscheidet, wann gepinnt wird. Kein getesteter Quickstart. Die Registry listet kein Quell-Repository |

### QoreX-Integrationen {#group-qorex}

Anleitung: [QoreX, für Entwickler](/qorex/overview#developers). Quellcode: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). Alle sechs wurden am 27. Oktober 2026 veröffentlicht.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Veröffentlicht. Findet QoreX (EIP-6963 und den nativen Provider) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Veröffentlicht |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Veröffentlicht |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Veröffentlicht. Übergeben Sie bei `@cosmos-kit/react` 2.24 `throwErrors={false}`; das README-Snippet lässt es weg |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Veröffentlicht. Eine Test-Wallet, die im Testnet echt signiert |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Veröffentlicht. Playwright-Fixtures; der Erweiterungsmodus wirft heute einen Fehler |

### Connect (veraltet) {#group-connect}

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | keine | **Veraltet und nicht mehr gepflegt.** Verwenden Sie es nicht für neue Arbeit. Ersetzen Sie es wie in der Tabelle unten |

:::caution @qorechain/connect ist veraltet
`@qorechain/connect` ist auf npm als veraltet (deprecated) markiert. Sein Peer-Bereich ist `@qorechain/wallet-adapter` `^0.2.1`, der 0.4.0 nicht einschließt, und es öffnet kein [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window), sodass eine EVM-Sendung darüber abgelehnt wird, bis das Konto einen registrierten Schlüssel und ein offenes Fenster hat. Das in seinen Registry-Metadaten angegebene Repository ist öffentlich nicht erreichbar.
:::

| Bedarf | Stattdessen verwenden |
|---|---|
| QoreX erkennen (EVM, Native, Solana) | `@qorechain/qorex-types` |
| EVM-dApps mit RainbowKit und wagmi | `@qorechain/qorex-rainbowkit` |
| Cosmos-dApps | `@qorechain/qorex-interchain-kit` (oder `@qorechain/qorex-cosmos-kit`) |
| Hybrides Signieren in Ihrer eigenen Wallet oder Ihrem Backend | `@qorechain/qoresign` |

### QORel, der IBC-Relayer {#group-qorel}

| Paket | Wo | Version | Installation | Status |
|---|---|---|---|---|
| QORel (`qorel`) | GitHub-Release `qorel-v0.1.0`, Homebrew, Container `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | Als Vorabversion veröffentlicht. Nur IBC v1; nur Testnet. Siehe [QORel](/qorel/overview) |

### MCP-Server und CLI {#group-mcp}

Seiten: [QoreChain-MCP-Server](/developer-tools/mcp), [QoreChain-CLI](/developer-tools/qore-cli). Quelle: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (öffentlich). Beide lesen die Chain; keiner signiert, hält Schlüssel oder überträgt. Veröffentlicht am 27. Oktober 2026.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (Node.js-Server, Bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Veröffentlicht. stdio und Streamable HTTP. Ein gehosteter Endpunkt, `https://mcp.qorechain.io/mcp`, braucht einen API-Schlüssel, der in Ihrem Dashboard angefordert wird |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (oder `uvx qorechain-mcp`) | Veröffentlicht. Dieselben Tools wie das npm-Paket; nur stdio |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Veröffentlicht. `--json`-Ausgabe identisch mit der Ausgabe der MCP-Tools |

### Geplant (nicht veröffentlicht) {#planned}

Diese sind noch nicht in ihrer Registry, es gibt also nichts zu installieren, und das für sie beschriebene Verhalten kann noch nicht genutzt werden. Jedes lieferte am 27. Oktober 2026 404 (oder war nicht gelistet).

| Paket | Vorgesehener Zweck | Status |
|---|---|---|
| `@qorechain/qoreseal` auf npm | QoreSeal für TypeScript | Nicht veröffentlicht; der Quellcode liegt im Repository |
| `qorechain-asset-kit` auf PyPI, `@qorechain/asset-kit` auf npm | Die Clients des [Asset Kit](/developer-tools/asset-kit) für Python und TypeScript | Nicht veröffentlicht; verwenden Sie einen Klon des Repositorys |
| `@qorechain/sdk`, `@qorechain/evm`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp` 0.11.0 auf npm | Das [Chain Developer Kit](/developer-tools/chain-dev-sdk) | Auf GitHub getaggt, npm-Release steht aus |

## So erhalten Sie Live-Versionen {#live-versions}

Die Tabellen sind eine Momentaufnahme. So lesen Sie die aktuelle Version eines Pakets selbst:

| Registry | Anfrage | Feld |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (senden Sie einen `User-Agent`-Header, sonst wird die Anfrage abgelehnt) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (das führende `v` entfernen) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (das führende `v` entfernen); nicht authentifizierte GitHub-Aufrufe sind auf 60 pro Stunde und Adresse begrenzt |

Behalten Sie bei einem npm-Namen mit Scope das `@`, zum Beispiel `https://registry.npmjs.org/@qorechain/sdk/latest`. Ein 404 bedeutet, dass das Paket nicht veröffentlicht ist. Der Go-Proxy kann `@latest` nach einem Release für kurze Zeit aus einem Cache beantworten, pinnen Sie die Version daher im Befehl, wenn Sie eine bestimmte brauchen (die RDK-Go-Installation oben tut das). Jede Paketseite in ihrer Registry zeigt ebenfalls die Version und den Release-Verlauf.

## Grenzen und bekannte Probleme {#limits}

- **Zwei Live-Netzwerke, unterschiedliche Versionen.** Das Mainnet läuft auf v3.2.4 und das Testnet auf v3.2.6. Eine Funktion, die nur im Testnet existiert, ist auf ihrer eigenen Seite gekennzeichnet. Nehmen Sie im Mainnet kein v3.2.5-Verhalten an.
- **Noch nicht live:** `@qorechain/qoreseal` auf npm, das Asset Kit auf PyPI und npm (und seine nativen Module, ein Vorschlag, der nicht eingeplant ist), SDK 0.11.0 (das Chain Developer Kit) auf npm, SVM-Transaktionen und die EVM-Precompiles im Mainnet (sie sind nur im Testnet aktiv; die Liste nach Lane finden Sie im [SDK-Überblick](/sdk/overview)).
- **QoreSeal-Register und der PQ-Light-Client.** Das Verschlüsseln an eine von der Chain gelesene Adresse braucht das KEM-Schlüsselregister, das im Testnet live ist und nach v3.2.5 ins Mainnet kommt. Der PQ-Light-Client verbindet sich mit keinem der beiden Netzwerke; für seine Checkpoints ist keine Chain-Unterstützung geplant.
- **Kotlin 2.3 oder neuer.** Die Kotlin- und Android-Artefakte von QoreSign und QoreSeal benötigen den Kotlin-Compiler 2.3 oder neuer; mit Kotlin 2.1 lassen sie sich nicht kompilieren.
- **Keine Windows-Wheels.** Die Python-Pakete von QoreSign und QoreSeal haben Wheels nur für macOS und Linux; andere Plattformen bauen aus der Quellcode-Distribution, die Rust benötigt.
- **Nicht ausgeführte Beispiele:** Von den 34 Quickstart-Einträgen liefen 31 am 27. Oktober 2026 und bestanden. Das QoreSign-Python-Beispiel wurde nach der Veröffentlichung des Pakets ausgeführt (macOS arm64 und Linux aarch64), und das QoreSign-Android-Beispiel wurde nicht auf einem Gerät ausgeführt. Wallet-Adapter, Chain-Bridge und Handles haben keinen Quickstart, daher stammen ihre Beispiele in diesem Handbuch aus den Typings und dem Quellcode des Pakets und wurden nicht Ende zu Ende ausgeführt.
- **`@qorechain/rdk-cli` vor 0.6.2** gab beim Start über den npm-Bin-Link nichts aus, und sein `--version` gab 0.4.1 aus. **`@qorechain/rdk` vor 0.7.0** baute Withdrawal-Proofs, die on-chain nie verifiziert wurden. Verwenden Sie 0.7.0.
- **cosmjs-Versionskonflikt.** `@qorechain/wallet-adapter` und `@qorechain/chain-bridge` verwenden cosmjs 0.32; das SDK verwendet cosmjs 0.39. Wer den Adapter neben dem SDK in einem Projekt installiert, lässt npm `ERESOLVE` melden. Halten Sie sie in getrennten Projekten oder übergeben Sie `--legacy-peer-deps`.
- **Verschachtelte SDK-Kopie in älteren RDK-Releases.** `@qorechain/rdk` 0.6.2 und früher hängen von `@qorechain/sdk` `^0.9.0` ab, sodass eine App mit SDK 0.10.0 eine zweite, verschachtelte SDK-0.9.x-Kopie erhielt. Ab 0.7.0 hängt das Kit von `@qorechain/sdk` `^0.10.0` ab und teilt sich eine Kopie.
- **Nur klassische RDK-Clients.** Die RDK-Clients für Python, Rust, Go und Java signieren nur klassisch, was der Native-Lane in beiden Netzwerken ablehnt; verwenden Sie sie für Lesezugriffe, oder nutzen Sie für Transaktionen den TypeScript-Client mit einem `pqcKeypair`.
- **Pakete ohne öffentliches Quell-Repository.** `@qorechain/chain-bridge` und `@qorechain/handles` listen in ihren Registry-Metadaten kein Quell-Repository. Den veröffentlichten Paketinhalt können Sie auf npm lesen.
- **Python-`qorechain-pqc`** hat in 0.2.3 keine Schlüsselerzeugung aus einem Seed und benötigt liboqs.
