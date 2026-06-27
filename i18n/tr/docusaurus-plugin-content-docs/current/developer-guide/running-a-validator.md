---
slug: /developer-guide/running-a-validator
title: Doğrulayıcı Çalıştırma
sidebar_label: Doğrulayıcı Çalıştırma
sidebar_position: 9
---

# Doğrulayıcı Çalıştırma

Bu kılavuz, QoreChain ağında nasıl doğrulayıcı oluşturulacağını, havuz sınıflandırma sisteminin nasıl anlaşılacağını, kuantuma dirençli güvenlik için bir PQC anahtarının nasıl kaydedileceğini ve düğümünüzü nasıl izleyeceğinizi kapsar.

:::note
Bu kılavuz, 7 Haziran 2026'dan beri **v3.1.77** zincir sürümünü çalıştırarak yayında olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedefler. Yayına geçmeden önce kurulumunuzu prova etmek için **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) önerilir. Hedef ağınız için uygun `--chain-id` değerini kullanın.
:::

---

## Ön Koşullar

* Tamamen senkronize edilmiş bir `qorechaind` düğümü ([Test Ağına Bağlanma](/getting-started/connecting-to-testnet) bölümüne bakın)
* İlk öz-delegasyon için en az **1.000 QOR** (1.000.000.000 uqor) bulunan fonlanmış bir hesap
* [Stake ve Delegasyon](/user-guide/staking-and-delegation) modeline aşinalık

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

| Parametre                      | Açıklama                                        |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Öz-delegasyon miktarı (minimum stake)             |
| `--pubkey`                     | Doğrulayıcı konsensüs açık anahtarı (ed25519)           |
| `--moniker`                    | Doğrulayıcınız için okunabilir ad             |
| `--commission-rate`            | İlk komisyon oranı (örn. 0.10 = %10)         |
| `--commission-max-rate`        | Maksimum komisyon oranı (oluşturduktan sonra değişmez) |
| `--commission-max-change-rate` | Maksimum günlük komisyon değişim oranı               |
| `--min-self-delegation`        | Operatörün öz-delegasyon yapması gereken minimum jeton     |

İşlem onaylandıktan sonra, doğrulayıcınızı doğrulayın:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Havuz Sınıflandırması

QoreChain, `x/qca` (Quantum Consensus Allocation) modülü tarafından yönetilen bir **üç havuzlu sınıflandırma sistemi** kullanır. Her **1.000 blokta** doğrulayıcılar, itibar ve stake değerlerine göre üç havuzdan birine yeniden sınıflandırılır:

| Havuz                                 | Kriter                                          | Blok Tahsisi |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | İtibar >= 70. yüzdelik VE stake >= medyan | Blokların %40'ı    |
| **DPoS** (Delegated Proof-of-Stake)  | Toplam delegasyon >= 10.000 QOR                    | Blokların %35'i    |
| **PoS** (Proof-of-Stake)             | Kalan tüm aktif doğrulayıcılar                   | Blokların %25'i    |

Her havuzda, blok önericileri etkin stake'leriyle orantılı **ağırlıklı rastgele seçim** kullanılarak seçilir. Bu sınıflandırma, hem yüksek itibarlı hem de yüksek delegasyonlu doğrulayıcıların adil temsil görmesini sağlarken, daha küçük doğrulayıcıların da katılmasına izin verir.

### Havuz Sınıflandırmanızı Sorgulama

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC aracılığıyla:

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

Bir doğrulayıcının stake ödülü, birden çok faktörü içeren bir bağlanma eğrisiyle belirlenir:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                |
| -------- | ---------------------------------------------------------- |
| `R`      | Ödül miktarı                                              |
| `beta`   | Temel ödül oranı                                           |
| `S`      | Etkin stake                                             |
| `alpha`  | Sadakat ölçekleme sabiti                                   |
| `L`      | Sadakat süresi (sürekli stake etme süresi)                 |
| `Q(r)`   | İtibar kalite faktörü, aralık \[0.75 - 1.25]            |
| `P(t)`   | Protokol fazı çarpanı (ağ yaşam döngüsü boyunca ayarlanır) |

**Önemli noktalar:**

* **Sadakat süresi bonusu:** Sürekli stake eden doğrulayıcılar, logaritmik sadakat terimi aracılığıyla artan ödüller alır. Bu, uzun vadeli bağlılığı teşvik eder.
* **İtibar kalite faktörü:** 0.75 (kötü itibar) ile 1.25 (mükemmel itibar) arasında değişir. İtibar; çalışma süresi, başarılı öneriler, topluluk katılımı ve işlem doğrulama kalitesinden hesaplanır.
* **Protokol fazı çarpanı:** Ağ farklı fazlardan (önyükleme, büyüme, olgunluk) geçerek olgunlaştıkça ayarlanır.

---

## Aşamalı Slashing

