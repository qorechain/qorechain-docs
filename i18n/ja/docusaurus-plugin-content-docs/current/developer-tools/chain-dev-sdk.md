---
slug: /developer-tools/chain-dev-sdk
title: チェーン開発者キット
sidebar_label: チェーン開発者キット
sidebar_position: 34
---

# チェーン開発者キット（EVM と QoreChain Native のテンプレート）

チェーン開発者キットは QoreChain SDK の一部で、Solidity とスマートコントラクトのチームが、すでに使っているツールで QoreChain 上に構築できるようにします。`@qorechain/evm` に viem のチェーン定義と EVM 認可ウィンドウのヘルパーを追加し、`create-qorechain-dapp` に 4 つのプロジェクトテンプレート（Foundry、Hardhat 3、wagmi を使う viem、QoreChain Native の CosmWasm トークン）を追加し、5 言語の EVM クイックスタートと、QoreChain の EVM が Ethereum とどう違うかのリファレンスを提供します。Ethereum からコントラクトを移植する Solidity チーム、wagmi や RainbowKit を使う dApp フロントエンド開発者、CosmWasm 開発者、そして QoreChain を追加したい EVM ツールのメンテナーを対象としています。

:::note 稼働中: SDK 0.14.0 に含まれます
このキットは QoreChain SDK **0.14.0**（npm、2026年11月12日）で**稼働中であり、インストールできます**: `@qorechain/evm`、`@qorechain/sdk`、`@qorechain/react`、`@qorechain/svm`、`create-qorechain-dapp`（0.13.1 のテンプレート修正も含みます）はすべて 0.14.0 です。Python、Rust、Go の SDK も 0.14.0 です（Maven Central では 2026年11月12日時点でまだ Java 0.13.0 が表示されます。0.14.0 が表示されたらそちらを使ってください）。その内容は最初に npm だけで 0.11.0 として公開され（2026年10月29日）、0.12.0（2026年10月30日）に含まれていました。ほかのレジストリに 0.11.0 はありません。このページのテスト実行は、2026年11月4日に 0.12.0 に対して行いました。0.13.0 ではシードパスのアカウントヘルパーとテンプレートの `PRIVATE_KEY` の扱いが変わりました（[0.13.0 の変更点](/sdk/install#whats-new-0130)を参照）。0.14.0 ではチェーン v3.2.8 のクライアントサポートが加わり、ウィンドウのスコープの新しいフィールドも含まれます（[0.14.0 の変更点](/sdk/install#whats-new-0140)を参照）。
:::

このキットは、メインネット（`qorechain-vladi`、EVM チェーン ID 9801）とテストネット（`qorechain-diana`、EVM チェーン ID 9800）を対象としています。

## キットに含まれるもの {#status}

| 項目 | パッケージとバージョン | 参照先 |
|---|---|---|
| 公開エンドポイントに対する ethers v6、web3.py、go-ethereum、alloy、web3j での読み取り | QoreChain のパッケージは不要 | [クイックスタート 1](#quickstart-ethers) |
| `createEvmClient`、ERC-20、ERC-721、ERC-1155 のヘルパー、`precompiles` バインディング、`PRECOMPILE_ADDRESSES` | `@qorechain/evm` 0.14.0 | [クイックスタート 2](#quickstart-evm-080) |
| viem のチェーン定義 `qorechain` と `qorechainTestnet`、`QORECHAIN_CHAINS`、`QORECHAIN_REST_ENDPOINTS` | `@qorechain/evm` 0.14.0 | [クイックスタート 3](#quickstart-viem) |
| `evmWindowStatus`、`openEvmWindowMessage`、`evmWindowCost`、`classifyEvmWindowRejection`、アドレス変換、ウィンドウの定数、サブパス `@qorechain/evm/window` | `@qorechain/evm` 0.14.0 | [クイックスタート 4](#quickstart-window-helpers) |
| `openEvmWindowMsg`、`fetchEvmWindow`、`EthNativeSigner`、`deriveUnifiedAccount` による、署名を伴う EVM 認可ウィンドウの開設と読み取り | `@qorechain/sdk` 0.14.0 | [クイックスタート 5](#quickstart-open-window) |
| Python、Go、Rust、Java の同じウィンドウビルダー | 0.14.0 の各 SDK | [主な API](#main-api) |
| EIP-7702 の同意ヘルパー `authorizeEvmDelegationMsg`、`clearEvmDelegationMsg`、`classifyEvmDelegationRejection` | `@qorechain/sdk` 0.14.0 | [主な API](#main-api) |
| 7 つのスキャフォルダーテンプレート: `evm-solidity`、`fullstack-web`、`rollup-app`、`foundry`、`hardhat`、`viem-wagmi`、`cosmwasm`、および `pnpm window` ヘルパー | `create-qorechain-dapp` 0.14.0 | [テンプレート](#templates) |
| `PqcStatusBadge` | `@qorechain/react` 0.14.0 | [主な API](#main-api) |

## 革新点 {#innovations}

- **送信は、範囲を限定したウィンドウによって意図的に認可されます。** EVM トランザクションは、登録済みの ML-DSA-87 鍵と開いている EVM 認可ウィンドウを持つアカウントからのみ受け付けられます。ウィンドウは、ハイブリッド（secp256k1 と ML-DSA-87）で署名されたネイティブレーンのメッセージによって開かれるため、EVM ライブラリが保持する secp256k1 鍵だけでは、支出を認可することは決してできません。Ethereum トランザクション自体は、通常の Ethereum トランザクションのままです。
- **信頼ではなく範囲で大きさが決まるウィンドウ。** ウィンドウは、ブロック数（1 から 17,280）、EVM トランザクション数（1 から 1,000）、そして受け付けられるすべてのトランザクションの値と最大手数料を合わせた uqor の合計を制限します。`nativeOnly` は通常の QOR 送金のみに制限し、`allowedTargets`（最大 16 アドレス）は宛先を制限し、コントラクトの作成を拒否します。
- **1 つのアカウント、2 つのエンコーディング。** eth-native アカウントでは、`0x` と `qor1...` のアドレスは同じ 20 バイトであり、同じ残高を示すため、1 つの鍵で EVM とネイティブレーンの両方が動作します。QOR は EVM では 18 桁、ネイティブレーン（`uqor`）では 6 桁の小数で、1 uqor は 10^12 wei です。
- **拒否の理由を示すヘルパー。** `classifyEvmWindowRejection` は、viem または ethers のエラー、ネイティブレーンの配信結果、あるいは文字列から、拒否されたトランザクションを `no-pqc-key`、`no-window`、`exhausted`、`invalid` の 4 つの理由のいずれかに分類します。
- **uqor でのウィンドウのサイズ決定。** `evmWindowCost` と `weiToUqorCeil` は、値、ガス、手数料の上限からウィンドウの大きさを決め、wei を uqor に切り上げるため、合計は最悪のケースをカバーします。
- **自動での開設はありません。** このキットには、送信の前にウィンドウを開くヘルパーが意図的に用意されていません。ウィンドウは、支出が意図的に認可されるために存在します。
- **無料のシミュレーション。** `eth_call` と `eth_estimateGas` は、ウィンドウも登録済みの鍵もなしに、どのアカウントでも動作します。
- **ウィンドウを組み込んだテンプレート。** Foundry と Hardhat のテンプレートには `pnpm window status|register|open` が含まれ、ML-DSA-87 鍵を導出し（`QORE_MNEMONIC` ではニーモニックから、`PRIVATE_KEY` では 0.13.0 以降、`QORE_PQC_RECOVERY_CODE` のリカバリーコードから）、一度だけ登録し、ハイブリッド署名された開設メッセージをブロードキャストします。
- **文書化された互換性の範囲。** リファレンスページ（2026年10月27日に公開エンドポイントから読み取り、11月4日に一部を再確認）に、Ethereum との違いが一覧になっています。トランザクションタイプ、フォーク、ファイナリティ、手数料フィールド、JSON-RPC 名前空間、プリコンパイルです。要約は[下記](#evm-differences)にあります。

## キットの内容 {#contents}

### `@qorechain/evm` {#evm-package}

キットの新機能:

- `qorechain`（9801）と `qorechainTestnet`（9800）: 公開エンドポイント、18 桁の小数を持つネイティブ通貨 QOR、エクスプローラー `https://explore.qore.network` を備えた viem のチェーンオブジェクト。`QORECHAIN_CHAINS` は wagmi と RainbowKit 向けに両方（メインネット、次にテストネット）を列挙します。`QORECHAIN_REST_ENDPOINTS` は、各 EVM チェーン ID をそのネイティブレーンの REST エンドポイントに対応付けます。
- `evmWindowStatus({ rest, address })` は REST（`/qorechain/pqc/v1/evm_window/{address}`）でアカウントのウィンドウを読み取り、`qor1...` または `0x` のアドレスを受け付け、ウィンドウがない場合は失敗せずに `{ found: false }` を返します。`parseEvmWindow` は生の応答をパースします。
- `openEvmWindowMessage(params)` は範囲を検査し、ネイティブレーンの `MsgOpenEVMWindow` を単純な `{ typeUrl, value }` オブジェクトとして組み立て、`@qorechain/sdk` で署名できる状態にします。`checkOpenEvmWindowParams` は検査のみを実行します。
- `evmWindowCost`、`weiToUqorCeil`、`classifyEvmWindowRejection`、`isEvmWindowRejection`、`toQorAddress`、`toEvmAddress`、および定数 `OPEN_EVM_WINDOW_TYPE_URL`、`CLOSE_EVM_WINDOW_TYPE_URL`、`MAX_EVM_WINDOW_BLOCKS`（17,280）、`MAX_EVM_WINDOW_TXS`（1,000）、`MAX_EVM_WINDOW_TARGETS`（16）。
- ウィンドウのヘルパーは、サブパス `@qorechain/evm/window` で viem なしでも公開されます。

キット以前からあるもの（0.8.0 以降）: `createEvmClient`、`evmAccountFromPrivateKey`、`writeContract`、`erc20` ヘルパー、ERC-721 と ERC-1155 のヘルパー、`precompiles` バインディング、`PRECOMPILE_ADDRESSES`。[EVM ガイド](/sdk/guides/evm)を参照してください。

### テンプレート {#templates}

`create-qorechain-dapp` 0.14.0 には 7 つのテンプレートがあります。`evm-solidity`、`fullstack-web`、`rollup-app`（[スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli)を参照）と、キットに属する次の 4 つです。

| テンプレート | 内容 |
|---|---|
| `foundry` | Foundry プロジェクト: `Counter` コントラクト、テスト、デプロイスクリプト、名前付き RPC エンドポイント `qorechain` と `qorechain_testnet`、そして `pnpm window status\|register\|open`。 |
| `hardhat` | Hardhat 3 と viem のプロジェクト: `Counter` コントラクト、シミュレートされたネットワーク上のテスト、Ignition のデプロイモジュール、ネットワーク `qorechain` と `qorechainTestnet`、そして `pnpm window status\|register\|open`。 |
| `viem-wagmi` | QoreX ウォレット（`@qorechain/qorex-rainbowkit`）と `@qorechain/evm` のチェーン定義を備えた、Vite、React、wagmi、RainbowKit の dApp。最新のブロック、QOR 残高、アカウントの EVM ウィンドウを表示します。viem は `~2.53.1` に固定され、REST は Vite の `/lcd` プロキシ経由です（公開 REST は CORS ヘッダーを返さないため）。開発中のブラウザコードは `/lcd/...` を呼び出します（0.13.1）。 |
| `cosmwasm` | cw-plus の `cw20-base` をベースにした QoreChain Native（CosmWasm）の CW20 トークン、Docker での最適化ビルド、ガバナンスのアップロード提案スクリプト、テストネットでのインスタンス化とクエリのスクリプト。 |

テンプレートは `@qorechain/evm` と `@qorechain/sdk` を `^0.14.0` に固定しています（0.12.0 のテンプレートは `^0.12.0` に固定していました。2026年11月4日に `foundry` のスキャフォールドから確認）。

### SDK リポジトリのガイド {#guides}

リポジトリ（`docs/docs/guides/`、タグ `v0.14.0`）には、`evm-quickstarts.md`（viem、ethers v6、web3.py、go-ethereum、alloy、web3j の読み取りと、「Before you send」の節）、`evm-differences.md`（「QoreChain EVM compared with Ethereum」）、`evm.md`、`cosmwasm.md` があります。このサイトにある同じ内容は次のとおりです: [EVM ガイド](/sdk/guides/evm)、[EVM 開発](/developer-guide/evm-development)、[QoreChain Native 開発](/developer-guide/cosmwasm-development)。

リポジトリにはほかに、他のツール向けの貢献ファイル（viem のチェーン定義、Sourcify のチェーンエントリー、Scaffold-ETH 2 の拡張）が `contrib/` と `templates/scaffold-eth-extension/` にあります。これらはリポジトリ内に用意されたファイルであり、アップストリームにはマージされていません。

## ユースケース {#use-cases}

1. **Ethereum から移植する Solidity チーム。** `foundry` テンプレートをスキャフォールドし、コントラクトをコピーして、ローカルで `forge test` を実行し、`pnpm window register` を一度実行し、デプロイのバッチの前に `pnpm window open` を実行します。変更すべき点は[違い](#evm-differences)に一覧があります。blob トランザクションなし、PREVRANDAO は定数、公開エンドポイントでは `debug_*` のトレースなし、です。
2. **テストネットに向かう Hardhat 3 プロジェクト。** `hardhat` テンプレートをスキャフォールドし、Ignition モジュールをそのまま使って、ウィンドウを開いた後に `pnpm deploy:testnet` でデプロイします。ウィンドウを開いてから最初のトランザクションまで約 10 秒待ってください（Hardhat の README に記載があります）。
3. **wagmi 上の dApp フロントエンド。** `QORECHAIN_CHAINS` を wagmi の設定と RainbowKit にインポートし、`evmWindowStatus` でユーザーのウィンドウを表示し、拒否された送信を `classifyEvmWindowRejection` で説明します。
4. **別の言語のバックエンドサービス。** Python、Go、Rust、Java のサービスは、Ethereum と同様に web3.py、go-ethereum、alloy、web3j で残高を読み取りコントラクトを呼び出します。送信するには、その言語の QoreChain SDK 0.12.0 で `MsgOpenEVMWindow` を組み立てます。
5. **CosmWasm 開発者。** `cosmwasm` テンプレートをスキャフォールドし、`cargo test` で CW20 をテストし、最適化された Wasm をビルドし、コードを保存するガバナンス提案を提出し、提案が可決されたらテストネットでインスタンス化します。
6. **ウォレットまたはカストディの統合。** ユーザーのために鍵を保持する統合では、secp256k1 鍵だけでは EVM レーンで支出できないことを理解しておく必要があります。アカウントの ML-DSA-87 鍵で署名した狭いウィンドウ（`nativeOnly` または `allowedTargets`）を開きます。`@qorechain/sdk` 0.12.0 の `openEvmWindowMsg` を使います。
7. **EVM ツールのメンテナー。** viem、Sourcify、Scaffold-ETH 2 のメンテナーは、用意された貢献ファイルを読んで、チェーン ID 9800 と 9801 を追加できます。

## 仕組み {#how-it-works}

- **認可のルール。** チェーンは、登録済みの ML-DSA-87 鍵と有効なウィンドウを持つアカウントからの EVM トランザクションを受け付け、それ以外は拒否します。このルールはプロトコル機能 `evm-pqc-authorisation-window` で、両方のネットワークで有効です。`/qorechain/pqc/v1/protocol_features` で確認できます。[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)と[最初のトランザクションのガイド](/getting-started/first-transaction#evm-window)を参照してください。
- **開設と閉鎖。** `MsgOpenEVMWindow`（`/qorechain.pqc.v1.MsgOpenEVMWindow`）がウィンドウを開きます。ハイブリッドで署名され、ウィンドウを開くと以前のものは置き換えられます。`MsgCloseEVMWindow` がそれを閉じます。
- **ウィンドウが制限するもの。** ブロック（期間ではなくブロック数）、EVM トランザクション、そして受け付けられるすべてのトランザクションの値と最大手数料（ガスリミット × 手数料の上限）を合わせた uqor の合計です。`nativeOnly` と `allowedTargets` は、受け付ける受取先を絞り込みますが、トークンの金額は制限しません（列挙されたトークンは、`approve` を含め任意の金額を受け付けます。[ウィンドウのスコープを絞る](/sdk/guides/evm#evm-window-scope)を参照）。
- **ナンス。** ネイティブのシーケンスと EVM のナンスは同じカウンターです。ウィンドウを開くとこれが進むため、ウィンドウを開き、次にナンスを読み取り、それから EVM トランザクションに署名してください。
- **テンプレートのヘルパー。** `foundry` と `hardhat` では、`pnpm window` が `PRIVATE_KEY`（または `QORE_MNEMONIC`）からアカウントを導出し、ML-DSA-87 鍵を導出し（`PRIVATE_KEY` の場合は 0.13.0 以降 `QORE_PQC_RECOVERY_CODE` から、`QORE_MNEMONIC` の場合はニーモニックから。こちらは変更なし）、鍵を一度だけ登録し（`register`）、ハイブリッド署名した `MsgOpenEVMWindow` をブロードキャストします（`open`）。デフォルトでは、手数料の上限 250 gwei で最大 3,000,000 ガスのトランザクション 5 件分として、600 ブロック・5 トランザクションのウィンドウを設定します。
- **QoreChain Native 上の CosmWasm。** コードのアップロードは、両方のネットワークでガバナンス経由です（`code_upload_access` は `Nobody`）。コードは、ガバナンスモジュールを送信者とする `MsgStoreCode` を含むガバナンス提案によって保存されます。インスタンス化はテストネットでは誰にでも開かれ、メインネットでは閉じられています（`instantiate_default_permission` はテストネットでは `Everybody`、メインネットでは `Nobody`。2026年10月27日に読み取り）。どちらも `/cosmwasm/wasm/v1/codes/params` で確認でき、保存済みのコードは `/cosmwasm/wasm/v1/code` で一覧できます。2026年10月27日と2026年11月4日の時点で、メインネットには保存済みのコードがありませんでした。

## QoreChain EVM と Ethereum の比較 {#evm-differences}

2026年10月27日に公開エンドポイントから読み取りました（SDK ガイド `evm-differences.md`）。ネットワークの状態（手数料、ブロック時間、有効なプリコンパイル）は日付付きです。頼る前にライブで読み取ってください。

- **送信。** すべての EVM トランザクションには、送信者の登録済み ML-DSA-87 鍵と開いているウィンドウが必要で、アカウントごとの例外はありません。デプロイ、送金、コントラクト呼び出しのすべてが対象です。鍵が登録されたアカウントには、ネイティブレーンにも従来型の署名の経路はありません。署名するすべてのネイティブトランザクションはハイブリッドです。
- **シミュレーション。** `eth_call` と `eth_estimateGas` にウィンドウは不要です。
- **トランザクションタイプ。** タイプ 0（レガシー）、1（アクセスリスト）、2（EIP-1559）、4（EIP-7702）が受け付けられます。**EIP-4844 の blob トランザクション（タイプ 3）は拒否されます。** Cancun のオペコードは動作しますが、`blobGasUsed` と `excessBlobGas` は常に 0 で、`eth_blobBaseFee` は存在せず、ポイント評価プリコンパイル（`0x0a`）はエラーを返します。
- **フォーク。** ジェネシスから London まで。Shanghai、Cancun、Prague は有効で、Osaka は有効ではありません。
- **PREVRANDAO（EIP-4399）は定数**（`0xff...ff`）で、ヘッダーの `mixHash` はゼロです。乱数として決して使わないでください。
- **EIP-7702** は QoreChain のルールつきで受け付けられます。委任が有効になる各 authority には、登録済みの PQC 鍵と、`MsgAuthorizeEVMDelegation` で記録される 1 回限りの同意が必要です（1 トランザクションあたり最大 8 件の認可、authority の重複なし）。スポンサーのウィンドウは、authority の同意とは見なされません。`MsgClearEVMDelegation` は委任を削除します。[EIP-7702 の同意](/sdk/guides/evm#evm-delegation-consent)を参照してください。
- **ファイナリティ。** ブロックはコミットされた時点で確定します。`latest`、`safe`、`finalized` は同じブロックを返し、チェーンの再編成（reorg）もアンクルもありません。
- **手数料（両方のネットワーク、2026年10月27日と2026年11月4日に読み取り）。** `eth_gasPrice` は 112.5 gwei、ベース手数料は 100 gwei（ガスあたり 0.1 uqor というチェーンの下限）、`eth_maxPriorityFeePerGas` は 12.5 gwei、ヘッダーの `gasLimit` は 4,294,967,295。手数料の上限をベース手数料の約 2 倍に設定するツール（Foundry がそうです）は、約 112.5 gwei を支払う一方で、ガスあたり最大約 200 gwei をウィンドウに対してコミットします。
- **JSON-RPC 名前空間。** `eth`、`net`、`web3`、`txpool`。`debug_*`、`personal_*`、`admin_*`、`miner_*` のすべてのメソッドは利用できず（`-32601`）、`trace_*`、`eth_coinbase`、`eth_mining`、`eth_hashrate`、`eth_getWork`、`eth_submitWork`、`eth_blobBaseFee`、`eth_simulateV1`、`eth_callMany`、`eth_signTransaction`、`eth_pendingTransactions`、`eth_config` も同様です。トレースが必要なツールは、公開エンドポイントでは動作しません。
- **異なる動作。** `eth_getProof` は動作しますが、Merkle-Patricia 証明ではなくチェーンの IAVL 証明を返します。`eth_getLogs` は 1 回のクエリで最大 10,000 ブロックまでです。`eth_subscribe` は WebSocket 経由でのみ動作します。ノードはアカウントを保持しないため、`eth_accounts`、`eth_sign`、`eth_sendTransaction` は拒否されます。ローカルで署名して `eth_sendRawTransaction` を使ってください。`txpool_content` は公開エンドポイントでは拒否され、`txpool_status` は動作します。`web3_clientVersion` はノードを検出する信頼できる方法ではありません。
- **残高。** `eth_getBalance` は、uqor 単位の銀行残高に 10^12 を掛けたものに、uqor 未満の端数を加えた値を返します。
- **プリコンパイル。** Ethereum の標準プリコンパイルは通常どおり応答します。`pqcVerify`（`0x0A01`）と `pqcKeyStatus`（`0x0A02`）は**テストネットでのみ有効**で、メインネットで有効なものはなく、有効化にはガバナンスの決定が必要で、日付は未定です。テストネットには `0x0C01`（`rlConsensusParams`）も一覧されています。有効でないプリコンパイルへの呼び出しは、リバートせず空のデータを返すため、頼る前に `/cosmos/evm/vm/v1/params` の `active_static_precompiles` を読み取ってください。[EVM プリコンパイル](/developer-guide/evm-precompiles#network-status)を参照してください。
- **ツール。** QoreChain はまだ `viem/chains` に含まれていません。`@qorechain/evm` からチェーンをインポートしてください。Sourcify にはまだチェーン ID 9800 も 9801 も掲載されていません。SVM レーンは開かれていません。

## 使い方 {#how-to-use}

読み取りを行うスニペットはすべて公開テストネット（`qorechain-diana`、EVM チェーン ID 9800）を使い、鍵は不要で、何も送信しません。`0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` のテスト用 ERC-20 はテストネットのトークン（シンボル `WQOR`、18 桁の小数）です。これとアドレスは、ご自身のものに置き換えてください。

### 言語ごとのインストール {#install}

| 言語またはツール | インストール | 最小プラットフォーム |
|---|---|---|
| TypeScript、EVM の読み取り、ERC ヘルパー、viem のチェーン定義、ウィンドウのヘルパー | `npm install @qorechain/evm viem`（0.14.0） | Node.js 20 以降。ピア依存 `viem ^2` |
| TypeScript、ウィンドウメッセージの署名 | `npm install @qorechain/sdk`（0.14.0 には `openEvmWindowMsg`、`fetchEvmWindow`、`EthNativeSigner`、`deriveUnifiedAccount` があります） | Node.js 20 以降 |
| React、PQC ステータスバッジ | `npm install @qorechain/react @qorechain/sdk react react-dom`（0.14.0） | Node.js 20 以降 |
| スキャフォルダー、7 つのテンプレートすべて | `npx create-qorechain-dapp my-app --template <name>`（0.14.0） | Node.js 20 以降。`foundry` には Foundry。`hardhat`（Hardhat 3）には Node.js 22。`cosmwasm` には Rust と Docker |
| Python（EVM の読み取り） | `pip install "web3>=7,<8"`。ウィンドウメッセージは `pip install qorechain-sdk`（0.14.0）から | Python 3.10 以降 |
| Go（EVM の読み取り） | `go get github.com/ethereum/go-ethereum@latest`。ウィンドウメッセージは `go get github.com/qorechain/qorechain-sdk/packages/go@v0.14.0` から | Go ツールチェーン |
| Rust（EVM の読み取り） | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`。ウィンドウメッセージはクレート `qorechain-sdk` 0.14.0 から | stable の Rust |
| Java（EVM の読み取り） | `org.web3j:core:5.0.0`。ウィンドウメッセージは `io.github.qorechain:qorechain-sdk:0.14.0` から（Maven Central では 2026年11月12日時点でまだ 0.13.0 が表示されます。0.14.0 が表示されたらそちらを使ってください） | JDK 21（QoreChain Java SDK は JDK 21 ツールチェーンでビルドされます） |

### クイックスタート 1: ethers v6 で読み取る {#quickstart-ethers}

QoreChain のパッケージは不要です。2026年10月27日にテストネットに対して実行したところ、`chain id: 9800n`、残高、`token: WQOR 18n` が出力されました。

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

web3.py、go-ethereum、alloy、web3j での同じ読み取りは、SDK ガイド `evm-quickstarts.md` にあります（そこでは web3.py 7.16、go-ethereum 1.17.10、alloy 1.8、JDK 21 上の web3j 5.0.0 でテスト済みと報告されています。このページでは再実行していません）。

### クイックスタート 2: `@qorechain/evm` で読み取る {#quickstart-evm-080}

開発者ハブのテスト済みクイックスタートです（マニフェストでは2026年10月27日にテスト済みとされ、そのときは `@qorechain/evm` 0.8.0 でした。2026年11月4日に 0.12.0 で再度実行し、同じ形式の行が出力されました）。接続し

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### クイックスタート 3: viem のチェーン定義で読み取る {#quickstart-viem}

2026年11月4日に `npm install @qorechain/evm@0.12.0 viem` を実行した後に実行したところ、`chain id: 9800`、残高、そしてトークン `WQOR 18` が出力されました。

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### クイックスタート 4: ウィンドウを確認して開設メッセージを組み立てる {#quickstart-window-helpers}

`@qorechain/evm` の README より。読み取りを行い、その後メッセージオブジェクトを組み立てます。署名も送信もしません。2026年11月4日に 0.12.0 で実行したところ、ウィンドウのないアカウントでは `evmWindowStatus` は `found: false, live: false` を返し、メッセージは `typeUrl: '/qorechain.pqc.v1.MsgOpenEVMWindow'` で、3,000,000 ガスのトランザクション 5 件分、112.5 gwei として `maxValue: '1687500'` で返ってきました。

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### クイックスタート 5: TypeScript からウィンドウを開く {#quickstart-open-window}

SDK ガイド `evm-quickstarts.md` の「Before you send」より。これは**ネイティブレーンのトランザクションを送信します**。ご自身の資金のあるテストアカウントでのみ実行し、共有されたフレーズや公開されたフレーズは決して使わないでください。

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

このスニペットは、このページのためには再実行していません。`maxValue: "3750000"` は、手数料の上限 250 gwei で 3,000,000 ガスのトランザクション 5 件分です。

### クイックスタート 6: スキャフォルダーでプロジェクトを作成する {#quickstart-scaffold-live}

2026年10月27日に、空のディレクトリで公開 npm レジストリの `npx` を使ってテストしました（当時は 0.10.0、テンプレート `fullstack-web`）。プロジェクトがスキャフォールドされ、ビルドは成功しました。2026年11月4日には、`create-qorechain-dapp@0.12.0 --template foundry --no-install` がプロジェクトをスキャフォールドし、その `package.json` は `@qorechain/evm` と `@qorechain/sdk` の `^0.12.0` に依存していました。ほかの新しいテンプレートは、このページのためにはスキャフォールドしていません。

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### キットのテンプレートの使い方 {#new-templates-usage}

スキャフォルダーは 4 つのキットのテンプレート名を受け付けます（下のフラグの表を参照）。`foundry` プロジェクトは `forge build` と `forge test` でローカルにビルドとテストができ（ネットワーク不要）、`pnpm window status` はアカウント、その PQC 鍵、そのウィンドウを読み取ります。`pnpm window register` と `pnpm window open` は、ご自身の資金のあるアカウントからネイティブレーンのトランザクションをブロードキャストし、`forge script ... --broadcast` はデプロイを行います。`.env.example` に実際の鍵を入れたり、`.env` をコミットしたり、公開されている BIP-39 のテストフレーズ（`abandon` を 11 回繰り返し、最後に `about`）に資金を入れたりしないでください。

## 主な API {#main-api}

### `@qorechain/evm` {#api-evm}

| 名前 | 内容 |
|---|---|
| `qorechain`、`qorechainTestnet` | 9801 と 9800 用の、公開エンドポイントとエクスプローラーを備えた viem のチェーンオブジェクト。 |
| `QORECHAIN_CHAINS` | wagmi または RainbowKit 向けの両方のチェーン（メインネット、次にテストネット）。 |
| `QORECHAIN_REST_ENDPOINTS` | EVM チェーン ID からネイティブレーンの REST URL への対応。 |
| `evmWindowStatus` | REST でウィンドウを読み取る: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`。 |
| `parseEvmWindow` | REST の応答をパースする。 |
| `openEvmWindowMessage` | 範囲を検査し、`MsgOpenEVMWindow` を `{ typeUrl, value }` として組み立てる。 |
| `checkOpenEvmWindowParams` | 範囲の検査のみ。 |
| `evmWindowCost`、`weiToUqorCeil` | uqor でのウィンドウのサイズ決定。 |
| `classifyEvmWindowRejection`、`isEvmWindowRejection` | 拒否を説明する: `no-pqc-key`、`no-window`、`exhausted`、`invalid`。 |
| `toQorAddress`、`toEvmAddress` | 同じアカウントの `0x` と `qor1...` を相互に変換する。 |
| `OPEN_EVM_WINDOW_TYPE_URL`、`CLOSE_EVM_WINDOW_TYPE_URL`、`MAX_EVM_WINDOW_BLOCKS`、`MAX_EVM_WINDOW_TXS`、`MAX_EVM_WINDOW_TARGETS` | 定数。 |
| `@qorechain/evm/window` | viem への依存なしのウィンドウのヘルパー。 |

`@qorechain/evm` はネイティブレーンのトランザクションの署名もブロードキャストも行いません。それには `@qorechain/sdk` または各言語の SDK を使用してください。

### 各 SDK でのウィンドウの組み立てと読み取り（0.14.0） {#api-window}

| 言語 | ウィンドウを開く | ウィンドウを読む |
|---|---|---|
| TypeScript | `openEvmWindowMsg`（`@qorechain/sdk`）、`openEvmWindowMessage`（`@qorechain/evm`） | `fetchEvmWindow`、`evmWindowStatus`（`@qorechain/evm`） |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow`（`nativeOnly` または `allowedTargets` には `NewOpenEVMWindowScoped`） | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

EIP-7702 の同意（TypeScript、`@qorechain/sdk` 0.14.0）: `authorizeEvmDelegationMsg`、`clearEvmDelegationMsg`、`classifyEvmDelegationRejection`。

`@qorechain/react` 0.14.0 は `PqcStatusBadge` をエクスポートします（デフォルトのラベルは「PQC key registered」と「No PQC key」）。従来の `QuantumSafeBadge` も残されています。

### `create-qorechain-dapp` のフラグ {#api-scaffolder}

| フラグ | 内容 |
|---|---|
| `-t, --template <name>` | `evm-solidity`、`fullstack-web`、`rollup-app`、`foundry`、`hardhat`、`viem-wagmi`、`cosmwasm`。 |
| `--network <name>` | `testnet` または `mainnet` のプリセット。 |
| `--package-manager <pm>` | `pnpm`、`npm`、`yarn`。 |
| `-y, --yes` | プロンプトを省略してデフォルトを使用する。 |
| `--no-install` | 依存関係をインストールしない。 |
| `--local` | SDK のモノレポ内で、`@qorechain/*` の依存関係をローカルリンクに書き換える（SDK への貢献者向け。通常の利用では不要）。 |
| `-h, --help` / `-v, --version` | ヘルプとバージョン。 |

### テンプレートのスクリプト {#api-template-scripts}

| テンプレート | スクリプト | 内容 |
|---|---|---|
| `foundry`、`hardhat` | `pnpm window status` | アカウント、その ML-DSA-87 鍵が登録されているか（そしてそれがこの鍵か）、そのウィンドウを表示する。 |
| `foundry`、`hardhat` | `pnpm window register` | アカウントの ML-DSA-87 鍵を、アカウントごとに一度だけ登録する。 |
| `foundry`、`hardhat` | `pnpm window open` | ウィンドウを開く（デフォルトは 600 ブロック、5 トランザクション）。 |
| `foundry`、`hardhat` | `pnpm window recovery-code` | 新しいリカバリーコードを表示する（0.13.0）。`PRIVATE_KEY` とは別に保管し、`QORE_PQC_RECOVERY_CODE` に設定する。 |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`。 |
| `hardhat` | `pnpm build`、`pnpm test`、`pnpm deploy:testnet` | Hardhat のビルド、テスト、`qorechainTestnet` への Ignition デプロイ。`pnpm window open` の後、最初のトランザクションまで約 10 秒待ってください。 |
| `viem-wagmi` | `pnpm dev`、`pnpm build` | `http://localhost:5173` の開発サーバー（REST は `/lcd` プロキシ経由）。本番ビルド。 |
| `cosmwasm` | `pnpm build:wasm`、`pnpm propose-store`、`pnpm instantiate`、`pnpm query` | 最適化ビルド、ガバナンスのアップロード提案、インスタンス化（テストネット）、REST クエリ。 |

テンプレートの環境変数（`.env` 内。コミットしないこと）: `PRIVATE_KEY`、`QORE_MNEMONIC`、`QORE_PQC_RECOVERY_CODE`（`PRIVATE_KEY` と併用。`pnpm window recovery-code` で新しいものを表示でき、鍵とは別に保管します）、`QORE_NETWORK`（`testnet` または `mainnet`）、`QORE_WINDOW_BLOCKS`、`QORE_WINDOW_TXS`、`QORE_WINDOW_MAX_UQOR`、`COUNTER_INITIAL`。CosmWasm のスクリプトには `QORE_CODE_ID` と `QORE_I_KNOW_THIS_IS_MAINNET=yes`（提案スクリプトはこれがないとメインネットを拒否します）。`viem-wagmi` で WalletConnect ウォレットを使うには `VITE_WALLETCONNECT_PROJECT_ID`。

## アクセス方法 {#how-to-access}

| | テストネット | メインネット |
|---|---|---|
| ネイティブチェーン ID | `qorechain-diana` | `qorechain-vladi` |
| EVM チェーン ID（`eth_chainId`） | 9800（`0x2648`） | 9801（`0x2649`） |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | 未公開 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| コンセンサス RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| エクスプローラー | `https://explore.qore.network` | `https://explore.qore.network` |

- **読み取り**には何も必要ありません。アカウントも、鍵も、ウィンドウも不要です。
- **EVM レーンでの送信**には、資金のあるアカウント、チェーンに（一度）登録された ML-DSA-87 鍵、開いているウィンドウが必要です。鍵の登録とウィンドウはネイティブレーンのトランザクションです。
- **コスト。** 手数料の下限は、両方のネットワークでガスあたり 0.1 uqor です。読み取りは無料です。テストネットの QOR は[フォーセット](/dashboard/faucet)から入手できます。
- **CosmWasm。** どちらのネットワークでも、ガバナンスなしにコードをアップロードできません。メインネットでは、ガバナンスなしにインスタンス化できません。2026年10月27日と2026年11月4日の時点で、メインネットには保存済みのコードがありませんでした。
- **ノードとツールのバージョン。** 上のインストールの表を参照してください。

## 公開場所 {#where-published}

バージョンは2026年11月12日に各レジストリからライブで読み取りました（Maven Central を含む）。GitHub のタグ `v0.12.0` は存在します。5 つの npm パッケージには、同じキットの内容を含む 0.11.0（2026年10月29日）もあります。Python、Rust、Go、Java の SDK は 0.10.0 から直接 0.12.0 になり、Java を除くすべての言語が 0.14.0 です（Java は Maven Central で 0.13.0 です）。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| npm | `@qorechain/evm` | 0.14.0 | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.14.0 | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.14.0 | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.14.0 | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.14.0（7 つのテンプレート） | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit`（`viem-wagmi` が使用） | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.14.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.14.0 | https://crates.io/crates/qorechain-sdk |
| Go プロキシ | `github.com/qorechain/qorechain-sdk/packages/go` | v0.14.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 2026年11月12日時点で 0.13.0。0.14.0 はまだありません | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

ソース: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk)、タグ `v0.14.0`。パスは `packages/evm`、`cli/`、`templates/`、`docs/docs/guides/`、`contrib/`。Apache-2.0、QoreChain Association が保守しています。

## 制限事項と既知の問題 {#limits}

- **npm の 0.11.0 は置き換えられています。** 0.14.0 を使ってください。0.11.0 は npm にしかなく、0.14.0 のテンプレートは `^0.14.0` に依存しています。
- **`@qorechain/evm` はウィンドウを読み取り、メッセージを組み立てますが、ネイティブレーンのトランザクションの署名もブロードキャストも行いません。**
- **送信の前にウィンドウを自動的に開くヘルパーはありません。** 設計上の判断です。
- **`viem-wagmi` テンプレートの QoreX ウォレット**は、`eth_chainId`、`eth_accounts`、`eth_requestAccounts`、`wallet_switchEthereumChain` に応答します。EVM の署名メソッドはまだ利用できません。接続と読み取りに使い、署名には注入された EIP-1193 ウォレットを使ってください。
- **テンプレートの `pnpm window` ヘルパーは、ML-DSA-87 鍵を `QORE_MNEMONIC` から、または `PRIVATE_KEY` を使う場合は `QORE_PQC_RECOVERY_CODE` から導出します**（`PRIVATE_KEY` のみでコードがない場合は、メッセージを表示して停止します）。アカウントの鍵が別のウォレットで登録された場合は、代わりにそのウォレットからウィンドウを開いてください。
- **公開エンドポイントでは利用できません:** blob トランザクション、トレース、そして `debug`、`personal`、`admin`、`miner` の名前空間。
- **CosmWasm のアップロードは両方のネットワークでガバナンス経由です。** `cosmwasm` テンプレートだけではコードを保存できません。
- **他のツールへの貢献**（viem、Sourcify、Scaffold-ETH 2）は、リポジトリ内に用意されたファイルであり、アップストリームにはマージされていません。
- **メインネットの EVM プリコンパイル:** 有効なものはありません。`pqcVerify`（`0x0A01`）と `pqcKeyStatus`（`0x0A02`）はテストネットでのみ有効です。
- **ネットワークの状態は日付付きです。** 手数料の数値は2026年10月27日に読み取り、2026年11月4日に再確認しました。ブロック時間は2026年10月27日に読み取りました。

## セキュリティに関する注意 {#security}

- ウィンドウの設計により、EVM ライブラリが保持する secp256k1 鍵だけでは、支出を認可することは決してできません。ウィンドウを開くには、アカウントの ML-DSA-87 鍵によるハイブリッド署名が必要です。ウィンドウは小さく保ち（`blocks`、`maxTxs`、`maxValue`）、可能な場合は `nativeOnly` または `allowedTargets` を使ってください。
- `maxValue` には各トランザクションの最大手数料が含まれます。値だけでなく、`evmWindowCost` で大きさを決めてください。
- テンプレートは鍵を `.env` から読み取ります。これは git で無視され、`.env.example` にはプレースホルダーが入っています。Hardhat のユーザーは `npx hardhat keystore set PRIVATE_KEY` で鍵を暗号化して保存できます。
- 公開されている BIP-39 のテストフレーズ（`abandon` を 11 回繰り返し、最後に `about`）には、決して資金を入れないでください。
- メインネットの CosmWasm 提案では、投票者がバイナリを検証できるように、ソースと再現可能なビルドを公開してください（オプティマイザーがチェックサムを出力します）。
- 脆弱性は security@qore.network に非公開で報告してください。

## 関連ページ {#related}

- [開発者パッケージ概要](/developer-tools/overview)と[スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli)（`create-qorechain-dapp` 0.14.0）
- [SDK 概要](/sdk/overview)、[SDK のインストール](/sdk/install)、[EVM ガイド](/sdk/guides/evm)（ウィンドウ、スコープを絞ったウィンドウ、EIP-7702 の同意、プリコンパイル）
- [EVM 開発](/developer-guide/evm-development)と [EVM プリコンパイル](/developer-guide/evm-precompiles#network-status)
- [QoreChain Native 開発](/developer-guide/cosmwasm-development)（CosmWasm とガバナンス提案）
- [QoreX 統合](/developer-tools/qorex-integrations)（`@qorechain/qorex-rainbowkit`）
- [QoreSign](/qoresign/overview)（ネイティブレーンでのハイブリッド署名）
- [QoreScan](/developer-tools/qorescan)（Solidity ソースにおける `ecrecover` と PQC プリコンパイルの使用状況の棚卸し）
