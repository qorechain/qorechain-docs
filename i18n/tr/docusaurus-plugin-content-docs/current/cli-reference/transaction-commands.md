---
slug: /cli-reference/transaction-commands
title: İşlem Komutları
sidebar_label: İşlem Komutları
sidebar_position: 2
---

# İşlem Komutları

Tüm işlem komutları şu deseni izler:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Canlı mainnet'e (zincir sürümü **v3.1.95**) karşı yayınlamak için `--chain-id qorechain-vladi`, testnet için ise `--chain-id qorechain-diana` ayarlayın. Belirtilmezse istemci, yerel yapılandırmanızdaki `chain-id` değerini kullanır.
:::

Ortak bayraklar her `tx` alt komutu için geçerlidir:

| Bayrak               | Tür    | Açıklama                                        |
| -------------------- | ------ | ------------------------------------------------ |
| `--from`             | string | İmzalayan anahtarın adı veya adresi              |
| `--chain-id`         | string | Zincir tanımlayıcısı (varsayılan: yapılandırmadan) |
| `--fees`             | string | İşlem ücretleri (örn. `500uqor`)                 |
| `--gas`              | string | Gaz limiti veya tahmin için `auto`               |
| `--gas-adjustment`   | float  | `auto` kullanılırken gaz çarpanı (varsayılan: 1.0) |
| `--keyring-backend`  | string | Anahtar zinciri arka ucu: `os`, `file`, `test`   |
| `--node`             | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |
| `--broadcast-mode`   | string | `sync`, `async` veya `block`                     |
| `-y`                 | bool   | Onay istemini atla                               |

---

## bank

### send

Token'ları bir hesaptan diğerine aktarır.

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

| Bayrak                          | Tür    | Açıklama                                     |
| -------------------------------- | ------ | --------------------------------------------- |
| `--amount`                       | string | Öz-delegasyon miktarı (örn. `1000000uqor`)   |
| `--pubkey`                       | string | Doğrulayıcı konsensüs açık anahtarı (JSON)   |
| `--moniker`                      | string | Doğrulayıcı görünen adı                      |
| `--commission-rate`              | string | Başlangıç komisyon oranı (örn. `0.10`)       |
| `--commission-max-rate`          | string | Maksimum komisyon oranı                      |
| `--commission-max-change-rate`   | string | Maksimum günlük komisyon değişim oranı       |
| `--min-self-delegation`          | string | Gerekli minimum öz-delegasyon                |

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

Bir doğrulayıcıdan token'ların bağını çözer.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Bekleyen tüm staking ödüllerini çeker.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Belirli bir doğrulayıcıdan ödülleri çeker.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Bayrak          | Tür  | Açıklama                              |
| ---------------- | ---- | --------------------------------------- |
| `--commission`   | bool | Doğrulayıcı komisyonunu da çeker       |

---

## gov

### submit-proposal

Bir yönetişim önerisi sunar.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Öneri dosyası; öneri türünü, başlığı, açıklamayı ve çalıştırılacak mesajları belirten bir JSON belgesidir.

### vote

Aktif bir öneriye oy verir.

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

Cosmos işlem yolu, varsayılan olarak hibrit bir imza gerektirir (`hybrid_signature_mode = required`). `gen-key` ve `cosign` komutları, klasik secp256k1 imzasının yanında cosmos yolunda işlem yapmak için gereken Dilithium-5 (ML-DSA-87) anahtarını ve `PQCHybridSignature` uzantısını üretir.

### gen-key

Hibrit imzalama için bir Dilithium-5 (ML-DSA-87) kuantum-sonrası anahtarı üretir.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Bir işleme, `PQCHybridSignature` uzantısı olarak bir Dilithium-5 eş-imzası ekleyerek hibrit (secp256k1 + ML-DSA-87) bir işlem oluşturur. Varsayılan `required` uygulama modu altında cosmos-yolu işlemleri için zorunludur. Standart CosmJS / relayer araçlarının işlem yapabilmek için bu uzantıyı üretmesi gerekir; QoreChain SDK'sının `buildHybridTx` fonksiyonu (`includePqcPublicKey` ile) eşdeğerini yapar.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Bir hesap için kuantum-sonrası açık anahtar kaydeder.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Genişletilmiş meta veri ve doğrulama ile bir PQC anahtarı kaydeder.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Bayrak            | Tür    | Açıklama                             |
| ------------------ | ------ | --------------------------------------- |
| `--attestation`    | string | TEE doğrulama verisi (hex)             |
| `--metadata`       | string | Ek anahtar meta verisi (JSON)          |

### migrate-key

Mevcut bir klasik anahtarı hibrit bir PQC anahtar çiftine geçirir.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

