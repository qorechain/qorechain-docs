---
slug: /build-before-qday/workshop-1
title: "ワークショップ1: 最初のハイブリッド署名トランザクション"
sidebar_label: "ワークショップ1"
sidebar_position: 2
date: 2026-11-12
---

# ワークショップ1: 最初のハイブリッド署名トランザクション

このガイドでは、何もインストールされていないコンピューターから出発して、2つの鍵で同時に署名し、QoreChain テストネットに検証されるトランザクションを1つ作るところまで進みます。開発者である必要はありません。すべてのコマンドを平易な言葉で説明し、各ステップの最後に、画面に表示されるはずの内容を示します。

**所要時間:** 初回は、ツールのインストールを含めて約30分です。ツールがすでに入っていれば約10分です。

## 作るもの {#what-we-built}

1つのコマンドで作成した完全な Solidity プロジェクト（小さなスマートコントラクト）を、テストし、QoreChain テストネットにデプロイし、そのうえで**2つの鍵で同時に**署名したトランザクションを1つ送り、チェーンに検証してもらいます。

このガイドで示すこと:

- **ハイブリッド署名。** トランザクションには、従来型の secp256k1 署名と、ポスト量子の ML-DSA-87 署名（NIST FIPS 204）の両方が付きます。両方が有効でなければなりません。
- **チェーン上で検証される、ハイブリッド署名トランザクション1件。** バリデーターが両方の署名を検証します。その証拠は、公開 REST エンドポイント（`PQCHybridSignature` 拡張と `pqc_hybrid_verify` イベント）と、エクスプローラーで確認できます。
- **EVM 認可ウィンドウ。** Ethereum のトランザクションには、ポスト量子署名を載せられません。そのため QoreChain では、ML-DSA-87 鍵を一度登録し、ハイブリッド署名したメッセージで短いウィンドウを開きます。そのウィンドウの間、通常の EVM トランザクションが受け付けられます。考え方の詳細は[5分でデプロイ](/getting-started/deploy-in-5-minutes)を参照してください。

これは、まさに Quantum Pass レベルが求めている内容です。

## このガイドで使う用語 {#words}

| 用語 | やさしい意味 |
| --- | --- |
| ターミナル | コマンドを入力するウィンドウ。macOS と Linux ではターミナル、Windows では PowerShell |
| テストネット | QoreChain の練習用コピー。そこにあるコインに価値はありません |
| QOR と uqor | QOR はコインで、uqor はその最小単位です。1 QOR = 1,000,000 uqor |
| トランザクション | チェーンに送る、署名済みの指示1件 |
| メモ | トランザクションに添える短いテキスト |
| 秘密鍵 | アカウントの代わりに署名するための秘密。これを持つ人がアカウントを支配します |
| リカバリーコード | ポスト量子鍵の元になる、2つ目の秘密（`QRC1` で始まります） |
| ハッシュ | トランザクションに付く固有の ID。トランザクションを検索するときに使います |
| ガスと手数料 | チェーンがトランザクションを処理するために、QOR で払う少額の料金 |

:::caution 使い捨てのテストネットアカウントのみ
この練習用に作った鍵を使い、テスト用の QOR だけを入れてください。本物のウォレットや本物の資金は決して使わないでください。本物のお金が入っているアカウントの鍵やリカバリーコードを `.env` ファイルに入れてはいけません。また、`.env` を共有したりコミットしたりしないでください。
:::

## 始める前に {#prerequisites}

macOS、Windows、Linux のいずれかのコンピューターと、ターミナル、Web ブラウザーが必要です。このチュートリアルでは2つのツールをインストールします。**Node.js 22 以降**（ここで使うプロジェクトツール Hardhat 3 はバージョン22を必要とします）と、**pnpm**（プロジェクトのライブラリをダウンロードするツール）です。任意のツール **jq** は、検証の出力を読みやすくするだけのものです。

