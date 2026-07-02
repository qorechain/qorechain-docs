---
slug: /developer-guide/cosmwasm-development
title: تطوير CosmWasm
sidebar_label: تطوير CosmWasm
sidebar_position: 3
---

# تطوير CosmWasm

تدعم QoreChain العقود الذكية بـ **CosmWasm**، ما يتيح للمطورين كتابة برامج آمنة معزولة بلغة Rust تُجمَّع إلى WebAssembly. تعمل عقود CosmWasm جنباً إلى جنب مع برامج EVM وSVM ضمن بنية الأنوية الافتراضية الثلاثية في QoreChain.

:::note
تستخدم الأوامر أدناه شبكة **`qorechain-vladi`** الرئيسية، التي تعمل منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.82**. استبدل `--chain-id qorechain-diana` لشبكة الاختبار.
:::

---

## المتطلبات المسبقة

| الاعتمادية                 | الإصدار       | الغرض                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | أحدث إصدار مستقر | تجميع العقود           |
| **wasm32-unknown-unknown** | الهدف (target)        | هدف تجميع WebAssembly |
| **cargo-generate**         | الأحدث        | هيكلة المشروع            |
| **cosmwasm-std**           | 1.5+          | مكتبة CosmWasm القياسية      |

ثبّت هدف Wasm:

```bash
rustup target add wasm32-unknown-unknown
```

---

## دورة حياة العقد

تتبع عقود CosmWasm دورة حياة من خمس خطوات: **البناء**، و**التخزين**، و**التهيئة**، و**التنفيذ**، و**الاستعلام**.

1. **البناء** — جمّع عقدك إلى WebAssembly محسَّن:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   سيكون ملف `.wasm` المحسَّن في الدليل `artifacts/`.

2. **التخزين** — ارفع العقد المُجمَّع إلى السلسلة:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   بعد تأكيد المعاملة، استعلم عن معرّف الكود المخزَّن (code ID):

   ```bash
   qorechaind query wasm list-code
   ```

3. **التهيئة** — أنشئ مثيل عقد جديداً من معرّف كود مخزَّن:

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   | الوسم                | الوصف                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | المعرّف الرقمي المُرجَع من معاملة التخزين |
   | `--label`           | تسمية مقروءة لهذا المثيل         |
   | `--no-admin`        | لا عنوان مسؤول (العقد غير قابل للتعديل)       |
   | `--admin <address>` | تعيين مسؤول يمكنه ترحيل العقد      |

   استرجِع عنوان العقد:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **التنفيذ** — استدعِ نقطة الدخول execute لعقد ما لتغيير الحالة:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   التنفيذ مع إرفاق أموال:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **الاستعلام** — اقرأ حالة العقد دون إرسال معاملة:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   تُرجَع استجابات الاستعلام بصيغة JSON.

---

## استعلامات مفيدة

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contracts-by-code <code-id>

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

يحتوي عقد CosmWasm النموذجي على ثلاث نقاط دخول:

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

## الاستدعاءات عبر الأنوية الافتراضية

يمكن لعقود CosmWasm التفاعل مع العقود المنشورة على EVM وSVM عبر وحدة `x/crossvm`. تستخدم الاستدعاءات عبر الأنوية الافتراضية من CosmWasm مسار الرسائل **غير المتزامن**:

```rust
use cosmwasm_std::{CosmosMsg, CustomMsg};

// Call an EVM contract from CosmWasm
let cross_vm_msg = CosmosMsg::Custom(QoreChainMsg::CrossVMCall {
    target_vm: "evm".to_string(),
    target_contract: "0x1234...abcd".to_string(),
    payload: hex::encode(abi_encoded_data),
    funds: vec![],
});

Ok(Response::new().add_message(cross_vm_msg))
```

تُرسَل الرسالة إلى طابور وتُعالَج بواسطة EndBlocker في الكتلة التالية. راجع [قابلية التشغيل البيني عبر الأنوية الافتراضية](/developer-guide/cross-vm-interoperability) للاطلاع على دورة حياة الرسالة الكاملة.

---

## التكامل مع الوحدات

يمكن لعقود CosmWasm التفاعل مع وحدات Cosmos SDK عبر تمرير الرسائل القياسي:

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
  -y
```

يستدعي هذا نقطة الدخول `migrate` على الكود الجديد مع حالة العقد الحالية.

---

## الخطوات التالية

* [قابلية التشغيل البيني عبر الأنوية الافتراضية](/developer-guide/cross-vm-interoperability) — استدعِ عقود EVM وSVM من CosmWasm
* [تطوير SVM](/developer-guide/svm-development) — انشر برامج BPF على QoreChain
* [الـ Precompiles في EVM](/developer-guide/evm-precompiles) — الوصول إلى ميزات PQC والذكاء الاصطناعي من Solidity
