---
slug: /sdk/why
title: QoreChain SDK를 선택하는 이유
sidebar_label: QoreChain SDK를 선택하는 이유
sidebar_position: 2
---

# QoreChain SDK를 선택하는 이유

QoreChain SDK는 현대적인 멀티체인 SDK가 제공하는 모든 것을 제공합니다 — 모든 모듈에 대한
타입이 지정된 메시지, 타입이 지정된 쿼리, 하나의 니모닉에서 세 가지 VM용 계정 생성,
자동 가스, 오류 디코딩, 구독, 지갑, 그리고 React 키트.

하지만 세 가지 기능은 **QoreChain에서만 가능**합니다. 다른 어떤 Layer 1에도 없는 프로토콜
기능 위에 구축되었기 때문입니다: 온체인 AI, 네이티브 브리지를 갖춘 세 개의 공존 VM,
그리고 필수 양자내성 암호화. 이것이 바로 여기서 빌드해야 하는 이유입니다.

---

## 1. AI 사전 위험 점수 평가

**브로드캐스트하기 전에 온체인 AI로 트랜잭션을 스캔하세요.**

QoreChain은 AI 위험 분석을 EVM 프리컴파일로 제공합니다. SDK가 이를 대신 호출하고
단일 호출로 가스와 함께 위험/이상 판정을 반환합니다 — 따라서 지갑이나 dApp이 서명
*전에* 경고(또는 차단)할 수 있습니다.

```ts
import { createClient } from "@qorechain/sdk";
import { simulateWithRiskScore } from "@qorechain/evm";

const client = createClient({ network: "mainnet", endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(client.evm, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**고유한 이유:** 점수 평가는 결정론적 프리컴파일로 *체인 내부에서* 실행됩니다
(`aiRiskScore`는 `0x…0B01`, `aiAnomalyCheck`는 `0x…0B02`). 다른
네트워크는 오프체인의 비결정론적 AI 서비스만 추가할 수 있습니다. 이것은 트랜잭션이
서명되기 전에 AI로 스크리닝하고 온체인 결과를 반환하는 최초의 SDK입니다.
[AI 사전 검사](/sdk/guides/ai-preflight)를 참조하세요.

---

## 2. 통합 크로스-VM 호출 — 하나의 계정, 세 개의 VM, 하나의 트랜잭션

**어떤 VM에서든 컨트랙트를 호출하고, 세 VM 전체에 걸쳐 호출을 원자적으로 배치하세요.**

QoreChain은 CosmWasm, EVM, SVM 컨트랙트를 네이티브 크로스-VM 브리지와 함께 동일한
체인에서 실행합니다. SDK는 이들 중 어느 것이든 호출할 수 있는 하나의 인터페이스를
노출합니다 — 그리고 여러 크로스-VM 호출을 한 번 서명되는 단일 원자적 트랜잭션으로
묶을 수 있습니다.

```ts
import { createCrossVMClient } from "@qorechain/sdk";

const crossVM = createCrossVMClient(tx, { query: client.query });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → CosmWasm.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**고유한 이유:** QoreChain은 세 개의 공존 VM과 네이티브 브리지 모듈
(`crossvm` + `CrossVMBridge` 프리컴파일)을 갖춘 유일한 L1입니다. 단일 VM
체인은 "하나의 계정, 세 개의 VM, 하나의 원자적 트랜잭션"을 표현할 수 없습니다 — 그들의
SDK는 래핑할 것이 없습니다. 한 번 작성하면 어떤 VM이든 호출할 수 있습니다.
[크로스-VM 호출](/sdk/guides/cross-vm)을 참조하세요.

---

## 3. 기본적으로 양자 안전

**한 번의 호출로 서명자를 양자내성 보호 상태로 만드세요.**

QoreChain은 프로토콜 수준에서 하이브리드 양자내성 서명(ML-DSA-87 + 고전 방식)을
강제합니다. SDK는 이를 도입하는 것을 한 줄로 만듭니다: 확인, 등록, 그리고 하이브리드
서명으로 마이그레이션 — 사용자가 보호받고 있음을 보여주는 React 배지와 함께.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Idempotent: registers the signer's ML-DSA-87 key on-chain if not already.
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair });
await hybrid.send(messages);
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key.
<QuantumSafeBadge address={account.address} />
```

**고유한 이유:** 양자내성 암호화는 QoreChain에서 실험이 아니라 네이티브이며 필수입니다.
이것은 "기본적으로 양자 안전"이 단일 호출과 드롭인 배지로 구현되는 최초의 SDK입니다.
[양자 안전](/sdk/guides/quantum-safe)을 참조하세요.

---

## 그 외 모든 것도

세 가지 차별화 요소 외에도, SDK는 **TypeScript, Python, Go, Rust, Java** 전반에 걸쳐
전체 체인 표면을 다룹니다: 모든 모듈에 대한 타입이 지정된 컴포저
(`multilayer`를 통한 사이드체인/페이체인 및 `rdk`를 통한 롤업 포함), 타입이 지정된
쿼리, tx 라이프사이클, 구독, 브라우저 지갑, 그리고
[`@qorechain/react`](/sdk/guides/react) 훅 키트.

빌드할 준비가 되셨나요? [퀵스타트](/sdk/quickstart)로 시작하세요.
