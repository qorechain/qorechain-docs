---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC Uç Noktaları
sidebar_label: REST / gRPC Uç Noktaları
sidebar_position: 1
---

# REST / gRPC Uç Noktaları

QoreChain, programatik erişim için üç temel arayüz sunar:

| Arayüz | Varsayılan Port | Protokol  | Açıklama                            |
| ------ | --------------- | --------- | ----------------------------------- |
| REST   | `1317`          | HTTP/1.1  | LCD (Light Client Daemon) REST API  |
| gRPC   | `9090`          | HTTP/2    | Protobuf ile kodlanmış gRPC servisi |
| RPC    | `26657`         | HTTP + WS | QoreChain Mutabakat Motoru RPC      |

Tüm REST uç noktaları JSON döndürür. gRPC uç noktaları Protocol Buffers kullanır ve herhangi bir gRPC istemcisiyle tüketilebilir. RPC arayüzü, mutabakat düzeyinde sorgular ve işlem yayını sağlar.

:::note
Bu arayüzler hem **`qorechain-vladi`** ana ağında (7 Haziran 2026'dan beri **v3.1.80** zincir sürümünde canlı) hem de **`qorechain-diana`** test ağında kullanılabilir. Aşağıdaki temel URL'ler yerel olarak çalışan bir düğüm varsayar; uzaktan erişim için sağlayıcınızın ana ağ veya test ağı ana bilgisayarını kullanın.
:::

## Temel URL'ler

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI Modülü

| Metot | Uç Nokta                           | Açıklama                                              |
| ----- | ---------------------------------- | ---------------------------------------------------- |
| GET   | `/ai/v1/config`                    | Mevcut AI modülü yapılandırmasını döndürür           |
| GET   | `/ai/v1/stats`                     | Toplu AI işleme istatistikleri                       |
| GET   | `/ai/v1/fee-estimate`              | Bir işlem için AI destekli gaz ücreti tahmini        |
| GET   | `/ai/v1/fraud/investigations`      | Tüm aktif dolandırıcılık soruşturmalarını listeler   |
| GET   | `/ai/v1/fraud/investigations/{id}` | Belirli bir dolandırıcılık soruşturmasının ayrıntıları |
| GET   | `/ai/v1/network/recommendations`   | AI tarafından üretilen ağ optimizasyon önerileri     |
| GET   | `/ai/v1/circuit-breakers`          | Mevcut devre kesici durumları ve eşikleri            |

## Bridge Modülü {#bridge-module}

**v3.1.77** zincir sürümünden itibaren, bridge modülünün salt okunur durumu, grpc-gateway aracılığıyla `/qorechain/bridge/v1/...` öneki altında REST üzerinden sunulur (önceden yalnızca gRPC idi). Bu uç noktalar, gezginler ve hafif düğüm telemetrisi için HTTP üzerinden gerçek zincir üstü JSON sunar. Bridge `config` örneğin `min_validators=10` ve `threshold=7` raporlar.

| Metot | Uç Nokta                                   | Açıklama                                       |
| ----- | ------------------------------------------ | --------------------------------------------- |
| GET   | `/qorechain/bridge/v1/config`              | Mevcut bridge modülü yapılandırması           |
| GET   | `/qorechain/bridge/v1/chains`              | Kayıtlı tüm bridge zincirlerini listeler      |
| GET   | `/qorechain/bridge/v1/chains/{chain_id}`   | Belirli bir köprülenmiş zincirin ayrıntıları  |
| GET   | `/qorechain/bridge/v1/validators`          | Kayıtlı bridge doğrulayıcılarını listeler     |
| GET   | `/qorechain/bridge/v1/validators/{address}`| Belirli bir bridge doğrulayıcısının ayrıntıları |
| GET   | `/qorechain/bridge/v1/operations`          | Bridge işlemlerini listeler                   |
| GET   | `/qorechain/bridge/v1/operations/{id}`     | Belirli bir bridge işleminin ayrıntıları      |

Aşağıdaki kısa yollu uç noktalar kullanılabilir durumda kalır:

| Metot | Uç Nokta                            | Açıklama                                          |
| ----- | ----------------------------------- | ------------------------------------------------ |
| GET   | `/bridge/v1/chains`                 | Kayıtlı tüm bridge zincirlerini listeler         |
| GET   | `/bridge/v1/chains/{id}`            | Belirli bir köprülenmiş zincirin ayrıntıları     |
| GET   | `/bridge/v1/validators`             | Aktif bridge doğrulayıcılarını listeler          |
| GET   | `/bridge/v1/operations`             | Son bridge işlemlerini listeler                  |
| GET   | `/bridge/v1/operations/{id}`        | Belirli bir bridge işleminin ayrıntıları         |
| GET   | `/bridge/v1/locked/{chain}/{asset}` | Bir zincir/varlık çifti için toplam kilitli değer |
| GET   | `/bridge/v1/limits/{chain}`         | Köprülenmiş bir zincir için hız limitleri ve eşikler |
| GET   | `/bridge/v1/estimate`               | Bridge ücretini ve transfer süresini tahmin eder |

## PQC Modülü

| Metot | Uç Nokta                     | Açıklama                                          |
| ----- | ---------------------------- | ------------------------------------------------ |
| GET   | `/pqc/v1/params`             | Mevcut PQC modülü parametreleri                  |
| GET   | `/pqc/v1/accounts/{address}` | Belirli bir hesap için PQC anahtar durumu        |
| GET   | `/pqc/v1/stats`              | Toplu PQC kayıt ve geçiş istatistikleri          |

## Reputation Modülü

| Metot | Uç Nokta                              | Açıklama                                       |
| ----- | ------------------------------------- | --------------------------------------------- |
| GET   | `/reputation/v1/validators`           | Tüm doğrulayıcılar için itibar puanları       |
| GET   | `/reputation/v1/validators/{address}` | Belirli bir doğrulayıcı için itibar puanı     |

## Cross-VM Modülü

| Metot | Uç Nokta                   | Açıklama                                       |
| ----- | -------------------------- | --------------------------------------------- |
| GET   | `/crossvm/v1/message/{id}` | Bir cross-VM mesajını ID'ye göre getirir       |
| GET   | `/crossvm/v1/pending`      | Kuyruktaki bekleyen cross-VM mesajlarını listeler |
| GET   | `/crossvm/v1/params`       | Mevcut Cross-VM modülü parametreleri          |

## Multilayer Modülü {#multilayer-module}

**v3.1.80** zincir sürümünden itibaren, multilayer modülünün tam sorgu servisi, grpc-gateway aracılığıyla `/qorechain/multilayer/v1/...` öneki altında REST üzerinden sunulur (önceden yalnızca gRPC idi); bu, iki **durum-çapası okuma sorgusu** içerir: `anchor/{layer_id}` bir katman için en son uzlaşma çapasını döndürür ve `anchors/{layer_id}` onun çapa geçmişini döndürür. Her çapa, kanonik alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır, böylece bir istemci bir çapayı getirebilir ve onu bağımsız olarak doğrulayabilir — Rollup Development Kit'in [uzlaşma makbuzları](/rollups/settlement-receipts) için zincir üstü temel budur.

| Metot | Uç Nokta                                        | Açıklama                                          |
| ----- | ----------------------------------------------- | ------------------------------------------------- |
| GET   | `/qorechain/multilayer/v1/params`               | Mevcut Multilayer modülü parametreleri            |
| GET   | `/qorechain/multilayer/v1/layers`               | Kayıtlı tüm katmanları listeler                   |
| GET   | `/qorechain/multilayer/v1/layers/{layer_id}`    | Belirli bir katmanın ayrıntıları                  |
| GET   | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Bir katman için en son durum çapası               |
| GET   | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Bir katman için durum-çapası geçmişi              |
| GET   | `/qorechain/multilayer/v1/routing-stats`        | Katmanlar arası işlem yönlendirme istatistikleri  |

Bir `StateAnchorView`, `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` ve `compressed_state_proof` içerir. İmzalanan kanonik mesaj `layer_id || layer_height || state_root || validator_set_hash` olup, katman oluşturucusunun kayıtlı PQC anahtarına karşı doğrulanır.

Aşağıdaki kısa yollu uç noktalar kullanılabilir durumda kalır:

| Metot | Uç Nokta                       | Açıklama                                          |
| ----- | ------------------------------ | ------------------------------------------------ |
| GET   | `/multilayer/v1/layer/{id}`    | Belirli bir katmanın ayrıntıları                 |
| GET   | `/multilayer/v1/layers`        | Kayıtlı tüm katmanları listeler                  |
| GET   | `/multilayer/v1/anchor/{id}`   | Belirli bir çapa kaydının ayrıntıları            |
| GET   | `/multilayer/v1/anchors`       | Son çapa gönderimlerini listeler                 |
| GET   | `/multilayer/v1/routing-stats` | Katmanlar arası işlem yönlendirme istatistikleri |
| GET   | `/multilayer/v1/params`        | Mevcut Multilayer modülü parametreleri           |

## SVM Modülü

| Metot | Uç Nokta                    | Açıklama                                           |
| ----- | --------------------------- | ------------------------------------------------- |
| GET   | `/svm/v1/params`            | Mevcut SVM modülü parametreleri                   |
| GET   | `/svm/v1/account/{address}` | Belirli bir adres için SVM hesap bilgisi          |
| GET   | `/svm/v1/program/{address}` | Belirli bir program adresi için dağıtılmış program bilgisi |

## RL Consensus Modülü

PRISM ayar parametreleri ve pekiştirmeli öğrenme aracı durumu bu modül aracılığıyla sunulur.

| Metot | Uç Nokta                      | Açıklama                                  |
| ----- | ----------------------------- | ----------------------------------------- |
| GET   | `/rlconsensus/v1/agent`       | Mevcut PRISM aracı durumu ve modu         |
| GET   | `/rlconsensus/v1/observation` | En son gözlem vektörü                     |
| GET   | `/rlconsensus/v1/rewards`     | Kümülatif ödül metrikleri                 |
| GET   | `/rlconsensus/v1/params`      | Mevcut PRISM Consensus modülü parametreleri |
| GET   | `/rlconsensus/v1/policy`      | Aktif politika yapılandırması ve ağırlıkları |

## Burn Modülü

**v3.1.77** zincir sürümünden itibaren, burn modülünün salt okunur durumu, grpc-gateway aracılığıyla `/qorechain/burn/v1/...` öneki altında REST üzerinden sunulur (önceden yalnızca gRPC idi). Bu uç noktalar, gezginler ve hafif düğüm telemetrisi için HTTP üzerinden gerçek zincir üstü JSON sunar. Burn `stats` örneğin `gas_burn_rate=0.30` içerir.

| Metot | Uç Nokta                       | Açıklama                              |
| ----- | ------------------------------ | ------------------------------------ |
| GET   | `/qorechain/burn/v1/params`    | Mevcut Burn modülü parametreleri     |
| GET   | `/qorechain/burn/v1/stats`     | Tüm kanallar genelinde yakım istatistikleri |
| GET   | `/qorechain/burn/v1/records`   | Yakım kayıtlarını listeler           |
| GET   | `/qorechain/burn/v1/milestone` | Yakım kilometre taşı ilerlemesi      |

Aşağıdaki kısa yollu uç noktalar kullanılabilir durumda kalır:

| Metot | Uç Nokta          | Açıklama                                     |
| ----- | ----------------- | ------------------------------------------- |
| GET   | `/burn/v1/stats`  | Tüm kanallar genelinde yakım istatistikleri |
| GET   | `/burn/v1/params` | Mevcut Burn modülü parametreleri            |

## xQORE Modülü

| Metot | Uç Nokta                       | Açıklama                                       |
| ----- | ------------------------------ | --------------------------------------------- |
| GET   | `/xqore/v1/position/{address}` | Belirli bir adres için xQORE stake pozisyonu  |
| GET   | `/xqore/v1/params`             | Mevcut xQORE modülü parametreleri             |

## Inflation Modülü

| Metot | Uç Nokta               | Açıklama                              |
| ----- | ---------------------- | ------------------------------------ |
| GET   | `/inflation/v1/rate`   | Mevcut yıllıklandırılmış enflasyon oranı |
| GET   | `/inflation/v1/epoch`  | Mevcut epoch numarası ve ilerlemesi  |
| GET   | `/inflation/v1/params` | Mevcut Inflation modülü parametreleri |

## RDK Modülü

| Metot | Uç Nokta                     | Açıklama                              |
| ----- | ---------------------------- | ------------------------------------ |
| GET   | `/rdk/v1/rollup/{id}`        | Belirli bir rollup'ın ayrıntıları    |
| GET   | `/rdk/v1/rollups`            | Kayıtlı tüm rollup'ları listeler     |
| GET   | `/rdk/v1/batch/{id}/{index}` | Belirli bir uzlaşma partisini getirir |
| GET   | `/rdk/v1/batches/{id}`       | Belirli bir rollup için partileri listeler |
| GET   | `/rdk/v1/blob/{id}/{index}`  | Belirli bir DA blob'unu getirir      |
| GET   | `/rdk/v1/params`             | Mevcut RDK modülü parametreleri      |

## Babylon Modülü

| Metot | Uç Nokta                         | Açıklama                                       |
| ----- | -------------------------------- | --------------------------------------------- |
| GET   | `/babylon/v1/staking/{address}`  | Belirli bir adres için BTC stake pozisyonu    |
| GET   | `/babylon/v1/checkpoint/{epoch}` | Belirli bir epoch için BTC checkpoint verisi  |
| GET   | `/babylon/v1/params`             | Mevcut Babylon modülü parametreleri           |

## Abstract Account Modülü

| Metot | Uç Nokta                                | Açıklama                                          |
| ----- | --------------------------------------- | ------------------------------------------------ |
| GET   | `/abstractaccount/v1/account/{address}` | Belirli bir adres için soyut hesap ayrıntıları   |
| GET   | `/abstractaccount/v1/params`            | Mevcut Abstract Account modülü parametreleri     |

## FairBlock Modülü

| Metot | Uç Nokta               | Açıklama                                    |
| ----- | ---------------------- | ------------------------------------------- |
| GET   | `/fairblock/v1/config` | Mevcut FairBlock şifreleme yapılandırması   |
| GET   | `/fairblock/v1/params` | Mevcut FairBlock modülü parametreleri       |

## Gas Abstraction Modülü

| Metot | Uç Nokta                             | Açıklama                                       |
| ----- | ------------------------------------ | --------------------------------------------- |
| GET   | `/gasabstraction/v1/accepted-tokens` | Gaz ödemesi için kabul edilen tokenları listeler |
| GET   | `/gasabstraction/v1/params`          | Mevcut Gas Abstraction modülü parametreleri   |

## gRPC Reflection

gRPC sunucu yansıması varsayılan olarak etkindir; bu, `grpcurl` gibi araçların kullanılabilir servisleri keşfetmesine olanak tanır:

```bash
grpcurl -plaintext localhost:9090 list
```

Belirli bir servisi sorgulamak için:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Kimlik Doğrulama

Tüm REST ve gRPC uç noktaları varsayılan olarak kimlik doğrulamasızdır. Üretim dağıtımları için, TLS sonlandırma ve erişim denetimini yönetmek üzere düğümün önüne bir ters proxy (örneğin Nginx veya Caddy) yerleştirin.
