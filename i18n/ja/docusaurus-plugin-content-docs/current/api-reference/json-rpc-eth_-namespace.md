---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ 名前空間
sidebar_label: JSON-RPC — eth_ 名前空間
sidebar_position: 3
---

# JSON-RPC — eth_ 名前空間

QoreChain は完全に EVM 互換の JSON-RPC インターフェースを実装しており、標準的な Ethereum ツール（MetaMask、Hardhat、Foundry、ethers.js、web3.js）が変更なしでチェーンとやり取りできます。

## 接続

| トランスポート | デフォルトアドレス      |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
EVM JSON-RPC インターフェースは、**`qorechain-vladi`** メインネット（EVM チェーン ID **9801**、16進 `0x2649`、チェーンバージョン **v3.1.82** で稼働中）と **`qorechain-diana`** テストネット（EVM チェーン ID **9800**、16進 `0x2648`）によって提供されます。上記のローカルアドレスは自分で運用するノードに適用されます。リモートアクセスの場合は、プロバイダーのメインネットまたはテストネットのエンドポイントに置き換えてください。
:::

## サポートされている名前空間

| 名前空間 | 説明                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | コア Ethereum JSON-RPC メソッド                                                                                 |
| `web3_`   | ユーティリティメソッド（クライアントバージョン、ハッシュ化）                                                                      |
| `net_`    | ネットワークステータスメソッド                                                                                         |
| `txpool_` | トランザクションプールの検査                                                                                    |
| `qor_`    | QoreChain 固有の拡張機能（[qor_ 名前空間](/api-reference/json-rpc-qor_-namespace) を参照）                   |

## eth_ メソッド

| メソッド                      | パラメータ                                       | 説明                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | なし                                             | 最新のブロック番号を返します                      |
| `eth_getBalance`            | `address`, `blockNumber`                         | アドレスの残高を wei 単位で返します             |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | アドレスの nonce（トランザクション数）を返します |
| `eth_sendRawTransaction`    | `signedTxData`                                   | 署名済みトランザクションをブロードキャストのために送信します           |
| `eth_call`                  | `callObject`, `blockNumber`                      | EVM に対して読み取り専用の呼び出しを実行します            |
| `eth_estimateGas`           | `callObject`                                     | トランザクションに必要なガスを見積もります         |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | 番号でブロックデータを返します                         |
| `eth_getTransactionByHash`  | `txHash`                                         | ハッシュでトランザクションデータを返します                   |
| `eth_getTransactionReceipt` | `txHash`                                         | マイニングされたトランザクションのレシートを返します          |
| `eth_getLogs`               | `filterObject`                                   | フィルターに一致するログを返します                  |
| `eth_chainId`               | なし                                             | チェーン ID（16進エンコード）を返します                   |
| `eth_gasPrice`              | なし                                             | 現在のガス価格を wei 単位で返します                 |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | 過去の手数料データを返します（EIP-1559）               |

## web3_ メソッド

| メソッド               | パラメータ   | 説明                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | なし         | クライアントバージョン文字列を返します        |
| `web3_sha3`          | `data` (hex) | 入力の Keccak-256 ハッシュを返します |

## net_ メソッド

| メソッド          | パラメータ | 説明                                 |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | なし       | ネットワーク ID を返します                      |
| `net_listening` | なし       | ノードがリッスンしている場合は `true` を返します     |
| `net_peerCount` | なし       | 接続されているピアの数（16進）を返します |

## 設定

`app.toml` で JSON-RPC サーバーを有効化および設定します。

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

レスポンス（メインネット `qorechain-vladi`、チェーン ID 9801）:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

`qorechain-diana` テストネット（チェーン ID 9800）では、このメソッドは `"0x2648"` を返します。

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

- チェーン ID は16進文字列として返されます。ウォレットの設定では10進数に変換してください。`0x2649` は **9801**（メインネット）、`0x2648` は **9800**（テストネット）です。
- ガス価格は EIP-1559 モデルに従います。基本手数料と優先手数料の見積もりには `eth_feeHistory` を使用してください。
- 受け付けられるブロックタグ: `"latest"`、`"earliest"`、`"pending"`、または16進のブロック番号。
- フィルターの制限: `eth_getLogs` はクエリごとに `filter-cap` の結果数に制限されます（デフォルト 10,000）。大規模なデータセットには、より狭いブロック範囲を使用してください。

:::
