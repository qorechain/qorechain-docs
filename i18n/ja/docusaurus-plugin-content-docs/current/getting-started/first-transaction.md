---
slug: /getting-started/first-transaction
title: 初めてのトランザクション
sidebar_label: 初めてのトランザクション
sidebar_position: 5
---

# 初めてのトランザクション

このガイドでは、QORトークンの送信、トランザクションの照会、そしてQoreChainのネイティブ、EVM、SVMの各インターフェースとの対話について説明します。

:::note
以下のコマンドは**`qorechain-diana`**テストネット(EVMチェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)は2026年6月7日から稼働しています — メインネット上で取引する場合は、**メインネットへの接続**ページに記載のメインネットのチェーンIDとエンドポイントに置き換えてください。
:::

## 残高の確認

トークンを送信する前に、アカウント残高を確認します。

```bash
qorechaind query bank balances qor1youraddress... --output json
```

レスポンスには、アカウントが保有するすべてのトークンデノミネーションが含まれます。QOR残高は`uqor`(マイクロQOR)で表示され、**1 QOR = 1,000,000 uqor**です。

## QORの送信

自分の鍵から別のアドレスへトークンを送金します。

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

これにより、**1 QOR**(1,000,000 uqor)が受取アドレスに送金され、500 uqorの手数料が支払われます。

:::caution Cosmos送金にはハイブリッドPQC署名が必要です
Cosmosパス上では、ネットワークのデフォルトは`hybrid_signature_mode = required`です(現在のチェーンバージョン**v3.1.97**)。通常のクラシックな`tx bank send`は**拒否されます** — すべてのCosmosパスのトランザクションは、secp256k1署名に加えてML-DSA-87(Dilithium-5)署名を含める必要があります。`qorechaind tx pqc gen-key`でDilithium-5鍵を生成し、`qorechaind tx pqc cosign`でハイブリッド共署名を添付してください(または、QoreChain SDKの`buildHybridTx`で`includePqcPublicKey`を指定してトランザクションを構築すれば、初回使用時に鍵が自動登録されます)。CLIを使わずにコード上でハイブリッド署名を生成する場合は、オープンソースの[**qorechain-pqc**](/developer-guide/post-quantum-signing)ライブラリ(`hybridSignBytes`)およびQoreChain SDKが同等の処理をコードで行います。ハイブリッドフロー全体については、[ウォレットのセットアップ](/getting-started/wallet-setup)を参照してください。
:::

トランザクションがブロードキャストされる前に、確認を求められます。確認すると、CLIはトランザクションハッシュを返します。

## トランザクションの照会

完了したトランザクションをそのハッシュで照会します。

```bash
qorechaind query tx <txhash>
```

出力には、トランザクションのステータス、使用ガス量、ブロック高、実行中に発生したすべてのイベントが含まれます。

JSON形式で出力する場合は次のようにします。

```bash
qorechaind query tx <txhash> --output json
```

## JSON-RPCの使用(EVM)

QoreChainのEVM実行環境は、ポート`8545`で標準的なEthereum JSON-RPCインターフェースを公開しています。

:::note
EVMトランザクションは、CosmosパスのハイブリッドPQC要件の**影響を受けません**。これらは別個の`eth_secp256k1` ante処理経路を使用しているため、標準的なEthereum署名(MetaMask、ethers.jsなど)はPQC拡張なしで機能します。
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

残高は、最小デノミネーションでの16進エンコード値として返されます。

## SVM RPCの使用

QoreChainのSVM実行環境は、ポート`8899`でSolana互換のRPCインターフェースを公開しています。

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

## よく使うCLIパターン

`qorechaind` CLIを使用する際、以下のフラグが頻繁に使われます。

| フラグ               | 説明                   | 例                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | 対象チェーンを指定します    | `--chain-id qorechain-diana`   |
| `--fees`           | uqor単位のトランザクション手数料       | `--fees 500uqor`               |
| `--from`           | 署名鍵の名前またはアドレス   | `--from mykey`                 |
| `--output`         | レスポンス形式               | `--output json`                |
| `--node`           | 接続先のRPCエンドポイント    | `--node tcp://localhost:26657` |
| `--gas`            | トランザクションのガス上限 | `--gas auto`                   |
| `--gas-adjustment` | 見積もりガスの乗数  | `--gas-adjustment 1.3`         |
| `-y`               | 確認プロンプトをスキップ      | `-y`                           |

### 例:一般的なフラグをすべて使用した完全なコマンド

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## 次のステップ

初めてのトランザクション送信が完了しました。QoreChainが提供する他の機能もご覧ください。

* **ステーキングとデリゲーション** — QORをステークして報酬を得る
* **アセットのブリッジ** — チェーン間でアセットを移動する
* **EVM開発** — QoreChain上にSolidityスマートコントラクトをデプロイする
