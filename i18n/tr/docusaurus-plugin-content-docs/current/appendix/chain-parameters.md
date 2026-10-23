---
slug: /appendix/chain-parameters
title: Zincir Parametreleri
sidebar_label: Zincir Parametreleri
sidebar_position: 2
---

# Zincir Parametreleri

QoreChain ağlarının modül parametrelerinin, modüle göre gruplanmış birleştirilmiş referansı. Parametreler, modülün bir params sorgusu olduğu yerlerde `qorechaind query <module> params` ile sorgulanabilir (`pqc`, `amm`, `crossvm`, `lightnode`, `multilayer`, `reputation`, `rlconsensus`; `ai`, `qca`, `rdk`, `bridge`, `abstractaccount` ve `gasabstraction` `config` kullanır), REST üzerinden ise yalnızca [REST / gRPC başvurusunda](/api-reference/rest-grpc-endpoints) listelenen rotalar için sorgulanabilir. `x/inflation` parametreleri de v3.2.3'ten beri ana ağda REST üzerinden sunulur (`/qorechain/inflation/v1/params`). `ai`, `qca`, `reputation`, `crossvm`, `rlconsensus`, `fairblock` ve `xqore` için REST kullanılamaz.

:::note
Gösterilen değerler 23 Ekim 2026 tarihinde ana ağ **`qorechain-vladi`**'den (EVM zincir kimliği **9801**, sürüm **v3.2.4**, 23 Ekim 2026'da uygulandı) canlı olarak okunmuştur (bir yönetişim önerisinin değiştirdikleri dışında genesis değerleridir; değişenler ayrıca belirtilmiştir). Belirtilen durumlar dışında test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**, sürüm **v3.2.4**, 19 Ekim 2026'dan beri) üzerinde de aynıdır; kalan farklar [Test ağı ile ana ağ arasındaki farklar](#testnet-differences) bölümünde toplanmıştır. Blok cinsinden verilen süreler, ölçülen ana ağ blok süresi olan yaklaşık 3,2 saniyeye göre çevrilmiştir (test ağı yaklaşık her saniye bir blok üretir).
:::

---

## PQC Modülü (`x/pqc`)

| Parametre                  | Değer                      | Açıklama                                                                 |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | Kuantum sonrası imzalar birincil şemadır                                 |
| `allow_classical_fallback` | `false`                    | Yalnızca klasik geri dönüş kapalıdır; Cosmos hattındaki işlemler hibrit olmalıdır |
| `min_security_level`       | `5`                        | Kayıtlı bir algoritma için minimum NIST güvenlik seviyesi                |
| `default_migration_blocks` | `1,000,000`                | Yönetişimle başlatılan bir algoritma geçişinin varsayılan uzunluğu (≈3,2 sn bloklarda yaklaşık 37 gün) |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2` (required)             | Uygulama modu: 0=devre dışı, 1=isteğe bağlı, 2=zorunlu                   |

Algoritma kayıt defteri (id 1 `dilithium5`, id 2 `mlkem1024`) bir parametre değil, zincir durumudur. Anahtarlar `MsgRegisterPQCKey` veya `MsgRegisterPQCKeyV2` ile açıkça kaydedilir; otomatik kayıt yoktur. v3.2.3'ten beri zincir zayıf, dejenere ve daha önce kullanılmış açık anahtarları reddeder ve `MsgRegisterPQCKeyV2`, zincirin mevcut olduğunda doğruladığı isteğe bağlı bir sahiplik kanıtı kabul eder (`tx pqc register-key-v2 ... --pqc-key <name>`).

### EVM yetkilendirme penceresi sınırları {#evm-window-limits}

Bir [EVM yetkilendirme penceresinin](/getting-started/first-transaction#evm-window) sınırları modül parametresi değil, protokol sabitleridir:

| Sınır | Değer |
| ----- | ----- |
| Maksimum `blocks` | 17,280 (≈3,2 sn bloklarda yaklaşık 15 saat) |
| Maksimum `max_txs` | 1,000 |
| `max_value` | 0'dan büyük (uqor; aktarılan değer artı her işlemin maksimum ücreti) |
| Maksimum `allowed_targets` | 16 alıcı adresi (isteğe bağlı kapsam, v3.2.3) |

Bir pencere, v3.2.3'ten itibaren `native_only` ile (yalnızca düz yerel QOR transferleri) de daraltılabilir.

---

## AI Modülü (`x/ai`)

Modülün yapılandırması (`qorechaind query ai config`):

| Parametre           | Değer                  | Açıklama                                                                    |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | Ante handler'ın bir işlemi işaretlediği anomali puanı eşiği                 |
| `routing_strategy`  | `reputation_weighted`  | Yönlendirme stratejisi                                                      |
| `risk_threshold`    | `0.8`                  | Risk puanı eşiği                                                            |
| `max_tx_per_minute` | `600`                  | Cosmos hattında 30 blokluk bir pencere boyunca sayılan, gönderen başına işlem sınırı (≈3,2 sn bloklarda yaklaşık 96 sn; ad tarihsel kalıntıdır). v3.2.0'dan beri uygulanır; varsayılan değer 10'dur |

[AI Motoru](/architecture/ai-engine) sayfasında açıklanan dolandırıcılık puanlama ağırlıkları ve şiddet eşikleri modül parametresi değil, dedektör sabitleridir.

---

## İtibar Modülü (`x/reputation`)

| Parametre   | Değer  | Açıklama                                             |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | İtibar formülünde çalışma süresi puanı (S\_i) ağırlığı |
| `beta`      | `0.35` | Katılım puanı (P\_i) ağırlığı                        |
| `gamma`     | `0.20` | Topluluk puanı (C\_i) ağırlığı                       |
| `delta`     | `0.15` | Kıdem puanı (T\_i) ağırlığı                          |
| `lambda`    | `1000` | Geçmiş puanlar için zaman azalması ölçeği            |
| `min_score` | `0.10` | Bir itibar puanı için taban değer                    |

İtibar formülü: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`, geçmiş puanlara zaman azalması uygulanır.

