---
slug: /developer-guide/cosmwasm-development
title: Desarrollo en CosmWasm
sidebar_label: Desarrollo en CosmWasm
sidebar_position: 3
---

# Desarrollo en CosmWasm

QoreChain admite contratos inteligentes **CosmWasm**, lo que permite a los desarrolladores escribir programas seguros y aislados en sandbox en Rust que compilan a WebAssembly. Los contratos CosmWasm se ejecutan junto a los programas EVM y SVM dentro de la arquitectura de triple VM de QoreChain.

:::note
Los comandos siguientes usan la mainnet **`qorechain-vladi`**, en funcionamiento desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.80**. Sustituye por `--chain-id qorechain-diana` para la testnet.
:::

---

## Requisitos previos

| Dependencia                | Versión       | Propósito                      |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Última estable | Compilación de contratos       |
| **wasm32-unknown-unknown** | target        | Objetivo de compilación a WebAssembly |
| **cargo-generate**         | Última         | Andamiaje de proyectos         |
| **cosmwasm-std**           | 1.5+          | Librería estándar de CosmWasm  |

Instala el target de Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Ciclo de vida del contrato

Los contratos CosmWasm siguen un ciclo de vida de cinco pasos: **Build** (compilar), **Store** (almacenar), **Instantiate** (instanciar), **Execute** (ejecutar) y **Query** (consultar).

1. **Build** — Compila tu contrato a WebAssembly optimizado:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   El archivo `.wasm` optimizado estará en el directorio `artifacts/`.

2. **Store** — Sube el contrato compilado a la cadena:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   Tras confirmarse la transacción, consulta el ID de código almacenado:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Crea una nueva instancia de contrato a partir de un ID de código almacenado:

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

   | Flag                | Descripción                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | ID numérico devuelto por la transacción de almacenamiento |
   | `--label`           | Etiqueta legible para esta instancia           |
   | `--no-admin`        | Sin dirección de administrador (el contrato es inmutable) |
   | `--admin <address>` | Establece un administrador que puede migrar el contrato |

   Recupera la dirección del contrato:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Execute** — Llama al punto de entrada execute de un contrato para cambiar su estado:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Ejecutar con fondos adjuntos:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Query** — Lee el estado del contrato sin enviar una transacción:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Las respuestas de las consultas se devuelven como JSON.

---

## Consultas útiles

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

## Estructura del contrato

Un contrato CosmWasm típico tiene tres puntos de entrada:

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

## Llamadas entre VM

Los contratos CosmWasm pueden interactuar con contratos desplegados en la EVM y la SVM a través del módulo `x/crossvm`. Las llamadas entre VM desde CosmWasm usan la ruta de mensajes **asíncrona**:

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

El mensaje se envía a una cola y lo procesa el EndBlocker en el siguiente bloque. Consulta [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) para conocer el ciclo de vida completo del mensaje.

---

## Integración con módulos

Los contratos CosmWasm pueden interactuar con los módulos del Cosmos SDK a través del paso de mensajes estándar:

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

## Migración de contratos

Si el contrato se instanció con una dirección `--admin`, el administrador puede migrarlo a un nuevo ID de código:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

Esto llama al punto de entrada `migrate` en el nuevo código con el estado existente del contrato.

---

## Próximos pasos

* [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) — Llama a contratos EVM y SVM desde CosmWasm
* [Desarrollo en SVM](/developer-guide/svm-development) — Despliega programas BPF en QoreChain
* [Precompilados de EVM](/developer-guide/evm-precompiles) — Accede a funcionalidades de PQC e IA desde Solidity
