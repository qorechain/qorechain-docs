---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC Uç Noktaları
sidebar_label: REST / gRPC Uç Noktaları
sidebar_position: 1
---

# REST / gRPC Uç Noktaları

QoreChain, programatik erişim için üç temel arayüz sunar:

| Arayüz | Varsayılan Port | Protokol  | Açıklama                        |
| ------ | --------------- | --------- | ------------------------------- |
| REST   | `1317`          | HTTP/1.1  | LCD (Light Client Daemon) REST API |
| gRPC   | `9090`          | HTTP/2    | Protobuf ile kodlanmış gRPC servisi |
| RPC    | `26657`         | HTTP + WS | QoreChain Consensus Engine RPC  |

Tüm REST uç noktaları JSON döndürür. gRPC uç noktaları Protocol Buffers kullanır ve herhangi bir gRPC istemcisiyle tüketilebilir. RPC arayüzü, konsensüs düzeyinde sorgular ve işlem yayını sağlar.

:::note
Bu arayüzler hem **`qorechain-vladi`** ana ağında (7 Haziran 2026'dan beri **v3.1.95** zincir sürümüyle canlı) hem de **`qorechain-diana`** test ağında kullanılabilir. Aşağıdaki temel URL'ler yerel olarak çalışan bir düğüm varsayar; herkese açık barındırılan uç noktalar (`rpc/api/evm/svm.qore.host` ve `-testnet` varyantları) [Ağlar](/appendix/networks#public-endpoints) sayfasında listelenmiştir.
:::

## Temel URL'ler

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI Modülü

| Metot | Uç Nokta                           | Açıklama                                                 |
| ----- | ----------------------------------- | --------------------------------------------------------- |
| GET   | `/ai/v1/config`                    | Geçerli AI modülü yapılandırmasını döndürür               |
| GET   | `/ai/v1/stats`                     | Toplulaştırılmış AI işleme istatistikleri                 |
| GET   | `/ai/v1/fee-estimate`              | Bir işlem için AI destekli gas ücreti tahmini             |
| GET   | `/ai/v1/fraud/investigations`      | Tüm aktif dolandırıcılık soruşturmalarını listeler        |
| GET   | `/ai/v1/fraud/investigations/{id}` | Belirli bir dolandırıcılık soruşturmasının ayrıntılarını döndürür |
| GET   | `/ai/v1/network/recommendations`   | AI tarafından üretilen ağ optimizasyonu önerileri         |
| GET   | `/ai/v1/circuit-breakers`          | Geçerli devre kesici durumları ve eşikleri                |

## Bridge Modülü {#bridge-module}

Zincir sürümü **v3.1.77** itibarıyla, bridge modülünün salt okunur durumu grpc-gateway aracılığıyla `/qorechain/bridge/v1/...` öneki altında REST üzerinden sunulmaktadır (önceden yalnızca gRPC idi). Bu uç noktalar, gezginler (explorer) ve hafif düğüm telemetrisi için HTTP üzerinden gerçek zincir üstü JSON sunar. Bridge `config` çıktısı örneğin `min_validators=10` ve `threshold=7` değerlerini raporlar.

| Metot | Uç Nokta                                    | Açıklama                                         |
| ----- | -------------------------------------------- | -------------------------------------------------- |
| GET   | `/qorechain/bridge/v1/config`               | Geçerli bridge modülü yapılandırması             |
| GET   | `/qorechain/bridge/v1/chains`               | Kayıtlı tüm bridge zincirlerini listeler         |
| GET   | `/qorechain/bridge/v1/chains/{chain_id}`    | Köprülenmiş belirli bir zincirin ayrıntıları     |
| GET   | `/qorechain/bridge/v1/validators`           | Kayıtlı bridge doğrulayıcılarını listeler        |
| GET   | `/qorechain/bridge/v1/validators/{address}` | Belirli bir bridge doğrulayıcısının ayrıntıları  |
| GET   | `/qorechain/bridge/v1/operations`           | Bridge operasyonlarını listeler                  |
| GET   | `/qorechain/bridge/v1/operations/{id}`      | Belirli bir bridge operasyonunun ayrıntıları     |

Aşağıdaki kısa yollu uç noktalar kullanılabilir olmaya devam etmektedir:

| Metot | Uç Nokta                            | Açıklama                                                    |
| ----- | ------------------------------------ | ------------------------------------------------------------ |
| GET   | `/bridge/v1/chains`                 | Kayıtlı tüm bridge zincirlerini listeler                    |
| GET   | `/bridge/v1/chains/{id}`            | Köprülenmiş belirli bir zincirin ayrıntıları                |
| GET   | `/bridge/v1/validators`             | Aktif bridge doğrulayıcılarını listeler                     |
| GET   | `/bridge/v1/operations`             | Son bridge operasyonlarını listeler                         |
| GET   | `/bridge/v1/operations/{id}`        | Belirli bir bridge operasyonunun ayrıntıları                |
| GET   | `/bridge/v1/locked/{chain}/{asset}` | Bir zincir/varlık çifti için toplam kilitli değer            |
| GET   | `/bridge/v1/limits/{chain}`         | Köprülenmiş bir zincir için hız limitleri ve eşikler         |
| GET   | `/bridge/v1/estimate`               | Bridge ücretini ve transfer süresini tahmin eder             |

## PQC Modülü

| Metot | Uç Nokta                     | Açıklama                                             |
| ----- | ----------------------------- | ------------------------------------------------------ |
| GET   | `/pqc/v1/params`             | Geçerli PQC modülü parametreleri                      |
| GET   | `/pqc/v1/accounts/{address}` | Belirli bir hesap için PQC anahtar durumu             |
| GET   | `/pqc/v1/stats`              | Toplam PQC kayıt ve geçiş istatistikleri              |

## Reputation Modülü

| Metot | Uç Nokta                              | Açıklama                                         |
| ----- | -------------------------------------- | --------------------------------------------------- |
| GET   | `/reputation/v1/validators`           | Tüm doğrulayıcılar için itibar puanları          |
| GET   | `/reputation/v1/validators/{address}` | Belirli bir doğrulayıcı için itibar puanı        |

## Cross-VM Modülü

| Metot | Uç Nokta                   | Açıklama                                            |
| ----- | ---------------------------- | ------------------------------------------------------ |
| GET   | `/crossvm/v1/message/{id}` | ID'ye göre bir cross-VM mesajını getirir            |
| GET   | `/crossvm/v1/pending`      | Kuyruktaki bekleyen cross-VM mesajlarını listeler   |
| GET   | `/crossvm/v1/params`       | Geçerli Cross-VM modülü parametreleri               |

## Multilayer Modülü {#multilayer-module}

Zincir sürümü **v3.1.80** itibarıyla, multilayer modülünün tam sorgu servisi grpc-gateway aracılığıyla `/qorechain/multilayer/v1/...` öneki altında REST üzerinden sunulmaktadır (önceden yalnızca gRPC idi); buna iki **durum çıpası (state-anchor) okuma sorgusu** da dahildir: `anchor/{layer_id}` bir katman için en son uzlaşı (settlement) çıpasını, `anchors/{layer_id}` ise o katmanın çıpa geçmişini döndürür. Her çıpa, kanonik alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır; böylece bir istemci bir çıpayı çekip bağımsız olarak doğrulayabilir — bu, Rollup Development Kit'in [uzlaşı makbuzlarının](/rollups/settlement-receipts) zincir üstü temelidir.

| Metot | Uç Nokta                                        | Açıklama                                           |
| ----- | ------------------------------------------------- | ----------------------------------------------------- |
| GET   | `/qorechain/multilayer/v1/params`               | Geçerli Multilayer modülü parametreleri              |
| GET   | `/qorechain/multilayer/v1/layers`               | Kayıtlı tüm katmanları listeler                      |
| GET   | `/qorechain/multilayer/v1/layers/{layer_id}`    | Belirli bir katmanın ayrıntıları                     |
| GET   | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Bir katman için en son durum çıpası                  |
| GET   | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Bir katman için durum çıpası geçmişi                 |
| GET   | `/qorechain/multilayer/v1/routing-stats`        | Katmanlar arası işlem yönlendirme istatistikleri     |

Bir `StateAnchorView` şunları içerir: `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` ve `compressed_state_proof`. İmzalanan kanonik mesaj `layer_id || layer_height || state_root || validator_set_hash` olup, katman oluşturucusunun kayıtlı PQC anahtarına karşı doğrulanır.

Aşağıdaki kısa yollu uç noktalar kullanılabilir olmaya devam etmektedir:

| Metot | Uç Nokta                       | Açıklama                                         |
| ----- | -------------------------------- | ----------------------------------------------------- |
| GET   | `/multilayer/v1/layer/{id}`    | Belirli bir katmanın ayrıntıları                 |
| GET   | `/multilayer/v1/layers`        | Kayıtlı tüm katmanları listeler                  |
| GET   | `/multilayer/v1/anchor/{id}`   | Belirli bir çıpa kaydının ayrıntıları            |
| GET   | `/multilayer/v1/anchors`       | Son çıpa gönderimlerini listeler                 |
| GET   | `/multilayer/v1/routing-stats` | Katmanlar arası işlem yönlendirme istatistikleri |
| GET   | `/multilayer/v1/params`        | Geçerli Multilayer modülü parametreleri          |

## SVM Modülü

| Metot | Uç Nokta                    | Açıklama                                                    |
| ----- | ----------------------------- | ---------------------------------------------------------------- |
| GET   | `/svm/v1/params`            | Geçerli SVM modülü parametreleri                              |
| GET   | `/svm/v1/account/{address}` | Verilen bir adres için SVM hesap bilgisi                      |
| GET   | `/svm/v1/program/{address}` | Verilen bir program adresi için dağıtılmış program bilgisi    |

## RL Consensus Modülü

PRISM ayar parametreleri ve pekiştirmeli öğrenme ajanının durumu bu modül aracılığıyla sunulur.

| Metot | Uç Nokta                      | Açıklama                                    |
| ----- | -------------------------------- | ------------------------------------------------ |
| GET   | `/rlconsensus/v1/agent`       | Geçerli PRISM ajan durumu ve modu                |
| GET   | `/rlconsensus/v1/observation` | En son gözlem vektörü                            |
| GET   | `/rlconsensus/v1/rewards`     | Kümülatif ödül metrikleri                        |
| GET   | `/rlconsensus/v1/params`      | Geçerli PRISM Consensus modülü parametreleri     |
| GET   | `/rlconsensus/v1/policy`      | Aktif politika yapılandırması ve ağırlıkları     |

## Burn Modülü

Zincir sürümü **v3.1.77** itibarıyla, burn modülünün salt okunur durumu grpc-gateway aracılığıyla `/qorechain/burn/v1/...` öneki altında REST üzerinden sunulmaktadır (önceden yalnızca gRPC idi). Bu uç noktalar, gezginler (explorer) ve hafif düğüm telemetrisi için HTTP üzerinden gerçek zincir üstü JSON sunar. Burn `stats` çıktısı örneğin `gas_burn_rate=0.30` değerini içerir.

| Metot | Uç Nokta                       | Açıklama                            |
| ----- | --------------------------------- | ---------------------------------------- |
| GET   | `/qorechain/burn/v1/params`    | Geçerli Burn modülü parametreleri        |
| GET   | `/qorechain/burn/v1/stats`     | Tüm kanallardaki yakım istatistikleri    |
| GET   | `/qorechain/burn/v1/records`   | Yakım kayıtlarını listeler               |
| GET   | `/qorechain/burn/v1/milestone` | Yakım kilometre taşı ilerlemesi          |

Aşağıdaki kısa yollu uç noktalar kullanılabilir olmaya devam etmektedir:

| Metot | Uç Nokta          | Açıklama                                |
| ----- | ------------------- | ------------------------------------------ |
| GET   | `/burn/v1/stats`  | Tüm kanallardaki yakım istatistikleri    |
| GET   | `/burn/v1/params` | Geçerli Burn modülü parametreleri        |

## xQORE Modülü

| Metot | Uç Nokta                       | Açıklama                                          |
| ----- | --------------------------------- | ------------------------------------------------------ |
| GET   | `/xqore/v1/position/{address}` | Verilen bir adres için xQORE staking pozisyonu       |
| GET   | `/xqore/v1/params`             | Geçerli xQORE modülü parametreleri                   |

## Inflation Modülü

| Metot | Uç Nokta               | Açıklama                                     |
| ----- | ------------------------- | --------------------------------------------------- |
| GET   | `/inflation/v1/rate`   | Geçerli yıllıklandırılmış enflasyon oranı     |
| GET   | `/inflation/v1/epoch`  | Geçerli epoch numarası ve ilerlemesi          |
| GET   | `/inflation/v1/params` | Geçerli Inflation modülü parametreleri        |

## RDK Modülü

| Metot | Uç Nokta                     | Açıklama                                          |
| ----- | ------------------------------- | -------------------------------------------------- |
| GET   | `/rdk/v1/rollup/{id}`        | Belirli bir rollup'ın ayrıntıları                 |
| GET   | `/rdk/v1/rollups`            | Kayıtlı tüm rollup'ları listeler                  |
| GET   | `/rdk/v1/batch/{id}/{index}` | Belirli bir uzlaşı (settlement) batch'ini getirir |
| GET   | `/rdk/v1/batches/{id}`       | Belirli bir rollup için batch'leri listeler       |
| GET   | `/rdk/v1/blob/{id}/{index}`  | Belirli bir DA blob'unu getirir                   |
| GET   | `/rdk/v1/params`             | Geçerli RDK modülü parametreleri                  |

## Babylon Modülü

| Metot | Uç Nokta                         | Açıklama                                                |
| ----- | ----------------------------------- | ------------------------------------------------------------ |
| GET   | `/babylon/v1/staking/{address}`  | Verilen bir adres için BTC staking pozisyonu           |
| GET   | `/babylon/v1/checkpoint/{epoch}` | Verilen bir epoch için BTC checkpoint verisi           |
| GET   | `/babylon/v1/params`             | Geçerli Babylon modülü parametreleri                   |

## Abstract Account Modülü

Zincir sürümü **v3.1.85** itibarıyla, abstract-account sorgu servisi grpc-gateway aracılığıyla `/qorechain/abstractaccount/v1/...` öneki altında REST üzerinden sunulmaktadır; buna, [authenticator](/developer-guide/account-abstraction#authenticators) kapsamlarını sabit kodlama olmadan doğrulamak için kullanılan **izin şeması** da dahildir.

| Metot | Uç Nokta                                              | Açıklama                                                       |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| GET   | `/qorechain/abstractaccount/v1/config`                | Modül yapılandırması (özellik denetimi: `enabled`)                 |
| GET   | `/qorechain/abstractaccount/v1/accounts`              | Abstract hesapları listeler                                        |
| GET   | `/qorechain/abstractaccount/v1/accounts/{address}`    | Bir adres için abstract-account durumu                             |
| GET   | `/qorechain/abstractaccount/v1/permission_schema`     | İzin taksonomisi, msg→izin eşlemesi, devredilemez msg'ler          |

Aşağıdaki kısa yollu uç noktalar kullanılabilir olmaya devam etmektedir:

| Metot | Uç Nokta                                | Açıklama                                                |
| ----- | ------------------------------------------ | -------------------------------------------------------- |
| GET   | `/abstractaccount/v1/account/{address}` | Verilen bir adres için abstract account ayrıntıları       |
| GET   | `/abstractaccount/v1/params`            | Geçerli Abstract Account modülü parametreleri             |

## FairBlock Modülü

| Metot | Uç Nokta               | Açıklama                                          |
| ----- | ------------------------- | -------------------------------------------------- |
| GET   | `/fairblock/v1/config` | Geçerli FairBlock şifreleme yapılandırması         |
| GET   | `/fairblock/v1/params` | Geçerli FairBlock modülü parametreleri             |

## Gas Abstraction Modülü

| Metot | Uç Nokta                             | Açıklama                                            |
| ----- | --------------------------------------- | ---------------------------------------------------- |
| GET   | `/gasabstraction/v1/accepted-tokens` | Gas ödemesi için kabul edilen token'ları listeler    |
| GET   | `/gasabstraction/v1/params`          | Geçerli Gas Abstraction modülü parametreleri         |

## gRPC Reflection

gRPC sunucu yansıması (reflection) varsayılan olarak etkindir; bu sayede `grpcurl` gibi araçlar mevcut servisleri keşfedebilir:

```bash
grpcurl -plaintext localhost:9090 list
```

Belirli bir servisi sorgulamak için:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Kimlik Doğrulama

Tüm REST ve gRPC uç noktaları varsayılan olarak kimlik doğrulamasızdır. Üretim dağıtımlarında, TLS sonlandırma ve erişim denetimini yönetmek için düğümün önüne bir ters proxy (ör. Nginx veya Caddy) yerleştirin.
