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
| REST   | `1317`          | HTTP/1.1  | REST ağ geçidi (Cosmos SDK API sunucusu) |
| gRPC   | `9090`          | HTTP/2    | Protobuf ile kodlanmış gRPC servisi |
| RPC    | `26657`         | HTTP + WS | QoreChain Consensus Engine RPC  |

Tüm REST uç noktaları JSON döndürür. gRPC uç noktaları Protocol Buffers kullanır ve herhangi bir gRPC istemcisiyle tüketilebilir. RPC arayüzü, konsensüs düzeyinde sorgular ve işlem yayını sağlar.

:::note
Bu arayüzler hem **`qorechain-vladi`** ana ağında (29 Haziran 2026'dan beri canlı) hem de **`qorechain-diana`** test ağında kullanılabilir. Aşağıdaki temel URL'ler yerel olarak çalışan bir düğüm varsayar. Herkese açık barındırılan uç noktalar `https://api.qore.host` / `https://api-testnet.qore.host` (REST) ve `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC) adresleridir ve [Ağlar](/appendix/networks#public-endpoints) sayfasında listelenmiştir. **Herkese açık bir gRPC uç noktası yoktur**: `grpc.qore.host` ve `grpc-testnet.qore.host` ana bilgisayar adları mevcut değildir, bu nedenle gRPC'ye ihtiyacınız varsa kendi düğümünüzü çalıştırın.
:::

## Temel URL'ler

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Hangi rotalar mevcut {#which-routes-exist}

QoreChain'e özgü modüller REST üzerinden `/qorechain/<module>/v1/...` öneki altında sunulur ve yalnızca aşağıda listelenen modüllerin REST rotaları vardır. Diğer modüllere **yalnızca gRPC** ile erişilebilir ([Yalnızca gRPC modülleri](#grpc-only-modules) bölümüne bakın). Standart Cosmos SDK, EVM ve CosmWasm rotaları [Standart rotalar](#standard-routes) bölümünde listelenmiştir.

Var olmayan bir rota HTTP `501` ve `{"code":12,"message":"Not Implemented"}` ile yanıt verir. Bu, rotanın sunulmadığı anlamına gelir; sorgunun boş döndüğü anlamına gelmez. `/qorechain/` öneki olmayan kısaltılmış yollar (örneğin `/bridge/v1/chains` veya `/pqc/v1/params`) sunulmaz. Var olan bir rotada bilinmeyen bir kayıt HTTP `404` ve `{"code":5,"message":"... not found"}` döndürür.

Aşağıdaki örnekler herkese açık ana ağ adresini kullanır; test ağı için bunu `https://api-testnet.qore.host` ile değiştirin.

## PQC Modülü {#pqc-module}

| Metot | Uç Nokta                                 | Açıklama                                                                    |
| ----- | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET   | `/qorechain/pqc/v1/account/{address}`    | Bir hesabın kuantum sonrası anahtar kaydı (`found`, anahtar türü, algoritma) |
| GET   | `/qorechain/pqc/v1/evm_window/{address}` | Hesabın EVM şeridi yetkilendirme penceresi ve bunun kalan kısmı             |

Yol bölümünün tekil `account` olduğuna dikkat edin. `/qorechain/pqc/v1/params` veya `/stats` rotası yoktur.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

Kayıtlı anahtarı olmayan bir hesap `{"found": false, "account": null}` döndürür. Bir hesabın gönderim yapabilmesi için önce anahtar kaydetmesi gerekip gerekmediğine karar vermek için `found` alanını kullanın.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

Bu rota, penceresi olmayan bir adres için asla hata vermez; `found: false` döndürür. v3.2.0'dan itibaren EVM şeridi, bir işlemi yalnızca kayıtlı bir PQC anahtarına **ve** açık bir pencereye sahip bir hesaptan kabul eder. `live`, pencere geçerli yükseklikte en az bir işlem daha kabul ettiği sürece `true` olur. `remaining_blocks`, `remaining_txs` ve `remaining_value` hangi sınırın tükenmeye en yakın olduğunu gösterir; değerler dize olarak döndürülen `uqor` tam sayılarıdır. EVM şeridinin nasıl çalıştığı için [EVM Geliştirme](/developer-guide/evm-development) sayfasına bakın.

## Bridge Modülü {#bridge-module}

Bridge modülünün salt okunur durumu REST üzerinden `/qorechain/bridge/v1/...` altında sunulur (zincir sürümü **v3.1.77**'den itibaren gerçek zincir üstü JSON sunar). Bridge `config` çıktısı örneğin `min_validators=10` ve `attestation_threshold=7` değerlerini raporlar.

| Metot | Uç Nokta                                    | Açıklama                                         |
| ----- | -------------------------------------------- | -------------------------------------------------- |
| GET   | `/qorechain/bridge/v1/config`               | Geçerli bridge modülü yapılandırması             |
| GET   | `/qorechain/bridge/v1/chains`               | Kayıtlı tüm bridge zincirlerini listeler         |
| GET   | `/qorechain/bridge/v1/chains/{chain_id}`    | Köprülenmiş belirli bir zincirin ayrıntıları     |
| GET   | `/qorechain/bridge/v1/validators`           | Kayıtlı bridge doğrulayıcılarını listeler        |
| GET   | `/qorechain/bridge/v1/validators/{address}` | Belirli bir bridge doğrulayıcısının ayrıntıları  |
| GET   | `/qorechain/bridge/v1/operations`           | Bridge operasyonlarını listeler                  |
| GET   | `/qorechain/bridge/v1/operations/{id}`      | Belirli bir bridge operasyonunun ayrıntıları     |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}`, `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}` gibi tek bir kayıt döndürür.

:::caution Bridge henüz canlı değil
Yapılandırılmış 37 bridge zincirinin tamamı her iki ağda da `"status": "pending"` raporlar; `validators` ve `operations` boş listelerdir. Bu rotalar modülün yapılandırmasını gösterir; bugün varlıkların köprülenebileceği anlamına gelmez. [Bridge Mimarisi](/architecture/bridge-architecture) sayfasına bakın.
:::

## Multilayer Modülü {#multilayer-module}

Multilayer modülünün tam sorgu servisi REST üzerinden `/qorechain/multilayer/v1/...` altında sunulur (zincir sürümü **v3.1.80**'den itibaren); buna iki **durum çıpası (state-anchor) okuma sorgusu** da dahildir: `anchor/{layer_id}` bir katman için en son uzlaşı (settlement) çıpasını, `anchors/{layer_id}` ise o katmanın çıpa geçmişini döndürür. Her çıpa, kanonik alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır; böylece bir istemci bir çıpayı çekip bağımsız olarak doğrulayabilir — bu, Rollup Development Kit'in [uzlaşı makbuzlarının](/rollups/settlement-receipts) zincir üstü temelidir.

| Metot | Uç Nokta                                        | Açıklama                                           |
| ----- | ------------------------------------------------- | ----------------------------------------------------- |
| GET   | `/qorechain/multilayer/v1/params`               | Geçerli Multilayer modülü parametreleri              |
| GET   | `/qorechain/multilayer/v1/layers`               | Kayıtlı tüm katmanları listeler                      |
| GET   | `/qorechain/multilayer/v1/layers/{layer_id}`    | Belirli bir katmanın ayrıntıları                     |
| GET   | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Bir katman için en son durum çıpası                  |
| GET   | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Bir katman için durum çıpası geçmişi                 |
| GET   | `/qorechain/multilayer/v1/routing-stats`        | Katmanlar arası işlem yönlendirme istatistikleri     |

Bir `StateAnchorView` şunları içerir: `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` ve `compressed_state_proof`. İmzalanan kanonik mesaj `layer_id || layer_height || state_root || validator_set_hash` olup, katman oluşturucusunun kayıtlı PQC anahtarına karşı doğrulanır. Çıpası olmayan bir katman, `anchor/{layer_id}` rotasından HTTP `404` (`no anchor for layer ...`), `anchors/{layer_id}` rotasından ise boş bir liste (`{"anchors": []}`) döndürür.

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

Bu yazının hazırlandığı sırada `layers` her iki ağda da boş bir listedir.

## Burn Modülü {#burn-module}

Burn modülünün salt okunur durumu REST üzerinden `/qorechain/burn/v1/...` altında sunulur. Burn `params` çıktısı örneğin `gas_burn_rate=0.30` değerini içerir.

| Metot | Uç Nokta                              | Açıklama                                                       |
| ----- | ------------------------------------- | -------------------------------------------------------------- |
| GET   | `/qorechain/burn/v1/params`           | Geçerli Burn modülü parametreleri                              |
| GET   | `/qorechain/burn/v1/stats`            | Kaynağa göre ayrıştırılmış kümülatif yakım toplamı             |
| GET   | `/qorechain/burn/v1/records`          | Son yakım kayıtlarını listeler                                 |
| GET   | `/qorechain/burn/v1/milestone`        | Yakım kilometre taşı ilerlemesi (kümülatif işlem sayısı)       |
| GET   | `/qorechain/burn/v1/stranded_rewards` | v3.2.0 yükseltmesiyle ayrılan ve henüz serbest bırakılmamış staker payı |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

Gerçek yanıt her yakım kaynağını listeler (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); örnek kısaltılmıştır. Tutarlar `uqor` cinsindendir.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` serbest bırakılmak üzere kalan miktardır, `released` yönetişimin şimdiye kadar taşıdığı miktardır, `snapshot_height` ise ayrılan rezervi kaydeden v3.2.0 yükseltmesinin yüksekliğidir. [Tokenomi](/architecture/tokenomics) sayfasına bakın.

