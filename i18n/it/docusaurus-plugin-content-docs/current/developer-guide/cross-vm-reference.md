---
slug: /developer-guide/cross-vm-reference
title: Riferimento delle chiamate cross-VM (v3.2.8)
sidebar_label: Riferimento Cross-VM
sidebar_position: 9
---

# Riferimento delle chiamate cross-VM (v3.2.8)

Una chiamata cross-VM permette al codice di una macchina virtuale di eseguire un contratto su un'altra: un account o un contratto QoreChain Native che chiama un contratto EVM, un account che chiama un contratto QoreChain Native (CosmWasm), un contratto Solidity che chiama un contratto QoreChain Native, e così via. Ci sono due modi per farne una. Una chiamata **sincrona** viene eseguita all'interno della tua transazione e restituisce subito la risposta. Una chiamata **asincrona** viene messa in coda ed eseguita in un blocco successivo.

Questa pagina è il riferimento di campi, costi e limiti per la release v3.2.8, con un esempio completo per ogni direzione. I concetti, il ciclo di vita e il comportamento precedente sono in [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability); la guida passo passo all'SDK è nella [guida Cross-VM](/sdk/guides/cross-vm).

:::note Dove gira la v3.2.8
La testnet **`qorechain-diana`** esegue la **v3.2.8** dal 12 novembre 2026. La mainnet **`qorechain-vladi`** non l'ha ancora applicata e sulla mainnet `MsgCrossVMCall` è disattivato. Per ora tutto ciò che è contrassegnato "v3.2.8" qui sotto è comportamento della testnet.
:::

:::caution Il messaggio di chiamata è disponibile adesso?
Sulla testnet `MsgCrossVMCall` era stato messo in pausa dall'upgrade. La proposta di governance 37 è passata e ha tolto la pausa, quindi la chiamata è aperta sulla testnet (verificato il 12 novembre 2026: l'elenco del circuit breaker contiene solo `/cosmwasm.wasm.v1.MsgStoreCode`). Sulla mainnet resta disattivata. Se la chiamata è disponibile in un dato momento lo dicono due cose: i parametri del modulo (`enabled`) e l'elenco del circuit breaker. Controlla entrambi prima di costruirci sopra qualcosa:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

La route dell'elenco si scrive `disable_list` su REST (la forma `disabled_list` risponde `501`). L'equivalente da riga di comando su un nodo è `qorechaind query circuit disabled-list`. Quando la chiamata è in pausa, una transazione che la contiene viene rifiutata, e le chiamate in coda restano in sospeso fino alla scadenza, a meno che la pausa non venga tolta prima. Prima che la proposta 37 passasse, l'elenco conteneva `/qorechain.crossvm.v1.MsgCrossVMCall`; sulla testnet non lo contiene più. Consulta [Testato sulla testnet](#tested) per ciò che è stato inviato.
:::

## Perché è importante {#why}

- **Il costo è prevedibile.** Una chiamata in coda verso QoreChain Native mostra subito il proprio prezzo: scegli quanto lavoro di contratto può usare e il fattore di congestione massimo che accetti, il denaro viene trattenuto in escrow e ciò che la chiamata non usa ti torna indietro.
- **Un account non può soffocare gli altri.** Un mittente può avere al massimo 100 chiamate in coda alla volta, così la coda condivisa resta utilizzabile.
- **Una chiamata che fallisce non è mai gratis.** Una chiamata che fallisce paga comunque il lavoro svolto, in ogni direzione, quindi intercettare un errore e riprovare con lo stesso gas non funziona.
- **Il lato EVM resta dentro la tua finestra.** Una chiamata verso l'EVM che non hai firmato tu stesso, e il bridge EVM a `0x0901`, sono ammessi solo da una [finestra di autorizzazione EVM](/developer-guide/evm-window-reference) aperta.

## Chiamate sincrone e asincrone {#sync-async}

