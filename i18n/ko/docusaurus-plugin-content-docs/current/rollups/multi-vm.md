---
slug: /rollups/multi-vm
title: 멀티 VM (크로스 VM 호출)
sidebar_label: 멀티 VM
sidebar_position: 8
---

# 멀티 VM (크로스 VM 호출)

RDK에는 EVM 컨트랙트에서 `0x0000000000000000000000000000000000000901` 주소의 **크로스 VM 프리컴파일**로 향하는 호출을 인코딩하는 TypeScript 헬퍼가 포함되어 있으며, 이 프리컴파일은 해당 호출을 **QoreChain Native**(Wasm) 런타임의 QoreChain Native 컨트랙트로 라우팅하도록 설계되었습니다. 또한 이를 연결해 주는 `multivm-rollup` 스캐폴드 템플릿도 있습니다. 이 툴링은 **EVM → QoreChain Native**만을 다룹니다. SVM은 별도의 런타임이며 프리컴파일의 일부가 아닙니다.

:::caution 아직 라이브 네트워크에서 사용할 수 없음
크로스 VM 프리컴파일은 어느 네트워크에서도 **활성화되지 않았습니다**: EVM 모듈의 활성 정적 프리컴파일 목록은 메인넷에서 비어 있고 테스트넷에서는 `0x…0A01`, `0x…0A02`, `0x…0C01`만 들어 있으므로(2026년 10월 27일 확인) `0x…0901`은 어느 목록에도 없습니다. `0x…0901`에 대한 `eth_getCode`는 `0x`를 반환하며, 이 주소에 대한 호출은 빈 데이터와 함께 성공하지만 아무것도 실행하지 않습니다. QoreChain Native 컨트랙트 업로드도 두 네트워크 모두에서 닫혀 있으며, SVM 트랜잭션 레인은 네트워크 전체에서 비활성화되어 있습니다. 프리컴파일이 활성화되고 QoreChain Native 업로드가 다시 열리기 전까지는 호출할 대상이 없습니다. 이 페이지는 준비할 수 있도록 툴링을 문서화한 것이며, 이를 기반으로 프로덕션 흐름을 구축하지 마세요. [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를 참조하세요.
:::

:::note 인코더는 0.6.0부터 체인의 레이아웃과 일치합니다
`@qorechain/rdk` **0.5.0 및 그 이전**의 `encodeCrossVmCalldata`(그리고 해당 릴리스의 `multivm-rollup` 템플릿에 있는 `CrossVmCaller.sol` 스타터)는 `executeCrossVMCall(string,bytes)`를 사용했는데, 이는 노드가 디코딩하는 것과 다른 함수 셀렉터이므로 이들이 인코딩한 호출은 프리컴파일을 활성화한 네트워크에서도 프리컴파일에 도달할 수 없었습니다. **0.6.0**은 `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`(셀렉터 `0x3c11078c`)를 인코딩하며, 이것이 노드가 디코딩하는 형식입니다(4바이트 셀렉터에 이어 ABI 인코딩된 인자들이 오고, `targetVM` 1이 QoreChain Native이며 지원되는 유일한 대상입니다). 릴리스 노트에 따르면 헬퍼의 calldata는 체인 자체의 디코더를 거쳐 왕복 변환됩니다. ABI는 활성화 전에 아직 바뀔 수 있습니다.
:::

:::note
RDK v0.4.2부터 Wasm 런타임의 VM 옵션 식별자는 **`native`**(QoreChain Native)입니다. `cosmwasm`은 여전히 허용되는 레거시 별칭이며, 두 값 모두 전송 시에는 `cosmwasm`으로 매핑됩니다.
:::

## 프리컴파일 주소

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## 크로스 VM 호출 인코딩

노드의 레이아웃을 직접 인코딩하세요. `payload`는 컨트랙트의 execute 메시지를 UTF-8 JSON 바이트로 만든 것입니다(viem 사용 예):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`@qorechain/rdk` 0.6.0 이상(현재는 0.7.0)의 `encodeCrossVmCalldata`가 같은 calldata를 대신 빌드해 줍니다:

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

`isCrossVmPrecompileActive(restBase)`는 REST로 EVM 매개변수 `active_static_precompiles`를 읽고, 프리컴파일의 주소가 목록에 있을 때만 `active: true`로 응답합니다. 이것이 유일하게 신뢰할 수 있는 확인 방법이며 오프체인에서 이루어져야 합니다. 프리컴파일은 대상의 원시 응답을 그대로 반환하므로, 빈 응답만으로는 비활성 프리컴파일과 아무것도 반환하지 않는 컨트랙트에 대한 정상 호출을 구분할 수 없고, 프리컴파일은 활성 여부와 관계없이 바이트코드가 없기 때문입니다. `active: true`로 보고되더라도, 패키지 문서에 따르면 체인 v3.2.3부터 호출은 거버넌스가 허용 목록에 올린 대상(크로스 VM 매개변수 `bridge_allowed_targets`, 각 항목은 `<vm>:<contract>`)에만 도달하며 EVM-to-EVM은 거부됩니다.

### 체인 v3.2.5: 허용 목록, 응답 형식, 거부 {#chain-v325}

체인 v3.2.5는 브리지의 동작을 바꿉니다. 테스트넷은 이를 실행 중이며, **메인넷(v3.2.4)은 거버넌스 제안 14가 적용되기 전까지 실행하지 않습니다.** 이 페이지의 다른 곳에서 프리컴파일이 대상의 원시 응답을 반환한다고 설명한 내용은 오늘 기준 메인넷에 대한 설명입니다.

* **허용 목록 경로.** `GET /qorechain/crossvm/v1/params`는 대상 허용 목록을 포함한 브리지 매개변수를 제공합니다. 테스트넷의 허용 목록은 비어 있으므로(2026년 10월 27일 확인) 아직 허용된 대상이 없습니다.
* **고정된 응답 형식.** 프리컴파일은 `abi.encode(bytes)`를 반환하므로 응답은 항상 64바이트 이상이며 빈 응답과 누락된 응답을 구분할 수 있습니다. `abi.decode(ret, (bytes))`로 디코딩하세요.
* **거부에는 사유가 담깁니다.** 브리지가 호출을 거부하면 `Error(string)`으로 리버트하며, 컨트랙트가 이를 읽고 전달할 수 있습니다.
* **프리컴파일은 여전히 활성 상태가 아닙니다.** `0x...0901`은 어느 네트워크의 활성 프리컴파일 목록에도 없으므로, 이 중 어느 것도 종단 간으로 실행된 적이 없습니다.

`@qorechain/rdk` 0.7.0에는 이를 위한 헬퍼가 있습니다(Solidity가 만든 인코딩에 대해 확인됨): `getCrossVmParams`(허용 목록), `crossVmTargetReady`(프리컴파일 활성, 브리지 활성화, 대상이 허용 목록에 있는지를 확인하며, 그렇지 않으면 막는 사유를 함께 반환), `decodeCrossVmResult`(`abi.decode(ret, (bytes))`), `decodeRevertReason`(`Error(string)`).

## Solidity 측

EVM 컨트랙트에서는 인코딩된 호출과 함께 프리컴파일 주소를 호출합니다:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data = abi.encodeWithSignature(
        "executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_
    );
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

프리컴파일이 비활성 상태이므로 이에 대한 일반 `.call`은 **빈 데이터와 함께 성공을 반환하고 아무 일도 하지 않습니다**. `ok` 플래그만으로는 호출이 실제로 적용되었는지 알 수 없습니다. 컨트랙트 안에서 신뢰할 수 있는 방어책은 항상 비어 있지 않은 확인 응답을 반환하는 대상을 사용하고, 호출 뒤에 `require(ret.length > 0)`를 두어 빈 응답을 실패로 처리하는 것입니다. `multivm-rollup` 템플릿이 이렇게 합니다(0.6.0부터).

## 멀티 VM 롤업 스캐폴딩

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

`multivm-rollup` 템플릿에는 `src/crossvm-call.ts`(프리컴파일이 라이브인지 확인한 뒤 calldata를 출력합니다)와 `executeCrossVMCall(uint8,string,bytes)`를 호출하고 대상으로부터 비어 있지 않은 응답을 요구하는 `contracts/CrossVmCaller.sol`이 포함되어 있습니다. 0.7.0부터 이 컨트랙트는 `abi.encode(bytes)` 결과를 디코딩하고, 활성 프리컴파일이 반환하는 최소 64바이트를 요구하며, 체인의 거부 사유를 그대로 전달합니다. 프리컴파일이 비활성인 동안에는 호출이 동작하게 만들어 주지 않습니다. 모든 스캐폴더 템플릿은 [롤업 배포하기](/rollups/deploying-a-rollup)를 참고하세요.
