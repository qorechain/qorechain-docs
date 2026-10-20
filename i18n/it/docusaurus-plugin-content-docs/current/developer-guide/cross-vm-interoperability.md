---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM Interoperability
sidebar_label: Cross-VM Interoperability
sidebar_position: 5
---

# Cross-VM Interoperability

L'**architettura triple-VM** di QoreChain (EVM, CosmWasm, SVM) è progettata per consentire agli smart contract su qualsiasi macchina virtuale di comunicare con i contratti su qualsiasi altra VM. Il modulo `x/crossvm` fornisce un messaggio di chiamata con un percorso nella stessa transazione e un percorso in coda.

:::caution Cosa funziona oggi
Le chiamate cross-VM sono disponibili solo quanto lo è la loro lane di destinazione:

* `MsgCrossVMCall` è **disattivato sulla mainnet** dal circuit breaker (`qorechaind query circuit disabled-list`); è abilitato sulla testnet.
* La **lane SVM è disabilitata** per le transazioni su entrambe le reti, quindi un tratto SVM non può essere eseguito.
* **Upload e instanziazione di CosmWasm sono soggetti ad autorizzazione** su entrambe le reti e la mainnet non ha alcun codice di contratto memorizzato, quindi non esiste ancora alcun contratto CosmWasm da chiamare.
* La **precompile EVM sincrona non è attiva** (vedi sotto). Una versione rinforzata è presente nel binario dalla v3.2.3, ma su nessuna delle due reti è attivata alcuna precompile.

Le route REST del modulo (`/qorechain/crossvm/v1/...`) non sono servite dal gateway pubblico; leggi i messaggi con la CLI o con un client di query gRPC/ABCI.
:::

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
| **Sincrono**     | EVM verso CosmWasm | Stessa transazione | Precompile a `0x0000...0901` (non ancora attiva, vedi sotto) |
| **Messaggio, predefinito** | Qualsiasi VM verso qualsiasi altra VM | Stessa transazione | `MsgCrossVMCall`; la chiamata viene eseguita immediatamente e un fallimento annulla l'intera transazione |
| **Messaggio, in coda**  | Qualsiasi VM verso qualsiasi altra VM | Blocco successivo (o oltre) | `MsgCrossVMCall` con `async` impostato; il messaggio attende nella coda |

---

## Percorso sincrono (EVM verso CosmWasm)

Il percorso sincrono utilizza una **precompile** EVM all'indirizzo `0x0000000000000000000000000000000000000901`. È progettata per consentire ai contratti Solidity di chiamare i contratti CosmWasm e di ricevere una risposta all'interno della stessa transazione.

:::warning Non attiva su mainnet né su testnet
La precompile del bridge CrossVM **non è attiva** su `qorechain-vladi` né su `qorechain-diana`: una chiamata a `0x…0901` riesce e restituisce dati vuoti. Il binario v3.2.3 include una versione rinforzata (rifiuta una `STATICCALL`, misura la sua chiamata annidata sul gas del frame chiamante e la registra nel journal in modo che un revert EVM annulli anche il lato CosmWasm, raggiunge solo destinazioni CosmWasm in allowlist e rispetta il circuit breaker cross-VM), ma viene eseguita solo quando un aggiornamento approvato dalla governance la aggiunge all'elenco attivo. L'esempio seguente mostra solo la forma prevista. Vedi [Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
:::

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

Una volta attiva, la precompile esegue il contratto CosmWasm immediatamente e restituisce il risultato. Il nodo attuale decodifica i calldata come `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`; l'ABI potrebbe ancora cambiare prima dell'attivazione. Costo del gas: **50.000 base + 4 per byte di input + costo di esecuzione**.

---

## Percorso tramite messaggio (`MsgCrossVMCall`)

Le altre chiamate cross-VM usano la transazione `MsgCrossVMCall`. La chain ricava la lane di origine dal mittente, quindi il messaggio contiene solo la VM di destinazione, il contratto di destinazione, il payload ed eventuali fondi. Per impostazione predefinita la chiamata viene eseguita immediatamente all'interno della transazione, e l'intera transazione viene annullata se la destinazione fallisce. Con il flag `async` il messaggio viene invece messo in coda e gestito dal passaggio sulla coda di fine blocco del modulo in un blocco successivo (vedi il ciclo di vita sotto). Come indicato sopra, questo messaggio è disattivato sulla mainnet.

### CLI

`tx crossvm call` accetta la VM di destinazione (`evm`, `cosmwasm` o `svm`) e il contratto di destinazione come argomenti posizionali, con il payload in esadecimale. La CLI non chiede la VM di origine: la chain ricava la lane del chiamante dallo stato e ignora il campo dichiarato (la CLI inserisce un segnaposto affinché il messaggio superi la propria validazione):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Altri flag: `--funds <coins>` (solo destinazioni CosmWasm) e `--async` per mettere in coda la chiamata invece di eseguirla subito. Firma e trasmetti `tx.json` con `tx pqc cosign` (vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing)); il floor delle commissioni è 0.1 uqor per gas. Una chiamata verso la lane del chiamante stesso viene rifiutata (dalla v3.2.3).

