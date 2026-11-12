---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook은 QoreChain EVM 테스트넷 위의 온체인 방명록입니다. 누구나 주소당 한 번, 최대 140자의 메시지로 서명할 수 있습니다. 구성은 두 부분입니다. Hardhat 프로젝트와 Solidity 컨트랙트(`contracts-app/`), 그리고 QoreX 지갑을 연결하고 계정의 EVM 윈도우를 보여 주며 최신 서명을 실시간으로 나열하는 React 웹 페이지(`web/`)입니다.

## 보여 주는 것 {#shows}

- **모르는 사이에 하이브리드로 서명하는 브라우저 dApp.** 이 페이지는 평범한 wagmi와 RainbowKit 앱입니다. QoreX가 서명의 ML-DSA-87 절반을 더해 주므로, 같은 트랜잭션이 secp256k1과 양자 내성 키 모두로 보호됩니다.
- **인터페이스에서 EVM 윈도우가 보입니다.** 페이지가 체인에서 계정의 윈도우를 읽어, 유효한지와 남은 블록 및 트랜잭션 수를 표시합니다.
- **읽기 쉬운 거부 사유.** 체인이 쓰기를 거부하면 `classifyEvmWindowRejection`이 오류를 네 가지 원인(등록된 키 없음, 윈도우 없음, 윈도우 소진, 잘못된 파라미터) 중 하나로 분류하고, 페이지가 해결 방법을 보여 줍니다.
- **온체인에서 검증되는 하이브리드 서명.** 작성한 서명 하나하나는 체인이 두 서명(ML-DSA-87과 secp256k1)을 모두 확인한 뒤에야 받아들인 트랜잭션입니다.

## 시작하기 전에 {#prerequisites}

macOS, Linux 또는 WSL이나 Git Bash가 있는 Windows의 터미널과 다음 도구가 필요합니다.

| 도구 | 필요한 버전 | 확인 명령 |
| --- | --- | --- |
| Git | 최근 버전 아무거나 | `git --version` |
| Node.js | 20.12 이상(22 LTS 권장) | `node --version` |
| pnpm | 9 이상 | `pnpm --version` |

Node.js는 https://nodejs.org 에서 설치하세요. `pnpm --version`이 실패하면 `npm install -g pnpm`(또는 `corepack enable`)으로 pnpm을 설치한 뒤 다시 확인하세요.

