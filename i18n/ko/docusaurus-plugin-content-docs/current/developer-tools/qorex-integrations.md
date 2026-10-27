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

## 용도 {#use-cases}

1. **wagmi와 RainbowKit dApp에 QoreX를 추가합니다.** RainbowKit 지갑 목록에 `qorexWallet`을, wagmi 설정에 `QOREX_CHAINS`를 추가합니다. QoreX가 있는 사용자는 연결하고, dApp은 그들의 `0x` 주소와 체인 ID(9801 또는 9800)를 읽습니다. QoreX가 없는 사용자에게는 스토어 링크가 표시됩니다.
2. **Interchain Kit 또는 cosmos-kit 기반 Cosmos dApp에 QoreX를 추가합니다.** `ChainProvider`에 QoreX 지갑을 추가하고 `qorexSignAndBroadcast`로 QoreChain 트랜잭션을 보냅니다. 페이지는 ML-DSA-87 키를 보유할 수 없으므로, QoreX가 트랜잭션을 구성하고 하이브리드 서명을 더해 브로드캐스트합니다.
3. **이미 Keplr를 지원하는 dApp.** `window.qorex.native`는 Keplr 패턴(`enable`, `getKey`, `signDirect`)을 따르므로 통합은 몇 줄이면 됩니다. 저장소 가이드에 모든 차이점이 나열되어 있습니다.
4. **확장 프로그램 없이 하는 지갑 흐름의 CI 테스트.** QA 팀이 `qorexMockFixtures({ profile: "current" })`로 Playwright를 실행하고, Connect를 클릭한 뒤 페이지가 `qorex.addresses.evm`을 표시하는지 검증합니다. `qorex.rejectNext()`로 거부 경로를 테스트합니다.
5. **새로운 QoreX 기능에 앞서 개발하기.** 같은 테스트 모음을 `profile: "planned"`로 실행하면, QoreX가 출시하기 전에 발표된 기능(EVM 서명, 계정 변경 이벤트, 하이브리드 계층을 추가하는 `signDirect`)을 검증할 수 있습니다.
6. **테스트넷에서 실제 브로드캐스트 테스트.** 팀이 자금이 있는 자신의 테스트넷 니모닉으로 모의 지갑이 하이브리드 서명된 트랜잭션을 `qorechain-diana`에 `signAndBroadcast`하게 하고 페이지에서 결과를 확인합니다.
7. **버전 확인 대신 기능 탐지.** `hasCapability(native, "signAndBroadcast")`가 true이면 dApp이 QoreChain에서 Send 버튼을 표시하므로, 새 QoreX 빌드는 dApp 변경 없이 기능을 켭니다.

## 작동 방식 {#how-it-works}

