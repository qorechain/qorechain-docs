---
slug: /appendix/networks
title: Ağlar
sidebar_label: Ağlar
sidebar_position: 4
---

# Ağlar

QoreChain ağları için birleştirilmiş bir referans — zincir tanımlayıcıları, EVM zincir kimlikleri, token denomu, adres önekleri ve standart hizmet portları. Tam düğüm bağlantı ayrıntıları (genel uç noktalar, tohumlar ve genesis) için aşağıda bağlantısı verilen bağlantı kılavuzlarını izleyin; operatörler güncel genel uç noktaları, tohumları ve genesis'i resmi sürümden edinir.

## Bir bakışta ağlar

| | Ana Ağ | Test Ağı |
|---|---|---|
| **Durum** | Canlı | Aktif test ağı |
| **Cosmos zincir kimliği** | `qorechain-vladi` | `qorechain-diana` |
| **EVM zincir kimliği (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Şu tarihten beri canlı** | 7 Haziran 2026, 23:59 UTC | — |
| **Zincir sürümü** | v3.1.80 | v3.1.80 |
| **Çerçeve** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Bağlantı kılavuzu** | [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) | [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) |

## Token ve adresler

| Öğe | Değer |
|---|---|
| **Görüntülenen denom** | QOR |
| **Temel denom** | uqor (1 QOR = 10⁶ uqor) |
| **Bech32 hesap öneki** | `qor` (örn. `qor1...`) |
| **Bech32 doğrulayıcı öneki** | `qorvaloper` (örn. `qorvaloper1...`) |

## Standart portlar

Bunlar, bir QoreChain düğümü tarafından açığa çıkarılan standart hizmet portlarıdır. Asıl genel uç nokta ana bilgisayar adları resmi sürümle yayımlanır — yukarıdaki bağlantı kılavuzlarına bakın.

| Hizmet | Port |
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

QoreChain, bu referansta sabit genel RPC/REST/EVM ana bilgisayar adları yayımlamaz. Bunun yerine:

- Düğüm bağlantısı, tohumlar ve genesis için [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) veya [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) sayfasını izleyin. Operatörler güncel genel uç noktaları, tohumları ve genesis'i resmi sürümden edinir.
- Bir uygulamadan programatik erişim için, ağ yapılandırmasını sizin yerinize çözen [QoreChain SDK](/sdk/overview)'i kullanın.
- Zincir üstü **Explorer**, [dashboard.qorechain.io](https://dashboard.qorechain.io) adresindeki Dashboard üzerinden erişilebilir ve test ağı **Musluğu** da oradan ulaşılabilir (bkz. [Dashboard Musluğu](/dashboard/faucet)).
- Bu dokümanlar [docs.qorechain.io](https://docs.qorechain.io) adresinde yayımlanır.

## MetaMask'e ekleme

MetaMask gibi bir EVM cüzdanına bir QoreChain ağı eklemek için, yukarıdaki EVM zincir kimliklerini — ana ağ için **9801** ve test ağı için **9800** — bağlandığınız ağın EVM JSON-RPC uç noktasıyla birlikte kullanın. Adım adım anlatım için bkz. [Cüzdan Kurulumu](/getting-started/wallet-setup).

## İlgili

* [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) — canlı `qorechain-vladi` ağına katılın.
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Diana test ağına katılın.
* [Zincir Parametreleri](/appendix/chain-parameters) — kanonik zincir yapılandırması.
* [SDK Genel Bakış](/sdk/overview) — ağ yapılandırmasını koddan çözün.
