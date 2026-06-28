---
slug: /developer-guide/running-a-validator
title: Doğrulayıcı Çalıştırma
sidebar_label: Doğrulayıcı Çalıştırma
sidebar_position: 9
---

# Doğrulayıcı Çalıştırma

Bu kılavuz, QoreChain ağında nasıl doğrulayıcı oluşturulacağını, havuz sınıflandırma sisteminin nasıl anlaşılacağını, kuantuma dayanıklı güvenlik için bir PQC anahtarının nasıl kaydedileceğini ve düğümünüzün nasıl izleneceğini ele alır.

:::note
Bu kılavuz, 7 Haziran 2026'dan beri **v3.1.80** zincir sürümüyle çalışan ve canlı olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedefler. Canlıya geçmeden önce kurulumunuzun provasını yapmak için **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) önerilir. Hedef ağınız için uygun `--chain-id` değerini yerine koyun.
:::

---

## Ön Koşullar

* Tam olarak senkronize edilmiş bir `qorechaind` düğümü (bkz. [Test Ağına Bağlanma](/getting-started/connecting-to-testnet))
* İlk öz-delege için en az **1.000 QOR** (1.000.000.000 uqor) bulunan, bakiyesi yüklü bir hesap
* [Stake Etme ve Delegasyon](/user-guide/staking-and-delegation) modeline aşinalık

---

## Doğrulayıcı Oluşturma

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Parametre                      | Açıklama                                              |
| ------------------------------ | ---------------------------------------------------- |
| `--amount`                     | Öz-delege miktarı (minimum stake)                    |
| `--pubkey`                     | Doğrulayıcı uzlaşma açık anahtarı (ed25519)          |
| `--moniker`                    | Doğrulayıcınız için insan tarafından okunabilir ad   |
| `--commission-rate`            | İlk komisyon oranı (örn. 0.10 = %10)                 |
| `--commission-max-rate`        | Maksimum komisyon oranı (oluşturmadan sonra değişmez)|
| `--commission-max-change-rate` | Maksimum günlük komisyon değişim oranı               |
| `--min-self-delegation`        | Operatörün öz-delege etmesi gereken minimum token    |

İşlem onaylandıktan sonra doğrulayıcınızı doğrulayın:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Havuz Sınıflandırması

QoreChain, `x/qca` (Quantum Consensus Allocation) modülü tarafından yönetilen bir **üç havuzlu sınıflandırma sistemi** kullanır. Her **1.000 blokta** bir, doğrulayıcılar itibarlarına ve stake'lerine göre üç havuzdan birine yeniden sınıflandırılır:

| Havuz                                | Kriterler                                            | Blok Tahsisi      |
| ------------------------------------ | ---------------------------------------------------- | ----------------- |
| **RPoS** (Reputation Proof-of-Stake) | İtibar >= 70. yüzdelik VE stake >= medyan            | Blokların %40'ı   |
| **DPoS** (Delegated Proof-of-Stake)  | Toplam delegasyon >= 10.000 QOR                      | Blokların %35'i   |
| **PoS** (Proof-of-Stake)             | Kalan tüm aktif doğrulayıcılar                       | Blokların %25'i   |

Her havuz içinde, blok önerenler etkin stake'leriyle orantılı **ağırlıklı rastgele seçim** kullanılarak seçilir. Bu sınıflandırma, hem yüksek itibarlı hem de yüksek delegasyonlu doğrulayıcıların adil temsil edilmesini sağlarken, daha küçük doğrulayıcıların da katılımına olanak tanır.

### Havuz Sınıflandırmanızı Sorgulama

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC üzerinden:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Bağlanma Eğrisi

Bir doğrulayıcı için stake etme ödülü, birden fazla faktörü içeren bir bağlanma eğrisiyle belirlenir:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                       |
| -------- | ------------------------------------------------------------- |
| `R`      | Ödül miktarı                                                  |
| `beta`   | Temel ödül oranı                                              |
| `S`      | Etkin stake                                                   |
| `alpha`  | Sadakat ölçeklendirme sabiti                                  |
| `L`      | Sadakat süresi (kesintisiz stake etme süresi)                |
| `Q(r)`   | İtibar kalite faktörü, aralık \[0.75 - 1.25]                 |
| `P(t)`   | Protokol aşaması çarpanı (ağ yaşam döngüsü boyunca ayarlanır)|

