---
slug: /light-node/sx-edition
title: SX エディション(サーバーデーモン)
sidebar_label: SX エディション
sidebar_position: 2
---

# SX エディション — サーバーデーモン

**SX(Server eXperience)**エディションはヘッドレスのライトノードです。デーモンと完全な管理 CLI から成り、サーバーと自動化のために作られています。バイナリは `lightnode-sx` です。これはプリビルドバイナリにおけるライトノードの**v3.1.3**系列です(Docker ビルド用のソースタグは `v3.1.4`)。チェーンバージョンとは別の、独自のバージョンです。

## インストール {#install}

プリビルドされたバイナリを使うのが最も簡単な方法です — ライトノードクライアントは**ネイティブ依存関係ゼロの6つのプラットフォーム**でネイティブに動作します: Linux(amd64、arm64)、macOS(Intel、Apple Silicon)、Windows(amd64、arm64) — SX エディションと UX エディションを合わせて合計12個のバイナリです。各バイナリはおよそ11〜12 MBで、ダウンロードしてそのまま実行できます。別途インストールが必要なライブラリはありません。

**実行する前にチェックサムを検証してください。** `https://download.qore.host/<net>/lightnode/latest.json` のリリースマニフェストには、各バイナリの `sha256`、リリース全体に対する `SHA256SUMS` ファイルを指す `checksums.url`、そしてそのファイル自体の `checksums.sha256` が含まれています。ダウンロードしたものを検証してください — これは注釈程度のものではなく、実際にビルドされたバイナリを実行するのか、そのURLにたまたま置かれていたものを実行するのかを分ける違いです。

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Windows では、`certutil -hashfile lightnode-sx-<platform>.exe SHA256` の出力をマニフェストの値と比較してください。現在、両方のネットワークが同じ v3.1.3 ビルドを配信しています。ソースは `github.com/qorechain/qorechain-lightnode`(Apache 2.0)で公開されています。

ソースからバイナリをビルドするか、Docker で実行することもできます。

### ソースからのビルド

ライトノードは**Go 1.26.1**を必要とします。そのポスト量子暗号は純粋な Go による実装であり(CGO なし、ネイティブライブラリなし)、サポートされる6つのプラットフォームのいずれへのクロスコンパイルも、他の Go バイナリと同じ方法で行えます。

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

