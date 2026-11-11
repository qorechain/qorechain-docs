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
3. 서버는 발급하는 모든 메시지에 `Expiration Time`을 설정한 뒤([만료와 최대 유효 기간](#expiry) 참고) `verifySiwqWithChain`으로 검증합니다. 이 함수는 메시지, nonce, 도메인, 시각,
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

## 만료와 최대 유효 기간 {#expiry}

서버가 발급하는 메시지에는 항상 `Expiration Time`을 설정하세요. 이 값이 없는 메시지는
`Issued At`부터 600초(10분)가 지나면 `SIWQ_EXPIRED`로 거부됩니다. 다른 한도를
사용하려면 검증기에 최대 유효 기간을 전달하세요. 바인딩별 옵션 이름은 다음과 같습니다.

- TypeScript, Swift, Kotlin: `maxAgeSeconds`
- Python: `max_age_seconds`
- Rust: `VerifySiwqArgs::max_age_seconds`
- Go: `VerifySiwqOptions.MaxAge`

0 또는 음수 값은 `INVALID_ARGUMENT`로 실패합니다.

타임스탬프(`Issued At`, `Expiration Time`, `Not Before`)는 [사양](/qoresign/spec/siwq-v1#timestamps)의
엄격한 RFC 3339 문법을 따라야 합니다. 시는 00~23, 분과 초는 00~59, 실제로 존재하는 달력 날짜,
대문자 `Z` 또는 콜론이 있는 오프셋, 구분자는 `T`이며, `24:00:00`과 윤초는 허용되지 않습니다.
같은 규칙이 생성, 파싱, 서명, 검증 시에 모두 적용되며, 규칙을 벗어난 타임스탬프는
`SIWQ_MALFORMED`로 실패합니다. QoreSign이 만든 메시지는 이미 이 문법을 사용합니다.

0.1.x에서 업그레이드할 때 Swift, Kotlin, Python은 패키지와 네이티브 라이브러리를 함께
업그레이드해야 합니다.

## 고전 전용 계정 {#classical-only}

`verifySiwq`는 `requirePq: false`를 전달하지 않는 한 ML-DSA-87 부분이 없는 로그인을 거부합니다.
서비스에 포스트 양자 보장이 필요하지 않은 경우에만 고전 전용 로그인을 허용하세요.

실행 가능한 서버는
[`examples/siwq-server`](https://github.com/qorechain/qoresign/tree/main/examples/siwq-server)에 있습니다.
