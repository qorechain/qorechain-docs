---
slug: /rollups/why
title: QoreChain RDK를 선택하는 이유
sidebar_label: QoreChain RDK를 선택하는 이유
sidebar_position: 2
---

# QoreChain RDK를 선택하는 이유

대부분의 롤업 개발 키트는 같은 주제의 변주에 불과합니다. 즉, 베이스 레이어에
정산하는 앱 체인을 출시하도록 도와주는 것이죠. QoreChain RDK도 그 역할을
하며, 여기에 툴링이 아니라 QoreChain의 Layer 1을 기반으로 구축된 QoreChain
고유의 세 가지 기능을 더합니다:

- **포스트 양자(post-quantum)** 정산 레이어,
- **온체인 AI/RL** 자문 프리미티브(QCAI),
- 크로스 VM 호출을 지원하는 **트리플 VM** 런타임.

:::caution 초기 단계: 상태 열을 확인하세요
아직 어느 네트워크에서도 롤업이 생성된 적이 없습니다(2026년 10월 27일 확인).
아래 표는 현재 실제로 동작하는 것이 무엇인지 설명합니다. 릴리스된 0.6.x
클라이언트가 바꾼 점과 남아 있는 제한 사항은 [RDK 0.7.0: 변경 사항과 제한 사항](/rollups/deploying-a-rollup#rdk-050-limits)에
정리되어 있습니다. 일반적인 옵티미스틱/zk 롤업만 필요하다면
어떤 키트든 상관없습니다. 여기에 나열된 기능은 RDK가 그 위에 더하는 것이며,
TypeScript, Python, Go, Rust, Java로 제공됩니다.
:::

| 기능 | 상태 | 의존하는 요소 |
| --- | --- | --- |
| **정산 영수증** | 🟡 초기 단계 | 앵커는 메인 체인의 포스트 양자 방식인 ML-DSA-87로 서명되며, 아직 앵커는 존재하지 않으므로 (체인에 대해 검사하는) 0.7.0 검증기는 실제 앵커에 대해 실행된 적이 없음 |
| **QCAI Rollup Copilot** | 🟡 아직 공개 엔드포인트에서 사용할 수 없음 | 현재 공개 엔드포인트가 노출하지 않는 온체인 AI/RL 자문 서비스 |
| **멀티 VM 크로스 VM 호출** | 🟡 아직 라이브 네트워크에서 사용할 수 없음 | 활성화되지 않은 크로스 VM 프리컴파일(0.6.0 이후의 인코더는 체인의 레이아웃과 일치함), 그리고 닫혀 있는 QoreChain Native 업로드 |

---

## 1. 정산 영수증

> 🟡 **QoreChain의 포스트 양자 베이스 레이어 위에 구축된 설계입니다.** 정산
> 앵커는 메인 체인이 사용하는 것과 동일한 방식인 ML-DSA-87(Dilithium-5,
> FIPS-204)로 서명됩니다. 초기 단계: 아직 어느 네트워크에도 앵커가 존재하지
> 않습니다.

롤업 생성자가 정산 배치를 앵커링하면, 앵커는 온체인에 등록된 포스트 양자
키로 서명됩니다. RDK는 그 앵커를 **이동 가능한 영수증**으로 패키징할 수
있으며, 검증자는 QoreChain 노드에서 해당 주장을 다시 읽어 롤업, 배치, 앵커,
생성자의 키가 모두 체인에 기록된 내용과 일치하는지 확인합니다.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

`verifySettlementReceipt`는 체인에 대해 검사하며 `client` 없이는
`valid`라고 말하지 않습니다. 0.5.0에서는 그 체인 검사가 라이브 네트워크에 대해
완료될 수 없었으며(정상적인 영수증을 유효하다고 보고하는 대신 안전하게
실패(fail closed)했습니다), 0.6.0이 이를 수정했고 0.6.1(그리고 이후의 모든 릴리스)은 영수증의 모든 필드를 비교하지만, 아직 앵커가 존재하지 않으므로
둘 다 실제 앵커에 대해서는 실행된 적이 없습니다. 영수증이 무엇을 증명하고 무엇을 증명하지 않는지, 그리고 정확한
제한 사항은 [정산 영수증](/rollups/settlement-receipts)을
참조하세요.

---

## 2. QCAI Rollup Copilot

> 🟡 **아직 공개 엔드포인트에서 사용할 수 없습니다.**

Copilot은 네트워크의 자문 서비스(수수료 정책 에이전트, 권장 사항, 사기 조사)를
하나의 롤업에 대한 읽기 전용 자연어 뷰로 집계하기 위한 것입니다. 최선
노력(best-effort) 방식으로 동작합니다: 서비스에 접근할 수 없으면 실패하는
대신 경고로 격하됩니다. 이러한 서비스는 현재 공개 엔드포인트에 노출되어 있지
않으므로, 모든 섹션이 경고로 반환됩니다.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

CLI에서: `qorollup advise my-rollup`. [QCAI Copilot](/rollups/qcai-copilot)을
참조하세요.

---

## 3. 멀티 VM 크로스 VM 호출

> 🟡 **아직 라이브 네트워크에서 사용할 수 없습니다** — 프리컴파일이 활성화되지
> 않았고 QoreChain Native 업로드가 닫혀 있습니다. [Multi-VM](/rollups/multi-vm)을
> 참조하세요.

RDK에는 EVM(Solidity) 컨트랙트에서 `0x…0901`에 고정된 프리컴파일을 통해
**QoreChain Native** 컨트랙트로 보내는 호출을 인코딩하는 헬퍼가 포함되어 있습니다.
이 프리컴파일은 메인넷과 테스트넷 모두에서 **활성화되어 있지 않습니다**
([EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status) 참조):
두 네트워크 모두에서 `0x…0901`에 대한 `eth_getCode`는 `0x`를 반환하며, 이
주소로의 컨트랙트 호출은 아무 효과 없이 성공합니다.

헬퍼 `encodeCrossVmCalldata`(0.6.0부터)는
`executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`용
calldata를 만들며, 이는 노드가 디코딩하는 레이아웃입니다(0.5.0 이하는 셀렉터가
다른 두 인수 형태로 인코딩했으며, 이는 프리컴파일에 도달할 수 없었습니다).
같은 호출을 직접 인코딩할 수도 있습니다. 여기서는 viem을 사용하며,
`targetVM` 1은 QoreChain Native로 유일하게 지원되는 대상입니다:

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = QoreChain Native
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

또는 롤업의 Solidity에서 직접:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

현재로서는 `ok`만으로는 아무것도 증명되지 않습니다: 프리컴파일에 코드가 없는
동안 호출은 빈 데이터와 함께 성공을 반환하고 아무것도 실행하지 않으므로,
대상 컨트랙트에서 그 효과를 확인하세요.

`npm create qorechain-rollup my-app -- --template multivm-rollup`으로 스타터를
스캐폴딩하세요. (EVM↔QoreChain Native만 해당; SVM 크로스 호출은 별도입니다.)

---

## 그 외 기대할 수 있는 모든 것

이러한 기능 외에도, RDK는 기본기도 함께 제공합니다: 공유 골든 벡터로 검증된
5개의 게시된 언어 클라이언트, 5가지 프리셋 프로필과 전체 호환성 매트릭스,
정산 배치 및 라이프사이클 관리, 네이티브 데이터 가용성 스토리지(상태 참고
사항 참조), 옵티미스틱 롤업을 위한 **워치타워(watchtower)** 자동 챌린저, 그리고
`qorollup` 운영자 CLI까지 갖추고 있습니다.

## 다음 단계

- [롤업 배포하기](/rollups/deploying-a-rollup) — 언어별 설치 방법과 테스트넷
  롤업까지의 CLI 경로.
- [정산 영수증](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [워치타워](/rollups/watchtower) — 심층 문서.
