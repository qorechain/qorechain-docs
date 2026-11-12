---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Genel bakış
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day**, #BuildBeforeQDay etiketiyle [build.qorechain.io](https://build.qorechain.io) adresinde çevrimiçi yürütülen QoreChain geliştirici festivalidir. Geliştiriciler bir seviye seçer, açık kaynak kitlerle QoreChain testnet üzerinde geliştirir, herkese açık şekilde paylaşır ve projesini bir jüriye ve topluluğa sunar. Festivalin yanında haftada bir teknik workshop vardır. Her workshop'un bu bölümde, ilk komuttan sonuncuya kadar eksiksiz bir adım adım kılavuzu bulunur; böylece geliştirmeye yeni olsanız bile her şeyi kendi hızınızda, kendi bilgisayarınızda yapabilirsiniz. Örnek uygulamalar herkese açık [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) deposunda toplanmıştır.

## Yenilikler {#innovations}

Bu bölümdeki her workshop, QoreChain'i farklı kılan özellikler etrafında kurulmuştur:

- **Hibrit imzalama.** Bir işlem iki kez imzalanır: bir kez klasik bir secp256k1 anahtarıyla, bir kez post-kuantum bir ML-DSA-87 anahtarıyla. Yalnızca klasik anahtarı çalan biri ikinci imzayı üretemez.
- **Zincirde doğrulanır.** Validatörler her iki imzayı da kontrol eder. İşlem bir `PQCHybridSignature` uzantısı taşır ve zincir `verified` durumuyla bir `pqc_hybrid_verify` olayı yayar. İkisini de herkese açık REST uç noktasından okuyabilir ve sonucu explorer'da görebilirsiniz.
- **Tek anahtar, bir kez bağlanır.** Post-kuantum anahtarınız üretilmez, türetilir ve bir kanıtla bir kez kaydedilir. Bkz. [Post-kuantum anahtarınız hesabınıza nasıl bağlanır](/build-before-qday/key-binding).
- **Alışılmış araçlar.** Hardhat'i, Foundry'yi veya seçtiğiniz dili kullanmaya devam edersiniz. Kitler, post-kuantum anahtarını ve yetkilendirme penceresini sizin için halleder.

## Nasıl çalışır {#how-it-works}

