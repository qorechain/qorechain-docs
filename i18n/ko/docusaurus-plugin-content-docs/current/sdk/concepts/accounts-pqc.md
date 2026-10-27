---
slug: /sdk/concepts/accounts-pqc
title: 계정 및 PQC 서명
sidebar_label: 계정 및 PQC
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

니모닉은 키가 파생되기 전에 (단어와 체크섬 **모두**) 검증되므로, 오타가 있으면
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
모든 레인에서 서명자가 됩니다(EVM 레인에서는
[승인 창](/sdk/guides/evm#evm-window) 안에서만 가능하며, SVM 트랜잭션 레인은
현재 네트워크 전체에서 비활성화되어 있어 SVM은 오늘 기준으로 읽기 전용입니다):

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
`"seed:" + hex(seed32)`입니다.) SDK 0.8.3부터
`derivePqcCanonical(account, mnemonic)`은 먼저 `account`를 소문자 `qor1…`
형태(`canonicalAccount`)로 정규화하므로, 대문자 bech32나 같은 계정의 `0x`
형태도 동일한 키를 생성합니다.
모든 언어에 같은 함수가 있으며(Python `derive_pqc_canonical`, Go
`authenticator.DerivePQCCanonical`, Rust `try_derive_pqc_canonical`, Java
`Authenticator.derivePqcCanonical`; [하이브리드 서명 가이드의
표](/sdk/guides/quantum-safe#canonical-derivation) 참고), 같은
`{ address, mnemonic }`은 모든 언어에서 같은 키를 생성합니다(2026년 10월에
TypeScript, Python, Go, Rust에 대해 확인).

### eth 키로 Native 레인에서 전송하기

통합 계정은 `eth_secp256k1` 스킴으로 Native 경로 트랜잭션에 서명합니다.
클래식 서명은 SignDoc 바이트의 (sha256이 아닌) **keccak256**에 대한
secp256k1 서명이며, `SignerInfo`의 공개키는 타입 URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`를 사용합니다. 하이브리드 경로
(`signHybridEth`, 또는 기본 `signMode: "hybrid"`의 `EthNativeSigner`)는
추가로 ML-DSA-87 `PQCHybridSignature` 확장을 첨부하며, 이는 라이브
네트워크에서 필수입니다.

첫 하이브리드 전송 전에 두 가지가 필요합니다. 첫째, 계정의 ML-DSA-87
키가 (한 번) **등록**되어 있어야 합니다. 등록은 클래식 서명으로 보내는,
하이브리드가 면제되는 유일한 트랜잭션입니다. `signMode: "classical"`로
서명하세요. 계정의 `publicKey`는 `0x` 헥스 문자열이므로 `ecdsaPubkey`에
넘기려면 바이트로 디코딩하세요. 둘째, 네트워크가 어떤
[서명 바이트 형식](#sign-bytes-versions)을 검증하는지 서명자가 물어볼 수
있도록 `rest`를 서명자에 전달하세요(`qorechain-vladi`와 `qorechain-diana`에서는
추측하는 대신 예외를 발생시킵니다). SDK 0.8.1 이상(소유 증명 헬퍼는
0.9.0)과 `npm i @cosmjs/stargate`가 필요합니다:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

더 낮은 수준의 제어가 필요하면, `signHybridEth(params)` / `signClassicalEth(params)`가
조립된 `TxRaw` 바이트와 서명 아티팩트를 반환하며, `accountAuthInfo(baseAccount)`는
온체인 공개키가 `eth_secp256k1` 타입 URL을 사용하는 프로토버프 `BaseAccount`로부터
`account_number` / `sequence`를 읽습니다(REST JSON 계정은 위의 `authInfo`처럼
먼저 필드를 매핑해야 합니다).

:::caution 하이브리드 트랜잭션을 위해 SDK 0.6.1 이상으로 업그레이드하세요
SDK **0.6.1**은 합의에 중요한 인코딩 버그를 수정했습니다:
`/qorechain.pqc.v1.PQCHybridSignature` 트랜잭션 본문 확장이 `Any.value`에
JSON으로 직렬화되어 있었고, 체인이 **CheckTx 단계에서 이러한 트랜잭션을
거부**했습니다(트랜잭션 파싱 오류). 이제 다섯 개 언어 모두에서
프로토버프로 인코딩됩니다(확장 값은 `0x08`로 시작). eth-네이티브 레인을
포함하여 SDK 0.6.0 이하로 빌드된 모든 하이브리드 트랜잭션은 온체인에서
거부됩니다. 0.6.1 이상으로 업그레이드하세요.
:::

### Phantom 및 기타 외부 지갑 {#phantom}

:::danger SDK 0.8.0에서 제거됨
SDK 0.6.0부터 0.7.0까지는 `connectPhantomUnified()`와 `unifiedAccountFromPhantomSignature()`(0.8.0에서 제거, Python과 Rust는 `unified_account_from_phantom_signature`, Go는 `unified.UnifiedAccountFromPhantomSignature`, Java는 `UnifiedAccounts.unifiedAccountFromPhantomSignature`)를 제공했으며, 이 함수들은 고정 메시지 `QoreChain unified account derivation v1`와 지갑의 base58 공개키에 대한 Phantom 서명으로부터 계정의 지출 키를 파생했습니다.
ed25519 서명은 결정론적이고 어떤 웹사이트든 지갑에 같은 메시지 서명을 요청할 수 있으므로, 그 서명을 한 번이라도 얻은 사람은 계정의 secp256k1 키와 ML-DSA 키를 재구성할 수 있습니다. 두 함수는 이제 오류를 발생시킵니다.

이 방식으로 계정을 만들었다면 지금 바로 유출된 것으로 간주하세요. 새 니모닉으로 계정을 만들어 자금을 옮긴 뒤, Phantom을 새 계정에 인증자로 연결하세요(아래 참고). 기존 계정은 복구할 수 없습니다. 주소가 노출된 키에 묶여 있고, PQC 키 로테이션은 포스트 퀀텀 부분만 교체하기 때문입니다. SDK 0.8.2 이상을 사용하세요.
:::

Phantom(또는 MetaMask) 키로 계정에서 지출하게 하려면 **인증자 레인**을 사용하세요. 지갑 키를 `MsgRegisterAuthenticator`로 등록한 다음, 권한과 `SpendingRule` 범위 안에서 `MsgExecuteCosmos` / `MsgExecuteEVM`으로 정식 PQC 계정에서 지출합니다. 계정은 니모닉에서 파생한 자체 키를 유지하며, 지갑 키는 언제든 취소할 수 있습니다. [인증자 & 위임 지출](/sdk/guides/authenticators)을 참고하세요. 참고로 이 레인을 제공하는 `abstractaccount` 모듈은 메인넷에서 꺼져 있으므로(`GET /qorechain/abstractaccount/v1/config`가 `enabled: false`를 표시하며, 테스트넷에서는 켜져 있습니다) 메인넷에서는 아직 지갑 키를 연결할 수 없습니다. 그때까지는 새 니모닉 계정을 직접 사용하세요.

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
그리고 `SignatureMode` 타입(`"classical" | "pqc" | "hybrid"`)을 제공합니다.
프리미티브를 직접 호출하는 대신 PQC 서명을 자신의 흐름에 연결하고 싶을 때
이를 사용하세요.

## 하이브리드 서명 {#hybrid-signing}

**하이브리드** 트랜잭션은 클래식 secp256k1 서명과 ML-DSA-87 서명을 모두
포함하므로, 클래식 검증 하에서도 유효하게 유지되면서 포스트 퀀텀 보호를
추가로 얻습니다. 포스트 퀀텀 부분은 트랜잭션의 `PQCHybridSignature` 확장으로
전달됩니다.

:::caution Native 경로에서는 하이브리드 서명이 필수입니다
체인 버전 **v3.2.0**(메인넷은 v3.2.4, 테스트넷은 v3.2.6 실행 중) 이후, 네트워크
기본값은 `hybrid_signature_mode = required`이며
`allow_classical_fallback = false`입니다. `buildHybridTx` /
`signAndBroadcastHybrid`(`rest` 전달)를 통한 하이브리드 서명 —
또는 통합 eth-네이티브 계정의 경우 `signHybridEth` / `EthNativeSigner` — 는
Native 경로 트랜잭션에서 **필수**이며, 클래식 서명만 사용한 Native 트랜잭션은
온체인에서 거부됩니다. EVM 트랜잭션은 별도의 레인이지만, v3.2.0부터는
등록된 ML-DSA-87 키가 있고
[승인 창](/sdk/guides/evm#evm-window)이 열려 있는 계정에서만 허용됩니다.
:::

:::caution SDK 0.6.0 이하의 하이브리드 트랜잭션은 거부됩니다
0.6.1 릴리스는 `PQCHybridSignature` 확장의 인코딩을 수정했습니다(JSON →
프로토버프, 합의에 중요한 변경). SDK 0.6.0 이하로 빌드된 하이브리드
트랜잭션은 CheckTx에서 트랜잭션 파싱 오류로 실패합니다 — 0.6.1 이상으로
업그레이드하세요.
:::

코인 타입 118 계정을 위한 엔드투엔드 빌더는 `signAndBroadcastHybrid`
(브로드캐스트 없이 빌드만 하려면 `buildHybridTx`)입니다. 클래식 서명자,
계정의 ML-DSA-87 키쌍, 계정 번호와 시퀀스, 그리고 `rest`가 필요합니다.
TypeScript의 코인 타입 118 계정에서 가장 짧은 경로는 하이브리드
`TxClient`(SDK 0.9.0)입니다. 연결할 때 키쌍을 전달하면 모든 트랜잭션이
하이브리드로 서명되며, `fee: "auto"`는 하이브리드 트랜잭션 자체를
시뮬레이션합니다(등록만은 클래식으로 유지됩니다):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

수수료, 계정 번호, 시퀀스를 직접 제어하려면 `signAndBroadcastHybrid`를
사용하세요(SDK 0.8.1 이상, `npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### 온체인 전제 조건

하이브리드 트랜잭션이 PQC 검증을 통과하려면, 서명자의 PQC 공개키가
`MsgRegisterPQCKeyV2`(클래식 서명, 하이브리드 면제)로 **등록**되어 있어야
합니다. SDK의 `ensurePqcRegistered` / `buildRegisterPqcKeyMsg`,
`qorechaind tx pqc register-key`, 또는 QoreChain 지갑이 이를 수행합니다.
`includePqcPublicKey: true`는 확장에 키를 포함시킬 뿐이며 키를 등록하지
**않습니다**. 체인은 첫 사용 시 키를 자동으로 등록하지 않습니다. v3.2.3부터
체인은 약하거나 퇴화한 키, 재사용된 키를 거부하며 선택적 소유 증명을
받아들입니다([키 무결성 규칙](/architecture/post-quantum-security#key-integrity)
참고). SDK 0.9.0에서 `ensurePqcRegistered`는 네트워크가 v3.2.3을 적용한 뒤에는
증명을 자동으로 첨부하며, 직접 구성하는 등록을 위해
`signProofOfPossession` / `verifyProofOfPossession`이 내보내집니다. 0.8.x
빌더는 증명 없이 등록하며, 이는 허용됩니다.

### 어떤 서명 바이트 형식인가? {#sign-bytes-versions}

하이브리드 트랜잭션의 ML-DSA-87 부분은 두 가지 바이트 형식 중 하나에 대해
서명되며, 네트워크는 어느 높이에서든 정확히 하나만 검증합니다:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0`은 PQC 확장을 제외한 트랜잭션 본문이고 `A`는 `AuthInfo` 바이트입니다.
`qorechain-vladi`와 `qorechain-diana`는 둘 다 **v2**를 검증합니다. 전환은
메인넷에서는 업그레이드 이름 `v3.2.0`으로, 테스트넷에서는 `v3.1.98`(이후
`v3.2.0`)로 기록되었으므로, 클라이언트는 **두** 이름 모두에 대해
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}`을 조회하고 어느 한쪽의
높이가 0보다 크면 v2를 사용해야 합니다. SDK가 이를 대신 처리합니다. 모든
하이브리드 빌더는 `signBytesVersion`(기본값 `"auto"`, 또는 `"v1"` / `"v2"`)을
받으며, 이 두 체인에서 `"auto"`는 네트워크의 REST URL(`rest`)이 필요합니다.
추측하는 대신 예외를 발생시킵니다. 고수준 경로는 체인이 `pqc` 코드 21로
서명을 거부하면 다시 확인한 뒤 한 번 재시도합니다. 단위 테스트에서는 테스트가
라이브 노드에 의존하지 않도록 `signBytesVersion`을 명시적으로 전달하세요.
[코드 21 문제 해결](/developer-guide/post-quantum-signing#code-21)도
참고하세요.

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
