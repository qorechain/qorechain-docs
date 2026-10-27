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
Până acum nu a fost creat niciun rollup pe niciuna dintre rețele (verificat la 27
octombrie 2026). Tabelul de mai jos arată ce funcționează astăzi; ce au schimbat
clienții 0.6.x publicați și limitele care rămân sunt adunate în
[RDK 0.6.2: modificări și limite](/rollups/deploying-a-rollup#rdk-050-limits). Dacă ai nevoie doar de un rollup
optimistic/zk generic, orice kit e suficient; capabilitățile de aici sunt ceea
ce adaugă RDK-ul în plus, în TypeScript, Python, Go, Rust și Java.
:::

| Capabilitate | Stare | Pe ce se bazează |
| --- | --- | --- |
| **Chitanțe de decontare** | 🟡 Etapă timpurie | Ancorele sunt semnate cu ML-DSA-87, schema post-cuantică a Main Chain; încă nu există ancore, deci verificatorul 0.6.2 (care verifică față de lanț) nu a rulat niciodată pe o ancoră reală |
| **QCAI Rollup Copilot** | 🟡 Încă indisponibil pe endpoint-urile publice | Servicii de consultanță AI/RL on-chain pe care endpoint-urile publice nu le expun astăzi |
| **Apeluri cross-VM multi-VM** | 🟡 Încă inutilizabil pe rețelele live | Un precompile cross-VM care nu este activat (encoderul din 0.6.0 se potrivește cu structura lanțului), iar încărcarea QoreChain Native este închisă |

---

## 1. Chitanțe de decontare

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

`verifySettlementReceipt` verifică față de lanț și refuză să spună `valid`
fără un `client`. În 0.5.0, verificarea sa în lanț nu se putea finaliza pe
rețelele live (eșua închis în loc să raporteze o chitanță autentică drept
validă); 0.6.0 a corectat acest lucru, iar 0.6.1 (și deci 0.6.2) compară fiecare câmp al chitanței, dar nu există încă nicio ancoră, deci niciuna dintre ele nu a rulat pe una reală. Vezi [Chitanțe de decontare](/rollups/settlement-receipts) pentru
ce dovedește și ce nu dovedește o chitanță și pentru limitele exacte.

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
> încărcarea QoreChain Native este închisă. Vezi [Multi-VM](/rollups/multi-vm).

RDK-ul include helpere care codifică un apel de la un contract EVM (Solidity)
către un contract **QoreChain Native** printr-un precompile fix la `0x…0901`. Acel
precompile **nu este activ** pe mainnet sau testnet (vezi
[Precompile-uri EVM: starea rețelei](/developer-guide/evm-precompiles#network-status)):
`eth_getCode` pentru `0x…0901` returnează `0x` pe ambele, iar un apel de contract
către el reușește fără niciun efect.

Helperul `encodeCrossVmCalldata` (din 0.6.0) construiește calldata pentru
`executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`, structura
pe care o decodifică nodul (0.5.0 și versiunile anterioare codificau o formă cu două
argumente, cu alt selector, care nu ar fi putut ajunge niciodată la precompile).
Poți codifica singur același apel, arătat aici cu viem (`targetVM` 1 este
QoreChain Native, singura țintă suportată):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = QoreChain Native
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

Sau direct din Solidity, pe rollup-ul tău:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

`ok` singur nu dovedește nimic astăzi: cât timp precompile-ul nu are cod, apelul
returnează succes cu date goale și nu execută nimic, așa că confirmă efectul pe
contractul țintă.

Generează un proiect de pornire cu `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Doar EVM↔QoreChain Native; apelurile cross-VM către SVM sunt separate.)

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
- [Chitanțe de decontare](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — analizele detaliate.
