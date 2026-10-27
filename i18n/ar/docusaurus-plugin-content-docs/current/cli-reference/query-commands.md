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
تُنفَّذ الاستعلامات على العقدة التي يشير إليها الخيار `--node`. استخدم نقطة نهاية RPC للشبكة الرئيسية **`qorechain-vladi`** للحصول على بيانات حية (مثل `--node https://rpc.qore.host:443`)، أو نقطة نهاية شبكة الاختبار **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) للاختبار. القيمة الافتراضية `tcp://localhost:26657` تستهدف عقدة تشغّلها بنفسك. تشغّل الشبكة الرئيسية إصدار العقدة v3.2.4 منذ 23 أكتوبر 2026 (طُبّق عند الارتفاع 3,742,566 بمقترح الحوكمة 13)، وسيطبّق مقترح الحوكمة 14 على الشبكة الرئيسية الإصدار v3.2.5 عند الارتفاع 3,906,833؛ وتشغّل شبكة الاختبار v3.2.6 (v3.2.4 منذ 19 أكتوبر 2026، وv3.2.5 منذ 26 أكتوبر، وv3.2.6 منذ 27 أكتوبر). ويضيف الإصدار v3.2.4 بعض المسارات والأوامر (موسومة بعبارة **v3.2.4** أدناه): وهي تعمل على الشبكتين، أما عقدة ما زالت على إصدار أقدم فتجيب عنها بـ `Not Implemented`. ويضيف الإصدار v3.2.6 أمرين (موسومين بعبارة **v3.2.6**، على شبكة الاختبار فقط إلى أن تطبّقه الشبكة الرئيسية). جرى التحقق من الأوامر في هذه الصفحة مقابل الملف الثنائي للإصدار v3.2.3، مُشغَّلًا على `https://rpc.qore.host:443`؛ أما مسارات v3.2.4 فجرى التحقق منها عبر REST في 23 أكتوبر 2026، وأوامر v3.2.6 مقابل مصدر الإصدار v3.2.6.
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
qorechaind query pqc evm-delegation-consent <address>
```

- يقبل `algorithm` اسم خوارزمية (`dilithium5` أو `mlkem1024`) أو معرّفاً رقمياً.
- يقبل `migration` **معرّف خوارزمية** (مثل `1`)، وليس عنواناً، ويُبلغ عن `No active migration` عندما لا توجد عملية ترحيل جارية.
- يُبلغ `account` عن المفتاح المسجَّل. إلى جانب المفتاح و`key_type` و`algorithm_name`، يحتوي السجل على `classical_key_source` (`stored` أو `auth_account` أو `none`: أي مصدر المفتاح العام الكلاسيكي). ومن v3.2.4 (على الشبكة الرئيسية منذ 23 أكتوبر 2026، وعلى شبكة الاختبار منذ 19 أكتوبر 2026) يحمل أيضاً `possession_proven`، وتكون قيمتها `true` عندما سُجّل المفتاح بإثبات حيازة جرى التحقق منه.
- يعرض `evm-window` ما إذا كان للعنوان نافذة تفويض مفتوحة على مسار EVM وكم كتلة ومعاملة وقيمة متبقية (`found` و`live` و`remaining_blocks` و`remaining_txs` و`remaining_value`)، إضافةً إلى نطاق النافذة (`native_only` و`allowed_targets`؛ منذ v3.2.3 على الشبكة الرئيسية). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- يعرض `evm-delegation-consent` موافقة العنوان على التفويض بموجب EIP-7702 (`found` و`live` و`delegate` و`granted_height` و`expiry_height`)، وتفويضه الحالي، وقيمة nonce الخاصة به على EVM. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- يُبلغ `params` و`hybrid-mode` عن `hybrid_signature_mode` (القيمة `2` = مطلوب على الشبكتين) وعن `allow_classical_fallback` (`false`).

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

يُبلغ `stranded_rewards` عن حصة المخزِّنين (stakers) التي أُودعت في وحدة التوزيع دون أن تغطي أي مطالبة (`reserved` و`released` و`snapshot_height`). ولا يمكن الإفراج عنها إلا بتصويت حوكمة. سُجّل الاحتياطي أول مرة عند الترقية إلى v3.2.0 وأُعيد حسابه عند ارتفاع الترقية إلى v3.2.3، لذا اقرأ القيم الحية بدلاً من رقم مذكور في موضع آخر.

يقسّم `stats` الحرق التراكمي بحسب المصدر، بما في ذلك `failed_tx` التي ظلّت قيمتها غير صفرية منذ الترقية إلى v3.2.2.

---

## mint وinflation

يقرأ `qorechaind query mint params|inflation|annual-provisions` وحدة mint القياسية التي معدّلها `0` على الشبكتين؛ وهو **لا** يُبلغ عن جدول الإصدار الخاص بالبروتوكول. لا يوجد أمر `query inflation` في سطر الأوامر. أما إعدادات الإصدار الخاصة بالبروتوكول وتقدّمه فتُقدَّم عبر REST منذ v3.2.2:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

تُبلغ هذه الاستعلامات على الشبكة الرئيسية عن `emission_mode: "fixed"`، وإصدار ثابت قدره 86,000 QOR لكل حقبة من 43,200 كتلة، وسقف تراكمي قدره 590,000,000 QOR (مقترح الحوكمة 10، أُقرّ في 19 أكتوبر 2026؛ وتبدأ أول حقبة بالمبلغ الجديد عند الكتلة 3,672,000). المبالغ بوحدة `uqor`. وتُبلغ شبكة الاختبار عن قيمها الخاصة المختلفة: فقد انتقلت إلى وضع الإصدار الآخر الذي أضافه v3.2.4 (`target_apy`) عبر حوكمتها الخاصة (المقترح 14، أُقرّ في 20 أكتوبر 2026). ولا تنتقل الشبكة بين الأوضاع إلا بتصويت الحوكمة الخاص بها، ولذلك تُبقي الشبكة الرئيسية على `fixed` إلى أن يُقرّ تصويت كهذا (فُحص في 27 أكتوبر 2026).

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

يعرض `reward-pool` كيف ينقسم رصيد مكافآت الوحدة إلى `reserved` و`outstanding` و`payable` و`distributable`، وحدود كل عقدة: `max_reward_per_block_per_node` ومنذ v3.2.3 `max_reward_per_month_per_node` (2,000 QOR، موزّعة بالتناسب بحسب زمن الكتلة ووقت التشغيل). ومن v3.2.4 (على الشبكة الرئيسية منذ 23 أكتوبر 2026، وعلى شبكة الاختبار منذ 19 أكتوبر 2026) يُبلغ أيضاً عن `monthly_cap_active` و`last_distribution_time` و`last_distribution_height`.

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

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

يعرض `config` معاملات الوحدة (الحد الأدنى للحصة، ومعدل الحرق عند الإنشاء، ونافذة التحدي، وحدود DA). ويطبع `anchor-sign-bytes` بالنظام السداسي عشري بايتات توقيع الإرساء (anchor) بالإصدار v2 التي يوقّعها منشئ الرول-أب لأجل `tx rdk submit-batch --anchor-signature`. وتُقدَّم الاستعلامات نفسها عبر REST تحت `/qorechain/rdk/v1/...` منذ v3.2.2 (راجع [نقاط نهاية REST / gRPC](/api-reference/rest-grpc-endpoints#rdk-module)). أما `suggest-profile <use_case>` فلا يستعلم عن السلسلة؛ بل يطبع فقط إشارة إلى طريقة JSON-RPC لا تقدّمها نقاط النهاية العامة، لذا اختر ملفاً من [الملفات الجاهزة](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

يُبلغ `agent-status` عن وضع الوكيل وحقبته وعدد خطواته؛ ويُبلغ `policy` عن حقبة السياسة المخزَّنة وعدد أوزانها (لا الأوزان نفسها). **v3.2.6 (على شبكة الاختبار فقط إلى أن تطبّق الشبكة الرئيسية ذلك الإصدار):** يطبع `applied-params` القيم التي يحتفظ بها الوكيل بوصفها مطبَّقة (زمن الكتلة، والحد الأدنى لسعر الغاز، وأوزان المجمّعات)، ويطبع `last-action` الإجراء الذي اقترحه في خطوته الأخيرة، وهو يُسجَّل في كل وضع، بما في ذلك وضع الظل حيث لا يُطبَّق شيء. وكل هذه مُتاحة أيضًا عبر REST على شبكة الاختبار (راجع [وحدة RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module))؛ وعلى عقدة في الشبكة الرئيسية يجيب الأمران الجديدان بـ `Not Implemented` إلى أن تطبّق الشبكة الرئيسية ذلك الإصدار.

---

## abstractaccount

وحدة الحسابات المجرَّدة متوقفة على الشبكة الرئيسية (`config.enabled` تساوي `false`، لذا لا تُرجع هذه الاستعلامات أي حسابات هناك) ومفعَّلة على شبكة الاختبار بقرار حوكمة (`config.enabled` تساوي `true`؛ فُحص في 27 أكتوبر 2026).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

تبني `auth-keygen` و`auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` و`auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` تواقيع المصادقة دون اتصال. بذرة المصادقة ليست وسيطاً أبداً: تُقرأ من `--seed-file <file>` (أو `-` للإدخال القياسي)، أو من متغير البيئة `QORE_AUTH_SEED`، أو من مطالبة بلا صدى، وتكتبها `auth-keygen` في ملف `0600` جديد (`--out`) بدلاً من طباعتها.

---

## gasabstraction

تُقدَّم استعلامات تجريد الغاز على الشبكتين منذ v3.2.2:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

لا تحتوي قائمة الرموز المقبولة سوى `uqor` الأصلي على الشبكتين، لذا تُدفع الرسوم بـ `uqor` ولا يجري أي تحويل؛ وتقرّر الحوكمة أي الرموز الأخرى تُقبل. REST: `/qorechain/gasabstraction/v1/config` و`/conversion_rate?denom=` و`/float`. راجع [تجريد الغاز](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

لا يوجد أي مجمّع (pool) على أي من الشبكتين وقت كتابة هذا. وعلى شبكة الاختبار تتوفر رموز Fest الاختبارية الثلاثة بوصفها الفئة الثانية في مجمّع (راجع [رموز الاختبار على شبكة الاختبار](/api-reference/rest-grpc-endpoints#fest-tokens)).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

وحدة طبقات التخزين (staking tiers) جزء من إصدار **v3.2.4**: وهي تعمل على شبكة الاختبار منذ 19 أكتوبر 2026 وعلى الشبكة الرئيسية منذ 23 أكتوبر 2026 (الارتفاع 3,742,566، مقترح الحوكمة 13). وتجيب عقدة على إصدار أقدم عن هذه الاستعلامات بـ `Not Implemented`. REST: `/qorechain/stakingtier/v1/params` و`/locks/{holder}` و`/pool`. راجع [أوامر المعاملات](/cli-reference/transaction-commands#stakingtier).

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

`query upgrade applied <name>` هو الطريقة لمعرفة متى دخلت الترقية حيّز التنفيذ: على الشبكة الرئيسية طُبّق `v3.2.2` عند الارتفاع 3,556,788 و`v3.2.3` عند الارتفاع 3,662,051 و`v3.2.4` عند الارتفاع 3,742,566؛ وعلى شبكة الاختبار طُبّق `v3.2.2` عند 6,905,034 و`v3.2.3` عند 8,003,746 و`v3.2.4` عند 8,337,253 و`v3.2.5` عند 8,890,800 و`v3.2.6` عند 8,970,638 (القيمة `0` تعني أنها لم تُطبَّق؛ وعلى الشبكة الرئيسية قيمة `v3.2.5` هي `0` وقت كتابة هذا، ومقترح الحوكمة 14 في فترة التصويت). وتضم قائمة قاطع الدائرة (circuit breaker) على الشبكة الرئيسية (`disabled-list`) حالياً رسائل إنشاء حسابات الاستحقاق التدريجي (vesting)، وتخزين QoreChain Native وإنشاء نسخ منه، وإيقاف مجمّعات AMM مؤقتاً واستئنافها، والاستدعاء عبر الآلات الافتراضية (cross-VM)، وتحديث حالة طبقة multilayer، وإهمال خوارزميات PQC وتعطيلها، ورسائل حوكمة إجماع PRISM؛ أما قائمة شبكة الاختبار فلا تضم سوى رسالة QoreChain Native ‏`MsgStoreCode` (فُحص في 27 أكتوبر 2026؛ وقد سمحت حوكمة شبكة الاختبار بالإنشاء).

---

## evm, erc20, wasm

تقرأ أوامر `wasm` بيئة QoreChain Native، وهو اسم QoreChain لبيئة تشغيل العقود الذكية CosmWasm؛ وتحتفظ أسماء الأوامر والوحدة بالتهجئة `wasm`.

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

الأمر `query erc20 token-pairs` فارغ على الشبكة الرئيسية؛ وعلى شبكة الاختبار يسرد رموز Fest الاختبارية الثلاثة (fUSD وfETH وfBTC) ورمزًا واحدًا عبر IBC. وفئات bank الخاصة بها هي `erc20:` متبوعة بعنوان العقد وفق EIP-55، وهي حساسة لحالة الأحرف؛ راجع [رموز Fest الاختبارية على شبكة الاختبار](/developer-guide/evm-development#fest-tokens). وعلى شبكة الاختبار يُظهر `query wasm params` القيمة `Nobody` للمعامل `code_upload_access` والقيمة `Everybody` للمعامل `instantiate_default_permission`؛ أما على الشبكة الرئيسية فكلاهما `Nobody` (راجع [تطوير QoreChain Native](/developer-guide/cosmwasm-development)).

---

## وحدات بلا سطر أوامر

ليس لدى `xqore` و`babylon` و`fairblock` أوامر معاملات أو استعلام. ولا يمكن استخدامها من سطر الأوامر أو من أي واجهة برمجة عامة في الوقت الحالي.
