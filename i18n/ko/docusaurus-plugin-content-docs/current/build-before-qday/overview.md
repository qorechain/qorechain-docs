---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: 개요
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day**는 [build.qorechain.io](https://build.qorechain.io)에서 온라인으로 진행되는 QoreChain 개발자 페스트이며, 해시태그는 #BuildBeforeQDay입니다. 참가자는 레벨을 고르고, 오픈 소스 키트로 QoreChain 테스트넷 위에서 빌드하며, 과정을 공개적으로 공유하고, 심사위원단과 커뮤니티 앞에서 프로젝트를 발표합니다. 페스트와 함께 매주 기술 워크숍이 하나씩 열립니다. 각 워크숍에는 첫 명령부터 마지막 명령까지 담은 완전한 단계별 가이드가 이 섹션에 있으므로, 자신의 컴퓨터에서 원하는 속도로 모든 것을 따라 할 수 있습니다. 각 워크숍의 예제 앱은 공개 저장소 [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)에 모여 있습니다.

## 혁신 요소 {#innovations}

이 섹션의 모든 워크숍은 QoreChain을 특별하게 만드는 기능을 중심으로 구성되어 있습니다.

- **하이브리드 서명.** 트랜잭션은 두 번 서명됩니다. 한 번은 기존 방식의 secp256k1 키로, 한 번은 양자 내성 ML-DSA-87 키로 서명합니다. 기존 키만 훔친 사람은 두 번째 서명을 만들 수 없습니다.
- **온체인 검증.** 검증자가 두 서명을 모두 확인합니다. 트랜잭션에는 `PQCHybridSignature` 확장이 포함되고, 체인은 상태가 `verified`인 `pqc_hybrid_verify` 이벤트를 발생시킵니다. 둘 다 공개 REST 엔드포인트에서 읽을 수 있고, 결과는 익스플로러에서도 볼 수 있습니다.
- **익숙한 도구.** Hardhat, Foundry 또는 원하는 언어를 그대로 사용합니다. 양자 내성 키와 승인 윈도우는 키트가 대신 처리합니다.

## 진행 방식 {#how-it-works}

1. **등록**: [build.qorechain.io](https://build.qorechain.io)에서 GitHub로 로그인하고, 레벨을 선택하고, X와 QoreX를 연결합니다.
2. **빌드**: 키트, 주간 워크숍, 해커톤 중간 챌린지를 활용해 테스트넷에서 빌드합니다. 커밋과 업데이트는 공개 피드에 표시됩니다.
3. **제출**: 마감 전에 공개 저장소, 3분 이내의 영상, 프로젝트가 사용하는 테스트넷 주소를 제출합니다.

참가는 무료입니다. 테스트넷에서 빌드하며, 테스트 QOR은 [포셋](/dashboard/faucet)에서 받을 수 있습니다. 자격 요건, 제출, 심사 규칙 전체는 페스트 사이트의 Rules 페이지에 있습니다. 총상금은 $20,000이며, 2027년 1월부터 QOR로 지급되는 후속 그랜트가 이어집니다. 배분 내역은 페스트 사이트에 있습니다.

## 레벨 {#levels}

레벨은 등록할 때 선택하며, 나중에 바꿀 수 있습니다.

| 레벨 | 대상 |
| --- | --- |
| Quantum Pass | QoreChain 또는 web3가 처음인 분. 하이브리드 양자 내성 트랜잭션을 보내고 체인에서 다시 읽어 오는 작은 앱을 만듭니다. |
| Intermediate | dApp을 배포해 본 적이 있는 분. QoreChain SDK와 QoreX로 완성된 애플리케이션을 만듭니다. |
| Advanced | 세 가지 트랙이 있습니다. A: 에이전트, B: QoreSeal을 사용하는 암호화 애플리케이션, C: EVM과 네이티브 레인에 걸치는 크로스 VM 앱. |
| Expert | 프로토콜 인프라: RDK로 만드는 롤업, QORel을 사용하는 IBC, 커스터디와 개발자 도구. |

워크숍 1은 Quantum Pass 레벨이 요구하는 내용, 즉 온체인에서 검증된 하이브리드 서명 트랜잭션을 정확히 다룹니다.

## 일정 {#timeline}

모든 시각은 UTC 기준입니다.

| 시기 | 내용 |
| --- | --- |
| 2026년 11월 4일 | 등록 및 빌드 시작 |
| 매주 | 워크숍 1회(총 4회), 단계별 가이드는 여기에 게시 |
| 2026년 11월 18일 | 해커톤 중간 챌린지 시작 |
| 2026년 12월 2일 23:59 | 제출 마감 |
| 12월 3일부터 5일 | 제출물 확인 |
| 12월 6일부터 15일 | 심사 및 People's Choice 투표 |
| 12월 16일 | 우승자 발표 및 라이브 데모 쇼 |
| 12월 17일부터 22일 | 상금 지급 |
| 2027년 1월 | 후속 그랜트 |

일정은 페스트 사이트에서도 확인할 수 있습니다.

## 워크숍 {#workshops}

| 워크숍 | 주제 | 가이드 |
| --- | --- | --- |
| 워크숍 1 | 첫 하이브리드 서명 트랜잭션 | [워크숍 1](/build-before-qday/workshop-1) |

각 가이드는 아무것도 설치되지 않은 상태에서 시작합니다. 설치할 것을 먼저 알려 준 다음, 코드 받기, 설치, 테스트넷 전용 키 만들기, 포셋에서 테스트 QOR 받기, 실행, 익스플로러에서 결과 확인까지 명령을 하나씩 차례로 안내합니다. 마지막에는 사용한 패키지와 예제 앱이 나옵니다. 모든 예제 앱은 공개 저장소 [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)에 있습니다.

## 시작하기 {#where-to-start}

- 테스트넷에서 [워크숍 1](/build-before-qday/workshop-1)을 따라 해 보세요.
- [예제 앱](/build-before-qday/workshop-1/kits)과 그 바탕이 되는 키트를 살펴보세요.
- QoreChain에 배포해 본 적이 없다면 먼저 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes)를 읽어 보세요.
