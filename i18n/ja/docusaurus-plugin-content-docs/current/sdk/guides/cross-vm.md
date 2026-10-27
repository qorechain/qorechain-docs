---
slug: /sdk/guides/cross-vm
title: クロス VM ガイド
sidebar_label: クロス VM
sidebar_position: 4
---

# クロス VM ガイド

QoreChain は **EVM、SVM、QoreChain Native を並行して**実行し、`x/crossvm`
モジュールによって、単一のネイティブアカウントがそのいずれのコントラクトも呼び出せます。SDK は
これらの呼び出しを構築・署名・ブロードキャストするための高レベルヘルパー `createCrossVMClient` を提供しており、
複数の呼び出しを**3 つの VM すべてにまたがる 1 つのアトミックなトランザクション**にまとめることもできます。
さらに、メッセージの状態を追跡するための型付き読み取りヘルパーもあります。*EVM 内部から*
開始される EVM→ネイティブのルーティングは、引き続き `@qorechain/evm` の**クロス VM ブリッジ
プリコンパイル**を介してオンチェーンで実行されます。

:::caution 現時点で動作するもの
クロス VM 呼び出しは、対象レーンが利用可能な範囲でのみ利用できます:

- `MsgCrossVMCall` は **メインネット**ではチェーンのサーキットブレーカーによって無効化されています
  （`GET /cosmos/circuit/v1/disable_list` に `/qorechain.crossvm.v1.MsgCrossVMCall` が列挙されています）。
  テストネットでは有効です。
- SVM のトランザクションレーンはネットワーク全体で無効化されており、QoreChain Native のアップロードと
  インスタンス化は許可制です（メインネットにはコントラクトがありません）。また、EVM
  ブリッジプリコンパイルは有効ではありません（
  [EVM プリコンパイル](/developer-guide/evm-precompiles#network-status)を参照）。
- 以下の型付き REST 読み取りヘルパーは、公開ゲートウェイが提供していないルートを呼び出します。
  代わりに `connectQueryClients(rpc).crossvm` でメッセージを読み取ってください。
- すべての Native パスのトランザクションと同様に、クロス VM 呼び出しもハイブリッド署名を
  持たなければなりません。署名用クライアントをアカウントの鍵ペアと接続すると
  （`client.connectTx(signer, { pqcKeypair })`、SDK 0.9.0 以降）、クロス VM クライアントが
  ハイブリッドで署名します（[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#hybrid-signing)を参照）。
  0.9.0 より前のリリースは古典署名で署名するため、公開ネットワークはこれを拒否します。
:::

## 統合されたクロス VM 呼び出し

`createCrossVMClient` は `MsgCrossVMCall`（型 URL
`/qorechain.crossvm.v1.MsgCrossVMCall`）をラップするため、`{ typeUrl,
value }` を手作業で組み立てたり、ペイロードを自分でエンコードしたりする必要はありません。クライアントの送信者は、接続された
`TxClient` のアドレスです。`sourceVm` のデフォルトは `"evm"` です。

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

`VMType` は `"evm" | "cosmwasm" | "svm"` のいずれかです（`VM_TYPES`
配列としてもエクスポートされています）。

### VM ごとのペイロードエンコーディング

呼び出しごとに、ペイロードの形を**1 つだけ**選んでください:

| 形 | エンコーディング |
|---|---|
| `{ payload: Uint8Array \| Hex }` | 生のバイト列、変更せずにそのまま渡される |
| `{ evm: { abi, functionName, args } }` | viem の `encodeFunctionData` で ABI エンコードされる（セレクター + 引数） |
| `{ cosmwasm: object }` | `JSON.stringify` した後 UTF-8 バイト列に変換（QoreChain Native の execute-msg の慣例） |
| `{ svm: { data: Uint8Array \| Hex } }` | 生のバイト列（SVM 命令ブロブ） |

EVM パスは `viem` を遅延インポートするため、オプションのピア依存 `viem` は、
`{ evm: ... }` ペイロードを実際に使用するときにのみ必要です。

### 構築のみ（オフライン）

`buildCall` はブロードキャストせずに `EncodeObject` を返します。検査、手動でのバッチ処理、
あるいは別の場所での署名に便利です。（EVM ペイロードは
非同期で ABI エンコードされるため、それらには `call`/`callAtomic` を使うか、事前にエンコードして
`{ payload }` を渡してください。）

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## アトミックなトリプル VM トランザクション

`callAtomic` は複数の `MsgCrossVMCall` メッセージを **1 つのトランザクション
本体**にまとめ、1 つの署名のもとでアトミックに実行します。これがトリプル VM の
目玉機能です。1 つの署名で、EVM + SVM + QoreChain Native にまたがる呼び出しがすべて同時に成功するか、
まったく成功しないかのどちらかになります:

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

`getMessage` は ID でクロス VM メッセージを読み取り、型付きクエリクライアントを優先し、
`qor_getCrossVMMessage` JSON-RPC メソッド（公開エンドポイントは
提供していません）にフォールバックします。コンセンサス RPC 経由で読み取る
型付きクエリクライアントを渡してください:

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

## クロス VM メッセージの状態を読み取る

`@qorechain/sdk` は `x/crossvm` の上に型付き REST ラッパーをエクスポートしています。これらは
`/qorechain/crossvm/v1/{message/{id},pending,params}` を呼び出しますが、公開ゲートウェイは
これを**提供しておらず**（`api.qore.host` と `api-testnet.qore.host` では `Not Implemented`）、
そのため公開エンドポイントに対しては `QoreHttpError` を投げます。これらは
それらのルートを公開しているノード向けです。公開ネットワークでは、上記の `connectQueryClients` を使用してください。

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

これらは型付きの形を返します: `CrossVmMessage`、`CrossVmMessageResponse`、
`PendingCrossVmMessagesResponse`、`CrossVmParamsResponse`。

ノードが提供するようになれば、`qor_` JSON-RPC 名前空間を通じてメッセージを
読み取ることもできます:

> **まだ提供されていません:** リリース済みのノードビルドで `qor_` JSON-RPC 名前空間を提供しているものはないため、この呼び出しは現時点ですべての公開エンドポイントで `-32601`（メソッドが見つかりません）を返します。[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照してください。

```ts
const m = await client.qor.getCrossVmMessage(messageId);
```

## EVM ブリッジプリコンパイル

EVM→ネイティブのルーティングは、`@qorechain/evm` で公開されている
クロス VM ブリッジプリコンパイルを介してオンチェーンで実行されます:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

> **有効ではありません。** クロス VM ブリッジプリコンパイルはメインネットでもテストネットでも
> 有効ではなく、現在の形では有効化されません。まず再構築が進められています。
> 現時点で `0x…0901` を呼び出しても空のデータが返るだけで、何もルーティングされません。
> [EVM プリコンパイル: ネットワークの状況](/developer-guide/evm-precompiles#network-status)を参照してください。

有効になれば、Solidity コントラクト（または viem）がそのアドレスのプリコンパイルを呼び出して
ネイティブレイヤーへメッセージをルーティングし、上記の読み取りヘルパーでその状態を追跡します。
プリコンパイルの完全な一覧は [EVM ガイド](/sdk/guides/evm)を参照してください。
