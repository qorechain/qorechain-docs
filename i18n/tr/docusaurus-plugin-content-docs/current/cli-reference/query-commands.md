---
slug: /cli-reference/query-commands
title: Sorgu Komutları
sidebar_label: Sorgu Komutları
sidebar_position: 3
---

# Sorgu Komutları

Tüm sorgu komutları şu kalıbı izler:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Sorgular, `--node` ile hangi düğüm gösteriliyorsa ona karşı çalışır. Canlı veriler için bir **`qorechain-vladi`** ana ağ RPC uç noktası (zincir sürümü **v3.1.77**), test için bir **`qorechain-diana`** test ağı uç noktası kullanın. Varsayılan `tcp://localhost:26657`, kendi çalıştırdığınız bir düğümü hedefler.
:::

Ortak bayraklar her `query` alt komutu için geçerlidir:

| Bayrak     | Tür    | Açıklama                                        |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |
| `--output` | string | Çıktı formatı: `json` veya `text`               |
| `--height` | int    | Durumu belirli bir blok yüksekliğinde sorgula   |

---

## bank

### balances

Bir hesabın tüm bakiyelerini sorgulayın.

```bash
qorechaind query bank balances <address>
```

### total

Tüm token'ların toplam arzını sorgulayın.

```bash
qorechaind query bank total
```

---

## staking

### validator

Operatör adresine göre tek bir doğrulayıcıyı sorgulayın.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Tüm doğrulayıcıları listeleyin.

```bash
qorechaind query staking validators
```

### delegation

Bir delege edenden (delegator) bir doğrulayıcıya yapılan delegasyonu sorgulayın.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Bir delege eden için tüm delegasyonları sorgulayın.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Bir bağ çözme (unbonding) delegasyonunu sorgulayın.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Bir delege eden için tüm delegasyon ödüllerini sorgulayın.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Doğrulayıcı komisyonunu sorgulayın.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Kimliğe göre tek bir teklifi sorgulayın.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

İsteğe bağlı olarak duruma göre filtrelenmiş tüm teklifleri listeleyin.

```bash
qorechaind query gov proposals [flags]
```

| Bayrak     | Tür    | Açıklama                                                                  |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | Duruma göre filtrele: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Bir teklif üzerindeki oyları sorgulayın.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Bir hesap için PQC anahtar kayıt durumunu sorgulayın.

```bash
qorechaind query pqc account <address>
```

### algorithms

Desteklenen tüm PQC algoritmalarını listeleyin.

```bash
qorechaind query pqc algorithms
```

### algorithm

Belirli bir PQC algoritması için ayrıntıları sorgulayın.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Toplu PQC kayıt istatistiklerini sorgulayın.

```bash
qorechaind query pqc stats
```

### params

PQC modülü parametrelerini sorgulayın.

```bash
qorechaind query pqc params
```

### migration

Bir hesap için PQC anahtar geçiş durumunu sorgulayın.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Mevcut hibrit imza zorunlu kılma modunu sorgulayın.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Bir adres için xQORE staking pozisyonunu sorgulayın.

```bash
qorechaind query xqore position <address>
```

### params

xQORE modülü parametrelerini sorgulayın.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Tüm kanallardaki yakma istatistiklerini sorgulayın.

```bash
qorechaind query burn stats
```

### params

Yakma modülü parametrelerini sorgulayın.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Mevcut yıllıklandırılmış enflasyon oranını sorgulayın.

```bash
qorechaind query inflation rate
```

### epoch

Mevcut epoch numarasını ve ilerlemeyi sorgulayın.

```bash
qorechaind query inflation epoch
```

### params

Enflasyon modülü parametrelerini sorgulayın.

```bash
qorechaind query inflation params
```

---

## ai

### config

AI modülü yapılandırmasını sorgulayın.

```bash
qorechaind query ai config
```

### stats

Toplu AI işleme istatistiklerini sorgulayın.

```bash
qorechaind query ai stats
```

### fee-estimate

AI destekli bir gaz ücreti tahmini alın.

```bash
qorechaind query ai fee-estimate [flags]
```

| Bayrak      | Tür    | Açıklama                        |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | Tahmin için işlem türü          |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

Aktif dolandırıcılık soruşturmalarını listeleyin.

```bash
qorechaind query ai investigations
```

### recommendations

AI tarafından üretilen ağ optimizasyon önerilerini alın.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Mevcut devre kesici durumlarını sorgulayın.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Tüm doğrulayıcılar için itibar puanlarını sorgulayın.

```bash
qorechaind query reputation validators
```

### validator

Belirli bir doğrulayıcı için itibar puanını sorgulayın.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Kayıtlı tüm köprü zincirlerini listeleyin.