* **EVM 레인.** QoreX는 `window.ethereum`을 절대 덮어쓰지 않습니다. EIP-6963을 통해 역 DNS 이름 `network.qore.qorex`로 EIP-1193 프로바이더를 알리며, `qorexWallet()`과 `discoverQorexEip1193()`은 정확히 그 프로바이더를 선택합니다. 같은 객체가 `window.qorex.evm`에도 있습니다.
* **Native 레인.** `window.qorex.native`는 Keplr 패턴의 프로바이더입니다(`window.keplr`의 별칭이 아닙니다). QoreChain은 Native 레인 트랜잭션에 secp256k1 더하기 ML-DSA-87의 하이브리드 서명을 요구하고 ML-DSA-87 키는 지갑만 보유하므로, dApp은 메시지를 `signAndBroadcast`로 보냅니다. QoreX가 메시지를 보여 주고, 수수료를 설정하고, 두 키로 서명하고, 브로드캐스트한 뒤 `shield`를 보고합니다.
* **Solana.** QoreX는 `solana:mainnet`(Solana 자체)에 Solana Wallet Standard 지갑을 등록합니다. QoreChain 자체의 SVM 레인은 트랜잭션을 받지 않으며 Wallet Standard 체인 ID도 없습니다.
* **버전이 아닌 기능.** 키트는 `hasCapability`를 통해 `window.qorex.native.capabilities`를 읽습니다. QoreX 빌드는 `listAccounts`, `connectProofPicksAccount`, `executeRequest`, `signAndBroadcast`를 선언할 수 있습니다.
* **Amino는 설계상 거부됩니다.** Amino JSON은 하이브리드 ML-DSA-87 서명을 담을 수 없기 때문입니다. 키트는 모든 서명자 요청을 direct 서명자로 처리합니다.
* **`signDirect`와 포스트 퀀텀 계층, 정확히.** 현재 QoreX의 `signDirect`는 SignDoc을 그대로 secp256k1 키로 서명합니다. QoreChain에서는 본문에 서명자의 등록된 키에 대한 유효한 하이브리드 ML-DSA-87 계층이 이미 들어 있어야 하는데, 페이지는 이를 만들 수 없습니다. 그래서 `qorechain-vladi`와 `qorechain-diana`에서는 키트의 오프라인 서명자 `signDirect`가 QoreX에 도달하기 전에 `QOREX_USE_SIGN_AND_BROADCAST`를 던지며, `getAccounts`는 모든 체인에서 작동합니다. 다른 체인 ID에서는 키트가 `signDirect`를 QoreX로 전달하는데, QoreX는 현재 두 QoreChain 체인 ID만 제공합니다. 이후 QoreX 릴리스가 `signDirect`에서 이 계층을 직접 추가하고 `signDirectAddsPqcLayer` 기능을 선언할 예정이지만, 현재 어떤 빌드도 이를 선언하지 않습니다. 키트는 이미 이를 확인하며, 선언되면 오프라인 서명자가 QoreChain SignDoc을 QoreX로 전달합니다. 그러면 QoreX가 가스를 다시 추정해 가스 한도와 수수료를 올릴 수 있으므로, 돌아오는 `signed` 문서를 항상 브로드캐스트하세요.
* **`shield` 상태**는 `signAndBroadcast`가 반환합니다. `shielded`(확정된 트랜잭션이 하이브리드 계층을 담고 있음), `pending`(브로드캐스트 완료, 확인은 미완료), `downgraded`(계층 없이 확정됨, 경보로 취급하세요), `classical`(계층이 적용되지 않는 레인).
* **모의 지갑**은 BIP-39 니모닉(기본값: 공개 테스트 문구)에서 QoreX와 같은 방식으로 계정을 만듭니다. 해당 `qor1` 주소의 표준 ML-DSA-87 키와 함께 `m/44'/118'/0'/0/i`, EVM은 `m/44'/60'/0'/0/i`, Solana는 `m/44'/501'/i'/0'`입니다. 모의 지갑의 `signAndBroadcast`는 REST에서 계정의 ML-DSA-87 키를 읽고, 없으면 `MsgRegisterPQCKeyV2`로 한 번 등록하며, [QoreSign](/qoresign/overview)으로 하이브리드 서명하고, 브로드캐스트하며(네트워크가 요구하면 다른 서명 바이트 버전으로 한 번 재시도), 포함될 때까지 기다린 뒤 `{ txHash, code, height, shield }`를 반환합니다.

### 현재 QoreX가 지원하는 것 {#qorex-today}

| 영역 | 현재 | QoreX 팀의 예정 사항 |
|---|---|---|
| EVM (EIP-6963을 통한 EIP-1193, `network.qore.qorex`) | 연결(`eth_requestAccounts`), `eth_accounts`, `eth_chainId`, QoreX에서 이미 선택된 네트워크로의 `wallet_switchEthereumChain` | `accountsChanged`와 `chainChanged` 이벤트, 모든 거부에 대한 EIP-1193 오류 코드 4200과 4902, `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`, `wallet_addEthereumChain` |
| QoreChain Native 레인 (`window.qorex.native`) | `enable`, `getKey`, `signAndBroadcast`, `listAccounts`, `experimentalSuggestChain`(QoreChain ID), `signDirect`(SignDoc에 하이브리드 계층이 이미 있어야 함) | ML-DSA-87 계층을 직접 추가하는 `signDirect`, 메시지 서명(ADR-36 더하기 ML-DSA-87) |
| Solana (Wallet Standard, `solana:mainnet`) | 연결, `signMessage`, `signTransaction` | `solana:signIn` |

