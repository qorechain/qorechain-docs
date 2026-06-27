---
slug: /developer-guide/building-from-source
title: Kaynaktan Derleme
sidebar_label: Kaynaktan Derleme
sidebar_position: 1
---

# Kaynaktan Derleme

Bu kılavuz, hem topluluk (açık çekirdek) derlemesini hem de tam tescilli derlemeyi kapsayarak `qorechaind` ikili dosyasını kaynaktan derleme sürecinde size yol gösterir.

## Önkoşullar

| Bağımlılık         | Minimum Sürüm             | Notlar                                            |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Tüm derlemeler için gereklidir                    |
| **CGO**            | Etkin (`CGO_ENABLED=1`)   | PQC ve SVM FFI köprüleri için gereklidir          |
| **Rust araç zinciri** | En son kararlı sürüm   | `libqorepqc` ve `libqoresvm` derlemek için gereklidir |
| **Make**           | 3.81+                     | Derleme otomasyonu                                |
| **Git**            | 2.x                       | Kaynak çekme                                      |

Ortamınızı doğrulayın:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
Her `go build`, `go test` ve `go run` çağrısında `CGO_ENABLED=1` ayarlı **olmalıdır**. PQC ve SVM modülleri cgo gerektiren FFI köprüleri kullanır.
:::

## Yerel Kütüphaneler

QoreChain, çalışma zamanında yüklenen, Rust ile derlenmiş iki yerel kütüphaneye bağlıdır.

### libqorepqc (Kuantum Sonrası Kriptografi)

PQC kütüphanesi, C uyumlu bir FFI arabirimi aracılığıyla ML-DSA-87 (Dilithium-5) anahtar üretimi, imzalama ve doğrulama sağlar.

```bash
cd rust/qorepqc
cargo build --release
```

Derlenmiş kütüphane `lib/{os}_{arch}/` dizinine yerleştirilir:

| Platform    | Kütüphane Dosyası  | Dizin               |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (SVM Çalışma Zamanı)

SVM kütüphanesi, x/svm modülü için BPF program yürütme ortamını sağlar.

```bash
cd rust/qoresvm
cargo build --release
```

Çıktı, yukarıdakiyle aynı `lib/{os}_{arch}/` kuralını izler (macOS'ta `libqoresvm.dylib`, Linux'ta `libqoresvm.so`).

### Kütüphane Yolunu Ayarlama

Yerel kütüphaneler çalışma zamanında keşfedilebilir olmalıdır. Platformunuz için uygun ortam değişkenini ayarlayın:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
İpucu: Oturumlar arasında kalıcı olması için dışa aktarmayı kabuk profilinize (`~/.bashrc`, `~/.zshrc`) ekleyin.
:::

## Açık Çekirdek Mimarisi

QoreChain bir **açık çekirdek** modelini izler:

* **Topluluk derlemesi** — Her QoreChain modülü için tüm modül arabirimlerini, CLI komutlarını, protobuf tanımlarını ve mesaj türlerini içerir (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm vb.). Tescilli modüllerin keeper'ları, güvenli varsayılanlar veya no-op yanıtlar döndüren **stub uygulamaları** kullanır. Bu, üçüncü taraf araçların, cüzdanların ve indeksleyicilerin tescilli kod gerektirmeden tüm QoreChain API'leriyle entegre olmasını sağlar.
* **Tam (tescilli) derleme** — `proprietary` derleme etiketinin arkasındaki eksiksiz keeper uygulamalarını etkinleştirir. Bu, gerçek AI anomali algılama mantığını, PRISM uzlaşma parametre ayarlamasını, gelişmiş itibar puanlamasını ve tüm üretim düzeyindeki özellikleri içerir.

Her iki derleme de aynı `qorechaind` ikili dosya adını üretir ve özdeş CLI komutlarını ve gRPC/REST uç noktalarını sunar. Fark, bu arabirimlerin arkasındaki keeper mantığının çalışma zamanı davranışındadır.

## Topluluk Derlemesi

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Bu, tescilli özellikler için stub keeper'larla tüm genel modül arabirimlerini derler. Ortaya çıkan ikili dosya şunlar için tamamen işlevseldir:

* Bir doğrulayıcı düğümü çalıştırma
* İşlem gönderme ve sorgulama
* EVM, CosmWasm ve SVM VM'leriyle etkileşim
* Üçüncü taraf entegrasyonları ve araçları oluşturma
* Yerel geliştirme ve test

## Tam Derleme (Tescilli)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

`-tags proprietary` bayrağı, tam keeper uygulamalarını etkinleştirir; bunlar herkese açık kaynak ağacının parçası değildir.

## Testleri Çalıştırma

```bash
CGO_ENABLED=1 go test ./... -count=1
```

`-count=1` bayrağı test önbelleğini devre dışı bırakarak her seferinde temiz bir çalışma sağlar. Tek tek paket testleri şu şekilde çalıştırılabilir:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Rust kütüphane testlerini ayrı olarak çalıştırın:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Derleme Doğrulaması

Başarılı bir derlemeden sonra ikili dosyayı doğrulayın:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

`init` komutu, `~/.qorechaind/` içinde hatasız bir genesis dosyası ve düğüm yapılandırması oluşturmalıdır. Yukarıdaki örnek, **`qorechain-diana`** test ağına karşı başlatma yapar — ana ağ için **v3.1.77** zincir sürümünü çalıştıran yayındaki ağ olan `--chain-id qorechain-vladi` ifadesini yerine koyun.

## Docker Derlemesi

Konteynerli derlemeler için, depo kök dizininde bir Dockerfile sağlanır:

```bash
docker build -t qorechaind:latest .
```

Docker imajı, tüm yerel kütüphane derlemesini ve yol yapılandırmasını otomatik olarak halleder. Docker Compose ile bir düğüm çalıştırma hakkında [Hızlı Başlangıç](/getting-started/quickstart) kılavuzuna bakın.

## Sorun Giderme

<details>

<summary>cgo: C compiler not found</summary>

Xcode CLI araçlarını (macOS) veya `build-essential` (Linux) yükleyin

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Önce Rust kütüphanelerini derleyin ve `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` ayarını yapın

</details>

<details>

<summary>undefined: sonic.*</summary>

`go.sum` dosyasının güncel olduğundan emin olun: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Kullanılabilir belleği artırın (düşük limitli Docker'da yaygındır)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

`pqcrypto v0.5.0+` kullandığınızı doğrulayın (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bayt)

</details>