```bash
qorechaind query bridge chains
```

### chain

Belirli bir köprülenmiş zincir için ayrıntıları sorgulayın.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Aktif köprü doğrulayıcılarını listeleyin.

```bash
qorechaind query bridge validators
```

### operations

Son köprü işlemlerini listeleyin.

```bash
qorechaind query bridge operations
```

| Bayrak     | Tür    | Açıklama                                 |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filtre: `pending`, `completed`, `failed` |
| `--chain`  | string | Zincir kimliğine göre filtrele           |

### limits

Köprülenmiş bir zincir için hız sınırlarını sorgulayın.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Köprü ücretini ve transfer süresini tahmin edin.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Bir çapraz-VM mesajını kimliğe göre alın.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Bekleyen çapraz-VM mesajlarını listeleyin.

```bash
qorechaind query crossvm pending
```

### params

Çapraz-VM modülü parametrelerini sorgulayın.

```bash
qorechaind query crossvm params
```

---

## svm

### account

SVM hesap bilgilerini sorgulayın.

```bash
qorechaind query svm account <pubkey>
```

### program

Dağıtılmış SVM program bilgilerini sorgulayın.

```bash
qorechaind query svm program <program_id>
```

### params

SVM modülü parametrelerini sorgulayın.

```bash
qorechaind query svm params
```

### slot

Mevcut SVM slot numarasını sorgulayın.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Belirli bir katman için ayrıntıları sorgulayın.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Kayıtlı tüm katmanları listeleyin.

```bash
qorechaind query multilayer layers
```

### anchor

Belirli bir demir (anchor) kaydını sorgulayın.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Son demir gönderimlerini listeleyin.

```bash
qorechaind query multilayer anchors [flags]
```

| Bayrak       | Tür    | Açıklama                  |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | Katman kimliğine göre filtrele |
| `--limit`    | uint   | Döndürülecek maksimum sonuç |

### routing-stats

Katmanlar arası işlem yönlendirme istatistiklerini sorgulayın.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

İşlem yönlendirmesini yürütmeden simüle edin.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Multilayer modülü parametrelerini sorgulayın.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Belirli bir rollup için ayrıntıları sorgulayın.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Kayıtlı tüm rollup'ları listeleyin.

```bash
qorechaind query rdk rollups
```

| Bayrak     | Tür    | Açıklama                              |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | Filtre: `active`, `paused`, `stopped` |

### batch

Belirli bir uzlaşma partisini sorgulayın.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Bir rollup için en son partiyi sorgulayın.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

AI destekli bir rollup profil önerisi alın.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Belirli bir DA blob'unu sorgulayın.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

RDK modülü parametrelerini sorgulayın.

```bash
qorechaind query rdk params
```

:::note
Rollup çekim kanıtları ve uzlaşma durumu da `rdk` grubu altında sorgulanabilir. Tam sorgu alt komutları ve argümanları, rollup'ınızın uzlaşma türüne bağlıdır; yetkili çekim/uzlaşma sorgu yüzeyi için **Rollup Geliştirme Kiti** belgelerine bakın.
:::

---

## rlconsensus

PRISM, uzlaşma parametrelerini ayarlayan pekiştirmeli öğrenme katmanıdır. `rlconsensus` CLI modül adı ve alt komutları olduğu gibi korunur.

### agent-status

Mevcut PRISM aracı (agent) durumunu ve modunu sorgulayın.

```bash
qorechaind query rlconsensus agent-status
```

### observation

En son PRISM gözlem vektörünü sorgulayın.

```bash
qorechaind query rlconsensus observation
```

### reward

Kümülatif PRISM ödül metriklerini sorgulayın.

```bash
qorechaind query rlconsensus reward
```

### params

PRISM Uzlaşma modülü parametrelerini sorgulayın.

```bash
qorechaind query rlconsensus params
```

### policy

Aktif PRISM politika yapılandırmasını sorgulayın.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Bir adres için BTC staking pozisyonunu sorgulayın.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Belirli bir epoch için BTC kontrol noktası (checkpoint) verilerini sorgulayın.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Babylon modülü parametrelerini sorgulayın.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Soyut hesap ayrıntılarını sorgulayın.

```bash
qorechaind query abstractaccount account <address>
```

### params

Soyut Hesap modülü parametrelerini sorgulayın.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

Gaz ödemesi için kabul edilen token'ları listeleyin.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Gaz Soyutlama modülü parametrelerini sorgulayın.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

FairBlock şifreleme yapılandırmasını sorgulayın.

```bash
qorechaind query fairblock config
```

### params

FairBlock modülü parametrelerini sorgulayın.

```bash
qorechaind query fairblock params
```
