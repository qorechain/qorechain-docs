---
slug: /developer-guide/cosmwasm-development
title: Dezvoltare CosmWasm
sidebar_label: Dezvoltare CosmWasm
sidebar_position: 3
---

# Dezvoltare CosmWasm

QoreChain acceptă contracte inteligente **CosmWasm**, permițând dezvoltatorilor să scrie programe sigure, izolate în sandbox, în Rust, care se compilează în WebAssembly. Contractele CosmWasm rulează alături de programele EVM și SVM în cadrul arhitecturii triple-VM a QoreChain.

:::note
Comenzile de mai jos folosesc mainnet-ul **`qorechain-vladi`**, activ din 29 iunie 2026, care rulează versiunea de nod **v3.2.1**. Înlocuiește cu `--chain-id qorechain-diana` pentru testnet, care rulează v3.2.2.
:::

:::caution Încărcarea codului și instanțierea necesită momentan permisiune explicită
La momentul redactării, `code_upload_access` și `instantiate_default_permission` sunt ambele setate la **`Nobody`** atât pe **mainnet, cât și pe testnet** — ceea ce înseamnă că `MsgStoreCode` și `MsgInstantiateContract` nu sunt deschise implicit oricărui cont, în urma unei alerte de securitate CosmWasm valabile la nivelul întregii industrii. Va trebui ca guvernanța să acorde contului tău (sau unei liste specifice de adrese) permisiunea de încărcare/instanțiere înainte ca pașii de mai jos să reușească — verifică mai întâi parametrii live, deoarece aceasta este exact genul de setare pe care guvernanța o poate modifica (în prezent, mainnet-ul nu are deloc cod de contract stocat):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

Tipurile de mesaje `MsgStoreCode`, `MsgInstantiateContract` și `MsgInstantiateContract2` sunt, de asemenea, dezactivate de întrerupătorul de circuit (circuit breaker) al lanțului pe ambele rețele (`qorechaind query circuit disabled-list`), așa că ridicarea permisiunii nu este suficientă până când aceste intrări nu sunt eliminate din listă.

Această restricție nu afectează contractele deja instanțiate — `execute` și `query` asupra unui contract existent funcționează normal, indiferent de această setare.
:::

:::caution Semnează cu `tx pqc cosign`
Mainnet-ul și testnet-ul cer o semnătură post-cuantică hibridă pe fiecare tranzacție din lane-ul Cosmos, așa că comenzile `tx` de pe această pagină nu se difuzează așa cum sunt scrise. Ele construiesc tranzacția cu `--generate-only > tx.json`; apoi o semnezi și o difuzezi cu `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (binarul de release din [manifestul de descărcare](/developer-guide/running-a-node#fetch-the-manifest) include semnatarul; un build din sursa publică nu îl include). Pragul minim de taxă al rețelei este de **0,1 uqor per unitate de gas**, exact ceea ce exprimă `--gas-prices 0.1uqor`; semnătura hibridă adaugă aproximativ 47.000 de gas pe care o simulare nu îi include, de aici ajustarea `1.5`. Vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing).
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
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   După ce tranzacția se confirmă (semnează și difuzează `tx.json` cu `tx pqc cosign`, așa cum este descris mai sus), interoghează ID-ul codului stocat:

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
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Indicator           | Descriere                                      |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | ID-ul numeric returnat de tranzacția de stocare |
   | `--label`           | Etichetă lizibilă pentru această instanță      |
   | `--no-admin`        | Fără adresă de admin (contractul este imuabil) |
   | `--admin <address>` | Setează un admin care poate migra contractul   |

   Obține adresa contractului:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — Apelează punctul de intrare execute al unui contract pentru a-i modifica starea:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Execuție cu fonduri atașate:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
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

Apelurile între VM-uri se trimit ca tranzacții `MsgCrossVMCall` prin modulul `x/crossvm`; vezi [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) pentru ciclul de viață al mesajelor. Contractele CosmWasm nu au astăzi o legătură (binding) pe partea contractului pentru a iniția un apel între VM-uri (nu există un mesaj personalizat `QoreChainMsg` pe care contractele să îl emită), așa că un contract nu poate apela un contract EVM sau SVM din interiorul punctului său de intrare `execute`.

:::caution Apelurile între VM-uri sunt în prezent oprite pe mainnet
`MsgCrossVMCall` se află pe lista circuit breaker-ului mainnet-ului (`qorechaind query circuit disabled-list`), iar lane-ul SVM este dezactivat pe ambele rețele, așa că ruta între VM-uri nu poate fi folosită astăzi pentru tranzacții obișnuite.
:::

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

Dacă contractul a fost instanțiat cu o adresă `--admin`, adminul îl poate migra la un nou ID de cod:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

Acest lucru apelează punctul de intrare `migrate` din noul cod cu starea existentă a contractului.

---

## Pașii următori

* [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) — Apelează contracte EVM și SVM din CosmWasm
* [Dezvoltare SVM](/developer-guide/svm-development) — Implementează programe BPF pe QoreChain
* [Precompile EVM](/developer-guide/evm-precompiles) — Referință pentru precompilatele Solidity planificate (încă niciunul nu este activ)
