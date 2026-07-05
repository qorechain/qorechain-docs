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
ライブメインネット（チェーンバージョン **v3.1.85**）に対してブロードキャストするには `--chain-id qorechain-vladi` を、テストネットには `--chain-id qorechain-diana` を指定してください。省略した場合、クライアントはローカル設定の `chain-id` を使用します。
:::

共通フラグはすべての `tx` サブコマンドに適用されます。

| フラグ              | 型     | 説明                                            |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | 署名鍵の名前またはアドレス                      |
| `--chain-id`        | string | チェーン識別子（デフォルト: 設定ファイルから）  |
| `--fees`            | string | トランザクション手数料（例: `500uqor`）         |
| `--gas`             | string | ガス上限、または見積もりには `auto`             |
| `--gas-adjustment`  | float  | `auto` 使用時のガス倍率（デフォルト: 1.0）      |
| `--keyring-backend` | string | キーリングバックエンド: `os`、`file`、`test`    |
| `--node`            | string | RPC エンドポイント（デフォルト: `tcp://localhost:26657`） |
| `--broadcast-mode`  | string | `sync`、`async`、または `block`                 |
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

| フラグ                         | 型     | 説明                                         |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | セルフデリゲーション額（例: `1000000uqor`）  |
| `--pubkey`                     | string | バリデータのコンセンサス公開鍵（JSON）       |
| `--moniker`                    | string | バリデータの表示名                           |
| `--commission-rate`            | string | 初期コミッション率（例: `0.10`）             |
| `--commission-max-rate`        | string | 最大コミッション率                           |
| `--commission-max-change-rate` | string | 1 日あたりの最大コミッション変更率           |
| `--min-self-delegation`        | string | 必要な最小セルフデリゲーション               |

### edit-validator

既存のバリデータの説明またはコミッションを編集します。

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

バリデータにトークンをデリゲートします。

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

デリゲーションをあるバリデータから別のバリデータへ移動します。

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

バリデータからトークンをアンボンドします。

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

| フラグ         | 型   | 説明                                     |
| -------------- | ---- | ---------------------------------------- |
| `--commission` | bool | バリデータのコミッションも併せて引き出す |

---

## gov

### submit-proposal

ガバナンス提案を提出します。

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

提案ファイルは、提案の種類、タイトル、説明、および実行するメッセージを指定する JSON ドキュメントです。

### vote

アクティブな提案に投票します。

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

cosmos トランザクションパスでは、デフォルトでハイブリッド署名が必須です（`hybrid_signature_mode = required`）。`gen-key` および `cosign` コマンドは、従来の secp256k1 署名と並んで cosmos パスで取引するために必要な Dilithium-5（ML-DSA-87）鍵と `PQCHybridSignature` 拡張を生成します。

### gen-key

ハイブリッド署名用の Dilithium-5（ML-DSA-87）ポスト量子鍵を生成します。

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

トランザクションに Dilithium-5 の共同署名を `PQCHybridSignature` 拡張として付加し、ハイブリッド（secp256k1 + ML-DSA-87）トランザクションを生成します。デフォルトの `required` 強制モードでは、cosmos パスのトランザクションに必須です。標準の CosmJS / リレイヤーツールが取引を行うには、この拡張を生成する必要があります。QoreChain SDK の `buildHybridTx`（`includePqcPublicKey` 付き）は同等の処理を行います。

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

アカウントにポスト量子公開鍵を登録します。

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

拡張メタデータとアテステーション付きで PQC 鍵を登録します。

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| フラグ          | 型     | 説明                              |
| --------------- | ------ | --------------------------------- |
| `--attestation` | string | TEE アテステーションデータ（hex） |
| `--metadata`    | string | 追加の鍵メタデータ（JSON）        |

### migrate-key

既存の従来型鍵をハイブリッド PQC 鍵ペアへ移行します。

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

アカウントの ML-DSA-87 鍵を、その BIP-39 ニーモニック（標準入力から読み取り）から決定論的に再構築し、ローカルに保存します（チェーンバージョン **v3.1.85** から利用可能）。エコシステム標準の導出 `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` を使用します。

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| フラグ         | 型     | 説明                                                     |
| -------------- | ------ | -------------------------------------------------------- |
| `--derivation` | string | `adapter`（正規、デフォルト）または `bridge`（レガシー `SHAKE-256(mnemonic)`） |

### rotate-key

