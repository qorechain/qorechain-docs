---
slug: /rollups/rdk-v328
title: "v3.2.8 における RDK: 変更点"
sidebar_label: v3.2.8 の RDK
sidebar_position: 11
---

# v3.2.8 における RDK: 変更点

QoreChain リリース v3.2.8 は、ロールアップの決済の仕組みを変更します。ロールアップは、データをチェーン上に置けるようになり、チェーンに自分のトランザクションを順序付けさせ（ベースドシーケンシング）、バッチを再実行する不正証明によるオプティミスティック決済を行い、投稿をメンバーの集合だけに非公開にし、任意の 32 バイトのルートを受け入れる方法で Groth16 の出金ルートを束縛できます。STARK 決済は、後のリリースまで一時停止されます。このページでは、各変更が何をするか、どのように使うかを説明します。対象は、`x/rdk` モジュール上で構築するロールアップのオペレーターと開発者です。

:::caution 当面はテストネットのみ

v3.2.8 は、公開テストネット `qorechain-diana` で 2026 年 11 月 12 日から稼働しています。メインネットはまだ適用していないため、このページのすべての機能は、適用されるまでメインネットでは拒否されます。例はテストネットの例として扱ってください。

:::

:::note 現時点でこれができるツール

* **ノードのコマンドライン（`qorechaind`）**: このページのすべてのメッセージにコマンドがあります。これは Linux のノードバイナリです。パッケージ化された macOS 用バイナリはないため、Mac では Linux ホスト上で実行するか、REST でチェーンを読み取ってください。
* **RDK キット**: RDK 0.9.0 は v3.2.8 に対応しています。すべてのレジストリで公開されています: npm（`@qorechain/rdk`、`@qorechain/rdk-cli`、`create-qorechain-rollup`）、PyPI（`qorechain-rdk`）、crates.io（`qorechain-rdk`）、Maven（`io.github.qorechain:qorechain-rdk`）、Go（`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0）。リリースノート: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0。
* **Python、Go、Rust、Java の RDK クライアント**: それぞれのバージョン 0.9.0 が v3.2.8 に対応しています。以下のエンドツーエンドの実行では、TypeScript クライアントを使用しました。

:::

## 変更点の一覧 {#at-a-glance}

| 領域 | v3.2.8 以降の挙動 |
| --- | --- |
| データの投稿 | `MsgPostRollupData` は、ペイロードをトランザクションに載せ、ロールアップの次のインボックスシーケンスの下に、コミットメントをチェーン上に保持します。 |
| ベースドシーケンシング | チェーンは、ロールアップのトランザクションをその取り込み順に順序付けます。作成時、またはガバナンスの `MsgSetRollupSequencing` で設定します。 |
| オプティミスティックロールアップ | 新しいオプティミスティックロールアップ（`nft`、`custom`）は、`qledger-v1` 実行モデルで動作し、ベースドでなければなりません。不正証明はバッチを再実行します。 |
| 提出者ボンド | `qledger-v1` ロールアップのバッチにはボンドが必要です（`MsgBondRollupSubmitter`）。不正証明が認められると、半分がバーンされ、半分がチャレンジャーに支払われます。 |
| デポジット | `MsgDepositToRollup` は、`qledger-v1` ロールアップの 32 バイトのアカウントにクレジットします。 |
| プライベートロールアップ | プライバシーを `encapsulated` にして作成した `defi` ロールアップは、そのメンバー宛ての ML-KEM-1024 エンベロープのみを受け付けます（`MsgSetRollupMembers`）。 |
| Groth16 の入力 | 入力は BLS12-381 のスカラー体を法として読み取られます。`withdrawals_root` は任意の 32 バイトでよく、還元された形で保存されます。 |
| STARK | STARK 鍵と STARK バッチは、後のリリースまで拒否されます。 |
| 保持 | 投稿データのコミットメントは `posted_data_retention_blocks` の間保持され、`qledger-v1` ロールアップではチェックポイントがより長く保持されます。 |

## なぜ重要か {#why}

v3.2.8 より前は、ロールアップのデータにチェーン上の置き場所がなかったため、バッチを確認する人は、シーケンサーのコピーを信頼する必要がありました。データの投稿と取り込み順による順序付けは、この信頼を不要にします。チェーン自身が、何がどの順序で投稿されたかを記録し、バッチはまさにその範囲を消費しなければなりません。オプティミスティックロールアップでは、チャレンジがルートだけでなく実行を検証するようになり、誤ったバッチは提出者のボンドを失います。プライベートロールアップでは、グループが、公開チェーン上でデータを公開せずに共有できます。

## ロールアップデータの投稿 {#posting-data}

`MsgPostRollupData`（コマンド `tx rdk post-data`）は、ペイロードをトランザクションで送信します。バイト列はトランザクションに残るため、ブロックに含まれます。チェーンは、ロールアップの次のインボックスシーケンス（1 から開始）の下に、コミットメントを保持します。これは、データの SHA-256、サイズ、投稿者、高さです。また、ロールアップのインボックスアキュムレーターも更新されます。

* **投稿できる人**: ロールアップのシーケンサー（シーケンサーアドレスが設定されていない場合は作成者）。ベースドのロールアップでは、誰でも投稿できます。
* **サイズ**: 1 回の投稿につき最大 `max_posted_data_bytes`（デフォルト 131,072 バイト、上限は 1 MiB）、すべてのロールアップ合計で 1 ブロックあたり `max_posted_data_bytes_per_block`（デフォルト 524,288 課金対象バイト）。
* **手数料**: 課金対象 1 バイトあたり `posted_data_fee_per_byte` uqor（デフォルト 10）で、投稿は少なくとも 1 KiB として課金されます。手数料は手数料コレクターに入り、トランザクション手数料と同じように分配されます。ガスは別途課金されます。
* **保持**: コミットメントは `posted_data_retention_blocks`（デフォルト 648,000）の後に削除されます。バイト列はブロック履歴に残ります。
* **バッチでの使用**: ベースドでないネイティブ DA ロールアップのバッチは、`data_hash` をデータの SHA-256 と等しくすることで、保持されている投稿を参照できます。

コマンドライン（Linux ノードバイナリ）です。

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

REST でコミットメントを読み取ります（テストネットで確認済み。[確認したルート](#checked-routes)を参照）。

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

レスポンスには、`data_hash`、`size`、`poster`、`height`、`inbox_acc`、`expires_at_height` が含まれます。一度も投稿されていない、または削除されたシーケンスは、HTTP 404 を返します。

## ベースドシーケンシング {#based-sequencing}

ベースドのロールアップは、QoreChain 上での取り込み順に順序付けられます。各投稿は次のインボックスシーケンスを受け取り、すべてのバッチはインボックスを順番に消費します。

* ロールアップをベースドとして作成するには `--sequencing based` を使い、既存のロールアップを移行するにはガバナンスの `MsgSetRollupSequencing` を使います。
* 各バッチは `inbox_end`（消費する最後の投稿のシーケンス）を設定し、インボックス範囲のコミットメントを `data_hash` として運びます。チェーンには `query rdk inbox` で問い合わせます（`range_data_hash` を返します）。
* ベースドのロールアップは、ガバナンスのみによって一時停止、再開、停止されます。

ベースドのロールアップでバッチを提出できる人は、ロールアップによって異なります。

| ロールアップ | バッチを提出できる人 |
| --- | --- |
| Groth16 鍵を持つ zk（`defi`） | 任意のアカウント。証明がルート、インボックス範囲、出金ルートを束縛します。 |
| ベースド決済（`gaming`、`enterprise`） | ロールアップのシーケンサーのみ。 |
| `qledger-v1` を持つオプティミスティック（`nft`、`custom`） | 提出者ボンドを保有する任意のアカウント。 |

`qledger-v1` を持たないオプティミスティックロールアップと STARK ロールアップは、このリリースではベースドにできません。

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

ノードを信頼せずにアキュムレーターと範囲コミットメントを計算したいプルーバー向けの式です。

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` は 32 個のゼロバイトで、`lp` は 4 バイトのビッグエンディアンの長さプレフィックスです。

