---
slug: /rollups/multi-vm
title: Multi-VM (VM-übergreifende Aufrufe)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (VM-übergreifende Aufrufe)

Das RDK enthält TypeScript-Helfer, die einen Aufruf aus einem EVM-Contract in das **VM-übergreifende Precompile** unter `0x0000000000000000000000000000000000000901` kodieren, das dafür ausgelegt ist, ihn an einen CosmWasm-Contract auf der **QoreChain Native**-Laufzeitumgebung (Wasm) weiterzuleiten, sowie eine `multivm-rollup`-Scaffold-Vorlage, die sie verdrahtet. Das Tooling deckt ausschließlich **EVM → QoreChain Native** ab; SVM ist eine eigene Laufzeitumgebung und nicht Teil des Precompiles.

:::caution Auf den Live-Netzwerken noch nicht nutzbar
Das VM-übergreifende Precompile ist auf keinem der beiden Netzwerke **aktiviert**: Die Liste der aktiven statischen Precompiles des EVM-Moduls ist im Mainnet und im Testnet leer, `eth_getCode` für `0x…0901` gibt `0x` zurück, und ein Aufruf davon gelingt mit leeren Daten und führt nichts aus. Der CosmWasm-Contract-Upload ist ebenfalls auf beiden Netzwerken geschlossen, und die SVM-Transaktionsspur ist netzwerkweit deaktiviert. Solange das Precompile nicht aktiviert und CosmWasm-Uploads nicht wieder geöffnet sind, gibt es nichts aufzurufen. Diese Seite dokumentiert das Tooling, damit Sie sich vorbereiten können; bauen Sie darauf keine Produktionsabläufe auf. Siehe [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::caution Der Encoder in 0.5.0 entspricht nicht dem Layout der Chain
`encodeCrossVmCalldata` in `@qorechain/rdk` 0.5.0 (und der Starter `CrossVmCaller.sol` in der `multivm-rollup`-Vorlage) verwenden die Funktion `executeCrossVMCall(string,bytes)`. Der Node dekodiert `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (4-Byte-Selektor, danach die ABI-kodierten Argumente; `targetVM` 1 ist CosmWasm, das einzige unterstützte Ziel), und die ABI kann sich vor der Aktivierung noch ändern. Calldata aus dem Helfer lässt sich daher auf dem Node auch dann nicht dekodieren, wenn das Precompile existiert. Die folgenden Abschnitte zeigen das Layout des Nodes.
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
    1, // CosmWasm
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata({ contract, msg })` aus `@qorechain/rdk` erstellt stattdessen die Form `(string,bytes)`, die der Node nicht liest (siehe den obigen Warnhinweis).

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

Da das Precompile inaktiv ist, gibt ein einfacher `.call` darauf **Erfolg mit leeren Daten zurück und bewirkt nichts**; das `ok`-Flag sagt Ihnen nicht, ob der Aufruf eine Wirkung hatte. Wenn Sie dies heute testen, prüfen Sie die Wirkung auf den Ziel-Contract.

## Ein Multi-VM-Rollup per Scaffold erstellen

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Die Vorlage enthält einen Ausgangspunkt `contracts/CrossVmCaller.sol`; vergleichen Sie ihn mit dem oben gezeigten Layout des Nodes, bevor Sie sich darauf verlassen. Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für alle Scaffolder-Vorlagen.
