---
slug: /user-guide/staking-and-delegation
title: التفويض والحصص
sidebar_label: التفويض والحصص
sidebar_position: 2
---

# التفويض والحصص

يشرح هذا الدليل كيفية تفويض رموز QOR إلى المدققين، وإعادة التفويض بين المدققين، وسحب حصتك من الحجز، والمطالبة بالمكافآت، وفهم بنية Triple-Pool للحصص في QoreChain.

:::note
تستخدم الأوامر أدناه شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**). الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) تعمل منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.92** — استبدل معرّف السلسلة ونقاط النهاية الخاصة بالشبكة الرئيسية من صفحة **الاتصال بالشبكة الرئيسية** عند التفويض على الشبكة الرئيسية.
:::

---

## تفويض الرموز

فوّض رموز QOR لمدقق لكسب مكافآت الحصص والمشاركة في أمن الشبكة:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال:** تفويض 100 QOR لمدقق:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## إعادة التفويض

انقل تفويضك من مدقق إلى آخر دون انتظار فترة إلغاء الحجز:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
لا يمكنك إعادة تفويض رموز هي بالفعل في مرحلة انتقال ضمن عملية إعادة تفويض. انتظر حتى تكتمل عملية إعادة التفويض الحالية قبل بدء أخرى.
:::

---

## إلغاء الحجز

اسحب رموزك المفوَّضة من مدقق. تستغرق عملية إلغاء الحجز **21 يومًا** لتكتمل، ولا تكسب الرموز خلال هذه الفترة أي مكافآت ولا يمكن تحويلها.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

بعد انتهاء فترة إلغاء الحجز البالغة 21 يومًا، تُعاد الرموز تلقائيًا إلى حسابك.

---

## المطالبة بالمكافآت

اسحب جميع مكافآت الحصص المتراكمة من كل مدقق فوّضت له:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

لسحب المكافآت من مدقق محدد فقط:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

تُموَّل مكافآت الحصص من مجمع حصص البروتوكول البالغ 590 مليون QOR بموجب جدول Tokenomics v2.1، إلى جانب حصة المفوِّض (10%) من كل رسم معاملة.

---

## تصنيف Triple-Pool

يستخدم QoreChain نموذج حصص **Triple-Pool** الذي يصنّف المدققين إلى ثلاثة مجمعات بناءً على سمعتهم ومستويات التفويض لديهم. يحصل كل مجمع على حصة مرجّحة من مكافآت الكتل.

| المجمع                                | معايير الدخول                                                | وزن المكافأة |
| -------------------------------------- | ------------------------------------------------------------ | ------------- |
| **RPoS** (إثبات الحصة القائم على السمعة) | درجة السمعة >= الشريحة المئوية 70 **و** الحصة >= الوسيط        | 40%           |
| **DPoS** (إثبات الحصة المفوَّض)         | إجمالي التفويض >= 10,000 QOR                                  | 35%           |
| **PoS** (إثبات الحصة)                   | جميع المدققين المتبقين                                         | 25%           |

تُعاد تصنيف المدققين عند كل حد فاصل لعصر جديد. المدقق الذي يبني سمعة قوية ويجمع حصة كافية يُرقّى إلى مجمع RPoS، فيحصل على أعلى حصة من المكافآت.

---

## مكافآت منحنى الربط

تُحسب مكافآت الحصص الفردية باستخدام صيغة منحنى الربط الخاصة بـ QoreChain:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| المتغير  | الوصف                                                              |
| -------- | -------------------------------------------------------------------- |
| `R`      | مقدار المكافأة للفترة                                                |
| `beta`   | معدل المكافأة الأساسي (معامل بروتوكول)                                |
| `S`      | المبلغ المحجوز                                                        |
| `alpha`  | معامل الولاء (معامل بروتوكول)                                         |
| `L`      | مدة القفل بالعصور                                                     |
| `Q(r)`   | مضاعف الجودة المشتق من درجة سمعة المدقق `r`                           |
| `P(t)`   | مضاعف المجمع في الزمن `t` (40% أو 35% أو 25% حسب المجمع)              |

تؤدي مدد القفل الأطول ودرجات السمعة الأعلى إلى مكافآت أكبر بشكل تناسبي، مما يحفّز الالتزام طويل الأمد وسلوك المدقق الجيد.

---

## الاستعلام عن معلومات المدقق

اطّلع على تفاصيل أي مدقق:

```bash
qorechaind query staking validator <validator_operator_address>
```

**مثال:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

اسرد جميع المدققين النشطين:

```bash
qorechaind query staking validators --status bonded
```

استعلم عن تفويضاتك الحالية:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* التفويض للمدققين في **مجمع RPoS** يمنح أعلى المكافآت بفضل وزن المجمع البالغ 40%.
* بناء سمعة المدقق يستغرق وقتًا. ضع في اعتبارك سجل أداء المدقق قبل التفويض.
* إعادة التفويض فورية لكنها تخضع لقيود فترة انتظار. خطّط لتحركاتك بعناية.
* فترة إلغاء الحجز البالغة 21 يومًا هي إجراء أمني. خلال هذه الفترة، يمكن أن تؤثر أحداث القطع (slashing) على رموزك.

:::