## qledger-v1 を使うオプティミスティックロールアップ {#qledger-v1}

v3.2.8 以降、新しいオプティミスティックロールアップは、実行 VM なしでは作成できません。`nft` と `custom` のプリセットには、`--sequencing based` とともに `--execution-vm qledger-v1` が必要です。v3.2.8 より前に作成されたオプティミスティックロールアップは変更されません。

`qledger-v1` は、uqor 建てのアカウント台帳（SHA-256 のスパースマークルツリー）で、署名付きの転送と出金を備えています。アカウント鍵は ML-DSA-44 のみです。その入力はそのインボックスです。

* **ユーザーの投稿**: 1 件につき 1 トランザクション、最大 6 KiB。
* **デポジット**: `MsgDepositToRollup` は 32 バイトのアカウント ID にクレジットします。チェーンが、デポジットを自らインボックスに追加します。

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### 提出者ボンドと保留中のバッチ {#submitter-bond}

あるロールアップで、`min_submitter_bond`（デフォルト 1,000 QOR、1,000,000,000 uqor）以上の提出者ボンドを保有すれば、どのアカウントでもバッチを提出できます。

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

ボンドのクエリは、`amount`、`last_submit_time`、`unbond_after`、`pending` を返します。`pending` は、その提出者のバッチのうち、ファイナリティを待っている数です。バッチを提出するたびに増え、バッチがファイナライズまたは拒否されると減ります。提出者が保留中にできるバッチは 1,024 件未満です。ボンドは、保有者の最後のバッチからチャレンジウィンドウ 1 つ分が経過した後に、`unbond-submitter` で取り戻せます。

