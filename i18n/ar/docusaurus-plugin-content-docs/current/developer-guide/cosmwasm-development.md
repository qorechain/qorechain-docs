---
slug: /developer-guide/cosmwasm-development
title: تطوير QoreChain Native
sidebar_label: تطوير QoreChain Native
sidebar_position: 3
---

# تطوير QoreChain Native

تدعم QoreChain عقود **QoreChain Native** الذكية. QoreChain Native هو اسم QoreChain لبيئة تشغيل **CosmWasm** الخاصة بها: يكتب المطورون برامج آمنة ومعزولة بلغة Rust باستخدام مكتبات CosmWasm القياسية (`cosmwasm-std`) ويُجمِّعونها إلى WebAssembly. تعمل عقود QoreChain Native جنباً إلى جنب مع برامج EVM وSVM ضمن بنية QoreChain ثلاثية الآلة الافتراضية.

:::note
تستخدم الأوامر أدناه الشبكة الرئيسية **`qorechain-vladi`** (العاملة منذ 7 يونيو 2026)، التي تشغّل إصدار العقدة **v3.2.3** حتى الارتفاع 3,742,566 والإصدار **v3.2.4** من تلك الكتلة (مقترح الحوكمة 13). استبدل `--chain-id qorechain-diana` لشبكة الاختبار، التي تشغّل الإصدار v3.2.4 منذ 19 أكتوبر 2026.
:::

:::caution رفع الكود والتهيئة يتطلبان حالياً إذناً صريحاً
حتى وقت كتابة هذا النص، تم ضبط كل من `code_upload_access` و`instantiate_default_permission` على **`Nobody`** على **كل من الشبكة الرئيسية وشبكة الاختبار** — أي أن `MsgStoreCode` و`MsgInstantiateContract` ليستا متاحتين لأي حساب بشكل افتراضي، وذلك عقب استشارة أمنية على مستوى الصناعة بشأن CosmWasm، وهي بيئة التشغيل التي تُبنى عليها QoreChain Native. ستحتاج إلى قرار حوكمة يمنح حسابك (أو قائمة عناوين محددة) إذن الرفع/التهيئة قبل أن تنجح الخطوات أدناه. تحقّق أولاً من المعاملات الفعلية على الشبكة، لأن هذا بالضبط نوع الإعداد الذي يمكن للحوكمة تغييره (لا يوجد حالياً أي كود عقد مخزَّن على الشبكة الرئيسية إطلاقاً):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

أنواع الرسائل `MsgStoreCode` و`MsgInstantiateContract` و`MsgInstantiateContract2` متوقفة أيضاً بواسطة قاطع الدائرة في السلسلة على الشبكتين (`qorechaind query circuit disabled-list`)، لذا لا يكفي رفع الإذن وحده ما لم يتم رفع الإيقاف عن هذه الإدخالات.

هذا القيد لا يؤثر على العقود التي سبق أن تمت تهيئتها — عمليتا `execute` و`query` على عقد قائم تعملان بشكل طبيعي بغض النظر عن هذا الإعداد.
:::

