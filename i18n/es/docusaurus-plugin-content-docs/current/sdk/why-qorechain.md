---
slug: /sdk/why
title: Por qué el SDK de QoreChain
sidebar_label: Por qué el SDK de QoreChain
sidebar_position: 2
---

# Por qué el SDK de QoreChain

El SDK de QoreChain te ofrece todo lo que ofrece un SDK multicadena moderno:
mensajes tipados para cada módulo, consultas tipadas, cuentas para tres VM a partir
de un solo mnemónico, gas automático, decodificación de errores, suscripciones,
billeteras y un kit de React.

Pero tres capacidades son **solo posibles en QoreChain**, porque están construidas
sobre características de protocolo que ninguna otra Layer 1 tiene: IA on-chain, tres VM
co-residentes con un puente nativo, y criptografía poscuántica obligatoria. Estas son las
razones para construir aquí.

---

## 1. Puntuación de riesgo previa al vuelo con IA

**Escanea una transacción con IA on-chain antes de transmitirla.**

QoreChain incluye análisis de riesgo con IA como precompilados de EVM. El SDK los llama por ti
y devuelve el gas más un veredicto de riesgo/anomalía en una sola llamada — para que una billetera o
dApp pueda advertir (o bloquear) *antes* de firmar.

```ts
import { createClient } from "@qorechain/sdk";
import { simulateWithRiskScore } from "@qorechain/evm";

const client = createClient({ network: "mainnet", endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(client.evm, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**Por qué es único:** la puntuación se ejecuta *dentro de la cadena* como un precompilado
determinista (`aiRiskScore` en `0x…0B01`, `aiAnomalyCheck` en `0x…0B02`). Otras
redes solo pueden añadir servicios de IA off-chain y no deterministas. Este es el
primer SDK que examina una transacción con IA antes de que se firme, con un resultado
on-chain. Consulta [Previo al vuelo con IA](/sdk/guides/ai-preflight).

---

## 2. Llamadas cross-VM unificadas — una cuenta, tres VM, una transacción

**Llama a un contrato en cualquier VM, y agrupa llamadas entre las tres de forma atómica.**

QoreChain ejecuta contratos CosmWasm, EVM y SVM en la misma cadena con un puente
cross-VM nativo. El SDK expone una sola interfaz para llamar a cualquiera de ellos — y para empaquetar
varias llamadas cross-VM en una única transacción atómica firmada una sola vez.

```ts
import { createCrossVMClient } from "@qorechain/sdk";

const crossVM = createCrossVMClient(tx, { query: client.query });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → CosmWasm.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**Por qué es único:** QoreChain es la única L1 con tres VM co-residentes y un
módulo de puente nativo (`crossvm` + el precompilado `CrossVMBridge`). Las cadenas
de una sola VM no pueden expresar "una cuenta, tres VM, una transacción atómica" — sus
SDK no tienen nada que envolver. Escribe una vez, llama a cualquier VM. Consulta
[Llamadas cross-VM](/sdk/guides/cross-vm).

---

## 3. Seguro frente a lo cuántico por defecto

**Haz que un firmante quede protegido frente a lo poscuántico en una sola llamada.**

QoreChain impone firmas poscuánticas híbridas (ML-DSA-87 + clásica) a nivel
de protocolo. El SDK hace que adoptarlas sea cuestión de una línea: comprueba, registra y
migra a la firma híbrida — con un distintivo de React para mostrar a los usuarios que están protegidos.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Idempotent: registers the signer's ML-DSA-87 key on-chain if not already.
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair });
await hybrid.send(messages);
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key.
<QuantumSafeBadge address={account.address} />
```

**Por qué es único:** la criptografía poscuántica es nativa y obligatoria en
QoreChain, no un experimento. Este es el primer SDK donde "seguro frente a lo cuántico por
defecto" es una sola llamada más un distintivo listo para usar. Consulta
[Seguro frente a lo cuántico](/sdk/guides/quantum-safe).

---

## Todo lo demás, también

Más allá de los tres diferenciadores, el SDK cubre toda la superficie de la cadena en
**TypeScript, Python, Go, Rust y Java**: compositores tipados para cada módulo
(incluidas las sidechains/paychains a través de `multilayer` y los rollups a través de `rdk`), consultas tipadas,
el ciclo de vida de las tx, suscripciones, billeteras de navegador, y el
kit de hooks [`@qorechain/react`](/sdk/guides/react).

¿Listo para construir? Empieza con la [Guía rápida](/sdk/quickstart).
