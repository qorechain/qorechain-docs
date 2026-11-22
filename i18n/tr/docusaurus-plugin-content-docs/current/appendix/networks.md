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
| **Zincir sürümü** | v3.2.8 (4.273.000 yüksekliğinde uygulandı, 18 Kasım 2026, yönetişim önerisi 17). v3.2.7, 12 Kasım 2026'da 4.164.600 yüksekliğinde (öneri 16), v3.2.6, 4 Kasım 2026'da 4.020.000 yüksekliğinde (öneri 15), v3.2.5, 29 Ekim 2026'da 3.906.833 yüksekliğinde, v3.2.4, 23 Ekim 2026'da 3.742.566 yüksekliğinde ve v3.2.3, 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulandı | v3.2.9 (10.424.000 yüksekliğinde uygulandı, 20 Kasım 2026, yönetişim önerisi 39 ile; yalnızca testnet, ana ağdan bir sürüm önde). v3.2.8, 12 Kasım 2026'da 9.929.500 yüksekliğinde uygulandı, v3.2.7, 9.594.600 yüksekliğinde 6 Kasım'da, v3.2.6, 27 Ekim'de 8.970.638 yüksekliğinde, v3.2.5, 26 Ekim'de 8.890.800 yüksekliğinde ve v3.2.4, 19 Ekim'de 8.337.253 yüksekliğinde uygulandı |
| **Blok süresi (ölçülen ortalama)** | yaklaşık 3,1 sn | yaklaşık 1,3 sn |
| **Sürüm manifestosu** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Çerçeve** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Minimum gaz fiyatı** | `0.1uqor` | `0.1uqor` |
| **Test tokenları** | Yok | Fest tokenları fUSD, fETH ve fBTC (değeri yoktur; bkz. [Faucet](/dashboard/faucet#fest-tokens)) |
| **Bağlantı kılavuzu** | [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) | [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) |

Her iki manifesto da yeni bir düğümün çalıştırması gereken sürüm için tek doğru kaynaktır. Her iki ağ da yönetişim üzerinden koordineli yükseltmeler alır; bu nedenle her manifesto, güncel sürümünün `upgradeHeight` değerini ve bu sürüme eşit bir `minCompatible` değerini taşır (mainnet'te 3.2.7, 19 Kasım 2026'da en düşük uyumlu sürüm olarak okundu; testnet'te 7 Kasım 2026'da kontrol edildiğinde 3.2.7, sonra 3.2.8; testnet manifestosu, testnet v3.2.9'u 20 Kasım'da uygulamış olmasına rağmen 22 Kasım 2026'da hâlâ 3.2.8 gösteriyordu). Testnet her sürümü önce alır: 20 Kasım 2026'dan beri v3.2.9 çalıştırır (12 Kasım'dan itibaren v3.2.8'in ardından), mainnet ise v3.2.8'i 18 Kasım 2026'dan beri (yükseklik 4.273.000, yönetişim önerisi 17); bu nedenle iki ağdan birine katılan bir düğüm kendi manifestosunu izlemeye devam etmelidir. 19 Kasım 2026'da mainnet manifestosu paketi `qorechaind-v3.2.8-b3-linux-amd64.tar.gz` olarak adlandırıyordu (107.091.599 bayt, sha256 `ead3f3e869d1fe52229b683d3d7c206fca7e56d6f984a2b721f3fb21cb0b9954`, `upgradeHeight` 4273000); 12 Kasım 2026'da `qorechaind-v3.2.7-b3-linux-amd64.tar.gz` adını taşıyordu (99.472.930 bayt, `upgradeHeight` 4164600); testnet manifestosu aynı paketi 7 Kasım 2026'da, testnet v3.2.7 çalıştırırken adlandırıyordu. Güncel paket adını ve sağlama toplamını manifestodan okuyun ve bkz. [Testnet'e Bağlanma](/getting-started/connecting-to-testnet). Bir ikili dosyayı ağlar arasında asla kopyalamayın.

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

## Genel uç noktalardaki sınırlar {#public-limits}

Genel ana makineler paylaşımlıdır, bu yüzden sınırları vardır. Bu sınırlar içinde çalışın ya da daha yoğun kullanım için kendi düğümünüzü çalıştırın ([Düğüm Çalıştırma](/developer-guide/running-a-node) sayfasına bakın).

- **İstek hızı.** Test ağı ana makineleri tek bir IP adresinden 60 saniyede 1.200 isteği kabul eder; bunun üzerinde adres 60 saniye boyunca engellenir.
- **SVM JSON-RPC.** `getSignaturesForAddress` çağrı başına en fazla 1.000 kayıt döndürür, bir toplu istek (batch) en fazla 100 istek içerir ve bir istek gövdesi en fazla 1 MB olabilir.
- **EVM filtreleri.** Bir istemci en fazla 16 filtre tutabilir. Sınır her iki ağda da kullanıcı başına sayılır (ana ağda 18 Kasım 2026 tarihli v3.2.8 yükseltmesinden beri).
- **JSON-RPC üzerinden EVM yürütme.** İşlem göndermeden bir kontrat çağırmak veya gas tahmini yapmak için EVM JSON-RPC ana makinesinde (`evm.qore.host`, `evm-testnet.qore.host`) `eth_call` ve `eth_estimateGas` kullanın. `eth_call`, `estimate_gas` ve tracing için `/cosmos/evm/vm/v1/` altındaki REST yolları ile bunların gRPC-web biçimleri genel uç noktalarda kullanılamaz ve 403 döner. Debug ve trace API'leri de genel uç noktalarda sunulmaz: bunlar için kendi düğümünüzü çalıştırın. Cosmos işlem simülasyonu (`/cosmos/tx/v1beta1/simulate`) kullanılabilir kalır, bu yüzden gas'i simülasyonla tahmin eden cüzdanlar, Keplr dahil, çalışmaya devam eder.

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
