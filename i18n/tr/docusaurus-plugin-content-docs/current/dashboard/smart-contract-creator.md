---
slug: /dashboard/smart-contract-creator
title: Akıllı Sözleşme Oluşturucu
sidebar_label: Akıllı Sözleşme Oluşturucu
sidebar_position: 6
---

# Akıllı Sözleşme Oluşturucu

**Akıllı Sözleşme Oluşturucu**, **QCAI** tarafından desteklenerek, sade bir dilde verilen açıklamadan akıllı sözleşmeler üretir. Ne istediğinizi anlatın, hedef blok zincirinizi seçin ve QCAI sözleşmeyi sizin için yazsın. Yapay zeka araçları için **17 blok zinciri** desteklediğinden, geliştirme yaptığınız ekosistemi hedefleyebilirsiniz.

Bunu **hesap olmadan** deneyebilirsiniz: ilk kez gelen bir ziyaretçi bir ücretsiz üretim hakkı alır ve sözleşmenin tamamını görür. Bir sonraki üretim için, kaydetme, denetleme ve dağıtma ile birlikte ücretsiz bir hesap gerekir; ücretsiz denemeniz kullanıldıktan sonra sayfa **Ücretsiz hesap oluştur** seçeneğini sunar.

Ürettiğiniz sözleşmeleri kaydetmek ve yönetmek için oturum açın — bkz. [Oturum açma](/dashboard/overview#sign-in).

## Bir sözleşme üretin

1. **Bir örnekle başlayın veya kendinizinkini tanımlayın.** Sayfa "What would you like to build?" ile açılır. **Or start from an example:** altında **Token**, **NFT collection**, **Locked vault** veya **2-of-3 multisig** öğelerinden birini seçin — her biri eksiksiz bir açıklama doldurur ve uygun bir blok zinciri ile şablon seçer — ya da kendi açıklamanızı **Contract Description** alanına yazın. Ne kadar spesifik olursanız, sonuç o kadar iyi olur.
2. **Blok zincirini seçin.** **Target Blockchain** öğesini kullanın. Seçiminize ait sözleşme dili ve kategorisi, seçicinin yanında gösterilir.
3. **Bir sözleşme türü seçin** (isteğe bağlı). **Contract Type**, token, NFT veya yönetişim sözleşmesi gibi bir başlangıç şablonu sunar; yalnızca açıklamanıza güvenmek için bunu **Custom (describe in prompt)** üzerinde bırakın.
4. **Üretin.** **Generate Smart Contract** öğesini seçin. QCAI sözleşmeyi üretirken bir ilerleme göstergesi durumu gösterir.

## Sonucu inceleyin

Üretim tamamlandığında, Kontrol Paneli sözleşmeyi söz dizimi vurgulamalı bir görünümde, sözleşme adı, blok zinciri, dil, dosya boyutu ve üretildiği zaman gibi ayrıntılarla birlikte gösterir. Kullandığınız istem, referans olması için sonuçla birlikte gösterilir.

Buradan şunları yapabilirsiniz:

- Sözleşme kodunu panonuza **kopyalayın** (**Copy Code**).
- Sözleşmeyi **PDF olarak dışa aktarın** (**Export PDF**).
- Sözleşmeyi, seçtiğiniz blok zinciri için doğru biçimde bir dosya olarak **indirin** (**Download File**).
- Sözleşmeyi daha da iyileştirmek için **düzenleyin** (**Edit Contract**).

## Sözleşmenizi dağıtın {#deploy}

### Mainnet üzerinde (EVM) — emanetsiz dağıtım {#deploy-mainnet}

Mainnet dağıtımı emanetsizdir (non-custodial): Kontrol Paneli sözleşmenizi derler ve **imzasız** dağıtım verisini döndürür — anahtarlarınızı asla tutmaz ve sizin adınıza asla imza atmaz. Dağıtımı kendi cüzdanınızda imzalayıp yayınlarsınız; ardından Kontrol Paneli ortaya çıkan sözleşmeyi kaydeder.

1. Dağıtmak istediğiniz sözleşmeyi (EVM hedefli bir sözleşme) açın ve **Mainnet** üzerinde **Deploy** öğesini seçin. Bu, ilk mainnet işleminizse [tek seferlik risk onayını](/dashboard/overview#risk-acknowledgement) kabul edin.
2. Henüz bağlı değilse **MetaMask**'i bağlayın — bkz. [Genel Bakış ve Başlangıç](/dashboard/overview#connect-your-wallet). Zincir v3.2.0'dan itibaren EVM şeridi ayrıca hesabın kayıtlı bir kuantum sonrası anahtara ve QoreX'ten açılan **açık bir EVM yetkilendirme penceresine** sahip olmasını gerektirir (bkz. [MetaMask ile Gönderme](/dashboard/wallet#send-metamask)); biri olmadan zincir dağıtımı reddeder.
3. Kontrol Paneli sözleşmeyi derler ve imzasız dağıtım işlemini cüzdanınıza iletir.
4. İşlemi MetaMask'te inceleyin — ağ, gas ve veri — ardından imzalayıp kendiniz yayınlamak için onaylayın.
5. Dağıtım zincir üzerinde onaylandığında, Kontrol Paneli ortaya çıkan sözleşme adresini kayıtlı sözleşmelerinizin yanına kaydeder.

Kontrol Paneli'nden yalnızca **EVM** (Solidity) sözleşmeleri dağıtılabilir. QoreChain Native ve Solana programı dağıtımları şu anda her iki ağda da kullanılamamaktadır.

### Testnet üzerinde — tek tıkla {#deploy-testnet}

Testnet üzerinde, Kontrol Paneli tarafından yönetilen test cüzdanı bir EVM dağıtımını sizin için tek tıkla imzalar ve gönderir; böylece mainnet'e geçmeden önce [Faucet](/dashboard/faucet) tokenlarıyla hızlıca yineleme yapabilirsiniz. Testnet, mainnet ile aynı EVM şeridi kuralını uygular; bu nedenle hesapta kuantum sonrası anahtar veya açık bir EVM penceresi yoksa bir dağıtım yine de reddedilebilir.

## Paylaşın ve yeniden kullanın

Üretilen her sözleşmenin kendi sayfası vardır. Sözleşmeler **varsayılan olarak özeldir**: kendinizinkini yalnızca siz açabilirsiniz. Sahibi olarak sözleşme sayfasında bir **Public** / **Private** düğmesi göreceksiniz; bağlantıya sahip herkesin sözleşmeyi açabilmesi (ve fork edebilmesi) için **Public** olarak ayarlayın, geri çekmek için tekrar **Private** yapın. Size ait olmayan herkese açık bir sözleşmeyi açarsanız, kendi kopyanızı başlatmak ve oradan devam etmek için onu **fork** edebilirsiniz (çatallayabilirsiniz).

:::tip Her zaman inceleyin ve test edin
QCAI tarafından üretilen kod, sağlam bir başlangıç noktasıdır, incelemenin yerine geçmez. Değerli bir şey dağıtmadan önce sözleşmeyi okuyun, [testnet](/getting-started/connecting-to-testnet) üzerinde test edin ve [Contract Auditor](/dashboard/contract-auditor) üzerinden geçirin.
:::

## İlgili

- [Contract Auditor](/dashboard/contract-auditor) — bir sözleşme üzerinde QCAI güvenlik analizi çalıştırın.
- [Geliştirici Kılavuzu](/developer-guide/evm-development) — sözleşmeleri QoreChain'in çalışma zamanlarına dağıtma.
