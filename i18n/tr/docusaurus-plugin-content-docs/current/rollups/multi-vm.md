---
slug: /rollups/multi-vm
title: Çoklu-VM (VM'ler arası çağrılar)
sidebar_label: Çoklu-VM
sidebar_position: 8
---

# Çoklu-VM (VM'ler arası çağrılar)

RDK, bir EVM sözleşmesinden `0x0000000000000000000000000000000000000901` adresindeki **VM'ler arası ön derlemeye (precompile)** yapılan bir çağrıyı kodlayan TypeScript yardımcılarını içerir; bu ön derleme, çağrıyı **QoreChain Native** (Wasm) çalışma zamanındaki bir QoreChain Native sözleşmesine yönlendirmek üzere tasarlanmıştır. Bunları birbirine bağlayan bir `multivm-rollup` iskelet şablonu da vardır. Araçlar yalnızca **EVM → QoreChain Native** kapsamını içerir; SVM ayrı bir çalışma zamanıdır ve ön derlemenin bir parçası değildir.

:::caution Canlı ağlarda henüz kullanılamaz
VM'ler arası ön derleme **ana ağda etkinleştirilmemiştir**: EVM modülünün etkin statik ön derlemeler listesi orada boştur (4 Kasım 2026'da kontrol edildi). Test ağında liste 27 Ekim 2026'da kontrol edildiğinde yalnızca `0x…0A01`, `0x…0A02` ve `0x…0C01` içeriyordu, 4 Kasım'dan itibaren ayrıca `0x…0901` de içeriyordu; 7 Kasım 2026'da yeniden okundu ve hâlâ dördünü de listeliyor ([Zincir v3.2.5](#chain-v325) altındaki nota bakın). 7 Kasım 2026'da, test ağı zincir v3.2.7'yi uyguladıktan sonra, test ağında `0x…0901` adresine salt okunur bir `eth_call` test edildi: izin listesindeki bir hedef sözleşmesine ulaştı, listenin dışındaki bir hedef ise reddedildi ([Test ağında test edildi](#tested-testnet) bölümüne bakın). Ana ağda `0x…0901` için `eth_getCode` `0x` döndürür ve ona yapılan bir çağrı boş veriyle başarılı olur ve hiçbir şey yürütmez (ona yapılan bir `eth_call` 4 Kasım 2026'da boş veri döndürdü). QoreChain Native sözleşme yükleme de her iki ağda kapalıdır ve SVM işlem şeridi ağ genelinde devre dışıdır. Ana ağda, ön derleme etkinleştirilip QoreChain Native yüklemeleri yeniden açılana kadar çağrılacak bir şey yoktur; test ağında ön derleme bir izin listesiyle etkindir ve `eth_call` ile test edildi. Bu sayfa, hazırlanabilmeniz için araçları belgeler; üzerine üretim akışları kurmayın. Bkz. [EVM Ön Derlemeleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
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

`@qorechain/rdk` 0.6.0 ve sonrasındaki (güncel olan 0.8.0) `encodeCrossVmCalldata` aynı calldata'yı sizin için oluşturur:

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

:::note Test ağı 30 Ekim 2026'dan sonra değişti
4 Kasım 2026'da test ağının etkin ön derleme listesi (EVM parametrelerinde `active_static_precompiles`) ayrıca `0x…0901` içeriyordu ve test ağında `GET /qorechain/crossvm/v1/params`, `bridge_allowed_targets` içinde üç CosmWasm hedefi listeledi. Ana ağ o gün değişmemişti: etkin liste boş, izin listesi boş ve `0x…0901` adresine `eth_call` ile yapılan çağrı boş veri döndürdü. Test ağı listesi 7 Kasım 2026'da yeniden okundu ve hâlâ `0x…0901` içeriyor. Aşağıda ön derlemenin veya izin listesinin test ağında etkin olmadığını ya da boş olduğunu söyleyen ifadeler 27-30 Ekim 2026'yı anlatır; test ağının güncel davranışı [Test ağında test edildi](#tested-testnet) bölümündedir.
:::

### Zincir v3.2.5: izin listesi, yanıt biçimi ve retler (her iki ağda) {#chain-v325}

Zincir v3.2.5 köprünün davranışını değiştirir. Mainnet onu 29 Ekim 2026'dan beri (yönetişim önerisi 14, yükseklik 3,906,833), testnet ise 26 Ekim'den beri çalıştırır; mainnet şimdi v3.2.6, test ağı v3.2.7 çalıştırır. Ön derleme mainnet'te etkin olmadığından, aşağıdaki yanıt biçimi sürümün davranışıdır ve orada denenmemiştir; ret biçimi test ağında 7 Kasım 2026'da görüldü ([Test ağında test edildi](#tested-testnet) bölümüne bakın). Bu sayfanın başka yerlerinde ön derlemenin hedefin ham yanıtını döndürdüğünü söyleyen açıklamalar v3.2.5 öncesi sürümleri anlatır.

* **Bir izin listesi rotası.** `GET /qorechain/crossvm/v1/params`, hedeflerin izin listesi dahil köprü parametrelerini sunar. Mainnet'te izin listesi boştur (4 Kasım 2026'da kontrol edildi), yani henüz hiçbir hedefe izin verilmemiştir; testnet'te 30 Ekim'de boştu (yukarıdaki nota bakın).
* **Sabit bir yanıt biçimi.** Ön derleme `abi.encode(bytes)` döndürür; böylece bir yanıt her zaman en az 64 bayttır ve boş bir yanıt, eksik bir yanıttan ayırt edilebilir; onu `abi.decode(ret, (bytes))` ile çözün.
* **Retler bir gerekçe taşır.** Köprü bir çağrıyı reddettiğinde bir sözleşmenin okuyup iletebileceği `Error(string)` ile geri döner (revert).
* **Test ağında etkin, mainnet'te değil.** `0x...0901` mainnet'in etkin ön derleme listesinde yoktur; test ağının listesi onu içerir (7 Kasım 2026'da okundu) ve ret ile izin listesi davranışı orada o gün test edildi. Mainnet, bir v3.2.7 yükseltmesinden sonra da, ayrı bir yönetişim kararına kadar VM'ler arası çağrıları kapalı tutar.

### Test ağında test edildi {#tested-testnet}

Test ağı, 6 Kasım 2026'dan beri (yükseklik 9.594.600) zincir v3.2.7'yi çalıştırır. 7 Kasım 2026'da `0x…0901` adresine, `executeCrossVMCall(uint8,string,bytes)` çağrı verisiyle (hedef VM `1`, yük `{}`) salt okunur iki `eth_call` isteği gönderildi:

| Hedef | Sonuç |
|---|---|
| `bridge_allowed_targets` içinde olmayan bir CosmWasm adresi | `cross-VM bridge call refused: target cosmwasm:<address> is not allowlisted` ile geri alındı |
| `bridge_allowed_targets` içinden bir CosmWasm sözleşmesi | Çağrı sözleşmeye ulaştı ve sözleşme boş yükü reddetti (`Error parsing into type cw20::msg::Cw20ExecuteMsg`); yani köprü onu iletti, sözleşmenin kabul ettiği hiçbir mesaj gönderilmedi |

Bu, izin listesini ve geri alma gerekçesini gösterir. Başarılı, durumu değiştiren bir çağrıyı göstermez; çünkü `eth_call` hiçbir şeyi değiştirmez ve yük bilerek geçerli bir mesaj değildi. Ön derleme üç bağımsız değişken alır; 0.5.0 ve öncesinin iki bağımsız değişkenli biçimi ona ulaşmaz. Ana ağda bu davranış yoktur: orada ön derleme kapalıdır.

`@qorechain/rdk` 0.7.0 ve sonrası bunlar için yardımcılar içerir (Solidity'nin ürettiği kodlamalara karşı denetlendi): `getCrossVmParams` (izin listesi), `crossVmTargetReady` (ön derleme etkin, köprü açık ve hedef izin listesinde; değilse engelleyen gerekçeyle birlikte), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) ve `decodeRevertReason` (`Error(string)`).

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

Ön derleme mainnet'te etkin olmadığından, ona orada yapılan düz bir `.call` **boş veriyle başarı döndürür ve hiçbir şey yapmaz**; `ok` bayrağı çağrının etkili olduğunu söylemez. Sözleşme içindeki güvenilir koruma, her zaman boş olmayan bir onay döndüren bir hedeftir; çağrıdan sonra `require(ret.length > 0)` konur, böylece boş bir yanıt başarısızlık sayılır; `multivm-rollup` şablonu bunu yapar (0.6.0 ve sonrası).

## Çoklu-VM rollup iskeleti oluşturma

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

`multivm-rollup` şablonu `src/crossvm-call.ts` dosyasını (ön derlemenin canlı olup olmadığını denetler, ardından calldata'yı yazdırır) ve `executeCrossVMCall(uint8,string,bytes)` işlevini çağıran ve hedeften boş olmayan bir yanıt zorunlu kılan bir `contracts/CrossVmCaller.sol` dosyasını içerir. 0.7.0'dan itibaren sözleşme `abi.encode(bytes)` sonucunu çözer, etkin bir ön derlemenin döndürdüğü 64 baytlık asgariyi zorunlu kılar ve zincirin ret gerekçesini iletir. Ön derleme etkin değilken bir çağrının çalışmasını sağlamaz. Tüm iskelet oluşturucu şablonları için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
