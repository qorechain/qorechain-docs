---
slug: /sdk/concepts/accounts-pqc
title: Accounts & PQC Signing
sidebar_label: Accounts & PQC
sidebar_position: 2
---

# 계정 및 PQC 서명

QoreChain 계정은 하나의 BIP-39 니모닉에서 파생됩니다. 두 가지 계정 모델이 있으며,
둘 다 완전히 지원됩니다:

- **레인별 HD 파생 (레거시/기본값)** — 동일한 니모닉이 독립적인 파생 경로를 통해
  네이티브(코인 타입 118), EVM(코인 타입 60), SVM(코인 타입 501) 계정을 생성합니다.
  세 개의 키, 세 개의 주소입니다.
- **통합 eth-네이티브 계정** (SDK 0.6.0, 체인 v3.1.83) — 하나의
  `eth_secp256k1` 키가 세 가지 주소 인코딩 모두로 표현되는 하나의 20바이트
  아이덴티티이며, 잔액은 하나로 공유됩니다. [통합 계정](#unified-accounts)을
  참고하세요.

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

니모닉은 키가 파생되기 전에 (단어와 체크섬 모두) 검증되므로, 오타가 있으면
잘못된 계정을 조용히 생성하는 대신 오류가 발생합니다. `validateMnemonic(mnemonic)`으로
명시적으로 검증할 수도 있습니다.

### 파생 방식

| 유형 | 곡선 | 경로 | 주소 |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))`의 bech32 `qor` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32바이트 공개키의 base58 |

계정 인덱스를 전달하여 추가 계정을 파생할 수 있습니다. TypeScript에서는:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust에서는 인덱스가 위치 인자입니다
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Known-answer 참고 사항

파생 방식은 결정론적이며 네 개 SDK 전체에 걸쳐 known-answer 테스트로
검증되므로, 동일한 니모닉은 TypeScript, Python, Go, Rust에서 동일한 주소를
생성합니다. 따라서 한 언어에서 파생한 값을 다른 언어에서 검증할 수 있습니다.

> 이 레인별 파생(코인 타입 118의 `deriveNativeAccount`, 그리고
> `deriveEvmAccount` / `deriveSvmAccount`)은 **레거시/기본값** 모델이며
> 계속 지원되고 변경되지 않습니다. 아래의 통합 계정은 추가적인, 선택적
> 아이덴티티 모델입니다.

## 통합 계정 (eth-네이티브) {#unified-accounts}

SDK **0.6.0**(체인 v3.1.83) 이후, `deriveUnifiedAccount(mnemonic, index = 0)`은
이더리움 HD 경로 `m/44'/60'/0'/0/{index}`에서 하나의 `eth_secp256k1` 키를
파생하며, 이 키의 20바이트 주소(`keccak256(pubkey)[12:]`)는 동일한 아이덴티티를
세 가지 방식으로 나타냅니다:

| 레인 | 인코딩 |
| --- | --- |
| Native | `qor` 접두사가 붙은 bech32 (`qor1…`) |
| EVM | `0x` + EIP-55 대소문자 혼합 체크섬 헥스 |
| SVM | 12개의 0바이트로 오른쪽 패딩된 20바이트의 base58 (32바이트) |

세 레인 중 **어느 것**에 예치하든 **하나**의 잔액으로 합쳐지며, 이 키는
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

`unifiedAccountFromSeed(seed32)`는 32바이트 원시 secp256k1 개인키로부터
동일한 작업을 수행합니다.

### PQC 시드 파생

계정의 ML-DSA-87 키쌍은 결정론적으로 파생되며 **주소에 결속**됩니다:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

따라서 `{ address, mnemonic }`으로부터 복구할 수 있으며 QoreChain의 모든
언어 SDK에서 동일합니다. (`unifiedAccountFromSeed`의 경우, 니모닉 자리는
`"seed:" + hex(seed32)`입니다.)

### eth 키로 Native 레인에서 전송하기

