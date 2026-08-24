---
slug: /getting-started/connecting-to-mainnet
title: 메인넷 연결하기
sidebar_label: 메인넷 연결하기
sidebar_position: 3
---

# 메인넷 연결하기

공식 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 운영 중인 QoreChain Vladi 메인넷에 참여하세요.

:::note
이 페이지는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 16진수 `0x2649`)을 다룹니다. 이 메인넷은 Cosmos SDK v0.53 위에서 체인 버전 **v3.1.92**를 실행하며 **2026년 6월 7일 23:59 UTC**부터 운영되고 있습니다. **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)에 대해서는 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참고하여, 실제 메인넷에 나서기 전에 그곳에서 설정을 미리 연습해 보세요.
:::

## 공개 엔드포인트

**체인을 조회하거나 트랜잭션을 브로드캐스트**하는 용도뿐이라면 자체 노드는 필요하지 않습니다 — 아래의 공개 엔드포인트를 사용하면 됩니다.

| 서비스 | URL |
|---|---|
| 컨센서스 RPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (체인 ID `9801`) |
| SVM JSON-RPC (읽기 전용) | `https://svm.qore.host` |
| 블록 탐색기 | [explore.qore.network](https://explore.qore.network) |

거래소·인덱서 등 부하가 큰 프로덕션 워크로드의 경우, 아래 설명대로 자체 노드를 운영하세요.

---

## 설치

`qorechaind` 바이너리는 공식 사전 빌드 번들을 사용하거나 소스에서 직접 빌드하여 설치할 수 있습니다.

### 사전 빌드 바이너리 번들 (linux/amd64)

현재 바이너리에 대한 정본(canonical source of truth)은 **메인넷 매니페스트**로, `https://download.qore.host/mainnet/latest.json`에서 실시간으로 갱신되는 JSON 파일입니다. 이 매니페스트에는 현재 바이너리 URL과 SHA-256, 현재 제네시스 URL/SHA-256/크기, 현재 피어 및 시드 목록, P2P 포트, 상태 동기화(state-sync) 신뢰 지점, 최소 호환 체인 버전이 담겨 있습니다. 설치 스크립트에 바이너리 버전이나 체크섬을 하드코딩하지 말고, 이 값들을 가져와 사용하세요 — 하드코딩한 값은 새 릴리스가 나오는 즉시 낡은 값이 됩니다.

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

이 번들에는 `qorechaind`와 함께 필요한 공유 라이브러리(`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`)가 포함되어 있습니다.

:::caution 노드를 최신 상태로 유지하세요 — 새로 동기화하려면 v3.1.92 이상 필요
풀 노드는 네트워크가 실제로 실행 중인 체인 버전을 계속 따라가야 합니다 — 오래된 버전을 고정해 쓰지 말고, 항상 매니페스트가 가리키는 바이너리를 설치하세요. 매니페스트의 `minCompatible` 필드와는 별개로, **제네시스부터 새로 참여하거나 중단(halt) 상태에서 복구하는 노드에는 v3.1.92 이상이 반드시 필요합니다** — 그보다 이전 버전은 지금은 수정된 가스 계량(gas-metering) 버그로 인해, 트랜잭션이 포함된 첫 블록에서 리플레이가 멈춰 전체 동기화를 완료할 수 없습니다. 이미 동기화가 끝나 정상 작동 중인 노드라도 이전 버전을 쓰고 있다면 다음 기회에 업그레이드해야 합니다 — 오래된 노드는 최신 트랜잭션 유형을 디코딩하지 못해, 블록에 그런 트랜잭션이 하나라도 등장하는 순간 동기화가 멈추기 때문입니다.
:::

### 소스에서 빌드하기

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

위에서 가져온 매니페스트의 URL과 SHA-256을 사용하여, 로컬 제네시스 파일을 공식 메인넷 제네시스로 교체하세요.

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

동일한 파일은 체인 자체에서도 실시간으로 제공되므로, 다운로드한 내용을 아래와 같이 교차 검증할 수 있습니다.

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

이 파일은 Vladi 메인넷의 초기 상태 — 제네시스 검증인 집합, 토큰 배분(제네시스 시점의 TGE), 모듈 파라미터 — 를 정의합니다.

---

## 피어 구성

노드 설정을 편집하여 공개 메인넷 센트리 노드에 연결하세요. 노드 ID와 호스트는 자주 바뀌므로 하드코딩하지 말고, 매니페스트에서 현재 피어·시드 목록을 읽어오세요.

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml`을 열고 `persistent_peers`(및 `seeds`) 필드를 위 값으로 설정하세요.

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

`~/.qorechaind/config/app.toml`에서 최소 가스 가격도 설정하세요(네트워크 수수료 하한선은 **0.1uqor**입니다).

```toml
minimum-gas-prices = "0.1uqor"
```

### 권장 설정

`config.toml`에서 다음 항목도 조정하는 것을 권장합니다.

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

이 값들은 Vladi 메인넷의 블록 타임과 처리량에 맞춰 튜닝된 값입니다.

---

## 빠른 부트스트랩(스냅샷 또는 상태 동기화)

제네시스부터 동기화하면 시간이 오래 걸릴 수 있습니다. 매니페스트의 `stateSync` 필드는 매시간 갱신되는 신뢰 높이/해시 쌍을 담고 있으므로, 높이를 직접 조사하는 대신 이 값을 사용해 상태 동기화를 구성하세요.

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

그런 다음 `config.toml`의 `[statesync]` 섹션을 위 값으로 설정하세요 — 신뢰 지점을 직접 구해야 할 때를 위한 수동 RPC 기반 대체 방법을 포함한 전체 절차는 [노드 운영하기](/developer-guide/running-a-node)를 참고하세요.

체인 데이터 스냅샷도 [download.qore.host](https://download.qore.host)에 게시되어 있습니다. 새 스냅샷이 이전 것을 정기적으로 대체하므로, 파일명이나 높이를 하드코딩하지 말고 해당 위치의 현재 목록에서 최신 스냅샷 파일명과 게시된 체크섬을 확인하세요.

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## 노드 시작

노드를 실행하여 네트워크와 동기화를 시작하세요.

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

노드는 피어에 연결하여 블록 다운로드를 시작합니다(제네시스부터, 또는 스냅샷을 복원했다면 해당 높이부터).

---

## 동기화 상태 확인

노드가 최신 블록을 따라잡고 있는지 확인하세요.

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — 노드가 아직 동기화 중입니다. 완료될 때까지 기다리세요.
* `false` — 노드가 완전히 동기화되어 새 블록을 처리하고 있습니다.

최신 블록 높이도 확인할 수 있습니다.

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

올바른 네트워크에 연결되어 있는지 확인하세요 — `network` 필드에 `qorechain-vladi`가 표시되어야 합니다.

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## 모니터링

QoreChain은 노드의 상태와 성능을 모니터링할 수 있는 여러 엔드포인트를 제공합니다.

### Prometheus 메트릭

원시 메트릭은 다음 위치에서 확인할 수 있습니다.

```
http://localhost:26660/metrics
```

이 메트릭은 Prometheus 호환 수집기라면 어디서든 수집(scrape)할 수 있습니다.

### Grafana 대시보드

Docker Compose로 실행 중이라면 Grafana는 다음 위치에서 사용할 수 있습니다.

```
http://localhost:3001
```

처음 로그인할 때는 안내에 따라 직접 자격 증명을 설정하고, 기본값을 그대로 두지 마세요. 사전 구성된 대시보드는 블록 생성, 트랜잭션 처리량, 피어 연결, 리소스 사용량을 보여줍니다.

### REST 헬스 체크

REST API는 빠른 상태 확인용 엔드포인트를 제공합니다.

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
| `9090`  | gRPC      | gRPC API — 프로그래밍 방식 체인 접근                    |
| `8545`  | HTTP      | EVM JSON-RPC — 이더리움 호환 RPC(체인 ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — 실시간 EVM 이벤트 구독       |
| `8899`  | HTTP      | SVM RPC — 솔라나 호환 RPC                |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                             |

---

## 네트워크 정보

| 항목             | 값                                  |
| ----------------- | -------------------------------------- |
| 체인 ID          | `qorechain-vladi`                      |
| EVM 체인 ID      | `9801` (16진수 `0x2649`)                  |
| 체인 버전     | v3.1.92                                |
| 운영 시작        | 2026년 6월 7일 23:59 UTC                  |
| 토큰             | QOR (`uqor`, 10^6 마이크로 단위 = 1 QOR) |
| 최소 가스 가격 | `0.1uqor`                              |
| 계정 접두사    | `qor`                              |
| 검증인 접두사  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## 다음 단계

* [노드 운영하기](/developer-guide/running-a-node) — 거래소 및 통합 파트너를 위한 풀/RPC 노드 운영
* [거래소 및 통합 가이드](/developer-guide/exchange-integration) — 입금, 출금, 모니터링
* [검증인 운영하기](/developer-guide/running-a-validator) — 검증인 생성 및 운영
* [지갑 설정](/getting-started/wallet-setup) — 메인넷용 지갑 구성
* [첫 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
* [테스트넷 연결하기](/getting-started/connecting-to-testnet) — 무료 테스트를 위해 Diana 테스트넷에 참여하기
* [네트워크](/appendix/networks) — 체인 ID, 포트, 전체 네트워크 참조
