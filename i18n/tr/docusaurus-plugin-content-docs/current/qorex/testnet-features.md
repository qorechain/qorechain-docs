---
slug: /qorex/testnet-features
title: Testnet Özellikleri
sidebar_label: Testnet Özellikleri
sidebar_position: 10
---

# Testnet Özellikleri

:::caution YALNIZCA TESTNET
Bu sayfadaki her şey **yalnızca QoreChain testnet'inde** (`qorechain-diana`) çalışır. **Bunların hiçbiri mainnet'te yoktur.** Testnet token'larının hiçbir değeri yoktur. Aşağıdaki ekranlar, mainnet'teyken QoreX'te görünmez.
:::

QoreX'te önce testnet'te sınanan birkaç özellik vardır. Bunlar yalnızca testnet etkinken gösterilir ve her ekran bunu **TESTNET: yalnızca test token'ları, gerçek QOR değil** bandıyla belirtir.

## Yenilikler {#innovations}

- **Siz imzalamadan önce ağ onaylar (yalnızca testnet).** Başka bir zincire yapılacak bir transfer için QoreX önce ağdan kanalı ve karşı tarafını onaylamasını ister. Ağ onaylayamazsa hiçbir şey gönderilmez.
- **Gerçek rota durumu (yalnızca testnet).** Köprü ekranı, ağın her rota hakkında bizzat ne söylediğini gösterir ve ağın sunmadığı hiçbir şeyi sunmaz.
- **QoreChain üzerinde Solana biçiminde işlemler (yalnızca testnet).** ML-DSA-87 imzanızla açtığınız bir SVM penceresi, kendi Solana anahtarınızın katı sınırlar içinde işlem yapmasına izin verir.

## QoreX'te testnet'e nasıl ulaşılır {#reach-testnet}

- **Mobil uygulama:** **Ayarlar**'ı açın ve **Testneti kullan (geliştiriciler)** anahtarını açın. Uygulama, yeniden başlatmaya gerek kalmadan hemen `qorechain-diana`'ya geçer. Varsayılan her zaman mainnet'tir. Geri dönmek için anahtarı kapatın.
- **Tarayıcı uzantısı:** **Geliştirici modu** bölümünü ortaya çıkarmak için açılır pencerenin altındaki sürüm numarasına yedi kez dokunun, ardından **Testnet'e geç (diana)** düğmesine dokunun. Aynı bölümdeki **Mainnet'e geri dön** sizi geri getirir.

Testnet etkinken, aşağıdaki yalnızca testnet'e özgü ekranlar uygulamanın **Ayarlar** bölümünde ve eklentinin açılır penceresinde (**Başka bir zincire gönder** ve **Köprü**) görünür; **QoreChain üzerinde Solana** aracı ise Geliştirici sekmesinin veya Geliştirici araçları sayfasının altında görünür. Testnet bakiyelerinde dolar değeri gösterilmez. dApp'ler ağı değiştiremez; bunu yalnızca siz yapabilirsiniz.

## Test QOR'u alın {#get-test-qor}

Testnet QOR'u ücretsizdir ve hiçbir değeri yoktur. [Dashboard Musluğu](/dashboard/faucet) üzerinden alın: orada oturum açın, testnet adresinizi QoreX'ten kopyalayın (**Testnet Çalışma Alanı** geliştirici aracında bir **Adresi kopyala** düğmesi ve bir **Testnet musluğunu aç** düğmesi vardır) ve token isteyin. Herkese açık testnet uç noktaları için ayrıca [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) sayfasına bakın.

## Başka bir zincire gönderme (IBC) {#ibc}

**YALNIZCA TESTNET.** QoreChain testnet'inden **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** ve **Celestia** testnet'lerine QOR gönderin ve geri getirin.

QoreX sizin için şunları yapar:

- **Önce rotayı kontrol eder.** İmzalayabilmenizden önce QoreX ağdan kanalın açık olduğunu ve hâlâ seçtiğiniz zincire gittiğini onaylamasını ister. Kanal kapalıysa, değişmişse veya onaylanamıyorsa QoreX bunu söyler ve hiçbir şey göndermez.
- **İncelemenin tamamını gösterir.** İmzalamadan önce göndereni, diğer zincirdeki alıcıyı, ağ ücretini ve zamanlamayı görürsünüz.
- **Zamanlama.** Cosmos Hub testnet'ine yapılan bir test transferi yaklaşık 20 saniyede ulaştı. QoreX yaklaşık bir dakika beklemenizi söyler. 10 dakika içinde teslim edilmezse size geri döner.
- **Hangi imza.** QoreChain'den yapılan bir transfer hibrit anahtarınızla (ML-DSA-87 ve secp256k1) imzalanır. Geri dönüş, diğer zincirde o zincirin gerektirdiği gibi klasik bir anahtarla imzalanır ve inceleme ekranı bunu söyler: o zincirde bu coin'ler yalnızca klasik bir anahtarla korunur.

### QoreChain'den gönderme {#ibc-send}