---

## QCA Modülü (`x/qca`)

:::note Uygulandı, henüz etkin değil
Triple-Pool CPoS mantığı `x/qca` içinde uygulanmıştır ve bu parametreler zincir üzerindedir, ancak **henüz blok üretimine, ödüllere, slashing'e veya yönetişim sayımına bağlanmamıştır**. Yürürlükteki slashing standart `x/slashing` modülüdür ([Stake, slashing, yönetişim, ücretler ve EVM](#core-modules) bölümüne bakın). Bkz. [Konsensüs Mekanizması](/architecture/consensus-mechanism).
:::

Yapılandırma (`qorechaind query qca config`):

| Parametre                       | Değer               | Açıklama                                              |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | İtibar ağırlıklandırması için genesis ayarı           |
| `min_reputation_score`          | `0.1`               | Minimum itibar puanı                                  |
| `pool_classification_interval`  | `1000` blocks       | Havuz sınıflandırmaları arasındaki blok sayısı        |
| `pool_weight_rpos`              | `0.40`              | RPoS havuzunun öneri ağırlığı                         |
| `pool_weight_dpos`              | `0.35`              | DPoS havuzunun öneri ağırlığı                         |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | DPoS havuzu için minimum delegasyon (10.000 QOR)    |
| `pool_rep_percentile_rpos`      | `70`                | RPoS havuzu için itibar yüzdelik dilimi               |
| `bonding_alpha`                 | `0.1`               | Bağlanma eğrisi parametresi                           |
| `bonding_beta`                  | `1.0`               | Bağlanma eğrisi parametresi                           |
| `bonding_phase_multiplier`      | `1.5`               | Bağlanma eğrisi aşama çarpanı                         |
| `slashing_base_rate`            | `0.01`              | Kademeli slashing temel oranı                         |
| `slashing_escalation_factor`    | `1.5`               | Kademeli slashing artış faktörü                       |
| `slashing_max_penalty`          | `0.33`              | Kademeli slashing azami cezası                        |
| `slashing_decay_halflife`       | `100,000` blocks    | Kademeli slashing azalma yarı ömrü                    |
| `qdrw_enabled`                  | `false`             | QDRW sayımı devre dışıdır                             |
| `qdrw_xqore_multiplier`         | `2.0`               | QDRW formülünde xQORE ağırlığı                        |
| `qdrw_rep_min_multiplier`       | `0.5`               | İtibar çarpanının alt sınırı                          |
| `qdrw_rep_max_multiplier`       | `2.0`               | İtibar çarpanının üst sınırı                          |

---

## Yakma Modülü (`x/burn`)

