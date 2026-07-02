---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana-kompatibel
sidebar_label: JSON-RPC — Solana-kompatibel
sidebar_position: 4
---

# JSON-RPC — Solana-kompatibel

QoreChain stellt über seine SVM-Laufzeitumgebung (Solana Virtual Machine) eine Solana-kompatible JSON-RPC-Schnittstelle bereit, sodass bestehende Solana-Tools und -SDKs nativ mit QoreChain interagieren können.

## Verbindung

| Transport | Adresse |
| --------- | ------------------------- |
| HTTP (eigener Node) | `http://127.0.0.1:8899`   |
| HTTPS (öffentlich, Mainnet, nur lesend) | `https://svm.qore.host` |
| HTTPS (öffentlich, Testnet, nur lesend) | `https://svm-testnet.qore.host` |

Der JSON-RPC-Server wird **von `qorechaind start` gestartet** und ist **standardmäßig aktiviert**; er lauscht auf `127.0.0.1:8899`. Er wird über einen `[svm-rpc]`-Abschnitt in `app.toml` konfiguriert (`enable` + `address`). Ein frisch gestarteter Node stellt diese Schnittstelle bereits bereit — es ist kein zusätzlicher Prozess erforderlich. Die öffentlichen Endpunkte sind **nur lesend** (das Einreichen von Transaktionen ist am Edge deaktiviert).

:::note
Seit Chain-Version **v3.1.82** liefert die SVM-Schnittstelle das **native QOR-Guthaben** des Kontos — dieselben vereinheitlichten Mittel, die auch über die Cosmos- und EVM-Schnittstellen sichtbar sind — denominiert in **lamports** (9 Dezimalstellen; **1 uqor = 1.000 lamports**). Siehe [Natives QOR auf der SVM-Schnittstelle](/developer-guide/svm-development#native-qor).
:::

---

## Methoden

| Methode                             | Parameter                | Beschreibung                                                   |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58-String) | Gibt Kontodaten, Owner, lamports und das Executable-Flag zurück |
| `getBalance`                        | `pubkey` (base58-String) | Gibt das native QOR-Guthaben in lamports für den angegebenen öffentlichen Schlüssel zurück |
| `getSignaturesForAddress`           | `address` (base58-String) | Gibt Transaktionssignaturen zurück, an denen die Adresse beteiligt ist (Einzahlungserkennung) |
| `getSlot`                           | keine                    | Gibt die aktuelle Slot-Nummer zurück                           |
| `getMinimumBalanceForRentExemption` | `dataLength` (Integer)   | Gibt das Mindestguthaben für die Rent-Befreiung bei gegebener Datengröße zurück |
| `getVersion`                        | keine                    | Gibt die Softwareversion des Nodes zurück                      |
| `getHealth`                         | keine                    | Gibt den Gesundheitsstatus des Nodes zurück (`"ok"`, wenn gesund) |

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

Bestehende Solana-Anwendungen können sich mit QoreChain verbinden, indem sie das `Connection`-Objekt auf den lokalen SVM-Endpunkt richten:

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

- **Adressformat**: SVM-Konten verwenden base58-codierte öffentliche Schlüssel (Standard-Solana-Format), nicht das `qor1`-Bech32-Präfix, das von den nativen Cosmos SDK-Modulen verwendet wird.
- **Cross-VM-Bridging**: Um Assets zwischen den EVM- und SVM-Laufzeitumgebungen zu verschieben, verwenden Sie das Cross-VM-Modul (`x/crossvm`). Siehe die [Transaktionsbefehle](/cli-reference/transaction-commands) für die `crossvm call`-Syntax.
- **Programm-Deployment**: Deployen Sie BPF-Programme über die CLI (`qorechaind tx svm deploy-program`) oder programmatisch über die SVM-Laufzeitumgebung.
- **Compute-Budget**: Die SVM-Laufzeitumgebung erzwingt standardmäßig ein Compute-Budget von 1.400.000 Compute Units pro Transaktion. Dies ist über Modulparameter konfigurierbar.
