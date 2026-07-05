---
slug: /sdk/concepts/accounts-pqc
title: 계정 및 PQC 서명
sidebar_label: 계정 및 PQC
sidebar_position: 2
---

# 계정 및 PQC 서명

QoreChain 계정은 하나의 BIP-39 니모닉에서 파생됩니다. 두 가지 계정 모델이 있으며,
둘 다 완전히 지원됩니다:

- **레인별 HD 파생(레거시/기본값)** — 동일한 니모닉에서 독립적인 파생 경로를 통해
  네이티브(코인 타입 118), EVM(코인 타입 60), SVM(코인 타입 501) 계정이 생성됩니다.
  세 개의 키, 세 개의 주소입니다.
- **통합 eth-네이티브 계정** (SDK 0.6.0, 체인 v3.1.83) — 하나의
  `eth_secp256k1` 키가 세 가지 주소 인코딩으로 표현되는 하나의 20바이트 아이덴티티이며,
  하나의 공유 잔액을 가집니다.
  [통합 계정](#unified-accounts)을 참조하세요.

## HD 파생 (레거시/기본값, 코인 타입 118)

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

니모닉은 키를 파생하기 전에 (단어 **및** 체크섬이) 검증되므로, 오타가 있으면
조용히 잘못된 계정을 생성하는 대신 예외가 발생합니다. `validateMnemonic(mnemonic)`으로
명시적으로 검증할 수도 있습니다.

### 파생 방식

| 타입 | 곡선 | 경로 | 주소 |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))`의 bech32 `qor` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32바이트 공개 키의 base58 |

추가 계정을 파생하려면 계정 인덱스를 전달하세요. TypeScript에서는:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust에서는 인덱스가 위치 인자입니다
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### 알려진 답(known-answer) 참고 사항

파생 방식은 결정적이며 네 개 SDK 전체에서 known-answer 테스트로 검증되므로,
동일한 니모닉이 TypeScript, Python, Go, Rust에서 동일한 주소를 생성합니다.
따라서 한 언어에서 파생하고 다른 언어에서 검증할 수 있습니다.

> 이 레인별 파생(코인 타입 118의 `deriveNativeAccount`와
> `deriveEvmAccount` / `deriveSvmAccount`)은 **레거시/기본값** 모델이며
> 계속 지원되고 변경 없이 유지됩니다. 아래의 통합 계정은 추가적인
> 옵트인 아이덴티티 모델입니다.

## 통합 계정 (eth-네이티브) {#unified-accounts}

SDK **0.6.0**(체인 v3.1.83)부터 `deriveUnifiedAccount(mnemonic, index = 0)`는
Ethereum HD 경로 `m/44'/60'/0'/0/{index}`에서 하나의 `eth_secp256k1` 키를 파생하며,
그 20바이트 주소(`keccak256(pubkey)[12:]`)는 세 가지 방식으로 표현되는
동일한 아이덴티티입니다:

| 레인 | 인코딩 |
| --- | --- |
| Native | `qor` 접두사의 bech32 (`qor1…`) |
| EVM | `0x` + EIP-55 대소문자 혼합 체크섬 16진수 |
| SVM | 20바이트를 12개의 0 바이트로 오른쪽 패딩한 값(32바이트)의 base58 |

세 주소 중 **어느 곳**으로 입금하든 **하나의** 잔액에 들어가며, 이 키는
모든 레인에서 지출할 수 있습니다:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)`는 원시 32바이트 secp256k1 개인 키로부터
동일한 작업을 수행합니다.

### PQC 시드 파생

계정의 ML-DSA-87 키 쌍은 결정적으로, 그리고 **주소에 바인딩되어** 파생됩니다:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

따라서 `{ address, mnemonic }`으로부터 복구할 수 있으며, QoreChain의 모든
언어 SDK에서 동일합니다. (`unifiedAccountFromSeed`의 경우 니모닉 자리에
`"seed:" + hex(seed32)`가 들어갑니다.)

### eth 키로 Native 레인에서 전송하기

통합 계정은 `eth_secp256k1` 방식으로 Native 경로 트랜잭션에 서명합니다:
클래식 서명은 SignDoc 바이트의 **keccak256**(sha256이 아님)에 대한 secp256k1
서명이며, `SignerInfo` 공개 키는 타입 URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`를 사용합니다. 하이브리드 경로
(`signHybridEth`)는 추가로 ML-DSA-87 `PQCHybridSignature` 확장을 첨부하며 —
이는 라이브 네트워크에서 필수입니다:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

더 낮은 수준의 제어가 필요하면 `signHybridEth(params)` / `signClassicalEth(params)`가
조립된 `TxRaw` 바이트와 서명 아티팩트를 반환하며,
`accountAuthInfo(baseAccount)`는 온체인 공개 키가 `eth_secp256k1` 타입 URL을 사용하는
계정에서 `account_number` / `sequence`를 읽습니다.
클래식 전용 경로는 부트스트랩 면제가 적용되는 일회성
`MsgRegisterPQCKeyV2`를 위한 것이며, 그 외 모든 경우에는 하이브리드를 사용하세요.

:::caution 하이브리드 트랜잭션에는 SDK 0.6.1+로 업그레이드하세요
SDK **0.6.1**은 합의(consensus)에 치명적인 인코딩 버그를 수정했습니다:
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 확장이 `Any.value`에
JSON으로 직렬화되어 있었고, 체인은 **해당 트랜잭션을 CheckTx에서 거부**했습니다
(tx 파싱 오류). 이제 다섯 개 언어 모두에서 protobuf로 인코딩됩니다
(확장 값이 `0x08`로 시작). SDK ≤ 0.6.0으로 빌드된 모든 하이브리드 트랜잭션은 —
eth-네이티브 레인을 포함하여 — 온체인에서 거부됩니다: 0.6.1 이상으로
업그레이드하세요.
:::

