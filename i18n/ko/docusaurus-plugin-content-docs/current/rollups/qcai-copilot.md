---
slug: /rollups/qcai-copilot
title: QCAI 롤업 코파일럿
sidebar_label: QCAI 코파일럿
sidebar_position: 7
---

# QCAI 롤업 코파일럿

QCAI 롤업 코파일럿은 네트워크의 자문 서비스가 하나의 롤업에 대해 알고 있는
모든 정보를 모아 하나의 이해하기 쉬운 요약으로 정리해 줍니다. 실시간 수수료
추정치, 네트워크 권장 사항, 해당 롤업을 참조하는 사기 조사 내역, 강화 학습
에이전트의 상태, 그리고 바로 실행에 옮길 수 있는 짧은 제안 목록을 제공합니다.

이 기능은 **최선 노력(best-effort)** 방식으로 동작합니다. 자문 서비스는 선택적
인프라이므로, 어느 하나에 연결할 수 없더라도 코파일럿은 전체 호출을 실패시키는
대신 해당 섹션을 제외하고 경고를 기록하는 방식으로 우아하게 성능이 저하됩니다.
항상 결과를 받게 됩니다.

## 한 번의 호출: `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

// The public qore.host endpoints (REST + the qor_ JSON-RPC endpoint used for
// the RL agent reads) are baked into the presets since RDK 0.4.2 — no manual
// endpoint config needed; pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## 기반이 되는 읽기 메서드

`getRollupAdvice`는 직접 호출할 수도 있는 읽기 전용 메서드들을 집계합니다.
자문 REST 메서드는 `/qorechain/ai/v1/...` 아래에 있습니다:

- `getFeeEstimate(...)` — 현재 수수료 추정치.
- `getNetworkRecommendations(...)` — 네트워크 수준의 튜닝 권장 사항.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — 진행 중인
  조사 목록과 id로 조회하는 단일 조사.
- `getCircuitBreakers(...)` — 자문 서킷 브레이커 상태.

강화 학습 관련 읽기는 `qor_*` JSON-RPC 네임스페이스를 사용합니다:

- `getRLAgentStatus()` — 에이전트의 현재 상태.
- `getRLObservation()` — 최신 관측값.
- `getRLReward()` — 최신 보상 신호.

이들은 모두 읽기 작업이므로 코파일럿에는 REST 엔드포인트(그리고 RL 읽기를
위한 EVM / `qor_` JSON-RPC 엔드포인트)만 필요하며 — 서명자는 필요하지 않습니다.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise`는 집계된 조언을 출력하며, 연결할 수 없는 서비스는 오류가 아닌
경고로 표시됩니다. 전체 `qorollup` 운영자 CLI에 대해서는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
