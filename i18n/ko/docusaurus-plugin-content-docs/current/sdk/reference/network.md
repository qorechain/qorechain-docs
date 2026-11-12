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
| 체인 버전 (2026년 11월 12일) | v3.2.7 (2026년 11월 12일 높이 4,164,600부터, 거버넌스 제안 16. v3.2.6은 11월 4일 높이 4,020,000에서, v3.2.5는 10월 29일 높이 3,906,833에서, v3.2.4는 10월 23일 높이 3,742,566에서 적용됨). SDK 0.12.0은 v3.2.5용 클라이언트이며 v3.2.6과 v3.2.7에서도 동작합니다(서명 형식은 바뀌지 않았습니다). 0.10.0은 v3.2.4용 클라이언트였습니다 |
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
| 체인 버전 | v3.2.8 (2026년 11월 12일 높이 9,929,500부터, 거버넌스로 적용. 메인넷은 이를 적용하지 않았습니다. v3.2.7은 11월 6일 높이 9,594,600에서 적용되었습니다. v3.2.6은 10월 27일 높이 8,970,638에서, v3.2.5는 10월 26일 높이 8,890,800에서, v3.2.4는 10월 19일 높이 8,337,253에서 적용됨) |
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

SDK 0.12.0부터 `mainnet`과 `testnet` 프리셋은 기본값으로 이 REST, 컨센서스 RPC,
EVM JSON-RPC URL(그리고 테스트넷 EVM WebSocket)을 사용합니다. 위의 읽기 전용 SVM URL이 존재하더라도
프리셋은 gRPC 엔드포인트와 SVM 엔드포인트를 **설정하지 않습니다**
(SVM 트랜잭션은 열려 있지 않습니다). 이들 중 하나가 필요한 코드는 전달해야 할 엔드포인트를
알려 주는 오류와 함께 실패합니다. 테스트넷 엔드포인트는 IP별로 속도가 제한되므로, 프로덕션 트래픽에는
자체 노드를 운영하거나 사용하세요. 0.12.0 이전에는 모든 프리셋의 기본값이
localhost였습니다.

### 클라이언트에 중요한 테스트넷 전용 차이점 {#testnet-only}

테스트넷은 스테이징 네트워크로서 메인넷보다 앞서 실행되므로, 그곳에서 읽을 수 있는 몇 가지는
메인넷에 없습니다(2026년 10월 27일 확인. 전체 목록은
[테스트넷과 메인넷의 차이점](/appendix/chain-parameters#testnet-differences)에 있습니다).

* **REST 경로.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params`, `GET /qorechain/crossvm/v1/params`는 테스트넷에서 응답합니다. 메인넷은 체인 v3.2.6 이전까지 이들에 HTTP 501로 응답했으며, v3.2.6을 적용한 뒤(2026년 11월 4일)에는 그날 확인했을 때 이 경로들이 모두 메인넷에서 HTTP 200으로 응답했습니다. `/qorechain/amm/v1/` 아래의 AMM 경로(`pools`, `params`)는 두 네트워크 모두에서 응답합니다.
* **체인 v3.2.7 경로.** 2026년 11월 7일에 테스트넷은 `GET /qorechain/pqc/v1/multisig/{address}`(멀티시그가 없는 주소에는 `{"found":false,"multisig":null}`), `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool`, `GET /qorechain/svm/v1/cluster_info`에 HTTP 200으로 응답했습니다. 메인넷은 그날 v3.2.7을 적용하기 전이었으며 `/qorechain/stakingtier/v1/pool`(200)을 제외한 모두에 HTTP 501로 응답했습니다. 메인넷이 v3.2.7을 적용한 뒤(2026년 11월 12일)에는 이 경로들이 그곳에서 응답합니다. 2026년 11월 12일 `GET /qorechain/pqc/v1/multisig/{address}`, `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool`, `GET /qorechain/svm/v1/cluster_info`는 메인넷에서 HTTP 200으로 응답했습니다(멀티시그가 없는 주소에는 멀티시그 경로가 `{"found":false,"multisig":null}`을 반환했으며, SVM 레인이 아직 꺼져 있으므로 `cluster_info`는 `execution_enabled`가 false라고 보고합니다). 텍스추얼 서명 문서 쿼리는 POST 경로입니다. `GET /qorechain/pqc/v1/textual_sign_doc`는 501로 응답하고, 빈 본문의 POST는 메인넷에서 400("tx_bytes or tx_json is required")으로 응답했으므로 라우팅되어 있습니다. `GET /qorechain/pqc/v1/evm_limits`와 `GET /qorechain/svm/v1/params` 경로(v3.2.8)는 메인넷에서 501로 응답했습니다. SDK 0.12.0에는 v3.2.7 경로 중 어느 것에 대해서도 빌더나 타입 클라이언트가 없습니다.
* **테스트 토큰.** 가치가 없는 토큰 세 개가 테스트넷에만 존재하며, 대소문자를 구분하는 `erc20:<EIP-55 contract address>`라는 이름의 뱅크 denom입니다: fUSD(소수 6자리), fETH(18), fBTC(8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`가 이들을 나열합니다. 메인넷의 유일한 뱅크 denom은 `uqor`입니다. [테스트넷 테스트 토큰(페스트)](/api-reference/rest-grpc-endpoints#fest-tokens)을 참고하세요.
* **켜져 있는 모듈.** `abstractaccount` 모듈은 테스트넷에서는 켜져 있고 메인넷에서는 꺼져 있으며, EVM 프리컴파일은 테스트넷에서 활성화되어 있고(10월 27일에는 세 개, 11월 4일에는 네 개) 메인넷에서는 없으며, QoreChain Native 인스턴스화는 테스트넷에서 열려 있습니다.

## 기본 포트(`localnet` 프리셋) {#default-ports}

`localnet` 프리셋(체인 ID `qorechain-devnet`, EVM 체인 ID 미설정)은 내 컴퓨터의 노드를 위해 다음 localhost
포트를 사용합니다. SDK 0.12.0 이전에는 모든 프리셋이 이를 기본값으로
사용했고, 0.12.0부터는 `localnet`만 사용합니다. 다른 노드를 가리키려면
`endpoints`를 재정의하세요.

| 엔드포인트 | 포트 | 용도 |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank 잔액, 계정 정보, 모듈 쿼리 |
| gRPC | `9090` | gRPC 쿼리 |
| Consensus RPC | `26657` | native tx 서명/브로드캐스트, QoreChain Native 읽기 |
| EVM JSON-RPC | `8545` | `eth_*` (그리고 이를 활성화한 노드에서는 `qor_*` / 프리컴파일) |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket 구독 |
| SVM JSON-RPC | `8899` | Solana 호환 RPC |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

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

`mainnet`을 선택해 메인넷을 대상으로 지정하세요. SDK 0.12.0부터 프리셋에 이미 퍼블릭
URL이 들어 있으므로 아래 엔드포인트가 기본값이며, `endpoints`는 자체 노드에 대해서만 전달하세요
(0.12.0 이전의 SDK는 기본값이 localhost여서 이것이 필요합니다):

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
