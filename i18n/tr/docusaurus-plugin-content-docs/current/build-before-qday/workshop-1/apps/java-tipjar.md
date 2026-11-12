---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java Uygulaması, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java Uygulaması: Q-Day Tip Jar

**Q-Day Tip Jar**, QoreChain testnet'i (`qorechain-diana`, EVM zincir kimliği 9800) için küçük bir Java programıdır. Bahşişleri bir **hibrit imza** ile gönderir: klasik bir secp256k1 imzası artı kuantum sonrası bir ML-DSA-87 imzası (FIPS 204). Ayrıca bir mağaza arka ucu gibi bir "kumbara" adresini izleyebilir ve kuantum güvenli bahşişleri klasik olanlardan ayırt edebilir.

**Ne kadar sürer:** ilk seferde yaklaşık 20 dakika (10 dakika araç kurulumu, 5 dakika hazırlık, 5 dakika gönderme ve kontrol).

Java bilmeniz gerekmez. Aşağıdaki komutları tek tek yazar ve sonucu "Ne görmelisiniz" ile karşılaştırırsınız.

## Ne gösterir {#what-it-shows}

- SDK'da tek bir çağrıyla Java'dan **hibrit ML-DSA-87 + secp256k1 imzalama**.
- **Zincirde doğrulanan hibrit imzalı bir işlem**: zincir `status=verified` ile bir `pqc_hybrid_verify` olayı kaydeder ve işlem 4.627 baytlık bir ML-DSA-87 imzası taşır.
- **Kuantum güvenli bahşişleri klasik olanlardan ayıran bir arka uç**: `watch`, gelen her transferi `QUANTUM-SAFE` veya `classical only` diye etiketler.

Neden önemli: yalnızca klasik bir imzanın gelecekteki bir kuantum bilgisayar tarafından kırılabilmesi beklenir. Zincirin kendi doğrulama kaydını kontrol eden bir servis, her ödemeye ne kadar güveneceğine karar verebilir. [Kuantum Güvenli İşlemler](/sdk/guides/quantum-safe) sayfasına bakın.

:::warning Yalnızca testnet
Yalnızca tek kullanımlık bir testnet hesabı kullanın. Testnet QOR'unun değeri yoktur. Bu kılavuzda asla gerçek cüzdanınızı, gerçek kurtarma ifadenizi veya gerçek paranızı kullanmayın.
:::

## Göreceğiniz kelimeler {#words}

| Kelime | Anlamı |
| --- | --- |
| Testnet | QoreChain'in bir alıştırma kopyası. Üzerindeki coinler ücretsizdir ve hiçbir değeri yoktur. |
| QOR ve uqor | Aynı coinin iki adı. 1 QOR = 1.000.000 uqor. Uygulama sizden QOR ister. Ücretler uqor cinsinden gösterilir. |
| Memo | Bir işleme eklenen kısa bir metin, banka havalesindeki bir not gibi. |
| Adres | Herkese açık hesap numaranız. QoreChain'de `qor1` ile başlar. Paylaşmak güvenlidir. |
| Anahtar dosyası | Gizli kurtarma ifadenizi içeren bir dosya. Asla paylaşmayın. |
| Faucet | Ücretsiz testnet QOR veren bir web sitesi. |
| Hash | Bir işlemin benzersiz kimliği. İşlemi aramak için kullanırsınız. |

## Başlamadan önce {#before}

Üç araca ihtiyacınız var: **Git** (kodu indirir), **Java 21 veya daha yenisi** (uygulamayı çalıştırır) ve **Maven** (uygulamayı derler). Her kurulumdan sonra **terminali kapatıp yenisini açın**, ardından kontrol komutunu çalıştırın.

| Araç | macOS | Windows | Linux (Debian veya Ubuntu) | Kontrol |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew için https://brew.sh) | https://git-scm.com/download/win (bu size "Git Bash" de verir) | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (Temurin 21'i, .msi yükleyicisini seçin) | `sudo apt install openjdk-21-jdk` | `java -version` 21 veya daha yüksek demeli |
| Maven | `brew install maven` | https://maven.apache.org/download.cgi adresinden zip dosyasını indirin ve https://maven.apache.org/install.html adresini izleyin | `sudo apt install maven` | `mvn -version` |

