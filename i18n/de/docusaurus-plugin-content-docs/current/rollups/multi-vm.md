---
slug: /rollups/multi-vm
title: Multi-VM (VM-übergreifende Aufrufe)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (VM-übergreifende Aufrufe)

Das RDK enthält TypeScript-Helfer, die einen Aufruf aus einem EVM-Contract in das **VM-übergreifende Precompile** unter `0x0000000000000000000000000000000000000901` kodieren, das dafür ausgelegt ist, ihn an einen QoreChain Native-Contract auf der **QoreChain Native**-Laufzeitumgebung (Wasm) weiterzuleiten, sowie eine `multivm-rollup`-Scaffold-Vorlage, die sie verdrahtet. Das Tooling deckt ausschließlich **EVM → QoreChain Native** ab; SVM ist eine eigene Laufzeitumgebung und nicht Teil des Precompiles.

:::caution Auf den Live-Netzwerken noch nicht nutzbar
Das VM-übergreifende Precompile ist auf keinem der beiden Netzwerke **aktiviert**: Die Liste der aktiven statischen Precompiles des EVM-Moduls ist im Mainnet leer und enthält im Testnet nur `0x…0A01`, `0x…0A02` und `0x…0C01` (geprüft am 27. Oktober 2026), sodass `0x…0901` auf keiner der beiden Listen steht; `eth_getCode` für `0x…0901` gibt `0x` zurück, und ein Aufruf davon gelingt mit leeren Daten und führt nichts aus. Der QoreChain Native-Contract-Upload ist ebenfalls auf beiden Netzwerken geschlossen, und die SVM-Transaktionsspur ist netzwerkweit deaktiviert. Solange das Precompile nicht aktiviert und QoreChain Native-Uploads nicht wieder geöffnet sind, gibt es nichts aufzurufen. Diese Seite dokumentiert das Tooling, damit Sie sich vorbereiten können; bauen Sie darauf keine Produktionsabläufe auf. Siehe [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note Der Encoder entspricht seit 0.6.0 dem Layout der Chain
`encodeCrossVmCalldata` in `@qorechain/rdk` **0.5.0 und früher** (und der Starter `CrossVmCaller.sol` in der `multivm-rollup`-Vorlage dieser Releases) verwendete `executeCrossVMCall(string,bytes)`, einen anderen Funktionsselektor als den, den der Node dekodiert; kein damit kodierter Aufruf hätte das Precompile erreichen können, selbst in einem Netzwerk, das es aktiviert hätte. **0.6.0** kodiert `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (Selektor `0x3c11078c`), also das, was der Node dekodiert (4-Byte-Selektor, danach die ABI-kodierten Argumente; `targetVM` 1 ist QoreChain Native, das einzige unterstützte Ziel), und die Calldata des Helfers durchläuft laut den Release-Notes den Round-Trip über den eigenen Dekoder der Chain. Die ABI kann sich vor der Aktivierung noch ändern.
:::

:::note
Seit RDK v0.4.2 lautet der VM-Options-Bezeichner der Wasm-Laufzeitumgebung **`native`** (QoreChain Native); `cosmwasm` bleibt als Legacy-Alias weiterhin gültig, und beide werden auf Protokollebene auf `cosmwasm` abgebildet.
:::

## Die Precompile-Adresse

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Kodieren eines VM-übergreifenden Aufrufs

Kodieren Sie das Layout des Nodes direkt. `payload` ist die Execute-Nachricht des Contracts als UTF-8-JSON-Bytes (dargestellt mit viem):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata` aus `@qorechain/rdk` 0.6.0 und neuer (aktuell ist 0.7.0) erstellt dieselbe Calldata für Sie:

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

`isCrossVmPrecompileActive(restBase)` liest den EVM-Parameter `active_static_precompiles` über REST und antwortet nur dann mit `active: true`, wenn die Adresse des Precompiles aufgeführt ist. Das ist die einzige verlässliche Prüfung, und sie muss off-chain erfolgen: Das Precompile gibt die Rohantwort des Ziels zurück, sodass eine leere Antwort ein inaktives Precompile nicht von einem echten Aufruf eines Contracts unterscheiden kann, der nichts zurückgibt, und ein Precompile hat keinen Bytecode, ob aktiv oder nicht. Selbst wenn es `active: true` meldet, dokumentiert das Paket, dass ein Aufruf ab Chain v3.2.3 nur die Ziele erreicht, die die Governance auf die Allowlist gesetzt hat (der VM-übergreifende Parameter `bridge_allowed_targets`, jeder Eintrag `<vm>:<contract>`), und dass EVM-zu-EVM abgelehnt wird.

### Chain v3.2.5: Allowlist, Antwortformat und Ablehnungen (jetzt im Testnet, im Mainnet nach dem Upgrade) {#chain-v325}

Chain v3.2.5 ändert das Verhalten der Bridge. Das Testnet läuft damit; **das Mainnet (v3.2.4) erst, wenn Governance-Vorschlag 14 angewendet ist**, und die Beschreibungen an anderer Stelle auf dieser Seite, nach denen das Precompile die Rohantwort des Ziels zurückgibt, beschreiben das heutige Mainnet.

* **Eine Allowlist-Route.** `GET /qorechain/crossvm/v1/params` liefert die Bridge-Parameter, einschließlich der Allowlist der Ziele. Im Testnet ist die Allowlist leer (geprüft am 27. Oktober 2026), daher ist noch kein Ziel erlaubt.
* **Ein festes Antwortformat.** Das Precompile gibt `abi.encode(bytes)` zurück, sodass eine Antwort immer mindestens 64 Bytes lang ist und sich eine leere Antwort von einer fehlenden unterscheiden lässt; dekodieren Sie sie mit `abi.decode(ret, (bytes))`.
* **Ablehnungen tragen einen Grund.** Lehnt die Bridge einen Aufruf ab, bricht sie mit `Error(string)` ab (Revert), was ein Contract lesen und weitergeben kann.
* **Das Precompile ist weiterhin nicht aktiv.** `0x...0901` steht in keinem der beiden Netzwerke in der Liste der aktiven Precompiles, daher ist nichts davon bisher Ende-zu-Ende gelaufen.

`@qorechain/rdk` 0.7.0 hat dafür Helfer (gegen von Solidity erzeugte Kodierungen geprüft): `getCrossVmParams` (die Allowlist), `crossVmTargetReady` (Precompile aktiv, Bridge aktiviert und das Ziel auf der Allowlist, mit dem blockierenden Grund, wenn nicht), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) und `decodeRevertReason` (`Error(string)`).

