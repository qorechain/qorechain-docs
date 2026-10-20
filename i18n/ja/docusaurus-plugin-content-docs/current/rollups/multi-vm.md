---
slug: /rollups/multi-vm
title: マルチVM（クロスVM呼び出し）
sidebar_label: マルチVM
sidebar_position: 8
---

# マルチVM（クロスVM呼び出し）

RDK には、EVM コントラクトから、アドレス `0x0000000000000000000000000000000000000901` の **クロスVMプリコンパイル** への呼び出しをエンコードする TypeScript ヘルパーが含まれています。このプリコンパイルは、**QoreChain Native**（Wasm）ランタイム上の CosmWasm コントラクトへ呼び出しをルーティングするよう設計されています。また、これらを配線する `multivm-rollup` スキャフォールドテンプレートも付属しています。このツールは **EVM → QoreChain Native** のみを対象とします。SVM は別個のランタイムであり、プリコンパイルには含まれません。

:::caution 稼働中のネットワークではまだ使用できません
クロスVMプリコンパイルは、どちらのネットワークでも**有効化されていません**。EVM モジュールの有効な静的プリコンパイルの一覧は、メインネットとテストネットの両方で空であり、`0x…0901` に対する `eth_getCode` は `0x` を返し、それへの呼び出しは空のデータで成功して何も実行しません。CosmWasm コントラクトのアップロードも両ネットワークで閉じられており、SVM のトランザクションレーンはネットワーク全体で無効になっています。プリコンパイルが有効化され、CosmWasm のアップロードが再開されるまで、呼び出す対象はありません。このページは準備のためにツールを説明するものです。本番のフローをこれに基づいて構築しないでください。[EVM プリコンパイル：ネットワークステータス](/developer-guide/evm-precompiles#network-status)を参照してください。
:::

:::caution 0.5.0 のエンコーダーはチェーンのレイアウトと一致しません
`@qorechain/rdk` 0.5.0 の `encodeCrossVmCalldata`（および `multivm-rollup` テンプレートの `CrossVmCaller.sol` スターター）は、関数 `executeCrossVMCall(string,bytes)` を使用します。ノードがデコードするのは `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` です（4 バイトのセレクターに続いて ABI エンコードされた引数が並びます。`targetVM` の 1 は CosmWasm で、サポートされる唯一のターゲットです）。また、有効化の前に ABI が変更される可能性もあります。そのため、プリコンパイルが存在するようになっても、ヘルパーが生成するコールデータはノード上でデコードされません。以下のセクションではノードのレイアウトを示します。
:::

:::note
RDK v0.4.2 以降、Wasm ランタイムの VM オプション識別子は **`native`**（QoreChain Native）です。`cosmwasm` は引き続き受け入れられるレガシーエイリアスで、どちらもワイヤ上では `cosmwasm` にマッピングされます。
:::

## プリコンパイルのアドレス

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## クロスVM呼び出しのエンコード

ノードのレイアウトを直接エンコードします。`payload` は、コントラクトの execute メッセージを UTF-8 の JSON バイト列にしたものです（viem を使用した例）:

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

`@qorechain/rdk` の `encodeCrossVmCalldata({ contract, msg })` は代わりに `(string,bytes)` 形式を構築しますが、ノードはこれを読み取りません（上記の注意を参照）。

## Solidity 側

EVM コントラクトからは、エンコードされた呼び出しを使ってプリコンパイルアドレスを呼び出します:

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

プリコンパイルは無効なため、それに対する単純な `.call` は**空のデータとともに成功を返し、何も行いません**。`ok` フラグは、呼び出しが効果を持ったことを示すものではありません。現時点でこれをテストする場合は、対象コントラクトへの効果を確認してください。

## マルチVMロールアップのスキャフォールド

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

このテンプレートには、出発点となる `contracts/CrossVmCaller.sol` が含まれています。これに依存する前に、上記のノードのレイアウトと比較してください。すべてのスキャフォールダーテンプレートについては [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