QoreChain, tekrar eden ihlalciler için cezaları artırırken doğrulayıcıların zamanla toparlanmasına izin veren bir **aşamalı slashing** modeli kullanır:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametre                    | Değer          |
| ---------------------------- | -------------- |
| Olay başına maksimum ceza    | Stake'in %33'ü   |
| Bozunma yarı ömrü              | 100.000 blok |
| Çalışmama süresi şiddeti            | 1.0            |
| Çift imza şiddeti         | 2.0            |
| Hafif istemci saldırısı şiddeti | 3.0            |

1. **Her ihlal etkin sayacı artırır.** Her ihlal (çalışmama süresi, çift imza vb.) doğrulayıcının etkin sayacını artırır ve bu gelecekteki cezaları etkiler.

2. **Ceza üstel olarak artar.** Ceza, yukarıdaki formülü kullanarak etkin sayaca göre artar; bu nedenle tekrar eden ihlalciler çok daha büyük cezalarla karşılaşır.

3. **Etkin sayaç zamanla bozunur.** Etkin sayaç, 100.000 bloklik bir yarı ömürle (6 sn'lik bloklarda \~7 gün) bozunur ve doğrulayıcıların iyi davranış döneminin ardından toparlanmasına izin verir.

4. **Tek olaylar ile tekrar eden ihlaller.** Tek bir kazara çalışmama olayı küçük bir cezayla sonuçlanırken, tekrar eden ihlaller üstel olarak artan sonuçları tetikler.

---

## PQC Anahtar Kaydı

Doğrulayıcılar, ML-DSA-87 algoritmasını kullanarak isteğe bağlı olarak bir **kuantum sonrası kriptografik (PQC) açık anahtar** kaydedebilir. Bu, doğrulayıcı kimliği için kuantuma dirençli güvenlik sağlar ve hibrit imzalama için kullanılabilir.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametre      | Açıklama                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | hex kodlamasında 2592 baytlık ML-DSA-87 açık anahtarı    |
| `hybrid`       | Kayıt modu (hibrit = hem klasik + PQC) |

Kaydı doğrulayın:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Öneri:** PQC anahtar kaydı isteğe bağlıdır ancak ana ağda çalışan doğrulayıcılar için şiddetle önerilir. Kuantum bilişim tehditlerine karşı ileriye dönük bir savunma sağlar.
:::

---

## İzleme

### Prometheus Metrikleri

QoreChain, Prometheus metriklerini **26660** portunda sunar:

```
http://localhost:26660/metrics
```

İzlenecek temel metrikler:

| Metrik                          | Açıklama                                     |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | Doğrulayıcınızın kaçırdığı toplam blok           |
| `qorechain_validator_uptime`    | Son N blok üzerindeki çalışma süresi yüzdesi        |
| `qorechain_reputation_score`    | Mevcut itibar puanı                        |
| `qorechain_pool_classification` | Mevcut havuz ataması (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Art arda imzalanan bloklar                   |
| `consensus_height`              | Mevcut blok yüksekliği                            |
| `consensus_rounds`              | Mevcut yükseklik için konsensüs turları             |

### İtibar Puanını Sorgulama

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC aracılığıyla:

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

1. **Sentry düğüm mimarisi kullanın.** DDoS saldırılarından korumak için doğrulayıcınızı sentry düğümlerinin arkasında çalıştırın. Yalnızca sentry düğümlerini genel ağa açın.

2. **Uyarı kurun.** Kaçırılan bloklar, düşük çalışma süresi ve beklenmeyen yeniden başlatmalar için uyarılar yapılandırın. Birkaç kaçırılan blok normaldir; sürekli kaçırmalar slashing tetikler.

3. **Yüksek çalışma süresi koruyun.** İtibar sistemi tutarlı çalışma süresini ödüllendirir. Uzun süreli çalışmama, itibar kalite faktörünüzü düşürerek ödülleri azaltır.

4. **Yazılımı güncel tutun.** QoreChain sürümlerini takip edin ve güncellemeleri zamanında uygulayın. Zincir yükseltmeleri için doğrulayıcı topluluğuyla koordineli olun.

5. **Anahtarlarınızı güvenceye alın.** Doğrulayıcı konsensüs anahtarı için bir donanım güvenlik modülü (HSM) veya uzak imzalayıcı kullanın. Anahtarları asla düğümle aynı makinede saklamayın.

6. **Bir PQC anahtarı kaydedin.** Bir ML-DSA-87 anahtarı kaydederek doğrulayıcınızı kuantum tehditlerine karşı geleceğe hazırlayın.

7. **Havuzunuzu izleyin.** Havuz sınıflandırmanızı her 1.000 blokta takip edin. İtibarınızı iyileştirmek sizi PoS'tan RPoS'a taşıyabilir ve blok öneri fırsatlarınızı önemli ölçüde artırabilir.

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

## Sonraki Adımlar

* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain'de akıllı sözleşmeler dağıtın
* [Hesap Soyutlaması](/developer-guide/account-abstraction) — Doğrulayıcı operasyonlarınız için programlanabilir hesaplar
