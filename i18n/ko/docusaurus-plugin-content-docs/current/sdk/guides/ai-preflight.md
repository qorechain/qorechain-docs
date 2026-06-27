---
slug: /sdk/guides/ai-preflight
title: AI 프리플라이트 가이드
sidebar_label: AI 프리플라이트
sidebar_position: 5
---

# AI 프리플라이트 가이드

QoreChain은 모든 dApp에 **온체인 AI 위험/이상 탐지 모델**을 노출하는 최초의
네트워크입니다. 두 개의 읽기 전용 EVM 프리컴파일을 통해 트랜잭션이 서명되거나
브로드캐스트되기 *전에*, 오직 `eth_call`만으로 트랜잭션을 점수화할 수 있습니다:

| 기능 | 프리컴파일 | 주소 |
|---|---|---|
| 콜데이터에 대한 위험 점수 | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| `(sender, amount)`에 대한 이상 검사 | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

구현은 `@qorechain/evm`([viem](https://viem.sh) 위의 EVM 어댑터)에 들어 있으며,
검색 편의를 위해 `@qorechain/sdk`에서 다시 내보냅니다.

> 위험 `level`은 위험한 트랜잭션일수록 높습니다. 체인의 예시 정책은
> `require(level < 3)`을 사용합니다.

## 단일 호출 프리플라이트

`simulateWithRiskScore`는 가스 추정, 위험 점수, 이상 검사를 하나의 권고적 판정으로
묶습니다:

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

const preflight = await simulateWithRiskScore(publicClient, {
  from: "0xYourAddress",
  to: "0xToken",
  data: "0xa9059cbb...", // ERC-20 transfer calldata
  value: 0n,
});

console.log(preflight.gas);     // bigint — eth_estimateGas
console.log(preflight.risk);    // { score: bigint, level: number }
console.log(preflight.anomaly); // { anomalyScore: bigint, flagged: boolean }
console.log(preflight.safe);    // boolean — advisory verdict
```

`safe`는 `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`로
계산되며, 임계값은 기본적으로 `3`입니다. `data`가 제공되지 않으면 위험 점수는 `to`에
배포된 바이트코드를 기준으로 계산되므로, 컨트랙트로의 단순 value 전송도 여전히
점수화됩니다.

> **`safe` 플래그는 권고적입니다.** 프리컴파일은 자체적으로 아무것도 차단하지 않습니다.
> 여러분만의 정책을 오프체인에서 설정하고 강제하세요(그리고 컨트랙트는 온체인에서 level에
> 대해 `require`할 수 있습니다). `RISK_LEVEL_UNSAFE_THRESHOLD`는 내보내져 있으므로,
> SDK가 문서화하는 동일한 기본값을 참조할 수 있습니다.

## 구성 요소

```ts
import { aiRiskScore, aiAnomalyCheck } from "@qorechain/evm";

// Risk score for raw calldata (accepts a 0x-hex string or a Uint8Array).
const { score, level } = await aiRiskScore(publicClient, "0xa9059cbb...");

// Anomaly check for a (sender, amount) pair.
const { anomalyScore, flagged } = await aiAnomalyCheck(
  publicClient,
  "0xYourAddress",
  1_000_000_000_000_000_000n, // 1 QOR in wei
);
```

둘 다 viem의 `encodeFunctionData`로 호출을 인코딩하고, 반환된 튜플을
`decodeFunctionResult`로 디코딩합니다.

## 주소 상수

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## 가용성

AI 프리컴파일은 QoreChain 네트워크 노드에 존재합니다. 일반 EVM 노드에서는 호출이
"not available" 에러를 던집니다 — 이 헬퍼 중 어느 것에서든 던져진 에러는 "이 노드에
기능이 존재하지 않음"으로 취급하세요.

전체 프리컴파일 목록은 [EVM 가이드](/sdk/guides/evm)를, 실행 가능한 예제는
[`ai-preflight` 예제](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight)를
참고하세요.
