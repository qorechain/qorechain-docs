---
slug: /sdk/guides/cross-vm
title: 크로스-VM 가이드
sidebar_label: 크로스-VM
sidebar_position: 4
---

# 크로스-VM 가이드

QoreChain은 **EVM, SVM, QoreChain Native을 나란히** 실행하며, `x/crossvm` 모듈을 통해
하나의 네이티브 계정이 그중 어느 것에 있는 컨트랙트라도 호출할 수 있습니다. SDK는 이러한
호출을 빌드, 서명, 브로드캐스트하기 위한 고수준 `createCrossVMClient` 헬퍼를 제공하며 —
여러 호출을 **세 VM 전체에 걸친 하나의 원자적 트랜잭션**으로 묶는 것을 포함합니다 —
메시지 상태를 추적하기 위한 타입이 지정된 읽기 헬퍼도 제공합니다. *EVM 내부에서* 시작되는
EVM→네이티브 라우팅은 여전히 `@qorechain/evm`의 **크로스-VM 브리지 프리컴파일**을 통해
온체인에서 실행됩니다.

:::caution 현재 작동하는 것
크로스-VM 호출은 대상 레인이 사용 가능한 만큼만 사용할 수 있습니다:

- `MsgCrossVMCall`은 **메인넷**에서 체인의 서킷 브레이커에 의해 꺼져 있습니다
  (`GET /cosmos/circuit/v1/disable_list`에 `/qorechain.crossvm.v1.MsgCrossVMCall`이
  나열됩니다). 테스트넷에서는 활성화되어 있습니다.
- SVM 트랜잭션 레인은 네트워크 전체에서 비활성화되어 있고, QoreChain Native 업로드와
  인스턴스화는 허가제이며(메인넷에는 컨트랙트가 없습니다), EVM 브리지 프리컴파일은
  활성화되어 있지 않습니다
  ([EVM 프리컴파일](/developer-guide/evm-precompiles#network-status) 참조).
- 아래의 타입이 지정된 REST 읽기 헬퍼는 공개 게이트웨이가 제공하지 않는 경로를
  호출합니다. 대신 `connectQueryClients(rpc).crossvm`으로 메시지를 읽으세요.
- 모든 Native 경로 트랜잭션과 마찬가지로, 크로스-VM 호출도 하이브리드 서명을 담아야
  합니다. 서명 클라이언트를 계정의 키쌍과 함께 연결하면
  (`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) 크로스-VM 클라이언트가
  하이브리드로 서명합니다([계정 및 PQC 서명](/sdk/concepts/accounts-pqc#hybrid-signing) 참조).
  0.9.0 이전 릴리스는 클래식 방식으로 서명하므로 공개 네트워크가 이를 거부합니다.
:::

## 통합 크로스-VM 호출

`createCrossVMClient`는 `MsgCrossVMCall`(타입 URL
`/qorechain.crossvm.v1.MsgCrossVMCall`)을 래핑하므로, `{ typeUrl,
value }`를 직접
손으로 빌드하거나 페이로드를 직접 인코딩할 필요가 없습니다. 클라이언트의 sender는 연결된
`TxClient`의 주소이며, `sourceVm`은 기본적으로 `"evm"`입니다.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid-signed (SDK 0.9.0)
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
| `{ cosmwasm: object }` | `JSON.stringify` 후 UTF-8 바이트(QoreChain Native execute-msg 관례) |
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
EVM + SVM + QoreChain Native 전체에 걸친 호출이 모두 함께 처리되거나 전혀 처리되지 않습니다:

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
사용하고 `qor_getCrossVMMessage` JSON-RPC 메서드(공개 엔드포인트는 이를 제공하지
않습니다)로 폴백합니다. 컨센서스 RPC를 통해 읽는, 타입이 지정된 쿼리 클라이언트를
전달하세요:

```ts
import { connectQueryClients } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);

// Module parameters and the pending queue, over the same typed client:
const params = await queries.crossvm.params();
const pending = await queries.crossvm.pendingMessages();
```

## 크로스-VM 메시지 상태 읽기

`@qorechain/sdk`는 `x/crossvm` 위의 타입이 지정된 REST 래퍼를 내보냅니다. 이들은
`/qorechain/crossvm/v1/{message/{id},pending,params}`를 호출하는데, 공개 게이트웨이는
이 경로를 제공하지 **않으므로**(`api.qore.host`와 `api-testnet.qore.host`에서
`Not Implemented`), 공개 엔드포인트에 대해서는 `QoreHttpError`를 던집니다. 이들은
해당 경로를 노출하는 노드를 위한 것이며, 공개 네트워크에서는 위의
`connectQueryClients`를 사용하세요.

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://api-testnet.qore.host" },
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

노드가 제공하기 시작하면 `qor_` JSON-RPC 네임스페이스를 통해 메시지를 읽을 수도
있습니다:

> **아직 제공되지 않음:** 릴리스된 어떤 노드 빌드도 `qor_` JSON-RPC 네임스페이스를 제공하지 않으므로, 이 호출은 현재 모든 공개 엔드포인트에서 `-32601`(메서드를 찾을 수 없음)을 반환합니다. [`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참조하세요.

```ts
const m = await client.qor.getCrossVmMessage(messageId);
```

## EVM 브리지 프리컴파일

EVM→네이티브 라우팅은 `@qorechain/evm`에 노출된 크로스-VM 브리지 프리컴파일을 통해
온체인에서 실행됩니다:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

> **활성화되지 않음.** 크로스-VM 브리지 프리컴파일은 메인넷과 테스트넷에서 활성화되어
> 있지 않으며, 현재 형태로는 활성화되지 않을 것입니다. 먼저 재구축 중입니다. 현재
> `0x…0901` 호출은 빈 데이터를 반환하고 아무것도 라우팅하지 않습니다.
> [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를
> 참조하세요.

활성화되면, Solidity 컨트랙트(또는 viem)가 해당 주소의 프리컴파일을 호출하여 메시지를
네이티브 레이어로 라우팅한 다음, 위의 읽기 헬퍼로 그 상태를 추적합니다. 전체 프리컴파일
목록은 [EVM 가이드](/sdk/guides/evm)를 참고하세요.
