---
slug: /rollups/rdk-v328
title: "RDK على v3.2.8: ما الذي تغيّر"
sidebar_label: RDK على v3.2.8
sidebar_position: 11
---

# RDK على v3.2.8: ما الذي تغيّر

يغيّر إصدار QoreChain v3.2.8 طريقة تسوية الـ rollups. صار بإمكان الـ rollups أن تضع بياناتها على السلسلة، وأن تترك للسلسلة ترتيب معاملاتها (التسلسل القائم على الأساس، based sequencing)، وأن تُسوّي بتفاؤل مع إثبات احتيال يعيد تشغيل الدفعة، وأن تُبقي منشوراتها خاصة بمجموعة من الأعضاء، وأن تربط جذور سحب Groth16 بطريقة تقبل أي جذر من 32 بايتًا. وتسوية STARK متوقفة مؤقتًا إلى إصدار لاحق. تصف هذه الصفحة ما يفعله كل تغيير وكيف يُستخدم. وهي موجهة لمشغّلي الـ rollups والمطورين الذين يبنون على وحدة `x/rdk`.

:::caution شبكة الاختبار فقط في الوقت الحالي

يعمل v3.2.8 على شبكة الاختبار العامة `qorechain-diana` منذ 12 نوفمبر 2026. ولم تطبّقه الشبكة الرئيسية بعدُ، لذا تُرفض كل ميزة في هذه الصفحة هناك إلى أن تطبّقه. تعامل مع الأمثلة على أنها أمثلة لشبكة الاختبار.

:::

:::note أي الأدوات تستطيع فعل هذا اليوم

* **سطر أوامر العقدة (`qorechaind`)**: لكل رسالة في هذه الصفحة أمر. وهذا هو الملف الثنائي للعقدة على Linux؛ ولا يوجد ملف ثنائي مُحزَّم لـ macOS، لذا شغّله على مضيف Linux إن كنت على Mac، أو اقرأ السلسلة عبر REST.
* **عدة RDK**: يدعم RDK 0.9.0 الإصدار v3.2.8. وهو منشور على كل السجلات: npm (`@qorechain/rdk` و`@qorechain/rdk-cli` و`create-qorechain-rollup`) وPyPI (`qorechain-rdk`) وcrates.io (`qorechain-rdk`) وMaven (`io.github.qorechain:qorechain-rdk`) وGo (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). ملاحظات الإصدار: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **عملاء RDK لـ Python وGo وRust وJava**: يدعم الإصدار 0.9.0 من كل منها v3.2.8. أما التشغيل من البداية إلى النهاية أدناه فاستخدم عميل TypeScript.

:::

## ما الذي تغيّر في لمحة {#at-a-glance}

| المجال | السلوك ابتداءً من v3.2.8 |
| --- | --- |
| نشر البيانات | تضع `MsgPostRollupData` حمولة في معاملة وتحتفظ بالتزام (commitment) على السلسلة تحت تسلسل الوارد التالي للـ rollup. |
| التسلسل القائم على الأساس | تُرتّب السلسلة معاملات الـ rollup بحسب إدراجها. يُضبط عند الإنشاء أو بالحوكمة عبر `MsgSetRollupSequencing`. |
| Rollups المتفائلة | الـ rollups المتفائلة الجديدة (`nft` و`custom`) تشغّل نموذج التنفيذ `qledger-v1` ويجب أن تكون قائمة على الأساس. ويعيد إثبات الاحتيال تنفيذ الدفعة. |
| سند المُقدِّم | تحتاج الدفعات على rollup من نوع `qledger-v1` إلى سند (`MsgBondRollupSubmitter`). وإثبات احتيال مُقَرّ يحرق النصف ويدفع النصف للمتحدّي. |
| الإيداعات | تُقيّد `MsgDepositToRollup` حسابًا من 32 بايتًا على rollup من نوع `qledger-v1`. |
| Rollups الخاصة | الـ rollups من نوع `defi` المنشأة بخصوصية `encapsulated` لا تقبل إلا مظاريف ML-KEM-1024 إلى أعضائها (`MsgSetRollupMembers`). |
| مدخلات Groth16 | تُقرأ المدخلات بمقياس حقل العددي BLS12-381. ويجوز أن يكون `withdrawals_root` أي 32 بايتًا ويُخزَّن مختزلًا. |
| STARK | مفاتيح STARK ودفعات STARK مرفوضة إلى إصدار لاحق. |
| الاحتفاظ | تُحفظ التزامات البيانات المنشورة طوال `posted_data_retention_blocks`، مع نقاط تفتيش تُحفظ أطول على rollups من نوع `qledger-v1`. |

