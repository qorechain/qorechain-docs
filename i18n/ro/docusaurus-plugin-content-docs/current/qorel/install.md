---
slug: /qorel/install
title: Instalarea QORel
sidebar_label: Instalare
sidebar_position: 3
---

# Instalarea QORel

QORel este un singur binar, `qorel`. Această pagină arată fiecare mod de a-l instala și cum verificați ce ați descărcat. Este destinată operatorilor care configurează un relayer pe un server, pe un laptop sau pe o platformă de containere. Alegeți un singur canal; toate instalează același program.

Fiecare versiune de pe [GitHub Releases](https://github.com/qorechain/QORel/releases) este publicată sub un tag `qorel-v<version>` (de exemplu `qorel-v0.1.0`) și conține un fișier `SHA256SUMS` și atestări de proveniență a build-ului, pe care le puteți verifica cu `gh attestation verify <file> --repo qorechain/QORel`. Tagurile simple `v*` din depozit (de exemplu `v0.1.0`) reprezintă istoricul Hermes din amonte, nu versiuni QORel; folosiți întotdeauna prefixul `qorel-v`.

## Inovații {#innovations}

- **Descărcări verificabile.** Arhivele tarball sunt acoperite de `SHA256SUMS` și de atestările build-ului, astfel încât puteți confirma atât că fișierul este intact, cât și că a fost construit din fluxul de lucru de release al depozitului QORel.
- **O imagine de container semnată.** Imaginea `ghcr.io/qorechain/qorel` este semnată cu semnarea cosign fără chei (keyless); semnătura indică fluxul de lucru de release al depozitului, iar o puteți verifica înainte de a rula imaginea.
- **Un serviciu întărit în pachete.** `.deb` și `.rpm` instalează un `qorel.service` care rulează ca propriul utilizator `qorel`, cu directorul home în `/var/lib/qorel`, umask `0077`, fără privilegii noi, un `/tmp` privat, un sistem doar în citire și acces de scriere numai în `/var/lib/qorel`.
- **Imagine mică, distroless.** Containerul este multi-arhitectură (amd64 și arm64), distroless și non-root.

## Cum se folosește {#how-to-use}

| Platformă | Canale |
|---|---|
| Linux x86_64 sau arm64 (glibc 2.28 sau mai nou: Ubuntu 20.04+, Debian 11+, RHEL, Rocky sau Alma 8+, Amazon Linux 2023) | tarball, `.deb`, `.rpm`, container, Homebrew |
| macOS Apple Silicon sau Intel | tarball, Homebrew |
| Docker sau Kubernetes | `ghcr.io/qorechain/qorel` |
| Orice cu un toolchain Rust | din sursă |

Windows nu este suportat (nici Hermes din amonte nu publică versiuni pentru el); rulați containerul sub WSL2.

### Arhiva tarball de release {#tarball}

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

Linia de verificare a sumei de control trebuie să afișeze `OK` pentru arhivă înainte de a o extrage.

### Debian, Ubuntu și familia RHEL {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Descărcați mai întâi pachetul de pe pagina de release și verificați-l cu `SHA256SUMS`. Pachetele instalează:

- `/usr/bin/qorel`
- un `qorel.service` întărit, care rulează ca utilizatorul `qorel` cu directorul home în `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

Apoi configurați fișierul de configurare și cheile ca utilizatorul `qorel`:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

Ștergeți fișierul cu mnemonic după `keys add`. Fișierele de chei sunt scrise cu drept de citire doar pentru proprietar (0600).

### Homebrew (macOS și Linux) {#homebrew}

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

Fișierul de configurare (`config.toml`) și folderul `keys/` sunt citite din directorul montat. Directorul trebuie să aparțină uid 65532 și să aibă modul 0700.

Verificați semnătura imaginii înainte de a o rula:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Din sursă {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Aceasta necesită Rust 1.85, `protoc` și `clang`; pe Linux necesită și headerele OpenSSL. Adăugați `--features vendored-openssl` pentru a compila OpenSSL direct în binar.

### Verificați că funcționează {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` listează `add`, `register-pqc` și `pqc-status` printre comenzile pentru chei.

## Cum se accesează {#how-to-access}

- **Cost.** Gratuit; Apache-2.0.
- **Conturi.** Niciunul pentru instalare. Pentru a face relay aveți nevoie de un cont de relayer pe fiecare lanț (vezi [Pornire rapidă](/qorel/quickstart)).
- **Acces la rețea.** Gazda are nevoie de acces de ieșire către endpoint-urile RPC, gRPC și WebSocket ale fiecărui lanț pe care îl configurați.
- **Cerințe prealabile.** Pentru pachete și arhive tarball, glibc 2.28 sau mai nou. Pentru build-uri din sursă, Rust 1.85, `protoc` și `clang`.

## Unde este publicat {#where-published}

| Canal | Nume | Versiune | Link |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [qorechain/QORel releases](https://github.com/qorechain/QORel/releases) |
| Oglindă de descărcare | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Registrul de containere | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Sursă | `ibc-relayer-cli`, binar `qorel` | tag `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Limite și probleme cunoscute {#limits}

- **Fără build pentru Windows.** Folosiți containerul sub WSL2.
- **Pre-lansare, fișiere mari.** Versiunea 0.1.0 este publicată ca pre-lansare (pre-release) pe GitHub. Fiecare fișier al lansării are aproximativ 110 MB, deoarece binarele nu sunt încă reduse cu strip. Nu există imagine pe Docker Hub; folosiți imaginea `ghcr.io` de mai sus.
- **Fixați versiunea.** Comenzile de mai sus folosesc `0.1.0`. Folosiți versiunea pe care intenționați să o rulați, nu `latest`, și citiți [pagina de release](https://github.com/qorechain/QORel/releases) pentru versiuni mai noi.
- **Un proces per cheie.** Nu rulați serviciul din pachet și un container cu aceeași cheie de relayer; două procese care semnează cu aceeași cheie se luptă pentru secvențele contului.
- **Locația depozitului de chei.** Pachetele păstrează cheile în `/var/lib/qorel`; containerul le citește din directorul montat; o instalare din tarball folosește `~/.hermes/keys`, dacă configurația nu setează `key_store_folder`.

Următorii pași: [Pornire rapidă](/qorel/quickstart), [Configurare](/qorel/configuration), [Rularea alături de un validator](/qorel/running-next-to-a-validator).
