---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook هو سجل زوار على السلسلة في شبكة QoreChain EVM الاختبارية. يستطيع أي شخص أن يوقّعه مرة واحدة لكل عنوان برسالة لا تتجاوز 140 حرفًا. وله جزءان: عقد Solidity مع مشروع Hardhat (`contracts-app/`)، وصفحة ويب بـ React (`web/`) تربط محفظة QoreX وتعرض نافذة EVM الخاصة بالحساب وتسرد أحدث التواقيع مباشرة.

## ما الذي يُظهره {#shows}

- **dApp في المتصفح توقّع هجينًا دون أن تعلم.** الصفحة تطبيق wagmi وRainbowKit عادي. يضيف QoreX النصف ML-DSA-87 من التوقيع، فتُحمى المعاملة نفسها بـ secp256k1 وبمفتاح ما بعد كمومي.
- **نافذة EVM ظاهرة في الواجهة.** تقرأ الصفحة نافذة الحساب من السلسلة وتعرض هل هي مفتوحة وكم بقي من الكتل والمعاملات.
- **رفض مفهوم.** عندما ترفض السلسلة عملية كتابة، تربط `classifyEvmWindowRejection` الخطأ بأحد أربعة أسباب (لا مفتاح مسجَّل، لا نافذة، النافذة مستنفدة، معاملات غير صالحة) وتعرض الصفحة الحل.
- **تواقيع هجينة متحقَّق منها على السلسلة.** كل توقيع تكتبه هو معاملة واحدة لم تقبلها السلسلة إلا بعد فحص التوقيعين (ML-DSA-87 وsecp256k1).

## قبل أن تبدأ {#prerequisites}

تحتاج إلى طرفية على macOS أو Linux أو Windows مع WSL أو Git Bash، وهذه الأدوات:

| الأداة | الإصدار المطلوب | الفحص بالأمر |
| --- | --- | --- |
| Git | أي إصدار حديث | `git --version` |
| Node.js | 20.12 أو أحدث (يُوصى بـ 22 LTS) | `node --version` |
| pnpm | 9 أو أحدث | `pnpm --version` |

ثبّت Node.js من https://nodejs.org. إن فشل `pnpm --version` فثبّت pnpm بالأمر `npm install -g pnpm` (أو `corepack enable`) ثم افحص مرة أخرى.

