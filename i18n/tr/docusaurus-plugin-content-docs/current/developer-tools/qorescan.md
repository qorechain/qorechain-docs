---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community, bir QoreChain dağıtımının kriptografisini envanterleyen ve sonucu bir CycloneDX 1.6 CBOM (kriptografik malzeme listesi) olarak yazan bir komut satırı aracıdır. Bir düğümün ana dizinini, ağın canlı durumunu, TLS uç noktalarını ve Solidity kaynaklarını okur ve bulduğu her algoritmayı, protokolü, sertifikayı ve anahtarı, bulunduğu dosya ve satırla ya da uç noktayla birlikte kaydeder.

Doğrulayıcı ve düğüm operatörleri, uyumluluk ve risk ekipleri, kanıt dosyası hazırlayan denetçiler ve sözleşmelerinin hangi imza şemalarına bağlı olduğunu bilmek isteyen Solidity ekipleri içindir. CBOM'dan; FINMA Guidance 05/2026'ya, AB NIS İşbirliği Grubu'nun kuantum sonrası yol haritasına ve BT risk yönetimine ilişkin DORA RTS'ye (Madde 6) eşlenmiş Markdown raporları üretir; her algoritma için FIPS 203, 204 ve 205 ile NIST IR 8547'ye göre bir durum içerir.

Sürüm **0.1.0**, 27 Ekim 2026'da yayımlandı, Apache-2.0. Ana ağı (`qorechain-vladi`) ve test ağını (`qorechain-diana`) herkese açık REST uç noktaları üzerinden ya da işaret ettiğiniz herhangi bir REST uç noktası üzerinden okur.

QoreScan bir envanter yardımcısıdır. Bir sertifikasyon, denetim ya da hukuki görüş değildir ve herhangi bir düzenlemeye ya da standarda uygunluğu kanıtlamaz. Taramanın belirleyemediği her şey "To be completed" olarak bırakılır.

## Yenilikler {#innovations}

- **Standart biçimde bir CBOM.** Her bulgu, `cryptoProperties` (varlık türü, ilkel, parametre kümesi, eğri, klasik güvenlik düzeyi, NIST kuantum güvenlik kategorisi, OID) ve `evidence.occurrences` (dosya ve satır ya da uç nokta) içeren bir CycloneDX 1.6 `cryptographic-asset` bileşenidir. Sertifikalar imza algoritmalarına ve açık anahtarlarına, protokoller kullandıkları algoritmalara, kütüphaneler sağladıkları algoritmalara bağlanır. Projenin testlerinde yazılan her CBOM resmi CycloneDX 1.6 JSON şemasına karşı doğrulanır ve kullanılan her `bom-ref`'in tanımlı olduğu denetlenir; böylece çıktı her CycloneDX 1.6 tüketicisinde yüklenir.
- **Zincire duyarlı kaynaklar.** Dosyaların ve TLS'nin yanı sıra QoreChain'in kendisini de okur: PQC parametrelerini, PQC ile ilgili protokol anahtarlarını, etkin doğrulayıcı kümesinin uzlaşı anahtarı türlerini ve etkin EVM precompile'larını; adını verdiğiniz her hesap için de kayıtlı bir PQC anahtarı olup olmadığını, algoritmasını, anahtar türünü (hibrit, yalnızca PQC, yalnızca klasik) ve açık anahtar boyutunu okur.
- **Hibrit anahtar değişimi görünür.** Uç nokta başına bir TLS el sıkışması; sürümü, şifre takımını, anahtar değişim grubunu (`X25519MLKEM768` gibi hibrit ML-KEM grupları dahil), ALPN'yi, SNI'yi ve sunucunun gönderdiği her sertifikayı kaydeder.
- **Gizli anahtar değerleri asla okunmaz.** Anahtar dosyaları, gizli anahtar için alanı olmayan yapılara çözülür; bu yüzden o baytlar asla çözülmez, saklanmaz, günlüğe kaydedilmez ya da çıktıya yazılmaz. Bu yapılar özel veri taşıyabilecek bir alan kazanırsa bir test başarısız olur; başka bir test de yeni üretilmiş anahtarlarla bir düğüm ana dizinini tarar ve bunların hiçbir kodlamasının herhangi bir çıktıda görünmediğini denetler.
- **Her algoritma bir sınıflandırma ve geçiş durumu alır.** `post-quantum`, `hybrid`, `quantum-vulnerable` veya `symmetric`; tanımlı olduğunda NIST kuantum güvenlik kategorisiyle ve FIPS 203, 204, 205 ile NIST IR 8547 takvimine göre durumuyla.
- **Yeniden üretilebilir çıktı.** CBOM zaman damgası, geçerli zamandır ya da ayarlıysa `SOURCE_DATE_EPOCH`'tur. Seri numarası içerikten türetilir; böylece aynı girdi aynı zamanda aynı belgeyi verir.
- **Çalıştırdıklarını denetleyen sarmalayıcılar.** npm ve PyPI paketleri platformunuz için sürüm ikilisini istek üzerine indirir ve SHA-256 özetini paketin içinde gelen özetlerle karşılaştırır. Eşleşmeyen bir ikiliyi, hem indirmeden sonra hem de önbellekteki kopyanın sonraki her çalıştırmasında reddeder. `npm install` sırasında hiçbir kurulum betiği çalışmaz.
- **İkilide üçüncü taraf kod yok.** `qorescan` ikilisi tarama için Go standart kütüphanesini kullanır (JSON şema doğrulayıcı testleri tarafından kullanılır). PQCA CBOMkit projelerinden hiçbir kodu yeniden kullanmaz; çıktısı CBOMkit görüntüleyicisinde yüklenir.

