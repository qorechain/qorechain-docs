---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ 名前空間
sidebar_label: JSON-RPC — eth_ 名前空間
sidebar_position: 3
---

# JSON-RPC — eth_ 名前空間

QoreChainはEVM互換のJSON-RPCインターフェースを実装しており、標準的なEthereumツール(MetaMask、Hardhat、Foundry、ethers.js、web3.js)が変更なしにチェーンの状態を読み取り、ガスを見積もることができます。**EVMレーンからトランザクションを送信するには、チェーンバージョン v3.2.0 以降、追加の手順が必要です**。送信元アカウントには、登録済みのポスト量子鍵と、開いているEVM認可ウィンドウが必要です([トランザクションの送信](#sending-transactions)を参照)。

## 接続

| トランスポート | デフォルトアドレス       |
| --------------- | ------------------------ |
| HTTP             | `http://localhost:8545` |
| WebSocket        | `ws://localhost:8546`   |

:::note
EVM JSON-RPCインターフェースは、**`qorechain-vladi`** メインネット(EVMチェーンID **9801**、16進数 `0x2649`、ノードリリース **v3.2.3**、2026年6月7日から稼働。高さ 3,742,566 から v3.2.4)と **`qorechain-diana`** テストネット(EVMチェーンID **9800**、16進数 `0x2648`、ノードリリース **v3.2.4**、2026年10月19日から)によって提供されます。上記のローカルアドレスは自分で実行するノードに適用されます。公開HTTPエンドポイントは `https://evm.qore.host`(メインネット)と `https://evm-testnet.qore.host`(テストネット)で、[ネットワーク](/appendix/networks#public-endpoints)に記載されています。公開されているEVM WebSocketはテストネットのもの(`wss://evm-ws-testnet.qore.host`)のみで、メインネットの公開EVM WebSocketはありません。
:::

## サポートされている名前空間

| 名前空間  | 説明                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| `eth_`    | Ethereumのコアとなる JSON-RPC メソッド                                                     |
| `web3_`   | ユーティリティメソッド(クライアントバージョン、ハッシュ化)                               |
| `net_`    | ネットワークステータスメソッド                                                             |
| `txpool_` | トランザクションプールの検査                                                               |
| `rpc_`    | サーバーのイントロスペクション(`rpc_modules`)                                            |

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
| `eth_getBlockByHash`         | `blockHash`、`fullTx`(真偽値)                    | ハッシュによりブロックデータを返す                         |
| `eth_getCode`                | `address`、`blockNumber`                          | コントラクトのバイトコードを返す                           |
| `eth_getStorageAt`           | `address`、`slot`、`blockNumber`                  | ストレージスロットを返す                                   |
| `eth_getBlockReceipts`       | `blockNumber`                                      | ブロックのすべてのレシートを返す                           |
| `eth_getProof`               | `address`、`storageKeys`、`blockNumber`           | アカウントの証明を返す                                     |
| `eth_createAccessList`       | `callObject`、`blockNumber`                       | 呼び出し用のアクセスリストを構築する                       |
| `eth_maxPriorityFeePerGas`   | なし                                                | 推奨される優先手数料(wei)を返す                          |
| `eth_syncing`                | なし                                                | ノードが同期済みの場合は `false` を返す                    |
| `eth_newFilter`、`eth_newBlockFilter`、`eth_getFilterChanges` | フィルタオブジェクト / フィルタID | ポーリング型フィルタ                              |

## web3_ メソッド

| メソッド              | パラメータ    | 説明                                        |
| ---------------------- | -------------- | ------------------------------------------- |
| `web3_clientVersion`  | なし           | クライアントのバージョン文字列を返す        |
| `web3_sha3`           | `data`(16進数) | 入力のKeccak-256ハッシュを返す              |

## txpool_ メソッド

| メソッド          | パラメータ | 説明                                                                 |
| ------------------ | ---------- | -------------------------------------------------------------------- |
| `txpool_status`    | なし       | 保留中およびキュー内のトランザクション数を返す                       |
| `txpool_content`   | なし       | 保留中およびキュー内のトランザクションを返す(公開エンドポイントでは利用不可) |
| `txpool_inspect`   | なし       | プールの概要を返す(公開エンドポイントでは利用不可)                 |

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

# Enabled API namespaces (a node initialised by v3.2.3 or later defaults to "eth,net,web3";
# txpool is opt-in because it publishes the node's pending transactions)
api = "eth,web3,net,txpool"

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

## 公開エンドポイントの制限 {#public-limits}

:::note
- `eth_getLogs` は `fromBlock` と `toBlock` の間で最大 **10,000 ブロック**まで受け付けます。これより広い範囲を指定すると `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}` が返されます。10,000 ブロック以下のウィンドウに分けてクエリしてください。別の設定 `filter-cap` は返されるログの件数を制限します。
- `txpool_status` は公開エンドポイントで動作します。`txpool_content` と `txpool_inspect` は公開メインネットと公開テストネットの両方のエンドポイントで無効です(自分で実行するノードでは、`api` リストに `txpool` を含めていれば動作します)。
- `debug_*` メソッドと `eth_signTransaction` は利用できません。
- `eth_subscribe` にはWebSocket接続が必要です。HTTP経由では `-32601 notifications not supported` が返されます。[WebSocketイベント](/api-reference/websocket-events)を参照してください。
- 公開エンドポイントでは古い高さの状態はプルーニングされているため、遠い過去のブロックに対する `eth_call` は状態バージョンエラーで失敗することがあります。
- スクリプトが `403 Forbidden` を受け取る場合は、明示的な `User-Agent` ヘッダーを設定してください。Pythonのデフォルトの `urllib` エージェントはブロックされますが、`requests`、`curl`、Node、Goのクライアントはそのまま動作します。
:::

## トランザクションの送信 {#sending-transactions}

:::caution EVMレーンにはPQC鍵と開いているウィンドウが必要です
チェーンバージョン v3.2.0 以降、EVMレーンがトランザクション(コントラクトのデプロイを含む `MsgEthereumTx`)を受け付けるのは、**登録済みのポスト量子鍵**と**開いているEVM認可ウィンドウ**を持つアカウントからのものだけです。このセットアップを行っていない通常のEVMウォレットはトランザクションを送信できません。ノードはそれらを取り込まず、`pqc` モジュールのエラー(コード 26、27、または 28)で拒否します。残高の読み取り、`eth_call`、ガスの見積もりにウィンドウは不要です。v3.2.2 以降は、**チェーンIDなし**で署名されたトランザクション(EIP-155 以前の形式)も拒否されます。また v3.2.3 以降は、ウィンドウを通常のQOR送金のみ(`native_only`)、または指定した宛先のみ(`allowed_targets`)に限定でき、範囲外のトランザクションはコード 27 で拒否されます。

送信前にアカウントを確認してください:

- `GET /qorechain/pqc/v1/account/{address}`(`found: true` は鍵が登録されていることを意味します)
- `GET /qorechain/pqc/v1/evm_window/{address}`(`live: true` は現在ウィンドウがトランザクションを受け付けていることを意味します)

どちらも[REST / gRPC エンドポイント](/api-reference/rest-grpc-endpoints#pqc-module)で説明されています(ウィンドウのレスポンスには `native_only` と `allowed_targets` も含まれます)。ウィンドウはEthereumトランザクションではなく、QoreChainトランザクション(`MsgOpenEVMWindow`。最大 17,280 ブロックと 1,000 トランザクション、および価値の上限に制限されます)で開きます。レーンの概要は[EVM開発](/developer-guide/evm-development)を参照してください。
:::

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
  "result": "0x37f559"
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
- フィルタの制限: `eth_getLogs` は1クエリあたり `filter-cap` 件(デフォルト10,000件)に制限され、公開エンドポイントは10,000ブロックより広い範囲を拒否します。大量のデータセットにはより狭いブロック範囲を使用してください。

:::
