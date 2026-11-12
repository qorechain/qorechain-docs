---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: 하이브리드 인스펙터
sidebar_label: 하이브리드 인스펙터
sidebar_position: 3
---

# 하이브리드 인스펙터

하이브리드 인스펙터는 테스트넷 `qorechain-diana`에서 QoreChain 하이브리드 서명이 어떤 모습인지 보여 주는 작은 웹 페이지입니다(React로 제작). QoreX 지갑을 연결하고, QoreX가 secp256k1과 ML-DSA-87 두 가지로 서명하는 트랜잭션을 한 건 보내면, 페이지가 그 트랜잭션을 열어서 보여 줍니다. 기존 방식 서명, 양자 내성 서명, 그리고 체인 자체의 판정입니다. 테스트넷 트랜잭션 해시를 직접 붙여 넣어 확인할 수도 있습니다.

**소요 시간:** 설치를 포함해 약 20분입니다. 그 이후에는 페이지가 몇 초 만에 실행됩니다.

## 보여 주는 것 {#what-it-shows}

- **웹 페이지에서 하는 하이브리드 ML-DSA-87 + secp256k1 서명.** 페이지는 인코딩된 메시지를 `qorexSignAndBroadcast`로 QoreX에 넘깁니다. QoreX가 두 키로 서명한 뒤 브로드캐스트합니다.
- **체인에서 검증된 하이브리드 서명 트랜잭션 한 건.** 페이지는 해당 트랜잭션의 `pqc_hybrid_verify` 이벤트를 읽습니다. 이 이벤트는 체인이 양자 내성 서명을 검사했다고 알려 주는 기록입니다.
- **크기를 눈으로 확인할 수 있습니다.** 기존 방식 서명은 64바이트입니다. ML-DSA-87 서명(FIPS 204)은 4,627바이트이며 트랜잭션의 `PQCHybridSignature` 확장에 담겨 전달됩니다.

## 단계별 안내 {#steps}

자신의 터미널과 브라우저에서 작업합니다. 반드시 일회용 테스트넷 계정만 사용하세요. 테스트넷 QOR에는 가치가 없습니다. 여기서는 실제 지갑이나 실제 자금을 절대 사용하지 마세요.

### 1. 시작 전에: 도구 설치 {#install}

네 가지가 필요합니다. Chromium 기반 브라우저(Chrome, Edge 또는 Brave), **Git**(코드 내려받기), **Node.js**(페이지의 도구 실행), **pnpm**(페이지의 라이브러리 설치)입니다. Node.js는 22 이상을 사용하세요. 이 페이지는 Node.js 20에서도 동작하지만, 모든 워크숍 앱에서 안전한 선택은 22입니다.

**macOS**

| 도구 | 설치 방법 | 확인 방법 |
| --- | --- | --- |
| Git | `xcode-select --install` (또는 `brew install git`) | `git --version` |
| Node.js 22+ | https://nodejs.org 에서 LTS 설치 프로그램을 내려받거나 `brew install node` 실행 | `node --version` (v22 이상이 표시되어야 합니다) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (PowerShell 사용)

| 도구 | 설치 방법 | 확인 방법 |
| --- | --- | --- |
| Git | https://git-scm.com/download/win 에서 내려받기 | `git --version` |
| Node.js 22+ | https://nodejs.org 에서 LTS 설치 프로그램을 내려받기 (또는 `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian 또는 Ubuntu)**

| 도구 | 설치 방법 | 확인 방법 |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | https://nodejs.org/en/download 의 안내를 따르세요 (Linux를 선택한 뒤 LTS 버전 선택) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**주의할 점:** Homebrew로 설치한 Node.js에는 pnpm이 포함되어 있지 않습니다. `pnpm: command not found`가 표시되면 `npm install -g pnpm`을 실행한 다음 새 터미널을 여세요.

**표시되는 내용:** 확인 명령은 모두 버전 번호를 출력합니다. `node --version`은 `v22` 이상으로 시작합니다.

### 2. 시작 전에: 테스트넷의 QoreX {#qorex}

QoreX는 QoreChain 공식 지갑입니다. 이 페이지를 여는 브라우저에는 **QoreX 브라우저 확장 프로그램**이 필요합니다. 사용 중인 브라우저의 스토어에서 설치하세요. [QoreX 통합](/developer-tools/qorex-integrations)과 [dApp 브라우저](/qorex/dapp-browser)를 참고하세요.

