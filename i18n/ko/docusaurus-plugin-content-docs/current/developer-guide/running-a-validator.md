---
slug: /developer-guide/running-a-validator
title: 밸리데이터 운영
sidebar_label: 밸리데이터 운영
sidebar_position: 9
---

# 밸리데이터 운영

이 가이드는 QoreChain 네트워크에서 밸리데이터를 생성하고, 풀 분류 시스템을 이해하며, 양자내성 보안을 위한 PQC 키를 등록하고, 노드를 모니터링하는 방법을 다룹니다.

:::note
이 가이드는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)을 대상으로 하며, 이 메인넷은 2026년 6월 7일부터 체인 버전 **v3.1.77**로 운영 중입니다. 운영을 시작하기 전에 설정을 리허설하기 위해 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 권장합니다. 대상 네트워크에 맞는 `--chain-id`로 치환하세요.
:::

---

## 사전 요구 사항

* 완전히 동기화된 `qorechaind` 노드 ([테스트넷 연결](/getting-started/connecting-to-testnet) 참고)
* 초기 자기 위임을 위한 최소 **1,000 QOR**(1,000,000,000 uqor)가 자금으로 들어 있는 계정
* [스테이킹 및 위임](/user-guide/staking-and-delegation) 모델에 대한 숙지

---

## 밸리데이터 생성

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| 매개변수                      | 설명                                        |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | 자기 위임 금액 (최소 스테이크)             |
| `--pubkey`                     | 밸리데이터 합의 공개 키 (ed25519)           |
| `--moniker`                    | 밸리데이터의 사람이 읽을 수 있는 이름             |
| `--commission-rate`            | 초기 수수료율 (예: 0.10 = 10%)         |
| `--commission-max-rate`        | 최대 수수료율 (생성 후 변경 불가) |
| `--commission-max-change-rate` | 최대 일일 수수료 변경율               |
| `--min-self-delegation`        | 운영자가 자기 위임해야 하는 최소 토큰     |

트랜잭션이 확인된 후 밸리데이터를 검증하세요:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## 풀 분류

QoreChain은 `x/qca`(Quantum Consensus Allocation) 모듈이 관리하는 **3개 풀 분류 시스템**을 사용합니다. **1,000블록**마다 밸리데이터는 평판과 스테이크를 기준으로 세 풀 중 하나로 재분류됩니다:

| 풀                                 | 기준                                          | 블록 할당 |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | 평판 >= 70번째 백분위 AND 스테이크 >= 중앙값 | 블록의 40%    |
| **DPoS** (Delegated Proof-of-Stake)  | 총 위임 >= 10,000 QOR                    | 블록의 35%    |
| **PoS** (Proof-of-Stake)             | 나머지 모든 활성 밸리데이터                   | 블록의 25%    |

각 풀 내에서 블록 제안자는 유효 스테이크에 비례한 **가중 무작위 선택**으로 선정됩니다. 이 분류는 고평판 및 고위임 밸리데이터가 공정한 대표성을 받도록 하면서도, 소규모 밸리데이터의 참여도 여전히 허용합니다.

### 풀 분류 조회

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC를 통해:

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

밸리데이터의 스테이킹 보상은 여러 요인을 통합한 본딩 커브로 결정됩니다:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 변수 | 설명                                                |
| -------- | ---------------------------------------------------------- |
| `R`      | 보상 금액                                              |
| `beta`   | 기본 보상률                                           |
| `S`      | 유효 스테이크                                            |
| `alpha`  | 충성도 스케일링 상수                                   |
| `L`      | 충성도 기간 (연속 스테이킹 시간)                 |
| `Q(r)`   | 평판 품질 계수, 범위 \[0.75 - 1.25]            |
| `P(t)`   | 프로토콜 단계 승수 (네트워크 수명 주기에 따라 조정) |

**핵심 요점:**

* **충성도 기간 보너스:** 연속적으로 스테이킹하는 밸리데이터는 로그 충성도 항을 통해 점점 증가하는 보상을 받습니다. 이는 장기적 헌신을 장려합니다.
* **평판 품질 계수:** 0.75(낮은 평판)에서 1.25(우수한 평판) 사이의 범위를 가집니다. 평판은 가동 시간, 성공적인 제안, 커뮤니티 참여, 트랜잭션 검증 품질로부터 계산됩니다.
* **프로토콜 단계 승수:** 네트워크가 여러 단계(부트스트랩, 성장, 성숙)를 거쳐 성숙함에 따라 조정됩니다.

---

## 점진적 슬래싱

QoreChain은 밸리데이터가 시간이 지나면서 회복할 수 있게 하면서 반복 위반자에 대한 벌칙을 단계적으로 높이는 **점진적 슬래싱** 모델을 사용합니다:

```
penalty = base_rate * escalation^effective_count * severity
```

