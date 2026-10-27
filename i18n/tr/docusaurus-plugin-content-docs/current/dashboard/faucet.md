---
slug: /dashboard/faucet
title: Musluk
sidebar_label: Musluk
sidebar_position: 9
---

# Musluk

**Musluk**, Panel'i, cüzdanları ve sözleşmeleri değerli hiçbir şey harcamadan deneyebilmeniz için bir testnet adresine ücretsiz test token'ları öder. Testnet `qorechain-diana` üzerinde transferleri, takasları, stake araçlarını ve sözleşme dağıtımını test etmek için testnet QOR'a (ve geliştirici festivali sırasında üç test token'ına) ihtiyaç duyan herkes içindir.

:::caution Yalnızca testnet, gerçek değer yok
Testnet QOR'un **gerçek bir değeri yoktur**. Musluk asla mainnet'e dokunmaz: mainnet QOR için bir musluk yoktur ve burada talep ettiğiniz hiçbir şey mainnet'e taşınamaz.
:::

## Yenilikler {#innovations}

- **Tek talep, iki tür token.** Bir talep 100 QOR öder; ayrı bir işlemde ise 1.000 fUSD, 0,5 fETH ve 0,02 fBTC öder. Fest gönderimi başarısız olursa QOR yine de ulaşır ve sonuç kartı bunu belirtir.
- **Çift bekleme süresi.** Hesap başına **ve** adres başına 24 saatte bir talep. Yuva, herhangi bir şey gönderilmeden önce ayrılır ve gönderim başarısız olursa serbest bırakılır; böylece başarısız bir talep gününüzü tüketmez.
- **Fest token'ları yerel bank coin'leridir.** Bunlar, zincir üzerindeki AMM'nin, bank gönderimlerinin, IBC'nin ve QoreChain Native sözleşmelerinin olduğu gibi kullandığı `erc20:0x...` bank birimleridir. MetaMask veya bir EVM DEX bunları yalnızca bir `MsgConvertCoin` dönüşümünden sonra görür (bkz. [Fest test token'ları](#fest-tokens)).
- **Bir `0x` alıcı, `qor1` ikizi üzerinden ödenir.** Bir `0x` adresi, `qor1` biçimiyle aynı 20 baytıdır; bu nedenle servis aynı hesabı öder. Panel formunun kendisi yalnızca `qor1...` kabul eder.

## Nasıl kullanılır {#how-to-use}

1. **Oturum açın.** Oturum kapalıyken sayfa "Sign in to access the faucet." metnini gösterir.
2. **Faucet** sayfasını açın. **Request Tokens** altında, **Wallet Address** bölümünde, Panel cüzdanlarınızdan birini doldurmak için "Select a wallet" veya **Use my address ->** seçeneğini kullanın ya da bir `qor1...` adresi yazın.
3. Bilgi satırı, fest tutarlarıyla birlikte "You can request 100 QOR once every 24 hours" metnini gösterir.
4. **Request Tokens** seçeneğini seçin.
5. Başarı durumunda kart, tutarla birlikte **Tokens Sent!** başlığını, bir **Fest tokens** satırını (gelenleri ya da yalnızca QOR geçtiyse kısa bir notu), bir kopyalama düğmesiyle işlem karmasını ve **View on Explorer** bağlantısını gösterir.
6. Çok erken tekrar talep etmek "Rate Limit Reached" ve "Rate limited for another HH:MM" metinlerini gösterir.

Formdaki adres denetimi hafiftir: `qor` önekine ve en az 10 karakterlik uzunluğa bakar ve `0x...` girdisini reddeder. Göndermeden önce adresi kendiniz kontrol edin.

Bir musluk talebi ayrıca musluk [görevlerine](/dashboard/quests) da sayılır.

**Asgari örnek:** oturum açın, Faucet'i açın, **Use my address ->** seçeneğini seçin, **Request Tokens** seçeneğini seçin, ardından üst bilgi Testnet'teyken **View on Explorer** seçeneğini seçin.

### Fest test token'ları (fUSD, fETH, fBTC) {#fest-tokens}

Testnet'te geliştirici festivali için üç ek test token'ı vardır: **fUSD** (FestUSD, 6 ondalık), **fETH** (FestETH, 18 ondalık) ve **fBTC** (FestBTC, 8 ondalık). Bunların değeri yoktur ve herhangi bir gerçek varlıkla bağlantıları bulunmaz. Testnet yönetişimi bunları ERC-20 modülüne kaydetti (testnet önerisi 26); böylece her biri hem testnet EVM'inde bir ERC-20 sözleşmesi olarak hem de cüzdanların ve AMM'nin tutabildiği bir bank coin'i olarak vardır. Musluk, bir QOR talebiyle birlikte her birinden bir miktar göndermek üzere yapılandırılmıştır (yazım sırasında, 27 Ekim 2026: 1.000 fUSD, 0,5 fETH ve 0,02 fBTC; aynı 24 saatlik bekleme süresiyle); sayfa bunları ödediğinde kesin tutarları QOR tutarının yanında gösterir. Fest token'ları ayrı bir işlemde ulaşır; karması kartta gösterilmez.

| Token | Ondalık | Testnet EVM'indeki ERC-20 sözleşmesi | Bank birimi (büyük/küçük harf duyarlı) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Yalnızca testnet.** Bu token'lar mainnet'te yoktur.
- **Birimi tam olarak kopyalayın.** Adres kısmı EIP-55 karışık harf biçimindedir ve birim büyük/küçük harf duyarlı olarak eşleştirilir.
- **Zincir üzerinde görün.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` üç birimi sembolleri ve görünen adlarıyla listeler.
- **MetaMask veya bir EVM DEX'ten kullanma.** Musluk bank coin'leri öder. Birini MetaMask veya bir EVM DEX için ERC-20 olarak tutmak istiyorsanız `MsgConvertCoin` ile dönüştürün (gönderen `qor1...` adresiniz, alıcı bir `0x...` adresi ve tam karışık harfli birim). Geri taşımak `MsgConvertERC20` ile yapılır. Adımlar ve gas rakamları [EVM Geliştirme](/developer-guide/evm-development#fest-tokens) sayfasındadır.
- **Havuzlar.** Testnet [AMM](/architecture/amm), bunları `uqor` karşısında havuzlayabilir; bir havuzun var olup olmadığını `GET /qorechain/amm/v1/pools` gösterir. [Cüzdan](/dashboard/wallet) sayfasının Tokens sekmesinde ve [Trade](/dashboard/trade) sayfasında bunlar için bir giriş yoktur; bir bakiyeyi `GET /cosmos/bank/v1beta1/balances/{address}` ile denetleyin.

### Test token'larıyla ne yapılır

- [Cüzdan](/dashboard/wallet) sayfasında gönderin ve alın.
- QoreSwap test token'larıyla bir [takas](/dashboard/trade) deneyin.
- Mainnet'e geçmeden önce [Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator) ile sözleşmeleri dağıtın ve test edin.
- Bir düğüm veya doğrulayıcı kurulumunu, [Düğümler ve Doğrulayıcılar](/dashboard/tools-hub) sayfasındaki araçlarla testnet'e karşı test edin.

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Hesap:** oturum açmak gereklidir. Cüzdan bağlantısı gerekmez; herhangi bir `qor1...` adresini yapıştırabilirsiniz.
- **Ağ:** Musluk, üst bilgide ne yazarsa yazsın **her zaman testnet** `qorechain-diana` üzerinde öder. Talep etmek için üst bilgiyi testnet'e geçirmeniz gerekmez. Üst bilgiyi yalnızca **View on Explorer** bağlantısı doğru ağı açsın diye testnet'e geçirin; üst bilgi mainnet'teyken bu bağlantı "Transaction Not Found" gösterir.
- **Maliyet:** ücretsiz.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağ | Hesap |
| --- | --- | --- | --- |
| Musluk sayfası | `dashboard.qorechain.io/faucet` | Yalnızca testnet `qorechain-diana` | Oturum açmak gerekli |
| Fest token üst verisi | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | Yok |

## Sınırlar ve bilinen sorunlar {#limits}

- **24 saatte bir kez 100 QOR**, hesap başına ve adres başına. Fest token'ları aynı bekleme süresine tabidir.
- **Mainnet musluğu yoktur.** Testnet QOR hiçbir zaman mainnet QOR ile değiştirilemez.
- **Form `0x` adreslerini reddeder** ve yalnızca hafif bir `qor` denetimi yapar.
- **Fest gönderimi kendi başına başarısız olabilir;** QOR yine de ödenir ve kart bunu belirtir. Yeniden denemeden önce bekleme süresini bekleyin veya bakiyenizi kontrol edin.
- **Fest token'ları** Cüzdan Tokens sekmesinde görünmez.
