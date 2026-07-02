---
slug: /developer-guide/evm-precompiles
title: Precompile EVM
sidebar_label: Precompile EVM
sidebar_position: 6
---

# Precompile EVM

QoreChain estende QoreChain EVM Engine con **sei contratti precompilati personalizzati** che espongono funzionalità a livello di protocollo direttamente a Solidity. Questi precompile forniscono accesso on-chain a crittografia post-quantistica, scoring del rischio AI, messaggistica cross-VM e parametri di consenso PRISM.

:::note
I precompile sono disponibili sia sulla mainnet **`qorechain-vladi`** (EVM chain ID **9801**, attiva dal 7 giugno 2026 sulla versione di chain **v3.1.82**) sia sulla testnet **`qorechain-diana`** (EVM chain ID **9800**). Tutti gli esempi usano l'endpoint JSON-RPC sulla **porta 8545**.
:::

---

## Mappa degli indirizzi dei precompile

| Precompile              | Indirizzo                                    | Gas base        | Descrizione                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50.000          | Chiamate cross-VM sincrone (EVM verso CosmWasm)  |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25.000 + 8/byte | Verifica firme post-quantistiche ML-DSA-87       |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2.500           | Verifica se un account ha una chiave PQC registrata |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50.000          | Ottiene il punteggio di rischio generato dall'AI per i dati di transazione |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40.000          | Verifica se un trasferimento è segnalato come anomalo |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1.500        | Legge i parametri di consenso correnti ottimizzati da PRISM |

---

## Interfacce Solidity

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

## Esempi di utilizzo

### PQC Verify — Verificare una firma post-quantistica

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

**Costo del gas:** 25.000 base + 8 gas per byte di dati di input. Per una tipica verifica ML-DSA-87 (2592 + 4627 + byte del messaggio), prevedi circa 80.000-90.000 gas.

### PQC Key Status — Verificare la registrazione dell'account

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Costo del gas:** 2.500 fisso.

### AI Risk Score — Valutare il rischio di una transazione

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

**Livelli di rischio:**

| Livello  | Valore | Intervallo punteggio (bps) |
| -------- | ------ | -------------------------- |
| SAFE     | 0      | 0 - 1000                   |
| LOW      | 1      | 1001 - 3000                |
| MEDIUM   | 2      | 3001 - 6000                |
| HIGH     | 3      | 6001 - 8500                |
| CRITICAL | 4      | 8501 - 10000               |

**Costo del gas:** 50.000 fisso.

### AI Anomaly Check — Segnalare trasferimenti sospetti

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

**Costo del gas:** 40.000 fisso.

### PRISM Consensus Params — Leggere lo stato del consenso

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

**Costo del gas:** 1.500 fisso.

### CrossVM Bridge — Chiamare CosmWasm dall'EVM

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

**Costo del gas:** 50.000 base + costo di esecuzione del contratto di destinazione. Vedi [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) per i dettagli.

---

## Posizioni dei file delle interfacce

I file delle interfacce Solidity sono disponibili nel repository per l'importazione diretta:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Installali nel tuo progetto Hardhat o Foundry:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Oppure referenziali tramite il percorso di import nei tuoi file Solidity:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Prossimi passi

* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — Documentazione completa sulla messaggistica cross-VM
* [EVM Development](/developer-guide/evm-development) — Distribuire contratti Solidity
* [Account Abstraction](/developer-guide/account-abstraction) — Account programmabili con session key
