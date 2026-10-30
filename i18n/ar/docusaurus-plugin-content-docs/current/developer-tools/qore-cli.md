---
slug: /developer-tools/qore-cli
title: أداة سطر أوامر QoreChain (qore)
sidebar_label: أداة سطر أوامر QoreChain
sidebar_position: 24
---

# أداة سطر أوامر QoreChain (`@qorechain/qore-cli`، الأمر `qore`)

تقرأ `qore` بيانات QoreChain من الطرفية. وهي موجّهة للمطورين والمشغّلين والسكربتات التي تريد البحث عن معاملة، أو التحقق من أن توقيعها ما بعد الكمّي يتحقق، أو قراءة حساب أو مجموعة المدققين، أو محاكاة معاملة، أو تجهيز تحويل غير موقّع، دون كتابة شيفرة. كل أمر يشغّل أداة واحدة من [خادم MCP لـ QoreChain](/developer-tools/mcp)، وتطبع `--json` بالضبط ملف JSON الذي تعيده الأداة، فيرى السكربت ووكيل الذكاء الاصطناعي البيانات نفسها.

لا يُوقَّع شيء ولا يُبَثّ شيء أبدًا، ولا تحتفظ الأداة بمفاتيح. الإصدار **0.1.0**، نُشر في 27 أكتوبر 2026، بترخيص Apache-2.0، ويحتاج إلى Node.js 20 أو أحدث.

## الابتكارات {#innovations}

- **JSON مطابق لمخرجات أداة MCP.** تطبع `qore <command> --json` الكائن نفسه، بأسماء الحقول نفسها، الذي تعيده أداة MCP المقابلة. وبدون `--json` يُطبع الكائن نفسه كنص مقروء. فما كُتب مقابل أحدهما يعمل مقابل الآخر.
- **حالة التوقيع ما بعد الكمّي من الطرفية.** تبلّغ `qore pq status <txhash>` عمّا إذا كانت المعاملة تحمل طبقة هجينة واحدة بالضبط وعمّا إذا كان توقيع ML-DSA-87 (FIPS 204) يتحقق مقابل المفتاح الذي سجّله الموقّع على السلسلة، لصيغتي sign-bytes v1 وv2. وتبلّغ `qore pq status <address>` عن المفتاح المسجّل ونوعه وإثبات الحيازة ونافذة تفويض EVM.
- **خط أنابيب لتحويل لا يحتاج إلى مفتاح.** يكتب `prepare-transfer --json` تحويلًا غير موقّع ويقبل `simulate` ذلك الملف، فتستطيع بناء تحويل وفحصه وتسعيره من سكربت شِل. وتبقى خطوة التوقيع في محفظتك أو في [QoreSign](/qoresign/overview).
- **رموز خروج ثابتة.** 0 نجاح، و1 خطأ أداة يحمل رمزًا ثابتًا مثل `NOT_FOUND` أو `INVALID_INPUT`، و2 خطأ استخدام، فيستطيع السكربت التفرّع بحسب النتيجة.

## فيمَ تُستخدم {#use-cases}

1. **التحقق من أن معاملة حملت التوقيع الهجين.** مباشرة بعد البثّ، تبلّغ `qore pq status <hash>` عن فئة التوقيع وعمّا إذا كانت طبقة ML-DSA-87 تتحقق مقابل المفتاح المسجّل للموقّع.
2. **الاطلاع على حالة السلسلة من الطرفية.** تجيب `qore block` و`qore account <address>` و`qore validators` و`qore search <query>` عن سؤال سريع دون فتح مستكشف أو كتابة شيفرة.
3. **تسعير تحويل وفحصه قبل توقيعه.** يكتب `prepare-transfer` تحويلًا غير موقّع، ويعرض `simulate` الغاز وتغيّرات الرصيد وأي رفض مفكوك الترميز، وتعطي `estimate-fee` الرسم المقترح. وتوقّع في محفظتك أو بواسطة [QoreSign](/qoresign/overview).
4. **قراءة العقود من سكربت أو مهمة CI.** يفحص الأمر `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq` رصيد رمز أو دالة عرض في عقد ويحلّل النتيجة.
5. **سكربتات الشِل والمراقبة.** مخرجات `--json` مع رموز الخروج الثابتة (0 و1 و2) تتيح للسكربت التفرّع بحسب النتيجة. وJSON نفسه هو ما يعيده [خادم MCP](/developer-tools/mcp)، فيرى عميل الذكاء الاصطناعي والسكربت البيانات نفسها.

