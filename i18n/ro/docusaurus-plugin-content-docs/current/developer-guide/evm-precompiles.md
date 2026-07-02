---
slug: /developer-guide/evm-precompiles
title: Precompilate EVM
sidebar_label: Precompilate EVM
sidebar_position: 6
---

# Precompilate EVM

QoreChain extinde QoreChain EVM Engine cu **șase contracte precompilate personalizate** care expun direct în Solidity funcții la nivel de protocol. Aceste precompilate oferă acces on-chain la criptografia post-cuantică, scorarea riscului cu AI, mesageria cross-VM și parametrii de consens PRISM.

:::note
Precompilatele sunt disponibile atât pe rețeaua principală (mainnet) **`qorechain-vladi`** (EVM chain ID **9801**, activă din 7 iunie 2026 pe versiunea de lanț **v3.1.82**), cât și pe rețeaua de test (testnet) **`qorechain-diana`** (EVM chain ID **9800**). Toate exemplele folosesc endpoint-ul JSON-RPC pe **portul 8545**.
:::

---

## Harta adreselor precompilatelor

| Precompilat             | Adresă                                       | Gaz de bază     | Descriere                                        |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | Apeluri cross-VM sincrone (EVM către CosmWasm)   |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | Verifică semnături post-cuantice ML-DSA-87        |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | Verifică dacă un cont are o cheie PQC înregistrată |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | Obține scorul de risc generat de AI pentru datele tranzacției |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | Verifică dacă un transfer este marcat ca anomal  |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | Citește parametrii de consens curenți reglați de PRISM |

---

## Interfețe Solidity

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

## Exemple de utilizare

### PQC Verify — Verificarea unei semnături post-cuantice

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

**Cost de gaz:** 25,000 de bază + 8 gaz per octet de date de intrare. Pentru o verificare tipică ML-DSA-87 (2592 + 4627 + octeții mesajului), așteptați-vă la aproximativ 80,000-90,000 de gaz.

### PQC Key Status — Verificarea înregistrării contului

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Cost de gaz:** 2,500 fix.

### AI Risk Score — Evaluarea riscului tranzacției

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

**Niveluri de risc:**

| Nivel    | Valoare | Interval scor (bps) |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

**Cost de gaz:** 50,000 fix.

### AI Anomaly Check — Marcarea transferurilor suspecte

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

**Cost de gaz:** 40,000 fix.

### PRISM Consensus Params — Citirea stării de consens

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

**Cost de gaz:** 1,500 fix.

### CrossVM Bridge — Apelarea CosmWasm din EVM

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

**Cost de gaz:** 50,000 de bază + costul de execuție al contractului țintă. Vedeți [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability) pentru detalii.

---

## Locațiile fișierelor de interfață

Fișierele de interfață Solidity sunt disponibile în depozit pentru import direct:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Instalați-le în proiectul dvs. Hardhat sau Foundry:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Sau referențiați-le prin calea de import în fișierele dvs. Solidity:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Pașii următori

* [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability) — Documentația completă a mesageriei cross-VM
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementarea contractelor Solidity
* [Abstractizarea conturilor](/developer-guide/account-abstraction) — Conturi programabile cu chei de sesiune
