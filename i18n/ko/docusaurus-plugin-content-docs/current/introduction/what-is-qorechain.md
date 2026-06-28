---
slug: /introduction/what-is-qorechain
title: QoreChain이란?
sidebar_label: QoreChain이란?
sidebar_position: 1
---

# QoreChain이란?

QoreChain은 제네시스부터 포스트 양자 암호화, AI 네이티브 트랜잭션 처리, 단일 체인에서 EVM, CosmWasm, SVM 프로그램을 실행하는 트리플 VM 런타임으로 구축된 최초의 레이어 1 블록체인입니다. 기존 프로토콜에 양자 저항성을 사후적으로 적용하는 대신, QoreChain은 현대적 범용 블록체인에 기대되는 개발자 경험과 상호운용성을 제공하면서 고전 및 양자 공격자 모두에 대해 안전하도록 처음부터 설계되었습니다.

메인넷(`qorechain-vladi`, EVM 체인 ID **9801**)은 2026년 6월 7일부터 가동 중이며 체인 버전 **v3.1.80**로 실행됩니다. 공개 테스트넷(`qorechain-diana`, EVM 체인 ID **9800**)은 스테이징 및 통합 테스트를 위해 병렬로 실행됩니다. 네이티브 토큰은 **QOR**(표시) / **uqor**(기본, 10^6)이며, 계정용 Bech32 접두사는 `qor`, 검증자용은 `qorvaloper`입니다. 체인은 Cosmos SDK v0.53 위에 구축되었습니다.

## 핵심 혁신

### 1. 포스트 양자 암호화

QoreChain은 디지털 서명에 NIST 표준화된 ML-DSA-87 (Dilithium-5), 키 캡슐화에 ML-KEM-1024, 기본 애플리케이션 해시로 SHAKE-256을 사용하여, 고전 및 양자 컴퓨터의 공격 모두에 대한 보안을 제공합니다. 하이브리드 서명은 이제 cosmos 트랜잭션 경로에서 **기본값으로 필수**입니다: 모든 cosmos 경로 트랜잭션은 고전 secp256k1 (ECDSA) 서명과 *함께* Dilithium-5 (ML-DSA-87) 서명을 트랜잭션 확장으로 포함해야 합니다. 고전 전용 cosmos 트랜잭션은 거부됩니다 — 다운그레이드 경로는 닫혀 있습니다(제네시스 gentx와 PQC 키 등록/마이그레이션 트랜잭션만 면제). EVM 트랜잭션은 영향받지 않습니다: 별도의 `eth_secp256k1` ante 경로(QoreChain EVM 엔진 경로)를 사용하며 하이브리드 서명이 필요하지 않습니다. 세 가지 거버넌스 제어 시행 모드(disabled, optional, required)는 계속 사용할 수 있지만, 현재 네트워크 기본값은 **required**입니다. 알고리즘 민첩성 프레임워크는 암호 표준이 발전함에 따라 거버넌스 제안을 통해 서명 체계를 업그레이드할 수 있도록 보장합니다.

### 2. AI 네이티브 처리

온체인 강화 학습 에이전트(73,733개 파라미터를 갖춘 PPO MLP)가 블록 생명주기에서 직접 결정론적 고정 소수점 추론을 실행하여, 블록 시간, 가스 한도, 검증자 풀 가중치와 같은 합의 파라미터를 동적으로 튜닝합니다. 이 최적화 계층은 **PRISM**(Policy-driven Reinforcement-learning for Intelligent State Machines)이라는 브랜드를 갖습니다. 통계적 격리 포레스트 이상 탐지와 다차원 위험 점수 산정은 ante 핸들러 체인에서 모든 트랜잭션을 평가하여 실행 전에 사기 패턴을 표시합니다. 동적 수수료 최적화는 실시간 네트워크 조건에 따라 기본 수수료를 조정합니다. 모든 AI 추론은 검증자 전반에 걸쳐 완전히 결정론적입니다 — 동일한 입력은 외부 오라클 의존성 없이 동일한 출력을 생성합니다.

### 3. 트리플 VM 런타임

QoreChain은 하나의 합의 내에서 세 개의 가상 머신을 네이티브로 실행하는 유일한 레이어 1입니다.

* **EVM** — EIP-1559 가스 가격 책정과 포트 8545의 JSON-RPC를 갖춘 완전한 Ethereum 호환성. 표준 도구(Hardhat, Foundry, Remix)를 사용하여 Solidity 컨트랙트를 배포하세요.
* **CosmWasm** — 전체 생명주기 지원(instantiate, execute, query, migrate)을 갖춘 Rust로 작성된 WebAssembly 스마트 컨트랙트.
* **SVM** — 포트 8899의 Solana 호환 JSON-RPC 서버를 갖춘 BPF 프로그램 배포 및 실행. 기존 Solana 클라이언트와 도구가 바로 작동합니다.

크로스 VM 메시징은 세 가지 런타임이 모두 통신할 수 있게 합니다: EVM 컨트랙트는 프리컴파일을 통해 CosmWasm을 호출하고, CosmWasm 컨트랙트는 사용자 지정 메시지를 통해 EVM을 호출하며, SVM 프로그램은 비동기 이벤트 기반 브리징을 통해 참여합니다.

### 4. 고정 공급량 토크노믹스

