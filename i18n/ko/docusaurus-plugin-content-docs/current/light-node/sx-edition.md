---
slug: /light-node/sx-edition
title: SX 에디션 (서버 데몬)
sidebar_label: SX 에디션
sidebar_position: 2
---

# SX 에디션 — 서버 데몬

**SX(Server eXperience)** 에디션은 헤드리스 라이트 노드입니다. 데몬과 완전한 관리 CLI로 구성되며, 서버 환경과 자동화를 위해 만들어졌습니다. 바이너리 이름은 `lightnode-sx`입니다. 이는 라이트 노드 자체의 **v3.1.1** 버전 라인이며, 체인 버전과는 별개입니다.

## 설치

미리 빌드된 바이너리를 사용하는 것이 가장 쉬운 방법입니다 — 라이트 노드 클라이언트는 **네이티브 의존성 없이 다섯 개 플랫폼**에서 네이티브로 실행됩니다: Linux(amd64, arm64), macOS(Intel, Apple Silicon), Windows(amd64, arm64). 각 바이너리는 약 16MB이며, 다운로드해서 바로 실행하면 됩니다. 별도로 설치해야 할 라이브러리가 없습니다.

소스에서 바이너리를 직접 빌드하거나 Docker로 실행할 수도 있습니다.

### 소스에서 빌드

라이트 노드는 **Go 1.26.1**을 필요로 합니다. 이 노드의 양자내성 암호(post-quantum cryptography)는 순수 Go로 구현되어 있어(CGO 없음, 네이티브 라이브러리 없음), 다섯 개 지원 플랫폼 중 어느 곳으로 크로스 컴파일하더라도 다른 Go 바이너리와 동일한 방식으로 동작합니다.

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

