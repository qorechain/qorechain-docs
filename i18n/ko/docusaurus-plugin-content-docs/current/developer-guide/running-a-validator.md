---
slug: /developer-guide/running-a-validator
title: 검증자 운영하기
sidebar_label: 검증자 운영하기
sidebar_position: 9
---

# 검증자 운영하기

이 가이드에서는 QoreChain 네트워크에서 검증자를 생성하는 방법, 풀 분류 시스템의 이해, 양자 내성 보안을 위한 PQC 키 등록, 그리고 노드 모니터링 방법을 다룹니다.

:::note
이 가이드는 2026년 6월 7일부터 가동 중이며 체인 버전 **v3.1.82**를 실행하는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)을 대상으로 합니다. 라이브 전환 전에 설정을 리허설하려면 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용하는 것을 권장합니다. 대상 네트워크에 맞는 `--chain-id`로 바꾸어 사용하세요.
:::

---

## 사전 요구 사항

* 완전히 동기화된 `qorechaind` 노드 ([테스트넷에 연결하기](/getting-started/connecting-to-testnet) 참조)
* 초기 셀프 위임을 위한 최소 **1,000 QOR**(1,000,000,000 uqor)이 입금된 계정
* [스테이킹 및 위임](/user-guide/staking-and-delegation) 모델에 대한 이해

---

## 검증자 생성

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

| 매개변수                        | 설명                                              |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | 셀프 위임 수량(최소 스테이크)                      |
| `--pubkey`                     | 검증자 합의 공개 키(ed25519)                       |
| `--moniker`                    | 검증자에 붙이는 사람이 읽기 쉬운 이름              |
| `--commission-rate`            | 초기 수수료율(예: 0.10 = 10%)                      |
| `--commission-max-rate`        | 최대 수수료율(생성 후 변경 불가)                   |
| `--commission-max-change-rate` | 일일 최대 수수료 변경률                            |
| `--min-self-delegation`        | 운영자가 셀프 위임해야 하는 최소 토큰 수량         |

트랜잭션이 확정되면 검증자를 확인하세요:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## 풀 분류

QoreChain은 `x/qca`(Quantum Consensus Allocation) 모듈이 관리하는 **3-풀 분류 시스템**을 사용합니다. **1,000 블록**마다 검증자는 평판과 스테이크에 따라 다음 세 가지 풀 중 하나로 재분류됩니다:

| 풀                                   | 기준                                              | 블록 할당        |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | 평판 >= 70번째 백분위수 그리고 스테이크 >= 중앙값 | 블록의 40%       |
| **DPoS** (Delegated Proof-of-Stake)  | 총 위임량 >= 10,000 QOR                           | 블록의 35%       |
| **PoS** (Proof-of-Stake)             | 나머지 모든 활성 검증자                           | 블록의 25%       |

각 풀 내에서 블록 제안자는 유효 스테이크에 비례하는 **가중 무작위 선택** 방식으로 선정됩니다. 이 분류 체계는 높은 평판과 높은 위임량을 가진 검증자 모두가 공정하게 대표되도록 보장하는 동시에, 소규모 검증자도 계속 참여할 수 있도록 합니다.

### 내 풀 분류 조회하기

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC를 통한 조회:

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

검증자의 스테이킹 보상은 여러 요소를 반영하는 본딩 커브에 의해 결정됩니다:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 변수     | 설명                                                       |
| -------- | ---------------------------------------------------------- |
| `R`      | 보상 수량                                                  |
| `beta`   | 기본 보상률                                                |
| `S`      | 유효 스테이크                                              |
| `alpha`  | 충성도 스케일링 상수                                       |
| `L`      | 충성도 기간(연속 스테이킹 시간)                            |
| `Q(r)`   | 평판 품질 계수, 범위 \[0.75 - 1.25]                        |
| `P(t)`   | 프로토콜 단계 승수(네트워크 수명 주기에 따라 조정)         |

**핵심 요점:**

