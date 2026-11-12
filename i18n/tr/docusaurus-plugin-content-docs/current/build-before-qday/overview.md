---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Genel Bakış
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day**, QoreChain geliştirici festivalidir; [build.qorechain.io](https://build.qorechain.io) adresinde çevrimiçi yürütülür ve etiketi #BuildBeforeQDay'dir. Katılımcılar bir seviye seçer, açık kaynak kitlerle QoreChain testnet'inde geliştirir, süreci herkese açık paylaşır ve projesini bir jüriye ve topluluğa sunar. Festivalin yanında her hafta bir teknik workshop yapılır. Her workshop'un bu bölümde, ilk komuttan sonuncusuna kadar eksiksiz bir adım adım kılavuzu vardır; böylece her şeyi kendi bilgisayarınızda, kendi hızınızda yapabilirsiniz. Her workshop'un örnek uygulamaları herkese açık [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) deposunda toplanır.

## Yenilikler {#innovations}

Bu bölümdeki her workshop, QoreChain'i farklı kılan özellikler etrafında kurulmuştur:

- **Hibrit imzalama.** Bir işlem iki kez imzalanır: bir kez klasik secp256k1 anahtarıyla, bir kez de kuantum sonrası ML-DSA-87 anahtarıyla. Yalnızca klasik anahtarı çalan biri ikinci imzayı üretemez.
- **Zincir üzerinde doğrulanır.** Validatörler her iki imzayı da kontrol eder. İşlem bir `PQCHybridSignature` uzantısı taşır ve zincir `verified` durumlu bir `pqc_hybrid_verify` olayı yayar. İkisini de herkese açık REST uç noktasından okuyabilir, sonucu explorer'da görebilirsiniz.
- **Sıradan araçlar.** Hardhat'i, Foundry'yi ya da tercih ettiğiniz dili kullanmaya devam edersiniz. Kuantum sonrası anahtarı ve yetkilendirme penceresini kitler sizin yerinize halleder.

## Nasıl işler {#how-it-works}

1. **Kaydolun**, [build.qorechain.io](https://build.qorechain.io) adresinde: GitHub ile giriş yapın, seviyenizi seçin, X ve QoreX hesaplarınızı bağlayın.
2. **Geliştirin**, testnet'te kitlerle, haftalık workshop'larla ve festival ortasındaki görevlerle. Commit'ler ve güncellemeler herkese açık akışta görünür.
3. **Teslim edin**, son tarihten önce: herkese açık bir depo, en fazla 3 dakikalık bir video ve projenizin kullandığı testnet adresi.

Katılım ücretsizdir: test QOR'unun [faucet](/dashboard/faucet) üzerinden geldiği testnet'te geliştirirsiniz. Katılım uygunluğu, teslim ve değerlendirme kurallarının tamamı festival sitesindeki Kurallar sayfasındadır. Toplam ödül havuzu 20.000 dolardır; ayrıca Ocak 2027'den itibaren QOR cinsinden devam hibeleri verilir. Dağılım festival sitesindedir.

## Seviyeler {#levels}

Kayıt olurken bir seviye seçersiniz ve daha sonra değiştirebilirsiniz.

| Seviye | Kimler için |
| --- | --- |
| Quantum Pass | QoreChain'e ya da web3'e yeni başlayanlar. Hibrit bir kuantum sonrası işlem gönderen ve onu zincirden geri okuyan küçük bir uygulama geliştirin. |
| Intermediate | Daha önce bir dApp yayına aldınız. QoreChain SDK'sı ve QoreX ile eksiksiz bir uygulama geliştirin. |
| Advanced | Üç kategori: A, ajanlar; B, QoreSeal ile şifreli uygulamalar; C, EVM ve Native lane'lerini kapsayan cross-VM uygulamalar. |
| Expert | Protokol altyapısı: RDK ile rollup'lar, QORel ile IBC, saklama (custody) ve geliştirici araçları. |

Workshop 1, Quantum Pass seviyesinin istediği şeyi tam olarak kapsar: zincir üzerinde doğrulanmış, hibrit imzalı bir işlem.

## Takvim {#timeline}

Tüm saatler UTC'dir.

| Ne zaman | Ne |
| --- | --- |
| 4 Kasım 2026 | Kayıt ve geliştirme başlar |
| Her hafta | Bir workshop (toplam 4), adım adım kılavuzu burada |
| 18 Kasım 2026 | Festival ortası görevleri başlar |
| 2 Aralık 2026, 23:59 | Teslim son tarihi |
| 3 ile 5 Aralık | Teslim kontrolleri |
| 6 ile 15 Aralık | Değerlendirme ve Halkın Seçimi oylaması |
| 16 Aralık | Kazananlar ve canlı demo gösterisi |
| 17 ile 22 Aralık | Ödül ödemeleri |
| Ocak 2027 | Devam hibeleri |

Takvim festival sitesindedir.

## Workshop'lar {#workshops}

| Workshop | Konu | Kılavuz |
| --- | --- | --- |
| Workshop 1 | İlk hibrit imzalı işleminiz | [Workshop 1](/build-before-qday/workshop-1) |

Her kılavuz, hiçbir şeyin kurulu olmadığı noktadan başlar. Önce nelerin kurulacağını listeler, sonra komutları tek tek anlatır: kodu alın, kurun, yalnızca testnet için bir anahtar oluşturun, faucet'ten test QOR'u alın, çalıştırın ve sonucu explorer'da kontrol edin. Kılavuz, kullanılan paketler ve örnek uygulamalarla biter. Tüm örnek uygulamalar herkese açık [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) deposundadır.

## Nereden başlamalı {#where-to-start}

- Testnet'te [Workshop 1](/build-before-qday/workshop-1) kılavuzunu izleyin.
- [Örnek uygulamalara](/build-before-qday/workshop-1/kits) ve arkalarındaki kitlere göz atın.
- QoreChain'de hiç dağıtım yapmadıysanız önce [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes) sayfasını okuyun.
