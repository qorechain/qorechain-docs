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

:::note 신뢰할 수 있는 출처: 라이브 매니페스트
현재 바이너리, 제네시스, 피어, 시드, 스테이트 싱크 신뢰 지점은 실시간으로 갱신되는 JSON 매니페스트로 게시됩니다 — 새 릴리스가 나오는 즉시 오래된 정보가 되어버리므로, 설치 스크립트에 바이너리 버전, 체크섬, 스냅샷 파일명을 하드코딩하지 마세요:

- 메인넷: `https://download.qore.host/mainnet/latest.json`
- 테스트넷: `https://download.qore.host/testnet/latest.json`

매니페스트의 필드에는 `binary`(URL + sha256), `genesis`(URL + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync`(매시간 갱신되는 신뢰 지점), `minCompatible`이 포함됩니다. 아래의 설치 및 참여 단계는 이 매니페스트를 가져와 그 안의 현재 값을 사용합니다.
:::

:::caution 새로 참여하는 노드는 v3.1.92 이상 필요
제네시스부터 동기화하거나 아카이브/스냅샷에서 리플레이하는 노드는 **v3.1.92 이상**이어야 합니다 — 이전 버전은 (매니페스트의 `minCompatible` 필드가 아직 이를 반영하도록 업데이트되지 않았더라도) 이제는 수정된 가스 미터링 버그로 인해 리플레이 중 트랜잭션이 포함된 첫 블록에서 멈춥니다. 항상 위 매니페스트의 현재 바이너리를 실행하세요.
:::

---

## 노드 vs 밸리데이터

| 항목                | 노드 전용 (이 가이드)                            | 밸리데이터                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| 합의 키             | 없음                                            | ed25519 합의 키 (반드시 안전하게 보관)      |
| 블록 생성           | 아니요                                          | 예 — 블록을 제안하고 서명                   |
| 스테이킹 / 슬래싱   | 해당 없음                                       | 자기 위임, 슬래싱 위험                      |
| 주요 목적           | 통합을 위한 RPC/REST/gRPC/EVM/SVM 제공          | 네트워크 보안 유지, 보상 획득               |
| 공개 노출           | RPC/EVM 엔드포인트를 일반적으로 노출            | 밸리데이터는 센트리 노드 뒤에 숨김          |

---

## 대상 네트워크

| 네트워크 | 체인 ID             | EVM 체인 ID          | 비고                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| 메인넷   | `qorechain-vladi`   | `9801` (16진수 `0x2649`) | 기본 — 2026년 6월 7일부터 라이브 |
| 테스트넷 | `qorechain-diana`   | `9800`               | 통합은 먼저 여기서 리허설하세요 |

이 가이드 전반에서 대상 네트워크에 맞는 `--chain-id`로 바꿔 사용하세요. 예시는 기본적으로 메인넷을 사용합니다.

---

## 권장 하드웨어

| 프로필                   | CPU      | RAM   | 디스크 (NVMe SSD)       | 네트워크  |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| 프루닝된 RPC 노드        | 4코어    | 16 GB | 500 GB+                 | 100 Mbps+ |
| 풀/아카이브 노드         | 8코어    | 32 GB | 2 TB+ (시간이 지남에 따라 증가) | 1 Gbps    |
| 거래소 통합              | 8코어    | 32 GB | 2 TB+ (여유 공간 포함)  | 1 Gbps    |

NVMe SSD를 강력히 권장합니다 — 체인 상태와 EVM/SVM 스토어는 I/O 집약적입니다. 아카이브 노드(프루닝 없음, 전체 트랜잭션 인덱싱)는 계속 커지므로 여유 공간을 두고 디스크를 프로비저닝하고 모니터링하세요.

---

## 배포

### Docker Compose

Docker Compose를 사용한 노드 전용 배포입니다. 이미지 태그를 라이브 체인 버전(메인넷 기준 **v3.1.92**)에 고정하고, 체인 데이터용 영구 볼륨을 마운트하세요.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.92
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

베어메탈 설치의 경우 `qorechaind`를 systemd로 실행하세요:

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

### 2. 매니페스트 가져오기

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

아래 단계에서 바이너리, 제네시스, 피어 값의 출처로 이 파일을 사용하세요 — `jq -r .minCompatible latest.json`으로 확인하되, 이 필드가 아직 반영되지 않았더라도 위의 **v3.1.92 최소 버전**은 그대로 유효하다는 점을 기억하세요.

### 3. 제네시스 다운로드 및 검증

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. 피어 및 수수료 하한 구성

노드 ID와 호스트를 하드코딩하는 대신 매니페스트에서 현재 피어와 시드를 읽어오세요 — 이 값들은 계속 바뀝니다:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml`을 열고 `persistent_peers`(및 `seeds`)를 위 값으로 설정하세요:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

그다음 `~/.qorechaind/config/app.toml`에서 최소 가스 가격을 설정하세요(네트워크 수수료 하한: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. 동기화 시작

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## 빠른 부트스트랩

제네시스부터 동기화하면 시간이 오래 걸릴 수 있습니다. 통합 목적이라면 **스테이트 싱크(state sync)** 또는 **스냅샷**을 사용해 빠르게 콜드 스타트하세요.

### 스테이트 싱크

스테이트 싱크는 모든 블록을 재생하는 대신 신뢰할 수 있는 RPC 서버에서 최신 애플리케이션 상태 스냅샷을 가져옵니다. `config.toml`의 `[statesync]` 섹션을 구성하세요:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

`trust_height` / `trust_hash`는 매니페스트의 `stateSync` 필드에서 가져오세요 — 매시간 갱신되므로 우선적으로 사용해야 할 출처입니다:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

대안/폴백으로, 공개 RPC에서 직접 신뢰할 수 있는 높이와 해시를 구할 수도 있습니다:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### 스냅샷 복원

또는 게시된 체인 데이터 스냅샷을 다운로드하고 체크섬을 검증한 뒤 데이터 디렉터리 위에 압축을 풀 수도 있습니다. 매니페스트는 현재 스냅샷 포인터를 담고 있지 않으므로, 파일명이나 체크섬을 하드코딩하지 말고 [download.qore.host](https://download.qore.host)의 실시간 목록에서 현재 파일명과 체크섬을 확인하세요:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
스냅샷은 정기적으로 바뀌는 **블록 높이가 표기된 파일명**으로 게시됩니다 — [download.qore.host](https://download.qore.host)에서 최신 스냅샷과 SHA-256 체크섬을 확인하고, 압축을 풀기 전에 항상 검증하세요. 위의 **v3.1.92 최소 버전** 요건은 스냅샷에서 리플레이하는 경우에도 동일하게 적용된다는 점을 기억하세요.
:::

---

## 프루닝과 인덱싱

프루닝과 트랜잭션 인덱싱을 통합 요구 사항에 맞게 조정하세요. 전체 트랜잭션 이력이 필요한 거래소는 최소한의 프루닝과 함께 트랜잭션 인덱서를 활성화한 상태로 운영해야 합니다.

### 프루닝 (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | 동작                                     | 사용 사례                         |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | 최근 상태만 유지하고 나머지는 프루닝     | RPC 노드, 잔액/상태 조회          |
| `nothing`   | 모든 과거 상태 유지                      | 아카이브 노드, 전체 이력          |
| `custom`    | 운영자가 정의한 keep/interval 값         | 맞춤형 보존 정책                  |

### 트랜잭션 인덱싱 (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

트랜잭션을 해시와 이벤트로 조회할 수 있도록 `indexer = "kv"`(또는 더 풍부한 인덱서)를 설정하세요 — 입출금을 대사하는 거래소에는 필수입니다. 과거 트랜잭션 조회가 필요 없는 경우에만 `indexer = "null"`을 설정하세요.

---

## 통합용 엔드포인트 노출

통합 개발자에게 필요한 API 서버를 `app.toml`에서 활성화하고 바인딩하세요:

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
| gRPC         | `9090`  | 고처리량 프로그래매틱 액세스                           |
| EVM JSON-RPC | `8545`  | Ethereum 호환 통합 (체인 ID `9801`)                    |
| EVM WS       | `8546`  | EVM 이벤트 구독                                        |
| SVM RPC      | `8899`  | Solana 호환 통합                                       |

:::warning
RPC, EVM JSON-RPC, gRPC를 리버스 프록시, 속도 제한, 인증, 방화벽 없이 공개 인터넷에 직접 노출하지 마세요. `0.0.0.0` 바인딩은 반드시 통제된 인그레스 레이어 뒤에서만 사용하세요.
:::

---

## 상태 및 동기화 모니터링

### 동기화 상태

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — 아직 동기화 중입니다.
* `false` — 완전히 동기화되어 최신 상태를 제공하고 있습니다.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` 필드는 `qorechain-vladi`(메인넷) 또는 `qorechain-diana`(테스트넷)로 보고되어야 합니다.

### Prometheus와 Grafana

QoreChain은 포트 **26660**에서 Prometheus 메트릭을 노출합니다:

```
http://localhost:26660/metrics
```

이 메트릭을 Prometheus 호환 수집기로 스크레이핑하세요. Docker Compose 모니터링 스택을 운영하는 경우 Grafana는 `http://localhost:3001`에서 사용할 수 있습니다 — 최초 로그인 시 자신만의 자격 증명을 설정하세요. 블록 높이 지연, 피어 수, 리소스 사용량을 추적하고, `catching_up`이 계속 `true`이거나 피어 수가 0으로 떨어지면 알림을 받도록 설정하세요.

### EVM 엔드포인트 확인

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## 운영 모범 사례

1. **체인 버전을 고정하세요.** 라이브 태그(메인넷 기준 **v3.1.92**)를 실행하고, 조율된 업그레이드를 위해 공식 릴리스를 추적하세요.

2. **이중화된 노드를 운영하세요.** 로드 밸런서 뒤에 최소 두 대의 노드를 운영해 단일 노드의 재시작이나 재동기화가 통합 트래픽을 중단시키지 않도록 하세요.

3. **제네시스와 스냅샷을 검증하세요.** 시작하기 전에 항상 제네시스 SHA-256과 모든 스냅샷 체크섬을 공식 릴리스와 대조해 검증하세요.

4. **공개 엔드포인트를 보호하세요.** RPC/EVM/gRPC 앞단에 리버스 프록시, 속도 제한, 방화벽을 두세요. 인증되지 않은 쓰기 RPC를 절대 인터넷에 노출하지 마세요.

5. **필요에 맞게 프루닝을 설정하세요.** 전체 입출금 이력을 대사하는 거래소는 `pruning = "nothing"`과 `tx_index = "kv"`를 함께 사용하고, 가벼운 조회에는 `default`를 사용하세요.

6. **동기화를 지속적으로 모니터링하세요.** 블록 높이 지연, 피어 0개, `catching_up`에 멈춰 있는 노드에 대해 알림을 설정하세요.

풀 노드를 실행하지 않고 초경량 읽기 접근이 필요하다면 **라이트 노드(Light Node)** 문서를 참조하세요.

---

## 문제 해결

### 업그레이드 전에 멈춘 노드가 바이너리 교체 후에도 재개되지 않는 경우

바이너리를 업그레이드하기 **전에** 노드가 이미 멈췄거나 정지된 상태였다면, 새 바이너리를 넣고 재시작하는 것만으로는 충분하지 않습니다 — 노드에는 이전 실행에서 캐시된 오래된 ABCI 결과가 남아 있어 정지를 유발했던 블록을 다시 실행하지 않습니다. 재시작하기 전에 명시적으로 롤백하세요:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

이 명령은 `qorechaind rollback`(최상위 서브커맨드)입니다 — `comet rollback` 서브커맨드는 존재하지 않으며, 여기에는 `--hard` 플래그도 없습니다.

### `priv_validator_state.json`이 없어 스냅샷 복원이 크래시 루프에 빠지는 경우

게시된 아카이브/스냅샷에는 `data/priv_validator_state.json`이 포함되어 있지 **않으며**, 이 파일이 없으면 노드가 시작을 거부합니다. 스냅샷 복원 후 이 파일이 없다면 직접 생성하세요 — 단, **아직 존재하지 않는 경우에만** 그렇게 하세요. 실제 파일을 절대 덮어쓰지 마세요: 밸리데이터에서 이 파일은 이중 서명 방지 장치이며, 이를 손상시키면 이중 서명 위험이 발생합니다.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## 다음 단계

* [메인넷 연결](/getting-started/connecting-to-mainnet) — 메인넷 제네시스, 피어, 연결 세부 정보
* [밸리데이터 운영](/developer-guide/running-a-validator) — 블록 생성 임무 추가
* [소스에서 빌드하기](/developer-guide/building-from-source) — `qorechaind` 바이너리 빌드
* **라이트 노드(Light Node)** — 초경량 읽기 전용 접근 (문서 준비 중)
