---
slug: /qoresign/guides/key-derivation
title: 키 파생
sidebar_label: 키 파생
sidebar_position: 4
---

# 키 파생

QoreSign은 BIP-39 니모닉에서 ML-DSA-87 키를 얻는 두 가지 방법을 제공합니다. 전체 정의:
[ML-DSA-87 키 파생](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (초안) |
|---|---|---|
| 입력 | 니모닉 + 계정 주소 | 니모닉(또는 시드) + 하드닝된 경로 |
| 주소에 바인딩 | 예 | 아니요 |
| QoreChain 지갑과 동일한 키 | 예 | 아니요 |
| 체인 등록 필요 | 아직 등록되지 않은 경우에만 | 항상 |
| 안정성 | 안정 | 확정되기 전에 바뀔 수 있음 |

주소와 무관한 포스트 양자 키가 시드당 여러 개 필요한 경우가 아니라면
[표준 파생](/qoresign/spec/hd-derivation-draft#canonical-derivation)을 사용하세요
([계층적 초안](/qoresign/spec/hd-derivation-draft#hierarchical-derivation) 참고).

## 니모닉 형식 {#mnemonic-form}

니모닉은 표준 형식(소문자 단어, 공백 한 칸)이어야 합니다.
QoreSign은 다른 표기를 정규화하지 않고 거부합니다. 구문이 파생 입력의 일부이므로 표기가 다르면
다른 키가 만들어지기 때문입니다.

## 니모닉이 없는 지갑 {#without-mnemonic}

니모닉이 없는 지갑(예: 하드웨어에 키가 보관된 경우)은 표준 파생을 사용할 수 없습니다.
`pqKeyFromSeed(randomBytes(32))`로 무작위 ML-DSA-87 키를 생성하거나 HD 초안을 사용한 뒤
그 키를 등록할 수 있습니다.
