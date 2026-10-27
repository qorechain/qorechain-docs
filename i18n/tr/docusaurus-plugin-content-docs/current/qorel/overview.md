---
slug: /qorel/overview
title: QORel Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QORel

QORel, QoreChain'in IBC relayer'ıdır. Relayer, iki zincir arasında IBC paketlerini, kanıtlarını ve istemci güncellemelerini taşıyan programdır; çalışan bir relayer olmadan bir IBC kanalı üzerindeki transfer beklemede kalır. QORel, bir QoreChain kanalının rölesini çalıştırmak isteyen operatörler, doğrulayıcılar ve ekipler için ve QoreChain'e işlem gönderebilen bir relayer'a ihtiyaç duyan herkes içindir.

QoreChain, her yerel hat işleminde hibrit kuantum sonrası imza (secp256k1 artı ML-DSA-87, FIPS 204) ister; standart bir relayer bunu üretmez, bu yüzden QoreChain onun işlemlerini reddeder. QORel, QoreChain için bu imzayı ekler ve diğer tüm Cosmos SDK zincirlerini standart biçimde imzalar. Tek bir ikili dosyadır (`qorel`) ve Apache-2.0 lisansıyla yayımlanır. Informal Systems'in yazdığı IBC relayer'ı (Apache-2.0) [Hermes](https://github.com/informalsystems/hermes) 1.13.3'ün bir çatalıdır; relayer motorunun emeği onlara aittir ve QORel, ek imza gerektirmeyen her zincir için Hermes'in komutlarını ve yapılandırmasını korur.

QORel 0.1.0 **yalnızca testnet içindir**. QoreChain testnet'i `qorechain-diana` ile Cosmos Hub genel testnet'i (zincir kimliği `provider`) arasında röle yapmıştır. Mainnet IBC henüz açık değildir; mainnet desteği, orada bir kanal açıldığında gelecektir.

## Yenilikler {#innovations}

- **Zincir başına imzalama modu.** Yapılandırmadaki her zincirin bir `signing` ayarı vardır. `'qorechain-hybrid'`, QoreChain'in doğruladığı ML-DSA-87 imzasını ekler. Varsayılan olan `'standard'` ise işlemleri bayt bayt Hermes gibi üretir; böylece aynı QORel süreci QoreChain'i ve Cosmos Hub tarafını yan yana röleler.
- **Takılabilir bir imzalayıcı katmanı.** `qorel-signer` crate'i, bir kuantum sonrası ilkeli, bir zincirin sign-bytes kurallarını ve bir işlem uzantısı imzalayıcısını ayrı parçalar olarak tanımlar. Relayer bunu, auth info kesinleştikten sonra ve klasik imza belgesi oluşturulmadan önce çağırır; gas simülasyonu da aynı yoldan geçer. Farklı bir ek imzası olan bir zincir, relayer'da değişiklik değil, o crate'te yeni bir framer gerektirir. Sözleşme için [Her dilden imzalama](/qorel/signing-from-any-language) sayfasına bakın.
- **Anahtar komutlarında kuantum sonrası anahtar yönetimi.** `qorel keys add`, ML-DSA-87 anahtarını hesapla aynı mnemonic'ten QoreChain cüzdan türetmesiyle türetir; böylece relayer anahtarı, QoreX veya SDK'nın türeteceği anahtarla eşleşir. `qorel keys register-pqc`, açık anahtarı bir sahiplik kanıtıyla birlikte bir kez kaydeder. `qorel keys pqc-status`, anahtarın hazır olup olmadığını bildirir.
- **Her gönderimden önce bir kontrol.** Hibrit bir zincire her işlemden önce QORel, kuantum sonrası anahtarın zincirde kayıtlı olduğunu ve yerelde tuttuğu anahtarla aynı olduğunu doğrular ve sign-bytes sürümünü zincirden okur. Herhangi bir sorun varsa hiçbir şey göndermez; böylece zincirin reddedeceği bir işlem için ücret harcanmaz.
- **QoreChain'in ücret pazarından gas fiyatı.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'`, sabit bir tahmin kullanmak yerine zincirin temel ücretini (taban gas başına 0,1 uqor) okur.
- **ibc-go v10 zincirlerinde kötü davranış tespiti.** ibc-go v10 artık başlığı `update_client` olaylarına koymaz ve standart Hermes 1.13 bu zincirlerde kötü davranış tespitini kapatır. QORel bunun yerine başlığı `MsgUpdateClient` işleminden okur; böylece tespit çalışmaya devam eder.
- **Hız sınırlı uç noktalara dayanıklılık.** Bir röle veya temizleme denemesi başarısız olduğu sürece (örneğin genel bir uç nokta kısa süre `429` yanıtı verdiğinde) paket çalışanları ayakta kalır ve her temizleme aralığında yeniden dener. Yalnızca bir temizleme turu başarılı olduktan sonra boşta kalma nedeniyle dururlar.
- **Yalnızca sahibin okuyabildiği anahtar dosyaları.** Saklanan kuantum sonrası seed dahil anahtar dosyaları 0600 kipiyle yazılır.
- **Canlı bir ağda kanıtlandı.** QoreChain testnet'indeki ilk IBC kanalı olan `qorechain-diana` üzerindeki `transfer/channel-0` ile Cosmos Hub genel testnet'indeki `channel-600`, QORel tarafından röleleniyor. Transferler her iki yönde, aktarılan bir token'ın geri döndürülmesi ve süresi dolan bir transferin otomatik iadesi de test edildi. Bkz. [Test kanalı](/user-guide/bridging-assets#ibc-test-channel).

Her sürümün tam listesi [Yenilikler](/qorel/whats-new) sayfasındadır.

## Canlı testnet bağlantısı {#testnet-connection}

| | `qorechain-diana` | Cosmos Hub genel testnet'i (`provider`) |
|---|---|---|
| Hafif istemci | `07-tendermint-0` | `07-tendermint-466` |
| Bağlantı | `connection-0` | `connection-315` |
| Kanal | `transfer/channel-0` (`STATE_OPEN`, sırasız, sürüm `ics20-1`) | `transfer/channel-600` |

Bu bağlantıda iki token izi vardır. QoreChain testnet'indeki ATOM `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2`'dir (iz `transfer/channel-0/uatom`). Hub testnet'indeki QOR `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A`'dır (iz `transfer/channel-600/uqor`). Bu yolu ekleyen bir chain-registry çekme isteği ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)) açıktır ve birleştirilmemiştir. Mainnet'te IBC kanalı yoktur.

Test edilenler: her iki yöndeki transferler (1 QOR çıkış, 0,1 ATOM giriş, 0,4 QOR geri dönüş) ve 1 saniyelik zaman aşımına sahip bir transferin, zaman aşımı mesajı olarak röle edilen otomatik iadesi. `qorechain-diana` üzerindeki 13 relayer işleminin tümü başarılı oldu (kod 0).

### Üçüncü taraf bir relayer'ın ihtiyaçları {#third-party}

Testnet yalnızca `07-tendermint` hafif istemci türünü kabul eder (`/ibc/core/client/v1/params`, `allowed_clients = ["07-tendermint"]` listeler); bugün hiçbir `08-wasm` istemcisi oluşturulamaz. QoreChain'e bir kanal açmak için bir relayer'ın şunlara ihtiyacı vardır:

- her iki tarafta bir `07-tendermint` istemcisi;
- QoreChain tarafında, ML-DSA-87 anahtarı kayıtlı olan bir relayer hesabının hibrit imzaladığı her işlem. QORel bunu yapar; standart Hermes, Go relayer'ı (`rly`) ve ts-relayer reddedilir;
- sürümü `ics20-1` olan bir ICS-20 transfer kanalı.

IBC v2 istemci yapılandırması için de bir relayer izin listesi yoktur (`/ibc/core/client/v2/config/07-tendermint-0`, `allowed_relayers: []` yanıtı verir). IBC v2 paketleri mutlak Unix-saniye zaman aşımları kullanır. QORel henüz IBC v2 röle etmez.

## qorel-signer {#qorel-signer}

İmzalayıcı, QORel deposunda `crates/qorel-signer` altında yer alan ayrı bir crate'tir: `qorel-signer`. crates.io'da değildir; ona bir git bağımlılığı olarak bağlanın. Neyi garanti eder:

- **Takılabilir ortak imzalayıcı.** Bir zincirin ek imzası bir ortak imzalayıcı tarafından eklenir ve standart imzalamalı zincirler hiçbirini kullanmaz, böylece onların işlemleri değişmez.
- **Ham protobuf baytları.** Kodlanmış baytlar üzerinde çalışır ve hiçbir IBC veya relayer türüne bağlı değildir.
- **Bir gövde politikası.** Zincirin reddedeceği gövdeleri reddeder: mevcut bir kritik uzantı seçeneği, `unordered` bayrağı veya bilinmeyen alanlar.
- **Sürümü tahmin etmeme.** sign-bytes sürümü bilinmeden önce QoreChain ağlarında asla v1 sign bytes'a geri dönmez.
- **Kendi kendine doğrulanan imzalar.** Her imza kullanılmadan önce doğrulanır.
- **Gizli veriler korunur.** Gizli veriler sıfırlanır ve `Debug` çıktısında gizlenir.
- **Bayt bayt testler.** Testler, zincirin ante handler'ının kabul ettiği röle işlemlerini bayt bayt yeniden oluşturur.

Bir kullanım örneği depodaki `crates/qorel-signer/README.md` dosyasındadır; ayrıca bkz. [Her dilden imzalama](/qorel/signing-from-any-language#signer-layer). Aynı imzalayıcı kancası üst akımda Hermes'e [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) olarak sunulmuştur (açık, birleştirilmemiş).

## Nasıl kullanılır {#how-to-use}

İkili dosyayı kurun, zincir başına bir giriş içeren bir yapılandırma yazın, her zincir için bir anahtar ekleyin, kuantum sonrası anahtarı QoreChain'e kaydedin, hazır olma durumunu kontrol edin, sonra relayer'ı başlatın:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

Bu bölümdeki sayfalar:

| Sayfa | Kapsadığı konu |
|---|---|
| [Yenilikler](/qorel/whats-new) | 0.1.0'ın Hermes'in üzerine eklediği şeyler |
| [Kurulum](/qorel/install) | Tarball, `.deb`, `.rpm`, Homebrew, container, kaynaktan derleme ve her birinin doğrulanması |
| [Hızlı Başlangıç](/qorel/quickstart) | Kurulumdan testnet'te ilk transfere |
| [Yapılandırma](/qorel/configuration) | QoreChain zincir girişi, anahtarlar, gas ve güvenlik kontrolleri |
| [Bir doğrulayıcının yanında çalıştırma](/qorel/running-next-to-a-validator) | systemd, Docker Compose ve Kubernetes düzenleri |
| [İzleme](/qorel/monitoring) | Telemetri, nelere alarm kurulmalı |
| [Her dilden imzalama](/qorel/signing-from-any-language) | Hibrit imza sözleşmesi ve beş dil için kütüphaneler |
| [Sorun Giderme](/qorel/troubleshooting) | Sorular ve çözümler |

## Nasıl erişilir {#how-to-access}

- **Ağ.** Yalnızca testnet `qorechain-diana` (testnet v3.2.6 çalıştırır). Mainnet `qorechain-vladi`'nin açık bir IBC kanalı yoktur; her ağda neyin olduğu için [Varlıkları Köprüleme](/user-guide/bridging-assets#ibc-testnet-v326) sayfasına bakın.
- **Karşı taraf.** Cosmos Hub genel testnet'i, zincir kimliği `provider`, `channel-600` üzerinden. Başka herhangi bir Cosmos SDK zinciri, örnek yapılandırmadaki `provider` girişiyle aynı biçimde çalışır.
- **Uç noktalar.** QORel her zincir için bir konsensüs RPC'sine, bir WebSocket'e ve bir gRPC uç noktasına ihtiyaç duyar. QoreChain testnet'inin genel RPC'si (`https://rpc-testnet.qore.host`) ve REST'i (`https://api-testnet.qore.host`) vardır ancak bugün genel bir gRPC uç noktası yoktur ve bir söz de verilmemiştir; bu yüzden `qorechain-diana` için üçüncü taraf bir relayer'ın kendi testnet düğümüne ihtiyacı vardır ([Düğüm Çalıştırma](/developer-guide/running-a-node), [Test Ağına Bağlanma](/getting-started/connecting-to-testnet)). Relayer'lara hız sınırı uygulayan genel uç noktalar kısa bir test için kullanılabilir, ancak sürekli röle için kullanılamaz.
- **Hesaplar.** Her zincirde, ücretler için küçük bir bakiyesi olan özel bir relayer hesabı. Testnet QOR'u [Dashboard Musluğu](/dashboard/faucet)'ndan gelir; hiçbir değeri yoktur. Asla bir doğrulayıcı operatör anahtarı kullanmayın.
- **Maliyet.** QORel ücretsizdir. QoreChain'de bir işlemin maliyeti gas çarpı fiyattır; taban gas başına 0,1 uqor'dur ve ücretin tamamı iade edilmeden tahsil edilir.
- **Platformlar.** Linux x86_64 ve arm64 (glibc 2.28 veya üzeri), macOS Apple Silicon ve Intel ve diğer her şey için bir container imajı. Windows desteklenmez; WSL2 altında container kullanın.

## Nerede yayımlanır {#where-published}

| Nerede | Ne | Sürüm |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | Kaynak, sorunlar ve tarball'ların, `.deb`, `.rpm`, `SHA256SUMS` ve derleme doğrulamalarının bulunduğu sürüm sayfası | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Container imajı (amd64 ve arm64, distroless, root olmayan, cosign imzalı) | 0.1.0 |
| `qorel-signer` crate'i | İmzalayıcı katmanı, depoda `crates/qorel-signer` altında; bir git bağımlılığı kullanın | crates.io'da yok |

Lisans: Apache-2.0. QORel, telif hakkı Informal Systems Inc. ve Hermes yazarlarına ait olan, o da Apache-2.0 olan Hermes'ten türetilmiştir; deponun `NOTICE` dosyası atıfı içerir. Komutlar ve bir indirmenin nasıl doğrulanacağı için [Kurulum](/qorel/install) sayfasına bakın.

Diğer geliştirici paketleri için [Geliştirici Paketleri](/developer-tools/overview) sayfasına bakın. IBC'nin zincire nasıl oturduğu için [Köprü Mimarisi](/architecture/bridge-architecture#ibc-relayer) sayfasına bakın.

## Sınırlar ve bilinen sorunlar {#limits}

- **Yalnızca testnet.** QORel, `qorechain-diana` ve Cosmos Hub genel testnet'ine karşı çalıştırıldı. Mainnet'te röle yapmadı ve açık bir mainnet IBC kanalı yok.
- **Yalnızca IBC v1 (klasik).** IBC v2 röleleme QORel'de henüz uygulanmadı; bir sonraki aşamadır. Ethereum (Eureka) röleleme başlatılmadı.
- **Zincir sürümü.** Hibrit mod, zincirin bildirdiği sign-bytes sürümünü izler. Her iki QoreChain ağı da bugün güncel biçimi (sürüm 2) doğrular.
- **Barındırılan relayer yok.** Bu kılavuz bir relayer hizmeti sunmaz. Bir kanal için çalışan relayer yoksa, bir tane çalışana kadar transfer beklemede kalır.
- **Genel uç noktalar.** QoreChain tarafı, genel olmayan gRPC gerektirir. Diğer zincirler için üçüncü taraf genel uç noktalar relayer'lara sıklıkla hız sınırı uygular.
- **Bir cüzdan değildir.** QORel yalnızca bir relayer olarak gönderdiği işlemleri imzalar. Cüzdan imzalama için [QoreSign](/qoresign/overview) sayfasına bakın.
- **Windows derlemesi yok.** WSL2 altında container kullanın.
- **Sürüm durumu.** QORel bir 0.x sürümüdür. Hermes ile aynı olan komutlar ve ayarlar Hermes'in davranışını korur; QoreChain'e özgü ayarlar 1.0'dan önce hâlâ değişebilir.