| Parametre              | Değer                        | Açıklama                                              |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | Ücret toplayıcısından yakılan oran                    |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | Kontrat oluşturma için sabit yakma ücreti             |
| `ai_service_burn_rate` | `0.50`                       | Yakılan AI hizmet ücretleri oranı                     |
| `bridge_burn_rate`     | `1.00`                       | Yakılan köprü ücretleri oranı                         |
| `failed_tx_burn_rate`  | `0.10`                       | Yakılan başarısız işlem gazı oranı (zincir tarafından v3.2.2'den beri uygulanır) |
| `validator_share`      | `0.37`                       | Doğrulayıcılara dağıtılan oran                        |
| `treasury_share`       | `0.20`                       | Hazineye gönderilen oran                              |
| `staker_share`         | `0.10`                       | Stake edenlere dağıtılan oran                         |
| `light_node_share`     | `0.03`                       | Hafif düğümlere dağıtılan oran                        |
| `enabled`              | `true`                       | Modül etkinleştirme bayrağı                           |

Ücret bölüşümü doğrulayıcılar, yakma, hazine, stake edenler ve hafif düğümler arasında **37 / 30 / 20 / 10 / 3** şeklindedir; payların toplamı `1.00` olmalıdır. Bir `milestone_burn_schedule` da vardır. Bkz. [Tokenomics](/architecture/tokenomics).

---

## xQORE Modülü (`x/xqore`)

:::caution Zincir üzerinde henüz kullanılamıyor
xQORE modülünün muhasebesi mevcuttur, ancak kilitleme ve kilit açma işlemleri, sorgular ve CLI komutları **henüz canlı ağlara bağlanmamıştır**: şu anda hiçbir QOR kilitlenemez ve hiç xQORE basılmamıştır. Aşağıdaki değerler genesis yapılandırmasıdır.
:::

| Parametre                 | Değer                  | Açıklama                                             |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | xQORE sahipleri için oy gücü çarpanı                 |
| `min_lock_amount`         | `1,000,000 uqor`       | Kilitlenecek minimum miktar (1 QOR)                  |
| `penalty_burn_rate`       | `0.0`                  | Yakılan çıkış cezaları oranı (hepsi yeniden dağıtılır) |
| `rebase_interval`         | `100` blocks           | PvP yeniden dengeleme olayları arasındaki blok sayısı |
| `enabled`                 | `true`                 | Modül etkinleştirme bayrağı                          |

Çıkış cezaları: %50 (30 günden kısa kilit), %35 (30–90 gün), %15 (90–180 gün), %0 (180 günden uzun). Kilit çarpanları: 0 / 90 / 180 / 365 / 730 günde 1,0 / 1,2 / 1,4 / 1,7 / 2,0.

---

## Enflasyon Modülü (`x/inflation`)

| Parametre              | Değer                   | Açıklama                                              |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule` (eski) veya `fixed` (v3.1.94'ten beri)     |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86.000 QOR) | Fixed modunda dönem başına basılan miktar (10 numaralı yönetişim önerisinden, 19 Ekim 2026, önce 16.239 QOR) |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590.000.000 QOR) | Kesin kümülatif üst sınır (10 numaralı öneriden önce 114.285.714 QOR) |
| `epoch_length`         | `43,200` blocks         | Dönem başına blok sayısı (≈3,2 sn bloklarda yaklaşık 38,6 saat) |
| `schedule`             | %17,5, %11, %7, %7, %2  | Eski yıl bazlı oranlar, fixed modunda kullanılmaz     |
| `enabled`              | `true`                  | Modül etkinleştirme bayrağı                           |

Modül, üst sınıra ulaşılana kadar bu emisyonu ücret toplayıcısına basar. 86.000 QOR'luk ilk dönem 3.672.000 numaralı blokta başlar. 23 Ekim 2026'da (86. dönem) 105.420.896,21 QOR basılmıştı ve üst sınır altında 484.579.103,79 QOR kalmıştı (`GET /qorechain/inflation/v1/epoch_info`). Bkz. [Tokenomics](/architecture/tokenomics#supply-and-emission).

---

## RL Konsensüs Modülü (`x/rlconsensus`)

`x/rlconsensus` modülü, pekiştirmeli öğrenme optimizasyon katmanı olan **PRISM**'i uygular. Her iki ağda da gözlem modundadır: hiçbir politika ağırlığı yüklenmemiştir, dolayısıyla hiçbir şeyi ayarlamaz. Dört PRISM kontrol mesajı ana ağda devre kesici tarafından kapatılmıştır ([Devre Kesici Durumu](#circuit-breaker) bölümüne bakın).

| Parametre                        | Değer          | Açıklama                                                      |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | Modül etkinleştirme bayrağı                                   |
| `observation_interval`           | `10`           | PRISM gözlem örnekleri arasındaki blok sayısı                 |
| `agent_mode`                     | `1` (conservative) | Aracı modu: 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | Conservative modunda eylem başına maksimum parametre değişikliği |
| `max_change_autonomous`          | `0.25`         | Autonomous modunda eylem başına maksimum parametre değişikliği |
| `circuit_breaker_window`         | `50`           | Devre kesici penceresi                                        |
| `circuit_breaker_threshold`      | `0.50`         | Devre kesici eşiği                                            |
| `reward_weight_throughput`       | `0.30`         | İş hacmi için ödül ağırlığı                                   |
| `reward_weight_finality`         | `0.25`         | Kesinlik (finality) için ödül ağırlığı                        |
| `reward_weight_decentralization` | `0.20`         | Merkeziyetsizlik için ödül ağırlığı                           |
| `reward_weight_mev`              | `0.15`         | MEV için ödül ağırlığı                                        |
| `reward_weight_failed_txs`       | `0.10`         | Başarısız işlemler için ödül ağırlığı                         |
| `default_block_time_ms`          | `5000`         | Gözlem temel çizgisindeki varsayılan blok süresi (canlı blok süresi değil) |
| `default_base_gas_price`         | `100`          | Gözlem temel çizgisindeki varsayılan temel gaz fiyatı         |
| `default_validator_set_size`     | `100`          | Gözlem temel çizgisindeki varsayılan doğrulayıcı kümesi boyutu |

---

## Köprü Modülü (`x/bridge`)

:::caution Canlı değil
37 zincir yapılandırmasının tamamı `pending` durumundadır, hiçbir köprü doğrulayıcısı kayıtlı değildir, hiçbir köprü işlemi oluşturulmamıştır ve her iki ağda da açık bir IBC kanalı yoktur. Bkz. [Köprü Mimarisi](/architecture/bridge-architecture).
:::

`GET /qorechain/bridge/v1/config`:

| Parametre                  | Değer                       | Açıklama                                          |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | Onay kümesi için gereken doğrulayıcı sayısı       |
| `attestation_threshold`    | `7`                         | Gereken onay sayısı                               |
| `challenge_period_secs`    | `86400`                     | İtiraz süresi (24 saat)                           |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100.000 QOR) | Bunun üzerindeki transferler itiraz süresini bekler |
| `enabled`                  | `true`                      | Modül etkinleştirme bayrağı                       |

Zincir başına ayarlar (`min_confirmations`, `max_single_transfer`, `daily_limit`) modül parametrelerinde değil, her zincirin yapılandırmasında bulunur.

---

## Çok Katmanlı Modül (`x/multilayer`)

| Parametre                      | Değer            | Açıklama                                          |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10`             | Maksimum kayıtlı yan zincir sayısı                |
| `max_paychains`                | `50`             | Maksimum kayıtlı ödeme zinciri sayısı             |
| `min_anchor_interval`          | `100`            | Minimum çapa aralığı (blok)                       |
| `max_anchor_interval`          | `1000`           | Maksimum çapa aralığı (blok)                      |
| `default_challenge_period`     | `86400` s        | Varsayılan itiraz süresi (1 gün)                  |
| `min_sidechain_stake`          | `1,000,000,000`  | Bir yan zincir kaydetmek için minimum stake (1.000 QOR) |
| `min_paychain_stake`           | `100,000,000`    | Bir ödeme zinciri kaydetmek için minimum stake (100 QOR) |
| `routing_enabled`              | `true`           | Katmanlar arası yönlendirme etkin                 |
| `routing_confidence_threshold` | `0.6`            | Otomatik yönlendirme için güven eşiği             |
| `cross_layer_fee_bundling`     | `true`           | Tek bir ücret ödemesi birden fazla katmanı kapsayabilir |

---

## Çapraz-VM Modülü (`x/crossvm`)

| Parametre             | Değer   | Açıklama                                       |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | Bayt cinsinden maksimum çapraz-VM mesaj boyutu (64 KB) |
| `max_queue_size`      | `1000`  | Çapraz-VM kuyruğundaki maksimum bekleyen mesaj |
| `queue_timeout_blocks`| `100`   | Bekleyen bir mesajın zaman aşımına uğramasından önceki blok sayısı |
| `enabled`             | `true`  | Modül etkinleştirme bayrağı                    |

`MsgCrossVMCall` ana ağda devre kesici tarafından kapatılmıştır (test ağında etkindir).

---

## SVM Modülü (`x/svm`)

Genesis değerleri:

| Parametre               | Değer        | Açıklama                                     |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | Bayt cinsinden maksimum program ikili boyutu (10 MB) |
| `max_account_data_size` | `10485760`   | Bayt cinsinden maksimum hesap verisi boyutu (10 MB)  |
| `compute_budget_max`    | `1400000`    | İşlem başına maksimum hesaplama birimi (1,4M) |
| `lamports_per_byte`     | `3480`       | Lamport cinsinden bayt başına kira maliyeti  |
| `rent_exemption_multi`  | `2.0`        | Muafiyet için gereken kira yılı sayısı       |
| `enabled`               | `true`       | Modül etkinleştirme bayrağı                  |
| `svm_slot_offset`       | `0`          | Slot ofseti                                  |
| `default_sig_scheme`    | `0`          | Varsayılan imza şeması                       |
| `max_cpi`               | `4`          | Maksimum programlar arası çağrı derinliği    |

SVM işlem hattı ağ genelinde devre dışıdır (bkz. [Ağlar](/appendix/networks)).

---

## RDK Modülü (`x/rdk`)

`qorechaind query rdk config`:

| Parametre                   | Değer                | Açıklama                                      |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100`                | Maksimum kayıtlı rollup sayısı                |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| Minimum operatör stake'i (10.000 QOR)         |
| `rollup_creation_burn_rate` | `0.01`               | Oluşturma stake'inin yakılan oranı (%1)       |
| `default_challenge_window`  | `604,800` s          | Varsayılan itiraz penceresi (7 gün)           |
| `max_da_blob_size`          | `2,097,152`          | Bayt cinsinden maksimum DA blob boyutu (2 MB) |
| `blob_retention_blocks`     | `432,000`            | DA bloblarının saklanacağı blok sayısı (≈3,2 sn bloklarda yaklaşık 16 gün) |
| `max_batches_per_block`     | `10`                 | Blok başına işlenen maksimum parti sayısı     |

Her iki ağda da henüz hiçbir rollup oluşturulmamıştır.

---

## FairBlock Modülü (`x/fairblock`)

Genesis değerleri (modülün sorgu hizmeti olmadığından canlı olarak yeniden okunamazlar):

| Parametre            | Değer   | Açıklama                                    |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | FairBlock tIBE şifrelemesi devre dışıdır    |
| `tibe_threshold`     | `5`     | Gereken minimum şifre çözme anahtarı payı   |
| `decryption_delay`   | `3`     | Sonlandırma sonrası şifre çözmeden önceki blok sayısı |
| `max_encrypted_size` | `65536` | Bayt cinsinden maksimum şifreli yük boyutu  |

---

## Gaz Soyutlama Modülü (`x/gasabstraction`)

Genesis yapılandırması (`enabled = true`, `native_denom = uqor`):

| Token Denomu | Dönüşüm Oranı | Açıklama               |
| ------------ | ------------- | ---------------------- |
| `uqor`       | `1.0`         | Yerel QOR tokeni (1:1) |
| `ibc/USDC`   | `1.0`         | IBC ile köprülenen USDC |
| `ibc/ATOM`   | `10.0`        | IBC ile köprülenen ATOM |

Dönüşüm oranı, o tokenle ödenen bir ücret dönüştürülürken kullanılan orandır.

:::note Açık IBC kanalı yok
Her iki ağda da açık bir IBC kanalı olmadığından henüz `ibc/USDC` veya `ibc/ATOM` var olamaz; ücretler `uqor` ile ödenir.
:::

---

## Hafif Düğüm Modülü (`x/lightnode`)

| Parametre                | Değer              | Açıklama                                             |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | Bir hafif düğümü kaydetme ücreti               |
| `heartbeat_interval`     | `1000` blocks      | Zorunlu heartbeat'ler arasındaki blok sayısı (≈3,2 sn bloklarda yaklaşık 54 dakika) |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1.000 QOR) | Operatör tarafından delege edilen minimum stake |
| `reward_share`           | `0.03`             | Hafif düğümler için ayrılan ücret toplayıcısı payı   |
| `min_uptime_for_rewards` | `0.80`             | Ödül hakkı için minimum çalışma süresi oranı         |
| `max_light_nodes`        | `10,000`           | Maksimum kayıtlı hafif düğüm sayısı                  |
| `heartbeat_grace_period` | `100` blocks       | Geciken bir heartbeat için ek süre                   |

Ödül muhasebesi canlıdır. `GET /qorechain/lightnode/v1/reward_pool` havuzu (`balance`, `reserved`, `outstanding`, `payable`, `distributable`) ve düğüm başına ödül sınırını bildirir. v3.2.3'ten beri sınır `max_reward_per_month_per_node`'dur: **düğüm başına 30 günde 2.000 QOR (`2000000000` uqor)**; blok süresine göre orantılanır ve düğümün çalışma süresine göre ölçeklenir; eski blok başına değer (`max_reward_per_block_per_node`, `1713` uqor) hâlâ bildirilmektedir. 20 Ekim 2026'da havuzda 487,2318 QOR'luk bir rezerv vardı ve bekleyen ödeme yoktu. Kayıt açıktır ve lisansa bağlıdır: ana ağda altı `lightnode_operator` lisansı verilmiştir ve henüz hiçbir hafif düğüm kaydolmamıştır (`GET /qorechain/license/v1/holders/lightnode_operator`, `GET /qorechain/lightnode/v1/stats`). Bkz. [Hafif Düğüm](/light-node/overview#reward-program-status) ve [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

---

## AMM Modülü (`x/amm`)

| Parametre               | Değer                         | Açıklama                            |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | Takas ücreti (%0,30)                |
| `protocol_fee_bps`      | `10`                          | Protokol ücreti payı (%0,10)        |
| `min_liquidity`         | `1000`                        | Minimum likidite                    |
| `max_pools_per_creator` | `50`                          | Oluşturan başına maksimum havuz sayısı |
| `lp_token_decimals`     | `6`                           | LP token ondalık basamağı           |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | Havuz oluşturma ücreti              |
| `max_swap_impact_bps`   | `500`                         | Bir takasın maksimum fiyat etkisi (%5) |
| `enabled`               | `true`                        | Modül etkinleştirme bayrağı         |

Ana ağda da test ağında da henüz havuz yoktur ve `MsgPausePool` / `MsgResumePool` ana ağda kapatılmıştır.

---

## Akıllı Hesaplar (`x/abstractaccount`)

:::caution Her iki ağda da kapalı
`enabled` değeri `false`'tur: bir kimlik doğrulayıcı kaydetme, bir kimlik doğrulayıcı üzerinden yürütme ve akıllı hesap oluşturma, modül kapalıyken reddedilir. Bu özellikler üzerine geliştirme yapmadan önce `GET /qorechain/abstractaccount/v1/config` adresini kontrol edin.
:::

| Parametre             | Değer    | Açıklama                         |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false`  | Modül etkinleştirme bayrağı      |
| `max_session_keys`    | `10`     | Hesap başına maksimum oturum anahtarı sayısı |
| `max_spending_rules`  | `5`      | Maksimum harcama kuralı sayısı   |
| `default_session_ttl` | `86400` s| Varsayılan oturum anahtarı ömrü  |

---

## Stake, Slashing, Yönetişim, Ücretler ve EVM {#core-modules}

Standart Cosmos SDK ve EVM modülleri; stake, slashing, yönetişim ve dağıtım satırları 23 Ekim 2026'da canlı olarak okunmuştur (fee-market, EVM, ERC-20 ve QoreChain Native satırları en son 20 Ekim 2026'da okunmuştur); belirtilen durumlar dışında her iki ağda aynıdır ve v3.2.4 yükseltmesinden etkilenmemiştir.

