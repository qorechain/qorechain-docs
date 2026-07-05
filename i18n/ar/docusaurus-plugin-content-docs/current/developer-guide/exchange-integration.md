---
slug: /developer-guide/exchange-integration
title: دليل المنصات وجهات التكامل
sidebar_label: تكامل المنصات
sidebar_position: 11
---

# دليل المنصات وجهات التكامل

كل ما تحتاجه منصة تداول أو جهة حفظ أو جهة تكامل مدفوعات لإدراج QOR ومعالجة الإيداعات والسحوبات: اختيار الواجهة المناسبة، واكتشاف الإيداعات بأمان، وتوقيع السحوبات.

:::note
يستهدف هذا الدليل الشبكة الرئيسية **`qorechain-vladi`** (إصدار السلسلة **v3.1.85**). تدرّب على التدفق الكامل أولاً على شبكة الاختبار **`qorechain-diana`** — نقاط النهاية لكلتا الشبكتين موجودة في [الشبكات](/appendix/networks#public-endpoints). إذا كنت تشغّل عقدتك الكاملة الخاصة، فأبقِها على إصدار السلسلة الحالي — فالعقدة القديمة لا تستطيع فك ترميز أنواع المعاملات الأحدث وتتوقف عن المزامنة.
:::

## اختيار مسار التكامل {#choosing-a-path}

QoreChain سلسلة واحدة برصيد **QOR أصلي موحّد واحد** معروض عبر ثلاث واجهات. **المفتاح الخاص نفسه يتحكم في الأموال نفسها** تحت عنوان Cosmos (`qor1...`) وعنوان EVM (`0x...`) وعنوان SVM (بترميز base58) — اختر الواجهة التي تناسب بنيتك التقنية.

| | **أ) Cosmos (الأصلي)** | **ب) EVM** | **ج) SVM (آلة Solana الافتراضية)** |
|---|---|---|---|
| العنوان | `qor1...` (bech32) | `0x...` (Ethereum) | ترميز base58 الخاص بـ Solana (المفتاح نفسه) |
| الخانات العشرية (QOR الأصلي) | **6** (`uqor`) | **18** (على غرار wei) | **9** (lamports؛ 1 uqor = 1,000 lamports) |
| الأدوات | Cosmos SDK / CosmJS | **أدوات Ethereum القياسية** (ethers/web3، MetaMask) | `@solana/web3.js` |
| توقيع السحوبات | **يلزم توقيع PQC هجين** (ML-DSA-87 + secp256k1) | **secp256k1 قياسي / EIP-155 — بدون PQC** | عبر معاملة Cosmos أو الإرسال المباشر على العقدة |
| دعم الحقل التعريفي (memo / tag) | **نعم** (عنوان مشترك + memo) | لا (عنوان لكل مستخدم) | لا (عنوان لكل مستخدم) |
| اكتشاف الإيداعات | فحص أحداث `MsgSend` | فحص الكتل عبر `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| الأنسب لـ | المنصات المبنية على Cosmos | **المنصات التي لديها تكامل EVM قائم** | المنصات التي تعتمد أدوات Solana |

**التوصية:** إذا كنت تدعم بالفعل سلاسل EVM، فإن **المسار ب (EVM)** هو التكامل الأقل جهدًا — أدوات Ethereum قياسية، و**السحوبات لا تتطلب توقيعًا ما بعد كمّي** (مسار ante الخاص بـ EVM معفى). المسار أ (Cosmos) هو المسار الأصلي مع عناوين إيداع مشتركة قائمة على الـ memo. المسار ج (SVM) هو أيضًا واجهة كاملة لـ QOR الأصلي — اختره إذا كنت تفضّل أدوات Solana تحديدًا.

الواجهات الثلاث **ليست متنافية** — الأموال المرسلة إلى صيغة `0x` أو `qor1` أو SVM لنفس المفتاح هي الرصيد نفسه.

## تشغيل عقدتك {#node}

ينبغي لعمليات التكامل الإنتاجية التحقق من الإيداعات مقابل **عقدتها المتزامنة الخاصة**، لا مقابل نقطة نهاية طرف ثالث. اتبع [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — فهو يغطي حزمة الملفات التنفيذية الجاهزة (مع مجاميع تحقق SHA-256)، وملف genesis، والنظراء العموميين، والحد الأدنى للرسوم (`0.1uqor`)، وإقلاعًا سريعًا عبر لقطة بيانات السلسلة المنشورة. لا يلزم أي ترخيص لتشغيل عقدة كاملة غير مُصادِقة.

ولأن QoreChain تتمتع **بنهائية فورية** (لا إعادة تنظيم للكتل)، فإن **تأكيدًا واحدًا يعني النهائية**؛ والانتظار كتلة أو كتلتين يمنحك هامشًا تشغيليًا مريحًا.

## المسار أ — Cosmos (الأصلي) {#path-a-cosmos}

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

لا تُقيِّد الإيداع في الحساب **إلا** عند تحقق **جميع** الشروط التالية:

1. **`tx_response.code == 0`** — نجحت المعاملة؛ لا تُقيِّد أبدًا معاملة فاشلة.
2. الرسالة هي **`/cosmos.bank.v1beta1.MsgSend`** (أو أحد مخرجات `MsgMultiSend`) — وليست استدعاء عقد أو وحدة أخرى.
3. حقل **`to_address`** يساوي عنوان الإيداع الخاص بك، و(في نموذج العنوان المشترك) حقل **`memo`** يطابق المستخدم.
4. **`denom == "uqor"`** والقيمة `amount` هي المبلغ المُقيَّد (uqor ← ÷ 10⁶ للحصول على QOR). ارفض أي denom آخر.
5. المعاملة في **كتلة ملتزَم بها** (قيمة `height` موجودة و≤ أحدث ارتفاع ملتزَم به). النهائية فورية — تأكيد واحد نهائي؛ انتظر كتلة أو كتلتين للهامش.
6. أعد حساب المبلغ من **أحداث التحويل** (`coin_received` / `coin_spent`) وطابقه مع مبلغ الرسالة — لا تثق أبدًا بحقل واحد أو بالـ memo وحده.
7. تحقق من وجود hash المعاملة عبر `GET /cosmos/tx/v1beta1/txs/{hash}` مقابل عقدتك المتزامنة **الخاصة**.

### السحوبات — التوقيع الهجين PQC {#cosmos-withdrawals}

تفرض الشبكة الرئيسية **توقيعات ما بعد كمّية** على معاملات cosmos (`allow_classical_fallback = false`): كل سحب يحتاج إلى **توقيع هجين** — ML-DSA-87 (Dilithium-5، FIPS-204) **بالإضافة إلى** secp256k1. الإيداعات **لا** تحتاج إلى ذلك (أنت تراقب السلسلة فقط).

مكتبة التوقيع هي [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm)، والتي تجلب معها `@qorechain/pqc` للأوليات المشفّرة الخاصة بـ FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

التوقيع يتم عبر تدفق من **خطوتين** (يحاكي `qorechaind tx pqc cosign`):

**الخطوة 1 — مرة واحدة لكل محفظة ساخنة: تسجيل مفتاح ML-DSA-87 الخاص بها.** معاملة التسجيل الوحيدة هذه **موقّعة كلاسيكيًا** (إعفاء الإقلاع الأولي): الرسالة `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` مع `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. اشتق مفتاح ML-DSA بشكل حتمي بحيث يكون قابلًا للاسترداد من سرّك الحالي — مثلًا `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` ثم `mldsa.keygen(seed)` — واحفظ الـ seed إلى جانب مفتاح محفظتك الساخنة.

