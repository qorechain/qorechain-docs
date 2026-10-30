---
slug: /user-guide/bridging-assets
title: Varlıkları Köprüleme
sidebar_label: Varlıkları Köprüleme
sidebar_position: 5
---

# Varlıkları Köprüleme

Bu kılavuz, QoreChain ile diğer blokzincir ağları arasında varlık taşımanın nasıl çalışacak şekilde tasarlandığını açıklar. QoreChain'in birlikte çalışabilirlik katmanı, **37 zincir yapılandırması** (36 harici zincir ve IBC üzerinden erişilen Injective) ile Cosmos ekosistemi zincirleri için en fazla **8 IBC karşı tarafı** etrafında inşa edilmiştir.

:::caution Hiçbir ağda canlı değil
Köprü modülü mainnet ve testnet'te dağıtılmıştır, ancak **hiçbir köprü rotası aktif değildir**: 37 zincir yapılandırmasının tamamı köprü sözleşmesi ayarlanmamış `pending` durumundadır, kayıtlı köprü doğrulayıcısı yoktur, bugüne kadar hiçbir köprü işlemi oluşturulmamıştır ve mainnet'te hiçbir IBC kanalı mevcut değildir (testnet'te, kimliği `provider` olan bir zincire giden tek bir ICS-20 test kanalı vardır; aşağıda adı geçen karşı taraflara giden kanal yoktur). Aşağıdakilerin tümü amaçlanan tasarımı anlatır. Varlıkların köprüleneceğini umarak varlık göndermeyin. Güncel durum tablosu için [Bridge Architecture](/architecture/bridge-architecture) bölümüne bakın.
:::

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**, zincir sürümü **v3.2.6**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 29 Ekim 2026'dan beri **v3.2.5** zincir sürümünü çalıştırır. Bir rota etkinleştirildiğinde **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın. Durum 27 Ekim 2026'da kontrol edildi: her iki ağda da 37 zincir yapılandırmasının tamamı `pending` durumundadır.
:::

---

## Bağlantıya Genel Bakış

QoreChain'in iki köprüleme protokolü sağlaması tasarlanmıştır:

| Protokol                                 | Bağlantılar                         | Kullanım Senaryosu                                                        |
| ---------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | en fazla 8 kanal (hiçbiri açık değil) | IBC etkin zincirlerle yerel birlikte çalışabilirlik                      |
| **QCB** (QoreChain Bridge)               | 37 yapılandırma (hepsi pending)     | PQC ile güvenli onaylar (attestations) aracılığıyla IBC olmayan ağlarla zincirler arası transferler |

Her zincir yapılandırmasının eksiksiz bir listesi **Bridge Architecture** sayfasında bulunur. Bu kılavuz, bir köprü transferinin nasıl çalışacak şekilde tasarlandığına odaklanır.

---

## IBC

IBC tasarımın bir parçasıdır (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), ancak **bu karşı tarafların hiçbiri henüz bağlı değildir**: mainnet'te IBC kanalı veya istemcisi yoktur ve testnet'te yalnızca kimliği `provider` olan bir zincire giden tek bir ICS-20 test kanalı vardır (27 Ekim 2026'da kontrol edildi); dolayısıyla bu zincirler için üzerinden transfer yapılabilecek bir şey yoktur. Kanallar açıldığında bu sayfada listelenecektir.

### Testnet'teki IBC eklemeleri (v3.2.6) {#ibc-testnet-v326}

Üç IBC özelliği yalnızca testnet'te vardır; mainnet'te yoktur (`/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` rotası 501 yanıtı verir):

* **IBC hız sınırı.** Yönetişim, IBC transferleri için kanal başına bir kota belirleyebilir (saat cinsinden bir pencere başına arzın tam sayı yüzdesi). Bu **otomatik değildir**: bugün hiçbir sınır ayarlı değildir ve boş küme sınırsız anlamına gelir. İletilen bir paket her iki kanalda da ücretlendirilir ve bir iade kotayı geri verir. Bu, [Güvenlik Modeli](#security-model) altında anlatılan köprü devre kesicilerinden ayrıdır.
* **Paket iletme (forwarding).** IBC v1 üzerinden gelen bir transfer, başka bir zincire gönderilmek üzere `{"forward":{"receiver":"...","port":"transfer","channel":"channel-N"}}` biçiminde bir memo taşıyabilir; bir atlama başarısız olursa göndericiye iade yapılır. Yeniden deneme yoktur ve bir atlama varsayılan olarak 10 dakika sonra zaman aşımına uğrar. Varışta ERC-20'ye dönüşen bir token iletilemez.
* **08-wasm hafif istemcileri.** Bir wasm hafif istemci ikilisini saklamak, taşımak ve kaldırmak yalnızca yetkili makama aittir ve izin verilen istemci türleri, yönetişim `08-wasm` ekleyene kadar yalnızca standart istemciyi içerir.

Sınırları testnet'te `GET /Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` ile okuyun (bugün `{"rate_limits":[]}`).

**Hangi ağda ne var (27 Ekim 2026'da kontrol edildi).**

| | Mainnet `qorechain-vladi` (v3.2.5) | Testnet `qorechain-diana` (v3.2.6) |
|---|---|---|
| ICS-20 transferi (IBC v1) | Yerleşik, ancak açık kanal yok | Yerleşik, bir kanal açık |
| IBC hız sınırı | Mevcut değil (501) | Mevcut, ayarlı sınır yok |
| Paket iletme | Mevcut değil | Mevcut (yalnızca IBC v1) |
| 08-wasm hafif istemcileri | Mevcut değil | Mesaj kümesi var; yönetişim `08-wasm`'a izin verene kadar hiçbir wasm istemcisi oluşturulamaz |

### Testnet'teki test kanalı {#ibc-test-channel}

Testnet'te tek bir açık transfer kanalı vardır: `channel-0` (port `transfer`, `connection-0`, sürüm `ics20-1`, sırasız). Karşı tarafı Cosmos Hub testnet'idir (zincir kimliği `provider`, kanal `channel-600`). Testnet şimdiye kadar tek bir IBC denom'u görmüştür: `channel-0` üzerinden gelen `uatom`; QoreChain bunun için modüle ait bir ERC-20 çifti de tutar. Durumu şunlarla okuyun:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Test kanalında göndermek için transferi oluşturun, ardından hibrit imzayı diğer yerel şerit işlemleri gibi ekleyin:

```bash
qorechaind tx ibc-transfer transfer transfer channel-0 <receiver_on_the_hub_testnet> 1000uqor \
  --from mykey --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > ibc.json
qorechaind tx pqc cosign ibc.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Bu, iki test ağı arasında bir test kanalıdır; token'ların değeri yoktur. Bir paketin teslim edilmesi için kanal için çalışan bir relayer gerekir. Kendi relayer'ınızı [QORel](/qorel/overview) ile çalıştırabilirsiniz; bu kılavuz QoreChain tarafından işletilen bir relayer hizmeti vaat etmez, bu yüzden bir transfer beklemede kalabilir. Yukarıdaki komutları mainnet'te kullanmayın: orada açık kanal yoktur ve işlem başarısız olur.

---

## QCB Köprü Uç Noktaları

QoreChain Bridge'in, birden fazla ekosistem türünü kapsayan harici zincirlere bağlanması tasarlanmıştır. Planlanan bağlantıların temsili bir seçkisi (bugün hepsi `pending` durumundadır):

| Zincir    | Zincir Türü |
| --------- | ----------- |
| Ethereum  | EVM         |
| BSC       | EVM         |
| Solana    | Solana      |
| Avalanche | EVM         |
| Polygon   | EVM         |
| Arbitrum  | EVM         |
| TON       | TON         |
| Sui       | Sui Move    |
| Optimism  | EVM         |
| Base      | EVM         |
| Aptos     | Aptos       |
| Bitcoin   | Bitcoin     |
| NEAR      | NEAR        |
| Cardano   | Cardano     |
| Polkadot  | Polkadot    |
| Tezos     | Tezos       |
| Tron      | Tron        |

Hiçbir varlık listesi yayımlanmamıştır: zincir yapılandırmalarında henüz bir varlık kayıt defteri yoktur. Zincir yapılandırmalarının tam listesi için **Bridge Architecture** sayfasına bakın.

---

## Yatırma Akışı (Harici Zincirden QoreChain'e)

Bir harici zincirden QoreChain'e yatırma için tasarlanan sıra:

1. **Kilitleme** — Tokenları QCB köprü sözleşmesine veya adresine göndererek harici zincirde kilitleyin.
2. **Onay (Attestation)** — Köprü doğrulayıcıları kilitleme işlemini gözlemler ve PQC imzalı onaylar üretir.
3. **Eşik** — **10 doğrulayıcıdan 7'sinin** onayı toplandığında köprü yatırmayı kesinleştirir.
4. **Basım (Mint)** — Eşdeğer sarmalanmış (wrapped) tokenlar QoreChain üzerinde basılır ve `qor1...` adresinize aktarılır.

Kullanıcının çalıştırdığı bir "yatırmayı başlat" komutu yoktur: harici zincirde kilitlersiniz ve köprü doğrulayıcılarının onayları hesabınızı kredilendirir. (Zincirin `qorechaind tx bridge deposit` komutu, zaten onaylanmış bir yatırmayı kredilendirir ve köprü doğrulayıcı imzaları gerektirir; bir kullanıcının yatırma başlatma yolu değildir.)

---

## Çekme Akışı (QoreChain'den Harici Zincire)

QoreChain'den bir harici zincire çekme için tasarlanan sıra:

1. **Yakma (Burn)** — Sarmalanmış tokenları QoreChain üzerinde yakın.
2. **Onay (Attestation)** — Köprü doğrulayıcıları yakmayı gözlemler ve PQC imzalı onaylar üretir.
3. **Eşik** — **10'dan 7** onay toplandığında çekme kesinleştirilir.
4. **Kilit Açma (Unlock)** — Orijinal tokenlar harici zincirde belirtilen hedef adrese serbest bırakılır.

**CLI komutu** (bugün engelli: hiçbir zincir aktif değil, bu yüzden işlem reddedilir):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Her yerel şerit işlemi, hibrit kuantum sonrası ortak imzayı ve gaz birimi başına en az 0.1 uqor ücreti gerektirir; bkz. [İlk İşlem](/getting-started/first-transaction).

---

## Güvenlik Modeli {#security-model}

QoreChain Bridge'in birden fazla savunma katmanıyla güvence altına alınması tasarlanmıştır:

| Mekanizma                    | Açıklama                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7'de 10 PQC Multisig**     | Her köprü işlemi, her biri kuantum sonrası kriptografik imzalar kullanan 10 köprü doğrulayıcısından en az 7'sinin onayını gerektirir.                  |
| **24 Saatlik İtiraz Süresi** | Büyük transfer eşiğini (100,000 QOR) aşan transferler, doğrulayıcıların veya gözlemcilerin hileli işlemleri işaretleyebileceği 24 saatlik bir itiraz penceresine girer. |
| **Devre Kesiciler**          | QCB köprüsü için tasarlanmıştır: otomatik sınırlayıcılar, anormal hacim veya şüpheli desenler tespit edilirse köprü işlemlerini durdurur ve işlemler manuel inceleme sonrasında devam eder. QCB köprüsü için geçerlidir, IBC için değil; IBC hız sınırı (yalnızca testnet) yönetişim tarafından belirlenir, otomatik değildir ve bugün hiçbir sınır ayarlı değildir. |

---

## Köprü Durumunu Sorgulama

Köprünün durumunu okuyun:

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

Aynı veriler `/qorechain/bridge/v1/` altında REST üzerinden de erişilebilir ([Bridge Architecture](/architecture/bridge-architecture#rest-api-endpoints) bölümüne bakın).

---

## İpuçları

* Hedef adres biçiminin her zaman hedef zincirle eşleştiğini doğrulayın (ör. EVM zincirleri için `0x...`, Solana için base58).
* Büyük transferlerin (100,000 QOR üzerinde) 24 saatlik itiraz süresini otomatik olarak tetiklemesi tasarlanmıştır.
* Köprü ücretleri `bridge_fee` yakma kanalı aracılığıyla yakılır (bkz. [Token İşlemleri](/user-guide/token-operations)).
