---
slug: /qoresign/quickstart
title: البدء السريع مع QoreSign
sidebar_label: البدء السريع
sidebar_position: 2
---

# البدء السريع

يشرح هذا الدليل كيفية اشتقاق مفاتيح حساب، وتوقيع معاملة على المسار الأصلي بالمفتاحين والتحقق منها دون اتصال بالشبكة، ثم إرسالها اختياريًا إلى الشبكة التجريبية `qorechain-diana`. يتطلب Node.js 20 أو أحدث. ويغطي QoreSign 0.1.1. تعرض الأقسام التي تلي الخطوة 4 المكتبة نفسها في Python وGo، وكيفية قراءة معاملة مُثبَّتة.

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

## 5. لغات أخرى: توقيع رسالة والتحقق منها {#other-languages}

هذه الأمثلة تعمل دون اتصال. يشتق كل منها المفاتيح من عبارة BIP-39 الاختبارية العامة (العنوان `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`)، ويوقّع رسالة بالمفتاحين ويتحقق منها، ثم يطبع `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`. لا تموّل هذه العبارة أبدًا.

### Python {#python}

جديد في 0.1.1. يتطلب Python 3.9 أو أحدث؛ عجلات (wheels) لـ macOS وLinux (لا توجد عجلة لـ Windows بعد).

```bash
pip install qorechain-qoresign
```

```python
import qoresign as qs

# Public BIP-39 test phrase: never send funds to it.
mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
classical = qs.derive_classical_key(mnemonic, qs.ClassicalKeyType.SECP256K1)  # m/44'/118'/0'/0/0
account = qs.address_from_public_key(classical.public_key, qs.ClassicalKeyType.SECP256K1)
pq_key = qs.derive_canonical_pq_key(mnemonic, account.bech32)

data = b"Hello from QoreSign"
sig = qs.sign_message("qorechain-diana", account.bech32, data, classical, pq_key=pq_key)
# Raises QoreSignError if either signature is invalid.
qs.verify_message("qorechain-diana", account.bech32, data, sig, pq_public_key=pq_key.public_key)
print(account.bech32, "verified")
```

جرى تشغيل هذا على عجلات 0.1.1 المنشورة على macOS arm64 وLinux aarch64.

### Go {#go}

```bash
go get github.com/qorechain/qoresign/go@v0.1.1
```

```go
package main

import (
	"fmt"

	qoresign "github.com/qorechain/qoresign/go"
)

func main() {
	// Public BIP-39 test phrase: never send funds to it.
	mnemonic := "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
	classical, _ := qoresign.DeriveClassicalKey(mnemonic, qoresign.DeriveClassicalOptions{}) // m/44'/118'/0'/0/0
	account, _ := qoresign.AddressFromPublicKey(classical.PublicKey, qoresign.Secp256k1)
	pq, _ := qoresign.DeriveCanonicalPqKey(mnemonic, account.Bech32)

	data := []byte("Hello from QoreSign")
	sig, _ := qoresign.SignMessage(qoresign.SignMessageArgs{ChainID: "qorechain-diana",
		Signer: account.Bech32, Data: data, ClassicalKey: classical, PqKey: &pq})
	// Returns an error if either signature is invalid.
	err := qoresign.VerifyMessage(qoresign.VerifyMessageOptions{ChainID: "qorechain-diana",
		Signer: account.Bech32, Data: data, Signature: sig, PqPublicKey: pq.PublicKey})
	fmt.Println(account.Bech32, "verified:", err == nil)
}
```

يتجاهل مثال Go الأخطاء للاختصار؛ افحصها في الشيفرة الفعلية. تتبع Rust وSwift وKotlin التدفق نفسه بأسماء الدوال نفسها بأسلوب الحروف الخاص بكل لغة (راجع [النظرة العامة](/qoresign/overview#main-api)). تحتاج حزمتا Kotlin وAndroid إلى مترجم Kotlin 2.3 أو أحدث: يفشل مشروع على Kotlin 2.1 في الترجمة مقابلهما.

## 6. قراءة معاملة مُثبَّتة (مفتش المعاملات) {#inspect}

جديد في 0.1.1، في TypeScript. هذا يقرأ ولا يرسل شيئًا. يبلّغ كيف جرت حماية معاملة مُثبَّتة: رسائلها، وموقّعها، ورسومها، وهل يتحقق التوقيع الكلاسيكي، وحالة طبقة ML-DSA-87، ومستوى الأمان (`pqc` أو `enrollment` أو `shake` أو `classical`). راجع [مفتش المعاملات](/qoresign/overview#inspector) لمعرفة الحقول.

```js
// inspect.mjs
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

```bash
node inspect.mjs <txhash>
```

استخدم تجزئة معاملة حديثة على الشبكة التجريبية، مثل تحويل من الحنفية. عند تشغيله بهذه الطريقة طبع `ML-DSA-87 key registered: true`، والمستوى `pqc`، و`pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`، والرسالة `/cosmos.bank.v1beta1.MsgSend`، و`EVM window: false false`. تعيد `inspectTransaction` القيمة `undefined` لتجزئة لا تعرفها الشبكة. قد تكون معاملات الشبكة التجريبية القديمة قد اختفت لأن عقد الشبكة التجريبية تقلّم السجل.

## التالي {#next}

- [إضافة التوقيع الهجين إلى محفظة متوافقة مع Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [نظرة عامة على QoreSign](/qoresign/overview): كل الحزم وواجهة البرمجة الرئيسية والحدود وملاحظات الأمان