EVM 쪽에서는 서명과 전송이 현재 "QoreX: EVM method ... not yet supported"로 실패합니다. QoreChain에서의 트랜잭션에는 Native 레인을 사용하세요. QoreChain의 EVM 레인에서는 발신자가 등록된 ML-DSA-87 키를 가지고 있고 Native 레인에서 연 EVM 인가 윈도우가 있을 때 트랜잭션이 허용됩니다. 네트워크는 사용자가 QoreX 안에서 바꾸며, dApp은 전환할 수 없습니다.

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

### QoreChain에서 트랜잭션 보내기 {#send-transaction}

같은 호출이 `@qorechain/qorex-interchain-kit`, `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-types`에 있습니다.

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode(msg).finish() }],
  memo: "",
  gasLimit: 200000,
});
```

* `value`는 프로토버프로 인코딩된 메시지입니다. `Uint8Array`, `number[]` 또는 base64.
* 메시지는 1~32개, 메모는 최대 256바이트이며, `gasLimit`은 100,000에서 5,000,000 사이로 제한됩니다(생략하면 400,000). QoreX가 수수료를 설정하고 서명 전에 보여 줍니다.
* `chainId`는 QoreX에서 선택된 네트워크와 일치해야 합니다.
* 계정의 ML-DSA-87 키를 관리하는 메시지는 지갑 쪽 전용이며 `MsgExec` 안에서도 거부됩니다. QoreX가 표시할 수 없는 메시지 유형은 거부됩니다.
* 키트 없이는 `hasCapability(native, "signAndBroadcast")`를 확인한 뒤 `window.qorex.native.signAndBroadcast(request)`를 호출하세요. `getKey`는 `pubKey`와 `address`를 `number[]`로 반환하므로 `Uint8Array.from(key.pubKey)`로 변환하세요(키트가 대신 처리합니다).

### 픽스처 없이 Playwright에서 모의 지갑 사용 {#mock-playwright}

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

const mock = createQorexMock({ profile: "current" });
await page.addInitScript({ content: mock.initScript() });
await page.goto("http://localhost:5173");
await page.evaluate(() => window.__qorexMock!.rejectNext());
```

## 주요 API {#main-api}

| 패키지 | 이름 | 기능 |
|---|---|---|
| types | `discoverQorexEip1193({ timeoutMs })`, `findQorexEip1193()` | QoreX EVM 프로바이더의 비동기 EIP-6963 탐지, 그리고 이를 위한 동기 탐색 |
| types | `getQorexNative()`, `isQorexInstalled()`, `hasCapability(native, capability)` | `window.qorex.native` 읽기, QoreX 존재 확인, 기능 검사 |
| types | `qorexSignAndBroadcast(request, { native? })` | 메시지를 QoreX에 넘깁니다. QoreX가 없으면 `QOREX_NOT_INSTALLED`를, 이를 지원하기 이전의 QoreX에서는 `QOREX_NOT_SUPPORTED_YET`를 던집니다 |
| types | `QorexIntegrationError`, `isQorexIntegrationError(err, code)` | 이 패키지들의 오류와 안정적인 코드 |
| types | `isQorexUnsupportedMethodError`, `isQorexUnrecognizedChainError`, `QOREX_EVM_ERROR_CODES` | QoreX EVM 거부를 분류합니다. `code`(4200, 4902)를 확인한 뒤 현재의 메시지 텍스트로 대체합니다 |
| types | `QorexEip1193Provider`, `QorexNativeProvider`, `QorexSolanaStandardWallet`, `QorexSvmProvider`; `@qorechain/qorex-types/icon` | QoreX가 주입하는 것들의 타입, 데이터 URI 형태의 QoreX 아이콘 |
| rainbowkit | `qorexWallet(options?)`, `createQorexConnector`, `getQorexEip1193Provider` | RainbowKit 지갑(옵션 `pollAccountsOnFocus`), wagmi 커넥터, 그리고 그것이 사용하는 프로바이더 |
| rainbowkit | `qorechain`, `qorechainTestnet`, `QOREX_CHAINS` | viem 체인 9801과 9800 |
| interchain-kit | `qorexWallet`, `createQorexWallet()`, `QorexCosmosWallet` | Interchain Kit 지갑 |
| cosmos-kit | `wallets`, `qorexExtension`, `QorexExtensionWallet`, `QorexClient` | cosmos-kit 지갑 |
| both kits | `qorexSignAndBroadcast`, `QOREX_CAPABILITY_SIGN_DIRECT_ADDS_PQC_LAYER`, 체인 ID 상수, 오류 헬퍼 | `qorex-types`에서 다시 내보냄 |
| wallet-mock | `createQorexMock(options)` | `{ install(window), initScript(), addresses(), ... }`를 반환 |
| wallet-mock | `window.__qorexMock` | `approveNext()`, `rejectNext()`, `pendingApprovals`, `requests`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `addresses()` |
| wallet-mock | `PUBLIC_TEST_MNEMONIC` | 공개 BIP-39 테스트 문구(절대 자금을 넣지 마세요) |
| synpress | `qorexMockFixtures(options)` | 자동 `qorex` 픽스처가 있는 Playwright `test` |
| synpress | `qorex.addresses`, `approveNext()`, `rejectNext()`, `waitForApproval()`, `pendingApprovals()`, `requests()`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `mock` | 픽스처 제어 |
| synpress | `qorexExtensionFixtures({ extensionPath })` | 실제 확장 프로그램을 위해 계획된 인터페이스로, 현재는 `QorexExtensionModeUnavailableError`를 던짐 |

