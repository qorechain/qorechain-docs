---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_ Ad Alanı
sidebar_label: JSON-RPC — qor_ Ad Alanı
sidebar_position: 2
---

# JSON-RPC — qor_ Ad Alanı

`qor_` ad alanı; kuantum sonrası kriptografi durumu, AI analitiği, VM'ler arası mesajlaşma, çok katmanlı durum, köprü işlemleri, tokenomik, rollup altyapısı ve PRISM konsensüs durumunu sorgulamak için QoreChain'e özgü JSON-RPC yöntemleri sağlamak üzere tasarlanmıştır.

:::warning Henüz sunulmuyor
**Yayınlanmış hiçbir düğüm derlemesi henüz `qor_` ad alanını sunmuyor**; ana ağ (`qorechain-vladi`), test ağı (`qorechain-diana`) ve kendi çalıştırdığınız düğüm için de durum aynıdır. Genel EVM uç noktalarında `rpc_modules` yalnızca `eth`, `net`, `rpc`, `txpool` ve `web3` değerlerini listeler ve her iki ağda da **her `qor_` yöntemi `-32601` (method not found) döndürür**. Yöntemler düğüm kaynak kodunda uygulanmıştır ancak JSON-RPC sunucusuna kaydedilmemiştir; bu yüzden `app.toml` içindeki `api` listesine `qor` eklemenin hiçbir etkisi yoktur. Ad alanının kaydedilmesi bir düğüm sürümü için planlanmıştır ve yayınlandığında bu sayfa hangi sürüm olduğunu belirtecektir.

Bugün `qor_` yöntemleri üzerine geliştirme yapmayın. Aşağıdaki tabloda bir REST rotası bulunan yerlerde onu kullanın. `client.qor.*` yardımcılarını sunan istemci kitaplıkları aynı yöntemleri sarmalar, dolayısıyla bu yardımcılar da aynı şekilde başarısız olur.
:::

Bunu kendiniz doğrulayabilirsiniz:

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
| `qor_getAIStats`              | Kendi çalıştırdığınız bir düğümde gRPC `qorechain.ai.v1.Query/Stats` veya `qorechaind query ai stats`; REST rotası yok. |
| `qor_getCrossVMMessage`       | Kendi çalıştırdığınız bir düğümde gRPC `qorechain.crossvm.v1.Query/Message`; REST rotası yok. |
| `qor_getReputationScore`      | Genel bir sorgu rotası yok (reputation modülü yalnızca gRPC `Params` sunar). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` ve `anchor/{layer_id}`. Bkz. [Multilayer Modülü](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Bkz. [Bridge Modülü](/api-reference/rest-grpc-endpoints#bridge-module). Köprü henüz canlı değil. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | Testnet'te (v3.2.6): `GET /qorechain/rlconsensus/v1/agent`, `/observation` ve `/reward` (ayrıca `/params`, `/policy`, `/applied_params`, `/last_action`); bkz. [RL Consensus Modülü](/api-reference/rest-grpc-endpoints#rlconsensus-module). Mainnet'te bu rotalar `501` döndürür: kendi çalıştırdığınız bir düğümde gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) kullanın. |
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

Ad alanını sunan bir düğümde hatalar standart JSON-RPC 2.0 kodlarını izler. Bugün bir `qor_` yöntemine yapılan çağrılar `-32601` ile başarısız olur.

| Kod    | Mesaj             | Açıklama                                |
| ------ | ----------------- | ----------------------------------------- |
| -32600 | Invalid Request    | Hatalı biçimlendirilmiş JSON-RPC isteği   |
| -32601 | Method not found   | Yöntem mevcut değil veya düğüm `qor_` ad alanını sunmuyor (bugün yayınlanmış her derleme) |
| -32602 | Invalid params     | Eksik veya geçersiz parametreler           |
| -32603 | Internal error     | Sunucu tarafı işleme hatası                |
