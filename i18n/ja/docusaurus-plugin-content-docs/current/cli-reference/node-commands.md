---
slug: /cli-reference/node-commands
title: ノードコマンド
sidebar_label: ノードコマンド
sidebar_position: 1
---

# ノードコマンド

QoreChainノードの初期化・設定・運用に使用する `qorechaind` コマンドのリファレンスです。

:::note
QoreChainは2つのネットワークを運用しています。**`qorechain-vladi`** メインネット(チェーンバージョン **v3.1.95** で2026年6月7日から稼働中)と、**`qorechain-diana`** テストネットです。参加するネットワークに応じて適切な `--chain-id` を指定してください — 以下の例はテストネットを対象としています。メインネットの場合は `--chain-id qorechain-vladi` を使用してください。
:::

---

## init

指定したモニカーで新しいノードを初期化します。

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| フラグ        | 型     | 説明                                            |
| ------------- | ------ | ----------------------------------------------- |
| `--chain-id`  | string | チェーン識別子(必須)                          |
| `--home`      | string | ノードのホームディレクトリ(デフォルト: `~/.qorechaind`) |
| `--overwrite` | bool   | 既存のgenesisおよび設定ファイルを上書きします  |

`--home` の下に `config/`、`data/`、および初期の `genesis.json` を含むディレクトリ構造を作成します。

---

## start

ノードを起動し、同期またはブロック生成を開始します。

```bash
qorechaind start [flags]
```

| フラグ                 | 型     | 説明                                                  |
| ---------------------- | ------ | ----------------------------------------------------- |
| `--home`               | string | ノードのホームディレクトリ                            |
| `--minimum-gas-prices` | string | 受け入れる最小ガス価格(例: `0.001uqor`)              |
| `--pruning`            | string | プルーニング戦略: `default`、`nothing`、`everything` |
| `--halt-height`        | uint   | このブロック高でノードを停止します                   |
| `--halt-time`          | uint   | このUnixタイムスタンプでノードを停止します            |
| `--log_level`          | string | ログの詳細度: `info`、`debug`、`warn`、`error`       |
| `--trace`              | bool   | エラー時に完全なスタックトレースを有効にします        |

---

## version

`qorechaind` バイナリのバージョンとビルド情報を表示します。

```bash
qorechaind version
```

Goのバージョン、コミットハッシュ、ビルドタグを含む詳細なビルド情報を表示するには `--long` を使用します。

```bash
qorechaind version --long
```

---

## status

実行中のノードに対して、同期状態、最新のブロック高、コンセンサス情報を含む現在のステータスを照会します。

```bash
qorechaind status
```

| フラグ   | 型     | 説明                                             |
| -------- | ------ | ------------------------------------------------ |
| `--node` | string | RPCエンドポイント(デフォルト: `tcp://localhost:26657`) |

`node_info`、`sync_info`、`validator_info` セクションを含むJSONを返します。

---

## config

ノード設定の値を読み書きします。

### 設定値の設定

```bash
qorechaind config set <key> <value>
```

### 設定値の取得

```bash
qorechaind config get <key>
```

一般的な設定キーには `chain-id`、`keyring-backend`、`output`、`node` があります。

---

## keys

トランザクション署名用のローカルキーリングを管理します。

### 新しいキーの追加

```bash
qorechaind keys add <name> [flags]
```

| フラグ                  | 型     | 説明                                     |
| ----------------------- | ------ | ---------------------------------------- |
| `--keyring-backend`     | string | バックエンド: `os`、`file`、`test`       |
| `--algo`                | string | キーアルゴリズム: `secp256k1`(デフォルト)、`ed25519` |
| `--recover`             | bool   | ニーモニックからキーを復元します         |
| `--multisig`            | string | マルチシグ用のキーのカンマ区切りリスト   |
| `--multisig-threshold`  | uint   | 必要な最小署名数                         |

### すべてのキーの一覧表示

```bash
qorechaind keys list --keyring-backend <backend>
```

### キー詳細の表示

```bash
qorechaind keys show <name> [flags]
```

| フラグ      | 型     | 説明                                 |
| ----------- | ------ | ------------------------------------ |
| `--bech`    | string | 出力形式: `acc`、`val`、`cons`      |
| `--address` | bool   | アドレスのみを表示します             |
| `--pubkey`  | bool   | 公開鍵のみを表示します               |

### キーの削除

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### キーのエクスポート(アーマー暗号化)

```bash
qorechaind keys export <name>
```

### キーのインポート

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

genesisファイルを管理します。

### genesisアカウントの追加

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| フラグ                | 型     | 説明                             |
| --------------------- | ------ | -------------------------------- |
| `--vesting-amount`    | string | ベスティング額                   |
| `--vesting-end-time`  | int    | ベスティング終了時刻(Unixタイムスタンプ) |

### genesisトランザクションの作成

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| フラグ                    | 型     | 説明                     |
| ------------------------- | ------ | ------------------------ |
| `--chain-id`               | string | チェーン識別子           |
| `--moniker`                 | string | バリデーターのモニカー   |
| `--commission-rate`         | string | 初期コミッション率       |
| `--commission-max-rate`     | string | 最大コミッション率       |

### genesisトランザクションの収集

```bash
qorechaind genesis collect-gentxs
```

### genesisファイルの検証

```bash
qorechaind genesis validate-genesis
```

---

## コンセンサスエンジン

これらのサブコマンドは、QoreChainコンセンサスエンジン層と対話します。

### バリデーターキーの表示

```bash
qorechaind comet show-validator
```

コンセンサス公開鍵をJSON形式で出力します。バリデーターの識別情報の検証に使用します。

### ノードIDの表示

```bash
qorechaind comet show-node-id
```

P2Pノード識別子(16進エンコード)を出力します。永続ピア設定に使用します。

---

## export

現在のチェーン状態をJSON形式のgenesisファイルとしてエクスポートします。チェーンのアップグレードやスナップショットに便利です。

```bash
qorechaind export [flags]
```

| フラグ                | 型     | 説明                                       |
| --------------------- | ------ | ------------------------------------------ |
| `--for-zero-height`   | bool   | 高さ0での再起動用にエクスポートを準備します |
| `--height`            | int    | 特定のブロック高で状態をエクスポートします |
| `--home`              | string | ノードのホームディレクトリ                 |

---

## rollback

チェーン状態を1ブロック分ロールバックします。コンセンサス障害からの復旧に便利です。

```bash
qorechaind rollback [flags]
```

| フラグ   | 型     | 説明                                       |
| -------- | ------ | ------------------------------------------ |
| `--hard` | bool   | ブロックストアからも最後のブロックを削除します |
| `--home` | string | ノードのホームディレクトリ                 |

このコマンドはアプリケーション状態とコンセンサス状態の両方をロールバックします。元に戻すことはできないため、注意して使用してください。
