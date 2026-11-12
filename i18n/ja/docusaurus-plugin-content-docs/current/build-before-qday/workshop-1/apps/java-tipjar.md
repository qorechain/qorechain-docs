---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java アプリ、Q-Day Tip Jar
sidebar_label: Java、Tip Jar
sidebar_position: 5
---

# Java アプリ: Q-Day Tip Jar

**Q-Day Tip Jar** は、QoreChain テストネット（`qorechain-diana`、EVM チェーン ID 9800）向けの小さな Java バックエンドです。**ハイブリッド署名**（従来型の secp256k1 と、ポスト量子の ML-DSA-87、FIPS 204）でチップを送ります。ショップのバックエンドの例として、ジャーのアドレスを監視し、送信者の署名がハイブリッドであるとチェーンが検証したチップだけを受け付けることもできます。

## 確認できること {#what-it-shows}

- **Java からの ML-DSA-87 + secp256k1 ハイブリッド署名。** SDK の1つの呼び出し経路で行えます。
- **オンチェーンで検証された、ハイブリッド署名トランザクション。** チェーンは、署名者について `status=verified` の `pqc_hybrid_verify` イベントを発行し、トランザクションには 4627 バイトの ML-DSA-87 署名が含まれます。
- **量子耐性のあるチップと従来型のチップを見分けるバックエンド。** `watch` は、受信したすべての送金に `QUANTUM-SAFE` または `classical only` のラベルを付けます。

これが重要な理由です。従来型の署名だけでは、将来の量子コンピューターに破られると見込まれています。チェーン自身の検証記録を確認するサービスなら、各支払いをどこまで信頼するかを判断できます。[量子耐性トランザクション](/sdk/guides/quantum-safe)を参照してください。

## ステップバイステップ {#run}

以下はすべて、自分のターミナル（macOS、Linux、または WSL を使う Windows）で実行します。使うのは使い捨てのテストネットアカウントだけです。テストネットの QOR に価値はなく、ここで実際のウォレットを使うことはありません。

### 1. ツールをインストールする {#install}

Git、JDK 21 以降、Maven が必要です。手元の環境を確認します。

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

