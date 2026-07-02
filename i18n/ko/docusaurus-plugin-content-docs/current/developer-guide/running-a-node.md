---
slug: /developer-guide/running-a-node
title: 노드 운영
sidebar_label: 노드 운영
sidebar_position: 10
---

# 노드 운영

이 가이드는 **노드 전용** QoreChain 배포, 즉 체인을 동기화하고 통합을 위한 엔드포인트를 노출하되 **밸리데이터 임무는 수행하지 않는** 풀 노드 또는 RPC 노드의 운영을 다룹니다. 블록에 서명하지는 않지만 네트워크에 대한 안정적인 읽기/쓰기 접근이 필요한 거래소(CEX), 지갑 백엔드, 인덱서, 통합 개발자를 대상으로 합니다.

:::note
블록 생성, 스테이킹, 슬래싱, 풀 분류에 대해서는 [밸리데이터 운영](/developer-guide/running-a-validator)을 참조하세요. 노드 전용 배포는 밸리데이터 합의 키를 보유하지 않으며 액티브 세트에 나타나지 않습니다.
:::

:::warning
바이너리, 제네시스, 스냅샷은 SHA-256 체크섬과 함께 [download.qore.host](https://download.qore.host)에 게시됩니다. **설치하거나 압축을 풀기 전에 항상 체크섬을 검증하고**, 입금은 반드시 직접 동기화한 자신의 노드에서만 검증하세요.
:::

---

## 노드 vs 밸리데이터

| 항목                | 노드 전용 (이 가이드)                            | 밸리데이터                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| 합의 키             | 없음                                            | ed25519 합의 키 (반드시 보호해야 함)        |
| 블록 생성           | 아니요                                          | 예 — 블록을 제안하고 서명                   |
| 스테이킹 / 슬래싱   | 해당 없음                                       | 자체 위임, 슬래싱 위험                      |
| 주요 목적           | 통합을 위해 RPC/REST/gRPC/EVM/SVM 제공          | 네트워크 보안 유지, 보상 획득               |
| 공개 노출           | RPC/EVM 엔드포인트가 일반적으로 노출됨          | 밸리데이터는 센트리 노드 뒤에 숨겨짐        |

---

## 대상 네트워크

| 네트워크 | 체인 ID             | EVM 체인 ID          | 비고                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| 메인넷   | `qorechain-vladi`   | `9801` (hex `0x2649`) | 기본 — 2026년 6월 7일부터 가동 중 |
| 테스트넷 | `qorechain-diana`   | `9800`               | 통합 작업은 먼저 여기서 리허설하세요 |

이 가이드 전반에 걸쳐 대상 네트워크에 맞는 `--chain-id`로 바꿔 사용하세요. 예제는 기본적으로 메인넷을 사용합니다.

---

## 권장 하드웨어

| 프로필                   | CPU      | RAM   | 디스크 (NVMe SSD)       | 네트워크  |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| 프루닝된 RPC 노드        | 4 코어   | 16 GB | 500 GB+                 | 100 Mbps+ |
| 풀/아카이브 노드         | 8 코어   | 32 GB | 2 TB+ (시간이 지남에 따라 증가) | 1 Gbps    |
| 거래소 통합              | 8 코어   | 32 GB | 2 TB+ 및 여유 공간      | 1 Gbps    |

NVMe SSD를 강력히 권장합니다 — 체인 상태와 EVM/SVM 스토어는 I/O 집약적입니다. 아카이브 노드(프루닝 없음, 전체 tx 인덱싱)는 지속적으로 커지므로 여유 공간과 모니터링을 갖춘 디스크를 준비하세요.

---

## 배포

### Docker Compose

Docker Compose를 이용한 노드 전용 배포입니다. 이미지 태그를 현재 가동 중인 체인 버전(메인넷 기준 **v3.1.82**)으로 고정하고 체인 데이터를 위한 영구 볼륨을 마운트하세요.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.82
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

데이터 디렉터리를 한 번 초기화한 뒤(제네시스와 피어 구성은 아래에서 다룹니다) 시작하세요:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

베어메탈 설치의 경우, systemd로 `qorechaind`를 실행하세요:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## 네트워크 참여

### 1. 초기화

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. 제네시스 다운로드 및 검증

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. 피어와 수수료 하한 설정

`~/.qorechaind/config/config.toml`을 열고 공개 메인넷 센트리 피어를 설정하세요:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

그다음 `~/.qorechaind/config/app.toml`에서 최소 가스 가격을 설정하세요(네트워크 수수료 하한: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. 동기화 시작

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## 빠른 부트스트랩

제네시스부터 동기화하면 오랜 시간이 걸릴 수 있습니다. 통합 목적이라면 빠른 콜드 스타트를 위해 **스테이트 싱크(state sync)** 또는 **스냅샷**을 사용하세요.

### 스테이트 싱크

스테이트 싱크는 모든 블록을 다시 재생하는 대신 신뢰할 수 있는 RPC 서버에서 최근 애플리케이션 상태 스냅샷을 가져옵니다. `config.toml`의 `[statesync]` 섹션을 구성하세요:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

공개 RPC에서 최근의 신뢰할 수 있는 높이와 해시를 확인하세요:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### 스냅샷 복원

또는 게시된 체인 데이터 스냅샷을 다운로드하고 체크섬을 검증한 뒤 데이터 디렉터리 위에 압축을 풀 수 있습니다:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
스냅샷은 **블록 높이가 표기된 파일 이름**으로 게시됩니다 — [download.qore.host](https://download.qore.host)에서 최신 스냅샷과 해당 SHA-256 체크섬을 확인하고, 압축을 풀기 전에 반드시 검증하세요.
:::

---

## 프루닝과 인덱싱

통합 목적에 맞게 프루닝과 트랜잭션 인덱싱을 조정하세요. 전체 트랜잭션 이력이 필요한 거래소는 최소한의 프루닝과 함께 트랜잭션 인덱서를 활성화한 상태로 운영해야 합니다.

### 프루닝 (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | 동작                                     | 사용 사례                         |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | 최근 상태만 유지, 나머지는 프루닝        | RPC 노드, 잔액/상태 조회          |
| `nothing`   | 모든 히스토리 상태 유지                  | 아카이브 노드, 전체 이력          |
| `custom`    | 운영자가 정의한 keep/interval 값         | 맞춤형 보존                       |

### 트랜잭션 인덱싱 (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

`indexer = "kv"`(또는 더 풍부한 인덱서)로 설정하면 트랜잭션을 해시와 이벤트로 조회할 수 있습니다 — 입출금을 대사(reconcile)하는 거래소에 필수적입니다. 과거 tx 조회가 필요하지 않은 경우에만 `indexer = "null"`로 설정하세요.

---

## 통합을 위한 엔드포인트 노출

`app.toml`에서 통합에 필요한 API 서버를 활성화하고 바인딩하세요:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

그리고 `config.toml`에서 RPC 리스너를 설정하세요:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| 엔드포인트   | 포트   | 용도                                                   |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | 트랜잭션 브로드캐스트, 블록/상태 조회                  |
| REST         | `1317`  | 체인 상태의 HTTP 조회                                  |
| gRPC         | `9090`  | 고처리량 프로그래밍 방식 접근                          |
| EVM JSON-RPC | `8545`  | Ethereum 호환 통합 (체인 ID `9801`)                    |
| EVM WS       | `8546`  | EVM 이벤트 구독                                        |
| SVM RPC      | `8899`  | Solana 호환 통합                                       |

:::warning
리버스 프록시, 속도 제한, 인증, 방화벽 없이 RPC, EVM JSON-RPC, gRPC를 공용 인터넷에 직접 노출하지 마세요. `0.0.0.0` 바인딩은 반드시 통제된 인그레스 계층 뒤에서만 사용하세요.
:::

---

## 상태 및 동기화 모니터링

### 동기화 상태

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — 아직 동기화 중.
* `false` — 완전히 동기화되어 최신 상태를 제공 중.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` 필드는 `qorechain-vladi`(메인넷) 또는 `qorechain-diana`(테스트넷)를 보고해야 합니다.

### Prometheus와 Grafana

QoreChain은 포트 **26660**에서 Prometheus 메트릭을 노출합니다:

```
http://localhost:26660/metrics
```

Prometheus 호환 수집기로 이 메트릭을 수집하세요. Docker Compose 모니터링 스택을 실행하는 경우 Grafana는 `http://localhost:3001`에서 이용할 수 있으며, 최초 로그인 시 자신만의 자격 증명을 설정하세요. 블록 높이 지연, 피어 수, 리소스 사용량을 추적하고, `catching_up`이 `true`로 유지되거나 피어 수가 0으로 떨어지면 알림을 받도록 설정하세요.

### EVM 엔드포인트 확인

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## 운영 모범 사례

1. **체인 버전을 고정하세요.** 현재 가동 중인 태그(메인넷 기준 **v3.1.82**)를 실행하고, 조율된 업그레이드를 위해 공식 릴리스를 추적하세요.

2. **이중화된 노드를 운영하세요.** 로드 밸런서 뒤에 최소 두 개의 노드를 운영하여 단일 노드의 재시작이나 재동기화가 통합 트래픽을 중단시키지 않도록 하세요.

3. **제네시스와 스냅샷을 검증하세요.** 시작하기 전에 항상 제네시스 SHA-256과 모든 스냅샷 체크섬을 공식 릴리스와 대조하여 검증하세요.

4. **공개 엔드포인트를 보호하세요.** RPC/EVM/gRPC 앞에 리버스 프록시, 속도 제한, 방화벽을 두세요. 인증되지 않은 쓰기 RPC를 절대 인터넷에 노출하지 마세요.

5. **필요에 맞게 프루닝을 설정하세요.** 전체 입출금 이력을 대사하는 거래소는 `pruning = "nothing"`과 `tx_index = "kv"`를 함께 사용하고, 가벼운 조회에는 `default`를 사용하세요.

6. **동기화를 지속적으로 모니터링하세요.** 블록 높이 지연, 피어 수 0, `catching_up` 상태에 멈춘 노드에 대해 알림을 설정하세요.

풀 노드를 실행하지 않고 초경량 읽기 접근이 필요하다면 **라이트 노드(Light Node)** 문서를 참조하세요.

---

## 다음 단계

* [메인넷에 연결하기](/getting-started/connecting-to-mainnet) — 메인넷 제네시스, 피어 및 연결 세부 정보
* [밸리데이터 운영](/developer-guide/running-a-validator) — 블록 생성 임무 추가
* [소스에서 빌드하기](/developer-guide/building-from-source) — `qorechaind` 바이너리 빌드
* **라이트 노드(Light Node)** — 초경량 읽기 전용 접근 (문서 준비 중)
