---
slug: /developer-guide/building-from-source
title: 소스에서 빌드하기
sidebar_label: 소스에서 빌드하기
sidebar_position: 1
---

# 소스에서 빌드하기

이 가이드는 공개 소스에서 커뮤니티 `qorechaind` 바이너리를 빌드하는 과정을 안내하고, 이 바이너리가 무엇을 위한 것이며 무엇을 위한 것이 아닌지를 설명합니다.

:::caution 소스 빌드로는 메인넷이나 테스트넷에 참여할 수 없습니다
공개 리포지토리에는 **스텁 keeper**와 함께 모듈 인터페이스가 들어 있으며, 합의에 필수적인 keeper 구현과 포스트 퀀텀 서명기는 공개 소스 트리에 포함되어 있지 않습니다. 이로부터 빌드한 바이너리는 네트워크의 합의 상태를 재현할 수 없으며, 모든 Cosmos 레인 트랜잭션이 요구하는 하이브리드 포스트 퀀텀 서명도 생성할 수 없습니다. v3.2.3부터는 `qorechain-vladi` 또는 `qorechain-diana`에서 **시작 자체를 거부**합니다(체인 ID와 제네시스 시간으로 이 네트워크들을 인식하며, 공개 체인 ID를 재사용하되 자체 제네시스를 쓰는 로컬 데브넷은 영향을 받지 않습니다). `qorechaind start --community-unenforced-pqc`는 실험을 위해 이 거부를 무시하게 하지만, 이 경우 노드는 포스트 퀀텀 서명을 전혀 검증하지 않으며 경고 없이 네트워크와 분기될 수 있으므로, 의존하는 노드에는 절대 사용하지 마세요. 메인넷이나 테스트넷에서 노드 또는 밸리데이터를 실행하려면, 라이브 매니페스트(`https://download.qore.host/mainnet/latest.json` 또는 `.../testnet/latest.json`)에 명시된 **릴리스 바이너리**를 설치하세요. [노드 실행하기](/developer-guide/running-a-node)와 [밸리데이터 실행하기](/developer-guide/running-a-validator)를 참고하세요.
:::

## 사전 요구 사항

| 의존성         | 최소 버전           | 비고                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | 모든 빌드에 필요                           |
| **CGO**            | 활성화 (`CGO_ENABLED=1`) | PQC 및 SVM FFI 브리지에 필요              |
| **Make**           | 3.81+                     | 빌드 자동화                                  |
| **Git**            | 2.x                       | 소스 체크아웃                                   |

환경을 확인하세요:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
모든 `go build`, `go test`, `go run` 호출에는 **반드시** `CGO_ENABLED=1`이 설정되어 있어야 합니다. 노드는 cgo를 통해 네이티브 라이브러리(QoreChain Native 런타임, 그리고 릴리스 빌드에서는 PQC 및 SVM 라이브러리)를 링크합니다.
:::

## 네이티브 라이브러리

### libqorepqc 및 libqoresvm

포스트 퀀텀(`libqorepqc`) 및 SVM(`libqoresvm`) 라이브러리는 **공개 리포지토리에 포함되지 않은** Rust 소스로 빌드됩니다(`qorechain-core`에는 `rust/` 디렉터리가 없습니다). 커뮤니티 빌드에는 이들이 필요하지 않습니다. 네트워크용 릴리스 아카이브에는 컴파일된 라이브러리(`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`)가 `qorechaind` 옆의 `lib/` 디렉터리에 함께 들어 있습니다. 이를 `lib/{os}_{arch}/`에 배치하거나, 아래와 같이 로더가 해당 위치를 가리키도록 설정하세요.

### 라이브러리 경로 설정

