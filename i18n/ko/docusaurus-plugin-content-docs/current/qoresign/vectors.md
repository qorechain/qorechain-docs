---
slug: /qoresign/vectors
title: QoreSign 테스트 벡터
sidebar_label: 테스트 벡터
sidebar_position: 5
---

# 테스트 벡터

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)은
TypeScript 구현(`pnpm build && pnpm vectors`)에서 생성되며
TypeScript, Rust, Go, Swift, Kotlin 테스트 스위트가 이를 검사합니다. 이 파일을 바꾸는 것은
와이어 포맷을 바꾸는 것입니다. 이 파일을 수정하지 말고 새 버전의 새 파일을 추가하세요.

모든 키는 공개된 BIP-39 테스트 니모닉(`abandon ... about`)에서 파생됩니다.
이 계정으로는 절대 자금을 보내지 마세요.

## 필드 {#fields}

| 필드 | 내용 |
|---|---|
| `accounts` | `secp256k1`(`m/44'/118'/0'/0/0`) 및 `eth_secp256k1`(`m/44'/60'/0'/0/0`) 계정의 고전 키와 주소 |
| `canonical` | 주소별 표준 ML-DSA-87 공개 키([키 파생](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | 계층적 파생 초안: 경로별 공개 키, 그리고 거부되어야 하는 경로([키 파생](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | `TxBody`와 `AuthInfo`, 계정 번호, 체인 ID, 그리고 sign-bytes `v2` 및 `v1`에 대한 예상 sign-bytes, ML-DSA-87 서명, 최종 본문, secp256k1 서명, `TxRaw`([하이브리드 서명](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | 소유 증명 메시지와 서명([등록](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | 인코딩된 `MsgRegisterPQCKeyV2` |
| `message` | 임의 메시지 서명: 데이터, ADR-36 및 ML-DSA-87 sign-bytes, 서명([메시지 서명](/qoresign/spec/message-signing-v1)) |
| `siwq` | 로그인 필드, 렌더링된 메시지, ADR-36 및 ML-DSA-87 sign-bytes, 서명, 그리고 검증이 통과하는 시각([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## 인코딩 {#encoding}

모든 바이트 문자열은 소문자 16진수입니다. ML-DSA-87 서명은 결정적입니다
(FIPS 204, `rnd` = 32개의 0 바이트). secp256k1 서명은 RFC 6979와 low-S를 사용합니다.
