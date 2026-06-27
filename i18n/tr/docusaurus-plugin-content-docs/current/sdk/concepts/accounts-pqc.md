---
slug: /sdk/concepts/accounts-pqc
title: Hesaplar ve PQC İmzalama
sidebar_label: Hesaplar ve PQC
sidebar_position: 2
---

# Hesaplar ve PQC imzalama

QoreChain hesapları tek bir BIP-39 anımsatıcısından (mnemonic) türetilir. Aynı
anımsatıcı, bağımsız türetme yolları aracılığıyla bir yerel (native), bir EVM ve
bir SVM hesabı üretir.

## HD türetme

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

Anımsatıcı, herhangi bir anahtar türetilmeden önce doğrulanır (kelimeler **ve**
sağlama toplamı), böylece bir yazım hatası sessizce yanlış bir hesap üretmek
yerine hata yükseltir. `validateMnemonic(mnemonic)` ile açıkça
doğrulayabilirsiniz.

### Türetme şemaları

| Tür | Eğri (Curve) | Yol (Path) | Adres |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))`'in bech32 `qor`'u |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32 baytlık açık anahtarın base58'i |

Ek hesaplar türetmek için bir hesap indeksi geçirin. TypeScript'te:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust'ta indeks konumsal bir argümandır
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Bilinen-cevap notu

Türetme şemaları belirleyicidir (deterministic) ve dört SDK'nın tamamında
bilinen-cevap testleriyle (known-answer tests) kapsanır, böylece aynı anımsatıcı
TypeScript, Python, Go ve Rust'ta aynı adresleri üretir. Bu, bir dilde türetmenize
ve başka bir dilde doğrulamanıza olanak tanır.

## Post-kuantum kriptografi (PQC)

QoreChain, **ML-DSA-87** (Dilithium-5, FIPS 204) imzalarını destekler. SDK,
ilkelleri (primitives) doğrudan açığa çıkarır.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Dışa aktarılan uzunluk sabitleri (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) tampon (buffer) boyutlarını doğrulamanıza olanak tanır.

> Altta, PQC ilkelleri [**qorechain-pqc**](/developer-guide/post-quantum-signing)'ten gelir — denetlenmiş FIPS-204/203/202 uygulamalarını altı dilde (JavaScript/TypeScript, Rust, Go, C, Python, Java) tek tutarlı bir API arkasında sarmalayan açık kaynaklı, yalnızca standartlara dayalı kütüphane. SDK'nın dışında ham ilkellere veya `hybridSignBytes` çerçevelemesine (framing) ihtiyaç duyduğunuzda doğrudan ona başvurun.

### Takılabilir imzalayıcılar (signers)

Birleştirme (composition) için SDK, bir `Signer` soyutlamasının yanı sıra
`PqcSigner` ve `HybridSigner` uygulamalarını ve bir `SignatureMode` enum'unu
sağlar. İlkelleri doğrudan çağırmak yerine PQC imzalamayı kendi akışınıza takmak
istediğinizde bunları kullanın.

## Hibrit imzalama

Bir **hibrit** işlem, hem klasik bir secp256k1 imzası hem de bir ML-DSA-87 imzası
taşır, böylece klasik doğrulama altında geçerli kalırken post-kuantum koruma
kazanır. Post-kuantum kısmı, işlemde bir `PQCHybridSignature` uzantısı olarak yol
alır.

:::caution Cosmos yolunda hibrit imzalama zorunludur
Mevcut zincir sürümünden (**v3.1.77**) itibaren, ağ varsayılanı
`hybrid_signature_mode = required` ve `allow_classical_fallback = false`'dur.
`buildHybridTx` (ile `includePqcPublicKey`) aracılığıyla hibrit imzalama,
cosmos-yolu işlemleri için **zorunludur** — yalnızca klasik cosmos işlemleri
zincir üstünde reddedilir. EVM işlemleri ayrı bir `eth_secp256k1` yolu kullanır ve
bundan etkilenmez.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### Zincir üstü ön koşul

Bir hibrit işlem zincir üstünde PQC-doğrulamasından geçmeden önce, imzalayıcının
PQC açık anahtarı zincirin `MsgRegisterPQCKey`'i aracılığıyla **kaydedilmelidir**
— *meğer ki* anahtarı uzantıya gömen `includePqcPublicKey: true` ayarını yapın;
böylece zincir onu ilk kullanımda otomatik olarak kaydedebilir.

### Hibrit tx sözleşmesi (üst düzey)

İşlem, standart imza baytları (sign bytes) üzerinde klasik olarak imzalanır (bunlar
PQC uzantısını **hariç tutar**) ve ML-DSA-87 imzası hesaplanır ve
`PQCHybridSignature` uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç
tuttuğundan, bir doğrulayıcının PQC kısmını anlayıp anlamamasından bağımsız olarak
klasik imza geçerli kalır. Alt düzey yardımcılar (`encodeHybridExtension`,
`attachHybridExtension`, `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`)
ve uçtan uca oluşturucular (`buildHybridTx`, `signAndBroadcastHybrid`) ileri düzey
kullanım için dışa aktarılır.

> Hibrit işlem gönderimi, cosmos işlemleri için canlı ağdaki zorunlu yoldur. Yerel
> imzalama/doğrulama ilkelleri ve tx oluşturma yardımcıları bugün mevcuttur.

## Algoritma tanımlayıcıları

SDK, protokol düzeyinde çalışma için algoritma kimliklerini ve yardımcılarını dışa
aktarır: `AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` ve `isSignatureAlgorithm(id)`.
