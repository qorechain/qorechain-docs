---
slug: /appendix/version-history
title: Versionsverlauf
sidebar_label: Versionsverlauf
sidebar_position: 3
---

# Versionsverlauf

Öffentlicher Versionsverlauf für QoreChain. Die neueste Veröffentlichung ist **v3.1.77**, die auf dem Mainnet **`qorechain-vladi`** läuft (EVM-Chain-ID **9801**, live seit dem 7. Juni 2026). Das Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**) verfolgt Vorab-Builds.

:::note
Die folgenden Einträge sind übergeordnete Zusammenfassungen der Funktionen. Frühere `v1.x`-Einträge werden als historische Aufzeichnung der Testnet-Releaselinie beibehalten, die dem Mainnet vorausging.
:::

---

## v3.1.77 — Aktuelle Mainnet-Veröffentlichung

**Schwerpunkt der Veröffentlichung:** Schreibgeschützter REST-Zugriff für Cross-Chain- und Supply-Module.

* **Bridge-REST-Endpunkte** — Schreibgeschützte HTTP-Abfrage-Endpunkte für das Bridge-Modul, die den Bridge-Status zusätzlich zu gRPC über Standard-REST bereitstellen.
* **Burn-REST-Endpunkte** — Schreibgeschützte HTTP-Abfrage-Endpunkte für das Burn-Modul, die Gebührenverteilungs- und Supply-Daten über Standard-REST abfragbar machen.

## v3.1.76 — Modernisierung der SVM-Toolchain

**Schwerpunkt der Veröffentlichung:** Aktualisierung der Solana-Virtual-Machine-Kompatibilität.

* **Unterstützung für Programme der aktuellen Toolchain** — Die SVM-Ausführung wurde modernisiert, sodass Programme, die mit der aktuellen Solana-Toolchain erstellt wurden, auf der QoreChain-SVM-Laufzeit laufen.

## v3.1.75 — SVM-JSON-RPC standardmäßig

**Schwerpunkt der Veröffentlichung:** Solana-kompatibles RPC out-of-the-box.

* **Solana-kompatibles JSON-RPC** — Der SVM-JSON-RPC-Server ist nun standardmäßig aktiviert (Port **8899**) und wird automatisch mit dem Node gestartet, wodurch eine Solana-kompatible RPC-Schnittstelle für SVM-Tooling bereitgestellt wird.

## v3.1.74 — Rollup-Profil-Voreinstellungen

**Schwerpunkt der Veröffentlichung:** Benutzerfreundlichkeit und Settlement des Rollup Development Kit.

* **Anwendung von Profil-Voreinstellungen** — Die Rollup-Erstellung wendet nun die Voreinstellung des ausgewählten Profils an (DeFi, Gaming, NFT, Enterprise oder vollständig benutzerdefiniert), sodass neue Rollups sinnvolle Standardwerte für ihren Anwendungsfall erben.
* **Optimistisches Settlement** — Der optimistische Settlement-Pfad (Batch-Einreichung und Anfechtung) ist durchgängig betriebsbereit.

## v3.1.73 — Post-Quantum-Hash-Baseline

**Schwerpunkt der Veröffentlichung:** Vervollständigung der standardmäßigen post-quantum-kryptografischen Baseline.

* **SHAKE-256 als Standard-Hash** — SHAKE-256 (SHA-3-Familie) wird als Standard-Anwendungs-Hash übernommen und vervollständigt die standardmäßige Post-Quantum-Baseline aus **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsselkapselung und **SHAKE-256**-Hashing.

## v3.1.72 — Stabilität & Wartung

**Schwerpunkt der Veröffentlichung:** Routinemäßige Stabilität und Wartung der Build-Pipeline.

* **Stabilitätsverbesserungen** — Interne Stabilitäts-, Abhängigkeits- und Build-Pipeline-Wartung ohne extern sichtbare Verhaltensänderungen.

## v3.1.71 — PQC-Hybridsignaturen standardmäßig durchgesetzt

**Schwerpunkt der Veröffentlichung:** Post-Quantum-Sicherheit standardmäßig auf dem Cosmos-Transaktionspfad aktiviert.

* **Hybridsignaturen standardmäßig erforderlich** — Post-Quantum-Hybridsignaturen werden nun standardmäßig auf dem Cosmos-Transaktionspfad durchgesetzt: Jede Transaktion trägt eine Post-Quantum-**ML-DSA-87 (Dilithium-5)**-Signatur neben der klassischen **secp256k1**-Signatur.
* **Governance-gesteuerte Durchsetzung** — Der Durchsetzungsmodus bleibt governance-gesteuert, wobei der Standard auf **erforderlich** gesetzt ist.

## v3.1.70 — Produktionshärtung

