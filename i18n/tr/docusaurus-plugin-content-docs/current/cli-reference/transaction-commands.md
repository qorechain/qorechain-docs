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
Canlı ana ağa (zincir sürümü **v3.1.85**) yayın yapmak için `--chain-id qorechain-vladi`, test ağı için ise `--chain-id qorechain-diana` ayarlayın. Belirtilmezse istemci, yerel yapılandırmanızdaki `chain-id` değerini kullanır.
:::

Ortak bayraklar tüm `tx` alt komutları için geçerlidir:

| Bayrak              | Tür    | Açıklama                                        |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | İmzalayan anahtarın adı veya adresi             |
| `--chain-id`        | string | Zincir tanımlayıcısı (varsayılan: yapılandırmadan) |
| `--fees`            | string | İşlem ücretleri (örn. `500uqor`)                |
| `--gas`             | string | Gas limiti veya tahmin için `auto`              |
| `--gas-adjustment`  | float  | `auto` kullanılırken gas çarpanı (varsayılan: 1.0) |
| `--keyring-backend` | string | Anahtarlık arka ucu: `os`, `file`, `test`       |
| `--node`            | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` veya `block`                    |
| `-y`                | bool   | Onay istemini atla                              |

---

## bank

### send

Bir hesaptan diğerine token transferi yapar.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Ağda yeni bir doğrulayıcı oluşturur.

```bash
qorechaind tx staking create-validator [flags]
```

| Bayrak                         | Tür    | Açıklama                                     |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Kendi kendine delegasyon miktarı (örn. `1000000uqor`) |
| `--pubkey`                     | string | Doğrulayıcı konsensüs açık anahtarı (JSON)   |
| `--moniker`                    | string | Doğrulayıcı görünen adı                      |
| `--commission-rate`            | string | Başlangıç komisyon oranı (örn. `0.10`)       |
| `--commission-max-rate`        | string | Maksimum komisyon oranı                      |
| `--commission-max-change-rate` | string | Günlük maksimum komisyon değişim oranı       |
| `--min-self-delegation`        | string | Gerekli minimum kendi kendine delegasyon     |

### edit-validator

Mevcut bir doğrulayıcının açıklamasını veya komisyonunu düzenler.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Bir doğrulayıcıya token delege eder.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Delegasyonu bir doğrulayıcıdan diğerine taşır.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Bir doğrulayıcıdan token bağını çözer.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Bekleyen tüm stake ödüllerini çeker.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Belirli bir doğrulayıcıdan ödülleri çeker.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Bayrak         | Tür  | Açıklama                                |
| -------------- | ---- | --------------------------------------- |
| `--commission` | bool | Doğrulayıcı komisyonunu da çeker        |

---

## gov

### submit-proposal

Bir yönetişim önerisi gönderir.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Öneri dosyası; öneri türünü, başlığını, açıklamasını ve yürütülecek mesajları belirten bir JSON belgesidir.

### vote

Aktif bir öneri üzerinde oy kullanır.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Oy seçenekleri: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Bir öneriye depozito ekler.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Cosmos işlem yolu varsayılan olarak hibrit imza gerektirir (`hybrid_signature_mode = required`). `gen-key` ve `cosign` komutları, klasik secp256k1 imzasının yanında cosmos yolunda işlem yapmak için gereken Dilithium-5 (ML-DSA-87) anahtarını ve `PQCHybridSignature` uzantısını üretir.

### gen-key

Hibrit imzalama için bir Dilithium-5 (ML-DSA-87) kuantum sonrası anahtarı üretir.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Bir işleme `PQCHybridSignature` uzantısı olarak Dilithium-5 eş-imzası ekleyerek hibrit (secp256k1 + ML-DSA-87) bir işlem üretir. Varsayılan `required` zorlama modunda cosmos yolu işlemleri için gereklidir. Standart CosmJS / relayer araçları işlem yapabilmek için bu uzantıyı üretmelidir; QoreChain SDK'nın `buildHybridTx` fonksiyonu (`includePqcPublicKey` ile) bunun eşdeğerini yapar.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Bir hesap için kuantum sonrası açık anahtar kaydeder.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Genişletilmiş meta veriler ve doğrulama (attestation) ile bir PQC anahtarı kaydeder.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Bayrak          | Tür    | Açıklama                        |
| --------------- | ------ | ------------------------------- |
| `--attestation` | string | TEE doğrulama verisi (hex)      |
| `--metadata`    | string | Ek anahtar meta verisi (JSON)   |

### migrate-key

Mevcut bir klasik anahtarı hibrit PQC anahtar çiftine geçirir.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

Hesabın ML-DSA-87 anahtarını BIP-39 anımsatıcı sözcüklerinden (stdin'den okunur) deterministik olarak yeniden oluşturur ve yerel olarak saklar (zincir sürümü **v3.1.85** itibarıyla kullanılabilir). Ekosistem standardı olan `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` türetmesini kullanır.

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| Bayrak         | Tür    | Açıklama                                                 |
| -------------- | ------ | -------------------------------------------------------- |
| `--derivation` | string | `adapter` (kanonik, varsayılan) veya `bridge` (eski `SHAKE-256(mnemonic)`) |

### rotate-key

Hesabın ML-DSA-87 anahtarını **aynı algoritma içinde** döndürür (zincir sürümü **v3.1.85** itibarıyla kullanılabilir) — örn. eski türetmeyle üretilmiş bir anahtarı kanonik türetmeye geçirmek veya ele geçirilmiş bir anahtarı devre dışı bırakmak için. Anımsatıcı sözcükleri stdin'den okur, eski ve yeni anahtarlarla çift imzalar, zarfı eski anahtarla eş-imzalar ve yayınlar. stdout'a yalnızca işlem JSON'unu yazar (bilgilendirme satırları stderr'e gider), bu sayede `-o json` ile birlikte kullanılabilir.

```bash
qorechaind tx pqc rotate-key [flags]
```

| Bayrak             | Tür    | Açıklama                                          |
| ------------------ | ------ | ------------------------------------------------- |
| `--old-derivation` | string | Halihazırda kayıtlı anahtarın türetmesi (`adapter` \| `bridge`) |
| `--new-derivation` | string | Yeni anahtarın türetmesi (`adapter` \| `bridge`)  |
| `--new-random`     | bool   | Bunun yerine yepyeni rastgele bir anahtar üretir  |

---

## xqore

### lock

QOR tokenlarını bir xQORE yönetişim stake pozisyonuna kilitler.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Bayrak            | Tür    | Açıklama                                     |
| ----------------- | ------ | -------------------------------------------- |
| `--lock-duration` | string | Kilit süresi (örn. `30d`, `90d`, `180d`)     |

### unlock

xQORE'u tekrar QOR'a çevirir. Erken kilit açma, ceza kademesine bağlı olarak ceza doğurabilir.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Harici bir zincirden köprü yatırma işlemi başlatır.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Bayrak        | Tür    | Açıklama                          |
| ------------- | ------ | ---------------------------------- |
| `--recipient` | string | QoreChain üzerindeki alıcı adresi |

### withdraw

Harici bir zincire köprü çekme işlemi başlatır.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Bir zincirin köprüsünü tek bir imzalı işlemle etkinleştirir veya yeniden yapılandırır (zincir sürümü **v3.1.80** itibarıyla kullanılabilir). `bridge_admin` anahtarı veya bir `qcb_bridge` lisansı gerektirir — yönetişim önerisi veya zincir yükseltmesi gerekmez. Sözleşme adresini, onay sayısını, mimariyi ve durumu ayarlar.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Bir zincirin aktif doğrulayıcısını (verifier) seçer ve güven kökünü kurar (bu komut da `bridge_admin` ile sınırlıdır).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Yürütme ortamları (EVM, CosmWasm, SVM) arasında bir cross-VM mesajı gönderir.

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Bayrak        | Tür    | Açıklama                              |
| ------------- | ------ | -------------------------------------- |
| `--source-vm` | string | Kaynak VM: `evm`, `cosmwasm`, `svm`    |
| `--gas-limit` | uint   | Cross-VM yürütmesi için gas limiti     |

### process-queue

Bekleyen cross-VM mesajlarını manuel olarak işler (operatör komutu).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

SVM çalışma zamanına bir BPF programı dağıtır.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Bayrak         | Tür    | Açıklama                        |
| -------------- | ------ | -------------------------------- |
| `--program-id` | string | İsteğe bağlı program ID (base58) |

### execute

Dağıtılmış bir SVM programı üzerinde bir talimat yürütür.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Bayrak       | Tür    | Açıklama                                              |
| ------------ | ------ | ------------------------------------------------------ |
| `--accounts` | string | Talimat için virgülle ayrılmış hesap açık anahtarları  |

### create-account

Ayrılmış veri alanına sahip yeni bir SVM hesabı oluşturur.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Bayrak    | Tür    | Açıklama                                              |
| --------- | ------ | ------------------------------------------------------ |
| `--owner` | string | Sahip program (base58, varsayılan: sistem programı)    |

---

## multilayer

### register-sidechain

Yeni bir yan zincir (sidechain) katmanı kaydeder.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Bayrak                  | Tür    | Açıklama                                                 |
| ----------------------- | ------ | --------------------------------------------------------- |
| `--block-time-ms`       | uint   | Hedef blok süresi, ms cinsinden (varsayılan 2000)         |
| `--domains`             | string | Virgülle ayrılmış desteklenen alanlar (varsayılan `defi`) |
| `--max-tx`              | uint   | Blok başına maksimum işlem sayısı (varsayılan 1000)       |
| `--min-validators`      | uint32 | Minimum doğrulayıcı kümesi boyutu (varsayılan 1)          |
| `--settlement-interval` | uint   | Blok cinsinden mutabakat aralığı (varsayılan 100)         |
| `--vm-types`            | string | Virgülle ayrılmış desteklenen VM türleri (varsayılan `evm`) |

### register-paychain

Yüksek frekanslı mikro işlemler için yeni bir paychain katmanı kaydeder.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Bayrak                  | Tür  | Açıklama                                            |
| ----------------------- | ---- | ---------------------------------------------------- |
| `--max-tx`              | uint | Blok başına maksimum işlem sayısı (varsayılan 5000)   |
| `--settlement-interval` | uint | Blok cinsinden mutabakat aralığı (varsayılan 50)      |

### anchor-state

Kayıtlı bir katman için durum çapası (mutabakat) gönderir.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Bir işlemi en uygun katmana yönlendirir.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Bayrak           | Tür    | Açıklama                                    |
| ---------------- | ------ | -------------------------------------------- |
| `--target-layer` | string | Belirli bir katmana yönlendirmeyi zorlar     |

### update-layer-status

Bir katmanın operasyonel durumunu günceller (yalnızca operatör).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Durum değerleri: `active`, `paused`, `draining`.

### challenge-anchor

Bir durum çapasına karşı sahtekârlık itirazı gönderir.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Development Kit ile yeni bir rollup kaydeder.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Bayrak              | Tür    | Açıklama                                                 |
| ------------------- | ------ | --------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`            |
| `--profile`         | string | Ön ayar: `defi`, `gaming`, `nft`, `enterprise`, `custom`  |
| `--stake`           | string | Operatör stake miktarı                                    |
| `--da-enabled`      | bool   | Yerleşik veri kullanılabilirliğini etkinleştirir          |

