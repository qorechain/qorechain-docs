---
slug: /sdk/install
title: التثبيت
sidebar_label: التثبيت
sidebar_position: 2
---

# التثبيت

ثبّت حزمة SDK الخاصة بلغتك. إن النواة المكتوبة بلغة TypeScript‏ (`@qorechain/sdk`)،
ومحوّلا EVM وSVM‏ (`@qorechain/evm` و`@qorechain/svm`)، وعدّة React‏
(`@qorechain/react`)، وعملاء Python وGo وRust وJava جميعها
**منشورة** في سجلّاتها مع تكافؤ كامل مع السلسلة الأصلية (رسائل منمّطة الأنواع،
والاستعلامات، ودورة حياة المعاملة، ومعاملات PQC الهجينة، واشتراكات
WebSocket). خط الإصدارات الحالي هو **0.10**، ونُشر في 25 و26
أكتوبر 2026 (جرى التحقق منه مقابل كل سجل في 27 أكتوبر 2026):

| السجل | الحزمة | الإصدار |
| --- | --- | --- |
| npm | `@qorechain/sdk` و`@qorechain/react` و`create-qorechain-dapp` | 0.10.0 |
| PyPI | `qorechain-sdk` (الاستيراد `qorsdk`) | 0.10.0 |
| crates.io | `qorechain-sdk` (الاستيراد `qorechain`) | 0.10.0 |
| وكيل وحدات Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 (عميل Java عاد متوافقًا مع اللغات الأخرى؛ وكان 0.9.1 تحديثًا خاصًا بـ Java فقط) |

اختر لغتك أدناه.

## ملاحظات الترقية {#upgrade}

