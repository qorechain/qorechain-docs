---
slug: /developer-guide/post-quantum-signing
title: Kuantum Sonrası İmzalama
sidebar_label: Kuantum Sonrası İmzalama
sidebar_position: 8
---

# Kuantum Sonrası İmzalama

`qorechain-pqc`, QoreChain'in arkasındaki açık kaynaklı, **yalnızca standartlara dayalı** kuantum sonrası kriptografi kütüphanesidir. Cüzdanlara, entegratörlere ve araçlara, zincirin kullandığı primitiflerin tam olarak aynısını sunar — altı dilde, tek bir tutarlı API ile ve ortak bir diller arası test vektörü paketine karşı **bayt uyumluluğu kanıtlanmış** olarak.

Kütüphane, **nihai NIST standartlarının** denetlenmiş uygulamalarını sarmalar. Özel bir şema **icat etmez**: standart dışı bir varyant, birlikte çalışabilirliği bozan şeyin ta kendisidir (bir yerde üretilen imza başka bir yerde doğrulanamaz). Her binding aynı vektörlere karşı doğrulanır; böylece bir dilde üretilen ML-DSA imzası diğer tüm dillerde doğrulanır, ML-KEM paylaşılan sırları altı dilin tamamında eşleşir ve SHAKE-256 özetleri birebir aynıdır.

* **Depo:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Lisans:** Apache-2.0

## Primitifler

