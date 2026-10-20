---
slug: /appendix/networks
title: Ağlar
sidebar_label: Ağlar
sidebar_position: 4
---

# Ağlar

QoreChain ağları için birleştirilmiş bir başvuru kaynağı — zincir tanımlayıcıları, EVM zincir kimlikleri, token birimi, adres önekleri, genel uç noktalar ve standart servis portları.

## Ağlara genel bakış

| | Mainnet | Testnet |
|---|---|---|
| **Durum** | Canlı | Aktif testnet |
| **Cosmos zincir kimliği** | `qorechain-vladi` | `qorechain-diana` |
| **EVM zincir kimliği (EIP-155)** | **9801** (onaltılık `0x2649`) | **9800** (onaltılık `0x2648`) |
| **Canlıya geçiş tarihi** | 7 Haziran 2026 | 1 Temmuz 2026 (o tarihten beri kesintisiz; sıfırlama yok) |
| **Zincir sürümü** | 3.742.566 yüksekliğine kadar v3.2.3; o bloktan itibaren v3.2.4 (yönetişim önerisi 13). v3.2.3, 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulandı | v3.2.4 (8.337.253 yüksekliğinde uygulandı, 19 Ekim 2026) |
| **Blok süresi (ölçülen ortalama)** | yaklaşık 3,2 sn | yaklaşık 1,0 sn |
| **Sürüm manifestosu** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Çerçeve** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Minimum gaz fiyatı** | `0.1uqor` | `0.1uqor` |
| **Bağlantı kılavuzu** | [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) | [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) |

Her iki manifesto da yeni bir düğümün çalıştırması gereken sürüm için tek doğru kaynaktır. Her iki ağ da yönetişim üzerinden koordineli yükseltmeler alır; bu nedenle her manifesto, güncel sürümünün `upgradeHeight` değerini ve bu sürüme eşit bir `minCompatible` değerini taşır (testnet 3.2.4; mainnet, 3.742.566 yüksekliğindeki v3.2.4 yükseltmesine kadar 3.2.3, ardından mainnet manifestosu 3.2.4'e geçer). Testnet, 19 Ekim 2026'dan beri v3.2.4 çalıştırmaktadır.

## Genel uç noktalar {#public-endpoints}

Tüm genel uç noktalar HTTPS üzerinden sunulur.

| Servis | Mainnet | Testnet |
|---|---|---|
| Konsensüs RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| Konsensüs WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (Solana uyumlu, salt okunur) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Blok gezgini | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (Testnet'e geçiş yapın) |
| İndirmeler (ikili dosya / genesis / anlık görüntü) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
Genel SVM uç noktaları **salt okunurdur** (işlem gönderimi uçta devre dışıdır); SVM yazma işlemleri için kendi düğümünüzü çalıştırın. Yoğun veya üretim iş yükleri için kendi düğümünüzü çalıştırın — bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node). Genel bir gRPC uç noktası ve genel bir mainnet EVM WebSocket'i yoktur. Genel EVM uç noktalarında `eth_getLogs` sorgu başına en fazla 10.000 bloğu kabul eder ve `txpool_content` devre dışıdır (kendi barındırdığınız bir düğüm tam ad alanını sunar); bkz. [eth_ Ad Alanı](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
Bir betik genel bir uç noktadan `403 Forbidden` alıyorsa, açıkça bir `User-Agent` başlığı ayarlayın (Python'un varsayılan `urllib` istemcisi engellenir; `requests`, `curl`, Node ve Go istemcileri olduğu gibi çalışır).
:::

:::caution SVM işlem hattı şu anda devre dışı
Genel uç noktaların salt okunur olmasının ötesinde, SVM yürütme hattı **şu anda ağ genelinde işlem gönderimi için devre dışıdır** (v3.1.89 zincir sürümünden bu yana, 22 Ağustos) — bu yalnızca genel `svm.qore.host` / `svm-testnet.qore.host` uç noktalarını değil, kendi düğümünüz üzerinden yapılan gönderimi de kapsar. Ayrıntılar için bkz. [SVM Geliştirme](/developer-guide/svm-development). Hat yeniden açılana kadar Cosmos veya EVM arayüzlerini kullanın.
:::

## Token ve adresler

| Öğe | Değer |
|---|---|
| **Görünen birim** | QOR |
| **Temel birim** | uqor (1 QOR = 10⁶ uqor) |
| **Arayüze göre ondalık basamaklar** | Cosmos **6** (`uqor`) · EVM **18** (wei tarzı; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1.000 lamports) |
| **HD coin türü (BIP-44)** | `118` |
| **Bech32 hesap öneki** | `qor` (ör. `qor1...`) |
| **Bech32 doğrulayıcı öneki** | `qorvaloper` (ör. `qorvaloper1...`) |

Üç arayüz **tek bir birleşik yerel QOR bakiyesi** sunar: aynı anahtar, `qor1...` (Cosmos), `0x...` (EVM) ve base58 (SVM) adres biçimleri altında aynı fonları kontrol eder.

## Standart portlar

Bunlar, kendiniz çalıştırdığınız bir QoreChain düğümünün sunduğu standart servis portlarıdır.

| Servis | Port |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (Solana uyumlu) JSON-RPC | 8899 |
| Prometheus metrikleri | 26660 |

## Uç noktalar ve erişim

- Düğüm bağlantısı, eşler, genesis ve anlık görüntüler için [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) veya [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) kılavuzunu izleyin.
- Bir uygulamadan programatik erişim için, ağ yapılandırmasını sizin yerinize çözümleyen [QoreChain SDK](/sdk/overview)'yı kullanın.
- Genel **blok gezgini** [explore.qore.network](https://explore.qore.network) adresindedir; [dashboard.qorechain.io](https://dashboard.qorechain.io) adresindeki Dashboard kendi gezgin görünümünü içerir ve testnet **Faucet**'ine oradan erişilebilir (bkz. [Dashboard Faucet](/dashboard/faucet)).
- Bu dokümantasyon [docs.qorechain.io](https://docs.qorechain.io) adresinde yayımlanmaktadır.

## MetaMask'e ekleme

Bir QoreChain ağını MetaMask gibi bir EVM cüzdanına eklemek için yukarıdaki EVM zincir kimliklerini kullanın — mainnet için **9801** ile `https://evm.qore.host`, testnet için **9800** ile `https://evm-testnet.qore.host` — blok gezgini URL'si olarak da `https://explore.qore.network` girin. Adım adım yönergeler için [Cüzdan Kurulumu](/getting-started/wallet-setup) sayfasına bakın.

## İlgili sayfalar

* [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) — canlı `qorechain-vladi` ağına katılın.
* [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) — Diana testnet'ine katılın.
* [Borsa ve Entegratör Kılavuzu](/developer-guide/exchange-integration) — entegratörler için para yatırma, çekme ve düğüm operasyonları.
* [Zincir Parametreleri](/appendix/chain-parameters) — kanonik zincir yapılandırması.
* [SDK'ya Genel Bakış](/sdk/overview) — ağ yapılandırmasını koddan çözümleyin.
