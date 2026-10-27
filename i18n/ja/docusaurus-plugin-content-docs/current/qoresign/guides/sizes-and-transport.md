---
slug: /qoresign/guides/sizes-and-transport
title: サイズとトランスポート
sidebar_label: サイズとトランスポート
sidebar_position: 5
---

# サイズとトランスポート

| 項目 | バイト数 | 出典 |
|---|---|---|
| ML-DSA-87 公開鍵 | 2592 | FIPS 204, Table 2 |
| ML-DSA-87 秘密鍵 | 4896 | FIPS 204, Table 2 |
| ML-DSA-87 署名 | 4627 | FIPS 204, Table 2 |
| ML-DSA-87 シード | 32 | FIPS 204 |
| secp256k1 圧縮公開鍵 | 33 | SEC 1 |
| secp256k1 署名 (r, s) | 64 | |
| ボディ内の PQC 拡張 | 約 4640（署名に protobuf のフレーミングを加えたもの。公開鍵を埋め込む場合はさらに 2595） | `qorechain.pqc.v1.PQCHybridSignature` |

## ウォレットへの影響 {#consequences}

- ハイブリッドトランザクションは、従来型のものより約 4.7 KB 大きくなります。ガスと
  手数料はトランザクションサイズに応じて増えます。署名前にシミュレート
  （`simulateTx`）し、推奨されるガスリミットを使用してください。
- 静的な QR コード 1 つに収まるのは最大 2953 バイト（バージョン 40、バイナリ、
  低誤り訂正）であるため、ML-DSA-87 の署名や公開鍵は 1 つに収まりません。エア
  ギャップ署名者には、複数パートのエンコーディング（アニメーションまたはファウンテン
  コード方式の QR）が必要です。
- ML-DSA-87 鍵を永続化する必要がある場合は、4896 バイトの秘密鍵ではなく、32 バイト
  のシードを保存してください。`pqKeyFromSeed` で鍵ペアを再作成できます。

拡張のレイアウトは
[ハイブリッドトランザクション署名 v1](/qoresign/spec/hybrid-signing-v1#extension)
で定義されています。
