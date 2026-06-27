---
slug: /introduction/what-is-qorechain
title: Was ist QoreChain?
sidebar_label: Was ist QoreChain?
sidebar_position: 1
---

# Was ist QoreChain?

QoreChain ist die erste Layer-1-Blockchain, die von Beginn an mit Post-Quanten-Kryptografie, KI-nativer Transaktionsverarbeitung und einer Triple-VM-Laufzeitumgebung gebaut wurde, die EVM-, CosmWasm- und SVM-Programme auf einer einzigen Chain ausführt. Anstatt Quantenresistenz nachträglich in ein bestehendes Protokoll einzubauen, wurde QoreChain von Grund auf so konzipiert, dass es sowohl gegen klassische als auch gegen Quantengegner sicher ist und gleichzeitig die Entwicklererfahrung und Interoperabilität liefert, die man von einer modernen Allzweck-Blockchain erwartet.

Das Mainnet (`qorechain-vladi`, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft in Chain-Version **v3.1.77**. Ein öffentliches Testnet (`qorechain-diana`, EVM-Chain-ID **9800**) läuft parallel für Staging- und Integrationstests. Der native Token ist **QOR** (Anzeige) / **uqor** (Basis, 10^6), mit den Bech32-Präfixen `qor` für Konten und `qorvaloper` für Validatoren. Die Chain ist auf dem Cosmos SDK v0.53 aufgebaut.

## Kerninnovationen

### 1. Post-Quanten-Kryptografie

QoreChain verwendet das NIST-standardisierte ML-DSA-87 (Dilithium-5) für digitale Signaturen, ML-KEM-1024 für die Schlüsselkapselung und SHAKE-256 als Standard-Anwendungshash und bietet so Sicherheit gegen Angriffe sowohl von klassischen als auch von Quantencomputern. Hybridsignaturen sind nun auf dem Cosmos-Transaktionspfad **standardmäßig erforderlich**: Jede Transaktion auf dem Cosmos-Pfad muss eine Dilithium-5-Signatur (ML-DSA-87) als Transaktionserweiterung *neben* der klassischen secp256k1-Signatur (ECDSA) tragen. Ausschließlich klassische Cosmos-Transaktionen werden abgelehnt — der Downgrade-Pfad ist geschlossen (nur Genesis-Gentxs und Transaktionen zur PQC-Schlüsselregistrierung/-migration sind ausgenommen). EVM-Transaktionen sind nicht betroffen: Sie verwenden einen separaten `eth_secp256k1`-Ante-Pfad (den QoreChain-EVM-Engine-Pfad) und erfordern nicht die Hybridsignatur. Drei governance-gesteuerte Durchsetzungsmodi (disabled, optional, required) bleiben verfügbar, aber der aktuelle Netzwerkstandard ist **required**. Ein Framework für Algorithmus-Agilität stellt sicher, dass Signaturschemata über Governance-Vorschläge aktualisiert werden können, wenn sich kryptografische Standards weiterentwickeln.

### 2. KI-native Verarbeitung

Ein On-Chain-Reinforcement-Learning-Agent (PPO MLP mit 73.733 Parametern) führt deterministische Festkomma-Inferenz direkt im Block-Lebenszyklus aus und stimmt Konsensparameter wie Blockzeit, Gas-Limits und Validator-Pool-Gewichte dynamisch ab. Diese Optimierungsschicht trägt die Marke **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). Statistische Isolation-Forest-Anomalieerkennung und mehrdimensionale Risikobewertung bewerten jede Transaktion in der Ante-Handler-Kette und kennzeichnen betrügerische Muster vor der Ausführung. Dynamische Gebührenoptimierung passt die Basisgebühren auf Grundlage von Echtzeit-Netzwerkbedingungen an. Sämtliche KI-Inferenz ist über Validatoren hinweg vollständig deterministisch — identische Eingaben erzeugen identische Ausgaben, ohne Abhängigkeit von externen Orakeln.

### 3. Triple-VM-Laufzeitumgebung

QoreChain ist die einzige Layer-1, die nativ drei virtuelle Maschinen innerhalb eines Konsenses ausführt:

* **EVM** — Vollständige Ethereum-Kompatibilität mit EIP-1559-Gaspreisbildung und JSON-RPC auf Port 8545. Stellen Sie Solidity-Verträge mit Standard-Tooling (Hardhat, Foundry, Remix) bereit.
* **CosmWasm** — WebAssembly-Smart-Contracts in Rust geschrieben, mit vollständiger Lebenszyklusunterstützung (instantiate, execute, query, migrate).
* **SVM** — BPF-Programmbereitstellung und -ausführung mit einem Solana-kompatiblen JSON-RPC-Server auf Port 8899. Bestehende Solana-Clients und -Tooling funktionieren sofort.

Cross-VM-Nachrichtenübermittlung ermöglicht es allen drei Laufzeitumgebungen zu kommunizieren: EVM-Verträge rufen CosmWasm über Precompile auf, CosmWasm-Verträge rufen EVM über benutzerdefinierte Nachrichten auf, und SVM-Programme nehmen über asynchrones ereignisbasiertes Bridging teil.

### 4. Tokenomics mit festem Angebot

