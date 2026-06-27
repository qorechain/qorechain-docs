---
slug: /developer-guide/post-quantum-signing
title: Kuantum Sonrası İmzalama
sidebar_label: Kuantum Sonrası İmzalama
sidebar_position: 8
---

# Kuantum Sonrası İmzalama

`qorechain-pqc`, QoreChain'in arkasındaki açık kaynaklı, **yalnızca standart** kuantum sonrası kriptografi kütüphanesidir. Cüzdanlara, entegratörlere ve araçlara zincirin kullandığı tam ilkelleri verir — altı dilde, tek ve tutarlı bir API ile, ortak bir diller arası test vektörü paketine karşı **bayt uyumluluğu kanıtlanmış** şekilde.

Kütüphane, **nihai NIST standartlarının** denetlenmiş uygulamalarını sarmalar. Özel bir şema **icat etmez**: standart dışı bir varyant tam olarak birlikte çalışabilirliği bozan şeydir (bir yerde üretilen bir imza başka bir yerde doğrulanmaz). Her bağlama aynı vektörlere karşı doğrulanır; böylece bir dilde üretilen bir ML-DSA imzası diğer her dilde doğrulanır, ML-KEM paylaşılan sırları altısının tamamında eşleşir ve SHAKE-256 özetleri aynıdır.

* **Depo:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Lisans:** Apache-2.0

## İlkeller

