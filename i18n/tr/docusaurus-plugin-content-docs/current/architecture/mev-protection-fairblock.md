---
slug: /architecture/mev-protection-fairblock
title: MEV Koruması (FairBlock)
sidebar_label: MEV Koruması (FairBlock)
sidebar_position: 10
---

# MEV Koruması (FairBlock)

`x/fairblock` modülü, QoreChain'in Azami Çıkarılabilir Değer (Maximal Extractable Value, MEV) saldırılarına karşı eşik kimlik tabanlı şifreleme kullanan savunmasını uygular. 5 şeritli bir işlem önceliklendirme sistemiyle birleştiğinde, bu, kullanıcıları öne geçme (front-running), sandviç saldırıları ve diğer mempool tabanlı değer çıkarma biçimlerinden koruyan kapsamlı bir MEV karşıtı mimari oluşturur.

## MEV Sorunu

MEV, blok önerenleri veya gözlemcileri işlem mempool'undaki **bilgi asimetrisini** istismar ettiğinde ortaya çıkar. Bekleyen işlemler dahil edilmeden önce görünür olduğundan, kötü niyetli aktörler şunları yapabilir:

* **Öne geçme (Front-run)**: Tespit edilen kârlı bir işlemin önüne bir işlem yerleştirmek
* **Sandviç saldırısı (Sandwich attack)**: Bir kurbanın işleminin öncesine ve sonrasına işlemler yerleştirerek fiyat kaymasından değer çıkarmak
* **Arkadan geçme (Back-run)**: Tespit edilen bir fırsatın hemen ardından bir işlem yerleştirmek

Bu saldırılar sıradan kullanıcılardan değer çıkarır ve DeFi, token takasları ile NFT basımında adaleti zedeler.

## FairBlock tIBE Çerçevesi

QoreChain, MEV'i şu özelliklere sahip kriptografik bir şema olan **eşik Kimlik Tabanlı Şifreleme (threshold Identity-Based Encryption, tIBE)** aracılığıyla ele alır:

1. **Şifreleme**: Kullanıcılar işlemlerini yayınlamadan önce şifreler. Şifrelenmiş işlemler **opaktır** — önerenler, doğrulayıcılar ve mempool gözlemcileri işlem içeriğini okuyamaz.
2. **Dahil etme**: Önerenler, şifrelenmiş işlemleri içeriklerini bilmeden bloklara dahil eder. Veri okunamadığı için bilgi asimetrisi ortadan kalkar.
3. **Şifre çözme**: Bir işlem bir bloğa işlendikten sonra, eşik sayıda doğrulayıcı şifre çözme payları katkısında bulunur. Eşik karşılandığında, işlemin şifresi çözülür ve yürütülür.

Bu yaklaşım, hiçbir tarafın bir işlemin şifresini geri döndürülemez şekilde işlenmeden önce çözememesini sağlayarak MEV saldırı vektörünü kökünden ortadan kaldırır.

### Şifrelenmiş İşlem Yapısı

Her şifrelenmiş işlem şunları içerir:

| Alan             | Açıklama                                         |
| ---------------- | ------------------------------------------------ |
| `encrypted_data` | tIBE ile şifrelenmiş işlem yükü                  |
| `sender`         | İşlem gönderen adresi (yönlendirme için görünür) |
| `target_height`  | Şifre çözmenin gerçekleşmesi gereken blok yüksekliği |
| `submitted_at`   | Şifrelemenin zaman damgası                       |

### Şifre Çözme Payları

Doğrulayıcılar, işlenmiş işlemler için şifre çözme payları katkısında bulunur:

| Alan         | Açıklama                              |
| ------------ | ------------------------------------- |
| `validator`  | Katkıda bulunan doğrulayıcının adresi |
| `tx_id`      | Şifrelenmiş işlemin kimliği           |
| `share_data` | Doğrulayıcının şifre çözme anahtarı payı |
| `height`     | Pay gönderiminin blok yüksekliği      |

## Uygulama Durumu

Mevcut testnet sürümünde, FairBlock modülü bir **taslak (stub) uygulamasıdır**:

* `FairBlockDecorator` ante işleyicisi işlem işleme hattına bağlanmıştır ancak tüm işlemleri değişiklik yapmadan **geçirir**.
* `enabled` `false` olduğunda (varsayılan), dekoratör hemen zincirdeki bir sonraki işleyiciye devreder.
* Tam tIBE etkinleştirmesi, eşik şifreleme parametrelerini belirlemek için bir doğrulayıcı anahtar töreni beklenerek gelecekteki bir sürüm için planlanmıştır.

### FairBlock Yapılandırması

