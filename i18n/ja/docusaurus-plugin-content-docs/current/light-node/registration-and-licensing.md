---
slug: /light-node/registration-and-licensing
title: 登録とライセンス
sidebar_label: 登録とライセンス
sidebar_position: 4
---

# 登録とライセンス

[ライトノード報酬シェア3%](/light-node/rewards-and-monitoring)を得るには、ライトノードが**オンチェーンで登録**されており、かつ稼働していることを証明し続けている必要があります。このページでは、チェーンが要求する条件、ライセンスの取得方法、ノードが自ら登録する方法、そしてノードが稼働証明(liveness)を行う方法について説明します。

:::note 登録は開始されています
メインネット(`qorechain-vladi`)とテストネット(`qorechain-diana`)で登録を受け付けています。ノードの稼働と同期にライセンスは不要です。現在の状態を確認する方法は[報酬プログラムのステータス](/light-node/overview#reward-program-status)を参照してください。
:::

## オンチェーン登録

登録は、あなたのライトノードをチェーン上に記録し、プロトコルがそのノードの存在、種別(`sx`または`ux`)、そしてどのオペレーターアカウントがそれを制御しているかを把握できるようにします。登録が完了し稼働状態になると、そのノードはライトノード報酬シェアの対象になります。

### 要件 {#requirements}

登録トランザクションの実行時に、チェーンは次のすべてを確認します。

1. オペレーターアドレスに有効な`lightnode_operator`ライセンスがあること。
2. 同じアドレスから**ボンド済み**のバリデータに少なくとも**1,000 QORがデリゲート**されていること(任意のバリデータにわたるあなたの合計。jailされたバリデータやアンボンドされたバリデータへのデリゲーションはカウントされません)。
3. **1 QORの登録手数料**とトランザクション手数料を支払うための、オペレーターアカウントの残高。ノードはこのアカウントからハートビートごとの手数料も支払います。ネイティブ署名の場合、手数料はガス1単位あたり0.25 uqorなので、デフォルトの`[heartbeat] gas`である300,000では75,000 uqor(0.075 QOR)、1日約25回のハートビートで月に約1.9 QORになります。
4. ネットワーク全体で登録済みのライトノードが10,000未満であること。

登録後、ノードは**1,000ブロック**ごとに(猶予100ブロック)ハートビートを送信し、報酬を受け取るには少なくとも**80%の稼働率**を維持する必要があります。現在の値は`GET https://api.qore.host/qorechain/lightnode/v1/params`(テストネット: `https://api-testnet.qore.host`)で確認できます。

### オペレーターアカウント {#operator-account}

登録は**オペレーターアドレス**から行います。これはライセンスとステークを保持し、手数料を支払い、報酬を受け取る通常の`qor1…`アカウントです。ノードがこのアカウントのために署名できる必要があるため、**リカバリーワードをあなた自身が保持している**アカウントでなければなりません。自分で書き留めたワード、Keplrのアカウント、または`qorechaind`のキー(導出パス`m/44'/118'/0'/0/0`)が該当します。ノード専用のアカウントを使うのが最善です。

Dashboard上のカストディアルウォレット(Dashboardがシードを代わりに保管しているウォレット)は、先にそのシードをエクスポートしない限りノードを稼働させることはできません。

ノードのDilithium-5キーには独自のアドレスがありません。QoreChainではポスト量子キーはアカウントに関連付けられるものであり、アカウントを作成するものではありません。ノードは、アカウントにすでにポスト量子キーがある場合を除き([すでにポスト量子キーを持つアカウント](#accounts-with-a-pqc-key)を参照)、自身のキーをオペレーターアカウントのポスト量子キーとして関連付けます。

## ライセンスの取得

### メインネット: Dashboardで購入

ライセンスはQoreChain Dashboardの**Nodes & Validators → Light Node**で購入します(サイドバーの項目は以前**Tools**という名前でした。ページは引き続き`/tools`にあります)。このページにはサインインが必要で、タブはヘッダーで選択したネットワークに従います。ライセンスの価格は **$50** で、ERC-20、BEP-20またはTRC-20上のUSDTで支払います。支払いはそのチェーン上で検証されます。支払う**前に**、ライセンスの付与先となる`qor1…`アドレスを入力する必要があります。上で説明したオペレーターアドレスを使用してください。

付与(grant)は別のオンチェーンのステップで、手動で署名され、バッチで送信されます。チェーンが確認するまで、タブには**Paid, awaiting on-chain grant**と表示され、ノードはそのアドレスにライセンスがないと報告し続けます。`lightnode-sx status`は`Licence:`行を表示し、付与が反映されると`active`に切り替わります。直接確認することもできます。

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### テストネット: 無料でセルフサービス

テストネットでは何も販売していません。テストネットのライセンスは無料です。

1. Dashboardを開き、**Nodes & Validators → Light Node**に進み、ヘッダーでテストネットを選択します。
2. **Free testnet licence**の下に、ノードが署名に使用する`qor1…`アドレス(リカバリーワードをあなたが保持しているアドレスで、Dashboardが作成したウォレットではないもの)を入力し、**Request licence**を選択します。
3. 付与の署名中、タブには「Requested for …」と表示され、その後「Granted to … You can register your node now.」と表示されます。テストネットでの付与は自動的に署名され、通常は数分以内です。付与を署名できなかった場合は、タブにその旨が表示され、再度リクエストできます。

リクエストはアカウントごとに1回、アドレスごとに1回です。メインネットの付与は引き続き手動です(上記参照)。チェーン上での結果は同じです。`GET https://api-testnet.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator`で確認できます。

## ノードの登録

以下の手順はノード自身のセットアップフローです。両エディションで同じです。`lightnode-ux`は`lightnode-sx`と同じコマンドを持ち、同じホームディレクトリ(`~/.qorechain-lightnode`)を使用します。各コマンドの詳細は[SX Edition](/light-node/sx-edition#first-run-onboard)を参照してください。

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

パスフレーズは、ノードのキーリングにある2つのキー、つまりノードのポスト量子キーとオペレーターアカウントのキーの両方を保護します。

### `register`が行うこと

`register`はキーリングから`operator_address`とキーを読み取り、次の処理を行います。

1. **ライセンスを確認します。** `operator_address`が有効な`lightnode_operator`ライセンスを保持しているかをチェーンに問い合わせます。ない場合は停止し、入手先を案内します。このメッセージはDashboardのLight Nodeタブを案内しますが、サイドバーの以前の名前**Tools → Light Node**を使っています。メインネットではそこでライセンスを購入するよう案内し、テストネットではテストネットを選択した状態でそこからリクエストするよう案内します(上で説明したセルフサービスの**Request licence**)。このタブは現在**Nodes & Validators**の下にあります。3.1.9はDashboardの旧タブの名前をまだ挙げていました。期限切れまたは停止中のライセンスはその旨が報告されます。すでに登録済みのノードもその旨が報告され、何も送信されません。
2. アカウントにすでにポスト量子キーがある場合を除き、**ポスト量子キーを関連付けます**。ポスト量子キーを持たないアカウントは、このメッセージ1件だけを従来型の署名で(ハイブリッド拡張なしで)送信できます。ノードはその方法で送信し、チェーンが対応している場合はキーの所有証明を含めます。
3. `--delegate-to qorvaloper1...`でバリデータを指定した場合に限り、**不足しているステークをデリゲートします**。`--delegate-to`がなく、アカウントが最低額に満たない場合は、停止して不足額を表示します。3.1.10以降は、チェーンと同様に**ボンド済み**のバリデータへデリゲートされたステークのみをカウントします。3.1.9はjailされたバリデータやアンボンドされたバリデータもカウントしていたため、チェーン上で拒否されることがありました。3.1.9を実行している場合は、アクティブなバリデータにデリゲートしてください。
4. 1 QORの手数料とともに**ノードを登録します**。

各ステップはノード自身が署名し、次のステップを送信する前にブロックで確認されます。キー登録以降のすべてのトランザクションには、チェーンが要求するハイブリッドML-DSA-87 + secp256k1署名が付きます。

このコマンドは次のフラグを取ります。

- `--delegate-to` — 不足しているステークのデリゲート先となる`qorvaloper1…`バリデータ。
- `--type` — ノード種別。`sx`または`ux`(デフォルトはバイナリのエディション)。
- `--version` — 登録するノードバージョン(デフォルトはバイナリ自身のバージョン)。
- `--print` — 署名する代わりに、同等の`qorechaind`コマンドを出力します(下記参照)。

`register`が署名できるようにするには、アカウントがすでにチェーン上に存在している(資金を受け取ったことがある)必要があります。

### すでにポスト量子キーを持つアカウント {#accounts-with-a-pqc-key}

ウォレットで設定したアカウントは、同じリカバリーワードから導出されたポスト量子キーをすでに持っていることがよくあります。チェーンのv3.2.3ルールでは、チェーンはアカウントに登録されたキーのみを受け付け、`classical_only`タイプのキーや空のキーを拒否します。

3.1.9以降、`keys add-operator --recover`がこれに対応します。アカウントにすでにポスト量子キーがある場合は、wallet-adapterやDashboardと同じ導出方法(`qorechaind tx pqc recover-key`と同じ)でワードからそのキーを再構築し、ノードはそのキーで署名します。アカウントにキーがない場合は、ノードがワードからキーを導出するため、ワードでノードのキーも復元できます。ワードから再現できないポスト量子キーをアカウントが持っている場合(独自のキーを生成・保管するウォレット)、コマンドは拒否し、専用のオペレーターアカウントを使うよう勧めます。

### フォールバック: `qorechaind`キーリング内のオペレーターキー

オペレーターアカウントのキーを`qorechaind`のキーリングに保管し、ノードには保存したくない場合は、手順3を省略して次を実行します。

```bash
lightnode-sx register --print
```

このコマンドは同じライセンスと登録のチェックを行い、各ステップの`qorechaind`コマンドをあなたの値を埋め込んで出力します。ノードキーの`qorechaind`のキーディレクトリへのエクスポート(`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`)、`tx pqc register-key-v2 … hybrid`、ステークが不足している場合の`tx staking delegate`、そして生成してから`tx pqc cosign`するペアとしての`tx lightnode register`です。この経路では、デーモンもハートビートに`qorechaind`を使用します。[`[heartbeat]`の設定](/light-node/sx-edition#configure)を参照してください。

## ハートビート稼働証明

登録だけでは対象資格を維持するには不十分です。登録済みのライトノードは、**ハートビート稼働証明**(heartbeat liveness proofs)を継続的に送信することで、自身がオンラインであることを証明し続けなければなりません。このハートビートによって、チェーンは稼働中のノード(報酬シェアの対象)と、登録はされているがオフラインのノードとを区別します。

実務上これが意味するのは、登録され、稼働し続けている(かつ同期している)ノードは対象資格を維持し続ける一方、オフラインになったノードは稼働証明の送信を停止し、復帰するまで対象資格を失うということです。したがって、デーモンを稼働・健全な状態に保つことは報酬を得るための一部です — ハートビートと同期の健全性を確認する方法については[Rewards and Monitoring](/light-node/rewards-and-monitoring)を参照してください。

### PQC共署名ハートビートパイプライン {#pqc-cosigned-heartbeat-pipeline}

QoreChainは**デフォルトでPQC必須**であるため、すべてのハートビートには**ハイブリッド署名**が付きます。アカウントのポスト量子キーによるML-DSA-87(Dilithium-5)署名と、オペレーターアカウントのキーによるsecp256k1署名です。ノードはLinux、macOS、Windows上でトランザクションを自ら構築して署名し、`qorechaind`は不要です。どのsign-bytesバージョンを使用するかはネットワークから読み取ります。

オンチェーンのハートビートはデフォルトで有効です。デーモンは、チェーン自身が持つそのノードの`last_heartbeat`から1,000ブロック(`[heartbeat] interval_blocks`、チェーンの`heartbeat_interval`に一致)が経過した時点でハートビートを1つ送信し、60秒ごとに確認します。そのため再起動しても重複して送信したり、まる1インターバル待ったりすることはありません。各ハートビートは、ブロックに取り込まれた後にのみ報告されます。

デーモンは起動時に署名者を選択します。

- **ネイティブ** — キーリングにオペレーターキー(`keys add-operator`で追加)があり、それが`operator_address`と一致する場合。これが通常のケースです。
- **`qorechaind`フォールバック** — それ以外の場合で、`qorechaind`バイナリが`PATH`上、または`[heartbeat] qorechaind_path`にある場合。`qorechaind`キーリング内のオペレーターキー(`[heartbeat] key_name`、ホーム`qorechaind_home`、デフォルトは`~/.qorechaind`)と、`pqc/<key_name>.dilithium`にエクスポートされたノードキーを使用します。`qorechaind`のキーリングパスフレーズは`QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`に設定します。これは標準入力経由で`qorechaind`に渡され、コマンドラインに置かれることはありません。

ノードが登録されるまでは、ハートビートを送信しません。代わりに、状態が変わるたびに1回、その理由をログに記録します。ライセンスなし、またはライセンスは有効だが未登録(`register`を実行してください)のいずれかです。`lightnode-sx status`は`Signer:`、`Licence:`、`Registration:`の行を表示するため、ログを読まなくても理由がわかります。署名者がいない場合でも、ノードは稼働と同期を続けます。ただしオンチェーンでアクティブな状態を維持できず、`status`がその旨を表示します。

## DashboardのLight Nodeタブ

QoreChain Dashboardの**Nodes & Validators → Light Node**タブは、これらの手順をひとまとめにしています。

1. **ダウンロード。** 選択したネットワーク向けのライトノードバイナリ(`https://download.qore.host/<net>/lightnode/latest.json`と同じファイルで、sha256チェックサム付き)へのリンクを提供します。
2. **セットアップ手順。** リリースマニフェストのバージョンに合わせた上記の5つの手順と、マニフェストの`registration`フィールドから読み取った登録受付の可否を表示します。
3. **ライセンス**(メインネットは購入、テストネットは無料リクエスト)。メインネットでは支払い前にライセンスのアドレスを受け取り、チェーンが付与を確認するまで**Paid, awaiting on-chain grant**と表示します。テストネットでは**Request licence**フォームを表示します。入力したアドレスがあなた自身のDashboardのカストディアルウォレットであれば警告し、アドレスがすでにポスト量子キーを持っている場合は参考情報として知らせます。
4. **ステータス。** ステータスパネルが、チェーンから読み取ったノードの状態を表示します。

登録そのものは、常に`lightnode-sx register`(または`lightnode-ux register`)が送信するトランザクションです。Dashboardはノードを登録しません。記録を保存するだけだった旧登録フォームは削除されました。

## 次に読むもの

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — 3%シェアがどのように付与され、請求され、監視されるか。
- [SX Edition](/light-node/sx-edition) — `register`コマンドと完全なCLIリファレンス。
