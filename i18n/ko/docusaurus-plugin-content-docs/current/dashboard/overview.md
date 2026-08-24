---
slug: /dashboard/overview
title: 대시보드 개요 및 시작하기
sidebar_label: 개요 및 시작하기
sidebar_position: 1
---

# 대시보드 개요 및 시작하기

**[dashboard.qorechain.io](https://dashboard.qorechain.io)**의 QoreChain 대시보드는 브라우저에서 QoreChain을 사용하기 위한 공식 웹 앱입니다. 한곳에서 체인을 탐색하고, 지갑을 관리하고, 토큰을 스왑하고, 여러 체인 간에 자산을 이동하고, 스마트 컨트랙트를 생성하고 감사하고, 밸리데이터에게 스테이킹하고, 테스트넷 토큰을 청구하고, 퀘스트를 완료하고, 네트워크의 도구에 접근할 수 있습니다.

이 섹션의 모든 내용은 사용자용 사용법 안내입니다. 각 페이지가 무엇을 하는지, 어떻게 사용하는지를 다룹니다. 설치는 필요 없습니다 — 대시보드는 전적으로 브라우저 안에서 실행됩니다.

## 할 수 있는 것들

| 영역 | 용도 |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | 블록, 트랜잭션, 주소, 밸리데이터를 조회합니다. |
| **[Wallet](/dashboard/wallet)** | 잔액과 내역을 확인하고 QOR을 받습니다 — 메인넷에서는 본인 소유의 지갑(비수탁형)으로, 테스트넷에서는 대시보드가 관리하는 테스트 지갑으로 이용합니다. |
| **[Trade](/dashboard/trade)** | 온체인 AMM에서 토큰을 스왑하고 유동성을 공급합니다. |
| **[Bridge](/dashboard/bridge)** | QoreChain과 다른 체인 간에 자산을 이동합니다. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | **QCAI**로 17개 지원 블록체인용 스마트 컨트랙트를 생성합니다. |
| **[Contract Auditor](/dashboard/contract-auditor)** | 스마트 컨트랙트에 대해 **QCAI** 보안 분석을 실행합니다. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | 밸리데이터를 검토하고 QOR을 위임합니다. |
| **[Faucet](/dashboard/faucet)** | 테스트넷에서 테스트 토큰을 요청합니다. |
| **[Quests](/dashboard/quests)** | 안내된 과제를 완료하며 네트워크를 배웁니다. |
| **[Tools Hub](/dashboard/tools-hub)** | 노드, 롤업, SDK, 라이선싱 도구에 접근합니다. |

## 지갑 연결하기 {#connect-your-wallet}

온체인 상태를 변경하는 대부분의 작업 — 토큰 전송, 스왑, 스테이킹, 브리징 — 은 지갑 연결이 필요합니다. 대시보드가 키를 다루는 방식은 네트워크에 따라 다릅니다.

- **메인넷은 비수탁형입니다.** 대시보드는 여러분의 메인넷 키를 절대 보관하지 않습니다. 본인 소유의 지갑 — **QoreX**(공식 QoreChain 지갑, 확장 프로그램 또는 앱), **Keplr**, 또는 **MetaMask** — 를 연결하면 대시보드가 체인에서 실제 잔액과 내역을 읽어옵니다. 모든 메인넷 트랜잭션은 대시보드가 아니라 반드시 본인의 지갑에서 서명됩니다. **네이티브 레일**에서의 전송과 스테이킹은 **QoreX가 필요**합니다. QoreChain 계정은 포스트 양자 하이브리드 서명으로 서명되며, 오늘 기준 이 서명을 생성할 수 있는 것은 QoreX뿐이기 때문입니다. Keplr은 네이티브 레일 잔액을 조회하기 위해 연결할 수는 있습니다. **MetaMask**는 **EVM 레일**에서 독립적으로 서명하고 전송합니다.
- **테스트넷은 수탁형입니다.** 대시보드가 여러분을 위해 테스트 지갑을 관리하므로, 별도 설정 없이 실제 자산 위험 없이 자유롭게 실험할 수 있습니다.

### QoreX로 연결하기 (권장) {#connect-qorex}

QoreX는 공식 QoreChain 지갑입니다. 대시보드의 **Connect with QoreX** 카드는 동일한 진입점에서 브라우저 확장 프로그램과 모바일 앱을 모두 지원합니다.

1. [dashboard.qorechain.io](https://dashboard.qorechain.io)를 열고 헤더에 **Mainnet**이 표시되는지 확인합니다.
2. 메인넷 페이지를 처음 방문하는 경우, [일회성 위험 고지](#risk-acknowledgement)를 읽고 동의합니다.
3. **Connect Wallet**(또는 지갑 카드의 **Connect with QoreX**)을 선택합니다.
4. 이 브라우저에서 QoreX 브라우저 확장 프로그램이 설치되어 감지된 경우, 대시보드가 **"How do you want to connect?"**라는 문구와 함께 **Browser extension**과 **QoreX app** 두 가지 옵션을 보여줍니다. 하나를 선택하세요 — 선택 내용은 저장되므로 다음 방문 시에는 이 프롬프트가 생략됩니다(나중에 방법을 바꾸고 싶다면 언제든 **Use a different method** 링크를 사용할 수 있습니다). 확장 프로그램이 감지되지 않으면 대시보드는 바로 앱 연결 흐름으로 넘어갑니다.
   - **Browser extension**: 확장 프로그램 자체의 팝업이 열리며, 연결을 요청하는 사이트로 `dashboard.qorechain.io`가 표시됩니다. 내용을 확인하고 승인하세요 — 이는 자금 이동 없이 `qor1...` 주소의 소유를 증명하는 일회성 서명입니다. 페어링은 동일한 브라우저 세션 안에서 즉시 완료됩니다.
   - **QoreX app**: 대시보드가 QR 코드를 표시합니다(같은 휴대폰에서 접속 중이라면 앱을 바로 여는 **Open QoreX** 링크도 함께 제공됩니다). QoreX 앱을 열어 QR 코드를 스캔하거나(또는 링크를 탭하고), 대시보드의 출처가 표시된 페어링 요청을 확인한 뒤 생체 인증으로 승인합니다. 대시보드는 백그라운드에서 계속 폴링하며, 승인이 완료되면 자동으로 페어링을 마칩니다.
5. 승인이 완료되면 대시보드가 여러분의 `qor1...` 주소를 표시하고 서명이 필요한 작업들을 활성화합니다.

지갑 유형별 전체 연결 및 전송 안내는 [Wallet](/dashboard/wallet#mainnet)을, 동일한 페어링을 지갑 쪽에서 본 화면은 QoreX 문서의 [Account & Dashboard](/qorex/account-and-dashboard#dashboard) 페이지를 참고하세요.

### Keplr 또는 MetaMask로 연결하기

1. [dashboard.qorechain.io](https://dashboard.qorechain.io)를 열고 헤더에 **Mainnet**이 표시되는지 확인합니다.
2. 메인넷 페이지를 처음 방문하는 경우, 일회성 위험 고지를 읽고 동의합니다(아래 참고).
3. **Connect Wallet**을 선택하고 **Keplr** 또는 **MetaMask**를 선택합니다.
4. 지갑에서 연결을 승인합니다.

연결되면 대시보드가 헤더에 여러분의 주소를 축약된 형태로 표시합니다. MetaMask는 EVM 레일에서 전송을 비롯한 서명 작업을 직접 활성화합니다. Keplr은 네이티브 레일의 잔액과 내역 조회를 활성화합니다 — 해당 레일에서의 전송과 스테이킹은 (위에서 설명한 대로) QoreX를 통해야 합니다. QoreChain 계정은 포스트 양자 하이브리드 서명으로 서명되기 때문입니다. Explorer와 같은 읽기 전용 페이지는 연결 없이도 작동합니다.

QoreChain 계정은 `qor` bech32 프리픽스를 사용하므로, 연결된 주소는 `qor1...` 형태로 보입니다 — 동일한 계정은 EVM(`0x...`) 및 SVM(base58) 인코딩도 함께 가집니다. 계정은 양자 내성 암호화로 보호됩니다. 처음 설정하는 방법은 [Wallet Setup](/getting-started/wallet-setup)을, 지갑이 아직 네트워크를 모른다면 [Add QoreChain to your wallet](/dashboard/wallet#add-network)을 참고하세요.

### 일회성 위험 고지 {#risk-acknowledgement}

메인넷 페이지를 사용하기 전에, 대시보드는 일회성 고지에 동의할 것을 요청합니다. 이는 메인넷 트랜잭션이 **실제 자금**을 움직인다는 것, 대시보드가 **비수탁형**이라는 것(오직 본인만 키를 통제합니다), 그리고 온체인 트랜잭션은 **되돌릴 수 없다는** 것을 이해했음을 확인하는 절차입니다. 한 번 동의하면 이후에는 메인넷 페이지가 바로 열립니다.

## 네트워크 선택하기

대시보드는 두 개의 네트워크에서 동작합니다. 헤더에는 현재 연결된 네트워크가 표시됩니다.

| 네트워크 | 체인 ID | 사용 시점 |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | 실제 가치와 프로덕션 사용을 위한 라이브 네트워크. 비수탁형: 본인의 지갑을 연결합니다. |
| **Testnet** | `qorechain-diana` | 테스트를 위한 무료 환경으로, 대시보드가 관리하는 테스트 지갑과 테스트 토큰을 위한 [Faucet](/dashboard/faucet)이 제공됩니다. |

네이티브 토큰은 **QOR**입니다(기본 단위는 `uqor`이며, 1 QOR = 10^6 uqor). 처음이라면 테스트넷에서 시작해 Faucet에서 토큰을 청구하고, 메인넷으로 넘어가기 전에 첫 전송을 먼저 시도해 보세요.

:::tip QoreChain이 처음이신가요?
[Connecting to Testnet](/getting-started/connecting-to-testnet)과 [Your First Transaction](/getting-started/first-transaction)을 따라 빠르게 실습해 본 다음, 대시보드의 나머지 부분을 탐색하러 돌아오세요.
:::

## 관련 문서

* [Explorer](/dashboard/explorer) — 블록, 트랜잭션, 계정을 조회합니다.
* [Wallet](/dashboard/wallet) — 계정을 관리하고 트랜잭션을 전송합니다.
* [Trade / DEX](/dashboard/trade) — 온체인 AMM 풀에서 토큰을 스왑합니다.
* [Bridge](/dashboard/bridge) — 여러 체인 간에 자산을 이동합니다.
* [Tools Hub](/dashboard/tools-hub) — 라이선스, faucet, 개발자 유틸리티.
