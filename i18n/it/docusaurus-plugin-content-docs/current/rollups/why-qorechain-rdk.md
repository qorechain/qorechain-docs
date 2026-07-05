---
slug: /rollups/why
title: Perché QoreChain RDK
sidebar_label: Perché QoreChain RDK
sidebar_position: 2
---

# Perché QoreChain RDK

La maggior parte dei kit di sviluppo per rollup sono variazioni sullo stesso
tema: ti aiutano a lanciare una app-chain che regola i propri stati su un layer
di base. Il QoreChain RDK fa anche questo — ma espone in più tre funzionalità
che **nessun altro kit per rollup può offrire**, perché dipendono da capacità
che risiedono nel Layer 1 di QoreChain, non negli strumenti:

- un layer di regolamento **post-quantistico**,
- primitive consultive di **AI/RL on-chain** (QCAI), e
- un runtime **a tripla VM** con chiamate cross-VM.

Se ti serve solo un generico rollup optimistic/zk, qualunque kit va bene. Se
vuoi che il regolamento del tuo rollup sia **verificabile, resistente al
quantum e consapevole dell'AI**, questo è l'unico kit in grado di esprimerlo —
in TypeScript, Python, Go, Rust e Java.

| Elemento distintivo | Stato | Perché è possibile solo qui |
| --- | --- | --- |
| **Ricevute di regolamento quantum-safe** | 🟢 Unico (first-mover) | Richiede un L1 post-quantistico — impossibile su un layer di base non PQC |
| **QCAI Rollup Copilot** | 🟢 Unico grazie alla chain | Incapsula endpoint di AI/RL on-chain esclusivi di QoreChain |
| **Chiamate cross-VM multi-VM** | 🟡 Distintivo | QoreChain esegue EVM + CosmWasm + SVM sotto un'unica chain |

---

## 1. Ricevute di regolamento quantum-safe

> 🟢 **Unico.** Nessun kit per rollup costruito su un L1 non post-quantistico può offrirlo.

Quando il tuo rollup ancora un batch di regolamento, QoreChain registra la sua
state root sulla Main Chain sotto una firma **post-quantistica (ML-DSA-87 /
Dilithium-5, FIPS-204)**. L'RDK trasforma quell'ancoraggio in una **ricevuta
portabile** che chiunque può verificare **completamente offline** — nessun
nodo, nessuna fiducia nel kit, solo matematica.

La ricevuta dimostra due cose: che la state root del batch è quella che è stata
ancorata (vincolo), e che l'ancoraggio è stato firmato con la chiave
post-quantistica registrata del creatore del layer (autenticità). La firma
copre il messaggio canonico
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`.

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

**Completamente offline** — consegna la ricevuta e la chiave pubblica del
creatore a chiunque, su una macchina isolata dalla rete (air-gapped), e potrà
verificarla senza toccare la rete:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

La stessa ricevuta si verifica **byte per byte in tutti e cinque i linguaggi**
(i client non TypeScript usano la libreria `qorechain-pqc` della chain stessa),
quindi una ricevuta prodotta da un servizio TypeScript si verifica in modo
identico in un auditor Go o in un backend Java. Vedi
[Ricevute di regolamento quantum-safe](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Unico grazie alla chain.** Costruito su endpoint di AI/RL on-chain che le
> altre reti semplicemente non hanno.

QoreChain esegue servizi di AI/RL a livello di rete direttamente on-chain — un
agente per la politica delle fee, raccomandazioni di rete, indagini antifrode,
circuit breaker. Il Copilot li aggrega in un'unica vista, rivedibile e in
linguaggio semplice, per un singolo rollup. È in sola lettura e best-effort: se
un servizio consultivo è irraggiungibile, degrada a un avviso invece di fallire.

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

Dalla CLI:

```bash
qorollup advise my-rollup
```

Gli altri kit non hanno nulla da incapsulare — i dati consultivi sono una
primitiva di QoreChain. Vedi [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Chiamate cross-VM multi-VM

> 🟡 **Distintivo.** QoreChain esegue EVM, CosmWasm e SVM sotto un'unica chain,
> con un precompile che fa da ponte EVM → CosmWasm.

Il contratto EVM (Solidity) del tuo rollup può chiamare un contratto
**CosmWasm** esistente attraverso un precompile fisso all'indirizzo `0x…0901`.
L'RDK costruisce la calldata per te, così puoi riutilizzare un oracolo, un
token o un registro CosmWasm da Solidity senza reimplementarlo.

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

Crea uno scheletro di partenza con `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Solo EVM↔CosmWasm; le chiamate cross-VM verso SVM sono separate.) Vedi
[Multi-VM](/rollups/multi-vm).

---

## Tutto il resto che ti aspetteresti

Oltre agli elementi distintivi, l'RDK include anche le funzionalità di base:
cinque client di linguaggio pubblicati e verificati contro golden vector
condivisi, i cinque profili preset e la matrice di compatibilità completa, la
gestione dei batch di regolamento e del ciclo di vita, disponibilità dei dati
nativa, un auto-challenger **watchtower** per i rollup optimistic, e la CLI
operativa `qorollup`.

## Prossimi passi

- [Deploy di un Rollup](/rollups/deploying-a-rollup) — installazione per ogni
  linguaggio e da zero a un rollup live su testnet.
- [Ricevute di regolamento quantum-safe](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — gli approfondimenti.