:::caution وقّع باستخدام `tx pqc cosign`
تتطلب الشبكة الرئيسية وشبكة الاختبار توقيعاً هجيناً مقاوماً للحوسبة الكمومية على كل معاملة في مسار Cosmos، ولذلك لا تُبَثّ أوامر `tx` في هذه الصفحة كما هي مكتوبة. فهي تبني المعاملة باستخدام `--generate-only > tx.json`؛ ثم وقّعها وابثّها باستخدام `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (يتضمن الملف التنفيذي المُصدَر من [قائمة التنزيل](/developer-guide/running-a-node#fetch-the-manifest) أداة التوقيع، أما البناء من الشيفرة المصدرية العامة فلا يتضمنها). حدّ الرسوم الأدنى في الشبكة هو **0.1 uqor لكل وحدة غاز**، وهو ما يعبّر عنه `--gas-prices 0.1uqor`؛ ويضيف التوقيع الهجين نحو 47,000 وحدة غاز لا تشملها المحاكاة، ومن هنا جاء معامل التعديل `1.5`. راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing).
:::

---

## المتطلبات المسبقة

| التبعية                    | الإصدار       | الغرض                          |
| --------------------------- | ------------- | ------------------------------- |
| **Rust**                    | أحدث إصدار مستقر | تجميع العقود                  |
| **wasm32-unknown-unknown**  | الهدف         | هدف تجميع WebAssembly          |
| **cargo-generate**          | الأحدث        | هيكلة المشروع                  |
| **cosmwasm-std**           | 1.5+          | مكتبة CosmWasm القياسية              |

ثبّت هدف Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## دورة حياة العقد

تتّبع عقود QoreChain Native دورة حياة من خمس خطوات: **البناء**، و**التخزين**، و**التهيئة**، و**التنفيذ**، و**الاستعلام**.

1. **البناء** — جمّع عقدك إلى WebAssembly محسَّن:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   سيكون ملف `.wasm` المحسَّن في المجلد `artifacts/`.

2. **التخزين** — ارفع العقد المُجمَّع إلى السلسلة:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   بعد تأكيد المعاملة (وقّع `tx.json` وابثّه باستخدام `tx pqc cosign` كما هو موضح أعلاه)، استعلم عن معرّف الكود المخزَّن:

   ```bash
   qorechaind query wasm list-code
   ```

3. **التهيئة** — أنشئ نسخة عقد جديدة من معرّف كود مخزَّن:

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | العلامة              | الوصف                                          |
   | --------------------- | ------------------------------------------------ |
   | `<code-id>`           | المعرّف الرقمي المُعاد من معاملة التخزين       |
   | `--label`             | تسمية مقروءة لهذه النسخة                        |
   | `--no-admin`          | لا يوجد عنوان مسؤول (العقد غير قابل للتعديل)    |
   | `--admin <address>`   | تعيين مسؤول قادر على ترحيل العقد                |

   استرجع عنوان العقد:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **التنفيذ** — استدعِ نقطة دخول التنفيذ في العقد لتغيير الحالة:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   التنفيذ مع إرفاق أموال:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **الاستعلام** — اقرأ حالة العقد دون إرسال معاملة:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   تُعاد استجابات الاستعلام بصيغة JSON.

---

## استعلامات مفيدة

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contract-by-code <code-id>

# Get contract info (code ID, admin, label)
qorechaind query wasm contract <contract-addr>

# Get raw contract state by key
qorechaind query wasm contract-state raw <contract-addr> <key-hex>

# Get full contract state (all keys)
qorechaind query wasm contract-state all <contract-addr>

# Get contract history (instantiate/migrate events)
qorechaind query wasm contract-history <contract-addr>
```

---

## بنية العقد

يحتوي عقد QoreChain Native النموذجي على ثلاث نقاط دخول:

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize contract state
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle state-changing operations
    Ok(Response::new().add_attribute("method", "execute"))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle read-only queries
    Ok(Binary::default())
}
```

---

## استدعاءات عبر الآلات الافتراضية

تُرسَل الاستدعاءات عبر الآلات الافتراضية على هيئة معاملات `MsgCrossVMCall` من خلال وحدة `x/crossvm`؛ راجع [التشغيل البيني عبر الآلات الافتراضية](/developer-guide/cross-vm-interoperability) للاطلاع على دورة حياة الرسالة. لا يوجد حالياً ربط من جهة العقد لبدء استدعاء عبر الآلات الافتراضية (فلا توجد رسالة `QoreChainMsg` مخصصة يمكن للعقود إصدارها)، ولذلك لا يستطيع العقد استدعاء عقد EVM أو SVM من داخل نقطة الدخول `execute`. ومنذ v3.2.3 يُرفض أي استدعاء موجَّه إلى مسار المستدعي نفسه، ولا يترك الاستدعاء المُدرَج في قائمة الانتظار والذي يفشل أي آثار جانبية.

:::caution الاستدعاءات عبر الآلات الافتراضية متوقفة حالياً على الشبكة الرئيسية
الرسالة `MsgCrossVMCall` مدرجة في قائمة قاطع الدائرة على الشبكة الرئيسية (`qorechaind query circuit disabled-list`)، ومسار SVM معطّل على الشبكتين، ولذلك فإن مسار الاستدعاء عبر الآلات الافتراضية غير قابل للاستخدام في المعاملات العادية اليوم.
:::

---

## تكامل الوحدات

يمكن لعقود QoreChain Native التفاعل مع وحدات Cosmos SDK من خلال تمرير الرسائل القياسي:

```rust
// Send native tokens via the bank module
let send_msg = BankMsg::Send {
    to_address: "qor1recipient...".to_string(),
    amount: vec![Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    }],
};

// Delegate to a validator via the staking module
let delegate_msg = StakingMsg::Delegate {
    validator: "qorvaloper1...".to_string(),
    amount: Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    },
};
```

---

## ترحيل العقد

إذا تمت تهيئة العقد بعنوان `--admin`، يمكن للمسؤول ترحيله إلى معرّف كود جديد:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

يستدعي هذا نقطة الدخول `migrate` في الكود الجديد مع حالة العقد الحالية.

---

## الخطوات التالية

* [التشغيل البيني عبر الآلات الافتراضية](/developer-guide/cross-vm-interoperability) — استدعِ عقود EVM وSVM من QoreChain Native
* [تطوير SVM](/developer-guide/svm-development) — انشر برامج BPF على QoreChain
* [إضافات EVM المدمجة](/developer-guide/evm-precompiles) — مرجع لإضافات Solidity المدمجة المخطط لها (لا توجد أي منها مفعّلة بعد)