## لماذا يهم هذا {#why}

قبل v3.2.8 لم يكن لبيانات الـ rollup مكان على السلسلة، فكان على كل من يتحقق من دفعة أن يثق بنسخة المرتِّب. ونشر البيانات والترتيب بحسب الإدراج يزيلان هذه الثقة: فالسلسلة نفسها تسجّل ما نُشر وبأي ترتيب، ويجب أن تستهلك الدفعة هذا النطاق بالضبط. وفي الـ rollups المتفائلة صار التحدّي يفحص التنفيذ لا الجذر وحده، فتخسر الدفعة الخاطئة سندَ مُقدِّمها. وتتيح الـ rollups الخاصة لمجموعة أن تتشارك البيانات على سلسلة عامة دون نشرها.

## نشر بيانات الـ rollup {#posting-data}

ترسل `MsgPostRollupData` (الأمر `tx rdk post-data`) حمولة في معاملة. وتبقى البايتات في المعاملة، فتكون في الكتلة. وتحتفظ السلسلة بالتزام تحت تسلسل الوارد التالي للـ rollup (يبدأ من 1): تجزئة SHA-256 للبيانات وحجمها والناشر والارتفاع. وتمدّد أيضًا مُراكِم (accumulator) الوارد للـ rollup.

* **من يجوز له النشر**: مرتِّب الـ rollup (مُنشئه حين لا يُضبط عنوان مرتِّب). وفي rollup قائم على الأساس، أي أحد.
* **الحجم**: `max_posted_data_bytes` على الأكثر لكل منشور (الافتراضي 131,072 بايتًا، والسقف الصلب 1 MiB) و`max_posted_data_bytes_per_block` عبر كل الـ rollups (الافتراضي 524,288 بايتًا قابلًا للفوترة).
* **الرسم**: `posted_data_fee_per_byte` من uqor لكل بايت قابل للفوترة (الافتراضي 10)، ويُفوتر المنشور عن 1 KiB على الأقل. يذهب الرسم إلى جامع الرسوم ويُقسَّم كرسم معاملة. ويُحتسب الغاز فوق ذلك.
* **الاحتفاظ**: يُقلَّم الالتزام بعد `posted_data_retention_blocks` (الافتراضي 648,000). وتبقى البايتات في تاريخ الكتل.
* **الاستخدام في دفعة**: يجوز لدفعة من rollup بتوافر بيانات أصلي (native DA) غير قائم على الأساس أن تشير إلى منشور محتفَظ به بجعل `data_hash` مساويًا لتجزئة SHA-256 للبيانات.

سطر الأوامر (الملف الثنائي للعقدة على Linux):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

