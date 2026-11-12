---
slug: /build-before-qday/workshop-1
title: "Workshop 1: İlk hibrit imzalı işleminiz"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: İlk hibrit imzalı işleminiz

Bu kılavuz sizi hiçbir şeyin kurulu olmadığı bir bilgisayardan, aynı anda iki anahtarla imzalanmış ve QoreChain testnet'i tarafından doğrulanmış tek bir işleme götürür. Geliştirici olmanız gerekmez. Her komut sade bir dille açıklanır ve her adım, ekranınızda ne görmeniz gerektiğiyle biter.

**Ne kadar sürer:** ilk seferde, araçların kurulumu dahil yaklaşık 30 dakika. Araçlar zaten kuruluysa yaklaşık 10 dakika.

## Ne geliştiriyoruz {#what-we-built}

Tek komutla oluşturulan, test edilen ve QoreChain testnet'ine dağıtılan eksiksiz bir Solidity projesi (küçük bir akıllı kontrat); ardından **aynı anda iki anahtarla** imzalanmış ve zincir tarafından kontrol edilen bir işlem.

Gösterdikleri:

- **Hibrit imzalama.** İşlem, klasik bir secp256k1 imzası ve kuantum sonrası bir ML-DSA-87 imzası (NIST FIPS 204) taşır. İkisinin de geçerli olması gerekir.
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem.** Validatörler her iki imzayı da doğrular. Kanıtı herkese açık REST uç noktasından (`PQCHybridSignature` uzantısı ve `pqc_hybrid_verify` olayı) ve explorer'da okursunuz.
- **EVM yetkilendirme penceresi.** Bir Ethereum işlemi kuantum sonrası imza taşıyamaz. Bu yüzden QoreChain'de ML-DSA-87 anahtarınızı bir kez kaydeder ve hibrit imzalı bir mesajla kısa bir pencere açarsınız; bu pencere süresince normal EVM işlemleriniz kabul edilir. Fikrin ayrıntısı için [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes) sayfasına bakın.

Quantum Pass seviyesinin istediği tam olarak budur.

## Bu kılavuzda kullanılan kelimeler {#words}

| Kelime | Sade anlamı |
| --- | --- |
| Terminal | Komut yazdığınız pencere. macOS ve Linux'ta Terminal, Windows'ta PowerShell |
| Testnet | QoreChain'in bir deneme kopyası. Coin'lerinin değeri yoktur |
| QOR ve uqor | QOR coin'in kendisidir. uqor onun en küçük birimidir. 1 QOR = 1.000.000 uqor |
| İşlem | Zincire gönderilen, imzalanmış tek bir talimat |
| Memo | Bir işleme eklenen kısa bir metin |
| Özel anahtar | Hesabınız adına imzalayan bir sır. Ona sahip olan, hesabı denetler |
| Kurtarma kodu | Kuantum sonrası anahtarınızın üretildiği ikinci bir sır (`QRC1` ile başlar) |
| Hash | Bir işlemin benzersiz kimliği. İşlemi aramak için kullanılır |
| Gaz ve ücret | Zincirin bir işlemi yürütmesi için QOR cinsinden ödenen küçük bedel |

:::caution Yalnızca tek kullanımlık testnet hesabı
Bu alıştırma için üretilmiş ve yalnızca test QOR'u tutan bir anahtar kullanın. Asla gerçek bir cüzdan ya da gerçek para kullanmayın. Gerçek para tutan bir hesabın anahtarını veya kurtarma kodunu asla `.env` dosyasına koymayın ve `.env` dosyasını asla paylaşmayın ya da commit etmeyin.
:::

## Başlamadan önce {#prerequisites}

macOS, Windows ya da Linux çalışan bir bilgisayara, bir terminale ve bir web tarayıcısına ihtiyacınız var. Bu eğitim için iki araç kurarsınız: **Node.js 22 veya üstü** (burada kullanılan proje aracı Hardhat 3, 22 sürümünü ister) ve **pnpm** (projenin kütüphanelerini indiren araç). İsteğe bağlı bir araç olan **jq** ise yalnızca bir doğrulama çıktısını okumayı kolaylaştırır.

Önce bir terminal açın. macOS'ta **Terminal**'i açın. Windows'ta **PowerShell**'i açın. Linux'ta terminal uygulamanızı açın.