* **충성도 기간 보너스:** 연속으로 스테이킹하는 검증자는 로그형 충성도 항을 통해 점점 증가하는 보상을 받습니다. 이는 장기적인 참여를 장려합니다.
* **평판 품질 계수:** 0.75(낮은 평판)부터 1.25(우수한 평판)까지의 범위를 가집니다. 평판은 가동 시간, 성공적인 블록 제안, 커뮤니티 참여, 트랜잭션 검증 품질을 기반으로 계산됩니다.
* **프로토콜 단계 승수:** 네트워크가 여러 단계(부트스트랩, 성장, 성숙)를 거쳐 발전함에 따라 조정됩니다.

---

## 점진적 슬래싱

QoreChain은 반복 위반자에 대한 벌칙을 단계적으로 강화하면서도 시간이 지나면 검증자가 회복할 수 있도록 하는 **점진적 슬래싱** 모델을 사용합니다:

```
penalty = base_rate * escalation^effective_count * severity
```

| 매개변수                        | 값             |
| ------------------------------ | -------------- |
| 이벤트당 최대 벌칙             | 스테이크의 33% |
| 감쇠 반감기                    | 100,000 블록   |
| 다운타임 심각도                | 1.0            |
| 이중 서명 심각도               | 2.0            |
| 라이트 클라이언트 공격 심각도  | 3.0            |

1. **각 위반은 유효 카운트를 증가시킵니다.** 모든 위반(다운타임, 이중 서명 등)은 검증자의 유효 카운트를 증가시키며, 이는 향후 벌칙에 영향을 미칩니다.

2. **벌칙은 지수적으로 증가합니다.** 위의 공식에 따라 유효 카운트를 기반으로 벌칙이 강화되므로, 반복 위반자는 훨씬 더 큰 벌칙을 받게 됩니다.

3. **유효 카운트는 시간이 지나면서 감쇠합니다.** 유효 카운트는 100,000 블록(6초 블록 기준 약 7일)의 반감기로 감쇠하므로, 일정 기간 모범적으로 운영하면 검증자가 회복할 수 있습니다.

4. **단일 이벤트 vs 반복 위반.** 우발적인 단일 다운타임 이벤트는 경미한 벌칙만 초래하지만, 반복적인 위반은 지수적으로 증가하는 결과를 불러옵니다.

---

## PQC 키 등록

검증자는 선택적으로 ML-DSA-87 알고리즘을 사용하는 **양자 내성 암호(PQC) 공개 키**를 등록할 수 있습니다. 이는 검증자 신원에 대한 양자 내성 보안을 제공하며 하이브리드 서명에 사용할 수 있습니다.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| 매개변수       | 설명                                              |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 16진수로 인코딩된 2592바이트 ML-DSA-87 공개 키    |
| `hybrid`       | 등록 모드(hybrid = 클래식 + PQC 모두)             |

등록 확인:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**권장 사항:** PQC 키 등록은 선택 사항이지만 메인넷에서 운영하는 검증자에게 강력히 권장됩니다. 양자 컴퓨팅 위협에 대한 미래 지향적 방어책을 제공합니다.
:::

---

## 모니터링

### Prometheus 메트릭

QoreChain은 **26660** 포트에서 Prometheus 메트릭을 노출합니다:

```
http://localhost:26660/metrics
```

모니터링해야 할 주요 메트릭:

| 메트릭                           | 설명                                            |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | 검증자가 놓친 총 블록 수                        |
| `qorechain_validator_uptime`    | 최근 N 블록 동안의 가동 시간 비율               |
| `qorechain_reputation_score`    | 현재 평판 점수                                  |
| `qorechain_pool_classification` | 현재 풀 할당(0=PoS, 1=DPoS, 2=RPoS)             |
| `qorechain_consecutive_signed`  | 연속으로 서명한 블록 수                         |
| `consensus_height`              | 현재 블록 높이                                  |
| `consensus_rounds`              | 현재 높이의 합의 라운드 수                      |

### 평판 점수 조회

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC를 통한 조회:

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
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## 운영 모범 사례

1. **센트리 노드 아키텍처를 사용하세요.** DDoS 공격으로부터 보호하기 위해 검증자를 센트리 노드 뒤에서 운영하세요. 공개 네트워크에는 센트리 노드만 노출해야 합니다.

