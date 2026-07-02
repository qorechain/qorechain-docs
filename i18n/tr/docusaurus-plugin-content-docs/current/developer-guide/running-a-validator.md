---
slug: /developer-guide/running-a-validator
title: Doğrulayıcı Çalıştırma
sidebar_label: Doğrulayıcı Çalıştırma
sidebar_position: 9
---

# Doğrulayıcı Çalıştırma

Bu kılavuz, QoreChain ağında bir doğrulayıcı oluşturmayı, havuz sınıflandırma sistemini anlamayı, kuantum dirençli güvenlik için bir PQC anahtarı kaydetmeyi ve düğümünüzü izlemeyi kapsar.

:::note
Bu kılavuz, 7 Haziran 2026'dan bu yana **v3.1.82** zincir sürümüyle canlı olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedefler. Canlıya geçmeden önce kurulumunuzun provasını yapmak için **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) önerilir. Hedef ağınıza uygun `--chain-id` değerini kullanın.
:::

---

## Ön Koşullar

* Tam senkronize olmuş bir `qorechaind` düğümü (bkz. [Test Ağına Bağlanma](/getting-started/connecting-to-testnet))
* İlk öz delegasyon için en az **1.000 QOR** (1.000.000.000 uqor) bakiyesi bulunan bir hesap
* [Staking ve Delegasyon](/user-guide/staking-and-delegation) modeline aşinalık

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

| Parametre                      | Açıklama                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| `--amount`                     | Öz delegasyon miktarı (asgari stake)                         |
| `--pubkey`                     | Doğrulayıcı konsensüs açık anahtarı (ed25519)                |
| `--moniker`                    | Doğrulayıcınız için okunabilir bir ad                        |
| `--commission-rate`            | Başlangıç komisyon oranı (örn. 0.10 = %10)                   |
| `--commission-max-rate`        | Azami komisyon oranı (oluşturulduktan sonra değiştirilemez)  |
| `--commission-max-change-rate` | Günlük azami komisyon değişim oranı                          |
| `--min-self-delegation`        | Operatörün öz delege etmesi gereken asgari token miktarı     |

İşlem onaylandıktan sonra doğrulayıcınızı doğrulayın:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Havuz Sınıflandırması

QoreChain, `x/qca` (Quantum Consensus Allocation) modülü tarafından yönetilen **üç havuzlu bir sınıflandırma sistemi** kullanır. Her **1.000 blokta** bir, doğrulayıcılar itibarlarına ve stake miktarlarına göre üç havuzdan birine yeniden sınıflandırılır:

| Havuz                                | Kriterler                                              | Blok Tahsisi     |
| ------------------------------------ | ------------------------------------------------------ | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | İtibar >= 70. yüzdelik dilim VE stake >= medyan        | Blokların %40'ı  |
| **DPoS** (Delegated Proof-of-Stake)  | Toplam delegasyon >= 10.000 QOR                        | Blokların %35'i  |
| **PoS** (Proof-of-Stake)             | Kalan tüm aktif doğrulayıcılar                         | Blokların %25'i  |

Her havuzun içinde, blok önericileri etkin stake'leriyle orantılı **ağırlıklı rastgele seçim** ile belirlenir. Bu sınıflandırma, hem yüksek itibarlı hem de yüksek delegasyonlu doğrulayıcıların adil temsil almasını sağlarken, daha küçük doğrulayıcıların da katılımına imkan tanır.

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

## Bonding Eğrisi

Bir doğrulayıcının staking ödülü, birden fazla faktörü içeren bir bonding eğrisiyle belirlenir:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                       |
| -------- | -------------------------------------------------------------- |
| `R`      | Ödül miktarı                                                    |
| `beta`   | Taban ödül oranı                                                |
| `S`      | Etkin stake                                                     |
| `alpha`  | Sadakat ölçekleme sabiti                                        |
| `L`      | Sadakat süresi (kesintisiz staking süresi)                      |
| `Q(r)`   | İtibar kalite faktörü, aralık \[0.75 - 1.25]                    |
| `P(t)`   | Protokol faz çarpanı (ağın yaşam döngüsü boyunca ayarlanır)     |

**Öne çıkan noktalar:**

