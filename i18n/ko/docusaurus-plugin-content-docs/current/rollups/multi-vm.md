---
slug: /rollups/multi-vm
title: 멀티 VM (크로스 VM 호출)
sidebar_label: 멀티 VM
sidebar_position: 8
---

# 멀티 VM (크로스 VM 호출)

RDK에는 EVM 컨트랙트에서 `0x0000000000000000000000000000000000000901` 주소의 **크로스 VM 프리컴파일**로 향하는 호출을 인코딩하는 TypeScript 헬퍼가 포함되어 있으며, 이 프리컴파일은 해당 호출을 **QoreChain Native**(Wasm) 런타임의 CosmWasm 컨트랙트로 라우팅하도록 설계되었습니다. 또한 이를 연결해 주는 `multivm-rollup` 스캐폴드 템플릿도 있습니다. 이 툴링은 **EVM → QoreChain Native**만을 다룹니다. SVM은 별도의 런타임이며 프리컴파일의 일부가 아닙니다.

:::caution 아직 라이브 네트워크에서 사용할 수 없음
크로스 VM 프리컴파일은 어느 네트워크에서도 **활성화되지 않았습니다**: EVM 모듈의 활성 정적 프리컴파일 목록은 메인넷과 테스트넷 모두에서 비어 있고, `0x…0901`에 대한 `eth_getCode`는 `0x`를 반환하며, 이 주소에 대한 호출은 빈 데이터와 함께 성공하지만 아무것도 실행하지 않습니다. CosmWasm 컨트랙트 업로드도 두 네트워크 모두에서 닫혀 있으며, SVM 트랜잭션 레인은 네트워크 전체에서 비활성화되어 있습니다. 프리컴파일이 활성화되고 CosmWasm 업로드가 다시 열리기 전까지는 호출할 대상이 없습니다. 이 페이지는 준비할 수 있도록 툴링을 문서화한 것이며, 이를 기반으로 프로덕션 흐름을 구축하지 마세요. [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를 참조하세요.
:::

:::caution 0.5.0 인코더는 체인의 레이아웃과 일치하지 않습니다
`@qorechain/rdk` 0.5.0의 `encodeCrossVmCalldata`(그리고 `multivm-rollup` 템플릿의 `CrossVmCaller.sol` 스타터)는 `executeCrossVMCall(string,bytes)` 함수를 사용합니다. 노드는 `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`를 디코딩하며(4바이트 셀렉터에 이어 ABI 인코딩된 인자들이 오고, `targetVM` 1이 CosmWasm이며 지원되는 유일한 대상입니다), ABI는 활성화 전에 아직 바뀔 수 있습니다. 따라서 헬퍼가 만든 calldata는 프리컴파일이 생기더라도 노드에서 디코딩되지 않습니다. 아래 섹션은 노드의 레이아웃을 보여 줍니다.
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
    1, // CosmWasm
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`@qorechain/rdk`의 `encodeCrossVmCalldata({ contract, msg })`는 대신 `(string,bytes)` 형식을 빌드하는데, 노드는 이 형식을 읽지 않습니다(위의 주의 사항 참조).

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

프리컴파일이 비활성 상태이므로 이에 대한 일반 `.call`은 **빈 데이터와 함께 성공을 반환하고 아무 일도 하지 않습니다**. `ok` 플래그만으로는 호출이 실제로 적용되었는지 알 수 없습니다. 오늘 이를 테스트한다면 대상 컨트랙트에서 그 효과를 직접 확인하세요.

## 멀티 VM 롤업 스캐폴딩

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

이 템플릿에는 시작점이 되는 `contracts/CrossVmCaller.sol`이 포함되어 있습니다. 이를 신뢰하기 전에 위의 노드 레이아웃과 비교해 보세요. 모든 스캐폴더 템플릿은 [롤업 배포하기](/rollups/deploying-a-rollup)를 참고하세요.
