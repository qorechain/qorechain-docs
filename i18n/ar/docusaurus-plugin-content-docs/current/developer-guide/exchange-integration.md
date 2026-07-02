---
slug: /developer-guide/exchange-integration
title: دليل المنصات وجهات التكامل
sidebar_label: تكامل المنصات
sidebar_position: 11
---

# دليل المنصات وجهات التكامل

كل ما تحتاجه منصة تداول أو جهة حفظ أو جهة تكامل مدفوعات لإدراج QOR ومعالجة الإيداعات والسحوبات: اختيار الواجهة، واكتشاف الإيداعات بأمان، وتوقيع السحوبات.

:::note
يستهدف هذا الدليل الشبكة الرئيسية **`qorechain-vladi`** (إصدار السلسلة **v3.1.82**). تدرَّب على التدفق الكامل أولًا على شبكة الاختبار **`qorechain-diana`** — نقاط النهاية لكلتا الشبكتين موجودة في [الشبكات](/appendix/networks#public-endpoints).
:::

## اختيار مسار التكامل {#choosing-a-path}

QoreChain سلسلة واحدة ذات **رصيد QOR أصلي موحّد** يُعرض عبر ثلاث واجهات. **المفتاح الخاص نفسه يتحكم في الأموال نفسها** تحت عنوان Cosmos (`qor1...`) وعنوان EVM (`0x...`) وعنوان SVM (بترميز base58) — اختر الواجهة التي تناسب بنيتك التقنية.

| | **A) Cosmos (الأصلية)** | **B) EVM** | **C) SVM (آلة Solana الافتراضية)** |
|---|---|---|---|
| العنوان | `qor1...` (bech32) | `0x...` (Ethereum) | ‏Solana base58 (المفتاح نفسه) |
| الخانات العشرية (QOR الأصلي) | **6** (`uqor`) | **18** (على نمط wei) | **9** (lamports؛ ‏1 uqor = ‏1,000 lamports) |
| الأدوات | Cosmos SDK / CosmJS | **أدوات Ethereum القياسية** (ethers/web3، ‏MetaMask) | `@solana/web3.js` |
| توقيع السحوبات | **توقيع PQC هجين مطلوب** (ML-DSA-87 + secp256k1) | **secp256k1 قياسي / EIP-155 — بدون PQC** | عبر معاملة Cosmos أو الإرسال على العقدة مباشرة |
| دعم المذكرة / الوسم (memo) | **نعم** (عنوان مشترك + memo) | لا (عنوان لكل مستخدم) | لا (عنوان لكل مستخدم) |
| اكتشاف الإيداعات | مسح أحداث `MsgSend` | مسح الكتل عبر `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| الأنسب لـ | المنصات المبنية على Cosmos | **المنصات التي لديها تكامل EVM قائم** | المنصات التي تستخدم أدوات Solana |

**التوصية:** إذا كنت تدعم بالفعل سلاسل EVM، فإن **المسار B ‏(EVM)** هو التكامل الأقل جهدًا — أدوات Ethereum قياسية، و**السحوبات لا تتطلب توقيعًا ما بعد كمّي** (مسار ante الخاص بـ EVM معفى). المسار A ‏(Cosmos) هو المسار الأصلي مع عناوين إيداع مشتركة قائمة على المذكرة (memo). المسار C ‏(SVM) هو أيضًا واجهة QOR أصلية كاملة — اختره إذا كنت تفضّل تحديدًا أدوات Solana.

الواجهات الثلاث **ليست متنافية** — الأموال المُرسلة إلى الصيغة `0x` أو `qor1` أو صيغة SVM للمفتاح نفسه هي الرصيد نفسه.

## تشغيل عقدتك {#node}

ينبغي لتكاملات الإنتاج التحقق من الإيداعات مقابل **عقدتها المُزامَنة الخاصة**، لا مقابل نقطة نهاية تابعة لطرف ثالث. اتبع [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — فهو يغطي حزمة الملفات الثنائية الجاهزة (مع مجاميع تحقق SHA-256)، وملف التكوين الأولي (genesis)، والنظراء العموميين، والحد الأدنى للرسوم (`0.1uqor`)، والتمهيد السريع عبر لقطة بيانات السلسلة المنشورة. لا يلزم أي ترخيص لتشغيل عقدة كاملة غير مُصادِقة.

ولأن QoreChain تتمتع **بنهائية فورية** (لا إعادة تنظيم للكتل)، فإن **تأكيدًا واحدًا يعني النهائية**؛ والانتظار كتلة أو كتلتين يمنح هامشًا تشغيليًا مريحًا.

## المسار A — ‏Cosmos (الأصلي) {#path-a-cosmos}

عنوان REST الأساسي: `https://api.qore.host` (أو `http://localhost:1317` على عقدتك).

