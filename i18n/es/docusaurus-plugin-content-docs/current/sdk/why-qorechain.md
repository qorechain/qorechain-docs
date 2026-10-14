---
slug: /sdk/why
title: Por qué el SDK de QoreChain
sidebar_label: Por qué el SDK de QoreChain
sidebar_position: 2
---

# Por qué el SDK de QoreChain

El SDK de QoreChain te ofrece todo lo que ofrece un SDK multicadena moderno:
mensajes tipados para cada módulo, consultas tipadas, cuentas para tres VMs a
partir de un solo mnemónico, gas automático, decodificación de errores,
suscripciones, wallets y un kit para React.

Pero hay cinco capacidades que **solo son posibles en QoreChain**, porque están
construidas sobre características de protocolo que ninguna otra Layer 1 tiene:
IA on-chain, tres VMs co-residentes con un puente nativo, criptografía
post-cuántica obligatoria, una identidad de 20 bytes en los tres carriles de VM,
y gasto delegado seguro frente a PQC para claves de wallets externas. Estas son
las razones para construir aquí.

---

## 1. Evaluación de riesgo con IA antes del envío

**Analiza una transacción con IA on-chain antes de difundirla** (requiere que los
precompilados de IA estén activos en la red de destino, lo cual todavía no ocurre
en las redes públicas).

QoreChain incluye análisis de riesgo con IA como precompilados de la EVM. El SDK
los invoca por ti y devuelve el gas junto con un veredicto de riesgo/anomalía en
una sola llamada — de modo que un wallet o una dApp puede advertir (o bloquear)
*antes* de firmar. Los precompilados de IA **todavía no están activos** en mainnet
ni en testnet (consulta
[Precompilados de la EVM: estado de la red](/developer-guide/evm-precompiles#network-status)).

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
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

**Por qué es diferente:** la puntuación está diseñada para ejecutarse *dentro de la
cadena* como un precompilado determinista (`aiRiskScore` en `0x…0B01`,
`aiAnomalyCheck` en `0x…0B02`), no como un servicio externo a la cadena. Hasta que
esos precompilados se activen, los helpers anteriores lanzan un error en las redes
públicas (`returned no data ("0x")`). Consulta
[AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Llamadas cross-VM unificadas — una cuenta, tres VMs, una transacción

**Llama a un contrato en cualquier VM, y agrupa llamadas a las tres de forma
atómica.**

QoreChain ejecuta contratos CosmWasm, EVM y SVM en la misma cadena con un puente
cross-VM nativo. El SDK expone una única interfaz para llamar a cualquiera de
ellos — y para empaquetar varias llamadas cross-VM en una sola transacción
atómica firmada una única vez.

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

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

**Por qué es diferente:** QoreChain ejecuta tres VMs co-residentes con un módulo
de puente nativo (`crossvm`, más el precompilado `CrossVMBridge` una vez que esté
activo), de modo que una única interfaz del SDK puede dirigirse a las tres. Las
cadenas de una sola VM no tienen nada equivalente que envolver. Hoy el alcance de
una llamada está limitado por el carril al que se dirige: `MsgCrossVMCall` está
desactivado en mainnet, las transacciones SVM están deshabilitadas, y la subida e
instanciación de CosmWasm requieren permisos. Consulta
[Llamadas cross-VM](/sdk/guides/cross-vm).

---

## 3. Seguridad cuántica por defecto

**Convierte un firmante en protegido post-cuántico con una sola llamada.**

QoreChain impone firmas híbridas post-cuánticas (ML-DSA-87 + clásica) a nivel de
protocolo. El SDK convierte su adopción en una sola línea: comprobar, registrar
y migrar a la firma híbrida — con una insignia de React para mostrar a los
usuarios que están protegidos.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless `status` says it already is
// (read it over REST on the public endpoints; see the Quantum-safe guide).
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, {
  pqcKeypair,
  status: { registered },
});

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, status: { registered } });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key
// (needs a node that serves the `qor_` namespace; see the React guide).
<QuantumSafeBadge address={account.address} />
```

**Por qué importa:** la criptografía post-cuántica es nativa y obligatoria en la
ruta Native de QoreChain, no un experimento, y el SDK reduce su adopción a una
llamada de registro más una ruta de envío híbrida. El registro es explícito: no
hay registro automático en la primera transacción. Consulta
[Seguridad cuántica](/sdk/guides/quantum-safe).

---

## 4. Cuentas eth-nativas unificadas — una clave, tres direcciones, un saldo

**Una clave `eth_secp256k1` es una identidad de 20 bytes en los tres carriles.**
(SDK 0.6.0, cadena v3.1.83.) El carril de transacciones SVM está deshabilitado hoy
en toda la red, y el carril EVM necesita una
[ventana de autorización](/sdk/guides/evm#evm-window); el saldo compartido y la
asignación de direcciones se mantienen en cualquier caso.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**Por qué es único:** en configuraciones multi-VM de otras redes, cada runtime
tiene su propio espacio de cuentas y los fondos quedan varados por carril.
QoreChain representa una identidad de 20 bytes de tres maneras con un único
saldo compartido — un wallet nunca "tiene fondos en un carril pero no en otro".
Un wallet externo como Phantom se puede vincular a esa identidad como
autenticador limitado ([Autenticadores](/sdk/guides/authenticators)). Consulta
[Cuentas unificadas](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Carriles de autenticadores — gasto delegado sin renunciar a PQC

**Una clave vinculada de Phantom o MetaMask gasta desde la cuenta canónica con
PQC obligatorio, bajo límites, a través de un relayer.** (SDK 0.7.0, cadena
v3.1.85.)

:::caution Todavía no disponible en las redes activas
El módulo `abstractaccount` está desactivado en `qorechain-vladi` y
`qorechain-diana` (`GET /qorechain/abstractaccount/v1/config` devuelve
`"enabled": false`), y desde la cadena v3.2.0 ese indicador se aplica en todas las
rutas, por lo que no se puede vincular una clave y los carriles siguientes no se
pueden usar. Consulta la
[guía de Autenticadores](/sdk/guides/authenticators).
:::

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**Por qué importa:** una vez que el módulo esté activado, cada gasto está acotado
por una taxonomía de permisos on-chain, límites de `SpendingRule` y una fecha de
expiración — mínimo privilegio y revocable — mientras la cuenta en sí permanece
protegida post-cuánticamente. Consulta
[Autenticadores y gasto delegado](/sdk/guides/authenticators).

---

## Y todo lo demás, también

Más allá de los cinco diferenciadores, el SDK cubre toda la superficie de la
cadena en **TypeScript, Python, Go, Rust y Java**: composers tipados para cada
módulo (incluidas sidechains/paychains mediante `multilayer` y rollups mediante
`rdk`), consultas tipadas, el ciclo de vida de la transacción, suscripciones,
wallets de navegador y el kit de hooks
[`@qorechain/react`](/sdk/guides/react).

¿Listo para construir? Empieza con el [inicio rápido](/sdk/quickstart).
