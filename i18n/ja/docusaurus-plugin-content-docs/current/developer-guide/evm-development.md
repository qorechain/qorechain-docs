---
slug: /developer-guide/evm-development
title: EVM開発
sidebar_label: EVM開発
sidebar_position: 2
---

# EVM開発

QoreChainは、QoreChain EVM Engine上で完全にEVM互換の実行環境を稼働しており、使い慣れたツールを使ってSolidityスマートコントラクトをデプロイ・操作できます。EVMモジュールは、標準的なEthereum開発ワークフローをサポートするJSON-RPCインターフェースを**ポート8545**（WebSocketは**8546**）で公開しています。

:::note
以下の例は、2026年6月7日から稼働している**`qorechain-vladi`**メインネット（EVMチェーンID**9801**）を対象としています。このネットワークは本稿執筆時点でノードリリース**v3.2.5**（2026年10月29日、ガバナンス提案14により高さ3,906,833で適用。v3.2.4は2026年10月23日に高さ3,742,566で、v3.2.3は2026年10月20日に高さ3,662,051で適用済み）を実行しています。**`qorechain-diana`**テストネットは**v3.2.6**を実行しています（2026年10月19日に高さ8,337,253でv3.2.4、10月26日に高さ8,890,800でv3.2.5、10月27日に高さ8,970,638でv3.2.6）。そちらではEVMチェーンID**9800**を使用してください。このページでネットワーク間で異なるもの（テストネットのプリコンパイル、Festテストトークン）を説明する場合は、その旨を明記しています。コードサンプルでは、ご自身で運用するノード向けに `http://localhost:8545` を使用しています。公開メインネットのエンドポイントは `https://evm.qore.host`、テストネットのエンドポイントは `https://evm-testnet.qore.host` です。
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

## ERC-20トークンペア {#erc20-token-pairs}

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

