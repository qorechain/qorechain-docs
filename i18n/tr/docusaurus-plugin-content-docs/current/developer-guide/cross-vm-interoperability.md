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
* Senkron **EVM önderlenmiş işlevi etkin değildir** (aşağıya bakın). Güçlendirilmiş bir sürüm v3.2.3'ten beri ikili dosyada bulunur, ancak CrossVM önderlenmiş işlevi hiçbir ağda etkinleştirilmemiştir. (27 Ekim 2026'da test ağı yönetişimi diğer üç önderlenmiş işlevi etkinleştirdi: PQC Verify, PQC Key Status ve PRISM Consensus Params; ana ağda hiçbiri etkin değildir. v3.2.4, hangi önderlenmiş işlevlerin etkin olduğunu değiştirmez.)

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
| **Senkron**      | EVM'den QoreChain Native'a | Aynı işlem    | `0x0000...0901` adresindeki önderlenmiş işlev (henüz etkin değil, aşağıya bakın) |
| **Mesaj, varsayılan** | Herhangi bir VM'den başka herhangi bir VM'e | Aynı işlem | `MsgCrossVMCall`; çağrı hemen yürütülür ve bir başarısızlık tüm işlemi geri alır |
| **Mesaj, kuyruğa alınmış**  | Herhangi bir VM'den başka herhangi bir VM'e | Sonraki blok (veya daha sonra) | `async` ayarlı `MsgCrossVMCall`; mesaj kuyrukta bekler |

---

## Senkron Yol (EVM'den QoreChain Native'a)

Senkron yol, `0x0000000000000000000000000000000000000901` adresinde bir EVM **önderlenmiş işlevi** kullanır. Solidity sözleşmelerinin QoreChain Native sözleşmelerini çağırmasına ve aynı işlem içinde bir yanıt almasına olanak tanımak üzere tasarlanmıştır.

:::warning Ana ağda veya test ağında etkin değil
CrossVM köprüsü önderlenmiş işlevi `qorechain-vladi` veya `qorechain-diana` üzerinde **etkin değildir**: `0x…0901` adresine yapılan bir çağrı başarılı olur ve boş veri döndürür. v3.2.3 ikili dosyası güçlendirilmiş bir sürümü taşır (`STATICCALL` çağrısını reddeder, iç içe çağrısını çağıran çerçevenin gazına göre ölçer ve günlüğe kaydeder; böylece bir EVM geri alması (revert) QoreChain Native tarafını da geri alır, yalnızca izin listesindeki QoreChain Native hedeflerine ulaşır ve VM'ler arası devre kesiciye uyar), ancak yalnızca yönetişim onaylı bir yükseltme onu etkin listeye ekledikten sonra çalışır. Aşağıdaki örnek, düğümün çözdüğü düzendir; ancak önderlenmiş işlev etkinleşene kadar çalışamaz. Bkz. [EVM Önderlenmiş İşlevleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
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

Bu, düğümün çözdüğü düzendir; `@qorechain/rdk` kodlayıcısının oluşturduğu düzenle aynıdır ve yukarıdaki sözleşme [Multi-VM](/rollups/multi-vm) sayfasındaki başlangıç şablonuyla eşleşir. Önderlenmiş işlev üzerinden fon eklenemez (`MsgCrossVMCall` mesaj yolu `--funds` alır). Önderlenmiş işlev etkin olmadığı için örnek bugün hiçbir ağda bir şey yapamaz (yukarıdaki uyarıya bakın); ABI etkinleştirmeden önce yine de değişebilir.

Etkinleştirildiğinde, önderlenmiş işlev QoreChain Native sözleşmesini hemen yürütür ve sonucu döndürür. (`@qorechain/rdk`'nin 0.6.0'dan itibaren bulunan ve güncel 0.7.0'da yer alan `encodeCrossVmCalldata` yardımcısı calldata'yı oluşturur; bkz. [Multi-VM](/rollups/multi-vm).) Gaz maliyeti: **50.000 taban + girdi baytı başına 4 + yürütme maliyeti**.

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

# List all pending messages
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

**Atomiklik:** Senkron çağrılar (önderlenmiş işlev aracılığıyla EVM'den QoreChain Native'a), taraflardan biri geri alınırsa tüm işlemin geri alınması için atomik olacak şekilde tasarlanmıştır. Mevcut önderlenmiş işlev bunu henüz garanti etmez; etkin olmamasının nedenlerinden biri budur (yukarıya bakın). Asenkron çağrılar bloklar arasında **atomik değildir**; sözleşmelerinizi `Failed` ve `Timed Out` durumlarını sorunsuzca ele alacak şekilde tasarlayın.

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
