---
slug: /developer-guide/cosmwasm-gas-and-limits
title: CosmWasm Gazı, Fiyatlandırma ve Yükleme Limitleri
sidebar_label: CosmWasm Gazı ve Limitler
sidebar_position: 6
---

# CosmWasm Gazı, Fiyatlandırma ve Yükleme Limitleri

QoreChain Native sözleşmeleri (QoreChain'in CosmWasm çalışma zamanı için kullandığı ad), bir doğrulayıcıya çalıştırma maliyetlerine göre fiyatlandırılır. **v3.2.8** sürümünden itibaren bir sözleşme çağrısının fiyatı üç şeye bağlıdır: sözleşme kodunun geçerli blok için bellekte zaten yüklü olup olmadığı, bloğun sözleşme işiyle ne kadar meşgul olduğu ve çağrının ne kadar belleğe dokunduğu. Kod yüklemelerinin boyutu ve biçimi sınırlandırılmıştır.

:::note Önce test ağı
v3.2.8, 12 Kasım 2026'dan beri **`qorechain-diana`** test ağında çalışmaktadır. Ana ağ (`qorechain-vladi`) bunu daha sonraki bir yönetişim yükseltmesiyle uygular; bu yüzden aşağıdaki rakamlar bugün için test ağını, o yükseltmeden sonra ise ana ağı anlatır. Her komut `--chain-id qorechain-diana` kullanır; ana ağ yükseltildiğinde `qorechain-vladi` ile değiştirin.
:::

## Neden önemli {#why}

- Dün sabit bir gaz limitiyle çalışan bir sözleşme çağrısı bugün gazı tüketebilir, çünkü bir kodun bir blokta ilk çağrısı, tekrarına göre birkaç kat daha pahalıdır. Sabit bir limit, en kötü anda başarısız olan bir tahmindir.
- Ücretler yükü izler. Bloklar sözleşme çağrılarıyla dolduğunda sözleşme yürütme fiyatı yükselir, dolmadığında geri düşer.
- Her bloğun sınırlı miktarda sözleşme işi vardır. Sığmayan bir çağrı başarısız olur ve diğer tüm başarısız işlemler gibi ücretini öder.

Kısa kural: **simüle edin, sonucu en az 1.3 ile çarpın ve bir sözleşme çağrısı için gazı asla sabit kodlamayın.**

## Gaz modeli {#gas-model}

### Kod yükleme maliyeti {#code-load}

Bir sözleşme çalışmadan önce derlenmiş kodunun yüklenmesi gerekir. Bir kodun bir blokta ilk çağrısı bu yüklemenin bedelini öder. Aynı blokta aynı koda yapılan sonraki çağrılar ucuzdur, çünkü kod zaten bellektedir.

| Çağrı | Yaklaşık gaz |
| ---- | --------------- |
| cw20 `transfer`, kodun bir blokta ilk çağrısı (tek mesaj, ölçülen kullanılan gaz) | 585,151 |
| cw20 `transfer`, tek işlemde üç çağrı, yani aynı blokta iki tekrar (ölçülen kullanılan gaz, toplam) | 646,169 |
| Aynı tek çağrı, simülasyonun bildirdiği şekilde | 591,280 |

Bu sayılar, 12 Kasım 2026'da test ağında, yönetişimin sakladığı incelenmiş cw20 koduyla ölçüldü (tıkanıklık çarpanı 1x). Aynı kodun aynı blokta bir tekrarı pratikte yalnızca yaklaşık 30,500 gaz ekler. Simülasyon, bir işlemin kullandığından fazlasını bildirir, çünkü her zaman soğuk yüklemeyi hesaplar ve tıkanıklık için bir pay ekler: üç çağrı 1,326,504 olarak simüle edildi ve 646,169 kullandı. Rakamlar koda ve çağrıya bağlıdır; bu yüzden kendi sözleşmenizi ölçün. Ayrıntıda yükleme, bir kodun bir blokta ilk çağrısında tam olarak alınır, o koda aynı blokta yapılan sonraki sekiz çağrı yükleme ödemez ve sonraki her çağrı bunun sekizde birini öder. Yüklü kodlar kümesi her blokta boş başlar; böylece her doğrulayıcı aynı çağrıları aynı şekilde ücretlendirir. Bu, instantiate, execute, migrate ve başka bir sözleşmeden veya ağlar arası (cross-VM) köprüden yapılan çağrılar için geçerlidir.

**Sabitlenmiş kodlar yükleme ücretini atlar.** Yönetişim, doğrulayıcıların yüklü tutması için popüler bir kodu sabitleyebilir ve sabitlenmiş bir koda yapılan çağrılar yükleme maliyetini asla ödemez. Hangi kodların sabitlendiğini kontrol edin:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Çağrı kurulumu ve bellek {#setup}

Her çağrı ayrıca küçük bir kurulum ücreti (bir temel maliyet, başlangıç belleğinin her 64 KiB sayfası için bir maliyet ve her veri segmenti için bir maliyet) ve büyüttüğü her bellek sayfası için bir ücret öder. Belleği küçük tutan sözleşmeler daha ucuzdur.

### Tıkanıklık fiyatlandırması {#congestion}

Sözleşme yürütme gazı, bir **tıkanıklık çarpanı** ile çarpılır.

| Özellik | Değer |
| -------- | ----- |
| Aralık | Varsayılan olarak 1x ile 20x arası |
| Yönetişim tavanı | Yönetişim azami değeri 100x'e kadar ayarlayabilir |
| Ne zaman yükselir | Yalnızca bloklar dolduğunda: sözleşme bütçesinin yarısından fazlasını kullanan bir bloktan sonra (varsayılan hedef) çarpan yükselir ve bütçe tükendiyse daha hızlı yükselir |
| Ne zaman düşer | Hedeften az kullanan bir bloktan sonra |

Çarpan yalnızca sözleşme yürütmesini ölçekler. Depolama, çağrı kurulumu ve kod yükleme çarpılmaz. Yukarıdaki transferler ölçüldüğünde çarpan 1x idi.

Canlı değerleri okuyun:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

Bakılacak alanlar `wasm_congestion_factor_micro` (yürürlükteki çarpan, milyonda bir cinsinden; yani `1000000` 1x demektir), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` ve `max_tx_wasm_share_bps` alanlarıdır.

### Blok başına sözleşme bütçesi {#budget}

Her bloğun bir sözleşme işi bütçesi vardır. Varsayılanlar şunlardır:

| Parametre | Varsayılan | Anlamı |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | Tüm işlemlerin birlikte bir blokta kullanabileceği sözleşme yürütmesi |
| `max_tx_wasm_share_bps` | 5,000 (yarısı) | Bir işlemin bu bütçeden kullanabileceği pay; varsayılanda 1,500,000 |
| `queue_wasm_reserve_bps` | 2,500 | Sıraya alınmış asenkron cross-VM çağrıları için ayrılan bütçe payı |

Bütçe bir işlemin sözleşme işini reddettiğinde işlem başarısız olur ("block wasm gas budget exhausted") ve diğer başarısız işlemler gibi ücretini öder. Tam bütçeyle başlayan sonraki blokta yeniden deneyin. Bir öncelik ücreti, bütçe harcanmadan önce bir bloğun başında yer bulmanıza yardımcı olur. Bir işlemin payından fazlasına ihtiyaç duyan tek bir çağrı, yönetişim bütçeyi veya payı yükseltene kadar çalışamaz.

### Simülasyon ve güvenlik payı {#simulation}

Bir simülasyon **her zaman soğuk yüklemeyi hesaplar**, sanki çağrınız o kodun blokta ilk çağrısıymış gibi ve yürütmeyi bir sonraki bloğun kullanacağı tıkanıklık çarpanına iki yükselme adımı ekleyerek fiyatlar (yürütme kısmında yaklaşık 2.25x). Bu nedenle bir tahmin, yükselen yükün birkaç bloğunu atlatır. İlk çağrı için asla çok düşük olmaz.

Bu nedenle her sözleşme mesajı için şu kuralı kullanın:

1. İşlemi simüle edin.
2. Simüle edilen gazı **en az 1.3** ile çarpın.
3. Sonucu gaz limiti olarak kullanın ve işlem üst sınırını aşmayın.

### İşlem üst sınırı {#tx-cap}

Bir Cosmos işlemi, **50,000,000** üzerinde bir gaz limiti ayarlayamaz. Üst sınırı aşan bir işlem, ücreti alınmadan önce reddedilir.

## Yükleme kuralları {#upload}

Kod yükleme (`MsgStoreCode`) **yönetişim denetiminde** kalır: `code_upload_access` her iki ağda da `Nobody` değerindedir; bu yüzden kod bir yönetişim önerisiyle saklanır. İstediğiniz zaman kontrol edin:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

v3.2.8'den itibaren bir yükleme, en ucuz kontroller önce olmak üzere sabit bir sırayla denetlenir:

1. **Erişim.** Gönderen, yükleme kuralı tarafından izinli olmalıdır. Mempool yükleme mesajlarını yalnızca izinli gönderenlerden kabul eder.
2. **Bildirilen boyut için gaz, baştan.** İşlemin, bildirdiği modül boyutu için gazı kalmış olmalıdır; aksi halde herhangi bir şey açılmadan önce hemen gaz yetersizliğiyle başarısız olur.
3. **Tek geçişli inceleme.** Modül bir kez açılır, bildirilen boyutu asla aşmaz ve aşağıdaki limitlere göre incelenir. Bir gzip yüklemesi tam olarak tek bir gzip üyesi olmalı ve bildirdiği boyuta açılmalıdır.
4. **Depolama ve derleme.** Depolama bayt başına ücretlendirilir, ardından modül derlenir.

Tipik yükleme maliyetleri: bir cw20 için yaklaşık **9.9 milyon gaz** ve bir cw721 için yaklaşık **22.8 milyon**. Limitler içinde kalan en yoğun yükleme yaklaşık 32 milyona mal olur; bu da hâlâ 50,000,000 üst sınırının içindedir.

### Modül limitleri {#module-limits}

| Limit | Değer |
| ----- | ----- |
| Fonksiyonlar | en fazla 4,096 |
| Fonksiyon tipleri | en fazla 512 |
| Derlenmiş boyut (muhafazakâr tahmin) | en fazla 32 MiB |
| Dışa aktarımlar (exports) | en fazla 128 |
| Global değişkenler | en fazla 256 |
| Eleman segmentleri | en fazla 16, toplamda en fazla 2,500 girdiyle |
| Veri segmentleri | en fazla 1,024 |
| Başlangıç belleği | en fazla 64 sayfa (4 MiB) |
| Özel bölümler | toplamda en fazla 128 KiB |
| Kayan nokta işlemleri | hiçbirine izin verilmez |

Kayan nokta komutları, doğrulayıcı donanımları arasında deterministik olmadıkları için reddedilir. Sözleşmeleri `cosmwasm-std` içindeki tamsayı veya ondalık tiplerle yazın ve yönetişime sunmadan önce derlemenizde kayan nokta komutu olmadığını kontrol edin.

Limitler ayrıca **zaten saklanmış kod için çağrı sırasında** da denetlenir; bu yüzden daha önce saklanmış ve bir limiti aşan (örneğin kayan nokta içeren) bir kod, çağrıldığında reddedilir. Standart cw20 ve cw721 şablonlarından ve sürüm sözleşmelerinden derlenen sözleşmeler her limitin rahatça içinde kalır.

## Uygulamalı örnek: bir cw20 transferini tahmin etme ve yürütme {#worked-example}

Mesaj, standart cw20 `transfer` mesajıdır: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Örnekler test ağını kullanır.

### CLI {#example-cli}

CLI'nin `--gas auto` ile simüle etmesine izin verin ve 1.3 veya daha yüksek bir ayarlama kullanın. İşlemi `--generate-only` ile oluşturun ve kılavuzun geri kalanındaki gibi `tx pqc cosign` ile imzalayın (bkz. [Hibrit imzalama](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Ağ tabanı gaz birimi başına 0.1 uqor'dur; `0.15uqor` pay bırakır. Sözleşmeniz aynı blokta aynı kodu kullanan diğer kullanıcılarla sık çağrılıyorsa, simüle edilen limit soğuk yüklemeyi zaten karşılar.

### TypeScript {#example-ts}

Simüle edin, 1.3 ile çarpın, üst sınırı kontrol edin, ardından hibrit oluşturucu üzerinden gönderin. Bu, tam içe aktarmaları ve hesabın ML-DSA-87 anahtarının kaydını içeren [QoreChain Native SDK kılavuzunu](/sdk/guides/cosmwasm#gas) izler.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

`carriesWasmExecution(messages)`, bir mesaj listesinin simüle edilmiş gaza ihtiyaç duyup duymadığını söyler ve `WASM_GAS_MULTIPLIER_MIN` 1.3'lük asgari değerdir. Bir CosmJS istemcisinin ücret olarak `"auto"` kabul ettiği yerde, istemci sizin yerinize simüle eder.

### Test ağında denendi {#example-tested}

Bu çalıştırma, 12 Kasım 2026'da `qorechain-diana` üzerinde (v3.2.8 sürümü), bir eth-native hesapla, TypeScript SDK 0.13.0 ve yönetişimin sakladığı cw20 koduyla (kod kimliği 859) yapıldı. İşlemi imzalar, imzalı baytları REST simülasyon rotasına gönderir ve gerçek işlemi simüle edilen gaz çarpı 1.3 ile gönderir.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

Çalıştırmanın yazdırdıkları:

| Adım | Sonuç |
| ---- | ------ |
| cw20 instantiate (kod 859): simüle edildi, ardından bunun 1.3 katıyla gönderildi | simüle edilen 634,956; limit 825,443; kod 0, kullanılan gaz 629,267 |
| cw20 `transfer`: simüle edildi | 591,280 gaz |
| Aynı transfer, 400,000'lik sabit limitle | reddedildi: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (ücret yine de alınır) |
| Aynı transfer, simüle edilen x 1.3 ile (768,664) | kod 0, kullanılan gaz 585,151 |
| Tek işlemde üç transfer, simüle edilen x 1.3 ile (1,724,456) | kod 0, kullanılan gaz 646,169 |

Sabit 400,000 limit, kodun bir blokta ilk çağrısında başarısız olur; simüle edilen limit olmaz. Ücret, istediğiniz limit üzerinden belirlenir (bu çalıştırmada gaz birimi başına 0.15 uqor); bu yüzden daha büyük bir pay daha büyük bir ücrete mal olur: 5 değil, 1.3 kullanın.

### Python, Go, Rust ve Java {#example-other}

Bu SDK'ların her biri REST rotasına karşı simüle eder ve limiti sonuçtan boyutlandırır. Simülasyon rotası işlem yapısını gerektirdiği için tam olarak oluşturulmuş (imzalı) bir işlem gerekir. Bir CosmWasm execute, instantiate veya migrate (ve bir cross-VM çağrısı) için SDK'lar limiti simüle edilen gazın en az 1.3 katına yükseltir. Hiçbirinde hazır bir cw20 veya CosmWasm mesaj oluşturucusu yoktur; bu yüzden `MsgExecuteContract` mesajını protobuf kütüphanenizle oluşturun ve imzalı baytlarını verin.

**Python** (`qorechain-sdk`, `qorsdk`): `estimate_gas` ve `auto_fee`, oluşturulmuş işlemi alır ve wasm mesajları için 1.3 tabanını uygular.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas` simüle edilen gazı döndürür, `WasmGasWanted` 1.3 tabanını uygular ve `EstimateFee` verdiğiniz bir çarpanı fiyatlar (tabanı kendisi eklemez; bu yüzden 1.3 veya daha fazlasını verin).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): `estimate_gas_wanted`, wasm ve cross-VM mesajları için limiti simüle edilen gazın en az 1.3 katına yükseltir ve `estimate_fee` bunu fiyatlar.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): işlem wasm veya cross-VM mesajları taşıyorsa son argüman olarak `true` verin.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### REST simülasyon rotası {#example-rest}

