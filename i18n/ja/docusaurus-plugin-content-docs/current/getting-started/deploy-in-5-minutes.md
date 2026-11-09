---
slug: /getting-started/deploy-in-5-minutes
title: QoreChainに5分でデプロイ
sidebar_label: 5分でデプロイ
sidebar_position: 6
---

# QoreChainに5分でデプロイ

このページは、QoreChainを一度も使ったことのないSolidity開発者向けです。FoundryまたはHardhat、そしてMetaMaskの鍵はそのまま使えます。新しく必要になるのは、短い**承認ウィンドウ**だけです。QoreChainはすべてのアカウントをポスト量子鍵で保護しますが、Ethereumトランザクションにはそれを載せられません。そのため、まず上限付きのウィンドウを開き、それが開いている間は通常のEVMトランザクションが受け付けられます。以下の手順は**テストネット**(`qorechain-diana`、EVMチェーンID 9800)を使用しており、実際のお金はかかりません。

:::note
この手順はテストネットで実行されています。QoreXでウィンドウを開き、同じリカバリーフレーズからFoundryの`cast`でコントラクトを作成して呼び出しました。`forge create`とHardhatも同じ種類のEVMトランザクションを送信しますが、この実行には含まれていません。`qorechaind`のコマンドラインからウィンドウを開く方法も確認済みです。[代替手段: コマンドライン](#cli)を参照してください。
:::

## 必要なもの {#what-you-need}

- デプロイに使いたいMetaMaskアカウントと、そのリカバリーフレーズまたは秘密鍵。
- QoreChainのウォレットである[QoreX](/qorex/overview)(アプリまたはブラウザ拡張機能)。
- インストール済みのFoundryまたはHardhat。

## 1. MetaMaskの鍵をcoin-60アカウントとしてQoreXにインポートする {#step-import}

QoreXのアカウントは、デフォルトでcoin type 118です。coin-118アカウントはMetaMaskとは異なる鍵を持つため、MetaMaskのトランザクションはそこから送信できず、そのアカウントで開いたウィンドウは役に立ちません。QoreXで**アカウント**を開き、**Ethereumアカウントを追加(coin 60)**をタップします。その`0x…`アドレスはMetaMaskに表示されるものと同じで、QoreChain上の`qor1…`アドレスと同じ鍵です。フレーズの最初のEthereumアカウントの場合、これはFoundryが同じフレーズからインデックス0で導出するアドレスでもあります。このアカウントには独自のアドレスがあるため、次の手順の前に資金を入れ、QoreXで選択してください。[MetaMaskまたはDashboardからフレーズを復元する](/qorex/getting-started#restore-dashboard)を参照してください。

## 2. QoreXをテストネットに切り替える {#step-testnet}

- **アプリ:** 設定 → **テストネットを使用(開発者向け)**。
- **ブラウザ拡張機能:** ロックを解除し、下部のバージョン番号を7回タップして、**テストネット(diana)に切り替え**を選びます。

ホームのネットワークバッジがTESTNETに変わります。

## 3. テストネットのQORを入手する {#step-faucet}

[Dashboardのフォーセット](/dashboard/faucet)から、`0x…`または`qor1…`アドレス宛てにテストネットのQORをリクエストしてください。アドレスのどちらの形式でも残高は同じです。

## 4. QoreXでEVMウィンドウを開く {#step-window}

- **拡張機能とアプリ:** メインのポップアップまたはホームにある、**MetaMask on QoreChain**というタイトルのカード(**0x**マーク付き)。これで**EVMアクセスウィンドウ**画面が開きます。
- **アプリ:** 設定 → セキュリティ → **EVMアクセスウィンドウ**からも開けます。

このアカウントにまだポスト量子鍵がない場合、QoreXはこの手順で自動的に登録します。登録費用はアカウントごとに一度だけ0.09 QORで、ウィンドウのトランザクションにはそれとは別にネットワーク手数料がかかります。続いて、3つの制限を選びます。

| 項目 | 範囲 | QoreXのデフォルト |
|---|---|---|
| ブロック数(ウィンドウが開いている期間) | 1〜17,280 | 300 |
| 最大トランザクション数 | 1〜1,000 | 5 |
| 支出上限(QOR単位) | 0より大きい値 | 1 |

支出上限には、各トランザクションの金額**に加えて、その最大手数料**(ガス上限 × 手数料上限)が計上され、送金額だけではありません。コントラクトのデプロイはQORを移動しませんが、それでも最大手数料が計上されます。Hardhatが送信する3,000,000ガスのデプロイは、約0.64 QORとして計上されます。

デプロイ用のセッションでは、デフォルトでは小さすぎます。妥当な設定は、3,000ブロック(テストネットで約1時間)、20トランザクション、上限10 QORです。セッションが許す範囲でできるだけ小さく保ち、終わったらウィンドウを閉じてください。

:::caution 最初にウィンドウを開く
ウィンドウを開くと、アカウントのnonceが進みます。デプロイの**前に**開いてください。それより前に署名されたトランザクションは「nonce too low」で拒否されます。
:::

## 5. FoundryまたはHardhatでデプロイする {#step-deploy}

coin-60アカウントと**同じ資金入りの鍵**を使用してください。QoreXはFoundryの署名者としては動作しないため、FoundryまたはHardhatには秘密鍵(または`--mnemonic`付きのフレーズ)を渡します。ネットワークの設定は次のとおりです。

| 設定 | 値 |
|---|---|
| RPC URL | `https://evm-testnet.qore.host` |
| チェーンID | `9800` |
| 通貨 | QOR、18桁 |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

送信するすべてのトランザクション(デプロイでも呼び出しでも)は、ウィンドウのトランザクション数を1つ消費します。読み取り(`cast call`、view関数、ガス見積もり)にはウィンドウは不要で、消費もしません。

## ウィンドウの確認と期限切れへの対処 {#check-and-expiry}

ウィンドウは**期限切れになります**。ブロック数、トランザクション数、または支出上限が尽きると、EVMレーンは次のトランザクションを`no open EVM authorisation window`または`EVM authorisation window exhausted`で拒否します。QoreXで新しいウィンドウを開いてください。新しいウィンドウは古いものを置き換えます。

状態を確認するには、[dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)の**PQ key status**タブ([開発者](/dashboard/developers)を参照)か、RESTルートを使用します。

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true`で、`remaining_blocks`、`remaining_txs`、`remaining_value`(`uqor`単位)が表示されていれば、ウィンドウは開いています。

## 代替手段: コマンドライン {#cli}

`qorechaind`のリリースバイナリがあれば、QoreXなしで手順1、4、およびポスト量子鍵の登録を行えます。完全なコマンド(鍵のインポート、`tx pqc register-key-v2`、`tx pqc open-evm-window`、`tx pqc cosign`)は、[EVM開発](/developer-guide/evm-development)と[EVM承認ウィンドウ](/developer-guide/evm-development#evm-window)のセクションにあります。この方法で開いたウィンドウの後に`cast`でトランザクションを送信する流れは、テストネットで確認済みです。

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

デプロイ用のウィンドウを`--native-only`や`--allowed-targets`で絞り込まないでください。どちらもコントラクトの作成を拒否します。これらは、コントラクトが存在するようになった後の、以降のセッション向けです。

## テストネットでの違い {#diana-notes}

- **CosmWasm**は、テストネットではガバナンスで承認されたコードのみを受け付けるため、独自のコントラクトをそこにアップロードすることはできません。公開されている経路はSolidityです。
- **SVM**は利用できません。
- メインネットも同じ方法で動作し、チェーンIDは9801、エンドポイントは`https://evm.qore.host`ですが、まずはテストネットから始めてください。

## よくあるエラー {#errors}

| メッセージ | 原因 | 対処 |
|---|---|---|
| `account ... has no registered post-quantum key` | アカウントにML-DSA-87鍵がない | QoreXでウィンドウを開く(登録も行われます)か、コマンドラインから登録する |
| `no open EVM authorisation window` | ウィンドウがない、または期限切れ | ウィンドウを開く |
| `EVM authorisation window exhausted` | トランザクション数または支出上限を使い切った | より大きな制限で新しいウィンドウを開く |
| `nonce too low` | 署名した後にウィンドウを開いた | 先にウィンドウを開き、それから送信する |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | チェーンIDなしで署名されたトランザクション | ネットワーク設定で`chainId`を設定する |

次へ: [EVM開発](/developer-guide/evm-development)、[QoreXのセキュリティとリカバリー](/qorex/security-and-recovery#evm-window)、[開発者](/dashboard/developers)。
