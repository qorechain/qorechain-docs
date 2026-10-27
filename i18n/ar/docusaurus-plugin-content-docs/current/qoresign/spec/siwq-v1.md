---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ)، الإصدار 1

الحالة: مستقر للإصدار 1 من صيغة الرسالة. المصدر: [`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

يتيح SIWQ لحساب QoreChain أن يثبت تحكمه بمفاتيحه أمام خدمة خارج السلسلة. تتبع الرسالة تخطيط [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) وSign In With Solana، مكيَّفًا مع عناوين QoreChain ومعرّفات سلاسلها. للتوقيع جزآن: توقيع secp256k1 بنمط ADR-36 يستطيع أي محفظة متوافقة مع Keplr إنتاجه بـ `signArbitrary`، وتوقيع ML-DSA-87 (FIPS 204) من المفتاح ما بعد الكمّي المسجَّل للحساب.

## الرسالة {#message}

```
${scheme://}${domain} wants you to sign in with your QoreChain account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: ${chain-id}
Nonce: ${nonce}
Issued At: ${issued-at}
Expiration Time: ${expiration-time}
Not Before: ${not-before}
Request ID: ${request-id}
Resources:
- ${resources[0]}
- ${resources[1]}
...
```

- تُفصل الأسطر بـ `\n` واحد؛ ولا يوجد سطر جديد في النهاية.
- `scheme://` اختياري. و`domain` هو سلطة RFC 3986 للموقع الطالب (المضيف ومنفذ اختياري).
- `address` هو صيغة bech32 `qor1` للحساب.
- سطر العبارة (statement) اختياري. وبدونه يتبع العنوانَ سطران فارغان، كما في EIP-4361.
- قيمة `Version` هي `1`. و`Chain ID` معرّف سلسلة QoreChain مثل `qorechain-vladi`.
- `Nonce` هو 8 أحرف أبجدية رقمية على الأقل يختارها الخادم، ويُستخدم مرة واحدة.
- الطوابع الزمنية بصيغة RFC 3339 / ISO 8601.
- `Expiration Time` و`Not Before` و`Request ID` و`Resources` اختيارية وتظهر بهذا الترتيب.

يجب على المتحقق أن يعيد عرض الحقول المحلَّلة ويرفض أي رسالة لا تطابقها بايتًا ببايت.

## التواقيع {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### الجزء الكلاسيكي (ADR-36) {#classical-part}

يوقّع مفتاح secp256k1 للحساب مستند التوقيع amino JSON أدناه، مسلسلًا بمفاتيح مرتّبة ودون مسافات، حيث `data` هو base64 للرسالة بترميز UTF-8 و`signer` هو عنوان `qor1`:

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

الخلاصة هي SHA-256 لحسابات `secp256k1` وKECCAK-256 لحسابات `eth_secp256k1`؛ والتوقيع 64 بايتًا بصيغة `r || s`، مع low-S. و`publicKey` هو المفتاح المضغوط ذو 33 بايتًا، ويجب أن يشتق إلى `address` ضمن `keyType`.

### الجزء ما بعد الكمّي {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

تمنع بادئة النطاق استخدام توقيع تسجيل الدخول توقيعًا لمعاملة، والعكس بالعكس (راجع [فصل النطاقات](/qoresign/spec/message-signing-v1#domain-separation)).

تكون قيمة `signatureType` هي `secp256k1` عند غياب الجزء `pq`. ينبغي للمتحققين رفض مثل هذه الدخولات ما لم يقبلوا الحسابات الكلاسيكية فقط صراحةً.

## التحقق {#verification}

يجب على المتحقق أن يفحص بهذا الترتيب:

1. أن الرسالة تُحلَّل وبالصيغة القياسية؛
2. أن `domain` يساوي النطاق الذي جاء منه الطلب؛
3. أن `nonce` يساوي الـ nonce الذي أصدره الخادم لهذه الجلسة، وأنه لم يُستخدم من قبل؛
4. أن `Chain ID` هو الشبكة المتوقعة؛
5. أن `Expiration Time` في المستقبل، وأن `Not Before` و`Issued At` ليسا في المستقبل (مع السماح بانحراف ساعة صغير)؛
6. أن المفتاح العام الكلاسيكي يشتق إلى `address` وأن توقيع ADR-36 يجتاز التحقق؛
7. أن توقيع ML-DSA-87 يجتاز التحقق مقابل المفتاح العام **المسجَّل على السلسلة** لـ `address` (`/qorechain/pqc/v1/account/{address}`)، لا مقابل مفتاح يقدّمه العميل.

## نواقل الاختبار {#test-vectors}

`vectors/qoresign-v1.json`، الحقل `siwq`. راجع [نواقل الاختبار](/qoresign/vectors).
