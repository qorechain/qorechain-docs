---
slug: /qorel/quickstart
title: QORel Hızlı Başlangıç
sidebar_label: Hızlı Başlangıç
sidebar_position: 4
---

# Hızlı Başlangıç

Bu kılavuz, QoreChain testnet'i `qorechain-diana` ile Cosmos Hub genel testnet'i (zincir kimliği `provider`) arasında röle yapmayı adım adım anlatır: kurulum, yapılandırma, anahtarları ekleme ve kaydetme, hazır olma durumunu kontrol etme, relayer'ı başlatma ve ilk transferi gönderme. Daha önce hiç relayer çalıştırmamış biri içindir. Buradaki her şey testnet'tir; token'ların değeri yoktur.

## Yenilikler {#innovations}

- **Hazır olma durumu tek bir alandır.** `qorel keys pqc-status` çıktısı `ready_to_relay` ile biter. `true` ise, kuantum sonrası anahtar zincirde kayıtlıdır ve yerel anahtarla eşleşir; relayer kendi işlemlerini bu nedenle reddetmez.
- **Bir şey yanlışsa hiçbir şey gönderilmez.** Gönderim öncesi kontrol, hatalı bir işlemi zincire ulaşmadan durdurur; böylece atlanan bir adım ücrete mal olmaz.
- **Her zincir için aynı akış.** Cosmos Hub tarafındaki adımlar Hermes'in kendisidir; yalnızca QoreChain zincir girişi ve kayıt adımı yenidir.

## Nasıl kullanılır {#how-to-use}

### 1. Kurulum {#step-install}

[Kurulum](/qorel/install) sayfasındaki yöntemlerden biriyle `qorel`'i kurun ve kontrol edin:

```bash
qorel --version
```

### 2. Yapılandırmayı alın {#step-config}

Örnek yapılandırmayı depodan kopyalayın (`packaging/config.example.toml`; `.deb` ve `.rpm` bunu `/etc/qorel/config.example.toml` konumuna koyar):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

`~/.hermes/config.toml` dosyasını açın ve QoreChain düğümünün yer tutucularını (`YOUR-QORECHAIN-NODE`) çalıştırdığınız bir testnet düğümünün RPC, gRPC ve WebSocket adresleriyle değiştirin. QoreChain'in genel gRPC uç noktası yoktur, bu yüzden kendi düğümünüze ihtiyacınız var; bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node) ve [Test Ağına Bağlanma](/getting-started/connecting-to-testnet). Her ayar [Yapılandırma](/qorel/configuration) sayfasında açıklanır.

Örnek yapılandırmada iki zincir vardır: `signing = 'qorechain-hybrid'` olan `qorechain-diana` ve varsayılan standart imzalamalı `provider`. Röleyi QoreChain'de `transfer/channel-0` ve Hub testnet'inde `transfer/channel-600` ile sınırlar.

### 3. Relayer hesaplarını oluşturun ve fonlayın {#step-accounts}

Her zincirde relayer için yeni bir hesap oluşturun. Özel bir hesap kullanın, asla bir doğrulayıcı operatör anahtarı değil. Her hesabın mnemonic'ini yalnızca sizin okuyabileceğiniz bir dosyaya kaydedin:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

Aynı mnemonic her iki zincire de hizmet edebilir ya da her biri için ayrı bir tane kullanabilirsiniz. QORel varsayılan olarak coin type 118 (`m/44'/118'/0'/0/0`) ile türetir; hesabınız başka bir yol kullanıyorsa `keys add` komutuna `--hd-path` verin.

Anahtarları ekleyin:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

`qorechain-diana` üzerinde `keys add` ayrıca ML-DSA-87 anahtarını aynı mnemonic'ten türetir ve seed'ini anahtarın yanında `relayer.pqc` olarak saklar. İşiniz bittiğinde mnemonic dosyalarını silin.

