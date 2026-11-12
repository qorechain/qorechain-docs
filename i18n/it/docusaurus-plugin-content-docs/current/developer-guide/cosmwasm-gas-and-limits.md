---
slug: /developer-guide/cosmwasm-gas-and-limits
title: Gas, prezzi e limiti di caricamento di CosmWasm
sidebar_label: Gas e limiti CosmWasm
sidebar_position: 6
---

# Gas, prezzi e limiti di caricamento di CosmWasm

I contratti QoreChain Native (il nome che QoreChain dà al proprio runtime CosmWasm) sono prezzati in base a ciò che costa a un validatore eseguirli. Dalla release **v3.2.8** il prezzo di una chiamata a un contratto dipende da tre fattori: se il codice del contratto è già caricato in memoria per il blocco corrente, quanto è occupato il blocco dal lavoro dei contratti e quanta memoria tocca la chiamata. Il caricamento del codice ha limiti di dimensione e di forma.

:::note Prima la testnet
La v3.2.8 è attiva sulla testnet **`qorechain-diana`** dal 12 novembre 2026. La mainnet (`qorechain-vladi`) la applica con un successivo upgrade di governance, quindi le cifre qui sotto descrivono la testnet oggi e la mainnet dopo quell'upgrade. Ogni comando usa `--chain-id qorechain-diana`; sostituiscilo con `qorechain-vladi` quando la mainnet sarà stata aggiornata.
:::

## Perché è importante {#why}

- Una chiamata a un contratto che ieri funzionava con un limite di gas fisso oggi può esaurire il gas, perché la prima chiamata di un codice in un blocco costa diverse volte di più di una ripetizione. Un limite fisso è una stima che fallisce nel momento peggiore.
- Le commissioni seguono il carico. Quando i blocchi sono pieni di chiamate a contratti il prezzo dell'esecuzione dei contratti sale, e torna a scendere quando non lo sono.
- Ogni blocco ha una quantità limitata di lavoro dei contratti. Una chiamata che non rientra fallisce e paga la sua commissione come qualsiasi transazione fallita.

La regola breve: **simula, moltiplica il risultato per almeno 1,3 e non scrivere mai il gas a mano per una chiamata a un contratto.**

## Il modello del gas {#gas-model}

### Costo di caricamento del codice {#code-load}

Prima che un contratto venga eseguito, il suo codice compilato deve essere caricato. La prima chiamata di un codice in un blocco paga quel caricamento. Le chiamate successive allo stesso codice nello stesso blocco costano poco, perché il codice è già in memoria.

| Chiamata | Gas approssimativo |
| -------- | ------------------ |
| cw20 `transfer`, prima chiamata del codice in un blocco (un messaggio, gas usato misurato) | 585,151 |
| cw20 `transfer`, tre chiamate in una transazione, quindi due ripetizioni nello stesso blocco (gas usato misurato, totale) | 646,169 |
| La stessa singola chiamata, come riportata dalla simulazione | 591,280 |

Questi numeri sono stati misurati sulla testnet il 12 novembre 2026 con il codice cw20 revisionato che la governance ha memorizzato (fattore di congestione 1x). Una ripetizione dello stesso codice nello stesso blocco aggiunge in pratica solo circa 30,500 di gas. La simulazione riporta più di quanto usa una transazione, perché addebita sempre il caricamento a freddo e aggiunge un margine per la congestione: tre chiamate simulate a 1,326,504 hanno usato 646,169. Le cifre dipendono dal codice e dalla chiamata, quindi misura il tuo contratto. Nel dettaglio, il caricamento viene addebitato per intero alla prima chiamata di un codice in un blocco, le successive otto chiamate a quel codice nello stesso blocco non pagano alcun caricamento, e ogni chiamata successiva nel blocco ne paga un ottavo. L'insieme dei codici caricati parte vuoto a ogni blocco, quindi ogni validatore addebita le stesse chiamate. Questo vale per instantiate, execute, migrate e per le chiamate fatte da un altro contratto o dal bridge cross-VM.

**I codici fissati (pinned) saltano l'addebito del caricamento.** La governance può fissare un codice molto usato in modo che i validatori lo tengano caricato, e le chiamate a un codice fissato non pagano mai il costo di caricamento. Controlla quali codici sono fissati:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Preparazione della chiamata e memoria {#setup}

