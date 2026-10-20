---
slug: /light-node/sx-edition
title: SX 에디션 (서버 데몬)
sidebar_label: SX 에디션
sidebar_position: 2
---

# SX 에디션 — 서버 데몬

**SX(Server eXperience)** 에디션은 헤드리스 라이트 노드입니다. 데몬과 완전한 관리 CLI로 구성되며, 서버 환경과 자동화를 위해 만들어졌습니다. 바이너리 이름은 `lightnode-sx`입니다. 이 페이지는 라이트 노드 **3.1.9**(소스 태그 `v3.1.9`)를 설명하며, 이는 체인 버전과는 별개인 자체 버전 라인에 있습니다.

## 설치 {#install}

미리 빌드된 바이너리를 사용하는 것이 가장 쉬운 방법입니다 — 라이트 노드 클라이언트는 **네이티브 의존성 없이 여섯 개 플랫폼**에서 네이티브로 실행됩니다: Linux(amd64, arm64), macOS(Intel, Apple Silicon), Windows(amd64, arm64) — SX와 UX 에디션을 합쳐 총 12개의 바이너리입니다. 각 바이너리는 약 13MB이며, 다운로드해서 바로 실행하면 됩니다. 별도로 설치해야 할 라이브러리가 없습니다. 노드는 이 모든 플랫폼에서 자체 트랜잭션에 직접 서명하므로, 노드를 등록하고 실행하는 데 다른 것(특히 `qorechaind`)은 필요하지 않습니다.

**실행 전에 체크섬을 검증하세요.** `https://download.qore.host/<net>/lightnode/latest.json`의 릴리스 매니페스트에는 모든 바이너리에 대한 `sha256` 값, 전체 릴리스에 대한 `SHA256SUMS` 파일을 가리키는 `checksums.url`, 그리고 그 파일 자체의 `checksums.sha256`이 담겨 있습니다. 다운로드한 파일을 직접 검증하세요 — 이는 부차적인 절차가 아니라, 실제로 빌드된 바이너리를 실행하는 것과 해당 URL에 어쩌다 존재하는 무언가를 실행하는 것의 차이를 가르는 절차입니다.

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Windows에서는 `certutil -hashfile lightnode-sx-<platform>.exe SHA256`의 결과를 매니페스트 값과 비교하세요. 두 네트워크 모두 동일한 3.1.9 빌드를 제공하며, 두 매니페스트 모두 이 빌드를 요구합니다(`minCompatible: 3.1.9`). 소스는 `github.com/qorechain/qorechain-lightnode`에 공개되어 있습니다(Apache 2.0). Android 빌드는 GitHub 릴리스에 프리뷰로 첨부되어 있으며, 등록하지 않고 보상도 받지 않습니다.

소스에서 바이너리를 직접 빌드하거나 Docker로 실행할 수도 있습니다.

### 소스에서 빌드

라이트 노드는 **Go 1.26.1**을 필요로 합니다. 이 노드의 양자내성 암호(post-quantum cryptography)는 순수 Go로 구현되어 있어(CGO 없음, 네이티브 라이브러리 없음), 여섯 개 지원 플랫폼 중 어느 곳으로 크로스 컴파일하더라도 다른 Go 바이너리와 동일한 방식으로 동작합니다.

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

