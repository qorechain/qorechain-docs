---
slug: /developer-tools/overview
title: 개발자 패키지
sidebar_label: 개요
sidebar_position: 1
---

# 개발자 패키지

QoreChain은 개발자 도구를 공개 레지스트리(npm, PyPI, crates.io, Go 모듈 프록시, Maven Central, Swift Package Manager)에 작은 패키지로 게시합니다. 이 페이지는 색인입니다. 각 패키지의 용도, 정확한 레지스트리 이름, 언어, 현재 버전, 설치 명령, 상태, 그리고 사용법을 읽을 수 있는 위치를 안내합니다. QoreChain 위에서 dApp, 지갑, 백엔드, 롤업을 만들며 가이드를 읽기 전에 알맞은 패키지를 고르려는 개발자를 위한 페이지입니다.

표의 버전은 2026년 11월 4일에 레지스트리에서 읽은 값입니다. 메인넷 `qorechain-vladi`는 v3.2.6을 실행합니다(2026년 11월 4일 적용, v3.2.5는 10월 29일). 테스트넷 `qorechain-diana`는 10월 27일에 v3.2.6을, 2026년 11월 6일에 v3.2.7을, 11월 12일에 v3.2.8을 적용했으며, v3.2.7과 v3.2.8은 메인넷에 없고 그곳의 날짜도 없습니다. 해당 페이지에 명시되어 있지 않은 한, 이 표의 어떤 패키지에도 v3.2.7 메시지용 빌더는 없습니다. 게시된 것으로 표시된 모든 패키지는 Apache-2.0 라이선스입니다.

## 혁신 {#innovations}

