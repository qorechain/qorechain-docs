---
slug: /developer-guide/evm-precompiles
title: EVM 프리컴파일
sidebar_label: EVM 프리컴파일
sidebar_position: 6
---

# EVM 프리컴파일

QoreChain은 QoreChain EVM 엔진을 **6개의 커스텀 프리컴파일 컨트랙트**로 확장하여 프로토콜 수준의 기능을 Solidity에 직접 노출합니다. 이 프리컴파일들은 포스트 퀀텀 암호화, AI 리스크 스코어링, 크로스 VM 메시징, PRISM 합의 파라미터에 대한 온체인 접근을 제공합니다.

:::warning 메인넷과 테스트넷에서 아직 활성화되지 않음
아래의 QoreChain 프리컴파일 6개는 **노드에 컴파일되어 있지만 아직 활성화되지 않았습니다**. **`qorechain-vladi`** 메인넷(EVM 체인 ID **9801**)과 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**) 모두 해당됩니다. EVM은 `active_static_precompiles` 파라미터에 있는 주소만 디스패치하며, 이 목록은 두 네트워크 모두 비어 있습니다. 체인 업그레이드로 활성화되기 전까지 이 주소들을 호출하면 **성공하고 빈 데이터(`0x`)를 반환**합니다. 리버트하지도, 오류를 반환하지도 않습니다. 이 중 어느 것이든 의존하기 전에 [네트워크 상태](#network-status)를 확인하세요.
:::

## 네트워크 상태 {#network-status}

| 프리컴파일 | 주소 | `qorechain-vladi` (메인넷) | `qorechain-diana` (테스트넷) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | 비활성 | 비활성 |
| PQC Key Status | `0x…0A02` | 비활성 | 비활성 |
| AI Risk Score | `0x…0B01` | 비활성 | 비활성 |
| AI Anomaly Check | `0x…0B02` | 비활성 | 비활성 |
| PRISM Consensus Params | `0x…0C01` | 비활성 | 비활성 |
| CrossVM Bridge | `0x…0901` | 비활성 | 비활성 |

활성화에는 체인 업그레이드가 필요하며 단계적으로 진행될 예정입니다. 읽기 전용인 PQC 및 합의 프리컴파일이 먼저, AI 2종은 읽기 전용 고정소수점 경로가 갖춰진 뒤에, CrossVM 브리지는 마지막에 활성화됩니다. v3.2.3 릴리스(메인넷, 2026년 10월 20일)는 CrossVM 브리지와 AI 이상 탐지 프리컴파일의 강화된 버전을 프로토콜 기능 뒤에 두고 바이너리에 포함했지만, **어떤 프리컴파일도 활성화하지 않았습니다**. `active_static_precompiles` 목록은 두 네트워크 모두 여전히 비어 있으며, v3.2.4(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터)도 이를 바꾸지 않습니다. 이 표는 이들 중 어느 것이든 활성화하는 업그레이드와 같은 작업에서 갱신됩니다.

현재 목록을 직접 확인하세요 (비어 있으면 활성화된 것이 없음).

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### 빈 반환 데이터에 대비하기 {#guard}

비활성(또는 QoreChain이 아닌) 주소는 데이터 없이 성공을 반환하므로, 길이를 확인하지 않고 저수준 호출의 원시 반환 바이트를 읽어서는 안 됩니다. `abi.decode`와 타입이 지정된 인터페이스 호출은 빈 데이터에서 리버트하며 이는 안전한 결과입니다. 직접 작성한 저수준 호출은 이를 명시적으로 확인해야 합니다.

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

이 주소들로 가치를 보내지 마세요. payable이 아니며, 비활성 프리컴파일 주소로 보낸 가치는 그곳에 남아 복구할 방법이 없습니다.

---

## 프리컴파일 주소 맵

가스 수치는 프리컴파일이 활성화된 후 노드가 부과하는 값입니다 (바이트당은 호출 입력 바이트당을 의미합니다).

| 프리컴파일              | 주소                                      | 기본 가스        | 설명                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000 + 바이트당 4 | 동기식 크로스 VM 호출(EVM에서 QoreChain Native으로)     |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 바이트당 8 | ML-DSA-87 포스트 퀀텀 서명 검증         |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | 계정에 등록된 PQC 키가 있는지 확인     |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | 트랜잭션 데이터에 대한 AI 생성 리스크 스코어 조회 |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | 전송이 이상 거래로 플래그되는지 확인      |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | 현재 PRISM 튜닝 합의 파라미터 조회    |

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

v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) 이 프리컴파일이 활성화되면 출력에 `pubkey` 뒤에 네 번째 값 `bool possessionProven`이 추가됩니다. 계정의 현재 키가 검증된 소유 증명으로 증명되었는지 여부입니다([양자내성 서명](/developer-guide/post-quantum-signing#proof-of-possession) 참조). 위 인터페이스에는 처음 세 출력만 나열되어 있으며, 키를 신뢰해야 하는 컨트랙트는 네 번째 값도 읽어야 합니다.

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

### PQC Verify — 포스트 퀀텀 서명 검증

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

**가스 비용:** 기본 25,000 + 입력 데이터 바이트당 8 가스. 입력은 ABI 인코딩된 호출(공개 키 2592 바이트, 서명 4627 바이트, 메시지, 그리고 ABI 오프셋과 패딩)이므로, 일반적인 ML-DSA-87 검증은 대략 85,000~90,000 가스가 소요됩니다.

### PQC Key Status — 계정 등록 여부 확인

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**가스 비용:** 정액 2,500.

### AI Risk Score — 트랜잭션 리스크 평가

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

**리스크 레벨:**

| 레벨    | 값 |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

레벨은 AI 엔진이 해당 트랜잭션에 부여한 심각도 레이블에서 나오며, 스코어는 베이시스 포인트(0 - 10000)로 반환됩니다. 스코어 범위에서 레벨로의 고정된 매핑은 없으므로, 스코어 임계값이 아니라 `level`을 기준으로 게이팅하세요.

**가스 비용:** 정액 50,000.

### AI Anomaly Check — 의심스러운 전송 플래그 처리

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

**가스 비용:** 정액 40,000.

### PRISM Consensus Params — 합의 상태 조회

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

**가스 비용:** 정액 1,500.

:::note
현재 노드 빌드에서 `rlConsensusParams`는 라이브 PRISM 튜닝 값이 아닌 고정된 플레이스홀더 기본값을 반환합니다 (예를 들어 측정된 블록 시간, 즉 메인넷에서 약 3.2초, 테스트넷에서 약 1.0초를 보고하지 않습니다). 이를 라이브 합의 파라미터에 연결하는 것은 활성화 작업의 일부입니다.
:::

### CrossVM Bridge — EVM에서 QoreChain Native 호출

:::warning
CrossVM 브리지 프리컴파일은 어느 네트워크에서도 **활성화되어 있지 않습니다**. v3.2.3부터 바이너리에는 강화된 버전이 들어 있으며, 이 버전은 `STATICCALL`을 거부하고, 중첩 호출을 호출 프레임에 남은 가스로 제한되는 가스 미터에서 실행하며 저널에 기록해 호출하는 컨트랙트의 되돌림이 QoreChain Native 쪽도 함께 취소하게 하고, 허용 목록에 있는 QoreChain Native 대상에만 접근하며(EVM 대상은 거부됨), 크로스 VM 서킷 브레이커를 준수합니다. 거버넌스에서 승인된 업그레이드가 이를 활성화하기 전까지는 동기식 EVM-to-QoreChain Native 경로가 없습니다. `MsgCrossVMCall` 메시지 경로는 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참고하세요. 이 경로 자체도 현재 메인넷에서는 꺼져 있습니다.
:::

노드는 calldata를 `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`로 디코딩합니다 (4바이트 셀렉터 다음에 ABI 인코딩된 인자). 지원되는 용도는 EVM에서 QoreChain Native으로의 호출(`targetVM` = 1)뿐이며, ABI는 활성화 전에 변경될 수 있습니다. `@qorechain/rdk` 헬퍼 `encodeCrossVmCalldata`는 0.6.0부터 이 레이아웃을 인코딩하며(이전 릴리스는 다른 함수를 인코딩했습니다), `isCrossVmPrecompileActive`는 실제 `active_static_precompiles` 목록을 읽습니다. [멀티 VM](/rollups/multi-vm)을 참조하세요.

**가스 비용:** 기본 50,000 + 입력 바이트당 4 가스, 여기에 대상 컨트랙트 실행 비용이 더해집니다. 자세한 내용은 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참고하세요.

---

## 인터페이스 파일 위치

Solidity 인터페이스 파일은 직접 임포트할 수 있도록 저장소에 제공됩니다.

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Hardhat 또는 Foundry 프로젝트에 다음과 같이 설치하세요.

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

또는 Solidity 파일에서 임포트 경로를 통해 참조하세요.

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## 다음 단계

* [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability) — 크로스 VM 메시징 전체 문서
* [EVM 개발](/developer-guide/evm-development) — Solidity 컨트랙트 배포하기
* [계정 추상화](/developer-guide/account-abstraction) — 연결된 지갑 인증자와 지출 규칙 (모듈은 현재 비활성화됨)
