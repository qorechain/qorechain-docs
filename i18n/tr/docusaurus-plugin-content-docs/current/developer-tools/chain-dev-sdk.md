---
slug: /developer-tools/chain-dev-sdk
title: Zincir Geliştirici Kiti
sidebar_label: Zincir Geliştirici Kiti
sidebar_position: 34
---

# Zincir geliştirici kiti (EVM ve QoreChain Native şablonları)

Zincir geliştirici kiti, Solidity ve akıllı sözleşme ekiplerinin zaten kullandıkları araçlarla QoreChain üzerinde geliştirme yapmasına yardımcı olan QoreChain SDK'nın parçasıdır. `@qorechain/evm` paketine viem zincir tanımlarını ve EVM yetkilendirme penceresi yardımcılarını, `create-qorechain-dapp` aracına dört proje şablonunu (Foundry, Hardhat 3, wagmi ile viem ve bir QoreChain Native CosmWasm token'ı), beş dil için EVM hızlı başlangıçlarını ve QoreChain EVM'inin Ethereum'dan nasıl ayrıştığını anlatan bir başvuru belgesini ekler. Sözleşmeleri Ethereum'dan taşıyan Solidity ekipleri, wagmi ve RainbowKit kullanan dApp ön yüz geliştiricileri, CosmWasm geliştiricileri ve araçlarına QoreChain'i eklemek isteyen EVM araç bakımcıları için hazırlanmıştır.

