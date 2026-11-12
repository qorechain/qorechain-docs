---
slug: /build-before-qday/workshop-1
title: "워크숍 1: 첫 하이브리드 서명 트랜잭션"
sidebar_label: "워크숍 1"
sidebar_position: 2
date: 2026-11-12
---

# 워크숍 1: 첫 하이브리드 서명 트랜잭션

이 가이드는 아무것도 설치되지 않은 컴퓨터에서 출발해, 두 개의 키로 동시에 서명하고 QoreChain 테스트넷이 검증한 트랜잭션 하나까지 안내합니다. 개발자가 아니어도 괜찮습니다. 모든 명령은 쉬운 말로 설명하며, 모든 단계는 화면에 무엇이 보여야 하는지로 끝납니다.

**소요 시간:** 처음에는 도구 설치를 포함해 약 30분입니다. 도구가 이미 설치되어 있다면 약 10분입니다.

## 만들 것 {#what-we-built}

명령 하나로 만든 완전한 Solidity 프로젝트(작은 스마트 컨트랙트)를 테스트하고, QoreChain 테스트넷에 배포한 다음, **두 개의 키로 동시에 서명한** 트랜잭션 하나를 체인이 확인하게 합니다.

보여 주는 것:

- **하이브리드 서명.** 트랜잭션에는 기존 방식의 secp256k1 서명과 포스트 양자 ML-DSA-87 서명(NIST FIPS 204)이 함께 들어갑니다. 둘 다 유효해야 합니다.
- **체인에서 검증된 하이브리드 서명 트랜잭션 하나.** 검증자가 두 서명을 모두 검증합니다. 증거는 공개 REST 엔드포인트(`PQCHybridSignature` 확장과 `pqc_hybrid_verify` 이벤트)와 탐색기에서 읽을 수 있습니다.
- **EVM 승인 윈도우.** 이더리움 트랜잭션에는 포스트 양자 서명을 담을 수 없습니다. 그래서 QoreChain에서는 ML-DSA-87 키를 한 번 등록하고, 하이브리드로 서명한 메시지로 짧은 윈도우를 엽니다. 이 윈도우 동안 일반 EVM 트랜잭션이 승인됩니다. 개념은 [5분 만에 배포하기](/getting-started/deploy-in-5-minutes)에서 자세히 다룹니다.

이것이 바로 Quantum Pass 레벨이 요구하는 내용입니다.

## 이 가이드에서 쓰는 용어 {#words}

| 용어 | 쉬운 뜻 |
| --- | --- |
| 터미널 | 명령을 입력하는 창. macOS와 Linux에서는 Terminal, Windows에서는 PowerShell |
| 테스트넷 | QoreChain의 연습용 복사본. 코인에 가치가 없습니다 |
| QOR와 uqor | QOR는 코인이고 uqor는 가장 작은 단위입니다. 1 QOR = 1,000,000 uqor |
| 트랜잭션 | 체인으로 보내는, 서명된 지시 하나 |
| 메모 | 트랜잭션에 붙이는 짧은 텍스트 |
| 개인 키 | 계정을 대신해 서명하는 비밀 값. 이것을 가진 사람이 계정을 제어합니다 |
| 복구 코드 | 포스트 양자 키를 만드는 두 번째 비밀 값(`QRC1`로 시작) |
| 해시 | 트랜잭션의 고유 ID. 트랜잭션을 조회할 때 씁니다 |
| 가스와 수수료 | 체인이 트랜잭션을 처리하는 대가로 QOR로 내는 작은 금액 |

:::caution 일회용 테스트넷 계정만 사용하세요
이 연습을 위해 만든 키, 그리고 테스트 QOR만 들어 있는 계정을 사용하세요. 실제 지갑이나 실제 자금은 절대 쓰지 마세요. 실제 돈이 들어 있는 계정의 키나 복구 코드를 `.env` 파일에 넣지 말고, `.env`를 공유하거나 커밋하지 마세요.
:::

## 시작하기 전에 {#prerequisites}

macOS, Windows 또는 Linux 컴퓨터, 터미널, 웹 브라우저가 필요합니다. 이 튜토리얼에서는 도구 두 가지를 설치합니다. **Node.js 22 이상**(여기서 쓰는 프로젝트 도구인 Hardhat 3에 22 버전이 필요합니다)과 **pnpm**(프로젝트의 라이브러리를 내려받는 도구)입니다. 선택 도구인 **jq**는 검증 결과를 읽기 쉽게 만들어 줄 뿐입니다.

