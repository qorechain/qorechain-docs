---
slug: /qoresign/quickstart
title: QoreSign 빠른 시작
sidebar_label: 빠른 시작
sidebar_position: 2
---

# 빠른 시작

이 문서는 계정 키를 파생하고, 두 키로 Native 레인 트랜잭션에 서명한 뒤 오프라인으로 검증하고, 선택적으로
`qorechain-diana` 테스트넷으로 전송하는 과정을 안내합니다. Node.js 20 이상이 필요합니다.

## 1. 설치 {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. 키 파생 {#derive-keys}

```js
// keys.mjs
import { addressFromPublicKey, deriveCanonicalPqKey, deriveClassicalKey } from "@qorechain/qoresign";

// The public BIP-39 test phrase. Never use it for real funds.
const mnemonic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const classical = deriveClassicalKey({ mnemonic }); // m/44'/118'/0'/0/0
const { bech32 } = addressFromPublicKey(classical.publicKey, "secp256k1");
const pq = deriveCanonicalPqKey({ mnemonic, address: bech32 });

console.log(bech32, pq.publicKey.length); // qor1..., 2592
```

`deriveCanonicalPqKey`는 QoreChain 지갑이 해당 계정에 대해 파생하는 것과 동일한 ML-DSA-87 키를 반환하므로,
QoreChain 지갑이 만든 계정에 이미 등록된 키와 일치합니다.
[키 파생](/qoresign/guides/key-derivation)을 참고하세요.

## 3. 서명 및 검증 {#sign-and-verify}

지갑은 보통 dApp으로부터 `bodyBytes`, `authInfoBytes`, 체인 ID, 계정 번호를 받습니다(Cosmos SDK
`signDirect` 요청의 `SignDoc`). 이 예제에서는 `cosmjs-types`로 직접 만듭니다.

```bash
npm install cosmjs-types @cosmjs/proto-signing @cosmjs/amino
```

```js
// sign.mjs
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { encodePubkey, makeAuthInfoBytes } from "@cosmjs/proto-signing";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const mnemonic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const classical = deriveClassicalKey({ mnemonic });
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pq = deriveCanonicalPqKey({ mnemonic, address });

const bodyBytes = TxBody.encode(
  TxBody.fromPartial({
    messages: [
      {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: MsgSend.encode({ fromAddress: address, toAddress: address, amount: [{ denom: "uqor", amount: "1" }] }).finish(),
      },
    ],
  }),
).finish();
const authInfoBytes = makeAuthInfoBytes(
  [{ pubkey: encodePubkey(encodeSecp256k1Pubkey(classical.publicKey)), sequence: 0 }],
  [{ denom: "uqor", amount: "20000" }],
  200000,
  undefined,
  undefined,
  1, // SIGN_MODE_DIRECT
);

const chainId = "qorechain-diana";
const signed = signHybrid({ chainId, accountNumber: 0, bodyBytes, authInfoBytes, classicalKey: classical, pqKey: pq });

const result = verifyHybridTx({
  txBytes: signed.txBytes,
  chainId,
  accountNumber: 0,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pq.publicKey,
});
console.log(result); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: 'v2' } }
```

```bash
node sign.mjs
```

## 4. 테스트넷으로 전송(선택 사항) {#send-on-testnet}

본인의 테스트넷 계정을 사용하세요(스크립트에 메인넷 니모닉을 절대 사용하지 마세요). 계정에는 테스트넷 QOR와
등록된 ML-DSA-87 키가 필요합니다. QoreChain 지갑은 계정을 만들 때 키를 등록하며,
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)에서
QoreSign으로 키를 등록하는 방법을 볼 수 있습니다.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

계정 번호, 시퀀스, 수수료를 포함한 전체 흐름은
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)에 있습니다.

## 다음 단계 {#next}

- [Keplr 호환 지갑에 하이브리드 서명 추가하기](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
