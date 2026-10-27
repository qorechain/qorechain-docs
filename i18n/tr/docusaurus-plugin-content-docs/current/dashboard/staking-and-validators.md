---
slug: /dashboard/staking-and-validators
title: Stake ve Doğrulayıcılar
sidebar_label: Stake ve Doğrulayıcılar
sidebar_position: 8
---

# Stake ve Doğrulayıcılar

Bu sayfa Dashboard'dan stake işlemini kapsar: QOR'unuzu bir doğrulayıcıya delege etme, unbond etme ve ödülleri talep etme. İşlemler **mainnet**'te, QoreX cüzdanınız bağlıyken **Wallet** sayfasında (**Stake / Delegate** ve **Rewards** sekmeleri) yer alır. Önce doğrulayıcıları karşılaştırmak için salt okunur [Doğrulayıcılar](/dashboard/validators) sayfasını kullanın. Delegasyon ve ödüllerin arkasındaki kavramlar için bkz. [Stake ve Delegasyon](/user-guide/staking-and-delegation).

## Yenilikler {#innovations}

- **Dashboard hiçbir zaman bir stake anahtarı tutmaz.** İsteği (hangi doğrulayıcı, ne kadar) Dashboard üzerinde oluşturursunuz; QoreX onu yeniden oluşturur, gösterir, ML-DSA-87 hibrit imzasıyla imzalar ve yayınlar. Dashboard yalnızca parametreleri bir `qorex://tx?...` bağlantısı üzerinden gönderir ve yalnızca işlem hash'ini öğrenir. Akış, [Gönderme akışıyla](/dashboard/wallet#send-mainnet) aynıdır.
- **Yalnızca native hat, kalıcı olarak.** Stake, delegasyon ve doğrulayıcı işlemleri yalnızca hibrit kuantum sonrası imzayla native (Cosmos) hatta gerçekleşir, asla bir EVM precompile'ı üzerinden değil. MetaMask ile bağlı bir adres QOR alabilir ve açık bir EVM penceresiyle gönderebilir, ancak stake yapamaz. Yalnızca QoreX ile bağlı bir adres yapabilir.
- **Doğrulayıcı sıralaması stake'i yayar.** Yalnızca bonded ve jailed olmayan doğrulayıcılar listelenir, en küçük önce. İlk sıra, sunucuda küçük yarıdan rastgele çekilir; bu nedenle en büyük doğrulayıcı asla varsayılan olmaz.
- **Light-node eşiği tek bir toplamdır.** "Currently bonded" değeri, light-node stake eşiğine karşı, tüm doğrulayıcılarınız birlikte sayılarak gösterilir; böylece bir eksiklik doğrulayıcılar arasında bölünebilir.
- **Unbonding süresi önemli olduğu yerde gösterilir.** 21 günlük unbonding süresi zincirden okunur ve Delegate'te bir kez, Unbond'da iki kez gösterilir; bu kasıtlıdır, çünkü insanların buna en çok ihtiyaç duyduğu yer burasıdır.
- **İmzalamadan önce ücret kontrolü.** Panel harcanabilir QOR'unuzu okur (vesting ve bonded coin'ler hariç) ve ücret ödenebilene kadar **Continue in QoreX** düğmesini devre dışı tutar.

## Nasıl kullanılır {#how-to-use}

Ön koşullar: oturum açmış olmak, üst bilginin **Mainnet**'te olması, [onayın](/dashboard/overview#risk-acknowledgement) kabul edilmiş olması ve [Wallet'ı mainnet'te kullanma](/dashboard/wallet#mainnet) bölümünde anlatıldığı gibi bir QoreX cüzdanının bağlı olması.

### Bir doğrulayıcı seçin

Komisyonu, oy gücünü ve durumu karşılaştırmak için [Doğrulayıcılar](/dashboard/validators) sayfasını açın. Sayfa Dashboard'da `/validators` adresindedir: oturum açmış olmanızı gerektirir, kenar çubuğunda bağlantısı yoktur (adresi yazın veya buradaki bağlantıyı izleyin) ve üst bilgide seçili ağı izler. APY sütunu zincirden okunur ve "variable, not guaranteed, lock bonuses not included" notunu taşır (veya "From fees" yazar); hiçbir rakam vaat edilmez. Birini seçerken şunları göz önünde bulundurun:

