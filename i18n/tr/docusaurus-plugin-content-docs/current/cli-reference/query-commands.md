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
Sorgular, `--node` parametresinin işaret ettiği düğüme karşı çalışır. Canlı veriler için bir **`qorechain-vladi`** ana ağ RPC uç noktası (örneğin `--node https://rpc.qore.host:443`) veya test için bir **`qorechain-diana`** test ağı uç noktası (`--node https://rpc-testnet.qore.host:443`) kullanın. Varsayılan `tcp://localhost:26657` kendi çalıştırdığınız bir düğümü hedefler. Ana ağ, 23 Ekim 2026'dan beri düğüm sürümü v3.2.4'ü çalıştırır (3.742.566 yüksekliğinde yönetişim önerisi 13 ile uygulandı); test ağı 19 Ekim 2026'dan beri v3.2.4'ü çalıştırır. v3.2.4 sürümü birkaç yol ve komut ekler (aşağıda **v3.2.4** olarak işaretlenmiştir): bunlar her iki ağda da çalışır; daha eski bir sürümde olan bir düğüm bunlara `Not Implemented` ile yanıt verir. Bu sayfadaki komutlar, `https://rpc.qore.host:443` adresine karşı çalıştırılan v3.2.3 sürüm ikili dosyasına karşı denetlenmiştir; v3.2.4 yolları 23 Ekim 2026'da REST üzerinden denetlenmiştir.
:::

Ortak bayraklar her `query` alt komutu için geçerlidir:

| Bayrak     | Tür    | Açıklama                                        |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |
| `--output` | string | Çıktı biçimi: `json` veya `text`                |
| `--height` | int    | Belirli bir blok yüksekliğinde durumu sorgula   |

