---
slug: /sdk/guides/react
title: عدّة React
sidebar_label: React
sidebar_position: 7
---

# عدّة React (`@qorechain/react`)

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk`: مزوّد واحد،
وحفنة من الخطّافات، ومكوّنان جاهزان للإدراج — بما في ذلك شارة حالة PQC
من سطر واحد. إنّها تجعل بناء تطبيق dApp بتوقيع ML-DSA-87 هجين المسار الافتراضي.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

إنّ `react` (>=18) هو اعتمادية نظيرة؛ و`@qorechain/sdk` اعتمادية مباشرة
(`^0.10.0` منذ العدّة 0.10.0؛ وعلى إصدار 0.x يبقى رمز caret ضمن 0.10، فلا تثبّت
تحديثة SDK نسخة ثانية). استخدم `@qorechain/react` **الإصدار 0.10.0** (ويعمل 0.9.0 بالطريقة نفسها): فالإصدار 0.8.0
يثبّت SDK 0.8.0، الذي يوقّع الصيغة الهجينة الخاطئة على الشبكة الرئيسية،
وقد تعرض إصدارات 0.8.x الأقدم رصيدًا أو حالة قديمة بعد تغيير العنوان.

:::caution حدود العدّة React على الشبكات الحيّة (0.9.0 و0.10.0)
يتصل `useTx` بموقّع المحفظة ودون زوج مفاتيح ما بعد كمّي، ولذلك يرسل
بالتوقيع الكلاسيكي فقط، وهو ما ترفضه الشبكات الحيّة (يتطلّب المسار الأصلي امتداد
ML-DSA-87 الهجين): لا يمكن لـ `send` / `sendTokens` إدراج معاملة على الشبكة
الرئيسية أو شبكة الاختبار. أرسل باستخدام `TxClient` الهجين في الـ SDK
(`client.connectTx(signer, { pqcKeypair })`، انظر
[التوقيع الهجين](/sdk/guides/quantum-safe#register-in-one-call)) لعمليات الإرسال.
يقرأ `usePqcStatus` و`<QuantumSafeBadge/>` الحالة عبر
`getPqcStatus` مع العميل المُركّب للمزوّد، الذي يقرأ منذ SDK 0.9.0 عبر
REST (`/qorechain/pqc/v1/account/{address}`)، ولذلك يعملان مقابل `*.qore.host`
(كانت العدّة 0.8.x تقرأ `qor_getPQCKeyStatus`، التي لا تقدّمها نقاط النهاية
العامة، ولم تستطع تأكيد مفتاح هناك). أمّا قراءات الرصيد (`useBalance`) واتّصال
المحفظة فتعمل.
:::

## المزوّد

غلّف تطبيقك مرّةً واحدةً في `QoreChainProvider`. يحمل نسخة `createClient()`
واحدة إضافةً إلى حالة اتّصال المحفظة الحيّة التي يقرأ منها كلّ خطّاف.

```tsx
import { QoreChainProvider } from "@qorechain/react";

function Root() {
  return (
    <QoreChainProvider
      config={{
        network: "testnet",
        endpoints: {
          rpc: "https://rpc-testnet.qore.host",
          rest: "https://api-testnet.qore.host",
          evmRpc: "https://evm-testnet.qore.host",
        },
      }}
    >
      <App />
    </QoreChainProvider>
  );
}
```

لتبديل الشبكات أثناء التشغيل، أعد تركيب المزوّد بمفتاح React `key` مختلف.
للاختبارات، مرّر خاصية `client` مبنية مسبقًا (أو محاكاة) بدلًا من `config`.

## الخطّافات

| الخطّاف | يُرجع |
| --- | --- |
| `useQoreClient()` | `QoreChainClient` المُركّب للقراءات الفورية. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — العناوين الأصلية / EVM / SVM. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`؛ تحديث تلقائي عبر `refreshInterval`. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### توصيل المحافظ

يغلّف `useConnect` محوّلات الـ SDK **الموجودة**:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — محافظ Cosmos عبر `getCosmosWallet`. تقترح وتمكّن
  السلسلة، وتُرجع موقّعًا موصولًا داخل `TxClient`، بحيث يستطيع `useTx`
  التوقيع فورًا. تُعيّن `addresses.native`.
- **evm** — أي مزوّد EIP-1193 محقون (`window.ethereum`، مثل MetaMask) عبر
  `eth_requestAccounts`. تُعيّن `addresses.evm`.
- **svm** — أي مزوّد Wallet-Standard محقون (`window.solana`، مثل Phantom)
  عبر `connect()`. تُعيّن `addresses.svm`.

يستخدم مسارا EVM وSVM واجهة الطلب القياسية للمزوّد المحقون مباشرةً،
فلا يُسحَب لا viem ولا أيّ SDK خاص بـ Solana. مرّر `provider` في خيارات
الاتّصال لحقن محفظة للاختبارات. اقرنها بـ `@qorechain/evm` /
`@qorechain/svm` للحصول على الأدوات الكاملة لكلّ جهاز افتراضي.

### إرسال المعاملات

```tsx
import { msg } from "@qorechain/sdk";
import { useTx } from "@qorechain/react";

function Send() {
  const { sendTokens, isPending } = useTx();
  return (
    <button
      disabled={isPending}
      onClick={() =>
        sendTokens("qor1recipient…", [{ denom: "uqor", amount: "1000000" }])
      }
    >
      Send 1 QOR
    </button>
  );
}
```

تأخذ `send([{ typeUrl, value }], opts)` رسائل خامًا من مؤلِّفات `msg.*`
لأيّ شيء يتجاوز تحويل البنك.

## المكوّنات

### `<ConnectButton/>`

عنصر تحكّم بسيط شبه عديم الرأس (headless-ish) للاتّصال / قطع الاتّصال. مرّر
`wallets` لتقديم منتقي، و`className` / `style` لتنسيقه، أو خاصية تصيير
`children` (render-prop) للتحكّم الكامل:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

يُظهِر مؤشر حالة عندما يكون للعنوان مفتاح ما بعد كمّي مسجّل
(عبر `usePqcStatus`)، وإلّا حالة "غير مسجّل" مكتومة. القيمة الافتراضية هي
الحساب المتّصل.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## تجميع كلّ ذلك معًا

```tsx
import {
  ConnectButton,
  QuantumSafeBadge,
  useAccount,
  useBalance,
} from "@qorechain/react";

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance(undefined, { refreshInterval: 10_000 });
  return (
    <>
      <ConnectButton wallets={["keplr", "leap", "evm"]} />
      {isConnected && (
        <p>
          {balance?.amount ?? "…"} {balance?.denom} <QuantumSafeBadge />
        </p>
      )}
    </>
  );
}
```

انظر [مثال `react-dapp`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)
القابل للتشغيل و[دليل التوقيع الهجين](/sdk/guides/quantum-safe) لاستدعاءات الـ SDK الأساسية.
