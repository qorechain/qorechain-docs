---
slug: /appendix/version-history
title: Versionsverlauf
sidebar_label: Versionsverlauf
sidebar_position: 3
---

# Versionsverlauf

Öffentlicher Versionsverlauf für QoreChain. Die neueste Version ist **v3.1.80**, ausgeführt auf dem Mainnet **`qorechain-vladi`** (EVM-Chain-ID **9801**, live seit dem 7. Juni 2026). Das Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**) verfolgt Vorabversionen.

:::note
Die nachstehenden Einträge sind übergeordnete Funktionszusammenfassungen. Frühere `v1.x`-Einträge bleiben als historische Aufzeichnung der Testnet-Release-Linie erhalten, die dem Mainnet vorausging.
:::

---

## v3.1.80 — Multilayer-State-Anchor-Abfragen (Aktuelle Mainnet-Version)

**Release-Schwerpunkt:** Lesbare, offline überprüfbare Settlement-Anker für Rollups.

* **Anker-Leseabfragen** — Der `x/multilayer`-Abfragedienst stellt jetzt `Anchor` (den neuesten State-Anchor für einen Layer) und `Anchors` (den Anker-Verlauf eines Layers) bereit, sodass Clients den Settlement-Anchor eines Layers abrufen und unabhängig überprüfen können.
* **REST-Gateway für Multilayer** — Jede Multilayer-Abfrage (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) ist jetzt zusätzlich zu gRPC auch über REST verfügbar.
* **Quantensichere Settlement-Belege freigeschaltet** — Jeder Anker trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder und bildet damit die On-Chain-Grundlage für die Offline-Überprüfung von Settlement-Belegen im Rollup Development Kit.

## v3.1.79 — Automatische Validator-Bereitstellung für Bridge-Netzwerke

**Release-Schwerpunkt:** Schlüsselfertige Teilnahme an angebundenen Netzwerken für lizenzierte Validatoren.

* **Netzwerk-Treiber-Framework** — Ein deklaratives Treiber-Framework ermöglicht es einem QoreChain-Validator, der die relevante `validator_<chain>`- (oder `qcb_bridge`-)Lizenz hält, den passenden Client des externen Netzwerks auf demselben Node unter QoreChain-Orchestrierung bereitzustellen, zu konfigurieren und auszuführen — erst nachdem die Lizenz aktiviert wurde.
* **Treiber für alle 37 Bridge-Netzwerke** — Die Abdeckung umfasst jedes angebundene Netzwerk, klassifiziert nach Teilnahmemodell (erlaubnisfreier Validator, gedeckelt/gewählt/Zulassung, L2-Full-Node sowie nicht-stakende/Trust-List-Rollen). Stake- und Signaturschlüssel der externen Netzwerke werden weiterhin pro Netzwerk vom Betreiber bereitgestellt; QoreChain liefert das Framework und das durchgesetzte Lizenz-Gate.

## v3.1.78 — Bereitschaft vor dem Deploy

**Release-Schwerpunkt:** Wallets, Bridges, IBC und Lizenzierung funktionieren alle zum Launch — ohne Governance nach dem Deploy.

* **Vertrauenslose Bridge-Aktivierung nach dem Deploy** — Ein `bridge_admin`-Schlüssel (oder `qcb_bridge`-Lizenzinhaber) kann die Bridge jeder angebundenen Chain mit einer einzigen signierten Transaktion (`tx bridge update-chain-config` / `set-verifier-bootstrap`) aktivieren — und dabei Contract-Adresse, Bestätigungen, Architektur, Status, den aktiven Verifier und die Verifier-Trust-Root festlegen — ohne Governance-Vorschlag oder Chain-Upgrade.
* **Lizenz-Gate für Validator-Netzwerke** — Der Orchestrator erzwingt jetzt die `validator_<chain>`- / `qcb_bridge`-Lizenz (fail-closed), bevor ein Client eines externen Netzwerks gestartet wird.
* **Wallet-Integrationspakete** — `@qorechain/wallet-adapter` und `@qorechain/connect` wurden auf npm veröffentlicht (v0.1.0) und fügen eine MetaMask-Netzwerkregistrierung mit nur einem Aufruf (EIP-3085, natives QOR mit **18 Dezimalstellen** auf der EVM-Schiene) sowie eine Keplr-Gaspreis-Konfiguration hinzu.
* **IBC-Schlüsselfertig-Relayer** — Sofort einsatzbereite Relayer-Konfiguration und Channel-Bootstrap-Tooling für die acht IBC-Gegenstellen, sodass Channels nach dem Deploy ohne maßgeschneiderte Einrichtung zustande kommen.

