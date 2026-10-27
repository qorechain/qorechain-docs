---
slug: /qoresign/spec/hd-derivation-draft
title: ML-DSA-87 鍵導出
sidebar_label: 鍵導出（HD ドラフト）
sidebar_position: 4
---

# ML-DSA-87 鍵導出

ステータス: 正規導出は安定しています。階層導出は**ドラフト**です。確定する前に実装が
変更される可能性があり、それで導出した鍵は他の鍵と同様にチェーン上へ登録する必要が
あります。ソース:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md)。

## 正規導出（安定） {#canonical-derivation}

QoreChain ウォレットと QoreChain SDK は、BIP-39 ニーモニックとアカウントアドレス
から、アカウントごとに 1 つの ML-DSA-87 鍵を導出します。

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address` はアカウントの `qor1` 形式です（`0x` アドレスは、まず同じ 20
  バイトに変換されます）。
- `mnemonic` は正規形式のフレーズです。小文字の英単語を単一のスペースで区切り、
  前後には何も付けません。文字列が異なると鍵も異なるため、実装は他の表記を黙って
  正規化するのではなく、拒否しなければなりません。
- 鍵はアドレスに紐付いています。同じニーモニックでも、アカウントごとに異なる鍵に
  なります。

この導出を使用するウォレットは、QoreChain ウォレットが作成したアカウントにすでに
登録されている鍵で署名します。

## 階層導出（ドラフト） {#hierarchical-derivation}

アドレスに紐付けずに、1 つのシードから複数の耐量子鍵を必要とするウォレット向けです。
ML-DSA には公開子鍵導出がないため、パスの各セグメントはすべてハードンドです。

この構成は、独自のマスターキー文字列を用いた SLIP-0010 です。

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed` は 64 バイトの BIP-39 シード（ニーモニックとオプションのパスフレーズ）、
  または 16 〜 64 バイトの任意のシードです。
- デフォルトのパスは `m/44'/118'/{account}'/0'/0'` です。
- ハードンドでないセグメントを含むパスは拒否されます。

これが確定する前の未解決事項: パスで使用するコインタイプ、チェーン上の鍵ローテーション
（`MsgRotatePQCKey`）との相互作用、そしてシードから耐量子鍵を導出する他のエコシステム
との整合性です。

## テストベクター {#test-vectors}

`vectors/qoresign-v1.json` の `canonical`、`hd`、`hdRejected` フィールドです。
[テストベクター](/qoresign/vectors)を参照してください。
