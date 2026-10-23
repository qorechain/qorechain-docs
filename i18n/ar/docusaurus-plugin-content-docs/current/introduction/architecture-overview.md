---
slug: /introduction/architecture-overview
title: نظرة عامة على البنية
sidebar_label: نظرة عامة على البنية
sidebar_position: 2
---

# نظرة عامة على البنية

QoreChain هي عقدة بلوكتشين معيارية مكوّنة من ثلاث عمليات أساسية — عقدة السلسلة، والملحق الجانبي للذكاء الاصطناعي (AI sidecar)، ومُفهرس الكتل (block indexer) — مدعومة بقاعدة بيانات Postgres ومراقَبة عبر Prometheus وGrafana. الشبكة الرئيسية (`qorechain-vladi`، معرّف سلسلة EVM **9801**) نشطة منذ 7 يونيو 2026 على الإصدار **v3.2.4** (طُبّق عند الارتفاع 3,742,566 في 23 أكتوبر 2026)، إلى جانب شبكة اختبار موازية (`qorechain-diana`، معرّف سلسلة EVM **9800**، تعمل بالإصدار v3.2.4 منذ 19 أكتوبر 2026). السلسلة مبنية على Cosmos SDK v0.53. يوضّح المخطط التالي التخطيط العام لمكوّنات النظام.

تلخّص دورة حياة المعاملة أدناه كيفية مرور معاملة مُرسَلة عبر العقدة — بدءًا من سلسلة مُزخرِفات AnteHandler (فحوصات الأمان والرسوم) وصولًا إلى تنفيذ الآلة الافتراضية (VM) والتسوية على السلسلة:

```mermaid
flowchart LR
    Tx[Submitted transaction] --> Lane{Lane}
    Lane -->|Cosmos lane| Ante[AnteHandler chain]
    Lane -->|EVM lane| EAnte[EVM checks]
    EAnte --> Win[Registered PQC key +<br/>EVM authorisation window]
    Win --> Router
    Ante --> PQC[PQC signature verify]
    PQC --> AI[AI anomaly detection]
    AI --> Fair[FairBlock MEV protection]
    Fair --> Fee[Fee deduction & gas abstraction]
    Fee --> Router{VM router}
    Router -->|Solidity| EVM[EVM]
    Router -->|Wasm| Wasm[QoreChain Native]
    Router -->|BPF| SVM[SVM]
    EVM --> Commit[Block commit & indexing]
    Wasm --> Commit
    SVM --> Commit
```

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            QoreChain Node                                  │
│                                                                            │
│  ┌──────────────────── Virtual Machines ──────────────────────┐           │
│  │  ┌───────┐    ┌──────────┐    ┌───────┐                   │           │
│  │  │  EVM  │    │QoreChain │    │  SVM  │                   │           │
│  │  │(Sol.) │◄──►│ Native   │◄──►│ (BPF) │                   │           │
│  │  └───┬───┘    └────┬─────┘    └───┬───┘                   │           │
│  │      └─────────┬───┘──────────────┘                       │           │
│  │           x/crossvm (bridge)                               │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌────────────────────── Tokenomics ─────────────────────────┐           │
│  │  ┌──────┐   ┌───────┐   ┌───────────┐                    │           │
│  │  │x/burn│   │x/xqore│   │x/inflation│                    │           │
│  │  │12 src│   │lock/  │   │capped     │                    │           │
│  │  │37/30/│   │unlock │   │emission   │                    │           │
│  │  │20/10/│   │PvP    │   │emission   │                    │           │
│  │  │3     │   │       │   │590M cap   │                    │           │
│  │  └──────┘   └───────┘   └───────────┘                    │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────── IBC / Bridges ────────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │x/bridge  │  │x/babylon │  │x/abstract │  │x/gas     │ │           │
│  │  │37 QCB    │  │BTC re-   │  │ account   │  │abstract. │ │           │
│  │  │configs   │  │staking   │  │session key│  │multi-tok │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  QCB Bridge     Babylon IBC   ERC-4337-like   ibc/USDC    │           │
│  │  PQC-signed     BTC finality  social recov.   ibc/ATOM    │           │
│  │  36 ext chains  checkpoint    spending rules  fee convert  │           │
│  │  ┌──────────┐                                              │           │
│  │  │x/fair    │  Lane config (not enforced): PQC|MEV|AI|... │           │
│  │  │ block    │  tIBE encrypted mempool framework           │           │
│  │  └──────────┘                                              │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──── Rollup Development Kit ───────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │ x/rdk    │  │Settlement│  │ DA Router │  │ Profiles │ │           │
│  │  │ 4 modes: │  │Optimistic│  │ Native    │  │ defi     │ │           │
│  │  │ opt/zk/  │  │ZK/Based/ │  │ Celestia* │  │ gaming   │ │           │
│  │  │ based/   │  │Sovereign │  │ Both      │  │ nft      │ │           │
│  │  │ sovereign│  │          │  │           │  │ social/  │ │           │
│  │  │          │  │          │  │           │  │ general  │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  Bank escrow    Auto-finalize  SHAKE-256 commit AI-assisted │           │
│  │  Burn on create EndBlocker     Blob pruning    PRISM sugg. │           │
│  │  → x/multilayer (RegisterSidechain + AnchorState)          │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────────┐ ┌──────┐ ┌────────────┐ ┌─────┐                       │
│  │x/rlconsensus │ │ x/ai │ │x/reputation│ │x/qca│                       │
│  │  PRISM (RL)  │ │      │ │            │ │     │                       │
│  └──────┬───────┘ └──┬───┘ └────┬──────┘ └──┬──┘                       │
│   PPO MLP         AI Engine   Scoring    CPoS Pools                      │
│   Obs/Action      Fraud Det.  Decay      Bonding                         │
│   Circuit Brk     Fee Opt.    Sigmoid    Slashing                        │
│   Rollup Adv.     TEE/FL                 QDRW Gov                        │
│                                                                            │
│  ┌──────┐ ┌──────────┐                                                   │
│  │x/pqc │ │ x/multi  │                                                   │
│  └──┬───┘ └────┬─────┘                                                   │
│  Dilithium    Layer Router                                                │
│  ML-KEM       Sidechains                                                  │
│  Hybrid Sig   + Rollups                                                   │
│  SHAKE-256                                                                │
│                                                                            │
│  ┌──────┐ ┌───────┐                                                      │
│  │x/svm │ │x/cross│                                                      │
│  └──┬───┘ └───┬───┘                                                      │
│  BPF Exec   CrossVM Msg                                                   │
└────────┬──────┬───────────────────────────────────────┬───────────────────┘
         │      │                                       │
   ┌─────┴─────┐│                              ┌───────┴──────┐
   │libqorepqc ││                              │  Indexer     │
   │(Rust PQC) ││                              │  (Postgres)  │
   └───────────┘│                              └──────────────┘
   ┌───────────┐│  ┌──────────┐
   │libqoresvm ││  │AI Sidecar│
   │(Rust BPF) │└──│ (gRPC)   │
   └───────────┘   └──────────┘
