---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java アプリ Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java アプリ: Q-Day Tip Jar

**Q-Day Tip Jar** は、QoreChain テストネット（`qorechain-diana`、EVM チェーン ID 9800）向けの小さな Java プログラムです。**ハイブリッド署名**でチップを送ります。ハイブリッド署名とは、従来型の secp256k1 署名と、耐量子の ML-DSA-87 署名（FIPS 204）の組み合わせです。また、お店のバックエンドのように「ジャー」アドレスを見張り、耐量子のチップと従来型のチップを区別することもできます。

**所要時間:** 初回は約20分です（ツールのインストールに10分、セットアップに5分、送信と確認に5分）。

Java を知っている必要はありません。以下のコマンドを1つずつ入力し、結果を「表示されるはずのもの」と見比べるだけです。

## 何がわかるか {#what-it-shows}

- SDK の1回の呼び出しによる、Java からの **ML-DSA-87 + secp256k1 ハイブリッド署名**。
- **チェーン上で検証されたハイブリッド署名付きトランザクション**: チェーンは `status=verified` の `pqc_hybrid_verify` イベントを記録し、トランザクションは 4,627 バイトの ML-DSA-87 署名を持ちます。
- **耐量子のチップと従来型のチップを区別するバックエンド**: `watch` は、受信したすべての送金に `QUANTUM-SAFE` または `classical only` のラベルを付けます。

なぜ重要か: 従来型の署名だけでは、将来の量子コンピューターに破られると予想されています。チェーン自身の検証記録を確認するサービスは、各支払いをどこまで信頼するかを判断できます。[量子安全トランザクション](/sdk/guides/quantum-safe)を参照してください。

:::warning テストネット専用
使うのは使い捨てのテストネットアカウントだけです。テストネットの QOR に価値はありません。このチュートリアルで、本物のウォレット、本物のリカバリーフレーズ、本物の資金を使わないでください。
:::

## 出てくる用語 {#words}

| 用語 | 意味 |
| --- | --- |
| テストネット | QoreChain の練習用コピーです。そこでのコインは無料で、価値はありません。 |
| QOR と uqor | 同じコインの2つの呼び名です。1 QOR = 1,000,000 uqor です。アプリは QOR で金額を尋ねます。手数料は uqor で表示されます。 |
| メモ | 銀行振込のメモ欄のように、トランザクションに添付される短いテキストです。 |
| アドレス | 公開されるアカウント番号です。QoreChain では `qor1` で始まります。共有しても安全です。 |
| 鍵ファイル | 秘密のリカバリーフレーズが入ったファイルです。決して共有しないでください。 |
| フォーセット | 無料のテストネット QOR を配るウェブサイトです。 |
| ハッシュ | トランザクションの一意な ID です。トランザクションを検索するときに使います。 |

## 始める前に {#before}

必要なツールは3つです。**Git**（コードをダウンロードします）、**Java 21 以降**（アプリを実行します）、**Maven**（アプリをビルドします）。インストールのたびに、**ターミナルを閉じて新しく開き**、確認コマンドを実行してください。

| ツール | macOS | Windows | Linux（Debian または Ubuntu） | 確認 |
| --- | --- | --- | --- | --- |
| Git | `brew install git`（Homebrew は https://brew.sh から） | https://git-scm.com/download/win（「Git Bash」も入ります） | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net（Temurin 21 の .msi インストーラーを選びます） | `sudo apt install openjdk-21-jdk` | `java -version` が 21 以上と表示される必要があります |
| Maven | `brew install maven` | https://maven.apache.org/download.cgi から zip をダウンロードし、https://maven.apache.org/install.html に従います | `sudo apt install maven` | `mvn -version` |

Windows では、このチュートリアルのターミナルとして **Git Bash**（Git と一緒にインストールされます）を使ってください。ランチャー `tipjar` がシェルスクリプトだからです。macOS ではターミナルを、Linux では任意のターミナルを使います。通常の PowerShell を使いたい場合は、手順3の注意書きを参照してください。

**Homebrew を使う macOS の場合:** `brew install openjdk@21` を実行すると、リンクするよう案内されることがあります。それでも `java -version` が古いバージョンを表示する場合は、Homebrew が「For the system Java wrappers to find this JDK」の下に表示するコマンドを実行してから、新しいターミナルを開いてください。

## テストネットのウォレットと無料の QOR を用意する {#wallet}

アプリは自分で使い捨ての鍵を作る（下の手順4）ので、このチュートリアルにウォレットアプリは必須ではありません。ただし、テストネット QOR を入手する場所は必要です。QoreX でアカウントも見てみたい場合は次のようにします。

