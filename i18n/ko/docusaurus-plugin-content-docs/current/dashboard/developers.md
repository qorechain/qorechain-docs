---
slug: /dashboard/developers
title: 개발자
sidebar_label: 개발자
sidebar_position: 13
---

# 개발자

**Developers** 페이지(`/developers`, 사이드바 **Build**, 항목 **Developers**)는 QoreChain 위에서 구축하는 사람들을 위한 공개 도구 모음입니다. 여섯 개의 탭이 있습니다: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet**, **AI agents (MCP)**. 계정에 어떤 포스트 양자 키가 등록되어 있는지와 EVM 승인 창이 열려 있는지 확인하고, 서명된 트랜잭션을 드라이런하고, 일회용 키로 하이브리드 서명을 연습하고, 모의 QoreX 지갑으로 dApp을 테스트할 수 있으며, 모두 계정 없이 브라우저에서 이루어집니다. dApp, 지갑, 백엔드 개발자를 위한 페이지입니다. SDK 자체에 대해서는 [SDK 개요](/sdk/overview)와 [설치](/sdk/install)를 참고하세요.

## 혁신 사항 {#innovations}

- **어떤 주소든 체인에서 PQC 키와 EVM 창을 읽습니다.** PQ key status 탭은 계정이 등록한 ML-DSA-87 키와 EVM 승인 창을 체인 자체의 쿼리 경로를 통해 메인넷 또는 테스트넷에서 조회합니다. `qor1...`, `0x...`, `qorvaloper1...` 주소를 받습니다.
- **아무것도 브로드캐스트하지 않는 드라이런.** 시뮬레이터는 서명된 트랜잭션을 체인의 시뮬레이트 경로에 전송하고, 사용된 가스, 권장 가스 한도, 그리고 트랜잭션이 만들어 낼 잔액 변동과 이벤트를 보고합니다. Dashboard가 이를 위해 노출하는 유일한 쓰기 경로는 시뮬레이트입니다.
- **키가 브라우저를 떠나지 않는 브라우저 내 하이브리드 서명.** 서명 플레이그라운드는 페이지 안에서 일회용 24단어 구문을 생성하고, secp256k1 키와 ML-DSA-87 키를 파생하며, [QoreSign](/qoresign/overview) 라이브러리로 메시지와 Sign In With QoreChain 요청에 서명하고 검증합니다. 키는 메모리에만 존재하며 새로고침하면 사라집니다.
- **dApp 테스트를 위한 모의 QoreX.** QoreX test wallet은 `window.qorex`를 설치하고 현재 탭에서 EIP-6963을 통해 "QoreX (mock)"로 자신을 알리며, 테스트넷에서 실제 하이브리드 서명을 수행하고 모든 요청을 수동으로 승인하거나 거부합니다.
- **구조상 테스트넷 전용입니다.** 서명 플레이그라운드와 테스트 지갑은 메인넷을 거부합니다: `qorechain-diana`에 대해서만 서명합니다. 읽기 전용 두 탭은 어느 네트워크든 가리킬 수 있습니다.

## 사용 방법 {#how-to-use}

페이지는 **SDKs** 탭에서 열립니다. **PQ key status**와 **Simulator** 탭에는 페이지에만 적용되는 **Network** 토글이 표시되며, 헤더 설정과 관계없이 **기본값은 Testnet**입니다. (네트워크를 전환해도 페이지가 다시 로드되어 메모리 내 키와 테스트 지갑이 지워지지 않도록 페이지 수준의 토글을 사용합니다.)

### PQ key status {#pq-status}

1. **PQ key status** 탭을 열고 네트워크를 선택합니다.
2. **Account address**(`qor1...`, `0x...` 또는 `qorvaloper1...`)를 입력합니다. `0x` 주소는 `qor1` 형태와 동일한 20바이트이며, `qorvaloper` 주소는 운영자 본인의 계정으로 조회됩니다. 페이지가 형식과 체크섬을 확인합니다.
3. **Check**를 선택합니다.
4. **Registered PQC key**는 키가 등록되어 있는지, 알고리즘(ML-DSA-87), 키 유형, **Proof of possession**(체인은 이를 선택 사항으로 취급합니다), 공개 키를 보여줍니다. 등록된 키가 없으면 그렇게 표시됩니다.
5. **EVM authorisation window**는 상태(**Open** 또는 **Closed**), **Blocks left**, **Transactions used**(예: "3 of 20"), **Value used**, 열린 높이와 만료 높이, 창이 **Native QOR transfers only**인지 여부, 허용된 대상을 보여줍니다. 계정이 창을 연 적이 없으면 "No EVM authorisation window has been opened for this account."라고 표시됩니다.

