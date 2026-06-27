---
slug: /appendix/chain-parameters
title: Zincir Parametreleri
sidebar_label: Zincir Parametreleri
sidebar_position: 2
---

# Zincir Parametreleri

QoreChain genesis dosyasındaki tüm yapılandırılabilir modül parametrelerinin birleştirilmiş referansı. Parametreler modüle göre gruplanmıştır ve çalışma zamanında `qorechaind query <module> params` ile sorgulanabilir.

:::note
Gösterilen değerler dağıtılmış genesis varsayılanlarıdır. Parametreler, aksi belirtilmedikçe ana ağ **`qorechain-vladi`** (EVM zincir kimliği **9801**) ve test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**) için geçerlidir.
:::

---

## PQC Modülü (`x/pqc`)

| Parametre                   | Tür    | Varsayılan Değer       | Açıklama                                                                          |
| --------------------------- | ------ | ---------------------- | -------------------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (zorunlu)          | Uygulama modu: 0=devre dışı, 1=isteğe bağlı, 2=zorunlu (mevcut varsayılan)        |
| `allow_classical_fallback`  | bool   | `false`                | Yalnızca klasik geri dönüş kapalıdır; cosmos işlemleri hibrit olmalıdır           |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | Boyut kısıtlamalarına sahip kayıtlı PQC algoritmaları                             |
| `auto_register_enabled`     | bool   | `true`                 | İlk hibrit işlemde PQC anahtarlarını otomatik kaydet                              |
| `migration_deadline_height` | uint64 | `0`                    | Yalnızca klasik anahtarların reddedildiği blok yüksekliği (0=devre dışı)          |
| `migration_grace_period`    | uint64 | `100000`               | Geçiş son tarihinden önce uyarı bloğu sayısı                                      |

---

## AI Modülü (`x/ai`)

| Parametre                  | Tür    | Varsayılan Değer | Açıklama                                                  |
| -------------------------- | ------ | --------------- | -------------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`          | Dolandırıcılık puanlamasında hacim anomalisi ağırlığı    |
| `anomaly_weight_velocity`  | string | `0.25`          | Dolandırıcılık puanlamasında hız anomalisi ağırlığı      |
| `anomaly_weight_pattern`   | string | `0.25`          | Dolandırıcılık puanlamasında desen anomalisi ağırlığı    |
| `anomaly_weight_network`   | string | `0.20`          | Dolandırıcılık puanlamasında ağ grafiği anomalisi ağırlığı |
| `fraud_threshold_low`      | string | `0.30`          | Düşük şiddetli uyarı için puan eşiği                      |
| `fraud_threshold_medium`   | string | `0.55`          | Orta şiddetli uyarı için puan eşiği                       |
| `fraud_threshold_high`     | string | `0.75`          | Yüksek şiddetli uyarı için puan eşiği                     |
| `fraud_threshold_critical` | string | `0.90`          | Kritik şiddetli uyarı için puan eşiği                     |
| `circuit_breaker_enabled`  | bool   | `true`          | QCAI devre kesicilerini etkinleştir                      |

---

## İtibar Modülü (`x/reputation`)

| Parametre      | Tür    | Varsayılan Değer | Açıklama                                                      |
| -------------- | ------ | --------------- | ------------------------------------------------------------ |
| `alpha`        | string | `0.30`          | İtibar formülünde çalışma süresi puanı (S\_i) ağırlığı       |
| `beta`         | string | `0.25`          | Katılım puanı (P\_i) ağırlığı                                |
| `gamma`        | string | `0.25`          | Topluluk puanı (C\_i) ağırlığı                               |
| `delta`        | string | `0.20`          | Kıdem puanı (T\_i) ağırlığı                                  |
| `decay_lambda` | string | `0.01`          | Geçmiş puanlar için üstel zaman azalma faktörü               |

İtibar formülü: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`, her dönem başına üstel zaman azalması uygulanır.

---

## QCA Modülü (`x/qca`)

