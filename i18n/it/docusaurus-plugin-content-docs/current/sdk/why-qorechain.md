---
slug: /sdk/why
title: Perché QoreChain SDK
sidebar_label: Perché QoreChain SDK
sidebar_position: 2
---

# Perché QoreChain SDK

Il QoreChain SDK ti offre tutto ciò che offre un moderno SDK multi-chain —
messaggi tipizzati per ogni modulo, query tipizzate, account per tre VM da un
unico mnemonic, auto-gas, decodifica degli errori, sottoscrizioni, wallet e un
kit React.

Ma cinque funzionalità sono **possibili solo su QoreChain**, perché sono
costruite su caratteristiche di protocollo che nessun altro Layer 1 possiede:
AI on-chain, tre VM co-residenti con un bridge nativo, crittografia
post-quantistica obbligatoria, un'unica identità da 20 byte su tutte e tre le
corsie VM e spesa delegata sicura per la PQC per chiavi di wallet esterni.
Questi sono i motivi per costruire qui.

---

## 1. Valutazione del rischio pre-flight con AI

**Analizza una transazione con l'AI on-chain prima di trasmetterla.**

QoreChain fornisce l'analisi del rischio con AI come precompile EVM. L'SDK li
invoca per te e restituisce il gas più un verdetto di rischio/anomalia in una
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

**Perché è unico:** la valutazione viene eseguita *all'interno della chain*
come precompile deterministico (`aiRiskScore` a `0x…0B01`, `aiAnomalyCheck` a
`0x…0B02`). Le altre reti possono solo aggiungere servizi AI off-chain e non
deterministici. Questo è il primo SDK che sottopone una transazione a uno
screening AI prima che venga firmata, con un risultato on-chain. Vedi
[AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Chiamate cross-VM unificate — un account, tre VM, una transazione

**Chiama un contratto su qualsiasi VM e raggruppa chiamate su tutte e tre in
modo atomico.**

QoreChain esegue contratti CosmWasm, EVM e SVM sulla stessa chain con un bridge
cross-VM nativo. L'SDK espone un'unica interfaccia per chiamarli tutti — e per
raggruppare più chiamate cross-VM in una singola transazione atomica firmata
una sola volta.

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

**Perché è unico:** QoreChain è l'unica L1 con tre VM co-residenti e un modulo
bridge nativo (`crossvm` + il precompile `CrossVMBridge`). Le chain a VM
singola non possono esprimere "un account, tre VM, una transazione atomica" —
i loro SDK non hanno nulla da incapsulare. Scrivi una volta, chiama qualsiasi
VM. Vedi [Chiamate cross-VM](/sdk/guides/cross-vm).

---

## 3. Sicurezza quantistica di default

**Rendi un signer protetto a livello post-quantistico con una sola chiamata.**

QoreChain impone firme ibride post-quantistiche (ML-DSA-87 + classiche) a
livello di protocollo. L'SDK rende la loro adozione una one-liner: verifica,
registra e migra alla firma ibrida — con un badge React per mostrare agli
utenti che sono protetti.

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
QoreChain, non un esperimento. Questo è il primo SDK in cui la "sicurezza
quantistica di default" è una singola chiamata più un badge pronto all'uso.
Vedi [Quantum-safe](/sdk/guides/quantum-safe).

---

## 4. Account eth-native unificati — una chiave, tre indirizzi, un saldo

**Una chiave `eth_secp256k1` è un'unica identità da 20 byte su tutte e tre le
corsie.** (SDK 0.6.0, chain v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**Perché è unico:** negli assetti multi-VM altrove, ogni runtime ha il proprio
spazio di account e i fondi rimangono bloccati per corsia. QoreChain rende
un'unica identità da 20 byte in tre modi con un unico saldo condiviso — un
wallet non "ha fondi su una corsia ma non su un'altra". `connectPhantomUnified`
può persino inizializzare questa identità in modo non-custodial a partire da
una firma Phantom. Vedi
[Account unificati](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Corsie authenticator — spesa delegata senza rinunciare alla PQC

**Una chiave Phantom o MetaMask collegata spende dall'account canonico che
richiede la PQC, entro limiti, tramite un relayer.** (SDK 0.7.0, chain
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

**Perché è unico:** ogni spesa è vincolata da una tassonomia di permessi
on-chain, da limiti `SpendingRule` e da una scadenza — privilegio minimo e
revocabile — mentre l'account stesso resta protetto a livello
post-quantistico. Vedi
[Authenticator e spesa delegata](/sdk/guides/authenticators).

---

## E anche tutto il resto

Oltre ai cinque elementi distintivi, l'SDK copre l'intera superficie della
chain in **TypeScript, Python, Go, Rust e Java**: composer tipizzati per ogni
modulo (incluse sidechain/paychain tramite `multilayer` e rollup tramite
`rdk`), query tipizzate, il ciclo di vita delle tx, sottoscrizioni, wallet
browser e il kit di hook [`@qorechain/react`](/sdk/guides/react).

Pronto a costruire? Inizia con il [Quickstart](/sdk/quickstart).
