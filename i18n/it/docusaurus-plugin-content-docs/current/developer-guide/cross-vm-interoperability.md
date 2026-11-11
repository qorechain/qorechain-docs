---
slug: /developer-guide/cross-vm-interoperability
title: Cross-VM Interoperability
sidebar_label: Cross-VM Interoperability
sidebar_position: 5
---

# Cross-VM Interoperability

L'**architettura triple-VM** di QoreChain (EVM, QoreChain Native, SVM) è progettata per consentire agli smart contract su qualsiasi macchina virtuale di comunicare con i contratti su qualsiasi altra VM. Il modulo `x/crossvm` fornisce un messaggio di chiamata con un percorso nella stessa transazione e un percorso in coda.

:::caution Cosa funziona oggi
Le chiamate cross-VM sono disponibili solo quanto lo è la loro lane di destinazione:

* `MsgCrossVMCall` è **disattivato sulla mainnet** dal circuit breaker (`qorechaind query circuit disabled-list`); è abilitato sulla testnet.
* La **lane SVM è disabilitata** per le transazioni su entrambe le reti, quindi un tratto SVM non può essere eseguito.
* **L'upload di QoreChain Native è soggetto ad autorizzazione** su entrambe le reti e **l'istanziazione è soggetta ad autorizzazione sulla mainnet**, che non ha alcun codice di contratto memorizzato, quindi sulla mainnet non esiste ancora alcun contratto QoreChain Native da chiamare. Sulla testnet la governance ha memorizzato alcuni contratti verificati che qualsiasi account può istanziare (vedi [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development)), quindi lì può esistere una destinazione QoreChain Native.
* La **precompile EVM sincrona non è attiva sulla mainnet** ed è **attiva sulla testnet** con un'allowlist di contratti QoreChain Native verificati (letto il 7 novembre 2026; dopo l'upgrade alla v3.2.7 è stata eseguita una chiamata in sola lettura tramite essa, vedi sotto). Una versione rinforzata è nel binario dalla v3.2.3. (Il 27 ottobre 2026 la governance della testnet ha attivato altre tre precompile, PQC Verify, PQC Key Status e PRISM Consensus Params, e il bridge CrossVM è entrato nell'elenco della testnet entro il 4 novembre; la mainnet non ne ha nessuna attiva.)

Sulla mainnet le route REST del modulo (`/qorechain/crossvm/v1/...`) non sono servite dal gateway pubblico (`501`); leggi i messaggi con la CLI o con un client di query gRPC/ABCI.
:::

:::note
Gli endpoint seguenti utilizzano per impostazione predefinita un nodo locale. Sulla mainnet, usa gli endpoint RPC di **`qorechain-vladi`** (Cosmos RPC **26657**, EVM JSON-RPC **8545**); la testnet è **`qorechain-diana`**.
:::

---

## Panoramica dell'architettura

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Percorso         | Direzione       | Tempistica       | Meccanismo                      |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Sincrono**     | EVM verso QoreChain Native | Stessa transazione | Precompile a `0x0000...0901` (attiva sulla testnet, non sulla mainnet; vedi sotto) |
| **Messaggio, predefinito** | Qualsiasi VM verso qualsiasi altra VM | Stessa transazione | `MsgCrossVMCall`; la chiamata viene eseguita immediatamente e un fallimento annulla l'intera transazione |
| **Messaggio, in coda**  | Qualsiasi VM verso qualsiasi altra VM | Blocco successivo (o oltre) | `MsgCrossVMCall` con `async` impostato; il messaggio attende nella coda |

---

## Percorso sincrono (EVM verso QoreChain Native) {#synchronous-path-evm-to-qorechain-native}

Il percorso sincrono utilizza una **precompile** EVM all'indirizzo `0x0000000000000000000000000000000000000901`. È progettata per consentire ai contratti Solidity di chiamare i contratti QoreChain Native e di ricevere una risposta all'interno della stessa transazione.

:::warning Non attiva sulla mainnet; attiva sulla testnet con un'allowlist
La precompile del bridge CrossVM **non è attiva** su `qorechain-vladi`: una chiamata a `0x…0901` lì riesce e restituisce dati vuoti. Su `qorechain-diana` l'elenco `active_static_precompiles` contiene `0x…0901` (letto il 7 novembre 2026); una `eth_call` in sola lettura tramite essa è stata eseguita il 7 novembre 2026, dopo l'upgrade alla v3.2.7 (risultati sotto). Il binario v3.2.3 include una versione rinforzata (rifiuta una `STATICCALL`, misura la sua chiamata annidata sul gas del frame chiamante e la registra nel journal in modo che un revert EVM annulli anche il lato QoreChain Native, raggiunge solo destinazioni QoreChain Native in allowlist e rispetta il circuit breaker cross-VM), ma viene eseguita solo dove una proposta approvata dalla governance l'ha aggiunta all'elenco attivo (finora la testnet, non la mainnet). Sulla mainnet la precompile e le chiamate cross-VM restano disattivate, anche dopo un upgrade alla v3.2.7 (che non ha ancora una data), fino a una decisione di governance separata. L'esempio seguente è il layout che il nodo decodifica; non può essere eseguito sulla mainnet finché la precompile non è attiva. Sulla testnet può essere chiamata, entro l'allowlist (sezione successiva). Vedi [Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
:::

### Esempio Solidity

Il nodo decodifica l'input della precompile come un selettore di 4 byte seguito dagli argomenti codificati ABI di `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selettore `0x3c11078c`). `targetVM` è `1` per un contratto QoreChain Native (QoreChain Native è il runtime CosmWasm; `0` è la EVM, che il bridge rinforzato rifiuta come destinazione). `targetContract` è l'indirizzo bech32 del contratto come stringa, e `payload` è il messaggio execute del contratto come byte JSON UTF-8. La precompile restituisce i byte grezzi della risposta della destinazione.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

Questo è il layout che il nodo decodifica; è lo stesso layout costruito dall'encoder di `@qorechain/rdk`, e il contratto qui sopra corrisponde allo starter in [Multi-VM](/rollups/multi-vm). I fondi non possono essere allegati tramite la precompile (il percorso del messaggio `MsgCrossVMCall` accetta `--funds`). L'esempio oggi non può fare nulla sulla mainnet, perché lì la precompile non è attiva. Sulla testnet funziona entro l'allowlist descritta di seguito; il contratto di esempio in sé non è stato distribuito per questa pagina, la chiamata qui sotto è stata fatta direttamente con `eth_call`.

Dove è attiva, la precompile esegue il contratto QoreChain Native immediatamente e restituisce il risultato. (L'helper `encodeCrossVmCalldata` di `@qorechain/rdk`, disponibile dalla 0.6.0 e nella 0.8.0 attuale, costruisce i calldata; vedi [Multi-VM](/rollups/multi-vm).) Costo del gas: **50.000 base + 4 per byte di input + costo di esecuzione**.

### Comportamento della testnet (allowlist, verificato il 7 novembre 2026) {#testnet-allowlist}

Su `qorechain-diana` (release del nodo v3.2.7 dal 6 novembre 2026) la precompile raggiunge solo i contratti QoreChain Native presenti nell'allowlist del bridge. `GET /qorechain/crossvm/v1/params` li elenca in `bridge_allowed_targets` (tre voci il 7 novembre 2026, scritte `cosmwasm:qor1...`), accanto a `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000 e `queue_timeout_blocks` 100. Il 7 novembre 2026 sono state eseguite due richieste `eth_call` in sola lettura a `0x…0901` con `executeCrossVMCall(1, target, 0x7b7d)`:

* **Destinazione fuori dall'allowlist:** va in revert con `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted`.
* **Destinazione nell'allowlist:** la chiamata raggiunge il contratto (il nodo riporta l'errore del contratto stesso per il messaggio vuoto `{}`: `Error parsing into type cw20::msg::Cw20ExecuteMsg`). Questo mostra che il percorso funziona; per questa pagina non è stata inviata alcuna transazione cross-VM che modifichi lo stato tramite la precompile.

Sulla mainnet la precompile (`0x…0901`) e le chiamate cross-VM restano **disattivate** (circuit breaker) anche dopo l'upgrade alla v3.2.7, fino a una decisione di governance separata.

### Cosa cambia la v3.2.7 per le chiamate cross-VM (per ora solo testnet) {#v327}

Si applicano sulla testnet dal 6 novembre 2026 e **non sono ancora sulla mainnet** (l'upgrade non ha una data):

* Una chiamata che fallisce nella VM di destinazione ora fallisce in modo pulito: è il fallimento di quella chiamata e la coda prosegue con il messaggio successivo.
* Le destinazioni malformate vengono rifiutate al momento dell'invio con codice 5 nel codespace `crossvm`.
* Una chiamata cross-VM non può più avere come destinazione l'indirizzo di una precompile EVM.

---

## Percorso tramite messaggio (`MsgCrossVMCall`)

Le altre chiamate cross-VM usano la transazione `MsgCrossVMCall`. La chain ricava la lane di origine dal mittente, quindi il messaggio contiene solo la VM di destinazione, il contratto di destinazione, il payload ed eventuali fondi. Per impostazione predefinita la chiamata viene eseguita immediatamente all'interno della transazione, e l'intera transazione viene annullata se la destinazione fallisce. Con il flag `async` il messaggio viene invece messo in coda e gestito dal passaggio sulla coda di fine blocco del modulo in un blocco successivo (vedi il ciclo di vita sotto). Come indicato sopra, questo messaggio è disattivato sulla mainnet.

### CLI

`tx crossvm call` accetta la VM di destinazione (`evm`, `cosmwasm` o `svm`) e il contratto di destinazione come argomenti posizionali, con il payload in esadecimale. La CLI non chiede la VM di origine: la chain ricava la lane del chiamante dallo stato e ignora il campo dichiarato (la CLI inserisce un segnaposto affinché il messaggio superi la propria validazione):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Altri flag: `--funds <coins>` (solo destinazioni QoreChain Native) e `--async` per mettere in coda la chiamata invece di eseguirla subito. Firma e trasmetti `tx.json` con `tx pqc cosign` (vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing)); il floor delle commissioni è 0.1 uqor per gas. Una chiamata verso la lane del chiamante stesso viene rifiutata (dalla v3.2.3).

:::caution Disattivato sulla mainnet
`MsgCrossVMCall` è disattivato sulla mainnet dal circuit breaker, quindi oggi il comando non può riuscire lì. (Anche i binari di release precedenti alla v3.2.3 costruivano un messaggio che non superava la propria validazione perché la VM di origine era vuota; il binario v3.2.3 lo corregge.) Sulla testnet il messaggio è abilitato, ma la lane SVM è disabilitata, quindi una destinazione SVM non può essere raggiunta; si può raggiungere una destinazione EVM, e una destinazione QoreChain Native una volta che lì è stato istanziato un contratto.
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

Dalla v3.2.3 una chiamata in coda che fallisce viene annullata per intero: resta solo il suo record `Failed`, e i fondi allegati a una chiamata QoreChain Native fallita non vengono più spostati nel contratto. Mentre il modulo è disabilitato, o `MsgCrossVMCall` è disattivato dal circuit breaker, la coda **non viene eseguita**: i messaggi in coda restano in attesa e scadono al loro timeout, a meno che l'interruttore non venga prima riattivato.

### Chiamate asincrone verso CosmWasm (v3.2.8) {#async-calls}

Dalla release v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) una chiamata asincrona verso CosmWasm è prepagata e messa in coda con dei limiti:

| Campo di `MsgCrossVMCall` | Significato |
| ---------------------- | ------- |
| `async_gas_limit` (8)  | Unità di gas del contratto che riservi per la chiamata in coda (predefinito 500.000) |
| `async_max_factor` (9) | Il fattore di congestione massimo che accetti (predefinito 4x); la chiamata viene rifiutata se il fattore in vigore è superiore |

- **Escrow.** Il mittente prepaga unità di gas x fattore x prezzo del gas in un account di escrow. Con i valori predefiniti sono 500.000 x 4 x 0,1 uqor, circa 0,2 QOR. Ciò che la chiamata non usa viene rimborsato quando viene eseguita.
- **Commissione per lo slot in coda.** Mettere in coda una chiamata paga anche una piccola commissione di slot.
- **Al massimo 100 chiamate in attesa per mittente.** Un'ulteriore chiamata viene rifiutata finché una non termina o scade.
- **Le chiamate fallite vengono addebitate.** Una chiamata che fallisce paga comunque il lavoro svolto.
- **Chiamate pesanti:** aumenta `async_gas_limit` e `async_max_factor` per i contratti che caricano codice di grandi dimensioni; un contratto delle dimensioni di un cw721 non rientra nei valori predefiniti alla sua prima chiamata in un blocco.

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

# Elenca i messaggi in attesa (dalla v3.2.8 una pagina di al massimo 100; segui la next key per gli altri)
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

**Atomicità:** le chiamate sincrone (EVM verso QoreChain Native tramite precompile) sono progettate per essere atomiche, in modo che se una delle due parti effettua un revert l'intera transazione venga annullata. La precompile rinforzata registra la chiamata annidata nel journal, quindi un revert nel contratto chiamante annulla anche il lato QoreChain Native; è attiva solo sulla testnet. Le chiamate asincrone **non sono atomiche** tra blocchi diversi; progetta i tuoi contratti per gestire correttamente gli stati `Failed` e `Timed Out`.

**Ordinamento:** i messaggi nella coda vengono elaborati FIFO all'interno di ogni passaggio dell'EndBlocker. Non è garantito alcun ordinamento tra diverse VM di origine.

**Codifica del payload:** il formato del payload dipende dalla VM target:

* **Target EVM:** chiamate di funzione codificate in ABI
* **Target QoreChain Native:** messaggi execute codificati in JSON
* **Target SVM:** dati delle istruzioni BPF codificati in esadecimale

---

## Prossimi passi

* [Precompile EVM](/developer-guide/evm-precompiles) — Stato della precompile CrossVM sincrona e delle altre precompile previste
* [Sviluppo EVM](/developer-guide/evm-development) — Sviluppo Solidity su QoreChain
* [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development) — Sviluppo di contratti Rust/Wasm
* [Sviluppo SVM](/developer-guide/svm-development) — Distribuzione di programmi BPF