| Parametre                      | Tür    | Varsayılan Değer | Açıklama                                              |
| ------------------------------ | ------ | --------------- | ---------------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`          | Emerald havuzu için blok önerme ağırlığı             |
| `sapphire_pool_weight`         | string | `0.30`          | Sapphire havuzu için blok önerme ağırlığı            |
| `ruby_pool_weight`             | string | `0.20`          | Ruby havuzu için blok önerme ağırlığı                |
| `emerald_min_reputation`       | string | `0.80`          | Emerald havuzu için minimum itibar puanı             |
| `sapphire_min_reputation`      | string | `0.50`          | Sapphire havuzu için minimum itibar puanı            |
| `bonding_curve_base_rate`      | string | `0.05`          | Stake bağlanma eğrisi için temel oran                |
| `bonding_curve_multiplier`     | string | `1.50`          | Bağlanma eğrisi ilerleyişi için çarpan               |
| `slashing_downtime_window`     | int64  | `10000`         | Kesinti süresini değerlendirmek için blok sayısı     |
| `slashing_downtime_threshold`  | string | `0.05`          | Slashing öncesi minimum imzalanan blok oranı         |
| `slashing_downtime_penalty`    | string | `0.01`          | Kesinti için slash oranı                             |
| `slashing_double_sign_penalty` | string | `0.05`          | Çift imzalama için slash oranı                       |
| `qdrw_enabled`                 | bool   | `true`          | Dinamik Ödül Ağırlıklandırmayı etkinleştir           |
| `qdrw_throughput_weight`       | string | `0.40`          | İş hacmi metriği için QDRW ağırlığı                  |
| `qdrw_latency_weight`          | string | `0.30`          | Gecikme metriği için QDRW ağırlığı                   |
| `qdrw_security_weight`         | string | `0.20`          | Güvenlik metriği için QDRW ağırlığı                  |
| `qdrw_decentralization_weight` | string | `0.10`          | Merkeziyetsizlik metriği için QDRW ağırlığı          |
| `qdrw_adjustment_cap`          | string | `0.10`          | Tek dönemlik maksimum QDRW ayarlaması                |
| `qdrw_adjustment_interval`     | int64  | `100`           | QDRW ayarlamaları arasındaki blok sayısı             |

---

## Yakma Modülü (`x/burn`)

| Parametre           | Tür    | Varsayılan Değer | Açıklama                                              |
| ------------------- | ------ | --------------- | ---------------------------------------------------- |
| `burn_enabled`      | bool   | `true`          | Ücret yakma mekanizmasını etkinleştir                |
| `validator_share`   | string | `0.37`          | Blok doğrulayıcılarına dağıtılan ücret oranı         |
| `burn_share`        | string | `0.30`          | Kalıcı olarak yakılan ücret oranı                    |
| `treasury_share`    | string | `0.20`          | Topluluk hazinesine gönderilen ücret oranı           |
| `staker_share`      | string | `0.10`          | Delegatörlere dağıtılan ücret oranı                  |
| `light_node_share`  | string | `0.03`          | Hafif düğümlere dağıtılan ücret oranı                |

Oranların toplamı `1.00` olmalıdır. Ücret bölüşümü doğrulayıcılar, yakma, hazine, stake edenler ve hafif düğümler arasında **37 / 30 / 20 / 10 / 3** şeklindedir.

---

## xQORE Modülü (`x/xqore`)

| Parametre            | Tür    | Varsayılan Değer | Açıklama                                          |
| -------------------- | ------ | --------------- | ------------------------------------------------ |
| `min_lock_amount`    | string | `1000000uqor`   | xQORE olarak kilitlenecek minimum miktar         |
| `min_lock_duration`  | string | `7d`            | Minimum kilit süresi                             |
| `max_lock_duration`  | string | `365d`          | Maksimum kilit süresi                            |
| `penalty_tier_1_pct` | string | `0.50`          | Erken açma cezası: kilit süresinin %0-25'i       |
| `penalty_tier_2_pct` | string | `0.30`          | Erken açma cezası: kilit süresinin %25-50'si     |
| `penalty_tier_3_pct` | string | `0.15`          | Erken açma cezası: kilit süresinin %50-75'i      |
| `penalty_tier_4_pct` | string | `0.05`          | Erken açma cezası: kilit süresinin %75-100'ü     |
| `pvp_rebase_enabled` | bool   | `true`          | PvP yeniden dengeleme yeniden dağıtımını etkinleştir |

---

## Enflasyon Modülü (`x/inflation`)

| Parametre         | Tür    | Varsayılan Değer       | Açıklama                                         |
| ----------------- | ------ | ---------------------- | ----------------------------------------------- |
| `epoch_length`    | uint64 | `100`                  | Enflasyon dönemi başına blok sayısı             |
| `blocks_per_year` | uint64 | `6311520`              | Yıllık tahmini blok sayısı (oran hesabı için)   |
| `initial_rate`    | string | `0.08`                 | Başlangıç yıllıklaştırılmış emisyon oranı parametresi |
| `rate_decay`      | string | `0.05`                 | Her yıl uygulanan azalma faktörü                |
| `min_rate`        | string | `0.02`                 | Taban emisyon oranı parametresi                 |
| `max_supply`      | string | `1000000000000000uqor` | Maksimum token arzı üst sınırı                  |

:::note
Yukarıdaki `x/inflation` parametreleri dağıtılmış mekanizma varsayılanlarıdır. Kanonik **tokenomics v2.1** ekonomik modeli kapsamında QoreChain **sabit arzlıdır** ve stake ile ekosistem ödüllerini finanse eden **sonlu bir emisyon bütçesine (590M havuz)** sahiptir. `initial_rate` / `rate_decay` / `min_rate` değerleri, emisyonların bu sonlu bütçe içinde nasıl programlandığını yöneten mekanizma ayrıntılarıdır — toplam arzın açık uçlu bir yüzde enflasyonu **değildir**.
:::

---

## RL Konsensüs Modülü (`x/rlconsensus`)

`x/rlconsensus` modülü, QoreChain Konsensüs Motorunun pekiştirmeli öğrenme optimizasyon katmanı olan **PRISM**'i uygular.

| Parametre                    | Tür    | Varsayılan Değer | Açıklama                                             |
| ---------------------------- | ------ | --------------- | --------------------------------------------------- |
| `observation_interval`       | uint64 | `10`            | PRISM gözlem örnekleri arasındaki blok sayısı        |
| `agent_mode`                 | uint   | `0`             | Aracı modu: 0=kapalı, 1=gözlem, 2=öneri, 3=otomatik  |
| `circuit_breaker_enabled`    | bool   | `true`          | PRISM devre kesicisini etkinleştir                  |
| `circuit_breaker_max_change` | string | `0.10`          | Eylem başına maksimum parametre değişikliği (%10)    |
| `circuit_breaker_cooldown`   | uint64 | `100`           | Devre kesici tetiklendikten sonra beklenecek blok sayısı |
| `reward_throughput_weight`   | string | `0.40`          | İş hacmi için ödül ağırlığı                          |
| `reward_latency_weight`      | string | `0.30`          | Gecikme için ödül ağırlığı                           |
| `reward_security_weight`     | string | `0.20`          | Güvenlik için ödül ağırlığı                          |
| `reward_stability_weight`    | string | `0.10`          | Kararlılık için ödül ağırlığı                        |
| `ppo_learning_rate`          | string | `0.0003`        | PPO öğrenme oranı                                    |
| `ppo_clip_range`             | string | `0.20`          | PPO kırpma aralığı                                   |

---

## Köprü Modülü (`x/bridge`)

| Parametre                       | Tür    | Varsayılan Değer | Açıklama                                             |
| ------------------------------- | ------ | --------------- | --------------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`             | IBC transferleri için minimum onay sayısı            |
| `min_confirmations_ethereum`    | uint64 | `12`            | Ethereum köprüsü için minimum onay sayısı            |
| `min_confirmations_bitcoin`     | uint64 | `6`             | Bitcoin köprüsü için minimum onay sayısı             |
| `circuit_breaker_enabled`       | bool   | `true`          | Köprü devre kesicisini etkinleştir                  |
| `circuit_breaker_max_daily_usd` | string | `10000000`      | Maksimum günlük köprü hacmi (USD eşdeğeri)           |
| `circuit_breaker_max_single_tx` | string | `1000000`       | Maksimum tek transfer miktarı (USD eşdeğeri)         |

