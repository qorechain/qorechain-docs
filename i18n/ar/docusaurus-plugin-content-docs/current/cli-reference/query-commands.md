---
slug: /cli-reference/query-commands
title: أوامر الاستعلام
sidebar_label: أوامر الاستعلام
sidebar_position: 3
---

# أوامر الاستعلام

تتبع جميع أوامر الاستعلام النمط التالي:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
تُنفَّذ الاستعلامات على العقدة التي يشير إليها الخيار `--node`. استخدم نقطة نهاية RPC للشبكة الرئيسية **`qorechain-vladi`** للحصول على بيانات حية (مثل `--node https://rpc.qore.host:443`)، أو نقطة نهاية شبكة الاختبار **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) للاختبار. القيمة الافتراضية `tcp://localhost:26657` تستهدف عقدة تشغّلها بنفسك. تشغّل الشبكة الرئيسية إصدار العقدة v3.2.1 وشبكة الاختبار v3.2.2؛ وقد تقدّم شبكة الاختبار بعض المسارات الإضافية التي لا تملكها الشبكة الرئيسية بعد، لذا قد يُرجع استعلام يعمل هناك `Not Implemented` على الشبكة الرئيسية.
:::

تنطبق الرايات (Flags) الشائعة على كل أمر فرعي من أوامر `query`:

| الراية     | النوع  | الوصف                                            |
| ---------- | ------ | ------------------------------------------------ |
| `--node`   | string | نقطة نهاية RPC (الافتراضية: `tcp://localhost:26657`) |
| `--output` | string | تنسيق الإخراج: `json` أو `text`                  |
| `--height` | int    | الاستعلام عن الحالة عند ارتفاع كتلة محدد         |

ليس لكل وحدة استعلام في سطر الأوامر. وحيثما يغيب أمر، استخدم نقطة نهاية REST (`https://api.qore.host/...`)؛ راجع [REST API](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(لا يوجد `query bank total`.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

يقبل `--status` اسم التعداد (enum) الكامل: `BOND_STATUS_BONDED` أو `BOND_STATUS_UNBONDING` أو `BOND_STATUS_UNBONDED` (يُرفض `--status bonded`).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

يقبل `--proposal-status` القيم `deposit-period` أو `voting-period` أو `passed` أو `rejected` أو `failed`. عوامل تصفية أخرى: `--voter` و`--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
```

- يقبل `algorithm` اسم خوارزمية (`dilithium5` أو `mlkem1024`) أو معرّفاً رقمياً.
- يقبل `migration` **معرّف خوارزمية** (مثل `1`)، وليس عنواناً، ويُبلغ عن `No active migration` عندما لا توجد عملية ترحيل جارية.
- يعرض `evm-window` ما إذا كان للعنوان نافذة تفويض مفتوحة على مسار EVM وكم كتلة ومعاملة وقيمة متبقية (`found` و`live` و`remaining_blocks` و`remaining_txs` و`remaining_value`). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## burn

لا تملك وحدة الحرق (burn) استعلاماً في سطر الأوامر. استخدم REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

يُبلغ `stranded_rewards` عن حصة المخزِّنين (stakers) التي أُودعت في وحدة التوزيع دون أن تغطي أي مطالبة، كما سُجّلت عند الترقية إلى v3.2.0 (`reserved` و`released` و`snapshot_height`). ولا يمكن الإفراج عنها إلا بتصويت حوكمة.

---

## mint وinflation

يقرأ `qorechaind query mint params|inflation|annual-provisions` وحدة mint القياسية التي معدّلها `0` على الشبكتين؛ وهو **لا** يُبلغ عن جدول الإصدار الخاص بالبروتوكول. لا يوجد أمر `query inflation`.

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation وqca

```bash
qorechaind query reputation params
qorechaind query qca config
```

لا توجد استعلامات سمعة لكل مُدقِّق ولا استعلامات تصنيف المجمّعات (pools).

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

يعرض `reward-pool` كيف ينقسم رصيد مكافآت الوحدة إلى `reserved` و`outstanding` و`payable` و`distributable`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

يُرجع `check` الخطأ `NotFound` عندما لا يحمل المستفيد ترخيصاً للميزة.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

يعرض `config` معاملات الوحدة (الحد الأدنى للحصة، ومعدل الحرق عند الإنشاء، ونافذة التحدي، وحدود DA). أما `suggest-profile <use_case>` فلا يستعلم عن السلسلة؛ بل يطبع فقط إشارة إلى طريقة JSON-RPC لا تقدّمها نقاط النهاية العامة، لذا اختر ملفاً من [الملفات الجاهزة](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

وحدة الحسابات المجرَّدة متوقفة حالياً على الشبكتين (`config.enabled` تساوي `false`)، لذا لا تُرجع هذه الاستعلامات أي حسابات.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

تبني `auth-keygen` و`auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` و`auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` تواقيع المصادقة دون اتصال. بذرة المصادقة ليست وسيطاً أبداً: تُقرأ من `--seed-file <file>` (أو `-` للإدخال القياسي)، أو من متغير البيئة `QORE_AUTH_SEED`، أو من مطالبة بلا صدى، وتكتبها `auth-keygen` في ملف `0600` جديد (`--out`) بدلاً من طباعتها.

---

## gasabstraction

لا تقدّم الشبكة الرئيسية استعلامات تجريد الغاز بعد (يطبع `qorechaind query gasabstraction ...` نص المساعدة ويُرجع مسار REST الرمز `Not Implemented`). تُدفع الرسوم بـ `uqor` فقط؛ راجع [تجريد الغاز](/user-guide/gas-abstraction).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

---

## evm, erc20, wasm

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

---

## وحدات بلا سطر أوامر

ليس لدى `xqore` و`babylon` و`fairblock` أوامر معاملات أو استعلام. ولا يمكن استخدامها من سطر الأوامر أو من أي واجهة برمجة عامة في الوقت الحالي.
