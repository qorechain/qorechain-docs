---
slug: /developer-guide/evm-precompiles
title: EVM 프리컴파일
sidebar_label: EVM 프리컴파일
sidebar_position: 6
---

# EVM 프리컴파일

QoreChain은 프로토콜 수준의 기능을 Solidity에 직접 노출하는 **6개의 커스텀 프리컴파일 컨트랙트**로 QoreChain EVM Engine을 확장합니다. 이 프리컴파일들은 양자내성 암호, AI 위험 점수, 크로스-VM 메시징, PRISM 합의 매개변수에 대한 온체인 접근을 제공합니다.

:::note
프리컴파일은 **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**, 2026년 6월 7일부터 체인 버전 **v3.1.77**로 운영 중)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**) 모두에서 사용할 수 있습니다. 모든 예제는 **포트 8545**의 JSON-RPC 엔드포인트를 사용합니다.
:::

---

## 프리컴파일 주소 맵

| 프리컴파일              | 주소                                      | 기본 가스        | 설명                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | 동기식 크로스-VM 호출 (EVM에서 CosmWasm으로)     |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | ML-DSA-87 양자내성 서명 검증         |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | 계정에 등록된 PQC 키가 있는지 확인     |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | 트랜잭션 데이터에 대한 AI 생성 위험 점수 조회 |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | 전송이 이상으로 플래그되는지 확인      |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | 현재 PRISM 튜닝 합의 매개변수 읽기    |

---

## Solidity 인터페이스

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

## 사용 예제

### PQC Verify — 양자내성 서명 검증

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

**가스 비용:** 25,000 기본 + 입력 데이터 바이트당 8 가스. 일반적인 ML-DSA-87 검증(2592 + 4627 + 메시지 바이트)의 경우 약 80,000~90,000 가스를 예상하세요.

### PQC Key Status — 계정 등록 확인

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**가스 비용:** 2,500 고정.

### AI Risk Score — 트랜잭션 위험 평가

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

**위험 수준:**

| 수준    | 값 | 점수 범위 (bps) |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

**가스 비용:** 50,000 고정.

### AI Anomaly Check — 의심스러운 전송 플래그

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

**가스 비용:** 40,000 고정.

### PRISM Consensus Params — 합의 상태 읽기

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

**가스 비용:** 1,500 고정.

### CrossVM Bridge — EVM에서 CosmWasm 호출

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

**가스 비용:** 50,000 기본 + 대상 컨트랙트 실행 비용. 자세한 내용은 [크로스-VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참고하세요.

---

## 인터페이스 파일 위치

Solidity 인터페이스 파일은 직접 임포트할 수 있도록 리포지토리에서 제공됩니다:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

Hardhat 또는 Foundry 프로젝트에 설치하세요:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

또는 Solidity 파일에서 임포트 경로로 참조하세요:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## 다음 단계

* [크로스-VM 상호운용성](/developer-guide/cross-vm-interoperability) — 전체 크로스-VM 메시징 문서
* [EVM 개발](/developer-guide/evm-development) — Solidity 컨트랙트 배포
* [계정 추상화](/developer-guide/account-abstraction) — 세션 키를 갖춘 프로그래밍 가능한 계정
