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
Sorgular, `--node` parametresinin işaret ettiği düğüme karşı çalışır. Canlı veriler için bir **`qorechain-vladi`** ana ağ RPC uç noktası (örneğin `--node https://rpc.qore.host:443`) veya test için bir **`qorechain-diana`** test ağı uç noktası (`--node https://rpc-testnet.qore.host:443`) kullanın. Varsayılan `tcp://localhost:26657` kendi çalıştırdığınız bir düğümü hedefler. Ana ağ düğüm sürümü v3.2.1'i, test ağı ise v3.2.2'yi çalıştırır; test ağı, ana ağda henüz bulunmayan birkaç ek yol sunabilir, bu nedenle orada çalışan bir sorgu ana ağda `Not Implemented` döndürebilir.
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
```

- `algorithm`, bir algoritma adı (`dilithium5`, `mlkem1024`) veya sayısal kimlik alır.
- `migration`, bir adres değil, bir **algoritma kimliği** (örneğin `1`) alır ve çalışan bir geçiş olmadığında `No active migration` bildirir.
- `evm-window`, adresin açık bir EVM hattı yetkilendirme penceresi olup olmadığını ve kaç blok, işlem ve değerin kaldığını gösterir (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

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

`stranded_rewards`, hiçbir talebi karşılamadan distribution modülüne yatırılan staker payını, v3.2.0 yükseltmesinde kaydedildiği şekliyle bildirir (`reserved`, `released`, `snapshot_height`). Yalnızca bir yönetişim oylamasıyla serbest bırakılabilir.

---

## mint ve inflation

`qorechaind query mint params|inflation|annual-provisions`, oranı her iki ağda da `0` olan standart mint modülünü okur; protokolün emisyon takvimini **bildirmez**. `query inflation` komutu yoktur.

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

`reward-pool`, modülün ödül bakiyesinin `reserved`, `outstanding`, `payable` ve `distributable` olarak nasıl bölündüğünü gösterir.

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

`config`, modül parametrelerini gösterir (asgari stake, oluşturma yakım oranı, itiraz penceresi, DA limitleri). `suggest-profile <use_case>` zinciri sorgulamaz; yalnızca genel uç noktaların sunmadığı bir JSON-RPC yöntemine işaret eden bir not yazdırır, bu yüzden profili [Hazır Profiller](/rollups/preset-profiles) bölümünden seçin.

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

Ana ağ henüz gaz soyutlama sorgularını sunmaz (`qorechaind query gasabstraction ...` yardım metnini yazdırır ve REST yolu `Not Implemented` döndürür). Ücretler yalnızca `uqor` ile ödenir; bkz. [Gaz Soyutlama](/user-guide/gas-abstraction).

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

---

## evm, erc20, wasm

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
