---
slug: /getting-started/first-transaction
title: 初めてのトランザクション
sidebar_label: 初めてのトランザクション
sidebar_position: 5
---

# 初めてのトランザクション

このガイドでは、QORトークンの送信、トランザクションの照会、そしてQoreChainのネイティブ、EVM、SVMの各インターフェースとの対話について説明します。

:::note
以下のコマンドは**`qorechain-diana`**テストネット(EVMチェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)は2026年6月7日から稼働しており、2026年10月29日からリリースv3.2.5を実行しています(テストネットは2026年10月27日からv3.2.6を実行しています) — メインネット上で取引する場合は、**メインネットへの接続**ページに記載のメインネットのチェーンIDとエンドポイントに置き換えてください。
:::

## 残高の確認

トークンを送信する前に、アカウント残高を確認します。

```bash
qorechaind query bank balances qor1youraddress... --output json
```

レスポンスには、アカウントが保有するすべてのトークンデノミネーションが含まれます。QOR残高は`uqor`(マイクロQOR)で表示され、**1 QOR = 1,000,000 uqor**です。

## QORの送信 {#send-qor}

QoreChainのアカウントは、Cosmosレーン上で**ハイブリッド署名**を使って送信します。これは、クラシックなsecp256k1署名にML-DSA-87(Dilithium-5)署名を加えたものです。通常の`qorechaind tx bank send ... -y`は拒否されるため、送金は未署名の状態で構築し、その後に共署名します。アカウントにポスト量子鍵を一度登録しておく必要があります(下記の[ポスト量子鍵を登録する](#register-pqc-key)を参照)。また、[download.qore.host](https://download.qore.host)の公式`qorechaind`リリースバイナリを使用する必要があります(公開ソースツリーからビルドしたバイナリでは、Dilithium署名の作成も適用もできません)。

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

これにより、**1 QOR**(1,000,000 uqor)が受取アドレスに送金され、40,000 uqor(0.04 QOR)の手数料が支払われます。ネットワークの下限は**ガス1単位あたり0.1 uqor**であるため、手数料はガス上限に0.1を掛けた額以上でなければなりません。つまり`--gas 400000`には`--fees 40000uqor`以上が必要です。署名によってトランザクションに約4.7 KBが加わるため、ハイブリッド署名の送金は通常160,000〜240,000ガスを使用します。`cosign`は、ネットワークがどの署名対象バイト形式を検証するかをノードに問い合わせるため、同じコマンドが両方のネットワークで動作します。

### ポスト量子鍵を登録する {#register-pqc-key}

ポスト量子鍵は、アカウントごとに一度、**明示的に登録**します。チェーンが最初のトランザクション時に自動で登録することはありません。登録トランザクション自体(および鍵のマイグレーション)は、新規アカウントでもブートストラップできるよう、クラシック鍵のみで署名できます。

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

v3.2.3以降、チェーンは登録時にオプションの**所有証明**も受け付け、脆弱な鍵、縮退した鍵、すでに使用済みの鍵を拒否します。所有証明を添付するには、`register-key-v2`で登録し、ローカルの鍵を指定します。

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

PQC鍵ファイルは、リカバリーフレーズと同じくらい慎重にバックアップしてください。リカバリーフレーズから`qorechaind tx pqc recover-key`で再導出できます。[QoreX](/qorex/overview)とQoreChain SDKは、鍵の登録を代行します。ハイブリッドフローの全体については、[ウォレットのセットアップ](/getting-started/wallet-setup)を参照してください。

:::caution Cosmos送金にはハイブリッドPQC署名が必要です
Cosmosレーンでは、ネットワークの設定は`hybrid_signature_mode = required`です(稼働中のネットワークはv3.2ラインを実行しています)。クラシック署名のみのトランザクションは**拒否されます**。CLIを使わずにハイブリッド署名を生成する場合は、オープンソースの[**qorechain-pqc**](/developer-guide/post-quantum-signing)ライブラリ(`hybridSignBytes`)およびQoreChain SDKが同等の処理をコードで行います。
:::

共署名されたトランザクションが受理されると、CLIはトランザクションハッシュを返します。

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

:::caution EVMトランザクションには承認ウィンドウが必要です
標準的なEthereum署名(MetaMask、ethers.jsなど)は変更なしで引き続き動作しますが、v3.2.0以降、EVMレーンは、**登録済みのポスト量子鍵**と**開いているEVM承認ウィンドウ**の両方を持つアカウントからのトランザクションのみを受け付けます。最初にウィンドウを開いてください(これはCosmosレーンのトランザクションで、ML-DSA鍵で署名します)— 下記の[EVM承認ウィンドウ](#evm-window)を参照してください。ウィンドウがない場合、ノードは`no open EVM authorisation window`と応答します。状態の読み取り(`eth_blockNumber`、`eth_getBalance`、`eth_call`、`eth_estimateGas`)にはウィンドウは不要です。
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

### EVM承認ウィンドウ {#evm-window}

チェーンリリース**v3.2.0**(メインネットのブロック高2,981,742、2026年9月25日。テストネットのブロック高5,920,000)以降、EVMレーンは、次の両方を満たすアカウントからのトランザクションのみを受け付けます。

1. **登録済みのポスト量子鍵**(ML-DSA-87)を持っていること、かつ
2. そのトランザクションを受け入れる余地のある**開いているEVM承認ウィンドウ**を持っていること。

EVMレーンのそれ以外の点は変わりません。引き続きMetaMask、ethers.js、Hardhat、Foundryで署名でき、`eth_estimateGas`などのシミュレーションはウィンドウなしで動作します。コントラクトのデプロイも他のEVMトランザクションと同様に扱われるため、デプロイの前にウィンドウが必要です。

**なぜウィンドウが必要なのか?** 標準的なウォレットはEthereumトランザクションに対して1つのsecp256k1署名しか生成せず、アプリケーションが2つ目のポスト量子署名を添付する手段もありません。そのため、ポスト量子による承認はトランザクションの*前に*届けられます。ML-DSA署名を伴う通常のCosmosレーンのトランザクションで制限付きのウィンドウを開くと、EVMレーンはそのウィンドウでカバーされるトランザクションを受け付けます。クラシック鍵だけではウィンドウを開くことはできないため、盗まれたクラシック鍵が使える金額は、すでに開いているウィンドウが許可する範囲に限られます。これはERC-20のapproveに似ています。上限付きの金額を、期限付きで承認し、その後は通常どおり取引します。

**ウィンドウが制限するもの。** 3つの制限が同時に適用され、最初に尽きたものがウィンドウを閉じます。

| 制限 | 意味 | 許容範囲 |
| --- | --- | --- |
| `blocks` | ウィンドウを開いたブロックから数えて、ウィンドウが開いている期間 | 1 – 17,280 |
| `max-txs` | 受け付けるEVMトランザクションの数 | 1 – 1,000 |
| `max-value` | 受け付ける総流出額(uqor単位): 送金額**に加えて**、各トランザクションが支払い得る最大手数料(ガス上限 × 手数料上限)を切り上げたもの | 0より大きい値 |

* 17,280ブロックは、メインネットでは約15時間(1ブロックあたり約3.1秒)、テストネットでは約6時間(1ブロックあたり約1.3秒)です。
* 受け付けられた後に失敗したトランザクションも、スロットと金額の枠を消費します。
* 新しいウィンドウを開くと、前のウィンドウは**置き換えられ**、消費量はゼロから再開します。
* CLIは`max-value`を`uqor`または`qor`で受け付けます(`1000qor` = 1,000,000,000 uqor)。
* 金額の制限はネイティブQORのみを対象とします。トークン送金、approve、その他のコントラクト呼び出しの金額はゼロです。これらも制限するには、ウィンドウのスコープを絞り込んでください(下記)。

**ステップ1 — ポスト量子鍵を登録する**(一度だけ): 上記の[ポスト量子鍵を登録する](#register-pqc-key)を参照してください。

**ステップ2 — ウィンドウを開く。** ウィンドウを開くのはCosmosレーンのトランザクションなので、未署名で生成してから共署名します。

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**スコープの絞り込み(v3.2.3以降)。** 2つのオプションフラグにより、開いているウィンドウが受け付けるものを制限できます。`--native-only`はネイティブQORの単純送金のみを受け付けます(calldataなし、コントラクト作成なし、コードを持つ受取先なし)。`--allowed-targets 0xAAA...,0xBBB...`は、それらの受取先へのトランザクションのみを受け付けます(最大16件。この場合、コントラクト作成は拒否されます)。例:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

メインネットでは、ウィンドウを開くのに約180,000ガスを使用しました。[QoreX](/qorex/security-and-recovery#evm-window)では、同じ手順は**設定 → セキュリティ → EVMアクセスウィンドウ**(アプリ)、または**EVMアクセスウィンドウ**ボタン(拡張機能)です。ウィンドウを開くとアカウントのnonceが進むため、ウォレットでEVMトランザクションを準備する**前に**ウィンドウを開いてください。

**ステップ3 — 残りを確認する:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

ウィンドウのないアドレスに対しても、RESTの応答は失敗せず、`found: false`を返します。フィールドは`found`、`live`、`opened_height`、`expiry_height`、`max_txs`、`used_txs`、`max_value`、`used_value`、`remaining_blocks`、`remaining_txs`、`remaining_value`です(uqorの整数で、文字列として返されます)。メインネットでは`https://api.qore.host`を使用してください。

**ステップ4 — 通常どおりEVMレーンを使う。** MetaMaskやお使いのツールからいつもどおり送信します。各トランザクションは、ウィンドウからトランザクションスロットを1つと、(金額 + 最大手数料)を消費します。

**ウィンドウを早めに閉じる。** クラシック鍵が漏えいした疑いがある場合は、ウィンドウを閉じてください。ウィンドウがまだ受け付けていたものは、次のブロックから拒否されます。ウィンドウを閉じると、保留中のEIP-7702委任の同意も取り消されます(v3.2.2以降。アカウントのコードを変更するtype-4トランザクションは、ポスト量子の`authorize-evm-delegation`による同意があった後にのみ受け付けられます)。

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**エラー**

| 表示される内容 | 意味 | 対処 |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...`(モジュール`pqc`、code 26) | このアカウントにウィンドウがない | ステップ2 |
| `... has no registered post-quantum key; the EVM lane requires one`(EVMレーンではcode 26、ウィンドウを開こうとした場合はcode 28) | ML-DSA鍵が登録されていない | ステップ1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)`(code 27) | 期限切れまたは使い切り。メッセージにどの制限かが表示される | 新しいウィンドウを開く |
| `invalid EVM authorisation window`(code 28) | 制限値が範囲外(`blocks` 1–17,280、`max-txs` 1–1,000、`max-value` > 0) | 引数を修正する |

コードからは、QoreChain SDKと`@qorechain/wallet-adapter`がウィンドウの開閉メッセージを組み立て、ウィンドウの状態を読み取ることができます。[SDKドキュメント](/sdk/overview)を参照してください。

ウィンドウが適用されるのはEVMレーンのみです。Cosmosレーンのトランザクションは、すべてのトランザクションですでにハイブリッド署名を伴っており、ウィンドウを一度も開かなければEVMトランザクションは拒否されますが、それ以外は何も変わりません。

## SVM RPCの使用

QoreChainのSVM実行環境は、ポート`8899`でSolana互換のRPCインターフェースを公開しています。SVMトランザクションレーンは現在ネットワーク全体で無効化されているため、現時点で利用できるのはこれらの読み取りメソッドです。

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
| `--fees`           | uqor単位のトランザクション手数料(ガス上限 × 0.1以上)       | `--fees 40000uqor`               |
| `--from`           | 署名鍵の名前またはアドレス   | `--from mykey`                 |
| `--output`         | レスポンス形式               | `--output json`                |
| `--node`           | 接続先のRPCエンドポイント    | `--node tcp://localhost:26657` |
| `--gas`            | トランザクションのガス上限 | `--gas 400000`(または`--gas auto`) |
| `--gas-adjustment` | 見積もりガスの乗数  | `--gas-adjustment 1.5`         |
| `--gas-prices`     | `--fees`の代わりにガス価格を指定      | `--gas-prices 0.1uqor`         |
| `--generate-only`  | 未署名のトランザクションを出力します(`tx pqc cosign`の前に必要) | `--generate-only` |
| `-y`               | 確認プロンプトをスキップ      | `-y`                           |

### 例:一般的なフラグをすべて使用した完全なコマンド

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## 次のステップ

初めてのトランザクション送信が完了しました。QoreChainが提供する他の機能もご覧ください。

* **ステーキングとデリゲーション** — QORをステークしてネットワークの安全性維持に貢献し、ステーキング報酬を受け取る
* **アセットのブリッジ** — チェーン間でアセットを移動する
* **EVM開発** — QoreChain上にSolidityスマートコントラクトをデプロイする
