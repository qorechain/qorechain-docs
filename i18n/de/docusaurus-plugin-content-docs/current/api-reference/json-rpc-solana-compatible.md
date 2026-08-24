---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana-kompatibel
sidebar_label: JSON-RPC — Solana-kompatibel
sidebar_position: 4
---

# JSON-RPC — Solana-kompatibel

QoreChain stellt über seine SVM-Laufzeitumgebung (Solana Virtual Machine) eine Solana-kompatible JSON-RPC-Schnittstelle bereit, die es bestehenden Solana-Tools und -SDKs ermöglicht, nativ mit QoreChain zu interagieren.

:::caution Die SVM-Transaktionsübermittlung ist derzeit deaktiviert
Seit Chain-Version v3.1.89 (22. August) ist die SVM-Ausführungsebene infolge eines Vorfalls **netzwerkweit für die Transaktionsübermittlung deaktiviert** — jede Transaktion liefert `code 11, "SVM module is disabled"`. Dies gilt netzwerkweit, nicht nur an den öffentlichen reinen Lese-Endpunkten. Lese-Methoden aus der Tabelle unten (z. B. `getBalance`, `getAccountInfo`) können weiterhin antworten, aber versuchen Sie keine produktive Integration, die SVM-Transaktionen übermittelt, bevor die Ebene wieder geöffnet ist.
:::

## Verbindung

| Transport | Adresse |
| --------- | ------------------------- |
| HTTP (eigener Node) | `http://127.0.0.1:8899`   |
| HTTPS (öffentlich, Mainnet, nur lesend) | `https://svm.qore.host` |
| HTTPS (öffentlich, Testnet, nur lesend) | `https://svm-testnet.qore.host` |

Der JSON-RPC-Server wird **von `qorechaind start` gestartet** und ist **standardmäßig aktiviert**, er lauscht auf `127.0.0.1:8899`. Konfiguriert wird er über einen `[svm-rpc]`-Abschnitt in `app.toml` (`enable` + `address`). Ein frisch gestarteter Node stellt diese Schnittstelle bereits bereit — es ist kein zusätzlicher Prozess erforderlich. Die öffentlichen Endpunkte sind **nur lesend** (die Transaktionsübermittlung ist am Edge deaktiviert).

:::note
Seit Chain-Version **v3.1.82** liefert die SVM-Schnittstelle das **native QOR-Guthaben** des Kontos — dasselbe vereinheitlichte Guthaben, das auch über die Cosmos- und EVM-Schnittstellen sichtbar ist — angegeben in **Lamports** (9 Dezimalstellen; **1 uqor = 1.000 Lamports**). Siehe [Natives QOR auf der SVM-Schnittstelle](/developer-guide/svm-development#native-qor).
:::

---

## Methoden

| Methode                              | Parameter               | Beschreibung                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (Base58-String) | Liefert Kontodaten, Owner, Lamports und Executable-Flag     |
| `getBalance`                        | `pubkey` (Base58-String) | Liefert das native QOR-Guthaben in Lamports für den angegebenen Public Key |
| `getSignaturesForAddress`           | `address` (Base58-String) | Liefert Transaktionssignaturen, an denen die Adresse beteiligt ist (Einzahlungserkennung) |
| `getSlot`                           | keine                     | Liefert die aktuelle Slot-Nummer                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (Integer)   | Liefert das Mindestguthaben für die Rent-Befreiung bei gegebener Datengröße |
| `getVersion`                        | keine                     | Liefert die Node-Softwareversion                              |
| `getHealth`                         | keine                     | Liefert den Health-Status des Node (`"ok"`, wenn gesund)                 |

---

## Antwortformat

Alle Antworten folgen der JSON-RPC-2.0-Spezifikation. Antworten, die sich auf On-Chain-Zustand beziehen, enthalten ein `context`-Objekt mit dem aktuellen `slot`:

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

Der Versionsstring `1.18.0-qorechain` zeigt die Kompatibilität mit der Solana-1.18.0-RPC-Schnittstelle an, die auf der QoreChain-SVM-Laufzeitumgebung läuft.

---

## @solana/web3.js-Integration

Bestehende Solana-Anwendungen können sich mit QoreChain verbinden, indem das `Connection`-Objekt auf den lokalen SVM-Endpunkt zeigt:

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

- **Adressformat**: SVM-Konten verwenden Base58-kodierte Public Keys (Standard-Solana-Format), nicht das von den nativen Cosmos-SDK-Modulen verwendete `qor1`-Bech32-Präfix.
- **Cross-VM-Bridging**: Um Assets zwischen der EVM- und der SVM-Laufzeitumgebung zu bewegen, verwenden Sie das Cross-VM-Modul (`x/crossvm`). Siehe [Transaktionsbefehle](/cli-reference/transaction-commands) für die `crossvm call`-Syntax.
- **Programm-Deployment**: Deployen Sie BPF-Programme über die CLI (`qorechaind tx svm deploy-program`) oder programmatisch über die SVM-Laufzeitumgebung.
- **Compute-Budget**: Die SVM-Laufzeitumgebung erzwingt standardmäßig ein Compute-Budget von 1.400.000 Compute-Units pro Transaktion. Dies ist über Modulparameter konfigurierbar.
