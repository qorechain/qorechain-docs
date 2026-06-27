---
slug: /sdk/overview
title: QoreChain SDK 개요
sidebar_label: 개요
sidebar_position: 1
---

# QoreChain SDK

QoreChain SDK는 양자 내성을 갖춘 트리플 VM 레이어 1 네트워크인 **QoreChain** 위에서
탈중앙화 애플리케이션을 구축하기 위한 공식 다중 언어 개발자 키트입니다.

이 문서에서는 SDK 설치, 네트워크 연결, 온체인 상태 읽기, 계정 파생, 트랜잭션 서명 및
전송, 그리고 QoreChain의 각 가상 머신을 다루는 방법을 설명합니다.

## QoreChain이란?

QoreChain은 단일 체인 위에서 세 가지 일급 스마트 컨트랙트 런타임을 제공하는
레이어 1 블록체인입니다:

- **CosmWasm** — Cosmos SDK를 통한 Wasm 스마트 컨트랙트.
- **QoreChain EVM Engine** — 이더리움 호환 실행(Solidity, viem,
  표준 JSON-RPC).
- **SVM** — Solana 스타일 JSON-RPC를 갖춘 Solana 호환 런타임.

계정, 잔액, 토큰은 여러 런타임에 걸쳐 공유되며, 체인은 크로스체인
상호운용성을 위해 IBC를 지원합니다.

### 설계부터 양자 내성

QoreChain은 **ML-DSA-87**(Dilithium-5, FIPS 204)에 기반한 포스트 양자
암호화(PQC) 프리미티브를 제공합니다. 고전적인 secp256k1 서명과 함께, 체인은
트랜잭션이 고전 서명과 포스트 양자 서명을 *모두* 담는 **하이브리드** 서명 태세를
지원합니다. 따라서 오늘날 고전 검증에서도 유효성을 유지하면서 포스트 양자 보호를
얻게 됩니다.

