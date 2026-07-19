---
slug: /qorex/send-and-receive
title: Gönder ve Al
sidebar_label: Gönder ve Al
sidebar_position: 3
---

# Gönder ve Al

Ana Sayfa (Cüzdan) sekmesi başlangıç noktanızdır. Bir **ağ rozeti** (varsayılan olarak MAINNET veya geliştirici geçişini etkinleştirdiyseniz TESTNET), **toplam bakiyeniz** (gizlemek/göstermek için dokunun) ve ana işlemleri gösterir: **Gönder · Al · Takas · Stake**. Varlık listeniz **QOR** (Native + kuantum sonrası 🛡, Native/EVM/SVM şeritleri boyunca tek birleşik bakiye) ve **Tüm ağlar** (birleşik ETH · BNB · POL · ARB görünümü) gösterir.

## Kuantuma karşı güvenli QOR gönderin

1. **Gönder**'e dokunun.
2. Alıcıyı bir `qor1…` adresi **veya** bir **@handle** olarak girin. Bir handle çözümlenir ve kriptografik olarak doğrulanır (kayıt imzası + sahip imzası + ilk kullanımda güven sabitleme); bir handle'ın anahtarı sessizce değişirse, QoreX açık bir uyarı gösterir.
3. Tutarı girin. Önizleme; alıcıyı, tutarı, ücreti ve **Shield** durumunu — imzanın kuantum sonrası koruma seviyesini — gösterir.
4. **Biyometrik** onay ile doğrulayın. QoreX, transferi zorunlu hibrit kuantum sonrası imza (ML-DSA-87 + secp256k1) ile imzalar ve Native şerit üzerinde yayınlar.

**İlk** transferiniz aynı zamanda kuantum sonrası anahtarınızı otomatik olarak zincir üzerinde kaydeder — bunu [Güvenlik ve Kurtarma](/qorex/security-and-recovery#pqc-key) bölümünde görebilirsiniz. Ayrı bir adıma gerek yoktur.

## QOR alın

`qor1…` adresinizi bir QR kodu (gömülü QoreChain simgesiyle) ve bir kopyalama düğmesi olarak göstermek için **Al**'a dokunun. İkisinden birini gönderenle paylaşın.

## Ödeme talep edin

Bir ödeme talebi — bir tutar artı isteğe bağlı bir not — QR kodu veya bağlantı olarak oluşturmak için **Talep Et**'e dokunun ([oturum açma](/qorex/account-and-dashboard#sign-in) gerektirir). Onu tarayan herkes önceden doldurulmuş transferi görür.

## Harici ağlar ve tokenlar

**Tüm ağlar** (veya Harici-gönder) üzerinden **ETH, BNB, POL, ARB ve SOL**'u yerel olarak, ayrıca **ERC-20** ve **SPL** tokenlarını gönderebilirsiniz — hepsi aynı kurtarma ifadesinden türetilir (ETH `m/44'/60'` kullanır, SOL kendi standart yolunu kullanır ve SPL ilişkili token hesaplarını kullanır).

:::caution Harici zincirler yalnızca klasiktir
Diğer blok zincirleri kuantum sonrası imzalar taşıyamaz. Bir harici ağda gönderim yaptığınızda, QoreX bunu açıkça belirtir (transfer klasik bir imza kullanır ve **Shield** düşürmeyi gösterir). **QOR**'unuz her zaman korumalı Native şeritte kalır. Cosmos tabanlı harici gönderimler isteğe bağlı bir notu destekler.
:::

## Takas

**Takas** sekmesi QoreChain'in zincir üzerindeki AMM'sine bağlıdır ancak devre dışı kalır — düğmede **"Swap — coming with pool liquidity"** yazar — likidite ve uzak özellik bayrağı onu açana kadar. Bu olduğunda otomatik olarak etkinleşir; **uygulama güncellemesine gerek yoktur**.

## Sonraki adımlar

- [Portföy ve Stake](/qorex/portfolio-and-staking) — dağılımınızı görün ve ödüller kazanın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — cüzdanınızı koruyun ve kurtarın.
