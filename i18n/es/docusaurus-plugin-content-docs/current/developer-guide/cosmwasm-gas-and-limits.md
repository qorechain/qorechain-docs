---
slug: /developer-guide/cosmwasm-gas-and-limits
title: Gas, precios y límites de subida de CosmWasm
sidebar_label: Gas y límites de CosmWasm
sidebar_position: 6
---

# Gas, precios y límites de subida de CosmWasm

Los contratos QoreChain Native (el nombre que QoreChain da a su runtime CosmWasm) se tarifan según lo que cuesta ejecutarlos a un validador. Desde la versión **v3.2.8** el precio de una llamada a un contrato depende de tres cosas: si el código del contrato ya está cargado en memoria en el bloque actual, cuánta actividad de contratos tiene el bloque y cuánta memoria toca la llamada. Las subidas de código están acotadas en tamaño y forma.

:::note Primero en la testnet
v3.2.8 se ejecuta en la testnet **`qorechain-diana`** desde el 12 de noviembre de 2026. La mainnet (`qorechain-vladi`) la aplicará con una actualización de gobernanza posterior, así que las cifras de abajo describen la testnet hoy y la mainnet tras esa actualización. Todos los comandos usan `--chain-id qorechain-diana`; sustituye por `qorechain-vladi` cuando la mainnet se haya actualizado.
:::

## Por qué importa {#why}

- Una llamada a un contrato que ayer funcionaba con un límite de gas fijo puede quedarse sin gas hoy, porque la primera llamada de un código en un bloque cuesta varias veces más que una repetición. Un límite fijo es una suposición que falla en el peor momento.
- Las comisiones siguen la carga. Cuando los bloques están llenos de llamadas a contratos, el precio de la ejecución de contratos sube, y vuelve a bajar cuando no lo están.
- Cada bloque tiene una cantidad limitada de trabajo de contratos. Una llamada que no cabe falla y paga su comisión como cualquier transacción fallida.

La regla corta: **simula, multiplica el resultado por al menos 1.3 y nunca fijes el gas de una llamada a un contrato.**

## El modelo de gas {#gas-model}

### Coste de carga del código {#code-load}

Antes de que un contrato se ejecute, hay que cargar su código compilado. La primera llamada de un código en un bloque paga esa carga. Las llamadas posteriores al mismo código en el mismo bloque son baratas, porque el código ya está en memoria.

| Llamada | Gas aproximado |
| ---- | --------------- |
| cw20 `transfer`, primera llamada del código en un bloque (un mensaje, gas usado medido) | 585,151 |
| cw20 `transfer`, tres llamadas en una transacción, es decir, dos repeticiones en el mismo bloque (gas usado medido, total) | 646,169 |
| La misma llamada única, según la simulación | 591,280 |

Estos números se midieron en la testnet el 12 de noviembre de 2026 con el código cw20 revisado que almacenó la gobernanza (factor de congestión 1x). Una repetición del mismo código en el mismo bloque añade solo unos 30,500 de gas en la práctica. La simulación informa más de lo que usa una transacción, porque siempre cobra la carga en frío y añade un margen por congestión: tres llamadas se simularon en 1,326,504 y usaron 646,169. Las cifras dependen del código y de la llamada, así que mide tu propio contrato. En detalle, la carga se cobra completa en la primera llamada de un código en un bloque, las ocho llamadas siguientes a ese código en el mismo bloque no pagan carga, y cada llamada posterior en el bloque paga una octava parte. El conjunto de códigos cargados empieza vacío en cada bloque, de modo que todos los validadores cobran las mismas llamadas. Esto se aplica a instantiate, execute, migrate y a las llamadas hechas desde otro contrato o desde el puente entre VM.