### Node.js 22 veya üstü {#install-node}

1. Zaten kurulu olup olmadığını kontrol edin:

```bash
node -v
```

`v22` ya da daha yüksek bir sayı yazdırmalıdır. `command not found` yazarsa veya daha eski bir sürüm çıkarsa, Node.js'i aşağıdaki gibi kurun.

2. Sisteminize göre kurun:

| Sistem | Nasıl kurulur |
| --- | --- |
| macOS | Yükleyiciyi [nodejs.org/en/download](https://nodejs.org/en/download) adresinden indirin ya da Homebrew kullanıyorsanız `brew install node@22` komutunu çalıştırın |
| Windows | PowerShell'de `winget install OpenJS.NodeJS.LTS` komutunu çalıştırın ya da yükleyiciyi [nodejs.org/en/download](https://nodejs.org/en/download) adresinden indirin |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash` komutunu çalıştırın, terminali kapatıp yeniden açın, sonra `nvm install 22` komutunu çalıştırın |

3. Terminali kapatın, yeni bir tane açın ve `node -v` komutunu yeniden çalıştırın.

**Ne görmelisiniz:** `v22` ya da daha yüksek bir sayıyla başlayan bir değer, örneğin `v22.12.0`.

### pnpm {#install-pnpm}

1. Zaten kurulu olup olmadığını kontrol edin:

```bash
pnpm -v
```

2. `command not found` (ya da `pnpm: command not found`) yazarsa kurun:

```bash
npm install -g pnpm
```

| Parça | Anlamı |
| --- | --- |
| `npm` | Node.js ile birlikte gelen paket aracı |
| `install` | Bir programı indir ve kur |
| `-g` | Global: tek bir klasör için değil, tüm bilgisayarınız için kur |
| `pnpm` | Kurulacak program |

Homebrew ile kurulan Node.js, pnpm'i içermez. macOS'ta `pnpm: command not found` hatasının sık görülmesinin nedeni budur: yukarıdaki komutu çalıştırmak sorunu çözer. Linux veya macOS'ta bir izin hatası görürseniz bunun yerine `corepack enable` komutunu çalıştırın, sonra `pnpm -v` komutunu yeniden çalıştırın.

3. `pnpm -v` ile yeniden kontrol edin.

**Ne görmelisiniz:** bir sürüm numarası, örneğin `9.12.0` ya da daha yüksek.

### jq (isteğe bağlı) {#install-jq}

`jq`, uzun bir yanıtı kısa ve okunur bir biçimde yazdırır. Yalnızca bir kez, 8. adımda kullanılır.

| Sistem | Kurulum | Kontrol |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian ve Ubuntu) | `jq --version` |

8. adımda kullanılan `curl`, macOS'ta, Linux'ta ve Windows 10 ve sonrasında zaten vardır. Windows PowerShell'de `curl` yerine `curl.exe` yazın.

## Testnet cüzdanınız ve faucet {#wallet}

Proje, 3. adımda kendi tek kullanımlık hesabını oluşturur; bu yüzden bu kılavuzu bitirmek için bir cüzdana ihtiyacınız yoktur. Ancak o hesapta testnet QOR'u olması gerekir ve örnek uygulamalarla kullanmak için QoreX cüzdanını da testnet'te kurabilirsiniz.

**Testnet'te QoreX (burada isteğe bağlı, tarayıcı örnek uygulamaları için gerekli):**

1. **QoreX uygulamasında:** **Ayarlar**'ı açın ve **Use testnet (developers)** seçeneğini açın.
2. **QoreX tarayıcı eklentisinde:** kilidi açın, en alttaki sürüm numarasına 7 kez dokunun, sonra **Switch to testnet (diana)** seçeneğini seçin.
3. Ethereum tarafındaki (EVM) her şey için ayrıca **Add an Ethereum account (coin 60)** seçeneğini seçin. Bu, Ethereum araçlarıyla çalışan `0x...` adresli bir hesap verir.

**Faucet**, testnet QOR'u veren ücretsiz bir makinedir. 4. adımda kullanırsınız:

