---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# 자주 묻는 질문

QoreChain에 관한 일반적인 질문을 문서 기반으로 답변합니다. 각 답변에는 자세한 내용을 담은 공식 페이지가 연결되어 있습니다. SDK 관련 질문은 [SDK FAQ](/sdk/faq)를 참조하세요.

### 메인넷이 가동 중인가요?

네. QoreChain 메인넷(체인 `qorechain-vladi`, EVM 체인 ID 9801)은 2026년 6월 7일부터 가동되고 있으며 릴리스 v3.2.4를 실행합니다(거버넌스 제안 13에 따라 2026년 10월 23일 높이 3,742,566에서 적용. 거버넌스 제안 14는 높이 3,906,833에서 v3.2.5를 적용할 예정이며 작성 시점에 투표 기간 중이었습니다). 테스트넷 `qorechain-diana`는 v3.2.6을 실행합니다(2026년 10월 27일 높이 8,970,638에서 적용). [네트워크](/appendix/networks)와 [메인넷 연결하기](/getting-started/connecting-to-mainnet)를 참조하세요.

### 체인 ID와 EVM 체인 ID는 무엇인가요?

메인넷은 Cosmos 체인 `qorechain-vladi`이며 EVM 체인 ID는 **9801**(16진수 `0x2649`)입니다. 테스트넷은 `qorechain-diana`이며 EVM 체인 ID는 **9800**(16진수 `0x2648`)입니다. 전체 표는 [네트워크](/appendix/networks)를 참조하세요.

### 트랜잭션 수수료는 어떻게 분배되나요?

