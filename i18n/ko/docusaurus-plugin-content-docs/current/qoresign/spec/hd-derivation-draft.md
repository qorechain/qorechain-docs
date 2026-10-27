---
slug: /qoresign/spec/hd-derivation-draft
title: ML-DSA-87 키 파생
sidebar_label: 키 파생 (HD 초안)
sidebar_position: 4
---

# ML-DSA-87 키 파생

상태: 표준 파생은 안정 단계입니다. 계층적 파생은 **초안**입니다. 확정되기 전에 구현이 바뀔 수 있으며,
이 방식으로 파생한 키도 다른 키와 마찬가지로 체인에 등록해야 합니다. 소스:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## 표준 파생(안정) {#canonical-derivation}

QoreChain 지갑과 QoreChain SDK는 BIP-39 니모닉과 계정 주소로부터 계정당 하나의 ML-DSA-87 키를
파생합니다.

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address`는 계정의 `qor1` 형식입니다(`0x` 주소는 먼저 동일한 20바이트로
  변환됩니다).
- `mnemonic`은 표준 형식의 구문입니다. 소문자 영어 단어를 공백 한 칸으로 구분하며 앞뒤에는 아무것도
  없습니다. 구현은 다른 표기를 조용히 정규화하지 말고 거부해야 합니다. 문자열이 다르면 키도
  다르기 때문입니다.
- 키는 주소에 바인딩됩니다. 같은 니모닉이라도 계정마다 다른 키가 나옵니다.

이 파생을 사용하는 지갑은 QoreChain 지갑이 만든 계정에 이미 등록된 키로 서명합니다.

## 계층적 파생(초안) {#hierarchical-derivation}

주소에 묶지 않고 하나의 시드에서 여러 포스트 양자 키가 필요한 지갑을 위한 방식입니다. ML-DSA에는
공개 자식 파생이 없으므로 모든 경로 세그먼트는 하드닝됩니다.

이 구성은 자체 마스터 키 문자열을 사용하는 SLIP-0010입니다.

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed`는 64바이트 BIP-39 시드(니모닉과 선택적 패스프레이즈)이거나 16~64바이트의 임의 시드입니다.
- 기본 경로는 `m/44'/118'/{account}'/0'/0'`입니다.
- 하드닝되지 않은 세그먼트가 하나라도 있는 경로는 거부됩니다.

확정되기 전에 남은 사항: 경로에 사용할 코인 타입, 체인상의 키 교체(`MsgRotatePQCKey`)와의 상호작용,
시드에서 포스트 양자 키를 파생하는 다른 생태계와의 정렬.

## 테스트 벡터 {#test-vectors}

`vectors/qoresign-v1.json`의 `canonical`, `hd`, `hdRejected` 필드입니다.
[테스트 벡터](/qoresign/vectors)를 참고하세요.