- **모든 언어에서 하나의 하이브리드 서명 형식.** 체인은 네이티브 레인 트랜잭션에 secp256k1 서명과 ML-DSA-87(FIPS 204) 서명을 함께 요구합니다. QoreSign은 공개된 테스트 벡터를 TypeScript, Rust, Go, Swift, Kotlin, Python에서 바이트 단위로 동일하게 재현하며, `qorechain-pqc`는 여섯 개 바인딩에서 하나의 공유 벡터 세트를 실행하므로, 한 언어에서 만든 키나 서명은 다른 언어에서도 검증됩니다.
- **추측이 아니라 체인 상태에서 정하는 서명 바이트 형식.** SDK, 지갑 어댑터, `chain-bridge`, QoreSign 네트워크 헬퍼는 두 업그레이드 이름(`v3.2.0`과 `v3.1.98`) 모두에 대해 노드에 `GET /cosmos/upgrade/v1beta1/applied_plan/{name}`을 요청하고, 둘 중 하나의 높이가 0보다 크면 v2 형식으로 서명합니다. 이 두 체인에서 REST 엔드포인트가 없으면 추측하지 않고 오류를 발생시킵니다. 두 네트워크는 현재 모두 v2를 검증합니다(2026년 10월 27일 확인: `v3.2.0`은 메인넷 높이 2,981,742에서, `v3.1.98`은 테스트넷 높이 5,746,000에서 적용됨).
- **작성만 한 것이 아니라 실제로 실행한 퀵스타트.** 퀵스타트가 있는 패키지는 공개 레지스트리에서 설치한 뒤 예제를 실행했습니다(2026년 10월 27일부터 29일). 매니페스트의 45개 퀵스타트 항목 중 43개가 실행되어 통과했으며, 실행하지 못한 두 가지는 Android 예제입니다([제한 사항](#limits) 참조).
- **표 뒤에 있는 하나의 매니페스트.** 이 페이지의 패키지 이름, 버전, 설치 명령은 패키지별 실시간 버전 엔드포인트를 갖춘 단일 기계 판독 매니페스트에서 가져옵니다. [대시보드 개발자 페이지](/dashboard/developers#sdks)의 SDK 허브도 같은 데이터로 만들어집니다.

## 사용 방법 {#how-to-use}

만들고 있는 것에 따라 고르세요.

| 하려는 일 | 사용할 것 | 읽을 문서 |
|---|---|---|
| 체인 상태 읽기, 계정 파생, 스크립트나 dApp에서 하이브리드 서명 트랜잭션 보내기 | QoreChain SDK | [SDK 개요](/sdk/overview), [설치](/sdk/install), [퀵스타트](/sdk/quickstart) |
| 자체 지갑이나 백엔드에서 서명, 서명 검증, Sign In With QoreChain | QoreSign | [QoreSign 개요](/qoresign/overview), [퀵스타트](/qoresign/quickstart) |
| Keplr, Leap, Cosmostation에 QoreChain 추가, 통합 지갑 생성, EVM 윈도우 및 연결된 키 메시지 구성 | 지갑 어댑터 | [지갑 어댑터](/developer-tools/wallet-adapter) |
| QOR 전송, 키 등록, 컨트랙트 배포를 수행하는 서버 작업 실행 | 체인 브리지(또는 SDK) | [체인 브리지와 handle](/developer-tools/chain-bridge) |
| `@handle`을 검증된 주소로 해석 | Handles | [체인 브리지와 handle](/developer-tools/chain-bridge#handles) |
| dApp에서 QoreX 지갑 사용, 또는 확장 프로그램 없이 테스트 | QoreX 통합 | [QoreX 통합](/developer-tools/qorex-integrations), [개발자를 위한 QoreX](/qorex/overview#developers) |
| 애플리케이션 롤업 생성 및 운영 | RDK | [롤업 개요](/rollups/overview), [롤업 배포](/rollups/deploying-a-rollup) |
| 포스트 퀀텀 프리미티브(ML-DSA, ML-KEM, SHAKE-256)만 단독으로 사용 | `qorechain-pqc` | [포스트 퀀텀 서명](/developer-guide/post-quantum-signing) |
| AI 에이전트나 개발자 도구가 체인을 읽게 하기(블록, 트랜잭션, 계정, 하이브리드 서명 상태, 시뮬레이션, 서명되지 않은 전송) | QoreChain MCP 서버 | [QoreChain MCP 서버](/developer-tools/mcp) |
| 터미널이나 셸 스크립트에서 JSON 출력으로 체인 읽기 | `qore` CLI | [QoreChain CLI](/developer-tools/qore-cli) |
| 커밋된 트랜잭션이 어떻게 보호되었는지 다시 읽기(메시지, 서명자, 수수료, ML-DSA-87 계층, 티어) | QoreSign 트랜잭션 인스펙터(`inspectTransaction`) | [QoreSign 개요](/qoresign/overview#inspector) |
| ML-KEM-1024로 QoreChain 계정, 비공개 그룹, 사이드체인에 데이터를 암호화 | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| 포스트 퀀텀 라이트 클라이언트 설계(체크포인트 검증) 검토 또는 테스트 | PQ 라이트 클라이언트 | [PQ 라이트 클라이언트](/developer-tools/pq-light-client) |
| QoreChain을 수탁 기관이나 거래소로서 통합(주소 검사, 출금 검증, 입금 반영) | 커스터디 키트 | [커스터디 키트](/developer-tools/custody-kit) |
| 노드, 네트워크, Solidity 소스의 암호화 자산을 CycloneDX CBOM으로 목록화 | QoreScan | [QoreScan](/developer-tools/qorescan) |
| 테스트넷에서 허가형 실물 자산 토큰 프로토타입 제작(ERC-3643, CMTAT, 지분 제한 볼트, 포스트 퀀텀 보유자 검사) | Asset Kit | [Asset Kit](/developer-tools/asset-kit) |
| Foundry, Hardhat, viem으로 QoreChain에서 Solidity 또는 CosmWasm 프로젝트를 빌드하고 테스트 | 체인 개발자 키트(SDK 0.13.0에 포함) | [체인 개발자 키트](/developer-tools/chain-dev-sdk) |

패키지 하나를 설치하고 먼저 공개 테스트넷에서 퀵스타트를 실행해 보세요. 읽기에는 계정도, 키도, 수수료도 필요하지 않습니다.

## 접근 방법 {#how-to-access}

| | 테스트넷 | 메인넷 |
|---|---|---|
| 체인 ID | `qorechain-diana` | `qorechain-vladi` |
| EVM 체인 ID | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| 합의 RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **계정과 키:** 읽기에는 필요하지 않습니다. 보내려면 QOR이 있는 계정이 필요하며(테스트넷 QOR은 [Faucet](/dashboard/faucet)에서 받습니다), 네이티브 레인에서는 그 계정에 등록된 ML-DSA-87 키가 필요합니다.
- **비용:** 패키지는 무료입니다. 트랜잭션은 네트워크 수수료를 지불하며, 수수료 하한은 가스당 0.1 uqor입니다.
- **서명 규칙:** 네이티브 레인 트랜잭션은 하이브리드(secp256k1 + ML-DSA-87) 서명을 포함해야 합니다. EVM 트랜잭션은 등록된 ML-DSA-87 키가 있고 열려 있는 EVM 인가 윈도우가 있는 계정에서만 허용됩니다. SVM 읽기는 동작하며, SVM 트랜잭션은 아직 열려 있지 않습니다. [계정과 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요.
- **퀵스타트 관례:** 예제는 공개 테스트넷 faucet 계정을 읽고 공개 테스트 구문(`abandon` 11번 뒤에 `about`)으로 서명합니다. 그 구문에서 파생된 계정에는 절대 자금을 넣지 마세요. 어떤 퀵스타트도 트랜잭션을 보내지 않습니다.

### 대시보드 개발자 페이지 {#dashboard-developers}

대시보드에는 [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)에 공개 페이지가 있습니다. 2026년 10월 27일에 확인한 시점에 일곱 개의 탭이 있습니다(전체 안내: [개발자](/dashboard/developers)).

- **SDKs:** SDK 허브입니다. 매니페스트의 모든 패키지를 제품별로 묶어 보여주며, 언어 선택기, 각 레지스트리에서 실시간으로 읽은 최신 버전, 복사 버튼이 있는 설치 및 import 줄, SDK 팀이 관찰한 출력과 함께 제공되는 퀵스타트, 알려진 문제, 체인 ID와 공개 엔드포인트를 제공합니다. 게시되지 않은 패키지에는 설치 명령이 표시되지 않습니다.
- **트랜잭션 인스펙터:** 테스트넷 또는 메인넷의 64자리 16진수 트랜잭션 해시를 붙여 넣으면 상태, 서명자, 수수료, 포스트 양자 계층의 검증 여부, 보안 등급(PQC, Enrollment, SHAKE 또는 Classical)을 보여줍니다. QoreSign의 `inspectTransaction` 함수(0.1.1부터)를 사용합니다. [트랜잭션 인스펙터](/qoresign/overview#inspector)를 참고하세요.
- **PQ 키 상태:** 주소가 체인에 등록한 ML-DSA-87 키와 그 EVM 인가 윈도우를 테스트넷 또는 메인넷에서 읽습니다.
- **시뮬레이터:** 서명된 트랜잭션(base64 또는 hex `TxRaw`)을 시험 실행하여 가스 사용량과 잔액 변화를 보여줍니다. 아무것도 브로드캐스트되지 않습니다.
- **서명 플레이그라운드:** 테스트넷 전용. 브라우저에서 메모리에만 보관되는 일회용 하이브리드 키를 생성하여 메시지와 Sign In With QoreChain 요청에 서명하고 검증합니다.
- **QoreX 테스트 지갑:** 테스트넷 전용. 탭에 테스트 지갑(`window.qorex`, EIP-6963으로 "QoreX (mock)"로 알림)을 주입하여 dApp 흐름을 시험해 볼 수 있습니다.
- **AI 에이전트(MCP):** QoreChain MCP 서버의 상태(게시됨)와 MCP 클라이언트 설정입니다. 로컬 `npx`가 우선이며, API 키가 필요한 호스팅 테스트넷 엔드포인트도 있습니다. [QoreChain MCP 서버](/developer-tools/mcp)를 참고하세요.

같은 인스펙터 검사는 코드에서 QoreSign 0.1.1부터(TypeScript) 라이브러리 함수 `inspectTransaction`으로 사용할 수 있습니다. 아래의 표와 SDK 허브는 같은 패키지 데이터를 보여주며, 표는 2026년 11월 4일에 레지스트리와 대조해 확인했습니다.

## 게시 위치 {#where-published}

각 이름은 정확한 레지스트리 이름입니다. 패키지의 링크는 해당 레지스트리 페이지를 엽니다. "Published"는 표시된 버전을 지금 설치할 수 있다는 뜻입니다.

### QoreChain SDK {#group-sdk}

가이드: [SDK 개요](/sdk/overview), [설치](/sdk/install), [React 가이드](/sdk/guides/react), [CLI 레퍼런스](/sdk/reference/cli). 소스: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.13.0 | `npm install @qorechain/sdk` | Published |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.13.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Published. Provider, hooks, `ConnectButton`, PQC 상태 배지(`PqcStatusBadge`, 그리고 0.10.0부터 유지되는 `QuantumSafeBadge`) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.13.0 | `npm install @qorechain/evm viem` | Published. viem 체인 정의와 EVM 윈도우 헬퍼 포함([체인 개발자 키트](#group-chain-dev-sdk) 참조) |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.13.0 | `npm install @qorechain/svm @solana/web3.js` | Published. 라이브 네트워크에서는 읽기만 가능 |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.13.0 | `npx create-qorechain-dapp my-dapp` | Published. 템플릿 일곱 가지 |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.13.0 | `pip install qorechain-sdk` | Published |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.13.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Published |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.13.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0` | Published |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java (JDK 17+) | 0.13.0 | `implementation("io.github.qorechain:qorechain-sdk:0.13.0")` | Published (Maven Central, v0.13.0; JDK 17+, 2026년 11월 11일 확인) |

SDK 0.13.0은 2026년 11월 11일부터 현재 릴리스입니다(시드 경로 계정 헬퍼가 바뀌었으며, 이제 `QRC1` 복구 코드 또는 독립적인 32바이트 PQC 비밀이 필요합니다. 니모닉 계정, 서명, 체인 동작은 그대로입니다. [0.13.0의 변경 사항](/sdk/install#whats-new-0130) 참조). SDK 0.12.0은 2026년 10월 30일부터 현재 릴리스였습니다. 0.10.0과 비교하면 프리셋이 기본값으로 공개 엔드포인트를 사용하고(메인넷 `api.qore.host`, `rpc.qore.host`, `evm.qore.host`, 테스트넷은 `-testnet` 호스트이며, 이전의 기본값은 localhost였습니다), 로컬 프리셋의 체인 ID는 `qorechain-devnet`이고, 가스는 v3.2.5 이상 노드에서 정확하며(시뮬레이션 값에 1.02를 곱하고 2,000을 더함. 이전 노드에는 기존 경로가 유지됨), ML-KEM-1024 키 레지스트리를 지원하고(등록, 삭제, 그리고 `/qorechain/pqc/v1/kem/\{address\}` 조회), [체인 개발자 키트](#group-chain-dev-sdk)가 포함됩니다. 하이브리드 서명은 변경되지 않았습니다. Python, Rust, Go, Java 패키지는 0.10.0에서 곧바로 0.12.0이 되었고, npm 패키지 다섯 개에는 키트 내용을 담은 0.11.0(2026년 10월 29일)도 있었으나 0.12.0이 이를 대체합니다.

### QoreSign {#group-qoresign}

가이드: [QoreSign 개요](/qoresign/overview), [퀵스타트](/qoresign/quickstart), [테스트 벡터](/qoresign/vectors). 소스: [qorechain/qoresign](https://github.com/qorechain/qoresign). 버전 0.2.0은 2026년 11월 10일과 11일에 게시되었습니다(0.1.1은 2026년 10월 27일). Swift, Kotlin, Python 사용자는 패키지와 네이티브 라이브러리를 함께 업그레이드하세요. [0.2.0의 새로운 기능](/qoresign/overview#new-in-0-2-0)을 참고하세요. QoreSign은 로컬에서 서명하며, 사용자를 대신해 키를 보관하지 않고 임계값, MPC, 하드웨어 지갑 서명도 하지 않습니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.2.0 | `npm install @qorechain/qoresign` | Published. `inspectTransaction`과 `fetchEvmWindow` 포함(0.1.1부터)하며, 0.2.0에서 새로 `parseSiwqTimestamp`와 `fetchProtocolFeature` 추가 |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (`qoresign`으로 import) | 0.2.0 | `cargo add qorechain-qoresign` | Published |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.2.0 | `go get github.com/qorechain/qoresign/go@v0.2.0` | Published |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (`qoresign`으로 import) | 0.2.0 | `pip install qorechain-qoresign` | Published(Python은 0.1.1부터). macOS(arm64, x86_64)와 Linux(x86_64, aarch64)용 wheel 제공, Windows wheel은 아직 없음. 오프라인 함수만 제공 |
| `QoreSign` (Swift package) | Swift (iOS 16+, macOS 13+) | 0.2.0 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.2.0")`, product `QoreSign` | GitHub 릴리스로 게시됨. 바이너리 프레임워크가 여기서 다운로드됨 |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.2.0 | `implementation("io.github.qorechain:qoresign:0.2.0")` | Published (Maven Central, v0.2.0, 2026년 11월 11일 확인) |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.2.0 | `implementation("io.github.qorechain:qoresign-android:0.2.0")` | Published (Maven Central, v0.2.0, 2026년 11월 11일 확인). JVM 아티팩트와 동일한 API이며, 예제는 JVM 아티팩트에서만 실행했고 Android 기기에서는 실행하지 않음 |

Kotlin 및 Android 아티팩트를 사용하려면 프로젝트에 Kotlin 2.3 이상 컴파일러가 필요합니다. Kotlin 2.1 프로젝트는 이를 대상으로 컴파일에 실패합니다.

TypeScript 패키지에는 `@qorechain/qoresign/network` 하위 경로가 있고, Go 모듈에는 `inspectTransaction`과 `fetchEvmWindow`를 제외한 동일한 헬퍼가 있습니다: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`(잔액 변화 포함), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`(한 번 폴백하고 중단), `verifySiwqWithChain`, `verifyMessageWithChain`. Rust, Swift, Kotlin, Python 패키지에는 네트워크 코드가 없습니다.

### QoreSeal {#group-qoreseal}

페이지: [QoreSeal](/developer-tools/qoreseal). 소스: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0은 ML-KEM-1024(FIPS 203)로 QoreChain 계정, 비공개 그룹, 사이드체인에 데이터를 암호화합니다. 암호화는 오프라인에서 동작하며, 체인에서 수신자의 키를 읽으려면 KEM 키 레지스트리가 필요합니다. 이 레지스트리는 테스트넷에서 라이브이며 읽기 라우트는 v3.2.5(2026년 10월 29일 적용)부터 메인넷에서도 응답합니다(2026년 11월 4일 확인 시점에는 그곳에 게시된 키가 아직 없었습니다). 이 구성은 1.0 이전에 외부 검토를 기다리고 있습니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/qoreseal`](https://www.npmjs.com/package/@qorechain/qoreseal) | TypeScript (Node.js 20+) | 0.1.0 | `npm install @qorechain/qoreseal` | Published. `/network` 헬퍼 포함 |
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (`qoreseal`로 import) | 0.1.0 | `cargo add qorechain-qoreseal` | Published |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Published |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (`qoreseal`로 import) | 0.1.0 | `pip install qorechain-qoreseal` | Published. macOS(arm64, x86_64)와 Linux(x86_64, aarch64)용 wheel 제공, Windows wheel은 아직 없음 |
| `QoreSeal` (Swift package) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, product `QoreSeal` | GitHub 릴리스로 게시됨. 바이너리 프레임워크가 여기서 다운로드됨 |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Maven Central에 Published |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Maven Central에 Published |

### PQ 라이트 클라이언트 {#group-pq-light-client}

페이지: [PQ 라이트 클라이언트](/developer-tools/pq-light-client). 소스: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). ML-DSA-87로 서명된 체크포인트를 위한 명세 초안과 참조 검증기입니다. 메인넷이나 테스트넷에 연결되지 않습니다. QoreChain은 이 검증기가 확인하는 체크포인트를 생성하지 않으며 체인 지원도 예정되어 있지 않습니다. 시뮬레이션된 검증자 집합과 공유 테스트 벡터를 대상으로 실행됩니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Published. `@qorechain/pqc` 0.2.3에 의존 |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (라이브러리 `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Published |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (패키지 `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Published |

### 커스터디 키트 {#group-custody-kit}

페이지: [커스터디 키트](/developer-tools/custody-kit). 소스: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). 수탁 기관과 거래소를 위한 통합 가이드, 참조 코드, 테스트 벡터이며 TypeScript, Python, Go, Rust, Java로 제공됩니다. 읽고, 복사하고, 벤더링하는 참조 코드이지 패키지 세트가 아닙니다. 레지스트리 항목은 Go 모듈뿐입니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| GitHub release `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit` 후 사용하는 언어의 폴더를 빌드 | Published, 2026년 10월 27일. npm, PyPI, crates.io, Maven 패키지는 의도적으로 없음 |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (패키지 `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Published |

### QoreScan {#group-qorescan}

페이지: [QoreScan](/developer-tools/qorescan). 소스: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0은 QoreChain 배포의 암호화 자산(노드 홈 디렉터리, 라이브 네트워크 상태, TLS 엔드포인트, Solidity 소스)을 목록화하고 CycloneDX 1.6 CBOM과 Markdown 보고서를 작성합니다. 목록화를 돕는 도구이며 인증이나 감사가 아닙니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [GitHub release `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | macOS, Linux, Windows용 바이너리(amd64, arm64) | 0.1.0 | 다운로드한 뒤 `qorescan_0.1.0_checksums.txt`와 대조 | Published, 2026년 10월 27일 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | npm 래퍼 (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Published. 첫 실행 시 릴리스 바이너리를 다운로드하고 검사함 |
| [`qorescan`](https://pypi.org/project/qorescan/) | PyPI 래퍼 (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` 또는 `pip install qorescan` | Published. npm 래퍼와 동작이 같음 |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Published. Go 1.26 |

### Asset Kit {#group-asset-kit}

페이지: [Asset Kit](/developer-tools/asset-kit). 소스: [qorechain/qorechain-asset-kit](https://github.com/qorechain/qorechain-asset-kit). QoreChain Asset Kit 0.1.0은 허가형 실물 자산 토큰을 위한 오픈 소스 도구입니다. EVM 컨트랙트(ERC-3643 모듈, CMTAT 규칙, 등록된 ML-DSA-87 키를 요구하는 가드 위에 구성된 지분 제한 볼트), Foundry 배포 스크립트, 발행자 콘솔과 함께, 클라이언트(TypeScript, Python, Go, Java)를 제공하며, 이 클라이언트는 네이티브 모듈(`x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`)의 **제안**을 위한 것입니다. 이 제안은 일정이 잡혀 있지 않으며 어느 네트워크에도 존재하지 않습니다. 컨트랙트는 테스트넷에서만 동작합니다. `0x0A02` 프리컴파일은 메인넷에서 활성화되어 있지 않으며, 메인넷에서 가드는 fail closed로 동작합니다. 1.0 이전 버전이고 감사를 받지 않았습니다. 저장소의 법률 템플릿은 검토되지 않은 초안이며 법률 자문이 아닙니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [GitHub release `v0.1.0`](https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0) | Solidity 컨트랙트, 발행자 콘솔, protos, 문서 | 0.1.0 | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` 또는 `forge install qorechain/qorechain-asset-kit@v0.1.0` | Published. 컨트랙트와 콘솔은 저장소에서 사용함 |
| [`io.github.qorechain:asset-kit`](https://central.sonatype.com/artifact/io.github.qorechain/asset-kit) | Java 17 (제안용 클라이언트) | 0.1.0 | `implementation("io.github.qorechain:asset-kit:0.1.0")` | Published |
| [`github.com/qorechain/qorechain-asset-kit/clients/go`](https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go) | Go (패키지 `assetkit`, 제안용 클라이언트) | v0.1.0 | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` | Published |
| [`@qorechain/asset-kit`](https://www.npmjs.com/package/@qorechain/asset-kit) | TypeScript (제안용 클라이언트) | 0.1.0 | `npm install @qorechain/asset-kit` | Published |
| [`qorechain-asset-kit`](https://pypi.org/project/qorechain-asset-kit/) | Python 3.10+ (제안용 클라이언트, `qorechain_asset_kit`로 import) | 0.1.0 | `pip install qorechain-asset-kit` | Published |

### 체인 개발자 키트 (SDK 0.13.0) {#group-chain-dev-sdk}

페이지: [체인 개발자 키트](/developer-tools/chain-dev-sdk). 소스: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). Solidity 및 스마트 컨트랙트 팀을 위한 QoreChain SDK의 일부입니다. `@qorechain/evm`의 viem 체인 정의와 EVM 인가 윈도우 헬퍼, `create-qorechain-dapp` 템플릿 네 가지(Foundry, Hardhat 3, wagmi를 쓰는 viem, QoreChain Native 토큰), EVM 퀵스타트, 그리고 QoreChain EVM이 Ethereum과 어떻게 다른지 설명하는 페이지로 구성됩니다.

**라이브이며 SDK 0.13.0에 포함되어 있습니다**(0.12.0부터): 별도의 패키지는 없습니다. [SDK 표](#group-sdk)의 패키지를 설치하세요(체인 정의와 윈도우 헬퍼는 `@qorechain/evm` 0.13.0, 템플릿은 `create-qorechain-dapp` 0.13.0). 키트 내용은 npm에 0.11.0(2026년 10월 29일)으로 처음 나타났으며, 0.12.0이 이를 대체합니다.

### 롤업 개발 키트 (RDK) {#group-rdk}

가이드: [롤업 개요](/rollups/overview), [롤업 배포](/rollups/deploying-a-rollup), [롤업 개발 키트 아키텍처](/architecture/rollup-development-kit). 소스: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.8.0 | `npm install @qorechain/rdk` | Published. `pqcKeypair`를 전달하면 하이브리드로 서명하며, 읽기에는 키가 필요 없음 |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.8.0 | `npm install -g @qorechain/rdk-cli` | Published. 0.6.2부터 npm bin 링크를 통해 실행됨(0.6.1 이전은 아무것도 출력하지 않았음). 0.7.1부터 트랜잭션 명령은 사용자의 포스트 퀀텀 키를 확인하면 하이브리드로 서명함(0.7.0 이전은 클래식 서명만 했고 네트워크가 이를 거부함) |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.8.0 | `npx create-qorechain-rollup my-rollup` | Published |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, `qorrdk`로 import) | 0.8.0 | `pip install qorechain-rdk` | Published. 읽기는 동작하며, 0.8.0부터 트랜잭션은 포스트 퀀텀 키 쌍을 전달하면 하이브리드로 서명함(이전 버전은 클래식 서명만 했음) |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.8.0 | `cargo add qorechain-rdk` | Published. 읽기는 동작하며, 0.8.0부터 트랜잭션은 포스트 퀀텀 키 쌍을 전달하면 하이브리드로 서명함(이전 버전은 클래식 서명만 했음) |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.8.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.8.0` | Published. 읽기는 동작하며, 0.8.0부터 트랜잭션은 포스트 퀀텀 키 쌍을 전달하면 하이브리드로 서명함(이전 버전은 클래식 서명만 했음) |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (Java 21+) | 0.8.0 | `implementation("io.github.qorechain:qorechain-rdk:0.8.0")` | Published. 읽기는 동작하며, 0.8.0부터 트랜잭션은 포스트 퀀텀 키 쌍을 전달하면 하이브리드로 서명함(이전 버전은 클래식 서명만 했고 Java 17이 필요했음) |

### 포스트 퀀텀 프리미티브 (`qorechain-pqc`) {#group-pqc}

가이드: [포스트 퀀텀 서명](/developer-guide/post-quantum-signing). 소스: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). ML-DSA 서명은 모든 바인딩에서 기본적으로 결정적이며, hedged 서명은 명시적으로 선택해야 합니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Published |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Published. liboqs가 필요하며, 없으면 첫 import 때 빌드함(git, CMake, C 컴파일러 필요) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Published |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Published |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Published |
| C 라이브러리 | C | 0.2.3 | 저장소의 `c/`를 빌드 (liboqs와 OpenSSL 필요) | 소스만 제공, 패키지 레지스트리 없음 |

### 지갑 어댑터 {#group-wallet-adapter}

페이지: [지갑 어댑터](/developer-tools/wallet-adapter). 소스: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (ES module, 타입 정의가 포함된 순수 JavaScript) | 0.5.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Published. 테스트된 퀵스타트 없음 |

### 체인 브리지 {#group-chain-bridge}

페이지: [체인 브리지와 handle](/developer-tools/chain-bridge).

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (Node.js 서버) | 0.2.3 | `npm install @qorechain/chain-bridge` | Published. 테스트된 퀵스타트 없음. 레지스트리에 소스 저장소가 나열되어 있지 않음 |

### Handles {#group-handles}

페이지: [체인 브리지와 handle](/developer-tools/chain-bridge#handles).

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Published. 고정된 레지스트리 키에 대해 handle 해석을 검증합니다. 주소를 직접 고정하지는 않으며, 고정 저장소를 제공하고 언제 고정할지 결정하는 것은 호출자입니다. 테스트된 퀵스타트 없음. 레지스트리에 소스 저장소가 나열되어 있지 않음 |

### QoreX 통합 {#group-qorex}

가이드: [개발자를 위한 QoreX](/qorex/overview#developers). 소스: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). 여섯 개 모두 2026년 10월 27일에 게시되었습니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Published. QoreX를 찾음(EIP-6963 및 네이티브 provider) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Published |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Published |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Published. `@cosmos-kit/react` 2.24에서는 `throwErrors={false}`를 전달하세요. README 스니펫에는 빠져 있음 |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Published. 테스트넷에서 실제로 서명하는 테스트 지갑 |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Published. Playwright 픽스처. 확장 프로그램 모드는 현재 오류를 발생시킴 |

### Connect (지원 중단) {#group-connect}

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | 없음 | **지원 중단되었으며 더 이상 유지보수되지 않습니다.** 새 작업에는 사용하지 마세요. 아래 표와 같이 교체하세요 |

:::caution @qorechain/connect는 지원 중단되었습니다
`@qorechain/connect`는 npm에서 deprecated로 표시되어 있습니다. peer 범위가 `@qorechain/wallet-adapter` `^0.2.1`이어서 0.5.0을 포함하지 않으며, [EVM 인가 윈도우](/sdk/guides/evm#evm-window)를 열지 않으므로, 계정에 등록된 키와 열려 있는 윈도우가 생길 때까지 이를 통한 EVM 전송은 거부됩니다. 레지스트리 메타데이터에 나열된 저장소는 공개적으로 접근할 수 없습니다.
:::

| 필요한 것 | 대신 사용할 것 |
|---|---|
| QoreX 감지 (EVM, 네이티브, Solana) | `@qorechain/qorex-types` |
| RainbowKit과 wagmi를 쓰는 EVM dApp | `@qorechain/qorex-rainbowkit` |
| Cosmos dApp | `@qorechain/qorex-interchain-kit` (또는 `@qorechain/qorex-cosmos-kit`) |
| 자체 지갑이나 백엔드에서의 하이브리드 서명 | `@qorechain/qoresign` |

### QORel, IBC 릴레이어 {#group-qorel}

| 패키지 | 위치 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| QORel (`qorel`) | GitHub 릴리스 `qorel-v0.1.0`, Homebrew, 컨테이너 `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | 사전 릴리스로 게시됨. IBC v1만 지원, 테스트넷 전용. [QORel](/qorel/overview) 참조 |

### MCP 서버와 CLI {#group-mcp}

페이지: [QoreChain MCP 서버](/developer-tools/mcp), [QoreChain CLI](/developer-tools/qore-cli). 소스: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp)(공개). 둘 다 체인을 읽기만 하며 서명하거나, 키를 보관하거나, 브로드캐스트하지 않습니다. 2026년 10월 27일에 게시되었습니다.

| 패키지 | 언어 | 버전 | 설치 | 상태 |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (Node.js 서버, bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Published. stdio와 Streamable HTTP. 호스팅 엔드포인트 `https://mcp.qorechain.io/mcp`에는 대시보드에서 요청하는 API 키가 필요함 |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (또는 `uvx qorechain-mcp`) | Published. npm 패키지와 같은 도구. stdio 전용 |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Published. `--json` 출력은 MCP 도구 출력과 동일 |

### 아직 제공되지 않는 것 {#planned}

위에 나열된 모든 패키지는 게시되어 있습니다. 아직 제공되지 않는 것은 다음과 같습니다:

| 항목 | 상태 |
|---|---|
| Windows용 QoreSeal 및 QoreSign Python 휠 | 빌드되지 않음. macOS와 Linux 휠만 있음. 다른 플랫폼은 소스 배포판에서 빌드하며, 이때 Rust가 필요함 |
| Asset Kit 네이티브 모듈(`x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`) | 제안 단계. 어느 네트워크에도 존재하지 않으며 이를 추가하는 업그레이드도 예정되어 있지 않음 |
| QoreX synpress 확장 프로그램 모드 | 현재는 예외를 던짐(QoreX 통합 표 참조) |

## 실시간 버전 확인 방법 {#live-versions}

표는 특정 시점의 스냅샷입니다. 패키지의 현재 버전을 직접 읽으려면:

| 레지스트리 | 요청 | 필드 |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (`User-Agent` 헤더를 보내지 않으면 요청이 거부됨) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (앞의 `v` 제거) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (앞의 `v` 제거). 인증 없는 GitHub 호출은 주소당 시간당 60회로 제한됨 |

스코프가 있는 npm 이름은 `@`를 유지하세요. 예: `https://registry.npmjs.org/@qorechain/sdk/latest`. 404는 패키지가 게시되지 않았다는 뜻입니다. Go 프록시는 릴리스 직후 잠시 동안 캐시에서 `@latest`를 응답할 수 있으므로, 특정 버전이 필요하면 명령에 버전을 고정하세요(위의 RDK Go 설치가 그렇게 합니다). 레지스트리의 각 패키지 페이지에서도 버전과 릴리스 이력을 볼 수 있습니다.

## 제한 사항 및 알려진 문제 {#limits}

- **두 라이브 네트워크, 두 개의 체인 버전.** 메인넷은 v3.2.6을 실행하고(2026년 11월 4일부터), 테스트넷은 v3.2.8을 실행합니다(2026년 11월 12일부터). 테스트넷에만 있는 기능(예: EVM PQC 프리컴파일)은 해당 페이지에 표시됩니다.
- **아직 라이브가 아닌 것:** Asset Kit 네이티브 모듈(일정이 잡혀 있지 않은 제안), QoreSign 및 QoreSeal Python 패키지의 Windows 휠, SVM 트랜잭션, 메인넷의 EVM 프리컴파일(테스트넷에서만 활성. 레인별 목록은 [SDK 개요](/sdk/overview) 참조).
- **QoreSeal 레지스트리와 PQ 라이트 클라이언트.** 체인에서 읽은 주소로 암호화하려면 KEM 키 레지스트리가 필요하며, 이는 테스트넷에서 라이브이며 읽기 라우트는 v3.2.5부터 메인넷에서도 응답합니다(2026년 11월 4일에 다시 확인: 메인넷에 게시된 키는 없었습니다). PQ 라이트 클라이언트는 어느 네트워크에도 연결되지 않으며, 해당 체크포인트에 대한 체인 지원은 예정되어 있지 않습니다.
- **Kotlin 2.3 이상.** QoreSign과 QoreSeal의 Kotlin 및 Android 아티팩트에는 Kotlin 2.3 이상 컴파일러가 필요합니다. Kotlin 2.1은 이를 대상으로 컴파일에 실패합니다.
- **Windows wheel 없음.** QoreSign과 QoreSeal Python 패키지의 wheel은 macOS와 Linux용만 있으며, 다른 플랫폼은 소스 배포본에서 빌드하고 이때 Rust가 필요합니다.
- **실행하지 않은 예제:** 매니페스트의 45개 퀵스타트 항목 중 43개가 실행되어 통과했습니다(2026년 10월 27일부터 29일). 두 Android 예제(QoreSign과 QoreSeal)는 JVM 아티팩트 예제와 코드를 공유하며 기기에서 실행하지 않았습니다. 지갑 어댑터, 체인 브리지, handles, MCP 서버, CLI에는 퀵스타트 항목이 없으므로, 이 매뉴얼의 해당 예제는 패키지 타입 정의와 소스에서 가져온 것이며 끝까지 실행하지 않았습니다.
- **0.6.2 이전의 `@qorechain/rdk-cli`**는 npm bin 링크로 시작하면 아무것도 출력하지 않았고, `--version`은 0.4.1을 출력했습니다. **0.7.0 이전의 `@qorechain/rdk`**는 체인에서 한 번도 검증되지 않는 출금 증명을 만들었습니다. 0.8.0을 사용하세요.
- **cosmjs 버전 충돌.** `@qorechain/wallet-adapter`와 `@qorechain/chain-bridge`는 cosmjs 0.32를 사용하고, SDK는 cosmjs 0.39를 사용합니다. 한 프로젝트에 어댑터를 SDK와 함께 설치하면 npm이 `ERESOLVE`를 보고합니다. 별도의 프로젝트로 유지하거나 `--legacy-peer-deps`를 전달하세요.
- **이전 RDK 릴리스의 중첩된 SDK 사본.** `@qorechain/rdk` 0.6.2 이하는 `@qorechain/sdk` `^0.9.0`에 의존했으므로, SDK 0.10.0을 쓰는 앱에는 두 번째로 중첩된 SDK 0.9.x 사본이 생겼습니다. 0.7.0부터 키트는 `@qorechain/sdk` `^0.10.0`에 의존하며 하나의 사본을 공유합니다. **`@qorechain/rdk` 0.8.0은 여전히 `@qorechain/sdk` `^0.10.0`에 의존하므로**, SDK 0.12.0을 쓰는 앱이 이를 설치하면 중첩된 SDK 0.10.0(그리고 `@qorechain/evm` 0.8.0)도 함께 설치됩니다. 0.x 버전의 캐럿 범위는 더 새로운 마이너 버전을 받지 않습니다(2026년 11월 4일 `npm ls`로 확인).
- **0.8.0 이전의 클래식 서명 전용 RDK 클라이언트.** 0.8.0 이전의 Python, Rust, Go, Java RDK 클라이언트는 클래식 서명만 하며, 네이티브 레인은 두 네트워크 모두에서 이를 거부합니다(`qorollup`도 0.7.1 이전에는 그랬습니다). 포스트 퀀텀 키 쌍을 전달하면 다섯 가지 언어 모두에서 하이브리드로 서명하는 0.8.0으로 업그레이드하세요.
- **공개 소스 저장소가 없는 패키지.** `@qorechain/chain-bridge`와 `@qorechain/handles`는 레지스트리 메타데이터에 소스 저장소가 나열되어 있지 않습니다. 게시된 패키지 내용은 npm에서 읽을 수 있습니다.
- **Python `qorechain-pqc`**는 0.2.3에서 시드 기반 키 생성이 없으며 liboqs가 필요합니다.
