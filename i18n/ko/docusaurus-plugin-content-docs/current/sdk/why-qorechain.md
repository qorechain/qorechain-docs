---
slug: /sdk/why
title: QoreChain SDK를 선택하는 이유
sidebar_label: QoreChain SDK를 선택하는 이유
sidebar_position: 2
---

# QoreChain SDK를 선택하는 이유

QoreChain SDK는 현대적인 멀티체인 SDK가 제공하는 모든 것을 제공합니다 — 모든
모듈에 대한 타입 지정 메시지, 타입 지정 쿼리, 하나의 니모닉으로 세 개의 VM
계정 생성, 자동 가스, 오류 디코딩, 구독, 지갑, 그리고 React 키트까지.

하지만 다섯 가지 기능은 **오직 QoreChain에서만 가능합니다**. 다른 어떤 Layer 1도
갖추지 못한 프로토콜 기능 위에 구축되었기 때문입니다: 온체인 AI, 네이티브
브리지로 연결된 세 개의 공존 VM, 필수 포스트 양자 암호화, 세 VM 레인 전체에
걸친 하나의 20바이트 아이덴티티, 그리고 외부 지갑 키를 위한 PQC 안전 위임
지출. 바로 이것이 여기에서 빌드해야 하는 이유입니다.

---

## 1. AI 사전 위험 점수 평가

**브로드캐스트하기 전에 온체인 AI로 트랜잭션을 스캔하세요** (대상 네트워크에서
AI 프리컴파일이 활성화되어 있어야 하며, 현재 퍼블릭 네트워크에서는 아직
활성화되어 있지 않습니다).

QoreChain은 AI 위험 분석을 EVM 프리컴파일로 제공합니다. SDK가 이를 대신
호출하여 가스와 위험/이상 징후 판정을 단일 호출로 반환합니다 — 지갑이나
dApp이 서명 *전에* 경고(또는 차단)할 수 있습니다. AI 프리컴파일은 메인넷과
테스트넷 모두에서 **아직 활성화되지 않았습니다**
([EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status) 참조).

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
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

**이것이 특별한 이유:** 점수 평가는 오프체인 서비스가 아니라 결정론적
프리컴파일(`0x…0B01`의 `aiRiskScore`, `0x…0B02`의 `aiAnomalyCheck`)로
*체인 내부에서* 실행되도록 설계되었습니다. 해당 프리컴파일이 활성화되기 전까지
위의 헬퍼는 퍼블릭 네트워크에서 오류를 발생시킵니다
(`returned no data ("0x")`. 테스트넷에서 활성화된 세 프리컴파일은 PQC와 컨센서스용이며 이것들이 아닙니다). [AI 사전 검사](/sdk/guides/ai-preflight)를
참조하세요.

---

## 2. 통합 크로스 VM 호출 — 하나의 계정, 세 개의 VM, 하나의 트랜잭션

**어떤 VM의 컨트랙트든 호출하고, 세 VM 전체에 걸친 호출을 원자적으로
배치하세요.**

QoreChain은 QoreChain Native, EVM, SVM 컨트랙트를 네이티브 크로스 VM 브리지와 함께
같은 체인에서 실행합니다. SDK는 이들 중 어느 것이든 호출할 수 있는 하나의
인터페이스를 제공합니다 — 그리고 여러 크로스 VM 호출을 한 번의 서명으로
하나의 원자적 트랜잭션에 담을 수 있습니다.

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → QoreChain Native.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**이것이 특별한 이유:** QoreChain은 세 개의 공존 VM을 네이티브 브리지
모듈(`crossvm`, 그리고 활성화되면 `CrossVMBridge` 프리컴파일, 아직 어느 네트워크에서도 활성화되어 있지 않음)과 함께
실행하므로, 하나의 SDK 인터페이스로 세 VM 모두를 다룰 수 있습니다. 단일 VM
체인에는 감쌀 만한 대응물이 없습니다. 현재 호출의 도달 범위는 대상 레인에
의해 제한됩니다. `MsgCrossVMCall`은 메인넷에서 꺼져 있고, SVM 트랜잭션은
비활성화되어 있으며, QoreChain Native 업로드와 인스턴스화는 허가제입니다(테스트넷에서는 인스턴스화가 열려 있음).
[크로스 VM 호출](/sdk/guides/cross-vm)을 참조하세요.

---

## 3. 기본으로 양자 안전

**단 한 번의 호출로 서명자를 포스트 양자 보호 상태로 만드세요.**