| Primitif | Standart | Rol | Seviyeler (varsayılan **kalın**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | dijital imzalar | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | anahtar kapsülleme | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | genişletilebilir çıktılı özet (hash) | — |

Bunlar, QoreChain'in protokol seviyesinde çalıştırdığı primitiflerin aynısıdır: **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve varsayılan uygulama özeti olarak **SHAKE-256**. Zincirin bunları nasıl kullandığını görmek için [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) sayfasına bakın.

### Boyutlar (bayt)

Güvenlik seviyesini boyut/güvenlik bütçenize göre seçin.

| Şema | Güvenlik | Açık anahtar | İmza / Şifreli metin |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Bir NIST standardını küçültüp yine de standart kalamazsınız. ML-DSA-87'nin anahtar/imza boyutları ve baytları sabittir — onu "optimize etmek", başka hiçbir uygulamanın doğrulayamayacağı standart dışı bir varyant üretir. Zincir üzerindeki ayak izini küçültmek için şemayı değiştirmek yerine aşağıdaki kaldıraçları kullanın.

## Diller ve paketler

Her dil aynı API'yi sunar ve her biri farklı bir denetlenmiş uygulama tarafından desteklenir. Bayt uyumluluğunu garanti eden şey budur — bağımsız arka uçlar standart üzerinde hemfikirdir.

| Dil | Paket | Kurulum | Arka uç |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (statik kütüphane + başlık dosyası) | [depodan](https://github.com/qorechain/qorechain-pqc) derleyin | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.3` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Kullanılabilirlik
JavaScript, Rust, Python, Go ve Java binding'lerinin tamamı **0.2.3** sürümünde **yayımlanmıştır** (npm, crates.io, PyPI, `v0.2.3` olarak Go modül proxy'si ve Maven Central; 21 Ekim 2026'da kontrol edildi). Bunları yukarıdaki komutlarla kurun. Python dağıtımı `qorechain-pqc` olarak kurulur ancak **`qorpqc` olarak import edilir**. **Java** paketi `io.github.qorechain:qorechain-pqc:0.2.3`'tür (Bouncy Castle arka ucu). **0.2.0** sürümü, sürüm farkındalıklı `hybridSignBytes` işlevini (aşağıda) ekledi; **0.2.1** ana ağ için v2'ye geçişi hangi yükseltme adının işaretlediğini düzeltti; **0.2.2** ise hedged ile deterministik imzalamaya ilişkin dokümantasyonu ve yorumları düzeltti (zincir ikisini de kabul eder; JavaScript binding'inde kodda sürüm sabiti dışında hiçbir şey değişmedi); **0.2.3** ise şifreleme bağımlılıklarını (Java'da Bouncy Castle, JavaScript'te `@noble/post-quantum`) özdeş çıktıyla günceller. 0.2.1 veya üstünü kullanın. **C** binding'i, [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) deposundan derlediğiniz bir statik kütüphane + başlık dosyasıdır.
:::

## Deterministik imzalama (varsayılan) {#deterministic-signing}

**0.1.1** sürümünden itibaren (ve sonraki her sürümde) `sign()`, **altı binding'in tamamında** **deterministik** ML-DSA varyantını üretir (FIPS-204 §3.4; imzalama rastgeleliği 32 sıfır bayttır). Zincir, hedged veya deterministik, FIPS-204'e uygun her geçerli ML-DSA-87 imzasını kabul eder: doğrulama ikisi için de aynıdır ve bir doğrulayıcı gizli anahtar olmadan ikisini ayırt edemez. Binding'ler varsayılan olarak deterministik imzalar; böylece aynı işlem her zaman aynı imzayı ve aynı tx hash'ini üretir ve her binding ortak vektörlerle eşleşir.

Temel bilgiler:

* Deterministik çıktı, aynı anahtar ve mesaj için **altı binding'in tamamında bayt bayt aynıdır**; ortak, diller arası test vektörleriyle sabitlenmiştir.
* Hedged imzalama, her binding'de **açık bir opt-in** olarak kullanılabilir (ör. JavaScript'te `{hedged: true}`, Rust'ta `sign_hedged`, Java'da `mldsaSignHedged`, Python'da `sign(..., hedged=True)`). Hedged imzalar, geçerli her FIPS-204 imzası gibi **zincir tarafından kabul edilir**; tek fark, imzanın ve dolayısıyla tx hash'inin her imzalamada değişmesidir.
* JavaScript binding'inin 0.1.0 sürümü varsayılan olarak hedged imzalıyordu. Bu imzalar da zincir üzerinde geçerlidir; ortak vektörlerle eşleşen, yeniden üretilebilir imzalar istiyorsanız 0.1.1'e yükseltin.

## Anahtarınızı kaydetme {#pqc-key-registration}

Her hesap ML-DSA-87 açık anahtarını **bir kez ve açıkça** kaydeder. Otomatik kayıt yoktur: sonraki bir hibrit işleme gömülü bir açık anahtar (örneğin SDK'nın `includePqcPublicKey` seçeneği) uzantıda taşınır ancak anahtarı **kaydetmez**. **İlk** kayıt, klasik olarak imzalanabilen tek Cosmos şeridi işlemidir; böylece yepyeni bir hesap ilk anahtarını başlatabilir; zaten bir anahtarı olan bir hesap, sonraki her anahtar mesajını hibrit imzalamalıdır. Bunu sürüm ikili dosyası `qorechaind` ile (genel kaynaktan derlenen bir ikili dosya imzalayamaz; bkz. [Kaynaktan Derleme](/developer-guide/building-from-source)), QoreX ile veya SDK'nın `ensurePqcRegistered` işleviyle yapın:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

`--gas` değerini açıkça ayarlayın: 2.592 baytlık açık anahtar varsayılan 200.000 gazı aşabilir (ana ağ kayıtları kabaca 220.000 ile 310.000 arası kullandı; sahiplik kanıtı içeren bir kayıt bir 4.627 baytlık imza daha taşır, yaklaşık 46.000 gaz fazladan) ve ücret en az gas × 0,1 uqor olmalıdır; dolayısıyla `--gas 600000` için `--fees 60000uqor` veya daha fazlası gerekir. Eski biçim `qorechaind tx pqc register-key <pubkey-hex> hybrid`, Dilithium-5 için eşdeğerdir. Bundan sonra her Cosmos şeridi işlemini `--generate-only` ile oluşturun ve `qorechaind tx pqc cosign` ile imzalayın. Anahtar dosyası, hesabın kuantum sonrası imzalama anahtarıdır: onu okuyabilen herkes klasik anahtarla birlikte hesap adına eş imza atabilir; bu yüzden onu mnemonic gibi yedekleyin (aşağıda açıklandığı gibi mnemonic'ten yeniden türetilebilir).

Kayıtlı bir anahtar, EVM işlemleri göndermek için gereken iki şartın ilkidir; ikincisi açık bir [EVM yetkilendirme penceresidir](/developer-guide/evm-development#evm-window).

### Zincirin kayıt sırasında neleri kontrol ettiği (ana ağ v3.2.3 ve sonrası) {#key-integrity}

v3.2.3 yükseltmesinden beri (ana ağda 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulandı) zincir yalnızca anahtarın doğru uzunlukta olduğunu değil, anahtarın kendisini de kontrol eder:

| Kural | Ret (codespace `pqc`) |
| --- | --- |
| `key_type` değeri `hybrid` veya `pqc_only` olmalıdır; `classical_only` hiçbir kuantum sonrası anahtar kaydetmez ve hesabı bir daha imzalayamaz hale getirir | kod 230 |
| Kuantum sonrası koruma sağlamayan bir anahtar (kimsenin gizli anahtara ihtiyaç duymadığı dejenere bir anahtar) kayıtta, rotasyonda ve geçişte aynı şekilde reddedilir | kod 230 |
| Hesabın daha önce kullandığı bir anahtar yeniden kaydedilemez veya ona geri döndürülemez (hesap emekliye ayrılmış anahtarları hatırlar) | kod 232 |
| Kayıttaki klasik anahtar, imzalayanın kendi sıkıştırılmış secp256k1 anahtarı olmalıdır (v3.2.2'den beri) | kod 45 |
| İsteğe bağlı bir sahiplik kanıtı, varsa doğrulanmalıdır | kod 231 |
| Zaten bir anahtarı olan bir hesap, sonraki her anahtar mesajını (kayıt, geçiş) hibrit imzalamalıdır; yalnızca kullanılabilir anahtar içermeyen bir kaydın onarımı klasik olabilir | kod 234 |
| Bir algoritmayı kullanımdan kaldırmak veya devre dışı bırakmak, zinciri etkin bir imza algoritması olmadan bırakamaz | kod 233 |

Ayrıca, v3.2.3'ten beri anahtar mesajlarının hiçbiri (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`) bir hesap adına `authz` aracılığıyla gönderilemez; bir işlem en fazla **bir** hibrit imza uzantısı taşıyabilir; ve **kayıtlı anahtarı olmayan** bir hesap artık karşısında doğrulanacak hiçbir şey bulunmayan bir hibrit uzantı ekleyemez (hiç uzantı olmamasında olduğu gibi yalnızca bir kayıt geçebilir).

### Sahiplik kanıtı (isteğe bağlı) {#proof-of-possession}

Bir kayıt ayrıca, kaydı yapanın yeni anahtarın gizli anahtarına sahip olduğunu da kanıtlayabilir. Anahtar `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` metnini imzalar (algoritma kimliği ML-DSA-87 için `1`'dir; açık anahtar küçük harfli hex'tir) ve imza `MsgRegisterPQCKeyV2` mesajının `proof_of_possession` alanına konur. CLI ile `register-key-v2 ... --pqc-key <name>` bunu oluşturur ve ekler. TypeScript SDK 0.9.0 ile `ensurePqcRegistered`, ağ v3.2.3'ü uyguladıktan sonra kanıtı kendiliğinden ekler (`signProofOfPossession` / `verifyProofOfPossession` ise bir kanıtı elle oluşturur ve denetler); `@qorechain/chain-bridge` 0.2.3, `cosmosRest` verildiğinde aynısını yapar. `@qorechain/wallet-adapter` (0.4.0) ve 0.9.0 öncesi SDK sürümleri kanıt eklemez; bu nedenle onlarla yapılan bir kayıt kanıt taşımaz ve zincir yine de bunu kabul eder. Zincir, kanıtı **varsa** doğrular ve doğrulanmazsa kaydı reddeder (kod 231); kanıtsız bir kayıt ana ağda hâlâ kabul edilir. Mesaj zinciri, algoritmayı, hesabı ve anahtarı adlandırdığı için, bunlardan biri için yapılmış bir kanıt diğeri için hiçbir şeyi kanıtlamaz.

**Sahiplik bayrağı ve köprü doğrulayıcıları (v3.2.4).** Hesap kaydı, hesabın geçerli anahtarının kanıtlanıp kanıtlanmadığını bildirir: `GET /qorechain/pqc/v1/account/{address}` içindeki `possession_proven`. Anahtar doğrulanmış bir sahiplik kanıtıyla kaydedildiğinde veya bir rotasyonla yüklendiğinde (yeni anahtar rotasyonu imzalar, bu da onu kanıtlar) `true` olur; kanıtsız kaydolan bir hesapta `false` kalır. Bayrak, kimin gönderip alabileceğini hiçbir şekilde değiştirmez. Bir **köprü doğrulayıcısı** kaydetmek ayrıca doğrulayıcının kuantum sonrası anahtarının sahiplik kanıtını gerektirir (kayıtta `proof_of_possession`; anahtar, CLI `--pqc-key` ile `qorechain-pqc-pop-v1|<chain-id>|1|<validator address>|<public key hex>` metnini imzalar) ve hiçbir iki köprü doğrulayıcısı aynı anahtarı kaydedemez. Zincirler arası köprünün kendisi üretimde değildir. Her iki değişiklik de test ağında 19 Ekim 2026'dan beri, mainnet'te ise 3.742.566 yüksekliğinden itibaren (yönetişim önerisi 13) geçerlidir: mainnet o bloğa kadar v3.2.3, o bloktan itibaren v3.2.4 çalıştırır.

## Ret kodları (codespace `pqc`) {#pqc-codes}

| Kod | Anlamı |
| --- | --- |
| 20 | Hibrit imza gerekli: işlem hiçbir PQC uzantısı taşımıyor (yalnızca ilk kayıt ve anahtarı olmayan bir hesabın unjail işlemi muaftır) |
| 21 | ML-DSA-87 yarısı doğrulanmadı, bkz. [aşağıda](#code-21) |
| 26, 27, 28 | EVM şeridi: açık pencere yok veya anahtar yok / pencere tükendi / geçersiz pencere sınırları, bkz. [EVM Geliştirme](/developer-guide/evm-development#evm-window) |
| 45 | Bir kayıttaki klasik anahtar, imzalayanın kendi sıkıştırılmış secp256k1 anahtarı değil |
| 60, 61 | EIP-7702 delegasyonu: bu delegasyon için kuantum sonrası onay yok / geçersiz delegasyon isteği |
| 62, 63 | Delege edilmiş bir hesabın eylemi kapsayan bir penceresi yok / bir Ethereum işlemi yalnızca EVM şeridinde yürütülür |
| 230 | Zayıf anahtar veya `classical_only` kaydı |
| 231 | Sahiplik kanıtı doğrulanmıyor |
| 232 | Anahtar bu hesap tarafından daha önce kullanılmış |
| 233 | Etkin hiçbir imza algoritması kalmayacak |
| 234 | Anahtarı olan bir hesaptan anahtar bakımı hibrit imza gerektirir |

## `pqc` kodu 21 (`hybrid_verify_failed`) sorun giderme {#code-21}

Kod 21, hibrit imzanın ML-DSA-87 yarısının hesabın kayıtlı anahtarına karşı doğrulanmadığı anlamına gelir. Hedged yerine deterministik imzalamayı seçmek **asla** nedeni değildir. Şu sırayla kontrol edin:

1. **Sign-bytes sürümü.** PQC imzası v1 veya v2 sign-bytes'ı kapsar ve bir ağ her yükseklikte tam olarak bir biçimi doğrular: `qorechain-diana` `v3.1.98` yükseltmesiyle v2'ye geçti, `qorechain-vladi` `v3.2.0` yükseltmesiyle geçti ve daha sonra doğan zincirler genesis'ten itibaren v2'dir. Güncel SDK'lar biçimi ağa göre seçer; elle yazılmış imzalayıcılar, hangi yükseltmenin uygulandığını düğüme sormalıdır (bkz. [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc)).
2. **v2 sign-bytes içindeki chain-id.** v2 chain-id'yi bağlar; `qorechain-diana` için oluşturulan bir imza `qorechain-vladi` üzerinde doğrulanmaz, tersi de geçerlidir.
3. **Eski PQC kütüphanesi.** Standart öncesi (FIPS-204 öncesi) derlemeler, standarda uygun bir doğrulayıcının reddettiği imzalar üretir. `qorechain-pqc` 0.1.1 veya üstünü kullanın.
4. **Yanlış anahtar.** Açık anahtar, hesap için kayıtlı olan anahtar olmalıdır (`GET /qorechain/pqc/v1/account/{address}`). Farklı bir türetmeyle elde edilen anahtar (örneğin adrese bağlı türetme yerine eski bridge türetmesi `shake256(mnemonic)`) geçerli imzalar ama eşleşmez. Kanonik anahtara geçmek için [Anahtar rotasyonu](#key-rotation) bölümüne bakın.

## Deterministik anahtar türetme ve kurtarma {#key-derivation}

Ekosistem standardı türetme, ML-DSA-87 anahtarını hesaba bağlar; böylece anahtar **yalnızca hesabın mnemonic'inden kurtarılabilir**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Yayımlanmış her araç (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) aynı anahtarı türetir; dolayısıyla bir mnemonic, kullanılan araçtan bağımsız olarak tek bir anahtar üretir. CLI üzerinde bir anahtarı kurtarın (mnemonic stdin'den):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

Kurtarılan özel anahtar, `tx pqc cosign` ile kullanılmak üzere şifrelenmemiş onaltılık biçimde (mod 0600) `<home>/pqc/mykey.dilithium` dosyasına yazılır.

## Anahtar rotasyonu (aynı algoritma) {#key-rotation}

Zincir sürümü **v3.1.85** itibarıyla **`MsgRotatePQCKey`**, bir hesabın ML-DSA-87 anahtarını **aynı algoritma içinde** döndürür — daha önce kayıt tek seferlikti ve `MigratePQCKey` yalnızca algoritmalar arası geçiş yapıyordu. Bunu, legacy yöntemle türetilmiş bir anahtarı kanonik, adrese bağlı türetmeye taşımak veya ele geçirilmiş bir anahtarı emekliye ayırmak için kullanın.

Rotasyon **çift imzalıdır**: hem eski hem de yeni anahtar, alan ayrımlı (domain-separated) `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"` mesajını imzalar. Yeniden oynatma (replay) yapısal olarak imkânsızdır — rotasyondan sonra eski anahtar artık kayıtlı anahtarla eşleşmez, bu yüzden aynı mesaj yeniden uygulanamaz. Rotasyon **yalnızca kök anahtarla yapılabilen** bir işlemdir (asla bir [authenticator'a](/developer-guide/account-abstraction#authenticators) devredilemez) ve işlemin kendisi hâlâ *eski* anahtarla hibrit imzalanır; bu da mevcut sahipliği kanıtlar.

Tek adımlı CLI (mnemonic stdin'den; eski anahtarı kurtarır, yenisini türetir veya üretir, çift imzalar, yayınlar):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

Rotasyon, 2.592 baytlık iki anahtar ve üç imza taşır; bu yüzden bir transferden çok daha fazla gaz gerektirir. Açık `--gas 600000` değerini ve en az 60.000 uqor ücreti koruyun. `--new-key-out` olmadan `--new-random` reddedilir (düğüm sürümü v3.2.1 ve sonrası); böylece bir rotasyon sizi asla yeni anahtarsız bırakamaz.

Kod tarafında, `@qorechain/wallet-adapter` (≥0.1.7) ve `@qorechain/sdk` (≥0.7.0) aynı akışı sunar (eşzamanlıdır; mesajı ve her iki anahtar çiftini döndürür):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

SDK 0.9.0 ve `@qorechain/wallet-adapter` 0.4.0'ın rotasyon yardımcıları, eski türetmeyi **yeni** anahtar olarak reddeder (hesaba bağlı değildir); eski bir anahtar yine de eski anahtar olabilir. Başarılı bir rotasyondan sonra yeni anahtar imzalar (kod 0) ve eski anahtar reddedilir (`pqc` kodu 21). v3.2.3'ten beri bir rotasyon (tıpkı bir geçiş gibi), kuantum sonrası koruma sağlamayan yeni bir anahtarı (kod 230) ve hesabın daha önce kullandığı bir anahtarı (kod 232) reddeder ve `authz` aracılığıyla gönderilemez.

## Tutarlı API

Her dil aynı yüzeyi sağlar:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Hızlı başlangıç (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

Varsayılanın istediğiniz şey olmadığı durumlar için seviyeye özel export'lar mevcuttur: `mldsa44/65/87` ve `mlkem512/768/1024` (`mldsa` / `mlkem` L5 varsayılanlarıdır).

**Rust, Go, C, Python ve Java** binding'leri bunu birebir yansıtır. Örneğin:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## Blokzincir yardımcıları

Ham primitiflerin ötesinde, kütüphane entegratörlerin QoreChain hesapları ve işlemleriyle etkileşmek için ihtiyaç duyduğu iki yardımcı sunar.

### `pubkeyHash(pk, len=20)`

Bir **pay-to-pubkey-hash** kayıt yardımcısı. Bir açık anahtarın kısa (20–32 bayt) SHAKE-256 özetini üretir. Desen şudur: hesap durumunda yalnızca `pubkeyHash` değerini saklayın ve tam açık anahtarı işlemin içinde zorunlu kılın. 1–2,5 KB'lık anahtara rağmen hesap durumu küçücük kalır.

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

QoreChain'in cüzdan uyumlu **hibrit uzantılı imza baytları çerçevelemesi**. Bu, bir hibrit işlemin PQC yarısını oluşturmak üzere ML-DSA-87 (Dilithium-5) ile imzalanması gereken baytların tam olarak kendisini üretir. İki biçim vardır ve bir ağ her yükseklikte tam olarak birini doğrular: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` ve **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` PQC uzantısı olmadan işlem gövdesi, `A` auth info'dur). Her iki genel ağ da **v2** üzerindedir. Kütüphane saftır, bu yüzden biçimi çağıran seçer: düğüme `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` isteğini **her iki** ad için sorun, `v3.2.0` (ana ağın yükseltme adı) ve `v3.1.98` (test ağının önceki adı); herhangi birinin yüksekliği 0'ın üzerindeyse v2'yi kullanın. `signBytesVersionForApplied` ve `signBytesVersionFor(chainId, height)` bu kuralı uygular (`@qorechain/pqc` 0.2.1 veya üstünü kullanın; 0.1.x'teki 2 argümanlı biçim hata fırlatır).

Cüzdanların ve entegratörlerin cosmos işlem yolunda **zorunlu hibrit imzayı** üretmek için kullandığı parça budur. Mevcut zincir sürümü itibarıyla hibrit imzalar **varsayılan olarak zorunludur** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): her cosmos yolu işlemi, klasik secp256k1 imzasının yanında bir Dilithium-5 imzası taşımak zorundadır. Uygulama (enforcement) modeli için [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) sayfasına bakın.

Klasik secp256k1 imzası, standart imza baytları üzerinde hesaplanır (bunlar PQC uzantısını **hariç tutar**) ve ML-DSA-87 imzası hesaplanıp `PQCHybridSignature` uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç tuttuğu için, bir doğrulayıcının PQC kısmını anlayıp anlamadığından bağımsız olarak klasik imza geçerli kalır.

Bu hibrit imzayı üretmenin üç yolu vardır:

* **CLI** — `qorechaind tx pqc cosign`, bir işleme Dilithium-5 eş imzasını ekler ve yayınlar (`qorechaind tx pqc gen-key` sonrasında ve anahtarı kaydettikten sonra). Yalnızca sürüm ikili dosyasının parçasıdır. Bkz. [İşlem Komutları](/cli-reference/transaction-commands).
* **QoreChain SDK** — `buildHybridTx` / `signAndBroadcastHybrid` (sign-bytes biçiminin çözümlenmesi için `rest` geçirin) aynısını TypeScript, Python, Go, Rust ve Java'da yapar; TypeScript'te `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) her işlemi hibrit imzalar. Önce anahtarınızı kaydedin (yukarıya bakın). Bkz. [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc).
* **Doğrudan `qorechain-pqc`** — desteklenen altı dilden birinde SDK dışında araç geliştiriyorsanız, imza baytlarını çerçevelemek için `hybridSignBytes` ve Dilithium-5 imzasını üretmek için `mldsa.sign` kullanın.

## Zincir üzerindeki ayak izini optimize etme

ML-DSA anahtarları ve imzaları, klasik standartlara göre büyüktür. Bir standardın baytları sabit olduğu için, zincir üzerindeki ayak izini küçük tutmanın yolu şu üç kaldıracı kullanmaktır — hiçbiri standardı değiştirmez:

1. **Güvenlik seviyesini bilinçli seçin.** ML-DSA-65 (L3) imzaları, ML-DSA-87 (L5) imzalarından yaklaşık %28 daha küçüktür ve yine de çok güçlüdür; ML-KEM-768 şifreli metinleri 1024'ünkilerden daha küçüktür. Kullanım senaryosuna göre seçin.
2. **Pay-to-pubkey-hash.** Hesap durumunda yalnızca `pubkeyHash(pk)` değerini (20–32 bayt SHAKE-256) saklayın ve tam açık anahtarı işlemin içinde zorunlu kılın. Anahtar boyutu ne olursa olsun hesap durumu küçücük kalır.
3. **Doğrula ve at (verify-and-discard) yaklaşımı.** Bir imza işlemin içinde (blok verisinde) bulunmak zorundadır, ancak asla kalıcı durum ağacına yazılmamalıdır.

> **Neden Falcon yok?** FN-DSA (Falcon) daha küçük imzalar sağlardı, ancak bilinçli olarak **hariç tutulmuştur**: FN-DSA, FIPS-206 *taslağıdır* (nihai değil) ve yalnızca standartlara dayalı bir kütüphane sadece nihai standartları içerir. FIPS-206 nihai hale geldiğinde yeniden değerlendirilebilir.

## İlgili

* [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) — zincirin bu primitifleri nasıl kullandığı ve hibrit imzaları nasıl zorunlu kıldığı.
* [İşlem Komutları](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` CLI akışı.
* [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc) — QoreChain SDK ile anahtarlar ve hibrit imzalama.
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — PQC destekli hesaplar oluşturun ve yönetin.
