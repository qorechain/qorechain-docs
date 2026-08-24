---
slug: /developer-guide/svm-development
title: تطوير SVM
sidebar_label: تطوير SVM
sidebar_position: 4
---

# تطوير SVM

تتضمن QoreChain بيئة تنفيذ **Solana Virtual Machine (SVM)**، تتيح للمطورين نشر وتنفيذ برامج SBF/BPF باستخدام أدوات Solana المألوفة. توفّر وحدة SVM واجهة JSON-RPC متوافقة مع Solana على **المنفذ 8899**، والتي يشغّلها أمر `qorechaind start` تلقائيًا (انظر [خادم JSON-RPC](#json-rpc-server) أدناه).

:::note
تستخدم الأوامر أدناه شبكة **`qorechain-vladi`** الرئيسية، العاملة منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.92**. استبدل `--chain-id qorechain-diana` للشبكة التجريبية.
:::

---

:::caution إرسال معاملات SVM معطّل حاليًا
اعتبارًا من إصدار السلسلة v3.1.89 (22 أغسطس)، وعقب حادثة وقعت، أصبح مسار تنفيذ SVM **معطّلًا على مستوى الشبكة بأكملها بالنسبة لإرسال المعاملات** — أي معاملة تُرسَل إلى `x/svm` (نشر برنامج، تنفيذ تعليمات، إنشاء حساب، تحويلات) تُعيد `code 11, "SVM module is disabled"`. ينطبق هذا على عقدتك الخاصة أيضًا وعلى النقاط العامة سواء بسواء. قد تستجيب طرق RPC ذات طابع القراءة، لكن لا تبنِ أو تختبر تكاملًا فعليًا مع SVM إلى أن يُعاد فتح المسار.
:::

## نظرة عامة

توفّر وحدة `x/svm` ما يلي:

* **عملة QOR الأصلية كأصل من الدرجة الأولى على SVM** — الرصيد الموحّد للحساب، ظاهرًا باللامبورت (lamports)
* نشر وتنفيذ برامج SBF/BPF
* إنشاء وإدارة حسابات البيانات
* نقطة نهاية JSON-RPC متوافقة مع Solana
* تخطيط عناوين ثنائي الاتجاه بين تنسيقَي عناوين QoreChain وSolana
* قياس ميزانية الحوسبة واقتصاديات التخزين القائمة على الإيجار

---

## عملة QOR الأصلية على واجهة SVM {#native-qor}

اعتبارًا من إصدار السلسلة **v3.1.82**، أصبحت واجهة SVM **واجهة QOR أصلية من الدرجة الأولى**، وليست رصيدًا معزولًا منفصلًا. الرصيد الموحّد الواحد للحساب — نفس الأموال الظاهرة كـ `uqor` على واجهة Cosmos وكـ wei بـ 18 منزلة عشرية على واجهة EVM — يظهر على جانب SVM باللامبورت (9 منازل عشرية):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** تُعيدان رصيد الحساب من QOR الأصلية (باللامبورت).
* **`getSignaturesForAddress`** تُعيد سجل المعاملات المرتبطة بعنوان — قابل للاستخدام لرصد الإيداعات باستخدام أدوات Solana القياسية.
* **تحويلات System Program تنقل عملة QOR الأصلية** — تعليمة تحويل بأسلوب Solana تنقل نفس الأموال التي كانت ستنقلها `MsgSend` على Cosmos أو تحويل على EVM.
* **صيغة عنوان SVM** — عنوان SVM الخاص بالحساب هو الـ 20 بايت الخاصة بالحساب، مكمَّلة يمينًا لتصبح 32 بايت ومُرمَّزة بـ base58. صيغ العناوين الثلاث كلها (`qor1...`، `0x...`، base58) تشير إلى الحساب ذاته.

النقاط العامة (`https://svm.qore.host`، `https://svm-testnet.qore.host`) هي **للقراءة فقط** — إرسال المعاملات معطّل عند الحافة. في الوضع الطبيعي كنت ستشغّل عقدتك الخاصة (المنفذ 8899) لإرسال معاملات SVM، لكن انظر التحذير أعلاه: مسار معاملات `x/svm` نفسه معطّل حاليًا على مستوى الشبكة بأكملها، بما في ذلك على عقدتك الخاصة.

---

## خادم JSON-RPC {#json-rpc-server}

خادم JSON-RPC المتوافق مع Solana **يُشغَّل بواسطة `qorechaind start`** وهو **مُفعَّل افتراضيًا**. يُضبط عبر قسم `[svm-rpc]` في `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

القيم الافتراضية هي `enable = true` و `address = "127.0.0.1:8899"`، لذا فإن عقدة شُغِّلت للتو تقدّم بالفعل واجهة Solana JSON-RPC على المنفذ 8899 — تتصل `@solana/web3.js` عبر `http://127.0.0.1:8899` دون أي إعداد إضافي. تُبلغ `getVersion` عن `1.18.0-qorechain`، وتُعيد `getBalance` / `getAccountInfo` حسابات SVM الفعلية الحيّة على السلسلة.

| الخاصية       | القيمة                     |
| ------------- | ------------------------- |
| العنوان الافتراضي   | `http://127.0.0.1:8899`   |
| مُفعَّل       | نعم، افتراضيًا           |
| يُشغَّل بواسطة    | `qorechaind start`        |
| التوافقية | Solana JSON-RPC (مجموعة فرعية)  |
| `getVersion`  | `1.18.0-qorechain`        |

### الطرق المدعومة

| الطريقة                              | الوصف                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | استرجاع بيانات الحساب ورصيد اللامبورت |
| `getBalance`                        | الحصول على رصيد الحساب باللامبورت (عملة QOR الأصلية) |
| `getSignaturesForAddress`           | سجل المعاملات لعنوان ما        |
| `getSlot`                           | رقم الـ slot الحالي                       |
| `getMinimumBalanceForRentExemption` | الحد الأدنى للرصيد للإعفاء من الإيجار لحجم بيانات معيّن     |
| `getVersion`                        | معلومات إصدار وقت تشغيل SVM        |
| `getHealth`                         | فحص سلامة نقطة نهاية SVM         |

---

## نشر البرامج والتفاعل معها

:::info
**تنفيذ SBF حديث.** جرى تحديث محرك تنفيذ SVM ليعتمد على **solana-sbpf 0.21.1**، لذا فإن برامج SBF المُجمَّعة حديثًا من سلسلة أدوات Solana الحالية (**platform-tools v1.53 / agave 4.x**) **تُنشَر وتعمل** على QoreChain — التنفيذ مدعوم بالكامل، وليس مقتصرًا على النشر فقط. البرامج المبنية باستخدام إما `cargo build-sbf --arch v0` أو `--arch v3` مدعومة.
:::

1. **نشر برنامج SBF** — قم بتجميع برنامج Solana الخاص بك إلى كائن مشترك SBF باستخدام platform-tools الحالية (v1.53 / agave 4.x)، ثم انشره على QoreChain:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   تتضمن استجابة المعاملة **معرّف البرنامج** بصيغة base58.

2. **تنفيذ تعليمة** — استدعِ برنامج BPF موجودًا على السلسلة ببيانات تعليمات:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | المعامل           | الصيغة            | الوصف                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | سلسلة base58     | عنوان البرنامج المنشور |
   | `data-hex`          | بايتات مُرمَّزة بالسداسي عشري | بيانات التعليمات المُسلسلة    |

3. **إنشاء حساب بيانات** — غالبًا ما تحتاج البرامج إلى حسابات لتخزين الحالة. أنشئ واحدًا بحجم ومالك محدَّدين:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | المعامل      | الوصف                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | البرنامج المالك لهذا الحساب (base58)        |
   | `space`        | حجم حقل البيانات بالبايت                    |
   | `lamports`     | الرصيد الابتدائي (يجب أن يفي بحد الإعفاء الأدنى من الإيجار) |

   استعلم عن الحد الأدنى للرصيد المُعفى من الإيجار لحجم معيّن:

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **استخدام @solana/web3.js** — تعمل حزمة Solana JavaScript SDK مباشرةً مع نقطة نهاية QoreChain SVM:

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## تخطيط العناوين

تحافظ QoreChain على **تخطيط عناوين ثنائي الاتجاه** بين عناوين Bech32 الأصلية (`qor1...`) وعناوين base58 على طراز Solana:

| الاتجاه     | مثال                                                    |
| ------------- | ---------------------------------------------------------- |
| من الأصلي إلى SVM | `qor1abc...xyz` يُخطَّط إلى عنوان base58 حتمي     |
| من SVM إلى الأصلي | عناوين البرامج بصيغة base58 تُخطَّط عودةً إلى ما يعادلها بصيغة `qor1...` |

التخطيط حتمي وتديره وحدة `x/svm`. كلا التمثيلين يشيران إلى الحساب الأساسي ذاته.

---

## نموذج الإيجار

تستخدم وحدة SVM **نموذج تخزين قائم على الإيجار** لمنع تضخم الحالة:

| المعامل                  | القيمة      |
| -------------------------- | ---------- |
| لامبورت لكل بايت في السنة | `3,480`    |
| مضاعِف الإعفاء من الإيجار  | `2.0`      |
| تكرار التحصيل       | كل حقبة (epoch) |

* الحسابات التي يكون رصيدها **أعلى** من `2 * (data_size * 3480 / seconds_per_year)` باللامبورت تكون **معفاة من الإيجار** ولا تُحاسَب أبدًا.
* الحسابات **الأدنى** من حد الإعفاء من الإيجار تُحاسَب على الإيجار كل حقبة. إذا وصل الرصيد إلى صفر، يُحذَف الحساب.

:::info
**أفضل ممارسة:** موِّل حسابات البيانات دائمًا فوق الحد الأدنى للإعفاء من الإيجار لتجنّب حذف الحساب غير المتوقَّع.
:::

---

## ميزانية الحوسبة

يُقاس كل تنفيذ تعليمة بوحدات حوسبة:

| المعامل                                | القيمة       |
| ---------------------------------------- | ----------- |
| الحد الأقصى لوحدات الحوسبة لكل تعليمة        | `1,400,000` |
| الحد الأقصى لعمق CPI (الاستدعاء عبر البرامج) | `4`         |
| الحد الأقصى لحجم البرنامج         | `10 MB`     |
| الحد الأقصى لحجم بيانات الحساب    | `10 MB`     |

البرامج التي تتجاوز ميزانية الحوسبة تُوقَف وتُلغى المعاملة.

---

## ملخص المعاملات

| المعامل                   | القيمة        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| منفذ JSON-RPC               | 8899         |

---

## التشغيل البيني بين الآلات الافتراضية (Cross-VM)

يمكن لبرامج SVM التواصل مع عقود EVM وCosmWasm عبر مسار الرسائل **غير المتزامن** بين الآلات الافتراضية:

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

تُوضَع الرسائل في قائمة انتظار وتُعالَج بواسطة EndBlocker. انظر [التشغيل البيني بين الآلات الافتراضية](/developer-guide/cross-vm-interoperability) للاطلاع على تفاصيل دورة حياة الرسالة وسلوك المهلة الزمنية.

---

## الخطوات التالية

* [التشغيل البيني بين الآلات الافتراضية](/developer-guide/cross-vm-interoperability) — التواصل بين SVM وEVM وCosmWasm
* [تطوير EVM](/developer-guide/evm-development) — عقود Solidity الذكية على QoreChain
* [تطوير CosmWasm](/developer-guide/cosmwasm-development) — عقود WebAssembly المبنية بلغة Rust
