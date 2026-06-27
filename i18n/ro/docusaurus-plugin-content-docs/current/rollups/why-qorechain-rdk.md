---
slug: /rollups/why
title: De ce QoreChain RDK
sidebar_label: De ce QoreChain RDK
sidebar_position: 2
---

# De ce QoreChain RDK

Majoritatea kit-urilor de dezvoltare pentru rollup-uri sunt variațiuni ale
aceleiași teme: te ajută să lansezi un app-chain care se decontează către un strat
de bază. QoreChain RDK face și asta — dar expune, în plus, trei lucruri pe care
**niciun alt kit de rollup nu le poate oferi**, deoarece depind de capabilități
care se află în Layer 1 al QoreChain, nu în instrumentar:

- un strat de decontare **post-cuantic**,
- primitive consultative de **AI/RL on-chain** (QCAI) și
- un runtime cu **triplu VM** și apeluri inter-VM.

Dacă ai nevoie doar de un rollup optimist/zk generic, orice kit este suficient.
Dacă vrei ca decontarea rollup-ului tău să fie **verificabilă, rezistentă la
calculul cuantic și conștientă de AI**, acesta este singurul kit care o poate
exprima — în TypeScript, Python, Go, Rust și Java.

| Element diferențiator | Stare | De ce este posibil doar aici |
| --- | --- | --- |
| **Chitanțe de decontare rezistente la calculul cuantic** | 🟢 Unic (pionier) | Necesită un L1 post-cuantic — imposibil pe un strat de bază non-PQC |
| **QCAI Rollup Copilot** | 🟢 Unic prin lanț | Încapsulează endpoint-uri de AI/RL on-chain exclusive QoreChain |
| **Apeluri multi-VM inter-VM** | 🟡 Distinctiv | QoreChain rulează EVM + CosmWasm + SVM sub un singur lanț |

---

## 1. Chitanțe de decontare rezistente la calculul cuantic

> 🟢 **Unic.** Niciun kit de rollup construit pe un L1 non-post-cuantic nu poate oferi acest lucru.

Când rollup-ul tău ancorează un lot de decontare, QoreChain își angajează
rădăcina de stare către Lanțul Principal sub o semnătură **post-cuantică
(ML-DSA-87 / Dilithium-5, FIPS-204)**. RDK transformă acea ancoră într-o
**chitanță portabilă** pe care oricine o poate verifica **complet offline** —
fără nod, fără încredere în kit, doar matematică.

Chitanța dovedește două lucruri: rădăcina de stare a lotului este cea care a fost
ancorată (legare) și că ancora a fost semnată cu cheia post-cuantică înregistrată
a creatorului stratului (autenticitate). Semnătura acoperă mesajul canonic
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

**Complet offline** — predă chitanța și cheia publică a creatorului oricui, pe o
mașină izolată (air-gapped), iar acesta o poate verifica fără a atinge rețeaua:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Aceeași chitanță se verifică **octet cu octet în toate cele cinci limbaje**
(clienții non-TypeScript folosesc biblioteca proprie a lanțului `qorechain-pqc`),
astfel încât o chitanță produsă de un serviciu TypeScript se verifică identic
într-un auditor Go sau într-un backend Java. Vezi
[Chitanțe de decontare rezistente la calculul cuantic](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Unic prin lanț.** Construit pe endpoint-uri de AI/RL on-chain pe care alte
> rețele pur și simplu nu le au.

QoreChain rulează servicii de AI/RL la nivel de rețea on-chain — un agent de
politică a comisioanelor, recomandări de rețea, investigații de fraudă, întrerupătoare
de circuit. Copilot le agregă într-o singură vedere unificată, revizuibilă, în
limbaj natural, pentru un singur rollup. Este read-only și de tip best-effort: dacă
un serviciu consultativ este inaccesibil, degradează la un avertisment în loc să
eșueze.

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

Din CLI:

```bash
qorollup advise my-rollup
```

Alte kit-uri nu au nimic de încapsulat — datele consultative sunt o primitivă
QoreChain. Vezi [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Apeluri multi-VM inter-VM

> 🟡 **Distinctiv.** QoreChain rulează EVM, CosmWasm și SVM sub un singur lanț, cu
> un precompile care face puntea EVM → CosmWasm.

Contractul tău de rollup EVM (Solidity) poate apela un contract **CosmWasm**
existent printr-un precompile fix la `0x…0901`. RDK construiește calldata pentru
tine, astfel încât să poți reutiliza un oracle, un token sau un registru CosmWasm
din Solidity fără a-l reimplementa.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Sau direct din Solidity pe rollup-ul tău:

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

Generează un proiect de start cu `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Doar EVM↔CosmWasm; apelurile inter-VM SVM sunt separate.) Vezi [Multi-VM](/rollups/multi-vm).

---

## Tot ce te-ai aștepta

Dincolo de elementele diferențiatoare, RDK livrează și componentele de bază:
cinci clienți de limbaj publicați și verificați față de vectori-etalon comuni,
cele cinci profiluri presetate și întreaga matrice de compatibilitate, gestionarea
loturilor de decontare și a ciclului de viață, disponibilitate nativă a datelor,
un auto-contestator **watchtower** pentru rollup-uri optimiste și CLI-ul de
operator `qorollup`.

## Următorii pași

- [Implementarea unui rollup](/rollups/deploying-a-rollup) — instalarea pentru
  fiecare limbaj și de la zero la un rollup live pe testnet.
- [Chitanțe de decontare rezistente la calculul cuantic](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — analizele detaliate.
