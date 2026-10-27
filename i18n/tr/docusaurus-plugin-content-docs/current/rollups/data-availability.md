---
slug: /rollups/data-availability
title: Veri Kullanılabilirliği
sidebar_label: Veri Kullanılabilirliği
sidebar_position: 4
---

# Veri Kullanılabilirliği

Veri kullanılabilirliği (DA), bir rollup'ın durumunun arkasındaki işlem verilerinin herkesin okuyabileceği bir yerde yayınlandığının garantisidir — böylece herkes rollup'ın durumunu bağımsız olarak yeniden oluşturabilir ve doğrulayabilir. RDK üç DA arka ucu tanımlar; bugün yalnızca `native` uygulanmıştır.

| Arka uç | Ne olduğu | Durum |
| ------- | ---------- | ------ |
| **`native`** | QoreChain'in kendi içinde zincir üstü blob depolaması | Modülde uygulanmıştır; henüz bir blob göndermenin genel bir yolu yok (aşağıya bakın) |
| **`celestia`** | Özel modüler bir DA katmanı olan Celestia'ya IBC üzerinden veri kullanılabilirliği | Uygulanmadı |
| **`both`** | Yedeklilik için native ve Celestia birlikte | Bugün tam olarak `native` gibi davranır |

:::caution Erken aşama yeteneği
Henüz hiçbir ağda bir rollup oluşturulmamıştır (27 Ekim 2026 itibarıyla kontrol edildi) ve DA arka uçları yalnızca kısmen uygulanmıştır. Her arka ucun durumu aşağıda belirtilmiştir; herhangi birine güvenmeden önce **`qorechain-diana`** testnet üzerinde doğrulayın.
:::

---

## Native DA (zincir üstü blob depolaması)

Native DA, `x/rdk` içindeki zincir üstü blob deposudur: her blob rollup kimliği ve blob dizini ile anahtarlanır, baytlarının bir **SHAKE-256 taahhüdünü** taşır ve saklama penceresinden sonra budanırken taahhüdü korunur.

:::caution Henüz bir blob göndermenin genel bir yolu yok
Modül blob depolamayı, saklamayı ve budamayı tanımlar, ancak mevcut sürümlerde (mainnet v3.2.4 ve testnet v3.2.6; modülün mesajları zincir kaynağında kontrol edildi) **bir blob göndermek için bir işlem mesajı yoktur**. Zincir, bir `native` veya `both` rollup'ında boş olmayan bir `data_hash` değerini yalnızca eşleşen bir blob zincir üzerinde depolanmışsa kabul eder ve hiçbir şey bir blob depolayamaz. Dolayısıyla böyle bir rollup'taki bir uzlaşma toplu işlemi `data_hash` alanını **boş bırakmalıdır**: bir veri karması belirten bir toplu işlem, işlem ücreti ödendikten sonra veri kullanılamıyor gerekçesiyle reddedilir.

RDK bunu **0.6.1**'den itibaren izler (0.6.2 ve 0.7.0 da öyle): `SubmitBatchInput.dataHash` isteğe bağlıdır (atlanırsa boş demektir), altı başlangıç şablonunun tümü onu boş bırakır, `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) kuralı beş dilin tümünde sunar ve `RdkTxClient.submitBatch`, rollup'ı okuyabildiğinde (REST uç noktası olan hibrit bir istemci) böyle bir toplu işlemi yayınlamadan önce reddeder. Önceki şablon sürümleri toplu işlemlerine bir veri karması koyuyordu ve zincir bunları reddediyordu.
:::

Temel kavramlar:

* **Blob'lar.** Bir blob bir rollup kimliği ve bir blob dizini ile ilişkilendirilir.
* **Taahhütler.** Her blob, verilerinin 32 baytlık bir SHAKE-256 taahhüdünü taşır, böylece bir blob, depolayan tarafa güvenmeden taahhüt edilenle karşılaştırılarak doğrulanabilir. (TypeScript yardımcısı `buildDaBlob()` 0.6.2 ve öncesinde SHA-256 ile karma alıyordu, bu nedenle `dataHash` değeri zincirin taahhüdüyle eşleşmiyordu; 0.7.0'dan itibaren taahhüdü zincirin SHAKE-256'sıdır. Hiçbir işlem bir blob göndermediğinden, bir `native` veya `both` rollup'ındaki bir toplu işlemde yine de veri karması göndermemelisiniz.)
* **Ad alanları.** Blob'lar rollup'a özgü bir ad alanı taşıyabilir, böylece her rollup'ın verileri paylaşılan depolama içinde mantıksal olarak ayrı tutulur.
* **Saklama ve budama.** Native blob'lar `blob_retention_blocks` boyunca saklanır (432.000 blok — ana ağın mevcut ≈3,1 sn blok süresinde yaklaşık 16 gün; rakam blok süresiyle birlikte değişir) ve ardından zincir üstü depolamayı sürdürülebilir tutmak için budanır. Budamadan sonra ham blob verileri kaldırılır, ancak taahhüt meta verileri saklanır, böylece baytlar artık zincir üstünde depolanmasa bile geçmiş taahhüt doğrulanabilir kalır.

Maksimum blob boyutu ve saklama penceresi, canlı modül parametreleri tarafından yönetilir. Belirli bir sınır etrafında tasarım yapmadan önce bunları sorgulayın:

```bash
qorechaind query rdk config
```

Blob meta verileri (baytlar değil) her iki ağın da sunduğu `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}` adresinden REST üzerinden okunabilir; `expires_at_height` alanını içerir.

---

## Celestia DA (Celestia'ya IBC)

Celestia DA **uygulanmamıştır**. DA arka ucu `celestia` olan bir rollup veri gönderemez (modül bir hata döndürür). Planlanan tasarım, uzlaşmayı yine de QoreChain'e bağlarken veri kullanılabilirliğini IBC üzerinden özel modüler bir DA ağı olan **Celestia**'ya yayınlar; mainnet'te açık bir IBC kanalı yoktur ve testnet'teki tek açık kanal (27 Ekim 2026'da kontrol edildi) bir token-transfer (`ics20-1`) kanalıdır, veri kullanılabilirliği kanalı değildir (bkz. [Köprü Mimarisi](/architecture/bridge-architecture)). `native` kullanın.

---

## Both (yedeklilik)

`both` arka ucunun amacı **native ve Celestia'ya birlikte** yazmaktır. Bugün `both` tam olarak `native` gibi davranır: yalnızca native kopya depolanır ve Celestia yarısı günlüğe kaydedilen bir uyarıyla atlanır. Bunu iki bağımsız kopya olarak değerlendirmeyin.

---

## Bir arka uç seçme

| İstediğiniz şey... | Seçim |
| -------------- | ------ |
| QoreChain güvenliğini devralan en basit, tamamen zincir üstü seçenek | **`native`** |
| DA'yı özel modüler bir katmana aktarmak | **`celestia`** — uygulanmadı |
| İki depo arasında yedeklilik | **`both`** — bugün `native` ile aynı |

DA'nın daha geniş uzlaşma tablosuna nasıl uyduğunu öğrenmek için bkz. **[Rollup'lara Genel Bakış](/rollups/overview)**. Daha düşük seviyeli modül referansı için bkz. **[Rollup Development Kit](/architecture/rollup-development-kit)** sayfası.
