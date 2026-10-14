---
slug: /rollups/multi-vm
title: マルチVM（クロスVM呼び出し）
sidebar_label: マルチVM
sidebar_position: 8
---

# マルチVM（クロスVM呼び出し）

RDK には、EVM コントラクトから、アドレス `0x0000000000000000000000000000000000000901` の **クロスVMプリコンパイル** への呼び出しをエンコードする TypeScript ヘルパーが含まれています。このプリコンパイルは、**QoreChain Native**（Wasm）ランタイム上の CosmWasm コントラクトへ呼び出しをルーティングするよう設計されています。また、これらを配線する `multivm-rollup` スキャフォールドテンプレートも付属しています。このツールは **EVM → QoreChain Native** のみを対象とします。SVM は別個のランタイムであり、プリコンパイルには含まれません。

:::caution 稼働中のネットワークではまだ使用できません
クロスVMプリコンパイルは、どちらのネットワークでも**有効化されていません**。EVM モジュールの有効な静的プリコンパイルの一覧は、メインネットとテストネットの両方で空であるため、`0x…0901` への呼び出しは空のデータを返し、何も実行しません。CosmWasm コントラクトのアップロードも両ネットワークで閉じられており、SVM のトランザクションレーンはネットワーク全体で無効になっています。プリコンパイルが有効化され、CosmWasm のアップロードが再開されるまで、呼び出す対象はありません。このページは準備のためにツールを説明するものです。本番のフローをこれに基づいて構築しないでください。[EVM プリコンパイル：ネットワークステータス](/developer-guide/evm-precompiles#network-status)を参照してください。
:::

:::note
RDK v0.4.2 以降、Wasm ランタイムの VM オプション識別子は **`native`**（QoreChain Native）です。`cosmwasm` は引き続き受け入れられるレガシーエイリアスで、どちらもワイヤ上では `cosmwasm` にマッピングされます。プリコンパイルの ABI 関数は `executeCrossVMCall(string,bytes)` です。
:::

## プリコンパイルのアドレス

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## クロスVM呼び出しのエンコード

`encodeCrossVmCalldata` は `executeCrossVMCall(string contract, bytes msg)` 用のコールデータを構築します。`msg` は、コントラクトの execute メッセージで、UTF-8 の JSON 文字列または生のバイト列です。

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## Solidity 側

EVM コントラクトからは、エンコードされた呼び出しを使ってプリコンパイルアドレスを呼び出します:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

プリコンパイルは無効なため、それに対する単純な `.call` は空のデータとともに成功を返します。現時点でこれをテストする場合は、`ok` フラグだけに頼らず、返されたデータの長さを確認してください。

## マルチVMロールアップのスキャフォールド

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

このテンプレートには、出発点となる `contracts/CrossVmCaller.sol` が含まれています。これに依存する前に、上記の ABI と比較してください。すべてのスキャフォールダーテンプレートについては [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
