---
slug: /rollups/settlement-receipts
title: 決済レシート
sidebar_label: 決済レシート
sidebar_position: 6
---

# 決済レシート

**決済レシート** は、ロールアップの決済バッチがポスト量子署名のもとで Main Chain にアンカーされたことを示す、可搬な記録です。ロールアップ、バッチ、アンカーを示し、Main Chain が使用するのと同じ方式である、アンカーの **ML-DSA-87**（Dilithium-5、FIPS-204）署名を保持します。

:::caution 初期段階：アンカーはまだ存在しません
レシートはアンカーに依存しており、**どちらのネットワークにも、まだロールアップもアンカーも存在しません**（2026年10月27日時点で確認）。v3.2.2（両ネットワークで稼働中）以降、`anchor_signature` を付けて提出されたバッチは、同じトランザクション内で `x/multilayer` にアンカーされます。付けずに提出されたバッチは、アンカーなしで決済されます。TypeScript の RDK（0.6.0 から 0.7.0）は、そのトランザクションクライアントがハイブリッドで署名し、かつロールアップの作成者である場合にこのフィールドを送信し、そうでない場合はアンカーなしで提出します。Python、Go、Rust、Java のクライアントはクラシカルのみで署名するため、このフィールドを構築しません。これらはいずれも、稼働中のロールアップで実行されたことはありません。このページは、設計とその構成要素の説明として扱ってください。現時点で頼れるサービスの説明ではありません。
:::

## レシートは主張であり、証拠ではありません {#a-receipt-is-a-claim}

レシートのすべてのフィールドは、それを渡した人が提供したものです。与えられた鍵に対して署名を確認しても、その鍵を持つ誰かがそのバイト列に署名したことが分かるだけで、QoreChain が何かをアンカーしたことは分かりません。したがって検証者は、信頼できる QoreChain ノードに接続されたクライアントを必要とし、チェーンの状態から主張を読み直します。対象となるのは、ロールアップとそのレイヤー、バッチとその状態ルート、アンカー、そして作成者の登録済みポスト量子鍵です。

## アンカーが署名するもの {#what-the-anchor-signs}

