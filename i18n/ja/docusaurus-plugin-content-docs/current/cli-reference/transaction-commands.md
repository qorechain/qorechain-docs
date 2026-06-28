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
ライブメインネット（チェーンバージョン **v3.1.80**）に対してブロードキャストするには `--chain-id qorechain-vladi` を設定し、テストネットの場合は `--chain-id qorechain-diana` を設定します。省略した場合、クライアントはローカル設定の `chain-id` を使用します。
:::

共通フラグはすべての `tx` サブコマンドに適用されます。

| Flag                | Type   | Description                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | 署名鍵の名前またはアドレス              |
| `--chain-id`        | string | チェーン識別子（デフォルト: 設定から）         |
| `--fees`            | string | トランザクション手数料（例: `500uqor`）              |
| `--gas`             | string | ガスリミット、または推定の場合は `auto`              |
| `--gas-adjustment`  | float  | `auto` 使用時のガス乗数（デフォルト: 1.0） |
| `--keyring-backend` | string | キーリングバックエンド: `os`、`file`、`test`           |
| `--node`            | string | RPC エンドポイント（デフォルト: `tcp://localhost:26657`） |
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

| Flag                           | Type   | Description                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | 自己委任額（例: `1000000uqor`） |
| `--pubkey`                     | string | バリデータコンセンサス公開鍵（JSON）        |
| `--moniker`                    | string | バリデータ表示名                       |
| `--commission-rate`            | string | 初期手数料率（例: `0.10`）       |
| `--commission-max-rate`        | string | 最大手数料率                      |
| `--commission-max-change-rate` | string | 1日あたりの最大手数料変更率         |
| `--min-self-delegation`        | string | 必要な最小自己委任額             |

### edit-validator

既存のバリデータの説明または手数料を編集します。

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

バリデータからトークンをアンボンドします。

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

特定のバリデータから報酬を引き出します。

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Type | Description                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | バリデータ手数料も引き出す |

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

cosmos トランザクションパスでは、デフォルトでハイブリッド署名が必要です（`hybrid_signature_mode = required`）。`gen-key` および `cosign` コマンドは、古典的な secp256k1 署名とともに cosmos パスでトランザクションを行うために必要な Dilithium-5（ML-DSA-87）鍵と `PQCHybridSignature` 拡張を生成します。

### gen-key

ハイブリッド署名用の Dilithium-5（ML-DSA-87）ポスト量子鍵を生成します。

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

トランザクションに Dilithium-5 のコ署名を `PQCHybridSignature` 拡張として付加し、ハイブリッド（secp256k1 + ML-DSA-87）トランザクションを生成します。デフォルトの `required` 強制モードでは、cosmos パストランザクションに必須です。標準的な CosmJS / リレーヤーツールはトランザクションを行うためにこの拡張を生成する必要があります。QoreChain SDK の `buildHybridTx`（`includePqcPublicKey` 付き）は同等の処理を行います。

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

アカウントのポスト量子公開鍵を登録します。

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

拡張メタデータとアテステーションを伴う PQC 鍵を登録します。

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Type   | Description                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEE アテステーションデータ（hex）     |
| `--metadata`    | string | 追加の鍵メタデータ（JSON） |

### migrate-key

既存の古典的な鍵をハイブリッド PQC 鍵ペアに移行します。

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

| Flag              | Type   | Description                                |
| ----------------- | ------ | ------------------------------------------ |
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

| Flag          | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | QoreChain 上の受取人アドレス |

### withdraw

外部チェーンへのブリッジ引き出しを開始します。

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

単一の署名済みトランザクションでチェーンのブリッジをアクティブ化または再設定します（チェーンバージョン **v3.1.80** 以降で利用可能）。`bridge_admin` 鍵または `qcb_bridge` ライセンスが必要です。ガバナンス提案やチェーンアップグレードは不要です。コントラクトアドレス、確認回数、アーキテクチャ、およびステータスを設定します。

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

チェーンのアクティブな検証者を選択し、そのトラストルートをインストールします（こちらも `bridge_admin` でゲートされています）。

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

