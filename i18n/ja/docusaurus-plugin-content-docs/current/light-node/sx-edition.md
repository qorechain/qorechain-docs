---
slug: /light-node/sx-edition
title: SX エディション(サーバーデーモン)
sidebar_label: SX エディション
sidebar_position: 2
---

# SX エディション — サーバーデーモン

**SX**(Server eXperience)エディションはヘッドレスのライトノードです。デーモンと完全な管理 CLI から成り、サーバーと自動化のために作られています。バイナリは `lightnode-sx` です。このページはライトノード **3.1.10**(ソースタグ `v3.1.10`)について説明しています。これはチェーンバージョンとは別の、独自のバージョンラインです。

## インストール {#install}

プリビルドされたバイナリを使うのが最も簡単な方法です — ライトノードクライアントは**ネイティブ依存関係ゼロの6つのプラットフォーム**でネイティブに動作します: Linux(amd64、arm64)、macOS(Intel、Apple Silicon)、Windows(amd64、arm64) — SX エディションと UX エディションを合わせて合計12個のバイナリです。各バイナリはおよそ13 MBで、ダウンロードしてそのまま実行できます。別途インストールが必要なライブラリはありません。ノードはこれらすべてのプラットフォームで自身のトランザクションに署名するため、ノードの登録と実行に他のもの(特に `qorechaind`)は必要ありません。

**実行する前にチェックサムを検証してください。** `https://download.qore.host/<net>/lightnode/latest.json` のリリースマニフェストには、各バイナリの `sha256`、リリース全体に対する `SHA256SUMS` ファイルを指す `checksums.url`、そしてそのファイル自体の `checksums.sha256` が含まれています。ダウンロードしたものを検証してください — これは注釈程度のものではなく、実際にビルドされたバイナリを実行するのか、そのURLにたまたま置かれていたものを実行するのかを分ける違いです。

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v3.1.10/$F   # or the artifacts[].url from latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Windows では、`certutil -hashfile lightnode-sx-<platform>.exe SHA256` の出力をマニフェストの値と比較してください。両方のネットワークが同じ 3.1.10 ビルドを配信しており、マニフェストは引き続き 3.1.9 も受け入れます(`minCompatible: 3.1.9`)。3.1.10 以降、各リリースのバイナリはバージョン付きのパス `https://download.qore.host/<net>/lightnode/v<version>/<file>` に置かれ、マニフェストの `artifacts[].url` はこのパスを指しています。数時間遅れることがあるバージョンなしのコピーではなく、こちらを使用してください。ソースは `github.com/qorechain/qorechain-lightnode`(Apache 2.0)で公開されています。Android ビルドは GitHub リリースにプレビューとして添付されていますが、登録は行わず、報酬も獲得しません。

ソースからバイナリをビルドするか、Docker で実行することもできます。

### ソースからのビルド

ライトノードは**Go 1.26.1**を必要とします。そのポスト量子暗号は純粋な Go による実装であり(CGO なし、ネイティブライブラリなし)、サポートされる6つのプラットフォームのいずれへのクロスコンパイルも、他の Go バイナリと同じ方法で行えます。

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

