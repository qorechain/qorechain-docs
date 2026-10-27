---
slug: /developer-tools/pq-light-client
title: PQ Hafif İstemci
sidebar_label: PQ Hafif İstemci
sidebar_position: 31
---

# PQ hafif istemci (`qorechain-pq-light-client`)

`qorechain-pq-light-client`, ML-DSA-87 (FIPS 204) ile imzalanmış kontrol noktaları (checkpoint) için bir taslak şartname ve bir referans doğrulayıcıdır. Önerilen tasarımda doğrulayıcılar (validator) her epoch sonunda ayrı bir ML-DSA-87 kontrol noktası anahtarıyla kısa bir kontrol noktası imzalar ve bir hafif istemci, yalnızca bu imzaları doğrulayarak kontrol noktaları zincirini izler. Protokol araştırmacıları, röle (relayer) ve köprü geliştiricileri ile tasarımı incelemek ve ona karşı test yapmak isteyen diğer zincirlerdeki ekipler için hazırlanmıştır. Sürüm **0.1.0**, Apache-2.0, QoreChain Association tarafından sürdürülür.

**Zincir bu kontrol noktalarını desteklemez ve hiçbir şey planlanmış değildir.** QoreChain, bu paketin doğruladığı kontrol noktalarını ne ana ağda (`qorechain-vladi`) ne de test ağında (`qorechain-diana`) üretir. Hiçbir zincir sürümü bunları desteklemez ve planlanmış bir yükseltme veya tarih yoktur. Doğrulayıcı konsensüs anahtarları bugün ed25519'dur, kuantum sonrası değildir. Paket canlı bir ağı izleyemez: simüle edilmiş doğrulayıcı kümelerine ve paylaşılan test vektörlerine karşı çalışır. Hiçbir QoreChain rotasını, köprüsünü veya IBC kanalını kuantum sonrası yapmaz.

## Yenilikler {#innovations}

- **Blok başına imza yerine kontrol noktaları.** Doğrulayıcılar epoch başına bir kontrol noktası imzalar (zincir kimliği, epoch, yükseklik, zaman, başlık özeti, uygulama özeti, imzalayan kümenin özeti ve sonraki kümenin özeti). İmzalar sıradan işlemlerde taşınır; böylece blok üretimi onları asla beklemez ve veri hacmi her bloğu imzalamanın çok altında kalır. Şartname (bölüm 12) gerekçeyi verir.
- **Sahiplik kanıtı olan ayrı bir kontrol noktası anahtarı.** Her doğrulayıcı, konsensüs anahtarından ve herhangi bir hesap anahtarından ayrı bir ML-DSA-87 kontrol noktası anahtarı kaydeder; sahiplik kanıtı `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key` üzerindendir.
- **Küme devrini çıkan kümenin yapması.** Bir kontrol noktası, son güvenilen kontrol noktasının adlandırdığı kümenin gücünün kesinlikle üçte ikisinden fazlasına sahip doğrulayıcılar onu imzaladığında kabul edilir; böylece doğrulayıcı kümesi değişiklikleri her zaman çıkan küme tarafından imzalanır. Tam üçte iki bir çoğunluk (quorum) değildir ve üye olmayan birinin imzası atlanmak yerine kontrol noktasını geçersiz kılar.
- **Nesne başına tek kodlama.** Kontrol noktası, doğrulayıcı kümesi ve imzalı kontrol noktasının kanonik kodlamaları vardır ve kod çözücüler her biri için tam olarak tek bir kodlamayı kabul eder. Bir röle kanonik baytları değiştirmeden iletir.
- **Sabit denetim sırası.** `verifyCheckpoint` denetimleri belirlenmiş bir sırayla çalıştırır; böylece TypeScript, Rust ve Go aynı girdi için aynı hata kodunu döndürür.
- **Kötü davranış kanıtı.** Bir epoch için, her biri bir çoğunluğa sahip iki farklı kontrol noktası kötü davranıştır. `detectMisbehaviour` her iki kontrol noktasını kanonik bir sırada, çifte imza atanları ve güçlerini döndürür.
- **Üç dil, tek vektör kümesi.** Paylaşılan vektörler (`vectors/pq-light-client-v1.json`) deterministik bir simülatörden gelir ve 4 doğrulayıcılı ve 21 doğrulayıcılı kontrol noktası zincirlerini, küme rotasyonlarını, doğrulayıcının üretebileceği her reddi, çakışan kontrol noktalarını ve kod çözücü durumlarını kapsar. Go, Rust ve TypeScript'in hepsi bunları geçer; böylece dördüncü bir uygulama bayt bayt eşleştiğini kanıtlayabilir.

