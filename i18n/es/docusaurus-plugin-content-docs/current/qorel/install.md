---
slug: /qorel/install
title: Instalar QORel
sidebar_label: Instalación
sidebar_position: 3
---

# Instalar QORel

QORel es un único binario, `qorel`. Esta página muestra cada forma de instalarlo y cómo comprobar lo que has descargado. Está dirigida a operadores que montan un relayer en un servidor, un portátil o una plataforma de contenedores. Elige un canal; todos instalan el mismo programa.

Cada versión en [GitHub Releases](https://github.com/qorechain/QORel/releases) se publica bajo una etiqueta `qorel-v<version>` (por ejemplo `qorel-v0.1.0`) e incluye un archivo `SHA256SUMS` y atestaciones de procedencia de la compilación que puedes comprobar con `gh attestation verify <file> --repo qorechain/QORel`. Las etiquetas `v*` simples del repositorio (por ejemplo `v0.1.0`) son el historial del Hermes original, no versiones de QORel; usa siempre el prefijo `qorel-v`.

## Innovaciones {#innovations}

- **Descargas comprobables.** Los tarballs están cubiertos por `SHA256SUMS` y por atestaciones de compilación, de modo que puedes confirmar tanto que el archivo está íntegro como que se construyó con el flujo de trabajo de publicación del repositorio de QORel.
- **Una imagen de contenedor firmada.** La imagen `ghcr.io/qorechain/qorel` está firmada con firma cosign sin claves (keyless); la firma nombra el flujo de trabajo de publicación del repositorio y puedes verificarla antes de ejecutar la imagen.
- **Un servicio reforzado en los paquetes.** Los `.deb` y `.rpm` instalan un `qorel.service` que se ejecuta como su propio usuario `qorel` con su directorio personal en `/var/lib/qorel`, un umask `0077`, sin nuevos privilegios, un `/tmp` privado, un sistema de solo lectura y acceso de escritura únicamente a `/var/lib/qorel`.
- **Imagen distroless pequeña.** El contenedor es multiarquitectura (amd64 y arm64), distroless y sin root.

## Cómo se usa {#how-to-use}

| Plataforma | Canales |
|---|---|
| Linux x86_64 o arm64 (glibc 2.28 o posterior: Ubuntu 20.04+, Debian 11+, RHEL, Rocky o Alma 8+, Amazon Linux 2023) | tarball, `.deb`, `.rpm`, contenedor, Homebrew |
| macOS Apple Silicon o Intel | tarball, Homebrew |
| Docker o Kubernetes | `ghcr.io/qorechain/qorel` |
| Cualquier sistema con una cadena de herramientas de Rust | desde el código fuente |

Windows no es compatible (el Hermes original tampoco publica versiones para él); ejecuta el contenedor bajo WSL2.

### Tarball de la versión {#tarball}

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

La línea de la suma de comprobación debe imprimir `OK` para el tarball antes de extraerlo.

### Debian, Ubuntu y la familia RHEL {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

Descarga primero el paquete de la página de la versión y compruébalo con `SHA256SUMS`. Los paquetes instalan:

- `/usr/bin/qorel`
- un `qorel.service` reforzado, que se ejecuta como el usuario `qorel` con su directorio personal en `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

Después configura el archivo de configuración y las claves como el usuario `qorel`:

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

Elimina el archivo de la mnemónica después de `keys add`. Los archivos de clave se escriben legibles solo por el propietario (0600).

### Homebrew (macOS y Linux) {#homebrew}

```bash
brew install qorechain/tap/qorel
qorel --version
```

### Contenedor {#container}

```bash
docker run --rm ghcr.io/qorechain/qorel:0.1.0 --version
docker run -d --name qorel --restart unless-stopped \
  -v $HOME/.qorel:/home/nonroot/.hermes \
  ghcr.io/qorechain/qorel:0.1.0 start
```

El archivo de configuración (`config.toml`) y la carpeta `keys/` se leen del directorio montado. El directorio debe pertenecer al uid 65532 y tener modo 0700.

Verifica la firma de la imagen antes de ejecutarla:

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Desde el código fuente {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Esto requiere Rust 1.85, `protoc` y `clang`; en Linux también requiere las cabeceras de OpenSSL. Añade `--features vendored-openssl` para compilar OpenSSL en su lugar.

### Comprobar que funciona {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` lista `add`, `register-pqc` y `pqc-status` entre los comandos de claves.

## Cómo acceder {#how-to-access}

- **Coste.** Gratuito; Apache-2.0.
- **Cuentas.** Ninguna para instalar. Para retransmitir necesitas una cuenta de relayer en cada cadena (consulta [Inicio rápido](/qorel/quickstart)).
- **Acceso de red.** El host necesita acceso saliente a los endpoints RPC, gRPC y WebSocket de cada cadena que configures.
- **Requisitos previos.** Para paquetes y tarballs, glibc 2.28 o posterior. Para compilar desde el código fuente, Rust 1.85, `protoc` y `clang`.

## Dónde se publica {#where-published}

| Canal | Nombre | Versión | Enlace |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [versiones de qorechain/QORel](https://github.com/qorechain/QORel/releases) |
| Espejo de descargas | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| Registro de contenedores | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| Código fuente | `ibc-relayer-cli`, binario `qorel` | etiqueta `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## Límites y problemas conocidos {#limits}

- **Sin compilación para Windows.** Usa el contenedor bajo WSL2.
- **Prelanzamiento, archivos grandes.** La versión 0.1.0 se publica como prelanzamiento (pre-release) de GitHub. Cada archivo de la versión pesa unos 110 MB, porque los binarios todavía no están reducidos con strip. No hay imagen en Docker Hub; usa la imagen de `ghcr.io` indicada arriba.
- **Fija la versión.** Los comandos anteriores usan `0.1.0`. Usa la versión que pretendes ejecutar en lugar de `latest`, y consulta la [página de versiones](https://github.com/qorechain/QORel/releases) para ver las más recientes.
- **Un proceso por clave.** No ejecutes el servicio del paquete y un contenedor con la misma clave de relayer; dos procesos que firman con la misma clave se pisan los números de secuencia de la cuenta.
- **Ubicación del almacén de claves.** Los paquetes guardan las claves en `/var/lib/qorel`; el contenedor las lee del directorio montado; una instalación con tarball usa `~/.hermes/keys` salvo que la configuración defina `key_store_folder`.

Siguiente: [Inicio rápido](/qorel/quickstart), [Configuración](/qorel/configuration), [Ejecución junto a un validador](/qorel/running-next-to-a-validator).
