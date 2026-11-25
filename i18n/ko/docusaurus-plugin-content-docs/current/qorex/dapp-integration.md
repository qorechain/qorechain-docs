---
slug: /qorex/dapp-integration
title: QoreX와 dApp 연동하기
sidebar_label: dApp 연동
sidebar_position: 8
---

# QoreX와 dApp 연동하기

웹 앱을 QoreX 지갑과 함께 작동시키려는 개발자를 위한 완전한 가이드입니다: 지갑 감지, 연결, QoreChain 트랜잭션 보내기, 메시지 서명, EVM과 Solana 사용, 거부 처리, QoreX를 여는 링크 생성. QoreX 브라우저 확장 프로그램과 QoreX 앱의 앱 내 dApp 브라우저를 다루며, 둘이 다른 부분을 알려 줍니다. 코드 예제는 지갑 자체의 코드와 대조해 확인했습니다.

## 혁신 요소 {#innovations}

- **페이지는 양자 내성 키를 절대 갖지 않습니다.** `signAndBroadcast`는 메시지를 받습니다. QoreX는 디코딩한 내용을 보여 주고, 지갑만 만들 수 있는 ML-DSA-87 계층을 추가한 뒤 브로드캐스트합니다. cosmjs, cosmos-kit, Interchain Kit은 `getOfflineSigner`를 통해 변경 없이 작동하며, 트랜잭션에 계층이 없으면 QoreX가 같은 계층을 추가합니다.
- **버전이 아니라 기능으로 감지합니다.** `window.qorex.native.capabilities`가 빌드가 하는 일을 나열하므로, 하나의 코드 경로가 모든 릴리스에서 작동합니다.
- **아무것도 가로채지 않습니다.** QoreX는 EIP-6963과 Solana Wallet Standard로 자신을 알리고, `window.keplr`를 설정하지 않으며, 다른 지갑의 `window.ethereum`을 덮어쓰지 않습니다.
- **양자 내성 절반이 있는 메시지 서명.** `signArbitrary`는 계정의 고전 키(ADR-36)와 ML-DSA-87로 서명합니다. 서버는 `@qorechain/qoresign`으로 둘 다 온체인에 등록된 키에 대해 검증합니다.
- **사용자에게 설명되는 QoreChain의 EVM.** `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`은 기기에서 디코딩되고, 노드가 허용하면 시뮬레이션되며, 승인 화면이 QoreChain의 EVM 레인에 필요한 트랜잭션별 인가 창을 엽니다.
- **블라인드 서명 없음, 그리고 사이트가 절대 요청할 수 없는 짧은 목록.** QoreX가 표시할 수 없는 메시지는 거부되며, 지갑 전용 메시지(키 관리, 지출 규칙, 창, 권한 부여)는 모든 사이트에서 거부됩니다.
- **서비스가 생성할 수 있는 링크.** 앱에서 페이지를 열고, 받는 사람의 자체 키로 서명한 결제를 요청하거나, 에이전트 제안을 전달합니다.

## QoreX가 주입하는 것 {#injected}

모든 페이지에 QoreX는 세 개의 프로바이더가 있는 객체 `window.qorex` 하나를 추가합니다.

