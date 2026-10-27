---
slug: /sdk/guides/cosmwasm
title: QoreChain Native ガイド
sidebar_label: QoreChain Native
sidebar_position: 3
---

# QoreChain Native ガイド

QoreChain Native は、QoreChain における CosmWasm スマートコントラクトランタイムの呼称です。そのため、このページに記載されている CosmWasm のライブラリとクライアントパッケージが、これと併用するものになります。

TypeScript コア（`@qorechain/sdk`）には、QoreChain Native コントラクトのクエリと実行のための、
`@cosmjs/cosmwasm-stargate` 上の薄く型付けされたラッパーが含まれています。読み取りには
読み取り専用クライアントを使用し、状態変更には署名クライアントを使用します。

## 読み取り専用クエリ

`createClient()` インスタンスから読み取り専用の QoreChain Native クライアントを開きます。これは
コンセンサス RPC エンドポイント経由で接続し、クライアント上でメモ化されます。

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

`createCosmWasmClient` を使って読み取りクライアントを直接構築することもできます。

## 署名: インスタンス化、実行、アップロード

:::caution アップロードとインスタンス化は許可制です
`qorechain-vladi`（メインネット）では `code_upload_access` と
`instantiate_default_permission` は `Nobody` です。さらに `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` はチェーンのサーキットブレーカーによっても
無効化されているため、一般のアカウントでは `uploadCode` と `instantiate` は拒否されます。
`qorechain-diana`（テストネット、2026年10月27日に確認）では
`code_upload_access` は `Nobody` で、無効化されているのは `MsgStoreCode` のみです。
一方 `instantiate_default_permission` は `Everybody` なので、すでに存在するコードに対する
`instantiate` はそこでは開放されています。
すでに存在するコントラクトは、クエリ（上記）と実行が可能です。現在の許可設定は
`GET /cosmwasm/wasm/v1/codes/params` で確認してください。
[QoreChain Native 開発](/developer-guide/cosmwasm-development) を参照してください。
:::

:::caution QoreChain Native 署名クライアントは従来方式で署名します
`connectCosmWasmSigner` は CosmJS の署名クライアントをラップしており、これは従来方式の
secp256k1 署名のみを付加します。稼働中のネットワークでは、Native 経路のすべての
トランザクションにハイブリッド（secp256k1 + ML-DSA-87）署名が必要なため、これを通じて
送信したトランザクションはそこで拒否されます。ハイブリッド拡張を要求しないノード
（ローカルの開発ノード）に対しては動作します。稼働中のネットワークで `execute` を行うには、
メッセージを構築し、`signAndBroadcastHybrid` で送信してください（下記のサンプル）。
:::

従来方式の署名を受け付けるノードに対して状態変更を行うには、`connectCosmWasmSigner` で署名
クライアントを接続し（これはオフライン署名者を受け取ります。`directSignerFromPrivateKey` が
生成するものと同種です）、その後に型付きのラッパーを使用します。結果の型を指定しない限り、
ヘルパーは `Promise<unknown>` を返します。

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

正確な引数の形は `@cosmjs/cosmwasm-stargate` に従います。SDK は型付きの
`ContractMsg`、`FeeInput`、`InstantiateOpts`、`CosmWasmReadClient`、
`CosmWasmSigningClient` の各型を追加します。

### 稼働中のネットワークでの実行（ハイブリッド）

QoreChain Native のメッセージ型をレジストリに追加し、ハイブリッドビルダー経由で
`MsgExecuteContract` を送信します。アカウントの ML-DSA-87 鍵を事前に登録しておく必要があります
（[Quantum-safe](/sdk/guides/quantum-safe) を参照）。次のインストールが必要です:
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`

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

実行可能な読み取りサンプルについては、`cosmwasm-query` の [サンプル](/sdk/examples) を参照してください。
