---
slug: /qorel/install
title: Installer QORel
sidebar_label: Installation
sidebar_position: 3
---

# Installer QORel

QORel est un seul binaire, `qorel`. Cette page présente chaque façon de l'installer et comment vérifier ce que vous avez téléchargé. Elle s'adresse aux opérateurs qui installent un relayeur sur un serveur, un ordinateur portable ou une plateforme de conteneurs. Choisissez un seul canal ; ils installent tous le même programme.

Chaque version publiée sur [GitHub Releases](https://github.com/qorechain/QORel/releases) est publiée sous un tag `qorel-v<version>` (par exemple `qorel-v0.1.0`) et comprend un fichier `SHA256SUMS` et des attestations de provenance de build que vous pouvez vérifier avec `gh attestation verify <file> --repo qorechain/QORel`. Les tags `v*` simples du dépôt (par exemple `v0.1.0`) correspondent à l'historique Hermes en amont, et non à des versions de QORel ; utilisez toujours le préfixe `qorel-v`.

## Innovations {#innovations}

- **Des téléchargements vérifiables.** Les archives sont couvertes par `SHA256SUMS` et par des attestations de build, ce qui permet de confirmer à la fois que le fichier est intact et qu'il a été construit par le workflow de publication du dépôt QORel.
- **Une image de conteneur signée.** L'image `ghcr.io/qorechain/qorel` est signée par signature cosign sans clé (keyless) ; la signature désigne le workflow de publication du dépôt, et vous pouvez la vérifier avant d'exécuter l'image.
- **Un service durci dans les paquets.** Les `.deb` et `.rpm` installent un `qorel.service` qui s'exécute sous son propre utilisateur `qorel`, avec son répertoire personnel dans `/var/lib/qorel`, un umask `0077`, aucun nouveau privilège, un `/tmp` privé, un système en lecture seule, et un accès en écriture uniquement à `/var/lib/qorel`.
- **Une petite image distroless.** Le conteneur est multi-architecture (amd64 et arm64), distroless et non root.

## Utilisation {#how-to-use}

| Plateforme | Canaux |
|---|---|
| Linux x86_64 ou arm64 (glibc 2.28 ou plus récent : Ubuntu 20.04+, Debian 11+, RHEL, Rocky ou Alma 8+, Amazon Linux 2023) | archive, `.deb`, `.rpm`, conteneur, Homebrew |
| macOS Apple Silicon ou Intel | archive, Homebrew |
| Docker ou Kubernetes | `ghcr.io/qorechain/qorel` |
| Tout système avec une chaîne d'outils Rust | depuis les sources |

Windows n'est pas pris en charge (Hermes en amont ne publie pas non plus pour Windows) ; exécutez le conteneur sous WSL2.

### Archive de version {#tarball}

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

La ligne de vérification de somme de contrôle doit afficher `OK` pour l'archive avant que vous l'extrayiez.

### Debian, Ubuntu et la famille RHEL {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Téléchargez d'abord le paquet depuis la page de version et vérifiez-le avec `SHA256SUMS`. Les paquets installent :

- `/usr/bin/qorel`
- un `qorel.service` durci, exécuté sous l'utilisateur `qorel` avec son répertoire personnel dans `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

Configurez ensuite le fichier de configuration et les clés en tant qu'utilisateur `qorel` :

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

Supprimez le fichier de phrase mnémonique après `keys add`. Les fichiers de clés sont écrits en lecture réservée au propriétaire (0600).

### Homebrew (macOS et Linux) {#homebrew}

```bash
brew install qorechain/tap/qorel
qorel --version
```

### Conteneur {#container}

```bash
docker run --rm ghcr.io/qorechain/qorel:0.1.0 --version
docker run -d --name qorel --restart unless-stopped \
  -v $HOME/.qorel:/home/nonroot/.hermes \
  ghcr.io/qorechain/qorel:0.1.0 start
```

Le fichier de configuration (`config.toml`) et le dossier `keys/` sont lus dans le répertoire monté. Ce répertoire doit appartenir à l'uid 65532 et avoir le mode 0700.

Vérifiez la signature de l'image avant de l'exécuter :

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Depuis les sources {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Cela nécessite Rust 1.85, `protoc` et `clang` ; sous Linux, il faut aussi les en-têtes OpenSSL. Ajoutez `--features vendored-openssl` pour compiler OpenSSL directement à la place.

### Vérifier que cela fonctionne {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` liste `add`, `register-pqc` et `pqc-status` parmi les commandes de clés.

## Accès {#how-to-access}

- **Coût.** Gratuit ; Apache-2.0.
- **Comptes.** Aucun pour l'installation. Pour relayer, il vous faut un compte de relayeur sur chaque chaîne (voir [Démarrage rapide](/qorel/quickstart)).
- **Accès réseau.** L'hôte doit avoir un accès sortant aux points d'accès RPC, gRPC et WebSocket de chaque chaîne que vous configurez.
- **Prérequis.** Pour les paquets et les archives, glibc 2.28 ou plus récent. Pour les builds depuis les sources, Rust 1.85, `protoc` et `clang`.

## Où c'est publié {#where-published}

| Canal | Nom | Version | Lien |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [versions de qorechain/QORel](https://github.com/qorechain/QORel/releases) |
| Miroir de téléchargement | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Registre de conteneurs | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Sources | `ibc-relayer-cli`, binaire `qorel` | tag `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Limites et problèmes connus {#limits}

- **Pas de build Windows.** Utilisez le conteneur sous WSL2.
- **Préversion, fichiers volumineux.** La version 0.1.0 est publiée comme préversion (pre-release) GitHub. Chaque fichier de la version pèse environ 110 MB, car les binaires ne sont pas encore allégés (strip). Il n'y a pas d'image Docker Hub ; utilisez l'image `ghcr.io` ci-dessus.
- **Épinglez la version.** Les commandes ci-dessus utilisent `0.1.0`. Utilisez la version que vous comptez exécuter plutôt que `latest`, et consultez la [page des versions](https://github.com/qorechain/QORel/releases) pour les plus récentes.
- **Un processus par clé.** N'exécutez pas le service du paquet et un conteneur avec la même clé de relayeur ; deux processus qui signent avec la même clé se disputent les numéros de séquence du compte.
- **Emplacement du magasin de clés.** Les paquets conservent les clés sous `/var/lib/qorel` ; le conteneur les lit dans le répertoire monté ; une installation par archive utilise `~/.hermes/keys` sauf si la configuration définit `key_store_folder`.

Suite : [Démarrage rapide](/qorel/quickstart), [Configuration](/qorel/configuration), [Exécuter à côté d'un validateur](/qorel/running-next-to-a-validator).