| Parametre            | Varsayılan   | Açıklama                                         |
| -------------------- | ------------ | ------------------------------------------------ |
| `enabled`            | `false`      | tIBE şifrelemesi için ana anahtar                |
| `tibe_threshold`     | 5            | Gerekli doğrulayıcı şifre çözme payı sayısı      |
| `decryption_delay`   | 3 blok       | Şifre çözmenin başlamasından önce dahil edilmeden sonraki bloklar |
| `max_encrypted_size` | 65,536 bayt  | Şifrelenmiş işlem yükünün azami boyutu           |

## 5 Şeritli İşlem Önceliklendirmesi

QoreChain, işlemleri türe göre sınıflandıran ve her şeride bir öncelik düzeyi ile blok alanı tahsisi atayan 5 şeritli bir mempool mimarisi uygular.

### Şerit Yapılandırması

| Şerit       |       Öncelik | Blok Alanı  | İşlem Türü                                       |
| ----------- | ------------: | ----------: | ------------------------------------------------ |
| **PQC**     | 100 (en yüksek) |       %15 | Kuantum sonrası hibrit imzalı işlemler           |
| **MEV**     |            90 |         %20 | FairBlock tIBE ile şifrelenmiş işlemler          |
| **AI**      |            80 |         %15 | Yapay zeka ile puanlanmış ve ücret optimize edilmiş işlemler |
| **Default** |            50 |         %40 | Standart işlemler                                |
| **Free**    |   10 (en düşük) |       %10 | Gaz soyutlamalı ve sponsorlu işlemler            |

### Şerit Açıklamaları

**PQC Şeridi** (Öncelik 100, %15 blok alanı)\
Hibrit kuantum sonrası kriptografik imzalarla imzalanan işlemler en yüksek önceliği alır. Bu, kuantuma dayanıklı işlem imzalamanın benimsenmesini teşvik eder ve PQC korumalı işlemlerin tıkanıklık sırasında asla sıkışıp kalmamasını sağlar.

**MEV Şeridi** (Öncelik 90, %20 blok alanı)\
tIBE ile şifrelenmiş işlemler ikinci en yüksek önceliği ve en büyük ayrılmış tahsisi alır. Bu, MEV korumasını tercih eden kullanıcıların blok alanına garanti edilmesini sağlayarak şifreleme şemasının yaygın benimsenmesini teşvik eder.

**AI Şeridi** (Öncelik 80, %15 blok alanı)\
Yapay zeka anomali tespit sistemi tarafından puanlanmış veya optimize edilmiş işlemler yükseltilmiş öncelik alır. Buna, yüksek değerli meşru işlemler olarak işaretlenen işlemler veya yapay zeka ile optimize edilmiş ücret yapılarına sahip olanlar dahildir.

**Default Şeridi** (Öncelik 50, %40 blok alanı)\
Herhangi bir özel sınıflandırması olmayan standart işlemler. Bu şerit, normal ağ trafiğini karşılamak için en büyük mutlak blok alanı tahsisini alır.

**Free Şeridi** (Öncelik 10, %10 blok alanı)\
Gaz soyutlamalı ve sponsorlu işlemler. Bu şerit, bir üçüncü tarafın (uygulama, protokol veya aktarıcı) gaz maliyetini sponsorladığı sıfır ücretli kullanıcı deneyimlerini mümkün kılar. Düşük öncelik ve sınırlı blok alanı, gaz soyutlama kullanım senaryolarını desteklerken kötüye kullanımı önler.

### Uygulama Durumu

Şerit yapılandırması mevcut testnet sürümünde **yalnızca veridir**. Şerit tanımları (öncelik, blok alanı tahsisi) uygulama başlatılırken kaydedilir, ancak `PrepareProposal` ve `ProcessProposal` aracılığıyla gerçek mempool yeniden sıralaması gelecekteki bir kilometre taşıdır. Şu anda tüm işlemler, şerit atamasından bağımsız olarak standart sırada işlenir.

## Birleşik MEV Karşıtı Etki

1. **Katman 1: Şifreleme (tIBE)** — İşlemler mempool'a girmeden önce şifrelenir. Önerenler içeriği okuyamaz, dolayısıyla çıkarılacak bilgi yoktur.
2. **Katman 2: Önceliklendirme (Şeritler)** — Şifrelenmiş MEV şeridi işlemleri %20 ayrılmış blok alanı alır. Öncelik 90, tıkanıklık sırasında bile dahil edilmeyi sağlar.
3. **Katman 3: Eşik Şifre Çözme** — Doğrulayıcılar şifre çözme paylarını yalnızca blok işlendikten sonra açığa çıkarır. Eşik gereksinimi, herhangi bir tek doğrulayıcının erken şifre çözmesini önler.

Sonuç: Bilgi asimetrisi, işlem yaşam döngüsünün yayından yürütmeye kadar her aşamasında ortadan kaldırılır.

Bu yaklaşım, eşik gereksinimi güveni doğrulayıcı kümesine dağıttığından, zaman gecikmeli şifre çözme veya tek taraflı taahhüt-açıklama şemalarından kesinlikle üstündür.