| Modül | Parametre | Değer |
| --- | --- | --- |
| Stake | `unbonding_time` | 1,814,400 s (21 gün) |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| Slashing | `signed_blocks_window` | 10,000 blok (≈3,2 sn bloklarda yaklaşık 8,9 saat) |
| | `min_signed_per_window` | %5 (pencerenin %5'inden azını imzalayan bir doğrulayıcı hapse atılır) |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | %1 |
| | `slash_fraction_double_sign` | %5 |
| Yönetişim | `min_deposit` | 10,000,000 uqor (10 QOR) |
| | `max_deposit_period` / `voting_period` | her biri 172,800 s (2 gün) |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| Dağıtım | `community_tax` | 0.02 |
| Ücret piyasası | `min_gas_price` | gaz başına 0,1 uqor |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor` (18 ondalık) |
| | kontrat oluşturma / çağırma erişimi | izinsiz (permissionless) |
| | `active_static_precompiles` | boş (hiçbir EVM precompile'ı etkin değil) |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## Devre Kesici Durumu {#circuit-breaker}

Zincir, vakıf operasyon hesabı ve yönetişim tarafından kontrol edilen Cosmos SDK devre kesicisiyle tekil mesaj türlerini kapatabilir. Devre dışı bırakılmış bir mesaj türü, her hatta ante handler'da reddedilir. Canlı liste `GET /cosmos/circuit/v1/disable_list` adresindedir.

**Ana ağ (20 Ekim 2026, 16 kayıt, 14 Ekim'den beri değişmedi):** vesting hesabı oluşturma (`MsgCreateVestingAccount`, `MsgCreatePermanentLockedAccount`, `MsgCreatePeriodicVestingAccount`); QoreChain Native `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`; AMM `MsgPausePool`, `MsgResumePool`; `crossvm.MsgCrossVMCall`; `multilayer.MsgUpdateLayerStatus`; `pqc.MsgDeprecateAlgorithm`, `pqc.MsgDisableAlgorithm`; ve dört PRISM kontrol mesajı (`MsgSetAgentMode`, `MsgUpdatePolicy`, `MsgUpdateRewardWeights`, `MsgResumeAgent`). EVM hattı (`MsgEthereumTx`) **açıktır**: 16 ile 25 Eylül arasında kapatılmış ve v3.2.0 yükseltmesiyle yeniden açılmıştır.

**Test ağı (20 Ekim 2026):** yalnızca üç QoreChain Native mesajı.

Standart bank, staking, governance, distribution, authz ve `x/pqc` kayıt mesajlarının tümü dahil diğer her mesaj türü etkindir. Liste yönetişim tarafından kontrol edilir ve değişebilir; her zaman sorgulayın.

---

## Test Ağı ile Ana Ağ Arasındaki Farklar {#testnet-differences}

Her iki ağ da v3.2.4 çalıştırır: `qorechain-diana` test ağı 8.337.253 yüksekliğinden (19 Ekim 2026) beri, `qorechain-vladi` ana ağı 3.742.566 yüksekliğinden (23 Ekim 2026, yönetişim önerisi 13) beri. Dolayısıyla v3.2.4 eklemeleri her iki ağda da aynıdır: isteğe bağlı zaman kilitli stake modülü `x/stakingtier` (48 yerine 49 modül; `GET /qorechain/stakingtier/v1/params`, minimum kilit 10 QOR, erken kilit açma cezası %5), üçüncü bir `emission_mode` (`target_apy`; `target_apy_bps` her iki ağda `0`), on üçüncü bir kayıtlı yakım kaynağı (`staking_tier_penalty`), ek hafif düğüm ödül havuzu raporlama alanları (`monthly_cap_active`, `last_distribution_time`, `last_distribution_height`) ve bir düğümün kendi kaydıyla başlayan ödül sınırı, PQC hesaplarında `possession_proven` bayrağı (sahiplik kanıtı hesap anahtarları için isteğe bağlı kalır, köprü doğrulayıcı anahtarları için zorunludur), blok süresi cinsinden sayılan RDK itiraz penceresi ve `protocol_features` ile `auth_nonce` sorguları. Bkz. [Stake ve Delegasyon](/user-guide/staking-and-delegation#time-locked-staking). 23 Ekim 2026 itibarıyla iki ağ yalnızca aşağıdaki değerlerde farklıdır.

Bu değerler test ağına özgüdür:

| Alan | Test ağı |
| ---- | ------- |
| `x/inflation` değerleri | Daha önceki emisyon değerleri (dönem başına 16.239 QOR, üst sınır 114.285.714 QOR, çoktan ulaşılmış); ana ağ, yönetişim önerisi 10 ile belirlenen değerleri kullanır. |
| Devre kesici | Yalnızca üç QoreChain Native mesajı (yukarıya bakın). |

Burada listelenmeyen her parametre her iki ağda aynıdır.
