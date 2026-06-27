---
slug: /light-node/sx-edition
title: SX 에디션 (서버 데몬)
sidebar_label: SX 에디션
sidebar_position: 2
---

# SX 에디션 — 서버 데몬

**SX (Server eXperience)** 에디션은 헤드리스 라이트 노드입니다: 데몬과 전체 관리 CLI로 구성되며 서버 및 자동화를 위해 만들어졌습니다. 바이너리는 `lightnode-sx`입니다. 이는 라이트 노드의 **v3.1.1** 계열입니다(체인 버전과는 별개인 자체 버전).

## 설치

소스에서 바이너리를 빌드하거나 Docker로 실행할 수 있습니다.

### 소스에서 빌드

라이트 노드는 **Go 1.26.1**이 필요하며, 포스트 양자 암호화가 네이티브 라이브러리(`libqorepqc`)를 사용하기 때문에 CGO를 활성화하여 빌드합니다.

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

이는 `build/lightnode-sx`를 생성합니다. 직접 실행하거나 `PATH`에 복사하세요.

### Docker

Docker 설정이 제공됩니다. SX 서비스는 `Dockerfile.sx`에서 빌드됩니다:

```bash
docker compose up lightnode-sx
```

SX 컨테이너는 `/root/.qorechain-lightnode`에 마운트된 명명된 볼륨에 데이터를 영속화하며, `QORECHAIN_RPC_ADDR` 환경 변수에서 체인 RPC 주소를 읽습니다.

## 구성

