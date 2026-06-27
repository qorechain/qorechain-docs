---
slug: /rollups/why
title: Warum QoreChain RDK
sidebar_label: Warum QoreChain RDK
sidebar_position: 2
---

# Warum QoreChain RDK

Die meisten Rollup-Development-Kits sind Variationen desselben Themas: Sie helfen
dir, eine App-Chain zu starten, die auf einem Base Layer settlet. Das QoreChain
RDK macht das ebenfalls — bietet aber zusätzlich drei Dinge, die **kein anderes
Rollup-Kit kann**, weil sie von Fähigkeiten abhängen, die in QoreChains Layer 1
liegen und nicht im Tooling:

- einen **Post-Quantum**-Settlement-Layer,
- **On-Chain-KI/RL**-Advisory-Primitive (QCAI) und
- eine **Triple-VM**-Laufzeit mit VM-übergreifenden Aufrufen.

Wenn du nur ein generisches Optimistic-/ZK-Rollup brauchst, genügt jedes Kit.
Wenn du willst, dass das Settlement deines Rollups **verifizierbar, quantensicher
und KI-bewusst** ist, ist dies das einzige Kit, das das ausdrücken kann — in
TypeScript, Python, Go, Rust und Java.

| Differenzierungsmerkmal | Status | Warum nur hier möglich |
| --- | --- | --- |
| **Quantensichere Settlement-Belege** | 🟢 Einzigartig (First-Mover) | Benötigt eine Post-Quantum-L1 — unmöglich auf einem Nicht-PQC-Base-Layer |
| **QCAI Rollup Copilot** | 🟢 Einzigartig durch die Chain | Umschließt QoreChain-exklusive On-Chain-KI/RL-Endpunkte |
| **Multi-VM-, VM-übergreifende Aufrufe** | 🟡 Unverwechselbar | QoreChain betreibt EVM + CosmWasm + SVM unter einer Chain |

---

## 1. Quantensichere Settlement-Belege

> 🟢 **Einzigartig.** Kein Rollup-Kit, das auf einer Nicht-Post-Quantum-L1
> aufbaut, kann das bieten.

Wenn dein Rollup einen Settlement-Batch verankert, committet QoreChain dessen
State-Root unter einer **Post-Quantum-Signatur (ML-DSA-87 / Dilithium-5,
FIPS-204)** auf die Main Chain. Das RDK macht aus diesem Anker einen **portablen
Beleg**, den jeder **vollständig offline** verifizieren kann — kein Node, kein
Vertrauen in das Kit, nur Mathematik.

Der Beleg weist zwei Dinge nach: dass der State-Root des Batches derjenige ist,
der verankert wurde (Bindung), und dass der Anker mit dem registrierten
Post-Quantum-Schlüssel des Layer-Erstellers signiert wurde (Authentizität). Die
Signatur deckt die kanonische Nachricht
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`
ab.

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

**Vollständig offline** — übergib den Beleg und den öffentlichen Schlüssel des
Erstellers an jemanden auf einer Air-Gap-Maschine, und er kann ihn verifizieren,
ohne das Netzwerk anzufassen:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Derselbe Beleg verifiziert **byte-für-byte über alle fünf Sprachen hinweg** (die
Nicht-TypeScript-Clients nutzen die chain-eigene `qorechain-pqc`-Bibliothek),
sodass ein von einem TypeScript-Dienst erzeugter Beleg in einem Go-Auditor oder
einem Java-Backend identisch verifiziert. Siehe
[Quantensichere Settlement-Belege](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Einzigartig durch die Chain.** Aufgebaut auf On-Chain-KI/RL-Endpunkten,
> die andere Netzwerke schlicht nicht haben.

QoreChain betreibt KI/RL-Dienste auf Netzwerkebene on-chain — einen
Fee-Policy-Agenten, Netzwerkempfehlungen, Betrugsuntersuchungen, Circuit
Breaker. Der Copilot aggregiert sie zu einer einzigen, überprüfbaren Ansicht in
Klartext für ein Rollup. Er ist schreibgeschützt und Best-Effort: Ist ein
Advisory-Dienst nicht erreichbar, degradiert er zu einer Warnung, statt zu
scheitern.

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

Über die CLI:

```bash
qorollup advise my-rollup
```

Andere Kits haben nichts zum Umschließen — die Advisory-Daten sind ein
QoreChain-Primitiv. Siehe [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Multi-VM-, VM-übergreifende Aufrufe

> 🟡 **Unverwechselbar.** QoreChain betreibt EVM, CosmWasm und SVM unter einer
> Chain, mit einem Precompile, der EVM → CosmWasm überbrückt.

Dein EVM-Rollup-Vertrag (Solidity) kann über ein festes Precompile bei
`0x…0901` einen bestehenden **CosmWasm**-Vertrag aufrufen. Das RDK baut die
Calldata für dich, sodass du ein CosmWasm-Orakel, -Token oder -Registry aus
Solidity wiederverwenden kannst, ohne es neu zu implementieren.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Oder direkt aus Solidity auf deinem Rollup:

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

Erzeuge ein Starter-Gerüst mit `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Nur EVM↔CosmWasm; SVM-Cross-Calls sind separat.) Siehe [Multi-VM](/rollups/multi-vm).

---

## Alles Weitere, das du erwartest

Über die Differenzierungsmerkmale hinaus liefert das RDK auch die
Grundausstattung: fünf veröffentlichte Sprach-Clients, verifiziert gegen
gemeinsame Golden Vectors, die fünf Preset-Profile und die vollständige
Kompatibilitätsmatrix, Settlement-Batch- und Lifecycle-Management, native Data
Availability, einen **Watchtower**-Auto-Challenger für Optimistic Rollups und die
`qorollup`-Operator-CLI.

## Weiter

- [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) — Installation pro
  Sprache und von null bis zu einem live laufenden Testnet-Rollup.
- [Quantensichere Settlement-Belege](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — die vertieften Betrachtungen.
