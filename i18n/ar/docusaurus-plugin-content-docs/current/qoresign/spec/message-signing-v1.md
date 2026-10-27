---
slug: /qoresign/spec/message-signing-v1
title: توقيع الرسائل v1
sidebar_label: توقيع الرسائل v1
sidebar_position: 3
---

# توقيع الرسائل، الإصدار 1

الحالة: مستقر. مخصص لتوقيع بيانات اعتباطية خارج السلسلة (طلب `signArbitrary` في المحافظ المتوافقة مع Keplr)، مثلًا لإثبات التحكم في حساب أمام خدمة. المصدر: [`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## التوقيع {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **الجزء الكلاسيكي:** ADR-36. يوقّع مفتاح secp256k1 للحساب مستند التوقيع amino JSON الخاص بـ `MsgSignData { signer, data }`، تمامًا كما في [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part) (خلاصة SHA-256 لحسابات `secp256k1`، وKECCAK-256 لحسابات `eth_secp256k1`؛ و64 بايتًا بصيغة `r || s`، مع low-S).
- **الجزء ما بعد الكمّي:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` هي بايتات الرسالة الخام. لا يحتوي `chain_id` إلا على أحرف وأرقام و`.` و`_` و`-`.

## فصل النطاقات {#domain-separation}

يبدأ كل توقيع ML-DSA-87 يصنعه حساب على QoreChain بنطاق خاص به، حتى لا يمكن إعادة استخدام توقيع صُنع لغرض ما بوصفه توقيعًا لغرض آخر. يجب ألا توقّع المحفظة بايتات خامًا بمفتاح ML-DSA-87 دون إحدى هذه البادئات، وألا تسمح لرسالة بأن تبدأ ببادئة محجوزة لاستخدام آخر.

| البادئة | الاستخدام |
|---|---|
| `qorechain-pqc-hybrid-v2` | بايتات توقيع المعاملات ([توقيع المعاملات الهجين v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | إثبات الحيازة عند تسجيل المفتاح |
| `qorechain:pqc:recovery:v1` | استرداد الحساب |
| `qorechain-svm-auth-v2` | تفويض مسار SVM |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | هذه المواصفة |

## التحقق {#verification}

1. يشتق المفتاح العام الكلاسيكي إلى `signer` ضمن `keyType`، ويجتاز توقيع ADR-36 التحقق.
2. يجتاز توقيع ML-DSA-87 التحقق مقابل المفتاح **المسجَّل على السلسلة** لـ `signer` (`/qorechain/pqc/v1/account/{address}`)، على البايتات المذكورة أعلاه مع معرّف السلسلة المتوقع.

## نواقل الاختبار {#test-vectors}

`vectors/qoresign-v1.json`، الحقل `message`. راجع [نواقل الاختبار](/qoresign/vectors).
