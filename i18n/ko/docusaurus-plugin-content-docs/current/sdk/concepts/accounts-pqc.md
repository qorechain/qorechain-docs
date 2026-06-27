---
slug: /sdk/concepts/accounts-pqc
title: 계정 및 PQC 서명
sidebar_label: 계정 및 PQC
sidebar_position: 2
---

# 계정 및 PQC 서명

QoreChain 계정은 단일 BIP-39 니모닉에서 파생됩니다. 동일한 니모닉이 독립적인
파생 경로를 통해 네이티브, EVM, SVM 계정을 산출합니다.

## HD 파생

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

니모닉은 어떤 키가 파생되기 전에 검증됩니다(단어 **및** 체크섬). 따라서 오타가
나면 조용히 잘못된 계정을 생성하는 대신 오류를 발생시킵니다.
`validateMnemonic(mnemonic)`으로 명시적으로 검증할 수도 있습니다.

### 파생 스킴

| 유형 | 곡선 | 경로 | 주소 |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))`의 bech32 `qor` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32바이트 공개 키의 base58 |

추가 계정을 파생하려면 계정 인덱스를 전달하세요. TypeScript에서:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust에서는 인덱스가 위치 인자입니다
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### 알려진 답(known-answer) 참고

파생 스킴은 결정론적이며 네 SDK 모두에서 알려진 답 테스트(known-answer test)로
검증됩니다. 따라서 동일한 니모닉은 TypeScript, Python, Go, Rust에서 동일한 주소를
생성합니다. 이를 통해 한 언어에서 파생하고 다른 언어에서 검증할 수 있습니다.

## 포스트 양자 암호화(PQC)

QoreChain은 **ML-DSA-87**(Dilithium-5, FIPS 204) 서명을 지원합니다. SDK는
프리미티브를 직접 노출합니다.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

내보낸 길이 상수(`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`)로 버퍼 크기를 검증할 수 있습니다.

> 내부적으로 PQC 프리미티브는 [**qorechain-pqc**](/developer-guide/post-quantum-signing)에서 옵니다 — 감사받은 FIPS-204/203/202 구현을 여섯 언어(JavaScript/TypeScript, Rust, Go, C, Python, Java)에서 하나의 일관된 API 뒤로 래핑하는 오픈 소스, 표준 전용 라이브러리입니다. SDK 바깥에서 원시 프리미티브나 `hybridSignBytes` 프레이밍이 필요할 때 직접 사용하세요.

### 플러그형 서명자

조합을 위해 SDK는 `Signer` 추상화와 함께 `PqcSigner` 및 `HybridSigner` 구현,
그리고 `SignatureMode` 열거형을 제공합니다. 프리미티브를 직접 호출하는 대신 PQC
서명을 여러분 자신의 흐름에 끼워 넣고 싶을 때 이를 사용하세요.

## 하이브리드 서명

**하이브리드** 트랜잭션은 고전적 secp256k1 서명과 ML-DSA-87 서명을 모두
운반하므로, 고전적 검증 아래에서 유효성을 유지하면서 포스트 양자 보호를 얻습니다.
포스트 양자 부분은 트랜잭션의 `PQCHybridSignature` 확장으로 전달됩니다.

:::caution 코스모스 경로에서는 하이브리드 서명이 필수입니다
현재 체인 버전(**v3.1.77**) 기준으로, 네트워크 기본값은
`hybrid_signature_mode = required`이며 `allow_classical_fallback = false`입니다.
`buildHybridTx`(와 `includePqcPublicKey`)를 통한 하이브리드 서명은 코스모스 경로
트랜잭션에 **필수**입니다 — 고전 전용 코스모스 트랜잭션은 온체인에서 거부됩니다.
EVM 트랜잭션은 별도의 `eth_secp256k1` 경로를 사용하므로 영향을 받지 않습니다.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### 온체인 전제 조건

하이브리드 트랜잭션이 온체인에서 PQC 검증되기 전에, 서명자의 PQC 공개 키가 체인의
`MsgRegisterPQCKey`를 통해 **등록**되어 있어야 합니다 — *단*, `includePqcPublicKey:
true`를 설정한 경우는 예외입니다. 이 경우 키를 확장에 임베드하여 체인이 최초 사용 시
자동 등록할 수 있게 합니다.

### 하이브리드 tx 계약(상위 수준)

트랜잭션은 표준 서명 바이트(PQC 확장을 **제외**) 위에서 고전적으로 서명되며,
ML-DSA-87 서명이 계산되어 `PQCHybridSignature` 확장으로 첨부됩니다. 고전적 서명
바이트가 확장을 제외하기 때문에, 검증자가 PQC 부분을 이해하든 못하든 고전적 서명은
유효하게 유지됩니다. 하위 수준 헬퍼(`encodeHybridExtension`,
`attachHybridExtension`, `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`)와
엔드 투 엔드 빌더(`buildHybridTx`, `signAndBroadcastHybrid`)는 고급 사용을 위해
내보내집니다.

> 하이브리드 트랜잭션 제출은 라이브 네트워크에서 코스모스 트랜잭션에 필수적인
> 경로입니다. 로컬 서명/검증 프리미티브와 tx 빌딩 헬퍼는 오늘 사용할 수 있습니다.

## 알고리즘 식별자

SDK는 프로토콜 수준 작업을 위한 알고리즘 ID와 헬퍼를 내보냅니다:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)`, `isSignatureAlgorithm(id)`.
