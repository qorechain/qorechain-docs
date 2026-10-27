---
slug: /cli-reference/transaction-commands
title: トランザクションコマンド
sidebar_label: トランザクションコマンド
sidebar_position: 2
---

# トランザクションコマンド

すべてのトランザクションコマンドは次のパターンに従います。

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
稼働中のメインネットに対してブロードキャストするには `--chain-id qorechain-vladi` を設定し、テストネットには `--chain-id qorechain-diana` を設定します。どちらのネットワークもv3.2系で稼働しています。メインネットのノードリリースは **v3.2.4**(ガバナンス提案 13 により2026年10月23日にブロック高 3,742,566 で適用。v3.2.3 は2026年10月20日にブロック高 3,662,051 で適用されました。ガバナンス提案 14 は、ブロック高 3,906,833 で v3.2.5 を適用する予定で、本稿執筆時点では投票期間中です)、テストネットは **v3.2.6**(2026年10月27日にブロック高 8,970,638 で適用。それ以前に、v3.2.5 が10月26日にブロック高 8,890,800 で、v3.2.4 が10月19日にブロック高 8,337,253 で適用されました)です。現在のリリースは [download.qore.host](https://download.qore.host) 配下の `latest.json` で確認してください。`--chain-id` を省略した場合、クライアントはローカルのクライアント設定にある `chain-id` を使用します。

このページのコマンドとフラグは、v3.2.3 のリリースバイナリで確認し、v3.2.4 での追加分を加えています。v3.2.4 以降にのみ存在するもの(メインネットでは2026年10月23日から、テストネットでは2026年10月19日から)には、その旨を明記しています。v3.2.6 のソースには新しい `tx` コマンドは追加されていません。変更されたのはテストネットの状態(テストトークン、有効化されたアブストラクトアカウントモジュール、開放された QoreChain Native のインスタンス化)で、重要な箇所では以下のセクションで触れています。
:::

共通フラグはすべての `tx` サブコマンドに適用されます。

| フラグ                | 型     | 説明                                                           |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | 署名キーの名前またはアドレス                                   |
| `--chain-id`        | string | チェーン識別子(デフォルト: クライアント設定から)              |
| `--fees`            | string | トランザクション手数料(例: `40000uqor`)                      |
| `--gas-prices`      | string | `--fees` の代わりに指定するガス価格(例: `0.1uqor`)           |
| `--gas`             | string | ガスリミット、または見積もり用の `auto`(デフォルト `200000`) |
| `--gas-adjustment`  | float  | `auto` の見積もりに掛ける倍率(デフォルト `1`)                |
| `--keyring-backend` | string | `os`、`file`、`kwallet`、`pass`、`test`、または `memory`       |
| `--node`            | string | RPCエンドポイント(デフォルト `tcp://localhost:26657`)         |
| `--broadcast-mode`  | string | `sync` または `async`                                          |
| `--generate-only`   | bool   | 署名せず、未署名のトランザクションを出力する                   |
| `-y`                | bool   | 確認プロンプトをスキップ                                       |

---

## 手数料とガス {#fees-and-gas}

ネットワークの手数料下限は **ガス1単位あたり0.1 uqor** です(`query feemarket params` で `min_gas_price` を確認できます。実際のベースフィーは負荷時に下限を上回ることがあります。`query feemarket base-fee` を参照してください)。`fee >= gas limit x gas price` を満たさないトランザクションは拒否されるため、`--fees 500uqor` はガスリミットが5,000以下の場合にのみ機能し、実際のトランザクションでは失敗します。

| トランザクション                                       | 推奨 `--gas` | 対応する `--fees` |
| ---------------------------------------------------- | ------------ | ----------------- |
| ハイブリッド署名の送金、委任、投票、クレーム           | `400000`     | `40000uqor`       |
| PQC鍵の登録                                          | `600000`     | `60000uqor`       |
| `lightnode register`                                 | `300000`     | `30000uqor`       |

ハイブリッド署名はトランザクションに約4.7 KBを追加し、これは1バイトあたり10ガスで課金されます。そのため、デフォルトの `--gas 200000` では足りない場合があります。メインネット上のハイブリッド署名の送金では、およそ160,000〜240,000ガスが使用されました。常に `--gas` を `--fees`(または `--gas-prices`)と併せて明示的に指定してください。

---

## Cosmosレーンではハイブリッド署名が必須です {#hybrid-signing}

`hybrid_signature_mode` は両ネットワークで `required` です(`qorechaind query pqc hybrid-mode`)。すべてのCosmosレーンのトランザクションには、secp256k1署名に加えてML-DSA-87(Dilithium-5)署名が必要です。単純な `tx bank send ... -y` は拒否されます(codespace `pqc`、コード 20)。メインネット v3.2.3 以降の例外は次のもののみです。

- まだ鍵を持たないアカウントの**最初の**PQC鍵登録(`register-key` または `register-key-v2`)。新しいアカウントがブートストラップできるようにするためです。
- 使用可能な鍵を保持していないアカウントレコードの、`register-key-v2` による修復。
- PQC鍵が登録されていないアカウントによる `tx slashing unjail`。

すでにPQC鍵を保持しているアカウントは、`register-key-v2` と `migrate-key` を**含め**、すべてにハイブリッド署名をしなければなりません(従来型のみの試みはコード 234 で拒否されます)。鍵のないアカウントはハイブリッド署名も付けられません。照合する対象がないため、最初に登録を行います。

したがって、このページのコマンドのうち、最初の登録(鍵のないアカウントでの `pqc register-key` / `pqc register-key-v2`)を除くすべては、2段階で実行します。まず `--generate-only` でトランザクションを構築し、次に `tx pqc cosign` で署名してブロードキャストします。`pqc rotate-key` は自身で共同署名とブロードキャストを行います。`pqc gen-key` と `pqc recover-key` はローカルに鍵ファイルを作成するだけです。

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

キー名 `mypqc` は、`tx pqc gen-key` で作成してアカウントに登録した鍵です([pqc](#pqc) を参照)。このためには [download.qore.host](https://download.qore.host) の公式リリースバイナリを使用してください。公開ソースツリーからビルドしたバイナリでは、Dilithium署名の作成も適用もできません(`gen-key` と `cosign` はフルビルドが必要であると報告します)。[QoreX](/qorex/overview) とSDKは、同じ署名処理を代行します。

---

## bank

### send

あるアカウントから別のアカウントへトークンを送金します。

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

例: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`、続いて上記のとおり `tx pqc cosign` を実行します。1 QOR = 1,000,000 uqor です。

---

## staking

### create-validator

JSONファイルからバリデータを作成します(フラグ形式は廃止されました)。メインネットでは、有効な `validator_operator` ライセンスと登録済みのPQC鍵も必要です。[バリデータの運用](/developer-guide/running-a-validator) を参照してください。

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

既存のバリデータの説明またはコミッションを編集します。

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

フラグ: `--new-moniker`、`--website`、`--identity`、`--security-contact`、`--details`、`--commission-rate`、`--min-self-delegation`。省略したフィールドは変更されません。

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

進行中のアンボンディングエントリをキャンセルします。

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

ジェイル期間の経過後、ジェイルされたバリデータをアクティブセットに復帰させます。

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

保留中のステーキング報酬をすべて引き出します。

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

1つのバリデータから報酬を引き出します。

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| フラグ           | 型   | 説明                                                         |
| -------------- | ---- | ------------------------------------------------------------ |
| `--commission` | bool | コミッションも同時に引き出す(バリデータのオペレーターアドレス) |

---

## gov

### submit-proposal

`messages`、`metadata`、`deposit`、`title`、`summary`、および任意で `expedited` を含むJSONファイルからガバナンス提案を提出します。`qorechaind tx gov draft-proposal` でひな形を生成できます。

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

投票オプション: `yes`、`no`、`abstain`、`no_with_veto`。投票を分割するには `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` を使用します。

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Dilithium-5(ML-DSA-87)鍵を生成し、`<home>/pqc/<name>.dilithium` に保存します(モード `0600`、**暗号化されません**)。公開鍵を16進数で出力します。

```bash
qorechaind tx pqc gen-key <name>
```

`gen-key` と `recover-key` は、同名の既存の鍵ファイルの上書きを拒否します。`--force` を指定すると置き換えられ、古いファイルは `<name>.dilithium.bak-<unix-time>` として残されます。

### register-key

アカウントにPQC公開鍵を登録します(レガシーコマンド: アルゴリズムはDilithium-5)。最初の登録は従来型の鍵のみで署名します。これがブートストラップの例外です。すでに鍵があるアカウントはハイブリッド署名をしなければなりません(`--generate-only`、続いて `tx pqc cosign`)。

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` は `hybrid`(推奨)または `pqc_only` です。`classical_only` は拒否されます(コード 230)。ポスト量子鍵が登録されず、アカウントが二度と署名できなくなるためです。2,592バイトの公開鍵のため、登録は送金よりもコストが高くなります。これが、より大きなガスリミットが必要な理由です。

チェーンは、ポスト量子の保護を提供しない鍵(コード 230)と、このアカウントが以前に使用した鍵(コード 232)も拒否します。従来型の鍵が署名者自身のものではない登録も拒否します(コード 45)。

### register-key-v2

アルゴリズムを明示的に選択して鍵を登録し、必要に応じて、その鍵の秘密を保持していることを証明します。

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` は `dilithium5`(または `1`)、もしくは `mlkem1024`(または `2`)です。`key_type` は `hybrid` または `pqc_only` です。

**所有証明(任意)。** `--pqc-key <name>`(`gen-key` または `recover-key` で作成した鍵)を指定すると、コマンドは所有証明を付加します。これは、新しい鍵自身による `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` に対する署名です。チェーンは、所有証明がある場合はそれを検証し、検証に失敗した場合は登録を拒否します(コード 231)。所有証明のない登録も引き続き受け付けられます。この証明にはチェーン、アルゴリズム、アカウント、鍵が含まれているため、別のアカウントやネットワークに対しては何も証明しません。トランザクションに4,627バイトの署名が1つ追加されるため、ガスリミットは `600000` のままにしてください。証明はメッセージの `proof_of_possession` フィールドで運ばれます。TypeScript SDK 0.9.0 は、ネットワークが v3.2.3 を適用すると、`ensurePqcRegistered` を通じて自動的に証明を付加します。それ以前のSDKリリースと `@qorechain/wallet-adapter` は付加しないため、それらを通じた登録には証明が付きません(引き続き受け付けられます)。

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

v3.2.4 以降(メインネットでは2026年10月23日から、テストネットでは2026年10月19日から)は、アカウントレコードに証明が検証されたかどうかも `possession_proven` として報告されます([REST / gRPC エンドポイント](/api-reference/rest-grpc-endpoints#pqc-module)を参照)。

### cosign

未署名のトランザクションにPQC鍵とアカウントの従来型鍵で署名し、ブロードキャストします。

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| フラグ           | 説明                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | `gen-key` または `recover-key` で作成した鍵の名前                                                 |
| `--sign-bytes` | `auto`(デフォルト: どのsign-bytes形式が適用されるかをチェーンに問い合わせる)、`v1`、または `v2`   |
| `--generate-only` / `--offline` | ブロードキャストせず、署名済みトランザクションをJSONで出力する。後で `tx broadcast` で送信する。`--offline` には `--account-number`、`--sequence`、`--sign-bytes v1\|v2` も必要 |
| `--dry-run`    | シミュレートしてガス見積もりを出力する                                                            |

両ネットワークとも、ハイブリッド検証をv2のsign-bytesに移行するアップグレードを適用済みです。v1形式は拒否されます。トランザクションが持てるハイブリッド署名拡張は1つだけです(v3.2.3 以降、複数あると拒否されます)。

### migrate-key

アカウントのPQC鍵をあるアルゴリズムから別のアルゴリズムへ移行します。現在のアルゴリズムに対する移行が有効になっている必要があります(ガバナンスによって開始されます)。両方の鍵が移行バイト列に署名し、トランザクション自体にもあなたのハイブリッド署名が必要です(`--generate-only`、続いて `tx pqc cosign`)。アカウントが以前に使用した鍵は拒否されます(コード 232)。

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### recover-key

アカウントのML-DSA-87鍵を、そのBIP-39ニーモニック(標準入力から読み込み)から再構築し、ローカルに保存します。`SHAKE-256("qorechain:pqc:v1|address|mnemonic")` を使用します。

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| フラグ           | 型     | 説明                                                                       |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter`(正規、デフォルト)または `bridge`(レガシーの `SHAKE-256(mnemonic)`) |

### rotate-key

アカウントのML-DSA-87鍵を同一アルゴリズム内でローテーションします。標準入力からニーモニックを読み込み、旧鍵と新鍵の両方で二重署名し、旧鍵で共同署名してブロードキャストします。

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| フラグ               | 型     | 説明                                                                                 |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | 現在登録されている鍵の導出方式: `bridge`(デフォルト)または `adapter`                 |
| `--new-derivation` | string | 新しい鍵の導出方式: `adapter`(デフォルト)または `bridge`                             |
| `--new-random`     | bool   | 新しいランダム鍵へローテーションする。`--new-key-out` が必要                         |
| `--new-key-out`    | string | 何かを送信する前に、新しい秘密鍵を `<home>/pqc/<name>.dilithium` として保存する      |
| `--sign-bytes`     | string | `auto`(デフォルト)、`v1`、または `v2`                                                |

v3.2.3 以降、ローテーションは、ポスト量子の保護を提供しない新しい鍵(コード 230)と、アカウントが以前に使用した鍵(コード 232)を拒否します。アカウントはローテーションで手放した鍵を記憶しているため、ローテーションを再生して古い鍵に戻すことはできません。

### open-evm-window

EVMレーンは、登録済みのPQC鍵を保持し、**かつ**認可ウィンドウが開いているアカウントからのトランザクションのみを受け付けます。ウィンドウはCosmosレーンのメッセージで開くため、Ethereumウォレットでは提供できないPQC署名がそこに含まれます。ウィンドウ内では、通常のMetaMaskトランザクションがそのまま機能します。

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| 引数          | 上限                 | 意味                                                                                          |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1〜17,280            | ウィンドウを開くブロックから数えて、ウィンドウが開いたままになる期間                          |
| `max-txs`   | 1〜1,000             | 受け付けるEVMトランザクションの数                                                             |
| `max-value` | 正の値               | 受け付ける合計。送金額と、各トランザクションが支払う可能性のある最大手数料の**両方**を含む。`uqor` または `qor`(例: `1000qor`) |

ウィンドウを開くと、既存のウィンドウは置き換えられます。`qorechaind query pqc evm-window <address>` で確認できます。

**範囲を限定したウィンドウ(メインネット v3.2.3 以降)。** 価値の上限はネイティブQORのみを数えます。トークン送金、承認、その他のコントラクト呼び出しは価値ゼロとなり、上限には数えられません。任意の2つのフラグで、ウィンドウが受け付ける内容を絞り込めます。

| フラグ                | 効果                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | 通常のQOR送金のみを受け付ける: calldataなし、コントラクト作成なし、コードを持つ宛先なし、EIP-7702認可なし |
| `--allowed-targets` | これらの宛先のみを受け付ける(カンマ区切りの `0x` アドレス)。コントラクト作成は拒否される                                  |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

どちらのフラグも付けずに開いたウィンドウは、従来どおりの内容を受け付けます。範囲は、ウィンドウのクエリで `native_only` と `allowed_targets` として報告されます。

### close-evm-window

たとえば従来型の鍵が漏洩した疑いがある場合に、ウィンドウをただちに閉じます。保留中のEIP-7702委任の同意も取り消します。

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation と clear-evm-delegation

アカウントのEIP-7702委任は、あなた自身のポスト量子の同意がある場合にのみ有効になります(メインネットでは v3.2.2 以降)。`authorize-evm-delegation` は、1つの委任先アドレスに対するその同意を記録します。同意は1回限りで、指定したブロック数の経過後に失効し、`close-evm-window` によって取り消されます。`clear-evm-delegation` は、すでに設定されている委任を削除します。どちらもハイブリッド署名のCosmosレーンのメッセージです(`--generate-only`、続いて `tx pqc cosign`)。

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

`delegate` にゼロアドレスを指定すると、委任の解除に同意したことになります。状態は `qorechaind query pqc evm-delegation-consent <address>` で確認できます。

PQC鍵のメッセージ(`register-key`、`register-key-v2`、`rotate-key`、`migrate-key`)は、いずれも `authz` を通じてアカウントの代理として送信することはできません(メインネット v3.2.3 以降)。

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` は `sx` または `ux` です。登録には、ネットワークのライセンス権限者が付与する有効な `lightnode_operator` ライセンスが必要です。プログラムの現在のステータスについては[ライトノード](/light-node/overview)を参照してください。その他のコマンド: `tx lightnode heartbeat`、`tx lightnode claim-rewards`、`tx lightnode deregister`。

v3.2.3 以降、ノードが蓄積できる報酬は**月ごと**に上限が設けられています(`GET /qorechain/lightnode/v1/reward_pool` の `max_reward_per_month_per_node`、30日あたり2,000 QOR)。これはブロック時間とアップタイムに応じて按分されるため、上限はブロック生成の速さに左右されなくなりました。上限は天井であり、約束された金額ではありません。v3.2.4 以降(メインネットでは2026年10月23日から、テストネットでは2026年10月19日から)は、ノードの上限は前回の精算ではなく、そのノード自身の登録時点から始まります。

---

## bridge

ブリッジは本番稼働していません。両ネットワークとも、設定済みのすべてのチェーンが `pending` ステータスで、ブリッジバリデータは登録されていません(`query bridge chains`、`query bridge validators`)。

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

送信元チェーンからブリッジされたアセットをクレジットします。バリデータ署名(`--validator-sigs`、`--pqc-commitment`)を伴います。これはブリッジオペレーター用のメッセージであり、エンドユーザーが入金を開始する方法ではありません。

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### register-validator / attest

ブリッジバリデータ用のメッセージです。`register-validator <pqc_pubkey_hex> <supported_chains_csv>` はアテステーション任務のためにバリデータを登録し、`attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` はアテステーションを送信します。どちらのネットワークにも、ブリッジバリデータは登録されていません。v3.2.4 以降(メインネットでは2026年10月23日から、テストネットでは2026年10月19日から)は、ブリッジバリデータの登録には所有証明と、他のブリッジバリデータが使用していない鍵も必要です。

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

管理用です(`bridge_admin` または `qcb_bridge` ライセンス。サーキットブレーカーの上限はガバナンスでも設定できます)。

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

上限は基本単位で、`0` は無制限を意味します。価値を移動するのは、ステータスがちょうど `active` のルートだけです。

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

最初の `transfer` はサブコマンド、2番目は送信元ポートです。本稿執筆時点で、メインネットにはIBCチャネルが開いていません。テストネットには開いている転送チャネルが1つあります(`channel-0`、2026年10月27日に `query ibc channel channels` で確認)。

---

## amm

ネイティブAMMのメッセージです。執筆時点ではどちらのネットワークにもプールが存在しないため、これらのコマンドはまだ作用する対象がありません。

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

v3.2.2 以降、スワップではプールの両方のデノミネーションを指定する必要があり、`max_swap_impact_bps` が強制され、プロトコル手数料はバーンモジュールを経由して処理されます。

テストネットでは、プールは `uqor` と3つの Fest テストトークン(価値なし、テストネットのみ)のいずれかとをペアにできます。デポジットとスワップの金額には、大文字小文字を区別するバンクデノミネーション `erc20:<EIP-55 0x address>` を使用します。例: `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json`(その後 `tx pqc cosign`)。EVM 側に保有されているトークンは、まず `MsgConvertERC20` でバンクコインに変換する必要があります。その送信者は `qor1` アドレスです。ノードリリース v3.2.6 の CLI コマンド `qorechaind tx erc20 convert-erc20` は送信者を `0x` アドレスとして書き込み、チェーンはこれを拒否します(`decoding bech32 failed`)。そのため、代わりに `qor1` の送信者でこのメッセージを構築してください。詳細: [テストネットの Fest テストトークン](/developer-guide/evm-development#fest-tokens)。プールの作成には、デポジットに加えてプール作成手数料がかかります(`query amm params` の `pool_creation_fee`)。

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

ネイティブトークン(例: `1000000uqor`)を手数料変換フロートに移します。これは、手数料が他の受け入れ対象トークンで支払われた際に、モジュールがバリデータへの支払いに使うQORの準備金です。どのトークンを受け入れるかはガバナンスが決定します。両ネットワークとも、設定ではネイティブの `uqor` のみを受け入れるため、変換は行われません。`qorechaind query gasabstraction accepted-tokens` で確認できます。

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call` は、サーキットブレーカーによりメインネットで無効化されており([下記](#disabled-messages)を参照)、テストネットでは対象のレーンが利用可能な場合にのみ機能します。キューに入れられた呼び出し(`--async`)が失敗しても副作用は残らず、`Failed` レコードのみが残ります(v3.2.3 以降)。また、導出された送信元レーンが対象レーンと同じ呼び出しは拒否されます。[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## stakingtier (v3.2.4) {#stakingtier}

:::note v3.2.4 から利用可能
ステーキングティアモジュールは **v3.2.4** リリースで登場しました。`qorechain-diana` テストネットでは2026年10月19日から稼働しており、メインネットでは2026年10月23日(ブロック高 3,742,566、ガバナンス提案 13)から稼働しています。それより古いリリースのノードにはこのモジュールがなく、これらのコマンドは拒否されます。対象のノードで、まず `GET /qorechain/stakingtier/v1/params` を確認してください。
:::

任意の期間ロック付き委任です。委任者は既存の委任の一部を3、6、または12か月(最小ロックは 10 QOR)ロックでき、後でモジュールがそれに対してクレジットするボーナスをクレームできます。ロックは委任の上に載るレコードであり、委任された資金はバリデータに残ります。

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

ロックはステーキングのメッセージサーバーによって強制されるため、`authz`、グループ、またはコントラクトを通じたアンデリゲートにも適用されます。ロックを早期に終了すると、未払いのボーナスは失われ、ペナルティがバーンされます。最小ロック額とその他のパラメータは `GET /qorechain/stakingtier/v1/params` にあります。他のすべてのCosmosレーンのトランザクションと同様に、これらにもハイブリッド共同署名(`--generate-only`、続いて `tx pqc cosign`)と、余裕のあるガスリミット(例: `--gas 900000 --fees 90000uqor`)が必要です。

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` は `defi`、`gaming`、`nft`、`enterprise`、または `custom` です。`stake_amount` はuqor単位です(現在の最小値は `query rdk config` にあります)。プロファイルのプリセットが決済、シーケンサー、DA、ガスモデルを提供し、コマンドラインで上書きできるのはVMのみです。`finalize-batch` コマンドはありません。

データ可用性が `native`(または `both`)のロールアップでは、`--data-hash` を空のままにしてください。データ可用性ブロブを投稿するトランザクションはなく、そのようなロールアップに対してデータハッシュを主張するバッチは、チェーンに拒否されます(本稿執筆時点のメインネットリリースであるノードリリース v3.2.4 の動作です)。オプティミスティックロールアップでは、`@qorechain/rdk` クライアント(0.7.0)がバッチのステートルートをチェーンの正規の遷移ルート(RDK の `batchTransitionRoot`)に設定します。[ロールアップ](/rollups/overview)を参照してください。

`--anchor-signature` は、**v2のアンカー署名バイト列**に対するロールアップ作成者のML-DSA署名です。これを付けると、バッチはマルチレイヤーモジュールにもアンカーされます。署名すべき正確なバイト列は `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>` で出力できます。値は `submit-batch` のフラグと一致していなければなりません。v3.2.3 以降、モジュールは**ロールアップごとのエスクロー台帳**を保持します。引き出しはそのロールアップの台帳が保持している範囲からのみ支払われ、デノミネーション、正の金額、証明の深さ、兄弟ノードのサイズが検査されます。ロールアップを停止すると、その台帳に残っているものだけが返金され、停止したロールアップはそれ以上の引き出しを支払いません。執筆時点では、どちらのネットワークにもロールアップは存在しません。

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` は `proposed`、`active`、`suspended`、または `decommissioned` です。`update-layer-status` は、サーキットブレーカーによりメインネットで無効化されています(下記参照)。

---

## 現在無効、または利用できないメッセージ {#disabled-messages}

バイナリには存在するものの、稼働中のネットワークでは成功しないコマンドがあります。

| コマンド                                                  | 理由                                                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`、`tx wasm instantiate`、`instantiate2`    | メインネット: アップロードとインスタンス化の権限は `Nobody` で、3 つのメッセージタイプはサーキットブレーカーのリストに含まれています。テストネット: アップロードは `Nobody` で `MsgStoreCode` がリストに含まれています(コードの保存はガバナンスが行います)。一方、インスタンス化は開放されており(`Everybody`)、リストにも含まれていません |
| `tx crossvm call`                                         | サーキットブレーカーによりメインネットで無効。テストネットでは有効                             |
| `tx vesting create-vesting-account`、`create-periodic-vesting-account`、`create-permanent-locked-account` | メインネットのサーキットブレーカーのリストに含まれています。v3.2.3 以降は、いずれにしてもベスティングアカウントは署名者自身に対してしか作成できません |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | ガバナンス提案のメッセージ(CLIコマンドなし)で、メインネットのサーキットブレーカーのリストに含まれています。v3.2.3 以降、ガバナンスでも最後の有効な署名アルゴリズムは削除できません |
| `tx svm deploy-program`、`execute`、`create-account`      | SVMトランザクションレーンはネットワーク全体で無効                                              |
| `tx abstractaccount create`、`register-authenticator`、`execute-cosmos`、`execute-evm` | メインネット: アブストラクトアカウントモジュールはオフになっています(`query abstractaccount config` は `enabled: false` を示します)。テストネット: ガバナンスによりオンになっています(`enabled: true`、2026年10月27日に確認) |
| `tx rlconsensus *`、`tx amm pause-pool`/`resume-pool`      | ガバナンス権限のメッセージ。メインネットのサーキットブレーカーのリストにも含まれています       |
| `tx license *`                                            | 権限者専用(ライセンスはネットワークのライセンス権限者によって付与されます。v3.2.3 以降、ガバナンスは `MsgUpdateAuthority` でその権限者を置き換えられます) |

現在の一覧は `qorechaind query circuit disabled-list` で確認できます。
