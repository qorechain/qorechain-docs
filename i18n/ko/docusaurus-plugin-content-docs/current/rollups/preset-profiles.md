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
아래의 프리셋별 값은 네트워크에 공개된 프로필 표를 그대로 반영하는, 배포된 **`@qorechain/rdk`** 프로필 기본값과 일치합니다. 아직 어느 네트워크에서도 롤업이 생성된 적이 없습니다. 신뢰할 수 있는 최종 구성은 `qorechaind query rdk config`(또는 `GET /qorechain/rdk/v1/params`를 읽는 `@qorechain/rdk`의 `rdk.params()`. 두 네트워크 모두에서 제공됨)로 라이브 모듈 파라미터를 조회하여 확인하고, 메인넷에 적용하기 전에 **`qorechain-diana`** 테스트넷에서 검증하세요.
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
프리셋별 구성은 v3.2.3 소스의 체인 프로필 표를 기준으로 검증되었으며(메인넷은 v3.2.3, 테스트넷은 v3.2.4 실행 중), 여기서 `create-rollup`은 프로필의 프리셋을 자동으로 적용합니다: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (기본값)**. `custom` 프리셋은 모든 필드를 열어 두며, 표시된 값은 그 시작 기본값일 뿐입니다.
:::

네 가지 도메인 프리셋은 합리적인 출발점으로, **`custom`** 프로필은 완전히 열린 옵션으로 생각하세요. 번들된 정확한 파라미터는 릴리스 간에 변경될 수 있으므로, 신뢰할 수 있는 값은 아래의 `rdk config` 조회로 확인한 뒤, 가장 가까운 프리셋에서 시작하여 다듬어 나가세요.

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI는 실행 가능한 스타터 프로젝트를 스캐폴딩하며 — 프로필당 하나의 템플릿(`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`)을 제공하므로 — 명령 한 번으로 프로필에서 동작하는 생성/조회 코드까지 이동할 수 있습니다.

---

## 프리셋이 온체인에 담는 것 {#what-a-preset-carries}

프로필을 고르기 전에 알아 두면 좋은, 쉽게 오해하기 쉬운 세부 사항이 있습니다:

* **`defi`에는 검증 키(verifying key)가 없습니다.** ZK 배치에는 검증 키가 필요한데, `create-rollup`으로 생성된 롤업에는 이것이 포함되지 않으므로 현재로서는 ZK 정산을 끝까지 최종 확정할 수 없습니다([ZK / STARK 및 출금](/rollups/zk-stark-withdrawals) 참조).
* **`nft`와 `custom`**은 1,000 QOR의 챌린지 본드와 메인넷 기준 100,800 블록의 챌린지 윈도우로 옵티미스틱하게 정산합니다(기본값 604,800 "초"를 블록당 6초로 고정 환산한 값이며, 메인넷의 현재 ≈3.2초 블록에서는 약 3.7일입니다). 테스트넷에서만, v3.2.4(높이 8,337,253)부터 제출된 배치는 대신 블록 타임의 초 단위로 측정되는 윈도우를 갖습니다.
* **`gaming`과 `enterprise`**는 `based` 시퀀싱을 사용하며, 현재는 롤업 생성자가 배치를 제출한다는 뜻입니다.
* **블록 시간과 트랜잭션 한도**(예: `defi` 500 ms, `gaming` 200 ms, `nft` 2,000 ms, `enterprise`와 `custom` 1,000 ms)는 온체인 레코드에 저장됩니다. 이는 해당 롤업 자체 체인을 설명하는 값이며 호스트 체인이 강제하지 않습니다.

---

## 프로필 선택하기 {#getting-a-recommendation}

`suggest-profile` 쿼리와 RDK의 `suggestProfile()` 헬퍼는 일반 언어로 된 설명으로부터 프리셋을 추천하도록 만들어졌습니다. 이들은 공개 엔드포인트가 제공하지 않는 `qor_suggestRollupProfile` JSON-RPC 메서드에 의존하므로, 현재 `suggestProfile()`은 **폴백**으로 항상 `defi`를 반환하고, `qorechaind query rdk suggest-profile`은 해당 RPC를 안내하는 문구만 출력합니다. 대신 위의 표에서 프로필을 고르고, 자신의 요구 사항(정산 보장, 시퀀서 신뢰 모델, 데이터 가용성 요구, VM)에 비추어 검토하세요.

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
