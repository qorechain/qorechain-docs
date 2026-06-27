---
slug: /architecture/btc-restaking-babylon
title: BTC Yeniden Stake (Babylon)
sidebar_label: BTC Yeniden Stake (Babylon)
sidebar_position: 11
---

# BTC Yeniden Stake (Babylon)

`x/babylon` modülü, Bitcoin'in proof-of-work sonlandırma garantilerini devralmak için QoreChain'i Babylon Protocol ile entegre eder. BTC yeniden stake yoluyla, QoreChain — Bitcoin protokolünün kendisinde herhangi bir değişiklik gerektirmeden — Bitcoin'in hash gücüyle desteklenen ikincil bir sonlandırma katmanı kazanır.

## Genel Bakış

Babylon Protocol, proof-of-stake zincirlerinin bir zaman damgası ve kontrol noktası mekanizması aracılığıyla Bitcoin'in güvenliğinden yararlanmasını sağlar. QoreChain'in entegrasyonu şu şekilde çalışır:

1. **BTC stakerleri** Bitcoin'i Babylon stake işlemlerinde kilitler ve pozisyonlarını QoreChain'e kaydeder.
2. **Epoch kontrol noktaları** QoreChain'den periyodik olarak Babylon'a aktarılır ve Babylon bunları Bitcoin üzerinde zaman damgalar.
3. **Sonlandırma devralma**: Bir QoreChain epoch'u Bitcoin üzerinde kontrol noktası alındığında, o epoch tarafından kapsanan durum Bitcoin'in proof-of-work sonlandırma garantilerini devralır.

Bu, yalnızca QoreChain'in kendi doğrulayıcı setine güvenmek yerine Bitcoin'in birikmiş hash gücüne dayanan, uzun menzilli saldırılara ve eşdeğerliğe (equivocation) karşı bir savunma sağlar.

## BTC Stake Pozisyonları

Kullanıcılar, bir Bitcoin stake işlemine atıfta bulunan bir `MsgBTCRestake` işlemi göndererek QoreChain'de BTC stake pozisyonları kaydedebilir.

### Kayıt Gereksinimleri

| Parametre               | Değer                        | Açıklama                                       |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| **Minimum stake**       | 100.000 satoshi (0.001 BTC) | Stake pozisyonu başına gereken minimum BTC         |
| **Çözme süresi**    | 144 BTC bloğu (\~1 gün)     | Stake edilen BTC çekilmeden önceki bekleme süresi |
| **Kontrol noktası aralığı** | Her 10 QoreChain epoch'unda    | Durumun Babylon'a ne sıklıkla kontrol noktası alındığı        |

### Stake Pozisyonu Yapısı

Her BTC stake pozisyonu, aşağıdaki zincir üstü durumu izler:

| Alan              | Açıklama                                                     |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | Staker'ın QoreChain adresi (`qor1...`)                     |
| `btc_tx_hash`      | Stake işleminin Bitcoin işlem hash'i             |
| `amount_satoshis`  | Satoshi cinsinden stake edilen BTC miktarı                                |
| `status`           | Pozisyon yaşam döngüsü durumu: `active`, `unbonding` veya `withdrawn` |
| `staked_at`        | Pozisyon kaydının zaman damgası                            |
| `unbonding_height` | Çözmenin başlatıldığı blok yüksekliği (varsa)   |
| `validator_addr`   | Bu stake'in devredildiği QoreChain doğrulayıcı adresi          |

### Kayıt Akışı

1. **BTC stake işlemi oluştur** — Bitcoin ağında, BTC stake işlemini oluşturun.
2. **QoreChain'de MsgBTCRestake gönder** — QoreChain'de `btc_tx_hash`, `amount` ve `validator` ile `MsgBTCRestake` gönderin.
3. **Pozisyon kaydedildi** — Pozisyon zincir üstünde "active" olarak kaydedilir.

## Epoch Kontrol Noktaları

QoreChain'in epoch durum kökleri, Babylon aktarım zinciri aracılığıyla periyodik olarak Bitcoin'e kontrol noktası alınır.

### Kontrol Noktası Akışı