이 명령은 `build/lightnode-sx`를 생성합니다. 바로 실행하거나 `PATH`에 복사해서 사용하세요. 등록하기 전에 [`selftest`](#verify-the-pqc-stack-selftest)로 양자내성 서명 스택이 정상인지 먼저 점검하시기 바랍니다.

### Docker

Docker 설정도 제공됩니다. SX 서비스는 `Dockerfile.sx`로 빌드됩니다.

```bash
docker compose up lightnode-sx
```

SX 컨테이너는 `/root/.qorechain-lightnode`에 마운트된 네임드 볼륨에 데이터를 저장하며, 체인 RPC 주소는 `QORECHAIN_RPC_ADDR` 환경 변수에서 읽어옵니다.

## 설정

라이트 노드는 TOML 설정 파일을 읽습니다. 기본적으로 홈 디렉터리(`~/.qorechain-lightnode/config.toml`)에서 `config.toml`을 찾습니다. 이 파일을 직접 작성할 필요는 보통 없습니다 — [`onboard` 마법사](#first-run-onboard)가 대신 생성해 줍니다 — 하지만 옵션들을 이해해 두는 것이 유용합니다.

모든 명령에 공통으로 적용되는 두 개의 영속 플래그가 있습니다.

- `--config <path>` — 기본 위치가 아닌 곳의 설정 파일을 지정합니다.
- `--home <dir>` — 데이터와 키에 사용되는 홈 디렉터리를 재지정합니다(기본값은 `~/.qorechain-lightnode`).

사용 수준에서 가장 관련 있는 설정 옵션은 다음과 같습니다.

| 옵션 | 제어하는 항목 |
| --- | --- |
| `chain_id` | 네트워크 식별자(예: 테스트넷은 `qorechain-diana`, 메인넷은 `qorechain-vladi`). |
| `rpc_addr` | 데몬이 연결하는 체인 RPC 엔드포인트. 비워 두면 **로컬 전용 모드**로 동작합니다. |
| `primary_addr` / `witness_addrs` | 스키핑 라이트 클라이언트가 사용하는 primary 및 witness RPC 엔드포인트. |
| `trust_period` / `max_clock_drift` | 라이트 클라이언트 신뢰 구간(예: `168h`)과 허용 시계 편차(clock drift). |
| `data_dir` | 노드가 데이터베이스와 헤더를 저장하는 위치. |
| `keyring_backend` / `key_name` | 키링 백엔드(`file` 또는 `os`)와 운영자 키 이름. |
| `[delegation]` | 자동 복리 사용 여부, 복리 주기, 청구 최소 보상, 검증인 세트, 분배 가중치, 리밸런싱, 최소 평판. |
| `[telemetry]` | 텔레메트리 사용 여부와 검증인·네트워크·브리지·토크노믹스에 대한 갱신 주기. |
| `log_level` / `log_format` | 로그 상세도(`debug`, `info`, `warn`, `error`)와 형식(`text` 또는 `json`). |

Delegation 기본값은 `1h` 주기의 자동 복리와 평판 인지 리밸런싱을 활성화합니다 — 이 항목들의 동작 방식은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요.

## 최초 실행: `onboard` {#first-run-onboard}

최초 실행 시, 아직 설정 파일이 없으면 `start`는 실행을 멈추고 온보딩 마법사를 안내합니다. 다음과 같이 마법사를 실행하세요.

```bash
build/lightnode-sx onboard
```

`onboard`는 네 단계로 설정을 안내합니다.

1. **PQC 자체 테스트** — Dilithium-5 전체 라운드트립을 실행합니다([`selftest`](#verify-the-pqc-stack-selftest)와 동일한 점검). PQC 스택이 실패하면 마법사는 진행을 거부합니다.
2. **체인 RPC 엔드포인트** — QoreChain RPC URL을 붙여넣거나, 체인 연결이 필요 없다면 비워 두고 **로컬 전용 모드**로 실행할 수 있습니다. URL을 입력하면 마법사가 즉시 접속 가능 여부를 테스트합니다.
3. **검증인 개인 키** — 16진수로 인코딩된 Dilithium-5 개인 키를 붙여넣거나, `g`(또는 `generate`)를 입력해 이 노드에서 새 키쌍을 생성합니다.
4. **저장** — `config.toml`을 작성하고 키를 키링에 저장합니다.

:::note 로컬 전용 모드
엔드포인트를 비워 두면 데몬은 로컬 전용 모드로 시작합니다. PQC 스택은 완전히 검증되지만, 노드는 어떤 체인도 동기화하지 않습니다. 체인 엔드포인트가 준비되면 `onboard`를 다시 실행해 노드를 해당 엔드포인트로 연결하세요.
:::

`onboard`는 항상 현재 활성 설정을 덮어씁니다. 기본 경로가 아닌 곳에 쓰려면 `--config`를 사용하고, 프롬프트 없이 바로 실패하게 하려면(CI에서 유용) `--non-interactive`를 사용하세요.

## 실행: `start`

온보딩이 설정 파일을 작성했다면, 다음 명령으로 데몬을 시작합니다.

```bash
build/lightnode-sx start
```

데몬은 중단될 때까지 헤더를 동기화하고, 위임(delegation)을 추적하며, 텔레메트리를 제공합니다. 설정 파일 없이(로컬 전용, 체인 RPC 없이) 의도적으로 시작하려면 `--skip-onboarding-check`를 전달하세요.

## PQC 스택 검증: `selftest` {#verify-the-pqc-stack-selftest}

언제든지 다음 명령으로 양자내성 스택이 정상 작동하는지 확인할 수 있습니다.

```bash
lightnode-sx selftest
```

`selftest`는 Dilithium-5(ML-DSA-87)에 대해 다섯 가지 점검을 수행하며 1초 이내에 완료됩니다.

1. **키 생성(Keygen)** — 새 키쌍을 생성합니다.
2. **서명(Sign)** — 테스트 메시지에 서명합니다.
3. **검증(유효한 서명)** — 일치하는 공개 키로 서명이 검증되는지 확인합니다.
4. **변조된 서명 거부** — 서명의 한 바이트를 뒤집습니다. 검증은 반드시 이를 거부해야 합니다.
5. **변조된 메시지 거부** — 메시지의 한 바이트를 뒤집습니다. 검증은 반드시 이를 거부해야 합니다.

점검 중 하나라도 실패하면 바이너리는 진단 출력과 함께 0이 아닌 코드로 종료됩니다. 이는 온보딩 마법사가 첫 단계로 실행하는 것과 동일한 테스트이며, 배포 전 검증과 지원 진단에 유용합니다.

## 관리 명령

SX CLI에는 노드 상태를 확인하고 키를 관리하기 위한 명령들이 포함되어 있습니다.

| 명령 | 목적 |
| --- | --- |
| `status` | 노드와 라이트 클라이언트의 동기화 상태(체인 ID, 최신 높이, 캐치업 상태)를 표시합니다. |
| `keys create <name>` | 새 Dilithium-5 키를 생성합니다. |
| `keys list` | 키링에 있는 키 목록을 표시합니다. |
| `keys import <name> <hex-privkey>` | 16진수로 인코딩된 개인 키를 가져옵니다. |
| `keys export <name>` | 개인 키를 16진수로 내보냅니다. |
| `register` | 이 노드에 대한 온체인 등록 명령을 출력합니다 — [등록 및 라이선스](/light-node/registration-and-licensing) 참고. |
| `validators` | 본딩된 검증인 목록을 표시합니다. |
| `delegation` | 로컬 데이터베이스에서 현재 위임 내역을 표시합니다. |
| `rewards` | 대기 중인 스테이킹 보상을 표시합니다. |
| `network` | 로컬 데이터베이스에서 네트워크 텔레메트리(최근 동기화된 헤더)를 표시합니다. |
| `version` | 바이너리 버전을 출력합니다. |

스테이킹, 보상, 모니터링 관련 세부 내용은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요. 온체인 등록 방법은 [등록 및 라이선스](/light-node/registration-and-licensing)를 참고하세요.
