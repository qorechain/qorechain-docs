---
slug: /sdk/install
title: 설치
sidebar_label: 설치
sidebar_position: 2
---

# 설치

사용하는 언어에 맞는 SDK를 설치하세요. TypeScript 코어(`@qorechain/sdk`),
EVM 및 SVM 어댑터(`@qorechain/evm`, `@qorechain/svm`), React 키트
(`@qorechain/react`), 그리고 Python, Go, Rust, Java 클라이언트는 모두
완전한 네이티브 체인 패리티(타입드 메시지, 쿼리, tx 라이프사이클, 하이브리드
PQC 트랜잭션, WebSocket 구독)를 갖춘 채 각 레지스트리에 **게시**되어 있습니다.
현재 릴리스 라인은 **0.8**입니다. TypeScript, Python, Rust, Java는 **0.8.3**이고,
Go 모듈은 **v0.8.4**입니다. 아래에서 언어를 선택하세요.

## 업그레이드 안내 {#upgrade}

:::danger 라이브 네트워크에서는 SDK 0.8.1 이상을 사용하세요
두 공개 네트워크 모두 **v2 하이브리드 sign-bytes** 형태(도메인 태그가 붙고 체인 id에
바인딩됨)를 검증하며, 이전 형태는 `pqc` 코드 21로 거부합니다. **0.8.0** 이전의
모든 SDK 릴리스는 이전 형태로 서명하며, **0.8.0**은 네트워크가 사용한 두 가지
업그레이드 이름 중 하나로만 전환 시점을 찾기 때문에(메인넷은 이를 `v3.2.0`으로,
테스트넷은 `v3.1.98`과 이후 `v3.2.0`으로 기록했습니다) 메인넷에서 잘못된 형태로
서명합니다. 모든 언어에서 **0.8.1 이상**을 사용하세요. [EVM 인증 윈도우](/sdk/guides/evm#evm-window)를
열려면 **0.8.2 이상**이 필요합니다. 하이브리드 빌더는 `signBytesVersion` 옵션
(`"auto"` | `"v1"` | `"v2"`)을 받습니다. `"auto"`는 네트워크에 문의하므로
`qorechain-vladi` / `qorechain-diana`에서 REST 엔드포인트(`rest`)가 필요하며,
추측하는 대신 예외를 던집니다.
[어떤 sign-bytes 형태인가?](/sdk/concepts/accounts-pqc#sign-bytes-versions)를
참조하세요.
:::

:::caution 이전 수정 사항
SDK **0.6.1**은 컨센서스에 치명적인 버그를 수정했습니다:
`/qorechain.pqc.v1.PQCHybridSignature` tx 본문 확장이
`Any.value`에 JSON으로 직렬화되어 **CheckTx 단계에서 체인에 의해 거부**되었습니다.
SDK ≤ 0.6.0으로 생성한 하이브리드(PQC + 클래식) 트랜잭션은 온체인에서 거부됩니다.
**0.8.0**에서는 지갑 서명 계정 헬퍼가 제거되었습니다
([계정 및 PQC 서명](/sdk/concepts/accounts-pqc#phantom) 참조).
:::

## TypeScript

코어 패키지:

```bash
npm i @qorechain/sdk
```

Node.js 20+를 대상으로 하며 ESM, CommonJS, 타입 정의를 함께 제공합니다. 이 문서의
하이브리드 트랜잭션 샘플은 `@cosmjs/stargate`에서 `StargateClient`도 임포트합니다
(`npm i @cosmjs/stargate`).

### EVM 어댑터

`@qorechain/evm`은 [viem](https://viem.sh) 위에 얇게 얹은 타입 안전 어댑터입니다.
viem은 **피어 의존성**이므로 함께 설치하세요:

```bash
npm i @qorechain/evm viem
```

npm에 `0.8.0`으로 게시되어 있습니다.

### SVM 어댑터

`@qorechain/svm`은 **피어 의존성**인
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 위에 얇게 얹은
어댑터입니다:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm에 `0.8.0`으로 게시되어 있습니다.

### React 키트

`@qorechain/react`는 `@qorechain/sdk` 위에 얹은 공식 React 레이어입니다.
프로바이더, 훅, 그리고 `ConnectButton` / `QuantumSafeBadge` 컴포넌트를 제공합니다.
`react`(>=18)는 피어 의존성입니다:

```bash
npm i @qorechain/react
```

npm에 `0.8.3`으로 게시되어 있습니다. [React 키트 가이드](/sdk/guides/react)를
참고하세요.

### 스캐폴더

`create-qorechain-dapp`(npm, `0.8.0`)은 바로 실행할 수 있는 dApp을 스캐폴딩합니다:

```bash
npm create qorechain-dapp@latest my-dapp
```

생성된 `package.json` 파일은 `@qorechain/sdk` / `@qorechain/evm`을 `^0.3.0`으로
고정하는데, npm은 이를 라이브 네트워크에 서명할 수 없는 0.3 릴리스로 해석합니다.
스캐폴딩 후 `npm i @qorechain/sdk@latest`를 실행하세요(EVM 템플릿의 경우
`npm i @qorechain/evm@latest`도 실행). [CLI 레퍼런스](/sdk/reference/cli)를
참고하세요.

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+가 필요합니다. 이 패키지는 타입 힌트와 `py.typed` 마커를 제공합니다.

> 배포판은 `qorechain-sdk`로 설치되지만(PyPI에 `0.8.3`으로 게시됨)
> **`qorsdk`로 임포트**합니다:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+가 필요합니다. 필요한 하위 패키지를 임포트하세요. 예를 들면:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

독립형 Go 모듈로 게시되어 있습니다(태그: `packages/go/v0.8.4`).

## Rust

```bash
cargo add qorechain-sdk
```

또는 저장소의 최신 헤드를 추적하려면:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+가 필요합니다. 읽기 클라이언트는 비동기(Tokio)입니다. 이 크레이트는
`qorechain`으로 임포트합니다(`use qorechain;`).

> crates.io에 `qorechain-sdk`(0.8.3)로 게시되어 있습니다. `cargo add qorechain-sdk`는
> 최신 릴리스를 설치합니다.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

또는 Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Maven Central에 `io.github.qorechain:qorechain-sdk:0.8.3`으로 게시되어 있습니다.
> Central에는 0.8.0 또는 0.8.1 빌드가 없으므로, 라이브 네트워크에서는 0.8.2 이상을
> 사용하세요.

## 관련 패키지 {#related-packages}

| 패키지 | 용도 | 버전 |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | 지갑 측 헬퍼: 지갑 생성(`generateQoreWallet`), `eth_secp256k1` 하이브리드 서명(`signHybridEth`, `QoreChainSigner`), MetaMask 네트워크 등록(`addQoreEvmToWallet`), 인증자 및 EVM 윈도우 메시지 빌더. 피어 의존성: `@cosmjs/proto-signing` 및 `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | 백엔드용 서버 측 워커: PQC 키를 유도하고, 하이브리드 서명 후 브로드캐스트합니다(`sendTokens`, `registerPqc` 등). `cosmosRest`를 전달하세요 | 0.2.2 |
| `@qorechain/pqc` | 표준 전용 ML-DSA / ML-KEM / SHAKE-256 프리미티브와 `hybridSignBytes`([포스트 양자 서명](/developer-guide/post-quantum-signing) 참조) | 0.2.1 |
| `@qorechain/handles` | 최초 사용 시 신뢰(trust-on-first-use) 고정을 갖춘 검증된 `@handle` 해석(`HandleClient`) | 0.1.0 |
| `@qorechain/rdk` | 롤업 개발 키트(Rollup Development Kit) 클라이언트([롤업](/rollups/why) 참조). npm 릴리스(0.4.4)는 트랜잭션을 클래식 전용으로 서명하며 네트워크가 이를 거부하므로 읽기만 가능하고 전송은 할 수 없습니다. 하이브리드 서명은 0.5.0에 있으며 현재 PyPI와 Go 모듈에서만 제공됩니다 | 0.4.4 (npm) |

## 다음

연결하고 온체인 상태를 읽으려면 [Quickstart](/sdk/quickstart)로 이어서 진행하세요.
