---
slug: /appendix/networks
title: 네트워크
sidebar_label: 네트워크
sidebar_position: 4
---

# 네트워크

QoreChain 네트워크에 대한 통합 참조 문서입니다 — 체인 식별자, EVM 체인 ID, 토큰 단위, 주소 접두사, 표준 서비스 포트. 전체 노드 연결 세부 정보(공개 엔드포인트, 시드, 제네시스)는 아래에 연결된 연결 가이드를 따르세요. 운영자는 공식 릴리스에서 현재의 공개 엔드포인트, 시드, 제네시스를 얻습니다.

## 네트워크 한눈에 보기

| | 메인넷 | 테스트넷 |
|---|---|---|
| **상태** | 가동 중 | 활성 테스트넷 |
| **Cosmos 체인 ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM 체인 ID (EIP-155)** | **9801** (16진수 `0x2649`) | **9800** (16진수 `0x2648`) |
| **가동 시작** | 2026년 6월 7일, 23:59 UTC | — |
| **체인 버전** | v3.1.77 | v3.1.77 |
| **프레임워크** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **연결 가이드** | [메인넷 연결하기](/getting-started/connecting-to-mainnet) | [테스트넷 연결하기](/getting-started/connecting-to-testnet) |

## 토큰 및 주소

| 항목 | 값 |
|---|---|
| **표시 단위** | QOR |
| **기본 단위** | uqor (1 QOR = 10⁶ uqor) |
| **Bech32 계정 접두사** | `qor` (예: `qor1...`) |
| **Bech32 검증자 접두사** | `qorvaloper` (예: `qorvaloper1...`) |

## 표준 포트

다음은 QoreChain 노드가 노출하는 표준 서비스 포트입니다. 실제 공개 엔드포인트 호스트명은 공식 릴리스와 함께 게시됩니다 — 위의 연결 가이드를 참조하세요.

| 서비스 | 포트 |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (Solana 호환) JSON-RPC | 8899 |
| Prometheus 메트릭 | 26660 |

## 엔드포인트 및 접근

QoreChain은 이 참조 문서에서 고정된 공개 RPC/REST/EVM 호스트명을 게시하지 않습니다. 대신:

- 노드 연결, 시드, 제네시스는 [메인넷 연결하기](/getting-started/connecting-to-mainnet) 또는 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 따르세요. 운영자는 공식 릴리스에서 현재의 공개 엔드포인트, 시드, 제네시스를 얻습니다.
- 애플리케이션에서 프로그래밍 방식으로 접근하려면 네트워크 구성을 자동으로 해석해 주는 [QoreChain SDK](/sdk/overview)를 사용하세요.
- 온체인 **익스플로러**는 [dashboard.qorechain.io](https://dashboard.qorechain.io)의 대시보드를 통해 이용할 수 있으며, 테스트넷 **포셋(Faucet)**도 같은 곳에서 접근할 수 있습니다([대시보드 포셋](/dashboard/faucet) 참조).
- 본 문서는 [docs.qorechain.io](https://docs.qorechain.io)에 게시됩니다.

## MetaMask에 추가하기

MetaMask와 같은 EVM 지갑에 QoreChain 네트워크를 추가하려면, 위의 EVM 체인 ID — 메인넷은 **9801**, 테스트넷은 **9800** — 와 함께 연결하려는 네트워크의 EVM JSON-RPC 엔드포인트를 사용하세요. 단계별 안내는 [지갑 설정](/getting-started/wallet-setup)을 참조하세요.

## 관련 문서

* [메인넷 연결하기](/getting-started/connecting-to-mainnet) — 가동 중인 `qorechain-vladi` 네트워크에 합류하기.
* [테스트넷 연결하기](/getting-started/connecting-to-testnet) — Diana 테스트넷에 합류하기.
* [체인 파라미터](/appendix/chain-parameters) — 표준 체인 구성.
* [SDK 개요](/sdk/overview) — 코드에서 네트워크 구성 해석하기.
