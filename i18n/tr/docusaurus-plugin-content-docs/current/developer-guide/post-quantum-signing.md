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

Her dil aynı API'yi sunar ve her biri farklı bir denetlenmiş uygulama tarafından desteklenir. Bayt uyumluluğunu garanti eden de budur — bağımsız arka uçlar standart üzerinde hemfikirdir.

| Dil | Paket | Kurulum | Arka uç |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (statik kütüphane + başlık dosyası) | [depodan](https://github.com/qorechain/qorechain-pqc) derleyin | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Kullanılabilirlik
JavaScript, Rust, Python, Go ve Java binding'lerinin tümü **0.1.1** sürümünde **yayımlanmıştır** — yukarıdaki komutlarla doğrudan npm, crates.io, PyPI, Go modül proxy'si ve Maven Central üzerinden kurabilirsiniz. Python dağıtımı `qorechain-pqc` olarak kurulur ancak **`qorpqc` olarak import edilir**. **Java** paketi Maven Central'da `io.github.qorechain:qorechain-pqc:0.1.1` olarak bulunur (Bouncy Castle arka ucu). **C** binding'i, [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) deposundan kendinizin derlediği bir statik kütüphane + başlık dosyasıdır.
:::

## Deterministik imzalama (konsensüs açısından kritik) {#deterministic-signing}

**0.1.1** sürümünden itibaren `sign()`, **altı binding'in tamamında** **deterministik** ML-DSA varyantını (FIPS-204 §3.4, imzalama rastgeleliğinin 32 sıfır bayt olduğu varyant) üretir — ve zincirin kabul ettiği tek varyant budur. QoreChain'in işlem doğrulayıcısı, **hedged (rastgeleleştirilmiş) ML-DSA imzalarını reddeder**; bu nedenle hedged bir imza, kriptografik olarak doğrulansa bile zincir üzerinde başarısız olur.

Temel gerçekler:

* **Varsayılanı değiştirmeyin.** Deterministik imzalama konsensüs açısından kritiktir; her binding bunu bu şekilde belgeler.
* Deterministik çıktı, aynı anahtar ve mesaj için **altı binding'in tamamında bayt düzeyinde birebir aynıdır** — ortak diller arası test vektörleriyle sabitlenmiştir.
* Hedged imzalama, zincir dışı kullanım senaryoları için her binding'de **açıkça tercih edilen (opt-in)** bir seçenek olarak kullanılabilir durumdadır (örn. JavaScript'te `{hedged: true}`, Rust'ta `sign_hedged`, Java'da `mldsaSignHedged`, Python'da `sign(..., hedged=True)`) — hedged imzalar **zincir tarafından kabul edilmez**.
* JavaScript binding'inin 0.1.0 sürümü varsayılan olarak hedged imzalıyordu — işlem araçlarınızı 0.1.0'a göre geliştirdiyseniz **0.1.1'e yükseltin**; eski varsayılanla imzalanan işlemler zincir üzerinde reddedilir.

## Tutarlı API

Her dil aynı yüzeyi sunar:

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

Ham primitiflerin ötesinde, kütüphane entegratörlerin QoreChain hesapları ve işlemleriyle etkileşim kurmak için ihtiyaç duyduğu iki yardımcı sunar.

### `pubkeyHash(pk, len=20)`

Bir **pay-to-pubkey-hash** kayıt yardımcısı. Bir açık anahtarın kısa (20–32 bayt) SHAKE-256 özetini üretir. Desen şudur: hesap durumunda yalnızca `pubkeyHash` değerini saklayın ve tam açık anahtarı işlemin içinde zorunlu kılın. 1–2,5 KB'lık anahtara rağmen hesap durumu son derece küçük kalır.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChain'in cüzdan uyumlu **hibrit uzantı imza baytları (sign-bytes) çerçevelemesi**. Bu, hibrit bir işlemin PQC yarısını oluşturmak üzere ML-DSA-87 (Dilithium-5) ile imzalanması gereken baytları tam olarak üretir.

Cüzdanların ve entegratörlerin cosmos işlem yolunda **zorunlu hibrit imzayı** üretmek için kullandığı parça budur. Mevcut zincir sürümü itibarıyla hibrit imzalar **varsayılan olarak zorunludur** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): cosmos yolundaki her işlem, klasik secp256k1 imzasının yanında bir Dilithium-5 imzası taşımak zorundadır. Uygulama (enforcement) modeli için [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) sayfasına bakın.

Klasik secp256k1 imzası, standart imza baytları üzerinden hesaplanır (bunlar PQC uzantısını **hariç tutar**) ve ML-DSA-87 imzası hesaplanıp `PQCHybridSignature` uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç tuttuğu için, doğrulayıcı PQC kısmını anlasın ya da anlamasın klasik imza geçerli kalır.

Bu hibrit imzayı üretmenin üç yolu vardır:

* **CLI** — `qorechaind tx pqc cosign`, bir işleme Dilithium-5 eş imzasını (cosignature) ekler (`qorechaind tx pqc gen-key` sonrasında). Bkz. [İşlem Komutları](/cli-reference/transaction-commands).
* **QoreChain SDK** — `buildHybridTx` (`includePqcPublicKey` ile) aynı işlemi TypeScript/Python/Go/Rust'ta yapar. Bkz. [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc).
* **Doğrudan `qorechain-pqc`** — desteklenen altı dilden birinde SDK dışında araç geliştiriyorsanız, imza baytlarını çerçevelemek için `hybridSignBytes` ve Dilithium-5 imzasını üretmek için `mldsa.sign` kullanın.

## Zincir üzerindeki ayak izini optimize etme

ML-DSA anahtarları ve imzaları klasik standartlara göre büyüktür. Bir standardın baytları sabit olduğundan, zincir üzerindeki ayak izini küçük tutmanın yolu — hiçbiri standardı değiştirmeyen — şu üç kaldıracı kullanmaktır:

1. **Güvenlik seviyesini bilinçli seçin.** ML-DSA-65 (L3) imzaları, ML-DSA-87 (L5) imzalarından yaklaşık %28 daha küçüktür ve yine de çok güçlüdür; ML-KEM-768 şifreli metinleri 1024'ünkilerden daha küçüktür. Kullanım senaryosuna göre seçim yapın.
2. **Pay-to-pubkey-hash.** Hesap durumunda yalnızca `pubkeyHash(pk)` değerini (20–32 bayt SHAKE-256) saklayın ve tam açık anahtarı işlemin içinde zorunlu kılın. Anahtar boyutu ne olursa olsun hesap durumu son derece küçük kalır.
3. **Doğrula-ve-at imzalar.** Bir imza işlemin içinde (blok verisinde) bulunmak zorundadır, ancak kalıcı durum ağacına asla yazılmamalıdır.

> **Neden Falcon yok?** FN-DSA (Falcon) daha küçük imzalar sağlardı, ancak bilinçli olarak **hariç tutulmuştur**: FN-DSA, FIPS-206 *taslağıdır* (nihai değildir) ve yalnızca standartlara dayalı bir kütüphane sadece nihai hale gelmiş standartları içerir. FIPS-206 nihai hale geldiğinde yeniden değerlendirilebilir.

## İlgili sayfalar

* [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) — zincirin bu primitifleri nasıl kullandığı ve hibrit imzaları nasıl zorunlu kıldığı.
* [İşlem Komutları](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` CLI akışı.
* [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc) — QoreChain SDK ile anahtarlar ve hibrit imzalama.
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — PQC destekli hesaplar oluşturun ve yönetin.
