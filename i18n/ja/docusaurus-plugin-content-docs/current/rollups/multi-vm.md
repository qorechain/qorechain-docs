---
slug: /rollups/multi-vm
title: マルチVM（クロスVM呼び出し）
sidebar_label: マルチVM
sidebar_position: 8
---

# マルチVM（クロスVM呼び出し）

RDK には、EVM コントラクトから、アドレス `0x0000000000000000000000000000000000000901` の **クロスVMプリコンパイル** への呼び出しをエンコードする TypeScript ヘルパーが含まれています。このプリコンパイルは、**QoreChain Native**（Wasm）ランタイム上の QoreChain Native コントラクトへ呼び出しをルーティングするよう設計されています。また、これらを配線する `multivm-rollup` スキャフォールドテンプレートも付属しています。このツールは **EVM → QoreChain Native** のみを対象とします。SVM は別個のランタイムであり、プリコンパイルには含まれません。

:::caution 稼働中のネットワークではまだ使用できません
クロスVMプリコンパイルは、**メインネットでは有効化されていません**。EVM モジュールの有効な静的プリコンパイルの一覧は、そこでは空です（2026年11月4日に確認）。テストネットでは、2026年10月27日に確認した時点で一覧は `0x…0A01`、`0x…0A02`、`0x…0C01` のみで、11月4日からは `0x…0901` も含まれており、2026年11月7日に再度読み取った時点でも 4 つすべてが一覧に載っています（[チェーン v3.2.5](#chain-v325) の前の注記を参照）。2026年11月7日、テストネットがチェーン v3.2.7 を適用した後に、テストネットの `0x…0901` に対する読み取り専用の `eth_call` をテストしました。許可リストにあるターゲットはそのコントラクトに到達し、リスト外のターゲットは拒否されました（[テストネットでのテスト結果](#tested-testnet)を参照）。メインネットでは `0x…0901` に対する `eth_getCode` は `0x` を返し、それへの呼び出しは空のデータで成功して何も実行しません（2026年11月4日、それへの `eth_call` は空のデータを返しました）。QoreChain Native コントラクトのアップロードも両ネットワークで閉じられており、SVM のトランザクションレーンはネットワーク全体で無効になっています。メインネットでは、プリコンパイルが有効化され、QoreChain Native のアップロードが再開されるまで、呼び出す対象はありません。テストネットではプリコンパイルは許可リスト付きで有効であり、`eth_call` でテストされました。このページは準備のためにツールを説明するものです。本番のフローをこれに基づいて構築しないでください。[EVM プリコンパイル：ネットワークステータス](/developer-guide/evm-precompiles#network-status)を参照してください。
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

`@qorechain/rdk` 0.6.0 以降（現行は 0.8.0）の `encodeCrossVmCalldata` は、同じコールデータを代わりに構築します:

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

:::note 2026年10月30日以降のテストネットの変更
2026年11月4日、テストネットの有効なプリコンパイルの一覧（EVM パラメータの `active_static_precompiles`）には `0x…0901` も含まれており、テストネットの `GET /qorechain/crossvm/v1/params` は `bridge_allowed_targets` に 3 つの CosmWasm ターゲットを挙げていました。メインネットはその日変わっていませんでした。有効な一覧は空、許可リストも空で、`eth_call` による `0x…0901` への呼び出しは空のデータを返しました。テストネットの一覧は 2026年11月7日に再度読み取られ、引き続き `0x…0901` を含んでいます。以下の、プリコンパイルや許可リストがテストネットで無効または空であるとする記述は、2026年10月27日から30日の状態を表しています。テストネットの現在の動作は[テストネットでのテスト結果](#tested-testnet)にあります。
:::

### チェーン v3.2.5: 許可リスト、応答形式、拒否（両ネットワーク） {#chain-v325}

チェーン v3.2.5 は、ブリッジの動作を変更します。メインネットは 2026年10月29日（ガバナンス提案 14、高さ 3,906,833）から、テストネットは 10月26日からこれを実行しており、現在、メインネットは v3.2.6、テストネットは v3.2.7 で稼働しています。このプリコンパイルはメインネットでは有効化されていないため、以下の応答形式はこのリリースの動作であり、そこで実際に検証されたものではありません。拒否形式は 2026年11月7日にテストネットで確認されました（[テストネットでのテスト結果](#tested-testnet)を参照）。このページでプリコンパイルがターゲットの生の応答を返すと記載している箇所は、v3.2.5 より前のリリースについての説明です。

* **許可リストのルート。** `GET /qorechain/crossvm/v1/params` は、ターゲットの許可リストを含むブリッジのパラメータを返します。メインネットでは許可リストは空であり（2026年11月4日に確認）、現時点で許可されているターゲットはありません。テストネットでは10月30日の時点で空でした（上の注記を参照）。
* **固定の応答形式。** プリコンパイルは `abi.encode(bytes)` を返すため、応答は常に 64 バイト以上になり、空の応答と応答なしを区別できます。`abi.decode(ret, (bytes))` でデコードしてください。
* **拒否には理由が付きます。** ブリッジが呼び出しを拒否すると、`Error(string)` でリバートします。コントラクトはこれを読み取って、そのまま伝えることができます。
* **テストネットでは有効、メインネットでは有効ではありません。** `0x...0901` はメインネットの有効なプリコンパイルの一覧には含まれていません。テストネットの一覧には含まれています（2026年11月7日に確認）。拒否と許可リストの動作はその日にそこでテストされました。メインネットは、v3.2.7 へのアップグレード後も、別のガバナンス判断があるまでクロス VM 呼び出しをオフのままにします。

### テストネットでのテスト結果 {#tested-testnet}

テストネットは、2026年11月6日からチェーン v3.2.7（高さ 9,594,600）で稼働しています。2026年11月7日、`executeCrossVMCall(uint8,string,bytes)` のコールデータ（ターゲット VM `1`、ペイロード `{}`）を付けて、`0x…0901` に 2 件の読み取り専用 `eth_call` リクエストを送信しました。

| ターゲット | 結果 |
|---|---|
| `bridge_allowed_targets` にない CosmWasm アドレス | `cross-VM bridge call refused: target cosmwasm:<address> is not allowlisted` でリバートしました |
| `bridge_allowed_targets` にある CosmWasm コントラクト | 呼び出しはコントラクトに到達し、コントラクトは空のペイロードを拒否したため（`Error parsing into type cw20::msg::Cw20ExecuteMsg`）、ブリッジはそれを配信しました。コントラクトが受け付けるメッセージは送信していません |

これは、許可リストとリバート理由を示すものです。`eth_call` は何も変更せず、ペイロードも意図的に有効なメッセージではなかったため、状態を変更する呼び出しが成功したことを示すものではありません。プリコンパイルは 3 つの引数を取り、0.5.0 以前の 2 引数形式はこれに到達しません。メインネットにはこの動作はありません。そこではプリコンパイルはオフです。

`@qorechain/rdk` 0.7.0 以降には、これらのためのヘルパーがあります（Solidity が生成したエンコーディングに対して確認済み）: `getCrossVmParams`（許可リスト）、`crossVmTargetReady`（プリコンパイルが有効で、ブリッジが有効で、ターゲットが許可リストに載っていること。そうでない場合は、阻害している理由を返します）、`decodeCrossVmResult`（`abi.decode(ret, (bytes))`）、`decodeRevertReason`（`Error(string)`）。

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

プリコンパイルはメインネットでは無効なため、そこでそれに対する単純な `.call` は**空のデータとともに成功を返し、何も行いません**。`ok` フラグは、呼び出しが効果を持ったことを示すものではありません。コントラクト内で頼れるガードは、常に空でない確認応答を返すターゲットを用意し、呼び出しの後に `require(ret.length > 0)` を置いて、空の応答を失敗として扱うことです。`multivm-rollup` テンプレートはこれを行っています（0.6.0 以降）。

## マルチVMロールアップのスキャフォールド

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

`multivm-rollup` テンプレートには、`src/crossvm-call.ts`（プリコンパイルが稼働しているかを確認し、その後コールデータを出力します）と、`executeCrossVMCall(uint8,string,bytes)` を呼び出してターゲットから空でない応答を要求する `contracts/CrossVmCaller.sol` が含まれています。0.7.0 からは、このコントラクトは `abi.encode(bytes)` の結果をデコードし、稼働中のプリコンパイルが返す 64 バイトの最小長を要求し、チェーンの拒否理由をそのまま伝えます。プリコンパイルが無効な間は、呼び出しを機能させるものではありません。すべてのスキャフォールダーテンプレートについては [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
