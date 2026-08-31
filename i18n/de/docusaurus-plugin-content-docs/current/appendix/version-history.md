---
slug: /appendix/version-history
title: Versionshistorie
sidebar_label: Versionshistorie
sidebar_position: 3
---

# Versionshistorie

Öffentliche Versionshistorie für QoreChain. Die aktuelle Version ist **v3.1.95**, im Einsatz auf dem Mainnet **`qorechain-vladi`** (EVM-Chain-ID **9801**, live seit 7. Juni 2026). Das Testnet **`qorechain-diana`** (EVM-Chain-ID **9800**) verfolgt Vorab-Builds.

:::note
Die folgenden Einträge sind Zusammenfassungen der wichtigsten Funktionen auf hoher Ebene. Frühere `v1.x`-Einträge werden als historische Aufzeichnung der Testnet-Releaselinie vor dem Mainnet beibehalten.
:::

---

## v3.1.95 — Cosmos-EVM-Härtung (aktuelle Version)

**Release-Schwerpunkt:** Rollierendes Sicherheitsupdate für die EVM-Guthaben-Buchhaltungsbibliothek.

* **Overflow-Härtung** — Ein EVM-Guthaben-Update-Pfad schlägt nun bei einer extremen Overflow-Bedingung sicher fehl, statt stillschweigend zu wrappen. Ausgeliefert als rollierendes, nicht konsensbrechendes Update — es war weder eine Governance-Abstimmung noch ein koordinierter Halt-Height erforderlich.

## v3.1.94 — Härtung der Emissionsobergrenze und administrativer Nachrichten

**Release-Schwerpunkt:** Die Staking-Belohnungs-Emission an die tatsächlichen Netzwerkbedingungen anpassen und die Autorisierungsprüfungen bei privilegierten administrativen Nachrichten verschärfen.

