---
slug: /sdk/why
title: Pourquoi le SDK QoreChain
sidebar_label: Pourquoi le SDK QoreChain
sidebar_position: 2
---

# Pourquoi le SDK QoreChain

Le SDK QoreChain vous offre tout ce que propose un SDK multi-chaînes moderne — des
messages typés pour chaque module, des requêtes typées, des comptes pour trois VM à partir
d'un seul mnémonique, l'auto-gas, le décodage d'erreurs, les abonnements, les portefeuilles et un kit React.

Mais trois capacités sont **uniquement possibles sur QoreChain**, parce qu'elles reposent
sur des fonctionnalités de protocole qu'aucune autre Layer 1 ne possède : l'IA on-chain, trois VM co-résidentes
avec un pont natif, et une cryptographie post-quantique obligatoire. Voilà les
raisons de construire ici.

---

## 1. Évaluation des risques par IA avant diffusion

**Analysez une transaction avec l'IA on-chain avant de la diffuser.**

QoreChain fournit une analyse de risque par IA sous forme de précompilés EVM. Le SDK les appelle pour vous
et renvoie le gas ainsi qu'un verdict de risque/anomalie en un seul appel — afin qu'un portefeuille ou
une dApp puisse avertir (ou bloquer) *avant* la signature.

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

**Pourquoi c'est unique :** l'évaluation s'exécute *à l'intérieur de la chaîne* sous forme de
précompilé déterministe (`aiRiskScore` à `0x…0B01`, `aiAnomalyCheck` à `0x…0B02`). Les autres
réseaux ne peuvent qu'ajouter des services d'IA off-chain et non déterministes. Il s'agit du
premier SDK qui filtre une transaction par IA avant qu'elle ne soit signée, avec un résultat on-chain.
Voir [Pré-vérification par IA](/sdk/guides/ai-preflight).

---

## 2. Appels cross-VM unifiés — un compte, trois VM, une transaction

**Appelez un contrat sur n'importe quelle VM, et regroupez des appels sur les trois de façon atomique.**

QoreChain exécute des contrats CosmWasm, EVM et SVM sur la même chaîne avec un pont
cross-VM natif. Le SDK expose une interface unique pour appeler n'importe lequel d'entre eux — et pour regrouper
plusieurs appels cross-VM en une seule transaction atomique signée une seule fois.

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

**Pourquoi c'est unique :** QoreChain est la seule L1 dotée de trois VM co-résidentes et d'un
module de pont natif (`crossvm` + le précompilé `CrossVMBridge`). Les chaînes à VM unique
ne peuvent pas exprimer « un compte, trois VM, une transaction atomique » — leurs
SDK n'ont rien à encapsuler. Écrivez une fois, appelez n'importe quelle VM. Voir
[Appels cross-VM](/sdk/guides/cross-vm).

---

## 3. Résistance quantique par défaut

**Rendez un signataire protégé contre le quantique en un seul appel.**

QoreChain impose des signatures post-quantiques hybrides (ML-DSA-87 + classique) au
niveau du protocole. Le SDK fait de leur adoption une seule ligne de code : vérifier, enregistrer et
migrer vers la signature hybride — avec un badge React pour montrer aux utilisateurs qu'ils sont protégés.

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

**Pourquoi c'est unique :** la cryptographie post-quantique est native et obligatoire sur
QoreChain, ce n'est pas une expérimentation. Il s'agit du premier SDK où « résistance quantique par
défaut » se résume à un seul appel et à un badge prêt à l'emploi. Voir
[Résistance quantique](/sdk/guides/quantum-safe).

---

## Et tout le reste aussi

Au-delà des trois différenciateurs, le SDK couvre l'ensemble de la surface de la chaîne sur
**TypeScript, Python, Go, Rust et Java** : des composeurs typés pour chaque module
(y compris les sidechains/paychains via `multilayer` et les rollups via `rdk`), des requêtes
typées, le cycle de vie des transactions, les abonnements, les portefeuilles de navigateur et le kit de hooks
[`@qorechain/react`](/sdk/guides/react).

Prêt à construire ? Commencez par le [Démarrage rapide](/sdk/quickstart).