- Adres: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). Önce giriş yaparsınız.
- Miktar: hesap başına 24 saatte bir kez 100 QOR.
- Yeni bir hesabın ilk işlemi, kuantum sonrası ML-DSA-87 anahtarını kaydeder. Bunun tek seferlik ücreti yaklaşık 0,09 QOR'dur; yani 100 QOR fazlasıyla yeterlidir.

Bu kılavuzda kullanılan ağ bilgileri:

| Hizmet | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM zincir kimliği 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | `https://dashboard.qorechain.io/faucet` (giriş gerekir) |

## Adımlar {#steps}

### 1. Adım: Araçlarınızı kontrol edin {#step-1}

**Ne kadar sürer:** 1 dakika.

```bash
node -v
```

| Parça | Anlamı |
| --- | --- |
| `node` | Node.js programı |
| `-v` | Sürümünü yazdır ve dur |

```bash
pnpm -v
```

| Parça | Anlamı |
| --- | --- |
| `pnpm` | Paket aracı |
| `-v` | Sürümünü yazdır ve dur |

**Ne görmelisiniz:** Node.js için `v22` veya üstü, pnpm için bir sürüm numarası. Değilse "Başlamadan önce" bölümüne dönün.

### 2. Adım: Projeyi oluşturun ve testleri çalıştırın {#step-2}

**Ne kadar sürer:** yaklaşık 1 dakika. İnternet erişimi gerekir.

1. Projeyi yeni bir klasörde oluşturun. Terminalinizde projelerinizi tuttuğunuz bir klasöre gidin (örneğin Belgeler klasörünüz), sonra şunu çalıştırın:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

Ne yapar: QoreChain proje oluşturucusunu indirir ve yeni bir klasörde `qday-demo` adlı, kullanıma hazır bir proje kurar.

Parametreler:

- `npx`: internetten bir programı kalıcı olarak kurmadan çalıştırır.
- `create-qorechain-dapp@latest`: QoreChain proje oluşturucusu. `@latest`, en yeni sürümü kullan demektir (bu kılavuz 0.14.0 ile denendi).
- `qday-demo`: yeni klasörün ve projenin adı. Başka bir ad seçebilirsiniz.
- `-t hardhat`: `-t` şablon demektir. Hardhat şablonunu seçer: testleri olan bir Solidity kontrat projesi.
- `--network testnet`: projenin hangi QoreChain ağıyla konuşacağı. `testnet` deneme ağıdır.
- `--package-manager pnpm`: projenin ihtiyaç duyduğu kütüphaneleri hangi aracın kuracağı.

**Ne görmelisiniz:** kurulan paketlerin bir listesi, ardından `Done! Created qday-demo`. `create-qorechain-dapp` aracını kurmak isteyip istemediğinizi sorarsa `y` yanıtını verin.

2. Proje klasörüne girin:

```bash
cd qday-demo
```

Ne yapar: terminalinizi yeni klasöre taşır. Sonraki tüm komutlar buradan çalıştırılır.

Parametreler:

- `cd`: klasör değiştir.
- `qday-demo`: girilecek klasör.

3. Testleri çalıştırın:

```bash
pnpm test
```

Ne yapar: kontratı derler ve bilgisayarınızın içindeki küçük bir simüle zincirde çalıştığını kontrol eder. Gerçek testnet'e hiçbir şey göndermez.

Parametreler:

- `pnpm`: paket aracı.
- `test`: çalıştırılacak betiğin adı (`package.json` içinde listelenir; `hardhat test` komutunu çalıştırır).

**Ne görmelisiniz:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Elinizdekilere göz atın (isteğe bağlı):

| Dosya | Nedir |
| --- | --- |
| `contracts/Counter.sol` | Akıllı kontrat: tek bir sayı saklar ve 1 ekleyebilir |
| `ignition/modules/Counter.ts` | Kontratı dağıtan tarif |
| `scripts/window.ts` | `pnpm window` komutunun arkasındaki yardımcı: anahtarınızı kaydeder ve yetkilendirme penceresini açar |
| `hardhat.config.ts` | `qorechainTestnet` ağı (zincir kimliği 9800) dahil ayarlar |
| `.env` | Gizli ayarlar dosyanız. 3. adımda doldurursunuz. Asla paylaşmayın |

