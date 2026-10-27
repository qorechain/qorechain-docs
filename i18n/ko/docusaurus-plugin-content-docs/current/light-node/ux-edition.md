---
slug: /light-node/ux-edition
title: UX 에디션 (웹 대시보드)
sidebar_label: UX 에디션
sidebar_position: 3
---

# UX 에디션 — 웹 대시보드

**UX (User eXperience)** 에디션은 SX 에디션과 동일한 라이트 노드 데몬을 실행하지만, **내장 웹 대시보드**를 추가하여 브라우저에서 노드와 네트워크를 지켜볼 수 있습니다. 바이너리는 `lightnode-ux`입니다. SX 에디션과 마찬가지로, 라이트 노드 자체의 버전 라인을 따르며 체인 버전과는 별개입니다(2026년 10월 27일에 두 네트워크의 채널 모두 3.1.12를 제공합니다).

UX 에디션은 데스크톱 사용과, 명령줄보다 시각적 인터페이스를 선호하는 운영자에게 적합한 선택입니다.

## 설치

사전 빌드된 바이너리는 **네이티브 의존성 없이 여섯 개 플랫폼**에서 네이티브로 실행됩니다 — Linux(amd64, arm64), macOS(Intel, Apple Silicon), Windows(amd64, arm64) — 각각 약 13MB입니다. 실행하기 전에 다운로드한 파일의 체크섬을 매니페스트와 대조하여 검증하세요 — 방법은 [SX 에디션](/light-node/sx-edition#install)을 참고하세요.

### 소스에서 빌드

UX 에디션은 **Go 1.26.1**이 필요합니다. 포스트 양자 암호화는 순수 Go 구현입니다(CGO 없음, 네이티브 라이브러리 없음):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

매니페스트가 지정하는 릴리스 태그(현재는 `git checkout v3.1.12`)에서 빌드하세요. 이는 `build/lightnode-ux`를 생성합니다.

### Docker

UX 서비스는 소스 저장소(`github.com/qorechain/qorechain-lightnode`, 네트워크의 매니페스트와 일치하는 태그)의 `Dockerfile.ux`에서 빌드됩니다. 컨테이너는 시작하기 전에 데이터 볼륨에 `config.toml`이 있어야 합니다. UX 바이너리에는 설정 명령이 있으므로 볼륨 안에서 직접 만들 수 있습니다:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

컨테이너 내부에서는 대시보드가 모든 컨테이너 인터페이스에서 수신 대기해야 하므로, 해당 설정(볼륨 안의 `/root/.qorechain-lightnode/config.toml`)에 다음을 지정하고 포트는 호스트의 루프백에서만 게시하세요. 기본 제공되는 `docker-compose.yml`은 다른 머신에서 접근 가능한 `8420:8420`을 게시하므로 다음과 같이 변경하세요:

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

UX 컨테이너는 키링을 포함한 데이터를 `/root/.qorechain-lightnode`의 명명된 볼륨에 영속화하며, `QORECHAIN_RPC_ADDR` 환경 변수에서 체인 RPC 주소를 읽습니다. 노드가 자체 트랜잭션에 직접 서명하므로, UX 컨테이너도 SX 에디션처럼 등록하고 하트비트를 보낼 수 있습니다. UX 이미지에는 `qorechaind`가 포함되어 있지 않으므로 그 안에서는 `qorechaind` 대체 경로를 사용할 수 없습니다.

## 실행

UX 노드를 시작하세요:

```bash
build/lightnode-ux start
```

이는 데몬과 내장 대시보드 서버를 함께 실행합니다. UX 에디션은 항상 대시보드를 활성화합니다. 시작 시 바이너리는 대시보드 URL을 출력합니다.

UX 에디션은 SX 에디션과 설정을 공유합니다: `~/.qorechain-lightnode`에서 동일한 `config.toml`을 읽고 동일한 키링을 사용하며, 동일한 명령(`onboard`, `keys`, `register`, `status`, `selftest` 등)을 갖추고 있습니다. 최초 설정은 `lightnode-sx` 대신 `lightnode-ux`를 사용하는 동일한 다섯 단계입니다:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

각 명령이 하는 일은 [SX 에디션](/light-node/sx-edition#first-run-onboard)을, 요구 사항은 [등록 및 라이선싱](/light-node/registration-and-licensing)을 참고하세요. UX 에디션 내부의 데몬은 Linux, macOS, Windows에서 SX 에디션과 동일한 방식으로 서명하고 하트비트를 보냅니다. UX 바이너리에서 `register`를 실행하면 노드는 유형 `ux`로 등록됩니다.

## 포트 8420의 웹 대시보드

대시보드는 **포트 8420**에 노출됩니다. 이는 `lightnode-ux` Docker 이미지가 선언하는 포트(`EXPOSE 8420`)이자 바이너리가 기본으로 바인딩하는 값이므로, Docker에서 실행할 때 대시보드는 `8420`에 게시됩니다:

```
http://localhost:8420
```

:::caution compose 포트 매핑을 확인하세요
다른 곳의 일부 설명에서는 대시보드에 대해 포트 8080을 참조합니다. 권위 있는 값은 **8420**입니다 — 이것이 이미지가 실제로 노출하는 값이자 데몬이 기본으로 바인딩하는 값입니다. 자체 `docker-compose.yml`이나 리버스 프록시를 조정하는 경우, 8080이 아니라 **8420**으로 매핑하세요.
:::

:::caution 대시보드를 보호하세요
대시보드에는 로그인이 없습니다. `[dashboard] token`을 설정하지 않으면 포트 8420에 접근할 수 있는 사람은 누구나 회원님의 설정, 위임, 보상을 읽을 수 있습니다. 개인 키가 제공되는 일은 결코 없습니다. 토큰을 설정하면 모든 `/api` 경로와 `/ws` 연결에 `Authorization: Bearer <token>`이 필요합니다(QoreX가 노드와 페어링할 때 보내는 토큰). 일반 `http`에서는 이 토큰이 암호화되지 않은 채 네트워크를 통과합니다. 바이너리는 이제 모든 인터페이스가 아니라 **기본적으로 루프백에만**(`127.0.0.1:8420`) 바인딩되며, 더 넓게 수신 대기하도록 구성한 경우 시작 시 경고를 출력합니다 — 하지만 이 경고는 거부가 아닙니다. 바인딩을 의도적으로 넓히는 경우(예: 다른 머신에서 접근하기 위해, 또는 Docker에서 포트를 게시하기 때문에), 직접 노출하는 대신 토큰을 설정하고 https(리버스 프록시 또는 SSH 터널) 뒤에 두세요. 넓은 네트워크 바인딩만으로는 같은 브라우저에서 열려 있는 다른 페이지가 연결하는 것을 막지 못하므로, WebSocket 텔레메트리 연결도 브라우저의 `Origin`을 확인합니다.
:::

## 대시보드가 보여주는 것

대시보드는 다음 뷰로 구성됩니다:

- **Overview** — 블록 높이와 한눈에 보는 노드 상태.
- **Validators** — 본딩된 검증자 집합.
- **Delegation** — 운영자 계정(`operator_address`)에서 미러링된 위임.
- **Network** — 실시간 네트워크 텔레메트리와 최근 동기화된 헤더.
- **Bridge** — 크로스체인 브리지 텔레메트리.
- **Tokenomics** — 토큰 이코노믹스 텔레메트리.
- **Settings** — 노드의 유효 구성.

라이트 노드 3.1.11부터 대시보드는 노드가 더 새로운 릴리스를 발견하면 배너를 표시합니다([SX 에디션: 업데이트](/light-node/sx-edition#updating) 참조). 로컬 API는 `GET /api/update`에서 같은 정보를 제공합니다.

텔레메트리는 실시간으로 업데이트되며, 데몬이 검증자, 네트워크, 브리지, 토크노믹스 데이터를 독립적인 간격으로 새로 고칩니다(`config.toml`의 `[telemetry]` 아래에서 구성 가능).

### 로컬 전용 배너

노드에 **체인 RPC 엔드포인트가 구성되어 있지 않으면**, 대시보드는 **로컬 전용 모드**로 실행되며 그 상태를 설명하는 눈에 띄는 배너를 표시합니다: PQC 스택은 검증되었지만, 노드는 어떤 체인도 동기화하지 않으므로 블록 높이는 `0`에 머뭅니다. 배너는 호스트에서 온보딩 마법사를 실행하라고 안내합니다(배너에는 `lightnode-sx`가 표시되지만 `lightnode-ux onboard`도 같은 일을 합니다):

```bash
lightnode-sx onboard
```

마법사는 PQC 셀프 테스트를 실행하고, 체인 엔드포인트를 요청하며, 노드 키를 가져오거나 생성합니다. 엔드포인트가 구성되면 노드를 재시작하면 대시보드가 실시간 체인 데이터를 표시하기 시작합니다.

## 다음으로 갈 곳

- [등록 및 라이선싱](/light-node/registration-and-licensing) — 노드를 온체인에 등록하기.
- [보상 및 모니터링](/light-node/rewards-and-monitoring) — 3% 라이트 노드 분배분이 어떻게 적립되고 청구되는지, 그리고 노드 상태를 모니터링하는 방법.