これにより `build/lightnode-sx` が生成されます。直接実行するか、`PATH` にコピーしてください。登録する前に、[`selftest`](#verify-the-pqc-stack-selftest) でポスト量子署名スタックの健全性を確認してください。

### Docker {#docker}

ビルド済みのレジストリイメージはありません。ソースタグからビルドします。タグは **`v3.1.4` 以降**を使用してください。`v3.1.3` からビルドしたイメージには、チェーンが現在拒否する古い `qorechaind` 署名者が同梱されているため、ハートビートと報酬の請求が失敗します。既存のインストールを更新するには、新しいタグから再ビルドしてください(`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`)。pull しても何も変わりません。

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

`QORECHAIN_RPC_ADDR` は、すべての `docker compose` コマンドでエクスポートしたままにしてください。これは設定の `rpc_addr` を上書きし、compose のデフォルトは `host.docker.internal:26657` を指しています。SX コンテナは、`/root/.qorechain-lightnode` にマウントされた名前付きボリュームにデータを永続化します。

このイメージには、リリース済みの `qorechaind`(v3.2.0、linux/amd64。ビルド時にリリースチャネルからダウンロードされ、固定されたダイジェストに対して検証されます)も含まれています。デーモンはこれを使ってハートビートと報酬の請求に署名するため、コンテナノードは2つ目のインストールなしでチェーン上でアクティブなままでいられます。ネットワークが後に同梱の署名者を拒否するバージョンへアップグレードされた場合は、`[heartbeat] qorechaind_path` を、そのネットワークのマニフェスト(`https://download.qore.host/<net>/latest.json`)に記載されている新しい `qorechaind` に向けてください。arm64 ホスト(たとえば Apple Silicon)では、ビルドに署名者は含まれません。必要な場合は `DOCKER_DEFAULT_PLATFORM=linux/amd64` を指定してビルドしてください。署名者にはオペレーターウォレットが必要です。`qorechaind` のホーム(オペレーターキーを保持するキーリングと、`pqc/<key_name>.dilithium` にエクスポートされたノードキー)を `/root/.qorechaind` にマウントしてください。`docker-compose.yml` はデフォルトで `~/.qorechaind` をマウントします。または `QORECHAIND_HOME` を設定してください。2つのパスフレーズは、ノードキーリングのものと `qorechaind` キーリングのものです。後者は標準入力経由で `qorechaind` に渡され、コマンドラインには一切現れません。[オペレーターウォレット](#operator-wallet)を参照してください。

## 設定

ライトノードは TOML 設定ファイルを読み取ります。デフォルトでは、ホームディレクトリ内の `config.toml`(`~/.qorechain-lightnode/config.toml`)を探します。通常このファイルを手書きすることはありません — [`onboard` ウィザード](#first-run-onboard)が作成してくれます — が、オプションを理解しておくと役立ちます。

すべてのコマンドに適用される2つの永続フラグがあります。

- `--config <path>` — デフォルト以外の場所にある設定ファイルを指定します。
- `--home <dir>` — データとキーに使われるホームディレクトリを上書きします(デフォルトは `~/.qorechain-lightnode`)。

利用レベルで最も関連性の高い設定オプションは次のとおりです。

| オプション | 制御内容 |
| --- | --- |
| `chain_id` | ネットワーク識別子(例: テストネットでは `qorechain-diana`、メインネットでは `qorechain-vladi`)。`onboard` は `qorechain-diana` のままにするため、その後ご自身で設定してください。署名者がこれを使用します。 |
| `rpc_addr` | デーモンが接続するチェーン RPC エンドポイント。**ローカルのみモード**で実行するには空のままにします。 |
| `primary_addr` / `witness_addrs` | プライマリ RPC エンドポイントと、その報告するヘッダーの裏付けに使われるウィットネスエンドポイント — 詳細は[ライトノードを実行する理由](/light-node/overview#why-run-a-light-node)を参照してください。到達可能で別個のウィットネスが少なくとも1つあることで、`assurance` の値(デバッグレベルでログ出力)が `trusted-single-source` から `corroborated-across-sources` に変わります。 |
| `trust_period` / `max_clock_drift` | 互換性のために受け付けられますが、現在は使用されません。ヘッダーの信頼は、上記のプライマリ/ウィットネスによる裏付けから得られます。 |
| `data_dir` | ノードがデータベースとヘッダーを保存する場所。 |
| `keyring_backend` / `key_name` | キーリングバックエンド(`file`、`os`、またはローカル devnet 専用の `test`)と、ノードのポスト量子キー名。`file` バックエンドでは、環境変数に `QORE_LIGHTNODE_KEYRING_PASSPHRASE` が必要です。 |
| `operator_address` | このノードが属するアカウント(`qor1...`)。読み込み時に検証されます。`register`、`status`、ハートビートに必要です。[オペレーターウォレット](#operator-wallet)を参照してください。 |
| `api_addr` | REST エンドポイント。空の場合は `rpc_addr` から導出されます(ポート 26657 は 1317 になり、`rpc.` ホストは `api.` になります)。そのため、どちらの規則にも従わないエンドポイントでのみ必要です。 |
| `[heartbeat]` | デフォルトで有効。`qorechaind_path`(空の場合は `PATH` 上の `qorechaind`。Docker イメージには同梱されています)、`qorechaind_home`(空の場合は `~/.qorechaind`)、`key_name`(`qorechaind` のアカウントキー。デフォルトはトップレベルの `key_name`)、`interval_blocks`(チェーンの `heartbeat_interval` である 1000 に合わせます)、`check_interval`(デフォルト `60s`)、`fees`(デフォルト `50000uqor`)、`gas`(デフォルト `300000`)。 |
| `[delegation]` | `auto_claim`(デフォルトでは無効。署名者を通じて、蓄積されたライトノード報酬をオペレーターウォレットに請求します。ノードがサーバーから再委任することはありません)、チェックの間隔、請求のための最小報酬、`rebalance_enabled`、`min_reputation`(レピュテーションのアラートのみ — ノードがステークを移動することはありません)。`validators` と `split_weights` は受け付けられますが、現在は動作に反映されません。 |
| `[telemetry]` | テレメトリを有効にするかどうか、およびバリデーター、ネットワーク、ブリッジ、トークノミクスの更新間隔。 |
| `log_level` / `log_format` | ログの詳細度(`debug`、`info`、`warn`、`error`)と形式(`text` または `json`)。 |

### 環境変数 {#environment-variables}

| 変数 | 用途 |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | ノードキーリングのパスフレーズ(`keyring_backend = "file"`)。必須です。空のパスフレーズはノードが拒否します。 |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | オペレーターキーを保持する `qorechaind` キーリングのパスフレーズ。標準入力経由で `qorechaind` に渡され、コマンドラインには決して現れません。 |
| `QORECHAIN_RPC_ADDR` | `rpc_addr`(および `rpc_addr` と同じだった場合は `primary_addr`)を上書きします。`docker-compose.yml` によって設定されます。 |

:::note ウィットネスエンドポイントは起動時に検証されます
プライマリと同じホスト上のウィットネスは拒否されます — 侵害されたエンドポイントは単に自分自身に同意するだけなので、何の裏付けにもならないからです。リモートホスト上の平文の `http://` ウィットネスも拒否されます。その接続を書き換えられる攻撃者は、すべてのウィットネスとして一斉に応答できてしまうためです。ループバックの `http://` は問題ありません。独立した理由で信頼できる RPC エンドポイントをウィットネスとして指定してください。
:::

委任のデフォルトは、レピュテーションを考慮したリバランスのアラートを有効にし、`auto_claim` は無効のままにします — これらが何をするかについては[報酬と監視](/light-node/rewards-and-monitoring)を参照してください。

## 初回実行: `onboard` {#first-run-onboard}

初回起動時、設定ファイルがまだ存在しない場合、`start` は停止してオンボーディングウィザードを案内します。ウィザードを実行します。

```bash
build/lightnode-sx onboard
```

`onboard` は、4つのステップでセットアップをガイドします。

1. **PQC セルフテスト** — 完全な Dilithium-5 ラウンドトリップを実行します([`selftest`](#verify-the-pqc-stack-selftest)と同じチェック)。PQC スタックが失敗した場合、ウィザードは続行を拒否します。
2. **チェーン RPC エンドポイント** — QoreChain の RPC URL を貼り付けるか、チェーン接続が不要な間は**ローカルのみモード**で実行するために空白のままにします。URL を入力すると、ウィザードは到達可能性をライブでテストします。
3. **ノードキー** — ウィザードは「バリデーター秘密鍵」と呼んでいますが、これはライトノード自身の Dilithium-5 キーであり、バリデーターキーではありません。16進エンコードされた Dilithium-5 秘密鍵を貼り付けるか、`g`(または `generate`)と入力してこのノード上で新しい鍵ペアを生成します。
4. **保存** — `config.toml` を書き込み、キーを `validator` という名前でキーリングに保存します(その名前が使用済みの場合は `validator-<hex>`)。ファイルキーリングでは、この手順と、それを開くそれ以降のすべてのコマンドのために、環境変数に `QORE_LIGHTNODE_KEYRING_PASSPHRASE` を設定しておく必要があります。

:::note ローカルのみモード
エンドポイントを空白のままにすると、デーモンはローカルのみモードで起動します。PQC スタックは完全に実行されますが、ノードはどのチェーンも同期しません。チェーンエンドポイントの準備ができたら `onboard` を再実行して、ノードをそこに向けてください。
:::

`onboard` は常にアクティブな設定を上書きします。デフォルト以外のパスに書き込むには `--config` を、プロンプトを表示する代わりに即座に失敗させる(CI で便利)には `--non-interactive` を使用してください。

:::caution オンボーディング後に設定を完成させてください
`onboard` は、あなたがどのネットワークに参加するのか、どのアカウントがあなたのものなのかを知りません。`register` を実行したりハートビートに頼ったりする前に、`config.toml` を編集してください。

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

トップレベルの `key_name` はノードのポスト量子キーです(そのファイルは `qorechaind` ホーム内の `pqc/<key_name>.dilithium`)。`[heartbeat] key_name` は手数料を支払う `qorechaind` のアカウントキーです。キーの名前が `validator` なのに `key_name = "operator"` のままにしておくと、`register` は `node key "operator" not found` で停止します。
:::

## 実行: `start`

オンボーディングが設定を書き込んだら、デーモンを起動します。

```bash
build/lightnode-sx start
```

デーモンは、中断されるまでヘッダーを同期し、委任を追跡し、テレメトリを提供します。意図的に設定ファイルなしで起動したい場合(ローカルのみ、チェーン RPC なし)は、`--skip-onboarding-check` を渡してください。

## PQC スタックの検証: `selftest` {#verify-the-pqc-stack-selftest}

いつでもポスト量子スタックが機能していることを確認できます。

```bash
lightnode-sx selftest
```

`selftest` は Dilithium-5(ML-DSA-87)に対して5つのチェックを実行し、1秒未満で完了します。

1. **Keygen** — 新しい鍵ペアを生成します。
2. **Sign** — テストメッセージに署名します。
3. **Verify(有効な署名)** — 署名が対応する公開鍵で検証できることを確認します。
4. **改ざんされた署名の拒否** — 署名の1バイトを反転させます。検証はそれを拒否しなければなりません。
5. **改ざんされたメッセージの拒否** — メッセージの1バイトを反転させます。検証はそれを拒否しなければなりません。

いずれかのチェックが失敗した場合、バイナリは診断出力とともに非ゼロで終了します。これはオンボーディングウィザードが最初のステップとして実行するのと同じテストであり、デプロイ前の検証やサポート診断に便利です。

## オペレーターウォレット {#operator-wallet}

ノードの Dilithium-5 キーはウォレットでは**ありません**。QoreChain では、ポスト量子キーはアカウントに紐づけられるものであり、アカウントを作成するものではありません。そのため `keys list` にはそのキーのアドレスが表示されません。**オペレーターアドレス**は、`qorechaind` で作成した、資金のある通常の `qor1…` アカウントで、ノードはそこから登録され、ライトノード報酬もそこで受け取ります。ノードキーは、そのアカウントのポスト量子キーになります。

一度だけ設定します。

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` は、あなたの値を埋め込んだ状態で次を出力します。ノードキーをアカウントに紐づける(1回のみ)`qorechaind tx pqc register-key-v2 dilithium5 … hybrid` コマンドと、ノードを登録する `tx lightnode register … --generate-only` と `tx pqc cosign` の組です。チェーンはすべてのトランザクションにポスト量子の共同署名を要求するため、登録は1つではなく2つのコマンドになります。登録には、オペレーターアドレス上でアクティブな `lightnode_operator` ライセンスも必要です。ない場合、チェーンはトランザクションを拒否します。登録はまだ開始されていません。[報酬プログラムのステータス](/light-node/overview#reward-program-status)を参照してください。

## 管理コマンド

SX CLI には、ノードの状態を確認しキーを管理するためのコマンドが含まれます。

| コマンド | 目的 |
| --- | --- |
| `onboard` | 対話式の初回実行ウィザード。 |
| `start` | デーモンを実行します。 |
| `selftest` | PQC セルフテストを実行します。 |
| `status` | ノードとライトクライアントの同期状態を表示します(チェーン ID、最新の高さ、キャッチアップ状態)。加えて `Signer`、`Operator`、`Licence`、`Registration` の各行も表示します。 |
| `keys create <name>` | 新しい Dilithium-5 ノードキーを作成し、その公開鍵を出力します。 |
| `keys list` | キーリング内のキーを一覧表示します(名前、タイプ、あればアドレス、公開鍵)。 |
| `keys show <name>` | キーのタイプと完全な公開鍵を出力します。 |
| `keys import <name> <hex-privkey>` | 16進エンコードされた秘密鍵をインポートします。 |
| `keys export <name>` | 秘密鍵を16進形式でエクスポートします(`qorechaind` が `~/.qorechaind/pqc/` から読み取るのと同じ形式)。 |
| `register` | ノードキーをオペレーターアカウントに紐づけ、ノードを登録するチェーンコマンドを出力します — [登録とライセンス](/light-node/registration-and-licensing)を参照。 |
| `validators` | ボンドされたバリデーターを一覧表示します。 |
| `delegation` | ローカルデータベースから現在の委任を表示します([報酬と監視](/light-node/rewards-and-monitoring#how-rewards-work)の既知の制限を参照)。 |
| `rewards` | 保留中のステーキング報酬を表示します(同じ制限があります)。 |
| `network` | ローカルデータベースからネットワークテレメトリ(最近同期したヘッダー)を表示します。 |
| `version` | バイナリのバージョンを出力します。 |

ステーキング、報酬、監視の詳細については[報酬と監視](/light-node/rewards-and-monitoring)を参照してください。オンチェーン登録については[登録とライセンス](/light-node/registration-and-licensing)を参照してください。
