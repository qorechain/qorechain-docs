---
slug: /qorel/troubleshooting
title: QORel Sorun Giderme ve SSS
sidebar_label: Sorun Giderme
sidebar_position: 9
---

# Sorun Giderme ve SSS

QORel'i çalıştırırken insanların genellikle karşılaştığı sırayla sorular ve çözümler. Başlamayan, göndermeyi reddeden veya paketleri beklemede bırakan bir relayer'ı olan operatörler içindir. QORel bugün yalnızca testnet içindir, bu yüzden her yanıt `qorechain-diana` varsayımıyla verilmiştir.

## Yenilikler {#innovations}

Hibrit bir zincirdeki sorunların çoğu ücret harcanmadan önce yakalanır:

- **Gönderim öncesi kontrol sorunu adlandırır.** Kuantum sonrası anahtar yüklü değilse, kayıtlı değilse veya yerel anahtar değilse ya da sign-bytes sürümü bilinmiyorsa, QORel hiçbir şey göndermez ve hangisi olduğunu söyler.
- **`keys pqc-status` çalıştırılacak ilk komuttur.** Kaydı, anahtar eşleşmesini, sahiplik kanıtını, zincirin doğruladığı sign-bytes sürümünü ve `ready_to_relay` değerini gösterir.
- **`health-check` yanlış yapılandırmaları açıklar**; bir QoreChain girişinde 1,1'in altındaki gas çarpanı dahil.

## Nasıl kullanılır {#how-to-use}

