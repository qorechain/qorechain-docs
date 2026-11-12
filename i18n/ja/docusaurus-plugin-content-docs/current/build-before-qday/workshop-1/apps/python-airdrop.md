---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python アプリ Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python アプリ: Q-Day Airdrop

**Q-Day Airdrop** は、アドレスの一覧全体にテストネット QOR を**1つ**のトランザクションで送る、小さな Python ツールです。トランザクションは、従来型の secp256k1 鍵と、耐量子の ML-DSA-87 鍵（FIPS 204）で署名されます。その後ツールは、チェーン自身の記録から、両方の署名が検証されたことを証明します。QoreChain テストネット（`qorechain-diana`、EVM チェーン ID 9800）で動きます。

**所要時間:** 初回は約20分です（ツールのインストールに10分、セットアップに5分、送信と確認に5分）。

Python を知っている必要はありません。以下のコマンドを1つずつ入力し、結果を「表示されるはずのもの」と見比べるだけです。

## 何がわかるか {#what-it-shows}

- Python からの **ML-DSA-87 + secp256k1 ハイブリッド署名**。
- 1つのマルチ送金メッセージで、多数の受取人に一度に支払う、**チェーン上で検証された、ハイブリッド署名付きのトランザクション1件**。
- ツールの言い分ではなく、チェーン自身のトランザクション記録から作られる**検証レポート**。

なぜ重要か: 1つの署名でエアドロップ全体が守られ、ML-DSA-87 の半分が耐量子であるため、将来の量子コンピューターに対しても守られたままです。[量子安全トランザクション](/sdk/guides/quantum-safe)を参照してください。

:::warning テストネット専用
使うのは使い捨てのテストネットアカウントだけです。テストネットの QOR に価値はありません。このチュートリアルで、本物のウォレット、本物のリカバリーフレーズ、本物の資金を使わないでください。
:::

## 出てくる用語 {#words}

| 用語 | 意味 |
| --- | --- |
| テストネット | QoreChain の練習用コピーです。そこでのコインは無料で、価値はありません。 |
| QOR と uqor | 同じコインの2つの呼び名です。1 QOR = 1,000,000 uqor です。ツールは QOR で金額を尋ねます。手数料は uqor で表示されます。 |
| メモ | 銀行振込のメモ欄のように、トランザクションに添付される短いテキストです。 |
| アドレス | 公開されるアカウント番号です。QoreChain では `qor1` で始まります。共有しても安全です。 |
| 鍵ファイル | 秘密のリカバリーフレーズが入ったファイルです。決して共有しないでください。 |
| フォーセット | 無料のテストネット QOR を配るウェブサイトです。 |
| ハッシュ | トランザクションの一意な ID です。トランザクションを検索するときに使います。 |

## 始める前に {#before}

**Git**（コードをダウンロードします）と、`venv`（ツールのライブラリ用の専用フォルダ）が使える **Python 3.10 以降**が必要です。インストールのたびに、**ターミナルを閉じて新しく開き**、確認コマンドを実行してください。

| ツール | macOS | Windows | Linux（Debian または Ubuntu） | 確認 |
| --- | --- | --- | --- | --- |
| Git | `brew install git`（Homebrew は https://brew.sh から） | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ （インストーラーで「Add python.exe to PATH」にチェックを入れます） | `sudo apt install python3 python3-venv python3-pip` | `python3 --version`（Windows では `python --version`） |

Windows では、PowerShell か Git Bash を使います。このページで `python3` と書かれている箇所は、Windows では通常 `python` を使います。仮想環境をオンにする行（手順3）以外は、すべて同じです。

## テストネットのウォレットと無料の QOR を用意する {#wallet}

ツールは自分で使い捨ての鍵を作る（下の手順4）ので、このチュートリアルにウォレットアプリは不要です。QoreX でアカウントも見てみたい場合は次のようにします。

1. **QoreX アプリ:** 設定を開き、**Use testnet (developers)** をオンにします。
2. **QoreX ブラウザ拡張機能:** ロックを解除し、下部のバージョン番号を 7 回タップして、**Switch to testnet (diana)** を選びます。

