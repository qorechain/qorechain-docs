---
slug: /sdk/faq
title: FAQ 및 문제 해결
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ 및 문제 해결

## 메인넷이 가동 중인가요?

네. 메인넷은 **가동 중**입니다(체인 ID `qorechain-vladi`). 테스트넷 프리셋
(`qorechain-diana`)도 계속 사용할 수 있습니다. 두 프리셋 모두 localhost 엔드포인트가
기본값으로 설정되어 있습니다. `createClient({ network: "mainnet" })`로 네트워크를
선택하고, `endpoints`를 여러분의 노드 URL로 재정의하세요. 자세한 내용은
[네트워크 및 엔드포인트](/sdk/reference/network)를 참고하세요.

## 왜 호출이 localhost로 가나요?

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

서명 경로(`connectTx`)에는 합의 **`rpc`** 엔드포인트가 필요하며, CosmWasm
읽기 작업도 이를 사용합니다. REST 읽기는 `rest`를, EVM 및 `qor_` 호출은 `evmRpc`를 사용합니다.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

이들은 각각 `@qorechain/evm`과 `@qorechain/svm`의 **피어 의존성(peer dependencies)**입니다.
프로젝트에 직접 설치하세요:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## 프리컴파일 호출에서 "feature not present" 오류가 발생합니다

EVM 프리컴파일은 QoreChain EVM Engine을 실행하는 노드에만 존재합니다. 일반
EVM 노드에서는 해당 호출이 실패합니다. 서로 다른 종류의 노드를 대상으로 한다면, 각
프리컴파일 호출을 감싸서 호출별로 오류를 처리하세요.

## 금액이 백만 배 차이가 납니다

QOR의 기본 단위 `uqor`는 **10^6** 단위입니다. `toBase` / `fromBase`를 사용하고 모든
계산은 기본 단위로 수행하세요:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

참고로 EVM 런타임은 QOR을 **18**자리 소수(EVM 관례)로 표현하며, 이는
Native의 `uqor` 기본 단위인 10^6과는 다릅니다.

## 어떤 패키지가 어디에 게시되어 있나요?

모두 게시되어 있습니다. TypeScript 코어(`@qorechain/sdk`), EVM/SVM 어댑터
(`@qorechain/evm`, `@qorechain/svm`), React 킷(`@qorechain/react`),
`create-qorechain-dapp` 스캐폴더는 npm에 `0.7.0` 버전으로 올라와 있습니다. Python 클라이언트는
PyPI에 있으며(`pip install qorechain-sdk`, `0.7.0` 버전, `qorsdk`로 임포트), Go
클라이언트는 모듈 프록시에 있고
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, 태그
`packages/go/v0.7.0`), Java 클라이언트는 Maven Central에 있습니다
(`io.github.qorechain:qorechain-sdk:0.7.0`). Rust 클라이언트는 crates.io에
(`cargo add qorechain-sdk`) **가장 최근에 게시된 크레이트 버전**으로 올라와 있으며,
현재 0.7.0보다 뒤처져 있습니다 — crates.io 또는 저장소에서 설치하세요. 언어별 전체
설치 명령은 [설치](/sdk/install)를 참고하세요.

## 니모닉이 거부됩니다

SDK는 키를 파생하기 전에 BIP-39 단어 목록**과** 체크섬을 모두 검증하므로, 오타가 있는
문구는 조용히 잘못된 계정을 만들어내는 대신 예외를 발생시킵니다. 단어를 다시 확인하고,
`validateMnemonic`으로 문구를 테스트하세요.

## 하이브리드(PQC) 트랜잭션

하이브리드(클래식 + ML-DSA-87) 제출은 Native 경로에서 **가동 중이며 필수**입니다 —
클래식 서명만 사용한 Native 트랜잭션은 온체인에서 거부됩니다(체인
v3.1.85). 하이브리드 트랜잭션이 PQC 검증을 통과하려면 먼저 서명자의 PQC 공개 키가
등록되어 있어야 하며(`MsgRegisterPQCKeyV2`), 또는
`includePqcPublicKey: true`를 설정하여 최초 사용 시 자동 등록되도록 키를 포함시킬 수 있습니다.
체인은 **결정론적(deterministic)** ML-DSA-87 서명만 허용합니다(SDK는 0.5.1부터 기본적으로
결정론적으로 서명합니다). 헤지드(hedged) 서명은 `pqc`
코드 21(`hybrid_verify_failed`)로 실패합니다. 자세한 내용은
[계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참고하세요.

## 하이브리드 트랜잭션이 CheckTx에서 tx parse 오류로 실패합니다

SDK를 업그레이드하세요. **0.6.0 및 그 이전** 버전은
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 확장을 JSON으로 직렬화했는데, 체인의
tx 디코더가 이를 CheckTx에서 거부합니다. **0.6.1**부터는 다섯 개 언어 모두에서 이
확장이 protobuf로 인코딩됩니다(값이 `0x08`로 시작). 이전 버전으로 만든 하이브리드
트랜잭션은 모든 레인(eth-native 포함)에서 온체인 거부됩니다.

## 인증기(authenticator) 지출이 `authenticator_replay`로 거부됩니다

논스(nonce)가 잘못되었습니다. `MsgExecuteEVM.nonce`는 해당 계정의 **현재** EVM
논스여야 하며(릴레이어는 별도의 계정이므로 1을 더하지 **마세요**),
`MsgExecuteCosmos.nonce`는 `(account, pubkey)`에 대한 **인증기별 시퀀스**로,
별도의 스토어 카운터입니다. 값을 다시 조회한 뒤 재서명하세요.
그 밖의 인증기 실패는 `decodeTxError`로 디코딩할 수 있습니다: `abstractaccount`
코드 5(`spending_limit_exceeded`), 6(`session_key_expired`),
10(`permission_denied`). 자세한 내용은
[인증기 및 위임 지출](/sdk/guides/authenticators)을 참고하세요.