アカウントの ML-DSA-87 鍵を**同一アルゴリズム内で**ローテーションします（チェーンバージョン **v3.1.85** から利用可能）。たとえば、レガシー導出の鍵を正規の導出へ移行したり、漏洩した鍵を廃止したりする場合に使用します。標準入力からニーモニックを読み取り、旧鍵と新鍵の両方でデュアル署名し、旧鍵でエンベロープに共同署名してブロードキャストします。標準出力にはトランザクション JSON のみを出力するため（情報行は標準エラー出力へ出力されます）、`-o json` と組み合わせて使用できます。

```bash
qorechaind tx pqc rotate-key [flags]
```

| フラグ             | 型     | 説明                                             |
| ------------------ | ------ | ------------------------------------------------ |
| `--old-derivation` | string | 現在登録されている鍵の導出（`adapter` \| `bridge`） |
| `--new-derivation` | string | 新しい鍵の導出（`adapter` \| `bridge`）          |
| `--new-random`     | bool   | 代わりに新しいランダム鍵を生成する               |

---

## xqore

### lock

QOR トークンを xQORE ガバナンスステーキングポジションにロックします。

```bash
qorechaind tx xqore lock <amount> [flags]
```

| フラグ            | 型     | 説明                                   |
| ----------------- | ------ | -------------------------------------- |
| `--lock-duration` | string | ロック期間（例: `30d`、`90d`、`180d`） |

### unlock

xQORE を QOR に戻してアンロックします。早期アンロックは、ペナルティ階層に応じてペナルティが発生する場合があります。

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

外部チェーンからのブリッジデポジットを開始します。

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| フラグ        | 型     | 説明                         |
| ------------- | ------ | ---------------------------- |
| `--recipient` | string | QoreChain 上の受取人アドレス |

### withdraw

外部チェーンへのブリッジ出金を開始します。

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

チェーンのブリッジを単一の署名済みトランザクションで有効化または再構成します（チェーンバージョン **v3.1.80** から利用可能）。`bridge_admin` 鍵または `qcb_bridge` ライセンスが必要で、ガバナンス提案やチェーンアップグレードは不要です。コントラクトアドレス、確認数、アーキテクチャ、ステータスを設定します。

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

チェーンのアクティブなベリファイアを選択し、そのトラストルートをインストールします（こちらも `bridge_admin` によって制限されます）。

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

実行環境（EVM、CosmWasm、SVM）間でクロス VM メッセージを送信します。

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| フラグ        | 型     | 説明                                |
| ------------- | ------ | ----------------------------------- |
| `--source-vm` | string | ソース VM: `evm`、`cosmwasm`、`svm` |
| `--gas-limit` | uint   | クロス VM 実行のガス上限            |

### process-queue

保留中のクロス VM メッセージを手動で処理します（オペレーター用コマンド）。

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

BPF プログラムを SVM ランタイムにデプロイします。

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| フラグ         | 型     | 説明                          |
| -------------- | ------ | ----------------------------- |
| `--program-id` | string | 任意のプログラム ID（base58） |

### execute

デプロイ済みの SVM プログラム上で命令を実行します。

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| フラグ       | 型     | 説明                                           |
| ------------ | ------ | ---------------------------------------------- |
| `--accounts` | string | 命令に使用するアカウント公開鍵（カンマ区切り） |

### create-account

割り当て済みのデータスペースを持つ新しい SVM アカウントを作成します。

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| フラグ    | 型     | 説明                                                         |
| --------- | ------ | ------------------------------------------------------------ |
| `--owner` | string | オーナープログラム（base58、デフォルト: システムプログラム） |

---

## multilayer

### register-sidechain

新しいサイドチェーンレイヤーを登録します。

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| フラグ                  | 型     | 説明                                                        |
| ----------------------- | ------ | ----------------------------------------------------------- |
| `--block-time-ms`       | uint   | 目標ブロック時間（ミリ秒、デフォルト 2000）                 |
| `--domains`             | string | サポートするドメイン（カンマ区切り、デフォルト `defi`）     |
| `--max-tx`              | uint   | 1 ブロックあたりの最大トランザクション数（デフォルト 1000） |
| `--min-validators`      | uint32 | バリデータセットの最小サイズ（デフォルト 1）                |
| `--settlement-interval` | uint   | 決済間隔（ブロック数、デフォルト 100）                      |
| `--vm-types`            | string | サポートする VM タイプ（カンマ区切り、デフォルト `evm`）    |

### register-paychain