:::danger استخدم SDK 0.8.1 أو أحدث على الشبكات الحيّة
تتحقّق الشبكتان العامتان من صيغة **sign-bytes الهجينة v2** (الموسومة بالنطاق
والمرتبطة بمعرّف السلسلة) وترفضان الصيغة القديمة بالرمز `pqc` رقم 21.
كل إصدار من الـ SDK قبل **0.8.0** يوقّع الصيغة القديمة، أمّا **0.8.0** فتبحث عن
التحوّل تحت اسم واحد فقط من اسمَي الترقية اللذين استخدمتهما الشبكتان (سجّلته
الشبكة الرئيسية باسم `v3.2.0`، والشبكة التجريبية باسم `v3.1.98` ثم لاحقًا `v3.2.0`)،
ولذلك توقّع الصيغة الخاطئة على الشبكة الرئيسية. استخدم **0.10.0** (أو **0.8.1** على
الأقل) في كل لغة؛ ويلزم **0.8.2 أو أحدث** لفتح
[نافذة تفويض EVM](/sdk/guides/evm#evm-window). تقبل البُناة الهجينة خيار
`signBytesVersion` (`"auto"` | `"v1"` | `"v2"`)؛ و`"auto"` يسأل الشبكة
ولذلك يحتاج إلى نقطة نهاية REST (`rest`) على
`qorechain-vladi` / `qorechain-diana`: فهو يرمي خطأً بدلًا من التخمين. انظر
[أي صيغة لبايتات التوقيع؟](/sdk/concepts/accounts-pqc#sign-bytes-versions).
لم تتغير الصيغة في إصدار السلسلة v3.2.3 ولا v3.2.4 (يعمل v3.2.4 على الشبكة التجريبية منذ 19 أكتوبر 2026 وعلى الشبكة الرئيسية منذ 23 أكتوبر 2026):
فـ `"auto"` يحلّ إلى v2 على الشبكتين، لأن كلتيهما طبّقت الترقية التي انتقلت إلى هذه الصيغة.
:::

## ما الذي يضيفه الإصدار 0.10.0 {#whats-new-0100}

الإصدار SDK 0.10.0 هو إصدار العميل للسلسلة **v3.2.4**، التي طبّقتها الشبكة الرئيسية عند
الارتفاع 3,742,566 في 23 أكتوبر 2026 (وطبّقتها الشبكة التجريبية عند الارتفاع 8,337,253
في 19 أكتوبر). لم تتغير صيغة التوقيع ولا العناوين ولا المنازل العشرية ولا الـ memo
ولا الرسوم، وتبقى المعاملة المبنية بالإصدار 0.9.0 صالحة. جرى التحقق من الإصدار في
كل لغة بمعاملات حقيقية على الشبكة التجريبية. وليس فيه بُناة لأي شيء استُحدث بعد
v3.2.4. وقد انتقلت الشبكة التجريبية إلى v3.2.6 (طُبّق v3.2.5 وv3.2.6 عليها في 26 و27
أكتوبر 2026)؛ وسيطبّق مقترح حوكمة الشبكة الرئيسية 14 الإصدار v3.2.5 عند الارتفاع 3,906,833
وقت كتابة هذا النص، وسيُوثَّق ما يضيفه ذلك الإصدار عندما تطبّقه الشبكة الرئيسية. الجديد
في 0.10.0:

| المجال | في 0.10.0 |
| --- | --- |
| طبقات الرهن (`x/stakingtier`) | الملحّنات `lockDelegation` (بفحوص السلسلة نفسها: مدة 3 أو 6 أو 12 شهرًا ومبلغ موجب صحيح) و`unlockEarly` و`claimBonus` و`updateParams`؛ وقراءات لمعاملات الوحدة وأقفال الحامل وصندوق المكافأة (`fetchStakingTierParams` و`fetchStakingLocks` و`fetchStakingTierPool`)؛ ورموز أخطاء الوحدة. وما تفعله الوحدة موصوف في [التفويض والحصص](/user-guide/staking-and-delegation) |
| nonce الموثِّق | تقرأ `fetchAuthNonce({ rest, address, pubkey })` التسلسل الذي يجب أن يوقّعه مفتاح مرتبط لاحقًا في `MsgExecuteEVM` / `MsgExecuteCosmos` من `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`، بدلًا من تتبّعه يدويًا. تقدّم الشبكتان المسار؛ أما وحدة `abstractaccount` نفسها فمطفأة على الشبكة الرئيسية (ومفعَّلة على شبكة الاختبار)، لذا يُرفض الإنفاق على الشبكة الرئيسية قبل فحص أي nonce |
| مفاتيح تبديل ميزات البروتوكول | تقرأ `fetchProtocolFeatures` و`isProtocolFeatureEnabled` أي قواعد إجماع تفرضها الشبكة، بالاسم، من `/qorechain/pqc/v1/protocol_features` (تقدّمه الشبكتان). والشبكة الأقدم من v3.2.4 لا تقدّم المسار؛ استخدم `isUpgradeApplied` هناك |
| `possessionProven` | تبيّن حالة PQC ما إذا سُجّل مفتاح الحساب بإثبات حيازة |
| `ibcTimeoutTimestamp(seconds)` | مهلة IBC مطلقة بالوحدة التي تأخذها `MsgTransfer` (نانوثانية Unix). مهل IBC أوقات مطلقة؛ وحزم IBC v2 تأخذ ثواني Unix مطلقة، وتُرفض القيمة النسبية هناك بعد اقتطاع الرسوم. لا توجد قناة IBC مفتوحة على الشبكة الرئيسية (جرى التحقق في 27 أكتوبر 2026) |
| ثابت الترقية والـ protos | ‏`CHAIN_UPGRADE_V3_2_4`؛ وتعريفات protobuf متزامنة مع السلسلة v3.2.4 (حقول جديدة في تسجيل مُصدِّق الجسر والعقدة الخفيفة واستعلامات الـ rollup) |
| `ensurePqcRegistered` | كانت تعدّ حالةً بلا مفتاح عام مطابقةً؛ وهي الآن تقرأ المفتاح عبر `rest` وتقارنه. وإذا لم يتوفر مصدر لقراءته، تُبلغ النتيجة `keyVerified: false` بدلًا من الادعاء بأن المفتاح للمستدعي |
| الرفض أثناء محاكاة الرسوم | الرفض الذي تعيده السلسلة نصًا فقط (مثل "no bonus to claim") يُسمّى الآن من أوصاف الأخطاء المسجَّلة في السلسلة في كل لغة: `decodeTxError` (TypeScript) و`SimulationRefusedError` (Python) و`tx.DecodeRefusalText` (Go) و`tx::decode_refusal_text` (Rust) و`TxError.decode` (Java) |

انتقل `@qorechain/react` و`create-qorechain-dapp` إلى 0.10.0 معه (تعتمد العدّة على
`@qorechain/sdk` ‏`^0.10.0`، وكذلك قوالب أداة التهيئة).

## ما الذي أضافه الإصدار 0.9.0 {#whats-new-090}

كان الإصدار SDK 0.9.0 إصدار العميل للسلسلة **v3.2.2** و**v3.2.3** (طبّقتهما الشبكة
الرئيسية عند الارتفاعين 3,556,788 و3,662,051؛ وتعمل الشبكة الرئيسية بالإصدار v3.2.4 منذ 23 أكتوبر 2026 عند الارتفاع 3,742,566، وتعمل الشبكة التجريبية بالإصدار v3.2.4 أو أحدث منذ 19 أكتوبر 2026).
لم تتغير صيغة التوقيع ولا العناوين ولا المنازل العشرية ولا الـ memo ولا الرسوم، لذا
فصيغة sign-bytes الهجينة v2 التي يوقّعها 0.8.1 وما بعده لا تزال الصيغة الصحيحة.
الجديد:

| المجال | في 0.9.0 (وما بعده) |
| --- | --- |
| `TxClient` الهجين (TypeScript) | مرّر زوج مفاتيح الحساب: `client.connectTx(signer, { pqcKeypair })` أو `TxClient.connect({ …, pqcKeypair, rest })`. عندئذٍ تُوقَّع كل معاملة توقيعًا هجينًا ويحاكي `fee: "auto"` المعاملة الهجينة نفسها؛ أما تسجيل المفتاح المجرّد فيبقى كلاسيكيًا (مسار التهيئة الأولية في السلسلة). تستخدمه `bankSend` وعملاء SDK الخاصون بـ rollup وmultilayer وcross-VM. وبدون زوج مفاتيح لا يتغير شيء |
| مفتاح PQC قابل للاسترداد | `derivePqcCanonical(address, mnemonic)` ومكافئاتها في كل لغة (انظر [التوقيع الهجين](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | تقرأ حالة المفتاح عبر REST أولًا (`rest`)، وترفض التسجيل عندما لا تستطيع التحديد، وترمي `PqcKeyMismatchError` عندما يحمل الحساب مفتاحًا مختلفًا بالفعل، وتعدّ رفض السلسلة بعبارة «مسجَّل بالفعل» نجاحًا. ابتداءً من السلسلة v3.2.3 توقّع **إثبات الحيازة** وترفقه بنفسها؛ وقبل v3.2.3 تترك الحقل فارغًا |
| نوافذ EVM المحدّدة النطاق | يقبل `openEvmWindowMsg` الوسيطين `nativeOnly` و`allowedTargets` (16 كحد أقصى، دون تكرار)؛ وتقرأ `fetchEvmWindow` كليهما (انظر [دليل EVM](/sdk/guides/evm#evm-window)) |
| موافقة EIP-7702 | `authorizeEvmDelegationMsg` و`clearEvmDelegationMsg` و`fetchEvmDelegationConsent` و`evmDelegationTupleNonce` و`classifyEvmDelegationRejection` |
| سلامة المفاتيح | ترفض بُناة التسجيل `classical_only` والمفتاح الفارغ ومفتاح ML-DSA-87 المنحلّ، وهي أمور ترفضها السلسلة ابتداءً من v3.2.3. تُصدَّر `signProofOfPossession` / `verifyProofOfPossession`؛ وترسل `migratePqcKeyHybrid` الرسالة `MsgMigratePQCKey` الموقَّعة توقيعًا هجينًا التي تحتاجها الحسابات ذات المفاتيح ابتداءً من v3.2.3 |
| ملخّص الحساب المجرَّد v2 | `evmAuthSignBytesV2` (يربط حدّ غاز الاستدعاء) و`resolveEvmAuthDigestVersion`. وحدة `abstractaccount` معطَّلة على الشبكة الرئيسية (ومفعَّلة على شبكة الاختبار)، لذا هذا للرجوع فقط على الشبكة الرئيسية |
| اكتشاف الترقية | `isUpgradeApplied` و`requireUpgradeApplied`: لا تُضبط الحقول الاختيارية الجديدة إلا بعد أن يُبلغ `applied_plan` عن الإصدار، لأن العقدة التي لم تطبّق إصدارًا ترفض المعاملة بأكملها عند ضبط أحد الحقول الجديدة لذلك الإصدار |
| فكّ ترميز الأخطاء | يحتفظ الفشل داخل كتلة بالـ codespace الخاص به (مثل `pqc` 231 لا `sdk_231`)؛ وتُفكَّك `rate_limited` ورموز التفويض؛ وتقرأ `decodeTxError` سجلَّ الخطأ المُطلَق أو رسالته |
| قواعد الإنفاق | تعمل `validateSpendingRules` داخل بُناة `MsgUpdateSpendingRules` وترفض قاعدة لا تقيّد شيئًا |
| إصلاحات | مسار حساب PQC هو المفرد `/qorechain/pqc/v1/account/{address}` في كل SDK (وفي `client.rest.getPqcAccount` و`isPqcRegistered` و`getPqcStatus` عند تمرير العميل المركَّب)؛ ويطابق `VERSION` المُصدَّر الحزمة؛ ويتوقف عميلا Go وRust اللذان ينشئهما الـ SDK عند انتهاء المهلة بدل التعليق؛ وتعتمد قوالب `create-qorechain-dapp` على الإصدار الذي تُشحن معه |

الاشتقاق القديم لـ PQC للمفاتيح الجديدة (`derivePqcLegacy`، `"bridge"`) مهجور:
فهو غير مرتبط بالحساب، لذا ستعطي عبارة استذكارية واحدة مفتاحًا واحدًا لكل
حساب. ترفضه أدوات التدوير المساعدة بوصفه المفتاح **الجديد**؛ أما الاسترداد من
مفتاح قديم قائم أو التدوير بعيدًا عنه فما زال يعمل.

## الإصدارات السابقة للإصدار 0.9.0 {#before-090}

إذا كنت على 0.8.x فهو لا يزال يوقّع الصيغة التي تتحقق منها الشبكتان ويعمل على
الشبكة الرئيسية والشبكة التجريبية. هذه هي الحدود التي أزالها 0.9.0،
وبعضها يكلّف رسومًا إن لم تعرفها:

| الإصدار السابق للإصدار 0.9.0 | الحل البديل |
| --- | --- |
| لا توجد بُناة لإثبات الحيازة ولا للنوافذ المحدّدة النطاق ولا لموافقة EIP-7702 | استخدم `qorechaind tx pqc register-key-v2 … --pqc-key <name>`، و`open-evm-window --native-only` / `--allowed-targets`، و`authorize-evm-delegation` / `clear-evm-delegation` (انظر [نافذة تفويض EVM](/getting-started/first-transaction#evm-window)، [تفويضات EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| كانت `ensurePqcRegistered` دون `status` تبثّ التسجيل دون تحقق، وتُبلغ عن النجاح عندما يكون مفتاح مختلف مسجَّلًا | يُرفض التسجيل الثاني لحساب يحمل مفتاحًا بالفعل **بعد اقتطاع الرسوم**. اقرأ `GET /qorechain/pqc/v1/account/{address}` أولًا ومرّر `status: { registered: found }` |
| `client.rest.getPqcAccount` و`isPqcRegistered` و`getPqcStatus` | كانت تستدعي مسارًا بصيغة الجمع `/accounts/` أو مساحة الأسماء `qor_`، وهما لا تخدمهما نقاط النهاية العامة (HTTP 501، `-32601`). اقرأ مسار REST بصيغة المفرد أعلاه |
| كانت `TxClient` / `bankSend` وعملاء rollup وmultilayer وcross-VM توقّع توقيعًا كلاسيكيًا فقط | ترفض الشبكتان ذلك لأي حساب له مفتاح. أرسل عبر `signAndBroadcastHybrid` |
| فقدت المعاملات الفاشلة داخل الكتلة الـ codespace الخاص بها | اقرأ المعاملة من `GET /cosmos/tx/v1beta1/txs/{hash}` |
| كان الثابت المُصدَّر `VERSION` في 0.8.3 يُبلغ عن `0.8.0` | اقرأ الإصدار المثبَّت من `package.json` |
| ثبّت `create-qorechain-dapp` 0.8.0 الحزمتين `@qorechain/sdk` / `@qorechain/evm` على `^0.3.0` (علامة الإقحام caret على إصدار 0.x تبقى داخل 0.3) | شغّل `npm i @qorechain/sdk@latest` بعد التهيئة |
| كان `@qorechain/react` 0.8.x يترك حالة المفتاح المسجَّل غير قابلة للقراءة على نقاط النهاية العامة | استخدم `@qorechain/react` 0.9.0 أو أحدث |

:::caution إصلاحات أقدم
أصلح إصدار SDK **0.6.1** خللًا حرجًا على مستوى الإجماع: كان امتداد جسم المعاملة
`/qorechain.pqc.v1.PQCHybridSignature` يُسلسل بصيغة JSON
داخل `Any.value` **وترفضه السلسلة عند CheckTx**. المعاملات الهجينة (PQC +
كلاسيكية) المبنية بإصدار SDK ‏≤ 0.6.0 تُرفض على السلسلة. وقد أزال الإصدار **0.8.0**
مساعِدات الحساب القائمة على توقيعات المحافظ (انظر
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

الحزمة الأساسية:

```bash
npm i @qorechain/sdk
```

تستهدف Node.js 20 فما فوق وتأتي مزوّدة بـ ESM وCommonJS وتعريفات الأنواع.
وتستورد أمثلة المعاملات الهجينة في هذه الوثائق أيضًا `StargateClient` من
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### محوّل EVM

`@qorechain/evm` هو محوّل خفيف وآمن الأنواع فوق [viem](https://viem.sh).
تُعد viem **اعتمادية نظيرة (peer dependency)** — ثبّتها معه:

```bash
npm i @qorechain/evm viem
```

منشور على npm بالإصدار `0.8.0`.

### محوّل SVM

`@qorechain/svm` هو محوّل خفيف فوق
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)، وهي
**اعتمادية نظيرة**:

```bash
npm i @qorechain/svm @solana/web3.js
```

منشور على npm بالإصدار `0.8.0`.

### عدّة React

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk` — مزوّد
(provider)، وخطافات (hooks)، ومكوّنا `ConnectButton` / `QuantumSafeBadge`.
تُعد `react` (‏>=18) اعتمادية نظيرة:

```bash
npm i @qorechain/react
```

منشورة على npm بالإصدار `0.10.0`؛ وتعتمد على `@qorechain/sdk` ‏`^0.10.0`. انظر [دليل عدّة React](/sdk/guides/react).

### أداة التهيئة (Scaffolder)

تقوم `create-qorechain-dapp` (على npm، الإصدار `0.10.0`) بتهيئة تطبيق dApp جاهز للتشغيل:

```bash
npm create qorechain-dapp@latest my-dapp
```

تعتمد ملفات `package.json` المُولَّدة على إصدار SDK الذي تُشحن معه أداة التهيئة
(`@qorechain/sdk` ‏`^0.10.0`؛ ويستخدم قالب EVM الحزمة `@qorechain/evm` ‏`^0.8.0`).
كتب الإصدار 0.8.0 من أداة التهيئة نطاقات `^0.3.0`، وهي على إصدار 0.x تبقى
داخل 0.3 ولا تستطيع التوقيع للشبكات الحيّة؛ فإذا هيّأت بالإصدار 0.8.0 فشغّل
`npm i @qorechain/sdk@latest`. انظر [مرجع CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

تتطلب Python 3.10 فما فوق. تأتي الحزمة مزوّدة بتلميحات الأنواع وعلامة `py.typed`.

> تُثبَّت التوزيعة باسم `qorechain-sdk` (منشورة على PyPI بالإصدار `0.10.0`)
> لكنها **تُستورد باسم `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

تتطلب Go 1.23 فما فوق. استورد الحزم الفرعية التي تحتاجها، على سبيل المثال:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

منشورة كوحدة Go مستقلة بذاتها (الوسم `packages/go/v0.10.0`). ثبّت الإصدار
صراحةً: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`.

## Rust

```bash
cargo add qorechain-sdk
```

أو، لتتبّع رأس المستودع (repository head):

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

تتطلب Rust 1.74 فما فوق. عملاء القراءة غير متزامنين (Tokio). تُستورد الحزمة (crate) باسم
`qorechain`‏ (`use qorechain;`).

> منشورة على crates.io باسم `qorechain-sdk` (0.10.0)؛ يقوم الأمر `cargo add qorechain-sdk`
> بتثبيت أحدث إصدار.

## Java

Maven‏ (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.10.0</version>
</dependency>
```

أو Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.10.0'
```

> منشورة على Maven Central باسم `io.github.qorechain:qorechain-sdk` (0.10.0 هو
> الأحدث وإصدار الإطلاق، جرى التحقق في 27 أكتوبر 2026). لا يحتوي Central على إصدار
> 0.8.0 أو 0.8.1، لذا استخدم على الشبكات الحيّة 0.8.2 أو أحدث. وكان 0.9.1 إصدارًا
> خاصًا بـ Java فقط نقل Bouncy Castle من 1.80 إلى 1.85 دون تغيير في واجهة API.

## الحزم ذات الصلة {#related-packages}

| الحزمة | الغرض | الإصدار |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | مساعِدات من جانب المحفظة: إنشاء المحافظ (`generateQoreWallet`)، والتوقيع الهجين بـ `eth_secp256k1` (`signHybridEth`، `QoreChainSigner`)، وتسجيل شبكة MetaMask (`addQoreEvmToWallet`)، وبُناة رسائل المصادِقين ونافذة EVM (تبني `openEvmWindowMsg` فيها الصيغة غير المحدّدة النطاق فقط)، وملخّص v2 للحساب المجرَّد. لا ترفق إثبات حيازة. الاعتماديات النظيرة: `@cosmjs/proto-signing` و`@cosmjs/stargate` ‏`^0.32` (يستخدم SDK الإصدار 0.39 من cosmjs، لذا يؤدي تثبيت الاثنين في مشروع واحد إلى أن يُبلغ npm عن تعارض في الاعتماديات النظيرة، `ERESOLVE`؛ أبقِهما في مشروعين منفصلين أو مرّر `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | عامل (worker) من جانب الخادم للأنظمة الخلفية: يشتق مفتاح PQC، ويوقّع هجينًا ويبثّ (`sendTokens` و`registerPqc` وغيرهما). مرّر `cosmosRest`: فمعه يحمل التسجيل إثبات الحيازة متى طبّقت الشبكة v3.2.3، ويُفحص أي رفض يبدو متعلقًا بـ PQC مقابل السلسلة قبل أي إعادة تسجيل (يثير مفتاح مسجَّل مختلف الخطأ `pqc_key_mismatch` بدلًا من دفع رسوم تسجيل ثانٍ) | 0.2.3 |
| `@qorechain/pqc` | بدائيات ML-DSA / ML-KEM / SHAKE-256 المطابقة للمعايير فقط و`hybridSignBytes` (انظر [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing))؛ وهي متاحة أيضًا على PyPI وcrates.io وMaven Central ووكيل Go (Go `v0.2.3`) بالإصدار نفسه | 0.2.3 |
| `@qorechain/handles` | حلّ `@handle` الموثَّق (`HandleClient`): أنت تقدّم المفتاح العام للسجل ومخزن التثبيت، وتثبّت العنوان بعد أن يراه المستخدم؛ ولا تثبّت الحزمة شيئًا من تلقاء نفسها. انظر [جسر السلسلة والـ handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **مهجورة على npm ولم تعد تُصان؛ لا تستخدمها في أي عمل جديد. استخدم [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) بدلًا منها (بدائل الاتصال بـ QoreX في [نظرة عامة على أدوات المطورين](/developer-tools/overview#group-connect)).** موصِّل واحد لمحافظ EVM وCosmos وSVM، مبني على محوّل المحفظة (نطاق اعتماديته النظيرة هو `@qorechain/wallet-adapter` ‏`^0.2.1`، الذي لا يشمل 0.4.0). وهو لا يفتح [نافذة تفويض EVM](/sdk/guides/evm#evm-window)، لذا يُرفض أي إرسال EVM عبره إلى أن يكون للحساب مفتاح مسجّل ونافذة مفتوحة | 0.2.1 |
| `@qorechain/rdk` | عميل Rollup Development Kit (انظر [Rollups](/rollups/why)). ابتداءً من 0.7.0 يعتمد على `@qorechain/sdk` ‏`^0.10.0` و`@qorechain/evm` ‏`^0.8.0`، لذا يشارك التطبيق الذي يستخدم SDK 0.10.0 نسخة SDK واحدة مع العدّة (كان الإصدار 0.6.x يعتمد على `^0.9.0`، وعلامة caret على إصدار 0.x تبقى داخل 0.9، مما كان يمنح التطبيق الذي يستخدم SDK 0.10.0 نسخة SDK 0.9.x ثانية متداخلة). يوقّع هجينًا فقط عندما تمرّر `pqcKeypair`؛ وتعمل القراءات بدونه. وهو منشور أيضًا باسم `qorechain-rdk` على PyPI وcrates.io وMaven Central، وكوحدة Go (ثبّت `@v0.7.0`)؛ وهذه العملاء الأربعة توقّع توقيعًا كلاسيكيًا فقط. انظر [RDK 0.7.0: التغييرات والحدود](/rollups/deploying-a-rollup#rdk-050-limits) | 0.7.0 |
| `@qorechain/rdk-cli` | واجهة CLI للمشغّلين `qorollup` الخاصة بـ RDK. أوامر معاملاتها (`create` و`pause` و`resume` و`stop` و`withdraw`) توقّع توقيعًا كلاسيكيًا فقط وترفضها الشبكتان؛ وعند تثبيتها من npm تعمل ويطبع `--version` القيمة 0.7.0 (كان 0.6.1 وما قبله لا يطبع شيئًا) | 0.7.0 |
| `create-qorechain-rollup` | أداة تهيئة بدايات الـ rollup؛ تعتمد قوالبها على `@qorechain/rdk` ‏`^0.7.0` وتوقّع هجينًا حين تستطيع استخلاص مفتاحك ما بعد الكمّي من `QORE_MNEMONIC` أو `QORE_PQC_SEED_HEX` | 0.7.0 |

## التالي

تابع إلى [البدء السريع](/sdk/quickstart) للاتصال وقراءة الحالة على السلسلة.
