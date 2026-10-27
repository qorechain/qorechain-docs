---
slug: /developer-tools/scaffolders-and-cli
title: مولّدات المشاريع وأداة qorollup CLI
sidebar_label: المولّدات وCLI
sidebar_position: 21
---

# مولّدات المشاريع وأداة `qorollup` CLI

تنقل ثلاث أدوات سطر أوامر مشروع QoreChain من الصفر إلى نقطة بداية مكتوبة الأنواع وقابلة للبناء. وهي موجّهة لمطوري التطبيقات (dApps) ومشغّلي rollup الذين يعملون بـ Node.js:

* **`create-qorechain-dapp`** (0.10.0) يولّد تطبيقًا لامركزيًا من أحد ثلاثة قوالب، مبنيًا على [QoreChain SDK](/sdk/overview).
* **`create-qorechain-rollup`** (0.7.0) يولّد مشروع rollup من أحد ستة قوالب، مبنيًا على [حزمة تطوير Rollup](/rollups/overview) بلغة TypeScript.
* **`qorollup`**، أمر الحزمة `@qorechain/rdk-cli` (0.7.0)، هو سطر أوامر المشغّل: فحوص ما قبل التشغيل، وإنشاء rollup ومراقبته، وقراءة المعاملات الحية.

تعكس الصفحة الحزم المنشورة كما ثُبّتت من npm في 27 أكتوبر 2026. الأدلة المفاهيمية هي [نشر Rollup](/rollups/deploying-a-rollup) و[مرجع SDK CLI](/sdk/reference/cli).

## الابتكارات {#innovations}

* **توليد غير تفاعلي لأنظمة CI.** لكل سؤال علَم مقابل: `--template` و`--network` و`--package-manager` و`--yes` (قبول القيم الافتراضية) و`--no-install`. يستطيع خط إنتاج توليد مشروع وبناءه بأمر واحد ودون طرفية.
* **القوالب مثبَّتة على الحزم الحالية.** تعتمد قوالب dApp على `@qorechain/sdk` ‏`^0.10.0` (وقالب EVM على `@qorechain/evm`) وقوالب rollup على `@qorechain/rdk` ‏`^0.7.0`. كان مولّد سابق (0.8.0) يكتب نطاقات تُحَلّ إلى SDK لا يستطيع التوقيع للشبكات الحية؛ ولا يحدث ذلك مع المولّد الحالي.
* **قوالب rollup تُرمّز إعدادًا صالحًا لكل حالة استخدام.** يضبط كل قالب rollup توليفة من التسوية والمُسلسِل (sequencer) وإتاحة البيانات والغاز والآلة الافتراضية تقبلها مصفوفة التوافق في RDK، ويطبع المولّد الرهان الحي وحرق الإنشاء قبل أن تنشئ أي شيء.
* **أمر ما قبل التشغيل يسمّي ما هو مفقود.** يفحص `qorollup doctor` (و`npm run doctor` داخل قالب rollup) أن نقطة REST تردّ، وأن معاملات الوحدة قابلة للقراءة، وأن نقطة النهاية هي الشبكة التي طلبتها، وأن موقّعًا مُعدّ، ويطبع سطرًا واحدًا لكل فحص. وداخل القالب يتحقق أيضًا من إعداد rollup مقابل مصفوفة التوافق.
* **توقيع هجين موصول في القوالب.** تتصل قوالب rollup عبر `signer.ts` صغير يشتق مفتاح ML-DSA-87 للحساب من عبارتك الاسترجاعية (أو يأخذ بذرة مع مفتاح خاص خام) ويوقّع توقيعًا هجينًا، وهو ما تشترطه الشبكات على مسار Native. ويفعل قالب dApp ‏`rollup-app` الشيء نفسه ويعمل كتجربة جافة ما لم تضبط `QORE_BROADCAST=1`.
* **تجارب جافة.** يتحقق `qorollup create ... --dry-run` من الإعداد، ويطبع الرهان والحرق، ويذكر أنه كان سيرسل `MsgCreateRollup` دون بث.
* **مخرجات مقروءة آليًا.** يطبع `qorollup ... --json` بصيغة JSON للسكربتات.

## طريقة الاستخدام {#how-to-use}

