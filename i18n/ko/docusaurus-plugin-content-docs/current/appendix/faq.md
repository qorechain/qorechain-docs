---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# 자주 묻는 질문

QoreChain에 관한 일반적인 질문을 문서 기반으로 답변합니다. 각 답변에는 자세한 내용을 담은 공식 페이지가 연결되어 있습니다. SDK 관련 질문은 [SDK FAQ](/sdk/faq)를 참조하세요.

### 메인넷이 가동 중인가요?

네. QoreChain 메인넷(체인 `qorechain-vladi`, EVM 체인 ID 9801)은 2026년 6월 7일부터 가동되고 있습니다. [네트워크](/appendix/networks)와 [메인넷 연결하기](/getting-started/connecting-to-mainnet)를 참조하세요.

### 체인 ID와 EVM 체인 ID는 무엇인가요?

메인넷은 Cosmos 체인 `qorechain-vladi`이며 EVM 체인 ID는 **9801**(16진수 `0x2649`)입니다. 테스트넷은 `qorechain-diana`이며 EVM 체인 ID는 **9800**(16진수 `0x2648`)입니다. 전체 표는 [네트워크](/appendix/networks)를 참조하세요.

### 트랜잭션 수수료는 어떻게 분배되나요?

징수된 수수료는 **37%는 검증자에게, 30%는 소각, 20%는 커뮤니티 트레저리에, 10%는 스테이커에게, 3%는 라이트 노드에게** 분배됩니다. [토크노믹스](/architecture/tokenomics)를 참조하세요.

### PRISM이란 무엇인가요?

PRISM은 QoreChain 컨센서스 엔진에 내장된 강화학습 최적화 계층입니다. 네트워크 지표를 관측하고 서킷 브레이커 안전 제어 하에 결정론적 컨센서스 파라미터 조정을 제안합니다. [PRISM 컨센서스 엔진](/architecture/prism-consensus-engine)을 참조하세요.

### 크로스체인 브리지가 가동 중인가요?

크로스체인 브리지는 현재 테스트넷 상태이며 보류 중입니다. 아직 프로덕션 시스템이 아닙니다. 37개의 QCB 체인 구성과 8개의 IBC 채널을 중심으로 설계되었으나, 이 목표치는 라이브 메인넷의 보장이 아닌 설계 의도로 간주해야 합니다. [브리지 아키텍처](/architecture/bridge-architecture)를 참조하세요.

### 지갑은 어떻게 연결하나요?

지갑을 설정하고 EVM 체인 ID(메인넷 9801, 테스트넷 9800)를 사용해 QoreChain 네트워크를 추가하세요. [지갑 설정](/getting-started/wallet-setup)을 참조하세요.

### 테스트넷 토큰은 어떻게 받나요?

대시보드의 테스트넷 포셋(faucet)을 사용하세요. [대시보드 포셋](/dashboard/faucet)과 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참조하세요.

### 노드, 검증자, 라이트 노드는 어떻게 운영하나요?

풀 노드는 [노드 운영하기](/developer-guide/running-a-node)를 참조하세요. 검증자는 [검증자 운영하기](/developer-guide/running-a-validator)를 참조하세요. 라이트 노드는 [라이트 노드](/light-node/overview)를 참조하세요.

### QoreChain은 어떤 서명 체계를 사용하나요?

QoreChain은 고전 **secp256k1 (ECDSA)**와 포스트 양자 **ML-DSA-87 (Dilithium-5)**를 결합한 포스트 양자 하이브리드 체계를 사용합니다. 이 하이브리드 체계는 Cosmos 트랜잭션 경로에서 기본적으로 필수이며, 강제 모드는 거버넌스로 제어됩니다. [포스트 양자 보안](/architecture/post-quantum-security)을 참조하세요.

### 롤업은 어떻게 구축하나요?

QoreChain 롤업 개발 키트(Rollup Development Kit)를 사용하세요. [롤업](/rollups/overview)과 [롤업 개발 키트](/architecture/rollup-development-kit) 아키텍처 참조 문서를 보세요.

### dApp은 어떻게 구축하나요?

QoreChain의 EVM, SVM, CosmWasm 실행 환경 전반에 걸쳐 애플리케이션을 구축하기 위한 공개 SDK인 [QoreChain SDK](/sdk/overview)를 사용하세요.

### 질문은 어디서 할 수 있나요?

QCAIA 커뮤니티 봇이 Discord([discord.gg/qorechain](https://discord.gg/qorechain))와 Telegram([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity))에서 질문에 답합니다. [QCAIA 커뮤니티 봇](/qcaia/overview)을 참조하세요.

## 관련 문서

* [네트워크](/appendix/networks) — 체인 ID, 포트, 엔드포인트 참조.
* [QoreChain이란](/introduction/what-is-qorechain) — 플랫폼 개요.
* [QCAIA 커뮤니티 봇](/qcaia/overview) — Discord와 Telegram에서 질문하기.
