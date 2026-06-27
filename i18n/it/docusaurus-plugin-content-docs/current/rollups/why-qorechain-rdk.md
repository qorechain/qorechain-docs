---
slug: /rollups/why
title: Perché QoreChain RDK
sidebar_label: Perché QoreChain RDK
sidebar_position: 2
---

# Perché QoreChain RDK

La maggior parte dei kit di sviluppo per rollup sono variazioni sullo stesso tema: ti aiutano a
lanciare una app-chain che effettua il settlement su un base layer. Anche QoreChain RDK lo fa
— ma espone inoltre tre cose **che nessun altro kit per rollup può offrire**, perché
dipendono da capacità che risiedono nel Layer 1 di QoreChain, non nel tooling:

- un settlement layer **post-quantum**,
- primitive avanzate **di AI/RL on-chain** (QCAI), e
- un runtime **triple-VM** con chiamate cross-VM.

Se ti serve soltanto un generico rollup ottimistico/zk, qualsiasi kit andrà bene. Se vuoi
che il settlement del tuo rollup sia **verificabile, quantum-safe e AI-aware**, questo
è l'unico kit in grado di esprimerlo — in TypeScript, Python, Go, Rust e Java.

| Elemento distintivo | Stato | Perché è possibile solo qui |
| --- | --- | --- |
| **Ricevute di settlement quantum-safe** | 🟢 Unico (first-mover) | Richiede un L1 post-quantum — impossibile su un base layer non-PQC |
| **QCAI Rollup Copilot** | 🟢 Unico tramite la chain | Incapsula endpoint di AI/RL on-chain esclusivi di QoreChain |
| **Chiamate cross-VM multi-VM** | 🟡 Distintivo | QoreChain esegue EVM + CosmWasm + SVM sotto un'unica chain |

---

## 1. Ricevute di settlement quantum-safe

> 🟢 **Unico.** Nessun kit per rollup costruito su un L1 non-post-quantum può offrirlo.

Quando il tuo rollup ancora un batch di settlement, QoreChain effettua il commit della sua state root sulla
Main Chain con una firma **post-quantum (ML-DSA-87 / Dilithium-5, FIPS-204)**.
L'RDK trasforma quell'ancoraggio in una **ricevuta portatile** che chiunque può
verificare **completamente offline** — nessun nodo, nessuna fiducia nel kit, solo matematica.

La ricevuta dimostra due cose: la state root del batch è quella che è stata
ancorata (binding) e l'ancoraggio è stato firmato con la chiave post-quantum registrata del creatore del layer
(autenticità). La firma copre il messaggio canonico
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

**Completamente offline** — consegna la ricevuta e la chiave pubblica del creatore a chiunque, su
una macchina air-gapped, e potrà verificarla senza toccare la rete:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

La stessa ricevuta si verifica **byte per byte in tutti e cinque i linguaggi** (i
client non-TypeScript usano la libreria `qorechain-pqc` della chain stessa), così una ricevuta
prodotta da un servizio TypeScript si verifica in modo identico in un auditor Go o in un backend
Java. Vedi [Ricevute di settlement quantum-safe](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Unico tramite la chain.** Costruito su endpoint di AI/RL on-chain che altre
> reti semplicemente non hanno.

QoreChain esegue servizi di AI/RL a livello di rete on-chain — un agente per la fee policy, raccomandazioni
di rete, indagini sulle frodi, circuit breaker. Il Copilot li aggrega
in un'unica vista in linguaggio semplice, esaminabile, per un singolo rollup. È
di sola lettura e best-effort: se un servizio di advisory non è raggiungibile, degrada a
un avviso invece di fallire.

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

Dalla CLI:

```bash
qorollup advise my-rollup
```

Gli altri kit non hanno nulla da incapsulare — i dati di advisory sono una primitiva di QoreChain.
Vedi [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Chiamate cross-VM multi-VM

> 🟡 **Distintivo.** QoreChain esegue EVM, CosmWasm e SVM sotto un'unica chain, con
> un precompile che fa da ponte EVM → CosmWasm.

Il tuo contratto rollup EVM (Solidity) può chiamare un contratto **CosmWasm** esistente
attraverso un precompile fisso all'indirizzo `0x…0901`. L'RDK costruisce il calldata per te, così
puoi riutilizzare un oracolo, un token o un registro CosmWasm da Solidity senza
reimplementarlo.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Oppure direttamente da Solidity sul tuo rollup:

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

Genera un progetto di partenza con `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Solo EVM↔CosmWasm; le chiamate cross-VM su SVM sono separate.) Vedi [Multi-VM](/rollups/multi-vm).

---

## Tutto il resto che ti aspetteresti

Oltre agli elementi distintivi, l'RDK include anche le funzionalità di base: cinque client per linguaggi
pubblicati e verificati rispetto a golden vector condivisi, i cinque profili preimpostati
e la matrice di compatibilità completa, la gestione dei batch di settlement e del ciclo di vita,
data availability nativa, un auto-challenger **watchtower** per rollup
ottimistici e la CLI operatore `qorollup`.

## Avanti

- [Distribuire un Rollup](/rollups/deploying-a-rollup) — installazione per linguaggio e
  da zero a un rollup testnet attivo.
- [Ricevute di settlement quantum-safe](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — gli approfondimenti.
