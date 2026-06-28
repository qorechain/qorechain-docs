---
slug: /user-guide/governance
title: 거버넌스
sidebar_label: 거버넌스
sidebar_position: 3
---

# 거버넌스

이 가이드는 QoreChain에서 온체인 거버넌스가 작동하는 방식을 다루며, 여기에는 QDRW(Quadratic Delegation-Reputation Weighted) 투표 시스템, 제안 제출 방법, 그리고 투표 방법이 포함됩니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.1.80**을 실행하며 2026년 6월 7일부터 가동 중입니다 — 메인넷에서 거버넌스에 참여할 때는 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

---

## 투표권: QDRW 공식

QoreChain은 투표권을 계산하기 위해 **QDRW(Quadratic Delegation-Reputation Weighted)** 공식을 사용합니다. 이 시스템은 고래의 지배를 방지하는 동시에 높은 평판 점수를 획득하고 xQORE 스테이킹을 통해 거버넌스에 헌신한 참여자에게 보상을 제공합니다.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| 변수                       | 설명                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | 유효 투표권                                                                                                                       |
| `staked`                  | 투표자가 스테이크한 총 QOR 토큰                                                                                                   |
| `xQORE`                   | 보유한 xQORE 거버넌스 토큰의 양([xQORE 스테이킹](/user-guide/xqore-staking) 참조)                                                 |
| `r`                       | \[0, 1]로 정규화된 투표자의 평판 점수                                                                                             |
| `ReputationMultiplier(r)` | 평판을 \[0.5, 2.0] 범위의 승수로 매핑하는 시그모이드 함수                                                                         |

### 주요 속성

* **이차 감쇠:** 다른 투표자보다 100배의 스테이크를 가진 보유자는 100배가 아니라 약 10배의 투표권만 얻습니다. 이는 거버넌스 영향력이 부에 따라 선형 미만으로 확장되도록 보장합니다.
* **xQORE 보너스:** xQORE 토큰은 제곱근 내부에서 **2배 가중치**로 계산되어, 거버넌스에 헌신한 참여자에게 의미 있는 이점을 제공합니다.
* **평판 승수:** 시그모이드 곡선을 사용하여 투표자의 평판 점수를 \[0, 1]에서 \[0.5, 2.0]의 승수로 매핑합니다. 높은 평판의 참여자는 유효 투표권을 두 배로 늘릴 수 있는 반면, 낮은 평판의 참여자는 영향력이 절반으로 줄어듭니다.

---

## 제안 제출

모든 QOR 보유자는 거버넌스 제안을 제출할 수 있습니다. 제안이 투표 기간에 진입하려면 최소 예치금이 필요합니다.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시 제안 파일** (`proposal.json`):

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## 제안 투표

제안이 투표 기간에 진입하면 모든 스테이커가 투표할 수 있습니다:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**투표 옵션:**

| 옵션           | 설명                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | 제안 지지                                                                                                 |
| `no`           | 제안 반대                                                                                                 |
| `abstain`      | 입장을 취하지 않고 제안을 인정                                                                            |
| `no_with_veto` | 제안에 반대하고 제출되지 말았어야 함을 표시(임계값 충족 시 예치금 소각)                                    |

**예시:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 제안 유형

QoreChain은 다음 거버넌스 제안 유형을 지원합니다:

| 유형                  | 설명                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **텍스트**            | 자동 온체인 실행이 없는 신호용 제안. 커뮤니티 정서 확인에 사용됩니다.                              |
| **매개변수 변경**     | 하나 이상의 온체인 프로토콜 매개변수를 수정합니다(예: 최대 검증자 수, 발행율).                     |
| **소프트웨어 업그레이드** | 지정된 블록 높이에서 조정된 체인 업그레이드를 예약합니다.                                       |
| **커뮤니티 지출**     | 지정된 수신자 주소를 위해 커뮤니티 트레저리에서 자금을 요청합니다.                                 |

---

## 제안 조회

모든 제안을 나열합니다:

```bash
qorechaind query gov proposals
```

ID로 특정 제안을 조회합니다:

```bash
qorechaind query gov proposal <proposal_id>
```

제안에 대한 현재 투표 집계를 확인합니다:

```bash
qorechaind query gov tally <proposal_id>
```

제안에 대한 자신의 투표를 봅니다:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## 거버넌스 매개변수

현재 거버넌스 매개변수를 조회합니다:

```bash
qorechaind query gov params
```

주요 매개변수는 다음과 같습니다:

| 매개변수             | 설명                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | 제안이 투표에 진입하기 위해 필요한 최소 예치금                     |
| `max_deposit_period` | 최소 예치금에 도달하기 위한 시간 창                              |
| `voting_period`      | 제안이 활성화된 후 투표 기간의 지속 시간                          |
| `quorum`             | 유효한 투표에 필요한 최소 참여율                                 |
| `threshold`          | 통과에 필요한 최소 "yes" 비율(기권 제외)                          |
| `veto_threshold`     | 거부하고 예치금을 소각하기 위한 최소 "no with veto" 비율          |

---

:::tip

* 투표권 승수를 극대화하려면 주요 거버넌스 투표 전에 평판을 쌓으세요.
* QDRW 공식 내에서 2배 거버넌스 가중치 보너스를 받으려면 QOR를 xQORE로 잠그세요.
* `no_with_veto`를 신중하게 사용하세요. 거부 임계값에 도달하면 제안 예치금이 소각됩니다.
* 예치 기간 내에 최소 예치금에 도달하지 못한 제안은 자동으로 제거됩니다.

:::
