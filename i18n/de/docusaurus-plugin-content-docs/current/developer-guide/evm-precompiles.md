---
slug: /developer-guide/evm-precompiles
title: EVM-Precompiles
sidebar_label: EVM-Precompiles
sidebar_position: 6
---

# EVM-Precompiles

QoreChain erweitert die QoreChain-EVM-Engine um **sechs benutzerdefinierte precompiled Contracts**, die Protokollfunktionen auf Protokollebene direkt für Solidity zugänglich machen. Diese Precompiles bieten On-Chain-Zugriff auf Post-Quanten-Kryptografie, KI-Risikobewertung, Cross-VM-Messaging und PRISM-Konsensparameter.

:::note
Die Precompiles sind sowohl im **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, live seit 7. Juni 2026 auf Chain-Version **v3.1.92**) als auch im **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) verfügbar. Alle Beispiele verwenden den JSON-RPC-Endpunkt auf **Port 8545**.
:::

---

## Adresskarte der Precompiles

| Precompile               | Adresse                                       | Basis-Gas        | Beschreibung                                        |
| ------------------------ | ---------------------------------------------- | ----------------- | ---------------------------------------------------- |
| **CrossVM Bridge**       | `0x0000000000000000000000000000000000000901` | 50.000            | Synchrone Cross-VM-Aufrufe (EVM zu CosmWasm)         |
| **PQC Verify**           | `0x0000000000000000000000000000000000000A01` | 25.000 + 8/Byte   | Verifiziert ML-DSA-87-Post-Quanten-Signaturen        |
| **PQC Key Status**       | `0x0000000000000000000000000000000000000A02` | 2.500             | Prüft, ob ein Konto einen registrierten PQC-Schlüssel hat |
| **AI Risk Score**        | `0x0000000000000000000000000000000000000B01` | 50.000            | Ruft den KI-generierten Risikoscore für Transaktionsdaten ab |
| **AI Anomaly Check**     | `0x0000000000000000000000000000000000000B02` | 40.000            | Prüft, ob ein Transfer als anomal markiert ist       |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1.500          | Liest die aktuellen PRISM-abgestimmten Konsensparameter |

---

## Solidity-Schnittstellen

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

## Anwendungsbeispiele

### PQC Verify — Verifizierung einer Post-Quanten-Signatur

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

**Gaskosten:** 25.000 Basis + 8 Gas pro Byte Eingabedaten. Für eine typische ML-DSA-87-Verifizierung (2592 + 4627 + Nachrichten-Bytes) sind ungefähr 80.000-90.000 Gas zu erwarten.

### PQC Key Status — Prüfung der Kontoregistrierung

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Gaskosten:** 2.500 pauschal.

### AI Risk Score — Bewertung des Transaktionsrisikos

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

**Risikostufen:**

| Stufe    | Wert  | Score-Bereich (bps) |
| -------- | ----- | -------------------- |
| SAFE     | 0     | 0 - 1000              |
| LOW      | 1     | 1001 - 3000            |
| MEDIUM   | 2     | 3001 - 6000            |
| HIGH     | 3     | 6001 - 8500            |
| CRITICAL | 4     | 8501 - 10000           |

**Gaskosten:** 50.000 pauschal.

### AI Anomaly Check — Markierung verdächtiger Transfers

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

**Gaskosten:** 40.000 pauschal.

### PRISM Consensus Params — Auslesen des Konsensstatus

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

**Gaskosten:** 1.500 pauschal.

### CrossVM Bridge — Aufruf von CosmWasm aus der EVM

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

**Gaskosten:** 50.000 Basis + Ausführungskosten des Ziel-Contracts. Details siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability).

---

## Speicherorte der Schnittstellendateien

Die Solidity-Schnittstellendateien stehen im Repository für den direkten Import zur Verfügung:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Installieren Sie sie in Ihrem Hardhat- oder Foundry-Projekt:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Oder referenzieren Sie sie über den Importpfad in Ihren Solidity-Dateien:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Nächste Schritte

* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — Vollständige Dokumentation zum Cross-VM-Messaging
* [EVM-Entwicklung](/developer-guide/evm-development) — Bereitstellung von Solidity-Contracts
* [Account Abstraction](/developer-guide/account-abstraction) — Programmierbare Konten mit Session-Keys
