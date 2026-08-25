---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana-kompatibel
sidebar_label: JSON-RPC — Solana-kompatibel
sidebar_position: 4
---

# JSON-RPC — Solana-kompatibel

QoreChain bietet über seine SVM-Runtime (Solana Virtual Machine) eine Solana-kompatible JSON-RPC-Schnittstelle, die es bestehenden Solana-Tools und -SDKs ermöglicht, nativ mit QoreChain zu interagieren.

:::caution SVM-Transaktionsübermittlung derzeit deaktiviert
Seit Chain-Version v3.1.89 (22. August) ist die SVM-Ausführungs-Lane infolge eines Vorfalls **netzwerkweit für die Transaktionsübermittlung deaktiviert** — jede Transaktion liefert `code 11, "SVM module is disabled"`. Dies gilt netzwerkweit, nicht nur an den öffentlichen Nur-Lese-Endpunkten. Lesende Methoden in der Tabelle unten (z. B. `getBalance`, `getAccountInfo`) können weiterhin antworten, aber versuchen Sie keine Live-Integration, die SVM-Transaktionen übermittelt, bis die Lane wieder geöffnet wird — dies ist eine zur Kompilierzeit festgelegte Deaktivierung, kein Laufzeitparameter, kann also nicht per Governance-Abstimmung wieder aktiviert werden; es wird erwartet, dass sie deaktiviert bleibt, bis ein externes Audit sie freigibt.
:::

## Verbindung

| Transport | Adresse |
| --------- | ------------------------- |
| HTTP (eigener Node) | `http://127.0.0.1:8899`   |
| HTTPS (öffentlich, Mainnet, nur lesend) | `https://svm.qore.host` |
| HTTPS (öffentlich, Testnet, nur lesend) | `https://svm-testnet.qore.host` |

Der JSON-RPC-Server wird **durch `qorechaind start` gestartet** und ist **standardmäßig aktiviert**, lauscht auf `127.0.0.1:8899`. Er wird über einen `[svm-rpc]`-Abschnitt in `app.toml` konfiguriert (`enable` + `address`). Ein frisch gestarteter Node bedient diese Schnittstelle bereits — es ist kein zusätzlicher Prozess erforderlich. Die öffentlichen Endpunkte sind **nur lesend** (die Transaktionsübermittlung ist am Rand deaktiviert).

:::note
Seit Chain-Version **v3.1.82** liefert die SVM-Schnittstelle das native **QOR-Guthaben** des Accounts — dasselbe vereinheitlichte Guthaben, das auch über die Cosmos- und EVM-Schnittstellen sichtbar ist — angegeben in **Lamports** (9 Dezimalstellen; **1 uqor = 1.000 Lamports**). Siehe [Natives QOR auf der SVM-Schnittstelle](/developer-guide/svm-development#native-qor).
:::

---

## Methoden

| Methode                              | Parameter               | Beschreibung                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (Base58-String) | Liefert Account-Daten, Owner, Lamports und Executable-Flag     |
| `getBalance`                        | `pubkey` (Base58-String) | Liefert das native QOR-Guthaben in Lamports für den angegebenen Public Key |
| `getSignaturesForAddress`           | `address` (Base58-String) | Liefert Transaktionssignaturen, die die Adresse betreffen (Einzahlungserkennung) |
| `getSlot`                           | keine                     | Liefert die aktuelle Slot-Nummer                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (Integer)   | Liefert das Mindestguthaben für Rent-Befreiung bei gegebener Datengröße |
| `getVersion`                        | keine                     | Liefert die Node-Softwareversion                              |
| `getHealth`                         | keine                     | Liefert den Health-Status des Nodes (`"ok"`, falls gesund)                 |

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

Der Versionsstring `1.18.0-qorechain` zeigt die Kompatibilität mit der Solana-1.18.0-RPC-Schnittstelle an, die auf der QoreChain-SVM-Runtime läuft.

---

## @solana/web3.js-Integration

Bestehende Solana-Anwendungen können sich mit QoreChain verbinden, indem das `Connection`-Objekt auf den lokalen SVM-Endpunkt zeigt:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Version prüfen
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Guthaben abrufen
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Slot abrufen
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Account-Info abrufen
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## Hinweise

- **Adressformat**: SVM-Accounts verwenden Base58-kodierte Public Keys (Standard-Solana-Format), nicht das `qor1`-Bech32-Präfix der nativen Cosmos-SDK-Module.
- **Cross-VM-Bridging**: Um Assets zwischen der EVM- und der SVM-Runtime zu bewegen, wird das Cross-VM-Modul (`x/crossvm`) verwendet. Siehe die [Transaktionsbefehle](/cli-reference/transaction-commands) für die `crossvm call`-Syntax.
- **Programm-Deployment**: BPF-Programme werden über die CLI (`qorechaind tx svm deploy-program`) oder programmatisch über die SVM-Runtime deployt.
- **Compute-Budget**: Die SVM-Runtime erzwingt standardmäßig ein Compute-Budget von 1.400.000 Compute-Einheiten pro Transaktion. Dies ist über Modulparameter konfigurierbar.
