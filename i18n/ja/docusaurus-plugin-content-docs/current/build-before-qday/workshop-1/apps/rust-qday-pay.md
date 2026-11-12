---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust アプリ qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust アプリ: qday-pay

**qday-pay** は、ターミナルで実行する小さな Rust プログラムです。QoreChain テストネット `qorechain-diana` で、**ハイブリッド署名**を使ってテストネット QOR を支払います。ハイブリッド署名とは、従来型の secp256k1 署名と、耐量子の ML-DSA-87 署名（NIST FIPS 204）の組み合わせです。支払いの後、チェーンからトランザクションを読み戻し、両方の署名が確認されたことを示すチェーン自身の証明を表示します。

**所要時間:** 合計で約15分です。最初のビルドではライブラリのダウンロードとコンパイルが行われ、2〜5分かかります。その後は、どのコマンドも数秒で実行できます。

## 何がわかるか {#what-it-shows}

- 公開クレート `qorechain-sdk`（バージョン 0.13。コード内では `qorechain` として使います）を使った、**Rust からのハイブリッド署名**。
- 耐量子鍵の**チェーンへの一度きりの登録**。
- 任意のトランザクションの**検証レポート**: 64 バイトの従来型署名、4,627 バイトの ML-DSA-87 署名、そしてチェーンが出す `pqc_hybrid_verify` の判定。

なぜ重要か: 従来型の署名だけでは、将来の量子コンピューターに破られると予想されています。ハイブリッド署名は、2つのうち一方が破られない限り安全なままです。[量子安全トランザクション](/sdk/guides/quantum-safe)を参照してください。

## 手順 {#run}

作業は、お使いのターミナルで行います。使うのは使い捨てのテストネットアカウントだけです。テストネットの QOR に価値はありません。ここで本物のウォレットや本物の資金を使わないでください。

:::note Windows
qday-pay は鍵ファイルに Linux と macOS のファイル権限を使うため、Windows では **WSL**（Windows Subsystem for Linux）の中で実行します。WSL を使うと、Windows の中に Linux のターミナルが用意されます。以降は、すべて Linux の手順に従います。
:::

### 1. 始める前に: ツールをインストールする {#install}

必要なツールは3つです。**Git**（コードをダウンロードします）、**Rust**（プログラムをビルドします）、**C コンパイラ**（Rust がプログラムをリンクするために必要です）。このアプリでは Java、Node.js、Python は不要です。

**macOS**

| ツール | インストール方法 | 確認方法 |
| --- | --- | --- |
| C コンパイラと Git | `xcode-select --install`（ウィンドウが開くので、Install をクリックします） | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`（Enter を押してデフォルトを受け入れます）。その後、ターミナルを閉じて開き直します | `rustc --version` と `cargo --version` |

**Linux（Debian または Ubuntu。他のディストリビューションはそれぞれのパッケージマネージャーを使います）**

| ツール | インストール方法 | 確認方法 |
| --- | --- | --- |
| Git と C コンパイラ | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`（Enter を押してデフォルトを受け入れます）。その後、ターミナルを閉じて開き直します | `rustc --version` と `cargo --version` |

**Windows（WSL を使う）**

1. PowerShell を管理者として開き、`wsl --install` を実行します。求められたらコンピューターを再起動します。Windows が Ubuntu をインストールします。スタートメニューから **Ubuntu** アプリを開きます。
2. Ubuntu のターミナルで、上の **Linux** の表に従います。
3. Git for Windows（https://git-scm.com/download/win）は不要です。上の Linux のコマンドで Git も入るためです。

Rust 1.74 以降が必要です。`rustup` コマンドは最新バージョンをインストールするので、問題ありません。バージョン確認では `rustc 1.80.0` のような表示か、それより大きい番号が出るはずです。

**表示されるはずのもの:** `git --version`、`rustc --version`、`cargo --version` は、それぞれバージョン番号を表示します。コマンドが `command not found` と表示した場合は、ターミナルを閉じて新しく開き、もう一度試してください。

