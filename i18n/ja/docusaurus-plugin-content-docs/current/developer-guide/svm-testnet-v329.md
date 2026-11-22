---
slug: /developer-guide/svm-testnet-v329
title: "テストネットの SVM: プログラムのデプロイと Solana トランザクションの送信 (v3.2.9)"
sidebar_label: SVM テストネット (v3.2.9)
sidebar_position: 11
---

# テストネットの SVM: プログラムのデプロイと Solana トランザクションの送信 (v3.2.9)

リリース **v3.2.9** により、標準の Solana コマンドラインが QoreChain と通信できるようになります。テストネットに対して `solana transfer`、`solana program deploy`、`anchor deploy`、web3.js スクリプトを実行でき、チェーンはすべての Solana 署名を自分で検証します。Solana 鍵だけでは、あなたの QoreChain アカウントには触れられません。まず、**ポスト量子鍵**で署名したトランザクションで、小さく範囲を限った**認可ウィンドウ**を開きます。そしてそのウィンドウは、Solana 鍵が自身の署名で、その鍵を持っていることを証明したときにだけ受理されます。ウィンドウが終わると、その鍵は再び普通の Solana アカウントに戻ります。

このページでは、開発者が空のマシンから、テストネット上でプログラムをデプロイして呼び出すまでを説明します。新しい点、ツール、鍵の証明を手作業で作る方法、ウィンドウの開閉、デプロイ用鍵への入金、`solana` または `anchor` でのデプロイ、プログラムの呼び出し、結果の読み取り、そして実際のエラーテキストの表です。

:::note テストネットのみ。2026 年 11 月 22 日に確認
ここにあるすべては **`qorechain-diana`** テストネットで動作します。このテストネットは 2026 年 11 月 20 日から v3.2.9 を実行しています (ガバナンス提案 39、ブロック高 10,424,000)。Solana 互換 (SVM) レーンは、ガバナンス提案 37 以降、そこで開放されています。**これらはメインネットでは動作しません。** `qorechain-vladi` では SVM レーンはオフで、クロス VM 呼び出しは停止されたまま、CosmWasm コントラクトのアップロードはガバナンスのみのままです。ビルドはテストネットに対してのみ行ってください。テスト QOR に価値はありません。使い捨ての鍵を使ってください。

