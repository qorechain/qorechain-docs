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
| **Canlıya geçiş tarihi** | 7 Haziran 2026, 23:59 UTC | — |
| **Zincir sürümü** | v3.1.82 | v3.1.82 |
| **Çerçeve** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Minimum gaz fiyatı** | `0.1uqor` | `0.1uqor` |
| **Bağlantı kılavuzu** | [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) | [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) |

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
| İndirmeler (ikili dosya / genesis / anlık görüntü) | [download.qore.host](https://download.qore.host) | — |

:::note
Genel SVM uç noktaları **salt okunurdur** (işlem gönderimi uçta devre dışıdır); SVM yazma işlemleri için kendi düğümünüzü çalıştırın. Yoğun veya üretim iş yükleri için kendi düğümünüzü çalıştırın — bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node).
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