### توليد dApp {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| القالب | ما يولّده | السكربتات |
| --- | --- | --- |
| `evm-solidity` | عقد Solidity ‏`Counter` مع أثر مُجمَّع مسبقًا، وسكربت viem ينشره ويستدعيه باستخدام `@qorechain/evm`. الملفات: `contracts/Counter.sol` و`contracts/Counter.artifact.ts` و`scripts/deploy.ts` و`.env`. | `deploy` |
| `fullstack-web` | صفحة Vite وReact وTypeScript تقرأ أرصدة عنوان (ونظرة عامة على الاقتصاد الرمزي) باستخدام `@qorechain/sdk`. الملفات: `index.html` و`src/App.tsx` و`src/main.tsx` و`vite.config.ts` و`.env`. | `dev` و`build` و`preview` و`typecheck` |
| `rollup-app` | سكربت Node يستخدم `createRollupClient` و`createMultilayerClient` من SDK لبناء رسائل rollup والسلسلة الجانبية أو سلسلة الدفع. الملفات: `src/index.ts` والإعدادات المعتادة. تجربة جافة افتراضيًا. | `start` و`typecheck` |

| العلَم | المعنى |
| --- | --- |
| `-t, --template <name>` | `evm-solidity` أو `fullstack-web` أو `rollup-app` |
| `--network <name>` | `testnet` أو `mainnet` |
| `--package-manager <pm>` | `pnpm` أو `npm` أو `yarn` |
| `-y, --yes` | تخطّي الأسئلة واستخدام القيم الافتراضية |
| `--no-install` | عدم تثبيت الاعتماديات |
| `-h, --help`, `-v, --version` | المساعدة، الإصدار |

مثال مُختبَر (من مركز المطورين؛ شُغّل في 27 أكتوبر 2026 في مجلد فارغ، مع `npx` من سجل npm العام): يولّد قالب الويب ويبنيه. الملاحَظ: `Done! Created my-dapp` و`vite build` ناجح. يطبع البناء تحذيرًا بحجم الحزمة، وهو غير ضار.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

قبل تشغيل تطبيق الويب، افتح ملف `.env` المولَّد: يشير إلى `http://localhost:1317` و`http://localhost:8545`، فاضبط `VITE_QORE_REST_URL` على `https://api-testnet.qore.host` (أو `https://api.qore.host` للشبكة الرئيسية) و`VITE_QORE_EVM_RPC_URL` على `https://evm-testnet.qore.host` (أو `https://evm.qore.host`).

### توليد مشروع rollup {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| القالب | الملف التعريفي | التسوية / المُسلسِل / DA / الغاز / الآلة الافتراضية | ملفات إضافية |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK، مخصّص، أصلي، EIP-1559، EVM | مُثبِت مرجعي (`src/prover.ts`) ودائرة تجريبية تحت `circuits/` |
| `gaming-rollup` | gaming | قائم على الأساس (based)، based، أصلي، غاز ثابت، آلة افتراضية مخصّصة | لا شيء |
| `nft-rollup` | nft | تفاؤلي، مخصّص، QoreChain Native، مع مسار طعن | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based، based، أصلي، غاز مدعوم، EVM | لا شيء |
| `custom-rollup` | custom | مضبوط بالكامل، كل حقل موثَّق | لا شيء |
| `multivm-rollup` | multivm | rollup على EVM يستدعي عقود QoreChain Native عبر precompile الاستدعاء بين الآلات الافتراضية | `contracts/CrossVmCaller.sol` و`src/crossvm-call.ts` |

يحتوي كل قالب على `rollup.config.ts` (الإعداد) و`src/client.ts` و`src/signer.ts` و`src/create.ts` و`src/submit-batch.ts` و`src/query-status.ts` و`src/doctor.ts` و`src/status.ts` و`.env` و`.env.example` وملف README و`.github/workflows/deploy.yml`. السكربتات: `create` و`submit-batch` و`query-status` و`doctor` و`status` و`typecheck`. تُشرح الملفات التعريفية المسبقة في [الإعدادات المسبقة](/rollups/preset-profiles).

الخيارات هي نفسها في مولّد dApp، مع أسماء القوالب الستة أعلاه. القالب `multivm-rollup` يظهر في `--help` لكنه غير مذكور في README الحزمة، الذي يذكر خمسة.

مثال مُختبَر (مركز المطورين، 27 أكتوبر 2026، `npx` من npm في مجلد فارغ). الملاحَظ: `Created my-rollup (defi-rollup template)` ونجاح `tsc --noEmit`. أُعيد التوليد نفسه و`npm run typecheck` مع 0.6.2 في اليوم نفسه، بالنتيجة نفسها.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

الخطوات التالية كما يطبعها المولّد: `npm install`، ثم ملء مفتاح المشغّل في `.env`، ثم `npm run doctor`، ثم `npm run create`، ثم `npm run query-status`. يحتوي `.env` المولَّد أصلًا على نقاط نهاية الشبكة التجريبية العامة (`https://api-testnet.qore.host` و`https://rpc-testnet.qore.host` و`https://evm-testnet.qore.host`) وحقول مفاتيح فارغة: `QORE_MNEMONIC` أو `QORE_OPERATOR_PRIVATE_KEY_HEX` (مع `QORE_PQC_SEED_HEX` لبذرة ما بعد الكم). لا تُودع ذلك الملف في المستودع أبدًا.

