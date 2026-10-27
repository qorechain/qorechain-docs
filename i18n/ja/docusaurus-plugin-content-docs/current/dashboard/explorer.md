---
slug: /dashboard/explorer
title: エクスプローラー
sidebar_label: エクスプローラー
sidebar_position: 2
---

# エクスプローラー

**エクスプローラー**は、チェーンを読み取り専用で覗くための窓口です。ブロック、トランザクション、アドレス、バリデーターを検索したり、ネットワークの活動を監視したりできます。送金を確認したい方、アカウントを調べたい方、どの署名がトランザクションを保護したかを知りたい方、バリデーターセットを見たい方のためのものです。エクスプローラーは 2 つあります。`dashboard.qorechain.io/explorer` にあるダッシュボード内のものと、アカウント不要の別の公開アプリ [explore.qore.network](https://explore.qore.network) です。これらは別のアプリケーションで、ラベル付けのルールも同じではないため、このページでは両方を扱います。

## 革新的な機能 {#innovations}

- **署名ラベルは、チェーンが検証した場合にのみ表示されます。** ダッシュボードのエクスプローラーでは、ネイティブトランザクションが成功し（コード 0）、**かつ**チェーンが検証済みステータスの `pqc_hybrid_verify` イベントを発行した場合にのみ、**PQC Verified** カードが表示されます。失敗したトランザクションには、ポスト量子に関する主張は付きません。
- **EVM トランザクションは、それを承認したウィンドウを表示します。** 有効化高さ（テストネット 5,920,000、メインネット 2,981,742）以降、EVM トランザクションには「Authorised by a PQC window」と表示され、ウィンドウを開いた、ネイティブで ML-DSA-87 署名付きのトランザクションへの「Window opened by」リンクが付きます。表示されるウィンドウは、トランザクションの高さ以下で、期限切れでなく、その後閉じられていない、送信者の最新のウィンドウオープンです。EVM トランザクションに「PQC Verified」と表示されることはありません。通常の secp256k1 署名を持つためです。[EVM 承認ウィンドウ](/developer-guide/evm-development#evm-window)を参照してください。
- **ブロックごとのポスト量子ラベルはありません。** ブロックはコンセンサス鍵で署名されるため、保護はトランザクションごとに表示され、ブロックごとには表示されません。
- **バリデーターのポスト量子ステータスはチェーンから取得します。** バリデーターのアドレスページには「Post-Quantum Crypto」フィールド（Enabled、Disabled、N/A）があります。Enabled は、オペレーターが登録済みの ML-DSA-87 鍵を持っていることを意味します。所有証明はチェーン上では任意です。
- **1 つのアカウント、3 つのレール。** `qor1...` の履歴は Native、EVM、SVM の活動を統合し、アドレスページにはまだベスティング中の金額と次のアンロック日が表示されます。
- **ネットワークの情報とエンドポイントを 1 つのパネルに。** チェーン ID、EVM チェーン ID、トークン、小数桁数、アドレスプレフィックス、コインタイプ、最低ガス価格、コピー可能な公開エンドポイントと、「Add QoreChain to your wallet」パネルがあります。
- **スタンドアロンのエクスプローラーは、公開エンドポイントのみで構築されています。** [explore.qore.network](https://explore.qore.network) はチェーンの公開エンドポイントを読み取り、アカウントは不要です。そのアドレスページには、1 つのアカウントの `qor1`、`0x`、SVM の各形式が、ライブのパリティチェック（wei = uqor x 10^12、lamports = uqor x 1000）とともに表示され、そのルートはウォレットのディープリンクとして機能します。

## 使い方 {#how-to-use}

### 概要

サイドバーの **Explorer** を開きます。概要には次が表示されます。

- 「Post-Quantum Secured」チップ付きのネットワークステータス（ネットワークレベルのラベルです。トランザクションごとの主張はトランザクションページにあります）
- **Latest Block**、**Block Time**、**Blocks Today**
- **Total Bonded**、**Bonded Ratio**、**Circulating**
- **Transactions**、**Real Txs**、**Active Set**、**Total Addresses**
- **Latest Blocks** と **Latest Transactions**。更新ボタンと自動更新があります

ブロックまたはトランザクションの行をクリックすると、そのページが開きます。

### 検索

検索ボックス（プレースホルダー「Search QoreChain (Address, Tx, Block)...」）は、入力内容に応じて遷移先を決めます。

- `qor...` はアドレスページを開きます。
- `0x...` または 64 文字の文字列はトランザクションページを開きます。
- 数字はブロックページを開きます。

:::note 0x アドレスは「Transaction Not Found」に遷移します
ダッシュボードの検索は、`0x...` の入力をトランザクションハッシュとして扱います。EVM アドレスを調べるには、代わりにその `qor1...` 形式で検索するか（`0x` アドレスは、その `qor1` 形式と同じ 20 バイトです）、両方を受け付けるアドレスページを持つ [explore.qore.network](https://explore.qore.network) を使用してください。
:::

### トランザクションページ

トランザクションページには、ハッシュ（コピー付き）、ステータスとタイプ、Block Height、Interactions（From と To）、Value & Fees、Memo、Gas Consumed、存在する場合はクロスチェーンの行、そして **Raw Data** が表示されます。また、そのトランザクションが何で保護されていたかも表示され、チェーンが裏付けている内容についてのみ主張します。

- **PQC Verified。** 成功したネイティブレーンのトランザクションで、チェーン自身がそのハイブリッド署名（ML-DSA-87 部分を含む）を検証したもの。失敗したトランザクション、またはハイブリッド署名が検証されていないトランザクションには、代わりに標準のセキュリティが表示されます。
- **Authorised by a PQC window。** 送信者が開いている [EVM 承認ウィンドウ](/developer-guide/evm-development#evm-window)を持っているときに送信された EVM トランザクション。**Window opened by** リンクが付きます。

### ブロックページ

前へ・次への矢印で、チェーンをたどれます。**Core Information** には高さ、ハッシュ、プロポーザー、署名数、Gas Used があり、**Technical Hashes** と **Block Transactions** が続きます。ブロックにポスト量子のラベルはありません。

### アドレスページ

QoreChain のアドレスは、Native（`qor1...`）、EVM（`0x...`）、SVM（base58）という 3 つのエンコーディングを持つ 1 つのアカウントであり、アドレスページは 3 つすべての活動を統合します。

- **Copy address** と **Show QR Code**（ポップオーバーです。ダウンロードはありません）。
- **Total Balance** と **Available**、そしてまだベスティング中の金額と次のアンロック日の行。
- **Total Activity** と統合された履歴（Transfer、Faucet Claim、Cross-Chain Swap などのメソッド）。
- バリデーターのアドレスページ（`/explorer/address/qorvaloper1...`）には、**Post-Quantum Crypto** フィールド。

### バリデーター {#validators}

`/explorer/validators` はネットワークのバリデーターを一覧表示します。サマリーカードには **Active Validators**、**Bonded Tokens**、**Consensus Health**（測定値ではなくステータスラベル）が表示されます。テーブルには Rank、Validator、Voting Power、Commission、Status、PQC があります（テーブルの PQC 列はすべての行で薄く表示されます。実際のステータスはバリデーターのアドレスページを使用してください）。検索ボックスには「Search validator...」と表示されます。一覧はヘッダーで選択したネットワークに従います。デリゲートするには [ステーキングとバリデーター](/dashboard/staking-and-validators) を、利回りとサインインを含むより広い比較については [Validators](/dashboard/validators) を参照してください。

### ネットワークの情報とウォレットへの追加

概要には、チェーンの情報と公開エンドポイントがそれぞれコピー可能な形で載っており、Wallet ページと同じ **Add QoreChain to your wallet** パネルがあります（[Add QoreChain to your wallet](/dashboard/wallet#add-network) を参照）。

### スタンドアロンのエクスプローラー {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) は、エクスプローラー専用の別のウェブアプリです。**メインネット**で開き、ヘッダーに **Testnet / Mainnet** の切り替えがあります。ルート:

| ルート | 表示内容 |
| --- | --- |
| `/` | ライブの高さ、ステータス、供給量、ボンドされたステーク、最新のブロックとトランザクション、チェーンの情報、公開エンドポイント、ガイドへのリンク。 |
| `/blocks`、`/block/{height}` | ブロック一覧と、そのトランザクションを含むブロック。 |
| `/txs`、`/tx/{hash}` | トランザクション一覧と、ステータス、手数料、ガス、メッセージ、生のレスポンスを含むトランザクション。 |
| `/address/{qor1... or 0x...}` | 3 つのエンコーディングとパリティチェックを備えた統合アイデンティティページ。`/account/*` は `/address/*` にリダイレクトされます。 |
| `/validators`、`/validator/{address}` | 投票権とコミッションを含むバリデーターセットと、個別のバリデーター。 |
| `/tokens`、`/token/{denom}`、`/assets` | トークンとアセットの一覧。 |
| `/contracts`、`/nfts`、`/collections` | コントラクト、NFT、コレクション。 |

検索は、ブロック高、64 桁の 16 進ハッシュ（`0x` の有無は問いません）、`qor1...` または `0x...` アドレス、`qorvaloper1...` アドレスを受け付けます。`qorvaloper1...` の検索は、そのバリデーターのページではなく、バリデーター一覧を開きます。**Add to wallet** セクションでは、suggestChain（Keplr、Leap、Cosmostation）、EIP-3085（MetaMask とその他の EVM ウォレット）、SVM のカスタム RPC の手順、WalletConnect v2 のペアリングを提供します。

`/tx/`、`/block/`、`/address/` のルートは EIP-3085 のブロックエクスプローラーリンクに対応しているため、エクスプローラーの URL を開くウォレットは正しいページに到達します。

:::caution エクスプローラーの /api/lcd をコードから使用しないでください
スタンドアロンのエクスプローラーには、自身のページを提供する読み取り専用のプロキシ `/api/lcd/...` があり、ブラウザのネットワーク Cookie に従って応答します。これは公開 API ではありません。変更される可能性があり、プログラムからの利用を想定したレート計画もなく、Cookie が指定するネットワークを返します。スクリプト、サービス、ウォレットでは、代わりに公開 REST エンドポイントを使用してください。`https://api.qore.host`（メインネット）と `https://api-testnet.qore.host`（テストネット）です。[REST と gRPC エンドポイント](/api-reference/rest-grpc-endpoints)を参照してください。
:::

:::note スタンドアロンのエクスプローラーは、ダッシュボードの PQC ラベル付けルールをまだ適用していません
[革新的な機能](#innovations)にあるルール（チェーンによる検証後にのみポスト量子ラベルを表示すること、EVM トランザクションの「Authorised by a PQC window」カード）は、ダッシュボードのエクスプローラーで稼働しています。explore.qore.network のスタンドアロンのエクスプローラーはそれらに対応する更新がまだ行われておらず、そのトランザクションページには失敗したトランザクションをまだ区別しないハイブリッド署名マーカーが表示され、EVM トランザクションには以前の表現でラベルが付きます。ダッシュボードのエクスプローラーのラベルを基準としてください。
:::

## アクセス方法 {#how-to-access}

- **ダッシュボードのエクスプローラー:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer)。ヘッダーでネットワークを選択します。メインネットの**概要**にはサインインと[1 回限りの承認](/dashboard/overview#risk-acknowledgement)が必要です。テストネットの概要と、両ネットワークの**すべての詳細ページ**（トランザクション、ブロック、アドレス、バリデーター）は、アカウントなしで開けます。
- **スタンドアロンのエクスプローラー:** [explore.qore.network](https://explore.qore.network)。アカウントもウォレットも不要です。テストネットにはヘッダーの切り替えを使用します。
- **費用:** 無料です。何かを読み取るのにウォレット接続は必要ありません。

## 公開場所 {#where-published}

| 提供面 | アドレス | ネットワーク | アカウント |
| --- | --- | --- | --- |
| ダッシュボードのエクスプローラー | `dashboard.qorechain.io/explorer`（`/explorer/tx/<hash>`、`/explorer/block/<height>`、`/explorer/address/<address>`、`/explorer/validators`） | メインネットとテストネット、ヘッダーで切り替え | メインネットの概要のみ |
| スタンドアロンのエクスプローラー | `explore.qore.network` | メインネット（デフォルト）とテストネットの切り替え | なし |
| チェーンデータ | `api.qore.host`、`api-testnet.qore.host`（REST）、`rpc.qore.host`、`rpc-testnet.qore.host`（RPC） | メインネットとテストネット | なし |

## 制限事項と既知の問題 {#limits}

- **ダッシュボードの検索に入力した `0x` アドレス**は「Transaction Not Found」に遷移します。`qor1...` 形式を使用してください。
- ダッシュボードのバリデーターテーブルの **PQC 列**は常に薄く表示されます。バリデーターの実際のステータスはそのアドレスページにあります。
- **表示されないもの:** トランザクションごとのウィンドウ使用回数カウンター、ブロックのポスト量子証明、バリデーターテーブルでのバリデーターごとのポスト量子フラグ。
- **スタンドアロンのエクスプローラー**は、ダッシュボードのラベル付けルールをまだ採用していません（上記を参照）。また、`qorvaloper1...` の検索はバリデーター一覧を開きます。
- **スタンドアロンのエクスプローラーの /api/lcd** はサイト自身のためのもので、プログラム向けではありません。
- ダッシュボードのエクスプローラーでは**ネットワークはヘッダーに従う**ため、もう一方のネットワークのハッシュは「not found」と表示されます。
