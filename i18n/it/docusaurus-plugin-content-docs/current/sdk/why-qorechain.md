---
slug: /sdk/why
title: Perché QoreChain SDK
sidebar_label: Perché QoreChain SDK
sidebar_position: 2
---

# Perché QoreChain SDK

L'SDK di QoreChain ti offre tutto ciò che offre un moderno SDK multi-chain —
messaggi tipizzati per ogni modulo, query tipizzate, account per tre VM da un
unico mnemonic, gas automatico, decodifica degli errori, sottoscrizioni, wallet
e un kit React.

Ma tre capacità sono **possibili solo su QoreChain**, perché si basano su
funzionalità di protocollo che nessun altro Layer 1 possiede: AI on-chain, tre
VM co-residenti con un bridge nativo e crittografia post-quantistica
obbligatoria. Questi sono i motivi per cui sviluppare qui.

---

## 1. Punteggio di rischio AI pre-volo

**Analizza una transazione con AI on-chain prima di trasmetterla.**

QoreChain offre l'analisi del rischio AI come precompilati EVM. L'SDK li chiama
al posto tuo e restituisce il gas più un verdetto di rischio/anomalia in una
singola chiamata — così un wallet o una dApp può avvisare (o bloccare) *prima*
della firma.

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

**Perché è unico:** il punteggio viene eseguito *all'interno della chain* come
precompilato deterministico (`aiRiskScore` a `0x…0B01`, `aiAnomalyCheck` a
`0x…0B02`). Altre reti possono solo aggiungere servizi AI off-chain e non
deterministici. Questo è il primo SDK che sottopone una transazione allo
screening AI prima che venga firmata, con un risultato on-chain. Vedi
[AI pre-volo](/sdk/guides/ai-preflight).

---

## 2. Chiamate cross-VM unificate — un account, tre VM, una transazione

**Chiama un contratto su qualsiasi VM e raggruppa le chiamate su tutte e tre in modo atomico.**

QoreChain esegue contratti CosmWasm, EVM e SVM sulla stessa chain con un bridge
cross-VM nativo. L'SDK espone un'unica interfaccia per chiamarne uno qualsiasi —
e per impacchettare diverse chiamate cross-VM in un'unica transazione atomica
firmata una sola volta.

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

**Perché è unico:** QoreChain è l'unico L1 con tre VM co-residenti e un modulo
bridge nativo (`crossvm` + il precompilato `CrossVMBridge`). Le chain a VM
singola non possono esprimere "un account, tre VM, una transazione atomica" — i
loro SDK non hanno nulla da incapsulare. Scrivi una volta, chiama qualsiasi VM.
Vedi [Chiamate cross-VM](/sdk/guides/cross-vm).

---

## 3. Quantum-safe per impostazione predefinita

**Rendi un firmatario protetto post-quantum con una sola chiamata.**

QoreChain impone firme ibride post-quantistiche (ML-DSA-87 + classica) a livello
di protocollo. L'SDK rende la loro adozione una sola riga di codice: verifica,
registra ed esegui la migrazione alla firma ibrida — con un badge React per
mostrare agli utenti che sono protetti.

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

**Perché è unico:** la crittografia post-quantistica è nativa e obbligatoria su
QoreChain, non un esperimento. Questo è il primo SDK in cui "quantum-safe per
impostazione predefinita" è una singola chiamata più un badge pronto all'uso.
Vedi [Quantum-safe](/sdk/guides/quantum-safe).

---

## E tutto il resto

Oltre ai tre elementi distintivi, l'SDK copre l'intera superficie della chain su
**TypeScript, Python, Go, Rust e Java**: composer tipizzati per ogni modulo
(incluse sidechain/paychain tramite `multilayer` e rollup tramite `rdk`), query
tipizzate, il ciclo di vita delle tx, sottoscrizioni, wallet browser e il kit di
hook [`@qorechain/react`](/sdk/guides/react).

Pronto a sviluppare? Inizia con la [Guida rapida](/sdk/quickstart).
