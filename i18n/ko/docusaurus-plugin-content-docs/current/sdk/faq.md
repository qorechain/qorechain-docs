---
slug: /sdk/faq
title: FAQ 및 문제 해결
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ 및 문제 해결

## 메인넷이 가동 중인가요?

네. 메인넷은 **가동 중**입니다(체인 ID `qorechain-vladi`). 테스트넷 프리셋
(`qorechain-diana`)도 계속 사용할 수 있습니다. 두 프리셋 모두 localhost 엔드포인트
기본값을 제공합니다. `createClient({ network: "mainnet" })`로 네트워크를 선택하고
`endpoints`를 여러분의 노드 URL로 재정의하세요.
[네트워크 및 엔드포인트](/sdk/reference/network)를 참고하세요.

## 왜 제 호출이 localhost로 가나요?

`createClient()`는 기본적으로 **localhost** 엔드포인트를 사용합니다. 실제 노드와
통신하려면 `endpoints` 객체를 전달하세요:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

서명 경로(`connectTx`)에는 합의 **`rpc`** 엔드포인트가 필요하며, CosmWasm 읽기도
이를 사용합니다. REST 읽기는 `rest`를 사용하고, EVM 및 `qor_` 호출은 `evmRpc`를
사용합니다.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

이들은 각각 `@qorechain/evm`과 `@qorechain/svm`의 **피어 의존성**입니다. 프로젝트에
설치하세요:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## 프리컴파일 호출이 "feature not present"를 던집니다

EVM 프리컴파일은 QoreChain EVM Engine을 실행하는 노드에만 존재합니다. 일반 EVM 노드에서는
해당 호출이 실패합니다. 이기종 노드를 대상으로 한다면, 각 프리컴파일 호출을 감싸고 호출별로
에러를 처리하세요.

## 제 금액이 100만 배 차이가 납니다

QOR에는 **10^6** 베이스 `uqor` 단위가 있습니다. `toBase` / `fromBase`를 사용하고
모든 계산을 베이스 단위로 하세요:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

EVM 런타임은 QOR를 **18** 자릿수(EVM 관례)로 표현하며, 이는 Cosmos `uqor` 베이스인
10^6과는 별개라는 점에 유의하세요.

## 어떤 패키지가 어디에 게시되어 있나요?

전부 게시되어 있습니다. TypeScript 코어(`@qorechain/sdk`)와 EVM/SVM 어댑터
(`@qorechain/evm`, `@qorechain/svm`)는 npm에 `0.3.0`으로 있고, Python 클라이언트는
PyPI에 있으며(`pip install qorechain-sdk`로 `0.3.1`, import는 `qorsdk`), Rust
클라이언트는 crates.io에 있고(`cargo add qorechain-sdk`로 `0.3.0`), Go 클라이언트는
모듈 프록시에 있습니다(`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
언어별 전체 명령은 [설치](/sdk/install)를 참고하세요.

## 제 니모닉이 거부됩니다

SDK는 키를 파생하기 전에 BIP-39 단어 목록 **과** 체크섬을 모두 검증하므로, 오타가 있는
구문은 조용히 잘못된 계정을 생성하는 대신 예외를 발생시킵니다. 단어를 다시 확인하세요.
구문을 테스트하려면 `validateMnemonic`을 사용하세요.

## 하이브리드(PQC) 트랜잭션

로컬 ML-DSA-87 서명/검증과 하이브리드 tx 빌드 헬퍼는 오늘날 사용할 수 있습니다.
하이브리드 tx가 온체인에서 PQC 검증되기 전에는, 서명자의 PQC 공개 키가 등록되어 있어야
하거나(`MsgRegisterPQCKey`), 자동 등록을 위해 `includePqcPublicKey: true`를 설정하여
키를 임베드해야 합니다. 전체 하이브리드 제출은 가동 중인 네트워크를 위해 마무리 단계에
있습니다. [계정 및 PQC 서명](/sdk/concepts/accounts-pqc)을 참고하세요.
