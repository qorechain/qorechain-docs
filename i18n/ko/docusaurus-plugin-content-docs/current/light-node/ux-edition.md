---
slug: /light-node/ux-edition
title: UX 에디션 (웹 대시보드)
sidebar_label: UX 에디션
sidebar_position: 3
---

# UX 에디션 — 웹 대시보드

**UX (User eXperience)** 에디션은 SX 에디션과 동일한 라이트 노드 데몬을 실행하지만, **내장 웹 대시보드**를 추가하여 브라우저에서 노드와 네트워크를 지켜볼 수 있습니다. 바이너리는 `lightnode-ux`입니다. SX 에디션과 마찬가지로, 이는 라이트 노드의 **v3.1.1** 계열입니다(체인 버전과는 별개인 자체 버전).

UX 에디션은 데스크톱 사용과, 명령줄보다 시각적 인터페이스를 선호하는 운영자에게 적합한 선택입니다.

## 설치

### 소스에서 빌드

UX 에디션은 **Go 1.26.1**이 필요하며, 포스트 양자 네이티브 라이브러리를 위해 CGO를 활성화하여 빌드합니다:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

이는 `build/lightnode-ux`를 생성합니다.

### Docker

UX 서비스는 `Dockerfile.ux`에서 빌드됩니다:

```bash
docker compose up lightnode-ux
```

UX 컨테이너는 `/root/.qorechain-lightnode`의 명명된 볼륨에 데이터를 영속화하며, `QORECHAIN_RPC_ADDR` 환경 변수에서 체인 RPC 주소를 읽습니다.

## 실행

UX 노드를 시작하세요:

```bash
build/lightnode-ux start
```

이는 데몬과 내장 대시보드 서버를 함께 실행합니다. UX 에디션은 항상 대시보드를 활성화합니다. 시작 시 바이너리는 대시보드 URL을 출력합니다.

UX 에디션은 SX 에디션과 설정을 공유합니다: `~/.qorechain-lightnode`에서 동일한 `config.toml`을 읽고 동일한 Dilithium-5 키링을 사용합니다. 아직 노드를 구성하지 않았다면, 먼저 SX 마법사(`lightnode-sx onboard`)를 실행하여 설정을 작성하고 키를 가져오거나 생성하세요 — [SX 에디션](/light-node/sx-edition)을 참고하세요.

## 포트 8420의 웹 대시보드

대시보드는 **포트 8420**에 노출됩니다. 이는 `lightnode-ux` Docker 이미지가 선언하는 포트(`EXPOSE 8420`)이자 바이너리가 기본으로 바인딩하는 값이므로, Docker에서 실행할 때 대시보드는 `8420`에 게시됩니다:

```
http://localhost:8420
```

:::caution compose 포트 매핑을 확인하세요
다른 곳의 일부 설명에서는 대시보드에 대해 포트 8080을 참조합니다. 권위 있는 값은 **8420**입니다 — 이것이 이미지가 실제로 노출하는 값이자 데몬이 기본으로 바인딩하는 값입니다. 자체 `docker-compose.yml`이나 리버스 프록시를 조정하는 경우, 8080이 아니라 **8420**으로 매핑하세요.
:::

## 대시보드가 보여주는 것

대시보드는 다음 뷰로 구성됩니다:

- **Overview** — 블록 높이와 한눈에 보는 노드 상태.
- **Validators** — 본딩된 검증자 집합.
- **Delegation** — 현재 위임과 그 분할.
- **Network** — 실시간 네트워크 텔레메트리와 최근 동기화된 헤더.
- **Bridge** — 크로스체인 브리지 텔레메트리.
- **Tokenomics** — 토큰 이코노믹스 텔레메트리.
- **Settings** — 노드의 유효 구성.

텔레메트리는 실시간으로 업데이트되며, 데몬이 검증자, 네트워크, 브리지, 토크노믹스 데이터를 독립적인 간격으로 새로 고칩니다(`config.toml`의 `[telemetry]` 아래에서 구성 가능).

### 로컬 전용 배너

노드에 **체인 RPC 엔드포인트가 구성되어 있지 않으면**, 대시보드는 **로컬 전용 모드**로 실행되며 그 상태를 설명하는 눈에 띄는 배너를 표시합니다: PQC 스택은 검증되었지만, 노드는 어떤 체인도 동기화하지 않으므로 블록 높이는 `0`에 머뭅니다. 배너는 호스트에서 온보딩 마법사를 실행하라고 안내합니다:

```bash
lightnode-sx onboard
```

마법사는 PQC 셀프 테스트를 실행하고, 체인 엔드포인트를 요청하며, 검증자 키를 가져오거나 생성합니다. 엔드포인트가 구성되면 노드를 재시작하면 대시보드가 실시간 체인 데이터를 표시하기 시작합니다.

## 다음으로 갈 곳

- [등록 및 라이선싱](/light-node/registration-and-licensing) — 노드를 온체인에 등록하기.
- [보상 및 모니터링](/light-node/rewards-and-monitoring) — 3% 라이트 노드 분배분을 얻고 노드 상태를 모니터링하기.
