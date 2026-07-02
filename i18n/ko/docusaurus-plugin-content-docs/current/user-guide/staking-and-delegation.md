---
slug: /user-guide/staking-and-delegation
title: 스테이킹 및 위임
sidebar_label: 스테이킹 및 위임
sidebar_position: 2
---

# 스테이킹 및 위임

이 가이드에서는 QOR 토큰을 검증인에게 위임하는 방법, 검증인 간 재위임, 스테이크 언본딩, 보상 청구, 그리고 QoreChain의 Triple-Pool 스테이킹 아키텍처에 대해 다룹니다.

:::note
아래 명령은 **`qorechain-diana`** 테스트넷(EVM chain ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM chain ID **9801**)은 체인 버전 **v3.1.82**로 2026년 6월 7일부터 가동 중입니다. 메인넷에서 스테이킹할 때는 **메인넷 연결** 페이지의 메인넷 chain ID 및 엔드포인트로 대체하세요.
:::

---

## 토큰 위임

QOR를 검증인에게 위임하여 스테이킹 보상을 얻고 네트워크 보안에 참여하세요:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** 검증인에게 100 QOR 위임:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 재위임

언본딩 기간을 기다리지 않고 한 검증인에서 다른 검증인으로 위임을 이동합니다:

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
이미 재위임 전송 중인 토큰은 재위임할 수 없습니다. 다른 재위임을 시작하기 전에 현재 재위임이 완료될 때까지 기다리세요.
:::

---

## 언본딩

위임한 토큰을 검증인으로부터 인출합니다. 언본딩이 완료되기까지 **21일**이 소요되며, 이 기간 동안 토큰은 보상을 얻지 못하고 전송할 수 없습니다.

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

21일 언본딩 기간이 지나면 토큰이 자동으로 계정에 반환됩니다.

---

## 보상 청구

위임한 모든 검증인으로부터 누적된 스테이킹 보상을 전부 인출합니다:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

특정 검증인으로부터만 보상을 인출하려면:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

스테이킹 보상은 Tokenomics v2.1 스케줄에 따라 프로토콜의 590M QOR 스테이킹 풀에서 자금이 조달되며, 모든 거래 수수료의 스테이커 몫(10%)도 함께 사용됩니다.

---

## Triple-Pool 분류

QoreChain은 검증인을 평판과 위임 수준에 따라 세 개의 풀로 분류하는 **Triple-Pool** 스테이킹 모델을 사용합니다. 각 풀은 블록 보상의 가중치 몫을 받습니다.

| 풀                                    | 진입 기준                                                    | 보상 가중치   |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | 평판 점수 >= 70번째 백분위수 **AND** 스테이크 >= 중앙값       | 40%           |
| **DPoS** (Delegated Proof of Stake)  | 총 위임 >= 10,000 QOR                                        | 35%           |
| **PoS** (Proof of Stake)             | 나머지 모든 검증인                                            | 25%           |

검증인은 매 에포크 경계마다 재분류됩니다. 강력한 평판을 쌓고 충분한 스테이크를 축적한 검증인은 RPoS 풀로 승격되어 가장 높은 보상 몫을 받습니다.

---

## 본딩 커브 보상

개별 스테이킹 보상은 QoreChain의 본딩 커브 공식을 사용하여 계산됩니다:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 변수      | 설명                                                                 |
| -------- | -------------------------------------------------------------------- |
| `R`      | 해당 기간의 보상 금액                                                  |
| `beta`   | 기본 보상률 (프로토콜 파라미터)                                        |
| `S`      | 스테이킹된 금액                                                        |
| `alpha`  | 충성도 계수 (프로토콜 파라미터)                                        |
| `L`      | 에포크 단위 잠금 기간                                                  |
| `Q(r)`   | 검증인의 평판 점수 `r`에서 도출된 품질 승수                            |
| `P(t)`   | 시점 `t`의 풀 승수 (풀에 따라 40%, 35% 또는 25%)                       |

잠금 기간이 길수록, 평판 점수가 높을수록 비례하여 더 큰 보상을 받으며, 이는 장기적 헌신과 우수한 검증인 행동을 장려합니다.

---

## 검증인 정보 조회

모든 검증인에 대한 세부 정보를 조회합니다:

```bash
qorechaind query staking validator <validator_operator_address>
```

**예시:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

활성 검증인 전체 목록 조회:

```bash
qorechaind query staking validators --status bonded
```

현재 위임 내역 조회:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* **RPoS 풀**의 검증인에게 위임하면 40% 풀 가중치 덕분에 가장 높은 보상을 얻을 수 있습니다.
* 검증인 평판을 쌓는 데는 시간이 걸립니다. 위임하기 전에 검증인의 이력을 고려하세요.
* 재위임은 즉시 이루어지지만 쿨다운 제한이 있습니다. 이동을 신중하게 계획하세요.
* 21일 언본딩 기간은 보안 조치입니다. 이 기간 동안에도 슬래싱 이벤트가 토큰에 영향을 줄 수 있습니다.

:::
