---
slug: /developer-guide/svm-development
title: تطوير SVM
sidebar_label: تطوير SVM
sidebar_position: 4
---

# تطوير SVM

تتضمّن QoreChain بيئة تنفيذ **آلة سولانا الافتراضية (SVM)**، ممّا يتيح للمطوّرين نشر وتنفيذ برامج SBF/BPF باستخدام أدوات سولانا المألوفة. تعرض وحدة SVM واجهة JSON-RPC متوافقة مع سولانا على **المنفذ 8899**، والتي يُشغّلها `qorechaind start` تلقائيًا (راجع [خادم JSON-RPC](#json-rpc-server) أدناه).

:::note
تستخدم الأوامر أدناه شبكة **`qorechain-vladi`** الرئيسية، النشطة منذ 7 يونيو 2026 وتشغّل إصدار السلسلة **v3.1.77**. استبدلها بـ `--chain-id qorechain-diana` لشبكة الاختبار.
:::

---

## نظرة عامة

توفّر وحدة `x/svm` ما يلي:

* نشر وتنفيذ برامج SBF/BPF
* إنشاء حسابات البيانات وإدارتها
* نقطة نهاية JSON-RPC متوافقة مع سولانا
* تعيين عناوين ثنائي الاتجاه بين تنسيقي العناوين في QoreChain وسولانا
* قياس ميزانية الحوسبة واقتصاديات التخزين القائمة على الإيجار

---

## خادم JSON-RPC {#json-rpc-server}

يتم **تشغيل** خادم JSON-RPC المتوافق مع سولانا **بواسطة `qorechaind start`** وهو **مُفعّل افتراضيًا**. تتم تهيئته من خلال قسم `[svm-rpc]` في `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

القيم الافتراضية هي `enable = true` و `address = "127.0.0.1:8899"`، لذا فإن العقدة المُشغّلة حديثًا تخدم بالفعل واجهة JSON-RPC الخاصة بسولانا على المنفذ 8899 — يتصل `@solana/web3.js` على `http://127.0.0.1:8899` دون أي إعداد إضافي. يُبلّغ `getVersion` عن `1.18.0-qorechain`، ويُعيد `getBalance` / `getAccountInfo` حسابات SVM الحيّة على السلسلة.

| الخاصية      | القيمة                     |
| ------------- | ------------------------- |
| عنوان URL الافتراضي   | `http://127.0.0.1:8899`   |
| مُفعّل       | نعم، افتراضيًا           |
| يُشغّل بواسطة    | `qorechaind start`        |
| التوافق | Solana JSON-RPC (مجموعة فرعية)  |
| `getVersion`  | `1.18.0-qorechain`        |

### الطرق المدعومة

| الطريقة                              | الوصف                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | استرجاع بيانات الحساب ورصيد lamport |
| `getBalance`                        | الحصول على رصيد الحساب بوحدة lamports           |
| `getSlot`                           | رقم الفتحة الحالية                       |
| `getMinimumBalanceForRentExemption` | الحد الأدنى للرصيد لحجم بيانات معيّن     |
| `getVersion`                        | معلومات إصدار وقت تشغيل SVM                  |
| `getHealth`                         | فحص سلامة نقطة نهاية SVM         |

---

## نشر البرامج والتفاعل معها

:::info
**تنفيذ SBF الحديث.** تم تحديث محرّك تنفيذ SVM إلى **solana-sbpf 0.21.1**، لذا فإن برامج SBF المُجمّعة حديثًا من سلسلة أدوات سولانا الحالية (**platform-tools v1.53 / agave 4.x**) **تُنشر وتعمل** على QoreChain — التنفيذ مدعوم بالكامل، وليس النشر فقط. البرامج المبنية باستخدام `cargo build-sbf --arch v0` أو `--arch v3` مدعومة.
:::

1. **نشر برنامج SBF** — قم بتجميع برنامج سولانا الخاص بك إلى كائن مشترك SBF باستخدام platform-tools الحالية (v1.53 / agave 4.x)، ثم انشره على QoreChain:

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

   تتضمّن استجابة المعاملة **معرّف البرنامج** بتنسيق base58.

2. **تنفيذ تعليمة** — استدعِ برنامج BPF على السلسلة مع بيانات التعليمة:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | المعامل           | التنسيق            | الوصف                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | سلسلة Base58     | عنوان البرنامج المنشور |
   | `data-hex`          | بايتات مُرمّزة بالنظام الست عشري | بيانات التعليمة المُسلسلة    |

3. **إنشاء حساب بيانات** — غالبًا ما تحتاج البرامج إلى حسابات لتخزين الحالة. أنشئ حسابًا بحجم ومالك محددين:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | المعامل      | الوصف                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | البرنامج الذي يملك هذا الحساب (base58)        |
   | `space`        | حجم حقل البيانات بالبايت                    |
   | `lamports`     | الرصيد الأولي (يجب أن يفي بالحد الأدنى للإعفاء من الإيجار) |

   استعلم عن الحد الأدنى للرصيد المعفى من الإيجار لحجم معيّن:

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

4. **استخدام @solana/web3.js** — تعمل حزمة تطوير جافاسكريبت الخاصة بسولانا مباشرة مع نقطة نهاية SVM في QoreChain:

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

## تعيين العناوين

تحتفظ QoreChain بـ **تعيين عناوين ثنائي الاتجاه** بين عناوين Bech32 الأصلية (`qor1...`) وعناوين base58 بأسلوب سولانا:

| الاتجاه     | مثال                                                    |
| ------------- | ---------------------------------------------------------- |
| من الأصلي إلى SVM | يُعيّن `qor1abc...xyz` إلى عنوان base58 حتمي     |
| من SVM إلى الأصلي | تُعيَّن عناوين برامج base58 مرة أخرى إلى مكافئات `qor1...` |

التعيين حتمي وتديره وحدة `x/svm`. يشير كلا التمثيلين إلى الحساب الأساسي نفسه.

---

## نموذج الإيجار

تستخدم وحدة SVM **نموذج تخزين قائمًا على الإيجار** لمنع تضخّم الحالة:

| المعامل                  | القيمة      |
| -------------------------- | ---------- |
| Lamports لكل بايت في السنة | `3,480`    |
| مضاعف الإعفاء من الإيجار  | `2.0`      |
| تكرار التحصيل         | كل حقبة |

* الحسابات التي يكون رصيدها **أعلى من** `2 * (data_size * 3480 / seconds_per_year)` بوحدة lamports هي حسابات **معفاة من الإيجار** ولا يُفرض عليها أي رسوم أبدًا.
* الحسابات **الأقل من** عتبة الإعفاء من الإيجار يُفرض عليها إيجار في كل حقبة. إذا وصل الرصيد إلى صفر، يُحذف الحساب.

:::info
**أفضل ممارسة:** قم دائمًا بتمويل حسابات البيانات فوق الحد الأدنى للإعفاء من الإيجار لتجنّب حذف الحساب غير المتوقع.
:::

---

## ميزانية الحوسبة

يُقاس تنفيذ كل تعليمة بوحدات حوسبة:

| المعامل                                | القيمة       |
| ---------------------------------------- | ----------- |
| الحد الأقصى لوحدات الحوسبة لكل تعليمة        | `1,400,000` |
| الحد الأقصى لعمق CPI (الاستدعاء عبر البرامج) | `4`         |
| الحد الأقصى لحجم البرنامج                         | `10 MB`     |
| الحد الأقصى لحجم بيانات الحساب                    | `10 MB`     |

البرامج التي تتجاوز ميزانية الحوسبة يتم إيقافها وتُلغى المعاملة.

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

## قابلية التشغيل البيني عبر الأجهزة الافتراضية

يمكن لبرامج SVM التواصل مع عقود EVM و CosmWasm عبر مسار الرسائل **غير المتزامن** عبر الأجهزة الافتراضية:

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

تُوضع الرسائل في قائمة انتظار وتُعالج بواسطة EndBlocker. راجع [قابلية التشغيل البيني عبر الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) لمزيد من التفاصيل حول دورة حياة الرسالة وسلوك المهلة.

---

## الخطوات التالية

* [قابلية التشغيل البيني عبر الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) — التواصل بين SVM و EVM و CosmWasm
* [تطوير EVM](/developer-guide/evm-development) — عقود Solidity الذكية على QoreChain
* [تطوير CosmWasm](/developer-guide/cosmwasm-development) — عقود WebAssembly القائمة على Rust
