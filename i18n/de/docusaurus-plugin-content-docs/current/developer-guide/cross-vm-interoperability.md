---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM Interoperability
sidebar_label: Cross-VM Interoperability
sidebar_position: 5
---

# Cross-VM-Interoperabilität

Die **Triple-VM-Architektur** von QoreChain (EVM, CosmWasm, SVM) ermöglicht es Smart-Contracts auf jeder virtuellen Maschine, mit Contracts auf jeder anderen VM zu kommunizieren. Das Modul `x/crossvm` stellt sowohl synchrone als auch asynchrone Messaging-Pfade bereit.

:::note
Die folgenden Endpunkte verweisen standardmäßig auf einen lokalen Knoten. Verwenden Sie im Mainnet die **`qorechain-vladi`**-RPC-Endpunkte (Cosmos RPC **26657**, EVM JSON-RPC **8545**); das Testnet ist **`qorechain-diana`**.
:::

---

## Architekturüberblick

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Pfad             | Richtung        | Zeitpunkt        | Mechanismus                     |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Synchron**     | EVM zu CosmWasm | Gleiche Transaktion | Precompile bei `0x0000...0901`  |
| **Asynchron**    | CosmWasm zu EVM | Nächster Block   | `MsgCrossVMCall` über EndBlocker |
| **Asynchron**    | SVM zu beliebiger VM | Nächster Block | `MsgCrossVMCall` über EndBlocker |
| **Asynchron**    | Beliebig zu SVM | Nächster Block   | `MsgCrossVMCall` über EndBlocker |

---

## Synchroner Pfad (EVM zu CosmWasm)

Der synchrone Pfad verwendet ein EVM-**Precompile** an der Adresse `0x0000000000000000000000000000000000000901`. Dies ermöglicht es Solidity-Contracts, CosmWasm-Contracts aufzurufen und innerhalb derselben Transaktion eine Antwort zu erhalten.

### Solidity-Beispiel

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

Das Precompile führt den CosmWasm-Contract sofort aus und gibt das Ergebnis zurück. Gas-Kosten: **50.000 Basis + Ausführungskosten**.

---

## Asynchroner Pfad

Alle anderen Cross-VM-Richtungen verwenden die asynchrone Nachrichtenwarteschlange. Nachrichten werden in einem Block eingereicht und vom **EndBlocker** im nächsten Block verarbeitet.

### CLI

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## Nachrichten-Lebenszyklus

Jede Cross-VM-Nachricht durchläuft eine definierte Reihe von Zuständen:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Zustand       | Beschreibung                                              |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Nachricht in die Warteschlange aufgenommen                |
| **Pending**   | Wartet auf die Ausführung im nächsten EndBlocker-Durchlauf |
| **Executed**  | Ziel-Contract erfolgreich aufgerufen; Antwort aufgezeichnet |
| **Failed**    | Ausführung des Ziel-Contracts zurückgesetzt; Fehler aufgezeichnet |
| **Timed Out** | Nachricht hat `queue_timeout_blocks` ohne Ausführung überschritten |

---

## Parameter

| Parameter              | Wert         | Beschreibung                                   |
| ---------------------- | ------------ | ---------------------------------------------- |
| `max_message_size`     | 65.536 bytes | Maximale Payload-Größe pro Nachricht           |
| `max_queue_size`       | 1.000        | Maximale Anzahl ausstehender Nachrichten in der Warteschlange |
| `queue_timeout_blocks` | 100          | Blöcke, bevor eine unverarbeitete Nachricht abläuft |

---

## Events

Das Modul `x/crossvm` emittiert die folgenden Events:

| Event              | Attribute                                                          | Beschreibung                          |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Neue Cross-VM-Nachricht eingereicht   |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Nachricht ausgeführt (Erfolg oder Fehler) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Nachricht ohne Ausführung abgelaufen  |

Abonnieren Sie Events über WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Nachrichten abfragen

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Antwortformat

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Designüberlegungen

**Atomarität:** Synchrone Aufrufe (EVM zu CosmWasm über Precompile) sind atomar — wenn eine der beiden Seiten zurückgesetzt wird, wird die gesamte Transaktion zurückgesetzt. Asynchrone Aufrufe sind über Blöcke hinweg **nicht atomar**; gestalten Sie Ihre Contracts so, dass sie die Zustände `Failed` und `Timed Out` ordnungsgemäß behandeln.

**Reihenfolge:** Nachrichten in der Warteschlange werden innerhalb jedes EndBlocker-Durchlaufs nach dem FIFO-Prinzip verarbeitet. Es gibt keine garantierte Reihenfolge über verschiedene Quell-VMs hinweg.

**Payload-Kodierung:** Das Payload-Format hängt von der Ziel-VM ab:

* **EVM-Ziele:** ABI-kodierte Funktionsaufrufe
* **CosmWasm-Ziele:** JSON-kodierte Execute-Nachrichten
* **SVM-Ziele:** Hex-kodierte BPF-Instruktionsdaten

---

## Nächste Schritte

* [EVM-Precompiles](/developer-guide/evm-precompiles) — Das synchrone CrossVM-Precompile und andere benutzerdefinierte Precompiles
* [EVM-Entwicklung](/developer-guide/evm-development) — Solidity-Entwicklung auf QoreChain
* [CosmWasm-Entwicklung](/developer-guide/cosmwasm-development) — Rust/Wasm-Contract-Entwicklung
* [SVM-Entwicklung](/developer-guide/svm-development) — BPF-Programmbereitstellung