Synpress v4에서는 픽스처를 `testWithSynpress(qorexMockFixtures({ profile: "planned" }))`로 병합하세요. `autoApprove: false`일 때는 `await qorex.waitForApproval()`로 대기 중인 상태를 확인한 다음 `qorex.approveNext()`를 호출하세요. 현재의 QoreX와 다음 릴리스를 모두 다루려면 두 프로필 모두에서 테스트 모음을 실행하세요.

### 키트 서명자 동작 {#kit-signer}

| 호출 | Interchain Kit | cosmos-kit |
|---|---|---|
| `connect` 또는 `enable`, `getAccount`, `getKey` | QoreX `enable`과 `getKey`, 바이트는 `Uint8Array`로 변환 | 동일 |
| `getOfflineSigner(chainId)` | 모든 선호 설정에 대해 direct 서명자 | cosmos-kit의 기본값 `"amino"`를 포함해 모든 선호 설정에 대해 direct 서명자 |
| QoreChain에서의 서명자 `signDirect` | `QOREX_USE_SIGN_AND_BROADCAST`를 던짐(QoreX가 `signDirectAddsPqcLayer`를 선언할 때까지) | 동일 |
| 다른 체인 ID에서의 서명자 `signDirect` | QoreX `signDirect`로 전달 | 동일 |
| `signAmino`, `getOfflineSignerAmino` | `QOREX_AMINO_REFUSED`를 던짐 | 동일 |
| `signArbitrary` (ADR-36) | `QOREX_NOT_SUPPORTED_YET`를 던짐(`verifyArbitrary`도 마찬가지) | `QOREX_NOT_SUPPORTED_YET`를 던짐 |
| `sendTx` | `QOREX_NOT_SUPPORTED_YET`를 던짐. 자신의 RPC 엔드포인트를 통해 브로드캐스트하세요 | 제공되지 않음 |

### 모의 지갑 옵션 {#mock-options}

| 옵션 | 기본값 | 의미 |
|---|---|---|
| `profile` | `"current"` | `"current"`는 현재의 QoreX이고, `"planned"`는 발표된 기능을 추가 |
| `mnemonic` | 공개 BIP-39 테스트 문구 | 자금을 넣는 용도에는 자신의 것을 사용하세요 |
| `accountIndex` | `0` | 모든 레인에서 같은 인덱스 |
| `chainId` | `"qorechain-diana"` | 모의 지갑에서 선택된 네트워크 |
| `rest` | `https://api-testnet.qore.host` | `signAndBroadcast`와 키 조회에 쓰는 REST 엔드포인트 |
| `evmRpc` | `https://evm-testnet.qore.host` | `eth_sendTransaction`에서 사용(planned 프로필) |
| `allowMainnet` | `false` | 없으면 `qorechain-vladi`에 대한 서명이 거부됨 |
| `autoApprove` | `true` | `false`이면 승인이 `approveNext()` 또는 `rejectNext()`를 기다림 |
| `inclusionTimeoutMs`, `pollIntervalMs` | `30000`, `1500` | `signAndBroadcast`가 포함을 기다리는 방식 |