## Kullanım senaryoları {#use-cases}

1. **Bir denetleyici için CBOM hazırlayan uyumluluk ekibi.** Bir QoreChain düğümü işleten İsviçreli bir finans kuruluşu, dağıtılmış defter teknolojisi dahil BT sistemlerindeki kriptografik yöntemlerin envanterini göstermek zorundadır (FINMA Guidance 05/2026, bölüm 3.2). `qorescan scan --node-home ... --network mainnet` komutunu çalıştırır, CBOM'u ve `qorescan report --framework finma` çıktısını risk analizine ekler ve kurumsal bölümleri elle tamamlar.
2. **Kendi düğümünü denetleyen doğrulayıcı.** Bir operatör, doğrulayıcının hangi uzlaşı anahtarı türünü kullandığını, anahtar dosyalarının diğer kullanıcılar tarafından okunabilir olup olmadığını, RPC veya EVM JSON-RPC dinleyicilerinin TLS olmadan açıkta olup olmadığını ve bir uzak imzalayıcının yapılandırılıp yapılandırılmadığını doğrulamak ister. `qorescan scan --node-home ~/.qorechain` bunların hepsini gizli anahtar değerlerini açmadan kaydeder.
3. **Hesaplara güvenmeden önce denetim.** Bir saklama masası ya da borsa entegrasyon ekibi, hazine veya sıcak cüzdan adreslerinin kayıtlı bir ML-DSA-87 anahtarı olup olmadığını ve bunun hibrit olup olmadığını bilmek ister. `qorescan scan --network mainnet --address qor1... --address qor1...` her hesabın PQC anahtar durumunu CBOM'a yazar. Bkz. [saklama seti](/developer-tools/custody-kit).
4. **Sözleşmeleri taşıyan Solidity ekibi.** Sözleşmelerini Ethereum'dan taşıyan bir ekip, `ecrecover`, OpenZeppelin `ECDSA`, P-256 veya RSA'ya bağlı her yerin ve QoreChain PQC precompile'larını zaten çağıran her yerin bir listesini ister. `qorescan solidity ./contracts` her kullanımı dosya ve satırla listeler.
5. **Uç nokta incelemesi.** Bir platform ekibi, herkese açık RPC, REST veya cüzdan API uç noktalarının modern istemcilerle hibrit bir kuantum sonrası anahtar değişimi üzerinde anlaşıp anlaşmadığını bilmek ister. `qorescan tls api.example.org:443` uzlaşılan grubu, şifre takımını ve sertifika zincirini kaydeder.
6. **Her çekme isteğinde CI kapısı.** Bir dApp deposu QoreScan GitHub Action'ını ekler; böylece her değişiklik derleme çıktısı olarak yeni bir CBOM ve bir DORA ya da FINMA raporu üretir ve gözden geçirenler kod tabanına yeni bir imza şeması ya da hash girdiğinde bunu görebilir.
7. **Tedarikçi durum tespiti.** Düzenlemeye tabi bir şirket, bir hizmet sağlayıcıya `qorescan template questionnaire` çıktısını gönderir; çıktı, o sağlayıcının uç noktalarının taramasının zaten gösterdikleriyle önceden doldurulmuştur, böylece sağlayıcı yalnızca açık maddeleri yanıtlar.
8. **NIS yol haritasına ve DORA'ya hazırlanan AB kuruluşları.** Bir kuruluş, envanterinin kriptografik varlık yönetimi adımını ve DORA RTS Madde 6'yı nerede beslediğini göstermek için `qorescan report --framework nis` ve `--framework dora` kullanır.

