---
slug: /rollups/watchtower
title: ウォッチタワー
sidebar_label: ウォッチタワー
sidebar_position: 9
---

# ウォッチタワー

ウォッチタワーは、オプティミスティックロールアップ向けの自動チャレンジャーフレームワークです。ロールアップの決済バッチを追跡し、新しいバッチとそのチャレンジウィンドウの期限を通知します。そして、**あなたの**有効性述語（validity predicate）がバッチを拒否したときには、それをあなたの `onInvalid` コールバックに引き渡すので、チャレンジを組み込むことができます。

フレームワークは監視と*いつ*行うかの判断を担い、**有効性チェックはあなたが提供します**。ウォッチタワーは、バッチが不正であると自ら判断することは決してありません。あなたの `validate` 関数を呼び出し、その戻り値に基づいて動作します。

:::caution 初期段階: まだ監視対象はありません
ウォッチタワーは RDK の REST クライアントを通じてバッチを読み取ります。`/qorechain/rdk/v1/…` のルートは両方のネットワークで提供されています。どちらのネットワークにもロールアップは作成されていないため（2026年10月27日確認）、まだ監視対象はなく、ウォッチタワーは実際のバッチに対して動作したことがありません。`@qorechain/rdk` 0.5.0 では、その期限ロジックが誤っており（ブロック高を Unix タイムスタンプとして読んでいたため、`onDeadline` はバッチが最初に検出された時点ですぐに発火しました）、読み取るのもバッチの最初の 50 件のページだけでした。**0.6.0 でその両方が修正されました**（下記を参照）。現行リリースの 0.7.0 を使用してください。
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.7.0: changes and limits" in Deploying a Rollup). Without it the
// transaction is classical-only and refused.
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

  // Called once per batch when its challenge window is still open and close to
  // closing: within `deadlineWarnSecs` seconds (time-based window) or
  // `deadlineWarnBlocks` blocks (block-count window). `window` says which rule
  // applies and what is left.
  onDeadline: ({ batch, window }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, window);
  },
});

// Later:
watcher.stop();
```

フレームワークは次のものを通知します。

- `onBatch` による **新しいバッチ**、
- `onDeadline` による **チャレンジウィンドウの期限**、そして
- `onInvalid` による **無効なバッチ**（あなたの `validate` が `false` を返したもの）。

0.6.0 以降（それ以降のすべてのリリースも同様）、ウォッチタワーはロールアップのバッチ一覧のすべてのページをたどり、期限が近づくにつれてバッチを再判定し（各バッチを最初に見たときに一度だけ判定するのではなく、ウィンドウがまだ開いている最も古いバッチから先へポーリングを続けます）、各ウィンドウをローカルの時計ではなくチェーンのチップ（`getChainTip`、ノードのステータス）に照らして測定します。すでに `finalized` のバッチは、検証も警告も行われません。

**再提出されたバッチ（0.7.0）。** チェーン v3.2.5 以降（両ネットワーク）、不正が認められると、そのバッチと、それ以降の未ファイナライズのバッチすべてが拒否され、シーケンサーは同じインデックスで再提出します。0.7.0 より前のリリースはバッチをインデックスだけで区別していたため、拒否されたインデックスで再提出されたバッチを見逃していました。0.7.0 はインデックスとステートルートで区別し、拒否されたバッチを検証することはありません。

**チェーンの不正ルールの適用（0.7.0）。** `transitionRootValidator` は、チェーン自身のルール（バッチのステートルートが正規の遷移ルートでない場合に不正とする）を適用する、すぐに使える `validate` 述語です。`fraudProofForBatch` は、勝てる証明を返します（正直なバッチの場合は何も返しません）。これを `challengeBatch` に渡すことができます。

`onInvalid` をチャレンジに接続すると、ウォッチタワーは完全な自動チャレンジャーになります。未設定のままにすると、観測のみのモードで動作します。

:::note チャレンジウィンドウ
チェーンはバッチのウィンドウを 2 通りのいずれかの方法で測定し、`batchChallengeWindow`（ウォッチタワーと、`qorollup status` の背後にあるヘルスチェックが使用します）はそのどちらかを報告します。**ブロック数ウィンドウ（高さ 3,742,566 より前に提出されたバッチに対するメインネットのルール（v3.2.3 以前））：** ウィンドウは、ロールアップに設定された秒数を 1 ブロックあたり 6 秒の固定値でブロック数に換算したもので、デフォルトの 604,800 では **100,800 ブロック** となり、バッチの `submitted_at` の高さから数えます。実時間はブロック時間に従うため、メインネットの ≈3.1 秒ブロックでは「7 日」より短くなります。パッケージは `open` と `finalizable` を別々に報告します。パッケージが実装するルールでは 1 つのブロックがその両方になり得るためです（チャレンジは `height - submitted_at <= window` の間は開いているとみなされ、`height - submitted_at >= window` から確定可能になります）。**時間ベースのウィンドウ（v3.2.4 以降。テストネットでは高さ 8,337,253 から、メインネットでは高さ 3,742,566 以降）：** アップグレード高さ以降に提出されたバッチはそのブロック時間を記録し、そのウィンドウはその秒数分のブロック時間になります。ウォッチタワーは、ノードが報告する場合はロールアップ自身のウィンドウを使用します（パッケージはこれを v3.2.4 以降としてドキュメント化しています）。報告されない場合はモジュールのデフォルトウィンドウにフォールバックするため、独自のウィンドウを設定したロールアップには `challengeWindowSecs` を渡してください。チャレンジを投稿するには、ロールアップのチャレンジボンド（`nft` および `custom` プリセットでは 1,000 QOR）も必要です。モジュールのデフォルトウィンドウは、メインネットでは 604,800 秒、テストネットでは 3,600 秒（1 時間）です（2026年10月27日に `GET /qorechain/rdk/v1/params` から読み取り）。そのため、同じロールアップ構成でも、テストネットではウィンドウがはるかに短くなります。
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower` は、コマンドラインからフレームワークを実行し、Ctrl-C を押すまで新しいバッチとチャレンジウィンドウの期限を表示します。`--canonical`（0.7.0）を付けると、ステートルートが正規の遷移ルートでないバッチ、つまりチャレンジが勝てるバッチもすべて報告します。`qorollup` オペレーター CLI の全体については、[ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