無料の QOR は、https://dashboard.qorechain.io/faucet のフォーセットから入手します。サインインし、アドレスを貼り付けてリクエストします。**1アカウントにつき24時間あたり 100 QOR** をもらえます。

新しいアカウントの最初のトランザクションは、耐量子の ML-DSA-87 鍵をチェーンに登録します。これは約 0.09 QOR の手数料がかかる、一度きりのステップです。ツールが `register` コマンドで代わりに行います。

## 手順 {#run}

### 1. コードをダウンロードする {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**何をするか**

- `git clone <address>`: プロジェクトを GitHub から、`build-before-qday` という新しいフォルダにコピーします。
- `cd <folder>`: ターミナルを Python アプリのフォルダに移動します。以降のコマンドは、すべてこのフォルダから実行する必要があります。

**表示されるはずのもの:** `Cloning into 'build-before-qday'...` のような行、そしてプロンプトが新しいフォルダになります。

### 2. Python の専用環境を作る {#venv}

```bash
python3 -m venv .venv
```

**何をするか:** このツールのライブラリを入れる `.venv` というフォルダを作ります。お使いのコンピューター上の他のものと混ざらないようにするためです。

| 部分 | 意味 |
| --- | --- |
| `python3` | Python のプログラムです。 |
| `-m venv` | Python に組み込まれた「仮想環境」を作る機能を実行します。 |
| `.venv` | 作成するフォルダの名前です。 |

**表示されるはずのもの:** 何も表示されず、新しい `.venv` フォルダができます。

### 3. 専用環境をオンにして、ライブラリをインストールする {#deps}

```bash
source .venv/bin/activate
```

Windows の PowerShell では、代わりに `.venv\Scripts\activate` を使います（PowerShell にブロックされた場合は、`Set-ExecutionPolicy -Scope Process RemoteSigned` を実行してからもう一度試します）。Windows のコマンドプロンプトでは `.venv\Scripts\activate.bat` を使います。

**何をするか:** ターミナルが専用環境を使うように切り替えます。

**表示されるはずのもの:** プロンプトの先頭に `(.venv)` が付きます。新しいターミナルを開くたびに、同じコマンドでもう一度オンにします。

```bash
pip install -r requirements.txt
```

| 部分 | 意味 |
| --- | --- |
| `pip` | Python のライブラリインストーラーです。 |
| `install` | ライブラリをダウンロードしてインストールします。 |
| `-r requirements.txt` | このファイルからライブラリの一覧を読み込みます。ライブラリ `qorechain-sdk==0.13.0`（QoreChain SDK、正確にバージョン 0.13.0）と、それが必要とするものが書かれています。 |

**表示されるはずのもの:** ダウンロードの行が続き、`Successfully installed ... qorechain-sdk-0.13.0` で終わります。新しい pip が利用可能という通知は、問題ありません。

**かかる時間:** 約15秒〜1分です。

ツールが起動することを確認します。

```bash
python airdrop.py --help
```

**表示されるはずのもの:** コマンド `new`、`status`、`register`、`drop`、`verify`。

### 4. 使い捨てのテストネットアカウントを作る {#key}

```bash
python airdrop.py new
```

**何をするか:** 新しいアカウントを作ります。秘密のリカバリーフレーズを、鍵ファイル `~/.config/qday/python.env`（ホームフォルダの中で、あなただけが読めます）に書き込み、公開アドレスだけを表示します。

| 部分 | 意味 |
| --- | --- |
| `new` | 新しい鍵ファイルを作り、そのアドレスを表示します。 |
| `new --force` | 既存の鍵ファイルを置き換えます。古い鍵は失われます。 |

**表示されるはずのもの:** `New testnet wallet`、`qor1...` で始まる `address`、`(mode 600, mnemonic not shown)` が付いた鍵ファイルのパス、そして次の手順へのヒント。

