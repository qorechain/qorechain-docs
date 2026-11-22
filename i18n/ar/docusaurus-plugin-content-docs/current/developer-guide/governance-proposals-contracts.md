---
slug: /developer-guide/governance-proposals-contracts
title: "مقترحات الحوكمة للعقود: رفع الشيفرة الأصلية وفتح الوصول عبر الأنوية الافتراضية (شبكة الاختبار)"
sidebar_label: مقترحات العقود
sidebar_position: 12
---

# مقترحات الحوكمة للعقود: رفع الشيفرة الأصلية وفتح الوصول عبر الأنوية الافتراضية (شبكة الاختبار)

على شبكة اختبار QoreChain `qorechain-diana` لا يرفع أحد عقد QoreChain Native (CosmWasm) بمعاملة عادية، ولا يستطيع أي عقد EVM استدعاء عقد Native عبر الجسر قبل أن تقول الحوكمة ذلك. وكلا الأمرين يمرّان عبر **مقترح حوكمة**: يخزّن المقترح شيفرتك المُصرَّفة، وينشئ العقد اختياريًا، ويضيفه إلى قائمة السماح للأنوية الافتراضية، **مثبَّتًا على الشيفرة بعينها** التي رفعتها. تُري هذه الصفحة المطوّر كيف يُعدّ مقترحًا كهذا ويقدّمه ويراقبه ويتحقق منه، ثم كيف يستدعي العقد المعتمد من Solidity.

فُحصت هذه الصفحة على شبكة الاختبار الحيّة في **22 نوفمبر 2026** (السلسلة `qorechain-diana`، سلسلة v3.2.9 منذ 20 نوفمبر). والأمثلة على السلسلة مقترحات حقيقية: 40 (عقد `qday-receipts`، الشيفرة 865)، و23 و27 و34 (شيفرة مخزَّنة)، و19 و20 (قواعد الإنشاء)، و32 (قائمة السماح). أما أسطر أوامر `qorechaind` فكُتبت من مرجع CLI الموجود ومن JSON المقترح على السلسلة؛ ولم يُشغَّل الملف الثنائي نفسه لهذه الصفحة، فشغّل `qorechaind tx gov submit-proposal --help` مرة على جهازك إن اختلفت علامة.

:::note شبكة الاختبار فقط
تصف هذه الخطوات شبكة الاختبار. ليس في الشبكة الرئيسية جسر مفتوح بين الأنوية الافتراضية، ورفع الشيفرة فيها أيضًا بالحوكمة فقط. QOR الاختبار بلا قيمة؛ استخدم حسابات اختبار فقط.
:::

## لماذا يمرّ عبر الحوكمة {#why}

* **الرفع مغلق على الحسابات.** قيمة `code_upload_access` هي `Nobody`، و`MsgStoreCode` على قائمة قاطع الدائرة. ويفتح مقترح الحوكمة القاطع، ويخزّن الشيفرة بحساب الحوكمة، ويغلقه من جديد داخل المقترح نفسه، فلا يبقى الباب مفتوحًا بين التصويتات.
* **الإنشاء مفتوح.** قيمة `instantiate_default_permission` هي `Everybody` منذ المقترح 19، فما إن تخزّن الحوكمة شيفرتك حتى يستطيع أي أحد (أنت منهم) إنشاء عقود منها، ما لم تحمل الشيفرة المخزَّنة إذنًا أضيق.
* **الجسر لا يبلغ إلا العقود المعتمدة.** لا يستطيع جسر `0x0901` استدعاء إلا الأهداف في `bridge_allowed_targets`. وكل هدف مثبَّت على معرّف شيفرة وعلى طول تاريخ شيفرته، فلا يمكن ترحيل العقد إلى شيفرة مختلفة مع إبقاء اعتماده.
* **التنفيذ ذري.** تعمل رسائل المقترح معًا. وإذا فشلت واحدة (مثلًا شيفرة ترفضها السلسلة) فلا تُطبَّق أي منها، ولا يبقى القاطع مفتوحًا.

