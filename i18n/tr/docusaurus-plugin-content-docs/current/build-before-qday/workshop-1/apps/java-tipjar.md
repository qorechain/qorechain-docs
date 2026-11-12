---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java Uygulaması, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java Uygulaması: Q-Day Tip Jar

**Q-Day Tip Jar**, QoreChain testnet'i (`qorechain-diana`, EVM chain ID 9800) için küçük bir Java arka ucudur. Bahşişleri bir **hibrit imzayla** gönderir (klasik secp256k1 artı kuantum sonrası ML-DSA-87, FIPS 204). Bir mağaza arka ucu örneği olarak ayrıca bir kumbara adresini izleyebilir ve yalnızca gönderen imzasını zincirin hibrit olarak doğruladığı bahşişleri kabul edebilir.

## Ne gösterir {#what-it-shows}

- **Java'dan hibrit ML-DSA-87 + secp256k1 imzalama**, SDK'da tek bir çağrı yoluyla.
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem**: zincir, imzalayan için `status=verified` değerli bir `pqc_hybrid_verify` olayı yayar ve işlem 4627 baytlık bir ML-DSA-87 imzası taşır.
- **Kuantum güvenli bahşişleri klasik olanlardan ayıran bir arka uç**: `watch` gelen her transferi `QUANTUM-SAFE` ya da `classical only` olarak etiketler.

Neden önemli: tek başına klasik bir imzanın gelecekteki bir kuantum bilgisayar tarafından kırılabilmesi beklenir. Zincirin kendi doğrulama kaydını kontrol eden bir servis, her ödemeye ne kadar güveneceğine karar verebilir. Bkz. [Kuantum Güvenli İşlemler](/sdk/guides/quantum-safe).

## Adım adım {#run}

Aşağıdaki her şey kendi terminalinizde çalışır (macOS, Linux ya da WSL ile Windows). Yalnızca tek kullanımlık bir testnet hesabı kullanırsınız. Testnet QOR'unun değeri yoktur ve burada asla gerçek bir cüzdan kullanmazsınız.

### 1. Araçları kurun {#install}

Git'e, JDK 21 veya daha yenisine ve Maven'e ihtiyacınız var. Elinizdekileri kontrol edin:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