| İlkel | Standart | Rol | Seviyeler (varsayılan **kalın**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | dijital imzalar | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | anahtar kapsülleme | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | genişletilebilir çıktılı özet | — |

Bunlar QoreChain'in protokol düzeyinde çalıştırdığı ilkellerin aynısıdır: **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve varsayılan uygulama özeti olarak **SHAKE-256**. Zincirin bunları nasıl kullandığına ilişkin bilgi için [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) bölümüne bakın.

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

> Bir NIST standardını küçültüp yine de standart kalmasını sağlayamazsınız. ML-DSA-87'nin sabit anahtar/imza boyutları ve sabit baytları vardır — onu "optimize etmek", başka hiçbir uygulamanın doğrulayamayacağı standart dışı bir varyant üretir. Zincir üzerindeki ayak izini küçültmek için şemayı değiştirmek yerine aşağıdaki kaldıraçları kullanın.

## Diller ve paketler

Her dil aynı API'yi sunar; her biri farklı bir denetlenmiş uygulama tarafından desteklenir. Bayt uyumluluğunu garanti eden de budur — bağımsız arka uçlar standart üzerinde mutabık kalır.

| Dil | Paket | Kurulum | Destekleyen |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (`qorpqc` olarak içe aktarın) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (statik kütüphane + başlık) | [depodan](https://github.com/qorechain/qorechain-pqc) derleyin | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Erişilebilirlik
JavaScript, Rust, Python, Go ve Java bağlamalarının tümü **0.1.0** sürümünde **yayımlanmıştır** — bunları yukarıdaki komutlarla doğrudan npm, crates.io, PyPI, Go modül proxy'si ve Maven Central'dan kurun. Python dağıtımı `qorechain-pqc` olarak kurulur ancak **`qorpqc` olarak içe aktarılır**. **Java** paketi Maven Central'da `io.github.qorechain:qorechain-pqc:0.1.0` olarak bulunur (Bouncy Castle arka ucu). **C** bağlaması, [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) adresinden derlediğiniz bir statik kütüphane + başlıktır.
:::

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

Varsayılanın istediğiniz şey olmadığı durumlarda seviyeye özgü dışa aktarmalar mevcuttur: `mldsa44/65/87` ve `mlkem512/768/1024` (`mldsa` / `mlkem` L5 varsayılanlarıdır).

**Rust, Go, C, Python ve Java** bağlamaları bunu tam olarak yansıtır. Örneğin:

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

## Blok zinciri yardımcıları

Ham ilkellerin ötesinde, kütüphane entegratörlerin QoreChain hesapları ve işlemleriyle etkileşime geçmek için ihtiyaç duyduğu iki yardımcı sunar.

### `pubkeyHash(pk, len=20)`

Bir **pay-to-pubkey-hash** kayıt yardımcısı. Bir açık anahtarın kısa (20–32 bayt) SHAKE-256 özetini üretir. Desen şudur: hesap durumunda yalnızca `pubkeyHash` saklanır ve işlemde tam açık anahtar istenir. Hesap durumu, 1–2,5 KB'lik anahtardan bağımsız olarak küçük kalır.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChain'in cüzdan uyumlu **hibrit uzantı imza-baytı çerçeveleme** işlevi. Bu, bir hibrit işlemin PQC yarısını oluşturmak için ML-DSA-87 (Dilithium-5) ile imzalanması gereken tam baytları üretir.

Bu, cüzdanların ve entegratörlerin cosmos işlem yolunda **gerekli hibrit imzayı** üretmek için kullandığı parçadır. Mevcut zincir sürümünden itibaren, hibrit imzalar **varsayılan olarak gereklidir** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): her cosmos-yolu işlemi, klasik secp256k1 imzasının yanında bir Dilithium-5 imzası taşımalıdır. Uygulama modeli için [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) bölümüne bakın.

Klasik secp256k1 imzası, standart imza baytları üzerinden hesaplanır (bunlar PQC uzantısını **hariç tutar**) ve ML-DSA-87 imzası hesaplanıp `PQCHybridSignature` uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç tuttuğu için, bir doğrulayıcı PQC kısmını anlasa da anlamasa da klasik imza geçerli kalır.

Bu hibrit imzayı üretmenin üç yolu vardır:

* **CLI** — `qorechaind tx pqc cosign`, bir işleme Dilithium-5 ortak imzasını ekler (`qorechaind tx pqc gen-key` sonrasında). [İşlem Komutları](/cli-reference/transaction-commands) bölümüne bakın.
* **QoreChain SDK** — `buildHybridTx` (`includePqcPublicKey` ile) TypeScript/Python/Go/Rust'ta eşdeğerini yapar. [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc) bölümüne bakın.
* **Doğrudan `qorechain-pqc`** — SDK dışında, desteklenen altı dilden birinde araç geliştirirken imza baytlarını çerçevelemek için `hybridSignBytes` ve Dilithium-5 imzasını üretmek için `mldsa.sign` kullanın.

## Zincir üzerindeki ayak izini optimize etme

ML-DSA anahtarları ve imzaları klasik standartlara göre büyüktür. Bir standardın baytları sabit olduğundan, zincir üzerindeki ayak izini küçük tutmanın yolu, hiçbiri standardı değiştirmeyen şu üç kaldıracı kullanmaktır:

1. **Güvenlik seviyesini bilinçli seçin.** ML-DSA-65 (L3) imzaları, ML-DSA-87 (L5) imzalarından ~%28 daha küçüktür ve çok güçlü kalır; ML-KEM-768 şifreli metinleri 1024'ten daha küçüktür. Kullanım durumuna göre seçin.
2. **Pay-to-pubkey-hash.** Hesap durumunda yalnızca `pubkeyHash(pk)` (20–32 bayt SHAKE-256) saklayın ve işlemde tam açık anahtarı isteyin. Hesap durumu, anahtar boyutundan bağımsız olarak küçük kalır.
3. **İmzaları doğrula-ve-at.** Bir imza işlemde (blok verisinde) yaşamak zorundadır ancak asla kalıcı durum ağacına yazılmamalıdır.

> **Neden Falcon yok?** FN-DSA (Falcon) daha küçük imzalar verebilir, ancak kasıtlı olarak **hariç tutulmuştur**: FN-DSA, FIPS-206 *taslaktır* (nihai değil) ve yalnızca standart olan bir kütüphane yalnızca sonuçlandırılmış standartları yayımlar. FIPS-206 sonuçlandırıldığında yeniden değerlendirilebilir.

## İlgili

* [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) — zincirin bu ilkelleri nasıl kullandığı ve hibrit imzaları nasıl zorunlu kıldığı.
* [İşlem Komutları](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` CLI akışı.
* [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc) — QoreChain SDK'sından anahtarlar ve hibrit imzalama.
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — PQC destekli hesaplar oluşturun ve yönetin.