포셋을 쓰려면 [QoreChain 대시보드](https://dashboard.qorechain.io)의 무료 계정이 필요하고, 브라우저 부분에는 QoreX 지갑(데스크톱 브라우저용 확장 프로그램 또는 앱)이 필요합니다. [QoreX 통합](/developer-tools/qorex-integrations)과 [QoreX 개요](/qorex/overview)를 참고하세요. 컨트랙트 단계에서는 실제 지갑을 쓰지 않고 일회용 테스트넷 계정을 사용합니다. 테스트넷 QOR에는 가치가 없습니다.

## 단계별 안내 {#steps}

### 1. 코드 받기 {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

프로젝트에는 따로 설정하는 폴더가 두 개 있습니다.

### 2. 컨트랙트: 설치와 테스트 {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

`QDayGuestbook` 테스트 결과로 `3 passing`이 보여야 합니다. 테스트는 로컬 시뮬레이션 체인에서 실행되며 키가 필요하지 않습니다.

### 3. 컨트랙트: 테스트넷 키 파일 만들기 {#step-account}

```sh
cp .env.example .env
```

`.env` 파일에는 일회용 키가 들어가므로 절대 커밋하지 마시고, 이 키를 실제 용도로 재사용하지 마세요. 아무 편집기에서나 `.env`를 열고 값 두 개를 채웁니다.

**a. 일회용 개인 키.** 무작위 32바이트 키를 생성합니다.

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

출력된 `0x...` 값을 `.env`에 `PRIVATE_KEY=0x...`로 복사해, 0으로만 채워진 자리표시자를 바꿉니다.

**b. 양자 내성 복구 코드.** 계정의 ML-DSA-87 키는 별도의 복구 코드에서 파생됩니다. 하나 만드세요.

```sh
pnpm window recovery-code
```

출력된 `QRC1-...` 줄을 `.env`에 `QORE_PQC_RECOVERY_CODE=QRC1-...`로 복사합니다. 항상 같은 코드를 다시 사용하세요. 새 코드를 쓰면 계정의 ML-DSA-87 키가 달라집니다.

`QORE_MNEMONIC`은 비워 두고 `QORE_NETWORK=testnet`은 그대로 둡니다. 이제 `.env`는 다음과 같은 모양이 됩니다(자리표시자로 표시).

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. 컨트랙트: 계정에 자금 넣기 {#step-faucet}

```sh
pnpm window status
```

첫 줄에 계정이 `0x...`와 `qor1...` 형식으로 출력됩니다. `qor1...` 주소를 복사한 뒤 다음을 진행합니다.

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 QOR를 요청합니다(24시간에 한 번 100 QOR).
3. 몇 초 기다린 뒤 `pnpm window status`를 다시 실행합니다.

### 5. 컨트랙트: 키 등록, 윈도우 열기, 배포 {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet`은 배포된 `QDayGuestbook` 주소(`0x...`)를 출력합니다. 이 주소를 복사하세요. 등록은 체인이 기존 방식 서명으로 받아 주는 유일한 메시지입니다. 아직 체인에 대조할 키가 없기 때문입니다. 윈도우 열기는 하이브리드로 서명합니다. 출력되는 트랜잭션 해시를 보관하세요.

### 6. 컨트랙트: 명령줄에서 서명 {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

각 주소는 한 번만 서명할 수 있으므로, 같은 계정에서 `pnpm sign`을 다시 실행하면 컨트랙트가 거부합니다.

### 7. 웹 페이지: 설치와 설정 {#step-web}

같은 프로젝트 폴더에서 두 번째 터미널을 열고(또는 `cd ..`로 돌아와서) 다음을 실행합니다.

```sh
cd web
pnpm install
cp .env.example .env
```

`web/.env`를 열어 5단계에서 복사한 주소를 설정합니다.

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID`는 비워 두세요. `src/wagmi.ts`에 WalletConnect 기반 지갑을 추가할 때만 필요합니다.

### 8. 웹 페이지: 실행 {#step-run}

```sh
pnpm dev
```

QoreX가 설치된 브라우저에서 http://localhost:5174 를 엽니다. 페이지는 EVM RPC로 체인을 읽습니다. EVM 윈도우는 Vite 프록시 `/lcd`를 거쳐 REST로 읽는데, 공개 REST 엔드포인트가 CORS 헤더를 보내지 않기 때문입니다. 하단의 서명 목록에는 6단계에서 작성한 항목이 이미 보입니다.

### 9. QoreX에서 서명 {#step-sign}

1. QoreX를 설치하고 테스트넷으로 전환합니다. 전환 방법은 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes#step-testnet)를 참고하세요.
2. QoreX에서 ML-DSA-87 키가 등록된 coin-60(이더리움) 계정을 사용하고, [포셋](/dashboard/faucet)에서 자금을 받습니다(로그인한 뒤 계정 주소를 붙여 넣기).
3. 페이지에서 **Connect QoreX**를 선택하고, 메시지를 입력한 뒤 **Sign**을 선택합니다. 열려 있는 윈도우가 없으면 QoreX가 승인 화면에서 EVM 윈도우를 열자고 제안합니다.
4. QoreX에서 승인합니다.

### 10. 익스플로러에서 조회 {#step-explorer}

https://explore.qore.network 를 열고 네트워크 선택기를 **Testnet**으로 전환합니다. 6단계 또는 9단계의 트랜잭션 해시, `pnpm window open`의 해시, 또는 `QDayGuestbook` 주소를 검색하세요. 윈도우 트랜잭션에 체인이 검증한 양자 내성 서명이 표시됩니다.

## 확인할 결과 {#result}

- `contracts-app`에서 `pnpm test`가 `3 passing`을 출력합니다.
- `pnpm window status`가 `PQC key: registered`와, 남은 블록 및 트랜잭션 수와 함께 `window: live`를 출력합니다.
- `pnpm deploy:testnet`이 `QDayGuestbook` 주소(`0x...`)를 출력합니다.
- `pnpm sign "..."`가 트랜잭션 해시와 `status: success in block ...`을 출력합니다.
- 페이지의 1단계에 `0x...` 계정, 체인 `qorechain-diana EVM (9800)`, 잔액, 그리고 남은 블록 및 트랜잭션 수와 함께 `live`인 EVM 윈도우가 표시됩니다.
- **Sign**을 선택하고 QoreX에서 승인하면 익스플로러로 가는 트랜잭션 링크가 나타나고, 이어서 `success in block ...`이 표시됩니다.
- 하단 목록에 체인에 기록된 서명 수와 최신 항목(최대 20개)이 최신순으로 표시되며, 몇 초마다 새로 고쳐집니다.
- 같은 주소로 다시 시도하면 이미 서명했다고 표시됩니다.

## 코드 {#code}

컨트랙트는 항목을 배열에 저장하고 주소당 서명 한 번만 허용합니다.

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX는 커넥터 목록(`web/src/wagmi.ts`)의 첫 번째 지갑입니다.

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

페이지는 윈도우를 보여 주고 거부 사유를 설명합니다(`web/src/App.tsx`).

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## 사용한 패키지 {#packages}

컨트랙트(`contracts-app/`)입니다.

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | 윈도우 헬퍼 스크립트, 하이브리드 서명 |
| `@qorechain/evm` | ^0.13.0 | 체인 정의, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | 윈도우 메시지 브로드캐스트 |
| `hardhat` | ^3.21.1 | 컴파일, 테스트, Ignition 배포 |
| `viem` | ^2.47.6 | 이더리움 클라이언트 |
| `tsx` | ^4.19.0 | TypeScript 스크립트 실행 |
| `typescript` | ^5.6.3 | 타입 검사 |

웹 페이지(`web/`)입니다.

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | 체인 정의, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | RainbowKit 지갑으로서의 QoreX |
| `@rainbow-me/rainbowkit` | ^2.2.11 | 연결 버튼 |
| `wagmi` | ^2.19.5 | 읽기와 쓰기를 위한 React 훅 |
| `viem` | ^2.53.1 | 이더리움 클라이언트 |
| `@tanstack/react-query` | ^5.59.0 | 윈도우와 체인 읽기를 위한 데이터 가져오기 |
| `react`, `react-dom` | ^18.3.1 | 인터페이스 |
| `vite` | ^5.4.0 | 개발 서버 |
| `@vitejs/plugin-react` | ^4.3.0 | Vite용 React 지원 |
| `typescript` | ^5.6.3 | 타입 검사 |

소스: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
