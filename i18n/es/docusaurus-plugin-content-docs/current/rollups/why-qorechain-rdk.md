---
slug: /rollups/why
title: Por qué QoreChain RDK
sidebar_label: Por qué QoreChain RDK
sidebar_position: 2
---

# Por qué QoreChain RDK

La mayoría de los kits de desarrollo de rollups son variaciones del mismo tema:
te ayudan a lanzar una app-chain que liquida en una capa base. El QoreChain RDK
también hace eso, pero además expone tres cosas que **ningún otro kit de rollups
puede**, porque dependen de capacidades que residen en la Layer 1 de QoreChain,
no en las herramientas:

- una capa de liquidación **post-cuántica**,
- primitivas asesoras de **IA/RL on-chain** (QCAI), y
- un runtime de **triple-VM** con llamadas entre VMs.

Si solo necesitas un rollup optimista/zk genérico, cualquier kit servirá. Si
quieres que la liquidación de tu rollup sea **verificable, segura frente a la
computación cuántica y consciente de la IA**, este es el único kit capaz de
expresarlo, en TypeScript, Python, Go, Rust y Java.

| Diferenciador | Estado | Por qué solo es posible aquí |
| --- | --- | --- |
| **Recibos de liquidación seguros frente a la computación cuántica** | 🟢 Único (pionero) | Requiere una L1 post-cuántica — imposible en una capa base sin PQC |
| **QCAI Rollup Copilot** | 🟢 Único a través de la cadena | Envuelve endpoints de IA/RL on-chain exclusivos de QoreChain |
| **Llamadas multi-VM entre VMs** | 🟡 Distintivo | QoreChain ejecuta EVM + CosmWasm + SVM bajo una sola cadena |

---

## 1. Recibos de liquidación seguros frente a la computación cuántica

> 🟢 **Único.** Ningún kit de rollups construido sobre una L1 no post-cuántica puede ofrecer esto.

Cuando tu rollup ancla un lote de liquidación, QoreChain compromete su raíz de
estado en la Main Chain bajo una firma **post-cuántica (ML-DSA-87 / Dilithium-5,
FIPS-204)**. El RDK convierte ese anclaje en un **recibo portátil** que cualquiera
puede verificar **completamente sin conexión**: sin nodo, sin confiar en el kit,
solo matemáticas.

El recibo demuestra dos cosas: que la raíz de estado del lote es la que fue
anclada (vinculación) y que el anclaje fue firmado con la clave post-cuántica
registrada del creador de la capa (autenticidad). La firma cubre el mensaje
canónico
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.network" }, // your QoreChain node REST
});

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**Completamente sin conexión**: entrega el recibo y la clave pública del creador
a cualquiera, en una máquina aislada de la red (air-gapped), y podrá verificarlo
sin tocar la red:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

El mismo recibo se verifica **byte a byte en los cinco lenguajes** (los clientes
distintos de TypeScript usan la propia librería `qorechain-pqc` de la cadena), de
modo que un recibo producido por un servicio en TypeScript se verifica de forma
idéntica en un auditor en Go o un backend en Java. Consulta
[Recibos de liquidación seguros frente a la computación cuántica](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Único a través de la cadena.** Construido sobre endpoints de IA/RL on-chain
> que otras redes simplemente no tienen.

QoreChain ejecuta servicios de IA/RL a nivel de red on-chain: un agente de política
de comisiones, recomendaciones de red, investigaciones de fraude, disyuntores
(circuit breakers). El Copilot los agrega en una única vista revisable y en
lenguaje claro para un rollup. Es de solo lectura y de mejor esfuerzo: si un
servicio asesor no es accesible, se degrada a una advertencia en lugar de fallar.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet", endpoints: { rest, evmRpc } });

const advice = await getRollupAdvice(rdk, "my-rollup");

for (const s of advice.suggestions) {
  console.log(`[${s.level}] ${s.message}`);
  // [action] 2 open fraud investigation(s) reference this rollup …
  // [warn]   QCAI reports network congestion — consider raising the fee …
  // [info]   A live QCAI fee estimate is available …
}

console.log(advice.feeEstimate);          // live QCAI fee estimate
console.log(advice.fraudInvestigations);  // investigations touching this rollup
console.log(advice.rlAgentStatus);        // the RL fee/routing agent's state
```

Desde la CLI:

```bash
qorollup advise my-rollup
```

Otros kits no tienen nada que envolver: los datos asesores son una primitiva de
QoreChain. Consulta [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Llamadas multi-VM entre VMs

> 🟡 **Distintivo.** QoreChain ejecuta EVM, CosmWasm y SVM bajo una sola cadena, con
> un precompilado que conecta EVM → CosmWasm.

Tu contrato de rollup EVM (Solidity) puede llamar a un contrato **CosmWasm**
existente a través de un precompilado fijo en `0x…0901`. El RDK construye el
calldata por ti, de modo que puedes reutilizar un oráculo, un token o un registro
CosmWasm desde Solidity sin reimplementarlo.

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
(Solo EVM↔CosmWasm; las llamadas entre VMs de SVM son aparte.) Consulta [Multi-VM](/rollups/multi-vm).

---

## Todo lo demás que esperarías

Más allá de los diferenciadores, el RDK incluye también lo básico imprescindible:
cinco clientes de lenguaje publicados y verificados contra vectores dorados (golden
vectors) compartidos, los cinco perfiles preconfigurados y la matriz de
compatibilidad completa, gestión de lotes de liquidación y del ciclo de vida,
disponibilidad de datos nativa, un auto-impugnador **watchtower** para rollups
optimistas y la CLI del operador `qorollup`.

## Siguiente

- [Desplegar un Rollup](/rollups/deploying-a-rollup) — instalación por lenguaje y
  de cero a un rollup en vivo en testnet.
- [Recibos de liquidación seguros frente a la computación cuántica](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — los análisis en profundidad.