통합 계정은 `eth_secp256k1` 스킴으로 Native 경로 트랜잭션에 서명합니다.
클래식 서명은 SignDoc 바이트의 (sha256이 아닌) **keccak256**에 대한
secp256k1 서명이며, `SignerInfo`의 공개키는 타입 URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`를 사용합니다. 하이브리드 경로
(`signHybridEth`)는 추가로 ML-DSA-87 `PQCHybridSignature` 확장을
첨부하며, 이는 라이브 네트워크에서 필수입니다:

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

더 낮은 수준의 제어가 필요하면, `signHybridEth(params)` / `signClassicalEth(params)`가
조립된 `TxRaw` 바이트와 서명 아티팩트를 반환하며, `accountAuthInfo(baseAccount)`는
온체인 공개키가 `eth_secp256k1` 타입 URL을 사용하는 계정으로부터
`account_number` / `sequence`를 읽습니다. 클래식 전용 경로는 일회성이며
부트스트랩 예외인 `MsgRegisterPQCKeyV2`를 위한 것입니다. 그 외에는 모두
하이브리드를 사용하세요.

:::caution 하이브리드 트랜잭션을 위해 SDK 0.6.1 이상으로 업그레이드하세요
SDK **0.6.1**은 합의에 중요한 인코딩 버그를 수정했습니다:
`/qorechain.pqc.v1.PQCHybridSignature` 트랜잭션 본문 확장이 `Any.value`에
JSON으로 직렬화되어 있었고, 체인이 **CheckTx 단계에서 이러한 트랜잭션을
거부**했습니다(트랜잭션 파싱 오류). 이제 다섯 개 언어 모두에서
프로토버프로 인코딩됩니다(확장 값은 `0x08`로 시작). eth-네이티브 레인을
포함하여 SDK 0.6.0 이하로 빌드된 모든 하이브리드 트랜잭션은 온체인에서
거부됩니다. 0.6.1 이상으로 업그레이드하세요.
:::

### Phantom(P1a): 키를 내보내지 않는 통합 계정

`connectPhantomUnified()`(TypeScript)는 결정론적 Phantom 서명으로부터
정규적이고 **비수탁형**인 통합 계정을 파생합니다. 사용자는 Phantom의
ed25519 키로 고정된, 도메인 분리된 메시지에 서명하고,
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

파생된 계정은 Phantom의 ed25519 키와는 별개의 정규 키입니다. Phantom은
파생된 secp256k1/PQC 비밀값을 결코 보지 않습니다. Phantom 키 자체가
한도 내에서 계정으로부터 지출하도록 허용하려면
[Authenticators & delegated spending](/sdk/guides/authenticators)를
참고하세요.

## 양자내성암호(PQC)

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
`ML_DSA_87_SEED_LENGTH`)를 사용하여 버퍼 크기를 검증할 수 있습니다.

> 내부적으로 PQC 프리미티브는
> [**qorechain-pqc**](/developer-guide/post-quantum-signing)에서 제공됩니다.
> 이는 감사받은 FIPS-204/203/202 구현을 여섯 개 언어(JavaScript/TypeScript,
> Rust, Go, C, Python, Java)에서 하나의 일관된 API로 감싸는 오픈소스,
> 표준 전용 라이브러리입니다. SDK 밖에서 원시 프리미티브나
> `hybridSignBytes` 프레이밍이 필요할 때는 이를 직접 사용하세요.

### 교체 가능한 서명자(Pluggable signers)

조합을 위해 SDK는 `Signer` 추상화와 `PqcSigner`, `HybridSigner` 구현,
그리고 `SignatureMode` 열거형을 제공합니다. 프리미티브를 직접 호출하는
대신 PQC 서명을 자신의 흐름에 연결하고 싶을 때 이를 사용하세요.

## 하이브리드 서명 {#hybrid-signing}

**하이브리드** 트랜잭션은 클래식 secp256k1 서명과 ML-DSA-87 서명을 모두
포함하므로, 클래식 검증 하에서도 유효하게 유지되면서 양자내성 보호를
추가로 얻습니다. 양자내성 부분은 트랜잭션의 `PQCHybridSignature` 확장으로
전달됩니다.

:::caution Native 경로에서는 하이브리드 서명이 필수입니다
현재 체인 버전(**v3.1.95**) 기준으로, 네트워크 기본값은
`hybrid_signature_mode = required`이며 `allow_classical_fallback = false`입니다.
`buildHybridTx`(`includePqcPublicKey` 사용)를 통한 하이브리드 서명 —
또는 통합 eth-네이티브 계정의 경우 `signHybridEth` — 는 Native 경로
트랜잭션에서 **필수**이며, 클래식 서명만 사용한 Native 트랜잭션은
온체인에서 거부됩니다. EVM 트랜잭션은 별도의 `eth_secp256k1` 경로를
사용하며 영향을 받지 않습니다.
:::

:::caution SDK 0.6.0 이하의 하이브리드 트랜잭션은 거부됩니다
0.6.1 릴리스는 `PQCHybridSignature` 확장의 인코딩을 수정했습니다(JSON →
프로토버프, 합의에 중요한 변경). SDK 0.6.0 이하로 빌드된 하이브리드
트랜잭션은 CheckTx에서 트랜잭션 파싱 오류로 실패합니다 — 0.6.1 이상으로
업그레이드하세요.
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

하이브리드 트랜잭션이 온체인에서 PQC 검증을 통과하려면, 서명자의 PQC
공개키가 체인의 `MsgRegisterPQCKey`를 통해 **등록**되어 있어야 합니다 —
단, `includePqcPublicKey: true`를 설정한 경우는 예외입니다. 이 경우
확장에 키가 포함되어 체인이 첫 사용 시 자동으로 등록할 수 있습니다.

### 하이브리드 트랜잭션 계약 (개요)

트랜잭션은 표준 서명 바이트(PQC 확장을 **제외**함)에 대해 클래식 방식으로
서명되며, ML-DSA-87 서명이 계산되어 `PQCHybridSignature` 확장으로
첨부됩니다. 클래식 서명 바이트가 확장을 제외하기 때문에, 검증자가 PQC
부분을 이해하든 아니든 클래식 서명은 유효하게 유지됩니다. 저수준
헬퍼(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`)와 엔드투엔드
빌더(`buildHybridTx`, `signAndBroadcastHybrid`)는 고급 사용을 위해
내보내집니다.

> 하이브리드 트랜잭션 제출은 코스모스 트랜잭션에 대해 라이브 네트워크에서
> 필수 경로입니다. 로컬 서명/검증 프리미티브와 트랜잭션 빌딩 헬퍼는 현재
> 사용 가능합니다.

## PQC 키 회전

SDK 0.7.0 이후로 계정은 ML-DSA-87 키를 **동일한 알고리즘**의 새 키로
회전할 수 있습니다 — 레거시 `shake256(mnemonic)` 키를 주소에 결속된
`shake256("qorechain:pqc:v1|addr|mnemonic")` 키로 정규적으로
마이그레이션하는 것이며 — `rotatePqcKeyMsgFromMnemonic`를 통해
수행됩니다(두 키가 회전 바이트에 이중 서명합니다). 전체 예제는
Authenticators 가이드의
[키 회전](/sdk/guides/authenticators#key-rotation)을 참고하세요.

## 알고리즘 식별자

SDK는 프로토콜 수준 작업을 위한 알고리즘 ID와 헬퍼를 내보냅니다:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)`, `isSignatureAlgorithm(id)`.
