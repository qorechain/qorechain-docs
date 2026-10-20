---
slug: /developer-guide/cosmwasm-development
title: Sviluppo CosmWasm
sidebar_label: Sviluppo CosmWasm
sidebar_position: 3
---

# Sviluppo CosmWasm

QoreChain supporta gli smart contract **CosmWasm**, che consentono agli sviluppatori di scrivere programmi sicuri e isolati (sandboxed) in Rust, compilati in WebAssembly. I contratti CosmWasm vengono eseguiti insieme ai programmi EVM e SVM all'interno dell'architettura tripla-VM di QoreChain.

:::note
I comandi seguenti utilizzano la mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026), che esegue la release di nodo **v3.2.3**. Sostituisci con `--chain-id qorechain-diana` per la testnet, che esegue la v3.2.4 (solo testnet).
:::

:::caution Il caricamento del codice e l'istanziazione richiedono attualmente un permesso esplicito
Al momento della stesura, `code_upload_access` e `instantiate_default_permission` sono entrambi impostati su **`Nobody`** sia su **mainnet che su testnet** — il che significa che `MsgStoreCode` e `MsgInstantiateContract` non sono aperti di default ad account arbitrari, in seguito a un avviso di sicurezza CosmWasm valido per l'intero settore. Sarà necessario che la governance conceda al tuo account (o a un elenco specifico di indirizzi) il permesso di caricamento/istanziazione prima che i passaggi seguenti possano avere successo. Verifica prima i parametri live, poiché questo è esattamente il tipo di impostazione che la governance può modificare (la mainnet al momento non ha alcun codice di contratto archiviato):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

I tipi di messaggio `MsgStoreCode`, `MsgInstantiateContract` e `MsgInstantiateContract2` sono inoltre disattivati dal circuit breaker della chain su entrambe le reti (`qorechaind query circuit disabled-list`), quindi alzare il solo permesso non basta finché quelle voci non vengono rimosse.

Questa restrizione non riguarda i contratti già istanziati — `execute` e `query` su un contratto esistente funzionano normalmente indipendentemente da questa impostazione.
:::

:::caution Firma con `tx pqc cosign`
Mainnet e testnet richiedono una firma post-quantistica ibrida su ogni transazione della corsia Cosmos, quindi i comandi `tx` di questa pagina non vengono trasmessi così come sono scritti. Costruiscono la transazione con `--generate-only > tx.json`; poi firmala e trasmettila con `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (il binario di release dal [manifest di download](/developer-guide/running-a-node#fetch-the-manifest) include il firmatario; una build dal sorgente pubblico no). La soglia minima delle commissioni di rete è di **0,1 uqor per unità di gas**, ed è ciò che esprime `--gas-prices 0.1uqor`; la firma ibrida aggiunge circa 47.000 gas che una simulazione non include, da cui l'aggiustamento di `1.5`. Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing).
:::

---

## Prerequisiti

| Dipendenza                 | Versione       | Scopo                                  |
| --------------------------- | -------------- | --------------------------------------- |
| **Rust**                    | Ultima stabile | Compilazione del contratto              |
| **wasm32-unknown-unknown**  | target         | Target di compilazione WebAssembly      |
| **cargo-generate**          | Ultima         | Scaffolding del progetto                |
| **cosmwasm-std**            | 1.5+           | Libreria standard CosmWasm              |

Installa il target Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Ciclo di vita del contratto

I contratti CosmWasm seguono un ciclo di vita in cinque fasi: **Build** (compilazione), **Store** (archiviazione), **Instantiate** (istanziazione), **Execute** (esecuzione) e **Query** (interrogazione).

1. **Build** — Compila il tuo contratto in WebAssembly ottimizzato:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Il file `.wasm` ottimizzato si troverà nella directory `artifacts/`.

2. **Store** — Carica il contratto compilato sulla chain:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Dopo la conferma della transazione (firma e trasmetti `tx.json` con `tx pqc cosign` come descritto sopra), interroga il code ID archiviato:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Crea una nuova istanza del contratto a partire da un code ID archiviato:

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Flag                | Descrizione                                        |
   | ------------------- | -------------------------------------------------- |
   | `<code-id>`         | ID numerico restituito dalla transazione di archiviazione |
   | `--label`           | Etichetta leggibile per questa istanza              |
   | `--no-admin`        | Nessun indirizzo admin (il contratto è immutabile)  |
   | `--admin <address>` | Imposta un admin che può migrare il contratto       |

   Recupera l'indirizzo del contratto:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — Chiama l'entry point execute di un contratto per modificarne lo stato:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Esecuzione con fondi allegati:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **Query** — Leggi lo stato del contratto senza inviare una transazione:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Le risposte alle query vengono restituite in formato JSON.

---

## Query utili

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contract-by-code <code-id>

# Get contract info (code ID, admin, label)
qorechaind query wasm contract <contract-addr>

# Get raw contract state by key
qorechaind query wasm contract-state raw <contract-addr> <key-hex>

# Get full contract state (all keys)
qorechaind query wasm contract-state all <contract-addr>

# Get contract history (instantiate/migrate events)
qorechaind query wasm contract-history <contract-addr>
```

---

## Struttura del contratto

Un tipico contratto CosmWasm ha tre entry point:

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize contract state
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle state-changing operations
    Ok(Response::new().add_attribute("method", "execute"))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle read-only queries
    Ok(Binary::default())
}
```

---

## Chiamate Cross-VM

Le chiamate cross-VM vengono inviate come transazioni `MsgCrossVMCall` attraverso il modulo `x/crossvm`; consulta [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) per il ciclo di vita del messaggio. I contratti CosmWasm oggi non dispongono di un binding lato contratto per avviare una chiamata cross-VM (non esiste alcun messaggio personalizzato `QoreChainMsg` che i contratti possano emettere), quindi un contratto non può chiamare un contratto EVM o SVM dall'interno del proprio entry point `execute`. Dalla v3.2.3 una chiamata verso la corsia del chiamante stesso viene rifiutata e una chiamata in coda che fallisce non lascia effetti collaterali.

:::caution Le chiamate cross-VM sono attualmente disattivate sulla mainnet
`MsgCrossVMCall` si trova nell'elenco del circuit breaker della mainnet (`qorechaind query circuit disabled-list`) e la corsia SVM è disattivata su entrambe le reti, quindi il percorso cross-VM oggi non è utilizzabile per le transazioni ordinarie.
:::

---

## Integrazione dei moduli

I contratti CosmWasm possono interagire con i moduli del Cosmos SDK tramite il passaggio di messaggi standard:

```rust
// Send native tokens via the bank module
let send_msg = BankMsg::Send {
    to_address: "qor1recipient...".to_string(),
    amount: vec![Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    }],
};

// Delegate to a validator via the staking module
let delegate_msg = StakingMsg::Delegate {
    validator: "qorvaloper1...".to_string(),
    amount: Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    },
};
```

---

## Migrazione del contratto

Se il contratto è stato istanziato con un indirizzo `--admin`, l'admin può migrarlo verso un nuovo code ID:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

Questo richiama l'entry point `migrate` sul nuovo codice utilizzando lo stato esistente del contratto.

---

## Prossimi passi

* [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) — Chiama contratti EVM e SVM da CosmWasm
* [Sviluppo SVM](/developer-guide/svm-development) — Distribuisci programmi BPF su QoreChain
* [Precompilati EVM](/developer-guide/evm-precompiles) — Riferimento per i precompilati Solidity pianificati (nessuno è ancora attivo)
