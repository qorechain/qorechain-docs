---
slug: /dashboard/staking-and-validators
title: Stake ve Doğrulayıcılar
sidebar_label: Stake ve Doğrulayıcılar
sidebar_position: 8
---

# Stake ve Doğrulayıcılar

**Validators** sayfası (`/validators`) ağın doğrulayıcılarını incelemenizi sağlar — bu, cüzdan bağlantısı olmayan ve üzerinde delegasyon düğmesi bulunmayan, salt okunur bir tarayıcıdır. Asıl stake işlemleri (delegasyon, delegasyonu geri çekme, ödül talep etme) bunun yerine **Wallet** sayfasında, QoreX cüzdanınız orada bağlandıktan sonra **Stake / Delegate** ve **Rewards** sekmelerinde yer alır. Delegasyon ağın güvenliğine katkıda bulunur ve stake ödülleri kazandırır. Delegasyon ve ödüllerin arkasındaki kavramlar için bkz. [Stake ve Delegasyon](/user-guide/staking-and-delegation).

QoreChain stake işlemleri kuantum-sonrası olarak imzalanır, dolayısıyla dashboard bir delegasyonu imzalayabilecek bir anahtarı asla tutmaz. Aşağıdaki her stake işlemi aynı şekilde çalışır: isteği dashboard üzerinde oluşturursunuz (hangi doğrulayıcı, ne kadar), ardından bunu **bağlı QoreX cüzdanınızda** — uygulama veya **0.2.2 ya da sonraki bir sürümdeki** tarayıcı eklentisi — onaylar ve imzalarsınız ([nerede hangi sürümün canlı olduğuna](/qorex/overview#platform-availability) bakın; daha eski bir eklenti sürümünde Dashboard sessizce başarısız olmak yerine sizden güncelleme yapmanızı ister) — tıpkı [Gönderme akışında](/dashboard/wallet#mainnet) olduğu gibi. Dashboard yalnızca parametreleri bir `qorex://tx?...` bağlantısı üzerinden gönderir; asıl işlemi yeniden oluşturan, imzalayan ve yayınlayan QoreX'in kendisidir. Önce cüzdanınızı bağlayın — bkz. [Wallet'ı mainnet'te kullanma](/dashboard/wallet#mainnet).

Stake, delegasyon ve doğrulama işlemleri yalnızca ve sadece native (Cosmos) hat üzerinde, hibrit kuantum-sonrası imza kullanılarak gerçekleşir — hiçbir zaman bir EVM precompile'ı üzerinden değil. Bu geçici bir eksiklik değil, kalıcı bir güvenlik özelliğidir: EVM hattı tek bir ante decorator ile çalışır, bu yüzden native hattın ante'sinde bulunan doğrulayıcı-lisansı, minimum öz-bond ve PQC kontrolleri, stake işlemi orada açığa çıkarılsaydı tamamen atlanmış olurdu. MetaMask ile bağlı bir adres QOR gönderip alabilir (bkz. [Wallet'ı mainnet'te kullanma](/dashboard/wallet#mainnet)), ancak stake yapamaz — yalnızca QoreX ile bağlı bir adres stake yapabilir.

## Doğrulayıcıları inceleyin

:::caution Mainnet'te bu sayfa şu anda testnet doğrulayıcılarını gösteriyor
Mainnet'teki **Validators** sayfası, gerçek mainnet setini (8 node) değil testnet doğrulayıcı setini (4 node) gösteriyor — bu bir backend veri sorunu, bağlantınız veya hesabınızla ilgili bir şey değil. Mainnet'in doğrulayıcılarının kim olduğuna karar vermek için bu sayfayı kullanmayın; bunun yerine [block explorer'ı](https://explore.qore.network) veya doğrudan bir zincir sorgusu (`qorechaind query staking validators`) kullanın. Ancak bu yalnızca bilgi düzeyinde bir tutarsızlıktır: [Wallet sayfasının Stake sekmesindeki](/dashboard/wallet#mainnet) **Delegate** doğrulayıcı seçicisi, zincirden doğrudan farklı ve doğru bir rotayı okur, dolayısıyla mainnet'te var olmayan bir doğrulayıcıyı gerçekte seçemez veya ona delegasyon yapamazsınız — oraya vardığınızda yalnızca farklı (ve doğru) bir liste görürsünüz.
:::

Sayfa; aktif doğrulayıcı sayısı, toplam bonded QOR, ortalama komisyon ve ortalama çalışma süresi için özet kartlarıyla açılır. Bunun altında doğrulayıcı listesi yer alır. Her doğrulayıcı satırı şunları gösterir:

- Bir **sıra** ve doğrulayıcının **moniker'ı** (adı), adresi ve bir kopyalama düğmesiyle birlikte.
- **Oy gücü** — doğrulayıcının bonded stake'i ve toplam içindeki payı.
- **Komisyon** — doğrulayıcının ödüllerden aldığı yüzde.
- **APY** — bir sayı yerine bir em dash (—) olarak gösterilir. QoreChain'in emisyonu, standart getiri-tahmin uç noktasının göremediği özel bir modülden gelir, dolayısıyla burada hesaplanmış bir rakam, veri kılığına girmiş bir tahmin olurdu; bunun kullanılamaz olarak gösterilmesi bir hata değil, bilinçli bir düzeltmedir. Şu anda canlı, zincir tarafından desteklenen bir stake APY'si hesaplayan bir uç nokta yoktur — başka bir yerde gördüğünüz belirli bir yüzdeyi doğrulanmamış kabul edin ve burada ileride görünecek bir rakamın otomatik olarak doğru olduğunu varsaymayın: altta yatan formül, standart Cosmos enflasyon yolunu varsayar; oysa bu zincirin emisyonu stake edenlere gerçekte bu şekilde ulaşmaz ve güvenilmeden önce gerçek mekanizmaya karşı kontrol edilmesi gerekir.
- **Durum** — örneğin aktif veya jailed (hapsedilmiş).
- İşletimsel ayrıntılar: bölge, çalışma süresi, önerilen bloklar, yazılım sürümü ve son görülme.

Bir arama kutusu listeyi doğrulayıcı adına veya adresine göre filtreler.

Bu sayfa yalnızca doğrulayıcıları karşılaştırmak içindir. Birine gerçekten delegasyon yapmak için **Wallet** sayfasına gidin — aşağıya bakın.

## Bir doğrulayıcı seçin

Delegasyon yapacağınız bir doğrulayıcı seçerken şunları göz önünde bulundurun:

- **Komisyon** — daha düşük bir oran size daha fazla ödül bırakır, ancak sürdürülebilir operatörlerin makul bir pay alması gerekir.
- **Çalışma süresi ve durum** — güçlü çalışma süresine sahip aktif doğrulayıcıları tercih edin; jailed bir doğrulayıcı kazanç sağlamaz. Bir doğrulayıcı, 10.000 bloktan oluşan bir pencere (kabaca altı saat) içinde blokların %5'inden fazlasını imzalamayı kaçırdığında jail'e girer — jail'den çıkana kadar ne sizin ne de kendisi için hiçbir kazanç elde etmez. Bir downtime jail'i sabit **600 saniye (10 dakika)** sürer ve doğrulayıcıya stake'inin **%1**'ine mal olur; double-signing ise ayrı ve daha ciddi bir ihlaldir ve **%5** kesinti uygular. Bu rakamlar zincirin canlı, güncel parametreleridir — başka bir yerde gördüğünüz daha eski bir rakamı geçersiz sayın.
- **Oy gücü** — stake'i birden fazla doğrulayıcıya yaymak ademi merkeziyetçiliği destekler. Delegate panelinde doğrulayıcılar tam da bu nedenle en küçükten en büyüğe sıralanır.

## Delegasyon yap, yeniden delegasyon yap, delegasyonu geri çek ve ödül talep et

Bu dört işlemin tamamı Validators sayfasında değil, **Wallet** sayfasında (`/dashboard/wallet`) yer alır. Wallet'ı açın, henüz bağlamadıysanız QoreX'i bağlayın (bkz. [Wallet'ı mainnet'te kullanma](/dashboard/wallet#mainnet)), ardından delegasyon yapmak ve delegasyonu geri çekmek için **Stake / Delegate** sekmesini, talep etmek için de **Rewards** sekmesini kullanın.

### Delegasyon yap {#delegate}

1. **Wallet** sayfasında **Stake / Delegate** sekmesini seçin.
2. **Delegate QOR** panelinde üstteki bilgi kutusunu kontrol edin — bu kutu, mevcut bonded toplamınızı light-node stake eşiğiyle karşılaştırarak gösterir ve bu eşiği zaten karşılayıp karşılamadığınızı belirtir. Bu eşik, tek bir doğrulayıcıya karşı değil, **tüm doğrulayıcılar toplamında delege ettiğiniz toplam stake'inize** göre kontrol edilir, dolayısıyla bir eksiklik doğrulayıcılar arasında bölünebilir — delegasyon her zaman bir doğrulayıcıyı hedeflediğinden ve light-node uygunluğu toplamınız üzerinde ayrı bir kontrol olduğundan, doğrudan "bir light node'a delegasyon yapmanın" bir yolu yoktur.
3. **Validator** açılır menüsünü açın ve birini seçin. Doğrulayıcılar en küçük stake'ten başlayarak sıralanır.
4. Bir **Amount (QOR)** girin.
5. Tutar alanının altındaki notu okuyun: unbonding 21 gün sürer ve bonded hale geldikten sonra bu süre geçene kadar QOR taşınamaz veya satılamaz.
6. Panel, bu adreste ücreti karşılamaya yetecek harcanabilir QOR olmadığına dair bir uyarı gösteriyorsa, önce ona biraz harcanabilir QOR gönderin — vesting veya bonded coin'ler ücreti ödeyemez. Bu çözülene kadar **Continue in QoreX** düğmesi devre dışı kalır.
7. **Continue in QoreX**'e tıklayın (istek oluşturulurken **Preparing…** yazısını gösterir).
8. Panel artık bir **Open QoreX** bağlantısı ve bir istek kimliğiyle birlikte **Approve it in QoreX** gösterir. QoreX, imzalamadan önce size doğrulayıcıyı ve tutarı gösterecektir — siz orada onaylamadan hiçbir şey gönderilmez.
9. QoreX'i açın (bağlantı/deeplink bunu yapar) ve delegasyonu onaylayın. QoreX işlemi oluşturur, imzalar ve yayınlar; dashboard anahtarınızı asla görmez.

### Yeniden delegasyon yap {#redelegate}

Dashboard'ın kendisinde özel bir Redelegate paneli yok — ama artık buna ihtiyacınız yok. **QoreX'in kendisi artık stake'i doğrulayıcılar arasında doğrudan taşıyabiliyor** (uygulama 1.0.8+ ve eklenti 0.2.6+): 21 günlük unbonding beklemesi yok, kayıp ödül yok, hatta tek bir işlemde bir taşımayı birden fazla hedef doğrulayıcıya bölebiliyor. QoreX'te **Stake**'i açın, ayrılmak istediğiniz doğrulayıcıya dokunun ve stake'in nereye gideceğini seçin — tam anlatım için bkz. [Stake'i doğrulayıcılar arasında taşıma](/qorex/portfolio-and-staking#move-stake). Bu, dashboard'ın kendi istek sözleşmesinin sunabileceği herhangi bir şeyden daha iyi bir çözümdür, bu yüzden aşağıdaki geçici çözüm yerine bunun için doğrudan QoreX'i kullanın.

Henüz bu özelliğe sahip olmayan eski bir QoreX sürümündeyseniz, bu sayfadaki akışları kullanarak bir stake'i farklı bir doğrulayıcıya iki adımda taşıyın:

1. Ayrılmak istediğiniz doğrulayıcıdan tutarı **[Delegasyonu geri çekin](#undelegate)**.
2. O akışta gösterilen unbonding süresinin dolmasını bekleyin — bu süre boyunca QOR taşınamaz veya kazanç sağlamaz.
3. Unbonded QOR tekrar harcanabilir hale geldiğinde, onu yeni doğrulayıcıya **[delege edin](#delegate)**.

Bu geçici çözüm 21 günlük kayıp ödüle ve doğrudan bir taşımadan daha fazla ücrete mal olur, bu yüzden mümkünse buna güvenmek yerine QoreX'i güncelleyin.

### Delegasyonu geri çek {#undelegate}

Bir delegasyondan çıkmak artık dashboard üzerinden mümkün — bir süre boyunca buradan delegasyon yapmak mümkün olsa da unbond etmek hiç mümkün değildi, bu yüzden bunun eksik olduğunu hatırlıyorsanız sebebi budur.

:::caution 21 günlük unbonding süresi
Delegasyonu geri çekilen QOR bugün elinize ulaşmaz. Önce **21 günlük bir unbonding süresine** girer; bu süre boyunca hiçbir ödül kazanmaz ve taşınamaz veya satılamaz. Panel bunu kasıtlı olarak iki kez belirtir — biri alt başlığında, diğeri onay düğmesinin hemen üzerinde — çünkü bu ekrana aceleyle ulaşan biri (düşen bir piyasa, jailed bir doğrulayıcı) tam olarak imzalamadan önce bunu görmesi en çok gereken kişidir.
:::

1. **Wallet** sayfasında **Stake / Delegate** sekmesini seçin ve Delegate'in altındaki **Unbond QOR** paneline kaydırın. Alt başlığı zaten yukarıdaki 21 günlük unbonding uyarısını yineler.
2. Bu adresten aktif bir delegasyonunuz yoksa, panel bunu belirtir ve burada durur.
3. **Unbond from** açılır menüsünü açın ve azaltmak istediğiniz delegasyonu seçin — burada yalnızca gerçekten delegasyon yaptığınız doğrulayıcılar listelenir, her biri bonded tutarıyla birlikte gösterilir.
4. Unbond etmek için bir **Amount (QOR)** girin veya o doğrulayıcı için tam bonded tutarı doldurmak üzere **Unbond all `<amount>` QOR**'a tıklayın.
5. O doğrulayıcıya bonded olandan daha fazlasını girerseniz, panel bunu size bildirir ve gönderimi engeller.
6. Onay düğmesinin hemen üzerinde uyarı ikinci kez görünür: QOR bugün değil, 21 gün içinde ulaşır ve o zamana kadar hiçbir kazanç sağlamaz. Bu kasıtlı bir tekrardır, dokümantasyon hatası değil — devam etmeden önce tekrar okuyun.
7. Adres ücreti karşılayamıyorsa (bonded coin'ler bunu ödeyemez — önce burada biraz harcanabilir QOR'a ihtiyacınız var), panel sizi uyarır ve düğmeyi devre dışı bırakır.
8. **Continue in QoreX**'e tıklayın (istek oluşturulurken **Preparing…**).
9. Panel, bir **Open QoreX** bağlantısı ve bir istek kimliğiyle **Approve it in QoreX** gösterir — QoreX, imzalamadan önce size doğrulayıcıyı ve tutarı gösterir.
10. QoreX'i açın ve onaylayın. İşlemi imzalar ve yayınlar; QOR yalnızca 21 günlük unbonding süresi sona erdikten sonra tekrar harcanabilir hale gelir.

### Ödülleri talep et {#claim}

1. **Wallet** sayfasında **Rewards** sekmesini seçin.
2. **Staking rewards** paneli, delegasyon yaptığınız her doğrulayıcı genelinde birikmiş ödüllerinizi okur. Bu adresten hiçbir şey stake edilmemişse, panel bunu belirtir ve talep edilecek bir şey yoktur.
3. Aksi halde, talep edilmeyi bekleyen toplam tutarı ve her doğrulayıcı için birikmiş tutarın satır satır dökümünü gösterir. Ödüller sürekli birikir ve beklemekle asla kaybedilmez — bir son tarih yoktur.
4. **Claim in QoreX**'e tıklayın. Bu, tek bir istekte gösterilen tüm doğrulayıcılardan biriken ödülleri talep eden bir "tümünü talep et" işlemidir — doğrulayıcı başına ayrı bir talep düğmesi yoktur.
5. Talebi imzalayıp yayınlamak için QoreX'te (**Open QoreX** bağlantısı üzerinden) onaylayın.

:::note Unbonding süresi
Delegasyonu geri çekilen QOR, tekrar harcanabilir hale gelmeden önce 21 günlük bir unbonding sürecinden geçer ve bu süre boyunca ödül kazanmaz. Ayrıntılar için bkz. [Stake ve Delegasyon](/user-guide/staking-and-delegation).
:::

## İlgili

- [Stake ve Delegasyon](/user-guide/staking-and-delegation) — kapsamlı stake kavramları.
- [Wallet'ı mainnet'te kullanma](/dashboard/wallet#mainnet) — stake yapmadan önce QoreX'i bağlayın.
- [Explorer Validators](/dashboard/explorer#validators) — cüzdan olmadan doğrulayıcılara göz atın.
- [Tools Hub](/dashboard/tools-hub) — kendi doğrulayıcınızı çalıştırmak için başvurun.
