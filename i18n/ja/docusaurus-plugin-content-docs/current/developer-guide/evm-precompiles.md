---
slug: /developer-guide/evm-precompiles
title: EVMプリコンパイル
sidebar_label: EVMプリコンパイル
sidebar_position: 6
---

# EVMプリコンパイル

QoreChainは、プロトコルレベルの機能をSolidityに直接公開する **6つのカスタムプリコンパイル済みコントラクト** でQoreChain EVM Engineを拡張しています。これらのプリコンパイルは、ポスト量子暗号、AIリスクスコアリング、クロスVMメッセージング、そしてPRISMコンセンサスパラメータへのオンチェーンアクセスを提供します。

:::note
プリコンパイルは、**`qorechain-vladi`** メインネット（EVMチェーンID **9801**、2026年6月7日よりチェーンバージョン **v3.1.80** で稼働中）と **`qorechain-diana`** テストネット（EVMチェーンID **9800**）の両方で利用できます。すべての例は **ポート8545** のJSON-RPCエンドポイントを使用します。
:::

---

## プリコンパイルアドレスマップ

| プリコンパイル          | アドレス                                      | ベースガス        | 説明                                             |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000          | 同期的なクロスVM呼び出し（EVMからCosmWasm）        |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | ML-DSA-87ポスト量子署名を検証                      |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | アカウントに登録済みのPQC鍵があるかを確認          |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | トランザクションデータのAI生成リスクスコアを取得    |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | 送金が異常としてフラグ付けされているかを確認        |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | 現在のPRISMチューニング済みコンセンサスパラメータを読み取り |

---

## Solidityインターフェース

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

## 使用例

### PQC Verify — ポスト量子署名を検証する

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

**ガスコスト:** ベース25,000 + 入力データ1バイトあたり8ガス。一般的なML-DSA-87検証（2592 + 4627 + メッセージのバイト数）では、おおよそ80,000〜90,000ガスを見込んでください。

### PQC Key Status — アカウント登録を確認する

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**ガスコスト:** 一律2,500。

### AI Risk Score — トランザクションリスクを評価する

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

**リスクレベル:**

| レベル    | 値    | スコア範囲（bps）  |
| -------- | ----- | ----------------- |
| SAFE     | 0     | 0 - 1000          |
| LOW      | 1     | 1001 - 3000       |
| MEDIUM   | 2     | 3001 - 6000       |
| HIGH     | 3     | 6001 - 8500       |
| CRITICAL | 4     | 8501 - 10000      |

**ガスコスト:** 一律50,000。

### AI Anomaly Check — 不審な送金をフラグ付けする

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

**ガスコスト:** 一律40,000。

### PRISM Consensus Params — コンセンサス状態を読み取る

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

**ガスコスト:** 一律1,500。

### CrossVM Bridge — EVMからCosmWasmを呼び出す

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

**ガスコスト:** ベース50,000 + 対象コントラクトの実行コスト。詳細は[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## インターフェースファイルの場所

Solidityインターフェースファイルは、直接インポートできるようにリポジトリ内で利用できます。

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
    ICrossVM.sol
```

HardhatまたはFoundryプロジェクトにインストールします。

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

あるいは、Solidityファイル内でインポートパスを介して参照します。

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## 次のステップ

* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — クロスVMメッセージングの完全なドキュメント
* [EVM開発](/developer-guide/evm-development) — Solidityコントラクトのデプロイ
* [アカウントアブストラクション](/developer-guide/account-abstraction) — セッションキーを備えたプログラマブルアカウント
