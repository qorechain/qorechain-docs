---
slug: /rollups/qcai-copilot
title: QCAI 롤업 코파일럿
sidebar_label: QCAI 코파일럿
sidebar_position: 7
---

# QCAI 롤업 코파일럿

QCAI 롤업 코파일럿은 네트워크의 자문 서비스가 하나의 롤업에 대해 알고 있는
모든 것을 모아 단일한 평이한 언어 정보로 정리합니다: 라이브 수수료 추정치,
네트워크 추천, 해당 롤업을 참조하는 모든 사기 조사, 강화학습 에이전트의 상태,
그리고 실행에 옮길 수 있는 짧은 제안 목록입니다.

이는 **최선 노력(best-effort)** 방식입니다. 자문 서비스는 선택적 인프라이며 —
그중 하나에 도달할 수 없으면, 코파일럿은 호출 전체를 실패시키는 대신 해당 섹션을
생략하고 경고를 기록하면서 우아하게 성능을 저하시킵니다. 항상 결과를 얻습니다.

## 단일 호출: `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    evmRpc: "https://evm.testnet.example", // qor_ JSON-RPC for RL agent reads
  },
});

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## 기반이 되는 읽기 작업

`getRollupAdvice`는 직접 호출할 수도 있는 읽기 전용 메서드 집합을 집계합니다.
자문 REST 메서드는 `/qorechain/ai/v1/...` 아래에 있습니다:

- `getFeeEstimate(...)` — 현재 수수료 추정치.
- `getNetworkRecommendations(...)` — 네트워크 수준의 튜닝 추천.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — 진행 중인
  조사 및 id로 단일 조사 조회.
- `getCircuitBreakers(...)` — 자문용 서킷 브레이커 상태.

강화학습 읽기 작업은 `qor_*` JSON-RPC 네임스페이스를 사용합니다:

- `getRLAgentStatus()` — 에이전트의 현재 상태.
- `getRLObservation()` — 최신 관측값.
- `getRLReward()` — 최신 보상 신호.

이들이 모두 읽기 작업이므로, 코파일럿은 REST 엔드포인트(및 RL 읽기를 위한 EVM
/ `qor_` JSON-RPC 엔드포인트)만 필요합니다 — 서명자는 필요하지 않습니다.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise`는 집계된 자문을 출력하며, 도달할 수 없는 서비스는 오류가 아니라
경고로 드러냅니다. 전체 `qorollup` 운영자 CLI는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참고하세요.
