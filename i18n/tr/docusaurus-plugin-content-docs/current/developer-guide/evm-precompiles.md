---
slug: /developer-guide/evm-precompiles
title: EVM Ön Derlemeleri
sidebar_label: EVM Ön Derlemeleri
sidebar_position: 6
---

# EVM Ön Derlemeleri

QoreChain, QoreChain EVM Engine'i protokol düzeyindeki özellikleri doğrudan Solidity'ye sunan **altı özel ön derlenmiş contract** ile genişletir. Bu ön derlemeler; kuantum sonrası kriptografiye, AI risk puanlamasına, VM'ler arası mesajlaşmaya ve PRISM konsensüs parametrelerine zincir üzerinde erişim sağlar.

:::note
Ön derlemeler, hem **`qorechain-vladi`** ana ağında (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri **v3.1.80** zincir sürümünde yayında) hem de **`qorechain-diana`** test ağında (EVM zincir kimliği **9800**) mevcuttur. Tüm örnekler **8545 portundaki** JSON-RPC uç noktasını kullanır.
:::

---

## Ön Derleme Adres Haritası

| Ön Derleme              | Adres                                      | Temel Gaz        | Açıklama                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | Senkron VM'ler arası çağrılar (EVM'den CosmWasm'a)     |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | ML-DSA-87 kuantum sonrası imzalarını doğrular         |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | Bir hesabın kayıtlı bir PQC anahtarı olup olmadığını kontrol eder     |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | İşlem verileri için AI tarafından oluşturulan risk puanını alır |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | Bir transferin anormal olarak işaretlenip işaretlenmediğini kontrol eder      |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | Mevcut PRISM ile ayarlanmış konsensüs parametrelerini okur    |

---

## Solidity Arayüzleri

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

## Kullanım Örnekleri

### PQC Verify — Kuantum Sonrası Bir İmzayı Doğrulama

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

**Gaz maliyeti:** 25,000 temel + giriş verisinin baytı başına 8 gaz. Tipik bir ML-DSA-87 doğrulaması için (2592 + 4627 + mesaj baytları), yaklaşık 80,000-90,000 gaz bekleyin.

### PQC Key Status — Hesap Kaydını Kontrol Etme

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Gaz maliyeti:** 2,500 sabit.

### AI Risk Score — İşlem Riskini Değerlendirme

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

**Risk seviyeleri:**

| Seviye    | Değer | Puan Aralığı (bps) |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

**Gaz maliyeti:** 50,000 sabit.

### AI Anomaly Check — Şüpheli Transferleri İşaretleme

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

**Gaz maliyeti:** 40,000 sabit.

### PRISM Consensus Params — Konsensüs Durumunu Okuma

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

**Gaz maliyeti:** 1,500 sabit.

### CrossVM Bridge — EVM'den CosmWasm Çağırma

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

**Gaz maliyeti:** 50,000 temel + hedef sözleşme yürütme maliyeti. Ayrıntılar için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) bölümüne bakın.

---

## Arayüz Dosyası Konumları

Solidity arayüz dosyaları, doğrudan içe aktarma için depoda mevcuttur:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Bunları Hardhat veya Foundry projenize kurun:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Veya bunlara Solidity dosyalarınızda içe aktarma yolu aracılığıyla başvurun:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Sonraki Adımlar

* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — Tam VM'ler arası mesajlaşma belgeleri
* [EVM Geliştirme](/developer-guide/evm-development) — Solidity sözleşmelerini dağıtma
* [Hesap Soyutlaması](/developer-guide/account-abstraction) — Oturum anahtarlı programlanabilir hesaplar
