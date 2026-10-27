---
slug: /user-guide/staking-and-delegation
title: 스테이킹 및 위임
sidebar_label: 스테이킹 및 위임
sidebar_position: 2
---

# 스테이킹 및 위임

이 가이드에서는 QOR 토큰을 검증인에게 위임하는 방법, 검증인 간 재위임, 언본딩(위임 해제), 보상 청구, 그리고 QoreChain의 스테이킹 설계 중 현재 라이브로 적용되는 부분에 대해 설명합니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 기준으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 라이브 상태이며 릴리스 **v3.2.4**(2026년 10월 23일 적용)를 실행합니다. 테스트넷은 v3.2.6을 실행합니다(2026년 10월 27일부터). 메인넷에서 스테이킹할 때는 **메인넷 연결하기** 페이지에 있는 메인넷 체인 ID와 엔드포인트로 대체해서 사용하세요.
:::

:::caution `tx pqc cosign`으로 서명하세요
메인넷과 테스트넷은 모든 Cosmos 레인 트랜잭션에 하이브리드 포스트 양자 서명을 요구하므로, 이 페이지의 명령어는 그대로는 브로드캐스트되지 않습니다. 명령어에 `--generate-only > tx.json`을 추가한 다음 `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`를 실행하세요. [하이브리드 서명](/cli-reference/transaction-commands#hybrid-signing)을 참조하세요. [QoreX](/qorex/portfolio-and-staking)와 [대시보드](/dashboard/staking-and-validators)는 이 서명을 대신 처리해 줍니다.
:::

## 락인(lock-in) 기간이 있나요? {#lock-in-period}

**일반 위임의 경우** 없습니다 — 거래소에서 흔히 볼 수 있는 것처럼 스테이킹이 고정된 기간 단위로 판매되지 않기 때문에, 선택할 약정 기간 자체가 없습니다. 위임은 다음 블록부터 보상이 발생하며 원하는 만큼 계속 유지되고, 만료되거나 갱신해야 할 것도 없이 스스로 언본딩을 신청하기 전까지는 계속 활성 상태로 유지됩니다. 이 가이드 전반에서 언급되는 **21일 언본딩 기간**은 미리 동의하는 락인이 아니라, 여러분이 *언본딩을 요청한 시점*부터만 시작되며, 회수하려는 QOR에만 적용됩니다. 위임을 검증인 간에 옮기는 것(재위임)은 스테이크가 본딩 풀을 벗어나지 않으므로 이 대기 시간을 완전히 건너뜁니다. 아래 [본딩 커브](#bonding-curve)에서 언급하는 "충성도" 항목은 QoreChain 설계의 일부이지만 **현재 라이브 체인에는 적용되지 않으므로**, 위임을 얼마나 오래 유지했는지는 보상률을 바꾸지 않습니다. 선택적인 기간 잠금 방식의 스테이킹은 v3.2.4부터(2026년 10월 23일) 메인넷에서, 2026년 10월 19일부터 테스트넷에서 이용할 수 있으며, 잠금은 직접 만들어야만 적용됩니다. [기간 잠금 스테이킹(v3.2.4)](#time-locked-staking)을 참조하세요.

이는 현재 메인넷의 동작을 설명하는 것이며 영구적인 보장은 아닙니다 — 이 페이지에 있는 다른 스테이킹 매개변수와 마찬가지로, 최소 스테이킹 기간도 향후 거버넌스 투표를 통해 도입될 수 있는 매개변수입니다. 만약 그런 일이 발생하면, 지갑은 위임을 확정하기 전에 결과적으로 발생하는 대기 시간(최소 기간에 21일 언본딩을 더한 값)을 보여줄 것이며, 이 페이지도 그에 맞춰 업데이트됩니다.

---

## 토큰 위임

QOR을 검증인에게 위임하여 네트워크 보안에 참여하세요. 위임자는 검증인이 얻은 보상에서 검증인의 수수료(커미션)를 제외한 몫을 받습니다:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**예시:** 검증인에게 QOR 100개를 위임합니다:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## 재위임

언본딩 기간을 기다리지 않고 위임을 한 검증인에서 다른 검증인으로 옮길 수 있습니다:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**예시:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

재위임에는 **패널티도, 그 자체의 락도 없습니다** — 스테이크가 본딩 풀을 벗어나지 않으므로 보상이 끊기지 않으며, 즉시 적용됩니다. 21일 언본딩 기간의 적용 대상이 전혀 아니며, 그 기간은 `unbond`에만 적용됩니다. 표준 스테이킹 규칙 하나가 적용됩니다. 방금 검증인 **쪽으로** 옮긴 스테이크는 첫 번째 이동이 만료(21일)될 때까지 그 검증인 **에서** 다시 재위임할 수 없습니다. 그동안에도 해당 스테이크를 `unbond`하거나 나머지 스테이크를 재위임하는 것은 가능합니다.

:::caution 진짜 제한은 쿨다운이 아니라 건수입니다
위임자는 정확히 동일한 (위임자, 원본 검증인, 대상 검증인) 경로에 대해 최대 **7건의 재위임 진행 항목**을 동시에 가질 수 있습니다 — 각 항목은 만료되면 개별적으로 정리되어 슬롯이 다시 확보됩니다. 이는 일반적인 사용에서는 사실상 도달하지 않는 상한선일 뿐, "다시 재위임하려면 대기해야 한다"는 일반 규칙이 아닙니다.
:::

---

## 언본딩

검증인에게 위임한 토큰을 회수합니다. 언본딩에는 **21일**이 소요되며, 이 기간 동안 토큰은 보상을 받지 못하고 전송할 수도 없습니다.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**예시:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

21일간의 언본딩 기간(1,814,400초)이 끝나면 토큰은 자동으로 계정에 반환됩니다. 위임자는 검증인당 최대 7건의 언본딩 항목을 동시에 가질 수 있습니다.

---

## 보상 청구

위임한 모든 검증인으로부터 누적된 스테이킹 보상을 전부 인출합니다:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

특정 검증인의 보상만 인출하려면 다음을 사용하세요:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

스테이킹 보상은 두 가지 원천에서 지급됩니다. 프로토콜의 상한이 설정된 발행(emission) 예산(에포크당 현재 금액과 상한은 모두 거버넌스가 정하며, 가장 최근에는 2026년 10월 19일의 제안 10이며, [토크노믹스](/architecture/tokenomics#staking-reward-schedule) 참고)과, 모든 거래 수수료 중 스테이커 몫(v3.2.0 업그레이드 이후 일반 스테이킹 보상으로 지급되며, [묶여 있던 스테이커 몫](/architecture/tokenomics#stranded-and-reserve) 참고)입니다. 보상은 검증인의 수수료(커미션)와 네트워크 활동에 따라 달라지며 보장되지 않습니다.

---

## 기간 잠금 스테이킹 (v3.2.4) {#time-locked-staking}

:::note 적용 시점
릴리스 v3.2.4는 선택적인 기간 잠금 스테이킹 모듈 `x/stakingtier`를 추가합니다. 이 모듈은 2026년 10월 19일부터 **`qorechain-diana` 테스트넷**에서, 2026년 10월 23일부터 **메인넷**에서 라이브입니다(거버넌스 제안 13이 높이 3,742,566에서 적용). 잠금은 선택 사항으로 사용할 수 있고 일반 위임은 계속 잠금 없이 유지됩니다([위](#lock-in-period) 참조). 아래 메커니즘은 2026년 10월 23일 라이브 메인넷과 테스트넷 매개변수를 기준으로 확인되었습니다.
:::

위임자는 기존 위임의 일부를 3개월, 6개월 또는 12개월의 고정 기간 동안 검증인에게 묶어 둘 수 있습니다. 기간과 금액은 체인 매개변수이므로, 현재 값은 이 페이지가 아니라 `GET /qorechain/stakingtier/v1/params`에서 읽으세요.

* **잠금은 선택 사항입니다.** 일반 위임, 재위임, 언본딩은 이 페이지에 설명된 대로 정확히 동작합니다. 잠긴 금액만 제한됩니다. 잠금이 열려 있는 동안에는 언본딩하거나 재위임할 수 없으며, 이는 모든 경로(트랜잭션, authz, group, 컨트랙트, 거버넌스)에 적용됩니다.
* **최소 잠금**은 10 QOR이며, 위임자당 최대 16개의 열린 잠금을 가질 수 있습니다.
* **조기 잠금 해제**가 허용됩니다. 잠금이 종료되고, 아직 지급되지 않은 잠금 보상은 모두 몰수되며, 잠긴 금액에서 페널티가 차감되어 소각됩니다(현재 매개변수에서는 5%이며, `staking_tier_penalty` 소각 소스로 기록됨). 나머지는 위임된 상태로 잠금 해제되어 유지됩니다.
* **슬래싱**은 잠긴 위임에도 다른 위임과 똑같이 적용되며, 잠금은 위임과 함께 줄어듭니다.
* **청구.** 잠금은 모듈 매개변수로 정해지는 에포크별 추가 보상 구성 요소를 받으며, 이는 자동으로 지급되지 않고 청구할 때 지급됩니다. 이 페이지는 요율을 제시하지 않습니다. 실시간 설정은 `params`에서 읽으세요.
* **만료 시** 잠금이 해제되고 위임은 일반 위임으로 계속됩니다.

명령은 커맨드 라인과 REST 경로 `GET /qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`을 통해 사용할 수 있으며, 금액은 `uqor`의 정수입니다(1 QOR = 1,000,000 uqor).

```bash
qorechaind tx stakingtier lock <validator_address> <amount_in_uqor> <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

위의 체인 ID는 테스트넷의 것입니다. 메인넷에서는 `qorechain-vladi`를 사용하세요. 이 페이지의 다른 부분과 마찬가지로, 생성된 각 트랜잭션은 `tx pqc cosign`으로 서명하세요.

---

## 트리플 풀 분류 (설계 상태)

QoreChain의 설계에는 검증인을 평판 및 위임 수준에 따라 세 개의 풀로 분류하고, 풀마다 블록 보상의 가중치가 적용된 몫을 부여하는 **트리플 풀(Triple-Pool)** 모델이 포함되어 있습니다:

| 풀                                 | 진입 기준                                              | 설계상 보상 가중치 |
| ------------------------------------ | ----------------------------------------------------------- | -------------------- |
| **RPoS** (평판 지분증명, Reputation Proof of Stake) | 평판 점수 70번째 백분위수 이상 **AND** 스테이크가 중앙값 이상 | 40%                  |
| **DPoS** (위임 지분증명, Delegated Proof of Stake)  | 총 위임량 10,000 QOR 이상                              | 35%                  |
| **PoS** (지분증명, Proof of Stake)             | 나머지 모든 검증인                                    | 25%                  |

:::note 라이브 네트워크에서는 활성화되어 있지 않습니다
풀 분류, 풀 가중치 기반 제안자 선택, 풀 보상 가중치는 `x/qca` 모듈에 구현되어 있고 그 매개변수도 온체인에 있지만(`qorechaind query qca config`), 아직 **블록 생성이나 보상 분배에 연결되어 있지 않습니다**. 현재 블록 제안은 표준 방식으로 스테이크에 따라 순환하며, 보상은 본딩된 스테이크에 비례하여 각 검증인의 수수료(커미션)를 제외하고 분배됩니다. 검증인이 어느 풀에 "속하는지"는 여러분이 받는 보상을 바꾸지 않습니다.
:::

---

## 본딩 커브 보상 {#bonding-curve}

QoreChain의 설계에는 본딩 커브(bonding curve) 보상 공식도 정의되어 있습니다:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 변수 | 설명                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | 해당 기간의 보상 금액                                         |
| `beta`   | 기본 보상률(프로토콜 매개변수)                                |
| `S`      | 스테이킹된 금액                                                  |
| `alpha`  | 충성도 계수(프로토콜 매개변수)                             |
| `L`      | 스테이킹 기간(에포크 단위)                                              |
| `Q(r)`   | 검증인의 평판 점수 `r`에서 도출된 품질 승수 |
| `P(t)`   | 시점 `t`의 풀 승수(풀에 따라 40%, 35%, 또는 25%)     |

:::note 라이브 네트워크에서는 활성화되어 있지 않습니다
위의 풀 분류와 마찬가지로 본딩 커브 계산도 **라이브 체인에서 호출되지 않습니다**. 보상은 이 공식으로 계산되지 않으며, 스테이킹 기간이나 검증인 평판은 현재 보상을 바꾸지 않습니다. 매개변수(`bonding_alpha`, `bonding_beta`)는 온체인에 존재하지만 아무런 효과가 없습니다.
:::

---

## 슬래싱 및 제일링

QoreChain의 슬래싱은 다음의 라이브 매개변수(`qorechaind query slashing params`)를 사용하는 표준 Cosmos SDK 슬래싱 모듈을 따릅니다:

| 이벤트                | 규칙                                                                 | 결과                                  |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| 다운타임             | 최근 10,000개 블록 중 5% 미만에 서명(메인넷의 약 3.2초 블록 기준 약 8.9시간) | 600초 동안 제일(jail), 스테이크의 1% 슬래싱 |
| 이중 서명       | 같은 높이에서 서로 다른 두 블록에 서명                      | 스테이크의 5% 슬래싱                          |

슬래싱은 검증인의 전체 본딩된 스테이크에 적용되므로 위임자도 자신의 비율만큼 부담합니다. 또한 슬래싱된 검증인으로부터 이미 언본딩 중인 스테이크에도 영향을 줄 수 있으며, 그래서 언본딩 기간은 단순한 대기 시간이 아니라 보안 조치입니다.

---

## 검증인 정보 조회

임의의 검증인에 대한 상세 정보를 조회합니다:

```bash
qorechaind query staking validator <validator_operator_address>
```

**예시:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

활성 상태인 모든 검증인을 나열합니다:

```bash
qorechaind query staking validators --status BOND_STATUS_BONDED
```

현재 내 위임 현황을 조회합니다:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* 위임하기 전에 검증인의 수수료(커미션), 가동률, 이력을 확인하세요. 검증인의 풀이나 평판은 현재 여러분이 받는 보상을 바꾸지 않습니다.
* 재위임은 즉시 처리되며 패널티도 락도 없습니다. 제한은 정확히 동일한 경로에서 동시에 진행 중인 재위임 건수 7건의 상한과, 방금 재위임한 스테이크는 만료될 때까지 대상 검증인에서 다시 옮길 수 없다는 규칙뿐입니다.
* 21일간의 언본딩 기간은 보안을 위한 조치입니다. 이 기간 동안에도 슬래싱(slashing) 이벤트가 토큰에 영향을 줄 수 있습니다.

:::
