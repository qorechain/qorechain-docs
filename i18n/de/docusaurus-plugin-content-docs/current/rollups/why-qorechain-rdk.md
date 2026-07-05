---
slug: /rollups/why
title: Warum QoreChain RDK
sidebar_label: Warum QoreChain RDK
sidebar_position: 2
---

# Warum QoreChain RDK

Die meisten Rollup Development Kits sind Variationen desselben Themas: Sie helfen
Ihnen, eine App-Chain zu starten, die auf einer Basisschicht abgewickelt wird. Das
QoreChain RDK kann das auch — aber es stellt darüber hinaus drei Dinge bereit, die
**kein anderes Rollup-Kit bieten kann**, weil sie von Fähigkeiten abhängen, die in
QoreChains Layer 1 leben, nicht im Tooling:

- eine **Post-Quanten**-Abwicklungsschicht,
- **On-Chain-KI/RL**-Beratungsprimitive (QCAI) und
- eine **Triple-VM**-Laufzeitumgebung mit VM-übergreifenden Aufrufen.

Wenn Sie nur ein generisches optimistisches/zk-Rollup benötigen, tut es jedes Kit.
Wenn Sie möchten, dass die Abwicklung Ihres Rollups **verifizierbar, quantensicher
und KI-bewusst** ist, ist dies das einzige Kit, das das ausdrücken kann — in
TypeScript, Python, Go, Rust und Java.

| Differenzierungsmerkmal | Status | Warum es nur hier möglich ist |
| --- | --- | --- |
| **Quantensichere Abwicklungsquittungen** | 🟢 Einzigartig (First-Mover) | Erfordert eine Post-Quanten-L1 — unmöglich auf einer Basisschicht ohne PQC |
| **QCAI Rollup Copilot** | 🟢 Einzigartig durch die Chain | Kapselt On-Chain-KI/RL-Endpunkte, die es nur bei QoreChain gibt |
| **Multi-VM: VM-übergreifende Aufrufe** | 🟡 Herausragend | QoreChain betreibt EVM + CosmWasm + SVM unter einer Chain |

---

## 1. Quantensichere Abwicklungsquittungen

> 🟢 **Einzigartig.** Kein Rollup-Kit, das auf einer Nicht-Post-Quanten-L1 aufbaut,
> kann das bieten.

Wenn Ihr Rollup einen Abwicklungs-Batch verankert, committet QoreChain dessen
State-Root mit einer **Post-Quanten-Signatur (ML-DSA-87 / Dilithium-5, FIPS-204)**
auf der Main Chain. Das RDK verwandelt diesen Anker in eine **portable Quittung**,
die jeder **vollständig offline** verifizieren kann — kein Node, kein Vertrauen in
das Kit, nur Mathematik.

Die Quittung beweist zwei Dinge: Der State-Root des Batches ist derjenige, der
verankert wurde (Bindung), und der Anker wurde mit dem registrierten
Post-Quanten-Schlüssel des Layer-Erstellers signiert (Authentizität). Die Signatur
deckt die kanonische Nachricht
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`
ab.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "mainnet" });

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**Vollständig offline** — geben Sie die Quittung und den öffentlichen Schlüssel des
Erstellers an eine beliebige Person weiter, auch auf einer Air-Gapped-Maschine, und
sie kann sie verifizieren, ohne das Netzwerk zu berühren:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Dieselbe Quittung verifiziert **Byte für Byte identisch in allen fünf Sprachen**
(die Nicht-TypeScript-Clients verwenden die chaineigene Bibliothek
`qorechain-pqc`), sodass eine von einem TypeScript-Dienst erzeugte Quittung in
einem Go-Auditor oder einem Java-Backend identisch verifiziert wird. Siehe
[Quantensichere Abwicklungsquittungen](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Einzigartig durch die Chain.** Aufgebaut auf On-Chain-KI/RL-Endpunkten, die
> andere Netzwerke schlicht nicht haben.

QoreChain betreibt KI/RL-Dienste auf Netzwerkebene on-chain — einen
Fee-Policy-Agenten, Netzwerkempfehlungen, Betrugsuntersuchungen, Circuit Breaker.
Der Copilot aggregiert sie zu einer einzigen, überprüfbaren Klartext-Ansicht für
ein Rollup. Er ist schreibgeschützt und Best-Effort: Ist ein Beratungsdienst nicht
erreichbar, degradiert er zu einer Warnung, statt fehlzuschlagen.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet" }); // REST + qor_ JSON-RPC endpoints baked in (RDK ≥ 0.4.2)

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

Andere Kits haben nichts zu kapseln — die Beratungsdaten sind ein
QoreChain-Primitiv. Siehe [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Multi-VM: VM-übergreifende Aufrufe

> 🟡 **Herausragend.** QoreChain betreibt EVM, CosmWasm und SVM unter einer Chain,
> mit einem Precompile, das EVM → CosmWasm überbrückt.

Ihr EVM-(Solidity-)Rollup-Contract kann einen bestehenden **CosmWasm**-Contract
über ein festes Precompile unter `0x…0901` aufrufen. Das RDK baut die Calldata für
Sie, sodass Sie ein CosmWasm-Orakel, einen Token oder ein Register aus Solidity
heraus wiederverwenden können, ohne es neu zu implementieren.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Oder direkt aus Solidity auf Ihrem Rollup:

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

Erstellen Sie ein Starter-Gerüst mit
`npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Nur EVM↔CosmWasm; SVM-Cross-Calls sind separat.) Siehe
[Multi-VM](/rollups/multi-vm).

---

## Alles andere, was Sie erwarten würden

Über die Differenzierungsmerkmale hinaus liefert das RDK auch die
Grundausstattung: fünf veröffentlichte Sprach-Clients, verifiziert gegen
gemeinsame Golden Vectors, die fünf Preset-Profile und die vollständige
Kompatibilitätsmatrix, Verwaltung von Abwicklungs-Batches und Lebenszyklus, native
Datenverfügbarkeit, einen **Watchtower**-Auto-Challenger für optimistische Rollups
und die Operator-CLI `qorollup`.

## Weiter

- [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) — Installation je
  Sprache und von null zu einem laufenden Testnet-Rollup.
- [Quantensichere Abwicklungsquittungen](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — die Deep Dives.
