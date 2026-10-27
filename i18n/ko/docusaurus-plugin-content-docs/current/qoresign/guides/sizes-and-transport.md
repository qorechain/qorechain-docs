---
slug: /qoresign/guides/sizes-and-transport
title: 크기와 전송
sidebar_label: 크기와 전송
sidebar_position: 5
---

# 크기와 전송

| 항목 | 바이트 | 출처 |
|---|---|---|
| ML-DSA-87 공개 키 | 2592 | FIPS 204, Table 2 |
| ML-DSA-87 비밀 키 | 4896 | FIPS 204, Table 2 |
| ML-DSA-87 서명 | 4627 | FIPS 204, Table 2 |
| ML-DSA-87 시드 | 32 | FIPS 204 |
| secp256k1 압축 공개 키 | 33 | SEC 1 |
| secp256k1 서명 (r, s) | 64 | |
| 본문의 PQC 확장 | 약 4640 (서명과 protobuf 프레이밍 포함, 공개 키를 포함하면 2595 추가) | `qorechain.pqc.v1.PQCHybridSignature` |

## 지갑에 미치는 영향 {#consequences}

- 하이브리드 트랜잭션은 고전 트랜잭션보다 약 4.7 KB 큽니다. 가스와 수수료는 트랜잭션 크기에 따라
  늘어납니다. 서명하기 전에 시뮬레이션(`simulateTx`)하고 제안된 가스 한도를 사용하세요.
- 정적 QR 코드 하나에는 최대 2953바이트(버전 40, 바이너리, 낮은 오류 정정)만 담을 수 있으므로,
  ML-DSA-87 서명이나 공개 키는 하나에 들어가지 않습니다. 에어갭 서명기는 여러 부분으로 나눈
  인코딩(애니메이션 또는 파운틴 코드 QR)이 필요합니다.
- ML-DSA-87 키를 저장해야 한다면 4896바이트의 비밀 키가 아니라 32바이트 시드를 저장하세요.
  `pqKeyFromSeed`가 키 쌍을 다시 만들어 줍니다.

확장 레이아웃은
[하이브리드 트랜잭션 서명 v1](/qoresign/spec/hybrid-signing-v1#extension)에 정의되어 있습니다.
