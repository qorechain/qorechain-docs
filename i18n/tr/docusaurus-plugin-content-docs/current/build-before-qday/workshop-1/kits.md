---
slug: /build-before-qday/workshop-1/kits
title: QoreChain Kitleri
sidebar_label: Kitler
sidebar_position: 10
---

# QoreChain Kitleri

QoreChain geliştirici yığını on dört kitten oluşur. Bu sayfa her birini sürümü ve yayımlandığı yerle birlikte bir satırda listeler ve onlardan geliştirebileceğiniz altı fikirle biter. On iki kit kullanılabilir durumdadır. İkisi yayımlanmamıştır: Asset kit bir tekliftir ve PQ light client bir spesifikasyondur.

## Yenilikler {#innovations}

- **Hibrit ML-DSA-87 + secp256k1 imzalama SDK'nın, cüzdanların ve QoreSign'ın içine yerleşiktir**, böylece bir uygulamanın post-kuantum imzalamayı kendisinin gerçekleştirmesi gerekmez.
- **Zincirde doğrulanmış tek bir hibrit imzalı işlem**, uygulamalar arasındaki ortak kanıttır: bkz. [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) ve [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **Aynı yapı birçok dilde.** SDK, QoreSign ve PQC kütüphanesi birden çok dilde yayımlanır ve ortak test vektörlerine karşı kontrol edilir.

## Uygulama geliştirin {#build-apps}

| Kit | Ne yapar | Sürüm ve kayıt defteri |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | Native, EVM ve SVM lane'leri için hibrit imzalama, PQC anahtar kaydı, EVM pencere yardımcıları, staking katmanları, tokenomik, AMM, cross-VM çağrıları ve rollup'larla tek bir istemci. TypeScript, Python, Rust, Java ve Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Yedi şablondan tek komutla çalışan bir proje iskeleti oluşturur: hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm ve rollup-app. | 0.13.1: npm |
| [RDK, Rollup Geliştirme Kiti](/rollups/overview) | QoreChain üzerinde settlement yapan uygulamaya özel rollup'lar oluşturun, başlatın ve işletin; imzalı settlement toplu işlemleri, çekimler ve veri erişilebilirliği okumalarıyla. | `@qorechain/rdk` 0.8.0, beş dil |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Cüzdanlar ve imzalama {#wallets-signing}

| Kit | Ne yapar | Sürüm ve kayıt defteri |
| --- | --- | --- |
| [QoreX ve qorex-integrations](/developer-tools/qorex-integrations) | Resmi cüzdan her iki anahtarı tutar, hibrit imzalar ve neyi imzaladığınızı gösterir. Entegrasyonlar QoreX'i RainbowKit ve wagmi'ye, cosmos-kit ve Interchain Kit'e ekler; tipler, bir sahte cüzdan ve Playwright fixture'ları ile. Ayrıca bkz. [QoreX genel bakış](/qorex/overview). | QoreX 1.2.3 (iOS, Android), eklenti 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | İnsanların zaten kullandığı cüzdanlara (Keplr, Leap, Cosmostation, MetaMask, Phantom) QoreChain'i ekler; zincirin istediği ML-DSA-87 hibrit imzası dahil. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | QoreX dışındaki cüzdanlar ve arka uçlar için hibrit imzalama: ML-DSA anahtarını türetin, native lane işlemlerini her iki anahtarla imzalayın, hibrit imzaları yerelde doğrulayın, imzalamadan önce simüle edin ve Sign In With QoreChain. | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | Diğerlerinin altındaki post-kuantum yapı taşları: ML-DSA (FIPS 204), ML-KEM (FIPS 203) ve SHAKE-256; diller arasında bayt uyumlu ve ortak test vektörlerine karşı kontrol edilmiş. | `@qorechain/pqc` 0.2.3, altı dil |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Veri ve gizlilik {#data-privacy}

| Kit | Ne yapar | Sürüm ve kayıt defteri |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Verileri ML-KEM-1024 ile QoreChain hesaplarına şifreleyin (varsayılan olarak X25519 ile hibrit). Bir hesap anahtarını zincirde yayımlar ve herkes ona şifreleyebilir. Birden çok alıcı, denetçi anahtarları ve dönen grup anahtarları. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | Uyumlu geliştirici araçlarına QoreChain'e salt okuma erişimi veren bir Model Context Protocol sunucusu ve komut satırı aracı: bloklar, işlemler, hesaplar, validatörler, staking katmanları, hibrit imza durumu, kontrat okumaları ve ücret tahminleri. Asla imzalamaz, anahtar tutmaz ve yayın yapmaz. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Altyapı ve uyumluluk {#infra-compliance}

| Kit | Ne yapar | Sürüm ve kayıt defteri |
| --- | --- | --- |
| [QORel](/qorel/overview) | Hermes'in bir çatalı olan bir IBC relayer'ı; her işlemde post-kuantum imza isteyen zincirlerin aktarılabilmesi için takılabilir bir imzalayıcı katmanı vardır. Standart zincirler tam Hermes biçimini korur. | 0.1.0: GitHub, konteyner imajı, Homebrew |
| [Custody kit](/developer-tools/custody-kit) | Saklayıcılar için: her lane'in ne gerektirdiği, adres doğrulama, para yatırma algılama, çekimleri imzalama ve doğrulama, staking ve ML-DSA-87 anahtarını yönetme; test vektörleri ve referans kodla. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Bir dağıtımın kriptografisinin envanterini çıkarır (düğüm yapılandırması, türe göre anahtarlar, TLS uç noktaları, Solidity kaynakları, zincir durumu) ve bir CycloneDX 1.6 CBOM dışa aktarır; çıktılar FINMA Guidance 05/2026, AB PQC yol haritası ve DORA ile eşlenir. Bir envanter yardımcısıdır, sertifikasyon değildir. | `@qorechain/qorescan` 0.1.0 |
| [Asset kit](/developer-tools/asset-kit) | **Teklif, bütün olarak yayımlanmadı.** Düzenlemeye tabi tokenlaştırılmış varlıklar için araçlar: post-kuantum sahip kontrolüne sahip ERC-3643 ve CMTAT adaptörleri, ERC-4626 ve ERC-7540 kasaları, bir ihraççı konsolu ve istemciler. EVM kontratları kullanılabilir; native varlık modülleri bir tekliftir. | 0.1.0 |
| [PQ light client](/developer-tools/pq-light-client) | **Spesifikasyon, yayımlanmadı.** ML-DSA-87 ile imzalanmış kontrol noktalarını izleyen bir light client. QoreChain bugün bu kontrol noktalarını üretmiyor. Depo, tasarımın incelenebilmesi için spesifikasyonu ve referans doğrulayıcıları (Go, Rust, TypeScript) barındırır. | 0.1.0 (spesifikasyon) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Geliştirebileceğiniz altı şey {#ideas}

| Fikir | Şunlardan yapılır | Nedir |
| --- | --- | --- |
| Kuantuma dayanıklı ödeme | SDK, QoreX | Bir web mağazası için, her ödemenin hibrit imzalandığı bir QOR ile öde düğmesi. |
| Hackathon başlangıç paketi | create-qorechain-dapp | Sıfırdan testnet'te dağıtılmış bir kontrata on dakikada, öğrenci başına tek komutla. |
| Sign In With QoreChain | QoreSign | Hibrit imzanın sunucunuzda kontrol edildiği, bir web uygulaması için parolasız giriş. |
| Kapalı zarflı müzayede | QoreSeal | Teklifler açıklanana kadar şifreli kalır. |
| PQC hazırlık envanteri | QoreScan | Bir fintech ekibi ve denetçileri için bir kriptografi envanteri ve CBOM dosyası. |
| Kendi kanalınızı aktarın | QORel | QoreChain testnet ile başka bir Cosmos testnet zinciri arasında aktarım yapın. |

## Kodu edinin {#get-the-code}

Her kitin, yukarıda bağlantısı verilen kendi kılavuz sayfası vardır. Bu workshop'un örnek uygulamaları herkese açık [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) deposundadır ve her uygulama sayfası onları ilk komuttan sonuncuya kadar adım adım anlatır:

```sh
git clone https://github.com/qorechain/build-before-qday
```
