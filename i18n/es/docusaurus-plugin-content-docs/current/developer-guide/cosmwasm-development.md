---
slug: /developer-guide/cosmwasm-development
title: Desarrollo con CosmWasm
sidebar_label: Desarrollo con CosmWasm
sidebar_position: 3
---

# Desarrollo con CosmWasm

QoreChain admite contratos inteligentes **CosmWasm**, lo que permite a los desarrolladores escribir programas seguros y aislados (sandboxed) en Rust que se compilan a WebAssembly. Los contratos CosmWasm se ejecutan junto con los programas EVM y SVM dentro de la arquitectura triple-VM de QoreChain.

:::note
Los comandos siguientes usan la mainnet **`qorechain-vladi`**, activa desde el 7 de junio de 2026 y ejecutando la versión de cadena **v3.1.92**. Sustituya `--chain-id qorechain-diana` para la testnet.
:::

---

## Requisitos previos

| Dependencia                 | Versión       | Propósito                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Última estable | Compilación de contratos           |
| **wasm32-unknown-unknown** | target        | Objetivo de compilación de WebAssembly |
| **cargo-generate**         | Última        | Estructura inicial del proyecto            |
| **cosmwasm-std**           | 1.5+          | Biblioteca estándar de CosmWasm      |

Instale el objetivo Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Ciclo de vida del contrato

Los contratos CosmWasm siguen un ciclo de vida de cinco pasos: **Build** (compilar), **Store** (almacenar), **Instantiate** (instanciar), **Execute** (ejecutar) y **Query** (consultar).

1. **Build** — Compile su contrato a WebAssembly optimizado:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   El archivo `.wasm` optimizado estará en el directorio `artifacts/`.

2. **Store** — Suba el contrato compilado a la cadena:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   Después de que la transacción se confirme, consulte el ID de código almacenado:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Cree una nueva instancia de contrato a partir de un ID de código almacenado:

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
   | `--label`           | Etiqueta legible para esta instancia         |
   | `--no-admin`        | Sin dirección de administrador (el contrato es inmutable)       |
   | `--admin <address>` | Establece un administrador que puede migrar el contrato      |

   Recupere la dirección del contrato:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Execute** — Invoque el punto de entrada de ejecución de un contrato para cambiar el estado:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Ejecute con fondos adjuntos:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Query** — Lea el estado del contrato sin enviar una transacción:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Las respuestas de las consultas se devuelven en formato JSON.

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

## Llamadas entre VMs

Los contratos CosmWasm pueden interactuar con contratos desplegados en EVM y SVM a través del módulo `x/crossvm`. Las llamadas entre VMs desde CosmWasm usan la ruta de mensajes **asíncrona**:

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

El mensaje se envía a una cola y es procesado por el EndBlocker en el siguiente bloque. Consulte [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) para conocer el ciclo de vida completo del mensaje.

---

## Integración con módulos

Los contratos CosmWasm pueden interactuar con los módulos del Cosmos SDK mediante el paso de mensajes estándar:

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

## Migración del contrato

Si el contrato se instanció con una dirección `--admin`, el administrador puede migrarlo a un nuevo ID de código:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

Esto invoca el punto de entrada `migrate` en el nuevo código con el estado existente del contrato.

---

## Próximos pasos

* [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) — Llame a contratos EVM y SVM desde CosmWasm
* [Desarrollo con SVM](/developer-guide/svm-development) — Despliegue programas BPF en QoreChain
* [Precompilados EVM](/developer-guide/evm-precompiles) — Acceda a funciones PQC y de IA desde Solidity