* **Emissionsobergrenze** — Ein Governance-Proposal, das mit vollständiger Unterstützung des gebundenen Stakes verabschiedet und bei Height 2.122.074 (26. August 2026) angewendet wurde, ersetzte den ursprünglichen abklingenden Emissionsplan durch einen festen Betrag pro Epoche unter einer harten, kumulativen Obergrenze. Der ursprüngliche Plan war auf ein deutlich reiferes, vollständig gebundenes Netzwerk kalibriert; gemessen am tatsächlich gebundenen Stake zahlte er weit schneller aus als beabsichtigt. Siehe [Tokenomics](/architecture/tokenomics#staking-reward-schedule) für die aktuellen Zahlen und die verbleibende Reichweite.
* **Härtung administrativer Nachrichten** — Eine Reihe privilegierter, autoritätsgesteuerter administrativer Nachrichten überprüft ihren Signierer nun gegen die eigene Adresse des Governance-Moduls, statt einem in der Nachricht selbst mitgeführten Wert zu vertrauen.
* Enthält außerdem den Node-Onboarding-Zuverlässigkeits-Fix aus v3.1.92, für jeden Node, der direkt auf diese Version aktualisiert.

## v3.1.92 — Zuverlässigkeit der Node-Synchronisation

**Release-Schwerpunkt:** Zuverlässigeres Node-Onboarding aus Snapshots und dem veröffentlichten Chain-Archiv.

* **Fix für Snapshot- und Archiv-Synchronisation** — Ein Problem wurde behoben, bei dem ein Node, der aus einem State-Sync-Snapshot oder dem veröffentlichten Chain-Archiv wiederhergestellt wurde, die Synchronisation über bestimmte historische Blöcke hinaus nicht abschließen konnte. Das Onboarding über beide Wege funktioniert nun zuverlässig.

## v3.1.90 — Uptime-Erfassung für Light-Nodes

**Release-Schwerpunkt:** Die für die Belohnungsberechtigung von Light-Nodes gemessene Uptime wird nun konsistent über die Zeit akkumuliert.

* **Vorwärts akkumulierende Uptime** — Die belohnungsrelevante Uptime eines Light-Nodes wird nun berechnet, indem die erwartete Heartbeat-Anzahl ab dem Zeitpunkt der eigenen Registrierung vorwärts akkumuliert wird — jeweils mit dem zu diesem Zeitpunkt geltenden Heartbeat-Intervall — statt die gesamte Historie unter dem aktuell geltenden Intervall neu zu berechnen. Eine Governance-Änderung des Heartbeat-Intervalls wirkt sich somit nur auf die Zukunft aus und bewertet die vergangene Leistung eines Nodes niemals rückwirkend neu.

## v3.1.86 — Absicherung der Validator-Wiederherstellung

**Release-Schwerpunkt:** Ein Validator kann nicht mehr dauerhaft davon ausgeschlossen werden, sich aus einem Downtime-Jail zu befreien.

* **Fix für Jail-Sperre** — Ein Validator-Operator-Konto ohne registrierten Post-Quanten-Schlüssel kann nun `MsgUnjail` immer einreichen, um sich aus einem Downtime-Jail zu befreien — auch wenn die Durchsetzung hybrider Signaturen auf „erforderlich“ gesetzt ist und der klassische Fallback deaktiviert wurde. Zuvor hatte ein solches Konto keinen Weg zur Wiederherstellung, da das Unjailing selbst das Senden einer Transaktion erforderte, die dem Konto verwehrt war.
* **State-Sync-Snapshots** — Die Snapshot-Erzeugung ist netzwerkweit aktiviert, sodass neue Validatoren und Full Nodes per State Sync statt per vollständigem historischem Replay schnell beitreten können.

## v3.1.85 — Delegiertes Ausgeben über verknüpfte Wallets

**Release-Schwerpunkt:** Ein verknüpfter externer Wallet-Schlüssel (Phantom, MetaMask) kann nun vom einen kanonischen Post-Quanten-Konto **ausgeben** — unter Least-Privilege-Berechtigungen, Ausgabenlimits und sofortigem Widerruf.

* **Authenticator-Ausführungspfade** — Zwei neue Nachrichten erlauben es einem registrierten Authenticator, Überweisungen vom kanonischen Konto zu autorisieren, ohne dass der Kontoinhaber anwesend ist: **`MsgExecuteEVM`** (ein EVM-Aufruf/-Transfer von der `0x…`-Adresse des Kontos) und **`MsgExecuteCosmos`** (eine Native-Lane-Bank-Überweisung). Ein **Relayer** reicht die Hülle ein und bezahlt sie — seine eigene hybride PQC-Signatur erfüllt die Transaktionsanforderungen —, während die Signatur des Authenticators über domänengetrennte, replay-gebundene Sign-Bytes die Autorisierung darstellt. Der externe Schlüssel benötigt niemals eine ML-DSA-Mitsignatur.
* **MetaMask als Authenticator** — secp256k1-Authenticatoren können nun über ihre **20-Byte-Ethereum-Adresse** registriert und via **EIP-191 `personal_sign`** verifiziert werden (zusätzlich zur 33-Byte-komprimierten Schlüsselform), sodass ein Standard-MetaMask-Konto verknüpft werden und unter Limits ausgeben kann.
* **Durchsetzung auf allen drei Lanes** — Berechtigungsbereiche und **SpendingRule**-Wertlimits (Pro-Transaktion- + Tageslimits) werden auf der Native-, EVM- und SVM-Lane durchgesetzt; Schlüsselverwaltungsnachrichten sind niemals delegierbar. Eindeutige Fehlercodes lassen Wallets die richtige Meldung anzeigen: `5` Ausgabenlimit überschritten, `6` Authenticator abgelaufen, `10` Berechtigung verweigert, `11` Replay abgelehnt.
* **Abfrage des Berechtigungsschemas** — `GET /qorechain/abstractaccount/v1/permission_schema` (auch gRPC/CLI) liefert die kanonische Berechtigungstaxonomie (11 Berechtigungen), die Zuordnung Nachricht→Berechtigung sowie die Liste nicht delegierbarer Nachrichten, sodass Wallets Bereiche validieren können, ohne sie hart zu codieren.
* **PQC-Schlüsselrotation im selben Algorithmus** — Die neue **`MsgRotatePQCKey`** rotiert den ML-DSA-87-Schlüssel eines Kontos innerhalb desselben Algorithmus (doppelt signiert vom alten und neuen Schlüssel) und ermöglicht so die Migration legacy-abgeleiteter Schlüssel zur kanonischen adressgebundenen Ableitung sowie die Stilllegung eines kompromittierten Schlüssels. Neue CLI: `tx pqc rotate-key` und `tx pqc recover-key` (deterministische Schlüsselwiederherstellung aus einer Mnemonic).
* **Root-Key-Transaktionen unverändert** — Die Änderungen sind additiv; normale Wallet-, Börsen- und Keplr-Abläufe bleiben unverändert. Node-Betreiber müssen bis zur Netzwerk-Upgrade-Höhe auf **v3.1.85** wechseln.

## v3.1.84 — Authenticator-Berechtigungen & Ausgabenlimits

**Release-Schwerpunkt:** Das Berechtigungsmodell hinter dem delegierten Ausgeben.

* **Kanonische Berechtigungstaxonomie** — Elf Berechtigungen (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) mit einer Fail-Closed-Zuordnung Nachricht→Berechtigung: Ein nicht zugeordneter Nachrichtentyp wird verweigert, und Schlüsselverwaltungsnachrichten können niemals delegiert werden.
* **Durchsetzung der SpendingRule** — Pro-Transaktion- und Pro-Tag-Ausgabenlimits (UTC) mit Listen erlaubter Denoms werden durchgesetzt und pro Paar (Konto, Authenticator) erfasst.
* **Autorisierung der SVM-Lane** — Aktionen, die durch einen Schlüssel eines fremden Schemas (z. B. Phantom ed25519) auf der SVM-Lane autorisiert werden, laufen über dasselbe zentrale Autorisierungs-Gate.

## v3.1.83 — Vereinheitlichte Kontosignierung über alle drei Schnittstellen

**Release-Schwerpunkt:** Ein Schlüssel, ein Konto — eine einzige einheitliche Identität, die nun auf den Cosmos-, EVM- und SVM-Schnittstellen **signieren** kann, nicht nur ein Guthaben halten.

* **Ein Schlüssel signiert auf jeder Lane** — Ein eth-nativ erstelltes Konto (Adresse = Keccak seines öffentlichen secp256k1-Schlüssels) signiert nun Cosmos-Lane-Transaktionen zusätzlich zu EVM-Transaktionen mit dem `eth_secp256k1`-Schema. Seine `qor1…`-Form (Cosmos), seine `0x…`-Form (EVM) und seine Solana-VM-Form (base58) sind eine einzige 20-Byte-Identität, die sowohl **ein Guthaben hält** als auch **auf allen drei Lanes ausgibt** — einschließlich Post-Quanten-hybrider (ML-DSA-87) Cosmos-Transaktionen.
* **Post-Quanten-Signierung unverändert** — Das vereinheitlichte Konto registriert weiterhin seinen ML-DSA-87-Schlüssel und trägt die vom Chain geforderte FIPS-204-Hybridsignatur; der klassische Teil ist `eth_secp256k1` (Keccak) statt des coinType-118-Schemas. Bestehende coinType-118-Konten sind davon nicht betroffen.
* **Konsensneutrales Rolling Upgrade** — Ausgeliefert als Rolling-Binary-Upgrade auf beiden Netzwerken **ohne Re-Genesis und ohne Chain-Halt**. Kontoguthaben, -historie und Genesis bleiben unverändert.
* **Client-Tooling** — `@qorechain/wallet-adapter` 0.1.5 fügt eth-native Cosmos-Signierung (`signClassicalEth` / `signHybridEth`), einheitliche 3-Adressen-Generierung sowie `walletFromSeed` hinzu (Ableitung des kanonischen Kontos aus jedem 32-Byte-Seed — z. B. einer Phantom-Signatur); `@qorechain/chain-bridge` erhält einen `eth_secp256k1`-Signierpfad.

:::caution Node-Betreiber — Upgrade erforderlich
Full Nodes müssen **v3.1.83+** ausführen. Ein Node vor 3.1.83 kann eine eth-native (`eth_secp256k1`) Transaktion nicht dekodieren und stoppt die Synchronisation, sobald eine solche in einem Block erscheint. Laden Sie das aktuelle Bundle von [download.qore.host](https://download.qore.host) herunter.
:::

## v3.1.82 — Natives QOR auf SVM live + Integrator-Enablement

**Release-Schwerpunkt:** Die native SVM-QOR-Vereinheitlichung läuft auf beiden Netzwerken, plus alles, was eine Börse oder ein Integrator zur Anbindung benötigt.

* **Vereinheitlichtes natives QOR-Guthaben live auf allen drei Schnittstellen** — Die SVM-Vereinheitlichung (v3.1.81) ist bestätigt live auf Mainnet und Testnet: Dasselbe Konto hält ein Guthaben, sichtbar als `uqor` (6 Dezimalstellen) auf Cosmos, im wei-Stil mit 18 Dezimalstellen auf der EVM und in Lamports (9 Dezimalstellen; 1 uqor = 1.000 Lamports) auf der Solana-kompatiblen Schnittstelle.
* **Verifizierte öffentliche Endpunkte** — Öffentliche HTTPS-Endpunkte für Konsens-RPC, REST, EVM-JSON-RPC und SVM-JSON-RPC auf beiden Netzwerken, plus der öffentliche [Block-Explorer](https://explore.qore.network). Siehe [Netzwerke](/appendix/networks).
* **Downloads** — Versionierte Node-Binary-Bundles, das Mainnet-Genesis sowie aktuelle Chain-Data-Snapshots (mit SHA-256-Prüfsummen) veröffentlicht unter [download.qore.host](https://download.qore.host).
* **Deterministische Post-Quanten-Signierung im gesamten Client-Stack** — `@qorechain/pqc` 0.1.1 signiert ML-DSA-87 deterministisch (FIPS-204 §3.4) in allen sechs Sprachanbindungen, passend zu dem, was die Chain akzeptiert; `@qorechain/wallet-adapter` 0.1.2 baut darauf für hybride Transaktionssignierung auf.
* **Integrator-Leitfaden** — Neuer [Leitfaden für Börsen & Integratoren](/developer-guide/exchange-integration) zu Einzahlungen, Auszahlungen und Node-Betrieb über die drei Schnittstellen hinweg.

## v3.1.81 — SVM-Native-QOR-Vereinheitlichung

**Release-Schwerpunkt:** Natives QOR als erstklassiger Vermögenswert auf der Solana-kompatiblen Schnittstelle.

* **Natives QOR auf SVM** — Die SVM-Runtime stellt nun das native QOR-Guthaben des Kontos direkt dar (in Lamports), statt ein separates, nur für SVM geltendes Guthaben zu führen. `getBalance` und `getSignaturesForAddress` arbeiten gegen natives Kapital, und System-Program-Transfers bewegen natives QOR.
* **SVM-Adresszuordnung** — Die SVM-Adresse eines Kontos wird aus dessen 20 Kontobytes abgeleitet (rechts auf 32 Bytes aufgefüllt, base58-kodiert), sodass die Cosmos-, EVM- und SVM-Adressen eines Schlüssels auf dasselbe Guthaben verweisen.

## v3.1.80 — Multilayer-State-Anchor-Abfragen

**Release-Schwerpunkt:** Lesbare, offline verifizierbare Settlement-Anker für Rollups.

* **Anker-Leseabfragen** — Der `x/multilayer`-Abfragedienst stellt nun `Anchor` (der aktuellste State-Anchor eines Layers) und `Anchors` (die Anker-Historie eines Layers) bereit, sodass Clients den Settlement-Anker eines Layers abrufen und unabhängig verifizieren können.
* **REST-Gateway für Multilayer** — Jede Multilayer-Abfrage (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) steht nun zusätzlich zu gRPC auch über REST zur Verfügung.
* **Quantensichere Settlement-Belege freigeschaltet** — Jeder Anker trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder und bildet damit die On-Chain-Grundlage für die offline verifizierbaren Settlement-Belege des Rollup Development Kit.

## v3.1.79 — Automatische Validator-Bereitstellung für Bridge-Netzwerke

**Release-Schwerpunkt:** Schlüsselfertige Teilnahme an verbundenen Netzwerken für lizenzierte Validatoren.

* **Netzwerktreiber-Framework** — Ein deklaratives Treiber-Framework lässt für einen QoreChain-Validator, der die passende `validator_<chain>`- (oder `qcb_bridge`-)Lizenz besitzt, den zugehörigen externen Netzwerk-Client auf demselben Node unter QoreChain-Orchestrierung bereitstellen, konfigurieren und ausführen — erst nach Aktivierung der Lizenz.
* **Treiber für alle 37 Bridge-Netzwerke** — Die Abdeckung umfasst jedes verbundene Netzwerk, klassifiziert nach Teilnahmemodell (permissionless Validator, gedeckelt/gewählt/Zulassung, L2-Full-Node und nicht stakende Trust-List-Rollen). Externer Netzwerk-Stake und Signaturschlüssel bleiben pro Netzwerk vom Betreiber gestellt; QoreChain liefert das Framework und das erzwungene Lizenz-Gate.

## v3.1.78 — Bereitschaft vor dem Deploy

**Release-Schwerpunkt:** Wallets, Bridges, IBC und Lizenzierung funktionieren bereits beim Start — ohne Governance nach dem Deploy.

* **Trustless Bridge-Aktivierung nach dem Deploy** — Ein `bridge_admin`-Schlüssel (oder Inhaber einer `qcb_bridge`-Lizenz) kann die Bridge jeder verbundenen Chain mit einer einzigen signierten Transaktion aktivieren (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — mit Festlegung von Vertragsadresse, Bestätigungen, Architektur, Status, dem aktiven Verifier und der Vertrauenswurzel des Verifiers — ganz ohne Governance-Proposal oder Chain-Upgrade.
* **Lizenz-Gate für Validator-Netzwerke** — Der Orchestrator erzwingt nun (fail-closed) die `validator_<chain>`- / `qcb_bridge`-Lizenz, bevor ein externer Netzwerk-Client gestartet wird.
* **Wallet-Integrationspakete** — `@qorechain/wallet-adapter` und `@qorechain/connect` auf npm veröffentlicht (v0.1.0), mit Ein-Klick-MetaMask-Netzwerkregistrierung (EIP-3085, **18 Dezimalstellen** für natives QOR auf der EVM-Rail) und Keplr-Gaspreiskonfiguration.
* **Schlüsselfertiger IBC-Relayer** — Fertig einsetzbare Relayer-Konfiguration und Channel-Bootstrap-Tooling für die acht IBC-Gegenparteien, sodass Channels nach dem Deploy ohne individuelle Einrichtung starten.

## v3.1.77 — Bridge- & Burn-REST-Endpunkte

**Release-Schwerpunkt:** Nur lesender REST-Zugriff für Cross-Chain- und Supply-Module.

* **Bridge-REST-Endpunkte** — Nur lesende HTTP-Abfrageendpunkte für das Bridge-Modul, die den Bridge-Status zusätzlich zu gRPC über Standard-REST bereitstellen.
* **Burn-REST-Endpunkte** — Nur lesende HTTP-Abfrageendpunkte für das Burn-Modul, wodurch Gebührenverteilungs- und Supply-Daten über Standard-REST abfragbar werden.

## v3.1.76 — Modernisierung der SVM-Toolchain

**Release-Schwerpunkt:** Auffrischung der Solana-Virtual-Machine-Kompatibilität.

* **Unterstützung für Programme der aktuellen Toolchain** — Die SVM-Ausführung wurde modernisiert, sodass mit der aktuellen Solana-Toolchain erstellte Programme auf der QoreChain-SVM-Runtime laufen.

## v3.1.75 — SVM-JSON-RPC standardmäßig aktiv

**Release-Schwerpunkt:** Solana-kompatible RPC sofort einsatzbereit.

* **Solana-kompatibles JSON-RPC** — Der SVM-JSON-RPC-Server ist nun standardmäßig aktiviert (Port **8899**) und startet automatisch mit dem Node, wodurch eine Solana-kompatible RPC-Schnittstelle für SVM-Tooling bereitgestellt wird.

## v3.1.74 — Voreingestellte Rollup-Profile

**Release-Schwerpunkt:** Benutzerfreundlichkeit und Settlement des Rollup Development Kit.

* **Anwendung voreingestellter Profile** — Die Rollup-Erstellung wendet nun das voreingestellte Profil (DeFi, Gaming, NFT, Enterprise oder vollständig benutzerdefiniert) an, sodass neue Rollups sinnvolle Standardwerte für ihren Anwendungsfall erben.
* **Optimistisches Settlement** — Der optimistische Settlement-Pfad (Batch-Einreichung und Challenge) ist Ende-zu-Ende funktionsfähig.

## v3.1.73 — Post-Quanten-Hash-Basislinie

**Release-Schwerpunkt:** Vervollständigung der standardmäßigen Post-Quanten-Kryptografie-Basislinie.

* **SHAKE-256 als Standard-Hash** — SHAKE-256 (SHA-3-Familie) wird als Standard-Anwendungs-Hash übernommen und vervollständigt damit die Standard-Post-Quanten-Basislinie aus **ML-DSA-87 (Dilithium-5)**-Signaturen, **ML-KEM-1024**-Schlüsseleinkapselung und **SHAKE-256**-Hashing.

## v3.1.72 — Stabilität & Wartung

**Release-Schwerpunkt:** Routinemäßige Stabilitäts- und Build-Pipeline-Wartung.

* **Stabilitätsverbesserungen** — Interne Wartung an Stabilität, Abhängigkeiten und Build-Pipeline ohne nach außen sichtbare Verhaltensänderungen.

## v3.1.71 — Standardmäßig erzwungene PQC-Hybridsignaturen

**Release-Schwerpunkt:** Post-Quanten-Sicherheit standardmäßig aktiviert auf dem Cosmos-Transaktionspfad.

* **Hybridsignaturen standardmäßig erforderlich** — Post-Quanten-Hybridsignaturen werden nun standardmäßig auf dem Cosmos-Transaktionspfad erzwungen: Jede Transaktion trägt eine Post-Quanten-**ML-DSA-87 (Dilithium-5)**-Signatur zusätzlich zur klassischen **secp256k1**-Signatur.
* **Governance-gesteuerte Durchsetzung** — Der Durchsetzungsmodus bleibt governance-gesteuert, wobei der Standard auf **erforderlich** gesetzt ist.

## v3.1.70 — Produktionshärtung

**Release-Schwerpunkt:** Produktionshärtung und Konsensoptimierung für das laufende Mainnet.

* **PRISM-Konsensoptimierung** — Fortlaufende Verbesserungen der PRISM-Reinforcement-Learning-Optimierungsschicht für adaptive Parameteranpassung unter Live-Netzwerkbedingungen, mit Circuit-Breaker-Sicherheitskontrollen.
* **Leistung und Stabilität** — Durchsatz-, Latenz- und Ressourcennutzungsverbesserungen bei Validatoren und Full Nodes.
* **Operatives Tooling** — Verbesserte Überwachungs-, Abfrage- und Node-Betriebsergonomie für Mainnet-Betreiber.
* **Abstimmung mit Tokenomics v2.1** — Gebührenverteilung und Emissionsmechanik abgestimmt auf das Wirtschaftsmodell mit fixem Angebot und endlicher Emission.

## v3.0.0 — Mainnet-Genesis

**Release-Schwerpunkt:** Mainnet-Start und Token-Generation-Event.

* **Mainnet-Genesis** — Das QoreChain-Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801) wurde am **7. Juni 2026** gestartet, mit dem Token-Generation-Event (TGE) bei Genesis.
* **Fünfteilige Gebührenaufteilung** — Verteilung der Protokollgebühren auf Validatoren, Burn, Treasury, Staker und Light-Nodes (**37 / 30 / 20 / 10 / 3**), mit einem eigenen Anteil für Light-Nodes.
* **On-Chain-AMM** — Natives Automated-Market-Maker-Modul (`x/amm`) für On-Chain-Liquiditätspools und Swaps.
* **Chain-Lizenzierung** — On-Chain-Lizenzmodul (`x/license`) zur Registrierung und Verwaltung von Protokoll-Berechtigungen.
* **Gehärtete Settlement-Paradigmen** — RDK-Settlement-Modi finalisiert als optimistisch, zk, based und sovereign.

## v1.4.0 — Erweiterung vor dem Mainnet

**Release-Schwerpunkt:** Cross-Chain-Abdeckung und Release-Candidate-Stabilisierung vor dem Mainnet.

* **Erweiterte Cross-Chain-Abdeckung** — Zusätzliche IBC- und Bridge-Konnektivität zu einer breiteren Palette externer Netzwerke.
* **Light-Node-Teilnahme** — Einführung von Light-Nodes und der Grundlage für deren Gebührenanteil-Belohnungen.
* **Release-Candidate-Härtung** — Umfangreiche Tests, Audits und Stabilisierung über alle Kernmodule hinweg als Vorbereitung auf die Mainnet-Genesis.

## v1.3.0 — Rollup Development Kit

**Release-Schwerpunkt:** Native Rollup-Infrastruktur für Sovereign- und Shared-Security-Rollup-Deployments.

* **x/rdk-Modul** — Vollständiges Rollup Development Kit mit vier Settlement-Paradigmen: optimistisch, zk, based und sovereign
* **5 voreingestellte Profile** — Vorkonfigurierte Rollup-Vorlagen für DeFi, Gaming, NFT, Enterprise und vollständig benutzerdefinierte Anwendungsfälle
* **Native Datenverfügbarkeit** — On-Chain-DA-Layer mit Blob-Speicherung, Aufbewahrungsverwaltung und Pruning-Lebenszyklus
* **EndBlocker-Auto-Finalisierung** — Automatische Batch-Finalisierung, sobald das Challenge-Fenster abläuft, ohne Eingriff des Betreibers
* **KI-gestützte Profilauswahl** — `suggest-profile`-Abfrage, die basierend auf dem vorgesehenen Anwendungsfall eine optimale Rollup-Konfiguration empfiehlt
* **Multilayer-Integration** — Rollups registrieren sich als Layer in der Multilayer-Architektur und erben Routing-, Anker- und Challenge-Mechanik
* **Bank-Escrow-Lebenszyklus** — Der Operator-Stake wird während des Rollup-Betriebs in Escrow gehalten und bei sauberem Shutdown freigegeben oder bei Slashing verwirkt

## v1.2.0 — IBC & Bridges

**Release-Schwerpunkt:** Cross-Chain-Konnektivität und erweiterte Kontoabstraktionen.

* **25 Cross-Chain-Verbindungen** — 8 IBC-Channels und 17 QoreChain-Bridge-(QCB)-Verbindungen zu externen Netzwerken
* **x/babylon-Modul** — BTC-Restaking-Integration, die es Bitcoin-Haltern ermöglicht, an der QoreChain-Staking-Sicherheit teilzunehmen
* **x/abstractaccount-Modul** — Smart-Account-Framework mit programmierbaren Ausgabenregeln, Session-Keys und benutzerdefinierter Authentifizierungslogik
* **x/fairblock-Modul** — Threshold Identity-Based Encryption (tIBE) für MEV-resistente Transaktionsverschlüsselung
* **x/gasabstraction-Modul** — Multi-Token-Gasbezahlung mit Unterstützung für natives QOR, IBC-gebrücktes USDC und IBC-gebrücktes ATOM
* **5-Lane-TX-Priorisierung** — Transaktions-Lanes geordnet nach Priorität: System, Governance, Staking, Bridge und Allgemein
* **IBC-Relayer-Konfigurationen** — Vorkonfigurierte Relayer-Einrichtungen für alle unterstützten IBC-Channels
* **Bridge-zu-Burn-Integration** — Bridge-Gebühren werden über die Gebührenverteilung des Burn-Moduls geleitet

## v1.1.0 — PQC-Hybridsignaturen

**Release-Schwerpunkt:** Post-Quanten-kryptografische Sicherheit und Algorithmus-Agilität.

* **Duale secp256k1-(ECDSA-) + ML-DSA-87-Signaturen** — Jede Transaktion trägt sowohl eine klassische als auch eine Post-Quanten-Signatur, verifiziert in der AnteHandler-Kette
* **3 Durchsetzungsmodi** — Konfigurierbare Durchsetzung von Hybridsignaturen: aus (Modus 0), permissiv (Modus 1, PQC optional), verpflichtend (Modus 2, PQC erforderlich)
* **Auto-Registrierung** — PQC-Public-Keys werden bei der ersten Hybridtransaktion automatisch registriert, wodurch ein separater Registrierungsschritt entfällt
* **SHAKE-256-Hash-Grundlage** — Alle PQC-bezogenen Hashing-Operationen verwenden SHAKE-256 (SHA-3-Familie) für quantenresistente Adressableitung
* **TEE-Attestierungsschnittstellen** — Unterstützung für Trusted-Execution-Environment-Attestierung zum Nachweis der Integrität der PQC-Schlüsselerzeugung
* **Framework für Algorithmus-Agilität** — Pluggable Algorithmus-Registry, die es erlaubt, künftige PQC-Algorithmen per Governance ohne Chain-Upgrade hinzuzufügen

## v1.0.0 — Genesis (Tokenomics-Engine)

**Release-Schwerpunkt:** Erster Protokollstart mit vollständigen Tokenomics, Multi-VM-Ausführung und KI-gestütztem Betrieb.

* **x/burn-Modul** — Mehrkanaliger Gebühren-Burn-Mechanismus mit vierteiliger Verteilung auf Validatoren, Burn, Treasury und Staker
* **x/xqore-Modul** — Governance-Staking-Derivat mit gestaffelten Strafen für vorzeitige Entsperrung und PvP-Rebase-Umverteilung
* **x/inflation-Modul** — Epochenbasierte Emission mit jährlichem Rückgang, gesteuert durch das Wirtschaftsmodell mit endlicher Emission
* **PRISM-Konsensschicht** — Reinforcement-Learning-Optimierung (PPO) für dynamische Chain-Parameteranpassung mit Circuit-Breaker-Sicherheitskontrollen
* **Triple-Pool-CPoS** — Klassifizierter Proof-of-Stake mit Emerald-, Sapphire- und Ruby-Validator-Pools, gewichtet nach Reputationswerten
* **QDRW-Governance** — Dynamic-Reward-Weighting-System, das governance-genehmigte Anpassungen der Belohnungsverteilung über Pools hinweg erlaubt
* **EVM- + CosmWasm- + SVM-Runtimes** — Drei gleichzeitige Ausführungsumgebungen: die QoreChain-EVM-Engine, CosmWasm-Smart-Contracts und die Solana Virtual Machine
* **Cross-VM-Bridge** — Nachrichtenübermittlung und Asset-Transfers zwischen EVM-, CosmWasm- und SVM-Runtimes innerhalb eines einzigen Blocks
* **Post-Quanten-Kryptografie** — Quantenresistente Signierung, gestützt auf eine leistungsstarke PQC-Bibliothek
* **QCAI** — On-Chain-heuristische Analyse mit optionalem Off-Chain-Sidecar für Betrugserkennung, Gebührenschätzung und Netzwerkoptimierung
* **Containerisiertes Deployment** — Vollständiges Multi-Validator-Testnet-Deployment mit Sidecar-Dienst und Block-Indexer
* **Block-Indexer** — Block-Listener mit persistenter Speicherung für historische Abfragen und Analysen
