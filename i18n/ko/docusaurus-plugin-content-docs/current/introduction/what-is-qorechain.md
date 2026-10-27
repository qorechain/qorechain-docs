---
slug: /introduction/what-is-qorechain
title: QoreChain이란?
sidebar_label: QoreChain이란?
sidebar_position: 1
---

# QoreChain이란?

QoreChain은 제네시스부터 포스트 양자 암호화, AI 네이티브 트랜잭션 처리, 단일 체인에서 EVM, QoreChain Native(CosmWasm 런타임), SVM 프로그램을 실행하는 트리플 VM 런타임으로 구축된 최초의 레이어 1 블록체인입니다. 기존 프로토콜에 양자 저항성을 사후적으로 적용하는 대신, QoreChain은 현대적 범용 블록체인에 기대되는 개발자 경험과 상호운용성을 제공하면서 고전 및 양자 공격자 모두에 대해 안전하도록 처음부터 설계되었습니다.

메인넷(`qorechain-vladi`, EVM 체인 ID **9801**)은 2026년 6월 7일부터 가동 중이며 체인 릴리스 **v3.2.4**를 실행합니다(2026년 10월 23일 높이 3,742,566에서 거버넌스 제안 13으로 적용). 공개 테스트넷(`qorechain-diana`, EVM 체인 ID **9800**, 2026년 10월 27일부터 v3.2.6 실행 중)은 스테이징 및 통합 테스트를 위해 병렬로 실행됩니다. 네이티브 토큰은 **QOR**(표시) / **uqor**(기본, 10^6)이며, 계정용 Bech32 접두사는 `qor`, 검증자용은 `qorvaloper`입니다. 체인은 Cosmos SDK v0.53 위에 구축되었습니다.

## 핵심 혁신

### 1. 포스트 양자 암호화

