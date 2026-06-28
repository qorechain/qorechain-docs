---
slug: /user-guide/xqore-staking
title: xQORE 스테이킹
sidebar_label: xQORE 스테이킹
sidebar_position: 4
---

# xQORE 스테이킹

이 가이드에서는 QOR 보유자가 토큰을 잠가 강화된 거버넌스 권한을 얻을 수 있게 하는 xQORE 거버넌스 스테이킹 메커니즘을 다룹니다. 이 메커니즘은 장기 참여자에게 보상하는 PvP 리베이스 모델을 사용합니다.

:::note
아래 명령은 **`qorechain-diana`** 테스트넷(EVM chain ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM chain ID **9801**)은 체인 버전 **v3.1.80**로 2026년 6월 7일부터 가동 중입니다. 메인넷에서 스테이킹할 때는 **메인넷 연결** 페이지의 메인넷 chain ID 및 엔드포인트로 대체하세요.
:::

---

## 개요

xQORE는 QoreChain의 거버넌스 스테이킹 토큰입니다. QOR를 잠그면 **1:1 비율**로 xQORE를 받습니다. xQORE를 보유하면 거버넌스에서 큰 이점을 얻습니다: xQORE 토큰은 QDRW 투표 권한 공식에서 **두 배의 가중치**로 계산됩니다([거버넌스](/user-guide/governance) 참조).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

즉, QOR를 xQORE로 잠그면 일반 스테이킹만 하는 경우에 비해 거버넌스 영향력이 사실상 두 배가 됩니다.

---

## xQORE를 위한 QOR 잠금

QOR 토큰을 잠가 xQORE를 1:1 비율로 발행합니다:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** 1,000 QOR 잠금:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

이 거래 후에는 계정이 1,000,000,000 uxqore (1,000 xQORE)를 보유하게 됩니다.

---

## xQORE 잠금 해제

xQORE를 소각하여 QOR를 돌려받습니다. 토큰이 잠겨 있던 기간에 따라 **출금 페널티**가 적용될 수 있습니다:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** 500 xQORE 잠금 해제:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 출금 페널티 일정

xQORE에서의 조기 인출은 페널티가 부과됩니다. 오래 보유할수록 페널티가 낮아집니다:

| 잠금 기간          | 출금 페널티   |
| ------------------ | ------------ |
| 30일 미만           | **50%**      |
| 30일에서 90일       | **35%**      |
| 90일에서 180일      | **15%**      |
| 180일 초과          | **0%**       |

**예시:** 1,000 QOR를 잠그고 45일 후에 잠금을 해제하면 650 QOR를 받습니다(35% 페널티 적용). 나머지 350 QOR는 PvP 리베이스 메커니즘을 통해 다른 xQORE 보유자에게 재분배됩니다.

---

## PvP 리베이스 메커니즘

조기 출금에서 징수된 페널티는 **소각되지 않습니다**. 대신, 남아 있는 모든 xQORE 보유자에게 비례하여 재분배됩니다. 이는 인내심 있는 보유자가 다른 사람들의 조급함으로부터 이익을 얻는 "Player vs Player" 역학을 만듭니다.

작동 방식:

1. 사용자가 180일 무페널티 기준점 이전에 xQORE 잠금을 해제합니다.
2. 출금 페널티가 반환되는 QOR에서 차감됩니다.
3. 페널티 금액이 남아 있는 모든 xQORE 포지션에 비례하여 분배됩니다.
4. 남아 있는 각 보유자의 xQORE당 청구 가능한 QOR가 증가합니다.

이 메커니즘은 장기 거버넌스 헌신을 장려하고 포지션을 유지하는 보유자에게 보상합니다.

---

## 포지션 조회

현재 xQORE 포지션, 잠금 기간, 적용 가능한 출금 페널티를 확인합니다:

```bash
qorechaind query xqore position <address>
```

**예시:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**샘플 출력:**

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

## JSON-RPC 접근

JSON-RPC를 통해 QoreChain과 통합하는 애플리케이션의 경우, xQORE 포지션은 다음을 사용하여 조회할 수 있습니다:

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

* 중요한 거버넌스 투표 전에 미리 QOR를 xQORE로 잠가 투표 권한을 극대화하세요.
* 무페널티 출금을 위한 180일 기준점은 인내심 있는 거버넌스 참여자에게 보상합니다.
* PvP 리베이스 누적을 모니터링하세요. 다른 사람들이 조기에 출금할수록 당신의 포지션 가치가 커집니다.
* xQORE는 전송할 수 없습니다. QOR를 잠가서만 발행할 수 있고 잠금을 해제해서만 소각할 수 있습니다.
* 잠그기 전에 출금 페널티를 신중하게 고려하세요. 단기 잠금은 상당한 페널티를 수반합니다.
