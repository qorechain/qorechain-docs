---
slug: /qorel/install
title: Install QORel
sidebar_label: Install
sidebar_position: 3
---

# Install QORel

QORel is one binary, `qorel`. This page shows each way to install it and how to check what you downloaded. It is for operators setting up a relayer on a server, a laptop or a container platform. Pick one channel; they all install the same program.

Every release on [GitHub Releases](https://github.com/qorechain/QORel/releases) is published under a `qorel-v<version>` tag (for example `qorel-v0.1.0`) and carries a `SHA256SUMS` file and build provenance attestations that you can check with `gh attestation verify <file> --repo qorechain/QORel`. The plain `v*` tags in the repository (for example `v0.1.0`) are the upstream Hermes history, not QORel releases; always use the `qorel-v` prefix.

## Innovations {#innovations}

- **Checkable downloads.** Tarballs are covered by `SHA256SUMS` and by build attestations, so you can confirm both that the file is intact and that it was built from the QORel repository's release workflow.
- **A signed container image.** The image `ghcr.io/qorechain/qorel` is signed with cosign keyless signing; the signature names the repository's release workflow, and you can verify it before running the image.
- **A hardened service in the packages.** The `.deb` and `.rpm` install a `qorel.service` that runs as its own `qorel` user with its home in `/var/lib/qorel`, a `0077` umask, no new privileges, a private `/tmp`, a read-only system, and write access only to `/var/lib/qorel`.
- **Small distroless image.** The container is multi-arch (amd64 and arm64), distroless and non-root.

## How to use {#how-to-use}

| Platform | Channels |
|---|---|
| Linux x86_64 or arm64 (glibc 2.28 or later: Ubuntu 20.04+, Debian 11+, RHEL, Rocky or Alma 8+, Amazon Linux 2023) | tarball, `.deb`, `.rpm`, container, Homebrew |
| macOS Apple Silicon or Intel | tarball, Homebrew |
| Docker or Kubernetes | `ghcr.io/qorechain/qorel` |
| Anything with a Rust toolchain | from source |

Windows is not supported (upstream Hermes does not release for it either); run the container under WSL2.

### Release tarball {#tarball}

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

The checksum line must print `OK` for the tarball before you extract it.

### Debian, Ubuntu and the RHEL family {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Download the package from the release page first and check it against `SHA256SUMS`. The packages install:

- `/usr/bin/qorel`
- a hardened `qorel.service`, running as user `qorel` with its home in `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

Then set up the config and the keys as the `qorel` user:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

Delete the mnemonic file after `keys add`. Key files are written readable by the owner only (0600).

### Homebrew (macOS and Linux) {#homebrew}

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

The configuration file (`config.toml`) and the `keys/` folder are read from the mounted directory. The directory must be owned by uid 65532 and be mode 0700.

Verify the image signature before you run it:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### From source {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

This needs Rust 1.85, `protoc` and `clang`; on Linux it also needs the OpenSSL headers. Add `--features vendored-openssl` to compile OpenSSL in instead.

### Check that it works {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` lists `add`, `register-pqc` and `pqc-status` among the key commands.

## How to access {#how-to-access}

- **Cost.** Free; Apache-2.0.
- **Accounts.** None to install. To relay you need a relayer account on each chain (see [Quickstart](/qorel/quickstart)).
- **Network access.** The host needs outbound access to the RPC, gRPC and WebSocket endpoints of each chain you configure.
- **Prerequisites.** For packages and tarballs, glibc 2.28 or later. For source builds, Rust 1.85, `protoc` and `clang`.

## Where it is published {#where-published}

| Channel | Name | Version | Link |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [qorechain/QORel releases](https://github.com/qorechain/QORel/releases) |
| Download mirror | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Container registry | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Source | `ibc-relayer-cli`, binary `qorel` | tag `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Limits and known issues {#limits}

- **No Windows build.** Use the container under WSL2.
- **Pre-release, large files.** Version 0.1.0 is published as a GitHub pre-release. Each release file is about 110 MB, because the binaries are not stripped yet. There is no Docker Hub image; use the `ghcr.io` image above.
- **Pin the version.** The commands above use `0.1.0`. Use the version you intend to run rather than `latest`, and read the [release page](https://github.com/qorechain/QORel/releases) for newer ones.
- **One process per key.** Do not run the package service and a container with the same relayer key; two processes signing with the same key fight over account sequences.
- **Key store location.** The packages keep keys under `/var/lib/qorel`; the container reads them from the mounted directory; a tarball install uses `~/.hermes/keys` unless the config sets `key_store_folder`.

Next: [Quickstart](/qorel/quickstart), [Configuration](/qorel/configuration), [Running next to a validator](/qorel/running-next-to-a-validator).