| 프로바이더 | 설명 |
|---|---|
| `window.qorex.native` | QoreChain(Cosmos) 레인. Keplr 방식: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*`, 그리고 `capabilities` 목록. Keplr의 완전한 대체물은 아닙니다. |
| `window.qorex.evm` | QoreChain EVM 레인(확장 프로그램에서는 Ethereum도)의 EIP-1193 프로바이더. EIP-6963을 통해서도 알립니다. |
| `window.qorex.svm` | Solana 프로바이더. 확장 프로그램에서 Solana dApp은 보통 Wallet Standard를 통해 QoreX를 찾습니다. |

QoreX가 하지 않는 것:

- `window.keplr`를 절대 설정하지 않습니다. Keplr를 찾는 코드는 QoreX를 찾지 못하므로 `window.qorex`를 감지하세요.
- `window.ethereum`을 절대 덮어쓰지 않습니다. 확장 프로그램은 아예 설정하지 않습니다. 앱의 앱 내 브라우저는 다른 지갑이 설정하지 않은 경우에만 `window.ethereum`을 설정합니다. `window.ethereum`이 아니라 EIP-6963 이름으로 QoreX를 선택하세요.
- `signAmino`와 `sendTx`는 존재하지 않습니다([cosmjs](#cosmjs) 참고).

## QoreX 감지 {#detection}

**EVM.** EIP-6963 알림을 수신하고 `rdns`가 `network.qore.qorex`인 것을 선택합니다.

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**QoreChain 네이티브 레인.** `window.qorex?.native`를 확인하고 capabilities를 읽습니다. 버전 번호가 아니라 이것을 확인하세요.

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| 기능 | 확장 프로그램 | 앱 |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (메서드는 1.2.0부터 존재) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (동작은 1.2.0부터) |
| `signArbitrary` | 0.4.0 | 1.2.1 (메서드는 1.2.0부터 존재) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | 앱에는 없음 |

앱 1.2.0에는 메서드가 있지만 capabilities를 선언하지 않습니다. 이를 지원하려면 `typeof window.qorex?.native?.signArbitrary === "function"`으로 대체 확인하세요. `executeRequest`는 `dashboard.qorechain.io`에서만 작동하는 Dashboard 브리지이며([Dashboard 브리지](/qorex/browser-extension#dashboard-bridge) 참고), 다른 사이트에는 필요하지 않습니다. 빌드 1.2.5와 0.4.4는 이전과 같은 capabilities를 선언합니다.

**확장 프로그램인가 앱인가.** 페이지는 어느 쪽과 통신하는지 물을 수 없고, 그럴 필요도 없어야 합니다. 중요한 차이는 아래 표에 있습니다.

| | 확장 프로그램(데스크톱) | 앱(앱 내 dApp 브라우저) |
|---|---|---|
| QoreChain 네이티브 레인 | 예 | 예 |
| QoreChain의 EVM 서명 | 예 | 예 |
| Ethereum의 EVM(`wallet_switchEthereumChain`을 `0x1`로, 사이트별) | 예 | 아니요, QoreChain의 활성 네트워크만 |
| EVM 이벤트(`connect`, `accountsChanged`, `chainChanged`) | 세 가지 모두 | `connect`만: 계정이나 네트워크를 전환하려면 브라우저를 닫아야 함 |
| Solana(Wallet Standard) | 예 | 아니요, 앱 내 브라우저는 Solana 트랜잭션에 서명하지 않음 |
| Dashboard 브리지(`connectProof`, `executeRequest`) | 예, `dashboard.qorechain.io`만 | 아니요 |
| 링크로 페이지 열기 | 해당 없음 | `browse` 링크([링크](#links) 참고) |

각각의 사용자 측 설명은 [브라우저 확장 프로그램](/qorex/browser-extension)과 [dApp 브라우저](/qorex/dapp-browser)를 참고하세요.

## 연결 {#connect}

연결에는 사이트당 한 번의 승인이 필요하며, 공개 주소만 공개됩니다.

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts`는 사용자가 사이트를 승인할 때까지 빈 목록을 반환하며 스스로 창을 열지 않습니다. `enable`과 `eth_requestAccounts`는 지갑이 잠겨 있으면 지갑을 엽니다([잠긴 지갑](#locked) 참고).

확장 프로그램은 계정, 지갑 또는 네트워크가 바뀌면 창 이벤트 `qorex_keystorechange`를 발생시킵니다. 승인은 지갑별로 유지되며 사용자는 **연결된 사이트**에서 언제든 사이트를 취소할 수 있습니다.

## QoreChain 트랜잭션 보내기: `signAndBroadcast` {#sign-and-broadcast}

양자 내성 키가 등록된 계정의 모든 QoreChain 트랜잭션에는 하이브리드 서명, 즉 secp256k1 **과** ML-DSA-87이 있어야 합니다. ML-DSA 키는 지갑만 보유하므로 페이지는 이 서명을 직접 만들 수 없습니다. 메시지를 보내면 나머지는 QoreX가 처리합니다.

1. 디코딩된 메시지와 수수료를 사용자에게 보여 주고,
2. 사용자가 선택한 계정에 대해 트랜잭션을 구성하며,
3. 하이브리드 서명을 추가하고(계정의 첫 트랜잭션이면 먼저 계정의 양자 내성 키를 등록),
4. 브로드캐스트한 뒤 결과와 함께 완료합니다.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield`는 커밋된 트랜잭션에 하이브리드 계층이 있는지 알려 줍니다: 있으면 `shielded`, 계층 없이 커밋되었으면 `downgraded`(이 경우는 보고하세요), 그 밖에는 `pending` 또는 `classical`입니다.

**규칙**

- `chainId`는 지갑의 활성 네트워크와 같아야 합니다: `qorechain-vladi`(메인넷), 또는 사용자가 테스트넷으로 전환한 경우 `qorechain-diana`. 불일치하면 두 네트워크 이름을 명시한 메시지와 함께 거부됩니다. **dApp은 네트워크를 전환할 수 없습니다**([테스트넷](#testnet) 참고).
- 호출당 메시지는 1개에서 32개입니다. 메시지 바이트는 보낸 그대로 서명되며 지갑이 다시 인코딩하지 않습니다.
- 최대 256바이트의 메모는 승인 시트에 표시되며, 메모의 줄 바꿈과 제어 문자는 해당 코드로 표시됩니다.
- 지갑 전용 메시지는 거부됩니다([사이트가 절대 요청할 수 없는 메시지](#wallet-only) 참고).
- QoreX는 표시할 수 없는 메시지에 서명하지 않습니다. 이런 요청은 `MsgExec` 안에 있는 것을 포함해 `QoreX cannot show what <type> does, so it will not sign it`로 거부됩니다. QoreX가 디코딩할 수 있는 메시지 유형을 사용하세요.

**가스와 수수료**

- 수수료는 `gasLimit`에 네트워크 가스 가격(QoreX는 네트워크의 실시간 최솟값을 따릅니다)을 곱한 값이며, 사용자가 승인하기 전에 표시됩니다.
- `gasLimit`는 100,000에서 5,000,000 범위로 제한됩니다. 값이 없으면 400,000입니다.
- CosmWasm이나 크로스 VM 코드를 실행하는 트랜잭션은 승인 전에 먼저 시뮬레이션됩니다. QoreX는 시뮬레이션한 가스의 최소 1.3배(최대 20,000,000)를 요청하며, 페이지가 지정한 더 큰 값은 유지합니다. 컨트랙트가 거부할 호출은 체인의 사유와 함께 승인 전에 거부됩니다. 호출에 20,000,000보다 많이 필요하면 QoreX가 이를 알리고 거부합니다.
- 트랜잭션은 네트워크 자체의 트랜잭션당 가스 한도를 넘을 수 없습니다. QoreX는 이를 넘는 트랜잭션을 아무것도 서명하기 전에 거부합니다.

사용자가 거부하면 코드 `4001`의 `QoreX: signature rejected`가 발생합니다.

## cosmjs, cosmos-kit, Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)`, `getOfflineSignerAuto(chainId)`는 cosmjs `OfflineDirectSigner`를 반환하므로 `SigningStargateClient`가 변경 없이 작동합니다.

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**지갑이 추가하는 양자 내성 계층.** 트랜잭션에 ML-DSA 계층(페이지는 만들 수 없음)이 없으면 QoreX가 추가합니다. 계층의 비용을 시뮬레이션하고, 트랜잭션의 가스와 수수료를 올리고, 본문과 올린 수수료 정보에 ML-DSA-87로 서명한 다음, 사용자가 승인하기 전에 최종 수수료를 보여 줍니다. 따라서 `"auto"` 수수료는 계층 비용(수만 가스)만큼 높게 돌아옵니다. 보낸 문서가 아니라 돌아오는 `signed` 문서를 항상 브로드캐스트하세요. 이 동작에 의존하기 전에 `capabilities.includes("signDirectAddsPqcLayer")`를 확인하세요.

- 계정에는 양자 내성 키가 이미 등록되어 있어야 합니다. 키는 QoreX에서의 첫 트랜잭션과 함께 등록됩니다. 그렇지 않으면 호출은 코드 `4100`, 사유 `pqc-key-missing`으로 실패합니다. 먼저 사용자가 QoreX에서 트랜잭션을 하나 보내게 하거나, 키를 직접 등록하는 `signAndBroadcast`를 사용하세요.
- **Amino는 거부됩니다.** `signAmino`와 `getOfflineSignerOnlyAmino().signAmino`는 Amino JSON이 하이브리드 서명을 담을 수 없으므로 코드 `4200`, 사유 `amino-unsupported`로 거부됩니다. 라이브러리를 direct 서명으로 설정하세요.
- MetaMask에서 가져온 계정(coin 60)은 `signAndBroadcast`로 서명합니다. 확장 프로그램은 이 계정에 대해 `signDirect`를, 따라서 cosmjs 서명자도 거부합니다.
- `getKey`와 `getAccounts`는 활성 계정을 반환합니다.

웹 앱에서는 [지갑 어댑터](/developer-tools/wallet-adapter)와 [QoreX 연동](/developer-tools/qorex-integrations) 패키지(RainbowKit, Interchain Kit, cosmos-kit)가 이 감지와 호출을 대신 처리해 줍니다.

## `signDirect` {#sign-direct}

`signDirect`는 페이지가 구성한 `SignDoc`에 서명합니다. 본문에 이미 ML-DSA 계층이 있으면 QoreX는 어떤 창도 열기 전에 체인처럼 계정의 등록된 키에 대해 검증합니다. 없으면 위에서 설명한 대로 추가합니다. 등록된 키와 일치하지 않는 계층, 지갑 전용 메시지, QoreX가 표시할 수 없는 메시지, 1,000개를 넘는 메시지는 어떤 승인 화면도 열기 전에 거부됩니다. 새 코드에는 `signAndBroadcast`가 더 간단합니다.

## 메시지 서명: `signArbitrary`와 `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

서명은 [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1)을 따릅니다: 계정의 고전 키(secp256k1, coin-60 계정은 eth_secp256k1)를 사용하는 ADR-36과, `"qorechain-msg-v1|" + chainId + "|" + data`에 대한 ML-DSA-87. Keplr의 `pub_key`와 `signature` 필드도 담으므로 Keplr용으로 작성한 코드가 읽을 수 있습니다. 사용자는 전체 메시지를 봅니다. 메시지는 1에서 4096바이트여야 하며 다른 QoreChain 서명 도메인으로 시작해서는 안 됩니다.

**검증은 페이지가 아니라 서버에서 하세요.** ML-DSA 절반은 클라이언트가 보낸 키가 아니라 해당 주소에 대해 온체인에 등록된 키와 대조해 확인해야 합니다. [`@qorechain/qoresign`](/qoresign/overview)을 사용하세요.

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain`은 서명자의 등록된 ML-DSA-87 키를 가져오며, 무엇이든 검증에 실패하면 `QoreSignError`를 던집니다. 해당 네트워크에서 트랜잭션을 보낸 적이 없는 계정은 아직 등록된 키가 없어 `KEY_NOT_REGISTERED`로 실패합니다. 먼저 사용자에게 QoreX에서 트랜잭션을 하나 보내 달라고 하세요. 메시지에 일회용 nonce와 도메인을 넣고 서버에서 둘 다 확인해, 서명이 다른 사이트에서 재사용되지 않게 하세요. QoreSign 가이드는 로그인 메시지를 더 자세히 다룹니다.

## EVM dApp {#evm}

QoreX는 EIP-6963에 응답하며, EIP-1193 프로바이더를 통해 QoreChain의 EVM 레인(체인 ID **9801**, 테스트넷 **9800**)에서 `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`에 서명합니다. 확장 프로그램에서는 사이트가 `wallet_switchEthereumChain`을 `0x1`로 호출한 후 Ethereum에서도 서명합니다(사이트별). 읽기 전용 메서드(`eth_call`, `eth_getBalance`, `eth_getLogs` 및 기타 표준 읽기)는 선택된 네트워크의 노드로 전달됩니다. 그 밖의 메서드는 `4200`으로 응답하며, QoreX가 서명하는 체인이 아닌 것에 대한 `wallet_switchEthereumChain`이나 `wallet_addEthereumChain`은 `4902`로 응답합니다. 사이트는 다른 QoreChain 네트워크로 전환할 수 없으며, 이 경우 `switch the network in QoreX itself`와 함께 `4100`으로 응답합니다.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**승인 화면이 디코딩하는 것.** 모든 창은 무엇을 허가하는지 기기에서 디코딩해 알려 줍니다: 전송, 토큰 허용량(무제한이면 UNLIMITED라고 표시), `setApprovalForAll`, Permit 및 Permit2 서명, Safe 트랜잭션(DELEGATECALL은 고위험으로 표시). QoreX가 디코딩할 수 없는 호출은 알 수 없음 및 고위험으로 표시되며 두 번째 탭이 필요합니다. EIP-7702 위임은 거부됩니다.

**시뮬레이션.** 서명 전에 창은 트랜잭션이 사용자의 잔액에서 무엇을 바꾸는지 보여 줍니다.

- 노드에 `eth_simulateV1`(전송 추적)이 있으면 QOR과 토큰의 변화를 보여 줍니다.
- `eth_simulateV1`이 없는 노드(현재 QoreChain의 EVM 노드가 해당)에서는 `eth_call`만 사용할 수 있으며, 이는 호출이 revert될지만 알려 줍니다. 이때 데이터가 있는 호출은 "what it does to your tokens was not checked"를 표시하며, 승인하려면 사용자의 두 번째 탭이 필요합니다.
- 실패할 트랜잭션이나 노드가 시뮬레이션할 수 없는 트랜잭션도 두 번째 탭이 필요합니다.
- 시뮬레이션은 트랜잭션을 받게 될 바로 그 노드로 전송되며, 다른 곳으로는 아무것도 보내지 않습니다.

이 두 번째 탭이 뜻밖이 되지 않도록 페이지를 설계하세요. 호출이 무엇을 하는지 자체 인터페이스에서도 설명하세요.

**트랜잭션별 EVM 인가 창.** QoreChain에서 EVM 트랜잭션은 네이티브 레인에서 계정의 하이브리드 ML-DSA-87 서명으로 연 인가 창 안에서만 허용됩니다. 트랜잭션을 포함하는 창이 없으면, 같은 승인이 정확히 그 트랜잭션을 위한 창을 엽니다.

- 한도는 금액에 최대 수수료를 더한 값,
- 약 10분,
- 네트워크가 지원하면 트랜잭션이 호출하는 컨트랙트로 한정.

승인 화면은 창이 허용할 모든 컨트랙트의 이름(같은 사이트에서 최근 서명을 검증한 컨트랙트 포함)을 표시하고, 사용자가 열어 둔 창을 대체한다고 알려 줍니다. 네트워크가 창을 컨트랙트로 한정할 수 없으면, QoreX는 제한 없는 창을 열기 전에 컨트랙트 이름을 밝히고 창이 모든 컨트랙트를 허용하게 된다고 알리며 한 번 더 묻습니다. "아니요"라고 하면 아무것도 전송되지 않습니다. QOR 한도는 최대 수수료를 포함해 계정에서 나가는 모든 QOR에 적용되며, 창이 호출을 허용하는 컨트랙트는 여전히 계정을 대신해 행동할 수 있습니다(보유 중이거나 승인받은 토큰, 또는 다른 컨트랙트가 보유한 QOR). [EVM 접근 창](/qorex/security-and-recovery#evm-window)을 참고하세요.

**사용자가 직접 연 창.** 사용자가 창 화면에서 여는 창은 기본적으로 **QOR 전송만**이며, 모든 컨트랙트 허용은 경고가 있는 별도의 선택입니다. 따라서 사용자가 이전에 연 창은 토큰이나 컨트랙트 호출을 포함하지 않습니다. 창이 있기를 기대하는 dApp은 QoreX가 트랜잭션별 창을 열게 하거나(가장 간단하고 가장 좁은 방법), 사용자가 직접 창을 열 경우 **모든 컨트랙트**를 선택하도록 안내해야 합니다.

**이 레인의 기타 규칙**

- MetaMask에서 가져온 계정(coin type 60)만 QoreChain의 EVM 레인에서 보낼 수 있습니다. 다른 계정은 `4100`으로 응답하며 메시지가 사용자에게 다음 단계를 알려 줍니다.
- 스테이킹, 분배, 거버넌스, 베스팅, bank, IBC 프리컴파일은 거부됩니다(`4200`). QoreChain에서 이런 작업은 네이티브 레인을 거칩니다.
- EVM 레인의 서명은 고전 방식(secp256k1)입니다. QoreX는 그 이상을 주장하지 않습니다.
- 선택한 체인이 아닌 다른 체인의 타입 데이터는 `-32602`로 거부됩니다.

## Solana dApp(확장 프로그램) {#solana}

확장 프로그램은 Solana 메인넷(`solana:mainnet`)에서 Solana Wallet Standard에 등록하므로 Solana dApp은 별도 코드 없이 이를 찾습니다. 기능: 레거시 및 v0 트랜잭션에 대한 connect, disconnect, 이벤트, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`. `connect({ silent: true })`를 지원합니다.

승인 화면은 System 전송, SPL Token 및 Token-2022의 전송, 승인, 권한 변경, 계정 닫기를 디코딩하고 메모의 텍스트를 보여 줍니다. QoreX가 디코딩할 수 없는 명령은 시트에 읽을 수 없음으로 표시되며 승인에 두 번째 탭이 필요합니다. 지갑을 서명자로 나열하지 않는 트랜잭션은 거부되며, `signMessage`는 실제로는 트랜잭션인 바이트에 서명하지 않습니다. 서명은 고전 방식이며 그렇게 표시됩니다.

앱의 앱 내 브라우저는 Solana 트랜잭션에 서명하지 않습니다. QoreChain 자체의 Solana는 지갑 안의 별도 테스트넷 전용 기능입니다. [테스트넷 전용 기능](/qorex/testnet-features)을 참고하세요.

## 지갑이 잠겨 있을 때 {#locked}

확장 프로그램 0.4.4와 Safari 1.8.2부터는 QoreX가 잠긴 상태에서의 서명 요청(네이티브, EVM 또는 Solana)이 사이트 이름을 표시하며 비밀번호 화면으로 지갑을 엽니다. 사용자가 잠금을 해제하면 창이 닫히고 요청의 승인 화면이 나타납니다. 대신 사용자가 창을 닫으면 요청은 코드 `4001`로 거부됩니다. 이전에는 이런 요청이 "wallet is locked"로 즉시 실패했습니다.

- `enable`, `getKey`, `eth_requestAccounts`와 서명 메서드는 이 방식으로 지갑을 깨웁니다.
- 페이지가 로드할 때 하는 읽기(`eth_accounts`, `eth_chainId`, 체인 읽기)는 창을 열지 않습니다. `eth_accounts`는 빈 목록을 반환할 뿐입니다.
- 비밀번호 없이는 아무것도 서명되지 않으며, 사용자가 지갑을 전환하거나 다시 잠그면 대기 중인 요청에는 "아니요"로 응답합니다.

`4001`은 오류가 아니라 정상적인 결과로 처리하세요.

## 사이트가 절대 요청할 수 없는 메시지 {#wallet-only}

다음은 계정에 대한 상시 권한을 넘겨주기 때문에, QoreX는 모든 경로(`signAndBroadcast`, `signDirect`, 에이전트 제안)에서 어떤 사이트의 요청도 거부합니다. 사용자는 QoreX 자체 화면에서 이를 수행합니다.

- 양자 내성 키 관리: 키 등록, 마이그레이션, 교체, 암호화 키, PQC 멀티시그 등록.
- authenticator와 지출 규칙: 서명 키 등록 또는 취소, 지출 규칙, abstract account 생성.
- EVM 창 열기, 닫기, 지우기(및 위임 동의).
- QoreChain의 Solana 창 열기와 닫기, 그리고 Solana 중계 메시지.
- `MsgGrant` 또는 `MsgExec`에 대한 authz 권한 부여(`MsgGrant`). 이런 권한 부여는 받는 쪽이 계정으로서 행동할 수 있게 합니다.

거부는 직접 요청, 어떤 깊이의 `MsgExec` 안, 그리고 이 메시지 중 하나에 대한 범용 권한 부여에 모두 적용됩니다. 오류는 `QoreX: <type> is managed by the wallet itself, not by a website`입니다.

## 오류와 이벤트 {#errors}

오류에는 EIP-1193 `code`가 있습니다.

| 코드 | 의미 |
|---|---|
| `4001` | 사용자가 거부했거나 창(잠금 해제 창 포함)을 닫음. |
| `4100` | 권한 없음: 알 수 없는 계정, 등록된 양자 내성 키 없음(`reason: pqc-key-missing`), coin-118 계정의 EVM 레인 시도, 또는 네트워크 전환 요청. |
| `4200` | 지원하지 않음: Amino(`reason: amino-unsupported`), QoreX가 서명하지 않는 EVM 메서드, EIP-7702 위임, 네이티브 전용 프리컴파일. |
| `4901` | 잘못된 Solana 체인. |
| `4902` | 알 수 없는 체인. |
| `-32602` | 잘못된 매개변수(예: 다른 체인의 타입 데이터). |

이벤트:

- EVM 프로바이더: 확장 프로그램에서는 `connect`, `accountsChanged`, `chainChanged`, 앱에서는 `connect`만.
- 네이티브 레인(확장 프로그램): 계정, 지갑 또는 네트워크가 바뀌면 창 이벤트 `qorex_keystorechange`. cosmos-kit이 이를 수신합니다.
- Solana Wallet Standard: `change`.

## 서비스가 생성할 수 있는 링크 {#links}

다른 페이지나 앱에서 QoreX를 여는 링크는 세 가지입니다.

### 앱에서 페이지 열기: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

휴대폰에서 이 링크는 일반적인 생체 인증 확인 후 QoreX의 dApp 브라우저에서 페이지를 엽니다. 페이지는 도메인 이름의 `https://`여야 합니다. 페이지에 다음이 있으면 QoreX는 링크를 거부합니다.

- 포트,
- 사용자 이름이나 비밀번호,
- IP 주소,
- `localhost`,
- 백슬래시나 공백,
- 2048자를 넘는 길이.

링크는 페이지에 아무것도 주지 않습니다. 페이지는 여전히 연결을 요청해야 하고, 모든 서명은 여전히 승인 시트를 거칩니다. 휴대폰에 지갑이 없으면 앱은 온보딩에 머뭅니다. QoreX가 설치되어 있지 않으면 https 형식은 설치 링크가 있는 페이지를 보여 줍니다. 확장 프로그램에는 `browse` 링크가 없습니다.

### 결제 요청: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

결제 요청 링크는 받는 사람, 기본 단위 금액, 단위(denomination), 요청 ID와 메모 태그, 선택적 메모와 @handle, 네트워크, 그리고 이 모두에 대한 받는 사람의 자체 계정 키 서명을 담습니다. 결제하는 사람의 QoreX는 서명, 서명 키가 받는 주소를 소유하는지, 정확한 네트워크, 모든 @handle을 확인한 다음, 보내기 전에 일반 검토를 보여 줍니다. 금액이나 받는 사람이 바뀌면 감지되며, 요청은 체인을 읽어 결제 완료로 표시합니다.

직접 만들지 말고 **QoreX 자체 요청 화면에서 생성하세요**(앱, **결제 요청**, **새 요청**). 서명은 페이지가 절대 갖지 않는 계정 키로 만듭니다. 직접 만들거나 수정한 링크는 지원되지 않는 것으로 간주하세요. 링크의 웹 형식은 아직 제공되지 않습니다.

### 에이전트 제안 전달: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

앱 전용입니다. 링크는 AI 에이전트가 제안하는 트랜잭션을 담습니다. QoreX는 이를 검증하고 시뮬레이션한 뒤 일반 승인 창에 보여 줍니다. 제안이 그대로 서명되는 일은 없으며, 링크는 최대 64 KB를 담을 수 있습니다. 아래의 [AI 에이전트 모델](#agents)을 참고하세요.

## AI 에이전트 {#agents}

지갑과 함께 작동하는 AI 에이전트를 만든다면, 모델은 에이전트가 사용자가 허용한 것을 읽고 트랜잭션을 **제안**할 수 있으며 절대 서명하지 않는다는 것입니다. QoreX는 모든 제안을 확인하고 시뮬레이션하며, 사용자는 dApp 요청과 같은 승인 창에서 승인하거나 거부합니다. 지갑 전용 메시지에 대한 제안은 어떤 창도 열기 전에 거부됩니다. 확장 프로그램에서 에이전트는 아직 공개되지 않은, 사용자 컴퓨터의 보조 프로그램을 통해 QoreX에 접근합니다. 앱에서는 제안을 붙여넣거나 `qorex://propose` 링크로 도착합니다. 사용자가 이 기능을 켜는 방법과 보게 되는 내용은 [개발자 모드: AI 에이전트](/qorex/developer-mode#ai-agents)를 읽어 보세요.

## 테스트넷 {#testnet}

**dApp은 네트워크를 전환할 수 없습니다.** 요청의 `chainId`는 지갑이 있는 네트워크와 일치해야 하며, 불일치는 거부됩니다. 이는 자금이 똑같아 보이지만 실제로는 그렇지 않은 네트워크로 사용자를 옮기려는 페이지로부터 사용자를 보호합니다.

테스트넷(`qorechain-diana`, EVM 체인 ID 9800)을 사용하려면 사용자가 QoreX에서 전환합니다.

- **앱:** 설정에서 **테스트넷 사용(개발자)**.
- **확장 프로그램:** 개발자 모드를 켜고(팝업 하단의 버전 번호를 일곱 번 탭) **테스트넷(diana)으로 전환**. **메인넷으로 돌아가기**로 기본값으로 돌아갑니다.

그러면 모든 화면에 TESTNET 배너가 표시되고, 테스트넷 잔액에는 USD 가치가 표시되지 않으며, 재시작 없이 네트워크가 다시 연결됩니다. 테스트넷 페이지를 열기 전에 전환하도록 사용자에게 알려 주세요. 테스트넷 전용 지갑 기능(IBC, QoreChain Bridge 화면, QoreChain의 Solana)은 [테스트넷 전용 기능](/qorex/testnet-features)에 설명되어 있습니다.

## 문제 해결 {#troubleshooting}

| 보이는 현상 | 이유와 해결 방법 |
|---|---|
| `window.keplr`가 undefined | 의도된 동작입니다. `window.qorex.native` 또는 QoreX 커넥터가 있는 라이브러리를 사용하세요. |
| `window.ethereum`이 QoreX가 아님 | 의도된 동작입니다. EIP-6963(`rdns` `network.qore.qorex`)으로 지갑을 선택하세요. |
| `QoreX: chain X does not match the active network Y` | 사용자가 다른 네트워크에 있습니다. QoreX에서 전환하도록 요청하세요. 여러분은 전환할 수 없습니다. |
| `4100`, `pqc-key-missing` | 계정에 아직 네트워크의 양자 내성 키가 없습니다. 사용자에게 QoreX에서 트랜잭션을 하나 보내 달라고 하거나 `signAndBroadcast`를 사용하세요. |
| `4200`, `amino-unsupported` | 라이브러리가 Amino를 요청합니다. direct 서명으로 설정하세요. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | 지갑 전용 메시지입니다. 제거하세요. 사용자가 QoreX에서 수행합니다. |
| `QoreX cannot show what <type> does, so it will not sign it` | QoreX가 디코딩할 수 없는 메시지입니다. 표시할 수 있는 유형을 사용하세요. |
| `QoreX: send between 1 and 32 messages` | 요청을 나누세요. |
| `QoreX: the memo may be at most 256 bytes` | 메모를 줄이세요. |
| `QoreX: a message must be 1 to 4096 bytes` | 서명을 요청하는 메시지를 줄이세요. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | 컨트랙트 호출이 트랜잭션 하나에 비해 너무 무겁습니다. 나누세요. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX는 `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`에만 서명합니다. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | MetaMask에서 가져온 계정(coin 60)만 EVM 레인에서 보낼 수 있습니다. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | 이런 작업은 네이티브 레인을 호출하세요. EVM 프리컴파일은 거부됩니다. |
| EVM 호출이 계속 두 번째 탭을 요구함 | 노드가 호출이 토큰에 미치는 영향을 확인할 수 없거나 호출을 디코딩할 수 없습니다. 페이지에서 설명하세요. |
| 사용자가 창을 열었는데도 토큰 호출이 실패함 | 사용자가 직접 연 창은 기본적으로 QOR 전송만 포함합니다. QoreX가 트랜잭션별 창을 열게 하거나, 사용자에게 모든 컨트랙트를 선택하라고 안내하세요. |
| 페이지가 서명을 요청한 직후 `4001` | 사용자가 거부했거나 잠긴 지갑의 잠금 해제 창을 닫았습니다. 다시 시도하도록 제안하세요. |
| `eth_accounts`가 `[]`를 반환 | 사이트가 아직 연결되지 않았습니다. `eth_requestAccounts`를 호출하세요. |
| `browse` 링크가 아무 동작도 하지 않음 | 페이지 주소가 규칙을 어겼거나(포트, IP, `localhost`, https 아님, 2048자 초과) 휴대폰에 아직 지갑이 없습니다. |
| 서버에서 `KEY_NOT_REGISTERED` | 서명자가 해당 네트워크에서 트랜잭션을 보낸 적이 없습니다. 먼저 하나 보내 달라고 하세요. |

문제가 남으면 사용자가 [개발자 모드](/qorex/developer-mode)에서 민감 정보를 가린 요청 기록을 보낼 수 있으며, 테스트넷에서 재현할 수 있습니다.

## 게시 위치 {#where-published}

| 항목 | 위치 |
|---|---|
| QoreX 브라우저 확장 프로그램 | Chrome Web Store, Firefox Add-ons, Mac App Store(Safari). [브라우저 확장 프로그램](/qorex/browser-extension#install)을 참고하세요. |
| QoreX 앱과 dApp 브라우저 | App Store와 Google Play. [QoreX Wallet](/qorex/overview#how-to-access)을 참고하세요. |
| 메시지 및 트랜잭션 검증 | `@qorechain/qoresign`(TypeScript 및 기타 언어). [QoreSign](/qoresign/overview)을 참고하세요. |
| 웹 앱용 지갑 감지 | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| RainbowKit, Interchain Kit, cosmos-kit 커넥터, 타입, 테스트 지갑 | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| 트랜잭션을 구성하고 보내는 Core SDK | [개발자 도구](/developer-tools/overview) |

QoreX 소스 코드는 공개되어 있지 않습니다. 각 스토어의 현재 버전은 [개요](/qorex/overview#versions) 페이지에 있습니다.