**الخطوة 2 — كل سحب بعد ذلك: توقيع `MsgSend` توقيعًا هجينًا.** يدمج المحوّل توقيع ML-DSA-87 داخل امتداد لجسم المعاملة *قبل* توقيع secp256k1 العادي عبر `signDirect`، فيبقى مُوقِّعك الحالي دون تغيير:

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

بثّ البايتات الموقّعة:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

ثم استعلم دوريًا عبر `GET /cosmos/tx/v1beta1/txs/{hash}` حتى تظهر المعاملة في كتلة مع `code == 0`.

إذا كنت تستخدم HSM أو مُوقِّعًا مخصصًا بلغة أخرى، فاستخدم مكتبات [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) المستقلة الخاصة بـ FIPS-204 (npm وPyPI وcrates.io وMaven Central وGo) وركّب الامتداد نفسه. **يجب أن يكون** توقيع ML-DSA **حتميًا** (FIPS-204 §3.4) — انظر [التوقيع الحتمي](/developer-guide/post-quantum-signing#deterministic-signing)؛ فالسلسلة ترفض التوقيعات العشوائية (hedged).

### البديل على جانب الخادم: `@qorechain/chain-bridge` {#chain-bridge}

لعامل محفظة ساخنة يعمل بالكامل على جانب الخادم (دون أي محفظة متصفح)، تغلّف حزمة **`@qorechain/chain-bridge`** (npm) التدفق بأكمله — اشتقاق المفاتيح، والتسجيل التلقائي لمفتاح PQC عند أول استخدام، والتوقيع الهجين، والبث — في استدعاء واحد. وهي JavaScript خالص (بدون إضافات أصلية)، ومناسبة للعوامل بلا خوادم (serverless):

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

تستخدم `chain-bridge` (≥0.1.1) نفس اشتقاق PQC القانوني المرتبط بالعنوان المستخدم في بقية الحزم — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — لذا فالمفتاح قابل للاسترداد من العبارة الاسترجاعية (mnemonic) عبر `qorechaind tx pqc recover-key`. الحسابات المسجَّلة بأدوات أقدم تُعالَج تلقائيًا (الرجوع إلى المفتاح القديم)، ويمكن ترحيلها مرة واحدة إلى المفتاح القانوني عبر [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## المسار ب — EVM {#path-b-evm}

تكامل Ethereum قياسي مقابل `https://evm.qore.host` (معرّف السلسلة **9801**) أو المنفذ 8545 على عقدتك الخاصة.

* **الخانات العشرية:** يمتلك QOR الأصلي **18 خانة عشرية** على مسار EVM (1 uqor = 10¹² wei). الخطأ في هذا يؤدي إلى تقييد الإيداعات بشكل خاطئ بمعامل 10¹².
* **الإيداعات:** افحص الكتل عبر `eth_getBlockByNumber` بحثًا عن التحويلات الأصلية إلى عناوينك؛ وأكّدها عبر `eth_getTransactionReceipt` (‏`status == 0x1`).
* **السحوبات:** توقيع secp256k1 قياسي / EIP-155 — **لا يلزم PQC** على مسار ante الخاص بـ EVM. أي حزمة توقيع Ethereum تعمل دون تغيير.
* **مكافحة الإيداعات المزيفة:** تحقق من حالة الإيصال، ومن أن القيمة المنقولة هي تحويل **أصلي** (وليست حدث ERC-20 لا تُفهرسه)، وأكّد ذلك مقابل عقدتك الخاصة.
* **مطابقة العناوين:** عنوان `0x` وعنوان `qor1` هما ترميزان للحساب نفسه — والأموال مشتركة. انظر [تطوير EVM](/developer-guide/evm-development).

## المسار ج — SVM (متوافق مع Solana) {#path-c-svm}

اعتبارًا من الإصدار v3.1.82 تخدم واجهة SVM عملة **QOR الأصلية** (انظر [QOR الأصلي على واجهة SVM](/developer-guide/svm-development#native-qor)):

* **الأرصدة:** يُرجع `getBalance` القيمة بوحدة lamports (÷ 10⁹ للحصول على QOR؛ 1 uqor = 1,000 lamports).
* **الإيداعات:** يعطي `getSignaturesForAddress` سجل المعاملات لعنوان ما؛ وتحويلات System Program تنقل QOR الأصلي.
* نقاط النهاية العامة (`https://svm.qore.host`، ‏`https://svm-testnet.qore.host`) هي **للقراءة فقط**؛ أرسل المعاملات عبر عقدتك الخاصة.

## ملخص التدفق {#flow-summary}

| العملية | المسار | هل يلزم التوقيع؟ |
|---|---|---|
| **الإيداع** (المستخدم ← المنصة) | راقب عقدتك المتزامنة بحثًا عن تحويلات إلى عنوانك (+ الـ memo على Cosmos) | لا — مراقبة فقط |
| **السحب** (المنصة ← المستخدم) | ابنِ التحويل، وقّع دون اتصال، ثم ابثّ المعاملة | Cosmos: توقيع PQC هجين · EVM: secp256k1 قياسي |
| **الرصيد / التجميع** | استعلام رصيد عبر REST / EVM / SVM + تحويل | التوقيع مطلوب لعملية التجميع فقط |

## مواضيع ذات صلة

* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — إعداد العقدة، التنزيلات، اللقطة
* [تشغيل عقدة](/developer-guide/running-a-node) — النشر، التقليم، الفهرسة
* [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) — مكتبات FIPS-204 التي تقف خلف السحوبات الهجينة
* [الشبكات](/appendix/networks) — معرّفات السلاسل، نقاط النهاية، الخانات العشرية لكل واجهة
