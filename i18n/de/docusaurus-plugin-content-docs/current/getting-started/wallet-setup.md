---
slug: /getting-started/wallet-setup
title: Wallet-Einrichtung
sidebar_label: Wallet-Einrichtung
sidebar_position: 2
---

# Wallet-Einrichtung

QoreChain unterstützt mehrere Wallet-Typen über seine nativen, EVM- und SVM-Ausführungsumgebungen hinweg. Wählen Sie die Wallet, die zu Ihrem Anwendungsfall passt.

:::note
Die nachstehenden Chain-IDs und RPC-Endpunkte beziehen sich auf das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live; seine Werte für die Wallet-Verbindung sind auf der separaten Seite **Verbindung zum Mainnet** dokumentiert.
:::

## Keplr Wallet

Keplr ist die empfohlene Wallet für native QoreChain-Transaktionen, Staking und Governance.

### QoreChain als benutzerdefinierte Chain hinzufügen

Öffnen Sie Keplr und navigieren Sie zu **Settings > Add Custom Chain**, und geben Sie dann ein:

| Feld               | Wert                      |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

Nach dem Hinzufügen der Chain generiert Keplr eine `qor1...`-Adresse für Ihr Konto. Verwenden Sie diese Adresse, um Testnet-QOR-Token zu empfangen.

## MetaMask (EVM)

MetaMask ermöglicht die Interaktion mit der EVM-Ausführungsumgebung von QoreChain — stellen Sie Solidity-Verträge bereit, verwalten Sie ERC-20-Token und nutzen Sie vertrautes Ethereum-Tooling.

### QoreChain als benutzerdefiniertes Netzwerk hinzufügen

Öffnen Sie MetaMask und navigieren Sie zu **Settings > Networks > Add Network**, und geben Sie dann ein:

| Feld            | Wert                    |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Sobald die Verbindung hergestellt ist, können Sie MetaMask verwenden, um EVM-Transaktionen zu signieren, mit bereitgestellten Smart Contracts zu interagieren und ERC-20-Token auf QoreChain zu verwalten.

## Solana-Wallets (SVM)

Die SVM-Ausführungsumgebung von QoreChain ist mit Standard-Solana-Tooling kompatibel. Verbinden Sie eine beliebige Solana-kompatible Wallet oder Bibliothek, um mit SVM-Programmen zu interagieren.

### Verwendung von @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Dies ermöglicht die Bereitstellung von und Interaktion mit SVM-Programmen, die auf QoreChain laufen.

## PQC-fähige Wallets (auf dem Cosmos-Pfad erforderlich)

QoreChain erfordert hybride Post-Quanten-Kryptografie (PQC) auf dem Cosmos-Transaktionspfad. Ab der aktuellen Chain-Version (**v3.1.77**) lautet der Netzwerkstandard `hybrid_signature_mode = required` mit `allow_classical_fallback = false` — daher **muss jede Transaktion auf dem Cosmos-Pfad eine ML-DSA-87-Signatur (Dilithium-5) zusammen mit der standardmäßigen secp256k1-Signatur (ECDSA) tragen**. Ausschließlich klassische Cosmos-Transaktionen von einem PQC-Konto werden abgelehnt.

:::caution Cosmos-Transaktionen erfordern die hybride PQC-Erweiterung
Das Senden einer reinen klassischen Transaktion auf dem Cosmos-Pfad wird abgelehnt. Sie müssen die Dilithium-5-Signatur als `PQCHybridSignature`-Transaktionserweiterung anhängen. Standard-CosmJS-/Keplr-Tooling erzeugt diese Erweiterung nicht von selbst — verwenden Sie den CLI-Befehl `qorechaind tx pqc cosign`, die hybride Signierung des QoreChain SDK (siehe unten) oder, um sie selbst im Code zu erstellen, die Open-Source-Bibliothek [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Die einzigen Ausnahmen sind Genesis-Gentxs und Transaktionen zur PQC-Schlüsselregistrierung/-migration.
:::

### Funktionsweise

Wallets hängen eine ML-DSA-87-PQC-Signatur als Transaktionserweiterung zusammen mit der standardmäßigen secp256k1-Signatur (ECDSA) an. Die klassische Signatur wird über Sign-Bytes berechnet, die die Erweiterung ausschließen, sodass sie für die klassische Verifizierung gültig bleibt, während die PQC-Signatur Quantenresistenz bietet.

### Einen Dilithium-5-Schlüssel generieren

Generieren Sie einen Post-Quanten-Schlüssel für hybride Signierung:

```bash
qorechaind tx pqc gen-key
```

### Automatische Registrierung

Wenn Sie einen öffentlichen PQC-Schlüssel in Ihre erste Transaktion aufnehmen, registriert QoreChain ihn automatisch on-chain. Es ist kein separater Registrierungsschritt erforderlich. (Transaktionen zur PQC-Schlüsselregistrierung/-migration sind selbst von der Hybridanforderung ausgenommen, sodass ein Konto seinen ersten Schlüssel bootstrappen kann.)

### Hybride Signierung mit dem SDK

Das QoreChain SDK erzeugt konforme Cosmos-Transaktionen über `buildHybridTx` mit `includePqcPublicKey: true`, was die Dilithium-5-Erweiterung anhängt und den öffentlichen Schlüssel für die automatische Registrierung einbettet. Siehe [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).

### PQC-Modi

Die drei Durchsetzungsmodi bleiben governance-gesteuert; der **aktuelle Netzwerkstandard ist Required**:

| Modus                  | Beschreibung                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| **Disabled**           | Die PQC-Verifizierung ist deaktiviert. Nur Standardsignaturen.                       |
| **Optional**           | Transaktionen können PQC-Signaturen enthalten. Falls vorhanden, werden sie verifiziert. |
| **Required** (Standard) | Alle Transaktionen auf dem Cosmos-Pfad müssen eine gültige PQC-Signatur enthalten.   |

Der aktive Modus wird auf Chain-Ebene konfiguriert und kann über Governance aktualisiert werden.

:::note EVM / MetaMask nicht betroffen
Der MetaMask-(EVM-)Ablauf oben ist von der Hybridanforderung **nicht** betroffen. EVM-Transaktionen verwenden einen separaten `eth_secp256k1`-Ante-Pfad und benötigen niemals die PQC-Erweiterung.
:::

## CLI-Wallet

Die `qorechaind`-Binärdatei enthält ein integriertes Schlüsselverwaltungssystem für die Nutzung über die Kommandozeile.

### Einen neuen Schlüssel erstellen

```bash
qorechaind keys add mykey
```

Dies generiert ein neues Schlüsselpaar und zeigt die Mnemonic-Phrase an. **Bewahren Sie die Mnemonic-Phrase sicher auf** — sie ist die einzige Möglichkeit, diesen Schlüssel wiederherzustellen.

### Ihre Adresse anzeigen

```bash
qorechaind keys show mykey -a
```

Dies gibt Ihre `qor1...`-Bech32-Adresse aus.

### Alle Schlüssel auflisten

```bash
qorechaind keys list
```

### Einen vorhandenen Schlüssel importieren

```bash
qorechaind keys add mykey --recover
```

Sie werden aufgefordert, Ihre Mnemonic-Phrase einzugeben.

## Nächste Schritte

* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie QOR-Token mit Ihrer neuen Wallet
* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — Treten Sie dem live laufenden Diana-Testnet bei