창은 계정의 ML-DSA-87 키로 네이티브 레인에서 열리며, 블록 한도 또는 트랜잭션 한도에 도달하면 닫힙니다. [EVM 승인 창](/developer-guide/evm-development#evm-window)을 참고하세요. 이 탭은 명령줄 없이도 "내 EVM 트랜잭션이 왜 거부되었나요?"라는 흔한 질문에 답해 줍니다.

### Simulator {#simulator}

1. **Simulator** 탭을 열고 네트워크를 선택합니다.
2. **Signed TxRaw**(base64 또는 hex)를 입력란에 붙여넣습니다. 페이지가 디코딩된 크기와 서명 수를 알려주며, 서명이 없으면 경고합니다(체인은 서명되지 않은 트랜잭션의 시뮬레이션을 거부할 가능성이 높습니다).
3. **Simulate**를 선택합니다. 결과에는 **Gas used**, **Suggested gas limit**, **Balance changes**(주소, 단위, 변동), **Events**가 표시됩니다.
4. 체인이 거부하면 페이지에 그 코드, 코드스페이스, 로그가 표시됩니다.

아무것도 브로드캐스트되지 않습니다. 서명된 트랜잭션 바이트가 필요하므로, 먼저 SDK나 `qorechaind`로 구성하고 서명하세요([포스트 양자 서명](/developer-guide/post-quantum-signing) 참고). 입력은 약 180 KB로 제한됩니다.

### Signing playground (테스트넷 전용) {#signing-playground}

1. **Signing playground** 탭을 엽니다. "Throwaway testnet key: never use it for real funds."라는 경고가 표시됩니다.
2. **Generate throwaway key**를 선택합니다. 페이지에 주소, secp256k1 공개 키 크기, ML-DSA-87 키 크기가 표시됩니다. 다른 키가 필요하면 **New key**를 선택합니다.
3. **Message:** 텍스트를 입력하고 **Sign**을 선택합니다. 텍스트는 체인 `qorechain-diana`에 대해 두 키로 서명되며, 서명은 JSON으로 표시됩니다.
4. **Verify:** 서명과 서명자 주소를 붙여넣고 **Verify**를 선택합니다. "Valid signature" 또는 "Invalid signature"를 보고합니다. 일회용 키는 체인에 등록되어 있지 않으므로, 서명자 주소와 이 세션의 ML-DSA-87 공개 키를 기준으로 확인합니다.
5. **Sign In With QoreChain:** **Build message**를 선택해 임의의 nonce가 포함된 이 사이트용 로그인 메시지를 만든 다음, 서버가 하는 방식대로 서명하고 검증합니다. 파싱된 필드가 표시됩니다. [SIWQ 사양](/qoresign/spec/siwq-v1)과 [로그인 가이드](/qoresign/guides/sign-in)를 참고하세요.

키는 브라우저에서 생성되며, 저장되거나 전송되지 않고, 복구할 수 없습니다. 형식은 [QoreSign](/qoresign/overview)과 [Hybrid signing v1](/qoresign/spec/hybrid-signing-v1)을 참고하세요.

### QoreX test wallet (테스트넷 전용) {#test-wallet}

1. **QoreX test wallet** 탭을 열고 경고를 읽어보세요: 시작할 때마다 일회용 테스트넷 키가 메모리에 생성되며, 실제 자금을 보내지 마세요.
2. **Start test wallet**을 선택합니다. 게시된 `@qorechain/qorex-wallet-mock` 패키지를 사용하며, 모의 지갑을 **이 탭**에 설치하고(다시 로드할 때까지 그 탭의 실제 QoreX 확장 프로그램을 대체합니다) 보유한 **Addresses**(QoreChain Native, EVM, SVM)를 나열합니다.
3. 같은 탭에서 실행 중인 dApp에서 연결하거나, 브라우저 콘솔에서 `window.qorex`를 호출하세요.
4. 모든 요청은 **Waiting for approval** 아래에서 사용자를 기다립니다: **Approve** 또는 **Reject**를 선택하세요. **Requests** 목록에는 각 요청이 승인 상태와 결과와 함께 기록됩니다.
5. **Stop (reloads the page)**를 선택하면 모의 지갑이 제거됩니다.

테스트넷에 대해서만 서명하며 메인넷에 대해서는 절대 서명하지 않습니다. dApp을 실제 QoreX에 연결하기 전에 dApp 연결 흐름을 시험해 볼 때 사용하세요.

### SDKs 및 AI agents (MCP)

- **SDKs:** 이 탭은 현재 짧은 정적 퀵스타트와 패키지 표를 보여줍니다. **오래된 내용입니다**(여전히 0.1.0 버전을 설명하고 패키지가 레지스트리에 없다고 되어 있으나 더 이상 사실이 아닙니다). 현재 패키지와 버전은 [SDK 설치](/sdk/install)를 이용하세요. 테스트된 패키지 목록에서 생성되어 설치 명령, 퀵스타트, 실시간 레지스트리 버전을 제공하는 새 SDKs 탭은 **예정되어 있으며 아직 라이브가 아닙니다**.
- **AI agents (MCP):** 이 탭은 npm 레지스트리에서 QoreChain MCP 서버를 확인하며, 패키지가 게시되지 않은 동안에는 **"The QoreChain MCP server is not published yet."**라고 표시합니다. 아직 설치 명령은 없습니다. 패키지가 게시되면 이 탭에서 stdio를 통해 로컬로 실행하거나 Streamable HTTP로 자체 호스팅하여 실행하기 위한 클라이언트 구성을 보여줄 예정입니다.
- **Transaction inspector:** 모든 트랜잭션을 디코딩하고 설명하는 도구는 **예정되어 있으며 아직 라이브가 아닙니다**.

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), 또는 사이드바 **Build** 그룹(및 모바일 메뉴)의 **Developers**.
- **로그인:** 필요 없습니다. 페이지는 모두에게 열려 있습니다.
- **네트워크:** PQ key status와 Simulator: 탭의 토글을 통해 메인넷 또는 테스트넷(기본값 테스트넷). Signing playground와 QoreX test wallet: 테스트넷 전용.
- **지갑:** 필요 없습니다. 도구가 자체적으로 일회용 키를 생성합니다.
- **비용:** 무료입니다. 읽기 쿼리와 시뮬레이트 호출 외에는 체인으로 아무것도 전송되지 않습니다.
- **개인정보 보호:** 일회용 키는 페이지의 메모리에만 존재합니다. 실제 복구 구문을 어떤 도구에도 붙여넣지 마세요.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 |
| --- | --- | --- |
| Developers 페이지 | `dashboard.qorechain.io/developers` | 메인넷과 테스트넷 읽기 도구, 테스트넷 전용 서명 도구 |
| 서명 라이브러리 | npm `@qorechain/qoresign` 0.1.0, 소스 `github.com/qorechain/qoresign`, [QoreSign](/qoresign/overview) 참고 | 해당 없음 |
| 테스트 지갑 패키지 | npm `@qorechain/qorex-wallet-mock` 0.1.0, 소스 `github.com/qorechain/qorex-integrations` | 테스트넷 |
| MCP 서버 | `@qorechain/mcp`: 아직 게시되지 않음 | 해당 없음 |

