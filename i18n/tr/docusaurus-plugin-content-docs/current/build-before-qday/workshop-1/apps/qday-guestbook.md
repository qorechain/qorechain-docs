---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook, QoreChain EVM testnet'inde zincir üzerinde bir ziyaretçi defteridir. Herkes onu adres başına bir kez, en fazla 140 karakterlik bir mesajla imzalayabilir. İki bölümden oluşur:

- **`contracts-app/`**: bir Solidity kontratı ve bir Hardhat projesi. Onu dağıtırsınız ve terminalden imzalayabilirsiniz.
- **`web/`**: tarayıcınızda açılan, QoreX cüzdanını bağlayan, hesabın EVM penceresini gösteren ve en son imzaları canlı listeleyen bir web sayfası.

Bu kılavuz yeni başlayanlar için yazılmıştır. Her komut açıklanır ve her adım, ne görmeniz gerektiğiyle biter.

**Ne kadar sürer:** ilk seferde yaklaşık 35 dakika: kontrat bölümü için 20, web sayfası için 15.

## Ne gösterir {#shows}

- **Bunu fark etmeden hibrit imzalayan bir tarayıcı dApp'i.** Sayfa, sıradan bir wagmi ve RainbowKit uygulamasıdır. QoreX imzanın kuantum sonrası yarısını (ML-DSA-87) ekler; böylece aynı işlem hem klasik anahtarla (secp256k1) hem de kuantum sonrası bir anahtarla korunur.
- **EVM penceresi arayüzde görünür.** Sayfa, hesabın penceresini zincirden okur ve canlı olup olmadığını, kaç blok ve işlemin kaldığını gösterir.
- **Okunabilir ret mesajları.** Zincir bir yazma işlemini reddettiğinde sayfa, hatayı dört nedenden birine eşler (kayıtlı anahtar yok, pencere yok, pencere tükendi, geçersiz parametreler) ve çözümü gösterir.
- **Zincir üzerinde doğrulanan hibrit imzalar.** Yazdığınız her imza, zincirin yalnızca iki imzayı da kontrol ettikten sonra kabul ettiği tek bir işlemdir.

## Başlamadan önce {#prerequisites}

Bu kılavuz, terminal bölümü için tek kullanımlık bir testnet hesabı kullanır. Asla gerçek bir cüzdan ya da gerçek para kullanmayın. Testnet QOR'unun değeri yoktur.