高頻度マイクロトランザクション用の新しいペイチェーンレイヤーを登録します。

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| フラグ                  | 型   | 説明                                                        |
| ----------------------- | ---- | ----------------------------------------------------------- |
| `--max-tx`              | uint | 1 ブロックあたりの最大トランザクション数（デフォルト 5000） |
| `--settlement-interval` | uint | 決済間隔（ブロック数、デフォルト 50）                       |

### anchor-state

登録済みレイヤーのステートアンカー（決済）を提出します。

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

トランザクションを最適なレイヤーへルーティングします。

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| フラグ           | 型     | 説明                                     |
| ---------------- | ------ | ---------------------------------------- |
| `--target-layer` | string | 特定のレイヤーへのルーティングを強制する |

### update-layer-status

レイヤーの運用ステータスを更新します（オペレーターのみ）。

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

ステータス値: `active`、`paused`、`draining`。

### challenge-anchor

ステートアンカーに対する不正チャレンジを提出します。

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Development Kit に新しいロールアップを登録します。

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| フラグ              | 型     | 説明                                                        |
| ------------------- | ------ | ----------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`、`zk`、`pessimistic`、`sovereign`              |
| `--profile`         | string | プリセット: `defi`、`gaming`、`nft`、`enterprise`、`custom` |
| `--stake`           | string | オペレーターのステーク額                                    |
| `--da-enabled`      | bool   | ネイティブデータ可用性を有効にする                          |

### submit-batch

ロールアップの決済バッチを提出します。

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

決済バッチに対する不正チャレンジを提出します（オプティミスティックロールアップ）。

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

チャレンジ期間を経過したバッチを手動でファイナライズします。

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

ロールアップを一時停止します（オペレーターのみ）。

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

一時停止中のロールアップを再開します（オペレーターのみ）。

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

ロールアップを恒久的に停止し、そのステークを解放します（オペレーターのみ）。

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
ロールアップの出金およびクロスレイヤー決済も `rdk` トランザクショングループの下で提供されます（たとえば、ファイナライズ済みバッチに対して証明された出金を決済する `execute-withdrawal` コマンドなど）。正確な引数とフラグは、ロールアップの決済タイプと DA 構成によって異なります。これらのトランザクションを構築する前に、正式なコマンド仕様については **Rollup Development Kit** のドキュメントを参照してください。
:::

---

## babylon

### submit-btc-checkpoint

エポックの BTC チェックポイントを提出します。

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon 統合を介して BTC をリステークします。

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| フラグ          | 型     | 説明                                          |
| --------------- | ------ | --------------------------------------------- |
| `--btc-tx-hash` | string | 証明としての Bitcoin トランザクションハッシュ |

---

## abstractaccount

### create

プログラム可能な支出ルールを持つ抽象アカウントを作成します。

```bash
qorechaind tx abstractaccount create [flags]
```

| フラグ             | 型     | 説明                               |
| ------------------ | ------ | ---------------------------------- |
| `--spending-rules` | string | 支出ルールを定義する JSON ファイル |

### update-spending-rules

既存の抽象アカウントの支出ルールを更新します。

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

正規アカウントからの、オーセンティケーターにより認可された Native レーンの bank send をリレーします（チェーンバージョン **v3.1.85** から利用可能）。リレイヤー（`--from`）がエンベロープに署名して手数料を支払い、リプレイ防止が組み込まれた署名バイト列に対するリンク済み鍵の署名が認可となります。[Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) を参照してください。

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

正規アカウントの EVM アドレスからの、オーセンティケーターにより認可された EVM 呼び出しまたは送金をリレーします（チェーンバージョン **v3.1.85** から利用可能）。nonce はアカウントの**現在の** EVM nonce です。

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM は、コンセンサスパラメーターをチューニングする強化学習レイヤーです。これらのコマンドは PRISM エージェントを制御します。CLI モジュール名 `rlconsensus` とそのサブコマンドは、そのままの名称で維持されています。

### set-agent-mode

PRISM エージェントの動作モードを設定します（ガバナンスのみ）。

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

モード値: `0`（オフ）、`1`（観測）、`2`（提案）、`3`（自動）。

### resume-agent

サーキットブレーカー作動後に PRISM エージェントを再開します。

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISM エージェントのポリシー構成を更新します（ガバナンスのみ）。

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM エージェントの報酬重み構成を更新します。

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| フラグ                | 型     | 説明                   |
| --------------------- | ------ | ---------------------- |
| `--throughput-weight` | string | スループット報酬の重み |
| `--latency-weight`    | string | レイテンシ報酬の重み   |
| `--security-weight`   | string | セキュリティ報酬の重み |
