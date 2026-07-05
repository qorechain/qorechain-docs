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

**Analiza una transacción con IA on-chain antes de difundirla.**

QoreChain incluye análisis de riesgo con IA como precompilados de la EVM. El SDK
los invoca por ti y devuelve el gas junto con un veredicto de riesgo/anomalía en
una sola llamada — de modo que un wallet o una dApp puede advertir (o bloquear)
*antes* de firmar.

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

**Por qué es único:** la puntuación se ejecuta *dentro de la cadena* como un
precompilado determinista (`aiRiskScore` en `0x…0B01`, `aiAnomalyCheck` en
`0x…0B02`). Otras redes solo pueden añadir servicios de IA externos y no
deterministas. Este es el primer SDK que examina con IA una transacción antes de
que se firme, con un resultado on-chain. Consulta
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

**Por qué es único:** QoreChain es la única L1 con tres VMs co-residentes y un
módulo de puente nativo (`crossvm` + el precompilado `CrossVMBridge`). Las
cadenas de una sola VM no pueden expresar "una cuenta, tres VMs, una transacción
atómica" — sus SDKs no tienen nada que envolver. Escribe una vez, llama a
cualquier VM. Consulta [Llamadas cross-VM](/sdk/guides/cross-vm).

---

## 3. Seguridad cuántica por defecto

**Convierte un firmante en protegido post-cuántico con una sola llamada.**

QoreChain impone firmas híbridas post-cuánticas (ML-DSA-87 + clásica) a nivel de
protocolo. El SDK convierte su adopción en una sola línea: comprobar, registrar
y migrar a la firma híbrida — con una insignia de React para mostrar a los
usuarios que están protegidos.

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

**Por qué es único:** la criptografía post-cuántica es nativa y obligatoria en
QoreChain, no un experimento. Este es el primer SDK donde "seguridad cuántica
por defecto" es una sola llamada más una insignia lista para usar. Consulta
[Seguridad cuántica](/sdk/guides/quantum-safe).

---

## 4. Cuentas eth-nativas unificadas — una clave, tres direcciones, un saldo

**Una clave `eth_secp256k1` es una identidad de 20 bytes en los tres carriles.**
(SDK 0.6.0, cadena v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**Por qué es único:** en configuraciones multi-VM de otras redes, cada runtime
tiene su propio espacio de cuentas y los fondos quedan varados por carril.
QoreChain representa una identidad de 20 bytes de tres maneras con un único
saldo compartido — un wallet nunca "tiene fondos en un carril pero no en otro".
`connectPhantomUnified` incluso inicializa esta identidad de forma no custodial
a partir de una firma de Phantom. Consulta
[Cuentas unificadas](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Carriles de autenticadores — gasto delegado sin renunciar a PQC

**Una clave vinculada de Phantom o MetaMask gasta desde la cuenta canónica con
PQC obligatorio, bajo límites, a través de un relayer.** (SDK 0.7.0, cadena
v3.1.85.)

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

**Por qué es único:** cada gasto está acotado por una taxonomía de permisos
on-chain, límites de `SpendingRule` y una fecha de expiración — mínimo
privilegio y revocable — mientras la cuenta en sí permanece protegida
post-cuánticamente. Consulta
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
