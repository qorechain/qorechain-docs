---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter는 가장 작지만 쓸모 있는 QoreChain EVM 프로젝트입니다. 숫자 하나를 저장하는 Solidity 컨트랙트, 이를 테스트넷 `qorechain-diana`에 배포하는 Hardhat 프로젝트, 그리고 값을 읽고 증가시키는 짧은 스크립트로 구성됩니다. `create-qorechain-dapp`의 `hardhat` 템플릿에 작은 `interact` 스크립트를 추가한 것입니다.

## 보여 주는 것 {#shows}

- **하이브리드 서명이 배포 경로의 일부입니다.** 컨트랙트 배포를 포함한 모든 EVM 트랜잭션 전에, 계정에는 등록된 ML-DSA-87 키와 유효한 EVM 승인 윈도우가 필요합니다. 윈도우는 secp256k1과 ML-DSA-87 둘 다로 서명한(하이브리드) 네이티브 레인 메시지 하나로 열리며, 체인이 두 서명을 모두 검증합니다.
- **온체인에서 검증되는 하이브리드 서명 트랜잭션 하나.** `pnpm window open` 단계가 그 트랜잭션을 보냅니다. 익스플로러에서 조회해 체인의 판정을 직접 볼 수 있습니다.
- **익숙한 EVM 도구가 그대로 동작합니다.** Hardhat, Ignition, viem은 평범한 이더리움 트랜잭션을 보냅니다. 양자 내성 보호는 윈도우에 있으므로, secp256k1 키만 도난당해도 계정에서 자금을 꺼낼 수 없습니다.

secp256k1을 깰 수 있을 만큼 큰 양자 컴퓨터가 등장하면 공격자가 기존 방식의 서명을 위조할 수 있게 됩니다. QoreChain은 계정에 두 번째 양자 내성 서명(ML-DSA-87, FIPS 204)을 요구합니다. Counter는 이 규칙이 켜진 상태에서 개발자가 거치는 전체 과정, 즉 키 등록, 윈도우 열기, 배포, 호출, 읽기를 보여 줍니다.

## 시작하기 전에 {#prerequisites}

macOS, Linux 또는 WSL이나 Git Bash가 있는 Windows의 터미널과 다음 도구가 필요합니다.

| 도구 | 필요한 버전 | 확인 명령 |
| --- | --- | --- |
| Git | 최근 버전 아무거나 | `git --version` |
| Node.js | 20.12 이상(22 LTS 권장) | `node --version` |
| pnpm | 9 이상 | `pnpm --version` |

Node.js는 https://nodejs.org 에서 설치하세요. `pnpm --version`이 실패하면 `npm install -g pnpm`(또는 `corepack enable`)으로 pnpm을 설치한 뒤 다시 확인하세요.

