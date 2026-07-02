---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana 互換
sidebar_label: JSON-RPC — Solana 互換
sidebar_position: 4
---

# JSON-RPC — Solana 互換

QoreChain は、SVM（Solana Virtual Machine）ランタイムを通じて Solana 互換の JSON-RPC インターフェースを提供しており、既存の Solana ツールや SDK が QoreChain とネイティブに連携できます。

## 接続

| トランスポート | アドレス |
| --------- | ------------------------- |
| HTTP（自前ノード） | `http://127.0.0.1:8899`   |
| HTTPS（パブリック、メインネット、読み取り専用） | `https://svm.qore.host` |
| HTTPS（パブリック、テストネット、読み取り専用） | `https://svm-testnet.qore.host` |

JSON-RPC サーバーは **`qorechaind start` によって起動され**、**デフォルトで有効**になっており、`127.0.0.1:8899` でリッスンします。設定は `app.toml` の `[svm-rpc]` セクション（`enable` + `address`）で行います。起動したばかりのノードはすでにこのインターフェースを提供しており、追加のプロセスは不要です。パブリックエンドポイントは**読み取り専用**です（トランザクションの送信はエッジで無効化されています）。

:::note
チェーンバージョン **v3.1.82** 以降、SVM インターフェースはアカウントの**ネイティブ QOR 残高**（Cosmos および EVM インターフェースで見えるものと同一の統合資金）を **lamports** 建て（小数点以下 9 桁、**1 uqor = 1,000 lamports**）で提供します。詳細は [SVM インターフェース上のネイティブ QOR](/developer-guide/svm-development#native-qor) を参照してください。
:::

---

## メソッド

| メソッド                              | パラメータ               | 説明                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey`（base58 文字列） | アカウントのデータ、所有者、lamports、実行可能フラグを返します     |
| `getBalance`                        | `pubkey`（base58 文字列） | 指定した公開鍵のネイティブ QOR 残高を lamports 単位で返します |
| `getSignaturesForAddress`           | `address`（base58 文字列） | 指定アドレスが関与するトランザクション署名を返します（入金検知用） |
| `getSlot`                           | なし                     | 現在のスロット番号を返します                                |
| `getMinimumBalanceForRentExemption` | `dataLength`（整数）   | 指定したデータサイズに対するレント免除の最小残高を返します |
| `getVersion`                        | なし                     | ノードのソフトウェアバージョンを返します                              |
| `getHealth`                         | なし                     | ノードのヘルス状態を返します（正常な場合は `"ok"`）                 |

---

## レスポンス形式

すべてのレスポンスは JSON-RPC 2.0 仕様に従います。オンチェーン状態を参照するレスポンスには、現在の `slot` を含む `context` オブジェクトが含まれます:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## 使用例

### getAccountInfo

**リクエスト:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**リクエスト:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**リクエスト:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

バージョン文字列 `1.18.0-qorechain` は、QoreChain の SVM ランタイム上で動作する Solana 1.18.0 RPC インターフェースとの互換性を示します。

---

## @solana/web3.js との連携

既存の Solana アプリケーションは、`Connection` オブジェクトをローカルの SVM エンドポイントに向けるだけで QoreChain に接続できます:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## 注意事項

- **アドレス形式**: SVM アカウントは base58 エンコードされた公開鍵（標準的な Solana 形式）を使用し、ネイティブの Cosmos SDK モジュールで使われる `qor1` Bech32 プレフィックスは使用しません。
- **クロス VM ブリッジ**: EVM ランタイムと SVM ランタイムの間で資産を移動するには、Cross-VM モジュール（`x/crossvm`）を使用します。`crossvm call` の構文については[トランザクションコマンド](/cli-reference/transaction-commands)を参照してください。
- **プログラムのデプロイ**: BPF プログラムは CLI（`qorechaind tx svm deploy-program`）またはプログラムから SVM ランタイムを通じてデプロイできます。
- **コンピュートバジェット**: SVM ランタイムはデフォルトでトランザクションあたり 1,400,000 コンピュートユニットのコンピュートバジェットを適用します。この値はモジュールパラメータで設定可能です。
