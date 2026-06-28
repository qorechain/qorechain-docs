---
slug: /developer-guide/cosmwasm-development
title: CosmWasm Development
sidebar_label: CosmWasm Development
sidebar_position: 3
---

# CosmWasm-Entwicklung

QoreChain unterstützt **CosmWasm**-Smart-Contracts und ermöglicht es Entwicklern, sichere, in einer Sandbox isolierte Programme in Rust zu schreiben, die zu WebAssembly kompiliert werden. CosmWasm-Contracts laufen neben EVM- und SVM-Programmen innerhalb der Triple-VM-Architektur von QoreChain.

:::note
Die folgenden Befehle verwenden das **`qorechain-vladi`**-Mainnet, das seit dem 7. Juni 2026 mit der Chain-Version **v3.1.80** in Betrieb ist. Ersetzen Sie `--chain-id qorechain-diana` für das Testnet.
:::

---

## Voraussetzungen

| Abhängigkeit               | Version       | Zweck                          |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Neueste stabile Version | Contract-Kompilierung |
| **wasm32-unknown-unknown** | target        | WebAssembly-Kompilierungsziel  |
| **cargo-generate**         | Neueste       | Projekt-Scaffolding            |
| **cosmwasm-std**           | 1.5+          | CosmWasm-Standardbibliothek    |

Installieren Sie das Wasm-Target:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Contract-Lebenszyklus

CosmWasm-Contracts folgen einem fünfstufigen Lebenszyklus: **Build**, **Store**, **Instantiate**, **Execute** und **Query**.

1. **Build** — Kompilieren Sie Ihren Contract zu optimiertem WebAssembly:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Die optimierte `.wasm`-Datei befindet sich im Verzeichnis `artifacts/`.

2. **Store** — Laden Sie den kompilierten Contract auf die Chain hoch:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   Nachdem die Transaktion bestätigt wurde, fragen Sie die gespeicherte Code-ID ab:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Erstellen Sie eine neue Contract-Instanz aus einer gespeicherten Code-ID:

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

   | Flag                | Beschreibung                                   |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | Numerische ID, die von der Store-Transaktion zurückgegeben wird |
   | `--label`           | Menschenlesbare Bezeichnung für diese Instanz  |
   | `--no-admin`        | Keine Admin-Adresse (Contract ist unveränderlich) |
   | `--admin <address>` | Legen Sie einen Admin fest, der den Contract migrieren kann |

   Rufen Sie die Contract-Adresse ab:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Execute** — Rufen Sie den Execute-Einstiegspunkt eines Contracts auf, um den Zustand zu ändern:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Mit angehängten Mitteln ausführen:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Query** — Lesen Sie den Contract-Zustand, ohne eine Transaktion einzureichen:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Abfrageantworten werden als JSON zurückgegeben.

---

## Nützliche Abfragen

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

## Contract-Struktur

Ein typischer CosmWasm-Contract hat drei Einstiegspunkte:

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

## Cross-VM-Aufrufe

CosmWasm-Contracts können über das Modul `x/crossvm` mit Contracts interagieren, die auf der EVM und SVM bereitgestellt sind. Cross-VM-Aufrufe aus CosmWasm verwenden den **asynchronen** Nachrichtenpfad:

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

Die Nachricht wird in eine Warteschlange eingereiht und vom EndBlocker im nächsten Block verarbeitet. Siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) für den vollständigen Nachrichten-Lebenszyklus.

---

## Modulintegration

CosmWasm-Contracts können über standardmäßiges Message Passing mit Cosmos-SDK-Modulen interagieren:

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

## Contract-Migration

Wenn der Contract mit einer `--admin`-Adresse instanziiert wurde, kann der Admin ihn auf eine neue Code-ID migrieren:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

Dies ruft den `migrate`-Einstiegspunkt auf dem neuen Code mit dem bestehenden Contract-Zustand auf.

---

## Nächste Schritte

* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — EVM- und SVM-Contracts aus CosmWasm aufrufen
* [SVM-Entwicklung](/developer-guide/svm-development) — BPF-Programme auf QoreChain bereitstellen
* [EVM-Precompiles](/developer-guide/evm-precompiles) — Auf PQC- und KI-Funktionen aus Solidity zugreifen