1. **Kontrol noktası gönder** — Bir QoreChain doğrulayıcısı, epoch numarasını, BTC blok hash'ini, BTC blok yüksekliğini ve QoreChain durum kökünü içeren bir `MsgSubmitBTCCheckpoint` gönderir.
2. **IBC aktarımı** — Kontrol noktası verileri IBC aracılığıyla Babylon zincirine aktarılır.
3. **Bitcoin üzerinde zaman damgalama** — Babylon, kontrol noktasını bir Bitcoin işlemine dahil ederek QoreChain'in durumunu Bitcoin'in blok zincirine bağlar.
4. **Onay** — Bitcoin işlemi onaylandığında, sonlandırma Babylon aracılığıyla QoreChain'e geri akar.
5. **Sonlandırma** — Kontrol noktası durumu `pending`'den `confirmed`'a, oradan `finalized`'a geçer.

### Kontrol Noktası Yapısı

| Alan              | Açıklama                                              |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | Kontrol noktası alınan QoreChain epoch numarası                |
| `btc_block_hash`   | Kontrol noktasını içeren Bitcoin blok hash'i             |
| `btc_block_height` | Bitcoin blok yüksekliği                                     |
| `state_root`       | Epoch sınırındaki QoreChain durum kökü               |
| `submitted_at`     | Kontrol noktası gönderiminin zaman damgası                       |
| `status`           | Kontrol noktası durumu: `pending`, `confirmed` veya `finalized` |

### Epoch Anlık Görüntüleri

Her kontrol noktası sınırında, bir epoch anlık görüntüsü toplu ağ durumunu yakalar:

| Alan              | Açıklama                                      |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | Tüm pozisyonlarda stake edilen toplam BTC (satoshi) |
| `active_positions` | Aktif stake pozisyonu sayısı               |
| `validator_count`  | BTC destekli devirlere sahip doğrulayıcı sayısı |
| `block_height`     | Anlık görüntüdeki QoreChain blok yüksekliği               |

## İkincil Sonlandırma Katmanı

Babylon entegrasyonu, QoreChain'in yerel konsensüs sonlandırmasını tamamlayan bir **ikincil sonlandırma garantisi** sağlar:

| Sonlandırma Katmanı | Kaynak                     | Hız        | Güvenlik                                |
| -------------- | -------------------------- | ------------ | --------------------------------------- |
| **Birincil**    | QoreChain Konsensüs Motoru | \~5 saniye  | QOR stake + PQC imzaları tarafından desteklenir    |
| **İkincil**  | Babylon + Bitcoin          | \~60 dakika | Bitcoin'in kümülatif hash gücüyle desteklenir |

İkincil katman özellikle şunlar için değerlidir:

* **Uzun menzilli saldırı önleme**: Bir saldırgan önemli miktarda QOR stake biriktirse bile, Bitcoin üzerinde kontrol noktası alınmış geçmişi yeniden yazamaz.
* **Çapraz zincir köprü güvenliği**: Büyük değerler içeren köprü işlemleri, fonları serbest bırakmadan önce Bitcoin seviyesinde sonlandırma için bekleyebilir.
* **Kurumsal güven**: Bitcoin zaman damgası, QoreChain'in durum geçmişinin bağımsız olarak doğrulanabilir bir kanıtını sağlar.

## Yapılandırma

| Parametre             | Varsayılan          | Açıklama                               |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | BTC yeniden stake özellikleri için ana anahtar  |
| `min_stake_amount`    | 100.000 satoshi | Stake pozisyonu başına minimum BTC          |
| `unbonding_period`    | 144 BTC bloğu   | BTC cinsinden çözme süresi        |
| `checkpoint_interval` | 10 epoch        | Babylon kontrol noktaları arasındaki epoch'lar        |
| `babylon_chain_id`    | `bbn-1`          | Bağlı Babylon ağının zincir kimliği |

## Olaylar

Modül aşağıdaki zincir üstü olayları yayar:

| Olay Türü               | Öznitelikler                               | Açıklama                                    |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | Yeni BTC stake pozisyonu kaydedildi            |
| `btc_unbond`             | staker, amount                           | BTC stake pozisyonu çözmeye girdi         |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | Epoch kontrol noktası Babylon'a gönderildi          |
| `babylon_epoch_complete` | epoch                                    | Babylon epoch'u Bitcoin zaman damgasıyla sonlandırıldı |

## API Uç Noktaları

### REST

| Yöntem | Uç Nokta                         | Açıklama                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Bir adres için BTC stake pozisyonlarını al |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Belirli bir epoch için kontrol noktası verilerini al |
| GET    | `/babylon/v1/params`             | Modül yapılandırma parametrelerini al      |

### JSON-RPC

| Yöntem                      | Parametreler         | Açıklama                                                      |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (string) | Belirli QoreChain adresi için BTC stake pozisyonunu döndürür |

## CLI Komutları

### Sorgu Komutları

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### İşlem Komutları

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
