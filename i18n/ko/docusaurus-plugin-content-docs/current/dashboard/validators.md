---
slug: /dashboard/validators
title: 검증인
sidebar_label: 검증인
sidebar_position: 12
---

# 검증인

**검증인(Validators)** 페이지는 선택한 네트워크의 검증인을 요약 카드, 검색창과 함께 나열하며, 각 검증인의 순위, 투표력, 수수료율, 상태, 그리고 체인에서 읽어 온 변동 수익률 수치를 보여 줍니다. 어디에 위임할지 결정하는 사람을 위한 읽기 전용 비교 도구입니다. 위임 버튼은 없으며, 스테이킹은 지갑 페이지에서 이루어집니다. [스테이킹 및 검증인](/dashboard/staking-and-validators)을 참고하세요.

## 혁신 {#innovations}

- **목록이 선택한 네트워크를 따릅니다.** 페이지는 헤더에서 선택한 네트워크의 집합을 요청하므로, 메인넷을 보는 사람은 메인넷 검증인을, 테스트넷을 보는 사람은 테스트넷 검증인을 봅니다.
- **한계가 명시된, 체인에서 읽어 온 수익률.** APY 열은 체인의 스테이킹 티어 기본 비율에 (1 - 검증인 수수료율)을 곱한 값입니다. 별표와 함께 "variable, not guaranteed, lock bonuses not included"라는 문구가 표시됩니다. 이 수치는 변동하는 프로토콜 비율을 실시간으로 읽은 값이며, 약속도 예측도 아닙니다.
- **발행 한도 이후의 "From fees".** 발행 한도를 넘은 네트워크는 백분율 대신 **From fees**를 표시합니다. 더 이상 새 QOR가 발행되지 않고 스테이킹이 거래 수수료로만 수익을 내기 때문입니다. 테스트넷에서는 현재 이 열에 **From fees**가 표시됩니다. 알 수 없는 값은 0.00%가 아니라 대시로 표시됩니다.
- **투표력 기준 순위.** 순위는 투표력으로 계산되므로, 순위 1은 스테이크가 가장 많은 검증인입니다.
- **실제 수치, 정직한 공백.** 수수료율은 검증인의 실제 수수료율이며, 감금(jailed)된 검증인은 **Jailed**로 표시됩니다. 지역, 제안한 블록 수, 소프트웨어 버전, 마지막 확인 시각은 네트워크가 보고할 때만 표시되는데 현재는 보고하지 않으며, 알 수 없는 업타임은 0%가 아니라 **N/A**로 표시됩니다.

## 사용 방법 {#how-to-use}

1. 로그인한 다음 주소 `dashboard.qorechain.io/validators`로 페이지를 엽니다. 사이드바 링크는 없습니다.
2. 헤더에서 네트워크(**Mainnet** 또는 **Testnet**)를 선택합니다. 페이지가 해당 네트워크의 검증인으로 다시 로드됩니다.
3. 요약 카드를 확인합니다: **Active Validators**, **Total Bonded**, **Avg Commission**, **Avg Uptime**.
4. "Search by moniker or address" 검색창으로 검색합니다.
5. 각 행을 확인합니다: 순위와 모니커(주소와 복사 버튼 포함), **Voting power**(스테이크와 전체 대비 비중), **Commission**, **APY**, **Status**(active, jailed, inactive), 그리고 업타임과 선택적 세부 정보.
6. 위임하려면 지갑 페이지의 **Stake / Delegate** 탭([위임하기](/dashboard/staking-and-validators#delegate))으로 이동하세요. 검증인을 더 자세히 보려면 [익스플로러](/dashboard/explorer#validators)에서 해당 주소 페이지를 여세요.

:::caution APY 안내를 읽으세요
이 백분율은 변경될 수 있는 프로토콜 비율과 검증인의 수수료율에 따라 달라집니다. 선택적 시간 잠금 스테이킹 모듈의 잠금 보너스는 포함되지 않습니다. 보장된 수입으로 간주하지 마세요.
:::

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). 주소로만 접근할 수 있으며, 사이드바에는 나열되지 않습니다.
- **로그인:** 필요합니다. 로그아웃 상태에서는 페이지에 "Authentication Required"가 표시됩니다.
- **네트워크:** 헤더 스위치를 따릅니다.
- **지갑:** 페이지를 읽는 데는 필요하지 않습니다.
- **비용:** 무료입니다.

## 게시 위치 {#where-published}

| 화면 | 주소 | 네트워크 | 로그인 |
| --- | --- | --- | --- |
| 검증인 페이지 | `dashboard.qorechain.io/validators` | 메인넷과 테스트넷, 헤더 스위치 | 필요 |
| 익스플로러 검증인 표 | `dashboard.qorechain.io/explorer/validators` | 메인넷과 테스트넷 | 불필요 |
| 체인 데이터 | `GET /cosmos/staking/v1beta1/validators` (`api.qore.host` 및 `api-testnet.qore.host`) | 메인넷과 테스트넷 | 없음 |

## 제한 사항 및 알려진 문제 {#limits}

- **페이지는 읽기 전용**이며 사이드바에서 링크되지 않습니다.
- **APY는 변동되며 보장되지 않습니다.** 잠금 보너스를 제외하며, 발행 한도에 도달한 경우 **From fees**를 표시합니다.
- **노드 대시보드보다 적은 데이터 필드:** 지역, 제안한 블록 수, 소프트웨어 버전, 마지막 확인 시각은 사용할 수 있을 때만 표시되며, 업타임은 N/A로 표시될 수 있습니다.
- **감금(jailed)된 검증인**은 jailed로 표시되며 위임 패널에서 제공되지 않습니다.
- **데이터는 짧은 시간(약 30초) 캐시되므로**, 체인의 변경 사항이 나타나는 데 잠시 걸릴 수 있습니다.