## v3.1.77 — Bridge- & Burn-REST-Endpunkte

**Release-Schwerpunkt:** Schreibgeschützter REST-Zugriff für Cross-Chain- und Supply-Module.

* **Bridge-REST-Endpunkte** — Schreibgeschützte HTTP-Abfrageendpunkte für das Bridge-Modul, die den Bridge-Status zusätzlich zu gRPC über Standard-REST bereitstellen.
* **Burn-REST-Endpunkte** — Schreibgeschützte HTTP-Abfrageendpunkte für das Burn-Modul, die Daten zur Gebührenverteilung und zum Supply über Standard-REST abfragbar machen.

## v3.1.76 — Modernisierung der SVM-Toolchain

**Release-Schwerpunkt:** Aktualisierung der Kompatibilität mit der Solana Virtual Machine.

* **Unterstützung für Programme der aktuellen Toolchain** — Die SVM-Ausführung wurde modernisiert, sodass Programme, die mit der aktuellen Solana-Toolchain erstellt wurden, auf der QoreChain-SVM-Laufzeitumgebung laufen.

## v3.1.75 — SVM-JSON-RPC standardmäßig

**Release-Schwerpunkt:** Solana-kompatibles RPC out of the box.

* **Solana-kompatibles JSON-RPC** — Der SVM-JSON-RPC-Server ist jetzt standardmäßig aktiviert (Port **8899**) und wird automatisch mit dem Node gestartet, was eine Solana-kompatible RPC-Schnittstelle für SVM-Tooling bereitstellt.

## v3.1.74 — Rollup-Profil-Voreinstellungen

**Release-Schwerpunkt:** Benutzerfreundlichkeit und Settlement des Rollup Development Kit.

* **Anwendung von Profil-Voreinstellungen** — Bei der Rollup-Erstellung wird jetzt die Voreinstellung des ausgewählten Profils (DeFi, Gaming, NFT, Enterprise oder vollständig benutzerdefiniert) angewendet, sodass neue Rollups sinnvolle Standardwerte für ihren Anwendungsfall erben.
* **Optimistisches Settlement** — Der optimistische Settlement-Pfad (Batch-Übermittlung und Anfechtung) ist durchgängig einsatzbereit.

## v3.1.73 — Post-Quanten-Hash-Basislinie

**Release-Schwerpunkt:** Vervollständigung der standardmäßigen post-quanten kryptografischen Basislinie.

* **SHAKE-256 als Standard-Hash** — SHAKE-256 (SHA-3-Familie) wird als Standard-Anwendungs-Hash übernommen und vervollständigt damit die standardmäßige Post-Quanten-Basislinie aus **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsselkapselung und **SHAKE-256**-Hashing.

## v3.1.72 — Stabilität & Wartung

**Release-Schwerpunkt:** Routinemäßige Stabilität und Wartung der Build-Pipeline.

* **Stabilitätsverbesserungen** — Interne Wartung von Stabilität, Abhängigkeiten und Build-Pipeline ohne extern sichtbare Verhaltensänderungen.

## v3.1.71 — PQC-Hybrid-Signaturen standardmäßig erzwungen

**Release-Schwerpunkt:** Post-Quanten-Sicherheit standardmäßig aktiviert auf dem Cosmos-Transaktionspfad.

* **Hybrid-Signaturen standardmäßig erforderlich** — Post-quanten Hybrid-Signaturen werden jetzt standardmäßig auf dem Cosmos-Transaktionspfad erzwungen: Jede Transaktion trägt eine post-quanten **ML-DSA-87 (Dilithium-5)**-Signatur neben der klassischen **secp256k1**-Signatur.
* **Governance-gesteuerte Durchsetzung** — Der Durchsetzungsmodus bleibt Governance-gesteuert, wobei der Standard auf **required** gesetzt ist.

## v3.1.70 — Produktionshärtung

**Release-Schwerpunkt:** Produktionshärtung und Konsens-Optimierung für das Live-Mainnet.

