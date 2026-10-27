---
slug: /dashboard/contract-auditor
title: 컨트랙트 감사기
sidebar_label: 컨트랙트 감사기
sidebar_position: 7
---

# 컨트랙트 감사기

**컨트랙트 감사기(Contract Auditor)**(사이드바 **Build**, 항목 **AI Audit**)는 QoreChain의 AI 어시스턴트인 **QCAIA**로 붙여넣은 컨트랙트 소스의 보안 검토를 실행하고, 점수, 위험 수준, 그리고 권장 수정안이 포함된 발견 사항을 반환합니다. 컨트랙트를 테스트하고 배포하기 전에 빠른 두 번째 검토를 원하는 개발자를 위한 도구입니다. 정식 감사가 아니며 사람의 검토를 대체하지 않습니다.

## 혁신 {#innovations}

- **블록체인 자동 감지.** "Auto-detect from code"가 기본값이며, 대신 17개 에코시스템 중 하나를 직접 고를 수 있습니다.
- **별도의 포스트 퀀텀 준비도 백분율.** 0에서 100까지의 Security Score 옆에 따로 표시되므로 보안 점수에 합산되지 않습니다.
- **UTC 기준 매일 무료 감사 1회.** 각 UTC 날짜의 첫 감사는 무료입니다. 그 이후에는 테스트넷에서 "Audit Cost"를 보여 주는 "Confirm Security Audit" 대화 상자를 확인한 뒤 테스트 QOR로 감사마다 비용을 지불하며, 메인넷에서는 추가 감사가 다음 UTC 날짜까지 대기합니다.
- **기본적으로 비공개인 보고서.** 소유자가 공개 여부를 전환하며, 공개 보고서에는 소유자의 이름이나 IP가 절대 표시되지 않습니다.
- **라벨만이 아니라 수정안이 포함된 발견 사항.** 각 발견 사항에는 심각도, 위치, 설명, 권장 수정안이 있으며, 전체 보고서에는 권장 사항, 가스 최적화, 모범 사례, 긍정적인 측면이 추가됩니다.

## 사용 방법 {#how-to-use}

### 감사 실행

1. 로그인하고(필수) **AI Audit**를 엽니다.
2. **Blockchain**(기본값 "Auto-detect from code"), **Name (Optional)**, **Contract Source Code**를 채웁니다.
3. **Run Security Audit**를 선택한 다음 "Confirm Security Audit" 대화 상자를 확인합니다.
4. **Security Report**가 같은 페이지에 인라인으로 나타납니다. **Export PDF**로 저장할 수 있습니다.

**최소 예시:** ERC-20을 붙여넣고, 자동 감지를 유지한 채 **Run Security Audit**, Confirm, **Export PDF** 순으로 진행합니다.

### 보고서 읽기

인라인 보고서에는 다음이 표시됩니다:

- 색상으로 구분되는 **Risk Level**;
- 0에서 100까지의 **Security Score**와 포스트 퀀텀 준비도 백분율;
- **Executive Summary**;
- **Vulnerabilities Found (N Issues)**. 심각도는 Critical, High, Medium, Low, Info입니다. 문제가 없는 결과는 "No vulnerabilities detected"로 표시됩니다.

각 발견 사항에는 심각도, 제목, 코드 내 위치, 설명, 권장 수정안이 나열됩니다.

전체 보고서 페이지 `/audits/<id>`에는 심각도 분류, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects**, 그리고 소유자에게는 공개 여부 스위치가 추가로 표시됩니다.

### 과거 감사 및 공유

- 본인의 보고서는 **Profile > Audited**에 있습니다.
- `/audits`의 **All Security Audits** 목록(홈 페이지에서 링크됨)은 모든 사용자의 최신 감사를 컨트랙트 이름, 블록체인, 위험 수준, 점수, 날짜가 있는 표로 보여 줍니다. 검색창은 이름, 블록체인, 위험 수준으로 필터링합니다. 행은 보고서가 공개되었거나 본인의 것일 때만 열립니다.
- 본인이 소유한 보고서 상단에는 "This report is private"라고 표시된 스위치가 있습니다. 이를 켜면 보고서가 공개되어 링크가 있는 누구나 읽을 수 있고(이름과 IP는 절대 표시되지 않습니다), 끄면 다시 비공개가 됩니다.

:::tip 배포 전에 감사하세요
배포하기 전 마지막 단계로 감사를 실행하고, 변경 후에는 다시 실행하세요. 발견 사항을 보증이 아니라 검증해야 할 지침으로 간주하고, 보고서를 [테스트넷](/getting-started/connecting-to-testnet)에서의 자체 테스트와 결합하세요.
:::

## 접근 방법 {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit) 또는 홈 페이지의 **New Audit**.
- **계정:** 감사를 실행하려면 로그인이 필요합니다. `/audits` 목록과 `/audits/<id>`의 공개 보고서는 계정 없이 열립니다.
- **네트워크:** 두 네트워크 모두에서 작동합니다. 매일 무료 규칙은 동일하며, 유료 추가 감사는 테스트넷에만 있습니다.
- **비용:** 각 UTC 날짜의 첫 감사는 무료이고, 테스트넷의 추가 감사는 테스트 QOR가 들며, 메인넷의 추가 감사는 다음 날까지 대기합니다.

## 게시 위치 {#where-published}

| 화면 | 주소 | 계정 |
| --- | --- | --- |
| 감사 실행 | `dashboard.qorechain.io/audit` | 로그인 필요 |
| All Security Audits | `dashboard.qorechain.io/audits` | 없음 |
| 보고서 | `dashboard.qorechain.io/audits/<id>` | 공개이면 없음, 그렇지 않으면 소유자 |

## 제한 사항 및 알려진 문제 {#limits}

- 붙여넣은 소스만 검토하며, 컴파일, 테스트, 런타임 분석은 하지 않습니다. 발견 사항이 불완전하거나 틀릴 수 있습니다.
- 비공개 보고서는 링크가 있어도 소유자 외에는 열 수 없습니다.

## 관련 문서

- [스마트 컨트랙트 생성기](/dashboard/smart-contract-creator) - QCAIA로 컨트랙트를 생성합니다.
- [포스트 양자 보안](/architecture/post-quantum-security) - QoreChain이 계정과 서명을 보호하는 방식입니다.
