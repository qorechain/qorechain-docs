---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: サーバー側の検証"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: サーバー側の検証

SIWQ は、EIP-4361 形式のサインインメッセージで、アカウントの secp256k1 鍵
（ADR-36）と ML-DSA-87 鍵の両方で署名されます。フォーマット:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1)。

## フロー {#flow}

1. サーバーがセッション用の使い捨てナンスを発行します。
2. クライアントが `createSiwqMessage` でメッセージを作成し、ウォレットが
   `signSiwq` で署名します（または、`signArbitrary` で従来型の部分を、
   `siwqPqSignBytes(message)` に対する `pqSign` で ML-DSA-87 の部分を生成します）。
3. サーバーは発行するすべてのメッセージに `Expiration Time` を設定し（[有効期限と最大経過時間](#expiry)を参照）、`verifySiwqWithChain` で検証します。これはメッセージ、ナンス、
   ドメイン、時刻、従来型鍵がそのアドレスを制御していること、そして ML-DSA-87 署名
   を、そのアドレスに対して**チェーン上に登録されている**鍵に照らして確認します
   （[検証](/qoresign/spec/siwq-v1#verification)を参照）。

## TypeScript {#typescript}

```ts
import { verifySiwqWithChain } from "@qorechain/qoresign/network";

const fields = await verifySiwqWithChain({
  rest: "https://api.qore.host",
  address: body.address,
  message: body.message,
  signature: body.signature,
  domain: "app.example.com",       // the host the request came to
  nonce: session.nonce,            // single use; delete it now
  chainId: "qorechain-vladi",
});
// fields.address is signed in; fields.possessionProven tells whether the key was registered with a proof of possession
```

## Go {#go}

```go
import (
    qoresign "github.com/qorechain/qoresign/go"
    "github.com/qorechain/qoresign/go/network"
)

// The network helpers are methods on a client.
client := network.NewClient("https://api.qore.host")

var sig qoresign.SiwqSignature
if err := json.Unmarshal(signatureJSON, &sig); err != nil {
    return err
}
result, err := client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{
    Message:   message,
    Signature: sig,
    Domain:    "app.example.com", // the host the request came to
    Nonce:     issuedNonce,       // the nonce your server issued
    ChainID:   "qorechain-vladi",
})
if qoresign.IsCode(err, qoresign.CodeSiwqExpired) {
    // ask the user to sign in again
}
// result.Address signed in; result.PossessionProven reports how the key was registered.
```

## 有効期限と最大経過時間 {#expiry}

サーバーが発行するメッセージには、必ず `Expiration Time` を設定してください。`Expiration Time` のないメッセージは、`Issued At` から数えて 600 秒（10 分）を超えると `SIWQ_EXPIRED` で拒否されます。別の上限を使うには、検証関数に最大経過時間を渡します。バインディングごとのオプション名は次のとおりです。

- TypeScript、Swift、Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

0 または負の値は `INVALID_ARGUMENT` で失敗します。

タイムスタンプ（`Issued At`、`Expiration Time`、`Not Before`）は、[仕様](/qoresign/spec/siwq-v1#timestamps)の厳密な RFC 3339 文法に従う必要があります。時は 00 から 23、分と秒は 00 から 59、実在する暦の日付、大文字の `Z` またはコロン付きのオフセット、区切りは `T` です。`24:00:00` とうるう秒は使えません。作成、パース、署名、検証のすべてで同じ規則が適用され、規則に合わないタイムスタンプは `SIWQ_MALFORMED` で失敗します。QoreSign が作成するメッセージは、すでにこの文法に従っています。

0.1.x からアップグレードする場合、Swift、Kotlin、Python ではパッケージとそのネイティブライブラリを一緒にアップグレードしてください。

## 従来型のみのアカウント {#classical-only}

`verifySiwq` は、`requirePq: false` を渡さない限り、ML-DSA-87 の部分がないサイン
インを拒否します。従来型のみのサインインを受け入れるのは、サービスがポスト量子の保証を
必要としない場合に限ってください。

実行可能なサーバーは
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server)
にあります。
