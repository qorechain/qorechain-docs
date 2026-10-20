---
slug: /getting-started/connecting-to-mainnet
title: 메인넷 연결하기
sidebar_label: 메인넷 연결하기
sidebar_position: 3
---

# 메인넷 연결하기

공식 제네시스 파일, 피어, 네트워크 설정으로 노드를 구성하여 운영 중인 QoreChain Vladi 메인넷에 참여하세요.

:::note
이 페이지는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 16진수 `0x2649`)을 다룹니다. 이 메인넷은 **2026년 6월 7일**부터 운영되고 있으며, Cosmos SDK v0.53 위에서 릴리스 **v3.2.3**을 실행합니다. **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)에 대해서는 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참고하여, 실제 메인넷에 나서기 전에 그곳에서 설정을 미리 연습해 보세요.
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

:::caution 노드를 최신 상태로 유지하세요 — v3.2.3 필요
풀 노드는 네트워크가 실제로 실행 중인 릴리스를 계속 따라가야 합니다 — 오래된 버전을 고정해 쓰지 말고, 항상 매니페스트가 가리키는 바이너리를 설치하세요. 현재 매니페스트는 **v3.2.3**이며 `minCompatible`은 **3.2.3**, `upgradeHeight`는 **3,662,051**입니다. 메인넷은 2026년 10월 20일 거버넌스 제안 11을 통해 해당 높이에서 v3.2.3을 적용했으며, 이전 릴리스를 그대로 실행하는 노드는 그 높이를 넘어 체인을 따라갈 수 없습니다. 메인넷에서 이전에 있었던 거버넌스 업그레이드는 블록 높이 2,122,074의 **v3.1.94**(발행 상한), 블록 높이 2,981,742의 **v3.2.0**(EVM 인가 윈도우와 v2 하이브리드 서명 바이트), 블록 높이 3,556,788의 **v3.2.2**(2026년 10월 16일, 제안 7)입니다. v3.2.1은 높이가 없는 노드 로컬 릴리스였습니다. 따라서 새로 합류하는 노드에는 v3.2.3 바이너리가 필요하며, 제네시스부터 리플레이하기보다는 상태 동기화(아래 참고)를 권장합니다. 게시된 체인 데이터 스냅샷은 이 모든 업그레이드 높이보다 이전 시점의 것이므로, 이를 복원한 노드는 해당 업그레이드를 리플레이해야 합니다.

`app.toml`에 `evm-chain-id = 9801`을 설정하고(다른 값은 오류로 기록됩니다) 시스템 시계를 NTP로 동기화된 상태로 유지하세요. 시계가 60초를 초과하여 어긋나면 노드가 중지됩니다. `binary.url`을 신뢰하기 전에 항상 매니페스트의 `"version"`과 `"minCompatible"` 필드를 확인하세요 — 매니페스트는 테스트넷에 먼저 반영된 뒤 안정화 기간을 거쳐 메인넷에 반영되는 방식으로 의도적으로 승격됩니다. 서명 형식, 주소, 소수 자릿수, 메모, 수수료는 v3.2.3에서 바뀌지 않았습니다.

테스트넷(`qorechain-diana`)은 테스트넷 전용 릴리스인 v3.2.4를 실행합니다. 메인넷 노드에는 이를 설치하지 마세요. 메인넷 매니페스트도 이를 제공하지 않습니다.
:::

조율된 업그레이드가 예정되면, 제안문에 해당 높이가 명시되고 그때까지는 이전 릴리스에 머물라고 안내합니다. 노드는 그 높이에서 정지하며, 그때 새 바이너리로 재시작하면 됩니다. 어떤 바이너리든 교체하기 전에 제안의 `status`(`curl -s https://api.qore.host/cosmos/gov/v1/proposals/<id>`)와 [메인넷 매니페스트](https://download.qore.host/mainnet/latest.json)의 `version` 및 `upgradeHeight` 필드를 확인하세요. 업그레이드 바이너리를 해당 높이 전에 설치하지 마세요. 이를 미리 탑재한 노드도 정지합니다. 이 글을 쓰는 시점에는 예정된 업그레이드가 없습니다(`curl -s https://api.qore.host/cosmos/upgrade/v1beta1/current_plan`이 `"plan": null`을 반환합니다).

### 소스에서 빌드하기 (개발 전용)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

이렇게 빌드하면 스텁 키퍼가 포함되고 사후양자 서명기가 없는 커뮤니티 바이너리가 만들어지며, 이 바이너리는 네트워크의 합의 상태를 재현하거나 하이브리드 서명 트랜잭션을 생성할 수 없습니다. 메인넷에서 노드를 운영하려면 위의 릴리스 바이너리를 설치하세요. 전체 사전 요구 사항(Go 1.26+, CGO, 네이티브 라이브러리)은 [소스에서 빌드하기](/developer-guide/building-from-source)를 참고하세요.

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

풀 노드는 블록 타임을 선택하지 않으며, 이는 검증인이 정합니다(메인넷은 현재 약 3.2초마다 블록을 생성합니다). 검증인을 운영하면서 검증인 그룹으로부터 값을 전달받은 경우가 아니라면 컨센서스 타임아웃은 기본값 그대로 두세요. 공개 RPC 노드에 유용한 멤풀 설정은 `config.toml`에서 다음과 같습니다.

```toml
[mempool]
size = 5000
```

---

## 빠른 부트스트랩(스냅샷 또는 상태 동기화)

제네시스부터 동기화하면 시간이 오래 걸릴 수 있습니다. 매니페스트의 `stateSync` 필드는 매시간 갱신되는 신뢰 높이/해시 쌍을 담고 있으므로, 높이를 직접 조사하는 대신 이 값을 사용해 상태 동기화를 구성하세요.

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

그런 다음 `config.toml`의 `[statesync]` 섹션을 위 값으로 설정하세요 — 신뢰 지점을 직접 구해야 할 때를 위한 수동 RPC 기반 대체 방법을 포함한 전체 절차는 [노드 운영하기](/developer-guide/running-a-node)를 참고하세요.

체인 데이터 스냅샷도 매니페스트에 나열되어 있습니다(`snapshot.url`, `snapshot.sha256`, `snapshot.height`). 새 스냅샷이 이전 것을 대체하므로 파일명이나 높이를 하드코딩하지 말고 매니페스트에서 값을 읽으세요. 이 스냅샷은 용량이 크며(수십 기가바이트) 2026년 10월에 게시된 것은 블록 높이 1,966,629(2026년 8월 21일)에서 생성되었습니다 — 위에 나열된 모든 업그레이드 높이보다 이전이므로, 이를 복원한 노드는 해당 업그레이드를 리플레이해야 합니다. 대개는 상태 동기화가 더 빠르고 이를 피할 수 있습니다.

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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
| `8899`  | HTTP      | SVM RPC — 솔라나 호환 RPC(읽기 전용이며, SVM 트랜잭션 레인은 비활성화되어 있음) |
| `26660` | HTTP      | Prometheus 메트릭 엔드포인트                             |

---

## 네트워크 정보

| 항목             | 값                                  |
| ----------------- | -------------------------------------- |
| 체인 ID          | `qorechain-vladi`                      |
| EVM 체인 ID      | `9801` (16진수 `0x2649`)                  |
| 체인 버전     | v3.2.3 (높이 3,662,051에서 적용)     |
| 운영 시작        | 2026년 6월 7일 |
| 블록 타임        | 약 3.2초 (측정된 평균)   |
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
