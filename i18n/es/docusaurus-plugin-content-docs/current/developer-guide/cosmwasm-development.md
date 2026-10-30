---
slug: /developer-guide/cosmwasm-development
title: Desarrollo con QoreChain Native
sidebar_label: Desarrollo con QoreChain Native
sidebar_position: 3
---

# Desarrollo con QoreChain Native

QoreChain admite contratos inteligentes **QoreChain Native**. QoreChain Native es el nombre que QoreChain da a su runtime **CosmWasm**: los desarrolladores escriben programas seguros y aislados (sandboxed) en Rust con las bibliotecas estándar de CosmWasm (`cosmwasm-std`) y los compilan a WebAssembly. Los contratos QoreChain Native se ejecutan junto con los programas EVM y SVM dentro de la arquitectura triple-VM de QoreChain.

:::note
Los comandos siguientes usan la mainnet **`qorechain-vladi`** (activa desde el 7 de junio de 2026), que ejecuta la versión de nodo **v3.2.5** desde el 29 de octubre de 2026 (propuesta de gobernanza 14, altura 3,906,833; v3.2.4 desde el 23 de octubre de 2026). Sustituya `--chain-id qorechain-diana` para la testnet, que ejecuta la v3.2.6 (v3.2.4 desde el 19 de octubre de 2026).
:::

:::caution La subida y la instanciación de código requieren permiso explícito en la mainnet; la testnet difiere
En el momento de escribir esto (comprobado el 27 de octubre de 2026), `code_upload_access` e `instantiate_default_permission` están configurados en **`Nobody`** en la **mainnet**, lo que significa que `MsgStoreCode` y `MsgInstantiateContract` no están abiertos a cuentas arbitrarias, tras un aviso de seguridad a nivel de toda la industria para CosmWasm, el runtime sobre el que está construido QoreChain Native. En la **testnet `qorechain-diana`** los ajustes difieren: `code_upload_access` sigue siendo `Nobody` (el código solo se almacena mediante gobernanza), pero `instantiate_default_permission` es **`Everybody`**, establecido por la gobernanza de la testnet el 27 de octubre de 2026, de modo que cualquier cuenta puede instanciar un código almacenado cuyo propio permiso lo permita. Verifique primero los parámetros en vivo, ya que este es exactamente el tipo de configuración que la gobernanza puede cambiar (actualmente la mainnet no tiene ningún código de contrato almacenado):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

El interruptor de circuito (circuit breaker) de la cadena también desactiva tipos de mensaje en toda la red (`qorechaind query circuit disabled-list`). En la **mainnet**, `MsgStoreCode`, `MsgInstantiateContract` y `MsgInstantiateContract2` están en la lista, por lo que elevar el permiso por sí solo no basta mientras esas entradas no se levanten. En la **testnet** solo `MsgStoreCode` está en la lista: la instanciación está abierta, la subida no.

**Testnet: contratos revisados almacenados por la gobernanza.** Como las cuentas ordinarias no pueden subir código en la testnet, la gobernanza almacenó cinco contratos revisados que cualquiera puede instanciar (`instantiate_permission` `Everybody`): cw20-base (token), cw721-base (colección de NFT), cw4-group, cw3-fixed-multisig y un pequeño contrato contador. En el momento de escribir esto son los code ids 859 a 863, en ese orden, listados por `GET /cosmwasm/wasm/v1/code` con la cuenta del módulo de gobernanza como creador e identificados por su `data_hash`; lea los ids de la lista en vivo en lugar de fijarlos en el código. Existen solo en la testnet. La mainnet no tiene código almacenado.

Esta restricción no afecta a los contratos ya instanciados: `execute` y `query` contra un contrato existente funcionan normalmente sin importar esta configuración.
:::

:::caution Firme con `tx pqc cosign`
La mainnet y la testnet exigen una firma híbrida poscuántica en cada transacción del carril Cosmos, por lo que los comandos `tx` de esta página no se difunden tal como están escritos. Construyen la transacción con `--generate-only > tx.json`; después fírmela y difúndala con `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (el binario de la versión publicada del [manifiesto de descargas](/developer-guide/running-a-node#fetch-the-manifest) incluye el firmante; una compilación desde el código fuente público no). El umbral mínimo de comisión de la red es de **0.1 uqor por unidad de gas**, que es lo que expresa `--gas-prices 0.1uqor`; la firma híbrida añade aproximadamente 47,000 de gas que una simulación no incluye, de ahí el ajuste de `1.5`. Consulte [Firma poscuántica](/developer-guide/post-quantum-signing).
:::

---

## Requisitos previos

| Dependencia                 | Versión       | Propósito                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Última estable | Compilación de contratos           |
| **wasm32-unknown-unknown** | target        | Objetivo de compilación de WebAssembly |
| **cargo-generate**         | Última        | Estructura inicial del proyecto            |
| **cosmwasm-std**           | 1.5+          | Biblioteca estándar de CosmWasm              |

Instale el objetivo Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Ciclo de vida del contrato

Los contratos QoreChain Native siguen un ciclo de vida de cinco pasos: **Build** (compilar), **Store** (almacenar), **Instantiate** (instanciar), **Execute** (ejecutar) y **Query** (consultar).

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
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Después de que la transacción se confirme (firme y difunda `tx.json` con `tx pqc cosign` como se describió arriba), consulte el ID de código almacenado:

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
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Flag                | Descripción                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | ID numérico devuelto por la transacción de almacenamiento |
   | `--label`           | Etiqueta legible para esta instancia         |
   | `--no-admin`        | Sin dirección de administrador (el contrato es inmutable)       |
   | `--admin <address>` | Establece un administrador que puede migrar el contrato      |

   Recupere la dirección del contrato:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — Invoque el punto de entrada de ejecución de un contrato para cambiar el estado:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Ejecute con fondos adjuntos:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
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

## Estructura del contrato

Un contrato QoreChain Native típico tiene tres puntos de entrada:

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

Las llamadas entre VMs se envían como transacciones `MsgCrossVMCall` a través del módulo `x/crossvm`; consulte [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) para conocer el ciclo de vida del mensaje. Los contratos QoreChain Native no tienen un enlace dedicado del lado del contrato para iniciar una llamada entre VMs (no existe un mensaje personalizado `QoreChainMsg` que los contratos puedan emitir), por lo que un contrato no puede llamar a un contrato EVM o SVM desde dentro de su punto de entrada `execute`. Desde v3.2.3 se rechaza una llamada hacia el propio carril del llamante, y una llamada en cola que falla no deja efectos secundarios.

:::caution Las llamadas entre VMs están actualmente desactivadas en mainnet
`MsgCrossVMCall` está en la lista del interruptor de circuito de la mainnet (`qorechaind query circuit disabled-list`), y el carril SVM está desactivado en ambas redes, por lo que la ruta entre VMs hoy no es utilizable para transacciones ordinarias.
:::

---

## Integración con módulos

Los contratos QoreChain Native pueden interactuar con los módulos del Cosmos SDK mediante el paso de mensajes estándar:

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
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

Esto invoca el punto de entrada `migrate` en el nuevo código con el estado existente del contrato.

---

## Próximos pasos

* [Interoperabilidad entre VMs](/developer-guide/cross-vm-interoperability) — Llame a contratos EVM y SVM desde QoreChain Native
* [Desarrollo con SVM](/developer-guide/svm-development) — Despliegue programas BPF en QoreChain
* [Precompilados EVM](/developer-guide/evm-precompiles) — Referencia de los precompilados de Solidity (ninguno está activo en la mainnet; tres están activos en la testnet)