QoreChain은 하이브리드 포스트 양자 서명(ML-DSA-87 + 클래식)을 프로토콜
수준에서 강제합니다. SDK는 이를 도입하는 과정을 한 줄로 만듭니다: 확인, 등록,
하이브리드 서명으로의 마이그레이션 — 사용자에게 보호 상태를 보여주는 React
배지까지 포함해서요.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless the chain already has it:
// it reads the status over REST first and never registers blind.
const rest = "https://api.qore.host";
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair, rest });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, rest });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0 이상).
<QuantumSafeBadge address={account.address} />
```

**중요한 이유:** 포스트 양자 암호화는 QoreChain의 Native 경로에서 네이티브이자
필수이며, 실험이 아닙니다. SDK는 이를 도입하는 과정을 등록 호출 한 번과
하이브리드 전송 경로로 줄여 줍니다. 등록은 명시적으로 이루어집니다. 첫
트랜잭션에서 자동으로 등록되지 않습니다.
[양자 안전](/sdk/guides/quantum-safe)을 참조하세요.

---

## 4. 통합 eth 네이티브 계정 — 하나의 키, 세 개의 주소, 하나의 잔액

**하나의 `eth_secp256k1` 키가 세 레인 모두에서 하나의 20바이트
아이덴티티입니다.** (SDK 0.6.0, 체인 v3.1.83.) SVM 트랜잭션 레인은 현재
네트워크 전체에서 비활성화되어 있고, EVM 레인에는
[승인 창](/sdk/guides/evm#evm-window)이 필요합니다. 공유 잔액과 주소 매핑은
이와 무관하게 유지됩니다.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**고유한 이유:** 다른 곳의 멀티 VM 구성에서는 각 런타임이 자체 계정
공간을 갖고 있어 자금이 레인별로 고립됩니다. QoreChain은 하나의 20바이트
아이덴티티를 세 가지 방식으로 렌더링하고 하나의 공유 잔액을 제공합니다 —
지갑이 "한 레인에는 자금이 있는데 다른 레인에는 없는" 일이 결코 생기지
않습니다. Phantom 같은 외부 지갑은 제한된 권한의 인증자(authenticator)로 이 아이덴티티에
연결할 수 있습니다([인증자](/sdk/guides/authenticators)).
[통합 계정](/sdk/concepts/accounts-pqc#unified-accounts)을 참조하세요.

---

## 5. 인증자 레인 — PQC를 포기하지 않는 위임 지출

**연결된 Phantom 또는 MetaMask 키가 릴레이어를 통해, 한도 내에서, PQC 필수
정식 계정에서 지출합니다.** (SDK 0.7.0, 체인 v3.1.85.)

:::caution 메인넷에서는 아직 사용할 수 없습니다
`abstractaccount` 모듈은 `qorechain-vladi`에서 꺼져
있으며(`GET /qorechain/abstractaccount/v1/config`가 `"enabled": false`를
반환합니다), 체인 v3.2.0부터는 이 플래그가 모든 경로에서 강제되므로 메인넷에서는
키를 연결할 수 없고 아래의 레인도 사용할 수 없습니다. 이 모듈은
`qorechain-diana` 테스트넷에서 활성화되어 있습니다(2026년 10월 27일 확인).
[인증자 가이드](/sdk/guides/authenticators)를 참조하세요.
:::

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**중요한 이유:** 모듈이 활성화되면 모든 지출은 온체인 권한 분류 체계,
`SpendingRule` 한도, 만료 시간에 의해 제한됩니다 — 최소 권한이며 취소
가능합니다 — 그러는 동안에도 계정 자체는 포스트 양자 보호 상태를 유지합니다.
[인증자 및 위임 지출](/sdk/guides/authenticators)을 참조하세요.

---

## 그 밖의 모든 것도

다섯 가지 차별화 요소 외에도 SDK는 **TypeScript, Python, Go, Rust, Java**
전반에 걸쳐 체인의 전체 표면을 다룹니다: 모든 모듈에 대한 타입 지정
컴포저(`multilayer`를 통한 사이드체인/페이체인과 `rdk`를 통한 롤업 포함),
타입 지정 쿼리, 트랜잭션 수명 주기, 구독, 브라우저 지갑, 그리고
[`@qorechain/react`](/sdk/guides/react) 훅 키트까지.

빌드할 준비가 되셨나요? [빠른 시작](/sdk/quickstart)부터 시작하세요.
