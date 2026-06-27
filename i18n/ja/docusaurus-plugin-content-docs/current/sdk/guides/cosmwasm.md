---
slug: /sdk/guides/cosmwasm
title: CosmWasm ガイド
sidebar_label: CosmWasm
sidebar_position: 3
---

# CosmWasm ガイド

TypeScript コア（`@qorechain/sdk`）には、CosmWasm コントラクトのクエリと実行のための、
`@cosmjs/cosmwasm-stargate` 上の薄く型付けされたラッパーが含まれています。読み取りには
読み取り専用クライアントを使用し、状態変更には署名クライアントを使用します。

## 読み取り専用クエリ

`createClient()` インスタンスから読み取り専用の CosmWasm クライアントを開きます。これは
コンセンサス RPC エンドポイント経由で接続し、クライアント上でメモ化されます。

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

`createCosmWasmClient` を使って読み取りクライアントを直接構築することもできます。

## 署名: インスタンス化、実行、アップロード

状態変更には、`connectCosmWasmSigner` で署名クライアントを接続し（これはオフライン署名者を
受け取ります。`directSignerFromPrivateKey` が生成するものと同種です）、その後に型付きの
ラッパーを使用します。

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

正確な引数の形は `@cosmjs/cosmwasm-stargate` に従います。SDK は型付きの
`ContractMsg`、`FeeInput`、`InstantiateOpts`、`CosmWasmReadClient`、
`CosmWasmSigningClient` の各型を追加します。

実行可能な読み取りサンプルについては、`cosmwasm-query` の [サンプル](/sdk/examples) を参照してください。
