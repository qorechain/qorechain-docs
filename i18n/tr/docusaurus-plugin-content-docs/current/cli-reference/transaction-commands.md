---
slug: /cli-reference/transaction-commands
title: İşlem Komutları
sidebar_label: İşlem Komutları
sidebar_position: 2
---

# İşlem Komutları

Tüm işlem komutları şu kalıbı izler:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Canlı ana ağa (zincir sürümü **v3.1.80**) yayın yapmak için `--chain-id qorechain-vladi`, test ağı için `--chain-id qorechain-diana` ayarlayın. Belirtilmezse, istemci yerel yapılandırmanızdaki `chain-id` değerini kullanır.
:::

Ortak bayraklar her `tx` alt komutu için geçerlidir:

| Bayrak              | Tür    | Açıklama                                        |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | İmzalama anahtarının adı veya adresi            |
| `--chain-id`        | string | Zincir tanımlayıcısı (varsayılan: yapılandırmadan) |
| `--fees`            | string | İşlem ücretleri (örn. `500uqor`)                |
| `--gas`             | string | Gaz limiti veya tahmin için `auto`              |
| `--gas-adjustment`  | float  | `auto` kullanırken gaz çarpanı (varsayılan: 1.0) |
| `--keyring-backend` | string | Anahtarlık arka ucu: `os`, `file`, `test`       |
| `--node`            | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` veya `block`                    |
| `-y`                | bool   | Onay istemini atla                              |

---

## bank

### send

Bir hesaptan diğerine token aktarın.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Ağda yeni bir doğrulayıcı oluşturun.

```bash
qorechaind tx staking create-validator [flags]
```

| Bayrak                         | Tür    | Açıklama                                     |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Öz-delegasyon miktarı (örn. `1000000uqor`)   |
| `--pubkey`                     | string | Doğrulayıcı konsensüs genel anahtarı (JSON)  |
| `--moniker`                    | string | Doğrulayıcı görünen adı                      |
| `--commission-rate`            | string | Başlangıç komisyon oranı (örn. `0.10`)       |
| `--commission-max-rate`        | string | Maksimum komisyon oranı                      |
| `--commission-max-change-rate` | string | Maksimum günlük komisyon değişim oranı       |
| `--min-self-delegation`        | string | Gerekli minimum öz-delegasyon                |

### edit-validator

Mevcut bir doğrulayıcının açıklamasını veya komisyonunu düzenleyin.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Bir doğrulayıcıya token delege edin.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Delegasyonu bir doğrulayıcıdan diğerine taşıyın.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Bir doğrulayıcıdan token'ları çözün.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Bekleyen tüm staking ödüllerini çekin.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Belirli bir doğrulayıcıdan ödülleri çekin.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Bayrak         | Tür  | Açıklama                            |
| -------------- | ---- | ----------------------------------- |
| `--commission` | bool | Doğrulayıcı komisyonunu da çek      |

---

## gov

### submit-proposal

Bir yönetişim önerisi gönderin.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Öneri dosyası, öneri türünü, başlığını, açıklamasını ve yürütülecek mesajları belirten bir JSON belgesidir.

### vote

Aktif bir öneri için oy verin.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Oy seçenekleri: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Bir öneriye depozito ekleyin.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Cosmos işlem yolu varsayılan olarak hibrit imza gerektirir (`hybrid_signature_mode = required`). `gen-key` ve `cosign` komutları, klasik secp256k1 imzasının yanı sıra cosmos yolunda işlem yapmak için gereken Dilithium-5 (ML-DSA-87) anahtarını ve `PQCHybridSignature` uzantısını üretir.

### gen-key

Hibrit imzalama için bir Dilithium-5 (ML-DSA-87) kuantum-sonrası anahtar oluşturun.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Bir işleme `PQCHybridSignature` uzantısı olarak Dilithium-5 ortak imzası ekleyerek hibrit (secp256k1 + ML-DSA-87) bir işlem üretir. Varsayılan `required` zorlama modu altında cosmos yolu işlemleri için gereklidir. Standart CosmJS / aktarıcı (relayer) araçları, işlem yapmak için bu uzantıyı üretmek zorundadır; QoreChain SDK'sının `buildHybridTx` (`includePqcPublicKey` ile) komutu eşdeğerini yapar.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Bir hesap için bir kuantum-sonrası genel anahtar kaydedin.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Genişletilmiş meta veri ve onaylama (attestation) ile bir PQC anahtarı kaydedin.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Bayrak          | Tür    | Açıklama                       |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEE onaylama verisi (hex)      |
| `--metadata`    | string | Ek anahtar meta verisi (JSON)  |

### migrate-key

Mevcut bir klasik anahtarı hibrit bir PQC anahtar çiftine taşıyın.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

QOR token'larını bir xQORE yönetişim staking pozisyonuna kilitleyin.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Bayrak            | Tür    | Açıklama                                   |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Kilitleme süresi (örn. `30d`, `90d`, `180d`) |

### unlock

xQORE'yi tekrar QOR'a açın. Erken açma, ceza katmanına bağlı olarak cezalara yol açabilir.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Harici bir zincirden bir köprü yatırması başlatın.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Bayrak        | Tür    | Açıklama                       |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | QoreChain üzerindeki alıcı adresi |

### withdraw

Harici bir zincire bir köprü çekimi başlatın.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Bir zincirin köprüsünü tek bir imzalı işlemde etkinleştirin veya yeniden yapılandırın (zincir sürümü **v3.1.80** itibarıyla kullanılabilir). `bridge_admin` anahtarı veya bir `qcb_bridge` lisansı gerektirir — yönetişim önerisi veya zincir yükseltmesi gerekmez. Sözleşme adresini, onay sayısını, mimariyi ve durumu ayarlar.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Bir zincirin aktif doğrulayıcısını seçin ve güven kökünü kurun (ayrıca `bridge_admin` ile sınırlandırılmıştır).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Yürütme ortamları (EVM, CosmWasm, SVM) arasında bir çapraz-VM mesajı gönderin.

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Bayrak        | Tür    | Açıklama                             |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | Kaynak VM: `evm`, `cosmwasm`, `svm`  |
| `--gas-limit` | uint   | Çapraz-VM yürütmesi için gaz limiti  |

### process-queue

Bekleyen çapraz-VM mesajlarını manuel olarak işleyin (operatör komutu).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

SVM çalışma zamanına bir BPF programı dağıtın.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Bayrak         | Tür    | Açıklama                     |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | İsteğe bağlı program ID (base58) |

### execute

Dağıtılmış bir SVM programında bir talimat yürütün.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Bayrak       | Tür    | Açıklama                                            |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | Talimat için virgülle ayrılmış hesap genel anahtarları |

### create-account

Tahsis edilmiş veri alanına sahip yeni bir SVM hesabı oluşturun.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Bayrak    | Tür    | Açıklama                                        |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | Sahip programı (base58, varsayılan: sistem programı) |

---

## multilayer

### register-sidechain

Yeni bir yan zincir (sidechain) katmanı kaydedin.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Bayrak                  | Tür    | Açıklama                                             |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Hedef blok süresi (ms) (varsayılan 2000)            |
| `--domains`             | string | Virgülle ayrılmış desteklenen alanlar (varsayılan `defi`) |
| `--max-tx`              | uint   | Blok başına maksimum işlem (varsayılan 1000)        |
| `--min-validators`      | uint32 | Minimum doğrulayıcı kümesi boyutu (varsayılan 1)    |
| `--settlement-interval` | uint   | Blok cinsinden mutabakat aralığı (varsayılan 100)   |
| `--vm-types`            | string | Virgülle ayrılmış desteklenen VM türleri (varsayılan `evm`) |

### register-paychain

Yüksek frekanslı mikro işlemler için yeni bir ödeme zinciri (paychain) katmanı kaydedin.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Bayrak                  | Tür  | Açıklama                                     |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Blok başına maksimum işlem (varsayılan 5000) |
| `--settlement-interval` | uint | Blok cinsinden mutabakat aralığı (varsayılan 50) |

### anchor-state

Kayıtlı bir katman için bir durum bağlantısı (mutabakat) gönderin.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Bir işlemi en uygun katmana yönlendirin.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Bayrak           | Tür    | Açıklama                              |
| ---------------- | ------ | ------------------------------------- |
| `--target-layer` | string | Belirli bir katmana zorla yönlendirme |

### update-layer-status

Bir katmanın operasyonel durumunu güncelleyin (yalnızca operatör).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Durum değerleri: `active`, `paused`, `draining`.

### challenge-anchor

Bir durum bağlantısına karşı bir dolandırıcılık itirazı gönderin.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Development Kit ile yeni bir rollup kaydedin.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Bayrak              | Tür    | Açıklama                                             |
| ------------------- | ------ | --------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`      |
| `--profile`         | string | Hazır ayar: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Operatör stake miktarı                              |
| `--da-enabled`      | bool   | Yerel veri kullanılabilirliğini etkinleştir         |

