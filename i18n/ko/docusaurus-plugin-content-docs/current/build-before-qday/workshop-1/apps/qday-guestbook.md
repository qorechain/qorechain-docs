---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook은 QoreChain EVM 테스트넷에 있는 온체인 방명록입니다. 누구나 주소당 한 번, 최대 140자의 메시지로 서명할 수 있습니다. 두 부분으로 이루어져 있습니다.

- **`contracts-app/`**: Solidity 컨트랙트와 Hardhat 프로젝트. 배포하고 터미널에서 서명할 수 있습니다.
- **`web/`**: 브라우저에서 열리는 웹 페이지. QoreX 지갑을 연결하고, 계정의 EVM 윈도우를 보여 주며, 최신 서명을 실시간으로 나열합니다.

이 가이드는 초보자를 위해 쓰였습니다. 모든 명령을 설명하고, 모든 단계는 화면에 무엇이 보여야 하는지로 끝납니다.

**소요 시간:** 처음에는 약 35분입니다. 컨트랙트 부분 20분, 웹 페이지 부분 15분.

## 보여 주는 것 {#shows}

- **모르는 사이에 하이브리드로 서명하는 브라우저 dApp.** 이 페이지는 평범한 wagmi와 RainbowKit 앱입니다. QoreX가 서명의 포스트 양자 절반(ML-DSA-87)을 더해 주므로, 같은 트랜잭션이 기존 방식 키(secp256k1)와 포스트 양자 키로 함께 보호됩니다.
- **EVM 윈도우가 화면에 보입니다.** 페이지는 체인에서 계정의 윈도우를 읽어 유효한지, 블록과 트랜잭션이 얼마나 남았는지를 보여 줍니다.
- **읽기 쉬운 거부 사유.** 체인이 쓰기를 거부하면 페이지가 오류를 네 가지 원인(등록된 키 없음, 윈도우 없음, 윈도우 소진, 잘못된 파라미터) 중 하나로 분류해 해결 방법을 보여 줍니다.
- **체인에서 검증된 하이브리드 서명.** 여러분이 쓰는 서명 하나하나는 체인이 두 서명을 모두 확인한 뒤에야 받아들인 트랜잭션입니다.

## 시작하기 전에 {#prerequisites}

이 가이드는 터미널 부분에 일회용 테스트넷 계정을 사용합니다. 실제 지갑이나 실제 자금은 절대 쓰지 마세요. 테스트넷 QOR에는 가치가 없습니다.

터미널이 필요합니다. macOS에서는 **Terminal**을, Windows에서는 **PowerShell**(또는 Git과 함께 설치되는 **Git Bash**)을, Linux에서는 아무 터미널이나 여세요. 아래 세 가지 도구를 설치합니다. 확인 명령이 이미 알맞은 버전을 출력하면 설치는 건너뛰세요.

### Node.js 22 이상

Node.js는 컴퓨터에서 JavaScript를 실행합니다. Hardhat 3에는 Node.js 22 이상이 필요합니다.

