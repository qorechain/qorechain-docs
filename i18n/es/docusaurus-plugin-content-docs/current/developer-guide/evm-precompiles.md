---
slug: /developer-guide/evm-precompiles
title: Precompilados EVM
sidebar_label: Precompilados EVM
sidebar_position: 6
---

# Precompilados EVM

QoreChain amplía el QoreChain EVM Engine con **seis contratos precompilados personalizados** que exponen funciones a nivel de protocolo directamente a Solidity. Estos precompilados proporcionan acceso en cadena a criptografía poscuántica, puntuación de riesgo por IA, mensajería entre VM y parámetros de consenso PRISM.

:::note
Los precompilados están disponibles tanto en la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, activa desde el 7 de junio de 2026 en la versión de cadena **v3.1.80**) como en la testnet **`qorechain-diana`** (EVM chain ID **9800**). Todos los ejemplos usan el endpoint JSON-RPC en el **puerto 8545**.
:::

---

## Mapa de direcciones de precompilados

| Precompilado              | Dirección                                      | Gas base        | Descripción                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | Llamadas síncronas entre VM (EVM a CosmWasm)     |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | Verifica firmas poscuánticas ML-DSA-87         |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | Comprueba si una cuenta tiene una clave PQC registrada     |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | Obtiene la puntuación de riesgo generada por IA para datos de transacción |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | Comprueba si una transferencia se marca como anómala      |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | Lee los parámetros de consenso actuales ajustados por PRISM    |

---

## Interfaces de Solidity

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

## Ejemplos de uso

### PQC Verify — Verificar una firma poscuántica

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

**Coste de gas:** 25,000 base + 8 de gas por byte de datos de entrada. Para una verificación ML-DSA-87 típica (2592 + 4627 + bytes del mensaje), espera aproximadamente entre 80,000 y 90,000 de gas.

### PQC Key Status — Comprobar el registro de una cuenta

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Coste de gas:** 2,500 fijo.

### AI Risk Score — Evaluar el riesgo de una transacción

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

**Niveles de riesgo:**

| Nivel    | Valor | Rango de puntuación (bps) |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

**Coste de gas:** 50,000 fijo.

### AI Anomaly Check — Marcar transferencias sospechosas

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

**Coste de gas:** 40,000 fijo.

### PRISM Consensus Params — Leer el estado del consenso

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

**Coste de gas:** 1,500 fijo.

### CrossVM Bridge — Llamar a CosmWasm desde el EVM

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

**Coste de gas:** 50,000 base + coste de ejecución del contrato de destino. Consulta [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) para más detalles.

---

## Ubicaciones de los archivos de interfaz

Los archivos de interfaz de Solidity están disponibles en el repositorio para importarlos directamente:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Instálalos en tu proyecto de Hardhat o Foundry:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

O referéncialos mediante la ruta de importación en tus archivos de Solidity:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Próximos pasos

* [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) — Documentación completa de mensajería entre VM
* [Desarrollo EVM](/developer-guide/evm-development) — Despliegue de contratos en Solidity
* [Abstracción de cuentas](/developer-guide/account-abstraction) — Cuentas programables con claves de sesión
