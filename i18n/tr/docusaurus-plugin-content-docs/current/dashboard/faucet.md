---
slug: /dashboard/faucet
title: Musluk
sidebar_label: Musluk
sidebar_position: 9
---

# Musluk

**Musluk**, Panel'i değerli hiçbir şey harcamadan deneyebilmeniz için size ücretsiz test token'ları verir. **Yalnızca testnet** için bir araçtır — transferleri, takasları, stake etmeyi ve sözleşme dağıtımını test etmeden önce adresinizi fonlamak için testnet (`qorechain-diana`) üzerinde kullanın.

:::caution Yalnızca testnet — gerçek değer yok
Testnet QOR'un **gerçek bir değeri yoktur**. Musluk asla mainnet'e dokunmaz: mainnet QOR için bir musluk yoktur ve burada talep ettiğiniz hiçbir şey mainnet'e taşınamaz.
:::

## Test token'ları talep etme

1. Oturum açın, Panel'i **testnet**'e geçirin ve **Musluk**'u açın.
2. Fonlanacak adresi girin (`qor1...`). Cüzdanınız bağlıysa, otomatik olarak doldurmak için **Adresimi kullan** seçeneğini seçin. Form, devam edebilmeniz için adresin geçerli olduğunu doğrular.
3. Talep düğmesini seçin. Fonlama saniyeler içinde işlenir.

Talep başarılı olduğunda, bir onay kartı gönderilen tutarı ve işlem karmasını, bir kopyalama düğmesi ve işlemi [Gezgin](/dashboard/explorer)'de açmak için bir bağlantı ile gösterir. 27 Ekim 2026'dan beri bir talep, üç [Fest test token'ını](#fest-tokens) da ödeyebilir; bu durumda kartta, gelenleri listeleyen bir **Fest token'ları** satırı bulunur ya da yalnızca QOR geçtiyse kısa bir not görünür.

## Sınırlar

Her adres, bekleme süresi başına bir kez Musluk'tan talep edebilir. Sayfa, talep başına tam tutarı ve tekrar talep edebilmeniz için gereken bekleme süresini gösterir. Çok erken tekrar talep ederseniz, Musluk bir sonraki ne zaman uygun olacağınızı bildirir.

## Fest test token'ları (fUSD, fETH, fBTC) {#fest-tokens}

Testnet'te geliştirici festivali için üç ek test token'ı vardır: **fUSD** (FestUSD, 6 ondalık), **fETH** (FestETH, 18 ondalık) ve **fBTC** (FestBTC, 8 ondalık). Bunlar değeri olmayan ve herhangi bir gerçek varlıkla bağlantısı bulunmayan düz test token'larıdır. Testnet yönetişimi bunları ERC-20 modülüne kaydetti (testnet önerisi 26); böylece her biri hem testnet EVM'inde bir ERC-20 sözleşmesi olarak hem de cüzdanların ve AMM'nin tutabildiği bir bank coin'i olarak vardır. Musluk, bir QOR talebiyle birlikte her birinden bir miktar göndermek üzere yapılandırılmıştır (yazım sırasında, 27 Ekim 2026: 1.000 fUSD, 0,5 fETH ve 0,02 fBTC; QOR ile aynı 24 saatlik bekleme süresiyle); Musluk bunları ödediğinde sayfa, kesin tutarları QOR tutarının yanında gösterir.

| Token | Ondalık | Testnet EVM'indeki ERC-20 sözleşmesi | Bank birimi (büyük/küçük harf duyarlı) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

Bilmeniz gerekenler:

- **Yalnızca testnet.** Bu token'lar mainnet'te yoktur.
- **Birimi tam olarak kopyalayın.** Adres kısmı EIP-55 karışık harf biçimindedir ve birim büyük/küçük harf duyarlı olarak eşleştirilir.
- **Zincir üzerinde görün.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` üç birimi sembolleri ve görünen adlarıyla listeler.
- **İki biçim arasında dönüştürme.** Bir ERC-20 bakiyesini bank coin'lerine taşımak (`MsgConvertERC20`), göndericinin `qor1...` bech32 adresi olarak verilmesini gerektirir.
- **Havuzlar.** Testnet [AMM](/architecture/amm), bunları `uqor` karşısında havuzlayabilir; bir havuzun var olup olmadığını `GET /qorechain/amm/v1/pools` gösterir. [Cüzdan](/dashboard/wallet) ve [Trade](/dashboard/trade) sayfalarında bunlar için ayrılmış bir giriş yoktur; bir bakiyeyi `GET /cosmos/bank/v1beta1/balances/{address}` ile denetleyin.

## Test token'larıyla ne yapılır

Test token'ları, testnet üzerinde ağı baştan sona kullanmanızı sağlar:

- [Cüzdan](/dashboard/wallet) sayfasında gönderin ve alın.
- AMM üzerinde bir [takas](/dashboard/trade) deneyin.
- Bir doğrulayıcıya [yetki verin](/dashboard/staking-and-validators).
- Mainnet'e geçmeden önce sözleşmeleri dağıtın ve test edin.

:::note Yalnızca test değeri
Musluk token'ları testnet üzerinde bulunur ve gerçek bir değeri yoktur. Üretim kullanımı için hazır olduğunuzda, mainnet'e (`qorechain-vladi`) geçin.
:::
