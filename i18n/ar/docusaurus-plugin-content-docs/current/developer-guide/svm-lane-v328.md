---
slug: /developer-guide/svm-lane-v328
title: "مسار SVM: البرامج والحسابات وحدود الحضانة (v3.2.8)"
sidebar_label: مسار SVM (v3.2.8)
sidebar_position: 10
---

# مسار SVM: البرامج والحسابات وحدود الحضانة (v3.2.8)

مسار SVM هو الجزء المتوافق مع Solana في QoreChain: تنشر فيه برامج مُصرَّفة، وتنشئ حسابات بيانات، وتستدعي البرامج بأدوات بأسلوب Solana، ويظهر رصيد QOR الأصلي نفسه بوحدة lamports. أغلق الإصدار **v3.2.8** المسار عند الترقية إلى أن أعاد تصويت حوكمة فتحه. وعلى شبكة الاختبار اجتاز ذلك التصويت (المقترح 37) وصار المسار **مفتوحًا**؛ وتحدّ حضانته ثلاثة حدود محكومة بالحوكمة.

تشرح هذه الصفحة كيف تقرأ حالة المسار، وكيف تعمل البرامج والحسابات والإيجار (rent)، وكيف تسجّل محفظة SVM مفتاحًا ما بعد كمومي، وماذا تعني حدود الحضانة، وأي الأمثلة يمكن تشغيله اليوم.

:::note شبكة الاختبار أولًا، والمسار مفتوح فيها منذ المقترح 37
يعمل v3.2.8 على شبكة الاختبار **`qorechain-diana`** منذ 12 نوفمبر 2026. أما الشبكة الرئيسية (`qorechain-vladi`) فما زالت على v3.2.6، وليس لها موعد لـ v3.2.8، و**يبقى المسار مطفأً على الشبكة الرئيسية**. أغلقت الترقية المسار على شبكة الاختبار (فشلت كتابات SVM ورُفضت `MsgRegisterSVMPQCKey`). و**اجتاز مقترح الحوكمة 37 وفتحه على `qorechain-diana`**: ضبط `enabled: true`، وأبقى المعاملات الأخرى كما كانت، ورفع إيقاف قاطع الدائرة عن `MsgExecuteProgram` وعن الاستدعاءات عبر الأنوية الافتراضية. وعند التحقق في 12 نوفمبر 2026 بعد التصويت أظهر `GET /qorechain/svm/v1/params` القيمة `enabled: true`، ولم تحتوِ قائمة قاطع الدائرة إلا على `/cosmwasm.wasm.v1.MsgStoreCode`. ويبقى JSON-RPC العام لـ SVM للقراءة فقط. اقرأ دائمًا الحالة الحيّة أولًا (القسم التالي) ولا تفترضها.
:::

## لماذا يهم هذا {#why}

* العميل الذي يعرض إجراءات SVM والمسار مغلق يعطي المستخدمين معاملات مرفوضة. وقراءة معامل واحد أولًا تتفادى ذلك.
* يحتفظ المسار بـ QOR حقيقي: كل lamport في برنامج أو عنوان مشتق من برنامج أو حساب بيانات مدعوم بـ uqor تحتفظ بها وحدة SVM. وتُبقي حدود الحضانة الثلاثة هذا المخزون محدودًا، لذا قد يُرفض تحويل أو إيداع حتى لو كان لدى المرسل الأموال.
* يحدد الإيجار وحدود الحجم كلفة إبقاء الحالة على السلسلة، فمكانها في ميزانية النشر.

## قراءة حالة المسار {#lane-state}

حالة المسار هي الحقل `enabled` في معاملات SVM. اقرأه من مسار REST أو من واجهة سطر أوامر العقدة. وتحمل الاستجابة نفسها كل حد آخر في هذه الصفحة، فيكفي استدعاء واحد لتقدير حجم النشر.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

