---
slug: /qoresign/guides/key-derivation
title: Anahtar türetme
sidebar_label: Anahtar türetme
sidebar_position: 4
---

# Anahtar türetme

QoreSign, bir BIP-39 mnemonic'inden ML-DSA-87 anahtarı elde etmek için iki yol
sunar. Tam tanımlar: [ML-DSA-87 anahtar türetme](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (taslak) |
|---|---|---|
| Girdi | mnemonic + hesap adresi | mnemonic (veya tohum) + sertleştirilmiş yol |
| Adrese bağlı | evet | hayır |
| QoreChain cüzdanlarıyla aynı anahtar | evet | hayır |
| Zincirde kayıt gerekir | yalnızca henüz kayıtlı değilse | her zaman |
| Kararlılık | kararlı | nihai olmadan önce değişebilir |

Adreslerden bağımsız, tohum başına birden fazla kuantum sonrası anahtara
ihtiyacınız yoksa ([hiyerarşik taslak](/qoresign/spec/hd-derivation-draft#hierarchical-derivation))
[kanonik türetmeyi](/qoresign/spec/hd-derivation-draft#canonical-derivation)
kullanın.

## Mnemonic biçimi {#mnemonic-form}

Mnemonic kanonik biçimde olmalıdır (küçük harfli sözcükler, tek boşluk).
QoreSign diğer yazımları normalleştirmek yerine reddeder; çünkü ifade türetme
girdisinin bir parçasıdır ve farklı bir yazım farklı bir anahtar üretir.

## Mnemonic'i olmayan cüzdanlar {#without-mnemonic}

Mnemonic'e sahip olmayan cüzdanlar (örneğin anahtarları donanımda tutulanlar)
kanonik türetmeyi kullanamaz. `pqKeyFromSeed(randomBytes(32))` ile rastgele bir
ML-DSA-87 anahtarı üretebilir veya HD taslağını kullanabilir ve bu anahtarı
kaydedebilirler.
