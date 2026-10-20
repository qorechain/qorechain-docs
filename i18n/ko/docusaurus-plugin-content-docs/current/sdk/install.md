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
현재 릴리스 라인은 **0.9**이며 2026년 10월 21일에 게시되었습니다(해당 날짜에
각 레지스트리에서 확인했습니다).

| 레지스트리 | 패키지 | 버전 |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.9.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.9.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.9.0 |
| Go 모듈 프록시 | `github.com/qorechain/qorechain-sdk/packages/go` | v0.9.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.9.1 (Bouncy Castle 의존성만 갱신한 Java 전용 업데이트로 API 변경 없음. 다른 언어는 0.9.0 유지) |

아래에서 언어를 선택하세요.

## 업그레이드 안내 {#upgrade}

:::danger 라이브 네트워크에서는 SDK 0.8.1 이상을 사용하세요
두 공개 네트워크 모두 **v2 하이브리드 sign-bytes** 형태(도메인 태그가 붙고 체인 id에
바인딩됨)를 검증하며, 이전 형태는 `pqc` 코드 21로 거부합니다. **0.8.0** 이전의
모든 SDK 릴리스는 이전 형태로 서명하며, **0.8.0**은 네트워크가 사용한 두 가지
업그레이드 이름 중 하나로만 전환 시점을 찾기 때문에(메인넷은 이를 `v3.2.0`으로,
테스트넷은 `v3.1.98`과 이후 `v3.2.0`으로 기록했습니다) 메인넷에서 잘못된 형태로
서명합니다. 모든 언어에서 **0.9.0**(최소한 **0.8.1**)을 사용하세요. [EVM 인증 윈도우](/sdk/guides/evm#evm-window)를
열려면 **0.8.2 이상**이 필요합니다. 하이브리드 빌더는 `signBytesVersion` 옵션
(`"auto"` | `"v1"` | `"v2"`)을 받습니다. `"auto"`는 네트워크에 문의하므로
`qorechain-vladi` / `qorechain-diana`에서 REST 엔드포인트(`rest`)가 필요하며,
추측하는 대신 예외를 던집니다.
[어떤 sign-bytes 형태인가?](/sdk/concepts/accounts-pqc#sign-bytes-versions)를
참조하세요.
이 형태는 체인 v3.2.3과 v3.2.4(테스트넷은 2026년 10월 19일부터, 메인넷은 높이 3,742,566부터)에서 바뀌지 않았습니다. `"auto"`는
두 네트워크 모두에서 v2로 결정됩니다.
:::

## 0.9.0에서 추가된 것 {#whats-new-090}

SDK 0.9.0은 체인 **v3.2.2**와 **v3.2.3**을 위한 클라이언트 릴리스입니다(메인넷은
이를 높이 3,556,788과 3,662,051에서 적용했으며, 테스트넷은 2026년 10월 19일부터 v3.2.4를 실행했고 메인넷은 높이 3,742,566에서 이로 전환합니다).
서명 형식, 주소, 소수 자릿수, 메모, 수수료는 바뀌지 않았으므로, 0.8.1 이상이
서명하는 v2 하이브리드 sign-bytes 형태가 여전히 올바른 형태입니다.
새로 추가된 내용은 다음과 같습니다.

| 영역 | 0.9.0에서 |
| --- | --- |
| 하이브리드 `TxClient` (TypeScript) | 계정의 키페어를 전달합니다: `client.connectTx(signer, { pqcKeypair })` 또는 `TxClient.connect({ …, pqcKeypair, rest })`. 그러면 모든 트랜잭션이 하이브리드로 서명되고 `fee: "auto"`는 하이브리드 트랜잭션 자체를 시뮬레이션합니다. 단독 키 등록은 클래식으로 유지됩니다(체인의 부트스트랩 경로). `bankSend`와 SDK의 롤업, 멀티레이어, 크로스 VM 클라이언트가 이를 사용합니다. 키페어가 없으면 아무것도 바뀌지 않습니다 |
| 복구 가능한 PQC 키 | `derivePqcCanonical(address, mnemonic)`과 모든 언어의 대응 함수([양자 안전](/sdk/guides/quantum-safe#canonical-derivation) 참조) |
| `ensurePqcRegistered` | 먼저 REST(`rest`)로 키 상태를 읽고, 판단할 수 없으면 등록을 거부하며, 계정에 이미 다른 키가 있으면 `PqcKeyMismatchError`를 던지고, 체인의 "이미 등록됨" 거부는 성공으로 처리합니다. 체인 v3.2.3부터는 **소유 증명**을 스스로 서명해 첨부하며, v3.2.3 이전에는 해당 필드를 비워 둡니다 |
| 범위가 제한된 EVM 윈도우 | `openEvmWindowMsg`가 `nativeOnly`와 `allowedTargets`(최대 16개, 중복 불가)를 받고, `fetchEvmWindow`가 둘 다 다시 읽습니다([EVM 가이드](/sdk/guides/evm#evm-window) 참조) |
| EIP-7702 동의 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| 키 무결성 | 등록 빌더는 `classical_only`, 빈 키, 퇴화된 ML-DSA-87 키를 거부하며, 체인도 v3.2.3부터 이를 거부합니다. `signProofOfPossession` / `verifyProofOfPossession`이 내보내지고, `migratePqcKeyHybrid`는 키가 있는 계정이 v3.2.3부터 필요로 하는 하이브리드 서명된 `MsgMigratePQCKey`를 전송합니다 |
| 추상 계정 다이제스트 v2 | `evmAuthSignBytesV2`(호출의 가스 한도를 바인딩)와 `resolveEvmAuthDigestVersion`. `abstractaccount` 모듈은 두 네트워크 모두에서 꺼져 있으므로 참고용입니다 |
| 업그레이드 감지 | `isUpgradeApplied`, `requireUpgradeApplied`: 새 선택 필드는 `applied_plan`이 해당 릴리스를 보고한 뒤에만 설정됩니다. 릴리스를 적용하지 않은 노드는 그 릴리스의 새 필드가 하나라도 설정되면 트랜잭션 전체를 거부하기 때문입니다 |
| 오류 디코딩 | 블록 안에서 실패한 경우 codespace가 유지됩니다(예: `sdk_231`이 아닌 `pqc` 231). `rate_limited`와 위임 코드가 디코딩되고, `decodeTxError`는 던져진 오류의 로그 또는 메시지를 읽습니다 |
| 지출 규칙 | `validateSpendingRules`가 `MsgUpdateSpendingRules` 빌더에서 실행되며 아무것도 제한하지 않는 규칙을 거부합니다 |
| 수정 사항 | PQC 계정 경로는 모든 SDK에서(그리고 합성된 클라이언트를 사용할 때의 `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus`에서도) 단수형 `/qorechain/pqc/v1/account/{address}`입니다. 내보낸 `VERSION`이 패키지와 일치합니다. SDK가 만든 Go 및 Rust 클라이언트는 멈추는 대신 타임아웃됩니다. `create-qorechain-dapp` 템플릿은 함께 제공되는 릴리스에 의존합니다 |

새 키에 대한 레거시 PQC 파생(`derivePqcLegacy`, `"bridge"`)은 더 이상 권장되지
않습니다. 이 파생은 계정에 바인딩되지 않아, 하나의 니모닉이 모든 계정에 같은
키를 주게 되기 때문입니다. 로테이션 헬퍼는 이를 **새** 키로 사용하는 것을
거부하며, 기존 레거시 키를 복구하거나 그 키에서 로테이션해 벗어나는 것은
여전히 동작합니다.

## 0.9.0 이전 버전 {#before-090}

0.8.x를 사용 중이라면, 이 버전은 여전히 두 네트워크가 검증하는 형태로 서명하며
메인넷(v3.2.3, 높이 3,742,566부터는 v3.2.4)과 테스트넷(v3.2.4)에서 동작합니다. 다음은 0.9.0이 없애 주는
제약이며, 알지 못하면 수수료가 드는 경우도 있습니다.

| 0.9.0 이전 릴리스 | 우회 방법 |
| --- | --- |
| 소유 증명, 범위가 제한된 윈도우, EIP-7702 동의 빌더 없음 | `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets`, `authorize-evm-delegation` / `clear-evm-delegation`을 사용하세요([EVM 승인 윈도우](/getting-started/first-transaction#evm-window), [EIP-7702 위임](/architecture/post-quantum-security#eip-7702) 참조) |
| `status` 없는 `ensurePqcRegistered`는 확인 없이 등록을 브로드캐스트했고, 다른 키가 등록되어 있어도 성공으로 보고했음 | 이미 키가 있는 계정에 대한 두 번째 등록은 **수수료가 차감된 뒤에** 거부됩니다. 먼저 `GET /qorechain/pqc/v1/account/{address}`를 읽고 `status: { registered: found }`를 전달하세요 |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | 복수형 `/accounts/` 경로 또는 공개 엔드포인트가 제공하지 않는 `qor_` 네임스페이스(HTTP 501, `-32601`)를 호출했습니다. 위의 단수형 REST 경로를 읽으세요 |
| `TxClient` / `bankSend`와 롤업, 멀티레이어, 크로스 VM 클라이언트는 클래식 전용으로 서명했음 | 네트워크는 키가 있는 계정에 대해 이를 거부합니다. `signAndBroadcastHybrid`로 전송하세요 |
| 블록 안에서 실패한 트랜잭션이 codespace를 잃음 | `GET /cosmos/tx/v1beta1/txs/{hash}`에서 트랜잭션을 읽으세요 |
| 0.8.3의 내보낸 `VERSION` 상수가 `0.8.0`으로 보고됨 | 설치된 버전은 `package.json`에서 읽으세요 |
| `create-qorechain-dapp` 0.8.0은 `@qorechain/sdk` / `@qorechain/evm`을 `^0.3.0`으로 고정함(0.x 버전의 캐럿은 0.3 안에 머뭅니다) | 스캐폴딩 후 `npm i @qorechain/sdk@latest`를 실행하세요 |
| `@qorechain/react` 0.8.x는 공개 엔드포인트에서 등록된 키의 상태를 읽을 수 없게 두었음 | `@qorechain/react` 0.9.0을 사용하세요 |

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

npm에 `0.9.0`으로 게시되어 있으며 `@qorechain/sdk` `^0.9.0`에 의존합니다. [React 키트 가이드](/sdk/guides/react)를
참고하세요.

### 스캐폴더

`create-qorechain-dapp`(npm, `0.9.0`)은 바로 실행할 수 있는 dApp을 스캐폴딩합니다:

```bash
npm create qorechain-dapp@latest my-dapp
```

생성된 `package.json` 파일은 스캐폴더와 함께 제공되는 SDK 릴리스에 의존합니다
(`@qorechain/sdk` `^0.9.0`. EVM 템플릿은 `@qorechain/evm` `^0.8.0`을 사용합니다).
스캐폴더 0.8.0 버전은 `^0.3.0` 범위를 기록했는데, 0.x 버전에서 이 범위는
0.3 안에 머물러 라이브 네트워크에 서명할 수 없습니다. 0.8.0으로 스캐폴딩했다면
`npm i @qorechain/sdk@latest`를 실행하세요. [CLI 레퍼런스](/sdk/reference/cli)를
참고하세요.

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+가 필요합니다. 이 패키지는 타입 힌트와 `py.typed` 마커를 제공합니다.

> 배포판은 `qorechain-sdk`로 설치되지만(PyPI에 `0.9.0`으로 게시됨)
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

독립형 Go 모듈로 게시되어 있습니다(태그: `packages/go/v0.9.0`). 버전을 명시적으로
고정하세요: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`.

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

> crates.io에 `qorechain-sdk`(0.9.0)로 게시되어 있습니다. `cargo add qorechain-sdk`는
> 최신 릴리스를 설치합니다.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.9.1</version>
</dependency>
```

또는 Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.9.1'
```

> Maven Central에 `io.github.qorechain:qorechain-sdk`로 게시되어 있습니다
> (0.9.0과 0.9.1이 모두 제공되며, 0.9.1이 최신이자 릴리스 버전입니다. 2026년 10월
> 21일 확인). 0.9.1은 릴리스 노트에 따라 Bouncy Castle을 1.80에서 1.85로 올린
> Java 전용 릴리스이며 API 변경은 없습니다. Central에는 0.8.0 또는 0.8.1 빌드가
> 없으므로, 라이브 네트워크에서는 0.9.x(또는 0.8.2 이상)를 사용하세요.

## 관련 패키지 {#related-packages}

| 패키지 | 용도 | 버전 |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | 지갑 측 헬퍼: 지갑 생성(`generateQoreWallet`), `eth_secp256k1` 하이브리드 서명(`signHybridEth`, `QoreChainSigner`), MetaMask 네트워크 등록(`addQoreEvmToWallet`), 인증자 및 EVM 윈도우 메시지 빌더(`openEvmWindowMsg`는 범위 제한이 없는 형태만 만듭니다), v2 추상 계정 다이제스트. 소유 증명은 첨부하지 않습니다. 피어 의존성: `@cosmjs/proto-signing` 및 `@cosmjs/stargate` `^0.32`(SDK는 cosmjs 0.39를 사용하므로 한 프로젝트에 둘 다 설치하면 npm이 피어 충돌 `ERESOLVE`를 보고합니다. 별도 프로젝트에 두거나 `--legacy-peer-deps`를 전달하세요) | 0.4.0 |
| `@qorechain/chain-bridge` | 백엔드용 서버 측 워커: PQC 키를 파생하고, 하이브리드 서명 후 브로드캐스트합니다(`sendTokens`, `registerPqc` 등). `cosmosRest`를 전달하세요. 전달하면 네트워크가 v3.2.3을 적용한 뒤 등록에 소유 증명이 포함되고, PQC로 보이는 거부는 재등록 전에 체인과 대조해 확인합니다(다른 키가 등록되어 있으면 두 번째 등록 비용을 내는 대신 `pqc_key_mismatch`를 발생시킵니다) | 0.2.3 |
| `@qorechain/pqc` | 표준 전용 ML-DSA / ML-KEM / SHAKE-256 프리미티브와 `hybridSignBytes`([양자내성 서명](/developer-guide/post-quantum-signing) 참조). PyPI, crates.io, Maven Central, Go 프록시(Go `v0.2.3`)에도 같은 버전으로 있습니다 | 0.2.3 |
| `@qorechain/handles` | 최초 사용 시 신뢰(trust-on-first-use) 고정을 갖춘 검증된 `@handle` 해석(`HandleClient`) | 0.1.0 |
| `@qorechain/connect` | 지갑 어댑터 위에 구축된, EVM, Cosmos, SVM 지갑을 위한 단일 커넥터(피어 범위는 `@qorechain/wallet-adapter` `^0.2.1`이며 0.4.0은 포함하지 않습니다). [EVM 인증 윈도우](/sdk/guides/evm#evm-window)를 열지 않으므로, 이를 통한 EVM 전송은 계정에 등록된 키와 열린 윈도우가 생길 때까지 거부됩니다 | 0.2.1 |
| `@qorechain/rdk` | 롤업 개발 키트(Rollup Development Kit) 클라이언트([롤업](/rollups/why) 참조). `@qorechain/sdk` `^0.9.0`과 `@qorechain/evm` `^0.8.0`에 의존하므로, SDK 0.9.0을 사용하는 앱은 SDK 사본 하나를 함께 공유합니다(0.5.0은 SDK 0.8.3을 중첩 사본으로 가져왔습니다). `pqcKeypair`를 전달할 때만 하이브리드로 서명하며, 읽기는 없어도 동작합니다. PyPI, crates.io, Maven Central에는 `qorechain-rdk`로, Go 모듈로도 게시되어 있습니다(`@v0.6.0`으로 고정하세요). 이 네 클라이언트는 클래식 전용으로 서명합니다. [RDK 0.6.0: 변경 사항과 한계](/rollups/deploying-a-rollup#rdk-050-limits)를 참조하세요 | 0.6.0 |
| `@qorechain/rdk-cli` | RDK용 `qorollup` 운영자 CLI. 트랜잭션 명령(`create`, `pause`, `resume`, `stop`, `withdraw`)은 클래식 전용으로 서명하며 네트워크가 이를 거부합니다 | 0.6.0 |
| `create-qorechain-rollup` | 롤업 스타터 스캐폴더. 템플릿은 `@qorechain/rdk` `^0.6.0`에 의존하며, `QORE_MNEMONIC` 또는 `QORE_PQC_SEED_HEX`에서 양자내성 키를 확보할 수 있으면 하이브리드로 서명합니다 | 0.6.0 |

## 다음

연결하고 온체인 상태를 읽으려면 [Quickstart](/sdk/quickstart)로 이어서 진행하세요.
