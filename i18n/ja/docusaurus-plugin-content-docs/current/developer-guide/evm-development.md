---
slug: /developer-guide/evm-development
title: EVM開発
sidebar_label: EVM開発
sidebar_position: 2
---

# EVM開発

QoreChainは、QoreChain EVM Engine上で完全にEVM互換の実行環境を稼働しており、使い慣れたツールを使ってSolidityスマートコントラクトをデプロイ・操作できます。EVMモジュールは、標準的なEthereum開発ワークフローをサポートするJSON-RPCインターフェースを**ポート8545**（WebSocketは**8546**）で公開しています。

:::note
以下の例は、2026年6月29日から稼働しているノードリリース**v3.2.1**（コンセンサスルールはv3.2.0アップグレード由来）を実行中の**`qorechain-vladi`**メインネット（EVMチェーンID**9801**）を対象としています。**`qorechain-diana`**テストネット（v3.2.2）の場合は、EVMチェーンID**9800**を使用してください。コードサンプルでは、ご自身で運用するノード向けに `http://localhost:8545` を使用しています。公開メインネットのエンドポイントは `https://evm.qore.host`、テストネットのエンドポイントは `https://evm-testnet.qore.host` です。
:::

:::caution EVMトランザクションには、登録済みのPQC鍵と、開いている認可ウィンドウが必要です
v3.2.0アップグレード（メインネットの高さ2,981,742、テストネットの高さ5,920,000）以降、EVMレーンは、**(1) 登録済みのML-DSA-87ポスト量子鍵**と**(2) そのトランザクションを収める余地が残っている、開いているEVM認可ウィンドウ**の両方を持つアカウントからのトランザクションのみを受け付けます。署名は通常のツール（MetaMask、ethers.js、Hardhat、Foundry）で行えますが、登録済みの鍵と開いているウィンドウがない場合、`eth_sendRawTransaction` は拒否されます（コードスペース `pqc`、コード26、27、または28）。読み取り、`eth_call`、ガス見積もりにはどちらも不要です。下記の[EVM認可ウィンドウ](#evm-window)と、[最初のトランザクション](/getting-started/first-transaction#evm-window)のステップバイステップのガイドを参照してください。
:::

---

## JSON-RPCエンドポイント

| プロパティ             | 値                                      |
| -------------------- | ------------------------------------------ |
| デフォルトURL          | `http://localhost:8545`                    |
| WebSocket URL        | `ws://localhost:8546`                      |
| サポートされる名前空間 | `eth_`, `web3_`, `net_`, `txpool_`          |
| チェーンID（メインネット）   | `9801` (`qorechain-vladi`)                 |
| チェーンID（テストネット）   | `9800` (`qorechain-diana`)                 |
| 通貨シンボル      | `QOR`                                      |

QoreChain固有の読み取りはREST（`api.qore.host`）で提供されます。[下記](#custom-qor_-namespace)で説明する `qor_` JSON-RPC名前空間は、公開エンドポイントでも、デフォルトのノード設定でも**有効になっていません**。

---

## ウォレット設定（MetaMask）

MetaMaskにQoreChainをカスタムネットワークとして追加します。

| フィールド              | メインネット値             | テストネット値           |
| ------------------ | ------------------------- | ----------------------- |
| ネットワーク名       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host` |
| チェーンID           | `9801`                    | `9800`                  |
| 通貨シンボル    | `QOR`                     | `QOR`                   |
| ブロックエクスプローラーURL | `https://explore.qore.network` | *（任意）* |

MetaMaskから送信するには、さらにアカウントに登録済みのPQC鍵と、開いている[EVM認可ウィンドウ](#evm-window)が必要です。

---

## Hardhat

Hardhatをインストールし、`hardhat.config.js`を設定します。

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

コントラクトをデプロイします（デプロイするアカウントには、登録済みのPQC鍵と、開いている[認可ウィンドウ](#evm-window)が必要です。デプロイはウィンドウ内で1件のEVMトランザクションとして数えられます）。

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

QoreChain EVMに対してテストを実行します。

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Foundryでコントラクトを作成・デプロイします。

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

QoreChainは、EVMトランザクションに**EIP-1559動的ベースフィー**モデルを採用しています。

* ベースフィーは、使用率に基づいてブロックごとに調整されます
* ユーザーは`maxFeePerGas`と`maxPriorityFeePerGas`を設定できます
* プライオリティフィーはブロックプロポーザーに支払われます

### 単位ブリッジ

ネイティブのQORトークンは**6桁の小数**（`uqor`）を持つのに対し、EVMは**18桁の小数**を想定しています。`x/precisebank`モジュールがシームレスな変換を処理します。

| コンテキスト      | 単位 | 小数桁数 | 例                |
| ------------ | ------------ | -------- | ---------------------- |
| ネイティブチェーン | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

この変換は透過的に行われます。`eth_getBalance`で残高を確認すると、レスポンスは18桁のweiで返されます。同じアカウントをネイティブのbankモジュール経由で照会すると、残高は6桁の`uqor`で表示されます。

---

## ERC-20トークンペア

`x/erc20`モジュールは、ネイティブのCosmos SDK単位とERC-20コントラクトの間の**トークンペア**を提供します。

* ネイティブトークンは、EVMコントラクト内でERC-20として使用できます
* EVM上にデプロイされたERC-20トークンは、ネイティブ単位に変換できます
* 変換は双方向であり、プロトコルレベルで処理されます

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

これらはCosmosレーンのトランザクションです。稼働中のネットワークでは、ハイブリッドのポスト量子コサインも必要です（`--generate-only` で構築し、その後 `qorechaind tx pqc cosign` を実行します。[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください）。トークンペアは許可制のポリシーの下で登録され、メインネットにはまだ存在しません。

---

## PQCとEVMの互換性

EVMトランザクションは**従来のECDSA（secp256k1）**で署名されるため、MetaMask、Hardhat、Foundry、ethers.js、その他の標準的なツールは、変更なしでトランザクションを構築・署名できます。**v3.2.0**で変わったのは*受け入れ（アドミッション）*です。トランザクションは、送信者が登録済みのポスト量子鍵と有効な認可ウィンドウ（次のセクション）を持っている場合にのみ受け付けられます。鍵の登録とウィンドウの開設はCosmosレーンのトランザクションであり、ハイブリッド（ML-DSA-87 + secp256k1）署名が必要です。

コントラクト内でのポスト量子セキュリティについて:

* **PQC Verifyプリコンパイル**（`0x0000...0A01`）は、有効化された後は、SolidityからオンチェーンでML-DSA-87署名を検証します。メインネットでもテストネットでも**まだ有効ではありません**。[EVMプリコンパイル：ネットワークの状況](/developer-guide/evm-precompiles#network-status)を参照してください。
* EVMからCosmWasmまたはSVMへの**クロスVMメッセージ**はCosmosレーンのトランザクションであり、他のトランザクションと同様にハイブリッド署名を伴います。現在の利用可否については[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## EVM認可ウィンドウ {#evm-window}

ポスト量子署名はEthereumトランザクション*に添えて*送ることができません（MetaMaskなどのウォレットは2つ目の署名を添付できません）。そのため、トランザクション*より前に*送ります。アカウントはCosmosレーンのメッセージ `MsgOpenEVMWindow` で、上限付きのウィンドウを開きます。以後、EVMレーンは有効なウィンドウでカバーされるトランザクションのみを受け付けます。盗まれた従来型の鍵だけではウィンドウを開けないため、その鍵で動かせるのは、すでに開いているウィンドウが許可する範囲に限られます。

| 上限       | 範囲              | 意味 |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | ウィンドウが開いている期間。開設したブロックから数えたブロック数 |
| `max-txs`   | 1 – 1,000          | ウィンドウが受け付けるEVMトランザクションの件数 |
| `max-value` | 0より大きい値、`uqor`単位 | ウィンドウが受け付ける総流出額：送金額**に加えて**、各トランザクションが支払い得る最大手数料（ガスリミット × ガスあたりの最大手数料）を `uqor` に換算し、切り上げた値 |

いずれかの上限が先に尽きた時点で、ウィンドウは閉じます。すべてのフィールドは必須です。ウィンドウを開くと既存のウィンドウは置き換えられます。受け付けられた後に失敗したトランザクションも、スロットと金額の予算を消費します。コントラクトのデプロイも他のトランザクションと同様に数えられます。`blocks` はブロック数であり、時間ではありません。17,280ブロックは、メインネットでは約15時間（1ブロックあたり約3.2秒）、テストネットでは約5時間（1ブロックあたり約1.0秒）です。

**手順**（完全なウォークスルーは[最初のトランザクション](/getting-started/first-transaction#evm-window)にあります）:

1. ML-DSA-87鍵を一度だけ登録します（`tx pqc register-key-v2` または `register-key`、`--gas 600000 --fees 60000uqor` を指定）。このトランザクション1件はハイブリッド要件が免除されるため、新しいアカウントでも立ち上げられます。[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)を参照してください。
2. ウィンドウを開きます。これはCosmosレーンのトランザクションなので、未署名で生成し、ML-DSA鍵でコサインします（`max-value` には `uqor` または `qor` を指定できます。`1000qor` は1,000 QORです）。

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
   ```

3. 残りを確認します。`qorechaind query pqc evm-window <address>` または `GET /qorechain/pqc/v1/evm_window/{address}`（ウィンドウがない場合は `found: false` を返します）。
4. EVMトランザクションを通常どおり送信します。ウィンドウを開くことはCosmosレーンのトランザクションであり、アカウントのシーケンス（EVMのnonceでもあります）を進めるため、ウィンドウが開いた**後に**nonceを読み取り、その時点で署名してください。

ウィンドウは `qorechaind tx pqc close-evm-window` で早期に閉じることができます（`--generate-only` と `cosign` のパターンは同じです）。たとえば従来型の鍵が漏えいした疑いがある場合に使います。ウィンドウがまだ受け付けていたものは、次のブロックから拒否されます。

| 拒否（コードスペース `pqc`） | 意味 |
| ------------------------- | ------- |
| code 26 | 送信者に開いているウィンドウがない、または送信者に登録済みのPQC鍵がない |
| code 27 | ウィンドウが期限切れまたは使い切り（メッセージにどの上限かが示されます） |
| code 28 | ウィンドウを開く際の上限値が無効、またはその時点で登録済みの鍵がない |

TypeScript SDK（0.8.2以降）では、`openEvmWindowMsg`、`closeEvmWindowMsg`、`fetchEvmWindow({ rest, address })`、`classifyEvmWindowRejection(err)`（`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`）が利用できます。

---

## カスタム`qor_`名前空間 {#custom-qor_-namespace}

QoreChainは、チェーン固有のクエリのために`qor_`名前空間でJSON-RPCを拡張しています。

:::warning まだ提供されていません
リリース済みのノードビルドは、まだ `qor_` 名前空間を提供していません。公開エンドポイントの `rpc_modules` には `eth`、`net`、`rpc`、`txpool`、`web3` しか表示されず、以下のすべてのメソッドは、メインネット、テストネット、およびデフォルト設定（`eth`、`net`、`web3`、`txpool`）の自己運用ノードで `-32601`（メソッドが見つかりません）を返します。状況とRESTによる代替手段（たとえばPQC鍵の状態には `GET /qorechain/pqc/v1/account/{address}`）については、[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照してください。
:::

| メソッド                      | 説明                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | アカウントに登録済みのPQC公開鍵があるかを確認します               |
| `qor_getAIStats`            | AIエンジンの統計情報（異常検知数、リスク分布）を取得します |
| `qor_getCrossVMMessage`     | IDによりクロスVMメッセージのステータスを照会します                      |
| `qor_getPoolClassification` | バリデータプールの分類（RPoS/DPoS/PoS）を取得します                 |
| `qor_getReputationScore`    | バリデータのレピュテーションスコアを照会します                        |
| `qor_getAbstractAccount`    | アブストラクトアカウントの設定を取得します                        |

`curl`の例:

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

* [EVM Precompiles](/developer-guide/evm-precompiles) — 予約済みのプリコンパイルインターフェースのリファレンス（公開ネットワークではまだ有効ではありません）
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — クロスVM呼び出しと現在の利用可否
* [Account Abstraction](/developer-guide/account-abstraction) — リンク済みウォレットのオーセンティケーターと支出ルール（モジュールは現在無効）
