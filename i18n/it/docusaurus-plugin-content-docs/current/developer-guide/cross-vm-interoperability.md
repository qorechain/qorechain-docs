---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM Interoperability
sidebar_label: Cross-VM Interoperability
sidebar_position: 5
---

# Cross-VM Interoperability

L'**architettura triple-VM** di QoreChain (EVM, CosmWasm, SVM) consente agli smart contract su qualsiasi macchina virtuale di comunicare con i contratti su qualsiasi altra VM. Il modulo `x/crossvm` fornisce percorsi di messaggistica sia sincroni che asincroni.

:::note
Gli endpoint seguenti utilizzano per impostazione predefinita un nodo locale. Sulla mainnet, usa gli endpoint RPC di **`qorechain-vladi`** (Cosmos RPC **26657**, EVM JSON-RPC **8545**); la testnet è **`qorechain-diana`**.
:::

---

## Panoramica dell'architettura

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Percorso         | Direzione       | Tempistica       | Meccanismo                      |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Sincrono**     | EVM verso CosmWasm | Stessa transazione | Precompile a `0x0000...0901`  |
| **Asincrono**    | CosmWasm verso EVM | Blocco successivo | `MsgCrossVMCall` via EndBlocker |
| **Asincrono**    | SVM verso qualsiasi VM | Blocco successivo | `MsgCrossVMCall` via EndBlocker |
| **Asincrono**    | Qualsiasi verso SVM | Blocco successivo | `MsgCrossVMCall` via EndBlocker |

---

## Percorso sincrono (EVM verso CosmWasm)

Il percorso sincrono utilizza una **precompile** EVM all'indirizzo `0x0000000000000000000000000000000000000901`. Questo consente ai contratti Solidity di chiamare i contratti CosmWasm e di ricevere una risposta all'interno della stessa transazione.

### Esempio Solidity

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

La precompile esegue il contratto CosmWasm immediatamente e restituisce il risultato. Costo del gas: **50.000 base + costo di esecuzione**.

---

## Percorso asincrono

Tutte le altre direzioni cross-VM utilizzano la coda di messaggi asincrona. I messaggi vengono inviati in un blocco ed elaborati dall'**EndBlocker** nel blocco successivo.

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

## Ciclo di vita del messaggio

Ogni messaggio cross-VM attraversa un insieme definito di stati:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Stato         | Descrizione                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Messaggio accettato nella coda                            |
| **Pending**   | In attesa di esecuzione nel passaggio successivo dell'EndBlocker |
| **Executed**  | Contratto target chiamato con successo; risposta registrata |
| **Failed**    | L'esecuzione del contratto target è stata annullata (revert); errore registrato |
| **Timed Out** | Il messaggio ha superato `queue_timeout_blocks` senza esecuzione |

---

## Parametri

| Parametro              | Valore       | Descrizione                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `max_message_size`     | 65.536 byte  | Dimensione massima del payload per messaggio   |
| `max_queue_size`       | 1.000        | Numero massimo di messaggi in attesa nella coda |
| `queue_timeout_blocks` | 100          | Blocchi prima che un messaggio non elaborato vada in timeout |

---

## Eventi

Il modulo `x/crossvm` emette i seguenti eventi:

| Evento             | Attributi                                                          | Descrizione                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Nuovo messaggio cross-VM inviato      |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Messaggio eseguito (successo o fallimento) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Messaggio scaduto senza esecuzione    |

Sottoscrivi gli eventi via WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Interrogazione dei messaggi

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

### Formato della risposta

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

## Considerazioni di progettazione

**Atomicità:** le chiamate sincrone (EVM verso CosmWasm tramite precompile) sono atomiche — se una delle due parti effettua un revert, l'intera transazione viene annullata. Le chiamate asincrone **non sono atomiche** tra blocchi diversi; progetta i tuoi contratti per gestire correttamente gli stati `Failed` e `Timed Out`.

**Ordinamento:** i messaggi nella coda vengono elaborati FIFO all'interno di ogni passaggio dell'EndBlocker. Non è garantito alcun ordinamento tra diverse VM di origine.

**Codifica del payload:** il formato del payload dipende dalla VM target:

* **Target EVM:** chiamate di funzione codificate in ABI
* **Target CosmWasm:** messaggi execute codificati in JSON
* **Target SVM:** dati delle istruzioni BPF codificati in esadecimale

---

## Prossimi passi

* [Precompile EVM](/developer-guide/evm-precompiles) — La precompile CrossVM sincrona e altre precompile personalizzate
* [Sviluppo EVM](/developer-guide/evm-development) — Sviluppo Solidity su QoreChain
* [Sviluppo CosmWasm](/developer-guide/cosmwasm-development) — Sviluppo di contratti Rust/Wasm
* [Sviluppo SVM](/developer-guide/svm-development) — Distribuzione di programmi BPF
