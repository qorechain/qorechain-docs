---
slug: /rollups/watchtower
title: ウォッチタワー
sidebar_label: ウォッチタワー
sidebar_position: 9
---

# ウォッチタワー

ウォッチタワーは、オプティミスティックロールアップ向けの自動チャレンジャーフレームワークです。ロールアップの決済バッチを追跡し、新しいバッチとそのチャレンジウィンドウの期限を通知します。そして、**あなたの**有効性述語（validity predicate）がバッチを拒否したときには、それをあなたの `onInvalid` コールバックに引き渡すので、チャレンジを組み込むことができます。

フレームワークは監視と*いつ*行うかの判断を担い、**有効性チェックはあなたが提供します**。ウォッチタワーは、バッチが不正であると自ら判断することは決してありません。あなたの `validate` 関数を呼び出し、その戻り値に基づいて動作します。

:::caution 初期段階: RDK の REST ルートが必要
ウォッチタワーは RDK の REST クライアントを通じてバッチを読み取ります。`/qorechain/rdk/v1/…` の REST ルートは現時点ではメインネットで提供されていないため、ウォッチタワーはまだメインネットに対して実行できません。どちらのネットワークにもロールアップは作成されていないため、監視対象はありません。
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require. See "Signing with the published clients" in
// Deploying a Rollup — the classical-only client in @qorechain/rdk 0.4.4
// cannot get a challenge accepted.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, secondsRemaining);
  },
});

// Later:
watcher.stop();
```

フレームワークは次のものを通知します。

- `onBatch` による **新しいバッチ**、
- `onDeadline` による **チャレンジウィンドウの期限**、そして
- `onInvalid` による **無効なバッチ**（あなたの `validate` が `false` を返したもの）。

`onInvalid` をチャレンジに接続すると、ウォッチタワーは完全な自動チャレンジャーになります。未設定のままにすると、観測のみのモードで動作します。

:::note チャレンジウィンドウ
ウォッチタワーが報告する期限は、チャレンジウィンドウを 1 ブロックあたり 6 秒でブロック数に換算した値（デフォルトでは 100,800 ブロック）を使用します。そのため、メインネットの約 3.2 秒ブロックでは、実際のウィンドウは「7 日」より短くなります。チャレンジを投稿するには、ロールアップのチャレンジボンド（`nft` および `custom` プリセットでは 1,000 QOR）も必要です。
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` は、コマンドラインからフレームワークを実行し、Ctrl-C を押すまで新しいバッチとチャレンジウィンドウの期限を表示します。`qorollup` オペレーター CLI の全体については、[ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
