---
slug: /developer-guide/evm-development
title: EVM開発
sidebar_label: EVM開発
sidebar_position: 2
---

# EVM開発

QoreChainは、QoreChain EVM Engine上で完全にEVM互換の実行環境を稼働しており、使い慣れたツールを使ってSolidityスマートコントラクトをデプロイ・操作できます。EVMモジュールは、標準的なEthereum開発ワークフローをサポートするJSON-RPCインターフェースを**ポート8545**（WebSocketは**8546**）で公開しています。

:::note
以下の例は、2026年6月7日から稼働している**`qorechain-vladi`**メインネット（EVMチェーンID**9801**）を対象としています。このネットワークはノードリリース**v3.2.4**（2026年10月23日、ガバナンス提案13により高さ3,742,566で適用。v3.2.3は2026年10月20日、高さ3,662,051で適用済み）を実行しています。**`qorechain-diana`**テストネットは、高さ8,337,253（2026年10月19日）以降v3.2.4を実行しています。そちらではEVMチェーンID**9800**を使用してください。コードサンプルでは、ご自身で運用するノード向けに `http://localhost:8545` を使用しています。公開メインネットのエンドポイントは `https://evm.qore.host`、テストネットのエンドポイントは `https://evm-testnet.qore.host` です。
:::

:::caution EVMトランザクションには、登録済みのPQC鍵と、開いている認可ウィンドウが必要です
v3.2.0アップグレード（メインネットの高さ2,981,742、テストネットの高さ5,920,000）以降、EVMレーンは、**(1) 登録済みのML-DSA-87ポスト量子鍵**と**(2) そのトランザクションを収める余地が残っている、開いているEVM認可ウィンドウ**の両方を持つアカウントからのトランザクションのみを受け付けます。署名は通常のツール（MetaMask、ethers.js、Hardhat、Foundry）で行えますが、登録済みの鍵と開いているウィンドウがない場合、`eth_sendRawTransaction` は拒否されます（コードスペース `pqc`、コード26、27、または28）。読み取り、`eth_call`、ガス見積もりにはどちらも不要です。下記の[EVM認可ウィンドウ](#evm-window)と、[最初のトランザクション](/getting-started/first-transaction#evm-window)のステップバイステップのガイドを参照してください。

v3.2.2以降、メインネットではさらに2つのルールが適用されます。**保護されていない（EIP-155以前の）トランザクションは、ノードのメモリプールでもブロック実行でも拒否されます**。そのため、チェーンIDを付けて署名してください（現在のすべてのウォレットとライブラリはそうしています）。また、**モジュールアカウントはEVM経由で取得できません**。
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

QoreChain固有の読み取りはREST（`api.qore.host`）で提供されます。[下記](#custom-qor_-namespace)で説明する `qor_` JSON-RPC名前空間は、公開エンドポイントでも、デフォルトのノード設定でも**有効になっていません**。新しく初期化したノード（v3.2.3以降）のデフォルトの `api` リストは `eth,net,web3` です。`txpool` はノードの保留中トランザクションを公開してしまうため、オプトインです。

ノードリリースv3.2.4以降（メインネットでは2026年10月23日から、テストネットでは2026年10月19日から）、ノードは自身のJSON-RPCサーバーに上限を設けます。256 KiBを超えるリクエストボディは拒否され（HTTP 413）、同時に処理されるリクエストは256件までで（それを超えるとHTTP 503）、トピック位置が4つを超える、1つの位置に1000を超える候補がある、またはアドレスが1000を超える `eth_getLogs` または `eth_newFilter` のフィルターは拒否されます。これらの上限は `app.toml` の `[json-rpc]` セクションにあるノードローカルの設定です。[ノードの運用](/developer-guide/running-a-node#exposing-endpoints-for-integration)を参照してください。

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
* EVMからQoreChain NativeまたはSVMへの**クロスVMメッセージ**はCosmosレーンのトランザクションであり、他のトランザクションと同様にハイブリッド署名を伴います。現在の利用可否については[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## EVM認可ウィンドウ {#evm-window}

ポスト量子署名はEthereumトランザクション*に添えて*送ることができません（MetaMaskなどのウォレットは2つ目の署名を添付できません）。そのため、トランザクション*より前に*送ります。アカウントはCosmosレーンのメッセージ `MsgOpenEVMWindow` で、上限付きのウィンドウを開きます。以後、EVMレーンは有効なウィンドウでカバーされるトランザクションのみを受け付けます。盗まれた従来型の鍵だけではウィンドウを開けないため、その鍵で動かせるのは、すでに開いているウィンドウが許可する範囲に限られます。

| 上限       | 範囲              | 意味 |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | ウィンドウが開いている期間。開設したブロックから数えたブロック数 |
| `max-txs`   | 1 – 1,000          | ウィンドウが受け付けるEVMトランザクションの件数 |
| `max-value` | 0より大きい値、`uqor`単位 | ウィンドウが受け付ける総流出額：送金額**に加えて**、各トランザクションが支払い得る最大手数料（ガスリミット × ガスあたりの最大手数料）を `uqor` に換算し、切り上げた値 |

いずれかの上限が先に尽きた時点で、ウィンドウは閉じます。3つの上限はすべて必須です。ウィンドウを開くと既存のウィンドウは置き換えられます。受け付けられた後に失敗したトランザクションも、スロットと金額の予算を消費します。コントラクトのデプロイも他のトランザクションと同様に数えられます。`blocks` はブロック数であり、時間ではありません。17,280ブロックは、メインネットでは約15時間（1ブロックあたり約3.2秒）、テストネットでは約5時間（1ブロックあたり約1.0秒）です。

**金額の上限はネイティブのQORのみを数えます。** トークン送金、approve、その他のコントラクト呼び出しは金額がゼロであるため、`max-value` には数えられません（最大手数料のみが数えられます）。これらにも上限を設けるには、ウィンドウの**スコープ**を絞り込みます（メインネットv3.2.3以降）。

| スコープオプション（CLIフラグ） | メッセージフィールド | ウィンドウが受け付けるもの |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | ネイティブQORの通常の送金のみ：calldataなし、コントラクト作成なし、コードを持つ受取先なし、EIP-7702の認可なし |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | 受取先が列挙された20バイトアドレスのいずれかであるトランザクションのみ。コントラクト作成は拒否されます |

スコープなしで開いたウィンドウは、これまでとまったく同じ動作をします。スコープ外のトランザクションは、コード27で拒否されます（メッセージには、ウィンドウが「このトランザクションを受け付けない」と示されます）。`GET /qorechain/pqc/v1/evm_window/{address}` と `qorechaind query pqc evm-window` は `native_only` と `allowed_targets` を報告し、`pqc_evm_window_opened` イベントは、設定されている場合にそれらを含みます。

**手順**（完全なウォークスルーは[最初のトランザクション](/getting-started/first-transaction#evm-window)にあります）:

1. ML-DSA-87鍵を一度だけ登録します（`tx pqc register-key-v2` または `register-key`、`--gas 600000 --fees 60000uqor` を指定）。このトランザクション1件はハイブリッド要件が免除されるため、新しいアカウントでも立ち上げられます。[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)を参照してください。
2. ウィンドウを開きます。これはCosmosレーンのトランザクションなので、未署名で生成し、ML-DSA鍵でコサインします（`max-value` には `uqor` または `qor` を指定できます。`1000qor` は1,000 QORです）。

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. 残りを確認します。`qorechaind query pqc evm-window <address>` または `GET /qorechain/pqc/v1/evm_window/{address}`（ウィンドウがない場合は `found: false` を返します）。
4. EVMトランザクションを通常どおり送信します。ウィンドウを開くことはCosmosレーンのトランザクションであり、アカウントのシーケンス（EVMのnonceでもあります）を進めるため、ウィンドウが開いた**後に**nonceを読み取り、その時点で署名してください。

ウィンドウは `qorechaind tx pqc close-evm-window` で早期に閉じることができます（`--generate-only` と `cosign` のパターンは同じです）。たとえば従来型の鍵が漏えいした疑いがある場合に使います。ウィンドウがまだ受け付けていたものは、次のブロックから拒否されます。

### EIP-7702の委任 {#eip-7702}

アカウントのEIP-7702委任（type-4トランザクション）は、v3.2.2以降、そのアカウント自身のポスト量子同意がある場合にのみ有効になります。まず、ハイブリッド署名したCosmosレーンのメッセージ `MsgAuthorizeEVMDelegation`（`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`）で同意を記録してください。この同意は1回限りで、指定したブロック数が経過すると失効し、`close-evm-window` によって取り消されます。委任されたアカウントから出ていく金額は、**そのアカウント自身の**ウィンドウに課金されます。失敗したtype-4トランザクションは、適用済みの認可を保持します。`qorechaind tx pqc clear-evm-delegation` は委任を削除します。拒否された委任には、コード60〜63で応答します。同意は `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` で読み取れます。

| 拒否（コードスペース `pqc`） | 意味 |
| ------------------------- | ------- |
| code 26 | 送信者に開いているウィンドウがない、または送信者に登録済みのPQC鍵がない |
| code 27 | ウィンドウが期限切れまたは使い切り（メッセージにどの上限かが示されます）、またはトランザクションがウィンドウのスコープ外 |
| code 28 | ウィンドウを開く際の上限値が無効、またはその時点で登録済みの鍵がない |

TypeScript SDK（0.8.2以降）では、`openEvmWindowMsg`、`closeEvmWindowMsg`、`fetchEvmWindow({ rest, address })`、`classifyEvmWindowRejection(err)`（`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`）が利用できます。SDK 0.9.0 では、`openEvmWindowMsg` にスコープオプション（`nativeOnly`、`allowedTargets`）が加わり、EIP-7702の同意ビルダー（`authorizeEvmDelegationMsg`、`clearEvmDelegationMsg`、`fetchEvmDelegationConsent`）が追加されます。0.9.0より前のリリースはスコープなしのウィンドウしか構築できないため、それ以外には `qorechaind` を使用してください（[SDK EVMガイド](/sdk/guides/evm#evm-window-scope)を参照）。

---

## カスタム`qor_`名前空間 {#custom-qor_-namespace}

QoreChainは、チェーン固有のクエリのために`qor_`名前空間でJSON-RPCを拡張しています。

:::warning まだ提供されていません
リリース済みのノードビルドは、まだ `qor_` 名前空間を提供していません。公開エンドポイントの `rpc_modules` には `eth`、`net`、`rpc`、`txpool`、`web3` しか表示されず、以下のすべてのメソッドは、メインネット、テストネット、およびデフォルト設定（`eth`、`net`、`web3`）の自己運用ノードで `-32601`（メソッドが見つかりません）を返します。状況とRESTによる代替手段（たとえばPQC鍵の状態には `GET /qorechain/pqc/v1/account/{address}`）については、[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照してください。
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