**`qor1...` アドレスをコピーしてください。** なくしても、`python airdrop.py status` でもう一度表示できます。鍵ファイルは決して共有せず、Git にコミットせず、メインネットで再利用しないでください。

鍵を別の場所に置くには、`--key-file` を、コマンド名の**前**に付けます。

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>` は「デフォルトの代わりに、この鍵ファイルを使う」という意味です。順序が重要です。`--key-file` は、`status`、`drop` などのコマンドの前に置きます。代わりに、環境変数 `QORE_KEY_FILE` を設定することもできます。

### 5. フォーセットからテストネット QOR を入手する {#faucet}

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` アドレスを貼り付けて、リクエストボタンを押します。
3. 数秒待ってから、次を実行します。

```bash
python airdrop.py status
```

**何をするか:** テストネットに、あなたの残高と、耐量子鍵が登録されているかどうかを問い合わせます。

**表示されるはずのもの:** 残高（約 100 QOR）と、ML-DSA-87 鍵がまだ登録されていないという警告。アドレスが「is not on chain yet」と表示される場合は、フォーセットの支払いがまだ届いていません。10秒待ってから、もう一度試します。

### 6. 耐量子鍵を登録する {#register}

```bash
python airdrop.py register
```

**何をするか:** あなたの ML-DSA-87 鍵をチェーンに、一度だけ記録します。もう一度実行しても安全です。この最初のトランザクションは、従来型で署名されます。鍵は自分自身の登録に共同署名できないためです。約 0.09 QOR かかります。これ以降のトランザクションは、すべてハイブリッド署名になります。

**表示されるはずのもの:** トランザクションハッシュと、`registered` の行（2回実行した場合は `already registered`）。

**かかる時間:** 数秒です（1ブロック）。

### 7. 受取人の一覧を書く {#list}

使い捨ての受取人アカウントを2つ作ります。それぞれに専用の鍵ファイルを持たせます。

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**何をするか:** 先ほどと同じ `new` ですが、`--key-file` によって各鍵がそれぞれのファイルに保存されるため、何も上書きされません。（テストネットを使っている友人のアドレスを使うこともできます。）

**表示されるはずのもの:** 2つの異なる `qor1...` アドレス。両方をコピーします。

次に、このフォルダに `addresses.txt` というプレーンテキストのファイルを作り、1行に1つのアドレスを書きます。どんなテキストエディタでも構いません（Windows ではメモ帳、macOS ではプレーンテキストモードのテキストエディット、Linux では `nano addresses.txt`）。

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

2つの例の行を、実際のアドレスに置き換えてください。空行、`#` のコメント、重複、送信者自身、有効な `qor1...` アドレスではないものは、警告付きでスキップされます。1つのトランザクションにつき、受取人は最大 100 件です。フォルダには、プレースホルダーの行が入ったサンプル `addresses.example.txt` もあります。

### 8. エアドロップを送る {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| 部分 | 意味 |
| --- | --- |
| `drop` | 一覧のすべての人に支払う、1つのトランザクションを送ります。 |
| `addresses.txt` | 受取人が書かれたファイルです。 |
| `0.1` | **受取人1人あたり**の QOR 金額です（0.1 QOR = 100,000 uqor）。受取人が2人なら、合計 0.2 QOR になります。 |
| `--memo "..."` | トランザクションに添付される短いテキストです。省略可能です。 |
| `--yes`（または `-y`） | 省略可能です。「よろしいですか」という確認をスキップします。 |

オプションの順序: 金額とファイルが先で、`--memo` と `--yes` はその後ろに置きます。`--key-file` は違います。`drop` の前に置きます。

**何をするか:** 概要（受取人、1人あたりの金額、合計）を表示し、確認を求めます。`y` を入力して Enter を押します。その後、チェーンに必要なガスの量を問い合わせ（試験実行）、安全マージンとして 30 パーセントを加え、両方の鍵で署名して1つのトランザクションを送信し、検証レポートを表示します。

