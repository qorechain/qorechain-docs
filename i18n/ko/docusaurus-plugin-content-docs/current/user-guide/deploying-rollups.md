---
slug: /user-guide/deploying-rollups
title: 롤업 배포
sidebar_label: 롤업 배포
sidebar_position: 6
---

# 롤업 배포

이 가이드는 Rollup Development Kit(RDK)를 사용하여 QoreChain에서 정산되는 애플리케이션별 롤업을 출시하는 방법을 간략히 안내합니다. 단계별 명령어는 **[롤업 배포하기](/rollups/deploying-a-rollup)**에 있으며, 이 페이지에서는 시작하기 전에 필요한 사항을 다룹니다.

:::caution 초기 단계 기능
두 네트워크 어디에서도 아직 롤업이 생성된 적이 없습니다(2026년 10월 20일 확인). 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.2.3**을 실행하고, 테스트넷(**`qorechain-diana`**, EVM 체인 ID **9800**)은 더 최신 릴리스(**v3.2.4**)를 실행합니다. 먼저 테스트넷에서 검증하세요. 두 네트워크 사이에는 한 가지 동작이 다릅니다([롤업 개발 키트](/architecture/rollup-development-kit#optimistic-settlement)의 챌린지 윈도우 참고 사항 참조).
:::

---

## 여기서 말하는 롤업이란 {#what-a-rollup-is-here}

QoreChain 롤업은 **오프체인에서 실행**되고 **정산**에는 QoreChain을 사용하는 애플리케이션별 체인입니다. 롤업을 온체인에 등록하고, 상태 루트 배치를 게시하며, (선택적으로) 데이터 블롭과 출금 커밋먼트를 게시합니다. 온체인 기록에는 프로필, 정산 모드, 시퀀서 모드, 데이터 가용성 백엔드, 가스 모델, VM 레이블이 담기며, 호스트 체인은 롤업의 트랜잭션을 실행하지 않습니다.

---

## 프리셋 프로필 {#preset-profiles}

RDK는 다섯 가지 프리셋 프로필을 제공하며, 각각 일반적인 애플리케이션 카테고리에 맞게 조정되어 있습니다:

| 프로필         | 정산 (증명)         | 시퀀서   | DA              | 가스 모델     | VM       | 의도된 사용 사례 |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi/AMM 애플리케이션(대출, DEX, 파생상품) |
| **gaming**     | based               | based     | native          | flat         | custom   | 고처리량 게임 상태 및 실시간 경험 |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA 예정) | standard | CosmWasm | NFT 발행 및 마켓플레이스 워크로드 |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | 후원 수수료를 갖춘 권한형 및 컨소시엄 배포 |
| **custom**     | 기본값: optimistic (fraud) | dedicated | native | standard | EVM | 시작 기본값; 메시지가 허용하는 항목을 조정하세요 |

자세한 내용과 성숙도 관련 참고 사항(예: CLI로 생성한 `defi` 롤업은 아직 ZK 배치를 확정할 수 없으며, `based` 시퀀싱은 현재 생성자가 제출한다는 의미입니다)은 [프리셋 프로필](/rollups/preset-profiles)을 참조하세요.

---

## 요구 사항 {#requirements}

| 요구 사항 | 세부 정보 |
| ----------- | ------- |
| **롤업 스테이크** | 최소 10,000 QOR(`min_stake_for_rollup`, 10,000,000,000 uqor). 현재 값은 다음으로 조회하세요: `qorechaind query rdk config` |
| **생성 소각** | 제공한 스테이크의 1 %가 생성 시 소각되며, 나머지는 롤업별 장부에 에스크로됩니다. 롤업을 중지하면 그 장부에 남은 금액이 반환됩니다(그 장부에서 지급된 출금과 사기 증명 보상은 환불액을 줄입니다) |
| **롤업 id** | 3~64자: 소문자, 숫자, `.`, `_`, `-`이며, 문자 또는 숫자로 시작해야 합니다. 이 규칙을 어기는 id는 수수료를 낸 뒤에 거부되므로 먼저 확인하세요 |
| **레이어 등록 스테이크** | 롤업을 생성하면 멀티레이어 모듈에 레이어도 함께 등록되며, 이때 생성자에게서 1,000 QOR가 추가로 잠깁니다(롤업을 중지하면 반환됨). 이 잔액이 없으면 레이어가 생성되지 않고 롤업을 앵커링할 수 없습니다 |
| **계정** | 포스트 퀀텀 키가 등록된 자금이 충전된 계정(모든 네이티브 레인 트랜잭션은 하이브리드 서명됩니다) |

---

## 팁 {#tips}

* 프리셋 프로필로 시작하세요. 프리셋은 정산 모드, 시퀀서, 데이터 가용성 백엔드, VM을 설정하며, `create-rollup`은 id, 프로필, 스테이크, 그리고 선택적 `--vm`만 받습니다.
* 1 % 생성 소각은 제공한 스테이크에 적용됩니다.
* 생성자의 포스트 퀀텀 서명을 함께 보내지 않으면 배치는 앵커 없이 정산됩니다(`tx rdk submit-batch`의 `--anchor-signature`, v3.2.2부터 사용 가능). [상태 앵커링](/architecture/rollup-development-kit#state-anchoring)을 참조하세요.
* L1으로의 출금(`tx rdk execute-withdrawal`)은 롤업의 에스크로 장부에서 지급되며 v3.2.3부터 메인넷에서 동작합니다. 출금 루트가 있는 확정된 배치가 필요하고 `uqor`만 사용합니다.
* 현재 롤업 생성자가 배치 제출자입니다(어떤 프리셋도 시퀀서 주소를 설정하지 않습니다). 따라서 생성자 키를 안전하게 보관하세요. 롤업을 일시정지, 재개, 중지할 수 있는 것은 생성자뿐입니다.
* `suggest-profile` 도우미는 현재 공개 엔드포인트에서 고정된 `defi` 폴백을 반환하므로, 프로필 표에서 직접 선택하세요.

---

## 다음 단계 {#next-steps}

* [롤업 배포하기](/rollups/deploying-a-rollup) — CLI 또는 TypeScript로 롤업을 생성, 운영, 중지합니다.
* [롤업 개요](/rollups/overview) — 정산 모드, 시퀀서, 증명 시스템.
* [데이터 가용성](/rollups/data-availability) 및 [ZK / STARK 및 출금](/rollups/zk-stark-withdrawals).
