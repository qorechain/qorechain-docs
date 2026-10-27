---
slug: /dashboard/developers
title: 開発者
sidebar_label: 開発者
sidebar_position: 13
---

# 開発者

**Developers** ページ(`/developers`、サイドバーの **Build** グループ内の **Developers** 項目)は、QoreChain 上で構築するためのツールをまとめた公開ページです。アカウントは不要です。**SDKs**、**PQ key status**、**Simulator**、**Signing playground**、**QoreX test wallet**、**AI agents (MCP)** の6つのタブがあります。これらを使うと、適切なパッケージを見つけてインストールしたり、アカウントが登録したポスト量子鍵とその EVM 認可ウィンドウが開いているかどうかを確認したり、署名済みトランザクションをドライランしたり、使い捨ての鍵でハイブリッド署名を練習したり、モックの QoreX ウォレットを相手に dApp を動作確認したりできます。これらはすべてブラウザ上で行えます。dApp、ウォレット、バックエンドの開発者向けです。**Transaction inspector** は計画中で、まだ稼働していません([制限事項](#limits)を参照)。ライブラリそのものについては、[開発者向けパッケージ](/developer-tools/overview)、[SDK 概要](/sdk/overview)、[インストール](/sdk/install)を参照してください。

## イノベーション {#innovations}

- **チェーンへの読み取り専用ゲートウェイ。** これらのツールは、`cosmos/`、`cosmwasm/`、`qorechain/` の各クエリパスと simulate 呼び出しに対する読み取り専用のゲートウェイを通じて、公開されているチェーンのデータを読み取り、トランザクションをシミュレートします。ページ上のどの操作も、トランザクションをブロードキャストすることはできません。このゲートウェイが存在するのは、チェーンの REST エンドポイントがブラウザの CORS ヘッダーを送信しないためです。
- **鍵がブラウザの外に出ません。** Signing playground と test wallet の鍵はブラウザ内で生成され、メモリ上にのみ保持されます。保存も送信もされず、再読み込みすると消えます。この2つのタブはテストネット専用で、メインネットを拒否します。
- **デモではなく、本番の署名ライブラリ。** Playground は、本番の統合と同じオープンソースライブラリである [QoreSign](/qoresign/overview) を使用します。同じメッセージに対する secp256k1 署名と ML-DSA-87 署名からなるハイブリッド署名を生成し、検証します。
- **テスト済みのデータから生成されるパッケージハブ。** **SDKs** タブは、1つのマニフェストから約40個のパッケージを一覧表示します。バージョンは各レジストリからライブで読み取られ(10分ごとに更新され、レジストリに到達できない場合は最後に確認したバージョンとその日付が表示されます)、各クイックスタートは SDK チームが公開レジストリに対して実行したもので、観測された出力が横に表示されます。
- **推測ではなく、チェーンの答え。** **PQ key status** は、登録済みの ML-DSA-87 鍵と EVM ウィンドウの状態を、ノード自身のクエリルートから読み取ります。そのため、EVM トランザクションが拒否される理由を、送信する前に確認できます。

## 使い方 {#how-to-use}

[dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) を開きます。ページは **SDKs** で開きます。**PQ key status** タブと **Simulator** タブには、ヘッダーの設定にかかわらず、ページ内だけで有効で**デフォルトが Testnet** の **Network** トグル(Testnet または Mainnet)が表示されます。これは意図的にページ単位になっています。ヘッダーの切り替えはページを再読み込みするため、メモリ上の鍵と test wallet が消えてしまうからです。

### SDKs {#sdks}

**できること。** すべての QoreChain ライブラリを、製品ごとにまとめて一覧表示します。マニフェストには、TypeScript、Python、Go、Rust、Java、Kotlin、Swift にまたがる約40個のパッケージがあります。大半は安定版で、1個は非推奨です。レジストリにまだないパッケージには、その旨が表示されます。製品は、表示順に次のとおりです。QoreChain SDK(コア、React フック、EVM、SVM、dApp スターター、および Python、Rust、Go、Java への移植版)、QoreSign、RDK(ロールアップ開発キット、そのコマンドラインツール、ロールアップスターター、および Python、Rust、Go、Java への移植版)、PQC ライブラリ、ウォレットアダプター、チェーンブリッジ、Handles、QoreX 統合、そして MCP と `qore` CLI。

**仕組み。** 各製品はカードになっています。製品が複数の言語で提供されている場合は、言語セレクター(ピル)で表示するパッケージを切り替えます。各パッケージには次の内容が表示されます。

- ステータスのピル(**Stable**、**Not published yet**、**Deprecated**)。
- **最新バージョン**。レジストリ(npm、PyPI、crates.io、Go プロキシ、Maven Central、GitHub リリース)からライブで読み取られ、10分ごとに更新されます。レジストリに到達できない場合は、最後に確認したバージョンがその日付とともに表示され、ライブのバージョンを読み取れなかった旨の注記が付きます。
- **Registry**、**Source**(リポジトリ)、**License**(Apache-2.0)、そして実行環境の要件。
- **Install** コマンドと **Import** 行(それぞれコピーボタン付き)。パッケージによっては、ピア依存関係、サブパスのエクスポート、トランスポート、ホスト型エンドポイントも表示されます(Maven では `pom.xml` のブロックが表示されます)。
- **Quickstart**:日付付きの **Tested**、**Failed in testing**、**Not tested** のいずれかを示すピル、ファイル名、コピーボタン付きのコード、**Observed output**、**How it was tested**。失敗したクイックスタートは **Show the quickstart** の背後に隠され、先に既知の問題を読むよう警告が表示されます。
- **Known issues** と注記。SDK チームの文言そのままです。

公開されていないパッケージには、「This package is not on its registry yet, so there is no install command.」と表示され、インストール行は表示されません。非推奨のパッケージ(`@qorechain/connect`)は、**Deprecated packages** の下の末尾にまとめて折りたたまれ、その代替(`@qorechain/qorex-*` パッケージ)が示されます。

**手順。**

1. フィルターボックス(「Filter by name or language」)に入力して一覧を絞り込みます。**Clear filter** でリセットされます。複数の製品が一致する場合は、各製品へのリンクが並ぶ **Jump to** 行が表示されます。
2. 製品を選び、続いて言語のピルを選びます。
3. バージョン行(「latest on npm」、または日付付きの「checked」)を確認し、**Install** コマンドをコピーします。
4. **Import** 行をコピーし、次に **File name** の下に示されたファイル名でクイックスタートをコピーして、実行します。
5. **Network endpoints** を開くと、テストネットとメインネットのチェーン ID と公開エンドポイントをコピーできます。その下の注記には、クイックスタートの規約が説明されています。例は読み取りのみを行い、公開テストフレーズで署名するため、そこから導出されたアカウントには決して資金を入れないでください。

**最小限の例。** フィルターに `python` と入力し、**QoreChain SDK** を開き、**Python** のピルを選び、**Install** からインストールコマンドをコピーしてから、クイックスタートをコピーして実行します。

**ネットワーク。** 静的な一覧とレジストリのライブ読み取りです。ネットワークの選択は適用されません。

### PQ key status {#pq-status}

**できること。** アカウントがチェーンに登録した ML-DSA-87 鍵と、その EVM 認可ウィンドウの状態を、メインネットまたはテストネットで表示します。

**仕組み。** ページは入力を解析して `qor1...` アカウントに変換し、ノードに2つのクエリを送ります。登録済みの PQC 鍵([QoreSign](/qoresign/overview) 経由)と、アカウントの EVM ウィンドウ(`GET /qorechain/pqc/v1/evm_window/{address}`)です。`0x...` アドレスは `qor1...` 形式と同じ20バイトで、`qorvaloper1...` アドレスは運用者自身のアカウントとして調べられます。結果は1つのネットワークに属します。トグルを変更すると結果はクリアされます。

**手順。**

1. **PQ key status** タブを開き、ネットワークを選びます。
2. **Account address**(`qor1...`、`0x...`、または `qorvaloper1...`)を入力します。ページは形式とチェックサムを確認し、入力ミスがあれば報告します。
3. **Check** を選択します。
4. **Registered PQC key** を読みます。鍵が登録されているかどうか、**Algorithm**(ML-DSA-87)、**Key type**(hybrid)、**Proof of possession**(チェーンはこれを任意として扱うという注記付き)、**Public key**(2592バイト、省略表示、コピーボタン付き)が表示されます。鍵のないアカウントには「This account has no PQC key registered on this network.」と表示されます。
5. **EVM authorisation window** を読みます。**State**(**Open** または **Closed**)、**Blocks left**、**Transactions used**(「3 of 20」のような表示)、**Value used**、**Opened / expiry height**、ウィンドウが **Native QOR transfers only** かどうか、許可された宛先が表示されます。ウィンドウを一度も開いていないアカウントには「No EVM authorisation window has been opened for this account.」と表示されます。

ウィンドウはネイティブレーンでアカウントの ML-DSA-87 鍵によって開かれ、ブロック数の上限またはトランザクション数の上限に達すると閉じます。[EVM 認可ウィンドウ](/developer-guide/evm-development#evm-window)を参照してください。

**最小限の例。** Testnet を選び、MetaMask で使っているアドレスの `0x...` 形式を貼り付けて **Check** を選択します。ウィンドウが **Closed** であるか存在しない場合、そのアカウントからの EVM トランザクションは拒否されます。

### Simulator {#simulator}

**できること。** 署名済みトランザクションをチェーンに対してドライランし、そのコストと変化を報告します。何もブロードキャストされません。

**仕組み。** ページは入力(base64 または hex、最大およそ 180 KB)をデコードし、署名の数を数えて、ノードの simulate ルートに送信します。simulate 呼び出しは、ゲートウェイが許可している唯一の書き込み系ルートです。

**手順。**

1. **Simulator** を開き、ネットワークを選びます。
2. 署名済みトランザクション(`TxRaw`、base64 または hex)を **Signed TxRaw** に貼り付けます。ページは、デコードされたサイズと署名の数を表示し、署名が1つもない場合は警告します(チェーンは、署名のないトランザクションのシミュレーションをおそらく拒否します)。
3. **Simulate** を選択します。
4. **Gas used**、**Suggested gas limit**、**Balance changes**(アドレス、denom、変化量)、折りたたみ式リストの **Events** を読みます。
5. チェーンが拒否した場合、ページは「The chain refused the simulation」の下にその **Code**、**Codespace**、**Log** を表示します。

先に署名済みのバイトが必要です。SDK または `qorechaind` で構築して署名してください([ポスト量子署名](/developer-guide/post-quantum-signing)を参照)。**最小限の例:** テストネットで SDK を使って小さな送金に署名し、base64 の `TxRaw` を貼り付けて **Simulate** を選択し、ブロードキャストする前に推奨ガスリミットを確認します。

### Signing playground(テストネット専用) {#signing-playground}

**できること。** 使い捨てのハイブリッド鍵を生成し、ブラウザ内でメッセージや Sign In With QoreChain リクエストの署名と検証を行えます。

**仕組み。** 24語のフレーズがページ内で生成され、メモリ上にのみ保持されます。[QoreSign](/qoresign/overview) がそこから secp256k1 鍵と ML-DSA-87 鍵を導出します。署名は、チェーン `qorechain-diana` 向けに、同じメッセージを両方の鍵で署名したものです。使い捨ての鍵はチェーンに登録されていないため、検証にはこのセッションの ML-DSA-87 公開鍵を使用します。

**手順。**

1. **Signing playground** を開きます。「Throwaway testnet key: never use it for real funds.」という警告が表示されます。
2. **Generate throwaway key** を選択します。ページには、`qor1...` アドレス、secp256k1 公開鍵(33バイト)、ML-DSA-87 鍵(公開鍵 2592バイト、秘密鍵 4896バイト)が表示されます。**New key** で置き換えられます。
3. **Message:** テキストを入力して **Sign** を選択します。結果は JSON 形式のハイブリッド署名です。**Verify** を選択すると、「Valid signature」、または「Invalid signature」とエラーコードが表示されます。
4. **Sign In With QoreChain:** **Build message**(このサイト向けのサインインメッセージで、ドメイン、アドレス、チェーン ID、ランダムなノンス、発行時刻と有効期限を含みます)を選択し、続いて **Sign**、**Verify** を選択します。Verify は、サーバーが行うのと同じ方法で検証し、解析されたフィールドを一覧表示します。[SIWQ 仕様](/qoresign/spec/siwq-v1)と[サインインガイド](/qoresign/guides/sign-in)を参照してください。

**最小限の例。** **Generate throwaway key**、`hello` と入力、**Sign**、**Verify** の順に操作すると、「Valid signature」と表示されます。

**ネットワーク。** テストネット専用です。この鍵はメインネットでは使用できず、再読み込みすると失われます。

### QoreX test wallet(テストネット専用) {#test-wallet}

**できること。** 現在のタブに QoreX ウォレットのモックをインストールし、本物のウォレットなしで dApp の接続フローと署名フローを試せます。

**仕組み。** **Start test wallet** は、使い捨ての鍵を持つテストウォレット(公開されている `@qorechain/qorex-wallet-mock` パッケージ)を作成し、ブラウザウォレット向けの標準のウォレット検出(EIP-6963)を通じて、ページ上の dApp に「QoreX (mock)」として通知します。また `window.qorex` も公開します。自動で承認されるものはありません。トランザクションはブロードキャストしません。タブに本物の QoreX 拡張機能がある場合、モックは再読み込みするまでそれを置き換えます。

**手順。**

1. **QoreX test wallet** を開き、警告を読みます。起動のたびに、使い捨てのテストネット鍵がメモリ上に生成されます。実際の資金をそこに送らないでください。
2. **Start test wallet** を選択します。**Addresses** カードに、QoreChain Native、EVM、SVM のアドレスが一覧表示されます。
3. このタブで動作している dApp から接続するか、ブラウザのコンソールから `window.qorex` を呼び出します。
4. 各リクエストは **Waiting for approval** の下に表示されます。**Approve** または **Reject** を選択します。**Requests** リストには、すべてのリクエストの承認状態と結果が記録されます。
5. モックを削除するには、**Stop (reloads the page)** を選択します。

**最小限の例。** test wallet を起動し、同じタブで dApp を開き、その接続ダイアログで「QoreX (mock)」を選んで、接続を **Approve** します。

**ネットワーク。** テストネット専用です。

### AI agents (MCP) {#mcp}

**できること。** QoreChain MCP サーバー(MCP クライアントが QoreChain のチェーンデータを読み取り、開発者ツールを使えるようにする Model Context Protocol サーバー)のステータスと、MCP クライアントでのセットアップ方法を示します。

**仕組み。** タブを開くと、ページはパッケージレジストリにライブで問い合わせ、ステータス(**Published**)と現在のバージョン(`@qorechain/mcp`、本稿執筆時点では 0.1.0。PyPI にも `qorechain-mcp` として公開されています)を表示します。続いて、MCP クライアント向けのセットアップを、コピーできるブロックとして表示します。

- **ローカル(stdio)、主な選択肢。** `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` を、MCP クライアントのサーバー設定に追加します。キーは不要です。
- **セルフホスト(Streamable HTTP)。** `qorechain-mcp serve --port 8787` を実行し、クライアントを `http://localhost:8787/mcp` に向けます。
- **ホスト型エンドポイント。** `https://mcp.qorechain.io/mcp` は、デフォルトでテストネットを提供します。すべてのリクエストに API キーが必要で、`Authorization: Bearer <key>` ヘッダーとして送信します。キーはダッシュボードから申請してください(下記のキーの手順を参照)。ほとんどの用途では、ローカルのセットアップならキーは不要です。

**ホスト型エンドポイント用の API キー。** サインインし、タブの **API key** セクションで次の手順を行います。

1. 名前または組織名、連絡先、想定する用途、想定するリクエスト量を入力し、**Request API key** を押します。ステータスには「承認待ち」と表示されます。
2. QoreChain チームがリクエストを承認または却下します。却下された場合はそのメモが表示され、再度申請できます。
3. 承認後、**Generate key** を押します。キーは一度だけ表示され、コピーボタンと、そのまま使える設定スニペットが付きます。1〜2分以内に有効になります。QoreChain はキーのコピーを保持せず、フィンガープリント(ハッシュ)のみを保持するため、紛失したキーを再表示することはできません。そのキーを失効させ、新しいキーを申請してください。
4. **Revoke key** はいつでも利用でき、約1分で反映されます。

制限:アカウントごとに有効なキーは1つ、1秒あたり10リクエスト(バースト20)、1日あたり100,000リクエストです。

**手順。** タブを開き、ローカルの設定を MCP クライアントにコピーして再起動し、ブロックまたはアカウントを読み取るよう依頼します。ツールの詳細とオプションについては、[QoreChain MCP サーバー](/developer-tools/mcp)を参照してください。**最小限の例:** stdio のブロックをクライアントに貼り付けて再起動し、最新のブロックを尋ねます。

## アクセス方法 {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)、またはサイドバーの **Build** グループ内(およびモバイルメニュー)の **Developers**。
- **サインイン:** ページとそのツールには不要です。ホスト型 MCP エンドポイント用の API キーを申請するにはサインインが必要です。
- **ネットワーク:** **PQ key status** と **Simulator** は、タブ上のトグルでメインネットまたはテストネットを選べます(デフォルトはテストネット)。**Signing playground** と **QoreX test wallet** はテストネット専用です。**SDKs** と **AI agents (MCP)** はネットワークに依存しません。
- **ウォレット:** 不要です。ツールは自前の使い捨ての鍵を生成します。
- **費用:** 無料です。読み取りクエリと simulate 呼び出し以外は、チェーンに何も送信されません。
- **プライバシー:** 使い捨ての鍵は、ページのメモリ上にのみ存在します。本物のリカバリーフレーズをどのツールにも貼り付けないでください。

## 公開場所 {#where-published}

| サーフェス | アドレス | ネットワーク |
| --- | --- | --- |
| Developers ページ | `dashboard.qorechain.io/developers` | 読み取りツールはメインネットとテストネット、署名ツールはテストネット専用 |
| 署名ライブラリ | npm `@qorechain/qoresign`、ソース `github.com/qorechain/qoresign`、[QoreSign](/qoresign/overview) を参照 | 該当なし |
| テストウォレットパッケージ | npm `@qorechain/qorex-wallet-mock`、ソース `github.com/qorechain/qorex-integrations` | テストネット |
| パッケージ索引 | [開発者向けパッケージ](/developer-tools/overview) | 該当なし |
| MCP サーバー | npm `@qorechain/mcp` 0.1.0 と `@qorechain/qore-cli` 0.1.0、PyPI `qorechain-mcp` 0.1.0。ガイド: [QoreChain MCP サーバー](/developer-tools/mcp) | デフォルトはテストネット |

パッケージのバージョンは変わります。最新のバージョンは **SDKs** タブまたは各レジストリで確認してください。

## 制限事項と既知の問題 {#limits}

- **Transaction inspector:近日公開予定で、まだ稼働していません。** 計画している内容:ハッシュを貼り付けると、すべてのメッセージ、署名者、手数料、ポスト量子署名が署名者の登録済みの鍵に対して検証されるかどうか、そしてセキュリティ階層が表示されます。次の QoreSign のリリースとともに提供されます。
- **ホスト型の MCP エンドポイントには API キーが必要です。** ダッシュボードから申請してください(アカウントごとに有効なキーは1つ、1秒あたり10リクエスト、1日あたり100,000リクエスト)。ローカルのセットアップではキーは不要です。ほとんどの作業にはローカルのセットアップを使ってください。
- **2つのクイックスタートは「Not tested」としてマークされています。** Android 向けの QoreSign(同じコードを JVM アーティファクト上でのみ実行し、実機では実行していません)と、Python 向けの QoreSign です。残りの32件のクイックスタートは実行され、合格しました。
- **Simulator には署名済みのバイトが必要です。** 代わりに署名することはできず、ブロードキャストも行いません。
- **Playground と test wallet はテストネット専用で、** 再読み込みすると消える使い捨ての鍵を使用し、実際の資金を保持したり移動したりすることはできません。
- **同じタブにある本物の QoreX 拡張機能は、** ページを再読み込みするまで test wallet に置き換えられます。
- **読み取りは Dashboard のゲートウェイを経由します。** ご自身のコードからは、公開エンドポイントを直接呼び出してください: `api.qore.host` と `api-testnet.qore.host`。
