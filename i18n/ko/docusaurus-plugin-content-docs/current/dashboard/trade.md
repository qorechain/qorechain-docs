---
slug: /dashboard/trade
title: 거래 (DEX)
sidebar_label: 거래 (DEX)
sidebar_position: 4
---

# 거래 (DEX)

**거래(Trade)** 페이지("QoreChain DEX"라는 제목)는 테스트 토큰 스왑 화면으로, **Swap**, **Pools**, **Add Liquidity**, **My Positions**의 네 개 탭이 있습니다. 실제 풀이 생기기 전에 테스트 토큰으로 스왑 흐름을 처음부터 끝까지 체험해 보기 위한 화면입니다. QoreChain의 네이티브 자동화 마켓 메이커 설계에 대해서는 [AMM 및 온체인 유동성](/architecture/amm)을 참고하세요.

:::caution 현재는 테스트 토큰 전용
이 페이지의 모든 것은 헤더에 어느 네트워크가 표시되든 **테스트넷**에서 실행됩니다. 메인넷에서도 페이지는 로그인과 확인 절차로 보호되지만, `qorechain-diana`와 테스트넷 토큰을 보여줍니다. 온체인에서 정산되는 것은 다섯 개의 QoreSwap 테스트 토큰뿐이며, 그 밖의 모든 것은 연습 영역입니다. QoreChain의 네이티브 AMM 모듈은 가동 중이지만, 아직 어느 네트워크에도 풀이 생성되지 않았습니다(`GET /qorechain/amm/v1/pools`는 두 네트워크 모두에서 빈 목록을 반환합니다. 2026년 10월 27일 확인).
:::

## 혁신 요소 {#innovations}

- **다섯 개 테스트 토큰의 온체인 스왑.** WQOR, QUSDC, QUSDT, QWETH, QWBTC 사이의 스왑은 테스트넷 EVM(체인 ID 9800)의 QoreSwap AMM 컨트랙트를 대상으로 실행됩니다. 견적은 컨트랙트의 `getAmountOut`에서 가져옵니다.
- **트랜잭션 안에서 강제되는 슬리피지.** 거래는 승인(approve) 후 `swapExactTokensForTokens`를 실행하는 방식으로 이루어지며, 슬리피지 설정에서 계산한 최소 출력량이 적용되고 테스트 지갑의 EVM 키로 서명됩니다. 가격이 허용 범위를 벗어나면 더 나쁜 가격으로 체결되는 대신 스왑이 되돌려집니다(revert).
- **필요할 때 받는 테스트 토큰.** **Get test tokens**는 다섯 개 토큰을 모두 청구하며, 토큰마다 12시간에 한 번 가능합니다.
- **실제와 연습의 정직한 구분.** 그 밖의 페어, Pools 목록, Add Liquidity, My Positions는 테스트넷 연습 영역이며 온체인에 있지 않습니다.

## 사용 방법 {#how-to-use}