:::caution Disattivato sulla mainnet
`MsgCrossVMCall` è disattivato sulla mainnet dal circuit breaker, quindi oggi il comando non può riuscire lì. (Anche i binari di release precedenti alla v3.2.3 costruivano un messaggio che non superava la propria validazione perché la VM di origine era vuota; il binario v3.2.3 lo corregge.) Sulla testnet il messaggio è abilitato, ma le sue destinazioni CosmWasm e SVM non sono utilizzabili (vedi sopra), quindi si può raggiungere solo una destinazione EVM.
:::

---

## Ciclo di vita del messaggio

Ogni messaggio cross-VM in coda attraversa un insieme definito di stati:

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

Dalla v3.2.3 una chiamata in coda che fallisce viene annullata per intero: resta solo il suo record `Failed`, e i fondi allegati a una chiamata CosmWasm fallita non vengono più spostati nel contratto. Mentre il modulo è disabilitato, o `MsgCrossVMCall` è disattivato dal circuit breaker, la coda **non viene eseguita**: i messaggi in coda restano in attesa e scadono al loro timeout, a meno che l'interruttore non venga prima riattivato.

---

## Parametri

| Parametro              | Valore       | Descrizione                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | Interruttore a livello di modulo (il messaggio di chiamata in sé è disattivato separatamente sulla mainnet) |
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

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Non ancora servito:** nessuna build rilasciata del nodo serve il namespace JSON-RPC `qor_`, quindi oggi questa chiamata restituisce `-32601` (metodo non trovato) su ogni endpoint pubblico. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

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

**Atomicità:** le chiamate sincrone (EVM verso CosmWasm tramite precompile) sono progettate per essere atomiche, in modo che se una delle due parti effettua un revert l'intera transazione venga annullata. La precompile attuale non lo garantisce ancora, ed è uno dei motivi per cui non è attiva (vedi sopra). Le chiamate asincrone **non sono atomiche** tra blocchi diversi; progetta i tuoi contratti per gestire correttamente gli stati `Failed` e `Timed Out`.

**Ordinamento:** i messaggi nella coda vengono elaborati FIFO all'interno di ogni passaggio dell'EndBlocker. Non è garantito alcun ordinamento tra diverse VM di origine.

**Codifica del payload:** il formato del payload dipende dalla VM target:

* **Target EVM:** chiamate di funzione codificate in ABI
* **Target CosmWasm:** messaggi execute codificati in JSON
* **Target SVM:** dati delle istruzioni BPF codificati in esadecimale

---

## Prossimi passi

* [Precompile EVM](/developer-guide/evm-precompiles) — Stato della precompile CrossVM sincrona e delle altre precompile previste
* [Sviluppo EVM](/developer-guide/evm-development) — Sviluppo Solidity su QoreChain
* [Sviluppo CosmWasm](/developer-guide/cosmwasm-development) — Sviluppo di contratti Rust/Wasm
* [Sviluppo SVM](/developer-guide/svm-development) — Distribuzione di programmi BPF
