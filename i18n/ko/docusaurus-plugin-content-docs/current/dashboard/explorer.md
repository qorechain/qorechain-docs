---
slug: /dashboard/explorer
title: 익스플로러
sidebar_label: 익스플로러
sidebar_position: 2
---

# 익스플로러

**익스플로러(Explorer)**는 체인을 들여다보는 읽기 전용 창입니다. 블록, 트랜잭션, 주소, 밸리데이터를 조회하고 네트워크 활동을 확인할 수 있습니다. 전송을 확인하거나, 계정을 살펴보거나, 어떤 서명이 트랜잭션을 보호했는지 보거나, 밸리데이터 집합을 보고 싶은 모든 분을 위한 도구입니다. 익스플로러는 두 가지입니다. `dashboard.qorechain.io/explorer`의 대시보드 안에 있는 것과, 계정이 필요 없는 별도의 공개 앱 [explore.qore.network](https://explore.qore.network)입니다. 이 둘은 서로 다른 애플리케이션이며 같은 라벨링 규칙을 적용하지 않으므로, 이 페이지에서는 둘 다 다룹니다.

## 혁신 요소 {#innovations}

- **체인이 검증한 경우에만 서명 라벨을 표시합니다.** 대시보드 익스플로러에서 네이티브 트랜잭션은 성공했고(코드 0) **또한** 체인이 상태 verified의 `pqc_hybrid_verify` 이벤트를 발생시킨 경우에만 **PQC Verified** 카드를 표시합니다. 실패한 트랜잭션에는 포스트 양자 관련 주장이 붙지 않습니다.
- **EVM 트랜잭션은 이를 승인한 윈도우를 보여줍니다.** 활성화 높이(테스트넷 5,920,000, 메인넷 2,981,742)부터 EVM 트랜잭션에는 "Authorised by a PQC window"가 표시되며, 그 윈도우를 연 네이티브 ML-DSA-87 서명 트랜잭션으로 연결되는 "Window opened by" 링크가 함께 나타납니다. 표시되는 윈도우는 트랜잭션 높이 이하에서 발신자가 가장 최근에 연 윈도우 중 만료되지 않았고 이후 닫히지 않은 것입니다. EVM 트랜잭션은 일반 secp256k1 서명을 담고 있으므로 "PQC Verified"로 표시되는 일이 없습니다. [EVM 승인 윈도우](/developer-guide/evm-development#evm-window)를 참조하세요.
- **블록별 포스트 양자 라벨은 없습니다.** 블록은 합의 키로 서명되므로, 보호는 블록별이 아니라 트랜잭션별로 표시됩니다.
- **체인에서 가져오는 밸리데이터의 포스트 양자 상태.** 밸리데이터의 주소 페이지에는 "Post-Quantum Crypto" 필드(Enabled, Disabled 또는 N/A)가 있습니다. Enabled는 운영자가 등록된 ML-DSA-87 키를 가지고 있다는 뜻입니다. 소유 증명은 체인에서 선택 사항입니다.
- **하나의 계정, 세 개의 레일.** `qor1...` 이력은 네이티브, EVM, SVM 활동을 합쳐 보여주며, 주소 페이지에는 아직 베스팅 중인 금액과 다음 해제 날짜가 표시됩니다.
- **네트워크 정보와 엔드포인트를 한 패널에.** 체인 ID, EVM 체인 ID, 토큰, 소수 자릿수, 주소 접두사, 코인 타입, 최소 가스 가격, 복사 가능한 공개 엔드포인트가 "Add QoreChain to your wallet" 패널과 함께 제공됩니다.
- **독립형 익스플로러는 공개 엔드포인트만으로 만들어졌습니다.** [explore.qore.network](https://explore.qore.network)는 체인의 공개 엔드포인트를 읽으며 계정이 필요 없습니다. 주소 페이지는 하나의 계정을 `qor1`, `0x`, SVM 형식으로 보여주고 실시간 동등성 검사(wei = uqor x 10^12, lamports = uqor x 1000)를 제공하며, 그 경로는 지갑 딥링크로 동작합니다.

## 사용 방법 {#how-to-use}

### 개요

사이드바에서 **Explorer**를 엽니다. 개요에는 다음이 표시됩니다.

- "Post-Quantum Secured" 칩이 있는 네트워크 상태(네트워크 수준의 라벨이며, 트랜잭션별 주장은 트랜잭션 페이지에 있습니다)
- **Latest Block**, **Block Time**, **Blocks Today**
- **Total Bonded**, **Bonded Ratio**, **Circulating**
- **Transactions**, **Real Txs**, **Active Set**, **Total Addresses**
- 새로고침 버튼과 자동 새로고침이 있는 **Latest Blocks**와 **Latest Transactions**

블록 또는 트랜잭션 행을 클릭하면 해당 페이지가 열립니다.

### 검색

검색창(플레이스홀더 "Search QoreChain (Address, Tx, Block)...")은 입력한 내용에 따라 이동합니다.

- `qor...`는 주소 페이지를 엽니다.
- `0x...` 또는 64자 문자열은 트랜잭션 페이지를 엽니다.
- 숫자는 블록 페이지를 엽니다.

:::note 0x 주소는 "Transaction Not Found"로 이동합니다
대시보드 검색은 `0x...` 입력을 트랜잭션 해시로 취급합니다. EVM 주소를 조회하려면 대신 `qor1...` 형식으로 검색하거나(`0x` 주소는 `qor1` 형식과 같은 20바이트입니다), 두 형식을 모두 받는 [explore.qore.network](https://explore.qore.network)를 사용하세요.
:::

### 트랜잭션 페이지

트랜잭션 페이지에는 해시(복사 가능), 상태와 유형, Block Height, Interactions(From과 To), Value & Fees, Memo, Gas Consumed, 있는 경우 크로스 체인 행, 그리고 **Raw Data**가 표시됩니다. 또한 무엇이 트랜잭션을 보호했는지도 보여주며, 체인이 뒷받침하는 주장만 표시합니다.

- **PQC Verified.** 성공했고 체인 자체가 하이브리드 서명(ML-DSA-87 부분 포함)을 검증한 네이티브 레인 트랜잭션입니다. 실패한 트랜잭션이나 검증된 하이브리드 서명이 없는 트랜잭션은 대신 표준 보안을 표시합니다.
- **Authorised by a PQC window.** 발신자가 열린 [EVM 승인 윈도우](/developer-guide/evm-development#evm-window)를 가지고 있을 때 보낸 EVM 트랜잭션이며, **Window opened by** 링크가 함께 표시됩니다.

### 블록 페이지

이전 및 다음 화살표로 체인을 한 단계씩 이동합니다. **Core Information**에는 높이, 해시, 제안자, 서명 수, Gas Used가 있고, 그 뒤에 **Technical Hashes**와 **Block Transactions**가 이어집니다. 블록에는 포스트 양자 라벨이 없습니다.

### 주소 페이지

QoreChain 주소는 Native(`qor1...`), EVM(`0x...`), SVM(base58)의 세 가지 인코딩을 가진 하나의 계정이며, 주소 페이지는 세 가지 모두의 활동을 합쳐 보여줍니다.

- **Copy address**와 **Show QR Code**(팝오버이며, 다운로드는 없습니다).
- **Total Balance**와 **Available**, 그리고 아직 베스팅 중인 금액과 다음 해제 날짜를 보여주는 줄.
- **Total Activity**와 통합 이력(Transfer, Faucet Claim, Cross-Chain Swap 등의 메서드).
- 밸리데이터의 주소 페이지(`/explorer/address/qorvaloper1...`)에서는 **Post-Quantum Crypto** 필드.

### 밸리데이터 {#validators}

`/explorer/validators`는 네트워크의 밸리데이터를 나열합니다. 요약 카드에는 **Active Validators**, **Bonded Tokens**, **Consensus Health**(측정값이 아니라 상태 라벨)가 표시됩니다. 표에는 Rank, Validator, Voting Power, Commission, Status, PQC가 있습니다(표의 PQC 열은 모든 행에서 흐리게 표시됩니다. 실제 상태는 밸리데이터의 주소 페이지를 이용하세요). 검색창에는 "Search validator..."라고 표시됩니다. 목록은 헤더에서 선택한 네트워크를 따릅니다. 위임하려면 [스테이킹 및 밸리데이터](/dashboard/staking-and-validators)를, 수익률과 로그인이 포함된 더 폭넓은 비교는 [밸리데이터](/dashboard/validators)를 참조하세요.

### 네트워크 정보와 지갑에 추가

개요에는 체인 정보와 공개 엔드포인트가 각각 복사 가능하게 표시되며, Wallet 페이지와 같은 **Add QoreChain to your wallet** 패널이 있습니다([Add QoreChain to your wallet](/dashboard/wallet#add-network) 참조).

### 독립형 익스플로러 {#standalone-explorer}

[explore.qore.network](https://explore.qore.network)는 익스플로러 전용의 별도 웹 앱입니다. **메인넷**으로 열리며 헤더에 **Testnet / Mainnet** 전환이 있습니다. 경로:

| 경로 | 표시 내용 |
| --- | --- |
| `/` | 실시간 높이, 상태, 공급량, 본딩된 스테이크, 최신 블록과 트랜잭션, 체인 정보, 공개 엔드포인트, 가이드 링크. |
| `/blocks`, `/block/{height}` | 블록 목록, 그리고 트랜잭션이 포함된 블록. |
| `/txs`, `/tx/{hash}` | 트랜잭션 목록, 그리고 상태, 수수료, 가스, 메시지, 원시 응답이 포함된 트랜잭션. |
| `/address/{qor1... or 0x...}` | 세 가지 인코딩과 동등성 검사가 있는 통합 아이덴티티 페이지. `/account/*`는 `/address/*`로 리디렉션됩니다. |
| `/validators`, `/validator/{address}` | 투표력과 수수료가 있는 밸리데이터 집합, 그리고 개별 밸리데이터. |
| `/tokens`, `/token/{denom}`, `/assets` | 토큰 및 자산 목록. |
| `/contracts`, `/nfts`, `/collections` | 컨트랙트, NFT, 컬렉션. |

검색은 블록 높이, 64자리 16진수 해시(`0x` 유무 무관), `qor1...` 또는 `0x...` 주소, `qorvaloper1...` 주소를 받습니다. `qorvaloper1...` 검색은 해당 밸리데이터 페이지가 아니라 밸리데이터 목록을 엽니다. **Add to wallet** 섹션은 suggestChain(Keplr, Leap, Cosmostation), EIP-3085(MetaMask 및 기타 EVM 지갑), SVM 사용자 지정 RPC 안내, WalletConnect v2 페어링을 제공합니다.

`/tx/`, `/block/`, `/address/` 경로는 EIP-3085 블록 익스플로러 링크와 함께 동작하므로, 익스플로러 URL을 여는 지갑은 올바른 페이지로 이동합니다.

:::caution 코드에서 익스플로러의 /api/lcd를 사용하지 마세요
독립형 익스플로러에는 자체 페이지를 제공하는 읽기 전용 프록시 `/api/lcd/...`가 있으며, 브라우저의 네트워크 쿠키에 따라 응답합니다. 이것은 공개 API가 아닙니다. 변경될 수 있고, 프로그램 사용을 위한 속도 계획이 되어 있지 않으며, 쿠키가 지정하는 네트워크를 반환합니다. 스크립트, 서비스, 지갑에는 대신 공개 REST 엔드포인트를 사용하세요. `https://api.qore.host`(메인넷)와 `https://api-testnet.qore.host`(테스트넷)입니다. [REST 및 gRPC 엔드포인트](/api-reference/rest-grpc-endpoints)를 참조하세요.
:::

:::note 독립형 익스플로러는 아직 대시보드의 PQC 라벨링 규칙을 적용하지 않습니다
[혁신 요소](#innovations)의 규칙(체인 검증 후에만 포스트 양자 라벨 표시, EVM 트랜잭션용 "Authorised by a PQC window" 카드)은 대시보드 익스플로러에서 라이브입니다. explore.qore.network의 독립형 익스플로러는 아직 이를 반영하도록 업데이트되지 않았습니다. 트랜잭션 페이지는 실패한 트랜잭션을 아직 구별하지 못하는 하이브리드 서명 표시를 보여주며, EVM 트랜잭션에는 이전 문구를 사용합니다. 대시보드 익스플로러의 라벨을 기준으로 삼으세요.
:::

## 이용 방법 {#how-to-access}

- **대시보드 익스플로러:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). 헤더에서 네트워크를 선택합니다. 메인넷의 **개요**에는 로그인과 [일회성 고지](/dashboard/overview#risk-acknowledgement)가 필요합니다. 테스트넷의 개요와 두 네트워크의 **모든 상세 페이지**(트랜잭션, 블록, 주소, 밸리데이터)는 계정 없이 열립니다.
- **독립형 익스플로러:** [explore.qore.network](https://explore.qore.network). 계정도 지갑도 필요 없습니다. 테스트넷은 헤더 전환을 사용하세요.
- **비용:** 무료입니다. 무엇이든 읽는 데 지갑 연결이 필요하지 않습니다.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 | 계정 |
| --- | --- | --- | --- |
| 대시보드 익스플로러 | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | 메인넷 및 테스트넷, 헤더 전환 | 메인넷 개요만 |
| 독립형 익스플로러 | `explore.qore.network` | 메인넷(기본값) 및 테스트넷 전환 | 없음 |
| 체인 데이터 | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | 메인넷 및 테스트넷 | 없음 |

## 제한 사항 및 알려진 문제 {#limits}

- **대시보드 검색에 입력한 `0x` 주소**는 "Transaction Not Found"로 이동합니다. `qor1...` 형식을 사용하세요.
- 대시보드 밸리데이터 표의 **PQC 열**은 항상 흐리게 표시됩니다. 밸리데이터의 실제 상태는 주소 페이지에 있습니다.
- **표시되지 않는 것:** 트랜잭션별 윈도우 사용 횟수 카운터, 블록에 대한 포스트 양자 증명, 밸리데이터 표의 밸리데이터별 포스트 양자 플래그.
- **독립형 익스플로러**는 아직 대시보드의 라벨링 규칙을 채택하지 않았으며(위 참조), `qorvaloper1...` 검색은 밸리데이터 목록을 엽니다.
- **독립형 익스플로러의 /api/lcd**는 사이트 자체를 위한 것이며 프로그램용이 아닙니다.
- 대시보드 익스플로러에서는 **네트워크가 헤더를 따릅니다**. 다른 네트워크의 해시는 "not found"로 표시됩니다.