`java` や `mvn` がない、または古い場合は、先にインストールしてください。たとえば [Temurin JDK 21](https://adoptium.net) と [Apache Maven](https://maven.apache.org/install.html) を使うか、パッケージマネージャーを使います（macOS では `brew install openjdk@21 maven`、Debian や Ubuntu では `sudo apt install openjdk-21-jdk maven`）。新しいターミナルを開いて、3つの確認をもう一度実行してください。

### 2. コードを取得する {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. アプリをビルドする {#build}

```bash
mvn -q package
```

Maven が Maven Central から SDK をダウンロードし、実行可能なファイル `target/tipjar.jar` を1つビルドします。最初のビルドは1分もかかりません。続いて、ランチャーを実行可能にして、動くことを確認します。

```bash
chmod +x tipjar
./tipjar
```

コマンドの一覧（`new`、`status`、`register`、`tip`、`watch`）が表示されるはずです。

### 4. 使い捨てのテストネットアカウントを作る {#key}

```bash
./tipjar new
```

新しいリカバリーフレーズを生成し、鍵ファイル `~/.config/qday/java.env`（自分だけが読める、モード 0600）に書き込み、`qor1...` で始まるアカウントアドレスだけを表示します。フレーズが画面に表示されることはありません。このファイルを共有せず、コミットせず、メインネットで使い回さないでください。鍵を別の場所に置くには、すべてのコマンドの前に `TIPJAR_KEY=/path/to/file` を設定します。

出力から `qor1...` のアドレスをコピーしてください。なくしてしまっても、`./tipjar status` でもう一度表示できます。

### 5. フォーセットでテストネット QOR を受け取る {#faucet}

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` のアドレスを貼り付けて、トークンをリクエストします。フォーセットは24時間に 100 QOR を配布します。
3. 届いたことを確認します。

```bash
./tipjar status
```

残高にテストネットの QOR が表示され、ポスト量子鍵は未登録と表示されるはずです。

### 6. ポスト量子鍵を登録する {#register}

```bash
./tipjar register
```

これで ML-DSA-87 鍵をチェーンに1回だけ登録します。もう一度実行しても安全です。登録メッセージ自体は、署名に使えるポスト量子鍵がまだないため、設計どおり従来型の署名で行われます。メッセージには、新しい鍵を保持していることの証明が含まれます。それ以降のトランザクションはすべてハイブリッド署名です。

### 7. チップを受け取る2つ目のアドレスを作る {#jar}

チップには受取人が必要です。ジャー用に、専用の鍵ファイルで2つ目の使い捨てアカウントを作ります。

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

その `qor1...` のアドレスをコピーしてください。これがジャーのアドレスです。

### 8. ハイブリッド署名のチップを送る {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

`qor1...JAR_ADDRESS` を、ステップ7のジャーのアドレスに置き換えてください。`1` は QOR 単位の金額です。メモは省略できます。アプリはトランザクションをシミュレートしてガスを決め、両方の鍵で署名し、ブロードキャストし、ブロックを待ち、チェーンの検証記録を確認します。

### 9. ショップのバックエンドのように、ジャーを監視する {#watch}

同じフォルダーで2つ目のターミナルを開きます。ジャーのアドレスに対して監視を開始し、そのあと1つ目のターミナルからもう1つチップを送ります。

```bash
./tipjar watch qor1...JAR_ADDRESS
```

監視は3秒ごとにチェックし、受信した各チップにラベルを付けます。Ctrl+C で停止します。色を無効にするには、`NO_COLOR=1` を設定します。公開テストネットのエンドポイントには IP ごとのレート制限があります。呼び出しが失敗したら、1分待って再試行してください。

## 何が表示されるか {#output}

- `tip` のあと、ターミナルにトランザクションハッシュとブロック高が表示され、続いて検証結果が表示されます。チェーンがハイブリッド署名を検証した場合は `QUANTUM-SAFE`、そうでない場合は `CHECK FAILED` です。
- `watch` では、チェーンがハイブリッド署名を検証したチップには `QUANTUM-SAFE` のタグが付いて一覧表示され、そうでないものには `classical only` と表示されます。
- エクスプローラーでは、`https://explore.qore.network/tx/<HASH>`（ハッシュはターミナルに表示されたものを使います）を開き、エクスプローラーを **Testnet** に切り替えます。トランザクションは成功と表示されます。

## 証拠のしくみ {#proof}

アプリは、テストネットの REST エンドポイント（`GET /cosmos/tx/v1beta1/txs/{hash}`）からトランザクションを読み取り、次のものを探します。

- `address=<signer>` と `status=verified` を持つイベント `pqc_hybrid_verify`。
- 4627 バイトの `pqc_signature` を持つ拡張 `/qorechain.pqc.v1.PQCHybridSignature`。

監視は、受信したすべての送金について、まさにこれを読み取っています。

## 肝心の SDK コード {#code}

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

ガスは固定ではありません。すべてのトランザクションが先にシミュレートされ、シミュレートしたガスの 1.3 倍が与えられ、ガス1単位あたり 0.15 uqor で価格が決まります。

アカウントは、従来型の coin-118 の QoreChain アカウント（`m/44'/118'/0'/0/0`）です。ML-DSA-87 鍵は同じリカバリーフレーズから導出され、`Authenticator.derivePqcCanonical` でアドレスに紐づけられます。代わりにシードベースのヘルパーで自分のアプリを作る場合、SDK 0.13.0 にはリカバリーコードか、独立した 32 バイトの PQC シークレットが必要です。[SDK のインストール](/sdk/install#whats-new-0130)を参照してください。リカバリーコードは絶対に表示しないでください。

## 使用したパッケージ {#packages}

| 項目 | バージョン |
| --- | --- |
| `io.github.qorechain:qorechain-sdk`（Maven Central） | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java（`maven.compiler.release`） | 21 |
| アプリ `demo:tipjar` | 1.0.0 |

全言語のリリース表は [SDK のインストール](/sdk/install)を参照してください。

## 調べるときの参照先 {#access}

| 項目 | 場所 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替えます） |
| フォーセット | https://dashboard.qorechain.io/faucet |
| コード | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
