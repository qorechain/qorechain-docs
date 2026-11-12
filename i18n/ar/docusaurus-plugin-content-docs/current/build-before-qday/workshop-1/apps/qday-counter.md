---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter هو أصغر مشروع مفيد على QoreChain EVM: عقد Solidity يخزّن رقمًا واحدًا، ومشروع Hardhat ينشره على شبكة الاختبار `qorechain-diana`، وسكربت قصير يقرأ الرقم ويزيده. وهو قالب `hardhat` من `create-qorechain-dapp` مضافًا إليه سكربت `interact` صغير.

## ما الذي يُظهره {#shows}

- **التوقيع الهجين جزء من مسار النشر.** قبل أي معاملة EVM، بما في ذلك نشر عقد، يحتاج الحساب إلى مفتاح ML-DSA-87 مسجَّل ونافذة تفويض EVM مفتوحة. تُفتح النافذة برسالة واحدة من مسار Native موقّعة بـ secp256k1 وML-DSA-87 معًا (هجين)، وتتحقق السلسلة من التوقيعين.
- **معاملة هجينة واحدة متحقَّق منها على السلسلة.** تُرسل الخطوة `pnpm window open` تلك المعاملة. يمكنك البحث عنها في المستكشف ورؤية حكم السلسلة نفسها.
- **أدوات EVM العادية تواصل العمل.** ترسل Hardhat وIgnition وviem معاملات إيثريوم عادية. وتكمن الحماية ما بعد الكمومية في النافذة، لذلك لا يستطيع مفتاح secp256k1 المسروق وحده أن ينفق من الحساب.

حاسوب كمومي كبير بما يكفي لكسر secp256k1 سيتيح للمهاجم تزوير التواقيع الكلاسيكية. تشترط QoreChain توقيعًا ثانيًا ما بعد كمومي (ML-DSA-87، FIPS 204) على الحساب. يُظهر Counter حلقة المطور كاملة مع تفعيل هذه القاعدة: سجّل المفتاح، وافتح نافذة، وانشر، واستدعِ، واقرأ.

## قبل أن تبدأ {#prerequisites}

تحتاج إلى طرفية على macOS أو Linux أو Windows مع WSL أو Git Bash، وهذه الأدوات:

| الأداة | الإصدار المطلوب | الفحص بالأمر |
| --- | --- | --- |
| Git | أي إصدار حديث | `git --version` |
| Node.js | 20.12 أو أحدث (يُوصى بـ 22 LTS) | `node --version` |
| pnpm | 9 أو أحدث | `pnpm --version` |

ثبّت Node.js من https://nodejs.org. إن فشل `pnpm --version` فثبّت pnpm بالأمر `npm install -g pnpm` (أو `corepack enable`) ثم افحص مرة أخرى.

