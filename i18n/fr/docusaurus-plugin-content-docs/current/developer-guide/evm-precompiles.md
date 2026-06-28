---
slug: /developer-guide/evm-precompiles
title: Précompilés EVM
sidebar_label: Précompilés EVM
sidebar_position: 6
---

# Précompilés EVM

QoreChain étend le QoreChain EVM Engine avec **six contrats précompilés personnalisés** qui exposent directement à Solidity des fonctionnalités au niveau du protocole. Ces précompilés fournissent un accès on-chain à la cryptographie post-quantique, à l'évaluation des risques par IA, à la messagerie cross-VM et aux paramètres de consensus PRISM.

:::note
Les précompilés sont disponibles à la fois sur le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, en service depuis le 7 juin 2026 sur la version de chaîne **v3.1.80**) et le testnet **`qorechain-diana`** (EVM chain ID **9800**). Tous les exemples utilisent le point de terminaison JSON-RPC sur le **port 8545**.
:::

---

## Carte des adresses de précompilés

| Précompilé              | Adresse                                      | Gas de base     | Description                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | Appels cross-VM synchrones (EVM vers CosmWasm)   |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | Vérifie les signatures post-quantiques ML-DSA-87 |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | Vérifie si un compte possède une clé PQC enregistrée |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | Obtient un score de risque généré par IA pour des données de transaction |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | Vérifie si un transfert est signalé comme anormal |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | Lit les paramètres de consensus actuels ajustés par PRISM |

---

## Interfaces Solidity

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

## Exemples d'utilisation

### PQC Verify — Vérifier une signature post-quantique

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

**Coût en gas :** 25,000 de base + 8 de gas par octet de données d'entrée. Pour une vérification ML-DSA-87 typique (2592 + 4627 + octets du message), prévoyez environ 80,000 à 90,000 de gas.

### PQC Key Status — Vérifier l'enregistrement d'un compte

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Coût en gas :** 2,500 forfaitaire.

### AI Risk Score — Évaluer le risque d'une transaction

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

**Niveaux de risque :**

| Niveau   | Valeur | Plage de score (bps) |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

**Coût en gas :** 50,000 forfaitaire.

### AI Anomaly Check — Signaler les transferts suspects

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

**Coût en gas :** 40,000 forfaitaire.

### PRISM Consensus Params — Lire l'état du consensus

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

**Coût en gas :** 1,500 forfaitaire.

### CrossVM Bridge — Appeler CosmWasm depuis l'EVM

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

**Coût en gas :** 50,000 de base + coût d'exécution du contrat cible. Voir [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) pour plus de détails.

---

## Emplacements des fichiers d'interface

Les fichiers d'interface Solidity sont disponibles dans le dépôt pour import direct :

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Installez-les dans votre projet Hardhat ou Foundry :

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Ou référencez-les via un chemin d'import dans vos fichiers Solidity :

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Étapes suivantes

* [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) — Documentation complète sur la messagerie cross-VM
* [Développement EVM](/developer-guide/evm-development) — Déploiement de contrats Solidity
* [Abstraction de compte](/developer-guide/account-abstraction) — Comptes programmables avec clés de session