---

## Çok Katmanlı Modül (`x/multilayer`)

| Parametre                   | Tür    | Varsayılan Değer   | Açıklama                                              |
| --------------------------- | ------ | ------------------ | ---------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | Maksimum kayıtlı yan zincir sayısı                   |
| `max_paychains`             | uint   | `50`               | Maksimum kayıtlı ödeme zinciri sayısı                |
| `anchor_interval_sidechain` | uint64 | `100`              | Yan zincirler için zorunlu çapa aralığı (blok)       |
| `anchor_interval_paychain`  | uint64 | `50`               | Ödeme zincirleri için zorunlu çapa aralığı (blok)    |
| `challenge_period`          | string | `7d`               | Çapalarda dolandırıcılık itirazları için süre        |
| `min_sidechain_stake`       | string | `1000000000uqor`   | Bir yan zincir kaydetmek için minimum stake (1.000 QOR) |
| `min_paychain_stake`        | string | `100000000uqor`    | Bir ödeme zinciri kaydetmek için minimum stake (100 QOR) |
| `routing_threshold`         | string | `0.80`             | Otomatik yönlendirmeyi tetikleyen yük eşiği          |

---

## Çapraz-VM Modülü (`x/crossvm`)

| Parametre          | Tür    | Varsayılan Değer | Açıklama                                            |
| ------------------ | ------ | --------------- | -------------------------------------------------- |
| `max_message_size` | uint64 | `65536`         | Bayt cinsinden maksimum çapraz-VM mesaj boyutu (64 KB) |
| `max_queue_size`   | uint   | `1000`          | Çapraz-VM kuyruğundaki maksimum bekleyen mesaj      |
| `queue_timeout`    | uint64 | `100`           | Bekleyen bir mesajın zaman aşımına uğramasından önceki blok sayısı |

