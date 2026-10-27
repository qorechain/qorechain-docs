---
slug: /qoresign/spec/message-signing-v1
title: メッセージ署名 v1
sidebar_label: メッセージ署名 v1
sidebar_position: 3
---

# メッセージ署名、バージョン 1

ステータス: 安定。任意のデータをオフチェーンで署名するためのものです（Keplr 互換
ウォレットの `signArbitrary` リクエスト）。たとえば、サービスに対してアカウントの
制御を証明する場合などに使います。ソース:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md)。

## 署名 {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **従来型の部分:** ADR-36。アカウントの secp256k1 鍵が `MsgSignData { signer, data }`
  の amino JSON 署名ドキュメントに署名します。
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part) とまったく同じ
  です（`secp256k1` アカウントは SHA-256 ダイジェスト、`eth_secp256k1` は
  KECCAK-256。64 バイトの `r || s`、low-S）。
- **耐量子の部分:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` は生のメッセージバイト列です。`chain_id` には英字、数字、`.`、`_`、`-` のみが
含まれます。

## ドメイン分離 {#domain-separation}

QoreChain 上でアカウントが行うすべての ML-DSA-87 署名は、それぞれ固有のドメインで
始まります。そのため、ある目的のために生成された署名を別の目的で再利用（リプレイ）
することはできません。ウォレットは、これらのプレフィックスのいずれかなしに、生の
バイト列を ML-DSA-87 鍵で署名してはならず、また、メッセージが別の用途のために予約
されたプレフィックスで始まることを許してはなりません。

| プレフィックス | 用途 |
|---|---|
| `qorechain-pqc-hybrid-v2` | トランザクションの sign-bytes（[ハイブリッドトランザクション署名 v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)） |
| `qorechain-pqc-pop-v1\|` | 鍵登録時の所有証明 |
| `qorechain:pqc:recovery:v1` | アカウントリカバリー |
| `qorechain-svm-auth-v2` | SVM レーンの認可 |
| `qorechain-siwq-v1\|` | Sign In With QoreChain（[Sign In With QoreChain v1](/qoresign/spec/siwq-v1)） |
| `qorechain-msg-v1\|` | この仕様 |

## 検証 {#verification}

1. 従来型の公開鍵が `keyType` のもとで `signer` に導出され、ADR-36 署名が検証される。
2. ML-DSA-87 署名が、`signer` に対して**チェーン上に登録されている**鍵
   （`/qorechain/pqc/v1/account/{address}`）のもとで、期待されるチェーン ID を用いた
   上記のバイト列に対して検証される。

## テストベクター {#test-vectors}

`vectors/qoresign-v1.json` の `message` フィールドです。
[テストベクター](/qoresign/vectors)を参照してください。
