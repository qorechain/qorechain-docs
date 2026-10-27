---
slug: /dashboard/overview
title: ダッシュボードの概要とはじめに
sidebar_label: 概要とはじめに
sidebar_position: 1
---

# ダッシュボードの概要とはじめに

**[dashboard.qorechain.io](https://dashboard.qorechain.io)** にある QoreChain ダッシュボードは、ブラウザから QoreChain を利用するための公式ウェブアプリです。1 つのアカウントとネットワークの切り替え 1 つで、エクスプローラー、ウォレットビュー、テストネットのフォーセット、テストトークンのスワップ画面、クエスト、AI コントラクトツール、ノードとバリデータ向けのツール、開発者ページが使えます。何もインストールせずにネットワークを試したい方や、開発中にすばやく確認したいビルダーのためのものです。インストールは不要で、ブラウザ内で動作します。

このセクションはユーザー向けのハウツーです。各ページが何をするものか、どのように開くか、どのような制限があるかを説明します。

## 革新的な機能 {#innovations}

- **1 つの切り替えで全ページのネットワークが決まります。** ヘッダーの **Testnet / Mainnet** コントロールが選択内容をブラウザに保存してページを再読み込みするため、サーバーとブラウザは同じネットワークを読み取ります。デフォルトはメインネットです。
- **メインネットはノンカストディアルです。** ダッシュボードがメインネットの鍵を保持することも、メインネットのトランザクションに署名することもありません。QoreX に渡すのは送金またはステーキング操作のパラメータだけで、トランザクションの再構築、表示、署名 (ML-DSA-87 ハイブリッド署名)、ブロードキャストは QoreX が行います。ダッシュボードが知るのはトランザクションハッシュだけです。
- **メインネットのビューにはアカウントが必要で、テストネットは公開されています。** メインネットでは、ホームの統計、Wallet、Trade、Explorer の概要がサーバー側でアクセスを確認します。サインインしていない訪問者には「Sign in to view mainnet」と表示されます。
- **実資金に関する承認は、ブラウザごとに 1 回です。** ブラウザで初めてメインネットの Wallet、Trade、Explorer の概要、ホームの統計を表示する前に、「You're entering QoreChain Mainnet」というカードが 4 つのポイントを示します。ダッシュボードはノンカストディアルであること、トランザクションは確定的で取り消せないこと、全損のリスクがあり、ここにある内容は金融アドバイスではないこと、そしてテストネットの QOR は決して交換できないことです。承認はアカウントではなくブラウザに保存されます。
- **1 つのアカウント、3 つのエンコーディング。** 同じアカウントが `qor1...` アドレス、`0x...` アドレス、SVM の base58 アドレスで表示され、ダッシュボードは残高と履歴を `qor1...` を通じて 1 回だけ読み取ります。

## 使い方 {#how-to-use}

### レイアウト

**ヘッダー。** ネットワークの切り替え、続いて **Sign In** またはプロフィールメニュー (Profile、Edit Profile、Theme、Language、Rewards、Referral、Docs、Log out) があります。

**デスクトップのサイドバー (順番どおり):**

| エントリ | ページ | 内容 |
| --- | --- | --- |
| **Discover** | `/` | ホーム: ヒーローボタン **Create Smart Contract** と **Explore Network**、「Dashboard Overview」のカウンター、作成されたコントラクトの一覧、最新の公開監査、トップコントリビューター、そして **Start Generating**、**New Audit**、**Claim Tokens** を備えた「Developer Toolkit」。 |
| **Public Sale** | `/public-sale` | 既存の参加者は、割り当て、ベスティングのタイムライン、クレームを確認できます。 |
| **Wallet** | [Wallet](/dashboard/wallet) | 残高、履歴、受け取り、そして (メインネットでは) QoreX を通じた送金とステーキング。 |
| **Faucet** | [Faucet](/dashboard/faucet) | 無料のテストネットトークン。 |
| **Explorer** | [Explorer](/dashboard/explorer) | ブロック、トランザクション、アドレス、バリデータ。 |
| **Trade** | [Trade](/dashboard/trade) | テストトークンのスワップ画面。 |
| **Earn** グループ | [Quests](/dashboard/quests) | Quests、Leaderboard、Badges。 |
| **Games** | [Quests](/dashboard/quests#games) | QoreChain Arcade。 |
| **Build** グループ | [Smart Contract Creator](/dashboard/smart-contract-creator)、[Contract Auditor](/dashboard/contract-auditor)、[Nodes & Validators](/dashboard/tools-hub) (`/tools`)、[Developers](/dashboard/developers) | コントラクトツール、オペレーター向けページ（5 つのタブ: Validator Program、Validator Application、Light Node、Node Registration、Rollups）、公開の開発者ページ（6 つのタブ: SDKs、PQ key status、Simulator、Signing playground、QoreX test wallet、AI agents (MCP)）。Nodes & Validators のエントリは以前「Tools」というラベルでした。その SDK タブは Developers に移動しました。 |
| **FAQ** | `/faq` | アプリ内ヘルプ。一部は古くなっています。リファレンスはこのマニュアルです。 |

[Validators](/dashboard/validators) ページ (`/validators`) にはサイドバーのリンクがありません。アドレスを指定して開いてください。

**モバイル。** 下部のバー (Discover、Wallet、Faucet、続いて Explorer、Trade、Quests) と、残りを収めた中央のファンメニュー。

### サインインする {#sign-in}

ダッシュボードには 2 つの層があります。サインインする**ダッシュボードアカウント**と、それに接続する**ウォレット**です。閲覧にウォレットは不要です。

- **ページが読み込まれる前にサインインへリダイレクトされるもの:** Profile、[Wallet](/dashboard/wallet)、Rewards、Referral、[Quests](/dashboard/quests)、[Trade](/dashboard/trade)、[Faucet](/dashboard/faucet)、Connection、Contracts、Public Sale、そして保存されたすべてのコントラクトページ `/smart-contract-creator/<id>`。
- **サインアウト状態のとき「Authentication Required」画面が表示されるもの:** [Nodes & Validators](/dashboard/tools-hub)、[Validators](/dashboard/validators)、FAQ、[AI Audit](/dashboard/contract-auditor)、Badges、Leaderboard、Games。
- **アカウントなしで開けるもの:** Discover ホーム、両ネットワークの [Explorer](/dashboard/explorer) 詳細ページ (トランザクション、ブロック、アドレス、バリデータ)、テストネットの Explorer 概要、[Smart Contract Creator](/dashboard/smart-contract-creator) のランディングページ (無料で 1 回生成できます)、`/audits` の監査一覧と公開された監査レポート、そして [Developers](/dashboard/developers) ページ。
- **サインアウト状態でのメインネット:** メインネットのデータを表示するページ (ホームのカウンター、Wallet、Trade、Explorer の概要) には「Sign in to view mainnet」と **Sign In** ボタンが表示されます。

### ネットワークを選択する {#select-network}

ヘッダーには現在接続しているネットワークが表示され、切り替えることもできます。選択内容はブラウザに記憶されます。

| ネットワーク | チェーン ID | 使いどころ |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | 実際の価値を扱う稼働中のネットワーク (2026 年 6 月 7 日から稼働、2026 年 10 月 23 日からチェーン v3.2.4 を実行)。ノンカストディアルで、自分自身のウォレットを接続します。 |
| **Testnet** | `qorechain-diana` | 無料の環境 (2026 年 10 月 27 日からチェーン v3.2.6 を実行)。ダッシュボード管理のテストウォレットと [Faucet](/dashboard/faucet) が利用できます。 |

ネイティブトークンは **QOR** (基本単位は `uqor`、1 QOR = 10^6 uqor) です。初めての場合はテストネットから始め、Faucet でトークンを受け取り、最初の送金を試してからメインネットへ移行してください。

一部のページは切り替えに従いません。Faucet は常にテストネットで支払い、[Trade](/dashboard/trade) は常にテストネットの内容を表示し、Quests、Badges、Leaderboard、Games、Public Sale、FAQ はネットワークに依存しません。

### ウォレットを接続する {#connect-your-wallet}

- **メインネットはノンカストディアルです。** **QoreX** (QoreChain の公式ウォレット、拡張機能またはアプリ)、**Keplr**、**MetaMask** のいずれかを接続します。Native レールでの送金とステーキングには QoreX が必要です。QoreChain のアカウントはポスト量子ハイブリッド署名で署名しますが、現時点でこれを生成できるのは QoreX だけだからです。Keplr は接続して Native レールで閲覧と受け取りができます。MetaMask は EVM レールに接続されます。そこから送金するには、アカウントのポスト量子鍵と、QoreX から開いた EVM ウィンドウも必要です ([MetaMask で送金する](/dashboard/wallet#send-metamask) を参照)。
- **テストネットはカストディアルです。** ダッシュボードがテストウォレットを管理してくれるため、インストールするものはなく、実際の価値が危険にさらされることもありません。

#### QoreX で接続する (推奨) {#connect-qorex}

1. [dashboard.qorechain.io](https://dashboard.qorechain.io) を開き、ヘッダーに **Mainnet** と表示されていることを確認します。
2. このブラウザでメインネットのページを初めて開く場合は、[1 回限りのリスク承認](#risk-acknowledgement)に同意します。
3. **Wallet** を開き (サインインが必要です)、**QoreX wallet** カードの **Connect with QoreX** を選択します。
4. QoreX のブラウザ拡張機能が検出され、保存された方法がない場合、ダッシュボードは「How do you want to connect?」と尋ね、**Browser extension** と **QoreX app** を示します。選択は保存されます。拡張機能が検出されない場合は、そのままアプリのフローに進みます。
   - **Browser extension:** 拡張機能のポップアップに、リクエスト元のサイトとして `dashboard.qorechain.io` が表示されます。承認してください。これはあなたが `qor1...` アドレスを所有していることを証明する 1 回限りの署名で、資金は移動しません。
   - **QoreX app:** ダッシュボードに QR コードと **Open QoreX** が表示されます。スキャンまたはタップし、QoreX でペアリングリクエストを確認して生体認証で承認します。ダッシュボードはポーリングし ("Waiting for approval in QoreX...")、自動的に完了します。
   - **Use a different method** リンクは、ペアリングが保留中の間だけ表示されます。
5. 承認されると、ダッシュボードに `qor1...` アドレスが表示され、署名が必要な操作が利用可能になります。

接続と送金の詳しい手順は [Wallet](/dashboard/wallet#mainnet) を、同じペアリングをウォレット側から見た説明は QoreX ドキュメントの [Account & Dashboard](/qorex/account-and-dashboard#dashboard) ページを参照してください。

#### Keplr または MetaMask で接続する

1. ヘッダーが **Mainnet** で、承認に同意済みの状態で、**Wallet** を開きます。
2. **or connect another wallet** の下で、**Connect Keplr** または **Connect MetaMask** を選択します。
3. ウォレット側で接続を承認します。ウォレットがまだ QoreChain を認識していない場合は、[Add QoreChain to your wallet](/dashboard/wallet#add-network) を参照してください。

接続が完了すると、Wallet ページにアドレスが残高と履歴とともに表示されます。初回セットアップの手順は [Wallet Setup](/getting-started/wallet-setup) を参照してください。

### 1 回限りのリスク承認 {#risk-acknowledgement}

承認カードは、ブラウザで初めてメインネットの **Wallet**、**Trade**、**Explorer の概要**、**ホームの統計**を表示する前に現れます。すべてのメインネットのページで必要なわけではありません。Explorer の詳細ページ、Creator、その他のページは承認なしで開きます。ブラウザごとに 1 回同意してください。ブラウザのデータを消去すると、再び表示されます。

## アクセス方法 {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io)、最新のどのブラウザでも利用できます。インストールは不要です。
- **アカウント:** サインインページで、メールまたは対応する ID プロバイダーでサインインします。どのページで必要かは[サインインする](#sign-in)に記載されています。
- **ネットワーク:** メインネット `qorechain-vladi` とテストネット `qorechain-diana`。ヘッダーの切り替えで選びます。デフォルトはメインネットです。
- **ウォレット:** 閲覧には不要です。メインネットの送金とステーキングには QoreX、閲覧と受け取りには Keplr または MetaMask が必要です。テストネットでは、ダッシュボードがテストウォレットを作成します。
- **費用:** ダッシュボードの利用は無料です。オンチェーンの操作にはネットワーク手数料 (ガスあたり最低 0.1 uqor) がかかります。一部の有料項目は、それぞれのページで説明されています ([Nodes & Validators](/dashboard/tools-hub) のライトノードライセンスとバリデータプログラム料金)。
- **早期アクセスのゲート:** 現在はありません。メインネットのページに必要なのは、(上記に挙げた場合の) サインインと 1 回限りの承認だけです。

## 公開場所 {#where-published}

| 提供面 | アドレス | ネットワーク | サインイン |
| --- | --- | --- | --- |
| ダッシュボード | [dashboard.qorechain.io](https://dashboard.qorechain.io) | メインネットとテストネット | ページごと、[サインインする](#sign-in)を参照 |
| スタンドアロンのエクスプローラー | [explore.qore.network](https://explore.qore.network) (別のアプリです。[Explorer](/dashboard/explorer#standalone-explorer) を参照) | メインネットとテストネット | なし |
| 公開エンドポイント | `rpc.qore.host`、`api.qore.host`、`evm.qore.host`、`svm.qore.host`、および `*-testnet` の各バリアント | メインネットとテストネット | なし |

このセクションのページ: [Explorer](/dashboard/explorer)、[Wallet](/dashboard/wallet)、[Trade](/dashboard/trade)、[Bridge](/dashboard/bridge)、[Smart Contract Creator](/dashboard/smart-contract-creator)、[Contract Auditor](/dashboard/contract-auditor)、[Staking & Validators](/dashboard/staking-and-validators)、[Validators](/dashboard/validators)、[Faucet](/dashboard/faucet)、[Quests, Badges, Leaderboard and Games](/dashboard/quests)、[Nodes & Validators](/dashboard/tools-hub)、[Developers](/dashboard/developers)。

## 制限事項と既知の問題 {#limits}

- **Bridge 画面はありません。** [Bridge](/dashboard/bridge) を参照してください。
- **Trade はネットワークの切り替えに従いません。** ヘッダーが Mainnet でも、テストネットの内容を表示します。[Trade](/dashboard/trade) を参照してください。
- **アプリ内の FAQ は短いヘルプページです。** FAQ とこのマニュアルの内容が異なる場合は、このマニュアルに従ってください。
- **まだ提供されていないもの:** Developers ページの Transaction inspector。
- **メインネットの制限。** メインネットでのステーキング、送金、コントラクトのデプロイはページごとに説明されています。いくつかのフロー (Native や SVM のデプロイ、再委任、タイムロック付きステーキング) は、ダッシュボードでは提供されていません。
- **テストネットに実際の価値はありません。** 実際の QOR をテストネットのアドレスに送らないでください。形式は同一です。[Wallet](/dashboard/wallet#testnet) を参照してください。

:::tip QoreChain は初めてですか？
[Connecting to Testnet](/getting-started/connecting-to-testnet) と [Your First Transaction](/getting-started/first-transaction) に沿ってまず手を動かし、その後戻ってきてダッシュボードの残りを探索してください。
:::