라이트 노드는 TOML 설정 파일을 읽습니다. 기본적으로 홈 디렉터리(`~/.qorechain-lightnode/config.toml`)에서 `config.toml`을 찾습니다. 보통 이 파일을 직접 작성하지는 않으며 — [`onboard` 마법사](#first-run-onboard)가 대신 생성해 줍니다 — 하지만 옵션을 이해하는 것은 유용합니다.

두 개의 영속 플래그가 모든 명령에 적용됩니다:

- `--config <path>` — 기본이 아닌 위치의 설정 파일을 지정합니다.
- `--home <dir>` — 데이터와 키에 사용되는 홈 디렉터리를 재정의합니다(기본값은 `~/.qorechain-lightnode`).

사용 수준에서 가장 관련성 높은 구성 옵션:

| 옵션 | 제어하는 내용 |
| --- | --- |
| `chain_id` | 네트워크 식별자(예: 테스트넷의 `qorechain-diana`, 메인넷의 `qorechain-vladi`). |
| `rpc_addr` | 데몬이 연결하는 체인 RPC 엔드포인트. **로컬 전용 모드**로 실행하려면 비워 두세요. |
| `primary_addr` / `witness_addrs` | 스키핑 라이트 클라이언트가 사용하는 프라이머리 및 위트니스 RPC 엔드포인트. |
| `trust_period` / `max_clock_drift` | 라이트 클라이언트 신뢰 윈도우(예: `168h`)와 허용되는 클록 드리프트. |
| `data_dir` | 노드가 데이터베이스와 헤더를 저장하는 위치. |
| `keyring_backend` / `key_name` | 키링 백엔드(`file` 또는 `os`)와 운영자 키 이름. |
| `[delegation]` | 자동 복리 켜기/끄기, 복리 간격, 청구 최소 보상, 검증자 집합, 분할 가중치, 리밸런싱, 최소 평판. |
| `[telemetry]` | 텔레메트리 활성화 여부와 검증자, 네트워크, 브리지, 토크노믹스의 새로 고침 간격. |
| `log_level` / `log_format` | 로깅 상세 수준(`debug`, `info`, `warn`, `error`)과 형식(`text` 또는 `json`). |

위임 기본값은 `1h` 간격의 자동 복리와 평판 인식 리밸런싱을 활성화합니다 — 이들이 무엇을 하는지는 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요.

## 첫 실행: `onboard` {#first-run-onboard}

첫 실행 시, 설정 파일이 아직 없으면 `start`는 중단하고 온보딩 마법사로 안내합니다. 마법사를 실행하세요:

```bash
build/lightnode-sx onboard
```

`onboard`는 네 단계로 설정을 안내합니다:

1. **PQC 셀프 테스트** — 전체 Dilithium-5 라운드트립을 실행합니다([`selftest`](#verify-the-pqc-stack-selftest)와 동일한 검사). PQC 스택이 실패하면 마법사는 계속 진행하기를 거부합니다.
2. **체인 RPC 엔드포인트** — QoreChain RPC URL을 붙여넣거나, 체인 연결이 필요하지 않은 동안 **로컬 전용 모드**로 실행하려면 비워 두세요. URL을 제공하면 마법사가 도달 가능성을 실시간으로 테스트합니다.
3. **검증자 개인 키** — 16진수로 인코딩된 Dilithium-5 개인 키를 붙여넣거나, `g`(또는 `generate`)를 입력하여 이 노드에서 새 키 쌍을 생성하세요.
4. **저장** — `config.toml`을 작성하고 키를 키링에 저장합니다.

:::note 로컬 전용 모드
엔드포인트를 비워 두면 데몬은 로컬 전용 모드로 시작합니다: PQC 스택은 완전히 동작하지만, 노드는 어떤 체인도 동기화하지 않습니다. 체인 엔드포인트가 준비되면 `onboard`를 다시 실행하여 노드가 이를 가리키도록 하세요.
:::

`onboard`는 항상 활성 설정을 덮어씁니다. 기본이 아닌 경로에 작성하려면 `--config`를, 프롬프트 대신 빠르게 실패하려면 `--non-interactive`를 사용하세요(CI에서 유용함).

## 실행: `start`

온보딩이 설정을 작성한 후 데몬을 시작하세요:

```bash
build/lightnode-sx start
```

데몬은 헤더를 동기화하고, 위임을 추적하며, 중단될 때까지 텔레메트리를 제공합니다. 설정 파일 없이(로컬 전용, 체인 RPC 없음) 의도적으로 시작하려면 `--skip-onboarding-check`를 전달하세요.

## PQC 스택 검증: `selftest` {#verify-the-pqc-stack-selftest}

언제든지 포스트 양자 스택이 기능하는지 확인할 수 있습니다:

```bash
lightnode-sx selftest
```

`selftest`는 Dilithium-5 (ML-DSA-87)에 대해 다섯 가지 검사를 실행하며 1초 이내에 완료됩니다:

1. **Keygen** — 새 키 쌍을 생성합니다.
2. **Sign** — 테스트 메시지에 서명합니다.
3. **Verify (valid sig)** — 일치하는 공개 키로 서명이 검증되는지 확인합니다.
4. **Reject tampered signature** — 서명의 한 바이트를 뒤집습니다. 검증은 이를 거부해야 합니다.
5. **Reject tampered message** — 메시지의 한 바이트를 뒤집습니다. 검증은 이를 거부해야 합니다.

어느 검사라도 실패하면 바이너리는 진단 출력과 함께 0이 아닌 값으로 종료합니다. 이는 온보딩 마법사가 첫 단계로 실행하는 것과 동일한 테스트이며, 배포 전 검증과 지원 진단에 유용합니다.

## 관리 명령

SX CLI에는 노드 상태를 검사하고 키를 관리하는 명령이 포함되어 있습니다:

| 명령 | 목적 |
| --- | --- |
| `status` | 노드 및 라이트 클라이언트 동기화 상태 표시(체인 ID, 최신 높이, 따라잡기 상태). |
| `keys create <name>` | 새 Dilithium-5 키를 생성합니다. |
| `keys list` | 키링의 키를 나열합니다. |
| `keys import <name> <hex-privkey>` | 16진수로 인코딩된 개인 키를 가져옵니다. |
| `keys export <name>` | 개인 키를 16진수로 내보냅니다. |
| `register` | 이 노드의 온체인 등록 명령을 출력합니다 — [등록 및 라이선싱](/light-node/registration-and-licensing)을 참고하세요. |
| `validators` | 본딩된 검증자를 나열합니다. |
| `delegation` | 로컬 데이터베이스의 현재 위임을 표시합니다. |
| `rewards` | 대기 중인 스테이킹 보상을 표시합니다. |
| `network` | 로컬 데이터베이스의 네트워크 텔레메트리(최근 동기화된 헤더)를 표시합니다. |
| `version` | 바이너리 버전을 출력합니다. |

스테이킹, 보상, 모니터링 세부 사항은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요. 온체인 등록에 대해서는 [등록 및 라이선싱](/light-node/registration-and-licensing)을 참고하세요.
