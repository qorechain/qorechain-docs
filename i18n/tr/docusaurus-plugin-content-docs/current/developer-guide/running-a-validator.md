---
slug: /developer-guide/running-a-validator
title: Doğrulayıcı Çalıştırma
sidebar_label: Doğrulayıcı Çalıştırma
sidebar_position: 9
---

# Doğrulayıcı Çalıştırma

Bu kılavuz, QoreChain ağında bir doğrulayıcı (validator) oluşturmayı, havuz sınıflandırma sistemini anlamayı, kuantuma dayanıklı güvenlik için bir PQC anahtarı kaydetmeyi ve düğüminizi izlemeyi kapsar.

:::note
Bu kılavuz **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedefler; 7 Haziran 2026'dan beri canlı olup **v3.1.95** zincir sürümünü çalıştırır. **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**), canlıya geçmeden önce kurulumunuzu prova etmek için önerilir. Hedef ağınız için uygun `--chain-id` değerini kullanın.
:::

---

## Ön Koşullar

* Tam olarak senkronize edilmiş bir `qorechaind` düğümü (bkz. [Test Ağına Bağlanma](/getting-started/connecting-to-testnet))
* İlk öz-delegasyon için en az **100.000 QOR** (100.000.000.000 uqor) bakiyeli, fonlanmış bir hesap — bu minimum zincir üzerinde zorunlu kılınır ve bunun altında `create-validator` reddedilir
* Hesabınızda etkin bir **`validator_operator` lisansı** — aşağıdaki nota bakın; bu lisans olmadan, ne kadar QOR öz-bağlarsanız bağlayın, `create-validator` `ErrUnauthorized` hatasıyla başarısız olur
* [Staking ve Delegasyon](/user-guide/staking-and-delegation) modeline aşinalık

---

## Doğrulayıcı Oluşturma

### Lisans kontrolü: `validator_operator` {#validator-license-gate}

`create-validator`, ikisi de zincir üzerinde uygulanan iki bağımsız kontrolle kısıtlanır ve ikisine de ihtiyacınız vardır — yalnızca büyük bir öz-bağlama yeterli değildir:

1. **Minimum 100.000 QOR öz-bağlama.**
2. İşlemi gönderen hesapta **etkin bir `validator_operator` lisansı**.

Bir lisansın `expires_at` değeri bir **tarih veya süre değil, bir blok yüksekliğidir** — `0` süresiz geçerlilik anlamına gelir. Lisans eksik veya süresi dolmuşsa, ne kadar öz-bağlama yaparsanız yapın `create-validator` `ErrUnauthorized` hatasıyla başarısız olur; iyi fonlanmış bir denemenin açıklanamaz görünüp başarısız olmasının en yaygın tek nedeni budur. Bu kontrol, özellikle EVM yürütme yolunun bunu görüp uygulayamaması nedeniyle vardır (oradaki tek bir ante dekoratörü bunu tamamen atlar) — staking ve doğrulamanın yalnızca Native yolunda kalmasının nedenlerinden biri de budur.

