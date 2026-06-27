---
slug: /sdk/guides/cosmwasm
title: CosmWasm 가이드
sidebar_label: CosmWasm
sidebar_position: 3
---

# CosmWasm 가이드

TypeScript 코어(`@qorechain/sdk`)에는 CosmWasm 컨트랙트를 쿼리하고 실행하기 위한,
`@cosmjs/cosmwasm-stargate` 위의 얇고 타입이 지정된 래퍼가 포함되어 있습니다. 읽기에는
읽기 전용 클라이언트를 사용하고, 상태 변경에는 서명 클라이언트를 사용합니다.

## 읽기 전용 쿼리

`createClient()` 인스턴스에서 읽기 전용 CosmWasm 클라이언트를 엽니다 — 이는 합의 RPC
엔드포인트를 통해 연결되며 클라이언트에 메모이즈됩니다.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc.testnet.example" },
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

`createCosmWasmClient`로 읽기 클라이언트를 직접 구성할 수도 있습니다.

## 서명: 인스턴스화, 실행, 업로드

상태 변경의 경우, `connectCosmWasmSigner`로 서명 클라이언트를 연결한 다음
(`directSignerFromPrivateKey`가 생성하는 것과 동일한 종류의 오프라인 서명자를 받습니다),
타입이 지정된 래퍼를 사용하세요:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode(signingCw, sender, wasmBytes, fee);

// Instantiate a contract from a code id.
const { contractAddress } = await instantiate(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  fee,
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  fee,
);
```

정확한 인자 형태는 `@cosmjs/cosmwasm-stargate`를 따릅니다. SDK는 타입이 지정된
`ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient`,
`CosmWasmSigningClient` 타입을 추가합니다.

실행 가능한 읽기 예제는 `cosmwasm-query` [예제](/sdk/examples)를 참고하세요.