### 2. 始める前に: テストネットのウォレットとフォーセットを用意する {#wallet}

このアプリは自分でテストネットアカウントを作る（手順5）ので、実行のためにウォレットをインストールする必要はありません。必要なのは、無料のテストネット QOR を受け取る手段だけです。フォーセットは、無料のテストネット QOR をアドレスに送ってくれるウェブサイトです。

QoreX ウォレットでアカウントも見てみたい場合は、使い捨てアカウントで**テストネットの QoreX** を使ってください。

- **QoreX アプリ:** 設定を開き、**Use testnet (developers)** をオンにします。
- **QoreX ブラウザ拡張機能:** ロックを解除し、下部のバージョン番号を 7 回タップして、**Switch to testnet (diana)** を選びます。

このアプリでは Ethereum アカウントは不要です。QoreChain Native のアカウントタイプ（`qor1...` アドレス）を使います。

**フォーセット:** https://dashboard.qorechain.io/faucet。サインインし、アドレスを貼り付けてリクエストします。フォーセットは**1アカウントにつき24時間あたり 100 QOR** を支払います。

**知っておくと役立つこと:** 新しいアカウントの最初のトランザクションは、耐量子の ML-DSA-87 鍵をチェーンに登録します。これは約 0.09 QOR の一度きりの手数料です。qday-pay は手順7でこれを行います。

**金額について:** 画面で読む単位は **QOR** です。チェーンは最小単位の **uqor** で数えます。1 QOR = 1,000,000 uqor です。金額は QOR で入力し（たとえば `1`）、プログラムが変換します。

### 3. コードを入手する {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**何をするか**

| 部分 | 意味 |
| --- | --- |
| `git clone <address>` | サンプルアプリ一式の完全なコピーを GitHub から、`build-before-qday` という新しいフォルダにダウンロードします。 |
| `cd <folder>` | ターミナルを Rust アプリのフォルダに移動します。以降のコマンドはすべてここから実行します。 |

**表示されるはずのもの:** `Cloning into 'build-before-qday'...`、そしてプロンプトが `04-rust-qday-pay` フォルダになります。`ls` を実行して確認します。`Cargo.toml`、`Cargo.lock`、`README.md`、`src` が見えるはずです。

### 4. プログラムをビルドする {#build}

```bash
cargo build --release
```

**何をするか:** `cargo` は Rust のビルドツールです。このコマンドは、`Cargo.toml` に記載されたライブラリをダウンロードし、プログラムを1つのファイルにコンパイルします。

| 部分 | 意味 |
| --- | --- |
| `build` | プログラムをコンパイルします（まだ実行はしません）。 |
| `--release` | 高速で最適化されたバージョンをビルドします。付けない場合は、別のフォルダに遅いデバッグ版ができます。 |

**かかる時間:** 初回は2〜5分、その後は数秒です。

**表示されるはずのもの:** たくさんの `Compiling ...` 行、続いて `Finished release profile [optimized] target(s)`。プログラムは `./target/release/qday-pay` というファイルになりました。

実行できるか確認します。

```bash
./target/release/qday-pay
```

**何をするか:** コマンドを付けずにプログラムを実行します。ヘルプを表示するだけで、何も変更しません。

**表示されるはずのもの:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

この5行が、以下で使う5つのコマンドです。このページの以降では、`<command>` は `./target/release/qday-pay <command>` を意味します。

### 5. 使い捨てのテストネットアカウントを作る {#new-account}

```bash
./target/release/qday-pay new
```

**何をするか:** 新しいテストネットアカウントを作ります。秘密のリカバリーフレーズ（ニーモニック）を生成して、**鍵ファイル**に保存します。この1つのフレーズから、従来型の secp256k1 鍵と耐量子の ML-DSA-87 鍵の両方を導出します。フレーズが画面に表示されることはありません。

