---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter, QoreChain EVM'inin işe yarar en küçük projesidir. Tek bir sayıyı saklayan bir Solidity kontratı, onu `qorechain-diana` testnet'ine koyan bir Hardhat projesi ve o sayıyı okuyup bir artıran kısa bir betikten oluşur.

Bu kılavuz yeni başlayanlar için yazılmıştır. Solidity ya da blokzincir araçlarını bilmeniz gerekmez. Her komut açıklanır ve her adım, ne görmeniz gerektiğiyle biter.

**Ne kadar sürer:** ilk seferde yaklaşık 25 dakika; çoğu araçları kurmak ve faucet'i beklemekle geçer.

## Ne gösterir {#shows}

- **Hibrit imzalama, dağıtım yolunun bir parçasıdır.** Bir kontrat dağıtımı dahil her EVM işleminden önce, hesabın kayıtlı bir kuantum sonrası anahtara (ML-DSA-87) ve canlı bir EVM yetkilendirme penceresine ihtiyacı vardır. Pencere, iki kez imzalanmış tek bir işlemle açılır: klasik anahtarla (secp256k1) ve kuantum sonrası anahtarla. Buna hibrit imza denir. Zincir ikisini de kontrol eder.
- **Doğrulayabileceğiniz hibrit imzalı bir işlem.** `pnpm window open` adımı bu işlemi gönderir. Onu explorer'da arayabilir ve zincirin kendi kararını görebilirsiniz.
- **Normal EVM araçlarınız çalışmaya devam eder.** Hardhat ve viem sıradan Ethereum işlemleri gönderir. Kuantum sonrası koruma pencerededir; bu yüzden çalınan tek bir secp256k1 anahtarı hesaptan harcama yapamaz.

secp256k1'i kırabilecek kadar büyük bir kuantum bilgisayar, klasik imzaları taklit edebilir. QoreChain, böyle bir bilgisayarın taklit edemeyeceği ikinci bir imza (ML-DSA-87, FIPS 204 standardı) ister. Counter, bu kural açıkken tüm geliştirici döngüsünü gösterir: anahtarı kaydet, pencere aç, dağıt, çağır, oku.

## Başlamadan önce {#prerequisites}

Bu kılavuz tek kullanımlık bir testnet hesabı kullanır. Asla gerçek bir cüzdan ya da gerçek para kullanmayın. Testnet QOR'unun değeri yoktur.

