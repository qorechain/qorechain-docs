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
Canlı mainnet'e karşı yayınlamak için `--chain-id qorechain-vladi`, testnet için ise `--chain-id qorechain-diana` ayarlayın. Her iki ağ da v3.2 hattını çalıştırır (mainnet düğüm sürümü **v3.2.1**, testnet **v3.2.2**; güncel sürüm için [download.qore.host](https://download.qore.host) altındaki `latest.json` dosyasına bakın). `--chain-id` belirtilmezse istemci, yerel istemci yapılandırmanızdaki `chain-id` değerini kullanır.
:::

Ortak bayraklar her `tx` alt komutu için geçerlidir:

| Bayrak               | Tür    | Açıklama                                                       |
| -------------------- | ------ | -------------------------------------------------------------- |
| `--from`             | string | İmzalayan anahtarın adı veya adresi                            |
| `--chain-id`         | string | Zincir tanımlayıcısı (varsayılan: istemci yapılandırmasından)  |
| `--fees`             | string | İşlem ücreti, örn. `40000uqor`                                 |
| `--gas-prices`       | string | `--fees` yerine gaz fiyatı, örn. `0.1uqor`                     |
| `--gas`              | string | Gaz limiti veya tahmin için `auto` (varsayılan `200000`)       |
| `--gas-adjustment`   | float  | `auto` tahminine uygulanan çarpan (varsayılan `1`)             |
| `--keyring-backend`  | string | `os`, `file`, `kwallet`, `pass`, `test` veya `memory`          |
| `--node`             | string | RPC uç noktası (varsayılan `tcp://localhost:26657`)            |
| `--broadcast-mode`   | string | `sync` veya `async`                                            |
| `--generate-only`    | bool   | İmzalamak yerine imzasız işlemi yazdırır                       |
| `-y`                 | bool   | Onay istemini atla                                             |

---

## Ücretler ve gaz {#fees-and-gas}

Ağ ücret tabanı **gaz birimi başına 0,1 uqor**'dur (`query feemarket params` komutu `min_gas_price` değerini gösterir; canlı taban ücret yük altında tabanın üzerine çıkabilir, bkz. `query feemarket base-fee`). `fee >= gas limit x gas price` koşulu sağlanmazsa işlem reddedilir; bu nedenle `--fees 500uqor` yalnızca 5.000 veya daha düşük bir gaz limiti için çalışır ve gerçek herhangi bir işlemde başarısız olur.

| İşlem                                         | Önerilen `--gas`  | Karşılık gelen `--fees` |
| --------------------------------------------- | ----------------- | ----------------------- |
| Hibrit imzalı transfer, delegasyon, oy, claim | `400000`          | `40000uqor`             |
| PQC anahtar kaydı                             | `600000`          | `60000uqor`             |
| `lightnode register`                          | `300000`          | `30000uqor`             |

Hibrit bir imza işleme yaklaşık 4,7 KB ekler ve bayt başına 10 gaz ücretlendirilir; bu yüzden varsayılan `--gas 200000` her zaman yeterli değildir: mainnet'teki hibrit imzalı transferler yaklaşık 160.000 ile 240.000 gaz arasında kullandı. `--gas` değerini her zaman `--fees` (veya `--gas-prices`) ile birlikte açıkça ayarlayın.

---

## Cosmos yolunda hibrit imzalama zorunludur {#hybrid-signing}

`hybrid_signature_mode`, her iki ağda da `required` değerindedir (`qorechaind query pqc hybrid-mode`). Her Cosmos-yolu işlemi, secp256k1 imzasının yanında bir ML-DSA-87 (Dilithium-5) imzası da taşımalıdır; düz bir `tx bank send ... -y` reddedilir. Tek istisnalar, PQC anahtar kaydı ve geçişi (yeni bir hesabın ilk anahtarını kaydedebilmesi için) ile kayıtlı PQC anahtarı olmayan bir hesap için `tx slashing unjail` komutudur.

Bu sayfadaki `pqc register-key`, `pqc register-key-v2` ve `pqc migrate-key` dışındaki her komut bu nedenle iki adımda çalıştırılır: işlemi `--generate-only` ile oluşturun, ardından `tx pqc cosign` ile imzalayıp yayınlayın:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

