---
slug: /developer-tools/pqc-library
title: Kuantum Sonrası Kütüphane (qorechain-pqc)
sidebar_label: PQC Kütüphanesi
sidebar_position: 20
---

# Kuantum Sonrası Kütüphane (`qorechain-pqc`)

`qorechain-pqc`, QoreChain araçlarının üzerine kurulduğu, yalnızca standartlara dayalı kuantum sonrası kriptografi kütüphanesidir. Zincirin kullandığı anahtarları ve imzaları, tam [QoreChain SDK](/sdk/overview)'ya bağımlı olmadan oluşturmak veya denetlemek isteyen cüzdan, arka uç, borsa ve araç geliştiricilerine yöneliktir. Üç NIST standardının bağımsız uygulamalarını (imzalar için ML-DSA, FIPS 204; anahtar kapsülleme için ML-KEM, FIPS 203; özet işlevi olarak SHAKE-256, FIPS 202) TypeScript/JavaScript, Python, Rust, Go, Java ve C'de tek bir API arkasında sarmalar ve bir hibrit QoreChain işleminin imzaladığı baytları oluşturan yardımcıları ekler. Sürüm **0.2.3**, Apache-2.0, 27 Ekim 2026'da kayıt defterlerine karşı kontrol edildi.

Bu bir primitifler kütüphanesidir. Ağla konuşmaz, anahtar tutmaz, anahtarları zincirde kaydetmez ve işlem göndermez. Hibrit imzalar ve anahtar kaydı etrafındaki zincir kuralları için [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) ve [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) sayfalarını okuyun; hazır bir imzalama istemcisi için ikisi de bu primitifler üzerine kurulu olan [SDK](/sdk/overview) veya [QoreSign](/qoresign/overview) kullanın.

## Yenilikler {#innovations}

* **Tek bir test vektörü kümesi, altı bağımsız arka uç.** JavaScript bağlaması `@noble/post-quantum`, Rust `fips204`, `fips203` ve `sha3` crate'lerini, Go Cloudflare CIRCL'i, Java Bouncy Castle'ı, Python ve C ise liboqs'u kullanır. Her bağlamanın test paketi, deponun `vectors/` klasöründeki aynı dosyaları (üç seviyede ML-DSA, üç seviyede ML-KEM, SHAKE-256) bayt bayt yeniden üretmelidir; böylece bir dilde üretilen imza diğerlerinde doğrulanır.
* **Varsayılan olarak deterministik imzalama.** `sign`, FIPS 204'ün deterministik varyantını kullanır (32 sıfır baytlık imzalama rastgeleliği); böylece aynı anahtar ve mesaj her bağlamada bayt bayt aynı imzayı verir. Bu, imzaları ve onları içeren işlem özetlerini yeniden üretilebilir ve vektörlere karşı denetlenebilir kılar.
* **Birlikte çalışan, açıkça tercih edilen hedged imzalama.** Rastgeleleştirilmiş (hedged) imzalama JavaScript'te `{hedged: true}`, Python'da `hedged=True`, Rust'ta `sign_hedged`, Go'da `SignHedged` (0.2.3'te eklendi), Java'da `mldsaSignHedged` ve C'de `qpqc_mldsa_sign_hedged` olarak sunulur. Altı dilden herhangi birinde üretilen bir hedged imza altısında da doğrulanır (0.2.3 için 36 kombinasyonun 36'sı denetlendi). Zincir geçerli her FIPS 204 ML-DSA-87 imzasını doğrular; bu yüzden iki türü de kabul eder ve ikisi gizli anahtar olmadan birbirinden ayırt edilemez.
* **Zincirin hibrit sign-bytes'ı, zincirin oluşturduğu şekilde oluşturulur.** Her bağlamada `hybridSignBytesV1`, `hybridSignBytesV2` ve sürümü zorunlu kılan bir dağıtıcı `hybridSignBytes(version, chainId, body, authInfo)` vardır. v2 biçimi `"qorechain-pqc-hybrid-v2"`, ardından 64 bitlik big-endian uzunlukla zincir kimliği, ardından her biri 32 bitlik big-endian uzunlukla işlem gövdesi (PQC uzantısı olmadan) ve auth info şeklindedir. Tüm bağlamalar zincirin bilinen yanıt dosyasına (`vectors/signbytes-kat-v3.1.98.json`) karşı test edilir. Denetlenen giriş noktalarında boş bir zincir kimliği reddedilir, çünkü hiçbir zincire bağlı olmayan baytlar hiçbir ağda doğrulanmaz.
* **Ağın sign-bytes sürümü saf bir işlevle belirlenir.** Bir ağ aynı anda tam olarak bir biçimi doğrular ve v2'ye geçiş iki plan adı altında uygulandı (ana ağda 2.981.742 yüksekliğinde `v3.2.0`, test ağında `v3.1.98`). `SIGN_BYTES_V2_UPGRADES` her iki adı listeler ve `signBytesVersionForApplied(chainId, appliedHeights)`, düğümden okuduğunuz uygulanmış yüksekliklerden `v1` veya `v2` döndürür. Yalnızca bir adı sormak, diğeri altında geçiş yapmış bir ağı yanlış okurdu.
* **Sıkı girdi denetimi.** `verify` asla hata fırlatmaz: yanlış uzunlukta bir anahtar veya imza ya da başka herhangi bir bozuk girdi `false` döndürür. `keygen(seed)`, `sign`, `encapsulate` ve `decapsulate`, hatalı argümanı ve beklenen uzunluğunu belirten bir hata fırlatır.
* **Saf JavaScript, yerel kod yok.** npm paketi Node'da ve tarayıcılarda WebAssembly veya eklenti olmadan çalışır. Deponun kendi ölçümünde bir Apple-silicon dizüstü bilgisayarda (0.2.3, 1,5 KB mesaj, tek çekirdek) ML-DSA-87, JavaScript'te yaklaşık 8 ms'de, diğer beş bağlamada yaklaşık 0,3 ila 0,45 ms'de imzalar.