먼저 터미널을 여세요. macOS에서는 **Terminal**을, Windows에서는 **PowerShell**을, Linux에서는 터미널 앱을 엽니다.

### Node.js 22 이상 {#install-node}

1. 이미 설치되어 있는지 확인합니다.

```bash
node -v
```

`v22` 또는 더 높은 숫자가 출력되어야 합니다. `command not found`가 나오거나 더 낮은 버전이 나오면 아래와 같이 Node.js를 설치하세요.

2. 사용 중인 시스템에 맞게 설치합니다.

| 시스템 | 설치 방법 |
| --- | --- |
| macOS | [nodejs.org/en/download](https://nodejs.org/en/download)에서 설치 프로그램을 내려받거나, Homebrew를 쓴다면 `brew install node@22`를 실행합니다 |
| Windows | PowerShell에서 `winget install OpenJS.NodeJS.LTS`를 실행하거나, [nodejs.org/en/download](https://nodejs.org/en/download)에서 설치 프로그램을 내려받습니다 |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`를 실행하고, 터미널을 닫았다가 다시 연 다음 `nvm install 22`를 실행합니다 |

3. 터미널을 닫고 새로 연 다음 `node -v`를 다시 실행합니다.

**화면에 보여야 하는 것:** `v22` 이상으로 시작하는 숫자, 예를 들어 `v22.12.0`.

### pnpm {#install-pnpm}

1. 이미 설치되어 있는지 확인합니다.

```bash
pnpm -v
```

2. `command not found`(또는 `pnpm: command not found`)가 나오면 설치합니다.

```bash
npm install -g pnpm
```

| 부분 | 의미 |
| --- | --- |
| `npm` | Node.js와 함께 설치되는 패키지 도구 |
| `install` | 프로그램을 내려받아 설치 |
| `-g` | 전역(global): 폴더 하나가 아니라 컴퓨터 전체에 설치 |
| `pnpm` | 설치할 프로그램 |

Homebrew로 설치한 Node.js에는 pnpm이 들어 있지 않습니다. 그래서 macOS에서 `pnpm: command not found`가 자주 나오며, 위 명령을 실행하면 해결됩니다. Linux나 macOS에서 권한 오류가 나오면 대신 `corepack enable`을 실행한 다음 `pnpm -v`를 다시 실행하세요.

3. `pnpm -v`로 다시 확인합니다.

**화면에 보여야 하는 것:** 버전 번호, 예를 들어 `9.12.0` 이상.

### jq (선택) {#install-jq}

`jq`는 긴 응답을 짧고 읽기 쉬운 형태로 출력해 줍니다. 단계 8에서 한 번만 사용합니다.

| 시스템 | 설치 | 확인 |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian, Ubuntu) | `jq --version` |

단계 8에서 쓰는 `curl`은 macOS, Linux, Windows 10 이상에 이미 들어 있습니다. Windows PowerShell에서는 `curl` 대신 `curl.exe`를 입력하세요.

## 테스트넷 지갑과 페이셋 {#wallet}

프로젝트가 단계 3에서 일회용 계정을 직접 만들기 때문에, 이 가이드를 끝내는 데 지갑은 필요하지 않습니다. 다만 그 계정에는 테스트넷 QOR가 필요하며, 예제 앱에서 쓸 QoreX 지갑을 테스트넷으로 설정해 둘 수도 있습니다.

**테스트넷의 QoreX (여기서는 선택, 브라우저 예제 앱에는 필요):**

1. **QoreX 앱**에서 **설정**을 열고 **Use testnet (developers)**를 켭니다.
2. **QoreX 브라우저 확장 프로그램**에서 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.
3. 이더리움 쪽(EVM) 작업에는 **Add an Ethereum account (coin 60)**도 선택합니다. 이더리움 도구와 함께 쓸 수 있는 `0x...` 주소의 계정이 생깁니다.

**페이셋**은 테스트넷 QOR를 무료로 주는 자동 창구입니다. 단계 4에서 사용합니다.

- 주소: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). 먼저 로그인합니다.
- 금액: 계정당 24시간에 한 번, 100 QOR.
- 새 계정의 첫 트랜잭션은 포스트 양자 ML-DSA-87 키를 등록합니다. 이 작업에는 약 0.09 QOR의 일회성 수수료가 들기 때문에 100 QOR면 충분합니다.