| 매개변수                    | 값          |
| ---------------------------- | -------------- |
| 이벤트당 최대 벌칙    | 스테이크의 33%   |
| 감쇠 반감기              | 100,000 블록 |
| 다운타임 심각도            | 1.0            |
| 이중 서명 심각도         | 2.0            |
| 라이트 클라이언트 공격 심각도 | 3.0            |

1. **각 위반이 유효 카운트를 증가시킵니다.** 모든 위반(다운타임, 이중 서명 등)은 밸리데이터의 유효 카운트를 증가시키며, 이는 향후 벌칙에 영향을 줍니다.

2. **벌칙이 기하급수적으로 증가합니다.** 위의 공식을 사용해 유효 카운트를 기반으로 벌칙이 증가하므로, 반복 위반자는 훨씬 큰 벌칙에 직면합니다.

3. **유효 카운트가 시간이 지나며 감쇠합니다.** 유효 카운트는 100,000블록(6초 블록 기준 약 7일)의 반감기로 감쇠하므로, 밸리데이터는 일정 기간 양호한 행동 후 회복할 수 있습니다.

4. **단일 이벤트 대 반복 위반.** 단일 우발적 다운타임 이벤트는 경미한 벌칙을 초래하는 반면, 반복 위반은 기하급수적으로 증가하는 결과를 유발합니다.

---

## PQC 키 등록

밸리데이터는 ML-DSA-87 알고리즘을 사용해 **양자내성 암호(PQC) 공개 키**를 선택적으로 등록할 수 있습니다. 이는 밸리데이터 신원에 대한 양자내성 보안을 제공하며 하이브리드 서명에 사용될 수 있습니다.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| 매개변수      | 설명                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | hex 인코딩된 2592바이트 ML-DSA-87 공개 키    |
| `hybrid`       | 등록 모드 (hybrid = 고전적 + PQC 모두) |

등록 검증:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**권장 사항:** PQC 키 등록은 선택 사항이지만 메인넷에서 운영하는 밸리데이터에게 강력히 권장됩니다. 양자 컴퓨팅 위협에 대한 미래 지향적 방어를 제공합니다.
:::

---

## 모니터링

### Prometheus 메트릭

QoreChain은 포트 **26660**에 Prometheus 메트릭을 노출합니다:

```
http://localhost:26660/metrics
```

모니터링할 주요 메트릭:

| 메트릭                          | 설명                                     |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | 밸리데이터가 놓친 총 블록 수           |
| `qorechain_validator_uptime`    | 최근 N개 블록에 대한 가동 시간 비율        |
| `qorechain_reputation_score`    | 현재 평판 점수                        |
| `qorechain_pool_classification` | 현재 풀 배정 (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | 연속으로 서명한 블록                    |
| `consensus_height`              | 현재 블록 높이                            |
| `consensus_rounds`              | 현재 높이에 대한 합의 라운드             |

### 평판 점수 조회

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC를 통해:

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

### 헬스 체크

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## 운영 모범 사례

1. **센트리 노드 아키텍처를 사용하세요.** DDoS 공격으로부터 밸리데이터를 보호하기 위해 센트리 노드 뒤에서 밸리데이터를 운영하세요. 센트리 노드만 공용 네트워크에 노출하세요.

2. **경보를 설정하세요.** 놓친 블록, 낮은 가동 시간, 예기치 않은 재시작에 대한 경보를 구성하세요. 몇 개의 블록을 놓치는 것은 정상이지만, 지속적인 누락은 슬래싱을 유발합니다.

3. **높은 가동 시간을 유지하세요.** 평판 시스템은 일관된 가동 시간에 보상합니다. 장기간의 다운타임은 평판 품질 계수를 저하시켜 보상을 줄입니다.

4. **소프트웨어를 최신으로 유지하세요.** QoreChain 릴리스를 추적하고 업데이트를 신속하게 적용하세요. 체인 업그레이드를 위해 밸리데이터 커뮤니티와 조율하세요.

5. **키를 보호하세요.** 밸리데이터 합의 키에는 하드웨어 보안 모듈(HSM) 또는 원격 서명자를 사용하세요. 노드와 동일한 머신에 키를 절대 저장하지 마세요.

6. **PQC 키를 등록하세요.** ML-DSA-87 키를 등록하여 양자 위협에 대비해 밸리데이터를 미래 대비하세요.

7. **풀을 모니터링하세요.** 1,000블록마다 풀 분류를 추적하세요. 평판을 개선하면 PoS에서 RPoS로 이동할 수 있으며, 이는 블록 제안 기회를 크게 늘립니다.

---

## 밸리데이터 명령 레퍼런스

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## 다음 단계

* [소스에서 빌드](/developer-guide/building-from-source) — `qorechaind` 바이너리 빌드
* [EVM 개발](/developer-guide/evm-development) — QoreChain에 스마트 컨트랙트 배포
* [계정 추상화](/developer-guide/account-abstraction) — 밸리데이터 운영을 위한 프로그래밍 가능한 계정
