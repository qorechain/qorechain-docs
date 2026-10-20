---
slug: /rollups/watchtower
title: ウォッチタワー
sidebar_label: ウォッチタワー
sidebar_position: 9
---

# ウォッチタワー

ウォッチタワーは、オプティミスティックロールアップ向けの自動チャレンジャーフレームワークです。ロールアップの決済バッチを追跡し、新しいバッチとそのチャレンジウィンドウの期限を通知します。そして、**あなたの**有効性述語（validity predicate）がバッチを拒否したときには、それをあなたの `onInvalid` コールバックに引き渡すので、チャレンジを組み込むことができます。

フレームワークは監視と*いつ*行うかの判断を担い、**有効性チェックはあなたが提供します**。ウォッチタワーは、バッチが不正であると自ら判断することは決してありません。あなたの `validate` 関数を呼び出し、その戻り値に基づいて動作します。

:::caution 初期段階: 監視対象はなく、0.5.0 の期限アラートは誤っています
ウォッチタワーは RDK の REST クライアントを通じてバッチを読み取ります。`/qorechain/rdk/v1/…` のルートは両方のネットワークで提供されています。どちらのネットワークにもロールアップは作成されていないため（2026年10月20日確認）、まだ監視対象はありません。また、`@qorechain/rdk` 0.5.0 では、チャレンジウィンドウの期限ロジックも信頼できません。バッチの `submittedAt` は**ブロック高**ですが、ウォッチタワー（および `qorollup status` の背後にあるヘルスチェック）は、これに秒単位のウィンドウを加算し、その合計を実時間と比較します。そのため `secondsRemaining` は意味を持たず、`onDeadline` はバッチが最初に検出された時点ですぐに発火します。判断に `onDeadline` やカウントダウンを使用しないでください。期限は自分で計算してください（下記の注記を参照）。また、ウォッチャーが読み取るのはバッチの最初のページ（50 件）のみです。
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.5.0 limits" in Deploying a Rollup). Without it the transaction is
// classical-only and refused.
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

  // Called when a batch is within `deadlineWarnSecs` of its deadline. In 0.5.0 the
  // deadline mixes a block height with the wall clock, so treat this as unreliable.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window alert for batch", batch.batchIndex, secondsRemaining);
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
バッチの期限は、秒ではなくブロック数で計算してください。`submitted_at`（ブロック高）にウィンドウを加えた値です。**メインネット（v3.2.3）** では、ウィンドウはデフォルトの 604,800「秒」を 1 ブロックあたり 6 秒の固定値で換算した **100,800 ブロック** です（実時間はブロック時間に従うため、メインネットの ≈3.2 秒ブロックでは「7 日」より短くなります）。**テストネットのみ（v3.2.4）** では、高さ 8,337,253 以降に提出されたバッチには、ブロック時間の秒数で測られるウィンドウが適用されます。チャレンジを投稿するには、ロールアップのチャレンジボンド（`nft` および `custom` プリセットでは 1,000 QOR）も必要です。
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` は、コマンドラインからフレームワークを実行し、Ctrl-C を押すまで新しいバッチとチャレンジウィンドウの期限を表示します。`qorollup` オペレーター CLI の全体については、[ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
