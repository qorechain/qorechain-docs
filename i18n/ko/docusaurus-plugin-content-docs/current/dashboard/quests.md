---
slug: /dashboard/quests
title: 퀘스트
sidebar_label: 퀘스트
sidebar_position: 10
---

# 퀘스트

**퀘스트**는 완료하는 동안 QoreChain 사용법을 단계별로 안내하는 가이드형 작업입니다. 퀘스트는 지갑에 자금 충전하기, 송금하기, 계정 연결하기와 같은 하나 이상의 단계를 묶어 구성되며, 완료하면 보상을 제공합니다. 이 페이지는 사이드바 **Earn** 그룹의 나머지 페이지와 아케이드도 다룹니다: **Leaderboard**, **Badges**, **Games**. 모두 네트워크를 직접 체험하며 배우고 진행 상황을 모으고 싶은 커뮤니티 구성원을 위한 것입니다.

## 혁신 {#innovations}

- **자기 보고가 아닌 검증된 완료.** 퀘스트는 확인을 통과해야 집계됩니다. Eigenstate 2는 각 퀘스트에 확인 유형을 명시합니다: **연결된 계정**, **연결된 지갑**, **증빙 링크**, **팀 검토**, **퀴즈**.
- **소셜 퀘스트는 검증된 계정만 집계됩니다.** X, Telegram 또는 Discord가 포함된 퀘스트(그리고 Eigenstate 2의 연결된 계정 확인에서는 YouTube와 GitHub도)는 **프로필**에서 해당 계정을 연결하고 그 연결이 검증된 후에만 집계됩니다. 그전까지 페이지에는 *Connect Social Accounts*와 **Go to Profile** 링크가 표시됩니다.
- **선행 조건이 적용됩니다.** 잠긴 퀘스트에는 먼저 완료해야 할 것이 표시됩니다("Complete "..." first").
- **명확한 상태.** Started, Pending Verification, Pending Review, Failed, Completed로 구분되므로, 사람의 검토를 기다리는 퀘스트가 실패한 것으로 표시되지 않습니다.
- **한 페이지에 두 시즌.** **Eigenstate 1**과 **Eigenstate 2** 탭은 각각 자체 퀘스트 세트와 카테고리를 가집니다.

## 사용 방법 {#how-to-use}

### 퀘스트 둘러보기

**Quests**(사이드바 **Earn**)를 엽니다. 요약에 이용 가능한 퀘스트, 진행 중인 퀘스트, 완료한 퀘스트의 수가 표시됩니다. **카테고리 탭**으로 목록을 필터링합니다:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily, Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain, Other.

비어 있는 카테고리에는 "No quests in this category yet."라고 표시됩니다. 각 퀘스트 카드에는 아이콘, 제목과 짧은 설명, **난이도** 배지, 예상 시간, **보상**(QOR 또는 고유값 포인트 λ), 상태(완료, 진행 중, 시작됨, 잠김)가 표시됩니다.

### Eigenstate 1 퀘스트 완료하기

1. 퀘스트를 열고 **Start Quest**(이후에는 **Continue Quest**)를 선택합니다.
2. 작업을 차례로 진행합니다. 작업에는 **Go to Action**(관련 대시보드 페이지로 이동)과 **Complete**(검증할 수 있도록 단계를 확인)가 제공됩니다.
3. 진행률 표시줄이 완료한 작업을 추적합니다.
4. 모든 작업이 완료되면 **Check Completion**을 선택하여 퀘스트를 검증하고 보상을 받습니다.

일일 및 주간 퀘스트는 일정에 따라 초기화되며, 상세 페이지에 초기화 주기와 연속 기록(스트릭)이 표시됩니다. [Faucet](/dashboard/faucet)에서 요청한 토큰은 Faucet 퀘스트에 집계됩니다.

### Eigenstate 2 퀘스트 완료하기

