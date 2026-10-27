---
slug: /qoresign/overview
title: QoreSign Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreSign

QoreSign, QoreChain üzerindeki cüzdanlar ve arka uç servisleri için hibrit
secp256k1 + ML-DSA-87 (FIPS 204) imzalama çözümüdür.

QoreSign, QoreChain'in kendi cüzdanı dışındaki bir cüzdanın bir hesabın
ML-DSA-87 anahtarını türetmesine, yerel zincir hattındaki işlemleri iki anahtarla
imzalamasına, hibrit imzaları yerel olarak doğrulamasına, imzalamadan önce bir
işlemi simüle etmesine ve Sign In With QoreChain'i uygulamasına olanak tanır.
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) bağlayıcıları
üzerinde ince bir katmandır ve kendi başına hiçbir kriptografik ilkel eklemez.

Güncel sürüm **0.1.0**'dır. Kaynak kod, örnekler ve test vektörleri
[qorechain/qoresign](https://github.com/qorechain/qoresign) deposundadır.

## QoreSign her hatta ne yapar {#lanes}

| Hat | QoreSign bugün ne yapar |
|---|---|
| **Yerel** (Cosmos SDK) | Hibrit imzalama ve doğrulama. Ağ, ML-DSA-87 imzasını varsayılan olarak zorunlu tutar. |
| **EVM** | Yalnızca yetkilendirme penceresi: hesap bir ML-DSA-87 anahtarı kaydeder ve yerel hattan sınırlı bir yetkilendirme penceresi açar. Ethereum işlemlerinin kendisi ML-DSA-87 imzası taşımaz. |
| **SVM** | Ağda henüz açık değil (`LANE_NOT_AVAILABLE`). |

Hibrit EVM imzalama için önce ağda hat başına PQC desteği gerekir. Bkz.
[EVM cüzdanları: yetkilendirme penceresi](/qoresign/guides/evm-quantum-ready).

## Paketler {#packages}

| Dil | Paket | Kurulum |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

Beş uygulamanın tümü kendilerini aynı
[test vektörlerine](/qoresign/vectors) karşı denetler.

## Örnek {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

Ağ yardımcıları (anahtar durumu, bakiye değişiklikleriyle simülasyon, yayın,
zincire karşı oturum açma doğrulaması) `@qorechain/qoresign/network` içindedir.

## Dokümantasyon {#documentation}

- [Hızlı Başlangıç](/qoresign/quickstart): birkaç dakikada anahtar türetin,
  hibrit bir işlemi imzalayın ve doğrulayın.
- Kılavuzlar
  - [Keplr uyumlu bir cüzdana hibrit imzalama ekleyin](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: sunucu doğrulaması](/qoresign/guides/sign-in)
  - [EVM cüzdanları: yetkilendirme penceresi](/qoresign/guides/evm-quantum-ready)
  - [Anahtar türetme: kanonik anahtarlar ve HD taslağı](/qoresign/guides/key-derivation)
  - [Boyutlar ve aktarım](/qoresign/guides/sizes-and-transport)
- Spesifikasyonlar
  - [Hibrit işlem imzalama v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Mesaj imzalama v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87 anahtar türetme](/qoresign/spec/hd-derivation-draft)
- [Test vektörleri](/qoresign/vectors)
- [Örnekler](https://github.com/qorechain/qoresign/tree/main/examples)

API referansı: deponun bir kopyasında `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign` (Rust) veya
`go doc github.com/qorechain/qoresign/go` (Go) komutunu çalıştırın. Swift ve
Kotlin bağlayıcıları Rust API'sini yansıtır; bkz.
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) ve
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) README dosyaları.

## Kapsam {#scope}

QoreSign yerel olarak imzalar. Sizin yerinize anahtar tutmaz, eşik veya MPC
imzalama yapmaz ve donanım cüzdanlarında imzalama yapmaz. ML-DSA-87 ve
secp256k1 uygulamaları `qorechain-pqc`'den (`@noble/post-quantum`, `fips204` ve
Cloudflare CIRCL üzerine kurulu) ve `@noble/curves`, `k256` ile
`decred/secp256k1` kütüphanelerinden gelir.

## Sürümleme {#versioning}

QoreSign 1.0 öncesi aşamadadır: minör sürümler API'yi değiştirebilir ve her
geriye dönük uyumsuz değişiklik
[değişiklik günlüğünde](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md)
listelenir. Kablo biçimleri ayrı sürümlenir (`v1` spesifikasyonları ve
`vectors/qoresign-v1.json`) ve bir sürüm içinde değişmez.

## Katkı ve güvenlik {#contributing}

Bkz.
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Güvenlik açıklarını
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md)
dosyasında anlatıldığı gibi özel olarak bildirin.

## Lisans {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Telif hakkı
2026 QoreChain Association.
