---
slug: /rollups/settlement-receipts
title: 量子安全な決済レシート
sidebar_label: 決済レシート
sidebar_position: 6
---

# 量子安全な決済レシート

**決済レシート** は、ロールアップの決済バッチがポスト量子署名のもとで Main Chain にアンカーされたことを示す、可搬な記録です。ロールアップ、バッチ、アンカーを示し、Main Chain が使用するのと同じ方式である、アンカーの **ML-DSA-87**（Dilithium-5、FIPS-204）署名を保持します。

:::caution 初期段階：アンカーはまだ存在しません
レシートはアンカーに依存しており、**どちらのネットワークにも、まだロールアップもアンカーも存在しません**（2026年10月20日時点で確認）。v3.2.2（両ネットワークで稼働中）以降、`anchor_signature` を付けて提出されたバッチは、同じトランザクション内で `x/multilayer` にアンカーされます。付けずに提出されたバッチは、アンカーなしで決済されます。リリース済みの RDK クライアント（0.5.0）はこのフィールドを送信しないため、それらが提出するバッチはアンカーされません。このページは、設計とその構成要素の説明として扱ってください。現時点で頼れるサービスの説明ではありません。
:::

## レシートは主張であり、証拠ではありません {#a-receipt-is-a-claim}

レシートのすべてのフィールドは、それを渡した人が提供したものです。与えられた鍵に対して署名を確認しても、その鍵を持つ誰かがそのバイト列に署名したことが分かるだけで、QoreChain が何かをアンカーしたことは分かりません。したがって検証者は、信頼できる QoreChain ノードに接続されたクライアントを必要とし、チェーンの状態から主張を読み直します。対象となるのは、ロールアップとそのレイヤー、バッチとその状態ルート、アンカー、そして作成者の登録済みポスト量子鍵です。

## アンカーが署名するもの {#what-the-anchor-signs}

アンカーの署名は、**ロールアップ作成者** の登録済み ML-DSA-87 鍵によって行われます。署名されるメッセージは、アンカーが提出される高さによって異なります。**v3.2.2 以降（メインネットの高さ 3,556,788、テストネットの高さ 6,905,034）は v2 メッセージ** です。ドメインタグ、チェーン ID、そして長さプレフィックス付きの `layer_id`、`layer_height`、`state_root`、`validator_set_hash`、トランザクション数、圧縮された状態証明で構成されます（正確なレイアウトは[アンカーの読み取り](/architecture/multilayer-architecture#reading-anchors)にあります）。チェーンは、その高さ以降、v1 アンカー（`layer_id || layer_height || state_root || validator_set_hash`、チェーン ID なし）を受け付けません。どちらの形式もハードコードしないでください。対象とするネットワークの署名バイト列を読み取ってください。たとえば `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` を使用します。

アンカーはレイヤー単位のオブジェクトです。ロールアップもバッチも示さないため、検証者はチェーンの読み取りを通じてそれらを結び付けます（[マルチレイヤーアーキテクチャ](/architecture/multilayer-architecture#reading-anchors)を参照）。

## アンカーの読み取り {#reading-anchors}

アンカーは REST と gRPC で読み取れます（最新のアンカーは `/qorechain/multilayer/v1/anchor/{layer_id}`、履歴は `/qorechain/multilayer/v1/anchors/{layer_id}`）。また、アカウントの登録済みポスト量子鍵は `/qorechain/pqc/v1/account/{address}`（単数形の `account`）で読み取れます。ロールアップのバッチは、両ネットワークが提供する RDK の REST ルート（`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`、`/qorechain/rdk/v1/latest_batch/{rollup_id}`、`/qorechain/rdk/v1/batches/{rollup_id}`）か、`qorechaind query rdk batch [rollup-id]` で読み取ります。

## ビルドと検証（TypeScript） {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

検証のたびに `client` を渡してください。レシート API とそのチェックはリリース間で変更されているため、チェーンに対して検証を行うリリース（0.5.0 以降）を使用してください。Python、Go、Rust、Java クライアントも同じビルド/検証のサーフェスを公開しています（Go と Rust のクライアントは、下記の制限と同じ複数形の鍵検索パスを使用します）。

:::caution 現在のクライアントの制限（RDK 0.5.0）
0.5.0 の `verifySettlementReceipt` は、レシートだけでは決して `valid` を報告しません（`client` がない場合、結果は `mode: "signature-only"` かつ `valid: false` になります）。また、そのチェーン検証は、稼働中のネットワークに対してまだ完了しません。理由は 2 つあり、いずれもチェーンではなくクライアント側にあります。

* 作成者の鍵を、ポスト量子アカウントルートの複数形 `accounts` 形式で検索しますが、ネットワークはこれを提供していません（HTTP 501。動作するルートは単数形の `account` です）。そのため `client` を付けた場合、結果は、作成者のポスト量子鍵を解決できなかったという理由付きの `valid: false` になります。
* 署名対象メッセージを v1 レイアウトで再構築しますが、チェーンは v3.2.2 以降、アンカーに対してこれを受け付けません。そのため、鍵を手元に持っていても、本物の v2 署名を検証できません。

`buildSettlementReceipt` は、バッチをカバーするアンカーが存在して初めて機能しますが、現在アンカーは存在しません。レシートは、自分のノードから読み取ったアンカーと作成者の鍵、および対象ネットワークの v2 署名バイト列と照合するための記録としてのみ使用してください。
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

完全な `qorollup` オペレーター CLI については [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
