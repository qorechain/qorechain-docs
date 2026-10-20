---
slug: /developer-guide/building-from-source
title: Kaynaktan Derleme
sidebar_label: Kaynaktan Derleme
sidebar_position: 1
---

# Kaynaktan Derleme

Bu kılavuz, herkese açık kaynaktan topluluk `qorechaind` ikili dosyasını derleme sürecinde size yol gösterir ve bu ikili dosyanın ne için olduğunu, ne için olmadığını açıklar.

:::caution Kaynaktan yapılan bir derleme ana ağa veya test ağına katılamaz
Herkese açık depo, modül arabirimlerini **stub keeper'larla** birlikte içerir; konsensüs açısından kritik keeper uygulamaları ve kuantum sonrası imzalayıcı herkese açık kaynak ağacında yer almaz. Bu kaynaktan derlenen bir ikili dosya, ağların konsensüs durumunu yeniden üretemez ve her Cosmos hattı işleminin gerektirdiği hibrit kuantum sonrası imzayı oluşturamaz. v3.2.3'ten itibaren ayrıca `qorechain-vladi` veya `qorechain-diana` üzerinde **başlamayı reddeder** (bu ağları zincir kimliği ve genesis zamanından tanır; herkese açık bir zincir kimliğini kendi genesis'iyle yeniden kullanan yerel bir devnet bundan etkilenmez). `qorechaind start --community-unenforced-pqc` bu reddi deneyler için aşar; bu durumda düğüm hiçbir kuantum sonrası imzayı doğrulamaz ve ağdan uyarı vermeden ayrışabilir, bu yüzden güvendiğiniz bir düğüm için asla kullanmayın. Ana ağda veya test ağında bir düğüm ya da doğrulayıcı çalıştırmak için, canlı manifestte (`https://download.qore.host/mainnet/latest.json` veya `.../testnet/latest.json`) belirtilen **sürüm ikili dosyasını** kurun; bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node) ve [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator).
:::

## Önkoşullar

| Bağımlılık            | Minimum Sürüm              | Notlar                                                |
| --------------------- | --------------------------- | ------------------------------------------------------ |
| **Go**                 | 1.26+                       | Tüm derlemeler için gereklidir                          |
| **CGO**                | Etkin (`CGO_ENABLED=1`)     | PQC ve SVM FFI köprüleri için gereklidir                |
| **Make**               | 3.81+                       | Derleme otomasyonu                                      |
| **Git**                | 2.x                          | Kaynak çekme                                            |

Ortamınızı doğrulayın:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Her `go build`, `go test` ve `go run` çağrısında `CGO_ENABLED=1` ayarlı **olmalıdır**. Düğüm, yerel kütüphaneleri (QoreChain Native çalışma zamanı ve sürüm derlemesinde PQC ile SVM kütüphaneleri) cgo aracılığıyla bağlar.
:::

## Yerel Kütüphaneler

### libqorepqc ve libqoresvm

Kuantum sonrası (`libqorepqc`) ve SVM (`libqoresvm`) kütüphaneleri, **herkese açık depoda yer almayan** Rust kaynaklarından derlenir (`qorechain-core` içinde `rust/` dizini yoktur). Topluluk derlemesi bunlara ihtiyaç duymaz. Ağlar için sürüm arşivleri, derlenmiş kütüphaneleri (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) `qorechaind` yanındaki bir `lib/` dizininde paketler; bunları `lib/{os}_{arch}/` içine yerleştirin veya yükleyiciyi aşağıda gösterildiği gibi onlara yönlendirin.

### Kütüphane Yolunu Ayarlama

Sürüm ikili dosyasını kullandığınızda, paylaşımlı kütüphaneleri çalışma zamanında keşfedilebilir olmalıdır. Platformunuz için uygun ortam değişkenini ayarlayın:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
İpucu: Oturumlar arasında kalıcı olması için dışa aktarma komutunu kabuk profilinize (`~/.bashrc`, `~/.zshrc`) ekleyin.
:::

## Açık Çekirdek Mimarisi

QoreChain bir **açık çekirdek** modelini izler:

* **Topluluk derlemesi** — Her QoreChain modülü için (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm vb.) tüm modül arabirimlerini, CLI komutlarını, protobuf tanımlarını ve mesaj türlerini içerir. Tescilli modüllerin keeper'ları, güvenli varsayılan değerler veya no-op yanıtlar döndüren **stub uygulamaları** kullanır. Bu sayede üçüncü taraf araçlar, cüzdanlar ve indeksleyiciler, tescilli koda ihtiyaç duymadan tüm QoreChain API'leriyle entegre olabilir.
* **Tam derleme** — Eksiksiz keeper uygulamalarını (konsensüs açısından kritik gerçek modül mantığı ve kuantum sonrası imzalayıcı) içerir. [download.qore.host](https://download.qore.host) adresinde yayımlanan sürüm ikili dosyaları olarak dağıtılır; herkese açık kaynak ağacından derlenmez.

Her iki derleme de aynı `qorechaind` ikili dosya adını üretir ve aynı CLI komutlarını sunar. Fark, bu arabirimlerin arkasındaki keeper mantığının çalışma zamanı davranışındadır.

## Topluluk Derlemesi

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Bu komut, tescilli özellikler için stub keeper'larla birlikte tüm genel modül arabirimlerini derler. Ortaya çıkan ikili dosya şunlar için tasarlanmıştır:

* Yerel geliştirme ve test (örneğin tek düğümlü bir devnet)
* Bir ağı sorgulama (`query ...` komutları herhangi bir düğüme karşı çalışır)
* Modül arabirimlerine karşı üçüncü taraf entegrasyonları ve araçları oluşturma

Bu, doğrulayıcı olarak ana ağa veya test ağına katılmanın ya da orada işlem yapmanın bir yolu değildir: kuantum sonrası imzalayıcısı yoktur (`tx pqc gen-key` ve `tx pqc cosign` hata döndürür) ve stub keeper'ları ağların konsensüs kurallarını yeniden üretmez.

## Tam Derleme (sürüm ikili dosyası)

Tam keeper uygulamaları ile `tx pqc gen-key` ve `tx pqc cosign` komutlarının arkasındaki imzalayıcı herkese açık kaynak ağacında yer almaz; bu nedenle ondan derlenemez. [download.qore.host](https://download.qore.host) adresinde yayımlanan ikili dosyalar tam derlemedir; ana ağ ve test ağı için bunları kullanın.

## Testleri Çalıştırma

```bash
CGO_ENABLED=1 go test ./... -count=1
```

`-count=1` bayrağı test önbelleklemesini devre dışı bırakarak her seferinde temiz bir çalışma sağlar. Tek tek paket testleri şu şekilde çalıştırılabilir:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Yerel kütüphaneleri veya tescilli keeper'ları kullanan testler yalnızca tam derlemeye dahil edilir ve herkese açık test paketinin parçası değildir.

## Derleme Doğrulaması

Başarılı bir derlemenin ardından ikili dosyayı doğrulayın:

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

`init` komutu, `~/.qorechaind/` içinde hatasız bir genesis dosyası ve düğüm yapılandırması oluşturmalıdır. Yukarıdaki örnek, **`qorechain-diana`** test ağına karşı başlatma yapar — ana ağ için canlı ağ olan `--chain-id qorechain-vladi` değerini kullanın (düğüm sürümü **v3.2.3**).

## Docker Derlemesi

Depo kök dizininde bir Dockerfile sağlanmıştır:

```bash
docker build -t qorechaind:community .
```

Bu, **topluluk** ikili dosyasını derler (kendi yorumunda "Public build — no PQC library" yazar); dolayısıyla imaj yerel geliştirme ve araçlar içindir, ana ağı veya test ağını takip etmek için değildir. Docker'da bir ağ düğümü çalıştırmak için bunun yerine sürüm ikili dosyasını sarmalayın; bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node#docker-compose).

## Sorun Giderme

<details>

<summary>cgo: C compiler not found</summary>

Xcode CLI araçlarını (macOS) veya `build-essential` paketini (Linux) yükleyin

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Yerel kütüphaneleri bekleyen bir derlemeyi bağlıyorsunuz. Topluluk derlemesini (bunlara ihtiyaç duymaz) veya bunları paketleyen sürüm arşivini kullanın ve `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` değişkenini onun `lib/` dizinine ayarlayın

</details>

<details>

<summary>undefined: sonic.*</summary>

`go.sum` dosyasının güncel olduğundan emin olun: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Kullanılabilir belleği artırın (düşük bellek limitli Docker ortamlarında sık görülür)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

ML-DSA-87 boyutları şöyledir: açık anahtar 2.592 bayt, gizli anahtar 4.896 bayt ve imza 4.627 bayt. Başka herhangi bir boyut, farklı bir algoritma veya kesilmiş bir değer anlamına gelir.

</details>
