---
slug: /developer-guide/post-quantum-signing
title: 양자내성 서명
sidebar_label: 양자내성 서명
sidebar_position: 8
---

# 양자내성 서명

`qorechain-pqc`는 QoreChain을 뒷받침하는 오픈소스 **표준 전용(standards-only)** 양자내성 암호 라이브러리입니다. 지갑, 통합 개발자, 툴링에 체인이 사용하는 것과 정확히 동일한 프리미티브를 제공하며 — 6개 언어에서 하나의 일관된 API로, 공유된 교차 언어 테스트 벡터 스위트를 통해 **바이트 호환성이 입증**되어 있습니다.

이 라이브러리는 **최종 확정된 NIST 표준**의 감사된 구현을 래핑합니다. 커스텀 방식을 발명하지 **않습니다**: 비표준 변형이야말로 상호운용성을 깨뜨리는 요인입니다(한 곳에서 생성된 서명이 다른 곳에서는 검증되지 않게 됩니다). 모든 바인딩은 동일한 벡터에 대해 검증되므로, 한 언어에서 생성된 ML-DSA 서명은 다른 모든 언어에서 검증되고, ML-KEM 공유 비밀은 6개 언어 전체에서 일치하며, SHAKE-256 다이제스트도 동일합니다.

* **리포지토리:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **라이선스:** Apache-2.0

## 프리미티브

