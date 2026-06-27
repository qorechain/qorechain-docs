---
slug: /sdk/why
title: De ce QoreChain SDK
sidebar_label: De ce QoreChain SDK
sidebar_position: 2
---

# De ce QoreChain SDK

QoreChain SDK îți oferă tot ceea ce oferă un SDK modern multi-chain — mesaje
tipizate pentru fiecare modul, interogări tipizate, conturi pentru trei VM-uri
dintr-un singur mnemonic, gaz automat, decodarea erorilor, abonamente, portofele
și un kit React.

Dar trei capabilități sunt **posibile doar pe QoreChain**, deoarece sunt
construite pe funcționalități de protocol pe care niciun alt Layer 1 nu le are:
AI on-chain, trei VM-uri co-rezidente cu o punte nativă și criptografie
post-cuantică obligatorie. Acestea sunt motivele pentru care merită să construiești aici.

---

## 1. Scorarea riscului AI înainte de difuzare

**Scanează o tranzacție cu AI on-chain înainte să o difuzezi.**

QoreChain livrează analiza riscului prin AI sub formă de precompile-uri EVM. SDK-ul
le apelează pentru tine și returnează gazul plus un verdict de risc/anomalie
într-un singur apel — astfel încât un portofel sau un dApp poate avertiza (sau bloca)
*înainte* de semnare.

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

**De ce este unic:** scorarea rulează *în interiorul lanțului* ca un precompile
determinist (`aiRiskScore` la `0x…0B01`, `aiAnomalyCheck` la `0x…0B02`). Alte
rețele pot doar să atașeze servicii AI off-chain, non-deterministe. Acesta este
primul SDK care verifică prin AI o tranzacție înainte ca aceasta să fie semnată,
cu un rezultat on-chain. Vezi [AI înainte de difuzare](/sdk/guides/ai-preflight).

---

## 2. Apeluri unificate cross-VM — un cont, trei VM-uri, o tranzacție

**Apelează un contract pe orice VM și grupează apeluri pe toate cele trei în mod atomic.**

QoreChain rulează contracte CosmWasm, EVM și SVM pe același lanț cu o punte nativă
cross-VM. SDK-ul expune o singură interfață pentru a apela oricare dintre ele — și
pentru a împacheta mai multe apeluri cross-VM într-o singură tranzacție atomică,
semnată o singură dată.

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

**De ce este unic:** QoreChain este singurul L1 cu trei VM-uri co-rezidente și un
modul de punte nativă (`crossvm` + precompile-ul `CrossVMBridge`). Lanțurile cu un
singur VM nu pot exprima „un cont, trei VM-uri, o tranzacție atomică" — SDK-urile
lor nu au ce înfășura. Scrii o dată, apelezi orice VM. Vezi
[Apeluri cross-VM](/sdk/guides/cross-vm).

---

## 3. Sigur cuantic în mod implicit

**Fă un semnatar protejat post-cuantic într-un singur apel.**

QoreChain impune semnături hibride post-cuantice (ML-DSA-87 + clasice) la nivel de
protocol. SDK-ul face adoptarea lor o singură linie de cod: verifică, înregistrează
și migrează la semnarea hibridă — cu un badge React care le arată utilizatorilor că
sunt protejați.

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

**De ce este unic:** criptografia post-cuantică este nativă și obligatorie pe
QoreChain, nu un experiment. Acesta este primul SDK în care „sigur cuantic în mod
implicit" este un singur apel plus un badge gata de integrare. Vezi
[Sigur cuantic](/sdk/guides/quantum-safe).

---

## Și tot restul

Dincolo de cei trei factori de diferențiere, SDK-ul acoperă întreaga suprafață a
lanțului în **TypeScript, Python, Go, Rust și Java**: composere tipizate pentru
fiecare modul (inclusiv sidechain-uri/paychain-uri prin `multilayer` și rollup-uri
prin `rdk`), interogări tipizate, ciclul de viață al tranzacției, abonamente,
portofele de browser și kit-ul de hook-uri [`@qorechain/react`](/sdk/guides/react).

Gata să construiești? Începe cu [Quickstart](/sdk/quickstart).
