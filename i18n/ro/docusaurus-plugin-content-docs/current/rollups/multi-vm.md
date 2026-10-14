---
slug: /rollups/multi-vm
title: Multi-VM (apeluri cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (apeluri cross-VM)

RDK include helperi TypeScript care codifică un apel dintr-un contract EVM către **precompilul cross-VM** de la adresa `0x0000000000000000000000000000000000000901`, conceput să îl direcționeze către un contract CosmWasm de pe runtime-ul **QoreChain Native** (Wasm), precum și un șablon de schelet `multivm-rollup` care le conectează. Uneltele acoperă doar **EVM → QoreChain Native**; SVM este un runtime separat și nu face parte din precompil.

:::caution Încă nu poate fi folosit în rețelele active
Precompilul cross-VM **nu este activat** în niciuna dintre rețele: lista de precompilări statice active a modulului EVM este goală pe mainnet și pe testnet, deci un apel către `0x…0901` întoarce date goale și nu execută nimic. Încărcarea de contracte CosmWasm este, de asemenea, închisă în ambele rețele, iar banda de tranzacții SVM este dezactivată la nivelul întregii rețele. Până când precompilul este activat și încărcările CosmWasm sunt redeschise, nu există nimic de apelat. Această pagină documentează uneltele ca să te poți pregăti; nu construi fluxuri de producție pe ele. Vezi [Precompilări EVM: starea rețelei](/developer-guide/evm-precompiles#network-status).
:::

:::note
Începând cu RDK v0.4.2, identificatorul opțiunii de VM pentru runtime-ul Wasm este **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy acceptat, iar ambele se mapează la `cosmwasm` la nivel de rețea. Funcția ABI a precompilului este `executeCrossVMCall(string,bytes)`.
:::

## Adresa precompilului

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Codificarea unui apel cross-VM

`encodeCrossVmCalldata` construiește calldata pentru `executeCrossVMCall(string contract, bytes msg)`. `msg` este mesajul de execuție al contractului, ca șir JSON UTF-8 sau ca octeți bruți.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## Partea de Solidity

Dintr-un contract EVM apelezi adresa precompilului cu apelul codificat:

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

Deoarece precompilul este inactiv, un simplu `.call` către el întoarce succes cu date goale; dacă îl testezi astăzi, verifică lungimea returnată în loc să te bazezi doar pe flag-ul `ok`.

## Generarea unui rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Șablonul include un punct de plecare `contracts/CrossVmCaller.sol`; compară-l cu ABI-ul de mai sus înainte de a te baza pe el. Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru toate șabloanele generatorului de schelet.