Windows'ta bu kılavuz için terminal olarak **Git Bash**'i (Git ile kurulur) kullanın, çünkü `tipjar` başlatıcısı bir kabuk betiğidir. macOS'ta Terminal'i kullanın. Linux'ta herhangi bir terminali kullanın. Düz PowerShell'i tercih ederseniz 3. adımdaki nota bakın.

**Homebrew'lu macOS'ta:** `brew install openjdk@21` size onu bağlamanızı söyleyebilir. `java -version` hâlâ eski bir sürüm gösteriyorsa, Homebrew'un "For the system Java wrappers to find this JDK" başlığı altında yazdırdığı komutu çalıştırın, ardından yeni bir terminal açın.

## Bir testnet cüzdanı ve ücretsiz QOR alın {#wallet}

Uygulama kendi tek kullanımlık anahtarını oluşturur (aşağıdaki 4. adım), bu yüzden bu kılavuz için bir cüzdan uygulamasına kesinlikle ihtiyacınız yok. Ancak testnet QOR almak için bir yere ihtiyacınız var. Hesabınızı QoreX'te de görmek isterseniz:

1. **QoreX uygulaması:** Ayarlar'ı açın, ardından **Use testnet (developers)** seçeneğini açın.
2. **QoreX tarayıcı uzantısı:** kilidini açın, alttaki sürüm numarasına 7 kez dokunun, ardından **Switch to testnet (diana)** seçeneğini seçin.

Ücretsiz QOR, https://dashboard.qorechain.io/faucet adresindeki faucet'ten gelir. Oturum açarsınız, adresi yapıştırırsınız ve talep edersiniz. **Hesap başına 24 saatte 100 QOR** verir.

Yeni bir hesabın ilk işlemi, kuantum sonrası ML-DSA-87 anahtarını zincire kaydeder. Bu, yaklaşık 0,09 QOR ücretli tek seferlik bir adımdır. Uygulama bunu `register` komutuyla sizin için yapar.

## Adım adım {#run}

### 1. Kodu indirin {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**Ne yapar**

- `git clone <address>`: projeyi GitHub'dan bilgisayarınızdaki `build-before-qday` adlı yeni bir klasöre kopyalar.
- `cd <folder>`: terminalinizi Java uygulamasının klasörüne taşır. Sonraki her komut bu klasörden çalışmalıdır.

**Ne görmelisiniz:** `Cloning into 'build-before-qday'...` gibi satırlar ve ardından komut satırınız yeni klasörde.

### 2. Uygulamayı derleyin {#build}

```bash
mvn -q package
```

**Ne yapar:** Maven, QoreChain SDK'sını Maven Central'dan indirir ve uygulamayı çalıştırılabilir tek bir dosyaya, `target/tipjar.jar` dosyasına paketler.

| Parça | Anlamı |
| --- | --- |
| `mvn` | Maven derleme aracı. |
| `package` | Kodu derle ve bir `.jar` dosyasına paketle. |
| `-q` | Sessiz mod: yalnızca sorunları yazdır. |

**Ne görmelisiniz:** birkaç saniye hiçbir şey (ilk seferde yaklaşık 10 saniye, yavaş bir bağlantıda biraz daha uzun), sonra komut satırınız geri gelir. Dosyanın var olduğunu kontrol edin:

```bash
ls target/tipjar.jar
```

**Ne görmelisiniz:** `target/tipjar.jar`.

### 3. Başlatıcıyı çalıştırılabilir yapın ve deneyin {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**Ne yapar**

| Parça | Anlamı |
| --- | --- |
| `chmod +x tipjar` | `tipjar` dosyasının bir program olarak çalıştırılmasına izin verir. Yeni indirilmiş bir dosyada bu izin yoktur. |
| `./tipjar` | Bu klasördeki başlatıcıyı çalıştırır. `java -jar target/tipjar.jar` komutunu başlatır. Komut verilmezse yardım metnini yazdırır. |