포셋을 쓰려면 [QoreChain 대시보드](https://dashboard.qorechain.io)의 무료 계정도 필요합니다. 이 가이드에서는 실제 지갑을 쓰지 않습니다. 아래의 모든 작업은 일회용 테스트넷 계정을 사용하며, 테스트넷 QOR에는 가치가 없습니다.

## 단계별 안내 {#steps}

### 1. 코드 받기 {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. 의존성 설치 {#step-install}

```sh
pnpm install
```

### 3. 테스트와 빌드 실행 {#step-test}

테스트는 로컬 시뮬레이션 체인에서 실행됩니다. 키도 네트워크 계정도 필요하지 않습니다.

```sh
pnpm test
pnpm build
```

`Counter` 테스트 결과로 `2 passing`이 보여야 합니다.

### 4. 테스트넷 키 파일 만들기 {#step-account}

템플릿에서 설정 파일을 만듭니다.

```sh
cp .env.example .env
```

`.env` 파일에는 일회용 키가 들어가므로 절대 커밋하지 마시고, 이 키를 실제 용도로 재사용하지 마세요. 아무 편집기에서나 `.env`를 엽니다. 값 두 개를 채우게 됩니다.

**a. 일회용 개인 키.** 무작위 32바이트 키를 생성합니다.

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

출력된 `0x...` 값을 `.env`에 `PRIVATE_KEY=0x...`로 복사해, 0으로만 채워진 자리표시자를 바꿉니다.

**b. 양자 내성 복구 코드.** 계정의 ML-DSA-87 키는 별도의 복구 코드에서 파생됩니다. 하나 만드세요.

```sh
pnpm window recovery-code
```

출력된 `QRC1-...` 줄을 `.env`에 `QORE_PQC_RECOVERY_CODE=QRC1-...`로 복사합니다. 이 코드는 개인 키와 함께 보관하고 항상 같은 것을 다시 사용하세요. 새 코드를 쓰면 계정의 ML-DSA-87 키가 달라집니다.

`QORE_MNEMONIC`은 비워 두고 `QORE_NETWORK=testnet`은 그대로 둡니다. 이제 `.env`는 다음과 같은 모양이 됩니다(자리표시자로 표시).

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. 계정 주소 확인 {#step-address}

```sh
pnpm window status
```

첫 줄에 계정이 `0x...`와 `qor1...` 형식으로 출력됩니다. 이 시점에는 키가 등록되지 않았고 윈도우도 없다는 내용도 함께 나옵니다. `qor1...` 주소를 복사하세요.

### 6. 포셋에서 테스트넷 QOR 받기 {#step-faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 QOR를 요청합니다(24시간에 한 번 100 QOR).
3. 몇 초 기다린 뒤 `pnpm window status`를 다시 실행합니다. 이제 계정이 체인에 존재합니다.

### 7. 키 등록과 윈도우 열기 {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

등록은 체인이 기존 방식 서명으로 받아 주는 유일한 메시지입니다. 아직 체인에 대조할 키가 없기 때문입니다. 윈도우 열기는 하이브리드로 서명합니다. `window open`이 출력하는 트랜잭션 해시를 보관하세요. 마지막 단계에서 조회합니다.

### 8. 컨트랙트 배포 {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

이 명령은 배포된 `Counter` 주소(`0x...`)를 출력합니다.

### 9. 읽기와 증가 {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. 익스플로러에서 조회 {#step-explorer}

1. https://explore.qore.network 를 열고 네트워크 선택기를 **Testnet**으로 전환합니다.
2. `pnpm window open`이 출력한 해시를 검색합니다. 트랜잭션에 체인이 검증한 양자 내성 서명이 표시됩니다.
3. `pnpm interact`가 출력한 `increment` 트랜잭션 해시 또는 8단계의 `Counter` 주소를 검색하면 컨트랙트 호출을 볼 수 있습니다.

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector)는 같은 종류의 증거를 바이트 단위로 보여 줍니다.

## 확인할 결과 {#result}

- `pnpm test`가 `2 passing`을 출력합니다.
- `pnpm window status`가 계정(`0x...`와 `qor1...` 형식), `PQC key: registered`, 그리고 남은 블록, 트랜잭션, 값과 함께 `window: live`를 출력합니다.
- `pnpm deploy:testnet`이 배포된 `Counter` 주소(`0x...`)를 출력합니다.
- `pnpm interact`가 Counter 주소, `count`, `increment` 트랜잭션 해시, 블록 번호가 포함된 `status: success`, 새 `count`, 익스플로러의 트랜잭션 링크를 출력합니다.
- 익스플로러(Testnet)에서 `window open` 트랜잭션이 두 서명 모두 검증된 것으로 표시됩니다.

단계가 실패하면 먼저 `pnpm window status`를 실행하세요. 키와 윈도우 중 무엇이 없는지 알려 줍니다. 윈도우를 다 쓴 뒤 트랜잭션이 거부되면 `pnpm window open`으로 새 윈도우를 여세요.

## 코드 {#code}

컨트랙트(`contracts/Counter.sol`)입니다.

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

`scripts/window.ts`에서 하이브리드 서명을 담당하는 부분(윈도우 메시지와 서명자)입니다.

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

`acc`는 키 자료에서 파생된 통합 계정이고, `net`은 `QORE_NETWORK`(기본값 `testnet`, 체인 ID `qorechain-diana`)에 해당하는 네트워크 레코드입니다. 스크립트가 사용하는 수수료는 100000 `uqor`이고 가스 한도는 800000입니다. 하이브리드 트랜잭션은 크기가 크기 때문입니다. 윈도우 크기는 `.env`에서 `QORE_WINDOW_BLOCKS`(기본값 600), `QORE_WINDOW_TXS`(기본값 5), `QORE_WINDOW_MAX_UQOR`로 바꿀 수 있습니다.

## 사용한 패키지 {#packages}

| 패키지 | 버전 | 용도 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | 하이브리드 서명, PQC 키 등록, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM 윈도우 헬퍼(`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | 네이티브 레인 트랜잭션 브로드캐스트 |
| `hardhat` | ^3.21.1 | 컴파일, 테스트, Ignition 배포 |
| `viem` | ^2.47.6 | 컨트랙트 읽기와 쓰기 |
| `tsx` | ^4.19.0 | TypeScript 스크립트 실행 |
| `typescript` | ^5.6.3 | 타입 검사 |

같은 프로젝트를 `npx create-qorechain-dapp my-app -t hardhat --network testnet`으로 직접 스캐폴딩할 수도 있습니다. [스캐폴더와 CLI](/developer-tools/scaffolders-and-cli)와 [SDK 설치](/sdk/install)를 참고하세요.

## 네트워크 정보 {#networks}

| 항목 | 값 |
| --- | --- |
| 네트워크 | 테스트넷 `qorechain-diana` |
| EVM 체인 ID | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

소스: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
