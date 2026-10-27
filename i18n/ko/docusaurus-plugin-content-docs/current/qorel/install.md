---
slug: /qorel/install
title: QORel 설치
sidebar_label: 설치
sidebar_position: 3
---

# QORel 설치

QORel은 바이너리 `qorel` 하나입니다. 이 페이지는 설치하는 각 방법과 내려받은 파일을 확인하는 방법을 보여 줍니다. 서버, 노트북, 컨테이너 플랫폼에 릴레이어를 구축하는 운영자를 위한 것입니다. 채널을 하나 고르세요. 모두 같은 프로그램을 설치합니다.

[GitHub Releases](https://github.com/qorechain/QORel/releases)의 모든 릴리스는 `qorel-v<version>` 태그(예: `qorel-v0.1.0`)로 게시되며, `SHA256SUMS` 파일과 빌드 출처 증명(attestation)이 포함되어 있습니다. 증명은 `gh attestation verify <file> --repo qorechain/QORel`로 확인할 수 있습니다. 저장소의 일반 `v*` 태그(예: `v0.1.0`)는 업스트림 Hermes의 이력이지 QORel 릴리스가 아닙니다. 항상 `qorel-v` 접두사를 사용하세요.

## 혁신 {#innovations}

- **확인 가능한 다운로드.** 타르볼은 `SHA256SUMS`와 빌드 증명으로 보호되므로, 파일이 손상되지 않았다는 것과 QORel 저장소의 릴리스 워크플로로 빌드되었다는 것을 모두 확인할 수 있습니다.
- **서명된 컨테이너 이미지.** 이미지 `ghcr.io/qorechain/qorel`은 cosign 키리스 서명으로 서명되며, 서명에는 저장소의 릴리스 워크플로가 명시되어 있어 이미지를 실행하기 전에 검증할 수 있습니다.
- **패키지에 포함된 하드닝된 서비스.** `.deb`와 `.rpm`은 자체 `qorel` 사용자로 실행되고 홈이 `/var/lib/qorel`이며, `0077` umask, no new privileges, 비공개 `/tmp`, 읽기 전용 시스템을 적용하고 `/var/lib/qorel`에만 쓰기를 허용하는 `qorel.service`를 설치합니다.
- **작은 distroless 이미지.** 컨테이너는 멀티 아키텍처(amd64 및 arm64)이며 distroless이고 non-root입니다.

## 사용 방법 {#how-to-use}

| 플랫폼 | 채널 |
|---|---|
| Linux x86_64 또는 arm64(glibc 2.28 이상: Ubuntu 20.04+, Debian 11+, RHEL, Rocky 또는 Alma 8+, Amazon Linux 2023) | 타르볼, `.deb`, `.rpm`, 컨테이너, Homebrew |
| macOS Apple Silicon 또는 Intel | 타르볼, Homebrew |
| Docker 또는 Kubernetes | `ghcr.io/qorechain/qorel` |
| Rust 툴체인이 있는 모든 환경 | 소스에서 빌드 |

Windows는 지원하지 않습니다(업스트림 Hermes도 Windows용으로 릴리스하지 않습니다). WSL2에서 컨테이너를 실행하세요.

### 릴리스 타르볼 {#tarball}

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

압축을 풀기 전에 체크섬 줄이 타르볼에 대해 `OK`를 출력해야 합니다.

### Debian, Ubuntu, RHEL 계열 {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

먼저 릴리스 페이지에서 패키지를 내려받아 `SHA256SUMS`와 대조하세요. 패키지가 설치하는 것:

- `/usr/bin/qorel`
- 하드닝된 `qorel.service`, 사용자 `qorel`로 실행되며 홈은 `/var/lib/qorel`
- `/etc/qorel/config.example.toml`

그런 다음 `qorel` 사용자로 설정과 키를 준비합니다.

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

`keys add` 후에는 니모닉 파일을 삭제하세요. 키 파일은 소유자만 읽을 수 있게(0600) 기록됩니다.

### Homebrew (macOS 및 Linux) {#homebrew}

```bash
brew install qorechain/tap/qorel
qorel --version
```

### 컨테이너 {#container}

```bash
docker run --rm ghcr.io/qorechain/qorel:0.1.0 --version
docker run -d --name qorel --restart unless-stopped \
  -v $HOME/.qorel:/home/nonroot/.hermes \
  ghcr.io/qorechain/qorel:0.1.0 start
```

설정 파일(`config.toml`)과 `keys/` 폴더는 마운트한 디렉터리에서 읽습니다. 디렉터리의 소유자는 uid 65532이고 모드는 0700이어야 합니다.

실행하기 전에 이미지 서명을 검증하세요.

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### 소스에서 빌드 {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Rust 1.85, `protoc`, `clang`이 필요하며, Linux에서는 OpenSSL 헤더도 필요합니다. OpenSSL을 함께 컴파일하려면 `--features vendored-openssl`을 추가하세요.

### 동작 확인 {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help`는 키 명령 중에 `add`, `register-pqc`, `pqc-status`를 나열합니다.

## 접근 방법 {#how-to-access}

- **비용.** 무료이며 Apache-2.0입니다.
- **계정.** 설치에는 필요 없습니다. 릴레이하려면 각 체인에 릴레이어 계정이 필요합니다([빠른 시작](/qorel/quickstart) 참고).
- **네트워크 접근.** 호스트는 설정한 각 체인의 RPC, gRPC, WebSocket 엔드포인트에 대한 아웃바운드 접근이 필요합니다.
- **사전 요구 사항.** 패키지와 타르볼은 glibc 2.28 이상. 소스 빌드는 Rust 1.85, `protoc`, `clang`.

## 배포 위치 {#where-published}

| 채널 | 이름 | 버전 | 링크 |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`, `.deb`, `.rpm`, `SHA256SUMS` | 0.1.0 | [qorechain/QORel releases](https://github.com/qorechain/QORel/releases) |
| 다운로드 미러 | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| 컨테이너 레지스트리 | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| 소스 | `ibc-relayer-cli`, 바이너리 `qorel` | 태그 `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## 한계와 알려진 문제 {#limits}

- **Windows 빌드 없음.** WSL2에서 컨테이너를 사용하세요.
- **프리릴리스, 큰 파일.** 버전 0.1.0은 GitHub 프리릴리스로 게시됩니다. 바이너리가 아직 strip되지 않았기 때문에 릴리스 파일은 각각 약 110 MB입니다. Docker Hub 이미지는 없으니 위의 `ghcr.io` 이미지를 사용하세요.
- **버전 고정.** 위 명령은 `0.1.0`을 사용합니다. `latest` 대신 실행하려는 버전을 사용하고, 더 새로운 버전은 [릴리스 페이지](https://github.com/qorechain/QORel/releases)에서 확인하세요.
- **키당 프로세스 하나.** 같은 릴레이어 키로 패키지 서비스와 컨테이너를 함께 실행하지 마세요. 같은 키로 서명하는 두 프로세스는 계정 시퀀스를 두고 충돌합니다.
- **키 저장 위치.** 패키지는 키를 `/var/lib/qorel`에 보관하고, 컨테이너는 마운트한 디렉터리에서 읽으며, 타르볼 설치는 설정에서 `key_store_folder`를 지정하지 않는 한 `~/.hermes/keys`를 사용합니다.

다음: [빠른 시작](/qorel/quickstart), [설정](/qorel/configuration), [밸리데이터 옆에서 실행하기](/qorel/running-next-to-a-validator).
