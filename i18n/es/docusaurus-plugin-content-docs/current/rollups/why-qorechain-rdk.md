---
slug: /rollups/why
title: Por qué QoreChain RDK
sidebar_label: Por qué QoreChain RDK
sidebar_position: 2
---

# Por qué QoreChain RDK

La mayoría de los kits de desarrollo de rollups son variaciones del mismo tema:
te ayudan a lanzar una app-chain que liquida en una capa base. El QoreChain RDK
también hace eso, y añade tres capacidades específicas de QoreChain que están
construidas en torno a la Layer 1 de QoreChain y no en torno a las herramientas:

- una capa de liquidación **post-cuántica**,
- primitivas de asesoría de **IA/RL on-chain** (QCAI), y
- un runtime de **triple VM** con llamadas entre VMs.

:::caution Etapa temprana: lee la columna de estado
Todavía no se ha creado ningún rollup en ninguna de las dos redes (comprobado el
27 de octubre de 2026). La tabla siguiente indica lo que funciona hoy; lo que
cambiaron los clientes 0.6.x publicados y los límites que persisten se recogen en
[RDK 0.7.0: cambios y límites](/rollups/deploying-a-rollup#rdk-050-limits). Si solo
necesitas un rollup genérico optimista/zk, cualquier kit te sirve; las
capacidades de aquí son lo que el RDK añade por encima, en TypeScript, Python,
Go, Rust y Java.
:::

| Capacidad | Estado | De qué depende |
| --- | --- | --- |
| **Recibos de liquidación** | 🟡 Etapa temprana | Los anclajes se firman con ML-DSA-87, el esquema post-cuántico de la Main Chain; todavía no existen anclajes, así que el verificador 0.7.0 (que comprueba contra la cadena) nunca se ha ejecutado con un anclaje real |
| **QCAI Rollup Copilot** | 🟡 Todavía no disponible en los endpoints públicos | Servicios de asesoría de IA/RL on-chain que los endpoints públicos no exponen hoy |
| **Llamadas entre VMs multi-VM** | 🟡 Todavía no utilizable en las redes en vivo | Un precompile entre VMs que no está activado (el codificador desde la 0.6.0 coincide con el formato de la cadena), y la subida de QoreChain Native está cerrada |

---

## 1. Recibos de liquidación

> 🟡 **Diseño construido sobre la capa base post-cuántica de QoreChain.** Los
> anclajes de liquidación se firman con ML-DSA-87 (Dilithium-5, FIPS-204), el
> mismo esquema que usa la Main Chain. Etapa temprana: todavía no existen
> anclajes en ninguna de las dos redes.

Cuando el creador de tu rollup ancla un lote de liquidación, el anclaje se firma
con una clave post-cuántica registrada on-chain. El RDK puede empaquetar ese
anclaje como un **recibo portátil**, y un verificador vuelve a leer la
afirmación desde un nodo de QoreChain para confirmar que el rollup, el lote, el
anclaje y la clave del creador coinciden con lo que guarda la cadena.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

`verifySettlementReceipt` comprueba contra la cadena y se niega a decir `valid`
sin un `client`. En 0.5.0 su comprobación contra la cadena no podía completarse
en las redes en vivo (fallaba de forma cerrada en lugar de informar de que un
recibo genuino es válido); la 0.6.0 lo corrigió y la 0.6.1 (y todas las versiones posteriores) compara todos los campos del recibo, pero todavía no existe ningún
anclaje, así que ninguna de las dos se ha ejecutado con uno real. Consulta
[Recibos de liquidación](/rollups/settlement-receipts)
para saber qué demuestra un recibo y qué no, y para conocer los límites exactos.

---

## 2. QCAI Rollup Copilot

> 🟡 **Todavía no disponible en los endpoints públicos.**

El Copilot está pensado para agregar los servicios de asesoría de la red (un
agente de política de comisiones, recomendaciones, investigaciones de fraude) en
una única vista de solo lectura y en lenguaje sencillo para un rollup. Es de
mejor esfuerzo: si un servicio no está disponible, se degrada a una advertencia
en lugar de fallar. Esos servicios no están expuestos hoy en los endpoints
públicos, por lo que cada sección devuelve una advertencia.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

Desde la CLI: `qorollup advise my-rollup`. Consulta [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Llamadas entre VMs multi-VM

> 🟡 **Todavía no utilizable en las redes en vivo** — el precompile no está
> activado y la subida de QoreChain Native está cerrada. Consulta [Multi-VM](/rollups/multi-vm).

El RDK incluye helpers que codifican una llamada desde un contrato EVM (Solidity)
a un contrato **QoreChain Native** a través de un precompile fijo en `0x…0901`. Ese
precompile **no está activo** en mainnet ni en testnet (consulta
[Precompiles EVM: estado de la red](/developer-guide/evm-precompiles#network-status)):
`eth_getCode` para `0x…0901` devuelve `0x` en ambas, y una llamada de contrato a
él tiene éxito sin ningún efecto.

El helper `encodeCrossVmCalldata` (desde la 0.6.0) construye el calldata para
`executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`, el
formato que decodifica el nodo (la 0.5.0 y anteriores codificaban una forma de dos
argumentos con un selector distinto, que nunca habría podido llegar al precompile).
Puedes codificar la misma llamada tú mismo, como se muestra con viem (`targetVM` 1
es QoreChain Native, el único destino admitido):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = QoreChain Native
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

O directamente desde Solidity en tu rollup:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Hoy, `ok` por sí solo no demuestra nada: mientras el precompile no tenga código,
la llamada devuelve éxito con datos vacíos y no ejecuta nada, así que confirma el
efecto en el contrato de destino.

Genera un proyecto inicial con `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Solo EVM↔QoreChain Native; las llamadas cruzadas SVM son aparte.)

---

## Todo lo demás que esperarías

Más allá de esas capacidades, el RDK también incluye lo esencial: cinco clientes
de lenguaje publicados y verificados contra vectores dorados compartidos, los
cinco perfiles preconfigurados y la matriz de compatibilidad completa, gestión
de lotes de liquidación y del ciclo de vida, almacenamiento nativo de
disponibilidad de datos (consulta su nota de estado), un auto-retador
**watchtower** para rollups optimistas, y la CLI de operador `qorollup`.

## Siguiente

- [Desplegar un Rollup](/rollups/deploying-a-rollup) — instalación por lenguaje
  y la ruta por CLI hasta un rollup en testnet.
- [Recibos de liquidación](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — los análisis en profundidad.
