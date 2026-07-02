---
slug: /getting-started/wallet-setup
title: Wallet-Einrichtung
sidebar_label: Wallet-Einrichtung
sidebar_position: 2
---

# Wallet-Einrichtung

QoreChain unterstützt mehrere Wallet-Typen über seine nativen, EVM- und SVM-Ausführungsumgebungen hinweg. Wählen Sie das Wallet, das zu Ihrem Anwendungsfall passt.

:::note
Die folgenden Werte gelten sowohl für das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, live seit dem 7. Juni 2026) als auch für das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Öffentliche Endpunkte für beide Netzwerke sind unter [Netzwerke](/appendix/networks#public-endpoints) aufgeführt.
:::

## Keplr Wallet

Keplr ist das empfohlene Wallet für native QoreChain-Transaktionen, Staking und Governance.

### QoreChain als benutzerdefinierte Chain hinzufügen

Öffnen Sie Keplr, navigieren Sie zu **Settings > Add Custom Chain** und geben Sie Folgendes ein:

| Feld               | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Chain-Name         | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain-ID           | `qorechain-vladi`          | `qorechain-diana`                |
| RPC-URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST-URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32-Präfix      | `qor`                      | `qor`                            |
| Coin-Denom         | `QOR`                      | `QOR`                            |
| Coin Minimal Denom | `uqor`                     | `uqor`                           |
| Dezimalstellen     | `6`                        | `6`                              |
| Coin Type (BIP-44) | `118`                      | `118`                            |

Nach dem Hinzufügen der Chain generiert Keplr eine `qor1...`-Adresse für Ihr Konto.

:::caution Gaspreis-Untergrenze
Der minimale Gaspreis des Netzwerks beträgt **0.1uqor**. Wenn Sie die Gaspreis-Stufen von Keplr konfigurieren (z. B. über `suggestChain`), verwenden Sie Werte **bei oder über 0.1** (empfohlene Werte für low/average/high: `0.1 / 0.15 / 0.25`) — Transaktionen, die unterhalb der Untergrenze signiert werden, werden abgelehnt.
:::

## MetaMask (EVM)

MetaMask ermöglicht die Interaktion mit der EVM-Ausführungsumgebung von QoreChain — stellen Sie Solidity-Verträge bereit, verwalten Sie ERC-20-Token und nutzen Sie vertrautes Ethereum-Tooling.

### QoreChain als benutzerdefiniertes Netzwerk hinzufügen

Öffnen Sie MetaMask, navigieren Sie zu **Settings > Networks > Add Network** und geben Sie Folgendes ein:

| Feld               | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Netzwerkname       | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC-URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain-ID           | `9801`                    | `9800`                           |
| Währungssymbol     | `QOR`                     | `QOR`                            |
| Block-Explorer-URL | `https://explore.qore.network` | `https://explore.qore.network` |

Natives QOR hat auf der EVM-Schnittstelle **18 Dezimalstellen** (wei-Stil). Sobald die Verbindung hergestellt ist, können Sie MetaMask verwenden, um EVM-Transaktionen zu signieren, mit bereitgestellten Smart Contracts zu interagieren und ERC-20-Token auf QoreChain zu verwalten.

### Netzwerkregistrierung mit einem Aufruf

Für dApps registrieren die Pakete **`@qorechain/wallet-adapter`** und **`@qorechain/connect`** (auf npm veröffentlicht) QoreChain mit einem einzigen Aufruf im Wallet des Nutzers — MetaMask wird aufgefordert, das Netzwerk über EIP-3085 hinzuzufügen (mit dem korrekten nativen QOR mit **18 Dezimalstellen** auf der EVM-Schiene), und die Gaspreis-Stufe von Keplr wird konfiguriert:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Solana-Wallets (SVM)

Die SVM-Ausführungsumgebung von QoreChain ist mit dem Standard-Solana-Tooling kompatibel, und der **native QOR-Kontostand des Kontos ist direkt auf der SVM-Schnittstelle sichtbar** (in lamports, 9 Dezimalstellen; 1 uqor = 1.000 lamports). Verbinden Sie ein beliebiges Solana-kompatibles Wallet oder eine Bibliothek.

### Verwendung von @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Die öffentlichen SVM-Endpunkte sind **schreibgeschützt**; das Einreichen von Transaktionen erfordert einen eigenen Node. Details finden Sie unter [SVM-Entwicklung](/developer-guide/svm-development).

## PQC-fähige Wallets (auf dem Cosmos-Pfad erforderlich)

QoreChain erfordert hybride Post-Quanten-Kryptographie (PQC) auf dem Cosmos-Transaktionspfad. Ab der aktuellen Chain-Version (**v3.1.82**) ist der Netzwerk-Standard `hybrid_signature_mode = required` mit `allow_classical_fallback = false` — daher **muss jede Transaktion auf dem Cosmos-Pfad eine ML-DSA-87-Signatur (Dilithium-5) zusätzlich zur standardmäßigen secp256k1-Signatur (ECDSA) tragen**. Rein klassische Cosmos-Transaktionen von einem PQC-Konto werden abgelehnt.

:::caution Cosmos-Transaktionen erfordern die hybride PQC-Erweiterung
Das Senden einer rein klassischen Transaktion auf dem Cosmos-Pfad wird abgelehnt. Sie müssen die Dilithium-5-Signatur als `PQCHybridSignature`-Transaktionserweiterung anhängen. Standard-Tooling von CosmJS / Keplr erzeugt diese Erweiterung nicht von selbst — verwenden Sie den CLI-Befehl `qorechaind tx pqc cosign`, das hybride Signieren des QoreChain SDK (siehe unten) oder, um sie selbst im Code zu erstellen, die Open-Source-Bibliothek [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Die einzigen Ausnahmen sind Genesis-Gentxs sowie Transaktionen zur PQC-Schlüsselregistrierung/-migration.
:::

### Funktionsweise

Wallets hängen eine ML-DSA-87-PQC-Signatur als Transaktionserweiterung zusätzlich zur standardmäßigen secp256k1-Signatur (ECDSA) an. Die klassische Signatur wird über Sign-Bytes berechnet, die die Erweiterung ausschließen — sie bleibt somit für die klassische Verifikation gültig, während die PQC-Signatur Quantenresistenz bietet.

### Einen Dilithium-5-Schlüssel generieren

Generieren Sie einen Post-Quanten-Schlüssel für hybrides Signieren:

```bash
qorechaind tx pqc gen-key
```

### Automatische Registrierung

Wenn Sie einen öffentlichen PQC-Schlüssel in Ihre erste Transaktion aufnehmen, registriert QoreChain ihn automatisch on-chain. Ein separater Registrierungsschritt ist nicht erforderlich. (Transaktionen zur PQC-Schlüsselregistrierung/-migration sind selbst von der Hybrid-Anforderung ausgenommen, sodass ein Konto seinen ersten Schlüssel bootstrappen kann.)

### Hybrides Signieren mit dem SDK

Das QoreChain SDK erzeugt konforme Cosmos-Transaktionen über `buildHybridTx` mit `includePqcPublicKey: true`, wodurch die Dilithium-5-Erweiterung angehängt und der öffentliche Schlüssel für die automatische Registrierung eingebettet wird. Siehe [SDK-Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).

### PQC-Modi

Die drei Durchsetzungsmodi bleiben Governance-gesteuert; der **aktuelle Netzwerk-Standard ist Required**:

| Modus                  | Beschreibung                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Disabled**           | Die PQC-Verifikation ist deaktiviert. Nur Standard-Signaturen.                           |
| **Optional**           | Transaktionen können PQC-Signaturen enthalten. Falls vorhanden, werden sie verifiziert.  |
| **Required** (Standard) | Alle Transaktionen auf dem Cosmos-Pfad müssen eine gültige PQC-Signatur enthalten.      |

Der aktive Modus wird auf Chain-Ebene konfiguriert und kann über Governance aktualisiert werden.

:::note EVM / MetaMask nicht betroffen
Der obige MetaMask-Ablauf (EVM) ist von der Hybrid-Anforderung **nicht** betroffen. EVM-Transaktionen verwenden einen separaten `eth_secp256k1`-Ante-Pfad und benötigen die PQC-Erweiterung nie.
:::

## CLI-Wallet

Die Binärdatei `qorechaind` enthält ein integriertes Schlüsselverwaltungssystem für die Nutzung über die Kommandozeile.

### Einen neuen Schlüssel erstellen

```bash
qorechaind keys add mykey
```

Dies generiert ein neues Schlüsselpaar und zeigt die Mnemonic-Phrase an. **Bewahren Sie die Mnemonic sicher auf** — sie ist die einzige Möglichkeit, diesen Schlüssel wiederherzustellen.

### Ihre Adresse anzeigen

```bash
qorechaind keys show mykey -a
```

Dies gibt Ihre `qor1...`-Bech32-Adresse aus.

### Alle Schlüssel auflisten

```bash
qorechaind keys list
```

### Einen bestehenden Schlüssel importieren

```bash
qorechaind keys add mykey --recover
```

Sie werden aufgefordert, Ihre Mnemonic-Phrase einzugeben.

## Nächste Schritte

* [Ihre erste Transaktion](/getting-started/first-transaction) — Senden Sie QOR-Token mit Ihrem neuen Wallet
* [Verbindung zum Testnet](/getting-started/connecting-to-testnet) — Treten Sie dem Live-Diana-Testnet bei
