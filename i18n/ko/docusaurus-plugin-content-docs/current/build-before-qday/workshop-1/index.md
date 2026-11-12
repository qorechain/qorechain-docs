---
slug: /build-before-qday/workshop-1
title: "워크숍 1: 첫 하이브리드 서명 트랜잭션"
sidebar_label: "워크숍 1"
sidebar_position: 2
date: 2026-11-12
---

# 워크숍 1: 첫 하이브리드 서명 트랜잭션

이 가이드는 아무것도 설치되지 않은 컴퓨터에서 출발해, 두 개의 키로 동시에 서명하고 QoreChain 테스트넷이 검증한 트랜잭션 하나까지 안내합니다. 모든 작업은 여러분의 환경에서 일회용 테스트넷 계정으로 진행됩니다.

## 만들 것 {#what-we-built}

명령 하나로 스캐폴딩한 완전한 Solidity 프로젝트를 테스트하고 QoreChain 테스트넷에 배포한 다음, **두 개의 키로 동시에 서명**한 트랜잭션 하나를 체인이 검증하게 합니다.

이 워크숍이 보여 주는 것은 다음과 같습니다.

- **하이브리드 서명.** 트랜잭션에는 기존 방식의 secp256k1 서명과 양자 내성 ML-DSA-87 서명(NIST FIPS 204)이 함께 담깁니다.
- **온체인에서 검증되는 하이브리드 서명 트랜잭션 하나.** 검증자가 두 서명을 모두 검증합니다. 증거는 공개 REST 엔드포인트(`PQCHybridSignature` 확장과 `pqc_hybrid_verify` 이벤트)와 익스플로러에서 읽을 수 있습니다.
- **EVM 승인 윈도우.** 이더리움 트랜잭션에는 양자 내성 서명을 담을 수 없으므로, QoreChain에서는 ML-DSA-87 키를 한 번 등록한 뒤 하이브리드 서명 메시지로 짧은 윈도우를 엽니다. 이 윈도우 동안 일반 EVM 트랜잭션이 허용됩니다. 자세한 개념은 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes)를 참고하세요.

이는 Quantum Pass 레벨이 요구하는 내용과 정확히 일치합니다.

## 사전 준비 {#prerequisites}

macOS, Linux 또는 Windows(WSL)가 설치된 컴퓨터, 터미널, 웹 브라우저가 필요합니다. 먼저 아래 도구를 설치하고 각 버전을 확인하세요.