リリースタグ(`git checkout v3.1.10`)からビルドしてください。これにより `build/lightnode-sx` が生成されます。直接実行するか、`PATH` にコピーしてください。登録する前に、[`selftest`](#verify-the-pqc-stack-selftest) でポスト量子署名スタックの健全性を確認してください。

### Docker {#docker}

ビルド済みのレジストリイメージはありません。ソースタグからビルドします。タグ **`v3.1.10`** を使用してください。既存のインストールを更新するには、新しいタグから再ビルドしてください(`git fetch --tags && git checkout v3.1.10 && docker compose build --no-cache lightnode-sx`)。単純な `docker compose up` や `restart` では古いイメージが再利用されます。キー、設定、データボリュームはそのまま引き継がれます。

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.10

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

`QORECHAIN_RPC_ADDR` は、すべての `docker compose` コマンドでエクスポートしたままにしてください。これは設定の `rpc_addr` を上書きし、compose のデフォルトは `host.docker.internal:26657` を指しています。SX コンテナは、キーリングを含むデータを `/root/.qorechain-lightnode` にマウントされた名前付きボリュームに永続化します。

ノードはコンテナ内でネイティブに署名するため、他に必要なものはありません。SX イメージには、[`qorechaind` フォールバック](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline)用に、リリース済みの `qorechaind`(v3.2.0、linux/amd64 のみ、固定されたダイジェストに対して検証済み)も引き続き含まれています。`docker-compose.yml` は `~/.qorechaind`(または `QORECHAIND_HOME`)を `/root/.qorechaind` にマウントし、その経路のために `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` を渡します。オペレーターキーが自身のキーリングにあるノードは、どちらも使用しません。

## 設定 {#configure}

ライトノードは TOML 設定ファイルを読み取ります。デフォルトでは、ホームディレクトリ内の `config.toml`(`~/.qorechain-lightnode/config.toml`)を探します。通常このファイルを手書きすることはありません — [`onboard` ウィザード](#first-run-onboard)が作成してくれます — が、オプションを理解しておくと役立ちます。

すべてのコマンドに適用される2つの永続フラグがあります。

- `--config <path>` — デフォルト以外の場所にある設定ファイルを指定します。
- `--home <dir>` — データとキーに使われるホームディレクトリを上書きします(デフォルトは `~/.qorechain-lightnode`)。

利用レベルで最も関連性の高い設定オプションは次のとおりです。

| オプション | 制御内容 |
| --- | --- |
| `chain_id` | ネットワーク識別子(メインネットでは `qorechain-vladi`、テストネットでは `qorechain-diana`)。`onboard` は RPC エンドポイントからこれを読み取ります。`onboard` の実行中にエンドポイントに到達できなかった場合は、デフォルトの `qorechain-diana` が残るため、ご自身で設定する必要があります。トランザクションはこのチェーン向けに署名されます。 |
| `rpc_addr` | デーモンが接続するチェーン RPC エンドポイント。**ローカルのみモード**で実行するには空のままにします。 |
| `primary_addr` / `witness_addrs` | プライマリ RPC エンドポイントと、その報告するヘッダーの裏付けに使われるウィットネスエンドポイント — 詳細は[ライトノードを実行する理由](/light-node/overview#why-run-a-light-node)を参照してください。到達可能で別個のウィットネスが少なくとも1つあることで、`assurance` の値(デバッグレベルでログ出力)が `trusted-single-source` から `corroborated-across-sources` に変わります。 |
| `trust_period` / `max_clock_drift` | 互換性のために受け付けられますが、現在は使用されません。ヘッダーの信頼は、上記のプライマリ/ウィットネスによる裏付けから得られます。 |
| `data_dir` | ノードがデータベースとヘッダーを保存する場所。 |
| `keyring_backend` / `key_name` | キーリングバックエンド(`file`、`os`、またはローカル devnet 専用の `test`)と、ノードが署名に使うポスト量子キーの名前。`onboard` は `key_name` を自身が作成したキー(`validator`)に設定し、`keys add-operator` はアカウントのワードからキーを導出または復元した場合にそれを `operator-pqc` に変更します。`file` バックエンドでは、環境変数に `QORE_LIGHTNODE_KEYRING_PASSPHRASE` が必要です。 |
| `operator_address` | このノードが属するアカウント(`qor1...`)。読み込み時に検証されます。`keys add-operator` が設定します。`register`、`status`、ハートビートに必要です。[オペレーターウォレット](#operator-wallet)を参照してください。 |
| `api_addr` | REST エンドポイント。空の場合は `rpc_addr` から導出されます(ポート 26657 は 1317 になり、`rpc.` ホストは `api.` になります)。そのため、どちらの規則にも従わないエンドポイントでのみ必要です。 |
| `[heartbeat]` | デフォルトで有効(`enabled`)。`interval_blocks`(チェーンの `heartbeat_interval` である 1000 に合わせます)、`check_interval`(デフォルト `60s`)、`gas`(デフォルト `300000`。ネイティブ署名では手数料はガス1単位あたり 0.25 uqor なので 75,000 uqor)。`qorechaind` フォールバックでのみ使用: `fees`(デフォルト `50000uqor`)、`qorechaind_path`(空の場合は `PATH` 上の `qorechaind`)、`qorechaind_home`(空の場合は `~/.qorechaind`)、`keyring_backend`、`key_name`(オペレーターアカウントを保持する `qorechaind` のキー。デフォルトはトップレベルの `key_name`)。 |
| `[delegation]` | `auto_claim`(デフォルトでは無効。署名者を通じて、蓄積されたライトノード報酬をオペレーターアカウントに請求します。ノードがサーバーから再委任することはありません)、チェックの間隔、請求のための最小報酬、`rebalance_enabled`、`min_reputation`(レピュテーションのアラートのみ — ノードがステークを移動することはありません)。`validators` と `split_weights` は受け付けられますが、現在は動作に反映されません。 |
| `[telemetry]` | テレメトリを有効にするかどうか、およびバリデーター、ネットワーク、ブリッジ、トークノミクスの更新間隔。 |
| `[dashboard]` | ローカルのダッシュボード API。UX エディションは常にこれを提供し、SX エディションは `enabled = true` の場合のみ提供します。`bind_addr`(デフォルト `127.0.0.1:8420`)と `token`(設定すると、すべての `/api` ルートと `/ws` に `Authorization: Bearer <token>` が必要になります)。[UX エディション](/light-node/ux-edition)を参照してください。 |
| `log_level` / `log_format` | ログの詳細度(`debug`、`info`、`warn`、`error`)と形式(`text` または `json`)。トップレベルのキーなので、最初の `[table]` より前に置いてください。 |

### 環境変数 {#environment-variables}

| 変数 | 用途 |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | ノードのポスト量子キーとオペレーターアカウントのキーを保持する、ノードキーリングのパスフレーズ(`keyring_backend = "file"`)。キーリングを開くすべてのコマンドと `start` に必要です。空のパスフレーズはノードが拒否します。 |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | `qorechaind` フォールバック専用: オペレーターキーを保持する `qorechaind` キーリングのパスフレーズ。標準入力経由で `qorechaind` に渡され、コマンドラインには決して現れません。 |
| `QORECHAIN_RPC_ADDR` | `rpc_addr`(および `rpc_addr` と同じだった場合は `primary_addr`)を上書きします。`docker-compose.yml` によって設定されます。 |

:::note ウィットネスエンドポイントは起動時に検証されます
プライマリと同じホスト上のウィットネスは拒否されます — 侵害されたエンドポイントは単に自分自身に同意するだけなので、何の裏付けにもならないからです。リモートホスト上の平文の `http://` ウィットネスも拒否されます。その接続を書き換えられる攻撃者は、すべてのウィットネスとして一斉に応答できてしまうためです。ループバックの `http://` は問題ありません。独立した理由で信頼できる RPC エンドポイントをウィットネスとして指定してください。
:::

委任のデフォルトは、レピュテーションを考慮したリバランスのアラートを有効にし、`auto_claim` は無効のままにします — これらが何をするかについては[報酬と監視](/light-node/rewards-and-monitoring)を参照してください。

## 初回実行: `onboard` {#first-run-onboard}

初回起動時、設定ファイルがまだ存在しない場合、`start` は停止してオンボーディングウィザードを案内します。まずキーリングのパスフレーズを設定してください — `onboard` はパスフレーズなしでは起動を拒否するため、保存できないキーを生成することはありません — その後、ウィザードを実行します。

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` は、4つのステップでセットアップをガイドします。

1. **PQC セルフテスト** — 完全な Dilithium-5 ラウンドトリップを実行します([`selftest`](#verify-the-pqc-stack-selftest)と同じチェック)。PQC スタックが失敗した場合、ウィザードは続行を拒否します。
2. **チェーン RPC エンドポイント** — QoreChain の RPC URL(メインネット `https://rpc.qore.host`、テストネット `https://rpc-testnet.qore.host`)を貼り付けるか、**ローカルのみモード**で実行するために空白のままにします。URL を入力すると、ウィザードはそれをライブでテストし、チェーン ID を読み取ります。
3. **ノードキー** — ウィザードは「バリデーター秘密鍵」と呼んでいますが、これはライトノード自身の Dilithium-5 キーであり、バリデーターキーではありません。16進エンコードされた Dilithium-5 秘密鍵を貼り付けるか、`g`(または `generate`)と入力してこのノード上で新しい鍵ペアを生成します。
4. **保存** — `config.toml`(エンドポイントとチェーン ID を含む)を書き込み、キーを `validator` という名前でキーリングに保存し(その名前が使用済みの場合は `validator-<hex>`)、`key_name` をその名前に設定します。

:::note ローカルのみモード
エンドポイントを空白のままにすると、デーモンはローカルのみモードで起動します。PQC スタックは完全に実行されますが、ノードはどのチェーンも同期しません。チェーンエンドポイントの準備ができたら `onboard` を再実行して、ノードをそこに向けてください。
:::

`onboard` は常にアクティブな設定を上書きします。デフォルト以外のパスに書き込むには `--config` を、プロンプトを表示する代わりに即座に失敗させる(CI で便利)には `--non-interactive` を使用してください。

:::caution 次へ: オペレーターアカウント
`onboard` は、どのアカウントがあなたのものなのかを知りません。`register` を実行する前に、[`keys add-operator`](#operator-wallet) でオペレーターアカウントを追加してください。これにより `operator_address` が設定されます。`onboard` の実行中にエンドポイントに到達できなかった場合は、`config.toml` の `chain_id` が `qorechain-vladi`(メインネット)または `qorechain-diana`(テストネット)であることも確認してください。
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
3. **Verify**(有効な署名) — 署名が対応する公開鍵で検証できることを確認します。
4. **改ざんされた署名の拒否** — 署名の1バイトを反転させます。検証はそれを拒否しなければなりません。
5. **改ざんされたメッセージの拒否** — メッセージの1バイトを反転させます。検証はそれを拒否しなければなりません。

いずれかのチェックが失敗した場合、バイナリは診断出力とともに非ゼロで終了します。これはオンボーディングウィザードが最初のステップとして実行するのと同じテストであり、デプロイ前の検証やサポート診断に便利です。

## オペレーターウォレット {#operator-wallet}

ノードの Dilithium-5 キーはウォレットでは**ありません**。QoreChain では、ポスト量子キーはアカウントに紐づけられるものであり、アカウントを作成するものではありません。そのため `keys list` にはそのキーのアドレスが表示されません。**オペレーターアドレス**は、ライセンスとステークを保持し、手数料を支払い、ライトノード報酬を受け取る通常の `qor1…` アカウントです。リカバリーワードをあなた自身が保持しているアカウント(自分のワード、Keplr、または `qorechaind`)でなければならず、専用のアカウントが最善です。Dashboard のカストディアルウォレットは、そのシードをエクスポートしない限りノードを稼働させることはできません。[オペレーターアカウント](/light-node/registration-and-licensing#operator-account)を参照してください。

オペレーターアカウントのキーをノードのキーリングに保存します。

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator` は次のことを行います。

- `qorechaind` や Keplr とまったく同じ方法(`m/44'/118'/0'/0/0`)でワードからアカウントキーを導出し、キーリングに `operator` として保存し、そのアカウントを `config.toml` の `operator_address` に書き込みます。`operator_address` がすでに別のアカウントに設定されている場合は拒否します。
- ノードが署名に使うポスト量子キーを選択し、`operator-pqc` として保存して `key_name` をその名前に設定します。アカウントにすでにポスト量子キーがある場合 — 通常は同じワードからウォレットが登録したもの — そのキーをワードから再構築します(wallet-adapter と Dashboard の導出方法で、`qorechaind tx pqc recover-key` と同じ)。アカウントにキーがない場合はワードからキーを導出するため、ワードでノードのキーも復元できます。アカウントに登録されたキーがすでにノードの現在のキーである場合は、そのキーが維持されます。アカウントのキーをワードから再現できない場合、コマンドは拒否し、専用のアカウントを使うよう勧めます。
- `--recover` なしの場合は新しいアカウントを作成し、その24個のワードを一度だけ表示します。必ず書き留めてください。それが唯一のバックアップです。登録する前に、アカウントに資金を入れ、そのアドレス向けにライセンスを購入してください。

キーリングのパスフレーズ(`QORE_LIGHTNODE_KEYRING_PASSPHRASE`)は、ノードキーと同様にこのキーも保護します。その後、登録します。

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` はライセンスを確認し、アカウントがまだ持っていなければポスト量子キーを紐づけ、`--delegate-to` でバリデーターを指定した場合にのみ不足しているステークを委任し、ノードを登録します。各ステップは、次のステップの前にブロックで確認されます。詳細と、アカウントキーを `qorechaind` キーリングに保管するオペレーター向けの `register --print` フォールバックについては、[登録とライセンス](/light-node/registration-and-licensing)を参照してください。

## 管理コマンド

SX CLI には、ノードの状態を確認しキーを管理するためのコマンドが含まれます。3.1.7 以降、UX バイナリ(`lightnode-ux`)にも同じコマンドがあります。

| コマンド | 目的 |
| --- | --- |
| `onboard` | 対話式の初回実行ウィザード。 |
| `start` | デーモンを実行します。 |
| `selftest` | PQC セルフテストを実行します。 |
| `status` | ノードとライトクライアントの同期状態を表示します(チェーン ID、最新の高さ、キャッチアップ状態)。加えて `Signer`(ネイティブまたは `qorechaind`)、`Operator`、`Licence`、`Registration` の各行も表示します。 |
| `keys create <name>` | 新しい Dilithium-5 ノードキーを作成し、その公開鍵を出力します。 |
| `keys list` | キーリング内のキーを一覧表示します(名前、タイプ、あればアドレス、公開鍵)。 |
| `keys show <name>` | キーのタイプと完全な公開鍵を出力します。 |
| `keys import <name> <hex-privkey>` | 16進エンコードされた秘密鍵をインポートします。 |
| `keys export <name> [--out <file>]` | 秘密鍵を16進形式でエクスポートします。`--out` は `qorechaind --pqc-key` が読み取るファイルを書き込みます(末尾の改行なし、モード 0600)。 |
| `keys add-operator [--recover]` | オペレーターアカウントのキー(新規作成、または標準入力から受け取ったワードで復元)を保存し、ポスト量子キーを選択します。`operator_address` を設定します。[オペレーターウォレット](#operator-wallet)を参照してください。 |
| `register [--delegate-to <qorvaloper>] [--print]` | ノードをチェーンに登録します: ポスト量子キー、不足しているステーク、登録で、それぞれブロックで確認されます。`--print` は代わりに `qorechaind` コマンドを出力します — [登録とライセンス](/light-node/registration-and-licensing)を参照。 |
| `validators` | ボンドされたバリデーターを一覧表示します。 |
| `delegation` | 実行中のデーモンがローカルデータベースに反映した、オペレーターアカウントの委任を表示します。 |
| `rewards` | オペレーターアカウントの保留中のステーキング報酬を表示します(ライトノード報酬ではありません。[報酬と監視](/light-node/rewards-and-monitoring#how-rewards-work)を参照)。 |
| `network` | ローカルデータベースからネットワークテレメトリ(最近同期したヘッダー)を表示します。 |
| `version` | バイナリのバージョンを出力します。 |

ステーキング、報酬、監視の詳細については[報酬と監視](/light-node/rewards-and-monitoring)を参照してください。オンチェーン登録については[登録とライセンス](/light-node/registration-and-licensing)を参照してください。
