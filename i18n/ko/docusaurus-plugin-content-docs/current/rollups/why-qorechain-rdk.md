---
slug: /rollups/why
title: QoreChain RDK를 선택하는 이유
sidebar_label: QoreChain RDK를 선택하는 이유
sidebar_position: 2
---

# QoreChain RDK를 선택하는 이유

대부분의 롤업 개발 키트는 같은 주제의 변주입니다. 즉, 베이스 레이어로 정산하는
앱체인을 출시하도록 돕습니다. QoreChain RDK도 그 일을 합니다 — 하지만 동시에
**다른 어떤 롤업 키트도 할 수 없는** 세 가지를 제공합니다. 이는 도구가 아니라
QoreChain의 Layer 1에 자리한 기능에 의존하기 때문입니다:

- **포스트 양자** 정산 레이어,
- **온체인 AI/RL** 자문 프리미티브(QCAI), 그리고
- 크로스 VM 호출을 지원하는 **트리플 VM** 런타임.

일반적인 옵티미스틱/zk 롤업만 필요하다면 어떤 키트든 충분합니다. 롤업의 정산을
**검증 가능하고, 양자 안전하며, AI를 인식하도록** 만들고 싶다면, 이를 표현할 수
있는 유일한 키트가 바로 이것입니다 — TypeScript, Python, Go, Rust, Java로.

| 차별점 | 상태 | 여기에서만 가능한 이유 |
| --- | --- | --- |
| **양자 안전 정산 영수증** | 🟢 독보적 (선도자) | 포스트 양자 L1이 필요 — 비PQC 베이스 레이어에서는 불가능 |
| **QCAI 롤업 코파일럿** | 🟢 체인을 통해 독보적 | QoreChain 전용 온체인 AI/RL 엔드포인트를 래핑 |
| **멀티 VM 크로스 VM 호출** | 🟡 차별화 | QoreChain은 EVM + CosmWasm + SVM을 하나의 체인에서 실행 |

---

## 1. 양자 안전 정산 영수증

> 🟢 **독보적.** 비포스트양자 L1 위에 구축된 롤업 키트는 이를 제공할 수 없습니다.

롤업이 정산 배치를 앵커링하면, QoreChain은 그 상태 루트를 **포스트 양자
(ML-DSA-87 / Dilithium-5, FIPS-204)** 서명 아래에서 Main Chain에 커밋합니다. RDK는
그 앵커를 **누구나 완전히 오프라인으로** 검증할 수 있는 **휴대 가능한 영수증**으로
바꿉니다 — 노드도, 키트에 대한 신뢰도 필요 없이, 오직 수학만으로.

영수증은 두 가지를 증명합니다: 배치의 상태 루트가 앵커링된 바로 그것이라는 점
(바인딩), 그리고 앵커가 레이어 생성자의 등록된 포스트 양자 키로 서명되었다는 점
(진위성). 서명은 정규 메시지
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`를
포괄합니다.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.network" }, // your QoreChain node REST
});

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**완전히 오프라인** — 영수증과 생성자의 공개 키를 누구에게든 건네면, 에어갭된
머신에서 네트워크에 접속하지 않고도 검증할 수 있습니다:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

동일한 영수증은 **다섯 가지 언어 전반에서 바이트 단위로 동일하게** 검증됩니다
(비TypeScript 클라이언트는 체인 자체의 `qorechain-pqc` 라이브러리를 사용합니다).
따라서 TypeScript 서비스가 생성한 영수증은 Go 감사자나 Java 백엔드에서도 동일하게
검증됩니다. [양자 안전 정산 영수증](/rollups/settlement-receipts)을 참조하세요.

---

## 2. QCAI 롤업 코파일럿

> 🟢 **체인을 통해 독보적.** 다른 네트워크에는 아예 없는 온체인 AI/RL
> 엔드포인트 위에 구축되었습니다.

QoreChain은 네트워크 수준의 AI/RL 서비스를 온체인으로 실행합니다 — 수수료 정책
에이전트, 네트워크 권장 사항, 부정 행위 조사, 서킷 브레이커. 코파일럿은 이를 하나의
롤업에 대한 단일하고 검토 가능한 평이한 언어 뷰로 통합합니다. 읽기 전용이며 최선의
노력 기반입니다: 자문 서비스에 접근할 수 없으면 실패하는 대신 경고로 격하됩니다.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet", endpoints: { rest, evmRpc } });

const advice = await getRollupAdvice(rdk, "my-rollup");

for (const s of advice.suggestions) {
  console.log(`[${s.level}] ${s.message}`);
  // [action] 2 open fraud investigation(s) reference this rollup …
  // [warn]   QCAI reports network congestion — consider raising the fee …
  // [info]   A live QCAI fee estimate is available …
}

console.log(advice.feeEstimate);          // live QCAI fee estimate
console.log(advice.fraudInvestigations);  // investigations touching this rollup
console.log(advice.rlAgentStatus);        // the RL fee/routing agent's state
```

CLI에서:

```bash
qorollup advise my-rollup
```

다른 키트에는 래핑할 대상이 없습니다 — 자문 데이터는 QoreChain 프리미티브입니다.
[QCAI 코파일럿](/rollups/qcai-copilot)을 참조하세요.

---

## 3. 멀티 VM 크로스 VM 호출

> 🟡 **차별화.** QoreChain은 EVM, CosmWasm, SVM을 하나의 체인에서 실행하며,
> EVM → CosmWasm을 연결하는 프리컴파일을 갖추고 있습니다.

여러분의 EVM(Solidity) 롤업 컨트랙트는 `0x…0901`의 고정 프리컴파일을 통해 기존
**CosmWasm** 컨트랙트를 호출할 수 있습니다. RDK가 calldata를 빌드해 주므로,
CosmWasm 오라클, 토큰, 레지스트리를 다시 구현하지 않고도 Solidity에서 재사용할 수
있습니다.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

또는 롤업의 Solidity에서 직접:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

`npm create qorechain-rollup my-app -- --template multivm-rollup`으로 스타터를
스캐폴딩하세요. (EVM↔CosmWasm만 해당; SVM 크로스 호출은 별개입니다.)
[멀티 VM](/rollups/multi-vm)을 참조하세요.

---

## 그 외 기대할 만한 모든 것

차별점 외에도 RDK는 기본 사양도 제공합니다: 공유 골든 벡터에 대해 검증된 다섯
가지 공개 언어 클라이언트, 다섯 가지 프리셋 프로필과 전체 호환성 매트릭스, 정산
배치 및 라이프사이클 관리, 네이티브 데이터 가용성, 옵티미스틱 롤업을 위한
**watchtower** 자동 챌린저, 그리고 `qorollup` 운영자 CLI.

## 다음

- [롤업 배포하기](/rollups/deploying-a-rollup) — 언어별 설치 및
  영(zero)에서 라이브 테스트넷 롤업까지.
- [양자 안전 정산 영수증](/rollups/settlement-receipts) ·
  [QCAI 코파일럿](/rollups/qcai-copilot) ·
  [멀티 VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — 심층 분석.
