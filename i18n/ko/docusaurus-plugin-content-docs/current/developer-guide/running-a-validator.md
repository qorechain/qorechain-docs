---
slug: /developer-guide/running-a-validator
title: 밸리데이터 운영하기
sidebar_label: 밸리데이터 운영하기
sidebar_position: 9
---

# 밸리데이터 운영하기

이 가이드는 QoreChain 네트워크에서 밸리데이터를 생성하는 방법, 풀 분류 시스템 이해하기, 양자내성 보안을 위한 PQC 키 등록, 노드 모니터링 방법을 다룹니다.

:::note
이 가이드는 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)을 대상으로 하며, 2026년 6월 7일부터 체인 버전 **v3.1.92**로 운영되고 있습니다. **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)은 실제 배포 전에 설정을 미리 연습해보는 용도로 권장됩니다. 대상 네트워크에 맞는 `--chain-id`로 대체하세요.
:::

---

## 사전 준비 사항

* 완전히 동기화된 `qorechaind` 노드 (참고: [테스트넷에 연결하기](/getting-started/connecting-to-testnet))
* 초기 셀프 위임을 위해 최소 **1,000 QOR**(1,000,000,000 uqor)가 있는 자금이 있는 계정
* [스테이킹과 위임](/user-guide/staking-and-delegation) 모델에 대한 이해

---

## 밸리데이터 생성하기

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

| 매개변수                       | 설명                                                |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | 셀프 위임 금액 (최소 스테이크)                     |
| `--pubkey`                     | 밸리데이터 합의 공개 키 (ed25519)                  |
| `--moniker`                    | 밸리데이터의 사람이 읽을 수 있는 이름              |
| `--commission-rate`            | 초기 수수료율 (예: 0.10 = 10%)                     |
| `--commission-max-rate`        | 최대 수수료율 (생성 후 변경 불가)                  |
| `--commission-max-change-rate` | 일일 최대 수수료 변경률                            |
| `--min-self-delegation`        | 운영자가 셀프 위임해야 하는 최소 토큰 수량         |

트랜잭션이 확정된 후 밸리데이터를 확인하세요.

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## 풀 분류

QoreChain은 `x/qca`(Quantum Consensus Allocation) 모듈이 관리하는 **3단계 풀 분류 시스템**을 사용합니다. **1,000블록**마다 밸리데이터는 평판과 스테이크를 기준으로 세 가지 풀 중 하나로 재분류됩니다.

| 풀                                   | 기준                                               | 블록 할당      |
| ------------------------------------ | -------------------------------------------------- | --------------- |
| **RPoS** (Reputation Proof-of-Stake) | 평판 >= 70번째 백분위수 AND 스테이크 >= 중앙값     | 블록의 40%      |
| **DPoS** (Delegated Proof-of-Stake)  | 총 위임량 >= 10,000 QOR                            | 블록의 35%      |
| **PoS** (Proof-of-Stake)             | 나머지 모든 활성 밸리데이터                        | 블록의 25%      |

각 풀 내에서 블록 제안자는 유효 스테이크에 비례하는 **가중 무작위 선택**을 통해 선정됩니다. 이 분류 방식은 높은 평판을 가진 밸리데이터와 위임량이 많은 밸리데이터 모두 공정한 대표성을 확보하는 동시에, 소규모 밸리데이터도 참여할 수 있도록 보장합니다.

### 풀 분류 조회하기

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC를 통해서도 조회할 수 있습니다.

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

밸리데이터의 스테이킹 보상은 여러 요소를 반영하는 본딩 커브에 의해 결정됩니다.

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

* **충성도 지속 기간 보너스:** 연속으로 스테이킹하는 밸리데이터는 로그 형태의 충성도 항을 통해 점점 증가하는 보상을 받습니다. 이는 장기적인 참여를 장려합니다.
* **평판 품질 계수:** 0.75(낮은 평판)에서 1.25(우수한 평판) 사이의 범위를 가집니다. 평판은 가동률, 성공한 제안, 커뮤니티 참여, 트랜잭션 검증 품질로부터 계산됩니다.
* **프로토콜 단계 배수:** 네트워크가 여러 단계(초기 구축, 성장, 성숙)를 거치며 성숙해짐에 따라 조정됩니다.

---

## 점진적 슬래싱

QoreChain은 반복 위반자에 대한 처벌을 점진적으로 강화하면서도 시간이 지나면 밸리데이터가 회복할 수 있도록 하는 **점진적 슬래싱** 모델을 사용합니다.

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

3. **유효 카운트는 시간이 지나면 감쇠합니다.** 유효 카운트는 100,000블록(6초 블록 기준 약 7일)의 반감기로 감쇠하며, 이를 통해 밸리데이터는 일정 기간 정상적으로 운영하면 회복할 수 있습니다.

4. **단발성 이벤트와 반복 위반의 차이.** 우발적인 단발성 다운타임 이벤트는 경미한 처벌로 이어지지만, 반복되는 위반은 지수적으로 증가하는 결과를 초래합니다.

