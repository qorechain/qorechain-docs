---
slug: /build-before-qday/prerequisites
title: "Başlamadan önce: araçlar ve bir testnet cüzdanı"
sidebar_label: "Başlamadan önce"
sidebar_position: 2
---

# Başlamadan önce: araçlar ve bir testnet cüzdanı

Bu bölümdeki her eğitim, hiçbir şey kurulu olmayan bir bilgisayardan başlar. Bu sayfa, kurulumu yaptığınız tek yerdir. Bir kez yapın, sonra istediğiniz eğitimi açın. Her eğitim buraya geri bağlantı verir ve yalnızca ihtiyaç duyduğu kısa kontrol komutlarını tekrar eder.

**Ne kadar sürer:** ilk seferde yaklaşık 20 ile 40 dakika, çoğu indirmelerde geçer. Yalnızca izlemek istediğiniz eğitimin araçlarını kurarsınız.

:::caution Yalnızca atılabilir bir testnet hesabı
Buradaki her şey, QOR'un hiçbir değeri olmadığı QoreChain **testnet** üzerinde çalışır. Hiçbir eğitimde gerçek cüzdanınızı, gerçek bir kurtarma ifadesini veya gerçek fonları kullanmayın. Bu alıştırma için yepyeni bir hesap oluşturacaksınız.
:::

## Hangi eğitim hangi araçları ister? {#which-tools}

Yalnızca ihtiyaç duyduğunuz satırları kurun. Git, bir terminal ve bir web tarayıcısı hepsi için gereklidir.

