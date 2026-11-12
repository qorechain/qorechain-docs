---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python アプリ、Q-Day Airdrop
sidebar_label: Python、Airdrop
sidebar_position: 6
---

# Python アプリ: Q-Day Airdrop

**Q-Day Airdrop** は、テストネットの QOR を、アドレスのリスト全体に**1件の**トランザクションで送る小さな Python ツールです。従来型の secp256k1 鍵と、ポスト量子の ML-DSA-87（FIPS 204）鍵で署名します。そのうえで、両方の署名が検証されたことを、チェーン自身の記録から証明します。QoreChain テストネット（`qorechain-diana`、EVM チェーン ID 9800）で動作します。

## 確認できること {#what-it-shows}

- **Python からの ML-DSA-87 + secp256k1 ハイブリッド署名。**
- **オンチェーンで検証された、ハイブリッド署名トランザクション1件。** 1つの multi-send メッセージで、多くの受取人に一度に支払います。
- **検証レポート。** ツールの言葉ではなく、チェーン自身のトランザクション記録から作られます。

これが重要な理由です。1つの署名でエアドロップ全体が保護され、ML-DSA-87 の半分がポスト量子であるため、将来の量子コンピューターに対しても保護されたままです。[量子耐性トランザクション](/sdk/guides/quantum-safe)を参照してください。

## ステップバイステップ {#run}

以下はすべて、自分のターミナル（macOS、Linux、または WSL を使う Windows）で実行します。使うのは使い捨てのテストネットアカウントだけです。テストネットの QOR に価値はなく、ここで実際のウォレットを使うことはありません。

### 1. ツールをインストールする {#install}

Git と、Python 3.10 以降（`venv` 付き）が必要です。手元の環境を確認します。

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

