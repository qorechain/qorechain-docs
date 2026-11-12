---
slug: /developer-guide/evm-window-reference
title: Referencia de la ventana de autorización EVM (v3.2.8)
sidebar_label: Referencia de la ventana EVM
sidebar_position: 7
---

# Referencia de la ventana de autorización EVM (v3.2.8)

Una transacción de Ethereum lleva una firma secp256k1 y nada más, así que no puede llevar la firma post-cuántica (ML-DSA-87) que QoreChain exige a todas las demás transacciones. La **ventana de autorización EVM** cierra esa brecha. La cuenta abre primero una ventana acotada con un mensaje QoreChain Native que **sí** está firmado con su clave post-cuántica, y el carril EVM admite entonces las transacciones normales de la cuenta hechas con MetaMask, ethers.js, Hardhat o Foundry solo mientras la ventana las cubra. Esta página es la referencia completa de cómo se comporta una ventana en la versión **v3.2.8**.

:::note Dónde se ejecuta v3.2.8
La testnet **`qorechain-diana`** ejecuta **v3.2.8** desde el 12 de noviembre de 2026. La mainnet **`qorechain-vladi`** todavía no la ha aplicado; en mainnet la ventana funciona como se describe en [Desarrollo EVM](/developer-guide/evm-development#evm-window), sin las opciones y reglas marcadas como "v3.2.8" más abajo. Un nodo anterior a v3.2.8 rechaza un mensaje de ventana que fije las nuevas listas.
:::

## Por qué importa {#why}

- **Una clave clásica robada vale solo lo que admita una ventana abierta.** La ventana acota el tiempo (bloques), el número de transacciones, el QOR que puede salir y, opcionalmente, qué contratos puede tocar la cuenta.
- **La clave post-cuántica sigue al mando.** Abrir, restringir y cerrar una ventana son mensajes Native con firma híbrida. La clave clásica por sí sola nunca puede abrir una.
- **v3.2.8 endurece los valores por defecto.** Los métodos de los precompilados estándar se deniegan por defecto, las firmas que comprueban otros contratos necesitan el consentimiento de la ventana, y cambiar la clave post-cuántica cierra la ventana.

El resumen corto de las novedades de v3.2.8 está en [Opciones de ventana añadidas en v3.2.8](/developer-guide/evm-development#evm-window-v328); esta página no lo repite por completo y añade los ejemplos, la referencia de campos y la tabla de errores. Para la primera ventana paso a paso, consulta [Tu primera transacción](/getting-started/first-transaction#evm-window).

## Abrir, cerrar y leer {#lifecycle}

| Acción | Mensaje | CLI | REST |
| ------ | ------- | --- | ---- |
| Abrir (reemplaza cualquier ventana abierta) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | ninguna (es una transacción) |
| Cerrar de inmediato | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | ninguna (es una transacción) |
| Leer | ninguno | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

Abrir y cerrar son transacciones del carril Native y necesitan la firma híbrida de la cuenta (clásica más ML-DSA-87), y la cuenta debe tener ya registrada una clave post-cuántica para abrir una ventana. Cerrar una ventana también retira un consentimiento EIP-7702 pendiente. Abrir **avanza el nonce de la cuenta** (la secuencia Native es el nonce EVM), así que abre primero la ventana y lee el nonce EVM después.

### CLI {#cli}

Construye la transacción con `--generate-only` y después añade la firma post-cuántica con `tx pqc cosign`. El binario `qorechaind` oficial tiene `gen-key` y `cosign`; una compilación de la comunidad no.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Sin argumentos, la CLI usa valores por defecto dimensionados para una sesión de despliegue: 3,600 bloques, 10 transacciones y 25 QOR. Una ventana limitada a un contrato, que además puede delegar en un validador y enviar a un receptor IBC:

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x0000000000000000000000000000000000000800 \
  --staking-validators qorvaloper1... \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Cierra una ventana antes de tiempo, por ejemplo si crees que la clave clásica está expuesta. Lo que la ventana aún admitiera se rechaza a partir del siguiente bloque:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Lee la ventana:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

Lo que quieres ver es `live: true` junto con `remaining_blocks`, `remaining_txs` y `remaining_value` (uqor). La referencia del comando está en [Comandos de transacción](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

Una cuenta sin ventana responde HTTP 200 con `found: false`, así que la ruta es segura para consultar de forma periódica. Todos los números son cadenas JSON. Una ventana almacenada puede estar caducada o agotada: `live` indica si todavía admite al menos una transacción más de valor cero a la altura actual.

### TypeScript {#typescript}

Los ayudantes de ventana están en `@qorechain/sdk` (consulta la [guía EVM del SDK](/sdk/guides/evm#evm-window-scope) para la configuración de la firma). `openEvmWindowMsg` acepta todos los campos de abajo, `closeEvmWindowMsg` construye el mensaje de cierre, `fetchEvmWindow` lee la ventana y `classifyEvmWindowRejection` explica un rechazo.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract and delegate to one validator.
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x0000000000000000000000000000000000000800"],
      stakingValidators: ["qorvaloper1..."],
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg` comprueba los límites y los formatos de las listas antes de firmar nada, de modo que un error falla en local en vez de costar una transacción rechazada. `MAX_EVM_WINDOW_BLOCKS` y `MAX_EVM_WINDOW_TXS` exportan los límites. La lectura (`fetchEvmWindow`) devuelve los límites, los contadores y el alcance de v3.2.3 (`nativeOnly`, `allowedTargets`); `validators` (direcciones de contrato), `stakingValidators` (`qorvaloper1...`) e `ibcReceivers` (`"<channel>/<receiver>"`) los acepta el constructor desde el SDK 0.14.0, que lleva las listas de v3.2.8; la lectura no las devuelve, así que léelas por REST. El ejemplo anterior usa `stakingValidators`; no se ha ejecutado con el SDK 0.14.0. Fija las tres listas solo en una red que ejecute v3.2.8: un nodo anterior rechaza un mensaje de ventana que las fije. Con un `connectTx` de firma híbrida, la clave post-cuántica ya debe estar registrada.

### Probado en la testnet {#tested}

Ejecutado en `qorechain-diana` el 12 de noviembre de 2026 (versión v3.2.8) con una cuenta eth-native que había registrado su clave post-cuántica, usando el SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) y firma híbrida. Los campos de ventana `validators`, `staking_validators` e `ibc_receivers` no estaban en los constructores del SDK 0.13.0; el SDK 0.14.0 los añade a `openEvmWindowMsg`, y esta prueba no los usó (usa la línea de comandos para ellos con el SDK 0.13.0).

| Paso | Resultado |
| ---- | ------ |
| `GET /qorechain/pqc/v1/evm_window/{address}` antes de abrir | `found: false`, `live: false` |
| Abrir: 300 bloques, 5 transacciones, 1,000,000 uqor | code 0, 187,282 de gas usado. Lectura posterior: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| Abrir de nuevo con `nativeOnly: true` | code 0, 187,803 de gas usado. La nueva ventana reemplazó a la anterior: `native_only: true`, un nuevo `opened_height` |
| Cerrar | code 0, 170,468 de gas usado. Lectura posterior: `found: false` |

Con el SDK 0.14.0 el mismo día, una ventana abierta con `allowedTargets` (la dirección del precompilado de staking), `stakingValidators` (una dirección de operador de validador) e `ibcReceivers` (un par `channel-0/...`) tuvo éxito con code 0 y 195,233 de gas usado. La lectura REST posterior listó `allowed_targets` y devolvió `found: true`, `live: true`; no devuelve las listas `validators`, `staking_validators` ni `ibc_receivers`, así que conserva los valores con los que abriste la ventana.

`fetchEvmWindow` devolvió los mismos campos en camel case (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). Abrir y cerrar son transacciones de Cosmos con firma híbrida, de modo que la primera que envía una cuenta necesita que su clave esté registrada antes.

### Python, Go, Rust y Java {#other-languages}

Cada SDK tiene un constructor del mensaje y una lectura REST. Todos comprueban en local los límites de la cadena. Un constructor de lenguaje que fije las listas de v3.2.8 necesita el SDK 0.14.0 o posterior (Java: 0.14.0 cuando aparezca en Maven Central, que todavía muestra la 0.13.0 el 12 de noviembre de 2026); las versiones anteriores construyen solo los campos antiguos.

| Lenguaje | Abrir (con todas las listas) | Cerrar | Leer | Límites EVM |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` con un `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` con `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | todavía sin ayudante; lee la ruta REST |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x0000000000000000000000000000000000000800"],
    staking_validators=["qorvaloper1..."],
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets:    []string{"0x0000000000000000000000000000000000000800"},
        StakingValidators: []string{"qorvaloper1..."},
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x0000000000000000000000000000000000000800".into()],
    staking_validators: vec!["qorvaloper1...".into()],
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x0000000000000000000000000000000000000800"), // allowedTargets
    null,                                                   // validators
    List.of("qorvaloper1..."),                              // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

El SDK nunca abre una ventana por ti. Una ventana autoriza gasto, así que el paso sigue siendo explícito y visible para el usuario.

## Campos {#fields}

| Campo (flag de la CLI) | Límite | Significado |
| ---------------- | ----- | ------- |
| `blocks` (primer argumento) | 1 a 17,280 | La ventana no admite nada después de la altura de apertura más `blocks`. Es un número de bloques, no una duración: unas 5 horas en la testnet y unas 15 horas en mainnet con los tiempos de bloque actuales |
| `max_txs` (segundo argumento) | 1 a 1,000 | Cuántas transacciones EVM admite |
| `max_value` (tercer argumento) | positivo | Total de uqor que la ventana deja salir de la cuenta: el valor transferido **más** la comisión máxima (límite de gas por tope de comisión) de cada transacción admitida |
| `native_only` (`--native-only`) | true o false | Admite solo transferencias simples de QOR: sin calldata, sin creación de contratos, sin destinatario que lleve código, sin autorización EIP-7702 |
| `allowed_targets` (`--allowed-targets`) | como máximo 16 direcciones `0x`, sin duplicados | Admite solo transacciones hacia estas direcciones; la creación de contratos se rechaza |
| `validators` (`--validators`) | como máximo 16 direcciones `0x`, sin duplicados | Contratos cuya comprobación de la firma de la cuenta cuenta para las propias acciones de la cuenta: un módulo validador al que llama un contrato de wallet, o el punto de entrada ERC-4337. v3.2.8 |
| `staking_validators` (`--staking-validators`) | como máximo 16 direcciones `qorvaloper...`, sin duplicados | Validadores en los que la cuenta puede delegar o redelegar a través de la ventana. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | como máximo 16 entradas `<channel>/<receiver>`, de como máximo 256 caracteres cada una, sin espacios ni comas | Destinos exactos a los que puede ir una transferencia IBC de QOR nativo. Se comparan byte a byte, así que escribe `channel-0` y el receptor bech32 en minúsculas exactamente como los lleva la transferencia. v3.2.8 |

Hay que dar todos los límites: la cadena rechaza uno que falte en lugar de usar un valor por defecto (la CLI rellena ella misma los valores por defecto de sesión de despliegue). Cualquier límite que se agote termina la ventana en la práctica. Una ventana funciona solo mientras la clave post-cuántica de la cuenta sea utilizable, es decir, no vacía, no solo clásica y no desactivada por la gobernanza.

### Qué cuenta una ventana {#counting}

En la admisión, antes de que se ejecute la transacción, cada transacción EVM usa una de `max_txs` y suma al valor usado su valor transferido más su comisión máxima, convertidos de la unidad EVM de 18 decimales a uqor y redondeados hacia arriba. Una transacción que se admite y luego revierte ha usado igualmente su parte. Tras la ejecución, el QOR nativo que un precompilado movió en nombre de la cuenta (una delegación, un depósito, una transferencia IBC) también se carga a la ventana, de modo que cuenta contra `max_value` aunque el valor de la transacción fuera cero.

No cuentan: `eth_call`, `eth_estimateGas` ni las simulaciones. Los tokens no se tarifan en absoluto: una transferencia o aprobación ERC-20 lleva valor cero, así que acótalas con un alcance (`allowed_targets`). Cada cargo emite un evento `pqc_evm_window_used` con los atributos `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` y `source` (`ante` para la admisión, `settlement` para el cargo posterior a la ejecución), de modo que una wallet puede mostrar lo que consumió una transacción. La apertura y el cierre emiten `pqc_evm_window_opened` y `pqc_evm_window_closed`.

## Precompilados estándar a través de una ventana {#precompile-allowlist}

Para una cuenta que autoriza una ventana, un método de un precompilado estándar (staking, distribution, ICS-20, gov, slashing, los precompilados de token ERC-20) se rechaza salvo que esté en la tabla y la ventana liste ese precompilado en `allowed_targets`. Las direcciones de los precompilados están en [Precompilados EVM](/developer-guide/evm-precompiles); las de staking, distribution, ICS-20 y gov son `0x...0800`, `0x...0801`, `0x...0802` y `0x...0805`.

| Precompilado | Método | Se admite cuando |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | las recompensas se pagan a la propia cuenta (su dirección de retiro es la suya) |
| distribution | `withdrawValidatorCommission` | el validador es de la propia cuenta y paga a la propia cuenta |
| distribution | `depositValidatorRewardsPool` | el validador está en `staking_validators` y todas las monedas son QOR nativo |
| staking | `delegate`, `redelegate` | el validador de destino está en `staking_validators` |
| ICS-20 | `transfer` | QOR nativo, por el puerto `transfer`, sin memo, hacia un par de `ibc_receivers` |
| precompilados de token ERC-20 | `transfer`, `transferFrom`, `approve` | QOR nativo; otro token solo cuando la ventana lista la dirección de ese token |

Todo lo demás se rechaza a través de una ventana, sea lo que sea lo que liste: deshacer una delegación, cancelar un unbonding, votar y otras acciones de gobernanza, cambiar la dirección de retiro, crear o editar un validador, unjail, financiar el pool comunitario. Envía eso como transacciones Native con firma post-cuántica. Listar ICS-20 sin `ibc_receivers` no admite ninguna transferencia, y listar el precompilado de staking sin `staking_validators` no admite ninguna delegación.

Ejemplos de qué listar:

| Objetivo | Ventana |
| ---- | ------ |
| Reclamar recompensas de staking desde MetaMask | `allowed_targets` con el precompilado de distribution; mantén la dirección de retiro como la propia cuenta |
| Hacer staking desde MetaMask | `allowed_targets` con el precompilado de staking, más `staking_validators` |
| Sacar QOR por el puente | `allowed_targets` con el precompilado ICS-20, más `ibc_receivers` como `channel-0/<receiver>` |
| Mover un token IBC mantenido como precompilado ERC-20 | `allowed_targets` con la dirección de ese token |

Listar un contrato es el consentimiento de la cuenta a lo que ese contrato pueda hacer con sus activos: para una bóveda, un router o un token que mantiene los tokens de la cuenta, la ventana no acota qué tokens se mueven ni adónde.

## Creación de contratos {#contract-creation}

Desplegar un contrato necesita una ventana **sin alcance**. Una ventana con `native_only` o con `allowed_targets` rechaza la creación de contratos. Para una sesión de despliegue, abre una ventana simple (los valores por defecto de la CLI están dimensionados para una), despliega y ciérrala. Para sesiones posteriores, abre una ventana con `--allowed-targets <contract-address>` para limitarla a llamadas al contrato que desplegaste. La guía de despliegue con Hardhat y Foundry está en [Desarrollo EVM](/developer-guide/evm-development).

## Permits, órdenes EIP-712 y Permit2 {#permits}

Un permit EIP-2612, una transferencia Permit2, una orden firmada o una meta-transacción las comprueba un contrato con el precompilado `ecrecover`. Desde v3.2.8 (en ambas redes, cuando cada red la aplique), para una cuenta que tiene una clave post-cuántica utilizable esa comprobación tiene éxito solo mientras la **ventana activa** de la propia cuenta admita el **contrato verificador**, que es el propio token o Permit2 y no el router que reenvía la llamada.

1. Si la ventana tiene alcance, lista el contrato verificador en `allowed_targets` (`native_only` no admite ninguna firma así).
2. Abre la ventana **antes** de que el usuario firme. Sin una ventana activa la firma se trata como inválida y el contrato la rechaza.
3. La firma en sí nunca se carga a la ventana, porque una firma es pública una vez usada.
4. Un permit o una aprobación concedidos dentro de una ventana permanecen tras cerrarse la ventana. Revisa y revoca las aprobaciones al terminar la sesión.

Las cuentas sin registro post-cuántico, una wallet delegada que comprueba su propia firma y la firma del propio remitente en una ventana sin alcance se recuperan como antes. Las consultas y las estimaciones de gas no se ven afectadas.

## Cambios de clave y consentimiento EIP-7702 {#key-changes}

- **Rotar, migrar o volver a registrar la clave post-cuántica cierra la ventana** y elimina cualquier consentimiento EIP-7702. Abre la ventana de nuevo después. Tenlo en cuenta en wallets calientes e integraciones de exchanges.
- La ventana, el consentimiento EIP-7702 (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) y los mensajes de gestión de cuentas abstractas deben ser el **propio mensaje de nivel superior de la cuenta, con firma híbrida**. No pueden enviarse mediante authz (`MsgExec`) ni concederse a otra cuenta, y se rechaza una concesión de esos tipos de mensaje. Las concesiones de consentimiento de este tipo que existían se eliminaron en la actualización.
- Una cuenta delegada EIP-7702 que actúa dentro de la transacción de otra persona necesita su propia ventana activa en el momento en que actúa su código. Sin ella solo falla esa llamada, y el contrato que llama ve el fallo, de modo que un pago a una cuenta delegada ya no hace revertir toda la transacción del pagador.

El consentimiento para una delegación se registra con `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` y se lee con `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`; consulta [Delegaciones EIP-7702](/developer-guide/evm-development#eip-7702).

## Límites vigentes {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

La testnet respondió el 12 de noviembre de 2026 con `tx_max_gas` **30000000** y `precompile_input_max_bytes` **16384**:

| Límite | Valor | Significado |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | El máximo de gas que una transacción EVM puede pedir; por encima, la transacción se rechaza antes de ejecutarse. Las ejecuciones EVM iniciadas por un mismo mensaje Native comparten el mismo presupuesto |
| `precompile_input_max_bytes` | 16,384 | La mayor entrada que acepta un precompilado con estado protegido |
| Ventana `blocks` | 17,280 | Ventana más larga |
| Ventana `max_txs` | 1,000 | Máximo de transacciones en una ventana |
| Entradas de lista | 16 por lista | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

La respuesta también lleva un objeto `limits` con los valores fijados por la gobernanza; lee los `tx_max_gas` y `precompile_input_max_bytes` de nivel superior, que son los valores vigentes. La ruta se sirve desde v3.2.8, así que la mainnet pública responde `501 Not Implemented` hasta que se actualice.

Una ventana abierta a un precio de gas normal sigue contando la comisión máxima: un límite de gas de 30,000,000 con un tope de comisión de 100 gwei cuenta 3 QOR contra `max_value` por una transacción.

## Errores {#errors}

Los rechazos llegan con el codespace `pqc`. Por JSON-RPC de EVM un rechazo llega como un error de difusión que lleva el mensaje y ningún codespace, así que compara también por el texto (los clasificadores del SDK lo hacen).

| Código | Mensaje | Causa | Qué hacer |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | No hay ventana, no hay clave post-cuántica registrada o la ventana caducó | Registra una clave primero si no hay ninguna y después abre una ventana |
| 27 | `EVM authorisation window exhausted` | Un límite está agotado o la transacción queda fuera del alcance de la ventana (incluido un precompilado estándar que la ventana no lista, o la creación de contratos con una ventana con alcance) | Abre una nueva ventana con límites mayores o con el alcance que necesites |
| 28 | `invalid EVM authorisation window` | Una solicitud de apertura fuera de los límites, o sin clave utilizable en ese momento | Revisa `blocks`, `max_txs`, `max_value` y las listas; registra o repara la clave |
| 62 | `delegated account has no window covering this action` | Una cuenta delegada actuó, o el remitente movió más de lo que cubre su ventana, sin una ventana que lo cubra. Desde v3.2.8 la misma regla hace fallar solo la llamada infractora | Abre una ventana para esa cuenta que admita la acción |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Un método de un precompilado estándar cuyo mensaje Native está desactivado | Espera; no hay nada que cambiar en la ventana |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | Un precompilado que mueve valor al que se llega mediante código, para una cuenta cuya ventana no lo lista | Añade el precompilado a `allowed_targets` |
| nonce | `nonce too low` | La transacción EVM se firmó antes de abrir la ventana (abrir avanza el nonce) | Vuelve a leer el nonce y firma de nuevo |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | Una transacción firmada sin chain id | Fija el chain id en la configuración de red de la herramienta |

`classifyEvmWindowRejection(err)` en el SDK de TypeScript devuelve `"no-pqc-key"`, `"no-window"`, `"exhausted"` o `"invalid"`; los demás SDK tienen un clasificador equivalente (`describe_evm_window_error` en Python, `tx.ClassifyEVMWindowError` en Go, `classify_evm_window_error` en Rust, `EvmWindowIssue.classify` en Java).

## Lo que la ventana no gobierna {#outside}

La ventana gobierna el carril EVM, es decir, las transacciones firmadas solo con la clave clásica. Lo siguiente no se le carga, porque cada cosa lleva su propia firma post-cuántica o la inicia un módulo para una cuenta que sí firmó:

- Los mensajes del carril Native que la cuenta firma ella misma: envíos de bank, staking, gobernanza y un `MsgCrossVMCall` hacia el EVM, que se ejecuta como la propia dirección `0x` del firmante.
- Las ejecuciones de cuenta abstracta autorizadas por los autenticadores de la cuenta.
- Las conversiones ERC-20 y los callbacks IBC ejecutados por módulos.

Una llamada entre VM hacia el EVM que el remitente no envió él mismo (por ejemplo, bajo una concesión authz) se ejecuta bajo la ventana del remitente y necesita que esta admita el destino. El puente entre VM `0x0901` necesita una ventana que lo liste. Consulta [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability).

## Flujo con MetaMask y QoreX {#qorex-flow}

MetaMask firma con una clave de Ethereum, que es la clave de una **cuenta de estilo Ethereum (coin 60)**, y MetaMask no puede producir un mensaje Native. QoreX es donde una cuenta así abre su ventana; los envíos propios de QoreX usan el carril Native y nunca necesitan una.

1. En QoreX, añade o restaura la cuenta coin-60 de tu frase de MetaMask (consulta [Restaurar una frase desde MetaMask o el Dashboard](/qorex/getting-started#restore-dashboard)). La cuenta necesita una clave ML-DSA-87 registrada; tu primera transferencia en QoreX la registra.
2. Abre la tarjeta **Ventana de acceso EVM** (app: Ajustes, Seguridad, Ventana de acceso EVM; extensión: el botón **Ventana de acceso EVM** del popup) y elige cuántos bloques (hasta 17,280), cuántas transacciones (hasta 1,000) y el tope de gasto en QOR. El tope cubre cada importe más su comisión máxima. Los valores por defecto son 300 bloques, 5 transacciones y 1 QOR.
3. Aprueba el mensaje con firma híbrida. Una nueva ventana reemplaza a cualquier ventana abierta, y abrir avanza tu nonce, así que envía desde MetaMask solo después; una transacción preparada antes se rechaza con "nonce too low".
4. Envía desde MetaMask contra el chain id 9800 (testnet) o 9801 (mainnet). Cuando termines, usa **Cerrar la ventana**, que se ofrece solo mientras haya una ventana activa.

La tarjeta de QoreX fija los tres límites. No ofrece una pantalla para las listas de alcance (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`), así que una ventana con alcance se crea desde `qorechaind` o un SDK. Consulta [Ventana de acceso EVM](/qorex/security-and-recovery#evm-window) para la tarjeta y sus cuatro estados.

## Páginas relacionadas {#related}

- [Desarrollo EVM](/developer-guide/evm-development): el runtime, los límites de gas y las [opciones de ventana de v3.2.8](/developer-guide/evm-development#evm-window-v328)
- [Precompilados EVM](/developer-guide/evm-precompiles)
- [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability)
- [Firma post-cuántica](/developer-guide/post-quantum-signing)
- [Guía EVM del SDK](/sdk/guides/evm#evm-window-scope)
- [Comandos de transacción](/cli-reference/transaction-commands#open-evm-window) y [Comandos de consulta](/cli-reference/query-commands)
- [Endpoints REST y gRPC](/api-reference/rest-grpc-endpoints)
- [Tu primera transacción](/getting-started/first-transaction#evm-window)
- [QoreX: ventana de acceso EVM](/qorex/security-and-recovery#evm-window)
