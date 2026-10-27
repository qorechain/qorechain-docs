---
slug: /developer-tools/wallet-adapter
title: 지갑 어댑터
sidebar_label: 지갑 어댑터
sidebar_position: 2
---

# 지갑 어댑터 (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter`는 `signDirect`를 제공하는 Cosmos 지갑(Keplr, Leap, Cosmostation)에 QoreChain을 추가하고, 체인이 요구하는 트랜잭션을 구성합니다. 네이티브 레인 트랜잭션은 계정의 기존 secp256k1 서명과 함께 ML-DSA-87(FIPS 204) 서명을 담아야 하는데, 일반 지갑은 ML-DSA-87 서명을 만들 수 없습니다. 어댑터가 이 서명을 만들어 트랜잭션 본문에 넣은 다음, 수정되지 않은 지갑에 일반 서명을 요청합니다. dApp 및 지갑 개발자, 그리고 JavaScript에서 통합 QoreChain 지갑, EVM 인가 윈도우 메시지, 연결된 키(authenticator) 메시지가 필요한 도구 제작자를 위한 패키지입니다. 현재 버전은 0.4.0입니다.

dApp에서 사용자의 QoreX 지갑으로 트랜잭션을 보내기만 하면 된다면, 가장 빠른 방법은 이 패키지의 [`qorexSignAndBroadcast`](#qorex)나 [개발자 패키지](/developer-tools/overview#group-qorex) 색인에 나열된 QoreX 패키지입니다. 지갑을 직접 만들면서 다섯 개 언어의 전체 서명 라이브러리가 필요하다면 먼저 [QoreSign](/qoresign/overview)을 읽으세요.

## 혁신 {#innovations}

- **지갑은 일반 본문에 서명합니다.** 어댑터는 확장 없이 본문을 만들고, 서명 바이트에 대한 ML-DSA-87 계층에 서명한 뒤, 이를 `/qorechain.pqc.v1.PQCHybridSignature` 확장 옵션(알고리즘 id 1)으로 본문에 넣고, 완성된 `SignDoc`에 대해서만 `wallet.signDirect`를 호출합니다. 지갑은 표준 `SIGN_MODE_DIRECT` 서명을 만들며 QoreChain 전용 코드가 필요 없습니다. 결과는 일반적인 `TxRaw` 바이트입니다.
- **네트워크별 서명 바이트 선택기.** ML-DSA-87 키는 두 가지 바이트 형식 중 하나에 서명하며, 네트워크는 어느 높이에서든 정확히 하나만 검증합니다. `signBytesVersion: "auto"`(기본값)에서 서명기는 노드에 `GET /cosmos/upgrade/v1beta1/applied_plan/{name}`을 `v3.2.0`, 이어서 `v3.1.98`에 대해 요청하고, 둘 중 하나의 높이가 0보다 크면 v2 형식(도메인 태그 `qorechain-pqc-hybrid-v2`와 체인 ID)으로 서명하며, 답을 REST URL과 체인 ID별로 60초 동안 캐시하고, 물어볼 수 없을 때는 추측하지 않고 오류를 발생시킵니다. 2026년 10월 27일에 실제 노드로 확인한 결과 메인넷과 테스트넷 모두 `v2`로 해석되며, `rest` 없이 `qorechain-vladi`를 호출하면 오류가 발생합니다. `refreshSignBytesVersion()`은 캐시를 우회하고 `isHybridSignBytesRejection()`은 `pqc` 코드 21 거부를 인식하므로, 지갑이 열려 있는 동안 네트워크가 업그레이드되면 호출자가 다시 확인하고 한 번 재시도할 수 있습니다.
- **니모닉 하나당 ML-DSA-87 키 하나, 도구 간 공유.** `walletFromMnemonic`은 `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`을 ML-DSA-87 키 생성에 입력해 키를 파생합니다. 이 키는 계정 주소에 바인딩되며, SDK, `@qorechain/chain-bridge`, QoreX, `qorechaind tx pqc recover-key` 명령이 사용하는 파생 방식과 동일하므로, 어떤 도구가 서명하든 니모닉 하나에 키 하나가 대응됩니다. [결정론적 키 파생 및 복구](/developer-guide/post-quantum-signing#key-derivation)를 참조하세요.
- **계정 하나, 주소 형식 세 가지, 서명 키 하나.** `generateQoreWallet`과 `walletFromMnemonic`은 동일한 20바이트 신원의 `qor1`, `0x`(EIP-55), SVM base58 형식을 ML-DSA-87 키 쌍과 함께 반환합니다. `signClassicalEth`와 `signHybridEth`는 이 eth-native 키(`eth_secp256k1`)로 Cosmos 레인 트랜잭션에 서명하므로, 같은 키가 다른 곳에서 EVM 트랜잭션에도 서명합니다.
- **PQC 복구 코드.** `generatePqcRecoveryCode`는 `QRC1-` 접두사에 24비트 체크섬이 붙은 Crockford base32 형식의 무작위 256비트 비밀 값을 반환합니다. `pqcKeyFromRecoveryCode(code, address)`는 이 값으로부터 주소에 바인딩된 ML-DSA-87 키를 파생합니다. 잘못 입력한 문자는 어떤 것과도 일치하지 않는 키를 조용히 파생하는 대신 메시지와 함께 거부되며, 이 코드는 의도적으로 시드 구문이 아닙니다.
- **서명자로서의 QoreX.** `qorexSignAndBroadcast`는 protobuf로 인코딩된 메시지(호출당 1개에서 32개, 메모 최대 256바이트, 가스 한도 100,000에서 5,000,000)를 사용자의 QoreX 지갑으로 보냅니다. 지갑은 이를 디코딩해서 보여주고, 지갑만 만들 수 있는 ML-DSA-87 계층을 추가하고, 서명하고, 브로드캐스트합니다. 어댑터는 한도를 로컬에서 확인하고 PQC 키 관리 메시지(`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`)를 거부하며, 어떤 깊이의 authz `MsgExec` 안에 들어 있어도 마찬가지입니다. 디코딩할 수 없는 `MsgExec`도 거부됩니다.
- **EVM 인가 윈도우를 위한 구성 요소, 자동으로 열지는 않음.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow`, `isEvmWindowRejection`은 EVM 전송 전에 열려 있어야 하는 윈도우를 다룹니다. 모든 한도(`blocks` 1에서 17,280, `maxTxs` 1에서 1,000, `maxValue` 0 초과)는 필수이며 기본값 없이 클라이언트 측에서 검사되고, 윈도우 상태 필드는 BigInt이며, 패키지는 스스로 윈도우를 열지 않습니다. 사용자가 명시적인 인가 단계를 보도록 하기 위해서입니다.
- **체인과 정확히 일치하는 다이제스트를 쓰는 연결 키(authenticator) 메시지.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, `buildMetaMaskExecuteCosmos`는 Phantom 또는 MetaMask 키가 권한 집합과 지출 규칙 아래에서 QoreChain 계정의 자금을 쓸 수 있게 하는 메시지를 만듭니다. `evmAuthSignBytesV2`는 체인 v3.2.3의 다이제스트로, 호출의 가스 한도도 함께 바인딩합니다(0이 아니어야 함). 논스는 계정의 EVM 논스가 아니라 연결된 키의 authenticator 시퀀스입니다. [인증자와 위임 지출](/sdk/guides/authenticators)을 참조하세요.
- **안전한 키 로테이션.** `rotateFromLegacyWalletKey`는 폐기된 지갑 서명 파생 방식으로 만든 키에서 벗어나는 `MsgRotatePQCKey`를 만들며, 다시 파생한 키가 등록된 키와 같지 않으면 거부합니다. `rotatePqcKeyMsgFromMnemonic`은 기존의 `SHAKE-256(mnemonic)` 키를 주소에 바인딩된 표준 키로 옮기며, 새 키로 기존 파생 방식을 쓰는 것은 거부합니다.

## 사용 방법 {#how-to-use}

cosmjs 피어 두 개(버전 0.32)와 함께 어댑터를 설치합니다.

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

이 패키지는 TypeScript 타입 정의를 포함한 순수 JavaScript ES 모듈입니다. 매니페스트에는 이 패키지에 대해 테스트된 퀵스타트가 없습니다. 아래 스니펫은 패키지 타입 정의와 소스에서 가져왔습니다. 2026년 10월 27일에 지갑 생성, 서명 바이트 해석기, EVM 윈도우 상태 읽기, `openEvmWindowMsg`, 폐기된 함수의 오류를 게시된 0.4.0 패키지와 실제 테스트넷 및 메인넷 REST 엔드포인트에 대해 실행했으며, 패키지 자체의 테스트 102개가 통과합니다. 서명 및 QoreX 스니펫은 끝까지 실행해 보지 않았습니다.

### 통합 지갑 생성 {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)`는 32개의 비밀 바이트로 같은 지갑을 만듭니다. 시드가 secp256k1 개인 키가 되므로, 안전한 난수원이나 사용자만 가진 자료에 대한 키 파생 함수에서 가져와야 합니다. 웹사이트가 지갑에 만들도록 요청할 수 있는 서명으로부터 파생해서는 안 됩니다.

### 사용자의 지갑에 체인 등록 {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo`는 코인 타입 118, bech32 접두사 `qor`, 소수점 6자리의 denom `uqor`, 가스당 0.1, 0.15, 0.25 uqor의 가스 가격 단계를 사용하며, 이는 가스당 0.1 uqor 수수료 하한을 충족합니다. `addQoreEvmToWallet`에는 `rpcUrl`이 필요합니다.

### Cosmos 지갑으로 하이브리드 트랜잭션 서명 {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

알아둘 점:

- 어댑터는 서명하고, 브로드캐스트는 직접 합니다. 키 등록 메시지는 만들지 않습니다. 계정의 ML-DSA-87 키는 [QoreSign](/qoresign/quickstart)(`buildRegisterPqKeyMessage`), SDK, CLI로 한 번 등록하세요([키 등록](/developer-guide/post-quantum-signing#pqc-key-registration) 참조). 이 첫 트랜잭션은 기존 방식으로 서명할 수 있는 유일한 트랜잭션입니다.
- 웹 페이지가 계정의 ML-DSA-87 키를 보관하는 설계는 피해야 합니다. 지갑 서명으로 키를 파생하던 `derivePqcKeyFromWallet`은 0.3.0에서 폐기되었으며 항상 오류를 발생시킵니다. dApp은 메시지를 QoreX(아래)로 보내 지갑이 서명하도록 해야 합니다.
- `"auto"`를 사용했는데 브로드캐스트가 `pqc` 코드 21로 거부되면 `adapter.refreshSignBytesVersion()`을 호출하고 한 번 더 서명하세요. 명시적으로 `"v1"` 또는 `"v2"`를 지정했다면 재시도하지 마세요. [코드 21 문제 해결](/developer-guide/post-quantum-signing#code-21)을 참조하세요.

### QoreX를 통한 전송 {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value`는 protobuf 바이트(`Uint8Array`, 숫자 배열 또는 base64)이며 주어진 그대로 서명됩니다. dApp은 지갑의 네트워크를 바꿀 수 없습니다. QoreX 확장 프로그램 0.3.5 또는 앱 1.1.5 이상이 필요하며, 버전을 확인하는 대신 `hasQorexSignAndBroadcast()`로 테스트하세요. 와이어 수준의 계약은 [QoreX 브라우저 확장 프로그램](/qorex/browser-extension#sign-and-broadcast)에 있습니다.

### EVM 윈도우 메시지 구성 {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

순서가 중요합니다. 윈도우를 열고, EVM 논스를 읽고, EVM 트랜잭션에 서명하세요. 윈도우를 열면 계정의 시퀀스가 증가하고 이 시퀀스가 곧 EVM 논스이기 때문입니다. `openEvmWindowMsg`는 범위가 없는 형태의 윈도우만 만들며, 범위가 지정된 윈도우(`native_only`, `allowed_targets`)에는 SDK가 필요합니다. 배경 설명: [EVM 인가 윈도우](/sdk/guides/evm#evm-window), [첫 트랜잭션](/getting-started/first-transaction#evm-window).

### 기타 진입점

| 작업 | 함수 |
|---|---|
| PQC 키 복구 또는 로테이션 | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| eth-native 키로 서명 | `signClassicalEth` (기존 방식의 키 등록), `signHybridEth` |
| 서명 바이트 헬퍼 | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| 외부 키로 연결 및 지출 | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, `buildPhantom*` 및 `buildMetaMask*` 함수 |

## 접근 방법 {#how-to-access}

- **네트워크:** 메인넷 `qorechain-vladi`와 테스트넷 `qorechain-diana`. `chainId`와 일치하는 `rest` URL을 전달하세요([엔드포인트](/developer-tools/overview#how-to-access)).
- **지갑:** QoreSign 가이드와 예제는 Keplr을 사용합니다([Keplr 호환 지갑](/qoresign/guides/keplr-compatible-wallets)). Leap과 Cosmostation은 같은 `signDirect` 인터페이스를 제공하며 이 패키지는 그러한 모든 지갑을 대상으로 작성되었지만, 이 페이지를 위해 해당 지갑으로 확인하지는 않았습니다. MetaMask는 어댑터의 서명기가 아니라 EVM 레인을 사용하며, 모든 전송에 열려 있는 EVM 윈도우가 필요합니다([개발자 패키지](/developer-tools/overview#how-to-access)). Phantom은 authenticator로 연결됩니다.
- **계정과 키:** 수수료를 낼 QOR이 있는 계정, 그리고 첫 하이브리드 트랜잭션 전에 체인에 등록된 계정의 ML-DSA-87 키.
- **사전 요구 사항:** ES 모듈을 지원하는 Node.js, 또는 브라우저용 번들러. 피어 의존성은 `@cosmjs/stargate`와 `@cosmjs/proto-signing` `^0.32`입니다. 런타임 의존성: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto`와 `@cosmjs/encoding` `^0.32`.
- **비용:** 패키지는 무료이며, 트랜잭션은 가스당 0.1 uqor 이상의 네트워크 수수료를 지불합니다. ML-DSA-87 공개 키가 2,592바이트이므로 키 등록에는 큰 가스 한도를 사용합니다.

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (2026년 10월 20일 게시) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

소스: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (공개, 태그 `v0.4.0`, Apache-2.0). PyPI, crates.io, Maven Central, Go 프록시에는 게시되지 않았습니다. 관련 문서: [개발자 패키지](/developer-tools/overview), [QoreSign](/qoresign/overview), [포스트 퀀텀 서명](/developer-guide/post-quantum-signing), [거래소 통합](/developer-guide/exchange-integration).

## 제한 사항 및 알려진 문제 {#limits}

- **서명만 하며, 브로드캐스트, 키 등록, 윈도우 열기는 하지 않습니다.** ML-DSA-87 키를 등록하는 함수는 없고, 대신 EVM 윈도우를 열어주는 것도 없습니다.
- **소유 증명 없음.** 이 패키지만 사용하는 도구로 만든 키 등록에는 소유 증명이 없습니다. 체인은 이를 그대로 받아들이며, 증명이 있을 때는 검증합니다([소유 증명](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet`은 폐기되었으며**(0.3.0) 항상 오류를 발생시킵니다. 이 함수로 키를 등록한 계정은 `rotateFromLegacyWalletKey`로 로테이션해야 합니다.
- **범위가 없는 윈도우만 지원.** `openEvmWindowMsg`에는 범위 필드가 없습니다.
- **`qoreChainInfo`의 기본값은 테스트넷입니다.** 메인넷에서는 항상 `chainId`를 전달하세요.
- **Authenticator 논스.** 연결된 키의 authenticator 시퀀스를 노출하는 쿼리가 아직 없으므로 직접 추적해야 하며, 값이 틀리면 체인은 `abstractaccount` 코드 11로 응답합니다. authenticator 모듈은 테스트넷에서 활성화되어 있고 메인넷에서는 꺼져 있습니다([SDK 개요](/sdk/overview) 참조).
- **cosmjs 0.32 피어.** SDK는 cosmjs 0.39를 사용하므로 한 프로젝트에 둘을 함께 설치하면 `ERESOLVE` 오류가 발생합니다. 따로 두거나 `--legacy-peer-deps`를 전달하세요.
- **패키지 README에서 복사하지 마세요.** README에는 아직 메인넷이 첫 번째 서명 바이트 형식을 검증한다는 내용과 MetaMask 전송에 추가 단계가 필요 없다는 내용이 남아 있습니다. 둘 다 오래된 정보입니다. 두 네트워크 모두 v2를 검증하며, EVM 전송에는 등록된 키와 열려 있는 윈도우가 필요합니다.
- **테스트된 퀵스타트가 없습니다.** 이 패키지에 대해 기록된 퀵스타트가 없으며, QoreX 경로는 지갑이 설치되어 있어야 하므로 스크립트에서 실행할 수 없습니다.
