---
slug: /rollups/watchtower
title: ウォッチタワー
sidebar_label: ウォッチタワー
sidebar_position: 9
---

# ウォッチタワー

ウォッチタワーは、オプティミスティックロールアップ向けの自動チャレンジャーフレームワークです。ロールアップの決済バッチを追跡し、新しいバッチとそのチャレンジウィンドウの期限をそれぞれ表面化します。そして、**あなたの**有効性述語がバッチを拒否したときには、それをあなたの `onInvalid` コールバックに引き渡すので、チャレンジを組み込むことができます。

フレームワークは監視と*いつ*行うかの判断を担います。**有効性チェックはあなたが提供します**。ウォッチタワーは、バッチが不正であると自ら判断することは決してありません。あなたの `validate` 関数を呼び出し、その戻り値に基づいて動作します。

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example", // needed to broadcast a challenge
  },
});

const watcher = watchBatches(rdk, "my-roll", {
  onBatch: (batch) => {
    console.log("new batch", batch.index);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async (batch) => {
    await challengeBatch(rdk, "my-roll", batch.index /* + your fraud proof */);
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: (batch) => {
    console.warn("challenge window closing for batch", batch.index);
  },
});

// Later:
watcher.stop();
```

フレームワークは次のものを表面化します。

- `onBatch` による **新しいバッチ**、
- `onDeadline` による **チャレンジウィンドウの期限**、そして
- `onInvalid` による **無効なバッチ**（あなたの `validate` が `false` を返したもの）。

`onInvalid` を `challengeBatch` に接続すると、ウォッチタワーは完全な自動チャレンジャーになります。未設定のままにすると、観測のみのモードで動作します。

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower` は、コマンドラインからフレームワークを実行し、Ctrl-C を押すまで新しいバッチとチャレンジウィンドウの期限を表示します。`qorollup` オペレーター CLI の全体については、[ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