1. Testnet'i açın ([yukarıya](#reach-testnet) bakın), **Ayarlar**'ı (eklentide: açılır pencereyi) açın ve **Başka bir zincire gönder** seçeneğine dokunun.
2. **Hedef zincir** ve **Varlık** (QOR veya IBC üzerinden gelen coin'ler) seçin.
3. **Tutar** girin. **Alıcı** alanı o zincirdeki kendi adresinizle önceden doldurulur; değiştirebilirsiniz. QoreX bunun o zincir için geçerli bir adres olduğunu kontrol eder.
4. **İncele** düğmesine dokunun, **İmzalamadan önce kontrol et** altındaki ayrıntıları kontrol edin, ardından **İmzala ve gönder** düğmesine dokunun.

### Coin'leri geri getirme {#ibc-back}

1. **Başka bir zincire gönder** ekranında **QoreChain'e geri getir** bölümünü açın ve kullandığınız zincirde **Show my balances** düğmesine dokunun.
2. **Geri getirilecek varlık** seçimini yapın. Ücreti ödemek için o zincirdeki hesabın o zincirin kendi coin'inden biraz bulundurması gerekir; eksikse QoreX size söyler.
3. İnceleyin, ardından **İmzala ve geri getir** düğmesine dokunun. Coin'ler kendi QoreChain adresinize teslim edilir.

### Bir transferi izleme {#ibc-track}

**Transferlerin** bölümü her transferi listeler ve izler: ağ bekleniyor, yolda, teslim edildi veya size geri döndü (nedeniyle birlikte ya da zaman aşımına uğradığı için). Yeniden okumak için **Yenile** düğmesine dokunun. Durum henüz bilinmiyorsa QoreX tahmin yürütmek yerine teslim edildiğinin onaylanmadığını söyler.

## Köprü ekranı {#bridge}

**YALNIZCA TESTNET.** **Köprü** ekranı QoreChain Bridge rotalarını ağdan okur ve her rotanın gerçek durumunu gösterir: henüz açılmadı, duraklatıldı, şimdilik kapalı, açık, çekimlere açık veya yatırımlara açık. Bir rota yalnızca ağın kendisi açık olduğunu söylediğinde sunulur.

**Bugün testnet'te tüm rotalar kapalıdır, bu yüzden hiçbir şey sunulmaz.** Ekran, rotaların açılacağı zaman için hazırdır. Buradaki hiçbir şey şu anda kullanabileceğiniz bir rota, varlık veya tutar değildir ve hiçbir şey mainnet'te değildir.

## QoreChain üzerinde Solana {#solana-on-qorechain}

**YALNIZCA TESTNET.** SVM lane'i, QoreChain üzerinde Solana biçimindeki işlemleri çalıştırır. Bu bir Geliştirici modu aracıdır ve yalnızca testnet etkinken gösterilir. Mainnet'te SVM lane'i açık değildir ve buradaki hiçbir şey kullanılamaz.

Aracın yaptıkları:

- **Lane'i gösterir.** SVM lane'inin ağda çalışıp çalışmadığını ve cluster'ını.
- **SVM pencerenizi gösterir.** Bir pencere, Solana anahtarınızla imzalanan işlemlerin, sınırlar dahilinde, ML-DSA-87 imzası olmadan hesabınızdan harcama yapmasına izin verir. QoreX açık bir pencere olup olmadığını, kaç blok, işlem ve QOR kaldığını, hangi Solana anahtarının bağlı olduğunu ve hangi programları kabul ettiğini gösterir.
- **Pencere açar ve kapatır.** Bir pencere açarken hangi programları kabul edeceğini (bunları listelemeniz önerilir; **Her program** seçeneği bir uyarı taşır), kaç blok açık kalacağını (en fazla 17,280), işlem sayısını (en fazla 1,000) ve harcayabileceği en yüksek QOR miktarını seçersiniz. Bağlanan anahtar, kurtarma ifadenizin 0 indeksindeki Solana anahtarıdır. Bir pencere açmak mevcut pencerenizin yerini alır. Ekrandaki uyarı geçerlidir: pencereyi küçük ve kısa tutun ve işiniz bittiğinde **Pencereyi kapat** ile kapatın.
- **İmzalanmış bir Solana işlemini iletir.** Bir geliştirici aracından aldığınız wire baytlarını (base64 veya base58) yapıştırın ve **Oku** düğmesine dokunun. QoreX programları ve hangi imzacıların imzaladığını gösterir ve yalnızca tamamen imzalanmış işlemleri iletir. QoreChain hesabınız zarfı ML-DSA-87 ile imzalar ve ücretini öder; Solana işlemi üzerinde hiçbir yetki kazanmaz.

Nasıl kullanılır: testnet'i ve Geliştirici modunu açın, Geliştirici sekmesinden (veya eklentinin Geliştirici araçları sayfasından) **QoreChain üzerinde Solana** aracını açın, ardından yukarıdaki bölümleri kullanın. [Geliştirici Modu](/qorex/developer-mode#contracts) üzerinden SVM programlarına yapılan sözleşme çağrıları da yalnızca testnet'te çalışır.

SVM lane'inin zincir tarafı için [testnet'te SVM](/developer-guide/svm-testnet-v329) ve [SVM lane'i](/developer-guide/svm-lane-v328) sayfalarına bakın.

## Mainnet'te olmayanlar {#not-on-mainnet}

- QoreX'ten IBC üzerinden başka zincirlere gönderme.
- QoreChain Bridge ekranı ve rotaları.
- SVM pencereleri ve iletim dahil QoreChain üzerinde Solana.

QoreX bu ekranları yalnızca testnet'te gösterir ve her birinde bunu belirtir.
