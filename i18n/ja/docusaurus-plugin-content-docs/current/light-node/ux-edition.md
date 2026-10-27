---
slug: /light-node/ux-edition
title: UX エディション(Web ダッシュボード)
sidebar_label: UX エディション
sidebar_position: 3
---

# UX エディション — Web ダッシュボード

**UX**(User eXperience)エディションは SX エディションと同じライトノードデーモンを実行しますが、ブラウザでノードとネットワークを確認できる**組み込みの Web ダッシュボード**が追加されています。バイナリは `lightnode-ux` です。SX エディションと同様、ライトノード独自のバージョンラインにあり、チェーンバージョンとは別です(2026年10月27日時点で、両ネットワークのチャネルは 3.1.12 を提供しています)。

UX エディションは、デスクトップでの利用や、コマンドラインよりビジュアルなインターフェースを好むオペレーターにとって最適な選択肢です。

## インストール

プリビルドされたバイナリは**ネイティブ依存関係ゼロの6つのプラットフォーム**でネイティブに動作します — Linux(amd64、arm64)、macOS(Intel、Apple Silicon)、Windows(amd64、arm64)。各バイナリはおよそ13 MBです。実行する前に、ダウンロードしたファイルのチェックサムをマニフェストと照合して検証してください — 方法は[SX エディション](/light-node/sx-edition#install)を参照してください。

### ソースからのビルド

UX エディションは**Go 1.26.1**を必要とします。そのポスト量子暗号は純粋な Go による実装です(CGO なし、ネイティブライブラリなし)。

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

マニフェストが示すリリースタグ(現時点では `git checkout v3.1.12`)からビルドしてください。これにより `build/lightnode-ux` が生成されます。

### Docker

UX サービスは、ソースリポジトリ(`github.com/qorechain/qorechain-lightnode`、お使いのネットワークのマニフェストに一致するタグ)の `Dockerfile.ux` からビルドされます。コンテナは起動前にデータボリューム内に `config.toml` を必要とします。UX バイナリにはセットアップコマンドが含まれているため、ボリューム内で直接作成できます。

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

コンテナ内ではダッシュボードがコンテナのすべてのインターフェースでリッスンする必要があるため、その設定(ボリューム内の `/root/.qorechain-lightnode/config.toml`)に次を記述し、ポートはホストのループバックにのみ公開してください。同梱の `docker-compose.yml` は他のマシンから到達可能な `8420:8420` を公開しているため、次のように変更してください。

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

UX コンテナは、キーリングを含むデータを `/root/.qorechain-lightnode` にある名前付きボリュームに永続化し、チェーン RPC アドレスを `QORECHAIN_RPC_ADDR` 環境変数から読み取ります。ノードは自身のトランザクションに署名するため、UX コンテナも SX エディションと同様に登録とハートビートの送信ができます。UX イメージには `qorechaind` が含まれていないため、その中では `qorechaind` によるフォールバックは利用できません。

## 実行

UX ノードを起動します。

```bash
build/lightnode-ux start
```

これにより、デーモンと組み込みのダッシュボードサーバーが同時に起動します。UX エディションは常にダッシュボードを有効にします。起動時、バイナリはダッシュボードの URL を出力します。

UX エディションは SX エディションとセットアップを共有します。同じ `~/.qorechain-lightnode` の `config.toml` を読み取り、同じキーリングを使用し、同じコマンド(`onboard`、`keys`、`register`、`status`、`selftest` など)を備えています。初回セットアップは、`lightnode-sx` の代わりに `lightnode-ux` を使う同じ 5 つのステップです。

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

各コマンドの役割については[SX エディション](/light-node/sx-edition#first-run-onboard)を、要件については[登録とライセンス](/light-node/registration-and-licensing)を参照してください。UX エディション内のデーモンは、Linux、macOS、Windows 上で SX エディションと同じ方法で署名し、ハートビートを送信します。UX バイナリから `register` を実行すると、ノードはタイプ `ux` として登録されます。

## ポート8420 の Web ダッシュボード

ダッシュボードは**ポート8420**で公開されます。これは `lightnode-ux` の Docker イメージが宣言しているポート(`EXPOSE 8420`)であり、バイナリがデフォルトでバインドするポートでもあるため、Docker で実行する場合もダッシュボードは `8420` で公開されます。

```
http://localhost:8420
```

:::caution compose のポートマッピングを確認してください
他の文書ではダッシュボードのポートとして8080が記載されている箇所があります。正しい値は**8420**です — これがイメージが実際に公開し、デーモンがデフォルトでバインドするポートです。独自の `docker-compose.yml` やリバースプロキシを設定する場合は、8080ではなく**8420**にマッピングしてください。
:::

:::caution ダッシュボードを保護してください
ダッシュボードにはログインがありません。`[dashboard] token` を設定しない限り、ポート8420に到達できる人は誰でも、あなたの設定、委任、報酬を読み取ることができます。秘密鍵が提供されることは決してありません。トークンを設定すると、すべての `/api` ルートと `/ws` 接続に `Authorization: Bearer <token>` が必要になります(QoreX がノードとペアリングする際に送信するトークン)。プレーンな `http` では、このトークンは平文のままネットワークを通過します。バイナリは現在、すべてのインターフェースではなく**デフォルトでループバックのみ**(`127.0.0.1:8420`)にバインドし、より広くリッスンするよう設定されている場合は起動時に警告を出力します — ただし、この警告は拒否ではありません。意図的にバインドを広げる場合(たとえば別のマシンから到達させるため、または Docker からポートを公開しているため)は、直接公開するのではなく、トークンを設定し、https(リバースプロキシまたは SSH トンネル)の背後に置いてください。WebSocket テレメトリ接続もブラウザの `Origin` を確認します。広いネットワークバインドだけでは、同じブラウザで開いている別のページからの接続を防げないためです。
:::

## ダッシュボードに表示される内容

ダッシュボードは以下のビューで構成されています。

- **概要**(Overview) — ブロック高と一目でわかるノードステータス。
- **バリデーター**(Validators) — ボンドされたバリデーターセット。
- **委任**(Delegation) — オペレーターアカウント(`operator_address`)からミラーリングされた委任。
- **ネットワーク**(Network) — ライブのネットワークテレメトリと最近同期されたヘッダー。
- **ブリッジ**(Bridge) — クロスチェーンブリッジのテレメトリ。
- **トークノミクス**(Tokenomics) — トークンエコノミクスのテレメトリ。
- **設定**(Settings) — ノードの有効な設定。

ライトノード 3.1.11 以降、ノードがより新しいリリースを見つけると、ダッシュボードにバナーが表示されます([SX エディション: 更新](/light-node/sx-edition#updating)を参照)。そのローカル API は、`GET /api/update` で同じ情報を提供します。

テレメトリはリアルタイムで更新され、デーモンはバリデーター、ネットワーク、ブリッジ、トークノミクスのデータをそれぞれ独立した間隔で更新します(`config.toml` の `[telemetry]` で設定可能)。

### ローカルのみバナー

ノードに**チェーン RPC エンドポイントが設定されていない**場合、ダッシュボードは**ローカルのみモード**で動作し、その状態を説明する目立つバナーを表示します。PQC スタックは検証済みですが、ノードはどのチェーンも同期していないため、ブロック高は `0` のままです。バナーは、ホスト上でオンボーディングウィザードを実行するよう促します(バナーには `lightnode-sx` と表示されますが、`lightnode-ux onboard` も同じことを行います)。

```bash
lightnode-sx onboard
```

ウィザードは PQC セルフテストを実行し、チェーンエンドポイントを尋ね、ノードの鍵をインポートまたは生成します。エンドポイントが設定されたら、ノードを再起動すると、ダッシュボードにライブのチェーンデータが表示され始めます。

## 次に読むべきドキュメント

- [登録とライセンス](/light-node/registration-and-licensing) — ノードをオンチェーンで登録します。
- [報酬と監視](/light-node/rewards-and-monitoring) — 3%のライトノードシェアがどのようにクレジットされ請求されるか、そしてノードの健全性をどのように監視するか。