이 가이드에서 쓰는 네트워크 정보:

| 서비스 | URL |
| --- | --- |
| 테스트넷 | `qorechain-diana`, EVM 체인 ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| 탐색기 | `https://explore.qore.network` (테스트넷으로 전환) |
| 페이셋 | `https://dashboard.qorechain.io/faucet` (로그인 필요) |

## 단계 {#steps}

### 단계 1: 도구 확인 {#step-1}

**소요 시간:** 1분.

```bash
node -v
```

| 부분 | 의미 |
| --- | --- |
| `node` | Node.js 프로그램 |
| `-v` | 버전을 출력하고 종료 |

```bash
pnpm -v
```

| 부분 | 의미 |
| --- | --- |
| `pnpm` | 패키지 도구 |
| `-v` | 버전을 출력하고 종료 |

**화면에 보여야 하는 것:** Node.js는 `v22` 이상, pnpm은 버전 번호. 그렇지 않다면 "시작하기 전에"로 돌아가세요.

### 단계 2: 프로젝트를 만들고 테스트 실행 {#step-2}

**소요 시간:** 약 1분. 인터넷 연결이 필요합니다.

1. 새 폴더에 프로젝트를 만듭니다. 터미널에서 프로젝트를 보관하는 폴더(예를 들어 문서 폴더)로 이동한 다음 실행합니다.

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

하는 일: QoreChain 프로젝트 생성기를 내려받아, 새 폴더에 `qday-demo`라는 이름의 바로 쓸 수 있는 프로젝트를 만듭니다.

파라미터:

- `npx`: 인터넷에 있는 프로그램을 영구 설치 없이 실행합니다.
- `create-qorechain-dapp@latest`: QoreChain 프로젝트 생성기. `@latest`는 최신 버전을 쓰라는 뜻입니다(이 가이드는 0.14.0으로 확인했습니다).
- `qday-demo`: 새 폴더와 프로젝트의 이름. 다른 이름을 골라도 됩니다.
- `-t hardhat`: `-t`는 템플릿을 뜻합니다. 테스트가 포함된 Solidity 컨트랙트 프로젝트인 Hardhat 템플릿을 고릅니다.
- `--network testnet`: 프로젝트가 연결할 QoreChain 네트워크. `testnet`은 연습용 네트워크입니다.
- `--package-manager pnpm`: 프로젝트에 필요한 라이브러리를 설치할 도구.

**화면에 보여야 하는 것:** 설치된 패키지 목록, 그다음 `Done! Created qday-demo`. `create-qorechain-dapp` 설치 여부를 물으면 `y`라고 답하세요.

2. 프로젝트 폴더로 들어갑니다.

```bash
cd qday-demo
```

하는 일: 터미널을 새 폴더 안으로 옮깁니다. 이후의 모든 명령은 여기에서 실행합니다.

파라미터:

- `cd`: 디렉터리 변경(change directory).
- `qday-demo`: 들어갈 폴더.

3. 테스트를 실행합니다.

```bash
pnpm test
```

하는 일: 컨트랙트를 컴파일하고, 컴퓨터 안의 작은 모의 체인에서 제대로 동작하는지 확인합니다. 실제 테스트넷으로는 아무것도 보내지 않습니다.

파라미터:

- `pnpm`: 패키지 도구.
- `test`: 실행할 스크립트의 이름(`package.json`에 있으며 `hardhat test`를 실행합니다).

**화면에 보여야 하는 것:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. 무엇이 만들어졌는지 살펴봅니다(선택).

| 파일 | 설명 |
| --- | --- |
| `contracts/Counter.sol` | 스마트 컨트랙트: 숫자 하나를 저장하고 1을 더할 수 있습니다 |
| `ignition/modules/Counter.ts` | 컨트랙트를 배포하는 레시피 |
| `scripts/window.ts` | `pnpm window`의 도우미: 키를 등록하고 승인 윈도우를 엽니다 |
| `hardhat.config.ts` | `qorechainTestnet` 네트워크(체인 ID 9800)를 포함한 설정 |
| `.env` | 비밀 설정 파일. 단계 3에서 채웁니다. 절대 공유하지 마세요 |

