---
slug: /user-guide/xqore-staking
title: xQORE 스테이킹
sidebar_label: xQORE 스테이킹
sidebar_position: 4
---

# xQORE 스테이킹

이 가이드는 xQORE 거버넌스 스테이킹 메커니즘을 다룹니다. QOR 보유자는 토큰을 잠가 거버넌스 파워를 강화할 수 있으며, 장기 참여자에게 보상을 주는 PvP 리베이스 모델이 적용됩니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 기준으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 가동 중이며 체인 버전 **v3.1.92**를 실행하고 있습니다. 메인넷에서 스테이킹할 때는 **메인넷 연결하기** 페이지에 안내된 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

---

## 개요

xQORE는 QoreChain의 거버넌스 스테이킹 토큰입니다. QOR을 잠그면 **1:1 비율**로 xQORE를 받습니다. xQORE를 보유하면 거버넌스에서 상당한 이점이 있습니다. xQORE 토큰은 QDRW 투표력 공식에서 **두 배 가중치**로 계산됩니다 (자세한 내용은 [거버넌스](/user-guide/governance) 참고).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

즉, QOR을 xQORE로 잠그면 일반 스테이킹만 할 때보다 거버넌스 영향력이 사실상 두 배가 됩니다.

---

## QOR을 잠그고 xQORE 받기

QOR 토큰을 잠그면 1:1 비율로 xQORE가 발행됩니다.

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** QOR 1,000개 잠그기

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

이 트랜잭션 이후 계정에는 1,000,000,000 uxqore(xQORE 1,000개)가 보유됩니다.

---

## xQORE 잠금 해제

xQORE를 소각하여 QOR을 돌려받습니다. 토큰을 잠근 기간에 따라 **출금 페널티**가 적용될 수 있습니다.

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** xQORE 500개 잠금 해제

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 출금 페널티 스케줄

xQORE를 조기에 인출하면 페널티가 부과됩니다. 보유 기간이 길수록 페널티는 낮아집니다.

| 잠금 기간           | 출금 페널티 |
| ------------------- | ----------- |
| 30일 미만           | **50%**     |
| 30일 ~ 90일         | **35%**     |
| 90일 ~ 180일        | **15%**     |
| 180일 초과          | **0%**      |

**예시:** QOR 1,000개를 잠그고 45일 후 잠금을 해제하면 (35% 페널티 적용) 650 QOR을 받습니다. 나머지 350 QOR은 PvP 리베이스 메커니즘을 통해 다른 xQORE 보유자들에게 재분배됩니다.

---

## PvP 리베이스 메커니즘

조기 인출로 발생한 페널티는 **소각되지 않습니다**. 대신 남아있는 모든 xQORE 보유자에게 비례적으로 재분배됩니다. 이는 조급한 이들의 손실이 인내심 있는 보유자에게 이익이 되는 "Player vs Player" 방식을 만들어냅니다.

작동 방식:

1. 사용자가 180일 무페널티 기준 이전에 xQORE 잠금을 해제합니다.
2. 반환되는 QOR에서 출금 페널티가 차감됩니다.
3. 페널티 금액은 남아있는 모든 xQORE 포지션에 비례하여 분배됩니다.
4. 남아있는 각 보유자의 xQORE당 청구 가능 QOR이 증가합니다.

이 메커니즘은 장기적인 거버넌스 참여를 장려하고, 포지션을 유지하는 보유자에게 보상을 제공합니다.

---

## 내 포지션 조회

현재 xQORE 포지션, 잠금 기간, 적용되는 출금 페널티를 확인합니다.

```bash
qorechaind query xqore position <address>
```

**예시:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**출력 예시:**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## JSON-RPC 액세스

JSON-RPC를 통해 QoreChain과 연동하는 애플리케이션은 다음을 사용하여 xQORE 포지션을 조회할 수 있습니다.

```
qor_getXQOREPosition
```

**요청:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## 팁

* 투표력을 극대화하려면 중요한 거버넌스 투표 전에 미리 QOR을 xQORE로 잠그세요.
* 180일 기준을 채우면 페널티 없이 인출할 수 있어 인내심 있는 거버넌스 참여자에게 유리합니다.
* PvP 리베이스 적립 현황을 지켜보세요. 다른 사람이 조기에 인출할수록 내 포지션의 가치는 커집니다.
* xQORE는 양도가 불가능합니다. QOR을 잠글 때만 발행되고, 잠금을 해제할 때만 소각됩니다.
* 잠그기 전에 출금 페널티를 신중히 고려하세요. 단기 잠금은 상당한 페널티를 수반합니다.
