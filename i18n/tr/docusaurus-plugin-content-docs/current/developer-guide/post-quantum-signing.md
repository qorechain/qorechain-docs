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
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Kullanılabilirlik
JavaScript, Rust, Python, Go ve Java binding'lerinin tamamı **0.1.1** sürümünde **yayımlanmıştır** — yukarıdaki komutlarla doğrudan npm, crates.io, PyPI, Go modül proxy'si ve Maven Central'dan kurabilirsiniz. Python dağıtımı `qorechain-pqc` olarak kurulur ancak **`qorpqc` olarak import edilir**. **Java** paketi Maven Central'da `io.github.qorechain:qorechain-pqc:0.1.1` olarak bulunur (Bouncy Castle arka ucu). **C** binding'i, [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) deposundan derlediğiniz bir statik kütüphane + başlık dosyasıdır.
:::

## Deterministik imzalama (konsensüs açısından kritik) {#deterministic-signing}

**0.1.1** sürümünden itibaren `sign()`, **altı binding'in tamamında** **deterministik** ML-DSA varyantını üretir (FIPS-204 §3.4; imzalama rastgeleliği 32 sıfır bayttır) — ve zincirin kabul ettiği tek varyant budur. QoreChain'in işlem doğrulayıcısı **hedged (rastgeleleştirilmiş) ML-DSA imzalarını reddeder**; bu nedenle hedged bir imza, kriptografik olarak doğrulansa bile zincir üzerinde başarısız olur.

Temel noktalar:

* **Varsayılanı değiştirmeyin.** Deterministik imzalama konsensüs açısından kritiktir; her binding bunu bu şekilde belgeler.
* Deterministik çıktı, aynı anahtar ve mesaj için **altı binding'in tamamında bayt bayt aynıdır** — ortak diller arası test vektörleriyle sabitlenmiştir.
* Hedged imzalama, zincir dışı kullanım senaryoları için her binding'de **açıkça tercih edilmesi gereken bir seçenek** olarak mevcuttur (örn. JavaScript'te `{hedged: true}`, Rust'ta `sign_hedged`, Java'da `mldsaSignHedged`, Python'da `sign(..., hedged=True)`) — hedged imzalar **zincir tarafından kabul edilmez**.
* JavaScript binding'inin 0.1.0 sürümü varsayılan olarak hedged imzalıyordu — işlem araçlarınızı 0.1.0'a göre geliştirdiyseniz **0.1.1'e yükseltin**; eski varsayılanla imzalanan işlemler zincir üzerinde reddedilir.

## Deterministik anahtar türetme ve kurtarma {#key-derivation}

Ekosistem standardı türetme, ML-DSA-87 anahtarını hesaba bağlar; böylece anahtar **yalnızca hesabın mnemonic'inden kurtarılabilir**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Yayımlanmış her araç (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) aynı anahtarı türetir; dolayısıyla bir mnemonic, kullanılan araçtan bağımsız olarak tek bir anahtar üretir. CLI üzerinde bir anahtarı kurtarın (mnemonic stdin'den):

```bash
qorechaind tx pqc recover-key mykey qor1youraddress...
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge
```

## Anahtar rotasyonu (aynı algoritma) {#key-rotation}

Zincir sürümü **v3.1.85** itibarıyla **`MsgRotatePQCKey`**, bir hesabın ML-DSA-87 anahtarını **aynı algoritma içinde** döndürür — daha önce kayıt tek seferlikti ve `MigratePQCKey` yalnızca algoritmalar arası geçiş yapıyordu. Bunu, legacy yöntemle türetilmiş bir anahtarı kanonik, adrese bağlı türetmeye taşımak veya ele geçirilmiş bir anahtarı emekliye ayırmak için kullanın.

Rotasyon **çift imzalıdır**: hem eski hem de yeni anahtar, alan ayrımlı (domain-separated) `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"` mesajını imzalar. Yeniden oynatma (replay) yapısal olarak imkânsızdır — rotasyondan sonra eski anahtar artık kayıtlı anahtarla eşleşmez, bu yüzden aynı mesaj yeniden uygulanamaz. Rotasyon **yalnızca kök anahtarla yapılabilen** bir işlemdir (asla bir [authenticator'a](/developer-guide/account-abstraction#authenticators) devredilemez) ve işlemin kendisi hâlâ *eski* anahtarla hibrit imzalanır; bu da mevcut sahipliği kanıtlar.

Tek adımlı CLI (mnemonic stdin'den; eski anahtarı kurtarır, yenisini türetir veya üretir, çift imzalar, yayınlar):

```bash
# migrate a legacy-derived key to the canonical derivation:
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi -o json -y

# rotate to a brand-new random key (compromise recovery):
qorechaind tx pqc rotate-key --old-derivation adapter --new-random \
  --from mykey --chain-id qorechain-vladi -o json -y
```

Kod tarafında, `@qorechain/wallet-adapter` (≥0.1.7) ve `@qorechain/sdk` (≥0.7.0) aynı akışı sunar:

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const msg = await rotatePqcKeyMsgFromMnemonic({
  mnemonic, address: "qor1youraddress...", chainId: "qorechain-vladi",
});
// Sign & broadcast with the account's normal hybrid signer (old key cosigns the envelope).
```

Başarılı bir rotasyondan sonra yeni anahtar imzalar (kod 0) ve eski anahtar reddedilir (`pqc` kodu 21).

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

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChain'in cüzdan uyumlu **hibrit uzantılı imza baytları çerçevelemesi**. Bu, bir hibrit işlemin PQC yarısını oluşturmak üzere ML-DSA-87 (Dilithium-5) ile imzalanması gereken baytların tam olarak kendisini üretir.

Cüzdanların ve entegratörlerin cosmos işlem yolunda **zorunlu hibrit imzayı** üretmek için kullandığı parça budur. Mevcut zincir sürümü itibarıyla hibrit imzalar **varsayılan olarak zorunludur** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): her cosmos yolu işlemi, klasik secp256k1 imzasının yanında bir Dilithium-5 imzası taşımak zorundadır. Uygulama (enforcement) modeli için [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) sayfasına bakın.

Klasik secp256k1 imzası, standart imza baytları üzerinde hesaplanır (bunlar PQC uzantısını **hariç tutar**) ve ML-DSA-87 imzası hesaplanıp `PQCHybridSignature` uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç tuttuğu için, bir doğrulayıcının PQC kısmını anlayıp anlamadığından bağımsız olarak klasik imza geçerli kalır.

Bu hibrit imzayı üretmenin üç yolu vardır:

* **CLI** — `qorechaind tx pqc cosign`, bir işleme Dilithium-5 eş imzasını ekler (`qorechaind tx pqc gen-key` sonrasında). Bkz. [İşlem Komutları](/cli-reference/transaction-commands).
* **QoreChain SDK** — `buildHybridTx` (`includePqcPublicKey` ile) aynısını TypeScript/Python/Go/Rust'ta yapar. Bkz. [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc).
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
