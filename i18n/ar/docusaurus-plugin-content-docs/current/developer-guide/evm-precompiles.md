---
slug: /developer-guide/evm-precompiles
title: معالِجات EVM المسبقة
sidebar_label: معالِجات EVM المسبقة
sidebar_position: 6
---

# معالِجات EVM المسبقة

توسّع QoreChain محرك QoreChain EVM بـ **ستة عقود معالَجة مسبقًا مخصصة** تكشف ميزات على مستوى البروتوكول مباشرةً لـ Solidity. توفّر هذه المعالِجات المسبقة وصولًا على السلسلة إلى التشفير ما بعد الكمّي، وتقييم مخاطر الذكاء الاصطناعي، والمراسلة عبر الأجهزة الافتراضية، ومعاملات إجماع PRISM.

:::warning غير مفعّلة بعد على الشبكة الرئيسية أو الاختبارية
المعالِجات المسبقة الست الخاصة بـ QoreChain الواردة أدناه **مُضمّنة في العقدة لكنها غير مفعّلة بعد** على الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM **9801**) ولا على الشبكة الاختبارية **`qorechain-diana`** (معرّف سلسلة EVM **9800**). لا تستدعي EVM إلا العناوين المدرجة في المعامل `active_static_precompiles`، وهذه القائمة فارغة على الشبكتين. وإلى أن تفعّلها ترقية للسلسلة، **ينجح الاستدعاء إلى أي من هذه العناوين ويعيد بيانات فارغة (`0x`)**؛ فلا يتراجع ولا يعيد خطأ. راجع [حالة الشبكة](#network-status) قبل الاعتماد على أي منها.
:::

## حالة الشبكة {#network-status}

| المعالِج المسبق | العنوان | `qorechain-vladi` (الشبكة الرئيسية) | `qorechain-diana` (الشبكة الاختبارية) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | غير مفعّل | غير مفعّل |
| PQC Key Status | `0x…0A02` | غير مفعّل | غير مفعّل |
| AI Risk Score | `0x…0B01` | غير مفعّل | غير مفعّل |
| AI Anomaly Check | `0x…0B02` | غير مفعّل | غير مفعّل |
| PRISM Consensus Params | `0x…0C01` | غير مفعّل | غير مفعّل |
| CrossVM Bridge | `0x…0901` | غير مفعّل | غير مفعّل |

يتطلب التفعيل ترقية للسلسلة ومخطط له على مراحل: أولًا المعالِجات المسبقة للقراءة فقط الخاصة بـ PQC والإجماع، ثم زوج الذكاء الاصطناعي بعد جاهزية مساره للقراءة فقط بالفاصلة الثابتة، ثم CrossVM Bridge أخيرًا. أدخل الإصدار v3.2.3 (الشبكة الرئيسية، 20 أكتوبر 2026) النسختين المُحصَّنتين من CrossVM Bridge ومن معالِج AI Anomaly المسبق في الملف الثنائي خلف ميزة بروتوكول، **لكنه لم يفعّل أي معالِج مسبق**: فقائمة `active_static_precompiles` ما زالت فارغة على الشبكتين، ولن يغيّر ذلك الإصدار v3.2.4 (الشبكة الرئيسية منذ 23 أكتوبر 2026، والشبكة الاختبارية منذ 19 أكتوبر 2026). يُحدَّث هذا الجدول في العملية نفسها التي تُفعَّل فيها الترقية التي تفعّل أيًّا منها.

تحقّق من القائمة الحالية بنفسك (القائمة الفارغة تعني أنه لا يوجد أي معالِج مفعّل):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### الحماية من بيانات الإرجاع الفارغة {#guard}

لأن العنوان غير المفعّل (أو الذي لا يتبع QoreChain) يعيد نجاحًا دون بيانات، لا تقرأ أبدًا بايتات الإرجاع الخام لاستدعاء منخفض المستوى دون التحقق من طولها. يتراجع كل من `abi.decode` واستدعاءات الواجهات المنمّطة عند البيانات الفارغة، وهي النتيجة الآمنة؛ أما الاستدعاء منخفض المستوى المكتوب يدويًا فيجب أن يتحقق من ذلك صراحةً:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

لا ترسل قيمة إلى هذه العناوين. فهي غير payable، وتبقى القيمة المرسلة إلى عنوان معالِج مسبق غير مفعّل هناك دون أي وسيلة لاستردادها.

---

## خريطة عناوين المعالِجات المسبقة

أرقام الغاز هي ما تحتسبه العقدة بمجرد تفعيل المعالِج المسبق (لكل بايت تعني لكل بايت من مدخلات الاستدعاء).

| المعالِج المسبق          | العنوان                                       | الغاز الأساسي    | الوصف                                            |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000 + 4/byte | استدعاءات متزامنة عبر الأجهزة الافتراضية (EVM إلى QoreChain Native) |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | التحقق من توقيعات ML-DSA-87 ما بعد الكمّية          |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | التحقق مما إذا كان للحساب مفتاح PQC مسجّل           |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | الحصول على درجة مخاطر مولّدة بالذكاء الاصطناعي لبيانات المعاملة |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | التحقق مما إذا كان التحويل قد وُسم بأنه شاذ          |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | قراءة معاملات الإجماع الحالية المضبوطة بواسطة PRISM  |

---

## واجهات Solidity

### IQorePQC.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQorePQC {
    /// @notice Verify an ML-DSA-87 (Dilithium-5) signature
    /// @param pubkey The 2592-byte ML-DSA-87 public key
    /// @param signature The 4627-byte ML-DSA-87 signature
    /// @param message The original message bytes
    /// @return valid True if the signature is valid
    function pqcVerify(
        bytes calldata pubkey,
        bytes calldata signature,
        bytes calldata message
    ) external view returns (bool valid);

    /// @notice Check if an account has a registered PQC public key
    /// @param account The Ethereum-style address to check
    /// @return registered True if a PQC key is registered
    /// @return algorithmId The PQC algorithm identifier (1 = ML-DSA-87)
    /// @return pubkey The registered public key bytes (empty if not registered)
    function pqcKeyStatus(address account)
        external
        view
        returns (bool registered, uint8 algorithmId, bytes memory pubkey);
}
```

من v3.2.4 (الشبكة الرئيسية منذ 23 أكتوبر 2026، والشبكة الاختبارية منذ 19 أكتوبر 2026)، متى فُعِّل هذا المعالِج المسبق تحمل مخرجاته قيمة رابعة هي `bool possessionProven` بعد `pubkey`: وهي تبيّن هل جرى إثبات المفتاح الحالي للحساب بإثبات امتلاك جرى التحقق منه (راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing#proof-of-possession)). تسرد الواجهة أعلاه المخرجات الثلاث الأولى؛ وعلى العقد الذي يجب أن يثق بالمفتاح أن يقرأ المخرج الرابع أيضًا.

### IQoreAI.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQoreAI {
    /// @notice Get the AI-generated risk score for transaction data
    /// @param txData The transaction data to evaluate
    /// @return score Risk score in basis points (0-10000)
    /// @return level Risk level: 0=SAFE, 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL
    function aiRiskScore(bytes calldata txData)
        external
        view
        returns (uint256 score, uint8 level);

    /// @notice Check if a transfer is flagged as anomalous
    /// @param sender The sender address
    /// @param amount The transfer amount in wei
    /// @return anomalyScore The anomaly score (higher = more anomalous)
    /// @return flagged True if the transfer exceeds the anomaly threshold
    function aiAnomalyCheck(address sender, uint256 amount)
        external
        view
        returns (uint256 anomalyScore, bool flagged);
}
```

