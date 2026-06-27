---
slug: /rollups/preset-profiles
title: 프리셋 프로필
sidebar_label: 프리셋 프로필
sidebar_position: 2
---

# 프리셋 프로필

RDK는 일반적인 애플리케이션 카테고리에 맞게 조정된 턴키 롤업 구성을 제공하는 **프리셋 프로필**을 함께 제공합니다. 프리셋은 정산 모드, 시퀀서 모드, 데이터 가용성 백엔드, 실행 파라미터를 묶으므로, 모든 옵션을 일일이 고르지 않고도 롤업을 출시할 수 있습니다.

프로필은 `create-rollup`에 위치 인자로 전달됩니다:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
아래 프리셋별 값은 네트워크에 공개된 프로필 표를 반영하는, 제공된 **`@qorechain/rdk`** 프로필 기본값과 일치합니다. RDK가 성숙함에 따라 여전히 변할 수 있으므로 — 권위 있는 구성을 위해서는 `qorechaind query rdk config`(또는 SDK의 `RdkClient.params()`)로 라이브 모듈 파라미터를 쿼리하고, 메인넷 이전에 **`qorechain-diana`** 테스트넷에서 검증하세요.
:::

---

## 프리셋 프로필

각 프리셋은 정산 패러다임(및 해당 정산이 요구하는 증명 시스템), 시퀀서 모드, 데이터 가용성 백엔드, 가스 모델, VM을 묶습니다:

| 프로필 | 정산 (증명) | 시퀀서 | DA | 가스 모델 | VM | 의도된 사용 사례 |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi 및 AMM 스타일 애플리케이션 — 빠른 최종성과 예측 가능한 수수료가 중요한 대출 시장, DEX, 파생상품 |
| **`gaming`** | based | based | native | flat | custom | 고처리량, 저지연 게임 상태 및 인게임 경제 |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA 예정) | standard | CosmWasm | NFT 민팅, 마켓플레이스, 디지털 수집품 |
| **`enterprise`** | based | based | native | subsidized | EVM | 후원(보조) 수수료를 갖춘 허가형 및 컨소시엄 배포 |
| **`custom`** | 완전 파라미터화 (기본값: optimistic / fraud) | 완전 파라미터화 | 완전 파라미터화 | 완전 파라미터화 | 완전 파라미터화 (기본값: EVM) | 모든 필드를 사용자가 정의 — 처음부터 시작하여 각 옵션을 직접 설정 |

[정산 → 증명 매트릭스](/rollups/overview)로부터 몇 가지 제약이 따릅니다: `optimistic` 정산은 `fraud` 증명을 사용하고, `zk`는 `snark`(또는 `stark`)를 사용하며, `based`와 `sovereign`은 증명을 갖지 않습니다. `based` 정산은 항상 `based` 시퀀서 모드와 짝을 이룹니다. `nft` 프리셋은 오늘날 네이티브로 정산하며 **Celestia DA가 예정**되어 있습니다.

:::note
프리셋별 구성은 체인 버전 **v3.1.74**에서 온체인으로 라이브 검증되었으며, 여기서 `create-rollup`은 프로필의 프리셋을 자동으로 적용합니다: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (기본값)**. `custom` 프리셋은 모든 필드를 열어 두며 — 표시된 값은 그 시작 기본값입니다.
:::

네 개의 도메인 프리셋은 합리적인 시작점으로, **`custom`** 프로필은 완전히 열린 옵션으로 간주하세요. 정확한 번들 파라미터는 릴리스마다 변경될 수 있으므로 — 권위 있는 값을 위해 (아래의) `rdk config`를 쿼리한 다음, 가장 가까운 프리셋에서 시작하여 다듬으세요.

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI는 실행 가능한 스타터 프로젝트를 스캐폴딩하며 — 프로필당 하나의 템플릿(`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — 따라서 단일 명령으로 프로필에서 작동하는 생성/쿼리 코드까지 갈 수 있습니다.

---

## 추천 받기: `suggest-profile`

어떤 프리셋이 맞을지 확신이 서지 않는다면, `suggest-profile` 쿼리는 사용 사례에 대한 평이한 언어 설명을 받아 추천 프로필을 반환합니다.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**예시:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

이 제안은 유용한 시작점입니다 — 구성을 확정하기 전에 추천을 특정 요구사항(정산 보장, 시퀀서 신뢰 모델, 데이터 가용성 필요, VM)에 비추어 검토하세요.

---

## 온체인에서 프리셋 구성 검사하기

프리셋 세부 사항은 온체인에서 결정되므로, 프로필이 무엇으로 결정되는지 확인하는 권위 있는 방법은 모듈과 생성된 롤업을 쿼리하는 것입니다:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

이 패턴 — 배포하기 전에 `config`를 쿼리한 다음, 이후에 `rollup`을 쿼리하는 것 — 은 변경될 수 있는 문서화된 값에 의존하는 대신, 선택한 프리셋이 정확히 무엇을 생성했는지 확인할 수 있게 해줍니다.

---

## 다음 단계

* **[롤업 배포하기](/rollups/deploying-a-rollup)** — 대시보드 또는 CLI를 통해 프리셋에서 롤업을 생성한 다음, 그 라이프사이클을 관리.
* **[롤업 개요](/rollups/overview)** — 프리셋이 묶는 정산 패러다임과 시퀀서 모드.
* **[롤업 개발 키트](/architecture/rollup-development-kit)** — 저수준 모듈 레퍼런스.