**Los códigos fijados (pinned) se saltan el cargo de carga.** La gobernanza puede fijar un código popular para que los validadores lo mantengan cargado, y las llamadas a un código fijado nunca pagan el coste de carga. Comprueba qué códigos están fijados:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Preparación de la llamada y memoria {#setup}

Cada llamada paga además un pequeño cargo de preparación (un coste base, un coste por cada página de 64 KiB de memoria inicial y un coste por segmento de datos) y un cargo por cada página de memoria que crece. Los contratos que mantienen la memoria pequeña son más baratos.

### Precios por congestión {#congestion}

El gas de ejecución de contratos se multiplica por un **factor de congestión**.

| Propiedad | Valor |
| -------- | ----- |
| Rango | De 1x hasta 20x por defecto |
| Techo de gobernanza | La gobernanza puede fijar el máximo hasta 100x |
| Cuándo sube | Solo cuando los bloques están llenos: tras un bloque que usó más de la mitad de su presupuesto de contratos (el objetivo por defecto) el factor sube, y sube más rápido si el presupuesto se agotó |
| Cuándo baja | Tras un bloque que usó menos que el objetivo |

El factor escala solo la ejecución de contratos. El almacenamiento, la preparación de la llamada y la subida de código no se multiplican. El factor era 1x cuando se midieron las transferencias anteriores.

Lee los valores en vivo:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

Los campos a mirar son `wasm_congestion_factor_micro` (el factor vigente, en millonésimas, así que `1000000` es 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` y `max_tx_wasm_share_bps`.

### El presupuesto de contratos por bloque {#budget}

Cada bloque tiene un presupuesto de trabajo de contratos. Los valores por defecto son:

| Parámetro | Valor por defecto | Significado |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | Ejecución de contratos que todas las transacciones juntas pueden usar en un bloque |
| `max_tx_wasm_share_bps` | 5,000 (la mitad) | La parte de ese presupuesto que puede usar una transacción, es decir, 1,500,000 por defecto |
| `queue_wasm_reserve_bps` | 2,500 | Parte del presupuesto reservada para las llamadas asíncronas entre VM en cola |

Cuando el presupuesto rechaza el trabajo de contratos de una transacción, la transacción falla ("block wasm gas budget exhausted") y paga su comisión como cualquier transacción fallida. Reintenta en el siguiente bloque, que empieza con el presupuesto completo. Una comisión de prioridad ayuda a entrar pronto en un bloque, antes de que se gaste el presupuesto. Una sola llamada que necesite más que la parte de una transacción no puede ejecutarse hasta que la gobernanza aumente el presupuesto o la parte.

### La simulación y el margen de seguridad {#simulation}

Una simulación **siempre cobra la carga en frío**, como si tu llamada fuera la primera de su código en el bloque, y tarifa la ejecución al factor de congestión que usará el siguiente bloque más dos pasos de subida (aproximadamente 2.25x en la parte de ejecución). Por eso una estimación resiste un par de bloques de carga creciente. Nunca se queda corta en una primera llamada.

Por ello, usa esta regla en cada mensaje de contrato:

1. Simula la transacción.
2. Multiplica el gas simulado por **al menos 1.3**.
3. Usa el resultado como límite de gas, sin superar el tope por transacción.

### Tope por transacción {#tx-cap}

Una transacción de Cosmos no puede fijar un límite de gas superior a **50,000,000**. Una transacción por encima del tope se rechaza antes de cobrar su comisión.

## Reglas de subida {#upload}

La subida de código (`MsgStoreCode`) sigue **controlada por la gobernanza**: `code_upload_access` es `Nobody` en ambas redes, de modo que el código se almacena mediante una propuesta de gobernanza. Compruébalo en cualquier momento:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

Desde v3.2.8 una subida se comprueba en un orden fijo, empezando por las comprobaciones más baratas:

1. **Acceso.** El remitente debe estar permitido por la regla de subida. El mempool admite mensajes de subida solo de remitentes permitidos.
2. **Gas para el tamaño declarado, por adelantado.** La transacción debe tener gas para el tamaño de módulo que declara, o falla por falta de gas de inmediato, antes de descomprimir nada.
3. **Inspección en una pasada.** El módulo se descomprime una sola vez, nunca más allá de su tamaño declarado, y se inspecciona frente a los límites de abajo. Una subida gzip debe ser exactamente un miembro gzip que se descomprima al tamaño que declara.
4. **Almacenamiento y compilación.** El almacenamiento se cobra por byte y luego se compila el módulo.

Costes típicos de subida: unos **9.9 millones de gas para un cw20** y unos **22.8 millones para un cw721**. La subida más densa que cabe en los límites cuesta unos 32 millones, todavía dentro del tope de 50,000,000.

### Límites del módulo {#module-limits}

| Límite | Valor |
| ----- | ----- |
| Funciones | como máximo 4,096 |
| Tipos de función | como máximo 512 |
| Tamaño compilado (estimación conservadora) | como máximo 32 MiB |
| Exportaciones | como máximo 128 |
| Globales | como máximo 256 |
| Segmentos de elementos | como máximo 16, con como máximo 2,500 entradas en total |
| Segmentos de datos | como máximo 1,024 |
| Memoria inicial | como máximo 64 páginas (4 MiB) |
| Secciones personalizadas | como máximo 128 KiB en total |
| Operaciones de coma flotante | no se permite ninguna |

Las instrucciones de coma flotante se rechazan porque no son deterministas entre el hardware de los validadores. Escribe los contratos con tipos enteros o decimales de `cosmwasm-std` y comprueba que tu compilación no tenga instrucciones de coma flotante antes de presentarla a la gobernanza.

Los límites también se comprueban **en el momento de la llamada para el código ya almacenado**, de modo que un código almacenado antes que incumpla un límite (por ejemplo, coma flotante) se rechaza al llamarlo. Los contratos construidos con las plantillas estándar cw20 y cw721 y los contratos de las versiones oficiales quedan muy por debajo de cada límite.

## Ejemplo práctico: estimar y ejecutar una transferencia cw20 {#worked-example}

El mensaje es el `transfer` estándar de cw20: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Los ejemplos usan la testnet.

### CLI {#example-cli}

Deja que la CLI simule con `--gas auto` y usa un ajuste de 1.3 o más. Construye la transacción con `--generate-only` y fírmala con `tx pqc cosign`, como en el resto del manual (consulta [Firma híbrida](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

El mínimo de la red es de 0.1 uqor por unidad de gas; `0.15uqor` deja margen. Si tu contrato se llama con frecuencia en el mismo bloque que otros usuarios del mismo código, el límite simulado ya cubre la carga en frío.

### TypeScript {#example-ts}

Simula, multiplica por 1.3, comprueba el tope y envía con el constructor híbrido. Esto sigue la [guía de QoreChain Native del SDK](/sdk/guides/cosmwasm#gas), que tiene las importaciones completas y el registro de la clave ML-DSA-87 de la cuenta.

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

`carriesWasmExecution(messages)` te dice si una lista de mensajes necesita gas simulado, y `WASM_GAS_MULTIPLIER_MIN` es el mínimo de 1.3. Cuando un cliente CosmJS acepta `"auto"` como comisión, simula por ti.

### Probado en la testnet {#example-tested}

Esta ejecución se hizo en `qorechain-diana` el 12 de noviembre de 2026 (versión v3.2.8) con una cuenta eth-native, el SDK de TypeScript 0.13.0 y el código cw20 que almacenó la gobernanza (code id 859). Firma la transacción, envía los bytes firmados a la ruta REST de simulación y envía la transacción real con el gas simulado por 1.3.

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

Lo que imprimió la ejecución:

| Paso | Resultado |
| ---- | ------ |
| Instantiate cw20 (code 859): simulado y enviado con eso por 1.3 | simulado 634,956; límite 825,443; code 0, gas usado 629,267 |
| cw20 `transfer`: simulado | 591,280 de gas |
| La misma transferencia con un límite fijo de 400,000 | rechazada: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (la comisión se cobra igualmente) |
| La misma transferencia con simulado x 1.3 (768,664) | code 0, gas usado 585,151 |
| Tres transferencias en una transacción, simulado x 1.3 (1,724,456) | code 0, gas usado 646,169 |

Un límite fijo de 400,000 falla en la primera llamada del código en un bloque, y el límite simulado no. La comisión se calcula sobre el límite que pides (0.15 uqor por unidad de gas en esta ejecución), así que un margen mayor cuesta una comisión mayor: usa 1.3, no 5.

### Python, Go, Rust y Java {#example-other}

Cada uno de estos SDK simula contra la ruta REST y dimensiona el límite a partir del resultado. Necesitan una transacción completamente ensamblada (firmada), porque la ruta de simulación exige la estructura de la transacción. Para un execute, instantiate o migrate de CosmWasm (y una llamada entre VM), los SDK elevan el límite a al menos 1.3 veces el gas simulado. Ninguno tiene un constructor de mensajes cw20 o CosmWasm ya hecho, así que construye el `MsgExecuteContract` con tu biblioteca protobuf y pasa sus bytes firmados.

**Python** (`qorechain-sdk`, `qorsdk`): `estimate_gas` y `auto_fee` reciben la transacción construida y aplican el mínimo de 1.3 para los mensajes wasm.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas` devuelve el gas simulado, `WasmGasWanted` aplica el mínimo de 1.3 y `EstimateFee` tarifa un multiplicador que le pasas (no añade el mínimo por sí mismo, así que pasa 1.3 o más).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): `estimate_gas_wanted` eleva el límite a al menos 1.3 veces el gas simulado para mensajes wasm y entre VM, y `estimate_fee` lo tarifa.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): pasa `true` en el último argumento cuando la transacción lleva mensajes wasm o entre VM.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### Ruta REST de simulación {#example-rest}

