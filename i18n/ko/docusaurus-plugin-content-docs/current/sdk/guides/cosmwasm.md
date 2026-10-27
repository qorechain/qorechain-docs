---
slug: /sdk/guides/cosmwasm
title: QoreChain Native 가이드
sidebar_label: QoreChain Native
sidebar_position: 3
---

# QoreChain Native 가이드

QoreChain Native는 QoreChain이 자체 CosmWasm 스마트 컨트랙트 런타임을 부르는 이름이므로, 이 페이지에 나오는 CosmWasm 라이브러리와 클라이언트 패키지가 이 런타임에서 사용하는 것들입니다.

TypeScript 코어(`@qorechain/sdk`)에는 QoreChain Native 컨트랙트를 쿼리하고 실행하기 위한,
`@cosmjs/cosmwasm-stargate` 위의 얇고 타입이 지정된 래퍼가 포함되어 있습니다. 읽기에는
읽기 전용 클라이언트를 사용하고, 상태 변경에는 서명 클라이언트를 사용합니다.

## 읽기 전용 쿼리

`createClient()` 인스턴스에서 읽기 전용 QoreChain Native 클라이언트를 엽니다 — 이는 합의 RPC
엔드포인트를 통해 연결되며 클라이언트에 메모이즈됩니다.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc-testnet.qore.host" }, // mainnet: https://rpc.qore.host
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

`createCosmWasmClient`로 읽기 클라이언트를 직접 구성할 수도 있습니다.

## 서명: 인스턴스화, 실행, 업로드

:::caution 업로드와 인스턴스화는 권한이 필요합니다
`qorechain-vladi`(메인넷)에서는 `code_upload_access`와
`instantiate_default_permission`이 `Nobody`로 설정되어 있으며, `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2`도 체인의 서킷 브레이커에 의해
꺼져 있으므로, 일반 계정의 `uploadCode`와 `instantiate`는 거부됩니다.
`qorechain-diana`(테스트넷, 2026년 10월 27일 확인)에서는
`code_upload_access`가 `Nobody`이고 `MsgStoreCode`만 꺼져 있으며,
`instantiate_default_permission`은 `Everybody`이므로 이미 존재하는 코드에 대해서는
`instantiate`가 열려 있습니다. 이미 존재하는
컨트랙트는 쿼리(위 참고)하고 실행할 수 있습니다. 현재 권한은
`GET /cosmwasm/wasm/v1/codes/params`에서 확인하세요.
[QoreChain Native 개발](/developer-guide/cosmwasm-development)을 참고하세요.
:::

:::caution QoreChain Native 서명 클라이언트는 클래식 방식으로 서명합니다
`connectCosmWasmSigner`는 CosmJS 서명 클라이언트를 감싸며, 이는 클래식 secp256k1
서명만 첨부합니다. 라이브 네트워크는 모든 Native 경로 트랜잭션에 하이브리드
(secp256k1 + ML-DSA-87) 서명을 요구하므로, 이를 통해 전송한 트랜잭션은 거기서
거부됩니다. 하이브리드 확장을 요구하지 않는 노드(로컬 개발 노드)에서는 동작합니다.
라이브 네트워크에서 `execute`를 수행하려면 메시지를 구성하여
`signAndBroadcastHybrid`로 전송하세요(아래 샘플 참고).
:::

클래식 서명을 허용하는 노드에 대한 상태 변경의 경우, `connectCosmWasmSigner`로 서명
클라이언트를 연결한 다음(`directSignerFromPrivateKey`가 생성하는 것과 동일한 종류의
오프라인 서명자를 받습니다), 타입이 지정된 래퍼를 사용하세요. 결과 타입을 지정하지
않으면 헬퍼는 `Promise<unknown>`을 반환합니다:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode<{ codeId: number }>(
  signingCw, sender, wasmBytes, "auto",
);

// Instantiate a contract from a code id (the last argument is InstantiateOpts).
const { contractAddress } = await instantiate<{ contractAddress: string }>(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  { fee: "auto" },
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  "auto",
);
```

정확한 인자 형태는 `@cosmjs/cosmwasm-stargate`를 따릅니다. SDK는 타입이 지정된
`ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient`,
`CosmWasmSigningClient` 타입을 추가합니다.

### 라이브 네트워크에서 실행하기 (하이브리드)

QoreChain Native 메시지 타입을 레지스트리에 추가하고 `MsgExecuteContract`를 하이브리드
빌더를 통해 전송합니다. 계정의 ML-DSA-87 키가 먼저 등록되어 있어야 합니다
([하이브리드 서명](/sdk/guides/quantum-safe) 참고).
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`가
필요합니다:

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  qorechainRegistryTypes,
  signAndBroadcastHybrid,
  derivePqcCanonical,
} from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(sender);

const result = await signAndBroadcastHybrid({
  registry,
  signer,                                            // from directSignerFromPrivateKey
  pqcKeypair: derivePqcCanonical(sender, mnemonic),  // the key registered on-chain
  messages: [
    {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender,
        contract: contractAddress,
        msg: new TextEncoder().encode(JSON.stringify({ /* execute msg */ })),
        funds: [],
      }),
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

실행 가능한 읽기 예제는 `cosmwasm-query` [예제](/sdk/examples)를 참고하세요.