### مراقبة الإيداعات

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### قائمة التحقق ضد الإيداعات المزيفة {#anti-fake-deposit}

اعتمد الإيداع **فقط** عندما تتحقق **جميع** الشروط التالية:

1. **`tx_response.code == 0`** — نجحت المعاملة؛ لا تعتمد أبدًا معاملة فاشلة.
2. الرسالة هي **`/cosmos.bank.v1beta1.MsgSend`** (أو أحد مخرجات `MsgMultiSend`) — وليست استدعاء عقد ذكي أو وحدة أخرى.
3. حقل **`to_address`** يساوي عنوان الإيداع الخاص بك، و(في نموذج العنوان المشترك) حقل **`memo`** يطابق المستخدم.
4. **`denom == "uqor"`** والمبلغ `amount` هو القيمة المعتمدة (uqor ← ÷ 10⁶ للحصول على QOR). ارفض أي فئة (denom) أخرى.
5. المعاملة ضمن **كتلة مُثبَّتة** (وجود `height` وكونه ≤ آخر ارتفاع مُثبَّت). النهائية فورية — تأكيد واحد نهائي؛ انتظر كتلة أو كتلتين للهامش.
6. أعد حساب المبلغ من **أحداث التحويل** (`coin_received` / `coin_spent`) وقارنه بمبلغ الرسالة — لا تثق أبدًا بحقل واحد أو بالمذكرة (memo) وحدها.
7. تحقق من وجود تجزئة المعاملة عبر `GET /cosmos/tx/v1beta1/txs/{hash}` مقابل عقدتك المُزامَنة **الخاصة**.

### السحوبات — التوقيع الهجين PQC {#cosmos-withdrawals}

تفرض الشبكة الرئيسية **توقيعات ما بعد كمّية** على معاملات cosmos ‏(`allow_classical_fallback = false`): كل سحب يحتاج إلى **توقيع هجين** — ML-DSA-87 ‏(Dilithium-5، ‏FIPS-204) **بالإضافة إلى** secp256k1. الإيداعات **لا** تحتاج إلى ذلك (فأنت تراقب السلسلة فقط).

مكتبة التوقيع هي [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) ‏(npm)، وهي تستورد `@qorechain/pqc` لأساسيات FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

التوقيع تدفق من **خطوتين** (يحاكي `qorechaind tx pqc cosign`):

**الخطوة 1 — مرة واحدة لكل محفظة ساخنة: سجّل مفتاحها ML-DSA-87.** معاملة التسجيل الوحيدة هذه **موقَّعة توقيعًا كلاسيكيًا** (إعفاء التمهيد): الرسالة `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` مع `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. اشتق مفتاح ML-DSA اشتقاقًا حتميًا بحيث يمكن استرجاعه من سرّك الحالي — مثلًا `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` ثم `mldsa.keygen(seed)` — واحفظ البذرة (seed) إلى جانب مفتاح محفظتك الساخنة.

**الخطوة 2 — كل سحب بعد ذلك: وقّع `MsgSend` توقيعًا هجينًا.** يُضمِّن المحوِّل (adapter) توقيع ML-DSA-87 داخل امتداد جسم المعاملة *قبل* توقيع secp256k1 العادي عبر `signDirect`، بحيث يبقى المُوقِّع الحالي لديك دون تغيير:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

بث البايتات الموقَّعة:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

ثم استعلم دوريًا عبر `GET /cosmos/tx/v1beta1/txs/{hash}` حتى تظهر المعاملة في كتلة مع `code == 0`.

إذا كنت تستخدم وحدة HSM أو مُوقِّعًا مخصصًا بلغة أخرى، فاستخدم مكتبات [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) المستقلة لـ FIPS-204 ‏(npm، ‏PyPI، ‏crates.io، ‏Maven Central، ‏Go) وركِّب الامتداد نفسه. توقيع ML-DSA **يجب أن يكون حتميًا** (FIPS-204 §3.4) — انظر [التوقيع الحتمي](/developer-guide/post-quantum-signing#deterministic-signing)؛ إذ ترفض السلسلة التوقيعات المُحوَّطة (hedged).

## المسار B — ‏EVM {#path-b-evm}

تكامل Ethereum قياسي مقابل `https://evm.qore.host` (معرّف السلسلة **9801**) أو منفذ 8545 على عقدتك الخاصة.

