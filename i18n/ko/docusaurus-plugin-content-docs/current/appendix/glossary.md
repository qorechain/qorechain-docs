---
slug: /appendix/glossary
title: 용어집
sidebar_label: 용어집
sidebar_position: 1
---

# 용어집

QoreChain 문서 전반에서 사용되는 용어, 약어, 두문자어를 알파벳순으로 정리한 참조 문서입니다.

---

**AMM** — Automated Market Maker(자동화 마켓 메이커). 외부 스마트 컨트랙트 배포 없이 프로토콜 수준에서 직접 상수곱 풀, 스왑, 유동성 공급을 제공하는 QoreChain의 네이티브 온체인 유동성 모듈(`x/amm`). [AMM](/architecture/amm)을 참조하세요.

**Authorisation window (EVM)(EVM 승인 창)** — 포스트 양자 서명이 된 Cosmos 레인 메시지로 열리는 제한된 권한(블록 수, 트랜잭션 수, 총 가치)으로, v3.2.0부터 EVM 레인 트랜잭션은 반드시 이 범위 안에 있어야 합니다. [EVM 승인 창](/getting-started/first-transaction#evm-window)을 참조하세요.

**BPF** — Berkeley Packet Filter. SVM 런타임이 온체인 프로그램을 실행하는 데 사용하는 바이트코드 형식. 프로그램은 배포 전에 BPF로 컴파일됩니다.

**Chain License** — `x/license` 모듈이 관리하는 온체인 라이선스 레코드. 체인 라이선스는 특정 프로토콜 기능에 대한 접근을 게이트하며, 운영자가 온체인에서 라이선스 권한을 등록, 검증, 관리할 수 있게 합니다. [체인 라이선싱](/architecture/chain-licensing)을 참조하세요.

**Circuit breaker(서킷 브레이커)** — 개별 메시지 유형을 네트워크 전체에서 끄는 Cosmos SDK 메커니즘. 현재 목록은 `/cosmos/circuit/v1/disable_list`에서 조회할 수 있습니다. [체인 파라미터](/appendix/chain-parameters#circuit-breaker)를 참조하세요.

**CLFB** — Cross-Layer Fee Bundling(계층 간 수수료 묶음). 소스 계층에서 한 번 지불하는 수수료로 계층 간 경로의 여러 계층에 걸친 실행을 모두 처리하는 방식(`x/multilayer`의 `cross_layer_fee_bundling` 파라미터). [멀티레이어 아키텍처](/architecture/multilayer-architecture)를 참조하세요.

**CPI** — Cross-Program Invocation(프로그램 간 호출). 동일한 트랜잭션 컨텍스트 내에서 배포된 한 프로그램이 다른 프로그램을 호출할 수 있게 하는 SVM 런타임의 메커니즘.

**CPoS** — Composite Proof-of-Stake(복합 지분 증명). 평판과 위임을 기반으로 검증자를 세 개의 풀(RPoS, DPoS, PoS)로 그룹화하는 QoreChain의 컨센서스 분류 설계. 각 풀은 제안자 선택 알고리즘에서 별도의 가중치를 가집니다. `x/qca`에 구현되어 있지만 아직 블록 생성에서는 활성화되지 않았습니다.

**DA** — Data Availability(데이터 가용성). 체인에 게시된 트랜잭션 데이터를 모든 노드가 검색할 수 있다는 보장. RDK 모듈은 롤업을 위한 네이티브 DA를 제공하며, blob을 구성 가능한 보관 기간으로 온체인에 저장합니다.

**DPoS** — Delegated Proof-of-Stake(위임 지분 증명). 토큰 보유자가 자신의 지분을 검증자에게 위임하면 검증자가 그들을 대신해 블록을 생성하는 컨센서스 메커니즘.

**EIP-1559** — Ethereum Improvement Proposal 1559. 기본 수수료(소각)에 우선 수수료(검증자에게 지급)를 더한 형태의 트랜잭션 수수료 모델. QoreChain은 QoreChain EVM 엔진에서 EIP-1559 방식의 수수료 메커니즘을 구현합니다.

**HCS** — Hierarchical Commitment Schemes(계층적 커밋먼트 체계). 사이드체인, 페이체인, 롤업이 자신의 상태 루트를 주기적으로 메인 체인에 앵커링하는 메커니즘(멀티레이어 아키텍처 참조). 이 문서에서 *하이브리드 서명*이라고 부르는 하이브리드 secp256k1 + ML-DSA-87 서명 체계와 혼동하지 마세요.

**Hybrid sign-bytes v2(하이브리드 서명 바이트 v2)** — v3.2.0부터 ML-DSA 키가 서명하는, 도메인 태그가 붙고 체인에 바인딩된 바이트. [포스트 양자 보안](/architecture/post-quantum-security#sign-bytes-v2)을 참조하세요.

**IBC** — Inter-Blockchain Communication(블록체인 간 통신). 독립적인 블록체인 간 인증된 메시지 전달을 위한 프로토콜. QoreChain은 크로스체인 토큰 전송 및 데이터 릴레이를 위한 IBC 채널을 지원합니다.

**Light Node** — 전체 상태를 보유하지 않고, 블록 헤더를 하나 이상의 RPC 엔드포인트와 교차 확인하여 체인을 따라가는 리소스 경량 클라이언트. 다른 사용자에게 쿼리를 제공하지 않습니다. 프로토콜 수수료 분배에서는 라이트 노드 보상 프로그램을 위해 **3%** 몫을 따로 확보해 두며, 이 프로그램은 아직 등록이 열려 있지 않습니다. [라이트 노드](/light-node/overview)와 그 [보상 프로그램 현황](/light-node/overview#reward-program-status)을 참조하세요.

**MEV** — Maximal Extractable Value(최대 추출 가능 가치). 블록 내 트랜잭션을 재정렬, 삽입, 검열하여 얻을 수 있는 이익. QoreChain의 FairBlock 모듈(tIBE 암호화)은 MEV 추출을 완화하도록 설계되었으며, 아직 활성화되지 않았습니다.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm(보안 수준 5). QoreChain이 양자 내성 트랜잭션 서명에 사용하는 NIST 표준화 포스트 양자 디지털 서명 체계. 4,627바이트의 서명과 2,592바이트의 공개키를 생성합니다.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism(보안 수준 5). 향후 암호화 통신 채널을 위해 QoreChain의 PQC 알고리즘 레지스트리에서 사용 가능한 NIST 표준화 포스트 양자 키 캡슐화 체계.

**MLP** — Multi-Layer Perceptron(다층 퍼셉트론). 사기 탐지 및 이상 점수화의 패턴 인식을 위해 QCAI가 사용하는 신경망의 한 종류.

**PPO** — Proximal Policy Optimization. 관측된 네트워크 조건을 기반으로 체인 파라미터(블록 시간, 가스 가격, 풀 가중치; 검증자 집합 크기는 로그로만 기록)를 최적화하기 위해 PRISM이 사용하는 강화학습 알고리즘. 라이브 네트워크에는 학습된 정책이 로드되어 있지 않습니다.

**PQC** — Post-Quantum Cryptography(포스트 양자 암호). 고전 및 양자 컴퓨터의 공격에 대해 안전하도록 설계된 암호 알고리즘. QoreChain은 ML-DSA-87을 기본 서명 체계로 하여 `x/pqc` 모듈을 통해 PQC를 구현합니다.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. QoreChain 컨센서스 엔진(`x/rlconsensus` 모듈을 통해)에 내장된 강화학습 최적화 계층. PRISM은 네트워크 지표를 관측하며, 서킷 브레이커 안전 제어 하에 결정론적 컨센서스 파라미터 조정을 제안하도록 설계되었습니다. 현재는 관찰 모드로 실행됩니다. [PRISM 컨센서스 엔진](/architecture/prism-consensus-engine)을 참조하세요.

**Protocol feature(프로토콜 기능)** — 릴리스의 업그레이드 핸들러가 모든 노드에서 특정 블록 높이에 켜는 동작 스위치(예: `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`)로, 그 높이 이전의 히스토리는 변경 없이 그대로 재생됩니다.

**PvP Rebase** — Player versus Player Rebase. 조기 해제로 인한 페널티가 남아 있는 잠금 스테이커들에게 비례 재분배되어 장기 참여를 보상하는 xQORE 모듈의 메커니즘(아직 온체인에 연결되지 않음).

**QCAI** — QoreChain Artificial Intelligence. 온체인 휴리스틱 엔진(`x/ai` 모듈)과 고급 추론 기능을 제공하는 오프체인 QCAI 사이드카를 포함한 QoreChain AI 서브시스템을 총칭하는 용어.

**QCB** — QoreChain Bridge. 비IBC 체인(예: Ethereum, Bitcoin, Solana, Avalanche)에 연결하기 위한 QoreChain의 네이티브 브리지 프로토콜. QCB는 크로스체인 증명을 위해 검증자 증명 임계값(ML-DSA-87 서명 10개 중 7개)을 사용합니다. [브리지 아키텍처](/architecture/bridge-architecture)를 참조하세요.

**QDRW** — Quadratic Delegation with Reputation Weighting(평판 가중 이차 위임). 거버넌스 투표권 공식(지분의 제곱근에 가중 xQORE를 더한 값에 평판 승수를 곱함). `x/qca`에 구현되어 있지만 라이브 네트워크에서는 비활성화되어 있습니다(`qdrw_enabled = false`).

**RDK** — Rollup Development Kit(롤업 개발 키트). 네 가지 정산 패러다임(optimistic, zk, based, sovereign), 다섯 가지 프리셋 프로파일, 통합 데이터 가용성을 갖춘, 롤업을 배포하고 관리하기 위한 QoreChain의 네이티브 프레임워크. [롤업 개요](/rollups/overview)를 참조하세요.

**RL** — Reinforcement Learning(강화학습). 에이전트가 시행과 보상을 통해 최적의 행동을 학습하는 머신러닝 접근법. PRISM은 QoreChain 컨센서스 엔진 내에서 체인 파라미터를 튜닝하기 위해 RL을 사용하도록 설계되었습니다(현재는 관찰만 수행).

**RPoS** — Reputation Proof-of-Stake(평판 지분 증명). 평판 70번째 백분위수 이상이면서 자체 본딩 지분이 최소 중앙값 이상인 검증자를 위한 풀. 검증자는 가동시간, 참여, 커뮤니티 기여를 통해 평판을 획득합니다.

**SHAKE-256** — SHA-3 계열의 가변 출력 길이 해시 함수. SHAKE-256은 QoreChain의 기본 애플리케이션 해시(`qorehash` 패키지)이며 키 파생 등 PQC 관련 작업에 사용됩니다.

**SNARK** — Succinct Non-interactive Argument of Knowledge. 작은 증명 크기로 빠르게 검증할 수 있는 영지식 증명의 한 종류. zk-롤업을 위한 RDK 모듈의 정산 패러다임으로 지원됩니다.

**STARK** — Scalable Transparent Argument of Knowledge. 신뢰할 수 있는 설정(trusted setup)이 필요 없고 양자 내성을 갖춘 영지식 증명 시스템. RDK에서 zk-롤업 정산을 위한 대체 증명 시스템으로 사용할 수 있습니다.

**Stranded staker share / reward-pool reserve(미지급 스테이커 지분 / 보상 풀 준비금)** — v3.2.0 업그레이드 시점에 기록된 금액으로, 거버넌스 투표를 통해서만 이동합니다. [토크노믹스](/architecture/tokenomics#stranded-and-reserve)를 참조하세요.

**SVM** — Solana Virtual Machine. BPF 프로그램을 위한 고성능 실행 환경. QoreChain은 SVM을 QoreChain EVM 엔진 및 CosmWasm과 함께 지원되는 세 가지 런타임 중 하나로 통합합니다.

**TEE** — Trusted Execution Environment(신뢰 실행 환경). 코드와 데이터가 외부 접근으로부터 보호되도록 보장하는 프로세서의 보안 영역. QoreChain은 TEE 증명을 위한 인터페이스 사양을 정의하지만, 아직 구현은 없습니다.

**tIBE** — Threshold Identity-Based Encryption(임계값 신원 기반 암호화). 임계값 수의 당사자가 협력할 때만 메시지를 복호화할 수 있는 암호 체계. FairBlock 모듈이 블록 확정 시까지 트랜잭션 내용을 암호화하여 MEV 추출을 방지하는 데 사용합니다.

**uqor** — QOR 토큰의 기본 단위. 1 QOR = 1,000,000 uqor(10^6). 모든 온체인 금액, 수수료, 스테이킹 값은 uqor 단위로 표시됩니다.

**xQORE** — QOR의 거버넌스 스테이킹 파생물. 사용자는 QOR를 잠가 xQORE를 받으며, 이는 향상된 거버넌스 투표권을 부여하고 조기 해제 페널티로부터 PvP 리베이스 보상을 획득합니다(설계된 동작이며, 잠금 및 해제 트랜잭션은 아직 온체인에 연결되지 않음). [토크노믹스](/architecture/tokenomics#x-xqore)를 참조하세요.
