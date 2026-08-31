---
slug: /cli-reference/query-commands
title: Sorgu Komutları
sidebar_label: Sorgu Komutları
sidebar_position: 3
---

# Sorgu Komutları

Tüm sorgu komutları şu deseni izler:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Sorgular, `--node` parametresinin işaret ettiği düğüme karşı çalışır. Canlı veriler için bir **`qorechain-vladi`** mainnet RPC uç noktası (zincir sürümü **v3.1.95**) veya test için bir **`qorechain-diana`** testnet uç noktası kullanın. Varsayılan `tcp://localhost:26657` kendi çalıştırdığınız bir düğümü hedefler.
:::

Ortak bayraklar her `query` alt komutu için geçerlidir:

| Bayrak     | Tür    | Açıklama                                        |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |
| `--output` | string | Çıktı biçimi: `json` veya `text`                |
| `--height` | int    | Belirli bir blok yüksekliğinde durumu sorgula   |

---

## bank

### balances

Bir hesabın tüm bakiyelerini sorgular.

```bash
qorechaind query bank balances <address>
```

### total

Tüm token'ların toplam arzını sorgular.

```bash
qorechaind query bank total
```

---

## staking

### validator

Operatör adresine göre tek bir doğrulayıcıyı sorgular.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Tüm doğrulayıcıları listeler.

```bash
qorechaind query staking validators
```

### delegation

Bir delegatörden bir doğrulayıcıya yapılan delegasyonu sorgular.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Bir delegatörün tüm delegasyonlarını sorgular.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Çözülmekte olan (unbonding) bir delegasyonu sorgular.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Bir delegatörün tüm delegasyon ödüllerini sorgular.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Doğrulayıcı komisyonunu sorgular.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

ID'ye göre tek bir teklifi sorgular.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

İsteğe bağlı olarak duruma göre filtrelenmiş tüm teklifleri listeler.

```bash
qorechaind query gov proposals [flags]
```

| Bayrak     | Tür    | Açıklama                                                                  |
| ---------- | ------ | -------------------------------------------------------------------------- |
| `--status` | string | Duruma göre filtrele: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Bir teklife verilen oyları sorgular.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Bir hesap için PQC anahtar kayıt durumunu sorgular.

```bash
qorechaind query pqc account <address>
```

### algorithms

Desteklenen tüm PQC algoritmalarını listeler.

```bash
qorechaind query pqc algorithms
```

### algorithm

Belirli bir PQC algoritmasının ayrıntılarını sorgular.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Toplam PQC kayıt istatistiklerini sorgular.

```bash
qorechaind query pqc stats
```

### params

PQC modülü parametrelerini sorgular.

```bash
qorechaind query pqc params
```

### migration

Bir hesap için PQC anahtar geçiş durumunu sorgular.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Geçerli hibrit imza zorunluluğu modunu sorgular.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Bir adres için xQORE staking pozisyonunu sorgular.

```bash
qorechaind query xqore position <address>
```

### params

xQORE modülü parametrelerini sorgular.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Tüm kanallar genelinde yakma (burn) istatistiklerini sorgular.

```bash
qorechaind query burn stats
```

### params

Burn modülü parametrelerini sorgular.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Geçerli yıllıklandırılmış enflasyon oranını sorgular.

```bash
qorechaind query inflation rate
```

### epoch

Geçerli epoch numarasını ve ilerlemesini sorgular.

```bash
qorechaind query inflation epoch
```

### params

Inflation modülü parametrelerini sorgular.

```bash
qorechaind query inflation params
```

---

## ai

### config

AI modülü yapılandırmasını sorgular.

```bash
qorechaind query ai config
```

### stats

Toplanmış AI işleme istatistiklerini sorgular.

```bash
qorechaind query ai stats
```

### fee-estimate

AI destekli bir gas ücreti tahmini alır.

```bash
qorechaind query ai fee-estimate [flags]
```

| Bayrak      | Tür    | Açıklama                          |
| ----------- | ------ | ---------------------------------- |
| `--tx-type` | string | Tahmin için işlem türü             |
| `--urgency` | string | `low`, `medium`, `high`            |

### investigations

Aktif dolandırıcılık soruşturmalarını listeler.

```bash
qorechaind query ai investigations
```

### recommendations

AI tarafından üretilen ağ optimizasyon önerilerini alır.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Geçerli devre kesici (circuit breaker) durumlarını sorgular.

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Tüm doğrulayıcılar için itibar puanlarını sorgular.

```bash
qorechaind query reputation validators
```

### validator

Belirli bir doğrulayıcı için itibar puanını sorgular.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Kayıtlı tüm köprü zincirlerini listeler.

```bash
qorechaind query bridge chains
```

### chain

Belirli bir köprülenmiş zincirin ayrıntılarını sorgular.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Aktif köprü doğrulayıcılarını listeler.

```bash
qorechaind query bridge validators
```

### operations

Son köprü işlemlerini listeler.

```bash
qorechaind query bridge operations
```

| Bayrak     | Tür    | Açıklama                                  |
| ---------- | ------ | -------------------------------------------- |
| `--status` | string | Filtre: `pending`, `completed`, `failed`  |
| `--chain`  | string | Zincir ID'sine göre filtrele              |

### limits