```bash
qorechaind tx staking create-validator \
  --amount 100000000000uqor \
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
| ------------------------------ | ------------------------------------------------------ |
| `--amount`                     | Öz-delegasyon miktarı — **minimum 100.000 QOR** (`100000000000uqor`) |
| `--pubkey`                     | Doğrulayıcı konsensüs açık anahtarı (ed25519)          |
| `--moniker`                    | Doğrulayıcınız için okunabilir ad                       |
| `--commission-rate`            | Başlangıç komisyon oranı (ör. 0.10 = %10)              |
| `--commission-max-rate`        | Maksimum komisyon oranı (oluşturulduktan sonra değişmez) |
| `--commission-max-change-rate` | Maksimum günlük komisyon değişim oranı                 |
| `--min-self-delegation`        | Operatörün öz-delege etmesi gereken minimum token miktarı |

İşlem onaylandıktan sonra doğrulayıcınızı doğrulayın:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Havuz Sınıflandırması

QoreChain, `x/qca` (Quantum Consensus Allocation) modülü tarafından yönetilen bir **üç havuzlu sınıflandırma sistemi** kullanır. Her **1.000 blokta bir**, doğrulayıcılar itibarlarına ve stake'lerine göre üç havuzdan birine yeniden sınıflandırılır:

| Havuz                                 | Kriter                                              | Blok Tahsisi |
| -------------------------------------- | ---------------------------------------------------- | ------------ |
| **RPoS** (Reputation Proof-of-Stake)   | İtibar >= 70. yüzdelik dilim VE stake >= medyan       | Blokların %40'ı |
| **DPoS** (Delegated Proof-of-Stake)    | Toplam delegasyon >= 10.000 QOR                       | Blokların %35'i |
| **PoS** (Proof-of-Stake)               | Kalan tüm aktif doğrulayıcılar                        | Blokların %25'i |

Her havuz içinde blok önerenler, etkin stake'leri ile orantılı **ağırlıklı rastgele seçim** kullanılarak belirlenir. Bu sınıflandırma, hem yüksek itibarlı hem de yüksek delegasyonlu doğrulayıcıların adil temsil edilmesini sağlarken, daha küçük doğrulayıcıların da katılımına imkân tanır.

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

## Bağlanma Eğrisi (Bonding Curve)

Bir doğrulayıcının staking ödülü, birden fazla faktörü birleştiren bir bağlanma eğrisi ile belirlenir:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                        |
| -------- | ----------------------------------------------------------------- |
| `R`      | Ödül miktarı                                                       |
| `beta`   | Temel ödül oranı                                                   |
| `S`      | Etkin stake                                                        |
| `alpha`  | Sadakat ölçekleme sabiti                                           |
| `L`      | Sadakat süresi (kesintisiz staking süresi)                         |
| `Q(r)`   | İtibar kalite faktörü, aralık \[0.75 - 1.25]                       |
| `P(t)`   | Protokol aşaması çarpanı (ağ yaşam döngüsü boyunca ayarlanır)      |

**Önemli çıkarımlar:**

* **Sadakat süresi bonusu:** Kesintisiz stake yapan doğrulayıcılar, logaritmik sadakat terimi sayesinde artan ödüller alır. Bu, uzun vadeli bağlılığı teşvik eder.
* **İtibar kalite faktörü:** 0.75 (zayıf itibar) ile 1.25 (mükemmel itibar) arasında değişir. İtibar; çalışma süresi, başarılı blok önerileri, topluluk katılımı ve işlem doğrulama kalitesinden hesaplanır.
* **Protokol aşaması çarpanı:** Ağ farklı aşamalardan (başlangıç, büyüme, olgunluk) geçerken ayarlanır.

---

## Slashing

Bu yazının hazırlandığı sırada geçerli olan ve canlı olarak sorgulanabilen temel ihlal cezaları:

```bash
qorechaind query slashing params
```

| Parametre | Değer |
| --- | --- |
| İmzalanan blok penceresi | 10.000 blok (yaklaşık 6 saatte birikir) |
| Pencere başına gereken minimum imza | %95 (bu değerin altı hapse atılır) |
| Çevrimdışı kalma hapis süresi | 600 saniye (10 dakika) |
| Çevrimdışı kalma slashing oranı | Stake'in %1'i |
| Çifte imza slashing oranı | Stake'in %5'i |

Hapse atılma, sabit cezalı 10 dakikalık bir zaman aşımıdır — aşağıdaki kademeli modelden ayrıdır; o model, tekrarlayan ihlaller üzerine daha uzun bir zaman ufkunda ek, artan sonuçlar katmanlar.

## Kademeli Slashing

QoreChain, tekrarlayan ihlallerde cezaları kademeli olarak artıran, ancak doğrulayıcıların zamanla toparlanmasına da izin veren bir **kademeli slashing** modeli kullanır:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametre                       | Değer            |
| --------------------------------- | ----------------- |
| Olay başına maksimum ceza         | Stake'in %33'ü    |
| Yarı ömür (decay half-life)       | 100.000 blok       |
| Çevrimdışı kalma önem derecesi    | 1.0                |
| Çifte imza önem derecesi          | 2.0                |
| Hafif istemci saldırısı önem derecesi | 3.0            |

1. **Her ihlal, etkin sayacı artırır.** Her ihlal (çevrimdışı kalma, çifte imza vb.) doğrulayıcının etkin sayacını artırır ve bu da gelecekteki cezaları etkiler.

2. **Ceza üstel olarak artar.** Ceza, yukarıdaki formüle göre etkin sayaca bağlı olarak artar; bu nedenle tekrar eden ihlaller çok daha büyük cezalarla karşılaşır.

3. **Etkin sayaç zamanla azalır.** Etkin sayaç, 100.000 bloklık bir yarı ömürle azalır (6 saniyelik bloklarda ~7 gün), bu da doğrulayıcıların iyi davranış süresinin ardından toparlanmasına imkân tanır.

4. **Tekil olaylar ile tekrarlayan ihlaller.** Kazara oluşan tek bir çevrimdışı kalma olayı küçük bir cezayla sonuçlanırken, tekrarlayan ihlaller üstel olarak artan sonuçlar doğurur.

---

## PQC Anahtar Kaydı {#pqc-key-registration}

**Post-kuantum kriptografik (PQC) açık anahtarınızı** — ML-DSA-87 — bir doğrulayıcı lisansına başvurmadan veya `create-validator` komutunu çalıştırmadan **önce** kaydedin. Bu **isteğe bağlı değildir ve otomatik gerçekleşmez**: zincir, her cosmos-yolu işleminde hibrit bir PQC imzası zorunlu kılar, `MsgCreateValidator` muaf tutulan mesaj türlerinden biri değildir ve — ilk işleminde anahtarını otomatik olarak kaydeden normal bir hesabın aksine — bir doğrulayıcının bu komutu önceden, kendi düğümünde, bizzat çalıştırması gerekir.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas 600000 \
  -y
```