이 실습만을 위해 만든 **새 일회용 계정**을 사용하세요. QoreX는 계정을 만들 때 복구 문구를 보여 줍니다. 종이에 적어 비공개로 보관하고, 메인넷에서는 절대 재사용하지 마세요.

QoreX를 테스트넷으로 전환합니다.

- **브라우저 확장 프로그램:** 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.
- **QoreX 앱:** 설정을 열고 **Use testnet (developers)**를 켭니다. (이 페이지는 데스크톱 브라우저에서 실행되므로, 이 튜토리얼에서는 확장 프로그램을 사용합니다.)

테스트넷 전환에 대한 자세한 내용은 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes#step-testnet)를 참고하세요. 계정 주소(`qor1...`로 시작)를 복사해 두세요.

이 페이지는 QoreChain Native 결제를 보내므로 이더리움 계정(coin 60)은 필요하지 않습니다.

### 3. 파우셋에서 테스트넷 QOR 받기 {#faucet}

파우셋은 주소로 무료 테스트넷 QOR를 보내 주는 웹사이트입니다.

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 요청합니다. 파우셋은 **계정당 24시간에 100 QOR**를 지급합니다.

**금액:** 여러분이 읽는 단위는 **QOR**입니다. 체인은 가장 작은 단위인 **uqor**로 계산합니다. 1 QOR = 1,000,000 uqor입니다. 페이지는 QOR로 금액을 입력받고 알아서 변환해 줍니다.

**알아 두세요:** 새 계정의 첫 번째 트랜잭션은 양자 내성 ML-DSA-87 키를 체인에 등록합니다. 한 번만 내는 약 0.09 QOR의 수수료가 듭니다. QoreX가 첫 전송 때 자동으로 처리해 줍니다.

### 4. 코드 받기 {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| 부분 | 의미 |
| --- | --- |
| `git clone <address>` | GitHub에서 예제 앱 전체 사본을 `build-before-qday`라는 새 폴더로 내려받습니다. |
| `cd <folder>` | 터미널을 하이브리드 인스펙터 폴더로 이동합니다. 이후 명령은 모두 여기서 실행합니다. |

**표시되는 내용:** `Cloning into 'build-before-qday'...`. `ls`를 실행해 확인하세요. `package.json`, `src`, `index.html`, `vite.config.ts`가 보입니다.

### 5. 라이브러리 설치 {#install-libs}

```sh
pnpm install
```

**하는 일:** `pnpm`이 페이지에 필요한 라이브러리(`package.json`에 나열됨)를 `node_modules`라는 폴더로 내려받습니다. 프로젝트당 한 번만 실행합니다.

| 부분 | 의미 |
| --- | --- |
| `pnpm` | 라이브러리를 설치하는 도구입니다. |
| `install` | `package.json`을 읽고, 나열된 모든 것을 `pnpm-lock.yaml`에 적힌 버전으로 설치합니다. |

**소요 시간:** 1분 미만입니다.

**표시되는 내용:** 진행 표시줄이 나온 뒤 `Done in`과 시간이 표시됩니다.

### 6. 빌드되는지 확인 {#build}

```sh
pnpm build
```

**하는 일:** `package.json`에 있는 `build`라는 스크립트를 실행합니다. 이 스크립트는 `tsc --noEmit && vite build`입니다.

| 부분 | 의미 |
| --- | --- |
| `pnpm build` | 프로젝트의 `build` 스크립트를 실행합니다. |
| `tsc --noEmit` | TypeScript 검사기입니다. 코드의 실수를 찾으며 파일은 만들지 않습니다. |
| `vite build` | Vite가 페이지를 작은 웹사이트로 묶어 `dist` 폴더에 만듭니다. |

**표시되는 내용:** `transforming...`이 나온 뒤 `dist/index.html` 같은 줄들이 나오고, 마지막에 `built in`과 시간이 표시됩니다(1초가 채 안 걸립니다).

### 7. 페이지 실행 {#run}

```sh
pnpm dev
```

**하는 일:** `dev` 스크립트를 실행하여 내 컴퓨터에서 작은 웹 서버를 시작합니다. 그러면 브라우저에서 페이지를 사용할 수 있습니다. 작업하는 동안 이 터미널을 열어 두세요. Ctrl+C를 누르면 중지됩니다.

**표시되는 내용:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

