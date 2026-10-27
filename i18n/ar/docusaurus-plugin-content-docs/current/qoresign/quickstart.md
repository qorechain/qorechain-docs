---
slug: /qoresign/quickstart
title: البدء السريع مع QoreSign
sidebar_label: البدء السريع
sidebar_position: 2
---

# البدء السريع

يشرح هذا الدليل كيفية اشتقاق مفاتيح حساب، وتوقيع معاملة على المسار الأصلي بالمفتاحين والتحقق منها دون اتصال بالشبكة، ثم إرسالها اختياريًا إلى الشبكة التجريبية `qorechain-diana`. يتطلب Node.js 20 أو أحدث.

## 1. التثبيت {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. اشتقاق المفاتيح {#derive-keys}

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

تعطي `deriveCanonicalPqKey` مفتاح ML-DSA-87 نفسه الذي تشتقه محافظ QoreChain للحساب، فيطابق المفتاح المسجَّل أصلًا للحسابات التي أنشأتها. راجع [اشتقاق المفاتيح](/qoresign/guides/key-derivation).

## 3. التوقيع والتحقق {#sign-and-verify}

تتلقى المحفظة عادةً `bodyBytes` و`authInfoBytes` ومعرّف السلسلة ورقم الحساب من الـ dApp (وهو `SignDoc` الخاص بطلب `signDirect` في Cosmos SDK). في هذا المثال نبنيها باستخدام `cosmjs-types`:

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

## 4. الإرسال على الشبكة التجريبية (اختياري) {#send-on-testnet}

استخدم حسابك التجريبي الخاص (ولا تضع أبدًا عبارة استرداد خاصة بالشبكة الرئيسية في السكربتات). يحتاج الحساب إلى QOR تجريبية ومفتاح ML-DSA-87 مسجَّل؛ تسجّله محافظ QoreChain عند إنشاء الحساب، ويوضح [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send) كيفية تسجيله باستخدام QoreSign.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

يوجد التدفق الكامل، بما في ذلك رقم الحساب والتسلسل والرسوم، في [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## التالي {#next}

- [إضافة التوقيع الهجين إلى محفظة متوافقة مع Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
