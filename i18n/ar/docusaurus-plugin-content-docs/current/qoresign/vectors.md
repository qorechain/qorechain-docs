---
slug: /qoresign/vectors
title: نواقل اختبار QoreSign
sidebar_label: نواقل الاختبار
sidebar_position: 5
---

# نواقل الاختبار

الملف [`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json) مولَّد من تنفيذ TypeScript (`pnpm build && pnpm vectors`) وتتحقق منه مجموعات اختبار TypeScript وRust وGo وSwift وKotlin. أي تغيير في الملف هو تغيير في صيغة النقل: أضف ملفًا جديدًا بإصدار جديد بدلًا من تعديل هذا الملف.

اشتُق كل مفتاح من عبارة الاختبار العامة BIP-39 (`abandon ... about`). لا ترسل أموالًا إلى هذه الحسابات أبدًا.

## الحقول {#fields}

| الحقل | المحتوى |
|---|---|
| `accounts` | المفاتيح الكلاسيكية والعناوين لحسابات `secp256k1` (`m/44'/118'/0'/0/0`) و`eth_secp256k1` (`m/44'/60'/0'/0/0`) |
| `canonical` | مفاتيح ML-DSA-87 العامة القياسية لكل عنوان ([اشتقاق المفاتيح](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | مسودة الاشتقاق الهرمي: المفاتيح العامة لكل مسار، والمسارات التي يجب رفضها ([اشتقاق المفاتيح](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | `TxBody` و`AuthInfo` مع رقم الحساب ومعرّف السلسلة، إلى جانب القيم المتوقعة لبايتات التوقيع وتوقيع ML-DSA-87 والجسم النهائي وتوقيع secp256k1 و`TxRaw` لبايتات التوقيع `v2` و`v1` ([التوقيع الهجين](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | رسالة إثبات الحيازة وتوقيعها ([التسجيل](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | الرسالة `MsgRegisterPQCKeyV2` مرمَّزة |
| `message` | توقيع رسالة اعتباطية: البيانات، وبايتات التوقيع لـ ADR-36 وML-DSA-87، والتوقيع ([توقيع الرسائل](/qoresign/spec/message-signing-v1)) |
| `siwq` | حقول تسجيل الدخول، والرسالة المعروضة، وبايتات التوقيع لـ ADR-36 وML-DSA-87، والتوقيع، ووقت يتحقق عنده ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## الترميز {#encoding}

جميع سلاسل البايتات بالسداسي العشري بأحرف صغيرة. تواقيع ML-DSA-87 حتمية (FIPS 204، `rnd` = 32 بايتًا صفريًا)؛ وتواقيع secp256k1 تستخدم RFC 6979 مع low-S.
