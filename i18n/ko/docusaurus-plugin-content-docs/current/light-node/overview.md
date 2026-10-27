---
slug: /light-node/overview
title: 라이트 노드 개요
sidebar_label: 개요
sidebar_position: 1
---

# 라이트 노드 개요

**QoreChain 라이트 노드**는 전체 노드를 실행하지 않고 QoreChain 네트워크를 따라가는 작은 클라이언트이며, 체인에 라이트 노드로 등록해 **3% 라이트 노드 보상 분배**에 참여할 수도 있습니다. 체인을 따라가는 저비용 방법과 그 분배에서 수익을 얻을 방법을 원하는 운영자, 그리고 단일 RPC 서버를 신뢰하지 않고 체인의 최신 블록 해시에 대한 두 번째 의견을 얻고 싶은 사람을 위한 것입니다. 같은 코드로 빌드된 두 가지 에디션의 독립형 단일 바이너리입니다. **SX**(`lightnode-sx`, 서버용 명령줄이 있는 헤드리스 데몬)와 **UX**(`lightnode-ux`, 같은 데몬에 `127.0.0.1:8420`의 로컬 웹 대시보드를 더한 것)입니다. Apache 2.0 라이선스로 배포되며 소스는 `github.com/qorechain/qorechain-lightnode`에 공개되어 있습니다.