```

## مكوّنات العقدة

تعمل QoreChain كثلاث عمليات متعاونة، لكل منها وحدة Go وملف تنفيذي (binary) خاص بها:

| المكوّن          | الوصف                                                                                                                                                                                                                                                                                          | الموقع                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **qorechain-node** | العقدة الأساسية للبلوكتشين. تُشغّل محرّك إجماع QoreChain، وتنفّذ جميع الوحدات المخصّصة، وتدير بيئات تشغيل الآلات الافتراضية الثلاث، وتعرض نقاط نهاية RPC وREST وgRPC وJSON-RPC.                                                                                                                      | `qorechain-core/`         |
| **ai-sidecar**     | خدمة gRPC توفّر إمكانات استدلال متقدّمة للذكاء الاصطناعي مدعومة بخلفية QCAI. يتولى الملحق الجانبي طلبات الاستدلال التي تتجاوز نطاق وكيل التعلّم المعزَّز (RL) الموجود على السلسلة، مثل تحليل اللغة الطبيعية والتعرّف على الأنماط المعقّدة. يتواصل مع العقدة عبر gRPC على المنفذ 50051. | `qorechain-core/sidecar/` |
| **block-indexer**  | مستمِع WebSocket يشترك في الكتل والمعاملات الجديدة من نقطة نهاية RPC الخاصة بالعقدة، ويحلّل الأحداث، ويكتب بيانات مُهيكلة إلى قاعدة بيانات Postgres لتمكين الاستعلام السريع من قِبل المستكشفات (explorers) وواجهات البرمجة (APIs).                                                                                          | `qorechain-core/indexer/` |

## المنافذ

| المنفذ | البروتوكول    | الخدمة                                                                            |
| ----- | -------------- | --------------------------------------------------------------------------------- |
| 26657 | HTTP/WebSocket | RPC الخاص بمحرّك إجماع QoreChain (الكتل، المعاملات، حالة الإجماع)                 |
| 1317  | HTTP           | واجهة REST API (نقاط نهاية الاستعلام، بثّ المعاملات)                              |
| 9090  | gRPC           | نقاط نهاية gRPC للاستعلام والمعاملات                                              |
| 8545  | HTTP           | EVM JSON-RPC (مساحات الأسماء `eth_`، `web3_`، `net_`، `txpool_`)                  |
| 8546  | WebSocket      | EVM JSON-RPC (اشتراكات WebSocket)                                                 |
| 8899  | HTTP           | SVM JSON-RPC (متوافق مع Solana: `getAccountInfo`، `getBalance`، `getSlot`، وغيرها) |
| 50051 | gRPC           | الملحق الجانبي للذكاء الاصطناعي (طلبات الاستدلال من العقدة)                       |
| 5432  | TCP            | Postgres (تخزين مُفهرس الكتل)                                                     |
| 26660 | HTTP           | نقطة نهاية مقاييس Prometheus الخاصة بالعقدة                                       |
| 9091  | HTTP           | خادم Prometheus (منفذ المضيف في حزمة Docker Compose)                              |
| 3001  | HTTP           | لوحات معلومات Grafana (منفذ المضيف في حزمة Docker Compose؛ منفذ الحاوية 3000)     |

## خريطة الوحدات

تسجّل QoreChain **48 وحدة تأسيسية (genesis)، منها 20 وحدة خاصة بـ QoreChain**، مُصنّفة حسب الوظيفة:

**الأمان**

* `x/pqc` — التشفير المقاوم للحوسبة الكمومية: Dilithium-5، ML-KEM-1024، توقيع هجين secp256k1 (ECDSA) + ML-DSA-87، SHAKE-256، مرونة اختيار الخوارزمية

**الذكاء الاصطناعي والتعلّم الآلي**

* `x/ai` — توجيه المعاملات، كشف الشذوذ، كشف الاحتيال، تحسين الرسوم، تصديق TEE، التعلّم الموحّد (federated learning)
* `x/reputation` — تقييم سمعة المدقّقين (validators) متعدد العوامل مع اضمحلال زمني
* `x/rlconsensus` — وكيل تعلّم معزَّز (RL) على السلسلة (PPO MLP)، تصميم لضبط الإجماع، قاطع دارة (circuit breaker)، استشارة للتجميعات (rollups) — طبقة تحسين PRISM (مراقبة فقط على الشبكات الحيّة: لا يتم تحميل أي سياسة)

**الإجماع**

* `x/qca` — تصميم إثبات حصة مركّب ثلاثي المجمّعات (RPoS/DPoS/PoS)، منحنى ربط (bonding curve) مخصّص، خصم تدريجي (slashing)، حوكمة QDRW — مُنفَّذ لكنه غير مربوط بعد بإنتاج الكتل أو المكافآت أو الخصم أو احتساب أصوات الحوكمة

**الآلات الافتراضية**

* `x/vm` — توجيه الآلات الافتراضية وإدارة دورة حياتها
* `x/svm` — بيئة تشغيل SVM: نشر/تنفيذ BPF، تحصيل الإيجار، واجهة RPC متوافقة مع Solana
* `x/crossvm` — التواصل بين الآلات الافتراضية: مُجمّع مسبق (precompile) بين EVM وQoreChain Native + أحداث SVM غير متزامنة

**اقتصاديات الرمز والسيولة**

* `x/burn` — 12 مصدر حرق (burn) (13 اعتبارًا من v3.2.4)، توزيع رسوم EndBlocker (تقسيم 37/30/20/10/3)
* `x/xqore` — تصميم تكديس (staking) معزَّز بالحوكمة: قفل/فك قفل، عقوبات خروج متدرّجة، إعادة موازنة PvP (محاسبة فقط؛ معاملات القفل وفك القفل غير مربوطة بعد على الشبكات الحيّة)
* `x/inflation` — إصدار محدود السقف: يُسَكّ مبلغ ثابت في كل حقبة (epoch) حتى بلوغ سقف تراكمي صارم (590,000,000 QOR)
* `x/amm` — سيولة على السلسلة / صانع سوق آلي (AMM)

**الجسور وقابلية التشغيل البيني**

* `x/bridge` — 37 إعداد سلسلة (36 سلسلة خارجية بالإضافة إلى Injective عبر IBC) عبر كل الأنواع الرئيسية للسلاسل، تصديقات موقّعة بـ PQC، قواطع دارة (جميع الإعدادات في حالة `pending`؛ غير حيّة)
* `x/babylon` — إعادة تكديس BTC عبر بروتوكول Babylon، نقاط تفتيش للحقب (epoch checkpoints) (مرحلة التصميم؛ لا توجد معاملات مفعّلة)
* `x/multilayer` — إدارة طبقات السلاسل الجانبية (sidechain)/سلاسل الدفع (paychain)/التجميعات (rollup)، تثبيت الحالة (state anchoring)

**امتدادات الحوكمة والترخيص**

* `x/abstractaccount` — حسابات ذكية: توقيع متعدد (multisig)، استعادة اجتماعية، مفاتيح جلسة، قواعد إنفاق (معطّلة على الشبكتين: `enabled = false`)
* `x/fairblock` — حماية من MEV: إطار عمل لتشفير تجمّع المعاملات (mempool) باستخدام IBE العتبي (threshold IBE) (معطّل على الشبكتين)
* `x/gasabstraction` — تصميم دفع الغاز بعملات متعددة: تحويل رسوم ibc/USDC، ibc/ATOM (لا توجد قناة IBC مفتوحة بعد، لذا تُدفع الرسوم بـ QOR)
* `x/license` — ترخيص السلسلة

**التجميعات (Rollups)**

* `x/rdk` — عدة تطوير التجميعات (Rollup Development Kit): 4 أوضاع تسوية (optimistic، zk، based، sovereign)، ملفات تعريف جاهزة، توفّر بيانات (DA) أصلي، ضمان بنكي (bank escrow)

## سلسلة AnteHandler

تمرّ كل معاملة عبر سلسلة مُزخرِفات (decorators) قبل التنفيذ، ويمكن لأي مُزخرِف رفضها. هناك سلسلتان.

**مسار Cosmos** (بالترتيب): `RejectMessages` (لا `MsgEthereumTx` على هذا المسار) → `AuthzLimiter` (لا رسائل EVM ولا رسائل إنشاء الاستحقاق التدريجي (vesting) داخل authz، ومنذ v3.2.3 لا رسائل إدارة المفاتيح المقاومة للحوسبة الكمومية) → `SetUpContext` → حواجز mempool وعمق التوقيع المتعدد → مُزخرِفات QoreChain Native الخاصة بغاز المحاكاة وعدّاد المعاملات وسجل الغاز والعقود → `CircuitBreaker` → فحص خيارات الامتداد → `ValidateBasic` → `TxTimeout` → `Memo` → بوابة ترخيص المدقّق (`MsgCreateValidator`) → `PQCVerify` → `PQCHybridVerify` → `PQCReplayGuard` → `AIAnomaly` (يتضمن حدّ المعدّل لكل مُرسِل) → `FairBlock` → `SVMComputeBudget` → `SVMDeductFee` → `MinGasPrice` → `ConsumeTxSize` → `GasAbstraction` → `DeductFee` → `SetPubKey` → `ValidateSigCount` → `SigGasConsume` → `SigVerify` → `IncrementSequence` → عدّاد معاملات الحرق → فحص الترحيل الزائد في IBC → تتبّع الغاز المطلوب.

**مسار EVM** (المعاملات التي تحمل خيار امتداد Ethereum): `CircuitBreaker` → المُزخرِف الأحادي الخاص بـ EVM (فحوصات التوقيع وnonce والرسوم والرصيد) → `EVMWindowDecorator` (مفتاح مقاوم للحوسبة الكمومية مسجَّل ونافذة تفويض نشطة؛ راجع [نافذة تفويض EVM](/getting-started/first-transaction#evm-window)).

المُزخرِفات الرئيسية على مسار Cosmos:

1. **PQCVerify** — الوحدة `x/pqc`. التحقق من توقيعات Dilithium-5 على المعاملات المُعلَّمة بـ PQC.
2. **PQCHybridVerify** — الوحدة `x/pqc`. التحقق من التوقيعات الهجينة المزدوجة secp256k1 (ECDSA) + ML-DSA-87.
3. **AIAnomaly** — الوحدة `x/ai`. تشغيل كشف الشذوذ بخوارزمية الغابة العازلة (isolation forest) وتقييم المخاطر، وتطبيق حدّ المعاملات لكل مُرسِل.
4. **FairBlock** — الوحدة `x/fairblock`. معالجة المعاملات المشفَّرة بـ tIBE للحماية من MEV (معطّل على الشبكات الحيّة).
5. **SVMComputeBudget** — الوحدة `x/svm`. التحقق من وحدات الحوسبة وتخصيصها لبرامج SVM.
6. **SVMDeductFee** — الوحدة `x/svm`. خصم رسوم التنفيذ الخاصة بـ SVM.
7. **GasAbstraction** — الوحدة `x/gasabstraction`. تحويل رموز الرسوم غير الأصلية قبل الخصم (تُدفع الرسوم حاليًا بـ QOR).

## حزمة Docker Compose

تعمل حزمة التطوير الكاملة كنشر Docker Compose من ست خدمات على شبكة جسر (bridge network) مشتركة (`qorechain-net`):

| الخدمة           | الصورة                      | الغرض                                                |
| ---------------- | -------------------------- | --------------------------------------------------- |
| `qorechain-node` | `qorechain-core:latest` (تُبنى محليًا من Dockerfile؛ لا توجد صورة منشورة للعقدة) | عقدة السلسلة مع جميع الوحدات والآلات الافتراضية ونقاط نهاية RPC |
| `ai-sidecar`     | `ghcr.io/qorechain/ai-sidecar:latest` | خدمة استدلال الذكاء الاصطناعي (gRPC + خلفية QCAI)     |
| `block-indexer`  | `ghcr.io/qorechain/block-indexer:latest` | مُفهرس الكتل/المعاملات (WebSocket + Postgres)         |
| `postgres`       | `postgres:16-alpine`       | قاعدة بيانات مُفهرس الكتل                             |
| `prometheus`     | `prom/prometheus:v3.10.0`  | جمع المقاييس وتخزينها                                |
| `grafana`        | `grafana/grafana:12.4.1`   | لوحات مراقبة وتنبيهات                                |

لتشغيل الحزمة الكاملة:

```bash
docker compose up -d
```

قبل أول تشغيل، انسخ `.env.example` إلى `.env` وانسخ `.env.sidecar.example` إلى `.env.sidecar`، وعيّن `GRAFANA_PASSWORD` (يرفض Compose البدء بدونه).

تُخزَّن جميع البيانات الدائمة في مجلدات Docker مُسمّاة (named volumes): `node-data`، و`postgres-data`، و`prometheus-data`، و`grafana-data`.

## ذات صلة

* [بنية Multilayer](/architecture/multilayer-architecture) — تسجيل السلاسل الجانبية وتثبيت الحالة.
* [آلية الإجماع](/architecture/consensus-mechanism) — إنتاج الكتل، النهائية، والخصم (slashing).
* [محرّك إجماع PRISM](/architecture/prism-consensus-engine) — تحسين المعاملات المدفوع بالذكاء الاصطناعي.
* [الأمان المقاوم للحوسبة الكمومية](/architecture/post-quantum-security) — توقيعات Dilithium-5 عبر المنظومة بأكملها.