تحتاج أيضًا إلى حساب مجاني على [لوحة QoreChain](https://dashboard.qorechain.io) لاستخدام الصنبور. لن تستخدم محفظة حقيقية في هذا الدليل: كل ما يلي يستخدم حسابًا اختباريًا مؤقتًا، وQOR الاختبارية بلا قيمة.

## خطوة بخطوة {#steps}

### 1. احصل على الشيفرة {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. ثبّت الاعتماديات {#step-install}

```sh
pnpm install
```

### 3. شغّل الاختبارات والبناء {#step-test}

تعمل الاختبارات على سلسلة محلية محاكاة. لا تحتاج إلى مفتاح ولا إلى حساب على الشبكة.

```sh
pnpm test
pnpm build
```

يجب أن ترى `2 passing` لاختبارات `Counter`.

### 4. أنشئ ملف مفاتيح شبكة الاختبار {#step-account}

أنشئ ملف الإعدادات من القالب:

```sh
cp .env.example .env
```

يحمل ملف `.env` مفتاحًا مؤقتًا، لذلك لا تُودِعه أبدًا ولا تعِد استخدام المفتاح في أي مكان حقيقي. افتح `.env` في أي محرر. ستملأ قيمتين.

**أ. مفتاح خاص مؤقت.** ولّد مفتاحًا عشوائيًا من 32 بايت:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

انسخ القيمة `0x...` المطبوعة إلى `.env` على هيئة `PRIVATE_KEY=0x...`، مستبدلًا القيمة النائبة المكونة من أصفار.

**ب. رمز استرداد ما بعد كمومي.** يُشتق مفتاح ML-DSA-87 الخاص بالحساب من رمز استرداد منفصل. أنشئ واحدًا:

```sh
pnpm window recovery-code
```

انسخ السطر `QRC1-...` المطبوع إلى `.env` على هيئة `QORE_PQC_RECOVERY_CODE=QRC1-...`. احتفظ بهذا الرمز مع المفتاح الخاص واستخدم الرمز نفسه دائمًا: الرمز الجديد يعطي الحساب مفتاح ML-DSA-87 مختلفًا.

اترك `QORE_MNEMONIC` فارغًا، وأبقِ `QORE_NETWORK=testnet`. يصبح `.env` الآن هكذا (القيم نائبة):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. اعرض عنوان حسابك {#step-address}

```sh
pnpm window status
```

يطبع السطر الأول حسابك بصيغة `0x...` وصيغته `qor1...`. وتقول الرسالة في هذه المرحلة أيضًا إن المفتاح غير مسجَّل ولا توجد نافذة. انسخ العنوان `qor1...`.

### 6. احصل على QOR اختبارية من الصنبور {#step-faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب QOR (100 QOR مرة كل 24 ساعة).
3. انتظر بضع ثوانٍ ثم شغّل `pnpm window status` مرة أخرى. صار الحساب موجودًا على السلسلة.

### 7. سجّل المفتاح وافتح النافذة {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

التسجيل هو الرسالة الوحيدة التي تقبلها السلسلة موقّعة كلاسيكيًا، لأنه لا يوجد على السلسلة مفتاح بعد للتحقق منه. أما فتح النافذة فيُوقَّع هجينًا. احتفظ بتجزئة المعاملة التي يطبعها `window open`؛ ستبحث عنها في الخطوة الأخيرة.

### 8. انشر العقد {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

يطبع الأمر عنوان `Counter` المنشور (`0x...`).

### 9. اقرأ وزِد {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. ابحث عنه في المستكشف {#step-explorer}

1. افتح https://explore.qore.network وبدّل محدد الشبكة إلى **Testnet**.
2. ابحث عن التجزئة التي طبعها `pnpm window open`. تعرض المعاملة توقيعًا ما بعد كمومي تحققت منه السلسلة.
3. ابحث عن تجزئة معاملة `increment` التي طبعها `pnpm interact`، أو عن عنوان `Counter` من الخطوة 8، لترى استدعاء العقد.

يعرض [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) النوع نفسه من الدليل بايت ببايت.

## ما الذي يجب أن تراه {#result}

- يطبع `pnpm test` القيمة `2 passing`.
- يطبع `pnpm window status` الحساب (`0x...` مع صيغته `qor1...`) و`PQC key: registered` و`window: live` مع الكتل والمعاملات والقيمة المتبقية.
- يطبع `pnpm deploy:testnet` عنوان `Counter` المنشور (`0x...`).
- يطبع `pnpm interact` عنوان Counter و`count` وتجزئة معاملة `increment` و`status: success` مع رقم الكتلة، ثم `count` الجديد، ورابطًا إلى المعاملة في المستكشف.
- في المستكشف (Testnet)، تُعلَّم معاملة `window open` على أنها متحقَّق منها بالتوقيعين.

إن فشلت خطوة، فشغّل `pnpm window status` أولًا: يخبرك إن كان المفتاح أو النافذة مفقودًا. وإن رُفضت معاملة بعد نفاد النافذة، فافتح نافذة جديدة بـ `pnpm window open`.

## الشيفرة {#code}

العقد (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

الجزء الموقّع هجينًا من `scripts/window.ts` (رسالة النافذة والموقّع):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` هو الحساب الموحّد المشتق من مادة مفاتيحك، و`net` هو سجل الشبكة الخاص بـ `QORE_NETWORK` (الافتراضي `testnet`، ومعرّف السلسلة `qorechain-diana`). الرسوم التي يستخدمها السكربت هي 100000 `uqor` بحد غاز 800000، لأن المعاملات الهجينة كبيرة. يمكن تغيير حجم النافذة في `.env` عبر `QORE_WINDOW_BLOCKS` (الافتراضي 600) و`QORE_WINDOW_TXS` (الافتراضي 5) و`QORE_WINDOW_MAX_UQOR`.

## الحزم المستخدمة {#packages}

| الحزمة | الإصدار | الاستخدام |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | التوقيع الهجين، وتسجيل مفتاح PQC، و`openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | مساعدات نافذة EVM (`evmWindowStatus` و`evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | بث معاملة مسار Native |
| `hardhat` | ^3.21.1 | الترجمة والاختبار والنشر عبر Ignition |
| `viem` | ^2.47.6 | قراءة العقد والكتابة إليه |
| `tsx` | ^4.19.0 | تشغيل سكربتات TypeScript |
| `typescript` | ^5.6.3 | فحص الأنواع |

يمكنك توليد المشروع نفسه بنفسك بالأمر `npx create-qorechain-dapp my-app -t hardhat --network testnet`. راجع [المولّدات وCLI](/developer-tools/scaffolders-and-cli) و[تثبيت SDK](/sdk/install).

## تفاصيل الشبكة {#networks}

| البند | القيمة |
| --- | --- |
| الشبكة | شبكة الاختبار `qorechain-diana` |
| معرّف سلسلة EVM | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

المصدر: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
