---
slug: /qorel/install
title: Installare QORel
sidebar_label: Installazione
sidebar_position: 3
---

# Installare QORel

QORel è un unico binario, `qorel`. Questa pagina mostra ogni modo per installarlo e come verificare ciò che hai scaricato. È pensata per gli operatori che configurano un relayer su un server, un laptop o una piattaforma di container. Scegli un solo canale; tutti installano lo stesso programma.

Ogni release su [GitHub Releases](https://github.com/qorechain/QORel/releases) è pubblicata con un tag `qorel-v<version>` (ad esempio `qorel-v0.1.0`) e include un file `SHA256SUMS` e attestazioni di provenienza della build che puoi verificare con `gh attestation verify <file> --repo qorechain/QORel`. I semplici tag `v*` nel repository (ad esempio `v0.1.0`) sono la cronologia di Hermes originale, non release di QORel; usa sempre il prefisso `qorel-v`.

## Innovazioni {#innovations}

- **Download verificabili.** I tarball sono coperti da `SHA256SUMS` e da attestazioni di build, così puoi confermare sia che il file è integro sia che è stato costruito dal workflow di release del repository di QORel.
- **Un'immagine container firmata.** L'immagine `ghcr.io/qorechain/qorel` è firmata con la firma keyless di cosign; la firma indica il workflow di release del repository e puoi verificarla prima di eseguire l'immagine.
- **Un servizio rinforzato nei pacchetti.** I `.deb` e `.rpm` installano un `qorel.service` che gira come utente `qorel` dedicato con home in `/var/lib/qorel`, umask `0077`, nessun nuovo privilegio, un `/tmp` privato, un sistema in sola lettura e accesso in scrittura solo a `/var/lib/qorel`.
- **Piccola immagine distroless.** Il container è multi-architettura (amd64 e arm64), distroless e non-root.

## Come si usa {#how-to-use}

| Piattaforma | Canali |
|---|---|
| Linux x86_64 o arm64 (glibc 2.28 o successiva: Ubuntu 20.04+, Debian 11+, RHEL, Rocky o Alma 8+, Amazon Linux 2023) | tarball, `.deb`, `.rpm`, container, Homebrew |
| macOS Apple Silicon o Intel | tarball, Homebrew |
| Docker o Kubernetes | `ghcr.io/qorechain/qorel` |
| Qualsiasi sistema con una toolchain Rust | da sorgente |

Windows non è supportato (nemmeno Hermes originale rilascia per Windows); esegui il container sotto WSL2.

### Tarball di release {#tarball}

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

La riga del checksum deve stampare `OK` per il tarball prima che tu lo estragga.

### Debian, Ubuntu e la famiglia RHEL {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Scarica prima il pacchetto dalla pagina della release e controllalo rispetto a `SHA256SUMS`. I pacchetti installano:

- `/usr/bin/qorel`
- un `qorel.service` rinforzato, eseguito come utente `qorel` con home in `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

Poi imposta la configurazione e le chiavi come utente `qorel`:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

Elimina il file della mnemonica dopo `keys add`. I file delle chiavi sono scritti leggibili solo dal proprietario (0600).

### Homebrew (macOS e Linux) {#homebrew}

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

Il file di configurazione (`config.toml`) e la cartella `keys/` vengono letti dalla directory montata. La directory deve appartenere all'uid 65532 e avere modalità 0700.

Verifica la firma dell'immagine prima di eseguirla:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Da sorgente {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Richiede Rust 1.85, `protoc` e `clang`; su Linux richiede anche gli header di OpenSSL. Aggiungi `--features vendored-openssl` per compilare OpenSSL al suo interno.

### Verificare che funzioni {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` elenca `add`, `register-pqc` e `pqc-status` tra i comandi delle chiavi.

## Come accedere {#how-to-access}

- **Costo.** Gratuito; Apache-2.0.
- **Account.** Nessuno per l'installazione. Per fare da relay serve un account relayer su ciascuna chain (vedi [Avvio rapido](/qorel/quickstart)).
- **Accesso di rete.** L'host richiede accesso in uscita agli endpoint RPC, gRPC e WebSocket di ogni chain che configuri.
- **Prerequisiti.** Per pacchetti e tarball, glibc 2.28 o successiva. Per le build da sorgente, Rust 1.85, `protoc` e `clang`.

## Dove è pubblicato {#where-published}

| Canale | Nome | Versione | Link |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [release di qorechain/QORel](https://github.com/qorechain/QORel/releases) |
| Mirror di download | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Registro dei container | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Sorgente | `ibc-relayer-cli`, binario `qorel` | tag `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Limiti e problemi noti {#limits}

- **Nessuna build per Windows.** Usa il container sotto WSL2.
- **Pre-release, file di grandi dimensioni.** La versione 0.1.0 è pubblicata come pre-release di GitHub. Ogni file della release pesa circa 110 MB, perché i binari non sono ancora stati ridotti con strip. Non esiste un'immagine su Docker Hub; usa l'immagine `ghcr.io` indicata sopra.
- **Fissa la versione.** I comandi qui sopra usano `0.1.0`. Usa la versione che intendi eseguire anziché `latest`, e consulta la [pagina delle release](https://github.com/qorechain/QORel/releases) per quelle più recenti.
- **Un processo per chiave.** Non eseguire il servizio del pacchetto e un container con la stessa chiave del relayer; due processi che firmano con la stessa chiave si contendono i sequence dell'account.
- **Posizione dell'archivio delle chiavi.** I pacchetti conservano le chiavi in `/var/lib/qorel`; il container le legge dalla directory montata; un'installazione da tarball usa `~/.hermes/keys` a meno che la configurazione imposti `key_store_folder`.

Prossimi passi: [Avvio rapido](/qorel/quickstart), [Configurazione](/qorel/configuration), [Eseguire QORel accanto a un validatore](/qorel/running-next-to-a-validator).
