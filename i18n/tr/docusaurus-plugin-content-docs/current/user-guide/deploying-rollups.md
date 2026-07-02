---
slug: /user-guide/deploying-rollups
title: Rollup Dağıtma
sidebar_label: Rollup Dağıtma
sidebar_position: 6
---

# Rollup Dağıtma

Bu kılavuz, Rollup Development Kit (RDK) kullanılarak QoreChain üzerinde uygulamaya özel rollup'ların nasıl dağıtılacağını açıklar. RDK, yaygın kullanım senaryoları için hazır profiller ve gelişmiş dağıtımlar için tam özelleştirme sağlar.

:::caution
RDK ve rollup mutabakat (settlement) katmanı, etkin şekilde gelişen bir yetenektir. Aşağıdaki parametreleri, hazır profilleri ve bireysel özelliklerin olgunluğunu değişikliğe tabi olarak değerlendirin ve mainnet'i hedeflemeden önce dağıtımları **`qorechain-diana`** üzerinde doğrulayın.
:::

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.82** zincir sürümünü çalıştırarak yayında — mainnet üzerinde dağıtım yaparken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın.
:::

---

## Genel Bakış

QoreChain RDK, geliştiricilerin QoreChain üzerinde mutabakat (settle) sağlayan egemen (sovereign) rollup'lar başlatmasına olanak tanır. Her rollup, kendi blok süresine, sanal makinesine ve ücret modeline sahip bağımsız bir yürütme ortamıdır ve aynı zamanda QoreChain'in güvenlik ve veri kullanılabilirliği garantilerini devralır.

---

## Hazır Profiller

RDK, her biri yaygın bir uygulama kategorisi için ayarlanmış beş hazır profille birlikte gelir:

| Profil         | Mutabakat (kanıt)   | Sequencer | DA              | Gas modeli   | VM       | Hedeflenen kullanım senaryosu |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi/AMM uygulamaları (borç verme, DEX'ler, türevler) |
| **gaming**     | based               | based     | native          | flat         | custom   | Yüksek verimli oyun durumu ve gerçek zamanlı deneyimler |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planlanıyor) | standard | CosmWasm | NFT basımı ve pazaryeri iş yükleri |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Sponsorlu ücretlerle izinli ve konsorsiyum dağıtımları |
| **custom**     | tamamen parametreli | tamamen parametreli | tamamen parametreli | tamamen parametreli | tamamen parametreli | Her alanı kendiniz ayarlayın |

:::note
Yukarıdaki profil başına değerler, dağıtılan `@qorechain/rdk` profil varsayılanlarıyla eşleşir. RDK olgunlaştıkça tam yapılandırma gelişebilir — yetkili değerleri `qorechaind query rdk config` (veya `RdkClient.params()`) ile sorgulayın ve `based` mutabakatın her zaman `based` sequencer moduyla eşleştiğini unutmayın.
:::

---

## Gereksinimler

Bir rollup dağıtmadan önce aşağıdaki gereksinimleri karşıladığınızdan emin olun:

| Gereksinim         | Ayrıntılar                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| **Asgari Stake**   | 10.000 QOR (10.000.000.000 uqor)                                                       |
| **Oluşturma Yakması** | Stake edilen tutarın %1'i rollup oluşturma sırasında kalıcı olarak yakılır           |
| **Hesap**          | Stake artı işlem ücretleri için yeterli bakiyeye sahip, fonlanmış bir QoreChain hesabı |

---

## Hazır Profilden Rollup Oluşturma

Hazır profillerden birini kullanarak bir rollup dağıtın:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:** Bir gaming rollup'ı dağıtın:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Özel Rollup Oluşturma

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

| Parametre      | Seçenekler                                    | Açıklama                            |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Durum geçişlerinin nasıl doğrulandığı |
| `--sequencer`  | `dedicated`, `shared`, `based`                | İşlem sıralama stratejisi          |
| `--da-backend` | `native`, `external`                          | Veri kullanılabilirliği katmanı    |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Yürütme ortamı                     |
| `--block-time` | Tam sayı (milisaniye)                         | Hedef blok üretim aralığı          |

---

## Batch Gönderme

Rollup operatörleri, mutabakat için QoreChain'e işlem batch'leri gönderir:

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
Bir rollup'ı durdurmak kalıcıdır. İlişkili tüm durum arşivlenir ancak rollup yeniden başlatılamaz. Stake edilen QOR (oluşturma yakması düşülerek) operatöre iade edilir.
:::

---

## Rollup'ları Sorgulama

Belirli bir rollup hakkında ayrıntı alın:

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

Hangi profilin kullanım senaryonuza uyduğundan emin değil misiniz? QCAI destekli öneri aracını kullanın:

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

Bu komut, açıklamanızı analiz eder ve bir açıklama ile birlikte en uygun hazır profili önerir.

---

## İpuçları

* Bir hazır profille başlayın ve daha sonra özelleştirin. Hazır profiller, hedef kullanım senaryoları için optimize edilmiştir.
* %1'lik oluşturma yakması, dağıtım sırasında asgari stake'e uygulanan tek seferlik bir maliyettir.
* Sıralamayı QoreChain doğrulayıcılarının yönettiği en basit kurulumu istiyorsanız `based` mutabakatı kullanın.
* Batch gönderimlerini yakından izleyin. Batch gönderimindeki boşluklar ağdan uyarıları tetikleyebilir.
* `suggest-profile` komutu yararlı bir başlangıç noktasıdır, ancak öneriyi kendi özel gereksinimlerinize göre gözden geçirin.
