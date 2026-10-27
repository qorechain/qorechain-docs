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
Bu arayüzler hem **`qorechain-vladi`** ana ağında (7 Haziran 2026'dan beri canlı) hem de **`qorechain-diana`** test ağında kullanılabilir. Bu yazının hazırlandığı sırada (27 Ekim 2026'da kontrol edildi) ana ağ **v3.2.4** düğüm sürümünü çalıştırır (23 Ekim 2026'da 3.742.566 numaralı yükseklikte uygulandı, yönetişim önerisi 13) ve ana ağ yönetişim önerisi 14 oylama döneminde; v3.2.5'i 3.906.833 numaralı yükseklikte uygulayacaktır. Test ağı **v3.2.6** çalıştırır: v3.2.5'i 26 Ekim 2026'da 8.890.800 numaralı yükseklikte, v3.2.6'yı ise 27 Ekim 2026'da 8.970.638 numaralı yükseklikte uyguladı. Bir sürümün eklediği rotalar ve alanlar, bir ağda ancak o ağ sürümü uyguladıktan sonra görünür; bu sayfa yalnızca test ağında bulunanları işaretler. Aşağıdaki temel URL'ler yerel olarak çalışan bir düğüm varsayar. Herkese açık barındırılan uç noktalar `https://api.qore.host` / `https://api-testnet.qore.host` (REST) ve `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC) adresleridir ve [Ağlar](/appendix/networks#public-endpoints) sayfasında listelenmiştir. **Herkese açık bir gRPC uç noktası yoktur**: `grpc.qore.host` ve `grpc-testnet.qore.host` ana bilgisayar adları mevcut değildir, bu nedenle gRPC'ye ihtiyacınız varsa kendi düğümünüzü çalıştırın.
:::

## Temel URL'ler

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Hangi rotalar mevcut {#which-routes-exist}

QoreChain'e özgü modüller REST üzerinden `/qorechain/<module>/v1/...` öneki altında sunulur ve yalnızca aşağıda listelenen modüllerin REST rotaları vardır. Diğer modüllere **yalnızca gRPC** ile erişilebilir ([Yalnızca gRPC modülleri](#grpc-only-modules) bölümüne bakın). Standart Cosmos SDK, EVM ve QoreChain Native rotaları [Standart rotalar](#standard-routes) bölümünde listelenmiştir.

Var olmayan bir rota HTTP `501` ve `{"code":12,"message":"Not Implemented"}` ile yanıt verir. Bu, rotanın sunulmadığı anlamına gelir; sorgunun boş döndüğü anlamına gelmez. `/qorechain/` öneki olmayan kısaltılmış yollar (örneğin `/bridge/v1/chains` veya `/pqc/v1/params`) **sunulmaz**. Var olan bir rotada bilinmeyen bir kayıt HTTP `404` ve `{"code":5,"message":"... not found"}` döndürür.

Aşağıdaki örnekler herkese açık ana ağ adresini kullanır; test ağı için bunu `https://api-testnet.qore.host` ile değiştirin. Örneklerdeki değerler 20 ile 27 Ekim 2026 arasında canlı ağlardan okunmuştur ve zamanla değişir; bunları yanıtın biçimini görmek için kullanın. v3.2.4 sürümü birkaç rota ve alan ekledi. Bunlar aşağıda **v3.2.4** olarak işaretlenmiştir: test ağı bunları 19 Ekim 2026'dan beri, ana ağ ise 23 Ekim 2026'dan beri sunar. v3.2.6 sürümü daha fazlasını ekledi; bunlar **v3.2.6 (testnet)** olarak işaretlenmiştir: yalnızca test ağında yanıt verirler ve ana ağ bu sürümü uygulayana kadar onlara `501` ile yanıt verir. Daha eski bir sürümde kalmış bir düğüm yeni bir rotaya `501` ile yanıt verir.

## PQC Modülü {#pqc-module}

| Metot | Uç Nokta                                 | Açıklama                                                                    |
| ----- | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET   | `/qorechain/pqc/v1/account/{address}`    | Bir hesabın kuantum sonrası anahtar kaydı (`found`, anahtar türü, algoritma) |
| GET   | `/qorechain/pqc/v1/evm_window/{address}` | Hesabın EVM şeridi yetkilendirme penceresi ve bunun kalan kısmı             |
| GET   | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Hesabın EIP-7702 delegasyon onayı, geçerli delegasyonu ve EVM nonce değeri (v3.2.2'den beri) |
| GET   | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (test ağında 19 Ekim 2026'dan beri; ana ağda 23 Ekim 2026'dan beri; eski bir düğümde `501`). İkili dosyanın bildiği her protokol özelliği; `enabled`, `known` ve `staged` bayraklarıyla |
| GET   | `/qorechain/pqc/v1/params`               | **v3.2.6 (testnet)**. Modül parametreleri; bu yazının hazırlandığı sırada ana ağda `501` |

Yol bölümünün tekil `account` olduğuna dikkat edin. `/qorechain/pqc/v1/stats` rotası yoktur (bunun için `qorechaind query pqc stats` kullanın). `/qorechain/pqc/v1/params` v3.2.6'dan itibaren sunulur, dolayısıyla şimdilik yalnızca test ağında; ana ağda, o sürümü uygulayana kadar bir düğüme karşı `qorechaind query pqc params` kullanın.

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source`, `ecdsa_pubkey` değerinin nereden geldiğini söyler: `stored` (kayıt sırasında verilen anahtar), `auth_account` (hiçbir şey saklanmadı, dolayısıyla hesabın kendi zincir üstü genel anahtarıdır) veya `none`. v3.2.4'ten itibaren (test ağında 19 Ekim 2026'dan beri; ana ağda 23 Ekim 2026'dan beri) kayıt ayrıca `"possession_proven": false` alanını da taşır; bu alan, bir anahtar doğrulanmış bir [sahiplik kanıtıyla](/developer-guide/post-quantum-signing#proof-of-possession) kaydedildiğinde `true` olur; daha eski bir sürümdeki düğüm bu alanı raporlamaz.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Bu rota, penceresi olmayan bir adres için asla hata vermez; `found: false` döndürür. v3.2.0'dan itibaren EVM şeridi, bir işlemi yalnızca kayıtlı bir PQC anahtarına **ve** açık bir pencereye sahip bir hesaptan kabul eder. `live`, pencere geçerli yükseklikte en az bir işlem daha kabul ettiği sürece `true` olur. `remaining_blocks`, `remaining_txs` ve `remaining_value` hangi sınırın tükenmeye en yakın olduğunu gösterir; değerler dize olarak döndürülen `uqor` tam sayılarıdır. v3.2.3'ten itibaren bir pencere kapsam taşıyabilir: `native_only` (yalnızca düz QOR transferleri) ve `allowed_targets` (yalnızca listelenen alıcılar). EVM şeridinin nasıl çalıştığı için [EVM Geliştirme](/developer-guide/evm-development#evm-window) sayfasına bakın.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

Bir hesabın EIP-7702 delegasyonu yalnızca hesabın kendi kuantum sonrası onayıyla (`MsgAuthorizeEVMDelegation`) yürürlüğe girer. `found` ve `live`, `delegate` için kaydedilmiş ve hâlâ kullanılabilir bir onayı raporlar; `current_delegate` hesabın şu anda ayarladığı delegasyondur ve `nonce` hesabın EVM nonce değeridir.

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

Bir `StateAnchorView` şunları içerir: `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` ve `compressed_state_proof`. v3.2.2'den itibaren imzalanan mesaj **v2 çıpa mesajıdır**: `qorechain-multilayer-anchor-v2` alan etiketi, ardından zincir kimliği, katman kimliği, katman yüksekliği, durum kökü, doğrulayıcı kümesi özeti, işlem sayısı ve sıkıştırılmış durum kanıtı; değişken uzunluklu her alanın önüne 8 baytlık big-endian uzunluğu eklenir (önceki v1 mesajında zincir kimliği ve uzunluk önekleri yoktu, dolayısıyla bir imza her zincirde geçerliydi). Mesaj, katman oluşturucusunun kayıtlı PQC anahtarına karşı doğrulanır. `qorechaind query rdk anchor-sign-bytes` bir rollup batch'i için baytları yazdırır. Çıpası olmayan bir katman, `anchor/{layer_id}` rotasından HTTP `404` (`no anchor for layer ...`), `anchors/{layer_id}` rotasından ise boş bir liste (`{"anchors": []}`) döndürür.

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

Bu yazının hazırlandığı sırada `layers` her iki ağda da boş bir listedir. Örnek, ana ağ yanıtıdır; test ağında `max_sidechains` `64`'tür (builder etkinliği için 16 numaralı yönetişim önerisiyle yükseltildi, 25 Ekim 2026'da kabul edildi).

## Burn Modülü {#burn-module}

Burn modülünün salt okunur durumu REST üzerinden `/qorechain/burn/v1/...` altında sunulur. Burn `params` çıktısı örneğin `gas_burn_rate=0.30` değerini içerir.

| Metot | Uç Nokta                              | Açıklama                                                       |
| ----- | ------------------------------------- | -------------------------------------------------------------- |
| GET   | `/qorechain/burn/v1/params`           | Geçerli Burn modülü parametreleri                              |
| GET   | `/qorechain/burn/v1/stats`            | Kaynağa göre ayrıştırılmış kümülatif yakım toplamı             |
| GET   | `/qorechain/burn/v1/records`          | Son yakım kayıtlarını listeler                                 |
| GET   | `/qorechain/burn/v1/milestone`        | Yakım kilometre taşı ilerlemesi (kümülatif işlem sayısı)       |
| GET   | `/qorechain/burn/v1/stranded_rewards` | Ayrılan ve henüz yönetişim tarafından serbest bırakılmamış staker payı |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

Gerçek yanıt her yakım kaynağını listeler (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty` ve v3.2.4'ten itibaren `staking_tier_penalty`, yani bir staking-tier kilidinin erken açılma cezası, yakılır); örnek kısaltılmıştır. Tutarlar `uqor` cinsindendir. `failed_tx`, başarısız işlem yakımının fiilen tahsil edilen ücrete uygulanmaya başladığı v3.2.2 yükseltmesinden beri sıfırdan farklıdır. v3.2.3'ten itibaren eski yakım başına `records` kayıtları budanır; dolayısıyla `records` tüm geçmiş değil, yakın bir penceredir; `stats` içindeki toplamlar ise kümülatiftir.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` serbest bırakılmak üzere kalan miktardır, `released` yönetişimin şimdiye kadar taşıdığı miktardır, `snapshot_height` ise ayrılan rezervi kaydeden v3.2.0 yükseltmesinin yüksekliğidir. Yukarıdaki değerler 23 Ekim 2026'da okunanlardır: yönetişim ilk miktarı (6.693.045,921330 QOR) 19 Ekim 2026'da serbest bıraktı, v3.2.3 yükseltmesi kalan rezervi kendi yüksekliğinde yeniden hesapladı (3.807.496,785528 QOR) ve yönetişim önerisi 12 bu miktarı serbest bıraktı (kabul edildi, oylama 21 Ekim 2026'da sona erdi); dolayısıyla rezerv artık boştur ve `released` toplamı 10.500.542,706858 QOR'dur. Canlı değerleri okuyun. [Tokenomi](/architecture/tokenomics) sayfasına bakın.

## Abstract Account Modülü {#abstract-account-module}

Abstract-account sorgu servisi REST üzerinden `/qorechain/abstractaccount/v1/...` altında sunulur (zincir sürümü **v3.1.85**'ten itibaren); buna, [authenticator](/developer-guide/account-abstraction#authenticators) kapsamlarını sabit kodlama olmadan doğrulamak için kullanılan **izin şeması** da dahildir.

| Metot | Uç Nokta                                              | Açıklama                                                       |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| GET   | `/qorechain/abstractaccount/v1/config`                | Modül yapılandırması (özellik denetimi: `enabled`)                 |
| GET   | `/qorechain/abstractaccount/v1/accounts`              | Abstract hesapları listeler                                        |
| GET   | `/qorechain/abstractaccount/v1/accounts/{address}`    | Bir adres için abstract-account durumu (yoksa `404`)               |
| GET   | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET   | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (test ağında 19 Ekim 2026'dan beri; ana ağda 23 Ekim 2026'dan beri; eski bir düğümde `501`). Bağlı bir authenticator anahtarının sıradaki imzalaması gereken sıra numarası (`nonce`, `linked`) |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Ana ağda devre dışı, test ağında etkin
Yukarıdaki örnek ana ağ yanıtıdır: orada `enabled` `false`'tur (ve `accounts` boş bir listedir), dolayısıyla bağlı cüzdan harcaması gibi abstract-account özellikleri ana ağda kullanılamaz. Test ağında `enabled`, 18 numaralı yönetişim önerisinden beri (27 Ekim 2026'da kabul edildi) `true`'dur ve `accounts` şimdiye kadar oluşturulan hesapları listeler (27 Ekim 2026'da kontrol edildi). Bu modüle güvenmeden önce özellik denetimi olarak `config.enabled` alanını kullanın. [Hesap Soyutlama](/developer-guide/account-abstraction) sayfasına bakın.
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

Yedi AMM rotasının tümü her iki ağda da yanıt verir (27 Ekim 2026'da kontrol edildi). Bu yazının hazırlandığı sırada her iki ağda da havuz yoktur (`{"pools": []}`). Hiçbir şeyle eşleşmeyen girdiler için yanıtlar: bilinmeyen bir kimlikle `pools/{pool_id}` HTTP `404` döndürür (`{"code":5,"message":"pool 1 not found"}`); çift için havuz olmayan `pool_by_denoms` `404` döndürür (`no pool for uqor/foo`); bilinmeyen bir havuz için fiyat teklifi HTTP `400` ve `{"code":3,"message":"pool not found"}` döndürür; LP pozisyonu olmayan bir adres için `pools/{pool_id}/lp/{address}` `{"balance":"0"}` döndürür (adres geçerli bir `qor1` bech32 adresi olmalıdır, aksi halde `400`). İki fiyat teklifi rotası ve `pool_by_denoms` girdilerini sorgu dizesinden okur, bu yüzden parametre gerektirirler: `amount_in` / `amount_out` olmadan `400` ile yanıt verirler (`invalid amount_in` / `invalid amount_out`).

Test ağında, bir havuzun ihtiyaç duyduğu ikinci birim v3.2.6'dan beri mevcuttur: yönetişimin kaydettiği üç test token'ı, bkz. [Testnet test token'ları (Fest)](#fest-tokens). Tek bank birimi `uqor` olan ana ağda bunun karşılığı yoktur.

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` iznin sona ermediği anlamına gelir. v3.2.3'ten itibaren yönetişim, bu lisansları veren lisans otoritesini değiştirebilir (`MsgUpdateAuthority`); daha önce verilmiş izinler yerinde kalır.

## Light Node Modülü {#light-node-module}

| Metot | Uç Nokta                                      | Açıklama                                                           |
| ----- | --------------------------------------------- | ------------------------------------------------------------------ |
| GET   | `/qorechain/lightnode/v1/params`              | Kayıt, heartbeat ve ödül parametreleri                             |
| GET   | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET   | `/qorechain/lightnode/v1/nodes`               | Kayıtlı hafif düğümleri listeler                                   |
| GET   | `/qorechain/lightnode/v1/node/{address}`      | Tek bir düğüm (kayıtlı değilse `{"node": null, "found": false}`)   |
| GET   | `/qorechain/lightnode/v1/rewards/{address}`   | Bir operatör adresi için biriken ödüller (`accumulated_rewards`)   |
| GET   | `/qorechain/lightnode/v1/reward_pool`         | Ödül havuzu muhasebesi (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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
  "balance": "5645408555",
  "reserved": "5645276228",
  "outstanding": "130077",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "2250",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000",
  "monthly_cap_active": true,
  "last_distribution_time": "1792775155",
  "last_distribution_height": "3744000"
}
```

`reserved`, havuzun ayrılmış olan ve yalnızca bir yönetişim oyuyla taşınabilen kısmıdır. Düğüm başına sınırlar `uqor` cinsindendir: `max_reward_per_block_per_node` blok başına üst sınırdır ve v3.2.3'ten itibaren `max_reward_per_month_per_node` (`2000000000` uqor = 30 günde 2.000 QOR) aylık üst sınırdır; blok süresine ve çalışma süresine (uptime) göre orantılanır, dolayısıyla artık blokların ne kadar hızlı geldiğine bağlı değildir. Üst sınır, vaat edilen bir miktar değildir. Örnek, yönetişimin önceki rezervi serbest bırakmasından sonra (öneri 8, 19 Ekim 2026) 23 Ekim 2026'da okunan canlı ana ağ yanıtıdır. v3.2.4'ten itibaren (test ağında 19 Ekim 2026'dan beri; ana ağda 23 Ekim 2026'dan beri) yanıt ayrıca `monthly_cap_active`, `last_distribution_time` ve `last_distribution_height` alanlarını içerir ve bir düğümün sınırı kendi kaydıyla başlar.

:::note Kayıt için lisans gerekir
Zincir, etkin bir `lightnode_operator` lisans izni olmadan bir hafif düğüm kaydını reddeder (`holders/lightnode_operator` izinleri listeler). 27 Ekim 2026'da `stats`, hem ana ağda hem de test ağında `"total_registered": "1"` raporlar. Program durumu için [Hafif Düğümler](/light-node/overview) sayfasına bakın.
:::

## RDK Modülü {#rdk-module}

Rollup Development Kit sorgu servisi REST üzerinden `/qorechain/rdk/v1/...` altında sunulur (zincir sürümü **v3.2.2**'den itibaren; v3.2.0 ve v3.2.1'de yalnızca gRPC idi).

| Metot | Uç Nokta                                              | Açıklama                                             |
| ----- | ----------------------------------------------------- | ---------------------------------------------------- |
| GET   | `/qorechain/rdk/v1/params`                            | Modül parametreleri                                  |
| GET   | `/qorechain/rdk/v1/rollups`                           | Rollup'ları listeler                                 |
| GET   | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Tek bir rollup (bilinmiyorsa `404`)                  |
| GET   | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | Rollup'un en son uzlaşı batch'i                      |
| GET   | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Tek bir uzlaşı batch'i                               |
| GET   | `/qorechain/rdk/v1/batches/{rollup_id}`               | Rollup'un batch'leri indeks sırasıyla (sayfalanmış)  |
| GET   | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | Tek bir veri erişilebilirliği (DA) blob kaydı        |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

Yazının hazırlandığı sırada `rollups` her iki ağda da boş bir listedir; bu nedenle rollup başına rotalar `404` ile yanıt verir (örneğin `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` saniye cinsinden ifade edilir (`604800`). v3.2.4'ten itibaren yeni gönderilen bir batch'in iyimser itiraz penceresi blok süresiyle ölçülür: test ağında 8.337.253 numaralı yükseklikten (19 Ekim 2026), ana ağda 3.742.566 numaralı yükseklikten (23 Ekim 2026) itibaren. Yükseltmeden önce zincir saniye değerini sabit blok başına 6 saniyeyle bloğa çeviriyordu. Test ağında 17 numaralı yönetişim önerisi (27 Ekim 2026'da kabul edildi), builder etkinliği için `default_challenge_window` değerini `3600` (bir saat) ve `max_rollups` değerini `200` olarak belirledi; bu nedenle yukarıdaki örnek (ana ağ) orada test ağından farklıdır; `rollups` bu yazının hazırlandığı sırada test ağında hâlâ boştur.

## Inflation Modülü {#inflation-module}

Emisyon ayarları ve ilerlemesi REST üzerinden `/qorechain/inflation/v1/...` altında sunulur (zincir sürümü **v3.2.2**'den itibaren). Bir CLI komutuyla erişilemezler.

| Metot | Uç Nokta                              | Açıklama                                                                    |
| ----- | ------------------------------------- | --------------------------------------------------------------------------- |
| GET   | `/qorechain/inflation/v1/params`      | Emisyon parametreleri: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET   | `/qorechain/inflation/v1/epoch_info`  | İlerleme: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

Ana ağda `emission_mode` `"fixed"`, `fixed_epoch_emission` `"86000000000"` (dönem başına 86.000 QOR), `epoch_length` `"43200"` blok ve `max_total_emission` `"590000000000000"` değerindedir (590.000.000 QOR, kümülatif tavan). Bunlar 10 numaralı yönetişim önerisiyle belirlendi (19 Ekim 2026'da kabul edildi); yeni sabit miktarı kullanan ilk dönem 3.672.000 numaralı blokta başlar ve `epoch_info` devam eden dönemi ve şimdiye kadar basılan miktarı gösterir. Yanıttaki `schedule` listesi özgün `schedule` moduna aittir; sabit modda bir dönemin ne bastığını açıklamaz. Tüm tutarlar `uqor` cinsindendir. Test ağı kendi, farklı değerlerini raporlar. v3.2.4'ten itibaren üçüncü bir mod olan `target_apy` vardır; `target_apy_bps` alanıyla birlikte gelir (test ağında 19 Ekim 2026'dan beri; ana ağda 23 Ekim 2026'dan beri). Bir ağ buna yalnızca kendi yönetişim oyuyla geçer; dolayısıyla böyle bir oy kabul edilene kadar ana ağ `fixed` modunda kalır (27 Ekim 2026'da kontrol edildi: hâlâ `fixed`). Test ağı `target_apy` moduna kendi yönetişimiyle geçti (14 numaralı öneri, 20 Ekim 2026'da kabul edildi) ve bu yazının hazırlandığı sırada `"emission_mode": "target_apy"` raporlar; `epoch_info`, kümülatif tavana zaten ulaşıldığını gösterir (`remaining_emission` `0`).

## Gas Abstraction Modülü {#gas-abstraction-module}

| Metot | Uç Nokta                                              | Açıklama                                                                    |
| ----- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET   | `/qorechain/gasabstraction/v1/config`                 | Kabul edilen ücret token'ları, prim, blok başına dönüşüm üst sınırı         |
| GET   | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Bir birim ücret token'ının `uqor` cinsinden değeri ve `usable` olup olmadığı |
| GET   | `/qorechain/gasabstraction/v1/float`                  | Dönüşüm float'ının adresi, bakiyeleri ve bu bloktaki kullanımı              |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

Kabul edilenler listesi her iki ağda da yalnızca yerel `uqor` içerir; dolayısıyla ücretler `uqor` ile ödenir ve herhangi bir dönüşüm gerçekleşmez. Yönetişim bir token ekler (bir havuz, asgari bir likidite ve zaman ağırlıklı ile spot fiyat arasında azami bir sapma ile); böyle bir token ile ödenen ücret bir QOR float'ı üzerinden dönüştürülür ve bir AMM havuzu aracılığıyla yeniden doldurulur. `?denom=` olmadan `conversion_rate`, `500` (`denom is required`) ile yanıt verir.

## RL Consensus Modülü (v3.2.6, testnet) {#rlconsensus-module}

:::note Şimdilik yalnızca testnet
`rlconsensus` modülünün REST ağ geçidi, `qorechain-diana` test ağının 27 Ekim 2026'da 8.970.638 numaralı yükseklikte uyguladığı **v3.2.6** ile geldi. Ana ağda aşağıdaki her rota, bu yazının hazırlandığı sırada HTTP `501` (`{"code":12,"message":"Not Implemented"}`) ile yanıt verir (27 Ekim 2026'da kontrol edildi); orada modüle yalnızca gRPC üzerinden ulaşılır. Yedi rotanın tümü test ağında yanıt verir ve hiçbiri parametre gerektirmez.
:::

| Metot | Uç Nokta                                  | Açıklama                                                                 |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------ |
| GET   | `/qorechain/rlconsensus/v1/agent`         | Ajan durumu: `mode`, `current_epoch`, `total_steps`, `last_observation_at`, `last_action_at`, `circuit_breaker_active`, `blocks_since_revert` |
| GET   | `/qorechain/rlconsensus/v1/params`        | Modül parametreleri: gözlem aralığı, ajan modu, adım sınırları, devre kesici penceresi ve eşiği, ödül ağırlıkları, varsayılan blok süresi, gas fiyatı ve doğrulayıcı kümesi boyutu |
| GET   | `/qorechain/rlconsensus/v1/observation`   | En son gözlem vektörü (`height` ve 25 `values`)                          |
| GET   | `/qorechain/rlconsensus/v1/reward`        | En son ödül sinyali ve bileşenleri                                       |
| GET   | `/qorechain/rlconsensus/v1/policy`        | Saklanan politika ağı: `epoch`, `updated_at`, `weight_count` (ağırlıkların kendisi döndürülmez) |
| GET   | `/qorechain/rlconsensus/v1/applied_params` | Ajanın uygulanmış olarak tuttuğu değerler: `block_time_ms`, `gas_limit`, `gas_price_floor`, `pool_weight_rpos`, `pool_weight_dpos` |
| GET   | `/qorechain/rlconsensus/v1/last_action`   | Ajanın son adımında önerdiği eylem: `height`, `mode`, beş `values` ve `applied` |

```bash
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/agent
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/last_action
```

```json
{ "mode": "shadow", "current_epoch": "1", "total_steps": "209", "last_observation_at": "8975660",
  "last_action_at": "8975660", "circuit_breaker_active": false, "blocks_since_revert": "0" }
```

```json
{ "height": "8975660", "mode": "shadow", "values": ["-0.334711810000000000", "-0.500000000000000000",
  "0.000000000000000000", "0.000000000000000000", "0.000000000000000000"], "applied": false }
```

Ajan her `observation_interval` blokta (10) bir adım atar. `shadow` modunda bir eylem hesaplar ve hiçbir şeyi uygulamadan kaydeder; bu yüzden `applied` `false`'tur ve `applied_params` varsayılanlarında kalır (`block_time_ms` `5000`, `gas_price_floor` `100`, havuz ağırlıkları `0.40` ve `0.35`). Test ağında ajan, 29 numaralı yönetişim önerisiyle (27 Ekim 2026'da kabul edildi) saklanan bir politikayla gölge modunda başlatıldı; `circuit_breaker_active` `false`'tur. Tutarlar ve değerler dizelerdir. Uygulanan değerler bu sürümde bilgilendiricidir: zincir üzerindeki tek okuyucu, salt okunur [`rlConsensusParams` precompile'ıdır](/developer-guide/evm-precompiles#network-status). Karşılık gelen gRPC metotları `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams` ve `LastAction`'dır (servis `qorechain.rlconsensus.v1.Query`) ve CLI komutları [Sorgu Komutları](/cli-reference/query-commands#rlconsensus) sayfasındadır.

## Staking Tiers Modülü (v3.2.4) {#stakingtier-module}

:::note v3.2.4'ten itibaren kullanılabilir
Staking-tiers modülü **v3.2.4** sürümünün parçasıdır. Bu rotalar test ağında 19 Ekim 2026'dan beri, ana ağda ise 23 Ekim 2026'dan beri sunulur (yönetişim önerisi 13, yükseklik 3.742.566). Daha eski bir sürümdeki düğüm bunlara `501` ile yanıt verir.
:::

| Metot | Uç Nokta                                  | Açıklama                                                           |
| ----- | ----------------------------------------- | ------------------------------------------------------------------ |
| GET   | `/qorechain/stakingtier/v1/params`        | Kilit kademeleri, asgari kilit miktarı, erken kilit açma cezası    |
| GET   | `/qorechain/stakingtier/v1/locks/{holder}` | Bir sahibin kilitleri, her birinin şu anda biriktirdiği ve talep edilebilecek miktar |
| GET   | `/qorechain/stakingtier/v1/pool`          | Bonus havuzu: bakiye, bekleyen tutar, fazlalık ve son uzlaşı       |

`params`, üç kilit süresini (3, 6 ve 12 ay) parametreleriyle ve `min_lock_amount` ile (`"10000000"` uqor, 10 QOR) listeler. Kilitler `tx stakingtier lock` ile oluşturulur (bkz. [İşlem Komutları](/cli-reference/transaction-commands#stakingtier)).

## İtibar Modülü {#reputation-module}

İtibar modülünün REST rotaları **test ağında** (`qorechain-diana`, zincir v3.2.6) sunulur. Ana ağda her `/qorechain/reputation/v1/...` rotası, yazım sırasında (27 Ekim 2026) HTTP `501` ile yanıt verir (`{"code":12,"message":"Not Implemented"}`); orada modüle yalnızca gRPC üzerinden ulaşılır (`Params`, aşağıya bakın). Daha sonraki bir ana ağ sürümünün bunları sunması beklenir; sunduğunda bu sayfa güncellenecektir.

| Metot | Uç Nokta | Açıklama |
| ------ | -------- | ----------- |
| GET    | `/qorechain/reputation/v1/params` | Skor ağırlıkları (`alpha`, `beta`, `gamma`, `delta`), `lambda` ve `min_score` |
| GET    | `/qorechain/reputation/v1/validator/{address}` | Bir doğrulayıcının kaydı. `{address}` bir `qorvaloper1...` operatör adresi veya bir `qorvalcons1...` konsensüs adresidir. Alanlar arasında `composite_score`, `stake_score`, `performance_score`, `contribution_score`, `time_score`, `uptime_blocks`, `missed_blocks` ve `last_updated_height` bulunur. `404`, doğrulayıcının henüz skoru olmadığı anlamına gelir; ne operatör ne de konsensüs adresi olan bir dize `400` ile yanıtlanır |
| GET    | `/qorechain/reputation/v1/validators` | Skoru bulunan tüm doğrulayıcıların kayıtları (`reputations`) |

Skorlar 0 ile 1 arasında ondalık dizelerdir. Light node, delege edilmiş bir doğrulayıcı `min_reputation` değerinin altına düştüğünde uyarmak için doğrulayıcı başına rotayı okur (bkz. [Ödüller ve İzleme](/light-node/rewards-and-monitoring#delegation-alerts)). Ana ağ ana makinesinden aynı rotalar, ana ağ bunları sunana kadar `501` döndürür.

## Yalnızca gRPC modülleri {#grpc-only-modules}

Ana ağda (düğüm sürümü v3.2.4, 27 Ekim 2026'da kontrol edildi) bu modüllerin bir gRPC `Query` servisi vardır ancak **REST rotası yoktur**. Servis adları `qorechain.<module>.v1.Query` biçimini izler.

| Modül         | gRPC sorgu metotları (ana ağ, zincir sürümü v3.2.4)    |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params` (REST rotaları yalnızca test ağında vardır, bkz. [İtibar Modülü](#reputation-module)) |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

`rlconsensus` sorguları, v3.2.6'dan itibaren test ağında REST üzerinden sunulur (iki metotla daha: `AppliedParams` ve `LastAction`); bkz. [RL Consensus Modülü](#rlconsensus-module). Ana ağ, o sürümü uygulayana kadar onlara `501` ile yanıt verir. Kendi düğümünüze karşı `grpcurl` kullanın veya [CLI sorgu komutlarını](/cli-reference/query-commands) kullanın. `rdk` sorguları REST üzerinden de kullanılabilir ([RDK Modülü](#rdk-module) bölümüne bakın); v3.2.2'den önce yalnızca gRPC idi.

xQORE, BTC restaking (Babylon) ve FairBlock modüllerinin mevcut sürümde ne REST ne de gRPC üzerinden hiçbir sorgu servisi yoktur. v3.2.2'den önce hiçbir sorgu servisi olmayan inflation ve gas-abstraction modülleri REST üzerinden sunulur ([Inflation Modülü](#inflation-module) ve [Gas Abstraction Modülü](#gas-abstraction-module) bölümlerine bakın).

## Standart rotalar {#standard-routes}

Standart Cosmos SDK, IBC, EVM ve QoreChain Native REST rotaları da sunulur. Her iki ağda doğrulanmış örnekler:

| Uç Nokta                                              | Açıklama                                      |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | Toplam arz                                    |
| `/cosmos/bank/v1beta1/balances/{address}`             | Hesap bakiyeleri                              |
| `/cosmos/staking/v1beta1/validators`                  | Doğrulayıcılar                                |
| `/cosmos/staking/v1beta1/params`                      | Staking parametreleri                         |
| `/cosmos/distribution/v1beta1/params`                 | Dağıtım parametreleri                         |
| `/cosmos/gov/v1/params/voting`                        | Yönetişim parametreleri                       |
| `/cosmos/slashing/v1beta1/params`                     | Slashing parametreleri                        |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Bekleyen / uygulanan yükseltmeler (`applied_plan/v3.2.3` ana ağda `{"height":"3662051"}` döndürür) |
| `/cosmos/circuit/v1/disable_list`                     | Ağ genelinde kapatılmış mesaj türleri         |
| `/cosmos/base/node/v1beta1/config`                    | Düğümün asgari gas fiyatı (her iki ağda `0.1uqor`) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | En son blok                                   |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | İşlem arama / sorgulama / bloğa göre |
| `/cosmos/evm/vm/v1/params`                            | EVM modülü parametreleri                      |
| `/cosmos/evm/feemarket/v1/params`                     | EVM ücret piyasası parametreleri              |
| `/cosmwasm/wasm/v1/codes/params`                      | QoreChain Native yükleme/örnekleme izinleri           |
| `/ibc/apps/transfer/v1/params`                        | IBC transfer parametreleri                    |
| `/ibc/core/client/v2/counterparty_info/{client_id}`   | **v3.2.6 (testnet)**. Bir istemci için kayıtlı IBC v2 karşı tarafı (yoksa `404`; ana ağda `501`) |
| `/ibc/core/client/v2/config/{client_id}`              | **v3.2.6 (testnet)**. IBC v2 istemci yapılandırması (`allowed_relayers`; ana ağda `501`) |
| `/cosmos/evm/erc20/v1/token_pairs`, `/token_pairs/{token}` | ERC20 token çiftleri (testnet: üç Fest test token'ı ve bir IBC token'ı; ana ağ: hiçbiri) |

QoreChain Native öneki `/cosmwasm/wasm/v1/...` şeklindedir; `/cosmos/wasm/v1/...` sunulmaz.

### IBC v2 istemci rotaları (v3.2.6, testnet) {#ibc-v2-routes}

IBC v2 istemci sorgu servisi daha önce gRPC üzerinden sunuluyordu, ancak REST rotaları eksikti; v3.2.6 bunları bağlar. Bir röle, bir istemcinin karşı tarafını buradan okur. Her iki rota da istemci kimliğini yolda alır (örneğin `07-<type>-0`); bu olmadan her iki ağda da `501` ile yanıt verirler. 27 Ekim 2026'da kontrol edildi:

| Rota | Test ağı (v3.2.6) | Ana ağ (v3.2.4) |
| --- | --- | --- |
| `/ibc/core/client/v2/counterparty_info/{client_id}` | karşı tarafla `200`, ya da kayıtlı karşı tarafı olmayan bir istemci için `404` (`client 07-<type>-0 counterparty not found`); boş bir kimlik `400` ile yanıt verir | `501` |
| `/ibc/core/client/v2/config/{client_id}` | `200`, `{"config":{"allowed_relayers":[]}}` (boş liste, herhangi bir röle anlamına gelir) | `501` |
| `/ibc/core/channel/v2/clients/{client_id}/next_sequence_send`, `/packet_commitments` ve diğer IBC v2 kanal rotaları | yanıt verir (istemci için hiçbir şey kayıtlı değilse `404`, taahhütler için boş listeyle `200`) | yanıt verir, aynı biçimler |

IBC v1 rotaları (`/ibc/core/client/v1/...`, `/ibc/core/channel/v1/...`) her iki ağda da yanıt verir. Bu yazının hazırlandığı sırada test ağında bir IBC istemcisi ve bir açık transfer kanalı (`channel-0`, IBC cinsinden bir token ile) vardır; ana ağda ise IBC istemcisi, kanalı veya IBC cinsinden token yoktur. Test ağında hız sınırı modülü `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` adresinde (boş liste: hiçbir sınır belirlenmemiş) ve 08-wasm sağlama toplamı listesi `/ibc/lightclients/wasm/v1/checksums` adresinde (boş) yanıt verir; ana ağ ikisine de `501` ile yanıt verir.

### Testnet test token'ları (Fest) {#fest-tokens}

:::note Yalnızca testnet, değeri yok
Aşağıdaki üç token yalnızca `qorechain-diana` test ağında vardır. Bunlar geliştiriciler için test token'larıdır: değerleri yoktur ve ana ağda hiçbir ERC20 token çifti yoktur (27 Ekim 2026'da kontrol edildi: `token_pairs` boştur ve bank arzı yalnızca `uqor` içerir). Yönetişim bunları 27 Ekim 2026'da ERC20 token çiftleri olarak kaydetti (öneri 26).
:::

Test ağında kayıtlı bir ERC20 token'ı aynı zamanda bir bank coin'i olarak da bulunur; böylece tutulabilir, gönderilebilir ve bir [AMM havuzunun](#amm-module) ikinci birimi olarak kullanılabilir. Bank birimi, `erc20:` ve ardından **EIP-55 karışık harfli sağlama toplamı biçiminde** sözleşme adresidir ve birim dizesi **büyük/küçük harfe duyarlıdır**: tamamı küçük harfli yazım farklı bir dizedir ve bulunamaz.

| Token | Sözleşme adresi | Bank birimi | Ondalık |
| --- | --- | --- | --- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6 |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8 |

```bash
# the three tokens and their display names / decimals
curl -s https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata
# one denom: the case matters (this returns the metadata, the lowercase spelling returns 404)
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata/erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
# the ERC20 token pairs, and the supply of one denom
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/supply/by_denom?denom=erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

`denoms_metadata`, her token'ı `symbol` `fUSD` / `fETH` / `fBTC`, `display` `FestUSD` / `FestETH` / `FestBTC` ve görüntüleme biriminin üssü olarak ondalıklarla listeler. Bir bakiye sorgusu (`/cosmos/bank/v1beta1/balances/{address}`), bir sahibin bakiyesinin dönüştürülmüş kısmını `erc20:...` birimi altında gösterir; hâlâ EVM tarafında tutulan token'lar ise ERC20 sözleşmesinin kendi `balanceOf` değerinde görünür. İki biçim arasındaki dönüştürme `MsgConvertERC20` (EVM'den bank'a) ve `MsgConvertCoin` (bank'tan EVM'e) ile yapılır; `MsgConvertERC20` göndericisi bir `qor1` bech32 adresi olarak yazılmalıdır. Bkz. [EVM Geliştirme](/developer-guide/evm-development#fest-tokens).

## gRPC Reflection

Kendi çalıştırdığınız bir düğüm gRPC'yi `9090` portunda sunar. Sunucu yansıması (reflection) etkin olduğunda, `grpcurl` gibi araçlar mevcut servisleri keşfedebilir:

```bash
grpcurl -plaintext localhost:9090 list
```

Belirli bir servisi sorgulamak için:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` bir v3.2.3 düğümünde üç metoda sahiptir: `Account`, `EVMWindow` ve `EVMDelegationConsent`; v3.2.4'ten itibaren (test ağında 19 Ekim 2026'dan beri, ana ağda 23 Ekim 2026'dan beri) dördüncü bir metot olan `ProtocolFeatures` vardır. v3.2.6'da bir `Params` metodu eklenir (şimdilik yalnızca test ağında); bir ana ağ düğümünde `Params` metodu yoktur.

## Kimlik Doğrulama

Tüm REST ve gRPC uç noktaları varsayılan olarak kimlik doğrulamasızdır. Üretim dağıtımlarında, TLS sonlandırma ve erişim denetimini yönetmek için düğümün önüne bir ters proxy (ör. Nginx veya Caddy) yerleştirin.
