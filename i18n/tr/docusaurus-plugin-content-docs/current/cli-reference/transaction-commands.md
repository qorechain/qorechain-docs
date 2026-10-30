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
Canlı mainnet'e karşı yayınlamak için `--chain-id qorechain-vladi`, testnet için ise `--chain-id qorechain-diana` ayarlayın. Her iki ağ da v3.2 hattını çalıştırır: mainnet düğüm sürümü **v3.2.5** (29 Ekim 2026'da 3.906.833 yüksekliğinde yönetişim önerisi 14 ile uygulandı; v3.2.4, 23 Ekim 2026'da 3.742.566 yüksekliğinde ve v3.2.3, 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulanmıştı), testnet **v3.2.6** (27 Ekim 2026'da 8.970.638 yüksekliğinde uygulandı; öncesinde v3.2.5, 26 Ekim'de 8.890.800 yüksekliğinde ve v3.2.4, 19 Ekim'de 8.337.253 yüksekliğinde uygulanmıştı). Güncel sürüm için [download.qore.host](https://download.qore.host) altındaki `latest.json` dosyasına bakın. `--chain-id` belirtilmezse istemci, yerel istemci yapılandırmanızdaki `chain-id` değerini kullanır.

Bu sayfadaki komutlar ve bayraklar v3.2.3 sürüm ikilisine karşı, ayrıca v3.2.4 eklemeleriyle denetlenmiştir. Yalnızca v3.2.4'ten itibaren bulunan her şey (mainnet'te 23 Ekim 2026'dan beri, testnet'te 19 Ekim 2026'dan beri) bu şekilde işaretlenmiştir. v3.2.6 kaynağı yeni bir `tx` komutu eklemez; testnet'in durumunu değiştirir (test tokenları, etkinleştirilmiş bir soyut hesap modülü, açık QoreChain Native örnekleme), bunları aşağıdaki bölümler önemli oldukları yerde belirtir.
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

`hybrid_signature_mode`, her iki ağda da `required` değerindedir (`qorechaind query pqc hybrid-mode`). Her Cosmos-yolu işlemi, secp256k1 imzasının yanında bir ML-DSA-87 (Dilithium-5) imzası da taşımalıdır; düz bir `tx bank send ... -y` reddedilir (codespace `pqc`, kod 20). mainnet v3.2.3'ten beri tek istisnalar şunlardır:

- henüz anahtarı olmayan bir hesabın **ilk** PQC anahtar kaydı (`register-key` veya `register-key-v2`); böylece yeni bir hesap kendini başlatabilir;
- kullanılabilir anahtar içermeyen bir hesap kaydının `register-key-v2` ile onarılması;
- kayıtlı PQC anahtarı olmayan bir hesap için `tx slashing unjail`.

Zaten bir PQC anahtarı olan bir hesap her şeyi hibrit imzalamalıdır; buna `register-key-v2` ve `migrate-key` de **dahildir** (yalnızca klasik imzayla yapılan bir deneme 234 koduyla reddedilir). Anahtarı olmayan bir hesap da hibrit imza ekleyemez: doğrulanacak bir şeyi yoktur, bu yüzden önce kayıt yapar.

Bu sayfadaki her komut, ilk kayıt (anahtarı olmayan bir hesapta `pqc register-key` / `pqc register-key-v2`) dışında bu nedenle iki adımda çalıştırılır: işlemi `--generate-only` ile oluşturun, ardından `tx pqc cosign` ile imzalayıp yayınlayın. `pqc rotate-key` kendi eş-imzalamasını ve yayınını yapar; `pqc gen-key` ve `pqc recover-key` yalnızca yerel olarak bir anahtar dosyası oluşturur:

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

`gen-key` ve `recover-key`, bu adda mevcut bir anahtar dosyasının üzerine yazmayı reddeder; `--force` onun yerini alır ve eski dosyayı `<name>.dilithium.bak-<unix-time>` olarak saklar.

### register-key

Hesabınız için bir PQC açık anahtarı kaydeder (eski komut: algoritma Dilithium-5'tir). İlk kayıt yalnızca klasik anahtarla imzalanır; bu, önyükleme (bootstrap) istisnasıdır. Zaten bir anahtarı olan bir hesap bunu hibrit imzalamalıdır (`--generate-only`, ardından `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` değeri `hybrid` (önerilen) veya `pqc_only`'dir. `classical_only` reddedilir (kod 230): kuantum sonrası hiçbir anahtar kaydetmez, dolayısıyla hesap bir daha asla imza atamazdı. 2.592 baytlık açık anahtar, kaydı bir transferden daha pahalı hale getirir; bu yüzden daha yüksek bir gaz limiti gerekir.

Zincir ayrıca kuantum sonrası hiçbir koruma sağlamayan bir anahtarı (kod 230) ve bu hesabın daha önce kullandığı bir anahtarı (kod 232) reddeder. Klasik anahtarı imzalayanın kendi anahtarı olmayan bir kaydı da reddeder (kod 45).

### register-key-v2

Algoritma seçimini açıkça belirterek bir anahtar kaydeder ve isteğe bağlı olarak anahtarın gizli değerine sahip olduğunuzu kanıtlar.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` değeri `dilithium5` (veya `1`) ya da `mlkem1024` (veya `2`)'tür; `key_type` değeri `hybrid` veya `pqc_only`'dir.

**Sahiplik kanıtı (isteğe bağlı).** `--pqc-key <name>` ile (`gen-key` veya `recover-key` ile oluşturulmuş bir anahtar) komut bir sahiplik kanıtı ekler: yeni anahtarın `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` üzerindeki kendi imzası. Zincir, kanıt mevcutsa onu doğrular ve doğrulanmazsa kaydı reddeder (kod 231); kanıtsız bir kayıt yine de kabul edilir. Kanıt zinciri, algoritmayı, hesabı ve anahtarı adlandırır; bu yüzden başka bir hesap veya ağ için hiçbir şeyi kanıtlamaz. İşleme 4.627 baytlık bir imza ekler, bu nedenle gaz limitini `600000` olarak tutun. Kanıt, mesajın `proof_of_possession` alanında taşınır. TypeScript SDK 0.9.0, ağ v3.2.3'ü uyguladıktan sonra `ensurePqcRegistered` aracılığıyla kendiliğinden bir tane ekler; önceki SDK sürümleri ve `@qorechain/wallet-adapter` eklemez, bu yüzden onlar üzerinden yapılan bir kayıt kanıt taşımaz (yine de kabul edilir).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

v3.2.4'ten itibaren (mainnet'te 23 Ekim 2026'dan beri, testnet'te 19 Ekim 2026'dan beri) hesap kaydı ayrıca bir kanıtın doğrulanıp doğrulanmadığını `possession_proven` olarak bildirir (bkz. [REST / gRPC Uç Noktaları](/api-reference/rest-grpc-endpoints#pqc-module)).

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

Her iki ağ da hibrit doğrulamayı v2 sign-bytes biçimine taşıyan yükseltmeyi uyguladı; v1 biçimi reddedilir. Bir işlem yalnızca bir hibrit imza uzantısı taşıyabilir (birden fazlası v3.2.3'ten beri reddedilir).

### migrate-key

Hesabınızın PQC anahtarını bir algoritmadan diğerine geçirir. Mevcut algoritmanız için bir geçişin etkin olması gerekir (yönetişim tarafından başlatılır); her iki anahtar da geçiş baytlarını imzalar ve işlemin kendisi hibrit imzanızı gerektirir (`--generate-only`, ardından `tx pqc cosign`). Hesabın daha önce kullandığı bir anahtar reddedilir (kod 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

v3.2.3'ten itibaren bir döndürme, kuantum sonrası hiçbir koruma sağlamayan yeni bir anahtarı (kod 230) ve hesabın daha önce kullandığı bir anahtarı (kod 232) reddeder; hesap, döndürerek terk ettiği anahtarları hatırlar, bu nedenle bir döndürme, eski bir anahtara dönmek için yeniden oynatılamaz.

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

**Kapsamlı pencereler (mainnet v3.2.3 ve sonrası).** Değer sınırı yalnızca yerel QOR'u sayar: bir token transferi, bir onay (approval) veya başka herhangi bir kontrat çağrısı sıfır değer taşır ve bu sınıra sayılmaz. İki isteğe bağlı bayrak, pencerenin kabul ettiklerini daraltır:

| Bayrak              | Etki                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | Yalnızca düz QOR transferlerini kabul et: calldata yok, kontrat oluşturma yok, kod taşıyan alıcı yok, EIP-7702 yetkilendirmesi yok |
| `--allowed-targets` | Yalnızca bu alıcıları kabul et (virgülle ayrılmış `0x` adresleri); kontrat oluşturma reddedilir                             |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

İki bayraktan hiçbiri olmadan açılan bir pencere, her zaman kabul ettiğini kabul eder. Kapsam, pencere sorgusu tarafından `native_only` ve `allowed_targets` olarak bildirilir.

### close-evm-window

Pencerenizi hemen kapatır, örneğin klasik anahtarın ele geçirildiğinden şüphelendiğinizde. Ayrıca bekleyen bir EIP-7702 delegasyon onayını da iptal eder.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation ve clear-evm-delegation

Hesabınızın bir EIP-7702 delegasyonu, yalnızca kendi kuantum sonrası onayınızla yürürlüğe girer (mainnet'te v3.2.2'den beri). `authorize-evm-delegation`, bu onayı tek bir delege adresi için kaydeder; tek kullanımlıktır, verilen blok sayısı sonunda sona erer ve `close-evm-window` ile iptal edilir. `clear-evm-delegation`, zaten ayarlanmış bir delegasyonu kaldırır. İkisi de hibrit imzalı Cosmos-yolu mesajlarıdır (`--generate-only`, ardından `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

`delegate` olarak sıfır adresi, delegasyonun temizlenmesine onay verir. Durumu `qorechaind query pqc evm-delegation-consent <address>` ile kontrol edin.

PQC anahtar mesajlarından hiçbiri (`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`) `authz` aracılığıyla bir hesap adına gönderilemez (mainnet v3.2.3 ve sonrası).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` değeri `sx` veya `ux`'tir. Kayıt, ağın lisans yetkilisi tarafından verilen etkin bir `lightnode_operator` lisansı gerektirir; programın güncel durumu için bkz. [Hafif Düğüm](/light-node/overview). Diğer komutlar: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

v3.2.3'ten itibaren bir düğümün biriktirebileceği ödül **aylık** olarak sınırlıdır (`GET /qorechain/lightnode/v1/reward_pool` içindeki `max_reward_per_month_per_node`, 30 günde 2.000 QOR); blok süresine ve çalışma süresine göre orantılanır, dolayısıyla sınır artık blokların ne kadar hızlı üretildiğine bağlı değildir. Bir sınır tavandır, vaat edilen bir miktar değildir. v3.2.4'ten itibaren (mainnet'te 23 Ekim 2026'dan beri, testnet'te 19 Ekim 2026'dan beri) bir düğümün sınırı, önceki uzlaşmadan değil kendi kaydından başlar.

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

### register-validator / attest

Köprü doğrulayıcı mesajlarıdır. `register-validator <pqc_pubkey_hex> <supported_chains_csv>` bir doğrulayıcıyı tasdik görevi için kaydeder ve `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` bir tasdik gönderir. Her iki ağda da kayıtlı köprü doğrulayıcısı yoktur. v3.2.4'ten itibaren (mainnet'te 23 Ekim 2026'dan beri, testnet'te 19 Ekim 2026'dan beri) bir köprü doğrulayıcı kaydı ayrıca bir sahiplik kanıtı ve başka hiçbir köprü doğrulayıcısının kullanmadığı bir anahtar gerektirir.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

Yönetimseldir (`bridge_admin` veya `qcb_bridge` lisansı; devre kesici limitleri yönetişim tarafından da ayarlanabilir).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

Limitler temel birimlerdedir ve `0` sınırsız demektir. Yalnızca durumu tam olarak `active` olan bir rota değer taşır.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

İlk `transfer` alt komuttur, ikincisi ise kaynak bağlantı noktasıdır (port). Yazıldığı sırada mainnet'te açık IBC kanalı yoktur; testnet'te açık bir transfer kanalı (`channel-0`) vardır (27 Ekim 2026'da `query ibc channel channels` ile kontrol edildi).

---

## amm

Yerel AMM mesajları. Yazıldığı sırada her iki ağda da havuz yoktur; bu nedenle bu komutların henüz etki edeceği bir şey yoktur.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

v3.2.2'den itibaren bir takas (swap), havuzun her iki denominasyonunu da belirtmelidir, `max_swap_impact_bps` uygulanır ve protokol ücreti burn modülü üzerinden yönlendirilir.

Testnet'te bir havuz, `uqor` ile üç Fest test tokenından biriyle eşleşebilir (değeri yoktur; yalnızca testnet). Mevduat ve takas tutarları, büyük/küçük harfe duyarlı olan `erc20:<EIP-55 0x address>` bank denom'unu kullanır; örneğin `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json` (ardından `tx pqc cosign`). EVM tarafında tutulan bir token önce, göndereni `qor1` adresi olan `MsgConvertERC20` ile bir bank coin'ine dönüştürülmelidir; v3.2.6 düğüm sürümünün CLI komutu `qorechaind tx erc20 convert-erc20` göndereni `0x` adresi olarak yazar ve zincir bunu reddeder (`decoding bech32 failed`), bu nedenle o mesajı bunun yerine `qor1` göndericisiyle oluşturun. Ayrıntılar: [Testnet Fest test tokenları](/developer-guide/evm-development#fest-tokens). Bir havuz oluşturmak, mevduatlara ek olarak havuz oluşturma ücretine mal olur (`query amm params` içindeki `pool_creation_fee`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

Yerel token'ları (örneğin `1000000uqor`) ücret dönüştürme float'ına taşır; bu, bir ücret kabul edilen başka bir token ile ödendiğinde modülün doğrulayıcılara ödeme yapmak için kullandığı QOR rezervidir. Hangi token'ların kabul edileceğine yönetişim karar verir. Her iki ağda da yapılandırma yalnızca yerel `uqor`'u kabul eder, dolayısıyla hiçbir dönüşüm gerçekleşmez; `qorechaind query gasabstraction accepted-tokens` ile kontrol edin.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call`, mainnet'te devre kesici tarafından kapatılmıştır ([aşağıya](#disabled-messages) bakın) ve testnet'te yalnızca hedef yolun kullanılabilir olduğu yerde çalışır. Başarısız olan kuyruğa alınmış bir çağrı (`--async`) arkasında yan etki bırakmaz, yalnızca `Failed` kaydını bırakır (v3.2.3'ten beri) ve türetilmiş kaynak yolu hedef yoluna eşit olan bir çağrı reddedilir. Bkz. [Cross-VM Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability).

---

## stakingtier (v3.2.4) {#stakingtier}

:::note v3.2.4'ten itibaren mevcut
Staking katmanları modülü **v3.2.4** sürümüyle geldi: `qorechain-diana` testnet'inde 19 Ekim 2026'dan beri çalışır ve mainnet'te 23 Ekim 2026'dan beri çalışır (3.742.566 yüksekliği, yönetişim önerisi 13). Daha eski bir sürümde kalan bir düğümde modül yoktur ve bu komutlar reddedilir; hedeflediğiniz düğümde önce `GET /qorechain/stakingtier/v1/params` adresini kontrol edin.
:::

İsteğe bağlı zaman kilitli delegasyonlar: bir delegatör, mevcut bir delegasyonun bir kısmını 3, 6 veya 12 ay boyunca kilitleyebilir (asgari kilit 10 QOR'dur) ve daha sonra modülün bunun için hesaba kattığı bonusu talep edebilir. Kilit, delegasyonun üzerinde bir kayıttır: delege edilen fonlar doğrulayıcıda kalır.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

Kilit, staking mesaj sunucusu tarafından uygulanır; bu nedenle `authz`, bir grup veya bir kontrat üzerinden delegasyonu geri çekmeyi de kapsar. Bir kilidi erken sonlandırmak ödenmemiş bonusunu kaybettirir ve bir ceza yakar; asgari kilit miktarı ve diğer parametreler `GET /qorechain/stakingtier/v1/params` içindedir. Her Cosmos-yolu işlemi gibi bunlar da hibrit eş-imza (`--generate-only`, ardından `tx pqc cosign`) ve cömert bir gaz limiti gerektirir (örneğin `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` değeri `defi`, `gaming`, `nft`, `enterprise` veya `custom`'dır; `stake_amount` uqor cinsindendir (güncel asgari değer `query rdk config` içindedir). Profilin ön ayarı uzlaşma (settlement), sequencer, DA ve gaz modelini sağlar; komut satırından yalnızca VM geçersiz kılınabilir. `finalize-batch` komutu yoktur.

`--anchor-signature`, rollup oluşturucusunun **v2 çapa imza baytları** üzerindeki ML-DSA imzasıdır; bununla batch ayrıca multilayer modülünde de çapalanır. İmzalanacak tam baytları `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>` ile yazdırın; değerler `submit-batch` bayraklarıyla eşleşmelidir. v3.2.3'ten itibaren modül **rollup başına bir emanet defteri** tutar: bir çekim yalnızca o rollup'ın defterinde bulunandan ödenir ve denominasyon, pozitif tutar, kanıt derinliği ve kardeş (sibling) boyutu açısından kontrol edilir; bir rollup'ı durdurmak yalnızca defterinde kalanı iade eder ve durdurulmuş bir rollup başka çekim ödemez. Yazıldığı sırada her iki ağda da rollup yoktur.

Veri erişilebilirliği `native` (veya `both`) olan bir rollup'ta `--data-hash` değerini boş bırakın: hiçbir işlem bir veri erişilebilirliği blob'u yayınlamaz ve zincir, böyle bir rollup için veri hash'i iddia eden bir batch'i reddeder (bu, yazıldığı sırada mainnet sürümü olan düğüm sürümü v3.2.4'ün davranışıdır). İyimser (optimistic) bir rollup için `@qorechain/rdk` istemcisi (0.7.0), bir batch'in durum kökünü zincirin kanonik geçiş köküne (RDK'daki `batchTransitionRoot`) ayarlar; bkz. [Rollup'lar](/rollups/overview).

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
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Mainnet: yükleme ve örnekleme izni `Nobody`'dir ve üç mesaj türü devre kesici listesindedir. Testnet: yükleme `Nobody`'dir ve `MsgStoreCode` listededir (kodu yönetişim depolar), örnekleme ise açıktır (`Everybody`) ve listede değildir |
| `tx crossvm call`                                         | Mainnet'te devre kesici tarafından devre dışı bırakılmıştır; testnet'te etkindir               |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | Mainnet devre kesici listesindedir; v3.2.3'ten itibaren bir vesting hesabı zaten yalnızca imzalayanın kendisi için oluşturulabilir |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | Yönetişim önerisi mesajlarıdır (CLI komutu yok), mainnet devre kesici listesindedir; v3.2.3'ten itibaren yönetişim ayrıca son etkin imza algoritmasını kaldıramaz |
| `tx svm deploy-program`, `execute`, `create-account`      | SVM işlem yolu ağ genelinde devre dışıdır                                                      |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Mainnet: soyut hesap modülü kapalıdır (`query abstractaccount config` komutu `enabled: false` gösterir). Testnet: yönetişim tarafından açılmıştır (`enabled: true`, 27 Ekim 2026'da kontrol edildi) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Yönetişim yetkisi mesajlarıdır; ayrıca mainnet devre kesici listesindedir                      |
| `tx license *`                                            | Yalnızca yetkili (lisanslar ağın lisans yetkilisi tarafından verilir; v3.2.3'ten itibaren yönetişim bu yetkiliyi `MsgUpdateAuthority` ile değiştirebilir) |

Canlı liste `qorechaind query circuit disabled-list` ile alınır.