これらはCosmosレーンのトランザクションです。稼働中のネットワークでは、ハイブリッドのポスト量子コサインも必要です（`--generate-only` で構築し、その後 `qorechaind tx pqc cosign` を実行します。[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください）。上記の単純な `convert-erc20` コマンドは、CLI が `0x` の送信者を書き込むため、ノードリリース v3.2.6 では拒否されます。動作する形については[2つの形式間の変換](#fest-convert)を参照してください。トークンペアは許可制のポリシーの下で登録されます（ガバナンスが登録します）。本稿執筆時点でメインネットには存在しません。テストネットには、[次のセクション](#fest-tokens)のFestテストトークンがあります。

## FestテストトークンとERC20変換 {#fest-tokens}

:::note テストネットのみ、価値なし
このセクションのトークンは`qorechain-diana`テストネット（EVMチェーンID 9800）にのみ存在します。ビルダー向けのテストトークンで、価値はありません。メインネットにはERC-20トークンペアがないため（2026年10月27日に確認）、以下のdenomはどれもメインネットには存在しません。
:::

2026年10月27日、テストネットのガバナンス（提案26）が3つのERC-20コントラクトをトークンペアとして登録しました。これにより、ビルダーは[AMMプール](/api-reference/rest-grpc-endpoints#amm-module)でQORと組み合わせる2つ目のトークンを使えます。

| トークン | ERC-20コントラクト（EIP-55） | 小数桁数 | バンクdenom |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **バンクdenomはコロン付きの`erc20:<address>`で、アドレスは上に示したEIP-55の大文字小文字混在の表記と正確に一致していなければなりません。** denomは大文字小文字を区別します。`erc20:0x97143b771d34...`（小文字）は別の文字列であり、それをクエリすると`404`が返ります。denomは`GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`からコピーしてください。ここには3つのトークンが`symbol`（`fUSD`、`fETH`、`fBTC`）、`display`名（`FestUSD`、`FestETH`、`FestBTC`）、小数桁数とともに一覧されます。
* **フォーセットが支払うのはバンクコインです。** EVM（MetaMask、Solidity）でFestトークンを使うには、まず`MsgConvertCoin`でバンクコインをそのERC-20形式に変換します。ERC-20の残高をバンク形式に戻すには（例えばAMMでペアにするため）、`MsgConvertERC20`を使います。どちらも次に説明します。
* **トークンは2つの形式で存在します。** ERC-20の残高はEVM JSON-RPC経由でコントラクトの`balanceOf`で読み取ります。変換後の残高はバンクコインで、`GET /cosmos/bank/v1beta1/balances/{address}`で読み取ります。AMMでペアにできるのはバンクコイン形式のみです。変換は2つの形式の間で価値を移すだけで、価値を生み出すものではありません。
* **金額はトークン自身の小数桁数を使用します**（fUSD、fETH、fBTCでそれぞれ6、18、8）。`uqor`の6桁ではありません。

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### 2つの形式間の変換 {#fest-convert}

2つの変換メッセージはどちらもCosmosレーンのトランザクションです。他のネイティブトランザクションと同様に、登録済みのポスト量子鍵とハイブリッドのコサインが必要です（構築後、`qorechaind tx pqc cosign`。[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください）。手数料は少なくともガス × 0.1 uqorが必要です。

:::note 実行済みの内容
このページのREST読み取り（`token_pairs`、`denoms_metadata`）は、2026年10月27日にテストネットに対して実行されました。以下の2つの変換コマンドは、このページのためにエンドツーエンドでは実行**されていません**。メッセージの形式と送信者のルールは、v3.2.6のノードソースとチェーンチームのリファレンスに基づいています。文書化された形式として扱い、まず少額で確認してください。
:::

**バンクコインからERC-20へ：`MsgConvertCoin`。** `coin`は大文字小文字を区別する正確なバンクdenom（`erc20:<EIP-55アドレス>`）、`sender`はあなたの`qor1...`アドレス（署名者）、`receiver`はERC-20を保有する`0x...`アドレスです。約432,000ガスを使用します。ガスリミットは600,000に設定してください。

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20からバンクコインへ：`MsgConvertERC20`。** その`sender`フィールドも、アカウントの`qor1...`bech32アドレスでなければなりません。`0x`の送信者は`decoding bech32 failed`で拒否されます。ノードリリースv3.2.6では、CLIコマンド`qorechaind tx erc20 convert-erc20`（[ERC-20トークンペア](#erc20-token-pairs)の単純な例）は送信者を`0x`形式で書き込むため、その理由で拒否されます。使用しないでください。上記と同じ方法で、`qor1`アドレスを送信者としてメッセージを自分で構築します。

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

ここで`receiver`は、バンクコインを受け取る`qor1...`アカウントです（バンクコインへの変換の受取人には、モジュールはbech32形式を受け付けます）。金額はトークン自身の基本単位（小数桁数6、18、8）です。`MsgConvertCoin`のdenomは`denoms_metadata`からのみコピーしてください。小文字の形式は`token pair not found`で拒否されます。

---

## PQCとEVMの互換性

EVMトランザクションは**従来のECDSA（secp256k1）**で署名されるため、MetaMask、Hardhat、Foundry、ethers.js、その他の標準的なツールは、変更なしでトランザクションを構築・署名できます。**v3.2.0**で変わったのは*受け入れ（アドミッション）*です。トランザクションは、送信者が登録済みのポスト量子鍵と有効な認可ウィンドウ（次のセクション）を持っている場合にのみ受け付けられます。鍵の登録とウィンドウの開設はCosmosレーンのトランザクションであり、ハイブリッド（ML-DSA-87 + secp256k1）署名が必要です。

コントラクト内でのポスト量子セキュリティについて:

* **PQC Verifyプリコンパイル**（`0x0000...0A01`）は、SolidityからオンチェーンでML-DSA-87署名を検証します。**テストネットでは有効**（ガバナンス提案21により有効化、2026年10月27日可決）で、本稿執筆時点で**メインネットでは有効ではありません**。[EVMプリコンパイル：ネットワークの状況](/developer-guide/evm-precompiles#network-status)を参照してください。
* EVMからQoreChain NativeまたはSVMへの**クロスVMメッセージ**はCosmosレーンのトランザクションであり、他のトランザクションと同様にハイブリッド署名を伴います。現在の利用可否については[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## EVM認可ウィンドウ {#evm-window}

ポスト量子署名はEthereumトランザクション*に添えて*送ることができません（MetaMaskなどのウォレットは2つ目の署名を添付できません）。そのため、トランザクション*より前に*送ります。アカウントはCosmosレーンのメッセージ `MsgOpenEVMWindow` で、上限付きのウィンドウを開きます。以後、EVMレーンは有効なウィンドウでカバーされるトランザクションのみを受け付けます。盗まれた従来型の鍵だけではウィンドウを開けないため、その鍵で動かせるのは、すでに開いているウィンドウが許可する範囲に限られます。

| 上限       | 範囲              | 意味 |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | ウィンドウが開いている期間。開設したブロックから数えたブロック数 |
| `max-txs`   | 1 – 1,000          | ウィンドウが受け付けるEVMトランザクションの件数 |
| `max-value` | 0より大きい値、`uqor`単位 | ウィンドウが受け付ける総流出額：送金額**に加えて**、各トランザクションが支払い得る最大手数料（ガスリミット × ガスあたりの最大手数料）を `uqor` に換算し、切り上げた値 |

いずれかの上限が先に尽きた時点で、ウィンドウは閉じます。3つの上限はすべて必須です。ウィンドウを開くと既存のウィンドウは置き換えられます。受け付けられた後に失敗したトランザクションも、スロットと金額の予算を消費します。コントラクトのデプロイも他のトランザクションと同様に数えられます。`blocks` はブロック数であり、時間ではありません。17,280ブロックは、メインネットでは約15時間（1ブロックあたり約3.1秒）、テストネットでは約6時間（1ブロックあたり約1.3秒。2026年10月27日時点で、テストネットのブロック時間は変動します）です。

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

* [EVM Precompiles](/developer-guide/evm-precompiles) — QoreChainのプリコンパイルインターフェースのリファレンス（テストネットでは3つが有効、メインネットでは無効）
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — クロスVM呼び出しと現在の利用可否
* [Account Abstraction](/developer-guide/account-abstraction) — リンク済みウォレットのオーセンティケーターと支出ルール（テストネットでは有効、メインネットでは無効）
