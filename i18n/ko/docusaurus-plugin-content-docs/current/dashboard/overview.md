---
slug: /dashboard/overview
title: 대시보드 개요 및 시작하기
sidebar_label: 개요 및 시작하기
sidebar_position: 1
---

# 대시보드 개요 및 시작하기

**[dashboard.qorechain.io](https://dashboard.qorechain.io)**의 QoreChain 대시보드는 브라우저에서 QoreChain을 사용하기 위한 공식 웹 앱입니다. 한곳에서 체인 탐색, 지갑 관리, 토큰 스왑, 체인 간 자산 이동, 스마트 컨트랙트 생성 및 감사, 검증인 스테이킹, 테스트넷 토큰 수령, 퀘스트 완료를 할 수 있으며 네트워크의 도구 모음에도 접근할 수 있습니다.

이 섹션의 모든 내용은 사용자 사용 안내입니다: 각 페이지가 무엇을 하고 어떻게 사용하는지 설명합니다. 설치는 필요하지 않습니다 — 대시보드는 전적으로 브라우저에서 실행됩니다.

## 할 수 있는 일

| 영역 | 용도 |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | 블록, 트랜잭션, 주소, 검증인을 탐색합니다. |
| **[Wallet](/dashboard/wallet)** | 잔액과 내역을 확인하고 QOR을 수령합니다 — 메인넷에서는 본인 소유 지갑(비수탁형)으로, 테스트넷에서는 대시보드가 관리하는 테스트 지갑으로 사용합니다. |
| **[Trade](/dashboard/trade)** | 온체인 AMM에서 토큰을 스왑하고 유동성을 공급합니다. |
| **[Bridge](/dashboard/bridge)** | QoreChain과 다른 체인 간에 자산을 이동합니다. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | 지원되는 17개 블록체인에서 **QCAI**로 스마트 컨트랙트를 생성합니다. |
| **[Contract Auditor](/dashboard/contract-auditor)** | 스마트 컨트랙트에 대해 **QCAI** 보안 분석을 실행합니다. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | 검증인을 검토하고 QOR을 위임합니다. |
| **[Faucet](/dashboard/faucet)** | 테스트넷에서 테스트 토큰을 요청합니다. |
| **[Quests](/dashboard/quests)** | 안내형 과제를 완료하며 네트워크를 배웁니다. |
| **[Tools Hub](/dashboard/tools-hub)** | 노드, 롤업, SDK, 라이선스 도구에 접근합니다. |

## 지갑 연결 {#connect-your-wallet}

토큰 전송, 스왑, 스테이킹, 브리징처럼 온체인 상태를 변경하는 대부분의 작업에는 연결된 지갑이 필요합니다. 대시보드가 키를 다루는 방식은 네트워크에 따라 다릅니다:

- **메인넷은 비수탁형입니다.** 대시보드는 메인넷 키를 절대 보관하지 않습니다. 본인 소유 지갑 — Native 레일용 **Keplr** 또는 EVM 레일용 **MetaMask** — 을 연결하면 대시보드가 체인에서 실제 잔액과 내역을 읽어옵니다. 모든 메인넷 트랜잭션은 대시보드가 아닌 본인 지갑에서 서명됩니다.
- **테스트넷은 수탁형입니다.** 대시보드가 테스트 지갑을 대신 관리하므로, 별도 설정 없이 실제 가치의 위험 없이 실험할 수 있습니다.

메인넷에서 연결하려면:

1. [dashboard.qorechain.io](https://dashboard.qorechain.io)를 열고 헤더에 **Mainnet**이 표시되어 있는지 확인합니다.
2. 메인넷 페이지를 처음 방문하는 경우, 1회성 위험 고지(아래 참조)를 읽고 동의합니다.
3. **Connect Wallet**을 선택하고 **Keplr**(Native 레일) 또는 **MetaMask**(EVM 레일)를 고릅니다.
4. 지갑에서 연결을 승인합니다.

연결이 완료되면 대시보드가 헤더에 주소를 (축약된 형태로) 표시하고, 서명이 필요한 작업을 사용할 수 있게 됩니다. Explorer와 같은 읽기 전용 페이지는 연결 없이도 동작합니다.

QoreChain 계정은 `qor` bech32 접두사를 사용하므로 연결된 주소는 `qor1...` 형태로 표시됩니다 — 같은 계정은 EVM(`0x...`) 인코딩과 SVM(base58) 인코딩도 함께 가집니다. 계정은 양자 내성 암호화로 보호됩니다. 최초 설정 안내는 [Wallet Setup](/getting-started/wallet-setup)을, 지갑이 아직 네트워크를 알지 못하는 경우에는 [Add QoreChain to your wallet](/dashboard/wallet#add-network)을 참조하세요.

### 1회성 위험 고지 {#risk-acknowledgement}

메인넷 페이지를 사용하기 전에 대시보드는 1회성 면책 고지에 대한 동의를 요청합니다. 이 고지는 메인넷 트랜잭션이 **실제 자금**을 이동시킨다는 점, 대시보드가 **비수탁형**이라는 점(키는 오직 본인만 관리), 그리고 온체인 트랜잭션은 **되돌릴 수 없다**는 점을 이해했음을 확인하는 것입니다. 한 번 동의하면 이후에는 메인넷 페이지가 바로 열립니다.

## 네트워크 선택

대시보드는 두 개의 네트워크에서 동작합니다. 헤더에는 현재 연결된 네트워크가 표시됩니다.

| 네트워크 | 체인 ID | 사용 시점 |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | 실제 가치와 프로덕션 용도의 라이브 네트워크입니다. 비수탁형: 본인 소유 지갑을 연결합니다. |
| **Testnet** | `qorechain-diana` | 테스트를 위한 무료 환경으로, 대시보드가 관리하는 테스트 지갑과 테스트 토큰용 [Faucet](/dashboard/faucet)을 제공합니다. |

네이티브 토큰은 **QOR**(기본 단위 `uqor`, 1 QOR = 10^6 uqor)입니다. 처음이라면 테스트넷에서 시작해 Faucet에서 토큰을 받고 첫 전송을 시도해 본 뒤 메인넷으로 넘어가세요.

:::tip QoreChain이 처음이신가요?
[Connecting to Testnet](/getting-started/connecting-to-testnet)과 [Your First Transaction](/getting-started/first-transaction)을 따라 빠르게 실습해 본 다음, 다시 돌아와 대시보드의 나머지 기능을 살펴보세요.
:::

## 관련 문서

* [Explorer](/dashboard/explorer) — 블록, 트랜잭션, 계정을 탐색합니다.
* [Wallet](/dashboard/wallet) — 계정을 관리하고 트랜잭션을 전송합니다.
* [Trade / DEX](/dashboard/trade) — 온체인 AMM 풀에서 토큰을 스왑합니다.
* [Bridge](/dashboard/bridge) — 체인 간에 자산을 이동합니다.
* [Tools Hub](/dashboard/tools-hub) — 라이선스, faucet, 개발자 유틸리티.
