---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: 개요
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day**는 [build.qorechain.io](https://build.qorechain.io)에서 온라인으로 진행되는 QoreChain 개발자 페스트이며, 해시태그는 #BuildBeforeQDay입니다. 참가자는 레벨을 고르고, 오픈 소스 키트로 QoreChain 테스트넷 위에서 빌드하며, 과정을 공개적으로 공유하고, 심사위원단과 커뮤니티 앞에서 프로젝트를 발표합니다. 페스트와 함께 매주 기술 워크숍이 하나씩 열립니다. 각 워크숍에는 첫 명령부터 마지막 명령까지 담은 완전한 단계별 가이드가 이 섹션에 있으므로, 개발이 처음이어도 자신의 컴퓨터에서 원하는 속도로 모든 것을 따라 할 수 있습니다. 예제 앱은 공개 저장소 [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)에 모여 있습니다.

## 혁신 요소 {#innovations}

이 섹션의 모든 워크숍은 QoreChain을 특별하게 만드는 기능을 중심으로 구성되어 있습니다.

- **하이브리드 서명.** 트랜잭션은 두 번 서명됩니다. 한 번은 기존 방식의 secp256k1 키로, 한 번은 양자 내성 ML-DSA-87 키로 서명합니다. 기존 키만 훔친 사람은 두 번째 서명을 만들 수 없습니다.
- **온체인 검증.** 검증자가 두 서명을 모두 확인합니다. 트랜잭션에는 `PQCHybridSignature` 확장이 포함되고, 체인은 상태가 `verified`인 `pqc_hybrid_verify` 이벤트를 발생시킵니다. 둘 다 공개 REST 엔드포인트에서 읽을 수 있고, 결과는 익스플로러에서도 볼 수 있습니다.
- **하나의 키, 한 번의 연결.** 양자 내성 키는 새로 만들지 않고 파생하며, 증명과 함께 한 번만 등록합니다. [양자 내성 키가 내 계정에 연결되는 방식](/build-before-qday/key-binding)을 참고하세요.
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

모든 시간은 UTC 기준입니다.

| 시기 | 내용 |
| --- | --- |
| 2026년 11월 4일 | 등록 및 빌드 시작 |
| 매주 | 워크숍 하나(총 4회)와 이곳의 단계별 가이드 |
| 2026년 11월 18일 | 해커톤 중간 챌린지 시작 |
| 2026년 12월 2일 23:59 | 제출 마감 |
| 12월 3일부터 5일 | 제출물 확인 |
| 12월 6일부터 15일 | 심사 및 People's Choice 투표 |
| 12월 16일 | 우승자 발표 및 라이브 데모 쇼 |
| 12월 17일부터 22일 | 상금 지급 |
| 2027년 1월 | 후속 그랜트 |

일정은 페스트 사이트에서도 확인할 수 있습니다.

## 누구를 위한 가이드인가요 {#who}

블록체인이나 양자 내성 암호를 몰라도 됩니다. 터미널을 열고 명령을 붙여 넣을 수 있다면 여기 있는 모든 가이드를 따라 할 수 있습니다. 각 가이드는 모든 명령이 무엇을 하는지, 명령의 각 부분이 무슨 뜻인지를 쉬운 말로 설명한 다음, 화면에 어떤 결과가 보여야 하는지 알려 줍니다. 가이드에서 명령이 시간이 좀 걸릴 수 있다고 안내하면, 끝날 때까지 기다린 뒤 다음 명령을 실행하세요.

## 튜토리얼 고르기 {#choose}

먼저 **워크숍 1 가이드**를 따라 하세요. 아무것도 없는 컴퓨터에서 시작해 두 개의 키로 서명하고 체인에서 확인한 트랜잭션 하나까지 이어지는 전체 과정입니다. 그다음 아래 앱 중 아무거나 고르세요. 같은 개념을 서로 다른 언어와 도구로 보여 줍니다.

소요 시간은 도구를 설치한 이후의 단계 기준입니다. 처음 도구를 설치하는 데는 약 20분에서 40분이 더 걸립니다. [시작하기 전에](/build-before-qday/prerequisites)를 참고하세요.

| 튜토리얼 | 레벨 | 언어 | 소요 시간 | 마치면 얻는 것 |
| --- | --- | --- | --- | --- |
| [워크숍 1 가이드](/build-before-qday/workshop-1) | 초급 | TypeScript, Solidity | 30분 | 직접 스캐폴딩하고 테스트하고 테스트넷에 배포한 프로젝트와, 온체인에서 검증된 하이브리드 서명 트랜잭션 하나. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | 초급 | TypeScript, Solidity | 25분 | 하이브리드 서명 흐름으로 값을 올리는, 테스트넷 위의 카운터 컨트랙트. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | 중급 | TypeScript, Solidity, React | 45분 | 나만의 온체인 방명록과, QoreX 지갑으로 서명하는 웹 페이지. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | 초급 | TypeScript, React | 25분 | QoreX에서 QOR를 보내고 두 서명과 체인의 판정을 보여 주는 웹 페이지. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | 중급 | Rust | 25분 | 하이브리드 서명으로 결제하고 체인에서 검증하는 명령줄 앱. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | 중급 | Java 21 | 25분 | 팁을 보내고, 양자 내성 서명이 된 결제만 받아들이는 백엔드. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | 초급 | Python | 20분 | 여러 주소에 한 번에 지급하며, 두 키로 서명하고 온체인에서 검증된 트랜잭션 하나. |

여기서 레벨의 의미는 다음과 같습니다.

- **초급:** 순서대로 붙여 넣는 몇 개의 명령. 작성할 코드는 없습니다.
- **중급:** 초급과 같되, 웹 페이지, 지갑 확장 프로그램, 아직 써 보지 않았을 수 있는 언어 툴체인 같은 두 번째 도구가 추가됩니다.

모든 튜토리얼은 같은 구성을 따릅니다. **시작하기 전에**, 번호가 붙은 단계(각 명령마다 무엇을 하는지와 각 부분의 의미), **화면에 보여야 하는 결과**, 트랜잭션을 온체인에서 **확인하는 방법**, 그리고 **문제 해결** 표입니다.

## 시작하기 전에 {#before-you-start}

[시작하기 전에: 도구와 테스트넷 지갑](/build-before-qday/prerequisites)을 한 번 읽어 보세요. 다음 내용을 다룹니다.

- macOS, Windows, Linux에서 Node.js, pnpm, Git, Rust, Java, Maven, Python, jq를 설치하는 방법과 각 도구의 확인 명령.
- 테스트넷에서 QoreX 지갑 설정하기.
- 포셋에서 테스트 QOR 받기(계정당 24시간마다 100 QOR).
- QOR와 uqor: 1 QOR는 1,000,000 uqor입니다.
- 일회용 테스트넷 키를 안전하게 보관하는 방법. 테스트 계정만 사용하고, 실제 자금이 있는 지갑은 절대 사용하지 마세요.

## 어디서 시작할까요 {#where-to-start}

1. [시작하기 전에](/build-before-qday/prerequisites)를 읽고 첫 튜토리얼에 필요한 도구를 설치합니다.
2. 테스트넷에서 [워크숍 1 가이드](/build-before-qday/workshop-1)를 따라 합니다.
3. 위 표의 예제 앱 중 하나를 해 봅니다.
4. QoreChain에 배포해 본 적이 없다면 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes)가 개념을 자세히 설명합니다. 앱의 바탕이 되는 키트는 [키트](/build-before-qday/workshop-1/kits) 페이지에 있습니다.

## 코드 {#code}

모든 예제 앱은 하나의 공개 저장소의 `workshop-1` 폴더에 있습니다. [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). 각 튜토리얼이 어느 폴더를 열어야 하는지 알려 줍니다. 코드는 다음 명령으로 한 번만 받으면 됩니다.

```bash
git clone https://github.com/qorechain/build-before-qday
```

| 부분 | 하는 일 |
| --- | --- |
| `git clone` | 코드 저장소 전체의 사본을 내 컴퓨터로 내려받습니다. |
| `https://github.com/qorechain/build-before-qday` | 복사할 저장소의 주소입니다. |

**화면에 보여야 하는 결과:** 명령을 실행한 폴더 안에 `build-before-qday`라는 새 폴더가 생깁니다.
