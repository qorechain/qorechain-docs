---
slug: /getting-started/connecting-to-mainnet
title: 메인넷 연결하기
sidebar_label: 메인넷 연결하기
sidebar_position: 3
---

# 메인넷 연결하기

올바른 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 운영 중인 QoreChain Vladi 메인넷에 참여하세요.

:::note
이 페이지는 **2026년 6월 7일 23:59 UTC**부터 운영 중이며 Cosmos SDK v0.53에서 체인 버전 **v3.1.80**을 실행하는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, hex `0x2649`)을 다룹니다. **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)의 경우 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참조하고, 실제 운영에 들어가기 전에 그곳에서 설정을 연습하세요.
:::

:::warning
메인넷 시드 노드, 영구 피어, 제네시스 URL 및 그 SHA-256 체크섬은 각 공식 메인넷 릴리스와 함께 게시됩니다. **항상 공식 메인넷 저장소/릴리스에서 현재 값을 얻고** 시작하기 전에 제네시스 체크섬을 검증하세요. 아래의 플레이스홀더(`<MAINNET_SEED_NODE_ID>@<host>:26656`, 제네시스 URL, 스냅샷 URL)는 실제 게시된 값으로 대체해야 합니다 — 검증되지 않은 피어나 제네시스에 대해 메인넷 노드를 시작하지 마세요.
:::

---

## 설치

소스에서 빌드하거나 공식 Docker 이미지를 가져와서 `qorechaind` 바이너리를 설치하세요.

### 소스에서 빌드

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

전체 전제 조건(Go 1.26+, CGO, Rust 툴체인, 네이티브 라이브러리)은 [소스에서 빌드하기](/developer-guide/building-from-source)를 참조하세요.

### 노드 초기화

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

이렇게 하면 `~/.qorechaind/` 아래에 기본 구성 및 데이터 디렉터리가 생성됩니다.

---

## 제네시스 다운로드

로컬 제네시스 파일을 공식 메인넷 제네시스로 교체하세요.

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

계속하기 전에 공식 메인넷 릴리스에 게시된 값과 제네시스 체크섬을 검증하세요.

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

이 파일은 제네시스 검증자 집합, 토큰 할당(제네시스 시점의 TGE), 모듈 매개변수를 포함하여 Vladi 메인넷의 초기 상태를 정의합니다.

:::note
`<MAINNET_GENESIS_URL>` 및 `<MAINNET_GENESIS_SHA256>`은 플레이스홀더입니다. 공식 메인넷 릴리스/저장소에서 현재 제네시스 URL과 그 SHA-256 체크섬을 얻고, 노드를 시작하기 전에 체크섬이 일치하는지 검증하세요.
:::

---

## 피어 구성

기존 메인넷 피어에 연결하도록 노드 구성을 편집하세요.

`~/.qorechaind/config/config.toml`을 열고 `seeds` 및 `persistent_peers` 필드를 설정하세요.

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
위의 시드 및 영구 피어 값은 플레이스홀더입니다. 공식 메인넷 저장소/릴리스에서 현재 메인넷 시드 노드 ID, 호스트, 포트를 얻으세요. 검증되지 않은 피어에 연결하지 마세요.
:::

### 권장 설정

`config.toml`에서 다음 항목도 조정할 수 있습니다.

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

이 값들은 Vladi 메인넷의 블록 타임과 처리량에 맞게 조정되어 있습니다.

---

## 노드 시작

네트워크와의 동기화를 시작하려면 노드를 실행하세요.

```bash
./qorechaind start
```

노드는 피어에 연결하여 제네시스부터 블록 다운로드를 시작합니다. 초기 동기화 시간은 현재 체인 높이와 네트워크 속도에 따라 다릅니다. 더 빠른 부트스트랩을 위해 운영자는 일반적으로 상태 동기화 또는 최근 스냅샷을 사용합니다 — 전체 상태 동기화 및 스냅샷 워크플로는 [노드 운영하기](/developer-guide/running-a-node)를 참조하세요.

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

올바른 네트워크에 있는지 확인하세요 — `network` 필드는 `qorechain-vladi`를 보고해야 합니다.

```bash
curl localhost:26657/status | jq '.result.node_info.network'
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

| 포트    | 프로토콜  | 설명                                                    |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — 트랜잭션 조회 및 브로드캐스트                      |
| `26656` | TCP       | P2P — 피어 투 피어 네트워크 통신                         |
| `1317`  | HTTP      | REST API — HTTP를 통한 체인 상태 조회                   |
| `9090`  | gRPC      | gRPC API — 프로그래밍 방식 체인 접근                    |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 호환 RPC (체인 ID `9801`)       |
| `8546`  | WebSocket | EVM WebSocket — 실시간 EVM 이벤트 구독                  |
| `8899`  | HTTP      | SVM RPC — Solana 호환 RPC                               |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                            |

---

## 네트워크 정보

| 필드              | 값                                     |
| ----------------- | -------------------------------------- |
| 체인 ID           | `qorechain-vladi`                      |
| EVM 체인 ID       | `9801` (hex `0x2649`)                  |
| 체인 버전         | v3.1.80                                |
| 운영 시작         | 2026년 6월 7일 23:59 UTC               |
| 토큰              | QOR (`uqor`, 10^6 마이크로 단위 = 1 QOR) |
| 계정 접두사       | `qor`                                  |
| 검증자 접두사     | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## 다음 단계

* [노드 운영하기](/developer-guide/running-a-node) — 거래소 및 통합업체를 위한 풀/RPC 노드 운영
* [검증자 운영하기](/developer-guide/running-a-validator) — 검증자 생성 및 운영
* [지갑 설정](/getting-started/wallet-setup) — 메인넷용 지갑 구성
* [첫 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
* [테스트넷 연결하기](/getting-started/connecting-to-testnet) — 무료 테스트를 위한 Diana 테스트넷 참여
* [네트워크](/appendix/networks) — 체인 ID, 포트 및 전체 네트워크 참조