`POST /cosmos/tx/v1beta1/simulate` con el base64 de una transacción firmada devuelve `gas_info.gas_used`. Multiplícalo por 1.3 para el límite.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

La respuesta lleva `gas_info.gas_used` (una cadena). La ruta solo acepta POST: un `GET` responde `501 Not Implemented`.

## Límites y errores {#limits-errors}

| Situación | Lo que ves | Qué hacer |
| --------- | ------------ | ---------- |
| Límite de gas superior a 50,000,000 | Rechazada antes de cobrar la comisión | Baja el límite; reparte el trabajo en varias transacciones |
| Sin gas en una llamada a un contrato | La transacción falla con un error de falta de gas | Simula y usa al menos 1.3 veces el resultado; nunca reutilices un valor fijo |
| Presupuesto de contratos del bloque agotado | Fallo que nombra el presupuesto de gas wasm del bloque; comisión pagada | Reintenta en el siguiente bloque, opcionalmente con una comisión de prioridad |
| Una llamada necesita más que la parte de una transacción | Falla siempre | Pide a la gobernanza que aumente el presupuesto o la parte, o abarata la llamada |
| Subida por un remitente sin acceso | Rechazada en la admisión | Presenta el código mediante una propuesta de gobernanza |
| Subida sin gas suficiente para su tamaño declarado | Sin gas de inmediato | Fija el gas para cubrir el tamaño declarado (unos 9.9 millones para cw20) |
| Subida por encima de un límite del módulo | Rechazada al subir | Reduce funciones, exportaciones, globales, segmentos o memoria (consulta la tabla de arriba) |
| Instrucciones de coma flotante en un módulo | Rechazada al subir, y al llamar para el código almacenado | Elimina las operaciones de coma flotante de la compilación |
| Subida gzip que no es un solo miembro, o cuyo tamaño es incorrecto | Rechazada | Comprime el módulo como un único flujo gzip con el tamaño correcto |

## Páginas relacionadas {#related}

- [Guía de QoreChain Native (SDK): gas para llamadas a contratos](/sdk/guides/cosmwasm#gas)
- [Desarrollo QoreChain Native](/developer-guide/cosmwasm-development)
- [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability)
- [Firma híbrida y `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Gobernanza](/user-guide/governance)