- **Komisyon:** daha düşük bir oran size daha fazla ödül bırakır, ancak sürdürülebilir operatörlerin makul bir pay alması gerekir.
- **Durum:** bir doğrulayıcı, 10.000 bloktan oluşan bir pencerede blokların %5'inden azını imzaladığında jailed olur; bu, mainnet'te blok başına yaklaşık 3,1 saniyeyle yaklaşık 8,3 saatlik kaçırılmış blok demektir. Bir downtime jail'i sabit **600 saniye** sürer ve doğrulayıcıya stake'inin **%1**'ine mal olur; double-signing ise ayrı ve daha ciddi bir ihlaldir ve **%5** kesinti uygular. Bunlar zincirin canlı parametreleridir (27 Ekim 2026'da kontrol edildi).
- **Oy gücü:** stake'i doğrulayıcılara yaymak ademi merkeziyetçiliği destekler. Delegate panelinin sıralaması buna yardımcı olur.

### Delege et {#delegate}

1. **Wallet** sayfasında **Stake / Delegate** sekmesini açın ve **Delegate QOR** panelini bulun.
2. Bilgi kutusunu okuyun: **Currently bonded** değeri **Light-node threshold** değerine karşı ve eşiği karşılayıp karşılamadığınız. Eşik, tüm doğrulayıcılar genelindeki toplam delege edilmiş stake'inize göre kontrol edilir. Doğrudan "bir light node'a delegasyon yapmanın" bir yolu yoktur: delegasyon her zaman bir doğrulayıcıyı hedefler ve light-node uygunluğu toplamınız üzerinde ayrı bir kontroldür.
3. **Validator** açılır menüsünü açın ve birini seçin. İlk giriş, doğrulayıcıların küçük yarısından rastgele çekilir ve sayfayı yeniden yüklediğinizde değişebilir; geri kalanlar en küçük stake önce olacak şekilde listelenir. Jailed doğrulayıcılar sunulmaz.
4. Bir **Amount (QOR)** girin.
5. Tutarın altındaki notu okuyun: unbonding 21 gün sürer ve bonded QOR bu süre geçene kadar taşınamaz veya satılamaz.
6. Panel, adreste ücret için yeterli harcanabilir QOR olmadığı uyarısını veriyorsa, önce ona biraz harcanabilir QOR gönderin. Bu çözülene kadar **Continue in QoreX** devre dışı kalır.
7. **Continue in QoreX**'i seçin (istek oluşturulurken **Preparing...** yazar).
8. Panel, **Open QoreX**, istek kimliği ve eklenti algılandığında **Approve in the browser extension** ile birlikte "Approve it in QoreX" gösterir. QoreX imzalamadan önce doğrulayıcıyı ve tutarı gösterir; siz onaylamadan hiçbir şey gönderilmez.
9. QoreX'te onaylayın. QoreX delegasyonu oluşturur, imzalar ve yayınlar.

**Minimal örnek:** listelenen ilk doğrulayıcıya 10 QOR delege edin ve QoreX'te onaylayın.

