---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana 互換
sidebar_label: JSON-RPC — Solana 互換
sidebar_position: 4
---

# JSON-RPC — Solana 互換

QoreChain は、SVM（Solana Virtual Machine）ランタイムを通じて Solana 互換の JSON-RPC インターフェースを提供し、既存の Solana ツールおよび SDK が QoreChain とネイティブにやり取りできるようにします。

## 接続

| トランスポート | デフォルトアドレス        |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

JSON-RPC サーバーは **`qorechaind start` によって起動され**、**デフォルトで有効化されており**、`127.0.0.1:8899` でリッスンします。これは `app.toml` の `[svm-rpc]` セクション（`enable` + `address`）で設定されます。起動したばかりのノードはすでにこのインターフェースを提供しており、追加のプロセスは不要です。

:::note
Solana 互換の JSON-RPC インターフェースは、**`qorechain-vladi`** メインネット（チェーンバージョン **v3.1.77** で稼働中）と **`qorechain-diana`** テストネットの両方によって、ポート **8899** で提供されます。上記のローカルアドレスは自分で運用するノードに適用されます。リモートアクセスの場合は、プロバイダーのメインネットまたはテストネットのエンドポイントに置き換えてください。
:::

---

## メソッド

| メソッド                              | パラメータ               | 説明                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 string) | アカウントデータ、所有者、lamports、実行可能フラグを返します     |
| `getBalance`                        | `pubkey` (base58 string) | 指定された公開鍵の残高を lamports 単位で返します       |
| `getSlot`                           | なし                     | 現在のスロット番号を返します                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (integer)   | 指定されたデータサイズに対するレント免除の最小残高を返します |
| `getVersion`                        | なし                     | ノードソフトウェアのバージョンを返します                              |
| `getHealth`                         | なし                     | ノードのヘルスステータスを返します（正常な場合は `"ok"`）                 |

---

## レスポンス形式

すべてのレスポンスは JSON-RPC 2.0 仕様に従います。オンチェーン状態を参照するレスポンスには、現在の `slot` を含む `context` オブジェクトが含まれます。

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

## 例

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

バージョン文字列 `1.18.0-qorechain` は、QoreChain SVM ランタイム上で動作する Solana 1.18.0 RPC インターフェースとの互換性を示します。

---

## @solana/web3.js との統合

既存の Solana アプリケーションは、`Connection` オブジェクトをローカルの SVM エンドポイントに向けることで QoreChain に接続できます。

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

## 注記

- **アドレス形式**: SVM アカウントは、ネイティブの Cosmos SDK モジュールで使用される `qor1` Bech32 プレフィックスではなく、base58 エンコードの公開鍵（標準的な Solana 形式）を使用します。
- **クロス VM ブリッジング**: EVM と SVM ランタイム間で資産を移動するには、Cross-VM モジュール（`x/crossvm`）を使用します。`crossvm call` の構文については [トランザクションコマンド](/cli-reference/transaction-commands) を参照してください。
- **プログラムのデプロイ**: BPF プログラムは CLI（`qorechaind tx svm deploy-program`）経由、または SVM ランタイムを通じてプログラムでデプロイします。
- **計算予算**: SVM ランタイムは、デフォルトでトランザクションあたり 1,400,000 計算ユニットの計算予算を強制します。これはモジュールパラメータで設定可能です。