| 프리미티브 | 표준 | 역할 | 보안 수준 (기본값은 **굵게**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | 디지털 서명 | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | 키 캡슐화 | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | 가변 길이 출력 해시 | — |

이는 QoreChain이 프로토콜 수준에서 실행하는 것과 동일한 프리미티브입니다: **ML-DSA-87 (Dilithium-5)** 서명, **ML-KEM-1024** 키 캡슐화, 그리고 기본 애플리케이션 해시로서의 **SHAKE-256**. 체인이 이를 어떻게 사용하는지는 [양자내성 보안](/architecture/post-quantum-security)을 참조하세요.

### 크기 (바이트)

크기/보안 예산에 따라 보안 수준을 선택하세요.

| 스킴 | 보안 수준 | 공개 키 | 서명 / 암호문 |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> NIST 표준을 더 작게 만들면서 여전히 표준일 수는 없습니다. ML-DSA-87은 키/서명 크기와 바이트가 고정되어 있습니다 — 이를 "최적화"하면 다른 어떤 구현도 검증할 수 없는 비표준 변형이 됩니다. 온체인 풋프린트를 줄이려면 방식 자체를 변경하는 대신 아래의 수단들을 사용하세요.

## 언어 및 패키지

모든 언어가 동일한 API를 노출하며, 각각은 서로 다른 감사된 구현으로 뒷받침됩니다. 이것이 바이트 호환성을 보장하는 요소입니다 — 독립적인 백엔드들이 표준에 대해 일치하기 때문입니다.

| 언어 | 패키지 | 설치 | 백엔드 |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (임포트는 `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (정적 라이브러리 + 헤더) | [리포지토리](https://github.com/qorechain/qorechain-pqc)에서 빌드 | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info 이용 가능 여부
JavaScript, Rust, Python, Go, Java 바인딩은 모두 버전 **0.1.1**로 **게시**되어 있습니다 — 위의 명령어로 npm, crates.io, PyPI, Go 모듈 프록시, Maven Central에서 바로 설치하세요. Python 배포판은 `qorechain-pqc`로 설치되지만 **임포트는 `qorpqc`**로 합니다. **Java** 패키지는 Maven Central에 `io.github.qorechain:qorechain-pqc:0.1.1`로 게시되어 있습니다(Bouncy Castle 백엔드). **C** 바인딩은 [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)에서 직접 빌드하는 정적 라이브러리 + 헤더입니다.
:::

## 결정론적 서명 (컨센서스 크리티컬) {#deterministic-signing}

버전 **0.1.1**부터 `sign()`은 **6개 바인딩 전체**에서 **결정론적(deterministic)** ML-DSA 변형(FIPS-204 §3.4, 서명 난수가 32개의 0 바이트인 방식)을 생성하며 — 이것이 체인이 수락하는 유일한 변형입니다. QoreChain의 트랜잭션 검증기는 **헤지드(무작위화) ML-DSA 서명을 거부**하므로, 헤지드 서명은 암호학적으로는 검증되더라도 온체인에서는 실패합니다.

핵심 사항:

* **기본값을 변경하지 마세요.** 결정론적 서명은 컨센서스 크리티컬이며, 모든 바인딩이 이를 그렇게 문서화하고 있습니다.
* 결정론적 출력은 동일한 키와 메시지에 대해 **6개 바인딩 전체에서 바이트 단위로 동일**하며 — 공유된 교차 언어 테스트 벡터로 고정되어 있습니다.
* 헤지드 서명은 체인 외 용도를 위해 바인딩별 **명시적 옵트인**으로 여전히 사용할 수 있습니다(예: JavaScript의 `{hedged: true}`, Rust의 `sign_hedged`, Java의 `mldsaSignHedged`, Python의 `sign(..., hedged=True)`) — 헤지드 서명은 **체인에서 수락되지 않습니다**.
* JavaScript 바인딩의 0.1.0 버전은 기본적으로 헤지드 서명을 생성했습니다 — 0.1.0을 기반으로 트랜잭션 툴링을 구축했다면 **0.1.1로 업그레이드하세요**; 이전 기본값으로 서명된 트랜잭션은 온체인에서 거부됩니다.

## 일관된 API

모든 언어가 동일한 인터페이스를 제공합니다:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### 빠른 시작 (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

기본값이 원하는 것과 다를 경우를 위해 보안 수준별 익스포트도 제공됩니다: `mldsa44/65/87` 및 `mlkem512/768/1024` (`mldsa` / `mlkem`은 L5 기본값입니다).

**Rust, Go, C, Python, Java** 바인딩도 이를 정확히 동일하게 반영합니다. 예를 들어:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## 블록체인 헬퍼

원시 프리미티브 외에도, 이 라이브러리는 통합 개발자가 QoreChain 계정 및 트랜잭션과 상호작용하는 데 필요한 두 가지 헬퍼를 제공합니다.

### `pubkeyHash(pk, len=20)`

**pay-to-pubkey-hash** 등록 헬퍼입니다. 공개 키의 짧은(20–32바이트) SHAKE-256 해시를 생성합니다. 패턴은 다음과 같습니다: 계정 상태에는 `pubkeyHash`만 저장하고, 트랜잭션에 전체 공개 키를 요구합니다. 키가 1–2.5 KB이더라도 계정 상태는 작게 유지됩니다.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChain의 지갑 호환 **하이브리드 확장 서명 바이트(sign-bytes) 프레이밍**입니다. 하이브리드 트랜잭션의 PQC 절반을 구성하기 위해 ML-DSA-87 (Dilithium-5)로 서명해야 하는 바이트를 정확히 생성합니다.

이것이 지갑과 통합 개발자가 cosmos 트랜잭션 경로에서 **필수 하이브리드 서명**을 생성하는 데 사용하는 구성 요소입니다. 현재 체인 버전 기준으로 하이브리드 서명은 **기본적으로 필수**입니다(`hybrid_signature_mode = required`, `allow_classical_fallback = false`): 모든 cosmos 경로 트랜잭션은 클래식 secp256k1 서명과 함께 Dilithium-5 서명을 반드시 포함해야 합니다. 시행 모델은 [양자내성 보안](/architecture/post-quantum-security)을 참조하세요.

클래식 secp256k1 서명은 표준 서명 바이트(PQC 확장을 **제외**)에 대해 계산되고, ML-DSA-87 서명은 `PQCHybridSignature` 확장으로 계산되어 첨부됩니다. 클래식 서명 바이트가 확장을 제외하므로, 검증자가 PQC 부분을 이해하든 그렇지 않든 클래식 서명은 유효하게 유지됩니다.

이 하이브리드 서명을 생성하는 방법은 세 가지입니다:

* **CLI** — `qorechaind tx pqc cosign`이 트랜잭션에 Dilithium-5 공동 서명을 첨부합니다(`qorechaind tx pqc gen-key` 이후). [트랜잭션 명령어](/cli-reference/transaction-commands)를 참조하세요.
* **QoreChain SDK** — `buildHybridTx`(`includePqcPublicKey`와 함께)가 TypeScript/Python/Go/Rust에서 동일한 작업을 수행합니다. [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참조하세요.
* **`qorechain-pqc` 직접 사용** — 지원되는 6개 언어 중 하나로 SDK 외부에서 툴링을 구축하는 경우, `hybridSignBytes`로 서명 바이트를 프레이밍하고 `mldsa.sign`으로 Dilithium-5 서명을 생성하세요.

## 온체인 풋프린트 최적화

ML-DSA 키와 서명은 클래식 기준으로 보면 큽니다. 표준의 바이트는 고정되어 있으므로, 온체인 풋프린트를 작게 유지하는 방법은 다음 세 가지 수단을 사용하는 것입니다 — 어느 것도 표준을 변경하지 않습니다:

1. **보안 수준을 신중하게 선택하세요.** ML-DSA-65 (L3) 서명은 ML-DSA-87 (L5)보다 약 28% 작으면서도 여전히 매우 강력하고, ML-KEM-768 암호문은 1024보다 작습니다. 용도별로 선택하세요.
2. **Pay-to-pubkey-hash.** 계정 상태에는 `pubkeyHash(pk)`(SHAKE-256의 20–32바이트)만 저장하고, 트랜잭션에 전체 공개 키를 요구하세요. 키 크기와 무관하게 계정 상태는 작게 유지됩니다.
3. **서명은 검증 후 폐기하세요.** 서명은 트랜잭션(블록 데이터)에는 존재해야 하지만, 영구 상태 트리에는 절대 기록되어서는 안 됩니다.

> **왜 Falcon이 없나요?** FN-DSA (Falcon)는 더 작은 서명을 제공하지만 의도적으로 **제외**되었습니다: FN-DSA는 FIPS-206 *초안*(최종 확정 아님)이고, 표준 전용 라이브러리는 최종 확정된 표준만 제공하기 때문입니다. FIPS-206이 최종 확정되면 재검토할 수 있습니다.

## 관련 문서

* [양자내성 보안](/architecture/post-quantum-security) — 체인이 이 프리미티브들을 사용하고 하이브리드 서명을 시행하는 방식.
* [트랜잭션 명령어](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` CLI 흐름.
* [SDK 계정 및 PQC 서명](/sdk/concepts/accounts-pqc) — QoreChain SDK에서의 키 및 하이브리드 서명.
* [지갑 설정](/getting-started/wallet-setup) — PQC 기반 계정 생성 및 관리.
