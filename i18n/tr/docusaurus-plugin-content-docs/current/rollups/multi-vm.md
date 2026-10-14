---
slug: /rollups/multi-vm
title: Çoklu-VM (VM'ler arası çağrılar)
sidebar_label: Çoklu-VM
sidebar_position: 8
---

# Çoklu-VM (VM'ler arası çağrılar)

RDK, bir EVM sözleşmesinden `0x0000000000000000000000000000000000000901` adresindeki **VM'ler arası ön derlemeye (precompile)** yapılan bir çağrıyı kodlayan TypeScript yardımcılarını içerir; bu ön derleme, çağrıyı **QoreChain Native** (Wasm) çalışma zamanındaki bir CosmWasm sözleşmesine yönlendirmek üzere tasarlanmıştır. Bunları birbirine bağlayan bir `multivm-rollup` iskelet şablonu da vardır. Araçlar yalnızca **EVM → QoreChain Native** kapsamını içerir; SVM ayrı bir çalışma zamanıdır ve ön derlemenin bir parçası değildir.

:::caution Canlı ağlarda henüz kullanılamaz
VM'ler arası ön derleme hiçbir ağda **etkinleştirilmemiştir**: EVM modülünün etkin statik ön derlemeler listesi ana ağda ve test ağında boştur; bu nedenle `0x…0901` adresine yapılan bir çağrı boş veri döndürür ve hiçbir şey yürütmez. CosmWasm sözleşme yükleme de her iki ağda kapalıdır ve SVM işlem şeridi ağ genelinde devre dışıdır. Ön derleme etkinleştirilip CosmWasm yüklemeleri yeniden açılana kadar çağrılacak bir şey yoktur. Bu sayfa, hazırlanabilmeniz için araçları belgeler; üzerine üretim akışları kurmayın. Bkz. [EVM Ön Derlemeleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
:::

:::note
RDK v0.4.2 itibarıyla Wasm çalışma zamanının VM seçenek tanımlayıcısı **`native`**'dir (QoreChain Native); `cosmwasm` kabul edilen eski bir takma ad olarak kalır ve her ikisi de ağ üzerinde `cosmwasm` olarak eşlenir. Ön derleme ABI işlevi `executeCrossVMCall(string,bytes)`'tır.
:::

## Ön derleme adresi

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## VM'ler arası çağrı kodlama

`encodeCrossVmCalldata`, `executeCrossVMCall(string contract, bytes msg)` için calldata oluşturur. `msg`, sözleşmenin yürütme (execute) mesajıdır; UTF-8 JSON dizesi veya ham baytlar olarak verilir.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## Solidity tarafı

Bir EVM sözleşmesinden, kodlanmış çağrı ile ön derleme adresini çağırırsınız:

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

Ön derleme etkin olmadığından, ona yapılan düz bir `.call` boş veriyle başarı döndürür; bunu bugün test ediyorsanız yalnızca `ok` bayrağına güvenmek yerine dönen uzunluğu kontrol edin.

## Çoklu-VM rollup iskeleti oluşturma

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Şablon, başlangıç noktası olarak bir `contracts/CrossVmCaller.sol` içerir; ona güvenmeden önce yukarıdaki ABI ile karşılaştırın. Tüm iskelet oluşturucu şablonları için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
