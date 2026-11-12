---
slug: /build-before-qday/workshop-1/kits
title: QoreChain 키트
sidebar_label: 키트
sidebar_position: 10
---

# QoreChain 키트

QoreChain 개발자 스택은 열네 개의 키트로 이루어집니다. 이 페이지는 각 키트를 한 줄로 소개하며 버전과 배포 위치를 함께 알려 주고, 이를 바탕으로 만들어 볼 수 있는 아이디어 여섯 가지로 마무리합니다. 열두 개의 키트는 사용할 수 있습니다. 두 개는 아직 출시되지 않았습니다. Asset kit은 제안 단계이고 PQ light client는 명세 단계입니다.

## 혁신 요소 {#innovations}

- **하이브리드 ML-DSA-87 + secp256k1 서명이 SDK, 지갑, QoreSign에 내장되어 있어서** 앱이 양자 내성 서명을 직접 구현할 필요가 없습니다.
- **온체인에서 검증되는 하이브리드 서명 트랜잭션 하나**가 앱들이 공유하는 증거입니다. [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook), [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector)를 참고하세요.
- **여러 언어에서 같은 구조.** SDK, QoreSign, PQC 라이브러리는 여러 언어로 제공되며 공통 테스트 벡터로 검증됩니다.

## 앱 빌드 {#build-apps}

| 키트 | 기능 | 버전과 레지스트리 |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | 네이티브, EVM, SVM 레인을 하나의 클라이언트로 다루며 하이브리드 서명, PQC 키 등록, EVM 윈도우 헬퍼, 스테이킹 티어, 토크노믹스, AMM, 크로스 VM 호출, 롤업을 지원합니다. TypeScript, Python, Rust, Java, Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | 일곱 가지 템플릿(hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm, rollup-app)에서 명령 하나로 동작하는 프로젝트를 스캐폴딩합니다. | 0.13.1: npm |
| [RDK, 롤업 개발 키트](/rollups/overview) | QoreChain에서 정산되는 애플리케이션 전용 롤업을 만들고, 시작하고, 운영합니다. 서명된 정산 배치, 출금, 데이터 가용성 조회를 지원합니다. | `@qorechain/rdk` 0.8.0, 다섯 가지 언어 |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## 지갑과 서명 {#wallets-signing}

