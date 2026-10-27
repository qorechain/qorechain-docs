---
slug: /developer-guide/running-a-validator
title: バリデータの運用
sidebar_label: バリデータの運用
sidebar_position: 9
---

# バリデータの運用

このガイドでは、QoreChain ネットワーク上でバリデータを作成する方法、プール分類の設計、PQC 鍵（ハイブリッド ML-DSA-87 署名、FIPS 204）の登録方法、そしてノードの監視方法について説明します。

:::note
このガイドは、2026年6月7日から稼働しているメインネット **`qorechain-vladi`**（EVM チェーン ID **9801**）を対象としており、ノードリリース **v3.2.4**（2026年10月23日にガバナンス提案 13 によりブロック高 3,742,566 で適用。その前の v3.2.3 は2026年10月20日にブロック高 3,662,051 で適用）で稼働しています。本稿執筆時点で、バリデータは v3.2.4 バイナリを実行している必要があります。メインネットのガバナンス提案 14 はブロック高 3,906,833 で v3.2.5 を適用するもので、その時点ではマニフェストにインストールすべきバイナリが示されます（[ノードの運用: アップグレード](/developer-guide/running-a-node#upgrades)を参照）。本番稼働前のセットアップのリハーサルには、v3.2.6 を実行しているテストネット **`qorechain-diana`**（EVM チェーン ID **9800**、2026年10月27日に適用。その前の v3.2.5 は10月26日）の利用を推奨します。対象ネットワークに応じて `--chain-id` を適宜置き換えてください。ブロック時間はネットワークによって異なります。メインネットで約 3.1 秒（2026年10月27日に直近 1,000 ブロックに 52 分 21 秒を要しました）、テストネットで約 1.3 秒で、どちらも変動するため、ブロック数はネットワークごとに時間へ換算してください。
:::

:::caution ソースビルドではなくリリースバイナリを使用してください
バリデータは、ライブのマニフェスト（`https://download.qore.host/mainnet/latest.json`。[ノードの運用](/developer-guide/running-a-node#fetch-the-manifest)を参照）に記載された**リリース版の `qorechaind`** を実行する必要があります。公開ソースからビルドしたバイナリにはスタブのキーパーしかなく、ポスト量子署名機能もありません。そのためネットワークのコンセンサス状態を再現できず、`create-validator` やその他すべての Cosmos レーンのトランザクションに必要なハイブリッド署名も作成できません（[ソースからのビルド](/developer-guide/building-from-source)を参照）。v3.2.3 以降、公開ソースからビルドしたバイナリは公開ネットワーク上ではそもそも起動しません。新規のメインネットノードには v3.2.0 以降が必要です。v3.2.1 以降ではノードの時計が 60 秒以上ずれると停止するため、システムクロックは NTP で同期してください。
:::

:::note このページのうち稼働中の部分
ブロック生成には標準のステーク加重バリデータローテーションが使われ、スラッシングとガバナンスには、以下に示すパラメータを持つ標準の Cosmos SDK モジュールが使われます。トリプルプール CPoS ロジック（プール分類、プール加重によるプロポーザー選出、ボンディングカーブ、段階的スラッシング）は `x/qca` モジュールに実装されており、そのパラメータもオンチェーンにありますが、**ブロック生成、報酬、スラッシングにはまだ接続されていません**。これらのトピックの節は設計を説明するものです。現時点でプールへの所属や評判によってブロック提案の割合や報酬が変わることを前提に計画しないでください。
:::

---

## 前提条件

* 完全に同期済みのリリース版 `qorechaind` ノード（[メインネットへの接続](/getting-started/connecting-to-mainnet)を参照。リハーサルには[テストネットへの接続](/getting-started/connecting-to-testnet)を参照）
* オペレーターアカウントに**登録済みの ML-DSA-87 PQC 鍵**があること（[PQC 鍵の登録](#pqc-key-registration)を参照）— `create-validator` にはハイブリッド署名が必要です
* 初期自己委任のために少なくとも **100,000 QOR**（100,000,000,000 uqor）を保有する資金入りアカウント — この最小額はオンチェーンで強制されており、これを下回ると `create-validator` は拒否されます
* オペレーターアドレスに有効な **`validator_operator` 付与**があること。付与はダッシュボードの **Nodes & Validators** ページの [Validator Program](/dashboard/tools-hub#validator-application) を通じて発行されます（申請し、選考を通過し、$1,000 のプログラム手数料を支払う）。詳細は下記の注記を参照してください。付与がない場合、どれだけ多くの QOR を自己ボンドしても `create-validator` は `ErrUnauthorized` で失敗します
* [ステーキングとデリゲーション](/user-guide/staking-and-delegation)モデルへの理解

---

## ネットワークへの参加 {#joining}

**参加の標準的な方法としてステートシンクを使用してください。** ステートシンクは、ジェネシスからすべてのブロックを再生する代わりに、ブロックを再生せずにピアから最近のアプリケーション状態を取得します。スナップショットのダウンロードはあくまで代替手段です。メインネットのマニフェストのスナップショットは依然として 2026年8月21日のアーカイブ（ブロック高 1,966,629、約 27 GB）で、これはいくつかのアップグレードより前のものであり、その後約 2 か月分のブロックを再生することになります。テストネットはスナップショットをまったく公開していません。

1. マニフェストが指定するリリース版 `qorechaind` をインストールし（[ノードの運用](/developer-guide/running-a-node#fetch-the-manifest)を参照）、`qorechaind init <moniker> --chain-id qorechain-vladi` を実行したうえで、そこに記載されているとおりにマニフェストのジェネシス、ピア、シードを配置し、`app.toml` に `minimum-gas-prices = "0.1uqor"` を設定します。
2. マニフェストからトラストポイントを取得し、`config.toml` の `[statesync]` セクションを書き込みます。

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUST_HEIGHT>
trust_hash = "<TRUST_HASH>"
trust_period = "168h0m0s"
```

3. 任意でディスク使用量を小さく保ちます（[ハードウェア](#hardware)を参照）。`app.toml` で `pruning = "custom"` を `pruning-keep-recent = "100000"` と `pruning-interval = "10"` とともに設定し、`config.toml` の `[tx_index]` で `indexer = "null"` を設定します（バリデータはトランザクションの検索を提供しません。クエリを行うノードでは `null` を使用しないでください）。
4. `qorechaind start --minimum-gas-prices=0.1uqor` で起動し、`catching_up` が `false` になるまで待ちます。

:::warning ステートシンクには2つの異なる RPC サーバーが必要です
ステートシンクは、トラストポイントを **2 つの** RPC サーバーに照らして相互検証します。マニフェストの `stateSync.rpcServers` は `https://rpc.qore.host` を**2回**列挙しています（テストネットのマニフェストも `https://rpc-testnet.qore.host` を2回列挙しています）。同一のエントリが2つあると個数の要件は満たしますが、両方の応答が同じサーバーから来るため、相互検証の意味がなくなります。自分で運用する、または独立して信頼できる2つ目の RPC を追加し、開始前にトラストハッシュを2つ目の情報源と照合してください。たとえば `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash` の出力が `$TRUST_HASH` と一致する必要があります。マニフェストのトラストポイントは1時間ごとに更新されるため、古くなった場合は再取得してください。
:::

システムクロックは NTP で同期してください。v3.2.1 以降では、ノードの時計が 60 秒以上ずれると停止します。

---

## ネットワークパラメータ {#parameters}

これらの値は、2026年10月27日にメインネットの REST API（`qorechain-vladi`、v3.2.4）から読み取ったものです。依存する前に、必ずライブで読み取ってください。`qorechaind query staking params`、`qorechaind query slashing params`、または `GET /cosmos/staking/v1beta1/params` と `GET /cosmos/slashing/v1beta1/params` を使用します。

| 項目 | 値 |
| --- | --- |
| アクティブセットのサイズ（`max_validators`） | 100（現在ボンドされているバリデータは 8、ジェイルされているものはなし） |
| アンボンディング期間 | 1,814,400 秒（21日）。デリゲーターごとにアンボンディングエントリは最大 7 件（`max_entries`） |
| 最小コミッション率（`min_commission_rate`） | 0（`commission-max-rate` を上限として、ご自身でレートを選べます） |
| 署名済みブロックのウィンドウ | 10,000 ブロック（`signed_blocks_window`） |
| ウィンドウ内での最低署名率 | 0.05。したがって、ウィンドウの 5% 未満しか署名しなかったバリデータはジェイルされます |
| ダウンタイムのジェイル / スラッシュ | 600 秒のジェイル、ステークの 1% をスラッシュ |
| 二重署名のスラッシュ | ステークの 5% |
| バリデータ作成に必要な自己ボンドの下限 | **100,000 QOR**（`100000000000uqor`）。オンチェーンで強制され、これを下回ると `create-validator` はコード 18 で失敗します |
| オペレーター付与 | 送信者に有効な `validator_operator` 付与が必要です。ない場合、`create-validator` は `ErrUnauthorized` で失敗します |
| 手数料の下限 | ガス 1 あたり 0.1 uqor |

**操作の順序。** 次の順序で行ってください。(1) アカウントの PQC 鍵を登録する、(2) `validator_operator` 付与を取得する、(3) `--generate-only` で `create-validator` を構築し、`tx pqc cosign` で署名する。鍵が最初に来るのは、登録済みの鍵がないアカウントは登録そのものしか送信できないためで（[PQC 鍵の登録](#pqc-key-registration)を参照）、付与は `create-validator` の実行時にチェックされます。詳細は[バリデータの作成](#validator-license-gate)と [PQC 鍵の登録](#pqc-key-registration)にあります。

:::caution `min-self-delegation` は 100,000 QOR の下限ではありません
ジェネシスバリデータは、オンチェーンで `min_self_delegation` = `1`（1 uqor）と表示されます。これは下限では**ありません**。彼らのジェネシストランザクションは下限の対象外でした。`validator.json` の `min-self-delegation` フィールドは、少なくともその額を自己ボンドし続けるというご自身の約束であり、100,000 QOR の下限とは無関係です。下限は、バリデータを作成するときに自己委任する `amount` に適用されます。
:::

---

## ハードウェア {#hardware}

稼働中のメインネットのバリデータで測定した値（2026年10月27日）: 通常負荷で RAM 約 3.2 から 3.5 GB、CPU 10% 未満。バリデータは 3 から 4 vCPU、8 から 16 GB の RAM、NVMe ストレージで余裕を持って動作します。コア数よりもシングルコアの速度のほうが重要です。ML-DSA-87 署名の検証はトランザクション検査の作業の約半分を占め、負荷時にピークになります。

| 項目 | 推奨されるバリデータ構成 |
| --- | --- |
| CPU | 4 vCPU、高クロック |
| RAM | 16 GB |
| ディスク | 100 GB 以上、NVMe |
| クロック | NTP で同期（上記の 60 秒のルール） |
| ネットワーク | 外部に開放するのは P2P の `26656` のみ。RPC、REST、EVM は localhost にバインド |

ディスク使用量は参加方法によって異なります。`pruning = "custom"`（keep-recent 100000）と `indexer = "null"` でステートシンクにより参加したバリデータは、2 か月後に約 10 GB を使用します。ジェネシスから稼働しているデフォルトのプルーニングのノードは、4 か月後に約 100 から 130 GB を使用します。[ノードの運用](/developer-guide/running-a-node#recommended-hardware)で RPC ノードに推奨されている 500 GB 以上は、バリデータには十分すぎる容量です。

---

## ネットワークの運営方法 {#network-organisation}

2026年10月27日時点で、ネットワークには 8 つのアクティブなバリデータがあり、複数の国と複数のホスティングプロバイダーに分散しています。公開エンドポイント（`rpc.qore.host`、`api.qore.host`、`evm.qore.host`、`svm.qore.host`）は、エッジネットワークの背後にある専用の非バリデータノードによって提供されており、バリデータが提供することは決してなく、バリデータの IP アドレスは DNS では公開されていません。投票権はボンドされたステークに従います。最小の自己ボンドで参加した新しいバリデータは、小さな割合の投票権から始まり、委任が集まるにつれて増えていきます。

---

## バリデータの作成

### オペレーター付与: `validator_operator` {#validator-license-gate}

`create-validator` は、いずれもオンチェーンで強制される2つの独立したチェックによってゲートされており、両方を満たす必要があります — 大きな自己ボンドだけでは不十分です。

1. **100,000 QOR の最小自己ボンド。**
2. **トランザクションを送信するアカウントに有効な `validator_operator` 付与**があること。

この付与は、QoreChain Association が **Validator Program** を通じてオンチェーンで発行します。ダッシュボードの **Nodes & Validators** ページ（[Tools Hub](/dashboard/tools-hub#validator-application)）で申請し、14日間の試験期間中に diana テストネットでバリデータを稼働させ、選考を通過したら **$1,000 のプログラム手数料** を支払ってください。その後、申請書に記載したオペレーターアドレスに対して付与がバッチ単位で署名されます。ご自身の付与は `GET /qorechain/license/v1/check/{grantee}/validator_operator` で確認できます。ライセンスの `expires_at` は日付や期間ではなく**ブロック高**であり、`0` は無期限を意味します。ライセンスが存在しない、または期限切れの場合、どれだけ自己ボンドしても `create-validator` は `ErrUnauthorized` で失敗します。これは、資金は十分にあるのに原因が分かりにくい失敗として最も多い理由です。このゲートが存在するのは、EVM 実行レーンではこれを検知・強制できないためです（そこに単一の ante デコレータを置いてしまうと完全に迂回されてしまいます）。これは、ステーキングと検証が Native レーンに限定されている理由の一つでもあります。

`validator.json` ファイルを作成します（フラグ形式は現行の SDK では削除されました）。

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

次に、トランザクションを生成して署名します（他の Cosmos レーンのトランザクションと同様にハイブリッド署名が必要です。[トランザクションコマンド](/cli-reference/transaction-commands#hybrid-signing)を参照）。

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

ネットワークの手数料下限は**ガス1単位あたり 0.1 uqor** のため、ガス上限 600,000 には少なくとも 60,000 uqor が必要です。

| `validator.json` のフィールド     | 説明                                                |
| ------------------------------ | -------------------------------------------------- |
| `amount`                       | 自己委任額 — **最小100,000 QOR**（`100000000000uqor`） |
| `pubkey`                       | バリデータのコンセンサス公開鍵（ed25519）             |
| `moniker`                      | バリデータの人が読める名前                            |
| `commission-rate`              | 初期コミッション率（例: 0.10 = 10%）                  |
| `commission-max-rate`          | 最大コミッション率（作成後は変更不可）                 |
| `commission-max-change-rate`   | コミッション率の1日あたりの最大変更幅                  |
| `min-self-delegation`          | 少なくともこの額を自己ボンドし続けるという運営者自身のコミットメント（uqor 単位）。オンチェーンの 100,000 QOR の下限では**ありません**（下限は `amount` に適用されます） |

トランザクションが確定したら、バリデータを確認します。

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## プール分類

:::note 設計段階であり、ブロック生成ではまだ有効ではありません
以下のプール分類は `x/qca` の設計です。そのパラメータはオンチェーンにあります（`qorechaind query qca config`）が、ブロックプロポーザーはまだプールによって選ばれておらず、プールはまだ報酬やスラッシングを変更しません。
:::

QoreChain の `x/qca`（Quantum Consensus Allocation）モジュールは**3プール分類システム**を定義しています。**1,000ブロック**ごと（メインネットの 3.1 秒ブロックで約52分）に、バリデータはその評判とステーク量に基づいて3つのプールのいずれかに再分類されることになっています。

| プール                                | 基準                                                | ブロック配分   |
| ------------------------------------ | -------------------------------------------------- | ------------- |
| **RPoS**（Reputation Proof-of-Stake） | 評判が70パーセンタイル以上 かつ ステーク量が中央値以上 | ブロックの40% |
| **DPoS**（Delegated Proof-of-Stake）  | 総委任額が10,000 QOR以上                            | ブロックの35% |
| **PoS**（Proof-of-Stake）             | それ以外のすべてのアクティブなバリデータ              | ブロックの25% |

設計上、各プール内では、実効ステーク量に比例する加重ランダム選出によってブロックプロポーザーが選ばれ、高評判のバリデータと高委任額のバリデータの双方が公平に代表される一方で、小規模なバリデータの参加も可能になります。

### プール設定の照会

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

JSON-RPC 経由の場合:

> **まだ提供されていません:** リリース済みのどのノードビルドも `qor_` JSON-RPC ネームスペースを提供していないため、この呼び出しは現在、すべての公開エンドポイントで `-32601`（method not found）を返します。[`qor_` ネームスペース](/api-reference/json-rpc-qor_-namespace)を参照してください。

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## ボンディングカーブ

:::note 設計段階であり、まだ有効ではありません
ボンディングカーブは `x/qca` に実装されていますが、まだ報酬分配には接続されていません。現在のステーキング報酬は標準のディストリビューションモジュールに従います。以下の式は設計です。
:::

バリデータへのステーキング報酬は、複数の要因を組み込んだボンディングカーブによって決定されるように設計されています。

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| 変数     | 説明                                                        |
| -------- | ---------------------------------------------------------- |
| `R`      | 報酬額                                                      |
| `beta`   | 基本報酬率                                                  |
| `S`      | 実効ステーク量                                              |
| `alpha`  | ロイヤルティ係数                                            |
| `L`      | ロイヤルティ期間（継続ステーキング時間）                      |
| `Q(r)`   | 評判品質係数、範囲 \[0.75 - 1.25]                            |
| `P(t)`   | プロトコルフェーズ乗数（ネットワークのライフサイクルに応じて調整） |

**要点:**

* **ロイヤルティ期間ボーナス:** 設計では、継続ステーキング時間に対する対数項が加えられます。
* **評判品質係数:** 0.75（評判が低い）から1.25（評判が高い）の範囲を取ります。評判の計算式の重みはオンチェーンにあります（`qorechaind query reputation params`）。
* **プロトコルフェーズ乗数:** ネットワークがブートストラップ期、成長期、成熟期といった各フェーズを経るにつれて調整されます。

---

## スラッシング {#slashing}

基本的な違反ペナルティは、次のコマンドでライブに照会でき、本記事執筆時点の内容は以下のとおりです。

```bash
qorechaind query slashing params
```

| パラメータ | 値 |
| --- | --- |
| 署名済みブロックのウィンドウ | 10,000ブロック（メインネットで 1ブロック 3.1 秒の場合は約8.7時間。テストネットではより短い） |
| ウィンドウ内での最低署名率 | 5%（`min_signed_per_window` = 0.05）: 直近10,000ブロックのうち署名したのが **5%未満**、つまり95%超を見逃した場合にバリデータはジェイルされます |
| ダウンタイムジェイル期間 | 600秒（10分） |
| ダウンタイムのスラッシュ率 | ステークの1% |
| 二重署名のスラッシュ率 | ステークの5% |

ジェイルは固定10分のタイムアウトと固定ペナルティです。アンボンディングには21日（1,814,400秒）かかり、アクティブセットは最大100バリデータ（`max_validators`）で、各デリゲーターが持てるアンボンディングエントリは最大7件（`max_entries`）です。以下の段階的モデルは別個の設計であり、繰り返される違反に対して追加のエスカレートするペナルティを積み重ねるものですが、まだ接続されていません。

## 段階的スラッシング

:::note 設計段階であり、まだ有効ではありません
段階的スラッシングは `x/qca` に実装されていますが、スラッシングには接続されていません。実際に適用されるペナルティは、上の表にある標準の `x/slashing` の値です。以下のパラメータは設計です（`qorechaind query qca config`）。
:::

段階的スラッシングの設計は、違反を繰り返す者へのペナルティを段階的に強めつつ、時間の経過によってバリデータが回復できるようにするものです。

```
penalty = base_rate * escalation^effective_count * severity
```

| パラメータ                | 値              |
| ------------------------- | -------------- |
| 1イベントあたりの最大ペナルティ | ステークの33%   |
| 減衰半減期                 | 100,000ブロック |
| ダウンタイムの深刻度         | 1.0            |
| 二重署名の深刻度            | 2.0            |
| ライトクライアント攻撃の深刻度 | 3.0            |

1. **各違反は実効カウントを増加させます。** ダウンタイムや二重署名などの違反が発生するたびに、バリデータの実効カウントが増加し、以後のペナルティに影響します。

2. **ペナルティは指数関数的に増大します。** 上記の式に基づき、実効カウントに応じてペナルティが段階的に強まるため、違反を繰り返すバリデータははるかに大きなペナルティを受けます。

3. **実効カウントは時間とともに減衰します。** 実効カウントは半減期100,000ブロック（メインネットの 3.1 秒ブロックで約3.6日間）で減衰するため、一定期間良好な状態を維持したバリデータは回復できます。

4. **単発の違反と繰り返しの違反。** 単発の偶発的なダウンタイムは軽微なペナルティで済みますが、違反が繰り返されると指数関数的に増大する結果を招きます。

---

## PQC 鍵の登録 {#pqc-key-registration}

`create-validator` の実行**前**に、できるだけ早く **ポスト量子暗号（PQC）公開鍵**（ML-DSA-87）を登録してください。[Validator Readiness](/dashboard/tools-hub#validator-application) パネルは、申請した時点からこれを確認します。これは**任意ではなく、また自動でもありません**。チェーンはすべての Cosmos レーンのトランザクションにハイブリッド PQC 署名を要求し、`MsgCreateValidator` は例外対象のメッセージタイプには含まれていません。また、鍵を自動的に登録するアカウントは存在せず、登録は明示的なトランザクションであり、バリデータ運営者を含むすべてのアカウントが事前に自分で送信する必要があります。まず鍵を生成します。

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` は **所有証明**（proof of possession）を添付します。鍵が `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)` に署名し、チェーンがそれを検証するため、秘密鍵を保持していない公開鍵は誰も登録できません。v3.2.3 では任意ですが、推奨されます。v3.2.4 以降（メインネットでは 2026年10月23日から、テストネットでは 2026年10月19日から）は、アカウントレコードに証明が検証されたかどうかも報告されます（`GET /qorechain/pqc/v1/account/{address}` の `possession_proven`）。

:::note v3.2.3 で鍵登録について変わった点
* 登録済みの鍵を**持たない**アカウントが送信できるのは、登録そのものだけです。ハイブリッド署名拡張を含むその他のトランザクションはすべて拒否されます。まず登録し、それ以外はすべて `tx pqc cosign` で署名してください。
* `classical_only` の鍵、空の鍵、縮退した（degenerate）鍵は登録時に拒否されます。
* アカウントが鍵を保持した後は、それ以降の鍵のメンテナンス（ローテーション、移行、再登録）自体もハイブリッド署名が必要であり、`authz` 経由では送信できません。
* `tx pqc gen-key` は既存の鍵ファイルを決して上書きしません。
:::

| パラメータ      | 説明                                              |
| -------------- | ------------------------------------------------- |
| `dilithium5`   | アルゴリズム（ML-DSA-87）                           |
| `<pubkey-hex>` | 16進エンコードされた2592バイトの ML-DSA-87 公開鍵     |
| `hybrid`       | 鍵タイプ（hybrid = 従来型 + PQC の両方）             |

（`qorechaind tx pqc register-key <pubkey-hex> hybrid` は Dilithium-5 向けの同等のレガシー形式です。）

:::caution `--gas` を明示的に指定してください
ML-DSA-87 の公開鍵は2,592バイトあり、これをオンチェーンに書き込むとデフォルトの200,000ガス上限を超える場合があります（メインネットでの登録では 220,000 から 350,000 ガスが使われています）。`--gas 600000`（またはそれ以上）を指定しない場合、トランザクションは不可解な `out of gas` エラーで失敗することがあります。手数料はガス上限に 0.1 uqor を掛けた額以上である必要があるため、`--gas 600000` には `--fees 60000uqor` 以上が必要です。
:::

登録を確認します。

```bash
qorechaind query pqc account <account-address>
```

`~/.qorechaind/pqc/` 配下の鍵ファイルは、アカウントのポスト量子署名鍵です。ニーモニックと同様にバックアップし、可能な限りコンセンサス鍵を実行するマシンには置かないでください。復旧とローテーションについては[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)を参照してください。

---

## モニタリング

### Prometheus メトリクス

QoreChain はポート **26660** で Prometheus メトリクスを公開しています。

```
http://localhost:26660/metrics
```

`config.toml` の `[instrumentation]` セクションで `prometheus = true` を設定してエンドポイントを有効にします。ノードはコンセンサスエンジンの標準メトリクス（ブロック高、コンセンサスラウンド、バリデータセット、ピア、メムプール）を公開します。ノードが提供している内容は `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'` で一覧表示できます。バリデータごとの署名の健全性は、ジェイルを決定するのがチェーン自身の記録であるため、チェーンそのものから読み取るのが最も確実です（下記のヘルスチェックを参照）。

### 評判パラメータの照会

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

JSON-RPC 経由の場合:

> **まだ提供されていません:** リリース済みのどのノードビルドも `qor_` JSON-RPC ネームスペースを提供していないため、この呼び出しは現在、すべての公開エンドポイントで `-32601`（method not found）を返します。[`qor_` ネームスペース](/api-reference/json-rpc-qor_-namespace)を参照してください。

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### ヘルスチェック

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## 運用のベストプラクティス

1. **センチネルノード構成を使用する。** バリデータをセンチネルノードの背後で稼働させ、DDoS攻撃から保護します。パブリックネットワークにはセンチネルノードのみを公開してください。

2. **アラートを設定する。** 見逃したブロック、低い稼働率、予期しない再起動に対してアラートを設定します。少数のブロック見逃しは正常な範囲ですが、継続的な見逃しはスラッシングを引き起こします。

3. **高い稼働率を維持する。** 長時間のダウンタイムが続くと、バリデータはジェイルされ（直近10,000ブロックのうち署名したのが5%未満）、スラッシングを受けます。[スラッシング](#slashing)を参照してください。

4. **ソフトウェアを最新に保つ。** QoreChain のリリースを追跡し、速やかにアップデートを適用してください。チェーンアップグレードの際はバリデータコミュニティと連携してください。

5. **鍵を安全に管理する。** バリデータのコンセンサス鍵（`priv_validator_key.json`）を保護し、バックアップはオフラインで保管してください。リモート署名者の利用も検討してください。リモート署名（`priv_validator_laddr`）は `qorechaind` のリリースバイナリでは検証されておらず、ポスト量子モジュールはコンセンサス鍵のタイプ（ed25519）を変更しません。そのため、署名者の構成に依存する前に、必ずテストネットで試してください。可能な限り、オペレーターアカウントの鍵とその PQC 鍵ファイルは、バリデータを実行するマシンには置かないでください。

6. **先に PQC 鍵を登録する。** オペレーターアカウントは、バリデータを作成したり他の Cosmos レーンのトランザクションを送信したりする前に、登録済みの ML-DSA-87 鍵が必要です。

7. **時計の同期を保つ。** NTP クライアントを実行してください。v3.2.1 以降では、ノードの時計が 60 秒以上ずれると停止します。

---

## バリデータコマンドリファレンス

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

ネットワークの手数料下限はガス1単位あたり 0.1 uqor です。登録済みの PQC 鍵を**持たない**オペレーターアカウントは、従来型の署名で `unjail` を送信できます。鍵を登録した後は、すべてのトランザクション（unjail を含む）にハイブリッド署名が必要です。

---

## 接続ネットワークの検証 {#connected-networks}

:::caution 接続ネットワークはまだ有効ではありません
ブリッジモジュールはメインネットとテストネットにデプロイされていますが、**有効なブリッジルートはありません**。37のチェーン設定はすべて `pending` ステータスで、ブリッジバリデータは登録されておらず、ブリッジ操作は一度も作成されておらず、メインネットでは IBC チャネルが開いていません（テストネットには転送チャネルが1つありますが、ブリッジルートではありません）。以下のフレームワークは設計を説明するものであり、現時点で接続ネットワーク上に検証するものはありません。
:::

この設計（チェーンバージョン **v3.1.80** 以降）により、QoreChain バリデータは[ブリッジ](/architecture/bridge-architecture)を通じて接続された各ネットワークの検証も支援できるようになります。これは**ライセンスによってゲートされたオプトイン機能**です。

1. **ライセンスを保有する。** バリデータは対象ネットワーク向けの有効な `validator_<chain>`（または `qcb_bridge`）ライセンスを保有している必要があります。オーケストレータは、ライセンスがなければ外部クライアントの起動を拒否します（フェイルクローズ）。
2. **有効化によりクライアントが自動プロビジョニングされる。** ライセンスが有効化されると、QoreChain は該当ネットワークのクライアントをノード上に自動的にプロビジョニングします。ピン留めされたクライアントのダウンロード、設定のレンダリング、QoreChain のオーケストレーション下での実行が行われます。有効化されるまでは何も取得されません。
3. **対象ネットワークの鍵とステークを用意する。** 外部ネットワークのバリデータ/ステークおよび署名鍵は、ネットワークごとに**運営者が用意するもの**です。QoreChain が提供するのはドライバーフレームワークと強制されるライセンスゲートであり、外部チェーンでのステークそのものではありません。

**37のブリッジネットワーク**すべてに対応するドライバーが存在し、バリデータの参加方法によって以下のように分類されます。

| クラス                     | 参加形態                             | 例                                                                          |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| パーミッションレス・バリデータ | ステークして稼働                     | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| 上限あり／選出制／参加承認制    | ステークするが、上限または選出制の対象 | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera                  |
| L2フルノード                | フルノードを稼働（ステーキングなし）   | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum                        |
| 非ステーキング／トラストリスト | ステーキングなしで観測／参加           | Bitcoin, Filecoin, XRPL, Stellar                                           |

:::note
クライアントバージョンのピン留めはベストエフォートです。本番稼働での有効化の前に、対象ネットワークの上流クライアントのリリースを必ず確認してください。
:::

## 次のステップ

* [ノードの運用](/developer-guide/running-a-node) — リリースバイナリのインストール、ステートシンク、ノード設定
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上でスマートコントラクトをデプロイする
* [ポスト量子署名](/developer-guide/post-quantum-signing) — 鍵の登録、復旧、ローテーション
