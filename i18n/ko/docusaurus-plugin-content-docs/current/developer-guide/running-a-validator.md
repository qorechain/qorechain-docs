---
slug: /developer-guide/running-a-validator
title: 밸리데이터 운영하기
sidebar_label: 밸리데이터 운영하기
sidebar_position: 9
---

# 밸리데이터 운영하기

이 가이드는 QoreChain 네트워크에서 밸리데이터를 생성하는 방법, 풀 분류 설계 이해하기, PQC 키(하이브리드 ML-DSA-87 서명, FIPS 204) 등록, 노드 모니터링 방법을 다룹니다.

:::note
이 가이드는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)을 대상으로 하며, 2026년 6월 7일부터 운영 중이고 노드 릴리스 **v3.2.5**를 실행합니다(2026년 10월 29일 높이 3,906,833에서 거버넌스 제안 14로 적용되었으며, 그에 앞서 v3.2.4가 2026년 10월 23일 높이 3,742,566에서, v3.2.3이 2026년 10월 20일 높이 3,662,051에서 적용되었습니다). 밸리데이터는 v3.2.5 바이너리를 실행해야 합니다(매니페스트의 `minCompatible`은 3.2.5입니다). 아직 v3.2.4인 노드는 높이 3,906,833에서 멈추며 v3.2.5 번들이 필요합니다([노드 실행: 업그레이드](/developer-guide/running-a-node#upgrades) 참조). **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)은 v3.2.6을 실행하며(2026년 10월 27일 적용, 10월 26일 v3.2.5 이후) 실제 배포 전에 설정을 미리 연습해보는 용도로 권장됩니다. 대상 네트워크에 맞는 `--chain-id`로 대체하세요. 블록 시간은 네트워크마다 다릅니다. 메인넷은 약 3.1초(2026년 10월 27일에 최근 1,000블록이 52분 21초 걸렸습니다), 테스트넷은 약 1.3초이며, 둘 다 변동하므로 블록 수를 시간으로 환산할 때는 네트워크별로 계산하세요.
:::

:::caution 소스 빌드가 아닌 릴리스 바이너리를 사용하세요
밸리데이터는 라이브 매니페스트(`https://download.qore.host/mainnet/latest.json`, [노드 운영하기](/developer-guide/running-a-node#fetch-the-manifest) 참고)에 명시된 **릴리스 `qorechaind`**를 실행해야 합니다. 공개 소스에서 빌드한 바이너리에는 스텁 키퍼가 들어 있고 포스트 퀀텀 서명기가 없습니다. 그래서 네트워크의 합의 상태를 재현할 수 없고, `create-validator` 및 모든 Cosmos 레인 트랜잭션에 필요한 하이브리드 서명도 만들 수 없습니다([소스에서 빌드하기](/developer-guide/building-from-source) 참고). v3.2.3부터는 공개 소스에서 빌드한 바이너리가 공개 네트워크에서 아예 시작되지 않습니다. 새로 구성하는 메인넷 노드에는 v3.2.0 이상이 필요합니다. v3.2.1부터는 노드의 시계가 60초 넘게 어긋나면 노드가 멈추므로, 시스템 시계를 NTP로 동기화된 상태로 유지하세요.
:::

:::note 이 페이지에서 실제로 적용되는 부분
블록 생성은 표준 스테이크 가중 밸리데이터 순환을 사용하며, 슬래싱과 거버넌스는 아래에 표시된 매개변수의 표준 Cosmos SDK 모듈을 사용합니다. Triple-Pool CPoS 로직(풀 분류, 풀 가중 제안자 선택, 본딩 커브, 점진적 슬래싱)은 `x/qca` 모듈에 구현되어 있고 매개변수도 온체인에 있지만, **아직 블록 생성, 보상, 슬래싱에는 연결되어 있지 않습니다**. 해당 주제의 섹션은 설계를 설명하는 것이며, 풀 소속이나 평판이 현재 블록 제안 비중이나 보상을 바꾼다고 가정하여 계획하지 마세요.
:::

---

## 사전 준비 사항

* 완전히 동기화된 릴리스 `qorechaind` 노드 ([메인넷에 연결하기](/getting-started/connecting-to-mainnet) 참고, 연습하려면 [테스트넷에 연결하기](/getting-started/connecting-to-testnet))
* 운영자 계정에 **등록된 ML-DSA-87 PQC 키** ([PQC 키 등록](#pqc-key-registration) 참고) — `create-validator`에는 하이브리드 서명이 필요합니다
* 초기 셀프 위임을 위해 최소 **100,000 QOR**(100,000,000,000 uqor)가 있는 자금이 있는 계정 — 이 최소값은 온체인에서 강제되며, 미달 시 `create-validator`가 거부됩니다
* 운영자 주소에 활성화된 **`validator_operator` 부여** — 대시보드의 **Nodes & Validators** 페이지에서 [Validator Program](/dashboard/tools-hub#validator-application)을 통해 발급됩니다(신청하고, 선정되고, $1,000 프로그램 수수료를 납부). 아래 참고 사항을 확인하세요. 부여가 없으면 얼마나 많은 QOR을 셀프 본딩하든 상관없이 `create-validator`가 `ErrUnauthorized`로 실패합니다
* [스테이킹과 위임](/user-guide/staking-and-delegation) 모델에 대한 이해

---

## 네트워크 참여하기 {#joining}

**기본적으로 상태 동기화(state sync)를 사용해 참여하세요.** 제네시스부터 모든 블록을 재생하는 대신, 피어에서 최근 애플리케이션 상태를 가져옵니다. 스냅샷 다운로드는 대체 수단일 뿐입니다. 메인넷 매니페스트의 스냅샷은 여전히 2026년 8월 21일자 아카이브(높이 1,966,629, 약 27 GB)로, 여러 업그레이드 이전의 것이어서 이후 약 두 달 치 블록을 재생해야 하며, 테스트넷은 스냅샷을 아예 게시하지 않습니다.

1. 매니페스트가 명시한 릴리스 `qorechaind`를 설치하고([노드 운영하기](/developer-guide/running-a-node#fetch-the-manifest) 참고), `qorechaind init <moniker> --chain-id qorechain-vladi`를 실행한 다음, 그곳에 설명된 대로 매니페스트의 제네시스, 피어, 시드를 제자리에 두고, `app.toml`에 `minimum-gas-prices = "0.1uqor"`를 설정합니다.
2. 매니페스트에서 신뢰 지점(trust point)을 가져와 `config.toml`의 `[statesync]` 섹션을 작성합니다.

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUST_HEIGHT>
trust_hash = "<TRUST_HASH>"
trust_period = "168h0m0s"
```

3. 선택적으로 디스크 사용량을 작게 유지합니다([하드웨어](#hardware) 참고). `app.toml`에서 `pruning = "custom"`과 `pruning-keep-recent = "100000"`, `pruning-interval = "10"`을 설정하고, `config.toml`의 `[tx_index]` 아래에서 `indexer = "null"`을 설정합니다(밸리데이터는 트랜잭션 조회를 제공하지 않습니다. 조회에 사용하는 노드에서는 `null`을 쓰지 마세요).
4. `qorechaind start --minimum-gas-prices=0.1uqor`로 시작하고 `catching_up`이 `false`가 될 때까지 기다립니다.

:::warning 상태 동기화에는 서로 다른 두 RPC 서버가 필요합니다
상태 동기화는 신뢰 지점을 **두 개**의 RPC 서버와 교차 확인합니다. 매니페스트의 `stateSync.rpcServers`에는 `https://rpc.qore.host`가 **두 번** 나열되어 있습니다(테스트넷 매니페스트도 `https://rpc-testnet.qore.host`를 두 번 나열합니다). 동일한 항목 두 개는 개수 조건은 만족하지만 두 응답이 한 서버에서 나오므로 교차 확인의 의미가 없어집니다. 직접 운영하거나 독립적으로 신뢰하는 두 번째 RPC를 추가하고, 시작하기 전에 신뢰 해시를 두 번째 출처와 대조하세요. 예를 들어 `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash`의 결과가 `$TRUST_HASH`와 같아야 합니다. 매니페스트의 신뢰 지점은 매시간 갱신되므로, 오래되었다면 다시 가져오세요.
:::

시스템 시계를 NTP로 동기화된 상태로 유지하세요. v3.2.1부터는 노드의 시계가 60초 넘게 어긋나면 노드가 멈춥니다.

---

## 네트워크 매개변수 {#parameters}

이 값들은 2026년 10월 27일에 메인넷 REST API(`qorechain-vladi`, 당시 v3.2.4. v3.2.5는 2026년 10월 29일부터 실행 중)에서 읽은 것입니다. 의존하기 전에 실시간으로 확인하세요: `qorechaind query staking params`, `qorechaind query slashing params`, 또는 `GET /cosmos/staking/v1beta1/params`와 `GET /cosmos/slashing/v1beta1/params`.

| 항목 | 값 |
| --- | --- |
| 활성 세트 크기(`max_validators`) | 100 (현재 8명의 밸리데이터가 본딩되어 있으며 감금된 밸리데이터는 없음) |
| 언본딩 기간 | 1,814,400초 (21일). 위임자당 언본딩 항목은 최대 7개(`max_entries`) |
| 최소 수수료율(`min_commission_rate`) | 0 (`commission-max-rate`까지 자신의 수수료율을 직접 선택) |
| 서명 확인 윈도우 | 10,000블록(`signed_blocks_window`) |
| 윈도우당 최소 서명 비율 | 0.05, 즉 윈도우의 5% 미만에 서명하면 밸리데이터가 감금됨 |
| 다운타임 감금 / 슬래싱 | 600초 감금, 스테이크의 1% 슬래싱 |
| 이중 서명 슬래싱 | 스테이크의 5% |
| 밸리데이터 생성을 위한 셀프 본딩 하한 | **100,000 QOR**(`100000000000uqor`), 온체인에서 강제됨. 미달 시 `create-validator`가 코드 18로 실패 |
| 운영자 부여 | 발신자에게 활성화된 `validator_operator` 부여가 필요함. 없으면 `create-validator`가 `ErrUnauthorized`로 실패 |
| 수수료 하한 | 가스당 0.1 uqor |

**작업 순서.** 다음 순서로 진행하세요. (1) 계정의 PQC 키 등록, (2) `validator_operator` 부여 받기, (3) `--generate-only`로 `create-validator`를 만들고 `tx pqc cosign`으로 서명. 등록된 키가 없는 계정은 등록 트랜잭션 자체만 보낼 수 있으므로([PQC 키 등록](#pqc-key-registration) 참고) 키가 먼저이고, 부여는 `create-validator`가 실행될 때 확인됩니다. 자세한 내용은 [밸리데이터 생성하기](#validator-license-gate)와 [PQC 키 등록](#pqc-key-registration)에 있습니다.

:::caution `min-self-delegation`은 100,000 QOR 하한이 아닙니다
제네시스 밸리데이터는 온체인에서 `min_self_delegation` = `1`(1 uqor)로 표시됩니다. 이는 하한이 **아닙니다**. 그들의 제네시스 트랜잭션은 하한에서 면제되었습니다. `validator.json`의 `min-self-delegation` 필드는 최소한 그만큼을 셀프 본딩 상태로 유지하겠다는 운영자 자신의 약속일 뿐이며, 밸리데이터를 생성할 때 셀프 위임하는 `amount`에 적용되는 100,000 QOR 하한과는 무관합니다.
:::

---

## 하드웨어 {#hardware}

실행 중인 메인넷 밸리데이터에서 측정한 값입니다(2026년 10월 27일): 일반 부하에서 RAM 약 3.2~3.5 GB, CPU 10% 미만. 밸리데이터는 3~4 vCPU, 8~16 GB RAM, NVMe 스토리지에서 여유롭게 실행됩니다. 코어 수보다 싱글 코어 속도가 더 중요합니다. ML-DSA-87 서명 검증이 트랜잭션 검사 작업의 약 절반을 차지하며, 부하 시에 정점에 이릅니다.

| 항목 | 권장 밸리데이터 사양 |
| --- | --- |
| CPU | 4 vCPU, 높은 클럭 속도 |
| RAM | 16 GB |
| 디스크 | 100 GB 이상, NVMe |
| 시계 | NTP 동기화(위의 60초 규칙) |
| 네트워크 | P2P `26656`만 외부에 개방. RPC, REST, EVM은 localhost에 바인딩 |

디스크 사용량은 참여 방식에 따라 달라집니다. `pruning = "custom"`(keep-recent 100000)과 `indexer = "null"`로 상태 동기화를 통해 참여한 밸리데이터는 두 달 뒤 약 10 GB를 차지합니다. 기본 프루닝으로 제네시스부터 운영한 노드는 넉 달 뒤 약 100~130 GB를 차지합니다. [노드 운영하기](/developer-guide/running-a-node#recommended-hardware)에서 RPC 노드에 권장하는 500 GB 이상은 밸리데이터에게는 넉넉한 사양입니다.

---

## 네트워크 운영 방식 {#network-organisation}

2026년 10월 27일 현재 네트워크에는 활성 밸리데이터 8명이 있으며, 여러 국가와 둘 이상의 호스팅 제공업체에 분포해 있습니다. 공개 엔드포인트(`rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`)는 엣지 네트워크 뒤의 전용 비밸리데이터 노드가 제공하며 밸리데이터가 제공하는 일은 없고, 밸리데이터의 IP 주소는 DNS에 게시되지 않습니다. 투표권은 본딩된 스테이크를 따릅니다. 최소 셀프 본딩으로 시작한 새 밸리데이터는 작은 지분의 투표권으로 시작해, 위임이 들어오면서 늘어납니다.

---

## 밸리데이터 생성하기

### 운영자 부여: `validator_operator` {#validator-license-gate}

`create-validator`는 온체인에서 강제되는 두 가지 독립적인 검사로 게이트되며, 둘 다 필요합니다 — 큰 규모의 셀프 본딩만으로는 충분하지 않습니다.

1. **최소 100,000 QOR 셀프 본딩.**
2. **트랜잭션을 제출하는 계정에 활성화된 `validator_operator` 부여.**

이 부여는 QoreChain Association이 **Validator Program**을 통해 온체인에서 발급합니다: 대시보드의 **Nodes & Validators** 페이지([Tools Hub](/dashboard/tools-hub#validator-application))에서 신청하고, 14일간의 시험 운영 기간 동안 diana 테스트넷에서 밸리데이터를 운영한 뒤, 선정되면 **$1,000 프로그램 수수료**를 납부하세요. 그러면 신청서에 기재한 운영자 주소에 대해 부여가 일괄 서명됩니다. 내 부여는 `GET /qorechain/license/v1/check/{grantee}/validator_operator`로 확인하세요. 라이선스의 `expires_at`은 날짜나 기간이 아니라 **블록 높이**입니다 — `0`은 만료 없음을 의미합니다. 라이선스가 없거나 만료된 경우, 셀프 본딩 금액과 무관하게 `create-validator`는 `ErrUnauthorized`로 실패합니다. 이는 자금이 충분한데도 원인을 알 수 없이 실패하는 가장 흔한 이유입니다. 이 게이트가 존재하는 이유는 EVM 실행 레인이 이를 확인하거나 강제할 수 없기 때문입니다(그곳의 단일 ante 데코레이터로는 완전히 우회될 수 있습니다) — 이는 스테이킹과 검증이 오직 Native 레인에만 남아 있는 이유 중 하나입니다.

`validator.json` 파일을 만드세요(플래그 방식은 현재 SDK에서 제거되었습니다).

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

그런 다음 트랜잭션을 생성하고 서명하세요(모든 Cosmos 레인 트랜잭션과 마찬가지로 하이브리드 서명이 필요합니다. [트랜잭션 명령어](/cli-reference/transaction-commands#hybrid-signing) 참고).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

네트워크 수수료 하한은 **가스 단위당 0.1 uqor**이므로, 가스 한도 600,000에는 최소 60,000 uqor가 필요합니다.

| `validator.json` 필드          | 설명                                                |
| ------------------------------ | -------------------------------------------------- |
| `amount`                       | 셀프 위임 금액 — **최소 100,000 QOR**(`100000000000uqor`) |
| `pubkey`                       | 밸리데이터 합의 공개 키 (ed25519)                  |
| `moniker`                      | 밸리데이터의 사람이 읽을 수 있는 이름              |
| `commission-rate`              | 초기 수수료율 (예: 0.10 = 10%)                     |
| `commission-max-rate`          | 최대 수수료율 (생성 후 변경 불가)                  |
| `commission-max-change-rate`   | 일일 최대 수수료 변경률                            |
| `min-self-delegation`          | 최소한 이만큼을 셀프 본딩 상태로 유지하겠다는 운영자 자신의 약속(uqor 단위). 이는 `amount`에 적용되는 100,000 QOR 온체인 하한이 **아닙니다** |

트랜잭션이 확정된 후 밸리데이터를 확인하세요.

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## 풀 분류

:::note 설계 단계이며 아직 블록 생성에는 적용되지 않음
아래의 풀 분류는 `x/qca` 설계입니다. 매개변수는 온체인에 있지만(`qorechaind query qca config`), 블록 제안자는 아직 풀 기준으로 선정되지 않으며 풀이 보상이나 슬래싱을 아직 변경하지 않습니다.
:::

QoreChain의 `x/qca`(Quantum Consensus Allocation) 모듈은 **3단계 풀 분류 시스템**을 정의합니다. **1,000블록**마다(메인넷의 3.1초 블록 기준 약 52분) 밸리데이터는 평판과 스테이크를 기준으로 세 가지 풀 중 하나로 재분류되도록 설계되어 있습니다.

| 풀                                   | 기준                                               | 블록 할당      |
| ------------------------------------ | -------------------------------------------------- | --------------- |
| **RPoS** (Reputation Proof-of-Stake) | 평판 >= 70번째 백분위수 AND 스테이크 >= 중앙값     | 블록의 40%      |
| **DPoS** (Delegated Proof-of-Stake)  | 총 위임량 >= 10,000 QOR                            | 블록의 35%      |
| **PoS** (Proof-of-Stake)             | 나머지 모든 활성 밸리데이터                        | 블록의 25%      |

설계상 각 풀 내에서 블록 제안자는 유효 스테이크에 비례하는 가중 무작위 선택을 통해 선정되므로, 높은 평판을 가진 밸리데이터와 위임량이 많은 밸리데이터 모두 공정한 대표성을 확보하는 동시에, 소규모 밸리데이터도 참여할 수 있습니다.

### 풀 구성 조회하기

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

JSON-RPC를 통해서도 조회할 수 있습니다.

> **아직 제공되지 않음:** 현재 릴리스된 어떤 노드 빌드도 `qor_` JSON-RPC 네임스페이스를 제공하지 않으므로, 이 호출은 오늘 기준 모든 공개 엔드포인트에서 `-32601`(메서드를 찾을 수 없음)을 반환합니다. [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참고하세요.

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## 본딩 커브

:::note 설계 단계이며 아직 적용되지 않음
본딩 커브는 `x/qca`에 구현되어 있지만 아직 보상 분배에는 연결되어 있지 않습니다. 현재 스테이킹 보상은 표준 distribution 모듈을 따릅니다. 아래 공식은 설계입니다.
:::

밸리데이터의 스테이킹 보상은 여러 요소를 반영하는 본딩 커브에 의해 결정되도록 설계되어 있습니다.

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 변수     | 설명                                                        |
| -------- | ----------------------------------------------------------- |
| `R`      | 보상 금액                                                    |
| `beta`   | 기본 보상률                                                  |
| `S`      | 유효 스테이크                                                |
| `alpha`  | 충성도 스케일링 상수                                         |
| `L`      | 충성도 지속 기간 (연속 스테이킹 시간)                        |
| `Q(r)`   | 평판 품질 계수, 범위 \[0.75 - 1.25]                          |
| `P(t)`   | 프로토콜 단계 배수 (네트워크 생애주기에 따라 조정됨)         |

**핵심 요약:**

* **충성도 지속 기간 보너스:** 이 설계는 연속 스테이킹 시간에 대해 로그 형태의 항을 더합니다.
* **평판 품질 계수:** 0.75(낮은 평판)에서 1.25(우수한 평판) 사이의 범위를 가집니다. 평판 공식의 가중치는 온체인에 있습니다(`qorechaind query reputation params`).
* **프로토콜 단계 배수:** 네트워크가 여러 단계(초기 구축, 성장, 성숙)를 거치며 성숙해짐에 따라 조정됩니다.

---

## 슬래싱 {#slashing}

기본 위반 처벌 기준이며, 이 문서 작성 시점 기준으로 실시간 조회가 가능합니다.

```bash
qorechaind query slashing params
```

| 매개변수 | 값 |
| --- | --- |
| 서명 확인 윈도우 | 10,000블록 (메인넷 3.1초 블록 기준 약 8.7시간, 테스트넷은 더 짧음) |
| 윈도우당 최소 서명 비율 | 5% (`min_signed_per_window` = 0.05): 밸리데이터는 최근 10,000블록 중 **5% 미만**에 서명하면, 즉 95% 넘게 놓치면 감금됩니다 |
| 다운타임 감금 시간 | 600초 (10분) |
| 다운타임 슬래싱 비율 | 스테이크의 1% |
| 이중 서명 슬래싱 비율 | 스테이크의 5% |

감금은 고정된 10분의 타임아웃과 고정된 처벌로 이루어집니다. 언본딩에는 21일(1,814,400초)이 걸리고, 활성 세트는 최대 100명의 밸리데이터(`max_validators`)를 수용하며, 위임자 한 명당 언본딩 항목은 최대 7개(`max_entries`)까지 가질 수 있습니다. 아래의 점진적 모델은 별개의 설계로, 반복 위반에 대해 추가로 확대되는 결과를 그 위에 누적 적용하려는 것이며 아직 연결되어 있지 않습니다.

## 점진적 슬래싱

:::note 설계 단계이며 아직 적용되지 않음
점진적 슬래싱은 `x/qca`에 구현되어 있지만 슬래싱에는 연결되어 있지 않습니다. 실제로 적용되는 처벌은 위 표의 표준 `x/slashing` 값입니다. 아래 매개변수는 설계입니다(`qorechaind query qca config`).
:::

점진적 슬래싱 설계는 반복 위반자에 대한 처벌을 점진적으로 강화하면서도 시간이 지나면 밸리데이터가 회복할 수 있도록 합니다.

```
penalty = base_rate * escalation^effective_count * severity
```

| 매개변수                     | 값             |
| ----------------------------- | -------------- |
| 이벤트당 최대 처벌            | 스테이크의 33% |
| 감쇠 반감기                   | 100,000 블록   |
| 다운타임 심각도               | 1.0            |
| 이중 서명 심각도              | 2.0            |
| 라이트 클라이언트 공격 심각도 | 3.0            |

1. **위반 발생 시마다 유효 카운트가 증가합니다.** 다운타임, 이중 서명 등 모든 위반 행위는 밸리데이터의 유효 카운트를 증가시키며, 이는 이후의 처벌에 영향을 줍니다.

2. **처벌은 지수적으로 증가합니다.** 위의 공식을 사용해 유효 카운트를 기준으로 처벌이 확대되므로, 반복 위반자는 훨씬 더 큰 처벌을 받게 됩니다.

3. **유효 카운트는 시간이 지나면 감쇠합니다.** 유효 카운트는 100,000블록(메인넷 3.1초 블록 기준 약 3.6일)의 반감기로 감쇠하며, 이를 통해 밸리데이터는 일정 기간 정상적으로 운영하면 회복할 수 있습니다.

4. **단발성 이벤트와 반복 위반의 차이.** 우발적인 단발성 다운타임 이벤트는 경미한 처벌로 이어지지만, 반복되는 위반은 지수적으로 증가하는 결과를 초래합니다.

---

## PQC 키 등록 {#pqc-key-registration}

`create-validator`를 실행하기 **전에**, 그리고 가능한 한 일찍 **포스트 퀀텀 암호화(PQC) 공개 키**(ML-DSA-87)를 등록하세요. [Validator Readiness](/dashboard/tools-hub#validator-application) 패널은 신청하는 순간부터 이를 확인합니다. 이는 **선택 사항이 아니며 자동으로 처리되지도 않습니다.** 체인은 모든 Cosmos 레인 트랜잭션에 하이브리드 PQC 서명을 요구하며, `MsgCreateValidator`는 예외 대상 메시지 유형에 포함되지 않고, 어떤 계정도 키를 자동으로 등록하지 않습니다. 등록은 명시적인 트랜잭션이며, 모든 계정(밸리데이터 운영자 포함)이 사전에 직접 보내야 합니다. 먼저 키를 생성하세요.

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc`는 **소유 증명**(proof of possession)을 첨부합니다: 키가 `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)`에 서명하고 체인이 이를 검증하므로, 개인 키를 보유하지 않은 공개 키는 누구도 등록할 수 없습니다. v3.2.3에서는 선택 사항이지만 권장됩니다. v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) 계정 레코드는 증명이 검증되었는지 여부도 보고합니다(`GET /qorechain/pqc/v1/account/{address}`의 `possession_proven`).

:::note v3.2.3에서 키 등록에 관해 달라진 점
* 등록된 키가 **없는** 계정은 등록 트랜잭션 자체만 보낼 수 있습니다: 하이브리드 서명 확장을 포함한 다른 트랜잭션은 모두 거부됩니다. 먼저 등록한 다음, 나머지는 모두 `tx pqc cosign`으로 서명하세요.
* `classical_only` 키, 빈 키, 퇴화된(degenerate) 키는 등록 시 거부됩니다.
* 계정이 키를 보유한 이후에는 추가적인 키 관리(교체, 마이그레이션, 재등록) 자체도 하이브리드 서명되어야 하며, `authz`를 통해 보낼 수 없습니다.
* `tx pqc gen-key`는 기존 키 파일을 절대 덮어쓰지 않습니다.
:::

| 매개변수       | 설명                                              |
| -------------- | ------------------------------------------------- |
| `dilithium5`   | 알고리즘 (ML-DSA-87)                              |
| `<pubkey-hex>` | 16진수로 인코딩된 2592바이트 ML-DSA-87 공개 키    |
| `hybrid`       | 키 유형 (hybrid = 기존 방식 + PQC 모두 사용)      |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid`는 Dilithium-5용의 동등한 레거시 형식입니다.)

:::caution `--gas`를 명시적으로 지정하세요
ML-DSA-87 공개 키는 2,592바이트이며, 이를 온체인에 기록하면 기본 가스 한도인 200,000을 초과할 수 있습니다(메인넷에서의 등록은 220,000~350,000 가스를 사용했습니다). `--gas 600000`(또는 그 이상)을 지정하지 않으면 트랜잭션이 알기 어려운 `out of gas` 오류와 함께 실패할 수 있습니다. 수수료는 최소한 가스 한도에 0.1 uqor를 곱한 값이어야 하므로, `--gas 600000`에는 `--fees 60000uqor` 이상이 필요합니다.
:::

등록을 확인하세요.

```bash
qorechaind query pqc account <account-address>
```

`~/.qorechaind/pqc/` 아래의 키 파일은 계정의 포스트 퀀텀 서명 키입니다. 니모닉처럼 백업하고, 가능하면 합의 키를 실행하는 머신과 분리해 보관하세요. 복구와 교체에 대해서는 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing#pqc-key-registration)을 참고하세요.

---

## 모니터링

### Prometheus 메트릭

QoreChain은 **26660번 포트**에서 Prometheus 메트릭을 노출합니다.

```
http://localhost:26660/metrics
```

`config.toml`의 `[instrumentation]` 섹션에서 `prometheus = true`로 설정해 엔드포인트를 활성화하세요. 노드는 합의 엔진의 표준 메트릭(블록 높이, 합의 라운드, 밸리데이터 세트, 피어, 멤풀)을 노출합니다. 내 노드가 제공하는 항목은 `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'`로 확인하세요. 밸리데이터별 서명 상태는 체인 자체에서 읽는 것이 가장 신뢰할 수 있습니다(아래 상태 점검 참고). 감금 여부를 결정하는 것이 체인의 자체 기록이기 때문입니다.

### 평판 매개변수 조회하기

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

JSON-RPC를 통해서도 조회할 수 있습니다.

> **아직 제공되지 않음:** 현재 릴리스된 어떤 노드 빌드도 `qor_` JSON-RPC 네임스페이스를 제공하지 않으므로, 이 호출은 오늘 기준 모든 공개 엔드포인트에서 `-32601`(메서드를 찾을 수 없음)을 반환합니다. [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참고하세요.

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### 상태 점검

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## 운영 모범 사례

1. **센트리 노드 아키텍처를 사용하세요.** 밸리데이터를 DDoS 공격으로부터 보호하기 위해 센트리 노드 뒤에서 운영하세요. 공용 네트워크에는 센트리 노드만 노출하세요.

2. **알림을 설정하세요.** 놓친 블록, 낮은 가동률, 예기치 않은 재시작에 대한 알림을 구성하세요. 소수의 블록을 놓치는 것은 정상이지만, 지속적으로 놓치면 슬래싱이 발생합니다.

3. **높은 가동률을 유지하세요.** 장기간의 다운타임은 밸리데이터를 감금시키고(최근 10,000블록 중 5% 미만에 서명) 슬래싱됩니다. [슬래싱](#slashing)을 참고하세요.

4. **소프트웨어를 최신 상태로 유지하세요.** QoreChain 릴리스를 추적하고 업데이트를 신속하게 적용하세요. 체인 업그레이드에 대해서는 밸리데이터 커뮤니티와 조율하세요.

5. **키를 안전하게 보관하세요.** 밸리데이터 합의 키(`priv_validator_key.json`)를 보호하고 백업은 오프라인에 보관하세요. 원격 서명자도 고려해 볼 수 있습니다. 원격 서명(`priv_validator_laddr`)은 `qorechaind` 릴리스 바이너리로 검증되지 않았고, 포스트 퀀텀 모듈은 합의 키 유형(ed25519)을 바꾸지 않으므로, 서명자 구성에 의존하기 전에 반드시 테스트넷에서 테스트하세요. 가능하면 운영자 계정의 키와 그 PQC 키 파일은 밸리데이터를 실행하는 머신에서 분리해 두세요.

6. **PQC 키를 먼저 등록하세요.** 운영자 계정은 밸리데이터를 생성하거나 다른 Cosmos 레인 트랜잭션을 보내기 전에 등록된 ML-DSA-87 키가 있어야 합니다.

7. **시계를 동기화된 상태로 유지하세요.** NTP 클라이언트를 실행하세요. v3.2.1부터는 노드의 시계가 60초 넘게 어긋나면 노드가 멈춥니다.

---

## 밸리데이터 명령어 참고

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

네트워크 수수료 하한은 가스 단위당 0.1 uqor입니다. 등록된 PQC 키가 **없는** 운영자 계정은 `unjail`을 기존 방식으로 보낼 수 있습니다. 하지만 키를 등록하고 나면 모든 트랜잭션(unjail 포함)에 하이브리드 서명이 필요합니다.

---

## 연결된 네트워크 검증하기 {#connected-networks}

:::caution 아직 활성화된 연결 네트워크가 없습니다
브릿지 모듈은 메인넷과 테스트넷에 배포되어 있지만, **활성화된 브릿지 경로는 없습니다**. 37개 체인 구성이 모두 `pending` 상태이고, 등록된 브릿지 밸리데이터가 없으며, 생성된 브릿지 작업이 한 번도 없으며, 메인넷에는 열려 있는 IBC 채널이 없습니다(테스트넷에는 전송 채널이 하나 있지만 브릿지 경로가 아닙니다). 아래 프레임워크는 설계를 설명하는 것이며, 현재 연결된 네트워크에서 검증할 것은 없습니다.
:::

체인 버전 **v3.1.80**부터 적용되는 이 설계에서는, QoreChain 밸리데이터가 [브릿지](/architecture/bridge-architecture)를 통해 연결된 네트워크의 검증도 지원할 수 있습니다. 이는 **라이선스 기반이며 선택적 참여**입니다.

1. **라이선스를 보유해야 합니다.** 밸리데이터는 대상 네트워크에 대한 유효한 `validator_<chain>`(또는 `qcb_bridge`) 라이선스를 보유해야 합니다. 오케스트레이터는 라이선스가 없으면 외부 클라이언트 실행을 거부합니다(fail-closed).
2. **활성화 시 클라이언트가 자동으로 프로비저닝됩니다.** 라이선스가 활성화되면 QoreChain은 해당 네트워크의 클라이언트를 노드에 프로비저닝합니다 — 고정된 클라이언트를 다운로드하고, 설정을 렌더링하며, QoreChain의 오케스트레이션 하에 실행합니다. 활성화 전에는 아무것도 가져오지 않습니다.
3. **네트워크의 키와 스테이크는 직접 제공해야 합니다.** 외부 네트워크의 밸리데이터/스테이크 및 서명 키는 네트워크별로 **운영자가 직접 제공**해야 합니다. QoreChain은 드라이버 프레임워크와 강제된 라이선스 게이트를 제공할 뿐, 외부 체인 스테이크를 제공하지 않습니다.

**37개 브릿지 네트워크** 전체에 대한 드라이버가 존재하며, 밸리데이터가 참여할 수 있는 방식에 따라 다음과 같이 분류됩니다.

| 분류 | 참여 방식 | 예시 |
| ----- | ------------- | -------- |
| 무허가 밸리데이터 | 스테이킹 및 운영 | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| 제한/선출/승인제 | 스테이킹, 단 상한 또는 선출 대상 | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 풀 노드 | 풀 노드 운영 (스테이킹 없음) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| 비스테이킹/신뢰 목록 | 스테이킹 없이 관찰/참여 | Bitcoin, Filecoin, XRPL, Stellar |

:::note
클라이언트 버전 고정은 최선의 노력(best-effort) 기준으로 이루어집니다. 프로덕션 활성화 전에 대상 네트워크의 업스트림 클라이언트 릴리스를 반드시 확인하세요.
:::

## 다음 단계

* [노드 운영하기](/developer-guide/running-a-node) — 릴리스 바이너리 설치, 상태 동기화 및 노드 설정
* [EVM 개발](/developer-guide/evm-development) — QoreChain에 스마트 컨트랙트 배포하기
* [포스트 퀀텀 서명](/developer-guide/post-quantum-signing) — 키 등록, 복구 및 교체