사전 조건: 로그인과 테스트 지갑([지갑](/dashboard/wallet#testnet) 참고). 지갑이 없으면 페이지에 "Wallet Required for Trading"이 표시됩니다.

### 스왑

1. 배너에서 **Get test tokens**를 제공합니다. 먼저 사용하세요.
2. 지불할 토큰을 선택하고 금액을 입력합니다. 기본 페어인 QOR to USDC는 온체인에서 정산되지 않는 **연습용** 페어입니다. 온체인 스왑을 하려면 **WQOR**과 **QUSDC**(또는 다섯 개 중 임의의 페어)를 선택하세요.
3. 받을 토큰을 선택합니다. 출력량은 자동으로 견적됩니다.
4. 선택적으로 **슬리피지 허용 범위**를 조정합니다(페이지에 기본값이 있습니다).
5. **Swap Now**를 선택한 다음 **Confirm Swap**을 선택합니다. 결과에는 "Swap Confirmed"와 함께 **View Transaction**이 표시됩니다.

**Recent Swaps**에는 모든 사용자의 스왑이 나열되며, **Show My History**를 선택하면 본인의 스왑만 보입니다.

**최소 예시:** 테스트넷에서 **Get test tokens**를 선택하고, 일부 WQOR를 QUSDC로 판매한 뒤, **Swap Now**, **Confirm Swap**을 선택합니다.

:::tip 슬리피지
허용 범위를 높이면 빠르게 변동하는 시장에서 스왑이 체결될 가능성이 높아지지만, 더 나쁜 가격을 받을 수 있습니다. 기본값은 대부분의 페어에 적합합니다.
:::

### 풀

풀 카드에서 거래 페어와 그 세부 정보를 둘러봅니다. 검색창에서 토큰 심볼로 필터링할 수 있습니다. 이 풀은 온체인 유동성이 아닌 연습 영역이며, 표시된 수치는 시장 데이터가 아닙니다.

### 유동성 추가

1. 페어로 묶을 두 토큰을 선택합니다(하나는 기본적으로 QOR입니다). 새 페어에는 **Create Pool**을 사용하세요.
2. 첫 번째 토큰의 금액을 입력합니다. 두 번째 금액은 풀 비율에 맞춰 채워집니다. 페이지에 풀 생성을 위한 최소 금액이 안내됩니다.
3. 지분을 검토한 다음 확인합니다.

### 내 포지션

각 항목은 토큰 페어, 각 토큰의 금액, 지분, 획득한 수수료를 보여줍니다. 포지션에서 나가려면 **Withdraw**를 선택한 다음 **Request Withdrawal (x%)**를 선택하고, 대기 시간이 지난 뒤 **Confirm Withdraw**(또는 **Cancel Withdrawal**)를 선택합니다. 단일 "Remove Liquidity" 버튼은 없습니다.

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **계정:** 로그인이 필요합니다. 스왑하려면 테스트 지갑이 필요합니다. 메인넷에서는 페이지가 열리기 전에 일회성 [확인 사항](/dashboard/overview#risk-acknowledgement)에도 동의해야 합니다.
- **네트워크:** 테스트넷 콘텐츠만 제공하며, 헤더의 전환으로 바뀌지 않습니다.
- **비용:** 무료입니다. 테스트 토큰은 **Get test tokens**에서 받고, 테스트 지갑은 [포셋](/dashboard/faucet)에서 받은 테스트 QOR로 가스를 지불합니다.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 | 온체인 정산 여부 |
| --- | --- | --- | --- |
| WQOR, QUSDC, QUSDT, QWETH, QWBTC 스왑 | `dashboard.qorechain.io/trade` | 테스트넷 EVM, 체인 ID 9800 | 예 |
| 그 밖의 페어, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | 테스트넷 | 아니요, 연습용 장부 |
| 네이티브 AMM | [AMM](/architecture/amm) 참고 | 두 네트워크 모두 | 아직 풀이 없음 |

## 제한 사항 및 알려진 문제 {#limits}

- **메인넷 거래는 없습니다.** 페이지는 네트워크 전환을 무시하며, 메인넷에서도 테스트넷 콘텐츠를 보여줍니다.
- **온체인에서 정산되는 토큰은 다섯 개뿐입니다.** [포셋](/dashboard/faucet#fest-tokens)의 페스트 토큰은 이 페이지에 없습니다.
- **네이티브 AMM에는 풀이 없습니다.** 두 네트워크 모두 마찬가지입니다. 실제 풀은 생기면 설명하겠습니다.
- **풀 수치**는 연습용 데이터이며 시장 데이터가 아닙니다.
- **테스트넷 토큰은 가치가 없으며** 어떤 것으로도 교환할 수 없습니다.

## 관련 항목

- [AMM 및 온체인 유동성](/architecture/amm) - 풀 유형과 가격 곡선.
- [지갑](/dashboard/wallet) - 스왑 전후로 잔액을 확인하세요.
