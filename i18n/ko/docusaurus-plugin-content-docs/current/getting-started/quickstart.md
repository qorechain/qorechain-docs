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
docker compose up -d
```

이 명령은 다음 서비스를 시작합니다.

| 서비스             | 포트                                                                    | 설명                                          |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | 멀티 VM 지원을 갖춘 전체 블록체인 노드        |
| **ai-sidecar**     | `50051`                                                                 | QCAI 이상 탐지 및 위험 점수 산정 엔진         |
| **indexer**        | --                                                                      | 과거 데이터 조회를 위한 블록 인덱서          |
| **postgres**       | `5432`                                                                  | 인덱서를 위한 데이터베이스 백엔드            |
| **prometheus**     | `9091`                                                                  | 메트릭 수집                                   |
| **grafana**        | `3001`                                                                  | 모니터링 대시보드                            |

모든 컨테이너가 정상 상태가 되면 노드가 네트워크와의 동기화를 시작합니다.

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

### 노드 초기화

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

이렇게 하면 `~/.qorechaind/` 아래에 기본 구성 및 데이터 디렉터리가 생성됩니다.

### 노드 시작

```bash
./qorechaind start
```

노드는 기본 설정으로 시작됩니다. 적절한 제네시스 및 피어 구성으로 운영 중인 네트워크에 참여하려면 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참조하세요.

:::note
이 페이지의 예시는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 대상으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 운영 중이며, 전용 **메인넷 연결하기** 페이지가 있습니다.
:::

---

## 설치 확인

노드가 올바르게 실행되고 있는지 확인하세요.

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

성공적인 응답에는 노드의 `moniker`, `network`(`qorechain-diana`여야 함), 현재 블록 높이가 포함됩니다.

---

## 다음 단계

* [테스트넷 연결하기](/getting-started/connecting-to-testnet) — 운영 중인 Diana 테스트넷에 참여
* [지갑 설정](/getting-started/wallet-setup) — 체인과 상호작용할 지갑 구성
* [첫 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
* [메인넷 연결하기](/getting-started/connecting-to-mainnet) — 운영 중인 Vladi 메인넷에 참여
* [SDK 개요](/sdk/overview) — 코드로 QoreChain 기반 애플리케이션 구축
