---
slug: /developer-guide/svm-development
title: تطوير SVM
sidebar_label: تطوير SVM
sidebar_position: 4
---

# تطوير SVM

تتضمن QoreChain بيئة تنفيذ **Solana Virtual Machine (SVM)**، ما يتيح للمطورين نشر وتنفيذ برامج SBF/BPF باستخدام أدوات Solana المألوفة. تعرض وحدة SVM واجهة JSON-RPC متوافقة مع Solana على **المنفذ 8899**، ويقوم الأمر `qorechaind start` بتشغيلها تلقائيًا (انظر [خادم JSON-RPC](#json-rpc-server) أدناه).

:::note
تستخدم الأوامر أدناه الشبكة الرئيسية **`qorechain-vladi`**، العاملة منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.82**. استبدل `--chain-id qorechain-diana` لاستخدام شبكة الاختبار.
:::

---

## نظرة عامة

توفر وحدة `x/svm` ما يلي:

* **QOR الأصلي كأصل من الدرجة الأولى في SVM** — الرصيد الموحّد للحساب، مرئيًا بوحدة lamports
* نشر وتنفيذ برامج SBF/BPF
* إنشاء وإدارة حسابات البيانات
* نقطة نهاية JSON-RPC متوافقة مع Solana
* ربط ثنائي الاتجاه للعناوين بين صيغتي عناوين QoreChain وSolana
* قياس ميزانية الحوسبة واقتصاد تخزين قائم على الإيجار (rent)

---

## QOR الأصلي على واجهة SVM {#native-qor}

اعتبارًا من إصدار السلسلة **v3.1.82**، أصبحت واجهة SVM **واجهة QOR أصلية من الدرجة الأولى**، وليست رصيدًا منفصلًا في بيئة معزولة. الرصيد الموحّد الوحيد للحساب — وهو نفس الأموال المرئية بوحدة `uqor` على واجهة Cosmos وبوحدة wei ذات 18 خانة عشرية على EVM — يظهر على جانب SVM بوحدة **lamports** (9 خانات عشرية):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** تُرجعان رصيد QOR الأصلي للحساب (بوحدة lamports).
* **`getSignaturesForAddress`** تُرجع سجل المعاملات التي تمس عنوانًا ما — ويمكن استخدامها لاكتشاف الإيداعات باستخدام أدوات Solana القياسية.
* **تحويلات System Program تنقل QOR الأصلي** — تعليمة تحويل بأسلوب Solana تنقل نفس الأموال التي تنقلها معاملة `MsgSend` على Cosmos أو تحويل على EVM.
* **صيغة عنوان SVM** — عنوان SVM للحساب هو بايتات الحساب العشرون مُبطَّنة من اليمين إلى 32 بايتًا ومُرمَّزة بصيغة base58. صيغ العناوين الثلاث (`qor1...`، `0x...`، base58) تشير جميعها إلى الحساب نفسه.

نقاط النهاية العامة (`https://svm.qore.host`، `https://svm-testnet.qore.host`) هي **للقراءة فقط** — إرسال المعاملات معطَّل عند الحافة. شغّل عقدتك الخاصة (المنفذ 8899) لإرسال معاملات SVM.

---

## خادم JSON-RPC {#json-rpc-server}

خادم JSON-RPC المتوافق مع Solana **يُشغَّل بواسطة `qorechaind start`** وهو **مفعَّل افتراضيًا**. تتم تهيئته عبر قسم `[svm-rpc]` في ملف `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

القيم الافتراضية هي `enable = true` و`address = "127.0.0.1:8899"`، لذا فإن العقدة المشغَّلة حديثًا تخدم واجهة Solana JSON-RPC على المنفذ 8899 مباشرة — وتتصل `@solana/web3.js` عبر `http://127.0.0.1:8899` دون أي إعداد إضافي. تُبلغ `getVersion` عن `1.18.0-qorechain`، وتُرجع `getBalance` / `getAccountInfo` حسابات SVM الحية على السلسلة.

| الخاصية       | القيمة                    |
| ------------- | ------------------------- |
| عنوان URL الافتراضي | `http://127.0.0.1:8899`   |
| مفعَّل         | نعم، افتراضيًا            |
| يُشغَّل بواسطة | `qorechaind start`        |
| التوافق       | Solana JSON-RPC (مجموعة جزئية) |
| `getVersion`  | `1.18.0-qorechain`        |

### الطرق المدعومة

| الطريقة                             | الوصف                                     |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | استرجاع بيانات الحساب ورصيد lamports      |
| `getBalance`                        | الحصول على رصيد الحساب بوحدة lamports (QOR الأصلي) |
| `getSignaturesForAddress`           | سجل المعاملات لعنوان ما                   |
| `getSlot`                           | رقم الفتحة (slot) الحالي                  |
| `getMinimumBalanceForRentExemption` | الحد الأدنى للرصيد لحجم بيانات معيّن      |
| `getVersion`                        | معلومات إصدار بيئة تشغيل SVM              |
| `getHealth`                         | فحص سلامة نقطة نهاية SVM                  |

---

## نشر البرامج والتفاعل معها

:::info
**تنفيذ SBF حديث.** تم تحديث محرك تنفيذ SVM ليعتمد على **solana-sbpf 0.21.1**، لذا فإن برامج SBF المُجمَّعة حديثًا بسلسلة أدوات Solana الحالية (**platform-tools v1.53 / agave 4.x**) **تُنشر وتعمل** على QoreChain — التنفيذ مدعوم بالكامل، وليس النشر فقط. البرامج المبنية بأيٍّ من `cargo build-sbf --arch v0` أو `--arch v3` مدعومة.
:::

1. **نشر برنامج SBF** — قم بتجميع برنامج Solana الخاص بك إلى كائن مشترك بصيغة SBF باستخدام platform-tools الحالية (v1.53 / agave 4.x)، ثم انشره على QoreChain:

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

   تتضمن استجابة المعاملة **معرّف البرنامج (program ID)** بصيغة base58.

2. **تنفيذ تعليمة** — استدعِ برنامج BPF على السلسلة مع بيانات التعليمة:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | المعامل             | الصيغة            | الوصف                          |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | سلسلة Base58      | عنوان البرنامج المنشور         |
   | `data-hex`          | بايتات مرمَّزة بصيغة سداسية عشرية | بيانات التعليمة المُسلسَلة |

3. **إنشاء حساب بيانات** — كثيرًا ما تحتاج البرامج إلى حسابات لتخزين الحالة. أنشئ حسابًا بحجم ومالك محددين:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | المعامل        | الوصف                                              |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | البرنامج الذي يملك هذا الحساب (base58)             |
   | `space`        | حجم حقل البيانات بالبايت                           |
   | `lamports`     | الرصيد الأولي (يجب أن يستوفي الحد الأدنى للإعفاء من الإيجار) |

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

4. **استخدام @solana/web3.js** — تعمل حزمة Solana JavaScript SDK مباشرة مع نقطة نهاية SVM في QoreChain:

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

## ربط العناوين

تحتفظ QoreChain بـ**ربط ثنائي الاتجاه للعناوين** بين عناوين Bech32 الأصلية (`qor1...`) والعناوين بصيغة base58 على نمط Solana:

| الاتجاه       | مثال                                                       |
| ------------- | ---------------------------------------------------------- |
| من الأصلي إلى SVM | `qor1abc...xyz` يُربط بعنوان base58 حتمي                 |
| من SVM إلى الأصلي | عناوين البرامج بصيغة Base58 تُربط عكسيًا بمكافئاتها `qor1...` |

الربط حتمي وتديره وحدة `x/svm`. كلا التمثيلين يشيران إلى الحساب الأساسي نفسه.

---

## نموذج الإيجار (Rent)

تستخدم وحدة SVM **نموذج تخزين قائمًا على الإيجار** لمنع تضخم الحالة:

| المعامل                    | القيمة     |
| -------------------------- | ---------- |
| Lamports لكل بايت في السنة | `3,480`    |
| مضاعف الإعفاء من الإيجار   | `2.0`      |
| تكرار التحصيل              | كل حقبة (epoch) |

* الحسابات التي يكون رصيدها **أعلى** من `2 * (data_size * 3480 / seconds_per_year)` بوحدة lamports تكون **مُعفاة من الإيجار** ولا تُحصَّل منها رسوم أبدًا.
* الحسابات **الأدنى** من عتبة الإعفاء من الإيجار يُحصَّل منها إيجار في كل حقبة. إذا وصل الرصيد إلى الصفر، يُحذف الحساب.

:::info
**أفضل ممارسة:** موِّل حسابات البيانات دائمًا فوق الحد الأدنى للإعفاء من الإيجار لتجنب حذف الحساب غير المتوقع.
:::

---

## ميزانية الحوسبة

يُقاس تنفيذ كل تعليمة بوحدات الحوسبة:

| المعامل                                  | القيمة      |
| ---------------------------------------- | ----------- |
| الحد الأقصى لوحدات الحوسبة لكل تعليمة    | `1,400,000` |
| الحد الأقصى لعمق CPI (الاستدعاء عبر البرامج) | `4`     |
| الحد الأقصى لحجم البرنامج                | `10 MB`     |
| الحد الأقصى لحجم بيانات الحساب           | `10 MB`     |

البرامج التي تتجاوز ميزانية الحوسبة تُوقَف وتُلغى المعاملة.

---

## ملخص المعاملات (Parameters)

| المعامل                     | القيمة       |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| منفذ JSON-RPC               | 8899         |

---

## قابلية التشغيل البيني عبر الأجهزة الافتراضية

يمكن لبرامج SVM التواصل مع عقود EVM وCosmWasm عبر مسار رسائل **غير متزامن** بين الأجهزة الافتراضية:

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

تُوضع الرسائل في طابور وتُعالج بواسطة EndBlocker. انظر [قابلية التشغيل البيني عبر الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) لمزيد من التفاصيل حول دورة حياة الرسائل وسلوك المهلة الزمنية.

---

## الخطوات التالية

* [قابلية التشغيل البيني عبر الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) — التواصل بين SVM وEVM وCosmWasm
* [تطوير EVM](/developer-guide/evm-development) — عقود Solidity الذكية على QoreChain
* [تطوير CosmWasm](/developer-guide/cosmwasm-development) — عقود WebAssembly المبنية بلغة Rust
