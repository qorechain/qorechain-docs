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
稼働中のメインネット(チェーンバージョン **v3.1.92**)に対してブロードキャストするには `--chain-id qorechain-vladi` を設定し、テストネットには `--chain-id qorechain-diana` を設定します。省略した場合、クライアントはローカル設定の `chain-id` を使用します。
:::

共通フラグはすべての `tx` サブコマンドに適用されます。

| フラグ                | 型   | 説明                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | 署名キーの名前またはアドレス              |
| `--chain-id`        | string | チェーン識別子(デフォルト: 設定ファイルから)         |
| `--fees`            | string | トランザクション手数料(例: `500uqor`)              |
| `--gas`             | string | ガスリミット、または見積もり用の `auto`             |
| `--gas-adjustment`  | float  | `auto` 使用時のガス倍率(デフォルト: 1.0) |
| `--keyring-backend` | string | キーリングバックエンド: `os`、`file`、`test`           |
| `--node`            | string | RPCエンドポイント(デフォルト: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`、`async`、または `block`                     |
| `-y`                | bool   | 確認プロンプトをスキップ                        |

---

## bank

### send

あるアカウントから別のアカウントへトークンを送金します。

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

ネットワーク上に新しいバリデータを作成します。

```bash
qorechaind tx staking create-validator [flags]
```

| フラグ                           | 型   | 説明                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | 自己委任額(例: `1000000uqor`) |
| `--pubkey`                     | string | バリデータのコンセンサス公開鍵(JSON)        |
| `--moniker`                    | string | バリデータの表示名                       |
| `--commission-rate`            | string | 初期コミッションレート(例: `0.10`)       |
| `--commission-max-rate`        | string | 最大コミッションレート                      |
| `--commission-max-change-rate` | string | 1日あたりの最大コミッション変更率         |
| `--min-self-delegation`        | string | 必要な最小自己委任額             |

### edit-validator

既存のバリデータの説明またはコミッションを編集します。

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

バリデータにトークンを委任します。

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

委任をあるバリデータから別のバリデータへ移動します。

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

バリデータからトークンの委任を解除します。

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

保留中のステーキング報酬をすべて引き出します。

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

特定のバリデータから報酬を引き出します。

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| フラグ           | 型 | 説明                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | バリデータのコミッションも同時に引き出す |

---

## gov

### submit-proposal

ガバナンス提案を提出します。

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

提案ファイルは、提案タイプ、タイトル、説明、および実行するメッセージを指定するJSONドキュメントです。

### vote

有効な提案に投票します。

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

投票オプション: `yes`、`no`、`abstain`、`no_with_veto`。

### deposit

提案にデポジットを追加します。

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Cosmosトランザクションパスでは、デフォルトでハイブリッド署名が必須です(`hybrid_signature_mode = required`)。`gen-key` および `cosign` コマンドは、Dilithium-5(ML-DSA-87)鍵と、従来のsecp256k1署名と併用してcosmosパスでトランザクションを行うために必要な `PQCHybridSignature` 拡張を生成します。

### gen-key

ハイブリッド署名用のDilithium-5(ML-DSA-87)耐量子鍵を生成します。

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Dilithium-5の共同署名を `PQCHybridSignature` 拡張としてトランザクションに付与し、ハイブリッド(secp256k1 + ML-DSA-87)トランザクションを生成します。デフォルトの `required` 強制モードでは、cosmosパスのトランザクションに必須です。標準のCosmJS/リレイヤーツールはこの拡張を生成する必要があります。QoreChain SDKの `buildHybridTx`(`includePqcPublicKey` 付き)も同等の処理を行います。

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

アカウント用の耐量子公開鍵を登録します。

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

拡張メタデータとアテステーション付きでPQC鍵を登録します。

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| フラグ            | 型   | 説明                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEEアテステーションデータ(hex)     |
| `--metadata`    | string | 追加の鍵メタデータ(JSON) |

### migrate-key

既存の従来型鍵をハイブリッドPQC鍵ペアに移行します。

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

アカウントのML-DSA-87鍵を、そのBIP-39ニーモニック(標準入力から読み込み)から決定論的に再構築し、ローカルに保存します(チェーンバージョン **v3.1.85** 以降で利用可能)。エコシステム標準の導出方式 `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` を使用します。

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| フラグ           | 型   | 説明                                              |
| -------------- | ------ | -------------------------------------------------------- |
| `--derivation` | string | `adapter`(正規、デフォルト)または `bridge`(旧式の `SHAKE-256(mnemonic)`) |

### rotate-key

アカウントのML-DSA-87鍵を**同一アルゴリズム内で**ローテーションします(チェーンバージョン **v3.1.85** 以降で利用可能)。例えば、旧式の導出方式で作られた鍵を正規の導出方式に移行したり、漏洩した鍵を無効化したりする場合に使用します。標準入力からニーモニックを読み込み、新旧両方の鍵で二重署名し、旧鍵でエンベロープを共同署名してからブロードキャストします。標準出力にはトランザクションのJSONのみを出力するため(情報メッセージは標準エラー出力へ送られます)、`-o json` と組み合わせて使用できます。

```bash
qorechaind tx pqc rotate-key [flags]
```

| フラグ               | 型   | 説明                                      |
| ------------------ | ------ | ------------------------------------------------ |
| `--old-derivation` | string | 現在登録されている鍵の導出方式(`adapter` \| `bridge`) |
| `--new-derivation` | string | 新しい鍵の導出方式(`adapter` \| `bridge`) |
| `--new-random`     | bool   | 代わりに新しいランダム鍵を生成する              |

---

## xqore

### lock

QORトークンをxQOREガバナンスステーキングポジションにロックします。

```bash
qorechaind tx xqore lock <amount> [flags]
```

| フラグ              | 型   | 説明                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | ロック期間(例: `30d`、`90d`、`180d`) |

### unlock

xQOREをQORに戻してアンロックします。早期アンロックには、ペナルティ階層に応じてペナルティが課される場合があります。

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

外部チェーンからのブリッジ入金を開始します。

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| フラグ          | 型   | 説明                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | QoreChain上の受取アドレス |

### withdraw

外部チェーンへのブリッジ出金を開始します。

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

1回の署名付きトランザクションでチェーンのブリッジを有効化または再設定します(チェーンバージョン **v3.1.80** 以降で利用可能)。ガバナンス提案やチェーンアップグレードは不要で、`bridge_admin` キーまたは `qcb_bridge` ライセンスが必要です。コントラクトアドレス、確認数、アーキテクチャ、ステータスを設定します。

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

チェーンのアクティブなベリファイアを選択し、そのトラストルートをインストールします(こちらも `bridge_admin` 権限が必要)。

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

実行環境間(EVM、CosmWasm、SVM)でクロスVMメッセージを送信します。

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| フラグ          | 型   | 説明                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | ソースVM: `evm`、`cosmwasm`、`svm`  |
| `--gas-limit` | uint   | クロスVM実行のガスリミット |

### process-queue

保留中のクロスVMメッセージを手動で処理します(オペレーター用コマンド)。

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

BPFプログラムをSVMランタイムにデプロイします。

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| フラグ           | 型   | 説明                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | 任意のプログラムID(base58) |

### execute

デプロイ済みのSVMプログラム上で命令を実行します。

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| フラグ         | 型   | 説明                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | 命令に使用するアカウント公開鍵(カンマ区切り) |

### create-account

割り当てられたデータ領域を持つ新しいSVMアカウントを作成します。

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| フラグ      | 型   | 説明                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | 所有プログラム(base58、デフォルト: システムプログラム) |

---

## multilayer

### register-sidechain

新しいサイドチェーンレイヤーを登録します。

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| フラグ                    | 型   | 説明                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | 目標ブロックタイム(ms、デフォルト2000)              |
| `--domains`             | string | サポートするドメイン(カンマ区切り、デフォルト `defi`)  |
| `--max-tx`              | uint   | ブロックあたりの最大トランザクション数(デフォルト1000)           |
| `--min-validators`      | uint32 | 最小バリデータセットサイズ(デフォルト1)              |
| `--settlement-interval` | uint   | 決済間隔(ブロック数、デフォルト100)         |
| `--vm-types`            | string | サポートするVMタイプ(カンマ区切り、デフォルト `evm`)  |

### register-paychain

高頻度マイクロトランザクション用の新しいペイチェーンレイヤーを登録します。

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| フラグ                    | 型 | 説明                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | ブロックあたりの最大トランザクション数(デフォルト5000)    |
| `--settlement-interval` | uint | 決済間隔(ブロック数、デフォルト50)   |

### anchor-state

登録済みレイヤーの状態アンカー(決済)を提出します。

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

トランザクションを最適なレイヤーへルーティングします。

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| フラグ             | 型   | 説明                       |
| ---------------- | ------ | ---------------------------------- |
| `--target-layer` | string | 特定のレイヤーへ強制的にルーティングする |

### update-layer-status

レイヤーの稼働ステータスを更新します(オペレーター専用)。

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

ステータス値: `active`、`paused`、`draining`。

### challenge-anchor

状態アンカーに対する不正チャレンジを提出します。

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Development Kitを使用して新しいロールアップを登録します。

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| フラグ                | 型   | 説明                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`、`zk`、`pessimistic`、`sovereign`       |
| `--profile`         | string | プリセット: `defi`、`gaming`、`nft`、`enterprise`、`custom` |
| `--stake`           | string | オペレーターのステーク額                                |
| `--da-enabled`      | bool   | ネイティブなデータ可用性を有効化                      |

### submit-batch

ロールアップの決済バッチを提出します。

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

決済バッチに対する不正チャレンジを提出します(オプティミスティックロールアップ用)。

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

チャレンジ期間を経過したバッチを手動でファイナライズします。

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

ロールアップを一時停止します(オペレーター専用)。

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

一時停止中のロールアップを再開します(オペレーター専用)。

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

ロールアップを完全に停止し、そのステークを解放します(オペレーター専用)。

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
ロールアップの出金とクロスレイヤー決済も `rdk` トランザクショングループの下で提供されています(例えば、ファイナライズ済みバッチに対して証明された出金を決済する `execute-withdrawal` コマンドなど)。正確な引数とフラグはロールアップの決済タイプとDA設定によって異なります。これらのトランザクションを構築する前に、正式なコマンド体系については **Rollup Development Kit** のドキュメントを参照してください。
:::

---

## babylon

### submit-btc-checkpoint

エポックのBTCチェックポイントを提出します。

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon統合を通じてBTCをリステークします。

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| フラグ            | 型   | 説明                       |
| --------------- | ------ | ---------------------------------- |
| `--btc-tx-hash` | string | 証明としてのビットコイントランザクションハッシュ |

---

## abstractaccount

### create

プログラム可能な支出ルールを持つアブストラクトアカウントを作成します。

```bash
qorechaind tx abstractaccount create [flags]
```

| フラグ               | 型   | 説明                       |
| ------------------ | ------ | ---------------------------------- |
| `--spending-rules` | string | 支出ルールを定義するJSONファイル |

### update-spending-rules

既存のアブストラクトアカウントの支出ルールを更新します。

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

正規アカウントから、オーセンティケーターによって承認されたNativeレーンのbank送金をリレーします(チェーンバージョン **v3.1.85** 以降で利用可能)。リレイヤー(`--from`)がエンベロープに署名し、手数料を支払います。リプレイに紐づけられた署名バイト列に対するリンク済み鍵の署名が、その承認となります。[Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) を参照してください。

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

正規アカウントのEVMアドレスから、オーセンティケーターによって承認されたEVM呼び出しまたは送金をリレーします(チェーンバージョン **v3.1.85** 以降で利用可能)。ノンスはアカウントの**現在の**EVMノンスです。

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISMは、コンセンサスパラメータを調整する強化学習レイヤーです。これらのコマンドはPRISMエージェントを制御します。CLIモジュール名 `rlconsensus` およびそのサブコマンドは、そのまま維持されています。

### set-agent-mode

PRISMエージェントの動作モードを設定します(ガバナンス専用)。

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

モード値: `0`(オフ)、`1`(観察)、`2`(提案)、`3`(自動)。

### resume-agent

サーキットブレーカー発動後にPRISMエージェントを再開します。

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISMエージェントのポリシー設定を更新します(ガバナンス専用)。

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISMエージェントの報酬重み設定を更新します。

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| フラグ                  | 型   | 説明                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | スループット報酬の重み |
| `--latency-weight`    | string | レイテンシ報酬の重み    |
| `--security-weight`   | string | セキュリティ報酬の重み   |