### IQoreConsensus.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQoreConsensus {
    /// @notice Get current PRISM-tuned consensus parameters
    /// @return blockTime Current target block time in milliseconds
    /// @return baseGasPrice Current base gas price in wei
    /// @return validatorSetSize Current active validator set size
    /// @return epoch Current PRISM epoch number
    function rlConsensusParams()
        external
        view
        returns (
            uint256 blockTime,
            uint256 baseGasPrice,
            uint256 validatorSetSize,
            uint256 epoch
        );
}
```

---

## أمثلة الاستخدام

### PQC Verify — التحقق من توقيع ما بعد كمّي

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IQorePQC.sol";

contract PQCVerifier {
    IQorePQC constant PQC = IQorePQC(0x0000000000000000000000000000000000000A01);

    /// @notice Verify a PQC signature and revert if invalid
    function verifyOrRevert(
        bytes calldata pubkey,
        bytes calldata signature,
        bytes calldata message
    ) external view {
        bool valid = PQC.pqcVerify(pubkey, signature, message);
        require(valid, "PQC signature verification failed");
    }
}
```

**تكلفة الغاز:** 25,000 أساسية + 8 غاز لكل بايت من بيانات الإدخال. الإدخال هو الاستدعاء المرمَّز بـ ABI (المفتاح العام 2592 بايت، والتوقيع 4627 بايت، والرسالة، بالإضافة إلى إزاحات ABI والحشو)، لذا تكلّف عملية تحقق ML-DSA-87 النموذجية نحو 85,000-90,000 غاز.

### PQC Key Status — التحقق من تسجيل الحساب

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**تكلفة الغاز:** 2,500 ثابتة.

### AI Risk Score — تقييم مخاطر المعاملة

```solidity
import "./interfaces/IQoreAI.sol";

contract RiskGate {
    IQoreAI constant AI = IQoreAI(0x0000000000000000000000000000000000000B01);

    uint8 constant MAX_ALLOWED_RISK = 2; // Allow up to MEDIUM

    function executeIfSafe(bytes calldata txData) external {
        (uint256 score, uint8 level) = AI.aiRiskScore(txData);
        require(level <= MAX_ALLOWED_RISK, "Risk level too high");

        // Proceed with execution...
    }
}
```