## Nasıl çalışır {#how-it-works}

### Kaynaklar {#sources}

- **Düğüm ana dizini** (`--node-home DIR`). `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` ve bunların andığı sertifika dosyalarını okur. P2P aktarımını ve algoritmalarını, RPC ve EVM JSON-RPC TLS sertifikalarını, TLS olmadan loopback dışı adreslerdeki dinleyicileri, bir uzak imzalayıcıyı, doğrulayıcı ve düğüm anahtar türlerini ve açık anahtarlarını, anahtar dosyası izinlerini, genesis `pqc` modülü parametrelerini, genesis'teki zincir üstü algoritma kaydını ve doğrulayıcı uzlaşı anahtarı türlerini kaydeder.
- **Ağ** (`--network mainnet|testnet` veya `--rest URL`). PQC ile ilgili protokol anahtarlarını, `pqc` parametrelerini, etkin doğrulayıcı kümesinin uzlaşı anahtarı türlerini ve etkin EVM precompile'larını REST üzerinden okur.
- **Hesaplar** (`--address ADDR`, tekrarlanabilir). Her hesabın kayıtlı PQC anahtarını REST üzerinden okur.
- **TLS** (`--tls HOST:PORT`, tekrarlanabilir). Uç nokta başına bir el sıkışma.
- **Solidity** (`--solidity PATH`, tekrarlanabilir). `ecrecover`, ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) ve P-256 (`0x100`) precompile'larına yapılan çağrıların, `keccak256`, `sha256`, `ripemd160` kullanımının ve OpenZeppelin, Solady ve `IQorePQC.sol` imza kütüphanelerinin içe aktarımlarının metin tabanlı tespiti. pqcVerify ve pqcKeyStatus precompile'ları yalnızca testnet'te etkindir; mainnet'te hiçbiri etkin değildir. Bkz. [EVM precompile'ları](/developer-guide/evm-precompiles).

### Ağ okumaları {#network-reads}

Ağa yapılan her istek bir HTTP GET'tir. Okunan rotalar düğüm bilgisi rotası, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, en son doğrulayıcı kümesi rotası, `/cosmos/evm/vm/v1/params` ve `/qorechain/pqc/v1/account/{address}`'tir. Bir düğümün sunmadığı bir rota hata değil, CBOM'da bir nota dönüşür.

### Sınıflandırma {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) ve LMS/XMSS `post-quantum`'dur. ML-KEM ile birleştirilmiş klasik bir anahtar değişimi `hybrid`'dir. RSA, ECDSA, EdDSA, sonlu cisim ve eliptik eğri Diffie-Hellman ve eşleme tabanlı imzalar `quantum-vulnerable`'dır; NIST IR 8547 takvimi "deprecated after 2030, disallowed after 2035" şeklindedir. Blok şifreleri, AEAD'ler, hash'ler, XOF'lar ve KDF'ler `symmetric`'tir. QoreScan, kuantum maruziyeti aynı olduğu için IR 8547 takvimini secp256k1 ve X25519 dahil ECDSA, EdDSA ve ECDH ailelerinin her eğrisine uygular. Bunlar envanter sınıflandırmalarıdır, NIST onayına ilişkin beyanlar değildir.

### Çıktı {#output}

QoreScan birkaç `qorescan:*` özelliği ekler (sınıflandırma, NIST IR 8547 geçişi, standart, kaynak) ve taranan olguları, notları ve bir sorumluluk reddi özelliğini CBOM üst verisine kaydeder. Kanıt yolları taranan dizine göredir.

Bir rapor; çerçeve eşleme tablosunu, sınıflandırmaya göre bir özeti, her algoritmayı NIST kategorisi, FIPS 203, 204, 205 ve NIST IR 8547'ye göre durumu ve kanıtıyla, ardından protokolleri, sertifikaları, anahtarları, kütüphaneleri, taranan olguları, tarama notlarını ve atıf yapılan kaynakları içerir. Kurumsal maddeler "To be completed" olarak yazılır.

### Çerçeve eşleme {#frameworks}

| Çerçeve | Kaynak | Envanterin girdi olarak hizmet ettiği yer |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing", 9 Temmuz 2026, bölüm 3 | 3.2 envanter (CBOM); 3.3 kritik veriler (taranan aktarımların anahtar değişimi, yerel hat hibrit imza modu); 3.4 kripto çevikliği (algoritma kaydı, geçiş dönemi, protokol anahtarları); 3.5 sağlayıcılar (sertifika düzenleyicileri, anket). 3.1 strateji kurumsaldır. |
| `nis` | NIS İşbirliği Grubu, "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Bölüm 1, v1.1, 11 Haziran 2025 | Kriptografik varlık yönetimi (CBOM); 2030 ve 2035 kilometre taşları (kuantuma karşı savunmasız algoritmaların listesi); çeviklik. |
| `dora` | Commission Delegated Regulation (EU) 2024/1774, Madde 6 | 6(2)(a) ve (c) aktarım kayıtları ve TLS olmayan dinleyiciler; 6(2)(d) anahtar kayıtları (türler ve açık anahtarlar); 6(3) her algoritma, FIPS ve NIST IR 8547'ye karşı; 6(4) kayıt, geçiş dönemi, protokol anahtarları. 6(1) ve 6(5) kurumsaldır. |

## Nasıl kullanılır {#how-to-use}

### Kurulum {#install}

| Kanal | Kurulum komutu | Asgari platform |
|---|---|---|
| Sürüm ikilisi | `qorescan_0.1.0_<os>_<arch>` dosyasını (veya `.tar.gz` ya da `.zip`; Windows ikilileri `.exe` ile biter) [GitHub sürümünden](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) indirin ve `qorescan_0.1.0_checksums.txt` ile denetleyin | amd64 veya arm64 üzerinde macOS, Linux ya da Windows |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 veya üzeri |
| PyPI | `pipx run qorescan scan ...` (veya `pip install qorescan`) | Python 3.9 veya üzeri |
| Docker | depodan `docker build -t qorescan .` (önceden derlenmiş görüntü yayımlanmaz) | Docker; görüntü distroless'tır ve 65532 kullanıcısı olarak çalışır |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | GitHub tarafından barındırılan veya kendi barındırdığınız runner; action, QoreScan'i `actions/setup-go` ile kendi kaynağından derler |

Her iki sarmalayıcı için ortam değişkenleri:

| Değişken | Etki |
|---|---|
| `QORESCAN_CACHE_DIR` | İkilinin önbelleğe alındığı yer (varsayılan: kullanıcı önbellek dizini). |
| `QORESCAN_DOWNLOAD_BASE` | GitHub yerine bir yansıdan indirir. Özet denetimi yine de uygulanır. |

### Hızlı başlangıç {#quickstart}

QoreScan GET istekleri ve uç nokta başına bir TLS el sıkışması gönderir, hiçbir şey imzalamaz ve anahtar gerektirmez. Aşağıdaki komutlar 27 Ekim 2026'da, v0.1.0 kaynağından derlenmiş bir ikiliyle herkese açık testnet'e karşı çalıştırıldı.

**1. Testnet durumunu, bir hesabı, herkese açık testnet REST uç noktasının TLS'sini ve bir Solidity kaynak klasörünü tarayın:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

0 koduyla çıktı. CBOM, diğerlerinin yanı sıra şunları kaydetti: `qorechain-diana` zincir kimliği, yerel hat hibrit imza modu `required`, hesabın hibrit PQC anahtarı (testnet musluk hesabı), doğrulayıcı kümesinin Ed25519 uzlaşı anahtarları, `X25519MLKEM768` hibrit grubuyla TLS 1.3 ve Solidity kaynaklarında bulunan algoritmalar.

Bu sayfa yazılırken yapılan, yalnızca ağ ve TLS bölümlerini içeren ikinci bir çalıştırma, ML-DSA-87, `X25519MLKEM768`, `api-testnet.qore.host:443` için bir TLS 1.3 protokol girdisi, sertifika zinciri ve doğrulayıcı kümesinin Ed25519 anahtarları dahil 21 bileşenli bir CBOM üretti.

**2. CBOM'dan bir FINMA raporu yazın:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

Rapor sorumluluk reddiyle açılır, ardından eşleme tablosu (3.1 ile 3.5 arası bölümler), sınıflandırmaya göre bir özet ve her algoritma için FIPS ve NIST IR 8547 durumu ile kanıtını içeren bir satır gelir. `ecrecover` kullanan tek bir Solidity dosyasının taraması, bir bileşenli (`ECDSA secp256k1`) bir CycloneDX 1.6 CBOM'u ve aynı rapor başlığını üretti. Bilinmeyen bir çerçeve adı 2 koduyla çıkar ve `finma`, `nis` ile `dora`'yı listeleyen bir ileti verir.

**3. Tedarikçi anketini ve çeviklik beyanını önceden doldurun:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Kendi düğümünüzü tarayın.** Düğüm ana dizinine okuma erişimi yeterlidir:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Docker ile, kapsayıcı değiştiremesin diye düğüm ana dizinini salt okunur bağlayın:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. Sarmalayıcılar üzerinden komutlar aynıdır:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. GitHub Actions'ta.** Action'ı ve diğer tüm action'ları commit ile sabitleyin:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Action girdileri: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (boşlukla ya da yeni satırlarla ayrılmış listeler), `out` (varsayılan `qorescan.cbom.json`) ve `framework`. Çıktılar: `cbom` ve `report`. Action, QoreScan'i sabitlenmiş commit'teki kendi kaynağından derler; bu yüzden hiçbir ikili indirilmez.

Bu sayfa için çalıştırılanlar: testnet taraması, Solidity taraması, FINMA raporu ve bilinmeyen çerçeve hatası; v0.1.0 kaynağından derlenmiş bir ikiliyle. Yayımlanmış ikililer, npm ve PyPI sarmalayıcıları (paket içeriklerini ve kayıt defteri girdilerini okumanın ötesinde), Docker görüntüsü ve GitHub Action çalıştırılmadı.

### Komutlar ve bayraklar {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

Bayraklar konumsal bağımsız değişkenlerden önce ya da sonra gelebilir. `--out -` (varsayılan) standart çıktıya yazar. `qorescan <command> -h` bir komutun bayraklarını yazdırır.

| Komut | Bayrak | Ne yapar |
|---|---|---|
| `scan` | `--node-home DIR` | Düğüm ana dizini (`config/` içeren dizin). |
| `scan` | `--network mainnet\|testnet` | Canlı durumu `https://api.qore.host` veya `https://api-testnet.qore.host` adresinden okur. |
| `scan` | `--rest URL` | Bunun yerine herhangi bir REST uç noktasını kullanın, örneğin kendi düğümünüz (`http://127.0.0.1:1317`) ya da GET isteklerini ileten bir aktarıcı. `--network`'ü geçersiz kılar. |
| `scan` | `--address ADDR` | PQC anahtar durumu okunan hesap. Tekrarlanabilir. `--network` veya `--rest` gerektirir. |
| `scan` | `--tls HOST:PORT` | El sıkışılacak TLS uç noktası. Tekrarlanabilir. Belirtilmezse 443 numaralı bağlantı noktası. |
| `scan` | `--solidity PATH` | Dizin veya `.sol` dosyası. Tekrarlanabilir. |
| `scan`, `solidity` | `--include-deps` | Varsayılan olarak atlanan `node_modules`, `lib`, `out`, `cache`, `artifacts` ve `typechain-types` dizinlerini de tarar. |
| `scan` | `--name NAME` | Taranan dağıtımın CBOM üst verisindeki adı. |
| `scan` | `--timeout D` | İstek başına ağ zaman aşımı (varsayılan `20s`). |
| `tls` | `--servername NAME` | SNI sunucu adı (varsayılan: ana makine). |
| `tls` | `--timeout D` | El sıkışma zaman aşımı (varsayılan `15s`). |
| tüm taramalar | `--verbose` | Okunan her dosyayı ve her isteği standart hataya günlüğe yazar. |
| tümü | `--out FILE` | Çıktı dosyası, standart çıktı için `-`. |
| `report` | `--framework finma\|nis\|dora` | Eşlenecek çerçeve. Zorunlu. |
| `report`, `template` | `--cbom FILE` | Okunacak CBOM, standart girdi için `-`. Zorunlu. |
| `template` | `agility` veya `questionnaire` | Hangi şablonun yazılacağı. |

Diğer komutlar: `qorescan tls` tek başına bir TLS taramasıdır, `qorescan solidity` tek başına bir Solidity taramasıdır, `qorescan template agility` taranan olgulardan önceden doldurulmuş bir kripto çeviklik beyanı yazar, `qorescan template questionnaire` FINMA Guidance 05/2026 bölüm 3'ün beş önlemini izleyen beş soruluk bir tedarikçi anketi yazar ve `qorescan report` başka bir araç tarafından yazılmış bir CycloneDX 1.6 CBOM'unu da kabul eder (sınıflandırma o zaman algoritma adına göre yapılır).

Çıkış kodları: `0` başarı, `1` tarama veya G/Ç hatası, `2` kullanım hatası.

## Nasıl erişilir {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Zincir kimliği | `qorechain-vladi` | `qorechain-diana` |
| `--network` tarafından kullanılan REST | `https://api.qore.host` | `https://api-testnet.qore.host` |

- Anahtar, hesap ya da fon gerekmez. QoreScan asla bir işlem imzalamaz ya da göndermez ve adını verdiğiniz çıktı dosyası dışında hiçbir şey yazmaz.
- Bazı rotalar her düğüm tarafından sunulmaz. 27 Ekim 2026'da herkese açık mainnet REST uç noktası `/qorechain/pqc/v1/params` rotasını sunmuyordu; tarama bu durumda bir not kaydeder ve devam eder. Daha eksiksiz bir görünüm için `--rest`'i kendi düğümünüze yönlendirin.
- Zincir üstü algoritma kaydı REST üzerinden sunulmaz. QoreScan bir düğüm ana dizini tarandığında bunu `genesis.json` içinden okur.
- Tarama, okuduğu düğümün zincir sürümünü yansıtır. Protokol anahtarları ve etkin precompile'lar mainnet ile testnet arasında farklıdır; CBOM, sorgulanan düğümün bildirdiğini kaydeder.
- Makineniz herkese açık uç noktalara erişemiyorsa, `--rest`'i işlettiğiniz bir düğümle ya da GET isteklerini ileten bir aktarıcıyla kullanın.
- Bağımlılıklar: npm ve PyPI sarmalayıcıları yalnızca kendi dillerinin yerleşik modüllerini kullanır.

## Güvenlik notları {#security}

- **Gizli anahtar değerleri asla okunmaz.** `priv_validator_key.json` dosyasından QoreScan adresi, açık anahtarı ve anahtar türü adlarını alır. `node_key.json` dosyasından yalnızca anahtar türünü alır; gizli anahtar gerektireceği için düğüm kimliği türetilmez. Ham dosya arabelleği çözümlemeden sonra üzerine yazılır ve girdiyi alıntılayabilecek çözümleme hataları asla döndürülmez.
- Anahtar zinciri dizinleri (`keyring-*`) ve `tls_key_file` ile `tls.key-path` tarafından adlandırılan anahtar dosyaları açılmaz. QoreScan yalnızca var olduklarını ya da yapılandırıldıklarını kaydeder. Bir sertifika dosyasındaki diğer PEM blokları çözülmeden atlanır.
- Her ağ isteği bir HTTP GET'tir. Çıktı dosyası dışında hiçbir şey yazılmaz.
- npm ve PyPI sarmalayıcıları, ikilinin SHA-256 özetini her çalıştırmadan önce doğrular ve bir yansı kullanıldığında da dahil olmak üzere eşleşmeyeni reddeder. 0.1.0 sürümü için npm paketinin içindeki özetler sürümün sağlama toplamı dosyasıyla eşleşir.
- Docker görüntüsü distroless'tır ve root olmayan bir kullanıcı olarak çalışır. Düğüm ana dizinini `:ro` ile bağlayın.
- Güvenlik açıklarını security@qore.network adresine özel olarak bildirin.

## Nerede yayımlandı {#where-published}

Sürümler her kayıt defterinden 27 Ekim 2026'da okundu.

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| GitHub sürümü | `qorechain/qorescan` | v0.1.0 (27 Ekim 2026'da yayımlandı), amd64 ve arm64 üzerinde darwin, linux ve windows için ikililer, artı `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (komut `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 veya üzeri) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go modül proxy'si | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Kaynak: https://github.com/qorechain/qorescan (Apache-2.0, telif hakkı 2026 QoreChain Association). crates.io veya Maven paketi ve önceden derlenmiş Docker görüntüsü yoktur; görüntüyü depodan derleyin. Depo her bayrağı `docs/usage.md` içinde, nelerin okunduğunu ve nelerin asla okunmadığını `docs/scanned-data.md` içinde, çerçeve eşlemesini ve kaynaklarını `docs/frameworks.md` içinde ve sınırları `docs/limitations.md` içinde belgeler.

## Sınırlar ve bilinen sorunlar {#limits}

- **Bir envanter yardımcısı.** Sertifikalandırmaz, denetlemez ya da hukuki tavsiye vermez ve raporları herhangi bir düzenlemeye ya da standarda uygunluğu kanıtlamaz. Kurumsal önlemler (strateji, yol haritası, veri sınıflandırması, sorumluluklar) "To be completed" olarak bırakılır.
- **Kapsam.** QoreScan yalnızca işaret ettiğiniz kaynakları tarar. Saklanan veriler, yedekler, HSM'ler, anahtar yönetim sistemleri, işletim sistemi ve kütüphane yapılandırması, cüzdanlar, köprüler ve zincir dışı hizmetler, TLS uç noktalarını `--tls` ile eklemediğiniz sürece taramanın dışındadır. Köprüleri taramaz.
- **Canlı durum.** Algoritma kaydı `genesis.json` içinden gelir ve ağı genesis anındaki haliyle yansıtır, sonraki yönetişim değişikliklerini değil. Doğrulayıcı uzlaşı anahtarları en son doğrulayıcı kümesi için okunur.
- **TLS.** Go'nun varsayılan istemci tercihleriyle bir el sıkışma, sunucunun modern bir istemciyle neyi müzakere ettiğini gösterir; kabul ettiği her sürümü, takımı veya grubu göstermez. Bir yük dengeleyicinin arkasındaki bir uç nokta başka bir bağlantıda farklı yanıt verebilir.
- **Uzak imzalayıcılar.** `priv_validator_laddr` ayarlandığında doğrulayıcı anahtarı başka bir yerde bulunur ve türü düğüm ana dizininden görünmez.
- **Solidity.** Tespit metin tabanlıdır. İçe aktarımları çözmez, kalıtımı izlemez ve çalışma zamanında adres hesaplamaz. Çalışma zamanında oluşturulan bir precompile adresi gözden kaçar ve bir desenle aynı adlandırılmış bir değişken bildirilebilir. `--include-deps` vermediğiniz sürece bağımlılıklar atlanır.
- **Diğer araçların CBOM'ları.** Raporlar, diğer araçlardan gelen CBOM'ları yalnızca algoritma adına göre sınıflandırır.
- **Tarihler.** NIST kategorileri ve IR 8547 geçişleri, Ekim 2026 itibarıyla atıf yapılan belgelerden alınmıştır. Uygulamaya özgü kılavuzlar daha erken tarihler belirleyebilir.
- **Sürüm dizesi.** Sürüm bayrağı olmadan kaynaktan derlenmiş bir ikili `qorescan dev` yazdırır. Sürümün kaydedilmesi gerektiğinde sürüm ikilisini ya da etiketli sürümün Go kurulumunu kullanın.

## İlgili sayfalar {#related}

- [Kuantum sonrası imzalama](/developer-guide/post-quantum-signing): yerel hatta hibrit secp256k1 artı ML-DSA-87 ve EVM yetkilendirme penceresi.
- [Saklama seti](/developer-tools/custody-kit): saklama kuruluşları ve borsalar için entegrasyon kılavuzu ve referans kod.
- [QoreSign](/qoresign/overview): hibrit imzalama ve doğrulama kütüphaneleri.
- [Düğüm çalıştırma](/developer-guide/running-a-node) ve [doğrulayıcı çalıştırma](/developer-guide/running-a-validator): düğüm ana dizini yapısı, uzak imzalayıcılar ve anahtar dosyaları.
- [EVM precompile'ları](/developer-guide/evm-precompiles): PQC precompile'ları `0x0A01` ve `0x0A02`.
- [Kuantum sonrası kütüphane (qorechain-pqc)](/developer-tools/pqc-library): altı dilde ML-DSA-87.
- [Mainnet'e bağlanma](/getting-started/connecting-to-mainnet) ve [testnet'e bağlanma](/getting-started/connecting-to-testnet): herkese açık uç noktalar.