## Die Solidity-Seite

Aus einem EVM-Contract rufen Sie die Precompile-Adresse mit dem kodierten Aufruf auf:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data = abi.encodeWithSignature(
        "executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_
    );
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Da das Precompile inaktiv ist, gibt ein einfacher `.call` darauf **Erfolg mit leeren Daten zurück und bewirkt nichts**; das `ok`-Flag sagt Ihnen nicht, ob der Aufruf eine Wirkung hatte. Der verlässliche Schutz im Contract ist ein Ziel, das stets eine nicht leere Bestätigung zurückgibt, mit einem `require(ret.length > 0)` nach dem Aufruf, sodass eine leere Antwort als Fehler behandelt wird; die `multivm-rollup`-Vorlage tut dies (ab 0.6.0).

## Ein Multi-VM-Rollup per Scaffold erstellen

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Die `multivm-rollup`-Vorlage enthält `src/crossvm-call.ts` (es prüft, ob das Precompile aktiv ist, und gibt dann die Calldata aus) und einen `contracts/CrossVmCaller.sol`, der `executeCrossVMCall(uint8,string,bytes)` aufruft und eine nicht leere Antwort des Ziels verlangt. Ab 0.7.0 dekodiert der Contract das Ergebnis `abi.encode(bytes)`, verlangt die 64-Byte-Untergrenze, die ein aktives Precompile zurückgibt, und reicht den Ablehnungsgrund der Chain durch. Er lässt einen Aufruf nicht funktionieren, solange das Precompile inaktiv ist. Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für alle Scaffolder-Vorlagen.