`java` ya da `mvn` eksikse ya da çok eskiyse önce kurun; örneğin [Temurin JDK 21](https://adoptium.net) ve [Apache Maven](https://maven.apache.org/install.html) ile ya da paket yöneticinizle (macOS'ta `brew install openjdk@21 maven`, Debian veya Ubuntu'da `sudo apt install openjdk-21-jdk maven`). Yeni bir terminal açın ve üç kontrolü yeniden çalıştırın.

### 2. Kodu alın {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Uygulamayı derleyin {#build}

```bash
mvn -q package
```

Maven, SDK'yı Maven Central'dan indirir ve çalıştırılabilir tek bir dosya olan `target/tipjar.jar` dosyasını derler. İlk derleme bir dakikadan kısa sürer. Ardından başlatıcıyı çalıştırılabilir yapın ve çalıştığını kontrol edin:

```bash
chmod +x tipjar
./tipjar
```

Komutların listesini görmelisiniz (`new`, `status`, `register`, `tip`, `watch`).

### 4. Tek kullanımlık testnet hesabınızı oluşturun {#key}

```bash
./tipjar new
```

Bu komut yeni bir kurtarma ifadesi üretir, onu yalnızca sizin okuyabileceğiniz (0600 kipi) `~/.config/qday/java.env` anahtar dosyasına yazar ve yalnızca `qor1...` ile başlayan hesap adresini yazdırır. İfade asla yazdırılmaz. Bu dosyayı paylaşmayın, commit etmeyin ve mainnet'te yeniden kullanmayın. Anahtarı başka bir yerde tutmak için her komuttan önce `TIPJAR_KEY=/path/to/file` ayarlayın.

Çıktıdaki `qor1...` adresini kopyalayın. Kaybederseniz `./tipjar status` onu yeniden yazdırır.

### 5. Faucet'ten testnet QOR'u alın {#faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. `qor1...` adresinizi yapıştırın ve token isteyin. Faucet 24 saatte 100 QOR verir.
3. Ulaştığını kontrol edin:

```bash
./tipjar status
```

Bakiye testnet QOR'unuzu göstermeli, kuantum sonrası anahtar ise henüz kayıtlı değil olarak görünmelidir.

### 6. Kuantum sonrası anahtarınızı kaydedin {#register}

```bash
./tipjar register
```

Bu komut ML-DSA-87 anahtarınızı zincire bir kez kaydeder. Yeniden çalıştırmak güvenlidir. Kayıt mesajının kendisi tasarım gereği klasik olarak imzalanır; çünkü henüz imzalanacak bir kuantum sonrası anahtar yoktur; mesaj yeni anahtara sahip olduğunuza dair bir kanıt taşır. Sonraki her işlem hibrit imzalanır.

### 7. Bahşiş almak için ikinci bir adres oluşturun {#jar}

Bir bahşişin alıcıya ihtiyacı vardır. Kumbara için kendi anahtar dosyası olan ikinci bir tek kullanımlık hesap oluşturun:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Onun `qor1...` adresini kopyalayın. Bu sizin kumbara adresinizdir.

### 8. Hibrit imzalı bir bahşiş gönderin {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

`qor1...JAR_ADDRESS` yerine 7. adımdaki kumbara adresini yazın. `1`, QOR cinsinden miktardır. Memo isteğe bağlıdır. Uygulama gazı belirlemek için işlemi simüle eder, her iki anahtarla imzalar, yayınlar, blokta yer almasını bekler ve zincirin doğrulama kaydını kontrol eder.

### 9. Kumbarayı bir mağaza arka ucu gibi izleyin {#watch}

Aynı klasörde ikinci bir terminal açın. İzleyiciyi kumbara adresinde başlatın, sonra ilk terminalden bir bahşiş daha gönderin:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

İzleyici her 3 saniyede bir kontrol eder ve gelen her bahşişi etiketler. Ctrl+C ile durdurun. Renkleri kapatmak için `NO_COLOR=1` ayarlayın. Herkese açık testnet uç noktalarında IP başına bir hız sınırı vardır; bu yüzden bir çağrı başarısız olursa bir dakika bekleyip yeniden deneyin.

## Görmeniz gerekenler {#output}

- `tip` sonrasında terminal işlem hash'ini ve blok yüksekliğini, ardından doğrulama sonucunu yazdırır: zincir hibrit imzayı doğruladıysa `QUANTUM-SAFE`, aksi halde `CHECK FAILED`.
- `watch` içinde her bahşiş, zincir hibrit bir imzayı doğruladıysa `QUANTUM-SAFE` etiketiyle, doğrulamadıysa `classical only` etiketiyle listelenir.
- Explorer'da: `https://explore.qore.network/tx/<HASH>` adresini açın (terminaldeki hash'i kullanın) ve explorer'ı **Testnet**'e geçirin. İşlem başarılı olarak görünür.

## Kanıt nasıl çalışır {#proof}

Uygulama işlemi testnet REST uç noktasından okur (`GET /cosmos/tx/v1beta1/txs/{hash}`) ve şunlara bakar:

- `address=<signer>` ve `status=verified` ile bir `pqc_hybrid_verify` olayı;
- 4627 baytlık bir `pqc_signature` içeren `/qorechain.pqc.v1.PQCHybridSignature` uzantısı.

İzleyici, gelen her transfer için tam olarak bunu okur.

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

Gaz asla sabit değildir: her işlem önce simüle edilir ve simüle edilen gazın 1,3 katı kadar gaz alır; gaz başına 0,15 uqor ile fiyatlandırılır.

Hesap klasik bir coin-118 QoreChain hesabıdır (`m/44'/118'/0'/0/0`). ML-DSA-87 anahtarı aynı kurtarma ifadesinden türetilir ve `Authenticator.derivePqcCanonical` ile adrese bağlanır. Kendi uygulamanızı bunun yerine seed tabanlı yardımcılar üzerine kurarsanız SDK 0.13.0 bir kurtarma koduna ya da bağımsız 32 baytlık bir PQC sırrına ihtiyaç duyar; bkz. [SDK kurulumu](/sdk/install#whats-new-0130). Bir kurtarma kodunu asla yazdırmayın.

## Kullanılan paketler {#packages}

| Öğe | Sürüm |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Uygulama `demo:tipjar` | 1.0.0 |

Tüm dillerin sürüm tablosu için bkz. [SDK kurulumu](/sdk/install).

## Nelere nereden bakılır {#access}

| Ne | Nerede |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Kod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
