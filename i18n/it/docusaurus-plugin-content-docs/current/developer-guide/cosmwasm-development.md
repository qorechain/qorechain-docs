---
slug: /developer-guide/cosmwasm-development
title: Sviluppo CosmWasm
sidebar_label: Sviluppo CosmWasm
sidebar_position: 3
---

# Sviluppo CosmWasm

QoreChain supporta gli smart contract **CosmWasm**, che consentono agli sviluppatori di scrivere programmi sicuri e isolati (sandboxed) in Rust, compilati in WebAssembly. I contratti CosmWasm vengono eseguiti insieme ai programmi EVM e SVM all'interno dell'architettura tripla-VM di QoreChain.

:::note
I comandi seguenti utilizzano la mainnet **`qorechain-vladi`**, attiva dal 7 giugno 2026 e in esecuzione con la versione della chain **v3.1.92**. Sostituisci con `--chain-id qorechain-diana` per la testnet.
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
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   Dopo che la transazione viene confermata, interroga il code ID archiviato:

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
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   | Flag                 | Descrizione                                          |
   | --------------------- | ----------------------------------------------------- |
   | `<code-id>`           | ID numerico restituito dalla transazione di store      |
   | `--label`             | Etichetta leggibile per questa istanza                |
   | `--no-admin`          | Nessun indirizzo admin (il contratto è immutabile)     |
   | `--admin <address>`   | Imposta un admin che può migrare il contratto          |

   Recupera l'indirizzo del contratto:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Execute** — Chiama l'entry point execute di un contratto per modificarne lo stato:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Esecuzione con fondi allegati:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
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
qorechaind query wasm list-contracts-by-code <code-id>

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

## Chiamate cross-VM

I contratti CosmWasm possono interagire con contratti distribuiti su EVM e SVM attraverso il modulo `x/crossvm`. Le chiamate cross-VM da CosmWasm utilizzano il percorso di messaggistica **asincrono**:

```rust
use cosmwasm_std::{CosmosMsg, CustomMsg};

// Call an EVM contract from CosmWasm
let cross_vm_msg = CosmosMsg::Custom(QoreChainMsg::CrossVMCall {
    target_vm: "evm".to_string(),
    target_contract: "0x1234...abcd".to_string(),
    payload: hex::encode(abi_encoded_data),
    funds: vec![],
});

Ok(Response::new().add_message(cross_vm_msg))
```

Il messaggio viene inviato a una coda ed elaborato dall'EndBlocker nel blocco successivo. Consulta [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) per il ciclo di vita completo del messaggio.

---

## Integrazione con i moduli

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
  -y
```

Questo richiama l'entry point `migrate` sul nuovo codice utilizzando lo stato esistente del contratto.

---

## Prossimi passi

* [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) — Chiama contratti EVM e SVM da CosmWasm
* [Sviluppo SVM](/developer-guide/svm-development) — Distribuisci programmi BPF su QoreChain
* [Precompilati EVM](/developer-guide/evm-precompiles) — Accedi alle funzionalità PQC e AI da Solidity
