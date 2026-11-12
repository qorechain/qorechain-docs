---
slug: /build-before-qday/prerequisites
title: "始める前に: ツールとテストネットウォレット"
sidebar_label: "始める前に"
sidebar_position: 2
---

# 始める前に: ツールとテストネットウォレット

このセクションのどのチュートリアルも、何もインストールされていないコンピューターから始まります。このページは、その準備をまとめて行う唯一の場所です。一度だけ済ませれば、どのチュートリアルでも開けます。各チュートリアルはここへのリンクを備えており、必要な短い確認コマンドだけを繰り返し載せています。

**所要時間:** 初回は約20分から40分で、ほとんどはダウンロードの待ち時間です。インストールするのは、取り組みたいチュートリアルに必要なツールだけで構いません。

:::caution 使い捨てのテストネットアカウントだけを使う
ここで行うことはすべて QoreChain の**テストネット**で動作し、QOR に価値はありません。どのチュートリアルでも、本物のウォレット、本物のリカバリーフレーズ、本物の資金は絶対に使わないでください。この演習のためだけに、新しいアカウントを作ります。
:::

## 各チュートリアルに必要なツールは? {#which-tools}

必要な行のツールだけをインストールしてください。Git、ターミナル、ウェブブラウザーはすべてのチュートリアルで必要です。

