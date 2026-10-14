---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM-Interoperabilität
sidebar_label: Cross-VM-Interoperabilität
sidebar_position: 5
---

# Cross-VM-Interoperabilität

Die **Triple-VM-Architektur** von QoreChain (EVM, CosmWasm, SVM) ist dafür ausgelegt, dass Smart-Contracts auf jeder virtuellen Maschine mit Contracts auf jeder anderen VM kommunizieren können. Das Modul `x/crossvm` stellt eine Aufrufnachricht mit einem Pfad innerhalb derselben Transaktion und einem Warteschlangenpfad bereit.

:::caution Was heute funktioniert
Cross-VM-Aufrufe sind nur so verfügbar wie ihre Ziel-Lane:

* `MsgCrossVMCall` ist im **Mainnet durch den Circuit Breaker abgeschaltet** (`qorechaind query circuit disabled-list`); im Testnet ist sie aktiviert.
* Die **SVM-Lane ist für Transaktionen in beiden Netzwerken deaktiviert**, daher kann ein SVM-Teil nicht ausgeführt werden.
* **CosmWasm-Upload und -Instanziierung sind in beiden Netzwerken zugriffsbeschränkt**, und das Mainnet hat keinen gespeicherten Contract-Code, daher gibt es noch keinen CosmWasm-Contract, der aufgerufen werden könnte.
* Das synchrone **EVM-Precompile ist nicht aktiv** (siehe unten).

Die REST-Routen des Moduls (`/qorechain/crossvm/v1/...`) werden vom öffentlichen Gateway nicht bereitgestellt; lies Nachrichten mit der CLI oder einem gRPC-/ABCI-Query-Client.
:::

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
| **Synchron**     | EVM zu CosmWasm | Gleiche Transaktion | Precompile bei `0x0000...0901` (noch nicht aktiv, siehe unten) |
| **Nachricht, Standard** | Beliebige VM zu beliebiger anderer VM | Gleiche Transaktion | `MsgCrossVMCall`; der Aufruf wird sofort ausgeführt, und ein Fehler setzt die gesamte Transaktion zurück |
| **Nachricht, in Warteschlange**  | Beliebige VM zu beliebiger anderer VM | Nächster Block (oder später) | `MsgCrossVMCall` mit gesetztem `async`; die Nachricht wartet in der Warteschlange |

---

## Synchroner Pfad (EVM zu CosmWasm)

Der synchrone Pfad verwendet ein EVM-**Precompile** an der Adresse `0x0000000000000000000000000000000000000901`. Er soll es Solidity-Contracts ermöglichen, CosmWasm-Contracts aufzurufen und innerhalb derselben Transaktion eine Antwort zu erhalten.

:::warning Weder im Mainnet noch im Testnet aktiv
Das CrossVM-Bridge-Precompile ist auf `qorechain-vladi` und `qorechain-diana` **nicht aktiv**: Ein Aufruf von `0x…0901` ist erfolgreich und liefert leere Daten. Es wird in seiner jetzigen Form nicht aktiviert; es wird neu aufgebaut, sodass ein Revert im aufrufenden Contract auch die CosmWasm-Seite rückgängig macht, Wertübertragungen abgelehnt werden, EVM-zu-EVM-Re-Entry verweigert wird und der Cross-VM-Circuit-Breaker greift. Das Beispiel unten zeigt nur die beabsichtigte Form. Siehe [EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status).
:::

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

Sobald aktiv, führt das Precompile den CosmWasm-Contract sofort aus und gibt das Ergebnis zurück. Der aktuelle Node dekodiert die Calldata als `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`; die ABI kann sich mit dem Neuaufbau ändern. Gas-Kosten: **50.000 Basis + 4 pro Eingabe-Byte + Ausführungskosten**.

---

## Nachrichtenpfad (`MsgCrossVMCall`)

