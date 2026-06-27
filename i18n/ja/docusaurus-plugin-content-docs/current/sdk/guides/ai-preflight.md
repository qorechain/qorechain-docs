---
slug: /sdk/guides/ai-preflight
title: AI プリフライトガイド
sidebar_label: AI プリフライト
sidebar_position: 5
---

# AI プリフライトガイド

QoreChain は、**オンチェーンの AI リスク/異常検知モデル**を任意の dApp に公開した初めての
ネットワークです。2 つの読み取り専用 EVM プリコンパイルにより、`eth_call` だけを使って、
トランザクションが署名またはブロードキャストされる*前*にスコアリングできます。

| 機能 | プリコンパイル | アドレス |
|---|---|---|
| calldata のリスクスコア | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| `(sender, amount)` の異常チェック | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

実装は `@qorechain/evm`（[viem](https://viem.sh) 上の EVM アダプター）にあり、検出を容易にするため
`@qorechain/sdk` から再エクスポートされています。

> リスクの `level` は、よりリスクの高いトランザクションほど高くなります。チェーンのサンプルポリシーでは
> `require(level < 3)` を使用しています。

## ワンコールのプリフライト

`simulateWithRiskScore` は、ガス見積もり、リスクスコア、異常チェックを 1 つのアドバイザリ判定に
まとめます。

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

const preflight = await simulateWithRiskScore(publicClient, {
  from: "0xYourAddress",
  to: "0xToken",
  data: "0xa9059cbb...", // ERC-20 transfer calldata
  value: 0n,
});

console.log(preflight.gas);     // bigint — eth_estimateGas
console.log(preflight.risk);    // { score: bigint, level: number }
console.log(preflight.anomaly); // { anomalyScore: bigint, flagged: boolean }
console.log(preflight.safe);    // boolean — advisory verdict
```

`safe` は `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged` として計算され、
しきい値はデフォルトで `3` です。`data` が指定されていない場合、リスクスコアは `to` にデプロイされた
バイトコードに対して計算されるため、コントラクトへの単純な value 送金もスコアリングされます。

> **`safe` フラグはアドバイザリです。** プリコンパイル自体は何もブロックしません。独自のポリシーを
> オフチェーンで設定して適用してください（また、コントラクトはオンチェーンで level に対して
> `require` できます）。`RISK_LEVEL_UNSAFE_THRESHOLD` はエクスポートされているため、SDK が文書化している
> のと同じデフォルト値を参照できます。

## 構成要素

```ts
import { aiRiskScore, aiAnomalyCheck } from "@qorechain/evm";

// Risk score for raw calldata (accepts a 0x-hex string or a Uint8Array).
const { score, level } = await aiRiskScore(publicClient, "0xa9059cbb...");

// Anomaly check for a (sender, amount) pair.
const { anomalyScore, flagged } = await aiAnomalyCheck(
  publicClient,
  "0xYourAddress",
  1_000_000_000_000_000_000n, // 1 QOR in wei
);
```

どちらも viem の `encodeFunctionData` で呼び出しをエンコードし、`decodeFunctionResult` で
返されたタプルをデコードします。

## アドレス定数

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## 利用可能性

AI プリコンパイルは QoreChain ネットワークのノード上に存在します。通常の EVM ノードでは、
これらの呼び出しは「not available」エラーをスローします。これらのヘルパーのいずれかから
スローされたエラーは、「このノードに機能が存在しない」とみなしてください。

完全なプリコンパイル一覧については [EVM ガイド](/sdk/guides/evm) を、実行可能なサンプルについては
[`ai-preflight` サンプル](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight) を
参照してください。
