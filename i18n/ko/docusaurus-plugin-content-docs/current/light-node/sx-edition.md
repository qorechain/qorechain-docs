---
slug: /light-node/sx-edition
title: SX 에디션 (서버 데몬)
sidebar_label: SX 에디션
sidebar_position: 2
---

# SX 에디션 — 서버 데몬

**SX(Server eXperience)** 에디션은 헤드리스 라이트 노드입니다. 데몬과 완전한 관리 CLI로 구성되며, 서버 환경과 자동화를 위해 만들어졌습니다. 바이너리 이름은 `lightnode-sx`입니다. 이는 미리 빌드된 바이너리 기준 라이트 노드의 **v3.1.3** 버전 라인이며(Docker 빌드용 소스 태그는 `v3.1.4`), 체인 버전과는 별개인 자체 버전입니다.

## 설치 {#install}

미리 빌드된 바이너리를 사용하는 것이 가장 쉬운 방법입니다 — 라이트 노드 클라이언트는 **네이티브 의존성 없이 여섯 개 플랫폼**에서 네이티브로 실행됩니다: Linux(amd64, arm64), macOS(Intel, Apple Silicon), Windows(amd64, arm64) — SX와 UX 에디션을 합쳐 총 12개의 바이너리입니다. 각 바이너리는 약 11–12MB이며, 다운로드해서 바로 실행하면 됩니다. 별도로 설치해야 할 라이브러리가 없습니다.

**실행 전에 체크섬을 검증하세요.** `https://download.qore.host/<net>/lightnode/latest.json`의 릴리스 매니페스트에는 모든 바이너리에 대한 `sha256` 값, 전체 릴리스에 대한 `SHA256SUMS` 파일을 가리키는 `checksums.url`, 그리고 그 파일 자체의 `checksums.sha256`이 담겨 있습니다. 다운로드한 파일을 직접 검증하세요 — 이는 부차적인 절차가 아니라, 실제로 빌드된 바이너리를 실행하는 것과 해당 URL에 어쩌다 존재하는 무언가를 실행하는 것의 차이를 가르는 절차입니다.

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Windows에서는 `certutil -hashfile lightnode-sx-<platform>.exe SHA256`의 결과를 매니페스트 값과 비교하세요. 현재 두 네트워크 모두 동일한 v3.1.3 빌드를 제공합니다. 소스는 `github.com/qorechain/qorechain-lightnode`에 공개되어 있습니다(Apache 2.0).

소스에서 바이너리를 직접 빌드하거나 Docker로 실행할 수도 있습니다.

### 소스에서 빌드

라이트 노드는 **Go 1.26.1**을 필요로 합니다. 이 노드의 양자내성 암호(post-quantum cryptography)는 순수 Go로 구현되어 있어(CGO 없음, 네이티브 라이브러리 없음), 여섯 개 지원 플랫폼 중 어느 곳으로 크로스 컴파일하더라도 다른 Go 바이너리와 동일한 방식으로 동작합니다.

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

