---
slug: /introduction/what-is-qorechain
title: Was ist QoreChain?
sidebar_label: Was ist QoreChain?
sidebar_position: 1
---

# Was ist QoreChain?

QoreChain ist die erste Layer-1-Blockchain, die von Beginn an mit Post-Quanten-Kryptografie, KI-nativer Transaktionsverarbeitung und einer Triple-VM-Laufzeitumgebung gebaut wurde, die EVM-, CosmWasm- und SVM-Programme auf einer einzigen Chain ausführt. Anstatt Quantenresistenz nachträglich in ein bestehendes Protokoll einzubauen, wurde QoreChain von Grund auf so konzipiert, dass es sowohl gegen klassische als auch gegen Quantengegner sicher ist und gleichzeitig die Entwicklererfahrung und Interoperabilität liefert, die man von einer modernen Allzweck-Blockchain erwartet.

Das Mainnet (`qorechain-vladi`, EVM-Chain-ID **9801**) ist seit dem 29. Juni 2026 live und läuft in Chain-Version **v3.2.1** (Konsensregeln von v3.2.0, angewendet am 25. September 2026). Ein öffentliches Testnet (`qorechain-diana`, EVM-Chain-ID **9800**, derzeit v3.2.2) läuft parallel für Staging- und Integrationstests. Der native Token ist **QOR** (Anzeige) / **uqor** (Basis, 10^6), mit den Bech32-Präfixen `qor` für Konten und `qorvaloper` für Validatoren. Die Chain ist auf dem Cosmos SDK v0.53 aufgebaut.

## Kerninnovationen

### 1. Post-Quanten-Kryptografie

QoreChain verwendet das NIST-standardisierte ML-DSA-87 (Dilithium-5) für digitale Signaturen, ML-KEM-1024 für die Schlüsselkapselung und SHAKE-256 als Standard-Anwendungshash und bietet so Sicherheit gegen Angriffe sowohl von klassischen als auch von Quantencomputern. Hybridsignaturen sind nun auf dem Cosmos-Transaktionspfad **standardmäßig erforderlich**: Jede Transaktion auf dem Cosmos-Pfad muss eine Dilithium-5-Signatur (ML-DSA-87) als Transaktionserweiterung *neben* der klassischen secp256k1-Signatur (ECDSA) tragen. Ausschließlich klassische Cosmos-Transaktionen werden abgelehnt — der Downgrade-Pfad ist geschlossen (nur Genesis-Gentxs, Transaktionen zur PQC-Schlüsselregistrierung/-migration und ein Unjail von einem Operator-Konto ohne registrierten Schlüssel sind ausgenommen). Die EVM-Lane behält die Standardsignatur `eth_secp256k1`, sodass Ethereum-Tooling unverändert signiert, doch seit v3.2.0 wird eine EVM-Transaktion nur von einem Konto zugelassen, das einen registrierten ML-DSA-87-Schlüssel und ein offenes **EVM-Autorisierungsfenster** besitzt — eine begrenzte Berechtigung, die mit einer post-quanten-signierten Nachricht der Cosmos-Lane geöffnet wird (siehe [EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window)). Ein klassischer Schlüssel allein kann auf der EVM-Lane keine Gelder mehr bewegen. Drei governance-gesteuerte Durchsetzungsmodi (disabled, optional, required) bleiben verfügbar, aber der aktuelle Netzwerkstandard ist **required**. Ein Framework für Algorithmus-Agilität stellt sicher, dass Signaturschemata über Governance-Vorschläge aktualisiert werden können, wenn sich kryptografische Standards weiterentwickeln.

### 2. KI-native Verarbeitung

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) ist eine On-Chain-Reinforcement-Learning-Schicht — ein Festkomma-PPO-Policy-Netzwerk mit 73,733 Parametern und Schutzschalter-Sicherheitsgrenzen —, die in den Block-Lebenszyklus eingebaut ist. Sie läuft derzeit im Beobachtungsmodus: Die Live-Netzwerke zeichnen alle 10 Blöcke Beobachtungen und Belohnungen auf, und es ist keine trainierte Policy geladen, sodass heute kein Konsensparameter von ihr abgestimmt wird. Statistische Isolation-Forest-Anomalieerkennung und mehrdimensionale Risikobewertung bewerten jede Transaktion in der Ante-Handler-Kette und kennzeichnen betrügerische Muster vor der Ausführung. Dynamische Gebührenoptimierung passt die Basisgebühren auf Grundlage von Echtzeit-Netzwerkbedingungen an. Sämtliche KI-Inferenz on-chain ist darauf ausgelegt, über Validatoren hinweg vollständig deterministisch zu sein — identische Eingaben erzeugen identische Ausgaben, ohne Abhängigkeit von externen Orakeln.