QoreX가 설치된 브라우저에서 http://localhost:5173 을 여세요. 5173 포트가 이미 사용 중이면 Vite가 다른 포트를 출력합니다. 출력된 주소를 사용하세요.

트랜잭션을 바로 확인하려면 주소 뒤에 `?tx=<HASH>`를 붙이세요: `http://localhost:5173?tx=<HASH>`.

**페이지가 `/lcd`를 호출하는 이유:** 공개 테스트넷 REST 서비스는 CORS 헤더를 보내지 않으므로 브라우저 페이지가 직접 호출할 수 없습니다. 개발 서버가 `/lcd`로 들어온 모든 호출을 `https://api-testnet.qore.host`로 전달해 줍니다. 이 페이지는 테스트넷에서만 동작하며 `.env` 파일이 필요 없습니다.

### 8. 연결, 전송, 검증 {#connect-send}

1. **연결.** **Connect QoreX**를 클릭합니다. QoreX가 페이지를 허용할지 묻습니다. 승인하세요. 페이지에 내 주소(`qor1...`), 테스트넷 잔액, ML-DSA-87 키 등록 여부가 표시됩니다. 첫 전송 전까지는 "not registered yet"이라고 표시됩니다.
2. **전송 양식 작성.**

| 항목 | 의미 |
| --- | --- |
| To | 받는 사람의 주소(`qor1...`)입니다. 기본값은 내 주소이며 그대로 두어도 괜찮습니다. |
| Amount (QOR) | 보낼 금액(QOR 단위)입니다. `1`은 1 QOR = 1,000,000 uqor를 뜻합니다. |
| Memo | 트랜잭션에 첨부되어 체인에 저장되는 짧은 글입니다. 누구나 읽을 수 있으므로 개인적인 내용은 쓰지 마세요. |

3. **전송.** **Sign with QoreX and send**를 클릭합니다. QoreX가 서명할 내용을 보여 주고 승인을 요청합니다. 승인하세요. 블록이 생성될 때까지(몇 초) 기다립니다.
4. **검사.** 페이지가 트랜잭션을 자동으로 검사합니다. 페이지의 3단계에서 64자리 테스트넷 트랜잭션 해시를 붙여 넣고 **Inspect**를 클릭해도 됩니다.

**표시되는 내용:** `QoreX: code 0, shield ..., tx <hash>` 한 줄, 그리고 아래 "화면에 표시되는 결과"에서 설명하는 검사 카드가 나타납니다. 트랜잭션 해시를 복사해 두세요.

### 9. 페이지 없이 두 번째 방법으로 검증하기 {#verify-curl}

체인에 직접 물어볼 수 있습니다. 필요한 것은 `curl`뿐이며, macOS와 대부분의 Linux에는 이미 들어 있습니다. Windows PowerShell에서는 `curl.exe`를 사용하세요. `jq`는 선택 사항이며 결과를 읽기 쉽게 해 줍니다(macOS는 `brew install jq`, Linux는 `sudo apt install -y jq`, Windows는 `winget install jqlang.jq`).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| 부분 | 의미 |
| --- | --- |
| `curl -s <address>` | 테스트넷 REST 서비스에서 응답을 내려받습니다. `-s`는 진행 표시줄을 숨깁니다. |
| `<HASH>` | 8단계에서 얻은 내 트랜잭션 해시입니다. |
| `\| jq '...'` | 세 가지 값을 골라 보여 줍니다. `jq`가 없으면 이 부분을 빼고 전체 텍스트를 읽으세요. |

**표시되는 내용:**

- `code`가 `0`입니다. 트랜잭션이 성공했다는 뜻입니다.
- `pqc_signature`가 담긴 `PQCHybridSignature` 확장(타입 `/qorechain.pqc.v1.PQCHybridSignature`)이 있습니다. base64 텍스트 길이는 6,172자이며, 이는 4,627바이트의 ML-DSA-87 서명입니다.
- `tx_response.events`에 `pqc_hybrid_verify` 타입의 이벤트가 있고 `status` 속성이 `verified`입니다.