**Schwerpunkt der Veröffentlichung:** Produktionshärtung und Konsensoptimierung für das Live-Mainnet.

* **PRISM-Konsensoptimierung** — Kontinuierliche Verbesserungen der PRISM-Reinforcement-Learning-Optimierungsschicht für die adaptive Parameterabstimmung unter Live-Netzwerkbedingungen, mit Sicherungsschalter-Sicherheitskontrollen.
* **Leistung und Stabilität** — Verbesserungen bei Durchsatz, Latenz und Ressourcennutzung über Validatoren und Full Nodes hinweg.
* **Betriebs-Tooling** — Verbesserte Ergonomie bei Monitoring, Abfragen und Node-Betrieb für Mainnet-Betreiber.
* **Ausrichtung an Tokenomics v2.1** — Gebührenverteilung und Emissionsmechanik ausgerichtet am ökonomischen Modell mit festem Angebot und endlicher Emission.

## v3.0.0 — Mainnet-Genesis

**Schwerpunkt der Veröffentlichung:** Mainnet-Start und Token Generation Event.

* **Mainnet-Genesis** — Das QoreChain-Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801) startete am **7. Juni 2026**, mit dem Token Generation Event (TGE) beim Genesis.
* **Fünffach-Gebührenaufteilung** — Protokoll-Gebührenverteilung über Validatoren, Verbrennung, Treasury, Staker und Light Nodes (**37 / 30 / 20 / 10 / 3**), unter Hinzufügung eines dedizierten Light-Node-Anteils.
* **On-Chain-AMM** — Natives Automated-Market-Maker-Modul (`x/amm`) für On-Chain-Liquiditätspools und Swaps.
* **Chain-Lizenzierung** — On-Chain-Lizenzmodul (`x/license`) zur Registrierung und Verwaltung von Protokollberechtigungen.
* **Gehärtete Settlement-Paradigmen** — RDK-Settlement-Modi finalisiert als optimistic, zk, based und sovereign.

## v1.4.0 — Pre-Mainnet-Erweiterung

**Schwerpunkt der Veröffentlichung:** Cross-Chain-Abdeckung und Release-Candidate-Stabilisierung vor dem Mainnet.

* **Erweiterte Cross-Chain-Abdeckung** — Zusätzliche IBC- und Bridge-Konnektivität zu einer breiteren Reihe externer Netzwerke.
* **Light-Node-Teilnahme** — Einführung von Light Nodes und die Grundlage für ihre Gebührenanteils-Belohnungen.
* **Release-Candidate-Härtung** — Umfangreiche Tests, Audits und Stabilisierung über alle Kernmodule hinweg zur Vorbereitung auf den Mainnet-Genesis.

## v1.3.0 — Rollup Development Kit

**Schwerpunkt der Veröffentlichung:** Native Rollup-Infrastruktur für souveräne und Shared-Security-Rollup-Deployments.

* **x/rdk-Modul** — Vollständiges Rollup Development Kit mit vier Settlement-Paradigmen: optimistic, zk, based und sovereign
* **5 Voreinstellungsprofile** — Vorkonfigurierte Rollup-Vorlagen für DeFi, Gaming, NFT, Enterprise und vollständig benutzerdefinierte Anwendungsfälle
* **Native Datenverfügbarkeit** — On-Chain-DA-Ebene mit Blob-Speicherung, Aufbewahrungsverwaltung und Pruning-Lebenszyklus
* **EndBlocker-Auto-Finalisierung** — Automatische Batch-Finalisierung beim Ablauf des Anfechtungsfensters, ohne erforderliche Betreiberintervention
* **KI-gestützte Profilauswahl** — `suggest-profile`-Abfrage, die eine optimale Rollup-Konfiguration basierend auf dem beabsichtigten Anwendungsfall empfiehlt
* **Multilayer-Integration** — Rollups registrieren sich als Ebenen in der Multilayer-Architektur und erben Routing-, Verankerungs- und Anfechtungsmechaniken
* **Bank-Escrow-Lebenszyklus** — Der Operator-Stake wird während des Rollup-Betriebs in Escrow gehalten und bei sauberem Herunterfahren freigegeben oder bei Slashing verwirkt

## v1.2.0 — IBC & Bridges

**Schwerpunkt der Veröffentlichung:** Cross-Chain-Konnektivität und erweiterte Account-Abstraktionen.