| 部分 | 意味 |
| --- | --- |
| `new` | コマンドです。アカウントと鍵ファイルを作ります。すでにある鍵ファイルは上書きを拒否するので、資金の入ったアカウントを誤って壊すことはありません。 |

**鍵ファイルの場所:** `~/.config/qday/rust.env`。`~` はホームフォルダです。このファイルは、あなただけが読めるようになっています（モード 0600）。`QDAY_KEY_FILE` を設定すれば、別の場所も使えます。たとえば `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new` です。その場合は、以降のすべてのコマンドの前にも同じ変数を付けてください。

:::warning 鍵ファイルは非公開に保つ
鍵ファイルはアカウントの鍵そのものです。決して共有せず、チャットやスクリーンショットに貼り付けず、Git にコミットしないでください。このアカウントはワークショップ専用とし、メインネットでは使わないでください。終わったらファイルを削除します。
:::

**表示されるはずのもの:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

`qor1...` のアドレスをコピーします。

### 6. フォーセットからアカウントに入金する {#faucet}

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` アドレスを貼り付けてリクエストします。100 QOR を受け取れます。
3. 支払いを含むブロックができるまで、約10秒待ちます。

鍵を登録する前に、アカウントがチェーン上に存在している必要があります。そのアカウントを作るのが、フォーセットからの支払いです。

### 7. アカウントを確認する {#status}

```bash
./target/release/qday-pay status
```

**何をするか:** テストネットからあなたのアカウントを読み取り、概要を表示します。何も送信しません。

**表示されるはずのもの:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| 行 | 意味 |
| --- | --- |
| `network` | プログラムが接続しているチェーンです。テストネット `qorechain-diana` 専用で、他のネットワークは拒否します。 |
| `balance` | 使える QOR の残高です。 |
| `ML-DSA-87` | 耐量子鍵がチェーンに登録されているかどうかです。 |
| `block` | 最新のブロック高です。上がり続けます。 |

### 8. 耐量子鍵を登録する {#register}

```bash
./target/release/qday-pay register
```

**何をするか:** あなたの ML-DSA-87 公開鍵を、**所有証明**（対応する秘密鍵を本当に持っていることの証明）とともにチェーンに伝えるトランザクションを1つ送信します。チェーンが鍵を保存し、以後あなたの耐量子署名を確認できるようになります。約 0.09 QOR の一度きりの手数料がかかります。もう一度実行しても安全です。鍵がすでに登録されている場合は、何もしません。

| 部分 | 意味 |
| --- | --- |
| `register` | コマンドです。ML-DSA-87 鍵を一度だけ登録します。 |

**表示されるはずのもの:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. ハイブリッド署名付きの支払いを送る {#send}

`qor1...` を、テストネットのアドレスに置き換えてください。自分のアドレスに支払っても、友人のテストネットアドレスに支払っても構いません。

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**何をするか:** 支払いを組み立て、2回署名し（secp256k1 と ML-DSA-87）、ガス代を確認して送信し、ブロックに入るまで待ってから、手順10の検証を自動で実行します。

| 部分 | 意味 |
| --- | --- |
| `send` | コマンドです。別のアドレスに QOR を支払います。 |
| `qor1...`（最初の値） | 受取人です。`qor1` アドレスでなければならず、そうでない場合、プログラムは `not a qor1 address` で止まります。 |
| `1`（2番目の値） | QOR での金額です。`1` は 1 QOR、つまり 1,000,000 uqor を意味します。`0.5` のような小数も使えます。 |
| `--memo "text"` | 省略可能です。メモは、トランザクションに添付されてチェーン上に保存される短いテキストです。スペースが入る場合は引用符で囲みます。誰でも読めるので、秘密の内容は書かないでください。 |

オプション `--memo` は、例のとおり、受取人と金額の後ろに置きます。

**表示されるはずのもの:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

`fee` は uqor で表示され、1 QOR をはるかに下回ります。プログラムは `explorer` のリンクと `chain says` の行（手順10）も表示します。トランザクションハッシュをコピーしておきましょう。

### 10. 任意のトランザクションを検証する {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**何をするか:** チェーンからトランザクションを読み取り、何も送信せずに3つの点を確認します。

| 部分 | 意味 |
| --- | --- |
| `verify` | コマンドです。検証レポートを表示します。 |
| `<TX_HASH>` | トランザクションの64文字のハッシュです。手順9のハッシュを貼り付けます。どのテストネットのトランザクションでも使えます。 |

確認する点:

1. トランザクションが成功した（結果コード 0）。
2. チェーンが、`status=verified` の `pqc_hybrid_verify` イベントを発行した。これは、チェーンが耐量子署名を確認したことを示すものです。
3. トランザクションが、64 バイトの secp256k1 署名とともに、4,627 バイトの ML-DSA-87 署名を持つ `PQCHybridSignature` 拡張を備えている。

**表示されるはずのもの:** 手順9と同じレポートで、最後が `VERIFIED: secp256k1 + ML-DSA-87` になります。確認に失敗した場合、レポートは `NOT VERIFIED as hybrid` と表示し、プログラムはコード 2 で終了します。

### 11. このプログラムを使わずに、もう一つの方法で検証する {#verify-curl}

チェーンに直接尋ねることもできます。必要なのは `curl` だけで、macOS とほとんどの Linux に付属しています。`jq` ツール（省略可能）を使うと、結果が読みやすくなります。macOS は `brew install jq`、Linux は `sudo apt install -y jq` でインストールします。

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| 部分 | 意味 |
| --- | --- |
| `curl -s <address>` | テストネットの REST サービスから応答をダウンロードします。`-s` は進行状況バーを隠します。 |
| `<HASH>` | あなたのトランザクションハッシュです。 |
| `\| jq '...'` | 3つの値を取り出します。`jq` がない場合はこの部分を外し、全文を読んでください。 |

**表示されるはずのもの:**

- 応答に `"code": 0`（トランザクションは成功しました）。`jq` の出力では、1行目が `0` です。
- ML-DSA-87 署名を保持する `PQCHybridSignature` 拡張（タイプ `/qorechain.pqc.v1.PQCHybridSignature`）。base64 テキストの長さは 6,172 文字で、これは 4,627 バイトにあたります。
- `tx_response.events` の中に、`pqc_hybrid_verify` タイプのイベントがあり、属性 `status` が `verified` になっています。

**エクスプローラーで:** https://explore.qore.network を開き、**Testnet** に切り替えて、トランザクションハッシュを検索します。プログラムも直接のリンクを表示します。

### 12. 後片付け {#cleanup}

終わったら、使い捨ての鍵ファイルを削除します。

```bash
rm ~/.config/qday/rust.env
```

`rm` はファイルを削除します。もう必要のないテストネットの鍵にだけ実行してください。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 理由 | 対処 |
| --- | --- | --- |
| `command not found: cargo` または `rustc` | Rust がインストールされていないか、インストール前に開いたターミナルのままです。 | Rust をインストールし（手順1）、ターミナルを閉じて開き直します。 |
| `linker 'cc' not found` または `linking with cc failed` | C コンパイラがありません。 | macOS: `xcode-select --install`。Ubuntu: `sudo apt install -y build-essential`。 |
| `cannot read ... run qday-pay new first` | その場所に鍵ファイルがありません。 | `./target/release/qday-pay new` を実行するか、以前と同じ `QDAY_KEY_FILE` を設定します。 |
| `cannot create ... it may already exist` | 鍵ファイルがすでにあります。プログラムは決して上書きしません。 | そのまま使い続けるか、必要なものが入っていなければ `rm` で削除してから、もう一度 `new` を実行します。 |
| `account qor1... not found on chain yet; fund it first` | アカウントにまだ QOR がないため、チェーン上に存在しません。 | フォーセットから QOR を入手し（手順6）、約10秒待ってから、もう一度試します。 |
| フォーセットがレート制限に達したと表示する | フォーセットは、1アカウントにつき24時間に1回のリクエストです。 | 24時間待つか、別の使い捨てアカウントを使います。 |
| `account has no PQC key and classical fallback is disabled` | 耐量子鍵を登録する前に支払いを送りました。 | `./target/release/qday-pay register` を実行してから、もう一度送ります。 |
| `not a qor1 address` | 受取人が間違っています。たとえば `0x...` アドレスです。 | `qor1...` アドレスを使います。 |
| `transport error` または `error sending request` | インターネットに接続できないか、テストネットに一時的に届きません。 | 接続を確認して、1分後にもう一度試します。 |
| `NOT VERIFIED as hybrid` | トランザクションが失敗したか、ハイブリッド署名のものではありませんでした。 | レポートの `code` を読みます。このプログラムで新しい支払いを送ります。 |
| `pnpm: command not found` | JavaScript のアプリを試しました。この Rust アプリに pnpm は不要です。 | ここでは無視してください。JavaScript のアプリでは `npm install -g pnpm` を実行します。 |
| `EVM authorisation window exhausted` | これは Hardhat アプリのもので、このアプリのものではありません。 | そのアプリで `pnpm window open` を使って新しいウィンドウを開きます。 |
| CORS エラー | これはブラウザアプリのものです。このコマンドラインアプリにはありません。 | ブラウザアプリでは、テンプレートの `/lcd` プロキシを使います。 |

## アカウント {#account}

アカウントは、QoreChain Native の secp256k1 アカウントです（coin type 118、パス `m/44'/118'/0'/0/0`、`qor1...` アドレス）。ML-DSA-87 鍵は、同じリカバリーフレーズから、SDK の正規のアドレス結合ルール（`authenticator::try_derive_pqc_canonical`）で導出されます。1つのリカバリーフレーズで、両方の鍵を復元できます。

