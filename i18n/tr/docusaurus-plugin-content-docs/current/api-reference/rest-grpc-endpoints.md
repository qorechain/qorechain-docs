---
slug: /api-reference/rest-grpc-endpoints
title: REST / gRPC Uç Noktaları
sidebar_label: REST / gRPC Uç Noktaları
sidebar_position: 1
---

# REST / gRPC Uç Noktaları

QoreChain, programatik erişim için üç temel arayüz sunar:

| Arayüz | Varsayılan Bağlantı Noktası | Protokol  | Açıklama                            |
| ------ | --------------------------- | --------- | ---------------------------------- |
| REST   | `1317`                      | HTTP/1.1  | LCD (Light Client Daemon) REST API |
| gRPC   | `9090`                      | HTTP/2    | Protobuf kodlu gRPC hizmeti        |
| RPC    | `26657`                     | HTTP + WS | QoreChain Uzlaşı Motoru RPC        |

Tüm REST uç noktaları JSON döndürür. gRPC uç noktaları Protocol Buffers kullanır ve herhangi bir gRPC istemcisiyle tüketilebilir. RPC arayüzü, uzlaşı düzeyinde sorgular ve işlem yayını sağlar.

:::note
Bu arayüzler hem **`qorechain-vladi`** ana ağında (7 Haziran 2026'dan beri **v3.1.77** zincir sürümünde canlı) hem de **`qorechain-diana`** test ağında kullanılabilir. Aşağıdaki temel URL'ler yerel olarak çalışan bir düğüm varsayar; uzaktan erişim için sağlayıcınızın ana ağ veya test ağı ana makinesini kullanın.
:::

## Temel URL'ler

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI Modülü

| Yöntem | Uç Nokta                           | Açıklama                                            |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Mevcut AI modülü yapılandırmasını döndürür         |
| GET    | `/ai/v1/stats`                     | Toplu AI işleme istatistikleri                     |
| GET    | `/ai/v1/fee-estimate`              | Bir işlem için yapay zeka destekli gaz ücreti tahmini |
| GET    | `/ai/v1/fraud/investigations`      | Tüm aktif dolandırıcılık soruşturmalarını listeler |
| GET    | `/ai/v1/fraud/investigations/{id}` | Belirli bir dolandırıcılık soruşturmasının ayrıntılarını döndürür |
| GET    | `/ai/v1/network/recommendations`   | Yapay zeka tarafından oluşturulan ağ optimizasyon önerileri |
| GET    | `/ai/v1/circuit-breakers`          | Mevcut devre kesici durumları ve eşik değerleri    |

## Köprü Modülü {#bridge-module}

**v3.1.77** zincir sürümünden itibaren, köprü modülünün salt okunur durumu, grpc-gateway aracılığıyla `/qorechain/bridge/v1/...` öneki altında REST üzerinden açığa çıkarılır (önceden yalnızca gRPC idi). Bu uç noktalar, gezginler ve hafif düğüm telemetrisi için HTTP üzerinden gerçek zincir üstü JSON sunar. Köprü `config` örneğin `min_validators=10` ve `threshold=7` bildirir.

| Yöntem | Uç Nokta                                   | Açıklama                                 |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Mevcut köprü modülü yapılandırması       |
| GET    | `/qorechain/bridge/v1/chains`              | Kayıtlı tüm köprü zincirlerini listeler  |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Belirli bir köprülenmiş zincirin ayrıntıları |
| GET    | `/qorechain/bridge/v1/validators`          | Kayıtlı köprü doğrulayıcılarını listeler |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Belirli bir köprü doğrulayıcısının ayrıntıları |
| GET    | `/qorechain/bridge/v1/operations`          | Köprü işlemlerini listeler               |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Belirli bir köprü işleminin ayrıntıları  |

Aşağıdaki daha kısa yollu uç noktalar kullanılabilir durumda kalır:

| Yöntem | Uç Nokta                            | Açıklama                                       |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Kayıtlı tüm köprü zincirlerini listeler        |
| GET    | `/bridge/v1/chains/{id}`            | Belirli bir köprülenmiş zincirin ayrıntıları   |
| GET    | `/bridge/v1/validators`             | Aktif köprü doğrulayıcılarını listeler         |
| GET    | `/bridge/v1/operations`             | Son köprü işlemlerini listeler                 |
| GET    | `/bridge/v1/operations/{id}`        | Belirli bir köprü işleminin ayrıntıları        |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Bir zincir/varlık çifti için toplam kilitli değer |
| GET    | `/bridge/v1/limits/{chain}`         | Bir köprülenmiş zincir için oran sınırları ve eşikler |
| GET    | `/bridge/v1/estimate`               | Köprü ücretini ve transfer süresini tahmin eder |

## PQC Modülü

| Yöntem | Uç Nokta                     | Açıklama                                       |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | Mevcut PQC modülü parametreleri                |
| GET    | `/pqc/v1/accounts/{address}` | Belirli bir hesap için PQC anahtar durumu      |
| GET    | `/pqc/v1/stats`              | Toplu PQC kayıt ve geçiş istatistikleri        |

## İtibar Modülü

| Yöntem | Uç Nokta                              | Açıklama                                  |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | Tüm doğrulayıcılar için itibar puanları   |
| GET    | `/reputation/v1/validators/{address}` | Belirli bir doğrulayıcı için itibar puanı |

## Cross-VM Modülü

| Yöntem | Uç Nokta                   | Açıklama                                 |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Bir VM'ler arası mesajı kimliğine göre alır |
| GET    | `/crossvm/v1/pending`      | Kuyruktaki bekleyen VM'ler arası mesajları listeler |
| GET    | `/crossvm/v1/params`       | Mevcut Cross-VM modülü parametreleri     |

## Multilayer Modülü

| Yöntem | Uç Nokta                       | Açıklama                                     |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Belirli bir katmanın ayrıntıları             |
| GET    | `/multilayer/v1/layers`        | Kayıtlı tüm katmanları listeler              |
| GET    | `/multilayer/v1/anchor/{id}`   | Belirli bir bağlama kaydının ayrıntıları     |
| GET    | `/multilayer/v1/anchors`       | Son bağlama gönderimlerini listeler          |
| GET    | `/multilayer/v1/routing-stats` | Katmanlar arası işlem yönlendirme istatistikleri |
| GET    | `/multilayer/v1/params`        | Mevcut Multilayer modülü parametreleri       |

## SVM Modülü

| Yöntem | Uç Nokta                    | Açıklama                                          |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | Mevcut SVM modülü parametreleri                   |
| GET    | `/svm/v1/account/{address}` | Belirli bir adres için SVM hesap bilgisi          |
| GET    | `/svm/v1/program/{address}` | Belirli bir program adresi için dağıtılan program bilgisi |

## RL Uzlaşı Modülü

PRISM ayar parametreleri ve pekiştirmeli öğrenme ajan durumu bu modül aracılığıyla açığa çıkarılır.

| Yöntem | Uç Nokta                      | Açıklama                                |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Mevcut PRISM ajan durumu ve modu        |
| GET    | `/rlconsensus/v1/observation` | En son gözlem vektörü                    |
| GET    | `/rlconsensus/v1/rewards`     | Kümülatif ödül metrikleri               |
| GET    | `/rlconsensus/v1/params`      | Mevcut PRISM Uzlaşı modülü parametreleri |
| GET    | `/rlconsensus/v1/policy`      | Aktif politika yapılandırması ve ağırlıklar |

## Burn Modülü

**v3.1.77** zincir sürümünden itibaren, burn modülünün salt okunur durumu, grpc-gateway aracılığıyla `/qorechain/burn/v1/...` öneki altında REST üzerinden açığa çıkarılır (önceden yalnızca gRPC idi). Bu uç noktalar, gezginler ve hafif düğüm telemetrisi için HTTP üzerinden gerçek zincir üstü JSON sunar. Burn `stats` örneğin `gas_burn_rate=0.30` içerir.

| Yöntem | Uç Nokta                       | Açıklama                              |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Mevcut Burn modülü parametreleri     |
| GET    | `/qorechain/burn/v1/stats`     | Tüm kanallardaki yakım istatistikleri |
| GET    | `/qorechain/burn/v1/records`   | Yakım kayıtlarını listeler           |
| GET    | `/qorechain/burn/v1/milestone` | Yakım kilometre taşı ilerlemesi      |

Aşağıdaki daha kısa yollu uç noktalar kullanılabilir durumda kalır:

| Yöntem | Uç Nokta          | Açıklama                              |
| ------ | ----------------- | ------------------------------------- |
| GET    | `/burn/v1/stats`  | Tüm kanallardaki yakım istatistikleri |
| GET    | `/burn/v1/params` | Mevcut Burn modülü parametreleri      |

## xQORE Modülü

| Yöntem | Uç Nokta                       | Açıklama                                    |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Belirli bir adres için xQORE staking pozisyonu |
| GET    | `/xqore/v1/params`             | Mevcut xQORE modülü parametreleri          |

## Inflation Modülü

| Yöntem | Uç Nokta               | Açıklama                            |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | Mevcut yıllıklandırılmış enflasyon oranı |
| GET    | `/inflation/v1/epoch`  | Mevcut epoch numarası ve ilerlemesi |
| GET    | `/inflation/v1/params` | Mevcut Inflation modülü parametreleri |

## RDK Modülü

| Yöntem | Uç Nokta                     | Açıklama                              |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Belirli bir rollup'ın ayrıntıları     |
| GET    | `/rdk/v1/rollups`            | Kayıtlı tüm rollup'ları listeler      |
| GET    | `/rdk/v1/batch/{id}/{index}` | Belirli bir uzlaşma toplu işlemini alır |
| GET    | `/rdk/v1/batches/{id}`       | Belirli bir rollup için toplu işlemleri listeler |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Belirli bir DA blob'unu alır          |
| GET    | `/rdk/v1/params`             | Mevcut RDK modülü parametreleri       |

## Babylon Modülü

| Yöntem | Uç Nokta                         | Açıklama                                 |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Belirli bir adres için BTC staking pozisyonu |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Belirli bir epoch için BTC kontrol noktası verisi |
| GET    | `/babylon/v1/params`             | Mevcut Babylon modülü parametreleri      |

## Abstract Account Modülü

| Yöntem | Uç Nokta                                | Açıklama                                     |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Belirli bir adres için soyut hesap ayrıntıları |
| GET    | `/abstractaccount/v1/params`            | Mevcut Abstract Account modülü parametreleri |

## FairBlock Modülü

| Yöntem | Uç Nokta               | Açıklama                                   |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | Mevcut FairBlock şifreleme yapılandırması  |
| GET    | `/fairblock/v1/params` | Mevcut FairBlock modülü parametreleri      |

## Gas Abstraction Modülü

| Yöntem | Uç Nokta                             | Açıklama                                  |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Gaz ödemesi için kabul edilen tokenları listeler |
| GET    | `/gasabstraction/v1/params`          | Mevcut Gas Abstraction modülü parametreleri |

## gRPC Yansıması

gRPC sunucu yansıması varsayılan olarak etkindir ve `grpcurl` gibi araçların mevcut hizmetleri keşfetmesine olanak tanır:

```bash
grpcurl -plaintext localhost:9090 list
```

Belirli bir hizmeti sorgulamak için:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Kimlik Doğrulama

Tüm REST ve gRPC uç noktaları varsayılan olarak kimlik doğrulamasızdır. Üretim dağıtımları için, TLS sonlandırmasını ve erişim denetimini yönetmek üzere düğümün önüne bir ters proxy (örneğin Nginx veya Caddy) yerleştirin.
