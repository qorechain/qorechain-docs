---
slug: /build-before-qday/workshop-2
title: "워크숍 2: 포스트 양자 키로 자금 보호하기"
sidebar_label: "워크숍 2"
sidebar_position: 3
date: 2026-11-18
---

# 워크숍 2: 포스트 양자 키로 자금 보호하기

워크숍 1에서는 두 개의 키로 서명한 트랜잭션 하나를 보냈습니다. 워크숍 2에서는 그 포스트 양자 키로 **자금을 보호**합니다. 먼저 포스트 양자 키가 서명해야만 지급하는 스마트 컨트랙트를 만들고, 다음으로 지출 한도를 체인이 강제하는 AI 에이전트를 만들고, 마지막으로 각 트랜잭션이 어떻게 보호되었는지 체인에 물어보는 방법을 배웁니다.

보안 전문가가 아니어도 괜찮습니다. 아래의 모든 명령은 무엇을 하는지, 화면에 무엇이 보여야 하는지를 설명합니다. 세 개의 예제 앱은 공개되어 있습니다. [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)의 `workshop-2` 폴더입니다.

**소요 시간:** 금고에 약 40분, 에이전트에 25분, 체인에 묻는 질문에 10분입니다. 각 파트는 순서와 상관없이 할 수 있지만, 파트마다 자신의 테스트 계정이 필요합니다.

## 만들 것 {#what-we-built}

| 파트 | 앱 | 보여 주는 것 |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity와 TypeScript) | ML-DSA-87 서명이 있을 때만 지급하는 금고. 서명은 `pqcVerify` precompile이 체인에서 확인합니다. 이더리움 방식 키를 훔쳐도 돈을 가져갈 수 없습니다. |
| 2 | **청구서 결제 에이전트** (Node.js) | 자신의 키를 가진 에이전트. 한도는 체인이 강제합니다. 송금만 가능, 결제당 1 QOR, 하루 3 QOR, 24시간. |
| 3 | **체인에 묻기** (MCP와 `qore-cli`) | 읽기 전용 질문: 이 트랜잭션이 포스트 양자로 서명되었는가, 이 계정의 키 상태는 어떤가? |

이 앱들의 바탕이 되는 혁신 요소:

- **컨트랙트 안에서의 포스트 양자 검증.** 체인에는 고정된 주소에 내장 컨트랙트(precompile)가 있어, ML-DSA-87 서명을 확인하고 계정에 등록된 키를 알려 줍니다. Solidity 코드는 이를 다른 컨트랙트처럼 호출합니다.
- **체인에 있는 한도.** 에이전트의 권한과 지출 규칙은 계정의 일부이므로, 버그나 탈취된 서버도 이를 풀 수 없습니다.
- **정직한 표시.** 체인은 어떤 트랜잭션에 포스트 양자 서명이 있었고 어떤 트랜잭션에 없었는지 알려 줍니다.

## 이 가이드에서 쓰는 용어 {#words}

| 용어 | 쉬운 뜻 |
| --- | --- |
| Precompile | 체인이 고유 기능으로 실행하는, 고정된 주소의 내장 컨트랙트. `pqcVerify`는 `0x0000000000000000000000000000000000000a01`에, `pqcKeyStatus`는 `0x0000000000000000000000000000000000000a02`에 있습니다. 주소는 소문자로 쓰세요. Solidity 컴파일러는 대소문자가 섞인 표기를 거부합니다 |
| ML-DSA-87 | QoreChain이 사용하는 포스트 양자 서명 방식(NIST FIPS 204) |
| EVM 윈도우 | 계정에서 이더리움 방식 트랜잭션을 보낼 수 있게 해 주는 짧고 제한된 권한. 열려면 두 개의 키로 서명한 트랜잭션이 필요하므로, 이더리움 키만으로는 절대 열 수 없습니다 |
| 가디언 | 금고에서 출금할 때마다 포스트 양자 키로 서명해야 하는 계정 |
| 인증자 | 체인이 강제하는 규칙과 함께 내 계정에 연결된 키. 파트 2의 에이전트가 사용합니다 |
| 일회용 계정 | 이 연습을 위해 만든 키로, 테스트 QOR만 들어 있는 계정 |

