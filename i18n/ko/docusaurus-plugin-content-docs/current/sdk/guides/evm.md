---
slug: /sdk/guides/evm
title: EVM 가이드
sidebar_label: EVM
sidebar_position: 1
---

# EVM 가이드

`@qorechain/evm`은 QoreChain EVM 엔진을 위한 [viem](https://viem.sh) 위에 얇게 얹은
타입 안전 어댑터입니다. EVM 클라이언트를 다시 구현하지는 않으며, viem이 피어
의존성입니다. 이 패키지는 체인을 인식하는 클라이언트 팩토리(EVM chain-id
자동 감지 포함), ERC-20 헬퍼, 컨트랙트 배포/호출 래퍼, 그리고 QoreChain EVM
프리컴파일을 위한 타입드 바인딩을 추가합니다.

```bash
npm i @qorechain/evm viem
```

## 클라이언트 생성

`createEvmClient`는 viem을 기반으로 하는 클라이언트 번들을 반환합니다. `chainId`를
전달하지 않으면 `eth_chainId`를 통해 EVM chain id를 자동으로 감지합니다.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

`rpcUrl`을 직접 전달할 수도 있고(`endpoints`와 상호 배타적), WebSocket용
`wsUrl` / `endpoints.evmWs`, 명시적인 `chainId`, 그리고 `decimals`
(기본값 18, QOR의 EVM 관례이며 Cosmos `uqor`의 10^6 기준 단위와는 구분됨)를
전달할 수 있습니다.

개인 키에서 EVM 서명 계정을 파생합니다:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20 헬퍼

`erc20` 네임스페이스(및 개별 함수)는 표준 ERC-20 호출을 래핑합니다.
읽기는 viem 퍼블릭 클라이언트를 받고, 쓰기는 월렛 클라이언트를 받습니다.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

viem을 직접 호출하는 편을 선호한다면 원시 ABI가 `ERC20_ABI`로 내보내집니다.

## 컨트랙트

범용 배포 및 호출 래퍼:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## 프리컴파일

QoreChain은 고정된 주소에서 컨트랙트로 호출 가능한 프리컴파일을 제공합니다.
`precompiles` 네임스페이스가 타입드 바인딩을 제공하며, 주소와 ABI도
내보내집니다.

| 프리컴파일 | 함수 | 주소 |
| --- | --- | --- |
| Cross-VM Bridge | (브리지 라우팅) | `0x0000000000000000000000000000000000000901` |
| PQC verify | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| PQC key status | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| QCAI risk score | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| QCAI anomaly check | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Consensus params | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read live consensus parameters.
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers.
const score = await precompiles.aiRiskScore(client.publicClient, /* args */);
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, /* args */);

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

프리컴파일 ABI는 `IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`로
내보내집니다.

> QoreChain 프리컴파일이 없는 노드에서는 이러한 호출이 "feature not
> present" 오류를 던집니다. 이기종 노드를 대상으로 한다면 호출별로 이를
> 처리하세요.

실행 가능한 버전은 `evm-precompile` [예제](/sdk/examples)를 참고하세요.