İmzalı bir işlemin base64 değeriyle `POST /cosmos/tx/v1beta1/simulate`, `gas_info.gas_used` değerini döndürür. Limit için bunu 1.3 ile çarpın.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

Yanıt, `gas_info.gas_used` değerini (bir dize) taşır. Rota yalnızca POST kabul eder: ona yapılan bir `GET` isteği `501 Not Implemented` yanıtı verir.

## Limitler ve hatalar {#limits-errors}

| Durum | Ne görürsünüz | Ne yapmalı |
| --------- | ------------ | ---------- |
| 50,000,000 üzerinde gaz limiti | Ücret alınmadan önce reddedilir | Limiti düşürün; işi birden çok işleme bölün |
| Bir sözleşme çağrısında gaz yetersizliği | İşlem, gaz yetersizliği hatasıyla başarısız olur | Simüle edin ve sonucun en az 1.3 katını kullanın; sabit bir değeri asla yeniden kullanmayın |
| Blok sözleşme bütçesi tükendi | Blok wasm gaz bütçesini adlandıran bir hata; ücret ödenir | Sonraki blokta, isteğe bağlı olarak bir öncelik ücretiyle yeniden deneyin |
| Bir çağrı bir işlemin payından fazlasına ihtiyaç duyuyor | Her seferinde başarısız olur | Yönetişimden bütçeyi veya payı yükseltmesini isteyin ya da çağrıyı daha ucuz hale getirin |
| Erişimi olmayan bir göndericiden yükleme | Kabul sırasında reddedilir | Kodu bir yönetişim önerisiyle sunun |
| Bildirilen boyutuna yetecek gazı olmayan yükleme | Hemen gaz yetersizliği | Gazı bildirilen boyutu karşılayacak şekilde ayarlayın (cw20 için yaklaşık 9.9 milyon) |
| Bir modül limitini aşan yükleme | Yüklemede reddedilir | Fonksiyonları, dışa aktarımları, global değişkenleri, segmentleri veya belleği azaltın (yukarıdaki tabloya bakın) |
| Bir modülde kayan nokta komutları | Yüklemede ve saklanmış kod için çağrı sırasında reddedilir | Kayan nokta işlemlerini derlemeden çıkarın |
| Tek üye olmayan veya boyutu yanlış olan gzip yüklemesi | Reddedilir | Modülü doğru boyutla tek bir gzip akışı olarak sıkıştırın |

## İlgili sayfalar {#related}

- [QoreChain Native kılavuzu (SDK): sözleşme çağrıları için gaz](/sdk/guides/cosmwasm#gas)
- [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development)
- [Cross-VM Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability)
- [Hibrit imzalama ve `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Yönetişim](/user-guide/governance)
