---
slug: /developer-guide/evm-development
title: EVM開発
sidebar_label: EVM開発
sidebar_position: 2
---

# EVM開発

QoreChainは、QoreChain EVM Engine上で完全にEVM互換の実行環境を稼働させており、使い慣れたツールを使ってSolidityスマートコントラクトをデプロイし、操作することができます。EVMモジュールは、標準的なEthereum開発ワークフローをサポートするJSON-RPCインターフェースを**ポート8545**（WebSocketは**8546**）で公開しています。

:::note
以下の例は、**`qorechain-vladi`** メインネット（EVMチェーンID **9801**）を対象としています。これは2026年6月7日にチェーンバージョン **v3.1.82** で稼働を開始しました。**`qorechain-diana`** テストネットの場合は、EVMチェーンID **9800** を使用してください。
:::

---

## JSON-RPCエンドポイント

| プロパティ           | 値                                          |
| -------------------- | ------------------------------------------ |
| デフォルトURL        | `http://localhost:8545`                    |
| WebSocket URL        | `ws://localhost:8546`                      |
| サポートされる名前空間 | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| チェーンID（メインネット） | `9801` (`qorechain-vladi`)                 |
| チェーンID（テストネット） | `9800` (`qorechain-diana`)                 |
| 通貨シンボル          | `QOR`                                      |

`qor_` 名前空間は、QoreChain固有のメソッドを提供します。下記の[カスタム名前空間](#custom-qor_-namespace)を参照してください。

---

## ウォレット設定（MetaMask）

QoreChainをMetaMaskにカスタムネットワークとして追加します。

| フィールド          | メインネットの値          | テストネットの値        |
| ------------------ | ------------------------- | ----------------------- |
| ネットワーク名      | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC URL            | `http://localhost:8545`   | `http://localhost:8545` |
| チェーンID          | `9801`                    | `9800`                  |
| 通貨シンボル        | `QOR`                     | `QOR`                   |
| ブロックエクスプローラーURL | *(公式メインネットエクスプローラーを使用)* | *(ローカルテストネットの場合は空欄のまま)* |

---

## Hardhat

Hardhatをインストールし、`hardhat.config.js` を設定します。

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

コントラクトをデプロイします。

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

QoreChain EVMに対してテストを実行します。

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Foundryでコントラクトを作成してデプロイします。

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## ガスモデル

QoreChainは、EVMトランザクションに **EIP-1559の動的ベースフィー** モデルを使用しています。

* ベースフィーは利用率に基づきブロックごとに調整されます
* ユーザーは `maxFeePerGas` と `maxPriorityFeePerGas` を設定できます
* プライオリティフィーはブロックプロポーザーに渡されます

### 単位の橋渡し

ネイティブのQORトークンは **小数点以下6桁**（`uqor`）を持つ一方、EVMは **小数点以下18桁** を想定しています。`x/precisebank` モジュールがシームレスな変換を処理します。

| コンテキスト  | 単位          | 小数桁数 | 例                     |
| ------------ | ------------ | -------- | ---------------------- |
| ネイティブチェーン | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

この変換は透過的です。`eth_getBalance` で残高を確認すると、レスポンスは18桁のweiで表されます。同じアカウントをネイティブのbankモジュール経由でクエリすると、残高は6桁の `uqor` で表示されます。

---

## ERC-20トークンペア

`x/erc20` モジュールは、ネイティブのCosmos SDK単位とERC-20コントラクトの間の **トークンペア** の自動登録を提供します。

* ネイティブトークンはEVMコントラクト内でERC-20として使用できます
* EVM上にデプロイされたERC-20トークンはネイティブ単位に変換できます
* 変換は双方向で、プロトコルレベルで処理されます

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQCとEVMの互換性

EVMトランザクションは、既存のEthereumツール、ウォレット、ライブラリとの完全な互換性のために、**古典的なECDSA（secp256k1）** 署名を使用します。これにより、MetaMask、Hardhat、Foundry、ethers.js、そしてすべての標準的なEVMツールが変更なしで動作することが保証されます。

EVM内での耐量子セキュリティについて:

* **PQC Verifyプリコンパイル**（`0x0000...0A01`）を使用して、SolidityからオンチェーンでML-DSA-87署名を検証します。[EVMプリコンパイル](/developer-guide/evm-precompiles)を参照してください。
* EVMからCosmWasmまたはSVMへの **クロスVMメッセージ** は、Cosmos SDKトランザクション層でPQC署名できます。
* アカウントは、ハイブリッドセキュリティのために `x/pqc` を介してオプションでPQC公開鍵を登録できます。

---

## カスタム `qor_` 名前空間 {#custom-qor_-namespace}

QoreChainは、チェーン固有のクエリのために `qor_` 名前空間でJSON-RPCを拡張しています。

| メソッド                     | 説明                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | アカウントに登録済みのPQC公開鍵があるかどうかを確認します               |
| `qor_getAIStats`            | AIエンジンの統計情報（異常件数、リスク分布）を取得します                 |
| `qor_getCrossVMMessage`     | IDによるクロスVMメッセージのステータスをクエリします                     |
| `qor_getPoolClassification` | バリデータプール分類（RPoS/DPoS/PoS）を取得します                      |
| `qor_getReputationScore`    | バリデータのレピュテーションスコアをクエリします                        |
| `qor_getAbstractAccount`    | アブストラクトアカウント設定を取得します                              |

`curl` を使った例:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## 次のステップ

* [EVMプリコンパイル](/developer-guide/evm-precompiles) — SolidityからPQC、AI、クロスVM機能にアクセスする
* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — EVMからCosmWasmおよびSVMコントラクトを呼び出す
* [アカウントアブストラクション](/developer-guide/account-abstraction) — セッションキーを備えたプログラマブルアカウント
