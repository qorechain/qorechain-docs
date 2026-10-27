---
slug: /dashboard/developers
title: 개발자
sidebar_label: 개발자
sidebar_position: 13
---

# 개발자

**Developers** 페이지(`/developers`, 사이드바 **Build** 그룹, 항목 **Developers**)는 QoreChain 위에서 구축하는 사람들을 위한 공개 도구 페이지입니다. 계정이 필요 없습니다. 여섯 개의 탭이 있습니다: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet**, **AI agents (MCP)**. 이 탭들을 통해 알맞은 패키지를 찾아 설치하고, 계정에 어떤 포스트 양자 키가 등록되어 있는지와 EVM 승인 창이 열려 있는지 확인하고, 서명된 트랜잭션을 드라이런하고, 일회용 키로 하이브리드 서명을 연습하고, 모의 QoreX 지갑으로 dApp을 테스트할 수 있으며, 모두 브라우저에서 이루어집니다. dApp, 지갑, 백엔드 개발자를 위한 페이지입니다. **Transaction inspector**는 계획되어 있으며 아직 라이브가 아닙니다([제한 사항](#limits) 참고). 라이브러리 자체에 대해서는 [개발자 패키지](/developer-tools/overview), [SDK 개요](/sdk/overview), [설치](/sdk/install)를 참고하세요.

## 혁신 사항 {#innovations}

- **체인에 대한 읽기 전용 게이트웨이.** 도구들은 공개 체인 데이터를 읽고, `cosmos/`, `cosmwasm/`, `qorechain/` 쿼리 경로와 시뮬레이트 호출에 한해 읽기 전용 게이트웨이를 통해 트랜잭션을 시뮬레이션합니다. 이 페이지의 어떤 것도 트랜잭션을 브로드캐스트할 수 없습니다. 체인의 REST 엔드포인트가 브라우저 CORS 헤더를 보내지 않기 때문에 이 게이트웨이가 존재합니다.
- **브라우저를 떠나지 않는 키.** 서명 플레이그라운드와 테스트 지갑의 키는 브라우저에서 생성되며 메모리에만 보관됩니다. 저장되거나 전송되지 않으며, 새로고침하면 사라집니다. 이 두 탭은 테스트넷 전용이며 메인넷을 거부합니다.
- **데모가 아닌 프로덕션 서명 라이브러리.** 플레이그라운드는 프로덕션 통합과 동일한 오픈 소스 라이브러리인 [QoreSign](/qoresign/overview)을 사용합니다. 같은 메시지에 대한 secp256k1 서명과 ML-DSA-87 서명으로 이루어진 하이브리드 서명을 생성하고 검증합니다.
- **테스트된 데이터에서 생성되는 패키지 허브.** **SDKs** 탭은 하나의 매니페스트에서 약 40개의 패키지를 나열합니다. 버전은 각 레지스트리에서 실시간으로 읽어오며(10분마다 갱신되고, 레지스트리에 연결할 수 없으면 마지막으로 확인한 버전과 그 날짜가 표시됩니다), 각 퀵스타트는 SDK 팀이 공개 레지스트리를 대상으로 실행했고 그들이 관찰한 출력이 옆에 함께 표시됩니다.
- **추측이 아닌 체인의 답.** **PQ key status**는 등록된 ML-DSA-87 키와 EVM 창 상태를 노드 자체의 쿼리 경로에서 읽어오므로, EVM 트랜잭션을 보내기 전에 왜 거부될지 확인할 수 있습니다.

## 사용 방법 {#how-to-use}

[dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)를 엽니다. 페이지는 **SDKs** 탭에서 열립니다. **PQ key status**와 **Simulator** 탭에는 페이지에만 적용되는 **Network** 토글(Testnet 또는 Mainnet)이 표시되며, 헤더 설정과 관계없이 **기본값은 Testnet**입니다. 의도적으로 페이지 수준으로 둔 것입니다: 헤더의 전환은 페이지를 다시 로드하여 메모리 내 키와 테스트 지갑을 지워 버리기 때문입니다.

### SDKs {#sdks}

**기능.** 모든 QoreChain 라이브러리를 제품별로 묶어 나열합니다. 매니페스트에는 TypeScript, Python, Go, Rust, Java, Kotlin, Swift에 걸쳐 약 40개의 패키지가 있습니다. 대부분은 안정 버전이고, 하나는 지원 중단되었으며, 아직 레지스트리에 없는 패키지는 그렇게 표시됩니다. 표시되는 순서대로 제품은 다음과 같습니다: QoreChain SDK(코어, React 훅, EVM, SVM, dApp 스타터, Python·Rust·Go·Java 포트), QoreSign, RDK(롤업 개발 키트, 그 명령줄 도구, 롤업 스타터, Python·Rust·Go·Java 포트), PQC 라이브러리, 지갑 어댑터, 체인 브리지, Handles, QoreX 통합, 그리고 MCP와 `qore` CLI.

**작동 방식.** 각 제품은 카드입니다. 제품이 여러 언어로 제공되면 언어 선택기(알약 모양)로 표시되는 패키지를 전환합니다. 각 패키지는 다음을 보여줍니다:

- 상태 알약(**Stable**, **Not published yet** 또는 **Deprecated**);
- 레지스트리(npm, PyPI, crates.io, Go 프록시, Maven Central 또는 GitHub 릴리스)에서 실시간으로 읽어 10분마다 갱신되는 **최신 버전**. 레지스트리에 연결할 수 없으면 마지막으로 확인한 버전이 날짜와 함께, 실시간 버전을 읽을 수 없었다는 안내와 함께 표시됩니다;
- **Registry**, **Source**(저장소), **License**(Apache-2.0)와 런타임 요구 사항;
- **Install** 명령과 **Import** 줄(각각 복사 버튼 포함), 그리고 해당 패키지에 있는 경우 피어 의존성, 서브패스 익스포트, 전송 방식, 호스팅 엔드포인트(Maven은 `pom.xml` 블록을 보여줍니다);
- **Quickstart**: 날짜와 함께 **Tested**라고 쓰인 알약, **Failed in testing** 또는 **Not tested**, 파일 이름, 복사 버튼이 있는 코드, **Observed output**, 그리고 **How it was tested**. 실패한 퀵스타트는 먼저 알려진 문제를 읽으라는 경고와 함께 **Show the quickstart** 뒤에 숨겨집니다;
- **Known issues**와 참고 사항, SDK 팀이 작성한 그대로.

게시되지 않은 패키지에는 "This package is not on its registry yet, so there is no install command."가 표시되고 설치 줄은 없습니다. 지원 중단된 패키지(`@qorechain/connect`)는 맨 아래 **Deprecated packages** 아래에 접혀 있으며, 대체 패키지(`@qorechain/qorex-*` 패키지)가 함께 표시됩니다.

**단계.**

1. 필터 상자("Filter by name or language")에 입력해 목록을 좁힙니다. **Clear filter**로 초기화합니다. 여러 제품이 일치하면 **Jump to** 줄이 각각으로 연결됩니다.
2. 제품을 고른 다음 언어 알약을 고릅니다.
3. 버전 줄("latest on npm", 또는 날짜가 있는 "checked")을 확인한 뒤 **Install** 명령을 복사합니다.
4. **Import** 줄을 복사하고, 이어서 퀵스타트를 **File name** 아래에 표시된 이름의 파일로 복사해 실행합니다.
5. **Network endpoints**를 열어 테스트넷과 메인넷의 체인 ID와 공개 엔드포인트를 복사합니다. 그 아래의 안내는 퀵스타트 규칙을 설명합니다: 예제는 읽기만 하며 공개 테스트 구문으로 서명하므로, 그로부터 파생된 계정에는 절대 자금을 넣지 마세요.

**최소 예제.** 필터에 `python`을 입력하고, **QoreChain SDK**를 열고, **Python** 알약을 고른 뒤, **Install**에서 설치 명령을 복사하고, 이어서 퀵스타트를 복사해 실행합니다.

**네트워크.** 정적 목록과 실시간 레지스트리 읽기이며, 네트워크 선택은 적용되지 않습니다.

### PQ key status {#pq-status}

**기능.** 계정이 체인에 등록한 ML-DSA-87 키와 그 EVM 승인 창의 상태를 메인넷 또는 테스트넷에서 보여줍니다.

**작동 방식.** 페이지는 입력을 파싱하여 `qor1...` 계정으로 변환하고, 노드에 두 가지를 질의합니다: 등록된 PQC 키([QoreSign](/qoresign/overview)을 통해)와 계정의 EVM 창(`GET /qorechain/pqc/v1/evm_window/{address}`)입니다. `0x...` 주소는 `qor1...` 형태와 동일한 20바이트이며, `qorvaloper1...` 주소는 운영자 본인의 계정으로 조회됩니다. 결과는 하나의 네트워크에 속하며, 토글을 바꾸면 지워집니다.

**단계.**

1. **PQ key status** 탭을 열고 네트워크를 선택합니다.
2. **Account address**(`qor1...`, `0x...` 또는 `qorvaloper1...`)를 입력합니다. 페이지가 형식과 체크섬을 확인하고 오타를 알려줍니다.
3. **Check**를 선택합니다.
4. **Registered PQC key**를 읽습니다: 키가 등록되어 있는지, **Algorithm**(ML-DSA-87), **Key type**(hybrid), **Proof of possession**(체인은 이를 선택 사항으로 취급한다는 안내와 함께), **Public key**(2592바이트, 일부만 표시되며 복사 버튼 포함). 키가 없는 계정에는 "This account has no PQC key registered on this network."가 표시됩니다.
5. **EVM authorisation window**를 읽습니다: **State**(**Open** 또는 **Closed**), **Blocks left**, **Transactions used**("3 of 20" 형식), **Value used**, **Opened / expiry height**, 그리고 창이 **Native QOR transfers only**를 허용하는지 여부와 허용된 대상. 창을 연 적이 없는 계정에는 "No EVM authorisation window has been opened for this account."가 표시됩니다.

창은 계정의 ML-DSA-87 키로 네이티브 레인에서 열리며, 블록 한도 또는 트랜잭션 한도에 도달하면 닫힙니다. [EVM 승인 창](/developer-guide/evm-development#evm-window)을 참고하세요.

**최소 예제.** Testnet을 고르고, MetaMask에서 사용하는 주소의 `0x...` 형태를 붙여넣고 **Check**를 선택합니다: 창이 **Closed**이거나 없으면 그 계정의 EVM 트랜잭션은 거부됩니다.

### Simulator {#simulator}

**기능.** 서명된 트랜잭션을 체인에 대해 드라이런하고 비용과 변경 사항을 보고합니다. 아무것도 브로드캐스트되지 않습니다.

**작동 방식.** 페이지는 입력(base64 또는 hex, 약 180 KB까지)을 디코딩하고, 서명 수를 세고, 노드의 시뮬레이트 경로로 전송합니다. 시뮬레이트 호출은 게이트웨이가 허용하는 유일한 쓰기 경로입니다.

**단계.**

1. **Simulator**를 열고 네트워크를 선택합니다.
2. 서명된 트랜잭션(`TxRaw`, base64 또는 hex)을 **Signed TxRaw**에 붙여넣습니다. 페이지가 디코딩된 크기와 서명 수를 보여주며, 서명이 없으면 경고합니다(체인은 서명되지 않은 트랜잭션의 시뮬레이션을 거부할 가능성이 높습니다).
3. **Simulate**를 선택합니다.
4. **Gas used**, **Suggested gas limit**, **Balance changes**(주소, 단위, 변동), 그리고 접을 수 있는 목록의 **Events**를 읽습니다.
5. 체인이 거부하면 페이지가 "The chain refused the simulation" 아래에 **Code**, **Codespace**, **Log**를 보여줍니다.

먼저 서명된 바이트가 필요합니다: SDK나 `qorechaind`로 구성하고 서명하세요([포스트 양자 서명](/developer-guide/post-quantum-signing) 참고). **최소 예제:** 테스트넷에서 SDK로 작은 송금에 서명하고, base64 `TxRaw`를 붙여넣고, **Simulate**를 선택한 뒤, 브로드캐스트하기 전에 권장 가스 한도를 확인합니다.

### Signing playground (테스트넷 전용) {#signing-playground}

**기능.** 일회용 하이브리드 키를 생성하고 브라우저에서 메시지와 Sign In With QoreChain 요청에 서명하고 검증할 수 있습니다.

**작동 방식.** 24단어 구문이 페이지에서 생성되어 메모리에만 보관됩니다. [QoreSign](/qoresign/overview)이 이로부터 secp256k1 키와 ML-DSA-87 키를 파생합니다. 서명은 체인 `qorechain-diana`에 대해 같은 메시지를 두 키로 모두 서명합니다. 일회용 키는 체인에 등록되어 있지 않으므로, 검증에는 이 세션의 ML-DSA-87 공개 키가 사용됩니다.

**단계.**

1. **Signing playground**를 엽니다. "Throwaway testnet key: never use it for real funds."라는 경고가 표시됩니다.
2. **Generate throwaway key**를 선택합니다. 페이지에 `qor1...` 주소, secp256k1 공개 키(33바이트), ML-DSA-87 키(공개 키 2592바이트, 비밀 키 4896바이트)가 표시됩니다. **New key**로 교체합니다.
3. **Message:** 텍스트를 입력하고 **Sign**을 선택합니다. 결과는 JSON 형태의 하이브리드 서명입니다. **Verify**를 선택하면 페이지에 "Valid signature", 또는 오류 코드와 함께 "Invalid signature"가 표시됩니다.
4. **Sign In With QoreChain:** **Build message**(도메인, 주소, 체인 ID, 임의의 nonce, 발급 및 만료 시각이 포함된 이 사이트용 로그인 메시지)를 선택한 다음 **Sign**, 그리고 **Verify**를 선택합니다. Verify는 서버가 하는 방식대로 이를 확인하고 파싱된 필드를 나열합니다. [SIWQ 사양](/qoresign/spec/siwq-v1)과 [로그인 가이드](/qoresign/guides/sign-in)를 참고하세요.

**최소 예제.** **Generate throwaway key**, `hello` 입력, **Sign**, **Verify**: 페이지에 "Valid signature"가 표시됩니다.

**네트워크.** 테스트넷 전용이며, 키는 메인넷에서 사용할 수 없고 새로고침하면 사라집니다.

### QoreX test wallet (테스트넷 전용) {#test-wallet}

**기능.** 현재 탭에 QoreX 지갑의 모의 버전을 설치하여 실제 지갑 없이 dApp의 연결 및 서명 흐름을 시험해 볼 수 있습니다.

**작동 방식.** **Start test wallet**은 일회용 키로 테스트 지갑을 만들고(게시된 `@qorechain/qorex-wallet-mock` 패키지), 브라우저 지갑용 표준 지갑 검색(EIP-6963)을 통해 페이지의 dApp에 "QoreX (mock)"로 알리며, `window.qorex`도 노출합니다. 아무것도 자동으로 승인되지 않습니다. 트랜잭션을 브로드캐스트하지 않습니다. 탭에 실제 QoreX 확장 프로그램이 있으면, 다시 로드할 때까지 모의 지갑이 그것을 대체합니다.

**단계.**

1. **QoreX test wallet**을 열고 경고를 읽어보세요: 시작할 때마다 일회용 테스트넷 키가 메모리에 생성되며, 실제 자금을 보내지 마세요.
2. **Start test wallet**을 선택합니다. **Addresses** 카드에 QoreChain Native, EVM, SVM 주소가 나열됩니다.
3. 이 탭에서 실행 중인 dApp에서 연결하거나, 브라우저 콘솔에서 `window.qorex`를 호출하세요.
4. 각 요청은 **Waiting for approval** 아래에 표시됩니다. **Approve** 또는 **Reject**를 선택하세요. **Requests** 목록에는 모든 요청이 승인 상태와 결과와 함께 기록됩니다.
5. **Stop (reloads the page)**를 선택하면 모의 지갑이 제거됩니다.

**최소 예제.** 테스트 지갑을 시작하고, 같은 탭에서 dApp을 열고, 연결 대화상자에서 "QoreX (mock)"를 선택한 뒤 연결을 **Approve**합니다.

**네트워크.** 테스트넷 전용.

### AI agents (MCP) {#mcp}

**기능.** QoreChain MCP 서버(MCP 클라이언트가 QoreChain 체인 데이터를 읽고 개발자 도구를 사용할 수 있게 해 주는 Model Context Protocol 서버)의 상태와 MCP 클라이언트에서의 설정 방법을 보여줍니다.

**작동 방식.** 탭을 열면 페이지가 패키지 레지스트리에 실시간으로 질의하여 현재 버전과 함께 상태(**Published**)를 보여줍니다(`@qorechain/mcp`, 작성 시점에는 0.1.0이며 PyPI에도 `qorechain-mcp`로 게시되어 있습니다). 이어서 MCP 클라이언트용 설정을 복사 가능한 블록으로 보여줍니다:

- **로컬(stdio), 기본 옵션.** `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }`를 MCP 클라이언트의 서버 구성에 추가합니다. 키가 필요 없습니다.
- **자체 호스팅(Streamable HTTP).** `qorechain-mcp serve --port 8787`을 실행하고 클라이언트가 `http://localhost:8787/mcp`를 가리키게 합니다.
- **호스팅 엔드포인트.** `https://mcp.qorechain.io/mcp`는 기본적으로 테스트넷을 제공합니다. 모든 요청에는 `Authorization: Bearer <key>` 헤더로 보내는 API 키가 필요합니다. 대시보드에서 키를 요청하세요(아래 키 흐름 참고). 대부분의 용도에서는 로컬 설정에 키가 필요하지 않습니다.

**호스팅 엔드포인트용 API 키.** 로그인한 다음 탭의 **API key** 섹션에서 진행합니다:

1. 이름 또는 조직, 연락처, 사용 목적, 예상 사용량을 입력한 다음 **Request API key**를 누릅니다. 상태가 "승인 대기 중"으로 표시됩니다.
2. QoreChain 팀이 요청을 승인하거나 거절합니다. 거절되면 그 사유 메모가 표시되며, 다시 요청할 수 있습니다.
3. 승인되면 **Generate key**를 누릅니다. 키는 한 번만 표시되며, 복사 버튼과 바로 사용할 수 있는 구성 스니펫이 함께 제공되고, 1~2분 이내에 활성화됩니다. QoreChain은 키의 사본을 보관하지 않고 지문(해시)만 보관하므로, 분실한 키는 다시 표시할 수 없습니다. 키를 폐기하고 새로 요청하세요.
4. **Revoke key**는 언제든지 사용할 수 있으며 약 1분 안에 적용됩니다.

제한: 계정당 활성 키 1개, 초당 요청 10회(버스트 20), 하루 요청 100,000회.

**단계.** 탭을 열고, 로컬 구성을 MCP 클라이언트에 복사한 뒤 클라이언트를 다시 시작하고, 블록이나 계정을 읽어 달라고 요청합니다. 도구 세부 정보와 옵션은 [QoreChain MCP 서버](/developer-tools/mcp)를 참고하세요. **최소 예제:** stdio 블록을 클라이언트에 붙여 넣고, 다시 시작한 뒤, 최신 블록을 요청합니다.

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), 또는 사이드바 **Build** 그룹(및 모바일 메뉴)의 **Developers**.
- **로그인:** 페이지와 그 도구에는 필요 없습니다. 호스팅 MCP 엔드포인트용 API 키를 요청하려면 로그인이 필요합니다.
- **네트워크:** **PQ key status**와 **Simulator**는 탭의 토글을 통해 메인넷 또는 테스트넷에서 작동합니다(기본값 테스트넷). **Signing playground**와 **QoreX test wallet**은 테스트넷 전용입니다. **SDKs**와 **AI agents (MCP)**는 네트워크에 의존하지 않습니다.
- **지갑:** 필요 없습니다. 도구가 자체적으로 일회용 키를 생성합니다.
- **비용:** 무료입니다. 읽기 쿼리와 시뮬레이트 호출 외에는 체인으로 아무것도 전송되지 않습니다.
- **개인정보 보호:** 일회용 키는 페이지의 메모리에만 존재합니다. 실제 복구 구문을 어떤 도구에도 붙여넣지 마세요.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 |
| --- | --- | --- |
| Developers 페이지 | `dashboard.qorechain.io/developers` | 메인넷과 테스트넷 읽기 도구, 테스트넷 전용 서명 도구 |
| 서명 라이브러리 | npm `@qorechain/qoresign`, 소스 `github.com/qorechain/qoresign`, [QoreSign](/qoresign/overview) 참고 | 해당 없음 |
| 테스트 지갑 패키지 | npm `@qorechain/qorex-wallet-mock`, 소스 `github.com/qorechain/qorex-integrations` | 테스트넷 |
| 패키지 색인 | [개발자 패키지](/developer-tools/overview) | 해당 없음 |
| MCP 서버 | npm `@qorechain/mcp` 0.1.0과 `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0, 가이드: [QoreChain MCP 서버](/developer-tools/mcp) | 기본값 테스트넷 |

패키지 버전은 바뀝니다. 현재 버전은 **SDKs** 탭이나 각 레지스트리에서 확인하세요.

## 제한 사항 및 알려진 문제 {#limits}

- **Transaction inspector: 예정, 아직 라이브가 아닙니다.** 계획: 해시를 붙여넣으면 모든 메시지, 서명자, 수수료, 포스트 양자 서명이 서명자의 등록된 키에 대해 검증되는지 여부, 그리고 보안 등급을 볼 수 있습니다. 다음 QoreSign 릴리스와 함께 제공됩니다.
- **호스팅 MCP 엔드포인트에는 API 키가 필요합니다.** 대시보드에서 요청하세요(계정당 활성 키 1개, 초당 요청 10회, 하루 100,000회). 로컬 설정에는 키가 필요 없습니다. 대부분의 작업에는 로컬 설정을 사용하세요.
- **두 개의 퀵스타트가 "Not tested"로 표시됩니다:** Android용 QoreSign(같은 코드를 JVM 아티팩트에서만 실행했고 실제 기기에서는 실행하지 않았습니다)과 Python용 QoreSign. 나머지 32개의 퀵스타트 항목은 실행되어 통과했습니다.
- **시뮬레이터는 서명된 바이트가 필요합니다.** 대신 서명해 주지 않으며 브로드캐스트하지 않습니다.
- **플레이그라운드와 테스트 지갑은 테스트넷 전용**이며 새로고침하면 사라지는 일회용 키를 사용하고, 실제 자금을 보유하거나 이동할 수 없습니다.
- **같은 탭의 실제 QoreX 확장 프로그램은 대체됩니다.** 다시 로드할 때까지 테스트 지갑이 그 자리를 차지합니다.
- **읽기는 Dashboard의 게이트웨이를 거칩니다.** 자체 코드에서는 공개 엔드포인트를 직접 호출하세요: `api.qore.host`와 `api-testnet.qore.host`.