## Nasıl kullanılır {#how-to-use}

Beş kayıt defteri paketinin tümü aynı işlemleri sunar: `keygen`, `keygenFromSeed` (32 baytlık tohum), `sign`, `verify`; ML-KEM `keygen`, `encapsulate`, `decapsulate`; `shake256`; `pubkeyHash`; ve sign-bytes yardımcıları. ML-DSA-87 ve ML-KEM-1024 varsayılanlardır ve seviyeye özgü varyantlar (44, 65, 87 ve 512, 768, 1024) onların yanında dışa aktarılır. ML-DSA-87'nin açık anahtarı 2.592 bayt, imzası 4.627 bayttır; aşağıdaki örnekler bunları yazdırır.

### Kurulum ve içe aktarma {#install}

| Dil | Kurulum | İçe aktarma |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 veya üstü) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | depodan `c/` derleyin (statik kütüphane ve başlık) | `qorechain_pqc.h` |

### Her dilde imzalama ve doğrulama {#examples}

Bunlar geliştirici merkezindeki hızlı başlangıçlardır. Her biri, 27 Ekim 2026'da genel kayıt defterinden kurulumdan sonra değiştirilmeden çalıştırıldı (Node 26, liboqs mevcut Python 3.12, Rust 1.95, Go 1.26, Gradle 9.6 ile JDK 21) ve açık anahtar boyutunu, imza boyutunu ve doğrulama sonucunu yazdırdı: `2592 4627 true` (Python `True` yazdırır). Hiçbiri ağı veya fonlanmış bir anahtarı kullanmaz ve C bağlamasının hızlı başlangıcı yoktur.

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java (`PqcQuickstart.java` olarak kaydedin):

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

