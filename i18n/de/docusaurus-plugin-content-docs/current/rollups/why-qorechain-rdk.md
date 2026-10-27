---
slug: /rollups/why
title: Warum QoreChain RDK
sidebar_label: Warum QoreChain RDK
sidebar_position: 2
---

# Warum QoreChain RDK

Die meisten Rollup Development Kits sind Variationen desselben Themas: Sie helfen
Ihnen, eine App-Chain zu starten, die auf einer Basisschicht abgewickelt wird. Das
QoreChain RDK kann das auch und ergänzt es um drei QoreChain-spezifische
Fähigkeiten, die um QoreChains Layer 1 herum gebaut sind und nicht um das Tooling:

- eine **Post-Quanten**-Abwicklungsschicht,
- **On-Chain-KI/RL**-Beratungsprimitive (QCAI) und
- eine **Triple-VM**-Laufzeitumgebung mit VM-übergreifenden Aufrufen.

:::caution Frühe Phase: Lesen Sie die Statusspalte
Bisher wurde auf keinem der beiden Netzwerke ein Rollup erstellt (geprüft am
27. Oktober 2026). Die folgende Tabelle gibt an, was heute funktioniert; was die
veröffentlichten 0.6.x-Clients geändert haben und welche Grenzen bleiben, ist unter
[RDK 0.7.0: Änderungen und Grenzen](/rollups/deploying-a-rollup#rdk-050-limits) zusammengefasst.
Wenn Sie nur ein generisches optimistisches/zk-Rollup benötigen, tut es jedes Kit;
die hier genannten Fähigkeiten sind das, was das RDK obendrauf bietet — in
TypeScript, Python, Go, Rust und Java.
:::

| Fähigkeit | Status | Wovon sie abhängt |
| --- | --- | --- |
| **Abwicklungsquittungen** | 🟡 Frühe Phase | Anker werden mit ML-DSA-87 signiert, dem Post-Quanten-Schema der Main Chain; es existieren noch keine Anker, daher wurde der 0.7.0-Verifizierer (der gegen die Chain prüft) noch nie an einem echten Anker ausgeführt |
| **QCAI Rollup Copilot** | 🟡 Auf den öffentlichen Endpunkten noch nicht verfügbar | On-Chain-KI/RL-Beratungsdienste, die die öffentlichen Endpunkte heute nicht bereitstellen |
| **Multi-VM: VM-übergreifende Aufrufe** | 🟡 Auf den Live-Netzwerken noch nicht nutzbar | Ein VM-übergreifendes Precompile, das nicht aktiviert ist (der Encoder seit 0.6.0 passt zum Layout der Chain), und der QoreChain Native-Upload ist geschlossen |

---

## 1. Abwicklungsquittungen

> 🟡 **Design auf Basis der Post-Quanten-Basisschicht von QoreChain.**
> Abwicklungs-Anker werden mit ML-DSA-87 (Dilithium-5, FIPS-204) signiert, demselben
> Schema, das die Main Chain verwendet. Frühe Phase: Auf keinem der beiden
> Netzwerke existieren bisher Anker.

Wenn der Ersteller Ihres Rollups einen Abwicklungs-Batch verankert, wird der Anker
mit einem on-chain registrierten Post-Quanten-Schlüssel signiert. Das RDK kann
diesen Anker als **portable Quittung** verpacken, und ein Verifizierer liest die
Aussage erneut von einem QoreChain-Node, um zu bestätigen, dass Rollup, Batch,
Anker und der Schlüssel des Erstellers mit dem übereinstimmen, was die Chain
speichert.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

`verifySettlementReceipt` prüft gegen die Chain und weigert sich, ohne `client`
`valid` zu melden. In 0.5.0 konnte seine Chain-Prüfung gegen die Live-Netzwerke nicht
abgeschlossen werden (es reagierte fail-closed, statt eine echte Quittung als gültig zu
melden); 0.6.0 hat das behoben und 0.6.1 (und jedes spätere Release) vergleicht jedes Feld der Quittung, aber es existiert noch kein Anker, es wurde also noch keines von beiden an einem echten ausgeführt. Siehe [Abwicklungsquittungen](/rollups/settlement-receipts),
was eine Quittung beweist und was nicht und welche Grenzen genau gelten.

---

## 2. QCAI Rollup Copilot

> 🟡 **Auf den öffentlichen Endpunkten noch nicht verfügbar.**

Der Copilot soll die Beratungsdienste des Netzwerks (einen Fee-Policy-Agenten,
Empfehlungen, Betrugsuntersuchungen) zu einer einzigen, schreibgeschützten
Klartext-Ansicht für ein Rollup zusammenfassen. Er arbeitet nach dem
Best-Effort-Prinzip: Ist ein Dienst nicht erreichbar, degradiert er zu einer
Warnung, statt fehlzuschlagen. Diese Dienste werden auf den öffentlichen
Endpunkten heute nicht bereitgestellt, daher kommt jeder Abschnitt als Warnung
zurück.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

Über die CLI: `qorollup advise my-rollup`. Siehe [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Multi-VM: VM-übergreifende Aufrufe

> 🟡 **Auf den Live-Netzwerken noch nicht nutzbar** — das Precompile ist nicht
> aktiviert und der QoreChain Native-Upload ist geschlossen. Siehe [Multi-VM](/rollups/multi-vm).

Das RDK enthält Helfer, die einen Aufruf von einem EVM-(Solidity-)Contract an einen
**QoreChain Native**-Contract über ein festes Precompile unter `0x…0901` kodieren. Dieses
Precompile ist im Mainnet und im Testnet **nicht aktiv** (siehe
[EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status)):
`eth_getCode` für `0x…0901` liefert auf beiden `0x` zurück, und ein Contract-Aufruf
darauf ist erfolgreich, bleibt aber ohne Wirkung.

Der Helfer `encodeCrossVmCalldata` (seit 0.6.0) baut Calldata für
`executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`, das Layout,
das der Node dekodiert (0.5.0 und früher kodierten eine Form mit zwei Argumenten und
einem anderen Selektor, die das Precompile nie hätte erreichen können). Sie können
denselben Aufruf selbst kodieren, hier mit viem gezeigt (`targetVM` 1 ist
QoreChain Native, das einzige unterstützte Ziel):

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

Oder direkt aus Solidity auf Ihrem Rollup:

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

`ok` allein beweist heute nichts: Solange das Precompile keinen Code hat, liefert der
Aufruf Erfolg mit leeren Daten zurück und führt nichts aus, bestätigen Sie daher die
Wirkung am Ziel-Contract.

Erstellen Sie ein Starter-Gerüst mit `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(Nur EVM↔QoreChain Native; SVM-Cross-Calls sind separat.)

---

## Alles andere, was Sie erwarten würden

Über diese Fähigkeiten hinaus liefert das RDK auch die Grundausstattung: fünf
veröffentlichte Sprach-Clients, verifiziert gegen gemeinsame Golden Vectors, die
fünf Preset-Profile und die vollständige Kompatibilitätsmatrix, Verwaltung von
Abwicklungs-Batches und Lebenszyklus, native Datenverfügbarkeits-Speicherung
(siehe ihren Statushinweis), einen **Watchtower**-Auto-Challenger für
optimistische Rollups und die Operator-CLI `qorollup`.

## Weiter

- [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) — Installation je
  Sprache und der CLI-Weg zu einem Testnet-Rollup.
- [Abwicklungsquittungen](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — die Deep Dives.