2. **알림을 설정하세요.** 놓친 블록, 낮은 가동 시간, 예기치 않은 재시작에 대한 알림을 구성하세요. 몇 개의 블록을 놓치는 것은 정상이지만, 지속적으로 놓치면 슬래싱이 발생합니다.

3. **높은 가동 시간을 유지하세요.** 평판 시스템은 꾸준한 가동 시간에 보상을 제공합니다. 장기간의 다운타임은 평판 품질 계수를 떨어뜨려 보상이 줄어듭니다.

4. **소프트웨어를 최신 상태로 유지하세요.** QoreChain 릴리스를 추적하고 신속하게 업데이트를 적용하세요. 체인 업그레이드 시에는 검증자 커뮤니티와 협력하세요.

5. **키를 안전하게 보관하세요.** 검증자 합의 키에는 하드웨어 보안 모듈(HSM) 또는 원격 서명자를 사용하세요. 노드와 동일한 머신에 키를 절대 저장하지 마세요.

6. **PQC 키를 등록하세요.** ML-DSA-87 키를 등록하여 양자 위협에 대비해 검증자를 미래에 대비시키세요.

7. **풀을 모니터링하세요.** 1,000 블록마다 풀 분류를 추적하세요. 평판을 개선하면 PoS에서 RPoS로 이동할 수 있으며, 블록 제안 기회가 크게 늘어납니다.

---

## 검증자 명령어 참조

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

## 연결된 네트워크 검증하기 {#connected-networks}

체인 버전 **v3.1.80**부터 QoreChain 검증자는 [브리지](/architecture/bridge-architecture)를 통해 연결된 네트워크의 검증도 도울 수 있습니다. 이는 **라이선스 기반이며 선택적(opt-in)** 기능입니다:

1. **라이선스를 보유해야 합니다.** 검증자는 대상 네트워크에 대한 활성 `validator_<chain>`(또는 `qcb_bridge`) 라이선스를 보유해야 합니다. 오케스트레이터는 라이선스가 없으면 외부 클라이언트 시작을 거부합니다(fail-closed).
2. **활성화 시 클라이언트가 자동 프로비저닝됩니다.** 라이선스가 활성화되면 QoreChain은 해당 네트워크의 클라이언트를 노드에 프로비저닝합니다 — 고정(pinned) 버전의 클라이언트를 다운로드하고, 설정을 렌더링하며, QoreChain의 오케스트레이션 아래에서 실행합니다. 활성화 전에는 아무것도 가져오지 않습니다.
3. **해당 네트워크의 키와 스테이크를 직접 준비해야 합니다.** 외부 네트워크의 검증자/스테이크 및 서명 키는 네트워크별로 **운영자가 직접 제공**해야 합니다. QoreChain은 드라이버 프레임워크와 강제되는 라이선스 게이트를 제공할 뿐, 외부 체인의 스테이크를 제공하지 않습니다.

드라이버는 **37개 브리지 네트워크** 전체에 대해 존재하며, 검증자의 참여 방식에 따라 다음과 같이 분류됩니다:

| 분류 | 참여 방식 | 예시 |
| ----- | ------------- | -------- |
| 무허가(permissionless) 검증자 | 스테이킹 후 운영 | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| 상한 / 선출 / 승인 기반 | 스테이킹 가능하나 상한 또는 선출의 적용을 받음 | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 풀 노드 | 풀 노드 운영(스테이킹 없음) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| 비스테이킹 / 신뢰 목록 | 스테이킹 없이 관찰/참여 | Bitcoin, Filecoin, XRPL, Stellar |

:::note
클라이언트 버전 고정은 최선의 노력(best-effort)으로 제공됩니다. 프로덕션 활성화 전에 대상 네트워크의 업스트림 클라이언트 릴리스를 확인하세요.
:::

## 다음 단계

* [소스에서 빌드하기](/developer-guide/building-from-source) — `qorechaind` 바이너리 빌드
* [EVM 개발](/developer-guide/evm-development) — QoreChain에 스마트 컨트랙트 배포
* [계정 추상화](/developer-guide/account-abstraction) — 검증자 운영을 위한 프로그래머블 계정