**Önemli noktalar:**

* **Sadakat süresi bonusu:** Kesintisiz stake eden doğrulayıcılar, logaritmik sadakat terimi aracılığıyla artan ödüller alır. Bu, uzun vadeli bağlılığı teşvik eder.
* **İtibar kalite faktörü:** 0.75 (zayıf itibar) ile 1.25 (mükemmel itibar) arasında değişir. İtibar; çalışma süresi, başarılı öneriler, topluluk katılımı ve işlem doğrulama kalitesinden hesaplanır.
* **Protokol aşaması çarpanı:** Ağ farklı aşamalardan (önyükleme, büyüme, olgunluk) geçerek olgunlaştıkça ayarlanır.

---

## Aşamalı Kesinti (Slashing)

QoreChain, doğrulayıcıların zaman içinde toparlanmasına izin verirken tekrar eden ihlalciler için cezaları artıran bir **aşamalı kesinti (progressive slashing)** modeli kullanır:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametre                        | Değer            |
| -------------------------------- | ---------------- |
| Olay başına maksimum ceza        | Stake'in %33'ü   |
| Bozunma yarı ömrü                | 100.000 blok     |
| Çevrimdışı kalma ciddiyeti       | 1.0              |
| Çift imza ciddiyeti              | 2.0              |
| Hafif istemci saldırısı ciddiyeti| 3.0              |

1. **Her ihlal etkin sayacı artırır.** Her ihlal (çevrimdışı kalma, çift imza vb.) doğrulayıcının etkin sayacını artırır ve bu da gelecekteki cezaları etkiler.

2. **Ceza katlanarak artar.** Ceza, yukarıdaki formül kullanılarak etkin sayaca göre artar, bu nedenle tekrar eden ihlalciler çok daha büyük cezalarla karşılaşır.

