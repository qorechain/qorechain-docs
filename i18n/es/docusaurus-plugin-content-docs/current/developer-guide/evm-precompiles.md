---
slug: /developer-guide/evm-precompiles
title: Precompilados de EVM
sidebar_label: Precompilados de EVM
sidebar_position: 6
---

# Precompilados de EVM

QoreChain extiende el QoreChain EVM Engine con **seis contratos precompilados personalizados** que exponen funciones a nivel de protocolo directamente a Solidity. Estos precompilados brindan acceso on-chain a criptografía post-cuántica, puntuación de riesgo por IA, mensajería cross-VM y parámetros de consenso PRISM.

:::warning Aún no activos en mainnet ni en testnet
Los seis precompilados de QoreChain que se describen a continuación están **compilados en el nodo pero aún no activados**, ni en la mainnet **`qorechain-vladi`** (ID de cadena EVM **9801**) ni en la testnet **`qorechain-diana`** (ID de cadena EVM **9800**). La EVM solo despacha las direcciones listadas en el parámetro `active_static_precompiles`, y esa lista está vacía en ambas redes. Hasta que una actualización de la cadena los active, **una llamada a cualquiera de estas direcciones tiene éxito y devuelve datos vacíos (`0x`)**; no revierte ni devuelve un error. Consulte [Estado de la red](#network-status) antes de depender de cualquiera de ellos.
:::

## Estado de la red {#network-status}

| Precompilado | Dirección | `qorechain-vladi` (mainnet) | `qorechain-diana` (testnet) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | No activo | No activo |
| PQC Key Status | `0x…0A02` | No activo | No activo |
| AI Risk Score | `0x…0B01` | No activo | No activo |
| AI Anomaly Check | `0x…0B02` | No activo | No activo |
| PRISM Consensus Params | `0x…0C01` | No activo | No activo |
| CrossVM Bridge | `0x…0901` | No activo | No activo |

La activación requiere una actualización de la cadena y está planificada por etapas: primero los precompilados de PQC y de consenso de solo lectura, el par de IA una vez que esté lista su ruta de solo lectura en punto fijo, y el CrossVM Bridge en último lugar. La versión v3.2.3 (mainnet, 20 de octubre de 2026) incluyó en el binario las versiones reforzadas del CrossVM Bridge y del precompilado AI Anomaly Check, detrás de una función de protocolo, **pero no activó ningún precompilado**: la lista `active_static_precompiles` sigue vacía en ambas redes, y la versión v3.2.4 de la testnet no lo cambió. Esta tabla se actualiza en la misma operación que la actualización que active cualquiera de ellos.

Compruebe usted mismo la lista actual (una lista vacía significa que ninguno está activo):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Protéjase frente a datos de retorno vacíos {#guard}

Como una dirección inactiva (o que no es de QoreChain) devuelve éxito sin datos, nunca lea los bytes de retorno sin procesar de una llamada de bajo nivel sin comprobar su longitud. `abi.decode` y las llamadas a interfaces tipadas revierten con datos vacíos, que es el resultado seguro; una llamada de bajo nivel escrita a mano debe comprobarlo explícitamente:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

No envíe valor a estas direcciones. No son payable, y el valor enviado a una dirección de precompilado inactiva se queda allí sin forma de recuperarlo.

---

## Mapa de direcciones de precompilados

Las cifras de gas son lo que el nodo cobra una vez que un precompilado está activo (por byte significa por byte de la entrada de la llamada).

| Precompilado             | Dirección                                    | Gas base         | Descripción                                        |
| ------------------------ | --------------------------------------------- | ---------------- | --------------------------------------------------- |
| **CrossVM Bridge**       | `0x0000000000000000000000000000000000000901` | 50,000 + 4/byte | Llamadas cross-VM síncronas (EVM a CosmWasm)         |
| **PQC Verify**           | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte   | Verifica firmas post-cuánticas ML-DSA-87             |
| **PQC Key Status**       | `0x0000000000000000000000000000000000000A02` | 2,500             | Verifica si una cuenta tiene una clave PQC registrada |
| **AI Risk Score**        | `0x0000000000000000000000000000000000000B01` | 50,000            | Obtiene la puntuación de riesgo generada por IA para datos de transacción |
| **AI Anomaly Check**     | `0x0000000000000000000000000000000000000B02` | 40,000            | Verifica si una transferencia está marcada como anómala |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500          | Lee los parámetros de consenso actuales ajustados por PRISM |

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

### PQC Verify — Verificar una firma post-cuántica

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

**Costo de gas:** 25,000 base + 8 gas por byte de datos de entrada. La entrada es la llamada codificada en ABI (clave pública de 2592 bytes, firma de 4627 bytes, el mensaje, más los desplazamientos y el relleno de ABI), por lo que una verificación típica de ML-DSA-87 cuesta aproximadamente 85,000-90,000 de gas.

### PQC Key Status — Verificar el registro de una cuenta

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Costo de gas:** 2,500 fijo.

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

| Nivel    | Valor |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

El nivel proviene de la etiqueta de gravedad que el motor de IA asigna a la transacción; la puntuación se devuelve en puntos básicos (0 - 10000). No hay una correspondencia fija entre rangos de puntuación y niveles, así que condicione la decisión a `level` en lugar de a umbrales de puntuación.

**Costo de gas:** 50,000 fijo.

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

**Costo de gas:** 40,000 fijo.

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

**Costo de gas:** 1,500 fijo.

:::note
En la compilación actual del nodo, `rlConsensusParams` devuelve valores predeterminados fijos de marcador de posición, no valores en vivo ajustados por PRISM (por ejemplo, no informa el tiempo de bloque medido, que es de aproximadamente 3,2 s en mainnet y de aproximadamente 1,0 s en la testnet). Conectarlo a los parámetros de consenso en vivo forma parte del trabajo de activación.
:::

### CrossVM Bridge — Llamar a CosmWasm desde EVM

:::warning
El precompilado CrossVM Bridge **no está activo** en ninguna de las dos redes. El binario desde v3.2.3 incluye una versión reforzada que: rechaza un `STATICCALL`; ejecuta la llamada anidada con un medidor de gas limitado por lo que le queda al marco que llama y la registra en el diario, de modo que una reversión en el contrato que llama también deshace el lado de CosmWasm; solo alcanza destinos CosmWasm de la lista de permitidos (los destinos EVM se rechazan); y respeta el circuit breaker cross-VM. Hasta que una actualización aprobada por gobernanza lo active no existe una ruta síncrona de EVM a CosmWasm; consulte [Interoperabilidad Cross-VM](/developer-guide/cross-vm-interoperability) para la ruta de mensajes `MsgCrossVMCall`, que a su vez está desactivada hoy en mainnet.
:::

El nodo decodifica el calldata como `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector de 4 bytes y, a continuación, los argumentos codificados en ABI). El único uso admitido es de EVM a CosmWasm (`targetVM` = 1); el ABI aún puede cambiar antes de la activación.

**Costo de gas:** 50,000 base + 4 gas por byte de entrada, más el costo de ejecución del contrato de destino. Consulte [Interoperabilidad Cross-VM](/developer-guide/cross-vm-interoperability) para más detalles.

---

## Ubicaciones de los archivos de interfaz

Los archivos de interfaz de Solidity están disponibles en el repositorio para importación directa:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Instálelos en su proyecto de Hardhat o Foundry:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

O referéncielos mediante la ruta de importación en sus archivos Solidity:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Próximos pasos

* [Interoperabilidad Cross-VM](/developer-guide/cross-vm-interoperability) — Documentación completa de mensajería cross-VM
* [Desarrollo en EVM](/developer-guide/evm-development) — Despliegue de contratos Solidity
* [Abstracción de cuentas](/developer-guide/account-abstraction) — Autenticadores de billeteras vinculadas y reglas de gasto (módulo actualmente deshabilitado)