Her modülün bir CLI sorgusu yoktur. Bir komutun eksik olduğu yerde REST uç noktasını (`https://api.qore.host/...`) kullanın; bkz. [REST API](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(`query bank total` diye bir komut yoktur.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status`, tam enum adını alır: `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` veya `BOND_STATUS_UNBONDED` (`--status bonded` reddedilir).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status`, `deposit-period`, `voting-period`, `passed`, `rejected` veya `failed` değerlerini kabul eder. Diğer filtreler: `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm`, bir algoritma adı (`dilithium5`, `mlkem1024`) veya sayısal kimlik alır.
- `migration`, bir adres değil, bir **algoritma kimliği** (örneğin `1`) alır ve çalışan bir geçiş olmadığında `No active migration` bildirir.
- `account`, kayıtlı anahtarı bildirir. Anahtarın, `key_type` ve `algorithm_name` alanlarının yanı sıra kayıt, `classical_key_source` alanını da taşır (`stored`, `auth_account` veya `none`: klasik açık anahtarın nereden geldiği). v3.2.4'ten itibaren (ana ağda 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri) ayrıca `possession_proven` alanı bulunur; anahtar doğrulanmış bir sahiplik kanıtıyla kaydedildiyse bu alan `true` olur.
- `evm-window`, adresin açık bir EVM hattı yetkilendirme penceresi olup olmadığını ve kaç blok, işlem ve değerin kaldığını gösterir (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`); ayrıca pencerenin kapsamını da gösterir (`native_only`, `allowed_targets`; ana ağ v3.2.3'ten itibaren). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent`, adresin EIP-7702 delegasyon onayını (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), mevcut delegasyonunu ve EVM nonce'unu gösterir. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` ve `hybrid-mode`, `hybrid_signature_mode` (`2` = her iki ağda da zorunlu) ve `allow_classical_fallback` (`false`) değerlerini bildirir.

---

## burn

Burn modülünün CLI sorgusu yoktur. REST kullanın:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards`, hiçbir talebi karşılamadan distribution modülüne yatırılan staker payını bildirir (`reserved`, `released`, `snapshot_height`). Yalnızca bir yönetişim oylamasıyla serbest bırakılabilir. Rezerv ilk olarak v3.2.0 yükseltmesinde kaydedildi ve v3.2.3 yükseltme yüksekliğinde yeniden hesaplandı; bu nedenle başka yerde alıntılanan bir rakam yerine canlı değerleri okuyun.

`stats`, kümülatif yakımı kaynağa göre böler; bunlar arasında v3.2.2 yükseltmesinden beri sıfırdan farklı olan `failed_tx` de bulunur.

---

## mint ve inflation

`qorechaind query mint params|inflation|annual-provisions`, oranı her iki ağda da `0` olan standart mint modülünü okur; protokolün emisyon takvimini **bildirmez**. `query inflation` CLI komutu yoktur. Protokolün kendi emisyon ayarları ve ilerleyişi v3.2.2'den beri REST üzerinden sunulur:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

Ana ağda bunlar `emission_mode: "fixed"`, her biri 43,200 bloktan oluşan epoch başına 86,000 QOR sabit emisyon ve 590,000,000 QOR kümülatif üst sınır bildirir (yönetişim önerisi 10, 19 Ekim 2026'da kabul edildi; yeni miktardaki ilk epoch 3,672,000 numaralı blokta başlar). Miktarlar `uqor` cinsindendir. Test ağı hâlâ kendine ait, farklı değerler bildirir; v3.2.4 sürümü ek bir emisyon modu getirir (her iki ağda da kullanılabilir), ancak bir ağ yalnızca kendi yönetişim oylamasıyla bu moda geçer; dolayısıyla böyle bir oylama kabul edilene kadar ana ağ `fixed` modunda kalır.

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation ve qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

Validator başına itibar veya havuz sınıflandırma sorguları yoktur.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool`, modülün ödül bakiyesinin `reserved`, `outstanding`, `payable` ve `distributable` olarak nasıl bölündüğünü ve düğüm başına sınırları gösterir: `max_reward_per_block_per_node` ve v3.2.3'ten itibaren `max_reward_per_month_per_node` (2,000 QOR; blok süresine ve çalışma süresine göre orantılanır). v3.2.4'ten itibaren (ana ağda 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri) ayrıca `monthly_cap_active`, `last_distribution_time` ve `last_distribution_height` alanlarını bildirir.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check`, hak sahibinin ilgili özellik için lisansı olmadığında `NotFound` hatası döndürür.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config`, modül parametrelerini gösterir (asgari stake, oluşturma yakım oranı, itiraz penceresi, DA limitleri). `anchor-sign-bytes`, bir rollup oluşturucusunun `tx rdk submit-batch --anchor-signature` için imzaladığı v2 çapa imza baytlarını onaltılık olarak yazdırır. Aynı sorgular v3.2.2'den beri REST üzerinden `/qorechain/rdk/v1/...` altında sunulur (bkz. [REST / gRPC Uç Noktaları](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` zinciri sorgulamaz; yalnızca genel uç noktaların sunmadığı bir JSON-RPC yöntemine işaret eden bir not yazdırır, bu yüzden profili [Hazır Profiller](/rollups/preset-profiles) bölümünden seçin.

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

Soyut hesap modülü şu anda her iki ağda da kapalıdır (`config.enabled` değeri `false`), bu nedenle bu sorgular hesap döndürmez.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` ve `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` kimlik doğrulayıcı imzalarını çevrimdışı oluşturur. Kimlik doğrulayıcı tohumu (seed) hiçbir zaman bir argüman değildir: `--seed-file <file>` (stdin için `-`), `QORE_AUTH_SEED` ortam değişkeni veya yankısız bir istemden okunur; `auth-keygen` ise onu yazdırmak yerine yeni bir `0600` dosyasına (`--out`) yazar.

---

## gasabstraction

Gaz soyutlama sorguları v3.2.2'den beri her iki ağda da sunulur:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

Kabul edilen token listesi her iki ağda da yalnızca yerel `uqor` içerir; dolayısıyla ücretler `uqor` ile ödenir ve herhangi bir dönüşüm gerçekleşmez; hangi diğer token'ların kabul edileceğine yönetişim karar verir. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. Bkz. [Gaz Soyutlama](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

Bu yazının hazırlandığı sırada her iki ağda da hiçbir havuz yoktur.

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

Staking katmanları modülü **v3.2.4** sürümünün bir parçasıdır: test ağında 19 Ekim 2026'dan beri, ana ağda ise 23 Ekim 2026'dan beri (3,742,566 yüksekliği, yönetişim önerisi 13) çalışır. Daha eski bir sürümdeki bir düğüm bu sorgulara `Not Implemented` ile yanıt verir. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Bkz. [İşlem Komutları](/cli-reference/transaction-commands#stakingtier).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

`query upgrade applied <name>`, bir yükseltmenin ne zaman yürürlüğe girdiğini okumanın yoludur: ana ağda `v3.2.2` 3,556,788 yüksekliğinde, `v3.2.3` 3,662,051 yüksekliğinde ve `v3.2.4` 3,742,566 yüksekliğinde uygulandı; test ağında `v3.2.2` 6,905,034'te, `v3.2.3` 8,003,746'da ve `v3.2.4` 8,337,253'te uygulandı (`0` uygulanmadı demektir). Ana ağ devre kesici listesi (`disabled-list`) şu anda vesting hesabı oluşturma mesajlarını, QoreChain Native store ve instantiate'i, AMM havuzunu duraklatma ve sürdürmeyi, cross-VM çağrısını, multilayer katman durumu güncellemesini, PQC algoritmasını kullanımdan kaldırma ve devre dışı bırakmayı ve PRISM uzlaşma yönetişim mesajlarını içerir; test ağınınki ise yalnızca üç QoreChain Native mesajını içerir.

---

## evm, erc20, wasm

`wasm` komutları, QoreChain'in CosmWasm akıllı sözleşme çalışma zamanına verdiği ad olan QoreChain Native'i okur; komut ve modül adları `wasm` yazımını korur.

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

---

## CLI'ı Olmayan Modüller

`xqore`, `babylon` ve `fairblock` modüllerinin işlem veya sorgu komutları yoktur. Şu anda CLI üzerinden ya da herhangi bir genel API aracılığıyla kullanılamazlar.