| Parametre      | Açıklama                                              |
| -------------- | -------------------------------------------------------- |
| `<pubkey-hex>` | Hex kodlamasında 2592 bayt uzunluğunda ML-DSA-87 açık anahtarı |
| `hybrid`       | Kayıt modu (hybrid = hem klasik hem PQC)                  |

:::caution `--gas` değerini açıkça belirtin
ML-DSA-87 açık anahtarı 2.592 bayt uzunluğundadır ve bunu zincir üzerine yazmak varsayılan 200.000 gas limitini aşar. `--gas 600000` (veya daha yüksek) belirtilmeden işlem, belirsiz bir `out of gas in location: WritePerByte` hatasıyla başarısız olur.
:::

Kaydı doğrulayın:

```bash
qorechaind query pqc key <account-address>
```

---

## İzleme

### Prometheus Metrikleri

QoreChain, **26660** portunda Prometheus metrikleri sunar:

```
http://localhost:26660/metrics
```

İzlenmesi gereken temel metrikler:

| Metrik                           | Açıklama                                            |
| --------------------------------- | ------------------------------------------------------ |
| `qorechain_missed_blocks_total`   | Doğrulayıcınız tarafından kaçırılan toplam blok sayısı  |
| `qorechain_validator_uptime`      | Son N blok üzerinden çalışma süresi yüzdesi             |
| `qorechain_reputation_score`      | Güncel itibar puanı                                     |
| `qorechain_pool_classification`   | Güncel havuz ataması (0=PoS, 1=DPoS, 2=RPoS)            |
| `qorechain_consecutive_signed`    | Ardışık imzalanan blok sayısı                            |
| `consensus_height`                | Güncel blok yüksekliği                                  |
| `consensus_rounds`                | Güncel yükseklik için konsensüs turları                 |

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

1. **Sentry düğüm mimarisi kullanın.** Doğrulayıcınızı DDoS saldırılarından korumak için sentry düğümlerinin arkasında çalıştırın. Yalnızca sentry düğümlerini genel ağa açık tutun.