:::note Canlı: SDK 0.13.0'a dahildir
Kit, QoreChain SDK **0.13.0** içinde (npm, 11 Kasım 2026) **canlıdır ve kurulabilir**: `@qorechain/evm` 0.13.0, `@qorechain/sdk` 0.13.0, `@qorechain/react` 0.13.0, `@qorechain/svm` 0.13.0 ve `create-qorechain-dapp` 0.13.1 (SDK 0.13.0'ın üzerine yalnızca şablonları içeren bir yama, 12 Kasım 2026); Python, Rust ve Go SDK'ları da 0.13.0'dadır (Java SDK da Maven Central'da 0.13.0'dır, 11 Kasım 2026'da kontrol edildi). İçeriği ilk olarak yalnızca npm'de 0.11.0 olarak yayımlandı (29 Ekim 2026) ve 0.12.0'da (30 Ekim 2026) yer aldı; başka hiçbir kayıt defterinde 0.11.0 yoktur. Bu sayfadaki test çalıştırmaları 4 Kasım 2026'da 0.12.0'a karşı yapıldı; 0.13.0, seed yolu hesap yardımcısını ve şablonların `PRIVATE_KEY` işleyişini değiştirdi (bkz. [0.13.0 neyi değiştiriyor](/sdk/install#whats-new-0130)).
:::

Kit, ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801) ve test ağını (`qorechain-diana`, EVM zincir kimliği 9800) hedefler.

## Kitin içindekiler {#status}

| Öğe | Paket ve sürüm | Nerede |
|---|---|---|
| Herkese açık uç noktalara karşı ethers v6, web3.py, go-ethereum, alloy veya web3j ile okuma | QoreChain paketi gerekmez | [Hızlı başlangıç 1](#quickstart-ethers) |
| `createEvmClient`, ERC-20, ERC-721 ve ERC-1155 yardımcıları, `precompiles` bağlamaları, `PRECOMPILE_ADDRESSES` | `@qorechain/evm` 0.13.0 | [Hızlı başlangıç 2](#quickstart-evm-080) |
| viem zincir tanımları `qorechain` ve `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | `@qorechain/evm` 0.13.0 | [Hızlı başlangıç 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, adres dönüştürücüler, pencere sabitleri, alt yol `@qorechain/evm/window` | `@qorechain/evm` 0.13.0 | [Hızlı başlangıç 4](#quickstart-window-helpers) |
| Bir EVM yetkilendirme penceresini imzalayarak açma ve okuma, `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` ile | `@qorechain/sdk` 0.13.0 | [Hızlı başlangıç 5](#quickstart-open-window) |
| Python, Go, Rust ve Java'da aynı pencere oluşturucuları | 0.13.0 SDK'ları | [Ana API](#main-api) |
| EIP-7702 onay yardımcıları `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | `@qorechain/sdk` 0.13.0 | [Ana API](#main-api) |
| Yedi iskele aracı şablonu: `evm-solidity`, `fullstack-web`, `rollup-app`, `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` ve `pnpm window` yardımcısı | `create-qorechain-dapp` 0.13.1 | [Şablonlar](#templates) |
| `PqcStatusBadge` | `@qorechain/react` 0.13.0 | [Ana API](#main-api) |

## Yenilikler {#innovations}

- **Gönderim bilinçli olarak, sınırlı bir pencereyle yetkilendirilir.** Bir EVM işlemi yalnızca kayıtlı bir ML-DSA-87 anahtarı ve açık bir EVM yetkilendirme penceresi olan bir hesaptan kabul edilir. Pencere, hibrit (secp256k1 artı ML-DSA-87) imzalanmış bir yerel katman mesajıyla açılır; böylece bir EVM kütüphanesinin tuttuğu secp256k1 anahtarı harcamayı tek başına asla yetkilendiremez. Ethereum işleminin kendisi normal bir Ethereum işlemi olarak kalır.
- **Güvene değil, sınırlara göre boyutlandırılan bir pencere.** Bir pencere blok sayısını (1 ila 17.280), EVM işlem sayısını (1 ila 1.000) ve kabul edilen her işlemin değerini ve azami ücretini kapsayan uqor cinsinden bir toplamı sınırlar. `nativeOnly` pencereyi düz QOR transferleriyle, `allowedTargets` (en fazla 16 adres) ise alıcılarla sınırlar ve sözleşme oluşturmayı reddeder.
- **Bir hesap, iki kodlama.** Bir eth-native hesap için `0x` ve `qor1...` adresleri aynı 20 bayttır ve aynı bakiyeyi gösterir; böylece tek anahtar hem EVM'de hem de yerel katmanda çalışır. QOR, EVM'de 18, yerel katmanda 6 ondalık basamağa sahiptir (`uqor`); 1 uqor, 10^12 wei'dir.
- **Reddi adlandıran yardımcılar.** `classifyEvmWindowRejection`, reddedilen bir işlemi bir viem veya ethers hatasından, bir yerel katman teslim sonucundan ya da bir dizeden dört nedenden birine çevirir: `no-pqc-key`, `no-window`, `exhausted` veya `invalid`.
- **uqor cinsinden pencere boyutlandırma.** `evmWindowCost` ve `weiToUqorCeil`, bir pencereyi değer, gaz ve ücret üst sınırından boyutlandırır; wei'yi uqor'a yukarı yuvarlar, böylece toplam en kötü durumu karşılar.
- **Otomatik açma yok.** Kit, bir gönderimden önce pencere açan bir yardımcıyı bilerek içermez. Pencere, harcamanın bilinçli olarak yetkilendirilmesi için vardır.
- **Ücretsiz simülasyon.** `eth_call` ve `eth_estimateGas`, pencere veya kayıtlı anahtar olmadan her hesap için çalışır.
- **Pencereyi bağlayan şablonlar.** Foundry ve Hardhat şablonları, ML-DSA-87 anahtarını türeten (`QORE_MNEMONIC` ile mnemonic'ten; `PRIVATE_KEY` ile, 0.13.0'dan beri, `QORE_PQC_RECOVERY_CODE` içindeki bir kurtarma kodundan), bir kez kaydeden ve hibrit imzalı açma mesajını yayınlayan `pnpm window status|register|open` komutunu içerir.
- **Belgelenmiş bir uyumluluk yüzeyi.** Bir başvuru sayfası (27 Ekim 2026'da herkese açık uç noktalardan okundu, 4 Kasım'da kısmen yeniden denetlendi), Ethereum'dan nelerin farklı olduğunu listeler: işlem türleri, çatallanmalar (fork), kesinlik (finality), ücret alanları, JSON-RPC ad alanları ve precompile'lar. [Aşağıda](#evm-differences) özetlenmiştir.

## Kitin içeriği {#contents}

### `@qorechain/evm` {#evm-package}

Kitte yeni olanlar:

- `qorechain` (9801) ve `qorechainTestnet` (9800): herkese açık uç noktalara, 18 ondalık basamaklı QOR yerel para birimine ve `https://explore.qore.network` gezginine sahip viem zincir nesneleri. `QORECHAIN_CHAINS`, wagmi ve RainbowKit için ikisini de listeler (önce ana ağ, sonra test ağı). `QORECHAIN_REST_ENDPOINTS`, her EVM zincir kimliğini yerel katman REST uç noktasına eşler.
- `evmWindowStatus({ rest, address })`, bir hesabın penceresini REST üzerinden okur (`/qorechain/pqc/v1/evm_window/{address}`), bir `qor1...` veya `0x` adresini kabul eder ve pencere yoksa hata vermek yerine `{ found: false }` yanıtlar. `parseEvmWindow` ham yanıtı ayrıştırır.
- `openEvmWindowMessage(params)` sınırları denetler ve yerel katman `MsgOpenEVMWindow` mesajını, `@qorechain/sdk` ile imzalamaya hazır düz bir `{ typeUrl, value }` nesnesi olarak oluşturur. `checkOpenEvmWindowParams` denetimleri tek başına çalıştırır.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress` ve `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17.280), `MAX_EVM_WINDOW_TXS` (1.000) ve `MAX_EVM_WINDOW_TARGETS` (16) sabitleri.
- Pencere yardımcıları ayrıca viem olmadan `@qorechain/evm/window` alt yolunda yayımlanır.

Kitten önce de vardı (0.8.0 ve sonrası): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, `erc20` yardımcıları, ERC-721 ve ERC-1155 yardımcıları, `precompiles` bağlamaları ve `PRECOMPILE_ADDRESSES`. Bkz. [EVM kılavuzu](/sdk/guides/evm).

### Şablonlar {#templates}

`create-qorechain-dapp` 0.13.1 aracının yedi şablonu vardır: `evm-solidity`, `fullstack-web` ve `rollup-app` (bkz. [İskele araçları ve CLI](/developer-tools/scaffolders-and-cli)) ile kite ait dört şablon:

| Şablon | Ne elde edersiniz |
|---|---|
| `foundry` | Bir Foundry projesi: `Counter` sözleşmesi, testler, dağıtım betiği, `qorechain` ve `qorechain_testnet` adlı RPC uç noktaları ve `pnpm window status\|register\|open`. |
| `hardhat` | Bir Hardhat 3 ve viem projesi: `Counter` sözleşmesi, simüle ağda testler, bir Ignition dağıtım modülü, `qorechain` ve `qorechainTestnet` ağları ve `pnpm window status\|register\|open`. |
| `viem-wagmi` | QoreX cüzdanı (`@qorechain/qorex-rainbowkit`) ve `@qorechain/evm` zincir tanımlarıyla bir Vite, React, wagmi ve RainbowKit dApp'i. Son bloğu, QOR bakiyesini ve hesabın EVM penceresini gösterir. viem `~2.53.1` sürümüne sabitlenir ve REST'e bir Vite `/lcd` vekili üzerinden ulaşır (herkese açık REST CORS başlıkları göndermez); bu yüzden tarayıcı kodu geliştirme sırasında `/lcd/...` çağırır (0.13.1). |
| `cosmwasm` | cw-plus içindeki `cw20-base` üzerine kurulu bir QoreChain Native (CosmWasm) CW20 token'ı, Docker'da optimize edilmiş bir derleme, bir yönetişim yükleme önerisi betiği ve test ağı örnekleme (instantiate) ve sorgu betikleri. |

Şablonlar `@qorechain/evm` ve `@qorechain/sdk` paketlerini `^0.13.0` sürümüne sabitler (0.12.0 şablonları `^0.12.0` sürümüne sabitliyordu; 4 Kasım 2026'da bir `foundry` iskeletinden okundu).

### SDK deposundaki kılavuzlar {#guides}

Depoda (`docs/docs/guides/`, etiket `v0.13.0`) `evm-quickstarts.md` (viem, ethers v6, web3.py, go-ethereum, alloy ve web3j için okumalar ve bir "Before you send" bölümü), `evm-differences.md` ("QoreChain EVM compared with Ethereum"), `evm.md` ve `cosmwasm.md` bulunur. Aynı içerik bu sitede: [EVM kılavuzu](/sdk/guides/evm), [EVM geliştirme](/developer-guide/evm-development) ve [QoreChain Native geliştirme](/developer-guide/cosmwasm-development).

Depoda ayrıca, `contrib/` ve `templates/scaffold-eth-extension/` altında diğer araçlar için katkı dosyaları (viem zincir tanımları, Sourcify zincir kayıtları ve bir Scaffold-ETH 2 uzantısı) bulunur. Bunlar depoda hazırlanmış dosyalardır, yukarı akışa birleştirilmemiştir.

## Kullanım senaryoları {#use-cases}

1. **Ethereum'dan taşınan bir Solidity ekibi.** `foundry` şablonunu iskeleleyin, sözleşmeleri kopyalayın, yerelde `forge test` çalıştırın, bir kez `pnpm window register` çalıştırın ve her dağıtım grubundan önce `pnpm window open` çalıştırın. [Farklar](#evm-differences) neyin değişeceğini listeler: blob işlemi yok, PREVRANDAO bir sabit, herkese açık uç noktalarda `debug_*` izleme yok.
2. **Test ağına giden bir Hardhat 3 projesi.** `hardhat` şablonunu iskeleleyin, Ignition modüllerinizi koruyun ve bir pencere açtıktan sonra `pnpm deploy:testnet` ile dağıtın. İlk işlemden önce pencereyi açtıktan sonra yaklaşık 10 saniye bekleyin (Hardhat README'si bunu belirtir).
3. **wagmi üzerinde bir dApp ön yüzü.** `QORECHAIN_CHAINS` değerini wagmi yapılandırmasına ve RainbowKit'e aktarın, kullanıcının penceresini `evmWindowStatus` ile gösterin ve reddedilen bir gönderimi `classifyEvmWindowRejection` ile açıklayın.
4. **Başka bir dilde bir arka uç hizmeti.** Bir Python, Go, Rust veya Java hizmeti, bakiyeleri okur ve sözleşmeleri Ethereum'daki gibi web3.py, go-ethereum, alloy veya web3j ile çağırır, Ethereum'daki gibi. Göndermek için o dilin QoreChain SDK 0.12.0 sürümüyle `MsgOpenEVMWindow` oluşturur.
5. **Bir CosmWasm geliştiricisi.** `cosmwasm` şablonunu iskeleleyin, CW20'yi `cargo test` ile test edin, optimize edilmiş Wasm'ı derleyin, kodu depolamak için bir yönetişim önerisi sunun ve öneri geçtikten sonra test ağında örnekleyin.
6. **Bir cüzdan veya saklama entegrasyonu.** Kullanıcılar adına anahtar tutan bir entegrasyonun, secp256k1 anahtarının tek başına EVM katmanında harcama yapamayacağını bilmesi gerekir. Hesabın ML-DSA-87 anahtarıyla imzalanmış dar pencereler (`nativeOnly` veya `allowedTargets`) açar, `@qorechain/sdk` 0.12.0'daki `openEvmWindowMsg` ile.
7. **EVM araçlarının bakımcıları.** viem, Sourcify veya Scaffold-ETH 2 bakımcıları, 9800 ve 9801 zincir kimliklerini eklemek için hazırlanmış katkı dosyalarını okuyabilir.

## Nasıl çalışır {#how-it-works}

- **Yetkilendirme kuralı.** Zincir, kayıtlı bir ML-DSA-87 anahtarı ve canlı bir penceresi olan bir hesaptan gelen EVM işlemini kabul eder, aksi halde reddeder. Kural, her iki ağda etkin olan `evm-pqc-authorisation-window` protokol özelliğidir; `/qorechain/pqc/v1/protocol_features` adresinden okuyun. Bkz. [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) ve [ilk işlem kılavuzu](/getting-started/first-transaction#evm-window).
- **Açma ve kapatma.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) bir pencere açar, hibrit imzalanır; yeni bir pencere açmak öncekinin yerini alır. `MsgCloseEVMWindow` pencereyi kapatır.
- **Bir pencerenin sınırladıkları.** Bloklar (süre değil, blok sayısı), EVM işlemleri ve kabul edilen her işlemin değerini artı azami ücretini (gaz limiti çarpı ücret üst sınırı) kapsayan bir uqor toplamı. `nativeOnly` ve `allowedTargets` hangi alıcıları kabul ettiğini daraltır, bir token'ın ne kadarını değil (listelenen bir token, `approve` dahil her miktarı kabul eder; bkz. [Bir pencereyi kapsamlandırma](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** Yerel sıra numarası ve EVM nonce'u aynı sayaçtır. Bir pencere açmak onu ilerletir; bu yüzden önce pencereyi açın, sonra nonce'u okuyun, sonra EVM işlemini imzalayın.
- **Şablon yardımcısı.** `foundry` ve `hardhat` içinde `pnpm window`, hesabı `PRIVATE_KEY` (veya `QORE_MNEMONIC`) değerinden türetir, ML-DSA-87 anahtarını türetir (`PRIVATE_KEY` ile `QORE_PQC_RECOVERY_CODE` içinden, 0.13.0'dan beri; `QORE_MNEMONIC` ile mnemonic'ten, değişmedi), anahtarı bir kez kaydeder (`register`) ve hibrit imzalı `MsgOpenEVMWindow` mesajını yayınlar (`open`). Varsayılan olarak, 250 gwei ücret üst sınırında 3.000.000 gaza kadar işlemler için 600 blok ve 5 işlemlik bir pencere boyutlandırır.
- **QoreChain Native üzerinde CosmWasm.** Kod yükleme, her iki ağda da yönetişim üzerindendir (`code_upload_access` değeri `Nobody`): kod, yönetişim modülü gönderici olarak `MsgStoreCode` taşıyan bir yönetişim önerisiyle depolanır. Örnekleme test ağında herkese açık, ana ağda kapalıdır (`instantiate_default_permission` test ağında `Everybody`, ana ağda `Nobody`, 27 Ekim 2026'da okundu). İkisini de `/cosmwasm/wasm/v1/codes/params` adresinden okuyun; depolanmış kodları `/cosmwasm/wasm/v1/code` adresinden listeleyin. Ana ağda 27 Ekim 2026'da ve 4 Kasım 2026'da depolanmış kod yoktu.

## QoreChain EVM ve Ethereum karşılaştırması {#evm-differences}

27 Ekim 2026'da herkese açık uç noktalardan okundu (SDK kılavuzu `evm-differences.md`). Ağ durumu (ücretler, blok süreleri, etkin precompile'lar) tarihlidir; güvenmeden önce canlı okuyun.

- **Gönderim.** Her EVM işlemi, göndericisi için kayıtlı bir ML-DSA-87 anahtarı ve açık bir pencere gerektirir; hesap başına istisna yoktur. Dağıtımlar, transferler ve sözleşme çağrılarının hepsi kapsanır. Kayıtlı anahtarı olan bir hesabın yerel katmanda da klasik imza yolu yoktur: imzaladığı her yerel işlem hibrittir.
- **Simülasyon.** `eth_call` ve `eth_estimateGas` pencere gerektirmez.
- **İşlem türleri.** Tür 0 (legacy), 1 (erişim listesi), 2 (EIP-1559) ve 4 (EIP-7702) kabul edilir. **EIP-4844 blob işlemleri (tür 3) reddedilir.** Cancun işlem kodları (opcode) çalışır, ancak `blobGasUsed` ve `excessBlobGas` her zaman 0'dır, `eth_blobBaseFee` yoktur ve nokta değerlendirme precompile'ı (`0x0a`) hata döndürür.
- **Çatallanmalar.** Başlangıçtan (genesis) London'a kadar; Shanghai, Cancun ve Prague etkin; Osaka etkin değil.
- **PREVRANDAO (EIP-4399) bir sabittir** (`0xff...ff`) ve başlık `mixHash` değeri sıfırdır. Rastgelelik olarak asla kullanmayın.
- **EIP-7702**, bir QoreChain kuralıyla kabul edilir: yetkisi (authority) etkili olacak her yetkili hesabın kayıtlı bir PQC anahtarı ve `MsgAuthorizeEVMDelegation` ile kaydedilmiş tek kullanımlık bir onayı olmalıdır (işlem başına en fazla 8 yetkilendirme, yinelenen yetkili yok). Sponsorun penceresi, yetkili hesapların onayı sayılmaz. `MsgClearEVMDelegation` bir yetkilendirmeyi kaldırır. Bkz. [EIP-7702 onayı](/sdk/guides/evm#evm-delegation-consent).
- **Kesinlik.** Bloklar işlendiğinde kesindir: `latest`, `safe` ve `finalized` aynı bloğu döndürür; yeniden düzenleme (reorg) ve uncle yoktur.
- **Ücretler (her iki ağ, 27 Ekim 2026'da ve yeniden 4 Kasım 2026'da okundu).** `eth_gasPrice` 112,5 gwei; taban ücret 100 gwei (gaz başına 0,1 uqor zincir tabanı); `eth_maxPriorityFeePerGas` 12,5 gwei; başlık `gasLimit` değeri 4.294.967.295. Ücret üst sınırını taban ücretin yaklaşık iki katına ayarlayan araçlar (Foundry böyle yapar), yaklaşık 112,5 gwei öderken pencereye karşı gaz başına yaklaşık 200 gwei'ye kadar taahhüt eder.
- **JSON-RPC ad alanları.** `eth`, `net`, `web3` ve `txpool`. Her `debug_*`, `personal_*`, `admin_*` ve `miner_*` metodu kullanılamaz (`-32601`); `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` ve `eth_config` de öyle. İzleme (trace) gerektiren araçlar herkese açık uç noktalara karşı çalışmaz.
- **Farklı davranış.** `eth_getProof` çalışır ancak Merkle-Patricia kanıtları yerine zincirin IAVL kanıtlarını döndürür. `eth_getLogs` sorgu başına en fazla 10.000 bloğu kapsar. `eth_subscribe` yalnızca WebSocket üzerinden çalışır. `eth_accounts`, `eth_sign` ve `eth_sendTransaction`, node hesap tutmadığı için reddedilir: yerelde imzalayın ve `eth_sendRawTransaction` kullanın. `txpool_content` herkese açık uç noktalarda reddedilir; `txpool_status` çalışır. `web3_clientVersion`, node'u algılamanın güvenilir bir yolu değildir.
- **Bakiyeler.** `eth_getBalance`, uqor cinsinden banka bakiyesinin 10^12 katını artı varsa uqor altı kalanı döndürür.
- **Precompile'lar.** Ethereum'un standart precompile'ları her zamanki gibi yanıt verir. `pqcVerify` (`0x0A01`) ve `pqcKeyStatus` (`0x0A02`) **yalnızca test ağında etkindir**; ana ağda hiçbiri etkin değildir ve birini etkinleştirmek bir yönetişim kararı gerektirir, tarih yoktur. Test ağı ayrıca `0x0C01` (`rlConsensusParams`) adresini listeler. Etkin olmayan bir precompile'a yapılan çağrı geri almak (revert) yerine boş veri döndürür; bu yüzden birine güvenmeden önce `/cosmos/evm/vm/v1/params` adresindeki `active_static_precompiles` değerini okuyun. Bkz. [EVM Precompile'ları](/developer-guide/evm-precompiles#network-status).
- **Araçlar.** QoreChain henüz `viem/chains` içinde değil: zincirleri `@qorechain/evm` paketinden içe aktarın. Sourcify henüz 9800 veya 9801 zincir kimliklerini listelemiyor. SVM katmanı açık değil.

## Nasıl kullanılır {#how-to-use}

Okuyan tüm kod parçaları herkese açık test ağını (`qorechain-diana`, EVM zincir kimliği 9800) kullanır, anahtar gerektirmez ve hiçbir şey göndermez. `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` adresindeki test ERC-20'si bir test ağı token'ıdır (sembol `WQOR`, 18 ondalık basamak); onu ve adresi kendinizinkilerle değiştirin.

### Dile göre kurulum {#install}

| Dil veya araç | Kurulum | Asgari platform |
|---|---|---|
| TypeScript, EVM okumaları, ERC yardımcıları, viem zincir tanımları, pencere yardımcıları | `npm install @qorechain/evm viem` (0.13.0) | Node.js 20 veya üstü; peer `viem ^2` |
| TypeScript, pencere mesajını imzalama | `npm install @qorechain/sdk` (0.13.0'da `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` vardır) | Node.js 20 veya üstü |
| React, PQC durum rozeti | `npm install @qorechain/react @qorechain/sdk react react-dom` (0.13.0) | Node.js 20 veya üstü |
| İskele aracı, yedi şablonun tümü | `npx create-qorechain-dapp my-app --template <name>` (0.13.1) | Node.js 20 veya üstü; `foundry` için Foundry; `hardhat` için Node.js 22 (Hardhat 3); `cosmwasm` için Rust ve Docker |
| Python (EVM okumaları) | `pip install "web3>=7,<8"`; pencere mesajı `pip install qorechain-sdk` (0.13.0) ile | Python 3.10 veya üstü |
| Go (EVM okumaları) | `go get github.com/ethereum/go-ethereum@latest`; pencere mesajı `go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0` ile | Go araç zinciri |
| Rust (EVM okumaları) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; pencere mesajı `qorechain-sdk` 0.13.0 crate'inden | Rust stable |
| Java (EVM okumaları) | `org.web3j:core:5.0.0`; pencere mesajı `io.github.qorechain:qorechain-sdk:0.13.0` paketinden (Maven Central'da yayımlandı, 11 Kasım 2026'da kontrol edildi) | JDK 21 (QoreChain Java SDK, JDK 21 araç zinciriyle derlenir) |

### Hızlı başlangıç 1: ethers v6 ile okuma {#quickstart-ethers}

Hiçbir QoreChain paketi gerekmez. 27 Ekim 2026'da test ağına karşı çalıştırıldığında `chain id: 9800n`, bir bakiye ve `token: WQOR 18n` yazdırdı.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

Aynı okuma web3.py, go-ethereum, alloy ve web3j ile SDK kılavuzu `evm-quickstarts.md` içindedir (orada web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 ve JDK 21 üzerinde web3j 5.0.0 ile test edildiği bildirilir; bu sayfa onları yeniden çalıştırmadı).

### Hızlı başlangıç 2: `@qorechain/evm` ile okuma {#quickstart-evm-080}

Geliştirici merkezindeki test edilmiş hızlı başlangıç (manifesto bunu 27 Ekim 2026'da, o zaman `@qorechain/evm` 0.8.0 üzerinde test edilmiş olarak işaretler; 4 Kasım 2026'da 0.12.0 ile yeniden çalıştırıldı ve aynı biçimde bir satır yazdırdı). Bağlanır, EVM zincir kimliğini otomatik algılar ve herkese açık test ağı musluk (faucet) hesabının QOR bakiyesini yazdırır.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Hızlı başlangıç 3: viem zincir tanımıyla okuma {#quickstart-viem}

4 Kasım 2026'da `npm install @qorechain/evm@0.12.0 viem` sonrasında çalıştırıldığında `chain id: 9800`, bir bakiye ve `WQOR 18` token'ını yazdırdı.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Hızlı başlangıç 4: bir pencereyi denetleme ve açma mesajını oluşturma {#quickstart-window-helpers}

`@qorechain/evm` README'sinden. Önce okur, sonra bir mesaj nesnesi oluşturur; imzalamaz veya göndermez. 4 Kasım 2026'da 0.12.0 ile çalıştırıldı: penceresi olmayan bir hesap için `evmWindowStatus`, `found: false, live: false` döndürdü ve mesaj, 112,5 gwei'de 3.000.000 gazlık beş işlem için `maxValue: '1687500'` ile `typeUrl: '/qorechain.pqc.v1.MsgOpenEVMWindow'` olarak döndü.

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Hızlı başlangıç 5: TypeScript'ten bir pencere açma {#quickstart-open-window}

SDK kılavuzu `evm-quickstarts.md` içindeki "Before you send" bölümünden. Bu, **bir yerel katman işlemi gönderir**: yalnızca kendi fonlanmış test hesabınızla çalıştırın, asla paylaşılan veya herkese açık bir ifadeyle çalıştırmayın.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

Bu kod parçası bu sayfa için yeniden çalıştırılmadı. `maxValue: "3750000"`, 250 gwei ücret üst sınırında 3.000.000 gazlık 5 işlemdir.

### Hızlı başlangıç 6: bir proje iskeleleme {#quickstart-scaffold-live}

27 Ekim 2026'da boş bir dizinde, herkese açık npm kayıt defterinden `npx` ile test edildi (o zaman 0.10.0, şablon `fullstack-web`): proje iskelelendi ve derleme başarılı oldu. 4 Kasım 2026'da `create-qorechain-dapp@0.12.0 --template foundry --no-install`, `package.json` dosyası `@qorechain/evm` ve `@qorechain/sdk` paketlerine `^0.12.0` ile bağlı bir proje iskeledi; diğer yeni şablonlar bu sayfa için iskelelenmedi.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### Kit şablonlarını kullanma {#new-templates-usage}

İskele aracı dört kit şablonu adını kabul eder (aşağıdaki bayrak tablosuna bakın). Bir `foundry` projesi yerelde `forge build` ve `forge test` ile derlenir ve test edilir (ağ yok); `pnpm window status` hesabı, PQC anahtarını ve penceresini okur. `pnpm window register` ve `pnpm window open`, kendi fonlanmış hesabınızdan yerel katman işlemleri yayınlar; `forge script ... --broadcast` ise dağıtım yapar. `.env.example` içine asla gerçek bir anahtar koymayın, `.env` dosyasını asla commit etmeyin ve herkese açık BIP-39 test ifadesini (11 kez tekrarlanan `abandon`, ardından `about`) asla fonlamayın.

## Ana API {#main-api}

### `@qorechain/evm` {#api-evm}

| Ad | Ne yapar |
|---|---|
| `qorechain`, `qorechainTestnet` | Herkese açık uç noktaları ve gezgini olan, 9801 ve 9800 için viem zincir nesneleri. |
| `QORECHAIN_CHAINS` | wagmi veya RainbowKit için her iki zincir (önce ana ağ, sonra test ağı). |
| `QORECHAIN_REST_ENDPOINTS` | EVM zincir kimliğinden yerel katman REST URL'sine. |
| `evmWindowStatus` | Bir pencereyi REST üzerinden okur: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | REST yanıtını ayrıştırır. |
| `openEvmWindowMessage` | Sınırları denetler ve `MsgOpenEVMWindow` mesajını `{ typeUrl, value }` olarak oluşturur. |
| `checkOpenEvmWindowParams` | Yalnızca sınır denetimleri. |
| `evmWindowCost`, `weiToUqorCeil` | uqor cinsinden pencere boyutlandırma. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Bir reddi açıklar: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Aynı hesap için `0x` ve `qor1...` arasında dönüştürür. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Sabitler. |
| `@qorechain/evm/window` | viem bağımlılığı olmayan pencere yardımcıları. |

`@qorechain/evm`, yerel katman işlemlerini imzalamaz veya yayınlamaz; bunun için `@qorechain/sdk` veya dil SDK'larını kullanın.

### Her SDK'da bir pencere oluşturma ve okuma (0.13.0) {#api-window}

| Dil | Pencere açma | Pencere okuma |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`) | `fetchEvmWindow`; `evmWindowStatus` (`@qorechain/evm`) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`nativeOnly` veya `allowedTargets` için `NewOpenEVMWindowScoped`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

EIP-7702 onayı (TypeScript, `@qorechain/sdk` 0.13.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.13.0, `PqcStatusBadge` bileşenini (varsayılan etiketler "PQC key registered" ve "No PQC key") eski `QuantumSafeBadge` bileşeninin yanında dışa aktarır.

### `create-qorechain-dapp` bayrakları {#api-scaffolder}

| Bayrak | Ne yapar |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app`, `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm`. |
| `--network <name>` | `testnet` veya `mainnet` ön ayarı. |
| `--package-manager <pm>` | `pnpm`, `npm` veya `yarn`. |
| `-y, --yes` | Soruları atlar ve varsayılanları kullanır. |
| `--no-install` | Bağımlılıkları kurmaz. |
| `--local` | SDK monorepo'sunda `@qorechain/*` bağımlılıklarını yerel bağlantılara çevirir (SDK katkıcıları için; normal kullanımda gerekmez). |
| `-h, --help` / `-v, --version` | Yardım ve sürüm. |

### Şablon betikleri {#api-template-scripts}

| Şablon | Betik | Ne yapar |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Hesabı, ML-DSA-87 anahtarının kayıtlı olup olmadığını (ve bu anahtar olup olmadığını) ve penceresini gösterir. |
| `foundry`, `hardhat` | `pnpm window register` | Hesabın ML-DSA-87 anahtarını, hesap başına bir kez kaydeder. |
| `foundry`, `hardhat` | `pnpm window open` | Bir pencere açar (varsayılan 600 blok, 5 işlem). |
| `foundry`, `hardhat` | `pnpm window recovery-code` | Yeni bir kurtarma kodu yazdırır (0.13.0). Onu `PRIVATE_KEY` değerinden ayrı saklayın ve `QORE_PQC_RECOVERY_CODE` içine koyun. |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Hardhat derleme, testler, `qorechainTestnet` ağına Ignition dağıtımı. `pnpm window open` sonrasında ilk işlemden önce yaklaşık 10 saniye bekleyin. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | `http://localhost:5173` adresinde geliştirme sunucusu (REST `/lcd` vekili üzerinden); üretim derlemesi. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Optimize edilmiş derleme, yönetişim yükleme önerisi, örnekleme (test ağı), REST sorguları. |

Şablon ortam değişkenleri (`.env` içinde, asla commit edilmez): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_PQC_RECOVERY_CODE` (`PRIVATE_KEY` ile birlikte; `pnpm window recovery-code` yenisini yazdırır, anahtardan ayrı saklayın), `QORE_NETWORK` (`testnet` veya `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; CosmWasm betikleri için `QORE_CODE_ID` ve `QORE_I_KNOW_THIS_IS_MAINNET=yes` (öneri betiği bu olmadan ana ağı reddeder); `viem-wagmi` içinde bir WalletConnect cüzdanı için `VITE_WALLETCONNECT_PROJECT_ID`.

## Nasıl erişilir {#how-to-access}

| | Test ağı | Ana ağ |
|---|---|---|
| Yerel zincir kimliği | `qorechain-diana` | `qorechain-vladi` |
| EVM zincir kimliği (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | yayımlanmadı |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Konsensüs RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Gezgin | `https://explore.qore.network` | `https://explore.qore.network` |

- **Okumalar** hiçbir şey gerektirmez: hesap, anahtar veya pencere yok.
- **EVM katmanında gönderim**, fonlanmış bir hesap, zincirde kayıtlı (bir kez) ML-DSA-87 anahtarı ve açık bir pencere gerektirir. Anahtar kaydı ve pencere yerel katman işlemleridir.
- **Maliyet.** Ücret tabanı her iki ağda gaz başına 0,1 uqor'dur. Okuma ücretsizdir. Test ağı QOR'u [Musluk](/dashboard/faucet) sayfasından gelir.
- **CosmWasm.** Hiçbir ağda yönetişim olmadan kod yükleme yok; ana ağda yönetişim olmadan örnekleme yok. Ana ağda 27 Ekim 2026'da ve 4 Kasım 2026'da depolanmış kod yoktu.
- **Node ve araç sürümleri.** Yukarıdaki kurulum tablosuna bakın.

## Nerede yayımlandı {#where-published}

Sürümler 11 Kasım 2026'da kayıt defterlerinden canlı okundu. GitHub etiketi `v0.12.0` mevcut. Beş npm paketinin ayrıca aynı kit içeriğini taşıyan bir 0.11.0 sürümü de vardır (29 Ekim 2026); Python, Rust, Go ve Java SDK'ları doğrudan 0.10.0'dan 0.12.0'a geçti ve her dil 0.13.0'dadır.

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| npm | `@qorechain/evm` | 0.13.0 | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.13.0 | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.13.0 | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.13.0 | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.13.1 (yedi şablon) | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (`viem-wagmi` tarafından kullanılır) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.13.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.13.0 | https://crates.io/crates/qorechain-sdk |
| Go proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.13.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.13.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Kaynak: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), etiket `v0.13.0`; yollar `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, QoreChain Association tarafından sürdürülür.

## Sınırlar ve bilinen sorunlar {#limits}

- **npm'deki 0.11.0 geçersiz kılındı.** 0.13.0'ı kullanın; 0.11.0 yalnızca npm'de vardır ve 0.13.0'daki şablonlar `^0.13.0` sürümüne bağlıdır.
- **`@qorechain/evm` pencereyi okur ve mesajı oluşturur; yerel katman işlemlerini imzalamaz veya yayınlamaz.**
- **Hiçbir yardımcı, bir gönderimden önce otomatik olarak pencere açmaz**, bu bilinçli bir tasarımdır.
- **`viem-wagmi` şablonundaki QoreX cüzdanı** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` ve `wallet_switchEthereumChain` çağrılarını yanıtlar; EVM imzalama metotları henüz mevcut değildir. Bağlanmak ve okumak için kullanın, imzalamayı enjekte edilmiş bir EIP-1193 cüzdanıyla yapın.
- **Şablonların `pnpm window` yardımcısı, ML-DSA-87 anahtarını `QORE_MNEMONIC` değerinden, `PRIVATE_KEY` kullanıyorsanız `QORE_PQC_RECOVERY_CODE` değerinden türetir** (`PRIVATE_KEY` var ve kod yoksa bir mesajla durur). Hesabın anahtarı başka bir cüzdan tarafından kaydedildiyse, pencereyi o cüzdandan açın.
- **Herkese açık uç noktalarda kullanılamayanlar:** blob işlemleri, izleme ve `debug`, `personal`, `admin` ve `miner` ad alanları.
- **CosmWasm yükleme, her iki ağda da yönetişim üzerinden geçer**; `cosmwasm` şablonu tek başına kod depolayamaz.
- **Diğer araçlara katkılar** (viem, Sourcify, Scaffold-ETH 2) depoda hazırlanmış dosyalardır, yukarı akışa birleştirilmemiştir.
- **Ana ağdaki EVM precompile'ları:** hiçbiri etkin değildir. `pqcVerify` (`0x0A01`) ve `pqcKeyStatus` (`0x0A02`) yalnızca test ağında etkindir.
- **Ağ durumu tarihlidir.** Ücret rakamları 27 Ekim 2026'da okundu ve 4 Kasım 2026'da yeniden denetlendi; blok süreleri 27 Ekim 2026'da okundu.

## Güvenlik notları {#security}

- Pencere tasarımı, bir EVM kütüphanesinin tuttuğu secp256k1 anahtarının harcamayı tek başına asla yetkilendiremeyeceği anlamına gelir: bir pencere açmak, hesabın ML-DSA-87 anahtarıyla hibrit bir imza gerektirir. Pencereleri küçük tutun (`blocks`, `maxTxs`, `maxValue`) ve mümkün olduğunda `nativeOnly` veya `allowedTargets` kullanın.
- `maxValue`, her işlemin azami ücretini içerir; yalnızca değere göre değil, `evmWindowCost` ile boyutlandırın.
- Şablonlar anahtarları git tarafından yok sayılan `.env` dosyasından okur; `.env.example` yer tutucular içerir. Hardhat kullanıcıları anahtarı `npx hardhat keystore set PRIVATE_KEY` ile şifreli olarak saklayabilir.
- Herkese açık BIP-39 test ifadesini (11 kez tekrarlanan `abandon`, ardından `about`) asla fonlamayın.
- Bir ana ağ CosmWasm önerisi için, oylayanların ikili dosyayı doğrulayabilmesi amacıyla kaynağı ve yeniden üretilebilir bir derlemeyi yayımlayın (optimize edici sağlama toplamını yazdırır).
- Güvenlik açıklarını özel olarak security@qore.network adresine bildirin.

## İlgili sayfalar {#related}

- [Geliştirici paketlerine genel bakış](/developer-tools/overview) ve [İskele araçları ve CLI](/developer-tools/scaffolders-and-cli) (`create-qorechain-dapp` 0.13.1)
- [SDK'ya genel bakış](/sdk/overview), [SDK kurulumu](/sdk/install) ve [EVM kılavuzu](/sdk/guides/evm) (pencere, kapsamlı pencereler, EIP-7702 onayı, precompile'lar)
- [EVM geliştirme](/developer-guide/evm-development) ve [EVM Precompile'ları](/developer-guide/evm-precompiles#network-status)
- [QoreChain Native geliştirme](/developer-guide/cosmwasm-development) (CosmWasm ve yönetişim önerileri)
- [QoreX entegrasyonları](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (yerel katmanda hibrit imzalama)
- [QoreScan](/developer-tools/qorescan) (Solidity kaynaklarında `ecrecover` ve PQC precompile kullanımının envanteri)