Zehn verschiedene Burn-Kanäle (Transaktionsgebühren, Governance-Strafen, Slashing, Bridge-Gebühren, Spam-Abschreckung, Epochen-Überschuss, manuelle Burns, Vertrags-Callbacks, Cross-VM-Gebühren und Rollup-Erstellungs-Burns) speisen ein zentrales Burn-Buchhaltungsmodul. Eingenommene Gebühren werden aufgeteilt: **37 % an Validatoren, 30 % dauerhaft verbrannt, 20 % an die Treasury, 10 % an Staker und 3 % an Light Nodes**. Der xQORE-Governance-Staking-Mechanismus ermöglicht es Nutzern, QOR für doppeltes Governance-Gewicht mit PvP-Rebase-Umverteilung zu sperren — Strafen für vorzeitigen Ausstieg werden an die verbleibenden Inhaber umverteilt und belohnen so Überzeugung.

QoreChain verwendet ein Modell mit **festem Angebot** und einem endlichen Emissionsbudget statt einer dauerhaften prozentualen Inflation. Das Gesamtangebot ist auf **4.500.000.000 QOR** festgelegt, von denen **80.000.000 (1,78 %)** zum TGE verbrannt wurden. Staking-Belohnungen werden aus einem dedizierten Pool von **590.000.000 QOR** nach einem mehrjährigen Zeitplan ausgezahlt:

| Zeitraum | Ziel-APY | Emissionsbudget |
| --- | --- | --- |
| Jahr 1 | 8–12 % | 127.500.000 QOR |
| Jahr 2 | 6–10 % | 106.250.000 QOR |
| Jahre 3–4 | 5–8 % | 85.000.000 QOR pro Jahr |
| Jahr 5+ | Governance-bestimmt | ~186.000.000 QOR verbleibend |

In Kombination mit den zehn Burn-Kanälen konvergiert das Design mit festem Angebot in Richtung nettodeflationäres Verhalten, wenn das Transaktionsvolumen wächst.

### 5. Cross-Chain-Konnektivität

QoreChain ist darauf ausgelegt, sich über zwei komplementäre Protokolle mit einer breiten Palette von Blockchain-Ökosystemen zu verbinden: natives IBC und die QoreChain Bridge (QCB). Die Bridge-Schicht definiert **37 QCB-Chain-Konfigurationen (einschließlich QoreChain selbst als nativer Loopback)** plus **8 IBC-Kanäle** — und deckt insgesamt **36 externe Chains** ab. Die Cross-Chain-Schicht befindet sich derzeit im **Testnet-/Pending-Status und ist noch nicht produktiv**; die nachstehenden Zahlen beschreiben die angestrebte Abdeckung.

* **8 IBC-Kanäle** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon und Injective. Vorkonfigurierte Relayer-Templates mit Client-Updates, Fehlverhaltenserkennung und automatischer Paketbereinigung.
* **37 QCB-Konfigurationen (36 externe Chains + QoreChain-Loopback)** — jeder Endpunkt ist so konzipiert, dass er typspezifische Adressvalidierung, konfigurierbare Bestätigungstiefe, Schutzschalter-Volumenobergrenzen und PQC-signierte Validator-Attestierungen enthält. Die angestrebten externen Chains sind:
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

Fünf voreingestellte Profile (**defi, gaming, nft, enterprise, custom**) ermöglichen eine Ein-Klick-Bereitstellung mit vorkonfigurierten Settlement-Modi, Blockzeiten, VM-Auswahlen, DA-Backends und Gas-Modellen. Ein nativer DA-Router bietet SHA-256-committed Blob-Speicher mit konfigurierbarer Aufbewahrung und automatischem Pruning. Das PRISM-Konsensmodul bietet beratende Methoden für die KI-unterstützte Rollup-Konfiguration.

### 7. Account- und Gas-Abstraktion

Smart Accounts mit drei programmierbaren Typen (Multisig, soziale Wiederherstellung, sessionbasiert) unterstützen Session-Keys mit granularen Berechtigungen und Ablauf, kontospezifische Ausgaberegeln und Denom-Allowlists. Dies ermöglicht Wallet-UX-Muster, die mit Standardkonten unmöglich sind: dApp-Session-Keys für Mobilgeräte, soziale Wiederherstellung als erstklassiger Kontotyp und programmierbare Ausgabelimits, die beim Konsens durchgesetzt werden. Gas-Abstraktion beseitigt die Anforderung, natives QOR für Gebühren zu halten — Nutzer können in jedem akzeptierten, per IBC übertragenen Token wie USDC oder ATOM zahlen.

## Ökosystem

QoreChain wird mit **mehr als 45 Genesis-Modulen einschließlich mehr als 20 benutzerdefinierter Module** ausgeliefert und deckt Sicherheit (pqc), KI (ai, reputation, rlconsensus), Konsens (qca), virtuelle Maschinen (vm, svm, crossvm), Tokenomics (burn, xqore, inflation), Liquidität (amm), Lizenzierung (license), Bridges (bridge, babylon, multilayer), Governance-Erweiterungen (abstractaccount, fairblock, gasabstraction) und Rollups (rdk) ab. Zu den jüngsten Ergänzungen gehören `x/amm` für AMM / On-Chain-Liquidität und `x/license` für Chain-Lizenzierung. Die Chain folgt einer Open-Core-Architektur — die Protokollebene ist vollständig Open Source, mit optionalen proprietären Erweiterungen für Enterprise-Bereitstellungen.

## Verwandt

* [Architekturüberblick](/introduction/architecture-overview) — wie die Schichten von Anfang bis Ende zusammenpassen.
* [Hauptfunktionen](/introduction/key-features) — die Funktionshighlights auf einen Blick.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — der KI-unterstützte Konsens im Kern.
* [Tokenomics](/architecture/tokenomics) — QOR-Angebot, Burns, Rebases und Emissionen.
* [Schnellstart](/getting-started/quickstart) — starten Sie einen lokalen Knoten und beginnen Sie zu entwickeln.