1. **Kaydolun**: [build.qorechain.io](https://build.qorechain.io) adresinde GitHub ile giriş yapın, seviyenizi seçin, X ve QoreX hesaplarınızı bağlayın.
2. **Geliştirin**: kitlerle, haftalık workshop'larla ve hack ortası görevleriyle testnet üzerinde geliştirin. Commit'ler ve güncellemeler herkese açık akışta görünür.
3. **Gönderin**: son tarihten önce herkese açık bir depo, en fazla 3 dakikalık bir video ve projenizin kullandığı testnet adresiyle gönderin.

Katılım ücretsizdir: test QOR'unun [faucet](/dashboard/faucet)'ten geldiği testnet üzerinde geliştirirsiniz. Katılım koşulları, gönderim ve jüri kuralları festival sitesinin Rules sayfasındadır. Ödül havuzu toplam 20.000 $'dır; Ocak 2027'den itibaren QOR cinsinden devam hibeleri vardır; dağılım festival sitesindedir.

## Seviyeler {#levels}

Kaydolurken bir seviye seçersiniz ve sonra değiştirebilirsiniz.

| Seviye | Kimin için |
| --- | --- |
| Quantum Pass | QoreChain'e veya web3'e yeni olanlar. Hibrit post-kuantum işlem gönderen ve onu zincirden geri okuyan küçük bir uygulama geliştirin. |
| Intermediate | Daha önce bir dApp yayımladınız. QoreChain SDK ve QoreX ile eksiksiz bir uygulama geliştirin. |
| Advanced | Üç parkur: A, ajanlar; B, QoreSeal ile şifreli uygulamalar; C, EVM ve Native lane'lerini kapsayan cross-VM uygulamalar. |
| Expert | Protokol altyapısı: RDK ile rollup'lar, QORel ile IBC, saklama (custody) ve geliştirici araçları. |

Workshop 1, Quantum Pass seviyesinin istediği şeyi tam olarak kapsar: zincirde doğrulanmış, hibrit imzalı bir işlem.

## Takvim {#timeline}

Tüm saatler UTC'dir.

| Ne zaman | Ne |
| --- | --- |
| 4 Kasım 2026 | Kayıt ve geliştirme açılır |
| Her hafta | Bir workshop (toplam 4), adım adım kılavuzu burada |
| 18 Kasım 2026 | Hack ortası görevleri başlar |
| 2 Aralık 2026, 23:59 | Gönderim son tarihi |
| 3 ile 5 Aralık | Gönderim kontrolleri |
| 6 ile 15 Aralık | Jüri değerlendirmesi ve People's Choice oylaması |
| 16 Aralık | Kazananlar ve canlı demo gösterisi |
| 17 ile 22 Aralık | Ödül ödemeleri |
| Ocak 2027 | Devam hibeleri |

Takvim festival sitesindedir.

## Kimler için {#who}

Blokzinciri veya post-kuantum kriptografisi bilmeniz gerekmez. Bir terminal açıp bir komut yapıştırabiliyorsanız buradaki her kılavuzu izleyebilirsiniz. Her kılavuz, her komutun ne yaptığını ve her parçasının ne anlama geldiğini sade sözcüklerle açıklar, sonra ekranda ne görmeniz gerektiğini gösterir. Bir kılavuz bir komutun biraz zaman alabileceğini söylüyorsa, bir sonrakini çalıştırmadan önce bitmesini bekleyin.

## Bir eğitim seçin {#choose}

Önce **Workshop 1 kılavuzunu** yapın. Boş bir bilgisayardan, iki anahtarla imzalanmış ve zincirde kontrol edilmiş bir işleme kadar eksiksiz yoldur. Sonra aşağıdan istediğiniz bir uygulamayı seçin. Aynı fikri farklı dillerde ve araçlarda gösterirler.

Süreler, araçlar kurulduktan sonraki adımlar içindir. Araçları ilk kez kurmak yaklaşık 20 ile 40 dakika ekler: bkz. [Başlamadan önce](/build-before-qday/prerequisites).

| Eğitim | Seviye | Dil | Süre | Sonunda elinizde ne olacak |
| --- | --- | --- | --- | --- |
| [Workshop 1 kılavuzu](/build-before-qday/workshop-1) | Başlangıç | TypeScript, Solidity | 30 dakika | İskeletini oluşturduğunuz, test ettiğiniz ve testnet'e dağıttığınız bir proje ve zincirde doğrulanmış bir hibrit imzalı işlem. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Başlangıç | TypeScript, Solidity | 25 dakika | Testnet'te, hibrit imzalı bir akışla artırdığınız bir sayaç kontratı. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Orta | TypeScript, Solidity, React | 45 dakika | Kendi zincir üstü misafir defteriniz ve QoreX cüzdanından imzaladığınız bir web sayfası. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Başlangıç | TypeScript, React | 25 dakika | QoreX'ten QOR gönderen ve her iki imzayı ile zincirin kararını gösteren bir web sayfası. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Orta | Rust | 25 dakika | Hibrit imzayla ödeme yapan ve onu zincirde doğrulayan bir komut satırı uygulaması. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Orta | Java 21 | 25 dakika | Bahşiş gönderen ve yalnızca post-kuantum imzalanmış ödemeleri kabul eden bir arka uç. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Başlangıç | Python | 20 dakika | Birçok adrese ödeme yapan, her iki anahtarla imzalanmış ve zincirde doğrulanmış tek bir işlem. |

Buradaki seviyelerin anlamı:

- **Başlangıç:** sırayla yapıştırdığınız birkaç komut. Yazılacak kod yok.
- **Orta:** aynısı, ayrıca bir web sayfası, bir cüzdan eklentisi veya daha önce kullanmamış olabileceğiniz bir dil araç zinciri gibi ikinci bir araçla.

Her eğitim aynı yapıyı izler: **Başlamadan önce**, numaralı adımlar (her komut, ne yaptığı ve her parçasının ne anlama geldiğiyle), **Ne görmelisiniz**, işlemi zincirde nasıl **doğrulayacağınız** ve bir **Sorun giderme** tablosu.

## Başlamadan önce {#before-you-start}

[Başlamadan önce: araçlar ve bir testnet cüzdanı](/build-before-qday/prerequisites) sayfasını bir kez okuyun. Şunları kapsar:

- Node.js, pnpm, Git, Rust, Java, Maven, Python ve jq araçlarını macOS, Windows ve Linux'ta kurmak, her biri için bir kontrol komutuyla.
- QoreX cüzdanını testnet'te kurmak.
- Faucet'ten test QOR'u almak (hesap başına 24 saatte bir 100 QOR).
- QOR ve uqor: 1 QOR, 1.000.000 uqor'dur.
- Atılabilir bir testnet anahtarını güvende tutmak. Yalnızca test hesapları kullanın, asla gerçek fon içeren bir cüzdanı değil.

## Nereden başlamalı {#where-to-start}

1. [Başlamadan önce](/build-before-qday/prerequisites) sayfasını okuyun ve ilk eğitiminiz için araçları kurun.
2. Testnet üzerinde [Workshop 1 kılavuzunu](/build-before-qday/workshop-1) izleyin.
3. Yukarıdaki tablodan örnek uygulamalardan birini deneyin.
4. QoreChain'e hiç dağıtım yapmadıysanız, [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes) fikri ayrıntılı açıklar. Uygulamaların arkasındaki kitler [Kitler](/build-before-qday/workshop-1/kits) sayfasındadır.

## Kod {#code}

Tüm örnek uygulamalar tek bir herkese açık depoda, `workshop-1` klasöründedir: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Her eğitim hangi klasörü açacağınızı söyler. Kodu bir kez şu komutla alın:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Bölüm | Ne yapar |
| --- | --- |
| `git clone` | Bir kod deposunun tam kopyasını bilgisayarınıza indirir. |
| `https://github.com/qorechain/build-before-qday` | Kopyalanacak deponun adresi. |

**Ne görmelisiniz:** komutu çalıştırdığınız klasörde `build-before-qday` adlı yeni bir klasör.