SDK는 오늘날 ML-DSA-87 키 생성, 서명, 검증을 노출하며, 하이브리드 트랜잭션을 위한
구성 요소도 제공합니다. 자세한 내용은
[계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요. 여기에 마케팅성
주장은 없습니다 — SDK는 체인이 구현하는 프리미티브를 정확히 그대로 노출합니다.

## 이 SDK가 다른 점

완전한 멀티체인 동등성에 더해, 세 가지 기능은 다른 어떤 레이어 1에도 없는
프로토콜 기능 위에 구축되었기 때문에 **QoreChain에서만 가능합니다**:

- **AI 사전 점검 위험 점수화** — 트랜잭션을 브로드캐스트하기 전에 온체인 AI로
  스캔하세요. `simulateWithRiskScore`는 결정적 EVM 프리컴파일에서 나온 위험/이상
  판정과 함께 가스를 반환하므로, 지갑이나 dApp이 서명 *전에* 경고하거나
  차단할 수 있습니다. [AI 사전 점검](/sdk/guides/ai-preflight)을 참조하세요.
- **통합 크로스 VM 호출** — 하나의 계정, 세 개의 VM, 하나의 트랜잭션.
  `createCrossVMClient`는 임의의 VM에 있는 컨트랙트를 호출하고, `callAtomic`은 여러
  크로스 VM 호출을 한 번만 서명되는 단일 원자적 트랜잭션으로 묶습니다.
  [크로스 VM 호출](/sdk/guides/cross-vm)을 참조하세요.
- **양자 내성 DX** — 하나의 멱등 호출(`ensurePqcRegistered` / `migrateToHybrid`)로
  서명자를 포스트 양자 보호 상태로 만들 수 있으며, 즉시 사용 가능한 React 배지도
  함께 제공됩니다. [양자 내성](/sdk/guides/quantum-safe)을 참조하세요.

새로운 **`@qorechain/react`** 키트(provider, hooks, `ConnectButton`,
`QuantumSafeBadge`)는 양자 내성 dApp 구축을 기본 경로로 만들어 줍니다 —
[React 키트 가이드](/sdk/guides/react)를 참조하세요. 전체적인 근거는
[QoreChain SDK를 선택하는 이유](/sdk/why)를 읽어보세요.

## SDK 제품군

SDK는 원하는 언어로 개발할 수 있도록 패키지 제품군으로 제공됩니다. 이들은 동일한
네트워크 프리셋, 파생 스킴, 단위(denomination) 연산, 읽기 표면을 공유합니다.

| 패키지 | 언어 | 설치 | 상태 |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | 게시됨 (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | 게시됨 (PyPI, v0.5.0) |
| `qorechain-sdk` (Go module) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | 게시됨 (Go proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | 게시됨 (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | 게시됨 (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (EVM 어댑터) | `npm i @qorechain/evm viem` | 게시됨 (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (SVM 어댑터) | `npm i @qorechain/svm @solana/web3.js` | 게시됨 (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (React 키트) | `npm i @qorechain/react` | 게시됨 (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | 게시됨 (npm, v0.5.0) |

> Python 배포판은 `qorechain-sdk`로 설치되지만 **`qorsdk`로 임포트됩니다**.
> 모든 클라이언트는 각자의 레지스트리에 게시되어 있습니다 — 언어별 명령은
> [설치](/sdk/install)를 참조하세요.

TypeScript 코어(`@qorechain/sdk`)는 이 문서의 예제 기반입니다. Python, Go, Rust,
Java 클라이언트는 TypeScript와 **완전한 네이티브 체인 동등성**에 도달합니다:
네트워크 프리셋, denom/주소 유틸리티, HD 계정 파생(native/EVM/SVM),
PQC(ML-DSA-87) 서명, 모든 커스텀 모듈과 표준 Cosmos 모듈에 대한 타입 지정 메시지
컴포저, 타입 지정 쿼리 클라이언트, 완전한 트랜잭션 라이프사이클(자동 가스, 오류
디코딩, tx 추적, 블록/tx 검색), 하이브리드 포스트 양자 트랜잭션, 그리고 WebSocket
구독. 이 모든 클라이언트는 **게시되어 있습니다**: TypeScript는 npm
(`@qorechain/sdk` 0.5.0)에, Python은 PyPI(`qorechain-sdk` 0.5.0, import
`qorsdk`)에, Go는 모듈 프록시(`.../packages/go` 0.5.0)에, Rust는
crates.io(`qorechain-sdk` 0.5.0)에, Java는 Maven Central
(`io.github.qorechain:qorechain-sdk` 0.5.0)에 게시되어 있습니다. EVM/SVM 실행 어댑터
(`@qorechain/evm`, `@qorechain/svm`, 둘 다 0.5.0), `@qorechain/react` 키트
(0.5.0), 그리고 `create-qorechain-dapp` 스캐폴딩 CLI는 TypeScript 전용이며
마찬가지로 npm에 게시되어 있습니다.

v0.4 릴리스는 롤업 출금(`MsgExecuteWithdrawal`, L2→L1 종료 경로), `multilayer`,
`rdk`, `bridge` 모듈에 대한 타입 지정 쿼리 클라이언트, 브리지 관리자 메시지,
그리고 다섯 개 언어 전반에 걸친 고수준 사이드체인/페이체인 및 롤업 헬퍼를
추가했습니다.

## 다음으로 갈 곳

- [QoreChain SDK를 선택하는 이유](/sdk/why) — QoreChain만의 세 가지 기능.
- [설치](/sdk/install) — 언어별 설치 안내.
- [퀵스타트](/sdk/quickstart) — 연결, 잔액 읽기, 전송 보내기.
- [개념: 아키텍처](/sdk/concepts/architecture) — 트리플 VM 모델.
- [개념: 계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — 키와
  포스트 양자 서명.
- [가이드](/sdk/guides/evm) — VM별 사용법.
- [네트워크 및 엔드포인트 참조](/sdk/reference/network) — 체인 id, 포트, 토큰.
- [예제](/sdk/examples) — 실행 가능하고 복사해서 붙여넣을 수 있는 스니펫.
- [네트워크 및 엔드포인트 참조](/sdk/reference/network)는 [네트워크](/appendix/networks)에도 노출됩니다.
