---
slug: /rollups/multi-vm
title: Multi-VM (apeluri cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (apeluri cross-VM)

RDK include helperi TypeScript care codifică un apel dintr-un contract EVM către **precompilul cross-VM** de la adresa `0x0000000000000000000000000000000000000901`, conceput să îl direcționeze către un contract CosmWasm de pe runtime-ul **QoreChain Native** (Wasm), precum și un șablon de schelet `multivm-rollup` care le conectează. Uneltele acoperă doar **EVM → QoreChain Native**; SVM este un runtime separat și nu face parte din precompil.

:::caution Încă nu poate fi folosit în rețelele active
Precompilul cross-VM **nu este activat** în niciuna dintre rețele: lista de precompilări statice active a modulului EVM este goală pe mainnet și pe testnet, `eth_getCode` pentru `0x…0901` întoarce `0x`, iar un apel către el reușește cu date goale și nu execută nimic. Încărcarea de contracte CosmWasm este, de asemenea, închisă în ambele rețele, iar banda de tranzacții SVM este dezactivată la nivelul întregii rețele. Până când precompilul este activat și încărcările CosmWasm sunt redeschise, nu există nimic de apelat. Această pagină documentează uneltele ca să te poți pregăti; nu construi fluxuri de producție pe ele. Vezi [Precompilări EVM: starea rețelei](/developer-guide/evm-precompiles#network-status).
:::

:::caution Encoderul din 0.5.0 nu corespunde structurii lanțului
`encodeCrossVmCalldata` din `@qorechain/rdk` 0.5.0 (și starterul `CrossVmCaller.sol` din șablonul `multivm-rollup`) folosesc funcția `executeCrossVMCall(string,bytes)`. Nodul decodifică `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector de 4 octeți, apoi argumentele codificate ABI; `targetVM` 1 este CosmWasm, singura țintă acceptată), iar ABI-ul se mai poate schimba înainte de activare. Prin urmare, calldata produs de helper nu este decodificat de nod nici măcar după ce precompilul va exista. Secțiunile de mai jos arată structura nodului.
:::

:::note
Începând cu RDK v0.4.2, identificatorul opțiunii de VM pentru runtime-ul Wasm este **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy acceptat, iar ambele se mapează la `cosmwasm` la nivel de rețea.
:::

## Adresa precompilului

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Codificarea unui apel cross-VM

Codifică direct structura nodului. `payload` este mesajul de execuție al contractului, ca octeți JSON UTF-8 (exemplu cu viem):

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

`encodeCrossVmCalldata({ contract, msg })` din `@qorechain/rdk` construiește în schimb forma `(string,bytes)`, pe care nodul nu o citește (vezi avertismentul de mai sus).

## Partea de Solidity

Dintr-un contract EVM apelezi adresa precompilului cu apelul codificat:

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

Deoarece precompilul este inactiv, un simplu `.call` către el întoarce **succes cu date goale și nu face nimic**; flag-ul `ok` nu îți spune dacă apelul a avut efect. Dacă îl testezi astăzi, confirmă efectul asupra contractului țintă.

## Generarea unui rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Șablonul include un punct de plecare `contracts/CrossVmCaller.sol`; compară-l cu structura nodului de mai sus înainte de a te baza pe el. Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru toate șabloanele generatorului de schelet.
