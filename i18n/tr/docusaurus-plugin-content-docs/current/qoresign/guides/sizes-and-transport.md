---
slug: /qoresign/guides/sizes-and-transport
title: Boyutlar ve aktarım
sidebar_label: Boyutlar ve aktarım
sidebar_position: 5
---

# Boyutlar ve aktarım

| Öğe | Bayt | Kaynak |
|---|---|---|
| ML-DSA-87 açık anahtarı | 2592 | FIPS 204, Tablo 2 |
| ML-DSA-87 gizli anahtarı | 4896 | FIPS 204, Tablo 2 |
| ML-DSA-87 imzası | 4627 | FIPS 204, Tablo 2 |
| ML-DSA-87 tohumu | 32 | FIPS 204 |
| secp256k1 sıkıştırılmış açık anahtar | 33 | SEC 1 |
| secp256k1 imzası (r, s) | 64 | |
| Bir gövdedeki PQC uzantısı | yaklaşık 4640 (imza artı protobuf çerçevelemesi; açık anahtar gömülüyse 2595 daha) | `qorechain.pqc.v1.PQCHybridSignature` |

## Cüzdanlar için sonuçlar {#consequences}

- Hibrit bir işlem, klasik bir işlemden yaklaşık 4,7 KB daha büyüktür. Gas ve
  ücretler işlem boyutuyla ölçeklenir; imzalamadan önce simüle edin
  (`simulateTx`) ve önerilen gas limitini kullanın.
- Tek bir statik QR kodu en fazla 2953 bayt tutar (sürüm 40, ikili, düşük hata
  düzeltme), dolayısıyla bir ML-DSA-87 imzası veya açık anahtarı tek bir koda
  sığmaz. Hava boşluklu (air-gapped) imzalayıcılar çok parçalı kodlamalara
  (animasyonlu veya fountain kodlu QR) ihtiyaç duyar.
- Bir ML-DSA-87 anahtarını saklamanız gerektiğinde 4896 baytlık gizli anahtarı
  değil, 32 baytlık tohumu saklayın; `pqKeyFromSeed` anahtar çiftini yeniden
  oluşturur.

Uzantı yerleşimi
[Hibrit işlem imzalama v1](/qoresign/spec/hybrid-signing-v1#extension)
sayfasında tanımlanır.