### submit-batch

Bir rollup için bir mutabakat toplu işi (batch) gönderin.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Bir mutabakat toplu işine karşı bir dolandırıcılık itirazı gönderin (optimistic rollup'lar).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

İtiraz penceresini geçmiş bir toplu işi manuel olarak sonlandırın.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Bir rollup'ı duraklatın (yalnızca operatör).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Duraklatılmış bir rollup'ı sürdürün (yalnızca operatör).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Bir rollup'ı kalıcı olarak durdurun ve stake'ini serbest bırakın (yalnızca operatör).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Rollup çekimi ve katmanlar arası mutabakat da `rdk` işlem grubu altında sunulmaktadır (örneğin, sonlandırılmış bir toplu işe karşı kanıtlanmış bir çekimi mutabakata bağlayan bir `execute-withdrawal` komutu). Tam argümanlar ve bayraklar, rollup'ınızın mutabakat türüne ve DA yapılandırmasına bağlıdır; bu işlemleri oluşturmadan önce yetkili komut yüzeyi için **Rollup Development Kit** belgelerine bakın.
:::

---

## babylon

### submit-btc-checkpoint

Bir dönem (epoch) için bir BTC kontrol noktası gönderin.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon entegrasyonu aracılığıyla BTC yeniden stake edin.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Bayrak          | Tür    | Açıklama                          |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | Kanıt olarak Bitcoin işlem özeti  |

---

## abstractaccount

### create

Programlanabilir harcama kurallarına sahip bir soyut hesap oluşturun.

```bash
qorechaind tx abstractaccount create [flags]
```

| Bayrak             | Tür    | Açıklama                          |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | Harcama kurallarını tanımlayan JSON dosyası |

### update-spending-rules

Mevcut bir soyut hesabın harcama kurallarını güncelleyin.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM, konsensüs parametrelerini ayarlayan pekiştirmeli öğrenme katmanıdır. Bu komutlar PRISM ajanını kontrol eder; CLI modül adı `rlconsensus` ve alt komutları olduğu gibi korunur.

### set-agent-mode

PRISM ajanının operasyonel modunu ayarlayın (yalnızca yönetişim).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Mod değerleri: `0` (kapalı), `1` (gözlemle), `2` (öner), `3` (otomatik).

### resume-agent

Bir devre kesici tetiklemesinden sonra PRISM ajanını sürdürün.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISM ajanı politika yapılandırmasını güncelleyin (yalnızca yönetişim).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM ajanı için ödül ağırlığı yapılandırmasını güncelleyin.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Bayrak                | Tür    | Açıklama                     |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | İşlem hacmi ödülü için ağırlık |
| `--latency-weight`    | string | Gecikme ödülü için ağırlık   |
| `--security-weight`   | string | Güvenlik ödülü için ağırlık  |
