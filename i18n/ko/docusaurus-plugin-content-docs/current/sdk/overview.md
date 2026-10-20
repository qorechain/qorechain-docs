---
slug: /sdk/overview
title: QoreChain SDK 개요
sidebar_label: 개요
sidebar_position: 1
---

# QoreChain SDK

QoreChain SDK는 양자 내성(quantum-safe) 트리플 VM 레이어 1 네트워크인
**QoreChain** 위에서 탈중앙화 애플리케이션을 구축하기 위한 공식 다중 언어
개발자 키트입니다.

이 문서에서는 SDK 설치, 네트워크 연결, 온체인 상태 조회, 계정 파생, 트랜잭션
서명 및 전송, 그리고 QoreChain의 각 가상 머신을 다루는 방법을 설명합니다.

## QoreChain이란?

QoreChain은 하나의 체인 위에서 세 가지 일급(first-class) 스마트 컨트랙트
런타임을 제공하는 레이어 1 블록체인입니다:

- **CosmWasm** — Cosmos SDK 기반의 Wasm 스마트 컨트랙트.
- **QoreChain EVM Engine** — 이더리움 호환 실행 환경(Solidity, viem, 표준
  JSON-RPC).
- **SVM** — 솔라나 스타일 JSON-RPC를 갖춘 솔라나 호환 런타임.

계정, 잔액, 토큰은 모든 런타임에서 공유되며, 체인은 크로스체인 상호운용성을
위한 IBC 모듈을 포함합니다(메인넷과 테스트넷에는 아직 열려 있는 IBC 채널이
없습니다).

