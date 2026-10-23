---
slug: /sdk/faq
title: FAQ 및 문제 해결
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ 및 문제 해결

## 메인넷이 라이브 상태인가요?

네, 메인넷은 **라이브** 상태입니다 (체인 ID `qorechain-vladi`, 2026년 6월 7일부터
라이브이며, 체인 버전 v3.2.4를 실행합니다(2026년 10월 23일 높이 3,742,566에서 적용, 거버넌스 제안 13). 테스트넷은 2026년 10월 19일부터 v3.2.4를 실행하고 있습니다). 테스트넷 프리셋
(`qorechain-diana`)도 계속 사용할 수 있습니다. 두 프리셋 모두 기본값으로
localhost 엔드포인트를 사용하므로, `createClient({ network: "mainnet" })`으로
네트워크를 선택하고 `endpoints`를 여러분의 노드 URL로 재정의하세요. 자세한 내용은
[네트워크 및 엔드포인트](/sdk/reference/network) 문서를 참고하세요.

## 왜 호출이 localhost로 전송되나요?

`createClient()`는 기본적으로 **localhost** 엔드포인트를 사용합니다. 실제 노드와
통신하려면 `endpoints` 객체를 전달하세요:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

서명 경로(`connectTx`)는 컨센서스 **`rpc`** 엔드포인트가 필요하며, QoreChain Native 읽기
작업도 이를 사용합니다. REST 읽기 작업은 `rest`를 사용하고, EVM 호출은
`evmRpc`를 사용합니다(해당 네임스페이스를 제공하는 노드에서는 `qor_` 호출도
마찬가지입니다). 메인넷 URL은
[네트워크 레퍼런스](/sdk/reference/network#public-endpoints)에 있습니다.

## "Cannot find module 'viem'" / "'@solana/web3.js'" 오류가 뜹니다

이는 각각 `@qorechain/evm`과 `@qorechain/svm`의 **피어 종속성(peer dependency)**
입니다. 프로젝트에 다음을 설치하세요:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## 프리컴파일 호출에서 "returned no data" / "feature not present" 오류가 발생합니다

QoreChain EVM 프리컴파일은 노드에 컴파일되어 있지만 메인넷이나 테스트넷에서는
**아직 활성화되지 않았습니다**. 프리컴파일은 해당 주소가 EVM 모듈의
`active_static_precompiles` 파라미터에 나열된 곳에서만 응답하며, 이 목록은 두
네트워크 모두에서 비어 있습니다. 현재 이 호출은 빈 데이터를 반환하므로 viem은
`returned no data ("0x")`를 보고하고, 헬퍼는 퍼블릭 네트워크에서도 오류를
발생시킵니다([EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)
참고). 일반 EVM 노드에서도 호출은 같은 방식으로 실패합니다.
`GET /cosmos/evm/vm/v1/params`를 확인하고, 각 프리컴파일 호출을 감싸서 호출별로
오류를 처리하세요.

## `client.qor` 호출이 -32601로 실패합니다

`client.qor`는 `qor_` JSON-RPC 네임스페이스를 호출하는데, 릴리스된 어떤 노드
빌드도 이를 제공하지 않습니다. 퍼블릭 EVM 엔드포인트의 `rpc_modules`에는 `eth`,
`net`, `rpc`, `txpool`, `web3`만 나열됩니다. 대신 REST 경로를 사용하세요. 예를 들어
`client.rest.get(...)`을 통해 `GET /qorechain/pqc/v1/account/{address}`(PQC 키 상태)
또는 `GET /qorechain/burn/v1/stats`를 호출할 수 있습니다.
[`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)를 참고하세요.

## 금액이 백만 배 차이가 납니다

QOR는 기본 단위 `uqor`가 **10^6**입니다. `toBase` / `fromBase`를 사용하여 모든
계산을 기본 단위로 수행하세요:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

EVM 런타임은 QOR를 **18** 자리 소수(EVM 관례)로 표현하며, 이는 Native `uqor`
기본 단위인 10^6과 다르다는 점에 유의하세요.

## 어떤 패키지가 배포되어 있으며, 어디에 있나요?

모두 배포되어 있습니다(2026년 10월 21일 확인). TypeScript 코어(`@qorechain/sdk`, 0.9.0),
React 키트(`@qorechain/react`, 0.9.0), `create-qorechain-dapp` 스캐폴더(0.9.0),
그리고 EVM/SVM 어댑터(`@qorechain/evm`, `@qorechain/svm`, 0.8.0)는 npm에 있습니다.
Python 클라이언트는 PyPI에 있으며(`pip install qorechain-sdk`로 0.9.0 설치, `qorsdk`로
import), Go 클라이언트는 모듈 프록시에 있습니다
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`). Rust 클라이언트는
crates.io에 있으며(`cargo add qorechain-sdk`, 0.9.0), Java 클라이언트는 Maven Central에
있습니다(`io.github.qorechain:qorechain-sdk:0.9.1`, 다른 언어는 0.9.0). 언어별 전체 설치 명령은
[설치](/sdk/install) 문서를 참고하세요.

## 니모닉이 거부됩니다

SDK는 키를 파생하기 전에 BIP-39 단어 목록**과** 체크섬을 모두 검증하므로,
오타가 있는 구문은 잘못된 계정을 조용히 생성하는 대신 오류를 발생시킵니다.
단어를 다시 확인하고, `validateMnemonic`으로 구문을 테스트하세요.

## 하이브리드(PQC) 트랜잭션

하이브리드(클래식 + ML-DSA-87) 제출은 Native 경로에서 **라이브 상태이며
필수**입니다 — 클래식 전용 Native 트랜잭션은 체인에서 거부됩니다(체인
v3.2.0). 하이브리드 트랜잭션이 PQC 검증을 통과하려면 서명자의 PQC 공개키가
`MsgRegisterPQCKeyV2`(클래식 서명이며 하이브리드가 면제되는 트랜잭션)로
**명시적으로 등록**되어 있어야 합니다. 공개키를 확장에 포함시키는 것
(`includePqcPublicKey: true`)은 키를 등록하지 **않으며**, 체인은 최초 사용 시
키를 등록하지 않습니다. TypeScript에서는 클라이언트에 키쌍을 전달하면
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) 클라이언트가 보내는 모든
트랜잭션이 하이브리드로 서명됩니다.
체인은 헤지(hedged)든 결정론적이든 유효한 FIPS-204 ML-DSA-87 서명을 모두
허용합니다. SDK는 (0.5.1부터) 기본적으로 결정론적으로 서명하므로 트랜잭션은 항상
같은 서명과 tx 해시를 가집니다. 하이브리드 tx가 `pqc` 코드 21
(`hybrid_verify_failed`)로 실패한다면 원인은 sign-bytes 버전, 체인 ID, 오래된 PQC
라이브러리 또는 등록되지 않았거나 다른 키이며, 헤지 서명은 원인이 아닙니다.
두 네트워크 모두 v2 sign-bytes 형식을 검증하므로 SDK **0.8.1 이상**(현재는 0.9.0)을
사용하고 `rest`(또는 `signBytesVersion`)를 전달하세요. 둘 중 하나가 없으면 빌더는
`qorechain-vladi` / `qorechain-diana`에서 오류를 발생시킵니다. 자세한 내용은
[코드 21 문제 해결](/developer-guide/post-quantum-signing#code-21) 및
[계정 및 PQC 서명](/sdk/concepts/accounts-pqc) 문서를 참고하세요.

## EVM 트랜잭션이 "no open EVM authorisation window"로 거부됩니다

체인 v3.2.0부터 EVM 레인은 등록된 PQC 키와 열려 있는 인증 윈도우를 가진
계정의 트랜잭션만 받아들입니다. 키를 등록하고, 윈도우를 연 다음 전송하세요.
[EVM 인증 윈도우](/sdk/guides/evm#evm-window)를 참고하세요. SDK에서는
`classifyEvmWindowRejection(err)`가 `"no-pqc-key"`, `"no-window"`,
`"exhausted"` 또는 `"invalid"`를 반환합니다.

## 하이브리드 트랜잭션이 CheckTx 단계에서 tx parse 오류로 실패합니다

SDK를 업그레이드하세요. **0.6.0 이하** 버전은
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 확장을 JSON으로 직렬화했는데,
체인의 tx 디코더가 이를 CheckTx 단계에서 거부합니다. **0.6.1**부터는 5개 언어
모두에서 이 확장이 protobuf로 인코딩됩니다(값이 `0x08`로 시작). 이전 버전으로
빌드된 하이브리드 트랜잭션은 eth-native를 포함한 모든 레인에서 체인상
거부됩니다.

## SDK는 어떤 체인 버전과 함께 동작하나요?

SDK **0.9.0**은 체인 v3.2.2와 v3.2.3을 위한 클라이언트 릴리스입니다. 메인넷과
테스트넷 **v3.2.4**(메인넷은 2026년 10월 23일부터)에서 트랜잭션을 보낼 수 있으며, 등록 시의 선택적
소유 증명(네트워크가 v3.2.3을 적용한 뒤에는 `ensurePqcRegistered`가 자동으로
첨부), 범위 지정 EVM 윈도우, EIP-7702 동의 메시지를 위한 빌더가 있습니다.
SDK **0.8.1 이상**도 두 네트워크 모두에서 트랜잭션을 보낼 수 있지만(v2 하이브리드
sign-bytes 형식, 등록, 하이브리드 전송, EVM 윈도우는 그대로 동작합니다) 이러한
빌더는 없으므로, 해당 기능에는 CLI를 사용하세요([0.9.0 이전
버전](/sdk/install#before-090) 참고). v3.2.4는 2026년 10월 19일부터 테스트넷에서
실행 중이며 메인넷에서는 2026년 10월 23일(높이 3,742,566, 거버넌스 제안 13)부터 실행 중입니다. SDK는
v3.2.4 필드를 설정하지 않으므로, SDK의 트랜잭션은 업그레이드 전후 모두
유효합니다.

## PQC 키 등록이 거부되었는데 수수료는 차감되었습니다

이미 키를 보유한 계정의 등록은 수수료가 차감된 뒤에 체인이 거부합니다. 0.9.0의
`ensurePqcRegistered`는 먼저 `GET /qorechain/pqc/v1/account/{address}`를 읽고
(`rest`를 전달하세요), 이 키쌍의 키가 등록되어 있으면 등록을 건너뛰며, 다른 키가
등록되어 있으면 `PqcKeyMismatchError`를 발생시킵니다. 이전 릴리스는 직접
`status: { registered: found }`를 전달하지 않는 한 먼저 확인하지 않았으며, 여기서
`found`는 해당 경로에서 가져옵니다. v3.2.3부터 체인은 약하거나 퇴화한 키, 재사용된
키도 거부합니다. `derivePqcCanonical` 또는 `tx pqc gen-key`로 만든 키는 문제가 없습니다.

## `create-qorechain-dapp`이 서명할 수 없는 SDK를 설치합니다

스캐폴더의 0.8.0 버전만 그랬습니다. 이 버전은 `@qorechain/sdk`와 `@qorechain/evm`에
`^0.3.0` 범위를 기록했는데, 0.x 버전에 대한 캐럿 범위는 0.3 안에 머뭅니다. 0.9.0
버전은 현재 SDK로 스캐폴딩합니다. 0.8.0을 사용했다면 스캐폴딩 후
`npm i @qorechain/sdk@latest`(및 `@qorechain/evm@latest`)를 실행하세요.

## `VERSION`은 0.8.0이라고 나오는데 0.8.3을 설치했습니다

0.8.3의 내보내진 `VERSION` 상수는 갱신되지 않아 `0.8.0`을 보고합니다. 0.9.0부터는
패키지와 일치합니다. 이전 릴리스에서는 설치된 버전을 `package.json`에서 읽으세요.

## 인증자(authenticator) 지출이 `authenticator_replay`로 거부됩니다

(`abstractaccount` 모듈은 현재 두 네트워크 모두에서 꺼져 있으며, 지출은 nonce가
확인되기 전에 `abstract account module is disabled`로 거부됩니다.
[인증자 및 위임 지출](/sdk/guides/authenticators)을 참고하세요. 아래 안내는
모듈이 활성화된 이후에 적용됩니다.)

nonce가 잘못되었습니다. `MsgExecuteEVM.nonce`와 `MsgExecuteCosmos.nonce`는 모두
`(account, pubkey)`에 대한 연결된 키의 **인증자 시퀀스**입니다. 이는 체인이 연결된
키마다 유지하는 카운터로, 0에서 시작하여 실행에 성공할 때마다 증가합니다. 계정의
EVM nonce가 **아니며**, 아직 이를 조회하는 쿼리가 없으므로 연결된 키마다 직접
추적하세요. v3.2.3부터 EVM 레인은 호출의 가스 한도를 바인딩하는
`evmAuthSignBytesV2`에도 서명합니다(`resolveEvmAuthDigestVersion`이 형식을
선택합니다). 해당 키에 대해 추적 중인 카운터를 사용하여 다시 서명하세요.

그 밖의 인증자 실패는 `decodeTxError`로 디코딩됩니다: `abstractaccount` 코드 5
(`spending_limit_exceeded`), 6(`session_key_expired`), 10
(`permission_denied`). 자세한 내용은
[인증자 및 위임 지출](/sdk/guides/authenticators) 문서를 참고하세요.