**Ne görmelisiniz:** bir komut listesi: `new`, `status`, `register`, `tip`, `watch`.

:::note Windows'ta düz PowerShell
`chmod` adımını atlayın. Aşağıdaki her komutta `./tipjar` yerine `java -jar target/tipjar.jar` yazın.
:::

### 4. Tek kullanımlık testnet hesabınızı oluşturun {#key}

```bash
./tipjar new
```

**Ne yapar:** yeni bir hesap oluşturur. Gizli bir kurtarma ifadesini `~/.config/qday/java.env` anahtar dosyasına yazar (ev klasörünüzde, yalnızca sizin okuyabileceğiniz şekilde) ve yalnızca herkese açık adresi yazdırır.

| Parça | Anlamı |
| --- | --- |
| `new` | Yeni bir anahtar dosyası oluştur ve adresini yazdır. |
| `new --force` | Var olan bir anahtar dosyasını değiştir. Eski anahtar kaybolur. |

**Ne görmelisiniz:** `new jar key`, anahtar dosyasının yolu ve `qor1...` ile başlayan bir `address`. Kurtarma ifadesi asla yazdırılmaz.

**`qor1...` adresini kopyalayın.** Kaybederseniz `./tipjar status` onu yeniden yazdırır. Anahtar dosyasını asla paylaşmayın, Git'e göndermeyin ve mainnet'te yeniden kullanmayın. Anahtarı başka bir yerde tutmak için önce `TIPJAR_KEY` ayarlayın: `TIPJAR_KEY=/path/to/file ./tipjar status` (PowerShell'de: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Faucet'ten testnet QOR alın {#faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve oturum açın.
2. `qor1...` adresinizi yapıştırın ve talep düğmesine basın.
3. Birkaç saniye bekleyin, ardından şunu çalıştırın:

```bash
./tipjar status
```

**Ne yapar:** testnet'ten bakiyenizi ve kuantum sonrası anahtarınızın kayıtlı olup olmadığını sorar.

**Ne görmelisiniz:** `balance   100 QOR` (veya faucet tutarı) ve ML-DSA-87 anahtarının henüz kayıtlı olmadığını söyleyen bir satır. Bakiye 0 ise 10 saniye bekleyin ve yeniden çalıştırın.

### 6. Kuantum sonrası anahtarınızı kaydedin {#register}

```bash
./tipjar register
```

**Ne yapar:** ML-DSA-87 anahtarınızı zincire bir kez kaydeder. Yeniden çalıştırmak güvenlidir. Bu ilk işlem yalnızca klasik anahtarla imzalanır, çünkü imzalamak için zincirde henüz bir kuantum sonrası anahtar yoktur. Yaklaşık 0,09 QOR tutar. Ondan sonraki her işlem hibrit imzalıdır.

**Ne görmelisiniz:** bir işlem hash'i ve anahtarın kaydedildiğini söyleyen bir mesaj. `./tipjar status` komutunu yeniden çalıştırın; artık anahtarı kayıtlı göstermelidir.

**Ne kadar sürer:** birkaç saniye (bir blok).

### 7. Bahşişleri almak için ikinci bir adres oluşturun {#jar}

Bir bahşişi alacak birine ihtiyaç vardır. Kendi anahtar dosyasıyla ikinci bir tek kullanımlık hesap, yani "kumbara" oluşturun:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**Ne yapar:** `./tipjar` öncesindeki kısım anahtar dosyasını yalnızca bu tek komut için ayarlar (`TIPJAR_KEY`), böylece yeni hesap ilkinin üzerine yazmaz. Windows PowerShell'de önce `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"` çalıştırın, ardından `java -jar target/tipjar.jar new` yazın ve sonra `Remove-Item Env:TIPJAR_KEY` ile sıfırlayın.

**Ne görmelisiniz:** yeni bir `qor1...` adresi. Kopyalayın. Bu sizin **kumbara adresinizdir**. Kumbaranın bahşiş alması için hiç QOR'a ihtiyacı yoktur.

### 8. Hibrit imzalı bir bahşiş gönderin {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

`qor1...JAR_ADDRESS` yerine 7. adımdaki kumbara adresini yazın.

| Parça | Anlamı |
| --- | --- |
| `tip` | Bir bahşiş gönder. |
| `qor1...JAR_ADDRESS` | Bahşişi kimin alacağı. |
| `1` | QOR cinsinden tutar (yani 1 QOR = 1.000.000 uqor). |
| `"my first quantum-safe tip"` | Memo, işleme eklenen kısa bir metin. İsteğe bağlı. Boşluk içeriyorsa tırnakları koruyun. |

**Ne yapar:** uygulama zincire işlemin ne kadar gaza ihtiyaç duyduğunu sorar (bir deneme çalıştırması), güvenlik payı olarak yüzde 30 ekler, iki anahtarla da imzalar, gönderir, bloğu bekler ve ardından zincirin kendi kaydını kontrol eder.

**Ne görmelisiniz:** işlem hash'i, blok yüksekliği ve `QUANTUM-SAFE` sonucu. `CHECK FAILED` görürseniz Sorun giderme bölümüne bakın. Hash'i kopyalayın.

**Ne kadar sürer:** yaklaşık 10 saniye.

### 9. Kumbarayı bir mağaza arka ucu gibi izleyin {#watch}

**İkinci bir terminal** açın, aynı klasöre gidin ve izleyiciyi başlatın:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Şimdi ilk terminale dönün ve bir bahşiş daha gönderin (8. adım, yeni bir memo ile).

**Ne yapar:** `watch`, her 3 saniyede bir zincirden kumbaraya gelen yeni transferleri sorar ve her birini etiketler. `NO_COLOR=1 ./tipjar watch ...` renkleri kapatır. Ctrl+C ile durdurun.

**Ne görmelisiniz:** her bahşiş `QUANTUM-SAFE` etiketiyle listelenir. Doğrulanmış bir hibrit imza olmadan gönderilen bir bahşiş `classical only` gösterirdi.

## İşlemi kendiniz doğrulayın {#verify}

Uygulamaya güvenmek zorunda değilsiniz. Zincire doğrudan sorun.

**1. yol, tarayıcıda.** `https://explore.qore.network/tx/<HASH>` adresini açın (`<HASH>` yerine kendi hash'inizi yazın), ardından explorer'ı **Testnet**'e geçirin. Başarılı bir işlem görmelisiniz.

**2. yol, tek komut.** `<HASH>` yerine kendi hash'inizi yazın:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parça | Anlamı |
| --- | --- |
| `curl` | Bir web adresini indiren araç. macOS'ta, Windows 10+ sürümlerinde ve çoğu Linux'ta yerleşik gelir. |
| `-s` | Sessiz: ilerleme çubuğunu gizle. |
| adres | Herkese açık testnet REST API'si. Tam işlem kaydını JSON olarak döndürür. |

Uzun çıktıda **ne görmelisiniz** (bir JSON görüntüleyici kullanın veya jq kurduysanız `| jq .` ekleyin):

- `"code": 0`, işlemin başarılı olduğu anlamına gelir.
- **4.627 baytlık** bir `pqc_signature` tutan bir `PQCHybridSignature` uzantısı (bu, ML-DSA-87 imzasıdır).
- Adresiniz için `status` değeri `verified` olan bir `pqc_hybrid_verify` olayı.

## Kanıt nasıl çalışır {#proof}

Uygulama aynı kaydı `GET /cosmos/tx/v1beta1/txs/{hash}` çağrısından okur ve `pqc_hybrid_verify` olayını (`address=<signer>`, `status=verified`) ve 4.627 baytlık imzalı `/qorechain.pqc.v1.PQCHybridSignature` uzantısını arar. İzleyici, gelen her transfer için aynısını yapar.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| `./tipjar: Permission denied` | Yeni indirilen dosya çalıştırılabilir olarak işaretlenmemiş. | `chmod +x tipjar` çalıştırın. |
| `build first: (cd ... && mvn -q package)` | Jar dosyası yok. | Bu klasörde `mvn -q package` çalıştırın (2. adım). |
| `mvn: command not found` veya `java: command not found` | Araç kurulu değil ya da terminal yeniden açılmadı. | Kurun (Başlamadan önce bölümüne bakın), yeni bir terminal açın, sürümü kontrol edin. |
| Java sürümün 17 veya daha düşük olduğunu söylüyor | Yolunuzda eski bir Java önce geliyor. | Java 21'i kurun, yeni bir terminal açın, `java -version` komutunu yeniden çalıştırın. |
| `no key file at ..., run new first` | 4. adımı atladınız ya da `TIPJAR_KEY` başka bir yeri gösteriyor. | `./tipjar new` çalıştırın. |
| `key file already exists` | Zaten bir anahtar oluşturdunuz. | Onu koruyun veya `./tipjar new --force` ile değiştirin (eski anahtar kaybolur). |
| `account has no PQC key and classical fallback is disabled` | Kuantum sonrası anahtar henüz kayıtlı değil. | Önce `./tipjar register` çalıştırın. |
| `EVM authorisation window exhausted` | Bu mesaj EVM uygulamalarına (counter, guestbook) aittir. Tip Jar'da kullanılmaz. | EVM uygulamalarında `pnpm window open` ile yeni bir pencere açın. |
| Pencere açıldıktan sonra `HHE10402` | Yalnızca Hardhat uygulamaları: pencere henüz etkin değildi. | Hardhat uygulamalarında dağıtımı yeniden çalıştırın. |
| Bakiye 0 ya da `not on chain yet` | Faucet tokenları henüz gelmedi. | 10 saniye bekleyin, `./tipjar status` çalıştırın. Doğru adresi yapıştırdığınızı kontrol edin. |
| Faucet hız sınırı diyor | Hesap başına 24 saatte bir talep. | Bekleyin veya ikinci bir tek kullanımlık hesap kullanın. |
| `chain refused the tx` veya `poll failed` | Testnet meşgul ya da yükseltiliyor, ya da herkese açık uç nokta IP adresi başına istekleri sınırlıyor. | Bir dakika bekleyin ve komutu yeniden çalıştırın. |
| `recipient must be a qor1... address` | Adres yanlış ya da boşluk içeriyor. | Tam `qor1...` adresini yeniden kopyalayın. |
| Tarayıcıda `CORS` hataları | Yalnızca bir web sayfası zinciri doğrudan çağırdığında. Bu uygulama çağırmaz. | Bir tarayıcı uygulamasında şablonun `/lcd` vekilini kullanın. |
| `pnpm: command not found` | pnpm kurulu değil. Burada gerekmez. | Yalnızca Hardhat kılavuzu için: `npm install -g pnpm` çalıştırın. |

## Önemli olan SDK kodu {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

Gaz asla sabit değildir: her işlem önce simüle edilir ve simüle edilen gazın 1,3 katı alınır, gaz başına 0,15 uqor üzerinden fiyatlandırılır.

Hesap, klasik bir coin 118 QoreChain hesabıdır (`m/44'/118'/0'/0/0`). ML-DSA-87 anahtarı aynı kurtarma ifadesinden türetilir ve `Authenticator.derivePqcCanonical` ile adrese bağlanır. Kendi uygulamanızı bunun yerine seed tabanlı yardımcılar üzerine kurarsanız, SDK 0.13.0 bir kurtarma kodu veya bağımsız bir 32 baytlık PQC sırrı ister; [SDK kurulumu](/sdk/install#whats-new-0130) sayfasına bakın. Bir kurtarma kodunu asla yazdırmayın.

## Kullanılan paketler {#packages}

| Öğe | Sürüm |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Uygulama `demo:tipjar` | 1.0.0 |

Tüm dillerin sürüm tablosu için [SDK kurulumu](/sdk/install) sayfasına bakın.

## Nerelere bakılır {#access}

| Ne | Nerede |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Kod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