Önce şunları çalıştırın ve karşılaştırın:

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Anahtarlar ve kayıt {#keys}

**`ready_to_relay` `false`. Şimdi ne olacak?**
`keys pqc-status` çıktısının diğer alanlarını okuyun:
- `registered: false`: hesabın kayıtlı bir kuantum sonrası anahtarı yok. Hesabı fonlayın, sonra `qorel keys register-pqc --chain qorechain-diana` komutunu çalıştırın.
- `registered: true` ama `matches_local_key: false`: hesapta, QORel'in tuttuğundan farklı bir anahtar kayıtlı. Hesabın kendi mnemonic'ini ve doğru `--key-name` değerini kullandığınızı kontrol edin. Anahtarı yeniden eklediyseniz, `keys add --overwrite` yerel anahtarı ve `<key name>.pqc` seed'ini mnemonic'ten yeniden oluşturur.
- Komut anahtarı yükleyemiyor: anahtarın yanındaki `<key name>.pqc` dosyası eksik veya okunamıyor. O zincir için `keys add` komutunu yeniden çalıştırın.

**`keys register-pqc` hesabın zaten farklı bir anahtarı olduğunu söylüyor.**
Bilerek hiçbir şey göndermedi. Zincirdeki anahtar başka bir mnemonic'ten veya başka bir araçla kaydedilmiş. Özgün mnemonic'i kullanın veya anahtarı zincirde eskisinden döndürün ([Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#key-rotation)); hesabın daha önce kullandığı bir anahtar yeniden kaydedilemez.

**`keys register-pqc` bir ücret veya bakiye hatasıyla başarısız oluyor.**
Hesabın ilk işlemini gönderebilmesi için testnet'te QOR'a ihtiyacı var. [Dashboard Musluğu](/dashboard/faucet)'nu kullanın. Kayıt birkaç yüz bin gas gerektirir; 0,1 uqor tabanında bu birkaç on bin uqor eder.

**`--no-proof` gerekli mi?**
Yalnızca v3.2.3'ten eski bir ağ için. Her iki QoreChain ağı da sahiplik kanıtını kabul eder ve QORel varsayılan olarak bir tane ekler.

**Kuantum sonrası anahtarım nerede saklanıyor?**
secp256k1 anahtarının yanında, `<key name>.pqc` olarak (32 baytlık bir seed), yalnızca sahibin okuyabileceği şekilde. Mnemonic'ten yeniden türetilebilir. Dosyaları değil, mnemonic'i yedekleyin.

**Anahtar dosyalarım başkaları tarafından okunabiliyor.**
QORel yeni anahtar dosyalarını 0600 olarak yazar. Eski bir Hermes ile eklenen anahtarlar eski kiplerini korur; bunlara `chmod 600` çalıştırın.

### Yapılandırma {#config}

**Yapılandırma `extension_options` ile ilgili bir iletiyle reddediliyor.**
Statik `extension_options`, `signing = 'qorechain-hybrid'` ile birleştirilemez: kuantum sonrası imza tek kritik uzantı seçeneği olmalıdır. Bunları o zincirin girişinden kaldırın.

**Zincirin `signing = "qorechain-hybrid"` kullanmadığını söylüyor.**
Kuantum sonrası anahtar komutları yalnızca bu ayara sahip zincirlerde çalışır. QoreChain girişine ekleyin.

**Sign-bytes sürümünü ayarlamam gerekir mi?**
Hayır. `pqc.sign_bytes = 'auto'` onu zincirden okur, her dakika ve her reddin ardından yeniden okur. Zincirle eşleşmeyen sabit bir `v1` veya `v2`, her işlemi reddetmesine yol açar.

**`pqc-status` `sign_bytes` değerini bilinmiyor olarak gösteriyor.**
QORel zincirin yükseltme kayıtlarını okuyamadı. QoreChain girişinin `rpc_addr` adresinin yanıt verdiğini ve doğru ağı gösterdiğini kontrol edin (testnet'te `qorechain-diana`). QORel bilinen bir sürüm olmadan imzalamaz.

**Hangi gas çarpanını kullanmalıyım?**
`1.1` örnek varsayılandır ve `health-check`'i sessiz tutar. Zincir v3.2.5 ve sonrasında (artık her iki ağda; testnet'te v3.2.6 üzerinde ölçüldü) `1.05` gibi daha düşük bir değer çalışır. Önceki derlemeler simüle edilen gas'ı eksik bildirir, bu yüzden birini çalıştıran bir düğümde `1.15` kullanın. Bkz. [Gas](/qorel/configuration#gas).

**`health-check` gas çarpanı hakkında uyarıyor.**
Bir QoreChain girişinde 1,1'in altında. Yalnızca bir uyarıdır; röle çalışır. Gas yetersizliği hataları görürseniz yükseltin.

### Gönderme ve röleleme {#relaying}

**Zincir bir işlemi `pqc` codespace'i, code 21 ile reddediyor.**
Hibrit imza doğrulanmadı. QORel bir sonraki işlemden önce sign-bytes sürümünü ve kaydı yeniden okur ve yeniden dener. Tekrarlanırsa: zincir girişindeki `id` değerinin tam olarak zincir kimliği (`qorechain-diana`) olduğunu, anahtarın kayıtlı olan olduğunu (`keys pqc-status`) ve kullandığınız düğümün beklediğiniz sürümü çalıştırdığını doğrulayın. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#code-21) nedenleri listeler.

**Hiçbir şey gönderilmiyor ve ücret harcanmıyor, ama relayer bir hata günlüğe yazıyor.**
Bu, gönderim öncesi kontrolün işini yapmasıdır. Günlük satırı eksik parçayı adlandırır: anahtar yüklü değil, anahtar kayıtlı değil, anahtar uyuşmazlığı veya sign-bytes sürümü bilinmiyor. Yukarıdaki gibi düzeltin.

**`account sequence mismatch` hataları.**
İki süreç aynı relayer anahtarıyla imzalıyor. Anahtar başına bir relayer çalıştırın; buna bir systemd servisi artı bir container ve ikinci bir Kubernetes pod'u dahildir.

**Günlüklerde `429 Too Many Requests` görüyorum.**
Uç nokta hız sınırı uyguluyor, genellikle bir yeniden başlatmanın ardından genel bir uç nokta. QORel bunu yeniden denenebilir sayar ve paket çalışanlarını çalışır tutarak her temizleme aralığında yeniden dener. Sürekli röle için kendi düğümlerinizi veya ücretli bir uç nokta kullanın. QoreChain testnet'inin genel gRPC uç noktası yoktur, bu yüzden QoreChain tarafı zaten kendi düğümünüzü gerektirir.

**QoreChain'de ücret veya gas yetersizliği hataları.**
Ücret gas sınırı çarpı fiyattır, iade yoktur ve taban gas başına 0,1 uqor'dur. `gas_price`, `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` ayarlı olup olmadığını ve hesap bakiyesini (`qorel keys balance --chain qorechain-diana`) kontrol edin.

### Paketler ve kanallar {#packets}

**Transferim beklemede ve hiçbir şey ulaşmıyor.**
Sırayla kontrol edin: kanal için bir relayer çalışıyor (süreç ayakta; telemetri yanıt veriyor); kanal her iki zincirde `packet_filter` ayarınızda; relayer'ın hedef zincirde bakiyesi var; kuantum sonrası anahtar hazır; uç noktalara erişilebiliyor. Sonra kanal için `qorel query packet pending` çalıştırın. Hiçbir relayer çalışmıyorsa, paket bir tane başlayana veya transfer zaman aşımına uğrayana kadar bekler.

**Bir transferin süresi dolarsa ne olur?**
Relayer çalışırken zaman aşımını röleler ve token'lar kaynak zincirde göndericiye iade edilir. Bu, testnet kanalında test edildi.

**Mevcut test kanalını kullanabilir miyim, yoksa kendimin mi olması gerekir?**
Testnet'in `channel-0` kanalı Hub testnet'inin `channel-600` kanalına açıktır ([Test kanalı](/user-guide/bridging-assets#ibc-test-channel)); onu röleleyecekseniz QORel'i o `packet_filter` ile çalıştırın. Kendi kanalınızı yalnızca gerekirse `qorel create channel ... --new-client-connection` ile oluşturun.

**`create channel` yarıda başarısız oluyor.**
El sıkışma her iki zincirde birkaç işlemdir. `qorel health-check` çalıştırın, nedeni giderin, sonra komutu `--a-connection` zaten oluşturduğu bağlantıya ayarlanmış olarak yeniden çalıştırın veya `--new-client-connection` ile baştan başlayın.

**Standart Hermes QoreChain ile çalışır mı?**
Hayır. QoreChain, ML-DSA-87 imzası olmayan bir işlemi reddeder ve standart Hermes onu eklemez. QORel, Hermes artı o imzadır.

### Genel {#general}

**QORel QoreChain dışındaki zincirleri röleleyebilir mi?**
Evet. `signing` ayarı olmayan bir zincir, bayt bayt standart Hermes işlem biçimini kullanır.

**Mainnet'i destekliyor mu?**
Henüz değil. Açık bir mainnet IBC kanalı yok. Mainnet IBC açıldığında bu kılavuz bunu söyleyecek.

**IBC v2'yi destekliyor mu?**
Henüz değil. IBC v2 röleleme QORel'de uygulanmadı; bir sonraki aşamadır. Ethereum (Eureka) röleleme başlatılmadı.

**Windows?**
Hayır. WSL2 altında container kullanın.

**Bir sorunu nereye bildiririm?**
[github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues) üzerinde bir sorun açın. QORel sürümünü, gizlenmiş zincir girişini ve `qorel keys pqc-status` çıktısını ekleyin; asla bir mnemonic, bir anahtar dosyası veya bir `.pqc` seed'i paylaşmayın.

## Nasıl erişilir {#how-to-access}

- Yukarıdaki her komut relayer ana makinesinde, relayer ile aynı yapılandırmayla çalıştırılır.
- Karşılaştırılacak genel durum: `https://api-testnet.qore.host` adresindeki QoreChain testnet REST ([Test Ağına Bağlanma](/getting-started/connecting-to-testnet)) ve [blok gezgini](https://explore.qore.network) (Testnet'e geçirin).

## Nerede yayımlanır {#where-published}

QORel, [qorechain/QORel](https://github.com/qorechain/QORel) deposundadır; sorunlar oraya gider. Üst akım Hermes kılavuzu, [hermes.informal.systems](https://hermes.informal.systems), QORel'in onunla paylaştığı ayarları ve komutları kapsar.

## Sınırlar ve bilinen sorunlar {#limits}

- **Yalnızca testnet** ve bir 0.x sürümü.
- **Henüz IBC v2 röleleme yok** (bir sonraki aşama) ve Ethereum (Eureka) röleleme yok.
- **Üçüncü taraf uç noktalar hız sınırı uygular.** Örnek yapılandırmadaki Hub tarafı uç noktaları geneldir ve QoreChain tarafından işletilmez.
- **Bu sayfa her Hermes hatasını kapsayamaz.** Kuantum sonrası anahtardan, sign bytes'tan veya QoreChain'den söz etmeyen hatalar için Hermes kılavuzu ve sorun izleyicisi geçerlidir.

Ayrıca bkz.: [Yapılandırma](/qorel/configuration), [İzleme](/qorel/monitoring), [Her dilden imzalama](/qorel/signing-from-any-language).
