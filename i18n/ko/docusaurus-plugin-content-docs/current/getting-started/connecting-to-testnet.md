---
slug: /getting-started/connecting-to-testnet
title: 테스트넷 연결하기
sidebar_label: 테스트넷 연결하기
sidebar_position: 4
---

# 테스트넷 연결하기

올바른 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 라이브 QoreChain Diana 테스트넷에 참여하세요.

:::note
이 페이지는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 다룹니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 라이브 상태이며(릴리스 **v3.2.3**은 높이 3,742,566까지, 해당 블록부터는 **v3.2.4**), 별도의 제네시스, 피어, 연결 정보를 담은 전용 **메인넷 연결하기** 페이지가 있습니다. 테스트넷은 2026년 10월 19일부터 **v3.2.4**를 실행하고 있으며, 릴리스 매니페스트는 [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json)에 있습니다.
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

## 설치

현재 테스트넷 바이너리, 제네시스, 피어, 스테이트 싱크 신뢰 지점의 기준 정보 출처는 `https://download.qore.host/testnet/latest.json`에서 실시간으로 갱신되는 **테스트넷 매니페스트**입니다. 메인넷 매니페스트와 동일한 구조이므로 설치 단계도 같습니다. 버전이나 체크섬을 하드코딩하지 말고, 매니페스트를 가져와 그 값을 사용하세요:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

테스트넷은 거버넌스 제안을 통해 조율된 업그레이드를 진행하므로, 매니페스트에는 `upgradeHeight`가 포함되어 있으며(v3.2.4는 2026년 10월 19일 높이 8,337,253에서 적용되었고, 그 이전에 v3.2.3은 8,003,746에서, v3.2.2는 6,905,034에서 적용되었습니다) `minCompatible`은 현재 버전(3.2.4)과 같습니다. 지금 합류하는 노드는 매니페스트에 있는 릴리스가 필요합니다. 시스템 시계는 NTP로 동기화된 상태를 유지하세요. 메인넷 매니페스트는 다른 릴리스(높이 3,742,566의 업그레이드까지는 v3.2.3)를 가리키므로, 두 네트워크 사이에서 바이너리를 절대 복사하지 마세요.

---

## 제네시스 다운로드

위에서 가져온 매니페스트의 URL과 SHA-256을 사용하여 로컬 제네시스 파일을 공식 테스트넷 제네시스로 교체하세요:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

같은 파일은 체인 자체에서도 실시간으로 제공됩니다:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

이 파일은 밸리데이터 세트, 토큰 할당, 모듈 파라미터를 포함한 Diana 테스트넷의 초기 상태를 정의합니다.

:::note 테스트넷은 제자리에서 업그레이드됩니다
Diana는 2026년 7월 1일부터 계속 실행 중이며 메인넷과 마찬가지로 거버넌스 제안을 통해 업그레이드됩니다. 테스트넷은 스테이징 네트워크이므로 예고 없이 리셋될 수 있습니다. 노드가 동기화를 멈추면 매니페스트와 Discord 공지를 확인한 다음, 제네시스를 다시 다운로드하고 새 데이터 디렉터리에서 시작하세요. 퍼블릭 센트리는 최근 블록만 보관하므로, 새 노드는 제네시스부터 재생하지 말고 (아래의) 스테이트 싱크를 사용해야 합니다.
:::

---

## 피어 구성

하드코딩된 노드 ID와 호스트 대신 매니페스트에서 현재 피어 및 시드 목록을 읽어 오세요:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml`을 열어 `persistent_peers`(및 `seeds`) 필드를 그 값으로 설정하세요:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

또한 `~/.qorechaind/config/app.toml`에서 수수료 하한을 설정하세요(테스트넷은 메인넷과 동일한 **0.1uqor** 최소 가스 가격을 사용합니다):

```toml
minimum-gas-prices = "0.1uqor"
```

### 권장 설정

풀 노드는 블록 시간을 정하지 않으며, 이는 밸리데이터가 정합니다(테스트넷은 현재 약 1초마다 블록을 생성합니다). 밸리데이터를 운영하면서 밸리데이터 그룹으로부터 값을 전달받은 경우가 아니라면 컨센서스 타임아웃은 기본값 그대로 두세요. 퍼블릭 RPC 노드에 유용한 멤풀 설정은 `config.toml`에서 다음과 같습니다:

```toml
[mempool]
size = 5000
```

---

## 빠른 부트스트랩 (스테이트 싱크)

매니페스트의 `stateSync` 필드에는 정기적으로 갱신되는 신뢰 높이/해시 쌍이 들어 있습니다:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

`config.toml`의 `[statesync]` 섹션을 그 값들과 매니페스트의 `rpcServers`로 설정하세요 — 전체 워크플로는 [노드 실행하기](/developer-guide/running-a-node)를 참조하세요.

---

## 노드 시작

노드를 실행하여 네트워크와의 동기화를 시작하세요:

```bash
./qorechaind start
```

노드가 피어에 연결되고 블록 다운로드를 시작합니다(제네시스부터, 또는 스테이트 싱크를 사용하는 경우 신뢰 높이부터). 초기 동기화 시간은 현재 체인 높이와 네트워크 속도에 따라 달라집니다.

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
| `8899`  | HTTP      | SVM RPC — Solana 호환 RPC (읽기 전용이며, SVM 트랜잭션 레인은 비활성화되어 있습니다) |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                        |

---

## 다음 단계

* [지갑 설정](/getting-started/wallet-setup) — 테스트넷용 지갑 구성하기
* [첫 번째 트랜잭션](/getting-started/first-transaction) — 첫 QOR 전송 보내기