| 키트 | 기능 | 버전과 레지스트리 |
| --- | --- | --- |
| [QoreX와 qorex-integrations](/developer-tools/qorex-integrations) | 공식 지갑이 두 키를 모두 보관하고, 하이브리드로 서명하며, 서명하는 내용을 보여 줍니다. 통합 패키지는 RainbowKit과 wagmi, cosmos-kit, Interchain Kit에 QoreX를 추가하고, 타입, 목 지갑, Playwright 픽스처도 제공합니다. [QoreX 개요](/qorex/overview)도 참고하세요. | QoreX 1.2.3(iOS, Android), 확장 프로그램 0.4.2(Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [지갑 어댑터](/developer-tools/wallet-adapter) | 사람들이 이미 쓰는 지갑(Keplr, Leap, Cosmostation, MetaMask, Phantom)에 QoreChain을 추가하며, 체인이 요구하는 ML-DSA-87 하이브리드 서명도 포함합니다. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | QoreX 이외의 지갑과 백엔드를 위한 하이브리드 서명: ML-DSA 키 파생, 두 키로 네이티브 레인 트랜잭션 서명, 하이브리드 서명의 로컬 검증, 서명 전 시뮬레이션, Sign In With QoreChain을 제공합니다. | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | 나머지 키트의 바탕이 되는 양자 내성 기본 요소: ML-DSA(FIPS 204), ML-KEM(FIPS 203), SHAKE-256. 언어 간 바이트 단위로 호환되며 공통 테스트 벡터로 검증됩니다. | `@qorechain/pqc` 0.2.3, 여섯 가지 언어 |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## 데이터와 프라이버시 {#data-privacy}

| 키트 | 기능 | 버전과 레지스트리 |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | ML-KEM-1024(기본값은 X25519와의 하이브리드)로 QoreChain 계정에 데이터를 암호화합니다. 계정이 키를 온체인에 게시하면 누구나 그 계정에 암호화할 수 있습니다. 여러 수신자, 감사자 키, 순환하는 그룹 키를 지원합니다. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | 호환되는 개발자 도구에 QoreChain 읽기 권한을 주는 Model Context Protocol 서버이자 명령줄 도구입니다. 블록, 트랜잭션, 계정, 검증자, 스테이킹 티어, 하이브리드 서명 상태, 컨트랙트 읽기, 수수료 추정을 지원합니다. 서명하지 않고, 키를 보관하지 않으며, 브로드캐스트하지 않습니다. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## 인프라와 컴플라이언스 {#infra-compliance}

| 키트 | 기능 | 버전과 레지스트리 |
| --- | --- | --- |
| [QORel](/qorel/overview) | Hermes를 포크한 IBC 릴레이어이며, 교체 가능한 서명자 계층 덕분에 모든 트랜잭션에 양자 내성 서명이 필요한 체인도 릴레이할 수 있습니다. 일반 체인에는 Hermes의 형식을 그대로 유지합니다. | 0.1.0: GitHub, 컨테이너 이미지, Homebrew |
| [커스터디 키트](/developer-tools/custody-kit) | 커스터디 사업자를 위한 키트: 레인별 요구 사항, 주소 검증, 입금 감지, 출금 서명과 검증, 스테이킹, ML-DSA-87 키 관리를 다루며 테스트 벡터와 참조 코드가 있습니다. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | 배포 환경의 암호화 현황(노드 설정, 유형별 키, TLS 엔드포인트, Solidity 소스, 체인 상태)을 목록화하고 CycloneDX 1.6 CBOM으로 내보내며, 결과를 FINMA Guidance 05/2026, EU PQC 로드맵, DORA에 매핑합니다. 현황 파악을 돕는 도구이며 인증이 아닙니다. | `@qorechain/qorescan` 0.1.0 |
| [Asset kit](/developer-tools/asset-kit) | **제안 단계이며 전체가 출시된 것은 아닙니다.** 규제 대상 토큰화 자산을 위한 도구: 양자 내성 보유자 검사를 갖춘 ERC-3643 및 CMTAT 어댑터, ERC-4626 및 ERC-7540 볼트, 발행자 콘솔, 클라이언트. EVM 컨트랙트는 사용할 수 있고, 네이티브 자산 모듈은 제안 단계입니다. | 0.1.0 |
| [PQ light client](/developer-tools/pq-light-client) | **명세 단계이며 출시되지 않았습니다.** ML-DSA-87로 서명된 체크포인트를 따라가는 라이트 클라이언트입니다. QoreChain은 현재 이러한 체크포인트를 생성하지 않습니다. 저장소에는 설계를 검토할 수 있도록 명세와 참조 검증기(Go, Rust, TypeScript)가 들어 있습니다. | 0.1.0(명세) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## 만들어 볼 수 있는 여섯 가지 {#ideas}

| 아이디어 | 사용 키트 | 설명 |
| --- | --- | --- |
| 양자 안전 결제 | SDK, QoreX | 모든 결제가 하이브리드로 서명되는, 웹 쇼핑몰용 QOR 결제 버튼. |
| 해커톤 스타터 | create-qorechain-dapp | 학생마다 명령 하나로, 처음부터 테스트넷에 컨트랙트를 배포하기까지 10분. |
| Sign In With QoreChain | QoreSign | 웹 앱용 비밀번호 없는 로그인. 하이브리드 서명은 서버에서 검증합니다. |
| 봉인 입찰 경매 | QoreSeal | 공개 시점까지 입찰이 암호화된 상태로 유지됩니다. |
| PQC 준비 현황 점검 | QoreScan | 핀테크 팀과 감사인을 위한 암호화 현황 목록과 CBOM 파일. |
| 나만의 채널 릴레이 | QORel | QoreChain 테스트넷과 다른 Cosmos 테스트넷 체인 사이를 릴레이합니다. |

## 코드 받기 {#get-the-code}

각 키트에는 위에 링크된 자체 매뉴얼 페이지가 있습니다. 이 워크숍의 예제 앱은 공개 저장소 [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)에 있으며, 각 앱 페이지가 첫 명령부터 마지막 명령까지 안내합니다.

```sh
git clone https://github.com/qorechain/build-before-qday
```