### バッチのルール {#batch-rules}

`consumed` を、次のバッチが開始するインボックス位置、`head` を最後の投稿とします（どちらも `query rdk inbox` にあります）。`inbox_end = end` のバッチは、次のすべてが成り立つときに受理されます。

1. 提出者が `min_submitter_bond` 以上を保有し、保留中のバッチが 1,024 件未満である。
2. `consumed < end <= head`。バッチは少なくとも 1 件のエントリを消費する。
3. `end - consumed <= 64`。1 バッチあたり最大 64 件のインボックスエントリ。
4. チェーンが `end` でのアキュムレーターをまだ生成できる。`end` が head であるか、投稿 `end` のコミットメントが保持されている（`query rdk inbox <rollup> --inbox-end <end>` が `range_data_hash` を返す）。
5. head の手前で止まる 64 件未満のバッチは、直近 20 ブロック内の投稿の直前で止まるか、次の投稿がもう保持されていないチェックポイント（`end` が 64 の倍数）で止まる。
6. `data_hash` が `consumed` から `end` までのインボックス範囲コミットメントであり、最初のバッチは空の台帳ルートから始まり、`state_root` が 32 バイトである。

クライアントは、次のように `end` を選べます。

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

コマンドラインで提出します。

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### 不正証明 {#fraud-proofs}

チャレンジウィンドウの間、誰でも `qledger-v1` の不正証明を付けて `MsgChallengeBatch` を送信できます。不正証明は、バッチの入力と、それらが触れるアカウントのマークルウィットネスです。チェーンはバッチを再実行します。

* 状態ルートまたは出金ルートが誤っていれば、バッチは拒否され、その上に構築されたすべてのバッチも拒否されます。インボックスはロールバックされます。
* 提出者のボンド全額がスラッシュされます。**半分がバーンされ、半分がチャレンジャーに支払われます。** バーンされた半分は、バーンモジュールにソース `rollup_slash` として記録されます。自分の誤ったバッチを自分でチャレンジした提出者も、ボンドの半分を失います。
* 誤ったバッチを示さない証明は、エラー 51 で失敗し、何も変更しません。

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

RDK 0.9.0 には、証明のバイト列を構築する `qledger-v1` ヘルパーがあります。

チャレンジされなかったバッチは、チャレンジウィンドウが終了すると自動的にファイナライズされます。出金は、ファイナライズされたバッチからのみ、ロールアップのデポジットプールから支払われ、作成者のエスクローからは決して支払われません。プールにデポジットがある間は、ロールアップを停止できません（エラー 54）。

### 保持とアイドル期間 {#retention}

* 投稿のコミットメントは `posted_data_retention_blocks` の間保持され、その後、ファイナライズされたバッチがそれをカバーしていない間は、さらに最大 4 回の保持期間にわたって保持されます。
* その後は削除されますが、チェックポイントは例外です。シーケンスが 64 の倍数であるすべての投稿は、ファイナライズされたバッチがそれをカバーするか、ロールアップが停止されるまで、コミットメントを保持します。
* 停止されたロールアップは、保持期間を過ぎたコミットメントを保持しません。
* `posted_data_retention_blocks` は、有効な最長のチャレンジウィンドウ以上でなければなりません。1 ブロックを 1 秒として数えます（`default_challenge_window` と、停止されていないすべてのロールアップのウィンドウ）。それより短くなる、またはウィンドウをそれより上に引き上げるパラメータの更新は、`invalid params` で拒否されます。上限は 25,920,000 です。
* v3.2.8 のアップグレード時に、保存されている値がそのウィンドウを下回っていれば、ウィンドウの値まで引き上げられます。デフォルトのパラメータはそのままです。
* **テストネットの値**: `default_challenge_window` は 3,600 秒です（コアのデフォルトでメインネット相当の値は 604,800 秒、7 日間）。投稿データは 648,000 ブロック、ブロブとファイナライズ済みバッチは 432,000 ブロック保持されます。

