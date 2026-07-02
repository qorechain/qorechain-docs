---
slug: /appendix/networks
title: 네트워크
sidebar_label: 네트워크
sidebar_position: 4
---

# 네트워크

QoreChain 네트워크에 대한 통합 레퍼런스 — 체인 식별자, EVM 체인 ID, 토큰 표시 단위, 주소 접두사, 퍼블릭 엔드포인트, 표준 서비스 포트를 정리합니다.

## 네트워크 한눈에 보기

| | 메인넷 | 테스트넷 |
|---|---|---|
| **상태** | 라이브 | 활성 테스트넷 |
| **Cosmos 체인 ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM 체인 ID (EIP-155)** | **9801** (16진수 `0x2649`) | **9800** (16진수 `0x2648`) |
| **라이브 시작** | 2026년 6월 7일 23:59 UTC | — |
| **체인 버전** | v3.1.82 | v3.1.82 |
| **프레임워크** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **최소 가스 가격** | `0.1uqor` | `0.1uqor` |
| **연결 가이드** | [메인넷에 연결하기](/getting-started/connecting-to-mainnet) | [테스트넷에 연결하기](/getting-started/connecting-to-testnet) |

## 퍼블릭 엔드포인트 {#public-endpoints}

모든 퍼블릭 엔드포인트는 HTTPS로 제공됩니다.

| 서비스 | 메인넷 | 테스트넷 |
|---|---|---|
| 합의(Consensus) RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| 합의 WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (Solana 호환, 읽기 전용) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| 블록 익스플로러 | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (Testnet으로 전환) |
| 다운로드 (바이너리 / 제네시스 / 스냅샷) | [download.qore.host](https://download.qore.host) | — |

:::note
퍼블릭 SVM 엔드포인트는 **읽기 전용**입니다(트랜잭션 제출은 엣지에서 비활성화되어 있습니다). SVM 쓰기가 필요하면 자체 노드를 운영하세요. 대규모 또는 프로덕션 워크로드의 경우에도 자체 노드 운영을 권장합니다 — [노드 실행하기](/developer-guide/running-a-node)를 참고하세요.
:::

## 토큰 및 주소

| 항목 | 값 |
|---|---|
| **표시 단위(display denom)** | QOR |
| **기본 단위(base denom)** | uqor (1 QOR = 10⁶ uqor) |
| **인터페이스별 소수 자릿수** | Cosmos **6** (`uqor`) · EVM **18** (wei 방식; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1,000 lamports) |
| **HD 코인 타입 (BIP-44)** | `118` |
| **Bech32 계정 접두사** | `qor` (예: `qor1...`) |
| **Bech32 검증인 접두사** | `qorvaloper` (예: `qorvaloper1...`) |

세 인터페이스는 **하나로 통합된 네이티브 QOR 잔액**을 노출합니다. 동일한 키가 `qor1...`(Cosmos), `0x...`(EVM), base58(SVM) 주소 형식 아래에서 동일한 자금을 제어합니다.

## 표준 포트

직접 운영하는 QoreChain 노드가 노출하는 표준 서비스 포트입니다.

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

- 노드 연결, 피어, 제네시스, 스냅샷에 대해서는 [메인넷에 연결하기](/getting-started/connecting-to-mainnet) 또는 [테스트넷에 연결하기](/getting-started/connecting-to-testnet)를 따르세요.
- 애플리케이션에서 프로그래밍 방식으로 접근하려면 네트워크 설정을 자동으로 해석해 주는 [QoreChain SDK](/sdk/overview)를 사용하세요.
- 퍼블릭 **블록 익스플로러**는 [explore.qore.network](https://explore.qore.network)에 있습니다. [dashboard.qorechain.io](https://dashboard.qorechain.io)의 대시보드에는 자체 익스플로러 화면이 포함되어 있으며, 테스트넷 **Faucet**도 그곳에서 이용할 수 있습니다([대시보드 Faucet](/dashboard/faucet) 참고).
- 이 문서는 [docs.qorechain.io](https://docs.qorechain.io)에 게시되어 있습니다.

## MetaMask에 추가하기

MetaMask 같은 EVM 지갑에 QoreChain 네트워크를 추가하려면 위의 EVM 체인 ID를 사용하세요 — 메인넷은 **9801**과 `https://evm.qore.host`, 테스트넷은 **9800**과 `https://evm-testnet.qore.host`를 사용하고, 블록 익스플로러 URL로는 `https://explore.qore.network`를 입력합니다. 단계별 안내는 [지갑 설정](/getting-started/wallet-setup)을 참고하세요.

## 관련 문서

* [메인넷에 연결하기](/getting-started/connecting-to-mainnet) — 라이브 `qorechain-vladi` 네트워크에 참여합니다.
* [테스트넷에 연결하기](/getting-started/connecting-to-testnet) — Diana 테스트넷에 참여합니다.
* [거래소 및 통합사 가이드](/developer-guide/exchange-integration) — 통합사를 위한 입금, 출금, 노드 운영 안내.
* [체인 파라미터](/appendix/chain-parameters) — 표준 체인 구성.
* [SDK 개요](/sdk/overview) — 코드에서 네트워크 설정을 해석합니다.