Şablonlar hakkında daha fazlası: [İskeleler ve CLI](/developer-tools/scaffolders-and-cli) ve [Zincir geliştirici kiti](/developer-tools/chain-dev-sdk).

### 3. Adım: Tek kullanımlık bir testnet hesabı oluşturun {#step-3}

**Ne kadar sürer:** 3 dakika.

Hesabın iki sırra ihtiyacı vardır: Ethereum tarzı bir **özel anahtar** ve kuantum sonrası ML-DSA-87 anahtarının üretildiği bir **kurtarma kodu** (`QRC1` ile başlar). İkisi de proje klasörünüzdeki `.env` dosyasına girer. Bu dosya yalnızca sizin bilgisayarınıza aittir.

1. Yeni bir özel anahtar üretin. Önce `qday-demo` klasörünün içinde `make-key.mjs` adlı küçük bir dosya oluşturun ve içeriği şöyle olsun (Not Defteri, düz metin kipinde TextEdit ya da nano gibi herhangi bir metin düzenleyici kullanın):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

Bu dosya ne yapar: rastgele bir özel anahtar üretir ve `.env` dosyanıza yazar; böylece anahtar ne ekranda gösterilir ne de elle kopyalanır.

2. Çalıştırın:

```bash
node make-key.mjs
```

Ne yapar: küçük dosyayı Node.js ile çalıştırır.

Parametreler:

- `node`: Node.js programı.
- `make-key.mjs`: çalıştırılacak dosya.

**Ne görmelisiniz:** `New private key saved in .env`. Yalnızca bir kez çalıştırın: ikinci çalıştırma farklı bir hesap üretir.

3. Bir kurtarma kodu üretin:

```bash
pnpm window recovery-code
```

Ne yapar: yeni bir kurtarma kodu oluşturur ve yazdırır.

Parametreler:

- `pnpm window`: projenin pencere yardımcısını (`scripts/window.ts`) çalıştırır.
- `recovery-code`: eylem: yeni bir kurtarma kodu yazdır.

**Ne görmelisiniz:** `QRC1` ile başlayan uzun bir satır, ardından onu saklamayla ilgili bir not. `QRC1...` satırının tamamını kopyalayın.

4. Kodu `.env` dosyasına koyun. Dosyayı bir düzenleyicide açın:

| Sistem | Komut |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

`QORE_PQC_RECOVERY_CODE=` satırını bulun ve kodu eşittir işaretinin hemen arkasına, boşluk ve tırnak işareti olmadan yapıştırın. Dosyayı kaydedin. Sonuç şöyle görünür (yer tutucular gösterilmiştir, sizinkiler gerçek olacak):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

Her satırın anlamı:

- `PRIVATE_KEY`: hesabınızın klasik (secp256k1) yarısı adına imzalayan sır.
- `QORE_PQC_RECOVERY_CODE`: kuantum sonrası (ML-DSA-87) yarısını üreten sır.
- `QORE_NETWORK`: yardımcının hangi ağla konuşacağı. `testnet` deneme ağıdır.

`.env` dosyasını olduğu gibi koruyun. Aynı anahtar ve kod her seferinde aynı hesabı verir. Dosyayı kaybederseniz yeni bir hesapla baştan başlayın. Asla paylaşmayın ve asla git'e commit etmeyin.

Mnemonic (on iki kelime) kullanmayı mı tercih edersiniz? Anahtar ve kod yerine `.env` dosyasına `QORE_MNEMONIC="on iki kelimeniz"` yazın. İki anahtar da aynı ifadeden üretilir ve kurtarma koduna gerek kalmaz. Yalnızca bu alıştırma için üretilmiş bir ifade kullanın.

5. Projeden yeni hesabınızın adresini isteyin:

```bash
pnpm window status
```

Ne yapar: herkese açık zinciri okur ve hesabınızı, kuantum sonrası anahtarınızı ve pencerenizi gösterir. Hiçbir şeyi değiştirmez.

Parametreler:

- `pnpm window`: pencere yardımcısını çalıştırır.
- `status`: eylem: mevcut durumu göster.

**Ne görmelisiniz:** üç satır (sizinkilerde gerçek adresler görünür):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

`qor1...` adresini kopyalayın. Faucet'e vereceğiniz adres budur. İki adres de aynı hesaba aittir: `0x...` Ethereum biçimi, `qor1...` QoreChain biçimidir.

