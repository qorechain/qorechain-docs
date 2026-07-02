---
slug: /getting-started/connecting-to-testnet
title: 테스트넷 연결하기
sidebar_label: 테스트넷 연결하기
sidebar_position: 4
---

# 테스트넷 연결하기

올바른 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 라이브 QoreChain Diana 테스트넷에 참여하세요.

:::note
이 페이지는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 다룹니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 라이브 상태이며, 별도의 제네시스, 피어, 연결 정보를 담은 전용 **메인넷 연결하기** 페이지가 있습니다.
:::

## 퍼블릭 엔드포인트

**테스트넷 조회 또는 트랜잭션 브로드캐스트**만 필요하다면 퍼블릭 엔드포인트를 사용하세요:

| 서비스 | URL |
|---|---|
| 컨센서스 RPC | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (체인 ID `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (읽기 전용) | `https://svm-testnet.qore.host` |
| 블록 익스플로러 | [explore.qore.network](https://explore.qore.network) (Testnet으로 전환) |

테스트넷 QOR은 [대시보드 Faucet](/dashboard/faucet)에서 받을 수 있습니다.

---

## 제네시스 다운로드

체인 자체에서 실시간으로 제공되는 공식 테스트넷 제네시스로 로컬 제네시스 파일을 교체하세요:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

이 파일은 밸리데이터 세트, 토큰 할당, 모듈 파라미터를 포함한 Diana 테스트넷의 초기 상태를 정의합니다.

:::caution
Diana 테스트넷은 프리릴리스 빌드가 배포됨에 따라 주기적으로 **재제네시스**(높이 0으로 리셋)됩니다. 리셋 이후 노드가 동기화를 멈추면 제네시스를 다시 다운로드하고 새 데이터 디렉터리에서 시작하세요.
:::

---

## 피어 구성

기존 테스트넷 피어에 연결하도록 노드 구성을 편집하세요.

네트워크에서 직접 현재 피어를 조회한 다음, `~/.qorechaind/config/config.toml`의 `persistent_peers` 필드를 설정하세요:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

또한 `~/.qorechaind/config/app.toml`에서 수수료 하한을 설정하세요(테스트넷은 메인넷과 동일한 **0.1uqor** 최소 가스 가격을 사용합니다):

```toml
minimum-gas-prices = "0.1uqor"
```

### 권장 설정

`config.toml`에서 다음 항목도 조정하는 것이 좋습니다:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

이 값들은 Diana 테스트넷의 블록 시간과 처리량에 맞게 조정되어 있습니다.

---

## 노드 시작

노드를 실행하여 네트워크와의 동기화를 시작하세요:

```bash
./qorechaind start
```

노드가 피어에 연결되고 제네시스부터 블록 다운로드를 시작합니다. 초기 동기화 시간은 현재 체인 높이와 네트워크 속도에 따라 달라집니다.

---

## 동기화 상태 확인

노드가 최신 블록을 따라잡고 있는지 확인하세요:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — 노드가 아직 동기화 중입니다. 따라잡을 때까지 기다리세요.
* `false` — 노드가 완전히 동기화되어 새 블록을 처리하고 있습니다.

최신 블록 높이도 확인할 수 있습니다:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## 모니터링

QoreChain은 노드 상태와 성능을 모니터링하기 위한 여러 엔드포인트를 제공합니다.

### Prometheus 메트릭

원시 메트릭은 다음에서 확인할 수 있습니다:

```
http://localhost:26660/metrics
```

이 메트릭은 Prometheus 호환 수집기라면 어느 것으로든 스크랩할 수 있습니다.

### Grafana 대시보드

Docker Compose로 실행 중이라면 Grafana는 다음에서 사용할 수 있습니다:

```
http://localhost:3001
```

최초 로그인 시 안내에 따라 자신만의 자격 증명을 설정하세요 — 기본값을 그대로 두지 마세요. 사전 구성된 대시보드에서 블록 생성, 트랜잭션 처리량, 피어 연결, 리소스 사용량을 확인할 수 있습니다.

### REST 헬스 체크

REST API는 간단한 상태 엔드포인트를 제공합니다:

```
http://localhost:1317
```

---

## 포트 참조

| 포트    | 프로토콜  | 설명                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — 트랜잭션 조회 및 브로드캐스트             |
| `26656` | TCP       | P2P — 피어 간 네트워크 통신           |
| `1317`  | HTTP      | REST API — HTTP를 통한 체인 상태 조회              |
| `9090`  | gRPC      | gRPC API — 프로그래밍 방식의 체인 접근               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 호환 RPC (체인 ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — 실시간 EVM 이벤트 구독  |
| `8899`  | HTTP      | SVM RPC — Solana 호환 RPC                    |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                        |

---

## 다음 단계

* [지갑 설정](/getting-started/wallet-setup) — 테스트넷용 지갑 구성하기
* [첫 번째 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