1. 퀘스트를 열고 확인 유형을 읽습니다.
2. 퀘스트가 제공하는 버튼을 사용합니다. 어떤 버튼이 나타나는지는 확인 유형과 현재 상태에 따라 다릅니다: **Verify**, **Submit**, **Resubmit**, **Retry verification**, **Re-check status**.
3. 상태가 Started, Pending Verification 또는 Pending Review를 거쳐 Completed(또는 Failed)로 바뀌는 것을 지켜봅니다.

### Leaderboard {#leaderboard}

`/leaderboard`는 고유값 포인트(λ)에 따라 사람들의 순위를 매기며, 상위 3명, 커뮤니티 통계, 검색 상자가 있습니다. 오프체인 순위입니다.

### Badges {#badges}

`/badges`는 12개 배지 시리즈의 카탈로그입니다. **Check Badges**는 진행 상황을 다시 평가합니다. **Badge Widget**은 다른 곳에 배지를 표시할 수 있도록 iframe, BBCode 또는 Markdown 스니펫을 제공하며 **Copy Code**로 복사합니다. 브리지는 아직 라이브가 아닌데도 목록에는 Bridge 시리즈가 나타납니다.

### Games {#games}

`/games`는 12개 게임이 있는 **QoreChain Arcade**입니다: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze, Wave Coder. 카드에서 **Play Now**를 선택하면, 게임이 끝날 때 점수(Photons, γ)가 제출됩니다. 점수는 오프체인에 보관됩니다.

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **로그인:** 모두 필요합니다. 로그아웃 상태에서 `/quests`는 로그인으로 리디렉션되며, Leaderboard, Badges, Games는 "Authentication Required" 화면을 표시합니다.
- **네트워크:** 어느 것도 네트워크 전환을 따르지 않습니다.
- **지갑:** 필요하지 않지만, 트랜잭션이 포함된 퀘스트에는 자금이 충전된 테스트넷 지갑이 필요합니다([지갑](/dashboard/wallet#testnet)과 [Faucet](/dashboard/faucet) 참고). 소셜 퀘스트에는 연결된 계정이 필요합니다.
- **비용:** 무료.

## 게시 위치 {#where-published}

| 페이지 | 주소 | 계정 |
| --- | --- | --- |
| Quests (Eigenstate 1 및 2) | `dashboard.qorechain.io/quests` | 로그인 |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | 로그인 |
| Badges | `dashboard.qorechain.io/badges` | 로그인 |
| Games | `dashboard.qorechain.io/games` | 로그인 |

## 한계 및 알려진 문제 {#limits}

- **퀘스트 세트는 바뀝니다.** 시즌의 퀘스트가 활성화되어 있지 않으면 해당 탭이 비어 있거나 퀘스트가 더 적게 표시될 수 있습니다. 현재 목록은 이 페이지에 의존하지 말고 탭에서 확인하세요.
- **여기 있는 모든 것은 오프체인입니다:** 포인트, 순위, 배지, 게임 점수는 QoreChain이 아닌 대시보드가 기록합니다. Photons는 온체인이 아닙니다.
- **보상 금액**은 각 퀘스트에 표시되며 바뀔 수 있습니다.
- **로그인**이 필요하며, 소셜 퀘스트에는 검증된 연결 계정이 필요합니다.
- **Public Sale**(`/public-sale`)은 기존 참가자를 위한 별도 페이지(할당량, 베스팅 타임라인, 클레임)이며, 이전 라운드는 모두 종료되었고 여기서는 더 설명하지 않습니다.
- **FAQ**(`/faq`)는 짧은 앱 내 도움말 페이지이며, 기준 문서는 이 매뉴얼입니다.

## 관련 항목

- [개요 및 시작하기](/dashboard/overview) - 퀘스트를 시작하기 전에 로그인하고 지갑을 연결하세요.
- [Faucet](/dashboard/faucet) - 트랜잭션이 포함된 퀘스트를 위해 테스트넷 지갑에 자금을 충전하세요.