Andere Cross-VM-Aufrufe verwenden die Transaktion `MsgCrossVMCall`. Die Chain ermittelt die Quell-Lane aus dem Absender, daher enthält die Nachricht nur die Ziel-VM, den Ziel-Contract, die Payload und optionale Mittel. Standardmäßig wird der Aufruf sofort innerhalb der Transaktion ausgeführt, und die gesamte Transaktion wird zurückgesetzt, wenn das Ziel fehlschlägt. Mit dem Flag `async` wird die Nachricht stattdessen in die Warteschlange gestellt und vom End-Block-Warteschlangendurchlauf des Moduls in einem späteren Block verarbeitet (siehe den Lebenszyklus unten). Wie oben erwähnt, ist diese Nachricht im Mainnet abgeschaltet.

### CLI

`tx crossvm call` erhält die Ziel-VM (`evm`, `cosmwasm` oder `svm`) und den Ziel-Contract als Positionsargumente, die Payload als Hex:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Weitere Flags: `--funds <coins>` (nur bei CosmWasm-Zielen) und `--async`, um den Aufruf in die Warteschlange zu stellen, statt ihn sofort auszuführen. Signiere und sende `tx.json` mit `tx pqc cosign` (siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)); die Gebühren-Untergrenze beträgt 0.1 uqor pro Gas.

:::caution Im Mainnet deaktiviert, und die CLI-Form benötigt eine Korrektur
`MsgCrossVMCall` ist im Mainnet durch den Circuit Breaker abgeschaltet. In den aktuellen Release-Binaries baut `tx crossvm call` außerdem eine Nachricht, die die eigene Validierung der Nachricht nicht besteht (die Quell-VM bleibt leer), daher ist der Befehl hier nur als Referenz dokumentiert.
:::

---

## Nachrichten-Lebenszyklus

Jede Cross-VM-Nachricht in der Warteschlange durchläuft eine definierte Reihe von Zuständen:

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
| `enabled`              | `true`       | Schalter auf Modulebene (die Aufrufnachricht selbst ist im Mainnet separat abgeschaltet) |
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

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Noch nicht bereitgestellt:** Kein veröffentlichter Node-Build stellt den JSON-RPC-Namespace `qor_` bereit, daher liefert dieser Aufruf heute an jedem öffentlichen Endpunkt `-32601` (Methode nicht gefunden). Siehe [den Namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

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

**Atomarität:** Synchrone Aufrufe (EVM zu CosmWasm über Precompile) sollen atomar sein, sodass die gesamte Transaktion zurückgesetzt wird, wenn eine der beiden Seiten zurückgesetzt wird. Das aktuelle Precompile garantiert dies noch nicht, was ein Grund dafür ist, dass es nicht aktiv ist (siehe oben). Asynchrone Aufrufe sind über Blöcke hinweg **nicht atomar**; gestalten Sie Ihre Contracts so, dass sie die Zustände `Failed` und `Timed Out` ordnungsgemäß behandeln.

**Reihenfolge:** Nachrichten in der Warteschlange werden innerhalb jedes EndBlocker-Durchlaufs nach dem FIFO-Prinzip verarbeitet. Es gibt keine garantierte Reihenfolge über verschiedene Quell-VMs hinweg.

**Payload-Kodierung:** Das Payload-Format hängt von der Ziel-VM ab:

* **EVM-Ziele:** ABI-kodierte Funktionsaufrufe
* **CosmWasm-Ziele:** JSON-kodierte Execute-Nachrichten
* **SVM-Ziele:** Hex-kodierte BPF-Instruktionsdaten

---

## Nächste Schritte

* [EVM-Precompiles](/developer-guide/evm-precompiles) — Status des synchronen CrossVM-Precompiles und der anderen geplanten Precompiles
* [EVM-Entwicklung](/developer-guide/evm-development) — Solidity-Entwicklung auf QoreChain
* [CosmWasm-Entwicklung](/developer-guide/cosmwasm-development) — Rust/Wasm-Contract-Entwicklung
* [SVM-Entwicklung](/developer-guide/svm-development) — BPF-Programmbereitstellung
