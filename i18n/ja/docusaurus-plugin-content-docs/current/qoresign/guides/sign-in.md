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
3. サーバーは `verifySiwqWithChain` で検証します。これはメッセージ、ナンス、
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

fields, err := network.VerifySiwqWithChain(ctx, network.Options{REST: "https://api.qore.host"}, address, message, signature,
    qoresign.VerifySiwqOptions{Domain: "app.example.com", Nonce: nonce, ChainID: "qorechain-vladi"})
```

## 従来型のみのアカウント {#classical-only}

`verifySiwq` は、`requirePq: false` を渡さない限り、ML-DSA-87 の部分がないサイン
インを拒否します。従来型のみのサインインを受け入れるのは、サービスが耐量子の保証を
必要としない場合に限ってください。

実行可能なサーバーは
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server)
にあります。
