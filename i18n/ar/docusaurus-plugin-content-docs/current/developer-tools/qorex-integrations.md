---
slug: /developer-tools/qorex-integrations
title: تكاملات QoreX
sidebar_label: تكاملات QoreX
sidebar_position: 22
---

# تكاملات QoreX (`@qorechain/qorex-*`)

تكاملات QoreX هي ست حزم npm صغيرة لمطوري dApp الذين يريدون أن تعمل [محفظة QoreX](/qorex/overview) في واجهة أمامية على EVM أو Cosmos أو Solana، وللفرق التي تختبر هذه الواجهات. ثلاث منها موصّلات محافظ لمكتبات شائعة (RainbowKit وInterchain Kit وcosmos-kit)، وواحدة تحوي الأنواع المشتركة ودوال الاكتشاف، واثنتان أدوات اختبار (محفظة وهمية وتجهيزات Playwright). جميعها بالإصدار **0.1.0**، نُشرت في 27 أكتوبر 2026، بترخيص Apache-2.0.

ما لا تفعله: فهي لا تحتفظ بالمفاتيح، ولا تجعل QoreX أكثر مما هو عليه اليوم. اقرأ [الحدود والمشكلات المعروفة](#limits) قبل أن تبني عليها: فإصدارات المتاجر الحيّة من QoreX تدعم جزءًا مما يمكن ربط هذه الحزم به، والحدود مذكورة هناك.

## الابتكارات {#innovations}

* **اكتشاف لا يمكن أن يختار المحفظة الخطأ.** تعلن QoreX عن نفسها عبر EIP-6963 بالاسم المعكوس للنطاق `network.qore.qorex` ولا تكتب أبدًا في `window.ethereum`. تختار `@qorechain/qorex-types` المزوّد بهذا الاسم وحده، وتثبّت محفظة RainbowKit الموصّل على المزوّد المُعلَن ولا تعود أبدًا إلى `window.ethereum`.
* **المحفظة هي من تبني التوقيع الهجين، والصفحة لا تحمل أبدًا المفتاح ما بعد الكمي.** يحتاج المسار الأصلي لـ QoreChain إلى توقيع secp256k1 إضافة إلى توقيع ML-DSA-87 (FIPS 204). على المزوّد الأصلي (`window.qorex.native`) تسلّم الدعوة `signAndBroadcast` الرسائل إلى QoreX، التي تبني المعاملة وتوقّعها بالمفتاحين وتبثّها. والنتيجة هي `txHash` و`code` و`height` و`shield`، حيث تكون `shield` هي `shielded` متى حملت المعاملة المثبَّتة الطبقة الهجينة.
* **فحوصات القدرات بدل فحوصات الإصدار.** تقرأ الحزم قائمة `capabilities` الخاصة بالمحفظة (`hasCapability`)، فتُكتشف ميزة مثل `signAndBroadcast` ولا تُخمَّن من رقم إصدار.
* **الرفض صريح، برموز ثابتة.** يُرفض توقيع Amino عمدًا، لأن Amino JSON لا يستطيع حمل التوقيع الهجين؛ وترمي الموصّلات `QorexIntegrationError` برموز مثل `QOREX_AMINO_REFUSED` و`QOREX_USE_SIGN_AND_BROADCAST` و`QOREX_NOT_SUPPORTED_YET`، وتفحصها `isQorexIntegrationError(err, code)`.
* **بديل اختباري يوقّع فعلًا.** تحقن `@qorechain/qorex-wallet-mock` الكائنات نفسها التي تحقنها QoreX (`window.qorex = { evm, native, svm }`)، وتسجّل محفظة Solana، وتوقّع بالخوارزميات الحقيقية (ML-DSA-87 الهجين عبر QoreSign على المسار الأصلي، وsecp256k1 على EVM، وed25519 على Solana) انطلاقًا من العبارة الاختبارية العامة على الشبكة التجريبية افتراضيًا. وتعلن عن نفسها باسم `network.qore.qorex.mock`، فلا يستطيع الكود الذي يختار QoreX بصرامة أن يخلطها بالمحفظة.
* **ملفّا سلوك.** يتصرف الملف `current` في المحاكاة كما تتصرف QoreX الحيّة اليوم؛ ويضيف `planned` ما أعلن عنه فريق QoreX، فتبني مسبقًا دون أن تدّعي المحاكاة شيئًا لا تفعله المحفظة بعد.
* **تجهيزات Playwright على طراز Synpress v4** (`qorexMockFixtures`) تحقن المحاكاة قبل التنقل، فلا يحتاج اختبار شامل (end-to-end) إلى إضافة متصفح.
* **حسابات تقودها المحفظة دون أحداث.** لأن QoreX لا تُصدر `accountsChanged` ولا `chainChanged` بعد، تتضمن محفظة RainbowKit خيارًا اختياريًا `pollAccountsOnFocus` يعيد قراءة `eth_accounts` و`eth_chainId` عندما تستعيد الصفحة التركيز.

## كيفية الاستخدام {#how-to-use}

كتل الشيفرة أدناه هي البدايات السريعة من مركز المطورين. فُحص كلٌّ منها بـ `tsc` وشُغّل في 27 أكتوبر 2026 بعد التثبيت من سجل npm العام (Node 26؛ وjsdom 30 و`react-dom/client` لشيفرة المتصفح؛ وPlaywright 1.64 مع Chromium للتجهيز) ونجح. لا يرسل أيٌّ منها معاملة ولا يحتاج إلى مفتاح ممول. والنتيجة الملاحَظة مذكورة مع كل منها. لم يُختبر سلوك جانب المحفظة (QoreX حقيقية في متصفح حقيقي) لهذه الصفحة.

### `@qorechain/qorex-types`: اكتشاف QoreX {#types}

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

الملاحَظ تحت المحاكاة: `QoreX EVM provider not announced`، ثم `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. السطر الأول متوقع تحت المحاكاة، انظر [تنبيه EIP-6963](#limits). لا تعتمد الحزمة على أي تبعيات وقت التشغيل، وتصدّر أيضًا أيقونة QoreX كـ data URI من `@qorechain/qorex-types/icon`. صادرات أخرى: أنواع المزوّد، و`isQorexInstalled`، و`qorexSignAndBroadcast`، ودوال لتصنيف رفض QoreX في EVM.

### `@qorechain/qorex-rainbowkit`: QoreX في RainbowKit وwagmi {#rainbowkit}

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

الملاحَظ: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. تحوي `QOREX_CHAINS` تعريفات سلاسل viem لمسار EVM (RPC ‏`https://evm.qore.host` و`https://evm-testnet.qore.host`، والعملة الأصلية QOR بـ 18 خانة عشرية، والمستكشف `https://explore.qore.network`). أما `projectId` فهو معرّف مشروع WalletConnect تنشئه بنفسك لدى WalletConnect. التبعيات النظيرة: `viem` ^2 و`wagmi` ^2.9 و`@rainbow-me/rainbowkit` ^2.2.11. لالتقاط تغييرات الحساب والشبكة التي تُجرى في المحفظة، استخدم `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit`: تطبيقات Cosmos (موصى بها للأعمال الجديدة) {#interchain-kit}

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

الملاحَظ: رُكّب المكوّن في jsdom مع مُدخل سجل سلاسل شبكة QoreChain التجريبية (`@interchain-kit/react` 0.11.1). التبعية النظيرة: `@interchain-kit/core` ^0.11. أرسل معاملة QoreChain بالدالة `qorexSignAndBroadcast`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

تقبل الدعوة من 1 إلى 32 رسالة ومذكرة (memo) حتى 256 بايت، وتطلب QoreX من المستخدم الموافقة عليها. المقتطف مأخوذ من ملف README الخاص بالحزمة ولم يُشغَّل لهذه الصفحة.

### `@qorechain/qorex-cosmos-kit`: تطبيقات Cosmos على cosmos-kit {#cosmos-kit}

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

الملاحَظ: رُكّب في jsdom مع مُدخل شبكة QoreChain التجريبية (`@cosmos-kit/react` 2.24.1). **الخيار `throwErrors={false}` مطلوب لينجح فحص الأنواع للشيفرة:** إذ تعرّف `@cosmos-kit/react` 2.24 الخاصية `throwErrors` كخاصية مطلوبة، ويغفلها المثال في README الحزمة. التبعية النظيرة: `@cosmos-kit/core` ^2.18.1. يوصي README الحزمة بـ Interchain Kit للتطبيقات الجديدة. وتصدّر الحزمة `qorexSignAndBroadcast` أيضًا.

### `@qorechain/qorex-wallet-mock`: بديل اختباري لـ QoreX {#wallet-mock}

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

الملاحَظ: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. تُشتق الحسابات بالطريقة التي تشتقها بها QoreX (`m/44'/118'/0'/0/i` مع مفتاح ML-DSA-87 القياسي لعنوان `qor1` ذاك، و`m/44'/60'/0'/0/i` لـ EVM، و`m/44'/501'/i'/0'` لـ Solana). تشمل الخيارات `profile` و`mnemonic` و`accountIndex` و`chainId` (الافتراضي `qorechain-diana`) و`autoApprove` و`allowMainnet`؛ كما تحصل الصفحة على `window.__qorexMock` مع `approveNext()` و`rejectNext()` و`requests` و`switchAccount(i)`. في Playwright، احقن `mock.initScript()` بـ `page.addInitScript` (Node 20.16 أو أحدث).

### `@qorechain/qorex-synpress`: تجهيزات Playwright {#synpress}

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

الملاحَظ: `1 passed`، مقابل صفحة محلية يستدعي زر Connect فيها `eth_requestAccounts` (Playwright 1.64 وChromium). لدمج التجهيزات مع Synpress، ثبّت `@synthetixio/synpress@4.1.2` ولُفَّها بـ `testWithSynpress`. يكشف التجهيز `qorex` الأعضاء `addresses` و`approveNext()` و`rejectNext()` و`requests()` و`switchAccount(i)` و`disconnect()`. التبعية النظيرة: `@playwright/test` ‏1.48 أو أحدث. الحالة تعيش في الصفحة، لذلك يبدأ كل تنقل بمحاكاة جديدة.

## كيفية الوصول {#how-to-access}

* **محفظة QoreX للاستخدام الحقيقي.** تتحدث الموصّلات مع إضافة متصفح QoreX أو تطبيقها الذي ثبّته المستخدم؛ راجع صفحة [إضافة متصفح QoreX](/qorex/browser-extension) للتثبيت وإصدارات المتاجر. حزم الاختبار لا تحتاج إلى محفظة.
* **الشبكات.** الشبكة الرئيسية `qorechain-vladi` (معرّف سلسلة EVM ‏9801) والشبكة التجريبية `qorechain-diana` (معرّف سلسلة EVM ‏9800). تخدم QoreX معرّفي سلسلة QoreChain هذين فقط وترفض غيرهما برسالة "QoreX: unsupported chain". تعتمد المحاكاة الشبكة التجريبية افتراضيًا وترفض التوقيع للشبكة الرئيسية ما لم تمرّر `allowMainnet: true`.
* **المفاتيح والأموال.** الحزم لا تحتفظ بأي مفتاح. تستخدم المحاكاة عبارة BIP-39 الاختبارية العامة (الكلمة `abandon` مكررة 11 مرة، ثم `about`) التي تشتق `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`؛ لا تموّلها أبدًا. ولاختبار يبثّ معاملات، أعطِ المحاكاة عبارتك الاستعادية الخاصة بالشبكة التجريبية.
* **حسابات أخرى.** يحتاج RainbowKit مع WalletConnect إلى معرّف مشروع WalletConnect من WalletConnect.
* **المتطلبات المسبقة.** Node.js (يحتاج سكربت الملف الواحد للمحاكاة إلى 20.16 أو أحدث)، وتطبيق React للموصّلات الثلاثة، والحزم النظيرة المذكورة تحت كل بداية سريعة. يحصل مستخدمو TypeScript على الأنواع من `@qorechain/qorex-types`.
* **التكاليف.** الحزم مجانية. تدفع المعاملة المرسلة عبر QoreX الرسوم المعتادة (الحد الأدنى 0.1 uqor لكل وحدة غاز).

## أين تُنشر {#where-published}

| السجل | الحزمة | الإصدار | الرابط |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

المصدر: https://github.com/qorechain/qorex-integrations (الوسم `v0.1.0`، والمجلدات تحت `packages/`؛ ويحوي أيضًا dApp تجريبيًا وأمثلة وملفات مُدخلات سجل السلاسل). قُرئت الإصدارات من سجل npm في 27 أكتوبر 2026. وهي تحلّ محل `@qorechain/connect`، الذي صار مهجورًا على npm: استخدم `qorex-types` لاكتشاف QoreX، و`qorex-rainbowkit` لتطبيقات EVM، و`qorex-interchain-kit` (أو `qorex-cosmos-kit`) لتطبيقات Cosmos، و[QoreSign](/qoresign/overview) للتوقيع الهجين في محفظتك أو خلفيتك الخاصة.

## الحدود والمشكلات المعروفة {#limits}

**ما تدعمه إصدارات QoreX الحالية.** إصدارات المتاجر الحيّة (تطبيق QoreX للجوال 1.1.8؛ وإضافة المتصفح 0.3.8، و0.3.9 على Firefox) لا تدعم بعد `getOfflineSigner` مع طبقة ML-DSA تضيفها المحفظة، ولا تدعم `signArbitrary`. عبر cosmos-kit وInterchain Kit، لا يعمل التوقيع بـ `getOfflineSigner` إلا إذا أرفقت الصفحة نفسها الطبقة ما بعد الكمية، وهو ما لا تستطيعه الصفحة عادةً لأنها لا تحمل المفتاح. الطريقة المدعومة لإرسال معاملة على المسار الأصلي اليوم هي `window.qorex.native.signAndBroadcast`، التي تغلّفها `qorexSignAndBroadcast`. لا تعتبر الموصّلات محفظة كاملة لـ cosmos-kit أو Interchain Kit مع إصدارات المتاجر الحالية، بما يتجاوز ما يذكره README كل حزمة. كُتبت الموصّلات بحيث يستطيع إصدار لاحق من QoreX إضافة الطبقة في `signDirect` (يُعلَن عنها عبر قدرة `signDirectAddsPqcLayer`) دون أي تغيير في شيفرتك.

**ما تجيب عنه QoreX اليوم** (من README الحزم):

* **EVM:** ‏`eth_chainId` و`eth_accounts` و`eth_requestAccounts` و`wallet_switchEthereumChain` للشبكة المختارة في QoreX (تُرفض السلسلة المجهولة بالرمز 4902). طرق التوقيع (`personal_sign` و`eth_signTypedData_v4` و`eth_sendTransaction`) و`wallet_addEthereumChain` غير مدعومة بعد وتُرفض برسالة "QoreX: EVM method ... not yet supported". لا أحداث `accountsChanged` أو `chainChanged` بعد. أدرجها فريق QoreX كمخطط لها، وليست حيّة: الأحداث، ثم رموز الأخطاء على كل رفض، ثم طرق التوقيع والمعاملات.
* **معاملات EVM عمومًا.** على QoreChain لا تُقبل معاملة EVM إلا من حساب لديه مفتاح ML-DSA-87 مسجّل ونافذة تفويض EVM مفتوحة، وكلاهما يُعدّ من المسار الأصلي (راجع [تطوير EVM](/developer-guide/evm-development#evm-window)). لا تفتح `eth_sendTransaction` المخطط لها في المحاكاة تلك النافذة.
* **الأصلي:** ‏`enable` و`getKey` و`signDirect` و`signAndBroadcast` و`listAccounts` و`experimentalSuggestChain`، لـ `qorechain-vladi` و`qorechain-diana` فقط. على QoreChain تحتاج `signDirect` إلى أن تكون الطبقة الهجينة موجودة مسبقًا، وهو ما لا تستطيع الصفحة بناءه، لذا استخدم `signAndBroadcast`. أما `signArbitrary` وتوقيع Amino و`sendTx` فغير متاحة؛ وفي الموصّلات ترمي `signArbitrary` الخطأ `QOREX_NOT_SUPPORTED_YET` ويرمي Amino الخطأ `QOREX_AMINO_REFUSED`.
* **Solana:** ‏Wallet Standard على `solana:mainnet` مع connect وdisconnect والأحداث و`signAndSendTransaction` و`signTransaction` و`signMessage`؛ بلا `solana:signIn`. لا يقبل مسار SVM في السلسلة معاملات بعد، فالدعم لـ Solana هنا هو جانب المحفظة فقط.

**تنبيهات وُجدت أثناء اختبار البدايات السريعة:**

* **يحتاج cosmos-kit إلى `throwErrors`.** يغفل مثال README الخاصية `throwErrors` التي تطلبها `@cosmos-kit/react` 2.24 في أنواعها، فلا ينجح فحص الأنواع كما هو مكتوب. مرّر `throwErrors={false}` (أو قيمتك الخاصة).
* **TypeScript الصارم والمحاكاة.** تُرجع `window.qorex.evm.request(...)` النوع `unknown`، ولذلك يفشل سطر README الذي يفكّك نتيجتها تحت TypeScript الصارم. حوّل النتيجة بـ cast، مثلًا `as string[]` لـ `eth_requestAccounts`.
* **للمحاكاة معرّف EIP-6963 خاص بها.** تعلن `network.qore.qorex.mock` لا `network.qore.qorex`. لذلك فإن شيفرة الاكتشاف التي تختار QoreX بصرامة بـ `network.qore.qorex` (ومنها `discoverQorexEip1193` في `qorex-types`) لا تجد مزوّد EVM تحت المحاكاة، عن قصد، بينما يكون `window.qorex.evm` والمزوّد الأصلي موجودين. إذا كانت شيفرتك تختار المزوّد عبر الاكتشاف، فاجعلها تقبل rdns المحاكاة (المصدَّر باسم `QOREX_MOCK_RDNS`) في الاختبارات.
* **RainbowKit يُبقي Node حيًّا.** في Node، يبدأ بناء إعداد RainbowKit مؤقتات WalletConnect، ولا تنتهي العملية من تلقاء نفسها بعد ذلك. وهذا متوقع في الصفحة. أما في سكربت أو اختبار، فاخرج صراحةً (مثلًا `process.exit(0)`) بعد أن تقرأ ما تحتاجه.
* **وضع إضافة Synpress لا يعمل بعد.** ‏`qorexExtensionFixtures` هي الطريقة المخطط لها لقيادة الإضافة الحقيقية وترمي اليوم `QorexExtensionModeUnavailableError`، لأنها تحتاج إلى محددات اختبار مستقرة في نوافذ الموافقة في QoreX لم تصدر بعد. استخدم وضع المحاكاة.

**الفروق بين المحاكاة والمحفظة:** لا شاشة قفل ولا نافذة موافقة (الموافقات تتم بـ `approveNext` أو `rejectNext` أو `autoApprove`)؛ تُبلغ `signDirect` عن نوع مفتاح secp256k1 عادي؛ ويُرفض `signAndSendTransaction` في Solana؛ والرسائل التي تبدأ بـ "QoreX (mock):" هي من المحاكاة نفسها. نتائج الاختبار من المحاكاة تُظهر كيف تتصرف صفحتك مقابل الواجهة الموصوفة، لا أن إصدارًا حقيقيًا من QoreX يتصرف بالطريقة نفسها.

**أخرى:** الحزم الست جميعها إصدار أولي (0.1.0)، فتوقّع أن تنمو واجهاتها كما تنمو QoreX. لا تغطي أي بداية سريعة مُختبَرة الدالة `qorexSignAndBroadcast` مقابل شبكة حيّة أو محفظة حقيقية.