### أداة `qorollup` CLI {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.7.0
qorollup doctor --network testnet
```

يمكنك أيضًا تشغيلها دون تثبيت: `npx @qorechain/rdk-cli doctor`.

| الأمر | ما يفعله |
| --- | --- |
| `doctor` | فحص ما قبل التشغيل: نقاط النهاية ومعاملات الوحدة وتطابق الشبكة والموقّع والرصيد والإعداد |
| `params` | يطبع معاملات الوحدة الحية |
| `create --rollup-id <id>` | ينشئ rollup (`--profile` و`--stake-uqor` و`--dry-run`) |
| `status <id>`، `watch <id>` | الحالة والصحة، أو عرض حي (`--interval <ms>`) |
| `advise <id>` | نصيحة من QCAI Copilot (راجع [QCAI Copilot](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | يقترح ملفًا تعريفيًا لحالة استخدام |
| `receipt <id> <batch>` | يبني إيصال تسوية (`--verify` و`--out <file>`)، راجع [إيصالات التسوية](/rollups/settlement-receipts) |
| `watchtower <id>` | إطار الطعن لـ rollup التفاؤلية، راجع [برج المراقبة](/rollups/watchtower) |
| `pause`، `resume`، `stop <id>` | انتقالات دورة الحياة (للمنشئ فقط) |
| `keygen` | يولّد مفتاح مشغّل (عبارة استرجاعية وعنوان) |
| `manifest export`، `manifest import` | تصدير بيان rollup أو استيراده |
| `withdraw --file <json>` | يجمّع عملية سحب ويرسلها (`--dry-run`) |
| `faucet <address>` | يطلب أموال الشبكة التجريبية (يتطلب `QORE_FAUCET_URL`) |

الأعلام العامة: `--network testnet|mainnet` (الافتراضي testnet) و`--rest` و`--rpc` و`--evm-rpc` (تجاوز نقاط النهاية، أو `QORE_REST_URL` و`QORE_RPC_URL` و`QORE_EVM_RPC_URL`) و`--mnemonic` أو `--key` (أو `QORE_MNEMONIC` و`QORE_OPERATOR_PRIVATE_KEY_HEX`) و`--profile defi|gaming|nft|enterprise|custom` و`--json` و`-y, --yes` و`-h, --help` و`-v, --version`.

**`doctor`.** شغّله قبل أي شيء يرسل معاملة. المخرجات الملاحَظة في 27 أكتوبر 2026 مع 0.6.2 ودون ضبط موقّع، على الشبكة التجريبية (طبعت الشبكة الرئيسية الشيء نفسه، مع `qorechain-vladi` و`https://api.qore.host`؛ تطبع الأداة شرطات طويلة، معروضة هنا كواصلات عادية):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

السطر الذي يبدأ بـ `!` تحذير ولا يُفشل التشغيل؛ وغياب الموقّع مشكلة فقط حين تريد إنشاء rollup أو تشغيله. ينتهي الأمر بالرمز 0 حين لا يفشل أي فحص.

**مثال مُختبَر.** من مركز المطورين: قراءة معاملات الوحدة الحية دون مفتاح. فشل على 0.6.1 (لم يطبع الأمر شيئًا وانتهى بالرمز 0) وأُعيد تشغيله على 0.6.2:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

الملاحَظ مع 0.6.2 عبر `npx` وعبر تثبيت عام وعبر الرابط المحلي `node_modules/.bin/qorollup` (ومع 0.7.0 عبر الرابط المحلي، حيث طبع `qorollup --version` القيمة 0.7.0): تُطبع معاملات الوحدة (الحد الأقصى للـ rollups 200، الحد الأدنى للرهان 10000 QOR، حرق الإنشاء 1%، نافذة الطعن 3600 ث، الحد الأقصى لـ blob إتاحة البيانات 2,097,152 بايت، الاحتفاظ بالـ blobs 432,000 كتلة، الحد الأقصى للدفعات لكل كتلة 10). وتجربة جافة لعملية إنشاء، لوحظت أيضًا:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## طريقة الوصول {#how-to-access}

