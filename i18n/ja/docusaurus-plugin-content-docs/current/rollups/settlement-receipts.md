---
slug: /rollups/settlement-receipts
title: 量子安全な決済レシート
sidebar_label: 決済レシート
sidebar_position: 6
---

# 量子安全な決済レシート

**決済レシート** は、ロールアップの決済バッチがポスト量子署名のもとで Main Chain に
アンカーされたことを示す、可搬で自己完結型の証明です。特定のバッチを、そのロールアップの
状態をその高さでコミットしたオンチェーンアンカーに結び付け、**完全オフライン** で検証できます —
ノードも、検証者のネットワーク経路への信頼も不要です。

アンカー署名は **ML-DSA-87**（Dilithium-5、FIPS-204）であり、Main Chain が使用するのと同じ
ポスト量子スキームです。そのため、レシートはベースチェーンの量子安全な完全性を継承します。

## 正規アンカーメッセージ

検証では、アンカーフィールドから構築された正規メッセージに対する Dilithium-5 署名を、
次の正確な順序で連結してチェックします:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` はこれらのバイトを生成します。検証者はレシートからそれらを再構築し、
レイヤー作成者の登録済み ML-DSA-87 鍵に対して署名をチェックします。

## ビルドと検証（TypeScript）

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

`creatorPublicKey` の代わりに（またはそれと併せて）`client` を渡すと、検証は
レイヤー作成者の登録済み ML-DSA-87 鍵をチェーンから取得します（`getPqcAccount(address)`）。
検証は次に 2 つのことをチェックします:

1. 正規アンカーメッセージに対する **Dilithium-5 署名**、および
2. **バッチ ↔ アンカー状態ルートの結び付き** — あなたが保持するバッチが、アンカーが
   コミットしたものであること。

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## アンカーの読み取り

レシートは、新しいオンチェーンの `x/multilayer` **Anchor** クエリから構築されます。読み取りは次のとおりです:

- `getAnchor(layerId)` — レイヤーのアンカー。
- `getLatestAnchor()` — 最新のアンカー。
- `getAnchors(layerId)` — レイヤーのアンカー履歴。
- `getPqcAccount(address)` — 登録済みのポスト量子アカウント（その ML-DSA-87
  鍵）。作成者の署名の検証に使用されます。

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

完全な `qorollup` オペレーター CLI については [ロールアップのデプロイ](/rollups/deploying-a-rollup)
を参照してください。

## その他の言語

Python、Go、Rust、Java（JVM）クライアントは、同じビルド/検証の
サーフェスを公開しています。これらは、バンドルされた JavaScript 実装ではなく
[`qorechain-pqc`](https://github.com/qorechain) ライブラリを通じて ML-DSA-87 検証を
実行します。お使いの言語の RDK クライアントと併せてインストールしてください。