Hesabın ML-DSA-87 anahtarını BIP-39 anımsatıcısından (stdin'den okunur) deterministik olarak yeniden oluşturur ve yerel olarak saklar (zincir sürümü **v3.1.85** itibarıyla kullanılabilir). Ekosistem standardı türetme yöntemi olan `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` kullanılır.

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| Bayrak           | Tür    | Açıklama                                                    |
| ----------------- | ------ | -------------------------------------------------------------- |
| `--derivation`    | string | `adapter` (kanonik, varsayılan) veya `bridge` (eski `SHAKE-256(mnemonic)`) |

### rotate-key

Hesabın ML-DSA-87 anahtarını **aynı algoritma içinde** döndürür (zincir sürümü **v3.1.85** itibarıyla kullanılabilir) — örneğin eski yöntemle türetilmiş bir anahtarı kanonik türetmeye geçirmek veya güvenliği ihlal edilmiş bir anahtarı emekliye ayırmak için. Anımsatıcıyı stdin'den okur, eski ve yeni anahtarlarla çift imzalar, zarfı eski anahtarla eş-imzalar ve yayınlar. Yalnızca işlem JSON'unu stdout'a verir (bilgilendirme satırları stderr'e gider), böylece `-o json` ile birlikte çalışır.

```bash
qorechaind tx pqc rotate-key [flags]
```

| Bayrak                | Tür    | Açıklama                                             |
| ---------------------- | ------ | ------------------------------------------------------- |
| `--old-derivation`     | string | Şu anda kayıtlı anahtarın türetme yöntemi (`adapter` \| `bridge`) |
| `--new-derivation`     | string | Yeni anahtarın türetme yöntemi (`adapter` \| `bridge`)  |
| `--new-random`         | bool   | Bunun yerine yeni bir rastgele anahtar üretir           |

---

## xqore

### lock

QOR token'larını bir xQORE yönetişim staking pozisyonuna kilitler.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Bayrak              | Tür    | Açıklama                                    |
| -------------------- | ------ | ---------------------------------------------- |
| `--lock-duration`    | string | Kilit süresi (örn. `30d`, `90d`, `180d`)      |

### unlock

xQORE'u tekrar QOR'a kilitten çıkarır. Erken kilitten çıkarma, ceza katmanına bağlı olarak cezalara neden olabilir.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Harici bir zincirden bir köprü depozitosu başlatır.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Bayrak            | Tür    | Açıklama                          |
| ------------------ | ------ | ------------------------------------ |
| `--recipient`      | string | QoreChain üzerindeki alıcı adresi   |

### withdraw

Harici bir zincire bir köprü çekimi başlatır.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Bir zincirin köprüsünü tek bir imzalı işlemle etkinleştirir veya yeniden yapılandırır (zincir sürümü **v3.1.80** itibarıyla kullanılabilir). `bridge_admin` anahtarı veya bir `qcb_bridge` lisansı gerektirir — herhangi bir yönetişim önerisi veya zincir yükseltmesi gerekmez. Kontrat adresini, onay sayısını, mimariyi ve durumu ayarlar.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Bir zincirin aktif doğrulayıcısını seçer ve güven kökünü kurar (yine `bridge_admin` yetkisi gerektirir).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Çalıştırma ortamları (EVM, CosmWasm, SVM) arasında bir çapraz-VM mesajı gönderir.

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Bayrak           | Tür    | Açıklama                             |
| ----------------- | ------ | ---------------------------------------- |
| `--source-vm`     | string | Kaynak VM: `evm`, `cosmwasm`, `svm`     |
| `--gas-limit`     | uint   | Çapraz-VM çalıştırması için gaz limiti  |

### process-queue

Bekleyen çapraz-VM mesajlarını manuel olarak işler (operatör komutu).

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

| Bayrak            | Tür    | Açıklama                       |
| ------------------ | ------ | --------------------------------- |
| `--program-id`     | string | İsteğe bağlı program kimliği (base58) |

### execute

Dağıtılmış bir SVM programında bir talimat çalıştırır.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Bayrak         | Tür    | Açıklama                                             |
| --------------- | ------ | --------------------------------------------------------- |
| `--accounts`    | string | Talimat için virgülle ayrılmış hesap açık anahtarları     |

### create-account

Ayrılmış veri alanına sahip yeni bir SVM hesabı oluşturur.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Bayrak       | Tür    | Açıklama                                          |
| ------------- | ------ | ------------------------------------------------------ |
| `--owner`     | string | Sahip program (base58, varsayılan: sistem programı)    |

---

## multilayer

### register-sidechain

Yeni bir yan zincir katmanı kaydeder.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Bayrak                     | Tür    | Açıklama                                             |
| --------------------------- | ------ | --------------------------------------------------------- |
| `--block-time-ms`           | uint   | Hedef blok süresi (ms) (varsayılan 2000)                  |
| `--domains`                 | string | Virgülle ayrılmış desteklenen alanlar (varsayılan `defi`) |
| `--max-tx`                  | uint   | Blok başına maksimum işlem sayısı (varsayılan 1000)       |
| `--min-validators`          | uint32 | Minimum doğrulayıcı seti boyutu (varsayılan 1)            |
| `--settlement-interval`     | uint   | Bloklar cinsinden uzlaşma aralığı (varsayılan 100)         |
| `--vm-types`                | string | Virgülle ayrılmış desteklenen VM türleri (varsayılan `evm`) |

### register-paychain