:::caution 일회용 테스트넷 계정만 사용하세요
이 워크숍을 위해 만든 키, 그리고 가치 없는 테스트 QOR만 들어 있는 계정을 사용하세요. 실제 돈이 들어 있는 계정의 키나 복구 코드를 `.env` 파일이나 명령에 절대 넣지 마세요.
:::

## 시작하기 전에 {#prerequisites}

[시작하기 전에](/build-before-qday/prerequisites)의 도구(터미널, Node.js 22 이상, Git)와 웹 브라우저가 필요합니다. Node.js를 확인합니다.

```bash
node -v
```

`v22` 이상이 출력되어야 합니다. 파트 1에는 **pnpm**과 **Foundry**도 필요합니다.

```bash
npm install -g pnpm
```

금고가 사용하는 패키지 도구인 pnpm을 설치합니다. `pnpm -v`로 확인하세요.

Foundry는 Solidity를 컴파일, 테스트, 배포합니다. [getfoundry.sh](https://getfoundry.sh)에서 설치하세요. 페이지가 시스템에 맞는 명령 하나를 알려 주며, 그다음 실행합니다.

```bash
foundryup
```

Foundry 도구를 내려받습니다. `forge --version`과 `cast --version`으로 확인하세요.

예제 코드를 받습니다.

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

첫 번째 줄은 예제를 `build-before-qday`라는 폴더로 내려받습니다. 두 번째 줄은 세 개의 앱이 들어 있는 `workshop-2` 폴더로 이동합니다.

테스트 QOR은 대시보드의 [페이셋](/dashboard/faucet)에서 받습니다. 세 앱 모두 QoreChain 테스트넷 `qorechain-diana`에서만 실행됩니다.

## 파트 1: QDayVault, 키가 유출되어도 안전한 금고 {#part-1}

코드: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). 일반 지갑 키(MetaMask가 쓰는 secp256k1 키)는 언젠가 양자 컴퓨터로 깨질 수 있습니다. 이 금고는 그런 키를 훔쳐도 충분하지 않도록 만들어져 있습니다. **가디언**이 포스트 양자 키로 출금에 서명할 때만 돈이 나가며, 컨트랙트가 그 서명을 체인에서 직접 확인합니다. 서명된 출금은 누구든 제출할 수 있습니다. 중요한 것은 보내는 사람이 아니라 서명입니다.

```bash
cd 01-qday-vault
```

금고 폴더로 이동합니다.

### 컨트랙트의 동작 방식 {#vault-how}

`src/QDayVault.sol`을 엽니다. 중요한 함수는 `withdraw`입니다.

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **체인에서 가디언의 키를 읽습니다.** 키는 2,592바이트이므로 컨트랙트가 저장하지 않습니다. 가디언이 체인에서 키를 교체하면 금고도 그에 따릅니다.
2. **증명되지 않은 키는 거부합니다.** "증명됨"은 계정이 키를 등록할 때 소유 증명에 서명했다는 뜻입니다. 이 확인이 없으면 누군가 자기 것이 아닌 키를 등록할 수 있습니다.
3. **정해진 메시지에 대한 서명을 검증합니다.** 메시지에는 고정된 태그, 체인 ID, 금고 주소, 수취인, 금액, nonce가 묶여 있어서, 서명은 한 번의 출금에, 한 금고에서, 한 체인에서, 한 번만 유효합니다.
4. **돈을 보내기 전에 nonce를 올립니다.** 같은 서명을 두 번 쓸 수 없고, 외부 호출 전에 상태가 바뀌므로 재진입 공격도 막습니다.
5. **송금이 성공했는지 확인합니다.** 실패하면 트랜잭션 전체가 취소됩니다.

### 단계 1: 테스트 실행 (계정 불필요) {#vault-tests}

```bash
pnpm install
```

`package.json`에 있는 JavaScript 패키지(QoreChain SDK, viem, tsx)를 내려받습니다.

```bash
pnpm forge-std
```

Foundry의 표준 라이브러리인 `forge-std`를 `lib/`에 내려받습니다. 테스트와 배포 스크립트가 이를 가져다 씁니다. 한 번만 하면 됩니다.

```bash
forge test
```

