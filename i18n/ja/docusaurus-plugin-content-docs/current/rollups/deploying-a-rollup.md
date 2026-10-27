---
slug: /rollups/deploying-a-rollup
title: ロールアップのデプロイ
sidebar_label: ロールアップのデプロイ
sidebar_position: 3
---

# ロールアップのデプロイ

アプリケーション専用ロールアップは3通りの方法でセットアップできます。**ダッシュボード**(リクエストフォーム。オンチェーントランザクションではありません)、チェーンの**CLI**(`qorechaind`、オンチェーントランザクションを完全に制御)、または**TypeScript RDK**(`@qorechain/rdk` と `create-qorechain-rollup` スキャフォルダー)を使う方法です。TypeScript RDKは設定、読み取り、そしてポスト量子鍵を渡した場合のハイブリッド署名付きトランザクションを対象としています([RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照)。このページではこの3つすべてに加えて、オペレーターのライフサイクルとバッチコマンドについても解説します。

:::caution 初期段階の機能
どちらのネットワークでも、ロールアップはまだ1つも作成されていません(2026年10月27日確認)。以下のコマンドは **`qorechain-diana`** テストネット(EVMチェーンID **9800**、チェーンバージョン **v3.2.6**。v3.2.4 は2026年10月19日、v3.2.5 は10月26日に高さ8,890,800で、v3.2.6 は10月27日に高さ8,970,638で適用)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**、2026年6月7日から稼働)は、2026年10月23日からチェーンバージョン **v3.2.4** で稼働しています(ガバナンス提案13により、高さ3,742,566で適用)。ガバナンス提案14は高さ3,906,833でv3.2.5を適用する予定で、執筆時点では投票期間中でした。v3.2.5がロールアップに何を変えるかは、メインネットが適用した日に文書化されます。以前のリリースにはいくつかの細部に違いがあり、このページでは「v3.2.4から」と記しています。テストネットは独自のモジュールパラメータを持つステージングネットワークです(たとえば、デフォルトのチャレンジウィンドウはメインネットの604,800秒に対して3,600秒、ロールアップは最大100に対して200)。対象とするネットワークで `GET /qorechain/rdk/v1/params` を読み取ってください。すべてのデプロイはまずテストネットで検証してください。
:::