노드를 실행하고 동기화하는 데는 라이선스가 필요 없습니다. 보상 분배에 참여하는 것은 별도의 단계이며, `lightnode_operator` 라이선스, 본딩된 검증자에게 위임된 스테이크, 온체인 등록이 필요합니다([이용 방법](#how-to-access) 참조).

라이트 노드는 체인 릴리스와는 별개인 **자체 버전 라인**을 가집니다. 작성 시점(2026년 10월 27일)에 두 네트워크의 릴리스 채널은 모두 라이트 노드 **3.1.12**를 제공합니다(메인넷은 체인 `v3.2.4`, 테스트넷은 `v3.2.6`). 두 숫자는 서로 무관한 것으로 취급하세요.

## 혁신 요소 {#innovations}

아래 각 항목은 소스를 보거나 노드를 실행해서 직접 확인할 수 있는 메커니즘입니다.

- **네이티브 하이브리드 서명, 다른 소프트웨어 불필요.** 노드는 순수 Go로 자체 트랜잭션을 만들고 서명합니다(CGO도, 네이티브 라이브러리도, `qorechaind`도 필요 없음). 모든 트랜잭션에는 PQC 확장이 없는 본문에 대한 ML-DSA-87(FIPS 204) 서명과, 그 확장을 본문에 담은 SignDoc에 대한 secp256k1 서명이 들어 있습니다. 서명 형식 버전은 체인에 적용된 업그레이드 플랜에서 읽습니다. amd64와 arm64용 Linux, macOS, Windows 빌드가 있습니다(3.1.8부터).
- **복구 단어 한 세트로 두 키를 모두 얻습니다.** `keys add-operator --recover`는 `qorechaind`와 Keplr가 사용하는 것과 같은 경로인 `m/44'/118'/0'/0/0`에서 계정 키를 파생합니다. 포스트 양자 키는 같은 단어로 해당 계정에 지갑이 이미 등록한 키를 다시 만들거나(wallet-adapter 및 Dashboard 파생 방식, `qorechaind tx pqc recover-key`와 같음) 새 키를 파생하므로, 그 단어로 노드의 키도 복원됩니다(3.1.9부터).
- **등록은 명령 하나이며 단계별로 확인됩니다.** `register`는 라이선스를 확인하고, 포스트 양자 키를 연결하고(체인이 지원하는 경우 소유 증명 포함), `--delegate-to`를 전달하면 부족한 스테이크만 위임한 다음 등록합니다. 각 단계는 다음 단계를 보내기 전에 블록에 포함되어야 합니다. 스테이크는 체인이 집계하는 방식 그대로 본딩된 검증자에 대해서만 집계됩니다(3.1.10부터).
- **하트비트는 체인 자체의 기록에서 타이밍을 잡습니다.** 데몬은 체인에 기록된 노드의 `last_heartbeat` 이후 1,000블록이 지나면 하트비트를 보내고, 60초마다 확인하며, 하트비트가 블록에 포함된 후에만 보고합니다. 재시작해도 중복해서 보내지 않고 한 간격 전체를 기다리지도 않습니다.
- **엔드포인트 간 헤더 교차 검증.** 노드는 기본 엔드포인트와 구성된 모든 감시(witness) 엔드포인트에서 같은 높이를 가져오며, 모두 같은 해시를 반환할 때만 헤더를 저장합니다. 기본 엔드포인트와 같은 호스트에 있는 감시자나 원격 평문 `http://` 주소의 감시자는 거부됩니다. 이 모드는 헤더마다 디버그 수준에서 `assurance`(`trusted-single-source` 또는 `corroborated-across-sources`)로 기록됩니다. 이것은 합의 검증이 **아닙니다**. [제한 사항](#limits)을 참조하세요.
- **서명된 자체 업데이트.** 라이트 노드 3.1.11부터 데몬은 6시간마다 네트워크의 `latest.json`을 읽습니다. `v<version>/SHA256SUMS.sig`가 바이너리에 내장된 릴리스 키의 Ed25519 서명으로 검증되고(서명은 네트워크, 버전, `SHA256SUMS`의 내용에 묶여 있음), 다운로드한 바이너리가 서명된 체크섬과 일치하며, 새 바이너리가 실행되어 정확히 `v<version>`을 보고할 때만 새 릴리스를 설치합니다. 이전 바이너리는 `<name>.old`로 보관되고 노드는 제자리에서 재시작합니다(Linux와 macOS에서는 같은 프로세스, Windows에서는 새 바이너리가 시작되고 이전 것은 종료). `[update] mode`는 `auto`(기본값), `notify`, `off` 중 하나이며, `lightnode-sx update --check`와 `lightnode-sx update`로 같은 일을 수동으로 할 수 있습니다. 컨테이너 안이거나 바이너리 폴더에 쓸 수 없는 경우 노드는 릴리스를 알리기만 합니다(로그 줄, 로컬 API의 `GET /api/update`, UX 대시보드의 배너).
- **체인의 동작과 일치하는 경고.** `[delegation] rebalance_enabled`가 켜져 있으면(기본값) 노드는 위임한 검증자가 jail 상태일 때, 활성 집합에 없을 때, 본딩된 스테이크가 `min_delegated_stake`(1,000 QOR) 아래로 떨어졌을 때 경고합니다. 세 경우 모두 체인은 아무 메시지 없이 노드에 대한 크레딧을 중단합니다. 경고는 나타날 때 한 번, 지속되는 동안 매시간, 해소될 때 한 번 기록됩니다. 네 번째 경고인 위임한 검증자의 평판 점수가 `min_reputation`(기본값 `0.5`) 미만인 경우는 `GET /qorechain/reputation/v1/validator/<valoper>`를 읽으며, 현재 **테스트넷**에서만 라이브이고 메인넷에는 v3.2.5 이후의 체인 릴리스에서야 적용됩니다. 해당 경로가 제공되기 전까지 노드는 이를 한 번 기록하고 6시간마다 다시 확인합니다.

### 라이트 노드를 실행하는 이유와 교차 검증 해석 방법 {#why-run-a-light-node}

- **보상 분배에 참여하세요.** 스테이크 및 가동 시간 규칙을 충족하는 등록된 활성 라이트 노드는 [아래](#the-3-light-node-reward-share)에 설명된 3% 분배에서 보상을 받습니다.
- **표시되는 체인 상태를 교차 검증하세요.** 감시 엔드포인트를 구성하지 않으면 노드는 시작 시 경고를 로그에 남기고 `trusted-single-source`를 보고합니다. 정직하게 운영되는 단일 엔드포인트도 손상된 엔드포인트와 같은 값을 보고하기 때문입니다. 독립적으로 운영되는 감시 엔드포인트를 추가하면 `corroborated-across-sources`로 전환되며, 속이려면 구성된 모든 엔드포인트가 동시에 손상되어야 합니다. 이 값은 디버그 로그의 `synced header` 줄에 나타나며(`log_level = "debug"`로 설정), `status`나 대시보드에는 표시되지 않고, RPC 선택은 사용자 환경에 국한되므로 중앙에서는 아무것도 볼 수 없습니다.
- **네트워크를 관찰하세요.** 텔레메트리는 검증자, 합의, 브리지, 토크노믹스를 다루며 독립적인 간격으로 새로 고쳐집니다.

## 사용 방법 {#how-to-use}

에디션을 선택하세요. 두 에디션 모두 같은 `config.toml`을 읽고, 같은 홈 디렉터리(`~/.qorechain-lightnode`)에 데이터를 저장하며, 같은 키링을 사용합니다.

| 에디션 | 바이너리 | 대상 | 인터페이스 |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | 헤드리스 서버, 자동화 | 데몬과 전체 명령줄. [SX 에디션](/light-node/sx-edition) 참조. |
| **UX** (User eXperience) | `lightnode-ux` | 데스크톱 및 운영자 사용 | 같은 명령어에 로컬 웹 대시보드 추가. [UX 에디션](/light-node/ux-edition) 참조. |

**1. 다운로드 및 검증**(Linux amd64 기준, 매니페스트를 읽는 데 `jq`를 사용). 대상으로 하는 네트워크의 매니페스트에서 버전을 가져오세요.

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Windows에서는 `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256`의 결과를 매니페스트 값과 비교하세요. 버전별 `SHA256SUMS`는 버전별 바이너리와 일치해야 하므로 둘 다 `v$V` 경로에서 가져오세요.

**2. 설정 및 등록.** 아래 순서는 Dashboard에 표시되는 것과 같으며, 데브넷, 테스트넷(2026년 10월 18일 리허설), 그리고 첫 메인넷 노드(2026년 10월 20일)에서 실행되었습니다.

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

`onboard`용 체인 RPC는 `https://rpc.qore.host`(메인넷) 또는 `https://rpc-testnet.qore.host`(테스트넷)입니다. UX 에디션은 같은 명령으로 `lightnode-ux`를 사용하고 `http://127.0.0.1:8420`을 여세요. 각 단계의 자세한 내용은 [SX 에디션](/light-node/sx-edition)과 [등록 및 라이선싱](/light-node/registration-and-licensing)을 참조하세요.

**3. 최신 상태 유지.** 라이트 노드 3.1.11 이상은 컨테이너 밖에서 스스로 업데이트합니다(위의 자체 업데이트 항목 참조). 3.1.10 이하 노드는 3.1.12를 한 번 수동으로 설치해야 합니다. 위와 같이 버전이 지정된 바이너리를 다운로드해 파일을 교체하세요. Docker에서는 `docker compose pull && docker compose up -d`를 실행하세요. [SX 에디션: 업데이트](/light-node/sx-edition#updating)를 참조하세요.

## 이용 방법 {#how-to-access}

| | 메인넷 | 테스트넷 |
| --- | --- | --- |
| 체인 | `qorechain-vladi` (체인 `v3.2.4`) | `qorechain-diana` (체인 `v3.2.6`) |
| 노드용 RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| 조회용 REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| 라이트 노드 릴리스 | 3.1.12 | 3.1.12 |
| 라이선스 | $50, Dashboard에서 구매. 부여는 일괄로 수동 서명됨 | 무료, 셀프서비스: **Nodes & Validators > Light Node**, **Request licence**. 자동으로 서명되며 보통 몇 분 내에 처리됨 |

**등록에 필요한 것**

- 복구 단어를 직접 보유한 계정(본인의 단어, Keplr 또는 `qorechaind` 키). 가능하면 노드 전용 계정을 권장합니다. 수탁형 Dashboard 지갑은 시드를 내보내지 않는 한 노드를 실행할 수 없습니다.
- 해당 주소의 활성 `lightnode_operator` 라이선스(아래 참조).
- 해당 주소에서 **본딩된** 검증자에게 위임된 합계 **1,000 QOR** 이상.
- **1 QOR**의 등록 수수료와 트랜잭션 수수료를 위한 계정 내 QOR. 하트비트는 기본 한도 300,000 가스에서 가스당 0.25 uqor가 들며, 상한은 0.075 QOR입니다(측정된 사용 가스: 약 165,000).
- 계속 켜져 있는 컴퓨터: 노드는 1,000블록마다 하트비트를 보내야 하고 보상을 받으려면 가동률 80% 이상을 유지해야 합니다.

**라이선스 받기.** Dashboard에서 **Nodes & Validators**(이전에 **Tools**라고 불리던 사이드바 항목이며, 페이지는 여전히 `/tools`에 있음)를 열고 **Light Node** 탭을 선택한 다음, 헤더에서 네트워크를 선택하세요. Dashboard에는 로그인이 필요합니다.

- *메인넷:* 먼저 `qor1...` 주소를 입력하고, USDT 네트워크를 선택한 다음 $50를 결제합니다. 체인이 부여를 확인할 때까지 탭에는 **Paid, awaiting on-chain grant**가 표시됩니다.
- *테스트넷:* 판매하지 않습니다. **Free testnet licence** 아래에 `qor1...` 주소를 입력하고 **Request licence**를 선택하세요. 계정당 1회, 주소당 1회만 요청할 수 있습니다. 라이선스가 도착하면 탭에 "Granted to ..."가 표시되고, 부여에 서명할 수 없었다면 그렇게 알려 주며 다시 요청할 수 있습니다.

라이선스를 직접 확인할 수도 있습니다: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### 보상 프로그램 현황 {#reward-program-status}

:::note 등록이 열려 있습니다
메인넷(`qorechain-vladi`, 체인 v3.2.4)과 테스트넷(`qorechain-diana`, 체인 v3.2.6)에서 등록이 열려 있습니다. 2026년 10월 27일에 메인넷에서 7개의 `lightnode_operator` 라이선스가 부여되었고 각 네트워크에 라이트 노드가 1개씩 등록되었습니다(두 네트워크 모두 `GET /qorechain/lightnode/v1/stats`의 `total_registered`가 `1`). 보상 회계는 v3.2.0 업그레이드 이후 두 네트워크 모두에서 라이브입니다. 가동 시간은 **노드가 등록된 블록부터** 계산되므로 그 이전에 노드를 실행해도 크레딧은 적립되지 않습니다. 체인 v3.2.4부터는 노드별 보상 한도도 노드 자신의 등록 시점부터 시작됩니다. 등록 후 첫 정산에서는 그 이후에 누적된 금액만 크레딧됩니다.

릴리스 매니페스트(`https://download.qore.host/<net>/lightnode/latest.json`)는 `registration.open` 필드에 공식 신호를 담고 있습니다. 실시간 상태는 `https://api.qore.host`(메인넷) 또는 `https://api-testnet.qore.host`(테스트넷)에서 `GET /qorechain/license/v1/holders/lightnode_operator`와 `GET /qorechain/lightnode/v1/stats`를 조회하세요.
:::

## 3% 라이트 노드 보상 분배 {#the-3-light-node-reward-share}

QoreChain의 수수료 분배는 라이트 노드에 고정된 **3% 분배**(`reward_share` 파라미터, `0.03`)를 할당합니다. 전체 37% / 30% / 20% / 10% / 3% 분류(검증자, 소각, 트레저리, 스테이커, 라이트 노드)는 [토크노믹스](/architecture/tokenomics)를 참조하세요.

이 3%는 라이트 노드 모듈 계정에 입금되는 금액이며, 노드별 권리가 아닙니다. 100블록마다 체인은 이전 정산 이후 누적된 금액 중 각 적격 노드의 스테이크 가중 몫을 크레딧하며, 이는 **노드별로 제한됩니다**. 체인 v3.2.3부터 이 제한은 **노드당 30일에 2,000 QOR**(`max_reward_per_month_per_node`, `2000000000` uqor)이며, 이전 정산 이후 경과한 블록 시간에 비례하여 배분되고 노드의 가동 시간에 따라 조정됩니다. 이것이 `lightnode-monthly-cap` 규칙입니다. v3.2.3 이전에는 이 제한이 블록 단위(`max_reward_per_block_per_node`, `1713` uqor)로 정해졌으며, 보상 풀 쿼리는 여전히 이 값을 보고합니다. 이 제한은 상한일 뿐 약속된 금액이 아닙니다. 획득되지 않은 금액은 거버넌스 투표로만 해제할 수 있는 준비금으로 이동하므로, 가장 먼저 등록하는 사람을 위한 보상 풀이 쌓이지 않습니다. `GET /qorechain/lightnode/v1/reward_pool`로 실시간 분할을 확인할 수 있습니다.

보상을 받으려면 라이트 노드는 **온체인에 등록되고, 활성 상태**(하트비트로 활성 증명)여야 하며, 최소 본딩 스테이크 이상을 보유하고, 가동 시간을 최소 기준 이상으로 유지해야 합니다. 등록 및 라이선싱은 [등록 및 라이선싱](/light-node/registration-and-licensing)에서 다루며, 보상이 어떻게 크레딧되고, 청구되고, 모니터링되는지는 [보상 및 모니터링](/light-node/rewards-and-monitoring)에서 다룹니다.

## 배포 위치 {#where-published}

| 항목 | 위치 | 현재 버전 |
| --- | --- | --- |
| 릴리스 매니페스트, 메인넷 | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, 등록 열림) |
| 릴리스 매니페스트, 테스트넷 | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, 등록 열림) |
| 바이너리 | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 릴리스당 12개 파일(SX와 UX, Linux, macOS, Windows, amd64와 arm64)과 `SHA256SUMS` |
| 소스 및 릴리스 | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | 릴리스 `v3.1.12`(현재) 및 이전 태그. 각각 12개 바이너리, `SHA256SUMS`, `lightnode-build.json`, Android 프리뷰 APK를 포함 |
| Android | GitHub 릴리스에만 첨부 | 프리뷰: 체인을 따르며, 등록하지 않고 보상도 받지 않음 |
| Docker | `ghcr.io/qorechain/qorechain-lightnode-sx` 및 `ghcr.io/qorechain/qorechain-lightnode-ux`, 공개, 태그 `latest`와 `v<version>`([SX 에디션: Docker](/light-node/sx-edition#docker) 참조) | `v3.1.12` |

이 표에 의존하지 말고 다운로드하기 전에 네트워크 매니페스트의 `version`을 확인하세요. 릴리스 서명 키는 바이너리에 내장되어 있으며 따로 설치할 것은 없습니다.

## 제한 사항 및 알려진 문제 {#limits}

- **프로토콜 라이트 클라이언트가 아닙니다.** 노드는 엔드포인트 간 블록 해시를 교차 확인합니다. 커밋 서명, 검증자 집합 변경, 신뢰 기간(trust period)은 확인하지 않으므로 체인의 합의를 검증하지 않습니다. 설정의 `trust_period`와 `max_clock_drift`는 허용되지만 사용되지 않습니다.
- **보상은 상한입니다.** 노드별 한도(30일에 2,000 QOR)는 최대치이며, 노드는 풀에 누적되는 금액만, 그리고 자격이 있는 동안에만 보상을 받습니다.
- **하트비트는 활성 서명입니다.** 운영자 키가 제때 서명했다는 것을 증명할 뿐, 전체 소프트웨어가 계속 실행되었다는 것을 증명하지는 않습니다.
- **평판 경고는 현재 테스트넷 전용입니다.** 메인넷은 아직 검증자별 평판 점수를 제공하지 않으므로, 메인넷에서는 그 검사 하나가 실행되지 않으며 노드는 로그에 그렇게 알립니다. jail, 활성 집합 미포함, 낮은 스테이크 경고는 이에 의존하지 않습니다. 3.1.11 이전 노드 버전은 실패한 평판 검사를 5분마다 기록했으며 어떤 것에 대해서도 경고하지 않았습니다.
- **자체 업데이트는 3.1.11부터 시작됩니다.** 3.1.10 이하 노드는 스스로 업데이트하지 않으며 3.1.12를 한 번 수동으로 설치해야 합니다. 컨테이너나 쓸 수 없는 폴더에서는 노드가 새 릴리스를 알리기만 합니다.
- **Docker 노드는 스스로 업데이트하지 않습니다.** 새 릴리스에 대해 알림만 받으며, 업데이트는 `docker compose pull && docker compose up -d`입니다.
- **Android는 프리뷰**이며 등록하지도 보상을 받지도 않습니다.
- **라이선스.** 메인넷 부여는 일괄로 수동 서명되므로 결제와 등록 사이에 대기 시간이 있습니다. 테스트넷 라이선스는 계정당 1개, 주소당 1개로 제한됩니다.
- **Dashboard에서 만든 지갑은 노드를 실행할 수 없습니다.** 시드를 내보내지 않는 한 그렇습니다. 노드는 사용자가 보유한 키로 서명해야 하기 때문입니다.

## 다음으로 갈 곳

- [SX 에디션](/light-node/sx-edition): 서버 데몬을 설치, 구성, 실행합니다.
- [UX 에디션](/light-node/ux-edition): 웹 대시보드 에디션을 실행합니다.
- [등록 및 라이선싱](/light-node/registration-and-licensing): 라이선스를 획득하고 온체인에 등록합니다.
- [보상 및 모니터링](/light-node/rewards-and-monitoring): 3% 분배가 어떻게 크레딧되고 청구되는지, 그리고 노드를 건강하게 유지하는 방법.
- [토크노믹스](/architecture/tokenomics): 라이트 노드 보상 분배가 더 넓은 경제에 어떻게 들어맞는지.
