---
slug: /sdk/guides/cross-vm
title: クロス VM ガイド
sidebar_label: クロス VM
sidebar_position: 4
---

# クロス VM ガイド

QoreChain は **EVM、SVM、CosmWasm を並行して実行**しており、`x/crossvm` モジュールにより、
1 つのネイティブアカウントがそれらのいずれのコントラクトも呼び出せます。SDK は、これらの呼び出しを
構築、署名、ブロードキャストするための高レベルな `createCrossVMClient` ヘルパーを提供します。
これには、複数の呼び出しを **3 つすべての VM にまたがる 1 つのアトミックトランザクション**に
パッキングする機能も含まれます。さらに、メッセージの状態を追跡するための型付き読み取りヘルパーも
提供します。*EVM 内部から*開始される EVM→ネイティブのルーティングは、依然として `@qorechain/evm` の
**クロス VM ブリッジプリコンパイル**を通じてオンチェーンで実行されます。

## 統合されたクロス VM 呼び出し

`createCrossVMClient` は `MsgCrossVMCall`（タイプ URL
`/qorechain.crossvm.v1.MsgCrossVMCall`）をラップするため、`{ typeUrl, value }` を手作業で構築したり、
ペイロードを自分でエンコードしたりする必要は一切ありません。クライアントの送信者は、接続された
`TxClient` のアドレスです。`sourceVm` はデフォルトで `"evm"` です。

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

`VMType` は `"evm" | "cosmwasm" | "svm"` のいずれかです（`VM_TYPES` 配列としても
エクスポートされています）。

### VM ごとのペイロードエンコーディング

呼び出しごとに、ペイロードの形を厳密に **1 つ**選んでください。

| 形 | エンコーディング |
|---|---|
| `{ payload: Uint8Array \| Hex }` | 生のバイト列、変更せずにそのまま渡される |
| `{ evm: { abi, functionName, args } }` | viem の `encodeFunctionData` で ABI エンコードされる（セレクター + 引数） |
| `{ cosmwasm: object }` | `JSON.stringify` した後 UTF-8 バイト列に変換（CosmWasm の execute-msg の慣例） |
| `{ svm: { data: Uint8Array \| Hex } }` | 生のバイト列（SVM 命令ブロブ） |

EVM のパスは `viem` を遅延インポートするため、オプションの `viem` ピアは、実際に `{ evm: ... }`
ペイロードを使用する場合にのみ必要です。

### 構築のみ（オフライン）

`buildCall` はブロードキャストせずに `EncodeObject` を返します。検査、手作業でのバッチ処理、
別の場所での署名に便利です。（EVM ペイロードは非同期に ABI エンコードされるため、それらについては
`call`/`callAtomic` を使用するか、事前にエンコードして `{ payload }` を渡してください。）

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## アトミックなトリプル VM トランザクション

`callAtomic` は複数の `MsgCrossVMCall` メッセージを **1 つのトランザクションボディ**に
パッキングするため、それらは単一の署名のもとでアトミックに実行されます。これがトリプル VM の
目玉機能です。1 つの署名で、EVM + SVM + CosmWasm にまたがる呼び出しが、すべて同時に成立するか、
まったく成立しないかのいずれかになります。

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

## メッセージの読み戻し

`getMessage` は ID でクロス VM メッセージを読み取り、型付きクエリクライアントを優先的に使用し、
`qor_getCrossVMMessage` JSON-RPC メソッドにフォールバックします。

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## クロス VM メッセージの状態を読み取る

`@qorechain/sdk` は `x/crossvm` 上の型付き REST ラッパーをエクスポートします。

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

これらは型付きの形を返します。`CrossVmMessage`、`CrossVmMessageResponse`、
`PendingCrossVmMessagesResponse`、`CrossVmParamsResponse` です。

`qor_` JSON-RPC 名前空間を通じてメッセージを読み取ることもできます。

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## EVM ブリッジプリコンパイル

EVM→ネイティブのルーティングは、`@qorechain/evm` で公開されているクロス VM ブリッジ
プリコンパイルを通じてオンチェーンで実行されます。

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

そのアドレスにある Solidity コントラクトから（または viem 経由で）プリコンパイルを呼び出して
メッセージをネイティブレイヤーにルーティングし、その後、上記の読み取りヘルパーでその状態を
追跡してください。完全なプリコンパイル一覧については [EVM ガイド](/sdk/guides/evm) を
参照してください。