**表示されるはずのもの:** トランザクションハッシュと高さ、続いてレポート。内容は、コード 0、署名者の `pqc_hybrid_verify` のステータスが `verified`、4,627 バイトの ML-DSA-87 署名、そして一覧と一致する受取人の数です。ハッシュをコピーしておきます。

**かかる時間:** 約10秒です。

### 9. 任意のトランザクションを検証する {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**何をするか:** チェーンからトランザクションを読み取り、検証レポートだけを表示します。自分のものに限らず、どのトランザクションハッシュでも使えます。

**表示されるはずのもの:** 手順8の最後と同じレポート。

## トランザクションを自分で検証する {#check}

ツールを信頼する必要はありません。チェーンに直接尋ねてみましょう。

**方法1: ブラウザで。** `https://explore.qore.network/tx/<HASH>` を開き（`<HASH>` の代わりに自分のハッシュを入れます）、エクスプローラーを **Testnet** に切り替えます。すべての受取人に支払われた、成功したトランザクションが表示されるはずです。

**方法2: 1つのコマンドで:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| 部分 | 意味 |
| --- | --- |
| `curl` | ウェブアドレスをダウンロードするツールです。macOS、Windows 10 以降、ほとんどの Linux に組み込まれています。 |
| `-s` | サイレントです。進行状況バーを隠します。 |
| アドレス | 公開テストネットの REST API です。トランザクションの完全な記録を JSON で返します。 |

**表示されるはずのもの**（長い出力の中で。jq を入れていれば `| jq .` を付けます。https://jqlang.github.io/jq/download/ を参照）:

- `"code": 0` は、トランザクションが成功したことを意味します。
- 64 バイトの従来型署名と並んで、**4,627 バイト**の `pqc_signature`（ML-DSA-87 署名）を持つ `PQCHybridSignature` 拡張。
- あなたのアドレスについて、`status` が `verified` になっている `pqc_hybrid_verify` イベント。

## 証明の仕組み {#proof}

`verify` は、公開テストネットの REST エンドポイントから `GET /cosmos/tx/v1beta1/txs/{hash}` を読み取り、次の点を確認します。

