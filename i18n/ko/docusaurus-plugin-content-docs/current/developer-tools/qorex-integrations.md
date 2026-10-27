---
slug: /developer-tools/qorex-integrations
title: QoreX 통합
sidebar_label: QoreX 통합
sidebar_position: 22
---

# QoreX 통합 (`@qorechain/qorex-*`)

QoreX 통합은 [QoreX 지갑](/qorex/overview)이 EVM, Cosmos, Solana 프런트엔드에서 작동하기를 바라는 dApp 개발자와, 그러한 프런트엔드를 테스트하는 팀을 위한 여섯 개의 작은 npm 패키지입니다. 세 개는 인기 있는 라이브러리(RainbowKit, Interchain Kit, cosmos-kit)용 지갑 커넥터이고, 하나는 공용 타입과 탐지 헬퍼를 담고 있으며, 두 개는 테스트 도구(모의 지갑과 Playwright 픽스처)입니다. 여섯 개 모두 버전 **0.1.0**이며 2026년 10월 27일에 게시되었고 Apache-2.0입니다.

이 패키지들이 하지 않는 일: 키를 보관하지 않으며, QoreX를 현재의 모습 이상으로 만들어 주지도 않습니다. 이를 기반으로 구축하기 전에 [한계와 알려진 문제](#limits)를 읽어 보세요. 현재 라이브 상태인 QoreX 스토어 빌드는 이 패키지들이 연결될 수 있는 기능의 일부만 지원하며, 그 한계는 그곳에 명시되어 있습니다.

## 혁신 {#innovations}

* **잘못된 지갑을 고를 수 없는 탐지.** QoreX는 EIP-6963을 통해 역 DNS 이름 `network.qore.qorex`로 자신을 알리며 `window.ethereum`을 절대 덮어쓰지 않습니다. `@qorechain/qorex-types`는 오직 그 이름으로만 프로바이더를 선택하고, RainbowKit 지갑은 커넥터를 알려진 프로바이더에 고정하며 `window.ethereum`으로 대체하지 않습니다.
* **하이브리드 서명은 지갑이 만들며, 페이지는 포스트 퀀텀 키를 절대 보유하지 않습니다.** QoreChain의 Native 레인에는 secp256k1 서명과 ML-DSA-87 서명(FIPS 204)이 필요합니다. 네이티브 프로바이더(`window.qorex.native`)에서 `signAndBroadcast` 호출은 메시지를 QoreX에 넘기고, QoreX가 트랜잭션을 구성해 두 키로 서명하고 브로드캐스트합니다. 결과는 `txHash`, `code`, `height`, `shield`이며, `shield`는 확정된 트랜잭션이 하이브리드 계층을 담고 있으면 `shielded`입니다.
* **버전 확인 대신 기능 확인.** 패키지는 지갑의 `capabilities` 목록을 읽으므로(`hasCapability`), `signAndBroadcast` 같은 기능은 버전 번호로 추측하지 않고 탐지됩니다.
* **거부는 명시적이며, 코드는 안정적입니다.** Amino JSON은 하이브리드 서명을 담을 수 없으므로 Amino 서명은 설계상 거부됩니다. 커넥터는 `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST`, `QOREX_NOT_SUPPORTED_YET` 같은 코드로 `QorexIntegrationError`를 던지며, `isQorexIntegrationError(err, code)`로 이를 검사합니다.
* **실제로 서명하는 테스트 더블.** `@qorechain/qorex-wallet-mock`은 QoreX가 주입하는 것과 같은 객체(`window.qorex = { evm, native, svm }`)를 주입하고, Solana 지갑을 등록하며, 실제 알고리즘(Native 레인에서는 QoreSign을 통한 하이브리드 ML-DSA-87, EVM에서는 secp256k1, Solana에서는 ed25519)으로 서명합니다. 기본값은 테스트넷의 공개 테스트 니모닉입니다. `network.qore.qorex.mock`으로 자신을 알리므로, QoreX를 엄격히 선택하는 코드가 이를 실제 지갑으로 착각할 수 없습니다.
* **두 가지 동작 프로필.** 모의 지갑의 `current` 프로필은 현재 라이브인 QoreX처럼 동작하고, `planned`는 QoreX 팀이 발표한 내용을 추가하므로, 모의 지갑이 지갑이 아직 하지 않는 일을 한다고 주장하지 않으면서 앞서서 개발할 수 있습니다.
* **Synpress v4 스타일의 Playwright 픽스처**(`qorexMockFixtures`)는 탐색 전에 모의 지갑을 주입하므로, 엔드 투 엔드 테스트에 브라우저 확장 프로그램이 필요하지 않습니다.
* **이벤트 없이 지갑이 주도하는 계정.** QoreX는 아직 `accountsChanged`나 `chainChanged`를 내보내지 않으므로, RainbowKit 지갑에는 페이지가 포커스를 되찾을 때 `eth_accounts`와 `eth_chainId`를 다시 읽는 선택적 `pollAccountsOnFocus`가 있습니다.

## 사용 방법 {#how-to-use}

아래 코드 블록은 개발자 허브의 퀵스타트입니다. 각각 공개 npm 레지스트리에서 설치한 뒤 `tsc`로 타입 검사를 하고 2026년 10월 27일에 실행했으며(Node 26. 브라우저 코드에는 jsdom 30과 `react-dom/client`, 픽스처에는 Chromium과 함께 Playwright 1.64), 모두 통과했습니다. 어느 것도 트랜잭션을 보내거나 자금이 있는 키를 필요로 하지 않습니다. 관찰된 결과는 각 항목에 함께 표시했습니다. 지갑 쪽 동작(실제 브라우저의 실제 QoreX)은 이 페이지를 위해 테스트하지 않았습니다.

### `@qorechain/qorex-types`: QoreX 탐지 {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

모의 지갑에서 관찰된 결과: `QoreX EVM provider not announced`, 그다음 `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. 첫 줄은 모의 지갑에서는 예상된 결과입니다. [EIP-6963 주의 사항](#limits)을 참고하세요. 이 패키지에는 런타임 의존성이 없으며 `@qorechain/qorex-types/icon`에서 QoreX 아이콘을 데이터 URI로도 내보냅니다. 그 밖의 내보내기: 프로바이더 타입, `isQorexInstalled`, `qorexSignAndBroadcast`, 그리고 QoreX EVM 거부를 분류하는 헬퍼.

### `@qorechain/qorex-rainbowkit`: RainbowKit과 wagmi에서의 QoreX {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

관찰된 결과: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS`는 EVM 레인용 viem 체인 정의를 담고 있습니다(RPC `https://evm.qore.host` 및 `https://evm-testnet.qore.host`, 네이티브 통화 QOR은 18 소수 자릿수, 탐색기 `https://explore.qore.network`). `projectId`는 WalletConnect에서 직접 만드는 WalletConnect 프로젝트 ID입니다. 피어 의존성: `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. 지갑에서 이루어진 계정 및 네트워크 변경을 반영하려면 `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`를 사용하세요.

### `@qorechain/qorex-interchain-kit`: Cosmos dApp (신규 작업에 권장) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

관찰된 결과: 컴포넌트가 QoreChain 테스트넷 체인 레지스트리 항목과 함께 jsdom에 마운트되었습니다(`@interchain-kit/react` 0.11.1). 피어 의존성: `@interchain-kit/core` ^0.11. `qorexSignAndBroadcast`로 QoreChain 트랜잭션을 보냅니다.

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

이 호출은 1~32개의 메시지와 최대 256바이트의 메모를 받으며, QoreX가 사용자에게 승인을 요청합니다. 이 스니펫은 패키지 README에서 가져온 것이며 이 페이지를 위해 실행하지는 않았습니다.

### `@qorechain/qorex-cosmos-kit`: cosmos-kit 기반 Cosmos dApp {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

관찰된 결과: QoreChain 테스트넷 항목과 함께 jsdom에 마운트되었습니다(`@cosmos-kit/react` 2.24.1). **코드가 타입 검사를 통과하려면 `throwErrors={false}`가 필요합니다.** `@cosmos-kit/react` 2.24는 `throwErrors`를 필수 속성으로 타이핑하는데, 패키지 README의 예제에는 이것이 빠져 있습니다. 피어 의존성: `@cosmos-kit/core` ^2.18.1. 패키지 README는 새 dApp에는 Interchain Kit를 권장합니다. 이 패키지도 `qorexSignAndBroadcast`를 내보냅니다.

### `@qorechain/qorex-wallet-mock`: QoreX용 테스트 더블 {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

관찰된 결과: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. 계정은 QoreX가 파생하는 방식 그대로 파생됩니다(해당 `qor1` 주소의 표준 ML-DSA-87 키와 함께 `m/44'/118'/0'/0/i`, EVM은 `m/44'/60'/0'/0/i`, Solana는 `m/44'/501'/i'/0'`). 옵션에는 `profile`, `mnemonic`, `accountIndex`, `chainId`(기본값 `qorechain-diana`), `autoApprove`, `allowMainnet`이 있으며, 페이지에는 `approveNext()`, `rejectNext()`, `requests`, `switchAccount(i)`를 가진 `window.__qorexMock`도 생깁니다. Playwright에서는 `page.addInitScript`로 `mock.initScript()`를 주입하세요(Node 20.16 이상).

### `@qorechain/qorex-synpress`: Playwright 픽스처 {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

관찰된 결과: `1 passed`. Connect 버튼이 `eth_requestAccounts`를 호출하는 로컬 페이지를 대상으로 했습니다(Playwright 1.64, Chromium). 픽스처를 Synpress와 함께 쓰려면 `@synthetixio/synpress@4.1.2`를 설치하고 `testWithSynpress`로 감싸세요. `qorex` 픽스처는 `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)`, `disconnect()`를 제공합니다. 피어 의존성: `@playwright/test` 1.48 이상. 상태는 페이지 안에 있으므로, 탐색할 때마다 새로운 모의 지갑으로 시작합니다.

## 접근 방법 {#how-to-access}

* **실제 사용을 위한 QoreX 지갑.** 커넥터는 사용자가 설치한 QoreX 브라우저 확장 프로그램이나 앱과 통신합니다. 설치와 스토어 버전은 [QoreX 브라우저 확장 프로그램](/qorex/browser-extension) 페이지를 참고하세요. 테스트 패키지에는 지갑이 필요하지 않습니다.
* **네트워크.** 메인넷 `qorechain-vladi`(EVM 체인 ID 9801)와 테스트넷 `qorechain-diana`(EVM 체인 ID 9800). QoreX는 이 두 QoreChain 체인 ID만 제공하며 그 외에는 "QoreX: unsupported chain"으로 거부합니다. 모의 지갑은 기본적으로 테스트넷을 사용하며, `allowMainnet: true`를 전달하지 않으면 메인넷에 대한 서명을 거부합니다.
* **키와 자금.** 패키지는 키를 보유하지 않습니다. 모의 지갑은 공개 BIP-39 테스트 문구(`abandon`을 11번 반복한 뒤 `about`)를 사용하며, 이는 `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`를 파생합니다. 절대 여기에 자금을 넣지 마세요. 브로드캐스트하는 테스트에는 모의 지갑에 자신의 테스트넷 니모닉을 주세요.
* **그 밖의 계정.** WalletConnect를 사용하는 RainbowKit에는 WalletConnect에서 발급받는 WalletConnect 프로젝트 ID가 필요합니다.
* **사전 요건.** Node.js(모의 지갑의 단일 파일 스크립트에는 20.16 이상 필요), 세 커넥터를 위한 React 앱, 각 퀵스타트에 나열된 피어 패키지. TypeScript 사용자는 `@qorechain/qorex-types`에서 타입을 받습니다.
* **비용.** 패키지는 무료입니다. QoreX를 통해 보내는 트랜잭션은 일반 수수료를 냅니다(하한은 가스당 0.1 uqor).

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 링크 |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

소스: https://github.com/qorechain/qorex-integrations (태그 `v0.1.0`, `packages/` 아래의 폴더. 데모 dApp, 예제, 체인 레지스트리 항목 파일도 포함). 버전은 2026년 10월 27일에 npm 레지스트리에서 읽었습니다. 이 패키지들은 npm에서 더 이상 권장되지 않는(deprecated) `@qorechain/connect`를 대체합니다. QoreX 탐지에는 `qorex-types`를, EVM dApp에는 `qorex-rainbowkit`을, Cosmos dApp에는 `qorex-interchain-kit`(또는 `qorex-cosmos-kit`)을, 자체 지갑이나 백엔드의 하이브리드 서명에는 [QoreSign](/qoresign/overview)을 사용하세요.

## 한계와 알려진 문제 {#limits}

**현재 QoreX 빌드가 지원하는 것.** 현재 라이브인 스토어 빌드(QoreX 모바일 앱 1.1.8, 브라우저 확장 프로그램 0.3.8이며 Firefox는 0.3.9)는 지갑이 ML-DSA 계층을 추가하는 `getOfflineSigner`를 아직 지원하지 않고, `signArbitrary`도 지원하지 않습니다. cosmos-kit과 Interchain Kit를 통한 `getOfflineSigner` 서명은 페이지 자체가 포스트 퀀텀 계층을 붙이는 경우에만 작동하는데, 페이지는 키를 보유하지 않으므로 보통 불가능합니다. 현재 Native 레인 트랜잭션을 보내는 지원되는 방법은 `window.qorex.native.signAndBroadcast`이며, `qorexSignAndBroadcast`가 이를 감쌉니다. 각 패키지 README에 명시된 범위를 넘어서, 커넥터를 현재 스토어 빌드에서의 완전한 cosmos-kit 또는 Interchain Kit 지갑으로 간주하지 마세요. 커넥터는 이후 QoreX 릴리스가 `signDirect`에 이 계층을 추가할 수 있도록(`signDirectAddsPqcLayer` 기능으로 선언) 작성되어 있어서, 여러분의 코드를 바꾸지 않아도 됩니다.

**현재 QoreX가 응답하는 것**(패키지 README 기준):

* **EVM:** QoreX에서 선택된 네트워크에 대한 `eth_chainId`, `eth_accounts`, `eth_requestAccounts`, `wallet_switchEthereumChain`(알 수 없는 체인은 코드 4902로 거부). 서명 메서드(`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`)와 `wallet_addEthereumChain`은 아직 지원되지 않으며 "QoreX: EVM method ... not yet supported"로 거부됩니다. `accountsChanged`나 `chainChanged` 이벤트도 아직 없습니다. QoreX 팀이 예정으로 밝힌 것이지 라이브가 아닌 항목: 이벤트, 모든 거부에 대한 오류 코드, 그다음 서명 및 트랜잭션 메서드.
* **EVM 트랜잭션 일반.** QoreChain에서 EVM 트랜잭션은 등록된 ML-DSA-87 키가 있고 열린 EVM 인가 윈도우가 있는 계정에서만 허용되며, 둘 다 Native 레인에서 설정합니다([EVM 개발](/developer-guide/evm-development#evm-window) 참고). 모의 지갑의 예정된 `eth_sendTransaction`은 그 윈도우를 열지 않습니다.
* **Native:** `qorechain-vladi`와 `qorechain-diana`에 한정된 `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts`, `experimentalSuggestChain`. QoreChain에서 `signDirect`는 하이브리드 계층이 이미 존재해야 하는데 페이지는 이를 만들 수 없으므로, `signAndBroadcast`를 사용하세요. `signArbitrary`, Amino 서명, `sendTx`는 사용할 수 없습니다. 커넥터에서 `signArbitrary`는 `QOREX_NOT_SUPPORTED_YET`을, Amino는 `QOREX_AMINO_REFUSED`를 던집니다.
* **Solana:** `solana:mainnet`의 Wallet Standard로, connect, disconnect, 이벤트, `signAndSendTransaction`, `signTransaction`, `signMessage`를 지원하며 `solana:signIn`은 없습니다. 체인의 SVM 레인은 아직 트랜잭션을 받지 않으므로, 여기서 Solana 지원은 지갑 쪽에 한정됩니다.

**퀵스타트를 테스트하면서 발견한 주의 사항:**

* **cosmos-kit에는 `throwErrors`가 필요합니다.** README 예제에는 `@cosmos-kit/react` 2.24가 타입에서 요구하는 `throwErrors`가 빠져 있어서 그대로는 타입 검사를 통과하지 못합니다. `throwErrors={false}`(또는 원하는 값)를 전달하세요.
* **엄격한 TypeScript와 모의 지갑.** `window.qorex.evm.request(...)`는 `unknown`을 반환하므로, 그 결과를 구조 분해하는 README의 줄은 엄격한 TypeScript에서 실패합니다. 결과를 캐스팅하세요. 예를 들어 `eth_requestAccounts`에는 `as string[]`.
* **모의 지갑은 자체 EIP-6963 ID를 가집니다.** `network.qore.qorex`가 아니라 `network.qore.qorex.mock`을 알립니다. 따라서 QoreX를 `network.qore.qorex`로만 엄격히 선택하는 탐지 코드(`qorex-types`의 `discoverQorexEip1193` 포함)는 모의 지갑에서 의도한 대로 EVM 프로바이더를 찾지 못하지만, `window.qorex.evm`과 네이티브 프로바이더는 존재합니다. 코드가 탐지를 통해 프로바이더를 선택한다면, 테스트에서는 모의 지갑의 rdns(`QOREX_MOCK_RDNS`로 내보냄)를 허용하도록 만드세요.
* **RainbowKit이 Node를 계속 실행 상태로 유지합니다.** Node에서 RainbowKit 설정을 만들면 WalletConnect 타이머가 시작되어, 이후 프로세스가 스스로 종료되지 않습니다. 페이지에서는 예상되는 동작입니다. 스크립트나 테스트에서는 필요한 것을 읽은 뒤 명시적으로 종료하세요(예: `process.exit(0)`).
* **Synpress 확장 프로그램 모드는 아직 작동하지 않습니다.** `qorexExtensionFixtures`는 실제 확장 프로그램을 구동하기 위해 계획된 방식이지만, 아직 출시되지 않은 QoreX 승인 창의 안정적인 테스트 셀렉터가 필요하기 때문에 현재는 `QorexExtensionModeUnavailableError`를 던집니다. 모의 모드를 사용하세요.

**모의 지갑과 실제 지갑의 차이:** 잠금 화면이나 승인 창이 없음(승인은 `approveNext`, `rejectNext`, `autoApprove`로 처리). `signDirect`는 일반 secp256k1 키 유형을 보고함. Solana `signAndSendTransaction`은 거부됨. "QoreX (mock):"로 시작하는 메시지는 모의 지갑 자체의 메시지입니다. 모의 지갑의 테스트 결과는 기술된 인터페이스에 대해 여러분의 페이지가 어떻게 동작하는지를 보여 줄 뿐, 실제 QoreX 빌드가 똑같이 동작한다는 것을 보여 주지는 않습니다.

**그 밖에:** 여섯 개 패키지 모두 초기 릴리스(0.1.0)이므로 QoreX가 발전함에 따라 인터페이스도 확장될 것으로 예상하세요. 라이브 네트워크나 실제 지갑을 대상으로 `qorexSignAndBroadcast`를 다룬 테스트된 퀵스타트는 없습니다.