컨트랙트를 컴파일하고 `test/QDayVault.t.sol`의 테스트 8개를 실행합니다. `8 passed; 0 failed`가 보여야 합니다. 로컬 테스트 체인에는 QoreChain precompile이 없으므로, 테스트는 `vm.etch`로 두 precompile 주소에 작은 대역 컨트랙트를 놓습니다. 테스트는 로직을 확인합니다. 올바른 서명은 지급되고, 잘못된 서명은 거부되고, 서명은 한 번만 쓸 수 있고, 증명되지 않은 키는 거부됩니다. 실제 precompile은 다음 단계들에서 실행됩니다.

### 단계 2: 테스트넷 전용 계정 만들기 {#vault-account}

```bash
cast wallet new
```

새 주소와 개인 키를 출력합니다. 테스트넷에서만 사용하세요.

macOS와 Linux에서는 다음을 실행합니다.

```bash
cp .env.example .env
```

Windows PowerShell에서는 `Copy-Item .env.example .env`를 사용합니다. 나만의 설정 파일이 만들어집니다. `.env`는 Git이 무시하므로 커밋되지 않습니다. `.env`를 열고 `PRIVATE_KEY`를 `cast wallet new`가 출력한 개인 키로 설정하세요.

```bash
pnpm window recovery-code
```

`QRC1-`로 시작하는 복구 코드를 출력합니다. 포스트 양자 키는 이 코드로 만들어집니다. `.env`에 `QORE_PQC_RECOVERY_CODE`로 넣고, 개인 키와는 다른 안전한 곳에 사본을 보관하세요. 항상 같은 코드를 쓰세요. 코드가 다르면 포스트 양자 키도 달라집니다.

### 단계 3: 계정에 자금 넣기 {#vault-fund}

```bash
pnpm window status
```

계정을 `0x...`와 `qor1...` 두 가지 형식으로 출력합니다. 같은 계정입니다. `qor1...` 주소를 [페이셋](/dashboard/faucet)에 붙여 넣으세요.

### 단계 4: 포스트 양자 키를 한 번 등록하기 {#vault-register}

```bash
pnpm window register
```

ML-DSA-87 공개 키를 소유 증명과 함께 체인에 올립니다. 계정당 한 번만 하면 됩니다. 이후 `pnpm window status`에 `PQC key: registered`가 표시됩니다. 체인이 아직 포스트 양자 키를 모르기 때문에, 기존 방식 키만으로 체인이 받아들이는 트랜잭션은 이것 하나뿐입니다. 등록이 실제로 무엇을 연결하는지는 [양자 내성 키가 내 계정에 연결되는 방식](/build-before-qday/key-binding)을 참고하세요.

### 단계 5: 범위가 제한된 EVM 윈도우 열기 {#vault-window}

```bash
pnpm window:scoped
```

두 개의 키로 서명한 트랜잭션을 보내 **600블록(약 15분), 트랜잭션 3개, 2 QOR**(금액과 수수료 합계)의 EVM 윈도우를 엽니다. 배포와 출금 한 번에는 충분하고 그 이상은 안 됩니다. 윈도우가 열려 있는 동안 기존 방식 키가 유출되더라도 피해는 이 한도로 제한되며, 윈도우가 끝나면 이더리움 방식 레인은 다시 닫힙니다.

다음 단계 전에 **약 10초 기다리세요**. 윈도우를 열면서 계정의 nonce 하나가 사용되었고, 다음 블록이 이를 먼저 포함해야 합니다.

### 단계 6: 금고 배포 {#vault-deploy}

```bash
pnpm deploy:testnet
```

Foundry 스크립트 `script/QDayVault.s.sol`을 실행합니다. 1 QOR를 예치한 금고를 배포하고 **내가** 가디언이 되도록 합니다. 출력에서 `QDayVault 0x...`를 찾아보세요. Foundry 출력의 "ETH"는 QOR를 뜻합니다.

```bash
pnpm vault status
```

금고 주소, 잔액(1 QOR), 가디언(나), nonce(0)를 보여 줍니다.

### 단계 7: 공격 시뮬레이션 {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

