---
slug: /rollups/settlement-receipts
title: 量子安全な決済レシート
sidebar_label: 決済レシート
sidebar_position: 6
---

# 量子安全な決済レシート

**決済レシート** は、ロールアップの決済バッチがポスト量子署名のもとで Main Chain にアンカーされたことを示す、可搬な記録です。ロールアップ、バッチ、アンカーを示し、Main Chain が使用するのと同じ方式である、アンカーの **ML-DSA-87**（Dilithium-5、FIPS-204）署名を保持します。

:::caution 初期段階：アンカーはまだ存在しません
レシートはアンカーに依存しており、**どちらのネットワークにも、まだロールアップもアンカーも存在しません**。メインネットでは、RDK はまだアンカーを書き込んでいません。決済バッチは記録されますが、アンカー処理のステップはスキップされます。このページは、設計とその構成要素の説明として扱ってください。現時点で頼れるサービスの説明ではありません。
:::

## レシートは主張であり、証拠ではありません {#a-receipt-is-a-claim}

レシートのすべてのフィールドは、それを渡した人が提供したものです。与えられた鍵に対して署名を確認しても、その鍵を持つ誰かがそのバイト列に署名したことが分かるだけで、QoreChain が何かをアンカーしたことは分かりません。したがって検証者は、信頼できる QoreChain ノードに接続されたクライアントを必要とし、チェーンの状態から主張を読み直します。対象となるのは、ロールアップとそのレイヤー、バッチとその状態ルート、アンカー、そして作成者の登録済みポスト量子鍵です。

## アンカーが署名するもの {#what-the-anchor-signs}

アンカーの署名は、**ロールアップ作成者** の登録済み ML-DSA-87 鍵によって行われます。現在のメインネットでは、署名されるメッセージは次のとおりです

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

新しいチェーンリリースでは署名対象のメッセージが変更されるため、ハードコードしないでください。対象とするネットワークの署名バイト列を読み取ってください。アンカーはレイヤー単位のオブジェクトです。ロールアップもバッチも示さないため、検証者はチェーンの読み取りを通じてそれらを結び付けます（[マルチレイヤーアーキテクチャ](/architecture/multilayer-architecture#reading-anchors)を参照）。

## アンカーの読み取り {#reading-anchors}

アンカーは REST と gRPC で読み取れます（最新のアンカーは `/qorechain/multilayer/v1/anchor/{layer_id}`、履歴は `/qorechain/multilayer/v1/anchors/{layer_id}`）。また、アカウントの登録済みポスト量子鍵は `/qorechain/pqc/v1/account/{address}` で読み取れます。ロールアップのバッチは `qorechaind query rdk batch [rollup-id]` で読み取ります（RDK の REST ルートは現在メインネットでは提供されていません）。

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

検証のたびに `client` を渡してください。お使いの RDK クライアントの最新の公開リリースを使用してください。レシート API とそのチェックはリリース間で変更されており、Python、Go、Rust、Java クライアントも同じビルド/検証のサーフェスを公開しています（ML-DSA-87 検証は [`qorechain-pqc`](https://github.com/qorechain) ライブラリを通じて実行します）。

:::note 現在のクライアントの制限
公開されている RDK クライアントは、稼働中のチェーンが提供していない経路で作成者の鍵を検索するため、オンライン検証は稼働中のネットワークに対してまだ完了しません。クライアントのリリースでこれが解消されるまでは、レシートは、自分のノードから読み取ったアンカーと照合するための記録としてのみ使用してください。
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

完全な `qorollup` オペレーター CLI については [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
