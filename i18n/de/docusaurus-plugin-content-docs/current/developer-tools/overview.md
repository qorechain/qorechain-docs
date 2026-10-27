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

- **Ein hybrides Signaturformat in jeder Sprache.** Die Chain verlangt bei Transaktionen auf dem Native-Lane eine secp256k1-Signatur plus eine ML-DSA-87-Signatur (FIPS 204). QoreSign reproduziert seine veröffentlichten Testvektoren Byte für Byte in TypeScript, Rust, Go, Swift und Kotlin, und `qorechain-pqc` führt einen gemeinsamen Satz von Vektoren in seinen sechs Bindings aus, sodass ein in einer Sprache erzeugter Schlüssel oder eine dort erzeugte Signatur in den anderen verifiziert.
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
| Ihre dApp die QoreX-Wallet nutzen lassen | QoreX-Integrationen | [QoreX, für Entwickler](/qorex/overview#developers) |
| Ein Anwendungs-Rollup erstellen und betreiben | RDK | [Rollups-Überblick](/rollups/overview), [Ein Rollup deployen](/rollups/deploying-a-rollup) |
| Die Post-Quantum-Primitive allein verwenden (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Post-Quantum-Signierung](/developer-guide/post-quantum-signing) |

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

Das Dashboard hat eine öffentliche Seite unter [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Geprüft am 27. Oktober 2026 hat sie sechs Tabs (vollständige Anleitung: [Entwickler](/dashboard/developers)):

- **SDKs:** der SDK-Hub. Jedes Paket aus dem Manifest, nach Produkt gruppiert, mit einer Sprachauswahl, der aktuellsten Version, live aus jeder Registry gelesen, Installations- und Importzeilen mit Kopieren-Schaltflächen, dem Quickstart mit der Ausgabe, die das SDK-Team beobachtet hat, bekannten Problemen sowie den Chain-IDs und öffentlichen Endpunkten. Nicht veröffentlichte Pakete zeigen keinen Installationsbefehl.
- **PQ-Schlüsselstatus:** liest den ML-DSA-87-Schlüssel, den eine Adresse on-chain registriert hat, und ihr EVM-Autorisierungsfenster, im Testnet oder Mainnet.
- **Simulator:** simuliert eine signierte Transaktion (base64 oder hex `TxRaw`) im Trockenlauf und zeigt Gasverbrauch und Kontostandsänderungen. Es wird nichts übertragen.
- **Signing-Playground:** nur Testnet. Erzeugt im Browser einen Wegwerf-Hybridschlüssel, im Speicher gehalten, um Nachrichten und Sign-In-With-QoreChain-Anfragen zu signieren und zu verifizieren.
- **QoreX-Test-Wallet:** nur Testnet. Fügt eine Test-Wallet (`window.qorex`, über EIP-6963 als „QoreX (mock)“ angekündigt) in den Tab ein, damit Sie dApp-Abläufe ausprobieren können.
- **KI-Agenten (MCP):** eine Seite für den MCP-Server, der noch nicht veröffentlicht ist (siehe [Geplant](#planned)).

Der **Transaktions-Inspektor** (einen Hash einfügen und jede Nachricht, den Signierer, die Gebühr sowie die Information sehen, ob die Post-Quanten-Signatur verifiziert) ist **noch nicht live**. Die Tabellen unten und der SDK-Hub zeigen dieselben Daten; die Tabellen wurden am 27. Oktober 2026 gegen die Registries geprüft.

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

Anleitungen: [QoreSign-Überblick](/qoresign/overview), [Quickstart](/qoresign/quickstart), [Testvektoren](/qoresign/vectors). Quellcode: [qorechain/qoresign](https://github.com/qorechain/qoresign). QoreSign signiert lokal; es hält keine Schlüssel für Sie und führt kein Threshold-, MPC- oder Hardware-Wallet-Signieren durch.

| Paket | Sprache | Version | Installation | Status |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.0 | `npm install @qorechain/qoresign` | Veröffentlicht |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (Import als `qoresign`) | 0.1.0 | `cargo add qorechain-qoresign` | Veröffentlicht |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.0 | `go get github.com/qorechain/qoresign/go` | Veröffentlicht |
| `QoreSign` (Swift-Paket) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")`, Produkt `QoreSign` | Als GitHub-Release veröffentlicht; das Binär-Framework wird daraus heruntergeladen |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+) | 0.1.0 | `implementation("io.github.qorechain:qoresign:0.1.0")` | Veröffentlicht |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+) | 0.1.0 | `implementation("io.github.qorechain:qoresign-android:0.1.0")` | Veröffentlicht. Dieselbe API wie das JVM-Artefakt; sein Beispiel wurde nur mit dem JVM-Artefakt ausgeführt, nicht auf einem Android-Gerät |
| `qorechain-qoresign` (PyPI) | Python | noch keine | keine | **Nicht veröffentlicht.** Das PyPI-Projekt lieferte am 27. Oktober 2026 404. Geplant für 0.1.1 |

Das TypeScript-Paket hat einen Unterpfad `@qorechain/qoresign/network`, und das Go-Modul hat dieselben Helfer: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (mit Kontostandsänderungen), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (ein Fallback, dann hört es auf), `verifySiwqWithChain` und `verifyMessageWithChain`. Die Rust-Crate hat keinen Netzwerkcode.

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

### Geplant (nicht veröffentlicht) {#planned}

Diese Namen sind für Tools reserviert, die noch nicht in einer Registry liegen. Jeder lieferte am 27. Oktober 2026 in seiner Registry 404, es gibt also nichts zu installieren, und das aufgeführte Verhalten kann noch nicht genutzt werden.

| Paket | Vorgesehener Zweck | Status |
|---|---|---|
| `@qorechain/mcp` | Ein Model-Context-Protocol-Server mit Lesezugriff auf QoreChain (Blöcke, Transaktionen, Konten, Validatoren, Staking-Stufen, Status hybrider Signaturen, Simulation, unsignierte Transfers). Er würde nie signieren oder übertragen. Ein gehosteter Endpunkt ist ebenfalls geplant | Nicht veröffentlicht. Das Quell-Repository ist nicht öffentlich. Der gehostete Endpunkt ist nicht live |
| `@qorechain/qore-cli` (Befehl `qore`) | Kommandozeilen-Lesezugriffe mit stabiler JSON-Ausgabe über dieselben Daten | Nicht veröffentlicht |
| `qorechain-qoresign` auf PyPI | QoreSign für Python | Nicht veröffentlicht (geplant 0.1.1) |

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
- **Noch nicht live:** der Transaktions-Inspektor auf der Entwicklerseite des Dashboards, der MCP-Server und die `qore`-CLI, QoreSign für Python, SVM-Transaktionen und die EVM-Precompiles im Mainnet (die Liste nach Lane finden Sie im [SDK-Überblick](/sdk/overview)).
- **Nicht ausgeführte Beispiele:** Von den 34 Quickstart-Einträgen liefen 31 am 27. Oktober 2026 und bestanden. Das QoreSign-Python-Beispiel wurde nicht ausgeführt (das Paket ist nicht veröffentlicht), und das QoreSign-Android-Beispiel wurde nicht auf einem Gerät ausgeführt. Wallet-Adapter, Chain-Bridge und Handles haben keinen Quickstart, daher stammen ihre Beispiele in diesem Handbuch aus den Typings und dem Quellcode des Pakets und wurden nicht Ende zu Ende ausgeführt.
- **`@qorechain/rdk-cli` vor 0.6.2** gab beim Start über den npm-Bin-Link nichts aus, und sein `--version` gab 0.4.1 aus. **`@qorechain/rdk` vor 0.7.0** baute Withdrawal-Proofs, die on-chain nie verifiziert wurden. Verwenden Sie 0.7.0.
- **cosmjs-Versionskonflikt.** `@qorechain/wallet-adapter` und `@qorechain/chain-bridge` verwenden cosmjs 0.32; das SDK verwendet cosmjs 0.39. Wer den Adapter neben dem SDK in einem Projekt installiert, lässt npm `ERESOLVE` melden. Halten Sie sie in getrennten Projekten oder übergeben Sie `--legacy-peer-deps`.
- **Verschachtelte SDK-Kopie in älteren RDK-Releases.** `@qorechain/rdk` 0.6.2 und früher hängen von `@qorechain/sdk` `^0.9.0` ab, sodass eine App mit SDK 0.10.0 eine zweite, verschachtelte SDK-0.9.x-Kopie erhielt. Ab 0.7.0 hängt das Kit von `@qorechain/sdk` `^0.10.0` ab und teilt sich eine Kopie.
- **Nur klassische RDK-Clients.** Die RDK-Clients für Python, Rust, Go und Java signieren nur klassisch, was der Native-Lane in beiden Netzwerken ablehnt; verwenden Sie sie für Lesezugriffe, oder nutzen Sie für Transaktionen den TypeScript-Client mit einem `pqcKeypair`.
- **Pakete ohne öffentliches Quell-Repository.** `@qorechain/chain-bridge` und `@qorechain/handles` listen in ihren Registry-Metadaten kein Quell-Repository. Den veröffentlichten Paketinhalt können Sie auf npm lesen.
- **Python-`qorechain-pqc`** hat in 0.2.3 keine Schlüsselerzeugung aus einem Seed und benötigt liboqs.
