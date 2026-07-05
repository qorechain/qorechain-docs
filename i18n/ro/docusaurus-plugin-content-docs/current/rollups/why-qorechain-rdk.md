---
slug: /rollups/why
title: De ce QoreChain RDK
sidebar_label: De ce QoreChain RDK
sidebar_position: 2
---

# De ce QoreChain RDK

Majoritatea kiturilor de dezvoltare pentru rollup-uri sunt variațiuni pe aceeași
temă: te ajută să lansezi un app-chain care se decontează pe un strat de bază.
QoreChain RDK face și asta — dar expune în plus trei lucruri pe care **niciun
alt kit de rollup nu le poate oferi**, pentru că depind de capabilități care
există în Layer 1-ul QoreChain, nu în unelte:

- un strat de decontare **post-cuantic**,
- primitive de consultanță **AI/RL on-chain** (QCAI) și
- un runtime **triple-VM** cu apeluri cross-VM.

Dacă ai nevoie doar de un rollup optimistic/zk generic, orice kit e suficient.
Dacă vrei ca decontarea rollup-ului tău să fie **verificabilă, sigură cuantic și
conștientă de AI**, acesta este singurul kit care o poate exprima — în
TypeScript, Python, Go, Rust și Java.

| Diferențiator | Stare | De ce este posibil doar aici |
| --- | --- | --- |
| **Chitanțe de decontare sigure cuantic** | 🟢 Unic (first-mover) | Necesită un L1 post-cuantic — imposibil pe un strat de bază fără PQC |
| **QCAI Rollup Copilot** | 🟢 Unic prin intermediul lanțului | Împachetează endpoint-uri AI/RL on-chain disponibile doar pe QoreChain |
| **Apeluri cross-VM multi-VM** | 🟡 Distinctiv | QoreChain rulează EVM + CosmWasm + SVM sub un singur lanț |

---

## 1. Chitanțe de decontare sigure cuantic

> 🟢 **Unic.** Niciun kit de rollup construit pe un L1 care nu este post-cuantic
> nu poate oferi așa ceva.

Când rollup-ul tău ancorează un lot de decontare, QoreChain înscrie rădăcina sa
de stare pe Main Chain sub o semnătură **post-cuantică (ML-DSA-87 /
Dilithium-5, FIPS-204)**. RDK-ul transformă acea ancoră într-o **chitanță
portabilă** pe care oricine o poate verifica **complet offline** — fără nod,
fără încredere în kit, doar matematică.

Chitanța dovedește două lucruri: rădăcina de stare a lotului este cea care a
fost ancorată (legare) și ancora a fost semnată cu cheia post-cuantică
înregistrată a creatorului stratului (autenticitate). Semnătura acoperă mesajul
canonic
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

**Complet offline** — dă chitanța și cheia publică a creatorului oricui, pe o
mașină izolată de rețea (air-gapped), și o poate verifica fără să atingă
rețeaua:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Aceeași chitanță se verifică **octet cu octet în toate cele cinci limbaje**
(clienții non-TypeScript folosesc biblioteca `qorechain-pqc` a lanțului), astfel
încât o chitanță produsă de un serviciu TypeScript se verifică identic într-un
auditor Go sau într-un backend Java. Vezi
[Chitanțe de decontare sigure cuantic](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Unic prin intermediul lanțului.** Construit pe endpoint-uri AI/RL
> on-chain pe care alte rețele pur și simplu nu le au.

QoreChain rulează servicii AI/RL la nivel de rețea direct on-chain — un agent
de politică a comisioanelor, recomandări de rețea, investigații de fraudă,
întrerupătoare de circuit. Copilot-ul le agregă într-o singură vedere,
revizuibilă și în limbaj simplu, pentru un singur rollup. Este read-only și
best-effort: dacă un serviciu de consultanță nu este accesibil, degradează la un
avertisment în loc să eșueze.

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

Din CLI:

```bash
qorollup advise my-rollup
```

Celelalte kituri nu au ce să împacheteze — datele de consultanță sunt o
primitivă QoreChain. Vezi [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Apeluri cross-VM multi-VM

> 🟡 **Distinctiv.** QoreChain rulează EVM, CosmWasm și SVM sub un singur lanț,
> cu un precompile care face puntea EVM → CosmWasm.

Contractul EVM (Solidity) al rollup-ului tău poate apela un contract
**CosmWasm** existent printr-un precompile fix la `0x…0901`. RDK-ul construiește
calldata pentru tine, astfel încât poți reutiliza un oracle, un token sau un
registru CosmWasm din Solidity fără a-l reimplementa.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Sau direct din Solidity, pe rollup-ul tău:

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

Generează un proiect de pornire cu `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Doar EVM↔CosmWasm; apelurile cross-VM către SVM sunt separate.) Vezi
[Multi-VM](/rollups/multi-vm).

---

## Tot restul la care te-ai aștepta

Dincolo de diferențiatori, RDK-ul livrează și elementele standard: cinci
clienți de limbaj publicați, verificați pe vectori golden partajați, cele cinci
profiluri preset și matricea completă de compatibilitate, gestionarea loturilor
de decontare și a ciclului de viață, disponibilitate nativă a datelor, un
auto-contestator **watchtower** pentru rollup-urile optimistic și CLI-ul de
operator `qorollup`.

## Pași următori

- [Implementarea unui Rollup](/rollups/deploying-a-rollup) — instalare pe
  fiecare limbaj și de la zero la un rollup live pe testnet.
- [Chitanțe de decontare sigure cuantic](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — analizele detaliate.