アンカーの署名は、**ロールアップ作成者** の登録済み ML-DSA-87 鍵によって行われます。署名されるメッセージは、アンカーが提出される高さによって異なります。**v3.2.2 以降（メインネットの高さ 3,556,788、テストネットの高さ 6,905,034）は v2 メッセージ** です。ドメインタグ、チェーン ID、そして長さプレフィックス付きの `layer_id`、`layer_height`、`state_root`、`validator_set_hash`、トランザクション数、圧縮された状態証明で構成されます（正確なレイアウトは[アンカーの読み取り](/architecture/multilayer-architecture#reading-anchors)にあります）。チェーンは、その高さ以降、v1 アンカー（`layer_id || layer_height || state_root || validator_set_hash`、チェーン ID なし）を受け付けません。どちらの形式もハードコードしないでください。対象とするネットワークの署名バイト列を読み取ってください。RDK は `anchorSignBytesForBatch` で v2 のバイト列を構築し（両方の形式は `anchorSignBytesV1` / `anchorSignBytesV2` で構築できます）、CLI はそれを出力します。たとえば `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` を使用します。

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

検証のたびに `client` を渡してください。レシート API とそのチェックはリリース間で変更されているため、0.7.0（現行リリース。そのレシートのチェックは 0.6.1 で導入されたものです）を使用してください。0.5.0 ではチェーンの検証を完了できず、0.6.0 ではレシートのすべてのフィールドを比較していませんでした（下記を参照）。Python、Go、Rust、Java クライアントも同じビルド/検証のサーフェスを公開しています。それらの 0.6.1 以降のリリースは、同じ単数形の鍵検索ルート、高さに基づくアンカーメッセージの同じ選択方法、フィールドごとの同じ比較を使用します。

### 0.7.0 が検証する内容 {#what-060-verifies}

`verifySettlementReceipt` は、レシートだけでは決して `valid` を報告しません。`client` がない場合、結果は `mode: "signature-only"` かつ `valid: false` になります。`client` がある場合はチェーンを読み直し、各チェックを個別に報告します。

* `rollupLayerBinding`: ロールアップがレシートのレイヤーに属することを、チェーンが示している。
* `batchStateRoot`: チェーン上のバッチが、レシートの状態ルートを保持している。
* `anchorOnChain`: レシートが示す**すべて**のアンカーフィールド（状態ルート、レイヤー高、バリデーターセットのハッシュ、署名、メインチェーンの高さ、アンカー時刻、アルゴリズムとバージョン、そしてバージョン 2 のレシートではトランザクション数と圧縮された状態証明）に一致するアンカーがチェーン上に存在する。不一致の場合は、そのフィールド名が示される。
* `creatorAuthority`: 署名鍵は、レシートから取り込まれたものではなく、チェーン（`/qorechain/pqc/v1/account/{address}`）から読み取られている。
* `pqcSignature`: ML-DSA-87 署名が、正規のアンカーメッセージに対して検証される。
* `chainBinding`: レシートが、実際に照会されたチェーンを指している。

アンカーメッセージは、アンカーが記録された高さによって選択されます（v3.2.2 の切り替え前は v1、切り替え以降は v2）。両方を試すことは決してありません。v1 署名にはチェーン ID が含まれず、すべてのチェーンで検証されてしまうためです。パッケージには、メインネット（3,556,788）とテストネット（6,905,034）の切り替え高が含まれています。結果は、使用した形式を `signBytesVersion` として報告します。レシートスキーマ v2 は `chainId` を記録します。バージョン 1 のレシートにはそれがないため、`chainBinding` を通過するのは、そのアンカーが照会したチェーン上で見つかったからにすぎません。別のチェーンのノードに対して確認されたレシートは、検証で拒否されます。チェーンから何かを読み取る前に、`receiptSchemaError` が、未知の `version`、`ML-DSA-87` 以外の `algorithm`、または（バージョン 2 で）`chainId` のないレシートを拒否します。

0.6.1 以降、結果にはチェーン自身の `anchor` も含まれ、`valid` が true の場合は、チェーンの状態から再構築された `verifiedReceipt`（Python と Rust では `verified_receipt`、Go では `VerifiedReceipt`）も含まれます。渡されたレシートからではなく、これらから事実を読み取ってください。`qorollup receipt verify --json` は、ファイルをそのまま返す代わりに、チェーンから読み取ったそのレシートを `receipt` として返します（レシートが有効でない場合は `null`）。トランザクション数と証明が導入される前のバージョン 1 のレシートも、引き続き検証されます。

どちらのネットワークにもアンカーは存在しないため、これはパッケージのコードとオフラインでのみ確認されており、実際のアンカーに対しては確認されていません。`buildSettlementReceipt` は、バッチをカバーするアンカーが存在して初めて機能します。

:::note 0.6.1 より前のリリース
0.6.0 の `verifySettlementReceipt` は、チェーンのアンカーを状態ルート、レイヤー高、バリデーターセットのハッシュ、署名で照合していましたが、レシートに表示されるその他のフィールド（メインチェーンの高さ、アンカー時刻、アルゴリズム、バージョン、そしてバージョン 2 のレシートではトランザクション数と圧縮された状態証明）は比較しておらず、バッチの状態ルートも参考情報として扱っていました。決済の主張そのもの（状態ルート、アンカー署名、作成者の鍵）は常に結び付けられていました。0.6.0 に分からなかったのは、その隣に印字されたメタデータがチェーンと一致するかどうかです。0.7.0 を使用してください。

0.5.0 の `verifySettlementReceipt` は、稼働中のネットワークに対してフェイルクローズしました。理由は 2 つあり、いずれもチェーンではなくクライアント側にありました。作成者の鍵を、ポスト量子アカウントルートの複数形 `accounts` 形式で検索しており、ネットワークはこれを提供していません（HTTP 501）。また、v1 メッセージのみを再構築しており、チェーンは v3.2.2 以降、アンカーに対してこれを受け付けません。そのため、本物のレシートは検証できず、偽造されたレシートは引き続き拒否されました。0.7.0 を使用してください。
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

完全な `qorollup` オペレーター CLI については [ロールアップのデプロイ](/rollups/deploying-a-rollup) を参照してください。
