---
slug: /getting-started/connecting-to-testnet
title: 테스트넷 연결하기
sidebar_label: 테스트넷 연결하기
sidebar_position: 4
---

# 테스트넷 연결하기

올바른 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 운영 중인 QoreChain Diana 테스트넷에 참여하세요.

:::note
이 페이지는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 다룹니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 운영 중이며, 별도의 제네시스, 피어, 연결 세부 정보를 포함한 전용 **메인넷 연결하기** 페이지가 있습니다.
:::

---

## 제네시스 다운로드

로컬 제네시스 파일을 공식 테스트넷 제네시스로 교체하세요.

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

이 파일은 검증자 집합, 토큰 할당, 모듈 매개변수를 포함하여 Diana 테스트넷의 초기 상태를 정의합니다.

---

## 피어 구성

기존 테스트넷 피어에 연결하도록 노드 구성을 편집하세요.

`~/.qorechaind/config/config.toml`을 열고 `persistent_peers` 필드를 설정하세요.

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

최신 피어 목록은 [QoreChain 저장소](https://github.com/qorechain/qorechain-core)를 참조하세요.

### 권장 설정

`config.toml`에서 다음 항목도 조정할 수 있습니다.

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

이 값들은 Diana 테스트넷의 블록 타임과 처리량에 맞게 조정되어 있습니다.

---

## 노드 시작

네트워크와의 동기화를 시작하려면 노드를 실행하세요.

```bash
./qorechaind start
```

노드는 피어에 연결하여 제네시스부터 블록 다운로드를 시작합니다. 초기 동기화 시간은 현재 체인 높이와 네트워크 속도에 따라 다릅니다.

---

## 동기화 상태 확인

노드가 최신 블록을 따라잡고 있는지 확인하세요.

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — 노드가 아직 동기화 중입니다. 따라잡을 때까지 기다리세요.
* `false` — 노드가 완전히 동기화되어 새 블록을 처리하고 있습니다.

최신 블록 높이도 확인할 수 있습니다.

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## 모니터링

QoreChain은 노드 상태 및 성능을 모니터링하기 위한 여러 엔드포인트를 노출합니다.

### Prometheus 메트릭

원시 메트릭은 다음에서 확인할 수 있습니다.

```
http://localhost:26660/metrics
```

이 메트릭은 모든 Prometheus 호환 수집기로 스크랩할 수 있습니다.

### Grafana 대시보드

Docker Compose를 통해 실행하는 경우 Grafana는 다음에서 사용할 수 있습니다.

```
http://localhost:3001
```

처음 로그인할 때 메시지가 표시되면 자신의 자격 증명을 설정하세요 — 기본값을 그대로 두지 마세요. 사전 구성된 대시보드는 블록 생성, 트랜잭션 처리량, 피어 연결, 리소스 사용량을 표시합니다.

### REST 상태 점검

REST API는 빠른 상태 엔드포인트를 제공합니다.

```
http://localhost:1317
```

---

## 포트 참조

| 포트    | 프로토콜  | 설명                                               |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — 트랜잭션 조회 및 브로드캐스트                 |
| `26656` | TCP       | P2P — 피어 투 피어 네트워크 통신                    |
| `1317`  | HTTP      | REST API — HTTP를 통한 체인 상태 조회              |
| `9090`  | gRPC      | gRPC API — 프로그래밍 방식 체인 접근               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 호환 RPC (체인 ID `9800`)  |
| `8546`  | WebSocket | EVM WebSocket — 실시간 EVM 이벤트 구독             |
| `8899`  | HTTP      | SVM RPC — Solana 호환 RPC                          |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                       |

---

## 다음 단계

* [지갑 설정](/getting-started/wallet-setup) — 테스트넷용 지갑 구성
* [첫 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