Bir terminale ihtiyacınız var. macOS'ta **Terminal**'i açın. Windows'ta **PowerShell**'i (ya da Git ile gelen **Git Bash**'i) açın. Linux'ta herhangi bir terminal açın. Şu üç aracı kurun. Kontrol komutu zaten uygun bir sürüm yazdırıyorsa kurulumu atlayın.

### Node.js 22 veya üstü

Node.js, JavaScript'i bilgisayarınızda çalıştırır. Hardhat 3, Node.js 22 veya üstünü ister.

| Sistem | Kurulum | Kontrol |
| --- | --- | --- |
| macOS | `brew install node` ([Homebrew](https://brew.sh) gerekir) ya da https://nodejs.org adresinden indirin | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS` ya da https://nodejs.org adresinden indirin | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, yeni bir terminal açın, sonra `nvm install 22` | `node --version` |

Ne görmelisiniz: `v22` ya da daha yüksek bir sayıyla başlayan bir değer. Windows'ta kurulumdan sonra PowerShell'i kapatıp yeniden açın.

### pnpm

pnpm, bir projenin ihtiyaç duyduğu kütüphaneleri indirir. Node.js onu içermez; bu yüzden her sistemde kendiniz kurun.

```sh
npm install -g pnpm
```

| Parça | Anlamı |
| --- | --- |
| `npm` | Node.js ile birlikte gelen araç. Başka araçları kurar. |
| `install` | İndir ve kur. |
| `-g` | Global: yalnızca bir klasör için değil, tüm bilgisayar için kur. |
| `pnpm` | Kurulacak araç. |

`pnpm --version` ile kontrol edin. `9.12.0` gibi bir sayı görmelisiniz (9 veya üstü). Hiç `pnpm: command not found` görürseniz yukarıdaki kurulum komutunu çalıştırın ve yeni bir terminal açın. macOS veya Linux `EACCES: permission denied` derse `sudo npm install -g pnpm` kullanın.

### Git

| Sistem | Kurulum | Kontrol |
| --- | --- | --- |
| macOS | `xcode-select --install` ya da `brew install git` | `git --version` |
| Windows | `winget install Git.Git` ya da https://git-scm.com adresinden indirin | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) ya da `sudo dnf install git` (Fedora) | `git --version` |

Ne görmelisiniz: `git version 2.` ve bir sayı.

## Testnet cüzdanları {#wallet}

Bu kılavuz iki hesap kullanır ve bunlar bilerek farklıdır:

1. Terminal bölümü (3'ten 6'ya kadar olan adımlar) için **bir anahtar dosyası hesabı**. Kılavuz bunu sizin için oluşturur. Kontratı o dağıtır.
2. Web sayfası (8 ve 9. adımlar) için **bir QoreX hesabı**. Web sayfası onunla imzalar.

**Testnet'te QoreX.** [QoreX](/qorex/overview), QoreChain cüzdanıdır. Web sayfası için tarayıcı eklentisini kullanırsınız (bkz. [QoreX Entegrasyonları](/developer-tools/qorex-integrations)). Kullanacağınız tarayıcıya kurun, sonra:

- **QoreX tarayıcı eklentisi:** kilidi açın, en alttaki sürüm numarasına 7 kez dokunun, sonra **Switch to testnet (diana)** seçeneğini seçin.
- **Telefonunuzdaki QoreX uygulaması:** Ayarlar, ardından **Use testnet (developers)**.
- EVM hattı için **Add an Ethereum account (coin 60)** seçeneğini seçin. Web sayfası bir coin 60 hesabına ihtiyaç duyar.

**Faucet** ücretsiz testnet QOR'u verir: https://dashboard.qorechain.io/faucet. Giriş yapın, bir adres yapıştırın, talep edin. Hesap başına 24 saatte 100 QOR alırsınız.

**Miktarlar hakkında.** QOR coin'in kendisidir. `uqor` onun en küçük parçasıdır: 1 QOR = 1.000.000 uqor. Yeni bir hesabın ilk işlemi kuantum sonrası anahtarını kaydeder; bunun tek seferlik ücreti yaklaşık 0,09 QOR'dur.

## Bölüm 1: kontrat {#contract}

### 1. Kodu alın {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**Ne yapar**

- `git clone <address>`, projeyi GitHub'dan `build-before-qday` adlı yeni bir klasöre indirir.
- `cd <folder>`, terminalinizi Guestbook projesine taşır. Ayrı ayrı kuracağınız iki klasörü vardır: `contracts-app` ve `web`.

**Ne görmelisiniz:** `Cloning into 'build-before-qday'...`. **Ne kadar sürer:** birkaç saniye.

### 2. Kütüphaneleri kurun ve test edin {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**Ne yapar**

- `cd contracts-app`, kontrat klasörüne girer.
- `pnpm install`, `package.json` içinde listelenen kütüphaneleri (Hardhat ve QoreChain SDK) indirir.
- `pnpm test`, kontratın kontrollerini bilgisayarınızın içindeki sahte bir zincirde çalıştırır. Anahtar ya da ağ hesabı gerektirmez. İlk çalıştırma Solidity derleyicisini indirir.

**Ne görmelisiniz:** bir paket listesi, birkaç saniye içinde `Done in`, sonra üç onay işaretli `QDayGuestbook` ve `3 passing`. **Ne kadar sürer:** yaklaşık bir dakika.

### 3. Anahtar dosyasını oluşturun {#step-account}

Proje sırlarını `.env` adlı bir dosyadan okur. Onu şablondan oluşturun.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Ne yapar**

- `cp` (ya da `copy`), `.env.example` şablonunu yeni bir `.env` dosyasına kopyalar.

`.env` dosyası sizin **anahtar dosyanızdır**. Yalnızca `contracts-app` klasöründe durur. **Asla paylaşmayın, asla Git'e commit etmeyin ve bu anahtarları asla gerçek bir cüzdan için yeniden kullanmayın.** Proje `.env` dosyasını Git'te zaten yok sayar. Dosyayı herhangi bir metin düzenleyicide açın (macOS'ta `open -e .env`, Windows'ta `notepad .env`, Linux'ta `nano .env`) ve iki değer doldurun.

**a. Tek kullanımlık bir özel anahtar.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Ne yapar**

- `node -e "..."`, tek satırlık bir JavaScript çalıştırır. Satır 32 rastgele bayt üretir ve onları önüne `0x` koyarak onaltılık düzende yazdırır. Bu bir özel anahtardır.

**Ne görmelisiniz:** tek satır; `0x` ve ardından 64 harf ve rakam. Sıfırlardan oluşan yer tutucunun yerine geçecek şekilde, onu `.env` dosyasına `PRIVATE_KEY=0x...` olarak kopyalayın.

**b. Kuantum sonrası bir kurtarma kodu.**

```sh
pnpm window recovery-code
```

**Ne yapar**

- `pnpm window`, `scripts/window.ts` yardımcı betiğini çalıştırır. Ondan sonraki kelime komuttur.
- `recovery-code`, hesabın ML-DSA-87 anahtarının üretildiği rastgele yeni bir kod yazdırır.

**Ne görmelisiniz:** `QRC1-` ile başlayan bir satır. Onu `.env` dosyasına `QORE_PQC_RECOVERY_CODE=QRC1-...` olarak kopyalayın. Bu hesap için aynı kodu koruyun: yeni bir kod farklı bir kuantum sonrası anahtar verir.

`QORE_MNEMONIC` değerini boş bırakın (mnemonic, yukarıdaki iki değerin yerine geçebilen 12 ya da 24 kelimelik bir ifadedir; ikisinden birini kullanın, ikisini birden değil) ve test ağını kullanmasını yardımcıya söyleyen `QORE_NETWORK=testnet` değerini koruyun. `.env` dosyanız şöyle görünür (yer tutucular gösterilmiştir):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Dosyayı kaydedin.

### 4. Hesaba para yükleyin {#step-faucet}

```sh
pnpm window status
```

**Ne yapar**

- Hesabınızı, kuantum sonrası anahtarının kayıtlı olup olmadığını ve bir EVM penceresi olup olmadığını gösterir.

**Ne görmelisiniz:** `account:  0x...  (qor1...)`, ardından `PQC key:  not registered` ve `window:   none`. `qor1...` adresini kopyalayın. Sonra:

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. Sayfanın **Testnet**'e ayarlı olduğundan emin olun.
3. `qor1...` adresini yapıştırın ve QOR'u talep edin (hesap başına 24 saatte bir kez 100 QOR).
4. Yaklaşık 10 saniye bekleyin. Adresinizi https://explore.qore.network (Testnet) üzerinde aratmak bakiyeyi gösterir.

### 5. Anahtarı kaydedin, pencereyi açın, dağıtın {#step-window}

```sh
pnpm window register
```

**Ne yapar**

- ML-DSA-87 açık anahtarınızı hesap başına bir kez zincire gönderir. Zincirde karşılaştırılacak bir anahtar henüz olmadığından, zincirin kuantum sonrası imza olmadan kabul ettiği tek mesajdır. Yaklaşık 0,09 QOR tutar.

**Ne görmelisiniz:** `registered: ` ve bir işlem hash'i.

```sh
pnpm window open
```

**Ne yapar**

- Bir EVM yetkilendirme penceresi açan, iki anahtarla imzalanmış (hibrit) tek bir işlem gönderir. Pencere canlıyken sıradan EVM işlemlerinize izin verilir. Varsayılan olarak 600 blok sürer ve 5 işleme izin verir.

**Ne görmelisiniz:** `opened: ` ve bir işlem hash'i, sonra `window: 600 blocks, 5 txs, ...`. Son adım için **bu hash'i kopyalayın**.

```sh
sleep 10
```

**Ne yapar**

- 10 saniye bekler (PowerShell ve Git Bash'te de çalışır). Pencerenin açılması hesabın işlem sayacını değiştirir ve sonraki komutun yeni değeri görmesi gerekir.

```sh
pnpm deploy:testnet
```

**Ne yapar**

- Kontratları dağıtan araç olan Hardhat Ignition'ı, `qorechainTestnet` ağında (zincir kimliği 9800, QoreChain testnet'i) `QDayGuestbook` modülüyle çalıştırır.
- Sizden onay ister. `y` yazın ve Enter'a basın.

**Ne görmelisiniz:** `QDayGuestbookModule#QDayGuestbook` ile biten ve kontrat adresiniz `0x...` olan bir satır. **Bu adresi kopyalayın**: web sayfası ona ihtiyaç duyar. **Ne kadar sürer:** yaklaşık 30 saniye.

### 6. Terminalden imzalayın {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**Ne yapar**

- `pnpm sign "<message>"`, ziyaretçi defterine bir kayıt yazar. Tırnak içindeki metin mesajınızdır, en fazla 140 karakter.
- `pnpm sign --read` yalnızca okur: en son kayıtları listeler ve hiçbir şey göndermez.

**Ne görmelisiniz:** ilk komuttan sonra `tx: 0x...` ve `status: success in block ...`. İkincisinden sonra `guestbook 0x...: 1 signatures` ile mesajınız, saati ve adresiniz.

Her adres bir kez imzalayabilir. Aynı hesaptan ikinci bir `pnpm sign`, kontrat tarafından `AlreadySigned` ile reddedilir.

## Bölüm 2: web sayfası {#web}

### 7. Sayfayı kurun ve yapılandırın {#step-web}

Aynı proje klasöründe ikinci bir terminal penceresi açın ya da `cd ..` ile geri dönün. Sonra:

```sh
cd web
pnpm install
```

**Ne yapar**

- Web klasörüne girer ve kütüphanelerini (React, wagmi, RainbowKit, Vite) indirir.

**Ne görmelisiniz:** bir paket listesi ve birkaç saniye içinde `Done in`.

Sayfa ayarları dosyasını oluşturun. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. `web/.env` dosyasını bir düzenleyicide açın ve 5. adımda kopyaladığınız kontrat adresini yazın:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID` değerini boş bırakın. Yalnızca `src/wagmi.ts` dosyasına bir WalletConnect cüzdanı eklerseniz gerekir.

### 8. Sayfayı başlatın ve QoreX'i bağlayın {#step-run}

```sh
pnpm dev
```

**Ne yapar**

- Kendi bilgisayarınızda küçük bir web sunucusu (Vite) başlatır. Sayfa `http://localhost:5174` adresinde yaşar. Sunucu ayrıca `/lcd` ile başlayan istekleri herkese açık testnet REST sunucusuna iletir. Tarayıcı o sunucuyu doğrudan çağıramaz (CORS başlıkları göndermez); bu vekil bunu sayfa için yapar.
- Komut çalışmaya devam eder. Bu terminali açık bırakın. Daha sonra durdurmak için `Ctrl+C` tuşlarına basın. `web/.env` dosyasını değiştirirseniz durdurup yeniden başlatın.

**Ne görmelisiniz:** `VITE ... ready` ve `Local: http://localhost:5174/`.

Şimdi QoreX'in kurulu olduğu tarayıcıda:

1. http://localhost:5174 adresini açın.
2. QoreX'in kilidinin açık ve testnet'e geçirilmiş olduğundan (yukarıdaki "Testnet cüzdanları" bölümüne bakın) ve faucet'ten QOR almış bir coin 60 hesabı bulunduğundan emin olun. QoreX iki biçimi de gösteriyorsa, faucet sayfasında adresin `qor1...` biçimini kullanın.
3. Sayfada, 1. kartta **Connect QoreX** (bağlan düğmesi) seçeneğini seçin. QoreX ilk sırada listelenmiyorsa cüzdan listesinden seçin.
4. QoreX, bağlanmayı isteyen bir pencere açar. Onaylayın.

**Ne görmelisiniz:** 1. kart `0x...` hesabınızı, `qorechain-diana EVM (9800)` zincirini, bakiyenizi ve EVM penceresini gösterir: yeni bir hesap için `no window open`. 3. kart `On chain now: 1 signatures` ve 6. adımda yazdığınız kaydı gösterir. Zincir satırı `wrong chain` diyorsa QoreX'i testnet'e geçirin.

### 9. QoreX'ten imzalayın {#step-sign}

1. 2. kartta bir mesaj yazın (en fazla 140 karakter). Sayfa kaç karakter kullandığınızı gösterir.
2. **Sign** seçeneğini seçin.
3. QoreX onay penceresini açar. Hesabınızın henüz kuantum sonrası anahtarı ya da penceresi yoksa QoreX, anahtarı kaydetmeyi (tek seferlik yaklaşık 0,09 QOR ücret) ve EVM penceresini aynı onayda açmayı önerir. Bunu kabul edin.
4. QoreX'te onaylayın. Düğme beklerken `Approve in QoreX...` yazar.

**Ne görmelisiniz:** explorer'a bağlantılı bir `tx 0x...` satırı; önce `waiting for the block...`, sonra `success in block ...`. 1. kart artık EVM penceresini kalan blok ve işlemlerle birlikte `live` olarak gösterir. 3. kart mesajınızı en üste, en yeni ilk olacak şekilde ekler. En fazla 20 kayıt listeler ve birkaç saniyede bir yenilenir. Aynı adresten yeniden denerseniz 2. kart `This address has already signed.` der.

### 10. Zincir üzerinde doğrulayın {#step-explorer}

`pnpm window open` komutundan (5. adım) aldığınız hash'i kullanın. Web sayfası için QoreX pencereyi kendi işleminde de açar: QoreX'ten geçmişini isteyin ya da adresinizi explorer'da aratın.

**a. Sade web isteğiyle.** `<HASH>` yerine hash'i yazın (`<` ve `>` işaretlerini silin).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Ne yapar**

- `curl <address>`, herkese açık bir QoreChain sunucusundan o işlemin kaydını ister ve yazdırır. Windows PowerShell'de `curl` yerine `curl.exe` yazın.

**Uzun yanıtta ne görmelisiniz:**

- `"code": 0`, yani işlem başarılı oldu.
- ML-DSA-87 imzasını taşıyan, 4.627 bayt uzunluğunda `PQCHybridSignature` türünde bir uzantı.
- `status` değeri `verified` olan bir `pqc_hybrid_verify` olayı.

**b. Explorer ile.** https://explore.qore.network adresini açın, ağ seçiciyi **Testnet**'e geçirin ve işlem hash'ini (5, 6 veya 9. adımdan), hesap adresinizi ya da `QDayGuestbook` adresini aratın. Pencere işlemi, zincirin doğruladığı bir kuantum sonrası imza gösterir.

## Sonunda ne görmelisiniz {#result}

- `contracts-app` içinde `pnpm test` `3 passing` yazdırır.
- `pnpm window status`, kalan bloklar, işlemler ve değerle birlikte `PQC key:  registered` ve `window:   live` yazdırır.
- `pnpm deploy:testnet`, `QDayGuestbook` adresini (`0x...`) yazdırır.
- `pnpm sign "..."`, işlem hash'ini ve `status: success in block ...` yazdırır.
- Sayfa hesabınızı, `qorechain-diana EVM (9800)` zincirini, bakiyenizi ve pencereyi `live` olarak gösterir. **Sign** seçip onayladıktan sonra bir işlem bağlantısı ve `success in block ...` görürsünüz.
- En alttaki liste imza sayısını ve en son kayıtları, en yeni ilk olacak şekilde gösterir.
- `curl` kontrolü `"code": 0`, `PQCHybridSignature` uzantısını ve `status` değeri `verified` olan `pqc_hybrid_verify` olayını gösterir.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| `pnpm: command not found` | pnpm kurulu değil. Node.js onu içermez. | `npm install -g pnpm` komutunu çalıştırın, sonra yeni bir terminal açın. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js çok eski. | Node.js 22 veya üstünü kurun. |
| `node: .env: not found` | Bu klasörde `.env` dosyası yok. | `contracts-app` içinde 3. adımı yapın ve komutları o klasörden çalıştırın. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` veya `Set QORE_PQC_RECOVERY_CODE ...` | `.env` içindeki bir değer boş, yer tutucu ya da yazım hatası içeriyor. | İki değeri de 3. adımdaki gibi doldurun ve kaydedin. |
| `... does not exist on chain yet: send it some QOR first` | Hesabın henüz QOR'u yok. | Faucet'i kullanın (4. adım), 10 saniye bekleyin. |
| Faucet sınıra ulaştığınızı söylüyor | Hesap başına 24 saatte bir talep. | Bekleyin, sonra yeniden deneyin. |
| `account has no PQC key and classical fallback is disabled` | Anahtar kaydedilmeden önce bir işlem gönderildi. | `pnpm window register`, sonra `pnpm window open` komutunu çalıştırın. QoreX'te, ilk gönderiminizle birlikte sunulan kaydı onaylayın. |
| `EVM authorisation window exhausted` veya `open an EVM window first` | Pencerenin blokları veya işlemleri tükendi ya da hiç açılmadı. | `pnpm window open` komutunu çalıştırın (terminal) ve 10 saniye bekleyin. Sayfada, QoreX yeni pencereyi önerdiğinde onaylayın. |
| Pencere açıldıktan sonra `HHE10402` | Dağıtım, hesabın işlem sayacı güncellenmeden önce çalıştı. | 10 saniye bekleyin ve `pnpm deploy:testnet` komutunu yeniden çalıştırın. |
| `refused: ... (AlreadySigned)` | Bu adres zaten imzaladı. | Her adres bir kez imzalar. Başka bir hesap kullanın. |
| `refused: ... (BadLength)` | Mesaj boş ya da 140 karakterden uzun. | 1 ile 140 karakter arasında bir mesaj kullanın. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` kontratı bulamıyor. | `contracts-app` içinde 5. adımı tamamlayın. |
| Sayfa hiç kayıt göstermiyor ve **Sign** düğmesi gri | `web/.env` içinde `VITE_GUESTBOOK_ADDRESS` boş. | 5. adımdaki adresi yapıştırın, sonra `pnpm dev` komutunu durdurun (`Ctrl+C`) ve yeniden başlatın. |
| Sayfa `wrong chain` diyor | QoreX testnet'te değil. | QoreX'i testnet'e (diana) geçirin, bkz. "Testnet cüzdanları". |
| Bağlan seçeneğini seçtiğinizde QoreX sunulmuyor | Sayfa, QoreX eklentisi olmayan bir tarayıcıda açıldı ya da eklentinin kilidi kapalı. | http://localhost:5174 adresini QoreX'in olduğu tarayıcıda açın ve kilidini açın. |
| 5174 numaralı port zaten kullanımda | Başka bir program onu kullanıyor. | Onu kapatın ya da Vite'in yazdırdığı diğer adresi kullanın. |
| EVM penceresinin yanında `could not read` ya da tarayıcı konsolunda CORS hataları | Sayfa REST sunucusunu doğrudan çağırdı ve o CORS başlıkları göndermiyor. | REST'i yalnızca bu projenin yaptığı gibi geliştirme sunucusunun `/lcd` vekili üzerinden çağırın. Sayfayı `pnpm dev` ile başlatın. |

## Kod {#code}

Kontrat kayıtları bir dizide tutar ve adres başına bir imzaya izin verir:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX, bağlayıcı listesindeki ilk cüzdandır (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

Sayfa pencereyi gösterir ve retleri açıklar (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Kullanılan paketler {#packages}

Kontratlar (`contracts-app/`):

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Pencere yardımcı betiği, hibrit imzalama |
| `@qorechain/evm` | ^0.13.0 | Zincir tanımları, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Pencere mesajının yayınlanması |
| `hardhat` | ^3.21.1 | Derleme, test, Ignition ile dağıtım |
| `viem` | ^2.47.6 | Ethereum istemcisi |
| `tsx` | ^4.19.0 | TypeScript betiklerini çalıştırma |
| `typescript` | ^5.6.3 | Tür denetimi |

Web sayfası (`web/`):

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Zincir tanımları, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX'in bir RainbowKit cüzdanı olarak kullanımı |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Bağlan düğmesi |
| `wagmi` | ^2.19.5 | Okuma ve yazma için React hook'ları |
| `viem` | ^2.53.1 | Ethereum istemcisi |
| `@tanstack/react-query` | ^5.59.0 | Pencere ve zincir okumaları için veri getirme |
| `react`, `react-dom` | ^18.3.1 | Arayüz |
| `vite` | ^5.4.0 | Geliştirme sunucusu |
| `@vitejs/plugin-react` | ^4.3.0 | Vite için React desteği |
| `typescript` | ^5.6.3 | Tür denetimi |

Kaynak: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
