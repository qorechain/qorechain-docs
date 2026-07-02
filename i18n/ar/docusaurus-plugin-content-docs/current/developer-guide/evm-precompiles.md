---
slug: /developer-guide/evm-precompiles
title: معالِجات EVM المسبقة
sidebar_label: معالِجات EVM المسبقة
sidebar_position: 6
---

# معالِجات EVM المسبقة

توسّع QoreChain محرك QoreChain EVM بـ **ستة عقود معالَجة مسبقًا مخصصة** تكشف ميزات على مستوى البروتوكول مباشرةً لـ Solidity. توفّر هذه المعالِجات المسبقة وصولًا على السلسلة إلى التشفير ما بعد الكمّي، وتقييم مخاطر الذكاء الاصطناعي، والمراسلة عبر الأجهزة الافتراضية، ومعاملات إجماع PRISM.

:::note
المعالِجات المسبقة متاحة على كل من الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM **9801**، قيد التشغيل منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.82**) وشبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**). جميع الأمثلة تستخدم نقطة نهاية JSON-RPC على **المنفذ 8545**.
:::

---

## خريطة عناوين المعالِجات المسبقة

| المعالِج المسبق          | العنوان                                       | الغاز الأساسي    | الوصف                                            |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | استدعاءات متزامنة عبر الأجهزة الافتراضية (EVM إلى CosmWasm) |
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

**تكلفة الغاز:** 25,000 أساسية + 8 غاز لكل بايت من بيانات الإدخال. لعملية تحقق ML-DSA-87 نموذجية (2592 + 4627 + بايتات الرسالة)، توقّع نحو 80,000-90,000 غاز.

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

| المستوى  | القيمة | نطاق الدرجة (bps) |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

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

### CrossVM Bridge — استدعاء CosmWasm من EVM

```solidity
interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMExample {
    ICrossVM constant CROSSVM = ICrossVM(
        0x0000000000000000000000000000000000000901
    );

    function callCosmWasm(
        string memory contractAddr,
        string memory executeMsg
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(contractAddr, executeMsg, uint256(0));
        return CROSSVM.call(payload);
    }
}
```

**تكلفة الغاز:** 50,000 أساسية + تكلفة تنفيذ العقد الهدف. راجع [التشغيل البيني بين الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) للتفاصيل.

---

## مواقع ملفات الواجهات

ملفات واجهة Solidity متاحة في المستودع للاستيراد المباشر:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
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
* [تجريد الحساب](/developer-guide/account-abstraction) — حسابات قابلة للبرمجة بمفاتيح جلسة