내 기존 방식 키는 가졌지만 포스트 양자 키는 없는 공격자를 흉내 냅니다. 무작위 ML-DSA-87 키로 출금에 서명하고 체인에 어떻게 되는지 물어봅니다. `BLOCKED by the vault: BadPqcSignature`가 보여야 합니다. 시뮬레이션일 뿐이므로 비용이 들지 않고 윈도우도 사용하지 않습니다. 수취인은 어떤 주소든 상관없습니다.

### 단계 8: 실제 출금 {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

**내** ML-DSA-87 키로 출금에 서명하고(157바이트 메시지, 4,627바이트 서명) 전송합니다. 금고가 `pqcVerify`로 확인하고 지급합니다. `WITHDRAWN tx 0x...`와 탐색기 링크가 보여야 합니다.

```bash
pnpm window status
```

윈도우에 남은 것을 보여 줍니다. 트랜잭션 1개, 즉 처음에 준 한도 그대로입니다.

### 문제가 생겼을 때 {#vault-troubleshooting}

| 보이는 증상 | 의미 | 해결 방법 |
| --- | --- | --- |
| 배포나 출금 때 `REFUSED: Missing or invalid parameters` | 유효한 EVM 윈도우가 없습니다. 만료되었거나 모두 사용되었습니다 | `pnpm window status`를 실행하고, `pnpm window:scoped`를 실행한 다음 10초 기다렸다가 다시 시도하세요 |
| `does not exist on chain yet` | 계정에 아직 QOR가 없습니다 | 페이셋을 사용하세요(단계 3) |
| `PQC key: not registered` | 단계 4를 건너뛰었습니다 | `pnpm window register`를 실행하세요 |
| `GuardianKeyNotRegistered` | 가디언의 ML-DSA-87 키가 체인에 없습니다 | 등록하세요(단계 4) |
| `No vault yet` | 이 폴더에서 배포된 것이 없습니다 | 단계 6을 하거나 `.env`에 `VAULT_ADDRESS`를 설정하세요 |

### 배포 전에 컨트랙트 감사하기 {#vault-audit}

`audit/` 폴더에는 실제 버그가 있는 컨트랙트 초안과 수정된 버전이 들어 있습니다. 대시보드의 [컨트랙트 감사기](/dashboard/contract-auditor)를 사용한 2단계 흐름을 보여 줍니다. 초안을 감사하고, 모든 지적 사항을 테스트와 함께 수정하고, 최종 컨트랙트를 감사한 다음 두 보고서를 모두 보관합니다. 자동 감사는 메인넷 전에 사람이 하는 감사를 대신하지 않습니다. Solidity에서는 양자 준비도 등급이 "Not scored"로 표시되는데, 이는 정상입니다. EVM에서는 포스트 양자 확인을 체인이 precompile을 통해 하기 때문입니다. 폴더의 `audit/README.md`와, precompile 주소와 가스가 나와 있는 [EVM Precompiles](/developer-guide/evm-precompiles) 페이지를 참고하세요.

## 파트 2: 체인이 한도를 강제하는 청구서 결제 에이전트 {#part-2}

코드: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). 봇에게 개인 키를 주면, 지출 한도는 봇 자신의 코드 안에 있게 됩니다. 버그 하나, 프롬프트 인젝션 한 번, 서버 탈취 한 번이면 한도는 사라집니다. QoreChain에서는 한도가 **체인에** 있습니다. 에이전트는 자신의 키를 받아 내 계정에 연결되고, 체인이 모든 결제에서 규칙을 확인합니다.

한 폴더 위로 올라가 에이전트 폴더로 들어갑니다.

```bash
cd ../02-pq-agent
```

### 세 개의 키, 세 가지 역할 {#agent-keys}

| 키 | 누가 가지는가 | 할 수 있는 일 |
| --- | --- | --- |
| **소유자** | 나 | 두 개의 키로 서명하는 내 계정. 돈을 보유하고, 에이전트를 연결하고, 규칙을 작성합니다 |
| **에이전트 키** | 에이전트 | ed25519 키. 규칙 안에서만 소유자 계정에서 지출을 요청할 수 있습니다. 돈은 없습니다 |
| **가스 지갑** | 에이전트 | 에이전트의 요청을 제출하고 수수료를 내는 별도의 작은 계정. 소유자의 돈은 절대 보유하지 않습니다 |