10개의 별개 소각 채널(트랜잭션 수수료, 거버넌스 페널티, 슬래싱, 브리지 수수료, 스팸 억제, 에포크 초과분, 수동 소각, 컨트랙트 콜백, 크로스 VM 수수료, 롤업 생성 소각)이 중앙 소각 회계 모듈에 공급됩니다. 수집된 수수료는 **검증자에게 37%, 영구 소각 30%, 트레저리에 20%, 스테이커에게 10%, 라이트 노드에 3%**로 분할됩니다. xQORE 거버넌스 스테이킹 메커니즘은 사용자가 PvP 리베이스 재분배와 함께 두 배의 거버넌스 가중치를 위해 QOR를 잠글 수 있게 합니다 — 조기 출구 페널티는 남은 보유자에게 재분배되어 신념을 보상합니다.

QoreChain은 영구적인 비율 인플레이션 대신 유한한 발행 예산을 갖춘 **고정 공급량** 모델을 사용합니다. 총 공급량은 **4,500,000,000 QOR**로 고정되며, 그중 **80,000,000(1.78%)**가 TGE 시 소각되었습니다. 스테이킹 보상은 다년간 일정에 따라 전용 **590,000,000 QOR** 풀에서 지급됩니다.

| 기간 | 목표 APY | 발행 예산 |
| --- | --- | --- |
| 1년차 | 8~12% | 127,500,000 QOR |
| 2년차 | 6~10% | 106,250,000 QOR |
| 3~4년차 | 5~8% | 연간 85,000,000 QOR |
| 5년차 이후 | 거버넌스 결정 | ~186,000,000 QOR 잔여 |

10개의 소각 채널과 결합하여, 고정 공급량 설계는 트랜잭션 볼륨이 증가함에 따라 순 디플레이션 행동으로 수렴합니다.

### 5. 크로스 체인 연결성

QoreChain은 두 가지 상호 보완적인 프로토콜인 네이티브 IBC와 QoreChain Bridge(QCB)를 통해 광범위한 블록체인 생태계에 연결되도록 설계되었습니다. 브리지 계층은 **37개 QCB 체인 구성**(QoreChain 자체를 네이티브 루프백으로 포함)과 **8개 IBC 채널**을 정의하며 — 총 **36개 외부 체인**을 포괄합니다. 크로스 체인 계층은 현재 **테스트넷 / 보류 상태이며 아직 프로덕션이 아닙니다**; 아래 수치는 목표 커버리지를 설명합니다.

* **8개 IBC 채널** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective. 클라이언트 업데이트, 부정 행위 탐지, 자동 패킷 정리를 갖춘 사전 구성된 릴레이어 템플릿.
* **37개 QCB 구성(36개 외부 체인 + QoreChain 루프백)** — 각 엔드포인트는 유형별 주소 검증, 구성 가능한 확인 깊이, 회로 차단기 볼륨 상한, PQC 서명 검증자 어테스테이션을 포함하도록 설계되었습니다. 목표 외부 체인은 다음과 같습니다.
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

다섯 가지 프리셋 프로필(**defi, gaming, nft, enterprise, custom**)은 사전 구성된 정산 모드, 블록 시간, VM 선택, DA 백엔드, 가스 모델을 갖춘 원클릭 배포를 가능하게 합니다. 네이티브 DA 라우터는 구성 가능한 보존 및 자동 가지치기를 갖춘 SHA-256 커밋 blob 저장을 제공합니다. PRISM 합의 모듈은 AI 지원 롤업 구성을 위한 권고 메서드를 제공합니다.

### 7. 계정 및 가스 추상화

세 가지 프로그래밍 가능한 유형(멀티시그, 소셜 복구, 세션 기반)을 갖춘 스마트 계정은 세분화된 권한과 만료를 갖춘 세션 키, 계정별 지출 규칙, denom 허용 목록을 지원합니다. 이는 표준 계정으로는 불가능한 지갑 UX 패턴을 가능하게 합니다: 모바일용 dApp 세션 키, 일급 계정 유형으로서의 소셜 복구, 합의 시 시행되는 프로그래밍 가능한 지출 한도. 가스 추상화는 수수료를 위해 네이티브 QOR를 보유해야 하는 요구사항을 제거합니다 — 사용자는 USDC나 ATOM과 같은 허용된 IBC 전송 토큰으로 결제할 수 있습니다.

## 생태계

QoreChain은 **20개 이상의 사용자 지정 모듈을 포함하여 45개 이상의 제네시스 모듈**을 제공하며, 보안(pqc), AI(ai, reputation, rlconsensus), 합의(qca), 가상 머신(vm, svm, crossvm), 토크노믹스(burn, xqore, inflation), 유동성(amm), 라이선싱(license), 브리지(bridge, babylon, multilayer), 거버넌스 확장(abstractaccount, fairblock, gasabstraction), 롤업(rdk)을 포괄합니다. 최근 추가된 항목으로는 AMM / 온체인 유동성을 위한 `x/amm`과 체인 라이선싱을 위한 `x/license`가 있습니다. 체인은 오픈 코어 아키텍처를 따릅니다 — 프로토콜 계층은 완전히 오픈 소스이며, 엔터프라이즈 배포를 위한 선택적 독점 확장이 제공됩니다.

## 관련 문서

* [아키텍처 개요](/introduction/architecture-overview) — 계층들이 어떻게 처음부터 끝까지 결합되는지.
* [주요 기능](/introduction/key-features) — 기능 하이라이트 한눈에 보기.
* [PRISM 합의 엔진](/architecture/prism-consensus-engine) — 핵심에 있는 AI 지원 합의.
* [토크노믹스](/architecture/tokenomics) — QOR 공급량, 소각, 리베이스, 발행.
* [퀵스타트](/getting-started/quickstart) — 로컬 노드를 띄우고 빌드를 시작하세요.
