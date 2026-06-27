---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana-kompatibel
sidebar_label: JSON-RPC — Solana-kompatibel
sidebar_position: 4
---

# JSON-RPC — Solana-kompatibel

QoreChain stellt über seine SVM-Laufzeitumgebung (Solana Virtual Machine) eine Solana-kompatible JSON-RPC-Schnittstelle bereit, die es bestehenden Solana-Werkzeugen und SDKs ermöglicht, nativ mit QoreChain zu interagieren.

## Verbindung

| Transport | Standardadresse           |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

Der JSON-RPC-Server wird **von `qorechaind start` gestartet** und ist **standardmäßig aktiviert**, wobei er auf `127.0.0.1:8899` lauscht. Er wird über einen Abschnitt `[svm-rpc]` in `app.toml` konfiguriert (`enable` + `address`). Ein frisch gestarteter Node stellt diese Schnittstelle bereits bereit — es ist kein zusätzlicher Prozess erforderlich.

:::note
Die Solana-kompatible JSON-RPC-Schnittstelle wird auf Port **8899** sowohl vom **`qorechain-vladi`**-Mainnet (live auf Chain-Version **v3.1.77**) als auch vom **`qorechain-diana`**-Testnet bereitgestellt. Die obige lokale Adresse gilt für einen Node, den Sie selbst betreiben; ersetzen Sie für den Fernzugriff den Mainnet- oder Testnet-Endpunkt Ihres Anbieters.
:::

---

## Methoden

| Methode                             | Parameter                | Beschreibung                                                          |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 string) | Gibt Kontodaten, Owner, Lamports und das Executable-Flag zurück     |
| `getBalance`                        | `pubkey` (base58 string) | Gibt den Kontostand in Lamports für den angegebenen Public Key zurück |
| `getSlot`                           | keine                    | Gibt die aktuelle Slot-Nummer zurück                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (integer)   | Gibt den Mindestkontostand für die Mietbefreiung bei gegebener Datengröße zurück |
| `getVersion`                        | keine                    | Gibt die Softwareversion des Nodes zurück                           |
| `getHealth`                         | keine                    | Gibt den Gesundheitsstatus des Nodes zurück (`"ok"`, wenn gesund)   |

---

## Antwortformat

Alle Antworten folgen der JSON-RPC-2.0-Spezifikation. Antworten, die sich auf On-Chain-State beziehen, enthalten ein `context`-Objekt mit dem aktuellen `slot`:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## Beispiele

### getAccountInfo

**Anfrage:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**Anfrage:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**Anfrage:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

Die Versionszeichenkette `1.18.0-qorechain` weist auf die Kompatibilität mit der RPC-Schnittstelle von Solana 1.18.0 hin, die auf der QoreChain-SVM-Laufzeitumgebung läuft.

---

## @solana/web3.js-Integration

Bestehende Solana-Anwendungen können sich mit QoreChain verbinden, indem sie das `Connection`-Objekt auf den lokalen SVM-Endpunkt ausrichten:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## Hinweise

- **Adressformat**: SVM-Konten verwenden base58-kodierte Public Keys (Standard-Solana-Format), nicht das `qor1`-Bech32-Präfix, das von den nativen Cosmos-SDK-Modulen verwendet wird.
- **VM-übergreifendes Bridging**: Um Assets zwischen EVM- und SVM-Laufzeitumgebungen zu verschieben, verwenden Sie das Cross-VM-Modul (`x/crossvm`). Siehe die [Transaktionsbefehle](/cli-reference/transaction-commands) für die `crossvm call`-Syntax.
- **Programmbereitstellung**: Stellen Sie BPF-Programme über die CLI (`qorechaind tx svm deploy-program`) oder programmatisch über die SVM-Laufzeitumgebung bereit.
- **Compute-Budget**: Die SVM-Laufzeitumgebung setzt standardmäßig ein Compute-Budget von 1.400.000 Compute-Einheiten pro Transaktion durch. Dies ist über Modulparameter konfigurierbar.