まずターミナルを開きます。macOS では**ターミナル**を、Windows では **PowerShell** を、Linux ではお使いのターミナルアプリを開いてください。

### Node.js 22 以降 {#install-node}

1. すでに入っているか確認します:

```bash
node -v
```

`v22` かそれ以上の数字が表示されるはずです。`command not found` や古いバージョンが表示された場合は、下記のとおり Node.js をインストールします。

2. お使いのシステムに合わせてインストールします:

| システム | インストール方法 |
| --- | --- |
| macOS | [nodejs.org/en/download](https://nodejs.org/en/download) からインストーラーをダウンロードします。Homebrew を使っている場合は `brew install node@22` でも構いません |
| Windows | PowerShell で `winget install OpenJS.NodeJS.LTS` を実行するか、[nodejs.org/en/download](https://nodejs.org/en/download) からインストーラーをダウンロードします |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash` を実行し、ターミナルを閉じて開き直してから、`nvm install 22` を実行します |

3. ターミナルを閉じ、新しく開いて、もう一度 `node -v` を実行します。

**表示されるはずの内容:** `v22` かそれ以上で始まる数字。例: `v22.12.0`。

### pnpm {#install-pnpm}

1. すでに入っているか確認します:

```bash
pnpm -v
```

2. `command not found`（または `pnpm: command not found`）と表示された場合は、インストールします:

```bash
npm install -g pnpm
```

| 部分 | 意味 |
| --- | --- |
| `npm` | Node.js に付属するパッケージツール |
| `install` | プログラムをダウンロードしてインストールする |
| `-g` | グローバル。1つのフォルダーだけでなく、コンピューター全体にインストールする |
| `pnpm` | インストールするプログラム |

Homebrew でインストールした Node.js には pnpm が含まれていません。macOS で `pnpm: command not found` がよく出るのはそのためで、上のコマンドを実行すれば解決します。Linux や macOS で権限エラーが出た場合は、代わりに `corepack enable` を実行し、そのあとでもう一度 `pnpm -v` を実行してください。

3. もう一度 `pnpm -v` で確認します。

**表示されるはずの内容:** バージョン番号。例: `9.12.0` かそれ以上。

### jq（任意） {#install-jq}

`jq` は、長い応答を短く読みやすい形で表示します。ステップ8で一度だけ使います。

| システム | インストール | 確認 |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq`（Debian と Ubuntu） | `jq --version` |

ステップ8で使う `curl` は、macOS、Linux、Windows 10 以降にすでに入っています。Windows の PowerShell では、`curl` の代わりに `curl.exe` と入力してください。

## テストネットウォレットとフォーセット {#wallet}

プロジェクトはステップ3で使い捨てのアカウントを自分で作るので、このガイドを終えるのにウォレットは必要ありません。ただし、そのアカウントにはテストネットの QOR が必要です。また、サンプルアプリで使うために、テストネット上で QoreX ウォレットを設定しておくこともできます。

**テストネット上の QoreX（ここでは任意ですが、ブラウザー用のサンプルアプリには必要です）:**

1. **QoreX アプリ**で、**設定**を開き、**Use testnet (developers)** をオンにします。
2. **QoreX ブラウザー拡張機能**で、ロックを解除し、下部のバージョン番号を7回タップして、**Switch to testnet (diana)** を選びます。
3. Ethereum 側（EVM）で何かを行う場合は、**Add an Ethereum account (coin 60)** も選びます。これで、Ethereum のツールで使える `0x...` アドレスのアカウントができます。

**フォーセット**は、テストネットの QOR を無料で配る仕組みです。ステップ4で使います:

- アドレス: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet)。先にサインインします。
- 金額: 100 QOR。アカウントごとに24時間に1回です。
- 新しいアカウントの最初のトランザクションで、ポスト量子の ML-DSA-87 鍵が登録されます。これには約 0.09 QOR の1回限りの手数料がかかるので、100 QOR で十分です。

このガイドで使うネットワークの詳細:

| サービス | URL |
| --- | --- |
| テストネット | `qorechain-diana`、EVM チェーン ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替えます） |
| フォーセット | `https://dashboard.qorechain.io/faucet`（サインインが必要） |

## 手順 {#steps}

### ステップ1: ツールを確認する {#step-1}

**所要時間:** 1分。

```bash
node -v
```

| 部分 | 意味 |
| --- | --- |
| `node` | Node.js プログラム |
| `-v` | バージョンを表示して終了する |

```bash
pnpm -v
```

| 部分 | 意味 |
| --- | --- |
| `pnpm` | パッケージツール |
| `-v` | バージョンを表示して終了する |

**表示されるはずの内容:** Node.js は `v22` 以上、pnpm はバージョン番号。そうでない場合は「始める前に」に戻ってください。

### ステップ2: プロジェクトを作成してテストを実行する {#step-2}

**所要時間:** 約1分。インターネット接続が必要です。

1. 新しいフォルダーにプロジェクトを作成します。ターミナルで、プロジェクトを置いているフォルダー（たとえばドキュメントフォルダー）に移動してから、次を実行します:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

このコマンドの働き: QoreChain のプロジェクト作成ツールをダウンロードし、`qday-demo` という名前の、すぐに使えるプロジェクトを新しいフォルダーに作ります。

パラメータ:

- `npx`: インターネット上のプログラムを、恒久的にインストールせずに実行します。
- `create-qorechain-dapp@latest`: QoreChain のプロジェクト作成ツールです。`@latest` は最新バージョンを使うという意味です（このガイドは 0.14.0 で確認しました）。
- `qday-demo`: 新しいフォルダーとプロジェクトの名前です。別の名前にしても構いません。
- `-t hardhat`: `-t` はテンプレートの意味です。Hardhat テンプレートを選びます。テスト付きの Solidity コントラクトのプロジェクトです。
- `--network testnet`: プロジェクトが接続する QoreChain ネットワークです。`testnet` は練習用のネットワークです。
- `--package-manager pnpm`: プロジェクトに必要なライブラリをインストールするツールです。

**表示されるはずの内容:** インストールされたパッケージの一覧に続いて、`Done! Created qday-demo`。`create-qorechain-dapp` のインストールを尋ねられたら、`y` と答えてください。

2. プロジェクトのフォルダーに入ります:

```bash
cd qday-demo
```

このコマンドの働き: ターミナルを新しいフォルダーに移動します。以降のコマンドはすべてここから実行します。

パラメータ:

- `cd`: ディレクトリを移動する（change directory）。
- `qday-demo`: 入るフォルダー。

3. テストを実行します:

```bash
pnpm test
```

このコマンドの働き: コントラクトをコンパイルし、コンピューターの中にある小さな模擬チェーン上で、正しく動くかを確認します。本物のテストネットには何も送りません。

パラメータ:

- `pnpm`: パッケージツール。
- `test`: 実行するスクリプトの名前です（`package.json` に記載があり、`hardhat test` を実行します）。

**表示されるはずの内容:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. 作られたものを見てみる（任意）:

| ファイル | 内容 |
| --- | --- |
| `contracts/Counter.sol` | スマートコントラクト。数字を1つ保存し、1を足せます |
| `ignition/modules/Counter.ts` | コントラクトをデプロイするためのレシピ |
| `scripts/window.ts` | `pnpm window` の裏で動くヘルパー。鍵の登録と認可ウィンドウの開始を行います |
| `hardhat.config.ts` | 設定。`qorechainTestnet` ネットワーク（チェーン ID 9800）を含みます |
| `.env` | 秘密の設定ファイル。ステップ3で記入します。決して共有しないでください |

テンプレートについての詳細: [スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli)と[チェーン開発者キット](/developer-tools/chain-dev-sdk)。

### ステップ3: 使い捨てのテストネットアカウントを作る {#step-3}

**所要時間:** 3分。

このアカウントには2つの秘密が必要です。Ethereum 形式の**秘密鍵**と、ポスト量子の ML-DSA-87 鍵の元になる**リカバリーコード**（`QRC1` で始まります）です。どちらも、プロジェクトフォルダーの `.env` ファイルに入れます。このファイルは、あなたのコンピューターの外には出ません。

1. 新しい秘密鍵を作ります。まず `qday-demo` フォルダーの中に、`make-key.mjs` という小さなファイルを次の内容で作成します（メモ帳、プレーンテキストモードの TextEdit、nano など、どのテキストエディターでも構いません）:

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

このファイルの働き: ランダムな秘密鍵を作って `.env` ファイルに書き込みます。そのため、鍵が画面に表示されたり、手作業でコピーされたりすることはありません。

2. 実行します:

```bash
node make-key.mjs
```

このコマンドの働き: その小さなファイルを Node.js で実行します。

パラメータ:

- `node`: Node.js プログラム。
- `make-key.mjs`: 実行するファイル。

**表示されるはずの内容:** `New private key saved in .env`。実行するのは一度だけにしてください。2回目を実行すると別のアカウントになります。

3. リカバリーコードを作ります:

```bash
pnpm window recovery-code
```

このコマンドの働き: 新しいリカバリーコードを作って表示します。

パラメータ:

- `pnpm window`: プロジェクトのウィンドウヘルパー（`scripts/window.ts`）を実行します。
- `recovery-code`: 動作の指定です。新しいリカバリーコードを表示します。

**表示されるはずの内容:** `QRC1` で始まる長い1行と、保管についての注意書き。`QRC1...` の行全体をコピーしてください。

4. コードを `.env` に入れます。エディターでファイルを開きます:

| システム | コマンド |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

`QORE_PQC_RECOVERY_CODE=` の行を探し、等号のすぐ後ろにコードを貼り付けます。空白や引用符は入れないでください。ファイルを保存します。結果は次のようになります（プレースホルダーで示しています。実際の値は本物です）:

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

各行の意味:

- `PRIVATE_KEY`: アカウントの従来型（secp256k1）の半分の署名を行う秘密。
- `QORE_PQC_RECOVERY_CODE`: ポスト量子（ML-DSA-87）の半分を作る秘密。
- `QORE_NETWORK`: ヘルパーが接続するネットワーク。`testnet` は練習用のネットワークです。

`.env` はそのままの状態で保管してください。同じ鍵とコードからは、毎回同じアカウントができます。ファイルをなくした場合は、新しいアカウントで最初からやり直します。決して共有せず、git にコミットしないでください。

ニーモニック（12語）のほうがよいですか。鍵とコードの代わりに、`.env` に `QORE_MNEMONIC="your twelve words"` を入れます。両方の鍵が同じフレーズから作られるので、リカバリーコードは不要です。この練習のためだけに作ったフレーズを使ってください。

5. 新しいアカウントのアドレスをプロジェクトに尋ねます:

```bash
pnpm window status
```

このコマンドの働き: 公開チェーンを読み取り、あなたのアカウント、ポスト量子鍵、ウィンドウの状態を表示します。何も変更しません。

パラメータ:

- `pnpm window`: ウィンドウヘルパーを実行します。
- `status`: 動作の指定です。現在の状態を表示します。

**表示されるはずの内容:** 3行（実際のアドレスが表示されます）:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

`qor1...` アドレスをコピーしてください。これをフォーセットに渡します。2つのアドレスは同じアカウントのものです。`0x...` は Ethereum 形式、`qor1...` は QoreChain 形式です。

### ステップ4: フォーセットからテストネットの QOR を入手する {#step-4}

**所要時間:** 2分。

1. ブラウザーで[フォーセット](https://dashboard.qorechain.io/faucet)を開き、サインインします。
2. ダッシュボードが **Testnet** になっていることを確認します。
3. `qor1...` アドレスを貼り付けます。
4. **Request Tokens** を選びます。

**表示されるはずの内容:** 100 QOR（に加えて Fest のテストトークン）と **View on Explorer** リンクが入った、**Tokens Sent!** というカード。

フォーセットが払い出すのは、アカウントごとに24時間に1回です。正確な金額は[フォーセット](/dashboard/faucet)に載っています。では、ターミナルから確認します:

```bash
pnpm window status
```

**表示されるはずの内容:** 先ほどと同じ3行。アカウントがチェーン上に存在するようになり、手数料を払えます。鍵はまだ未登録と表示されます。それは次に行います。

### ステップ5: 鍵を登録してウィンドウを開く {#step-5}

**所要時間:** 約2分。

1. ML-DSA-87 鍵を登録します。アカウントごとに1回だけ行うステップです:

```bash
pnpm window register
```

登録が何をするのかを知るには、[耐量子鍵がアカウントに結び付けられる仕組み](/build-before-qday/key-binding)を読んでください。

このコマンドの働き: どのポスト量子鍵があなたのアカウントのものかをチェーンに伝える、トランザクションを1つ送ります。約 0.09 QOR の1回限りの手数料がかかります。チェーンにはまだポスト量子鍵の記録がないので、このメッセージ1件だけは、従来型の鍵のみの署名で受け付けられます。

パラメータ:

- `pnpm window`: ウィンドウヘルパーを実行します。
- `register`: 動作の指定です。鍵を登録します。

**表示されるはずの内容:** `registered: <HASH>`。`The account already has a PQC key; nothing to do.` と表示された場合も問題ありません。そのまま進んでください。

2. 認可ウィンドウを開きます:

```bash
pnpm window open
```

このコマンドの働き: **ハイブリッド署名**（両方の鍵）したトランザクションを送り、短いウィンドウを開きます。そのウィンドウの間、コントラクトのデプロイなど、通常の Ethereum 形式のトランザクションが受け付けられます。

パラメータ:

- `pnpm window`: ウィンドウヘルパーを実行します。
- `open`: 動作の指定です。ウィンドウを開きます。デフォルトでは 600 ブロックの間、5 件のトランザクションを許可します。`.env` の `QORE_WINDOW_BLOCKS` と `QORE_WINDOW_TXS` で変更できます。

**表示されるはずの内容:** `opened: <HASH>`、続いて `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)` のような行。最後の数字は、このウィンドウの支出上限（uqor 単位、3.75 QOR）です。`opened:` のハッシュを書き留めてください。ステップ8で検証します。

3. 約10秒待ちます。ウィンドウを開いたことでアカウントのカウンター（ナンス）が進み、Hardhat はチェーンが落ち着くのを待ちます。

### ステップ6: コントラクトをビルドする {#step-6}

**所要時間:** 数秒。

```bash
pnpm build
```

このコマンドの働き: Solidity コントラクトを、チェーンが実行できる形に変換します。

パラメータ:

- `pnpm`: パッケージツール。
- `build`: 実行するスクリプト（`hardhat build` を実行します）。

**表示されるはずの内容:** `Compiled 1 Solidity file` または `No contracts to compile`。どちらでも問題ありません。ステップ2のテストですでにコンパイルされています。

### ステップ7: コントラクトをテストネットにデプロイする {#step-7}

**所要時間:** 約30秒。

```bash
pnpm deploy:testnet
```

このコマンドの働き: 開いておいたウィンドウを使って、Hardhat Ignition でコントラクトを QoreChain テストネットに送ります。これは通常の EVM トランザクションです。

パラメータ:

- `pnpm`: パッケージツール。
- `deploy:testnet`: 実行するスクリプト。`hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet` を実行します。つまり、レシピ `Counter.ts` を、`qorechainTestnet` という名前のネットワーク（チェーン ID 9800）にデプロイします。

Hardhat が `Confirm deploy to network qorechainTestnet (9800)?` と尋ねたら、`y` と入力して Enter を押します。

**表示されるはずの内容:** `[ CounterModule ] successfully deployed` と、`CounterModule#Counter - 0x...` という行。`0x...` はあなたのコントラクトのアドレスです。`HHE10402` が表示された場合は、同じコマンドをもう一度実行してください（トラブルシューティングを参照）。

### ステップ8: チェーン上でハイブリッド署名を検証する {#step-6-verify}

**所要時間:** 3分。

ステップ5の `opened:` トランザクションは、両方の鍵で署名されています。誰でも公開 REST エンドポイントから確認できます。

1. `<HASH>` をそのハッシュに置き換え（`<` と `>` は外します）、次を実行します:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

このコマンドの働き: 公開テストネットのサーバーに、あなたのトランザクションの完全な記録を問い合わせます。

パラメータ:

- `curl`: Web アドレスの内容を取得するプログラム。
- `-s`: サイレントモード。進行状況バーを隠し、応答だけを表示します。
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: テストネットの REST アドレスに、あなたのトランザクションハッシュを続けたもの。

**表示されるはずの内容:** 長いテキストのかたまり。次の3つを探してください:

1. `tx_response` の中の `"code": 0`。コード 0 は成功を意味します。
2. `PQCHybridSignature` 拡張。ML-DSA-87 署名が入っており、**4,627 バイト**で、64 バイトの secp256k1 署名と並んでいます。
3. `events` の中の、`pqc_hybrid_verify` タイプのイベント。属性 `status` が `verified` になっています。

2. そのイベントだけを表示するには（`jq` が必要です）:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

このコマンドの働き: 同じ記録を取得し、`jq` に通します。`jq` は検証イベントだけを残します。

パラメータ:

- `|`: 最初のコマンドの出力を、2つ目のコマンドに渡します。
- `jq`: フィルタープログラム。
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: イベントの一覧を順にたどり、タイプが `pqc_hybrid_verify` のものだけを残します。

**表示されるはずの内容:** `"status"` が `"verified"` になっている、小さなテキストのかたまり。

3. エクスプローラーで確認します:
   1. [explore.qore.network](https://explore.qore.network) を開きます。
   2. ネットワークセレクターを **Testnet** に切り替えます。
   3. ハッシュを検索します。

**表示されるはずの内容:** トランザクションのページに、署名のセキュリティが量子安全で、チェーン上で検証済みであり、アルゴリズムは ML-DSA-87（FIPS 204）であることが表示されます。

これが証拠です。バリデーターが両方の署名を確認しました。これがあなたの Quantum Pass トランザクションです。

## 一目でわかる、表示されるはずの内容 {#what-you-should-see}

| 場所 | 内容 |
| --- | --- |
| ステップ2のあと | `Done! Created qday-demo` と `2 passing` |
| ステップ3のあと | `pnpm window status` に `qor1...` アドレスと `0x...` アドレスが表示され、鍵は未登録 |
| ステップ4のあと | フォーセットに **Tokens Sent!** |
| ステップ5のあと | `registered: <HASH>`、続いて `opened: <HASH>` とウィンドウの行 |
| ステップ7のあと | `CounterModule#Counter - 0x...` |
| ステップ8のあと | REST の出力と、Testnet のエクスプローラーの両方で、`code` が 0、4,627 バイトの ML-DSA-87 署名、`status` が `verified` の `pqc_hybrid_verify` |

## 使用するパッケージ {#published}

生成された `package.json` に宣言されているもの:

| パッケージ | レジストリ | バージョン |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

スキャフォルダーは、生成された `package.json` に記載されている Hardhat のツールボックス、Ignition、キーストアの各プラグインもインストールします。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 原因 | 対処 |
| --- | --- | --- |
| ウィンドウを開いた直後に `HHE10402` または "wait for confirmations" | ウィンドウを開いたことで、アカウントのナンスが進んだ | `pnpm deploy:testnet` をもう一度実行する |
| "EVM authorisation window exhausted" または "no window" | ウィンドウのトランザクション数かブロック数を使い切った、または別のコントラクトにスコープされている（別のコントラクトにスコープされたウィンドウは、デプロイを妨げます） | `pnpm window open` で新しいウィンドウを開き、約10秒待ってから、もう一度デプロイする |
| "account has no PQC key and classical fallback is disabled" | アカウントが ML-DSA-87 鍵を登録していない | 先に `pnpm window register` を実行し、そのあと `pnpm window open` を実行する |
| "does not exist on chain yet" | アカウントにまだ QOR がない | フォーセットから QOR を入手する（ステップ4） |
| フォーセットで "Rate Limit Reached"、または30秒たってもトークンが届かない | リクエストはアカウントごと、アドレスごとに24時間に1回で、順番に1件ずつ処理される | 数秒待って再試行するか、24時間が過ぎるのを待つ。リクエストは24時間に1回だけ |
| `pnpm: command not found` | pnpm がインストールされていない。Homebrew でインストールした Node.js には含まれていない | `npm install -g pnpm` を実行し、新しいターミナルを開く |
| `pnpm window` がリカバリーコードがないというメッセージで止まる | `.env` に `PRIVATE_KEY` はあるが `QORE_PQC_RECOVERY_CODE` がない | `pnpm window recovery-code` を実行し、コードを `.env` に貼り付ける（ステップ3）。または `QORE_MNEMONIC` を使う |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | 貼り付け時の入力ミス、空白、または引用符 | 空白や引用符を入れずに、コードをもう一度貼り付ける |
| `pnpm window status` に "registered, but NOT this key" | このアカウントに、以前は別のリカバリーコードを使った | 元のリカバリーコードを `.env` に戻すか、新しいアカウントで最初からやり直す |
| ブラウザーアプリで CORS エラー | ブラウザーが、あなたのページを許可しないチェーンのアドレスへの呼び出しをブロックしている | ブラウザーからの REST 呼び出しでは、チェーンのアドレスを直接呼ばず、テンプレートの `/lcd` プロキシパスを使う |
| Hardhat が起動しない | Node.js が 22 より古い | Node.js 22 以降をインストールし（「始める前に」を参照）、`pnpm install` をもう一度実行する |
| ステップの直後に `curl` が `tx not found` を表示する | ブロックがまだ確定していない | 10秒待ってから、コマンドをもう一度実行する |
| Windows PowerShell で `curl` が動かない | PowerShell では `curl` が別のコマンドになっている | `curl` の代わりに `curl.exe` と入力する |

## サンプルアプリ {#example-apps}

同じ流れを、複数の言語とフロントエンドで試せます。どれもハイブリッド署名を行います。すべて公開リポジトリ [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) の `workshop-1` フォルダーにあります。入手するには Git が必要です（`git --version` で確認し、なければ [git-scm.com](https://git-scm.com/downloads) からインストールします）。そのうえで、次を実行します:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

このコマンドの働き: すべてのサンプルアプリのコピーをダウンロードし、`workshop-1` フォルダーに移動します。

パラメータ:

- `git clone <address>`: インターネット上のプロジェクトを、あなたのコンピューターにコピーします。
- `cd build-before-qday/workshop-1`: 6つのアプリが入っているフォルダーに入ります。

各アプリのページは、インストールするものと期待される結果も含めた、最初から最後までのガイドになっています。

| アプリ | 言語 | ページ |
| --- | --- | --- |
| Q-Day Counter | TypeScript、Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript、Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

これらのアプリの元になっているキットは、[キット](/build-before-qday/workshop-1/kits)にまとめてあります。ブラウザーの dApp で QoreX ウォレットを使うには、[QoreX](/qorex/overview)を参照してください。
