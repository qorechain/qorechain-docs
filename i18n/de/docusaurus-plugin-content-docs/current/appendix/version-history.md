---
slug: /appendix/version-history
title: Versionsverlauf
sidebar_label: Versionsverlauf
sidebar_position: 3
---

# Versionsverlauf

Öffentlicher Versionsverlauf für QoreChain. Das aktuelle Release ist **v3.1.85** und läuft auf dem Mainnet **`qorechain-vladi`** (EVM-Chain-ID **9801**, live seit dem 7. Juni 2026). Das Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**) folgt den Pre-Release-Builds.

:::note
Die nachstehenden Einträge sind übergeordnete Funktionszusammenfassungen. Frühere `v1.x`-Einträge bleiben als historische Aufzeichnung der Testnet-Release-Linie erhalten, die dem Mainnet vorausging.
:::

---

## v3.1.85 — Delegiertes Ausgeben über verknüpfte Wallets (aktuelles Release)

**Release-Schwerpunkt:** Ein verknüpfter externer Wallet-Schlüssel (Phantom, MetaMask) kann jetzt aus dem einen kanonischen Post-Quanten-Konto **ausgeben** — unter Least-Privilege-Berechtigungen, Ausgabenlimits und sofortiger Widerrufbarkeit.

* **Authenticator-Ausführungspfade** — Zwei neue Nachrichten erlauben es einem registrierten Authenticator, Transfers vom kanonischen Konto zu autorisieren, ohne dass der Kontoinhaber anwesend ist: **`MsgExecuteEVM`** (ein EVM-Aufruf/-Transfer von der `0x…`-Adresse des Kontos) und **`MsgExecuteCosmos`** (ein Bank-Send auf der Native-Spur). Ein **Relayer** reicht den Umschlag ein und bezahlt ihn — seine eigene hybride PQC-Signatur erfüllt die Transaktionsanforderungen — während die Signatur des Authenticators über domänenseparierte, Replay-gebundene Sign-Bytes die Autorisierung darstellt. Der externe Schlüssel benötigt niemals eine ML-DSA-Kosignatur.
* **MetaMask als Authenticator** — secp256k1-Authenticatoren können jetzt über ihre **20-Byte-Ethereum-Adresse** registriert und via **EIP-191 `personal_sign`** verifiziert werden (zusätzlich zur Form mit 33-Byte-komprimiertem Schlüssel), sodass ein Standard-MetaMask-Konto verknüpft werden und unter Limits ausgeben kann.
* **Durchsetzung auf allen drei Spuren** — Berechtigungs-Scopes und **SpendingRule**-Wertlimits (pro Transaktion + tägliche Obergrenzen) werden auf der Native-, EVM- und SVM-Spur durchgesetzt; Schlüsselverwaltungsnachrichten sind niemals delegierbar. Eindeutige Fehlercodes ermöglichen es Wallets, die richtige Meldung anzuzeigen: `5` Ausgabenlimit überschritten, `6` Authenticator abgelaufen, `10` Berechtigung verweigert, `11` Replay abgelehnt.
* **Abfrage des Berechtigungsschemas** — `GET /qorechain/abstractaccount/v1/permission_schema` (auch gRPC/CLI) liefert die kanonische Berechtigungstaxonomie (11 Berechtigungen), die Zuordnung Nachricht→Berechtigung und die Liste der nicht delegierbaren Nachrichten, sodass Wallets Scopes validieren können, ohne sie fest zu codieren.
* **PQC-Schlüsselrotation innerhalb desselben Algorithmus** — Das neue **`MsgRotatePQCKey`** rotiert den ML-DSA-87-Schlüssel eines Kontos innerhalb desselben Algorithmus (dual signiert vom alten und vom neuen Schlüssel) und ermöglicht so die Migration von Legacy-abgeleiteten Schlüsseln zur kanonischen adressgebundenen Ableitung sowie die Stilllegung eines kompromittierten Schlüssels. Neue CLI-Befehle: `tx pqc rotate-key` und `tx pqc recover-key` (deterministische Schlüsselwiederherstellung aus einer Mnemonic).
* **Root-Key-Transaktionen unverändert** — Die Änderungen sind additiv; normale Wallet-, Börsen- und Keplr-Abläufe bleiben unverändert. Node-Betreiber müssen bis zur Netzwerk-Upgrade-Höhe auf **v3.1.85** sein.