### 3. Triple-VM-Laufzeitumgebung

QoreChain ist die einzige Layer-1, die nativ drei virtuelle Maschinen innerhalb eines Konsenses ausführt:

* **EVM** — Vollständige Ethereum-Kompatibilität mit EIP-1559-Gaspreisbildung und JSON-RPC auf Port 8545. Stellen Sie Solidity-Verträge mit Standard-Tooling (Hardhat, Foundry, Remix) bereit.
* **CosmWasm** — WebAssembly-Smart-Contracts in Rust geschrieben, mit vollständiger Lebenszyklusunterstützung (instantiate, execute, query, migrate).
* **SVM** — BPF-Programmbereitstellung und -ausführung mit einem Solana-kompatiblen JSON-RPC-Server auf Port 8899. Bestehende Solana-Clients und -Tooling funktionieren sofort.

Cross-VM-Nachrichtenübermittlung ermöglicht es allen drei Laufzeitumgebungen zu kommunizieren: EVM-Verträge rufen CosmWasm über Precompile auf (sobald dieses Precompile aktiviert ist), CosmWasm-Verträge rufen EVM über benutzerdefinierte Nachrichten auf, und SVM-Programme nehmen über asynchrones ereignisbasiertes Bridging teil. Heute akzeptiert auf den Live-Netzwerken nur die EVM-Laufzeitumgebung Transaktionen: CosmWasm-Code-Upload und -Instanziierung sind deaktiviert, die SVM-Transaktions-Lane ist deaktiviert, kein EVM-Precompile ist aktiv, und die Cross-VM-Aufrufnachricht ist im Mainnet abgeschaltet.

### 4. Tokenomics mit begrenzter Emission

Die Burn-Engine definiert **zwölf Burn-Quellen** (Gasgebühren, Vertragserstellung, KI-Servicegebühren, Bridge-Gebühren, Treasury-Rückkauf, fehlgeschlagene Transaktionen, xQORE-Strafen, automatisierter Rückkauf, der TGE-Burn, Rollup-Erstellung, Meilensteine der Transaktionsanzahl und AMM), die ein zentrales Burn-Buchhaltungsmodul speisen; im Mainnet hat bisher nur der Gasgebühren-Kanal Burns verzeichnet. Alles, was in den Fee Collector fließt, wird aufgeteilt: **37 % an Validatoren, 30 % dauerhaft verbrannt, 20 % an die Treasury, 10 % an Staker und 3 % an Light Nodes**. Die Aufteilung gilt gleichermaßen für Transaktionsgebühren und für die Epochen-Emission. Das xQORE-Governance-Staking-Design ermöglicht es Nutzern, QOR für doppeltes Governance-Gewicht zu sperren, wobei Strafen für vorzeitigen Ausstieg an die verbleibenden Inhaber umverteilt werden; die Lock- und Unlock-Transaktionen sind in den Live-Netzwerken noch nicht angebunden.