* **الخانات العشرية:** QOR الأصلي بـ **18 خانة عشرية** على مسار EVM ‏(1 uqor = 10¹² wei). الخطأ في هذا يعني اعتماد الإيداعات بشكل خاطئ بمعامل 10¹².
* **الإيداعات:** امسح الكتل عبر `eth_getBlockByNumber` بحثًا عن التحويلات الأصلية إلى عناوينك؛ وأكِّد عبر `eth_getTransactionReceipt` ‏(`status == 0x1`).
* **السحوبات:** توقيع secp256k1 قياسي / EIP-155 — **لا يلزم PQC** على مسار ante الخاص بـ EVM. أي حزمة توقيع Ethereum تعمل دون تغيير.
* **مكافحة الإيداعات المزيفة:** تحقق من حالة الإيصال، ومن أن القيمة المنقولة تحويل **أصلي** (وليست حدث ERC-20 لا تقوم بفهرسته)، وأكِّد مقابل عقدتك الخاصة.
* **مطابقة العناوين:** العنوان `0x` والعنوان `qor1` هما ترميزان لحساب واحد — والأموال مشتركة. انظر [تطوير EVM](/developer-guide/evm-development).

## المسار C — ‏SVM (متوافق مع Solana) {#path-c-svm}

اعتبارًا من v3.1.82 تخدم واجهة SVM ‏**QOR الأصلي** (انظر [QOR الأصلي على واجهة SVM](/developer-guide/svm-development#native-qor)):

* **الأرصدة:** يُرجِع `getBalance` القيمة بوحدة lamports ‏(÷ 10⁹ للحصول على QOR؛ ‏1 uqor = ‏1,000 lamports).
* **الإيداعات:** يعطي `getSignaturesForAddress` سجل المعاملات لعنوان ما؛ وتحويلات System Program تنقل QOR الأصلي.
* نقاط النهاية العامة (`https://svm.qore.host`، ‏`https://svm-testnet.qore.host`) **للقراءة فقط**؛ أرسل المعاملات عبر عقدتك الخاصة.

## ملخص التدفق {#flow-summary}

| العملية | المسار | هل يلزم توقيع؟ |
|---|---|---|
| **الإيداع** (المستخدم ← المنصة) | راقب عقدتك المُزامَنة بحثًا عن التحويلات إلى عنوانك (+ memo على Cosmos) | لا — مراقبة فقط |
| **السحب** (المنصة ← المستخدم) | ابنِ التحويل، ووقّع دون اتصال، ثم ابثّ المعاملة | ‏Cosmos: توقيع PQC هجين · ‏EVM: ‏secp256k1 قياسي |
| **الرصيد / التجميع (sweep)** | استعلام رصيد REST / EVM / SVM + تحويل | التوقيع مطلوب لعملية التجميع فقط |

## مواضيع ذات صلة

* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — إعداد العقدة، التنزيلات، اللقطة
* [تشغيل عقدة](/developer-guide/running-a-node) — النشر، التقليم، الفهرسة
* [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) — مكتبات FIPS-204 وراء السحوبات الهجينة
* [الشبكات](/appendix/networks) — معرّفات السلاسل، نقاط النهاية، الخانات العشرية لكل واجهة
