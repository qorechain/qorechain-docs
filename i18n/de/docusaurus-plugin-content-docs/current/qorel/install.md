---
slug: /qorel/install
title: QORel installieren
sidebar_label: Installation
sidebar_position: 3
---

# QORel installieren

QORel ist eine einzige Binärdatei, `qorel`. Diese Seite zeigt jeden Installationsweg und wie Sie prüfen, was Sie heruntergeladen haben. Sie richtet sich an Betreiber, die einen Relayer auf einem Server, einem Laptop oder einer Container-Plattform einrichten. Wählen Sie einen Kanal; alle installieren dasselbe Programm.

Jedes Release auf [GitHub Releases](https://github.com/qorechain/QORel/releases) wird unter einem Tag `qorel-v<version>` veröffentlicht (zum Beispiel `qorel-v0.1.0`) und enthält eine Datei `SHA256SUMS` sowie Build-Herkunftsattestierungen, die Sie mit `gh attestation verify <file> --repo qorechain/QORel` prüfen können. Die einfachen `v*`-Tags im Repository (zum Beispiel `v0.1.0`) gehören zur Historie des ursprünglichen Hermes und sind keine QORel-Releases; verwenden Sie immer das Präfix `qorel-v`.

## Innovationen {#innovations}

- **Prüfbare Downloads.** Tarballs werden durch `SHA256SUMS` und durch Build-Attestierungen abgedeckt, sodass Sie bestätigen können, dass die Datei intakt ist und aus dem Release-Workflow des QORel-Repositorys gebaut wurde.
- **Ein signiertes Container-Image.** Das Image `ghcr.io/qorechain/qorel` ist mit cosign Keyless-Signierung signiert; die Signatur nennt den Release-Workflow des Repositorys, und Sie können sie vor dem Start des Images prüfen.
- **Ein gehärteter Dienst in den Paketen.** `.deb` und `.rpm` installieren eine `qorel.service`, die als eigener Benutzer `qorel` mit Home-Verzeichnis `/var/lib/qorel` läuft, mit umask `0077`, ohne neue Privilegien, mit privatem `/tmp`, schreibgeschütztem System und Schreibzugriff nur auf `/var/lib/qorel`.
- **Kleines Distroless-Image.** Der Container ist Multi-Arch (amd64 und arm64), distroless und non-root.

## Verwendung {#how-to-use}

| Plattform | Kanäle |
|---|---|
| Linux x86_64 oder arm64 (glibc 2.28 oder neuer: Ubuntu 20.04+, Debian 11+, RHEL, Rocky oder Alma 8+, Amazon Linux 2023) | Tarball, `.deb`, `.rpm`, Container, Homebrew |
| macOS Apple Silicon oder Intel | Tarball, Homebrew |
| Docker oder Kubernetes | `ghcr.io/qorechain/qorel` |
| Alles mit einer Rust-Toolchain | aus dem Quellcode |

Windows wird nicht unterstützt (das ursprüngliche Hermes veröffentlicht dafür ebenfalls nichts); verwenden Sie den Container unter WSL2.

### Release-Tarball {#tarball}

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

Die Prüfsummenzeile muss für den Tarball `OK` ausgeben, bevor Sie ihn entpacken.

### Debian, Ubuntu und die RHEL-Familie {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Laden Sie das Paket zuerst von der Release-Seite herunter und prüfen Sie es gegen `SHA256SUMS`. Die Pakete installieren:

- `/usr/bin/qorel`
- eine gehärtete `qorel.service`, die als Benutzer `qorel` mit Home-Verzeichnis `/var/lib/qorel` läuft
- `/etc/qorel/config.example.toml`

Richten Sie danach die Konfiguration und die Schlüssel als Benutzer `qorel` ein:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

Löschen Sie die Mnemonic-Datei nach `keys add`. Schlüsseldateien werden nur für den Besitzer lesbar (0600) geschrieben.

### Homebrew (macOS und Linux) {#homebrew}

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

Die Konfigurationsdatei (`config.toml`) und der Ordner `keys/` werden aus dem eingebundenen Verzeichnis gelesen. Das Verzeichnis muss der uid 65532 gehören und den Modus 0700 haben.

Prüfen Sie die Signatur des Images, bevor Sie es starten:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Aus dem Quellcode {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Dafür sind Rust 1.85, `protoc` und `clang` nötig; unter Linux außerdem die OpenSSL-Header. Fügen Sie `--features vendored-openssl` hinzu, um stattdessen OpenSSL mitzukompilieren.

### Funktionsprüfung {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` listet `add`, `register-pqc` und `pqc-status` unter den Key-Befehlen auf.

## Zugang {#how-to-access}

- **Kosten.** Kostenlos; Apache-2.0.
- **Konten.** Für die Installation keine. Zum Relayen brauchen Sie ein Relayer-Konto auf jeder Chain (siehe [Quickstart](/qorel/quickstart)).
- **Netzwerkzugang.** Der Host braucht ausgehenden Zugriff auf die RPC-, gRPC- und WebSocket-Endpunkte jeder konfigurierten Chain.
- **Voraussetzungen.** Für Pakete und Tarballs glibc 2.28 oder neuer. Für Builds aus dem Quellcode Rust 1.85, `protoc` und `clang`.

## Wo es veröffentlicht ist {#where-published}

| Kanal | Name | Version | Link |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [qorechain/QORel releases](https://github.com/qorechain/QORel/releases) |
| Download-Spiegel | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Container-Registry | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Quellcode | `ibc-relayer-cli`, Binärdatei `qorel` | Tag `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Grenzen und bekannte Probleme {#limits}

- **Kein Windows-Build.** Verwenden Sie den Container unter WSL2.
- **Pre-Release, große Dateien.** Version 0.1.0 wird als GitHub-Pre-Release veröffentlicht. Jede Release-Datei ist etwa 110 MB groß, weil die Binärdateien noch nicht gestrippt sind. Es gibt kein Docker-Hub-Image; verwenden Sie das `ghcr.io`-Image oben.
- **Version festlegen.** Die Befehle oben verwenden `0.1.0`. Verwenden Sie die Version, die Sie betreiben wollen, statt `latest`, und lesen Sie die [Release-Seite](https://github.com/qorechain/QORel/releases) für neuere.
- **Ein Prozess pro Schlüssel.** Betreiben Sie den Paketdienst und einen Container nicht mit demselben Relayer-Schlüssel; zwei Prozesse, die mit demselben Schlüssel signieren, kämpfen um die Account-Sequenzen.
- **Ort des Schlüsselspeichers.** Die Pakete legen Schlüssel unter `/var/lib/qorel` ab; der Container liest sie aus dem eingebundenen Verzeichnis; eine Tarball-Installation verwendet `~/.hermes/keys`, sofern die Konfiguration nicht `key_store_folder` setzt.

Weiter mit: [Quickstart](/qorel/quickstart), [Konfiguration](/qorel/configuration), [Neben einem Validator betreiben](/qorel/running-next-to-a-validator).
