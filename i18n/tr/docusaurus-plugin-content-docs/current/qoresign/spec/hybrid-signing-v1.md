---
slug: /qoresign/spec/hybrid-signing-v1
title: Hibrit işlem imzalama v1
sidebar_label: Hibrit imzalama v1
sidebar_position: 1
---

# QoreChain'de hibrit işlem imzalama, sürüm 1

Durum: kararlı. `qorechain-vladi` (mainnet) ve `qorechain-diana` (testnet)
ağlarının yerel (Cosmos SDK) hattı için geçerlidir. Kaynak:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## Özet {#summary}

Hibrit bir işlem, aynı hesap tarafından iki kez imzalanmış sıradan bir Cosmos SDK
`TxRaw`'dır:

1. işlem gövdesinin içinde `/qorechain.pqc.v1.PQCHybridSignature` uzantı
   seçeneği olarak taşınan bir ML-DSA-87 (FIPS 204) imzası;
2. nihai gövde üzerinde, `TxRaw.signatures` içinde bir secp256k1
   `SIGN_MODE_DIRECT` imzası.

Ağ ikisini de doğrular. Yerel hatta ağ, ML-DSA-87 imzasını varsayılan olarak
zorunlu tutar (`HybridSignatureMode = Required`, zincir genelinde bir parametre);
hesabın ML-DSA-87 anahtarını kaydeden veya sürdüren mesajlar gibi küçük bir
muaf mesaj kümesi dışında, imzasız bir işlem reddedilir.

## Anahtarlar {#keys}

| Anahtar | Algoritma | Boyut |
|---|---|---|
| Klasik | secp256k1 (`secp256k1` hesapları: adres = RIPEMD160(SHA256(sıkıştırılmış anahtar)); `eth_secp256k1` hesapları: adres = KECCAK256(sıkıştırılmamış anahtar) değerinin son 20 baytı) | 33 baytlık sıkıştırılmış açık anahtar |
| Kuantum sonrası | ML-DSA-87, algoritma kimliği `1` | açık anahtar 2592 bayt, imza 4627 bayt |

Hibrit işlemler doğrulanmadan önce ML-DSA-87 açık anahtarı hesap için
`MsgRegisterPQCKeyV2` ile kaydedilmelidir (bkz. [Kayıt](#registration)). Bir
işlem bunun yerine açık anahtarı uzantıya (alan 3) gömerek ilk kullanımda
kaydedebilir.

## Uzantı {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

`TxBody.extension_options` (alan 1023) içine, `type_url =
"/qorechain.pqc.v1.PQCHybridSignature"` olan bir `google.protobuf.Any` olarak ve
protobuf kodlaması `value` olarak eklenir. Bir gövde tam olarak bir böyle uzantı
taşımalıdır.

## Sign-bytes {#sign-bytes}

`B0`, PQC uzantısı **olmadan** `TxBody`'nin kanonik protobuf kodlaması olsun
(diğer tüm alanlar ve uzantılar sırasıyla korunur) ve `A`, yayınlandığı haliyle
`AuthInfo` baytları olsun. `BE32`/`BE64`, big-endian işaretsiz uzunluklardır.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

Bir ağ, belirli bir yükseklikte tam olarak tek bir biçimi doğrular. Her iki
herkese açık ağ da `v3.1.98` / `v3.2.0` yükseltmelerinden itibaren `v2`'yi
doğrular (mainnet: `v3.2.0`, yükseklik 2,981,742); başka herhangi bir ağ `v2`'yi
genesis'ten itibaren doğrular. `v1` yalnızca bu yüksekliklerden önce yapılmış
imzaları yeniden üretmek için gereklidir. Bir istemci, hangi biçimi
doğruladığını bir düğüme
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}` adresini okuyarak
sorabilir.

ML-DSA-87 imzası `ML-DSA.Sign(sk, signBytes, ctx = "")` işlemidir. Ağ hem
deterministik hem de hedged (rastgeleleştirilmiş) varyantı kabul eder; QoreSign
varsayılan olarak deterministik imzalar (FIPS 204, `rnd` = 32 sıfır bayt), böylece
imzalar yayımlanmış vektörlere karşı yeniden üretilebilir.

## İşlem sırası {#order-of-operations}

1. `B0` ve `A` kodlanır (ücret, gas limiti ve imzalayan bilgisi bu noktada
   sabitlenir).
2. Sign-bytes ve ML-DSA-87 imzası hesaplanır.
3. Uzantı, kanonik alan sırasına göre (mevcut `extension_options` sonrasına,
   `non_critical_extension_options` öncesine) `B0`'a eklenir; bu, nihai gövde
   `B`'yi verir.
4. `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`
   secp256k1 ile imzalanır: `secp256k1` hesapları için SHA-256,
   `eth_secp256k1` hesapları için KECCAK-256; 64 baytlık `r || s`, low-S.
5. `TxRaw { B, A, [classical signature] }` yayınlanır.

Klasik imza uzantıyı kapsar; ML-DSA-87 imzası ise gövdedeki ve auth info'daki
diğer her şeyi, ücret dahil, kapsar. Hiçbir imza kendini imzalamaz.

## Kayıt {#registration}

`MsgRegisterPQCKeyV2` (tür URL'si `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| Alan | Numara | Değer |
|---|---|---|
| `sender` | 1 | `qor1` hesabı |
| `public_key` | 2 | ML-DSA-87 açık anahtarı |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | hesabın 33 baytlık sıkıştırılmış secp256k1 anahtarı; `sender`'a türemelidir |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | aşağıdaki mesaj üzerinde ML-DSA-87 imzası |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

Kayıt işleminin kendisi yalnızca klasik anahtarla imzalanır. `t1` kısmı (bayt 32
ve sonrası) tamamen sıfır olan bir açık anahtar reddedilir; çünkü imzaları
taklit edilebilir.

## Diğer hatlar {#other-lanes}

- EVM hattı: Ethereum işlemlerinde uzantı için alan yoktur, bu yüzden ML-DSA-87
  imzası taşımazlar. Kayıtlı bir ML-DSA-87 anahtarı olan bir hesap, yerel hattan
  sınırlı bir EVM yetkilendirme penceresi açabilir (bitiş yüksekliği, en fazla
  işlem, en fazla değer). Bkz.
  [EVM cüzdanları: kuantuma hazır mod](/qoresign/guides/evm-quantum-ready).
- SVM hattı: ağda henüz açık değil.

## Test vektörleri {#test-vectors}

`vectors/qoresign-v1.json`, `hybridTx` alanı; her iki sürüm için beklenen
sign-bytes, imzalar, nihai gövde ve `TxRaw` ile birlikte bir gövde, auth info ve
hesap numarası verir. Bkz. [Test vektörleri](/qoresign/vectors).