このページの読み取り呼び出し、手数料の見積もり、nonce ルート、鍵の証明の例は、2026 年 11 月 22 日にライブのテストネットに対して実行されました。完全なフロー (ウィンドウ、入金、デプロイ、呼び出し、アップグレード、クローズ) は、リリース前に、未改造の `solana-cli` 4.0.2 と `anchor-cli` 1.2.2 を使ってローカルのテストネットワークで実行されました。正確な内訳は[確認した内容](#tested)を参照してください。
:::

:::caution パブリックゲートウェイはまだトランザクションを中継しません
2026 年 11 月 22 日、`https://svm-testnet.qore.host` は、形式が正しいすべての `sendTransaction` に `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` と応答しました。読み取りと手数料の見積もりは動作しますが、そのゲートウェイの運用者がリレーヤーアカウントを設定するまで、書き込みは拒否されます。ウィンドウまでのステップにゲートウェイは不要です。送信するステップについては、[パブリックゲートウェイなしで送信する](#relay)を参照し、始める前にエンドポイントを再確認してください。[ステップ 1](#step-config) のコマンドを実行し、次に[ステップ 6](#step-fund) のように `solana transfer` を実行します。
:::

## v3.2.9 での SVM の新機能 {#whats-new}

* **オンチェーンの Solana ワイヤートランザクション。** Solana ウォレットまたはツールが署名したトランザクションは、Native メッセージ `MsgSolanaTransaction` の中に、バイト単位でそのまま載せられます。チェーンはすべての ed25519 署名、最近のブロックハッシュ、手数料支払者を検証し、命令を 1 つのアトミックなステップとして順に実行し、すでに見た署名を拒否します。このメッセージは、それ自身を運ぶトランザクションのトップレベルメッセージとしてのみ実行されます。authz のもとや、コントラクトがディスパッチしたときは拒否されます。
* **実行せずに中継するゲートウェイ。** ノードの Solana JSON-RPC メソッド `sendTransaction` は、ノード上では何も実行しなくなりました。トランザクションをデコードし、破棄されるステートのコピー上でシミュレートし、キャリアトランザクションを両方の鍵で署名してメモリプールに送るリレーヤーアカウントに引き渡します。ブロックを通ったものだけがステートを変えます。あなたの ed25519 署名はオンチェーンで検証されるため、リレーヤーはあなたのトランザクションに対する権限を得ません。
* **Solana 鍵向けのポスト量子認可ウィンドウ。** `MsgOpenSVMWindow` は 1 つの ed25519 鍵を指定し、ブロック数、トランザクション数、QOR の価値で制限します。必要に応じて、リストされたプログラムに限定することもできます。ウィンドウが開いている間、その鍵が署名したトランザクションはあなたのアカウントのために動作します。開くには**ML-DSA-87 署名**が必要なので、漏洩した Solana 鍵だけでウィンドウを開くことは決してできません。
* **鍵の証明。** ウィンドウを開くには `svm_key_proof` (フィールド 7) が必要です。これは Solana 鍵自身が作る 64 バイトの Ed25519 署名で、チェーン、あなたのアカウント、鍵を示す短いテキストに対するものです。公開鍵は公開されているので、ウィンドウを開く人がその鍵を持っていることを示すのがこの証明です。
* **1 つの証明で開けるウィンドウは 1 つ。** テキストにはカウンター (nonce) が含まれ、その鍵に対してウィンドウが開かれるたびに増えるため、古い証明を再利用することはできません。
* **プログラムローダー。** アップグレード可能なローダーが利用できるので、`solana program deploy`、`write-buffer`、`extend`、`set-upgrade-authority`、`close`、`anchor deploy` が動作し、プログラムは権限者によってアップグレードでき、クローズしてレントを取り戻せます。
* **Solana ツールが理解できる手数料。** `getFeeForMessage` と `simulateTransaction` が実際の手数料を報告するため、デフォルトの `solana` と web3.js の手数料チェックは、追加のフラグなしで正しく動作します。トランザクションの手数料が安すぎる場合、エラーには設定すべき正確な価格が含まれます。
* **authz グラントの予算。** 他者が authz グラントのもとであなたの名前で送った `MsgExecuteProgram`、`MsgCreateAccount`、`MsgDeployProgram` は、ウィンドウとその別立ての代理予算の内側でのみ実行されます。

### トランザクションの経路 {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

Solana の手数料はリレーヤーに渡るため、リレーヤーが持ち出しになることはありません。ゲートウェイのすべての回答は確定的です。ブロックは一度だけコミットされるので、`processed`、`confirmed`、`finalized` は同じデータを返します。

### ウィンドウ: 何を制限するか {#window}

| 制限 | 意味 | 範囲 |
| ----- | ------------- | ----- |
| ブロック | ウィンドウはこのブロック数の後に失効します。テストネットでは 1 ブロックに約 1.4 秒かかる (2026 年 11 月 22 日に確認) ため、3,600 ブロックは約 85 分です | 1 から 17,280 |
| トランザクション | 受理された Solana トランザクションは、その後に失敗しても 1 つと数えられます | 1 から 1,000 |
| 価値 | 受理されたトランザクションによって生じる、アカウントのネイティブ QOR の減少はすべて (手数料を含めて) カウントされます。価値を超えることになるトランザクションは拒否され、revert されます。価値は uqor または QOR で指定します。たとえば `25qor` | 0 より大きい値 |
| プログラム (任意) | 受理されるトランザクションのすべての命令は、リストされたプログラムのいずれかを呼び出さなければなりません | 最大 16 |

設計から導かれるルール:

* ウィンドウを開くことと閉じることは、トップレベルメッセージとしての**あなた自身のポスト量子署名**のみで行われます。authz、グループ、コントラクトのもとでは拒否されます。
* ウィンドウを開く前に、**登録済みのポスト量子鍵**が必要です。
* **1 つの Solana 鍵が同時に認可できるアカウントは 1 つです。** ウィンドウを再び開くと古いものが置き換えられ、その鍵が解放されます。
* **ポスト量子鍵を変更またはマイグレーションすると、ウィンドウは終了します。**
* ネイティブ残高に加えて、価値の制限は、あなたの署名が別の場所で管理している QOR もカウントします。あなたのアカウントからシードで導出されたアカウント、あなたがクローズできるトークンアカウント、あなたが権限者であるルックアップテーブルとローダーのアカウントです。使われたか他者に渡された場合、それらはカウントされます。ウィンドウ鍵が、あなたのアカウント自身のアドレスをウォレットステートから外すことは決してできません。
* ウィンドウが開いている間、ウィンドウ鍵に対する `getBalance` または `getAccountInfo` の読み取りは、あなたのネイティブ残高を示します。

### ウィンドウの既知の制限 {#window-limits}

トークンを保有するウォレットのためにウィンドウを開く前に、これらをお読みください。

* **トークンの量は価値の制限にカウントされません。** 制限がカウントするのはネイティブ QOR のみです。デフォルトのスコープ (プログラムリストなし) では、Solana 鍵は、トランザクション手数料だけで、アカウントの SPL トークンを転送およびバーンでき、アカウントが保有するミント権限でミントもできます。
* **デフォルトのスコープは永続的なグラントを拒否します。** デフォルトスコープのウィンドウを通じて動作する鍵は、デリゲートの承認、トークンアカウントのオーナーやクローズ権限の変更、ミントやフリーズ権限の変更を行えません。これには、同じトランザクションの中で作成されたトークンアカウントやミントも含まれます。これらにはあなた自身のポスト量子署名が必要か、プログラムリストがトークンプログラムを指定しているウィンドウが必要です。
* **共同署名者の支払いはウィンドウにカウントされます。** 別の鍵が同じ Solana トランザクションに署名し、その中で何かを支払う場合、その支払いもあなたの価値の制限にカウントされます。スポンサーには別のトランザクションで支払わせるか、トランザクションが動かすすべてをカバーする価値の制限を持つウィンドウを開いてください。
* **明示的なトークンスコープのもとで行われたグラントは、ウィンドウより長く残ります。** プログラムリストがトークンプログラムを指定している場合、ウィンドウを通じて行われたデリゲートや権限の変更は、ウィンドウがクローズまたは失効した後も、あなたのポスト量子鍵がローテーションされた後も、そのまま残ります。あなた自身の署名で取り消してください。
* **トークン操作を完全に除外するには、** トークンプログラムを指定しないプログラムリストでウィンドウを開いてください。

### 手数料 {#fees}

| 項目 | 値 (テストネット、2026 年 11 月 22 日) |
| ---- | --------------------------------- |
| 署名あたりの基本手数料 | 0.045 QOR (45,000 uqor、45,000,000 lamports)。これはチェーンの最低ガス価格であるガス 1 単位あたり 0.1 uqor での 450,000 ガスの価格で、`getFeeForMessage` が報告します |
| 画面上の単位 | `solana` は金額を **SOL** と表示します。QoreChain では、1 uqor が 1,000 lamports で 1 QOR が 1,000,000 uqor なので、1 「SOL」は 1 QOR です。「0.045 SOL」は 0.045 QOR と読み替えてください |
| 優先手数料 | トランザクションが基本手数料の賄う以上のガスを必要とする場合のみ。ComputeBudget の価格にユニット上限を掛けたものです |
| デプロイ | 書き込みトランザクションごとに 1 回の基本手数料に加え、プログラムをクローズすると戻るレント |

支払う額は、署名した内容によって上限が決まります。キャリアトランザクションのコスト (基本手数料以上、あなた自身の署名が約束した手数料以下) を支払います。リレーヤーがそれ以上を支払わせることはできません。

トランザクションが支払う額がキャリアのコストを下回ると、ゲートウェイはコード `-32002` で拒否し、正確な修正方法を伝えます。同じ数値がエラーの `data` にもあります。

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

ゼロは、あなたのトランザクションの数値を表しています。`SetComputeUnitPrice` を `data.computeUnitPrice` に、ユニット上限を少なくとも `data.computeUnitLimit` に設定してください。1 マイクロ lamport でも下回ると、再び拒否されます。`solana program deploy` では `--with-compute-unit-price <data.computeUnitPrice>` を使います。リリース前の実行では、通常のプログラムのデプロイ、アップグレード、拡張、クローズ、権限変更のすべてのステップが基本手数料に収まったため、このエラーに遭遇するのは主に、異常に大きな `--max-len` のときです。

### 代理予算 {#on-behalf}

`MsgExecuteProgram`、`MsgCreateAccount`、`MsgDeployProgram` をあなたの名前で送る authz グランティは、あなたのウィンドウとその**別立ての代理予算**である `on_behalf_max_txs` と `on_behalf_max_value` の内側でのみ動作します。鍵自身の制限と代理予算は、互いを使い果たすことはありません。代理予算がない場合 (デフォルト) は、そのようなグラントは拒否され、何も動きません。アカウント自身をグランティとする authz 実行にラップされた `MsgExecuteProgram` も、あなたの代理で送られたものとしてカウントされるため、あなた自身の SVM メッセージはトップレベルメッセージとして送ってください。

ネストされた実行やデプロイのたびに、あなたのアカウントは SVM の固定手数料 `max(1, compute_budget_max / 1000)` uqor も支払います。ライブのパラメータ値 1,400,000 では 1,400 uqor です。この手数料は代理の価値の制限にカウントされます。`--on-behalf-max-value` は、少なくとも `on_behalf_max_txs` に固定手数料を掛けた値に、グランティが動かす予定の価値を加えた値に設定してください。値が 0 だと、すべての代理実行が拒否されます。

### ローダー {#loader}

| 実行するもの | オンチェーンでの動作 |
| ------- | --------------------- |
| `solana program deploy x.so` | プログラムを多数の小さなトランザクションでバッファに書き込み、その後デプロイします。プログラム ID は `--program-id` で指定したもの、または新しいものです |
| 既存のプログラムに対する `solana program deploy --program-id <id> x.so` | アップグレードします。これを行えるのはアップグレード権限者のみです |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | デプロイせずにバッファの書き込み、一覧表示、クローズを行います |
| `solana program extend <id> <bytes>` | プログラムのデータ領域を大きくします |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | アップグレードの権限を別の鍵に渡します。`--final` でプログラムを恒久化します |
| `solana program close <id>` | プログラムをクローズし、レントを返します |
| `anchor deploy` | Anchor でビルドしたプログラムで同じことを行います |

プログラムは最大 10 MiB です (ライブの `max_program_size`)。プログラムは互いを最大 4 階層まで呼び出します (`max_cpi`)。デフォルトのコンピュートバジェットは、命令あたり最大 1,400,000 ユニットです。

## このガイドで使う用語 {#words}

| 用語 | わかりやすい意味 |
| ---- | ------------- |
| SVM | QoreChain の Solana 互換仮想マシン。Solana と同じコンパイル済みプログラム (SBF) を実行します |
| Lamport | Solana ツールでの最小単位。1 uqor は 1,000 lamports で、1 QOR は 1,000,000,000 lamports です |
| ウィンドウ | 1 つの Solana 鍵があなたのアカウントのために動作するための、短く範囲を限った権限。開くにはポスト量子鍵で署名したトランザクションが必要です |
| 鍵の証明 | 短いテキストに対する Solana 鍵自身の署名。あなたが指定した鍵を持っていることを証明します |
| Nonce | Solana 鍵ごとのカウンターで、証明付きで開かれたウィンドウごとに増えます。次の証明は現在の値に署名しなければなりません |
| キャリア | 1 つの Solana トランザクションをブロックに載せて運ぶ Native トランザクション |
| リレーヤー | キャリアに署名して送るアカウント。Solana の手数料がこれを補填します |
| ブロックハッシュ | Solana トランザクションが構築される基準となる最近のブロックハッシュ。150 スロット、ここでは約 3.5 分間有効です |

## 始める前に {#prerequisites}

macOS または Linux のターミナル、約 10 QOR のテスト QOR、そして以下のツールが必要です (右の列のバージョンは、このページで使用したものです)。

| ツール | 用途 | 使用バージョン |
| ---- | -------- | ------------ |
| Solana コマンドライン (Agave) | `solana`、`solana-keygen` | `solana-cli` 4.0.2 |
| Rust と `cargo build-sbf` | プログラムのビルド | `cargo-build-sbf` 4.0.0、platform tools v1.53、`rustc` 1.89 |
| Anchor (任意) | `anchor build`、`anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 以降 | 鍵の証明スクリプトと呼び出しスクリプト | 現行の任意の LTS |
| `@solana/web3.js` 1.x | プログラムの呼び出し | 1.99 |
| `qorechaind` v3.2.9 | ポスト量子鍵の登録、ウィンドウの開閉 | リリースバイナリ。下記参照 |

お持ちのものを確認します。

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**`qorechaind` について。** ウィンドウを開くのは、ML-DSA-87 署名が必要な Native メッセージで、コマンド `tx pqc open-svm-window` は v3.2.9 に含まれています。2026 年 11 月 22 日の時点で、テストネットのリリースマニフェスト (`https://download.qore.host/testnet/latest.json`) はまだバージョン 3.2.8 を挙げていたため、v3.2.9 のバンドルは、ガバナンス提案 39 の本文に記載されているものです (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`)。リリースバイナリは Linux 向けにビルドされており、パッケージ化された macOS バイナリはありません。ウィンドウ用の SDK ヘルパーはまだ公開されていません。それ以外のこのガイドの内容に、ノードは不要です。

テスト QOR を持つ QoreChain アカウント ([ファウセット](/dashboard/faucet)で入手) と、登録済みのポスト量子鍵も必要です。まだの場合は、先に[鍵の登録](/developer-guide/post-quantum-signing#pqc-key-registration)に従ってください。以下のコマンドでは、アカウント鍵を `mykey`、そのポスト量子鍵を `mykey-mldsa` と呼びます。

:::caution 使い捨てのテストネット鍵のみ
以下で作る 2 つの Solana キーペアは、秘密鍵の入ったファイルです。ほかのネットワークで実際の資金を保有するキーペアは決して使わず、秘密鍵をコマンド、チャット、リポジトリに貼り付けないでください。
:::

## ステップごとの手順 {#steps}

通常の `solana` の設定に触れないよう、作業用フォルダーと別の Solana 設定を 1 つ作ります。

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

このエイリアスは、専用の設定ファイルで `solana` を実行します。同じターミナルを使い続けるか、新しいターミナルでエイリアスを再度設定してください。

### ステップ 1: Solana ツールをテストネットに向ける {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

1 行目は RPC アドレスを `solana-config.yml` に保存します。2 行目はノードにバージョンを尋ねます。`solana-core` の `1.18.0-qorechain`、チェーン ID `qorechain-diana`、ジェネシスハッシュ `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` が表示されます (HTTP 200)。3 行目は現在のスロットを表示し、これはブロック高と等しくなります (2026 年 11 月 22 日には約 1,057 万)。

レーンのパラメータが、何が収まるかを決めます。一度読み取ってください。

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

`"enabled":true` と、ライブのテストネットの制限が表示されます。`max_program_size` は 10,485,760、`compute_budget_max` は 1,400,000、`lamports_per_byte` は 3,480、`max_cpi` は 4 です。`enabled` が `false` の場合、レーンは閉じており、以下のどれも動作しません。

パブリックエンドポイントは websocket を提供しない (2026 年 11 月 22 日に websocket アップグレードは HTTP 405 を返しました) ため、トランザクションを確認するコマンド (`solana program deploy`、`write-buffer`) には `--use-rpc` を付け、ツールが通常の HTTP でポーリングするようにしてください。Anchor では、ダブルダッシュの後ろに付ければ受け付けられます。

### ステップ 2: Solana キーペアを 2 つ作る {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

最初の 2 つのコマンドは、それぞれキーペアファイルを書き出します (64 個の数値の JSON 配列で、32 バイトの秘密シードの後に公開鍵が続きます)。最後の 2 つは、公開鍵を base58 のテキストで表示します。32 から 44 文字の、異なる 2 つのアドレスが表示されます。これらを `WINDOW_PUBKEY` と `DEPLOYER_PUBKEY` と呼びます。

なぜ 2 つの鍵なのか。**ウィンドウ鍵**は、短い間あなたの Native アカウントのために動作します。それ自体は何も保有せず、ウィンドウの内側であなたの QOR を使います。**デプロイ用鍵**は普通の Solana 鍵です。ウィンドウから入金しておけば、その後はウィンドウなしで、プログラムのデプロイ、アップグレード、所有を行います。ウィンドウ鍵をアップグレード権限者として使わないでください。プログラムはあなたの Native アカウントを権限者として記録するため、記録された権限者ではない鍵で署名されたアップグレードを `solana` は拒否します。

デプロイ用鍵を、Solana 設定のデフォルト署名者に設定します。

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### ステップ 3: ポスト量子鍵を登録する {#step-pqc}

`qorechaind query pqc account <your qor address>` がすでに鍵を示している場合は、このステップを飛ばしてください。そうでなければ、リリース版の `qorechaind` があるマシンで次を実行します。

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` は ML-DSA-87 鍵を作成し、その公開鍵を 16 進数で表示します。`register-key-v2` は、所有の証明とともに、それをあなたのアカウントに登録します。クエリは登録された鍵を示すはずです。これは、新しいアカウントがクラシック鍵だけで署名できる唯一のトランザクションです。鍵のバックアップ方法を含む完全な説明は、[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)にあります。

### ステップ 4: 鍵の証明を作る {#step-proof}

証明は、ウィンドウ鍵による、次の正確なテキストに対する Ed25519 署名です。UTF-8 でエンコードし、スペースも末尾の改行も付けません。

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

すでに 1 つ以上のウィンドウを開いたことのある鍵では、さらに `|` を 1 つ置いて、nonce `N` が続きます。

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` は、その鍵に対して証明付きですでに開かれたウィンドウの数で、符号も先頭のゼロもない 10 進数で書きます。新しい鍵では `N` は 0 で、サフィックスはありません。署名は純粋な Ed25519 (RFC 8032) です。プレハッシュなし、コンテキストなし、Solana のオフチェーンメッセージヘッダーなしなので、ウォレットは生の UTF-8 バイト列に署名しなければなりません。

テキストは手作業で作らないでください。チェーンに尋ねます。

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

回答には、nonce と正確なテキストが含まれます。

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

これは、サンプルアドレスに対する 2026 年 11 月 22 日のライブの回答です。`sign_bytes` をウィンドウ鍵で署名します。以下のスクリプトは Node.js だけを使って両方のステップを行います (`keyproof.mjs` として保存してください)。

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

`nonce: 0`、テキスト、そして 128 文字の 16 進文字列が表示されます。その 16 進文字列を保管してください。これは**1 つのウィンドウ**に対してのみ、またこの送信者、鍵、チェーンに対してのみ有効です。

**公開されている例でコードを確認してください。** チェーン ID `qorechain-diana`、送信者 `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (`0x11` の 20 バイト)、nonce 0:

| フィールド | 値 |
| ----- | ----- |
| 公開鍵 (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| 公開鍵 (16 進) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| メッセージ (131 バイト) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| 署名 (16 進) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

nonce が 1 の場合、メッセージは 133 バイトになり、末尾は `|1` になります。上のスクリプトは、2026 年 11 月 22 日に、対応する鍵からこの署名を再現しました。同じ入力に対してあなたのコードが異なるバイト列を生成する場合、よくある原因は、末尾の改行、プレハッシュ、Solana のオフチェーンヘッダー、または誤った値の nonce です。

スクリプトを実行する必要はありません。次のステップのコマンドは、キーペアファイル自体で署名できます (`--svm-keypair`)。鍵がほかの場所にある場合 (たとえば、プレーンなメッセージに署名できるウォレットなど) にスクリプトを使い、その結果を `--svm-key-proof` で渡してください。

### ステップ 5: ウィンドウを開く {#step-open}

トランザクションを構築し、次にポスト量子署名を追加します。この例では、3,600 ブロック (約 85 分)、最大 10 トランザクション、合計 10 QOR (価値と手数料)、System プログラム (転送) とローダー (デプロイ) に限定したウィンドウを開きます。

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

最初のコマンドは `window-open.json` を構築します。位置引数は、Solana 公開鍵、ブロック数、トランザクション数、価値です。チェーンから nonce を読み取り、`window.json` で鍵の証明に署名します。2 つ目のコマンドは、あなたの ML-DSA-87 署名を追加してトランザクションを送ります。トランザクションハッシュとコード 0 が表示されます。

スクリプトの証明を使う場合は、`--svm-keypair ...` を `--svm-key-proof <ステップ 4 の 16 進数>` に置き換えます。どちらのフラグも指定しなければ、コマンドは拒否し、署名すべき正確なテキストを表示します。鍵がすでにウィンドウを開いたことがある場合、コマンドは nonce を自分で読み取ります。`--svm-key-proof` を使うときは、`--svm-key-nonce <N>` で固定できます。

ウィンドウを読み戻します。

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

`"found":true` と `"live":true`、そして `max_txs`、`used_txs`、`max_value`、`used_value`、`remaining_blocks`、`remaining_txs`、`remaining_value`、`allowed_programs`、`key_proven` の `true` が表示されます。Solana 鍵で読むこともできます。`GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>` です。`key_proof_required`、`key_usable`、`key_proof_nonce` (署名すべき次の値) のフィールドもあります。

プログラムリストが System プログラムとローダーを指定しているのは、それがテストされた組み合わせだからです。このガイドでは、ウィンドウ鍵は転送だけを行い、デプロイはデプロイ用鍵が行います。ウィンドウ鍵に直接デプロイの支払いをさせる場合は、リストに両方のプログラムを指定しなければなりません。

### ステップ 6: デプロイ用鍵に入金する {#step-fund}

ウィンドウが開いている間、ウィンドウ鍵はあなたの QOR を使います。デプロイ用鍵に 5 QOR を送ります。

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

1 行目は、ウィンドウ鍵から見たあなたのネイティブ残高を表示します (「SOL」とありますが、QOR と読み替えてください)。2 行目は 5 QOR を送ります。`--keypair` フラグは、このコマンドに限りウィンドウ鍵を署名者にし、`--allow-unfunded-recipient` は、デプロイ用鍵がまだ何も保有していないために必要です。3 行目は `5 SOL`、つまり 5 QOR を示すはずです。この転送でアカウントが支払うのは、合計 5.045 QOR です。5 QOR と、基本手数料 0.045 QOR で、ウィンドウのカウンター (`used_txs` が 1、`used_value` が 5,045,000) がそれを示します。

`this node relays no Solana transactions` で拒否された場合は、[パブリックゲートウェイなしで送信する](#relay)を参照してください。

### ステップ 7: 小さなプログラムをビルドする {#step-build}

```bash
cargo init --lib hello
cd hello
```

`Cargo.toml` を次の内容に置き換えます。

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

`src/lib.rs` を次の内容に置き換えます。

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

これでプログラムが SBF 向けにコンパイルされます。`hello.so` (約 19 KB) と、アドレスがプログラム ID になる鍵 `hello-keypair.json` が表示されます。`unexpected cfg` に関するコンパイラの警告は無害です。このプログラムはログを 1 行書くだけで、ほかには何もしません。

### ステップ 8: デプロイする {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

これは、約 20 個の小さなトランザクションでプログラムを書き込み、その後デプロイします。`solana` は最初にコストを見積もって残高を確認します。18,896 バイトのビルドでは、2026 年 11 月 22 日に、支出 0.133 QOR (レント) と手数料 1.035 QOR と表示されました。これは 0.045 QOR の 23 トランザクション分です。最後に `Program Id: <address>` が表示されます。確認します。

```bash
qsol program show <program id>
```

プログラム ID、ローダー (`BPFLoaderUpgradeab1e11111111111111111111111`)、ProgramData のアドレス、**権限者** (あなたのデプロイ用鍵)、デプロイされたスロット、データ長が表示されます。デプロイを始めて途中で止まった場合、`solana` は一時バッファ鍵のための 12 語のリカバリーフレーズを表示します。デプロイが終わるまで保管してください。それがあれば、復元したキーペアを次の `program deploy` または `write-buffer` に渡して同じバッファを再開でき、バッファをクローズしてそのレントを取り戻すこともできます。

Anchor でビルドしたプログラムでは、リリース前の実行と同様に、`solana program deploy` に `--skip-feature-verify` を追加してください。

#### Anchor を使う場合 {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` はテンプレートのプログラムをコンパイルし、`anchor deploy` はそれを `declare_id!` のプログラム ID にデプロイします。テンプレートのプログラムは約 130 KB で、0.045 QOR の約 130 回の書き込みトランザクションに相当するため、先にデプロイ用鍵に少なくとも 10 QOR を入金してください。リリース前の実行では、128 KB のプログラムのコストは約 6.8 QOR で、そのほとんどが書き込み手数料であり、レントはクローズ時に戻ってきます。コードを変更した後の 2 回目の `anchor deploy` は、プログラムをアップグレードします。Anchor はローカルアドレスに対しては IDL のアップロードを飛ばします。テストネットへの IDL のアップロードはテストされていません。

### ステップ 9: プログラムを呼び出す {#step-call}

`solana` では任意のプログラムを呼び出せないため、短い web3.js スクリプトを使います。空のフォルダーで次を実行します。

```bash
npm init -y
npm install @solana/web3.js@1
```

`call.cjs` として保存します。

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

このスクリプトは、あなたのプログラム向けの命令を 1 つ構築し、デプロイ用鍵で署名して送信し、署名にステータスが付くまでポーリングして、プログラムのログを表示します。手数料支払者はデプロイ用鍵なので、ウィンドウは不要です。署名、`status: finalized err: null`、`fee (lamports): 45000000`、そして次のようなログが表示されます (形式はリリース前の実行のもので、メッセージはあなたのプログラム自身のものです)。

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### ステップ 10: 結果を読み取る {#step-read}

| 知りたいこと | コマンドまたは呼び出し |
| -------- | --------------- |
| トランザクションのステータス | `qsol confirm -v <signature>`、または `getSignatureStatuses` |
| そのログ、手数料、残高の変化 | `maxSupportedTransactionVersion: 0` を付けた `getTransaction` (上のスクリプト) |
| プログラムとその権限者 | `qsol program show <program id>` |
| デプロイ用鍵のすべてのプログラム | `qsol program show --programs` |
| データアカウント | `qsol account <address>`、または `getAccountInfo` |
| アカウントまたは鍵によるウィンドウ | `GET /qorechain/pqc/v1/svm_window/<address>` と `.../svm_window_by_key/<pubkey>` |

ブロックの中で失敗したトランザクション (たとえば、`--skip-preflight` でゲートウェイのプリフライトを飛ばした場合) も、署名は残り、手数料は支払われ、その効果は revert されます。リリース前の実行では、ウィンドウの価値の制限を超える転送を `--skip-preflight` で送ると、ブロックに入って `Error processing Instruction 0: generic instruction error` で失敗し、転送は revert されました。`--skip-preflight` なしの場合は、もっと早く、ゲートウェイで `-32002 ... SVM authorisation window exhausted` として拒否されます。

### ステップ 11: アップグレード、権限の引き渡し、拡張、クローズ {#step-admin}

これらはすべて、デプロイ用鍵を署名者として使い、ウィンドウを必要としません。

| タスク | コマンド |
| ---- | ------- |
| コード変更後のアップグレード | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| データ領域を N バイト大きくする | `qsol program extend <program id> N` |
| アップグレードの権限を別の鍵に渡す | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| プログラムを恒久化する | `qsol program set-upgrade-authority <program id> --final` |
| デプロイせずにバッファを書き込む、バッファを一覧表示する | `qsol program write-buffer x.so --use-rpc`、次に `qsol program show --buffers` |
| バッファをクローズする、またはプログラムをクローズしてレントを取り戻す | `qsol program close <buffer or program id>` (プログラムには `--bypass-warning` も必要) |

権限者ではない鍵によるアップグレードは拒否されます。`set-upgrade-authority` の後は、古い権限者は拒否され、新しい権限者がアップグレードできます。`--final` の後のアップグレードは、プログラムがもうアップグレードできないというメッセージで拒否されます。クローズされたプログラムは再び呼び出せず、`program show` はクローズされたと表示します。

### ステップ 12: ウィンドウを閉じる {#step-close}

終わったらウィンドウを閉じることができます。Solana 鍵が漏洩した可能性がある場合は、ただちに閉じなければなりません。ウィンドウがまだ受理していたものは、次のブロックから拒否されます。

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

ウィンドウをもう一度読み取ってください。もはや live ではなくなり、`qsol balance <WINDOW_PUBKEY>` は再び 0 を示すはずです。ウィンドウ鍵は、あなたの QOR を動かせなくなります。ウィンドウを通じて作成したデプロイ用鍵、プログラム、資金は、引き続きあなたのものです。

同じ鍵で新しいウィンドウを開くには、ステップ 4 をもう一度実行します。nonce は上がっており、古いウィンドウのために作った証明は `expected_nonce` で拒否されます。

## パブリックゲートウェイなしで送信する {#relay}

`svm-testnet.qore.host` のパブリックゲートウェイは、2026 年 11 月 22 日に中継を拒否しました (冒頭のボックスを参照)。中継されるようになるまで、送信する方法は 2 つあります。

**コマンドラインでの単一トランザクション。** QOR を保有し、登録済みのポスト量子鍵を持つ任意のネイティブアカウントが、あなたが署名した Solana トランザクションを運べます。まず Solana トランザクションを、たとえば web3.js で構築して署名し、base64 で出力します (`tx.serialize().toString("base64")`)。トランザクションは、使用するブロックハッシュから約 3.5 分間有効です。その後、次を実行します。

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

`--gas` と `--fees` はドライランで決めます。まず `tx pqc cosign` を `--dry-run` 付きで実行し（ガスの見積もりを表示し、何も送信しません）、見積もりに30%を足した値を `<GAS>`、`<GAS>` に 0.1 uqor を掛けた額以上を `<FEES>` として使います。単純な送金はおよそ30万から40万ガス、デプロイやコードを含む提案ははるかに多く必要です。

`--from` のアカウントがリレーヤーです。キャリアに署名してそのガスを支払い、Solana の手数料支払者がそれを補填します。リレーヤーは Solana トランザクションに対する権限を得ません。キャリアの手数料は、Solana トランザクションが支払う額でカバーされなければなりません。署名 1 つにつき 45,000 uqor です。これは転送や呼び出しには実用的ですが、多数の書き込みトランザクションを伴うデプロイには向きません。このルートは、このページのためにライブのテストネットでは実行されていません。

**自分のゲートウェイ。** テストネットを追従し、v3.2.9 のバイナリを実行するノードは、ポート 8899 で Solana JSON-RPC を提供し、`app.toml` の `[svm-rpc]` セクションにリレーヤーが指定されていれば中継します。`relayer-key` (ノードのキーリングにある入金済みアカウント。複数の場合はカンマ区切り)、`relayer-pqc-key` (ノードの `pqc` フォルダーにあるそれらの ML-DSA-87 鍵)、`relayer-keyring-backend` です。`relayer-key` が空だと、今のパブリックエンドポイントと同様に、`sendTransaction` は拒否されます。`relayer-fee` は空のままにしてください。そうすればリレーヤーは、Solana トランザクションが支払う額から各キャリアの価格を決めるため、持ち出しになることはありません。リリースバンドルの `lib/` フォルダー全体をコピーしてください。この設定は、このページのためには実行されていません。ノード自体については、[ノードの実行](/developer-guide/running-a-node)を参照してください。

## 計画しておくべき制限 {#limits}

* **中継のクォータ。** ゲートウェイ経由で送られる Solana トランザクションは、その手数料支払者に対してカウントされます。デフォルトでは 30 ブロックあたり 600 で、1 分に満たない時間です。1 つの鍵からの大きなデプロイはこれを超える場合があります (1 MB のプログラムで約 1,100 回の書き込み)。拒否された書き込みにコストはかかりません。まず `qsol program write-buffer` でバッファを書き込み、止まったら 1 分待って同じバッファでもう一度実行し、その後 `--buffer` でバッファからデプロイするか、バッファの書き込みとデプロイを別の手数料支払者で支払ってください。
* **ゲートウェイの公平な分配。** ゲートウェイは、送信したトランザクションが少ないクライアントのために容量の一部を確保し、残りをアクティブなクライアントネットワーク間で均等に分け合います。公平な分配のメッセージ (コード `-32005`) で拒否された場合は、1 分待つか、別のゲートウェイを使ってください。
* **トランザクションは、ブロックハッシュが失効する (150 スロット) 前に反映されなければなりません。** `solana` は自動で再送します。スクリプトでも同様にしてください。
* **トランザクションは Solana と同様に、最大 1,232 バイト、最大 64 アカウントです。** レガシーとバージョン 0 のメッセージが受け付けられます。
* **プログラムとアカウント:** それぞれ 10 MiB。フレームあたりスタック 32 KiB とヒープ 256 KiB。
* [SVM レーン (v3.2.8)](/developer-guide/svm-lane-v328#custody)の**カストディ制限**は引き続き適用されます。SVM プールが上限にあるときは、入金が `svm custody cap exceeded` (コード 23) で拒否されることがあります。
* **ウィンドウリストの名前。** `--allowed-programs` は base58 のプログラム ID を取り、最大 16 個で、それぞれ 1 回のみです。スコープはトランザクションのトップレベルの命令に適用されます。リストされたプログラムがほかのプログラムを呼び出す場合、あなたの署名も一緒に引き継がれるため、全体として信頼できるプログラムだけをリストしてください。
* **アドレス。** v3.2.9 の新しいメッセージは、正規の小文字形式ではない bech32 アドレスを拒否します。`toBech32` が生成する形式で送ってください。

## トラブルシューティング {#troubleshooting}

「live」とあるテキストは、2026 年 11 月 22 日にライブのテストネットで見られたものです。それ以外は、リリース前の実行で見られた、チェーンとゲートウェイ自身のメッセージです。

| 表示される内容 | 意味 | 対処 |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (JSON-RPC コード `-32603`、live) | ゲートウェイにリレーヤーアカウントがありません | [自分のゲートウェイまたはコマンドラインの中継](#relay)を使うか、運用者を待つ |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live、`solana` から) | その鍵は何も保有していません。SOL は QOR と読み替えてください | ウィンドウを開いてその鍵に入金するか、ウィンドウを開いてウィンドウ鍵を署名者として使う |
| シミュレーションの `InsufficientFundsForFee`、ログ `fee payer ... has no account: insufficient fee` (live) | 同じ原因を、シミュレーションから見たもの | 同じ対処 |
| `invalid solana transaction: no signatures`、`truncated: need 2 bytes at 1` (コード `-32602`、live) | バイト列が署名済みの Solana トランザクションではありません | 完全に署名されたワイヤートランザクションを、base64 または base58 で送る |
| websocket アップグレードでの HTTP 405 (live) | パブリックエンドポイントは websocket を提供しません | `solana program deploy` と `write-buffer` に `--use-rpc` を付ける。スクリプトでは `getSignatureStatuses` でポーリングする |
| `-32002 ... insufficient priority fee ...` | トランザクションが支払う額がキャリアのコストより少ない | エラーの `data` から ComputeBudget の価格とユニット上限を設定する。[手数料](#fees)を参照 |
| `-32002 ... SVM authorisation window exhausted` | ウィンドウのブロック、トランザクション、価値を使い切ったか、トランザクションが価値を超えることになる | ウィンドウを読み取り、より高い価値またはより多くのトランザクションで新しいものを開く |
| `no open SVM authorisation window` (codespace `pqc`、コード 341) | その鍵に live のウィンドウがありません | 開く (ステップ 5) |
| コード 343 と `expected_nonce=<N>` で開くことが拒否される | 証明が別の nonce に対して署名されていた。たとえば古い証明 | nonce ルートを再び読み取り (ステップ 4)、もう一度署名する |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | 署名がテキストと一致しません | nonce ルートの `sign_bytes` を、正しい鍵と送信者で、そのまま署名する |
| `--svm-keypair holds the key X, not Y` (CLI) | キーペアファイルが、指定した鍵ではありません | base58 の鍵に一致するキーペアを使う |
| `the window needs the proof that you hold the Solana key` (CLI) | `--svm-keypair` も `--svm-key-proof` も指定されていません | どちらかを指定する。メッセージには署名すべきテキストが表示される |
| `blocks must be between 1 and 17280`、`max_txs must be between 1 and 1000`、`max_value must be positive`、`allowed_programs lists N programs, the maximum is 16` | ウィンドウの制限が範囲外です | [ウィンドウ](#window)の下の表の範囲内の値を使う |
| `svm_pubkey ... is not a valid ed25519 public key`、または `... is a native account address, not an ed25519 key` | その鍵はプログラムアドレスか、あなたの QoreChain アドレスの 1 つです | `solana-keygen` で作ったキーペアを使う |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | 1 つの手数料支払者の中継クォータ | 1 分待ち、同じバッファで再開する。[制限](#limits)を参照 |
| `fair share of the relayer quota` を伴う `-32005` | ゲートウェイが容量を分け合っている | 1 分後に再試行する |
| `-32020 node is starting, no committed state` | ノードにまだステートがありません | 数秒後に再試行する |
| `node busy: the carrier could not be measured now, retry` | ゲートウェイが現時点でキャリアの価格を決められませんでした | 再試行する |
| `Transaction simulation failed: Blockhash not found` | ブロックハッシュが 150 スロットより古いか、不明です | 新しいブロックハッシュを取得し、再び署名して送る |
| `Transaction simulation failed: This transaction has already been processed` | 同じ署名済みトランザクションがすでに見られています | `getSignatureStatuses` を確認する。再び送らない |
| Solana トランザクションが `cannot approve a delegate`、`cannot hand over the ownership`、`cannot hand over the close authority`、`cannot change the mint or freeze authority` のいずれかと、`the grant would outlive the window` で拒否される | デフォルトスコープのウィンドウは、永続的なトークンのグラントを拒否します | この操作は、Native レーンであなた自身のポスト量子鍵で署名するか、プログラムリストがトークンプログラムを指定しているウィンドウを開く ([既知の制限](#window-limits)を参照) |
| `SVM module is disabled` (コード 11) | レーンが閉じています。これはメインネットの状態です | テストネットを使う |
| `svm custody cap exceeded` (コード 23) | SVM プールが上限にあります | あとで、またはより少ない量で再試行する |
| Anchor でビルドしたプログラムの `solana program deploy` が、プログラムのフィーチャーについてクライアント側で拒否される | ツールが ELF のフィーチャーを確認しています | `--skip-feature-verify` を追加する |
| ウィンドウ鍵によるアップグレードが `solana` に拒否される | 記録された権限者はあなたの Native アカウントで、その鍵ではありません | このガイドのように、別のデプロイ用鍵でデプロイする |
| authz、グループ、コントラクトのもとでのウィンドウの開閉が拒否される | ウィンドウはあなた自身の署名でのみ開閉されます | あなたのアカウントから、トップレベルメッセージとして送る |

## 確認した内容 {#tested}

| 確認 | 場所と時期 | 結果 |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params` と `/cluster_info` | ライブのテストネット、2026 年 11 月 22 日 | `enabled` と `execution_enabled` はどちらも `true` |
| `getHealth`、`getVersion`、`getGenesisHash`、`getLatestBlockhash` (base58)、`getMinimumBalanceForRentExemption(1024)` | ライブのテストネット、2026 年 11 月 22 日 | `ok`、`1.18.0-qorechain`、上記のジェネシスハッシュ、44 文字の base58 ブロックハッシュ、8,017,920 lamports |
| 署名 1 つの転送に対する `getFeeForMessage` と `simulateTransaction` | ライブのテストネット、2026 年 11 月 22 日 | 手数料 45,000,000 lamports (0.045 QOR)。入金のない支払者では `InsufficientFundsForFee` |
| 鍵の証明の nonce ルートとウィンドウのルート | ライブのテストネット、2026 年 11 月 22 日 | nonce 0、ステップ 4 のとおりの `sign_bytes`。ウィンドウのないアドレスでは `found` が `false` |
| 公開されている例に対するステップ 4 の鍵の証明スクリプト | ライブのテストネットのルート、2026 年 11 月 22 日 | 署名は表と同一 |
| `cargo build-sbf` (4.0.0、platform tools v1.53) でのプログラムのビルド | ローカルマシン、2026 年 11 月 22 日 | 18,896 バイトの `hello.so` |
| 入金のない鍵からの `solana program deploy` のコスト見積もり | ライブのテストネット、2026 年 11 月 22 日 | 支出 0.133 QOR と手数料 1.035 QOR でクライアント側で拒否 |
| 形式が正しい転送の `sendTransaction` | ライブのテストネット、2026 年 11 月 22 日 | 拒否: `this node relays no Solana transactions` |
| パブリックエンドポイントでの websocket アップグレード | ライブのテストネット、2026 年 11 月 22 日 | HTTP 405 |
| ウィンドウを開く、ウィンドウ鍵からの `solana transfer`、デプロイ、呼び出し、アップグレード、権限の設定、拡張、クローズ、`anchor deploy` とアップグレード | リリース前のローカルテストネットワーク、`solana-cli` 4.0.2、`anchor-cli` 1.2.2、`@solana/web3.js` 1.99 | 合格 |
| ライブのテストネットでの同じステップ | 未実行。2026 年 11 月 22 日にパブリックゲートウェイは何も中継せず、このページのためにテスト QOR は使っていません | 未実行 |

## メインネット {#mainnet}

メインネットは、これらのいずれも含まないリリースを実行しています。そこでは SVM レーンがオフで、パブリックな SVM エンドポイントは読み取り専用、クロス VM 呼び出しは停止されたまま、コントラクトのアップロードはガバナンスのみです。メインネットに対してウィンドウを開いたり、デプロイしたり、Solana トランザクションを送ったりしないでください。計画はテストネットのみに対して立ててください。

## 関連ページ {#see-also}

* [SVM レーン (v3.2.8)](/developer-guide/svm-lane-v328): レーンの状態、レント、カストディ制限、SVM ウォレットのポスト量子鍵。
* [SVM 開発](/developer-guide/svm-development): レーンの概要と JSON-RPC サーバー。
* [Solana 互換 JSON-RPC](/api-reference/json-rpc-solana-compatible): メソッド一覧。
* [ポスト量子署名](/developer-guide/post-quantum-signing): ML-DSA-87 鍵の登録と使用。
* [EVM 認可ウィンドウリファレンス](/developer-guide/evm-window-reference): Ethereum スタイルの鍵に対する同じ考え方。
* [クロス VM 相互運用性](/developer-guide/cross-vm-interoperability): SVM、EVM、QoreChain Native の間の呼び出し。
* [バージョン履歴](/appendix/version-history#v329): v3.2.9 で変わったこと。