---

## SVM Modülü (`x/svm`)

| Parametre                     | Tür    | Varsayılan Değer | Açıklama                                       |
| ----------------------------- | ------ | --------------- | ---------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`      | Bayt cinsinden maksimum program ikili boyutu (10 MB) |
| `compute_budget`              | uint64 | `1400000`       | İşlem başına varsayılan hesaplama birimi (1.4M) |
| `rent_lamports_per_byte_year` | uint64 | `3480`          | Lamport cinsinden bayt başına yıllık kira maliyeti |
| `rent_exemption_threshold`    | string | `2.0`           | Muafiyet için gereken kira yılı sayısı         |
| `max_accounts_per_tx`         | uint   | `64`            | İşlem başına başvurulan maksimum hesap sayısı  |

---

## RDK Modülü (`x/rdk`)

| Parametre             | Tür    | Varsayılan Değer                      | Açıklama                                |
| --------------------- | ------ | ------------------------------------- | --------------------------------------- |
| `max_rollups`         | uint   | `100`                                 | Maksimum kayıtlı rollup sayısı          |
| `min_stake`           | string | `10000000000uqor`                     | Minimum operatör stake'i (10.000 QOR)   |
| `burn_rate`           | string | `0.01`                                | Yakılan rollup ücretlerinin yüzdesi (%1) |
| `challenge_window`    | string | `7d`                                  | Dolandırıcılık itiraz penceresinin süresi |
| `max_blob_size`       | uint64 | `2097152`                             | Bayt cinsinden maksimum DA blob boyutu (2 MB) |
| `blob_retention`      | uint64 | `432000`                              | DA bloblarını budamadan önce saklama blok sayısı |
| `max_batches_pending` | uint   | `10`                                  | Rollup başına maksimum sonlandırılmamış parti |
| `auto_finalize`       | bool   | `true`                                | EndBlocker otomatik sonlandırmayı etkinleştir |
| `settlement_types`    | array  | optimistic, zk, based, sovereign      | İzin verilen mutabakat paradigmaları    |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | Mevcut rollup ön ayarları               |

---

## FairBlock Modülü (`x/fairblock`)

| Parametre            | Tür    | Varsayılan Değer | Açıklama                                     |
| -------------------- | ------ | --------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`         | FairBlock tIBE şifrelemesini etkinleştir    |
| `tibe_threshold`     | uint   | `2`             | Gereken minimum şifre çözme anahtarı payı   |
| `decryption_delay`   | uint64 | `1`             | Sonlandırma sonrası şifre çözmeden önceki blok sayısı |
| `max_encrypted_size` | uint64 | `4096`          | Bayt cinsinden maksimum şifreli yük boyutu  |

---

## Gaz Soyutlama Modülü (`x/gasabstraction`)

| Parametre         | Tür   | Varsayılan Değer | Açıklama                                              |
| ----------------- | ----- | --------------- | ---------------------------------------------------- |
| `accepted_tokens` | array | (aşağıya bakın) | Dönüşüm oranlarıyla gaz ödemesi için kabul edilen tokenlar |

**Varsayılan kabul edilen tokenlar:**

| Token Denomu | Dönüşüm Oranı | Açıklama               |
| ------------ | ------------- | ---------------------- |
| `uqor`       | `1.0`         | Yerel QOR tokeni (1:1) |
| `ibc/USDC`   | `1.0`         | IBC ile köprülenen USDC |
| `ibc/ATOM`   | `10.0`        | IBC ile köprülenen ATOM |

Dönüşüm oranları, token birimi başına gaz birimi sayısını temsil eder. Daha yüksek oranlar, her token biriminin daha fazla gaz karşıladığı anlamına gelir.
