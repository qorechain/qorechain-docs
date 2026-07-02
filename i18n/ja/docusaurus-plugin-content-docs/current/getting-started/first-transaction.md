---
slug: /getting-started/first-transaction
title: 最初のトランザクション
sidebar_label: 最初のトランザクション
sidebar_position: 5
---

# 最初のトランザクション

このガイドでは、QOR トークンの送金、トランザクションの照会、そしてネイティブ、EVM、SVM の各インターフェースを通じた QoreChain との対話について説明します。

:::note
以下のコマンドは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を使用します。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日から稼働しています。メインネットでトランザクションを行う場合は、**メインネットへの接続** ページのメインネットチェーン ID とエンドポイントに置き換えてください。
:::

## 残高の確認

トークンを送金する前に、アカウント残高を確認します。

```bash
qorechaind query bank balances qor1youraddress... --output json
```

レスポンスには、アカウントが保有するすべてのトークン額面が含まれます。QOR 残高は `uqor`（マイクロ QOR）で表示され、**1 QOR = 1,000,000 uqor** です。

## QOR の送金

自分のキーから別のアドレスにトークンを送金します。

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

これにより、500 uqor の手数料を支払って、受取人アドレスに **1 QOR**（1,000,000 uqor）が送金されます。

:::caution Cosmos の送金にはハイブリッド PQC 署名が必要です
cosmos パスでは、ネットワークのデフォルトは `hybrid_signature_mode = required` です（現在のチェーンバージョン **v3.1.82**）。プレーンな従来型の `tx bank send` は **拒否されます**。すべての cosmos パストランザクションは、secp256k1 署名とともに ML-DSA-87（Dilithium-5）署名を持つ必要があります。`qorechaind tx pqc gen-key` で Dilithium-5 キーを生成し、`qorechaind tx pqc cosign` でハイブリッド共署名を添付してください（または、QoreChain SDK の `buildHybridTx` でトランザクションをビルドし、`includePqcPublicKey` を使用して初回使用時にキーが自動登録されるようにします）。CLI 外でハイブリッド署名を生成するには、オープンソースの [**qorechain-pqc**](/developer-guide/post-quantum-signing) ライブラリ（`hybridSignBytes`）と QoreChain SDK がコード内で同等の処理を行います。完全なハイブリッドフローについては、[ウォレットのセットアップ](/getting-started/wallet-setup) を参照してください。
:::

ブロードキャストされる前にトランザクションの確認を求められます。確認されると、CLI はトランザクションハッシュを返します。

## トランザクションの照会

完了したトランザクションをそのハッシュで検索します。

```bash
qorechaind query tx <txhash>
```

出力には、トランザクションのステータス、使用されたガス、ブロック高さ、および実行中に発行されたすべてのイベントが含まれます。

JSON 出力の場合は次のようにします。

```bash
qorechaind query tx <txhash> --output json
```

## JSON-RPC（EVM）の使用

QoreChain の EVM 実行環境は、ポート `8545` で標準的な Ethereum JSON-RPC インターフェースを公開しています。

:::note
EVM トランザクションは cosmos パスのハイブリッド PQC 要件の **影響を受けません**。これらは別個の `eth_secp256k1` ante パスを使用するため、標準的な Ethereum 署名（MetaMask、ethers.js など）は PQC 拡張なしで動作します。
:::

### 最新のブロック番号の取得

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

### アカウント残高の取得

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

残高は、最小額面の 16 進エンコード値として返されます。

## SVM RPC の使用

QoreChain の SVM 実行環境は、ポート `8899` で Solana 互換の RPC インターフェースを公開しています。

### 現在のスロットの取得

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### アカウント残高の取得

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

## 一般的な CLI パターン

`qorechaind` CLI を使用する際、これらのフラグが頻繁に使われます。

| フラグ               | 説明                          | 例                              |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | 対象のチェーンを指定            | `--chain-id qorechain-diana`   |
| `--fees`           | uqor 単位のトランザクション手数料 | `--fees 500uqor`               |
| `--from`           | 署名キー名またはアドレス         | `--from mykey`                 |
| `--output`         | レスポンス形式                  | `--output json`                |
| `--node`           | 接続先の RPC エンドポイント       | `--node tcp://localhost:26657` |
| `--gas`            | トランザクションのガス上限       | `--gas auto`                   |
| `--gas-adjustment` | 推定ガスの乗数                  | `--gas-adjustment 1.3`         |
| `-y`               | 確認プロンプトをスキップ         | `-y`                           |

### 例: 一般的なフラグをすべて使用した完全なコマンド

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## 次のステップ

最初のトランザクションを送信したので、QoreChain が提供する他の機能を探ってみましょう。

* **ステーキングと委任** — QOR をステーキングして報酬を獲得する
* **アセットのブリッジング** — チェーン間でアセットを移動する
* **EVM 開発** — QoreChain 上に Solidity スマートコントラクトをデプロイする