징수된 수수료는 **37%는 검증자에게, 30%는 소각, 20%는 커뮤니티 트레저리에, 10%는 스테이커에게, 3%는 라이트 노드에게** 분배됩니다. 이 분배는 에포크 발행량을 포함해 수수료 징수 계정에 있는 모든 금액에 적용됩니다. [토크노믹스](/architecture/tokenomics#fee-distribution)를 참조하세요.

### PRISM이란 무엇인가요?

PRISM은 QoreChain 컨센서스 엔진에 내장된 강화학습 최적화 계층입니다. 네트워크 지표를 관측하고 서킷 브레이커 안전 제어 하에 결정론적 컨센서스 파라미터 조정을 제안합니다. 현재는 관찰 모드로 실행되며, 학습된 정책이 로드되어 있지 않으므로 어떤 파라미터도 변경하지 않습니다. [PRISM 컨센서스 엔진](/architecture/prism-consensus-engine)을 참조하세요.

### 크로스체인 브리지가 가동 중인가요?

아니요. 브리지 모듈은 배포되어 있지만 37개 체인 구성이 모두 보류 중이며, 등록된 브리지 검증자가 없고 메인넷에는 IBC 채널이 존재하지 않습니다(테스트넷에는 IBC 테스트를 위해 개설된, 테스트 체인으로 가는 단일 ICS-20 전송 채널이 하나 있을 뿐이며, 계획된 상대방으로 가는 채널은 없습니다). 37개의 체인 구성과 최대 8개의 IBC 상대방을 중심으로 설계되었으며, 이 목표치는 설계 의도로 간주해야 합니다. [브리지 아키텍처](/architecture/bridge-architecture)를 참조하세요.

### 지갑은 어떻게 연결하나요?

공식 [QoreX](/qorex/overview) 지갑을 사용하거나, EVM 체인 ID(메인넷 9801, 테스트넷 9800)를 사용해 EVM 지갑에 QoreChain 네트워크를 추가하세요. [지갑 설정](/getting-started/wallet-setup)을 참조하세요.

### 테스트넷 토큰은 어떻게 받나요?

대시보드의 테스트넷 포셋(faucet)을 사용하세요. [대시보드 포셋](/dashboard/faucet)과 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참조하세요.

### fUSD, fETH, fBTC란 무엇인가요?

빌더 페스트를 위해 만든 테스트넷 전용 테스트 토큰(FestUSD, FestETH, FestBTC이며 소수점 자릿수는 각각 6, 18, 8)입니다. 가치가 없고 메인넷에는 존재하지 않으며, 대소문자를 구분하는 `erc20:<contract address>` 단위로 뱅크 코인으로 보유됩니다. 테스트넷 포셋은 QOR 청구와 함께 이를 보낼 수 있습니다. [Fest 테스트 토큰](/dashboard/faucet#fest-tokens)을 참조하세요.

### 노드, 검증자, 라이트 노드는 어떻게 운영하나요?

풀 노드는 [노드 운영하기](/developer-guide/running-a-node)를 참조하세요. 검증자는 [검증자 운영하기](/developer-guide/running-a-validator)를 참조하세요. 라이트 노드는 [라이트 노드](/light-node/overview)를 참조하세요. 라이트 노드 보상 프로그램의 등록은 열려 있으며 라이선스로 제한되고, 2026년 10월 27일에 각 네트워크에서 라이트 노드가 한 개씩 등록되었습니다([현황](/light-node/overview#reward-program-status)).

### QoreChain은 어떤 서명 체계를 사용하나요?

QoreChain은 고전 **secp256k1 (ECDSA)**와 포스트 양자 **ML-DSA-87 (Dilithium-5)**를 결합한 포스트 양자 하이브리드 체계를 사용합니다. 이 하이브리드 체계는 Cosmos 트랜잭션 경로에서 기본적으로 필수이며, 강제 모드는 거버넌스로 제어됩니다. EVM 레인에서는 서명이 secp256k1로 유지되며, 계정은 추가로 등록된 ML-DSA 키와 열려 있는 인가 창(authorisation window)을 보유해야 합니다(v3.2.0부터). [포스트 양자 보안](/architecture/post-quantum-security)을 참조하세요.

### EVM 트랜잭션이 "no open EVM authorisation window"로 거부되는 이유는 무엇인가요?

v3.2.0부터 EVM 레인은 등록된 포스트 양자 키와 열려 있는 인가 창을 가진 계정의 트랜잭션만 받아들입니다. 포스트 양자 서명이 된 Cosmos 레인 트랜잭션으로 창을 연 다음 다시 시도하세요. [EVM 인가 창](/getting-started/first-transaction#evm-window)을 참조하세요.

### 메인넷에는 검증자가 몇 명인가요?

2026년 10월 27일 기준으로 본딩된 검증자는 8명이며, 본딩된 QOR는 약 6,030만 개입니다(활성 집합은 최대 100명까지 가능합니다). 테스트넷에는 4명이 있습니다. 실시간 집합은 `https://api.qore.host`의 `GET /cosmos/staking/v1beta1/validators`에서 확인하세요.

### 블록 시간은 어느 정도로 예상해야 하나요?

메인넷에서는 약 3.1초, 테스트넷에서는 약 1.3초입니다(2026년 10월 27일 측정 평균). 블록 시간은 검증자의 노드 구성에 따라 정해집니다.

### xQORE를 사용할 수 있나요?

아직 아닙니다. 회계 모듈은 존재하지만, 잠금 및 잠금 해제 트랜잭션은 라이브 네트워크에 연결되어 있지 않습니다. [토크노믹스](/architecture/tokenomics#x-xqore)를 참조하세요.

### QOR 공급량은 고정되어 있나요?

제네시스 공급량은 4,420,000,000 QOR였습니다. 스테이킹 발행량은 누적 590,000,000 QOR의 하드 캡 아래에서 발행되며(2026년 10월 거버넌스 제안 10 이후 에포크당 86,000 QOR), 소각은 토큰을 영구적으로 제거합니다. [토크노믹스](/architecture/tokenomics#supply-and-emission)를 참조하세요.

### 롤업은 어떻게 구축하나요?

QoreChain 롤업 개발 키트(Rollup Development Kit)를 사용하세요. [롤업](/rollups/overview)과 [롤업 개발 키트](/architecture/rollup-development-kit) 아키텍처 참조 문서를 보세요.

### dApp은 어떻게 구축하나요?

QoreChain의 EVM, SVM, QoreChain Native 실행 환경 전반에 걸쳐 애플리케이션을 구축하기 위한 공개 SDK인 [QoreChain SDK](/sdk/overview)를 사용하세요.

### 질문은 어디서 할 수 있나요?

QCAIA 커뮤니티 봇이 Discord([discord.gg/qorechain](https://discord.gg/qorechain))와 Telegram([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity))에서 질문에 답합니다. [QCAIA 커뮤니티 봇](/qcaia/overview)을 참조하세요.

## 관련 문서

* [네트워크](/appendix/networks) — 체인 ID, 포트, 엔드포인트 참조.
* [QoreChain이란](/introduction/what-is-qorechain) — 플랫폼 개요.
* [QCAIA 커뮤니티 봇](/qcaia/overview) — Discord와 Telegram에서 질문하기.