QoreChain은 디지털 서명에 NIST 표준화된 ML-DSA-87 (Dilithium-5), 키 캡슐화에 ML-KEM-1024, 기본 애플리케이션 해시로 SHAKE-256을 사용하여, 고전 및 양자 컴퓨터의 공격 모두에 대한 보안을 제공합니다. 하이브리드 서명은 이제 cosmos 트랜잭션 경로에서 **기본값으로 필수**입니다: 모든 cosmos 경로 트랜잭션은 고전 secp256k1 (ECDSA) 서명과 *함께* Dilithium-5 (ML-DSA-87) 서명을 트랜잭션 확장으로 포함해야 합니다. 고전 전용 cosmos 트랜잭션은 거부됩니다 — 다운그레이드 경로는 닫혀 있습니다(제네시스 gentx, PQC 키 등록/마이그레이션 트랜잭션, 등록된 키가 없는 운영자 계정에서의 감옥 해제(unjail)만 면제). EVM 레인은 표준 `eth_secp256k1` 서명을 유지하므로 Ethereum 도구는 그대로 서명하지만, v3.2.0부터 EVM 트랜잭션은 등록된 ML-DSA-87 키가 있고 열려 있는 **EVM 인가 윈도우**(EVM authorisation window)가 있는 계정에서만 허용됩니다. 이 윈도우는 포스트 양자 서명된 Cosmos 레인 메시지로 여는, 범위가 제한된 권한입니다([EVM 인가 윈도우](/getting-started/first-transaction#evm-window) 참조). 이제 고전 키만으로는 EVM 레인에서 자금을 이동할 수 없습니다. 세 가지 거버넌스 제어 시행 모드(disabled, optional, required)는 계속 사용할 수 있지만, 현재 네트워크 기본값은 **required**입니다. 알고리즘 민첩성 프레임워크는 암호 표준이 발전함에 따라 거버넌스 제안을 통해 서명 체계를 업그레이드할 수 있도록 보장합니다.

### 2. AI 네이티브 처리

**PRISM**(Policy-driven Reinforcement-learning for Intelligent State Machines)은 블록 생명주기에 내장된 온체인 강화 학습 계층으로, 서킷 브레이커 안전 한도를 갖춘 73,733개 파라미터의 고정 소수점 PPO 정책 네트워크입니다. 현재는 관찰 모드로 실행됩니다: 라이브 네트워크는 10블록마다 관찰값과 보상을 기록하며, 학습된 정책은 로드되어 있지 않으므로 오늘 현재 PRISM이 튜닝하는 합의 파라미터는 없습니다. 통계적 격리 포레스트 이상 탐지와 다차원 위험 점수 산정은 ante 핸들러 체인에서 모든 트랜잭션을 평가하여 실행 전에 사기 패턴을 표시합니다. 동적 수수료 최적화는 실시간 네트워크 조건에 따라 기본 수수료를 조정합니다. 모든 온체인 AI 추론은 검증자 전반에 걸쳐 완전히 결정론적이 되도록 설계되었습니다 — 동일한 입력은 외부 오라클 의존성 없이 동일한 출력을 생성합니다.

### 3. 트리플 VM 런타임

QoreChain은 하나의 합의 내에서 세 개의 가상 머신을 네이티브로 실행하는 유일한 레이어 1입니다.

* **EVM** — EIP-1559 가스 가격 책정과 포트 8545의 JSON-RPC를 갖춘 완전한 Ethereum 호환성. 표준 도구(Hardhat, Foundry, Remix)를 사용하여 Solidity 컨트랙트를 배포하세요.
* **QoreChain Native** — 전체 생명주기 지원(instantiate, execute, query, migrate)을 갖춘 Rust로 작성된 WebAssembly 스마트 컨트랙트.
* **SVM** — 포트 8899의 Solana 호환 JSON-RPC 서버를 갖춘 BPF 프로그램 배포 및 실행. 기존 Solana 클라이언트와 도구가 바로 작동합니다.

크로스 VM 메시징은 세 가지 런타임이 모두 통신할 수 있게 합니다: EVM 컨트랙트는 프리컴파일을 통해 QoreChain Native을 호출하고(해당 프리컴파일이 활성화된 이후), QoreChain Native 컨트랙트는 사용자 지정 메시지를 통해 EVM을 호출하며, SVM 프로그램은 비동기 이벤트 기반 브리징을 통해 참여합니다. 현재 라이브 네트워크에서 트랜잭션을 받는 것은 EVM 런타임뿐입니다: QoreChain Native 코드 업로드와 인스턴스화는 비활성화되어 있고, SVM 트랜잭션 레인은 비활성화되어 있으며, 메인넷에서 활성화된 EVM 프리컴파일은 없고(테스트넷에는 세 개가 활성화되어 있습니다), 크로스 VM 호출 메시지는 메인넷에서 꺼져 있습니다.

### 4. 고정 공급량 토크노믹스

소각 엔진은 중앙 소각 회계 모듈에 공급되는 **12개의 소각 소스**(가스 수수료, 컨트랙트 생성, AI 서비스 수수료, 브리지 수수료, 트레저리 바이백, 실패한 트랜잭션, xQORE 페널티, 자동 바이백, TGE 소각, 롤업 생성, 트랜잭션 수 마일스톤, AMM)를 정의하며, 메인넷에서는 지금까지 가스 수수료 채널과 실패한 트랜잭션 채널에서만 소각이 기록되었습니다. 수수료 수집기에 들어오는 모든 것은 **검증자에게 37%, 영구 소각 30%, 트레저리에 20%, 스테이커에게 10%, 라이트 노드에 3%**로 분할됩니다. 이 분할은 트랜잭션 수수료와 에포크 발행량 모두에 적용됩니다. xQORE 거버넌스 스테이킹 설계는 사용자가 두 배의 거버넌스 가중치를 위해 QOR를 잠글 수 있게 하며, 조기 출구 페널티는 남은 보유자에게 재분배됩니다. 잠금 및 잠금 해제 트랜잭션은 아직 라이브 네트워크에 연결되어 있지 않습니다.

QOR는 **유한한 공급 경로**를 갖습니다: 제네시스 시점 **4,420,000,000 QOR**(계획은 4,500,000,000 QOR이며, 그중 80,000,000 QOR는 제네시스 이전 토큰 생성 이벤트에서 소각됨), **총 누적 발행 상한 590,000,000 QOR** 아래에서 발행되는 스테이킹 발행량, 그리고 토큰을 영구적으로 제거하는 소각 엔진입니다. `x/inflation` 모듈은 상한에 도달할 때까지 43,200블록 에포크마다 고정된 양(2026년 10월 거버넌스 제안 10 이후 86,000 QOR)을 발행하며, 그 이후 보상은 트랜잭션 수수료만으로 지급됩니다. 실시간 수치와 일정은 [토크노믹스](/architecture/tokenomics#supply-and-emission)를 참조하세요.

### 5. 크로스 체인 연결성

QoreChain은 두 가지 상호 보완적인 프로토콜인 네이티브 IBC와 QoreChain Bridge(QCB)를 통해 광범위한 블록체인 생태계에 연결되도록 설계되었습니다. 브리지 계층은 **37개 체인 구성(36개 외부 체인과 IBC로 연결되는 Injective)**과 최대 **8개 IBC 카운터파티**를 정의합니다. 크로스 체인 계층은 **어느 네트워크에서도 아직 라이브가 아닙니다**: 37개 체인 구성 모두 `pending` 상태이고, 메인넷에는 IBC 채널이 없으며, 테스트넷에는 테스트 체인으로 연결되는 테스트 채널이 하나 있습니다. 아래 수치는 목표 커버리지를 설명합니다.

* **최대 8개 IBC 카운터파티** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective. 클라이언트 업데이트, 부정 행위 탐지, 자동 패킷 정리를 갖춘 사전 구성된 릴레이어 템플릿.
* **37개 QCB 체인 구성(36개 외부 체인 + IBC로 연결되는 Injective)** — 각 엔드포인트는 유형별 주소 검증, 구성 가능한 확인 깊이, 회로 차단기 볼륨 상한, PQC 서명 검증자 어테스테이션을 포함하도록 설계되었습니다. 목표 외부 체인은 다음과 같습니다.
  * **기준(10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **EVM 계열(14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **비 EVM(5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **보류(7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

이 아키텍처는 모든 주요 체인 유형 — EVM, Solana(SVM), Move 기반(Sui, Aptos), Cosmos/IBC, UTXO, 기타 비 EVM 계열 — 을 아울러 생태계 전반에 걸쳐 광범위한 상호운용성을 제공합니다.

### 6. 롤업 개발 키트

`x/rdk` 모듈은 QoreChain 호스트 체인에서 직접 애플리케이션 전용 롤업을 배포하기 위한 프로토콜 네이티브 프레임워크입니다. 롤업 지원은 호스트 체인 프레임워크로 제공되며, 특정 배포 주장은 목표 기능으로 취급되어야 합니다. 네 가지 정산 패러다임이 지원됩니다.

* **Optimistic** — 7일 챌린지 기간을 갖춘 사기 증명, EndBlocker에 의한 자동 최종화.
* **ZK (영지식)** — 검증 시 즉각적 최종성을 갖춘 SNARK 또는 STARK 증명.
* **Based** — 약 2개의 호스트 블록 내 최종성을 갖춘 L1 시퀀싱 트랜잭션.
* **Sovereign** — 데이터 가용성을 위해 QoreChain만을 독점적으로 사용하는 독립 체인.

다섯 가지 프리셋 프로필(**defi, gaming, nft, enterprise, custom**)은 사전 구성된 정산 모드, 블록 시간, VM 선택, DA 백엔드, 가스 모델을 갖춘 원클릭 배포를 가능하게 합니다. 네이티브 DA 라우터는 구성 가능한 보존 및 자동 가지치기를 갖춘 SHAKE-256 커밋 blob 저장을 제공합니다. PRISM 합의 모듈은 AI 지원 롤업 구성을 위한 권고 메서드를 제공합니다. 라이브 네트워크에서는 아직 생성된 롤업이 없습니다.

### 7. 계정 및 가스 추상화

세 가지 프로그래밍 가능한 유형(멀티시그, 소셜 복구, 세션 기반)을 갖춘 스마트 계정은 세분화된 권한과 만료를 갖춘 세션 키, 계정별 지출 규칙, denom 허용 목록을 지원합니다. 이는 표준 계정으로는 불가능한 지갑 UX 패턴을 가능하게 합니다: 모바일용 dApp 세션 키, 일급 계정 유형으로서의 소셜 복구, 프로그래밍 가능한 지출 한도. 스마트 계정과 연결된 지갑 기능은 구현되어 있지만 **메인넷에서는 꺼져 있고**(`abstractaccount.enabled = false`) 테스트넷에서는 켜져 있습니다(`GET /qorechain/abstractaccount/v1/config` 확인). 가스 추상화는 사용자가 허용된 비네이티브 토큰으로 수수료를 지불할 수 있도록 설계되었습니다(구성에는 `ibc/USDC`와 `ibc/ATOM`이 나열됨). 아직 열려 있는 IBC 채널이 없으므로 현재 수수료는 QOR로 지불됩니다.

## 생태계

QoreChain은 **48개의 제네시스 모듈(그중 20개가 QoreChain 전용)**을 제공하며, 보안(pqc), AI(ai, reputation, rlconsensus), 합의(qca), 가상 머신(vm, svm, crossvm), 토크노믹스(burn, xqore, inflation), 유동성(amm), 라이선싱(license), 브리지(bridge, babylon, multilayer), 거버넌스 확장(abstractaccount, fairblock, gasabstraction), 롤업(rdk)을 포괄합니다. 최근 추가된 항목으로는 AMM / 온체인 유동성을 위한 `x/amm`과 체인 라이선싱을 위한 `x/license`가 있습니다. 체인은 오픈 코어 아키텍처를 따릅니다 — 프로토콜 계층은 완전히 오픈 소스이며, 엔터프라이즈 배포를 위한 선택적 독점 확장이 제공됩니다.

## 관련 문서

* [아키텍처 개요](/introduction/architecture-overview) — 계층들이 어떻게 처음부터 끝까지 결합되는지.
* [주요 기능](/introduction/key-features) — 기능 하이라이트 한눈에 보기.
* [PRISM 합의 엔진](/architecture/prism-consensus-engine) — 핵심에 있는 AI 지원 합의.
* [토크노믹스](/architecture/tokenomics) — QOR 공급량, 소각, 리베이스, 발행.
* [퀵스타트](/getting-started/quickstart) — 로컬 노드를 띄우고 빌드를 시작하세요.