## v3.1.84 — Authenticator-Berechtigungen & Ausgabenlimits

**Release-Schwerpunkt:** Das Berechtigungsmodell hinter dem delegierten Ausgeben.

* **Kanonische Berechtigungstaxonomie** — Elf Berechtigungen (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) mit einer Fail-Closed-Zuordnung Nachricht→Berechtigung: Ein nicht zugeordneter Nachrichtentyp wird abgelehnt, und Schlüsselverwaltungsnachrichten können niemals delegiert werden.
* **SpendingRule-Durchsetzung** — Ausgabenobergrenzen pro Transaktion und pro Tag (UTC) mit Listen erlaubter Denoms werden durchgesetzt und pro Paar (Konto, Authenticator) erfasst.
* **Autorisierung auf der SVM-Spur** — Aktionen, die durch einen Schlüssel eines fremden Schemas (z. B. Phantom ed25519) auf der SVM-Spur autorisiert werden, laufen durch dasselbe zentrale Autorisierungs-Gate.

## v3.1.83 — Einheitliches Konto-Signieren über alle drei Schnittstellen

**Release-Schwerpunkt:** Ein Schlüssel, ein Konto — eine einzige einheitliche Identität, die jetzt auf den Cosmos-, EVM- und SVM-Schnittstellen **signieren** kann und nicht nur ein Guthaben hält.

* **Ein Schlüssel signiert auf jeder Spur** — Ein eth-nativ erstelltes Konto (Adresse = keccak seines secp256k1-Public-Keys) signiert jetzt zusätzlich zu EVM-Transaktionen auch Transaktionen auf der Cosmos-Spur mit dem `eth_secp256k1`-Schema. Seine Formen `qor1…` (Cosmos), `0x…` (EVM) und Solana-VM (base58) sind eine einzige 20-Byte-Identität, die sowohl **ein Guthaben hält** als auch **auf allen drei Spuren ausgibt** — einschließlich post-quanten-hybrider (ML-DSA-87) Cosmos-Transaktionen.
* **Post-Quanten-Signieren unverändert** — Das einheitliche Konto registriert weiterhin seinen ML-DSA-87-Schlüssel und trägt die von der Chain geforderte hybride FIPS-204-Signatur; der klassische Teil ist `eth_secp256k1` (keccak) statt des coinType-118-Schemas. Bestehende coinType-118-Konten sind nicht betroffen.
* **Konsensneutrales Rolling-Upgrade** — Ausgeliefert als rollierendes Binary-Upgrade auf beiden Netzwerken mit **keiner Re-Genesis und keinem Chain-Halt**. Kontoguthaben, Historie und Genesis bleiben unverändert.
* **Client-Tooling** — `@qorechain/wallet-adapter` 0.1.5 fügt eth-natives Cosmos-Signieren (`signClassicalEth` / `signHybridEth`), einheitliche 3-Adressen-Generierung und `walletFromSeed` hinzu (Ableitung des kanonischen Kontos aus einem beliebigen 32-Byte-Seed — z. B. einer Phantom-Signatur); `@qorechain/chain-bridge` erhält einen `eth_secp256k1`-Signierpfad.

