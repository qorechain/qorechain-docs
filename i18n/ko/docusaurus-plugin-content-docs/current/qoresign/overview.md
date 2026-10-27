---
slug: /qoresign/overview
title: QoreSign 개요
sidebar_label: 개요
sidebar_position: 1
---

# QoreSign

QoreSign은 지갑, 거래소, 수탁 기관, 백엔드를 위해 QoreChain에서 하이브리드 secp256k1 + ML-DSA-87(FIPS 204) 서명을 제공하는 오픈소스 라이브러리입니다.

QoreSign을 사용하면 QoreChain 자체 지갑이 아닌 지갑도 계정의 ML-DSA-87 키를 파생하고, 두 키로 Native 레인 트랜잭션에 서명하고, 하이브리드 서명을 로컬에서 검증하고, 임의의 메시지에 서명하고, 서명 전에 트랜잭션을 시뮬레이션하고, 커밋된 트랜잭션이 어떻게 보호되었는지 다시 읽어 오고, Sign In With QoreChain을 구현할 수 있습니다. QoreSign은 [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) 바인딩 위에 놓인 얇은 계층이며, 자체 암호 프리미티브를 추가하지 않습니다. QoreChain Association이 Apache-2.0 라이선스로 유지 관리합니다.

현재 릴리스는 **0.1.1**(2026년 10월 27일)입니다. TypeScript, Rust, Go, Kotlin(JVM 및 Android), Swift로 게시되어 있으며, 0.1.1에서 새로 Python이 추가되었습니다. 소스, 예제, 테스트 벡터는 [qorechain/qoresign](https://github.com/qorechain/qoresign) 저장소에 있습니다. 메인넷(`qorechain-vladi`)과 테스트넷(`qorechain-diana`)에서 동작합니다.

## 레인별 QoreSign의 기능 {#lanes}

| 레인 | 현재 QoreSign이 하는 일 |
|---|---|
| **Native** (Cosmos SDK) | 하이브리드 서명 및 검증. 네트워크는 기본적으로 ML-DSA-87 서명을 요구합니다. |
| **EVM** | 승인 윈도우만 지원: 계정이 ML-DSA-87 키를 등록하고 Native 레인에서 제한된 승인 윈도우를 엽니다. Ethereum 트랜잭션 자체에는 ML-DSA-87 서명이 포함되지 않습니다. |
| **SVM** | 아직 네트워크에서 열리지 않았습니다(`LANE_NOT_AVAILABLE`). |

하이브리드 EVM 서명을 사용하려면 먼저 네트워크에서 레인별 PQC 지원이 필요합니다.
[EVM 지갑: 승인 윈도우](/qoresign/guides/evm-quantum-ready)를 참고하세요.

## 기능 {#what-it-does}

오프라인 코어이며 모든 언어에서 동일합니다.

- `m/44'/118'/0'/0/0`에서 클래식 키를 파생하고(`deriveClassicalKey`), QoreChain 지갑이 계정에 등록하는 표준 ML-DSA-87 키를 파생합니다(`deriveCanonicalPqKey`, 니모닉과 주소에 묶여 있음). 하드닝된 HD 파생은 초안으로 제공되며(`deriveHdPqKey`), `pqKeyFromSeed`는 32바이트 시드에서 키 쌍을 다시 만듭니다.
- `secp256k1` 및 `eth_secp256k1` 계정의 `qor1` 주소를 만들고 파싱합니다.
- 두 키로 Native 레인 트랜잭션에 서명하거나(`signHybrid`), dApp이 만든 본문에 ML-DSA-87 계층만 추가합니다(`signPqLayer`). ML-DSA-87 서명은 기본적으로 결정적이며, 헤지(hedged) 서명은 옵션이고 네트워크는 둘 다 받아들입니다. secp256k1은 low-S를 적용한 RFC 6979를 사용합니다.
- 하이브리드 sign-bytes v1과 v2를 계산하고(`hybridSignBytes`), 전체 하이브리드 트랜잭션(`verifyHybridTx`) 또는 ML-DSA-87 계층만(`verifyPqLayer`) 검증합니다.
- 소유 증명이 포함된 `MsgRegisterPQCKeyV2`를 만들고(`buildRegisterPqKeyMessage`, `signProofOfPossession`) 퇴화된 공개 키를 거부합니다.
- 임의의 메시지에 서명하고 검증하며(`signMessage`, `verifyMessage`), Sign In With QoreChain v1을 구현합니다(`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- 레인 규칙을 코드로 적용합니다(`decideLane`, `assertHybridLane`, `evaluateLayerState`). 오류는 모든 언어가 공유하는 안정적인 코드를 가집니다(`QoreSignError`, 예: `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

네트워크 헬퍼(TypeScript `@qorechain/qoresign/network`, Go `github.com/qorechain/qoresign/go/network`에는 새로 추가된 두 가지를 제외한 모두가 있음):

- `fetchPqKeyStatus`: 주소에 ML-DSA-87 키가 등록되어 있는지, 있다면 어떤 키인지.
- `resolveSignBytesVersion`: 네트워크가 검증하는 sign-bytes 형식.
- `simulateTx`(사용된 가스, 권장 가스 한도, 주소별 잔액 변화), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`(네트워크가 첫 번째 형식을 거부하면 다른 sign-bytes 형식으로 한 번 재시도).
- `assertPqLayerMatchesRegisteredKey`: 지갑이 클래식 서명을 추가하기 전에, dApp이 제공한 계층을 체인에 있는 키와 대조합니다.
- `verifySiwqWithChain` 및 `verifyMessageWithChain`: 체인에 등록된 키를 기준으로 한 검증.
- `fetchCommittedExtensionTypeUrls`: 커밋된 트랜잭션이 어떤 확장을 담았는지 읽어 옵니다.
- 0.1.1에서 새로 추가됨, TypeScript 전용: 아래에서 설명하는 `inspectTransaction`과 `fetchEvmWindow`.

## 0.1.1의 새로운 기능 {#new-in-0-1-1}

- **Python.** `qorechain-qoresign` 패키지(import `qoresign`)가 PyPI에 있으며 macOS와 Linux용 wheel을 제공합니다. Rust 구현을 바인딩하며 동일한 테스트 벡터를 재현합니다. Swift 및 Kotlin 바인딩처럼 오프라인 전용이며 네트워크 헬퍼는 없습니다.
- **트랜잭션 인스펙터(라이브러리).** `inspectTransaction`은 커밋된 트랜잭션을 읽고 어떻게 보호되었는지 보고합니다. [트랜잭션 인스펙터](#inspector)를 참고하세요.
- **EVM 윈도우 리더.** `fetchEvmWindow`는 계정의 EVM 승인 윈도우를 읽습니다.
- **패키징 수정.** Swift 바이너리 프레임워크 아카이브에 더 이상 불필요한 리소스 포크 폴더가 들어 있지 않으며, Kotlin 및 Python 패키지의 macOS 네이티브 라이브러리는 더 이상 빌드 디렉터리를 설치 이름으로 기록하지 않습니다.

## 트랜잭션 인스펙터 {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })`는 `@qorechain/qoresign/network`의 읽기 전용 함수입니다. 커밋된 트랜잭션을 가져와 다음을 반환합니다.

- 메시지, 메모, 결과 코드, 높이, 수수료.
- 서명자: 주소, 키 유형, 공개 키, 시퀀스.
- 클래식 서명이 검증되는지 여부.
- ML-DSA-87 계층의 상태: 존재 여부, 계층 수, 서명자가 현재 등록한 키에 대해 계층이 검증되는지 여부, 사용된 sign-bytes 형식.
- 공개 익스플로러와 동일한 분류를 사용하는 보안 등급: `pqc`(ML-DSA-87 계층을 포함), `enrollment`(ML-DSA-87 키를 등록하거나 교체하며, 설계상 클래식 키로 서명됨), `shake`(계층이 없는 Native 레인 트랜잭션) 또는 `classical`(EVM 레인 트랜잭션).

네트워크가 모르는 해시에는 `undefined`를 반환합니다. 노드에서 커밋된 정확한 바이트를 읽으려면 `rpc` 엔드포인트를 전달하세요. 전달하지 않으면 REST 게이트웨이가 다시 인코딩한 바이트를 사용합니다. 아무것도 전송하지 않으며 계정이나 키가 필요하지 않습니다.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

`inspect.mjs`로 저장하고 테스트넷 트랜잭션 해시를 넣어 `node inspect.mjs <txhash>`로 실행하세요. 테스트넷의 최근 faucet 전송에 대해 실행하자 `ML-DSA-87 key registered: true`, 등급 `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, 메시지 `/cosmos.bank.v1beta1.MsgSend`, `EVM window: false false`가 출력되었습니다.

`fetchEvmWindow({ rest, address })`는 `found`, `live`, 시작 및 만료 높이, 최대 및 사용된 트랜잭션 수와 값, 남은 블록, 트랜잭션, 값, `nativeOnly`, `allowedTargets`를 반환합니다.

이것은 라이브러리 함수입니다. 대시보드 [개발자](/dashboard/developers#inspector) 페이지에는 이를 사용하는 트랜잭션 인스펙터 탭이 있습니다. 트랜잭션 해시를 붙여 넣으면 코드를 작성하지 않고도 결과를 읽을 수 있습니다.

## 사용 용도 {#use-cases}

1. **Keplr 호환 지갑에 QoreChain 하이브리드 서명 추가.** Leap, Cosmostation 또는 새 지갑은 `signDirect`로 secp256k1 서명을 만듭니다. QoreSign을 사용하면 같은 니모닉에서 계정의 ML-DSA-87 키를 파생하고 서명 전에 계층을 추가합니다(`signPqLayer`). [지갑 가이드](/qoresign/guides/keplr-compatible-wallets)를 참고하세요.
2. **거래소 또는 수탁 기관이 자체 서버에서 출금에 서명.** Go 또는 Rust로 된 핫 또는 웜 지갑 서비스가 `signHybrid`로 Native 레인 전송에 서명하고, 먼저 시뮬레이션(`simulateTx`, Go 및 TypeScript)하여 잔액 변화와 가스를 확인한 뒤 `submitWithSignBytesFallback`으로 브로드캐스트합니다. [커스터디 키트](/developer-tools/custody-kit)가 이를 기반으로 합니다.
3. **백엔드가 Sign In With QoreChain 구현.** 서버가 일회용 nonce를 발급하고, 지갑이 로그인 메시지에 서명하고, 서버가 `verifySiwqWithChain`을 호출합니다. [로그인 가이드](/qoresign/guides/sign-in)를 참고하세요.
4. **컴플라이언스 또는 지원 도구가 트랜잭션이 어떻게 보호되었는지 확인.** `inspectTransaction`은 커밋된 트랜잭션이 검증된 ML-DSA-87 계층을 포함했는지, 어떤 sign-bytes 형식을 사용했는지, 그리고 그 등급을 보고합니다.
5. **지갑이 EVM 계정의 승인 윈도우를 표시.** 사용자가 EVM 지갑에서 전송하기 전에 `fetchEvmWindow`가 윈도우가 열려 있는지, 트랜잭션 수와 값이 얼마나 남았는지 보여줍니다.
6. **Python 팀이 보고서나 승인에 서명.** `qoresign.sign_message`는 임의의 바이트에 대한 하이브리드 서명을 만들며, 다른 모든 QoreSign 언어가 이를 검증할 수 있습니다.
7. **iOS 또는 Android의 모바일 지갑.** Swift 패키지와 Android AAR은 TypeScript 패키지와 바이트 단위로 동일한 파생, 서명, 로그인을 제공합니다.
8. **감사자와 통합 담당자가 서명을 오프라인으로 검증.** `verifyHybridTx`, `verifyPqLayer`, `verifyMessage`는 공개 키만 있으면 네트워크 없이 실행됩니다.

## 동작 방식 {#how-it-works}

- **하이브리드 트랜잭션**은 같은 계정이 두 번 서명한 일반적인 Cosmos SDK `TxRaw`입니다. 하나는 확장 옵션 `/qorechain.pqc.v1.PQCHybridSignature`(알고리즘 id `1`)로 트랜잭션 본문에 담기는 ML-DSA-87 서명이고, 다른 하나는 최종 본문에 대한 secp256k1 `SIGN_MODE_DIRECT` 서명입니다.
- **Sign-bytes v2**(현재 두 공개 네트워크가 모두 검증)는 `"qorechain-pqc-hybrid-v2"`, 그다음 체인 id, PQC 확장을 제외한 본문, auth info이며 각각 길이 접두사가 붙습니다. 따라서 ML-DSA-87 서명은 수수료를 포함합니다. 클래식 서명은 확장을 포함한 최종 본문을 포함합니다. v1은 이전 서명을 재현하기 위해 유지됩니다. [하이브리드 트랜잭션 서명 v1](/qoresign/spec/hybrid-signing-v1)을 참고하세요.
- **순서:** 본문과 auth info를 인코딩하고, sign-bytes와 ML-DSA-87 서명을 계산하고, 확장을 추가한 다음, SignDoc에 secp256k1로 서명하고 브로드캐스트합니다.
- **등록:** `MsgRegisterPQCKeyV2`는 ML-DSA-87 공개 키, 계정의 압축된 secp256k1 키, 소유 증명을 담습니다. 등록 트랜잭션은 클래식 키만으로 서명합니다.
- **도메인 분리:** 모든 ML-DSA-87 서명은 예약된 접두사로 시작하므로, 메시지 서명이나 로그인 서명이 트랜잭션 서명으로 재사용될 수 없습니다.
- **체인에 있는 것:** 등록된 ML-DSA-87 공개 키, 하이브리드 트랜잭션, EVM 윈도우. 키, 서명, 검증은 QoreSign을 실행하는 기기나 서버에서 이루어집니다.
- **공유 테스트 벡터:** 와이어 포맷은 패키지와 별도로 버전이 관리되며, 모든 언어가 바이트 단위로 재현하는 [테스트 벡터](/qoresign/vectors)로 검증됩니다.

크기(FIPS 204 및 [크기 가이드](/qoresign/guides/sizes-and-transport)): ML-DSA-87 공개 키는 2,592바이트, 비밀 키는 4,896바이트, 서명은 4,627바이트, 시드는 32바이트입니다. 하이브리드 트랜잭션은 클래식 트랜잭션보다 약 4.7 KB 크므로 서명하기 전에 시뮬레이션하세요. 서명이나 공개 키는 정적 QR 코드 하나에 들어가지 않으므로, 에어갭 서명기는 멀티파트 QR이 필요합니다. 비밀 키가 아니라 32바이트 시드를 보관하세요.

## 패키지 {#packages}

| 언어 | 패키지 | 설치 | 최소 플랫폼 |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 이상, 브라우저 |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (라이브러리 이름 `qoresign`) | `cargo add qorechain-qoresign` | 안정(stable) Rust |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+, macOS 11+(arm64, x86_64) 및 Linux(x86_64, aarch64)용 wheel, 아직 Windows wheel 없음, 다른 플랫폼은 소스 배포판에서 빌드(Rust 1.95 필요) |
| Swift | [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign)의 `QoreSign` (GitHub 릴리스의 바이너리 프레임워크) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, 제품 `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 이상, macOS(arm64, x86-64), Linux(x86-64, arm64), Windows(x86-64)용 네이티브 라이브러리 |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 이상, `arm64-v8a`, `armeabi-v7a`, `x86_64`, R8 keep 규칙 포함 |

:::note Kotlin 컴파일러 버전
Kotlin 및 Android 아티팩트를 사용하려면 프로젝트에 **Kotlin 2.3 이상** 컴파일러가 필요합니다. Kotlin 2.1을 쓰는 프로젝트는 컴파일에 실패합니다. 의존성을 추가하기 전에 빌드의 Kotlin 버전을 올리세요.
:::

모든 구현은 동일한 [테스트 벡터](/qoresign/vectors)로 스스로를 검증합니다.

## 예제 {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

[빠른 시작](/qoresign/quickstart)은 같은 흐름을 오프라인으로 처음부터 끝까지 실행하며, Python과 Go용 메시지 서명 빠른 시작도 포함합니다.

## 주요 API {#main-api}

이름은 TypeScript 형식으로 표기합니다. Go는 같은 이름을 Go 표기(`SignHybrid`, `VerifySiwq`)로, Rust와 Python은 snake_case(`sign_hybrid`)로 사용하고, Swift와 Kotlin은 Rust 코어 위에서 camelCase를 사용합니다.

| 이름 | 기능 | 제공 언어 |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | 니모닉, 시드 또는 원시 바이트에서 키 생성 | 전체 |
| `deriveHdPqKey` | ML-DSA-87 키의 하드닝된 HD 파생(초안, 변경될 수 있음) | 전체 |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | `qor1` 주소 | 전체 |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | 하이브리드 서명 및 sign-bytes v1 또는 v2 | 전체 |
| `verifyHybridTx`, `verifyPqLayer` | 로컬 검증 | 전체 |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | 소유 증명을 포함한 키 등록 | 전체 |
| `signMessage`, `verifyMessage` | 임의 메시지 서명(ADR-36 및 ML-DSA-87) | 전체 |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | 전체 |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | 레인 규칙, 누락된 계층 감지 | 전체 |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | 네트워크 헬퍼 | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | 커밋된 트랜잭션 읽기, EVM 윈도우 읽기(0.1.1) | TypeScript |

Go에서 네트워크 헬퍼는 클라이언트의 메서드입니다. `client := network.NewClient("https://api-testnet.qore.host")`로 만든 뒤 `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` 또는 `client.SimulateTx(...)`를 호출합니다. Python 오류는 `code`와 `detail`을 가진 `QoreSignError`이며, 바이트 필드는 `bytes`입니다.

API 레퍼런스: 저장소를 클론한 뒤 `pnpm -C packages/ts docs`(TypeScript), `cargo doc -p qorechain-qoresign`(Rust) 또는 `go doc github.com/qorechain/qoresign/go`(Go)를 실행하세요. Swift, Kotlin, Python 바인딩은 Rust API를 그대로 따르므로 [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin), [Python](https://github.com/qorechain/qoresign/tree/main/python) README를 참고하세요.

## 네트워크와 요구 사항 {#networks}

| | 메인넷 | 테스트넷 |
|---|---|---|
| 체인 id | `qorechain-vladi` (EVM 체인 id 9801) | `qorechain-diana` (EVM 체인 id 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| 검증되는 sign-bytes | v2 | v2 |

- **Native 레인:** 네트워크는 기본적으로 ML-DSA-87 서명을 요구합니다. 예외: 계정의 ML-DSA-87 키 등록, 그리고 키가 없는 계정의 unjail. 하이브리드 트랜잭션이 검증되려면 계정에 키가 등록되어 있어야 하며(`MsgRegisterPQCKeyV2`), QoreChain 지갑은 계정을 만들 때 이를 등록합니다.
- **EVM 레인:** 등록된 ML-DSA-87 키가 있는 계정은 하이브리드 서명된 Native 레인 트랜잭션으로 제한된 승인 윈도우(만료 높이, 최대 트랜잭션 수, 최대 값, 선택적 허용 컨트랙트)를 엽니다. 열려 있는 윈도우 밖에서는 네트워크가 해당 계정의 EVM 트랜잭션을 거부합니다. 읽기와 가스 추정에는 윈도우가 필요하지 않습니다.
- **수수료:** 단위 `uqor`(소수 6자리), 최소 가스 가격은 가스당 0.1 uqor.
- **Keplr 등록 값:** bech32 접두사 `qor`, 코인 타입 `118`.
- **계정:** 오프라인 함수에는 필요하지 않습니다. 네트워크 헬퍼는 REST 엔드포인트만 있으면 되며, 브로드캐스트에는 ML-DSA-87 키가 등록된 자금이 있는 계정이 필요합니다.

## 문서 {#documentation}

- [빠른 시작](/qoresign/quickstart): 몇 분 안에 키를 파생하고 하이브리드
  트랜잭션에 서명하고 검증합니다.
- 가이드
  - [Keplr 호환 지갑에 하이브리드 서명 추가하기](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: 서버 검증](/qoresign/guides/sign-in)
  - [EVM 지갑: 승인 윈도우](/qoresign/guides/evm-quantum-ready)
  - [키 파생: 표준 키와 HD 초안](/qoresign/guides/key-derivation)
  - [크기와 전송](/qoresign/guides/sizes-and-transport)
- 명세
  - [하이브리드 트랜잭션 서명 v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [메시지 서명 v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87 키 파생](/qoresign/spec/hd-derivation-draft)
- [테스트 벡터](/qoresign/vectors)
- [예제](https://github.com/qorechain/qoresign/tree/main/examples)

## 범위와 한계 {#scope}

- QoreSign은 로컬에서 서명합니다. 사용자를 대신해 키를 보관하지 않으며, 임계값(threshold) 또는 MPC 서명을 지원하지 않고, 하드웨어 지갑에서의 서명도 지원하지 않습니다.
- 하이브리드 EVM 서명은 없습니다. `assertHybridLane("evm")`은 `LANE_NOT_AVAILABLE`을 던집니다. EVM 계정은 대신 승인 윈도우를 사용합니다. SVM 트랜잭션은 열려 있지 않습니다.
- Rust, Swift, Kotlin, Python에는 네트워크 코드가 없습니다. 계정 번호 조회, 시뮬레이션, 브로드캐스트는 앱에서 처리하거나 TypeScript 또는 Go 헬퍼를 사용하세요.
- `inspectTransaction`과 `fetchEvmWindow`는 TypeScript에만 있습니다. `inspectTransaction`은 서명자가 현재 등록한 키에 대해 계층을 검사하므로, 키 교체 후에는 이전 트랜잭션이 `verified: false`로 보고됩니다.
- 표준 파생에는 니모닉이 필요합니다. 니모닉이 없는 지갑(하드웨어에 보관된 키)은 무작위 키(`pqKeyFromSeed`)를 생성하거나 HD 초안을 사용하고, 그 키를 등록합니다. 니모닉은 표준 형식(소문자, 공백 하나)이어야 하며, 다른 표기는 정규화되지 않고 거부됩니다.
- HD 파생(`deriveHdPqKey`)은 초안이며 변경될 수 있습니다.
- Python에는 아직 Windows wheel이 없습니다. Kotlin과 Android에는 Kotlin 2.3 이상 컴파일러가 필요합니다.
- ML-DSA-87 및 secp256k1 구현은 `qorechain-pqc`(`@noble/post-quantum`, `fips204`, Cloudflare CIRCL 기반)와 `@noble/curves`, `k256`, `decred/secp256k1`에서 가져옵니다.

## 보안 참고 사항 {#security}

- 키는 QoreSign을 실행하는 프로세스 밖으로 나가지 않습니다. 네트워크 헬퍼를 호출하지 않는 한 아무것도 전송되지 않으며, 헬퍼도 공개 데이터(주소, 서명된 트랜잭션 바이트, 해시)만 보냅니다.
- 서명하기 전에 `bodyBytes`와 `authInfoBytes`의 메시지와 수수료를 사용자에게 보여주세요. ML-DSA-87 서명은 수수료를 포함합니다.
- dApp이 이미 PQC 계층을 담은 본문을 제공하면, 클래식 서명을 추가하기 전에 `assertPqLayerMatchesRegisteredKey`로 확인하세요. 브로드캐스트 후에는 `fetchCommittedExtensionTypeUrls`와 함께 `evaluateLayerState`를 쓰거나 `inspectTransaction`으로 계층이 체인에 도달했는지 확인합니다.
- 예약된 도메인 밖에서 ML-DSA-87 키로 원시 바이트에 서명하지 마세요.
- 로그인 nonce는 일회용입니다. `verifySiwq`는 `requirePq: false`를 전달하지 않는 한 ML-DSA-87 부분이 없는 로그인을 거부합니다. 서비스에 포스트 퀀텀 보장이 필요하지 않은 경우에만 클래식 전용 로그인을 허용하세요.
- 비밀 키가 아니라 32바이트 ML-DSA-87 시드를 암호화하여 보관하세요.
- 메인넷 니모닉을 스크립트나 셸 기록에 절대 넣지 마세요. 예제는 공개 BIP-39 테스트 문구(`abandon` 11번 뒤에 `about`)를 사용하며, 여기에는 절대 자금을 보내지 마세요.
- 취약점은 공개 이슈가 아니라 security@qore.network로 비공개 신고해 주세요. 보안 수정은 최신 마이너 버전에 반영됩니다.

## 게시 위치 {#where-published}

2026년 10월 27일에 각 레지스트리에서 확인한 버전입니다.

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go module proxy | `github.com/qorechain/qoresign/go` | v0.1.1 (태그 `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (macOS arm64 및 x86_64, Linux x86_64 및 aarch64 wheel, 소스 배포판) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `github.com/qorechain/qoresign`의 `QoreSign` | 0.1.1 (릴리스의 바이너리 `QoreSignFFI.xcframework.zip`) | [GitHub 릴리스](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

저장소: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (릴리스 v0.1.0 및 v0.1.1).

## 관련 페이지 {#related}

- [포스트 퀀텀 프리미티브(`qorechain-pqc`)](/developer-tools/pqc-library): QoreSign 아래에서 쓰이는 ML-DSA-87 프리미티브.
- [QoreChain SDK](/sdk/overview): 트랜잭션 컴포저, EVM 윈도우 메시지, 기능 감지.
- [지갑 어댑터](/developer-tools/wallet-adapter): 지갑을 바꿀 수 없을 때 dApp 쪽에서 쓰는 대안. dApp이 ML-DSA-87 키를 보유하고 변경되지 않은 지갑에 `signDirect`를 요청하며, 바이트는 QoreSign과 동일합니다.
- [QoreSeal](/developer-tools/qoreseal): 계정 대상 암호화. 수신자 카드는 QoreSign 메시지 서명입니다.
- [커스터디 키트](/developer-tools/custody-kit): QoreSign 기반의 입금 감지와 출금 검증.
- [QoreChain MCP 서버](/developer-tools/mcp): `get_pq_status` 도구가 QoreSign으로 하이브리드 계층을 검증합니다.
- [포스트 퀀텀 서명](/developer-guide/post-quantum-signing) 및 [거래소 통합](/developer-guide/exchange-integration).
- [개발자 패키지 개요](/developer-tools/overview).

## 버전 관리 {#versioning}

QoreSign은 1.0 이전 단계입니다. 마이너 버전에서 API가 바뀔 수 있으며, 호환성을 깨는 모든 변경은
[변경 로그](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md)에 기록됩니다.
와이어 포맷은 별도로 버전이 관리되며(`v1` 명세와
`vectors/qoresign-v1.json`) 한 버전 안에서는 바뀌지 않습니다.

## 기여와 보안 {#contributing}

[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md)를
참고하세요. 취약점은 [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md)에 설명된 대로 security@qore.network로 비공개 신고해 주세요.

## 라이선스 {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
