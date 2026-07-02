---
slug: /cli-reference/node-commands
title: ノードコマンド
sidebar_label: ノードコマンド
sidebar_position: 1
---

# ノードコマンド

QoreChain ノードの初期化、構成、運用に使用される `qorechaind` コマンドのリファレンス。

:::note
QoreChain は 2 つのネットワークを運用しています: **`qorechain-vladi`** メインネット (チェーンバージョン **v3.1.82** で 2026 年 6 月 7 日以降稼働) と **`qorechain-diana`** テストネットです。参加するネットワークに合わせて適切な `--chain-id` を渡してください — 以下の例はテストネットを対象としています。メインネットには `--chain-id qorechain-vladi` を使用してください。
:::

---

## init

指定したモニカーで新しいノードを初期化します。

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| フラグ        | 型     | 説明                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | チェーン識別子 (必須)                    |
| `--home`      | string | ノードのホームディレクトリ (デフォルト: `~/.qorechaind`) |
| `--overwrite` | bool   | 既存のジェネシスおよび設定ファイルを上書きする    |

`config/`、`data/`、および初期 `genesis.json` を含むディレクトリ構造を `--home` の下に作成します。

---

## start

ノードを起動し、同期またはブロック生成を開始します。

```bash
qorechaind start [flags]
```

| フラグ                 | 型     | 説明                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | ノードのホームディレクトリ                                  |
| `--minimum-gas-prices` | string | 受け入れる最小ガス価格 (例: `0.001uqor`)     |
| `--pruning`            | string | プルーニング戦略: `default`、`nothing`、`everything` |
| `--halt-height`        | uint   | このブロックの高さでノードを停止する                   |
| `--halt-time`          | uint   | この Unix タイムスタンプでノードを停止する                 |
| `--log_level`          | string | ログの詳細度: `info`、`debug`、`warn`、`error`      |
| `--trace`              | bool   | エラー時に完全なスタックトレースを有効にする                    |

---

## version

`qorechaind` バイナリのバージョンとビルド情報を出力します。

```bash
qorechaind version
```

Go バージョン、コミットハッシュ、ビルドタグを含む拡張ビルド詳細には `--long` を使用します:

```bash
qorechaind version --long
```

---

## status

実行中のノードに対して、同期状態、最新のブロックの高さ、コンセンサス情報を含む現在のステータスをクエリします。

```bash
qorechaind status
```

| フラグ   | 型     | 説明                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | RPC エンドポイント (デフォルト: `tcp://localhost:26657`) |

`node_info`、`sync_info`、`validator_info` セクションを含む JSON を返します。

---

## config

ノード構成内の値を読み取りまたは書き込みます。

### 構成値を設定する

```bash
qorechaind config set <key> <value>
```

### 構成値を取得する

```bash
qorechaind config get <key>
```

一般的な構成キーには `chain-id`、`keyring-backend`、`output`、`node` が含まれます。

---

## keys

トランザクション署名用のローカルキーリングを管理します。

### 新しいキーを追加する

```bash
qorechaind keys add <name> [flags]
```

| フラグ                 | 型     | 説明                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | バックエンド: `os`、`file`、`test`                   |
| `--algo`               | string | キーアルゴリズム: `secp256k1` (デフォルト)、`ed25519` |
| `--recover`            | bool   | ニーモニックからキーを復元する                       |
| `--multisig`           | string | マルチシグ用のキーのカンマ区切りリスト       |
| `--multisig-threshold` | uint   | 必要な最小署名数                     |

### すべてのキーを一覧表示する

```bash
qorechaind keys list --keyring-backend <backend>
```

### キーの詳細を表示する

```bash
qorechaind keys show <name> [flags]
```

| フラグ      | 型     | 説明                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | 出力形式: `acc`、`val`、`cons` |
| `--address` | bool   | アドレスのみを表示する                   |
| `--pubkey`  | bool   | 公開鍵のみを表示する                |

### キーを削除する

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### キーをエクスポートする (アーマー暗号化)

```bash
qorechaind keys export <name>
```

### キーをインポートする

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

ジェネシスファイルを管理します。

### ジェネシスアカウントを追加する

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| フラグ               | 型     | 説明                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | ベスティング量                    |
| `--vesting-end-time` | int    | ベスティング終了時刻 (Unix タイムスタンプ) |

### ジェネシストランザクションを作成する

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| フラグ                  | 型     | 説明             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | チェーン識別子        |
| `--moniker`             | string | バリデーターのモニカー       |
| `--commission-rate`     | string | 初期コミッションレート |
| `--commission-max-rate` | string | 最大コミッションレート |

### ジェネシストランザクションを収集する

```bash
qorechaind genesis collect-gentxs
```

### ジェネシスファイルを検証する

```bash
qorechaind genesis validate-genesis
```

---

## コンセンサスエンジン

これらのサブコマンドは、QoreChain コンセンサスエンジンレイヤーと対話します。

### バリデーターキーを表示する

```bash
qorechaind comet show-validator
```

コンセンサス公開鍵を JSON 形式で出力します。バリデーターの身元を検証するために使用されます。

### ノード ID を表示する

```bash
qorechaind comet show-node-id
```

P2P ノード識別子 (16 進エンコード) を出力します。永続的なピア構成に使用されます。

---

## export

現在のチェーン状態を JSON ジェネシスファイルとしてエクスポートします。チェーンのアップグレードやスナップショットに役立ちます。

```bash
qorechaind export [flags]
```

| フラグ              | 型     | 説明                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | 高さ 0 での再起動用にエクスポートを準備する |
| `--height`          | int    | 特定のブロックの高さで状態をエクスポートする   |
| `--home`            | string | ノードのホームディレクトリ                       |

---

## rollback

チェーン状態を 1 ブロック分ロールバックします。コンセンサス障害からの復旧に役立ちます。

```bash
qorechaind rollback [flags]
```

| フラグ   | 型     | 説明                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | ブロックストアからも最後のブロックを削除する |
| `--home` | string | ノードのホームディレクトリ                                |

このコマンドは、アプリケーション状態とコンセンサス状態の両方をロールバックします。元に戻せないため、注意して使用してください。