`mypqc` anahtar adı, `tx pqc gen-key` ile oluşturulmuş ve hesaba kaydedilmiş bir anahtardır (bkz. [pqc](#pqc)). Bunun için [download.qore.host](https://download.qore.host) adresindeki resmi sürüm ikilisini kullanın: genel kaynak ağacından derlenen bir ikili Dilithium imzası oluşturamaz veya uygulayamaz (`gen-key` ve `cosign` tam derlemeye ihtiyaç duyduklarını bildirir). [QoreX](/qorex/overview) ve SDK'lar aynı imzalamayı sizin yerinize yapar.

---

## bank

### send

Token'ları bir hesaptan diğerine aktarır.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Örnek: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, ardından yukarıda gösterildiği gibi `tx pqc cosign`. 1 QOR = 1.000.000 uqor.

---

## staking

### create-validator

Bir JSON dosyasından doğrulayıcı oluşturur (bayrak tabanlı biçim kaldırıldı). Mainnet ayrıca etkin bir `validator_operator` lisansı ve kayıtlı bir PQC anahtarı gerektirir; bkz. [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Mevcut bir doğrulayıcının açıklamasını veya komisyonunu düzenler.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Bayraklar: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Belirtilmeyen alanlar değiştirilmez.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Devam eden bir unbonding kaydını iptal eder.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Hapis (jail) süresinden sonra hapisteki bir doğrulayıcıyı aktif kümeye geri döndürür.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Bekleyen tüm staking ödüllerini çeker.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Tek bir doğrulayıcıdan ödülleri çeker.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Bayrak           | Tür  | Açıklama                                                 |
| ---------------- | ---- | -------------------------------------------------------- |
| `--commission`   | bool | Komisyonu da çeker (doğrulayıcı operatör adresleri)      |

---

## gov

### submit-proposal

`messages`, `metadata`, `deposit`, `title`, `summary` ve isteğe bağlı olarak `expedited` içeren bir JSON dosyasından yönetişim önerisi sunar. `qorechaind tx gov draft-proposal` ile bir iskelet oluşturun.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Oy seçenekleri: `yes`, `no`, `abstain`, `no_with_veto`. Bir oyu bölmek için `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` kullanın.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Bir Dilithium-5 (ML-DSA-87) anahtarı üretir ve `<home>/pqc/<name>.dilithium` altında saklar (mod `0600`, **şifrelenmez**). Açık anahtarı hex olarak yazdırır.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Hesabınız için bir PQC açık anahtarı kaydeder (eski komut: algoritma Dilithium-5'tir). Yalnızca klasik anahtarla imzalanır; bu, önyükleme (bootstrap) istisnasıdır.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` değeri `hybrid` (önerilen), `pqc_only` veya `classical_only`'dir. 2.592 baytlık açık anahtar, kaydı bir transferden daha pahalı hale getirir; bu yüzden daha yüksek bir gaz limiti gerekir.

### register-key-v2

Algoritma seçimini açıkça belirterek bir anahtar kaydeder.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` değeri `dilithium5` (veya `1`) ya da `mlkem1024` (veya `2`)'tür.

### cosign

İmzasız bir işlemi PQC anahtarı ve hesabın klasik anahtarıyla imzalar, ardından yayınlar.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Bayrak         | Açıklama                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | `gen-key` veya `recover-key` ile oluşturulan anahtarın adı                                        |
| `--sign-bytes` | `auto` (varsayılan: hangi sign-bytes biçiminin geçerli olduğunu zincire sorar), `v1` veya `v2`    |
| `--generate-only` / `--offline` | İmzalı işlemi yayınlamak yerine JSON olarak yazdırır; daha sonra `tx broadcast` ile gönderilir; `--offline` ayrıca `--account-number`, `--sequence` ve `--sign-bytes v1\|v2` gerektirir |
| `--dry-run`    | Simüle eder ve gaz tahminini yazdırır                                                             |

Her iki ağ da hibrit doğrulamayı v2 sign-bytes biçimine taşıyan yükseltmeyi uyguladı; v1 biçimi reddedilir.

### migrate-key

Hesabınızın PQC anahtarını bir algoritmadan diğerine geçirir. Mevcut algoritmanız için bir geçişin etkin olması gerekir (yönetişim tarafından başlatılır); her iki anahtar da geçiş baytlarını imzalar.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Hesabın ML-DSA-87 anahtarını BIP-39 anımsatıcısından (stdin'den okunur) yeniden oluşturur ve yerel olarak saklar. `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` kullanır.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Bayrak         | Tür    | Açıklama                                                                   |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (kanonik, varsayılan) veya `bridge` (eski `SHAKE-256(mnemonic)`) |

### rotate-key

Hesabın ML-DSA-87 anahtarını aynı algoritma içinde döndürür. Anımsatıcıyı stdin'den okur, eski ve yeni anahtarlarla çift imzalar, eski anahtarla eş-imzalar ve yayınlar.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Bayrak             | Tür    | Açıklama                                                                             |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Şu anda kayıtlı anahtarın türetme yöntemi: `bridge` (varsayılan) veya `adapter`      |
| `--new-derivation` | string | Yeni anahtarın türetme yöntemi: `adapter` (varsayılan) veya `bridge`                 |
| `--new-random`     | bool   | Yeni bir rastgele anahtara döndürür; `--new-key-out` gerektirir                      |
| `--new-key-out`    | string | Herhangi bir şey gönderilmeden önce yeni özel anahtarı `<home>/pqc/<name>.dilithium` olarak kaydeder |
| `--sign-bytes`     | string | `auto` (varsayılan), `v1` veya `v2`                                                  |

### open-evm-window

EVM yolu, bir işlemi yalnızca kayıtlı bir PQC anahtarına sahip **ve** açık bir yetkilendirme penceresi bulunan bir hesaptan kabul eder. Pencere bir Cosmos-yolu mesajıyla açılır; dolayısıyla bir Ethereum cüzdanının üretemediği PQC imzasını taşır. Pencerenin içinde sıradan MetaMask işlemleri değişmeden çalışır.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argüman     | Sınır                | Anlamı                                                                                        |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 ile 17.280 arası   | Pencerenin, onu açan bloktan itibaren sayılarak ne kadar açık kalacağı                        |
| `max-txs`   | 1 ile 1.000 arası    | Kaç EVM işlemini kabul edeceği                                                                |
| `max-value` | pozitif              | Kabul edilen toplam; aktarılan değeri **ve** her işlemin ödeyebileceği azami ücreti sayar; `uqor` veya `qor`, örn. `1000qor` |

Bir pencere açmak mevcut pencerenin yerini alır. `qorechaind query pqc evm-window <address>` ile kontrol edin.

### close-evm-window

Pencerenizi hemen kapatır, örneğin klasik anahtarın ele geçirildiğinden şüphelendiğinizde.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` değeri `sx` veya `ux`'tir. Kayıt, etkin bir `lightnode_operator` lisansı gerektirir ve hafif düğüm ödül programı için kayıt **henüz açık değildir**. Diğer komutlar: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. Bkz. [Hafif Düğüm](/light-node/overview).

---

## bridge

Köprü üretimde değildir: her iki ağda da yapılandırılmış her zincir `pending` durumundadır ve kayıtlı köprü doğrulayıcısı yoktur (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Bir kaynak zincirden köprülenen varlıkları hesaba geçirir. Doğrulayıcı imzalarını (`--validator-sigs`, `--pqc-commitment`) taşır; bu bir köprü operatörü mesajıdır, son kullanıcının para yatırmayı başlatma yolu değildir.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Yönetimseldir (`bridge_admin` veya `qcb_bridge` lisansı).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

İlk `transfer` alt komuttur, ikincisi ise kaynak bağlantı noktasıdır (port). Yazıldığı sırada her iki ağda da açık IBC kanalı yoktur (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` değeri `defi`, `gaming`, `nft`, `enterprise` veya `custom`'dır; `stake_amount` uqor cinsindendir (güncel asgari değer `query rdk config` içindedir). Profilin ön ayarı uzlaşma (settlement), sequencer, DA ve gaz modelini sağlar; komut satırından yalnızca VM geçersiz kılınabilir. `finalize-batch` komutu yoktur.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` değeri `proposed`, `active`, `suspended` veya `decommissioned`'dır. `update-layer-status`, mainnet'te devre kesici tarafından devre dışı bırakılmıştır (aşağıya bakın).

---

## Şu anda devre dışı veya kullanılamayan mesajlar {#disabled-messages}

Bazı komutlar ikilide mevcuttur ancak canlı ağlarda başarılı olamaz:

| Komut                                                     | Neden                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Yükleme ve örnekleme izni her iki ağda da `Nobody`'dir ve mesaj türleri ayrıca devre kesici listesindedir |
| `tx crossvm call`                                         | Mainnet'te devre kesici tarafından devre dışı bırakılmıştır                                    |
| `tx svm deploy-program`, `execute`, `create-account`      | SVM işlem yolu ağ genelinde devre dışıdır                                                      |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Soyut hesap modülü kapalıdır (`query abstractaccount config` komutu `enabled: false` gösterir) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Yönetişim yetkisi mesajlarıdır; ayrıca mainnet devre kesici listesindedir                      |
| `tx license *`                                            | Yalnızca yetkili (lisanslar ağın lisans yetkilisi tarafından verilir)                          |

Canlı liste `qorechaind query circuit disabled-list` ile alınır.
