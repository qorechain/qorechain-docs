---
slug: /developer-tools/overview
title: 開発者パッケージ
sidebar_label: 概要
sidebar_position: 1
---

# 開発者パッケージ

QoreChainは、開発者向けツールを小さなパッケージとして公開レジストリ(npm、PyPI、crates.io、Goモジュールプロキシ、Maven Central、Swift Package Manager)で公開しています。このページはその索引です。各パッケージの用途、正確なレジストリ名、言語、現在のバージョン、インストールコマンド、ステータス、そして使い方を読める場所をまとめています。QoreChain上でdApp、ウォレット、バックエンド、ロールアップを構築する開発者が、ガイドを読む前に適切なパッケージを選べるようにするためのページです。

表のバージョンは2026年10月27日にレジストリから読み取ったものです。メインネット`qorechain-vladi`はv3.2.4、テストネット`qorechain-diana`はv3.2.6で稼働しています。公開済みとして記載されているパッケージはすべてApache-2.0ライセンスです。

## 革新点 {#innovations}

- **すべての言語で単一のハイブリッド署名フォーマット。** チェーンは、Nativeレーンのトランザクションにsecp256k1署名とML-DSA-87(FIPS 204)署名の両方を要求します。QoreSignは、公開しているテストベクターをTypeScript、Rust、Go、Swift、Kotlin、Pythonでバイト単位で再現し、`qorechain-pqc`は6つのバインディングで共通のベクターセットを実行します。そのため、ある言語で作成した鍵や署名は、他の言語でも検証できます。
- **署名対象バイト列の形式は推測ではなく、チェーンの状態から決定します。** SDK、ウォレットアダプター、`chain-bridge`、QoreSignのネットワークヘルパーは、ノードに対して両方のアップグレード名(`v3.2.0`と`v3.1.98`)について`GET /cosmos/upgrade/v1beta1/applied_plan/{name}`を問い合わせ、いずれかの高さが0より大きければv2形式で署名します。これら2つのチェーンでRESTエンドポイントがない場合は、推測せずにエラーを投げます。現在、両ネットワークともv2を検証します(2026年10月27日に確認: `v3.2.0`はメインネットで高さ2,981,742、`v3.1.98`はテストネットで高さ5,746,000で適用済み)。
- **書いただけでなく、実行したクイックスタート。** クイックスタートがあるパッケージについては、公開レジストリからインストールした後の2026年10月27日に例を実行しました。34件のクイックスタート項目のうち31件が実行されて成功し、実行されなかった3件はマニフェストに記録されています([制限事項](#limits)を参照)。
- **表の背後にある1つのマニフェスト。** このページのパッケージ名、バージョン、インストールコマンドは、パッケージごとにライブのバージョンエンドポイントを持つ、機械可読な1つのマニフェストから取得しています。[ダッシュボードの開発者ページ](/dashboard/developers#sdks)のSDKハブも、同じデータから構築されています。

## 使い方 {#how-to-use}

構築するものに合わせて選んでください。

| やりたいこと | 使うもの | 読むもの |
|---|---|---|
| チェーンの状態の読み取り、アカウントの導出、スクリプトやdAppからのハイブリッド署名付きトランザクションの送信 | QoreChain SDK | [SDK概要](/sdk/overview)、[インストール](/sdk/install)、[クイックスタート](/sdk/quickstart) |
| 自前のウォレットやバックエンドでの署名、署名の検証、Sign In With QoreChain | QoreSign | [QoreSign概要](/qoresign/overview)、[クイックスタート](/qoresign/quickstart) |
| QoreChainをKeplr、Leap、Cosmostationに追加、統合ウォレットの生成、EVMウィンドウとリンク済み鍵のメッセージの構築 | ウォレットアダプター | [ウォレットアダプター](/developer-tools/wallet-adapter) |
| QORの送金、鍵の登録、コントラクトのデプロイを行うサーバージョブの実行 | チェーンブリッジ(またはSDK) | [チェーンブリッジとハンドル](/developer-tools/chain-bridge) |
| `@handle`を検証済みアドレスに解決 | ハンドル | [チェーンブリッジとハンドル](/developer-tools/chain-bridge#handles) |
| dAppでQoreXウォレットを使えるようにする、または拡張機能なしでテストする | QoreX連携 | [QoreX連携](/developer-tools/qorex-integrations)、[開発者向けQoreX](/qorex/overview#developers) |
| アプリケーションロールアップの作成と運用 | RDK | [ロールアップ概要](/rollups/overview)、[ロールアップのデプロイ](/rollups/deploying-a-rollup) |
| ポスト量子のプリミティブ(ML-DSA、ML-KEM、SHAKE-256)を単体で使う | `qorechain-pqc` | [ポスト量子署名](/developer-guide/post-quantum-signing) |
| AIエージェントや開発者ツールにチェーンを読み取らせる(ブロック、トランザクション、アカウント、ハイブリッド署名のステータス、シミュレーション、未署名の送金) | QoreChain MCPサーバー | [QoreChain MCPサーバー](/developer-tools/mcp) |
| ターミナルやシェルスクリプトからJSON出力でチェーンを読み取る | `qore` CLI | [QoreChain CLI](/developer-tools/qore-cli) |
| コミット済みトランザクションがどのように保護されていたかを読み戻す(メッセージ、署名者、手数料、ML-DSA-87レイヤー、ティア) | QoreSignトランザクションインスペクター(`inspectTransaction`) | [QoreSign概要](/qoresign/overview#inspector) |
| ML-KEM-1024でQoreChainのアカウント、プライベートグループ、サイドチェーン宛てにデータを暗号化する | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| ポスト量子ライトクライアントの設計(チェックポイントの検証)をレビューまたはテストする | PQライトクライアント | [PQライトクライアント](/developer-tools/pq-light-client) |
| QoreChainをカストディアンまたは取引所として統合する(アドレスチェック、出金の検証、入金の計上) | カストディキット | [カストディキット](/developer-tools/custody-kit) |
| ノード、ネットワーク、Solidityソースの暗号を、CycloneDX CBOMとして棚卸しする | QoreScan | [QoreScan](/developer-tools/qorescan) |
| Foundry、Hardhat、viemを使って、QoreChain上でSolidityまたはCosmWasmのプロジェクトをビルドしてテストする | チェーン開発者キット(SDK 0.11.0、近日公開) | [チェーン開発者キット](/developer-tools/chain-dev-sdk) |

まず1つのパッケージをインストールし、そのクイックスタートを公開テストネットに対して実行してください。読み取りにはアカウントも鍵も手数料も不要です。

## アクセス方法 {#how-to-access}

| | テストネット | メインネット |
|---|---|---|
| チェーンID | `qorechain-diana` | `qorechain-vladi` |
| EVMチェーンID | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| コンセンサスRPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **アカウントと鍵:** 読み取りには不要です。送信するには、QORを持つアカウントが必要で(テストネットのQORは[フォーセット](/dashboard/faucet)から入手します)、Nativeレーンではそのアカウントに登録されたML-DSA-87鍵も必要です。
- **費用:** パッケージは無料です。トランザクションにはネットワーク手数料がかかり、手数料の下限はガスあたり0.1 uqorです。
- **署名ルール:** Nativeレーンのトランザクションには、ハイブリッド(secp256k1とML-DSA-87)署名が必要です。EVMトランザクションは、ML-DSA-87鍵が登録され、EVM認可ウィンドウが開いているアカウントからのみ受け付けられます。SVMの読み取りは動作しますが、SVMトランザクションはまだ開放されていません。[アカウントとPQC署名](/sdk/concepts/accounts-pqc)を参照してください。
- **クイックスタートの規約:** 例では、公開テストネットのフォーセットアカウントを読み取り、公開テスト用フレーズ(`abandon`を11回、続けて`about`)で署名します。このフレーズから導出したアカウントには決して入金しないでください。どのクイックスタートもトランザクションを送信しません。

### ダッシュボードの開発者ページ {#dashboard-developers}

ダッシュボードには、[dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)に公開ページがあります。2026年10月27日に確認した時点で、6つのタブがあります(詳しい説明: [開発者](/dashboard/developers))。

- **SDKs:** SDKハブです。マニフェストにあるすべてのパッケージを製品ごとにまとめ、言語セレクター、各レジストリからライブで読み取った最新バージョン、コピーボタン付きのインストール行とインポート行、SDKチームが観測した出力つきのクイックスタート、既知の問題、チェーンIDと公開エンドポイントを表示します。公開されていないパッケージにはインストールコマンドが表示されません。
- **PQ key status:** アドレスがチェーンに登録したML-DSA-87鍵とそのEVM認可ウィンドウを、テストネットまたはメインネットで読み取ります。
- **Simulator:** 署名済みトランザクション(base64またはhexの`TxRaw`)をドライランし、ガス使用量と残高の変化を表示します。ブロードキャストは行われません。
- **Signing playground:** テストネット専用です。ブラウザ内で使い捨てのハイブリッド鍵(メモリ内にのみ保持)を生成し、メッセージとSign In With QoreChainリクエストの署名と検証を行います。
- **QoreX test wallet:** テストネット専用です。テストウォレット(`window.qorex`、EIP-6963で「QoreX (mock)」として通知)をタブに注入し、dAppのフローを試せます。
- **AI agents (MCP):** QoreChain MCPサーバーのステータス(公開済み)と、MCPクライアント向けのセットアップです。まずローカルの`npx`、加えてAPIキーが必要なホスト型テストネットエンドポイントがあります。[QoreChain MCPサーバー](/developer-tools/mcp)を参照してください。

**トランザクションインスペクター**タブ(ハッシュを貼り付けると、すべてのメッセージ、署名者、手数料、ポスト量子署名が検証されるかどうかを表示)は、まだダッシュボードのページにはありません。2026年10月27日の時点では、ページには上記の6つのタブのみが表示されていました。同じ確認は、QoreSign 0.1.1(TypeScript)のライブラリ関数`inspectTransaction`として今すぐ利用できます。[トランザクションインスペクター](/qoresign/overview#inspector)を参照してください。以下の表とSDKハブは同じパッケージデータを示しており、表は2026年10月27日にレジストリと照合済みです。

## 公開場所 {#where-published}

各名前は正確なレジストリ名です。パッケージのリンクからレジストリのページが開きます。「Published」は、表示されたバージョンが現在インストール可能であることを意味します。

### QoreChain SDK {#group-sdk}

ガイド: [SDK概要](/sdk/overview)、[インストール](/sdk/install)、[Reactガイド](/sdk/guides/react)、[CLIリファレンス](/sdk/reference/cli)。ソース: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk)。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | 公開済み |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | 公開済み。プロバイダー、フック、`ConnectButton`、PQCステータスバッジ(0.10.0では`QuantumSafeBadge`としてエクスポート) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | 公開済み |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | 公開済み。稼働中のネットワークでは読み取りのみ |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | 公開済み |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | 公開済み |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | 公開済み |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | 公開済み |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | 公開済み |

### QoreSign {#group-qoresign}

ガイド: [QoreSign概要](/qoresign/overview)、[クイックスタート](/qoresign/quickstart)、[テストベクター](/qoresign/vectors)。ソース: [qorechain/qoresign](https://github.com/qorechain/qoresign)。バージョン0.1.1は2026年10月27日に公開されました。QoreSignはローカルで署名します。鍵を代わりに保管することはなく、しきい値署名、MPC署名、ハードウェアウォレット署名は行いません。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | 公開済み。`inspectTransaction`と`fetchEvmWindow`を含みます(0.1.1で追加) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust(`qoresign`としてインポート) | 0.1.1 | `cargo add qorechain-qoresign` | 公開済み |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | 公開済み |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+(`qoresign`としてインポート) | 0.1.1 | `pip install qorechain-qoresign` | 公開済み、0.1.1で追加。macOS(arm64、x86_64)とLinux(x86_64、aarch64)向けのホイール。Windows向けのホイールはまだありません。オフライン関数のみ |
| `QoreSign` (Swift package) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, product `QoreSign` | GitHubリリースとして公開。バイナリフレームワークはそこからダウンロードされます |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | 公開済み |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | 公開済み。JVMアーティファクトと同じAPI。例はJVMアーティファクトでのみ実行し、Androidデバイスでは実行していません |

KotlinおよびAndroidのアーティファクトには、プロジェクトでKotlin 2.3以降のコンパイラが必要です。Kotlin 2.1のプロジェクトでは、これらに対するコンパイルが失敗します。

TypeScriptパッケージには`@qorechain/qoresign/network`サブパスがあり、Goモジュールにも`inspectTransaction`と`fetchEvmWindow`を除いて同じヘルパーがあります: `fetchPqKeyStatus`、`resolveSignBytesVersion`、`simulateTx`(残高の変化つき)、`suggestGasLimit`、`broadcastTx`、`submitWithSignBytesFallback`(フォールバックは1回のみで、その後は停止)、`verifySiwqWithChain`、`verifyMessageWithChain`。Rust、Swift、Kotlin、Pythonのパッケージにはネットワークコードがありません。

### QoreSeal {#group-qoreseal}

ページ: [QoreSeal](/developer-tools/qoreseal)。ソース: [qorechain/qoreseal](https://github.com/qorechain/qoreseal)。QoreSeal 0.1.0は、ML-KEM-1024(FIPS 203)でQoreChainのアカウント、プライベートグループ、サイドチェーン宛てにデータを暗号化します。暗号化はオフラインで動作します。チェーンから受信者の鍵を読み取るにはKEM鍵レジストリが必要で、これはテストネットで稼働しており、メインネットにはv3.2.5アップグレードの後に提供されます。この構成は、1.0の前に外部レビューを受ける予定です。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust(`qoreseal`としてインポート) | 0.1.0 | `cargo add qorechain-qoreseal` | 公開済み |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | 公開済み |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+(`qoreseal`としてインポート) | 0.1.0 | `pip install qorechain-qoreseal` | 公開済み。macOS(arm64、x86_64)とLinux(x86_64、aarch64)向けのホイール。Windows向けのホイールはまだありません |
| `QoreSeal` (Swift package) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, product `QoreSeal` | GitHubリリースとして公開。バイナリフレームワークはそこからダウンロードされます |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Maven Centralで公開済み |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Maven Centralで公開済み |
| `@qorechain/qoreseal` | TypeScript | まだありません | なし | npmには**未公開**(2026年10月27日に404)。ソースはリポジトリにあります |

### PQライトクライアント {#group-pq-light-client}

ページ: [PQライトクライアント](/developer-tools/pq-light-client)。ソース: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client)。ML-DSA-87で署名されたチェックポイントのための、仕様のドラフトとリファレンス検証器です。メインネットにもテストネットにも接続しません。QoreChainは検証対象のチェックポイントを生成せず、チェーン側のサポートも予定されていません。シミュレートされたバリデーターセットと共通のテストベクターに対して実行されます。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | 公開済み。`@qorechain/pqc` 0.2.3に依存します |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust(ライブラリ`qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | 公開済み |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go(パッケージ`pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | 公開済み |

### カストディキット {#group-custody-kit}

ページ: [カストディキット](/developer-tools/custody-kit)。ソース: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit)。カストディアンと取引所向けの、統合ガイド、リファレンスコード、テストベクターです。TypeScript、Python、Go、Rust、Javaで提供されます。読む、コピーする、またはベンダリングするためのリファレンスコードであり、パッケージ群ではありません。レジストリに登録されているのはGoモジュールのみです。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| GitHubリリース`v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`、その後お使いの言語のフォルダーをビルド | 2026年10月27日に公開。意図的に、npm、PyPI、crates.io、Mavenのパッケージはありません |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go(パッケージ`custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | 公開済み |

### QoreScan {#group-qorescan}

ページ: [QoreScan](/developer-tools/qorescan)。ソース: [qorechain/qorescan](https://github.com/qorechain/qorescan)。QoreScan Community 0.1.0は、QoreChainのデプロイ(ノードのホームディレクトリ、稼働中のネットワーク状態、TLSエンドポイント、Solidityソース)の暗号を棚卸しし、CycloneDX 1.6のCBOMとMarkdownレポートを出力します。棚卸しを補助するツールであり、認証でも監査でもありません。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [GitHubリリース`v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | macOS、Linux、Windows向けバイナリ(amd64、arm64) | 0.1.0 | ダウンロードし、`qorescan_0.1.0_checksums.txt`と照合 | 2026年10月27日に公開 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | npmラッパー(Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | 公開済み。初回実行時にリリースのバイナリをダウンロードして検証します |
| [`qorescan`](https://pypi.org/project/qorescan/) | PyPIラッパー(Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...`または`pip install qorescan` | 公開済み。npmラッパーと同じ動作 |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | 公開済み。Go 1.26 |

### チェーン開発者キット(SDK 0.11.0) {#group-chain-dev-sdk}

ページ: [チェーン開発者キット](/developer-tools/chain-dev-sdk)。ソース: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk)。QoreChain SDK 0.11.0のうち、Solidityやスマートコントラクトのチーム向けの部分です。`@qorechain/evm`のviemチェーン定義とEVM認可ウィンドウのヘルパー、4つの新しい`create-qorechain-dapp`テンプレート(Foundry、Hardhat 3、wagmi付きviem、QoreChain Nativeトークン)、EVMのクイックスタート、QoreChainのEVMがEthereumとどう違うかを説明するページが含まれます。

**近日公開。** SDK 0.11.0はGitHubでタグ付けされており(`v0.11.0`)、npmでのリリースは保留中です。2026年10月27日の時点で、npmは`@qorechain/sdk` 0.10.0、`@qorechain/evm` 0.8.0、`create-qorechain-dapp` 0.10.0を配信しており、`@qorechain/sdk@0.11.0`は404を返しました。npmに0.11.0が表示されるまでは、新しいチェーン定義、ウィンドウのヘルパー、テンプレートはインストールできません。現時点で入手できるのは、[SDKの表](#group-sdk)にある0.10.0のパッケージです。0.11.0が変更するのはnpmパッケージのみで、Python、Rust、Go、JavaのSDKは0.10.0のままです。

### Rollup Development Kit (RDK) {#group-rdk}

ガイド: [ロールアップ概要](/rollups/overview)、[ロールアップのデプロイ](/rollups/deploying-a-rollup)、[Rollup Development Kitのアーキテクチャ](/architecture/rollup-development-kit)。ソース: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk)。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | 公開済み。ハイブリッドで署名できる唯一のRDKクライアントで、`pqcKeypair`を渡した場合のみです |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | 公開済み。0.6.2以降はnpmのbinリンク経由で起動します(0.6.1以前は何も出力しませんでした)。トランザクションコマンドは従来型のみで署名するため、ネットワークに拒否されます |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | 公開済み |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, imports `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | 公開済み。読み取りは動作します。トランザクションは従来型のみで署名します |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | 公開済み。読み取りは動作します。トランザクションは従来型のみで署名します |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | 公開済み。読み取りは動作します。トランザクションは従来型のみで署名します |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | 公開済み。読み取りは動作します。トランザクションは従来型のみで署名します |

### ポスト量子プリミティブ(`qorechain-pqc`) {#group-pqc}

ガイド: [ポスト量子署名](/developer-guide/post-quantum-signing)。ソース: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc)。ML-DSA署名はすべてのバインディングでデフォルトで決定論的であり、ヘッジ署名は明示的に選択した場合のみ使用されます。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | 公開済み |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | 公開済み。liboqsが必要です。不足している場合は初回のインポートでビルドされます(git、CMake、Cコンパイラが必要) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | 公開済み |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | 公開済み |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | 公開済み |
| Cライブラリ | C | 0.2.3 | リポジトリの`c/`をビルド(liboqsとOpenSSLが必要) | ソースのみ、パッケージレジストリなし |

### ウォレットアダプター {#group-wallet-adapter}

ページ: [ウォレットアダプター](/developer-tools/wallet-adapter)。ソース: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter)。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript(ESモジュール、型定義付きの素のJavaScript) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | 公開済み。検証済みのクイックスタートはありません |

### チェーンブリッジ {#group-chain-bridge}

ページ: [チェーンブリッジとハンドル](/developer-tools/chain-bridge)。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (Node.jsサーバー) | 0.2.3 | `npm install @qorechain/chain-bridge` | 公開済み。検証済みのクイックスタートはありません。レジストリにソースリポジトリは記載されていません |

### ハンドル {#group-handles}

ページ: [チェーンブリッジとハンドル](/developer-tools/chain-bridge#handles)。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | 公開済み。ハンドルの解決結果を、ピン留めされたレジストリ鍵に対して検証します。アドレス自体のピン留めは行いません。ピンストアを用意し、ピン留めのタイミングを決めるのは呼び出し側です。検証済みのクイックスタートはありません。レジストリにソースリポジトリは記載されていません |

### QoreX連携 {#group-qorex}

ガイド: [開発者向けQoreX](/qorex/overview#developers)。ソース: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations)。6つすべてを2026年10月27日に公開しました。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | 公開済み。QoreXを検出します(EIP-6963とネイティブプロバイダー) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | 公開済み |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | 公開済み |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | 公開済み。`@cosmos-kit/react` 2.24では`throwErrors={false}`を渡してください。READMEのスニペットには含まれていません |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | 公開済み。テストネットで実際に署名するテストウォレット |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | 公開済み。Playwrightのフィクスチャ。拡張機能モードは現在エラーを投げます |

### Connect(非推奨) {#group-connect}

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | なし | **非推奨であり、メンテナンスは終了しています。** 新規の作業には使わないでください。下の表のように置き換えてください |

:::caution @qorechain/connectは非推奨です
`@qorechain/connect`はnpmで非推奨に設定されています。そのピア範囲は`@qorechain/wallet-adapter`の`^0.2.1`で、0.4.0を含まず、また[EVM認可ウィンドウ](/sdk/guides/evm#evm-window)を開かないため、アカウントに登録済みの鍵と開いたウィンドウがない限り、これを経由したEVM送金は拒否されます。レジストリのメタデータに記載されたリポジトリは公開されていません。
:::

| 必要なもの | 代わりに使うもの |
|---|---|
| QoreXの検出(EVM、ネイティブ、Solana) | `@qorechain/qorex-types` |
| RainbowKitとwagmiを使うEVM dApp | `@qorechain/qorex-rainbowkit` |
| Cosmos dApp | `@qorechain/qorex-interchain-kit`(または`@qorechain/qorex-cosmos-kit`) |
| 自前のウォレットやバックエンドでのハイブリッド署名 | `@qorechain/qoresign` |

### QORel、IBCリレイヤー {#group-qorel}

| パッケージ | 場所 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| QORel(`qorel`) | GitHubリリース`qorel-v0.1.0`、Homebrew、コンテナ`ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | プレリリースとして公開。IBC v1のみ、テストネットのみ。[QORel](/qorel/overview)を参照してください |

### MCPサーバーとCLI {#group-mcp}

ページ: [QoreChain MCPサーバー](/developer-tools/mcp)、[QoreChain CLI](/developer-tools/qore-cli)。ソース: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp)(公開)。どちらもチェーンを読み取るだけで、署名も、鍵の保持も、ブロードキャストも行いません。2026年10月27日に公開されました。

| パッケージ | 言語 | バージョン | インストール | ステータス |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript(Node.jsサーバー、bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | 公開済み。stdioとStreamable HTTP。ホスト型エンドポイント`https://mcp.qorechain.io/mcp`にはAPIキーが必要で、ダッシュボードから申請します |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python(3.10+) | 0.1.0 | `pip install qorechain-mcp`(または`uvx qorechain-mcp`) | 公開済み。npmパッケージと同じツール。stdioのみ |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript(CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | 公開済み。`--json`出力はMCPツールの出力と同一です |

### 計画中(未公開) {#planned}

以下はまだレジストリにないため、インストールできるものはなく、記載されている動作はまだ利用できません。いずれも2026年10月27日に404を返しました(または一覧にありませんでした)。

| パッケージ | 想定用途 | ステータス |
|---|---|---|
| npmの`@qorechain/qoreseal` | TypeScript版QoreSeal | 未公開。ソースはリポジトリにあります |
| npmの`@qorechain/sdk`、`@qorechain/evm`、`@qorechain/react`、`@qorechain/svm`、`create-qorechain-dapp` 0.11.0 | [チェーン開発者キット](/developer-tools/chain-dev-sdk) | GitHubでタグ付け済み、npmでのリリースは保留中 |

## ライブのバージョンを取得する方法 {#live-versions}

表はスナップショットです。パッケージの現在のバージョンを自分で確認するには、次のようにします。

| レジストリ | リクエスト | フィールド |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>`(`User-Agent`ヘッダーを送らないとリクエストは拒否されます) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version`(先頭の`v`を取り除く) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name`(先頭の`v`を取り除く)。認証なしのGitHub呼び出しは1アドレスあたり1時間に60回までに制限されています |

スコープ付きのnpm名では`@`を残してください(例: `https://registry.npmjs.org/@qorechain/sdk/latest`)。404は、パッケージが公開されていないことを意味します。Goプロキシは、リリース直後の短い間、キャッシュから`@latest`を返すことがあるため、特定のバージョンが必要な場合はコマンドでバージョンを固定してください(上のRDKのGoインストールがそうしています)。各レジストリのパッケージページにも、バージョンとリリース履歴が表示されます。

## 制限事項と既知の問題 {#limits}

- **稼働中の2つのネットワークでバージョンが異なります。** メインネットはv3.2.4、テストネットはv3.2.6で稼働しています。テストネットにしかない機能は、その機能自身のページに明記されています。メインネットでv3.2.5の動作を前提にしないでください。
- **まだ公開されていないもの:** ダッシュボードの開発者ページのトランザクションインスペクターのタブ(QoreSign 0.1.1のライブラリ関数`inspectTransaction`は公開済み)、npmの`@qorechain/qoreseal`、npmのSDK 0.11.0(チェーン開発者キット)、SVMトランザクション、メインネットのEVMプリコンパイル(テストネットでのみ有効。レーンごとの一覧は[SDK概要](/sdk/overview)を参照)。
- **QoreSealのレジストリとPQライトクライアント。** チェーンから読み取ったアドレス宛てに暗号化するにはKEM鍵レジストリが必要で、これはテストネットで稼働しており、メインネットにはv3.2.5の後に提供されます。PQライトクライアントはどちらのネットワークにも接続せず、そのチェックポイントに対するチェーン側のサポートも予定されていません。
- **Kotlin 2.3以降。** QoreSignとQoreSealのKotlinおよびAndroidのアーティファクトには、Kotlin 2.3以降のコンパイラが必要です。Kotlin 2.1では、これらに対するコンパイルが失敗します。
- **Windows向けのホイールはありません。** QoreSignとQoreSealのPythonパッケージのホイールはmacOSとLinux向けのみです。それ以外のプラットフォームではソース配布物からビルドされ、Rustが必要です。
- **実行していない例:** 34件のクイックスタート項目のうち、31件が2026年10月27日に実行されて成功しました。Python版QoreSignの例はパッケージの公開後に実行され(macOS arm64とLinux aarch64)、QoreSignのAndroidの例はデバイスでは実行していません。ウォレットアダプター、チェーンブリッジ、ハンドルにはクイックスタートがないため、このマニュアルのそれらの例はパッケージの型定義とソースに基づいており、エンドツーエンドでは実行していません。
- **0.6.2より前の`@qorechain/rdk-cli`**は、npmのbinリンク経由で起動しても何も出力せず、`--version`は0.4.1を出力していました。**0.7.0より前の`@qorechain/rdk`**は、チェーン上で一度も検証を通らない出金証明を構築していました。0.7.0を使用してください。
- **cosmjsのバージョン競合。** `@qorechain/wallet-adapter`と`@qorechain/chain-bridge`はcosmjs 0.32を使い、SDKはcosmjs 0.39を使います。1つのプロジェクトでアダプターをSDKと並べてインストールすると、npmが`ERESOLVE`を報告します。別々のプロジェクトに分けるか、`--legacy-peer-deps`を渡してください。
- **古いRDKリリースでのSDKのネストされたコピー。** `@qorechain/rdk` 0.6.2以前は`@qorechain/sdk`の`^0.9.0`に依存していたため、SDK 0.10.0を使うアプリには、ネストされた2つ目のSDK 0.9.xのコピーが入っていました。0.7.0からはキットが`@qorechain/sdk`の`^0.10.0`に依存し、コピーは1つを共有します。
- **従来型のみのRDKクライアント。** Python、Rust、Go、JavaのRDKクライアントは従来型のみで署名するため、両ネットワークのNativeレーンに拒否されます。読み取りに使うか、トランザクションにはTypeScriptクライアントを`pqcKeypair`とともに使ってください。
- **公開ソースリポジトリがないパッケージ。** `@qorechain/chain-bridge`と`@qorechain/handles`は、レジストリのメタデータにソースリポジトリが記載されていません。公開されたパッケージの内容はnpmで読めます。
- **Pythonの`qorechain-pqc`**は0.2.3ではシードからの鍵生成がなく、liboqsが必要です。