3. **Etkin sayaç zaman içinde azalır.** Etkin sayaç, 100.000 bloklik bir yarı ömürle (6 sn'lik bloklarda \~7 gün) azalır ve doğrulayıcıların bir süre iyi davranışın ardından toparlanmasına olanak tanır.

4. **Tek olaylar ile tekrarlanan ihlaller.** Tek bir kazara çevrimdışı kalma olayı küçük bir cezaya neden olurken, tekrarlanan ihlaller katlanarak artan sonuçları tetikler.

---

## PQC Anahtar Kaydı

Doğrulayıcılar, ML-DSA-87 algoritmasını kullanarak isteğe bağlı olarak bir **kuantum sonrası kriptografik (PQC) açık anahtar** kaydedebilir. Bu, doğrulayıcı kimliği için kuantuma dayanıklı güvenlik sağlar ve melez imzalama için kullanılabilir.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametre      | Açıklama                                              |
| -------------- | ---------------------------------------------------- |
| `<pubkey-hex>` | Hex kodlamasında 2592 baytlık ML-DSA-87 açık anahtarı|
| `hybrid`       | Kayıt modu (hybrid = hem klasik hem PQC)             |

Kaydı doğrulayın:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Öneri:** PQC anahtar kaydı isteğe bağlıdır ancak ana ağda çalışan doğrulayıcılar için şiddetle önerilir. Kuantum hesaplama tehditlerine karşı ileriye dönük bir savunma sağlar.
:::

---

## İzleme

### Prometheus Metrikleri

QoreChain, Prometheus metriklerini **26660** numaralı bağlantı noktasında sunar:

```
http://localhost:26660/metrics
```

İzlenecek önemli metrikler:

| Metrik                          | Açıklama                                            |
| ------------------------------- | --------------------------------------------------- |
| `qorechain_missed_blocks_total` | Doğrulayıcınızın kaçırdığı toplam blok sayısı       |
| `qorechain_validator_uptime`    | Son N blok üzerindeki çalışma süresi yüzdesi        |
| `qorechain_reputation_score`    | Mevcut itibar puanı                                 |
| `qorechain_pool_classification` | Mevcut havuz ataması (0=PoS, 1=DPoS, 2=RPoS)        |
| `qorechain_consecutive_signed`  | Art arda imzalanan bloklar                          |
| `consensus_height`              | Mevcut blok yüksekliği                              |
| `consensus_rounds`              | Mevcut yükseklik için uzlaşma turları              |

### İtibar Puanını Sorgulama

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC üzerinden:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Sağlık Kontrolleri

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Operasyonel En İyi Uygulamalar

1. **Bir sentinel düğüm (sentry node) mimarisi kullanın.** Doğrulayıcınızı DDoS saldırılarından korumak için onu sentinel düğümlerinin arkasında çalıştırın. Yalnızca sentinel düğümlerini genel ağa açın.

2. **Uyarı sistemi kurun.** Kaçırılan bloklar, düşük çalışma süresi ve beklenmedik yeniden başlatmalar için uyarılar yapılandırın. Birkaç kaçırılan blok normaldir; sürekli kaçırmalar kesintiyi tetikler.

3. **Yüksek çalışma süresini koruyun.** İtibar sistemi tutarlı çalışma süresini ödüllendirir. Uzun süreli çevrimdışı kalma, itibar kalite faktörünüzü düşürerek ödülleri azaltır.

4. **Yazılımı güncel tutun.** QoreChain sürümlerini takip edin ve güncellemeleri hemen uygulayın. Zincir yükseltmeleri için doğrulayıcı topluluğuyla koordineli hareket edin.

5. **Anahtarlarınızı güvende tutun.** Doğrulayıcı uzlaşma anahtarı için bir donanım güvenlik modülü (HSM) veya uzak imzalayıcı kullanın. Anahtarları asla düğümle aynı makinede saklamayın.

6. **Bir PQC anahtarı kaydedin.** Bir ML-DSA-87 anahtarı kaydederek doğrulayıcınızı kuantum tehditlerine karşı geleceğe hazırlayın.

7. **Havuzunuzu izleyin.** Her 1.000 blokta bir havuz sınıflandırmanızı takip edin. İtibarınızı artırmak sizi PoS'tan RPoS'a taşıyabilir ve blok önerme fırsatlarını önemli ölçüde artırabilir.

---

## Doğrulayıcı Komutları Referansı

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Bağlı Ağları Doğrulama {#connected-networks}

Zincir sürümü **v3.1.80** itibarıyla, bir QoreChain doğrulayıcısı, [köprü](/architecture/bridge-architecture) aracılığıyla bağlanan ağların doğrulanmasına da yardımcı olabilir. Bu, **lisans kapılı ve isteğe bağlıdır (opt-in)**:

1. **Lisansı bulundurun.** Doğrulayıcının, hedef ağ için aktif bir `validator_<chain>` (veya `qcb_bridge`) lisansına sahip olması gerekir. Orkestratör, bu olmadan harici bir istemci başlatmayı reddeder (fail-closed).
2. **Etkinleştirme istemciyi otomatik sağlar.** Lisans etkinleştirildiğinde, QoreChain düğümünüzde eşleşen ağın istemcisini sağlar — sabitlenmiş istemciyi indirir, yapılandırmasını oluşturur ve onu QoreChain'in orkestrasyonu altında çalıştırır. Etkinleştirilene kadar hiçbir şey indirilmez.
3. **Ağın anahtarlarını ve stake'ini sağlayın.** Harici ağın doğrulayıcı/stake ve imzalama anahtarları ağ başına **operatör tarafından sağlanır**; QoreChain, harici zincir stake'inizi değil, sürücü çerçevesini ve uygulanan lisans kapısını sunar.

Bir doğrulayıcının nasıl katılabileceğine göre sınıflandırılan **37 köprü ağının** tümü için sürücüler mevcuttur:

| Sınıf | Katılım | Örnekler |
| ----- | ------- | -------- |
| İzinsiz doğrulayıcı | Stake et ve çalıştır | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Tavanlı / seçilmiş / kabul | Stake et, bir tavana veya seçime tabi | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 tam düğüm | Bir tam düğüm çalıştır (stake yok) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Stake etmeyen / güven listesi | Stake etmeden gözlemle / katıl | Bitcoin, Filecoin, XRPL, Stellar |

:::note
İstemci sürümü sabitlemeleri en iyi çaba esasına dayanır; bir üretim etkinleştirmesinden önce hedef ağınız için yukarı akış istemci sürümünü doğrulayın.
:::

## Sonraki Adımlar

* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde akıllı sözleşmeler dağıtın
* [Hesap Soyutlama](/developer-guide/account-abstraction) — Doğrulayıcı işlemleriniz için programlanabilir hesaplar
