---
slug: /sdk/reference/network
title: 네트워크 및 엔드포인트
sidebar_label: 네트워크 및 엔드포인트
sidebar_position: 1
---

# 네트워크 및 엔드포인트 참조

## 메인넷

| 필드 | 값 |
| --- | --- |
| 네트워크 프리셋 | `mainnet` |
| 체인 id | `qorechain-vladi` (2026년 6월 7일부터 가동 중) |
| 체인 버전 (2026년 10월 27일) | v3.2.4 (2026년 10월 23일 높이 3,742,566부터, 거버넌스 제안 13). 거버넌스 제안 14는 높이 3,906,833에서 v3.2.5를 적용하게 되며 이 글을 쓰는 시점에 투표 기간 중이었습니다. v3.2.5가 추가하는 내용은 메인넷이 이를 적용하는 날 문서화됩니다 |
| EVM 체인 ID | `9801` |
| 표시 토큰 | `QOR` |
| 기본 단위 | `uqor` |
| QOR당 기본 단위 수 | `10^6` |
| 계정 bech32 접두사 | `qor` |
| 검증자 bech32 접두사 | `qorvaloper` |

## 테스트넷

| 필드 | 값 |
| --- | --- |
| 네트워크 프리셋 | `testnet` |
| 체인 id | `qorechain-diana` (가동 중) |
| 체인 버전 (2026년 10월 27일) | v3.2.6 (2026년 10월 27일 높이 8,970,638부터. v3.2.5는 10월 26일 높이 8,890,800에서, v3.2.4는 10월 19일 높이 8,337,253에서 적용됨) |
| EVM 체인 ID | `9800` |
| 표시 토큰 | `QOR` |
| 기본 단위 | `uqor` |
| QOR당 기본 단위 수 | `10^6` |
| 계정 bech32 접두사 | `qor` |
| 검증자 bech32 접두사 | `qorvaloper` |

## 퍼블릭 엔드포인트 {#public-endpoints}

| 엔드포인트 | 메인넷 (`qorechain-vladi`) | 테스트넷 (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (체인 ID 9801) | `https://evm-testnet.qore.host` (체인 ID 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (읽기 전용) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

EVM 엔드포인트는 `eth_`, `net_`, `web3_`, `txpool_`를 제공하며, `qor_`
네임스페이스는 활성화되어 있지 않습니다. [네트워크](/appendix/networks#public-endpoints)도 함께 참고하세요.

### 클라이언트에 중요한 테스트넷 전용 차이점 {#testnet-only}

테스트넷은 스테이징 네트워크로서 메인넷보다 앞서 실행되므로, 그곳에서 읽을 수 있는 몇 가지는
메인넷에 없습니다(2026년 10월 27일 확인. 전체 목록은
[테스트넷과 메인넷의 차이점](/appendix/chain-parameters#testnet-differences)에 있습니다).

* **REST 경로.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params`, `GET /qorechain/crossvm/v1/params`는 테스트넷에서 응답하며, 메인넷은 이들에 HTTP 501로 응답합니다. `/qorechain/amm/v1/` 아래의 AMM 경로(`pools`, `params`)는 두 네트워크 모두에서 응답합니다.
* **테스트 토큰.** 가치가 없는 토큰 세 개가 테스트넷에만 존재하며, 대소문자를 구분하는 `erc20:<EIP-55 contract address>`라는 이름의 뱅크 denom입니다: fUSD(소수 6자리), fETH(18), fBTC(8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`가 이들을 나열합니다. 메인넷의 유일한 뱅크 denom은 `uqor`입니다. [테스트넷 테스트 토큰(페스트)](/api-reference/rest-grpc-endpoints#fest-tokens)을 참고하세요.
* **켜져 있는 모듈.** `abstractaccount` 모듈은 테스트넷에서는 켜져 있고 메인넷에서는 꺼져 있으며, EVM 프리컴파일 세 개는 테스트넷에서 활성화되어 있고 메인넷에서는 없으며, QoreChain Native 인스턴스화는 테스트넷에서 열려 있습니다.

## 기본 포트

`createClient()`는 기본적으로 다음 localhost 포트를 사용합니다. 실제 노드를
가리키려면 `endpoints`를 재정의하세요.

| 엔드포인트 | 포트 | 용도 |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank 잔액, 계정 정보, 모듈 쿼리 |
| gRPC | `9090` | gRPC 쿼리 |
| Consensus RPC | `26657` | native tx 서명/브로드캐스트, QoreChain Native 읽기 |
| EVM JSON-RPC | `8545` | `eth_*` (그리고 이를 활성화한 노드에서는 `qor_*` / 프리컴파일) |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket 구독 |
| SVM JSON-RPC | `8899` | Solana 호환 RPC |

명시적 엔드포인트를 사용하는 예:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

SDK는 네트워크를 프로그래밍 방식으로 나열하고 해석할 수 있도록 네트워크 프리셋과
lookup 헬퍼(networks 모듈에서 익스포트됨)를 노출합니다. Python/Go/Rust에서
이에 해당하는 것은 `create_client` / `CreateClient` / `ClientBuilder`와
`networks` 모듈입니다.

## 메인넷 대상으로 지정하기

두 프리셋 모두 동일한 localhost 기본값을 제공합니다. `mainnet`을 선택하고
엔드포인트를 퍼블릭 URL(또는 자체 노드)로 재정의하세요:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
