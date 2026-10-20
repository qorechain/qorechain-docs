---
slug: /developer-guide/evm-precompiles
title: EVM Precompiles
sidebar_label: EVM Precompiles
sidebar_position: 6
---

# EVM Precompiles

QoreChain extends the QoreChain EVM Engine with **six custom precompiled contracts** that expose protocol-level features directly to Solidity. These precompiles provide on-chain access to post-quantum cryptography, AI risk scoring, cross-VM messaging, and PRISM consensus parameters.

:::warning Not active yet on mainnet or testnet
The six QoreChain precompiles below are **compiled into the node but not yet activated** on the **`qorechain-vladi`** mainnet (EVM chain ID **9801**) or the **`qorechain-diana`** testnet (EVM chain ID **9800**). The EVM only dispatches addresses listed in the `active_static_precompiles` parameter, and that list is empty on both networks. Until a chain upgrade activates them, a call to any of these addresses **succeeds and returns empty data (`0x`)**; it does not revert and it does not return an error. See [Network status](#network-status) before relying on any of them.
:::

## Network status {#network-status}

| Precompile | Address | `qorechain-vladi` (mainnet) | `qorechain-diana` (testnet) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Not active | Not active |
| PQC Key Status | `0x…0A02` | Not active | Not active |
| AI Risk Score | `0x…0B01` | Not active | Not active |
| AI Anomaly Check | `0x…0B02` | Not active | Not active |
| PRISM Consensus Params | `0x…0C01` | Not active | Not active |
| CrossVM Bridge | `0x…0901` | Not active | Not active |

Activation needs a chain upgrade and is planned in stages: the read-only PQC and consensus precompiles first, the AI pair once their read-only, fixed-point path is in place, and the CrossVM bridge last. The v3.2.3 release (mainnet, 20 October 2026) put the hardened versions of the CrossVM bridge and the AI anomaly precompile into the binary behind a protocol feature, **but it did not activate any precompile**: the `active_static_precompiles` list is still empty on both networks, and the testnet's v3.2.4 release did not change that. This table is updated in the same operation as the upgrade that activates any of them.

Check the live list yourself (an empty list means none is active):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Guard against empty return data {#guard}

Because an inactive (or non-QoreChain) address returns success with no data, never read the raw return bytes of a low-level call without checking their length. `abi.decode` and typed interface calls revert on empty data, which is the safe outcome; a hand-rolled low-level call must check it explicitly:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

Do not send value to these addresses. They are not payable, and value sent to an inactive precompile address stays there with no way to recover it.

---

## Precompile Address Map

Gas figures are what the node charges once a precompile is active (per byte means per byte of call input).

| Precompile              | Address                                      | Base Gas        | Description                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000 + 4/byte | Synchronous cross-VM calls (EVM to CosmWasm)     |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | Verify ML-DSA-87 post-quantum signatures         |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | Check if an account has a registered PQC key     |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | Get AI-generated risk score for transaction data |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | Check if a transfer is flagged as anomalous      |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | Read current PRISM-tuned consensus parameters    |

---

## Solidity Interfaces

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

## Usage Examples

### PQC Verify — Verify a Post-Quantum Signature

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

**Gas cost:** 25,000 base + 8 gas per byte of input data. The input is the ABI-encoded call (public key 2592 bytes, signature 4627 bytes, the message, plus ABI offsets and padding), so a typical ML-DSA-87 verification costs roughly 85,000-90,000 gas.

### PQC Key Status — Check Account Registration

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Gas cost:** 2,500 flat.

### AI Risk Score — Evaluate Transaction Risk

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

**Risk levels:**

| Level    | Value |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

The level comes from the AI engine's severity label for the transaction; the score is returned in basis points (0 - 10000). There is no fixed mapping from score ranges to levels, so gate on `level` rather than on score thresholds.

**Gas cost:** 50,000 flat.

### AI Anomaly Check — Flag Suspicious Transfers

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

**Gas cost:** 40,000 flat.

### PRISM Consensus Params — Read Consensus State

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

**Gas cost:** 1,500 flat.

:::note
In the current node build `rlConsensusParams` returns fixed placeholder defaults, not live PRISM-tuned values (for example, it does not report the measured block time, which is about 3.2 s on mainnet and about 1.0 s on the testnet). Wiring it to the live consensus parameters is part of the activation work.
:::

### CrossVM Bridge — Call CosmWasm from EVM

:::warning
The CrossVM bridge precompile is **not active** on either network. The binary since v3.2.3 carries a hardened version of it that: refuses a `STATICCALL`; runs the nested call on a gas meter bounded by what the calling frame has left and journals it, so a revert in the calling contract also undoes the CosmWasm side; reaches only allowlisted CosmWasm targets (EVM targets are refused); and honours the cross-VM circuit breaker. Until a governance-approved upgrade activates it there is no synchronous EVM-to-CosmWasm path; see [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) for the `MsgCrossVMCall` message path, which is itself switched off on mainnet today.
:::

The node decodes calldata as `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (4-byte selector, then the ABI-encoded arguments). The only supported use is EVM to CosmWasm (`targetVM` = 1); the ABI may still change before activation.

**Gas cost:** 50,000 base + 4 gas per byte of input, plus the target contract execution cost. See [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) for details.

---

## Interface File Locations

The Solidity interface files are available in the repository for direct import:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Install them in your Hardhat or Foundry project:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Or reference them via import path in your Solidity files:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Next Steps

* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — Full cross-VM messaging documentation
* [EVM Development](/developer-guide/evm-development) — Deploying Solidity contracts
* [Account Abstraction](/developer-guide/account-abstraction) — Linked-wallet authenticators and spending rules (module currently disabled)