### 오류 코드 {#error-codes}

이 패키지들(`QorexIntegrationError.code`)에서: `QOREX_NOT_INSTALLED`, `QOREX_USE_SIGN_AND_BROADCAST`, `QOREX_AMINO_REFUSED`, `QOREX_NOT_SUPPORTED_YET`. `qorex-synpress`에서: `QOREX_EXTENSION_MODE_UNAVAILABLE`. QoreX 자체의 오류는 메시지가 `QoreX`로 시작하는 일반 `Error` 객체입니다. 예: `QoreX: connection rejected`, `QoreX: signature rejected`, `QoreX: wallet is locked`, `QoreX: unsupported chain <id>`. 현재 숫자 코드를 가진 경우는 알 수 없는 체인(4902)뿐이며, 사용자 거부에는 EIP-1193 4001 코드가 없으므로 메시지로 판별하세요. `QoreX (mock):`로 시작하는 메시지는 모의 지갑에서 나온 것이며 QoreX에서 나온 것이 아닙니다.

## 접근 방법 {#how-to-access}

* **실제 사용을 위한 QoreX 지갑.** 커넥터는 사용자가 설치한 QoreX 브라우저 확장 프로그램이나 앱과 통신합니다. 설치와 스토어 버전은 [QoreX 브라우저 확장 프로그램](/qorex/browser-extension) 페이지를 참고하세요. 테스트 패키지에는 지갑이 필요하지 않습니다.
* **네트워크.** 메인넷 `qorechain-vladi`(EVM 체인 ID 9801)와 테스트넷 `qorechain-diana`(EVM 체인 ID 9800). QoreX는 이 두 QoreChain 체인 ID만 제공하며 그 외에는 "QoreX: unsupported chain"으로 거부합니다. 모의 지갑은 기본적으로 테스트넷을 사용하며, `allowMainnet: true`를 전달하지 않으면 메인넷에 대한 서명을 거부합니다.
* **키와 자금.** 패키지는 키를 보유하지 않습니다. 모의 지갑은 공개 BIP-39 테스트 문구(`abandon`을 11번 반복한 뒤 `about`)를 사용하며, 이는 `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`를 파생합니다. 절대 여기에 자금을 넣지 마세요. 브로드캐스트하는 테스트에는 모의 지갑에 자신의 테스트넷 니모닉을 주세요.
* **그 밖의 계정.** WalletConnect를 사용하는 RainbowKit에는 WalletConnect에서 발급받는 WalletConnect 프로젝트 ID가 필요합니다.
* **사전 요건.** Node.js(모의 지갑의 단일 파일 스크립트에는 20.16 이상 필요), 세 커넥터를 위한 React 앱, 각 퀵스타트에 나열된 피어 패키지. TypeScript 사용자는 `@qorechain/qorex-types`에서 타입을 받습니다.
* **비용.** 패키지는 무료입니다. QoreX를 통해 보내는 트랜잭션은 일반 수수료를 냅니다(하한은 가스당 0.1 uqor이며, QoreX는 자체 트랜잭션에 가스당 0.15 uqor을 책정합니다).

### 네트워크 {#networks}

| | 메인넷 | 테스트넷 |
|---|---|---|
| 네이티브 체인 ID | `qorechain-vladi` | `qorechain-diana` |
| EVM 체인 ID | 9801 (`0x2649`) | 9800 (`0x2648`) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| 탐색기 | `https://explore.qore.network` | 동일, 테스트넷 선택 |

