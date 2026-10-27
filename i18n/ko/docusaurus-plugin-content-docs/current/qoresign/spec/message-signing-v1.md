---
slug: /qoresign/spec/message-signing-v1
title: 메시지 서명 v1
sidebar_label: 메시지 서명 v1
sidebar_position: 3
---

# 메시지 서명, 버전 1

상태: 안정. 체인 밖에서 임의의 데이터에 서명하기 위한 것으로(Keplr 호환 지갑의 `signArbitrary`
요청), 예를 들어 서비스에 계정 제어권을 증명할 때 사용합니다. 소스:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## 서명 {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **고전 부분:** ADR-36. 계정의 secp256k1 키가 `MsgSignData { signer, data }`의 amino JSON 서명
  문서에 서명하며, 이는
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part)과 정확히 같습니다
  (`secp256k1` 계정은 SHA-256 다이제스트, `eth_secp256k1`은 KECCAK-256, 64바이트
  `r || s`, low-S).
- **포스트 양자 부분:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data`는 원본 메시지 바이트입니다. `chain_id`는 문자, 숫자, `.`, `_`, `-`만 포함합니다.

## 도메인 분리 {#domain-separation}

계정이 QoreChain에서 만드는 모든 ML-DSA-87 서명은 자체 도메인으로 시작하므로, 한 용도로 만든 서명을
다른 용도로 재생할 수 없습니다. 지갑은 이 접두사 중 하나 없이 ML-DSA-87 키로 원본 바이트에 서명해서는
안 되며, 다른 용도로 예약된 접두사로 시작하는 메시지를 허용해서도 안 됩니다.

| 접두사 | 용도 |
|---|---|
| `qorechain-pqc-hybrid-v2` | 트랜잭션 sign-bytes ([하이브리드 트랜잭션 서명 v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | 키 등록 시의 소유 증명 |
| `qorechain:pqc:recovery:v1` | 계정 복구 |
| `qorechain-svm-auth-v2` | SVM 레인 승인 |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | 이 명세 |

## 검증 {#verification}

1. 고전 공개 키가 `keyType`에 따라 `signer`로 파생되고, ADR-36 서명이 검증됩니다.
2. ML-DSA-87 서명이 `signer`에 대해 **체인에 등록된** 키
   (`/qorechain/pqc/v1/account/{address}`)로, 예상 체인 ID가 포함된 위의 바이트에 대해 검증됩니다.

## 테스트 벡터 {#test-vectors}

`vectors/qoresign-v1.json`의 `message` 필드입니다. [테스트 벡터](/qoresign/vectors)를 참고하세요.
