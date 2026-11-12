---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector는 테스트넷 `qorechain-diana`에서 QoreChain 하이브리드 서명이 어떤 모습인지 보여 주는 작은 React 페이지입니다. QoreX 지갑을 연결해 QoreX가 secp256k1과 ML-DSA-87 둘 다로 서명하는 트랜잭션 하나를 보내면, 페이지가 그 트랜잭션을 열어 기존 방식의 서명, 양자 내성 서명, 그리고 체인의 판정을 보여 줍니다. 아무 테스트넷 트랜잭션 해시를 붙여 넣을 수도 있습니다.

## 보여 주는 것 {#what-it-shows}

- **웹 페이지에서 하는 하이브리드 ML-DSA-87 + secp256k1 서명.** 페이지가 `qorexSignAndBroadcast`로 인코딩된 메시지를 QoreX에 넘깁니다. QoreX가 두 키로 서명하고 브로드캐스트합니다.
- **온체인에서 검증되는 하이브리드 서명 트랜잭션 하나.** 페이지는 해당 트랜잭션에 대한 체인의 `pqc_hybrid_verify` 이벤트를 읽습니다. 이 이벤트는 체인이 양자 내성 서명을 확인했다는 표시입니다.
- **크기를 눈으로 볼 수 있습니다.** 기존 방식의 서명은 64바이트입니다. ML-DSA-87 서명(FIPS 204)은 4,627바이트이며 트랜잭션의 `PQCHybridSignature` 확장에 담겨 전달됩니다.

## 단계별 안내 {#steps}

### 1. 도구 설치

Chromium 기반 브라우저(Chrome, Edge, Brave), Git, Node.js 20 이상, pnpm이 필요합니다.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (LTS 릴리스면 충분합니다)
- pnpm: `npm install -g pnpm`

버전을 확인합니다.

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. QoreX 브라우저 확장 프로그램 설치

브라우저의 스토어에서 QoreX를 설치합니다. 자세한 내용은 [QoreX 통합](/developer-tools/qorex-integrations)과 [dApp 브라우저](/qorex/dapp-browser)를 참고하세요.

### 3. QoreX에서 일회용 테스트넷 계정 만들기

이 워크숍에서는 실제 지갑이 필요하지 않습니다. QoreX에서 이 실습에만 쓸 **새** 계정(새 프로필 또는 새 지갑)을 만들고 테스트넷 `qorechain-diana`로 전환하세요. 테스트넷 전환 방법은 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes#step-testnet)를 참고하세요. QoreX는 계정을 만들 때 복구 문구를 보여 줍니다. 종이에 적어 비공개로 보관하고, 메인넷에서는 절대 재사용하지 마세요. 이 계정은 이 실습 외에는 아무 가치가 없습니다.

계정 주소(`qor1...`로 시작)를 복사합니다.

### 4. 포셋에서 테스트넷 QOR 받기

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 받습니다. 한 번 받으면 100 QOR가 지급되며, 계정당 24시간에 한 번 가능합니다.

### 5. 코드 받기

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. 의존성 설치

```sh
pnpm install
```

### 7. 빌드되는지 확인

```sh
pnpm build
```

이 명령은 프로젝트를 타입 검사하고 빌드합니다. 마지막에 `built in`과 시간이 출력됩니다.

### 8. 페이지 실행

```sh
pnpm dev
```

QoreX가 설치된 브라우저에서 http://localhost:5173 을 엽니다. 트랜잭션을 바로 조사하려면 주소 뒤에 `?tx=<HASH>`를 붙이세요(`http://localhost:5173?tx=<HASH>`). 5173 포트가 사용 중이면 Vite가 대신 사용하는 포트를 출력합니다.

REST 호출은 Vite 프록시 `/lcd`를 거쳐 `https://api-testnet.qore.host`로 전달됩니다. 공개 REST 엔드포인트가 CORS 헤더를 보내지 않기 때문입니다. 이 페이지는 테스트넷에서만 동작하며 `.env` 파일이 필요하지 않습니다.

### 9. 연결, 전송, 검증

1. **Connect QoreX**를 클릭합니다. 페이지에 주소(`qor1...`), 테스트넷 잔액, ML-DSA-87 키 등록 여부가 표시됩니다. QoreX는 첫 전송 때 키를 등록합니다.
2. 메모와 함께 소액의 QOR를 **Send**합니다. QoreX가 서명할 내용을 보여 주고 승인을 요청합니다.
3. 페이지가 트랜잭션을 자동으로 조사합니다. 64자리 테스트넷 트랜잭션 해시를 직접 붙여 넣을 수도 있습니다.

## 코드 {#code}

연결과 전송입니다.

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

체인에서 증거 읽기입니다.

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes`는 `src/App.tsx`에 있는, 뱅크 `MsgSend` 메시지용의 작은 protobuf 인코더입니다. QoreX가 인코딩된 메시지를 받기 때문입니다. 페이지는 트랜잭션의 코드가 0이고, `pqc_hybrid_verify` 이벤트의 상태가 `verified`이며, 양자 내성 서명이 4,627바이트일 때 그 트랜잭션을 하이브리드 검증됨으로 표시합니다.

## 확인할 결과 {#result}

- 헤더에 `qorechain-diana (testnet)`과 계속 올라가는 블록 높이가 표시됩니다.
- 연결 후: 주소, 잔액, 키 상태가 표시됩니다.
- 전송 후: 트랜잭션 해시와 결과 코드가 나오고, 이어서 조사 카드에 메모, 메시지 유형, 64바이트 기존 서명, 앞부분 바이트를 16진수로 보여 주는 4,627바이트 ML-DSA-87 서명, 알고리즘 이름 `ML-DSA-87 (FIPS 204)`, 그리고 `pqc_hybrid_verify` 판정이 표시됩니다.
- 익스플로러에서: https://explore.qore.network 를 열고 **Testnet**으로 전환한 뒤 트랜잭션 해시를 검색합니다.

## 사용한 패키지 {#packages}

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0(고정) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | 의존성으로 나열되어 있으며, 페이지 자체는 일반 REST 호출을 사용 |
| `react`, `react-dom` | ^18.3.1 | 인터페이스 |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React 플러그인 |
| `vite` | ^5.4.0 | 개발 서버와 빌드 |
| `typescript` | ^5.6.3 | 타입 검사 |

## 소스 코드 {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