템플릿에 대한 자세한 내용: [스캐폴더와 CLI](/developer-tools/scaffolders-and-cli)와 [체인 개발자 키트](/developer-tools/chain-dev-sdk).

### 단계 3: 일회용 테스트넷 계정 만들기 {#step-3}

**소요 시간:** 3분.

계정에는 비밀 값이 두 개 필요합니다. 이더리움 방식의 **개인 키**와, 포스트 양자 ML-DSA-87 키를 만드는 **복구 코드**(`QRC1`로 시작)입니다. 둘 다 프로젝트 폴더의 `.env` 파일에 넣습니다. 이 파일은 여러분의 컴퓨터 안에서만 쓰입니다.

1. 새 개인 키를 만듭니다. 먼저 `qday-demo` 폴더 안에 `make-key.mjs`라는 작은 파일을 다음 내용으로 만드세요(메모장, 일반 텍스트 모드의 TextEdit, nano 등 아무 텍스트 편집기를 쓰면 됩니다).

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

이 파일이 하는 일: 무작위 개인 키를 만들어 `.env` 파일에 써 넣습니다. 그래서 키가 화면에 표시되거나 손으로 복사될 일이 없습니다.

2. 실행합니다.

```bash
node make-key.mjs
```

하는 일: Node.js로 이 작은 파일을 실행합니다.

파라미터:

- `node`: Node.js 프로그램.
- `make-key.mjs`: 실행할 파일.

**화면에 보여야 하는 것:** `New private key saved in .env`. 한 번만 실행하세요. 두 번째 실행은 다른 계정을 만듭니다.

3. 복구 코드를 만듭니다.

```bash
pnpm window recovery-code
```

하는 일: 새 복구 코드를 만들어 출력합니다.

파라미터:

- `pnpm window`: 프로젝트의 윈도우 도우미(`scripts/window.ts`)를 실행합니다.
- `recovery-code`: 동작: 새 복구 코드를 출력합니다.

**화면에 보여야 하는 것:** `QRC1`로 시작하는 긴 한 줄, 그리고 보관에 관한 안내. `QRC1...` 줄 전체를 복사하세요.

4. 코드를 `.env`에 넣습니다. 편집기로 파일을 엽니다.

| 시스템 | 명령 |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

`QORE_PQC_RECOVERY_CODE=` 줄을 찾아 등호 바로 뒤에 공백과 따옴표 없이 코드를 붙여 넣고 파일을 저장합니다. 결과는 다음과 같습니다(자리표시자로 표시했으며, 실제로는 진짜 값이 들어갑니다).

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

각 줄의 의미:

- `PRIVATE_KEY`: 계정의 기존 방식(secp256k1) 절반을 서명하는 비밀 값.
- `QORE_PQC_RECOVERY_CODE`: 포스트 양자(ML-DSA-87) 절반을 만드는 비밀 값.
- `QORE_NETWORK`: 도우미가 연결할 네트워크. `testnet`은 연습용 네트워크입니다.

`.env`를 그대로 보관하세요. 같은 키와 코드는 매번 같은 계정을 만듭니다. 파일을 잃어버리면 새 계정으로 처음부터 다시 시작해야 합니다. 절대 공유하지 말고 git에 커밋하지도 마세요.

니모닉(12단어)을 선호하나요? 키와 코드 대신 `.env`에 `QORE_MNEMONIC="your twelve words"`를 넣으세요. 두 키가 같은 문구에서 만들어지므로 복구 코드가 필요 없습니다. 이 연습만을 위해 만든 문구를 사용하세요.

5. 새 계정의 주소를 프로젝트에 물어봅니다.

```bash
pnpm window status
```

하는 일: 공개 체인을 읽어 계정, 포스트 양자 키, 윈도우 상태를 보여 줍니다. 아무것도 바꾸지 않습니다.

파라미터:

- `pnpm window`: 윈도우 도우미를 실행합니다.
- `status`: 동작: 현재 상태를 보여 줍니다.

**화면에 보여야 하는 것:** 세 줄(여러분의 화면에는 실제 주소가 표시됩니다).

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

`qor1...` 주소를 복사하세요. 페이셋에 줄 주소입니다. 두 주소는 같은 계정의 것입니다. `0x...`는 이더리움 형식이고 `qor1...`는 QoreChain 형식입니다.

