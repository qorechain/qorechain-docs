---
slug: /appendix/version-history
title: Versionsverlauf
sidebar_label: Versionsverlauf
sidebar_position: 3
---

# Versionsverlauf

Öffentlicher Versionsverlauf für QoreChain. Das aktuelle Release ist **v3.1.82** und läuft auf dem Mainnet **`qorechain-vladi`** (EVM-Chain-ID **9801**, live seit dem 7. Juni 2026). Das Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**) folgt den Pre-Release-Builds.

:::note
Die nachstehenden Einträge sind übergeordnete Funktionszusammenfassungen. Frühere `v1.x`-Einträge bleiben als historische Aufzeichnung der Testnet-Release-Linie erhalten, die dem Mainnet vorausging.
:::

---

## v3.1.82 — Natives QOR auf SVM live + Integrator-Enablement (aktuelles Mainnet-Release)

**Release-Schwerpunkt:** Die native QOR-Vereinheitlichung auf der SVM läuft auf beiden Netzwerken, dazu alles, was eine Börse oder ein Integrator für die Anbindung benötigt.

* **Vereinheitlichtes natives QOR-Guthaben auf allen drei Schnittstellen live** — Die SVM-Vereinheitlichung (v3.1.81) ist auf Mainnet und Testnet bestätigt live: Dasselbe Konto hält ein einziges Guthaben, sichtbar als `uqor` (6 Dezimalstellen) auf Cosmos, im Wei-Stil mit 18 Dezimalstellen auf der EVM und in lamports (9 Dezimalstellen; 1 uqor = 1.000 lamports) auf der Solana-kompatiblen Schnittstelle.
* **Verifizierte öffentliche Endpunkte** — Öffentliche HTTPS-Endpunkte für Konsens-RPC, REST, EVM-JSON-RPC und SVM-JSON-RPC auf beiden Netzwerken, dazu der öffentliche [Block-Explorer](https://explore.qore.network). Siehe [Netzwerke](/appendix/networks).
* **Downloads** — Versionierte Node-Binary-Bundles, die Mainnet-Genesis und aktuelle Chain-Daten-Snapshots (mit SHA-256-Prüfsummen), veröffentlicht unter [download.qore.host](https://download.qore.host).
* **Deterministisches Post-Quanten-Signieren im gesamten Client-Stack** — `@qorechain/pqc` 0.1.1 signiert ML-DSA-87 deterministisch (FIPS-204 §3.4) in allen sechs Sprach-Bindings und entspricht damit dem, was die Chain akzeptiert; `@qorechain/wallet-adapter` 0.1.2 baut darauf für hybrides Transaktions-Signieren auf.
* **Integrator-Leitfaden** — Neuer [Börsen- & Integrator-Leitfaden](/developer-guide/exchange-integration) zu Einzahlungen, Auszahlungen und Node-Betrieb über die drei Schnittstellen hinweg.

## v3.1.81 — Native QOR-Vereinheitlichung auf der SVM

**Release-Schwerpunkt:** Natives QOR als erstklassiges Asset auf der Solana-kompatiblen Schnittstelle.

* **Natives QOR auf der SVM** — Die SVM-Laufzeitumgebung stellt das native QOR-Guthaben des Kontos jetzt direkt bereit (in lamports), statt ein separates, nur SVM-internes Guthaben zu führen. `getBalance` und `getSignaturesForAddress` arbeiten gegen native Guthaben, und System-Program-Transfers bewegen natives QOR.
* **SVM-Adress-Mapping** — Die SVM-Adresse eines Kontos wird aus dessen 20 Konto-Bytes abgeleitet (rechts auf 32 Bytes aufgefüllt, base58-kodiert), sodass die Cosmos-, EVM- und SVM-Adressen eines Schlüssels auf dieselben Guthaben verweisen.

## v3.1.80 — Multilayer-State-Anchor-Abfragen

**Release-Schwerpunkt:** Lesbare, offline verifizierbare Settlement-Anker für Rollups.

* **Anchor-Leseabfragen** — Der `x/multilayer`-Query-Service stellt jetzt `Anchor` (den neuesten State-Anchor eines Layers) und `Anchors` (die Anchor-Historie eines Layers) bereit, sodass Clients den Settlement-Anker eines Layers abrufen und unabhängig verifizieren können.
* **REST-Gateway für Multilayer** — Jede Multilayer-Abfrage (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) ist jetzt zusätzlich zu gRPC auch über REST verfügbar.
* **Quantensichere Settlement-Quittungen freigeschaltet** — Jeder Anchor trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder und liefert damit die On-Chain-Grundlage für die Offline-Verifikation von Settlement-Quittungen im Rollup Development Kit.

## v3.1.79 — Automatische Validator-Bereitstellung für Bridge-Netzwerke

**Release-Schwerpunkt:** Schlüsselfertige Teilnahme an verbundenen Netzwerken für lizenzierte Validatoren.

* **Netzwerk-Treiber-Framework** — Ein deklaratives Treiber-Framework ermöglicht es, dass für einen QoreChain-Validator, der die entsprechende `validator_<chain>`-Lizenz (oder `qcb_bridge`) hält, der passende External-Network-Client unter QoreChain-Orchestrierung auf demselben Node bereitgestellt, konfiguriert und betrieben wird — und zwar erst nach Aktivierung der Lizenz.
* **Treiber für alle 37 Bridge-Netzwerke** — Die Abdeckung umfasst jedes verbundene Netzwerk, klassifiziert nach Teilnahmemodell (permissionless Validator, begrenzt/gewählt/mit Zulassung, L2-Full-Node sowie Rollen ohne Staking bzw. mit Trust-List). Externer Netzwerk-Stake und Signierschlüssel bleiben pro Netzwerk vom Betreiber beizusteuern; QoreChain liefert das Framework und die durchgesetzte Lizenzsperre.

## v3.1.78 — Pre-Deploy-Bereitschaft

**Release-Schwerpunkt:** Wallets, Bridges, IBC und Lizenzierung funktionieren zum Launch — ohne Post-Deploy-Governance.

* **Trustlose Bridge-Aktivierung nach dem Deploy** — Ein `bridge_admin`-Schlüssel (oder Inhaber einer `qcb_bridge`-Lizenz) kann die Bridge jeder verbundenen Chain mit einer einzigen signierten Transaktion aktivieren (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — inklusive Contract-Adresse, Bestätigungen, Architektur, Status, aktivem Verifier und Verifier-Trust-Root — ohne Governance-Proposal oder Chain-Upgrade.
* **Lizenzsperre für Validator-Netzwerke** — Der Orchestrator erzwingt jetzt die `validator_<chain>`- / `qcb_bridge`-Lizenz (fail-closed), bevor ein External-Network-Client gestartet wird.
* **Wallet-Integrationspakete** — `@qorechain/wallet-adapter` und `@qorechain/connect` auf npm veröffentlicht (v0.1.0), mit MetaMask-Netzwerkregistrierung per Einzelaufruf (EIP-3085, natives QOR mit **18 Dezimalstellen** auf der EVM-Schiene) und Keplr-Gaspreis-Konfiguration.
* **Schlüsselfertiger IBC-Relayer** — Sofort einsatzbereite Relayer-Konfiguration und Channel-Bootstrap-Tooling für die acht IBC-Gegenparteien, damit Channels nach dem Deploy ohne Sonderaufwand in Betrieb gehen.

## v3.1.77 — REST-Endpunkte für Bridge & Burn

**Release-Schwerpunkt:** Lesender REST-Zugriff für Cross-Chain- und Supply-Module.

* **Bridge-REST-Endpunkte** — Read-only-HTTP-Query-Endpunkte für das Bridge-Modul, die den Bridge-Zustand zusätzlich zu gRPC über Standard-REST bereitstellen.
* **Burn-REST-Endpunkte** — Read-only-HTTP-Query-Endpunkte für das Burn-Modul, die Gebührenverteilungs- und Supply-Daten über Standard-REST abfragbar machen.

## v3.1.76 — Modernisierung der SVM-Toolchain

**Release-Schwerpunkt:** Auffrischung der Solana-Virtual-Machine-Kompatibilität.

* **Unterstützung für Programme der aktuellen Toolchain** — Die SVM-Ausführung wurde so modernisiert, dass mit der aktuellen Solana-Toolchain gebaute Programme auf der QoreChain-SVM-Laufzeitumgebung laufen.

## v3.1.75 — SVM-JSON-RPC standardmäßig aktiv

**Release-Schwerpunkt:** Solana-kompatibles RPC ab Werk.

* **Solana-kompatibles JSON-RPC** — Der SVM-JSON-RPC-Server ist jetzt standardmäßig aktiviert (Port **8899**) und wird automatisch mit dem Node gestartet; er stellt eine Solana-kompatible RPC-Schnittstelle für SVM-Tooling bereit.

## v3.1.74 — Rollup-Profil-Presets

**Release-Schwerpunkt:** Benutzerfreundlichkeit und Settlement des Rollup Development Kit.

* **Anwendung von Profil-Presets** — Die Rollup-Erstellung wendet jetzt das Preset des gewählten Profils an (DeFi, Gaming, NFT, Enterprise oder vollständig benutzerdefiniert), sodass neue Rollups sinnvolle Standardwerte für ihren Anwendungsfall erben.
* **Optimistisches Settlement** — Der optimistische Settlement-Pfad (Batch-Einreichung und Challenge) ist Ende-zu-Ende einsatzbereit.

## v3.1.73 — Post-Quanten-Hash-Baseline

**Release-Schwerpunkt:** Vervollständigung der standardmäßigen post-quanten-kryptografischen Baseline.

* **SHAKE-256 als Standard-Hash** — SHAKE-256 (SHA-3-Familie) wird als Standard-Anwendungs-Hash übernommen und vervollständigt damit die standardmäßige Post-Quanten-Baseline aus **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsselkapselung und **SHAKE-256**-Hashing.

## v3.1.72 — Stabilität & Wartung

**Release-Schwerpunkt:** Routinemäßige Stabilitäts- und Build-Pipeline-Wartung.

* **Stabilitätsverbesserungen** — Interne Wartung von Stabilität, Abhängigkeiten und Build-Pipeline ohne nach außen sichtbare Verhaltensänderungen.

## v3.1.71 — PQC-Hybrid-Signaturen standardmäßig erzwungen

**Release-Schwerpunkt:** Post-Quanten-Sicherheit standardmäßig aktiv auf dem Cosmos-Transaktionspfad.

* **Hybrid-Signaturen standardmäßig erforderlich** — Post-Quanten-Hybrid-Signaturen werden jetzt standardmäßig auf dem Cosmos-Transaktionspfad erzwungen: Jede Transaktion trägt eine Post-Quanten-Signatur **ML-DSA-87 (Dilithium-5)** neben der klassischen **secp256k1**-Signatur.
* **Governance-gesteuerte Durchsetzung** — Der Durchsetzungsmodus bleibt Governance-gesteuert, mit dem Standardwert **required**.

## v3.1.70 — Produktionshärtung

**Release-Schwerpunkt:** Produktionshärtung und Konsensoptimierung für das live geschaltete Mainnet.

* **PRISM-Konsensoptimierung** — Fortlaufende Verbesserungen der PRISM-Optimierungsschicht auf Basis von Reinforcement Learning für adaptives Parameter-Tuning unter Live-Netzwerkbedingungen, mit Circuit-Breaker-Sicherheitskontrollen.
* **Performance und Stabilität** — Verfeinerungen bei Durchsatz, Latenz und Ressourcennutzung über Validatoren und Full Nodes hinweg.
* **Betriebs-Tooling** — Verbessertes Monitoring sowie ergonomischere Abfragen und Node-Bedienung für Mainnet-Betreiber.
* **Ausrichtung an Tokenomics v2.1** — Gebührenverteilung und Emissionsmechanik an das ökonomische Modell mit fester Gesamtmenge und endlicher Emission angepasst.

## v3.0.0 — Mainnet-Genesis

**Release-Schwerpunkt:** Mainnet-Launch und Token Generation Event.

* **Mainnet-Genesis** — Das QoreChain-Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801) startete am **7. Juni 2026**, mit dem Token Generation Event (TGE) zur Genesis.
* **Fünffache Gebührenaufteilung** — Verteilung der Protokollgebühren auf Validatoren, Burn, Treasury, Staker und Light Nodes (**37 / 30 / 20 / 10 / 3**), mit einem dedizierten Light-Node-Anteil.
* **On-Chain-AMM** — Natives Automated-Market-Maker-Modul (`x/amm`) für On-Chain-Liquiditätspools und Swaps.
* **Chain-Lizenzierung** — On-Chain-Lizenzmodul (`x/license`) zur Registrierung und Verwaltung von Protokollberechtigungen.
* **Gehärtete Settlement-Paradigmen** — RDK-Settlement-Modi finalisiert als optimistic, zk, based und sovereign.

## v1.4.0 — Erweiterung vor dem Mainnet

**Release-Schwerpunkt:** Cross-Chain-Abdeckung und Release-Candidate-Stabilisierung im Vorfeld des Mainnets.

* **Erweiterte Cross-Chain-Abdeckung** — Zusätzliche IBC- und Bridge-Konnektivität zu einer breiteren Menge externer Netzwerke.
* **Light-Node-Teilnahme** — Einführung von Light Nodes und der Grundlagen für deren Gebührenanteil-Belohnungen.
* **Release-Candidate-Härtung** — Umfangreiche Tests, Audits und Stabilisierung über alle Kernmodule hinweg in Vorbereitung auf die Mainnet-Genesis.

## v1.3.0 — Rollup Development Kit

**Release-Schwerpunkt:** Native Rollup-Infrastruktur für souveräne und Shared-Security-Rollup-Deployments.

* **x/rdk-Modul** — Vollständiges Rollup Development Kit mit vier Settlement-Paradigmen: optimistic, zk, based und sovereign
* **5 Preset-Profile** — Vorkonfigurierte Rollup-Vorlagen für DeFi-, Gaming-, NFT-, Enterprise- und vollständig benutzerdefinierte Anwendungsfälle
* **Native Datenverfügbarkeit** — On-Chain-DA-Layer mit Blob-Speicherung, Aufbewahrungsverwaltung und Pruning-Lebenszyklus
* **EndBlocker-Auto-Finalisierung** — Automatische Batch-Finalisierung nach Ablauf des Challenge-Fensters, ohne dass ein Eingreifen des Betreibers erforderlich ist
* **KI-gestützte Profilauswahl** — `suggest-profile`-Abfrage, die eine optimale Rollup-Konfiguration auf Basis des beabsichtigten Anwendungsfalls empfiehlt
* **Multilayer-Integration** — Rollups registrieren sich als Layer in der Multilayer-Architektur und erben Routing-, Anchoring- und Challenge-Mechanik
* **Bank-Escrow-Lebenszyklus** — Der Stake des Betreibers wird während des Rollup-Betriebs im Escrow gehalten und bei sauberem Shutdown freigegeben oder bei Slashing verwirkt

## v1.2.0 — IBC & Bridges

**Release-Schwerpunkt:** Cross-Chain-Konnektivität und fortgeschrittene Konto-Abstraktionen.

* **25 Cross-Chain-Verbindungen** — 8 IBC-Channels und 17 QoreChain-Bridge-Verbindungen (QCB) zu externen Netzwerken
* **x/babylon-Modul** — BTC-Restaking-Integration, die Bitcoin-Inhabern die Teilnahme an der QoreChain-Staking-Sicherheit ermöglicht
* **x/abstractaccount-Modul** — Smart-Account-Framework mit programmierbaren Ausgaberegeln, Session-Keys und benutzerdefinierter Authentifizierungslogik
* **x/fairblock-Modul** — Threshold Identity-Based Encryption (tIBE) für MEV-resistente Transaktionsverschlüsselung
* **x/gasabstraction-Modul** — Multi-Token-Gaszahlung mit Unterstützung für natives QOR, per IBC gebrücktes USDC und per IBC gebrücktes ATOM
* **TX-Priorisierung mit 5 Lanes** — Transaktions-Lanes nach Priorität geordnet: System, Governance, Staking, Bridge und Allgemein
* **IBC-Relayer-Konfigurationen** — Vorkonfigurierte Relayer-Setups für alle unterstützten IBC-Channels
* **Bridge-zu-Burn-Integration** — Bridge-Gebühren werden durch die Gebührenverteilung des Burn-Moduls geleitet

## v1.1.0 — PQC-Hybrid-Signaturen

**Release-Schwerpunkt:** Post-quanten-kryptografische Sicherheit und Algorithmus-Agilität.

* **Duale secp256k1 (ECDSA)- + ML-DSA-87-Signaturen** — Jede Transaktion trägt sowohl eine klassische als auch eine Post-Quanten-Signatur, verifiziert in der AnteHandler-Kette
* **3 Durchsetzungsmodi** — Konfigurierbare Durchsetzung der Hybrid-Signaturen: aus (Modus 0), permissiv (Modus 1, PQC optional), verpflichtend (Modus 2, PQC erforderlich)
* **Auto-Registrierung** — PQC-Public-Keys werden bei der ersten Hybrid-Transaktion automatisch registriert, wodurch ein separater Registrierungsschritt entfällt
* **SHAKE-256-Hash-Grundlage** — Alle PQC-bezogenen Hashing-Operationen verwenden SHAKE-256 (SHA-3-Familie) für quantenresistente Adressableitung
* **TEE-Attestierungsschnittstellen** — Unterstützung für Trusted-Execution-Environment-Attestierung zum Nachweis der Integrität der PQC-Schlüsselerzeugung
* **Framework für Algorithmus-Agilität** — Steckbares Algorithmus-Register, das die Aufnahme künftiger PQC-Algorithmen per Governance ohne Chain-Upgrade erlaubt

## v1.0.0 — Genesis (Tokenomics-Engine)

**Release-Schwerpunkt:** Erster Protokoll-Launch mit vollständiger Tokenomics, Multi-VM-Ausführung und KI-gestütztem Betrieb.

* **x/burn-Modul** — Mehrkanaliger Fee-Burn-Mechanismus mit vierfacher Verteilung auf Validatoren, Burn, Treasury und Staker
* **x/xqore-Modul** — Governance-Staking-Derivat mit gestaffelten Strafen für vorzeitiges Entsperren und PvP-Rebase-Umverteilung
* **x/inflation-Modul** — Epochenbasierte Emission mit jährlichem Abklingen, gesteuert durch das ökonomische Modell endlicher Emission
* **PRISM-Konsensschicht** — Reinforcement-Learning-Optimierung (PPO) für dynamisches Tuning von Chain-Parametern mit Circuit-Breaker-Sicherheitskontrollen
* **Triple-Pool-CPoS** — Classified Proof-of-Stake mit den Validator-Pools Emerald, Sapphire und Ruby, gewichtet nach Reputationswerten
* **QDRW-Governance** — Dynamic-Reward-Weighting-System, das per Governance genehmigte Anpassungen der Belohnungsverteilung über die Pools hinweg erlaubt
* **EVM- + CosmWasm- + SVM-Laufzeitumgebungen** — Drei parallele Ausführungsumgebungen: die QoreChain EVM Engine, CosmWasm-Smart-Contracts und die Solana Virtual Machine
* **Cross-VM-Bridge** — Nachrichtenaustausch und Asset-Transfers zwischen EVM-, CosmWasm- und SVM-Laufzeitumgebungen innerhalb eines einzigen Blocks
* **Post-Quanten-Kryptografie** — Quantenresistentes Signieren, gestützt auf eine hochperformante PQC-Bibliothek
* **QCAI** — On-Chain-Heuristikanalyse mit optionalem Off-Chain-Sidecar für Betrugserkennung, Gebührenschätzung und Netzwerkoptimierung
* **Containerisiertes Deployment** — Vollständiges Multi-Validator-Testnet-Deployment mit Sidecar-Dienst und Block-Indexer
* **Block-Indexer** — Block-Listener mit persistenter Speicherung für historische Abfragen und Analysen
