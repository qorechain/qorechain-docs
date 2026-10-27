---
slug: /developer-guide/evm-precompiles
title: EVMプリコンパイル
sidebar_label: EVMプリコンパイル
sidebar_position: 6
---

# EVMプリコンパイル

QoreChainは、プロトコルレベルの機能をSolidityに直接公開する **6つのカスタムプリコンパイル済みコントラクト** でQoreChain EVM Engineを拡張しています。これらのプリコンパイルは、ポスト量子暗号、AIリスクスコアリング、クロスVMメッセージング、そしてPRISMコンセンサスパラメータへのオンチェーンアクセスを提供します。

:::warning メインネットでは有効化されていません。テストネットでは 3 つが有効です
以下の 6 つの QoreChain プリコンパイルは**ノードにコンパイルされています**が、EVM は `active_static_precompiles` パラメータに記載されたアドレスだけをディスパッチします。**`qorechain-vladi`** メインネット（EVM チェーン ID **9801**）では、執筆時点でこのリストは空であり、**有効なものはありません**。**`qorechain-diana`** テストネット（EVM チェーン ID **9800**）では 3 つが有効です。PQC Verify、PQC Key Status、PRISM Consensus Params で、テストネットのガバナンス提案 21（2026 年 10 月 27 日に可決）によって有効化されました。残りの 3 つはどちらのネットワークでも有効ではありません。リストにないアドレスへの呼び出しは**成功し、空のデータ（`0x`）を返します**。リバートもエラーも返しません。いずれかに頼る前に、[ネットワークの状況](#network-status)を確認してください。
:::

## ネットワークの状況 {#network-status}

| プリコンパイル | アドレス | `qorechain-vladi` (メインネット) | `qorechain-diana` (テストネット) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | 未有効化 | **有効**（2026年10月27日から） |
| PQC Key Status | `0x…0A02` | 未有効化 | **有効**（2026年10月27日から） |
| AI Risk Score | `0x…0B01` | 未有効化 | 未有効化 |
| AI Anomaly Check | `0x…0B02` | 未有効化 | 未有効化 |
| PRISM Consensus Params | `0x…0C01` | 未有効化 | **有効**（2026年10月27日から） |
| CrossVM Bridge | `0x…0901` | 未有効化 | 未有効化 |

2026年10月27日時点で、ライブの `active_static_precompiles` パラメータから読み取った状況です。これはガバナンスによって変更されるチェーンパラメータであるため、各ネットワークのリストはガバナンス提案が可決されたときにのみ変わります。テストネットのリストは提案 21 で設定され、執筆時点でこれを変更するメインネットの提案はありません。v3.2.3リリース(メインネット、2026年10月20日)では、CrossVMブリッジとAI異常検知プリコンパイルの強化版がプロトコル機能の背後でバイナリに組み込まれましたが、どのプリコンパイルも有効化されておらず、v3.2.4(メインネットでは2026年10月23日から、テストネットでは2026年10月19日から)でもこれは変わりません。まず読み取り専用のPQCとコンセンサスのプリコンパイル、次に読み取り専用の固定小数点パスが整った段階でAIの2つ、そして最後にCrossVMブリッジの順です。この表に載せるのは適用済みのものだけです。投票期間中の提案は、状況ではありません。

現在のリストはご自身で確認できます(空の場合はどれも有効化されていません):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### 空の戻りデータへの備え {#guard}

無効なアドレス(またはQoreChain以外のアドレス)はデータなしで成功を返すため、低レベル呼び出しの生の戻りバイトは、長さを確認せずに読み取らないでください。`abi.decode` と型付きインターフェース呼び出しは空データでリバートしますが、これは安全な結果です。手書きの低レベル呼び出しでは、明示的に確認する必要があります。

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

これらのアドレスに価値を送らないでください。payableではなく、無効なプリコンパイルのアドレスに送られた価値はそこに残り、回収する手段はありません。

テストネットでは、有効な 3 つのプリコンパイルが応答することを簡単に確認できます(Foundry の `cast` を使用。メインネットではこれらのアドレスは代わりに空のデータを返します):

```bash
RPC=https://evm-testnet.qore.host
cast call 0x0000000000000000000000000000000000000C01 "rlConsensusParams()(uint256,uint256,uint256,uint256)" --rpc-url $RPC
cast call 0x0000000000000000000000000000000000000A02 "pqcKeyStatus(address)(bool,uint8,bytes,bool)" 0x0000000000000000000000000000000000000001 --rpc-url $RPC
```

---

## プリコンパイルアドレスマップ

ガスの数値は、プリコンパイルが有効化された後にノードが課金する額です(per byte は呼び出し入力の1バイトあたりを意味します)。

| プリコンパイル          | アドレス                                      | ベースガス        | 説明                                             |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000 + 4/byte | 同期的なクロスVM呼び出し（EVMからQoreChain Native）        |
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

v3.2.4以降(メインネットでは2026年10月23日から、テストネットでは2026年10月19日から)、`pqcKeyStatus` の出力には `pubkey` の後に4番目の値 `bool possessionProven` が加わります。これは、アカウントの現在の鍵が検証済みの所有証明によって証明されたかどうかを示します([ポスト量子署名](/developer-guide/post-quantum-signing#proof-of-possession)を参照)。プリコンパイルが有効な場所ではどこでも返されます。テストネットでは有効で(鍵のないアカウントへの呼び出しは `false, 0, 0x, false` を返します)、メインネットではアップグレードでプリコンパイルが有効化された時点からです。上記のインターフェースには最初の3つの出力のみを記載しています。鍵を信頼する必要があるコントラクトは、4番目の値も読み取る必要があります。

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

**ガスコスト:** ベース25,000 + 入力データ1バイトあたり8ガス。入力はABIエンコードされた呼び出し(公開鍵2592バイト、署名4627バイト、メッセージ、さらにABIオフセットとパディング)であるため、一般的なML-DSA-87検証のコストはおおよそ85,000〜90,000ガスです。

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

### AI Risk Score — トランザクションのリスクを評価する

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

| レベル   | 値 |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

レベルは、AIエンジンがそのトランザクションに付けた重大度ラベルに由来します。スコアはベーシスポイント(0 - 10000)で返されます。スコア範囲とレベルの間に固定の対応関係はないため、スコアのしきい値ではなく `level` に基づいて判定してください。

**ガスコスト:** 一律50,000。

### AI Anomaly Check — 不審な送金にフラグを立てる

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

**ガスコスト:** 一律1,500。加えて、呼び出しが行う状態読み取りが標準コストで加算されます。

:::note 4 つの値の意味
v3.2.6(テストネット。メインネットにはまだありません)以降、`rlConsensusParams` は固定のプレースホルダーではなく、`rlconsensus` モジュールが保持する値を返します。適用中のブロック時間ターゲット(ミリ秒)、適用中のガス価格下限、モジュールの `default_validator_set_size`、エージェントの現在のエポックです。2026年10月27日のテストネットでは `5000`、`100`、`100`、`1` を返しました(`GET /qorechain/rlconsensus/v1/applied_params` と同じ適用済みの値。[REST / gRPC エンドポイント](/api-reference/rest-grpc-endpoints#rlconsensus-module)を参照)。これらはモジュール自身の設定であり、**実測のブロック時間ではありません**(メインネットで約3.1秒、テストネットで約1.3秒)。また、テストネットではエージェントがシャドウモードで動作しているため、何も適用しません。v3.2.6より古いノードでは、同じ呼び出しが固定のプレースホルダーのデフォルト値を返します。
:::

### CrossVM Bridge — EVMからQoreChain Nativeを呼び出す

:::warning
CrossVMブリッジのプリコンパイルは、どちらのネットワークでも**有効化されていません**。v3.2.3以降のバイナリには強化版が含まれており、その内容は次のとおりです。`STATICCALL` を拒否します。ネストした呼び出しを、呼び出しフレームの残りガスを上限とするガスメーターで実行してジャーナルに記録するため、呼び出し元コントラクトでのリバートはQoreChain Native側も取り消します。許可リストに載ったQoreChain Nativeターゲットにのみ到達します(EVMターゲットは拒否されます)。そしてクロスVMサーキットブレーカーを尊重します。ガバナンスで承認されたアップグレードで有効化されるまで、EVMからQoreChain Nativeへの同期パスは存在しません。`MsgCrossVMCall` メッセージパス(これ自体も現在メインネットでは無効化されています)については、[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。
:::

ノードはcalldataを `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`(4バイトのセレクター、続いてABIエンコードされた引数)としてデコードします。サポートされる用途はEVMからQoreChain Native(`targetVM` = 1)のみです。有効化までにABIが変更される可能性があります。`@qorechain/rdk` のヘルパー `encodeCrossVmCalldata` は0.6.0からこのレイアウトでエンコードします(それ以前のリリースは別の関数をエンコードしていました)。また `isCrossVmPrecompileActive` は、ライブの `active_static_precompiles` リストを読み取ります。[マルチVM](/rollups/multi-vm)を参照してください。

**ガスコスト:** ベース50,000 + 入力1バイトあたり4ガス、さらに対象コントラクトの実行コスト。詳細は[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## インターフェースファイルの場所

Solidityのインターフェースファイルは、直接インポートできるようにリポジトリで公開されています。

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

HardhatまたはFoundryプロジェクトにインストールします。

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

または、Solidityファイル内でインポートパスを使って参照します。

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## 次のステップ

* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — クロスVMメッセージングの完全なドキュメント
* [EVM開発](/developer-guide/evm-development) — Solidityコントラクトのデプロイ
* [アカウントアブストラクション](/developer-guide/account-abstraction) — リンク済みウォレットのオーセンティケーターと支出ルール(テストネットでは有効、メインネットでは無効)