버전은 2026년 10월 27일에 npm 레지스트리에서 확인했습니다.

## 제한 사항 및 알려진 문제 {#limits}

- **아직 라이브가 아닌 것:** 새 SDKs 탭과 transaction inspector. MCP 서버는 게시되지 않았으므로 설치할 것이 없습니다.
- **현재 SDKs 탭은 오래된 내용입니다.** 대신 [SDK 페이지](/sdk/overview)를 이용하세요.
- **시뮬레이터는 서명된 트랜잭션이 필요합니다.** 대신 서명해 주지 않으며 브로드캐스트하지 않습니다.
- **플레이그라운드와 테스트 지갑은 테스트넷 전용**이며 새로고침하면 사라지는 일회용 키를 사용합니다. 실제 자금을 보유하거나 이동할 수 없습니다.
- **같은 탭의 실제 QoreX 확장 프로그램은 대체됩니다.** 페이지를 다시 로드할 때까지 테스트 지갑이 그 자리를 차지합니다.
- **읽기는 읽기 전용 프록시를 거칩니다.** 체인의 REST 엔드포인트는 브라우저 CORS 헤더를 보내지 않으므로, Dashboard는 `cosmos/`, `cosmwasm/`, `qorechain/` 경로 아래의 읽기 전용 요청과 시뮬레이트 호출을 중계합니다. 자체 코드에서는 공개 엔드포인트를 직접 호출하세요: `api.qore.host`와 `api-testnet.qore.host`.
