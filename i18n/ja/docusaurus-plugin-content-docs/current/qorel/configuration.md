---
slug: /qorel/configuration
title: QORel の設定
sidebar_label: 設定
sidebar_position: 5
---

# 設定

QORel は 1 つの TOML ファイルを読み込みます（デフォルトは `~/.hermes/config.toml`、`--config` でパスを指定した場合はそのパス）。標準的な方法で署名するチェーンについては、このファイルはそのまま Hermes の設定です。すべての設定項目は [Hermes ガイド](https://hermes.informal.systems)に記載されています。このページでは、QORel が追加するもの、つまり QoreChain のチェーンエントリ、ポスト量子鍵、ガス設定、トランザクション送信前に実行されるチェックを扱います。QORel の設定を作成・確認するオペレーター向けです。

## 特長 {#innovations}

- **チェーンごとの `signing`。** `'qorechain-hybrid'` は、そのチェーンに QORel が送信するすべてのトランザクションに ML-DSA-87 署名を追加します。`'standard'`（デフォルト）は Hermes とバイト単位で同一です。混在した設定も使えます。1 つのプロセスで、それぞれの種類のチェーンを 1 つずつ扱えます。
- **チェーンから読み取る sign-bytes バージョン。** `pqc.sign_bytes = 'auto'` の場合、QORel はチェーンの適用済みアップグレード記録を読み取り、対応する形式で署名し、1 分ごと、および拒否されるたびに再読み込みします。バージョンを勝手に決めることはありません。
- **フィーマーケットのガス価格。** `backend = 'cosmos-evm-feemarket'` を指定した `dynamic_gas_price` は、QoreChain のベースフィー（下限はガス 1 あたり 0.1 uqor）に追従します。
- **安全でない組み合わせを拒否する設定。** 静的な `extension_options` とハイブリッド署名の併用は、読み込み時に拒否されます。ポスト量子署名が唯一のクリティカルな拡張オプションでなければならないためです。

## 使い方 {#how-to-use}

### QoreChain のチェーンエントリ {#chain-entry}

これはサンプル設定にあるテストネットのエントリです。ノードのアドレスは、ご自身のテストネットノードのものに置き換えてください。

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

QoreChain 固有の設定:

| 設定 | 値 | 内容 |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | このチェーンに送信するすべてのトランザクションに ML-DSA-87（FIPS 204）署名を追加します。他のチェーンでは省略するか、`'standard'` を使用します。 |
| `account_prefix` | `'qor'` | QoreChain アカウントのアドレスプレフィックス。 |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | 手数料の下限はガス 1 あたり 0.1 uqor です。 |
| `gas_multiplier` | `1.1` | シミュレートされたガスに乗じてガスリミットを求めます。[ガス](#gas)を参照してください。 |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | `gas_price` だけを使うのではなく、チェーンのフィーマーケットのベースフィーを読み取ります。 |
| `pqc.sign_bytes` | `'auto'`（デフォルト）、`'v1'` または `'v2'` | `auto` はチェーンから sign-bytes バージョンを読み取ります。`v1` と `v2` は一方の形式に固定します。`auto` のままにしてください。 |
| `pqc.sign_mode` | `'hedged'`（デフォルト）または `'deterministic'` | ランダム化または決定論的な ML-DSA 署名。チェーンはどちらも受け付けます。 |
| `pqc.include_public_key` | `false`（デフォルト） | 各署名拡張に公開鍵を埋め込むかどうか。これは鍵を登録するものではありません。登録できるのは `keys register-pqc` だけです。 |

QoreChain テストネットの読み取り用公開エンドポイントは、[テストネットへの接続](/getting-started/connecting-to-testnet)に一覧があります。リレイヤーには gRPC も必要ですが、これは公開されていないため、QoreChain 側にはご自身のノードを運用してください。

### その他の Cosmos SDK チェーン {#other-chains}

Hermes と同じようにエントリを書き、`signing` は記述しません。これはサンプル設定にある Cosmos Hub 公開テストネットのエントリです。

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

これらのエンドポイントはサードパーティのもので、公開されており、レート制限がかかることがあります。継続的なリレーにはご自身のノードを使用してください。

### グローバル設定 {#global}

サンプル設定では次の設定を使っています。これらは Hermes の設定です。

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` はライトクライアントを最新に保ち、不正行為（misbehaviour）を監視します。`mode.packets` はパケットをリレーし、`clear_interval` ブロックごと、および起動時に、保留中のパケットをクリアします。コネクションとチャネルのハンドシェイクは `create` コマンドに任せています。テレメトリのポートについては[モニタリング](/qorel/monitoring)で説明します。

### 鍵 {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add`（またはニーモニックを含む鍵ファイルを指定する `--key-file`）は、Hermes と同様に secp256k1 鍵を保存します。ハイブリッドチェーンでは、同じニーモニックとアカウントから QoreChain ウォレットの導出方式で ML-DSA-87 鍵も導出します。保存されるのは 32 バイトのシードだけで、鍵の隣に `<key name>.pqc` として置かれます。秘密情報は一切出力されません。導出方法は[鍵導出](/qoresign/guides/key-derivation)を参照してください。
- `keys register-pqc` は `MsgRegisterPQCKeyV2` を 1 回だけ送信します。これは、QoreChain が従来型の署名だけで受け付ける唯一のトランザクションであり、v3.2.3 以降のネットワークでは所有証明（proof of possession）を伴います。冪等であり、アカウントにすでに別の鍵が登録されている場合は送信を拒否します。チェーンが何を検証するかは[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)を参照してください。
- `keys pqc-status` は、鍵が登録されているか、ローカルの鍵と一致するか、所有証明によって確認されたか、チェーンがどの sign bytes を検証するかを表示します。`ready_to_relay` は `true` である必要があります。
- 少額の残高を持つ専用のリレイヤーアカウントを使用してください。バリデーターのオペレーター鍵は絶対に使わないでください。
- 鍵ファイル（`<key name>.json` と `<key name>.pqc`）は、所有者のみが読み取れる（0600）状態で書き込まれます。アップストリームの Hermes はデフォルトの umask を使っていました。古い Hermes で追加した鍵は以前のモードのままなので、`ls -l` で確認してください。

### ガス {#gas}

QoreChain は手数料の全額（ガスリミット × 価格）を返金なしで課金するため、乗数は小さく抑えてください。

- テストネット（v3.2.6）では、シミュレーションと実際の消費量の差は数百ガス以内です。その系統のビルドで行ったローカルのエンドツーエンドテストは `1.05` で通ります（すべてのリレートランザクションがリミットの 95% を使用しました）。
- それ以前のビルドでは、約 8 〜 10% 過少に報告されます（リリース前のデブネットで測定。`1.15` で 4 〜 7% の余裕が残りました）。ご自身のノードで測定するまでは `1.15` を使用してください。
- `health-check` は、QoreChain エントリで `1.1` 未満の乗数を、設定ミスの可能性として報告します。これは警告であり、リレー自体は動作します。サンプル設定の値である `1.1` なら、`1.05` より手数料が約 5% 増えるだけで、警告は出ません。
- 1 回限りの `keys register-pqc` トランザクションは、設定にかかわらず最低でも `1.1` を使用します。
- ハイブリッド署名 1 つにつき、トランザクションは約 4.7 KB、検証のガスは 2,000 増えます。シミュレーションにはその両方が含まれます。

### 送信前の安全チェック {#safety-checks}

ハイブリッドチェーンへのトランザクションを送るたびに、QORel は、ポスト量子鍵が読み込まれていること、チェーンに登録されていること、ローカルの鍵と同一であること、そして sign-bytes バージョンが判明していることを確認します。いずれかのチェックに失敗した場合は何も送信せず（手数料は消費されません）、`health-check` がその理由を報告します。チェーンが codespace `pqc` コード 21 で拒否した場合、QORel は次のトランザクションの前にバージョンと登録状況を再読み込みします。

### ibc-go v10 チェーンに関する注意 {#ibc-go-v10}

- ICS-29 フィーミドルウェアは ibc-go v10 では存在しません。手数料は、ガス価格、フィーグランター、動的ベースフィーで決まります。
- ibc-go v10 は `update_client` イベントにヘッダーを含めなくなりました。QORel は代わりに `MsgUpdateClient` トランザクションからヘッダーを読み取るため、不正行為の検出は引き続き機能します（標準の Hermes 1.13 は、これらのチェーンでは検出を無効にします）。

### レート制限のあるエンドポイント {#rate-limits}

公開エンドポイントは、たとえばリレイヤーの起動直後などのバーストに対して `429 Too Many Requests` を返すことがよくあります。Hermes はこれを再試行可能として扱いますが、パケットワーカーは、直近のクリアリングが失敗していても、新しい IBC イベントなしで `clear_interval x 5` ブロックが経過すると停止します。その時点で保留中だったパケットは、チャネル上の次のパケットか再起動まで待たされました。QORel は、リレーまたはクリアリングの試行が失敗している間もチャネルのパケットワーカーを動かし続け、クリアインターバルごとに再試行します。アイドルによる停止は、クリアリングが成功した後に限られます。本番のリレーにはご自身のノードか有料エンドポイントを使用し、保留中のパケットにアラートを設定してください（[モニタリング](/qorel/monitoring)）。

## アクセス方法 {#how-to-access}

- **ファイルの場所。** tarball または Homebrew でのインストールでは `~/.hermes/config.toml`、`.deb` と `.rpm` では `/etc/qorel/config.toml`、コンテナではマウントしたディレクトリです。`--config <path>` で上書きできます。
- **鍵ストア。** `key_store_folder` が鍵の保管場所を決めます。デフォルトは `~/.hermes/keys` で、パッケージは `/var/lib/qorel/keys` を使用します。
- **前提条件。** 各チェーンの RPC、gRPC、WebSocket エンドポイントと、それぞれに資金のあるリレイヤーアカウント。
- **設定の確認。** `qorel health-check` が設定ファイルを読み込み、各チェーンをテストします。

## 公開場所 {#where-published}

| 内容 | 場所 |
|---|---|
| サンプル設定（テストネット、QoreChain と Cosmos Hub 公開テストネット） | [qorechain/QORel](https://github.com/qorechain/QORel) の `packaging/config.example.toml`。パッケージでは `/etc/qorel/config.example.toml` にインストールされます |
| Hermes 設定リファレンス | [hermes.informal.systems](https://hermes.informal.systems) |

## 制限と既知の問題 {#limits}

- **静的な `extension_options` は拒否されます。** `signing = 'qorechain-hybrid'` のチェーンでは使用できません。
- **`pqc.sign_bytes` は `auto` のままにしてください。** チェーンが検証する形式と一致しない `v1` または `v2` を固定すると、チェーンはすべてのトランザクションを拒否します。
- **古い鍵のファイルモード。** 古い Hermes が書き込んだファイルは、以前のパーミッションのままです。
- **サードパーティのエンドポイント。** サンプル設定の Hub 側エンドポイントは QoreChain が運用しているものではなく、変更やレート制限が行われる可能性があります。
- **テストネットのエントリのみ。** ここにある QoreChain のエントリは `qorechain-diana` 用です。メインネットは IBC に対して開かれていません。