### submit-batch

Bir rollup için mutabakat yığını (batch) gönderir.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Bir mutabakat yığınına karşı sahtekârlık itirazı gönderir (optimistic rollup'lar).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

İtiraz penceresini geçmiş bir yığını manuel olarak kesinleştirir.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Bir rollup'ı duraklatır (yalnızca operatör).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Duraklatılmış bir rollup'ı devam ettirir (yalnızca operatör).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Bir rollup'ı kalıcı olarak durdurur ve stake'ini serbest bırakır (yalnızca operatör).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Rollup para çekme ve katmanlar arası mutabakat işlemleri de `rdk` işlem grubu altında sunulur (örneğin, kesinleşmiş bir yığına karşı kanıtlanmış bir çekme işlemini sonuçlandıran bir `execute-withdrawal` komutu). Tam argümanlar ve bayraklar, rollup'ınızın mutabakat türüne ve DA yapılandırmasına bağlıdır; bu işlemleri oluşturmadan önce yetkili komut yüzeyi için **Rollup Development Kit** belgelerine bakın.
:::

---

## babylon

### submit-btc-checkpoint

Bir epoch için BTC kontrol noktası gönderir.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon entegrasyonu üzerinden BTC'yi yeniden stake eder.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Bayrak          | Tür    | Açıklama                              |
| --------------- | ------ | -------------------------------------- |
| `--btc-tx-hash` | string | Kanıt olarak Bitcoin işlem hash'i      |

---

## abstractaccount

### create

Programlanabilir harcama kurallarına sahip bir soyut hesap oluşturur.

```bash
qorechaind tx abstractaccount create [flags]
```

| Bayrak             | Tür    | Açıklama                                      |
| ------------------ | ------ | ---------------------------------------------- |
| `--spending-rules` | string | Harcama kurallarını tanımlayan JSON dosyası    |

### update-spending-rules

Mevcut bir soyut hesabın harcama kurallarını günceller.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

Kanonik bir hesaptan, authenticator tarafından yetkilendirilmiş bir Native-lane bank gönderimini iletir (zincir sürümü **v3.1.85** itibarıyla kullanılabilir). Relayer (`--from`) zarfı imzalar ve ücretini öder; yetkilendirme, bağlı anahtarın yeniden oynatmaya (replay) karşı korumalı imza baytları üzerindeki imzasıdır. Bkz. [Bağlı Cüzdan Authenticator'ları](/developer-guide/account-abstraction#authenticators).

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

Kanonik hesabın EVM adresinden, authenticator tarafından yetkilendirilmiş bir EVM çağrısını veya transferini iletir (zincir sürümü **v3.1.85** itibarıyla kullanılabilir). Nonce, hesabın **güncel** EVM nonce değeridir.

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM, konsensüs parametrelerini ayarlayan pekiştirmeli öğrenme katmanıdır. Bu komutlar PRISM ajanını kontrol eder; CLI modül adı `rlconsensus` ve alt komutları olduğu gibi korunmuştur.

### set-agent-mode

PRISM ajanının çalışma modunu ayarlar (yalnızca yönetişim).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Mod değerleri: `0` (kapalı), `1` (gözlemle), `2` (öner), `3` (otomatik).

### resume-agent

Devre kesici tetiklenmesinden sonra PRISM ajanını devam ettirir.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISM ajanının politika yapılandırmasını günceller (yalnızca yönetişim).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM ajanı için ödül ağırlığı yapılandırmasını günceller.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Bayrak                | Tür    | Açıklama                            |
| --------------------- | ------ | ------------------------------------ |
| `--throughput-weight` | string | İş hacmi ödülü için ağırlık          |
| `--latency-weight`    | string | Gecikme ödülü için ağırlık           |
| `--security-weight`   | string | Güvenlik ödülü için ağırlık          |