* **25 Cross-Chain-Verbindungen** — 8 IBC-Kanäle und 17 QoreChain-Bridge-(QCB-)Verbindungen zu externen Netzwerken
* **x/babylon-Modul** — BTC-Restaking-Integration, die es Bitcoin-Inhabern ermöglicht, an der QoreChain-Staking-Sicherheit teilzunehmen
* **x/abstractaccount-Modul** — Smart-Account-Framework mit programmierbaren Ausgaberegeln, Session-Keys und benutzerdefinierter Authentifizierungslogik
* **x/fairblock-Modul** — Threshold Identity-Based Encryption (tIBE) für MEV-resistente Transaktionsverschlüsselung
* **x/gasabstraction-Modul** — Multi-Token-Gaszahlung mit Unterstützung für natives QOR, per IBC gebrücktes USDC und per IBC gebrücktes ATOM
* **5-Lane-TX-Priorisierung** — Transaktions-Lanes geordnet nach Priorität: System, Governance, Staking, Bridge und Allgemein
* **IBC-Relayer-Konfigurationen** — Vorkonfigurierte Relayer-Setups für alle unterstützten IBC-Kanäle
* **Bridge-zu-Burn-Integration** — Bridge-Gebühren werden durch die Gebührenverteilung des Burn-Moduls geleitet

## v1.1.0 — PQC-Hybridsignaturen

**Schwerpunkt der Veröffentlichung:** Post-quantum-kryptografische Sicherheit und Algorithmus-Agilität.

* **Doppelte secp256k1-(ECDSA-)+-ML-DSA-87-Signaturen** — Jede Transaktion trägt sowohl eine klassische als auch eine Post-Quantum-Signatur, die in der AnteHandler-Kette verifiziert wird
* **3 Durchsetzungsmodi** — Konfigurierbare Durchsetzung von Hybridsignaturen: aus (Modus 0), permissiv (Modus 1, PQC optional), verpflichtend (Modus 2, PQC erforderlich)
* **Auto-Registrierung** — PQC-Public-Keys werden bei der ersten Hybrid-Transaktion automatisch registriert, wodurch ein separater Registrierungsschritt entfällt
* **SHAKE-256-Hash-Grundlage** — Alle PQC-bezogenen Hashing-Operationen verwenden SHAKE-256 (SHA-3-Familie) für quantenresistente Adressableitung
* **TEE-Attestierungsschnittstellen** — Unterstützung der Trusted-Execution-Environment-Attestierung zum Nachweis der Integrität der PQC-Schlüsselerzeugung
* **Algorithmus-Agilitäts-Framework** — Steckbare Algorithmusregistrierung, die es ermöglicht, künftige PQC-Algorithmen per Governance ohne ein Chain-Upgrade hinzuzufügen

## v1.0.0 — Genesis (Tokenomics Engine)

**Schwerpunkt der Veröffentlichung:** Erster Protokollstart mit vollständiger Tokenomics, Multi-VM-Ausführung und KI-gestütztem Betrieb.

* **x/burn-Modul** — Mehrkanaliger Gebührenverbrennungsmechanismus mit einer Vierfach-Verteilung über Validatoren, Verbrennung, Treasury und Staker
* **x/xqore-Modul** — Governance-Staking-Derivat mit gestaffelten Strafen für vorzeitige Entsperrung und PvP-Rebase-Umverteilung
* **x/inflation-Modul** — Epochenbasierte Emission mit jährlichem Verfall, geregelt durch das ökonomische Modell mit endlicher Emission
* **PRISM-Konsensschicht** — Reinforcement-Learning-Optimierung (PPO) für die dynamische Abstimmung von Chain-Parametern mit Sicherungsschalter-Sicherheitskontrollen
* **Dreifach-Pool-CPoS** — Classified Proof-of-Stake mit Emerald-, Sapphire- und Ruby-Validator-Pools, gewichtet nach Reputations-Scores
* **QDRW-Governance** — Dynamic-Reward-Weighting-System, das governance-genehmigte Anpassungen der Belohnungsverteilung über Pools hinweg ermöglicht
* **EVM- + CosmWasm- + SVM-Laufzeiten** — Drei gleichzeitige Ausführungsumgebungen: die QoreChain EVM Engine, CosmWasm-Smart-Contracts und die Solana Virtual Machine
* **Cross-VM-Bridge** — Nachrichtenübermittlung und Asset-Transfers zwischen EVM-, CosmWasm- und SVM-Laufzeiten innerhalb eines einzelnen Blocks
* **Post-Quantum-Kryptografie** — Quantenresistente Signierung, gestützt auf eine Hochleistungs-PQC-Bibliothek
* **QCAI** — On-Chain-Heuristikanalyse mit einem optionalen Off-Chain-Sidecar für Betrugserkennung, Gebührenschätzung und Netzwerkoptimierung
* **Containerisiertes Deployment** — Vollständiges Multi-Validator-Testnet-Deployment mit Sidecar-Dienst und Block-Indexer
* **Block-Indexer** — Block-Listener mit persistentem Speicher für historische Abfragen und Analysen
