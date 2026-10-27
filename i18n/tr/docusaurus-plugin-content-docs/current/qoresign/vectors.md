---
slug: /qoresign/vectors
title: QoreSign test vektörleri
sidebar_label: Test vektörleri
sidebar_position: 5
---

# Test vektörleri

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
TypeScript uygulamasından üretilir (`pnpm build && pnpm vectors`) ve TypeScript,
Rust, Go, Swift ve Kotlin test paketleri tarafından denetlenir. Dosyada yapılan
bir değişiklik kablo biçiminde yapılmış bir değişikliktir: bu dosyayı düzenlemek
yerine yeni bir sürümle yeni bir dosya ekleyin.

Her anahtar, herkese açık BIP-39 test mnemonic'inden (`abandon ... about`)
türetilir. Bu hesaplara asla fon göndermeyin.

## Alanlar {#fields}

| Alan | İçerik |
|---|---|
| `accounts` | `secp256k1` (`m/44'/118'/0'/0/0`) ve `eth_secp256k1` (`m/44'/60'/0'/0/0`) hesapları için klasik anahtarlar ve adresler |
| `canonical` | adres başına kanonik ML-DSA-87 açık anahtarları ([anahtar türetme](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | taslak hiyerarşik türetme: yol başına açık anahtarlar ve reddedilmesi gereken yollar ([anahtar türetme](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | bir `TxBody` ve `AuthInfo`, hesap numarası ve zincir kimliği; sign-bytes `v2` ve `v1` için beklenen sign-bytes, ML-DSA-87 imzası, nihai gövde, secp256k1 imzası ve `TxRaw` ile birlikte ([hibrit imzalama](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | sahiplik kanıtı mesajı ve imzası ([kayıt](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | kodlanmış `MsgRegisterPQCKeyV2` |
| `message` | rastgele mesaj imzalama: veri, ADR-36 ve ML-DSA-87 sign-bytes, imza ([mesaj imzalama](/qoresign/spec/message-signing-v1)) |
| `siwq` | oturum açma alanları, oluşturulan mesaj, ADR-36 ve ML-DSA-87 sign-bytes, imza ve imzanın doğrulandığı bir zaman ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Kodlama {#encoding}

Tüm bayt dizileri küçük harfli onaltılık (hex) biçimindedir. ML-DSA-87 imzaları
deterministiktir (FIPS 204, `rnd` = 32 sıfır bayt); secp256k1 imzaları RFC 6979
ve low-S kullanır.