## 重要な SDK コード {#code}

これは、`src/main.rs` の `send` コマンドの中核です。

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

登録は1回の呼び出しです。`PqcDx::ensure_pqc_registered()` です。鍵がまだ登録されていない場合にだけ、所有証明付きの `MsgRegisterPQCKeyV2` を送信します。

## 「検証済み」の判定方法 {#verified}

`verify` は `GET /cosmos/tx/v1beta1/txs/{hash}` を読み取り、次の点を確認します。

- トランザクションが成功した（`code 0`）。
- チェーンが、署名者について `status=verified` の `pqc_hybrid_verify` を発行した。
- ボディに、4,627 バイトの ML-DSA-87 署名を持つ `/qorechain.pqc.v1.PQCHybridSignature` 拡張がある（64 バイトの secp256k1 署名とともに）。

## 表示されるはずのもの {#output}

- `new` は `qor1...` アドレスと鍵ファイルの場所を表示します。リカバリーフレーズは決して表示しません。
- `status` は残高と、ML-DSA-87 鍵が登録されているかどうかを表示します。
- `send` は `VERIFIED: secp256k1 + ML-DSA-87` とエクスプローラーのリンクで終わります。
- https://explore.qore.network（Testnet に切り替え）で、トランザクションがそのハッシュで表示されます。

## ネットワークエンドポイント {#access}

| | |
| --- | --- |
| Cosmos チェーン ID | `qorechain-diana`（テストネット専用） |
| REST | `https://api-testnet.qore.host` |
| フォーセット | https://dashboard.qorechain.io/faucet |
| エクスプローラー | https://explore.qore.network（Testnet に切り替え） |

## 使用パッケージ {#packages}

| クレート | バージョン | 用途 |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | アカウント、ハイブリッド署名、REST クライアント、検証ヘルパー |
| `tokio` | 1 | 非同期ランタイム |
| `serde_json` | 1 | チェーンの JSON 応答の読み取り |
| `base64` | 0.22 | 署名サイズの計測 |
| `cosmrs` | 0.22 | `Coin` メッセージ型 |

## ソースコード {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