تحتاج أيضًا إلى حساب مجاني على [لوحة QoreChain](https://dashboard.qorechain.io) للصنبور، وللجزء الخاص بالمتصفح إلى محفظة QoreX (الإضافة لمتصفح سطح المكتب، أو التطبيق). راجع [تكاملات QoreX](/developer-tools/qorex-integrations) و[نظرة عامة على QoreX](/qorex/overview). في خطوات العقد لا تستخدم محفظة حقيقية أبدًا: تستخدم حسابًا اختباريًا مؤقتًا. QOR الاختبارية بلا قيمة.

## خطوة بخطوة {#steps}

### 1. احصل على الشيفرة {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

للمشروع مجلدان تُعدّهما كل على حدة.

### 2. العقود: ثبّت واختبر {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

يجب أن ترى `3 passing` لاختبارات `QDayGuestbook`. تعمل على سلسلة محلية محاكاة ولا تحتاج إلى مفتاح.

### 3. العقود: أنشئ ملف مفاتيح شبكة الاختبار {#step-account}

```sh
cp .env.example .env
```

يحمل ملف `.env` مفتاحًا مؤقتًا، لذلك لا تُودِعه أبدًا ولا تعِد استخدام المفتاح في أي مكان حقيقي. افتح `.env` في أي محرر واملأ قيمتين.

**أ. مفتاح خاص مؤقت.** ولّد مفتاحًا عشوائيًا من 32 بايت:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

انسخ القيمة `0x...` المطبوعة إلى `.env` على هيئة `PRIVATE_KEY=0x...`، مستبدلًا القيمة النائبة المكونة من أصفار.

**ب. رمز استرداد ما بعد كمومي.** يُشتق مفتاح ML-DSA-87 الخاص بالحساب من رمز استرداد منفصل. أنشئ واحدًا:

```sh
pnpm window recovery-code
```

انسخ السطر `QRC1-...` المطبوع إلى `.env` على هيئة `QORE_PQC_RECOVERY_CODE=QRC1-...`. استخدم الرمز نفسه دائمًا: الرمز الجديد يعطي الحساب مفتاح ML-DSA-87 مختلفًا.

اترك `QORE_MNEMONIC` فارغًا وأبقِ `QORE_NETWORK=testnet`. يصبح `.env` الآن هكذا (القيم نائبة):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. العقود: موّل الحساب {#step-faucet}

```sh
pnpm window status
```

يطبع السطر الأول حسابك بصيغة `0x...` وصيغته `qor1...`. انسخ العنوان `qor1...`، ثم:

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق العنوان `qor1...` واطلب QOR (100 QOR مرة كل 24 ساعة).
3. انتظر بضع ثوانٍ وشغّل `pnpm window status` مرة أخرى.

### 5. العقود: سجّل المفتاح وافتح النافذة وانشر {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

يطبع `pnpm deploy:testnet` عنوان `QDayGuestbook` المنشور (`0x...`). انسخه. التسجيل هو الرسالة الوحيدة التي تقبلها السلسلة موقّعة كلاسيكيًا، لأنه لا يوجد على السلسلة مفتاح بعد للتحقق منه. أما فتح النافذة فيُوقَّع هجينًا؛ احتفظ بتجزئة المعاملة التي يطبعها.

### 6. العقود: وقّع من سطر الأوامر {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

يستطيع كل عنوان أن يوقّع مرة واحدة، لذلك يرفض العقد `pnpm sign` ثانيًا من الحساب نفسه.

### 7. صفحة الويب: ثبّت واضبط {#step-web}

افتح طرفية ثانية في مجلد المشروع نفسه (أو عد إليه بـ `cd ..`)، ثم:

```sh
cd web
pnpm install
cp .env.example .env
```

افتح `web/.env` واضبط العنوان الذي نسخته في الخطوة 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

اترك `VITE_WALLETCONNECT_PROJECT_ID` فارغًا: لا يلزم إلا إذا أضفت محفظة تعتمد على WalletConnect إلى `src/wagmi.ts`.

### 8. صفحة الويب: شغّلها {#step-run}

```sh
pnpm dev
```

افتح http://localhost:5174 في المتصفح الذي ثبّتّ عليه QoreX. تقرأ الصفحة السلسلة عبر EVM RPC. وتقرأ نافذة EVM عبر REST من خلال وكيل Vite الذي هو `/lcd`، لأن نقطة REST العامة لا ترسل ترويسات CORS. وتعرض قائمة التواقيع في الأسفل أصلًا الإدخال الذي كتبته في الخطوة 6.

### 9. وقّع من QoreX {#step-sign}

1. ثبّت QoreX وبدّله إلى شبكة الاختبار. راجع [النشر في 5 دقائق](/getting-started/deploy-in-5-minutes#step-testnet) لطريقة التبديل.
2. في QoreX استخدم حساب coin-60 (إيثريوم) بمفتاح ML-DSA-87 مسجَّل، وموّله من [الصنبور](/dashboard/faucet) (الصق عنوانه بعد تسجيل الدخول).
3. في الصفحة اختر **Connect QoreX**، واكتب رسالة، ثم اختر **Sign**. يعرض QoreX فتح نافذة EVM ضمن شاشة الموافقة إن لم تكن هناك نافذة مفتوحة.
4. وافق في QoreX.

### 10. ابحث عنه في المستكشف {#step-explorer}

افتح https://explore.qore.network وبدّل محدد الشبكة إلى **Testnet**. ابحث عن تجزئة المعاملة من الخطوة 6 أو 9، أو التجزئة الناتجة عن `pnpm window open`، أو عنوان `QDayGuestbook`. تعرض معاملة النافذة توقيعًا ما بعد كمومي تحققت منه السلسلة.

## ما الذي يجب أن تراه {#result}

- يطبع `pnpm test` في `contracts-app` القيمة `3 passing`.
- يطبع `pnpm window status` القيمتين `PQC key: registered` و`window: live` مع الكتل والمعاملات المتبقية.
- يطبع `pnpm deploy:testnet` عنوان `QDayGuestbook` (`0x...`).
- يطبع `pnpm sign "..."` تجزئة المعاملة و`status: success in block ...`.
- في الصفحة، تعرض الخطوة 1 حسابك `0x...` والسلسلة `qorechain-diana EVM (9800)` ورصيدك ونافذة EVM بالحالة `live` مع الكتل والمعاملات المتبقية.
- بعد أن تختار **Sign** وتوافق في QoreX، يظهر رابط للمعاملة في المستكشف، ثم `success in block ...`.
- تعرض القائمة في الأسفل عدد التواقيع على السلسلة وأحدث الإدخالات (حتى 20)، الأحدث أولًا، وتتحدث كل بضع ثوانٍ.
- تُظهر محاولة ثانية من العنوان نفسه أن العنوان قد وقّع من قبل.

## الشيفرة {#code}

يحفظ العقد الإدخالات في مصفوفة ويسمح بتوقيع واحد لكل عنوان:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX هو أول محفظة في قائمة الموصّلات (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

تعرض الصفحة النافذة وتشرح حالات الرفض (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## الحزم المستخدمة {#packages}

العقود (`contracts-app/`):

| الحزمة | الإصدار | الاستخدام |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | سكربت مساعد النافذة، والتوقيع الهجين |
| `@qorechain/evm` | ^0.13.0 | تعريفات السلسلة، و`evmWindowStatus`، و`evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | بث رسالة النافذة |
| `hardhat` | ^3.21.1 | الترجمة والاختبار والنشر عبر Ignition |
| `viem` | ^2.47.6 | عميل إيثريوم |
| `tsx` | ^4.19.0 | تشغيل سكربتات TypeScript |
| `typescript` | ^5.6.3 | فحص الأنواع |

صفحة الويب (`web/`):

| الحزمة | الإصدار | الاستخدام |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | تعريفات السلسلة، و`evmWindowStatus`، و`classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX كمحفظة RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | زر الاتصال |
| `wagmi` | ^2.19.5 | خطافات React للقراءة والكتابة |
| `viem` | ^2.53.1 | عميل إيثريوم |
| `@tanstack/react-query` | ^5.59.0 | جلب البيانات للنافذة وقراءات السلسلة |
| `react`, `react-dom` | ^18.3.1 | الواجهة |
| `vite` | ^5.4.0 | خادم التطوير |
| `@vitejs/plugin-react` | ^4.3.0 | دعم React في Vite |
| `typescript` | ^5.6.3 | فحص الأنواع |

المصدر: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
