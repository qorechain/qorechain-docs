---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), 버전 1

상태: 메시지 형식 버전 1에 대해 안정. 소스:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

SIWQ를 사용하면 QoreChain 계정이 체인 밖 서비스에 자신의 키 제어권을 증명할 수 있습니다.
메시지는 [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) 및 Sign In With Solana의 레이아웃을 따르며
QoreChain 주소와 체인 ID에 맞게 조정되었습니다. 서명은 두 부분으로 구성됩니다. Keplr 호환 지갑이
`signArbitrary`로 만들 수 있는 ADR-36 secp256k1 서명, 그리고 계정에 등록된 포스트 양자 키의
ML-DSA-87(FIPS 204) 서명입니다.

## 메시지 {#message}

```
${scheme://}${domain} wants you to sign in with your QoreChain account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: ${chain-id}
Nonce: ${nonce}
Issued At: ${issued-at}
Expiration Time: ${expiration-time}
Not Before: ${not-before}
Request ID: ${request-id}
Resources:
- ${resources[0]}
- ${resources[1]}
...
```

- 줄은 단일 `\n`으로 구분하며, 끝에 줄바꿈은 없습니다.
- `scheme://`은 선택 사항입니다. `domain`은 요청하는 사이트의 RFC 3986 authority(호스트와 선택적 포트)입니다.
- `address`는 계정의 `qor1` bech32 형식입니다.
- statement 줄은 선택 사항입니다. 없으면 주소 뒤에 EIP-4361과 같이 빈 줄이 두 개 옵니다.
- `Version`은 `1`입니다. `Chain ID`는 `qorechain-vladi`와 같은 QoreChain 체인 ID입니다.
- `Nonce`는 서버가 선택한 8자 이상의 영숫자이며 일회용입니다.
- 타임스탬프는 RFC 3339 / ISO 8601입니다.
- `Expiration Time`, `Not Before`, `Request ID`, `Resources`는 선택 사항이며 이 순서로 나타납니다.

검증자는 파싱한 필드를 다시 렌더링하여 바이트 단위로 일치하지 않는 메시지를 거부해야 합니다.

## 서명 {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### 고전 부분 (ADR-36) {#classical-part}

계정의 secp256k1 키가 아래의 amino JSON 서명 문서에 서명하며, 키를 정렬하고 공백 없이 직렬화합니다.
`data`는 UTF-8 메시지의 base64이고 `signer`는 `qor1` 주소입니다.

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

다이제스트는 `secp256k1` 계정은 SHA-256, `eth_secp256k1` 계정은 KECCAK-256이며, 서명은 64바이트
`r || s`, low-S입니다. `publicKey`는 33바이트 압축 키이며 `keyType`에 따라 `address`로 파생되어야 합니다.

### 포스트 양자 부분 {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

도메인 접두사는 로그인 서명이 트랜잭션 서명으로 쓰이거나 그 반대가 되는 것을 막습니다
([도메인 분리](/qoresign/spec/message-signing-v1#domain-separation) 참고).

`pq` 부분이 없으면 `signatureType`은 `secp256k1`입니다. 검증자는 고전 전용 계정을 명시적으로 허용하지
않는 한 이러한 로그인을 거부해야 합니다.

## 검증 {#verification}

검증자는 다음을 이 순서대로 확인해야 합니다.

1. 메시지가 파싱되고 표준 형식인지;
2. `domain`이 요청이 온 도메인과 같은지;
3. `nonce`가 서버가 이 세션에 발급한 nonce와 같고, 이전에 사용된 적이 없는지;
4. `Chain ID`가 기대하는 네트워크인지;
5. `Expiration Time`이 미래이고, `Not Before`와 `Issued At`이 미래가 아닌지(약간의 시계 오차 허용);
6. 고전 공개 키가 `address`로 파생되고 ADR-36 서명이 검증되는지;
7. ML-DSA-87 서명이 클라이언트가 제공한 키가 아니라 `address`에 대해 **체인에 등록된** 공개 키
   (`/qorechain/pqc/v1/account/{address}`)로 검증되는지.

## 테스트 벡터 {#test-vectors}

`vectors/qoresign-v1.json`의 `siwq` 필드입니다. [테스트 벡터](/qoresign/vectors)를 참고하세요.