:::note Zaman kilitli stake Dashboard'un parçası değildir
v3.2.4 sürümü isteğe bağlı bir zaman kilitli stake modülü ekler (mainnet'te 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri); bkz. [Zaman kilitli stake](/user-guide/staking-and-delegation#time-locked-staking). Ne Dashboard'da ne de QoreX'te bunun için bir ekran bulunur. Burada yapılan delegasyonlar, kilitlenme içermeyen sıradan delegasyonlardır; tek bekleme, çıkışta 21 günlük unbonding'dir.
:::

### Yeniden delege et {#redelegate}

Dashboard'da Redelegate paneli yoktur. **QoreX stake'i doğrulayıcılar arasında doğrudan taşır** (uygulama 1.0.8+ ve eklenti 0.2.6+): 21 günlük unbonding beklemesi yok, kayıp ödül yok ve bir taşımayı tek bir işlemde birden fazla hedef doğrulayıcıya bölebilir. QoreX'te **Stake**'i açın, ayrılmak istediğiniz doğrulayıcıya dokunun ve stake'in nereye gideceğini seçin; bkz. [Stake'i doğrulayıcılar arasında taşıma](/qorex/portfolio-and-staking#move-stake).

Bu özelliği olmayan eski bir QoreX sürümünde, stake'i bunun yerine iki adımda taşıyın: [undelegate](#undelegate), unbonding süresinin dolmasını bekleyin (QOR bu sürede ne taşınabilir ne de kazanç sağlar), ardından yeni doğrulayıcıya [delege edin](#delegate). Bu geçici çözüm 21 günlük ödüle ve daha fazla ücrete mal olur, bu yüzden mümkünse QoreX'i güncelleyin.

### Undelegate {#undelegate}

:::caution 21 günlük unbonding süresi
Undelegate edilen QOR bugün elinize ulaşmaz. Önce **21 günlük bir unbonding süresine** girer; bu süre boyunca hiçbir ödül kazanmaz ve taşınamaz veya satılamaz. Panel bunu bilerek iki kez belirtir: bir kez alt başlığında, bir kez de onay düğmesinin hemen üzerinde.
:::

1. **Wallet** sayfasında **Stake / Delegate**'i açın ve Delegate'in altındaki **Unbond QOR** paneline kaydırın.
2. Bu adresten aktif bir delegasyonunuz yoksa, panel bunu belirtir ve burada durur.
3. **Unbond from**'u açın ve azaltılacak delegasyonu seçin. Yalnızca delege olduğunuz doğrulayıcıları, bonded tutarla birlikte listeler.
4. Bir tutar girin veya tam bonded tutarı doldurmak için **Unbond all X QOR**'u seçin.
5. Bonded olandan fazlasını girmek gönderimi engeller.
6. Onay düğmesinin üzerindeki ikinci uyarıyı okuyun: QOR bugün değil, 21 gün içinde ulaşır.
7. Adres ücreti karşılayamıyorsa (bonded coin'ler bunu ödeyemez), panel uyarır ve düğmeyi devre dışı bırakır.
8. **Continue in QoreX**'i seçin (istek oluşturulurken **Preparing...**), ardından **Open QoreX** üzerinden veya **Approve in the browser extension** ile QoreX'te onaylayın.

QOR yalnızca 21 günlük unbonding süresi bittikten sonra tekrar harcanabilir hale gelir.

### Ödülleri talep et {#claim}

1. **Wallet** sayfasında **Rewards** sekmesini açın.
2. **Staking rewards** paneli, delege olduğunuz her doğrulayıcı genelindeki birikmiş ödüllerinizi okur. Bu adresten hiçbir şey stake edilmemişse, bunu belirtir.
3. Aksi halde bekleyen toplamı ve doğrulayıcı başına bir satır gösterir. Ödüller sürekli birikir ve beklemekle kaybolmaz.
4. **Claim in QoreX**'i seçin. Bu, **tüm** doğrulayıcılardan aynı anda talep eder; doğrulayıcı başına talep yoktur.
5. Talebi QoreX'te onaylayın (**Open QoreX** veya **Approve in the browser extension**).

## Nasıl erişilir {#how-to-access}

- **Nerede:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), **Stake / Delegate** ve **Rewards** sekmeleri. Oturum açmak gereklidir.
- **Ağ:** yalnızca mainnet, bağlı bir QoreX cüzdanıyla. Testnet cüzdanlarının stake ekranı yoktur.
- **Cüzdan:** QoreX (uygulama veya eklenti). Keplr ve MetaMask, Dashboard'dan stake yapamaz.
- **Maliyetler:** harcanabilir QOR'dan ödenen ağ ücreti (gas başına en az 0,1 uqor). Dashboard hiçbir şey almaz.
- **Fonlar:** vesting bakiyeleri delege edebileceğiniz tutara sayılır ancak ücreti ödeyemez.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağ |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Doğrulayıcıları karşılaştırma | `dashboard.qorechain.io/validators`, bkz. [Doğrulayıcılar](/dashboard/validators) | Üst bilgideki ağı izler |
| Stake'i doğrulayıcılar arasında taşıma | QoreX, bkz. [Portföy ve Stake](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Sınırlar ve bilinen sorunlar {#limits}

- **Dashboard'da yok:** yeniden delegasyon (QoreX'i kullanın) ve zaman kilitli stake.
- Dashboard'da **testnet cüzdanları için stake yok**.
- **Tahminler yaklaşıktır:** panelde gösterilen ücret tahmini ve light-node eşiği, o anda zincirden okunmayan, Dashboard'a gömülü değerlerdir. QoreX, imzalamadan önce kesin ücreti gösterir.
- **Unbonding 21 gündür** ve kısaltılamaz.
- **Claim, tümünü talep etmedir.**

## İlgili

- [Doğrulayıcılar](/dashboard/validators) - doğrulayıcıları, komisyonu ve değişken getiriyi karşılaştırın.
- [Stake ve Delegasyon](/user-guide/staking-and-delegation) - kapsamlı stake kavramları.
- [Wallet'ı mainnet'te kullanma](/dashboard/wallet#mainnet) - stake yapmadan önce QoreX'i bağlayın.
- [Explorer Doğrulayıcıları](/dashboard/explorer#validators) - cüzdan olmadan doğrulayıcılara göz atın.
- [Düğümler ve Doğrulayıcılar](/dashboard/tools-hub) - kendi doğrulayıcınızı çalıştırmak için başvurun.
