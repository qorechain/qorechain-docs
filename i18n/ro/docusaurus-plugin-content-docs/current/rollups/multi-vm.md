---
slug: /rollups/multi-vm
title: Multi-VM (apeluri cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (apeluri cross-VM)

RDK include helperi TypeScript care codifică un apel dintr-un contract EVM către **precompilul cross-VM** de la adresa `0x0000000000000000000000000000000000000901`, conceput să îl direcționeze către un contract QoreChain Native de pe runtime-ul **QoreChain Native** (Wasm), precum și un șablon de schelet `multivm-rollup` care le conectează. Uneltele acoperă doar **EVM → QoreChain Native**; SVM este un runtime separat și nu face parte din precompil.

:::caution Încă nu poate fi folosit în rețelele active
Precompilul cross-VM **nu este activat** în niciuna dintre rețele: lista de precompilări statice active a modulului EVM este goală pe mainnet, iar pe testnet conține doar `0x…0A01`, `0x…0A02` și `0x…0C01` (verificat la 27 octombrie 2026), deci `0x…0901` nu se află pe nicio listă; `eth_getCode` pentru `0x…0901` întoarce `0x`, iar un apel către el reușește cu date goale și nu execută nimic. Încărcarea de contracte QoreChain Native este, de asemenea, închisă în ambele rețele, iar banda de tranzacții SVM este dezactivată la nivelul întregii rețele. Până când precompilul este activat și încărcările QoreChain Native sunt redeschise, nu există nimic de apelat. Această pagină documentează uneltele ca să te poți pregăti; nu construi fluxuri de producție pe ele. Vezi [Precompilări EVM: starea rețelei](/developer-guide/evm-precompiles#network-status).
:::

:::note Encoderul corespunde structurii lanțului începând cu 0.6.0
`encodeCrossVmCalldata` din `@qorechain/rdk` **0.5.0 și versiunile anterioare** (și starterul `CrossVmCaller.sol` din șablonul `multivm-rollup` al acelor versiuni) foloseau `executeCrossVMCall(string,bytes)`, un selector de funcție diferit de cel pe care îl decodifică nodul, așa că niciun apel codificat de ele nu ar fi putut ajunge la precompil nici măcar pe o rețea care l-ar fi activat. **0.6.0** codifică `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector `0x3c11078c`), exact ceea ce decodifică nodul (selector de 4 octeți, apoi argumentele codificate ABI; `targetVM` 1 este QoreChain Native, singura țintă acceptată), iar potrivit notelor de versiune, calldata produs de helper trece prin decodorul propriu al lanțului și se reconstituie corect (round-trip). ABI-ul se mai poate schimba înainte de activare.
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
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata` din `@qorechain/rdk` 0.6.0 și ulterior (0.7.0 este versiunea curentă) construiește același calldata pentru tine:

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

`isCrossVmPrecompileActive(restBase)` citește parametrul EVM `active_static_precompiles` prin REST și răspunde `active: true` doar când adresa precompilului este listată. Aceasta este singura verificare de încredere și trebuie făcută în afara lanțului: precompilul întoarce răspunsul brut al țintei, deci un răspuns gol nu poate deosebi un precompil inactiv de un apel real către un contract care nu întoarce nimic, iar un precompil nu are bytecode indiferent dacă este activ sau nu. Chiar și când raportează `active: true`, pachetul documentează că, începând cu lanțul v3.2.3, un apel ajunge doar la țintele pe care guvernanța le-a pus pe lista permisă (parametrul cross-VM `bridge_allowed_targets`, fiecare intrare având forma `<vm>:<contract>`) și că EVM-către-EVM este refuzat.

### Lanțul v3.2.5: lista permisă, formatul răspunsului și refuzurile (ambele rețele) {#chain-v325}

Lanțul v3.2.5 schimbă comportamentul bridge-ului. Mainnet-ul îl rulează din 29 octombrie 2026 (propunerea de guvernanță 14, înălțimea 3.906.833), iar testnet-ul din 26 octombrie. Deoarece precompilul nu este activ pe niciuna dintre rețele, formatul răspunsului și formatul refuzului de mai jos sunt comportamentul versiunii și nu au fost exersate printr-un apel live; oriunde această pagină spune că precompilul întoarce răspunsul brut al țintei, aceasta descrie versiunile dinaintea v3.2.5.

* **O rută pentru lista permisă.** `GET /qorechain/crossvm/v1/params` servește parametrii bridge-ului, inclusiv lista permisă a țintelor. Pe ambele rețele lista permisă este goală (mainnet și testnet verificate la 30 octombrie 2026), deci nicio țintă nu este încă permisă.
* **Un format fix al răspunsului.** Precompilul întoarce `abi.encode(bytes)`, deci un răspuns are mereu cel puțin 64 de octeți și un răspuns gol poate fi deosebit de unul lipsă; decodează-l cu `abi.decode(ret, (bytes))`.
* **Refuzurile au un motiv.** Când bridge-ul refuză un apel, face revert cu `Error(string)`, pe care un contract îl poate citi și transmite mai departe.
* **Precompilul tot nu este activ.** `0x...0901` nu se află în lista precompilurilor active pe niciuna dintre rețele, deci nimic din acestea nu a rulat de la un capăt la altul.

`@qorechain/rdk` 0.7.0 are helperi pentru acestea (verificați față de codificările produse de Solidity): `getCrossVmParams` (lista permisă), `crossVmTargetReady` (precompil activ, bridge activat și ținta pe lista permisă, cu motivul care blochează când nu este), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) și `decodeRevertReason` (`Error(string)`).

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

Deoarece precompilul este inactiv, un simplu `.call` către el întoarce **succes cu date goale și nu face nimic**; flag-ul `ok` nu îți spune dacă apelul a avut efect. Garda de încredere din interiorul contractului este o țintă care întoarce mereu o confirmare nevidă, cu un `require(ret.length > 0)` după apel, astfel încât un răspuns gol să fie tratat ca eșec; șablonul `multivm-rollup` face acest lucru (0.6.0 și ulterior).

## Generarea unui rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Șablonul `multivm-rollup` include `src/crossvm-call.ts` (verifică dacă precompilul este activ, apoi afișează calldata) și un `contracts/CrossVmCaller.sol` care apelează `executeCrossVMCall(uint8,string,bytes)` și cere un răspuns nevid de la țintă. De la 0.7.0, contractul decodează rezultatul `abi.encode(bytes)`, cere minimul de 64 de octeți pe care îl întoarce un precompil activ și transmite mai departe motivul refuzului lanțului. Nu face ca un apel să funcționeze cât timp precompilul este inactiv. Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru toate șabloanele generatorului de schelet.