Sonra hesapları fonlayın. Adresleri `qorel keys list --chain <id>` ile gösterin. Testnet QOR'u [Dashboard Musluğu](/dashboard/faucet)'ndan gelir; Hub testnet'i için test token'ları o ağın genel musluğundan gelir. Ücretler için birkaç token yeterlidir: QoreChain'in tabanı gas başına 0,1 uqor'dur, yani varsayılan 400.000 gas sınırlı bir işlem taban fiyattan yaklaşık 40.000 uqor tutar. Şununla kontrol edin:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Kuantum sonrası anahtarı kaydedin {#step-register}

QoreChain, hibrit imzalı bir işlemi yalnızca ML-DSA-87 açık anahtarını kaydetmiş bir hesaptan kabul eder. Kayıt bir kez yapılır:

```bash
qorel keys register-pqc --chain qorechain-diana
```

Yalnızca klasik anahtarla imzalanmış (QoreChain'in bu biçimde kabul ettiği tek işlem türü) ve bir sahiplik kanıtı taşıyan tek bir işlem gönderir. Yeniden çalıştırmak güvenlidir: aynı anahtar zaten kayıtlıysa hiçbir şey göndermez. Hesabın zaten kayıtlı farklı bir kuantum sonrası anahtarı varsa reddeder ve hiçbir şey göndermez.

Hazır olma durumunu kontrol edin:

```bash
qorel keys pqc-status --chain qorechain-diana
```

Sonuç, `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` ve `ready_to_relay` alanlarını içeren bir JSON nesnesidir. Yalnızca `ready_to_relay` `true` olduğunda devam edin. Değilse [Sorun Giderme](/qorel/troubleshooting) sayfasına bakın.

### 5. Sağlık kontrolü {#step-health}

```bash
qorel health-check
```

Yapılandırmayı ve her zincire bağlantıyı kontrol eder ve bir QoreChain girişinde 1,1'in altındaki gas çarpanını olası bir yanlış yapılandırma olarak bildirir (bir uyarı; röle çalışmaya devam eder).

### 6. Kanalı seçin {#step-channel}

Testnet'te zaten bir transfer kanalı vardır: `qorechain-diana` üzerindeki `channel-0`; karşı tarafı `provider` üzerindeki `channel-600`'dür ([Test kanalı](/user-guide/bridging-assets#ibc-test-channel)). Onu röleleyecekseniz doğrudan 7. adıma geçin.

Bunun yerine iki zincir arasında kendi yeni kanalınızı oluşturmak için:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` ayrıca iki hafif istemciyi ve bağlantıyı oluşturur. Bu, her zincirde birkaç işlem gönderir. Komut yeni kanal kimliklerini yazdırır; bunları her iki zincir girişinin `packet_filter` ayarına koyun.

### 7. Relayer'ı başlatın {#step-start}

```bash
qorel start
```

Çalışır bırakın (uzun ömürlü bir relayer için systemd servisini veya bir container'ı kullanın; bkz. [Bir doğrulayıcının yanında çalıştırma](/qorel/running-next-to-a-validator)). QORel paketleri röleler, hafif istemcileri yeniler ve kötü davranışı izler.

### 8. İlk transferi gönderin {#step-transfer}

İkinci bir terminalde QoreChain'den Hub testnet'ine 1000 uqor gönderin. QORel bu işlemi aynı hibrit imzayla kendisi imzalar ve gönderir:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

`--receiver` olmadan token'lar, hedef zincirdeki relayer'ın kendi adresine gider. Sonra paketi izleyin:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

Paket, çalışan relayer onu teslim edene ve onay geri gelene kadar listelenir. QoreChain'de kanalı ve token izlerini REST üzerinden de okuyabilirsiniz:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Zaman aşımından önce teslim edilmeyen bir transfer, relayer tarafından kaynak zincirde göndericiye iade edilir. Yukarıdaki `--timeout-seconds` değeri ona on dakika verir.

## Nasıl erişilir {#how-to-access}

- **Ağ.** Yalnızca testnet `qorechain-diana` ve Cosmos Hub genel testnet'i.
- **Gerekenler.** QORel, çalıştırdığınız bir QoreChain testnet düğümü (RPC, gRPC ve WebSocket), Hub testnet'i için erişilebilir uç noktalar, her zincirde fonlanmış bir relayer hesabı ve her birinin mnemonic'i bir dosyada.
- **Maliyetler.** Yalnızca test token'larıyla ücretler: QoreChain'de gas çarpı fiyat; taban gas başına 0,1 uqor'dur ve kullanılmayan gas iade edilmez.
- **Container kullanıcıları.** Yukarıdaki her komutu `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>` olarak çalıştırın; mnemonic dosyaları bağlanan dizinin içinde olsun ve `start` uzun süre çalışan container olsun ([Kurulum](/qorel/install#container)).

## Nerede yayımlanır {#where-published}

İkili dosya ve örnek yapılandırma [QORel deposundan](https://github.com/qorechain/QORel) gelir (`packaging/config.example.toml`); her kanal için [Kurulum](/qorel/install), sürümler için [QORel genel bakış](/qorel/overview#where-published) sayfasına bakın.

## Sınırlar ve bilinen sorunlar {#limits}

- **Yalnızca testnet.** Mainnet IBC açık değildir; bu akışı mainnet'e yöneltmeyin.
- **Kendi QoreChain düğümünüze ihtiyacınız var.** Genel gRPC uç noktası yoktur.
- **Yeni bir kanal her iki zincirde ücrete mal olur** ve bir istemci ile bir bağlantı ekler. Kendi kanalınıza ihtiyacınız yoksa `channel-0` rölelemeyi tercih edin.
- **Hub tarafı genel uç noktalar hız sınırı uygulayabilir.** QORel yeniden denemeye devam eder, ancak sürekli röle için kendi düğümlerinizi kullanın.
- **Röleleninceye kadar beklemede.** Kanal için çalışan bir relayer yoksa, bir tane başlatılana veya paket zaman aşımına uğrayana kadar transfer beklemede kalır.

Sonraki: [Yapılandırma](/qorel/configuration), [İzleme](/qorel/monitoring), [Sorun Giderme](/qorel/troubleshooting).