* **PRISM-Konsens-Optimierung** — Fortlaufende Verbesserungen der PRISM-Optimierungsschicht für bestärkendes Lernen zur adaptiven Parameterabstimmung unter Live-Netzwerkbedingungen, mit Circuit-Breaker-Sicherheitskontrollen.
* **Leistung und Stabilität** — Verfeinerungen bei Durchsatz, Latenz und Ressourcennutzung über Validatoren und Full Nodes hinweg.
* **Betriebs-Tooling** — Verbesserte Ergonomie bei Überwachung, Abfrage und Node-Betrieb für Mainnet-Betreiber.
* **Tokenomics-v2.1-Ausrichtung** — Gebührenverteilung und Emissionsmechanik wurden am wirtschaftlichen Modell mit festem Supply und endlicher Emission ausgerichtet.

## v3.0.0 — Mainnet-Genesis

**Release-Schwerpunkt:** Mainnet-Launch und Token Generation Event.

* **Mainnet-Genesis** — Das QoreChain-Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801) startete am **7. Juni 2026**, mit dem Token Generation Event (TGE) zum Genesis.
* **Fünffache Gebührenaufteilung** — Verteilung der Protokollgebühren auf Validatoren, Burn, Treasury, Staker und Light Nodes (**37 / 30 / 20 / 10 / 3**), wodurch ein eigener Anteil für Light Nodes hinzugefügt wird.
* **On-Chain-AMM** — Natives Automated-Market-Maker-Modul (`x/amm`) für On-Chain-Liquiditätspools und -Swaps.
* **Chain-Lizenzierung** — On-Chain-Lizenzmodul (`x/license`) zur Registrierung und Verwaltung von Protokollberechtigungen.
* **Gehärtete Settlement-Paradigmen** — Die RDK-Settlement-Modi wurden als optimistic, zk, based und sovereign finalisiert.

## v1.4.0 — Pre-Mainnet-Erweiterung

**Release-Schwerpunkt:** Cross-Chain-Abdeckung und Release-Candidate-Stabilisierung vor dem Mainnet.

* **Erweiterte Cross-Chain-Abdeckung** — Zusätzliche IBC- und Bridge-Konnektivität zu einer breiteren Auswahl externer Netzwerke.
* **Light-Node-Teilnahme** — Einführung von Light Nodes und der Grundlagen für ihre Gebührenanteils-Belohnungen.
* **Release-Candidate-Härtung** — Umfangreiche Tests, Audits und Stabilisierung über alle Kernmodule hinweg zur Vorbereitung des Mainnet-Genesis.

## v1.3.0 — Rollup Development Kit

**Release-Schwerpunkt:** Native Rollup-Infrastruktur für souveräne und Shared-Security-Rollup-Deployments.

* **x/rdk-Modul** — Vollständiges Rollup Development Kit mit vier Settlement-Paradigmen: optimistic, zk, based und sovereign
* **5 Voreinstellungsprofile** — Vorkonfigurierte Rollup-Vorlagen für DeFi-, Gaming-, NFT-, Enterprise- und vollständig benutzerdefinierte Anwendungsfälle
* **Native Datenverfügbarkeit** — On-Chain-DA-Schicht mit Blob-Speicherung, Aufbewahrungsverwaltung und Pruning-Lebenszyklus
* **EndBlocker-Auto-Finalisierung** — Automatische Batch-Finalisierung, wenn das Anfechtungsfenster abläuft, ohne dass ein Betreibereingriff erforderlich ist
* **KI-gestützte Profilauswahl** — `suggest-profile`-Abfrage, die eine optimale Rollup-Konfiguration basierend auf dem beabsichtigten Anwendungsfall empfiehlt
* **Multilayer-Integration** — Rollups registrieren sich als Layer in der Multilayer-Architektur und erben Routing-, Anchoring- und Anfechtungsmechanik
* **Bank-Escrow-Lebenszyklus** — Der Betreiber-Stake wird während des Rollup-Betriebs treuhänderisch verwahrt und bei sauberem Herunterfahren freigegeben oder beim Slashing verwirkt

## v1.2.0 — IBC & Bridges

**Release-Schwerpunkt:** Cross-Chain-Konnektivität und fortgeschrittene Account-Abstraktionen.