- 署名者について、`status=verified` の `pqc_hybrid_verify` タイプのイベントがある。
- `/qorechain.pqc.v1.PQCHybridSignature` 拡張が、4,627 バイトの ML-DSA-87 署名を持っている。
- トランザクションが成功していて（コード 0）、何人の受取人に支払ったか。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 理由 | 対処 |
| --- | --- | --- |
| `python3: command not found` またはバージョンが 3.10 未満 | Python がないか、古いです。 | Python 3.10 以降をインストールし、新しいターミナルを開きます。Windows では `python` を使います。 |
| `No module named venv` または `ensurepip is not available` | Python の venv の部分がインストールされていません（Debian、Ubuntu）。 | `sudo apt install python3-venv` を実行してから、手順2をやり直します。 |
| `ModuleNotFoundError: No module named 'qorsdk'` | 環境がオンになっていないか、インストールを飛ばしました。 | `source .venv/bin/activate` を実行してから、`pip install -r requirements.txt` を実行します。 |
| `unrecognized arguments: --key-file` | `--key-file` をコマンドの後ろに置きました。 | 前に置きます: `python airdrop.py --key-file <path> status`。 |
| `no key file at ... Run: python airdrop.py new` | 手順4を飛ばしたか、別の `--key-file` を使っています。 | `python airdrop.py new` を実行します。 |
| `... already exists (use --force to replace it)` | 鍵ファイルがすでにあります。 | そのまま使うか、`python airdrop.py new --force` を実行します（古い鍵は失われます）。 |
| `... is readable by others (mode ...)` | 鍵ファイルの権限が開きすぎています。 | `chmod 600 <path>` を実行します。 |
| `... is not on chain yet (fund it first)` | フォーセットの QOR がまだ届いていません。 | 10秒待つか、フォーセットにリクエストします。 |
| `account has no PQC key and classical fallback is disabled` | 耐量子鍵がまだ登録されていません。 | 先に `python airdrop.py register` を実行します。 |
| `the ML-DSA-87 key is not registered yet` | 同じ理由で、ツールが送信前に見つけたものです。 | `python airdrop.py register` を実行します。 |
| `balance too low` | 合計金額と手数料が、持っている残高を超えています。 | 金額を減らすか、次のフォーセットのリクエストを待ちます。 |
| フォーセットがレート制限と表示する | 1アカウントにつき24時間に1回のリクエストです。 | 待つか、別の使い捨てアカウントを使います。 |
| `skip line N: not a valid qor1 address` | `addresses.txt` のある行が、正しいアドレスではありません。 | その行を直すか削除します。他の行はそのまま使えます。 |
| `no valid recipients` | すべての行がスキップされました。 | `addresses.txt` に、本物の `qor1...` アドレスが入っているか確認します。 |
| `bad amount` | 金額が普通の数字ではありません。 | `0.1` のように、QOR を数字で指定します。 |
| `refused by the node: code ...` | チェーンがトランザクションを拒否しました。 | メッセージを読みます。テストネットが混雑しているかアップグレード中なら、1分待ってからやり直します。 |
| `transaction not found on the testnet` | ハッシュが違うか、ブロックがまだ確定していません。 | ハッシュを確認し、数秒後にもう一度試します。 |
| `the testnet may be pausing for an upgrade` | 公開エンドポイントが IP アドレスごとにリクエストを制限しているか、テストネットがアップグレード中です。 | 1分待って、もう一度実行します。 |
| `EVM authorisation window exhausted` | これは EVM アプリのもので、このアプリのものではありません。 | EVM アプリで `pnpm window open` を使って新しいウィンドウを開きます。 |
| ウィンドウを開いた後の `HHE10402` | Hardhat アプリのみです。ウィンドウがまだ有効になっていませんでした。 | もう一度デプロイを実行します。 |
| ブラウザでの `CORS` エラー | ウェブページがチェーンを直接呼び出す場合だけです。このツールでは起きません。 | ブラウザアプリでは、テンプレートの `/lcd` プロキシを使います。 |
| `pnpm: command not found` | pnpm がインストールされていません。ここでは不要です。 | Hardhat チュートリアルの場合だけ: `npm install -g pnpm` を実行します。 |

## 重要な SDK コード {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

鍵は `ensure_pqc_registered(...)` で一度だけ登録されます。同じ鍵がすでにチェーン上にある場合は、何もしません。ガスは固定されません。実際のハイブリッド署名付きトランザクションが先にシミュレーションされ、上限はシミュレーションされたガスの 1.3 倍で、1 ガスあたり 0.15 uqor の価格で設定されます。

アカウントは coin type 118（`m/44'/118'/0'/0/0`）です。ML-DSA-87 鍵は同じリカバリーフレーズから導出され、`derive_pqc_canonical` でアドレスに結び付けられます。代わりにシードベースのヘルパーで自分のアプリを作る場合、SDK 0.13.0 ではリカバリーコードか、独立した 32 バイトの PQC シークレットが必要です（Python では `unified_account_from_seed(seed32, recovery_code=...)`）。[SDK のインストール](/sdk/install#whats-new-0130)を参照してください。リカバリーコードは決して表示しないでください。

## 使用パッケージ {#packages}

| 項目 | バージョン |
| --- | --- |
| `qorechain-sdk`（PyPI、`qorsdk` としてインポート） | 0.13.0（`requirements.txt` で `qorechain-sdk==0.13.0` として固定） |
| Python | 3.10 以降 |

ツールは、protobuf 型の `Input`、`Output`（`cosmpy.protos.cosmos.bank.v1beta1.bank_pb2` から）と `Coin`（`cosmpy.protos.cosmos.base.v1beta1.coin_pb2` から）もインポートします。これらは SDK に付属しています。全言語のリリース表は、[SDK のインストール](/sdk/install)を参照してください。

## 調べる場所 {#access}

| 項目 | 場所 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替え） |
| フォーセット | https://dashboard.qorechain.io/faucet |
| コード | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
