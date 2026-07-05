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
현재 릴리스는 **0.7.0**이며, 통합 eth-네이티브 계정, 컨센서스에 치명적이었던
하이브리드 확장 인코딩 수정, 그리고 인증자(authenticator) 레인이 추가되었습니다
([Authenticators 가이드](/sdk/guides/authenticators) 참조).
아래에서 언어를 선택하세요.

:::caution 0.6.0 이하에서 업그레이드
SDK **0.6.1**은 컨센서스에 치명적인 버그를 수정했습니다:
`/qorechain.pqc.v1.PQCHybridSignature` tx 본문 확장이
`Any.value`에 JSON으로 직렬화되어 **CheckTx 단계에서 체인에 의해 거부**되었습니다.
SDK ≤ 0.6.0으로 생성한 하이브리드(PQC + 클래식) 트랜잭션은 온체인에서 거부되므로,
사용 중인 모든 언어에서 0.6.1 이상으로 업그레이드하세요.
:::

## TypeScript

코어 패키지:

```bash
npm i @qorechain/sdk
```

Node.js 20+를 대상으로 하며 ESM, CommonJS, 타입 정의를 함께 제공합니다.

### EVM 어댑터

`@qorechain/evm`은 [viem](https://viem.sh) 위에 얇게 얹은 타입 안전 어댑터입니다.
viem은 **피어 의존성**이므로 함께 설치하세요:

```bash
npm i @qorechain/evm viem
```

npm에 `0.7.0`으로 게시되어 있습니다.

### SVM 어댑터

`@qorechain/svm`은 **피어 의존성**인
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 위에 얇게 얹은
어댑터입니다:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm에 `0.7.0`으로 게시되어 있습니다.

### React 키트

`@qorechain/react`는 `@qorechain/sdk` 위에 얹은 공식 React 레이어입니다.
프로바이더, 훅, 그리고 `ConnectButton` / `QuantumSafeBadge` 컴포넌트를 제공합니다.
`react`(>=18)는 피어 의존성입니다:

```bash
npm i @qorechain/react
```

npm에 `0.7.0`으로 게시되어 있습니다. [React 키트 가이드](/sdk/guides/react)를
참고하세요.

### 스캐폴더

`create-qorechain-dapp`(npm, `0.7.0`)은 바로 실행할 수 있는 dApp을 스캐폴딩합니다:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+가 필요합니다. 이 패키지는 타입 힌트와 `py.typed` 마커를 제공합니다.

> 배포판은 `qorechain-sdk`로 설치되지만(PyPI에 `0.7.0`으로 게시됨)
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

독립형 Go 모듈로 게시되어 있습니다(태그: `packages/go/v0.7.0`).

## Rust

```bash
cargo add qorechain-sdk
```

또는 저장소에서 직접 `0.7.0` 소스를 추적하려면:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+가 필요합니다. 읽기 클라이언트는 비동기(Tokio)입니다. 이 크레이트는
`qorechain`으로 임포트합니다(`use qorechain;`).

> crates.io에 `qorechain-sdk`로 게시되어 있습니다. `cargo add qorechain-sdk`는
> **가장 최근에 게시된 크레이트**를 설치하며, 이 버전은 현재 `0.7.0` 릴리스보다
> 뒤처져 있습니다. crates.io(최신 게시 버전)에서 설치하거나, 최신 API 표면이
> 필요하면 저장소에서 설치하세요.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

또는 Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Maven Central에 `io.github.qorechain:qorechain-sdk:0.7.0`으로 게시되어 있습니다.

## 다음

연결하고 온체인 상태를 읽으려면 [Quickstart](/sdk/quickstart)로 이어서 진행하세요.