## Abstract Account Modülü {#abstract-account-module}

Abstract-account sorgu servisi REST üzerinden `/qorechain/abstractaccount/v1/...` altında sunulur (zincir sürümü **v3.1.85**'ten itibaren); buna, [authenticator](/developer-guide/account-abstraction#authenticators) kapsamlarını sabit kodlama olmadan doğrulamak için kullanılan **izin şeması** da dahildir.

| Metot | Uç Nokta                                              | Açıklama                                                       |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| GET   | `/qorechain/abstractaccount/v1/config`                | Modül yapılandırması (özellik denetimi: `enabled`)                 |
| GET   | `/qorechain/abstractaccount/v1/accounts`              | Abstract hesapları listeler                                        |
| GET   | `/qorechain/abstractaccount/v1/accounts/{address}`    | Bir adres için abstract-account durumu (yoksa `404`)               |
| GET   | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Her iki ağda da devre dışı
`enabled` bugün ana ağda ve test ağında `false` olduğundan, bağlı cüzdan harcaması gibi abstract-account özellikleri kullanılamaz. Bu modüle güvenmeden önce özellik denetimi olarak `config.enabled` alanını kullanın. [Hesap Soyutlama](/developer-guide/account-abstraction) sayfasına bakın.
:::

## AMM Modülü {#amm-module}

| Metot | Uç Nokta                                           | Açıklama                                                 |
| ----- | -------------------------------------------------- | -------------------------------------------------------- |
| GET   | `/qorechain/amm/v1/params`                         | Geçerli AMM parametreleri (baz puan cinsinden ücretler, limitler) |
| GET   | `/qorechain/amm/v1/pools`                          | Havuzları listeler                                       |
| GET   | `/qorechain/amm/v1/pools/{pool_id}`                | Tek bir havuz (bilinmiyorsa `404`)                       |
| GET   | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | Bir adresin bir havuzdaki LP token bakiyesi              |
| GET   | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Bir denom çifti için havuzu bulur (yoksa `404`)        |
| GET   | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | Fiyat teklifi: tam bir girdi için çıktı |
| GET   | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Fiyat teklifi: tam bir çıktı için gereken girdi |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

Bu yazının hazırlandığı sırada her iki ağda da havuz yoktur (`{"pools": []}`) ve bilinmeyen bir havuz için fiyat teklifi HTTP `400` ve `{"code":3,"message":"pool not found"}` döndürür.

## Lisans Modülü {#licence-module}

| Metot | Uç Nokta                                              | Açıklama                                                         |
| ----- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET   | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | `grantee` adresinin özellik için etkin bir izne sahip olup olmadığı (yoksa `404`) |
| GET   | `/qorechain/license/v1/holders/{feature_id}`          | Bir özelliğe ait tüm izinler                                     |
| GET   | `/qorechain/license/v1/list/{grantee}`                | Bir adresin sahip olduğu tüm izinler                             |

Bir izin (`LicenseView`) şu alanlara sahiptir: `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` ve `metadata`. `check` ayrıca `active` döndürür. Eşleşmesi olmayan bir list veya holders sorgusu `{"licenses": []}` döndürür; izni olmayan bir adres için `check`, HTTP `404` ve `{"code":5,"message":"no license for <grantee>/<feature_id>"}` döndürür.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Light Node Modülü {#light-node-module}

| Metot | Uç Nokta                                      | Açıklama                                                           |
| ----- | --------------------------------------------- | ------------------------------------------------------------------ |
| GET   | `/qorechain/lightnode/v1/params`              | Kayıt, heartbeat ve ödül parametreleri                             |
| GET   | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET   | `/qorechain/lightnode/v1/nodes`               | Kayıtlı hafif düğümleri listeler                                   |
| GET   | `/qorechain/lightnode/v1/node/{address}`      | Tek bir düğüm (kayıtlı değilse `{"node": null, "found": false}`)   |
| GET   | `/qorechain/lightnode/v1/rewards/{address}`   | Bir operatör adresi için biriken ödüller (`accumulated_rewards`)   |
| GET   | `/qorechain/lightnode/v1/reward_pool`         | Ödül havuzu muhasebesi (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved`, havuzun ayrılmış olan ve yalnızca bir yönetişim oyuyla taşınabilen kısmıdır; `max_reward_per_block_per_node` (`uqor` cinsinden) ise zincirin düğüm başına, blok başına kredilendirdiği miktarın üst sınırıdır. Üst sınır, vaat edilen bir miktar değildir. `balance` ve `reserved` burada yer tutucu olarak gösterilmiştir.

:::note Kayıt açık değil
`stats`, her iki ağda da `"total_registered": "0"` raporlar ve `nodes` boştur; zincir, `lightnode_operator` lisans izni olmadan bir hafif düğüm kaydını reddeder. Program durumu için [Hafif Düğümler](/light-node/overview) sayfasına bakın.
:::

## Yalnızca gRPC modülleri {#grpc-only-modules}

Bu modüllerin bir gRPC `Query` servisi vardır ancak **REST rotası yoktur**. Servis adları `qorechain.<module>.v1.Query` biçimini izler.

| Modül         | gRPC sorgu metotları (zincir sürümü v3.2.0)            |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Kendi düğümünüze karşı `grpcurl` kullanın veya [CLI sorgu komutlarını](/cli-reference/query-commands) kullanın. Özellikle `rdk` sorguları ana ağda REST üzerinden **kullanılamaz** (`/qorechain/rdk/v1/...` `501` ile yanıt verir), bu nedenle REST tabanlı rollup okuyucuları bugün ana ağa karşı çalışamaz.

xQORE, enflasyon, BTC restaking (Babylon), FairBlock ve gas soyutlama modüllerinin mevcut ana ağ sürümünde ne REST ne de gRPC üzerinden hiçbir sorgu servisi yoktur.

## Standart rotalar {#standard-routes}

Standart Cosmos SDK, IBC, EVM ve CosmWasm REST rotaları da sunulur. Her iki ağda doğrulanmış örnekler:

| Uç Nokta                                              | Açıklama                                      |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | Toplam arz                                    |
| `/cosmos/bank/v1beta1/balances/{address}`             | Hesap bakiyeleri                              |
| `/cosmos/staking/v1beta1/validators`                  | Doğrulayıcılar                                |
| `/cosmos/staking/v1beta1/params`                      | Staking parametreleri                         |
| `/cosmos/distribution/v1beta1/params`                 | Dağıtım parametreleri                         |
| `/cosmos/gov/v1/params/voting`                        | Yönetişim parametreleri                       |
| `/cosmos/slashing/v1beta1/params`                     | Slashing parametreleri                        |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Bekleyen / uygulanan yükseltmeler    |
| `/cosmos/base/node/v1beta1/config`                    | Düğümün asgari gas fiyatı (her iki ağda `0.1uqor`) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | En son blok                                   |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | İşlem arama / sorgulama / bloğa göre |
| `/cosmos/evm/vm/v1/params`                            | EVM modülü parametreleri                      |
| `/cosmos/evm/feemarket/v1/params`                     | EVM ücret piyasası parametreleri              |
| `/cosmwasm/wasm/v1/codes/params`                      | CosmWasm yükleme/örnekleme izinleri           |
| `/ibc/apps/transfer/v1/params`                        | IBC transfer parametreleri                    |

CosmWasm öneki `/cosmwasm/wasm/v1/...` şeklindedir; `/cosmos/wasm/v1/...` sunulmaz.

## gRPC Reflection

Kendi çalıştırdığınız bir düğüm gRPC'yi `9090` portunda sunar. Sunucu yansıması (reflection) etkin olduğunda, `grpcurl` gibi araçlar mevcut servisleri keşfedebilir:

```bash
grpcurl -plaintext localhost:9090 list
```

Belirli bir servisi sorgulamak için:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` iki metoda sahiptir: `Account` ve `EVMWindow`. `Params` metodu yoktur.

## Kimlik Doğrulama

Tüm REST ve gRPC uç noktaları varsayılan olarak kimlik doğrulamasızdır. Üretim dağıtımlarında, TLS sonlandırma ve erişim denetimini yönetmek için düğümün önüne bir ters proxy (ör. Nginx veya Caddy) yerleştirin.