| | Sincrona (predefinita) | Asincrona (`async = true`) |
| --- | --- | --- |
| Quando viene eseguita | All'interno della tua transazione | Alla fine di un blocco successivo, dalla coda |
| Gas | Il gas della tua transazione | Un budget prepagato fisso (vedi [Costo](#cost)) |
| Risposta | Restituita nella risposta della transazione, campo `data` | Non restituita; leggi il messaggio concluso tramite id |
| Se il target fallisce | L'intera transazione viene annullata | Solo quella chiamata viene registrata come `failed`; la tua transazione resta |
| Fondi | Si possono allegare `funds` per un target QoreChain Native | Idem; una chiamata async con fondi verso una lane che non può trasportarli viene rifiutata all'invio |
| Ideale per | Tutto ciò che ha bisogno del risultato subito | Lavoro fire-and-forget e chiamate di cui vuoi limitare il gas |

Un messaggio in coda passa da `pending` a `executed`, `failed` o `timed_out`. Scade dopo `queue_timeout_blocks` (100 sulla testnet). La coda viene eseguita partendo dal più vecchio e il passaggio di fine blocco esegue al massimo 50 chiamate per blocco.

### Chi chiama chi, in modo sincrono o asincrono {#who-calls-whom}

Quale dei due modi una chiamata può usare dipende da chi la invia.

| Chiamante | Target | Sincrona | Asincrona |
| --- | --- | --- | --- |
| Account (firma la transazione) | EVM, QoreChain Native | Sì (predefinita) | Sì |
| Contratto QoreChain Native, che invia `MsgCrossVMCall` come se stesso | EVM | Sì (`async` false, il valore predefinito) | Sì |
| Contratto QoreChain Native, che invia `MsgCrossVMCall` come se stesso | QoreChain Native | Rifiutata (la tua stessa lane) | Rifiutata (la tua stessa lane) |
| Contratto chiamato dal bridge EVM a `0x0901` (sotto il bridge) | SVM | Sì | Non usata |
| Contratto chiamato dal bridge EVM a `0x0901` (sotto il bridge) | EVM | Non usata | Sì |

Un contratto QoreChain Native che invia `MsgCrossVMCall` come se stesso può chiamare l'EVM in entrambi i modi. Quella sincrona (`async` false, il valore predefinito) viene eseguita con il gas della transazione, la risposta torna in `MsgCrossVMCallResponse.data` e un fallimento annulla l'intera transazione. Quella asincrona mette la chiamata in coda. Entrambe sono state eseguite in precedenza sulla testnet: la chiamata sincrona all'altezza 9.795.779 e quella asincrona all'altezza 9.795.783.

La formula "sync verso l'SVM, async verso l'EVM" vale solo sotto il bridge `0x0901`: per un contratto chiamato dal bridge EVM, ciò che quel contratto invia può andare in modo sincrono verso l'SVM e in modo asincrono verso l'EVM. Non è una regola per un contratto che agisce come se stesso, che può usare entrambi i modi verso l'EVM.

## Campi di MsgCrossVMCall {#fields}

Type URL `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Campo | Numero | Significato |
| ----- | ------ | ----------- |
| `sender` | 1 | Il tuo indirizzo `qor1...`. Firma il messaggio. |
| `source_vm` | 2 | Ignorato dalla chain. La chain stabilisce da sola da dove proviene la chiamata. Viene comunque inviato perché i nodi più vecchi accettino il messaggio. |
| `target_vm` | 3 | `evm`, `cosmwasm` o `svm`. Una chiamata verso la tua stessa lane viene rifiutata. La lane SVM è aperta sulla testnet dalla proposta 37 e spenta sulla mainnet; vedi [Lane SVM](/developer-guide/svm-lane-v328). Per questa pagina non è stata eseguita alcuna chiamata verso l'SVM. |
| `target_contract` | 4 | Un indirizzo EVM (`0x` e 40 cifre esadecimali, non un indirizzo di precompile) o un indirizzo di contratto `qor1...`. |
| `payload` | 5 | I dati della chiamata: codificati ABI per l'EVM, il messaggio execute JSON come UTF-8 per QoreChain Native. Al massimo `max_message_size` byte (65.536). |
| `funds` | 6 | Coin da allegare (solo target QoreChain Native). |
| `async` | 7 | `true` mette la chiamata in coda; `false` (predefinito) la esegue subito. |
| `async_gas_limit` | 8 | v3.2.8, solo async verso QoreChain Native: le unità di gas del contratto con cui viene eseguita la chiamata in coda. `0` o non impostato significa 500.000. Consentito da 250.000 fino a ciò che la coda può eseguire in un blocco (1.875.000 con il budget predefinito). |
| `async_max_factor` | 9 | v3.2.8, solo async verso QoreChain Native: il fattore di congestione massimo che pagherai, in **milionesimi**: `1000000` è 1x e `4000000` è 4x. L'intervallo valido va da 1.000.000 a 100.000.000 (da 1x a 100x); un semplice multiplo come `4` viene rifiutato con codespace `crossvm` codice 2 prima che venga eseguito qualsiasi cosa. `0` o non impostato significa quattro volte il fattore al momento dell'invio (4.000.000 milionesimi quando il fattore è 1x), limitato al massimo della chain. Un valore inferiore al fattore in vigore viene rifiutato all'invio. |

Da riga di comando i due nuovi campi sono `--async-gas-limit` (un numero intero) e `--async-max-factor` (un decimale come `2.5`, che il comando converte per te in milionesimi). In un messaggio grezzo, nell'SDK e nelle forme REST o JSON il valore è sempre in milionesimi: 2,5x è `2500000`. L'SDK esporta `CROSSVM_ASYNC_FACTOR_ONE` (1.000.000) per convertire un multiplo in milionesimi, e `validateCrossVmAsyncGas` per controllare i due valori prima dell'invio.

## Costo, escrow e rimborsi {#cost}

Per una **chiamata async verso QoreChain Native** (v3.2.8):

1. **Escrow.** Il prepagato è unità per fattore per prezzo del gas, e viene trattenuto, non speso. Con i valori predefiniti sono 500.000 unità x 4 (4.000.000 in milionesimi) x 0,1 uqor = 200.000 uqor, ovvero **0,2 QOR**. Passa dal tuo saldo all'account `crossvm_async_escrow`. Ti serve altrettanto uqor spendibile: le coin di vesting bloccate, i fee grant e le commissioni pagate in altri token non possono finanziarlo, e una chiamata di questo tipo viene rifiutata.
2. **Commissione per lo slot in coda.** Ogni chiamata async paga inoltre all'invio una commissione di slot come gas: 500.000 gas verso una coda vuota, in aumento con il riempimento della coda fino a 2.000.000 gas verso una coda piena. Al prezzo di 0,1 uqor per gas sono da 0,05 QOR a 0,2 QOR.
3. **Regolamento.** Quando la chiamata termina, il gas usato al fattore allora in vigore viene pagato dall'escrow come commissione, e il resto ti torna. Una chiamata che fallisce paga ciò che ha usato. Una chiamata che scade, o che non viene mai eseguita, riceve indietro tutto l'escrow, e la sua commissione di slot è la commissione di elaborazione. L'evento `crossvm_escrow_settled` riporta commissione e rimborso.
4. **Attesa del fattore.** La chiamata viene eseguita finché il fattore di congestione è pari o inferiore al tuo `async_max_factor`. Se il fattore è più alto, attende, e scade se resta alto. Con il valore predefinito (quattro volte il fattore all'invio, 4.000.000 in milionesimi quando il fattore è 1x) il fattore deve più che quadruplicare prima che la chiamata attenda.
5. **Limiti di dimensione.** Il prepagato non può superare 50.000.000 di gas. Oltre, la chiamata viene rifiutata all'invio: riprova più tardi o riduci `async_gas_limit`.

Per una **chiamata async verso l'EVM** il budget prepagato è 1.000.000 di gas, addebitato all'invio. Per una chiamata **sincrona** il costo è il gas della transazione stessa. I contratti QoreChain Native pesanti che caricano codice di grandi dimensioni richiedono un `async_gas_limit` e un `async_max_factor` più alti dei valori predefiniti alla loro prima chiamata in un blocco.

### Le chiamate fallite vengono addebitate {#failed-charged}

Una chiamata cross-VM che fallisce paga comunque il lavoro svolto. Una chiamata EVM che va in revert o esaurisce il gas usa dal chiamante il gas EVM consumato, e una chiamata QoreChain Native fatta tramite il bridge `0x0901` che fallisce usa dal frame EVM chiamante il gas speso dal contratto. Un contratto che vuole sopravvivere a un callee costoso che fallisce dovrebbe impostare un limite di gas sulla sotto-chiamata invece di riprovare con lo stesso gas residuo.

## La coda in sospeso {#pending}

- **Al massimo 100 chiamate in sospeso per mittente** (`max_pending_per_sender`). Un'ulteriore chiamata async viene rifiutata con `ErrQueueFull` (codespace `crossvm`, codice 4) finché una delle tue non è stata eseguita o non è scaduta. Le chiamate sincrone non sono interessate.
- **L'intera coda contiene al massimo `max_queue_size`** chiamate (1.000).
- **L'elenco delle chiamate in sospeso è paginato.** Ogni pagina contiene al massimo 100 messaggi, e ogni payload nell'elenco è troncato ai primi **1.024 byte** (`payload_hex`). Per leggere un payload completo, recupera il messaggio tramite id.
- **Il limite di pagina viene forzato.** Un `pagination.limit` pari a 0 o superiore a 100 viene silenziosamente portato a 100. Una richiesta con `limit=101` risponde `200` con al massimo 100 elementi, non con un errore. Per leggere oltre, passa il `next_key` della risposta e prosegui finché è vuoto.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

Verificato sulla testnet il 12 novembre 2026: la route delle chiamate in sospeso ha risposto `200` con `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (coda vuota), e la route del messaggio ha risposto `200` con `{"message":null,"found":false}` per un id che non esiste. Le stesse letture con la CLI del nodo Linux:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note CLI del nodo
`qorechaind` è la CLI del nodo Linux. Non esiste un binario macOS pacchettizzato. Le chiamate REST funzionano da qualsiasi macchina.
:::

## Parametri del modulo {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Ha risposto `200` il 12 novembre 2026 con questi campi:

| Campo | Valore letto | Significato |
| ----- | ------------ | ----------- |
| `enabled` | `true` | Interruttore del modulo. Il messaggio di chiamata ha una propria voce nell'elenco del circuit breaker. |
| `max_message_size` | `65536` | Payload più grande in byte. |
| `max_queue_size` | `1000` | Massimo di chiamate in coda contemporaneamente. |
| `queue_timeout_blocks` | `100` | Blocchi prima che una chiamata non eseguita scada. |
| `bridge_allowed_targets` | tre voci `cosmwasm:qor1...` | I contratti QoreChain Native che il bridge `0x0901` può chiamare. Se vuoto, il bridge resta chiuso. |
| `bridge_target_pins` | una voce per target: `target`, `code_id`, `history_len` | Il codice che ogni target consentito deve ancora eseguire perché il bridge lo chiami. |
| `max_pending_per_sender` | `100` | Chiamate in coda che un mittente può avere. |
| `max_cosmos_tx_gas` | `"50000000"` | Massimo gas che una transazione Native può dichiarare. |
| `record_retention_blocks` | `"100000"` | Per quanto viene conservato il record di una chiamata in coda conclusa. |
| `max_block_wasm_gas` | `"3000000"` | Esecuzione QoreChain Native che un blocco può usare. |
| `max_tx_wasm_share_bps` | `5000` | Quota di quel budget che una transazione può usare. |
| `max_block_level_wasm_gas` | `"10000000"` | Budget per il lavoro dei contratti svolto al di fuori delle transazioni. |
| `queue_wasm_reserve_bps` | `2500` | Quota del budget del blocco riservata alla coda. |
| `wasm_congestion_max_factor` | `20` | Valore massimo che il fattore di congestione può raggiungere. |
| `wasm_congestion_target_bps` | `5000` | Quota di utilizzo oltre la quale il fattore sale. |
| `wasm_congestion_factor_micro` | `"1000000"` | Il fattore in vigore ora, in milionesimi (`1000000` è 1x). |
| `max_block_upload_bps` | `5000` | Quota del budget che gli upload di codice possono usare. |
| `max_queue_timeouts_per_block` | `100` | Chiamate fatte scadere per blocco. |

Usa `wasm_congestion_factor_micro` per vedere cosa prepagherà ora una chiamata in coda: unità x fattore x 0,1 uqor.

## Esempi per direzione {#examples}

Tutti gli esempi firmano con la chiave post-quantistica dell'account, come ogni transazione Native; vedi [Post-Quantum Signing](/developer-guide/post-quantum-signing). Per questa pagina sono stati inviati solo gli esempi da account nativo a QoreChain Native (vedi [Testato sulla testnet](#tested)); gli esempi EVM non sono stati eseguiti e sono contrassegnati UNTESTED dove compaiono.

### Account nativo verso contratto EVM {#native-to-evm}

**UNTESTED:** questa direzione non è stata eseguita per questa pagina.

Il target è un contratto EVM; il payload è un call data codificato ABI. La chiamata viene eseguita come il tuo indirizzo `0x`, quindi il lato EVM ti vede come `msg.sender`. Riga di comando (CLI del nodo Linux): costruisci e poi aggiungi la firma post-quantistica:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript con l'SDK pubblicato (0.13.0). L'helper codifica ABI la chiamata con viem:

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust e Java prendono il payload come byte grezzi per l'EVM (la codifica ABI di alto livello è solo TypeScript). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

Se il mittente non è l'account che ha firmato la transazione, per esempio un grantee authz, il lato EVM viene eseguito sotto la finestra del granter; vedi [Authz e finestre](#authz).

### Account nativo verso contratto QoreChain Native {#native-to-wasm}

Il payload è il messaggio execute JSON del contratto. Una chiamata sincrona restituisce in `data` la risposta del contratto:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

In coda, con una quota di gas esplicita e un tetto al fattore (v3.2.8). L'escrow è 800.000 x 2,5 x 0,1 uqor = 200.000 uqor (0,2 QOR) se il fattore è 1 (il comando prende `2.5` e invia 2.500.000 milionesimi):

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript con SDK 0.13.0 (sincrona, e in coda con la quota predefinita):

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) e Java (`o.async = true`) mettono in coda allo stesso modo:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note Supporto SDK per i due nuovi campi
L'SDK 0.13.0 non ha opzioni per `async_gas_limit` o `async_max_factor`, quindi le sue chiamate in coda usano i valori predefiniti. L'SDK 0.14.0 aggiunge `asyncGasLimit` e `asyncMaxFactor` alla chiamata cross-VM, esporta `CROSSVM_ASYNC_FACTOR_ONE` (1.000.000) e `validateCrossVmAsyncGas`, e il suo helper `buildCall` imposta `sourceVm` su `evm` per un account nativo. La chain ignora `source_vm` e ha registrato il messaggio con `source_vm` native.
:::

### Contratto EVM verso contratto QoreChain Native tramite 0x0901 {#evm-to-wasm}

**UNTESTED:** questa direzione non è stata eseguita per questa pagina.

Un contratto Solidity chiama il precompile bridge a `0x0000000000000000000000000000000000000901`. La chiamata viene eseguita all'interno della transazione EVM, con l'account o il contratto chiamante (come suo indirizzo `qor1`) come mittente QoreChain Native, e un revert in qualsiasi punto annulla entrambi i lati.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

Regole per il bridge:

- Solo `CALL` semplice, senza valore, selettore `0x3c11078c`. `STATICCALL`, `DELEGATECALL` e target VM `0` o `2` vanno in revert.
- Il target deve essere in `bridge_allowed_targets` (e, dalla v3.2.8, eseguire ancora il codice a cui è fissato). Leggi entrambi con la route dei parametri qui sopra.
- **Il chiamante ha bisogno di una finestra che elenchi `0x0901`.** Ogni account che invia una transazione al bridge deve avere una [finestra di autorizzazione EVM](/developer-guide/evm-window-reference) aperta il cui `allowed_targets` includa `0x0000000000000000000000000000000000000901` (e il contratto che lo chiama, se chiami tramite uno). Aprine una così, con un limite adatto alla tua sessione:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- Una chiamata fallita va in revert con un motivo `Error(string)` e viene addebitata per il gas usato dal contratto.

L'helper `@qorechain/rdk` `encodeCrossVmCalldata({ contract, msg })` costruisce lo stesso call data in TypeScript (vedi [Multi-VM](/rollups/multi-vm)). Con l'SDK pubblicato l'indirizzo del precompile è `PRECOMPILE_ADDRESSES.crossVmBridge` da `@qorechain/evm`.

### Contratto QoreChain Native verso contratto EVM {#wasm-to-evm}

**UNTESTED** dall'autore della documentazione. Il team della chain riferisce che entrambi i modi sono stati eseguiti sulla testnet prima della v3.2.8.

Un contratto QoreChain Native effettua la chiamata inviando un `MsgCrossVMCall` come messaggio della chain, con se stesso come mittente. Il messaggio ha gli stessi campi visti sopra; la chain tratta il contratto come un chiamante CosmWasm qualunque cosa dica `source_vm`. Con `async` false (il valore predefinito) la chiamata è sincrona: viene eseguita con il gas della transazione, la risposta è in `MsgCrossVMCallResponse.data` e un fallimento annulla l'intera transazione. Con `async` true viene messa in coda. Vedi [Chi chiama chi](#who-calls-whom). L'esempio seguente mette la chiamata in coda:

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

Cose da sapere prima di farci affidamento:

- L'EVM vede il contratto come gli **ultimi 20 byte** del suo indirizzo di 32 byte. Assicurati che il contratto EVM non dipenda dal fatto che `msg.sender` sia un account normale.
- Dalla v3.2.8 una chiamata che lascerebbe quel chiamante con più QOR nativo di quanto ne avesse all'inizio fallisce (e viene addebitata). I contratti EVM pensati per questa direzione dovrebbero pagare con un token ERC-20, o con un account di 20 byte indicato nella chiamata, non con QOR nativo a `msg.sender`.
- Un contratto che agisce come se stesso non è limitato da una finestra EVM. Una chiamata inviata sotto un grant authz di un account lo è; vedi sotto.
- Sotto il bridge `0x0901`, un `MsgCrossVMCall` è accettato solo da un contratto che agisce come se stesso, e un `MsgExec` authz non può portarne uno per conto di un altro account.

Entrambi i modi sono stati eseguiti in precedenza sulla testnet (sincrono all'altezza 9.795.779, asincrono all'altezza 9.795.783). Il codice Rust lato contratto che invia questo messaggio non è stato eseguito per questa pagina.

## Authz e finestre {#authz}

Una chiamata cross-VM verso l'EVM che il mittente non ha inviato di persona viene eseguita sotto la finestra EVM del **mittente**, esattamente come se il codice del mittente agisse nella transazione di qualcun altro. In pratica si tratta dell'uso di un grant authz. Quando qualcuno usa il tuo grant di `MsgCrossVMCall` per chiamare l'EVM:

- La chiamata è ammessa solo se **la tua** finestra è aperta e il suo ambito ammette il target (`allowed_targets`, `native_only`, i precompile che muovono valore).
- Ogni chiamata riuscita consuma una delle transazioni della finestra, e il valore nativo che perdi viene conteggiato contro il valore della finestra.
- Senza una chiave post-quantistica utilizzabile e una finestra attiva, la chiamata viene rifiutata, all'invio per una chiamata async e di nuovo quando la coda la esegue.
- Un contratto o una group policy non ha alcuna finestra, quindi un grant authz da parte loro non può trasportare una chiamata verso l'EVM.
- Le chiamate verso QoreChain Native non sono limitate dalla finestra. Un grant authz generico di `MsgCrossVMCall` dà al grantee la tua identità sulla lane QoreChain Native: concedilo solo a parti di cui ti fidi con l'account.

Anche una conversione di un token ERC-20 sotto un grant authz (`MsgConvertERC20`) è ammessa dalla finestra del mittente nello stesso modo.

## Limiti ed errori {#limits}

| Situazione | Risultato |
| ---------- | --------- |
| Payload più grande di `max_message_size` | Rifiutato, codice 8 (`message payload exceeds max size`) |
| Indirizzo target di forma sbagliata per la sua lane | Rifiutato all'invio, codice 5 (`invalid target contract address`) |
| Il target è un indirizzo di precompile (da `0x...0000` a `0x...ffff`) | Rifiutato all'invio, codice 5 |
| Target VM uguale alla tua lane | Rifiutato |
| VM sconosciuta o non supportata | Codice 7 (`unsupported VM type`) |
| Più di 100 chiamate in coda da un solo mittente | `ErrQueueFull`, codice 4, finché una non termina o scade |
| La coda contiene `max_queue_size` chiamate | `ErrQueueFull`, codice 4 |
| `async_max_factor` fuori da 1.000.000 a 100.000.000 (milionesimi), per esempio `6` invece di `6000000` | Rifiutato prima che venga eseguito qualsiasi cosa, codespace `crossvm` codice 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` inferiore al fattore in vigore | Rifiutato all'invio |
| `async_gas_limit` inferiore a 250.000 o superiore allo spazio per blocco della coda | Rifiutato all'invio |
| Prepagato oltre 50.000.000 di gas | Rifiutato all'invio; riprova più tardi o riduci il limite |
| uqor spendibile inferiore all'escrow | Rifiutato (le coin bloccate dal vesting, i fee grant e le commissioni in altri token non possono finanziarlo) |
| Fattore di congestione superiore ad `async_max_factor` quando arriva il turno della chiamata | La chiamata attende; scade dopo `queue_timeout_blocks` |
| La chiamata scade o non viene mai eseguita | Escrow rimborsato per intero, commissione di slot trattenuta come commissione di elaborazione |
| Il target fallisce | Record `failed` (async) o transazione annullata (sync); il gas usato viene addebitato |
| QOR nativo restituito a un chiamante contratto (mittente a 32 byte) dall'EVM | La chiamata fallisce e viene addebitata |
| Chiamata a `0x0901` senza una finestra che lo elenchi | Rifiutata |
| Target `0x0901` non in `bridge_allowed_targets`, o codice cambiato da quando è stato fissato | Revert: `cross-VM bridge call refused: target ... is not allowlisted` per un target non in elenco |
| `MsgCrossVMCall` nell'elenco del circuit breaker | Transazione rifiutata; le chiamate in coda restano in sospeso |
| Una chiamata verso l'SVM | La lane è aperta sulla testnet dalla proposta 37 e spenta sulla mainnet; per questa pagina non è stata eseguita alcuna chiamata verso l'SVM (UNTESTED) |

Un errore registrato su una chiamata in coda fallita riporta testo semplice senza annotazione del file sorgente.

## Eventi {#events}

| Evento | Attributi | Significato |
| ------ | --------- | ----------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Una chiamata è stata inviata |
| `crossvm_response` | `message_id`, `status`, e `error` per una chiamata fallita | Una chiamata in coda è terminata |
| `crossvm_timeout` | `message_id` | Una chiamata in coda è scaduta |
| `crossvm_escrow_settled` | commissione e rimborso | L'escrow di una chiamata async verso QoreChain Native è stato pagato |

## Testato sulla testnet {#tested}

Eseguito su `qorechain-diana` il 12 novembre 2026 (release v3.2.8) dopo il passaggio della proposta 37, con SDK 0.14.0 (`createCrossVMClient(...).buildCall`, firma ibrida, account eth-native), contro il contratto cw20 memorizzato dalla governance e istanziato dal codice 859. Il payload era `{"transfer":{"recipient":<self>,"amount":"1"}}`.

| Passo | Risultato |
| ----- | --------- |
| Lettura dell'elenco del circuit breaker | Solo `/cosmwasm.wasm.v1.MsgStoreCode`; il messaggio di chiamata non è in pausa |
| Chiamata sincrona da nativo a QoreChain Native | Simulati 601.178 gas, inviata con simulato x 1,3, codice 0, 595.049 gas usati |
| Chiamata asincrona da nativo a QoreChain Native, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | Simulati 751.287 gas; codice 0; 751.277 gas usati |
| Addebiti della chiamata async (eventi della transazione) | La commissione (146.502 uqor, il limite per 0,15) e 680.417 uqor inviati a un account di modulo (il pagamento di escrow e slot in coda così come osservato; qui non è suddiviso) |
| Evento della chiamata async | `crossvm_request` con `source_vm` native, `target_vm` cosmwasm |
| `GET /qorechain/crossvm/v1/message/{id}` | Stato `executed`, `created_height` uguale a `executed_height` (la chiamata in coda è stata eseguita nello stesso blocco), errore vuoto |
| `GET /qorechain/crossvm/v1/pending` in seguito | Elenco vuoto |
| `async_max_factor` pari a `6` | Rifiutato prima che venisse eseguito qualsiasi cosa: codespace `crossvm` codice 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

Non eseguito per questa pagina (UNTESTED): da EVM a QoreChain Native tramite `0x0901`, e da QoreChain Native a EVM. Il team della chain riferisce che i percorsi sincrono e asincrono da QoreChain Native a EVM sono stati eseguiti sulla testnet alle altezze 9.795.779 e 9.795.783, prima della v3.2.8.

## Pagine correlate {#related}

- [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) per i concetti, il ciclo di vita e le note sull'allowlist della testnet.
- [Riferimento della finestra di autorizzazione EVM](/developer-guide/evm-window-reference) per aprire e delimitare la finestra di cui il bridge ha bisogno.
- [Precompile EVM](/developer-guide/evm-precompiles) per la tabella dei precompile e lo stato di rete.
- [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development) e [Gas e limiti di QoreChain Native](/developer-guide/cosmwasm-gas-and-limits) per il gas dei contratti e il budget del blocco.
- [Post-Quantum Signing](/developer-guide/post-quantum-signing) per firmare le transazioni qui sopra.
- [Guida Cross-VM (SDK)](/sdk/guides/cross-vm) e [rollup Multi-VM](/rollups/multi-vm) per gli helper SDK e RDK.