릴리스 바이너리를 사용할 때는 그 공유 라이브러리가 런타임에 검색 가능해야 합니다. 사용 중인 플랫폼에 맞는 환경 변수를 설정하세요:

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
* **전체 빌드** — 완전한 keeper 구현(합의에 필수적인 실제 모듈 로직과 포스트 퀀텀 서명기)을 포함합니다. [download.qore.host](https://download.qore.host)에 게시되는 릴리스 바이너리로 배포되며, 공개 소스 트리에서 빌드되지 않습니다.

두 빌드 모두 동일한 `qorechaind` 바이너리 이름을 생성하고 동일한 CLI 명령을 노출합니다. 차이점은 해당 인터페이스 뒤에 있는 keeper 로직의 런타임 동작에 있습니다.

## 커뮤니티 빌드

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

이는 프로프라이어터리 기능을 위한 스텁 keeper와 함께 모든 공개 모듈 인터페이스를 컴파일합니다. 결과 바이너리는 다음 용도로 사용하도록 만들어졌습니다:

* 로컬 개발 및 테스트(예: 단일 노드 데브넷)
* 네트워크 조회(`query ...` 명령은 모든 노드에 대해 작동)
* 모듈 인터페이스에 맞춘 서드파티 통합 및 도구 구축

이는 밸리데이터로서 메인넷이나 테스트넷에 참여하거나 그곳에서 트랜잭션을 보내는 방법이 아닙니다. 포스트 퀀텀 서명기가 없으며(`tx pqc gen-key`와 `tx pqc cosign`은 오류를 반환합니다), 스텁 keeper는 네트워크의 합의 규칙을 재현하지 않기 때문입니다.

## 전체 빌드 (릴리스 바이너리)

전체 keeper 구현과 `tx pqc gen-key` 및 `tx pqc cosign` 뒤의 서명기는 공개 소스 트리에 없으므로, 이로부터 빌드할 수 없습니다. [download.qore.host](https://download.qore.host)에 게시된 바이너리가 전체 빌드이며, 메인넷과 테스트넷에는 이를 사용하세요.

## 테스트 실행

```bash
CGO_ENABLED=1 go test ./... -count=1
```

`-count=1` 플래그는 테스트 캐싱을 비활성화하여 매번 깨끗한 실행을 보장합니다. 개별 패키지 테스트는 다음과 같이 실행할 수 있습니다:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

네이티브 라이브러리나 프로프라이어터리 keeper를 사용하는 테스트는 전체 빌드에만 컴파일되며 공개 테스트 스위트에는 포함되지 않습니다.

## 빌드 검증

빌드가 성공한 후, 바이너리를 검증하세요:

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

`init` 명령은 오류 없이 `~/.qorechaind/`에 제네시스 파일과 노드 구성을 생성해야 합니다. 위 예시는 **`qorechain-diana`** 테스트넷에 대해 초기화합니다. 메인넷의 경우, 운영 중인 네트워크인 `--chain-id qorechain-vladi`로 대체하세요(노드 릴리스 **v3.2.4**).

## Docker 빌드

리포지토리 루트에 Dockerfile이 제공됩니다:

```bash
docker build -t qorechaind:community .
```

이는 **커뮤니티** 바이너리를 빌드하므로(자체 주석에 "Public build — no PQC library"라고 적혀 있습니다), 이 이미지는 로컬 개발과 도구용이며 메인넷이나 테스트넷을 따라가기 위한 것이 아닙니다. Docker에서 네트워크 노드를 실행하려면 대신 릴리스 바이너리를 감싸세요. [노드 실행하기](/developer-guide/running-a-node#docker-compose)를 참고하세요.

## 문제 해결

<details>

<summary>cgo: C compiler not found</summary>

Xcode CLI 도구(macOS) 또는 `build-essential`(Linux)을 설치하세요

</details>

<details>

<summary>cannot find -lqorepqc</summary>

네이티브 라이브러리를 필요로 하는 빌드를 링크하고 있습니다. 커뮤니티 빌드(이 라이브러리가 필요 없음) 또는 이를 함께 번들한 릴리스 아카이브를 사용하고, `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`를 해당 `lib/` 디렉터리로 설정하세요

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

ML-DSA-87의 크기는 공개 키 2,592바이트, 비밀 키 4,896바이트, 서명 4,627바이트입니다. 그 외의 크기는 다른 알고리즘이거나 잘린 값을 의미합니다.

</details>