## ما تحتاج إليه {#needs}

| البند | كيف تحصل عليه |
| --- | --- |
| الملف الثنائي `qorechaind` (Linux) | الإصدار في [download.qore.host](https://download.qore.host). والملف الثنائي المبني من الشجرة العامة للمصدر لا يستطيع توقيع التوقيع الهجين الذي تشترطه السلسلة. |
| حساب على شبكة الاختبار بمفتاح ما بعد كمومي مسجَّل | انظر [التوقيع الهجين](/cli-reference/transaction-commands#hybrid-signing). |
| QOR اختبار للوديعة والرسوم | صنبور شبكة الاختبار. المقترح العادي يحتاج 10 QOR، والمستعجل 50 QOR (الجدول أدناه). |
| Docker، لبناء العقد بالطريقة نفسها التي يبني بها الجميع | [Docker](https://docs.docker.com/get-docker/). |

## الخطوة 1: ابنِ العقد ودوّن بصمته {#build}

ابنِ بمُحسِّن CosmWasm كي يستطيع أي أحد إعادة بناء مصدرك والحصول على البايتات نفسها. بُني عقد الورشة 3 بصورة arm64 على Apple Silicon (جهاز x86 يستخدم الصورة `optimizer` العادية؛ وتعطيان بصمتين مختلفتين، فاذكر في ملخص المقترح أيهما استخدمت):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

يجب أن ترى سطرًا لكل عقد فيه بصمة ست عشرية من 64 حرفًا واسم الملف، مثل `6ebfc32f...5c43c  qday_receipts.wasm`. وهذه البصمة هي **SHA-256 لملف wasm غير المضغوط**، وهي `data_hash` الذي ستعرضه السلسلة لشيفرتك. انسخها؛ فهي تدخل في ملخص المقترح ليتحقق منها المصوّتون.

قبل أن تنفق وديعة، افحص الشيفرة على الحدود في [الغاز وحدود الرفع](/developer-guide/cosmwasm-development#gas-and-limits): ما لا يزيد على 4,096 دالة، وما لا يزيد على 32 MiB مُصرَّفة، ودون تعليمات الفاصلة العائمة.

## الخطوة 2: رمّز الشيفرة للمقترح {#encode}

يحمل المقترح ملف wasm داخل JSON بصيغة base64. اضغطه أولًا (تقبل السلسلة gzip، وهو ما استخدمه المقترح 40: إذ تبدأ شيفرته بـ `H4sI`):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

يجب أن ترى حجمًا بالبايت. وشيفرة `qday-receipts` نحو 99,000 حرف بصيغة base64 لـ gzip. احفظها في ملف، لأنها أطول من أن تُلصق في أمر.

## الخطوة 3: اكتب المقترح {#write}

المقترح ملف JSON فيه `messages` و`metadata` و`deposit` و`title` و`summary` و`expedited`. و`authority` و`sender` في كل رسالة أدناه هما **حساب وحدة الحوكمة**. اقرأه بدل أن تنسخه من هذه الصفحة:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

يجب أن ترى الحساب بالاسم `"name":"gov"`؛ ويبدأ `address` الخاص به بـ `qor1`. سمّه `<GOV_ADDRESS>` أدناه. وفي 22 نوفمبر 2026 كان `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### المقترح A: خزّن الشيفرة وأنشئ العقد {#proposal-a}

هذا شكل المقترح 40 دون رسالة قائمة السماح فيه. والترتيب مهم: افتح القاطع، ثم خزّن، ثم أغلق القاطع، ثم أنشئ.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

كيف تملأ العناصر النائبة:

| العنصر النائب | كيف تحصل عليه |
| --- | --- |
| `<NEXT_CODE_ID>` | آخر معرّف شيفرة زائد واحد. اقرأ الأخير بـ `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. وفي 22 نوفمبر 2026 كان الأخير 865، فالتالي 866. وإذا خزّن مقترح غيرك شيفرة قبلك نال مقترحك معرّفًا أبعد وفشلت رسالة الإنشاء، فيُلغى المقترح كله (ولا يضيع شيء سوى الانتظار). |
| `<BASE64_SALT>` | أي نص قصير مرمَّز بـ base64: `printf 'my-contract-v1' \| base64`. وبه يمكن التنبؤ بعنوان العقد. واستخدم المقترح 40 الملح `qday-receipts-w3`. |
| `msg` | JSON الذي يتوقعه `instantiate` في عقدك. و`{}` لعقد بلا حقول. |
| `admin` | السلسلة الفارغة تعني لا مدير، فلا يستطيع أحد ترحيل العقد. فضّل هذا للعقد الذي سيستدعيه الجسر (انظر [التثبيتات](#pins)). |
| `instantiate_permission` | `Everybody`، أو `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` لتقييد من يجوز له الإنشاء (فعل المقترح 34 ذلك لعقد اختبار). |

لا يلزمك الإنشاء داخل المقترح. احذف الرسالة الأخيرة لتخزّن الشيفرة وحدها، وأنشئ لاحقًا بمعاملة عادية (`tx wasm instantiate`، انظر [دورة حياة العقد](/developer-guide/cosmwasm-development)). وقد خزّن المقترحان 23 و27 الشيفرة بهذه الطريقة.

### المقترح B: ضع العقد على قائمة السماح للأنوية الافتراضية {#proposal-b}

بعد أن يمرّ المقترح A، ابحث عن عنوان العقد واقرأ معاملات الأنوية الافتراضية الحيّة:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

يجب أن ترى عنوان عقدك `qor1...`، وتاريخًا فيه إدخال **واحد** (`INIT`، ومعرّف شيفرتك) ومجموعة المعاملات. و`MsgUpdateParams` لوحدة الأنوية الافتراضية **تستبدل مجموعة المعاملات كلها**، فانسخ كل حقل من الجواب الحي وغيّر شيئين فقط: أضف هدفك إلى `bridge_allowed_targets` وأضف تثبيته إلى `bridge_target_pins`.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

الأرقام أعلاه هي القيم المقروءة في 22 نوفمبر 2026؛ فاستخدم ما تقرؤه حيًّا لا هذه. وقد ترك المقترح 40 الحقل `wasm_congestion_factor_micro`، وهو حقل يظهره الجواب الحي أيضًا؛ فاتبع الجواب الحي وقالب المقترح 40 وقارن النتيجة بالجدول في [مرجع الأنوية الافتراضية](/developer-guide/cross-vm-reference#params) بعد التصويت.

### التثبيتات: ماذا يعني `code_id` و`history_len` {#pins}

| الحقل | المعنى |
| --- | --- |
| `target` | `cosmwasm:` متبوعًا بعنوان العقد، مكتوبًا تمامًا كما في `bridge_allowed_targets`. |
| `code_id` | الشيفرة التي يجب أن يشغّلها العقد كي يستدعيه الجسر. |
| `history_len` | عدد إدخالات تاريخ شيفرة العقد حين تثبّته. النسخة الجديدة لها 1. والعقد المرحَّل مرة واحدة له 2 (في قائمة السماح على شبكة الاختبار عقد واحد كهذا). وأي ترحيل لاحق يغيّر الطول، فلا يعود التثبيت مطابقًا ويرفض الجسر الاستدعاء. |

العقد المدرج في قائمة السماح وله مدير غير الحوكمة يجب أن يكون مثبَّتًا، لأن ذلك المدير يستطيع ترحيله. وأبسط تصميم آمن هو ما فعله المقترح 40: لا مدير، وتثبيت.

### الاثنان في مقترح واحد {#one-proposal}

فعل المقترح 40 كل شيء في مقترح واحد: خزّن الشيفرة، وأنشأها بملح، وثبّت العنوان الذي ينتجه ذلك الملح. وهذا يتطلب معرفة معرّف الشيفرة التالي وعنوان العقد المستقبلي مسبقًا، فيسهل الخطأ فيه. والمقترحان يكلّفان تصويتًا إضافيًا وبضع ساعات؛ فضّلهما ما لم تكن قد اشتققت العنوان فعلًا.

## الخطوة 4: الوديعة ومدة التصويت والعتبات {#params}

اقرأ القواعد الحيّة قبل أن تقدّم:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| القاعدة | مقترح عادي | مقترح مستعجل (`"expedited": true`) |
| --- | --- | --- |
| الحد الأدنى للوديعة | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| فترة الوديعة (لبلوغ الحد الأدنى) | 172,800 ث (يومان) | 172,800 ث (يومان) |
| فترة التصويت | 14,400 ث (4 ساعات) | 3,600 ث (ساعة واحدة) |
| النصاب | 33.4% من الحصة المربوطة | 33.4% من الحصة المربوطة |
| عتبة نعم | 50% من الأصوات المدلى بها | 66.7% من الأصوات المدلى بها |
| عتبة الفيتو | 33.4% | 33.4% |
| الحد الأدنى للوديعة الأولية | لا يوجد | لا يوجد |

قُرئت في 22 نوفمبر 2026. ومن الجواب نفسه أيضًا: التصويت بـ "لا مع فيتو" فوق العتبة يحرق الوديعة (`burn_vote_veto` قيمتها `true`)، والمقترح الذي لا يبلغ النصاب لا تُحرق وديعته، والمقترح المستعجل الذي يفشل في فرز أصواته يستمر مقترحًا عاديًا بالأصوات المدلى بها فعلًا. وكل مقترح قدّمه فريق شبكة الاختبار للعقود حتى الآن كان مستعجلًا؛ أما مقترح المطوّر فينبغي عادةً أن يبقى عاديًا (فوديعة 10 QOR وتصويت أربع ساعات أيسر للتخطيط).

## الخطوة 5: قدّم {#submit}

يجب أن تحمل كل معاملة على مسار Cosmos التوقيع الهجين، فتبني المعاملة أولًا ثم توقّعها بمفتاحك ما بعد الكمومي. والمقترح كبير (الشيفرة داخله)، فأعطه سعة في الغاز: الحد الأدنى للرسم 0.1 uqor لكل وحدة غاز، وبايت المعاملة الواحد يكلّف 10 غاز.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

حدّد `--gas` و`--fees` من تشغيل تجريبي: شغّل `tx pqc cosign` أولًا مع `--dry-run` (يطبع تقديرًا للغاز ولا يرسل شيئًا)، ثم استخدم التقدير زائد 30% قيمةً لـ `<GAS>`، ورسومًا لا تقل عن `<GAS>` مضروبًا في 0.1 uqor قيمةً لـ `<FEES>`. يحتاج التحويل البسيط إلى نحو 300,000 إلى 400,000 وحدة غاز، ويحتاج النشر أو المقترح الذي يحمل شيفرة إلى أكثر من ذلك بكثير.

قياس على شبكة الاختبار: استخدم مقترح بنحو 99 كيلوبايت من الشيفرة المضغوطة (102.6 كيلوبايت من JSON) ما مقداره 14,961,429 وحدة غاز. احسب نحو 150 وحدة غاز لكل بايت من JSON المقترح، وبذلك يحتاج مقترح بحجم 100 كيلوبايت إلى `--gas 20000000 --fees 2000000uqor` على الأقل. واستخدم التصويت نحو 153,400 وحدة غاز: استخدم `--gas 300000 --fees 30000uqor`. تُخزَّن الشيفرة عند انتهاء التصويت ولا تكلّف مقدّم المقترح أي شيء إضافي.

تكتب `--generate-only` المعاملة غير الموقَّعة. وتضيف `tx pqc cosign` التوقيعين وتبثّها؛ وللخلفية انظر [التوقيع الهجين](/cli-reference/transaction-commands#hybrid-signing) و[أوامر gov](/cli-reference/transaction-commands#submit-proposal). يجب أن ترى تجزئة معاملة والرمز 0. وإن رأيت خطأ نفاد الغاز فارفع `--gas` و`--fees` المقابلة (يجب ألا يقل الرسم عن الغاز مضروبًا في 0.1 uqor).

اعثر على معرّف مقترحك، وهو أيضًا الرقم في أحداث المعاملة:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

يجب أن ترى عنوانك وحالة `PROPOSAL_STATUS_VOTING_PERIOD` (بلغت الوديعة التي أرفقتها الحد الأدنى). ومع وديعة أصغر تكون الحالة `PROPOSAL_STATUS_DEPOSIT_PERIOD`؛ ويستطيع أي أحد تكملتها:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## الخطوة 6: صوّت {#vote}

يستطيع أي مُستخدِم للتخزين (staker) التصويت بالحصة التي يملكها. ولن تبلغ محفظة مطوّر واحدة نصاب 33.4%، فأخبر مدقّقي شبكة الاختبار والمفوِّضين بمقترحك (ملخص المقترح هو ما يقرؤونه) واطلب منهم التصويت. والتصويت معاملة موقَّعة هجينًا كأي معاملة أخرى:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

الخيارات هي `yes` و`no` و`abstain` و`no_with_veto` (انظر [الحوكمة](/user-guide/governance)). راقب الفرز والساعة:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

حين ينتهي التصويت تصير الحالة `PROPOSAL_STATUS_PASSED` (عملت الرسائل)، أو `PROPOSAL_STATUS_REJECTED`، أو `PROPOSAL_STATUS_FAILED`. و**Failed** تعني أن التصويت نجح لكن رسالة تعذّر تشغيلها، وعندئذ لا تُطبَّق أي من الرسائل؛ ويقول `failed_reason` السبب. فالمقترح 40 مثلًا أظهر `PASSED` بعد ساعة من تقديمه.

## الخطوة 7: تحقق من الشيفرة على السلسلة {#verify}

قارن الشيفرة التي تحتفظ بها السلسلة بالبصمة التي بنيتها. تعرض السلسلة `data_hash` بأحرف كبيرة؛ وتطبع `sha256sum` أحرفًا صغيرة.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

يجب أن ترى الأحرف الـ 64 نفسها في السطرين. وللتحقق الأقوى، جزّئ البايتات التي تحتفظ بها السلسلة فعلًا:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

طبع هذا `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` للشيفرة 865، وهي البصمة نفسها لبناء المُحسِّن لمصدر الورشة 3. ثم افحص العقد، وبعد المقترح B قائمة السماح:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

يجب أن ترى `code_id` الخاص بك و`admin` فارغًا في الجواب الأول، وهدفك `cosmwasm:qor1...` مع تثبيته (`code_id`، و`history_len` بقيمة `"1"`) في الثاني. وفي 22 نوفمبر 2026 كانت القائمة تحوي أربعة أهداف؛ والرابع هو `qday-receipts` عند `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`، مثبَّتًا على الشيفرة 865.

## الخطوة 8: استدعِه من عقد EVM {#call}

يستدعي EVM الجسر عند `0x0000000000000000000000000000000000000901` بالدالة `executeCrossVMCall(uint8,string,bytes)`: النواة الهدف `1` (Native)، وعنوان عقدك نصًّا، ورسالة JSON بايتات. ويرى جانب Native حساب `qor1...` الخاص بعقد EVM المستدعي مرسلًا، وأي تراجع (revert) في أي جانب يلغي الجانبين.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

ينطبق شرطان، كلاهما مشروح في [مرجع الأنوية الافتراضية](/developer-guide/cross-vm-reference#evm-to-wasm): يجب أن يكون الهدف على قائمة السماح (وأن يزال يشغّل شيفرته المثبَّتة)، ويحتاج الحساب الذي يرسل المعاملة إلى [نافذة تفويض EVM](/developer-guide/evm-window-reference) مفتوحة تذكر `allowed_targets` فيها `0x...0901`. ولمثال كامل مُختبَر فيه متجر Solidity وعقد `qday-receipts` اتبع [الورشة 3](/build-before-qday/workshop-3#part-2).

## استكشاف الأخطاء {#troubleshooting}

| ما تراه | السبب المرجّح والإصلاح |
| --- | --- |
| `tx wasm store` يفشل أو لا يصل أبدًا | هذا متوقع. لا تستطيع الحسابات الرفع على شبكة الاختبار؛ فقاطع الدائرة و`code_upload_access` كلاهما يمنع ذلك. استخدم مقترحًا. |
| حالة المقترح `PROPOSAL_STATUS_FAILED` | نجح التصويت لكن فشلت رسالة، فلم يُطبَّق شيء. اقرأ `failed_reason` في `GET /cosmos/gov/v1/proposals/<id>`. والسبب الشائع `code_id` خاطئ في رسالة الإنشاء. |
| `PROPOSAL_STATUS_REJECTED` | أصوات نعم غير كافية أو لا نصاب. قدّم من جديد بملخص أوضح، أو اطلب من المدقّقين التصويت. |
| تبقى الحالة `PROPOSAL_STATUS_DEPOSIT_PERIOD` | مجموع الوديعة دون الحد الأدنى (10 QOR للعادي، 50 QOR للمستعجل). أضف المزيد بـ `tx gov deposit` خلال يومين. |
| يفشل التقديم بالرمز 20 في فضاء `pqc` | لم تحمل المعاملة توقيعًا هجينًا. استخدم `--generate-only` و`tx pqc cosign`. |
| يفشل التقديم بنفاد الغاز | المقترح كبير. ارفع `--gas` وأبقِ الرسم لا يقل عن الغاز مضروبًا في 0.1 uqor. |
| تختلف البصمة عن `data_hash` | بنيت على نوع جهاز أو إصدار مُحسِّن مختلف. أعد البناء بالصورة المسمّاة في ملخص المقترح (صورتا arm64 وx86 تعطيان بايتات مختلفة). |
| يتراجع استدعاء EVM بـ `cross-VM bridge call refused: target ... is not allowlisted` | العقد ليس في `bridge_allowed_targets`، أو تغيّرت شيفرته منذ تثبيته. قارن المعاملات الحيّة بتثبيتك. |
| يُرفض استدعاء EVM قبل أن يبلغ الجسر | لا نافذة EVM مفتوحة تذكر `0x0901`. افتح واحدة أولًا. |
| `MsgCrossVMCall` مرفوضة | قد يكون الاستدعاء متوقفًا على قائمة قاطع الدائرة. اقرأ `GET /cosmos/circuit/v1/disable_list`. |
| يفشل المقترح B | مجموعة المعاملات ناقصة أو تثبيت خاطئ. تحقق من وجود كل حقل من الجواب الحي ومن أن `history_len` يساوي عدد إدخالات التاريخ. |

## صفحات ذات صلة {#related}

* [الحوكمة](/user-guide/governance) للتصويت والودائع وأنواع المقترحات.
* [تطوير QoreChain Native](/developer-guide/cosmwasm-development) لدورة حياة العقد والاستعلامات.
* [أوامر المعاملات](/cli-reference/transaction-commands#submit-proposal) لعلامات `gov` و`pqc cosign` الدقيقة.
* [مرجع الأنوية الافتراضية](/developer-guide/cross-vm-reference) للمعاملات والطابور وأمثلة الاستدعاء.
* [الورشة 3](/build-before-qday/workshop-3) لمثال عملي عبر الأنوية الافتراضية.
