---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ Ad Alanı
sidebar_label: JSON-RPC — qor_ Ad Alanı
sidebar_position: 2
---

# JSON-RPC — qor_ Ad Alanı

`qor_` ad alanı; kuantum sonrası kriptografi durumu, AI analitiği, VM'ler arası mesajlaşma, çok katmanlı durum, köprü işlemleri, tokenomik ve rollup altyapısı ile PRISM konsensüs durumunu sorgulamak için QoreChain'e özgü JSON-RPC yöntemleri sağlar.

## Bağlantı

| Taşıma    | Varsayılan Adres        |
| --------- | ------------------------ |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

`qor_` ad alanı, aynı bağlantı noktalarında `eth_`, `web3_`, `net_` ve `txpool_` ile birlikte sunulur. `app.toml` içinde etkinleştirin:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
`qor_` ad alanı, **`qorechain-vladi`** ana ağında (EVM zincir kimliği **9801**, zincir sürümü **v3.1.95** üzerinde canlı) ve **`qorechain-diana`** test ağında (EVM zincir kimliği **9800**) kullanılabilir. Aşağıdaki örnekler yerel bir düğüm varsayar; uzaktan erişim için bunu sağlayıcınızın ana ağ veya test ağı uç noktasıyla değiştirin.
:::

---

## Yöntemler

| Yöntem                        | Parametreler                             | Açıklama                                                    |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `qor_getPQCKeyStatus`         | `address` (string)                        | Bir hesap için PQC anahtar kayıt durumunu döndürür            |
| `qor_getHybridSignatureMode`  | yok                                       | Mevcut hibrit imza zorunluluk modunu döndürür                 |
| `qor_getAIStats`              | yok                                       | Toplanmış AI modülü işleme istatistiklerini döndürür           |
| `qor_getCrossVMMessage`       | `messageId` (string)                      | Kimliğine göre bir VM'ler arası mesajı getirir                 |
| `qor_getReputationScore`      | `validator` (string)                      | Bir doğrulayıcı adresi için itibar puanını döndürür            |
| `qor_getLayerInfo`            | `layerId` (string)                        | Kayıtlı bir katman için meta veri ve durum döndürür             |
| `qor_getBridgeStatus`         | `chainId` (string)                        | Bir zincir için köprü durumunu ve kilitli toplamları döndürür  |
| `qor_getRLAgentStatus`        | yok                                       | Mevcut PRISM ajan modunu ve operasyonel durumu döndürür        |
| `qor_getRLObservation`        | yok                                       | En son PRISM gözlem vektörünü döndürür                          |
| `qor_getRLReward`             | yok                                       | Birikimli PRISM ödül metriklerini döndürür                      |
| `qor_getPoolClassification`   | `validator` (string)                      | Bir doğrulayıcı için CPoS havuz sınıflandırmasını döndürür      |
| `qor_getBurnStats`            | yok                                       | Tüm kanallar genelinde yakım istatistiklerini döndürür          |
| `qor_getXQOREPosition`        | `address` (string)                        | Bir adres için xQORE staking pozisyonunu döndürür               |
| `qor_getInflationRate`        | yok                                       | Mevcut yıllıklandırılmış enflasyon oranını döndürür              |
| `qor_getTokenomicsOverview`   | yok                                       | Birleşik yakım, enflasyon ve arz genel görünümünü döndürür       |
| `qor_getRollupStatus`         | `rollupId` (string)                       | Belirli bir rollup için durum ve yapılandırmayı döndürür         |
| `qor_listRollups`             | yok                                       | Kayıtlı tüm rollup'ların bir listesini döndürür                 |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int)   | Bir rollup için belirli bir mutabakat grubunu (batch) döndürür  |
| `qor_suggestRollupProfile`    | `useCase` (string)                        | Bir kullanım senaryosu için AI destekli rollup profil önerisi   |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)    | Belirli bir DA blob'unun durumunu döndürür                       |
| `qor_getBTCStakingPosition`   | `address` (string)                        | Babylon modülü üzerinden BTC staking pozisyonunu döndürür       |
| `qor_getAbstractAccount`      | `address` (string)                        | Soyut hesap ayrıntılarını ve harcama kurallarını döndürür       |
| `qor_getFairBlockStatus`      | yok                                       | FairBlock şifreleme durumunu ve yapılandırmasını döndürür        |
| `qor_getGasAbstractionConfig` | yok                                       | Kabul edilen tokenleri ve gas soyutlama parametrelerini döndürür |
| `qor_getLaneConfiguration`    | yok                                       | 5 şeritli TX önceliklendirme yapılandırmasını döndürür            |

---

## Örnekler

### qor_getBurnStats

**İstek:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getBurnStats",
    "params": [],
    "id": 1
  }'
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "total_burned": "1250000000",
    "total_distributed": "4750000000",
    "channels": {
      "validator_share": "0.40",
      "burn_share": "0.30",
      "treasury_share": "0.20",
      "staker_share": "0.10"
    },
    "last_block_burned": "342891"
  }
}
```

### qor_getRLAgentStatus

**İstek:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRLAgentStatus",
    "params": [],
    "id": 2
  }'
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "agent_mode": "observe",
    "observation_interval": 10,
    "circuit_breaker": {
      "active": false,
      "max_param_change": "0.10",
      "cooldown_blocks": 100
    },
    "last_observation_block": "342885",
    "cumulative_reward": "18.742"
  }
}
```

### qor_getRollupStatus

**İstek:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRollupStatus",
    "params": ["rollup-001"],
    "id": 3
  }'
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "rollup_id": "rollup-001",
    "status": "active",
    "settlement_type": "optimistic",
    "operator": "qor1abc123...",
    "total_batches": 147,
    "last_finalized_batch": 145,
    "pending_batches": 2,
    "stake": "10000000000uqor",
    "created_at_height": 100230
  }
}
```

---

## Hata Kodları

| Kod    | Mesaj             | Açıklama                                |
| ------ | ----------------- | ----------------------------------------- |
| -32600 | Invalid Request    | Hatalı biçimlendirilmiş JSON-RPC isteği   |
| -32601 | Method not found   | Yöntem mevcut değil                        |
| -32602 | Invalid params     | Eksik veya geçersiz parametreler           |
| -32603 | Internal error     | Sunucu tarafı işleme hatası                |
| -32000 | Module disabled    | Sorgulanan modül etkin değil               |
| -32001 | Entity not found   | İstenen kaynak mevcut değil                |