Sabit tohum (her biri 7 değerinde 32 bayt) yalnızca bir örnektir. Gerçek bir anahtar için rastgele bir tohum veya [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#key-derivation) sayfasında açıklanan anahtar türetmeyi kullanın.

### Hedged imzalama {#hedged}

`sign` deterministik imzalama yapar. Rastgeleleştirilmiş imzalamayı tercih etmek için açık varyantı çağırın, örneğin JavaScript'te `mldsa.sign(secretKey, message, { hedged: true })` veya Python'da `mldsa.sign(secret_key, message, hedged=True)`. Yalnızca her seferinde farklı bir imza istiyorsanız kullanın; zincir ikisini de kabul eder ve `pqc` kod 21'e (`hybrid_verify_failed`) birini diğerine tercih etmek asla neden olmaz ([sorun giderme listesine](/developer-guide/post-quantum-signing#code-21) bakın).

### Sign-bytes biçimini seçme {#sign-bytes}

Düğüme hangi yükseltme adlarının uygulandığını sorun, ardından kararı kütüphaneye bırakın. Bu, paket README'sindeki JavaScript biçimidir; diğer bağlamalar aynı adları kendi stillerinde dışa aktarır.

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest`, ana ağ (`qorechain-vladi`) için `https://api.qore.host`, test ağı (`qorechain-diana`) için `https://api-testnet.qore.host` adresidir. Her iki ağ da bugün v2'yi doğrular. Çoğu uygulamanın bunu elle yapması gerekmez: SDK ve QoreSign biçimi ağ başına çözümler.

## Nasıl erişilir {#how-to-access}

* **Kütüphaneyi kullanmak için ağ, hesap veya anahtar gerekmez.** Çevrimdışı çalışır. Oluşturduğu bir anahtar çifti yalnızca bir anahtardır; QoreChain'de kullanmak için hesabın açık anahtarı bir kez kaydetmesi gerekir ([Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#pqc-key-registration) sayfasına bakın) ve bir Cosmos ray işlemi bundan sonra secp256k1 imzasını artı ML-DSA-87 imzasını (hibrit) gerektirir.
* **Ağlar.** Sign-bytes yardımcıları ve vektörler, ana ağ `qorechain-vladi` (v3.2.4) ve test ağı `qorechain-diana` (v3.2.6) ile eşleşir. Uç noktalar için [Ağlar](/appendix/networks) sayfasına bakın.
* **Python, liboqs paylaşımlı kütüphanesini gerektirir.** `pip install qorechain-pqc`, eksik olduğunda liboqs'u ilk içe aktarmada derleyen `liboqs-python`'a bağlıdır; bunun için makinede `git`, CMake ve bir C derleyicisi gerekir. Kilitli ortamlarda liboqs'u sistem paket yöneticinizden kurun veya önceden derleyin. Python bağlaması anahtarları sistemin rastgele sayı üretecinden okur ve 0.2.3'te tohumlu anahtar üretimi yoktur.
* **Go, Go 1.25 veya üstünü gerektirir** (CIRCL 1.6.5 veya üstüyle birlikte, 0.2.1'den beri geçerli bir gereksinim).
* **Java**, JDK 21 ile çalıştırılmıştır. Java bağlamasındaki ML-DSA gizli anahtarı, diğer bağlamaların kullandığı 4.896 baytlık genişletilmiş anahtar değil, 32 baytlık FIPS 204 tohumudur; başka herhangi bir girdi reddedilir.
* **Java'da Bouncy Castle sabitlemesi.** Java bağlaması 0.2.3'ten beri Bouncy Castle 1.85 üzerine kuruludur (önceki sürümler, bağlamanın çağırdığı ML-DSA veya ML-KEM kodunda hiçbiri olmayan, yayımlanmış güvenlik uyarıları bulunan eski sürümleri kullanıyordu). Proje değişiklik günlüğüne göre 1.85, `org.bouncycastle.pqc.crypto` sınıflarını hâlâ içeren en son Bouncy Castle sürümüdür; bu yüzden derlemenizi 1.85'te tutun ve başka bir bağımlılığın daha yeni bir sürümü çekmesine izin vermeden önce test edin, çünkü sonraki sürümler bu sınıfları artık içermez.
* **Maliyet.** Ücretsiz ve Apache-2.0 altında açık kaynaklı. İmzalama ve doğrulama hiçbir şeye mal olmaz; ortaya çıkan imzaların zincir üzerinde kullanımı olağan ücreti öder (taban gas başına 0,1 uqor).

## Nerede yayımlanır {#where-published}

| Kayıt defteri | Paket | Sürüm | Bağlantı |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (içe aktarma `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go modül proxy'si | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (etiket `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | yalnızca kaynak, kayıt defteri paketi yok | etiket `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Kaynak: https://github.com/qorechain/qorechain-pqc (klasörler `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). Tüm paketler Apache-2.0'dır. Sürümler 27 Ekim 2026'da her kayıt defterinden okunmuştur. Aynı kütüphanenin, anahtar türetme ve rotasyonu da içeren kavramsal kılavuzu [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) sayfasıdır; onu kullanan SDK [SDK Genel Bakış](/sdk/overview) sayfasında anlatılır.

## Sınırlar ve bilinen sorunlar {#limits}

* **Bir cüzdan veya istemci değil, bir primitifler kütüphanesidir.** Anahtar kaydetmez, işlem oluşturmaz, yayınlamaz veya zinciri okumaz. Bunun için [SDK](/sdk/overview) veya [QoreSign](/qoresign/overview) kullanın.
* **Python ve C bir tohumdan anahtar üretemez.** İkisi de anahtarları sistemin rastgele sayı üretecinden çeken liboqs tarafından desteklenir. Vektör testleri bunun yerine genişletilmiş gizli anahtarı kullanır.
* **Java gizli anahtarı bir tohumdur.** ML-DSA gizli anahtarlarını Java ile diğer bağlamalar arasında taşıyan kodun dönüştürme yapması gerekir: Java değeri 32 baytlık tohumdur, diğerleri ML-DSA-87 için 4.896 baytlık genişletilmiş anahtardır.
* **Python bağlaması, liboqs zaten kurulu değilse ilk seferde bir C araç zincirine ihtiyaç duyar.** Python hızlı başlangıcı liboqs zaten mevcutken çalıştırıldı.
* **C bağlamasının kayıt defteri paketi ve test edilmiş bir hızlı başlangıcı yoktur.** Depodan derleyin; liboqs ve OpenSSL gerektirir.
* **Anahtar boyutlarını standart belirler.** Bir ML-DSA-87 imzası 4.627 bayt, açık anahtarı 2.592 bayttır; standartla uyumlu daha küçük bir biçim yoktur.
* **Eski sürümler.** 0.2.1 veya üstünü kullanın: 0.2.0 sürüm farkındalıklı `hybridSignBytes`'ı getirdi (eski iki argümanlı biçim artık `hybridSignBytesV1`'dir) ve 0.2.1 her iki yükseltme plan adını ekledi. 0.2.2 ve 0.2.3 belgeleri ve bağımlılık sürümlerini değiştirdi, çıktı aynıdır.
* **Hibrit kullanım yine de diğer yarıyı gerektirir.** Bir hibrit imza ayrıca bir secp256k1 imzası taşır; bu kütüphane yalnızca ML-DSA yarısını üretir. Hesaplar, kayıt ve EVM yetkilendirme penceresi, [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) ve [EVM kılavuzunda](/developer-guide/evm-development#evm-window) belgelenen zincir kurallarıdır.