| Eğitim | Dil | Kurulacak araçlar | QoreX cüzdanı |
| --- | --- | --- | --- |
| [Workshop 1 kılavuzu](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (isteğe bağlı) | Gerekmez |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | Gerekmez |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Gerekir, bir Ethereum hesabıyla (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Gerekir |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | Gerekmez |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | Gerekmez |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 veya üstü | Gerekmez |

## Bir terminal açın {#terminal}

Terminal, komut yazdığınız bir penceredir. Bu sayfalardaki komutları, birer birer buraya yapıştıracaksınız.

| Sistem | Nasıl açılır |
| --- | --- |
| macOS | Command ve Boşluk tuşlarına basın, `Terminal` yazın, Return tuşuna basın. |
| Windows | Başlat menüsünü açın, `PowerShell` yazın, **Windows PowerShell** uygulamasını açın. Java eğitimi için ayrıca **Git Bash** (Git ile birlikte gelir, aşağıya bakın) veya WSL gerekir. |
| Linux | Ctrl, Alt ve T tuşlarına basın veya uygulamalarınız arasında `Terminal` arayın. |

Bir aracı kurduktan sonra **terminali kapatın ve yeni bir terminal açın**. Kurulum sırasında açık olan bir terminal yeni aracı henüz görmez.

## Araçları kurun {#install}

Her araç için kurulum komutunu veya indirme bağlantısını, ardından **kontrol komutunu** bulursunuz. Kontrol komutu araçtan sürümünü ister. Gereken sürümde veya daha yenisinde bir sürüm numarası yazdırıyorsa araç çalışıyor demektir.

### Paket yöneticileri (isteğe bağlı yardımcılar) {#package-managers}

Paket yöneticisi, başka programları tek bir komutla kurar. Her aracı kendi web sitesinden elle de indirebilirsiniz. Aşağıdaki komutlar, sisteminize uygun yardımcıyı kullanır.

| Sistem | Yardımcı | Nasıl edinilir |
| --- | --- | --- |
| macOS | Homebrew | Bu tek satırı terminale yapıştırın, sonra yazdırdığı yönergeleri izleyin: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Windows 10 ve 11 ile birlikte gelir. `winget --version` ile kontrol edin. |
| Linux | apt | Ubuntu ve Debian ile birlikte gelir. Diğer sistemler: kendi paket yöneticinizi kullanın (`dnf`, `pacman`). |

### Git {#git}

Git, örnek kodu GitHub'dan indirir.

| Sistem | Kurulum |
| --- | --- |
| macOS | `xcode-select --install` (bir pencere açılır, **Install** seçin) veya `brew install git` |
| Windows | `winget install --id Git.Git -e` veya [git-scm.com](https://git-scm.com/download/win) adresinden indirin |
| Linux | `sudo apt install -y git` |

Kontrol edin:

```bash
git --version
```

`git version 2.40.0` gibi bir satır görmelisiniz. Her sürüm işe yarar.

### Node.js 22.13 veya üstü {#node}

Node.js, TypeScript projelerini çalıştırır. Burada kullanılan kontrat aracı Hardhat 3, Node.js 22.13'ten eski herhangi bir sürümde başlamayı reddeder.

| Sistem | Kurulum |
| --- | --- |
| macOS | `brew install node` veya [nodejs.org](https://nodejs.org) adresinden LTS yükleyicisini indirin |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e` veya [nodejs.org](https://nodejs.org) adresinden LTS yükleyicisini indirin |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` ardından `sudo apt install -y nodejs` |

:::note Linux: varsayılan apt paketini kullanmayın
Ubuntu ve Debian'da `sudo apt install nodejs` komutu, çok düşük olan eski bir sürüm kurar. Yukarıdaki NodeSource satırını kullanın.
:::

Kontrol edin:

```bash
node -v
```

`v22.13.0` veya daha yüksek bir sürüm görmelisiniz, örneğin `v22.20.0` veya `v24.1.0`. Daha düşük bir numara görüyorsanız yeniden kurun ve yeni bir terminal açın.

### pnpm 9 veya üstü {#pnpm}

pnpm, bir TypeScript projesinin ihtiyaç duyduğu kütüphaneleri kurar. `npm` ile aynı işi yapar, yalnızca daha hızlıdır.

Her sistemde, Node.js'in kendi kurulum aracı olan `npm` ile kurun:

```bash
npm install -g pnpm
```

| Bölüm | Ne yapar |
| --- | --- |
| `npm install` | Bir programı indirir ve kurar. |
| `-g` | "global" sözcüğünün kısaltması: programı tek bir klasör için değil, tüm bilgisayarınız için kurar. |
| `pnpm` | Kurulacak program. |

macOS ve Linux'ta bu komut `EACCES` veya "permission denied" ile biterse, `sudo npm install -g pnpm` olarak yeniden çalıştırın.

:::caution Homebrew ile gelen Node.js, pnpm içermez
Bir eğitim `pnpm: command not found` (veya `zsh: command not found: pnpm`) diyorsa, pnpm'i henüz kurmamışsınız demektir. `npm install -g pnpm` komutunu çalıştırın, yeni bir terminal açın ve yeniden deneyin.
:::

Kontrol edin:

```bash
pnpm -v
```

`9.0.0` veya daha yüksek bir sürüm görmelisiniz, örneğin `10.4.1`.

### curl ve jq (yalnızca Workshop 1 kılavuzu) {#curl-jq}

`curl`, terminalden bir web adresini indirir. İşleminizi herkese açık REST uç noktasından okumak için kullanırsınız. `jq`, uzun yanıtı süzer, böylece yalnızca istediğiniz kısmı görürsünüz. `jq` isteğe bağlıdır.

| Sistem | curl | jq |
| --- | --- | --- |
| macOS | Dahildir. | `brew install jq` |
| Windows | Windows 10 ve 11'de `curl.exe` olarak dahildir. | `winget install --id jqlang.jq -e` |
| Linux | Eksikse `sudo apt install -y curl` | `sudo apt install -y jq` |

Kontrol edin:

```bash
curl --version
jq --version
```

Her biri için bir sürüm satırı görmelisiniz, örneğin `jq-1.7`.

:::note Windows PowerShell: curl.exe yazın
PowerShell'de kısa `curl` sözcüğü başka, yerleşik bir komuttur. Bu sayfalardaki her komutta `curl` yerine `curl.exe` yazın. Git Bash kullanıyorsanız düz `curl` çalışır.
:::

### Rust 1.88 veya üstü (yalnızca Rust eğitimi) {#rust}

Rust, `qday-pay` komut satırı uygulamasını derler. Resmi Rust yükleyicisi olan `rustup` ile kurarsınız. Rust'ın derleme aracı `cargo` da birlikte kurulur.

| Sistem | Kurulum |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (varsayılanı kabul etmek için Return tuşuna basın). Derleyici araçları `xcode-select --install` ile gelir. |
| Windows | [rustup.rs](https://rustup.rs) adresinden `rustup-init.exe` dosyasını indirip çalıştırın veya `winget install --id Rustlang.Rustup -e` kullanın. Visual Studio C++ Build Tools istediğinde kabul edin: Rust'ın Windows'ta program derlemesi için bunlara ihtiyacı vardır. |
| Linux | `sudo apt install -y build-essential curl` ardından `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (varsayılanı kabul etmek için Return tuşuna basın) |

Kontrol edin:

```bash
rustc --version
cargo --version
```

`rustc 1.88.0` veya daha yüksek bir sürüm ile bir `cargo` sürüm satırı görmelisiniz. Rust zaten kuruluysa `rustup update` onu güncel hale getirir.

### Java 21 ve Maven (yalnızca Java eğitimi) {#java}

Tip Jar uygulaması, Java 21 veya daha yeni bir JDK (Java'yı derleyip çalıştıran araçlar) ve Java kütüphanelerini indiren derleme aracı Maven ister.

| Sistem | Kurulum |
| --- | --- |
| macOS | `brew install --cask temurin@21` ardından `brew install maven` (veya [adoptium.net](https://adoptium.net) adresindeki yükleyiciyi kullanın) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, ardından Maven'ı [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi) adresinden indirin, açın ve `bin` klasörünü `PATH` değişkenine ekleyin. Daha kolay yol: WSL kurun (aşağıya bakın) ve Linux satırını izleyin. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Kontrol edin:

```bash
java -version
mvn -version
```

`openjdk version "21` (veya 25 gibi daha yüksek bir sayı) ve `Apache Maven 3.` ile devam eden bir sürüm görmelisiniz. `java -version` 17 veya daha düşük bir sürüm gösteriyorsa Java 21'i kurun ve yeni bir terminal açın.

### Python 3.10 veya üstü, venv ile (yalnızca Python eğitimi) {#python}

Python, Airdrop uygulamasını çalıştırır. `venv`, kütüphaneleri için özel bir klasör oluşturur, böylece bilgisayarınızdaki başka hiçbir şeye dokunulmaz.

| Sistem | Kurulum |
| --- | --- |
| macOS | `brew install python` veya [python.org](https://www.python.org/downloads/) adresinden indirin |
| Windows | `winget install --id Python.Python.3.12 -e` veya [python.org](https://www.python.org/downloads/) adresinden indirin ve yükleyicide **Add python.exe to PATH** seçeneğini işaretleyin |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Kontrol edin:

```bash
python3 --version
```

`Python 3.10.0` veya daha yüksek bir sürüm görmelisiniz. Windows'ta bunun yerine `python --version` yazın (komut `python3` değil, `python` olur).

### Windows ve Linux komutları: WSL {#wsl}

Eğitimlerdeki komutların çoğu her sistemde aynıdır. Birkaçı Linux kabuğu özelliklerini kullanır: `source`, `chmod`, `./tipjar` ve `sleep`. Windows'ta iki seçeneğiniz var:

1. **Yerel Windows.** TypeScript, Rust ve Python eğitimleri için PowerShell kullanın. Eğitimler, farklılık olan yerde Windows varyantını verir, örneğin `.venv\Scripts\activate`. Java eğitimi için **Git Bash** kullanın (Git ile birlikte kurulur).
2. **WSL.** Linux için Windows Alt Sistemi, Windows'un içinde gerçek bir Linux sağlar. PowerShell'i yönetici olarak açın, aşağıdaki komutu çalıştırın, yeniden başlatın, sonra bu sayfadaki **Linux** satırlarını Ubuntu penceresinin içinde izleyin.

```powershell
wsl --install
```

| Bölüm | Ne yapar |
| --- | --- |
| `wsl` | Linux için Windows Alt Sistemi aracı. |
| `--install` | WSL'yi ve Ubuntu Linux sistemini tek adımda kurar. |

## Her şeyi tek seferde kontrol edin {#check-all}

Kurduğunuz araçların komutlarını çalıştırın. Her biri bir sürüm yazdırmalıdır.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Kontrol | İyi yanıt |
| --- | --- |
| `node -v` | `v22.13.0` veya daha yüksek |
| `pnpm -v` | `9.0.0` veya daha yüksek |
| `rustc --version` | `rustc 1.88.0` veya daha yüksek |
| `java -version` | `21` veya daha yüksek |
| `mvn -version` | `Apache Maven 3.` ve bir sürüm |
| `python3 --version` | `Python 3.10.0` veya daha yüksek |

## Bir testnet cüzdanı edinin {#wallet}

Test QOR'unu tutacağınız bir yere ihtiyacınız var. Bazı eğitimler sizin için bir dosyada atılabilir bir hesap oluşturur. Diğerleri, testnet'e geçirilmiş QoreChain'in resmi cüzdanı **QoreX**'i kullanır. [Hangi eğitim hangi araçları ister?](#which-tools) tablosu hangisinin hangisi olduğunu söyler.

### Testnet'te QoreX {#qorex}

1. QoreX'i resmi listeden kurun: iPhone için [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626), Android için [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex), Chrome, Brave, Edge, Arc ve Opera için [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) veya [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). Tam liste [QoreX genel bakış](/qorex/overview) sayfasındadır.
2. **Yeni** bir cüzdan oluşturun ve kurtarma ifadesini kağıda kaydedin. Gerçek fon tutan bir ifadeyi içe aktarmayın.
3. Cüzdanı testnet'e geçirin:
   - **Telefon uygulaması:** **Settings** bölümünü açın, ardından **Use testnet (developers)** seçeneğini açın.
   - **Tarayıcı eklentisi:** kilidini açın, sonra **en alttaki sürüm numarasına** 7 kez dokunun. Bir geliştirici seçeneği belirir. **Switch to testnet (diana)** seçeneğini seçin.
4. Testnet rozetinin göründüğünü kontrol edin. Testnet'in adı `qorechain-diana`'dır.

**Ne görmelisiniz:** cüzdanda bir testnet rozeti ve ana ekranda bir `qor1...` adresi. Testnet bakiyeleri dolar değeri göstermez ve bu doğrudur.

### Bir Ethereum hesabı ekleyin (coin 60) {#coin-60}

Guestbook eğitimi EVM lane'ini kullanır, bu yüzden cüzdanın Ethereum tarzı bir hesaba ihtiyacı vardır.

1. QoreX'te hesap listesini açın ve **Add an Ethereum account (coin 60)** seçeneğini seçin.
2. Yeni bir tane oluşturun. Gerçek fon tutan bir ifadeyi geri yüklemeyin.
3. O hesabı seçin. Bir `0x...` adresi gösterir.

**Ne görmelisiniz:** *Ethereum, coin 60* etiketli bir hesap ve `0x` ile başlayan bir adres. Aynı hesabın bir `qor1...` adresi de vardır.

Hesaplar hakkında daha fazlası: [QoreX hesabı ve Dashboard](/qorex/account-and-dashboard) ile [QoreX ile başlayın](/qorex/getting-started).

## Faucet'ten test QOR'u alın {#faucet}

Faucet, bir testnet adresine ücretsiz test QOR'u verir. Yeni bir hesap, bir şey yapabilmeden önce biraz almalıdır, çünkü her işlem küçük bir ağ ücreti öder.

1. Tarayıcınızda [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) adresini açın.
2. QoreChain Dashboard'a giriş yapın.
3. `qor1...` adresinizi adres kutusuna yapıştırın.
4. **Request Tokens** seçeneğini seçin.
5. **Tokens Sent!** yazısını bekleyin.

**Ne görmelisiniz:** 100 QOR gösteren **Tokens Sent!** kartı ve bir **View on Explorer** bağlantısı.

Faucet, hesap başına ve adres başına **24 saatte bir kez 100 QOR** öder. Çok erken tekrar isterseniz **Rate Limit Reached** gösterir. 24 saatin bitmesini bekleyin. Bu sayfadaki her eğitim için tek bir istek yeterlidir.

### İlk işleminiz post-kuantum anahtarınızı kaydeder {#first-tx}

Her QoreChain hesabının iki anahtarı vardır: klasik bir anahtar ve post-kuantum bir ML-DSA-87 anahtarı. Yeni bir hesabın ilk işlemi, **ML-DSA-87 anahtarını zincirde kaydeder**. Bu, hesap başına yalnızca bir kez yapılır ve yaklaşık **0,09 QOR** tutar. Ondan sonra her işlem iki anahtarla imzalanır.

Anahtarın nasıl oluşturulduğunu ve hesabınıza nasıl bağlandığını görmek için [Post-kuantum anahtarınız hesabınıza nasıl bağlanır](/build-before-qday/key-binding) sayfasını okuyun.

Eğitimler bu adımı sizin için `register` adlı bir komutla çalıştırır. Şimdi bir şey yapmanız gerekmez. Faucet'in 100 QOR'u bunu defalarca karşılar.

## QOR ve uqor {#units}

Aynı coin için iki ad göreceksiniz. **QOR** bütün coindir. **uqor** en küçük parçadır.

**1 QOR = 1.000.000 uqor.**

| Gördüğünüz | Anlamı |
| --- | --- |
| `1` QOR | 1.000.000 uqor |
| `0.1` QOR | 100.000 uqor |
| `0.09` QOR | 90.000 uqor |
| `0.15uqor` | Ücret öderken kullanılan, her gaz birimi için 0,15 uqor'luk fiyat |

Cüzdanlar ve çoğu komut QOR kullanır. Zincirin kendisi uqor ile sayar. **Memo**, bir işleme eklediğiniz kısa bir metindir, örneğin `Hello from the workshop`. Zincirde herkes onu okuyabilir, bu yüzden bir memoya asla sır yazmayın.

**Gaz**, bir işlemin ağdan istediği iş miktarının ölçüsüdür. Ücret, kullanılan gaz ile gaz fiyatının çarpımıdır. Bu bölümdeki araçlar gazı sizin için tahmin eder, bu yüzden hiçbir şey hesaplamazsınız.

## Atılabilir anahtarlarınızı güvende tutun {#key-hygiene}

Bir eğitim, testnet hesabınız için bir sır oluşturur ve onu bilgisayarınızda saklar. Test QOR'unun değeri olmasa da ona özenle davranın, böylece ana ağdan önce alışkanlığı edinirsiniz.

1. **Nerede durur.** TypeScript eğitimlerinde sırlar, proje klasöründeki `.env` adlı bir dosyaya gider. Rust, Java ve Python uygulamaları, `new` komutuyla ana klasörünüzün içindeki `.config/qday` adlı gizli bir klasöre bir anahtar dosyası yazar. Eğitim tam dosyayı belirtir.
2. **Asla paylaşmayın.** Onu sohbete, e-postaya, ekran görüntüsüne veya videoya yapıştırmayın. Ekranınızı paylaşırken dosyayı gizleyin.
3. **Asla commit etmeyin.** `.env` dosyasını veya bir anahtar dosyasını Git'e eklemeyin ve asla GitHub'a göndermeyin. Bir proje zaten yok saymıyorsa `.env` dosyasını `.gitignore` dosyasına ekleyin.
4. **Yalnızca testnet.** Bir testnet anahtarını, kurtarma ifadesini veya kurtarma kodunu ana ağda asla yeniden kullanmayın.
5. **Bitirince silin.** Bir eğitimi bitirdiğinizde anahtar dosyasını veya `.env` dosyasını silin. Bir dakikada her zaman yeni bir hesap oluşturabilirsiniz.

:::danger Gerçek fonlar
Gerçek fon tutan bir hesabın anahtarını, mnemonic'ini (kurtarma ifadesi) veya kurtarma kodunu bu bölümdeki hiçbir `.env` dosyasına, anahtar dosyasına veya komuta asla koymayın.
:::

## Ağ ve herkese açık uç noktalar {#network}

| Hizmet | Değer |
| --- | --- |
| Testnet adı | `qorechain-diana` |
| EVM chain ID | 9800 |
| REST (web üzerinden veri okuma) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | [explore.qore.network](https://explore.qore.network), sonra **Testnet** seçeneğine geçin |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Sorun giderme {#troubleshooting}

| Gördüğünüz | Neden | Ne yapmalı |
| --- | --- | --- |
| `pnpm: command not found` | pnpm kurulu değil. Node.js onu içermez, Homebrew ile kurulduğunda da. | `npm install -g pnpm` çalıştırın, yeni bir terminal açın ve `pnpm -v` çalıştırın. |
| `node: command not found` veya kurulumdan sonra eski bir sürüm | Terminal kurulum sırasında açıktı veya eski sürüm öncelikli. | Terminali kapatın, yenisini açın, `node -v` çalıştırın. Linux'ta varsayılan apt paketini değil, NodeSource satırını kullanın. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js, 22.13'ten eski. | Node.js 22.13 veya üstünü kurun, sonra projede yeniden `pnpm install` çalıştırın. |
| `npm install -g pnpm` sırasında `EACCES` veya permission denied | Kullanıcınız global klasöre yazamıyor. | macOS ve Linux'ta `sudo npm install -g pnpm` çalıştırın. |
| Rust kurulumundan sonra `rustc: command not found` | Terminal yeni `PATH` değerini henüz bilmiyor. | Yeni bir terminal açın. Yine de olmazsa `source "$HOME/.cargo/env"` çalıştırın. |
| Rust derlerken `linker 'cc' not found` veya `link.exe not found` | C derleyici araçları eksik. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: Visual Studio C++ Build Tools kurun. |
| `java -version` 17 veya daha düşük gösteriyor | Daha eski bir Java öncelikli. | Java 21'i kurun, yeni bir terminal açın, yeniden kontrol edin. |
| Python venv'i etkinleştirirken PowerShell betik çalıştırmanın devre dışı olduğunu söylüyor | Windows varsayılan olarak betikleri engeller. | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` çalıştırın, `Y` yanıtını verin, sonra yeniden etkinleştirin. |
| Faucet'te `Rate Limit Reached` | Faucet, hesap başına ve adres başına 24 saatte bir kez öder. | 24 saatin bitmesini bekleyin. Her eğitim için tek bir istek yeterlidir. |
| Cüzdan testnet rozeti göstermiyor | Cüzdan hâlâ ana ağda. | Telefon uygulaması: Settings, sonra **Use testnet (developers)**. Eklenti: sürüm numarasına 7 kez dokunun, sonra **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | Yeni hesap ML-DSA-87 anahtarını henüz kaydetmedi. | Önce eğitimin `register` adımını çalıştırın (hesabın ilk işlemidir). |
| Tarayıcı konsolunda CORS hataları | Herkese açık REST uç noktası CORS başlıkları göndermez, bu yüzden bir web sayfası onu doğrudan çağıramaz. | Şablonun yaptığı gibi uç noktayı projenin `/lcd` vekili üzerinden çağırın. |

## Sonraki adım {#next}

[Genel bakış](/build-before-qday/overview#choose) sayfasından bir eğitim seçin ve ilk komuttan başlayarak izleyin.