### 단계 4: 페이셋에서 테스트넷 QOR 받기 {#step-4}

**소요 시간:** 2분.

1. 브라우저에서 [페이셋](https://dashboard.qorechain.io/faucet)을 열고 로그인합니다.
2. 대시보드가 **Testnet**으로 되어 있는지 확인합니다.
3. `qor1...` 주소를 붙여 넣습니다.
4. **Request Tokens**를 선택합니다.

**화면에 보여야 하는 것:** 100 QOR(그리고 일부 페스트 테스트 토큰)와 **View on Explorer** 링크가 있는 **Tokens Sent!** 카드.

페이셋은 계정당 24시간에 한 번 지급합니다. 정확한 금액은 [페이셋](/dashboard/faucet)에 있습니다. 이제 터미널에서 확인합니다.

```bash
pnpm window status
```

**화면에 보여야 하는 것:** 이전과 같은 세 줄. 이제 계정이 체인에 존재하고 수수료를 낼 수 있습니다. 키는 여전히 등록되지 않았다고 표시됩니다. 다음 단계에서 등록합니다.

### 단계 5: 키 등록과 윈도우 열기 {#step-5}

**소요 시간:** 약 2분.

1. ML-DSA-87 키를 등록합니다. 계정당 한 번만 하는 단계입니다.

```bash
pnpm window register
```

등록이 무엇을 하는지 이해하려면 [양자 내성 키가 내 계정에 연결되는 방식](/build-before-qday/key-binding)을 읽어 보세요.

하는 일: 어떤 포스트 양자 키가 계정에 속하는지 체인에 알려 주는 트랜잭션 하나를 보냅니다. 약 0.09 QOR의 일회성 수수료가 듭니다. 아직 기록된 포스트 양자 키가 없으므로, 체인은 기존 방식 키로만 서명한 이 메시지 하나를 받아들입니다.

파라미터:

- `pnpm window`: 윈도우 도우미를 실행합니다.
- `register`: 동작: 키를 등록합니다.

**화면에 보여야 하는 것:** `registered: <HASH>`. `The account already has a PQC key; nothing to do.`라고 나와도 괜찮습니다. 다음으로 넘어가세요.

2. 승인 윈도우를 엽니다.

```bash
pnpm window open
```

하는 일: **하이브리드 서명**(두 키 모두)을 한 트랜잭션을 보내, 컨트랙트 배포 같은 이더리움 방식의 일반 트랜잭션이 승인되는 짧은 윈도우를 엽니다.

파라미터:

- `pnpm window`: 윈도우 도우미를 실행합니다.
- `open`: 동작: 윈도우를 엽니다. 기본값으로 600블록 동안 유지되며 트랜잭션 5개를 허용합니다. `.env`의 `QORE_WINDOW_BLOCKS`와 `QORE_WINDOW_TXS`로 바꿀 수 있습니다.

**화면에 보여야 하는 것:** `opened: <HASH>`, 그다음 `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)` 같은 줄. 마지막 숫자는 윈도우의 지출 한도(uqor 단위, 3.75 QOR)입니다. `opened:` 해시를 적어 두세요. 단계 8에서 검증합니다.

3. 약 10초 기다립니다. 윈도우를 열면서 계정 카운터(nonce)가 올라갔고, Hardhat은 체인이 안정되기를 기다립니다.

### 단계 6: 컨트랙트 빌드 {#step-6}

**소요 시간:** 몇 초.

```bash
pnpm build
```

하는 일: Solidity 컨트랙트를 체인이 실행하는 형태로 바꿉니다.

파라미터:

- `pnpm`: 패키지 도구.
- `build`: 실행할 스크립트(`hardhat build`를 실행합니다).

**화면에 보여야 하는 것:** `Compiled 1 Solidity file` 또는 `No contracts to compile`. 둘 다 정상입니다. 단계 2의 테스트에서 이미 컴파일되었습니다.

### 단계 7: 컨트랙트를 테스트넷에 배포 {#step-7}

**소요 시간:** 약 30초.

```bash
pnpm deploy:testnet
```

하는 일: 열어 둔 윈도우를 사용해 Hardhat Ignition으로 컨트랙트를 QoreChain 테스트넷에 보냅니다. 일반적인 EVM 트랜잭션입니다.

파라미터:

- `pnpm`: 패키지 도구.
- `deploy:testnet`: 실행할 스크립트. `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet`을 실행합니다. 즉 `Counter.ts` 레시피를 `qorechainTestnet`(체인 ID 9800)이라는 네트워크에 배포합니다.

Hardhat이 `Confirm deploy to network qorechainTestnet (9800)?`라고 물으면 `y`를 입력하고 Enter를 누르세요.

**화면에 보여야 하는 것:** `[ CounterModule ] successfully deployed`와 `CounterModule#Counter - 0x...` 줄. `0x...`는 여러분의 컨트랙트 주소입니다. `HHE10402`가 나오면 같은 명령을 다시 실행하세요(문제 해결 참조).

### 단계 8: 체인에서 하이브리드 서명 검증 {#step-6-verify}

**소요 시간:** 3분.

단계 5의 `opened:` 트랜잭션은 두 키로 서명되었습니다. 누구나 공개 REST 엔드포인트에서 확인할 수 있습니다.

1. `<HASH>`를 그 해시로 바꾸고(`<`와 `>`는 빼고) 실행합니다.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

하는 일: 공개 테스트넷 서버에 여러분의 트랜잭션 전체 기록을 요청합니다.

파라미터:

- `curl`: 웹 주소의 내용을 가져오는 프로그램.
- `-s`: 조용히(silent). 진행 표시줄을 숨기고 응답만 보여 줍니다.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: 테스트넷 REST 주소 뒤에 트랜잭션 해시를 붙인 것.

**화면에 보여야 하는 것:** 긴 텍스트 덩어리. 세 가지를 찾아보세요.

1. `tx_response` 안의 `"code": 0`. 코드 0은 성공을 뜻합니다.
2. ML-DSA-87 서명을 담은 `PQCHybridSignature` 확장: 64바이트 secp256k1 서명 옆에 **4,627바이트**.
3. `events` 안에서 `status` 속성이 `verified`로 되어 있는 `pqc_hybrid_verify` 타입의 이벤트.

2. 그 이벤트만 출력하려면(`jq` 필요):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

하는 일: 같은 기록을 가져와 `jq`에 통과시켜 검증 이벤트만 남깁니다.

파라미터:

- `|`: 첫 번째 명령의 출력을 두 번째 명령으로 넘깁니다.
- `jq`: 필터 프로그램.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: 이벤트 목록을 훑으며 타입이 `pqc_hybrid_verify`인 것만 남깁니다.

**화면에 보여야 하는 것:** `"status"`가 `"verified"`로 되어 있는 작은 텍스트 블록.

3. 탐색기에서 확인합니다.
   1. [explore.qore.network](https://explore.qore.network)를 엽니다.
   2. 네트워크 선택기를 **Testnet**으로 전환합니다.
   3. 해시를 검색합니다.

**화면에 보여야 하는 것:** 트랜잭션 페이지에 서명 보안이 양자 내성이며 체인에서 검증되었고 ML-DSA-87 알고리즘(FIPS 204)이라고 표시됩니다.

이것이 증거입니다. 검증자가 두 서명을 모두 확인했습니다. 이것이 여러분의 Quantum Pass 트랜잭션입니다.

## 한눈에 보는 화면 결과 {#what-you-should-see}

| 시점 | 내용 |
| --- | --- |
| 단계 2 이후 | `Done! Created qday-demo`와 `2 passing` |
| 단계 3 이후 | `pnpm window status`가 보여 주는 `qor1...` 주소와 `0x...` 주소, 키는 등록되지 않음 |
| 단계 4 이후 | 페이셋의 **Tokens Sent!** |
| 단계 5 이후 | `registered: <HASH>`, 그다음 `opened: <HASH>`와 윈도우 줄 |
| 단계 7 이후 | `CounterModule#Counter - 0x...` |
| 단계 8 이후 | REST 출력과 테스트넷 탐색기에서 `code` 0, 4,627바이트 ML-DSA-87 서명, `status`가 `verified`인 `pqc_hybrid_verify` |

## 사용한 패키지 {#published}

생성된 `package.json`에 선언되어 있습니다.

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

| 보이는 증상 | 이유 | 해결 방법 |
| --- | --- | --- |
| 윈도우를 연 직후 `HHE10402` 또는 "wait for confirmations" | 윈도우를 열면서 계정 nonce가 올라갔습니다 | `pnpm deploy:testnet`을 다시 실행하세요 |
| "EVM authorisation window exhausted" 또는 "no window" | 윈도우의 트랜잭션이나 블록이 소진되었거나, 다른 컨트랙트로 범위가 제한되어 있습니다(다른 컨트랙트로 범위가 제한된 윈도우는 배포를 막습니다) | `pnpm window open`으로 새 윈도우를 열고, 약 10초 기다린 다음 다시 배포하세요 |
| "account has no PQC key and classical fallback is disabled" | 계정이 ML-DSA-87 키를 등록하지 않았습니다 | 먼저 `pnpm window register`를 실행한 다음 `pnpm window open`을 실행하세요 |
| "does not exist on chain yet" | 계정에 아직 QOR가 없습니다 | 페이셋에서 QOR를 받으세요(단계 4) |
| 페이셋에서 "Rate Limit Reached", 또는 30초가 지나도 토큰이 오지 않음 | 계정당, 주소당 24시간에 한 번만 받을 수 있고 요청은 하나씩 처리됩니다 | 몇 초 기다렸다가 다시 시도하거나 24시간이 지나기를 기다리세요. 24시간에 요청은 한 번뿐입니다 |
| `pnpm: command not found` | pnpm이 설치되어 있지 않습니다. Homebrew로 설치한 Node.js에는 pnpm이 없습니다 | `npm install -g pnpm`을 실행한 다음 새 터미널을 여세요 |
| `pnpm window`가 복구 코드 누락 메시지와 함께 멈춤 | `.env`에 `PRIVATE_KEY`는 있지만 `QORE_PQC_RECOVERY_CODE`가 없습니다 | `pnpm window recovery-code`를 실행해 코드를 `.env`에 붙여 넣거나(단계 3), `QORE_MNEMONIC`을 사용하세요 |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | 붙여 넣을 때 오타, 공백 또는 따옴표가 들어갔습니다 | 공백이나 따옴표 없이 코드를 다시 붙여 넣으세요 |
| `pnpm window status`에서 "registered, but NOT this key" | 이전에 이 계정에 다른 복구 코드를 사용했습니다 | 원래의 복구 코드를 `.env`에 다시 넣거나 새 계정으로 처음부터 시작하세요 |
| 브라우저 앱에서 CORS 오류 | 브라우저가 여러분의 페이지를 허용하지 않는 체인 주소로의 호출을 차단합니다 | 브라우저에서 REST를 호출할 때는 체인 주소를 직접 호출하지 말고 템플릿의 `/lcd` 프록시 경로를 사용하세요 |
| Hardhat이 시작되지 않음 | Node.js가 22보다 낮은 버전입니다 | Node.js 22 이상을 설치하고("시작하기 전에" 참조) `pnpm install`을 다시 실행하세요 |
| 단계 직후 `curl`이 `tx not found`를 표시 | 블록이 아직 확정되지 않았습니다 | 10초 기다렸다가 명령을 다시 실행하세요 |
| Windows PowerShell에서 `curl`이 동작하지 않음 | PowerShell에서 `curl`은 다른 명령입니다 | `curl` 대신 `curl.exe`를 입력하세요 |

## 예제 앱 {#example-apps}

같은 흐름을 여러 언어와 프런트엔드로 구현한 것입니다. 모두 하이브리드로 서명합니다. 전부 공개 저장소 [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)의 `workshop-1` 폴더에 있습니다. 받으려면 Git이 필요합니다(`git --version`으로 확인하고, 없으면 [git-scm.com](https://git-scm.com/downloads)에서 설치). 그런 다음 실행합니다.

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

하는 일: 모든 예제 앱의 사본을 내려받고 `workshop-1` 폴더로 이동합니다.

파라미터:

- `git clone <주소>`: 인터넷에 있는 프로젝트를 컴퓨터로 복사합니다.
- `cd build-before-qday/workshop-1`: 앱 여섯 개가 들어 있는 폴더로 들어갑니다.

각 앱 페이지는 설치할 것과 기대할 결과를 담은 처음부터 끝까지의 독립된 가이드입니다.

| 앱 | 언어 | 페이지 |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

이 앱들의 기반이 되는 키트는 [키트](/build-before-qday/workshop-1/kits)에 나와 있습니다. 브라우저 dApp에서 QoreX 지갑을 사용하려면 [QoreX](/qorex/overview)를 참조하세요.
