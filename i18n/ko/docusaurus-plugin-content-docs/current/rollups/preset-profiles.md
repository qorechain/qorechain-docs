---
slug: /rollups/preset-profiles
title: 프리셋 프로필
sidebar_label: 프리셋 프로필
sidebar_position: 2
---

# 프리셋 프로필

RDK는 일반적인 애플리케이션 카테고리에 맞게 튜닝된 턴키 롤업 구성을 제공하는 **프리셋 프로필**을 기본 제공합니다. 프리셋은 정산(settlement) 모드, 시퀀서 모드, 데이터 가용성(DA) 백엔드, 실행 파라미터를 하나로 묶어 제공하므로, 모든 옵션을 일일이 직접 선택하지 않고도 롤업을 시작할 수 있습니다.

프로필은 `create-rollup`에 위치 인자로 전달합니다:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
아래의 프리셋별 값은 네트워크에 공개된 프로필 표를 그대로 반영하는, 배포된 **`@qorechain/rdk`** 프로필 기본값과 일치합니다. RDK가 성숙해짐에 따라 이 값들은 여전히 변경될 수 있습니다 — 신뢰할 수 있는 최종 구성은 `qorechaind query rdk config`(또는 SDK의 `RdkClient.params()`)로 라이브 모듈 파라미터를 조회하여 확인하고, 메인넷에 적용하기 전에 **`qorechain-diana`** 테스트넷에서 검증하세요.
:::

---

## 프리셋 프로필 목록

각 프리셋은 정산 패러다임(및 해당 정산이 요구하는 증명 시스템), 시퀀서 모드, 데이터 가용성 백엔드, 가스 모델, VM을 하나로 묶습니다:

| 프로필 | 정산 (증명) | 시퀀서 | DA | 가스 모델 | VM | 의도된 사용 사례 |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi 및 AMM 스타일 애플리케이션 — 빠른 최종성(finality)과 예측 가능한 수수료가 중요한 대출 시장, DEX, 파생상품 |
| **`gaming`** | based | based | native | flat | custom | 높은 처리량과 낮은 지연 시간이 필요한 게임 상태 및 인게임 경제 |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA 도입 예정) | standard | QoreChain Native (`native`) | NFT 발행, 마켓플레이스, 디지털 수집품 |
| **`enterprise`** | based | based | native | subsidized | EVM | 스폰서드(보조금 지원) 수수료를 사용하는 허가형(permissioned) 및 컨소시엄 배포 |
| **`custom`** | 완전 파라미터화 (기본값: optimistic / fraud) | 완전 파라미터화 | 완전 파라미터화 | 완전 파라미터화 | 완전 파라미터화 (기본값: EVM) | 모든 필드를 사용자가 직접 정의 — 처음부터 시작하여 각 옵션을 직접 설정 |

몇 가지 제약은 [정산 → 증명 매트릭스](/rollups/overview)에서 따라옵니다: `optimistic` 정산은 `fraud` 증명을 사용하고, `zk`는 `snark`(또는 `stark`)를 사용하며, `based`와 `sovereign`은 증명이 없습니다. `based` 정산은 항상 `based` 시퀀서 모드와 짝을 이룹니다. `nft` 프리셋은 현재 네이티브로 정산하며 **Celestia DA 도입이 예정**되어 있습니다.

RDK v0.4.2부터 Wasm VM 옵션(CosmWasm 컨트랙트를 실행하는 런타임)의 이름은 **`native`** — QoreChain Native 입니다. `cosmwasm`은 여전히 허용되는 레거시 별칭이며, 두 값 모두 와이어 상에서는 `cosmwasm`으로 매핑되므로 체인, 익스플로러, Dashboard는 변경되지 않습니다.

:::note
프리셋별 구성은 체인 버전 **v3.1.74**에서 라이브 검증되었으며, 이 버전에서 `create-rollup`은 프로필의 프리셋을 자동으로 적용합니다: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (기본값)**. `custom` 프리셋은 모든 필드를 열어 두며, 표시된 값은 그 시작 기본값일 뿐입니다.
:::

네 가지 도메인 프리셋은 합리적인 출발점으로, **`custom`** 프로필은 완전히 열린 옵션으로 생각하세요. 번들된 정확한 파라미터는 릴리스 간에 변경될 수 있으므로, 신뢰할 수 있는 값은 아래의 `rdk config` 조회로 확인한 뒤, 가장 가까운 프리셋에서 시작하여 다듬어 나가세요.

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI는 실행 가능한 스타터 프로젝트를 스캐폴딩하며 — 프로필당 하나의 템플릿(`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`)을 제공하므로 — 명령 한 번으로 프로필에서 동작하는 생성/조회 코드까지 이동할 수 있습니다.

---

## 추천 받기: `suggest-profile`

어떤 프리셋이 적합한지 확실하지 않다면, `suggest-profile` 쿼리에 사용 사례를 일반 언어로 설명하여 전달하면 추천 프로필을 반환합니다.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**예시:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

이 추천은 유용한 출발점일 뿐입니다 — 구성을 확정하기 전에 자신의 구체적인 요구 사항(정산 보장, 시퀀서 신뢰 모델, 데이터 가용성 요구, VM)에 비추어 추천 결과를 검토하세요.

---

## 온체인에서 프리셋 구성 확인하기

프리셋의 세부 사항은 온체인에서 결정되므로, 프로필이 실제로 어떤 값으로 해석되는지 확인하는 신뢰할 수 있는 방법은 모듈과 생성된 롤업을 직접 조회하는 것입니다:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

이 패턴 — 배포 전에 `config`를 조회하고, 배포 후에 `rollup`을 조회하는 방식 — 을 사용하면 변경될 수 있는 문서상의 값에 의존하는 대신, 선택한 프리셋이 정확히 무엇을 만들어냈는지 확인할 수 있습니다.

---

## 다음 단계

* **[롤업 배포하기](/rollups/deploying-a-rollup)** — Dashboard 또는 CLI로 프리셋에서 롤업을 생성한 뒤 라이프사이클을 관리합니다.
* **[롤업 개요](/rollups/overview)** — 프리셋이 묶어 제공하는 정산 패러다임과 시퀀서 모드.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — 하위 수준 모듈 레퍼런스.