* **المتطلبات المسبقة.** Node.js 20 أو أحدث ومدير حزم. تكتب المولّدات ملفات، وما لم تمرّر `--no-install` فإنها تثبّت الاعتماديات، لذا تحتاج إلى وصول شبكي إلى سجل npm. عملاء RDK بلغات Python وRust وGo وJava مكتبات وليس لها مولّد؛ راجع [نشر Rollup](/rollups/deploying-a-rollup).
* **الشبكات ونقاط النهاية.** الشبكة الرئيسية `qorechain-vladi` (معرّف سلسلة EVM ‏9801): ‏REST ‏`https://api.qore.host`، ‏RPC ‏`https://rpc.qore.host`، ‏EVM ‏`https://evm.qore.host`. الشبكة التجريبية `qorechain-diana` (معرّف السلسلة 9800): المضيفات نفسها مع `-testnet` بعد التسمية الأولى، مثل `https://api-testnet.qore.host`. قراءة البيانات و`doctor` و`params` و`suggest` و`--dry-run` لا تحتاج إلى حساب.
* **الحسابات والمفاتيح.** أي شيء يرسل معاملة يحتاج إلى حساب مشغّل ممول وعبارته الاسترجاعية أو مفتاحه الخاص، يُزوَّد عبر متغيرات البيئة أو الأعلام، ولا يُودَع في المستودع أبدًا. إنشاء rollup يحتاج إلى الحد الأدنى من الرهان (10,000 QOR على الشبكتين، قُرئ حيًا في 27 أكتوبر 2026)، يُحرق منه 1% عند الإنشاء. يُنشئ `qorollup keygen` مفتاحًا جديدًا؛ وعلى الشبكة التجريبية تأتي أموال الاختبار من [صنبور Dashboard](/dashboard/faucet)، أو من `qorollup faucet` مع ضبط `QORE_FAUCET_URL`.
* **التوقيع الهجين.** معاملات مسار Native تحتاج إلى توقيع secp256k1 مع توقيع ML-DSA-87. تشتق القوالب مفتاح ما بعد الكم من عبارتك الاسترجاعية؛ أما أوامر المعاملات في `qorollup` فلا تفعل (انظر الحدود أدناه).
* **التكاليف.** الأدوات مجانية (Apache-2.0). على السلسلة، الحد الأدنى للرسوم 0.1 uqor لكل وحدة غاز؛ وينطبق على الإنشاء رهان rollup والحرق المذكوران أعلاه.

## أين نُشرت {#where-published}