الاستجابة على `qorechain-diana` في 12 نوفمبر 2026 بعد نجاح المقترح 37 (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

على عقدة Linux (لا يوجد ملف ثنائي مُحزَّم لـ macOS) تكون القراءة نفسها:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

في TypeScript، مع Node 18 أو أحدث (لا حاجة إلى أي استدعاء SDK لهذه القراءة):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

دالة مساعدة مكتوبة الأنواع لهذه المعاملات (ومُنشئ آمن لمقترح تعديل المعاملات) جزء من مسودة SDK لـ v3.2.8 التي لم تُنشر بعد. وستضيف إصدارة SDK لاحقة هذا؛ فاستخدم سطر الأوامر أو مسار REST إلى ذلك الحين.

### هوية العنقود {#cluster-info}

يحدّد `cluster_info` هوية العنقود للمحافظ ويبيّن هل التنفيذ مفعّل. ولا يتغير مع حالة المسار بأي طريقة غير الحقل `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

الاستجابة في 12 نوفمبر 2026، مقروءة بعد نجاح المقترح 37، مع `execution_enabled` بقيمة `true` (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

لواجهة سطر أوامر العقدة الاستعلام نفسه: `qorechaind query svm cluster-info`. وتعيد الدالة `getGenesisHash` في JSON-RPC على `https://svm-testnet.qore.host` التجزئة نفسها. وتُشتق التجزئة من معرّف السلسلة؛ وليست تجزئة genesis لعنقود Solana حقيقي.

## JSON-RPC العام لـ SVM للقراءة فقط {#public-rpc}

تجيب نقطتا النهاية العامتان `https://svm.qore.host` و`https://svm-testnet.qore.host` عن القراءات وترفضان دوال الكتابة (`sendTransaction` وما شابهها) على معرّفات السلسلة العامة، سواء كان المسار مفتوحًا أم لا. ولإرسال معاملات SVM تشغّل عقدتك الخاصة، التي تخدم JSON-RPC المتوافق مع Solana على المنفذ 8899 افتراضيًا (انظر [تطوير SVM](/developer-guide/svm-development#json-rpc-server))، ويجب أن يكون المسار نفسه مفتوحًا على الشبكة التي تتبعها تلك العقدة. أما القراءات فتعمل الآن:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

أعادت `getVersion` القيمة `solana-core` `1.18.0-qorechain` مع معرّف السلسلة ومعرّف العنقود وتجزئة genesis. وكان تسعير الإيجار لـ 1,024 بايت هو `8017920` lamports في 12 نوفمبر 2026. أما مسارات REST `GET /qorechain/svm/v1/account/{address}` و`.../program/{address}` و`.../slot` فأجابت بـ **HTTP 501** (غير منفَّذة) على نقطة النهاية العامة؛ فاقرأ الحسابات والبرامج عبر دالتي JSON-RPC ‏`getAccountInfo` و`getMultipleAccounts`، أو عبر واجهة سطر أوامر العقدة.

## نشر البرامج واستدعاؤها {#programs}

متى فُتح المسار فالتدفق هو: ابنِ برنامج SBF بسلسلة أدوات Solana الحالية، وانشره، وأنشئ الحسابات التي يحتاجها، ثم استدعه. كل أمر `tx svm` هو معاملة في مسار Cosmos، فيحتاج حد غاز صريحًا ورسمًا لا يقل عن الغاز × 0.1 uqor، والتوقيع المشترك الهجين ما بعد الكمومي (انظر [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing)).

هذه أوامر واجهة سطر أوامر العقدة على Linux من مرجع العقدة. **UNTESTED: لم يُفتح المسار على شبكة الاختبار إلا بعد المقترح 37، ولم يُشغَّل أي نشر لبرنامج أو تنفيذ أو إنشاء حساب لهذه الصفحة.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

القراءات على عقدة، المتاحة أيًّا كانت حالة المسار:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript مع @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` طبقة رقيقة فوق `@solana/web3.js`. وليس فيها غلاف للمحمِّل (loader): استخدم واجهة سطر أوامر العقدة أعلاه للنشر، واستخدم الحزمة لبناء التعليمات وإرسالها إلى برنامج موجود أصلًا. ولا تضبط إعداداتها العامة المسبقة نقطة نهاية SVM عن قصد، فأعطها عنوان عقدتك الخاصة.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** يحتاج هذا المثال إلى عقدة تشغّلها بنفسك (المسار مفتوح على شبكة الاختبار). أما مقابل نقطة النهاية العامة فيُرفض الإرسال. وتعمل الاستدعاءات للقراءة فقط (`client.getBalance` و`client.getAccountInfo` و`client.getSignaturesForAddress`) مقابل `https://svm-testnet.qore.host` لأن `createSvmClient({ rpcUrl })` يقبل أي عنوان.

Python وGo وRust وJava: محوّلات SVM في هذه اللغات تبني الرسائل نفسها؛ وستضيف إصدارة SDK لاحقة دوال v3.2.8 المساعدة. وإلى ذلك الحين استخدم واجهة سطر أوامر العقدة أعلاه أو الرسالة الخام. ويستطيع أي مكتبة عميل Solana كذلك التخاطب مع المنفذ 8899 في عقدتك الخاصة لأن مجموعة الدوال متوافقة مع Solana.

## الحسابات والإيجار {#rent}

تدفع حسابات بيانات SVM مقابل المساحة التي تستخدمها. وتأتي الأرقام من المعاملات الحيّة أعلاه.

| البند | القاعدة | القيمة الحيّة (شبكة الاختبار) |
| ---- | ---- | -------------------- |
| الإيجار في السنة | حجم البيانات بالبايت × `lamports_per_byte` | 3,480 lamports للبايت |
| الحد الأدنى للإعفاء من الإيجار | الإيجار في السنة × `rent_exemption_multi` | المضاعف 2.0 |
| تمويل عند الحد الأدنى أو فوقه | لا يُحتسب عليه إيجار أبدًا | |
| تمويل دون الحد الأدنى | يُخصم الإيجار في كل حقبة (epoch) | |
| وصول الرصيد إلى الصفر | يُزال الحساب | |

العلاقة بين lamports وuqor هي: 1 uqor = 1,000 lamports. اسأل العقدة عن الحد الأدنى الدقيق بدل حسابه: فقد أعادت `getMinimumBalanceForRentExemption` القيمة 8,017,920 lamports لـ 1,024 بايت (يشمل التسعير ترويسة الحساب). ويحتاج `create-account` إلى هذا العدد من lamports على الأقل، وإلا لا يكون الحساب معفى من الإيجار.

العناوين: عنوان SVM لحساب هو بايتات الحساب العشرون مبطَّنة إلى 32 بايتًا ومكتوبة بـ base58. وتسمّي الصيغ `qor1...` و`0x...` وbase58 الحساب نفسه.

## مفتاح ما بعد كمومي لمحافظ SVM {#pqc-key}

محفظة SVM التي تريد مفتاحًا ما بعد كمومي على السلسلة تسجّله بالرسالة **`MsgRegisterSVMPQCKey`**. وتحمل المرسل وعنوان SVM ذا 32 بايتًا والمفتاح العام ML-DSA-87. وهي رسالة في مسار Cosmos، فيوقّعها المرسل توقيعًا هجينًا كأي معاملة أصلية أخرى. وتُرفض ما دام المسار مغلقًا، و**يجب أن يكون حساب SVM موجودًا قبل تسجيل مفتاحه** (انظر الرفض في [ما اختُبر على شبكة الاختبار](#tested)).

لا يوجد أمر `tx svm` لها؛ فاستخدم مُركِّب SDK. في TypeScript المُركِّب هو `msg.svm.registerSvmPqcKey` في `@qorechain/sdk`. **UNTESTED لحساب موجود: الإرسال الوحيد كان لعنوان بلا حساب، ورُفض.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

مُركِّب Python هو `msg.svm.register_svm_pqc_key(sender=, ...)` ومُركِّب Go هو `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## حدود الحضانة {#custody}

كل lamport يحتفظ به برنامج أو عنوان مشتق من برنامج أو حساب بيانات مدعوم بـ uqor تحتفظ بها وحدة SVM في مخزون واحد يُسمّى الحضانة. وتحدّه ثلاثة معاملات محكومة بالحوكمة. وكلها بوحدة uqor؛ و1 QOR يساوي 1,000,000 uqor. تغيّرها الحوكمة بمقترح معاملات، ويجب أن يرسل المقترح الحقول الاثني عشر كلها لأنه يستبدل المجموعة بأكملها.

| المعامل | القيمة الحيّة | بعبارة بسيطة |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10,000,000,000 (10,000 QOR) | سقف رصيد مخزون SVM. التحويل الذي سيرفع المخزون فوقه يُرفض بالخطأ `svm custody cap exceeded` (الرمز 23). والقيمة `0` تعني بلا سقف. |
| `max_custody_hard_uqor` | 1,000,000,000,000 (1,000,000 QOR) | السقف المطلق لرصيد المخزون الخام، بما فيه احتياطيات الإيجار والتمويل المسبق والتبرعات العادية. تُرفض العملية التي ستترك الرصيد فوقه. ويجب ألا يقل عن `max_custody_uqor`، ويجب أن يكون أكبر من الصفر كي يُفتح المسار. |
| `max_account_excess_uqor` | 10,000,000,000 (10,000 QOR) | أكثر ما يجوز أن يحمله حساب بيانات واحد فوق الحد الأدنى المعفى من الإيجار. والقيمة `0` تعني بلا سقف لكل حساب. |

معنى ذلك لتطبيقك: أبقِ القيمة التي تركنها في حسابات SVM متواضعة، وفوق الحد الأدنى للإيجار بما تحتاجه فقط. فقد يُرفض إيداع مناسب لرصيدك إذا كان المخزون ككل قريبًا من سقفه، فعامل الرمز 23 على أنه "حاول لاحقًا أو بمبلغ أقل"، لا على أنه معاملة غير صالحة. ولا يمكن أن تزيد الحدود إلا بتصويت حوكمة، لا بمعاملة مستخدم أبدًا.

## ميزانية الحوسبة وحدود الحجم {#limits}

| الحد | المعامل | القيمة الحيّة (شبكة الاختبار) |
| ----- | --------- | -------------------- |
| وحدات الحوسبة لكل تعليمة | `compute_budget_max` | 1,400,000 |
| حجم البرنامج (ELF) | `max_program_size` | 10,485,760 بايت (10 MiB) |
| حجم حساب البيانات | `max_account_data_size` | 10,485,760 بايت (10 MiB) |
| استدعاءات البرامج المتداخلة | `max_cpi` | 4 |
| نظام التوقيع الافتراضي | `default_sig_scheme` | 0 (Ed25519) |
| إزاحة الخانة (slot) | `svm_slot_offset` | 0 (الخانة هي ارتفاع الكتلة زائد الإزاحة) |

لكل إطار مكدّس (stack) بحجم 32 KiB وكومة (heap) بحجم 256 KiB. ويمكن أن تتغير القيم أعلاه بالحوكمة، فاقرأها حيّةً. وفي `@qorechain/svm` 0.13.0 تطلب `withComputeBudget(tx, { units })` حد وحدات حوسبة؛ فأبقِه عند `compute_budget_max` أو دونه.

## الحدود الحالية لنقطة نهاية SVM في شبكة الاختبار {#endpoint-limits}

المسار مفتوح، لكن JSON-RPC العام لـ SVM لا يتصرف بعدُ كعقدة Solana كاملة. خطّط وفق هذه الحدود:

- **تعيد `getLatestBlockhash` تجزئة الكتلة على هيئة 64 حرفًا ست عشريًا**، لا بصيغة base58 كما تفعل عقد Solana (قُرئت في 12 نوفمبر 2026: `blockhash` ‏`e8d4...d449`، و`lastValidBlockHeight` ‏9944659). والعميل الذي يتوقع base58 عليه أن يحوّلها. وقد جدول فريق السلسلة تغييرًا.
- **`sendTransaction` بصيغة Solana السلكية من أدوات Solana القياسية غير مدعومة بعدُ** على نقطة النهاية العامة. تُنشر البرامج وتُستدعى برسائل Cosmos ‏`MsgDeployProgram` و`MsgExecuteProgram`، موقّعة بالتوقيع الهجين كأي معاملة في مسار Cosmos (انظر دوال TypeScript المساعدة أعلاه). والتكافؤ الكامل مع أدوات Solana مخطط له لإصدار لاحق.
- **يستطيع مفتاح أجنبي تفويض إجراء SVM عبر مُرحِّل (relayer).** يوقّع التفويض ملخّصًا مرتبطًا بالسلسلة (النطاق `qorechain-svm-auth-v3`) متى فعّلت الشبكة ميزة البروتوكول `svm-relayed-chain-bound`؛ ويبنيه `@qorechain/wallet-adapter` 0.6.0 بالدالة `authSignBytesV3`، وتقرأ `resolveSvmAuthVersion` أي صيغة تريدها الشبكة.

## الأخطاء والرفض {#errors}

| ما تراه | المعنى | ما تفعله |
| ------------ | ------- | ---------- |
| `SVM module is disabled` (الرمز 11) | المسار مغلق (الشبكة الرئيسية، أو شبكة الاختبار قبل المقترح 37) | اقرأ `enabled`؛ ولا تعِد المحاولة |
| رُفضت `MsgRegisterSVMPQCKey` بالخطأ `SVM account ... not found` (codespace باسم `svm`، الرمز 3) | حساب SVM غير موجود بعد | أنشئ الحساب أولًا ثم سجّل مفتاحه |
| رُفضت `MsgRegisterSVMPQCKey` والمسار مغلق | المسار مغلق | سجّل بعد فتح المسار |
| رُفضت دالة كتابة على `svm.qore.host` أو `svm-testnet.qore.host` | نقطتا النهاية العامتان للقراءة فقط | استخدم عقدتك الخاصة |
| `svm custody cap exceeded` (الرمز 23) | المخزون عند سقفه | أعد المحاولة لاحقًا أو بمبلغ أقل |
| `airdrop rate limit exceeded` (الرمز 19) | استُدعيت `requestAirdrop` كثيرًا (شبكة الاختبار فقط) | انتظر |
| `blockhash expired` (الرمز 20) | تجزئة الكتلة الحديثة قديمة جدًا | اجلب واحدة جديدة ووقّع من جديد |
| `svm simulation slots busy, retry later` (الرمز 24) | المحاكاة محدودة؛ ولا يحدث هذا في كتلة أبدًا | أعد المحاكاة |
| HTTP 501 على `/qorechain/svm/v1/account/...` | المسار غير منفَّذ على نقطة النهاية العامة | استخدم `getAccountInfo` |

## ما اختُبر على شبكة الاختبار {#tested}

شُغّل على `qorechain-diana` في 12 نوفمبر 2026 (الإصدار v3.2.8) بعد نجاح المقترح 37.

| الخطوة | النتيجة |
| ---- | ------ |
| `GET /cosmos/circuit/v1/disable_list` | `/cosmwasm.wasm.v1.MsgStoreCode` فقط |
| `GET /qorechain/svm/v1/params` | `enabled` صحيحة؛ `max_program_size` ‏10485760، و`max_account_data_size` ‏10485760، و`compute_budget_max` ‏1400000، و`lamports_per_byte` ‏3480، و`rent_exemption_multi` ‏2، و`max_cpi` ‏4، و`max_custody_uqor` ‏10000000000، و`max_custody_hard_uqor` ‏1000000000000، و`max_account_excess_uqor` ‏10000000000 |
| `MsgRegisterSVMPQCKey` لعنوان SVM غير موجود بعد | رُفضت: codespace باسم `svm` والرمز 3، ‏`SVM account ... not found: SVM account not found`. يجب أن يوجد الحساب قبل تسجيل مفتاحه ما بعد الكمومي |

لم يُشغَّل (UNTESTED): نشر برنامج، وتنفيذ برنامج، وإنشاء حساب SVM.

## الشبكة الرئيسية {#mainnet}

تبقى الشبكة الرئيسية على v3.2.6 في الوقت الحالي، ومسار SVM مطفأ فيها، وتفعيله عليها يحتاج إصدارًا لاحقًا وتصويت حوكمة. فخطّط وفق شبكة الاختبار وحدها.

## انظر أيضًا {#see-also}

* [تطوير SVM](/developer-guide/svm-development): نظرة عامة على المسار وخادم JSON-RPC وQOR الأصلي بوحدة lamports.
* [JSON-RPC المتوافق مع Solana](/api-reference/json-rpc-solana-compatible): قائمة الدوال.
* [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing): التوقيع الهجين الذي تحتاجه كل معاملة في المسار الأصلي.
* [قابلية التشغيل البيني عبر الأنوية الافتراضية](/developer-guide/cross-vm-interoperability): الاستدعاءات بين SVM وEVM وQoreChain Native.
* [مشغّلو العقد: قائمة تحقق v3.2.8](/developer-guide/node-operators-v328): ترقية عقدة.