Köprülenmiş bir zincir için hız (rate) limitlerini sorgular.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Köprü ücretini ve transfer süresini tahmin eder.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

ID'ye göre bir cross-VM mesajını alır.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Bekleyen cross-VM mesajlarını listeler.

```bash
qorechaind query crossvm pending
```

### params

Cross-VM modülü parametrelerini sorgular.

```bash
qorechaind query crossvm params
```

---

## svm

### account

SVM hesap bilgilerini sorgular.

```bash
qorechaind query svm account <pubkey>
```

### program

Dağıtılmış bir SVM programının bilgilerini sorgular.

```bash
qorechaind query svm program <program_id>
```

### params

SVM modülü parametrelerini sorgular.

```bash
qorechaind query svm params
```

### slot

Geçerli SVM slot numarasını sorgular.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Belirli bir katmanın ayrıntılarını sorgular.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Kayıtlı tüm katmanları listeler.

```bash
qorechaind query multilayer layers
```

### anchor

Belirli bir anchor kaydını sorgular.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Son anchor gönderimlerini listeler.

```bash
qorechaind query multilayer anchors [flags]
```

| Bayrak       | Tür    | Açıklama                     |
| ------------ | ------ | ------------------------------ |
| `--layer-id` | string | Katman ID'sine göre filtrele  |
| `--limit`    | uint   | Döndürülecek azami sonuç sayısı |

### routing-stats

Katmanlar genelinde işlem yönlendirme istatistiklerini sorgular.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

İşlem yönlendirmesini yürütmeden simüle eder.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Multilayer modülü parametrelerini sorgular.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Belirli bir rollup'ın ayrıntılarını sorgular.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Kayıtlı tüm rollup'ları listeler.

```bash
qorechaind query rdk rollups
```

| Bayrak     | Tür    | Açıklama                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filtre: `active`, `paused`, `stopped` |

### batch

Belirli bir yerleşim (settlement) grubunu (batch) sorgular.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Bir rollup için en son grubu (batch) sorgular.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

AI destekli bir rollup profili önerisi alır.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Belirli bir DA blob'unu sorgular.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

RDK modülü parametrelerini sorgular.

```bash
qorechaind query rdk params
```

:::note
Rollup para çekme (withdrawal) kanıtları ve yerleşim (settlement) durumu da `rdk` grubu altında sorgulanabilir. Kesin sorgu alt komutları ve argümanları rollup'ınızın yerleşim türüne bağlıdır; yetkili para çekme/yerleşim sorgu yüzeyi için **Rollup Development Kit** belgelerine bakın.
:::

---

## rlconsensus

PRISM, konsensüs parametrelerini ayarlayan pekiştirmeli öğrenme (reinforcement-learning) katmanıdır. CLI modül adı `rlconsensus` ve alt komutları olduğu gibi korunmuştur.

### agent-status

Geçerli PRISM ajan durumunu ve modunu sorgular.

```bash
qorechaind query rlconsensus agent-status
```

### observation

En son PRISM gözlem vektörünü sorgular.

```bash
qorechaind query rlconsensus observation
```

### reward

Kümülatif PRISM ödül metriklerini sorgular.

```bash
qorechaind query rlconsensus reward
```

### params

PRISM Consensus modülü parametrelerini sorgular.

```bash
qorechaind query rlconsensus params
```

### policy

Aktif PRISM politika yapılandırmasını sorgular.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Bir adres için BTC staking pozisyonunu sorgular.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Belirli bir epoch için BTC checkpoint verilerini sorgular.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Babylon modülü parametrelerini sorgular.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Soyut hesap (abstract account) ayrıntılarını sorgular.

```bash
qorechaind query abstractaccount account <address>
```

### params

Abstract Account modülü parametrelerini sorgular.

```bash
qorechaind query abstractaccount params
```

### permission-schema

Kanonik authenticator izin taksonomisini sorgular — 11 izin, mesaj→izin eşlemesi ve devredilemeyen (non-delegable) anahtar yönetimi mesajları (zincir sürümü **v3.1.85**'ten itibaren kullanılabilir; ayrıca `/qorechain/abstractaccount/v1/permission_schema` üzerinden REST ile de sunulur).

```bash
qorechaind query abstractaccount permission-schema
```

### auth-keygen / auth-sign-cosmos / auth-sign-evm

SDK'lar dışında authenticator yetkilendirmeleri oluşturmak için yardımcılar: bir test anahtarı üretir veya bir Native-lane ya da EVM-lane delege edilmiş işlem için **zincirin doğruladığı tam imza baytlarını (sign bytes)** üretir (zincir sürümü **v3.1.85**'ten itibaren kullanılabilir).

```bash
qorechaind query abstractaccount auth-keygen
qorechaind query abstractaccount auth-sign-cosmos <account> <to> <amount> <nonce>
qorechaind query abstractaccount auth-sign-evm <account> <to> <value> <data_hex> <nonce>
```

---

## gasabstraction

### accepted-tokens

Gas ödemesi için kabul edilen token'ları listeler.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Gas Abstraction modülü parametrelerini sorgular.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

FairBlock şifreleme yapılandırmasını sorgular.

```bash
qorechaind query fairblock config
```

### params

FairBlock modülü parametrelerini sorgular.

```bash
qorechaind query fairblock params
```
