---
slug: /qoresign/overview
title: QoreSign 개요
sidebar_label: 개요
sidebar_position: 1
---

# QoreSign

QoreSign은 QoreChain의 지갑과 백엔드를 위한 하이브리드 secp256k1 + ML-DSA-87(FIPS 204) 서명입니다.

QoreSign을 사용하면 QoreChain 자체 지갑이 아닌 지갑도 계정의 ML-DSA-87 키를 파생하고, 두 키로 Native 레인 트랜잭션에 서명하고, 하이브리드 서명을 로컬에서 검증하고, 서명 전에 트랜잭션을 시뮬레이션하고, Sign In With QoreChain을 구현할 수 있습니다. QoreSign은
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) 바인딩 위에 놓인 얇은 계층이며, 자체 암호 프리미티브를 추가하지 않습니다.

현재 릴리스는 **0.1.0**입니다. 소스, 예제, 테스트 벡터는
[qorechain/qoresign](https://github.com/qorechain/qoresign) 저장소에 있습니다.

## 레인별 QoreSign의 기능 {#lanes}

| 레인 | 현재 QoreSign이 하는 일 |
|---|---|
| **Native** (Cosmos SDK) | 하이브리드 서명 및 검증. 네트워크는 기본적으로 ML-DSA-87 서명을 요구합니다. |
| **EVM** | 승인 윈도우만 지원: 계정이 ML-DSA-87 키를 등록하고 Native 레인에서 제한된 승인 윈도우를 엽니다. Ethereum 트랜잭션 자체에는 ML-DSA-87 서명이 포함되지 않습니다. |
| **SVM** | 아직 네트워크에서 열리지 않았습니다(`LANE_NOT_AVAILABLE`). |

하이브리드 EVM 서명을 사용하려면 먼저 네트워크에서 레인별 PQC 지원이 필요합니다.
[EVM 지갑: 승인 윈도우](/qoresign/guides/evm-quantum-ready)를 참고하세요.

## 패키지 {#packages}

| 언어 | 패키지 | 설치 |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

다섯 가지 구현 모두 동일한
[테스트 벡터](/qoresign/vectors)로 스스로를 검증합니다.

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

네트워크 헬퍼(키 상태, 잔액 변화를 포함한 시뮬레이션, 브로드캐스트, 체인 대상 로그인 검증)는
`@qorechain/qoresign/network`에 있습니다.

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

API 레퍼런스: 저장소를 클론한 뒤 `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign`(Rust) 또는
`go doc github.com/qorechain/qoresign/go`(Go)를 실행하세요. Swift 및 Kotlin 바인딩은
Rust API를 그대로 따르므로
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) 및
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) README를 참고하세요.

## 범위 {#scope}

QoreSign은 로컬에서 서명합니다. 사용자를 대신해 키를 보관하지 않으며, 임계값(threshold) 또는
MPC 서명을 지원하지 않고, 하드웨어 지갑에서의 서명도 지원하지 않습니다. ML-DSA-87 및 secp256k1
구현은 `qorechain-pqc`(`@noble/post-quantum`,
`fips204`, Cloudflare CIRCL 기반)와 `@noble/curves`, `k256`,
`decred/secp256k1`에서 가져옵니다.

## 버전 관리 {#versioning}

QoreSign은 1.0 이전 단계입니다. 마이너 버전에서 API가 바뀔 수 있으며, 호환성을 깨는 모든 변경은
[변경 로그](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md)에 기록됩니다.
와이어 포맷은 별도로 버전이 관리되며(`v1` 명세와
`vectors/qoresign-v1.json`) 한 버전 안에서는 바뀌지 않습니다.

## 기여와 보안 {#contributing}

[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md)를
참고하세요. 취약점은
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md)에 설명된 대로 비공개로 신고해 주세요.

## 라이선스 {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