---

## PQC 키 등록 {#pqc-key-registration}

밸리데이터는 선택적으로 ML-DSA-87 알고리즘을 사용하는 **양자내성 암호화(PQC) 공개 키**를 등록할 수 있습니다. 이는 밸리데이터 아이덴티티에 양자내성 보안을 제공하며, 하이브리드 서명에도 사용할 수 있습니다.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| 매개변수       | 설명                                              |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 16진수로 인코딩된 2592바이트 ML-DSA-87 공개 키    |
| `hybrid`       | 등록 모드 (hybrid = 기존 방식 + PQC 모두 사용)    |

등록을 확인하세요.

```bash
qorechaind query pqc key <account-address>
```

:::tip
**권장 사항:** PQC 키 등록은 선택 사항이지만, 메인넷에서 운영하는 밸리데이터에게는 강력히 권장됩니다. 양자 컴퓨팅 위협에 대비한 선제적인 방어 수단을 제공합니다.
:::

---

## 모니터링

### Prometheus 메트릭

QoreChain은 **26660번 포트**에서 Prometheus 메트릭을 노출합니다.

```
http://localhost:26660/metrics
```

모니터링할 주요 메트릭:

| 메트릭                          | 설명                                             |
| -------------------------------- | ------------------------------------------------ |
| `qorechain_missed_blocks_total`  | 밸리데이터가 놓친 총 블록 수                     |
| `qorechain_validator_uptime`     | 최근 N개 블록 동안의 가동률                      |
| `qorechain_reputation_score`     | 현재 평판 점수                                   |
| `qorechain_pool_classification`  | 현재 풀 배정 (0=PoS, 1=DPoS, 2=RPoS)             |
| `qorechain_consecutive_signed`   | 연속으로 서명한 블록 수                          |
| `consensus_height`               | 현재 블록 높이                                   |
| `consensus_rounds`               | 현재 높이에 대한 합의 라운드 수                  |

### 평판 점수 조회하기

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

JSON-RPC를 통해서도 조회할 수 있습니다.

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
# 노드 상태
qorechaind status | jq '.sync_info'

# 밸리데이터 서명 정보 (가동률, 놓친 블록)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# 밸리데이터가 활성 세트에 포함되어 있는지 확인
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## 운영 모범 사례

1. **센트리 노드 아키텍처를 사용하세요.** 밸리데이터를 DDoS 공격으로부터 보호하기 위해 센트리 노드 뒤에서 운영하세요. 공용 네트워크에는 센트리 노드만 노출하세요.

2. **알림을 설정하세요.** 놓친 블록, 낮은 가동률, 예기치 않은 재시작에 대한 알림을 구성하세요. 소수의 블록을 놓치는 것은 정상이지만, 지속적으로 놓치면 슬래싱이 발생합니다.

3. **높은 가동률을 유지하세요.** 평판 시스템은 일관된 가동률에 보상을 줍니다. 장기간의 다운타임은 평판 품질 계수를 저하시켜 보상을 감소시킵니다.

4. **소프트웨어를 최신 상태로 유지하세요.** QoreChain 릴리스를 추적하고 업데이트를 신속하게 적용하세요. 체인 업그레이드에 대해서는 밸리데이터 커뮤니티와 조율하세요.

5. **키를 안전하게 보관하세요.** 밸리데이터 합의 키에는 하드웨어 보안 모듈(HSM)이나 원격 서명자를 사용하세요. 키를 노드와 동일한 머신에 저장하지 마세요.

6. **PQC 키를 등록하세요.** ML-DSA-87 키를 등록하여 양자 위협에 대비해 밸리데이터를 미래에도 안전하게 유지하세요.

7. **풀을 모니터링하세요.** 1,000블록마다 풀 분류를 추적하세요. 평판을 개선하면 PoS에서 RPoS로 이동할 수 있으며, 이는 블록 제안 기회를 크게 늘려줍니다.

---

## 밸리데이터 명령어 참고

```bash
# 밸리데이터 메타데이터 편집
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# 다운타임 슬래싱 이후 언제일(unjail)
qorechaind tx slashing unjail --from mykey -y

# 추가 스테이크 위임
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# 보상 출금
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## 연결된 네트워크 검증하기 {#connected-networks}

체인 버전 **v3.1.80**부터, QoreChain 밸리데이터는 [브릿지](/architecture/bridge-architecture)를 통해 연결된 네트워크의 검증도 지원할 수 있습니다. 이는 **라이선스 기반이며 선택적 참여**입니다.

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

* [소스에서 빌드하기](/developer-guide/building-from-source) — `qorechaind` 바이너리 빌드하기
* [EVM 개발](/developer-guide/evm-development) — QoreChain에 스마트 컨트랙트 배포하기
* [계정 추상화](/developer-guide/account-abstraction) — 밸리데이터 운영을 위한 프로그래머블 계정
