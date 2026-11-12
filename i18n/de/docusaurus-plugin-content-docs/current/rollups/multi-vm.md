---
slug: /rollups/multi-vm
title: Multi-VM (VM-übergreifende Aufrufe)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (VM-übergreifende Aufrufe)

Das RDK enthält TypeScript-Helfer, die einen Aufruf aus einem EVM-Contract in das **VM-übergreifende Precompile** unter `0x0000000000000000000000000000000000000901` kodieren, das dafür ausgelegt ist, ihn an einen QoreChain Native-Contract auf der **QoreChain Native**-Laufzeitumgebung (Wasm) weiterzuleiten, sowie eine `multivm-rollup`-Scaffold-Vorlage, die sie verdrahtet. Das Tooling deckt ausschließlich **EVM → QoreChain Native** ab; SVM ist eine eigene Laufzeitumgebung und nicht Teil des Precompiles.

:::caution Auf den Live-Netzwerken noch nicht nutzbar
Das VM-übergreifende Precompile ist **im Mainnet nicht aktiviert**: Die Liste der aktiven statischen Precompiles des EVM-Moduls ist dort leer (geprüft am 4. November 2026). Im Testnet enthielt die Liste bei der Prüfung am 27. Oktober 2026 nur `0x…0A01`, `0x…0A02` und `0x…0C01`, seit dem 4. November auch `0x…0901`; am 7. November 2026 wurde sie erneut gelesen und führt weiterhin alle vier auf (siehe den Hinweis unter [Chain v3.2.5](#chain-v325)). Am 7. November 2026, nachdem das Testnet Chain v3.2.7 angewendet hatte, wurde ein schreibgeschützter `eth_call` an `0x…0901` im Testnet getestet: Ein Ziel auf der Allowlist erreichte seinen Contract, ein Ziel außerhalb davon wurde abgelehnt (siehe [Im Testnet getestet](#tested-testnet)). Im Mainnet gibt `eth_getCode` für `0x…0901` `0x` zurück, und ein Aufruf davon gelingt mit leeren Daten und führt nichts aus (ein `eth_call` darauf lieferte am 4. November 2026 leere Daten). Der QoreChain Native-Contract-Upload ist ebenfalls auf beiden Netzwerken geschlossen, und die SVM-Transaktionsspur ist netzwerkweit deaktiviert. Im Mainnet gibt es, solange das Precompile nicht aktiviert und QoreChain Native-Uploads nicht wieder geöffnet sind, nichts aufzurufen; im Testnet ist das Precompile mit einer Allowlist aktiv und wurde mit `eth_call` getestet. Diese Seite dokumentiert das Tooling, damit Sie sich vorbereiten können; bauen Sie darauf keine Produktionsabläufe auf. Siehe [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
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

`encodeCrossVmCalldata` aus `@qorechain/rdk` 0.6.0 und neuer (aktuell ist 0.8.0) erstellt dieselbe Calldata für Sie:

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

:::note Das Testnet hat sich nach dem 30. Oktober 2026 geändert
Am 4. November 2026 enthielt die Liste der aktiven Precompiles des Testnets (`active_static_precompiles` in den EVM-Parametern) auch `0x…0901`, und `GET /qorechain/crossvm/v1/params` listete im Testnet drei CosmWasm-Ziele in `bridge_allowed_targets`. Das Mainnet war an diesem Tag unverändert: leere Liste aktiver Precompiles, leere Allowlist, und ein Aufruf von `0x…0901` per `eth_call` lieferte leere Daten. Die Testnet-Liste wurde am 7. November 2026 erneut gelesen und enthält weiterhin `0x…0901`. Aussagen weiter unten, nach denen das Precompile oder die Allowlist im Testnet inaktiv oder leer ist, beschreiben den 27. bis 30. Oktober 2026; das aktuelle Verhalten des Testnets steht unter [Im Testnet getestet](#tested-testnet).
:::

### Chain v3.2.5: Allowlist, Antwortformat und Ablehnungen (beide Netzwerke) {#chain-v325}

Chain v3.2.5 ändert das Verhalten der Bridge. Das Mainnet läuft seit dem 29. Oktober 2026 damit (Governance-Vorschlag 14, Höhe 3.906.833) und das Testnet seit dem 26. Oktober; das Mainnet läuft jetzt mit v3.2.6 und das Testnet mit v3.2.8. Da das Precompile im Mainnet nicht aktiv ist, ist das Antwortformat unten das Verhalten des Releases und wurde dort nicht erprobt; das Ablehnungsformat wurde am 7. November 2026 im Testnet gesehen (siehe [Im Testnet getestet](#tested-testnet)). Wo diese Seite sagt, das Precompile gebe die Rohantwort des Ziels zurück, beschreibt das Releases vor v3.2.5.

* **Eine Allowlist-Route.** `GET /qorechain/crossvm/v1/params` liefert die Bridge-Parameter, einschließlich der Allowlist der Ziele. Im Mainnet ist die Allowlist leer (geprüft am 4. November 2026), daher ist noch kein Ziel erlaubt; im Testnet war sie am 30. Oktober leer (siehe den Hinweis oben).
* **Ein festes Antwortformat.** Das Precompile gibt `abi.encode(bytes)` zurück, sodass eine Antwort immer mindestens 64 Bytes lang ist und sich eine leere Antwort von einer fehlenden unterscheiden lässt; dekodieren Sie sie mit `abi.decode(ret, (bytes))`.
* **Ablehnungen tragen einen Grund.** Lehnt die Bridge einen Aufruf ab, bricht sie mit `Error(string)` ab (Revert), was ein Contract lesen und weitergeben kann.
* **Im Testnet aktiv, im Mainnet nicht.** `0x...0901` steht nicht in der Liste der aktiven Precompiles des Mainnets; die Liste des Testnets enthält es (gelesen am 7. November 2026), und die Ablehnung sowie das Allowlist-Verhalten wurden dort an diesem Tag getestet. Das Mainnet hält Cross-VM-Aufrufe aus, bis es eine separate Governance-Entscheidung gibt, auch nach einem v3.2.7-Upgrade.

### Im Testnet getestet {#tested-testnet}

Das Testnet läuft seit dem 12. November 2026 mit Chain v3.2.8 (Höhe 9.929.500). Am 7. November 2026 wurden zwei schreibgeschützte `eth_call`-Anfragen an `0x…0901` gesendet, mit den Calldata von `executeCrossVMCall(uint8,string,bytes)` (Ziel-VM `1`, Payload `{}`):

| Ziel | Ergebnis |
|---|---|
| Eine CosmWasm-Adresse, die nicht in `bridge_allowed_targets` steht | Revert mit `cross-VM bridge call refused: target cosmwasm:<address> is not allowlisted` |
| Ein CosmWasm-Contract aus `bridge_allowed_targets` | Der Aufruf erreichte den Contract, der die leere Payload ablehnte (`Error parsing into type cw20::msg::Cw20ExecuteMsg`), die Bridge hat ihn also zugestellt; es wurde keine Nachricht gesendet, die der Contract akzeptiert |

Das zeigt die Allowlist und den Revert-Grund. Es zeigt keinen erfolgreichen zustandsändernden Aufruf, denn `eth_call` ändert nichts, und die Payload war bewusst keine gültige Nachricht. Das Precompile nimmt drei Argumente; die Form mit zwei Argumenten von 0.5.0 und früher erreicht es nicht. Das Mainnet hat dieses Verhalten nicht: Dort ist das Precompile aus.

`@qorechain/rdk` 0.7.0 und neuer haben dafür Helfer (gegen von Solidity erzeugte Kodierungen geprüft): `getCrossVmParams` (die Allowlist), `crossVmTargetReady` (Precompile aktiv, Bridge aktiviert und das Ziel auf der Allowlist, mit dem blockierenden Grund, wenn nicht), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) und `decodeRevertReason` (`Error(string)`).

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

Da das Precompile im Mainnet inaktiv ist, gibt ein einfacher `.call` dort darauf **Erfolg mit leeren Daten zurück und bewirkt nichts**; das `ok`-Flag sagt Ihnen nicht, ob der Aufruf eine Wirkung hatte. Der verlässliche Schutz im Contract ist ein Ziel, das stets eine nicht leere Bestätigung zurückgibt, mit einem `require(ret.length > 0)` nach dem Aufruf, sodass eine leere Antwort als Fehler behandelt wird; die `multivm-rollup`-Vorlage tut dies (ab 0.6.0).

## Ein Multi-VM-Rollup per Scaffold erstellen

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Die `multivm-rollup`-Vorlage enthält `src/crossvm-call.ts` (es prüft, ob das Precompile aktiv ist, und gibt dann die Calldata aus) und einen `contracts/CrossVmCaller.sol`, der `executeCrossVMCall(uint8,string,bytes)` aufruft und eine nicht leere Antwort des Ziels verlangt. Ab 0.7.0 dekodiert der Contract das Ergebnis `abi.encode(bytes)`, verlangt die 64-Byte-Untergrenze, die ein aktives Precompile zurückgibt, und reicht den Ablehnungsgrund der Chain durch. Er lässt einen Aufruf nicht funktionieren, solange das Precompile inaktiv ist. Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für alle Scaffolder-Vorlagen.
