---
slug: /rollups/multi-vm
title: Multi-VM (VM-übergreifende Aufrufe)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (VM-übergreifende Aufrufe)

Das RDK enthält TypeScript-Helfer, die einen Aufruf aus einem EVM-Contract in das **VM-übergreifende Precompile** unter `0x0000000000000000000000000000000000000901` kodieren, das dafür ausgelegt ist, ihn an einen CosmWasm-Contract auf der **QoreChain Native**-Laufzeitumgebung (Wasm) weiterzuleiten, sowie eine `multivm-rollup`-Scaffold-Vorlage, die sie verdrahtet. Das Tooling deckt ausschließlich **EVM → QoreChain Native** ab; SVM ist eine eigene Laufzeitumgebung und nicht Teil des Precompiles.

:::caution Auf den Live-Netzwerken noch nicht nutzbar
Das VM-übergreifende Precompile ist auf keinem der beiden Netzwerke **aktiviert**: Die Liste der aktiven statischen Precompiles des EVM-Moduls ist im Mainnet und im Testnet leer, sodass ein Aufruf von `0x…0901` leere Daten zurückgibt und nichts ausführt. Der CosmWasm-Contract-Upload ist ebenfalls auf beiden Netzwerken geschlossen, und die SVM-Transaktionsspur ist netzwerkweit deaktiviert. Solange das Precompile nicht aktiviert und CosmWasm-Uploads nicht wieder geöffnet sind, gibt es nichts aufzurufen. Diese Seite dokumentiert das Tooling, damit Sie sich vorbereiten können; bauen Sie darauf keine Produktionsabläufe auf. Siehe [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note
Seit RDK v0.4.2 lautet der VM-Options-Bezeichner der Wasm-Laufzeitumgebung **`native`** (QoreChain Native); `cosmwasm` bleibt als Legacy-Alias weiterhin gültig, und beide werden auf Protokollebene auf `cosmwasm` abgebildet. Die ABI-Funktion des Precompiles lautet `executeCrossVMCall(string,bytes)`.
:::

## Die Precompile-Adresse

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Kodieren eines VM-übergreifenden Aufrufs

`encodeCrossVmCalldata` erstellt die Calldata für `executeCrossVMCall(string contract, bytes msg)`. `msg` ist die Execute-Nachricht des Contracts als UTF-8-JSON-String oder als Rohbytes.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## Die Solidity-Seite

Aus einem EVM-Contract rufen Sie die Precompile-Adresse mit dem kodierten Aufruf auf:

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

Da das Precompile inaktiv ist, gibt ein einfacher `.call` darauf Erfolg mit leeren Daten zurück; prüfen Sie beim heutigen Testen die Länge der Rückgabe, statt sich allein auf das `ok`-Flag zu verlassen.

## Ein Multi-VM-Rollup per Scaffold erstellen

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Die Vorlage enthält einen Ausgangspunkt `contracts/CrossVmCaller.sol`; vergleichen Sie ihn mit der obigen ABI, bevor Sie sich darauf verlassen. Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für alle Scaffolder-Vorlagen.
