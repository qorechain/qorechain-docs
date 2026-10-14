---
slug: /light-node/registration-and-licensing
title: 登録とライセンス
sidebar_label: 登録とライセンス
sidebar_position: 4
---

# 登録とライセンス

[ライトノード報酬シェア3%](/light-node/rewards-and-monitoring)を得るには、ライトノードが**オンチェーンで登録**されており、かつ稼働していることを証明し続けている必要があります。このページでは、登録の仕組み、ノードが稼働証明(liveness)を行う方法、そしてDashboardを通じてノードのライセンスを取得しオンチェーンで登録する方法について説明します。

:::note 報酬プログラムへの登録はまだ開始されていません
どちらのネットワークでも`lightnode_operator`ライセンスはまだ1件も付与されておらず、登録済みのノードもないため、現時点ではチェーンがすべての登録を拒否します。ノードの稼働と同期にライセンスは不要です。現在の状態を確認する方法は[報酬プログラムのステータス](/light-node/overview#reward-program-status)を参照してください。
:::

## オンチェーン登録

登録は、あなたのライトノードをチェーン上に記録し、プロトコルがそのノードの存在、種別(`sx`または`ux`)、そしてどのオペレーターキーがそれを制御しているかを把握できるようにします。登録が完了し稼働状態になると、そのノードはライトノード報酬シェアの対象になります。

### 要件 {#requirements}

登録トランザクションの実行時に、チェーンは次のすべてを確認します。

1. オペレーターアドレスに有効な`lightnode_operator`ライセンスがあること。
2. 同じアドレスから、バリデータに少なくとも**1,000 QORがボンド**されていること(すべてのバリデータにわたるあなたの合計)。登録する**前に**デリゲートしてください。Dashboardのステーキングページから、または`qorechaind tx staking delegate`で行えます(すべてのトランザクションと同様に、耐量子の共署名も必要です)。
3. **1 QORの登録手数料**とトランザクション手数料を支払うための、オペレーターアカウントの残高。デーモンは、このアカウントからハートビートごとに手数料を支払います(デフォルトはハートビートあたり`50000uqor`、`[heartbeat] fees`)。
4. ネットワーク全体で登録済みのライトノードが10,000未満であること。

### 登録コマンドの生成

登録は**オペレーターアドレス**から行います。これは`qorechaind`(または任意のCosmosウォレット)で作成した、資金のある`qor1…`アカウントで、報酬もこのアカウントが受け取ります。ノード自身のDilithium-5キーにはアドレスがなく、アカウントの耐量子キーになります。アドレスを`config.toml`に`operator_address`として設定し、`key_name`と`chain_id`が[初回起動](/light-node/sx-edition#first-run-onboard)の説明どおりに設定されていることを確認してください(`onboard`はこれらを正しく設定してくれません)。その後、次を実行します。

```bash
lightnode-sx register
```

何かを出力する前に、このコマンドは`operator_address`が有効な`lightnode_operator`ライセンスを保持しているかをチェーンに問い合わせます。ライセンスなしの登録はチェーンに拒否されるため、拒否されるコマンドを渡しても意味がないからです。ライセンスがない場合、次のメッセージで停止します。

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Dashboardで購入したライセンスは別のステップでオンチェーンに付与されるため、購入後しばらくは`register`が「no licence」と表示することがあります。`lightnode-sx status`は同じ`Licence:`行を表示し、付与が反映されると`active`に切り替わります。すでに登録済みのノードは、二重に登録されることなく、その旨が報告されます。

有効なライセンスがある場合、このコマンドはキーリングからノードキーを読み取り、あなたの値を埋め込んだ次の内容を出力します。

1. **一度だけ**実行するコマンド。ノードキーをオペレーターアカウントの耐量子キーとして関連付けます(`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`)。事前に`lightnode-sx keys export`でキーを`qorechaind`のキーディレクトリにエクスポートしておく必要があります。アカウントにすでに耐量子キーがある場合(`GET /qorechain/pqc/v1/account/<address>`が`found: true`を返す場合)は省略してください。出力されたガスリミットが不足した場合は、`--gas 600000 --fees 60000uqor`を付けて再実行してください。
2. 登録そのもの: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`、続いて`qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`。チェーンはすべてのトランザクションに耐量子の共署名を要求するため、登録は「生成してから共署名する」ペアの操作になります。

このコマンドは2つの任意フラグを取ります。

- `--type` — ノード種別。`sx`または`ux`(デフォルトは`sx`)。
- `--version` — 登録するノードバージョン(デフォルトはバイナリ自身のバージョン)。

参加するネットワーク(テストネット`qorechain-diana`またはメインネット`qorechain-vladi`)上で送信してください。登録には、オペレーターアドレスに付与された有効な`lightnode_operator`ライセンスが必要です。ない場合、チェーンは登録を拒否します。

:::note
`lightnode-sx register`はコマンドを**出力する**だけで、あなたがそれを確認・実行するためのものです — 自動的にブロードキャストされることはありません。これにより、ノードがいつ、どのように登録されるかをあなた自身がコントロールできます。
:::

## ハートビート稼働証明

登録だけでは対象資格を維持するには不十分です。登録済みのライトノードは、**ハートビート稼働証明(heartbeat liveness proofs)**を継続的に送信することで、自身がオンラインであることを証明し続けなければなりません。このハートビートによって、チェーンは稼働中のノード(報酬シェアの対象)と、登録はされているがオフラインのノードとを区別します。

実務上これが意味するのは、登録され、稼働し続けている(かつ同期している)ノードは対象資格を維持し続ける一方、オフラインになったノードは稼働証明の送信を停止し、復帰するまで対象資格を失うということです。したがって、デーモンを稼働・健全な状態に保つことは報酬を得るための一部です — ハートビートと同期の健全性を確認する方法については[Rewards and Monitoring](/light-node/rewards-and-monitoring)を参照してください。

### PQC共署名ハートビートパイプライン {#pqc-cosigned-heartbeat-pipeline}

QoreChainは**デフォルトでPQC必須**であるため、ハートビート稼働証明トランザクションは、従来型の署名のみではなく、耐量子(post-quantum)共署名パイプラインを通じて生成されます。デーモンは未署名のハートビートを組み立てた後、ブロードキャスト前に**ハイブリッドDilithium-5(ML-DSA-87)**署名でそれに共署名します — これはチェーンがすべてのトランザクションに対して強制している耐量子姿勢と同一のものです。ノードは`interval_blocks`ウィンドウ(チェーンの`heartbeat_interval`パラメータに対応)ごとに1回ハートビートを送信し、早期送信による拒否を避けるためブロック高に合わせてペースを調整します。

オンチェーンのハートビートはデフォルトで有効です。デーモンには次のものが必要です。設定内の`operator_address`、**v3.2.0以降**の`qorechaind`バイナリ(`PATH`上、または`[heartbeat] qorechaind_path`の場所。タグ`v3.1.4`からビルドされたSX Dockerイメージには同梱されています — それより古い署名者はチェーンに拒否されます)、そしてオペレーターキーとエクスポート済みノードキーを保持する`qorechaind`のホーム(`qorechaind_home`、デフォルトは`~/.qorechaind`)。2つのキーリングパスフレーズを環境変数に設定します。ノードのキーリング用に`QORE_LIGHTNODE_KEYRING_PASSPHRASE`、`qorechaind`のキーリング用に`QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`です(後者は標準入力経由で`qorechaind`に渡され、コマンドラインに置かれることはありません)。`qorechaind`は**Linux amd64向けのみ**公開されているため(`https://download.qore.host/mainnet/latest.json`の`binary`エントリを参照)、macOS、Windows、ARMホストではノードは稼働・同期できますが、ハートビートをネイティブに署名できません。登録済みのノードは、Linux amd64上のSXエディション、またはamd64ホスト上のDockerイメージで稼働させてください。ノードはチェーン自身が持つそのノードの`last_heartbeat`に基づいてペースを調整するため、再起動しても重複して送信したり、まる1インターバル待ったりすることはありません。ノードが登録されるまでは、ハートビートを送信しません。代わりに、状態が変わるたびに1回、その理由をログに記録します。ライセンスなし(購入先の案内つき)、またはライセンスは有効だが未登録(`lightnode-sx register`を実行してください)のいずれかです。`lightnode-sx status`は`Signer:`、`Licence:`、`Registration:`の行を表示するため、ログを読まなくても理由がわかります。署名者がいない場合でも、ノードは稼働と同期を続けます。ただしオンチェーンでアクティブな状態を維持できず、`status`がその旨を表示します。

## Dashboardを通じた登録とライセンス化

QoreChain Dashboardの**Tools → Light Node**タブで、ライセンスの状況を確認し、ノードの詳細を保持できます。ノードを稼働させることと、報酬プログラムに参加することは別のことであり、Dashboardはこの2つを明確に分けています。

1. **ソフトウェアを入手する(ライセンス不要)。** このタブは、選択したネットワーク向けのライトノードバイナリ(`https://download.qore.host/<net>/lightnode/latest.json`と同じファイルで、sha256チェックサム付き)へのリンクを提供し、フルQoreChainノード向けのセットアップパックを表示します。ライトノードに必要なのは`lightnode-sx`または`lightnode-ux`バイナリとRPCエンドポイントだけです。[SX Edition](/light-node/sx-edition)に従ってください。
2. **報酬プログラムのステータスを確認する。** ライトノード報酬シェアへの参加は、別個の、オンチェーンでゲートされたステップです。オンチェーンで付与された有効な`lightnode_operator`ライセンス、少なくとも1,000 QORのボンド(すべてのバリデータにわたるあなたの合計で、ステーキングからライブで読み取られます)、そして1 QORの登録手数料が必要です。**登録受付はまだ開始されていません**([報酬プログラムのステータス](/light-node/overview#reward-program-status)を参照)。ライセンスを購入しても、それによって早期に開始されることはありません。稼働時間は、ノードがオンチェーンで登録されたブロックから数えられ、それ以前は数えられません。
3. **ライセンス。** **Buy License**を通じて購入したライセンスは、まず私たち側で記録されます。それをオンチェーンで認識させる付与処理は別のステップであり、その付与が反映されるまでチェーンは登録を拒否します。購入にはライセンスの付与先となる`qor1…`アドレスが必要で、チェーンが確認するまで**Paid — awaiting on-chain grant**と表示されます。`lightnode-sx status`はオンチェーンの`Licence:`行を表示します。
4. **登録記録。** アカウントが有効として記録されたライセンスを保持している場合、このタブには短いフォーム(オペレーターアドレス、モニカー、公開エンドポイントURL、ステークコミットメントへの同意)と、送信した内容のサマリーも表示されます。これはDashboardにあなたのリクエストを記録するだけで、オンチェーンの登録トランザクションは送信**しません**。
5. **オンチェーンで登録する。** ライセンスが付与され、オペレーターアドレスから1,000 QORがボンドされたら、`lightnode-sx register`と、それが出力する`qorechaind`コマンドで登録します(上記参照)。

Dashboardは、ノードのダウンロード、チェーンの要件とノードの健全性の確認、ライセンスの購入に役立ちます。オンチェーン登録そのものは、常に`lightnode-sx register`トランザクションです。

## 次に読むもの

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — 3%シェアがどのように付与され、請求され、監視されるか。
- [SX Edition](/light-node/sx-edition) — `register`コマンドと完全なCLIリファレンス。
