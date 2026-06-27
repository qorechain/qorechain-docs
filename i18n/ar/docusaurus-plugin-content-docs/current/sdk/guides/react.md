---
slug: /sdk/guides/react
title: عدّة React
sidebar_label: React
sidebar_position: 7
---

# عدّة React (`@qorechain/react`)

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk`: مزوّد واحد،
وحفنة من الخطّافات، ومكوّنان جاهزان للإدراج — بما في ذلك شارة **آمن كمّيًا**
من سطر واحد. إنّها تجعل بناء تطبيق dApp آمن كمّيًا المسار الافتراضي.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

إنّ `react` (>=18) هو اعتمادية نظيرة؛ و`@qorechain/sdk` اعتمادية مباشرة.

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
          rpc: "https://rpc.testnet.example",
          rest: "https://rest.testnet.example",
          evmRpc: "https://evm.testnet.example",
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

يُظهِر مؤشر **آمن كمّيًا** عندما يكون للعنوان مفتاح ما بعد كمّي مسجّل
(عبر `usePqcStatus`)، وإلّا حالة "غير آمن كمّيًا" مكتومة. القيمة الافتراضية هي
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
القابل للتشغيل و[دليل الأمان الكمّي](/sdk/guides/quantum-safe) لاستدعاءات الـ SDK الأساسية.
