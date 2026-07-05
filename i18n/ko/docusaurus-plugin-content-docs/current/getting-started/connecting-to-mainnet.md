---
slug: /getting-started/connecting-to-mainnet
title: 메인넷에 연결하기
sidebar_label: 메인넷에 연결하기
sidebar_position: 3
---

# 메인넷에 연결하기

공식 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 라이브 QoreChain Vladi 메인넷에 참여하세요.

:::note
이 페이지는 **2026년 6월 7일 23:59 UTC**부터 가동 중이며 Cosmos SDK v0.53 기반의 체인 버전 **v3.1.85**를 실행하는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 16진수 `0x2649`)을 다룹니다. **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)에 대해서는 [테스트넷에 연결하기](/getting-started/connecting-to-testnet)를 참고하고, 실제 운영에 들어가기 전에 테스트넷에서 설정을 미리 연습해 보세요.
:::

## 공개 엔드포인트

**체인 조회나 트랜잭션 브로드캐스트**만 필요하다면 자체 노드를 운영할 필요가 없습니다. 공개 엔드포인트는 다음과 같습니다:

| 서비스 | URL |
|---|---|
| 합의(Consensus) RPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (체인 ID `9801`) |
| SVM JSON-RPC (읽기 전용) | `https://svm.qore.host` |
| 블록 익스플로러 | [explore.qore.network](https://explore.qore.network) |

대량 트래픽이나 프로덕션 워크로드(거래소, 인덱서)의 경우 아래 설명에 따라 자체 노드를 운영하세요.

---

## 설치

`qorechaind` 바이너리는 공식 사전 빌드 번들을 사용하거나 소스에서 직접 빌드하여 설치할 수 있습니다.

### 사전 빌드 바이너리 번들 (linux/amd64)

공식 릴리스 번들에는 `qorechaind`와 필수 공유 라이브러리(`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`)가 포함되어 있습니다:

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.83-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# fa035b3699e92d755f47445cbf7dde4e1f6c224343008546aa159b7eb46a805c

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

버전별 번들은 [download.qore.host](https://download.qore.host)에 게시되며, 각 릴리스에는 SHA-256 체크섬이 함께 제공됩니다 — 항상 **최신** 게시 번들을 설치하세요.

:::caution 노드를 최신 상태로 유지하세요
풀 노드는 네트워크의 체인 버전(현재 **v3.1.85**)을 따라가야 합니다. 오래된 노드는 새로운 트랜잭션 유형(예: v3.1.83에서 도입된 `eth_secp256k1` 서명 트랜잭션)을 디코딩할 수 없으며, 해당 트랜잭션이 블록에 포함되는 즉시 동기화가 중단됩니다.
:::

### 소스에서 빌드

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

전체 사전 요구 사항(Go 1.26+, CGO, Rust 툴체인, 네이티브 라이브러리)은 [소스에서 빌드하기](/developer-guide/building-from-source)를 참고하세요.

### 노드 초기화

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

이 명령은 `~/.qorechaind/` 아래에 기본 설정 및 데이터 디렉터리를 생성합니다.

---

## 제네시스 다운로드

로컬 제네시스 파일을 공식 메인넷 제네시스로 교체하세요:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

같은 파일은 체인 자체에서도 실시간으로 제공되므로, 다운로드한 파일과 교차 검증할 수 있습니다:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

이 파일은 제네시스 검증인 집합, 토큰 할당(제네시스 시점 TGE), 모듈 파라미터를 포함한 Vladi 메인넷의 초기 상태를 정의합니다.

---

## 피어 구성

공개 메인넷 센트리 노드에 연결하도록 노드 설정을 편집하세요.

`~/.qorechaind/config/config.toml`을 열고 `persistent_peers` 필드를 설정합니다:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

또한 `~/.qorechaind/config/app.toml`에서 최소 가스 가격을 설정하세요(네트워크 수수료 하한은 **0.1uqor**입니다):

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

이 값들은 Vladi 메인넷의 블록 생성 시간과 처리량에 맞게 튜닝되어 있습니다.

---

## 빠른 부트스트랩 (스냅샷)

제네시스부터 동기화하면 오랜 시간이 걸릴 수 있습니다. 최신 체인 데이터 스냅샷이 [download.qore.host](https://download.qore.host)에 게시되어 있습니다:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

스냅샷은 블록 높이가 표기된 파일명으로 게시됩니다 — 가장 최근 스냅샷은 [download.qore.host](https://download.qore.host)에서 확인하세요. 대안으로 **state sync**를 사용할 수도 있습니다 — 전체 워크플로는 [노드 운영하기](/developer-guide/running-a-node)를 참고하세요.

---

## 노드 시작

노드를 실행하여 네트워크와의 동기화를 시작하세요:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

노드가 피어에 연결되고 블록 다운로드를 시작합니다(제네시스부터, 또는 스냅샷을 복원했다면 해당 스냅샷 높이부터).

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

올바른 네트워크에 연결되어 있는지 확인하세요 — `network` 필드에 `qorechain-vladi`가 표시되어야 합니다:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## 모니터링

QoreChain은 노드 상태와 성능을 모니터링할 수 있는 여러 엔드포인트를 제공합니다.

### Prometheus 메트릭

원시 메트릭은 다음 주소에서 확인할 수 있습니다:

```
http://localhost:26660/metrics
```

이 메트릭은 Prometheus 호환 수집기라면 어떤 것으로도 수집할 수 있습니다.

### Grafana 대시보드

Docker Compose로 실행 중인 경우 Grafana는 다음 주소에서 이용할 수 있습니다:

```
http://localhost:3001
```

최초 로그인 시 안내에 따라 반드시 자신만의 자격 증명을 설정하세요 — 기본값을 그대로 두면 안 됩니다. 사전 구성된 대시보드는 블록 생성, 트랜잭션 처리량, 피어 연결, 리소스 사용량을 보여줍니다.

### REST 헬스 체크

REST API는 간단한 상태 확인 엔드포인트를 제공합니다:

```
http://localhost:1317
```

---

## 포트 참조

| 포트    | 프로토콜  | 설명                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — 트랜잭션 조회 및 브로드캐스트                  |
| `26656` | TCP       | P2P — 피어 간 네트워크 통신                |
| `1317`  | HTTP      | REST API — HTTP를 통한 체인 상태 조회                   |
| `9090`  | gRPC      | gRPC API — 프로그래밍 방식의 체인 접근                    |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 호환 RPC (체인 ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — 실시간 EVM 이벤트 구독       |
| `8899`  | HTTP      | SVM RPC — Solana 호환 RPC                         |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                             |

---

## 네트워크 정보

| 항목             | 값                                  |
| ----------------- | -------------------------------------- |
| 체인 ID          | `qorechain-vladi`                      |
| EVM 체인 ID      | `9801` (16진수 `0x2649`)                  |
| 체인 버전     | v3.1.85                                |
| 가동 시작 시점        | 2026년 6월 7일 23:59 UTC                  |
| 토큰             | QOR (`uqor`, 10^6 마이크로 단위 = 1 QOR) |
| 최소 가스 가격 | `0.1uqor`                              |
| 계정 접두사    | `qor`                                  |
| 검증인 접두사  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## 다음 단계

* [노드 운영하기](/developer-guide/running-a-node) — 거래소와 통합사를 위한 풀/RPC 노드 운영
* [거래소 및 통합사 가이드](/developer-guide/exchange-integration) — 입금, 출금, 모니터링
* [검증인 운영하기](/developer-guide/running-a-validator) — 검증인 생성 및 운영
* [지갑 설정](/getting-started/wallet-setup) — 메인넷용 지갑 구성
* [첫 트랜잭션 보내기](/getting-started/first-transaction) — 첫 QOR 전송 실행
* [테스트넷에 연결하기](/getting-started/connecting-to-testnet) — 무료 테스트를 위한 Diana 테스트넷 참여
* [네트워크](/appendix/networks) — 체인 ID, 포트, 전체 네트워크 참조 자료