2. **Uyarı sistemi kurun.** Kaçırılan bloklar, düşük çalışma süresi ve beklenmedik yeniden başlatmalar için uyarılar yapılandırın. Birkaç kaçırılan blok normaldir; sürekli kaçırmalar slashing tetikler.

3. **Yüksek çalışma süresini koruyun.** İtibar sistemi, tutarlı çalışma süresini ödüllendirir. Uzun süreli kesinti, itibar kalite faktörünüzü düşürerek ödülleri azaltır.

4. **Yazılımı güncel tutun.** QoreChain sürümlerini takip edin ve güncellemeleri hızlıca uygulayın. Zincir yükseltmeleri için doğrulayıcı topluluğuyla koordinasyon sağlayın.

5. **Anahtarlarınızı güvende tutun.** Doğrulayıcı konsensüs anahtarı için bir donanım güvenlik modülü (HSM) veya uzak imzalayıcı kullanın. Anahtarları asla düğümle aynı makinede saklamayın.

6. **Bir PQC anahtarı kaydedin.** Bir ML-DSA-87 anahtarı kaydederek doğrulayıcınızı kuantum tehditlerine karşı geleceğe hazırlayın.

7. **Havuzunuzu izleyin.** Havuz sınıflandırmanızı her 1.000 blokta bir takip edin. İtibarınızı iyileştirmek sizi PoS'tan RPoS'a taşıyabilir ve bu da blok önerme fırsatlarınızı önemli ölçüde artırabilir.

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

**v3.1.80** zincir sürümünden itibaren, bir QoreChain doğrulayıcısı [köprü](/architecture/bridge-architecture) aracılığıyla bağlanan ağların doğrulanmasına da yardımcı olabilir. Bu, **lisansa bağlı ve isteğe bağlı (opt-in)** bir işlevdir:

1. **Lisansa sahip olun.** Doğrulayıcının, hedef ağ için etkin bir `validator_<chain>` (veya `qcb_bridge`) lisansına sahip olması gerekir. Orkestratör, bu lisans olmadan harici bir istemciyi başlatmayı reddeder (fail-closed).
2. **Etkinleştirme istemciyi otomatik olarak sağlar.** Lisans etkinleştirildiğinde QoreChain, ilgili ağın istemcisini düğümünüzde sağlar — sabitlenmiş istemciyi indirir, yapılandırmasını oluşturur ve QoreChain'in orkestrasyonu altında çalıştırır. Etkinleştirme öncesinde hiçbir şey indirilmez.
3. **Ağın anahtarlarını ve stake'ini siz sağlayın.** Harici ağın doğrulayıcı/stake ve imzalama anahtarları ağ başına **operatör tarafından sağlanır**; QoreChain, sürücü çerçevesini ve zorunlu lisans kontrolünü sunar, harici zincirdeki stake'inizi değil.

**37 köprü ağının** tümü için sürücüler mevcuttur; bir doğrulayıcının nasıl katılabileceğine göre sınıflandırılır:

| Sınıf | Katılım | Örnekler |
| ----- | ------------- | -------- |
| İzinsiz (permissionless) doğrulayıcı | Stake yapıp çalıştırma | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Sınırlı / seçilmiş / kabul temelli | Bir sınıra veya seçime tabi stake | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 tam düğüm | Tam düğüm çalıştırma (staking yok) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Staking yapmayan / güven listesi | Staking yapmadan gözlemleme / katılım | Bitcoin, Filecoin, XRPL, Stellar |

:::note
İstemci sürüm sabitlemeleri en iyi çaba (best-effort) esasına dayanır; üretim ortamında etkinleştirmeden önce hedef ağınız için üst akış (upstream) istemci sürümünü doğrulayın.
:::

## Sonraki Adımlar

* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde akıllı sözleşmeler dağıtın
* [Hesap Soyutlama](/developer-guide/account-abstraction) — Doğrulayıcı operasyonlarınız için programlanabilir hesaplar
