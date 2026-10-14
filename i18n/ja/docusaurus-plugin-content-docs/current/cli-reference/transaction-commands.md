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
稼働中のメインネットに対してブロードキャストするには `--chain-id qorechain-vladi` を設定し、テストネットには `--chain-id qorechain-diana` を設定します。どちらのネットワークもv3.2系で稼働しています(メインネットのノードリリースは **v3.2.1**、テストネットは **v3.2.2**。現在のリリースは [download.qore.host](https://download.qore.host) 配下の `latest.json` で確認してください)。`--chain-id` を省略した場合、クライアントはローカルのクライアント設定にある `chain-id` を使用します。
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

`hybrid_signature_mode` は両ネットワークで `required` です(`qorechaind query pqc hybrid-mode`)。すべてのCosmosレーンのトランザクションには、secp256k1署名に加えてML-DSA-87(Dilithium-5)署名が必要です。単純な `tx bank send ... -y` は拒否されます。例外は、PQC鍵の登録と移行(新しいアカウントが最初の鍵を登録できるようにするため)、およびPQC鍵が登録されていないアカウントによる `tx slashing unjail` のみです。

したがって、このページのコマンドのうち `pqc register-key`、`pqc register-key-v2`、`pqc migrate-key` を除くすべては、2段階で実行します。まず `--generate-only` でトランザクションを構築し、次に `tx pqc cosign` で署名してブロードキャストします。

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

### register-key

アカウントにPQC公開鍵を登録します(レガシーコマンド: アルゴリズムはDilithium-5)。従来型の鍵のみで署名します。これがブートストラップの例外です。

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` は `hybrid`(推奨)、`pqc_only`、または `classical_only` です。2,592バイトの公開鍵のため、登録は送金よりもコストが高くなります。これが、より大きなガスリミットが必要な理由です。

### register-key-v2

アルゴリズムを明示的に選択して鍵を登録します。

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` は `dilithium5`(または `1`)、もしくは `mlkem1024`(または `2`)です。

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

両ネットワークとも、ハイブリッド検証をv2のsign-bytesに移行するアップグレードを適用済みです。v1形式は拒否されます。

### migrate-key

アカウントのPQC鍵をあるアルゴリズムから別のアルゴリズムへ移行します。現在のアルゴリズムに対する移行が有効になっている必要があります(ガバナンスによって開始されます)。両方の鍵が移行バイト列に署名します。

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
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

### close-evm-window

たとえば従来型の鍵が漏洩した疑いがある場合に、ウィンドウをただちに閉じます。

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` は `sx` または `ux` です。登録には有効な `lightnode_operator` ライセンスが必要で、ライトノード報酬プログラムへの登録は**まだ開始されていません**。その他のコマンド: `tx lightnode heartbeat`、`tx lightnode claim-rewards`、`tx lightnode deregister`。[ライトノード](/light-node/overview) を参照してください。

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

### update-chain-config / set-verifier-bootstrap

管理用です(`bridge_admin` または `qcb_bridge` ライセンス)。

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

最初の `transfer` はサブコマンド、2番目は送信元ポートです。本稿執筆時点では、どちらのネットワークでもIBCチャネルは開いていません(`query ibc channel channels`)。

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` は `defi`、`gaming`、`nft`、`enterprise`、または `custom` です。`stake_amount` はuqor単位です(現在の最小値は `query rdk config` にあります)。プロファイルのプリセットが決済、シーケンサー、DA、ガスモデルを提供し、コマンドラインで上書きできるのはVMのみです。`finalize-batch` コマンドはありません。

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
| `tx wasm store`、`tx wasm instantiate`、`instantiate2`    | アップロードとインスタンス化の権限は両ネットワークで `Nobody` であり、これらのメッセージタイプはサーキットブレーカーのリストにも含まれています |
| `tx crossvm call`                                         | サーキットブレーカーによりメインネットで無効                                                   |
| `tx svm deploy-program`、`execute`、`create-account`      | SVMトランザクションレーンはネットワーク全体で無効                                              |
| `tx abstractaccount create`、`register-authenticator`、`execute-cosmos`、`execute-evm` | アブストラクトアカウントモジュールはオフになっています(`query abstractaccount config` は `enabled: false` を示します) |
| `tx rlconsensus *`、`tx amm pause-pool`/`resume-pool`      | ガバナンス権限のメッセージ。メインネットのサーキットブレーカーのリストにも含まれています       |
| `tx license *`                                            | 権限者専用(ライセンスはネットワークのライセンス権限者によって付与されます)                     |

現在の一覧は `qorechaind query circuit disabled-list` で確認できます。