| السجل | الحزمة | الإصدار | الرابط |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (الأمر `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (الأمر `create-qorechain-rollup`) | 0.7.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (الأمر `qorollup`) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (المكتبة التي تستخدمها القوالب) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk |

المصدر: https://github.com/qorechain/qorechain-sdk/tree/main/cli (مولّد dApp) وhttps://github.com/qorechain/qorechain-rdk/tree/main/cli (مولّد rollup) وhttps://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). إصدار RDK 0.7.0 منشور أيضًا على PyPI وcrates.io وMaven Central ووكيل وحدات Go (جرى التحقق في 27 أكتوبر 2026). وجميعها Apache-2.0.

## الحدود والمشكلات المعروفة {#limits}

* **الخيار `--network mainnet` لم يغيّر الملفات المولَّدة في تشغيل اختباري.** في 27 أكتوبر 2026 وُلّد `fullstack-web` و`custom-rollup` مع `--network mainnet`؛ وظل `.env` المولَّد يحمل نقاط نهاية localhost (dApp) أو `QORE_NETWORK=testnet` مع نقاط نهاية الشبكة التجريبية (rollup)، وأنشأ `App.tsx` الخاص بـ dApp عميلًا من نوع `testnet`. اضبط الشبكة ونقاط النهاية بنفسك في `.env`، وفي `src/App.tsx` لقالب الويب.
* **لا يوجد rollup على أي من الشبكتين بعد** (جرى التحقق في 27 أكتوبر 2026). لم يُجرَّب أي مسار معاملات في أدوات rollup على rollup حي. تحقق من كل شيء على الشبكة التجريبية أولًا، واقرأ [RDK 0.7.0: التغييرات والحدود](/rollups/deploying-a-rollup#rdk-050-limits).
* **قالب `defi-rollup` لا يستطيع تسوية دفعة.** تسوية ZK غير قابلة للاستخدام بعد على أي من الشبكتين (تسجيل المفاتيح مخطط له في إصدار السلسلة v3.2.7)، ولم تكن دائرته التجريبية لتجتاز فحص الإثبات في السلسلة على أي حال. ابتداءً من 0.7.0 يتوقف القالب قبل الإرسال، فلا ينفق بعد الآن رسومًا على دفعة ترفضها السلسلة دائمًا. استخدم قالبًا بتسوية `optimistic` إلى أن يتغير ذلك (راجع [ZK وSTARK وعمليات السحب](/rollups/zk-stark-withdrawals)).
* **قالب `multivm-rollup` يعتمد على شيء غير مفعَّل.** precompile الاستدعاء بين الآلات الافتراضية على `0x0000000000000000000000000000000000000901` غير مفعَّل على أي من الشبكتين، لذا لا يفعل الاستدعاء من عقد شيئًا؛ ويتحقق القالب من ذلك وعقده مكتوب ليتراجع (revert) بدلًا من أن يفشل بصمت (راجع [متعدد الأجهزة الافتراضية](/rollups/multi-vm)).
* **أوامر المعاملات في `qorollup` توقّع توقيعًا كلاسيكيًا فقط.** تتصل `create` و`pause` و`resume` و`stop` و`withdraw` دون مفتاح ما بعد الكم، وهو ما ترفضه الشبكتان على مسار Native. القراءات و`doctor` و`params` و`receipt` و`--dry-run` لا تتأثر. لإرسال المعاملات استخدم مشروعًا مولَّدًا (سكربتاته توقّع توقيعًا هجينًا)، أو RDK بلغة TypeScript مع `pqcKeypair`، أو CLI السلسلة.
* **بعض مساعدات `qorollup` ليس لديها ما تتحدث إليه بعد.** طبع `advise` مقابل الشبكة التجريبية في 27 أكتوبر "advisory unavailable" لأسطح الرسوم والشبكة والاحتيال ووكيل RL (ردّت العقدة بـ 501 أو "method does not exist") ولـ rollup غير موجود. وأعاد `suggest` ملفًا تعريفيًا مع `source: fallback`، مما يدل على استخدام القائمة الافتراضية المضمّنة بدلًا من خدمة المساعد. اقرأ التحذيرات.
* **`rollup-app` لا يبثّ إلا حين تطلب.** يعمل كتجربة جافة افتراضيًا؛ ومع `QORE_BROADCAST=1` يسجّل مفتاح ML-DSA-87 للحساب مرة واحدة ويوقّع توقيعًا هجينًا. قيم rollup النموذجية فيه توضيحية: خذ أسماء الملفات التعريفية الحقيقية والرهان من [الإعدادات المسبقة](/rollups/preset-profiles).
* **`fullstack-web` يعرض خطأ على زر الاقتصاد الرمزي.** تستدعي تلك اللوحة دالة JSON-RPC من نوع `qor_` لا تقدّمها نقاط النهاية العامة؛ أما البحث عن الرصيد فيعمل. استبدلها بقراءة REST مثل `client.rest.getBurnStats()`.
* **`evm-solidity` يحتاج إلى أكثر من حساب ممول.** إرسال معاملة EVM على QoreChain يحتاج أيضًا إلى مفتاح ML-DSA-87 مسجَّل ونافذة تفويض EVM مفتوحة، تُعدّ من مسار Native (راجع [دليل EVM](/developer-guide/evm-development#evm-window)). لم يُشغَّل سكربت `deploy` الخاص بالقالب على شبكة حية من أجل هذه الصفحة.
* **`create-qorechain-dapp --version` يطبع `0.5.1`** مع أن الحزمة المثبَّتة هي 0.10.0 (جرى التحقق في 27 أكتوبر 2026). اقرأ الإصدار من `package.json` أو من السجل.
* **ملفات README الخاصة بالحزم قديمة.** يذكر README الخاص بـ `create-qorechain-dapp` قالبين وREADME الخاص بـ `create-qorechain-rollup` خمسة؛ بينما يعرض `--help` ثلاثة وستة. ثق بـ `--help`.
* **الإصدارات قبل 0.6.2 لا تعمل من npm.** طبع `qorollup` ‏0.6.1 وما قبله، مثبَّتًا عبر npm بأي طريقة، لا شيء وانتهى بالرمز 0، وطبع `--version` القيمة `0.4.1`. إذا اضطررت للبقاء على 0.6.1 فشغّل `node node_modules/@qorechain/rdk-cli/dist/index.js <command>`؛ وإلا فقم بالترقية.
* **نسخ الاعتماديات (في 0.6.x فقط).** يعتمد `@qorechain/rdk` ‏0.6.2 وما قبله على `@qorechain/sdk` ‏`^0.9.0`، لذا فإن مشروعًا ثبّت أيضًا SDK 0.10.0 كان يحمل نسخة SDK 0.9.x ثانية متداخلة. ابتداءً من 0.7.0 تعتمد المجموعة على `@qorechain/sdk` ‏`^0.10.0` وتشارك نسخة واحدة.