| 도구 | 버전 | 확인 | 설치 |
| --- | --- | --- | --- |
| Node.js | 22 이상(Hardhat 3에서 필요) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 이상 | `pnpm -v` | `npm install -g pnpm`(또는 `corepack enable`) |
| curl | 아무 버전 | `curl --version` | macOS와 Linux에 기본 포함 |
| jq(선택) | 아무 버전 | `jq --version` | [jqlang.org](https://jqlang.org), 6단계에서 출력을 걸러 내는 데만 사용 |

포셋을 쓰려면 QoreChain 대시보드 계정도 필요합니다(4단계).

이 가이드에서 사용하는 네트워크와 공개 엔드포인트는 다음과 같습니다.

| 서비스 | URL |
| --- | --- |
| 테스트넷 | `qorechain-diana`, EVM 체인 ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| 익스플로러 | `https://explore.qore.network`(Testnet으로 전환) |
| 포셋 | `https://dashboard.qorechain.io/faucet`(로그인 필요) |

:::caution 일회용 테스트넷 키만 사용하세요
이 실습을 위해 만든, 테스트 QOR만 들어 있는 키를 사용하세요. 실제 자금이 있는 계정의 키나 복구 코드는 절대 `.env`에 넣지 마시고, `.env`를 git에 커밋하지 마세요.
:::

## 단계 {#steps}

### 1단계: 도구 확인 {#step-1}

1. 터미널을 엽니다.
2. 위 표의 확인 명령을 실행합니다.

```bash
node -v
pnpm -v
```

`node -v`는 `v22` 이상을 출력해야 합니다. 그렇지 않다면 계속하기 전에 더 새로운 Node.js를 설치하세요.

### 2단계: 프로젝트 스캐폴딩과 테스트 실행 {#step-2}

1. 새 폴더에 프로젝트를 만듭니다. `npx` 명령이 스캐폴더를 내려받으므로 인터넷 연결이 필요합니다.

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. 폴더로 이동해 테스트를 실행합니다. 테스트는 로컬 시뮬레이션 체인에서 실행되며 아무것도 전송하지 않습니다.

```bash
cd qday-demo
pnpm test
```

`Done! Created qday-demo`가 나오고, 이어서 테스트 결과로 `2 passing`이 보여야 합니다.

3. 생성된 내용을 살펴봅니다. `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts`(승인 윈도우용 헬퍼), 그리고 `qorechainTestnet` 네트워크(체인 ID 9800)가 설정된 `hardhat.config.ts`가 있습니다. 템플릿에 대한 자세한 내용은 [스캐폴더와 CLI](/developer-tools/scaffolders-and-cli)와 [체인 개발자 키트](/developer-tools/chain-dev-sdk)를 참고하세요.

### 3단계: 일회용 테스트넷 계정 만들기 {#step-3}

계정에는 두 가지 비밀 값이 필요합니다. 이더리움 방식의 개인 키, 그리고 양자 내성 ML-DSA-87 키를 파생하는 **복구 코드**(`QRC1`로 시작)입니다. 아래 명령은 프로젝트에 이미 설치된 라이브러리로 둘 다 생성해 새 `.env` 파일에 바로 기록하므로, 화면에 출력되거나 어디에 붙여 넣을 일이 없습니다. `qday-demo` 폴더 안에서 실행하세요.

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

`.env written`이 출력됩니다. 참고 사항은 다음과 같습니다.

- 이 명령은 스캐폴더가 만든 자리표시자 `.env`를 덮어씁니다. 한 번만 실행하세요. 다시 실행하면 다른 계정과 다른 양자 내성 키가 만들어집니다.
- `.env`는 그대로 보관하세요. 같은 개인 키와 같은 복구 코드가 있으면 언제나 같은 계정이 나옵니다. 파일을 잃어버리면 새 계정으로 처음부터 다시 시작해야 합니다.
- 니모닉을 쓰고 싶다면 위의 두 줄 대신 `.env`에 `QORE_MNEMONIC="your twelve words"`를 넣으세요. 니모닉을 쓰면 두 키가 같은 문구에서 나오므로 복구 코드가 필요 없습니다. 이 실습만을 위해 만든 문구를 사용하세요.

이제 프로젝트에 새 계정의 주소를 물어봅니다.

```bash
pnpm window status
```

세 줄이 보여야 합니다.

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

`qor1...` 주소를 복사하세요. 포셋에 입력할 주소입니다.

### 4단계: 포셋에서 테스트넷 QOR 받기 {#step-4}

1. 브라우저에서 [포셋](https://dashboard.qorechain.io/faucet)을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣습니다(대시보드가 주소를 알고 있다면 **Use my address**를 선택해도 됩니다).
3. **Request Tokens**를 선택합니다. 카드에 100 QOR와 페스트 테스트 토큰이 함께 **Tokens Sent!**로 표시되고, **View on Explorer** 링크가 나타납니다.

포셋은 계정당, 주소당 24시간에 한 번 지급합니다. 정확한 수량은 [포셋](/dashboard/faucet)에 있습니다. 터미널로 돌아와 계정이 이제 체인에 존재하는지 확인합니다.

```bash
pnpm window status
```

이제 "does not exist on chain yet"로 실패하지 않고 정상적으로 응답합니다.

### 5단계: 키 등록, 윈도우 열기, 배포 {#step-5}

1. ML-DSA-87 키를 등록합니다. 계정당 한 번만 하는 단계이며, 체인이 등록 시 요구하는 대로 기존 키로 서명합니다.

```bash
pnpm window register
```

`registered: <HASH>`가 출력됩니다.

2. 승인 윈도우를 엽니다. 이것 자체가 **하이브리드 서명** 트랜잭션입니다.

```bash
pnpm window open
```

`opened: <HASH>`가 출력되고, 이어서 `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)` 같은 줄이 나옵니다. `opened:` 해시를 적어 두세요. 6단계에서 검증합니다.

3. 약 10초 기다립니다. 윈도우가 계정 논스를 올렸고, Hardhat이 컨펌을 기다립니다.
4. 컨트랙트를 빌드하고 배포합니다.

```bash
pnpm build
pnpm deploy:testnet
```

"Confirm deploy to network qorechainTestnet (9800)?"에 `y`로 답하세요. `CounterModule#Counter - 0x...`가 보여야 합니다.

### 6단계: 온체인에서 하이브리드 서명 검증 {#step-6}

5단계의 `opened:` 트랜잭션은 두 키로 서명되었습니다. `<HASH>`를 그 해시로 바꿔 공개 REST 엔드포인트에서 읽어 보세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

확인할 항목은 다음과 같습니다.

1. `tx_response.code`가 `0`입니다.
2. 트랜잭션 본문에 ML-DSA-87 서명을 담은 `PQCHybridSignature` 확장이 있고, 크기는 **4,627바이트**이며 64바이트 secp256k1 서명 옆에 있습니다.
3. `tx_response.events`에 `status` 속성이 `verified`인 `pqc_hybrid_verify` 이벤트가 있습니다. 이 이벤트만 출력하려면(`jq` 필요) 다음을 실행하세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

그런 다음 익스플로러에서도 확인합니다.

1. [explore.qore.network](https://explore.qore.network)를 엽니다.
2. 네트워크 선택기를 **Testnet**으로 전환합니다.
3. 해시를 검색합니다. 트랜잭션 페이지에 서명 보안이 양자 안전, 온체인 검증됨, ML-DSA-87 알고리즘(FIPS 204)으로 표시됩니다.

이것이 증거입니다. 검증자가 두 서명을 모두 확인했습니다.

## 확인할 결과 {#what-you-should-see}

| 위치 | 내용 |
| --- | --- |
| 2단계 이후 | `Done! Created qday-demo`와 `2 passing` |
| 3단계 이후 | `.env written`, 이어서 `0x...`와 `qor1...` 주소가 담긴 `account:` 줄 |
| 4단계 이후 | 포셋의 **Tokens Sent!**, 그리고 `pnpm window status`에서 계정이 존재함 |
| 5단계 이후 | `registered: <HASH>`, `opened: <HASH>`, 이어서 `CounterModule#Counter - 0x...` |
| 6단계 이후 | `code` 0, 4,627바이트 ML-DSA-87 서명, `status`가 `verified`인 `pqc_hybrid_verify`가 REST 출력과 Testnet의 익스플로러 모두에 표시됨 |

## 사용한 패키지 {#published}

스캐폴딩된 `package.json`에 선언된 패키지입니다.

| 패키지 | 레지스트리 | 버전 |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

스캐폴더는 생성된 `package.json`에 나열된 Hardhat toolbox, Ignition, keystore 플러그인도 함께 설치합니다.

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| 윈도우를 연 직후 `HHE10402` 또는 "wait for confirmations" | 윈도우를 열면서 계정 논스가 올라감 | `pnpm deploy:testnet`을 다시 실행 |
| "EVM authorisation window exhausted" 또는 "no window" | 윈도우의 트랜잭션 수나 블록이 소진되었거나, 다른 컨트랙트로 범위가 제한됨(다른 컨트랙트로 제한된 윈도우는 배포를 막음) | `pnpm window open`으로 새 윈도우를 열고 약 10초 기다린 뒤 다시 배포 |
| "account has no PQC key and classical fallback is disabled" | 계정에 ML-DSA-87 키가 등록되지 않음 | 먼저 `pnpm window register`를 실행한 뒤 윈도우를 열기 |
| "does not exist on chain yet" | 계정에 아직 QOR가 없음 | 포셋에서 QOR 받기(4단계) |
| 포셋에서 "Rate Limit Reached", 또는 30초가 지나도 토큰이 오지 않음 | 계정당, 주소당 24시간에 한 번만 받을 수 있고 요청은 한 번에 하나씩 처리됨 | 몇 초 기다렸다가 다시 시도하거나 쿨다운이 끝날 때까지 대기 |
| `pnpm window`가 복구 코드 누락 메시지와 함께 멈춤 | `.env`에 `PRIVATE_KEY`는 있고 `QORE_PQC_RECOVERY_CODE`가 없음 | 3단계를 다시 실행하거나 `QORE_MNEMONIC` 사용 |
| Hardhat이 시작되지 않음 | Node.js가 22보다 오래됨 | Node.js 22 이상을 설치하고 `pnpm install`을 다시 실행 |

## 예제 앱 {#example-apps}

같은 흐름을 여러 언어와 프런트엔드로 구현한 앱입니다. 모두 하이브리드로 서명합니다. 전부 공개 저장소 [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)의 `workshop-1` 폴더에 있습니다. 다음 명령으로 받으세요.

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

각 앱 페이지는 처음부터 끝까지 다루는 독립된 가이드입니다.

| 앱 | 언어 | 페이지 |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

이 앱들의 바탕이 되는 키트는 [키트](/build-before-qday/workshop-1/kits)에 정리되어 있습니다. 브라우저 dApp에서 QoreX 지갑을 사용하려면 [QoreX](/qorex/overview)를 참고하세요.
