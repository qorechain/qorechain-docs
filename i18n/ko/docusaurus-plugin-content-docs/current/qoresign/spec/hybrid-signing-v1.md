---
slug: /qoresign/spec/hybrid-signing-v1
title: 하이브리드 트랜잭션 서명 v1
sidebar_label: 하이브리드 서명 v1
sidebar_position: 1
---

# QoreChain의 하이브리드 트랜잭션 서명, 버전 1

상태: 안정. `qorechain-vladi`(메인넷)와 `qorechain-diana`(테스트넷)의 Native(Cosmos SDK) 레인에
적용됩니다. 소스:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## 요약 {#summary}

하이브리드 트랜잭션은 같은 계정이 두 번 서명한 일반적인 Cosmos SDK `TxRaw`입니다.

1. ML-DSA-87(FIPS 204) 서명. 트랜잭션 본문 안에 확장 옵션
   `/qorechain.pqc.v1.PQCHybridSignature`로 담깁니다.
2. 최종 본문에 대한 secp256k1 `SIGN_MODE_DIRECT` 서명. `TxRaw.signatures`에 담깁니다.

네트워크는 두 서명을 모두 검증합니다. Native 레인에서 네트워크는 기본적으로 ML-DSA-87 서명을
요구하며(`HybridSignatureMode = Required`, 체인 전체 매개변수), 계정의 ML-DSA-87 키를 등록하거나
관리하는 메시지처럼 일부 면제 메시지를 제외하면 ML-DSA-87 서명이 없는 트랜잭션은 거부됩니다.

## 키 {#keys}

| 키 | 알고리즘 | 크기 |
|---|---|---|
| 고전 | secp256k1 (`secp256k1` 계정: 주소 = RIPEMD160(SHA256(압축 키)), `eth_secp256k1` 계정: 주소 = KECCAK256(비압축 키)의 마지막 20바이트) | 33바이트 압축 공개 키 |
| 포스트 양자 | ML-DSA-87, 알고리즘 id `1` | 공개 키 2592바이트, 서명 4627바이트 |

하이브리드 트랜잭션이 검증되려면 먼저 `MsgRegisterPQCKeyV2`로 계정에 ML-DSA-87 공개 키를 등록해야 합니다
([등록](#registration) 참고). 대신 트랜잭션이 확장(필드 3)에 공개 키를 포함시켜 첫 사용 시
등록할 수도 있습니다.

## 확장 {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

이 확장은 `type_url = "/qorechain.pqc.v1.PQCHybridSignature"`이고 protobuf 인코딩을 `value`로 하는
`google.protobuf.Any`로 `TxBody.extension_options`(필드 1023)에 추가됩니다. 본문에는 이러한 확장이
정확히 하나만 있어야 합니다.

## Sign-bytes {#sign-bytes}

`B0`를 PQC 확장을 **제외한** `TxBody`의 표준 protobuf 인코딩(다른 모든 필드와 확장은 순서대로 유지)이라
하고, `A`를 브로드캐스트되는 그대로의 `AuthInfo` 바이트라고 합시다. `BE32`/`BE64`는 빅 엔디언
부호 없는 길이입니다.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

네트워크는 주어진 높이에서 정확히 한 가지 형식만 검증합니다. 두 공개 네트워크는 `v3.1.98` / `v3.2.0`
업그레이드 이후 `v2`를 검증합니다(메인넷: 높이 2,981,742의 `v3.2.0`). 그 외 네트워크는 제네시스부터
`v2`를 검증합니다. `v1`은 해당 높이 이전에 만들어진 서명을 재현할 때만 필요합니다. 클라이언트는
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}`를 읽어 노드가 어느 형식을 검증하는지
확인할 수 있습니다.

ML-DSA-87 서명은 `ML-DSA.Sign(sk, signBytes, ctx = "")`입니다. 네트워크는 결정적 변형과 hedged 변형을
모두 받아들입니다. QoreSign은 게시된 벡터와 서명을 재현할 수 있도록 기본적으로 결정적으로 서명합니다
(FIPS 204, `rnd` = 32개의 0 바이트).

## 작업 순서 {#order-of-operations}

1. `B0`와 `A`를 인코딩합니다(이 시점에 수수료, 가스 한도, 서명자 정보가 확정됩니다).
2. sign-bytes와 ML-DSA-87 서명을 계산합니다.
3. 표준 필드 순서대로(기존 `extension_options` 뒤, `non_critical_extension_options` 앞) `B0`에
   확장을 추가해 최종 본문 `B`를 만듭니다.
4. `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`에
   secp256k1로 서명합니다. `secp256k1` 계정은 SHA-256, `eth_secp256k1` 계정은 KECCAK-256을 사용하며,
   64바이트 `r || s`, low-S입니다.
5. `TxRaw { B, A, [classical signature] }`를 브로드캐스트합니다.

고전 서명은 확장을 포함해 서명하고, ML-DSA-87 서명은 수수료를 포함해 본문과 auth info의 나머지 전부를
서명합니다. 어느 서명도 자기 자신을 서명하지 않습니다.

## 등록 {#registration}

`MsgRegisterPQCKeyV2`(타입 URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| 필드 | 번호 | 값 |
|---|---|---|
| `sender` | 1 | `qor1` 계정 |
| `public_key` | 2 | ML-DSA-87 공개 키 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | 계정의 33바이트 압축 secp256k1 키. `sender`로 파생되어야 함 |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | 아래 메시지에 대한 ML-DSA-87 서명 |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

등록 트랜잭션 자체는 고전 키로만 서명합니다. `t1` 부분(32번째 바이트부터)이 모두 0인 공개 키는
서명을 위조할 수 있으므로 거부됩니다.

## 다른 레인 {#other-lanes}

- EVM 레인: Ethereum 트랜잭션에는 확장을 위한 필드가 없으므로 ML-DSA-87 서명을 담지 않습니다.
  ML-DSA-87 키가 등록된 계정은 Native 레인에서 제한된 EVM 승인 윈도우(만료 높이, 최대 트랜잭션 수,
  최대 금액)를 열 수 있습니다.
  [EVM 지갑: 양자 대비 모드](/qoresign/guides/evm-quantum-ready)를 참고하세요.
- SVM 레인: 아직 네트워크에서 열리지 않았습니다.

## 테스트 벡터 {#test-vectors}

`vectors/qoresign-v1.json`의 `hybridTx` 필드는 본문, auth info, 계정 번호와 함께 두 버전에 대한 예상
sign-bytes, 서명, 최종 본문, `TxRaw`를 제공합니다.
[테스트 벡터](/qoresign/vectors)를 참고하세요.