1. **QoreX アプリ:** 設定を開き、**Use testnet (developers)** をオンにします。
2. **QoreX ブラウザ拡張機能:** ロックを解除し、下部のバージョン番号を 7 回タップして、**Switch to testnet (diana)** を選びます。

無料の QOR は、https://dashboard.qorechain.io/faucet のフォーセットから入手します。サインインし、アドレスを貼り付けてリクエストします。**1アカウントにつき24時間あたり 100 QOR** をもらえます。

新しいアカウントの最初のトランザクションは、耐量子の ML-DSA-87 鍵をチェーンに登録します。これは約 0.09 QOR の手数料がかかる、一度きりのステップです。アプリが `register` コマンドで代わりに行います。

## 手順 {#run}

### 1. コードをダウンロードする {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**何をするか**

- `git clone <address>`: プロジェクトを GitHub から、お使いのコンピューター上の `build-before-qday` という新しいフォルダにコピーします。
- `cd <folder>`: ターミナルを Java アプリのフォルダに移動します。以降のコマンドは、すべてこのフォルダから実行する必要があります。

**表示されるはずのもの:** `Cloning into 'build-before-qday'...` のような行、そしてプロンプトが新しいフォルダになります。

### 2. アプリをビルドする {#build}

```bash
mvn -q package
```

**何をするか:** Maven が Maven Central から QoreChain SDK をダウンロードし、アプリを実行可能な1つのファイル `target/tipjar.jar` にまとめます。

| 部分 | 意味 |
| --- | --- |
| `mvn` | Maven ビルドツールです。 |
| `package` | コードをコンパイルして、`.jar` ファイルにまとめます。 |
| `-q` | 静かなモードです。問題があるときだけ表示します。 |

**表示されるはずのもの:** 数秒間は何も出ません（初回は約10秒、回線が遅いともう少しかかります）。その後、プロンプトが戻ります。ファイルがあることを確認します。

```bash
ls target/tipjar.jar
```

**表示されるはずのもの:** `target/tipjar.jar`。

### 3. ランチャーを実行可能にして試す {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**何をするか**

| 部分 | 意味 |
| --- | --- |
| `chmod +x tipjar` | ファイル `tipjar` をプログラムとして実行できるようにします。ダウンロードしたばかりのファイルには、この権限がありません。 |
| `./tipjar` | このフォルダにあるランチャーを実行します。`java -jar target/tipjar.jar` を起動します。コマンドを付けないとヘルプを表示します。 |

**表示されるはずのもの:** コマンドの一覧: `new`、`status`、`register`、`tip`、`watch`。

:::note Windows の通常の PowerShell の場合
`chmod` は省略します。以下のすべてのコマンドで、`./tipjar` を `java -jar target/tipjar.jar` に置き換えてください。
:::

### 4. 使い捨てのテストネットアカウントを作る {#key}

```bash
./tipjar new
```

**何をするか:** 新しいアカウントを作ります。秘密のリカバリーフレーズを、鍵ファイル `~/.config/qday/java.env`（ホームフォルダの中で、あなただけが読めます）に書き込み、公開アドレスだけを表示します。

| 部分 | 意味 |
| --- | --- |
| `new` | 新しい鍵ファイルを作り、そのアドレスを表示します。 |
| `new --force` | 既存の鍵ファイルを置き換えます。古い鍵は失われます。 |

**表示されるはずのもの:** `new jar key`、鍵ファイルのパス、`qor1...` で始まる `address`。リカバリーフレーズは決して表示されません。

**`qor1...` アドレスをコピーしてください。** なくしても、`./tipjar status` でもう一度表示できます。鍵ファイルは決して共有せず、Git にコミットせず、メインネットで再利用しないでください。鍵を別の場所に置くには、先に `TIPJAR_KEY` を設定します。`TIPJAR_KEY=/path/to/file ./tipjar status`（PowerShell では `$env:TIPJAR_KEY="C:\path\file"`）です。