QOR hat einen **endlichen Angebotspfad**: **4,420,000,000 QOR** zu Genesis (4,500,000,000 QOR geplant, von denen 80,000,000 QOR beim Token Generation Event vor Genesis verbrannt wurden), Staking-Emission, die unter einer **harten kumulativen Obergrenze von 114,285,714 QOR** geprägt wird, und die Burn-Engine, die Token dauerhaft entfernt. Das Modul `x/inflation` prägt pro Epoche von 43,200 Blöcken feste 16,239 QOR, bis die Obergrenze erreicht ist; danach stammen die Belohnungen allein aus Transaktionsgebühren. Siehe [Tokenomics](/architecture/tokenomics#supply-and-emission) für die Live-Zahlen und den Zeitplan.

### 5. Cross-Chain-Konnektivität

QoreChain ist darauf ausgelegt, sich über zwei komplementäre Protokolle mit einer breiten Palette von Blockchain-Ökosystemen zu verbinden: natives IBC und die QoreChain Bridge (QCB). Die Bridge-Schicht definiert **37 Chain-Konfigurationen (36 externe Chains plus Injective, erreicht über IBC)** und bis zu **8 IBC-Gegenparteien**. Die Cross-Chain-Schicht ist **auf keinem der beiden Netzwerke live**: Alle 37 Chain-Konfigurationen haben den Status `pending`, und kein IBC-Kanal ist geöffnet. Die nachstehenden Zahlen beschreiben die angestrebte Abdeckung.

* **Bis zu 8 IBC-Gegenparteien** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon und Injective. Vorkonfigurierte Relayer-Templates mit Client-Updates, Fehlverhaltenserkennung und automatischer Paketbereinigung.
* **37 QCB-Chain-Konfigurationen (36 externe Chains plus Injective über IBC)** — jeder Endpunkt ist so konzipiert, dass er typspezifische Adressvalidierung, konfigurierbare Bestätigungstiefe, Schutzschalter-Volumenobergrenzen und PQC-signierte Validator-Attestierungen enthält. Die angestrebten externen Chains sind:
  * **Baseline (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **EVM-Familie (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **Nicht-EVM (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **Ausstehend (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

Die Architektur erstreckt sich über jeden wichtigen Chain-Typ — EVM, Solana (SVM), Move-basiert (Sui, Aptos), Cosmos/IBC, UTXO und andere Nicht-EVM-Familien — um eine breite Interoperabilität über das Ökosystem hinweg zu bieten.

### 6. Rollup Development Kit

Das Modul `x/rdk` ist ein protokollnatives Framework zur Bereitstellung anwendungsspezifischer Rollups direkt auf der QoreChain-Host-Chain. Rollup-Unterstützung wird als Host-Chain-Framework bereitgestellt; konkrete Bereitstellungsaussagen sollten als angestrebte Fähigkeiten behandelt werden. Vier Settlement-Paradigmen werden unterstützt:

* **Optimistic** — Betrugsbeweise mit einem 7-tägigen Challenge-Fenster, automatisch finalisiert durch EndBlocker.
* **ZK (Zero-Knowledge)** — SNARK- oder STARK-Beweise mit sofortiger Finalität bei Verifizierung.
* **Based** — L1-sequenzierte Transaktionen mit Finalität in etwa 2 Host-Blöcken.
* **Sovereign** — Unabhängige Chains, die QoreChain ausschließlich für Data Availability nutzen.

Fünf voreingestellte Profile (**defi, gaming, nft, enterprise, custom**) ermöglichen eine Ein-Klick-Bereitstellung mit vorkonfigurierten Settlement-Modi, Blockzeiten, VM-Auswahlen, DA-Backends und Gas-Modellen. Ein nativer DA-Router bietet SHAKE-256-committed Blob-Speicher mit konfigurierbarer Aufbewahrung und automatischem Pruning. Das PRISM-Konsensmodul bietet beratende Methoden für die KI-unterstützte Rollup-Konfiguration. Auf den Live-Netzwerken wurde bisher noch kein Rollup erstellt.

### 7. Account- und Gas-Abstraktion

Smart Accounts mit drei programmierbaren Typen (Multisig, soziale Wiederherstellung, sessionbasiert) unterstützen Session-Keys mit granularen Berechtigungen und Ablauf, kontospezifische Ausgaberegeln und Denom-Allowlists. Dies ermöglicht Wallet-UX-Muster, die mit Standardkonten unmöglich sind: dApp-Session-Keys für Mobilgeräte, soziale Wiederherstellung als erstklassiger Kontotyp und programmierbare Ausgabelimits. Die Funktionen für Smart Accounts und verknüpfte Wallets sind implementiert, derzeit aber auf beiden Netzwerken **abgeschaltet** (`abstractaccount.enabled = false`; prüfen Sie `GET /qorechain/abstractaccount/v1/config`). Die Gas-Abstraktion soll es Nutzern ermöglichen, Gebühren in einem akzeptierten nicht-nativen Token zu bezahlen (die Konfiguration listet `ibc/USDC` und `ibc/ATOM`); es ist noch kein IBC-Kanal geöffnet, daher werden Gebühren derzeit in QOR bezahlt.

## Ökosystem

QoreChain wird mit **48 Genesis-Modulen, davon 20 QoreChain-spezifisch,** ausgeliefert und deckt Sicherheit (pqc), KI (ai, reputation, rlconsensus), Konsens (qca), virtuelle Maschinen (vm, svm, crossvm), Tokenomics (burn, xqore, inflation), Liquidität (amm), Lizenzierung (license), Bridges (bridge, babylon, multilayer), Governance-Erweiterungen (abstractaccount, fairblock, gasabstraction) und Rollups (rdk) ab. Zu den jüngsten Ergänzungen gehören `x/amm` für AMM / On-Chain-Liquidität und `x/license` für Chain-Lizenzierung. Die Chain folgt einer Open-Core-Architektur — die Protokollebene ist vollständig Open Source, mit optionalen proprietären Erweiterungen für Enterprise-Bereitstellungen.

## Verwandt

* [Architekturüberblick](/introduction/architecture-overview) — wie die Schichten von Anfang bis Ende zusammenpassen.
* [Hauptfunktionen](/introduction/key-features) — die Funktionshighlights auf einen Blick.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — der KI-unterstützte Konsens im Kern.
* [Tokenomics](/architecture/tokenomics) — QOR-Angebot, Burns, Rebases und Emissionen.
* [Schnellstart](/getting-started/quickstart) — starten Sie einen lokalen Knoten und beginnen Sie zu entwickeln.
