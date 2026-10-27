---
slug: /qorel/install
title: QORel Kurulumu
sidebar_label: Kurulum
sidebar_position: 3
---

# QORel Kurulumu

QORel tek bir ikili dosyadır: `qorel`. Bu sayfa her kurulum yolunu ve indirdiğiniz şeyin nasıl kontrol edileceğini gösterir. Bir sunucuda, dizüstü bilgisayarda veya container platformunda relayer kuran operatörler içindir. Bir kanal seçin; hepsi aynı programı kurar.

[GitHub Releases](https://github.com/qorechain/QORel/releases) üzerindeki her sürüm bir `qorel-v<version>` etiketi altında yayımlanır (örneğin `qorel-v0.1.0`) ve `gh attestation verify <file> --repo qorechain/QORel` ile kontrol edebileceğiniz bir `SHA256SUMS` dosyası ile derleme menşei doğrulamaları içerir. Depodaki düz `v*` etiketleri (örneğin `v0.1.0`) üst akım Hermes geçmişidir, QORel sürümleri değildir; her zaman `qorel-v` önekini kullanın.

## Yenilikler {#innovations}

- **Kontrol edilebilir indirmeler.** Tarball'lar `SHA256SUMS` ve derleme doğrulamalarıyla kapsanır; böylece dosyanın bozulmadığını ve QORel deposunun sürüm iş akışında derlendiğini teyit edebilirsiniz.
- **İmzalı bir container imajı.** `ghcr.io/qorechain/qorel` imajı cosign anahtarsız imzalama ile imzalanır; imza deponun sürüm iş akışını adlandırır ve imajı çalıştırmadan önce doğrulayabilirsiniz.
- **Paketlerde sertleştirilmiş bir servis.** `.deb` ve `.rpm`, kendi `qorel` kullanıcısı olarak, ev dizini `/var/lib/qorel` olacak şekilde, `0077` umask, yeni ayrıcalık yok, özel bir `/tmp`, salt okunur bir sistem ve yalnızca `/var/lib/qorel` için yazma erişimiyle çalışan bir `qorel.service` kurar.
- **Küçük distroless imaj.** Container çok mimarilidir (amd64 ve arm64), distroless'tır ve root olmayan kullanıcıyla çalışır.

## Nasıl kullanılır {#how-to-use}

| Platform | Kanallar |
|---|---|
| Linux x86_64 veya arm64 (glibc 2.28 veya üzeri: Ubuntu 20.04+, Debian 11+, RHEL, Rocky veya Alma 8+, Amazon Linux 2023) | tarball, `.deb`, `.rpm`, container, Homebrew |
| macOS Apple Silicon veya Intel | tarball, Homebrew |
| Docker veya Kubernetes | `ghcr.io/qorechain/qorel` |
| Rust araç zinciri olan her şey | kaynaktan |

Windows desteklenmez (üst akım Hermes de onun için sürüm çıkarmaz); container'ı WSL2 altında çalıştırın.

### Sürüm tarball'ı {#tarball}

```bash
V=0.1.0
T=x86_64-unknown-linux-gnu   # or aarch64-unknown-linux-gnu, aarch64-apple-darwin, x86_64-apple-darwin
curl -LO https://github.com/qorechain/QORel/releases/download/qorel-v$V/qorel-v$V-$T.tar.gz
curl -LO https://github.com/qorechain/QORel/releases/download/qorel-v$V/SHA256SUMS
sha256sum --ignore-missing -c SHA256SUMS   # macOS: shasum -a 256 --ignore-missing -c SHA256SUMS
tar -xzf qorel-v$V-$T.tar.gz
sudo install -m 0755 qorel-v$V-$T/qorel /usr/local/bin/qorel
qorel --version
```

Tarball'ı açmadan önce sağlama toplamı satırı tarball için `OK` yazdırmalıdır.

### Debian, Ubuntu ve RHEL ailesi {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Önce paketi sürüm sayfasından indirin ve `SHA256SUMS` ile karşılaştırın. Paketler şunları kurar:

- `/usr/bin/qorel`
- ev dizini `/var/lib/qorel` olan `qorel` kullanıcısı olarak çalışan sertleştirilmiş bir `qorel.service`
- `/etc/qorel/config.example.toml`

Ardından yapılandırmayı ve anahtarları `qorel` kullanıcısı olarak ayarlayın:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

`keys add` sonrasında mnemonic dosyasını silin. Anahtar dosyaları yalnızca sahibin okuyabileceği şekilde (0600) yazılır.

### Homebrew (macOS ve Linux) {#homebrew}

```bash
brew install qorechain/tap/qorel
qorel --version
```

### Container {#container}

```bash
docker run --rm ghcr.io/qorechain/qorel:0.1.0 --version
docker run -d --name qorel --restart unless-stopped \
  -v $HOME/.qorel:/home/nonroot/.hermes \
  ghcr.io/qorechain/qorel:0.1.0 start
```

Yapılandırma dosyası (`config.toml`) ve `keys/` klasörü bağlanan dizinden okunur. Dizin uid 65532'ye ait olmalı ve kipi 0700 olmalıdır.

İmajı çalıştırmadan önce imzasını doğrulayın:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Kaynaktan {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Bunun için Rust 1.85, `protoc` ve `clang` gerekir; Linux'ta ayrıca OpenSSL başlık dosyaları gerekir. OpenSSL'i derlemeye dahil etmek için `--features vendored-openssl` ekleyin.

### Çalıştığını kontrol edin {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help`, anahtar komutları arasında `add`, `register-pqc` ve `pqc-status` komutlarını listeler.

## Nasıl erişilir {#how-to-access}

- **Maliyet.** Ücretsiz; Apache-2.0.
- **Hesaplar.** Kurmak için gerekmez. Röle yapmak için her zincirde bir relayer hesabına ihtiyacınız var ([Hızlı Başlangıç](/qorel/quickstart) sayfasına bakın).
- **Ağ erişimi.** Ana makinenin, yapılandırdığınız her zincirin RPC, gRPC ve WebSocket uç noktalarına giden erişimi olmalıdır.
- **Ön koşullar.** Paketler ve tarball'lar için glibc 2.28 veya üzeri. Kaynaktan derlemeler için Rust 1.85, `protoc` ve `clang`.

## Nerede yayımlanır {#where-published}

| Kanal | Ad | Sürüm | Bağlantı |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [qorechain/QORel sürümleri](https://github.com/qorechain/QORel/releases) |
| İndirme yansısı | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Container kayıt defteri | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Kaynak | `ibc-relayer-cli`, ikili dosya `qorel` | etiket `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Sınırlar ve bilinen sorunlar {#limits}

- **Windows derlemesi yok.** WSL2 altında container kullanın.
- **Ön sürüm, büyük dosyalar.** 0.1.0 sürümü GitHub'da ön sürüm (pre-release) olarak yayımlanır. İkili dosyalar henüz strip edilmediği için her sürüm dosyası yaklaşık 110 MB'tır. Docker Hub imajı yoktur; yukarıdaki `ghcr.io` imajını kullanın.
- **Sürümü sabitleyin.** Yukarıdaki komutlar `0.1.0` kullanır. `latest` yerine çalıştırmayı düşündüğünüz sürümü kullanın ve daha yenileri için [sürüm sayfasını](https://github.com/qorechain/QORel/releases) okuyun.
- **Anahtar başına tek süreç.** Aynı relayer anahtarıyla paket servisini ve bir container'ı birlikte çalıştırmayın; aynı anahtarla imzalayan iki süreç hesap sıra numaraları için çekişir.
- **Anahtar deposu konumu.** Paketler anahtarları `/var/lib/qorel` altında tutar; container onları bağlanan dizinden okur; yapılandırma `key_store_folder` ayarlamadığı sürece tarball kurulumu `~/.hermes/keys` kullanır.

Sonraki: [Hızlı Başlangıç](/qorel/quickstart), [Yapılandırma](/qorel/configuration), [Bir doğrulayıcının yanında çalıştırma](/qorel/running-next-to-a-validator).
