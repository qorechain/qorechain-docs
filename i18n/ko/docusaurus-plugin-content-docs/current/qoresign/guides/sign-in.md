---
slug: /qoresign/guides/sign-in
title: "Sign In With QoreChain: 서버 검증"
sidebar_label: Sign In With QoreChain
sidebar_position: 2
---

# Sign In With QoreChain: 서버 검증

SIWQ는 EIP-4361 스타일의 로그인 메시지이며, 계정의 secp256k1 키(ADR-36)와 ML-DSA-87 키로 서명합니다.
형식:
[Sign In With QoreChain v1](/qoresign/spec/siwq-v1).

## 흐름 {#flow}

1. 서버가 세션용 일회용 nonce를 발급합니다.
2. 클라이언트가 `createSiwqMessage`로 메시지를 만들고 지갑이 `signSiwq`로 서명합니다
   (또는 `signArbitrary`로 고전 부분을, `siwqPqSignBytes(message)`에 대한 `pqSign`으로
   ML-DSA-87 부분을 만듭니다).
3. 서버가 `verifySiwqWithChain`으로 검증합니다. 이 함수는 메시지, nonce, 도메인, 시각,
   고전 키가 주소를 제어하는지, 그리고 ML-DSA-87 서명이 해당 주소에 대해 **체인에 등록된** 키와
   일치하는지를 확인합니다
   ([검증](/qoresign/spec/siwq-v1#verification) 참고).

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

## 고전 전용 계정 {#classical-only}

`verifySiwq`는 `requirePq: false`를 전달하지 않는 한 ML-DSA-87 부분이 없는 로그인을 거부합니다.
서비스에 포스트 양자 보장이 필요하지 않은 경우에만 고전 전용 로그인을 허용하세요.

실행 가능한 서버는
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server)에 있습니다.
