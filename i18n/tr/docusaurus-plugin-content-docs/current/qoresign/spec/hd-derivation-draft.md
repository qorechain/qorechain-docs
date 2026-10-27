---
slug: /qoresign/spec/hd-derivation-draft
title: ML-DSA-87 anahtar türetme
sidebar_label: Anahtar türetme (HD taslağı)
sidebar_position: 4
---

# ML-DSA-87 anahtar türetme

Durum: kanonik türetme kararlıdır. Hiyerarşik türetme bir **taslaktır**:
uygulamalar nihai hale gelmeden önce değişebilir ve onunla türetilen anahtarlar
diğer anahtarlar gibi zincirde kaydedilmelidir. Kaynak:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## Kanonik türetme (kararlı) {#canonical-derivation}

QoreChain cüzdanları ve QoreChain SDK'sı, BIP-39 mnemonic'inden ve hesap
adresinden hesap başına bir ML-DSA-87 anahtarı türetir:

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address`, hesabın `qor1` biçimidir (bir `0x` adresi önce aynı 20 bayta
  dönüştürülür).
- `mnemonic`, kanonik biçimdeki ifadedir: tek boşlukla ayrılmış küçük harfli
  İngilizce sözcükler; öncesinde ve sonrasında hiçbir şey yok. Uygulamalar başka
  bir yazımı sessizce normalleştirmek yerine reddetmelidir; çünkü farklı bir
  dizge farklı bir anahtar üretir.
- Anahtar adrese bağlıdır: aynı mnemonic her hesap için farklı bir anahtar verir.

Bu türetmeyi kullanan bir cüzdan, QoreChain cüzdanlarının oluşturduğu hesaplar
için zaten kayıtlı olan anahtarla imzalar.

## Hiyerarşik türetme (taslak) {#hierarchical-derivation}

Tek bir tohumdan, adrese bağlamadan birden fazla kuantum sonrası anahtara ihtiyaç
duyan cüzdanlar içindir. ML-DSA'nın açık (public) alt anahtar türetmesi yoktur;
bu yüzden her yol parçası sertleştirilmiştir.

Yapı, kendi ana anahtar dizgisiyle SLIP-0010'dur:

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed`, 64 baytlık BIP-39 tohumudur (mnemonic artı isteğe bağlı parola) ya da
  16 ile 64 bayt arası herhangi bir tohumdur.
- Varsayılan yol `m/44'/118'/{account}'/0'/0'` biçimindedir.
- Sertleştirilmemiş herhangi bir parça içeren bir yol reddedilir.

Bunun nihai hale gelmesinden önceki açık noktalar: yolda kullanılacak coin türü,
zincirdeki anahtar rotasyonuyla (`MsgRotatePQCKey`) etkileşim ve bir tohumdan
kuantum sonrası anahtar türeten diğer ekosistemlerle uyum.

## Test vektörleri {#test-vectors}

`vectors/qoresign-v1.json`, `canonical`, `hd` ve `hdRejected` alanları. Bkz.
[Test vektörleri](/qoresign/vectors).
