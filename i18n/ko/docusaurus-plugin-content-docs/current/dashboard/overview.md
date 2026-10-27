---
slug: /dashboard/overview
title: 대시보드 개요 및 시작하기
sidebar_label: 개요 및 시작하기
sidebar_position: 1
---

# 대시보드 개요 및 시작하기

**[dashboard.qorechain.io](https://dashboard.qorechain.io)**의 QoreChain 대시보드는 브라우저에서 QoreChain을 사용하기 위한 공식 웹 앱입니다. 하나의 계정과 하나의 네트워크 전환만으로 익스플로러, 지갑 보기, 테스트넷 파우셋, 테스트 토큰 스왑 화면, 퀘스트, AI 컨트랙트 도구, 노드 및 밸리데이터 도구, 개발자 페이지를 이용할 수 있습니다. 아무것도 설치하지 않고 네트워크를 사용해 보고 싶은 분과, 개발하면서 빠르게 확인하고 싶은 빌더를 위한 앱입니다. 설치는 필요 없으며 브라우저에서 실행됩니다.

이 섹션은 사용자용 사용법 안내입니다. 각 페이지가 무엇을 하는지, 어떻게 여는지, 어떤 제한이 있는지를 다룹니다.

## 혁신 요소 {#innovations}

- **하나의 전환으로 모든 페이지의 네트워크가 정해집니다.** 헤더의 **Testnet / Mainnet** 컨트롤은 선택 내용을 브라우저에 저장하고 페이지를 다시 불러오므로, 서버와 브라우저가 같은 네트워크를 읽습니다. 메인넷이 기본값입니다.
- **메인넷은 비수탁형입니다.** 대시보드는 메인넷 키를 절대 보관하지 않으며 메인넷 트랜잭션에 서명하지도 않습니다. 보내기 또는 스테이킹 작업의 매개변수만 QoreX에 전달하고, QoreX가 트랜잭션을 다시 구성하여 보여주고, 서명(ML-DSA-87 하이브리드 서명)하고, 브로드캐스트합니다. 대시보드는 트랜잭션 해시만 알게 됩니다.
- **메인넷 화면에는 계정이 필요하고, 테스트넷은 열려 있습니다.** 메인넷에서는 홈 통계, Wallet, Trade, Explorer 개요가 서버에서 접근을 확인합니다. 로그아웃한 방문자에게는 "Sign in to view mainnet"이 표시됩니다.
- **실제 자금에 대한 고지, 브라우저당 한 번.** 브라우저에서 메인넷 Wallet, Trade, Explorer 개요 또는 홈 통계를 처음 볼 때, "You're entering QoreChain Mainnet"이라는 제목의 카드에 네 가지 사항이 나열됩니다. 대시보드는 비수탁형이라는 것, 트랜잭션은 최종적이며 되돌릴 수 없다는 것, 전액 손실의 위험이 있으며 여기 있는 어떤 내용도 금융 조언이 아니라는 것, 테스트넷 QOR는 교환할 수 없다는 것입니다. 동의 내용은 계정이 아니라 브라우저에 저장됩니다.
- **하나의 계정, 세 가지 인코딩.** 같은 계정이 `qor1...` 주소, `0x...` 주소, SVM base58 주소로 표시되며, 대시보드는 `qor1...`를 통해 잔액과 내역을 한 번만 읽습니다.

## 사용 방법 {#how-to-use}

### 레이아웃

**헤더.** 네트워크 전환, 그다음 **Sign In** 또는 프로필 메뉴(Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**데스크톱 사이드바(순서대로):**

| 항목 | 페이지 | 설명 |
| --- | --- | --- |
| **Discover** | `/` | 홈: 히어로 버튼 **Create Smart Contract**와 **Explore Network**, "Dashboard Overview" 카운터, 생성된 컨트랙트·최신 공개 감사·상위 기여자 목록, 그리고 **Start Generating**, **New Audit**, **Claim Tokens**가 있는 "Developer Toolkit". |
| **Public Sale** | `/public-sale` | 기존 참여자는 자신의 할당량, 베스팅 일정, 청구를 확인합니다. |
| **Wallet** | [Wallet](/dashboard/wallet) | 잔액, 내역, 받기, 그리고 (메인넷에서) QoreX를 통한 보내기와 스테이킹. |
| **Faucet** | [Faucet](/dashboard/faucet) | 무료 테스트넷 토큰. |
| **Explorer** | [Explorer](/dashboard/explorer) | 블록, 트랜잭션, 주소, 밸리데이터. |
| **Trade** | [Trade](/dashboard/trade) | 테스트 토큰 스왑 화면. |
| **Earn** 그룹 | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | QoreChain Arcade. |
| **Build** 그룹 | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | 컨트랙트 도구, 운영자 페이지(탭 5개: Validator Program, Validator Application, Light Node, Node Registration, Rollups), 그리고 공개 개발자 페이지(탭 6개: SDKs, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). Nodes & Validators 항목은 예전에 "Tools"라는 이름이었으며, 그 SDK 탭은 Developers로 옮겨졌습니다. |
| **FAQ** | `/faq` | 앱 내 도움말. 일부는 최신이 아니므로 이 매뉴얼이 기준입니다. |

[Validators](/dashboard/validators) 페이지(`/validators`)에는 사이드바 링크가 없으며, 주소로 직접 엽니다.

**모바일.** 하단 바(Discover, Wallet, Faucet, 그다음 Explorer, Trade, Quests)와 나머지 항목이 있는 가운데 부채꼴 메뉴.

### 로그인 {#sign-in}

대시보드는 두 개의 계층으로 이루어져 있습니다. 로그인하는 **대시보드 계정**과, 그 계정에 연결하는 **지갑**입니다. 둘러보는 데는 지갑이 필요하지 않습니다.

- **페이지가 로드되기 전에 로그인으로 리디렉션되는 페이지:** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale, 그리고 저장된 모든 컨트랙트 페이지 `/smart-contract-creator/<id>`.
- **로그아웃 상태에서 "Authentication Required" 화면이 표시되는 페이지:** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard, Games.
- **계정 없이 열 수 있는 페이지:** Discover 홈, 두 네트워크의 [Explorer](/dashboard/explorer) 상세 페이지(트랜잭션, 블록, 주소, 밸리데이터), 테스트넷의 Explorer 개요, [Smart Contract Creator](/dashboard/smart-contract-creator) 랜딩 페이지(무료 생성 1회), `/audits`의 감사 목록과 공개 감사 보고서, 그리고 [Developers](/dashboard/developers) 페이지.
- **로그아웃 상태에서 메인넷 보기:** 메인넷 데이터를 보여주는 페이지(홈 카운터, Wallet, Trade, Explorer 개요)에는 "Sign in to view mainnet"과 **Sign In** 버튼이 표시됩니다.

### 네트워크 선택하기 {#select-network}

헤더에는 현재 네트워크가 표시되며 전환할 수 있습니다. 선택 내용은 브라우저에 기억됩니다.

| 네트워크 | 체인 ID | 사용 시점 |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | 실제 가치를 위한 라이브 네트워크(2026년 6월 7일부터 라이브, 2026년 10월 23일부터 체인 v3.2.4 실행). 비수탁형: 본인의 지갑을 연결합니다. |
| **Testnet** | `qorechain-diana` | 무료 환경(2026년 10월 27일부터 체인 v3.2.6 실행 중)으로, 대시보드가 관리하는 테스트 지갑과 [Faucet](/dashboard/faucet)이 제공됩니다. |

네이티브 토큰은 **QOR**입니다(기본 단위는 `uqor`이며, 1 QOR = 10^6 uqor). 처음이라면 테스트넷에서 시작해 Faucet에서 토큰을 청구하고, 메인넷으로 넘어가기 전에 첫 전송을 먼저 시도해 보세요.

일부 페이지는 전환을 따르지 않습니다. Faucet은 항상 테스트넷에서 지급하고, [Trade](/dashboard/trade)는 항상 테스트넷 콘텐츠를 보여주며, Quests, Badges, Leaderboard, Games, Public Sale, FAQ는 네트워크와 무관합니다.

### 지갑 연결하기 {#connect-your-wallet}

- **메인넷은 비수탁형입니다.** **QoreX**(공식 QoreChain 지갑, 확장 프로그램 또는 앱), **Keplr** 또는 **MetaMask**를 연결하세요. 네이티브 레일에서의 보내기와 스테이킹에는 QoreX가 필요합니다. QoreChain 계정은 포스트 양자 하이브리드 서명으로 서명되며, 오늘 기준 이 서명을 생성하는 것은 QoreX뿐이기 때문입니다. Keplr은 네이티브 레일에서 조회하고 받기 위해 연결됩니다. MetaMask는 EVM 레일에서 연결되며, 그곳에서 보내려면 계정의 포스트 양자 키와 QoreX에서 여는 EVM 윈도우도 필요합니다([MetaMask로 보내기](/dashboard/wallet#send-metamask) 참고).
- **테스트넷은 수탁형입니다.** 대시보드가 여러분을 위해 테스트 지갑을 관리하므로, 설치할 것이 없고 위험에 노출되는 실제 가치도 없습니다.

#### QoreX로 연결하기 (권장) {#connect-qorex}

1. [dashboard.qorechain.io](https://dashboard.qorechain.io)를 열고 헤더에 **Mainnet**이 표시되는지 확인합니다.
2. 이 브라우저에서 메인넷 페이지를 처음 방문하는 경우, [일회성 위험 고지](#risk-acknowledgement)에 동의합니다.
3. **Wallet**을 열고(로그인되어 있어야 합니다) **QoreX wallet** 카드에서 **Connect with QoreX**를 선택합니다.
4. QoreX 브라우저 확장 프로그램이 감지되고 저장된 방법이 없으면, 대시보드가 **Browser extension**과 **QoreX app** 옵션과 함께 "How do you want to connect?"를 묻습니다. 선택 내용은 저장됩니다. 확장 프로그램이 감지되지 않으면 바로 앱 흐름으로 넘어갑니다.
   - **Browser extension:** 확장 프로그램 팝업에 요청 사이트로 `dashboard.qorechain.io`가 표시됩니다. 승인하세요. 이는 `qor1...` 주소의 소유를 증명하는 일회성 서명이며, 자금은 이동하지 않습니다.
   - **QoreX app:** 대시보드가 QR 코드와 **Open QoreX**를 표시합니다. 스캔하거나 탭하고, QoreX에서 페어링 요청을 확인한 뒤 생체 인증으로 승인합니다. 대시보드는 폴링("Waiting for approval in QoreX...")하며 스스로 완료합니다.
   - **Use a different method** 링크는 페어링이 대기 중일 때만 나타납니다.
5. 승인되면 대시보드가 `qor1...` 주소를 표시하고 서명이 필요한 작업을 활성화합니다.

전체 연결 및 보내기 안내는 [Wallet](/dashboard/wallet#mainnet)을, 동일한 페어링을 지갑 쪽에서 본 화면은 QoreX 문서의 [Account & Dashboard](/qorex/account-and-dashboard#dashboard) 페이지를 참고하세요.

#### Keplr 또는 MetaMask로 연결하기

1. 헤더가 **Mainnet**이고 고지에 동의한 상태에서 **Wallet**을 엽니다.
2. **or connect another wallet** 아래에서 **Connect Keplr** 또는 **Connect MetaMask**를 선택합니다.
3. 지갑에서 연결을 승인합니다. 지갑이 아직 QoreChain을 모른다면 [Add QoreChain to your wallet](/dashboard/wallet#add-network)을 참고하세요.

연결되면 Wallet 페이지에 주소와 잔액 및 내역이 표시됩니다. 처음 설정하는 방법은 [Wallet Setup](/getting-started/wallet-setup)을 참고하세요.

### 일회성 위험 고지 {#risk-acknowledgement}

고지 카드는 브라우저에서 처음 메인넷 **Wallet**, **Trade**, **Explorer 개요** 또는 **홈 통계**를 보기 전에 나타납니다. 모든 메인넷 페이지에 필요한 것은 아닙니다. Explorer 상세 페이지, Creator 및 기타 페이지는 이것 없이 열립니다. 브라우저당 한 번 동의하면 되며, 브라우저 데이터를 지우면 다시 표시됩니다.

## 이용 방법 {#how-to-access}

- **URL:** 최신 브라우저에서 [dashboard.qorechain.io](https://dashboard.qorechain.io). 설치 없음.
- **계정:** 로그인 페이지에서 이메일 또는 지원되는 ID 제공자로 로그인합니다. 어떤 페이지에 필요한지는 [로그인](#sign-in)에 나와 있습니다.
- **네트워크:** 메인넷 `qorechain-vladi`와 테스트넷 `qorechain-diana`, 헤더 전환으로 선택합니다. 메인넷이 기본값입니다.
- **지갑:** 둘러보기에는 필요 없습니다. 메인넷 보내기와 스테이킹에는 QoreX, 조회와 받기에는 Keplr 또는 MetaMask. 테스트넷에서는 대시보드가 테스트 지갑을 만들어 줍니다.
- **비용:** 대시보드는 무료로 사용할 수 있습니다. 온체인 작업에는 네트워크 수수료(가스당 최소 0.1 uqor)가 듭니다. 일부 유료 항목은 각자의 페이지에 설명되어 있습니다(라이트 노드 라이선스와 밸리데이터 프로그램 수수료는 [Nodes & Validators](/dashboard/tools-hub)).
- **얼리 액세스 게이트:** 현재는 없습니다. 메인넷 페이지에는 (위에 나열된 경우의) 로그인과 일회성 고지만 필요합니다.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 | 로그인 |
| --- | --- | --- | --- |
| 대시보드 | [dashboard.qorechain.io](https://dashboard.qorechain.io) | 메인넷 및 테스트넷 | 페이지별로 다름, [로그인](#sign-in) 참고 |
| 독립형 익스플로러 | [explore.qore.network](https://explore.qore.network) (별도 앱, [Explorer](/dashboard/explorer#standalone-explorer) 참고) | 메인넷 및 테스트넷 | 없음 |
| 공개 엔드포인트 | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, `*-testnet` 변형 포함 | 메인넷 및 테스트넷 | 없음 |

이 섹션의 페이지: [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking & Validators](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard and Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub), [Developers](/dashboard/developers).

## 제한 사항 및 알려진 문제 {#limits}

- **Bridge 화면은 없습니다.** [Bridge](/dashboard/bridge)를 참고하세요.
- **Trade는 네트워크 전환을 따르지 않습니다.** 헤더가 Mainnet이어도 테스트넷 콘텐츠를 보여줍니다. [Trade](/dashboard/trade)를 참고하세요.
- **앱 내 FAQ는 짧은 도움말 페이지입니다.** FAQ와 이 매뉴얼이 다를 경우 이 매뉴얼을 따르세요.
- **아직 라이브가 아닌 것:** Developers 페이지의 Transaction inspector, 그리고 MCP 서버(Developers 페이지에 게시되지 않았다고 표시됩니다).
- **메인넷 제한.** 메인넷에서의 스테이킹, 보내기, 컨트랙트 배포는 페이지별로 설명되어 있으며, 여러 흐름(Native 또는 SVM 배포, 리델리게이션, 타임락 스테이킹)은 대시보드에서 제공되지 않습니다.
- **테스트넷에는 실제 가치가 없습니다.** 형식이 동일하므로 테스트넷 주소로 실제 QOR를 보내지 마세요. [Wallet](/dashboard/wallet#testnet)을 참고하세요.

:::tip QoreChain이 처음이신가요?
[Connecting to Testnet](/getting-started/connecting-to-testnet)과 [Your First Transaction](/getting-started/first-transaction)을 따라 빠르게 실습해 본 다음, 대시보드의 나머지 부분을 탐색하러 돌아오세요.
:::
