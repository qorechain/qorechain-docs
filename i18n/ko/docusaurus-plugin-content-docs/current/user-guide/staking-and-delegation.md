---
slug: /user-guide/staking-and-delegation
title: 스테이킹 및 위임
sidebar_label: 스테이킹 및 위임
sidebar_position: 2
---

# 스테이킹 및 위임

이 가이드에서는 QOR 토큰을 검증인에게 위임하는 방법, 검증인 간 재위임, 언본딩(위임 해제), 보상 청구, 그리고 QoreChain의 트리플 풀(Triple-Pool) 스테이킹 아키텍처에 대해 설명합니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 기준으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 체인 버전 **v3.1.92**로 운영 중이며, 메인넷에서 스테이킹할 때는 **메인넷 연결** 페이지에 있는 메인넷 체인 ID와 엔드포인트로 대체해서 사용하세요.
:::

---

## 토큰 위임

QOR을 검증인에게 위임하면 스테이킹 보상을 받고 네트워크 보안에 참여할 수 있습니다.

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** 검증인에게 QOR 100개를 위임합니다.

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 재위임

언본딩 기간을 기다리지 않고 위임을 한 검증인에서 다른 검증인으로 옮길 수 있습니다.

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
이미 재위임 이동(transit) 중인 토큰은 다시 재위임할 수 없습니다. 다른 재위임을 시작하기 전에 진행 중인 재위임이 완료될 때까지 기다리세요.
:::

---

## 언본딩

검증인에게 위임한 토큰을 회수합니다. 언본딩에는 **21일**이 소요되며, 이 기간 동안 토큰은 보상을 받지 못하고 전송할 수도 없습니다.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

21일간의 언본딩 기간이 끝나면 토큰은 자동으로 계정에 반환됩니다.

---

## 보상 청구

위임한 모든 검증인으로부터 누적된 스테이킹 보상을 전부 인출합니다.

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

특정 검증인의 보상만 인출하려면 다음을 사용하세요.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

스테이킹 보상은 토크노믹스 v2.1 스케줄에 따라 프로토콜의 5억 9천만 QOR 스테이킹 풀에서 지급되며, 여기에 모든 거래 수수료의 스테이커 몫(10%)이 더해집니다.

---

## 트리플 풀 분류

QoreChain은 검증인을 평판 점수와 위임 수준에 따라 세 개의 풀로 분류하는 **트리플 풀(Triple-Pool)** 스테이킹 모델을 사용합니다. 각 풀은 블록 보상의 가중치가 적용된 몫을 받습니다.

| 풀                                 | 진입 기준                                              | 보상 가중치 |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (평판 지분증명, Reputation Proof of Stake) | 평판 점수 상위 30%(70번째 백분위수 이상) **AND** 스테이크가 중앙값 이상 | 40%           |
| **DPoS** (위임 지분증명, Delegated Proof of Stake)  | 총 위임량 10,000 QOR 이상                              | 35%           |
| **PoS** (지분증명, Proof of Stake)             | 나머지 모든 검증인                                    | 25%           |

검증인은 매 에포크 경계마다 재분류됩니다. 탄탄한 평판을 쌓고 충분한 스테이크를 축적한 검증인은 RPoS 풀로 승격되어 가장 높은 보상 몫을 받게 됩니다.

---

## 본딩 커브 보상

개별 스테이킹 보상은 QoreChain의 본딩 커브(bonding curve) 공식으로 계산됩니다.

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 변수 | 설명                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | 해당 기간의 보상 금액                                         |
| `beta`   | 기본 보상률(프로토콜 매개변수)                                |
| `S`      | 스테이킹된 금액                                                  |
| `alpha`  | 충성도 계수(프로토콜 매개변수)                             |
| `L`      | 락(잠금) 기간(에포크 단위)                                              |
| `Q(r)`   | 검증인의 평판 점수 `r`에서 도출된 품질 승수 |
| `P(t)`   | 시점 `t`의 풀 승수(풀에 따라 40%, 35%, 또는 25%)     |

락 기간이 길고 평판 점수가 높을수록 보상이 비례해서 더 커지며, 이는 장기적인 참여와 검증인의 올바른 행동을 유도하기 위한 것입니다.

---

## 검증인 정보 조회

임의의 검증인에 대한 상세 정보를 조회합니다.

```bash
qorechaind query staking validator <validator_operator_address>
```

**예시:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

활성 상태인 모든 검증인을 나열합니다.

```bash
qorechaind query staking validators --status bonded
```

현재 내 위임 현황을 조회합니다.

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* **RPoS 풀**에 위임하면 40%의 풀 가중치 덕분에 가장 높은 보상을 받을 수 있습니다.
* 검증인의 평판을 쌓는 데는 시간이 걸립니다. 위임하기 전에 검증인의 이력을 확인하세요.
* 재위임은 즉시 처리되지만 쿨다운 제한이 있습니다. 이동 계획을 신중하게 세우세요.
* 21일간의 언본딩 기간은 보안을 위한 조치입니다. 이 기간 동안에도 슬래싱(slashing) 이벤트가 토큰에 영향을 줄 수 있습니다.

:::
