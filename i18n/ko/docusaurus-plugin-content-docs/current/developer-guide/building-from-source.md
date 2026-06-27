---
slug: /developer-guide/building-from-source
title: 소스에서 빌드하기
sidebar_label: 소스에서 빌드하기
sidebar_position: 1
---

# 소스에서 빌드하기

이 가이드는 커뮤니티(오픈 코어) 빌드와 전체 프로프라이어터리 빌드를 모두 다루며, 소스에서 `qorechaind` 바이너리를 빌드하는 과정을 안내합니다.

## 사전 요구 사항

| 의존성         | 최소 버전           | 비고                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | 모든 빌드에 필요                           |
| **CGO**            | 활성화 (`CGO_ENABLED=1`) | PQC 및 SVM FFI 브리지에 필요              |
| **Rust toolchain** | 최신 안정 버전             | `libqorepqc` 및 `libqoresvm` 컴파일에 필요 |
| **Make**           | 3.81+                     | 빌드 자동화                                  |
| **Git**            | 2.x                       | 소스 체크아웃                                   |

환경을 확인하세요:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
모든 `go build`, `go test`, `go run` 호출에는 **반드시** `CGO_ENABLED=1`이 설정되어 있어야 합니다. PQC 및 SVM 모듈은 cgo가 필요한 FFI 브리지를 사용합니다.
:::

## 네이티브 라이브러리

QoreChain은 런타임에 로드되는 두 개의 Rust로 빌드된 네이티브 라이브러리에 의존합니다.

### libqorepqc (포스트 양자 암호화)

PQC 라이브러리는 C 호환 FFI 인터페이스를 통해 ML-DSA-87 (Dilithium-5) 키 생성, 서명, 검증을 제공합니다.

```bash
cd rust/qorepqc
cargo build --release
```

컴파일된 라이브러리는 `lib/{os}_{arch}/`에 배치됩니다:

| 플랫폼    | 라이브러리 파일       | 디렉터리           |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (SVM 런타임)

SVM 라이브러리는 x/svm 모듈을 위한 BPF 프로그램 실행 환경을 제공합니다.

```bash
cd rust/qoresvm
cargo build --release
```

출력은 위와 동일한 `lib/{os}_{arch}/` 규칙을 따릅니다(macOS에서는 `libqoresvm.dylib`, Linux에서는 `libqoresvm.so`).

### 라이브러리 경로 설정

네이티브 라이브러리는 런타임에 검색 가능해야 합니다. 사용 중인 플랫폼에 맞는 환경 변수를 설정하세요:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
팁: 세션 전반에 걸쳐 유지되도록 export를 셸 프로필(`~/.bashrc`, `~/.zshrc`)에 추가하세요.
:::

## 오픈 코어 아키텍처

QoreChain은 **오픈 코어** 모델을 따릅니다:

* **커뮤니티 빌드** — 모든 QoreChain 모듈(x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm 등)에 대한 전체 모듈 인터페이스, CLI 명령, protobuf 정의, 메시지 유형을 포함합니다. 프로프라이어터리 모듈의 keeper는 안전한 기본값 또는 no-op 응답을 반환하는 **스텁 구현**을 사용합니다. 이를 통해 서드파티 도구, 지갑, 인덱서가 프로프라이어터리 코드 없이 모든 QoreChain API와 통합할 수 있습니다.
* **전체(프로프라이어터리) 빌드** — `proprietary` 빌드 태그 뒤의 완전한 keeper 구현을 활성화합니다. 여기에는 실제 AI 이상 탐지 로직, PRISM 합의 파라미터 튜닝, 고급 평판 점수 산정, 그리고 모든 프로덕션급 기능이 포함됩니다.

두 빌드 모두 동일한 `qorechaind` 바이너리 이름을 생성하고 동일한 CLI 명령 및 gRPC/REST 엔드포인트를 노출합니다. 차이점은 해당 인터페이스 뒤에 있는 keeper 로직의 런타임 동작에 있습니다.

## 커뮤니티 빌드

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

이는 프로프라이어터리 기능을 위한 스텁 keeper와 함께 모든 공개 모듈 인터페이스를 컴파일합니다. 결과 바이너리는 다음에 대해 완전히 기능합니다:

* 밸리데이터 노드 실행
* 트랜잭션 제출 및 조회
* EVM, CosmWasm, SVM VM과의 상호작용
* 서드파티 통합 및 도구 구축
* 로컬 개발 및 테스트

## 전체 빌드 (프로프라이어터리)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

`-tags proprietary` 플래그는 전체 keeper 구현을 활성화하며, 이는 공개 소스 트리에 포함되어 있지 않습니다.

## 테스트 실행

```bash
CGO_ENABLED=1 go test ./... -count=1
```

`-count=1` 플래그는 테스트 캐싱을 비활성화하여 매번 깨끗한 실행을 보장합니다. 개별 패키지 테스트는 다음과 같이 실행할 수 있습니다:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Rust 라이브러리 테스트는 별도로 실행하세요:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## 빌드 검증

빌드가 성공한 후, 바이너리를 검증하세요:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

`init` 명령은 오류 없이 `~/.qorechaind/`에 제네시스 파일과 노드 구성을 생성해야 합니다. 위 예시는 **`qorechain-diana`** 테스트넷에 대해 초기화합니다. 메인넷의 경우, 체인 버전 **v3.1.77**을 실행하는 운영 중인 네트워크인 `--chain-id qorechain-vladi`로 대체하세요.

## Docker 빌드

컨테이너화된 빌드를 위해, 리포지토리 루트에 Dockerfile이 제공됩니다:

```bash
docker build -t qorechaind:latest .
```

Docker 이미지는 모든 네이티브 라이브러리 컴파일과 경로 구성을 자동으로 처리합니다. Docker Compose로 노드를 실행하려면 [빠른 시작](/getting-started/quickstart) 가이드를 참조하세요.

## 문제 해결

<details>

<summary>cgo: C compiler not found</summary>

Xcode CLI 도구(macOS) 또는 `build-essential`(Linux)을 설치하세요

</details>

<details>

<summary>cannot find -lqorepqc</summary>

먼저 Rust 라이브러리를 빌드하고 `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`를 설정하세요

</details>

<details>

<summary>undefined: sonic.*</summary>

`go.sum`이 최신 상태인지 확인하세요: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

사용 가능한 메모리를 늘리세요(낮은 제한이 설정된 Docker에서 흔히 발생)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

`pqcrypto v0.5.0+`를 사용하고 있는지 확인하세요 (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
