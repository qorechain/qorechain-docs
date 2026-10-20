---
slug: /rollups/multi-vm
title: マルチVM（クロスVM呼び出し）
sidebar_label: マルチVM
sidebar_position: 8
---

# マルチVM（クロスVM呼び出し）

RDK には、EVM コントラクトから、アドレス `0x0000000000000000000000000000000000000901` の **クロスVMプリコンパイル** への呼び出しをエンコードする TypeScript ヘルパーが含まれています。このプリコンパイルは、**QoreChain Native**（Wasm）ランタイム上の QoreChain Native コントラクトへ呼び出しをルーティングするよう設計されています。また、これらを配線する `multivm-rollup` スキャフォールドテンプレートも付属しています。このツールは **EVM → QoreChain Native** のみを対象とします。SVM は別個のランタイムであり、プリコンパイルには含まれません。

:::caution 稼働中のネットワークではまだ使用できません
クロスVMプリコンパイルは、どちらのネットワークでも**有効化されていません**。EVM モジュールの有効な静的プリコンパイルの一覧は、メインネットとテストネットの両方で空であり、`0x…0901` に対する `eth_getCode` は `0x` を返し、それへの呼び出しは空のデータで成功して何も実行しません。QoreChain Native コントラクトのアップロードも両ネットワークで閉じられており、SVM のトランザクションレーンはネットワーク全体で無効になっています。プリコンパイルが有効化され、QoreChain Native のアップロードが再開されるまで、呼び出す対象はありません。このページは準備のためにツールを説明するものです。本番のフローをこれに基づいて構築しないでください。[EVM プリコンパイル：ネットワークステータス](/developer-guide/evm-precompiles#network-status)を参照してください。
:::

:::note エンコーダーは 0.6.0 以降チェーンのレイアウトと一致します
**0.5.0 以前**の `@qorechain/rdk` の `encodeCrossVmCalldata`（およびそれらのリリースの `multivm-rollup` テンプレートの `CrossVmCaller.sol` スターター）は `executeCrossVMCall(string,bytes)` を使用していました。これはノードがデコードする関数とは異なる関数セレクターであるため、それらがエンコードした呼び出しは、プリコンパイルを有効化したネットワークであっても、プリコンパイルに到達できませんでした。**0.6.0** は `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`（セレクター `0x3c11078c`）をエンコードします。これはノードがデコードするものであり（4 バイトのセレクターに続いて ABI エンコードされた引数が並びます。`targetVM` の 1 は QoreChain Native で、サポートされる唯一のターゲットです）、リリースノートによれば、ヘルパーのコールデータはチェーン自身のデコーダーを往復して一致します。有効化の前に ABI が変更される可能性があります。
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
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`@qorechain/rdk` 0.6.0 の `encodeCrossVmCalldata` は、同じコールデータを代わりに構築します:

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

`isCrossVmPrecompileActive(restBase)` は REST 経由で EVM パラメータ `active_static_precompiles` を読み取り、プリコンパイルのアドレスが一覧に含まれている場合にのみ `active: true` と答えます。これが唯一の信頼できる確認方法であり、オフチェーンで行う必要があります。プリコンパイルはターゲットの生の応答を返すため、空の応答では、無効なプリコンパイルと、何も返さないコントラクトへの正当な呼び出しとを区別できません。また、プリコンパイルは有効か無効かにかかわらずバイトコードを持ちません。`active: true` と報告される場合でも、パッケージのドキュメントには、チェーン v3.2.3 以降、呼び出しはガバナンスが許可リストに載せたターゲット（クロスVMパラメータ `bridge_allowed_targets`、各エントリは `<vm>:<contract>`）にのみ到達し、EVM から EVM への呼び出しは拒否されると記載されています。

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

プリコンパイルは無効なため、それに対する単純な `.call` は**空のデータとともに成功を返し、何も行いません**。`ok` フラグは、呼び出しが効果を持ったことを示すものではありません。コントラクト内で頼れるガードは、常に空でない確認応答を返すターゲットを用意し、呼び出しの後に `require(ret.length > 0)` を置いて、空の応答を失敗として扱うことです。0.6.0 の `multivm-rollup` テンプレートはこれを行っています。

## マルチVMロールアップのスキャフォールド

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

0.6.0 のテンプレートには、`src/crossvm-call.ts`（プリコンパイルが稼働しているかを確認し、その後コールデータを出力します）と、`executeCrossVMCall(uint8,string,bytes)` を呼び出してターゲットから空でない応答を要求する `contracts/CrossVmCaller.sol` が含まれています。プリコンパイルが無効な間は、呼び出しを機能させるものではありません。すべてのスキャフォールダーテンプレートについては [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