* **Sadakat süresi bonusu:** Kesintisiz stake eden doğrulayıcılar, logaritmik sadakat terimi sayesinde giderek artan ödüller alır. Bu, uzun vadeli bağlılığı teşvik eder.
* **İtibar kalite faktörü:** 0.75 (düşük itibar) ile 1.25 (mükemmel itibar) arasında değişir. İtibar; çalışma süresi, başarılı öneriler, topluluk katılımı ve işlem doğrulama kalitesinden hesaplanır.
* **Protokol faz çarpanı:** Ağ farklı fazlardan (başlangıç, büyüme, olgunluk) geçerek olgunlaştıkça ayarlanır.

---

## Kademeli Slashing

QoreChain, tekrarlayan ihlalciler için cezaları artıran ve aynı zamanda doğrulayıcıların zaman içinde toparlanmasına izin veren bir **kademeli slashing** modeli kullanır:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametre                       | Değer          |
| ------------------------------- | -------------- |
| Olay başına azami ceza          | Stake'in %33'ü |
| Azalma yarı ömrü                | 100.000 blok   |
| Çevrimdışı kalma şiddeti        | 1.0            |
| Çift imzalama şiddeti           | 2.0            |
| Hafif istemci saldırısı şiddeti | 3.0            |

1. **Her ihlal etkin sayacı artırır.** Her ihlal (çevrimdışı kalma, çift imzalama vb.), gelecekteki cezaları etkileyen etkin sayacı yükseltir.

2. **Ceza üstel olarak artar.** Ceza, yukarıdaki formülle etkin sayaca bağlı olarak artar; böylece tekrarlayan ihlalciler çok daha büyük cezalarla karşılaşır.

3. **Etkin sayaç zamanla azalır.** Etkin sayaç, 100.000 bloklık bir yarı ömürle (6 saniyelik bloklarla \~7 gün) azalır ve doğrulayıcıların iyi davranış döneminden sonra toparlanmasına olanak tanır.

4. **Tekil olaylar ile tekrarlayan ihlaller.** Tek seferlik kazara bir çevrimdışı kalma olayı küçük bir cezayla sonuçlanırken, tekrarlayan ihlaller üstel olarak artan yaptırımları tetikler.

---

## PQC Anahtar Kaydı

Doğrulayıcılar, ML-DSA-87 algoritmasını kullanarak isteğe bağlı olarak bir **kuantum sonrası kriptografik (PQC) açık anahtar** kaydedebilir. Bu, doğrulayıcı kimliği için kuantum dirençli güvenlik sağlar ve hibrit imzalama için kullanılabilir.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametre      | Açıklama                                              |
| -------------- | ----------------------------------------------------- |
| `<pubkey-hex>` | Hex kodlamalı 2592 baytlık ML-DSA-87 açık anahtarı    |
| `hybrid`       | Kayıt modu (hybrid = klasik + PQC birlikte)           |

Kaydı doğrulayın:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Öneri:** PQC anahtar kaydı isteğe bağlıdır, ancak ana ağda çalışan doğrulayıcılar için şiddetle önerilir. Kuantum bilişim tehditlerine karşı ileriye dönük bir savunma sağlar.
:::

---

## İzleme

### Prometheus Metrikleri

QoreChain, Prometheus metriklerini **26660** portunda sunar:

```
http://localhost:26660/metrics
```

İzlenmesi gereken temel metrikler:

| Metrik                          | Açıklama                                            |
| ------------------------------- | --------------------------------------------------- |
| `qorechain_missed_blocks_total` | Doğrulayıcınızın kaçırdığı toplam blok sayısı       |
| `qorechain_validator_uptime`    | Son N blok üzerinden çalışma süresi yüzdesi         |
| `qorechain_reputation_score`    | Mevcut itibar puanı                                 |
| `qorechain_pool_classification` | Mevcut havuz ataması (0=PoS, 1=DPoS, 2=RPoS)        |
| `qorechain_consecutive_signed`  | Ardışık imzalanan bloklar                           |
| `consensus_height`              | Mevcut blok yüksekliği                              |
| `consensus_rounds`              | Mevcut yükseklik için konsensüs turları             |

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