릴리스 태그(`git checkout v3.1.9`)에서 빌드하세요. 이 명령은 `build/lightnode-sx`를 생성합니다. 바로 실행하거나 `PATH`에 복사해서 사용하세요. 등록하기 전에 [`selftest`](#verify-the-pqc-stack-selftest)로 양자내성 서명 스택이 정상인지 먼저 점검하시기 바랍니다.

### Docker {#docker}

미리 빌드된 레지스트리 이미지는 없으며, 소스 태그에서 직접 빌드합니다. **`v3.1.9`** 태그를 사용하세요. 기존 설치를 업데이트하려면 새 태그에서 다시 빌드하세요(`git fetch --tags && git checkout v3.1.9 && docker compose build --no-cache lightnode-sx`). 단순한 `docker compose up`이나 `restart`는 이전 이미지를 재사용합니다. 키, 설정, 데이터 볼륨은 그대로 유지됩니다.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.9

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

모든 `docker compose` 명령에서 `QORECHAIN_RPC_ADDR`를 export된 상태로 유지하세요. 이 값은 설정의 `rpc_addr`를 덮어쓰며, compose 기본값은 `host.docker.internal:26657`을 가리킵니다. SX 컨테이너는 키링을 포함한 데이터를 `/root/.qorechain-lightnode`에 마운트된 네임드 볼륨에 저장합니다.

노드는 컨테이너 안에서 네이티브로 서명하므로 다른 것은 필요하지 않습니다. SX 이미지에는 [`qorechaind` 대체 경로](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline)를 위한 릴리스된 `qorechaind`(v3.2.0, linux/amd64 전용, 고정된 다이제스트와 대조해 검증됨)도 여전히 포함되어 있습니다. `docker-compose.yml`은 `~/.qorechaind`(또는 `QORECHAIND_HOME`)를 `/root/.qorechaind`에 마운트하고 이 경로를 위해 `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`를 전달합니다. 운영자 키가 노드 자체 키링에 있는 노드는 둘 다 사용하지 않습니다.

## 설정 {#configure}

라이트 노드는 TOML 설정 파일을 읽습니다. 기본적으로 홈 디렉터리(`~/.qorechain-lightnode/config.toml`)에서 `config.toml`을 찾습니다. 이 파일을 직접 작성할 필요는 보통 없습니다 — [`onboard` 마법사](#first-run-onboard)가 대신 생성해 줍니다 — 하지만 옵션들을 이해해 두는 것이 유용합니다.

모든 명령에 공통으로 적용되는 두 개의 영속 플래그가 있습니다.

- `--config <path>` — 기본 위치가 아닌 곳의 설정 파일을 지정합니다.
- `--home <dir>` — 데이터와 키에 사용되는 홈 디렉터리를 재지정합니다(기본값은 `~/.qorechain-lightnode`).

사용 수준에서 가장 관련 있는 설정 옵션은 다음과 같습니다.

| 옵션 | 제어하는 항목 |
| --- | --- |
| `chain_id` | 네트워크 식별자(메인넷은 `qorechain-vladi`, 테스트넷은 `qorechain-diana`). `onboard`가 RPC 엔드포인트에서 읽어 옵니다. `onboard` 중에 엔드포인트에 접속할 수 없었다면 기본값 `qorechain-diana`가 남으므로 직접 설정해야 합니다. 트랜잭션은 이 체인을 대상으로 서명됩니다. |
| `rpc_addr` | 데몬이 연결하는 체인 RPC 엔드포인트. 비워 두면 **로컬 전용 모드**로 동작합니다. |
| `primary_addr` / `witness_addrs` | primary RPC 엔드포인트와, 이 노드가 보고하는 헤더를 대조 검증하는 데 사용되는 witness 엔드포인트 — [왜 라이트 노드를 운영하는가](/light-node/overview#why-run-a-light-node) 참고. `assurance` 값(디버그 레벨로 로그에 기록됨)이 `trusted-single-source`에서 `corroborated-across-sources`로 바뀌려면 서로 구별되고 접근 가능한 witness가 최소 하나 있어야 합니다. |
| `trust_period` / `max_clock_drift` | 호환성을 위해 허용되지만 현재는 사용되지 않습니다. 헤더 신뢰는 위에서 설명한 primary/witness 대조 검증에서 나옵니다. |
| `data_dir` | 노드가 데이터베이스와 헤더를 저장하는 위치. |
| `keyring_backend` / `key_name` | 키링 백엔드(`file`, `os`, 또는 로컬 데브넷 전용 `test`)와 노드가 서명에 사용하는 양자내성 키의 이름. `onboard`는 `key_name`을 자신이 생성한 키(`validator`)로 설정하고, `keys add-operator`는 계정의 단어에서 키를 파생하거나 복구할 때 이를 `operator-pqc`로 변경합니다. `file` 백엔드는 환경에 `QORE_LIGHTNODE_KEYRING_PASSPHRASE`가 있어야 합니다. |
| `operator_address` | 이 노드가 속한 계정(`qor1...`)이며, 로드 시 검증됩니다. `keys add-operator`가 채워 줍니다. `register`, `status`, 하트비트에 필요합니다. [운영자 지갑](#operator-wallet)을 참고하세요. |
| `api_addr` | REST 엔드포인트. 비어 있으면 `rpc_addr`에서 파생됩니다(포트 26657은 1317로, `rpc.` 호스트는 `api.`로 바뀜). 따라서 두 규칙 모두 따르지 않는 엔드포인트에만 필요합니다. |
| `[heartbeat]` | 기본적으로 켜져 있습니다(`enabled`). `interval_blocks`(체인의 `heartbeat_interval`인 1000과 일치시킬 것), `check_interval`(기본값 `60s`), `gas`(기본값 `300000`. 네이티브 서명의 경우 수수료는 가스 단위당 0.25 uqor이므로 75,000 uqor). `qorechaind` 대체 경로에서만 사용: `fees`(기본값 `50000uqor`), `qorechaind_path`(비어 있으면 `PATH`의 `qorechaind`), `qorechaind_home`(비어 있으면 `~/.qorechaind`), `keyring_backend`, `key_name`(운영자 계정을 보유한 `qorechaind` 키. 기본값은 최상위 `key_name`). |
| `[delegation]` | `auto_claim`(기본값은 꺼짐: 서명기를 통해 누적된 라이트 노드 보상을 운영자 계정으로 청구하며, 노드는 서버에서 재위임을 하지 않습니다), 확인 주기, 청구 최소 보상, `rebalance_enabled`, `min_reputation`(평판 알림 전용 — 노드는 스테이크를 절대 옮기지 않습니다). `validators`와 `split_weights`는 허용되지만 현재는 동작에 반영되지 않습니다. |
| `[telemetry]` | 텔레메트리 사용 여부와 검증인·네트워크·브리지·토크노믹스에 대한 갱신 주기. |
| `[dashboard]` | 로컬 대시보드 API. UX 에디션은 항상 이를 제공하며, SX 에디션은 `enabled = true`일 때만 제공합니다. `bind_addr`(기본값 `127.0.0.1:8420`)와 `token`(설정하면 모든 `/api` 경로와 `/ws`에 `Authorization: Bearer <token>`이 필요). [UX 에디션](/light-node/ux-edition)을 참고하세요. |
| `log_level` / `log_format` | 로그 상세도(`debug`, `info`, `warn`, `error`)와 형식(`text` 또는 `json`). 최상위 키이므로 첫 번째 `[table]`보다 앞에 두세요. |

### 환경 변수 {#environment-variables}

| 변수 | 용도 |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | 노드의 양자내성 키와 운영자 계정 키를 담고 있는 노드 키링의 패스프레이즈(`keyring_backend = "file"`). 키링을 여는 모든 명령과 `start`에 필요하며, 노드는 빈 값을 거부합니다. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | `qorechaind` 대체 경로 전용: 운영자 키가 들어 있는 `qorechaind` 키링의 패스프레이즈. stdin을 통해 `qorechaind`로 전달되며 명령줄에는 나타나지 않습니다. |
| `QORECHAIN_RPC_ADDR` | `rpc_addr`를 덮어씁니다(`primary_addr`가 `rpc_addr`와 같았다면 이것도 덮어씁니다). `docker-compose.yml`이 설정합니다. |

:::note witness 엔드포인트는 시작 시 검증됩니다
primary와 동일한 호스트에 있는 witness는 거부됩니다 — 손상된 엔드포인트라면 스스로에게 동의할 뿐이므로 아무것도 대조 검증하지 못하기 때문입니다. 원격 호스트의 평문 `http://` witness 역시 거부됩니다. 해당 연결을 재작성할 수 있는 공격자라면 모든 witness인 척 응답할 수 있기 때문입니다. 루프백 `http://`는 문제없습니다. witness는 독립적으로 신뢰할 근거가 있는 RPC 엔드포인트를 가리키도록 지정하세요.
:::

Delegation 기본값은 평판 인지 리밸런싱 알림을 활성화하고 `auto_claim`은 꺼 둡니다 — 이 항목들의 동작 방식은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요.

## 최초 실행: `onboard` {#first-run-onboard}

최초 실행 시, 아직 설정 파일이 없으면 `start`는 실행을 멈추고 온보딩 마법사를 안내합니다. 먼저 키링 패스프레이즈를 설정하세요 — `onboard`는 패스프레이즈 없이는 시작을 거부하므로, 저장할 수 없는 키를 생성하는 일이 없습니다 — 그런 다음 마법사를 실행하세요.

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard`는 네 단계로 설정을 안내합니다.

1. **PQC 자체 테스트** — Dilithium-5 전체 라운드트립을 실행합니다([`selftest`](#verify-the-pqc-stack-selftest)와 동일한 점검). PQC 스택이 실패하면 마법사는 진행을 거부합니다.
2. **체인 RPC 엔드포인트** — QoreChain RPC URL(메인넷 `https://rpc.qore.host`, 테스트넷 `https://rpc-testnet.qore.host`)을 붙여넣거나, 비워 두고 **로컬 전용 모드**로 실행할 수 있습니다. URL을 입력하면 마법사가 즉시 접속을 테스트하고 체인 ID를 읽어 옵니다.
3. **노드 키** — 마법사는 이를 "검증인 개인 키"라고 부르지만, 검증인 키가 아니라 라이트 노드 자체의 Dilithium-5 키입니다. 16진수로 인코딩된 Dilithium-5 개인 키를 붙여넣거나, `g`(또는 `generate`)를 입력해 이 노드에서 새 키쌍을 생성합니다.
4. **저장** — `config.toml`(엔드포인트와 체인 ID 포함)을 작성하고 키를 `validator`라는 이름으로 키링에 저장하며(이 이름이 이미 사용 중이면 `validator-<hex>`), `key_name`을 그 이름으로 설정합니다.

:::note 로컬 전용 모드
엔드포인트를 비워 두면 데몬은 로컬 전용 모드로 시작합니다. PQC 스택은 완전히 검증되지만, 노드는 어떤 체인도 동기화하지 않습니다. 체인 엔드포인트가 준비되면 `onboard`를 다시 실행해 노드를 해당 엔드포인트로 연결하세요.
:::

`onboard`는 항상 현재 활성 설정을 덮어씁니다. 기본 경로가 아닌 곳에 쓰려면 `--config`를 사용하고, 프롬프트 없이 바로 실패하게 하려면(CI에서 유용) `--non-interactive`를 사용하세요.

:::caution 다음 단계: 운영자 계정
`onboard`는 어떤 계정이 본인 것인지 알지 못합니다. `register`를 실행하기 전에 [`keys add-operator`](#operator-wallet)로 운영자 계정을 추가하세요. 이 명령이 `operator_address`를 채워 줍니다. `onboard` 중에 엔드포인트에 접속할 수 없었다면, `config.toml`의 `chain_id`가 `qorechain-vladi`(메인넷) 또는 `qorechain-diana`(테스트넷)인지도 확인하세요.
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

1. **키 생성** (Keygen) — 새 키쌍을 생성합니다.
2. **서명** (Sign) — 테스트 메시지에 서명합니다.
3. **검증** (유효한 서명) — 일치하는 공개 키로 서명이 검증되는지 확인합니다.
4. **변조된 서명 거부** — 서명의 한 바이트를 뒤집습니다. 검증은 반드시 이를 거부해야 합니다.
5. **변조된 메시지 거부** — 메시지의 한 바이트를 뒤집습니다. 검증은 반드시 이를 거부해야 합니다.

점검 중 하나라도 실패하면 바이너리는 진단 출력과 함께 0이 아닌 코드로 종료됩니다. 이는 온보딩 마법사가 첫 단계로 실행하는 것과 동일한 테스트이며, 배포 전 검증과 지원 진단에 유용합니다.

## 운영자 지갑 {#operator-wallet}

노드의 Dilithium-5 키는 지갑이 **아닙니다**. QoreChain에서 양자내성 키는 계정에 연결되는 것이지 계정을 만들어 주지 않습니다. 그래서 `keys list`에는 이 키의 주소가 표시되지 않습니다. **운영자 주소**는 라이선스와 스테이크를 보유하고, 수수료를 지불하며, 라이트 노드 보상을 받는 평범한 `qor1…` 계정입니다. 복구 단어를 본인이 보유한 계정(직접 보관한 단어, Keplr, 또는 `qorechaind`)이어야 하며, 전용 계정이 가장 좋습니다. Dashboard의 수탁형 지갑은 시드를 내보내지 않는 한 노드를 실행할 수 없습니다. [운영자 계정](/light-node/registration-and-licensing#operator-account)을 참고하세요.

운영자 계정 키를 노드의 키링에 저장하세요.

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`는 다음을 수행합니다.

- `qorechaind`와 Keplr와 똑같은 방식(`m/44'/118'/0'/0/0`)으로 단어에서 계정 키를 파생하여 키링에 `operator`로 저장하고, 계정을 `config.toml`의 `operator_address`에 기록합니다. `operator_address`가 이미 다른 계정으로 설정되어 있으면 거부합니다.
- 노드가 서명에 사용할 양자내성 키를 선택해 `operator-pqc`로 저장하고 `key_name`을 그 이름으로 설정합니다. 계정에 이미 양자내성 키가 있으면 — 보통 같은 단어로 지갑이 등록한 키 — 그 키를 단어에서 다시 만듭니다(wallet-adapter 및 Dashboard 파생 방식, `qorechaind tx pqc recover-key`와 동일). 계정에 키가 없으면 단어에서 키를 파생하므로, 단어로 노드의 키도 복원할 수 있습니다. 계정에 등록된 키가 이미 노드의 현재 키라면 그 키를 유지합니다. 계정의 키를 단어에서 재현할 수 없으면 명령은 거부하고 전용 계정을 사용하라고 안내합니다.
- `--recover` 없이 실행하면 새 계정을 만들고 그 24개 단어를 한 번만 보여줍니다. 반드시 적어 두세요. 유일한 백업입니다. 등록하기 전에 계정에 자금을 넣고 그 주소로 라이선스를 구매하세요.

키링 패스프레이즈(`QORE_LIGHTNODE_KEYRING_PASSPHRASE`)는 노드 키와 함께 이 키도 보호합니다. 그런 다음 등록하세요.

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register`는 라이선스를 확인하고, 계정에 이미 양자내성 키가 없다면 이를 연결하며, `--delegate-to`로 검증인을 지정한 경우에만 부족한 스테이크를 위임하고, 노드를 등록합니다. 각 단계는 다음 단계 전에 블록에서 확인됩니다. 자세한 내용과, 계정 키를 `qorechaind` 키링에 보관하는 운영자를 위한 `register --print` 대체 경로는 [등록 및 라이선스](/light-node/registration-and-licensing)를 참고하세요.

## 관리 명령

SX CLI에는 노드 상태를 확인하고 키를 관리하기 위한 명령들이 포함되어 있습니다. 3.1.7부터 UX 바이너리(`lightnode-ux`)도 동일한 명령을 갖추고 있습니다.

| 명령 | 목적 |
| --- | --- |
| `onboard` | 대화형 최초 실행 마법사. |
| `start` | 데몬을 실행합니다. |
| `selftest` | PQC 자체 테스트를 실행합니다. |
| `status` | 노드와 라이트 클라이언트의 동기화 상태(체인 ID, 최신 높이, 캐치업 상태)와 `Signer`(네이티브 또는 `qorechaind`), `Operator`, `Licence`, `Registration` 줄을 표시합니다. |
| `keys create <name>` | 새 Dilithium-5 노드 키를 생성하고 공개 키를 출력합니다. |
| `keys list` | 키링에 있는 키 목록(이름, 유형, 있는 경우 주소, 공개 키)을 표시합니다. |
| `keys show <name>` | 키의 유형과 전체 공개 키를 출력합니다. |
| `keys import <name> <hex-privkey>` | 16진수로 인코딩된 개인 키를 가져옵니다. |
| `keys export <name> [--out <file>]` | 개인 키를 16진수로 내보냅니다. `--out`은 `qorechaind --pqc-key`가 읽는 파일을 작성합니다(끝 줄바꿈 없음, 모드 0600). |
| `keys add-operator [--recover]` | 운영자 계정 키(새로 만들거나, 표준 입력으로 받은 단어에서 복구)를 저장하고 양자내성 키를 선택하며, `operator_address`를 채웁니다. [운영자 지갑](#operator-wallet)을 참고하세요. |
| `register [--delegate-to <qorvaloper>] [--print]` | 노드를 체인에 등록합니다: 양자내성 키, 부족한 스테이크, 등록, 각각 블록에서 확인됩니다. `--print`는 대신 `qorechaind` 명령을 출력합니다 — [등록 및 라이선스](/light-node/registration-and-licensing) 참고. |
| `validators` | 본딩된 검증인 목록을 표시합니다. |
| `delegation` | 실행 중인 데몬이 로컬 데이터베이스에 미러링한 운영자 계정의 위임 내역을 표시합니다. |
| `rewards` | 운영자 계정의 대기 중인 스테이킹 보상을 표시합니다(라이트 노드 보상이 아님. [보상 및 모니터링](/light-node/rewards-and-monitoring#how-rewards-work) 참고). |
| `network` | 로컬 데이터베이스에서 네트워크 텔레메트리(최근 동기화된 헤더)를 표시합니다. |
| `version` | 바이너리 버전을 출력합니다. |

스테이킹, 보상, 모니터링 관련 세부 내용은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요. 온체인 등록 방법은 [등록 및 라이선스](/light-node/registration-and-licensing)를 참고하세요.