## كيف تعمل {#how-it-works}

يشغّل كل أمر `qore` أداة واحدة من النواة المشتركة لخادم MCP، داخل عمليتك، مقابل نقاط REST وRPC وEVM JSON-RPC العامة للشبكة التي تختارها. تُبنى الاستجابات حقلًا حقلًا من جواب السلسلة، ولا يُطبع نص أخطاء المنبع أبدًا، ويُحوَّل الإخفاق إلى واحد من سبعة رموز أخطاء ثابتة (`NOT_FOUND` و`INVALID_INPUT` و`UPSTREAM_UNAVAILABLE` و`NOT_AVAILABLE_ON_CHAIN` و`RATE_LIMITED` و`UNAUTHORIZED` و`INTERNAL_ERROR`). لكل طلب إلى المنبع مهلة 10 ثوانٍ (يغيّرها `--timeout`) وحد استجابة 4 MiB وبلا إعادة محاولة. وتعمل فحوصات التوقيع الهجين محليًا بواسطة [QoreSign](/qoresign/overview). لا يُوقَّع شيء ولا يُرسَل شيء. تفاصيل كل أداة في [صفحة خادم MCP](/developer-tools/mcp#how-it-works).

## كيفية الاستخدام {#how-to-use}

شغّلها دون تثبيت، أو ثبّتها مرة واحدة:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

الأوامر للقراءة فقط وتستخدم الشبكة التجريبية افتراضيًا:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

المبالغ تُكتب `1.5` أو `1.5 QOR` (QOR، حتى 6 منازل عشرية) أو `1500000uqor`. ويمكن أن تكون العناوين `qor1...` أو `0x...`.

### سكربت يفحص حسابًا ومعاملة {#script}

في المستودع سكربت كامل (`examples/cli/pq-check.sh`) يفعل ذلك. وهذا لبّه:

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

مثال على مخرجات `qore block --network mainnet --json` (27 أكتوبر 2026):

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### الأوامر {#commands}

| الأمر | أداة MCP | ماذا يفعل |
|---|---|---|
| `chain`, `features` | `get_chain_info` | معرّفات السلسلة وآخر كتلة والحد الأدنى لسعر الغاز وإصدار sign-bytes ومفاتيح ميزات البروتوكول وprecompiles الـ EVM النشطة |
| `block [height]` | `get_block` | كتلة واحدة، الأخيرة افتراضيًا |
| `tx get <hash>` | `get_transaction` | معاملة بتجزئتها الأصلية أو بتجزئة EVM: الحالة والرسم والرسائل والموقّعون وفئة التوقيع |
| `account <address>` | `get_address_info` | الأرصدة وحالة الحساب والمبلغ المودَع في staking وصيغتا العنوان |
| `pq status <address\|txhash>` | `get_pq_status` | حالة مفتاح ML-DSA-87 لعنوان، أو فحص الطبقة الهجينة لمعاملة |
| `validators [--status S] [--limit N]` | `get_validators` | المدققون بحسب الحصة؛ الحالة هي `bonded` (الافتراضي) أو `unbonding` أو `unbonded` أو `all`؛ والحد حتى 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | معاملات طبقات التخزين ومجمّعها، وأقفال حامل واحد (سلسلة v3.2.4 وما بعدها) |
| `search <query>` | `search` | يكشف ارتفاع كتلة أو تجزئة أو عنوانًا أو مدققًا ويقرأه |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | استدعاء EVM `eth_call` فقط، مع ترميز وفك ترميز اختياريين |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | الغاز وتغيّرات الرصيد ورفض مفكوك الترميز لمعاملة مرمَّزة |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | حد الغاز المقترح والرسم، شاملًا طبقة ML-DSA-87 |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | تحويل غير موقّع لتوقّعه محفظتك |

الخيارات العامة: `--network testnet|mainnet` (الافتراضي `testnet`)، و`--json`، و`--timeout <ms>` (مهلة المنبع، الافتراضي 10000)، و`--help` و`--version`. مخططات الأدوات في [مرجع أدوات MCP](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### ما الذي شُغِّل {#what-was-run}

في 27 أكتوبر 2026 ثُبّت `@qorechain/qore-cli` 0.1.0 و`@qorechain/mcp` 0.1.0 من npm في مشروع فارغ، وشُغّلت هذه الأوامر للقراءة فقط مقابل النقاط العامة:

- طبعت `qore --version` القيمة `0.1.0`، وسردت `qore --help` الأوامر أعلاه.
- طبعت `qore chain` (الشبكة التجريبية) السلسلة `qorechain-diana` ومعرّف سلسلة EVM 9800 والحد الأدنى لسعر الغاز 0.1 وsign-bytes `v2`؛ وطبعت `qore chain --network mainnet` السلسلة `qorechain-vladi` ومعرّف سلسلة EVM 9801 وsign-bytes `v2`.
- أعادت `qore block` و`qore validators --limit 3 --json` و`qore staking-tiers --json` و`qore search 8981000` و`qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` و`qore read-contract --to 0x...0a02 --function "x()"` بياناتها.
- طبعت `qore pq status F642F59F...2152` الفئة `pqc` و`has_exactly_one_pqc_layer: true` و`verified: true` مع sign-bytes `v2`.
- كتبت `qore prepare-transfer --from A --to A --amount 1.5 --json` تحويلًا غير موقّع (حد الغاز 171698، الرسم 17170 uqor)، وأعادت `qore simulate` على ذلك الملف `ok: true`، وأعادت `qore estimate-fee` رسمًا مطابقًا. كان المرسل والمستلم العنوان نفسه، فأضافت الأداة تحذيرًا، ولم يُوقَّع شيء ولم يُرسَل شيء.
- طبعت `qore tx get zzz` القيمة `error [INVALID_INPUT]` وخرجت بالرمز 1؛ وخرجت `qore bogus` بالرمز 2.

## كيفية الوصول {#how-to-access}

- **الشبكات.** الشبكة التجريبية `qorechain-diana` (الافتراضية) والشبكة الرئيسية `qorechain-vladi` بالخيار `--network mainnet`.
- **النقاط.** تقرأ الأداة نقاط REST وRPC وEVM JSON-RPC العامة: `https://api-testnet.qore.host` و`https://rpc-testnet.qore.host` و`https://evm-testnet.qore.host` على الشبكة التجريبية، و`https://api.qore.host` و`https://rpc.qore.host` و`https://evm.qore.host` على الشبكة الرئيسية.
- **الحساب والمفاتيح.** لا شيء. لا تسجيل دخول ولا مفتاح API ولا ملف إعداد؛ ومفتاح نقطة MCP المستضافة لا ينطبق على الأداة.
- **المتطلبات.** Node.js 20 أو أحدث وHTTPS صادر.
- **التكلفة.** مجانية. ولإرسال التحويل الذي جهّزته تدفع رسم الشبكة (الحد الأدنى 0.1 uqor لكل وحدة غاز) من محفظتك أنت؛ والأداة لا تنفّذ تلك الخطوة.

## ملاحظات أمنية {#security}

* **لا يوجد مسار شيفرة للتوقيع.** لا تحتفظ الأداة بمفاتيح، ولا توقّع شيئًا، ولا تبثّ شيئًا؛ ويعيد `prepare-transfer` مستندًا غير موقّع.
* **تُرفض الأسرار.** الإدخال الذي يشبه عبارة استرداد (12 كلمة BIP-39 متتالية أو أكثر) أو مفتاحًا خاصًا مجرّدًا من 32 بايت يُرفض بالرمز `INVALID_INPUT` قبل إجراء أي طلب. ومع ذلك لا تضع واحدًا في سطر أوامر: سجل الشِل يحتفظ به، وتطلب رسالة الخطأ منك معاملة ذلك السر على أنه مكشوف.
* **البيانات العامة فقط هي التي تغادر جهازك:** العناوين والتجزئات والمعاملات المرمَّزة التي تمرّرها، وتُرسل إلى نقاط QoreChain العامة.
* **الشبكة الرئيسية صريحة.** تذهب الاستدعاءات إلى الشبكة التجريبية ما لم تمرّر `--network mainnet`، والتحويل المجهّز للشبكة الرئيسية يحمل تحذيرًا.
* **المذكرات عامة ودائمة.** لا تضع سرًا في `--memo` أبدًا.
* أبلغ عن الثغرات بشكل خاص إلى security@qore.network، وليس أبدًا في بلاغ عام.

## أين نُشرت {#where-published}

| السجل | الحزمة | الإصدار | التثبيت | ملاحظات |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | الملف التنفيذي `qore`. Node.js 20 أو أحدث |

المصدر: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp)، المجلد `packages/cli` (عام، Apache-2.0، فُحص في 27 أكتوبر 2026). لا توجد نسخة Python أو Rust من الأداة؛ والخادم نفسه موجود أيضًا على PyPI باسم [`qorechain-mcp`](/developer-tools/mcp#where-published).

## الحدود والمشكلات المعروفة {#limits}

- **للقراءة فقط.** لا يوقّع أي أمر ولا يبثّ. يبني `prepare-transfer` رسالة `MsgSend` من uqor على المسار الأصلي فقط؛ ولا يجهّز معاملات EVM أو SVM أو staking أو الحوكمة أو العقود. أما `simulate` و`estimate-fee` فتقبلان أي معاملة مرمَّزة على المسار الأصلي.
- **لا صنبور ولا سرد لحاملي الرموز.** هاتان الأداتان في MCP ليس لهما أمر في سطر الأوامر. تأتي QOR للشبكة التجريبية من [الصنبور](/dashboard/faucet).
- **تاريخ الشبكة التجريبية مقتطع.** كتلة أو معاملة قديمة من الشبكة التجريبية تعيد `NOT_FOUND` مع أدنى ارتفاع متاح؛ وكانت الشبكة الرئيسية تخدم من الارتفاع 1 وقت الفحص.
- **أرقام الغاز تتبع إصدار السلسلة.** طبّقت الشبكتان v3.2.5، لذا تشمل المحاكاة تكلفة التحقق من ML-DSA-87؛ أما مقابل عقدة أقدم فيحمل حد الغاز المقترح هامشًا.
- **حدود المخرجات.** 100 تجزئة معاملة كحد أقصى لكل كتلة، و50 رسالة لكل معاملة، و100 رصيد لكل حساب، و200 مدقق لكل استدعاء. لكل طلب مهلة افتراضية 10 ثوانٍ وحد استجابة 4 MiB دون إعادة محاولة.
- **تُرفض الأسرار.** الإدخال الذي يشبه عبارة استرداد أو مفتاحًا خاصًا مجرّدًا يُرفض بالرمز `INVALID_INPUT`. لا تضع واحدًا في سطر أوامر: سجل الشِل يحتفظ به.
- **precompiles ما بعد الكمّي في EVM** `0x...0A01` و`0x...0A02` نشطان على الشبكة التجريبية فقط.
- **الإصدار الأول.** 0.1.0: قد تتغير أسماء الأوامر وخياراتها في إصدارات لاحقة. استخدم `--json` ورموز الخروج في السكربتات، وثبّت الإصدار.

## صفحات ذات صلة {#related}

* [خادم MCP لـ QoreChain](/developer-tools/mcp): الأدوات نفسها لعملاء الذكاء الاصطناعي، مع نقطة نهاية مستضافة.
* [QoreSign](/qoresign/overview): وقّع التحويل الذي يكتبه `prepare-transfer`.
* [مرجع CLI الخاص بـ SDK](/sdk/reference/cli): سطر الأوامر الخاص بـ SDK.
* [الصنبور](/dashboard/faucet): QOR للشبكة التجريبية.
* [نظرة عامة على حزم المطورين](/developer-tools/overview).