**탐색기에서:** https://explore.qore.network 를 열어 **Testnet**으로 전환한 다음 트랜잭션 해시를 검색하세요.

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm이 설치되어 있지 않습니다. Homebrew의 Node.js에는 포함되어 있지 않습니다. | `npm install -g pnpm`을 실행한 다음 새 터미널을 여세요. |
| `node --version`이 v18 이하로 표시됨 | Node.js가 너무 오래되었습니다. | Node.js 22 이상을 설치하세요(1단계). |
| 페이지에 `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.`가 표시됨 | 확장 프로그램이 없거나, 잠겨 있거나, 브라우저가 Chromium 기반이 아닙니다. | Chrome, Edge 또는 Brave에서 QoreX를 설치하고 잠금을 해제하세요. 테스트넷으로 전환한 뒤 페이지를 새로 고치세요. |
| 파우셋이 요청 한도에 걸렸다고 함 | 계정당 24시간에 한 번만 요청할 수 있습니다. | 24시간을 기다리거나 두 번째 일회용 계정을 사용하세요. |
| `account has no PQC key and classical fallback is disabled` | 양자 내성 키가 아직 등록되지 않았습니다. | QoreX에서 한 번 전송하세요(첫 전송 때 키가 등록되며 약 0.09 QOR가 듭니다). 먼저 파우셋에서 QOR를 받았는지 확인하세요. |
| `EVM authorisation window exhausted` | 이 페이지가 아니라 Hardhat 앱에 해당하는 메시지입니다. | 해당 앱에서 `pnpm window open`으로 새 윈도우를 여세요. |
| 윈도우를 연 뒤 `HHE10402` | Hardhat 앱에 해당합니다. 윈도우가 활성화되려면 몇 초가 걸립니다. | 배포를 다시 실행하세요. |
| 브라우저 콘솔의 CORS 오류 | 페이지가 REST 서비스를 직접 호출했습니다. | 개발 서버(`pnpm dev`)의 `/lcd` 프록시를 사용하고 `http://localhost:5173`에서 페이지를 여세요. `dist/index.html`을 파일로 열지 마세요. |
| `Enter an amount in QOR, for example 1.` | 금액이 비어 있거나 0이거나 숫자가 아닙니다. | `1` 같은 숫자를 입력하세요. |
| `A transaction hash is 64 hex characters.` | 붙여 넣은 해시가 틀렸거나 잘렸습니다. | 64자 전체를 붙여 넣으세요. |
| `Transaction not found on qorechain-diana` | 해시가 다른 네트워크의 것이거나, 블록이 아직 확정되지 않았습니다. | 10초 기다린 뒤 다시 시도하세요. QoreX가 테스트넷인지 확인하세요. |
| 5173 포트가 이미 사용 중 | 다른 프로그램이 사용하고 있습니다. | Vite가 다음 포트를 골라 출력합니다. 그 주소를 여세요. |

## 코드 {#code}

연결과 전송:

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

체인에서 증거 읽기:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

QoreX는 인코딩된 메시지를 받기 때문에, `msgSendBytes`는 `src/App.tsx`에 있는 뱅크 `MsgSend` 메시지용 작은 protobuf 인코더입니다. 페이지는 트랜잭션의 코드가 0이고, `pqc_hybrid_verify` 이벤트의 status가 `verified`이며, 양자 내성 서명이 4,627바이트일 때 그 트랜잭션을 하이브리드 검증 완료로 표시합니다.

## 화면에 표시되는 결과 {#result}

- 헤더에 `qorechain-diana (testnet)`과 계속 올라가는 블록 높이가 표시됩니다.
- 연결 후: 내 주소, 잔액, 키 상태가 표시됩니다.
- 전송 후: 트랜잭션 해시와 결과 코드, 그리고 메모, 메시지 타입, 64바이트 기존 방식 서명, 16진수 앞부분이 함께 표시되는 4,627바이트 ML-DSA-87 서명, 알고리즘 이름 `ML-DSA-87 (FIPS 204)`, `pqc_hybrid_verify` 판정이 담긴 검사 카드가 나타납니다.
- 탐색기에서: https://explore.qore.network 를 열어 **Testnet**으로 전환한 다음 트랜잭션 해시를 검색하세요.

## 사용된 패키지 {#packages}

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (고정) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | 의존성으로 나열되어 있으며, 페이지 자체는 일반 REST 호출을 사용합니다 |
| `react`, `react-dom` | ^18.3.1 | 인터페이스 |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React 플러그인 |
| `vite` | ^5.4.0 | 개발 서버와 빌드 |
| `typescript` | ^5.6.3 | 타입 검사 |

## 소스 코드 {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
