---
slug: /rollups/multi-vm
title: Çoklu-VM (VM'ler arası çağrılar)
sidebar_label: Çoklu-VM
sidebar_position: 8
---

# Çoklu-VM (VM'ler arası çağrılar)

RDK, bir EVM sözleşmesinden `0x0000000000000000000000000000000000000901` adresindeki **VM'ler arası ön derlemeye (precompile)** yapılan bir çağrıyı kodlayan TypeScript yardımcılarını içerir; bu ön derleme, çağrıyı **QoreChain Native** (Wasm) çalışma zamanındaki bir QoreChain Native sözleşmesine yönlendirmek üzere tasarlanmıştır. Bunları birbirine bağlayan bir `multivm-rollup` iskelet şablonu da vardır. Araçlar yalnızca **EVM → QoreChain Native** kapsamını içerir; SVM ayrı bir çalışma zamanıdır ve ön derlemenin bir parçası değildir.

:::caution Canlı ağlarda henüz kullanılamaz
VM'ler arası ön derleme hiçbir ağda **etkinleştirilmemiştir**: EVM modülünün etkin statik ön derlemeler listesi ana ağda boştur, test ağında ise yalnızca `0x…0A01`, `0x…0A02` ve `0x…0C01` içerir (27 Ekim 2026'da kontrol edildi); dolayısıyla `0x…0901` iki listede de yoktur; `0x…0901` için `eth_getCode` `0x` döndürür ve ona yapılan bir çağrı boş veriyle başarılı olur ve hiçbir şey yürütmez. QoreChain Native sözleşme yükleme de her iki ağda kapalıdır ve SVM işlem şeridi ağ genelinde devre dışıdır. Ön derleme etkinleştirilip QoreChain Native yüklemeleri yeniden açılana kadar çağrılacak bir şey yoktur. Bu sayfa, hazırlanabilmeniz için araçları belgeler; üzerine üretim akışları kurmayın. Bkz. [EVM Ön Derlemeleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
:::

:::note Kodlayıcı, 0.6.0'dan beri zincirin düzeniyle eşleşiyor
`@qorechain/rdk` **0.5.0 ve öncesindeki** `encodeCrossVmCalldata` (ve o sürümlerin `multivm-rollup` şablonundaki `CrossVmCaller.sol` başlangıç dosyası) `executeCrossVMCall(string,bytes)` işlevini kullanıyordu; bu, düğümün çözdüğünden farklı bir işlev seçicisidir, dolayısıyla kodladıkları hiçbir çağrı, ön derlemeyi etkinleştirmiş bir ağda bile ona ulaşamazdı. **0.6.0**, düğümün çözdüğü `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` işlevini kodlar (seçici `0x3c11078c`; 4 baytlık seçici, ardından ABI ile kodlanmış argümanlar; `targetVM` 1 QoreChain Native'dır ve desteklenen tek hedeftir) ve yardımcının calldata'sı, sürüm notlarına göre zincirin kendi çözücüsünden geçerek gidiş-dönüşte aynı sonucu verir. ABI etkinleştirmeden önce hâlâ değişebilir.
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
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`@qorechain/rdk` 0.6.0 ve sonrasındaki (güncel olan 0.7.0) `encodeCrossVmCalldata` aynı calldata'yı sizin için oluşturur:

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

`isCrossVmPrecompileActive(restBase)`, EVM parametresi `active_static_precompiles` değerini REST üzerinden okur ve yalnızca ön derlemenin adresi listelenmişse `active: true` yanıtını verir. Bu, tek güvenilir denetimdir ve zincir dışında yapılması gerekir: ön derleme hedefin ham yanıtını döndürür, dolayısıyla boş bir yanıt, etkin olmayan bir ön derlemeyi hiçbir şey döndürmeyen bir sözleşmeye yapılan gerçek bir çağrıdan ayırt edemez ve bir ön derlemenin etkin olsun olmasın bayt kodu yoktur. `active: true` bildirse bile, paket belgelerinde, zincir v3.2.3'ten itibaren bir çağrının yalnızca yönetişimin izin listesine aldığı hedeflere ulaştığı (VM'ler arası parametre `bridge_allowed_targets`, her girdi `<vm>:<contract>`) ve EVM'den EVM'e çağrının reddedildiği belirtilir.

### Zincir v3.2.5: izin listesi, yanıt biçimi ve retler (şimdi testnet'te, mainnet'te yükseltmeden sonra) {#chain-v325}

Zincir v3.2.5 köprünün davranışını değiştirir. Testnet onu çalıştırır; **mainnet (v3.2.4), yönetişim önerisi 14 uygulanana kadar çalıştırmaz** ve bu sayfanın başka yerlerinde ön derlemenin hedefin ham yanıtını döndürdüğünü söyleyen açıklamalar bugünkü mainnet'i anlatır.

* **Bir izin listesi rotası.** `GET /qorechain/crossvm/v1/params`, hedeflerin izin listesi dahil köprü parametrelerini sunar. Testnet'te izin listesi boştur (27 Ekim 2026'da kontrol edildi), yani henüz hiçbir hedefe izin verilmemiştir.
* **Sabit bir yanıt biçimi.** Ön derleme `abi.encode(bytes)` döndürür; böylece bir yanıt her zaman en az 64 bayttır ve boş bir yanıt, eksik bir yanıttan ayırt edilebilir; onu `abi.decode(ret, (bytes))` ile çözün.
* **Retler bir gerekçe taşır.** Köprü bir çağrıyı reddettiğinde bir sözleşmenin okuyup iletebileceği `Error(string)` ile geri döner (revert).
* **Ön derleme hâlâ etkin değil.** `0x...0901`, her iki ağda da etkin ön derleme listesinde yoktur; bu yüzden bunların hiçbiri uçtan uca çalıştırılmamıştır.

`@qorechain/rdk` 0.7.0, bunlar için yardımcılar içerir (Solidity'nin ürettiği kodlamalara karşı denetlendi): `getCrossVmParams` (izin listesi), `crossVmTargetReady` (ön derleme etkin, köprü açık ve hedef izin listesinde; değilse engelleyen gerekçeyle birlikte), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) ve `decodeRevertReason` (`Error(string)`).

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

Ön derleme etkin olmadığından, ona yapılan düz bir `.call` **boş veriyle başarı döndürür ve hiçbir şey yapmaz**; `ok` bayrağı çağrının etkili olduğunu söylemez. Sözleşme içindeki güvenilir koruma, her zaman boş olmayan bir onay döndüren bir hedeftir; çağrıdan sonra `require(ret.length > 0)` konur, böylece boş bir yanıt başarısızlık sayılır; `multivm-rollup` şablonu bunu yapar (0.6.0 ve sonrası).

## Çoklu-VM rollup iskeleti oluşturma

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

`multivm-rollup` şablonu `src/crossvm-call.ts` dosyasını (ön derlemenin canlı olup olmadığını denetler, ardından calldata'yı yazdırır) ve `executeCrossVMCall(uint8,string,bytes)` işlevini çağıran ve hedeften boş olmayan bir yanıt zorunlu kılan bir `contracts/CrossVmCaller.sol` dosyasını içerir. 0.7.0'dan itibaren sözleşme `abi.encode(bytes)` sonucunu çözer, etkin bir ön derlemenin döndürdüğü 64 baytlık asgariyi zorunlu kılar ve zincirin ret gerekçesini iletir. Ön derleme etkin değilken bir çağrının çalışmasını sağlamaz. Tüm iskelet oluşturucu şablonları için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
