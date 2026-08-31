---
slug: /getting-started/first-transaction
title: はじめてのトランザクション
sidebar_label: はじめてのトランザクション
sidebar_position: 5
---

# はじめてのトランザクション

このガイドでは、QOR トークンの送金、トランザクションの照会、そして QoreChain のネイティブ、EVM、SVM の各インターフェースを通じた操作について説明します。

:::note
以下のコマンドは **`qorechain-diana`** テストネット(EVM チェーン ID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVM チェーン ID **9801**)は2026年6月7日から稼働しています — メインネットで取引する場合は、**Connecting to Mainnet** ページに記載のメインネットのチェーン ID とエンドポイントに置き換えてください。
:::

## 残高を確認する

トークンを送信する前に、アカウントの残高を確認してください:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

レスポンスには、そのアカウントが保有するすべてのトークン単位(デノミネーション)が含まれます。QOR の残高は `uqor`(マイクロ QOR)単位で表示され、**1 QOR = 1,000,000 uqor** です。

## QOR を送信する

自分の鍵から別のアドレスへトークンを送金します:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

これは受信者アドレスへ **1 QOR**(1,000,000 uqor)を送金し、手数料として 500 uqor を支払います。

:::caution Cosmos の送金にはハイブリッド PQC 署名が必要です
cosmos パスでは、ネットワークのデフォルトは `hybrid_signature_mode = required` です(現在のチェーンバージョン **v3.1.95**)。通常の従来型 `tx bank send` は**拒否されます** — cosmos パスのすべてのトランザクションは、secp256k1 署名に加えて ML-DSA-87(Dilithium-5)署名を持たなければなりません。`qorechaind tx pqc gen-key` で Dilithium-5 鍵を生成し、`qorechaind tx pqc cosign` でハイブリッド共同署名を付加してください(あるいは QoreChain SDK の `buildHybridTx` を使い、`includePqcPublicKey` を指定してトランザクションを構築すれば、初回利用時に鍵が自動登録されます)。CLI を使わずにハイブリッド署名を生成するには、オープンソースの [**qorechain-pqc**](/developer-guide/post-quantum-signing) ライブラリ(`hybridSignBytes`)や QoreChain SDK がコード上で同等の処理を提供します。ハイブリッドフローの全体については [ウォレットのセットアップ](/getting-started/wallet-setup) を参照してください。
:::

トランザクションがブロードキャストされる前に、確認を求められます。確認すると、CLI はトランザクションハッシュを返します。

## トランザクションを照会する

ハッシュを使って完了したトランザクションを検索します:

```bash
qorechaind query tx <txhash>
```

出力には、トランザクションのステータス、使用ガス量、ブロック高、および実行中に発行されたすべてのイベントが含まれます。

JSON 形式で出力する場合:

```bash
qorechaind query tx <txhash> --output json
```

## JSON-RPC を使用する(EVM)

QoreChain の EVM 実行環境は、ポート `8545` で標準的な Ethereum JSON-RPC インターフェースを公開しています。

:::note
EVM のトランザクションは、cosmos パスのハイブリッド PQC 要件の**影響を受けません**。EVM は独立した `eth_secp256k1` ante パスを使用するため、標準的な Ethereum の署名(MetaMask、ethers.js など)は PQC 拡張なしでそのまま機能します。
:::

### 最新のブロック番号を取得する

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### アカウント残高を取得する

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

残高は、最小単位の 16 進数エンコード値として返されます。

## SVM RPC を使用する

QoreChain の SVM 実行環境は、ポート `8899` で Solana 互換の RPC インターフェースを公開しています。

### 現在のスロットを取得する

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### アカウント残高を取得する

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## よく使う CLI パターン

`qorechaind` CLI を使用する際、以下のフラグがよく使われます:

| Flag               | Description                    | Example                        |
| ------------------ | ------------------------------ | ------------------------------ |
| `--chain-id`       | 対象チェーンを指定します           | `--chain-id qorechain-diana`   |
| `--fees`           | uqor 単位のトランザクション手数料   | `--fees 500uqor`               |
| `--from`           | 署名に使う鍵の名前またはアドレス    | `--from mykey`                 |
| `--output`         | レスポンスの形式                  | `--output json`                |
| `--node`           | 接続する RPC エンドポイント        | `--node tcp://localhost:26657` |
| `--gas`            | トランザクションのガス上限         | `--gas auto`                   |
| `--gas-adjustment` | 推定ガス量の倍率                  | `--gas-adjustment 1.3`         |
| `-y`               | 確認プロンプトをスキップします      | `-y`                           |

### 例:よく使うフラグをすべて含むコマンド

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## 次のステップ

はじめてのトランザクションを送信できたので、QoreChain が提供するその他の機能も見てみましょう:

* **ステーキングとデリゲーション** — QOR をステークして報酬を獲得する
* **アセットのブリッジ** — チェーン間でアセットを移動する
* **EVM 開発** — QoreChain 上に Solidity スマートコントラクトをデプロイする
