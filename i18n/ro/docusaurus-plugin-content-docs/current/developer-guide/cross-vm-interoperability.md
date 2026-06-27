---
slug: /developer-guide/cross-vm-interoperability
title: Interoperabilitate între VM-uri
sidebar_label: Interoperabilitate între VM-uri
sidebar_position: 5
---

# Interoperabilitate între VM-uri

**Arhitectura triple-VM** a QoreChain (EVM, CosmWasm, SVM) permite contractelor inteligente de pe orice mașină virtuală să comunice cu contracte de pe orice altă VM. Modulul `x/crossvm` oferă atât căi de mesaje sincrone, cât și asincrone.

:::note
Endpoint-urile de mai jos folosesc implicit un nod local. Pe mainnet, folosește endpoint-urile RPC **`qorechain-vladi`** (Cosmos RPC **26657**, EVM JSON-RPC **8545**); testnet-ul este **`qorechain-diana`**.
:::

---

## Prezentare generală a arhitecturii

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Cale             | Direcție        | Sincronizare     | Mecanism                        |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Sincronă**     | EVM către CosmWasm | Aceeași tranzacție | Precompile la `0x0000...0901`   |
| **Asincronă**    | CosmWasm către EVM | Blocul următor | `MsgCrossVMCall` prin EndBlocker |
| **Asincronă**    | SVM către orice VM | Blocul următor | `MsgCrossVMCall` prin EndBlocker |
| **Asincronă**    | Orice către SVM | Blocul următor   | `MsgCrossVMCall` prin EndBlocker |

---

## Calea sincronă (EVM către CosmWasm)

Calea sincronă folosește un **precompile** EVM la adresa `0x0000000000000000000000000000000000000901`. Acest lucru permite contractelor Solidity să apeleze contracte CosmWasm și să primească un răspuns în cadrul aceleiași tranzacții.

### Exemplu Solidity

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

Precompile-ul execută imediat contractul CosmWasm și returnează rezultatul. Cost de gaz: **50.000 de bază + costul execuției**.

---

## Calea asincronă

Toate celelalte direcții între VM-uri folosesc coada de mesaje asincronă. Mesajele sunt trimise într-un bloc și procesate de **EndBlocker** în blocul următor.

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

## Ciclul de viață al unui mesaj

Fiecare mesaj între VM-uri trece printr-un set definit de stări:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Stare         | Descriere                                                 |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Mesaj acceptat în coadă                                   |
| **Pending**   | În așteptarea execuției în următoarea trecere EndBlocker  |
| **Executed**  | Contractul țintă a fost apelat cu succes; răspuns înregistrat |
| **Failed**    | Execuția contractului țintă a fost anulată (revert); eroare înregistrată |
| **Timed Out** | Mesajul a depășit `queue_timeout_blocks` fără execuție    |

---

## Parametri

| Parametru              | Valoare      | Descriere                                      |
| ---------------------- | ------------ | ---------------------------------------------- |
| `max_message_size`     | 65.536 octeți | Dimensiunea maximă a payload-ului per mesaj   |
| `max_queue_size`       | 1.000        | Numărul maxim de mesaje în așteptare în coadă  |
| `queue_timeout_blocks` | 100          | Blocuri înainte ca un mesaj neprocesat să expire |

---

## Evenimente

Modulul `x/crossvm` emite următoarele evenimente:

| Eveniment          | Atribute                                                            | Descriere                             |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Mesaj nou între VM-uri trimis         |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Mesaj executat (succes sau eșec)      |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Mesaj expirat fără execuție           |

Abonează-te la evenimente prin WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Interogarea mesajelor

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

### Formatul răspunsului

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

## Considerații de proiectare

**Atomicitate:** Apelurile sincrone (EVM către CosmWasm prin precompile) sunt atomice — dacă oricare parte este anulată (revert), întreaga tranzacție este anulată. Apelurile asincrone **nu sunt atomice** între blocuri; proiectează-ți contractele astfel încât să gestioneze cu eleganță stările `Failed` și `Timed Out`.

**Ordonare:** Mesajele din coadă sunt procesate FIFO în cadrul fiecărei treceri EndBlocker. Nu există o ordonare garantată între diferitele VM-uri sursă.

**Codificarea payload-ului:** Formatul payload-ului depinde de VM-ul țintă:

* **Ținte EVM:** apeluri de funcții codificate ABI
* **Ținte CosmWasm:** mesaje execute codificate JSON
* **Ținte SVM:** date de instrucțiuni BPF codificate hex

---

## Pașii următori

* [Precompile EVM](/developer-guide/evm-precompiles) — Precompile-ul sincron CrossVM și alte precompile-uri personalizate
* [Dezvoltare EVM](/developer-guide/evm-development) — Dezvoltare Solidity pe QoreChain
* [Dezvoltare CosmWasm](/developer-guide/cosmwasm-development) — Dezvoltare de contracte Rust/Wasm
* [Dezvoltare SVM](/developer-guide/svm-development) — Implementarea programelor BPF
