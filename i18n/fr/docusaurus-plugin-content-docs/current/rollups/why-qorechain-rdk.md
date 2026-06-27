---
slug: /rollups/why
title: Pourquoi le RDK QoreChain
sidebar_label: Pourquoi le RDK QoreChain
sidebar_position: 2
---

# Pourquoi le RDK QoreChain

La plupart des kits de développement de rollups sont des variations sur le même
thème : ils vous aident à lancer une chaîne applicative qui se règle sur une
couche de base. Le RDK QoreChain le fait aussi — mais il expose également trois
choses qu'**aucun autre kit de rollup ne peut offrir**, parce qu'elles dépendent
de capacités présentes dans la couche 1 de QoreChain, et non dans l'outillage :

- une couche de règlement **post-quantique**,
- des primitives consultatives d'**IA/RL on-chain** (QCAI), et
- un runtime à **triple VM** avec appels inter-VM.

Si vous n'avez besoin que d'un rollup optimiste/zk générique, n'importe quel kit
fera l'affaire. Si vous voulez que le règlement de votre rollup soit
**vérifiable, résistant au quantique et conscient de l'IA**, c'est le seul kit
capable de l'exprimer — en TypeScript, Python, Go, Rust et Java.

| Différenciateur | Statut | Pourquoi ce n'est possible qu'ici |
| --- | --- | --- |
| **Reçus de règlement résistants au quantique** | 🟢 Unique (premier sur le marché) | Nécessite une L1 post-quantique — impossible sur une couche de base non-PQC |
| **Copilote de rollup QCAI** | 🟢 Unique grâce à la chaîne | Encapsule des endpoints d'IA/RL on-chain propres à QoreChain |
| **Appels inter-VM multi-VM** | 🟡 Distinctif | QoreChain exécute EVM + CosmWasm + SVM sous une seule chaîne |

---

## 1. Reçus de règlement résistants au quantique

> 🟢 **Unique.** Aucun kit de rollup bâti sur une L1 non post-quantique ne peut offrir cela.

Lorsque votre rollup ancre un lot de règlement, QoreChain valide sa racine d'état
sur la chaîne principale (Main Chain) sous une signature
**post-quantique (ML-DSA-87 / Dilithium-5, FIPS-204)**. Le RDK transforme cet
ancrage en un **reçu portable** que n'importe qui peut vérifier **entièrement
hors ligne** — sans nœud, sans confiance dans le kit, juste des mathématiques.

Le reçu prouve deux choses : la racine d'état du lot est bien celle qui a été
ancrée (liaison), et l'ancrage a été signé par la clé post-quantique enregistrée
du créateur de la couche (authenticité). La signature couvre le message canonique
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

**Entièrement hors ligne** — remettez le reçu et la clé publique du créateur à
n'importe qui, sur une machine isolée (air-gapped), et il pourra le vérifier sans
toucher au réseau :

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Le même reçu se vérifie **octet par octet dans les cinq langages** (les clients
non-TypeScript utilisent la bibliothèque `qorechain-pqc` de la chaîne elle-même),
de sorte qu'un reçu produit par un service TypeScript se vérifie à l'identique
dans un auditeur Go ou un backend Java. Consultez
[Reçus de règlement résistants au quantique](/rollups/settlement-receipts).

---

## 2. Copilote de rollup QCAI

> 🟢 **Unique grâce à la chaîne.** Bâti sur des endpoints d'IA/RL on-chain que les
> autres réseaux n'ont tout simplement pas.

QoreChain exécute on-chain des services d'IA/RL au niveau du réseau — un agent de
politique de frais, des recommandations réseau, des enquêtes sur la fraude, des
coupe-circuits. Le Copilote les agrège en une vue unique, examinable et en
langage clair pour un rollup donné. Il est en lecture seule et au mieux : si un
service consultatif est injoignable, il se dégrade en avertissement plutôt que
d'échouer.

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

Depuis le CLI :

```bash
qorollup advise my-rollup
```

Les autres kits n'ont rien à encapsuler — les données consultatives sont une
primitive QoreChain. Consultez [Copilote QCAI](/rollups/qcai-copilot).

---

## 3. Appels inter-VM multi-VM

> 🟡 **Distinctif.** QoreChain exécute EVM, CosmWasm et SVM sous une seule chaîne,
> avec une précompilation qui fait le pont EVM → CosmWasm.

Votre contrat de rollup EVM (Solidity) peut appeler un contrat **CosmWasm**
existant via une précompilation fixe à `0x…0901`. Le RDK construit les calldata
pour vous, ce qui vous permet de réutiliser un oracle, un jeton ou un registre
CosmWasm depuis Solidity sans le réimplémenter.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Ou directement depuis Solidity sur votre rollup :

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

Générez un projet de départ avec `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(EVM↔CosmWasm uniquement ; les appels inter-VM SVM sont distincts.) Consultez
[Multi-VM](/rollups/multi-vm).

---

## Tout le reste auquel vous vous attendez

Au-delà des différenciateurs, le RDK fournit aussi les fondamentaux : cinq
clients de langage publiés et vérifiés sur des vecteurs golden partagés, les cinq
profils prédéfinis et la matrice de compatibilité complète, la gestion des lots
de règlement et du cycle de vie, la disponibilité native des données, un
**watchtower** de contestation automatique pour les rollups optimistes, et le CLI
opérateur `qorollup`.

## Suite

- [Déployer un rollup](/rollups/deploying-a-rollup) — installation par langage et
  passage de zéro à un rollup testnet en production.
- [Reçus de règlement résistants au quantique](/rollups/settlement-receipts) ·
  [Copilote QCAI](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Tour de guet](/rollups/watchtower) — les approfondissements.
