---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ 名前空間
sidebar_label: JSON-RPC — eth_ 名前空間
sidebar_position: 3
---

# JSON-RPC — eth_ 名前空間

QoreChainは完全にEVM互換のJSON-RPCインターフェースを実装しており、標準的なEthereumツール(MetaMask、Hardhat、Foundry、ethers.js、web3.js)が変更なしにチェーンと連携できます。

## 接続

| トランスポート | デフォルトアドレス       |
| --------------- | ------------------------ |
| HTTP             | `http://localhost:8545` |
| WebSocket        | `ws://localhost:8546`   |

:::note
EVM JSON-RPCインターフェースは、**`qorechain-vladi`** メインネット(EVMチェーンID **9801**、16進数 **0x2649**、チェーンバージョン **v3.1.95** で稼働中)と **`qorechain-diana`** テストネット(EVMチェーンID **9800**、16進数 **0x2648**)によって提供されます。上記のローカルアドレスは自分で実行するノードに適用されます。リモートアクセスの場合は、お使いのプロバイダーのメインネットまたはテストネットのエンドポイントに置き換えてください。
:::

## サポートされている名前空間

| 名前空間  | 説明                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| `eth_`    | Ethereumのコアとなる JSON-RPC メソッド                                                     |
| `web3_`   | ユーティリティメソッド(クライアントバージョン、ハッシュ化)                               |
| `net_`    | ネットワークステータスメソッド                                                             |
| `txpool_` | トランザクションプールの検査                                                               |
| `qor_`    | QoreChain固有の拡張機能([qor_ 名前空間](/api-reference/json-rpc-qor_-namespace)を参照)   |

## eth_ メソッド

| メソッド                     | パラメータ                                        | 説明                                                     |
| ---------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| `eth_blockNumber`            | なし                                                | 最新のブロック番号を返す                                 |
| `eth_getBalance`              | `address`、`blockNumber`                          | アドレスの残高をwei単位で返す                             |
| `eth_getTransactionCount`    | `address`、`blockNumber`                          | アドレスのナンス(トランザクション数)を返す               |
| `eth_sendRawTransaction`     | `signedTxData`                                     | 署名済みトランザクションをブロードキャスト用に送信する    |
| `eth_call`                   | `callObject`、`blockNumber`                       | EVMに対して読み取り専用の呼び出しを実行する                |
| `eth_estimateGas`            | `callObject`                                       | トランザクションに必要なガス量を見積もる                   |
| `eth_getBlockByNumber`       | `blockNumber`、`fullTx`(真偽値)                  | 番号によりブロックデータを返す                             |
| `eth_getTransactionByHash`   | `txHash`                                           | ハッシュによりトランザクションデータを返す                 |
| `eth_getTransactionReceipt`  | `txHash`                                           | マイニングされたトランザクションのレシートを返す           |
| `eth_getLogs`                | `filterObject`                                     | フィルタに一致するログを返す                               |
| `eth_chainId`                | なし                                                | チェーンID(16進数エンコード)を返す                       |
| `eth_gasPrice`                | なし                                                | 現在のガス価格をwei単位で返す                             |
| `eth_feeHistory`             | `blockCount`、`newestBlock`、`rewardPercentiles`  | 過去の手数料データを返す(EIP-1559)                        |

## web3_ メソッド

| メソッド              | パラメータ    | 説明                                        |
| ---------------------- | -------------- | ------------------------------------------- |
| `web3_clientVersion`  | なし           | クライアントのバージョン文字列を返す        |
| `web3_sha3`           | `data`(16進数) | 入力のKeccak-256ハッシュを返す              |

## net_ メソッド

| メソッド          | パラメータ | 説明                                     |
| ------------------ | ---------- | ---------------------------------------- |
| `net_version`      | なし       | ネットワークIDを返す                     |
| `net_listening`    | なし       | ノードがリッスン中であれば `true` を返す |
| `net_peerCount`    | なし       | 接続中のピア数(16進数)を返す           |

## 設定

`app.toml` でJSON-RPCサーバーを有効化・設定します。

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces
api = "eth,web3,net,txpool,qor"

# Maximum number of logs returned by eth_getLogs
filter-cap = 10000

# Maximum gas for eth_call and eth_estimateGas
gas-cap = 25000000

# EVM execution timeout
evm-timeout = "5s"

# Transaction fee cap (in QOR)
txfee-cap = 1

# Maximum open WebSocket connections
max-open-connections = 0
```

## 例

### eth_blockNumber

リクエスト:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

レスポンス:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

リクエスト:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
  }'
```

レスポンス(メインネット `qorechain-vladi`、チェーンID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

`qorechain-diana` テストネット(チェーンID 9800)では、このメソッドは `"0x2648"` を返します。

### eth_getBalance

リクエスト:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", "latest"],
    "id": 3
  }'
```

レスポンス:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## ethers.js での接続

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get latest block
const block = await provider.getBlockNumber();
console.log("Latest block:", block);

// Get balance
const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
console.log("Balance:", ethers.formatEther(balance), "QOR");
```

:::info

- チェーンIDは16進数文字列で返されます。ウォレット設定用に10進数へ変換してください — `0x2649` は **9801**(メインネット)、`0x2648` は **9800**(テストネット)です。
- ガス価格はEIP-1559モデルに従います。基本手数料と優先手数料の見積もりには `eth_feeHistory` を使用してください。
- 受け付けられるブロックタグ: `"latest"`、`"earliest"`、`"pending"`、または16進数のブロック番号。
- フィルタの制限: `eth_getLogs` は1クエリあたり `filter-cap` 件(デフォルト10,000件)に制限されます。大量のデータセットにはより狭いブロック範囲を使用してください。

:::