이 예제의 규칙은 다음과 같습니다. 에이전트는 **QOR 송금**만 할 수 있고, **결제당 최대 1 QOR**, **하루 3 QOR**이며, 연결은 **24시간 후에 만료**됩니다. `agent.mjs`를 열어 `pay` 명령을 보세요. 한도 확인이 없습니다. 에이전트는 그냥 결제를 시도합니다. 앞으로 보게 될 모든 한도는 체인에서 나옵니다.

### 단계 1: 설치하고 키 만들기 {#agent-keys-create}

```bash
npm install
```

`package.json`의 패키지를 내려받습니다. QoreChain SDK, CosmJS, 그리고 ed25519 키를 위한 `@noble/curves`입니다.

```bash
node agent.mjs init
```

에이전트의 ed25519 키와 가스 지갑을 만들어 나만 읽을 수 있는 `~/.config/qday/agent.env`에 저장합니다. 가스 지갑의 `qor1...` 주소를 출력합니다.

```bash
node agent.mjs owner-init
```

테스트넷용 일회용 소유자 계정을 만들어 `~/.config/qday/owner.env`에 저장합니다. 이미 가진 계정을 쓰려면 대신 그 파일에 `QORE_MNEMONIC="..."`를 넣으세요. 키는 내 컴퓨터를 떠나지 않고, 출력되지 않으며, 저장소에 넣어서는 안 됩니다.

```bash
node agent.mjs whoami
```

소유자, 에이전트 키, 가스 지갑의 세 주소를 출력합니다.

### 단계 2: 소유자와 가스 지갑에 자금 넣기 {#agent-fund}

각 `qor1...` 주소를 [페이셋](/dashboard/faucet)에 붙여 넣으세요. 소유자에게는 청구서를 낼 몇 QOR가, 가스 지갑에는 수수료로 약 3 QOR가 필요합니다.

```bash
node agent.mjs balance
```

둘 다 QOR가 있는지 확인합니다.

### 단계 3: 포스트 양자 키를 한 번 등록하기 {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

각 계정이 소유 증명과 함께 ML-DSA-87 공개 키를 체인에 올립니다. 이때부터 두 계정 모두 모든 트랜잭션에 두 개의 키로 서명합니다.

### 단계 4: 한도를 정해 에이전트 연결하기 {#agent-link}

```bash
node agent.mjs link 1 3
```

소유자가 두 개의 키로 서명한 트랜잭션 **하나**를 보냅니다. 이 트랜잭션은 에이전트의 ed25519 키를 소유자의 계정에 연결하고(에이전트 키가 동의한다는 증명에 서명하므로 자기 것이 아닌 키는 연결할 수 없습니다), 권한 하나(`send`)를 주고, 지출 규칙(결제당 1 QOR, 하루 3 QOR, `uqor`만)을 작성하고, 24시간 만료를 설정합니다. 세 번째 숫자를 더하면 다른 시간으로 정할 수 있으며 최대 30일입니다. `agent linked`와 `hybrid ML-DSA-87: verified`가 보여야 합니다.

```bash
node agent.mjs rules
```

체인이 강제하는 내용을 체인에서 다시 읽어 옵니다. 규칙, 권한, 만료, 그리고 에이전트가 지금까지 한 결제 수입니다. 연결이 어떻게 동작하는지는 [인증자](/sdk/guides/authenticators)를 참고하세요.

### 단계 5: 에이전트가 청구서를 결제하게 하기 {#agent-run}

```bash
node agent.mjs run bills.json
```

에이전트가 `bills.json`의 청구서 다섯 건, 총 8.2 QOR를 결제하려고 시도합니다. 각 건마다 ed25519 키로 요청에 서명하고 가스 지갑이 제출합니다. 다음과 같이 보여야 합니다.

| 청구서 | 금액 | 결과 | 이유 |
| --- | --- | --- | --- |
| 서버 호스팅 | 0.8 | PAID | |
| 도메인 갱신 | 0.5 | PAID | |
| 모르는 발신자의 청구서 | 5 | REFUSED BY THE CHAIN | 결제당 1 QOR 한도 초과 |
| API 크레딧 | 1 | PAID | |
| 모니터링 | 0.9 | REFUSED BY THE CHAIN | 하루 3 QOR 한도 초과: 2.3 사용, 0.7 남음 |