### 5. フォーセットからテストネット QOR を入手する {#faucet}

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` アドレスを貼り付けて、リクエストボタンを押します。
3. 数秒待ってから、次を実行します。

```bash
./tipjar status
```

**何をするか:** テストネットに、あなたの残高と、耐量子鍵が登録されているかどうかを問い合わせます。

**表示されるはずのもの:** `balance   100 QOR`（またはフォーセットの金額）と、ML-DSA-87 鍵がまだ登録されていないという行。残高が 0 の場合は、10秒待ってからもう一度実行します。

### 6. 耐量子鍵を登録する {#register}

```bash
./tipjar register
```

**何をするか:** あなたの ML-DSA-87 鍵をチェーンに、一度だけ記録します。もう一度実行しても安全です。この最初のトランザクションは、従来型の鍵だけで署名されます。署名に使える耐量子鍵が、まだチェーン上にないためです。約 0.09 QOR かかります。これ以降のトランザクションは、すべてハイブリッド署名になります。

**表示されるはずのもの:** トランザクションハッシュと、鍵が登録されたというメッセージ。もう一度 `./tipjar status` を実行すると、鍵が登録済みと表示されるはずです。

**かかる時間:** 数秒です（1ブロック）。

### 7. チップを受け取る2つ目のアドレスを作る {#jar}

チップには、それを受け取る相手が必要です。専用の鍵ファイルを持つ、2つ目の使い捨てアカウント「ジャー」を作ります。

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**何をするか:** `./tipjar` の前の部分が、このコマンド1回だけ鍵ファイルを指定します（`TIPJAR_KEY`）。そのため、新しいアカウントが最初のアカウントを上書きしません。Windows の PowerShell では、先に `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"` を実行し、次に `java -jar target/tipjar.jar new` を実行して、最後に `Remove-Item Env:TIPJAR_KEY` で元に戻します。

**表示されるはずのもの:** 新しい `qor1...` アドレス。これをコピーします。これが**ジャーのアドレス**です。ジャーがチップを受け取るのに、QOR は必要ありません。

### 8. ハイブリッド署名付きのチップを送る {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

`qor1...JAR_ADDRESS` を、手順7のジャーのアドレスに置き換えてください。

| 部分 | 意味 |
| --- | --- |
| `tip` | チップを送ります。 |
| `qor1...JAR_ADDRESS` | チップを受け取る相手です。 |
| `1` | QOR での金額です（つまり 1 QOR = 1,000,000 uqor）。 |
| `"my first quantum-safe tip"` | メモです。トランザクションに添付される短いテキストで、省略可能です。スペースが入る場合は引用符を付けたままにします。 |

**何をするか:** アプリはチェーンに、トランザクションに必要なガスの量を問い合わせます（試験実行）。安全マージンとして 30 パーセントを加え、両方の鍵で署名して送信し、ブロックを待ってから、チェーン自身の記録を確認します。

**表示されるはずのもの:** トランザクションハッシュ、ブロック高、そして結果 `QUANTUM-SAFE`。`CHECK FAILED` と表示された場合は、トラブルシューティングを参照してください。ハッシュをコピーしておきます。

**かかる時間:** 約10秒です。

### 9. お店のバックエンドのように、ジャーを見張る {#watch}

**2つ目のターミナル**を開き、同じフォルダに移動して、ウォッチャーを起動します。

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

次に最初のターミナルに戻り、チップをもう1つ送ります（手順8を、新しいメモで実行します）。

**何をするか:** `watch` は、3秒ごとにチェーンへジャーへの新しい送金を問い合わせ、それぞれにラベルを付けます。`NO_COLOR=1 ./tipjar watch ...` にすると色が消えます。Ctrl+C で止めます。

**表示されるはずのもの:** 各チップが `QUANTUM-SAFE` のタグ付きで一覧に出ます。検証されたハイブリッド署名なしで送られたチップは、`classical only` と表示されます。

## トランザクションを自分で検証する {#verify}

アプリを信頼する必要はありません。チェーンに直接尋ねてみましょう。

**方法1: ブラウザで。** `https://explore.qore.network/tx/<HASH>` を開き（`<HASH>` の代わりに自分のハッシュを入れます）、エクスプローラーを **Testnet** に切り替えます。成功したトランザクションが表示されるはずです。

**方法2: 1つのコマンドで。** `<HASH>` の代わりに自分のハッシュを入れます。

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| 部分 | 意味 |
| --- | --- |
| `curl` | ウェブアドレスをダウンロードするツールです。macOS、Windows 10 以降、ほとんどの Linux に組み込まれています。 |
| `-s` | サイレントです。進行状況バーを隠します。 |
| アドレス | 公開テストネットの REST API です。トランザクションの完全な記録を JSON で返します。 |

**表示されるはずのもの**（長い出力の中で。JSON ビューアを使うか、jq を入れていれば `| jq .` を付けます）:

- `"code": 0` は、トランザクションが成功したことを意味します。
- **4,627 バイト**の `pqc_signature`（これが ML-DSA-87 署名です）を持つ `PQCHybridSignature` 拡張。
- あなたのアドレスについて、`status` が `verified` になっている `pqc_hybrid_verify` イベント。

