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
| **مباشرة منذ** | 7 يونيو 2026، 23:59 بالتوقيت العالمي (UTC) | — |
| **إصدار السلسلة** | v3.1.82 | v3.1.82 |
| **إطار العمل** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **الحد الأدنى لسعر الغاز** | `0.1uqor` | `0.1uqor` |
| **دليل الاتصال** | [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) | [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) |

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
| التنزيلات (الملف الثنائي / genesis / اللقطة) | [download.qore.host](https://download.qore.host) | — |

:::note
نقاط نهاية SVM العامة **للقراءة فقط** (إرسال المعاملات معطّل عند الحافة)؛ شغّل عقدتك الخاصة لعمليات الكتابة على SVM. لأحمال العمل الكثيفة أو الإنتاجية، شغّل عقدتك الخاصة — راجع [تشغيل عقدة](/developer-guide/running-a-node).
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