### 4. Adım: Faucet'ten testnet QOR'u alın {#step-4}

**Ne kadar sürer:** 2 dakika.

1. Tarayıcınızda [faucet](https://dashboard.qorechain.io/faucet) sayfasını açın ve giriş yapın.
2. Dashboard'un **Testnet**'te olduğundan emin olun.
3. `qor1...` adresinizi yapıştırın.
4. **Request Tokens** seçeneğini seçin.

**Ne görmelisiniz:** 100 QOR (artı bir miktar fest test tokeni) ve bir **View on Explorer** bağlantısı içeren, **Tokens Sent!** yazan bir kart.

Faucet, hesap başına 24 saatte bir kez öder. Tam miktarlar [Faucet](/dashboard/faucet) sayfasındadır. Şimdi terminalinizden kontrol edin:

```bash
pnpm window status
```

**Ne görmelisiniz:** daha önceki üç satırın aynısı. Hesabınız artık zincirde var ve ücret ödeyebilir. Anahtarın hâlâ kayıtlı olmadığı yazar. Sıradaki adım bu.

### 5. Adım: Anahtarınızı kaydedin ve pencereyi açın {#step-5}

**Ne kadar sürer:** yaklaşık 2 dakika.

1. ML-DSA-87 anahtarınızı kaydedin. Bu, hesap başına tek seferlik bir adımdır:

```bash
pnpm window register
```

Ne yapar: zincire hesabınıza hangi kuantum sonrası anahtarın ait olduğunu söyleyen tek bir işlem gönderir. Tek seferlik yaklaşık 0,09 QOR ücreti vardır. Henüz kayıtlı kuantum sonrası anahtar olmadığı için zincir, yalnızca klasik anahtarla imzalanmış bu tek mesajı kabul eder.

Parametreler:

- `pnpm window`: pencere yardımcısını çalıştırır.
- `register`: eylem: anahtarı kaydet.

**Ne görmelisiniz:** `registered: <HASH>`. `The account already has a PQC key; nothing to do.` yazarsa sorun değil: devam edin.

2. Yetkilendirme penceresini açın:

```bash
pnpm window open
```

Ne yapar: kısa bir pencere açan, **hibrit imzalı** (iki anahtarla) bir işlem gönderir. Bu pencere boyunca kontrat dağıtımı gibi normal Ethereum tarzı işlemleriniz kabul edilir.

Parametreler:

- `pnpm window`: pencere yardımcısını çalıştırır.
- `open`: eylem: bir pencere aç. Varsayılan olarak 600 blok sürer ve 5 işleme izin verir. Bunu `.env` içindeki `QORE_WINDOW_BLOCKS` ve `QORE_WINDOW_TXS` ile değiştirebilirsiniz.

**Ne görmelisiniz:** `opened: <HASH>`, ardından `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)` gibi bir satır. Son sayı, pencerenin uqor cinsinden harcama sınırıdır (3,75 QOR). `opened:` hash'ini not edin: 8. adımda doğrulayacaksınız.

3. Yaklaşık 10 saniye bekleyin. Pencerenin açılması hesap sayacını (nonce) ilerletti ve Hardhat'in zincirin oturmasını beklemesi gerekir.

### 6. Adım: Kontratı derleyin {#step-6}

**Ne kadar sürer:** birkaç saniye.

```bash
pnpm build
```

Ne yapar: Solidity kontratını zincirin çalıştırdığı biçime dönüştürür.

Parametreler:

- `pnpm`: paket aracı.
- `build`: çalıştırılacak betik (`hardhat build` komutunu çalıştırır).

**Ne görmelisiniz:** `Compiled 1 Solidity file` ya da `No contracts to compile`. İkisi de sorun değil: 2. adımdaki test kontratı zaten derlemişti.

### 7. Adım: Kontratı testnet'e dağıtın {#step-7}

**Ne kadar sürer:** yaklaşık 30 saniye.

```bash
pnpm deploy:testnet
```

Ne yapar: açtığınız pencereyi kullanarak, Hardhat Ignition ile kontratı QoreChain testnet'ine gönderir. Bu normal bir EVM işlemidir.

Parametreler:

- `pnpm`: paket aracı.
- `deploy:testnet`: çalıştırılacak betik. `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet` komutunu çalıştırır: `Counter.ts` tarifini `qorechainTestnet` adlı ağa (zincir kimliği 9800) dağıt.

Hardhat `Confirm deploy to network qorechainTestnet (9800)?` diye sorduğunda `y` yazın ve Enter'a basın.

**Ne görmelisiniz:** `[ CounterModule ] successfully deployed` ve `CounterModule#Counter - 0x...` satırı. `0x...`, kontratınızın adresidir. `HHE10402` görürseniz aynı komutu yeniden çalıştırın (bkz. Sorun giderme).

### 8. Adım: Hibrit imzayı zincir üzerinde doğrulayın {#step-6-verify}

**Ne kadar sürer:** 3 dakika.

5. adımdaki `opened:` işlemi iki anahtarla imzalandı. Herkes bunu herkese açık REST uç noktasından kontrol edebilir.

1. `<HASH>` yerine o hash'i (`<` ve `>` olmadan) yazın ve çalıştırın:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Ne yapar: herkese açık testnet sunucusundan işleminizin tam kaydını ister.

Parametreler:

- `curl`: bir web adresini getiren program.
- `-s`: sessiz; ilerleme çubuğunu gizler ve yalnızca yanıtı gösterir.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: testnet REST adresi, ardından işlem hash'iniz.

**Ne görmelisiniz:** uzun bir metin bloğu. Üç şeye bakın:

1. `tx_response` içinde `"code": 0`. Code 0 başarı demektir.
2. ML-DSA-87 imzasını taşıyan `PQCHybridSignature` uzantısı: 64 baytlık secp256k1 imzasının yanında **4.627 bayt**.
3. `events` içinde, `status` özniteliği `verified` olan `pqc_hybrid_verify` türünde bir olay.

2. Yalnızca o olayı yazdırmak için (`jq` gerekir):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ne yapar: aynı kaydı getirir ve yalnızca doğrulama olayını tutan `jq` üzerinden geçirir.

Parametreler:

- `|`: ilk komutun çıktısını ikincisine gönder.
- `jq`: filtre programı.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: olay listesini gez ve türü `pqc_hybrid_verify` olanları tut.

**Ne görmelisiniz:** `"status"` değeri `"verified"` olan küçük bir metin bloğu.

3. Explorer'da görüntüleyin:
   1. [explore.qore.network](https://explore.qore.network) adresini açın.
   2. Ağ seçiciyi **Testnet**'e geçirin.
   3. Hash'i aratın.

**Ne görmelisiniz:** işlem sayfası, imza güvenliğini kuantum güvenli, zincir üzerinde doğrulanmış ve ML-DSA-87 algoritmalı (FIPS 204) olarak gösterir.

Kanıt budur: validatörler her iki imzayı da kontrol etti. Bu sizin Quantum Pass işleminizdir.

## Bir bakışta ne görmelisiniz {#what-you-should-see}

| Nerede | Ne |
| --- | --- |
| 2. adımdan sonra | `Done! Created qday-demo` ve `2 passing` |
| 3. adımdan sonra | `pnpm window status` çıktısında bir `qor1...` adresi ve bir `0x...` adresi, anahtar kayıtlı değil |
| 4. adımdan sonra | Faucet'te **Tokens Sent!** |
| 5. adımdan sonra | `registered: <HASH>`, ardından `opened: <HASH>` ve pencere satırı |
| 7. adımdan sonra | `CounterModule#Counter - 0x...` |
| 8. adımdan sonra | REST çıktısında ve Testnet'teki explorer'da `code` 0, 4.627 baytlık bir ML-DSA-87 imzası ve `status` değeri `verified` olan `pqc_hybrid_verify` |

## Kullanılan paketler {#published}

İskelesi oluşturulan `package.json` içinde bildirilenler:

| Paket | Kayıt defteri | Sürüm |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

İskele aracı ayrıca, oluşturulan `package.json` içinde listelenen Hardhat toolbox, Ignition ve keystore eklentilerini kurar.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| Pencere açıldıktan hemen sonra `HHE10402` ya da "wait for confirmations" | Pencerenin açılması hesabın nonce değerini ilerletti | `pnpm deploy:testnet` komutunu yeniden çalıştırın |
| "EVM authorisation window exhausted" veya "no window" | Pencerenin işlemleri ya da blokları tükendi ya da başka bir kontrata kapsamlandırılmış (başka bir kontrata kapsamlandırılmış pencere dağıtımı engeller) | Yeni bir pencere açmak için `pnpm window open` komutunu çalıştırın, yaklaşık 10 saniye bekleyin, sonra yeniden dağıtın |
| "account has no PQC key and classical fallback is disabled" | Hesap bir ML-DSA-87 anahtarı kaydetmemiş | Önce `pnpm window register`, sonra `pnpm window open` komutunu çalıştırın |
| "does not exist on chain yet" | Hesabın henüz QOR'u yok | Faucet'ten QOR alın (4. adım) |
| Faucet'te "Rate Limit Reached" ya da 30 saniye sonra hâlâ token yok | Hesap başına ve adres başına 24 saatte bir talep hakkı vardır ve talepler sırayla işlenir | Birkaç saniye bekleyip yeniden deneyin ya da 24 saatin dolmasını bekleyin. 24 saatte yalnızca bir talep |
| `pnpm: command not found` | pnpm kurulu değil. Homebrew ile kurulan Node.js onu içermez | `npm install -g pnpm` komutunu çalıştırın, sonra yeni bir terminal açın |
| `pnpm window`, eksik bir kurtarma koduyla ilgili bir mesajla duruyor | `.env` içinde `PRIVATE_KEY` var ama `QORE_PQC_RECOVERY_CODE` yok | `pnpm window recovery-code` komutunu çalıştırın ve kodu `.env` dosyasına yapıştırın (3. adım) ya da `QORE_MNEMONIC` kullanın |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | Yapıştırırken bir yazım hatası, boşluk ya da tırnak işareti | Kodu boşluk ve tırnak işareti olmadan yeniden yapıştırın |
| `pnpm window status` çıktısında "registered, but NOT this key" | Bu hesap için daha önce farklı bir kurtarma kodu kullanılmıştı | Özgün kurtarma kodunu `.env` dosyasına geri koyun ya da yeni bir hesapla baştan başlayın |
| Bir tarayıcı uygulamasında CORS hataları | Tarayıcı, sayfanıza izin vermeyen bir zincir adresine yapılan çağrıları engeller | Tarayıcıdan REST çağrıları için zincir adresini doğrudan çağırmak yerine şablonun `/lcd` vekil yolunu kullanın |
| Hardhat başlamayı reddediyor | Node.js 22'den eski | Node.js 22 veya üstünü kurun ("Başlamadan önce" bölümüne bakın) ve `pnpm install` komutunu yeniden çalıştırın |
| Adımdan hemen sonra `curl` çıktısında `tx not found` | Blok henüz kesinleşmedi | 10 saniye bekleyin ve komutu yeniden çalıştırın |
| `curl` Windows PowerShell'de çalışmıyor | Orada `curl` farklı bir komuttur | `curl` yerine `curl.exe` yazın |

## Örnek uygulamalar {#example-apps}

Aynı akış, birkaç dilden ve ön yüzden. Her biri hibrit imzalar. Hepsi herkese açık [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) deposunda, `workshop-1` klasöründedir. Onları almak için Git'e ihtiyacınız var (`git --version` ile kontrol edin; [git-scm.com](https://git-scm.com/downloads) adresinden kurun), sonra şunu çalıştırın:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Ne yapar: tüm örnek uygulamaların bir kopyasını indirir ve `workshop-1` klasörüne girer.

Parametreler:

- `git clone <address>`: internetteki bir projeyi bilgisayarınıza kopyala.
- `cd build-before-qday/workshop-1`: altı uygulamayı barındıran klasöre gir.

Her uygulama sayfası, neyin kurulacağını ve ne beklemeniz gerektiğini anlatan, baştan sona tam bir kılavuzdur.

| Uygulama | Dil | Sayfa |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Bu uygulamaların arkasındaki kitler [Kitler](/build-before-qday/workshop-1/kits) sayfasında listelenir. QoreX cüzdanını bir tarayıcı dApp'iyle kullanmak için [QoreX](/qorex/overview) sayfasına bakın.
