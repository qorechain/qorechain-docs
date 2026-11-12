---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter は、QoreChain の EVM プロジェクトとして最も小さく、それでいて実用的なものです。数字を1つ保存する Solidity コントラクトと、それをテストネット `qorechain-diana` に載せる Hardhat プロジェクト、そしてその数字を読み取って1を足す短いスクリプトでできています。

このガイドは初心者向けです。Solidity やブロックチェーンのツールの知識は必要ありません。すべてのコマンドを説明し、各ステップの最後に、表示されるはずの内容を示します。

**所要時間:** 初回は約25分です。大半はツールのインストールとフォーセットの待ち時間です。

## 示すこと {#shows}

- **ハイブリッド署名がデプロイの経路に組み込まれています。** コントラクトのデプロイを含め、EVM トランザクションを送る前に、アカウントには登録済みのポスト量子鍵（ML-DSA-87）と、有効な EVM 認可ウィンドウが必要です。ウィンドウは、従来型の鍵（secp256k1）とポスト量子鍵の両方で、二重に署名した1つのトランザクションで開きます。これがハイブリッド署名で、チェーンは両方を検証します。
- **検証できる、ハイブリッド署名トランザクション1件。** `pnpm window open` のステップがそのトランザクションを送ります。エクスプローラーで検索すれば、チェーン自身の判定を見ることができます。
- **普段使っている EVM ツールがそのまま動きます。** Hardhat と viem は、普通の Ethereum トランザクションを送ります。ポスト量子の保護はウィンドウの中にあるので、盗まれた secp256k1 鍵だけでは、アカウントから支出できません。

secp256k1 を破れるほど大きな量子コンピューターは、従来型の署名を偽造できます。QoreChain は、そのようなコンピューターにも偽造できない2つ目の署名（ML-DSA-87、標準規格 FIPS 204）を必須にしています。Counter は、このルールを有効にしたまま、開発者の一連の流れ全体を示します。鍵を登録し、ウィンドウを開き、デプロイし、呼び出し、読み取ります。

## 始める前に {#prerequisites}

このガイドでは、使い捨てのテストネットアカウントを使います。本物のウォレットや本物の資金は決して使わないでください。テストネットの QOR に価値はありません。

ターミナルが必要です。macOS では**ターミナル**を開きます。Windows では **PowerShell**（または Git に付属する **Git Bash**）を開きます。Linux では任意のターミナルを開きます。そのうえで、次の3つのツールをインストールします。確認コマンドがすでに適切なバージョンを表示するなら、インストールは省略して構いません。

### Node.js 22 以降

Node.js は、お使いのコンピューターで JavaScript を実行します。Hardhat 3 には Node.js 22 以降が必要です。

