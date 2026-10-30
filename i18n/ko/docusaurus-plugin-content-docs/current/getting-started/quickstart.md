---
slug: /getting-started/quickstart
title: 빠른 시작
sidebar_label: 빠른 시작
sidebar_position: 1
---

# 빠른 시작

몇 분 안에 QoreChain 노드를 실행하세요. 가장 빠른 설정을 위해 Docker Compose를 선택하거나, 완전한 제어를 위해 소스에서 빌드하세요.

---

## Docker Compose (권장)

모든 서비스가 사전 구성된 전체 QoreChain 환경을 실행하는 가장 간단한 방법입니다.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
cp .env.example .env
cp .env.sidecar.example .env.sidecar
# edit .env and set GRAFANA_PASSWORD (Compose refuses to start without it)
docker compose up -d
```

처음 시작하기 전에 위와 같이 `.env.example`을 `.env`로, `.env.sidecar.example`을 `.env.sidecar`로 복사하고 `GRAFANA_PASSWORD`를 설정하세요.

이 명령은 다음 서비스를 시작합니다.

| 서비스             | 포트                                                                    | 설명                                          |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` / `8546` (EVM) | 멀티 VM 지원을 갖춘 전체 블록체인 노드        |
| **ai-sidecar**     | `50051`                                                                 | QCAI 이상 탐지 및 위험 점수 산정 엔진         |
| **indexer**        | --                                                                      | 과거 데이터 조회를 위한 블록 인덱서          |
| **postgres**       | `5432`                                                                  | 인덱서를 위한 데이터베이스 백엔드            |
| **prometheus**     | `9091`                                                                  | 메트릭 수집                                   |
| **grafana**        | `3001`                                                                  | 모니터링 대시보드                            |

모든 컨테이너가 정상 상태가 되면 **로컬 단일 노드 개발용 체인**이 만들어집니다(자체 제네시스를 초기화하며, 메인넷이나 테스트넷에 참여하지 않습니다). 운영 중인 네트워크에 참여하려면 [메인넷 연결하기](/getting-started/connecting-to-mainnet) 또는 [테스트넷 연결하기](/getting-started/connecting-to-testnet) 페이지를 따르세요.

---

## 소스에서 빌드

### 전제 조건

* CGO가 활성화된 **Go 1.26+**
* **Rust 툴체인**(PQC 암호화 및 SVM 런타임 라이브러리 컴파일용)
* **Git**

### 바이너리 빌드

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

:::caution 소스 빌드는 로컬 개발용입니다
공개 소스 트리는 커뮤니티 바이너리를 빌드합니다. 전체 명령 집합을 갖추고 있지만 포스트 양자 서명기는 포함하지 않습니다. `tx pqc gen-key`와 `tx pqc cosign`은 오류("requires the full build")를 반환하므로, 하이브리드 서명이 필요한 네트워크용 트랜잭션을 생성할 수 없으며, 스텁 키퍼는 네트워크의 합의 상태를 재현하지 않습니다. 메인넷이나 테스트넷에 참여하거나 트랜잭션을 보내려면 [download.qore.host](https://download.qore.host)의 `latest.json`에 명시된 릴리스 바이너리를 설치하세요.
:::

### 노드 초기화

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

이렇게 하면 `~/.qorechaind/` 아래에 기본 구성 및 데이터 디렉터리가 생성됩니다. 단독으로 시작하면 노드는 로컬 단일 노드 체인을 형성합니다. 운영 중인 네트워크에 참여하려면 연결 페이지를 따르세요.

### 노드 시작

```bash
./qorechaind start
```

노드는 기본 설정으로 시작됩니다. 적절한 제네시스 및 피어 구성으로 운영 중인 네트워크에 참여하려면 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참조하세요.

:::note
이 페이지의 예시는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 대상으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 운영 중이며(2026년 10월 29일부터 릴리스 v3.2.5이며, 테스트넷은 2026년 10월 27일부터 v3.2.6을 실행합니다), 전용 **메인넷 연결하기** 페이지가 있습니다.
:::

---

## 설치 확인

노드가 올바르게 실행되고 있는지 확인하세요.

```bash
# Check that the binary runs
./qorechaind --help
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

성공적인 응답에는 노드의 `moniker`, `network`(위에서 만든 로컬 개발용 체인의 경우 `qorechain-diana`, 또는 참여한 체인), 현재 블록 높이가 포함됩니다.

---

## 다음 단계

* [테스트넷 연결하기](/getting-started/connecting-to-testnet) — 운영 중인 Diana 테스트넷에 참여
* [지갑 설정](/getting-started/wallet-setup) — 체인과 상호작용할 지갑 구성
* [첫 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
* [메인넷 연결하기](/getting-started/connecting-to-mainnet) — 운영 중인 Vladi 메인넷에 참여
* [SDK 개요](/sdk/overview) — 코드로 QoreChain 기반 애플리케이션 구축
