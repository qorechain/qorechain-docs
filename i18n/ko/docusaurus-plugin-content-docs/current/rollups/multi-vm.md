---
slug: /rollups/multi-vm
title: 멀티 VM (크로스 VM 호출)
sidebar_label: 멀티 VM
sidebar_position: 8
---

# 멀티 VM (크로스 VM 호출)

멀티 VM 롤업은 전용 **크로스 VM 프리컴파일**을 통해 CosmWasm 컨트랙트를
호출할 수 있는 EVM 실행 레이어를 실행합니다. RDK는 이러한 호출을 인코딩하는
TypeScript 툴링과 시작점이 될 스캐폴드 템플릿을 함께 제공합니다.

> 이 툴링은 **EVM → CosmWasm** 만을 다룹니다. SVM은 별도의 런타임이며
> 크로스 VM 프리컴파일의 일부가 아닙니다.

## 프리컴파일

크로스 VM 프리컴파일은 고정된 주소에 노출됩니다:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## 크로스 VM 호출 인코딩

`encodeCrossVmCalldata`는 EVM 컨트랙트가 CosmWasm 컨트랙트를 호출하기 위해
프리컴파일로 보내는 calldata를 빌드합니다. `functionSelector`는 Solidity 함수
시그니처에 대한 4바이트 셀렉터를 계산합니다.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Solidity 측

EVM 컨트랙트에서는 인코딩된 calldata와 함께 프리컴파일 주소를 호출합니다.
`multivm-rollup` 템플릿에는 다음과 같은 형태의 `contracts/CrossVmCaller.sol`
스니펫이 포함되어 있습니다:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## 멀티 VM 롤업 스캐폴딩

새 템플릿 `multivm-rollup`은 `CrossVmCaller.sol` 스니펫을 포함하여 CosmWasm을
호출하도록 연결된 EVM 롤업을 스캐폴딩합니다:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

모든 스캐폴더 템플릿은 [롤업 배포하기](/rollups/deploying-a-rollup)를
참고하세요.
