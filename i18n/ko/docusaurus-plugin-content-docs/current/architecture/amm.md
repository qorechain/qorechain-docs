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
아래 명령어는 `qorechaind`를 사용합니다. 사용 환경에 맞는 일반적인 트랜잭션 플래그(`--from`, `--chain-id`, `--gas`, `--fees`, `--node`)를 추가하세요 — 예를 들어 메인넷에 대해서는 `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor`(네트워크 수수료 하한은 가스 단위당 0.1 uqor입니다). 모든 `tx amm` 명령은 Cosmos 레인 트랜잭션이므로 하이브리드 포스트 퀀텀 서명이 필요합니다. `--generate-only > tx.json`을 추가한 다음 `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>`를 실행하세요([첫 트랜잭션](/getting-started/first-transaction#send-qor) 참고).
:::

:::caution 메인넷에는 아직 존재하는 풀이 없습니다
AMM 모듈은 메인넷(v3.2.5)과 테스트넷(v3.2.6)에서 라이브 상태입니다. **메인넷에는 아직 생성된 풀이 없습니다**(2026년 10월 30일 확인: `GET /qorechain/amm/v1/pools`는 메인넷에서 빈 목록을 반환합니다). 테스트넷에는 풀이 하나 있습니다(id 1, `uqor`와 Fest 테스트 토큰의 쌍이며 테스트넷 전용이고 가치가 없습니다). 아래 예시의 denom(`uusdc`, `uusdt`)은 설명용입니다. 현재 네트워크에는 그러한 자산이 존재하지 않습니다. 풀이 생길 때까지 모든 스왑 또는 유동성 추가 명령은 풀을 찾을 수 없다는 오류와 함께 실패합니다.
:::

## 모듈 파라미터 {#parameters}

현재 값은 `qorechaind query amm params` 또는 `GET /qorechain/amm/v1/params`로 읽을 수 있습니다. 메인넷과 테스트넷은 현재 동일한 값을 보고합니다:

| 파라미터 | 값 | 의미 |
| --- | --- | --- |
| `enabled` | `true` | 모듈 스위치 |
| `swap_fee_bps` | `30` | 스왑 수수료, 입력 금액의 0.30 % |
| `protocol_fee_bps` | `10` | 스왑 수수료 중 프로토콜 몫으로 풀에서 빠져나가는 부분(입력의 0.10 %). 나머지는 유동성 공급자를 위해 풀에 남습니다 |
| `pool_creation_fee` | `100000000` | 100 QOR(uqor 단위), 초기 예치금에 더해 부과되며 풀이 생성될 때 소각됩니다 |
| `min_liquidity` | `1000` | 새 풀의 두 초기 예치금 중 작은 쪽은 최소 이 기본 단위 수 이상이어야 합니다 |
| `max_pools_per_creator` | `50` | 한 계정이 생성할 수 있는 풀 수 |
| `max_swap_impact_bps` | `500` | 스왑이 가질 수 있는 최대 가격 영향(5 %). [스왑 규칙](#swap-rules) 참고 |
| `lp_token_decimals` | `6` | 풀 LP 지분의 표시 소수 자릿수(외관상 값: LP 지분은 원장 항목이며 토큰이 아닙니다) |

## v3.2.2부터 적용되는 스왑 규칙 {#swap-rules}

아래의 AMM 무결성 수정은 v3.2.2(블록 높이 3,556,788, 2026년 10월 16일)와 함께 메인넷에 적용되었고 v3.2.3(블록 높이 3,662,051, 2026년 10월 20일)에서 보완되었습니다. 이는 어느 레인에서 들어오든 모든 스왑에 적용됩니다.

* **두 denom 모두 풀에 바인딩됩니다.** 스왑은 대상 풀의 두 denom을 모두 명시해야 합니다. 스테이블스왑 풀은 양방향(exact-in과 exact-out) 모두에서 스테이블스왑 곡선으로 가격이 책정됩니다.
* **프로토콜 수수료.** 스왑 수수료 중 프로토콜 몫은 풀에서 빠져나갑니다. QOR로 지급되는 경우 수수료 수집기로 전달되어 해당 블록의 다른 수수료와 함께 분배되며([토크노믹스](/architecture/tokenomics) 참고) 소각되는 부분은 `amm` 소각 출처로 기록됩니다. 그 밖의 denom으로 지급되는 경우에는 커뮤니티 풀로 들어갑니다. 풀 생성 수수료는 소각되며 동일한 `amm` 출처로 기록됩니다.
* **가격 영향 상한.** `max_swap_impact_bps`가 강제 적용됩니다. 풀 가격 대비 가격 영향이 5 %를 초과하는 스왑은 거부됩니다. 슬리피지 한도를 설정하지 않은 스왑(exact-in에서 `min-out`이 0이거나, exact-out에서 `max-in`이 입력 준비금 전체를 포괄하는 경우)은 추가로 블록 시작 시점의 풀 가격을 기준으로 측정되며, 같은 블록의 이전 거래들이 가격을 상한 너머로 움직였다면 거부됩니다. 모든 스왑에 실제 `min-out` / `max-in`을 설정하세요.
* **블록 종료 시 작업 상한 (v3.2.3).** 각 블록이 끝날 때 모듈은 최대 100개의 풀에 대해 이동 가중 평균 가격을 라운드 로빈 방식으로 갱신합니다. 풀이 100개 이하인 동안에는 모든 풀이 매 블록 갱신되며, 그 이상이면 풀의 평균은 `ceil(pools / 100)` 블록으로 이루어진 한 라운드마다 한 번 갱신됩니다. 이 평균은 참고용이며(`pool` 쿼리가 반환함) 스왑 가격 책정을 바꾸지 않습니다.

## 풀과 LP 지분

풀은 두 denom(`token_a`, `token_b`, 정렬된 순서로 저장됨)의 준비금을 보유하고, 해당 준비금에 대한 비례 청구권을 나타내는 **LP 지분**을 기록합니다. 각 풀은 숫자 `id`, `type`, `status`(`active` 또는 `paused`)를 가집니다. 유동성을 추가하면 해당 풀의 LP 지분 잔액이 늘어나고, 유동성을 제거하면 줄어들며 준비금에서 자신의 지분을 받습니다.

:::note LP 지분은 토큰이 아닙니다
LP 지분은 AMM 모듈 자체 원장의 항목이며 풀별, 계정별로 보관됩니다(내부 키는 `amm-lp/<pool id>`). 이는 **뱅크 코인도 ERC-20 토큰도 아니며, 뱅크 잔액에 표시되지 않고, 전송하거나 다른 계정으로 보내거나 거래할 수 없습니다**. 지분은 `lp-balance` 조회 또는 아래의 `/lp/{address}` 경로로 확인하세요.
:::

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

`add-liquidity`는 양쪽을 풀에 예치하고 LP 지분 잔액에 반영합니다. 마지막 인수는 수락할 최소 LP 지분 양입니다 — 트랜잭션이 처리되기 전에 풀 비율이 변동하는 것에 대한 보호 장치입니다.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### 유동성 제거

`remove-liquidity`는 잔액에서 LP 지분을 차감하고 준비금을 인출합니다. 두 개의 `min` 인수는 되돌려받을 각 측의 최소 금액을 설정합니다.

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

`pool`은 풀의 준비금, LP 공급량, 유형, 상태, 그리고 실행 중인 가중 평균 가격을 반환합니다. `lp-balance`는 계정이 해당 풀에 대해 보유한 LP 지분 `balance`를 반환합니다.

### REST 경로 {#rest-routes}

동일한 읽기 조회는 메인넷(`https://api.qore.host`)과 테스트넷(`https://api-testnet.qore.host`) **양쪽 모두**에서 REST로 제공되며, 2026년 10월 27일에 양쪽에서 확인했습니다.

| 경로 | 반환 내용 |
| --- | --- |
| `GET /qorechain/amm/v1/params` | 모듈 파라미터 |
| `GET /qorechain/amm/v1/pools` | 모든 풀(풀이 없는 동안은 빈 목록) |
| `GET /qorechain/amm/v1/pools/{pool_id}` | 풀 하나(알 수 없으면 `404`) |
| `GET /qorechain/amm/v1/pools/{pool_id}/lp/{address}` | 해당 풀에서 한 주소의 LP 잔액(`{address}`는 `qor1...` bech32 주소) |
| `GET /qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | denom 쌍에 대한 풀(없으면 `404`) |
| `GET /qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=` | 정확한 입력에 대한 출력과 수수료 |
| `GET /qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | 정확한 출력에 대한 입력과 수수료 |

존재하지 않는 풀에 대한 견적은 풀을 찾을 수 없다는 오류로 응답합니다.

### 테스트넷 페스트 토큰 {#fest-tokens}

테스트넷 거버넌스는 테스트용 ERC-20 컨트랙트 세 개, **fUSD**(소수 6자리), **fETH**(18), **fBTC**(8)를 등록하여, 대소문자를 구분하는 denom `erc20:<EIP-55 contract address>`를 가진 뱅크 코인으로 존재하도록 했습니다([포셋](/dashboard/faucet#fest-tokens) 페이지에 나열). 보유자는 `MsgConvertERC20`으로 뱅크 코인을 얻을 수 있으며(발신자는 `qor1...` bech32 주소여야 함), 일반적인 `create-pool` 명령과 100 QOR 생성 수수료로 `uqor`와의 풀을 만들 수 있습니다. 이들은 가치가 없는 테스트넷 전용 테스트 토큰이며, 아직 이 토큰들의 풀은 존재하지 않습니다(2026년 10월 27일 확인). 메인넷에는 이러한 토큰이 없습니다.

## 풀 일시 중지 및 재개

풀은 거버넌스 권한에 의해 일시 중지 및 재개될 수 있습니다. 메인넷에서는 이 두 메시지가 현재 서킷 브레이커에 의해 꺼져 있으며, 테스트넷에서는 꺼져 있지 않습니다. 일시 중지된 풀은 재개될 때까지 스왑과 유동성 변경을 거부합니다 — 인시던트 대응이나 조정된 유지 보수에 유용합니다.


## 명령어 요약

**트랜잭션** (`qorechaind tx amm …`):

| 명령어 | 목적 |
| --- | --- |
| `create-pool` | `constant_product` 또는 `stable_swap` 풀 생성 |
| `add-liquidity` | 준비금 예치 및 LP 지분 반영 |
| `remove-liquidity` | LP 지분 차감 및 준비금 인출 |
| `swap-exact-in` | 고정된 입력 금액 스왑 |
| `swap-exact-out` | 고정된 출력 금액으로 스왑 |
| `pause-pool` | 풀 일시 중지 (거버넌스 권한, 메인넷에서는 꺼져 있음) |
| `resume-pool` | 일시 중지된 풀 재개 (거버넌스 권한, 메인넷에서는 꺼져 있음) |

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
- 먼저 QoreChain으로 자산을 가져오려면 [자산 브리징](/user-guide/bridging-assets)을 참조하세요(브리지는 아직 라이브가 아닙니다).
- 풀은 [가스 추상화](/user-guide/gas-abstraction)의 수수료 가격 출처가 될 수도 있습니다. 현재는 수수료로 받는 토큰이 없습니다.