이 명령은 `build/lightnode-sx`를 생성합니다. 바로 실행하거나 `PATH`에 복사해서 사용하세요. 등록하기 전에 [`selftest`](#verify-the-pqc-stack-selftest)로 양자내성 서명 스택이 정상인지 먼저 점검하시기 바랍니다.

### Docker {#docker}

미리 빌드된 레지스트리 이미지는 없으며, 소스 태그에서 직접 빌드합니다. 태그는 **`v3.1.4` 이상**을 사용하세요. `v3.1.3`으로 빌드한 이미지에는 체인이 이제 거부하는 구버전 `qorechaind` 서명기가 포함되어 있어 하트비트와 보상 청구가 실패합니다. 기존 설치를 업데이트하려면 새 태그에서 다시 빌드하세요(`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`). pull만으로는 아무것도 바뀌지 않습니다.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

모든 `docker compose` 명령에서 `QORECHAIN_RPC_ADDR`를 export된 상태로 유지하세요. 이 값은 설정의 `rpc_addr`를 덮어쓰며, compose 기본값은 `host.docker.internal:26657`을 가리킵니다. SX 컨테이너는 `/root/.qorechain-lightnode`에 마운트된 네임드 볼륨에 데이터를 저장합니다.

이미지에는 릴리스된 `qorechaind`(v3.2.0, linux/amd64)도 포함되어 있습니다. 빌드 시 릴리스 채널에서 내려받아 고정된 다이제스트와 대조해 검증합니다. 데몬은 이를 구동하여 하트비트와 보상 청구에 서명하므로, 별도 설치 없이도 컨테이너 노드가 체인에서 활성 상태를 유지할 수 있습니다. 이후 네트워크가 번들 서명기를 거부하는 버전으로 업그레이드되면, `[heartbeat] qorechaind_path`를 해당 네트워크 매니페스트(`https://download.qore.host/<net>/latest.json`)에 나열된 더 새로운 `qorechaind`로 지정하세요. arm64 호스트(예: Apple Silicon)에서는 빌드에 서명기가 포함되지 않으므로, 필요하다면 `DOCKER_DEFAULT_PLATFORM=linux/amd64`로 빌드하세요. 서명기는 운영자 지갑이 필요합니다. `qorechaind` 홈(운영자 키가 들어 있는 키링과 `pqc/<key_name>.dilithium`으로 내보낸 노드 키)을 `/root/.qorechaind`에 마운트하세요. `docker-compose.yml`은 기본적으로 `~/.qorechaind`를 마운트하며, `QORECHAIND_HOME`으로 지정할 수도 있습니다. 두 패스프레이즈는 노드 키링의 것과 `qorechaind` 키링의 것이며, 후자는 stdin을 통해 `qorechaind`로 전달되고 명령줄에는 나타나지 않습니다. [운영자 지갑](#operator-wallet)을 참고하세요.

## 설정

라이트 노드는 TOML 설정 파일을 읽습니다. 기본적으로 홈 디렉터리(`~/.qorechain-lightnode/config.toml`)에서 `config.toml`을 찾습니다. 이 파일을 직접 작성할 필요는 보통 없습니다 — [`onboard` 마법사](#first-run-onboard)가 대신 생성해 줍니다 — 하지만 옵션들을 이해해 두는 것이 유용합니다.

모든 명령에 공통으로 적용되는 두 개의 영속 플래그가 있습니다.

- `--config <path>` — 기본 위치가 아닌 곳의 설정 파일을 지정합니다.
- `--home <dir>` — 데이터와 키에 사용되는 홈 디렉터리를 재지정합니다(기본값은 `~/.qorechain-lightnode`).

사용 수준에서 가장 관련 있는 설정 옵션은 다음과 같습니다.

| 옵션 | 제어하는 항목 |
| --- | --- |
| `chain_id` | 네트워크 식별자(예: 테스트넷은 `qorechain-diana`, 메인넷은 `qorechain-vladi`). `onboard`가 `qorechain-diana`로 남겨 두므로 그 이후 직접 설정하세요. 서명기가 이 값을 사용합니다. |
| `rpc_addr` | 데몬이 연결하는 체인 RPC 엔드포인트. 비워 두면 **로컬 전용 모드**로 동작합니다. |
| `primary_addr` / `witness_addrs` | primary RPC 엔드포인트와, 이 노드가 보고하는 헤더를 대조 검증하는 데 사용되는 witness 엔드포인트 — [왜 라이트 노드를 운영하는가](/light-node/overview#why-run-a-light-node) 참고. `assurance` 값(디버그 레벨로 로그에 기록됨)이 `trusted-single-source`에서 `corroborated-across-sources`로 바뀌려면 서로 구별되고 접근 가능한 witness가 최소 하나 있어야 합니다. |
| `trust_period` / `max_clock_drift` | 호환성을 위해 허용되지만 현재는 사용되지 않습니다. 헤더 신뢰는 위에서 설명한 primary/witness 대조 검증에서 나옵니다. |
| `data_dir` | 노드가 데이터베이스와 헤더를 저장하는 위치. |
| `keyring_backend` / `key_name` | 키링 백엔드(`file`, `os`, 또는 로컬 데브넷 전용 `test`)와 노드의 양자내성 키 이름. `file` 백엔드는 환경에 `QORE_LIGHTNODE_KEYRING_PASSPHRASE`가 있어야 합니다. |
| `operator_address` | 이 노드가 속한 계정(`qor1...`)이며, 로드 시 검증됩니다. `register`, `status`, 하트비트에 필요합니다. [운영자 지갑](#operator-wallet)을 참고하세요. |
| `api_addr` | REST 엔드포인트. 비어 있으면 `rpc_addr`에서 파생됩니다(포트 26657은 1317로, `rpc.` 호스트는 `api.`로 바뀜). 따라서 두 규칙 모두 따르지 않는 엔드포인트에만 필요합니다. |
| `[heartbeat]` | 기본적으로 켜져 있습니다. `qorechaind_path`(비어 있으면 `PATH`의 `qorechaind`; Docker 이미지에 포함됨), `qorechaind_home`(비어 있으면 `~/.qorechaind`), `key_name`(`qorechaind` 계정 키. 기본값은 최상위 `key_name`), `interval_blocks`(체인의 `heartbeat_interval`인 1000과 일치시킬 것), `check_interval`(기본값 `60s`), `fees`(기본값 `50000uqor`), `gas`(기본값 `300000`). |
| `[delegation]` | `auto_claim`(기본값은 꺼짐: 서명기를 통해 누적된 라이트 노드 보상을 운영자 지갑으로 청구하며, 노드는 서버에서 재위임을 하지 않습니다), 확인 주기, 청구 최소 보상, `rebalance_enabled`, `min_reputation`(평판 알림 전용 — 노드는 스테이크를 절대 옮기지 않습니다). `validators`와 `split_weights`는 허용되지만 현재는 동작에 반영되지 않습니다. |
| `[telemetry]` | 텔레메트리 사용 여부와 검증인·네트워크·브리지·토크노믹스에 대한 갱신 주기. |
| `log_level` / `log_format` | 로그 상세도(`debug`, `info`, `warn`, `error`)와 형식(`text` 또는 `json`). |

### 환경 변수 {#environment-variables}

| 변수 | 용도 |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | 노드 키링의 패스프레이즈(`keyring_backend = "file"`). 필수이며, 노드는 빈 값을 거부합니다. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | 운영자 키가 들어 있는 `qorechaind` 키링의 패스프레이즈. stdin을 통해 `qorechaind`로 전달되며 명령줄에는 나타나지 않습니다. |
| `QORECHAIN_RPC_ADDR` | `rpc_addr`를 덮어씁니다(`primary_addr`가 `rpc_addr`와 같았다면 이것도 덮어씁니다). `docker-compose.yml`이 설정합니다. |

:::note witness 엔드포인트는 시작 시 검증됩니다
primary와 동일한 호스트에 있는 witness는 거부됩니다 — 손상된 엔드포인트라면 스스로에게 동의할 뿐이므로 아무것도 대조 검증하지 못하기 때문입니다. 원격 호스트의 평문 `http://` witness 역시 거부됩니다. 해당 연결을 재작성할 수 있는 공격자라면 모든 witness인 척 응답할 수 있기 때문입니다. 루프백 `http://`는 문제없습니다. witness는 독립적으로 신뢰할 근거가 있는 RPC 엔드포인트를 가리키도록 지정하세요.
:::

Delegation 기본값은 평판 인지 리밸런싱 알림을 활성화하고 `auto_claim`은 꺼 둡니다 — 이 항목들의 동작 방식은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요.

## 최초 실행: `onboard` {#first-run-onboard}

최초 실행 시, 아직 설정 파일이 없으면 `start`는 실행을 멈추고 온보딩 마법사를 안내합니다. 다음과 같이 마법사를 실행하세요.

```bash
build/lightnode-sx onboard
```

`onboard`는 네 단계로 설정을 안내합니다.

1. **PQC 자체 테스트** — Dilithium-5 전체 라운드트립을 실행합니다([`selftest`](#verify-the-pqc-stack-selftest)와 동일한 점검). PQC 스택이 실패하면 마법사는 진행을 거부합니다.
2. **체인 RPC 엔드포인트** — QoreChain RPC URL을 붙여넣거나, 체인 연결이 필요 없다면 비워 두고 **로컬 전용 모드**로 실행할 수 있습니다. URL을 입력하면 마법사가 즉시 접속 가능 여부를 테스트합니다.
3. **노드 키** — 마법사는 이를 "검증인 개인 키"라고 부르지만, 검증인 키가 아니라 라이트 노드 자체의 Dilithium-5 키입니다. 16진수로 인코딩된 Dilithium-5 개인 키를 붙여넣거나, `g`(또는 `generate`)를 입력해 이 노드에서 새 키쌍을 생성합니다.
4. **저장** — `config.toml`을 작성하고 키를 `validator`라는 이름으로 키링에 저장합니다(이 이름이 이미 사용 중이면 `validator-<hex>`). 파일 키링은 이 단계와 이후 키링을 여는 모든 명령에서 환경에 `QORE_LIGHTNODE_KEYRING_PASSPHRASE`가 설정되어 있어야 합니다.

:::note 로컬 전용 모드
엔드포인트를 비워 두면 데몬은 로컬 전용 모드로 시작합니다. PQC 스택은 완전히 검증되지만, 노드는 어떤 체인도 동기화하지 않습니다. 체인 엔드포인트가 준비되면 `onboard`를 다시 실행해 노드를 해당 엔드포인트로 연결하세요.
:::

`onboard`는 항상 현재 활성 설정을 덮어씁니다. 기본 경로가 아닌 곳에 쓰려면 `--config`를 사용하고, 프롬프트 없이 바로 실패하게 하려면(CI에서 유용) `--non-interactive`를 사용하세요.

:::caution 온보딩 후 설정을 마무리하세요
`onboard`는 어떤 네트워크에 참여하는지, 어떤 계정이 본인 것인지 알지 못합니다. `register`를 실행하거나 하트비트에 의존하기 전에 `config.toml`을 편집하세요.

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

최상위 `key_name`은 노드의 양자내성 키입니다(`qorechaind` 홈의 `pqc/<key_name>.dilithium` 파일). `[heartbeat] key_name`은 수수료를 지불하는 `qorechaind` 계정 키입니다. 키 이름이 `validator`인데 `key_name = "operator"`로 두면 `register`가 `node key "operator" not found`와 함께 중단됩니다.
:::

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

## 운영자 지갑 {#operator-wallet}

노드의 Dilithium-5 키는 지갑이 **아닙니다**. QoreChain에서 양자내성 키는 계정에 연결되는 것이지 계정을 만들어 주지 않습니다. 그래서 `keys list`에는 이 키의 주소가 표시되지 않습니다. **운영자 주소**는 `qorechaind`로 만든, 자금이 들어 있는 평범한 `qor1…` 계정이며, 노드가 이 계정으로 등록되고 라이트 노드 보상도 이 계정이 받습니다. 노드 키는 그 계정의 양자내성 키가 됩니다.

한 번만 설정하면 됩니다.

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register`는 사용자의 값이 채워진 상태로 다음을 출력합니다. 노드 키를 계정에 연결하는 `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` 명령(최초 1회), 그리고 노드를 등록하는 `tx lightnode register … --generate-only`와 `tx pqc cosign` 쌍입니다. 체인은 모든 트랜잭션에 양자내성 공동 서명을 요구하기 때문에 등록이 한 번이 아니라 두 개의 명령으로 이루어집니다. 등록에는 운영자 주소에 활성 `lightnode_operator` 라이선스도 필요하며, 없으면 체인이 트랜잭션을 거부합니다. 등록은 아직 열려 있지 않습니다. [보상 프로그램 현황](/light-node/overview#reward-program-status)을 참고하세요.

## 관리 명령

SX CLI에는 노드 상태를 확인하고 키를 관리하기 위한 명령들이 포함되어 있습니다.

| 명령 | 목적 |
| --- | --- |
| `onboard` | 대화형 최초 실행 마법사. |
| `start` | 데몬을 실행합니다. |
| `selftest` | PQC 자체 테스트를 실행합니다. |
| `status` | 노드와 라이트 클라이언트의 동기화 상태(체인 ID, 최신 높이, 캐치업 상태)와 `Signer`, `Operator`, `Licence`, `Registration` 줄을 표시합니다. |
| `keys create <name>` | 새 Dilithium-5 노드 키를 생성하고 공개 키를 출력합니다. |
| `keys list` | 키링에 있는 키 목록(이름, 유형, 있는 경우 주소, 공개 키)을 표시합니다. |
| `keys show <name>` | 키의 유형과 전체 공개 키를 출력합니다. |
| `keys import <name> <hex-privkey>` | 16진수로 인코딩된 개인 키를 가져옵니다. |
| `keys export <name>` | 개인 키를 16진수로 내보냅니다(`qorechaind`가 `~/.qorechaind/pqc/`에서 읽는 것과 동일한 형식). |
| `register` | 노드 키를 운영자 계정에 연결하고 노드를 등록하는 체인 명령을 출력합니다 — [등록 및 라이선스](/light-node/registration-and-licensing) 참고. |
| `validators` | 본딩된 검증인 목록을 표시합니다. |
| `delegation` | 로컬 데이터베이스에서 현재 위임 내역을 표시합니다([보상 및 모니터링](/light-node/rewards-and-monitoring#how-rewards-work)의 알려진 제한 사항 참고). |
| `rewards` | 대기 중인 스테이킹 보상을 표시합니다(동일한 제한 사항). |
| `network` | 로컬 데이터베이스에서 네트워크 텔레메트리(최근 동기화된 헤더)를 표시합니다. |
| `version` | 바이너리 버전을 출력합니다. |

스테이킹, 보상, 모니터링 관련 세부 내용은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요. 온체인 등록 방법은 [등록 및 라이선스](/light-node/registration-and-licensing)를 참고하세요.