**مستويات المخاطر:**

| المستوى  | القيمة |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

يأتي المستوى من تسمية الخطورة التي يحددها محرك الذكاء الاصطناعي للمعاملة؛ وتُعاد الدرجة بنقاط الأساس (0 - 10000). لا يوجد تعيين ثابت من نطاقات الدرجات إلى المستويات، لذا اعتمد في القرار على `level` بدلًا من عتبات الدرجة.

**تكلفة الغاز:** 50,000 ثابتة.

### AI Anomaly Check — وسم التحويلات المشبوهة

```solidity
contract AnomalyGuard {
    IQoreAI constant AI = IQoreAI(0x0000000000000000000000000000000000000B02);

    function safeTransfer(address sender, uint256 amount) external view {
        (uint256 anomalyScore, bool flagged) = AI.aiAnomalyCheck(sender, amount);

        if (flagged) {
            revert("Transfer flagged as anomalous");
        }
    }
}
```

**تكلفة الغاز:** 40,000 ثابتة.

### PRISM Consensus Params — قراءة حالة الإجماع

```solidity
contract ConsensusReader {
    IQoreConsensus constant RL = IQoreConsensus(
        0x0000000000000000000000000000000000000C01
    );

    function getBlockTime() external view returns (uint256) {
        (uint256 blockTime, , , ) = RL.rlConsensusParams();
        return blockTime;
    }

    function getCurrentEpoch() external view returns (uint256) {
        (, , , uint256 epoch) = RL.rlConsensusParams();
        return epoch;
    }
}
```

**تكلفة الغاز:** 1,500 ثابتة.

:::note
في إصدار العقدة الحالي تعيد `rlConsensusParams` قيمًا افتراضية ثابتة بديلة، وليس قيمًا حية مضبوطة بواسطة PRISM (فهي لا تُبلغ مثلًا عن زمن الكتلة المقيس، وهو نحو 3.2 ثانية على الشبكة الرئيسية ونحو 1.0 ثانية على الشبكة الاختبارية). ويُعدّ ربطها بمعاملات الإجماع الحية جزءًا من أعمال التفعيل.
:::

### CrossVM Bridge — استدعاء QoreChain Native من EVM

:::warning
المعالِج المسبق CrossVM Bridge **غير مفعّل** على أي من الشبكتين. يحمل الملف الثنائي منذ v3.2.3 نسخة مُحصَّنة منه: ترفض `STATICCALL`؛ وتشغّل الاستدعاء المتداخل على عدّاد غاز محدود بما تبقّى للإطار المستدعي وتسجّله في السجل (journal)، بحيث يؤدي التراجع في العقد المستدعي إلى التراجع أيضًا عن جانب QoreChain Native؛ ولا تصل إلا إلى أهداف QoreChain Native المدرجة في قائمة السماح (تُرفض أهداف EVM)؛ وتحترم قاطع الدائرة (circuit breaker) الخاص بالأجهزة الافتراضية المتقاطعة. وإلى أن تفعّله ترقية معتمدة بالحوكمة لا يوجد مسار متزامن من EVM إلى QoreChain Native؛ راجع [التشغيل البيني بين الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) لمسار الرسائل `MsgCrossVMCall`، وهو نفسه معطّل اليوم على الشبكة الرئيسية.
:::

تفك العقدة ترميز calldata على أنها `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (محدِّد من 4 بايت، ثم الوسائط المرمَّزة بـ ABI). الاستخدام الوحيد المدعوم هو من EVM إلى QoreChain Native (`targetVM` = 1)؛ وقد يتغير ABI قبل التفعيل. يرمّز المساعد `encodeCrossVmCalldata` في `@qorechain/rdk` هذا التخطيط ابتداءً من 0.6.0 (كانت الإصدارات السابقة ترمّز دالة مختلفة)، ويقرأ المساعد `isCrossVmPrecompileActive` فيه قائمة `active_static_precompiles` الحية؛ راجع [متعدد الأجهزة الافتراضية](/rollups/multi-vm).

**تكلفة الغاز:** 50,000 أساسية + 4 غاز لكل بايت من المدخلات، بالإضافة إلى تكلفة تنفيذ العقد الهدف. راجع [التشغيل البيني بين الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) للتفاصيل.

---

## مواقع ملفات الواجهات

ملفات واجهة Solidity متاحة في المستودع للاستيراد المباشر:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

ثبّتها في مشروع Hardhat أو Foundry الخاص بك:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

أو أشِر إليها عبر مسار الاستيراد في ملفات Solidity الخاصة بك:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## الخطوات التالية

* [التشغيل البيني بين الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) — توثيق كامل للمراسلة عبر الأجهزة الافتراضية
* [تطوير EVM](/developer-guide/evm-development) — نشر عقود Solidity
* [تجريد الحساب](/developer-guide/account-abstraction) — مصادِقات المحافظ المرتبطة وقواعد الإنفاق (الوحدة معطّلة حاليًا)
