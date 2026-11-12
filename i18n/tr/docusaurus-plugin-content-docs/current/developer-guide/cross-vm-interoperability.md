---
slug: /developer-guide/cross-vm-interoperability
title: VM'ler Arası Birlikte Çalışabilirlik
sidebar_label: VM'ler Arası Birlikte Çalışabilirlik
sidebar_position: 5
---

# VM'ler Arası Birlikte Çalışabilirlik

QoreChain'in **üçlü VM mimarisi** (EVM, QoreChain Native, SVM), herhangi bir sanal makinedeki akıllı sözleşmelerin başka herhangi bir VM'deki sözleşmelerle iletişim kurmasına olanak tanımak üzere tasarlanmıştır. `x/crossvm` modülü, aynı işlem içinde çalışan bir yol ve kuyruğa alınan bir yol sunan bir çağrı mesajı sağlar.

:::caution Bugün neler çalışıyor
VM'ler arası çağrılar yalnızca hedef şeritlerinin (lane) sunulabildiği ölçüde kullanılabilir:

* `MsgCrossVMCall`, devre kesici tarafından **ana ağda kapatılmıştır** (`qorechaind query circuit disabled-list`); test ağında etkindir.
* **SVM şeridi, her iki ağda da işlemler için devre dışıdır**, bu nedenle bir SVM adımı çalışamaz.
* **QoreChain Native yükleme her iki ağda da izne tabidir**, **örnekleme (instantiate) ise ana ağda izne tabidir** ve ana ağda kayıtlı sözleşme kodu yoktur, dolayısıyla ana ağda henüz çağrılacak bir QoreChain Native sözleşmesi bulunmamaktadır. Test ağında yönetişim, herhangi bir hesabın örnekleyebileceği birkaç gözden geçirilmiş sözleşme depolamıştır ([QoreChain Native Geliştirme](/developer-guide/cosmwasm-development) sayfasına bakın), dolayısıyla orada bir QoreChain Native hedefi bulunabilir.
* Senkron **EVM önderlenmiş işlevi ana ağda etkin değildir** ve test ağında **etkindir**; yalnızca gözden geçirilmiş QoreChain Native sözleşmelerinden oluşan bir izin listesi vardır (7 Kasım 2026'da okundu; v3.2.7 yükseltmesinden sonra üzerinden salt okunur bir çağrı çalıştırıldı, aşağıya bakın). Güçlendirilmiş bir sürüm v3.2.3'ten beri ikili dosyada bulunur. (27 Ekim 2026'da test ağı yönetişimi diğer üç önderlenmiş işlevi etkinleştirdi: PQC Verify, PQC Key Status ve PRISM Consensus Params; CrossVM köprüsü 4 Kasım'a kadar test ağı listesine katıldı; ana ağda hiçbiri etkin değildir.)

Ana ağda modülün REST rotaları (`/qorechain/crossvm/v1/...`) genel ağ geçidi tarafından sunulmaz (`501`); mesajları CLI ile veya bir gRPC/ABCI sorgu istemcisiyle okuyun.
:::

:::note
Aşağıdaki uç noktalar varsayılan olarak yerel bir düğüme yöneliktir. Ana ağda **`qorechain-vladi`** RPC uç noktalarını kullanın (Cosmos RPC **26657**, EVM JSON-RPC **8545**); test ağı **`qorechain-diana`** şeklindedir.
:::

---

## Mimariye Genel Bakış

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Yol              | Yön             | Zamanlama        | Mekanizma                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Senkron**      | EVM'den QoreChain Native'a | Aynı işlem    | `0x0000...0901` adresindeki önderlenmiş işlev (test ağında etkin, ana ağda değil; aşağıya bakın) |
| **Mesaj, varsayılan** | Herhangi bir VM'den başka herhangi bir VM'e | Aynı işlem | `MsgCrossVMCall`; çağrı hemen yürütülür ve bir başarısızlık tüm işlemi geri alır |
| **Mesaj, kuyruğa alınmış**  | Herhangi bir VM'den başka herhangi bir VM'e | Sonraki blok (veya daha sonra) | `async` ayarlı `MsgCrossVMCall`; mesaj kuyrukta bekler |

---

## Senkron Yol (EVM'den QoreChain Native'a) {#synchronous-path-evm-to-qorechain-native}

Senkron yol, `0x0000000000000000000000000000000000000901` adresinde bir EVM **önderlenmiş işlevi** kullanır. Solidity sözleşmelerinin QoreChain Native sözleşmelerini çağırmasına ve aynı işlem içinde bir yanıt almasına olanak tanımak üzere tasarlanmıştır.

:::warning Ana ağda etkin değil; test ağında izin listesiyle etkin
CrossVM köprüsü önderlenmiş işlevi `qorechain-vladi` üzerinde **etkin değildir**: orada `0x…0901` adresine yapılan bir çağrı başarılı olur ve boş veri döndürür. `qorechain-diana` üzerinde `active_static_precompiles` listesi `0x…0901` içerir (7 Kasım 2026'da okundu); üzerinden salt okunur bir `eth_call` 7 Kasım 2026'da, v3.2.7 yükseltmesinden sonra çalıştırıldı (sonuçlar aşağıda). v3.2.3 ikili dosyası güçlendirilmiş bir sürümü taşır (`STATICCALL` çağrısını reddeder, iç içe çağrısını çağıran çerçevenin gazına göre ölçer ve günlüğe kaydeder; böylece bir EVM geri alması (revert) QoreChain Native tarafını da geri alır, yalnızca izin listesindeki QoreChain Native hedeflerine ulaşır ve VM'ler arası devre kesiciye uyar), ancak yalnızca yönetişim onaylı bir öneri onu etkin listeye eklediği yerde çalışır (şimdiye kadar test ağı, ana ağ değil). Ana ağda önderlenmiş işlev ve VM'ler arası çağrılar, henüz tarihi olmayan bir v3.2.7 yükseltmesinden sonra bile, ayrı bir yönetişim kararına kadar kapalı kalır. Aşağıdaki örnek, düğümün çözdüğü düzendir; ana ağda önderlenmiş işlev etkinleşene kadar çalışamaz. Test ağında izin listesi dahilinde çağrılabilir (sonraki bölüm). Bkz. [EVM Önderlenmiş İşlevleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
:::

### Solidity Örneği

Düğüm, önderlenmiş işlevin girdisini 4 baytlık bir seçici (selector) ve ardından `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` işlevinin ABI ile kodlanmış argümanları olarak çözer (seçici `0x3c11078c`). `targetVM`, bir QoreChain Native sözleşmesi için `1`'dir (QoreChain Native, CosmWasm çalışma zamanıdır; `0` EVM'dir ve güçlendirilmiş köprü onu hedef olarak reddeder). `targetContract`, sözleşmenin bech32 adresidir (dize olarak) ve `payload`, sözleşmenin execute mesajıdır (UTF-8 JSON baytları olarak). Önderlenmiş işlev, hedefin ham yanıt baytlarını döndürür.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

Bu, düğümün çözdüğü düzendir; `@qorechain/rdk` kodlayıcısının oluşturduğu düzenle aynıdır ve yukarıdaki sözleşme [Multi-VM](/rollups/multi-vm) sayfasındaki başlangıç şablonuyla eşleşir. Önderlenmiş işlev üzerinden fon eklenemez (`MsgCrossVMCall` mesaj yolu `--funds` alır). Önderlenmiş işlev ana ağda etkin olmadığı için örnek bugün orada bir şey yapamaz. Test ağında sonraki bölümde açıklanan izin listesi dahilinde çalışır; örnek sözleşmenin kendisi bu sayfa için dağıtılmadı, aşağıdaki çağrı doğrudan `eth_call` ile yapıldı.

Önderlenmiş işlevin etkin olduğu yerde, QoreChain Native sözleşmesini hemen yürütür ve sonucu döndürür. (`@qorechain/rdk`'nin 0.6.0'dan itibaren bulunan ve güncel 0.8.0'da yer alan `encodeCrossVmCalldata` yardımcısı calldata'yı oluşturur; bkz. [Multi-VM](/rollups/multi-vm).) Gaz maliyeti: **50.000 taban + girdi baytı başına 4 + yürütme maliyeti**.

### Test ağı davranışı (izin listesi, 7 Kasım 2026'da kontrol edildi) {#testnet-allowlist}

`qorechain-diana` üzerinde (düğüm sürümü v3.2.8, 12 Kasım 2026'dan beri) önderlenmiş işlev yalnızca köprü izin listesindeki QoreChain Native sözleşmelerine ulaşır. `GET /qorechain/crossvm/v1/params` bunları `bridge_allowed_targets` içinde listeler (7 Kasım 2026'da üç kayıt, `cosmwasm:qor1...` biçiminde yazılmış); yanında `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000 ve `queue_timeout_blocks` 100 bulunur. `executeCrossVMCall(1, target, 0x7b7d)` ile `0x…0901` adresine yapılan iki salt okunur `eth_call` isteği 7 Kasım 2026'da çalıştırıldı:

* **İzin listesi dışındaki hedef:** `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted` ile geri alınır.
* **İzin listesindeki hedef:** çağrı sözleşmeye ulaşır (düğüm, boş `{}` mesajı için sözleşmenin kendi hatasını bildirir: `Error parsing into type cw20::msg::Cw20ExecuteMsg`). Bu, rotanın çalıştığını gösterir; bu sayfa için önderlenmiş işlev üzerinden durum değiştiren bir VM'ler arası işlem gönderilmedi.

Ana ağda önderlenmiş işlev (`0x…0901`) ve VM'ler arası çağrılar, v3.2.7 yükseltmesinden sonra bile, ayrı bir yönetişim kararına kadar **kapalı** kalır (devre kesici).

### v3.2.7'nin VM'ler arası çağrılar için değiştirdikleri (şimdilik yalnızca test ağı) {#v327}

Bunlar test ağında 6 Kasım 2026'dan beri geçerlidir ve **henüz ana ağda değildir** (yükseltmenin tarihi yoktur):

* Hedef VM'de başarısız olan bir çağrı artık temiz biçimde başarısız olur: bu yalnızca o çağrının başarısızlığıdır ve kuyruk sonraki mesajla devam eder.
* Hatalı biçimli hedefler gönderim sırasında `crossvm` codespace'inde 5 koduyla reddedilir.
* Bir VM'ler arası çağrı artık bir EVM önderlenmiş işlev adresini hedefleyemez.

---

## Mesaj Yolu (`MsgCrossVMCall`)

Diğer VM'ler arası çağrılar `MsgCrossVMCall` işlemini kullanır. Zincir, kaynak şeridi göndericiden çıkarır; bu nedenle mesaj yalnızca hedef VM'i, hedef sözleşmeyi, yükü (payload) ve isteğe bağlı fonları taşır. Varsayılan olarak çağrı işlem içinde hemen yürütülür ve hedef başarısız olursa tüm işlem geri alınır. `async` bayrağıyla mesaj bunun yerine kuyruğa alınır ve modülün blok sonu kuyruk geçişi tarafından sonraki bir blokta işlenir (aşağıdaki yaşam döngüsüne bakın). Yukarıda belirtildiği gibi, bu mesaj ana ağda kapalıdır.

### CLI

`tx crossvm call`, hedef VM'i (`evm`, `cosmwasm` veya `svm`) ve hedef sözleşmeyi konumsal argümanlar olarak, yükü ise hex olarak alır. CLI kaynak VM'i sormaz: zincir, çağıranın şeridini durumdan türetir ve bildirilen alanı yok sayar (CLI, mesajın kendi doğrulamasından geçmesi için bir yer tutucu doldurur):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Diğer bayraklar: `--funds <coins>` (yalnızca QoreChain Native hedefleri için) ve çağrıyı şimdi yürütmek yerine kuyruğa almak için `--async`. `tx.json` dosyasını `tx pqc cosign` ile imzalayıp yayınlayın (bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing)); ücret tabanı gaz başına 0.1 uqor'dur. Çağıranın kendi şeridine yapılan bir çağrı reddedilir (v3.2.3'ten beri).

:::caution Ana ağda devre dışı
`MsgCrossVMCall`, devre kesici tarafından ana ağda kapatılmıştır; bu nedenle komut bugün orada başarılı olamaz. (v3.2.3 öncesi sürüm ikili dosyaları ayrıca, kaynak VM boş olduğu için kendi doğrulamasından geçemeyen bir mesaj oluşturuyordu; v3.2.3 ikili dosyası bunu düzeltir.) Test ağında mesaj etkindir, ancak SVM şeridi devre dışıdır, bu nedenle bir SVM hedefine ulaşılamaz; bir EVM hedefine ve orada bir sözleşme örneklendikten sonra bir QoreChain Native hedefine ulaşılabilir.
:::

---

## Mesaj Yaşam Döngüsü

Kuyruğa alınan her VM'ler arası mesaj, tanımlanmış bir dizi durum arasında geçiş yapar:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Durum         | Açıklama                                                  |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Mesaj kuyruğa kabul edildi                                |
| **Pending**   | Sonraki EndBlocker geçişinde yürütülmeyi bekliyor         |
| **Executed**  | Hedef sözleşme başarıyla çağrıldı; yanıt kaydedildi       |
| **Failed**    | Hedef sözleşme yürütmesi geri alındı; hata kaydedildi     |
| **Timed Out** | Mesaj, yürütülmeden `queue_timeout_blocks` değerini aştı  |

v3.2.3'ten beri başarısız olan kuyruğa alınmış bir çağrı bütünüyle geri alınır: yalnızca `Failed` kaydı kalır ve başarısız bir QoreChain Native çağrısına eklenen fonlar artık sözleşmeye aktarılmaz. Modül devre dışıyken veya `MsgCrossVMCall` devre kesici tarafından kapatılmışken kuyruk **yürütülmez**: kuyruğa alınmış mesajlar, anahtar önceden açılmadıkça bekleyen durumda kalır ve zaman aşımında sona erer.

### CosmWasm'e asenkron çağrılar (v3.2.8) {#async-calls}

v3.2.8 sürümünden itibaren (daha sonraki bir ana ağ yükseltmesine kadar yalnızca test ağında) CosmWasm'e yapılan asenkron bir çağrı önceden ödenir ve sınırlarla kuyruğa alınır:

| `MsgCrossVMCall` alanı | Anlamı |
| ---------------------- | ------- |
| `async_gas_limit` (8)  | Kuyruğa alınan çağrı için ayırdığınız sözleşme gas birimleri (varsayılan 500.000) |
| `async_max_factor` (9) | Kabul ettiğiniz en yüksek tıkanıklık çarpanı (varsayılan 4x); yürürlükteki çarpan bunun üzerindeyse çağrı reddedilir |

- **Emanet (escrow).** Gönderen, gas birimleri x çarpan x gas fiyatı tutarını bir emanet hesabına önceden öder. Varsayılanlarda bu 500.000 x 4 x 0,1 uqor, yaklaşık 0,2 QOR eder. Çağrının kullanmadığı kısım, çağrı çalıştığında iade edilir.
- **Kuyruk yuvası ücreti.** Bir çağrıyı kuyruğa almak ayrıca küçük bir yuva ücreti öder.
- **Gönderen başına en fazla 100 bekleyen çağrı.** Biri bitene veya zaman aşımına uğrayana kadar yeni bir çağrı reddedilir.
- **Başarısız çağrılar ücretlendirilir.** Başarısız olan bir çağrı da yapılan iş için öder.
- **Ağır çağrılar:** büyük kod yükleyen sözleşmeler için `async_gas_limit` ve `async_max_factor` değerlerini artırın; cw721 boyutundaki bir sözleşme, bir blokta ilk çağrısında varsayılanlara sığmaz.
- **Koddan.** SDK 0.14.0 her dilde iki alanı da alır (TypeScript: `asyncGasLimit` ve `asyncMaxFactor`; bunları `validateCrossVmAsyncGas` denetler; `asyncMaxFactor` milyonda bir birimindedir, yani 1.000.000 1x demektir). Sayfalı bekleyen çağrılar sorgusunun her sayfasını da döndürür. Bu, test ağında çalıştırılmadı.

---

## Parametreler

| Parametre              | Değer        | Açıklama                                       |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | Modül düzeyinde anahtar (çağrı mesajının kendisi ana ağda ayrıca kapatılmıştır) |
| `max_message_size`     | 65.536 bayt  | Mesaj başına maksimum yük boyutu               |
| `max_queue_size`       | 1.000        | Kuyruktaki maksimum bekleyen mesaj             |
| `queue_timeout_blocks` | 100          | İşlenmemiş bir mesajın zaman aşımına uğramasından önceki blok sayısı |

---

## Olaylar

`x/crossvm` modülü aşağıdaki olayları yayar:

| Olay               | Öznitelikler                                                        | Açıklama                              |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Yeni VM'ler arası mesaj gönderildi    |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Mesaj yürütüldü (başarı veya başarısızlık) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Mesaj yürütülmeden sona erdi          |

WebSocket aracılığıyla olaylara abone olun:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Mesajları Sorgulama

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List pending messages (from v3.2.8 one page of at most 100; follow the next key for more)
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Henüz sunulmuyor:** yayımlanmış hiçbir düğüm derlemesi `qor_` JSON-RPC ad alanını sunmaz; bu nedenle bu çağrı bugün her genel uç noktada `-32601` (yöntem bulunamadı) döndürür. Bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Yanıt Biçimi

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Tasarım Hususları

**Atomiklik:** Senkron çağrılar (önderlenmiş işlev aracılığıyla EVM'den QoreChain Native'a), taraflardan biri geri alınırsa tüm işlemin geri alınması için atomik olacak şekilde tasarlanmıştır. Güçlendirilmiş önderlenmiş işlev iç içe çağrıyı günlüğe kaydeder, böylece çağıran sözleşmedeki bir geri alma QoreChain Native tarafını da geri alır; yalnızca test ağında etkindir. Asenkron çağrılar bloklar arasında **atomik değildir**; sözleşmelerinizi `Failed` ve `Timed Out` durumlarını sorunsuzca ele alacak şekilde tasarlayın.

**Sıralama:** Kuyruktaki mesajlar, her EndBlocker geçişi içinde FIFO olarak işlenir. Farklı kaynak VM'ler arasında garantili bir sıralama yoktur.

**Yük kodlaması:** Yük biçimi hedef VM'e bağlıdır:

* **EVM hedefleri:** ABI ile kodlanmış işlev çağrıları
* **QoreChain Native hedefleri:** JSON ile kodlanmış yürütme mesajları
* **SVM hedefleri:** Hex ile kodlanmış BPF talimat verileri

---

## Sonraki Adımlar

* [EVM Önderlenmiş İşlevleri](/developer-guide/evm-precompiles) — Senkron CrossVM önderlenmiş işlevinin ve planlanan diğer önderlenmiş işlevlerin durumu
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde Solidity geliştirme
* [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development) — Rust/Wasm sözleşme geliştirme
* [SVM Geliştirme](/developer-guide/svm-development) — BPF program dağıtımı