| システム | インストール | 確認 |
| --- | --- | --- |
| macOS | `brew install node`（[Homebrew](https://brew.sh) が必要）、または https://nodejs.org からダウンロード | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`、または https://nodejs.org からダウンロード | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash` を実行し、新しいターミナルを開いて、`nvm install 22` を実行 | `node --version` |

表示されるはずの内容: `v22` かそれ以上で始まる数字。例: `v22.12.0`。Windows では、インストール後に PowerShell を閉じて開き直してください。

### pnpm

pnpm は、プロジェクトに必要なライブラリをダウンロードします。Node.js をインストールしても付いてこないので、どのシステムでも自分で追加します。

```sh
npm install -g pnpm
```

| 部分 | 意味 |
| --- | --- |
| `npm` | Node.js に付属するツール。ほかのツールをインストールします。 |
| `install` | ダウンロードしてインストールする。 |
| `-g` | グローバル。1つのフォルダーだけでなく、コンピューター全体にインストールする。 |
| `pnpm` | インストールするツール。 |

`pnpm --version` で確認します。`9.12.0` のような数字（9 以上）が表示されるはずです。`pnpm: command not found` と表示された場合は、このステップを飛ばしています。上のインストールコマンドを実行してから、新しいターミナルを開いてください。

Linux や macOS で `EACCES: permission denied` と表示された場合は、代わりに `sudo npm install -g pnpm` を実行します。

### Git

Git は、GitHub からプロジェクトをダウンロードします。

| システム | インストール | 確認 |
| --- | --- | --- |
| macOS | `xcode-select --install` または `brew install git` | `git --version` |
| Windows | `winget install Git.Git`、または https://git-scm.com からダウンロード | `git --version` |
| Linux | `sudo apt install git`（Debian、Ubuntu）または `sudo dnf install git`（Fedora） | `git --version` |

表示されるはずの内容: `git version 2.` と数字。

## テストネットウォレット {#wallet}

少額の QOR が入ったテストネットアカウントが必要です。このガイドでは、次のステップでそれを作ります（鍵ファイルです）。Counter には QoreX は必要ありません。あとで同じアカウントをウォレットで見たい場合は、テストネット上の [QoreX](/qorex/overview) を使います:

- **QoreX アプリ:** 設定を開き、**Use testnet (developers)** を選びます。
- **QoreX ブラウザー拡張機能:** ロックを解除し、下部のバージョン番号を7回タップして、**Switch to testnet (diana)** を選びます。
- EVM レーンでは、**Add an Ethereum account (coin 60)** を選びます。

フォーセットは、テストネットの QOR を無料で配ります: https://dashboard.qorechain.io/faucet。サインインし、アドレスを貼り付けて、リクエストします。アカウントごとに24時間に 100 QOR を受け取れます。

**金額について。** QOR はコインです。`uqor` はその最小単位です。1 QOR = 1,000,000 uqor。チェーン上の手数料は `uqor` で表示されます。新しいアカウントの最初のトランザクションでポスト量子鍵が登録され、約 0.09 QOR の1回限りの手数料がかかります。

## 手順 {#steps}

### 1. コードを入手する {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**このコマンドの働き**

- `git clone <address>` は、GitHub からプロジェクトのコピーを、`build-before-qday` という名前の新しいフォルダーにダウンロードします。
- `cd <folder>` は、ターミナルを Counter のプロジェクトフォルダーに移動します。以降のコマンドはすべてここから実行します。

**表示されるはずの内容:** `Cloning into 'build-before-qday'...`、続いて新しいフォルダーでのプロンプト。**所要時間:** 数秒。

任意: ライブワークショップのように、プロジェクトをゼロから作りたい場合は、ステップの最後にある[同じプロジェクトをゼロから作る](#scaffold)を参照してください。

### 2. ライブラリをインストールする {#step-install}

```sh
pnpm install
```

**このコマンドの働き**

- `pnpm install` は、`package.json` に書かれたライブラリの一覧を読み取り、`node_modules` フォルダーにダウンロードします（Hardhat、QoreChain SDK など）。

**表示されるはずの内容:** `+` 記号が付いたパッケージの一覧と、数秒の `Done in`。**所要時間:** 1分未満。

### 3. テストとビルドを実行する {#step-test}

```sh
pnpm test
```

**このコマンドの働き**

- `pnpm test` は、コンピューターの中にある模擬チェーン上で、プロジェクトの検査を実行します。鍵もネットワークも QOR も必要ありません。初回は Solidity コンパイラーもダウンロードするので、インターネット接続が必要です。

**表示されるはずの内容:** `Counter`、チェックマーク付きの2行（`starts at the constructor value`、`increments and emits CountChanged`）、そして `2 passing`。

```sh
pnpm build
```

**このコマンドの働き**

- `pnpm build` は、Solidity コントラクトをマシンコードに変換します（コンパイルします）。`pnpm test` のあとでは `No contracts to compile` と表示されますが、問題ありません。テストですでにコンパイルされています。

### 4. 設定ファイルを作る {#step-account}

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

- `cp`（または `copy`）は、テンプレートファイル `.env.example` を、新しいファイル `.env` にコピーします。

`.env` ファイルはあなたの**鍵ファイル**です。このプロジェクトフォルダーの中にしかありません。使い捨ての鍵が入っています。**決して共有せず、Git にコミットせず、これらの鍵を本物のウォレットに再利用しないでください。** プロジェクトは、すでに Git で `.env` を無視する設定になっています。好きなテキストエディターで開きます（macOS は `open -e .env`、Windows は `notepad .env`、Linux は `nano .env`）。2つの値を記入します。

**a. 使い捨ての秘密鍵。** ランダムな鍵を生成します:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**このコマンドの働き**

- `node -e "..."` は、JavaScript を1行だけ実行します。
- その1行は、ランダムな32バイトを作り、先頭に `0x` を付けて16進数で表示します。これが秘密鍵です。

**表示されるはずの内容:** 1行。`0x` に続く64文字の英数字。これを `.env` に `PRIVATE_KEY=0x...` としてコピーし、ゼロだけのプレースホルダーと置き換えます。

**b. ポスト量子のリカバリーコード。** アカウントの ML-DSA-87 鍵は、2つ目の秘密であるリカバリーコードから作られます。

```sh
pnpm window recovery-code
```

**このコマンドの働き**

- `pnpm window` は、ヘルパースクリプト `scripts/window.ts` を実行します。その後ろの単語がコマンドです。
- `recovery-code` は、新しいランダムなリカバリーコードを表示します。

**表示されるはずの内容:** `QRC1-` で始まる1行と、短い注意書き。`QRC1-...` の行を `.env` に `QORE_PQC_RECOVERY_CODE=QRC1-...` としてコピーします。このアカウントでは同じコードを保管してください。新しいコードにすると、アカウントのポスト量子鍵が別のものになります。

`QORE_MNEMONIC` は空のままにします。（ニーモニックは、12語または24語のフレーズで、上の2つの値の代わりになります。どちらか一方を使い、両方は使わないでください。）`QORE_NETWORK=testnet` はそのままにします。これは、ヘルパーにテストネットを使わせる設定です。`.env` は、プレースホルダーで示すと次のようになります:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

ファイルを保存します。

### 5. アカウントのアドレスを表示する {#step-address}

```sh
pnpm window status
```

**このコマンドの働き**

- `status` は、あなたのアカウント、ポスト量子鍵が登録済みかどうか、EVM ウィンドウがあるかどうかを表示します。

**表示されるはずの内容:** 3行。1行目は `account:  0x...  (qor1...)` です。あなたのアカウントには2つのアドレスがあります。EVM 用の `0x...` と、ネイティブレーン用の `qor1...` です。どちらも同じアカウントのものです。残りの2行は `PQC key:  not registered` と `window:   none` です。新しいアカウントなので、これは正常です。1行目の `qor1...` アドレスをコピーしてください。

### 6. フォーセットからテストネットの QOR を入手する {#step-faucet}

1. https://dashboard.qorechain.io/faucet を開き、サインインします。
2. ページが **Testnet** になっていることを確認します。
3. `qor1...` アドレスを貼り付けて、QOR をリクエストします。アカウントごとに24時間に1回、100 QOR を受け取れます。
4. 約10秒待ってから、もう一度 `pnpm window status` を実行します。

**表示されるはずの内容:** 先ほどと同じ3行。鍵はまだ `not registered` で、ウィンドウもありません。アカウントには QOR が入りました。確認したい場合は、https://explore.qore.network（Testnet）を開き、`qor1...` アドレスを検索してください。

### 7. 鍵を登録してウィンドウを開く {#step-window}

```sh
pnpm window register
```

**このコマンドの働き**

- `register` は、アカウントの ML-DSA-87 公開鍵をチェーンに送ります。アカウントごとに1回行います。チェーンにはまだ照合先の鍵がないので、ポスト量子署名なしでチェーンが受け付ける唯一のメッセージです。費用は約 0.09 QOR です。

**表示されるはずの内容:** `registered: ` に続くトランザクションハッシュ（64文字）。

```sh
pnpm window open
```

**このコマンドの働き**

- `open` は、両方の鍵で署名した（ハイブリッド）トランザクションを1つ送り、EVM 認可ウィンドウを開きます。ウィンドウが有効な間は、通常の EVM トランザクションが許可されます。デフォルトでは 600 ブロックの間、5 件のトランザクションを許可します。`.env` の `QORE_WINDOW_BLOCKS` と `QORE_WINDOW_TXS` で変更できます。

**表示されるはずの内容:** `opened: ` に続くトランザクションハッシュ、そして `window: 600 blocks, 5 txs, ... uqor (value plus fees)`。**このハッシュをコピーしてください。** ステップ10で確認します。

次に、約10秒待ちます。ウィンドウを開くとアカウントのトランザクションカウンターが変わるので、次のコマンドは新しい値を読み取る必要があります。

```sh
sleep 10
pnpm window status
```

**このコマンドの働き**

- `sleep 10` は10秒待ちます（PowerShell と Git Bash でも動きます）。
- `status` は結果を表示します。

**表示されるはずの内容:** `PQC key:  registered` と `window:   live; ... blocks, ... txs, ... uqor left`。

### 8. コントラクトをデプロイする {#step-deploy}

```sh
pnpm deploy:testnet
```

**このコマンドの働き**

- コントラクトをデプロイするツールである Hardhat Ignition を、モジュール `Counter`、ネットワーク `qorechainTestnet`（チェーン ID 9800、QoreChain テストネット）で実行します。
- 確認を求められます。`y` と入力して Enter を押します。

**表示されるはずの内容:** `qorechainTestnet` (9800) へのデプロイを確認する質問。`y` と答えると、`CounterModule#Counter` で終わる行と、コントラクトのアドレス `0x...` が表示されます。これがあなたのコントラクトのアドレスです。**所要時間:** 約30秒。

### 9. 読み取って、1を足す {#step-interact}

```sh
pnpm interact
```

**このコマンドの働き**

- 保存されている数字を読み取り、`increment()` を呼び出して（1を足し）、もう一度読み取ります。この呼び出しは、ウィンドウの5件のトランザクションのうち1件を使います。

**表示されるはずの内容:** `Counter 0x... on qorechain-diana EVM (9800)`、`count: 0`、`increment tx: 0x...`、`status: success in block ...`、`count: 1`、そしてエクスプローラーへのリンク。

```sh
pnpm interact --read
```

**このコマンドの働き**

- `--read` は読み取り専用の意味です。数字を表示するだけで、何も送りません。

**表示されるはずの内容:** Counter のアドレスと `count: 1`。

### 10. ハイブリッドトランザクションを検証する {#step-explorer}

`pnpm window open` のトランザクションは、チェーンがポスト量子署名を検証したことの証拠です。2つの方法で確認します。

**a. 通常の Web リクエストで。** `<HASH>` を、ステップ7のハッシュに置き換えます。`<` と `>` は外してください。

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**このコマンドの働き**

- `curl <address>` は、QoreChain の公開サーバーに、そのトランザクションの記録を問い合わせ、表示します。Windows PowerShell では、`curl` の代わりに `curl.exe` と入力してください。
- `api-testnet.qore.host` は公開テストネットのサーバーです。`<HASH>` は、調べたいトランザクションです。

**長い応答の中で表示されるはずの内容:**

- `"code": 0`。トランザクションが成功したことを意味します。
- `PQCHybridSignature` タイプの拡張。ML-DSA-87 署名が入っており、長さは 4,627 バイトです。
- `pqc_hybrid_verify` イベント。属性 `status` が `verified` になっています。

**b. エクスプローラーで。**

1. https://explore.qore.network を開き、ネットワークセレクターを **Testnet** に切り替えます。
2. `pnpm window open` のハッシュを検索します。チェーンが検証したポスト量子署名がページに表示されます。
3. ステップ9の `increment tx` のハッシュ、または Counter のアドレスを検索すると、コントラクト呼び出しを確認できます。

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) では、同じ種類の証拠をバイト単位で見られます。

## 同じプロジェクトをゼロから作る {#scaffold}

ライブワークショップは、空のフォルダーから始まります。次のコマンドは、同じ Hardhat プロジェクトを作ります（ダウンロードしたコピーにしかない `interact` スクリプトは含まれません）。ステップ1の代わりに、プロジェクトを置いているフォルダーで実行してください。

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| 部分 | 意味 |
| --- | --- |
| `npx` | ツールをインストールせず、インターネットから直接実行する。 |
| `create-qorechain-dapp@latest` | QoreChain のプロジェクト作成ツールの最新バージョン。 |
| `qday-demo` | 新しいフォルダーの名前。 |
| `-t hardhat` | 使うプロジェクトのテンプレート。コントラクト、テスト、ウィンドウヘルパーが入った Hardhat 3 プロジェクト。 |
| `--network testnet` | プロジェクトが接続する QoreChain ネットワーク。本番ではなくテストネット。 |
| `--package-manager pnpm` | ライブラリをインストールするツール。 |

**表示されるはずの内容:** インストールされたパッケージの一覧と、`Done! Created qday-demo`。ライブラリはすでにインストールされ、`.env` ファイルもすでにあるので、ステップ2とステップ4のコピーは省略できます。`pnpm test`（ステップ3）から続け、そのあと 4a と 4b（`.env` の記入）、ステップ5から8に進みます。**所要時間:** 約30秒。

## 最後に表示されるはずの内容 {#result}

- `pnpm test` が `2 passing` を表示します。
- `pnpm window status` が `PQC key:  registered` と、残りのブロック数、トランザクション数、金額を含む `window:   live` を表示します。
- `pnpm deploy:testnet` が、デプロイされた `Counter` のアドレス（`0x...`）を表示します。
- `pnpm interact` が、`count` が 0 から 1 になるところ、`status: success`、エクスプローラーへのリンクを表示します。
- `curl` での確認で、`"code": 0`、`PQCHybridSignature` 拡張、`status` が `verified` の `pqc_hybrid_verify` イベントが表示されます。エクスプローラー（Testnet）でも、同じトランザクションが検証済みと表示されます。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 原因 | 対処 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm がインストールされていない。Node.js には含まれていません。 | `npm install -g pnpm` を実行し、新しいターミナルを開く。 |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js が古すぎる。 | Node.js 22 以降をインストールし、`node --version` を確認する。 |
| `node: .env: not found` | このフォルダーに `.env` ファイルがない。 | ステップ4を行い、プロジェクトフォルダーからコマンドを実行する。 |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | `.env` ファイルがない、または `PRIVATE_KEY` がプレースホルダーのまま、もしくは入力ミスがある。 | ステップ4をもう一度行い、ファイルを保存し、プロジェクトフォルダーからコマンドを実行する。 |
| `Set QORE_PQC_RECOVERY_CODE in .env` または `not a valid QRC1 recovery code` | リカバリーコードが空、または入力ミスがある。 | `pnpm window recovery-code` を実行し、`QRC1-...` の行全体を貼り付ける。 |
| `... does not exist on chain yet: send it some QOR first`（`register` または `open` で） | アカウントにまだ QOR がない。 | フォーセットから QOR をリクエストし（ステップ6）、10秒待つ。 |
| フォーセットが上限に達したと表示する | アカウントごとに24時間に1回のリクエストのみ。 | 待ってから、もう一度試す。または、2つ目の使い捨てアカウントを使う。 |
| `account has no PQC key and classical fallback is disabled` | 鍵を登録する前にトランザクションを送った。 | `pnpm window register` を実行し、そのあと `pnpm window open` を実行する。 |
| `EVM authorisation window exhausted`（またはヒント `open an EVM window first`） | ウィンドウのブロック数かトランザクション数を使い切った、またはウィンドウを一度も開いていない。 | `pnpm window open` を実行し、10秒待ってから、もう一度試す。 |
| ウィンドウを開いたあとに `HHE10402` | アカウントのトランザクションカウンターが更新される前に、デプロイが実行された。 | 10秒待ってから、`pnpm deploy:testnet` をもう一度実行する。 |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` がコントラクトを見つけられない。 | このフォルダーでステップ8を終わらせる。 |
| `PQC key: registered, but NOT this key` | `.env` のリカバリーコードが、登録時に使ったものと違う。 | 元のリカバリーコードに戻す。コードが違うと、別の鍵ができます。 |
| ブラウザーアプリで CORS エラー | 公開 REST サーバーは CORS ヘッダーを送らないため、ブラウザーがブロックする。 | [Guestbook の Web ページ](/build-before-qday/workshop-1/apps/qday-guestbook)のように、テンプレートの `/lcd` プロキシを使う。 |

## コード {#code}

コントラクト（`contracts/Counter.sol`）:

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

`scripts/window.ts` のうち、ハイブリッド署名を行う部分（ウィンドウのメッセージと署名者）:

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` は、あなたの鍵の素材から作られたアカウントで、`net` は `QORE_NETWORK`（デフォルトは `testnet`、チェーン ID は `qorechain-diana`）のネットワーク情報です。ハイブリッドトランザクションは大きいため、スクリプトが使う手数料は 100000 `uqor`（0.1 QOR）、ガスリミットは 800000 です。

## 使用するパッケージ {#packages}

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | ハイブリッド署名、PQC 鍵の登録、`openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM ウィンドウのヘルパー（`evmWindowStatus`、`evmWindowCost`） |
| `@cosmjs/stargate` | ^0.39.0 | ネイティブレーンのトランザクションのブロードキャスト |
| `hardhat` | ^3.21.1 | コンパイル、テスト、Ignition によるデプロイ |
| `viem` | ^2.47.6 | コントラクトの読み取りと書き込み |
| `tsx` | ^4.19.0 | TypeScript スクリプトの実行 |
| `typescript` | ^5.6.3 | 型チェック |

[スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli)と [SDK のインストール](/sdk/install)を参照してください。

## ネットワークの詳細 {#networks}

| 項目 | 値 |
| --- | --- |
| ネットワーク | テストネット `qorechain-diana` |
| EVM チェーン ID | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

ソース: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