:::note 手数料と署名
ネットワークは最低ガス価格 `0.1uqor` を強制するため、`--fees 500uqor` だけでは拒否されます。また、ネイティブレーンのトランザクションにはすべてハイブリッドのポスト量子共同署名が必要です。そのため、このページのCLIサンプルでは `--generate-only` でトランザクションを構築し、`qorechaind tx pqc cosign` で共同署名します(これが署名とブロードキャストを行います)。鍵は `qorechaind tx pqc gen-key` で一度作成し、`qorechaind tx pqc register-key` で一度オンチェーンに登録してください(QoreXやSDKを使えば自動で行われます)。手数料は未署名ファイルの生成時に固定されるため、ガスリミットと手数料は一緒に設定してください。手数料はガスリミット × 0.1 uqor 以上である必要があります。以下のガスリミットは目安です — 頼る前にシミュレーションしてください。[最初のトランザクション](/getting-started/first-transaction)と[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。
:::

---

## 要件

| 要件 | 詳細 |
| ----------- | ------- |
| **最低ステーク額** | 最低10,000 QOR(`min_stake_for_rollup`)。ステークはロールアップ作成時にエスクローされます |
| **作成時バーン** | 提供したステークの1 %が作成時に永久にバーンされます(バーンを適用できない作成は拒否されます)。残りはエスクローに保持され、ロールアップが停止された際に返還されます |
| **レイヤー登録ステーク** | 作成時にロールアップのレイヤーがマルチレイヤーモジュールにも登録され、作成者からさらに **1,000 QOR**(`min_sidechain_stake`)がロックされます。これはレイヤーが停止時に廃止される際に返還されます。レイヤーを登録できない場合(残高不足、またはマルチレイヤーのサイドチェーン上限10に到達)でもロールアップは作成されますが、レイヤーを持たないため、そのバッチをアンカーできません |
| **ロールアップID** | 3〜64文字を使用します。小文字の英字、数字、`.`、`_`、`-` が使え、先頭は英字または数字にします。チェーンはv3.2.2以降、両ネットワークでこのルールを強制しており(CLIはトランザクションを構築する前にチェックします)、規則に合わないIDは拒否されます |
| **アカウント** | ポスト量子鍵が登録済みで、ステーク額、レイヤーステーク、トランザクション手数料をまかなうのに十分な残高を持つ、資金の入ったQoreChainアカウント |

デプロイ前に、現在の最低ステーク額とバーン率のライブなモジュールパラメータを照会してください。

```bash
qorechaind query rdk config
```

---

## ダッシュボード経由でのデプロイ(Tools → Rollups)

ダッシュボードは **Tools → Rollups** の下に**ロールアップをデプロイ**フォームを提供します。これは**リクエストフォーム**です。送信すると、あなたのアカウント向けのプロビジョニングリクエストが記録され、**The Qore Trust**がレビューします。新しいリクエストは**provisioning(準備中)**ステータスで表示されます。オンチェーンの `create-rollup` トランザクションをブロードキャストすることは**ありません** — ロールアップをオンチェーンに登録するには、以下のCLIを使用してください。

### 手順

1. **サインインする。** リクエストの送信や既存のリクエスト一覧の表示には認証済みセッションが必要です。
2. **ロールアップに名前を付ける。** ロールアップ名を入力します(2〜41文字:英字、数字、スペース、ハイフン、アンダースコア)。
3. **仮想マシンを選ぶ。** オンチェーンのレコードにはVMのラベルが保存されます。ロールアップは独自のランタイムでオフチェーンで実行されます。この選択はQoreChain自身のEVM、QoreChain Native、SVMレーン上では実行されません。
   * **EVM** — Hardhat、Foundry、MetaMaskなどフルのEthereumツールチェーンを使えるSolidity / Vyperコントラクト
   * **QoreChain Native** — Cosmos SDKランタイム上のRustスマートコントラクト(CosmWasmランタイム)、ネイティブIBC対応
   * **SVM** — 並列実行・高スループットなアプリ向けのSolana Virtual Machine
4. **データ可用性(DA)レイヤーを選ぶ。** 誰でも状態を再構築できるよう、ロールアップがトランザクションデータを公開する先です:**QoreChain DA**、**Celestia**、**EigenDA**のいずれか。EigenDAはダッシュボードレベルのオプションであり、オンチェーンの `x/rdk` のDAバックエンドはネイティブ、Celestia、またはその両方である点に注意してください — 詳細は[データ可用性](/rollups/data-availability)を参照してください。
5. **ガストークンを設定する。** ロールアップ上での実行手数料の支払いに使うトークンです。デフォルトは**QOR**です。独自のネイティブトークンを使う場合はカスタムシンボルを入力してください。
6. **シーケンサーを選ぶ。** トランザクションを決済前にどう並べるかを決める主体です:**Shared sequencer**(QoreChainの共有セット)、**Dedicated (single)**(自前の単一シーケンサーを運用)、**Decentralized**(パーミッションレスなシーケンサーセット)のいずれかです。
7. **決済先を選ぶ。** ロールアップが状態ルートと妥当性証明をアンカーする先です:**QoreChainメインネット**または**Ethereum**。
8. **リクエストを送信する。** プロビジョニングは**The Qore Trust**によるレビューを経るため、送信直後のリクエストはレビュー完了までは**provisioning(準備中)**ステータスで表示されます。

送信したリクエストは**Your rollups**一覧に、VM、DAレイヤー、ガストークン、シーケンサー、決済先、現在のステータスとともに表示されます。

:::note
フォームのオプション(仮想マシン、データ可用性レイヤー、ガストークン、シーケンサー、決済先)は、あなたが依頼する内容を表すものであり、オンチェーンの `x/rdk` モジュールが現在サポートしている範囲よりも広くなっています。オンチェーンでは、データ可用性は `native` であり(Celestiaは有効ではありません)、シーケンシングはロールアップ作成者または設定済みのシーケンサーアドレスが行います。[データ可用性](/rollups/data-availability)を参照してください。
:::

---

## CLI経由でのデプロイ

CLIはロールアップをオンチェーン上に直接作成します。`create-rollup` は3つの位置引数 — ロールアップID、プロファイル、ステーク額(`uqor` 単位)— に加えて、任意の `--vm` フラグを取ります。

:::tip
チェーンバージョン **v3.1.74** 以降、`create-rollup` は**選択したプロファイルのプリセットを自動的に適用します** — 決済モード、シーケンサー、DA、ガスモデル、VMはすべてプリセットから取得されます。これらを手動で設定する必要はもうありません(以前はメッセージがソブリン構成をハードコードしていました)。`--vm` フラグは現在**デフォルトで空**になっており、明示的に上書きしない限りプロファイルのVMが適用されます。
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**例** — `defi` プリセットからロールアップを作成する(決済、シーケンサー、DA、VMはすべてプリセットから取得されます。`defi` はEVM上のzk決済に解決されます)。未署名のトランザクションを構築し、ポスト量子共同署名を付けてブロードキャストします。

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

`defi` のようなZKプロファイルは作成時に受け付けられますが、この方法で作成したロールアップには検証鍵(verifying key)が含まれないため、そのZKバッチはまだファイナライズできません([ZK / STARKと出金](/rollups/zk-stark-withdrawals)を参照)。

**フラグ:**

| フラグ | デフォルト | 説明 |
| ---- | ------- | ----------- |
| `--vm` | *(空 — プロファイルのVMを使用)* | ロールアップのVMタイプを上書きします:`evm`、`cosmwasm`、`svm`、または `custom`。プリセットのVMを適用するには未設定のままにします。(RDKクライアントでは、WasmランタイムはVMタイプ **`native`** — QoreChain Native — で、`cosmwasm` はレガシーエイリアスとして残されています。`cosmwasm` はワイヤー上の値であり、このチェーンレベルのフラグが受け付ける値です。) |

:::note VMラベルはメタデータです
`--vm` はロールアップがどのランタイムを使うかを記録します。ホストチェーンはロールアップを決済するだけで、そのコントラクトを実行することはありません。ホストチェーン自体のQoreChain Nativeアップロードは現在閉じられており、SVMトランザクションレーンはネットワーク全体で無効化されています。これはオフチェーンロールアップの決済には影響しませんが、ロールアップ用のコントラクトをそれらのホストチェーンレーンにデプロイすることはできない、という意味です。
:::

`[profile]` 引数は自動的に適用されるプリセット構成を選択します — **[プリセットプロファイル](/rollups/preset-profiles)** を参照してください。`[stake-amount]` は `uqor` 単位の保証金で、作成時バーンはその1 %です。

### デプロイ結果を確認する

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK(`@qorechain/rdk`)でのデプロイ {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kitは、CLIと同じオンチェーンの `x/rdk` モジュール向けに、2つの公開npmパッケージとして提供されています。どちらのネットワークにもまだロールアップは存在しないため、このキットのトランザクション経路はいずれも実際のロールアップでは試されていません。トランザクション送信にこれを頼る前に、[RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を確認してください。

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)**(`v0.6.1`)— TypeScript SDK:プリセットプロファイル付きのコンフィグビルダー、ロールアップおよび決済バッチのライフサイクル向けトランザクションヘルパー、ネイティブDA、型付き読み取りクライアント、量子安全な決済レシート、QCAI Rollup Copilot、クロスVMのcalldataヘルパー、ウォッチタワー。`@qorechain/sdk` `^0.9.0` と `@qorechain/evm` `^0.8.0` に依存します。
* **`create-qorechain-rollup`**(`v0.6.1`)— プロファイルごとに実行可能なスターターテンプレートを1つクローンするスキャフォルダー(`multivm-rollup` テンプレートを含む)。

これらはnpmで公開されています。リポジトリには公開済みのオペレーターCLI **`@qorechain/rdk-cli`**(`qorollup`、`v0.6.1`)も含まれており、`doctor`、`create`、`status`、`watch`、`params`、`suggest`、ライフサイクル(`pause`/`resume`/`stop`)、`keygen`、`manifest`、`withdraw`、`faucet` の各コマンドと、`receipt`、`advise`、`watchtower` コマンドが利用できます。そのトランザクションコマンドはクラシック署名のみで署名します(下記の制限事項を参照)。

リリースごとのハイライト:

* **v0.4.2 — ライブネットワークでそのまま動作。** `mainnet` と `testnet` のプリセットに公開 `qore.host` エンドポイント(RESTは `api.qore.host` / `api-testnet.qore.host`)が組み込まれたため、`createRdkClient({ network })` は手動で `endpoints` を設定しなくてもチェーンに到達できます — 自分のノードを対象にする場合のみ上書きしてください。同じリリースでWasmロールアップのVM識別子が **`native`**(QoreChain Native)に改名されました。`cosmwasm` は受け付けられるレガシーエイリアスとして残り、どちらもワイヤー上では `cosmwasm` にマッピングされます — チェーン、エクスプローラー、ダッシュボードは変わりません。
* **v0.4.3 — SDKのハイブリッド署名エンコーディング修正のための依存関係更新。** RDKのトランザクションクライアント自体は引き続きクラシック署名のみでした。
* **v0.4.4 — `@qorechain/sdk` `^0.7.0` に追従**。チェーン **v3.1.85** のオーセンティケーターレーン向けのSDKリリースです。RDKのAPI変更はありません。
* **v0.5.0(2026年10月18日)** — 決済レシートの検証はチェーンの状態に対して照合し、レシート自身のフィールドだけで有効と報告することはありません。TypeScriptのトランザクションクライアントは `pqcKeypair` を渡されるとハイブリッドで署名します。`@qorechain/sdk` `^0.8.0` に依存します。
* **v0.6.0(2026年10月20日のGitHubリリース)** — チェーン v3.2.2 から v3.2.4 向けの互換性リリースです。アンカー付きバッチ、検証可能な決済レシート、チェーンと同じ方法で計測されるチャレンジウィンドウ、チェーンのクロスVMレイアウトに一致するエンコーダー、ハイブリッドで署名するテンプレート、そして `@qorechain/sdk` `^0.9.0` です。詳細は以下のとおりです。
* **v0.6.1(2026年10月25日のGitHubリリース。現行)** — チェーン v3.2.3 以降向けのセキュリティおよびテンプレート修正リリースで、5言語すべてが対象です。決済レシートの検証はレシートが記載するすべてのフィールドをチェーンのアンカーと比較し、6つのスターターテンプレートはチェーンが拒否するバッチを送信しなくなり(`dataHash` を空のままにします)、オプティミスティックテンプレートはプレースホルダーの代わりにチェーンの正準ステートルートを公開します。`@qorechain/sdk` `^0.9.0` と `@qorechain/evm` `^0.8.0` の範囲は維持されます。詳細は以下のとおりです。

**公開バージョン(2026年10月27日にすべてのレジストリで確認)。** npm の `@qorechain/rdk`、`@qorechain/rdk-cli`、`create-qorechain-rollup`:**0.6.1**(`latest`)。PyPI `qorechain-rdk`:0.6.1。crates.io `qorechain-rdk`:0.6.1。Maven Central `io.github.qorechain:qorechain-rdk`:0.6.1(latest および release)。Goモジュール `github.com/qorechain/qorechain-rdk/packages/go`:`v0.6.1` はモジュールプロキシから提供されており、現在 `@latest` もこれに解決されます(プロキシの `@latest` は新しいタグに遅れることがあるため、`@v0.6.1` を明示的に指定するのが最も明確です)。GitHubリリースは [v0.6.1](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1) です。

#### RDK 0.6.1:変更点と制限事項 {#rdk-050-limits}

このセクションでは、公開されている0.6.1パッケージが何をするか(およびそれ以前に0.6.0が何を変えたか。パッケージの内容とGitHubのリリースノートで確認済み)と、まだできないことを説明します。これらの項目はいずれもチェーンの挙動ではありません。「ライブでは未検証」とある箇所は、どちらのネットワークにもロールアップが存在しないため、その経路はコードに対する確認とオフラインでの確認しか行われていないことを意味します。

**0.6.1での変更点**(行に別途記載がない限り5言語すべて。全リストは[リリースノート](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1)にあります):

* **レシート検証がすべてのフィールドを比較します。** `verifySettlementReceipt` は、レシートが記載するすべてのアンカーフィールドがチェーンのアンカーと等しいことを要求し(不一致の場合はそのフィールド名が示されます)、`batchStateRoot` がチェーンのバッチルートと等しいことを要求し、未知の `version` のレシートや `ML-DSA-87` 以外の `algorithm` のレシートは、チェーンから何かを読み取る前に拒否します。結果には、チェーンと一致した `anchor` が含まれ、有効な場合はチェーンの状態から再構築した `verifiedReceipt` が含まれます。`qorollup receipt verify --json` は、そのチェーンから読み取ったレシートを `receipt` として返します。[決済レシート](/rollups/settlement-receipts#what-060-verifies)を参照してください。
* **ネイティブデータ可用性:`dataHash` は空のままにします。** すべてのロールアッププロファイルは `native` データ可用性を使用しており、チェーンは一致するblobがオンチェーンに保存されている場合にのみ空でない `data_hash` を受け入れますが、blobを保存できるトランザクションはありません([データ可用性](/rollups/data-availability)を参照)。0.6.0以前では、6つのスターターテンプレートがバッチにデータハッシュを付けていたため、手数料が支払われた後にチェーンがテンプレートのすべてのバッチを拒否していました。現在は空のままにします。`SubmitBatchInput.dataHash` はTypeScriptでは任意です(省略は空を意味します)。`dataHashError`(`data_hash_error`、`DataHashError`、`Rules.dataHashError`)がそのルールを公開しており、`RdkTxClient.submitBatch` は、ロールアップを読み取れる場合(RESTエンドポイントを持つハイブリッドクライアント)、そのようなバッチをブロードキャストの前に拒否します。
* **オプティミスティックテンプレートは正準ステートルートを公開します。** チェーンはオプティミスティックバッチを、その正準遷移ルート(バッチの直前のステートルート、データハッシュ、トランザクション数のSHAKE-256コミットメント)で判定します(RDKでは `batchTransitionRoot`。接続先ネットワークが適用するバインディングは `transitionRootVersionFor` が選びます)。`custom`、`multivm`、`nft` テンプレートは以前、固定のプレースホルダールートを送信していました。これはチェーンが確認する正準ルートと一致しません。現在は正準ルートを公開し、プレースホルダーの証明は送信しません。`nft` テンプレートの `challenge.ts` はチェーンからバッチを読み取り、ルートが明らかに誤っているバッチにのみチャレンジします。式を自作しないでください。送信先のネットワークとバインディングが一致するよう `batchTransitionRoot` を使用してください。チェーン自身のチェックはどのクライアントでも同じであるため、ステートルートが正準ルートでないオプティミスティックバッチは、どのクライアントが送信したものでもチャレンジに成功する可能性があります。
* **新しいヘルパー。** `fraudProof`、`transitionRootVersionForBatch`、`SUPPORTED_RECEIPT_VERSIONS` を伴う `receiptSchemaError`、`RestClient.getProtocolFeatures` / `isProtocolFeatureEnabled`(ルートのないチェーンは「無効」と読み取られます)、`getAppliedPlanHeight`。`@qorechain/rdk` は `@noble/hashes` に直接依存するようになりました(遷移ルートのSHAKE-256用。すでに `@qorechain/sdk` 経由でインストールされていました)。テンプレートは `@qorechain/rdk` `^0.6.1` に固定されています。

**0.6.0での変更点**(行に別途記載がない限りTypeScript):

* **署名。** `RdkClient.connectTx(signer, { pqcKeypair, rest })` は、キーペアを渡すとハイブリッド(secp256k1 + ML-DSA-87)で署名します。渡さない場合はクラシック署名のみで署名し、ネットワークはそのトランザクションを拒否します。`signer` は `OfflineDirectSigner` である必要があり、手数料は明示的に指定する必要があります(`fee`、または接続時の `gasPrice`)。新しいヘルパー `resolvePqcKeypair` と `pqcKeypairFromEnv` は、ニーモニックから正規のML-DSA-87鍵とレガシーのML-DSA-87鍵の両方を導出し、アカウントがオンチェーンに登録しているほうを使用します。アカウントが別の鍵を保持している場合は、推測せずに拒否します。`QORE_PQC_SEED_HEX` は、生の秘密鍵で署名するオペレーターにシードを提供します。このキットは `@qorechain/sdk` `^0.9.0` に依存するようになったため、新規インストールではSDKのコピーが1つ(0.9.0)になります。0.5.0では、npmはキットの下にネストしてSDK 0.8.3をインストールしていました。
* **アンカー付きバッチ。** `MsgSubmitBatch` は `anchor_signature` と `validator_set_hash` を持ちます。`RdkTxClient.submitBatch` がアンカーに自分で署名するのは、クライアントがハイブリッドで署名し、RESTエンドポイントを持ち、かつ**ロールアップの作成者である**場合に限られます(チェーンはアンカーを作成者の登録済みの鍵に対して確認します)。それ以外の場合は、これまでどおりアンカーなしで送信します。アンカーなしでの送信を拒否させるには `anchor: "require"`、署名しないようにするには `anchor: "off"`、自分で取得した署名を送るには `anchorSignature` を渡します。`anchorSignBytesForBatch` は、帯域外で署名する作成者のためにv2のバイト列を構築します。これは、シーケンサーが別にあるロールアップで必要になります。ライブでは未検証です。
* **決済レシート。** PQCアカウントの照会は単数形のルート `/qorechain/pqc/v1/account/{address}` を使用します(0.5.0は、ネットワークが提供していない複数形のパスを使用していました)。検証は両方のアンカー署名バイト列の形式に対応し、両方を試すのではなく、アンカーの高さによって一方を選びます。v3.2.2の切り替え前はv1、それ以降はv2です。レシートスキーマv2は `chainId` を記録します。検証は、別のチェーンのノードに対して確認されたレシートを拒否し、`signBytesVersion` と `chainBinding` のチェックを報告します。バージョン1のレシートも引き続き検証できます。[決済レシート](/rollups/settlement-receipts)を参照してください。
* **読み取り。** `getLatestBatch` は `/qorechain/rdk/v1/latest_batch/{rollup_id}` を呼び出し(0.5.0は、チェーンが提供していない形式を呼び出していました)、`listBatches` はすべてのページをたどります(`listBatchesPage` は1ページを読み取ります)。`RollupView` は `escrowBalance` を持ち、ノードが報告する場合は `challengeWindowSec`、`challengeBond`、`proofSystem` も持ちます。`BatchView` は `submittedTime` を持ちます。
* **チャレンジウィンドウ。** `batchChallengeWindow` は、バッチのウィンドウをチェーンと同じ方法で計算し、ローカルの時計ではなくチェーンの先頭(`getChainTip`)に対して判定します。提出時刻が記録されているバッチではブロック時間の秒数(v3.2.4のルール:テストネットでは高さ8,337,253から、メインネットでは高さ3,742,566から)、それ以外では提出高から数えて `window / 6` ブロック(アップグレード高より前に提出されたバッチのルール)です。`qorollup status` の背後にあるヘルスチェックとウォッチタワーはこれを使用します([ウォッチタワー](/rollups/watchtower)を参照)。
* **クロスVM。** `encodeCrossVmCalldata` は、ノードがデコードするレイアウトである `executeCrossVMCall(uint8,string,bytes)` をエンコードするようになり、`targetVm` を受け取ります。`isCrossVmPrecompileActive` は、有効なプリコンパイルのライブな一覧を読み取ります([マルチVM](/rollups/multi-vm)を参照)。
* **手数料の支払い前に確認されるルール。** `rollupIdError` は、構成を検証するときと `createRollup` がブロードキャストする前に、IDの文法を確認します。`withdrawalErrors` は、`executeWithdrawal` がブロードキャストする前に出金を確認します。
* **テンプレート。** スキャフォールドされたテンプレートは `pqcKeypairFromEnv` を通じて接続するため、その `create` と `submit-batch` のスクリプトはハイブリッドで署名し、`@qorechain/rdk` `^0.6.0` に依存していました(0.6.1のスキャフォルダー以降は `^0.6.1`)。`multivm-rollup` テンプレートは、プリコンパイルが有効であることを確認し、ターゲットからの空でない応答を必須とします。
* **Python、Go、Rust、Java。** 上記の読み取り側の修正(単数形のPQCルート、`latest_batch`、アンカー署名バイト列v2、チャレンジウィンドウのルール、IDと出金のチェック)は、他の4言語の公開パッケージにも含まれています。
* **破壊的変更。** `encodeCrossVmCalldata` は `targetVm` を受け取り、`CROSS_VM_DEFAULT_SIGNATURE` が変更されました。`RollupHealth` と `BatchDeadline` は、従来の秒ベースの期限の代わりに `challengeWindow` を持ちます。

**0.6.1で残る制限事項:**

* **ハイブリッドで署名するのはTypeScriptクライアントだけです。** `qorollup` CLI(その `create`、`pause`、`resume`、`stop`、`withdraw` コマンドはポスト量子鍵なしで接続します)と **Python、Go、Rust、Java** のクライアントはクラシック署名のみで署名しますが、両ネットワークはネイティブレーンでこれを拒否します。それらのREADMEにもその旨が記載されています。それらのメッセージビルダーには `anchor_signature` や `validator_set_hash` のフィールドがありません。これらからトランザクションを送るには、チェーンのCLI(`--generate-only`、続いて `qorechaind tx pqc cosign`)で構築・署名するか、`pqcKeypair` 付きのTypeScriptクライアントを使用してください。
* **ハイブリッドでのロールアップ作成は、ライブでは試されていません。** どちらのネットワークにもロールアップが存在しないためです。アンカー付きバッチ、出金、レシートのフロー全体についても同様です。
* **アンカーには作成者が必要です。** バッチが同じトランザクション内でアンカーされるのは、作成者の署名がそこに含まれている場合に限られます。シーケンサーが別のアドレスである場合は、作成者がv2のバイト列を帯域外で署名し、シーケンサーがその結果を送信する必要があります。
* **`0x…0901` のクロスVMプリコンパイルにはコードがなく**、どちらのネットワークでも有効なプリコンパイルの一覧に含まれていないため、コントラクトからの呼び出しは依然として何も行いません([マルチVM](/rollups/multi-vm)を参照)。
* **チャレンジウィンドウの長さ。** このキットがロールアップ独自のウィンドウを読み取るのは、ノードがそれを報告する場合に限られます(パッケージはこれをv3.2.4以降としており、両ネットワークがそれを実行しています)。そうでない場合は、モジュールのデフォルトのウィンドウを使用します。独自のウィンドウを設定したロールアップには `challengeWindowSecs` を渡してください。古いヘルパー `challengeWindowDeadline` と `isChallengeWindowClosed` は引き続きエクスポートされており、引き続き秒を受け取るため、ブロック高を渡さないでください。
* **データ可用性。** `buildDaBlob` はSHA-256でハッシュ化しますが、チェーンのblobコミットメントはSHAKE-256であり、blobを投稿するトランザクションはないため、`native` または `both` のロールアップのバッチは `dataHash` を空のままにする必要があります([データ可用性](/rollups/data-availability)を参照)。

**0.6.1より前のバージョン。** 0.6.0はレシート検証で比較するフィールドが0.6.1より少なく、チェーンが拒否するバッチを送信するテンプレート(ネイティブDAのロールアップにデータハッシュ、オプティミスティックのものにプレースホルダーのステートルート)を同梱しています。0.6.1を使用してください。0.5.0以前は、決済レシート、ウォッチタワー、クロスVMのcalldataには使用しないでください。0.5.0は、ネットワークが提供していないルートで作成者の鍵を照会し(そのため、レシート検証は本物のレシートすべてでフェイルクローズしました)、v1のアンカーメッセージしか再構築せず、ブロック高をタイムスタンプとして読み取り(すべてのバッチの経過時間とチャレンジ期限が誤っており、ウォッチタワーはすべてのバッチについて期限アラートを即座に発しました)、チェーンが提供していないlatest-batchルートを呼び出し、最初の50件のバッチしか読み取らず、プリコンパイルがデコードしない関数をエンコードし、クラシック署名のみで署名するテンプレートを同梱していました。0.4.xのトランザクションクライアントにはハイブリッド署名がありませんでした。

#### Python、Go、Rust、Javaクライアント

TypeScriptパッケージに加えて、RDKはTypeScriptの機能面をそのまま反映した、**Python**、**Go**、**Rust**、**Java** の完全なクライアントを提供します:検証付きのコンフィグビルダー、5つのプリセットプロファイル、denom/economics/bech32ユーティリティ、バイナリMerkleと出金証明のヘルパー、ロールアップマニフェスト、RESTおよび `qor_` JSON-RPC読み取りクライアント、プリフライト/ヘルスチェック、アカウント(ニーモニック → `qor` アドレス)、そしてクラシックなトランザクション署名とブロードキャスト(`SIGN_MODE_DIRECT`。ハイブリッド署名のネットワークでは受け付けられません — [RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照)。すべて言語間で共有されるゴールデンベクターで検証されており、各レジストリで**公開**されています。

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version: the proxy's @latest still answered v0.5.0 when checked)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.1

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.6.1
```

```python
import qorrdk
```

現在公開されているバージョンはすべて **0.6.1** です(2026年10月27日確認):Python `qorechain-rdk`(PyPI、インポート名 `qorrdk`)、Goモジュール `github.com/qorechain/qorechain-rdk/packages/go`(`v0.6.1`)、Rust `qorechain-rdk`(crates.io)、Java `io.github.qorechain:qorechain-rdk`(Maven Central)。これらのクライアントはチェーンの状態を読み取りますが、ネットワークが要求するハイブリッド署名は引き続き生成せず、そのメッセージビルダーにはアンカーのフィールドもありません([RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照)。

:::note
TypeScript RDKとそのテンプレートはデフォルトで **`qorechain-diana`** テストネットを対象としており、プリセットは公開ライブエンドポイントにそのまま到達します。バージョンを固定し、メインネットの前にテストネットで検証してください。
:::

### `create-qorechain-rollup` でプロジェクトをスキャフォールドする {#scaffold-a-project-with-create-qorechain-rollup}

各プロファイルには対応するスターターテンプレート(`defi-rollup`、`gaming-rollup`、`nft-rollup`、`enterprise-rollup`、`custom-rollup`)があります。どちらかの形式でスキャフォールドしてください。

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

非対話式 / CIで使う場合は、テンプレートとネットワークを明示的に渡します。

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

スキャフォルダーは、ドキュメント化されたステーク額と作成時バーンのコスト、およびロールアップを作成してそのステータスを読み取るための次のステップを表示します。

:::caution スキャフォールドされたスクリプトにできること
`create-qorechain-rollup` 0.6.1 のテンプレートは `@qorechain/rdk` `^0.6.1` に依存しています。その `create` と `submit-batch` のスクリプトは `src/signer.ts` の `connectOperator()` を通じて接続します。これは `QORE_MNEMONIC`(または `QORE_OPERATOR_PRIVATE_KEY_HEX` で署名する場合は `QORE_PQC_SEED_HEX`)からポスト量子鍵を解決し、チェーンに対して確認して、ハイブリッドで署名します。どちらも設定されていない場合、スクリプトは警告を出してクラシック署名のみで署名しますが、両ネットワークはこれを拒否します。テンプレートを通じてライブネットワーク上でロールアップが作成されたことはないため、この経路はライブでは未検証です。スターターの `submit-batch` スクリプトは参照用のフローにすぎません。0.6.1以降は `dataHash` を空のままにし(チェーンはネイティブDAのロールアップのデータハッシュを拒否します)、オプティミスティックテンプレートはプレースホルダーの代わりに正準ステートルートを公開します。それ以外には引き続き例示的な値(ZKプロファイルではサンプル証明も)を使用しており、ライブネットワーク上でバッチをファイナライズすることは想定されていません。
:::

### コードからロールアップ構成を構築する

プリセットから構成を構築し、チェーンからライブのステーク額とバーン率を読み取って、作成メッセージを生成します。コンフィグビルダーは `validate()` / `build()` で決済 → 証明の互換性マトリクスを強制します。得られた値は、上記のCLI、または `pqcKeypair` を渡したTypeScriptクライアントで送信してください — [RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照してください。

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

どのプロファイルが合うかわからない場合は?`rdk.suggestProfile(...)` はQCAI支援の推奨を返すことを意図したものですが、現在の公開エンドポイントでは常に `defi` のフォールバック(`source: "fallback"`)を返します。そのため、[プロファイル表](/rollups/preset-profiles)から選んでください。

### コードから状態を読み取る

型付きRESTクライアントは署名者を必要とせず、両方のネットワークを読み取れます。

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

バッチについては、`rdk.rest.getBatch(rollupId, index)` または `qorechaind query rdk batch [rollup-id]`(後述)を使用してください。`getLatestBatch` と `listBatches` は、0.6.0以降、チェーンの `latest_batch` ルートとバッチ一覧のすべてのページを読み取ります([RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照)。

---

## ライフサイクル管理

ロールアップは `pending`、`active`、`paused`、`stopped` の各状態を遷移します。新しいロールアップはすぐに `active` で開始されます。一時停止、再開、停止ができるのは作成者のみです(チェーンバージョン v3.2.0 以降で強制)。以下の各コマンドは、作成時と同じ2ステップのパターンに従います。未署名のトランザクションを生成し、続いて共同署名します。

### 一時停止(Pause)

ロールアップを一時的に停止します。状態は保持され、ロールアップは再開できます。理由の文字列が必須です。

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### 再開(Resume)

以前に一時停止したロールアップを再開します。

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### 停止(Stop)

ロールアップを永久に廃止し、そのステークを解放します。ステークされたQOR — 1回限りの作成時バーン、および出金や不正証明の報酬としてすでにロールアップのエスクローから支払われた分を差し引いた額 — が作成者に返還されます。v3.2.3以降、ロールアップごとのエスクロー台帳が各ロールアップの保有残高を記録しており、`stop-rollup` はまさにその残高を返還します。停止したロールアップは、以降の出金を支払いません。1,000 QORのレイヤー登録ステークは、ロールアップのレイヤーが廃止される際に別途返還されます。

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
ロールアップの停止は永久的です。停止したロールアップを再起動することはできません。
:::

---

## オペレーターコマンド:バッチとチャレンジ

ロールアップのオペレーターは決済バッチを提出し、チャレンジャーはオプティミスティックなバッチに異議を申し立てることができます。これらのコマンドは、**[ロールアップ概要](/rollups/overview)** と **[ZK / STARKと出金](/rollups/zk-stark-withdrawals)** で説明されている決済レイヤーの基盤となるものです。

### 誰がどの順序で提出できるか

* **バッチを提出できるのは、ロールアップに設定されたシーケンサーアドレスのみです。設定されていない場合(すべてのプリセットが該当)は、その作成者が提出します。** ベースドおよびシェアードのシーケンシングは、まだプロポーザーセットやロスターを受け付けません。現時点ではラベルにすぎず、提出するのは作成者です。
* バッチはチェーンを形成します。最初のバッチのインデックスは `0` で、以降の各バッチは次のインデックスを使用し、直前のバッチの状態ルートを `prev_state_root` として持つ必要があります。
* `native` または `both` のロールアップで、データハッシュを持つバッチは、一致するブロブがすでに保存されていない限り拒否されます([データ可用性](/rollups/data-availability)を参照)。データハッシュのないバッチはチェックされません。
* `zk` ロールアップは証明を添付する必要があり、その証明は検証を通過しなければなりません([ZK / STARKと出金](/rollups/zk-stark-withdrawals)を参照)。

### バッチを提出する {#submit-a-batch}

ロールアップの決済バッチを提出します。ロールアップID、バッチインデックス、16進エンコードされた状態ルートを取ります。最初のバッチ以降のすべてのバッチでは、直前のバッチの状態ルートを `--prev-state-root` として渡してください。

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| フラグ | 説明 |
| ---- | ----------- |
| `--prev-state-root` | バッチの開始点となる16進の状態ルート(インデックス `0` より後のすべてのバッチで必須) |
| `--tx-count` | バッチに含まれるロールアップのトランザクション数 |
| `--data-hash` | DA blobとして投稿されたバッチデータの16進ハッシュ(現時点では空のままにしてください。blobを投稿する手段がありません。[データ可用性](/rollups/data-availability)を参照) |
| `--withdrawals-root` | バッチのL2 → L1出金の16進Merkleルート([ZK / STARKと出金](/rollups/zk-stark-withdrawals)を参照) |
| `--anchor-signature` | v2アンカー署名バイト列に対する、ロールアップ**作成者**によるML-DSA-87の16進署名(v3.2.2以降)。バッチはその後、同じトランザクション内で `x/multilayer` にアンカーされ、アンカーが拒否されるとバッチも拒否されます |
| `--validator-set-hash` | アンカーに含まれ、署名の対象となる16進のバリデーターセットのコミットメント |

`--anchor-signature` がない場合、バッチは**アンカーされずに**決済されます。バッチをアンカーするには、署名対象のバイト列を出力し、作成者の登録済みポスト量子鍵で署名して、その署名を渡してください(`--tx-count` と `--validator-set-hash` の値は、提出するものと一致している必要があります)。

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` はロールアップのレイヤーIDです(RDKで作成されたロールアップでは、ロールアップIDと同じです)。TypeScriptからは、`@qorechain/rdk` 0.6.0 以降の `RdkTxClient.submitBatch` が、クライアントがハイブリッドで署名し、かつロールアップの作成者である場合にアンカーへ自動的に署名し、`anchorSignBytesForBatch` は作成者に帯域外で署名するためのバイト列を提供します([RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照)。`zk` ロールアップ用のZK `--proof` には現在CLIフラグがなく、resolve-challengeメッセージもCLIコマンドではありません。クライアントを使用してください。アンカーが何を証明し、何を証明しないかについては、[決済レシート](/rollups/settlement-receipts)を参照してください。どちらのネットワークにも、ロールアップ、レイヤー、アンカーはまだ存在しません。

### バッチにチャレンジする(オプティミスティックロールアップ) {#challenge-a-batch-optimistic-rollups}

どのアカウントでも、チャレンジ期間内(メインネットで高さ3,742,566より前に提出されたバッチではデフォルトで100,800ブロック。v3.2.4以降の新しいバッチでは、ブロック時間の秒数で表されるウィンドウで、テストネットでは高さ8,337,253から、メインネットでは高さ3,742,566から)であれば、保証金(ロールアップの `challenge_bond`。`nft` と `custom` プリセットでは1,000 QOR)と不正証明を提出することで、`submitted` 状態のバッチにチャレンジできます。オプティミスティックバッチは、そのステートルートが正準遷移ルートであるかどうかで判定されるため、提出者はまさにそのルートを公開する必要があります(RDK 0.6.1のテンプレートはそうします。[RDK 0.6.1:変更点と制限事項](#rdk-050-limits)を参照)。ロールアップIDとバッチインデックスを取り、不正証明は `--proof` で渡します。

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| フラグ | 説明 |
| ---- | ----------- |
| `--proof` | 16進エンコードされた不正証明 |

チャレンジはバッチを**凍結**(`challenged`)し、ファイナライズできなくなります。その後、ロールアップの**作成者**がresolve-challengeメッセージでこれを解決します(CLIコマンドとしては公開されていません。クライアントを使用してください)。結果はチェーン自身が、保存された証明を検証して決定します。不正が認められた場合、バッチは `rejected` となり、保証金は返還され、チャレンジャーにはロールアップのステークから保証金と同額が追加で支払われます。却下された場合は、保証金は作成者に渡り、バッチは `submitted` に戻ります。

### バッチを確認する

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## 照会

| コマンド | 目的 |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | 特定のロールアップの詳細 |
| `qorechaind query rdk list-rollups` | 登録済みのすべてのロールアップ |
| `qorechaind query rdk batch [rollup-id]` | 最新の決済バッチ(または `--index`) |
| `qorechaind query rdk batches [rollup-id]` | インデックス順のバッチのページ(`--start`、`--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | バッチのv2アンカー署名バイト列(オフライン) |
| `qorechaind query rdk config` | RDKモジュールのパラメータ |
| `qorechaind query rdk suggest-profile [use-case]` | `qor_suggestRollupProfile` RPCへの案内を表示します。公開エンドポイントはこれを提供していないため、[プリセットプロファイル](/rollups/preset-profiles)の表からプロファイルを選んでください |

---

## 次のステップ

* **[データ可用性](/rollups/data-availability)** — ネイティブ、Celestia、冗長DAバックエンド。
* **[ZK / STARKと出金](/rollups/zk-stark-withdrawals)** — 証明検証と、`execute-withdrawal` によるL2 → L1の出金フロー。
