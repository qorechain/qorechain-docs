---
slug: /user-guide/bridging-assets
title: Varlıkları Köprüleme
sidebar_label: Varlıkları Köprüleme
sidebar_position: 5
---

# Varlıkları Köprüleme

Bu kılavuz, QoreChain ile diğer blokzincir ağları arasında varlık taşımanın nasıl çalışacak şekilde tasarlandığını açıklar. QoreChain'in birlikte çalışabilirlik katmanı, **37 zincir yapılandırması** (36 harici zincir ve IBC üzerinden erişilen Injective) ile Cosmos ekosistemi zincirleri için en fazla **8 IBC karşı tarafı** etrafında inşa edilmiştir.

:::caution Hiçbir ağda canlı değil
Köprü modülü mainnet ve testnet'te dağıtılmıştır, ancak **hiçbir köprü rotası aktif değildir**: 37 zincir yapılandırmasının tamamı köprü sözleşmesi ayarlanmamış `pending` durumundadır, kayıtlı köprü doğrulayıcısı yoktur, bugüne kadar hiçbir köprü işlemi oluşturulmamıştır ve hiçbir IBC kanalı ya da istemcisi mevcut değildir. Aşağıdakilerin tümü amaçlanan tasarımı anlatır. Varlıkların köprüleneceğini umarak varlık göndermeyin. Güncel durum tablosu için [Bridge Architecture](/architecture/bridge-architecture) bölümüne bakın.
:::

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**, zincir sürümü **v3.2.4**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) **v3.2.3** zincir sürümünü çalıştırır. Bir rota etkinleştirildiğinde **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın. Durum 20 Ekim 2026'da kontrol edildi: her iki ağda da 37 zincir yapılandırmasının tamamı `pending` durumundadır.
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

IBC tasarımın bir parçasıdır (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), ancak **hiçbir ağda henüz IBC kanalı veya istemcisi yoktur**; dolayısıyla üzerinden transfer yapılabilecek bir şey yoktur. Kanallar açıldığında bu sayfada listelenecektir.

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

## Güvenlik Modeli

QoreChain Bridge'in birden fazla savunma katmanıyla güvence altına alınması tasarlanmıştır:

| Mekanizma                    | Açıklama                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7'de 10 PQC Multisig**     | Her köprü işlemi, her biri kuantum sonrası kriptografik imzalar kullanan 10 köprü doğrulayıcısından en az 7'sinin onayını gerektirir.                  |
| **24 Saatlik İtiraz Süresi** | Büyük transfer eşiğini (100,000 QOR) aşan transferler, doğrulayıcıların veya gözlemcilerin hileli işlemleri işaretleyebileceği 24 saatlik bir itiraz penceresine girer. |
| **Devre Kesiciler**          | Otomatik hız sınırlayıcılar, anormal hacim veya şüpheli desenler tespit edilirse köprü işlemlerini durdurur. Köprü işlemleri manuel inceleme sonrasında devam eder. |

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
