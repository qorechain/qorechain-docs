---
slug: /rollups/multi-vm
title: Multi-VM (VM-übergreifende Aufrufe)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (VM-übergreifende Aufrufe)

Ein Multi-VM-Rollup betreibt eine EVM-Ausführungsschicht, die über ein dediziertes
**VM-übergreifendes Precompile** in CosmWasm-Contracts aufrufen kann. Das RDK liefert
die TypeScript-Werkzeuge, um diese Aufrufe zu kodieren, sowie eine Scaffold-Vorlage als Ausgangspunkt.

> Diese Werkzeuge decken ausschließlich **EVM → CosmWasm** ab. SVM ist eine eigene Laufzeitumgebung und
> nicht Teil des VM-übergreifenden Precompiles.

## Das Precompile

Das VM-übergreifende Precompile ist unter einer festen Adresse verfügbar:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## Kodieren eines VM-übergreifenden Aufrufs

`encodeCrossVmCalldata` erstellt die Calldata, die Ihr EVM-Contract an das
Precompile sendet, um einen CosmWasm-Contract aufzurufen. `functionSelector` berechnet den 4-Byte-
Selektor für eine Solidity-Funktionssignatur.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Die Solidity-Seite

Aus einem EVM-Contract rufen Sie die Precompile-Adresse mit der kodierten Calldata auf.
Die Vorlage `multivm-rollup` enthält ein `contracts/CrossVmCaller.sol`-Snippet
in dieser Art:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## Ein Multi-VM-Rollup gerüsten

Eine neue Vorlage, `multivm-rollup`, gerüstet ein EVM-Rollup, das für den Aufruf von CosmWasm verdrahtet ist,
einschließlich des `CrossVmCaller.sol`-Snippets:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) für alle Scaffolder-
Vorlagen.