:::caution Node-Betreiber — Upgrade erforderlich
Full Nodes müssen **v3.1.83+** ausführen. Ein Node vor 3.1.83 kann eine eth-native (`eth_secp256k1`) Transaktion nicht dekodieren und stoppt die Synchronisation, sobald eine solche in einem Block erscheint. Laden Sie das aktuelle Bundle von [download.qore.host](https://download.qore.host) herunter.
:::

## v3.1.82 — Natives QOR auf SVM live + Integrator-Enablement

**Release-Schwerpunkt:** Die SVM-Native-QOR-Vereinheitlichung läuft auf beiden Netzwerken, plus alles, was eine Börse oder ein Integrator für die Anbindung benötigt.

* **Einheitliches natives QOR-Guthaben live auf allen drei Schnittstellen** — Die SVM-Vereinheitlichung (v3.1.81) ist auf Mainnet und Testnet bestätigt live: Dasselbe Konto hält ein Guthaben, sichtbar als `uqor` (6 Dezimalstellen) auf Cosmos, im Wei-Stil mit 18 Dezimalstellen auf der EVM und in Lamports (9 Dezimalstellen; 1 uqor = 1.000 Lamports) auf der Solana-kompatiblen Schnittstelle.
* **Verifizierte öffentliche Endpunkte** — Öffentliche HTTPS-Endpunkte für Konsens-RPC, REST, EVM JSON-RPC und SVM JSON-RPC auf beiden Netzwerken, plus der öffentliche [Block-Explorer](https://explore.qore.network). Siehe [Netzwerke](/appendix/networks).
* **Downloads** — Versionierte Node-Binary-Bundles, die Mainnet-Genesis und frische Chain-Daten-Snapshots (mit SHA-256-Prüfsummen), veröffentlicht auf [download.qore.host](https://download.qore.host).
* **Deterministisches Post-Quanten-Signieren im gesamten Client-Stack** — `@qorechain/pqc` 0.1.1 signiert ML-DSA-87 deterministisch (FIPS-204 §3.4) in allen sechs Sprach-Bindings, passend zu dem, was die Chain akzeptiert; `@qorechain/wallet-adapter` 0.1.2 baut darauf für hybrides Transaktionssignieren auf.
* **Integrator-Leitfaden** — Neuer [Exchange & Integrator Guide](/developer-guide/exchange-integration), der Einzahlungen, Auszahlungen und Node-Betrieb über die drei Schnittstellen hinweg abdeckt.

## v3.1.81 — SVM-Native-QOR-Vereinheitlichung

**Release-Schwerpunkt:** Natives QOR als erstklassiges Asset auf der Solana-kompatiblen Schnittstelle.

* **Natives QOR auf SVM** — Die SVM-Laufzeitumgebung zeigt jetzt das native QOR-Guthaben des Kontos direkt an (in Lamports), statt ein separates, nur SVM-seitiges Guthaben zu führen. `getBalance` und `getSignaturesForAddress` arbeiten gegen native Mittel, und System-Program-Transfers bewegen natives QOR.
* **SVM-Adresszuordnung** — Die SVM-Adresse eines Kontos wird aus seinen 20 Konto-Bytes abgeleitet (rechts auf 32 Bytes aufgefüllt, base58-kodiert), sodass die Cosmos-, EVM- und SVM-Adressen eines Schlüssels auf dieselben Mittel verweisen.

## v3.1.80 — Multilayer-State-Anchor-Abfragen

**Release-Schwerpunkt:** Lesbare, offline verifizierbare Settlement-Anchors für Rollups.

* **Anchor-Leseabfragen** — Der `x/multilayer`-Query-Service stellt jetzt `Anchor` (den neuesten State-Anchor eines Layers) und `Anchors` (die Anchor-Historie eines Layers) bereit, sodass Clients den Settlement-Anchor eines Layers abrufen und unabhängig verifizieren können.
* **REST-Gateway für Multilayer** — Jede Multilayer-Abfrage (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) ist jetzt zusätzlich zu gRPC über REST verfügbar.
* **Quantensichere Settlement-Quittungen freigeschaltet** — Jeder Anchor trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder und liefert damit die On-Chain-Grundlage für die Offline-Verifikation von Settlement-Quittungen des Rollup Development Kit.

## v3.1.79 — Validator-Auto-Provisionierung für Bridge-Netzwerke

**Release-Schwerpunkt:** Schlüsselfertige Teilnahme an verbundenen Netzwerken für lizenzierte Validatoren.

* **Netzwerk-Treiber-Framework** — Ein deklaratives Treiber-Framework erlaubt es einem QoreChain-Validator, der die entsprechende `validator_<chain>`- (oder `qcb_bridge`-) Lizenz hält, den passenden Client des externen Netzwerks auf demselben Node unter QoreChain-Orchestrierung provisionieren, konfigurieren und betreiben zu lassen — erst nachdem die Lizenz aktiviert wurde.
* **Treiber für alle 37 Bridge-Netzwerke** — Die Abdeckung umfasst jedes verbundene Netzwerk, klassifiziert nach Teilnahmemodell (permissionless Validator, begrenzt/gewählt/Zulassung, L2-Full-Node sowie Non-Staking-/Trust-List-Rollen). Stake und Signaturschlüssel des externen Netzwerks bleiben pro Netzwerk vom Betreiber bereitzustellen; QoreChain liefert das Framework und das durchgesetzte Lizenz-Gate.

## v3.1.78 — Pre-Deploy-Bereitschaft

**Release-Schwerpunkt:** Wallets, Bridges, IBC und Lizenzierung funktionieren zum Launch — ohne Post-Deploy-Governance.

* **Vertrauenslose Post-Deploy-Bridge-Aktivierung** — Ein `bridge_admin`-Schlüssel (oder ein Inhaber der `qcb_bridge`-Lizenz) kann die Bridge jeder verbundenen Chain mit einer einzigen signierten Transaktion aktivieren (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — inklusive Contract-Adresse, Bestätigungen, Architektur, Status, aktivem Verifier und Verifier-Trust-Root — ohne Governance-Vorschlag oder Chain-Upgrade.
* **Lizenz-Gate für Validator-Netzwerke** — Der Orchestrator erzwingt jetzt die `validator_<chain>`- / `qcb_bridge`-Lizenz (fail-closed), bevor ein Client eines externen Netzwerks gestartet wird.
* **Wallet-Integrationspakete** — `@qorechain/wallet-adapter` und `@qorechain/connect` auf npm veröffentlicht (v0.1.0), mit One-Call-MetaMask-Netzwerkregistrierung (EIP-3085, natives QOR mit **18 Dezimalstellen** auf der EVM-Schiene) und Keplr-Gaspreis-Konfiguration.
* **Schlüsselfertiger IBC-Relayer** — Sofort einsatzbereite Relayer-Konfiguration und Channel-Bootstrap-Tooling für die acht IBC-Gegenparteien, sodass Channels nach dem Deploy ohne individuelle Einrichtung hochkommen.

## v3.1.77 — Bridge- & Burn-REST-Endpunkte

**Release-Schwerpunkt:** Lesender REST-Zugriff für Cross-Chain- und Supply-Module.

* **Bridge-REST-Endpunkte** — Schreibgeschützte HTTP-Query-Endpunkte für das Bridge-Modul, die den Bridge-Zustand zusätzlich zu gRPC über Standard-REST bereitstellen.
* **Burn-REST-Endpunkte** — Schreibgeschützte HTTP-Query-Endpunkte für das Burn-Modul, die Gebührenverteilungs- und Supply-Daten über Standard-REST abfragbar machen.

## v3.1.76 — SVM-Toolchain-Modernisierung

**Release-Schwerpunkt:** Auffrischung der Solana-Virtual-Machine-Kompatibilität.

* **Unterstützung von Programmen der aktuellen Toolchain** — Die SVM-Ausführung wurde modernisiert, sodass Programme, die mit der aktuellen Solana-Toolchain gebaut wurden, auf der QoreChain-SVM-Laufzeitumgebung laufen.

## v3.1.75 — SVM JSON-RPC standardmäßig aktiv

**Release-Schwerpunkt:** Solana-kompatibles RPC out of the box.

* **Solana-kompatibles JSON-RPC** — Der SVM-JSON-RPC-Server ist jetzt standardmäßig aktiviert (Port **8899**) und wird automatisch mit dem Node gestartet; er bietet eine Solana-kompatible RPC-Schnittstelle für SVM-Tooling.

## v3.1.74 — Rollup-Profil-Presets

**Release-Schwerpunkt:** Benutzerfreundlichkeit und Settlement des Rollup Development Kit.

* **Anwendung von Profil-Presets** — Bei der Rollup-Erstellung wird jetzt das Preset des gewählten Profils angewendet (DeFi, Gaming, NFT, Enterprise oder vollständig benutzerdefiniert), sodass neue Rollups sinnvolle Standardwerte für ihren Anwendungsfall erben.
* **Optimistisches Settlement** — Der optimistische Settlement-Pfad (Batch-Submit und Challenge) ist Ende-zu-Ende funktionsfähig.

## v3.1.73 — Post-Quanten-Hash-Baseline

**Release-Schwerpunkt:** Vervollständigung der standardmäßigen post-quanten-kryptografischen Baseline.

* **SHAKE-256 als Standard-Hash** — SHAKE-256 (SHA-3-Familie) wird als Standard-Anwendungshash übernommen und vervollständigt damit die standardmäßige Post-Quanten-Baseline aus **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsselkapselung und **SHAKE-256**-Hashing.

## v3.1.72 — Stabilität & Wartung

**Release-Schwerpunkt:** Routinemäßige Stabilitäts- und Build-Pipeline-Wartung.

* **Stabilitätsverbesserungen** — Interne Stabilitäts-, Abhängigkeits- und Build-Pipeline-Wartung ohne von außen sichtbare Verhaltensänderungen.

## v3.1.71 — Hybride PQC-Signaturen standardmäßig erzwungen

**Release-Schwerpunkt:** Post-Quanten-Sicherheit standardmäßig aktiv auf dem Cosmos-Transaktionspfad.

* **Hybride Signaturen standardmäßig erforderlich** — Post-quanten-hybride Signaturen werden jetzt standardmäßig auf dem Cosmos-Transaktionspfad erzwungen: Jede Transaktion trägt eine post-quanten **ML-DSA-87 (Dilithium-5)**-Signatur neben der klassischen **secp256k1**-Signatur.
* **Governance-gesteuerte Durchsetzung** — Der Durchsetzungsmodus bleibt Governance-gesteuert, mit dem Standardwert **erforderlich**.

## v3.1.70 — Produktionshärtung

**Release-Schwerpunkt:** Produktionshärtung und Konsensoptimierung für das live Mainnet.

* **PRISM-Konsensoptimierung** — Fortgesetzte Verbesserungen an der PRISM-Reinforcement-Learning-Optimierungsschicht für adaptive Parameterabstimmung unter Live-Netzwerkbedingungen, mit Circuit-Breaker-Sicherheitskontrollen.
* **Performance und Stabilität** — Verfeinerungen bei Durchsatz, Latenz und Ressourcennutzung über Validatoren und Full Nodes hinweg.
* **Betriebs-Tooling** — Verbesserte Ergonomie für Monitoring, Abfragen und Node-Betrieb für Mainnet-Betreiber.
* **Tokenomics-v2.1-Angleichung** — Gebührenverteilung und Emissionsmechanik an das ökonomische Modell mit festem Angebot und endlicher Emission angeglichen.

## v3.0.0 — Mainnet-Genesis

**Release-Schwerpunkt:** Mainnet-Launch und Token-Generierungsereignis.

* **Mainnet-Genesis** — Das QoreChain-Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801) startete am **7. Juni 2026**, mit dem Token-Generierungsereignis (TGE) zur Genesis.
* **Fünffache Gebührenaufteilung** — Verteilung der Protokollgebühren auf Validatoren, Burn, Treasury, Staker und Light Nodes (**37 / 30 / 20 / 10 / 3**), mit einem eigenen Light-Node-Anteil.
* **On-Chain-AMM** — Natives Automated-Market-Maker-Modul (`x/amm`) für On-Chain-Liquiditätspools und Swaps.
* **Chain-Lizenzierung** — On-Chain-Lizenzmodul (`x/license`) zum Registrieren und Verwalten von Protokollberechtigungen.
* **Gehärtete Settlement-Paradigmen** — RDK-Settlement-Modi finalisiert als optimistic, zk, based und sovereign.

## v1.4.0 — Pre-Mainnet-Erweiterung

**Release-Schwerpunkt:** Cross-Chain-Abdeckung und Release-Candidate-Stabilisierung vor dem Mainnet.

* **Erweiterte Cross-Chain-Abdeckung** — Zusätzliche IBC- und Bridge-Konnektivität zu einem breiteren Spektrum externer Netzwerke.
* **Light-Node-Teilnahme** — Einführung von Light Nodes und der Grundlagen für ihre Gebührenanteil-Belohnungen.
* **Release-Candidate-Härtung** — Umfangreiche Tests, Audits und Stabilisierung über alle Kernmodule in Vorbereitung auf die Mainnet-Genesis.

## v1.3.0 — Rollup Development Kit

**Release-Schwerpunkt:** Native Rollup-Infrastruktur für sovereign und Shared-Security-Rollup-Deployments.

* **x/rdk-Modul** — Vollständiges Rollup Development Kit mit vier Settlement-Paradigmen: optimistic, zk, based und sovereign
* **5 Preset-Profile** — Vorkonfigurierte Rollup-Vorlagen für DeFi, Gaming, NFT, Enterprise und vollständig benutzerdefinierte Anwendungsfälle
* **Native Datenverfügbarkeit** — On-Chain-DA-Schicht mit Blob-Speicherung, Aufbewahrungsverwaltung und Pruning-Lebenszyklus
* **EndBlocker-Auto-Finalisierung** — Automatische Batch-Finalisierung nach Ablauf des Challenge-Fensters, ohne dass ein Eingriff des Betreibers erforderlich ist
* **KI-gestützte Profilauswahl** — `suggest-profile`-Abfrage, die eine optimale Rollup-Konfiguration basierend auf dem beabsichtigten Anwendungsfall empfiehlt
* **Multilayer-Integration** — Rollups registrieren sich als Layer in der Multilayer-Architektur und erben Routing-, Anchoring- und Challenge-Mechanik
* **Bank-Escrow-Lebenszyklus** — Der Stake des Betreibers wird während des Rollup-Betriebs in Escrow gehalten und bei sauberem Herunterfahren freigegeben oder bei Slashing eingezogen

## v1.2.0 — IBC & Bridges

**Release-Schwerpunkt:** Cross-Chain-Konnektivität und fortgeschrittene Kontoabstraktionen.

* **25 Cross-Chain-Verbindungen** — 8 IBC-Channels und 17 QoreChain-Bridge-(QCB-)Verbindungen zu externen Netzwerken
* **x/babylon-Modul** — BTC-Restaking-Integration, die es Bitcoin-Inhabern ermöglicht, an der Staking-Sicherheit von QoreChain teilzunehmen
* **x/abstractaccount-Modul** — Smart-Account-Framework mit programmierbaren Ausgaberegeln, Session Keys und benutzerdefinierter Authentifizierungslogik
* **x/fairblock-Modul** — Threshold Identity-Based Encryption (tIBE) für MEV-resistente Transaktionsverschlüsselung
* **x/gasabstraction-Modul** — Multi-Token-Gaszahlung mit Unterstützung für natives QOR, IBC-gebrücktes USDC und IBC-gebrücktes ATOM
* **5-spurige TX-Priorisierung** — Transaktionsspuren nach Priorität geordnet: System, Governance, Staking, Bridge und Allgemein
* **IBC-Relayer-Konfigurationen** — Vorkonfigurierte Relayer-Setups für alle unterstützten IBC-Channels
* **Bridge-zu-Burn-Integration** — Bridge-Gebühren werden durch die Gebührenverteilung des Burn-Moduls geleitet

## v1.1.0 — Hybride PQC-Signaturen

**Release-Schwerpunkt:** Post-quanten-kryptografische Sicherheit und Algorithmus-Agilität.

* **Duale secp256k1-(ECDSA-) + ML-DSA-87-Signaturen** — Jede Transaktion trägt sowohl eine klassische als auch eine Post-Quanten-Signatur, verifiziert in der AnteHandler-Kette
* **3 Durchsetzungsmodi** — Konfigurierbare Durchsetzung hybrider Signaturen: aus (Modus 0), permissiv (Modus 1, PQC optional), verpflichtend (Modus 2, PQC erforderlich)
* **Auto-Registrierung** — PQC-Public-Keys werden bei der ersten hybriden Transaktion automatisch registriert, was einen separaten Registrierungsschritt überflüssig macht
* **SHAKE-256-Hash-Fundament** — Alle PQC-bezogenen Hashing-Operationen verwenden SHAKE-256 (SHA-3-Familie) für quantenresistente Adressableitung
* **TEE-Attestierungsschnittstellen** — Unterstützung für Trusted-Execution-Environment-Attestierung zum Nachweis der Integrität der PQC-Schlüsselerzeugung
* **Algorithmus-Agilitäts-Framework** — Steckbares Algorithmus-Register, das es erlaubt, künftige PQC-Algorithmen per Governance ohne Chain-Upgrade hinzuzufügen

## v1.0.0 — Genesis (Tokenomics-Engine)

**Release-Schwerpunkt:** Initialer Protokoll-Launch mit vollständiger Tokenomics, Multi-VM-Ausführung und KI-gestütztem Betrieb.

* **x/burn-Modul** — Mehrkanaliger Gebühren-Burn-Mechanismus mit einer Vier-Wege-Verteilung auf Validatoren, Burn, Treasury und Staker
* **x/xqore-Modul** — Governance-Staking-Derivat mit gestaffelten Early-Unlock-Strafen und PvP-Rebase-Umverteilung
* **x/inflation-Modul** — Epochenbasierte Emission mit jährlichem Abklingen, gesteuert durch das ökonomische Modell endlicher Emission
* **PRISM-Konsensschicht** — Reinforcement-Learning-Optimierung (PPO) für dynamische Chain-Parameterabstimmung mit Circuit-Breaker-Sicherheitskontrollen
* **Triple-Pool-CPoS** — Classified Proof-of-Stake mit den Validator-Pools Emerald, Sapphire und Ruby, gewichtet nach Reputationswerten
* **QDRW-Governance** — Dynamic-Reward-Weighting-System, das Governance-genehmigte Anpassungen der Belohnungsverteilung über die Pools erlaubt
* **EVM- + CosmWasm- + SVM-Laufzeitumgebungen** — Drei gleichzeitige Ausführungsumgebungen: die QoreChain EVM Engine, CosmWasm-Smart-Contracts und die Solana Virtual Machine
* **Cross-VM-Bridge** — Nachrichtenübermittlung und Asset-Transfers zwischen EVM-, CosmWasm- und SVM-Laufzeitumgebungen innerhalb eines einzigen Blocks
* **Post-Quanten-Kryptografie** — Quantenresistentes Signieren, gestützt auf eine hochperformante PQC-Bibliothek
* **QCAI** — On-Chain-Heuristikanalyse mit einem optionalen Off-Chain-Sidecar für Betrugserkennung, Gebührenschätzung und Netzwerkoptimierung
* **Containerisiertes Deployment** — Vollständiges Multi-Validator-Testnet-Deployment mit Sidecar-Dienst und Block-Indexer
* **Block-Indexer** — Block-Listener mit persistenter Speicherung für historische Abfragen und Analysen
