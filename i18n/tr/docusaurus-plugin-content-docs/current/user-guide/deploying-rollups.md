---
slug: /user-guide/deploying-rollups
title: Rollup'ları Dağıtma
sidebar_label: Rollup'ları Dağıtma
sidebar_position: 6
---

# Rollup'ları Dağıtma

Bu kılavuz, Rollup Development Kit (RDK) kullanarak QoreChain üzerinde uygulamaya özel rollup'ların nasıl dağıtılacağını açıklar. RDK, yaygın kullanım senaryoları için hazır profiller ve gelişmiş dağıtımlar için tam özelleştirme sunar.

:::caution
RDK ve rollup uzlaşma (settlement) katmanı, aktif olarak gelişmekte olan bir yetenektir. Aşağıdaki parametreleri, hazır profilleri ve tek tek özelliklerin olgunluk düzeyini değişebilir olarak kabul edin ve mainnet'i hedeflemeden önce **`qorechain-diana`** üzerinde doğrulayın.
:::

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM zincir kimliği **9801**), 7 Haziran 2026'dan bu yana **v3.1.95** zincir sürümünü çalıştırarak canlıdır — mainnet üzerinde dağıtım yaparken **Mainnet'e Bağlanma** sayfasındaki mainnet zincir kimliğini ve uç noktalarını kullanın.
:::

---

## Genel Bakış

QoreChain RDK, geliştiricilerin QoreChain üzerinde uzlaşan (settle olan) egemen rollup'lar başlatmasına olanak tanır. Her rollup; kendi blok süresine, sanal makinesine ve ücret modeline sahip, QoreChain'in güvenlik ve veri kullanılabilirliği garantilerini devralan bağımsız bir yürütme ortamıdır.

---

## Hazır Profiller

RDK, her biri yaygın bir uygulama kategorisi için ayarlanmış beş hazır profille birlikte gelir:

| Profil         | Uzlaşma (kanıt)      | Sıralayıcı (Sequencer) | Veri Kullanılabilirliği | Gaz modeli   | VM       | Hedef kullanım senaryosu |
| -------------- | --------------------- | ---------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)            | dedicated  | native          | EIP-1559     | EVM      | DeFi/AMM uygulamaları (borç verme, DEX'ler, türev ürünler) |
| **gaming**     | based                 | based      | native          | flat         | custom   | Yüksek işlem hacimli oyun durumu ve gerçek zamanlı deneyimler |
| **nft**        | optimistic (fraud)    | dedicated  | native (Celestia DA planlanıyor) | standard | CosmWasm | NFT basımı ve pazar yeri iş yükleri |
| **enterprise** | based                 | based      | native          | subsidized   | EVM      | Sponsorlu ücretlerle izinli ve konsorsiyum dağıtımları |
| **custom**     | tamamen parametrik    | tamamen parametrik | tamamen parametrik | tamamen parametrik | tamamen parametrik | Her alanı kendiniz belirleyin |

:::note
Yukarıdaki profil bazlı değerler, yayınlanmış `@qorechain/rdk` profil varsayılanlarıyla eşleşir. Kesin yapılandırma RDK olgunlaştıkça değişebilir — yetkili değerleri `qorechaind query rdk config` (veya `RdkClient.params()`) ile sorgulayın ve `based` uzlaşmanın her zaman `based` sıralayıcı moduyla eşleştiğini unutmayın.
:::

---

## Gereksinimler

Bir rollup dağıtmadan önce aşağıdaki gereksinimleri karşıladığınızdan emin olun:

| Gereksinim          | Detaylar                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Minimum Stake**   | 10.000 QOR (10.000.000.000 uqor)                                                        |
| **Oluşturma Yakımı** | Stake edilen tutarın %1'i, rollup oluşturulurken kalıcı olarak yakılır                  |
| **Hesap**            | Stake tutarı artı işlem ücretleri için yeterli bakiyeye sahip, fonlanmış bir QoreChain hesabı |

---

## Hazır Bir Profilden Rollup Oluşturma

Hazır profillerden birini kullanarak bir rollup dağıtın:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:** Bir oyun rollup'ı dağıtın:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Özel Bir Rollup Oluşturma

Rollup parametreleri üzerinde tam kontrol için `custom` profilini kullanın ve her seçeneği belirtin:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Özel parametreler:**

| Parametre      | Seçenekler                                    | Açıklama                              |
| -------------- | ---------------------------------------------- | -------------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`       | Durum geçişlerinin nasıl doğrulandığı  |
| `--sequencer`  | `dedicated`, `shared`, `based`                 | İşlem sıralama stratejisi              |
| `--da-backend` | `native`, `external`                           | Veri kullanılabilirliği katmanı        |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                    | Yürütme ortamı                         |
| `--block-time` | Tam sayı (milisaniye)                          | Hedef blok üretim aralığı              |

---

## Toplu İşlem (Batch) Gönderme

Rollup operatörleri, uzlaşma için işlem toplu gruplarını (batch) QoreChain'e gönderir:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Rollup Yaşam Döngüsü Yönetimi

Rollup operatörleri, dağıtımlarının yaşam döngüsünü yönetebilir:

1. **Bir Rollup'ı Duraklatma** — Blok üretimini geçici olarak durdurun. Rollup durumu korunur ve devam ettirilebilir.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Bir Rollup'ı Devam Ettirme** — Duraklatılmış bir rollup'ta blok üretimini devam ettirin:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Bir Rollup'ı Durdurma (Kalıcı)** — Bir rollup'ı kalıcı olarak durdurun. Bu işlem **geri alınamaz**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Bir rollup'ı durdurmak kalıcıdır. İlişkili tüm durum arşivlenir ancak rollup yeniden başlatılamaz. Stake edilen QOR (oluşturma yakımı düşülerek) operatöre iade edilir.
:::

---

## Rollup'ları Sorgulama

Belirli bir rollup hakkında ayrıntıları alın:

```bash
qorechaind query rdk rollup <rollup_id>
```

QoreChain üzerindeki tüm rollup'ları listeleyin:

```bash
qorechaind query rdk rollups
```

**Örnek çıktı:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## QCAI Destekli Profil Önerisi

Hangi profilin kullanım senaryonuza uygun olduğundan emin değil misiniz? QCAI destekli öneri aracını kullanın:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Örnek çıktı:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Bu komut, açıklamanızı analiz eder ve bir gerekçeyle birlikte en uygun hazır profili önerir.

---

## İpuçları

* Bir hazır profille başlayın ve daha sonra özelleştirin. Hazır profiller, hedef kullanım senaryoları için optimize edilmiştir.
* %1 oluşturma yakımı, dağıtım anında minimum stake üzerinden uygulanan tek seferlik bir maliyettir.
* QoreChain doğrulayıcılarının sıralamayı üstlendiği en basit kurulumu istiyorsanız `based` uzlaşmasını kullanın.
* Toplu işlem (batch) gönderimlerini yakından izleyin. Toplu işlem gönderimindeki boşluklar ağdan uyarılar tetikleyebilir.
* `suggest-profile` komutu yararlı bir başlangıç noktasıdır, ancak öneriyi kendi özel gereksinimlerinize göre değerlendirin.