* **25 Cross-Chain-Verbindungen** — 8 IBC-Channels und 17 QoreChain-Bridge-(QCB-)Verbindungen zu externen Netzwerken
* **x/babylon-Modul** — BTC-Restaking-Integration, die es Bitcoin-Inhabern ermöglicht, an der QoreChain-Staking-Sicherheit teilzunehmen
* **x/abstractaccount-Modul** — Smart-Account-Framework mit programmierbaren Ausgaberegeln, Session-Keys und benutzerdefinierter Authentifizierungslogik
* **x/fairblock-Modul** — Threshold Identity-Based Encryption (tIBE) für MEV-resistente Transaktionsverschlüsselung
* **x/gasabstraction-Modul** — Gas-Zahlung mit mehreren Token, die natives QOR, IBC-gebridgtes USDC und IBC-gebridgtes ATOM unterstützt
* **5-spurige TX-Priorisierung** — Transaktionsspuren, geordnet nach Priorität: system, governance, staking, bridge und general
* **IBC-Relayer-Konfigurationen** — Vorkonfigurierte Relayer-Setups für alle unterstützten IBC-Channels
* **Bridge-zu-Burn-Integration** — Bridge-Gebühren werden über die Gebührenverteilung des Burn-Moduls geleitet

## v1.1.0 — PQC-Hybrid-Signaturen

**Release-Schwerpunkt:** Post-quanten kryptografische Sicherheit und Algorithmus-Agilität.

* **Duale secp256k1- (ECDSA) + ML-DSA-87-Signaturen** — Jede Transaktion trägt sowohl eine klassische als auch eine post-quanten Signatur, die in der AnteHandler-Kette verifiziert werden
* **3 Durchsetzungsmodi** — Konfigurierbare Durchsetzung von Hybrid-Signaturen: off (Modus 0), permissive (Modus 1, PQC optional), mandatory (Modus 2, PQC erforderlich)
* **Auto-Registrierung** — PQC-Public-Keys werden automatisch bei der ersten Hybrid-Transaktion registriert, wodurch ein separater Registrierungsschritt entfällt
* **SHAKE-256-Hash-Grundlage** — Alle PQC-bezogenen Hashing-Operationen verwenden SHAKE-256 (SHA-3-Familie) für die quantenresistente Adressableitung
* **TEE-Attestierungs-Schnittstellen** — Unterstützung der Trusted-Execution-Environment-Attestierung zum Nachweis der Integrität der PQC-Schlüsselgenerierung
* **Algorithmus-Agilitäts-Framework** — Steckbares Algorithmus-Register, das es ermöglicht, künftige PQC-Algorithmen per Governance ohne Chain-Upgrade hinzuzufügen

## v1.0.0 — Genesis (Tokenomics-Engine)

**Release-Schwerpunkt:** Erster Protokoll-Launch mit vollständiger Tokenomics, Multi-VM-Ausführung und KI-gestütztem Betrieb.

* **x/burn-Modul** — Mehrkanaliger Gebühren-Burn-Mechanismus mit einer vierfachen Verteilung auf Validatoren, Burn, Treasury und Staker
* **x/xqore-Modul** — Governance-Staking-Derivat mit gestaffelten Strafen für vorzeitiges Entsperren und PvP-Rebase-Umverteilung
* **x/inflation-Modul** — Epochenbasierte Emission mit jährlichem Decay, gesteuert durch das wirtschaftliche Modell mit endlicher Emission
* **PRISM-Konsens-Schicht** — Optimierung durch bestärkendes Lernen (PPO) für die dynamische Abstimmung von Chain-Parametern mit Circuit-Breaker-Sicherheitskontrollen
* **Dreifach-Pool-CPoS** — Classified Proof-of-Stake mit den Validator-Pools Emerald, Sapphire und Ruby, gewichtet nach Reputationswerten
* **QDRW-Governance** — Dynamic-Reward-Weighting-System, das Governance-genehmigte Anpassungen der Belohnungsverteilung über die Pools hinweg ermöglicht
* **EVM- + CosmWasm- + SVM-Laufzeiten** — Drei gleichzeitige Ausführungsumgebungen: die QoreChain-EVM-Engine, CosmWasm-Smart-Contracts und die Solana Virtual Machine
* **Cross-VM-Bridge** — Nachrichtenübergabe und Asset-Transfers zwischen EVM-, CosmWasm- und SVM-Laufzeiten innerhalb eines einzigen Blocks
* **Post-Quanten-Kryptografie** — Quantenresistentes Signieren, gestützt auf eine leistungsstarke PQC-Bibliothek
* **QCAI** — On-Chain-Heuristik-Analyse mit einem optionalen Off-Chain-Sidecar für Betrugserkennung, Gebührenschätzung und Netzwerkoptimierung
* **Containerisiertes Deployment** — Vollständiges Multi-Validator-Testnet-Deployment mit Sidecar-Dienst und Block-Indexer
* **Block-Indexer** — Block-Listener mit persistentem Speicher für historische Abfragen und Analysen