Ogni chiamata paga anche un piccolo addebito di preparazione (un costo base, un costo per pagina da 64 KiB di memoria iniziale e un costo per segmento di dati) e un addebito per ogni pagina di memoria di cui cresce. I contratti che tengono la memoria ridotta costano meno.

### Prezzi di congestione {#congestion}

Il gas di esecuzione dei contratti viene moltiplicato per un **fattore di congestione**.

| Proprietà | Valore |
| --------- | ------ |
| Intervallo | da 1x a 20x per impostazione predefinita |
| Tetto di governance | La governance può impostare il massimo fino a 100x |
| Quando sale | Solo quando i blocchi sono pieni: dopo un blocco che ha usato più della metà del proprio budget per i contratti (l'obiettivo predefinito) il fattore sale, e sale più in fretta se il budget è stato esaurito |
| Quando scende | Dopo un blocco che ha usato meno dell'obiettivo |

Il fattore scala solo l'esecuzione dei contratti. Lo storage, la preparazione della chiamata e il caricamento del codice non vengono moltiplicati. Il fattore era 1x quando sono stati misurati i trasferimenti qui sopra.

Leggi i valori in vigore:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

I campi da guardare sono `wasm_congestion_factor_micro` (il fattore in vigore, in milionesimi, quindi `1000000` è 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` e `max_tx_wasm_share_bps`.

### Il budget per i contratti di ogni blocco {#budget}

Ogni blocco ha un budget di lavoro per i contratti. I valori predefiniti sono:

| Parametro | Predefinito | Significato |
| --------- | ----------- | ----------- |
| `max_block_wasm_gas` | 3,000,000 | L'esecuzione di contratti che tutte le transazioni insieme possono usare in un blocco |
| `max_tx_wasm_share_bps` | 5,000 (metà) | La quota di quel budget che una transazione può usare, quindi 1,500,000 al valore predefinito |
| `queue_wasm_reserve_bps` | 2,500 | Quota del budget riservata alle chiamate cross-VM asincrone in coda |

Quando il budget rifiuta il lavoro di una transazione sui contratti, la transazione fallisce ("block wasm gas budget exhausted") e paga la sua commissione come qualsiasi transazione fallita. Riprova nel blocco successivo, che parte con il budget pieno. Una commissione di priorità aiuta a entrare presto in un blocco, prima che il budget sia speso. Una singola chiamata che richiede più della quota di una transazione non può essere eseguita finché la governance non aumenta il budget o la quota.

### Simulazione e margine di sicurezza {#simulation}

Una simulazione **addebita sempre il caricamento a freddo**, come se la tua chiamata fosse la prima del suo codice nel blocco, e prezza l'esecuzione al fattore di congestione che userà il blocco successivo più due passi di aumento (circa 2,25x sulla parte di esecuzione). Una stima quindi sopravvive a un paio di blocchi di carico crescente. Non è mai troppo bassa per una prima chiamata.

Per questo, usa questa regola per ogni messaggio verso un contratto:

1. Simula la transazione.
2. Moltiplica il gas simulato per **almeno 1,3**.
3. Usa il risultato come limite di gas e non superare il tetto della transazione.

### Tetto della transazione {#tx-cap}

Una transazione Cosmos non può impostare un limite di gas superiore a **50,000,000**. Una transazione sopra il tetto viene rifiutata prima che la commissione venga addebitata.

## Regole di caricamento {#upload}

Il caricamento del codice (`MsgStoreCode`) resta **controllato dalla governance**: `code_upload_access` è `Nobody` su entrambe le reti, quindi il codice viene memorizzato tramite una proposta di governance. Controllalo in qualsiasi momento:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

Dalla v3.2.8 un caricamento viene controllato in un ordine fisso, dai controlli più economici:

1. **Accesso.** Il mittente deve essere consentito dalla regola di caricamento. Il mempool ammette i messaggi di caricamento solo da mittenti consentiti.
2. **Gas per la dimensione dichiarata, in anticipo.** La transazione deve avere gas sufficiente per la dimensione del modulo che dichiara, altrimenti fallisce subito per gas esaurito, prima che qualcosa venga decompresso.
3. **Ispezione in un solo passaggio.** Il modulo viene decompresso una sola volta, mai oltre la dimensione dichiarata, e ispezionato rispetto ai limiti qui sotto. Un caricamento gzip deve essere esattamente un solo membro gzip che si decomprime alla dimensione che dichiara.
4. **Storage e compilazione.** Lo storage viene addebitato per byte, poi il modulo viene compilato.

Costi tipici di caricamento: circa **9,9 milioni di gas per un cw20** e circa **22,8 milioni per un cw721**. Il caricamento più denso che rimane entro i limiti costa circa 32 milioni, ancora entro il tetto di 50,000,000.

### Limiti dei moduli {#module-limits}

| Limite | Valore |
| ------ | ------ |
| Funzioni | al massimo 4,096 |
| Tipi di funzione | al massimo 512 |
| Dimensione compilata (stima prudente) | al massimo 32 MiB |
| Export | al massimo 128 |
| Globali | al massimo 256 |
| Segmenti element | al massimo 16, con al massimo 2,500 voci in totale |
| Segmenti di dati | al massimo 1,024 |
| Memoria iniziale | al massimo 64 pagine (4 MiB) |
| Sezioni personalizzate | al massimo 128 KiB in totale |
| Operazioni in virgola mobile | nessuna consentita |

Le istruzioni in virgola mobile vengono rifiutate perché non sono deterministiche tra gli hardware dei validatori. Scrivi i contratti con tipi interi o decimali di `cosmwasm-std` e verifica che la tua build non contenga istruzioni in virgola mobile prima di sottoporla alla governance.

I limiti vengono controllati anche **al momento della chiamata per il codice già memorizzato**, quindi un codice memorizzato in precedenza che viola un limite (per esempio la virgola mobile) viene rifiutato quando viene chiamato. I contratti costruiti dai template standard cw20 e cw721 e i contratti di release restano ben entro ogni limite.

## Esempio pratico: stima ed esecuzione di un trasferimento cw20 {#worked-example}

Il messaggio è il `transfer` cw20 standard: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Gli esempi usano la testnet.

### CLI {#example-cli}

Lascia che la CLI simuli con `--gas auto` e usa un adjustment di 1,3 o superiore. Costruisci la transazione con `--generate-only` e firmala con `tx pqc cosign`, come nel resto del manuale (vedi [Firma ibrida](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Il minimo della rete è 0,1 uqor per unità di gas; `0.15uqor` lascia un margine. Se il tuo contratto viene chiamato spesso nello stesso blocco di altri utenti dello stesso codice, il limite simulato copre già il caricamento a freddo.

### TypeScript {#example-ts}

Simula, moltiplica per 1,3, controlla il tetto, poi invia tramite il builder ibrido. Questo segue la [guida SDK di QoreChain Native](/sdk/guides/cosmwasm#gas), che ha gli import completi e la registrazione della chiave ML-DSA-87 dell'account.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

L'SDK 0.14.0 applica da sé le stesse regole: rifiuta un limite di gas Cosmos superiore a 50.000.000 prima di firmare, dà alle transazioni CosmWasm e cross-VM almeno 1,3 volte il gas simulato e non usa mai per esse un valore di ripiego fisso. `carriesWasmExecution(messages)` ti dice se un elenco di messaggi richiede gas simulato, e `WASM_GAS_MULTIPLIER_MIN` è il minimo di 1,3. Dove un client CosmJS accetta `"auto"` come commissione, simula al posto tuo.

### Testato sulla testnet {#example-tested}

Questa prova è stata eseguita su `qorechain-diana` il 12 novembre 2026 (release v3.2.8) con un account eth-native, l'SDK TypeScript 0.13.0 e il codice cw20 che la governance ha memorizzato (code id 859). Firma la transazione, invia i byte firmati alla route REST di simulazione e spedisce la transazione reale con il gas simulato per 1,3.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

Cosa ha stampato la prova:

| Passaggio | Risultato |
| --------- | --------- |
| Instantiate cw20 (code 859): simulato, poi inviato con quel valore per 1,3 | simulato 634,956; limite 825,443; code 0, gas usato 629,267 |
| cw20 `transfer`: simulato | 591,280 di gas |
| Lo stesso trasferimento con un limite fisso di 400,000 | rifiutato: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (la commissione viene comunque addebitata) |
| Lo stesso trasferimento con simulato x 1,3 (768,664) | code 0, gas usato 585,151 |
| Tre trasferimenti in una transazione, simulato x 1,3 (1,724,456) | code 0, gas usato 646,169 |

Un limite fisso di 400,000 fallisce alla prima chiamata del codice in un blocco, mentre il limite simulato no. La commissione è impostata sul limite che richiedi (0,15 uqor per unità di gas in questa prova), quindi un margine più ampio costa una commissione più alta: usa 1,3, non 5.

### Python, Go, Rust e Java {#example-other}

Ognuno di questi SDK simula tramite la route REST e dimensiona il limite dal risultato. Servono una transazione completamente assemblata (firmata), perché la route di simulazione richiede la struttura della transazione. Per un execute, instantiate o migrate di CosmWasm (e una chiamata cross-VM), gli SDK portano il limite ad almeno 1,3 volte il gas simulato. Nessuno ha un builder di messaggi cw20 o CosmWasm già pronto, quindi costruisci il `MsgExecuteContract` con la tua libreria protobuf e passa i suoi byte firmati.

**Python** (`qorechain-sdk`, `qorsdk`): `estimate_gas` e `auto_fee` prendono la transazione costruita e applicano il minimo di 1,3 per i messaggi wasm.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas` restituisce il gas simulato, `WasmGasWanted` applica il minimo di 1,3, e `EstimateFee` prezza un moltiplicatore che gli passi (non aggiunge il minimo da solo, quindi passa 1,3 o più).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): `estimate_gas_wanted` porta il limite ad almeno 1,3 volte il gas simulato per i messaggi wasm e cross-VM, e `estimate_fee` lo prezza.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): passa `true` come ultimo argomento quando la transazione contiene messaggi wasm o cross-VM.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### Route REST di simulazione {#example-rest}