Bir terminale ihtiyacınız var. macOS'ta **Terminal**'i açın. Windows'ta **PowerShell**'i (ya da Git ile gelen **Git Bash**'i) açın. Linux'ta herhangi bir terminal açın. Sonra şu üç aracı kurun. Kontrol komutu zaten uygun bir sürüm yazdırıyorsa kurulumu atlayın.

### Node.js 22 veya üstü

Node.js, JavaScript'i bilgisayarınızda çalıştırır. Hardhat 3, Node.js 22 veya üstünü ister.

| Sistem | Kurulum | Kontrol |
| --- | --- | --- |
| macOS | `brew install node` ([Homebrew](https://brew.sh) gerekir) ya da https://nodejs.org adresinden indirin | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS` ya da https://nodejs.org adresinden indirin | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, yeni bir terminal açın, sonra `nvm install 22` | `node --version` |

Ne görmelisiniz: `v22` ya da daha yüksek bir sayıyla başlayan bir değer, örneğin `v22.12.0`. Windows'ta kurulumdan sonra PowerShell'i kapatıp yeniden açın.

### pnpm

pnpm, bir projenin ihtiyaç duyduğu kütüphaneleri indirir. Node.js kurulumuyla gelmez; bu yüzden her sistemde onu kendiniz eklersiniz.

```sh
npm install -g pnpm
```

| Parça | Anlamı |
| --- | --- |
| `npm` | Node.js ile birlikte gelen araç. Başka araçları kurar. |
| `install` | İndir ve kur. |
| `-g` | Global: yalnızca bir klasör için değil, tüm bilgisayar için kur. |
| `pnpm` | Kurulacak araç. |

`pnpm --version` ile kontrol edin. `9.12.0` gibi bir sayı görmelisiniz (9 veya üstü). Hiç `pnpm: command not found` görürseniz bu adımı atlamışsınızdır: yukarıdaki kurulum komutunu çalıştırın, sonra yeni bir terminal açın.

Linux veya macOS `EACCES: permission denied` derse bunun yerine `sudo npm install -g pnpm` komutunu çalıştırın.

### Git

Git, projeyi GitHub'dan indirir.

| Sistem | Kurulum | Kontrol |
| --- | --- | --- |
| macOS | `xcode-select --install` ya da `brew install git` | `git --version` |
| Windows | `winget install Git.Git` ya da https://git-scm.com adresinden indirin | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) ya da `sudo dnf install git` (Fedora) | `git --version` |

Ne görmelisiniz: `git version 2.` ve bir sayı.

## Bir testnet cüzdanı {#wallet}

İçinde biraz QOR olan bir testnet hesabına ihtiyacınız var. Bu kılavuz, sonraki adımlarda sizin için bir hesap oluşturur (bir anahtar dosyası). Counter için QoreX'e ihtiyacınız yoktur. Aynı hesabı sonradan bir cüzdanda görmek isterseniz testnet'te [QoreX](/qorex/overview) kullanın:

- **QoreX uygulaması:** Ayarlar, ardından **Use testnet (developers)**.
- **QoreX tarayıcı eklentisi:** kilidi açın, en alttaki sürüm numarasına 7 kez dokunun, sonra **Switch to testnet (diana)** seçeneğini seçin.
- EVM hattı için **Add an Ethereum account (coin 60)** seçeneğini seçin.

Faucet ücretsiz testnet QOR'u verir: https://dashboard.qorechain.io/faucet. Giriş yapar, bir adres yapıştırır ve talep edersiniz. Hesap başına 24 saatte 100 QOR alırsınız.

**Miktarlar hakkında.** QOR coin'in kendisidir. `uqor` onun en küçük parçasıdır: 1 QOR = 1.000.000 uqor. Zincirdeki ücretler `uqor` cinsinden gösterilir. Yeni bir hesabın ilk işlemi kuantum sonrası anahtarını kaydeder; bunun tek seferlik ücreti yaklaşık 0,09 QOR'dur.

## Adım adım {#steps}

### 1. Kodu alın {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**Ne yapar**

- `git clone <address>`, projenin bir kopyasını GitHub'dan `build-before-qday` adlı yeni bir klasöre indirir.
- `cd <folder>`, terminalinizi Counter proje klasörüne taşır. Sonraki her komut buradan çalıştırılır.

**Ne görmelisiniz:** `Cloning into 'build-before-qday'...` ve ardından istemin yeni klasörde olması. **Ne kadar sürer:** birkaç saniye.

İsteğe bağlı: projeyi canlı workshop'taki gibi sıfırdan kurmak isterseniz, adımların sonundaki [Aynı projeyi sıfırdan oluşturun](#scaffold) bölümüne bakın.

### 2. Kütüphaneleri kurun {#step-install}

```sh
pnpm install
```

**Ne yapar**

- `pnpm install`, `package.json` içindeki kütüphane listesini okur ve onları (Hardhat, QoreChain SDK ve daha fazlası) bir `node_modules` klasörüne indirir.

**Ne görmelisiniz:** `+` işaretli bir paket listesi ve birkaç saniye içinde `Done in`. **Ne kadar sürer:** bir dakikadan az.

### 3. Testleri ve derlemeyi çalıştırın {#step-test}

```sh
pnpm test
```

**Ne yapar**

- `pnpm test`, projenin kontrollerini bilgisayarınızın içindeki sahte bir zincirde çalıştırır. Anahtar, ağ ya da QOR gerektirmez. İlk çalıştırma Solidity derleyicisini de indirir; bu yüzden internet gerekir.

**Ne görmelisiniz:** `Counter`, yanında onay işareti olan iki satır (`starts at the constructor value`, `increments and emits CountChanged`) ve `2 passing`.

```sh
pnpm build
```

**Ne yapar**

- `pnpm build`, Solidity kontratını makine koduna çevirir (derler). `pnpm test` sonrasında `No contracts to compile` yazdırır; sorun değil, test kontratı zaten derlemişti.

### 4. Ayarlar dosyasını oluşturun {#step-account}

Proje sırlarınızı `.env` adlı bir dosyadan okur. Onu şablondan oluşturun.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Ne yapar**

- `cp` (ya da `copy`), `.env.example` şablon dosyasını yeni bir `.env` dosyasına kopyalar.

`.env` dosyası sizin **anahtar dosyanızdır**. Yalnızca bu proje klasöründe durur. Tek kullanımlık bir anahtar tutar. **Asla paylaşmayın, asla Git'e commit etmeyin ve bu anahtarları asla gerçek bir cüzdan için yeniden kullanmayın.** Proje `.env` dosyasını Git'te zaten yok sayar. Dosyayı herhangi bir metin düzenleyicide açın (macOS'ta `open -e .env`, Windows'ta `notepad .env`, Linux'ta `nano .env`). İki değer dolduracaksınız.

**a. Tek kullanımlık bir özel anahtar.** Rastgele bir tane üretin:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Ne yapar**

- `node -e "..."`, tek satırlık bir JavaScript çalıştırır.
- Satır 32 rastgele bayt üretir ve onları önüne `0x` koyarak onaltılık düzende yazdırır. Bu bir özel anahtardır.

**Ne görmelisiniz:** tek satır; `0x` ve ardından 64 harf ve rakam. Sıfırlardan oluşan yer tutucunun yerine geçecek şekilde, onu `.env` dosyasına `PRIVATE_KEY=0x...` olarak kopyalayın.

**b. Kuantum sonrası bir kurtarma kodu.** Hesabın ML-DSA-87 anahtarı, ikinci bir sırdan, yani kurtarma kodundan üretilir.

```sh
pnpm window recovery-code
```

**Ne yapar**

- `pnpm window`, `scripts/window.ts` yardımcı betiğini çalıştırır. Ondan sonraki kelime komuttur.
- `recovery-code`, rastgele yeni bir kurtarma kodu yazdırır.

**Ne görmelisiniz:** `QRC1-` ile başlayan bir satır, ardından kısa bir hatırlatma. `QRC1-...` satırını `.env` dosyasına `QORE_PQC_RECOVERY_CODE=QRC1-...` olarak kopyalayın. Bu hesap için aynı kodu koruyun: yeni bir kod, hesaba farklı bir kuantum sonrası anahtar verir.

`QORE_MNEMONIC` değerini boş bırakın. (Mnemonic, yukarıdaki iki değerin yerine geçebilen 12 ya da 24 kelimelik bir ifadedir. İkisinden birini kullanın, ikisini birden değil.) `QORE_NETWORK=testnet` değerini koruyun; bu, yardımcıya test ağıyla konuşmasını söyler. `.env` dosyanız yer tutucularla şöyle görünür:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Dosyayı kaydedin.

### 5. Hesap adresinizi gösterin {#step-address}

```sh
pnpm window status
```

**Ne yapar**

- `status`, hesabınızı, kuantum sonrası anahtarının kayıtlı olup olmadığını ve bir EVM pencerenizin olup olmadığını gösterir.

**Ne görmelisiniz:** üç satır. İlki `account:  0x...  (qor1...)`. Hesabınızın iki adresi vardır: EVM için `0x...` ve native hat için `qor1...`. İkisi de aynı hesaba aittir. Diğer iki satır `PQC key:  not registered` ve `window:   none` der. Bu normaldir: hesap yenidir. İlk satırdaki `qor1...` adresini kopyalayın.

### 6. Faucet'ten testnet QOR'u alın {#step-faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. Sayfanın **Testnet**'e ayarlı olduğundan emin olun.
3. `qor1...` adresinizi yapıştırın ve QOR'u talep edin. Hesap başına 24 saatte bir kez 100 QOR alırsınız.
4. Yaklaşık 10 saniye bekleyin, sonra `pnpm window status` komutunu yeniden çalıştırın.

**Ne görmelisiniz:** öncekiyle aynı üç satır: anahtar hâlâ `not registered` ve pencere yok. Hesapta artık QOR var. Kanıt isterseniz https://explore.qore.network adresini (Testnet) açın ve `qor1...` adresinizi aratın.

### 7. Anahtarı kaydedin ve pencereyi açın {#step-window}

```sh
pnpm window register
```

**Ne yapar**

- `register`, hesabın ML-DSA-87 açık anahtarını zincire gönderir. Bunu hesap başına bir kez yaparsınız. Zincirde karşılaştırılacak bir anahtar henüz olmadığından, zincirin kuantum sonrası imza olmadan kabul ettiği tek mesajdır. Yaklaşık 0,09 QOR tutar.

**Ne görmelisiniz:** `registered: ` ve ardından bir işlem hash'i (64 karakter).

```sh
pnpm window open
```

**Ne yapar**

- `open`, bir EVM yetkilendirme penceresi açan, iki anahtarla imzalanmış (hibrit) tek bir işlem gönderir. Pencere canlıyken sıradan EVM işlemlerinize izin verilir. Varsayılan olarak 600 blok sürer ve 5 işleme izin verir. Bunu `.env` içindeki `QORE_WINDOW_BLOCKS` ve `QORE_WINDOW_TXS` ile değiştirebilirsiniz.

**Ne görmelisiniz:** `opened: ` ve ardından bir işlem hash'i, sonra `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **Bu hash'i kopyalayın.** 10. adımda kontrol edeceksiniz.

Şimdi yaklaşık 10 saniye bekleyin. Pencerenin açılması hesabın işlem sayacını değiştirir ve sonraki komutun yeni değeri görmesi gerekir.

```sh
sleep 10
pnpm window status
```

**Ne yapar**

- `sleep 10`, 10 saniye bekler (PowerShell ve Git Bash'te de çalışır).
- `status` sonucu gösterir.

**Ne görmelisiniz:** `PQC key:  registered` ve `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. Kontratı dağıtın {#step-deploy}

```sh
pnpm deploy:testnet
```

**Ne yapar**

- Kontratları dağıtan araç olan Hardhat Ignition'ı, `qorechainTestnet` ağında (zincir kimliği 9800, QoreChain testnet'i) `Counter` modülüyle çalıştırır.
- Sizden onay ister. `y` yazın ve Enter'a basın.

**Ne görmelisiniz:** `qorechainTestnet` (9800) ağına dağıtım için bir onay sorusu, ardından `y` yazdıktan sonra `CounterModule#Counter` ile biten ve kontrat adresiniz `0x...` olan bir satır. Bu, kontratınızın adresidir. **Ne kadar sürer:** yaklaşık 30 saniye.

### 9. Okuyun ve artırın {#step-interact}

```sh
pnpm interact
```

**Ne yapar**

- Saklanan sayıyı okur, `increment()` çağırır (bir ekler), sonra yeniden okur. Çağrı, pencerenizin 5 işleminden birini kullanır.

**Ne görmelisiniz:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1` ve bir explorer bağlantısı.

```sh
pnpm interact --read
```

**Ne yapar**

- `--read` yalnızca oku demektir: sayıyı gösterir ve hiçbir şey göndermez.

**Ne görmelisiniz:** Counter adresi ve `count: 1`.

### 10. Hibrit işlemi doğrulayın {#step-explorer}

`pnpm window open` işlemi, zincirin bir kuantum sonrası imzayı kontrol ettiğinin kanıtıdır. İki yoldan kontrol edin.

**a. Sade web isteğiyle.** `<HASH>` yerine 7. adımdaki hash'i yazın. `<` ve `>` işaretlerini silin.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Ne yapar**

- `curl <address>`, herkese açık bir QoreChain sunucusundan o işlemin kaydını ister ve yazdırır. Windows PowerShell'de `curl` yerine `curl.exe` yazın.
- `api-testnet.qore.host` herkese açık testnet sunucusudur. `<HASH>` istediğiniz işlemdir.

**Uzun yanıtta ne görmelisiniz:**

- `"code": 0`, yani işlem başarılı oldu.
- ML-DSA-87 imzasını taşıyan, 4.627 bayt uzunluğunda `PQCHybridSignature` türünde bir uzantı.
- `status` özniteliği `verified` olan bir `pqc_hybrid_verify` olayı.

**b. Explorer ile.**

1. https://explore.qore.network adresini açın ve ağ seçiciyi **Testnet**'e geçirin.
2. `pnpm window open` komutundan aldığınız hash'i aratın. Sayfa, zincirin doğruladığı bir kuantum sonrası imza gösterir.
3. Kontrat çağrısını görmek için 9. adımdaki `increment tx` hash'ini ya da Counter adresinizi aratın.

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector), aynı türden kanıtı bayt bayt gösterir.

## Aynı projeyi sıfırdan oluşturun {#scaffold}

Canlı workshop boş bir klasörden başlar. Bu komut aynı Hardhat projesini oluşturur (yalnızca indirilen kopyada bulunan `interact` betiği olmadan). 1. adım yerine, projelerinizi tuttuğunuz bir klasörde çalıştırın.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| Parça | Anlamı |
| --- | --- |
| `npx` | Bir aracı kurmadan doğrudan internetten çalıştırır. |
| `create-qorechain-dapp@latest` | QoreChain proje oluşturucusu, en yeni sürüm. |
| `qday-demo` | Yeni klasörün adı. |
| `-t hardhat` | Hangi proje şablonunun kullanılacağı: bir kontrat, testler ve pencere yardımcısı içeren Hardhat 3 projesi. |
| `--network testnet` | Projenin hangi QoreChain ağıyla konuşacağı: gerçek ağ değil, test ağı. |
| `--package-manager pnpm` | Kütüphaneleri hangi aracın kuracağı. |

**Ne görmelisiniz:** kurulan paketlerin bir listesi, ardından `Done! Created qday-demo`. Kütüphaneler zaten kurulu ve bir `.env` dosyası zaten var; bu yüzden 2. adımı ve 4. adımdaki kopyalamayı atlayabilirsiniz. `pnpm test` (3. adım) ile devam edin, sonra 4a ve 4b (`.env` dosyasını doldurun) ve 5'ten 8'e kadar olan adımlar. **Ne kadar sürer:** yaklaşık 30 saniye.

## Sonunda ne görmelisiniz {#result}

- `pnpm test` `2 passing` yazdırır.
- `pnpm window status`, kalan bloklar, işlemler ve değerle birlikte `PQC key:  registered` ve `window:   live` yazdırır.
- `pnpm deploy:testnet`, dağıtılan `Counter` adresini (`0x...`) yazdırır.
- `pnpm interact`, `count` değerinin 0'dan 1'e gittiğini, `status: success` ve bir explorer bağlantısı yazdırır.
- `curl` kontrolü `"code": 0`, `PQCHybridSignature` uzantısını ve `status` değeri `verified` olan `pqc_hybrid_verify` olayını gösterir. Explorer (Testnet) aynı işlemi doğrulanmış olarak işaretler.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| `pnpm: command not found` | pnpm kurulu değil. Node.js onu içermez. | `npm install -g pnpm` komutunu çalıştırın, sonra yeni bir terminal açın. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js çok eski. | Node.js 22 veya üstünü kurun ve `node --version` ile kontrol edin. |
| `node: .env: not found` | Bu klasörde `.env` dosyası yok. | 4. adımı yapın ve komutu proje klasöründen çalıştırın. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | `.env` dosyası eksik ya da `PRIVATE_KEY` hâlâ yer tutucu veya yazım hatası içeriyor. | 4. adımı yeniden yapın. Dosyayı kaydedin. Komutu proje klasöründen çalıştırın. |
| `Set QORE_PQC_RECOVERY_CODE in .env` veya `not a valid QRC1 recovery code` | Kurtarma kodu boş ya da yazım hatası içeriyor. | `pnpm window recovery-code` komutunu çalıştırın ve `QRC1-...` satırının tamamını yapıştırın. |
| `... does not exist on chain yet: send it some QOR first` (`register` veya `open` sırasında) | Hesabın henüz QOR'u yok. | Faucet'ten QOR isteyin (6. adım) ve 10 saniye bekleyin. |
| Faucet sınıra ulaştığınızı söylüyor | Hesap başına 24 saatte bir talep. | Bekleyin, sonra yeniden deneyin. Ya da ikinci bir tek kullanımlık hesap kullanın. |
| `account has no PQC key and classical fallback is disabled` | Anahtarı kaydetmeden önce bir işlem gönderdiniz. | `pnpm window register`, sonra `pnpm window open` komutunu çalıştırın. |
| `EVM authorisation window exhausted` (ya da `open an EVM window first` ipucu) | Pencerenin blokları veya işlemleri tükendi ya da hiç açılmadı. | `pnpm window open` komutunu çalıştırın, 10 saniye bekleyin, yeniden deneyin. |
| Pencere açıldıktan sonra `HHE10402` | Dağıtım, hesabın işlem sayacı güncellenmeden önce çalıştı. | 10 saniye bekleyin ve `pnpm deploy:testnet` komutunu yeniden çalıştırın. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` kontratı bulamıyor. | Bu klasörde 8. adımı tamamlayın. |
| `PQC key: registered, but NOT this key` | `.env` içindeki kurtarma kodu, kayıt sırasında kullanılandan farklı. | Özgün kurtarma kodunu geri koyun. Farklı bir kod farklı bir anahtar üretir. |
| Bir tarayıcı uygulamasında CORS hataları | Herkese açık REST sunucusu CORS başlıkları göndermez, bu yüzden tarayıcı onu engeller. | [Guestbook web sayfasının](/build-before-qday/workshop-1/apps/qday-guestbook) yaptığı gibi şablonun `/lcd` vekilini kullanın. |

## Kod {#code}

Kontrat (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

`scripts/window.ts` dosyasının hibrit imzalı kısmı (pencere mesajı ve imzalayıcı):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc`, anahtar malzemenizden üretilen hesaptır; `net` ise `QORE_NETWORK` için ağ kaydıdır (varsayılan `testnet`, zincir kimliği `qorechain-diana`). Betiğin kullandığı ücret 100000 `uqor` (0,1 QOR) ve gaz sınırı 800000'dir; çünkü hibrit işlemler büyüktür.

## Kullanılan paketler {#packages}

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Hibrit imzalama, PQC anahtar kaydı, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM pencere yardımcıları (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Native hat işleminin yayınlanması |
| `hardhat` | ^3.21.1 | Derleme, test, Ignition ile dağıtım |
| `viem` | ^2.47.6 | Kontratı okuma ve yazma |
| `tsx` | ^4.19.0 | TypeScript betiklerini çalıştırma |
| `typescript` | ^5.6.3 | Tür denetimi |

Bkz. [İskeleler ve CLI](/developer-tools/scaffolders-and-cli) ve [SDK'yı kurun](/sdk/install).

## Ağ bilgileri {#networks}

| Öğe | Değer |
| --- | --- |
| Ağ | testnet `qorechain-diana` |
| EVM zincir kimliği | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Kaynak: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
