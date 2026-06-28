---
slug: /developer-guide/evm-development
title: EVM-Entwicklung
sidebar_label: EVM-Entwicklung
sidebar_position: 2
---

# EVM-Entwicklung

QoreChain betreibt eine vollständig EVM-kompatible Ausführungsumgebung auf der QoreChain EVM Engine, die es Ihnen ermöglicht, Solidity-Smart-Contracts mit vertrauten Werkzeugen bereitzustellen und mit ihnen zu interagieren. Das EVM-Modul stellt eine JSON-RPC-Schnittstelle auf **Port 8545** (WebSocket auf **8546**) bereit, die Standard-Ethereum-Entwicklungsabläufe unterstützt.

:::note
Die folgenden Beispiele richten sich an das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 mit Chain-Version **v3.1.80** in Betrieb ist. Verwenden Sie für das **`qorechain-diana`**-Testnet die EVM-Chain-ID **9800**.
:::

---

## JSON-RPC-Endpunkt

| Eigenschaft           | Wert                                       |
| -------------------- | ------------------------------------------ |
| Standard-URL          | `http://localhost:8545`                    |
| WebSocket-URL         | `ws://localhost:8546`                      |
| Unterstützte Namespaces | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Chain-ID (Mainnet)    | `9801` (`qorechain-vladi`)                 |
| Chain-ID (Testnet)    | `9800` (`qorechain-diana`)                 |
| Währungssymbol        | `QOR`                                      |

Der `qor_`-Namespace stellt QoreChain-spezifische Methoden bereit. Siehe [Benutzerdefinierter Namespace](#custom-qor_-namespace) weiter unten.

---

## Wallet-Konfiguration (MetaMask)

Fügen Sie QoreChain als benutzerdefiniertes Netzwerk in MetaMask hinzu:

| Feld               | Mainnet-Wert              | Testnet-Wert            |
| ------------------ | ------------------------- | ----------------------- |
| Netzwerkname       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC-URL            | `http://localhost:8545`   | `http://localhost:8545` |
| Chain-ID           | `9801`                    | `9800`                  |
| Währungssymbol     | `QOR`                     | `QOR`                   |
| Block-Explorer-URL | *(verwenden Sie den offiziellen Mainnet-Explorer)* | *(für lokales Testnet leer lassen)* |

---

## Hardhat

Installieren Sie Hardhat und konfigurieren Sie Ihre `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Stellen Sie einen Contract bereit:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Führen Sie Tests gegen die QoreChain EVM aus:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Erstellen und deployen Sie einen Contract mit Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Gas-Modell

QoreChain verwendet für EVM-Transaktionen ein **dynamisches EIP-1559-Basisgebührenmodell**:

* Die Basisgebühr passt sich pro Block anhand der Auslastung an
* Nutzer können `maxFeePerGas` und `maxPriorityFeePerGas` festlegen
* Prioritätsgebühren gehen an den Block-Proposer

### Stückelungsbrücke

Der native QOR-Token hat **6 Nachkommastellen** (`uqor`), während die EVM **18 Nachkommastellen** erwartet. Das Modul `x/precisebank` übernimmt die nahtlose Umrechnung:

| Kontext       | Stückelung   | Dezimalstellen | Beispiel               |
| ------------ | ------------ | -------- | ---------------------- |
| Native Chain | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

Diese Umrechnung ist transparent — wenn Sie ein Guthaben über `eth_getBalance` abfragen, wird die Antwort in wei mit 18 Dezimalstellen ausgedrückt. Wenn dasselbe Konto über das native Bank-Modul abgefragt wird, erscheint das Guthaben in `uqor` mit 6 Dezimalstellen.

---

## ERC-20-Token-Paare

Das Modul `x/erc20` ermöglicht die automatische Registrierung von **Token-Paaren** zwischen nativen Cosmos-SDK-Stückelungen und ERC-20-Contracts:

* Native Tokens können innerhalb von EVM-Contracts als ERC-20s verwendet werden
* Auf der EVM bereitgestellte ERC-20-Tokens können in native Stückelungen umgewandelt werden
* Die Umwandlung ist bidirektional und wird auf Protokollebene abgewickelt

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQC- und EVM-Kompatibilität

EVM-Transaktionen verwenden **klassische ECDSA-Signaturen (secp256k1)** für volle Kompatibilität mit bestehenden Ethereum-Werkzeugen, -Wallets und -Bibliotheken. Dadurch funktionieren MetaMask, Hardhat, Foundry, ethers.js und alle gängigen EVM-Werkzeuge ohne Anpassung.

Für Post-Quanten-Sicherheit innerhalb der EVM:

* Verwenden Sie das **PQC-Verify-Precompile** (`0x0000...0A01`), um ML-DSA-87-Signaturen on-chain aus Solidity heraus zu verifizieren. Siehe [EVM-Precompiles](/developer-guide/evm-precompiles).
* **Cross-VM-Nachrichten** von der EVM zu CosmWasm oder SVM können auf der Cosmos-SDK-Transaktionsebene PQC-signiert werden.
* Konten können optional PQC-öffentliche Schlüssel über `x/pqc` für hybride Sicherheit registrieren.

---

## Benutzerdefinierter `qor_`-Namespace {#custom-qor_-namespace}

QoreChain erweitert das JSON-RPC um einen `qor_`-Namespace für chain-spezifische Abfragen:

| Methode                     | Beschreibung                                                      |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Prüfen, ob ein Konto einen registrierten PQC-öffentlichen Schlüssel hat |
| `qor_getAIStats`            | KI-Engine-Statistiken abrufen (Anomaliezahlen, Risikoverteilung)  |
| `qor_getCrossVMMessage`     | Status einer Cross-VM-Nachricht anhand der ID abfragen            |
| `qor_getPoolClassification` | Validator-Pool-Klassifikation abrufen (RPoS/DPoS/PoS)             |
| `qor_getReputationScore`    | Reputationswert eines Validators abfragen                         |
| `qor_getAbstractAccount`    | Konfiguration eines abstrakten Kontos abrufen                     |

Beispiel mit `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Nächste Schritte

* [EVM-Precompiles](/developer-guide/evm-precompiles) — Zugriff auf PQC-, KI- und Cross-VM-Funktionen aus Solidity
* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — CosmWasm- und SVM-Contracts von der EVM aus aufrufen
* [Account Abstraction](/developer-guide/account-abstraction) — Programmierbare Konten mit Session-Schlüsseln
