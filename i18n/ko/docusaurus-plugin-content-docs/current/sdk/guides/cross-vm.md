---
slug: /sdk/guides/cross-vm
title: 크로스-VM 가이드
sidebar_label: 크로스-VM
sidebar_position: 4
---

# 크로스-VM 가이드

QoreChain은 **EVM, SVM, CosmWasm을 나란히** 실행하며, `x/crossvm` 모듈을 통해
하나의 네이티브 계정이 그중 어느 것에 있는 컨트랙트라도 호출할 수 있습니다. SDK는 이러한
호출을 빌드, 서명, 브로드캐스트하기 위한 고수준 `createCrossVMClient` 헬퍼를 제공하며 —
여러 호출을 **세 VM 전체에 걸친 하나의 원자적 트랜잭션**으로 묶는 것을 포함합니다 —
메시지 상태를 추적하기 위한 타입이 지정된 읽기 헬퍼도 제공합니다. *EVM 내부에서* 시작되는
EVM→네이티브 라우팅은 여전히 `@qorechain/evm`의 **크로스-VM 브리지 프리컴파일**을 통해
온체인에서 실행됩니다.

## 통합 크로스-VM 호출

`createCrossVMClient`는 `MsgCrossVMCall`(타입 URL
`/qorechain.crossvm.v1.MsgCrossVMCall`)을 래핑하므로, `{ typeUrl, value }`를 직접
손으로 빌드하거나 페이로드를 직접 인코딩할 필요가 없습니다. 클라이언트의 sender는 연결된
`TxClient`의 주소이며, `sourceVm`은 기본적으로 `"evm"`입니다.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer);
const xvm = createCrossVMClient(tx);

// Call an EVM contract from a native account — the payload is ABI-encoded.
const { messageId, result } = await xvm.call({
  sourceVm: "cosmwasm",
  targetVm: "evm",
  targetContract: "0xToken",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

`VMType`은 `"evm" | "cosmwasm" | "svm"` 중 하나입니다(`VM_TYPES` 배열로도
내보내집니다).

### VM별 페이로드 인코딩

호출마다 정확히 **하나의** 페이로드 형태를 선택하세요:

| 형태 | 인코딩 |
|---|---|
| `{ payload: Uint8Array \| Hex }` | 원시 바이트, 변경 없이 그대로 전달 |
| `{ evm: { abi, functionName, args } }` | viem의 `encodeFunctionData`로 ABI 인코딩(셀렉터 + 인자) |
| `{ cosmwasm: object }` | `JSON.stringify` 후 UTF-8 바이트(CosmWasm execute-msg 관례) |
| `{ svm: { data: Uint8Array \| Hex } }` | 원시 바이트(SVM 명령어 blob) |

EVM 경로는 `viem`을 지연 임포트하므로, 선택적 `viem` 피어는 실제로 `{ evm: ... }`
페이로드를 사용할 때만 필요합니다.

### 빌드 전용(오프라인)

`buildCall`은 브로드캐스트하지 않고 `EncodeObject`를 반환합니다 — 검사, 직접 배칭,
또는 다른 곳에서의 서명에 유용합니다. (EVM 페이로드는 비동기적으로 ABI 인코딩되므로,
그런 경우에는 `call`/`callAtomic`을 사용하거나 미리 인코딩하여 `{ payload }`를
전달하세요.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## 원자적 트리플-VM 트랜잭션

`callAtomic`은 여러 `MsgCrossVMCall` 메시지를 **하나의 트랜잭션 본문**으로 묶어서
단일 서명 하에 원자적으로 실행되도록 합니다 — 바로 트리플-VM의 핵심입니다. 하나의 서명으로,
EVM + SVM + CosmWasm 전체에 걸친 호출이 모두 함께 처리되거나 전혀 처리되지 않습니다:

```ts
const { messageIds, result } = await xvm.callAtomic([
  {
    targetVm: "evm",
    targetContract: "0xToken",
    evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 2n] },
  },
  { targetVm: "svm", targetContract: "Prog...", svm: { data: instructionBytes } },
  { targetVm: "cosmwasm", targetContract: "qor1c...", cosmwasm: { ping: {} } },
]);
```

## 메시지 다시 읽기

`getMessage`는 id로 크로스-VM 메시지를 읽으며, 타입이 지정된 쿼리 클라이언트를 우선
사용하고 `qor_getCrossVMMessage` JSON-RPC 메서드로 폴백합니다:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## 크로스-VM 메시지 상태 읽기

`@qorechain/sdk`는 `x/crossvm` 위의 타입이 지정된 REST 래퍼를 내보냅니다:

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// A single message by id.
const msg = await getCrossVmMessage(client.rest, messageId);

// All pending messages.
const pending = await getPendingCrossVmMessages(client.rest);

// Module parameters.
const params = await getCrossVmParams(client.rest);
```

이들은 타입이 지정된 형태를 반환합니다: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse`, `CrossVmParamsResponse`.

`qor_` JSON-RPC 네임스페이스를 통해 메시지를 읽을 수도 있습니다:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## EVM 브리지 프리컴파일

EVM→네이티브 라우팅은 `@qorechain/evm`에 노출된 크로스-VM 브리지 프리컴파일을 통해
온체인에서 실행됩니다:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

해당 주소에서 Solidity 컨트랙트로부터(또는 viem을 통해) 프리컴파일을 호출하여 메시지를
네이티브 레이어로 라우팅한 다음, 위의 읽기 헬퍼로 그 상태를 추적하세요. 전체 프리컴파일
목록은 [EVM 가이드](/sdk/guides/evm)를 참고하세요.