اقرأ التزامًا عبر REST (جرى التحقق على شبكة الاختبار، انظر [المسارات التي جرى فحصها](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

تحمل الاستجابة `data_hash` و`size` و`poster` و`height` و`inbox_acc` و`expires_at_height`. والتسلسل الذي لم يُنشر قط، أو الذي قُلِّم، يعيد HTTP 404.

## التسلسل القائم على الأساس {#based-sequencing}

الـ rollup القائم على الأساس يُرتَّب بالإدراج على QoreChain. يحصل كل منشور على تسلسل الوارد التالي، وتستهلك كل دفعة الوارد بالترتيب.

* أنشئ rollup قائمًا على الأساس بالخيار `--sequencing based`، أو انقل rollup موجودًا بالحوكمة عبر `MsgSetRollupSequencing`.
* تضبط كل دفعة `inbox_end` (تسلسل آخر منشور تستهلكه) وتحمل التزام نطاق الوارد بوصفه `data_hash`. اطلبه من السلسلة بـ `query rdk inbox` (يعيد `range_data_hash`).
* الـ rollup القائم على الأساس يُوقَف ويُستأنف ويُنهى بالحوكمة فقط.

من يجوز له تقديم الدفعات على rollup قائم على الأساس يعتمد على الـ rollup:

| Rollup | من يقدّم الدفعات |
| --- | --- |
| zk بمفتاح Groth16 (`defi`) | أي حساب. يربط الإثبات الجذور ونطاق الوارد وجذر السحوبات. |
| تسوية قائمة على الأساس (`gaming` و`enterprise`) | مرتِّب الـ rollup فقط. |
| متفائل مع `qledger-v1` (`nft` و`custom`) | أي حساب يحمل سند مُقدِّم. |

لا يمكن في هذا الإصدار جعل الـ rollups المتفائلة بلا `qledger-v1` وrollups STARK قائمة على الأساس.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

المُراكِم والتزام النطاق، للمُثبِتين (provers) الذين يريدون حسابهما دون الوثوق بعقدة:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

القيمة `acc_0` هي 32 بايتًا أصفارًا، و`lp` بادئة طول من 4 بايتات بترتيب big-endian.

## Rollups المتفائلة مع qledger-v1 {#qledger-v1}

ابتداءً من v3.2.8 لا يمكن إنشاء rollup متفائل جديد بلا آلة تنفيذ افتراضية. وتحتاج الإعدادات المسبقة `nft` و`custom` إلى `--execution-vm qledger-v1` مع `--sequencing based`. أما الـ rollups المتفائلة المنشأة قبل v3.2.8 فلا تتغير.

`qledger-v1` دفتر حسابات بوحدة uqor (شجرة Merkle متناثرة مع SHA-256) مع تحويلات وسحوبات موقّعة. مفاتيح الحسابات فيه ML-DSA-44 فقط. ومدخلاته هي واردها:

* **منشورات المستخدمين**: معاملة واحدة لكل منها، بحد أقصى 6 KiB.
* **الإيداعات**: تقيّد `MsgDepositToRollup` معرّف حساب من 32 بايتًا. وتُلحق السلسلة الإيداع بالوارد بنفسها.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### سند المُقدِّم والمعلّق {#submitter-bond}

يجوز لأي حساب تقديم الدفعات متى حمل سند مُقدِّم لا يقل عن `min_submitter_bond` (الافتراضي 1,000 QOR، أي 1,000,000,000 uqor) على ذلك الـ rollup.

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

يعيد استعلام السند `amount` و`last_submit_time` و`unbond_after` و`pending`. والقيمة `pending` هي عدد دفعات ذلك المُقدِّم التي ما زالت تنتظر النهائية: ترتفع عند كل دفعة مقدَّمة وتنخفض حين تُنهَّى دفعة أو تُرفض. ويجوز أن يكون لدى المُقدِّم أقل من 1,024 دفعة معلّقة. ويمكن استرداد السند بـ `unbond-submitter` بعد نافذة تحدٍّ كاملة من آخر دفعة لصاحبه.

### قواعد الدفعة {#batch-rules}

لتكن `consumed` موضع الوارد الذي تبدأ منه الدفعة التالية، و`head` آخر منشور (كلاهما في `query rdk inbox`). تُقبل دفعة بـ `inbox_end = end` حين تتحقق كل الشروط التالية:

1. يحمل المُقدِّم `min_submitter_bond` على الأقل ولديه أقل من 1,024 دفعة معلّقة.
2. `consumed < end <= head`. تستهلك الدفعة مدخلًا واحدًا على الأقل.
3. `end - consumed <= 64`. أي 64 مدخلًا من الوارد على الأكثر لكل دفعة.
4. ما زالت السلسلة قادرة على إنتاج المُراكِم عند `end`: أي أن `end` هو الرأس، أو أن التزام المنشور `end` محتفَظ به (يعيد `query rdk inbox <rollup> --inbox-end <end>` قيمة `range_data_hash`).
5. الدفعة التي تقل عن 64 مدخلًا وتتوقف قبل الرأس تتوقف إما قبل منشور أُجري في آخر 20 كتلة مباشرة، أو عند نقطة تفتيش (`end` من مضاعفات 64) لم يعد منشورها التالي محتفَظًا به.
6. `data_hash` هو التزام نطاق الوارد من `consumed` إلى `end`، وتبدأ الدفعة الأولى من جذر الدفتر الفارغ، و`state_root` من 32 بايتًا.

يستطيع العميل اختيار `end` هكذا:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

التقديم بسطر الأوامر:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### إثباتات الاحتيال {#fraud-proofs}

خلال نافذة التحدّي يجوز لأي أحد إرسال `MsgChallengeBatch` مع إثبات احتيال `qledger-v1`: مدخلات الدفعة وشاهد Merkle للحسابات التي تلمسها. وتعيد السلسلة تنفيذ الدفعة.

* إذا كان جذر الحالة أو جذر السحوبات خاطئًا، تُرفض الدفعة، وكذلك كل دفعة بُنيت عليها. ويتراجع الوارد.
* يُقتطع سند المُقدِّم كله. **يُحرق النصف ويُدفع النصف للمتحدّي.** ويُسجَّل النصف المحروق في وحدة الحرق تحت المصدر `rollup_slash`. والمُقدِّم الذي يتحدّى دفعته الخاطئة بنفسه يخسر مع ذلك نصف سنده.
* الإثبات الذي لا يُظهر دفعة خاطئة يفشل بالخطأ 51 ولا يغيّر شيئًا.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

يتضمن RDK 0.9.0 دوال `qledger-v1` المساعدة التي تبني بايتات الإثبات.

الدفعات التي لا يُتحدّى فيها تُنهَّى من تلقاء نفسها عند انتهاء نافذة التحدّي. وتُدفع السحوبات من الدفعات المُنهّاة فقط، ومن مجمّع إيداعات الـ rollup، لا من ضمان المُنشئ أبدًا. ولا يمكن إنهاء rollup ما دام المجمّع يحتوي على إيداعات (الخطأ 54).

### الاحتفاظ وفترات الخمول {#retention}

* يُحتفظ بالتزام المنشور طوال `posted_data_retention_blocks`، ثم، ما دامت لا توجد دفعة مُنهّاة تغطيه، لما يصل إلى 4 فترات احتفاظ إضافية.
* بعد ذلك يُقلَّم، إلا نقطة التفتيش: كل منشور يكون تسلسله من مضاعفات 64 يحتفظ بالتزامه حتى تغطيه دفعة مُنهّاة، أو حتى يُنهى الـ rollup.
* الـ rollup المُنهى لا يحتفظ بأي التزام بعد فترة احتفاظه.
* يجب أن يكون `posted_data_retention_blocks` مساويًا على الأقل لأطول نافذة تحدٍّ سارية، محسوبة بكتلة واحدة في الثانية (`default_challenge_window` ونافذة كل rollup غير مُنهى). والتحديث الذي يتركه أقصر، أو يرفع نافذة فوقه، يُرفض بالخطأ `invalid params`. والحد الأعلى 25,920,000.
* عند ترقية v3.2.8 تُرفع أي قيمة مخزنة دون تلك النافذة إليها. وتُترك المعاملات الافتراضية كما هي.
* **قيم شبكة الاختبار**: `default_challenge_window` يساوي 3,600 ثانية (والقيمة الافتراضية في النواة، وهي قيمة على نمط الشبكة الرئيسية، هي 604,800 ثانية، أي 7 أيام). وتُحفظ البيانات المنشورة 648,000 كتلة، وكتل blobs والدفعات المُنهّاة 432,000 كتلة.

بعد فترة خمول طويلة، مع أكثر من 64 منشورًا غير مستهلك وقُلِّمت التزاماتها، يلحق المُقدِّم بالركب بالترتيب: دفعة واحدة إلى مضاعف 64 التالي إن لم يكن `consumed` مضاعفًا، ثم دفعات كاملة من 64 من نقطة تفتيش إلى نقطة تفتيش، ثم دفعة أخيرة إلى الرأس (أو إلى أي موضع محتفَظ به بموجب القاعدة 5). وفي التشغيل العادي لا يتغير شيء: دفعة حتى 64 مدخلًا، إلى الرأس أو إلى ما قبل منشور حديث مباشرة.

## Rollups الخاصة {#private-rollups}

الـ rollup من نوع `defi` (Groth16) المنشأ بخصوصية `encapsulated` لا يقبل إلا منشورات هي مظاريف ML-KEM-1024 إلى أعضائه.

يشفّر المظروف البيانات مرة واحدة بـ AES-256-GCM تحت مفتاح جديد، ويغلّف ذلك المفتاح لمفتاح ML-KEM-1024 الخاص بكل عضو من سجل KEM في السلسلة. ويضمن التزام المفتاح أن يفتح كل الأعضاء المحتوى نفسه. وتتحقق السلسلة من أن المظروف سليم البنية وأن كل مدخل يسمّي المفتاح الحالي للعضو. ولا تفك التشفير أبدًا.

* يضبط المُنشئ الأعضاء بـ `MsgSetRollupMembers`: 32 على الأكثر، لكل منهم مفتاح ML-KEM-1024 مسجَّل. وكل تغيير يبدأ حقبة عضوية جديدة.
* تبقى المنشورات والناشر والتوقيت والأحجام والأعضاء والجذور والسحوبات (المستلم والمبلغ) علنية. والمحتوى وحده خاص.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## مدخلات Groth16 وجذر السحوبات {#groth16}

تُتحقق دفعة Groth16 على BLS12-381 (الملف `defi`، SNARK) مقابل مدخلات عامة، كل منها قيمة من 32 بايتًا تُقرأ عددًا صحيحًا big-endian وتُختزل بمقياس رتبة الحقل العددي:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

الدفعة المقدَّمة قبل ربط السحوبات لها المدخلات الثلاثة الأولى فقط. ويجب أن يأخذ شاهد المُثبِت القيم المختزلة نفسها.

هل يجب أن تكون القيمة دون `r` أصلًا يعتمد على من يضبطها:

| القيمة | من يضبطها | يجب أن تكون دون r |
| --- | --- | --- |
| `state_root` | المُثبِت | نعم |
| `prev_state_root` | السلسلة (آخر `state_root` مُسوّى)، إلا في أول دفعة للـ rollup | الدفعة الأولى فقط |
| `data_hash` | السلسلة حين يكون مربوطًا (نطاق وارد rollup قائم على الأساس، أو التزام بيانات منشورة)، وإلا فالمُثبِت | فقط حين لا يكون مربوطًا |
| `withdrawals_root` | السلسلة (جذر شجرة السحب الذي تعيد `MsgExecuteWithdrawal` بناءه) | لا |

ما يعنيه ذلك للعميل:

* قدّم جذر السحوبات كما تعطيه الشجرة. ويجوز أن يكون أي 32 بايتًا.
* تخزّن السلسلة `withdrawals_root mod r` على هيئة 32 بايتًا big-endian. ويُظهر استعلام الدفعة تلك القيمة المخزنة، مع `withdrawals_root_reduced` صحيحة. ونحو 55 في المئة من جذور الأشجار تساوي `r` أو تفوقه، فتختلف القيمة المخزنة غالبًا عن البايتات المقدَّمة.
* لا تتغير `MsgExecuteWithdrawal` بالنسبة إلى العميل: أرسل حقول الورقة وتجزئات الأشقاء. وتعيد السلسلة بناء الجذر وتقبل السحب حين يتحقق `rebuilt_root mod r == stored_root mod r`.
* تقديمان للدفعة نفسها تختلف جذورهما بمضاعف لـ `r` هما الدفعة نفسها. الأول يُسوّى، والثاني يُرفض بوصفه دفعة موجودة أصلًا، وتُدفع كل عمليات السحب في الشجرة مقابل الجذر المخزن.
* بعد التسوية قارن الجذر المخزن بـ `tree_root mod r`، لا بـ `tree_root`.

أما دفعات المتفائلة و`qledger-v1` وGroth16 السابقة لقاعدة الاختزال فتخزّن وتقارن الـ 32 بايتًا بالضبط. وللاطلاع على ترميز الشجرة والورقة راجع [ZK / STARK وعمليات السحب](/rollups/zk-stark-withdrawals).

## تسوية STARK متوقفة مؤقتًا {#stark}

عبارة STARK الوحيدة التي يدعمها المُتحقِّق تثبت تربيعًا متكررًا بين قيمتين من 64 بتًا. وهذا لا يقيّد سحوبات الـ rollup ولا بياناته. ابتداءً من v3.2.8 لا يمكن ضبط مفتاح STARK وتُرفض دفعات rollup من نوع STARK (الخطأ 52). ويستطيع الحوكمة نقل مثل هذا الـ rollup إلى مفتاح Groth16. وستعود تسوية STARK في إصدار لاحق بعبارة rollup حقيقية.

## الرسائل الجديدة {#messages}

| الرسالة | الأمر | من يرسلها |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | المرتِّب، أو أي أحد في rollup قائم على الأساس |
| `MsgSetRollupSequencing` | مقترح حوكمة | الحوكمة |
| `MsgDepositToRollup` | `tx rdk deposit` | أي أحد، لـ rollup من نوع `qledger-v1` |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | مُقدِّم دفعات |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | مُقدِّم دفعات |
| `MsgSetRollupMembers` | `tx rdk set-members` | مُنشئ rollup خاص |
| الحقل `inbox_end` في `MsgSubmitBatch` | `tx rdk submit-batch --inbox-end` | مُقدِّم دفعة rollup قائم على الأساس |

يقبل `create-rollup` الآن أيضًا `--sequencing` و`--execution-vm` و`--privacy`. ومصفوفة التوافق صارت: المتفائل مع إثباتات الاحتيال يحتاج `qledger-v1` والتسلسل القائم على الأساس، وتسوية ZK تعني SNARK.

## تدفق تطبيقي: إنشاء، سند، إيداع، نشر، دفعة، تحدٍّ، إنهاء، سحب {#worked-flow}

:::note شغّله فريق RDK على شبكة الاختبار في 12 نوفمبر 2026
شغّل فريق RDK هذا التدفق من البداية إلى النهاية على شبكة الاختبار `qorechain-diana` في 12 نوفمبر 2026، من 06:22 إلى 07:27 بالتوقيت العالمي المنسّق. وجرى بالكامل عبر RDK 0.9.0 (TypeScript) مع رسم RDK التلقائي `auto` بـ 0.15 uqor للغاز. وأعادت كل خطوة الرمز 0. ولم يشغّله كاتب هذه الصفحة.
:::

| الخطوة | الرسالة | الغاز المستخدم / الغاز المطلوب |
| --- | --- | --- |
| 0 | سجّل أولًا مفتاح الحساب الجديد ما بعد الكمومي، في معاملة منفصلة (`MsgRegisterPQCKeyV2` مع إثبات الحيازة). تفعل عملاء RDK هذا تلقائيًا؛ ومن دونه تُرفض أول معاملة حقيقية برمز pqc 8 | 348,917 / 600,000 |
| 1 | `MsgCreateRollup`: الملف `nft`، آلة التنفيذ `qledger-v1`، التسلسل `based`، حصة 10,000 QOR (يُحرق 1%) | 301,260 / 349,199 |
| 2 | `MsgBondRollupSubmitter`، 1,000 QOR | 178,059 / 263,425 |
| 3 | `MsgDepositToRollup` مرتين (3 QOR و1 QOR؛ والحد الأدنى 1 QOR) | نحو 240,000 / 350,000 لكل منهما |
| 4 | `MsgPostRollupData` مرتين (تحويل qledger موقّع وسحب qledger موقّع)، مع رسم البيانات المنشورة (10 uqor للبايت القابل للفوترة، ويُفوتر 1 KiB على الأقل) | نحو 328,500 / 474,000 لكل منهما |
| 5 | `planQledgerBatch`، ثم `MsgSubmitBatch` لـ 4 مدخلات وارد (`inbox_end` 4، و`data_hash` نطاق الوارد). حالة الدفعة `submitted`، والسند `pending` 1 | 712,379 / 1,011,431 |
| 6 | اختبار الاحتيال: منشور إضافي، ثم دفعة بجذر حالة خاطئ عمدًا (233,990 / 341,742)، ثم `MsgChallengeBatch` مع إثبات الاحتيال الذي بناه RDK (4,136 بايتًا) | 450,186 / 644,417 |
| 7 | أُنهيت الدفعة 0 من تلقاء نفسها بعد نافذة التحدّي في شبكة الاختبار البالغة 3,600 ثانية | لا معاملة |
| 8 | `MsgExecuteWithdrawal` بقيمة 0.3 QOR مع إثبات Merkle الخاص بـ qledger من RDK | 192,768 / 284,220 |

نتائج جديرة بالملاحظة:

* **الخطوة 6**: رُفضت الدفعة الخاطئة، واقتُطع سند المُقدِّم (نصف محروق ونصف مدفوع للمتحدّي)، وتراجع الوارد، ولم تُمَس الدفعة الجيدة السابقة.
* **الخطوة 8**: انخفض مجمّع إيداعات الـ rollup من 4.0 إلى 3.7 QOR، وارتفع رصيد المستلم بـ 0.3 QOR ناقص الرسم.

لكل خطوة مقابل في سطر الأوامر. هذه الأوامر المنفردة لم تُشغَّل لهذه الصفحة وتتبع تعريفات واجهة سطر أوامر العقدة:

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

نافذة التحدّي لأي rollup موجودة في `challenge_window_sec` الخاص به. وعلى شبكة الاختبار يساوي `default_challenge_window` القيمة 3,600 ثانية عن قصد، كي يمكن تجربة الـ rollups خلال ساعة؛ والقيمة الافتراضية في النواة، وهي قيمة على نمط الشبكة الرئيسية، هي 604,800 ثانية (7 أيام). وتحتاج الخطوات من 5 إلى 8 جذورًا وإثباتات محسوبة من الدفتر؛ ويتضمن RDK 0.9.0 دوال `qledger-v1` المساعدة التي تفعل ذلك.

## قراءة السلسلة بعدة TypeScript المنشورة {#typescript}

تستخدم هذه القراءات أسماء من `@qorechain/rdk`، الذي يدعم v3.2.8 ابتداءً من 0.9.0. ويمكنك أيضًا قراءة الحقول الجديدة مباشرة بـ `curl` كما يلي.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

لم يُنفَّذ هذا المقطع لأجل هذه الصفحة.

## المسارات التي جرى فحصها {#checked-routes}

طُلبت هذه المسارات للقراءة فقط من شبكة الاختبار العامة في 12 نوفمبر 2026.

| المسار | الحالة |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` و`?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200، أو 404 لتسلسل لم يُنشر قط أو قُلِّم |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>` و`latest_batch/<id>` و`batch/<id>/<index>` | 200 |
| أي مسار لـ rollup غير معروف | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

تشمل معاملات الوحدة الآن `max_posted_data_bytes` و`max_posted_data_bytes_per_block` و`posted_data_fee_per_byte` و`posted_data_retention_blocks` و`min_submitter_bond` و`finalized_batch_retention_blocks`. ويضيف عرض الدفعة `inbox_start` و`inbox_end` و`withdrawals_root_reduced`، ويضيف عرض الـ rollup `sequencing` و`execution_vm` و`privacy` و`members` و`members_epoch` و`deposit_pool`. وتحتوي استجابة الوارد على `head_sequence` و`consumed_sequence` و`range_data_hash`، وهذا الأخير فارغ حين لا يكون الالتزام عند النهاية المطلوبة متاحًا.

## الحدود والأخطاء {#limits}

| الحد أو الخطأ | القيمة أو المعنى |
| --- | --- |
| حجم المنشور | `max_posted_data_bytes`، الافتراضي 131,072 بايتًا، والسقف 1 MiB |
| البايتات المنشورة لكل كتلة | `max_posted_data_bytes_per_block`، الافتراضي 524,288 بايتًا قابلًا للفوترة |
| رسم المنشور | 10 uqor لكل بايت قابل للفوترة افتراضيًا، ويُفوتر 1 KiB على الأقل |
| الاحتفاظ بالبيانات المنشورة | 648,000 كتلة افتراضيًا، و25,920,000 على الأكثر، ولا تقل أبدًا عن أطول نافذة تحدٍّ بالثواني |
| منشور `qledger-v1` | معاملة واحدة، 6 KiB على الأكثر |
| حجم الدفعة | من 1 إلى 64 مدخلًا من الوارد |
| الدفعات المعلّقة لكل مُقدِّم | أقل من 1,024 |
| أعضاء rollup خاص | 32 على الأكثر، لكل منهم مفتاح ML-KEM-1024 مسجَّل |
| الدفعات المُسوّاة لكل كتلة، لكل rollup | `max_batches_per_block`، الافتراضي 10 (الخطأ 40) |
| الأخطاء 41 و44 و47 | الميزة غير مفعّلة عند هذا الارتفاع (لم تطبّق الشبكة v3.2.8) |
| الخطأ 42 و43 | المنشور كبير جدًا، أو بلغت الكتلة حد المنشورات |
| الخطأ 45 | التسلسل القائم على الأساس غير متاح لهذا الـ rollup |
| الخطأ 46 | الدفعة لا تطابق وارد الـ rollup (`inbox_end` أو `data_hash` خاطئ) |
| الخطأ 48 | وضع تنفيذ أو خصوصية غير صالح |
| الخطأ 49 | سند المُقدِّم مطلوب |
| الخطأ 50 | سند المُقدِّم ما زال مقفلًا |
| الخطأ 51 | إثبات الاحتيال لا يُظهر أن الدفعة غير صالحة |
| الخطأ 52 | تسوية STARK متوقفة مؤقتًا |
| الخطأ 53 | المنشور ليس مظروفًا صالحًا إلى أعضاء الـ rollup |
| الخطأ 54 | ما زال الـ rollup يحتفظ بإيداعات المستخدمين، فلا يمكن إنهاؤه |

## صفحات ذات صلة {#related}

* [نظرة عامة على التجميعات](/rollups/overview)
* [الإعدادات المسبقة](/rollups/preset-profiles)
* [نشر Rollup](/rollups/deploying-a-rollup)
* [توافر البيانات](/rollups/data-availability)
* [ZK / STARK وعمليات السحب](/rollups/zk-stark-withdrawals)
* [برج المراقبة](/rollups/watchtower)