| 시스템 | 설치 | 확인 |
| --- | --- | --- |
| macOS | `brew install node`([Homebrew](https://brew.sh) 필요), 또는 https://nodejs.org 에서 내려받기 | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, 또는 https://nodejs.org 에서 내려받기 | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, 새 터미널을 열고 `nvm install 22` | `node --version` |

화면에 보여야 하는 것: `v22` 이상으로 시작하는 숫자. Windows에서는 설치 후 PowerShell을 닫았다가 다시 여세요.

### pnpm

pnpm은 프로젝트에 필요한 라이브러리를 내려받습니다. Node.js에는 포함되어 있지 않으므로 모든 시스템에서 직접 설치하세요.

```sh
npm install -g pnpm
```

| 부분 | 의미 |
| --- | --- |
| `npm` | Node.js와 함께 설치되는 도구. 다른 도구를 설치합니다. |
| `install` | 내려받아 설치합니다. |
| `-g` | 전역(global): 폴더 하나가 아니라 컴퓨터 전체에 설치합니다. |
| `pnpm` | 설치할 도구. |

`pnpm --version`으로 확인하세요. `9.12.0` 같은 숫자(9 이상)가 보여야 합니다. `pnpm: command not found`가 나오면 위의 설치 명령을 실행하고 새 터미널을 여세요. macOS나 Linux에서 `EACCES: permission denied`가 나오면 `sudo npm install -g pnpm`을 사용하세요.

### Git

| 시스템 | 설치 | 확인 |
| --- | --- | --- |
| macOS | `xcode-select --install` 또는 `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, 또는 https://git-scm.com 에서 내려받기 | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) 또는 `sudo dnf install git` (Fedora) | `git --version` |

화면에 보여야 하는 것: `git version 2.`와 숫자.

## 테스트넷 지갑 {#wallet}

이 가이드는 계정 두 개를 사용하며, 의도적으로 서로 다릅니다.

1. 터미널 부분(단계 3부터 6)을 위한 **키 파일 계정**. 가이드가 만들어 줍니다. 컨트랙트를 배포합니다.
2. 웹 페이지(단계 8과 9)를 위한 **QoreX 계정**. 웹 페이지는 이 계정으로 서명합니다.

**테스트넷의 QoreX.** [QoreX](/qorex/overview)는 QoreChain 지갑입니다. 웹 페이지에는 브라우저 확장 프로그램을 사용합니다([QoreX 통합](/developer-tools/qorex-integrations) 참조). 사용할 브라우저에 설치한 다음 아래를 따르세요.

- **QoreX 브라우저 확장 프로그램:** 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.
- **휴대폰의 QoreX 앱:** 설정, 그다음 **Use testnet (developers)**.
- EVM 레인에서는 **Add an Ethereum account (coin 60)**을 선택합니다. 웹 페이지에는 coin 60 계정이 필요합니다.

**페이셋**은 무료 테스트넷 QOR를 줍니다: https://dashboard.qorechain.io/faucet. 로그인하고 주소를 붙여 넣은 다음 요청합니다. 계정당 24시간에 100 QOR를 받습니다.

**금액에 대해.** QOR는 코인입니다. `uqor`는 가장 작은 단위입니다. 1 QOR = 1,000,000 uqor. 새 계정의 첫 트랜잭션은 포스트 양자 키를 등록하며, 약 0.09 QOR의 일회성 수수료가 듭니다.

## 1부: 컨트랙트 {#contract}

### 1. 코드 받기 {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**하는 일**

- `git clone <주소>`는 GitHub에서 프로젝트를 `build-before-qday`라는 새 폴더로 내려받습니다.
- `cd <폴더>`는 터미널을 Guestbook 프로젝트로 옮깁니다. 따로 설정하는 폴더 `contracts-app`과 `web`이 두 개 들어 있습니다.

**화면에 보여야 하는 것:** `Cloning into 'build-before-qday'...`. **소요 시간:** 몇 초.

### 2. 라이브러리 설치와 테스트 {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**하는 일**

- `cd contracts-app`은 컨트랙트 폴더로 들어갑니다.
- `pnpm install`은 `package.json`에 나열된 라이브러리(Hardhat과 QoreChain SDK)를 내려받습니다.
- `pnpm test`는 컴퓨터 안의 모의 체인에서 컨트랙트의 검사를 실행합니다. 키도, 네트워크 계정도 필요하지 않습니다. 첫 실행에서는 Solidity 컴파일러를 내려받습니다.

**화면에 보여야 하는 것:** 패키지 목록, 몇 초 뒤의 `Done in`, 그다음 체크 표시 세 개가 붙은 `QDayGuestbook`과 `3 passing`. **소요 시간:** 약 1분.

### 3. 키 파일 만들기 {#step-account}

프로젝트는 `.env`라는 파일에서 비밀 값을 읽습니다. 템플릿에서 이 파일을 만드세요.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**하는 일**

- `cp`(또는 `copy`)는 템플릿 `.env.example`을 새 파일 `.env`로 복사합니다.

`.env` 파일이 여러분의 **키 파일**입니다. `contracts-app` 폴더 안에만 있습니다. **절대 공유하지 말고, Git에 커밋하지 말고, 이 키를 실제 지갑에 재사용하지 마세요.** 프로젝트는 이미 Git에서 `.env`를 무시하도록 설정되어 있습니다. 아무 텍스트 편집기로 열어(macOS는 `open -e .env`, Windows는 `notepad .env`, Linux는 `nano .env`) 값 두 개를 채우세요.

**a. 일회용 개인 키.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**하는 일**

- `node -e "..."`는 JavaScript 한 줄을 실행합니다. 그 줄은 무작위 바이트 32개를 만들어 앞에 `0x`를 붙인 16진수로 출력합니다. 이것이 개인 키입니다.

**화면에 보여야 하는 것:** `0x`와 64개의 문자와 숫자로 이루어진 한 줄. 이를 복사해 `.env`에 `PRIVATE_KEY=0x...`로 넣고, 0으로 채워진 자리표시자를 바꾸세요.

**b. 포스트 양자 복구 코드.**

```sh
pnpm window recovery-code
```

**하는 일**

- `pnpm window`는 도우미 스크립트 `scripts/window.ts`를 실행합니다. 그 뒤에 오는 단어가 명령입니다.
- `recovery-code`는 계정의 ML-DSA-87 키를 만드는 새 무작위 코드를 출력합니다.

**화면에 보여야 하는 것:** `QRC1-`로 시작하는 줄. 이를 복사해 `.env`에 `QORE_PQC_RECOVERY_CODE=QRC1-...`로 넣으세요. 이 계정에는 같은 코드를 계속 사용하세요. 코드가 바뀌면 포스트 양자 키도 달라집니다.

`QORE_MNEMONIC`은 비워 두고(니모닉은 위의 두 값을 대신할 수 있는 12단어 또는 24단어 문구입니다. 둘 중 하나만 쓰고 함께 쓰지는 마세요), `QORE_NETWORK=testnet`은 도우미가 테스트 네트워크를 사용하도록 하므로 그대로 두세요. `.env`는 다음과 같은 모습입니다(자리표시자로 표시).

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

파일을 저장하세요.

### 4. 계정에 자금 넣기 {#step-faucet}

```sh
pnpm window status
```

**하는 일**

- 계정, 포스트 양자 키의 등록 여부, EVM 윈도우가 있는지를 보여 줍니다.

**화면에 보여야 하는 것:** `account:  0x...  (qor1...)`, 그다음 `PQC key:  not registered`와 `window:   none`. `qor1...` 주소를 복사하세요. 그런 다음:

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. 페이지가 **Testnet**으로 설정되어 있는지 확인합니다.
3. `qor1...` 주소를 붙여 넣고 QOR를 요청합니다(계정당 24시간에 한 번 100 QOR).
4. 약 10초 기다립니다. https://explore.qore.network (Testnet)에서 주소를 검색하면 잔액이 보입니다.

### 5. 키 등록, 윈도우 열기, 배포 {#step-window}

```sh
pnpm window register
```

**하는 일**

- ML-DSA-87 공개 키를 계정당 한 번 체인에 보냅니다. 아직 체인에 대조할 키가 없으므로, 체인이 포스트 양자 서명 없이 받아 주는 유일한 메시지입니다. 약 0.09 QOR가 듭니다.

**화면에 보여야 하는 것:** `registered: `와 트랜잭션 해시.

```sh
pnpm window open
```

**하는 일**

- 두 키로 서명한(하이브리드) 트랜잭션 하나를 보내 EVM 승인 윈도우를 엽니다. 윈도우가 유효한 동안에는 일반 EVM 트랜잭션이 허용됩니다. 기본값으로 600블록 동안 유지되며 트랜잭션 5개를 허용합니다.

**화면에 보여야 하는 것:** `opened: `와 트랜잭션 해시, 그다음 `window: 600 blocks, 5 txs, ...`. 마지막 단계를 위해 **이 해시를 복사하세요.**

```sh
sleep 10
```

**하는 일**

- 10초 기다립니다(PowerShell과 Git Bash에서도 동작합니다). 윈도우를 열면 계정의 트랜잭션 카운터가 바뀌고, 다음 명령은 새 값을 볼 수 있어야 합니다.

```sh
pnpm deploy:testnet
```

**하는 일**

- 컨트랙트를 배포하는 도구인 Hardhat Ignition을 `QDayGuestbook` 모듈과 `qorechainTestnet` 네트워크(체인 id 9800, QoreChain 테스트넷)로 실행합니다.
- 확인을 요청합니다. `y`를 입력하고 Enter를 누르세요.

**화면에 보여야 하는 것:** `QDayGuestbookModule#QDayGuestbook`과 컨트랙트 주소 `0x...`로 끝나는 줄. **이 주소를 복사하세요.** 웹 페이지에 필요합니다. **소요 시간:** 약 30초.

### 6. 터미널에서 서명하기 {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**하는 일**

- `pnpm sign "<메시지>"`는 방명록에 항목 하나를 씁니다. 따옴표 안의 텍스트가 메시지이며 최대 140자입니다.
- `pnpm sign --read`는 읽기만 합니다. 최신 항목을 나열하고 아무것도 보내지 않습니다.

**화면에 보여야 하는 것:** 첫 번째 명령 뒤에는 `tx: 0x...`와 `status: success in block ...`. 두 번째 명령 뒤에는 `guestbook 0x...: 1 signatures`와, 시간 및 주소가 붙은 여러분의 메시지.

각 주소는 한 번만 서명할 수 있습니다. 같은 계정에서 두 번째로 `pnpm sign`을 실행하면 컨트랙트가 `AlreadySigned`로 거부합니다.

## 2부: 웹 페이지 {#web}

### 7. 페이지 설치와 설정 {#step-web}

같은 프로젝트 폴더에서 두 번째 터미널 창을 열거나, `cd ..`로 돌아가세요. 그런 다음:

```sh
cd web
pnpm install
```

**하는 일**

- web 폴더로 들어가 라이브러리(React, wagmi, RainbowKit, Vite)를 내려받습니다.

**화면에 보여야 하는 것:** 패키지 목록과 몇 초 뒤의 `Done in`.

페이지 설정 파일을 만드세요. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. `web/.env`를 편집기로 열고 단계 5에서 복사한 컨트랙트 주소를 설정합니다.

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID`는 비워 두세요. `src/wagmi.ts`에 WalletConnect 지갑을 추가할 때만 필요합니다.

### 8. 페이지를 시작하고 QoreX 연결 {#step-run}

```sh
pnpm dev
```

**하는 일**

- 여러분의 컴퓨터에서 작은 웹 서버(Vite)를 시작합니다. 페이지는 `http://localhost:5174`에 있습니다. 이 서버는 `/lcd`로 시작하는 요청도 공개 테스트넷 REST 서버로 전달합니다. 브라우저는 그 서버를 직접 호출할 수 없으므로(CORS 헤더를 보내지 않습니다), 이 프록시가 페이지를 대신해 호출합니다.
- 명령은 계속 실행됩니다. 이 터미널은 열어 두세요. 나중에 멈추려면 `Ctrl+C`를 누릅니다. `web/.env`를 바꾸면 멈췄다가 다시 시작하세요.

**화면에 보여야 하는 것:** `VITE ... ready`와 `Local: http://localhost:5174/`.

이제 QoreX가 설치된 브라우저에서:

1. http://localhost:5174 를 엽니다.
2. QoreX의 잠금이 해제되어 있고 테스트넷으로 전환되어 있는지("테스트넷 지갑" 참조), 페이셋에서 받은 QOR가 있는 coin 60 계정인지 확인하세요. QoreX가 두 형식을 모두 보여 주면 페이셋 페이지에는 주소의 `qor1...` 형식을 사용하세요.
3. 페이지의 카드 1에서 **Connect QoreX**(연결 버튼)를 선택합니다. QoreX가 맨 위에 없으면 지갑 목록에서 고르세요.
4. QoreX가 연결을 요청하는 창을 엽니다. 승인하세요.

**화면에 보여야 하는 것:** 카드 1에 `0x...` 계정, 체인 `qorechain-diana EVM (9800)`, 잔액, 그리고 EVM 윈도우(새 계정이면 `no window open`)가 표시됩니다. 카드 3에는 `On chain now: 1 signatures`와 단계 6에서 쓴 항목이 표시됩니다. 체인 줄에 `wrong chain`이 나오면 QoreX를 테스트넷으로 전환하세요.

### 9. QoreX로 서명하기 {#step-sign}

1. 카드 2에 메시지를 입력합니다(최대 140자). 페이지가 사용한 글자 수를 보여 줍니다.
2. **Sign**을 선택합니다.
3. QoreX가 승인 창을 엽니다. 계정에 포스트 양자 키나 윈도우가 아직 없다면, QoreX가 같은 승인에서 키 등록(약 0.09 QOR의 일회성 수수료)과 EVM 윈도우 열기를 제안합니다. 그렇게 하도록 선택하세요.
4. QoreX에서 승인합니다. 기다리는 동안 버튼에 `Approve in QoreX...`가 표시됩니다.

**화면에 보여야 하는 것:** 탐색기 링크가 붙은 `tx 0x...` 줄이 먼저 `waiting for the block...`으로, 그다음 `success in block ...`으로 바뀝니다. 카드 1에는 이제 EVM 윈도우가 남은 블록과 트랜잭션 수와 함께 `live`로 표시됩니다. 카드 3의 맨 위에 최신순으로 여러분의 메시지가 추가됩니다. 최대 20개 항목을 나열하며 몇 초마다 새로고침됩니다. 같은 주소로 다시 시도하면 카드 2에 `This address has already signed.`가 표시됩니다.

### 10. 체인에서 검증 {#step-explorer}

`pnpm window open`(단계 5)의 해시를 사용하세요. 페이지의 경우 QoreX가 윈도우를 자체 트랜잭션으로 열기도 합니다. QoreX에서 내역을 확인하거나 탐색기에서 주소를 조회하세요.

**a. 일반 웹 요청으로.** `<HASH>`를 해시로 바꾸세요(`<`와 `>`는 빼세요).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**하는 일**

- `curl <주소>`는 공개 QoreChain 서버에 해당 트랜잭션의 기록을 요청해 출력합니다. Windows PowerShell에서는 `curl` 대신 `curl.exe`를 입력하세요.

**긴 응답에서 보여야 하는 것:**

- `"code": 0`, 트랜잭션이 성공했다는 뜻입니다.
- ML-DSA-87 서명(4,627바이트)을 담은 `PQCHybridSignature` 타입의 확장.
- `status`가 `verified`로 설정된 `pqc_hybrid_verify` 이벤트.

**b. 탐색기로.** https://explore.qore.network 를 열고 네트워크 선택기를 **Testnet**으로 전환한 다음, 트랜잭션 해시(단계 5, 6 또는 9의 것), 계정 주소, 또는 `QDayGuestbook` 주소를 검색하세요. 윈도우 트랜잭션에는 체인이 검증한 포스트 양자 서명이 표시됩니다.

## 마지막에 보여야 하는 것 {#result}

- `contracts-app`의 `pnpm test`가 `3 passing`을 출력합니다.
- `pnpm window status`가 `PQC key:  registered`와, 남은 블록, 트랜잭션, 금액이 표시된 `window:   live`를 출력합니다.
- `pnpm deploy:testnet`이 `QDayGuestbook` 주소(`0x...`)를 출력합니다.
- `pnpm sign "..."`이 트랜잭션 해시와 `status: success in block ...`을 출력합니다.
- 페이지에 여러분의 계정, `qorechain-diana EVM (9800)`, 잔액, 그리고 `live`로 표시된 윈도우가 보입니다. **Sign**을 누르고 승인하면 트랜잭션 링크와 `success in block ...`이 보입니다.
- 맨 아래 목록에 서명 수와 최신 항목이 최신순으로 표시됩니다.
- `curl` 확인에서 `"code": 0`, `PQCHybridSignature` 확장, `status`가 `verified`인 `pqc_hybrid_verify`가 보입니다.

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 이유 | 해결 방법 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm이 설치되어 있지 않습니다. Node.js에는 포함되어 있지 않습니다. | `npm install -g pnpm`을 실행한 다음 새 터미널을 여세요. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js가 너무 오래되었습니다. | Node.js 22 이상을 설치하세요. |
| `node: .env: not found` | 이 폴더에 `.env` 파일이 없습니다. | `contracts-app`에서 단계 3을 수행하고, 그 폴더에서 명령을 실행하세요. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` 또는 `Set QORE_PQC_RECOVERY_CODE ...` | `.env`의 값이 비어 있거나, 자리표시자이거나, 오타가 있습니다. | 단계 3처럼 두 값을 모두 채우고 저장하세요. |
| `... does not exist on chain yet: send it some QOR first` | 계정에 아직 QOR가 없습니다. | 페이셋을 사용하고(단계 4) 10초 기다리세요. |
| 페이셋이 한도에 도달했다고 표시 | 계정당 24시간에 한 번만 요청할 수 있습니다. | 기다렸다가 다시 시도하세요. |
| `account has no PQC key and classical fallback is disabled` | 키를 등록하기 전에 트랜잭션을 보냈습니다. | `pnpm window register`를 실행한 다음 `pnpm window open`을 실행하세요. QoreX에서는 첫 전송과 함께 제안되는 등록을 승인하세요. |
| `EVM authorisation window exhausted` 또는 `open an EVM window first` | 윈도우의 블록이나 트랜잭션이 소진되었거나, 한 번도 열리지 않았습니다. | (터미널에서) `pnpm window open`을 실행하고 10초 기다리세요. 페이지에서는 QoreX가 제안하는 새 윈도우를 승인하세요. |
| 윈도우를 연 뒤 `HHE10402` | 계정의 트랜잭션 카운터가 갱신되기 전에 배포가 실행되었습니다. | 10초 기다렸다가 `pnpm deploy:testnet`을 다시 실행하세요. |
| `refused: ... (AlreadySigned)` | 이 주소는 이미 서명했습니다. | 각 주소는 한 번만 서명합니다. 다른 계정을 사용하세요. |
| `refused: ... (BadLength)` | 메시지가 비어 있거나 140자를 넘습니다. | 1자에서 140자 사이로 쓰세요. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign`이 컨트랙트를 찾지 못합니다. | `contracts-app`에서 단계 5를 끝내세요. |
| 페이지에 항목이 없고 **Sign** 버튼이 회색임 | `web/.env`의 `VITE_GUESTBOOK_ADDRESS`가 비어 있습니다. | 단계 5의 주소를 붙여 넣은 다음, `Ctrl+C`로 멈추고 `pnpm dev`를 다시 시작하세요. |
| 페이지에 `wrong chain`이 표시됨 | QoreX가 테스트넷이 아닙니다. | QoreX를 테스트넷(diana)으로 전환하세요. "테스트넷 지갑"을 참조하세요. |
| 연결을 선택해도 QoreX가 나타나지 않음 | QoreX 확장 프로그램이 없는 브라우저에서 페이지를 열었거나, 확장 프로그램이 잠겨 있습니다. | QoreX가 있는 브라우저에서 http://localhost:5174 를 열고 잠금을 해제하세요. |
| 포트 5174가 이미 사용 중 | 다른 프로그램이 사용하고 있습니다. | 그 프로그램을 닫거나, Vite가 출력하는 다른 주소를 사용하세요. |
| EVM 윈도우 옆에 `could not read`, 또는 브라우저 콘솔의 CORS 오류 | 페이지가 REST 서버를 직접 호출했는데, 서버가 CORS 헤더를 보내지 않습니다. | 이 프로젝트처럼 개발 서버의 `/lcd` 프록시를 통해서만 REST를 호출하세요. `pnpm dev`로 페이지를 시작하세요. |

## 코드 {#code}

컨트랙트는 항목을 배열에 보관하고 주소당 서명 한 번만 허용합니다.

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

컨트랙트(`contracts-app/`):

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | 윈도우 도우미 스크립트, 하이브리드 서명 |
| `@qorechain/evm` | ^0.13.0 | 체인 정의, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | 윈도우 메시지 브로드캐스트 |
| `hardhat` | ^3.21.1 | 컴파일, 테스트, Ignition 배포 |
| `viem` | ^2.47.6 | 이더리움 클라이언트 |
| `tsx` | ^4.19.0 | TypeScript 스크립트 실행 |
| `typescript` | ^5.6.3 | 타입 검사 |

웹 페이지(`web/`):

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | 체인 정의, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | RainbowKit 지갑으로서의 QoreX |
| `@rainbow-me/rainbowkit` | ^2.2.11 | 연결 버튼 |
| `wagmi` | ^2.19.5 | 읽기와 쓰기용 React 훅 |
| `viem` | ^2.53.1 | 이더리움 클라이언트 |
| `@tanstack/react-query` | ^5.59.0 | 윈도우와 체인 읽기를 위한 데이터 가져오기 |
| `react`, `react-dom` | ^18.3.1 | 인터페이스 |
| `vite` | ^5.4.0 | 개발 서버 |
| `@vitejs/plugin-react` | ^4.3.0 | Vite용 React 지원 |
| `typescript` | ^5.6.3 | 타입 검사 |

소스: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
