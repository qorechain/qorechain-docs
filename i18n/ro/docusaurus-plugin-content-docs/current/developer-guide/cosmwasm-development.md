---
slug: /developer-guide/cosmwasm-development
title: Dezvoltare CosmWasm
sidebar_label: Dezvoltare CosmWasm
sidebar_position: 3
---

# Dezvoltare CosmWasm

QoreChain acceptă contracte inteligente **CosmWasm**, permițând dezvoltatorilor să scrie programe sigure, izolate în sandbox, în Rust, care se compilează în WebAssembly. Contractele CosmWasm rulează alături de programele EVM și SVM în cadrul arhitecturii triple-VM a QoreChain.

:::note
Comenzile de mai jos folosesc mainnet-ul **`qorechain-vladi`**, activ din 7 iunie 2026, rulând versiunea de lanț **v3.1.77**. Înlocuiește cu `--chain-id qorechain-diana` pentru testnet.
:::

---

## Cerințe prealabile

| Dependență                 | Versiune      | Scop                           |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Cea mai recentă versiune stabilă | Compilarea contractelor    |
| **wasm32-unknown-unknown** | target        | Țintă de compilare WebAssembly |
| **cargo-generate**         | Cea mai recentă | Schelet de proiect           |
| **cosmwasm-std**           | 1.5+          | Biblioteca standard CosmWasm   |

Instalează ținta Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Ciclul de viață al unui contract

Contractele CosmWasm urmează un ciclu de viață în cinci pași: **Build (compilare)**, **Store (stocare)**, **Instantiate (instanțiere)**, **Execute (execuție)** și **Query (interogare)**.

1. **Build** — Compilează contractul în WebAssembly optimizat:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Fișierul `.wasm` optimizat va fi în directorul `artifacts/`.

2. **Store** — Încarcă contractul compilat pe lanț:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   După ce tranzacția se confirmă, interoghează ID-ul codului stocat:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Creează o nouă instanță de contract dintr-un ID de cod stocat:

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

   | Indicator           | Descriere                                      |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | ID-ul numeric returnat de tranzacția de stocare |
   | `--label`           | Etichetă lizibilă pentru această instanță      |
   | `--no-admin`        | Fără adresă de admin (contractul este imuabil) |
   | `--admin <address>` | Setează un admin care poate migra contractul   |

   Obține adresa contractului:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Execute** — Apelează punctul de intrare execute al unui contract pentru a-i modifica starea:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Execuție cu fonduri atașate:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Query** — Citește starea contractului fără a trimite o tranzacție:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Răspunsurile la interogări sunt returnate în format JSON.

---

## Interogări utile

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

## Structura unui contract

Un contract CosmWasm tipic are trei puncte de intrare:

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

## Apeluri între VM-uri

Contractele CosmWasm pot interacționa cu contracte implementate pe EVM și SVM prin modulul `x/crossvm`. Apelurile între VM-uri din CosmWasm folosesc calea de mesaje **asincronă**:

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

Mesajul este trimis într-o coadă și procesat de EndBlocker în blocul următor. Vezi [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) pentru ciclul de viață complet al mesajelor.

---

## Integrarea cu modulele

Contractele CosmWasm pot interacționa cu modulele Cosmos SDK prin transmitere standard de mesaje:

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

## Migrarea contractelor

Dacă a fost instanțiat contractul cu o adresă `--admin`, adminul îl poate migra la un nou ID de cod:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

Acest lucru apelează punctul de intrare `migrate` din noul cod cu starea existentă a contractului.

---

## Pașii următori

* [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) — Apelează contracte EVM și SVM din CosmWasm
* [Dezvoltare SVM](/developer-guide/svm-development) — Implementează programe BPF pe QoreChain
* [Precompile EVM](/developer-guide/evm-precompiles) — Accesează funcțiile PQC și AI din Solidity