足りないものがある場合は、先にインストールしてください。たとえば [python.org](https://www.python.org/downloads/) から入手するか、パッケージマネージャーを使います（macOS では `brew install python`、Debian や Ubuntu では `sudo apt install python3 python3-venv git`）。新しいターミナルを開いて、確認をもう一度実行してください。

### 2. コードを取得する {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. 依存関係をインストールする {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

これで、パッケージ `qorechain-sdk==0.13.0` と、その依存パッケージがインストールされます。以降のステップでは、仮想環境を有効にしたままにしてください（新しいターミナルでは、`source .venv/bin/activate` をもう一度実行します）。ツールが起動することを確認します。

```bash
python airdrop.py --help
```

コマンド `new`、`status`、`register`、`drop`、`verify` が表示されるはずです。

### 4. 使い捨てのテストネットアカウントを作る {#key}

```bash
python airdrop.py new
```

新しいリカバリーフレーズを生成し、鍵ファイル `~/.config/qday/python.env`（自分だけが読める、モード 600）に書き込み、`qor1...` で始まるアカウントアドレスだけを表示します。フレーズが表示されることはありません。このファイルを共有せず、コミットせず、メインネットで使い回さないでください。鍵を別の場所に置くには、コマンド名の前に `--key-file /path/to/file` を付けるか（例: `python airdrop.py --key-file ~/my.env status`）、`QORE_KEY_FILE` を設定します。

出力から `qor1...` のアドレスをコピーしてください。なくしてしまっても、`python airdrop.py status` でもう一度表示できます。

### 5. フォーセットでテストネット QOR を受け取る {#faucet}

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` のアドレスを貼り付けて、トークンをリクエストします。フォーセットは24時間に 100 QOR を配布します。
3. 届いたことを確認します。

```bash
python airdrop.py status
```

残高にテストネットの QOR が表示され、ポスト量子鍵は未登録と表示されるはずです。

### 6. ポスト量子鍵を登録する {#register}

```bash
python airdrop.py register
```

これで ML-DSA-87 鍵をチェーンに1回だけ登録します。もう一度実行しても安全です。登録は従来型の署名で行われます。鍵は自分自身の登録に共同署名できないためです。それ以降のトランザクションはすべてハイブリッド署名です。

### 7. 受取人のリストを書く {#list}

1行に1つのテストネットアドレスを書いたテキストファイルを作ります。最初の試しには、`--key-file` で新しいファイルを指定して使い捨てのアドレスをいくつか作るか、同じようにテストネットを使っている友人のアドレスを使います。

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

表示されたアドレスを `addresses.txt` に入れます。

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

空行、`#` のコメント、重複、送信者自身、そして有効な `qor1...` のアカウントアドレスではないものは、警告つきでスキップされます。1回のトランザクションで送れる受取人は最大100件です。リポジトリには、プレースホルダーの行を含むサンプル `addresses.example.txt` もあります。

### 8. エアドロップを送る {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1` は、各受取人に送る QOR 単位の金額です。ツールは概要（受取人の数、1人あたりの金額、合計）を表示して確認を求めます。確認を省略するには `--yes` を付けます。そのあと、トランザクションをシミュレートしてガスを決め、両方の鍵で署名し、1件のトランザクションとしてブロードキャストし、検証レポートを表示します。ブロードキャストが失敗した場合は、1分待って再試行してください。

### 9. 任意のトランザクションを検証する {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

`drop` が表示したハッシュを使います。これは、任意のトランザクションハッシュについて、検証レポートだけを表示します。

## 何が表示されるか {#output}

- `drop` はトランザクションハッシュとブロック高を表示し、続いて検証レポートを表示します。署名者の `pqc_hybrid_verify` ステータスが `verified`、ML-DSA-87 署名が 4627 バイト、コードが 0、そして受取人の数がリストと一致しています。
- エクスプローラーでは、`https://explore.qore.network/tx/<HASH>` を開き、エクスプローラーを **Testnet** に切り替えます。トランザクションは成功と表示され、すべての受取人に支払われています。

## 証拠のしくみ {#proof}

`verify` は、公開テストネット REST エンドポイントの `GET /cosmos/tx/v1beta1/txs/{hash}` を読み取り、次の点を確認します。

- 署名者について、`status=verified` を持つ種類 `pqc_hybrid_verify` のイベントがあること。
- `/qorechain.pqc.v1.PQCHybridSignature` 拡張が、4627 バイトの ML-DSA-87 署名を持っていること（64 バイトの secp256k1 署名と並んで）。
- トランザクションが成功したこと（コード 0）と、何人の受取人に支払ったか。

## 肝心の SDK コード {#code}

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

鍵は `ensure_pqc_registered(...)` で1回だけ登録されます。同じ鍵がすでにチェーン上にあれば、何も行いません。ガスは固定ではありません。実際のハイブリッド署名トランザクションを先にシミュレートし、リミットはシミュレートしたガスの 1.3 倍とし、ガス1単位あたり 0.15 uqor で価格を決めます。

アカウントのコインタイプは 118（`m/44'/118'/0'/0/0`）です。ML-DSA-87 鍵は同じリカバリーフレーズから導出され、`derive_pqc_canonical` でアドレスに紐づけられます。代わりにシードベースのヘルパーで自分のアプリを作る場合、SDK 0.13.0 にはリカバリーコードか、独立した 32 バイトの PQC シークレットが必要です（Python では `unified_account_from_seed(seed32, recovery_code=...)`）。[SDK のインストール](/sdk/install#whats-new-0130)を参照してください。リカバリーコードは絶対に表示しないでください。

## 使用したパッケージ {#packages}

| 項目 | バージョン |
| --- | --- |
| `qorechain-sdk`（PyPI、`qorsdk` としてインポート） | 0.13.0（`requirements.txt` で `qorechain-sdk==0.13.0` に固定） |
| Python | 3.10 以降 |

このツールは、protobuf の型 `Input`、`Output`（`cosmpy.protos.cosmos.bank.v1beta1.bank_pb2` から）と `Coin`（`cosmpy.protos.cosmos.base.v1beta1.coin_pb2` から）もインポートします。これらは SDK に付属しています。全言語の SDK リリース表は [SDK のインストール](/sdk/install)を参照してください。

## 調べるときの参照先 {#access}

| 項目 | 場所 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替えます） |
| フォーセット | https://dashboard.qorechain.io/faucet |
| コード | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
