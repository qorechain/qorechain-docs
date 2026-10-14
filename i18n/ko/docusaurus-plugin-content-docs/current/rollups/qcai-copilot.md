---
slug: /rollups/qcai-copilot
title: QCAI 롤업 코파일럿
sidebar_label: QCAI 코파일럿
sidebar_position: 7
---

# QCAI 롤업 코파일럿

RDK의 QCAI 롤업 코파일럿은 읽기 전용 도우미로, 하나의 롤업에 대한 네트워크의 자문 데이터를 — 수수료 추정치, 네트워크 권장 사항, 해당 롤업을 참조하는 사기 조사 내역, 강화 학습 에이전트의 상태를 — 모으려고 **시도**하고, 이를 짧은 제안 목록과 함께 하나의 이해하기 쉬운 요약으로 정리합니다.

:::caution 공개 엔드포인트에서는 사용할 수 없음
이 기능이 읽는 자문 서비스(`/qorechain/ai/v1/…` REST 경로와 `qor_*` JSON-RPC 네임스페이스)는 현재 메인넷과 테스트넷의 공개 `qore.host` 엔드포인트에서 **제공되지 않으므로**, 모든 섹션이 경고로 반환됩니다. 코파일럿은 설계상 최선 노력(best-effort) 방식입니다. 호출이 실패하지는 않지만, 결과가 비어 있다고 해서 롤업을 점검했고 정상으로 확인되었다는 뜻은 **아닙니다**. 해당 서비스가 공개되기 전까지는 안전 신호로 사용하지 마세요. [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참조하세요.
:::

## 한 번의 호출: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

해당 서비스가 응답하는 경우 결과에는 `feeEstimate`, `networkRecommendations`, `fraudInvestigations`, `rlAgentStatus`도 포함됩니다.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

연결할 수 없는 서비스는 오류가 아닌 경고로 표시되며, 어느 것에도 연결할 수 없는 경우에도 사람이 읽는 출력에는 "no issues flagged" 줄이 여전히 출력될 수 있으므로 — 경고를 확인하세요. `qorollup` 운영자 CLI에 대해서는 [롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