### Phantom (P1a): 키를 내보내지 않고 만드는 통합 계정

`connectPhantomUnified()`(TypeScript)는 결정적인 Phantom 서명으로부터
표준적(canonical)이며 **비수탁형(non-custodial)** 통합 계정을 파생합니다:
사용자가 Phantom의 ed25519 키로 고정된 도메인 분리 메시지에 서명하고,
`shake256(signature, 32)`가 계정의 시드가 됩니다.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

파생된 계정은 Phantom ed25519 키와는 별개의 표준 키입니다 —
Phantom은 파생된 secp256k1/PQC 비밀 키를 절대 볼 수 없습니다. Phantom 키
자체가 한도 내에서 계정에서 지출할 수 있도록 하려면
[인증자 및 위임 지출](/sdk/guides/authenticators)을 참조하세요.

## 포스트 양자 암호 (PQC)

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

내보내진 길이 상수(`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`)를 사용해 버퍼 크기를 검증할 수 있습니다.

> 내부적으로 PQC 프리미티브는 [**qorechain-pqc**](/developer-guide/post-quantum-signing)에서 제공됩니다 — 감사(audit)된 FIPS-204/203/202 구현을 여섯 개 언어(JavaScript/TypeScript, Rust, Go, C, Python, Java)에서 하나의 일관된 API로 감싸는 오픈 소스, 표준 전용 라이브러리입니다. SDK 밖에서 원시 프리미티브나 `hybridSignBytes` 프레이밍이 필요할 때 직접 사용하세요.

### 플러그형 서명자

조합(composition)을 위해 SDK는 `Signer` 추상화와 `PqcSigner`,
`HybridSigner` 구현체, 그리고 `SignatureMode` 열거형을 제공합니다.
프리미티브를 직접 호출하는 대신 PQC 서명을 자체 플로우에 연결하고 싶을 때
이를 사용하세요.

## 하이브리드 서명 {#hybrid-signing}

**하이브리드** 트랜잭션은 클래식 secp256k1 서명과 ML-DSA-87 서명을 모두
포함하므로, 클래식 검증에서 유효하게 유지되면서 포스트 양자 보호를 얻습니다.
포스트 양자 부분은 트랜잭션의 `PQCHybridSignature` 확장으로 전달됩니다.

:::caution Native 경로에서는 하이브리드 서명이 필수입니다
현재 체인 버전(**v3.1.85**) 기준으로 네트워크 기본값은
`hybrid_signature_mode = required`이고 `allow_classical_fallback = false`입니다.
`buildHybridTx`(`includePqcPublicKey` 포함)를 통한 하이브리드 서명 — 또는
통합 eth-네이티브 계정의 경우 `signHybridEth` — 은 Native 경로 트랜잭션에
**필수**이며, 클래식 전용 Native 트랜잭션은 온체인에서 거부됩니다.
EVM 트랜잭션은 별도의 `eth_secp256k1` 경로를 사용하므로 영향을 받지 않습니다.
:::

:::caution SDK ≤ 0.6.0 하이브리드 트랜잭션은 거부됩니다
0.6.1 릴리스는 `PQCHybridSignature` 확장의 인코딩을 수정했습니다
(JSON → protobuf, 합의에 치명적). SDK 0.6.0 이하로 빌드된 하이브리드
트랜잭션은 CheckTx에서 tx 파싱 오류로 실패합니다 — 0.6.1+로 업그레이드하세요.
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

### 온체인 사전 조건

하이브리드 트랜잭션이 온체인에서 PQC 검증을 통과하려면, 서명자의 PQC 공개 키가
체인의 `MsgRegisterPQCKey`를 통해 **등록**되어 있어야 합니다 — *단*,
`includePqcPublicKey: true`를 설정하면 키가 확장에 포함되어 체인이
첫 사용 시 자동으로 등록할 수 있습니다.

### 하이브리드 tx 계약 (개요)

트랜잭션은 표준 서명 바이트(PQC 확장을 **제외**함)에 대해 클래식 방식으로
서명되고, ML-DSA-87 서명이 계산되어 `PQCHybridSignature` 확장으로 첨부됩니다.
클래식 서명 바이트가 확장을 제외하기 때문에, 검증자가 PQC 부분을 이해하든
못하든 클래식 서명은 유효하게 유지됩니다. 하위 수준 헬퍼
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`)와 엔드 투 엔드
빌더(`buildHybridTx`, `signAndBroadcastHybrid`)가 고급 사용을 위해
내보내져 있습니다.

> 하이브리드 트랜잭션 제출은 라이브 네트워크에서 cosmos 트랜잭션의 필수
> 경로입니다. 로컬 서명/검증 프리미티브와 tx 빌드 헬퍼는 지금 바로
> 사용할 수 있습니다.

## PQC 키 로테이션

SDK 0.7.0부터 계정은 자신의 ML-DSA-87 키를 **동일한 알고리즘**의 새 키로
로테이션할 수 있습니다 — 표준적으로는 레거시 `shake256(mnemonic)` 키를
주소 바인딩된 `shake256("qorechain:pqc:v1|addr|mnemonic")` 키로 마이그레이션하는
것으로, `rotatePqcKeyMsgFromMnemonic`을 통해 수행합니다(두 키 모두 로테이션
바이트에 이중 서명). 전체 예제는 인증자 가이드의
[키 로테이션](/sdk/guides/authenticators#key-rotation)을 참조하세요.

## 알고리즘 식별자

SDK는 프로토콜 수준 작업을 위한 알고리즘 ID와 헬퍼를 내보냅니다:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)`, `isSignatureAlgorithm(id)`.
