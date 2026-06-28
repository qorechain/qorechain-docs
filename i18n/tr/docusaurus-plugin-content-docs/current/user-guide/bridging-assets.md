---
slug: /user-guide/bridging-assets
title: Varlıkları Köprüleme
sidebar_label: Varlıkları Köprüleme
sidebar_position: 5
---

# Varlıkları Köprüleme

Bu kılavuz, QoreChain ile diğer blokzincir ağları arasında varlıkların nasıl taşınacağını açıklar. QoreChain'in birlikte çalışabilirlik katmanı, heterojen ağlar için **37 QCB (QoreChain Bridge) yapılandırması** (bir QoreChain loopback dahil) ve Cosmos ekosistemi zincirleri için **8 IBC kanalından** oluşur.

:::caution
Zincirler arası köprü şu anda **testnet / üretim öncesi** aşamadadır. Bağlantı kullanılabilirliği, desteklenen varlıklar ve kesinlik (finality) parametreleri değişikliğe tabidir ve üretime hazır olarak değerlendirilmemelidir. Tüm transferleri, onlara güvenmeden önce **`qorechain-diana`** üzerinde doğrulayın.
:::

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.80** zincir sürümünü çalıştırarak yayında — köprü desteğinin etkinleştirildiği durumlarda **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın.
:::

---

## Bağlantıya Genel Bakış

QoreChain iki köprüleme protokolü sağlar:

| Protokol                                 | Bağlantılar        | Kullanım Senaryosu                                                        |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 kanal            | IBC etkin zincirlerle yerel birlikte çalışabilirlik                      |
| **QCB** (QoreChain Bridge)               | 37 yapılandırma    | PQC ile güvenli onaylar (attestations) aracılığıyla IBC olmayan ağlarla zincirler arası transferler |

Her QCB yapılandırmasının ve IBC kanalının eksiksiz bir listesi **Bridge Architecture** sayfasında bulunur. Bu kılavuz, günlük köprüleme kullanımına odaklanır.

---

## IBC Kanalları

Aşağıdaki IBC etkin zincirler QoreChain ile kanallar kurmuştur:

| Zincir               | Kanal       | Durum  |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Aktif  |
| Osmosis              | `channel-1` | Aktif  |
| Noble                | `channel-2` | Aktif  |
| Celestia             | `channel-3` | Aktif  |
| Stride               | `channel-4` | Aktif  |
| Akash                | `channel-5` | Aktif  |
| Babylon              | `channel-6` | Aktif  |
| QoreChain (loopback) | `channel-7` | Aktif  |

IBC transferleri standart `ibc-transfer` modülünü kullanır:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCB Köprü Uç Noktaları

QoreChain Bridge, birden fazla ekosistem türünü kapsayan harici zincirlere bağlanır. Desteklenen ağların temsili bir seçkisi:

| Zincir    | Zincir Türü | Desteklenen Varlıklar |
| --------- | ----------- | --------------------- |
| Ethereum  | EVM         | ETH, USDC, WBTC       |
| BSC       | EVM         | BNB, USDC             |
| Solana    | Solana      | SOL, USDC             |
| Avalanche | EVM         | AVAX, USDC            |
| Polygon   | EVM         | MATIC, USDC           |
| Arbitrum  | EVM         | ETH, ARB, USDC        |
| TON       | TON         | TON                   |
| Sui       | Sui Move    | SUI                   |
| Optimism  | EVM         | ETH, USDC, OP         |
| Base      | EVM         | ETH, USDC             |
| Aptos     | Aptos       | APT, USDC             |
| Bitcoin   | Bitcoin     | BTC                   |
| NEAR      | NEAR        | NEAR, USDC            |
| Cardano   | Cardano     | ADA                   |
| Polkadot  | Polkadot    | DOT                   |
| Tezos     | Tezos       | XTZ                   |
| Tron      | Tron        | TRX, USDT             |

QCB yapılandırmalarının tam listesi ve mevcut yayılma (rollout) durumları için **Bridge Architecture** sayfasına bakın.

---

## Yatırma Akışı (Harici Zincirden QoreChain'e)

Bir harici zincirden QoreChain'e varlık yatırmak şu sırayı izler:

1. **Kilitleme** — Tokenları QCB köprü sözleşmesine veya adresine göndererek harici zincirde kilitleyin.
2. **Onay (Attestation)** — Köprü doğrulayıcıları kilitleme işlemini gözlemler ve PQC imzalı onaylar üretir.
3. **Eşik** — **10 doğrulayıcıdan 7'sinin** onayı toplandığında köprü yatırmayı kesinleştirir.
4. **Basım (Mint)** — Eşdeğer sarmalanmış (wrapped) tokenlar QoreChain üzerinde basılır ve `qor1...` adresinize aktarılır.

**CLI komutu:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Çekme Akışı (QoreChain'den Harici Zincire)

QoreChain'den bir harici zincire varlık çekme:

1. **Yakma (Burn)** — Sarmalanmış tokenları QoreChain üzerinde yakın.
2. **Onay (Attestation)** — Köprü doğrulayıcıları yakmayı gözlemler ve PQC imzalı onaylar üretir.
3. **Eşik** — **10'dan 7** onay toplandığında çekme kesinleştirilir.
4. **Kilit Açma (Unlock)** — Orijinal tokenlar harici zincirde belirtilen hedef adrese serbest bırakılır.

**CLI komutu:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Güvenlik Modeli

QoreChain Bridge, birden fazla savunma katmanıyla güvence altına alınmıştır:

| Mekanizma                    | Açıklama                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7'de 10 PQC Multisig**     | Her köprü işlemi, her biri kuantum sonrası kriptografik imzalar kullanan 10 köprü doğrulayıcısından en az 7'sinin onayını gerektirir.                  |
| **24 Saatlik İtiraz Süresi** | Yapılandırılabilir bir eşiği aşan çekme işlemleri, doğrulayıcıların veya gözlemcilerin hileli işlemleri işaretleyebileceği 24 saatlik bir itiraz penceresine girer. |
| **Devre Kesiciler**          | Otomatik hız sınırlayıcılar, anormal hacim veya şüpheli desenler tespit edilirse köprü işlemlerini durdurur. Köprü işlemleri manuel inceleme sonrasında devam eder. |

---

## Köprü Durumunu Sorgulama

Bekleyen bir köprü işleminin durumunu kontrol edin:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Tüm aktif köprü bağlantılarını listeleyin:

```bash
qorechaind query bridge connections
```

---

## İpuçları

* Köprü yatırmaları, gerekli 7'de 10 onay toplandıktan sonra genellikle birkaç dakika içinde kesinleşir.
* Büyük çekme işlemleri otomatik olarak 24 saatlik itiraz süresini tetikler. Zaman açısından hassas transferler için önceden plan yapın.
* Hedef adres biçiminin her zaman hedef zincirle eşleştiğini doğrulayın (ör. EVM zincirleri için `0x...`, Solana için base58).
* IBC transferleri, yerel protokol düzeyinde iletişim kullandıkları için genellikle QCB transferlerinden daha hızlıdır.
* Köprü ücretleri `bridge_fee` yakma kanalı aracılığıyla yakılır (bkz. [Token İşlemleri](/user-guide/token-operations)).
