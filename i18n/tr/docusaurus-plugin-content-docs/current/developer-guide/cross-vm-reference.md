---
slug: /developer-guide/cross-vm-reference
title: VM'ler Arası Çağrılar Başvurusu (v3.2.8)
sidebar_label: VM'ler Arası Başvuru
sidebar_position: 9
---

# VM'ler Arası Çağrılar Başvurusu (v3.2.8)

VM'ler arası bir çağrı, bir sanal makinedeki kodun başka bir makinedeki sözleşmeyi çalıştırmasını sağlar: bir hesabın veya QoreChain Native sözleşmesinin bir EVM sözleşmesini çağırması, bir hesabın bir QoreChain Native (CosmWasm) sözleşmesini çağırması, bir Solidity sözleşmesinin bir QoreChain Native sözleşmesini çağırması ve benzeri. Bunu yapmanın iki yolu vardır. **Senkron** çağrı kendi işleminizin içinde çalışır ve yanıtı hemen geri verir. **Asenkron** çağrı bir kuyruğa konur ve sonraki bir blokta çalışır.

Bu sayfa, v3.2.8 sürümü için alan, maliyet ve limit başvurusudur ve her yön için çalışan bir örnek içerir. Kavramlar, yaşam döngüsü ve eski davranış [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) sayfasındadır; SDK adım adım anlatımı [VM'ler Arası rehberinde](/sdk/guides/cross-vm) yer alır.

:::note v3.2.8 nerede çalışır
**`qorechain-diana`** test ağı 12 Kasım 2026'dan beri **v3.2.8** çalıştırmaktadır. **`qorechain-vladi`** ana ağı bunu henüz uygulamamıştır ve ana ağda `MsgCrossVMCall` kapalıdır. Aşağıda "v3.2.8" olarak işaretlenen her şey şimdilik yalnızca test ağı davranışıdır.
:::

:::caution Çağrı mesajı şu anda kullanılabilir mi?
Test ağında `MsgCrossVMCall` yükseltme tarafından duraklatılmıştı. Yönetişim önerisi 37 geçti ve duraklatmayı kaldırdı; dolayısıyla çağrı test ağında açıktır (12 Kasım 2026'da kontrol edildi: devre kesici listesinde yalnızca `/cosmwasm.wasm.v1.MsgStoreCode` var). Ana ağda kapalı kalır. Çağrının belirli bir anda kullanılabilir olup olmadığını iki şey gösterir: modül parametreleri (`enabled`) ve devre kesici listesi. Üzerine bir şey inşa etmeden önce ikisini de kontrol edin:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

Liste rotası REST üzerinden `disable_list` olarak yazılır (`disabled_list` yazımı `501` döndürür). Bir düğümdeki komut satırı karşılığı `qorechaind query circuit disabled-list` komutudur. Çağrı duraklatıldığında onu taşıyan bir işlem reddedilir ve kuyruktaki çağrılar, duraklatma önceden kaldırılmazsa zaman aşımına uğrayana kadar bekler. Öneri 37 geçmeden önce liste `/qorechain.crossvm.v1.MsgCrossVMCall` içeriyordu; test ağında artık içermiyor. Nelerin gönderildiği için [Test ağında denendi](#tested) bölümüne bakın.
:::

## Neden önemli {#why}

- **Maliyet öngörülebilirdir.** QoreChain Native'e kuyruklanan bir çağrı fiyatını baştan gösterir: sözleşmenin ne kadar iş kullanabileceğini ve kabul ettiğiniz en yüksek tıkanıklık çarpanını siz seçersiniz, para emanette (escrow) tutulur ve çağrının kullanmadığı kısım size geri döner.
- **Tek bir hesap diğerlerini sıkıştıramaz.** Bir gönderen aynı anda en fazla 100 kuyruklanmış çağrıya sahip olabilir; böylece paylaşılan kuyruk kullanılabilir kalır.
- **Başarısız bir çağrı asla bedava değildir.** Başarısız olan bir çağrı, her yönde, yaptığı iş için yine de ödeme yapar; dolayısıyla bir başarısızlığı yakalayıp aynı gazla yeniden denemek işe yaramaz.
- **EVM tarafı pencerenizin içinde kalır.** Kendiniz imzalamadığınız bir EVM çağrısı ile `0x0901` adresindeki EVM köprüsü yalnızca açık bir [EVM yetkilendirme penceresi](/developer-guide/evm-window-reference) tarafından kabul edilir.

## Senkron ve asenkron çağrılar {#sync-async}

| | Senkron (varsayılan) | Asenkron (`async = true`) |
| --- | --- | --- |
| Ne zaman çalışır | İşleminizin içinde | Sonraki bir bloğun sonunda, kuyruktan |
| Gaz | İşleminizin kendi gazı | Sabit, önceden ödenen bir bütçe ([Maliyet](#cost) bölümüne bakın) |
| Yanıt | İşlem yanıtında, `data` alanında döner | Dönmez; biten mesajı kimliğiyle okuyun |
| Hedef başarısız olursa | Tüm işlem geri alınır | Yalnızca o çağrı `failed` olarak kaydedilir; işleminiz kalır |
| Fonlar | QoreChain Native hedefi için `funds` eklenebilir | Aynı; fon taşıyamayan bir şeride giden fonlu asenkron çağrı gönderim anında reddedilir |
| En uygun olduğu durum | Sonucu hemen gerektiren her şey | Gönder ve unut türü işler ve gazını sınırlamak istediğiniz çağrılar |

Kuyruklanan bir mesaj `pending`, ardından `executed`, `failed` veya `timed_out` durumlarından geçer. `queue_timeout_blocks` kadar blok sonra zaman aşımına uğrar (test ağında 100). Kuyruk en eskiden başlayarak çalışır ve blok sonu geçişi blok başına en fazla 50 çağrı çalıştırır.

### Kim kimi çağırır, senkron veya asenkron {#who-calls-whom}

İki moddan hangisinin kullanılabileceği, çağrıyı kimin gönderdiğine bağlıdır.

| Çağıran | Hedef | Senkron | Asenkron |
| --- | --- | --- | --- |
| Hesap (işlemi imzalar) | EVM, QoreChain Native | Evet (varsayılan) | Evet |
| QoreChain Native sözleşmesi, `MsgCrossVMCall` mesajını kendi adına gönderir | EVM | Evet (`async` false, varsayılan) | Evet |
| QoreChain Native sözleşmesi, `MsgCrossVMCall` mesajını kendi adına gönderir | QoreChain Native | Reddedilir (kendi şeridiniz) | Reddedilir (kendi şeridiniz) |
| `0x0901` adresindeki EVM köprüsünün çağırdığı sözleşme (köprünün altında) | SVM | Evet | Kullanılmaz |
| `0x0901` adresindeki EVM köprüsünün çağırdığı sözleşme (köprünün altında) | EVM | Kullanılmaz | Evet |

`MsgCrossVMCall` mesajını kendi adına gönderen bir QoreChain Native sözleşmesi EVM'yi her iki yolla da çağırabilir. Senkron (`async` false, varsayılan) çağrı işlemin kendi gazıyla çalışır, yanıt `MsgCrossVMCallResponse.data` içinde döner ve bir başarısızlık tüm işlemi geri alır. Asenkron çağrı kuyruğa alınır. İkisi de daha önce test ağında çalıştırıldı: senkron çağrı 9.795.779 yüksekliğinde, asenkron çağrı 9.795.783 yüksekliğinde.

"SVM'ye senkron, EVM'ye asenkron" ifadesi yalnızca `0x0901` köprüsünün altında geçerlidir: EVM köprüsünün çağırdığı bir sözleşme için, o sözleşmenin gönderdiği çağrı SVM'ye senkron, EVM'ye asenkron gidebilir. Bu, kendi adına hareket eden ve EVM'ye her iki modu da kullanabilen bir sözleşme için bir kural değildir.

## MsgCrossVMCall alanları {#fields}

Tür URL'si `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Alan | Numara | Anlamı |
| ----- | ------ | ------- |
| `sender` | 1 | `qor1...` adresiniz. Mesajı imzalar. |
| `source_vm` | 2 | Zincir tarafından yok sayılır. Zincir çağrının nereden geldiğini kendisi bulur. Eski düğümler mesajı kabul etsin diye yine de gönderilir. |
| `target_vm` | 3 | `evm`, `cosmwasm` veya `svm`. Kendi şeridinize yapılan çağrı reddedilir. SVM şeridi öneri 37'den beri test ağında açık, ana ağda kapalıdır; bkz. [SVM Şeridi](/developer-guide/svm-lane-v328). Bu sayfa için SVM'ye hiçbir çağrı çalıştırılmadı. |
| `target_contract` | 4 | Bir EVM adresi (`0x` ve 40 onaltılık hane, bir ön derleme adresi değil) veya bir `qor1...` sözleşme adresi. |
| `payload` | 5 | Çağrı verisi: EVM için ABI kodlu, QoreChain Native için UTF-8 olarak JSON yürütme mesajı. En fazla `max_message_size` bayt (65.536). |
| `funds` | 6 | Eklenecek koinler (yalnızca QoreChain Native hedefleri). |
| `async` | 7 | `true` çağrıyı kuyruğa alır; `false` (varsayılan) hemen çalıştırır. |
| `async_gas_limit` | 8 | v3.2.8, yalnızca QoreChain Native'e asenkron: kuyruklanan çağrının çalışacağı sözleşme gaz birimleri. `0` veya belirtilmemiş 500.000 demektir. 250.000'den, kuyruğun bir blokta çalıştırabileceği miktara kadar izin verilir (varsayılan bütçede 1.875.000). |
| `async_max_factor` | 9 | v3.2.8, yalnızca QoreChain Native'e asenkron: ödemeyi kabul ettiğiniz en yüksek tıkanıklık çarpanı, **milyonda bir** birimiyle: `1000000` 1x, `4000000` 4x demektir. Geçerli aralık 1.000.000 ile 100.000.000 arasıdır (1x ile 100x); `4` gibi düz bir katsayı, hiçbir şey çalışmadan önce codespace `crossvm` kod 2 ile reddedilir. `0` veya belirtilmemiş, gönderim anındaki çarpanın dört katı demektir (çarpan 1x iken milyonda bir cinsinden 4.000.000), zincirin üst sınırıyla sınırlanır. Yürürlükteki çarpanın altındaki bir değer gönderim anında reddedilir. |

Komut satırında iki yeni alan `--async-gas-limit` (bir tam sayı) ve `--async-max-factor` (`2.5` gibi bir ondalık; komut bunu sizin için milyonda bire çevirir) olarak girilir. Ham bir mesajda, SDK'da ve REST veya JSON biçimlerinde değer her zaman milyonda bir cinsindendir: 2,5x için `2500000`. SDK, bir katsayıyı milyonda bire çevirmek için `CROSSVM_ASYNC_FACTOR_ONE` (1.000.000) değerini ve göndermeden önce iki değeri denetlemek için `validateCrossVmAsyncGas` işlevini dışa aktarır.

## Maliyet, emanet ve iadeler {#cost}

**QoreChain Native'e asenkron bir çağrı** için (v3.2.8):

1. **Emanet.** Ön ödeme birim çarpı çarpan çarpı gaz fiyatıdır ve harcanmaz, tutulur. Varsayılanlarla bu 500.000 birim x 4 (milyonda bir cinsinden 4.000.000) x 0,1 uqor = 200.000 uqor, yani **0,2 QOR** eder. Bakiyenizden `crossvm_async_escrow` hesabına geçer. Bu kadar harcanabilir uqor'a ihtiyacınız vardır: kilitli vesting koinleri, ücret hibeleri ve başka token'larla ödenen ücretler bunu fonlayamaz ve böyle bir çağrı reddedilir.
2. **Kuyruk yuvası ücreti.** Her asenkron çağrı ayrıca gönderim anında gaz olarak bir yuva ücreti öder: boş bir kuyrukta 500.000 gaz, kuyruk doldukça artarak dolu bir kuyrukta 2.000.000 gaz. Gaz başına 0,1 uqor fiyatıyla bu 0,05 QOR ile 0,2 QOR arasındadır.
3. **Uzlaştırma.** Çağrı bittiğinde, o sırada yürürlükte olan çarpanla kullandığı gaz emanetten ücret olarak ödenir ve geri kalanı size döner. Başarısız olan bir çağrı kullandığını öder. Zaman aşımına uğrayan veya hiç çalıştırılmayan bir çağrı emanetinin tamamını geri alır ve yuva ücreti işlem ücreti olur. `crossvm_escrow_settled` olayı ücreti ve iadeyi taşır.
4. **Çarpanı beklemek.** Çağrı, tıkanıklık çarpanı `async_max_factor` değerinizin altında veya eşit olduğu sürece çalışır. Çarpan daha yüksekse bekler ve yüksek kalırsa zaman aşımına uğrar. Varsayılanla (gönderim anındaki çarpanın dört katı, çarpan 1x iken milyonda bir cinsinden 4.000.000) çağrı beklemeye başlamadan önce çarpanın dört katından fazla artması gerekir.
5. **Boyut limitleri.** Ön ödeme 50.000.000 gazı aşamaz. Bunun üzerinde çağrı gönderim anında reddedilir: daha sonra yeniden deneyin veya `async_gas_limit` değerini düşürün.

**EVM'ye asenkron bir çağrı** için önceden ödenen bütçe, gönderim anında tahsil edilen 1.000.000 gazdır. **Senkron** bir çağrı için maliyet işlemin kendi gazıdır. Büyük kod yükleyen ağır QoreChain Native sözleşmeleri, bir blokta ilk çağrılarında varsayılanlardan daha yüksek bir `async_gas_limit` ve `async_max_factor` gerektirir.

### Başarısız çağrılardan ücret alınır {#failed-charged}

Başarısız olan bir VM'ler arası çağrı, yaptığı iş için yine de ödeme yapar. Geri dönen veya gazı biten bir EVM çağrısı, tükettiği EVM gazını çağırandan kullanır; `0x0901` köprüsü üzerinden yapılan ve başarısız olan bir QoreChain Native çağrısı ise sözleşmenin harcadığı gazı çağıran EVM çerçevesinden kullanır. Pahalıya mal olan başarısız bir çağrılan sözleşmeden kurtulmak isteyen bir sözleşme, aynı kalan gazla yeniden denemek yerine alt çağrıya bir gaz limiti koymalıdır.

## Bekleyen kuyruk {#pending}

- **Gönderen başına en fazla 100 bekleyen çağrı** (`max_pending_per_sender`). Sizin çağrılarınızdan biri çalışana veya zaman aşımına uğrayana kadar sonraki bir asenkron çağrı `ErrQueueFull` (codespace `crossvm`, kod 4) ile reddedilir. Senkron çağrılar etkilenmez.
- **Kuyruğun tamamı en fazla `max_queue_size`** çağrı tutar (1.000).
- **Bekleyenler listesi sayfalanır.** Her sayfa en fazla 100 mesaj tutar ve listedeki her yük ilk **1.024 bayta** kırpılır (`payload_hex`). Yükün tamamını okumak için mesajı kimliğiyle getirin.
- **Sayfa limiti sınırlanır.** 0 veya 100'ün üzerindeki bir `pagination.limit` sessizce 100'e indirilir. `limit=101` içeren bir istek hata değil, en fazla 100 öğeyle `200` döndürür. Daha ileri okumak için yanıttaki `next_key` değerini geçin ve boş olana kadar devam edin.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

12 Kasım 2026'da test ağında kontrol edildi: bekleyenler rotası `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` ile `200` yanıtı verdi (kuyruk boş) ve mesaj rotası var olmayan bir kimlik için `{"message":null,"found":false}` ile `200` yanıtı verdi. Linux düğüm CLI'sında aynı okumalar:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note Düğüm CLI'sı
`qorechaind` Linux düğüm CLI'sıdır. Paketlenmiş bir macOS ikili dosyası yoktur. REST çağrıları her makineden çalışır.
:::

## Modül parametreleri {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

12 Kasım 2026'da şu alanlarla `200` yanıtı verdi:

| Alan | Okunan değer | Anlamı |
| ----- | ---------- | ------- |
| `enabled` | `true` | Modül anahtarı. Çağrı mesajının devre kesici listesinde kendi girdisi vardır. |
| `max_message_size` | `65536` | Bayt cinsinden en büyük yük. |
| `max_queue_size` | `1000` | Aynı anda kuyruklanabilecek en fazla çağrı. |
| `queue_timeout_blocks` | `100` | Çalışmayan bir çağrının zaman aşımına uğramasından önceki blok sayısı. |
| `bridge_allowed_targets` | üç `cosmwasm:qor1...` girdisi | `0x0901` köprüsünün çağırabileceği QoreChain Native sözleşmeleri. Boş olması köprüyü kapalı tutar. |
| `bridge_target_pins` | hedef başına bir girdi: `target`, `code_id`, `history_len` | Köprünün çağırabilmesi için her izinli hedefin hâlâ çalıştırması gereken kod. |
| `max_pending_per_sender` | `100` | Bir göndericinin tutabileceği kuyruklanmış çağrılar. |
| `max_cosmos_tx_gas` | `"50000000"` | Bir Native işleminin bildirebileceği en fazla gaz. |
| `record_retention_blocks` | `"100000"` | Biten bir kuyruklanmış çağrının kaydının ne kadar süre tutulduğu. |
| `max_block_wasm_gas` | `"3000000"` | Bir bloğun kullanabileceği QoreChain Native yürütmesi. |
| `max_tx_wasm_share_bps` | `5000` | Bir işlemin kullanabileceği, o bütçenin payı. |
| `max_block_level_wasm_gas` | `"10000000"` | İşlemlerin dışında yapılan sözleşme işi için bütçe. |
| `queue_wasm_reserve_bps` | `2500` | Blok bütçesinden kuyruk için ayrılan pay. |
| `wasm_congestion_max_factor` | `20` | Tıkanıklık çarpanının ulaşabileceği en yüksek değer. |
| `wasm_congestion_target_bps` | `5000` | Çarpanın artmaya başladığı kullanım payı. |
| `wasm_congestion_factor_micro` | `"1000000"` | Şu anda yürürlükteki çarpan, milyonda bir cinsinden (`1000000` 1x demektir). |
| `max_block_upload_bps` | `5000` | Kod yüklemelerinin kullanabileceği bütçe payı. |
| `max_queue_timeouts_per_block` | `100` | Blok başına zaman aşımına uğratılan çağrılar. |

Kuyruklanan bir çağrının şu anda ne kadar ön ödeme yapacağını görmek için `wasm_congestion_factor_micro` değerini kullanın: birim x çarpan x 0,1 uqor.

## Yönlere göre örnekler {#examples}

Tüm örnekler, her Native işlemde olduğu gibi hesabın kuantum sonrası anahtarıyla imzalar; bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing). Bu sayfa için yalnızca Native hesaptan QoreChain Native'e örnekler gönderildi ([Test ağında denendi](#tested) bölümüne bakın); EVM örnekleri çalıştırılmadı ve göründükleri yerde UNTESTED olarak işaretlenmiştir.

### Native hesaptan EVM sözleşmesine {#native-to-evm}

**UNTESTED:** bu yön bu sayfa için çalıştırılmadı.

Hedef bir EVM sözleşmesidir; yük ABI kodlu çağrı verisidir. Çağrı kendi `0x` adresiniz olarak çalışır, dolayısıyla EVM tarafı sizi `msg.sender` olarak görür. Komut satırı (Linux düğüm CLI'sı), önce oluşturun sonra kuantum sonrası imzayı ekleyin:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Yayımlanmış SDK (0.13.0) ile TypeScript. Yardımcı işlev çağrıyı viem ile ABI olarak kodlar:

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust ve Java, EVM için yükü ham bayt olarak alır (üst düzey ABI kodlaması yalnızca TypeScript'tedir). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

Gönderen, işlemi imzalayan hesap değilse, örneğin bir authz yetkilisi ise, EVM tarafı yetki verenin penceresi altında çalışır; bkz. [Authz ve pencereler](#authz).

### Native hesaptan QoreChain Native sözleşmesine {#native-to-wasm}

Yük, sözleşmenin JSON yürütme mesajıdır. Senkron bir çağrı sözleşmenin yanıtını `data` içinde döndürür:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

Açık bir gaz payı ve çarpan tavanıyla kuyruklanmış (v3.2.8). Çarpan 1 ise emanet 800.000 x 2,5 x 0,1 uqor = 200.000 uqor'dur (0,2 QOR) (komut `2.5` alır ve 2.500.000 milyonda bir gönderir):

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

SDK 0.13.0 ile TypeScript (senkron ve varsayılan payla kuyruklanmış):

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) ve Java (`o.async = true`) aynı şekilde kuyruğa alır:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note İki yeni alan için SDK desteği
SDK 0.13.0'da `async_gas_limit` veya `async_max_factor` için bir seçenek yoktur, bu yüzden kuyruklanan çağrıları varsayılanları kullanır. SDK 0.14.0, VM'ler arası çağrıya `asyncGasLimit` ve `asyncMaxFactor` ekler, `CROSSVM_ASYNC_FACTOR_ONE` (1.000.000) ile `validateCrossVmAsyncGas` işlevlerini dışa aktarır ve `buildCall` yardımcısı, bir Native hesap için `sourceVm` değerini varsayılan olarak `evm` yapar. Zincir `source_vm` değerini yok sayar ve mesajı `source_vm` native olarak kaydetti.
:::

### EVM sözleşmesinden QoreChain Native sözleşmesine, 0x0901 üzerinden {#evm-to-wasm}

**UNTESTED:** bu yön bu sayfa için çalıştırılmadı.

Bir Solidity sözleşmesi `0x0000000000000000000000000000000000000901` adresindeki köprü ön derlemesini çağırır. Çağrı EVM işleminin içinde, çağıran hesap veya sözleşme (`qor1` adresi olarak) QoreChain Native göndereni olacak şekilde çalışır ve herhangi bir yerdeki bir geri alma her iki tarafı da geri alır.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

Köprü için kurallar:

- Yalnızca düz `CALL`, değer yok, seçici `0x3c11078c`. `STATICCALL`, `DELEGATECALL` ve hedef VM `0` veya `2` geri alınır.
- Hedef `bridge_allowed_targets` içinde olmalıdır (ve v3.2.8'den itibaren, sabitlendiği kodu hâlâ çalıştırmalıdır). İkisini de yukarıdaki parametreler rotasıyla okuyun.
- **Çağıranın `0x0901` adresini listeleyen bir pencereye ihtiyacı vardır.** Köprüye işlem gönderen her hesabın, `allowed_targets` listesinde `0x0000000000000000000000000000000000000901` bulunan (ve onu çağıran sözleşme, bir sözleşme üzerinden çağırıyorsanız) açık bir [EVM yetkilendirme penceresi](/developer-guide/evm-window-reference) olmalıdır. Oturumunuza uyan bir sınırla şöyle açın:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- Başarısız bir çağrı bir `Error(string)` gerekçesiyle geri alınır ve sözleşmenin kullandığı gaz için ücretlendirilir.

`@qorechain/rdk` yardımcısı `encodeCrossVmCalldata({ contract, msg })` aynı çağrı verisini TypeScript'te oluşturur ([Çoklu-VM](/rollups/multi-vm) sayfasına bakın). Yayımlanmış SDK ile ön derleme adresi `@qorechain/evm` paketinden `PRECOMPILE_ADDRESSES.crossVmBridge` değeridir.

### QoreChain Native sözleşmesinden EVM sözleşmesine {#wasm-to-evm}

Dokümantasyon yazarı tarafından **UNTESTED**. Zincir ekibi, her iki modun da v3.2.8'den önce test ağında çalıştığını bildiriyor.

Bir QoreChain Native sözleşmesi, kendisi gönderen olarak bir `MsgCrossVMCall` mesajını zincir mesajı olarak göndererek çağrıyı yapar. Mesaj yukarıdakiyle aynı alanlara sahiptir; `source_vm` ne derse desin zincir sözleşmeyi bir CosmWasm çağıranı olarak ele alır. `async` false (varsayılan) iken çağrı senkrondur: işlemin gazıyla çalışır, yanıt `MsgCrossVMCallResponse.data` içindedir ve bir başarısızlık tüm işlemi geri alır. `async` true iken kuyruğa alınır. Bkz. [Kim kimi çağırır](#who-calls-whom). Aşağıdaki örnek çağrıyı kuyruğa alır:

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

Buna güvenmeden önce bilmeniz gerekenler:

- EVM sözleşmeyi, 32 baytlık adresinin **son 20 baytı** olarak görür. EVM sözleşmesinin `msg.sender` değerinin normal bir hesap olmasına bağlı olmadığından emin olun.
- v3.2.8'den itibaren, çağıranı başladığından daha fazla yerel QOR ile bırakacak bir çağrı başarısız olur (ve ücretlendirilir). Bu yön için tasarlanan EVM sözleşmeleri, `msg.sender` adresine yerel QOR değil, bir ERC-20 token'ı veya çağrıda adı verilen 20 baytlık bir hesabı ödemelidir.
- Kendi adına hareket eden bir sözleşme bir EVM penceresiyle sınırlanmaz. Bir hesaptan alınan authz yetkisi altında gönderilen çağrı ise sınırlanır; aşağıya bakın.
- `0x0901` köprüsünün altında, `MsgCrossVMCall` yalnızca kendi adına hareket eden bir sözleşmeden kabul edilir ve oradaki bir authz `MsgExec` başka bir hesap için bir tane taşıyamaz.

Her iki mod da daha önce test ağında çalıştırıldı (senkron 9.795.779 yüksekliğinde, asenkron 9.795.783 yüksekliğinde). Bu mesajı gönderen sözleşme tarafı Rust kodu bu sayfa için çalıştırılmadı.

## Authz ve pencereler {#authz}

Göndericinin kendisinin göndermediği bir EVM'ye VM'ler arası çağrı, **göndericinin** EVM penceresi altında, sanki göndericinin kendi kodu başkasının işleminde hareket ediyormuş gibi çalışır. Pratikte bu, kullanılan bir authz yetkisidir. Birisi `MsgCrossVMCall` yetkinizi EVM'yi çağırmak için kullandığında:

- Çağrı yalnızca **sizin** pencereniz açıksa ve kapsamı hedefi kabul ediyorsa (`allowed_targets`, `native_only`, değer taşıyan ön derlemeler) kabul edilir.
- Her başarılı çağrı pencerenin işlemlerinden birini kullanır ve içinde kaybettiğiniz yerel değer pencerenin değerine sayılır.
- Kullanılabilir bir kuantum sonrası anahtar ve canlı bir pencere olmadan çağrı reddedilir; asenkron çağrıda gönderim anında, kuyruk çalıştırdığında ise tekrar.
- Bir sözleşme veya grup politikası pencere tutmaz, bu yüzden birinden gelen bir authz yetkisi EVM'ye çağrı taşıyamaz.
- QoreChain Native'e yapılan çağrılar pencereyle sınırlanmaz. `MsgCrossVMCall` için genel bir authz yetkisi, yetkili tarafa QoreChain Native şeridinde kimliğinizi verir: bunu yalnızca hesabınız konusunda güvendiğiniz taraflara verin.

Bir authz yetkisi altında bir ERC-20 token'ının dönüştürülmesi (`MsgConvertERC20`) de aynı şekilde göndericinin penceresi tarafından kabul edilir.

## Limitler ve hatalar {#limits}

| Durum | Sonuç |
| --------- | ------ |
| `max_message_size` değerinden büyük yük | Reddedilir, kod 8 (`message payload exceeds max size`) |
| Şeridi için yanlış biçimde hedef adres | Gönderim anında reddedilir, kod 5 (`invalid target contract address`) |
| Hedef bir ön derleme adresi (`0x...0000` ile `0x...ffff` arası) | Gönderim anında reddedilir, kod 5 |
| Hedef VM kendi şeridinize eşit | Reddedilir |
| Bilinmeyen veya desteklenmeyen VM | Kod 7 (`unsupported VM type`) |
| Tek bir göndericiden 100'den fazla kuyruklanmış çağrı | Biri bitene veya zaman aşımına uğrayana kadar `ErrQueueFull`, kod 4 |
| Kuyruk `max_queue_size` çağrı tutuyor | `ErrQueueFull`, kod 4 |
| `async_max_factor` 1.000.000 ile 100.000.000 aralığının (milyonda bir) dışında, örneğin `6000000` yerine `6` | Hiçbir şey çalışmadan reddedilir, codespace `crossvm` kod 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` yürürlükteki çarpanın altında | Gönderim anında reddedilir |
| `async_gas_limit` 250.000'in altında veya kuyruğun blok başına alanının üzerinde | Gönderim anında reddedilir |
| 50.000.000 gazın üzerinde ön ödeme | Gönderim anında reddedilir; daha sonra yeniden deneyin veya limiti düşürün |
| Harcanabilir uqor emanetten az | Reddedilir (vesting ile kilitli koinler, ücret hibeleri ve başka token ücretleri bunu fonlayamaz) |
| Sıra çağrıya geldiğinde tıkanıklık çarpanı `async_max_factor` üzerinde | Çağrı bekler; `queue_timeout_blocks` sonra zaman aşımına uğrar |
| Çağrı zaman aşımına uğrar veya hiç çalıştırılmaz | Emanet tam iade edilir, yuva ücreti işlem ücreti olarak kalır |
| Hedef başarısız olur | `failed` kaydı (asenkron) veya işlem geri alınır (senkron); kullanılan gaz ücretlendirilir |
| EVM'den bir sözleşme çağırana (32 baytlık gönderen) yerel QOR iade edilir | Çağrı başarısız olur ve ücretlendirilir |
| Onu listeleyen bir pencere olmadan `0x0901` çağrısı | Reddedilir |
| `0x0901` hedefi `bridge_allowed_targets` içinde değil veya sabitlendiğinden beri kodu değişti | Geri alınır: izinsiz bir hedef için `cross-VM bridge call refused: target ... is not allowlisted` |
| Devre kesici listesindeki `MsgCrossVMCall` | İşlem reddedilir; kuyruklanmış çağrılar bekler |
| SVM'ye bir çağrı | Şerit öneri 37'den beri test ağında açık, ana ağda kapalı; bu sayfa için SVM'ye hiçbir çağrı çalıştırılmadı (UNTESTED) |

Başarısız bir kuyruklanmış çağrıda kaydedilen hata, kaynak dosya notu içermeyen düz metin taşır.

## Olaylar {#events}

| Olay | Öznitelikler | Anlamı |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Bir çağrı gönderildi |
| `crossvm_response` | `message_id`, `status` ve başarısız bir çağrı için `error` | Kuyruklanmış bir çağrı bitti |
| `crossvm_timeout` | `message_id` | Kuyruklanmış bir çağrı zaman aşımına uğradı |
| `crossvm_escrow_settled` | ücret ve iade | QoreChain Native'e asenkron bir çağrının emaneti ödendi |

## Test ağında denendi {#tested}

12 Kasım 2026'da `qorechain-diana` üzerinde (sürüm v3.2.8), öneri 37 geçtikten sonra, SDK 0.14.0 ile (`createCrossVMClient(...).buildCall`, hibrit imzalı, eth-native hesap), 859 kodundan örneklenen, yönetişimin sakladığı cw20 sözleşmesine karşı çalıştırıldı. Yük `{"transfer":{"recipient":<self>,"amount":"1"}}` idi.

| Adım | Sonuç |
| ---- | ------ |
| Devre kesici listesini oku | Yalnızca `/cosmwasm.wasm.v1.MsgStoreCode`; çağrı mesajı duraklatılmış değil |
| Senkron Native'den QoreChain Native'e çağrı | 601.178 gaz simüle edildi, simüle x 1,3 ile gönderildi, kod 0, 595.049 gaz kullanıldı |
| Asenkron Native'den QoreChain Native'e çağrı, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | 751.287 gaz simüle edildi; kod 0; 751.277 gaz kullanıldı |
| Asenkron çağrının borçlandırmaları (işlem olayları) | Ücret (146.502 uqor, limit çarpı 0,15) ve bir modül hesabına gönderilen 680.417 uqor (gözlemlendiği haliyle emanet ve kuyruk yuvası ödemesi; burada ayrıştırılmadı) |
| Asenkron çağrının olayı | `source_vm` native, `target_vm` cosmwasm ile `crossvm_request` |
| `GET /qorechain/crossvm/v1/message/{id}` | Durum `executed`, `created_height` `executed_height` değerine eşit (kuyruklanan çağrı aynı blokta çalıştı), boş hata |
| Sonrasında `GET /qorechain/crossvm/v1/pending` | Boş liste |
| `async_max_factor` değeri `6` | Hiçbir şey çalışmadan reddedildi: codespace `crossvm` kod 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

Bu sayfa için çalıştırılmadı (UNTESTED): `0x0901` üzerinden EVM'den QoreChain Native'e ve QoreChain Native'den EVM'ye. Zincir ekibi, QoreChain Native'den EVM'ye senkron ve asenkron yolların v3.2.8'den önce test ağında 9.795.779 ve 9.795.783 yüksekliklerinde çalıştığını bildiriyor.

## İlgili sayfalar {#related}

- Kavramlar, yaşam döngüsü ve test ağı izin listesi notları için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability).
- Köprünün ihtiyaç duyduğu pencereyi açmak ve kapsamlamak için [EVM Yetkilendirme Penceresi Başvurusu](/developer-guide/evm-window-reference).
- Ön derleme tablosu ve ağ durumu için [EVM Ön Derlemeleri](/developer-guide/evm-precompiles).
- Sözleşme gazı ve blok bütçesi için [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development) ve [QoreChain Native Gazı ve Limitler](/developer-guide/cosmwasm-gas-and-limits).
- Yukarıdaki işlemleri imzalamak için [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing).
- SDK ve RDK yardımcıları için [VM'ler Arası rehber (SDK)](/sdk/guides/cross-vm) ve [Çoklu-VM rollup'lar](/rollups/multi-vm).
