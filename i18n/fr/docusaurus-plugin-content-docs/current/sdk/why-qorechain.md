---
slug: /sdk/why
title: Pourquoi le SDK QoreChain
sidebar_label: Pourquoi le SDK QoreChain
sidebar_position: 2
---

# Pourquoi le SDK QoreChain

Le SDK QoreChain vous offre tout ce qu'un SDK multi-chaînes moderne propose — des
messages typés pour chaque module, des requêtes typées, des comptes pour trois VM
à partir d'un seul mnémonique, le gas automatique, le décodage des erreurs, les
abonnements, les wallets et un kit React.

Mais cinq capacités ne sont **possibles que sur QoreChain**, car elles reposent
sur des fonctionnalités de protocole qu'aucune autre Layer 1 ne possède : l'IA
on-chain, trois VM co-résidentes avec un pont natif, une cryptographie
post-quantique obligatoire, une identité unique de 20 octets sur les trois voies
VM, et des dépenses déléguées compatibles PQC pour les clés de wallets externes.
Voilà les raisons de construire ici.

---

## 1. Évaluation de risque IA avant envoi

**Analysez une transaction avec l'IA on-chain avant de la diffuser.**

QoreChain fournit l'analyse de risque par IA sous forme de precompiles EVM. Le
SDK les appelle pour vous et renvoie le gas ainsi qu'un verdict de risque et
d'anomalie en un seul appel — un wallet ou une dApp peut donc avertir (ou
bloquer) *avant* la signature.

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

**Pourquoi c'est unique :** le scoring s'exécute *à l'intérieur de la chaîne*
sous forme de precompile déterministe (`aiRiskScore` à `0x…0B01`,
`aiAnomalyCheck` à `0x…0B02`). Les autres réseaux ne peuvent qu'ajouter des
services d'IA off-chain et non déterministes. C'est le premier SDK qui soumet
une transaction à un contrôle IA avant sa signature, avec un résultat on-chain.
Voir [Pré-vérification IA](/sdk/guides/ai-preflight).

---

## 2. Appels cross-VM unifiés — un compte, trois VM, une transaction

**Appelez un contrat sur n'importe quelle VM, et regroupez des appels sur les
trois de manière atomique.**

QoreChain exécute des contrats CosmWasm, EVM et SVM sur la même chaîne avec un
pont cross-VM natif. Le SDK expose une interface unique pour appeler n'importe
lequel d'entre eux — et pour regrouper plusieurs appels cross-VM dans une seule
transaction atomique, signée une seule fois.

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

**Pourquoi c'est unique :** QoreChain est la seule L1 avec trois VM co-résidentes
et un module de pont natif (`crossvm` + le precompile `CrossVMBridge`). Les
chaînes mono-VM ne peuvent pas exprimer « un compte, trois VM, une transaction
atomique » — leurs SDK n'ont rien à encapsuler. Écrivez une fois, appelez
n'importe quelle VM. Voir [Appels cross-VM](/sdk/guides/cross-vm).

---

## 3. Sécurité quantique par défaut

**Rendez un signataire protégé contre le quantique en un seul appel.**

QoreChain impose des signatures post-quantiques hybrides (ML-DSA-87 +
classiques) au niveau du protocole. Le SDK réduit leur adoption à une seule
ligne : vérifier, enregistrer et migrer vers la signature hybride — avec un
badge React pour montrer aux utilisateurs qu'ils sont protégés.

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

**Pourquoi c'est unique :** la cryptographie post-quantique est native et
obligatoire sur QoreChain, pas une expérimentation. C'est le premier SDK où
« sécurité quantique par défaut » se résume à un seul appel plus un badge prêt à
l'emploi. Voir [Sécurité quantique](/sdk/guides/quantum-safe).

---

## 4. Comptes eth-natifs unifiés — une clé, trois adresses, un solde

**Une clé `eth_secp256k1` est une identité unique de 20 octets sur les trois
voies.** (SDK 0.6.0, chaîne v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**Pourquoi c'est unique :** sur les configurations multi-VM ailleurs, chaque
runtime possède son propre espace de comptes et les fonds restent bloqués par
voie. QoreChain restitue une même identité de 20 octets de trois manières avec
un solde unique partagé — un wallet n'a jamais « des fonds sur une voie mais pas
sur une autre ». `connectPhantomUnified` amorce même cette identité de manière
non custodiale à partir d'une signature Phantom. Voir
[Comptes unifiés](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Voies d'authentificateurs — dépenses déléguées sans renoncer au PQC

**Une clé Phantom ou MetaMask liée dépense depuis le compte canonique soumis au
PQC, sous limites, via un relayeur.** (SDK 0.7.0, chaîne v3.1.85.)

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

**Pourquoi c'est unique :** chaque dépense est bornée par une taxonomie de
permissions on-chain, des limites `SpendingRule` et une expiration — moindre
privilège et révocable — tandis que le compte lui-même reste protégé contre le
quantique. Voir
[Authentificateurs et dépenses déléguées](/sdk/guides/authenticators).

---

## Et tout le reste aussi

Au-delà des cinq différenciateurs, le SDK couvre toute la surface de la chaîne
en **TypeScript, Python, Go, Rust et Java** : des composeurs typés pour chaque
module (y compris les sidechains/paychains via `multilayer` et les rollups via
`rdk`), des requêtes typées, le cycle de vie des transactions, les abonnements,
les wallets de navigateur et le kit de hooks
[`@qorechain/react`](/sdk/guides/react).

Prêt à construire ? Commencez par le [Démarrage rapide](/sdk/quickstart).
