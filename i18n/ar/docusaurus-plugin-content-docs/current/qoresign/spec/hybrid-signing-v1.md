---
slug: /qoresign/spec/hybrid-signing-v1
title: توقيع المعاملات الهجين v1
sidebar_label: التوقيع الهجين v1
sidebar_position: 1
---

# توقيع المعاملات الهجين على QoreChain، الإصدار 1

الحالة: مستقر. ينطبق على المسار الأصلي (Cosmos SDK) في `qorechain-vladi` (الشبكة الرئيسية) و`qorechain-diana` (الشبكة التجريبية). المصدر: [`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## الملخص {#summary}

المعاملة الهجينة هي `TxRaw` عادية في Cosmos SDK يوقّعها الحساب نفسه مرتين:

1. توقيع ML-DSA-87 (FIPS 204)، محمول داخل جسم المعاملة بوصفه خيار الامتداد `/qorechain.pqc.v1.PQCHybridSignature`؛
2. توقيع secp256k1 بنمط `SIGN_MODE_DIRECT` على الجسم النهائي، في `TxRaw.signatures`.

تتحقق الشبكة من الاثنين. على المسار الأصلي تشترط الشبكة توقيع ML-DSA-87 افتراضيًا (`HybridSignatureMode = Required`، وهو معامل على مستوى السلسلة)؛ وباستثناء مجموعة صغيرة من الرسائل المعفاة، مثل تلك التي تسجّل مفتاح ML-DSA-87 للحساب أو تصونه، تُرفض أي معاملة بدونه.

## المفاتيح {#keys}

| المفتاح | الخوارزمية | الحجم |
|---|---|---|
| كلاسيكي | secp256k1 (حسابات `secp256k1`: العنوان = RIPEMD160(SHA256(المفتاح المضغوط)); حسابات `eth_secp256k1`: العنوان = آخر 20 بايتًا من KECCAK256(المفتاح غير المضغوط)) | مفتاح عام مضغوط من 33 بايتًا |
| ما بعد كمّي | ML-DSA-87، معرّف الخوارزمية `1` | المفتاح العام 2592 بايتًا، التوقيع 4627 بايتًا |

يجب تسجيل المفتاح العام ML-DSA-87 للحساب بالرسالة `MsgRegisterPQCKeyV2` قبل أن تجتاز المعاملات الهجينة التحقق (راجع [التسجيل](#registration)). ويجوز بدلًا من ذلك أن تضمّن المعاملة المفتاح العام في الامتداد (الحقل 3) لتسجيله عند أول استخدام.

## الامتداد {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

يُضاف إلى `TxBody.extension_options` (الحقل 1023) بوصفه `google.protobuf.Any` مع `type_url = "/qorechain.pqc.v1.PQCHybridSignature"` وترميز protobuf قيمةً له `value`. يجب أن يحمل الجسم امتدادًا واحدًا بالضبط من هذا النوع.

## بايتات التوقيع {#sign-bytes}

ليكن `B0` ترميز protobuf القياسي لـ `TxBody` **دون** امتداد PQC (مع إبقاء كل حقل وامتداد آخر بترتيبه)، و`A` بايتات `AuthInfo` كما بُثّت تمامًا. `BE32`/`BE64` أطوال غير موقَّعة بترتيب big-endian.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

تتحقق الشبكة من صيغة واحدة بالضبط عند ارتفاع معيّن. تتحقق الشبكتان العامتان من `v2` منذ ترقيتيهما `v3.1.98` / `v3.2.0` (الشبكة الرئيسية: `v3.2.0` عند الارتفاع 2,981,742)؛ وأي شبكة أخرى تتحقق من `v2` منذ التكوين الأول (genesis). لا حاجة إلى `v1` إلا لإعادة إنتاج تواقيع صُنعت قبل تلك الارتفاعات. يستطيع العميل أن يسأل عقدة عن الصيغة التي تتحقق منها بقراءة `/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}`.

توقيع ML-DSA-87 هو `ML-DSA.Sign(sk, signBytes, ctx = "")`. تقبل الشبكة النسختين الحتمية والمتحوّطة (hedged)؛ ويوقّع QoreSign حتميًا افتراضيًا (FIPS 204، `rnd` = 32 بايتًا صفريًا) حتى يمكن إعادة إنتاج التواقيع مقابل النواقل المنشورة.

## ترتيب العمليات {#order-of-operations}

1. رمّز `B0` و`A` (تكون الرسوم وحد الغاز ومعلومات الموقّعين ثابتة عند هذه النقطة).
2. احسب بايتات التوقيع وتوقيع ML-DSA-87.
3. أضف الامتداد إلى `B0` بترتيب الحقول القياسي (بعد `extension_options` الموجودة، وقبل `non_critical_extension_options`)، فينتج الجسم النهائي `B`.
4. وقّع `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }` بـ secp256k1: SHA-256 لحسابات `secp256k1`، وKECCAK-256 لحسابات `eth_secp256k1`؛ بصيغة `r || s` من 64 بايتًا، مع low-S.
5. ابثّ `TxRaw { B, A, [classical signature] }`.

يغطي التوقيع الكلاسيكي الامتداد؛ ويغطي توقيع ML-DSA-87 كل ما عداه في الجسم ومعلومات المصادقة (auth info)، بما فيها الرسوم. ولا يوقّع أيٌّ من التوقيعين نفسه.

## التسجيل {#registration}

`MsgRegisterPQCKeyV2` (عنوان النوع `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| الحقل | الرقم | القيمة |
|---|---|---|
| `sender` | 1 | حساب `qor1` |
| `public_key` | 2 | المفتاح العام ML-DSA-87 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | مفتاح secp256k1 المضغوط للحساب ذو 33 بايتًا؛ ويجب أن يشتق إلى `sender` |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | توقيع ML-DSA-87 على الرسالة أدناه |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

تُوقَّع معاملة التسجيل نفسها بالمفتاح الكلاسيكي وحده. يُرفض أي مفتاح عام يكون جزء `t1` فيه (من البايت 32 فصاعدًا) كله أصفارًا، لأن تواقيعه يمكن تزويرها.

## المسارات الأخرى {#other-lanes}

- مسار EVM: ليس في معاملات Ethereum حقل لامتداد، فلا تحمل توقيع ML-DSA-87. يستطيع الحساب الذي له مفتاح ML-DSA-87 مسجَّل أن يفتح من المسار الأصلي نافذة تفويض EVM محدودة (ارتفاع انتهاء الصلاحية، والحد الأقصى للمعاملات، والحد الأقصى للقيمة). راجع [محافظ EVM: نافذة التفويض](/qoresign/guides/evm-quantum-ready).
- مسار SVM: غير مفتوح على الشبكة بعد.

## نواقل الاختبار {#test-vectors}

يقدّم `vectors/qoresign-v1.json`، الحقل `hybridTx`، جسمًا ومعلومات مصادقة ورقم حساب مع بايتات التوقيع المتوقعة والتواقيع والجسم النهائي و`TxRaw` للإصدارين. راجع [نواقل الاختبار](/qoresign/vectors).