1. **Sentry düğüm mimarisi kullanın.** Doğrulayıcınızı DDoS saldırılarından korumak için sentry düğümlerinin arkasında çalıştırın. Genel ağa yalnızca sentry düğümlerini açın.

2. **Uyarı sistemi kurun.** Kaçırılan bloklar, düşük çalışma süresi ve beklenmedik yeniden başlatmalar için uyarılar yapılandırın. Birkaç kaçırılan blok normaldir; süreklilik gösteren kaçırmalar slashing'i tetikler.

3. **Yüksek çalışma süresini koruyun.** İtibar sistemi tutarlı çalışma süresini ödüllendirir. Uzun süreli kesintiler itibar kalite faktörünüzü düşürerek ödüllerinizi azaltır.

4. **Yazılımı güncel tutun.** QoreChain sürümlerini takip edin ve güncellemeleri hızla uygulayın. Zincir yükseltmeleri için doğrulayıcı topluluğuyla koordineli çalışın.

5. **Anahtarlarınızı güvence altına alın.** Doğrulayıcı konsensüs anahtarı için bir donanım güvenlik modülü (HSM) veya uzak imzalayıcı kullanın. Anahtarları asla düğümle aynı makinede saklamayın.

6. **Bir PQC anahtarı kaydedin.** Bir ML-DSA-87 anahtarı kaydederek doğrulayıcınızı kuantum tehditlerine karşı geleceğe hazırlayın.

7. **Havuzunuzu izleyin.** Havuz sınıflandırmanızı her 1.000 blokta bir takip edin. İtibarınızı iyileştirmek sizi PoS'tan RPoS'a taşıyarak blok önerme fırsatlarınızı önemli ölçüde artırabilir.

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

## Bağlı Ağların Doğrulanması {#connected-networks}

Zincir sürümü **v3.1.80** itibarıyla bir QoreChain doğrulayıcısı, [köprü](/architecture/bridge-architecture) üzerinden bağlanan ağların doğrulanmasına da yardımcı olabilir. Bu özellik **lisans kapılı ve isteğe bağlıdır**:

1. **Lisansa sahip olun.** Doğrulayıcı, hedef ağ için aktif bir `validator_<chain>` (veya `qcb_bridge`) lisansına sahip olmalıdır. Orkestratör, bu lisans olmadan harici bir istemciyi başlatmayı reddeder (varsayılan-kapalı).
2. **Aktivasyon, istemciyi otomatik olarak sağlar.** Lisans etkinleştirildiğinde QoreChain, eşleşen ağın istemcisini düğümünüzde sağlar — sabitlenmiş istemciyi indirir, yapılandırmasını oluşturur ve QoreChain orkestrasyonu altında çalıştırır. Aktivasyondan önce hiçbir şey indirilmez.
3. **Ağın anahtarlarını ve stake'ini siz sağlayın.** Harici ağın doğrulayıcı/stake ve imzalama anahtarları ağ başına **operatör tarafından sağlanır**; QoreChain, sürücü çerçevesini ve zorunlu lisans kapısını sunar, harici zincirdeki stake'inizi değil.

Sürücüler, bir doğrulayıcının nasıl katılabileceğine göre sınıflandırılmış **37 köprü ağının** tamamı için mevcuttur:

| Sınıf | Katılım | Örnekler |
| ----- | ------- | -------- |
| İzinsiz (permissionless) doğrulayıcı | Stake edin ve çalıştırın | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Sınırlı / seçimli / kabullü | Stake edin, üst sınıra veya seçime tabidir | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 tam düğüm | Tam düğüm çalıştırın (staking yok) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Staking'siz / güven listesi | Staking olmadan gözlemleyin / katılın | Bitcoin, Filecoin, XRPL, Stellar |

:::note
İstemci sürüm sabitlemeleri en iyi çaba (best-effort) esasına dayanır; üretim aktivasyonundan önce hedef ağınız için üst kaynak istemci sürümünü doğrulayın.
:::

## Sonraki Adımlar

* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde akıllı sözleşmeler dağıtın
* [Hesap Soyutlama](/developer-guide/account-abstraction) — Doğrulayıcı operasyonlarınız için programlanabilir hesaplar