長いアイドル期間の後、未消費の投稿が 64 件を超え、そのコミットメントが削除されている場合、提出者は順番に追いつきます。`consumed` が 64 の倍数でなければ、次の 64 の倍数まで 1 バッチ、次にチェックポイントからチェックポイントまで 64 件の完全なバッチ、最後に head（またはルール 5 のもとで保持されている任意の位置）までの 1 バッチです。通常の運用では何も変わりません。head まで、または直近の投稿の直前まで、最大 64 件でバッチ化します。

## プライベートロールアップ {#private-rollups}

プライバシーを `encapsulated` にして作成した `defi`（Groth16）ロールアップは、そのメンバー宛ての ML-KEM-1024 エンベロープである投稿のみを受け付けます。

エンベロープは、新しい鍵のもとで AES-256-GCM によってデータを 1 回暗号化し、その鍵を、チェーンの KEM レジストリにある各メンバーの ML-KEM-1024 鍵にカプセル化します。鍵コミットメントにより、すべてのメンバーが同じ内容を開くことが保証されます。チェーンは、エンベロープが正しい形式であること、そして各エントリがメンバーの現在の鍵を指していることを確認します。復号は決して行いません。

* 作成者は `MsgSetRollupMembers` でメンバーを設定します。最大 32 人で、それぞれが登録済みの ML-KEM-1024 鍵を持ちます。変更のたびに、新しいメンバーシップエポックが始まります。
* 投稿、投稿者、タイミング、サイズ、メンバー、ルート、出金（受取人と金額）は公開のままです。非公開になるのは投稿の内容だけです。

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Groth16 の入力と出金ルート {#groth16}

BLS12-381 上の Groth16 バッチ（`defi` プロファイル、SNARK）は、公開入力に対して検証されます。各入力は 32 バイトの値で、ビッグエンディアンの整数として読み取られ、スカラー体の位数を法として還元されます。

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

出金が束縛される前に提出されたバッチには、最初の 3 つの入力しかありません。プルーバーのウィットネスは、同じ還元後の値を取らなければなりません。

ある値がすでに `r` 未満でなければならないかどうかは、誰がそれを設定するかによって決まります。

| 値 | 設定する人 | r 未満でなければならないか |
| --- | --- | --- |
| `state_root` | プルーバー | はい |
| `prev_state_root` | チェーン（直近に決済された `state_root`）。ロールアップの最初のバッチを除く | 最初のバッチのみ |
| `data_hash` | 束縛されている場合はチェーン（ベースドロールアップのインボックス範囲、投稿データのコミットメント）、それ以外はプルーバー | 束縛されていない場合のみ |
| `withdrawals_root` | チェーン（`MsgExecuteWithdrawal` が再構築する出金ツリーのルート） | いいえ |

クライアントにとっての意味は次のとおりです。

* 出金ルートは、ツリーが与えるとおりに提出します。任意の 32 バイトでかまいません。
* チェーンは、`withdrawals_root mod r` を 32 バイトのビッグエンディアンとして保存します。バッチのクエリは、`withdrawals_root_reduced` を true として、その保存された値を示します。ツリーのルートの約 55 パーセントは `r` 以上であるため、保存された値は、提出したバイト列と異なることがよくあります。
* `MsgExecuteWithdrawal` はクライアントにとって変わりません。リーフのフィールドと兄弟ハッシュを送ります。チェーンはルートを再構築し、`rebuilt_root mod r == stored_root mod r` のときに出金を受理します。
* ルートが `r` の倍数だけ異なる、同じバッチの 2 つの提出は、同じバッチです。最初のものが決済され、2 番目は既に存在するバッチとして拒否され、ツリー内のすべての出金は、保存されたルートに対して支払われます。
* 決済後は、保存されたルートを `tree_root` ではなく `tree_root mod r` と比較してください。

還元ルールが導入される前の、オプティミスティック、`qledger-v1`、Groth16 のバッチは、正確な 32 バイトを保存して比較します。ツリーとリーフのエンコーディングについては、[ZK / STARK と出金](/rollups/zk-stark-withdrawals)を参照してください。

## STARK 決済は一時停止されています {#stark}

検証器がサポートする唯一の STARK ステートメントは、2 つの 64 ビット値の間の反復二乗を証明するものです。これは、ロールアップの出金やデータを制約しません。v3.2.8 以降、STARK 鍵は設定できず、STARK ロールアップのバッチは拒否されます（エラー 52）。ガバナンスは、そのようなロールアップを Groth16 鍵に移行できます。STARK 決済は、実際のロールアップのステートメントとともに、後のリリースで復活します。

## 新しいメッセージ {#messages}

| メッセージ | コマンド | 送信する人 |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | シーケンサー、またはベースドのロールアップでは誰でも |
| `MsgSetRollupSequencing` | ガバナンス提案 | ガバナンス |
| `MsgDepositToRollup` | `tx rdk deposit` | `qledger-v1` ロールアップに対して、誰でも |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | バッチ提出者 |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | バッチ提出者 |
| `MsgSetRollupMembers` | `tx rdk set-members` | プライベートロールアップの作成者 |
| `MsgSubmitBatch` のフィールド `inbox_end` | `tx rdk submit-batch --inbox-end` | ベースドのロールアップのバッチの提出者 |

`create-rollup` は、`--sequencing`、`--execution-vm`、`--privacy` も受け取ります。互換性マトリクスは現在、次のとおりです。不正証明を使うオプティミスティックには `qledger-v1` とベースドシーケンシングが必要で、ZK 決済は SNARK を意味します。

## 一連の流れ: 作成、ボンド、デポジット、投稿、バッチ、チャレンジ、ファイナライズ、出金 {#worked-flow}

:::note 2026 年 11 月 12 日に RDK チームがテストネットで実行
RDK チームは、2026 年 11 月 12 日の 06:22 から 07:27 UTC に、テストネット `qorechain-diana` でこの流れをエンドツーエンドで実行しました。すべて RDK 0.9.0（TypeScript）を通じて、RDK の `auto` 手数料（1 ガスあたり 0.15 uqor）で実行しました。すべてのステップがコード 0 を返しました。このページの筆者による実行ではありません。
:::

| ステップ | メッセージ | 使用ガス / 要求ガス |
| --- | --- | --- |
| 0 | まず、新しいアカウントのポスト量子鍵を、専用のトランザクションで登録します（所有証明付きの `MsgRegisterPQCKeyV2`）。RDK クライアントはこれを自動的に行います。これがないと、最初の実際のトランザクションは pqc コード 8 で拒否されます | 348,917 / 600,000 |
| 1 | `MsgCreateRollup`: プロファイル `nft`、実行 VM `qledger-v1`、シーケンシング `based`、ステーク 10,000 QOR（1% がバーン） | 301,260 / 349,199 |
| 2 | `MsgBondRollupSubmitter`、1,000 QOR | 178,059 / 263,425 |
| 3 | `MsgDepositToRollup` を 2 回（3 QOR と 1 QOR。最小は 1 QOR） | それぞれ約 240,000 / 350,000 |
| 4 | `MsgPostRollupData` を 2 回（署名付きの qledger 転送と署名付きの qledger 出金）と、投稿データ手数料（課金対象 1 バイトあたり 10 uqor、少なくとも 1 KiB を課金） | それぞれ約 328,500 / 474,000 |
| 5 | `planQledgerBatch`、続いて 4 件のインボックスエントリ向けの `MsgSubmitBatch`（`inbox_end` は 4、`data_hash` はインボックス範囲）。バッチのステータスは `submitted`、ボンドの `pending` は 1 | 712,379 / 1,011,431 |
| 6 | 不正テスト: 投稿をもう 1 件行い、意図的に誤った状態ルートを持つバッチ（233,990 / 341,742）を提出し、続いて RDK が構築した不正証明（4,136 バイト）で `MsgChallengeBatch` を送信 | 450,186 / 644,417 |
| 7 | バッチ 0 は、テストネットの 3,600 秒のチャレンジウィンドウの後に自動的にファイナライズされた | トランザクションなし |
| 8 | RDK の qledger マークル証明による 0.3 QOR の `MsgExecuteWithdrawal` | 192,768 / 284,220 |

注目すべき結果です。

* **ステップ 6**: 誤ったバッチは拒否され、提出者のボンドはスラッシュされ（半分がバーン、半分がチャレンジャーに支払い）、インボックスはロールバックされ、それ以前の正しいバッチには影響しませんでした。
* **ステップ 8**: ロールアップのデポジットプールは 4.0 QOR から 3.7 QOR になり、受取人の残高は 0.3 QOR から手数料を引いた額だけ増えました。

コマンドラインには、各ステップに相当するものがあります。これらの個別のコマンドは、このページのために実行しておらず、ノード CLI の定義に従っています。

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

ロールアップのチャレンジウィンドウは、その `challenge_window_sec` にあります。テストネットでは、ロールアップを 1 時間以内に試せるように、`default_challenge_window` を意図的に 3,600 秒にしています。コアのデフォルトでメインネット相当の値は 604,800 秒（7 日間）です。ステップ 5 から 8 には、台帳から計算されたルートと証明が必要です。RDK 0.9.0 には、それを行う `qledger-v1` ヘルパーがあります。

## 公開済みの TypeScript キットでチェーンを読み取る {#typescript}

これらの読み取りは、0.9.0 から v3.2.8 に対応している `@qorechain/rdk` の名前を使っています。以下のように、`curl` で新しいフィールドを直接読み取ることもできます。

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

このスニペットは、このページのために実行していません。

## 確認したルート {#checked-routes}

これらの読み取り専用ルートは、2026 年 11 月 12 日に公開テストネットに対してリクエストしました。

| ルート | ステータス |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` および `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200。一度も投稿されていない、または削除されたシーケンスは 404 |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`、`latest_batch/<id>`、`batch/<id>/<index>` | 200 |
| 未知のロールアップに対する任意のルート | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

モジュールパラメータには、新たに `max_posted_data_bytes`、`max_posted_data_bytes_per_block`、`posted_data_fee_per_byte`、`posted_data_retention_blocks`、`min_submitter_bond`、`finalized_batch_retention_blocks` が含まれます。バッチビューには `inbox_start`、`inbox_end`、`withdrawals_root_reduced` が加わり、ロールアップビューには `sequencing`、`execution_vm`、`privacy`、`members`、`members_epoch`、`deposit_pool` が加わります。インボックスのレスポンスには `head_sequence`、`consumed_sequence`、`range_data_hash` があり、要求された end でのコミットメントが利用できない場合、`range_data_hash` は空です。

## 制限とエラー {#limits}

| 制限またはエラー | 値または意味 |
| --- | --- |
| 投稿のサイズ | `max_posted_data_bytes`、デフォルト 131,072 バイト、上限 1 MiB |
| 1 ブロックあたりの投稿バイト数 | `max_posted_data_bytes_per_block`、デフォルト 524,288 課金対象バイト |
| 投稿手数料 | デフォルトで課金対象 1 バイトあたり 10 uqor、少なくとも 1 KiB を課金 |
| 投稿データの保持 | デフォルト 648,000 ブロック、最大 25,920,000、秒単位の最長のチャレンジウィンドウを下回ることはない |
| `qledger-v1` の投稿 | 1 トランザクション、最大 6 KiB |
| バッチのサイズ | インボックスエントリ 1 件から 64 件 |
| 提出者ごとの保留中のバッチ | 1,024 件未満 |
| プライベートロールアップのメンバー | 最大 32 人、それぞれが登録済みの ML-KEM-1024 鍵を持つ |
| ロールアップごとの 1 ブロックあたりの決済バッチ数 | `max_batches_per_block`、デフォルト 10（エラー 40） |
| エラー 41、44、47 | この高さでは機能が有効になっていない（ネットワークが v3.2.8 を適用していない） |
| エラー 42、43 | 投稿が大きすぎる、またはブロックの投稿上限に達している |
| エラー 45 | このロールアップではベースドシーケンシングを使用できない |
| エラー 46 | バッチがロールアップのインボックスと一致しない（`inbox_end` または `data_hash` が誤り） |
| エラー 48 | 無効な実行モードまたはプライバシーモード |
| エラー 49 | 提出者ボンドが必要 |
| エラー 50 | 提出者ボンドがまだロックされている |
| エラー 51 | 不正証明がバッチの無効性を示していない |
| エラー 52 | STARK 決済は一時停止されている |
| エラー 53 | 投稿が、ロールアップのメンバー宛ての有効なエンベロープではない |
| エラー 54 | ロールアップにまだユーザーのデポジットがあるため、停止できない |

## 関連ページ {#related}

* [ロールアップ概要](/rollups/overview)
* [プリセットプロファイル](/rollups/preset-profiles)
* [ロールアップのデプロイ](/rollups/deploying-a-rollup)
* [データ可用性](/rollups/data-availability)
* [ZK / STARK と出金](/rollups/zk-stark-withdrawals)
* [ウォッチタワー](/rollups/watchtower)