`POST /cosmos/tx/v1beta1/simulate` con il base64 di una transazione firmata restituisce `gas_info.gas_used`. Moltiplicalo per 1,3 per ottenere il limite.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

La risposta contiene `gas_info.gas_used` (una stringa). La route accetta solo POST: un `GET` risponde `501 Not Implemented`.

## Limiti ed errori {#limits-errors}

| Situazione | Cosa vedi | Cosa fare |
| ---------- | --------- | --------- |
| Limite di gas sopra 50,000,000 | Rifiutata prima che la commissione venga addebitata | Abbassa il limite; dividi il lavoro su più transazioni |
| Gas esaurito su una chiamata a un contratto | La transazione fallisce con un errore di gas esaurito | Simula e usa almeno 1,3 volte il risultato; non riutilizzare mai un valore fisso |
| Budget dei contratti del blocco esaurito | Fallimento che nomina il block wasm gas budget; commissione pagata | Riprova nel blocco successivo, eventualmente con una commissione di priorità |
| Una chiamata richiede più della quota di una transazione | Fallisce ogni volta | Chiedi alla governance di aumentare il budget o la quota, oppure rendi la chiamata più economica |
| Caricamento da parte di un mittente senza accesso | Rifiutato all'ammissione | Invia il codice tramite una proposta di governance |
| Caricamento senza gas sufficiente per la dimensione dichiarata | Gas esaurito subito | Imposta il gas in modo da coprire la dimensione dichiarata (circa 9,9 milioni per cw20) |
| Caricamento oltre un limite del modulo | Rifiutato al caricamento | Riduci funzioni, export, globali, segmenti o memoria (vedi la tabella sopra) |
| Istruzioni in virgola mobile in un modulo | Rifiutato al caricamento, e al momento della chiamata per il codice memorizzato | Rimuovi le operazioni in virgola mobile dalla build |
| Caricamento gzip che non è un solo membro, o la cui dimensione è errata | Rifiutato | Comprimi il modulo come un unico flusso gzip con la dimensione corretta |

## Pagine correlate {#related}

- [Guida QoreChain Native (SDK): gas per le chiamate ai contratti](/sdk/guides/cosmwasm#gas)
- [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development)
- [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability)
- [Firma ibrida e `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Governance](/user-guide/governance)
