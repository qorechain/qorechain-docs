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
Todavía no se ha creado ningún rollup en ninguna de las dos redes. La tabla
siguiente indica lo que funciona hoy. Si solo necesitas un rollup genérico
optimista/zk, cualquier kit te sirve; las capacidades de aquí son lo que el RDK
añade por encima, en TypeScript, Python, Go, Rust y Java.
:::

| Capacidad | Estado | De qué depende |
| --- | --- | --- |
| **Recibos de liquidación resistentes a la computación cuántica** | 🟡 Etapa temprana | Los anclajes se firman con ML-DSA-87, el esquema post-cuántico de la Main Chain; todavía no existen anclajes |
| **QCAI Rollup Copilot** | 🟡 Todavía no disponible en los endpoints públicos | Servicios de asesoría de IA/RL on-chain que los endpoints públicos no exponen hoy |
| **Llamadas entre VMs multi-VM** | 🟡 Todavía no utilizable en las redes en vivo | Un precompile entre VMs que no está activado, y la subida de CosmWasm está cerrada |

---

## 1. Recibos de liquidación resistentes a la computación cuántica

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

Consulta [Recibos de liquidación resistentes a la computación cuántica](/rollups/settlement-receipts)
para saber qué demuestra un recibo y qué no.

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
> activado y la subida de CosmWasm está cerrada. Consulta [Multi-VM](/rollups/multi-vm).

El RDK incluye helpers que codifican una llamada desde un contrato EVM (Solidity)
a un contrato **CosmWasm** a través de un precompile fijo en `0x…0901`. Ese
precompile **no está activo** en mainnet ni en testnet (consulta
[Precompiles EVM: estado de la red](/developer-guide/evm-precompiles#network-status)).

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

O directamente desde Solidity en tu rollup:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Genera un proyecto inicial con `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Solo EVM↔CosmWasm; las llamadas cruzadas SVM son aparte.)

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
- [Recibos de liquidación resistentes a la computación cuántica](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — los análisis en profundidad.