Bech32 접두사 `qor`(검증인은 `qorvaloper`), 코인 타입 118, 디놈 `uqor`(Native 레인에서 소수 자릿수 6, EVM에서는 QOR이 소수 자릿수 18). 실제 사용에는 사용자에게 QoreX 확장 프로그램(0.3.x)이 필요하며, 테스트에는 모의 지갑만 있으면 됩니다. 모의 지갑으로 실제 브로드캐스트를 하려면 계정에 [Faucet](/dashboard/faucet)에서 받은 테스트넷 QOR이 필요합니다(로그인 필요). 공개 테스트 문구가 아닌 자신의 니모닉을 사용하세요.

## 보안 참고 사항 {#security}

* dApp은 ML-DSA-87 키를 절대 보유하지 않습니다. QoreX가 `signAndBroadcast`를 통해 지갑 안에서 QoreChain 트랜잭션에 서명합니다.
* QoreX는 계정의 ML-DSA-87 키를 관리하는 메시지에 대한 페이지 요청을 거부합니다.
* `qorexWallet()`은 `window.ethereum`으로 대체하지 않으므로 다른 주입형 지갑이 QoreX로 오인되지 않습니다. 모의 지갑은 별도의 역 DNS 이름을 사용하므로 테스트 더블이 실제 지갑으로 오인되지 않습니다.
* `connectProof`, `executeTransfer`, `executeRequest` 메서드는 QoreChain 대시보드를 위해 존재하며 다른 모든 출처에서는 거부됩니다.
* `shield` 결과를 확인하세요. `downgraded`는 트랜잭션이 하이브리드 계층 없이 확정되었다는 뜻이므로 경보로 취급하세요.
* 모의 지갑의 기본 니모닉은 공개되어 있으며, 모의 지갑은 `allowMainnet: true`가 아니면 메인넷 서명을 거부합니다. 공개 테스트 문구에는 절대 자금을 넣지 말고, 라이브 테스트에는 별도의 테스트넷 니모닉을 사용하세요.
* 취약점은 security@qore.network로 비공개로 신고하세요.

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 링크 |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

소스: https://github.com/qorechain/qorex-integrations (공개, 릴리스 `v0.1.0`을 2026년 10월 27일에 게시, 폴더는 `packages/` 아래). 이 저장소에는 가이드(MetaMask, Keplr, Phantom 옆에 QoreX 추가, 엔드 투 엔드 테스트, 오류와 체인 ID), 테스트넷에서 모든 QoreX 영역을 시험하는 데모 dApp, 예제(`examples/wagmi-rainbowkit`, `examples/playwright-e2e`), 체인 레지스트리 항목 파일도 들어 있습니다. 라이선스 Apache-2.0, 관리자는 QoreChain Association입니다. 버전은 2026년 10월 27일에 npm 레지스트리에서 읽었습니다. 이 패키지들은 npm에서 더 이상 권장되지 않는(deprecated) `@qorechain/connect`를 대체합니다. QoreX 탐지에는 `qorex-types`를, EVM dApp에는 `qorex-rainbowkit`을, Cosmos dApp에는 `qorex-interchain-kit`(또는 `qorex-cosmos-kit`)을, 자체 지갑이나 백엔드의 하이브리드 서명에는 [QoreSign](/qoresign/overview)을 사용하세요.

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

## 관련 페이지 {#related}

* [QoreX 지갑](/qorex/overview)과 [QoreX 브라우저 확장 프로그램](/qorex/browser-extension): 이 패키지들이 통신하는 지갑.
* [QoreSign](/qoresign/overview): 모의 지갑이 사용하는 하이브리드 서명기.
* [QoreChain SDK](/sdk/overview): `signAndBroadcast`용 `MsgSend` 같은 메시지 인코딩.
* [EVM 개발](/developer-guide/evm-development#evm-window): ML-DSA-87 키 등록과 EVM 인가 윈도우.
* [Faucet](/dashboard/faucet): 테스트넷 QOR.
* [QoreChain MCP 서버](/developer-tools/mcp): `get_pq_status`로 브로드캐스트 결과 읽기.
* [개발자 패키지 개요](/developer-tools/overview).
