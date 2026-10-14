---
slug: /rollups/why
title: De ce QoreChain RDK
sidebar_label: De ce QoreChain RDK
sidebar_position: 2
---

# De ce QoreChain RDK

Majoritatea kiturilor de dezvoltare pentru rollup-uri sunt variațiuni pe aceeași
temă: te ajută să lansezi un app-chain care se decontează pe un strat de bază.
QoreChain RDK face și asta, și adaugă trei capabilități specifice QoreChain,
construite în jurul Layer 1-ului QoreChain, nu al uneltelor:

- un strat de decontare **post-cuantic**,
- primitive de consultanță **AI/RL on-chain** (QCAI) și
- un runtime **triple-VM** cu apeluri cross-VM.

:::caution Etapă timpurie: citește coloana de stare
Până acum nu a fost creat niciun rollup pe niciuna dintre rețele. Tabelul de mai
jos arată ce funcționează astăzi. Dacă ai nevoie doar de un rollup
optimistic/zk generic, orice kit e suficient; capabilitățile de aici sunt ceea
ce adaugă RDK-ul în plus, în TypeScript, Python, Go, Rust și Java.
:::

| Capabilitate | Stare | Pe ce se bazează |
| --- | --- | --- |
| **Chitanțe de decontare sigure cuantic** | 🟡 Etapă timpurie | Ancorele sunt semnate cu ML-DSA-87, schema post-cuantică a Main Chain; încă nu există ancore |
| **QCAI Rollup Copilot** | 🟡 Încă indisponibil pe endpoint-urile publice | Servicii de consultanță AI/RL on-chain pe care endpoint-urile publice nu le expun astăzi |
| **Apeluri cross-VM multi-VM** | 🟡 Încă inutilizabil pe rețelele live | Un precompile cross-VM care nu este activat, iar încărcarea CosmWasm este închisă |

---

## 1. Chitanțe de decontare sigure cuantic

> 🟡 **Design construit pe stratul de bază post-cuantic al QoreChain.** Ancorele
> de decontare sunt semnate cu ML-DSA-87 (Dilithium-5, FIPS-204), aceeași schemă
> pe care o folosește Main Chain. Etapă timpurie: încă nu există ancore pe
> niciuna dintre rețele.

Când creatorul rollup-ului tău ancorează un lot de decontare, ancora este semnată
cu o cheie post-cuantică înregistrată on-chain. RDK-ul poate împacheta acea
ancoră ca o **chitanță portabilă**, iar un verificator re-citește afirmația de
la un nod QoreChain pentru a confirma că rollup-ul, lotul, ancora și cheia
creatorului se potrivesc cu ceea ce deține lanțul.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

Vezi [Chitanțe de decontare sigure cuantic](/rollups/settlement-receipts) pentru
ce dovedește și ce nu dovedește o chitanță.

---

## 2. QCAI Rollup Copilot

> 🟡 **Încă indisponibil pe endpoint-urile publice.**

Copilot-ul este menit să agrege serviciile de consultanță ale rețelei (un agent
de politică a comisioanelor, recomandări, investigații de fraudă) într-o singură
vedere read-only, în limbaj simplu, pentru un rollup. Este best-effort: dacă un
serviciu nu este accesibil, degradează la un avertisment în loc să eșueze. Aceste
servicii nu sunt expuse astăzi pe endpoint-urile publice, deci fiecare secțiune
revine ca avertisment.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

Din CLI: `qorollup advise my-rollup`. Vezi [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Apeluri cross-VM multi-VM

> 🟡 **Încă inutilizabil pe rețelele live** — precompile-ul nu este activat, iar
> încărcarea CosmWasm este închisă. Vezi [Multi-VM](/rollups/multi-vm).

RDK-ul include helpere care codifică un apel de la un contract EVM (Solidity)
către un contract **CosmWasm** printr-un precompile fix la `0x…0901`. Acel
precompile **nu este activ** pe mainnet sau testnet (vezi
[Precompile-uri EVM: starea rețelei](/developer-guide/evm-precompiles#network-status)).

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
(Doar EVM↔CosmWasm; apelurile cross-VM către SVM sunt separate.)

---

## Tot restul la care te-ai aștepta

Dincolo de aceste capabilități, RDK-ul livrează și elementele standard: cinci
clienți de limbaj publicați, verificați pe vectori golden partajați, cele cinci
profiluri preset și matricea completă de compatibilitate, gestionarea loturilor
de decontare și a ciclului de viață, stocare nativă pentru disponibilitatea
datelor (vezi nota sa de stare), un auto-contestator **watchtower** pentru
rollup-urile optimistic și CLI-ul de operator `qorollup`.

## Pași următori

- [Implementarea unui Rollup](/rollups/deploying-a-rollup) — instalare pe
  fiecare limbaj și calea prin CLI către un rollup pe testnet.
- [Chitanțe de decontare sigure cuantic](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — analizele detaliate.
