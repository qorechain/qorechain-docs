---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ Ad Alanı
sidebar_label: JSON-RPC — qor_ Ad Alanı
sidebar_position: 2
---

# JSON-RPC — qor_ Ad Alanı

`qor_` ad alanı; kuantum sonrası kriptografi durumu, AI analitiği, VM'ler arası mesajlaşma, çok katmanlı durum, köprü işlemleri, tokenomik, rollup altyapısı ve PRISM konsensüs durumunu sorgulamak için QoreChain'e özgü JSON-RPC yöntemleri sağlamak üzere tasarlanmıştır.

:::warning Planlanan yöntemler henüz sunulmuyor
**Aşağıdaki tablodaki yöntemlerin hiçbiri henüz hiçbir ağda sunulmuyor.** Düğüm kaynak kodunda uygulanmışlardır ancak JSON-RPC sunucusuna kaydedilmemiştir ve her biri `-32601` (method not found) döndürür. Kaydedilmeleri bir düğüm sürümü için planlanmıştır ve yayınlandığında bu sayfa hangi sürüm olduğunu belirtecektir. Bugün bunlar üzerine geliştirme yapmayın; tabloda bir REST rotası bulunan yerlerde onu kullanın. `client.qor.*` yardımcılarını sunan istemci kitaplıkları aynı yöntemleri sarmalar, dolayısıyla bu yardımcılar da aynı şekilde başarısız olur.
:::

## Sunulan yöntem: `qor_getKEMKey` {#qor-getkemkey}

Ad alanının tek bir yöntemi sunulur: `qor_getKEMKey(address)`, bir adresin yayımladığı ML-KEM açık anahtarını döndürür (`address` `qor1...` veya `0x` olabilir). Yayımlanmış anahtar yoksa `{"address": ..., "found": false}` yanıtını verir; aksi halde `algorithm_id`, `algorithm_name`, `public_key` (`0x` onaltılık) ve `registered_height` alanlarını ekler. Düğüm `qor` ad alanını yalnızca `app.toml` içindeki `[json-rpc]` `api` listesinde `qor` bulunan yerde sunar.

7 Kasım 2026'da gözlemlenen durum:

| Ağ | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Test ağı (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | yanıt verir (yayımlanmış anahtarı olmayan bir adres için `found: false`) |
| Ana ağ (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (genel ana ağ uç noktası `qor` listelemiyor) |

Test ağında kontrol edilen diğer tüm `qor_` yöntemleri (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`) hâlâ `-32601` döndürdü.

Ad alanı listesini kendiniz kontrol edebilirsiniz:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Planlanan yöntemler ve bugün ne kullanılmalı

| Planlanan yöntem              | Bugün ne kullanılmalı |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Bkz. [REST / gRPC Uç Noktaları](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Genel bir REST rotası yok; bir düğüme karşı `qorechaind query pqc hybrid-mode` (veya `query pqc params`) ya da `--node https://rpc.qore.host:443`. |
| Yapay zekâ istatistikleri (planlanan; yöntem adı kesin değil) | Kendi çalıştırdığınız bir düğümde gRPC `qorechain.ai.v1.Query/Stats` veya `qorechaind query ai stats`; REST rotası yok. |
| `qor_getCrossVMMessage`       | Kendi çalıştırdığınız bir düğümde gRPC `qorechain.crossvm.v1.Query/Message`; REST rotası yok. |
| `qor_getReputationScore`      | Genel bir sorgu rotası yok (reputation modülü yalnızca gRPC `Params` sunar). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` ve `anchor/{layer_id}`. Bkz. [Multilayer Modülü](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Bkz. [Bridge Modülü](/api-reference/rest-grpc-endpoints#bridge-module). Köprü henüz canlı değil. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | v3.2.6'dan itibaren (her iki ağda): `GET /qorechain/rlconsensus/v1/agent`, `/observation` ve `/reward` (ayrıca `/params`, `/policy`, `/applied_params`, `/last_action`); bkz. [RL Consensus Modülü](/api-reference/rest-grpc-endpoints#rlconsensus-module). Rotalar, genel mainnet ana makinesinde 4 Kasım 2026'da `200` yanıtı verdi; v3.2.6'dan eski bir düğümde `501` yanıtı verir ve bunları okumanın yolu `qorechain.rlconsensus.v1.Query` gRPC hizmetidir (`AgentStatus`, `Observation`, `Reward`). |
| `qor_getPoolClassification`   | Genel bir sorgu rotası yok. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Bkz. [Burn Modülü](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Yok. xQORE canlı değil (bkz. [xQORE Staking](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` ve `/epoch_info` (emisyon modu, dönem başına miktar, tavan, ilerleme; v3.2.2'den beri sunuluyor). Bkz. [Inflation Modülü](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` ve `GET /cosmos/bank/v1beta1/supply` çağrılarını birleştirin. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (v3.2.2'den beri sunuluyor; bkz. [RDK Modülü](/api-reference/rest-grpc-endpoints#rdk-module)) veya `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | Genel bir hizmet yok; bkz. [Hazır Profiller](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Yok. BTC yeniden stake etme (restaking) modülünün henüz bir sorgu hizmeti yok. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Soyut hesaplar mainnet'te devre dışıdır, testnet'te etkindir (27 Ekim 2026'da kontrol edildi). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (v3.2.2'den beri sunuluyor). Bkz. [Gas Abstraction Modülü](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | Yok. |

Bir hesabın EVM şeridi durumu (kayıtlı PQC anahtarı, yetkilendirme penceresi ve EIP-7702 onayı) için `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` ve `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` kullanın. Durum rotası **tekil** `account` biçimindedir; çoğul `/accounts/` sunulmaz ve `501` ile yanıt verir.

---

## Hata Kodları

Hatalar standart JSON-RPC 2.0 kodlarını izler. Bugün planlanan bir `qor_` yöntemine yapılan çağrılar `-32601` ile başarısız olur; ana ağ uç noktasında `qor_getKEMKey` de öyle.

| Kod    | Mesaj             | Açıklama                                |
| ------ | ----------------- | ----------------------------------------- |
| -32600 | Invalid Request    | Hatalı biçimlendirilmiş JSON-RPC isteği   |
| -32601 | Method not found   | Yöntem mevcut değil veya düğüm `qor_` ad alanını sunmuyor (bugün planlanan her yöntem; `qor` etkin olmayan yerde `qor_getKEMKey` de) |
| -32602 | Invalid params     | Eksik veya geçersiz parametreler           |
| -32603 | Internal error     | Sunucu tarafı işleme hatası                |
