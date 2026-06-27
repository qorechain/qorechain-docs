---
slug: /architecture/amm
title: صانع السوق الآلي والسيولة على السلسلة
sidebar_label: صانع السوق الآلي والسيولة على السلسلة
sidebar_position: 8
---

# صانع السوق الآلي والسيولة على السلسلة

وحدة `x/amm` هي صانع السوق الآلي (AMM) الأصلي على السلسلة في QoreChain. تتيح لأي شخص إنشاء أحواض سيولة، وتقديم سيولة، والمبادلة بين أصول QoreChain الأصلية مباشرةً على مستوى البروتوكول — دون الحاجة إلى دفتر أوامر خارج السلسلة أو منصة تبادل لامركزية (DEX) خارجية تعتمد على عقود ذكية. وهي طبقة التسوية على السلسلة التي تقف خلف تجربة **Trade / DEX في لوحة التحكم**.

تتبع الأحواض منحنيات تسعير AMM المألوفة:

- **`constant_product`** — منحنى `x*y=k` (للأزواج متعددة الأغراض).
- **`stable_swap`** — منحنى منخفض الانزلاق للأزواج المربوطة بإحكام، مضبوط بمعامل تضخيم.

تستخدم جميع المبالغ وحدات QoreChain الأصلية. رمز التخزين والرسوم هو **QOR**، وفئته الأساسية هي **uqor** (1 QOR = 10^6 uqor). يستخدم المشاركون في الأحواض والعناوين بادئة bech32 وهي `qor`.

:::note
تستخدم الأوامر أدناه `qorechaind`. أضف رايات المعاملات المعتادة (`--from`، `--chain-id`، `--gas`، `--fees`، `--node`) المناسبة لبيئتك — على سبيل المثال `--chain-id qorechain-vladi` مقابل الشبكة الرئيسية.
:::

## الأحواض وحصص مزودي السيولة (LP)

يحتفظ الحوض باحتياطيات من فئتين (`token_a`، `token_b`، مخزَّنتين بترتيب مرتب) ويسكّ **رموز LP** التي تمثل مطالبة تناسبية بتلك الاحتياطيات. لكل حوض `id` رقمي، و`type`، و`status` (`active` أو `paused`)، وفئة LP خاصة به. عند إضافة سيولة تتلقى رموز LP؛ وعند إزالة السيولة تحرقها لاسترداد حصتك من الاحتياطيات.

### إنشاء حوض

يأخذ `create-pool` نوع الحوض والإيداعين الأوليين (كعملات). بالنسبة للزوج المستقر، اضبط معامل التضخيم باستخدام `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### إضافة سيولة

يودِع `add-liquidity` كلا الجانبين في الحوض ويسكّ رموز LP. الوسيط الأخير هو الحد الأدنى لمقدار LP الذي ستقبله — وهو حمايتك من تغيّر نسبة الحوض قبل تنفيذ معاملتك.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### إزالة سيولة

يحرق `remove-liquidity` رموز LP ويسحب الاحتياطيات. يحدد وسيطا `min` الحد الأدنى لمقدار كل جانب الذي ستقبل استرداده.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## المبادلات

يدعم AMM اتجاهي المبادلة القياسيين.

### مدخل محدد (Exact-in)

ينفق `swap-exact-in` مقدار مدخل ثابت ويعيد المخرج الذي يولّده المنحنى مهما كان، مع حد أدنى للمخرج (حماية من الانزلاق).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### مخرج محدد (Exact-out)

يطلب `swap-exact-out` مقدار مخرج ثابت وينفق أي مدخل مطلوب مهما كان، مع حد أقصى للمدخل.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

وسيط `min-out` / `max-in` الأخير في كل مبادلة هو واقي الانزلاق: اضبطه من عرض سعر جديد (أدناه) بالإضافة إلى هامش التحمّل لديك، وتتراجع المعاملة إذا كان السعر المنفَّذ سيتجاوزه.

## عروض الأسعار (معاينة السعر)

عروض الأسعار للقراءة فقط — تعاين مبادلة دون تقديمها، بحيث يمكن للعميل إظهار المخرج المتوقع والرسوم قبل توقيع المستخدم. وهي الأساس الطبيعي لحقل السعر في واجهة التداول.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

`fee` المعادة هي رسوم المبادلة التي يطبّقها AMM على الصفقة. تُحدَّد مستويات الرسوم والانزلاق بواسطة الحوض/المعاملات؛ استخدم نقاط نهاية عرض الأسعار لرؤية أثرها الملموس على أي صفقة بدلاً من حسابها يدوياً.

## فحص الأحواض والأرصدة

كل هذه استعلامات للقراءة فقط يمكن لأي شخص تشغيلها.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

يعيد `pool` احتياطيات الحوض، ومعروض LP، والنوع، والحالة، ومتوسط سعر موزون جارٍ. ويعيد `lp-balance` رصيد رمز LP `balance` الذي يحتفظ به حساب لذلك الحوض.

## إيقاف الحوض واستئنافه مؤقتاً

يمكن إيقاف الأحواض مؤقتاً واستئنافها بواسطة سلطة الحوض (العنوان المُمرَّر عبر `--from`). يرفض الحوض الموقوف المبادلات وتغييرات السيولة حتى يُستأنف — مفيد للاستجابة للحوادث أو الصيانة المنسَّقة.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## ملخص الأوامر

**المعاملات** (`qorechaind tx amm …`):

| الأمر | الغرض |
| --- | --- |
| `create-pool` | إنشاء حوض `constant_product` أو `stable_swap` |
| `add-liquidity` | إيداع احتياطيات وسكّ رموز LP |
| `remove-liquidity` | حرق رموز LP وسحب الاحتياطيات |
| `swap-exact-in` | مبادلة مقدار مدخل ثابت |
| `swap-exact-out` | مبادلة إلى مقدار مخرج ثابت |
| `pause-pool` | إيقاف حوض مؤقتاً (السلطة) |
| `resume-pool` | استئناف حوض موقوف (السلطة) |

**الاستعلامات** (`qorechaind query amm …`):

| الأمر | الغرض |
| --- | --- |
| `params` | إظهار معاملات الوحدة |
| `pool` | إظهار حوض واحد حسب المعرّف |
| `pools` | سرد جميع الأحواض |
| `pool-by-denoms` | حلّ حوض من زوج فئاته |
| `lp-balance` | رصيد LP لحساب في حوض |
| `quote-exact-in` | معاينة المخرج لمبادلة بمدخل ثابت |
| `quote-exact-out` | معاينة المدخل لمبادلة بمخرج ثابت |

## ذات صلة

- تعرض واجهة **Trade / DEX في لوحة التحكم** هذه الأحواض وعروض الأسعار والمبادلات في واجهة رسومية للمستخدمين اليوميين.
- لمعرفة كيفية تدفق معروض QOR والرسوم والقيمة عبر السلسلة، انظر [اقتصاد الرمز](/architecture/tokenomics).
- جرّب المبادلات بنفسك في واجهة [Trade / DEX](/dashboard/trade).
- لإحضار الأصول إلى QoreChain أولاً، انظر [جسر الأصول](/user-guide/bridging-assets).
