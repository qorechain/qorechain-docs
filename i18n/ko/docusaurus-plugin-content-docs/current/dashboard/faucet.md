---
slug: /dashboard/faucet
title: 포셋
sidebar_label: 포셋
sidebar_position: 9
---

# 포셋

**포셋(Faucet)** 은 실제 가치가 있는 자산을 쓰지 않고도 대시보드, 지갑, 컨트랙트를 사용해 볼 수 있도록 테스트넷 주소로 무료 테스트 토큰을 지급합니다. 테스트넷 `qorechain-diana`에서 전송, 스왑, 스테이킹 도구, 컨트랙트 배포를 테스트하기 위해 테스트넷 QOR(그리고 빌더 페스트 기간에는 세 가지 테스트 토큰)이 필요한 모든 사람을 위한 것입니다.

:::caution 테스트넷 전용, 실제 가치 없음
테스트넷 QOR은 **실제 가치가 없습니다**. 포셋은 메인넷과 전혀 관련이 없습니다. 메인넷 QOR용 포셋은 존재하지 않으며, 여기서 받은 토큰은 메인넷으로 옮길 수 없습니다.
:::

## 혁신 {#innovations}

- **한 번의 요청, 두 종류의 토큰.** 요청 한 번으로 100 QOR가 지급되고, 별도의 트랜잭션으로 1,000 fUSD, 0.5 fETH, 0.02 fBTC가 지급됩니다. Fest 전송이 실패해도 QOR은 그대로 도착하며 결과 카드에 그렇게 표시됩니다.
- **이중 쿨다운.** 계정당 **그리고** 주소당 24시간에 한 번 요청할 수 있습니다. 슬롯은 무언가를 보내기 전에 예약되고 전송이 실패하면 해제되므로, 실패한 요청이 그날의 기회를 소모하지 않습니다.
- **Fest 토큰은 네이티브 뱅크 코인입니다.** 이들은 온체인 AMM, 뱅크 전송, IBC, QoreChain Native 컨트랙트가 그대로 사용하는 `erc20:0x...` 뱅크 디노미네이션입니다. MetaMask나 EVM DEX는 `MsgConvertCoin` 변환 후에야 이들을 볼 수 있습니다([Fest 테스트 토큰](#fest-tokens) 참조).
- **`0x` 수신자는 그에 대응하는 `qor1` 주소로 지급됩니다.** `0x` 주소는 `qor1` 형태와 같은 20바이트이므로, 서비스는 같은 계정에 지급합니다. 대시보드 양식 자체는 `qor1...`만 받습니다.

## 사용 방법 {#how-to-use}

1. **로그인합니다.** 로그아웃 상태에서는 페이지에 "Sign in to access the faucet."라고 표시됩니다.
2. **Faucet**을 엽니다. **Request Tokens**의 **Wallet Address** 아래에서 "Select a wallet" 또는 **Use my address ->** 를 사용해 대시보드 지갑 중 하나를 채우거나, `qor1...` 주소를 직접 입력합니다.
3. 안내 줄에 "You can request 100 QOR once every 24 hours"와 함께 Fest 금액이 표시됩니다.
4. **Request Tokens**를 선택합니다.
5. 성공하면 카드에 **Tokens Sent!** 와 금액, **Fest tokens** 행(도착한 항목, 또는 QOR만 처리된 경우 짧은 안내), 복사 버튼이 있는 트랜잭션 해시, **View on Explorer**가 표시됩니다.
6. 너무 일찍 다시 요청하면 "Rate Limit Reached"와 "Rate limited for another HH:MM"이 표시됩니다.

양식의 주소 확인은 가볍습니다. `qor` 접두사와 10자 이상의 길이만 확인하며 `0x...` 입력은 거부합니다. 보내기 전에 주소를 직접 확인하세요.

포셋 요청은 포셋 [퀘스트](/dashboard/quests)에도 집계됩니다.

**최소 예시:** 로그인하고 Faucet을 연 다음 **Use my address ->** 를 선택하고 **Request Tokens**를 선택한 뒤, 헤더를 Testnet으로 두고 **View on Explorer**를 선택합니다.

### Fest 테스트 토큰 (fUSD, fETH, fBTC) {#fest-tokens}

빌더 페스트를 위해 테스트넷에는 세 가지 추가 테스트 토큰이 있습니다: **fUSD**(FestUSD, 소수 6자리), **fETH**(FestETH, 소수 18자리), **fBTC**(FestBTC, 소수 8자리). 이들은 가치가 없고 실제 자산과 아무 연관도 없습니다. 테스트넷 거버넌스가 이들을 ERC-20 모듈에 등록했으므로(테스트넷 제안 26), 각 토큰은 테스트넷 EVM의 ERC-20 컨트랙트로도, 지갑과 AMM이 보유할 수 있는 뱅크 코인으로도 존재합니다. 포셋은 QOR 요청과 함께 각각 일정량을 보내도록 구성되어 있습니다(작성 시점인 2026년 10월 27일 기준: 1,000 fUSD, 0.5 fETH, 0.02 fBTC이며, 같은 24시간 쿨다운이 적용됩니다). 포셋이 이를 지급할 때마다 페이지는 QOR 금액 옆에 정확한 금액을 표시합니다. Fest 토큰은 별도의 트랜잭션으로 도착하며, 그 해시는 카드에 표시되지 않습니다.

| 토큰 | 소수 자릿수 | 테스트넷 EVM의 ERC-20 컨트랙트 | 뱅크 디노미네이션(대소문자 구분) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **테스트넷 전용.** 이 토큰들은 메인넷에 존재하지 않습니다.
- **디노미네이션을 정확히 복사하십시오.** 주소 부분은 EIP-55 대소문자 혼합이며 디노미네이션은 대소문자를 구분하여 일치시킵니다.
- **온체인에서 확인.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`는 세 디노미네이션을 심볼 및 표시 이름과 함께 나열합니다.
- **MetaMask나 EVM DEX에서 사용하기.** 포셋은 뱅크 코인을 지급합니다. MetaMask나 EVM DEX용으로 ERC-20 형태로 보유하려면 `MsgConvertCoin`으로 변환하십시오(발신자는 `qor1...` 주소, 수신자는 `0x...` 주소, 그리고 대소문자가 정확히 일치하는 디노미네이션). 되돌리는 것은 `MsgConvertERC20`입니다. 단계와 가스 수치는 [EVM 개발](/developer-guide/evm-development#fest-tokens)에 있습니다.
- **풀.** 테스트넷 [AMM](/architecture/amm)은 이들을 `uqor`와 풀로 묶을 수 있으며, 풀이 있는지는 `GET /qorechain/amm/v1/pools`로 확인합니다. [지갑](/dashboard/wallet)의 Tokens 탭과 [트레이드](/dashboard/trade)에는 이들을 위한 항목이 없으므로, 잔액은 `GET /cosmos/bank/v1beta1/balances/{address}`로 확인하십시오.

### 테스트 토큰으로 할 수 있는 일

- [지갑](/dashboard/wallet) 페이지에서 송금하고 수신합니다.
- QoreSwap 테스트 토큰으로 [스왑](/dashboard/trade)을 시도합니다.
- 메인넷으로 이동하기 전에 [스마트 컨트랙트 크리에이터](/dashboard/smart-contract-creator)에서 컨트랙트를 배포하고 테스트합니다.
- [노드 및 검증자](/dashboard/tools-hub)의 도구로 테스트넷에서 노드 또는 검증자 설정을 테스트합니다.

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **계정:** 로그인이 필요합니다. 지갑 연결은 필요하지 않으며, 어떤 `qor1...` 주소든 붙여 넣을 수 있습니다.
- **네트워크:** 포셋은 헤더 설정과 관계없이 **항상 테스트넷** `qorechain-diana`에서 지급합니다. 요청하기 위해 헤더를 테스트넷으로 전환할 필요는 없습니다. **View on Explorer**가 올바른 네트워크를 열도록 하려는 경우에만 테스트넷으로 전환하세요. 헤더가 메인넷이면 해당 링크는 "Transaction Not Found"를 표시합니다.
- **비용:** 무료.

## 게시 위치 {#where-published}

| 표면 | 주소 | 네트워크 | 계정 |
| --- | --- | --- | --- |
| Faucet 페이지 | `dashboard.qorechain.io/faucet` | 테스트넷 `qorechain-diana`만 | 로그인 필요 |
| Fest 토큰 메타데이터 | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | 테스트넷 | 없음 |

## 한계 및 알려진 문제 {#limits}

- **24시간에 한 번 100 QOR**, 계정당 그리고 주소당입니다. Fest 토큰도 같은 쿨다운을 따릅니다.
- **메인넷 포셋은 없습니다.** 테스트넷 QOR은 메인넷 QOR로 교환할 수 없습니다.
- **양식은 `0x` 주소를 거부하며** `qor` 확인만 가볍게 합니다.
- **Fest 전송은 단독으로 실패할 수 있습니다.** 그래도 QOR은 지급되며 카드에 그렇게 표시됩니다. 다시 시도하기 전에 쿨다운을 기다리거나 잔액을 확인하세요.
- **Fest 토큰은** 지갑의 Tokens 탭에 표시되지 않습니다.
