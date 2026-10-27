---
slug: /appendix/networks
title: الشبكات
sidebar_label: الشبكات
sidebar_position: 4
---

# الشبكات

مرجع موحّد لشبكات QoreChain — معرّفات السلسلة، ومعرّفات سلسلة EVM، وفئة الرمز، وبادئات العناوين، ونقاط النهاية العامة، ومنافذ الخدمات القياسية.

## نظرة سريعة على الشبكات

| | الشبكة الرئيسية | شبكة الاختبار |
|---|---|---|
| **الحالة** | مباشرة | شبكة اختبار نشطة |
| **معرّف سلسلة Cosmos** | `qorechain-vladi` | `qorechain-diana` |
| **معرّف سلسلة EVM (EIP-155)** | **9801** (بالنظام الست عشري `0x2649`) | **9800** (بالنظام الست عشري `0x2648`) |
| **مباشرة منذ** | 7 يونيو 2026 | 1 يوليو 2026 (مستمرة منذ ذلك الحين؛ دون إعادة ضبط) |
| **إصدار السلسلة** | v3.2.4 (طُبّق عند الارتفاع 3,742,566، في 23 أكتوبر 2026، مقترح الحوكمة 13). طُبّق v3.2.3 عند الارتفاع 3,662,051 في 20 أكتوبر 2026 | v3.2.6 (طُبّق عند الارتفاع 8,970,638، في 27 أكتوبر 2026؛ وطُبّق v3.2.5 عند الارتفاع 8,890,800 في 26 أكتوبر، وv3.2.4 عند 8,337,253 في 19 أكتوبر) |
| **زمن الكتلة (المتوسط المقاس)** | نحو 3.2 ثانية | نحو 1.3 ثانية |
| **ملف بيان الإصدار** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **إطار العمل** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **الحد الأدنى لسعر الغاز** | `0.1uqor` | `0.1uqor` |
| **رموز الاختبار** | لا توجد | رموز Fest وهي fUSD وfETH وfBTC (بلا قيمة؛ راجع [الصنبور](/dashboard/faucet#fest-tokens)) |
| **دليل الاتصال** | [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) | [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) |

يُعدّ ملفا البيان المرجع المعتمد للإصدار الذي ينبغي أن تشغّله أي عقدة جديدة. تتلقى الشبكتان ترقيات منسّقة عبر الحوكمة، لذا يحمل كل ملف بيان قيمة `upgradeHeight` لإصداره الحالي وقيمة `minCompatible` مساوية لذلك الإصدار (3.2.4 على الشبكة الرئيسية و3.2.6 على شبكة الاختبار، جرى التحقق في 27 أكتوبر 2026). تتلقى شبكة الاختبار كل إصدار أولًا: تعمل الشبكة الرئيسية بالإصدار v3.2.4 منذ 23 أكتوبر 2026، وسيطبّق مقترح الحوكمة 14 الإصدار v3.2.5 على الشبكة الرئيسية عند الارتفاع 3,906,833 (وهو في فترة التصويت وقت كتابة هذا)، لذا يجب على العقدة التي تنضم إلى الشبكة الرئيسية أن تتبع ملف البيان الخاص بها. لا تنسخ أبدًا ملفًا تنفيذيًا بين الشبكتين.

## نقاط النهاية العامة {#public-endpoints}

تُقدَّم جميع نقاط النهاية العامة عبر HTTPS.

| الخدمة | الشبكة الرئيسية | شبكة الاختبار |
|---|---|---|
| RPC الإجماع | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| WebSocket الإجماع | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (متوافق مع Solana، للقراءة فقط) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| مستكشف الكتل | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (بدّل إلى شبكة الاختبار) |
| التنزيلات (الملف الثنائي / genesis / اللقطة) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
نقاط نهاية SVM العامة **للقراءة فقط** (إرسال المعاملات معطّل عند الحافة)؛ شغّل عقدتك الخاصة لعمليات الكتابة على SVM. لأحمال العمل الكثيفة أو الإنتاجية، شغّل عقدتك الخاصة — راجع [تشغيل عقدة](/developer-guide/running-a-node). لا توجد نقطة نهاية gRPC عامة ولا WebSocket عام لـ EVM على الشبكة الرئيسية. على نقاط نهاية EVM العامة، يقبل `eth_getLogs` ما يصل إلى 10,000 كتلة كحد أقصى في كل استعلام، و`txpool_content` معطّل (تخدم العقدة المستضافة ذاتيًا فضاء الأسماء بالكامل)؛ راجع [فضاء أسماء eth_](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
إذا تلقّى سكربت الخطأ `403 Forbidden` من نقطة نهاية عامة، فاضبط ترويسة `User-Agent` صراحةً (وكيل `urllib` الافتراضي في Python محظور؛ أما عملاء `requests` و`curl` وNode وGo فتعمل كما هي).
:::

:::caution مسار معاملات SVM معطّل حاليًا
إلى جانب كون نقاط النهاية العامة للقراءة فقط، فإن مسار تنفيذ SVM **معطّل حاليًا على مستوى الشبكة بأكملها لإرسال المعاملات** (منذ إصدار السلسلة v3.1.89، بتاريخ 22 أغسطس) — ويشمل ذلك الإرسال عبر عقدتك الخاصة، وليس فقط نقطتي النهاية العامتين `svm.qore.host` / `svm-testnet.qore.host`. راجع [تطوير SVM](/developer-guide/svm-development) للتفاصيل. استخدم واجهتَي Cosmos أو EVM إلى أن يُعاد فتح هذا المسار.
:::

## الرمز والعناوين

| البند | القيمة |
|---|---|
| **فئة العرض** | QOR |
| **الفئة الأساسية** | uqor (1 QOR = 10⁶ uqor) |
| **المنازل العشرية حسب الواجهة** | Cosmos **6** (`uqor`) · EVM **18** (على نمط wei؛ 1 uqor = 10¹² wei) · SVM **9** (lamports؛ 1 uqor = 1,000 lamports) |
| **نوع عملة HD (BIP-44)** | `118` |
| **بادئة حسابات Bech32** | `qor` (مثلًا `qor1...`) |
| **بادئة المدقّقين Bech32** | `qorvaloper` (مثلًا `qorvaloper1...`) |

تعرض الواجهات الثلاث **رصيد QOR أصليًا موحّدًا واحدًا**: المفتاح نفسه يتحكم في الأموال نفسها عبر أشكال عناوينه `qor1...` (Cosmos) و`0x...` (EVM) وbase58 (SVM).

## المنافذ القياسية

هذه هي منافذ الخدمات القياسية التي تعرضها عقدة QoreChain تشغّلها بنفسك.

| الخدمة | المنفذ |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM JSON-RPC (متوافق مع Solana) | 8899 |
| مقاييس Prometheus | 26660 |

## نقاط النهاية والوصول

- للاتصال بالعقد، والنظراء، وملف genesis، واللقطات، اتبع [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) أو [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet).
- للوصول البرمجي من تطبيق، استخدم [QoreChain SDK](/sdk/overview) الذي يحلّ إعدادات الشبكة نيابةً عنك.
- **مستكشف الكتل** العام متاح على [explore.qore.network](https://explore.qore.network)؛ وتتضمن لوحة التحكم على [dashboard.qorechain.io](https://dashboard.qorechain.io) عرض مستكشف خاصًا بها، ويمكن الوصول إلى **صنبور** شبكة الاختبار هناك (راجع [صنبور لوحة التحكم](/dashboard/faucet)).
- تُنشر هذه الوثائق على [docs.qorechain.io](https://docs.qorechain.io).

## الإضافة إلى MetaMask

لإضافة شبكة QoreChain إلى محفظة EVM مثل MetaMask، استخدم معرّفات سلسلة EVM أعلاه — **9801** للشبكة الرئيسية مع `https://evm.qore.host`، و**9800** لشبكة الاختبار مع `https://evm-testnet.qore.host` — مع `https://explore.qore.network` كعنوان URL لمستكشف الكتل. راجع [إعداد المحفظة](/getting-started/wallet-setup) للشرح خطوة بخطوة.

## ذات صلة

* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — انضم إلى شبكة `qorechain-vladi` المباشرة.
* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة اختبار Diana.
* [دليل المنصات وجهات التكامل](/developer-guide/exchange-integration) — الإيداعات والسحوبات وعمليات العقد لجهات التكامل.
* [معلمات السلسلة](/appendix/chain-parameters) — إعدادات السلسلة المعتمدة.
* [نظرة عامة على SDK](/sdk/overview) — حلّ إعدادات الشبكة من الشيفرة.