## Kullanım senaryoları {#use-cases}

1. **Röle geliştiricileri kuantum sonrası bir güncelleme yolunu prototipler.** Bir Rust rölesi her ağ için tek bir güvenilir durum tutar, her imzalı kontrol noktasını çözer ve doğrular, aynı baytları hedefe iletir ve `CONFLICTING_CHECKPOINT` durumunda durur. Bugün vektörler veya özel bir simüle zincir üzerinde çalışır; deponun röle kılavuzu döngüyü gösterir.
2. **IBC ve köprü ekipleri tasarımı değerlendirir.** Şartname bölüm 14, kontrol noktalarını bir IBC hafif istemci türüne eşler (istemci durumu, konsensüs durumu, kötü davranış, kontrol noktası yüksekliklerinde üyelik kanıtları). Ekipler, zincirde herhangi bir şey var olmadan önce eşlemeyi ve ödünleşimlerini inceleyebilir. Bu bir tasarım notudur; bunun için kod yoktur.
3. **EVM zincirleri veya Solana üzerindeki ekipler doğrulayıcı tasarımlarını karşılaştırır.** Bölüm 15, zincir üstü ML-DSA-87 doğrulamasını, bir doğrulama STARK kanıtını ve bir tasdik (attestor) kümesini karşılaştırır; hangi seçimlerin kuantum sonrası özelliği koruduğunu ve hangilerinin ondan vazgeçtiğini de içerir. Bunlar da yalnızca tasarım notlarıdır. Bilgi için, QoreChain'in kendi EVM'inde bir ML-DSA doğrulama precompile'ı (`pqcVerify`, 0x0A01) vardır ve yalnızca test ağında etkindir; bkz. [EVM precompile'ları](/developer-guide/evm-precompiles).
4. **Güvenlik denetçileri ve araştırmacılar kuralları kontrol eder.** Denetim sırası, çoğunluk kuralı, küme devri, güven süresi ve kötü davranış kanıtı belirlenmiştir ve üç dilde test edilebilir.
5. **Rotalardan söz eden ekipler iddialarını doğru ifade eder.** Depodaki konum sayfası, bir rotaya ne zaman kuantum sonrası denebileceğini tanımlar (bkz. [Sınırlar](#limits)).
6. **Diğer dillerdeki uygulayıcılar.** Vektörler, yeni bir uygulamanın referansla eşleştiğini kanıtlamasını sağlar.

## Nasıl çalışır {#how-it-works}

Bu bölümdeki her şey önerilen tasarımdır ve hepsi, planlanmamış zincir desteği gerektirir.

1. Her doğrulayıcı, bir sahiplik kanıtıyla birlikte bir ML-DSA-87 kontrol noktası anahtarı kaydeder (yukarıda).
2. Her epoch sonunda doğrulayıcılar bir kontrol noktası imzalar: zincir kimliği, epoch (kesinlikle artan), yükseklik, zaman, başlık özeti, uygulama özeti, bu kontrol noktasını imzalayan kümenin özeti ve sonrakini imzalayacak kümenin özeti.
3. Bir hafif istemci, son güvenilen kontrol noktasının adlandırdığı kümenin gücünün üçte ikisinden fazlası tarafından imzalanmış bir kontrol noktasını kabul eder.
4. Bir epoch için, her biri bir çoğunluğa sahip iki farklı kontrol noktası kötü davranıştır; kanıt çifte imza atanları adlandırır.

Blok başına konsensüs değişmez. Bir epoch içindeki yükseklikler bir sonraki kontrol noktasına kadar klasik kalır; kuantum sonrası güvenceye ihtiyaç duyan bir istemci kontrol noktası yüksekliklerini kullanır ve bir epoch'a kadar gecikmeyi kabul eder.

**Biçimler** (tüm tamsayılar big-endian, sürüm baytı `0x01`):

| Nesne | Düzen | Boyut |
|---|---|---|
| Kontrol noktası | sürüm, zincir kimliği uzunluğu ve baytları, epoch, yükseklik, zaman, başlık özeti, uygulama özeti, doğrulayıcı kümesi özeti, sonraki doğrulayıcı kümesi özeti | `154 + len(chain_id)` bayt (`qorechain-vladi` için 169) |
| Doğrulayıcı kümesi | sürüm, sayı (1 ila 256), ardından doğrulayıcı başına: 20 baytlık adres, 8 baytlık güç, 2.592 baytlık ML-DSA-87 anahtarı, adrese göre sıralı | `3 + 2,620 x validators` bayt |
| İmzalı kontrol noktası | sürüm, kontrol noktası, imza sayısı, imzalayan başına 20 baytlık adres ve 4.627 baytlık imza (adrese göre sıralı), sonraki küme bayrağı, küme değişiyorsa sonraki küme | `qorechain-vladi` için `173 + 4,647 x signers` bayt, varsa sonraki küme eklenir |

**İmza ve özet.** ML-DSA-87, FIPS 204 saf mod, boş bağlam, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` üzerinde. Deterministik ve hedged imzalamanın ikisi de geçerlidir. Özet, 32 baytlık çıktıyla SHAKE-256'dır; doğrulayıcı kümesi özeti `qorechain-pqlc-valset-v1|` önekini kullanır.

**Doğrulama sırası** (`verifyCheckpoint`): yapı, zincir kimliği, güven süresi dolumu, saat kayması, aynı epoch'un işlenmesi (aynıysa `NOT_NEWER`; farklı ve bir çoğunlukla ise `CONFLICTING_CHECKPOINT`), epoch, yükseklik ve zaman ilerlemesi, imzalayan kümenin güvenilen sonraki kümeye eşit olması, taşınan sonraki kümenin özetiyle eşleşmesi, çoğunluk. Bir hata, güvenilen durumu değiştirmeden bırakır. İmzalayan küme değişmediği sürece sonraki bir epoch doğrudan kabul edilebilir; bir rotasyondan sonra, rotasyondan itibaren her kontrol noktasının doğrulanması gerekir.

**Güven.** Bir istemci, her proof-of-stake hafif istemcisinde olduğu gibi protokolün dışında seçilen bir güven kökünden başlar. Güven süresi, bir doğrulayıcının hâlâ cezalandırılabileceği süreden kısa olmalıdır; bundan sonra istemcinin yeniden başlatılması gerekir.

Şartname depoda `spec/pq-light-client-v1.md` dosyasıdır (durum: taslak, incelemeye açık). Bölüm 10 (kontrol noktası anahtarları, imzalama, epoch'lar, zincir üstü cezalar) inceleme için bir tasarımdır, bir taahhüt değildir.

## Nasıl kullanılır {#how-to-use}

### Kurulum {#install}

| Dil | Kurulum | Asgari platform |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 veya üstü ve tarayıcılar. `@qorechain/pqc` 0.2.3'e bağlıdır |
| Rust | `cargo add qorechain-pq-light-client` (kütüphane `qorechain_pq_light_client`) | Rust stable; `qorechain-pqc` 0.2.3'e bağlıdır; `unsafe` yok, G/Ç yok |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (paket `pqlightclient`) | Go 1.25; `github.com/qorechain/qorechain-pqc/go` v0.2.3'e bağlıdır |

PyPI paketi yoktur ve planlanmamıştır.

### Hızlı başlangıç (çevrimdışı, TypeScript) {#quickstart}

Hiçbir şey bir QoreChain ağına dokunmaz. Betik, paylaşılan vektörlerdeki simüle edilmiş 21 doğrulayıcılı kontrol noktası zincirini izler (zincir kimliği `qorechain-sim-21`, epoch 2'de bir küme rotasyonu dahil), ardından canlı kaynağın mevcut olmadığını gösterir. Vektör anahtarları herkese açık test anahtarlarıdır.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

27 Ekim 2026'da yayımlanmış npm 0.1.0 paketine ve v0.1.0 etiketindeki vektörlere karşı çalıştırıldığında `node follow.mjs` şunu yazdırdı:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

Vektör dosyası yaklaşık 2,4 MB'dır. Rust orijinali depoda `rust/examples/relayer.rs` dosyasıdır (`cargo run --example relayer`); bu sayfa için çalıştırılmadı.

TypeScript'te hata işleme (paket README'sinden):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Go'da aynısı:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### Ana API {#api}

API üç dilde de aynıdır (TypeScript camelCase, Go PascalCase, Rust snake_case). 64 bitlik alanlar TypeScript'te `bigint`'tir.

| Ad | Ne yapar |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | veri türleri |
| `encodeCheckpoint`, `decodeCheckpoint` | kanonik kontrol noktası kodlaması; sıkı kod çözücü |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | doğrulayıcı kümesi kodlaması ve SHAKE-256 özeti |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | bir rölenin taşıdığı baytlar |
| `encodeCheckpointSignBytes` | imzalanacak baytlar (sign-bytes), `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | güven kökünden güvenilen duruma (her iki kümenin de kontrol noktasındaki değerlere özetlendiğini denetler; imzaları doğrulamaz) |
| `verifyCheckpoint(trusted, signed, now)` | tam doğrulama; yeni güvenilen durumu veya tiplenmiş bir hata döndürür |
| `detectMisbehaviour(set, a, b)` | çakışan kontrol noktaları için kanıt veya hiçbir şey |
| `signCheckpoint` | bir kontrol noktasını ML-DSA-87 gizli anahtarıyla imzalar (simülatörler ve testler) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) veya `ChainCheckpointSource` (Rust, Go) | gelecekteki bir node API'si için arayüzler; bugün her zaman `REQUIRES_CHAIN_SUPPORT` ile başarısız olur ve istek yapmaz |
| `PqLightClientError` (TypeScript), `ErrInsufficientPower` gibi değerlerle `*Error` (Go, `errors.Is` kullanın), `code()` ile `Error` (Rust) | kararlı kodlara sahip tiplenmiş hatalar |

Üç dilde ortak hata kodları ve bir rölenin ne yapması gerektiği (röle kılavuzundan):

| Hata | Eylem |
|---|---|
| `MALFORMED` | baytları atın; kaynak hatalı |
| `CHAIN_ID_MISMATCH` | yapılandırma hatası |
| `TRUST_EXPIRED` | durun; yeni bir güven kökünden yeniden başlatın |
| `FUTURE_CHECKPOINT` | yerel saati denetleyin; sonra yeniden deneyin |
| `NOT_NEWER` | yeni bir şey yok; bekleyin |
| `SET_MISMATCH` | küme rotasyonu olan bir kontrol noktası eksik; aradaki epoch'ları getirin |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | kontrol noktasını atın |
| `INSUFFICIENT_POWER` | daha fazla imza için bekleyin |
| `CONFLICTING_CHECKPOINT` | iletmeyi durdurun ve kanıtı bildirin |
| `REQUIRES_CHAIN_SUPPORT` | bugün beklenen durum |

## Nasıl erişilir {#how-to-access}

- **Ana ağ `qorechain-vladi` ve test ağı `qorechain-diana`:** kontrol noktası üretilmez; bu yüzden doğrulayıcılar hiçbir ağı izleyemez. Hiçbir zincir sürümü bunları desteklemez ve planlanmış bir şey yoktur.
- Ağların bugün yaptığı: doğrulayıcı konsensüs anahtarları ed25519'dur, vote extension'lar kapalıdır ve IBC standart 07 hafif istemci türünü kullanır.
- **Paketi çalıştırmak** için dil çalışma zamanının ötesinde hiçbir şeye ihtiyacınız yok. Hesap, anahtar, uç nokta ve maliyet yok. Vektörler herkese açık test anahtarlarını ve `qorechain-sim` ile `qorechain-sim-21` zincir kimliklerini kullanır.
- Yalnızca bilgi için (bu paket bunları kullanmaz): REST `https://api.qore.host` ve `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` ve `https://rpc-testnet.qore.host`.

## Nerede yayımlandı {#where-published}

27 Ekim 2026'da her kayıt defterine karşı denetlendi.

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go modül proxy'si | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (etiket `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Kaynak: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (sürüm v0.1.0, kaynak kodu, ikili dosya yok). Lisans Apache-2.0.

## Sınırlar ve bilinen sorunlar {#limits}

- **QoreChain'i, herhangi bir IBC kanalını, köprüyü veya röleyi kuantum sonrası yapmaz.** Doğrulayıcı konsensüs anahtarları bugün kuantum sonrası değildir ve bunu değiştirecek bir yükseltme planlanmamıştır.
- **Canlı bir ağı izleyemez.** `fetchCheckpoint` her zaman `REQUIRES_CHAIN_SUPPORT` ile başarısız olur. Simüle edilmiş doğrulayıcı kümeleri ve paylaşılan vektörler üzerinde çalışır.
- **Şartname, incelemeye açık bir taslaktır.** İçindeki hiçbir şey bir taahhüt değildir.
- **Kodu olmayan tasarım notları:** IBC istemci türü (bölüm 14) ve EVM ile Solana doğrulayıcıları (bölüm 15).
- **Bir epoch içindeki yükseklikler klasik kalır.** Kontrol noktalarıyla bile kuantum sonrası doğrulama kontrol noktası yüksekliklerinde geçerli olur.
- **Hangi rotaya kuantum sonrası denebilir.** Bir rotaya, her iki uç da diğer ucun kuantum sonrası imzalanmış durumunu her iki yönde ve hiçbir klasik adım olmadan doğruluyorsa kuantum sonrası denebilir: hiçbir uçta klasik hafif istemci, eşleme (pairing) tabanlı SNARK sarmalayıcısı veya klasik tasdik komitesi yok. Tek başına kuantum sonrası hesap imzaları bir rotayı kuantum sonrası yapmaz. QoreChain hesapları ML-DSA-87 ve secp256k1 ile imzalar; bunu kuantum sonrası bir rota olarak değil, "kuantum sonrası hesap imzaları" olarak tanımlayın.
- **Güven kökleri özneldir.** Protokol, yanlış bir kökten başlayan bir istemciyi koruyamaz.
- **1.0 öncesi.** Minör sürümler API'yi değiştirebilir.

Deponun konum sayfasının önerdiği ifade:

| Durum | İfade |
|---|---|
| Hesaplar ML-DSA-87 ile imzalar | "kuantum sonrası hesap imzaları" |
| Bir uç kuantum sonrası kontrol noktalarını doğrular, diğeri doğrulamaz | "X zincirinde QoreChain durumunun kuantum sonrası doğrulaması; dönüş yolu klasiktir" |
| Her iki uç da kuantum sonrası imzalanmış durumu klasik adım olmadan doğrular | "kuantum sonrası rota" |

Her iki uç da kuralı karşılayana kadar bir rotayı gerçekte neyi doğruladığıyla tanımlayın, örneğin "karşı tarafın klasik hafif istemcisiyle güvence altına alınmış".

## Güvenlik notları {#security}

- Paket anahtar tutmaz ve G/Ç yapmaz. Rust'ta `unsafe` kod yoktur; TypeScript ve Go'da `fetchCheckpoint` istek yapmaz.
- Kod çözücüler sıkıdır: nesne başına tek kodlama ve başka herhangi bir imza veya anahtar uzunluğu reddedilir. Röleler kanonik baytları değiştirmeden iletmelidir, asla yeniden kodlanmış hâlini değil.
- Kümenin dışındaki doğrulayıcıların imzaları atlanmak yerine bir kontrol noktasını geçersiz kılar; bu, tüm uygulamaları aynı sonuçta tutar.
- Doğrulayıcının saatini senkronize tutun: hızlı bir saat güveni erken sonlandırır, yavaş bir saat ise yeni kontrol noktalarını `FUTURE_CHECKPOINT` olarak reddeder.
- Tasarım, her kontrol noktası kümesinin gücünün üçte ikisinden fazlasına sahip doğrulayıcıların kendi node'larının işlediği kontrol noktalarından başkasını imzalamadığını varsayar.
- Önerilen imzalama alanları (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) önerilerdir; bugün zincirde ayrılmış değildir.
- Vektörlerin anahtarları herkese açık test anahtarlarıdır; onları başka hiçbir şey için kullanmayın.
- Güvenlik açıklarını özel olarak security@qore.network adresine bildirin.

## İlgili sayfalar {#related}

- [PQC kütüphanesi](/developer-tools/pqc-library): doğrulayıcıların altındaki ML-DSA-87 ve SHAKE-256 bağlamaları.
- [QoreSign](/qoresign/overview): hesap düzeyinde ML-DSA-87 imzaları; doğrulayıcı kontrol noktalarından farklı bir şeydir.
- [Kuantum sonrası güvenlik](/architecture/post-quantum-security): zincirin bugünkü kuantum sonrası modeli.
- [Köprü mimarisi](/architecture/bridge-architecture) ve [Varlık köprüleme](/user-guide/bridging-assets): zincirler arası rotalar bugün standart klasik hafif istemciyi kullanır.
- [QoreSeal](/developer-tools/qoreseal): 27 Ekim 2026'da yayımlanan diğer 0.1.0 kuantum sonrası kiti.
- [Geliştirici paketlerine genel bakış](/developer-tools/overview).
