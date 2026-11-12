---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook は、QoreChain の EVM テストネット上にあるオンチェーンのゲストブックです。誰でも、1アドレスにつき1回、最大140文字のメッセージで署名できます。構成は2つの部分です:

- **`contracts-app/`**: Solidity コントラクトと Hardhat プロジェクト。デプロイでき、ターミナルから署名もできます。
- **`web/`**: ブラウザーで開く Web ページ。QoreX ウォレットを接続し、アカウントの EVM ウィンドウを表示し、最新の署名をリアルタイムで一覧表示します。

このガイドは初心者向けです。すべてのコマンドを説明し、各ステップの最後に、表示されるはずの内容を示します。

**所要時間:** 初回は約35分です。コントラクトの部分に20分、Web ページに15分かかります。

## 示すこと {#shows}

- **気づかないうちにハイブリッド署名するブラウザー dApp。** このページは、普通の wagmi と RainbowKit のアプリです。QoreX が署名のポスト量子の半分（ML-DSA-87）を追加するので、同じトランザクションが、従来型の鍵（secp256k1）とポスト量子鍵の両方で保護されます。
- **EVM ウィンドウが画面上で見えます。** ページはチェーンからアカウントのウィンドウを読み取り、それが有効かどうか、ブロック数とトランザクション数があと何件残っているかを表示します。
- **読んで分かる拒否理由。** チェーンが書き込みを拒否すると、ページはそのエラーを4つの原因（登録済みの鍵がない、ウィンドウがない、ウィンドウを使い切った、パラメータが無効）のどれかに対応づけ、対処方法を表示します。
- **チェーン上で検証されるハイブリッド署名。** あなたが書き込む署名はそれぞれ、チェーンが両方の署名を確認したうえで受け付けた、1つのトランザクションです。

## 始める前に {#prerequisites}

このガイドのターミナルの部分では、使い捨てのテストネットアカウントを使います。本物のウォレットや本物の資金は決して使わないでください。テストネットの QOR に価値はありません。

ターミナルが必要です。macOS では**ターミナル**を開きます。Windows では **PowerShell**（または Git に付属する **Git Bash**）を開きます。Linux では任意のターミナルを開きます。次の3つのツールをインストールします。確認コマンドがすでに適切なバージョンを表示するなら、インストールは省略して構いません。

### Node.js 22 以降

Node.js は、お使いのコンピューターで JavaScript を実行します。Hardhat 3 には Node.js 22 以降が必要です。

