---
slug: /rollups/multi-vm
title: Multi-VM (apeluri cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (apeluri cross-VM)

Un rollup multi-VM rulează un strat de execuție EVM care poate apela contracte
CosmWasm pe runtime-ul **QoreChain Native** (Wasm) printr-un **precompil
cross-VM** dedicat. RDK include uneltele TypeScript pentru a codifica acele
apeluri și un șablon de schelet de la care să pornești.

> Aceste unelte acoperă doar **EVM → QoreChain Native** (contracte CosmWasm).
> SVM este un runtime separat și nu face parte din precompilul cross-VM.

:::note
Începând cu RDK v0.4.2, identificatorul opțiunii de VM pentru runtime-ul Wasm
este **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy
acceptat, iar ambele se mapează la `cosmwasm` la nivel de rețea — lanțul,
exploratorul și ABI-ul precompilului cross-VM (`executeCrossVMCall`) rămân
neschimbate.
:::

## Precompilul

Precompilul cross-VM este expus la o adresă fixă:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## Codificarea unui apel cross-VM

`encodeCrossVmCalldata` construiește calldata pe care contractul tău EVM o trimite
către precompil pentru a invoca un contract CosmWasm. `functionSelector` calculează
selectorul de 4 octeți pentru o semnătură de funcție Solidity.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Partea de Solidity

Dintr-un contract EVM apelezi adresa precompilului cu calldata codificată.
Șablonul `multivm-rollup` include un fragment `contracts/CrossVmCaller.sol`
de genul acesta:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## Generarea unui rollup multi-VM

Un șablon nou, `multivm-rollup`, generează un rollup EVM cablat să apeleze CosmWasm,
inclusiv fragmentul `CrossVmCaller.sol`:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru toate
șabloanele generatorului de schelet.
