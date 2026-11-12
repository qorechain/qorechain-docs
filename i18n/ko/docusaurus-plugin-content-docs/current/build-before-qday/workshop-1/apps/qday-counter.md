---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter는 가장 작지만 쓸모 있는 QoreChain EVM 프로젝트입니다. 숫자 하나를 저장하는 Solidity 컨트랙트, 이를 테스트넷 `qorechain-diana`에 올리는 Hardhat 프로젝트, 그리고 숫자를 읽고 1을 더하는 짧은 스크립트로 이루어져 있습니다.

이 가이드는 초보자를 위해 쓰였습니다. Solidity나 블록체인 도구를 몰라도 됩니다. 모든 명령을 설명하고, 모든 단계는 화면에 무엇이 보여야 하는지로 끝납니다.

**소요 시간:** 처음에는 약 25분이며, 대부분 도구 설치와 페이셋 대기에 쓰입니다.

## 보여 주는 것 {#shows}

- **하이브리드 서명은 배포 경로의 일부입니다.** 컨트랙트 배포를 포함한 모든 EVM 트랜잭션 전에, 계정에는 등록된 포스트 양자 키(ML-DSA-87)와 유효한 EVM 승인 윈도우가 필요합니다. 윈도우는 두 번 서명한 트랜잭션 하나로 열립니다. 기존 방식 키(secp256k1)와 포스트 양자 키로 서명하는 것이 하이브리드 서명이며, 체인은 둘 다 확인합니다.
- **직접 검증할 수 있는 하이브리드 서명 트랜잭션 하나.** `pnpm window open` 단계가 그 트랜잭션을 보냅니다. 탐색기에서 조회해 체인이 직접 내린 판정을 볼 수 있습니다.
- **익숙한 EVM 도구가 그대로 동작합니다.** Hardhat과 viem은 평범한 이더리움 트랜잭션을 보냅니다. 포스트 양자 보호는 윈도우에 들어 있으므로, 훔친 secp256k1 키만으로는 계정에서 돈을 쓸 수 없습니다.

secp256k1을 깨뜨릴 만큼 큰 양자 컴퓨터는 기존 방식 서명을 위조할 수 있습니다. QoreChain은 그런 컴퓨터도 위조할 수 없는 두 번째 서명(ML-DSA-87, 표준 FIPS 204)을 요구합니다. Counter는 이 규칙을 켠 상태에서의 전체 개발자 흐름을 보여 줍니다. 키 등록, 윈도우 열기, 배포, 호출, 읽기입니다.

## 시작하기 전에 {#prerequisites}

이 가이드는 일회용 테스트넷 계정을 사용합니다. 실제 지갑이나 실제 자금은 절대 쓰지 마세요. 테스트넷 QOR에는 가치가 없습니다.

터미널이 필요합니다. macOS에서는 **Terminal**을, Windows에서는 **PowerShell**(또는 Git과 함께 설치되는 **Git Bash**)을, Linux에서는 아무 터미널이나 여세요. 그다음 아래 세 가지 도구를 설치합니다. 확인 명령이 이미 알맞은 버전을 출력하면 설치는 건너뛰세요.

### Node.js 22 이상

Node.js는 컴퓨터에서 JavaScript를 실행합니다. Hardhat 3에는 Node.js 22 이상이 필요합니다.

