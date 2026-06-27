---
slug: /architecture/amm
title: AMM 및 온체인 유동성
sidebar_label: AMM 및 온체인 유동성
sidebar_position: 8
---

# AMM 및 온체인 유동성

`x/amm` 모듈은 QoreChain의 네이티브 온체인 자동 시장 조성자(AMM)입니다. 누구나 유동성 풀을 생성하고, 유동성을 공급하며, QoreChain 네이티브 자산 간에 프로토콜 수준에서 직접 스왑할 수 있게 합니다 — 오프체인 오더북이나 외부 스마트 컨트랙트 DEX가 필요하지 않습니다. 이것은 **대시보드 Trade / DEX** 경험의 배경에 있는 온체인 정산 계층입니다.

풀은 익숙한 AMM 가격 곡선을 따릅니다:

- **`constant_product`** — `x*y=k` 곡선 (범용 페어).
- **`stable_swap`** — 증폭 계수로 조정되는, 긴밀하게 페그된 페어를 위한 저슬리피지 곡선.

모든 금액은 QoreChain의 네이티브 단위를 사용합니다. 스테이킹 및 수수료 토큰은 **QOR**이며, 기본 denom은 **uqor**입니다(1 QOR = 10^6 uqor). 풀 참여자와 주소는 `qor` bech32 접두사를 사용합니다.

:::note
아래 명령어는 `qorechaind`를 사용합니다. 사용 환경에 맞는 일반적인 트랜잭션 플래그(`--from`, `--chain-id`, `--gas`, `--fees`, `--node`)를 추가하세요 — 예를 들어 메인넷에 대해서는 `--chain-id qorechain-vladi`.
:::

## 풀과 LP 지분

풀은 두 denom(`token_a`, `token_b`, 정렬된 순서로 저장됨)의 준비금을 보유하고, 해당 준비금에 대한 비례 청구권을 나타내는 **LP 토큰**을 발행합니다. 각 풀은 숫자 `id`, `type`, `status`(`active` 또는 `paused`), 그리고 자체 LP denom을 가집니다. 유동성을 추가하면 LP 토큰을 받고, 유동성을 제거하면 이를 소각하여 준비금에서 자신의 지분을 상환합니다.

### 풀 생성

`create-pool`은 풀 유형과 두 개의 초기 예치금(코인 형태)을 받습니다. 안정 페어의 경우 `--amp`로 증폭 계수를 설정합니다.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### 유동성 추가

`add-liquidity`는 양쪽을 풀에 예치하고 LP 토큰을 발행합니다. 마지막 인수는 수락할 최소 LP 양입니다 — 트랜잭션이 처리되기 전에 풀 비율이 변동하는 것에 대한 보호 장치입니다.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### 유동성 제거

`remove-liquidity`는 LP 토큰을 소각하고 준비금을 인출합니다. 두 개의 `min` 인수는 되돌려받을 각 측의 최소 금액을 설정합니다.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## 스왑

AMM은 두 가지 표준 스왑 방향을 지원합니다.

### Exact-in

`swap-exact-in`은 고정된 입력 금액을 지출하고 곡선이 산출하는 만큼의 출력을 반환하며, 최소 출력 하한(슬리피지 보호)의 적용을 받습니다.

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out`은 고정된 출력 금액을 요청하고 필요한 만큼의 입력을 지출하며, 최대 입력 상한의 적용을 받습니다.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

모든 스왑의 마지막 `min-out` / `max-in` 인수는 슬리피지 가드입니다: 신선한 견적(아래)에 허용 오차를 더한 값으로 설정하면, 실행 가격이 이를 위반할 경우 트랜잭션이 되돌려집니다.

## 견적 (가격 미리보기)

견적은 읽기 전용입니다 — 스왑을 제출하지 않고 미리 보여주므로, 클라이언트가 사용자가 서명하기 전에 예상 출력과 수수료를 표시할 수 있습니다. 이는 Trade UI의 가격 필드를 뒷받침하는 자연스러운 수단입니다.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

반환된 `fee`는 AMM이 거래에 적용하는 스왑 수수료입니다. 수수료와 슬리피지 수준은 풀/파라미터에 의해 결정됩니다. 직접 손으로 계산하기보다는 견적 엔드포인트를 사용하여 특정 거래에 대한 구체적인 효과를 확인하세요.

## 풀과 잔액 검사

다음은 모두 누구나 실행할 수 있는 읽기 전용 쿼리입니다.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool`은 풀의 준비금, LP 공급량, 유형, 상태, 그리고 실행 중인 가중 평균 가격을 반환합니다. `lp-balance`는 계정이 해당 풀에 대해 보유한 LP 토큰 `balance`를 반환합니다.

## 풀 일시 중지 및 재개

풀은 풀 권한(`--from`을 통해 전달된 주소)에 의해 일시 중지 및 재개될 수 있습니다. 일시 중지된 풀은 재개될 때까지 스왑과 유동성 변경을 거부합니다 — 인시던트 대응이나 조정된 유지 보수에 유용합니다.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## 명령어 요약

**트랜잭션** (`qorechaind tx amm …`):

| 명령어 | 목적 |
| --- | --- |
| `create-pool` | `constant_product` 또는 `stable_swap` 풀 생성 |
| `add-liquidity` | 준비금 예치 및 LP 토큰 발행 |
| `remove-liquidity` | LP 토큰 소각 및 준비금 인출 |
| `swap-exact-in` | 고정된 입력 금액 스왑 |
| `swap-exact-out` | 고정된 출력 금액으로 스왑 |
| `pause-pool` | 풀 일시 중지 (권한) |
| `resume-pool` | 일시 중지된 풀 재개 (권한) |

**쿼리** (`qorechaind query amm …`):

| 명령어 | 목적 |
| --- | --- |
| `params` | 모듈 파라미터 표시 |
| `pool` | ID로 단일 풀 표시 |
| `pools` | 모든 풀 목록 표시 |
| `pool-by-denoms` | denom 페어로 풀 확인 |
| `lp-balance` | 풀에서의 계정 LP 잔액 |
| `quote-exact-in` | 고정 입력 스왑의 출력 미리보기 |
| `quote-exact-out` | 고정 출력 스왑의 입력 미리보기 |

## 관련 문서

- **대시보드 Trade / DEX**는 이러한 풀, 견적, 스왑을 일반 사용자를 위한 그래픽 인터페이스로 표시합니다.
- QOR 공급량, 수수료, 가치가 체인을 통해 흐르는 방식은 [토크노믹스](/architecture/tokenomics)를 참조하세요.
- [Trade / DEX](/dashboard/trade) 인터페이스에서 직접 스왑을 시도해 보세요.
- 먼저 QoreChain으로 자산을 가져오려면 [자산 브리징](/user-guide/bridging-assets)을 참조하세요.
