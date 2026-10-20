---
slug: /architecture/consensus-mechanism
title: Konsensüs Mekanizması
sidebar_label: Konsensüs Mekanizması
sidebar_position: 1
---

# Konsensüs Mekanizması

QoreChain, doğrulayıcıları üç uzmanlaşmış havuza ayıran ve güvenlik, merkeziyetsizlik ile performansı dengelemek için itibar ağırlıklı seçim kullanan bir konsensüs mekanizması olan **Üçlü Havuz Bileşik Hisse Kanıtı'nı (Triple-Pool Composite Proof-of-Stake, CPoS)** uygular. CPoS, `x/qca` modülünde uygulanır ve **QoreChain Konsensüs Motoru** üzerinde çalışır.

:::note Güncel durum (20 Ekim 2026: ana ağ v3.2.3, test ağı v3.2.4)
Bu sayfada açıklanan Üçlü Havuz CPoS mantığı — havuz sınıflandırması, havuz ağırlıklı öneren seçimi, ödül bağlanma eğrisi, aşamalı kesme ve QDRW sayımı — `x/qca` modülünde uygulanmıştır ve parametreleri zincir üzerindedir, ancak **henüz blok üretimine, ödüllere, kesmeye veya yönetişim sayımına bağlanmamıştır**. Bugün öneren rotasyonu standart hisse ağırlıklı doğrulayıcı rotasyonudur, kesme standart `x/slashing` parametrelerini izler (kesinti penceresi 10,000 blok, imzalanan oran %5'in altına düştüğünde hapis, %1 kesinti kesmesi ve %5 çift imza kesmesi, 10 dakikalık hapis) ve öneriler bağlanmış hisse üzerinden sayılır (yeter sayı %33.4, eşik %50, veto %33.4). Aşağıdaki tasarım, modülün nereye doğru ilerlediğini açıklar. Ana ağ v3.2.3 veya test ağı v3.2.4'e kadar hiçbir sürüm bunu değiştirmemiştir; bugün uygulanan **kurallar** [Yürürlükteki doğrulayıcı kabul ve staking kuralları](#admission) bölümünde listelenmiştir.
:::

Konsensüs parametrelerini çalışma zamanında ayarlamak üzere tasarlanan pekiştirmeli öğrenme optimizasyon katmanı **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) markasıyla anılır. Ayrıntılar için [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine) sayfasına bakın.

Aşağıdaki diyagram, QoreChain Konsensüs Motoru üzerinde Üçlü Havuz CPoS'un bir blok/konsensüs döngüsünü özetler ve PRISM'in ayarlanabilir `x/qca` parametrelerine nerede geri besleme yapacak şekilde tasarlandığını gösterir (PRISM şu anda yalnızca gözlemler).

```mermaid
flowchart TD
    A["Validator set<br/>(x/qca)"] --> B["Pool classification<br/>RPoS / DPoS / PoS<br/>every 1,000 blocks"]
    B --> C["Stage 1: Pool selection<br/>weights 0.40 / 0.35 / 0.25"]
    C --> D["Stage 2: Within-pool<br/>reputation x stake CDF"]
    D --> E["Block proposed &amp; finalized<br/>on QoreChain Consensus Engine"]
    E --> F["Rewards (bonding curve)<br/>&amp; progressive slashing"]
    F --> A
    P["PRISM<br/>RL optimization"] -. tunes params .-> B
    P -. tunes params .-> C
```

---

## Yürürlükteki doğrulayıcı kabul ve staking kuralları {#admission}

Bu kurallar ana ağda (v3.2.2'den beri, v3.2.3'te ek bir sertleştirmeyle) ve test ağında uygulanır. Staking mesaj sunucusunun parçasıdırlar; bu nedenle zincire hangi yolla ulaşırsa ulaşsın her mesaj için geçerlidirler: bir işlem, `x/authz`, `x/group`, bir CosmWasm sözleşmesi, bir precompile veya bir yönetişim önerisi. Genesis işlemleri muaftır.

| Kural | Zincirin uyguladığı şey |
| --- | --- |
| Doğrulayıcı oluşturma | Öz-bağlanma en az **100,000 QOR** (100,000,000,000 uqor) olmalıdır **ve** operatör hesabı etkin bir `validator_operator` lisansına sahip olmalıdır. Bkz. [Zincir Lisanslama](/architecture/chain-licensing) |
| İşletme tabanı | Bir doğrulayıcının kendi operatörü, öz-bağlanmasını **100,000 QOR'un altında** bırakacak şekilde delegasyondan çıkış veya yeniden delegasyon yapamaz. Tam çıkışa (öz-bağlanmanın sıfıra inmesi) izin verilir; doğrulayıcı bu durumda hapse atılır |
| Hapisten çıkarma (Unjail) | Operatörün öz-bağlanması tabanın altındayken `MsgUnjail` reddedilir; bu nedenle tabanın altında çıkış yapan veya kesilen bir doğrulayıcının önce bakiyeyi tamamlaması gerekir. Kayıtlı kuantum-sonrası anahtarı olmayan bir operatör hesabı yine de hapisten çıkabilir (bkz. [Kuantum-Sonrası Güvenlik](/architecture/post-quantum-security#hybrid-signatures)) |
| Stake yetkilendirmeleri (v3.2.3) | Bir `x/authz` stake yetkilendirmesinin izin ve ret listeleri doğrulayıcı adreslerini çözülmüş baytlarına göre karşılaştırır; bu nedenle bir adresin yazılışı (örneğin tamamen büyük harf) bir ret listesini atlatamaz |
| Yeniden delegasyon kesmesi (v3.2.0) | Bir yeniden delegasyon kaydına uygulanan toplam kesme, kesme oranı çarpı kaydın başlangıç bakiyesi ile sınırlandırılmıştır |

20 Ekim 2026'da her iki ağda okunan staking parametreleri: `max_validators` 100, unbonding süresi 21 gün (1,814,400 sn), `max_entries` 7, `min_commission_rate` 0. `validator_operator` lisanslarını veren hesap olan lisans otoritesi, v3.2.3'ten beri yönetişim tarafından değiştirilebilir (`MsgUpdateAuthority`).

---

## Üçlü Havuz Mimarisi

CPoS, aktif doğrulayıcı kümesini itibar, hisse ve delegasyon metriklerine dayanarak üç havuza böler. Her havuz, konsensüs sürecinde ayrı bir rol üstlenir.

### Havuz Sınıflandırması

| Havuz                                | Kriter                                                                   | Seçim Ağırlığı   |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------- |
| **RPoS** (İtibar Hisse Kanıtı)       | İtibar puanı >= 70. yüzdelik dilim **VE** öz-bağlanmış hisse >= medyan   | %40              |
| **DPoS** (Delege Edilmiş Hisse Kanıtı) | Toplam delegasyon >= 10,000 QOR                                        | %35              |
| **PoS** (Standart Hisse Kanıtı)      | Kalan tüm aktif doğrulayıcılar                                           | %25              |

Sınıflandırma şu önceliğe göre değerlendirilir: **RPoS > DPoS > PoS**. Hem RPoS hem de DPoS için uygun olan bir doğrulayıcı RPoS'a atanır.

Yeniden sınıflandırma her **1,000 blokta** bir gerçekleşir. Her yeniden sınıflandırma döneminde:

1. **İtibar puanlarını topla** — Tüm aktif doğrulayıcılar için itibar puanları `x/reputation` modülünden toplanır.
2. **İtibar eşiğini hesapla** — 70. yüzdelik dilim itibar eşiği, sıralanmış puan dağılımından hesaplanır.
3. **Medyan öz-bağlanmış hisseyi hesapla** — Medyan öz-bağlanmış hisse, sıralanmış hisse dağılımından hesaplanır.
4. **Doğrulayıcıları yeniden ata** — Her aktif doğrulayıcı, uygun olduğu en yüksek öncelikli havuza yeniden atanır.
5. **Varsayılan atama** — Sınıflandırılmamış doğrulayıcılar (henüz değerlendirilmemiş olanlar) varsayılan olarak PoS havuzuna girer.

---

## Havuz Ağırlıklı Öneren Seçimi

Blok önereni seçimi, iki aşamalı deterministik bir süreci izler.

### Aşama 1: Havuz Seçimi

Deterministik bir rastgele değer, sonraki bloğu hangi havuzun önereceğini seçer:

```
seed = SHA256(lastBlockHash || height || "pool")
randVal = uint64(seed[:8]) / MaxUint64    // uniform in [0, 1)
```

Havuz, `randVal` değerinin kümülatif ağırlık eşikleriyle karşılaştırılmasıyla seçilir:

* `randVal < 0.40` → RPoS havuzu
* `0.40 <= randVal < 0.75` → DPoS havuzu
* `randVal >= 0.75` → PoS havuzu

### Aşama 2: Havuz İçi Seçim

Seçilen havuz içinde öneren, bir **itibar × hisse ağırlıklı CDF** aracılığıyla seçilir. Havuzdaki her doğrulayıcı için:

1. İtibar puanı `r`, `x/reputation` modülünden alınır.
2. Bileşik ağırlık `w = r * tokens` şeklindedir.
3. Tüm bileşik ağırlıklardan bir kümülatif dağılım fonksiyonu (CDF) oluşturulur.
4. Öneren, blok hash'i ve yüksekliği ile tohumlanan deterministik bir rastgele çekiliş kullanılarak CDF'ye karşı seçilir.

### Yedek Davranış

Seçilen havuz boşsa, sistem PoS havuzuna geri döner. PoS havuzu da boşsa, seçim tüm aktif doğrulayıcı kümesi genelinde itibar ağırlıklı seçime geri döner.

---

## Özel Bağlanma Eğrisi

Doğrulayıcı ödülleri, uzun vadeli katılımı, yüksek itibarı ve protokol büyüme aşamalarıyla uyumu teşvik eden çok faktörlü bir bağlanma eğrisi kullanılarak hesaplanır.

### Formül

```
R(v, t) = beta * S_v * (1 + alpha * ln(1 + L_v)) * Q(r_v) * P(t)
```

### Faktör Tanımları

| Faktör                 | Sembol   | Açıklama                                                     | Varsayılan |
| ---------------------- | -------- | ----------------------------------------------------------- | ---------- |
| Temel Ödül Çarpanı     | `beta`   | Genel ödül büyüklüğünü ölçeklendirir                         | 1.0        |
| Öz-Bağlanmış Hisse     | `S_v`    | Doğrulayıcının öz-bağlanmış token'ları (uqor)               | --         |
| Sadakat Duyarlılığı    | `alpha`  | Sadakat süresinin ödülleri ne kadar artırdığını kontrol eder | 0.1       |
| Sadakat Süresi         | `L_v`    | Doğrulayıcının aktif olduğu ardışık blok sayısı             | --         |
| İtibar Kalitesi        | `Q(r_v)` | İtibar `r` değerini \[0.75, 1.25] aralığında bir ödül çarpanına eşler | -- |
| Protokol Aşaması       | `P(t)`   | Ödülleri başlatmak veya yumuşatmak için aşamaya bağlı çarpan | Aşağıya bakın |

### İtibar Kalitesi Fonksiyonu

```
Q(r) = 1 + 0.5 * (r - 0.5)
```

Sonuç **\[0.75, 1.25]** aralığına sıkıştırılır:

| İtibar Puanı     | Q(r)  |
| ---------------- | ----- |
| 0.0              | 0.75  |
| 0.25             | 0.875 |
| 0.5              | 1.0   |
| 0.75             | 1.125 |
| 1.0              | 1.25  |

### Protokol Aşaması Çarpanları

| Aşama   | P(t) | Açıklama                                          |
| ------- | ---- | ------------------------------------------------- |
| Genesis | 1.5  | Doğrulayıcı kümesini başlatmak için daha yüksek ödüller |
| Growth  | 1.0  | Ağ genişlemesi sırasında standart ödüller          |
| Mature  | 0.8  | Ağ kararlı hale geldikçe azaltılan emisyon         |

### Deterministik Matematik

`ln(1 + L_v)` hesaplaması, tamamen `LegacyDec` sabit hassasiyetli ondalıklar üzerinde çalışan argüman indirgemeli bir Taylor serisi yaklaşımı (`TaylorLn1PlusX`) kullanır. Konsensüs açısından kritik ödül hesaplamalarında kayan nokta aritmetiği kullanılmaz.

---

## Aşamalı Kesme (Progressive Slashing)

QoreChain, sabit kesme oranlarını, tekrar eden ihlalciler için sonuçları artıran ve ihlallerin zamanla azalmasına izin veren bir **aşamalı ceza modeliyle** değiştirir.

### Formül

```
penalty = base_rate * escalation_factor^effective_count * severity_factor
```

### Zamansal Azalma

Geçmiş ihlaller, etkin sayıma azalan bir ağırlık katar:

```
effective_count = SUM( 0.5^(blocks_since_i / decay_halflife) )
```

Geçmiş her ihlal `i` için katkı, her `decay_halflife` blokta bir yarıya iner (varsayılan: 100,000). Bu, 200,000 blok önce gerçekleşen tek bir eski ihlalin etkin sayıma yalnızca 0.25 katkı verdiği anlamına gelir.

### Şiddet Faktörleri

| İhlal Türü          | Şiddet Faktörü  |
| ------------------- | --------------- |
| Downtime            | 1.0             |
| Double Sign         | 2.0             |
| Light Client Attack | 3.0             |

### Azami Ceza

Ceza, bir doğrulayıcının ne kadar geçmiş ihlal biriktirdiğine bakılmaksızın, kesme olayı başına **%33** ile sınırlandırılmıştır.

### Örnek Hesaplama

2 önceki ihlali olan (biri 50,000 blok önce, biri 150,000 blok önce) bir doğrulayıcı çift imza (double-sign) yapar:

1. **Azalma katkıları**:
   * İhlal 1: `0.5^(50000 / 100000) = 0.5^0.5 = 0.707`
   * İhlal 2: `0.5^(150000 / 100000) = 0.5^1.5 = 0.354`
   * `effective_count = 0.707 + 0.354 = 1.061`
2. **Artış**: `1.5^1.061 = 1.516`
3. **Ceza**: `0.01 * 1.516 * 2.0 = 0.0303` (%3.03)

Bunu ilk kez ihlal eden biriyle karşılaştırın: `0.01 * 1.5^0 * 2.0 = 0.02` (%2.0).

---

## QDRW Yönetişimi

QoreChain yönetişimi, plütokratik ele geçirmeyi önlerken uzun vadeli ağ katılımcılarını ödüllendirmek için **İtibar Ağırlıklı Kuadratik Delegasyon'u (Quadratic Delegation with Reputation Weighting, QDRW)** kullanır.

### Oy Gücü Formülü

```
VP(v) = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Burada:

* `staked` = oy verenin bağlanmış QOR token'ları
* `xQORE` = oy verenin xQORE bakiyesi (uzun vadeli staking türevi)
* `2` = xQORE ağırlık çarpanı (yönetişimle yapılandırılabilir)
* `r` = oy verenin `x/reputation` modülünden alınan itibar puanı

### İtibar Çarpanı

İtibar çarpanı, bir sigmoid eğrisi aracılığıyla \[0, 1] aralığındaki `r` değerini \[0.5, 2.0] aralığında bir çarpana eşler:

```
ReputationMultiplier(r) = 0.5 + 1.5 * sigmoid(6 * (r - 0.5))
```

| İtibar Puanı     | Çarpan     |
| ---------------- | ---------- |
| 0.0              | 0.50       |
| 0.1              | 0.52       |
| 0.2              | 0.58       |
| 0.3              | 0.71       |
| 0.4              | 0.93       |
| 0.5              | 1.25       |
| 0.6              | 1.57       |
| 0.7              | 1.79       |
| 0.8              | 1.92       |
| 0.9              | 1.98       |
| 1.0              | 2.00       |

### Kuadratik Ölçeklendirme

Karekök fonksiyonu, oy gücünün hisseyle alt-doğrusal olarak ölçeklenmesini sağlar. Başka bir oy verenin 4 katı hisseye sahip bir oy veren, 4 kat değil yalnızca 2 kat oy gücü alır. Bu, QDRW'nin tasarlanmış davranışıdır; devre dışı olduğu sürece öneriler bağlanmış hisse üzerinden sayılır. Formül xQORE kullanır; xQORE ise canlı ağlarda henüz kilitlenemez.

### Deterministik Matematik

`IntegerSqrt`, `LegacyDec` hassasiyetiyle Newton yöntemini kullanır. `SigmoidApprox`, 12 terimli bir Taylor serisi `ExpApprox` kullanır. Tüm yönetişim matematiği, tüm doğrulayıcı düğümlerinde tamamen deterministiktir.

---

## QCA Parametreleri

Aşağıdaki tablolar, `x/qca` modülünün yönetişimle yapılandırılabilen parametrelerini, `qorechaind query qca config` komutunun döndürdüğü adlarla ve canlı değerlerle listeler (bu parametreler henüz etkin değildir; yukarıdaki durum notuna bakın):

### Temel Parametreler

| Parametre                  | Tür     | Varsayılan | Açıklama                                          |
| -------------------------- | ------- | ---------- | ------------------------------------------------- |
| `use_reputation_weighting` | bool    | `true`     | İtibar ağırlıklı öneren seçimi için genesis ayarı (seçici henüz blok üretimine bağlanmamıştır) |
| `min_reputation_score`     | float64 | `0.1`      | Aktif katılım için asgari itibar puanı            |

### Havuz Yapılandırması

| Parametre                 | Tür       | Varsayılan       | Açıklama                                         |
| ------------------------- | --------- | ---------------- | ------------------------------------------------ |
| `pool_classification_interval` | uint64 | `1000`        | Havuz yeniden sınıflandırması arasındaki bloklar |
| `pool_weight_rpos`        | LegacyDec | `0.40`           | RPoS havuz seçim ağırlığı                         |
| `pool_weight_dpos`        | LegacyDec | `0.35`           | DPoS havuz seçim ağırlığı                         |
| `pool_min_delegation_dpos`| uint64    | `10,000,000,000` | DPoS için asgari delegasyon (uqor cinsinden 10,000 QOR) |
| `pool_rep_percentile_rpos`| uint64    | `70`             | RPoS için itibar yüzdelik eşiği                   |

### Bağlanma Eğrisi Yapılandırması

| Parametre          | Tür       | Varsayılan | Açıklama                                         |
| ------------------ | --------- | ---------- | ------------------------------------------------ |
| `bonding_alpha`    | LegacyDec | `0.1`      | Sadakat duyarlılığı katsayısı                    |
| `bonding_beta`     | LegacyDec | `1.0`      | Temel ödül çarpanı                               |
| `bonding_phase_multiplier` | LegacyDec | `1.5` | Protokol aşaması ödül çarpanı (Genesis aşaması)  |

### Kesme Yapılandırması

| Parametre           | Tür       | Varsayılan | Açıklama                               |
| ------------------- | --------- | ---------- | -------------------------------------- |
| `slashing_base_rate`| LegacyDec | `0.01`     | Temel kesme oranı (%1)                 |
| `slashing_escalation_factor` | LegacyDec | `1.5` | Aşamalı artış tabanı                   |
| `slashing_max_penalty` | LegacyDec | `0.33` | Olay başına azami ceza (%33)           |
| `slashing_decay_halflife` | uint64 | `100,000` | İhlal ağırlığı yarı ömrü için bloklar  |

### QDRW Yönetişim Yapılandırması

| Parametre            | Tür       | Varsayılan | Açıklama                               |
| -------------------- | --------- | ---------- | -------------------------------------- |
| `qdrw_enabled`       | bool      | `false`    | QDRW yönetişim sayımını etkinleştir (canlı ağlarda devre dışı) |
| `qdrw_xqore_multiplier` | LegacyDec | `2.0` | Bağlanmış token'lara göre xQORE ağırlığı |
| `qdrw_rep_min_multiplier` | LegacyDec | `0.5` | Asgari itibar çarpanı                  |
| `qdrw_rep_max_multiplier` | LegacyDec | `2.0` | Azami itibar çarpanı                   |

## İlgili

* [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine) — konsensüs parametrelerini ayarlamak üzere tasarlanan yapay zeka katmanı.
* [Çok Katmanlı Mimari](/architecture/multilayer-architecture) — yan zincirlerin temel katmana nasıl bağlandığı.
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — zinciri güvence altına alan bir doğrulayıcıyı işletin.
* [Tokenomik](/architecture/tokenomics) — staking ödülleri, enflasyon ve kesme ekonomisi.