| 시스템 | 설치 | 확인 |
| --- | --- | --- |
| macOS | `brew install node`([Homebrew](https://brew.sh) 필요), 또는 https://nodejs.org 에서 내려받기 | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, 또는 https://nodejs.org 에서 내려받기 | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, 새 터미널을 열고 `nvm install 22` | `node --version` |

화면에 보여야 하는 것: `v22` 이상으로 시작하는 숫자, 예를 들어 `v22.12.0`. Windows에서는 설치 후 PowerShell을 닫았다가 다시 여세요.

### pnpm

pnpm은 프로젝트에 필요한 라이브러리를 내려받습니다. Node.js 설치에는 포함되어 있지 않으므로 모든 시스템에서 직접 추가해야 합니다.

```sh
npm install -g pnpm
```

| 부분 | 의미 |
| --- | --- |
| `npm` | Node.js와 함께 설치되는 도구. 다른 도구를 설치합니다. |
| `install` | 내려받아 설치합니다. |
| `-g` | 전역(global): 폴더 하나가 아니라 컴퓨터 전체에 설치합니다. |
| `pnpm` | 설치할 도구. |

`pnpm --version`으로 확인하세요. `9.12.0` 같은 숫자(9 이상)가 보여야 합니다. `pnpm: command not found`가 나오면 이 단계를 건너뛴 것입니다. 위의 설치 명령을 실행한 다음 새 터미널을 여세요.

Linux나 macOS에서 `EACCES: permission denied`가 나오면 대신 `sudo npm install -g pnpm`을 실행하세요.

### Git

Git은 GitHub에서 프로젝트를 내려받습니다.

| 시스템 | 설치 | 확인 |
| --- | --- | --- |
| macOS | `xcode-select --install` 또는 `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, 또는 https://git-scm.com 에서 내려받기 | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) 또는 `sudo dnf install git` (Fedora) | `git --version` |

화면에 보여야 하는 것: `git version 2.`와 숫자.

## 테스트넷 지갑 {#wallet}

QOR가 조금 들어 있는 테스트넷 계정이 필요합니다. 이 가이드는 다음 단계에서 키 파일로 계정을 직접 만듭니다. Counter에는 QoreX가 필요하지 않습니다. 나중에 같은 계정을 지갑에서 보고 싶다면 테스트넷에서 [QoreX](/qorex/overview)를 사용하세요.

- **QoreX 앱:** 설정, 그다음 **Use testnet (developers)**.
- **QoreX 브라우저 확장 프로그램:** 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.
- EVM 레인에서는 **Add an Ethereum account (coin 60)**을 선택합니다.

페이셋은 무료 테스트넷 QOR를 줍니다: https://dashboard.qorechain.io/faucet. 로그인하고 주소를 붙여 넣은 다음 요청합니다. 계정당 24시간에 100 QOR를 받습니다.

**금액에 대해.** QOR는 코인입니다. `uqor`는 가장 작은 단위입니다. 1 QOR = 1,000,000 uqor. 체인의 수수료는 `uqor`로 표시됩니다. 새 계정의 첫 트랜잭션은 포스트 양자 키를 등록하며, 약 0.09 QOR의 일회성 수수료가 듭니다.

## 단계별 안내 {#steps}

### 1. 코드 받기 {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**하는 일**

- `git clone <주소>`는 GitHub에서 프로젝트 사본을 `build-before-qday`라는 새 폴더로 내려받습니다.
- `cd <폴더>`는 터미널을 Counter 프로젝트 폴더로 옮깁니다. 이후의 모든 명령은 여기에서 실행합니다.

**화면에 보여야 하는 것:** `Cloning into 'build-before-qday'...`, 그리고 새 폴더 안의 프롬프트. **소요 시간:** 몇 초.

선택 사항: 라이브 워크숍처럼 프로젝트를 처음부터 만들고 싶다면 단계 끝의 [처음부터 같은 프로젝트 만들기](#scaffold)를 참조하세요.

### 2. 라이브러리 설치 {#step-install}

```sh
pnpm install
```

**하는 일**

- `pnpm install`은 `package.json`에 있는 라이브러리 목록(Hardhat, QoreChain SDK 등)을 읽고 `node_modules` 폴더로 내려받습니다.

**화면에 보여야 하는 것:** `+` 기호가 붙은 패키지 목록과 몇 초 뒤의 `Done in`. **소요 시간:** 1분 미만.

### 3. 테스트와 빌드 실행 {#step-test}

```sh
pnpm test
```

**하는 일**

- `pnpm test`는 컴퓨터 안의 모의 체인에서 프로젝트의 검사를 실행합니다. 키도, 네트워크도, QOR도 필요하지 않습니다. 첫 실행에서는 Solidity 컴파일러를 내려받으므로 인터넷이 필요합니다.

**화면에 보여야 하는 것:** `Counter`, 체크 표시가 붙은 두 줄(`starts at the constructor value`, `increments and emits CountChanged`), 그리고 `2 passing`.

```sh
pnpm build
```

**하는 일**

- `pnpm build`는 Solidity 컨트랙트를 기계어로 바꿉니다(컴파일). `pnpm test` 뒤에는 `No contracts to compile`이 출력되며 정상입니다. 테스트가 이미 컴파일했기 때문입니다.

### 4. 설정 파일 만들기 {#step-account}

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

- `cp`(또는 `copy`)는 템플릿 파일 `.env.example`을 새 파일 `.env`로 복사합니다.

`.env` 파일이 여러분의 **키 파일**입니다. 이 프로젝트 폴더 안에만 있으며 일회용 키가 들어 있습니다. **절대 공유하지 말고, Git에 커밋하지 말고, 이 키를 실제 지갑에 재사용하지 마세요.** 프로젝트는 이미 Git에서 `.env`를 무시하도록 설정되어 있습니다. 아무 텍스트 편집기로 여세요(macOS는 `open -e .env`, Windows는 `notepad .env`, Linux는 `nano .env`). 값 두 개를 채웁니다.

**a. 일회용 개인 키.** 무작위 키를 만듭니다.

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**하는 일**

- `node -e "..."`는 JavaScript 한 줄을 실행합니다.
- 그 줄은 무작위 바이트 32개를 만들어 앞에 `0x`를 붙인 16진수로 출력합니다. 이것이 개인 키입니다.

**화면에 보여야 하는 것:** `0x`와 64개의 문자와 숫자로 이루어진 한 줄. 이를 복사해 `.env`에 `PRIVATE_KEY=0x...`로 넣고, 0으로 채워진 자리표시자를 바꾸세요.

**b. 포스트 양자 복구 코드.** 계정의 ML-DSA-87 키는 두 번째 비밀 값인 복구 코드에서 만들어집니다.

```sh
pnpm window recovery-code
```

**하는 일**

- `pnpm window`는 도우미 스크립트 `scripts/window.ts`를 실행합니다. 그 뒤에 오는 단어가 명령입니다.
- `recovery-code`는 새 무작위 복구 코드를 출력합니다.

**화면에 보여야 하는 것:** `QRC1-`로 시작하는 한 줄과 짧은 안내. `QRC1-...` 줄을 복사해 `.env`에 `QORE_PQC_RECOVERY_CODE=QRC1-...`로 넣으세요. 이 계정에는 같은 코드를 계속 사용하세요. 코드가 바뀌면 계정의 포스트 양자 키도 달라집니다.

`QORE_MNEMONIC`은 비워 두세요. (니모닉은 위의 두 값을 대신할 수 있는 12단어 또는 24단어 문구입니다. 둘 중 하나만 쓰고 함께 쓰지는 마세요.) `QORE_NETWORK=testnet`은 도우미가 테스트 네트워크에 연결하도록 하므로 그대로 두세요. `.env`는 자리표시자로 쓰면 다음과 같은 모습입니다.

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

파일을 저장하세요.

### 5. 계정 주소 확인 {#step-address}

```sh
pnpm window status
```

**하는 일**

- `status`는 계정, 포스트 양자 키의 등록 여부, EVM 윈도우가 있는지를 보여 줍니다.

**화면에 보여야 하는 것:** 세 줄. 첫 줄은 `account:  0x...  (qor1...)`입니다. 계정에는 주소가 두 개 있습니다. EVM용 `0x...`와 네이티브 레인용 `qor1...`이며, 같은 계정에 속합니다. 나머지 두 줄은 `PQC key:  not registered`와 `window:   none`입니다. 계정이 새것이므로 정상입니다. 첫 줄의 `qor1...` 주소를 복사하세요.

### 6. 페이셋에서 테스트넷 QOR 받기 {#step-faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. 페이지가 **Testnet**으로 설정되어 있는지 확인합니다.
3. `qor1...` 주소를 붙여 넣고 QOR를 요청합니다. 계정당 24시간에 한 번 100 QOR를 받습니다.
4. 약 10초 기다린 다음 `pnpm window status`를 다시 실행합니다.

**화면에 보여야 하는 것:** 이전과 같은 세 줄. 키는 여전히 `not registered`이고 윈도우도 없습니다. 이제 계정에는 QOR가 들어 있습니다. 확인하고 싶다면 https://explore.qore.network (Testnet)를 열고 `qor1...` 주소를 검색하세요.

### 7. 키 등록과 윈도우 열기 {#step-window}

```sh
pnpm window register
```

**하는 일**

- `register`는 계정의 ML-DSA-87 공개 키를 체인에 보냅니다. 계정당 한 번만 합니다. 아직 체인에 대조할 키가 없으므로, 체인이 포스트 양자 서명 없이 받아 주는 유일한 메시지입니다. 약 0.09 QOR가 듭니다.

**화면에 보여야 하는 것:** `registered: ` 뒤에 트랜잭션 해시(64자).

```sh
pnpm window open
```

**하는 일**

- `open`은 두 키로 서명한(하이브리드) 트랜잭션 하나를 보내 EVM 승인 윈도우를 엽니다. 윈도우가 유효한 동안에는 일반 EVM 트랜잭션이 허용됩니다. 기본값으로 600블록 동안 유지되며 트랜잭션 5개를 허용합니다. `.env`의 `QORE_WINDOW_BLOCKS`와 `QORE_WINDOW_TXS`로 바꿀 수 있습니다.

**화면에 보여야 하는 것:** `opened: ` 뒤에 트랜잭션 해시, 그다음 `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **이 해시를 복사하세요.** 단계 10에서 확인합니다.

이제 약 10초 기다리세요. 윈도우를 열면 계정의 트랜잭션 카운터가 바뀌고, 다음 명령은 새 값을 볼 수 있어야 합니다.

```sh
sleep 10
pnpm window status
```

**하는 일**

- `sleep 10`은 10초 기다립니다(PowerShell과 Git Bash에서도 동작합니다).
- `status`는 결과를 보여 줍니다.

**화면에 보여야 하는 것:** `PQC key:  registered`와 `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. 컨트랙트 배포 {#step-deploy}

```sh
pnpm deploy:testnet
```

**하는 일**

- 컨트랙트를 배포하는 도구인 Hardhat Ignition을 `Counter` 모듈과 `qorechainTestnet` 네트워크(체인 id 9800, QoreChain 테스트넷)로 실행합니다.
- 확인을 요청합니다. `y`를 입력하고 Enter를 누르세요.

**화면에 보여야 하는 것:** `qorechainTestnet` (9800)에 배포할지 묻는 확인 질문, 그리고 `y`를 입력하면 `CounterModule#Counter`와 컨트랙트 주소 `0x...`로 끝나는 줄. 그것이 여러분의 컨트랙트 주소입니다. **소요 시간:** 약 30초.

### 9. 읽고 1 더하기 {#step-interact}

```sh
pnpm interact
```

**하는 일**

- 저장된 숫자를 읽고, `increment()`를 호출해(1 더하기) 다시 읽습니다. 이 호출은 윈도우의 트랜잭션 5개 중 하나를 사용합니다.

**화면에 보여야 하는 것:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1`, 그리고 탐색기 링크.

```sh
pnpm interact --read
```

**하는 일**

- `--read`는 읽기 전용을 뜻합니다. 숫자를 보여 주기만 하고 아무것도 보내지 않습니다.

**화면에 보여야 하는 것:** Counter 주소와 `count: 1`.

### 10. 하이브리드 트랜잭션 검증 {#step-explorer}

`pnpm window open`의 트랜잭션은 체인이 포스트 양자 서명을 확인했다는 증거입니다. 두 가지 방법으로 확인하세요.

**a. 일반 웹 요청으로.** `<HASH>`를 단계 7의 해시로 바꾸세요. `<`와 `>`는 빼세요.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**하는 일**

- `curl <주소>`는 공개 QoreChain 서버에 해당 트랜잭션의 기록을 요청해 출력합니다. Windows PowerShell에서는 `curl` 대신 `curl.exe`를 입력하세요.
- `api-testnet.qore.host`는 공개 테스트넷 서버입니다. `<HASH>`는 조회할 트랜잭션입니다.

**긴 응답에서 보여야 하는 것:**

- `"code": 0`, 트랜잭션이 성공했다는 뜻입니다.
- ML-DSA-87 서명(4,627바이트)을 담은 `PQCHybridSignature` 타입의 확장.
- `status` 속성이 `verified`인 `pqc_hybrid_verify` 이벤트.

**b. 탐색기로.**

1. https://explore.qore.network 를 열고 네트워크 선택기를 **Testnet**으로 전환합니다.
2. `pnpm window open`의 해시를 검색합니다. 페이지에 체인이 검증한 포스트 양자 서명이 표시됩니다.
3. 컨트랙트 호출을 보려면 단계 9의 `increment tx` 해시나 Counter 주소를 검색하세요.

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector)는 같은 종류의 증거를 바이트 단위로 보여 줍니다.

## 처음부터 같은 프로젝트 만들기 {#scaffold}

라이브 워크숍은 빈 폴더에서 시작합니다. 이 명령은 같은 Hardhat 프로젝트를 만듭니다(내려받은 사본에만 있는 `interact` 스크립트는 제외). 단계 1 대신 프로젝트를 보관하는 폴더에서 실행하세요.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| 부분 | 의미 |
| --- | --- |
| `npx` | 도구를 설치하지 않고 인터넷에서 바로 실행합니다. |
| `create-qorechain-dapp@latest` | QoreChain 프로젝트 생성기, 최신 버전. |
| `qday-demo` | 새 폴더의 이름. |
| `-t hardhat` | 사용할 프로젝트 템플릿: 컨트랙트, 테스트, 윈도우 도우미가 들어 있는 Hardhat 3 프로젝트. |
| `--network testnet` | 프로젝트가 연결할 QoreChain 네트워크: 실제 네트워크가 아닌 테스트 네트워크. |
| `--package-manager pnpm` | 라이브러리를 설치할 도구. |

**화면에 보여야 하는 것:** 설치된 패키지 목록, 그다음 `Done! Created qday-demo`. 라이브러리는 이미 설치되어 있고 `.env` 파일도 이미 있으므로 단계 2와 단계 4의 복사는 건너뛸 수 있습니다. `pnpm test`(단계 3), 그다음 4a와 4b(`.env` 채우기), 그리고 단계 5부터 8까지 이어서 진행하세요. **소요 시간:** 약 30초.

## 마지막에 보여야 하는 것 {#result}

- `pnpm test`가 `2 passing`을 출력합니다.
- `pnpm window status`가 `PQC key:  registered`와, 남은 블록, 트랜잭션, 금액이 표시된 `window:   live`를 출력합니다.
- `pnpm deploy:testnet`이 배포된 `Counter` 주소(`0x...`)를 출력합니다.
- `pnpm interact`가 `count`가 0에서 1로 바뀌는 것, `status: success`, 탐색기 링크를 출력합니다.
- `curl` 확인에서 `"code": 0`, `PQCHybridSignature` 확장, `status`가 `verified`인 `pqc_hybrid_verify` 이벤트가 보입니다. 탐색기(Testnet)도 같은 트랜잭션을 검증됨으로 표시합니다.

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 이유 | 해결 방법 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm이 설치되어 있지 않습니다. Node.js에는 포함되어 있지 않습니다. | `npm install -g pnpm`을 실행한 다음 새 터미널을 여세요. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js가 너무 오래되었습니다. | Node.js 22 이상을 설치하고 `node --version`을 확인하세요. |
| `node: .env: not found` | 이 폴더에 `.env` 파일이 없습니다. | 단계 4를 수행하고, 프로젝트 폴더에서 명령을 실행하세요. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | `.env` 파일이 없거나, `PRIVATE_KEY`가 아직 자리표시자이거나 오타가 있습니다. | 단계 4를 다시 수행하세요. 파일을 저장하고, 프로젝트 폴더에서 명령을 실행하세요. |
| `Set QORE_PQC_RECOVERY_CODE in .env` 또는 `not a valid QRC1 recovery code` | 복구 코드가 비어 있거나 오타가 있습니다. | `pnpm window recovery-code`를 실행해 `QRC1-...` 줄 전체를 붙여 넣으세요. |
| `... does not exist on chain yet: send it some QOR first` (`register` 또는 `open`에서) | 계정에 아직 QOR가 없습니다. | 페이셋에서 QOR를 요청하고(단계 6) 10초 기다리세요. |
| 페이셋이 한도에 도달했다고 표시 | 계정당 24시간에 한 번만 요청할 수 있습니다. | 기다렸다가 다시 시도하세요. 또는 두 번째 일회용 계정을 사용하세요. |
| `account has no PQC key and classical fallback is disabled` | 키를 등록하기 전에 트랜잭션을 보냈습니다. | `pnpm window register`를 실행한 다음 `pnpm window open`을 실행하세요. |
| `EVM authorisation window exhausted` (또는 `open an EVM window first`라는 힌트) | 윈도우의 블록이나 트랜잭션이 소진되었거나, 한 번도 열리지 않았습니다. | `pnpm window open`을 실행하고 10초 기다린 다음 다시 시도하세요. |
| 윈도우를 연 뒤 `HHE10402` | 계정의 트랜잭션 카운터가 갱신되기 전에 배포가 실행되었습니다. | 10초 기다렸다가 `pnpm deploy:testnet`을 다시 실행하세요. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact`가 컨트랙트를 찾지 못합니다. | 이 폴더에서 단계 8을 끝내세요. |
| `PQC key: registered, but NOT this key` | `.env`의 복구 코드가 등록 때 사용한 코드와 다릅니다. | 원래의 복구 코드를 다시 넣으세요. 코드가 다르면 키도 달라집니다. |
| 브라우저 앱에서 CORS 오류 | 공개 REST 서버가 CORS 헤더를 보내지 않아 브라우저가 차단합니다. | [Guestbook 웹 페이지](/build-before-qday/workshop-1/apps/qday-guestbook)처럼 템플릿의 `/lcd` 프록시를 사용하세요. |

## 코드 {#code}

컨트랙트(`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

`scripts/window.ts`에서 하이브리드 서명을 하는 부분(윈도우 메시지와 서명자):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc`는 여러분의 키 자료로 만든 계정이고, `net`은 `QORE_NETWORK`(기본값 `testnet`, 체인 id `qorechain-diana`)에 해당하는 네트워크 정보입니다. 스크립트가 쓰는 수수료는 100000 `uqor`(0.1 QOR)이고 가스 한도는 800000입니다. 하이브리드 트랜잭션은 크기가 크기 때문입니다.

## 사용한 패키지 {#packages}

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | 하이브리드 서명, PQC 키 등록, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM 윈도우 도우미(`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | 네이티브 레인 트랜잭션 브로드캐스트 |
| `hardhat` | ^3.21.1 | 컴파일, 테스트, Ignition 배포 |
| `viem` | ^2.47.6 | 컨트랙트 읽기와 쓰기 |
| `tsx` | ^4.19.0 | TypeScript 스크립트 실행 |
| `typescript` | ^5.6.3 | 타입 검사 |

[스캐폴더와 CLI](/developer-tools/scaffolders-and-cli)와 [SDK 설치](/sdk/install)를 참조하세요.

## 네트워크 정보 {#networks}

| 항목 | 값 |
| --- | --- |
| 네트워크 | 테스트넷 `qorechain-diana` |
| EVM 체인 id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

소스: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