| システム | インストール | 確認 |
| --- | --- | --- |
| macOS | `brew install node`（[Homebrew](https://brew.sh) が必要）、または https://nodejs.org からダウンロード | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`、または https://nodejs.org からダウンロード | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash` を実行し、新しいターミナルを開いて、`nvm install 22` を実行 | `node --version` |

表示されるはずの内容: `v22` かそれ以上で始まる数字。Windows では、インストール後に PowerShell を閉じて開き直してください。

### pnpm

pnpm は、プロジェクトに必要なライブラリをダウンロードします。Node.js には含まれていないので、どのシステムでも自分でインストールします。

```sh
npm install -g pnpm
```

| 部分 | 意味 |
| --- | --- |
| `npm` | Node.js に付属するツール。ほかのツールをインストールします。 |
| `install` | ダウンロードしてインストールする。 |
| `-g` | グローバル。1つのフォルダーだけでなく、コンピューター全体にインストールする。 |
| `pnpm` | インストールするツール。 |

`pnpm --version` で確認します。`9.12.0` のような数字（9 以上）が表示されるはずです。`pnpm: command not found` と表示された場合は、上のインストールコマンドを実行し、新しいターミナルを開いてください。macOS や Linux で `EACCES: permission denied` と表示された場合は、`sudo npm install -g pnpm` を使います。

### Git

| システム | インストール | 確認 |
| --- | --- | --- |
| macOS | `xcode-select --install` または `brew install git` | `git --version` |
| Windows | `winget install Git.Git`、または https://git-scm.com からダウンロード | `git --version` |
| Linux | `sudo apt install git`（Debian、Ubuntu）または `sudo dnf install git`（Fedora） | `git --version` |

表示されるはずの内容: `git version 2.` と数字。

## テストネットウォレット {#wallet}

このガイドでは2つのアカウントを使います。意図的に別のアカウントにしています:

1. ターミナルの部分（ステップ3から6）で使う**鍵ファイルのアカウント**。ガイドが作ります。コントラクトをデプロイします。
2. Web ページ（ステップ8と9）で使う **QoreX アカウント**。Web ページはこれで署名します。

**テストネット上の QoreX。** [QoreX](/qorex/overview) は QoreChain のウォレットです。Web ページにはブラウザー拡張機能を使います（[QoreX 連携](/developer-tools/qorex-integrations)を参照）。使うブラウザーにインストールしてから、次を行います:

- **QoreX ブラウザー拡張機能:** ロックを解除し、下部のバージョン番号を7回タップして、**Switch to testnet (diana)** を選びます。
- **スマートフォンの QoreX アプリ:** 設定を開き、**Use testnet (developers)** を選びます。
- EVM レーンでは、**Add an Ethereum account (coin 60)** を選びます。Web ページには coin 60 のアカウントが必要です。

**フォーセット**は、テストネットの QOR を無料で配ります: https://dashboard.qorechain.io/faucet。サインインし、アドレスを貼り付けて、リクエストします。アカウントごとに24時間に 100 QOR を受け取れます。

**金額について。** QOR はコインです。`uqor` はその最小単位です。1 QOR = 1,000,000 uqor。新しいアカウントの最初のトランザクションでポスト量子鍵が登録され、約 0.09 QOR の1回限りの手数料がかかります。

## パート1: コントラクト {#contract}

### 1. コードを入手する {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**このコマンドの働き**

- `git clone <address>` は、GitHub からプロジェクトを、`build-before-qday` という新しいフォルダーにダウンロードします。
- `cd <folder>` は、ターミナルを Guestbook のプロジェクトに移動します。中には `contracts-app` と `web` の2つのフォルダーがあり、それぞれ別にセットアップします。

**表示されるはずの内容:** `Cloning into 'build-before-qday'...`。**所要時間:** 数秒。

### 2. ライブラリをインストールしてテストする {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**このコマンドの働き**

- `cd contracts-app` は、コントラクトのフォルダーに入ります。
- `pnpm install` は、`package.json` に書かれたライブラリ（Hardhat と QoreChain SDK）をダウンロードします。
- `pnpm test` は、コンピューターの中にある模擬チェーン上で、コントラクトの検査を実行します。鍵もネットワーク上のアカウントも必要ありません。初回は Solidity コンパイラーをダウンロードします。

**表示されるはずの内容:** パッケージの一覧、数秒の `Done in`、そのあと3つのチェックマーク付きの `QDayGuestbook` と `3 passing`。**所要時間:** 約1分。

### 3. 鍵ファイルを作る {#step-account}

プロジェクトは、秘密の情報を `.env` という名前のファイルから読み取ります。テンプレートから作成します。

macOS、Linux、Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**このコマンドの働き**

- `cp`（または `copy`）は、テンプレート `.env.example` を、新しいファイル `.env` にコピーします。

`.env` ファイルはあなたの**鍵ファイル**です。`contracts-app` フォルダーの中にしかありません。**決して共有せず、Git にコミットせず、これらの鍵を本物のウォレットに再利用しないでください。** プロジェクトは、すでに Git で `.env` を無視する設定になっています。好きなテキストエディターで開き（macOS は `open -e .env`、Windows は `notepad .env`、Linux は `nano .env`）、2つの値を記入します。

**a. 使い捨ての秘密鍵。**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**このコマンドの働き**

- `node -e "..."` は、JavaScript を1行だけ実行します。その1行は、ランダムな32バイトを作り、先頭に `0x` を付けて16進数で表示します。これが秘密鍵です。

**表示されるはずの内容:** 1行。`0x` に続く64文字の英数字。これを `.env` に `PRIVATE_KEY=0x...` としてコピーし、ゼロだけのプレースホルダーと置き換えます。

**b. ポスト量子のリカバリーコード。**

```sh
pnpm window recovery-code
```

**このコマンドの働き**

- `pnpm window` は、ヘルパースクリプト `scripts/window.ts` を実行します。その後ろの単語がコマンドです。
- `recovery-code` は、アカウントの ML-DSA-87 鍵の元になる、新しいランダムなコードを表示します。

**表示されるはずの内容:** `QRC1-` で始まる1行。これを `.env` に `QORE_PQC_RECOVERY_CODE=QRC1-...` としてコピーします。このアカウントでは同じコードを保管してください。新しいコードにすると、ポスト量子鍵が別のものになります。

`QORE_MNEMONIC` は空のままにし（ニーモニックは、12語または24語のフレーズで、上の2つの値の代わりになります。どちらか一方を使い、両方は使わないでください）、`QORE_NETWORK=testnet` はそのままにします。これは、ヘルパーにテストネットを使わせる設定です。`.env` は次のようになります（プレースホルダーで示しています）:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

ファイルを保存します。

### 4. アカウントに入金する {#step-faucet}

```sh
pnpm window status
```

**このコマンドの働き**

- あなたのアカウント、ポスト量子鍵が登録済みかどうか、EVM ウィンドウがあるかどうかを表示します。

**表示されるはずの内容:** `account:  0x...  (qor1...)`、続いて `PQC key:  not registered` と `window:   none`。`qor1...` アドレスをコピーします。そのあと:

1. https://dashboard.qorechain.io/faucet を開き、サインインします。
2. ページが **Testnet** になっていることを確認します。
3. `qor1...` アドレスを貼り付けて、QOR をリクエストします（アカウントごとに24時間に1回、100 QOR）。
4. 約10秒待ちます。https://explore.qore.network（Testnet）であなたのアドレスを検索すると、残高が表示されます。

### 5. 鍵を登録し、ウィンドウを開き、デプロイする {#step-window}

```sh
pnpm window register
```

**このコマンドの働き**

- ML-DSA-87 公開鍵をチェーンに、アカウントごとに1回送ります。チェーンにはまだ照合先の鍵がないので、ポスト量子署名なしでチェーンが受け付ける唯一のメッセージです。費用は約 0.09 QOR です。

**表示されるはずの内容:** `registered: ` とトランザクションハッシュ。

```sh
pnpm window open
```

**このコマンドの働き**

- 両方の鍵で署名した（ハイブリッド）トランザクションを1つ送り、EVM 認可ウィンドウを開きます。ウィンドウが有効な間は、通常の EVM トランザクションが許可されます。デフォルトでは 600 ブロックの間、5 件のトランザクションを許可します。

**表示されるはずの内容:** `opened: ` とトランザクションハッシュ、続いて `window: 600 blocks, 5 txs, ...`。最後のステップのために、**このハッシュをコピーしてください。**

```sh
sleep 10
```

**このコマンドの働き**

- 10秒待ちます（PowerShell と Git Bash でも動きます）。ウィンドウを開くとアカウントのトランザクションカウンターが変わるので、次のコマンドは新しい値を読み取る必要があります。

```sh
pnpm deploy:testnet
```

**このコマンドの働き**

- コントラクトをデプロイするツールである Hardhat Ignition を、モジュール `QDayGuestbook`、ネットワーク `qorechainTestnet`（チェーン ID 9800、QoreChain テストネット）で実行します。
- 確認を求められます。`y` と入力して Enter を押します。

**表示されるはずの内容:** `QDayGuestbookModule#QDayGuestbook` で終わる行と、コントラクトのアドレス `0x...`。**このアドレスをコピーしてください。** Web ページで必要になります。**所要時間:** 約30秒。

### 6. ターミナルから署名する {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**このコマンドの働き**

- `pnpm sign "<message>"` は、ゲストブックに1件の記入を書き込みます。引用符の中の文章があなたのメッセージで、最大140文字です。
- `pnpm sign --read` は読み取り専用です。最新の記入を一覧表示するだけで、何も送りません。

**表示されるはずの内容:** 最初のコマンドのあとに `tx: 0x...` と `status: success in block ...`。2つ目のコマンドのあとに `guestbook 0x...: 1 signatures`、そしてあなたのメッセージと、時刻、あなたのアドレス。

各アドレスが署名できるのは1回だけです。同じアカウントで2回目の `pnpm sign` を行うと、コントラクトが `AlreadySigned` で拒否します。

## パート2: Web ページ {#web}

### 7. ページをインストールして設定する {#step-web}

同じプロジェクトフォルダーで、2つ目のターミナルウィンドウを開くか、`cd ..` で戻ります。そのあと:

```sh
cd web
pnpm install
```

**このコマンドの働き**

- web フォルダーに入り、そのライブラリ（React、wagmi、RainbowKit、Vite）をダウンロードします。

**表示されるはずの内容:** パッケージの一覧と、数秒の `Done in`。

ページの設定ファイルを作ります。macOS、Linux、Git Bash では `cp .env.example .env`、Windows PowerShell では `copy .env.example .env` です。エディターで `web/.env` を開き、ステップ5でコピーしたコントラクトのアドレスを設定します:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID` は空のままにします。`src/wagmi.ts` に WalletConnect ウォレットを追加する場合にのみ必要です。

### 8. ページを起動して QoreX を接続する {#step-run}

```sh
pnpm dev
```

**このコマンドの働き**

- お使いのコンピューター上で、小さな Web サーバー（Vite）を起動します。ページは `http://localhost:5174` にあります。このサーバーは、`/lcd` で始まるリクエストを、公開テストネットの REST サーバーに転送もします。ブラウザーはそのサーバーを直接呼び出せない（CORS ヘッダーを送ってこない）ため、このプロキシがページの代わりに呼び出します。
- このコマンドは動き続けます。このターミナルは開いたままにしてください。あとで止めるときは `Ctrl+C` を押します。`web/.env` を変更した場合は、止めてからもう一度起動してください。

**表示されるはずの内容:** `VITE ... ready` と `Local: http://localhost:5174/`。

次に、QoreX がインストールされているブラウザーで:

1. http://localhost:5174 を開きます。
2. QoreX のロックが解除され、テストネットに切り替わっていること（上の「テストネットウォレット」を参照）、そしてフォーセットで QOR を入手した coin 60 のアカウントがあることを確認します。QoreX が両方の形式のアドレスを表示する場合は、フォーセットのページでは `qor1...` 形式を使ってください。
3. ページのカード1で、**Connect QoreX**（接続ボタン）を選びます。QoreX が最初に表示されない場合は、ウォレットの一覧から選んでください。
4. QoreX が接続の可否を尋ねるウィンドウを開きます。承認します。

**表示されるはずの内容:** カード1に、あなたの `0x...` アカウント、チェーン `qorechain-diana EVM (9800)`、残高、そして EVM ウィンドウが表示されます。新しいアカウントでは `no window open` です。カード3には `On chain now: 1 signatures` と、ステップ6で書き込んだ記入が表示されます。チェーンの行に `wrong chain` と表示された場合は、QoreX をテストネットに切り替えてください。

### 9. QoreX から署名する {#step-sign}

1. カード2に、メッセージを入力します（最大140文字）。ページに、使った文字数が表示されます。
2. **Sign** を選びます。
3. QoreX が承認画面を開きます。アカウントにポスト量子鍵やウィンドウがまだない場合、QoreX は、同じ承認の中で、鍵の登録（約 0.09 QOR の1回限りの手数料）と EVM ウィンドウを開くことを提案します。それを実行してください。
4. QoreX で承認します。待っている間、ボタンには `Approve in QoreX...` と表示されます。

**表示されるはずの内容:** エクスプローラーへのリンク付きの `tx 0x...` の行。最初は `waiting for the block...`、そのあと `success in block ...`。カード1では、EVM ウィンドウが、残りのブロック数とトランザクション数とともに `live` と表示されます。カード3の先頭に、あなたのメッセージが新しい順に追加されます。最大20件を表示し、数秒ごとに更新されます。同じアドレスでもう一度試すと、カード2に `This address has already signed.` と表示されます。

### 10. チェーン上で検証する {#step-explorer}

`pnpm window open`（ステップ5）のハッシュを使います。ページの場合、QoreX はウィンドウを自分のトランザクションでも開きます。QoreX に履歴を表示してもらうか、エクスプローラーであなたのアドレスを検索してください。

**a. 通常の Web リクエストで。** `<HASH>` をハッシュに置き換えます（`<` と `>` は外します）。

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**このコマンドの働き**

- `curl <address>` は、QoreChain の公開サーバーに、そのトランザクションの記録を問い合わせ、表示します。Windows PowerShell では、`curl` の代わりに `curl.exe` と入力してください。

**長い応答の中で表示されるはずの内容:**

- `"code": 0`。トランザクションが成功したことを意味します。
- `PQCHybridSignature` タイプの拡張。ML-DSA-87 署名が入っており、長さは 4,627 バイトです。
- `pqc_hybrid_verify` イベント。`status` が `verified` になっています。

**b. エクスプローラーで。** https://explore.qore.network を開き、ネットワークセレクターを **Testnet** に切り替え、トランザクションのハッシュ（ステップ5、6、9のもの）、あなたのアカウントのアドレス、または `QDayGuestbook` のアドレスを検索します。ウィンドウのトランザクションには、チェーンが検証したポスト量子署名が表示されます。

## 最後に表示されるはずの内容 {#result}

- `contracts-app` で `pnpm test` が `3 passing` を表示します。
- `pnpm window status` が `PQC key:  registered` と、残りのブロック数、トランザクション数、金額を含む `window:   live` を表示します。
- `pnpm deploy:testnet` が、`QDayGuestbook` のアドレス（`0x...`）を表示します。
- `pnpm sign "..."` が、トランザクションハッシュと `status: success in block ...` を表示します。
- ページに、あなたのアカウント、`qorechain-diana EVM (9800)`、残高、そして `live` のウィンドウが表示されます。**Sign** を選んで承認すると、トランザクションのリンクと `success in block ...` が表示されます。
- 下部の一覧に、署名の件数と最新の記入が、新しい順に表示されます。
- `curl` での確認で、`"code": 0`、`PQCHybridSignature` 拡張、`status` が `verified` の `pqc_hybrid_verify` が表示されます。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 原因 | 対処 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm がインストールされていない。Node.js には含まれていません。 | `npm install -g pnpm` を実行し、新しいターミナルを開く。 |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js が古すぎる。 | Node.js 22 以降をインストールする。 |
| `node: .env: not found` | このフォルダーに `.env` ファイルがない。 | `contracts-app` でステップ3を行い、そのフォルダーからコマンドを実行する。 |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` または `Set QORE_PQC_RECOVERY_CODE ...` | `.env` の値が空、プレースホルダーのまま、または入力ミスがある。 | ステップ3のとおり両方の値を記入して保存する。 |
| `... does not exist on chain yet: send it some QOR first` | アカウントにまだ QOR がない。 | フォーセットを使い（ステップ4）、10秒待つ。 |
| フォーセットが上限に達したと表示する | アカウントごとに24時間に1回のリクエストのみ。 | 待ってから、もう一度試す。 |
| `account has no PQC key and classical fallback is disabled` | 鍵を登録する前にトランザクションを送った。 | `pnpm window register` を実行し、そのあと `pnpm window open` を実行する。QoreX では、最初の送信で提案される登録を承認する。 |
| `EVM authorisation window exhausted` または `open an EVM window first` | ウィンドウのブロック数かトランザクション数を使い切った、またはウィンドウを一度も開いていない。 | `pnpm window open`（ターミナル）を実行し、10秒待つ。ページでは、QoreX が新しいウィンドウを提案したときに承認する。 |
| ウィンドウを開いたあとに `HHE10402` | アカウントのトランザクションカウンターが更新される前に、デプロイが実行された。 | 10秒待ってから、`pnpm deploy:testnet` をもう一度実行する。 |
| `refused: ... (AlreadySigned)` | このアドレスはすでに署名している。 | 各アドレスが署名できるのは1回だけ。別のアカウントを使う。 |
| `refused: ... (BadLength)` | メッセージが空、または140文字より長い。 | 1文字から140文字にする。 |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` がコントラクトを見つけられない。 | `contracts-app` でステップ5を終わらせる。 |
| ページに記入が表示されず、**Sign** ボタンがグレーになっている | `web/.env` の `VITE_GUESTBOOK_ADDRESS` が空。 | ステップ5のアドレスを貼り付け、`Ctrl+C` で止めてから `pnpm dev` を再起動する。 |
| ページに `wrong chain` と表示される | QoreX がテストネットになっていない。 | QoreX をテストネット（diana）に切り替える。「テストネットウォレット」を参照。 |
| 接続を選んでも QoreX が表示されない | QoreX 拡張機能のないブラウザーでページを開いた、または拡張機能がロックされている。 | QoreX があるブラウザーで http://localhost:5174 を開き、ロックを解除する。 |
| ポート 5174 がすでに使われている | ほかのプログラムが使っている。 | それを閉じるか、Vite が表示する別のアドレスを使う。 |
| EVM ウィンドウの横に `could not read`、またはブラウザーコンソールに CORS エラー | ページが REST サーバーを直接呼び出し、そのサーバーは CORS ヘッダーを送らない。 | このプロジェクトのように、REST は開発サーバーの `/lcd` プロキシ経由でのみ呼び出す。ページは `pnpm dev` で起動する。 |

## コード {#code}

コントラクトは、記入を配列に保持し、1アドレスにつき1回の署名だけを許可します:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX は、コネクターの一覧（`web/src/wagmi.ts`）の最初のウォレットです:

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

ページはウィンドウを表示し、拒否された理由を説明します（`web/src/App.tsx`）:

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## 使用するパッケージ {#packages}

コントラクト（`contracts-app/`）:

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | ウィンドウのヘルパースクリプト、ハイブリッド署名 |
| `@qorechain/evm` | ^0.13.0 | チェーン定義、`evmWindowStatus`、`evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | ウィンドウのメッセージのブロードキャスト |
| `hardhat` | ^3.21.1 | コンパイル、テスト、Ignition によるデプロイ |
| `viem` | ^2.47.6 | Ethereum クライアント |
| `tsx` | ^4.19.0 | TypeScript スクリプトの実行 |
| `typescript` | ^5.6.3 | 型チェック |

Web ページ（`web/`）:

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | チェーン定義、`evmWindowStatus`、`classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | RainbowKit のウォレットとしての QoreX |
| `@rainbow-me/rainbowkit` | ^2.2.11 | 接続ボタン |
| `wagmi` | ^2.19.5 | 読み取りと書き込みのための React フック |
| `viem` | ^2.53.1 | Ethereum クライアント |
| `@tanstack/react-query` | ^5.59.0 | ウィンドウとチェーンの読み取りのためのデータ取得 |
| `react`、`react-dom` | ^18.3.1 | インターフェース |
| `vite` | ^5.4.0 | 開発サーバー |
| `@vitejs/plugin-react` | ^4.3.0 | Vite 用の React サポート |
| `typescript` | ^5.6.3 | 型チェック |

ソース: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
