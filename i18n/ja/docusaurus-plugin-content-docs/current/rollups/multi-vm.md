---
slug: /rollups/multi-vm
title: マルチVM（クロスVM呼び出し）
sidebar_label: マルチVM
sidebar_position: 8
---

# マルチVM（クロスVM呼び出し）

マルチVMロールアップは、専用の **クロスVMプリコンパイル** を介して CosmWasm
コントラクトを呼び出せる EVM 実行レイヤーを実行します。RDK には、これらの呼び出しを
エンコードする TypeScript ツールと、出発点となるスキャフォールドテンプレートが付属しています。

> このツールは **EVM → CosmWasm** のみを対象とします。SVM は別個のランタイムであり、
> クロスVMプリコンパイルには含まれません。

## プリコンパイル

クロスVMプリコンパイルは固定アドレスで公開されています:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## クロスVM呼び出しのエンコード

`encodeCrossVmCalldata` は、EVM コントラクトが CosmWasm コントラクトを呼び出すために
プリコンパイルへ送信するコールデータを構築します。`functionSelector` は Solidity の
関数シグネチャに対する 4 バイトのセレクタを計算します。

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Solidity 側

EVM コントラクトからは、エンコードされたコールデータを使ってプリコンパイルアドレスを
呼び出します。`multivm-rollup` テンプレートには、次のような `contracts/CrossVmCaller.sol`
スニペットが含まれています:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## マルチVMロールアップのスキャフォールド

新しいテンプレート `multivm-rollup` は、`CrossVmCaller.sol` スニペットを含め、CosmWasm を
呼び出すように配線された EVM ロールアップをスキャフォールドします:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

すべてのスキャフォールダーテンプレートについては
[ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