:::note 현재 라이브 네트워크에서 동작하는 것 (메인넷 v3.2.3, 테스트넷 v3.2.4)
**동작함:** 모든 레인에서의 읽기, 하이브리드 서명된 Native 트랜잭션, 통합
계정, [인가 윈도우](/sdk/guides/evm#evm-window) 안에서의 EVM 트랜잭션, 그리고
SVM 읽기.
**아직 사용 불가:** EVM 프리컴파일(비활성), `qor_` JSON-RPC 네임스페이스, SVM
트랜잭션, 메인넷에서의 크로스 VM 호출(`MsgCrossVMCall`은 서킷 브레이커로
꺼져 있음), 일반 계정의 CosmWasm 업로드 및 인스턴스화, 인증자 / 추상 계정
플로우(모듈 꺼짐), xQORE, 가스 추상화. 각 가이드는 해당되는 곳마다 이 주의
사항을 반복합니다.

게시된 SDK(0.9.0, 2026년 10월 21일)는 두 네트워크가 검증하는 형태(체인 상태로부터
결정되는 v2 하이브리드 sign-bytes)로 서명하며, 서명 형식, 주소, 소수 자릿수,
메모, 수수료는 v3.2.3이나 v3.2.4에서 바뀌지 않았습니다. 이후의 포스트 양자
규칙에 대한 클라이언트 측 지원(키 등록 시 소유 증명, 범위가 제한된 EVM 윈도우,
EIP-7702 동의 메시지)을 포함하며, 0.9.0 이전 버전은 포함하지 않습니다.
[0.9.0 이전 버전](/sdk/install#before-090)을 참고하세요.
:::

### 설계부터 양자 내성

QoreChain은 **ML-DSA-87**(Dilithium-5, FIPS 204)에 기반한 포스트 양자
암호(PQC) 프리미티브를 제공합니다. 고전적인 secp256k1 서명과 함께, 체인은
하나의 트랜잭션에 고전 서명과 포스트 양자 서명을 *모두* 담는 **하이브리드**
서명 방식을 지원하므로, 오늘날의 고전적 검증 아래에서 유효성을 유지하면서
동시에 포스트 양자 보호를 얻습니다.

SDK는 현재 ML-DSA-87 키 생성, 서명, 검증과 함께 하이브리드 트랜잭션을 위한
구성 요소를 제공합니다. 라이브 네트워크에서 Native 경로 트랜잭션은 반드시
하이브리드로 서명되어야 하며, 계정의 ML-DSA-87 키가 먼저 등록되어 있어야
합니다. 자세한 내용은
[계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참고하세요. 마케팅 문구가
아닙니다 — SDK는 체인이 실제로 구현한 프리미티브만을 정확히 노출합니다.

## 이 SDK가 다른 점

완전한 멀티체인 패리티를 넘어, 세 가지 기능은 다른 어떤 레이어 1에도 없는
프로토콜 기능 위에 구축되었기 때문에 **QoreChain에서만 가능합니다**:

- **AI 사전 위험 점수(pre-flight risk scoring)** — 브로드캐스트하기 전에
  온체인 AI로 트랜잭션을 스캔합니다. `simulateWithRiskScore`는 가스와 함께
  결정적 EVM 프리컴파일이 산출한 위험/이상 징후 판정을 반환하므로, 지갑이나
  dApp이 서명 *전에* 경고(또는 차단)할 수 있습니다. 프리컴파일은 아직
  메인넷이나 테스트넷에서 활성화되지 않았습니다.
  [AI 사전 점검](/sdk/guides/ai-preflight)을 참고하세요.
- **통합 크로스 VM 호출** — 하나의 계정, 세 개의 VM, 하나의 트랜잭션.
  `createCrossVMClient`는 어떤 VM의 컨트랙트든 호출하며, `callAtomic`은 여러
  크로스 VM 호출을 한 번의 서명으로 하나의 원자적 트랜잭션에 담습니다.
  [크로스 VM 호출](/sdk/guides/cross-vm)을 참고하세요.
- **양자 내성 DX** — 멱등성이 보장되는 단 한 번의 호출
  (`ensurePqcRegistered` / `migrateToHybrid`)로 서명자를 포스트 양자 보호
  상태로 만들 수 있으며, 바로 사용할 수 있는 React 배지도 제공됩니다.
  [양자 내성](/sdk/guides/quantum-safe)을 참고하세요.

0.6.0과 0.7.0에서는 체인 수준의 기능 두 가지가 더 추가되었습니다(두 번째
기능은 아래에 설명하듯 아직 라이브 네트워크에서 사용할 수 없습니다):

- **통합 eth-네이티브 계정** — 하나의 `eth_secp256k1` 키가 `qor1…`, `0x…`,
  그리고 SVM base58 주소로 표현되는 하나의 20바이트 아이덴티티이며, 모두
  하나의 잔액을 공유합니다.
  [통합 계정](/sdk/concepts/accounts-pqc#unified-accounts)을 참고하세요.
- **인증자(Authenticator) 레인** — Phantom 또는 MetaMask 키를 정식(canonical)
  PQC 필수 계정에 연결하고, 최소 권한·지출 한도·철회 가능 조건 아래 릴레이어를
  통해 지출하도록 할 수 있습니다. 그 뒤에 있는 `abstractaccount` 모듈은 현재
  두 네트워크 모두에서 꺼져 있습니다.
  [인증자 및 위임 지출](/sdk/guides/authenticators)을 참고하세요.

새로운 **`@qorechain/react`** 키트(프로바이더, 훅, `ConnectButton`,
`QuantumSafeBadge`)는 양자 내성 dApp 구축을 기본 경로로 만들어 줍니다 —
[React 키트 가이드](/sdk/guides/react)를 참고하세요. 전체적인 근거는
[왜 QoreChain SDK인가](/sdk/why)에서 확인하세요.

## SDK 제품군

SDK는 원하는 언어로 개발할 수 있도록 패키지 제품군으로 배포됩니다. 모든
패키지는 동일한 네트워크 프리셋, 파생 스킴, 단위(denomination) 계산, 조회
인터페이스를 공유합니다.

| 패키지 | 언어 | 설치 | 상태 |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | 게시됨 (npm, v0.9.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | 게시됨 (PyPI, v0.9.0) |
| `qorechain-sdk` (Go 모듈) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | 게시됨 (Go 프록시, 태그 `packages/go/v0.9.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | 게시됨 (crates.io, v0.9.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.9.0` | 게시됨 (Maven Central, v0.9.0) |
| `@qorechain/evm` | TypeScript (EVM 어댑터) | `npm i @qorechain/evm viem` | 게시됨 (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (SVM 어댑터) | `npm i @qorechain/svm @solana/web3.js` | 게시됨 (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (React 키트) | `npm i @qorechain/react` | 게시됨 (npm, v0.9.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | 게시됨 (npm, v0.9.0) |

> Python 배포판은 `qorechain-sdk`라는 이름으로 설치되지만 **`qorsdk`로
> import**합니다. 모든 클라이언트는 각 레지스트리에 게시되어 있습니다 —
> 언어별 명령어는 [설치](/sdk/install)를 참고하세요.

이 문서의 예제는 TypeScript 코어(`@qorechain/sdk`)를 기준으로 합니다.
Python, Go, Rust, Java 클라이언트는 TypeScript와 **완전한 네이티브 체인
패리티**를 달성했습니다: 네트워크 프리셋, denom/주소 유틸리티, HD 계정
파생(네이티브/EVM/SVM), PQC(ML-DSA-87) 서명, 모든 커스텀 모듈과 표준 Cosmos
모듈을 위한 타입 지정 메시지 컴포저, 타입 지정 쿼리 클라이언트, 완전한
트랜잭션 라이프사이클(자동 가스, 오류 디코딩, 트랜잭션 추적, 블록/트랜잭션
검색), 하이브리드 포스트 양자 트랜잭션, 그리고 WebSocket 구독까지
지원합니다. 이 모든 클라이언트는 **게시**되어 있습니다: TypeScript는
npm(`@qorechain/sdk` 0.9.0), Python은 PyPI(`qorechain-sdk` 0.9.0, import
`qorsdk`), Go는 모듈 프록시(태그 `packages/go/v0.9.0`), Rust는
crates.io(`qorechain-sdk` 0.9.0), Java는 Maven
Central(`io.github.qorechain:qorechain-sdk` 0.9.0)에 게시되어 있습니다.
EVM/SVM 실행 어댑터(`@qorechain/evm`, `@qorechain/svm`, 둘 다 0.8.0),
`@qorechain/react` 키트(0.9.0), `create-qorechain-dapp` 스캐폴딩 CLI(0.9.0)는
TypeScript 전용이며 마찬가지로 npm에 게시되어 있습니다. 부속 패키지는
[설치](/sdk/install#related-packages)를 참고하세요.

## 0.6, 0.7, 0.8, 0.9의 새로운 기능

**0.6.0 — 통합 eth-네이티브 계정 (체인 v3.1.83).** 하나의 `eth_secp256k1`
키가 세 가지 주소 인코딩 모두로 표현되는 하나의 20바이트 아이덴티티이며,
모든 레인에서 하나의 사용 가능한 잔액을 공유합니다:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

동일한 키로 네이티브 레인에서 서명하려면 `signClassicalEth` /
`signHybridEth`를 사용하며, Phantom 또는 MetaMask 키는 인증자로 계정에 연결합니다(Phantom 서명 기반
파생은 0.8.0에서 제거되었습니다). 기존 coin-type-118
`deriveNativeAccount`는 변경되지 않았습니다.
[통합 계정](/sdk/concepts/accounts-pqc#unified-accounts)을 참고하세요.

**0.6.1 — 컨센서스 크리티컬 수정.** `PQCHybridSignature` 트랜잭션 본문
확장이 이제 protobuf로 인코딩됩니다(이전에는 JSON으로 인코딩되어 CheckTx에서
거부되었습니다). SDK ≤ 0.6.0으로 만든 하이브리드 트랜잭션은 **온체인에서
거부됩니다** — 업그레이드하세요.

**0.7.0 — 인증자 레인 (체인 v3.1.85).** 그 뒤에 있는 `abstractaccount` 모듈은
현재 두 네트워크 모두에서 꺼져 있습니다([인증자 가이드](/sdk/guides/authenticators)
참고). 연결된 Phantom(ed25519) 또는
MetaMask(secp256k1, 20바이트 주소 기준) 키가 최소 권한·지출 한도·철회 가능
조건 아래 릴레이어를 통해 정식 PQC 필수 계정에서 지출할 수 있습니다:
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey` 컴포저, 바이트 단위로
정확한 `evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes` 헬퍼,
`permissionSchema` 쿼리, 디코딩된 오류 코드, 그리고 TypeScript 지갑
빌더(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …)를 제공합니다.
복사해 붙여넣을 수 있는 예제가 포함된 전체 안내:
[인증자 및 위임 지출](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — v2 하이브리드 sign-bytes와 EVM 인가 윈도우 (체인
v3.2.0).** 하이브리드 트랜잭션의 포스트 양자 부분은 이제 대상 네트워크가
검증하는 형식(v1 또는 v2, `signBytesVersion: "auto" | "v1" | "v2"`)으로
서명됩니다. 두 퍼블릭 네트워크 모두 v2를 사용하므로, 메인넷에서 트랜잭션을
보내려면 SDK **0.8.1 이상**이 필요합니다(0.9.0을 사용하세요). **0.8.2**는 EVM 레인
[인가 윈도우](/sdk/guides/evm#evm-window)를 위한 `openEvmWindowMsg`,
`closeEvmWindowMsg`, `fetchEvmWindow`, `classifyEvmWindowRejection`을
추가합니다.
**0.8.0**은 지갑 서명 기반 계정 헬퍼(`connectPhantomUnified`와
`unifiedAccountFromPhantomSignature`, 0.8.0에서 제거됨)를 제거했고, 모든
언어에서 엄격한 ML-DSA-87 크기 검사를 적용하며, 크로스 VM 호출에 `async`
플래그와 반환되는 callee 데이터를 추가했습니다. **0.8.3**은 트랜잭션 검색,
React 훅 경쟁 상태, Python `migrate_to_hybrid` 시퀀싱, 그리고 주소 형식에
독립적인 정식 PQC 파생(`derivePqcCanonical`, `canonicalAccount`)을
수정합니다. [업그레이드 노트](/sdk/install#upgrade)를 참고하세요.

**0.9.0 — 체인 v3.2.2와 v3.2.3에 대한 클라이언트 지원.** TypeScript `TxClient`는
계정의 키페어를 전달하면(`client.connectTx(signer, { pqcKeypair })`) 하이브리드로
서명하므로, `bankSend`와 SDK의 롤업, 멀티레이어, 크로스 VM 클라이언트가 퍼블릭
네트워크에서 동작합니다. `ensurePqcRegistered`는 먼저 REST로 등록된 키를 확인하고,
서로 다른 두 번째 키의 등록을 거부하며, 네트워크가 v3.2.3을 적용한 뒤에는
소유 증명을 스스로 첨부합니다. 새 빌더는 범위가 제한된 EVM 윈도우(`nativeOnly`,
`allowedTargets`)와 EIP-7702 동의 메시지를 지원하며, `derivePqcCanonical(address,
mnemonic)`은 모든 언어에서 니모닉으로 복구할 수 있는 키를 제공합니다. PQC 계정
경로는 단수형 `/qorechain/pqc/v1/account/{address}`이고, 블록 안에서 실패한
경우에도 codespace가 유지되며, `create-qorechain-dapp`은 현재 SDK를 기준으로
스캐폴딩합니다. [0.9.0에서 추가된 것](/sdk/install#whats-new-090)을 참고하세요.

## 다음 단계

- [왜 QoreChain SDK인가](/sdk/why) — QoreChain에서만 가능한 다섯 가지 기능.
- [설치](/sdk/install) — 언어별 설치 방법.
- [퀵스타트](/sdk/quickstart) — 연결, 잔액 조회, 송금 전송.
- [개념: 아키텍처](/sdk/concepts/architecture) — 트리플 VM 모델.
- [개념: 계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — 키와 포스트 양자 서명.
- [가이드](/sdk/guides/evm) — VM별 사용법.
- [인증자 및 위임 지출](/sdk/guides/authenticators) — 릴레이어를 통해 지출하는
  연결된 Phantom/MetaMask 키.
- [네트워크 및 엔드포인트 레퍼런스](/sdk/reference/network) — 체인 ID, 포트, 토큰.
- [예제](/sdk/examples) — 실행 가능하고 복사해 붙여넣을 수 있는 스니펫.
- [네트워크 및 엔드포인트 레퍼런스](/sdk/reference/network)는 [네트워크](/appendix/networks)에서도 확인할 수 있습니다.
