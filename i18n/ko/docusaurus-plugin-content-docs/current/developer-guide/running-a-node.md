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

:::caution 매니페스트가 명시한 릴리스를 사용하세요: 메인넷은 v3.2.4, 테스트넷은 v3.2.6
제네시스부터 동기화하거나 스냅샷에서 리플레이하는 노드는 여러 거버넌스 업그레이드를 거치게 되므로([업그레이드](#upgrades) 참조), 항상 매니페스트가 가리키는 바이너리를 설치하세요. 그 바이너리에는 모든 업그레이드 핸들러가 들어 있습니다. **메인넷**에서는 매니페스트의 `minCompatible`과 `version`이 모두 `3.2.4`입니다(2026년 10월 23일 높이 3,742,566에서 적용된 조율 업그레이드, 거버넌스 제안 13). 따라서 지금 참여하는 노드는 v3.2.4가 필요합니다. 더 오래된 바이너리는 알지 못하는 업그레이드 높이에서 멈춥니다. 메인넷 거버넌스 제안 14는 투표 기간 중이며 높이 3,906,833에서 v3.2.5를 적용하게 됩니다. 제안이 통과하기 전에는 예정된 업그레이드 플랜이 없으며(이 글을 쓰는 시점인 2026년 10월 27일에 `current_plan`은 `null`), 매니페스트가 더 새로운 릴리스를 명시하면 그것이 설치할 바이너리입니다. v3.2.5의 변경 사항은 메인넷이 이를 적용한 뒤에 문서화됩니다. **테스트넷**에서는 매니페스트의 `minCompatible`과 `version`이 둘 다 `3.2.6`이므로(`upgradeHeight` 8,970,638. v3.2.5는 2026년 10월 26일 높이 8,890,800에서, v3.2.6은 2026년 10월 27일에 적용됨), 테스트넷에 참여하는 노드에는 v3.2.6 바이너리가 필요합니다. 테스트넷 바이너리를 메인넷에 대해 실행하거나 그 반대로 하지 마세요. 각 디렉터리는 자체 릴리스를 제공합니다([업그레이드](#upgrades) 참조). 매니페스트는 의도적으로 단계적으로 승격되므로(테스트넷 먼저, 숙성 기간 후 메인넷) `binary.url`을 신뢰하기 전에 매니페스트의 `"version"` 필드를 `minCompatible`과 비교해 확인하세요.

공개 소스에서 빌드한 바이너리(커뮤니티 빌드)는 두 공개 네트워크 모두에서 시작을 거부합니다(v3.2.3 이상). 이 바이너리는 양자 내성 서명을 검증할 수 없고 네트워크의 블록을 충실하게 리플레이할 수 없습니다. 릴리스 아카이브만 사용하세요.

v3.2.1부터는 두 가지 설정이 중요합니다. 시스템 시계를 NTP로 동기화된 상태로 유지하고(시계가 60초 넘게 어긋나면 노드가 중지됩니다), `app.toml`에 `evm-chain-id`를 설정하세요([노드 제한](#node-limits) 참조).
:::

---

## 노드 vs 밸리데이터

| 항목                | 노드 전용 (이 가이드)                            | 밸리데이터                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| 합의 키             | 없음                                            | ed25519 합의 키 (반드시 안전하게 보관)      |
| 블록 생성           | 아니요                                          | 예 — 블록을 제안하고 서명                   |
| 스테이킹 / 슬래싱   | 해당 없음                                       | 자기 위임, 슬래싱 위험                      |
| 주요 목적           | 통합을 위한 RPC/REST/gRPC/EVM(및 읽기 전용 SVM) 제공 | 네트워크 보안 유지 (스테이킹 보상 적용)     |
| 공개 노출           | RPC/EVM 엔드포인트를 일반적으로 노출            | 밸리데이터는 센트리 노드 뒤에 숨김          |

---

## 대상 네트워크

| 네트워크 | 체인 ID             | EVM 체인 ID          | 비고                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| 메인넷   | `qorechain-vladi`   | `9801` (16진수 `0x2649`) | 기본 — 2026년 6월 7일부터 라이브, 노드 릴리스 v3.2.4 (2026년 10월 23일부터) |
| 테스트넷 | `qorechain-diana`   | `9800`               | 통합은 먼저 여기서 리허설하세요, 노드 릴리스 v3.2.6 (2026년 10월 27일부터) |

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

Docker Compose를 사용한 노드 전용 배포입니다. 공개적으로 배포된 `qorechaind` 이미지는 없습니다(프로젝트의 Docker Hub 조직 아래에는 아무것도 게시되어 있지 않습니다). 공개 저장소의 `Dockerfile`은 **커뮤니티** 바이너리(양자 내성 라이브러리 없음, 스텁 키퍼)를 빌드합니다. 로컬 개발에는 적합하지만 메인넷이나 테스트넷을 따라갈 수는 없으며, v3.2.3부터는 이 네트워크들에서 시작을 거부합니다. 네트워크 노드용으로는 `latest.json`에 명시된 **릴리스 아카이브**로 직접 이미지를 빌드하고, 릴리스 버전(이 글을 쓰는 시점에 메인넷은 **v3.2.4**, 테스트넷은 **v3.2.6**)으로 태그를 지정한 뒤, 체인 데이터용 영구 볼륨을 마운트하세요:

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.4 release/
```

아카이브에는 `qorechaind`와 공유 라이브러리(`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`)가 들어 있는 `lib/` 디렉터리가 포함되어 있습니다. 위 이미지는 릴리스 아카이브와 마찬가지로 `linux/amd64` 전용입니다.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.4
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
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

데이터 디렉터리를 한 번 초기화한 뒤(예: `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; 제네시스와 피어 구성은 아래에서 다룹니다) 시작하세요:

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

### 2. 매니페스트 가져오기 {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

아래 단계에서 바이너리, 제네시스, 피어 값의 출처로 이 파일을 사용하세요 — `jq -r .minCompatible latest.json`을 확인하고 최소한 그 릴리스 이상을 실행하세요(권장 릴리스는 `jq -r .version latest.json`입니다).

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

`qorechaind init <moniker> --chain-id qorechain-vladi`는 해당 네트워크의 EVM 체인 ID도 `app.toml`에 기록합니다([노드 제한](#node-limits) 참조). 오래전에 초기화한 홈 디렉터리라면 이 값을 확인하세요.

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

또는 게시된 체인 데이터 스냅샷을 다운로드하고 체크섬을 검증한 뒤 데이터 디렉터리 위에 압축을 풀 수도 있습니다. 메인넷에서는 매니페스트의 `snapshot` 객체가 URL, 블록 `height`, 크기, SHA-256을 제공합니다. **테스트넷 매니페스트의 스냅샷 URL은 현재 `404`를 반환하므로(게시된 테스트넷 스냅샷이 없습니다) 테스트넷에서는 스테이트 싱크를 사용하세요.** 메인넷 스냅샷을 사용하기 전에 `snapshot.height`를 확인하세요. 약 27 GB의 단일 아카이브이며, 오래된 스냅샷은 따라잡는 데 오랜 시간이 걸립니다. 현재 게시된 메인넷 스냅샷은 2026년 8월 21일(높이 1,966,629)의 것으로, v3.1.94, v3.2.0, v3.2.2, v3.2.3, v3.2.4 업그레이드 높이보다 이전 시점이므로, 이 스냅샷으로 복원한 노드는 매니페스트가 명시한 릴리스 바이너리로 약 두 달 치 블록을 리플레이합니다. 스테이트 싱크가 거의 항상 더 나은 선택입니다.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
매니페스트의 `snapshot.height`와 `snapshot.ts` 필드는 아카이브가 얼마나 최신인지 알려 주며, 스테이트 싱크(위 참조)가 27 GB를 내려받는 것보다 대개 더 빠릅니다. 압축을 풀기 전에 항상 체크섬을 검증하고, 스냅샷에서 리플레이할 때는 모든 업그레이드 핸들러가 들어 있는 노드 릴리스를 사용하세요(이 페이지 상단의 주의 사항 참조).
:::

---

## 업그레이드 {#upgrades}

합의 변경은 **조율된 거버넌스 업그레이드**로 도입됩니다. 통과된 제안은 플랜 이름(예: `v3.2.3`)과 블록 높이를 지정합니다. 릴리스 바이너리에는 업그레이드 핸들러가 들어 있으며, 플랜 높이에서 모든 노드가 이를 실행하고 있어야 합니다. 이전 바이너리를 쓰는 노드는 **그 높이에서 정지합니다**(업그레이드 모듈의 의도된 동작입니다). 릴리스가 어떤 종류인지는 매니페스트가 알려 줍니다. `upgradeType`은 조율된 업그레이드(`upgradeHeight`가 설정됨)에서는 `height`이고, 노드별로 교체할 수 있는 노드 로컬 릴리스에서는 `rolling`입니다. 새 바이너리는 해당 높이 **이전에** 설치하세요. 노드가 먼저 정지했다면 바이너리를 교체하고 재시작하세요([문제 해결](#troubleshooting)의 롤백 안내 참조).

| 릴리스 | 메인넷 `qorechain-vladi` | 테스트넷 `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | 높이 2,122,074 | 적용되지 않음 |
| v3.2.0 | 높이 2,981,742 | 높이 5,920,000 |
| v3.2.1 | 노드 로컬, 높이 없음 | 노드 로컬 |
| v3.2.2 | 높이 3,556,788 (2026년 10월 16일) | 높이 6,905,034 (2026년 10월 2일) |
| v3.2.3 | 높이 3,662,051 (2026년 10월 20일, 거버넌스 제안 11) | 높이 8,003,746 (2026년 10월 15일) |
| v3.2.4 | 높이 3,742,566 (2026년 10월 23일, 거버넌스 제안 13) | 높이 8,337,253 (2026년 10월 19일, 거버넌스 제안 13) |
| v3.2.5 | 제안됨: 거버넌스 제안 14(2026년 10월 27일 투표 기간 중)가 높이 3,906,833에서 적용하게 됨 | 높이 8,890,800 (2026년 10월 26일) |
| v3.2.6 | 적용되지 않음 | 높이 8,970,638 (2026년 10월 27일) |

**노드 운영자가 v3.2.4(메인넷 높이 3,742,566)를 위해 한 일.** 거버넌스 제안 13은 플랜 이름을 `v3.2.4`, 높이를 3,742,566으로 지정했고(2026년 10월 23일 적용), 노드는 그 높이까지 v3.2.3에 머물다가 거기서 정지(halt)하고 v3.2.4로 재시작했습니다. 다음 조율 업그레이드에서도 단계는 같습니다.

1. 매니페스트(`https://download.qore.host/mainnet/latest.json`)를 지켜보세요. 새 릴리스가 명시될 때까지는 설치할 것이 없으며, 테스트넷 디렉터리의 바이너리는 메인넷 릴리스가 아닙니다.
2. 매니페스트가 릴리스를 명시하면 `binary.url`에서 아카이브를 다운로드하고 `sha256`을 검증한 뒤(제안 본문도 바이너리의 sha256을 게시합니다) 해당 높이 **이전에** 준비해 두세요. 예정된 플랜(`name`과 `height`)은 `GET /cosmos/upgrade/v1beta1/current_plan`으로, 현재 높이는 RPC의 `GET /status`로 확인하세요.
3. 플랜 높이에서 여전히 이전 바이너리인 노드는 **정지**합니다(이는 업그레이드 모듈의 의도된 동작이며 장애가 아닙니다). 이미 새 바이너리를 사용 중인 노드는 업그레이드 핸들러를 적용하고 계속 진행합니다. 먼저 정지했다면 바이너리를 교체하고 재시작하세요. 업그레이드 후 `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4`는 `0` 대신 높이를 반환합니다(메인넷은 3742566, 테스트넷은 8337253).
4. 지금 메인넷에 참여하는 노드는 매니페스트가 명시한 릴리스를 설치합니다(이 글을 쓰는 시점에는 v3.2.4. `version`을 `minCompatible`과 비교해 확인하세요).

트랜잭션 서명, 주소, 소수 자릿수, 메모, 수수료는 v3.2.4에서 변경되지 않습니다.

라이브 기록은 `GET /cosmos/upgrade/v1beta1/applied_plan/<name>`(`0` = 적용되지 않음)으로, 예정된 플랜은 `GET /cosmos/upgrade/v1beta1/current_plan`으로 확인하세요. v3.2.2는 합의 엔진, Cosmos SDK(v0.53.8), IBC 의존성을 올렸으며, SDK의 더 엄격해진 트랜잭션 검사 때문에 이 릴리스는 노드별 교체가 아니라 업그레이드 높이에서 이전 바이너리를 교체합니다. 트랜잭션 서명, 주소, 소수 자릿수, 메모, 수수료는 v3.2.2와 v3.2.3에서 바뀌지 않았습니다.

**스테이트 싱크와 시계.** 스테이트 싱크는 매니페스트의 `stateSync` 블록(`trustHeight`, `trustHash`, 매시간 갱신)에서 신뢰 지점을 가져옵니다. 여기에 나열된 RPC 서버는 프로젝트가 직접 운영하는 것이므로, 프로덕션 노드에서는 신뢰하는 RPC 서버를 추가하고 신뢰 해시를 다른 출처와 대조하세요. 시계를 NTP로 동기화된 상태로 유지하세요. 네트워크와 60초 넘게 어긋나면 노드가 중지됩니다.

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

### 노드 제한 (`app.toml`) {#node-limits}

노드 릴리스 v3.2.1부터 `init`은 세 가지 노드 로컬 제한이 담긴 `[qorechain]` 섹션을 기록합니다. 이 제한은 이 노드가 메모리에 보관하는 것과 자신이 제안하는 블록에 담는 것만 바꾸며, 블록이 유효하기 위해 반드시 포함해야 하는 내용에는 영향을 주지 않습니다:

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init`은 해당 네트워크의 EVM 체인 ID도 `app.toml`의 `[evm]` `evm-chain-id` 설정에 기록합니다(`--chain-id qorechain-vladi`는 `9801`, `qorechain-diana`는 `9800`). `app.toml`에 다른 값이 들어 있는 노드도 시작은 되지만 시작 시 오류를 로그로 남기며, 파일을 수정하기 전까지 해당 노드의 자체 JSON-RPC(`eth_chainId`, 해당 노드에 대한 서명)가 잘못된 체인 ID로 응답합니다. 합의에는 영향이 없습니다. 이전 바이너리는 `--chain-id`와 관계없이 테스트넷 값(`9800`)을 기록했으므로, 오래전에 초기화한 메인넷 노드는 이 설정을 확인해야 합니다. `QORE_EVM_CHAIN_ID`를 해당 네트워크의 값이 아닌 다른 값으로 설정하지 마세요. 그런 노드는 시작을 거부합니다.

### 트랜잭션 인덱싱 (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

트랜잭션을 해시와 이벤트로 조회할 수 있도록 `indexer = "kv"`(또는 더 풍부한 인덱서)를 설정하세요 — 입출금을 대사하는 거래소에는 필수입니다. 과거 트랜잭션 조회가 필요 없는 경우에만 `indexer = "null"`을 설정하세요.

---

## 통합용 엔드포인트 노출 {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**노드 릴리스 v3.2.4의 JSON-RPC 제한.** v3.2.4 바이너리를 실행하는 노드(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터)는 자체 JSON-RPC 서버를 제한합니다. 이 설정들은 `app.toml`의 `[json-rpc]` 섹션에 있는 노드 로컬 설정이며 합의에 영향을 주지 않습니다. `http-body-limit`(기본값 262144바이트, 256 KiB. 이보다 큰 요청 본문은 읽기 전에 HTTP 413으로 거부됩니다), `max-concurrent-requests`(기본값 256. 이를 초과하는 요청은 즉시 HTTP 503을 받습니다), `max-open-connections`(값이 없거나 0이면 이제 무제한이 아니라 1000을 의미합니다). 또한 `eth_getLogs`와 `eth_newFilter`의 필터 인수는 토픽 위치가 4개를 넘거나, 한 위치의 대안이 1000개를 넘거나, 주소가 1000개를 넘으면 거부됩니다. 자신의 노드에 매우 큰 배치 요청이나 컨트랙트 배포 요청을 보내는 통합 사업자는 가장 큰 요청이 본문 제한에 맞는지 확인하고 필요하면 제한을 높여야 합니다.

공개 엔드포인트는 `eth_`, `net_`, `web3_`, `txpool_`(상태만) 네임스페이스를 제공합니다. v3.2.3 이상으로 초기화한 노드는 기본값이 `eth,net,web3`이며 `txpool`을 제외합니다(이 네임스페이스는 노드의 대기 중인 트랜잭션을 공개하기 때문입니다). 필요한 경우에만 추가하세요. `qor_` 네임스페이스는 어떤 릴리스 노드 빌드에서도 제공되지 않으므로 추가하지 마세요([`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace) 참조).

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
| SVM RPC      | `8899`  | Solana 호환 읽기 (SVM 트랜잭션은 비활성화됨)           |

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

노드는 포트 **26660**에서 Prometheus 메트릭을 노출할 수 있습니다(`config.toml`의 `[instrumentation]` 섹션에서 `prometheus = true`로 설정):

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

1. **체인 버전을 고정하세요.** 매니페스트가 권장하는 릴리스(이 글을 쓰는 시점에 메인넷은 **v3.2.4**, 테스트넷은 **v3.2.6**)를 실행하고, 조율된 업그레이드를 위해 공식 릴리스를 추적하며, 시스템 시계를 NTP로 동기화된 상태로 유지하세요.

2. **이중화된 노드를 운영하세요.** 로드 밸런서 뒤에 최소 두 대의 노드를 운영해 단일 노드의 재시작이나 재동기화가 통합 트래픽을 중단시키지 않도록 하세요.

3. **제네시스와 스냅샷을 검증하세요.** 시작하기 전에 항상 제네시스 SHA-256과 모든 스냅샷 체크섬을 공식 릴리스와 대조해 검증하세요.

4. **공개 엔드포인트를 보호하세요.** RPC/EVM/gRPC 앞단에 리버스 프록시, 속도 제한, 방화벽을 두세요. 인증되지 않은 쓰기 RPC를 절대 인터넷에 노출하지 마세요.

5. **필요에 맞게 프루닝을 설정하세요.** 전체 입출금 이력을 대사하는 거래소는 `pruning = "nothing"`과 `tx_index = "kv"`를 함께 사용하고, 가벼운 조회에는 `default`를 사용하세요.

6. **동기화를 지속적으로 모니터링하세요.** 블록 높이 지연, 피어 0개, `catching_up`에 멈춰 있는 노드에 대해 알림을 설정하세요.

노드 전용 배포는 서명을 하지 않습니다. 통합에서 이 노드를 통해 브로드캐스트하는 트랜잭션에는 이미 하이브리드 양자 내성 서명이 포함되어 있어야 하며(EVM 레인에서는 발신자에게 등록된 키와 열려 있는 승인 창도 필요합니다), [거래소 통합](/developer-guide/exchange-integration)과 [양자 내성 서명](/developer-guide/post-quantum-signing)을 참조하세요.

풀 노드를 실행하지 않고 네트워크를 관찰하려면 [라이트 노드 문서](/light-node/overview)를 참조하세요.

---

## 문제 해결 {#troubleshooting}

### 노드가 시계 오류로 중지되는 경우

노드 릴리스 v3.2.1부터 합의 엔진은 시스템 시계가 네트워크와 60초 넘게 어긋나면 중지됩니다. NTP 클라이언트(`chrony` 또는 `systemd-timesyncd`)를 실행하고, `timedatectl status`로 시계가 동기화되었는지 확인한 뒤 노드를 재시작하세요.

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
* [소스에서 빌드하기](/developer-guide/building-from-source) — 개발용 커뮤니티 `qorechaind` 바이너리 빌드
* [라이트 노드](/light-node/overview) — 풀 노드 없이 네트워크를 따라가는 경량 클라이언트