## 証明の仕組み {#proof}

アプリは、`GET /cosmos/tx/v1beta1/txs/{hash}` から同じ記録を読み取り、イベント `pqc_hybrid_verify`（`address=<signer>`、`status=verified`）と、4,627 バイトの署名を持つ拡張 `/qorechain.pqc.v1.PQCHybridSignature` を探します。ウォッチャーも、受信したすべての送金について同じことを行います。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 理由 | 対処 |
| --- | --- | --- |
| `./tipjar: Permission denied` | ダウンロードしたばかりのファイルは、実行可能になっていません。 | `chmod +x tipjar` を実行します。 |
| `build first: (cd ... && mvn -q package)` | jar ファイルがありません。 | このフォルダで `mvn -q package` を実行します（手順2）。 |
| `mvn: command not found` または `java: command not found` | ツールがインストールされていないか、ターミナルを開き直していません。 | インストールし（「始める前に」を参照）、新しいターミナルを開いて、バージョンを確認します。 |
| Java がバージョン 17 以下と表示する | 古い Java がパスの先頭にあります。 | Java 21 をインストールし、新しいターミナルを開いて、もう一度 `java -version` を実行します。 |
| `no key file at ..., run new first` | 手順4を飛ばしたか、`TIPJAR_KEY` が別の場所を指しています。 | `./tipjar new` を実行します。 |
| `key file already exists` | すでに鍵を作っています。 | そのまま使うか、`./tipjar new --force` で置き換えます（古い鍵は失われます）。 |
| `account has no PQC key and classical fallback is disabled` | 耐量子鍵がまだ登録されていません。 | 先に `./tipjar register` を実行します。 |
| `EVM authorisation window exhausted` | このメッセージは EVM アプリ（counter、guestbook）のものです。Tip Jar では使いません。 | EVM アプリで `pnpm window open` を使って新しいウィンドウを開きます。 |
| ウィンドウを開いた後の `HHE10402` | Hardhat アプリのみです。ウィンドウがまだ有効になっていませんでした。 | Hardhat アプリで、もう一度デプロイを実行します。 |
| 残高が 0、または `not on chain yet` | フォーセットのトークンがまだ届いていません。 | 10秒待ってから、`./tipjar status` を実行します。正しいアドレスを貼り付けたか確認します。 |
| フォーセットがレート制限と表示する | 1アカウントにつき24時間に1回のリクエストです。 | 待つか、別の使い捨てアカウントを使います。 |
| `chain refused the tx` または `poll failed` | テストネットが混雑しているかアップグレード中、または公開エンドポイントが IP アドレスごとにリクエストを制限しています。 | 1分待って、もう一度コマンドを実行します。 |
| `recipient must be a qor1... address` | アドレスが間違っているか、スペースが入っています。 | `qor1...` アドレス全体をもう一度コピーします。 |
| ブラウザでの `CORS` エラー | ウェブページがチェーンを直接呼び出す場合だけです。このアプリでは起きません。 | ブラウザアプリでは、テンプレートの `/lcd` プロキシを使います。 |
| `pnpm: command not found` | pnpm がインストールされていません。ここでは不要です。 | Hardhat チュートリアルの場合だけ: `npm install -g pnpm` を実行します。 |

## 重要な SDK コード {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

ガスは固定されません。すべてのトランザクションは先にシミュレーションされ、シミュレーションされたガスの 1.3 倍が、1 ガスあたり 0.15 uqor の価格で設定されます。

アカウントは、従来型の coin-118 の QoreChain アカウントです（`m/44'/118'/0'/0/0`）。ML-DSA-87 鍵は同じリカバリーフレーズから導出され、`Authenticator.derivePqcCanonical` でアドレスに結び付けられます。代わりにシードベースのヘルパーで自分のアプリを作る場合、SDK 0.13.0 ではリカバリーコードか、独立した 32 バイトの PQC シークレットが必要です。[SDK のインストール](/sdk/install#whats-new-0130)を参照してください。リカバリーコードは決して表示しないでください。

## 使用パッケージ {#packages}

| 項目 | バージョン |
| --- | --- |
| `io.github.qorechain:qorechain-sdk`（Maven Central） | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java（`maven.compiler.release`） | 21 |
| アプリ `demo:tipjar` | 1.0.0 |

全言語のリリース表は、[SDK のインストール](/sdk/install)を参照してください。

## 調べる場所 {#access}

| 項目 | 場所 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替え） |
| フォーセット | https://dashboard.qorechain.io/faucet |
| コード | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