実行環境間（EVM、CosmWasm、SVM）でクロス VM メッセージを送信します。

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | ソース VM: `evm`、`cosmwasm`、`svm`  |
| `--gas-limit` | uint   | クロス VM 実行のガスリミット |

### process-queue

保留中のクロス VM メッセージを手動で処理します（オペレータコマンド）。

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

| Flag           | Type   | Description                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | 任意のプログラム ID（base58） |

### execute

デプロイされた SVM プログラムで命令を実行します。

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Type   | Description                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | 命令のアカウント公開鍵（カンマ区切り） |

### create-account

割り当てられたデータ領域を持つ新しい SVM アカウントを作成します。

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Type   | Description                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | オーナープログラム（base58、デフォルト: システムプログラム） |

---

## multilayer

### register-sidechain

新しいサイドチェーンレイヤーを登録します。

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Type   | Description                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | 目標ブロック時間（ms）（デフォルト 2000）              |
| `--domains`             | string | サポートするドメイン（カンマ区切り）（デフォルト `defi`）  |
| `--max-tx`              | uint   | ブロックあたりの最大トランザクション数（デフォルト 1000）           |
| `--min-validators`      | uint32 | 最小バリデータセットサイズ（デフォルト 1）              |
| `--settlement-interval` | uint   | セトルメント間隔（ブロック数）（デフォルト 100）         |
| `--vm-types`            | string | サポートする VM タイプ（カンマ区切り）（デフォルト `evm`）  |

### register-paychain

高頻度のマイクロトランザクション用に新しい paychain レイヤーを登録します。

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Type | Description                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | ブロックあたりの最大トランザクション数（デフォルト 5000）    |
| `--settlement-interval` | uint | セトルメント間隔（ブロック数）（デフォルト 50）   |

### anchor-state

登録済みレイヤーのステートアンカー（セトルメント）を送信します。

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

トランザクションを最適なレイヤーにルーティングします。

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Type   | Description                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | 特定のレイヤーへのルーティングを強制 |

### update-layer-status

レイヤーの稼働ステータスを更新します（オペレータのみ）。

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

ステータス値: `active`、`paused`、`draining`。

### challenge-anchor

ステートアンカーに対する不正チャレンジを送信します。

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Development Kit で新しいロールアップを登録します。

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Type   | Description                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`、`zk`、`pessimistic`、`sovereign`       |
| `--profile`         | string | プリセット: `defi`、`gaming`、`nft`、`enterprise`、`custom` |
| `--stake`           | string | オペレータステーク額                                |
| `--da-enabled`      | bool   | ネイティブデータ可用性を有効化                      |

### submit-batch

ロールアップのセトルメントバッチを送信します。

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

セトルメントバッチに対する不正チャレンジを送信します（optimistic ロールアップ）。

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

チャレンジウィンドウを通過したバッチを手動でファイナライズします。

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

ロールアップを一時停止します（オペレータのみ）。

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

一時停止したロールアップを再開します（オペレータのみ）。

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

ロールアップを恒久的に停止し、そのステークを解放します（オペレータのみ）。

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
ロールアップの引き出しおよびクロスレイヤーセトルメントも `rdk` トランザクショングループの下で公開されています（例: ファイナライズされたバッチに対して証明された引き出しをセトルする `execute-withdrawal` コマンド）。正確な引数とフラグは、ロールアップのセトルメントタイプと DA 設定に依存します。これらのトランザクションを構築する前に、信頼できるコマンド一覧について **Rollup Development Kit** のドキュメントを参照してください。
:::

---

## babylon

### submit-btc-checkpoint

エポックの BTC チェックポイントを送信します。

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon 統合を介して BTC をリステークします。

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Type   | Description                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | 証明としての Bitcoin トランザクションハッシュ |

---

## abstractaccount

### create

プログラム可能な支出ルールを持つ抽象アカウントを作成します。

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Type   | Description                       |
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

PRISM エージェントの稼働モードを設定します（ガバナンスのみ）。

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

PRISM エージェントのポリシー設定を更新します（ガバナンスのみ）。

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM エージェントの報酬重み設定を更新します。

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Type   | Description                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | スループット報酬の重み |
| `--latency-weight`    | string | レイテンシ報酬の重み    |
| `--security-weight`   | string | セキュリティ報酬の重み   |
