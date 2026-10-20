---
slug: /rollups/multi-vm
title: Çoklu-VM (VM'ler arası çağrılar)
sidebar_label: Çoklu-VM
sidebar_position: 8
---

# Çoklu-VM (VM'ler arası çağrılar)

RDK, bir EVM sözleşmesinden `0x0000000000000000000000000000000000000901` adresindeki **VM'ler arası ön derlemeye (precompile)** yapılan bir çağrıyı kodlayan TypeScript yardımcılarını içerir; bu ön derleme, çağrıyı **QoreChain Native** (Wasm) çalışma zamanındaki bir CosmWasm sözleşmesine yönlendirmek üzere tasarlanmıştır. Bunları birbirine bağlayan bir `multivm-rollup` iskelet şablonu da vardır. Araçlar yalnızca **EVM → QoreChain Native** kapsamını içerir; SVM ayrı bir çalışma zamanıdır ve ön derlemenin bir parçası değildir.

:::caution Canlı ağlarda henüz kullanılamaz
VM'ler arası ön derleme hiçbir ağda **etkinleştirilmemiştir**: EVM modülünün etkin statik ön derlemeler listesi ana ağda ve test ağında boştur, `0x…0901` için `eth_getCode` `0x` döndürür ve ona yapılan bir çağrı boş veriyle başarılı olur ve hiçbir şey yürütmez. CosmWasm sözleşme yükleme de her iki ağda kapalıdır ve SVM işlem şeridi ağ genelinde devre dışıdır. Ön derleme etkinleştirilip CosmWasm yüklemeleri yeniden açılana kadar çağrılacak bir şey yoktur. Bu sayfa, hazırlanabilmeniz için araçları belgeler; üzerine üretim akışları kurmayın. Bkz. [EVM Ön Derlemeleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
:::

:::caution 0.5.0 kodlayıcısı zincirin düzeniyle eşleşmiyor
`@qorechain/rdk` 0.5.0 içindeki `encodeCrossVmCalldata` (ve `multivm-rollup` şablonundaki `CrossVmCaller.sol` başlangıç dosyası) `executeCrossVMCall(string,bytes)` işlevini kullanır. Düğüm ise `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` işlevini çözer (4 baytlık seçici, ardından ABI ile kodlanmış argümanlar; `targetVM` 1 CosmWasm'dır ve desteklenen tek hedeftir) ve ABI etkinleştirmeden önce hâlâ değişebilir. Bu nedenle yardımcıdan gelen calldata, ön derleme var olduktan sonra bile düğümde çözülmez. Aşağıdaki bölümler düğümün düzenini gösterir.
:::

:::note
RDK v0.4.2 itibarıyla Wasm çalışma zamanının VM seçenek tanımlayıcısı **`native`**'dir (QoreChain Native); `cosmwasm` kabul edilen eski bir takma ad olarak kalır ve her ikisi de ağ üzerinde `cosmwasm` olarak eşlenir.
:::

## Ön derleme adresi

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## VM'ler arası çağrı kodlama

Düğümün düzenini doğrudan kodlayın. `payload`, sözleşmenin yürütme (execute) mesajıdır; UTF-8 JSON baytları olarak verilir (viem ile gösterilmiştir):

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

`@qorechain/rdk` içindeki `encodeCrossVmCalldata({ contract, msg })` ise bunun yerine `(string,bytes)` biçimini oluşturur; düğüm bu biçimi okumaz (yukarıdaki uyarıya bakın).

## Solidity tarafı

Bir EVM sözleşmesinden, kodlanmış çağrı ile ön derleme adresini çağırırsınız:

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

Ön derleme etkin olmadığından, ona yapılan düz bir `.call` **boş veriyle başarı döndürür ve hiçbir şey yapmaz**; `ok` bayrağı çağrının etkili olduğunu söylemez. Bunu bugün test ediyorsanız, etkiyi hedef sözleşme üzerinde doğrulayın.

## Çoklu-VM rollup iskeleti oluşturma

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Şablon, başlangıç noktası olarak bir `contracts/CrossVmCaller.sol` içerir; ona güvenmeden önce yukarıdaki düğüm düzeniyle karşılaştırın. Tüm iskelet oluşturucu şablonları için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
