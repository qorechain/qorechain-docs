---
slug: /appendix/faq
title: الأسئلة الشائعة
sidebar_label: الأسئلة الشائعة
sidebar_position: 5
---

# الأسئلة المتكررة

أسئلة عامة حول QoreChain، مُجاب عنها من الوثائق. يرتبط كل جواب بالصفحة المرجعية للتفاصيل الكاملة. للأسئلة الخاصة بـ SDK، انظر [الأسئلة الشائعة لـ SDK](/sdk/faq).

### هل الشبكة الرئيسية فعّالة؟

نعم. الشبكة الرئيسية لـ QoreChain (السلسلة `qorechain-vladi`، معرّف سلسلة EVM رقم 9801) فعّالة منذ 7 يونيو 2026. انظر [الشبكات](/appendix/networks) و[الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet).

### ما هي معرّفات السلسلة ومعرّفات سلسلة EVM؟

الشبكة الرئيسية هي سلسلة Cosmos المسماة `qorechain-vladi` بمعرّف سلسلة EVM رقم **9801** (سداسي عشري `0x2649`)؛ والشبكة التجريبية هي `qorechain-diana` بمعرّف سلسلة EVM رقم **9800** (سداسي عشري `0x2648`). انظر [الشبكات](/appendix/networks) للجدول الكامل.

### كيف تُوزَّع رسوم المعاملات؟

تُقسَّم الرسوم المحصَّلة على النحو التالي: **37% للمُصدِّقين، 30% محروقة، 20% لخزينة المجتمع، 10% للراهنين، و3% للعقد الخفيفة**. انظر [اقتصاديات الرمز](/architecture/tokenomics).

### ما هو PRISM؟

PRISM هو طبقة التحسين بالتعلُّم المعزَّز المضمَّنة في محرك إجماع QoreChain. يراقب مقاييس الشبكة ويقترح تعديلات حتمية على معاملات الإجماع تحت ضوابط أمان قاطع الدائرة. انظر [محرك إجماع PRISM](/architecture/prism-consensus-engine).

### هل الجسر متعدد السلاسل فعّال؟

الجسر متعدد السلاسل حاليًا في الشبكة التجريبية وقيد الانتظار — وهو ليس نظام إنتاج بعد. وهو مُصمَّم حول 37 تكوين سلسلة QCB و8 قنوات IBC؛ تعامل مع الأهداف كنية تصميمية وليس ضمانات فعّالة على الشبكة الرئيسية. انظر [بنية الجسر](/architecture/bridge-architecture).

### كيف أربط محفظة؟

أعدّ محفظة وأضف شبكة QoreChain باستخدام معرّفات سلسلة EVM (9801 للشبكة الرئيسية، 9800 للشبكة التجريبية). انظر [إعداد المحفظة](/getting-started/wallet-setup).

### كيف أحصل على رموز الشبكة التجريبية؟

استخدم صنبور الشبكة التجريبية على لوحة المعلومات. انظر [صنبور لوحة المعلومات](/dashboard/faucet) و[الاتصال بالشبكة التجريبية](/getting-started/connecting-to-testnet).

### كيف أشغّل عقدة أو مُصدِّقًا أو عقدة خفيفة؟

لعقدة كاملة، انظر [تشغيل عقدة](/developer-guide/running-a-node). لمُصدِّق، انظر [تشغيل مُصدِّق](/developer-guide/running-a-validator). لعقدة خفيفة، انظر [العقدة الخفيفة](/light-node/overview).

### ما نظام التوقيع الذي تستخدمه QoreChain؟

تستخدم QoreChain نظامًا هجينًا مقاومًا للحوسبة الكمومية يجمع بين **secp256k1 (ECDSA)** الكلاسيكي و**ML-DSA-87 (Dilithium-5)** اللاحق للكم. هذا النظام الهجين مطلوب افتراضيًا على مسار معاملات Cosmos، مع التحكم في وضع الإلزام عبر الحوكمة. انظر [الأمان اللاحق للكم](/architecture/post-quantum-security).

### كيف أبني rollup؟

استخدم مجموعة أدوات تطوير Rollup من QoreChain. انظر [Rollups](/rollups/overview) ومرجع بنية [مجموعة أدوات تطوير Rollup](/architecture/rollup-development-kit).

### كيف أبني تطبيقًا لامركزيًا؟

استخدم [QoreChain SDK](/sdk/overview)، وهي SDK العامة لبناء التطبيقات على QoreChain عبر بيئات التنفيذ EVM وSVM وCosmWasm.

### أين يمكنني طرح الأسئلة؟

يجيب بوت مجتمع QCAIA على الأسئلة في Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) وTelegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). انظر [بوت مجتمع QCAIA](/qcaia/overview).

## ذات صلة

* [الشبكات](/appendix/networks) — مرجع معرّفات السلسلة والمنافذ ونقاط النهاية.
* [ما هي QoreChain](/introduction/what-is-qorechain) — نظرة عامة على المنصة.
* [بوت مجتمع QCAIA](/qcaia/overview) — اطرح الأسئلة في Discord وTelegram.
