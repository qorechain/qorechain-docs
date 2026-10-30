---
slug: /cli-reference/node-commands
title: ノードコマンド
sidebar_label: ノードコマンド
sidebar_position: 1
---

# ノードコマンド

QoreChainノードの初期化・設定・運用に使用する `qorechaind` コマンドのリファレンスです。

:::note
QoreChainは2つのネットワークを運用しています。**`qorechain-vladi`** メインネット(2026年6月7日から稼働中、ノードリリース **v3.2.5**、2026年10月29日にガバナンス提案 14 によりブロック高 3,906,833 で適用。v3.2.4 は2026年10月23日にブロック高 3,742,566 で、v3.2.3 は2026年10月20日にブロック高 3,662,051 で適用)と、**`qorechain-diana`** テストネット(ノードリリース **v3.2.6**、2026年10月27日にブロック高 8,970,638 で適用。その前に v3.2.5 が10月26日にブロック高 8,890,800 で、v3.2.4 が10月19日にブロック高 8,337,253 で適用)です。参加するネットワークに応じて適切な `--chain-id` を指定してください — 以下の例はテストネットを対象としています。メインネットの場合は `--chain-id qorechain-vladi` を使用してください。各ネットワークの現在のリリースは、[download.qore.host](https://download.qore.host) の `latest.json` に記載されています。

このページのコマンドは、v3.2.3 のリリースバイナリで確認しています。v3.2.4 バイナリには、v3.2.3 バイナリにはないコマンド(例: `stakingtier`)が追加されています。これらは両ネットワークで動作します(テストネットでは2026年10月19日から、メインネットでは2026年10月23日から)。このマニュアルでそれに触れる箇所には、その旨を明記しています。v3.2.6 バイナリ(テストネット)には、さらに2つのクエリコマンド `query rlconsensus applied-params` と `last-action` が追加されています。これらはメインネットがそのリリースを適用するまでテストネット専用です([クエリコマンド](/cli-reference/query-commands#rlconsensus)を参照)。このページのそれ以外はすべて、両リリースで同じように動作します。
:::

---

## init

指定したモニカーで新しいノードを初期化します。

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| フラグ        | 型     | 説明                                            |
| ------------- | ------ | ----------------------------------------------- |
| `--chain-id`  | string | チェーン識別子(常に指定してください。省略するとランダムなものが作成されます) |
| `--home`      | string | ノードのホームディレクトリ(デフォルト: `~/.qorechaind`) |
| `--overwrite` | bool   | 既存の `genesis.json` を上書きします            |
| `--recover`   | bool   | キーを新規作成する代わりに、シードフレーズを指定して既存のキーを復元します |

`--home` の下に `config/`、`data/`、および初期の `genesis.json` を含むディレクトリ構造を作成します。ネットワークノードの場合は、起動前にこの `genesis.json` をそのネットワークのgenesisファイルに置き換えてください([メインネットへの接続](/getting-started/connecting-to-mainnet)を参照)。

`init` は、そのネットワークのEVMチェーンID(`qorechain-vladi` は `9801`、`qorechain-diana` は `9800`)も `app.toml` の `evm-chain-id` 設定に書き込むため、正しい `--chain-id` を指定してください。

---

## start

ノードを起動し、同期またはブロック生成を開始します。

```bash
qorechaind start [flags]
```

| フラグ                 | 型     | 説明                                                  |
| ---------------------- | ------ | ----------------------------------------------------- |
| `--home`               | string | ノードのホームディレクトリ                            |
| `--minimum-gas-prices` | string | このノードが受け入れる最小ガス価格。ネットワークの下限は `0.1uqor` です。少なくともこの値を設定してください |
| `--pruning`            | string | プルーニング戦略: `default`、`nothing`、`everything`、`custom`(`--pruning-keep-recent` および `--pruning-interval` と併用) |
| `--halt-height`        | uint   | このブロック高でノードを停止します                   |
| `--halt-time`          | uint   | このUnixタイムスタンプでノードを停止します            |
| `--log_level`          | string | ログの詳細度: `info`、`debug`、`warn`、`error`       |
| `--trace`              | bool   | エラー時に完全なスタックトレースを有効にします        |

公開ソースツリーからビルドしたバイナリ(コミュニティビルド)は、`qorechain-vladi` や `qorechain-diana` では起動を拒否します。このバイナリはポスト量子署名を検証できず、ネットワークのブロックを忠実にリプレイできないためです(ノードリリース v3.2.3 以降)。[download.qore.host](https://download.qore.host) のリリースバイナリを使用してください。[ソースからのビルド](/developer-guide/building-from-source)も参照してください。

---

## version

`qorechaind version` はリリースバイナリではリリース番号を**表示しません**。空行が出力されるだけで、`version --long` を付けてもビルド詳細は追加されません。リリースの区別にこれを使わないでください。実行中のものを確認するには次の方法を使います。

- 展開する前に、**ダウンロードしたアーカイブ**のSHA-256を、ネットワークの[マニフェスト](https://download.qore.host/mainnet/latest.json)にある `binary.sha256` と比較します(インストールしたものの記録として、そのアーカイブまたはそのチェックサムを保管してください)。
- チェーンに適用済みのアップグレードを問い合わせます。`GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` は、アップグレードが適用されたブロック高を返し、未適用の場合は `0` を返します。

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 / v3.2.4 / v3.2.5 been applied on mainnet, and at which height? (a name that was not applied returns {"height":"0"}, e.g. v3.2.6 on mainnet today)
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.4   # {"height":"3742566"}
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

## client configuration

`config` サブコマンドはありません。クライアントのデフォルト値(`chain-id`、`keyring-backend`、`output`、`node`)は `<home>/config/client.toml` から読み込まれます。このファイルを編集するか、コマンドごとにフラグ(`--chain-id`、`--keyring-backend`、`--output`、`--node`)を指定してください。

---

## keys

トランザクション署名用のローカルキーリングを管理します。

### 新しいキーの追加

```bash
qorechaind keys add <name> [flags]
```

| フラグ                  | 型     | 説明                                     |
| ----------------------- | ------ | ---------------------------------------- |
| `--keyring-backend`     | string | バックエンド: `os`、`file`、`kwallet`、`pass`、`test`、`memory` |
| `--key-type`            | string | キーアルゴリズム: `secp256k1`(デフォルト)または `eth_secp256k1` |
| `--coin-type`           | uint32 | HDコインタイプ(デフォルト `118`)       |
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
| `--vesting-start-time` | int   | ベスティング開始時刻(Unixタイムスタンプ) |
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

`genesis` のその他のサブコマンド: `bulk-add-genesis-account` と `migrate`。

### genesisファイルの検証

```bash
qorechaind genesis validate
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
| `--output-document`   | string | エクスポートをSTDOUTではなくこのファイルに書き込みます |
| `--modules-to-export` | strings | エクスポートするモジュールのカンマ区切りリスト(デフォルト: すべて) |
| `--jail-allowed-addrs` | strings | ジェイルされたバリデーターのうち、ジェイル解除するもののオペレーターアドレス |

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