거부는 에이전트의 코드가 아니라 체인에서 나옵니다. 탐색기에서 볼 수 있는 한 가지 사항이 있습니다. 거부된 결제도 코드 0인 트랜잭션으로 표시됩니다. 트랜잭션 자체는 블록에 받아들여졌지만, 그 안의 결제가 거부된 것입니다. `agent.mjs`는 안에 있는 결제의 결과를 읽으며, 그것이 출력되는 내용입니다.

### 단계 6: 에이전트 해지 {#agent-revoke}

```bash
node agent.mjs revoke
```

소유자의 트랜잭션 하나로 에이전트 키를 끕니다.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

한 번 더 결제를 시도합니다. `REFUSED BY THE CHAIN: linked key is unbound or revoked`가 보여야 합니다. 그러니 에이전트가 침해되더라도 잃을 수 있는 것은 최대 하루 한도이며, 트랜잭션 하나로 멈출 수 있습니다.

데모를 다시 실행하려면 `~/.config/qday/agent.env`를 다른 곳으로 옮기고(가스 지갑의 QOR를 먼저 빼낸 후) `node agent.mjs init`을 다시 실행하세요.

모든 명령: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. 환경 변수로 `QORE_REST`, `QORE_RPC`(내 노드), `QDAY_DIR`(키 파일이 있는 위치)를 바꿀 수 있습니다.

## 파트 3: MCP와 qore-cli로 체인에 묻기 {#part-3}

코드: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP(Model Context Protocol)는 코딩 어시스턴트와 다른 AI 도구가 외부 도구를 사용하는 표준 방식입니다. QoreChain MCP 서버 `@qorechain/mcp`는 이들에게 체인에 대한 **읽기 권한**을 줍니다. 블록, 트랜잭션, 계정, 계정의 포스트 양자 키 상태, 수수료 추정, 시뮬레이션입니다. 도구는 14개입니다. **서명하지 않고, 키를 보관하지 않고, 브로드캐스트하지 않습니다.** 송금을 요청하면 서명되지 않은 문서를 주고, 서명은 내 지갑에서 합니다.

### MCP 클라이언트에 추가하기 {#mcp-config}

어떤 MCP 클라이언트든 사용할 수 있습니다. 대부분 이와 같은 설정을 씁니다.

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y`는 처음에 서버를 내려받아 시작합니다. 그러면 클라이언트가 도구 목록을 보여 줍니다. 예를 들어 `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx`, `prepare_transfer`입니다.

### 터미널에서 같은 질문하기 {#mcp-cli}

`qore-cli`는 AI 클라이언트 없이 같은 답을 줍니다. 만든 것에 대해 세 가지를 물어보세요.

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

에이전트의 결제는 포스트 양자로 서명되었나요? 기대 결과: `tier: pqc`, `verified: true`. 두 개의 키로 서명되고 체인이 확인한 네이티브 트랜잭션입니다.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

그럼 금고 출금은요? 기대 결과: `tier: classical`, `reason: evm_lane`. 정직한 답입니다. 이더리움 방식 트랜잭션에는 포스트 양자 서명이 없습니다. 이 트랜잭션은 EVM 윈도우로, 그리고 여기서는 ML-DSA-87 서명을 직접 확인하는 금고 컨트랙트로 보호됩니다.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

그럼 계정은요? 기대 결과: `registered: true`, `possession_proven: true`, 그리고 EVM 윈도우와 그 남은 양.

### 시각적 클라이언트 (선택) {#mcp-inspector}

AI 어시스턴트 없이 도구를 클릭해 보려면:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

그다음 **Connect**, **Tools**, **List Tools**를 차례로 선택하고, `get_pq_status`를 고르고, `target`에 주소나 해시를 넣은 다음 **Run Tool**을 선택하세요.

## 이제 갖게 된 것 {#done}

포스트 양자 서명이 있을 때만 지급하는 컨트랙트, 체인이 한도를 강제하는 에이전트, 그리고 어떤 트랜잭션이든 어떻게 보호되었는지 확인하는 도구입니다. 이 중 무엇이든 제출물의 바탕으로 쓸 수 있습니다. 레벨과 규칙은 [Build Before Q-Day](/build-before-qday/overview)를 참고하세요.
