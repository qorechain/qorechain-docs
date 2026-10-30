---
slug: /light-node/overview
title: ライトノード概要
sidebar_label: 概要
sidebar_position: 1
---

# ライトノード概要

**QoreChain ライトノード**は、フルノードを実行せずに QoreChain ネットワークを追跡する小さなクライアントです。オンチェーンでライトノードとして登録することで、**3% のライトノード報酬分配**に参加できます。低コストでチェーンを追跡し、その分配から収益を得たいオペレーターのためのものであり、単一の RPC サーバーを信頼せずに、チェーンの最新ブロックハッシュについてセカンドオピニオンを得たい方のためのものでもあります。同じコードから構築された2つのエディションを持つ、単一の自己完結型バイナリです。**SX**（`lightnode-sx`、コマンドラインを備えたヘッドレスデーモン。サーバー向け）と、**UX**（`lightnode-ux`、同じデーモンに `127.0.0.1:8420` のローカル Web ダッシュボードを加えたもの）です。Apache 2.0 ライセンスの下でリリースされ、ソースは `github.com/qorechain/qorechain-lightnode` で公開されています。

ノードの実行と同期にライセンスは不要です。報酬分配への参加は別のステップで、`lightnode_operator` ライセンス、ボンドされたバリデーターへの委任ステーク、そしてオンチェーン登録が必要です（[アクセス方法](#how-to-access)を参照）。

ライトノードは、チェーンのリリースとは別の**独自のバージョンライン**を持っています。本稿執筆時点（2026年10月27日）では、両ネットワークのリリースチャネルがライトノード **3.1.12** を配布しています（チェーンはメインネットが `v3.2.5`、テストネットが `v3.2.6`）。この2つの番号は無関係なものとして扱ってください。

## 革新的な点 {#innovations}

以下の各項目は、ソースを確認するか、ノードを実行することで確かめられる仕組みです。

- **ネイティブのハイブリッド署名、他のソフトウェアは不要。** ノードは自身のトランザクションを純粋な Go で組み立てて署名します（CGO なし、ネイティブライブラリなし、`qorechaind` なし）。すべてのトランザクションには、PQC 拡張を除いたボディに対する ML-DSA-87（FIPS 204）署名と、その拡張を含むボディを持つ SignDoc に対する secp256k1 署名が付きます。署名フォーマットのバージョンは、チェーンの適用済みアップグレードプランから読み取られます。amd64 と arm64 向けに Linux、macOS、Windows のビルドがあります（3.1.8 以降）。
- **1組のリカバリーワードで両方の鍵が得られます。** `keys add-operator --recover` は、`qorechaind` や Keplr と同じパス `m/44'/118'/0'/0/0` でアカウント鍵を導出します。ポスト量子鍵については、同じワードから、そのアカウントにウォレットがすでに登録している鍵を再構築する（wallet-adapter と Dashboard の導出で、`qorechaind tx pqc recover-key` と同じ）か、新しい鍵を導出するため、同じワードでノードの鍵も復元できます（3.1.9 以降）。
- **登録は1つのコマンドで、段階ごとに確認されます。** `register` は、ライセンスを確認し、ポスト量子鍵を紐付け（チェーンが対応している場合は所有証明付き）、`--delegate-to` を渡した場合は不足しているステークだけを委任し、その後に登録します。各ステップは、次のステップが送信される前にブロックに含まれている必要があります。ステークは、チェーンの数え方と同じく、ボンドされたバリデーター上のものだけがカウントされます（3.1.10 以降）。
- **ハートビートはチェーン自身の記録に基づいて計時されます。** デーモンは、チェーンに記録されたそのノードの `last_heartbeat` から 1,000 ブロックが経過するとハートビートを送信します。60秒ごとに確認し、ハートビートがブロックに含まれた時点で初めて送信済みとして報告します。再起動しても、重複して送信されることも、間隔全体を待つこともありません。
- **エンドポイント間のヘッダー照合。** ノードは、同じ高さをプライマリエンドポイントと設定されたすべての witness エンドポイントから取得し、すべてが同じハッシュを返した場合にのみヘッダーを保存します。プライマリと同じホスト上の witness や、リモートのプレーンテキスト `http://` アドレスの witness は拒否されます。モードはヘッダーごとにデバッグレベルで `assurance`（`trusted-single-source` または `corroborated-across-sources`）として記録されます。これはコンセンサスの検証では**ありません**。[制限事項](#limits)を参照してください。
- **署名付きの自己アップデート。** ライトノード 3.1.11 以降、デーモンは 6 時間ごとにそのネットワークの `latest.json` を読み取ります。新しいリリースをインストールするのは、`v<version>/SHA256SUMS.sig` が、バイナリに組み込まれたリリース鍵による Ed25519 署名として検証され（署名はネットワーク、バージョン、`SHA256SUMS` の内容を結び付けます）、ダウンロードしたバイナリが署名済みのチェックサムと一致し、新しいバイナリが実行できて正確に `v<version>` と報告する場合に限られます。以前のバイナリは `<name>.old` として保持され、ノードはその場で再起動します（Linux と macOS では同じプロセス、Windows では新しいバイナリが起動して古いものが終了します）。`[update] mode` は `auto`（デフォルト）、`notify`、`off` のいずれかで、`lightnode-sx update --check` と `lightnode-sx update` は同じことを手動で行います。コンテナ内や、バイナリのフォルダーに書き込めない場合、ノードはリリースを通知するだけです（ログ行、ローカル API の `GET /api/update`、UX ダッシュボードのバナー）。
- **チェーンの挙動と一致する警告。** `[delegation] rebalance_enabled` がオン（デフォルト）の場合、ノードは、委任先のバリデーターがジェイルされたとき、アクティブセットに入っていないとき、ボンドされたステークが `min_delegated_stake`（1,000 QOR）を下回ったときに警告します。この3つのいずれの場合も、チェーンは何のメッセージもなくそのノードへのクレジットを止めます。警告は、発生時、継続している間は毎時、解消されたときに一度、ログに記録されます。4つ目の警告である、委任先バリデーターの評判スコアが `min_reputation`（デフォルト `0.5`）を下回った場合は、`GET /qorechain/reputation/v1/validator/<valoper>` を読み取ります。これは現在**テストネット**で稼働しており、メインネットでは今後のチェーンリリースで初めて利用可能になります(メインネットは v3.2.5 で稼働しており、まだ提供していません)。このルートが提供されるまで、ノードはその旨を一度記録し、6 時間ごとに再度問い合わせます。

### ライトノードを実行する理由と、クロスチェックの読み方 {#why-run-a-light-node}

- **報酬分配に参加する。** ステークとアップタイムのルールを満たす、登録済みでアクティブなライトノードには、[以下](#the-3-light-node-reward-share)で説明する 3% の分配から報酬が支払われます。
- **提示されたチェーン状態をクロスチェックする。** witness が設定されていない場合、ノードは起動時に警告をログに記録し、`trusted-single-source` と報告します。正直に運用されている単一のエンドポイントは、侵害されたエンドポイントと同じ値を報告します。独立して運用される witness を追加すると `corroborated-across-sources` に移行し、これを欺くには、設定されたすべてのエンドポイントが同時に侵害される必要があります。この値はデバッグログ（`log_level = "debug"` を設定）の `synced header` 行に表示されます。`status` にもダッシュボードにも表示されず、RPC の選択はあなたの環境にローカルなものであるため、中央のどこからも見ることはできません。
- **ネットワークを見守る。** テレメトリは、バリデーター、コンセンサス、ブリッジ、トークノミクスをカバーし、それぞれ独立した間隔で更新されます。

## 使い方 {#how-to-use}

エディションを選びます。どちらも同じ `config.toml` を読み込み、同じホームディレクトリ（`~/.qorechain-lightnode`）にデータを保存し、同じキーリングを使用します。

| エディション | バイナリ | 対象 | インターフェース |
| --- | --- | --- | --- |
| **SX**（Server eXperience） | `lightnode-sx` | ヘッドレスサーバー、自動化 | デーモンと完全なコマンドライン。[SX Edition](/light-node/sx-edition) を参照。 |
| **UX**（User eXperience） | `lightnode-ux` | デスクトップおよびオペレーター利用 | 同じコマンドに加えて、ローカル Web ダッシュボード。[UX Edition](/light-node/ux-edition) を参照。 |

**1. ダウンロードと検証**（Linux amd64 の例。マニフェストの読み取りに `jq` を使用）。対象ネットワークのマニフェストからバージョンを取得します:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Windows では、`certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` の結果をマニフェストの値と比較してください。バージョン固有の `SHA256SUMS` は、バージョン固有のバイナリと一致する必要があるため、両方とも `v$V` のパスから取得します。

**2. セットアップと登録。** 以下の手順は Dashboard に表示されるものと同じです。devnet、テストネット（2026年10月18日にリハーサル）、そして最初のメインネットノード（2026年10月20日）で実行されました。

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

`onboard` のチェーン RPC は、`https://rpc.qore.host`（メインネット）または `https://rpc-testnet.qore.host`（テストネット）です。UX エディションでは、同じコマンドで `lightnode-ux` を使用し、`http://127.0.0.1:8420` を開きます。各ステップの詳細は [SX Edition](/light-node/sx-edition) と [Registration and Licensing](/light-node/registration-and-licensing) にあります。

**3. 最新に保つ。** ライトノード 3.1.11 以降は、コンテナの外では自動的にアップデートされます（上記の自己アップデートの項目を参照）。3.1.10 以前のノードは、一度だけ 3.1.12 を手動でインストールする必要があります。上記のようにバージョン付きのバイナリをダウンロードして、ファイルを置き換えてください。Docker では、`docker compose pull && docker compose up -d` を実行します。[SX Edition: updating](/light-node/sx-edition#updating) を参照してください。

## アクセス方法 {#how-to-access}

| | メインネット | テストネット |
| --- | --- | --- |
| チェーン | `qorechain-vladi`（チェーン `v3.2.5`） | `qorechain-diana`（チェーン `v3.2.6`） |
| ノード用 RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| クエリ用 REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| ライトノードのリリース | 3.1.12 | 3.1.12 |
| ライセンス | $50、Dashboard で購入。付与は手動でバッチごとに署名 | 無料、セルフサービス: **Nodes & Validators > Light Node**、**Request licence**。自動で署名され、通常は数分以内 |

**登録に必要なもの**

- リカバリーワードを自分で保持しているアカウント（自分のワード、Keplr、または `qorechaind` の鍵）。できればノード専用のもの。シードをエクスポートしない限り、Dashboard のカストディアルウォレットではノードを実行できません。
- そのアドレスに対する有効な `lightnode_operator` ライセンス（下記を参照）。
- そのアドレスから**ボンドされた**バリデーターに、合計で少なくとも **1,000 QOR** が委任されていること。
- **1 QOR** の登録手数料とトランザクション手数料のための、アカウント内の QOR。ハートビートは、デフォルトの上限 300,000 ガスでガスあたり 0.25 uqor、つまり上限として 0.075 QOR かかります（実測のガス使用量は約 165,000）。
- 起動し続けるコンピューター: ノードは 1,000 ブロックごとにハートビートを送信し、報酬を受け取るには少なくとも 80% のアップタイムを維持する必要があります。

**ライセンスの取得。** Dashboard で **Nodes & Validators**（以前は **Tools** と呼ばれていたサイドバーの項目。ページ自体は引き続き `/tools` にあります）を開き、**Light Node** タブを選び、ヘッダーでネットワークを選択します。Dashboard にはサインインが必要です。

- *メインネット:* 最初に `qor1...` アドレスを入力し、USDT ネットワークを選んで $50 を支払います。チェーンが付与を確認するまで、タブには **Paid, awaiting on-chain grant** と表示されます。
- *テストネット:* 販売はありません。**Free testnet licence** の下に `qor1...` アドレスを入力し、**Request licence** を選択します。リクエストはアカウントごとに1回、アドレスごとに1回です。ライセンスが付与されるとタブに "Granted to ..." と表示され、付与に署名できなかった場合はその旨が表示され、再度リクエストできます。

ライセンスは直接確認することもできます: `GET /qorechain/license/v1/check/<address>/lightnode_operator`。

### 報酬プログラムのステータス {#reward-program-status}

:::note 登録は開放されています
登録はメインネット（`qorechain-vladi`、チェーン v3.2.5）とテストネット（`qorechain-diana`、チェーン v3.2.6）で開放されています。2026年10月27日時点で、メインネットでは7件の `lightnode_operator` ライセンスが付与されており、各ネットワークで1つずつライトノードが登録されています（両方で `GET /qorechain/lightnode/v1/stats` の `total_registered` は `1`）。報酬の会計処理は、v3.2.0 アップグレード以降、両ネットワークで稼働しています。アップタイムは**ノードが登録されたブロックから**カウントされるため、事前にノードを動かしていてもクレジットは得られません。チェーン v3.2.4 以降は、ノードごとの上限もそのノード自身の登録時から始まります。登録後の最初の決済でクレジットされるのは、その時点以降に蓄積された分のみです。

リリースマニフェスト（`https://download.qore.host/<net>/lightnode/latest.json`）は、その `registration.open` フィールドで公式のシグナルを示します。ライブの状態については、`https://api.qore.host`（メインネット）または `https://api-testnet.qore.host`（テストネット）で `GET /qorechain/license/v1/holders/lightnode_operator` と `GET /qorechain/lightnode/v1/stats` をクエリしてください。
:::

## 3% のライトノード報酬分配 {#the-3-light-node-reward-share}

QoreChain の手数料分配は、**固定の 3% 分配をライトノードに**割り当てます（`reward_share` パラメータ、`0.03`）。完全な 37% / 30% / 20% / 10% / 3% の内訳（バリデーター、バーン、トレジャリー、ステーカー、ライトノード）については [Tokenomics](/architecture/tokenomics) を参照してください。

この 3% はライトノードのモジュールアカウントに支払われる額であり、ノードごとの受給権ではありません。100 ブロックごとに、チェーンは各適格ノードに対し、前回の決済以降に蓄積された額のうちステーク加重の分配分をクレジットし、これには**ノードごとに上限**が設けられています。チェーン v3.2.3 以降、この上限は**ノードあたり 30 日ごとに 2,000 QOR**（`max_reward_per_month_per_node`、`2000000000` uqor）で、前回の決済以降に経過したブロック時間に応じて按分され、ノードのアップタイムに応じてスケールされます。これが `lightnode-monthly-cap` ルールです。v3.2.3 より前は、上限はブロック単位（`max_reward_per_block_per_node`、`1713` uqor）で定められており、報酬プールのクエリは現在もこの値を報告します。この上限はあくまで天井であり、約束された金額ではありません。獲得されなかった分は、ガバナンス投票でのみ解放できる準備金に移されるため、最初に登録した者のためにプールが積み上がることはありません。ライブの分配状況は `GET /qorechain/lightnode/v1/reward_pool` で確認できます。

報酬の対象となるには、ライトノードが**オンチェーンで登録され、アクティブ**（ハートビートでライブネスを証明）であり、最低限のボンドステークを保有し、アップタイムを最低値以上に維持している必要があります。登録は [Registration and Licensing](/light-node/registration-and-licensing) で、クレジット、請求、監視は [Rewards and Monitoring](/light-node/rewards-and-monitoring) で扱われます。

## 公開場所 {#where-published}

| 内容 | 場所 | 現在のバージョン |
| --- | --- | --- |
| リリースマニフェスト、メインネット | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12（`minCompatible` 3.1.9、登録は開放） |
| リリースマニフェスト、テストネット | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12（`minCompatible` 3.1.9、登録は開放） |
| バイナリ | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | リリースごとに12ファイル（SX と UX、Linux、macOS、Windows、amd64 と arm64）と `SHA256SUMS` |
| ソースとリリース | `github.com/qorechain/qorechain-lightnode`（Apache 2.0） | リリース `v3.1.12`（現行）と以前のタグ。それぞれに12個のバイナリ、`SHA256SUMS`、`lightnode-build.json`、Android プレビュー APK が付属 |
| Android | GitHub リリースにのみ添付 | プレビュー: チェーンを追跡するが、登録せず、報酬も得ない |
| Docker | `ghcr.io/qorechain/qorechain-lightnode-sx` と `ghcr.io/qorechain/qorechain-lightnode-ux`、公開、タグは `latest` と `v<version>`（[SX Edition: Docker](/light-node/sx-edition#docker)を参照） | `v3.1.12` |

この表に頼らず、ダウンロードの前にお使いのネットワークのマニフェストにある `version` を確認してください。リリース署名鍵はバイナリに組み込まれており、ご自身でインストールするものはありません。

## 制限事項と既知の問題 {#limits}

- **プロトコルのライトクライアントではありません。** ノードは、エンドポイント間でブロックハッシュを照合します。コミット署名、バリデーターセットの変更、トラスト期間は確認しないため、チェーンのコンセンサスを検証するものではありません。設定の `trust_period` と `max_clock_drift` は受け付けられますが、使用されません。
- **報酬は天井です。** ノードごとの上限（30 日で 2,000 QOR）は最大値であり、ノードに支払われるのは、プールに蓄積された分のみで、かつ適格である間だけです。
- **ハートビートはライブネスの署名です。** オペレーター鍵が時間通りに署名したことを証明するものであり、ソフトウェア全体が継続して動作していたことを証明するものではありません。
- **評判の警告は、今のところテストネット限定です。** メインネットは（v3.2.5 でも）まだバリデーターごとの評判スコアを提供していないため、メインネットではこの1つのチェックは実行されず、ノードはその旨をログに記録します。ジェイル、アクティブセット外、ステーク不足の警告はこれに依存しません。3.1.11 より前のノードバージョンは、評判チェックの失敗を5分ごとにログに記録し、何についても警告しませんでした。
- **自己アップデートは 3.1.11 から始まります。** 3.1.10 以前のノードは自己アップデートせず、3.1.12 を一度手動でインストールする必要があります。コンテナや書き込めないフォルダーでは、ノードは新しいリリースを通知するだけです。
- **Docker のノードは自己アップデートしません。** 新しいリリースは通知されるだけで、アップデートは `docker compose pull && docker compose up -d` です。
- **Android はプレビュー**であり、登録も報酬の獲得もできません。
- **ライセンス。** メインネットの付与は手動でバッチごとに署名されるため、支払いから登録までに待ち時間があります。テストネットのライセンスは、アカウントごとに1つ、アドレスごとに1つに限られます。
- **Dashboard で作成したウォレットではノードを実行できません。** シードをエクスポートした場合を除きます。ノードは、あなたが保持する鍵で署名する必要があるためです。

## 次に進む先

- [SX Edition](/light-node/sx-edition): サーバーデーモンのインストール、設定、実行。
- [UX Edition](/light-node/ux-edition): Web ダッシュボードエディションの実行。
- [Registration and Licensing](/light-node/registration-and-licensing): ライセンスを取得し、オンチェーンで登録します。
- [Rewards and Monitoring](/light-node/rewards-and-monitoring): 3% の分配がどのようにクレジットされ請求されるか、そしてノードを健全に保つ方法。
- [Tokenomics](/architecture/tokenomics): ライトノードの報酬分配が、より広い経済にどのように適合するか。
