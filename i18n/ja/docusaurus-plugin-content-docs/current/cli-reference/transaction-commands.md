---
slug: /cli-reference/transaction-commands
title: トランザクションコマンド
sidebar_label: トランザクションコマンド
sidebar_position: 2
---

# トランザクションコマンド

すべてのトランザクションコマンドは次のパターンに従います:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
ライブメインネット (チェーンバージョン **v3.1.77**) に対してブロードキャストするには `--chain-id qorechain-vladi` を設定し、テストネットには `--chain-id qorechain-diana` を設定してください。省略した場合、クライアントはローカル構成の `chain-id` を使用します。
:::

共通フラグはすべての `tx` サブコマンドに適用されます:

| フラグ              | 型     | 説明                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | 署名キーの名前またはアドレス              |
| `--chain-id`        | string | チェーン識別子 (デフォルト: 構成から)         |
| `--fees`            | string | トランザクション手数料 (例: `500uqor`)              |
| `--gas`             | string | ガス制限または見積もり用の `auto`                |
| `--gas-adjustment`  | float  | `auto` 使用時のガス乗数 (デフォルト: 1.0) |
| `--keyring-backend` | string | キーリングバックエンド: `os`、`file`、`test`           |
| `--node`            | string | RPC エンドポイント (デフォルト: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`、`async`、または `block`                     |
| `-y`                | bool   | 確認プロンプトをスキップする                        |

---

## bank

### send

あるアカウントから別のアカウントへトークンを転送します。

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

ネットワーク上に新しいバリデーターを作成します。

```bash
qorechaind tx staking create-validator [flags]
```

| フラグ                         | 型     | 説明                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | 自己デリゲーション量 (例: `1000000uqor`) |
| `--pubkey`                     | string | バリデーターコンセンサス公開鍵 (JSON)        |
| `--moniker`                    | string | バリデーターの表示名                       |
| `--commission-rate`            | string | 初期コミッションレート (例: `0.10`)       |
| `--commission-max-rate`        | string | 最大コミッションレート                      |
| `--commission-max-change-rate` | string | 1 日あたりの最大コミッション変更レート         |
| `--min-self-delegation`        | string | 必要な最小自己デリゲーション             |

### edit-validator

既存のバリデーターの説明またはコミッションを編集します。

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

バリデーターにトークンをデリゲートします。

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

あるバリデーターから別のバリデーターへデリゲーションを移動します。

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

バリデーターからトークンをアンボンドします。

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

保留中のすべてのステーキング報酬を引き出します。

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

特定のバリデーターから報酬を引き出します。

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| フラグ         | 型   | 説明                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | バリデーターコミッションも引き出す |

---

## gov

### submit-proposal

ガバナンス提案を提出します。

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

提案ファイルは、提案タイプ、タイトル、説明、および実行するメッセージを指定する JSON ドキュメントです。

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

cosmos トランザクションパスはデフォルトでハイブリッド署名を必要とします (`hybrid_signature_mode = required`)。`gen-key` および `cosign` コマンドは、古典的な secp256k1 署名とともに cosmos パスでトランザクションを行うために必要な Dilithium-5 (ML-DSA-87) キーと `PQCHybridSignature` 拡張を生成します。

### gen-key

ハイブリッド署名用の Dilithium-5 (ML-DSA-87) 耐量子キーを生成します。

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

`PQCHybridSignature` 拡張としてトランザクションに Dilithium-5 の共署名を付加し、ハイブリッド (secp256k1 + ML-DSA-87) トランザクションを生成します。デフォルトの `required` 強制モードの下では、cosmos パスのトランザクションに必要です。標準的な CosmJS / リレーヤーのツールはトランザクションを行うためにこの拡張を生成しなければなりません。QoreChain SDK の `buildHybridTx` (`includePqcPublicKey` 付き) が同等の処理を行います。

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

アカウントの耐量子公開鍵を登録します。

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

拡張メタデータとアテステーションを伴う PQC キーを登録します。

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| フラグ          | 型     | 説明                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEE アテステーションデータ (16 進)     |
| `--metadata`    | string | 追加のキーメタデータ (JSON) |

### migrate-key

既存の古典的なキーをハイブリッド PQC キーペアに移行します。

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

QOR トークンを xQORE ガバナンスステーキングポジションにロックします。

```bash
qorechaind tx xqore lock <amount> [flags]
```

| フラグ            | 型     | 説明                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | ロック期間 (例: `30d`、`90d`、`180d`) |

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

| フラグ        | 型     | 説明                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | QoreChain 上の受取アドレス |

### withdraw

外部チェーンへのブリッジ引き出しを開始します。

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

---

## crossvm

### call

実行環境 (EVM、CosmWasm、SVM) 間でクロス VM メッセージを送信します。

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| フラグ        | 型     | 説明                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | ソース VM: `evm`、`cosmwasm`、`svm`  |
| `--gas-limit` | uint   | クロス VM 実行のガス制限 |

### process-queue

保留中のクロス VM メッセージを手動で処理します (オペレーターコマンド)。

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

SVM ランタイムに BPF プログラムをデプロイします。

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| フラグ         | 型     | 説明                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | オプションのプログラム ID (base58) |

### execute

デプロイされた SVM プログラム上で命令を実行します。

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| フラグ       | 型     | 説明                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | 命令用のアカウント公開鍵のカンマ区切りリスト |

### create-account

割り当てられたデータ領域を持つ新しい SVM アカウントを作成します。

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| フラグ    | 型     | 説明                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | オーナープログラム (base58、デフォルト: system program) |

---

## multilayer

### register-sidechain

新しいサイドチェーンレイヤーを登録します。

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| フラグ                  | 型     | 説明                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | ターゲットブロック時間 (ミリ秒、デフォルト 2000)              |
| `--domains`             | string | サポートされるドメインのカンマ区切り (デフォルト `defi`)  |
| `--max-tx`              | uint   | ブロックあたりの最大トランザクション数 (デフォルト 1000)           |
| `--min-validators`      | uint32 | 最小バリデーターセットサイズ (デフォルト 1)              |
| `--settlement-interval` | uint   | ブロック単位の決済間隔 (デフォルト 100)         |
| `--vm-types`            | string | サポートされる VM タイプのカンマ区切り (デフォルト `evm`)  |

### register-paychain

高頻度マイクロトランザクション用の新しい paychain レイヤーを登録します。

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| フラグ                  | 型   | 説明                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | ブロックあたりの最大トランザクション数 (デフォルト 5000)    |
| `--settlement-interval` | uint | ブロック単位の決済間隔 (デフォルト 50)   |

### anchor-state

登録されたレイヤーの状態アンカー (決済) を提出します。

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

トランザクションを最適なレイヤーにルーティングします。

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| フラグ           | 型     | 説明                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | 特定のレイヤーへのルーティングを強制する |

### update-layer-status

レイヤーの運用ステータスを更新します (オペレーターのみ)。

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

ロールアップ開発キットで新しいロールアップを登録します。

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| フラグ              | 型     | 説明                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`、`zk`、`pessimistic`、`sovereign`       |
| `--profile`         | string | プリセット: `defi`、`gaming`、`nft`、`enterprise`、`custom` |
| `--stake`           | string | オペレーターステーク量                                |
| `--da-enabled`      | bool   | ネイティブデータ可用性を有効にする                      |

### submit-batch

ロールアップの決済バッチを提出します。

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

決済バッチに対する不正チャレンジを提出します (optimistic ロールアップ)。

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

チャレンジウィンドウを通過したバッチを手動でファイナライズします。

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

ロールアップを一時停止します (オペレーターのみ)。

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

一時停止したロールアップを再開します (オペレーターのみ)。

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

ロールアップを恒久的に停止し、そのステークを解放します (オペレーターのみ)。

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
ロールアップの引き出しとクロスレイヤー決済も `rdk` トランザクショングループの下で公開されています (例えば、ファイナライズされたバッチに対して証明された引き出しを決済する `execute-withdrawal` コマンドなど)。正確な引数とフラグは、ロールアップの決済タイプと DA 構成によって異なります。これらのトランザクションを構築する前に、権威あるコマンドの全体像については **ロールアップ開発キット**のドキュメントを参照してください。
:::

---

## babylon

### submit-btc-checkpoint

エポックの BTC チェックポイントを提出します。

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon 統合を通じて BTC をリステークします。

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| フラグ          | 型     | 説明                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | 証明としての Bitcoin トランザクションハッシュ |

---

## abstractaccount

### create

プログラム可能な支出ルールを持つ抽象アカウントを作成します。

```bash
qorechaind tx abstractaccount create [flags]
```

| フラグ             | 型     | 説明                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | 支出ルールを定義する JSON ファイル |

### update-spending-rules

既存の抽象アカウントの支出ルールを更新します。

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM はコンセンサスパラメータを調整する強化学習レイヤーです。これらのコマンドは PRISM エージェントを制御します。CLI モジュール名 `rlconsensus` とそのサブコマンドはそのまま保持されます。

### set-agent-mode

PRISM エージェントの運用モードを設定します (ガバナンスのみ)。

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

モード値: `0` (オフ)、`1` (観測)、`2` (提案)、`3` (自動)。

### resume-agent

サーキットブレーカーのトリップ後に PRISM エージェントを再開します。

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISM エージェントのポリシー構成を更新します (ガバナンスのみ)。

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM エージェントの報酬ウェイト構成を更新します。

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| フラグ                | 型     | 説明                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | スループット報酬のウェイト |
| `--latency-weight`    | string | レイテンシ報酬のウェイト    |
| `--security-weight`   | string | セキュリティ報酬のウェイト   |