Yüksek frekanslı mikro işlemler için yeni bir paychain katmanı kaydeder.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Bayrak                     | Tür  | Açıklama                                      |
| --------------------------- | ---- | ------------------------------------------------ |
| `--max-tx`                  | uint | Blok başına maksimum işlem sayısı (varsayılan 5000) |
| `--settlement-interval`     | uint | Bloklar cinsinden uzlaşma aralığı (varsayılan 50)   |

### anchor-state

Kayıtlı bir katman için bir durum çıpası (uzlaşma) sunar.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Bir işlemi en uygun katmana yönlendirir.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Bayrak              | Tür    | Açıklama                                  |
| -------------------- | ------ | ---------------------------------------------- |
| `--target-layer`     | string | Belirli bir katmana yönlendirmeyi zorlar       |

### update-layer-status

Bir katmanın operasyonel durumunu günceller (yalnızca operatör).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Durum değerleri: `active`, `paused`, `draining`.

### challenge-anchor

Bir durum çıpasına karşı bir sahtekarlık itirazı sunar.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Geliştirme Kiti ile yeni bir rollup kaydeder.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Bayrak               | Tür    | Açıklama                                             |
| --------------------- | ------ | --------------------------------------------------------- |
| `--settlement-type`   | string | `optimistic`, `zk`, `pessimistic`, `sovereign`             |
| `--profile`           | string | Ön ayar: `defi`, `gaming`, `nft`, `enterprise`, `custom`  |
| `--stake`             | string | Operatör stake miktarı                                    |
| `--da-enabled`        | bool   | Yerel veri kullanılabilirliğini etkinleştirir              |

### submit-batch

Bir rollup için bir uzlaşma grubu (batch) sunar.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Bir uzlaşma grubuna karşı bir sahtekarlık itirazı sunar (optimistic rollup'lar için).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

İtiraz penceresini geçmiş bir grubu manuel olarak kesinleştirir.

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
Rollup çekimi ve katmanlar arası uzlaşma da `rdk` işlem grubu altında sunulur (örneğin, kesinleşmiş bir gruba karşı kanıtlanmış bir çekimi uzlaştıran bir `execute-withdrawal` komutu). Kesin argümanlar ve bayraklar, rollup'ınızın uzlaşma türüne ve DA yapılandırmasına bağlıdır; bu işlemleri oluşturmadan önce yetkili komut yüzeyi için **Rollup Geliştirme Kiti** belgelerine bakın.
:::

---

## babylon

### submit-btc-checkpoint

Bir dönem için BTC kontrol noktası sunar.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon entegrasyonu üzerinden BTC yeniden stake eder.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Bayrak             | Tür    | Açıklama                            |
| ------------------- | ------ | ---------------------------------------- |
| `--btc-tx-hash`     | string | Kanıt olarak Bitcoin işlem hash'i        |

---

## abstractaccount

### create

Programlanabilir harcama kurallarına sahip bir soyut hesap oluşturur.

```bash
qorechaind tx abstractaccount create [flags]
```

| Bayrak                | Tür    | Açıklama                              |
| ---------------------- | ------ | ------------------------------------------ |
| `--spending-rules`     | string | Harcama kurallarını tanımlayan JSON dosyası |

### update-spending-rules

Mevcut bir soyut hesap için harcama kurallarını günceller.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

Kanonik bir hesaptan, bir doğrulayıcı (authenticator) tarafından yetkilendirilmiş bir Native-lane banka gönderimini aktarır (zincir sürümü **v3.1.85** itibarıyla kullanılabilir). Relayer (`--from`) zarfı imzalar ve ücretini öder; bağlı anahtarın tekrar-oynatmaya karşı bağlanmış imza baytları üzerindeki imzası yetkilendirmeyi oluşturur. Bkz. [Bağlı Cüzdan Doğrulayıcıları](/developer-guide/account-abstraction#authenticators).

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

Kanonik hesabın EVM adresinden, bir doğrulayıcı (authenticator) tarafından yetkilendirilmiş bir EVM çağrısını veya transferini aktarır (zincir sürümü **v3.1.85** itibarıyla kullanılabilir). Nonce, hesabın **güncel** EVM nonce değeridir.

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM, konsensüs parametrelerini ayarlayan pekiştirmeli öğrenme katmanıdır. Bu komutlar PRISM ajanını kontrol eder; CLI modül adı `rlconsensus` ve alt komutları olduğu gibi korunur.

### set-agent-mode

PRISM ajanının operasyonel modunu ayarlar (yalnızca yönetişim).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Mod değerleri: `0` (kapalı), `1` (gözlemle), `2` (öner), `3` (otomatik).

### resume-agent

Bir devre kesici tetiklenmesinin ardından PRISM ajanını devam ettirir.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISM ajan politikası yapılandırmasını günceller (yalnızca yönetişim).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM ajanı için ödül ağırlığı yapılandırmasını günceller.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Bayrak                    | Tür    | Açıklama                    |
| -------------------------- | ------ | -------------------------------- |
| `--throughput-weight`      | string | İşlem hacmi ödülü için ağırlık   |
| `--latency-weight`         | string | Gecikme ödülü için ağırlık       |
| `--security-weight`        | string | Güvenlik ödülü için ağırlık      |