| チュートリアル | 言語 | インストールするツール | QoreX ウォレット |
| --- | --- | --- | --- |
| [Workshop 1 ガイド](/build-before-qday/workshop-1) | TypeScript | Node.js、pnpm、curl、jq（任意） | 不要 |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git、Node.js、pnpm | 不要 |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git、Node.js、pnpm | 必要。Ethereum アカウント（coin 60）付き |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git、Node.js、pnpm | 必要 |
| [Rust、qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git、Rust | 不要 |
| [Java、Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git、Java 21、Maven | 不要 |
| [Python、Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git、Python 3.10 以降 | 不要 |

## ターミナルを開く {#terminal}

ターミナルは、コマンドを入力するウィンドウです。このページのコマンドを、1つずつ貼り付けて実行します。

| システム | 開き方 |
| --- | --- |
| macOS | Command と Space を押し、`Terminal` と入力して Return を押します。 |
| Windows | スタートメニューを開き、`PowerShell` と入力して **Windows PowerShell** を開きます。Java のチュートリアルでは **Git Bash**（Git に付属しています。下記参照）または WSL も必要です。 |
| Linux | Ctrl、Alt、T を押すか、アプリケーションから `Terminal` を検索します。 |

ツールをインストールしたら、**ターミナルを閉じて新しく開き直してください**。インストール中に開いていたターミナルは、新しいツールをまだ認識しません。

## ツールをインストールする {#install}

どのツールにも、インストールコマンドまたはダウンロードリンクと、その後に**確認コマンド**があります。確認コマンドはツールにバージョンを尋ねます。必要なバージョン以上の番号が表示されれば、そのツールは使えます。

### パッケージマネージャー（任意の補助ツール） {#package-managers}

パッケージマネージャーは、1つのコマンドで他のプログラムをインストールしてくれます。各ツールを公式サイトから手動でダウンロードすることもできます。以下のコマンドは、お使いのシステムに合う補助ツールを使っています。

| システム | 補助ツール | 入手方法 |
| --- | --- | --- |
| macOS | Homebrew | 次の1行をターミナルに貼り付け、表示される内容に従います: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Windows 10 と 11 に最初から含まれています。`winget --version` で確認します。 |
| Linux | apt | Ubuntu と Debian に最初から含まれています。その他のシステムでは、それぞれのパッケージマネージャー（`dnf`、`pacman`）を使ってください。 |

### Git {#git}

Git は、GitHub からサンプルコードをダウンロードするために使います。

| システム | インストール |
| --- | --- |
| macOS | `xcode-select --install`（ウィンドウが開くので **インストール** を選びます）、または `brew install git` |
| Windows | `winget install --id Git.Git -e`、または [git-scm.com](https://git-scm.com/download/win) からダウンロード |
| Linux | `sudo apt install -y git` |

確認します。

```bash
git --version
```

`git version 2.40.0` のような行が表示されます。バージョンはどれでも構いません。

### Node.js 22.13 以降 {#node}

Node.js は TypeScript のプロジェクトを実行します。ここで使うコントラクトツールの Hardhat 3 は、Node.js 22.13 より古いバージョンでは起動を拒否します。

| システム | インストール |
| --- | --- |
| macOS | `brew install node`、または [nodejs.org](https://nodejs.org) から LTS インストーラーをダウンロード |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`、または [nodejs.org](https://nodejs.org) から LTS インストーラーをダウンロード |
| Linux（Ubuntu、Debian） | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` のあと `sudo apt install -y nodejs` |

:::note Linux: デフォルトの apt パッケージは使わない
Ubuntu と Debian では、`sudo apt install nodejs` だと古すぎるバージョンが入ります。上の NodeSource の行を使ってください。
:::

確認します。

```bash
node -v
```

`v22.13.0` 以上、たとえば `v22.20.0` や `v24.1.0` が表示されます。それより低い番号が表示された場合は、もう一度インストールして、新しいターミナルを開いてください。

### pnpm 9 以降 {#pnpm}

pnpm は、TypeScript プロジェクトに必要なライブラリをインストールします。`npm` と同じ役割を、より速く果たします。

どのシステムでも、Node.js 自身のインストーラーツールである `npm` で次のようにインストールします。

```bash
npm install -g pnpm
```

| 部分 | 何をするか |
| --- | --- |
| `npm install` | プログラムをダウンロードしてインストールします。 |
| `-g` | 「global（グローバル）」の略で、1つのフォルダーではなくコンピューター全体にインストールします。 |
| `pnpm` | インストールするプログラムです。 |

macOS と Linux で `EACCES` や「permission denied」で終わった場合は、`sudo npm install -g pnpm` として、もう一度実行してください。

:::caution Homebrew の Node.js には pnpm が含まれていません
チュートリアルで `pnpm: command not found`（または `zsh: command not found: pnpm`）と表示されたら、pnpm をまだインストールしていません。`npm install -g pnpm` を実行し、新しいターミナルを開いて、もう一度試してください。
:::

確認します。

```bash
pnpm -v
```

`9.0.0` 以上、たとえば `10.4.1` が表示されます。

### curl と jq（Workshop 1 ガイドのみ） {#curl-jq}

`curl` は、ターミナルから Web アドレスの内容をダウンロードします。公開 REST エンドポイントからトランザクションを読み取るときに使います。`jq` は長い応答を絞り込み、必要な部分だけを見せてくれます。`jq` は任意です。

| システム | curl | jq |
| --- | --- | --- |
| macOS | 付属しています。 | `brew install jq` |
| Windows | Windows 10 と 11 に `curl.exe` として含まれています。 | `winget install --id jqlang.jq -e` |
| Linux | なければ `sudo apt install -y curl` | `sudo apt install -y jq` |

確認します。

```bash
curl --version
jq --version
```

それぞれ、`jq-1.7` のようなバージョン行が表示されます。

:::note Windows PowerShell: curl.exe と入力する
PowerShell では、短い `curl` という語は別の組み込みコマンドを指します。このページのすべてのコマンドで、`curl` の代わりに `curl.exe` と入力してください。Git Bash を使う場合は、そのまま `curl` で動きます。
:::

### Rust 1.88 以降（Rust チュートリアルのみ） {#rust}

Rust は、コマンドラインアプリ `qday-pay` をコンパイルします。Rust の公式インストーラーである `rustup` でインストールします。Rust のビルドツールである `cargo` も一緒にインストールされます。

| システム | インストール |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`（Return を押して既定値を受け入れます）。コンパイラーのツールは `xcode-select --install` で入ります。 |
| Windows | [rustup.rs](https://rustup.rs) から `rustup-init.exe` をダウンロードして実行するか、`winget install --id Rustlang.Rustup -e` を実行します。Visual Studio C++ Build Tools を求められたら承諾してください。Windows でプログラムをビルドするのに Rust がそれを必要とします。 |
| Linux | `sudo apt install -y build-essential curl` のあと `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`（Return を押して既定値を受け入れます） |

確認します。

```bash
rustc --version
cargo --version
```

`rustc 1.88.0` 以上と、`cargo` のバージョン行が表示されます。すでに Rust を入れている場合は、`rustup update` で最新にできます。

### Java 21 と Maven（Java チュートリアルのみ） {#java}

Tip Jar アプリには、Java 21 以降の JDK（Java をビルドして実行するためのツール）と、Java ライブラリをダウンロードするビルドツールの Maven が必要です。

| システム | インストール |
| --- | --- |
| macOS | `brew install --cask temurin@21` のあと `brew install maven`（または [adoptium.net](https://adoptium.net) のインストーラーを使います） |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e` を実行し、続けて [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi) から Maven をダウンロードして展開し、その `bin` フォルダーを `PATH` に追加します。より簡単な方法: WSL をインストール（下記参照）して、Linux の行に従います。 |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

確認します。

```bash
java -version
mvn -version
```

`openjdk version "21`（または 25 のようにそれより大きい番号）と、`Apache Maven 3.` に続くバージョンが表示されます。`java -version` が 17 以下を示す場合は、Java 21 をインストールして新しいターミナルを開いてください。

### Python 3.10 以降と venv（Python チュートリアルのみ） {#python}

Python は Airdrop アプリを実行します。`venv` はライブラリ専用の独立したフォルダーを作るので、コンピューターの他の部分には影響しません。

| システム | インストール |
| --- | --- |
| macOS | `brew install python`、または [python.org](https://www.python.org/downloads/) からダウンロード |
| Windows | `winget install --id Python.Python.3.12 -e`、または [python.org](https://www.python.org/downloads/) からダウンロードし、インストーラーで **Add python.exe to PATH** にチェックを入れます |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

確認します。

```bash
python3 --version
```

`Python 3.10.0` 以上が表示されます。Windows では、代わりに `python --version` と入力してください（コマンドは `python3` ではなく `python` です）。

### Windows と Linux のコマンド: WSL {#wsl}

チュートリアルのほとんどのコマンドは、どのシステムでも同じです。一部のコマンドは Linux のシェル機能を使います: `source`、`chmod`、`./tipjar`、`sleep` です。Windows では次の2つの選択肢があります。

1. **ネイティブ Windows。** TypeScript、Rust、Python のチュートリアルには PowerShell を使います。チュートリアルには、`.venv\Scripts\activate` のように違いがある箇所で Windows 向けの書き方が載っています。Java のチュートリアルでは **Git Bash**（Git と一緒にインストールされます）を使います。
2. **WSL。** Windows Subsystem for Linux は、Windows の中で本物の Linux を使えるようにします。管理者として PowerShell を開き、下のコマンドを実行して再起動し、Ubuntu のウィンドウの中でこのページの **Linux** の行に従ってください。

```powershell
wsl --install
```

| 部分 | 何をするか |
| --- | --- |
| `wsl` | Windows Subsystem for Linux のツールです。 |
| `--install` | WSL と Ubuntu Linux システムを一度にインストールします。 |

## まとめて確認する {#check-all}

インストールしたツールのコマンドを実行します。どれもバージョンが表示される必要があります。

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| 確認 | 正しい結果 |
| --- | --- |
| `node -v` | `v22.13.0` 以上 |
| `pnpm -v` | `9.0.0` 以上 |
| `rustc --version` | `rustc 1.88.0` 以上 |
| `java -version` | `21` 以上 |
| `mvn -version` | `Apache Maven 3.` とバージョン |
| `python3 --version` | `Python 3.10.0` 以上 |

## テストネットウォレットを用意する {#wallet}

テスト用の QOR を保管する場所が必要です。チュートリアルによっては、ファイルの中に使い捨てのアカウントを作ってくれます。それ以外は、QoreChain の公式ウォレットである **QoreX** をテストネットに切り替えて使います。どれがどちらかは、[各チュートリアルに必要なツールは?](#which-tools) の表に書かれています。

### テストネットで QoreX を使う {#qorex}

1. 公式の配布ページから QoreX をインストールします。iPhone は [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626)、Android は [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex)、Chrome、Brave、Edge、Arc、Opera は [Chrome ウェブストア](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg)、Firefox は [Firefox アドオン](https://addons.mozilla.org/firefox/addon/qorex/)です。完全な一覧は [QoreX の概要](/qorex/overview)にあります。
2. **新しい**ウォレットを作成し、リカバリーフレーズを紙に書き留めます。本物の資金が入っているフレーズをインポートしないでください。
3. ウォレットをテストネットに切り替えます。
   - **スマートフォンアプリ:** **設定** を開き、**Use testnet (developers)** をオンにします。
   - **ブラウザー拡張機能:** ロックを解除し、**下部にあるバージョン番号**を7回タップします。開発者向けオプションが表示されます。**Switch to testnet (diana)** を選びます。
4. テストネットのバッジが表示されていることを確認します。テストネットの名前は `qorechain-diana` です。

**表示される内容:** ウォレットにテストネットのバッジが出て、ホーム画面に `qor1...` のアドレスが表示されます。テストネットの残高にはドル換算が表示されませんが、それで正常です。

### Ethereum アカウント（coin 60）を追加する {#coin-60}

Guestbook のチュートリアルは EVM レーンを使うので、ウォレットに Ethereum 形式のアカウントが必要です。

1. QoreX でアカウント一覧を開き、**Add an Ethereum account (coin 60)** を選びます。
2. 新しいアカウントを作成します。本物の資金が入っているフレーズを復元しないでください。
3. そのアカウントを選択します。`0x...` のアドレスが表示されます。

**表示される内容:** *Ethereum, coin 60* というラベルのアカウントがあり、アドレスは `0x` で始まります。同じアカウントには `qor1...` のアドレスもあります。

アカウントについての詳細: [QoreX のアカウントとダッシュボード](/qorex/account-and-dashboard)と [QoreX を始める](/qorex/getting-started)。

## フォーセットでテスト用 QOR を受け取る {#faucet}

フォーセットは、テストネットのアドレスに無料のテスト用 QOR を送ります。すべてのトランザクションには少額のネットワーク手数料がかかるため、新しいアカウントは何かを行う前に、いくらか受け取っておく必要があります。

1. ブラウザーで [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) を開きます。
2. QoreChain ダッシュボードにサインインします。
3. `qor1...` のアドレスをアドレス欄に貼り付けます。
4. **Request Tokens** を選びます。
5. **Tokens Sent!** と表示されるのを待ちます。

**表示される内容:** 100 QOR と書かれた **Tokens Sent!** のカードと、**View on Explorer** のリンクです。

フォーセットは、アカウントごと、アドレスごとに**24時間に1回、100 QOR** を送ります。早すぎる再リクエストには **Rate Limit Reached** と表示されます。24時間が経過するまで待ってください。このページにあるすべてのチュートリアルに対して、1回のリクエストで足ります。

### 最初のトランザクションで耐量子鍵が登録される {#first-tx}

QoreChain のすべてのアカウントは、従来型の鍵と、耐量子の ML-DSA-87 鍵という2つの鍵を持っています。新しいアカウントの最初のトランザクションで、**ML-DSA-87 鍵がオンチェーンに登録されます**。これはアカウントごとに一度だけで、費用は約 **0.09 QOR** です。その後のすべてのトランザクションは、両方の鍵で署名されます。

チュートリアルでは、`register` というコマンドがこの手順を代わりに実行します。今は何もする必要はありません。フォーセットの 100 QOR で、何度でもまかなえます。

## QOR と uqor {#units}

同じコインに2つの呼び名があります。**QOR** はコイン1枚分の単位で、**uqor** は最小の単位です。

**1 QOR = 1,000,000 uqor。**

| 表示 | 意味 |
| --- | --- |
| `1` QOR | 1,000,000 uqor |
| `0.1` QOR | 100,000 uqor |
| `0.09` QOR | 90,000 uqor |
| `0.15uqor` | ガス1単位あたり 0.15 uqor という価格で、手数料を支払うときに使います |

ウォレットとほとんどのコマンドは QOR を使います。チェーン自体は uqor で数えます。**メモ**（memo）は、`Hello from the workshop` のような、トランザクションに添える短いテキストです。オンチェーンで誰でも読めるので、メモに秘密を書かないでください。

**ガス**は、トランザクションがネットワークに求める作業量の尺度です。手数料は、使用したガスにガス価格を掛けたものです。このセクションのツールがガスを見積もってくれるので、自分で計算する必要はありません。

## 使い捨ての鍵を安全に扱う {#key-hygiene}

チュートリアルは、テストネットアカウントの秘密情報を作成して、あなたのコンピューターに保存します。テスト用の QOR に価値はなくても、メインネットに備えて習慣をつけるために、丁寧に扱ってください。

1. **保存場所。** TypeScript のチュートリアルでは、秘密情報はプロジェクトフォルダーの `.env` というファイルに入ります。Rust、Java、Python のアプリは、`new` コマンドで、ホームフォルダー内の隠しフォルダー `.config/qday` に鍵ファイルを書き出します。チュートリアルに、正確なファイル名が書かれています。
2. **決して共有しない。** チャット、メール、スクリーンショット、動画に貼り付けないでください。画面を共有するときは、そのファイルを隠してください。
3. **決してコミットしない。** `.env` や鍵ファイルを Git に追加したり、GitHub にプッシュしたりしないでください。プロジェクトがまだ無視していない場合は、`.env` を `.gitignore` に追加してください。
4. **テストネット専用。** テストネットの鍵、リカバリーフレーズ、リカバリーコードをメインネットで再利用しないでください。
5. **終わったら削除する。** チュートリアルを終えたら、鍵ファイルまたは `.env` を削除してください。新しいアカウントは1分で作り直せます。

:::danger 本物の資金
本物の資金が入っているアカウントの鍵、ニーモニック（リカバリーフレーズ）、リカバリーコードを、このセクションの `.env` ファイル、鍵ファイル、コマンドのいずれにも入れないでください。
:::

## ネットワークと公開エンドポイント {#network}

| サービス | 値 |
| --- | --- |
| テストネット名 | `qorechain-diana` |
| EVM チェーン ID | 9800 |
| REST（Web 経由でデータを読む） | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| エクスプローラー | [explore.qore.network](https://explore.qore.network)。そのあと **Testnet** に切り替えます |
| フォーセット | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 理由 | 対処 |
| --- | --- | --- |
| `pnpm: command not found` | pnpm がインストールされていません。Homebrew でインストールした場合も含め、Node.js には pnpm は含まれていません。 | `npm install -g pnpm` を実行し、新しいターミナルを開いて `pnpm -v` を実行します。 |
| `node: command not found`、またはインストール後も古いバージョンのまま | インストール中にターミナルが開いていたか、古いバージョンが先に見つかっています。 | ターミナルを閉じて新しく開き、`node -v` を実行します。Linux ではデフォルトの apt パッケージではなく、NodeSource の行を使ってください。 |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js が 22.13 より古いバージョンです。 | Node.js 22.13 以降をインストールし、プロジェクトで `pnpm install` をもう一度実行します。 |
| `npm install -g pnpm` の途中で `EACCES` または permission denied | 現在のユーザーがグローバルフォルダーに書き込めません。 | macOS と Linux では `sudo npm install -g pnpm` を実行します。 |
| Rust のインストール後に `rustc: command not found` | ターミナルが新しい `PATH` をまだ認識していません。 | 新しいターミナルを開きます。それでも失敗する場合は、`source "$HOME/.cargo/env"` を実行します。 |
| Rust のビルド時に `linker 'cc' not found` または `link.exe not found` | C コンパイラーのツールが不足しています。 | macOS: `xcode-select --install`。Linux: `sudo apt install -y build-essential`。Windows: Visual Studio C++ Build Tools をインストールします。 |
| `java -version` が 17 以下を示す | 古い Java が先に見つかっています。 | Java 21 をインストールし、新しいターミナルを開いて、もう一度確認します。 |
| Python の venv を有効化するときに、PowerShell が「スクリプトの実行が無効」と言う | Windows は既定でスクリプトをブロックします。 | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` を実行して `Y` と答え、もう一度有効化します。 |
| フォーセットで `Rate Limit Reached` | フォーセットは、アカウントごと、アドレスごとに24時間に1回だけ送ります。 | 24時間が経過するまで待ちます。どのチュートリアルでも、1回のリクエストで足ります。 |
| ウォレットにテストネットのバッジが出ない | ウォレットがまだメインネットのままです。 | スマートフォンアプリ: 設定、次に **Use testnet (developers)**。拡張機能: バージョン番号を7回タップし、**Switch to testnet (diana)** を選びます。 |
| `account has no PQC key and classical fallback is disabled` | 新しいアカウントが、まだ ML-DSA-87 鍵を登録していません。 | まずチュートリアルの `register` の手順を実行します（アカウントの最初のトランザクションです）。 |
| ブラウザーコンソールの CORS エラー | 公開 REST エンドポイントは CORS ヘッダーを返さないため、Web ページから直接呼び出せません。 | テンプレートと同じように、プロジェクトの `/lcd` プロキシ経由でエンドポイントを呼び出します。 |

## 次のステップ {#next}

[概要](/build-before-qday/overview#choose)からチュートリアルを1つ選び、最初のコマンドから進めてください。
